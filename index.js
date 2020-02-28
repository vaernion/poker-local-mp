"use strict";

const gameStateDisplay = document.getElementById("gameStateDisplay");
const activePlayerDisplay = document.getElementById("activePlayerDisplay");
const potDisplay = document.getElementById("potDisplay");
const winnerDisplay = document.getElementById("winnerDisplay");
const playArea = document.getElementById("playArea");
const playersControlArea = document.getElementById("playersControlArea");
const log = document.getElementById("log");

let refreshDelay = 1000;
let refreshOn = true;

let gameState = 0;
let activePlayer = 1;
// let takingBets = false;
let takingBets = true;
let pot = 0;
let deck = [];
let pile = [];
let shared = [];
let players = [];
let playersHands = [];
let winnerPlayer = {};
// let playersAlive = [];
let playerInput = [
  { name: "Achamian", balance: 5000 },
  { name: "Kellhus", balance: 10000 },
  { name: "Cnaiür", balance: 2000 },
  { name: "Esmenet", balance: 3500 }
];

class Player {
  constructor(name, balance) {
    this.id = Player.id();
    this.name = name;
    this.balance = balance;
    this.currentBet = 0;
    this.hasBetted = false;
    this.hasFolded = false;
    this.hand = [];
    this.handValue = 0;
    this.createGUI();
  }
  bet(sum) {
    if (!Player.areBetsActive()) {
      return;
    }
    if (this.id !== activePlayer) {
      output(`it's not ${this.name}'s turn to bet `, "error");
      return;
    }
    if (sum === "" || !sum || sum < 0) {
      output(`bet must be a valid number over 0`);
      console.log("sum", sum);
      return;
    }
    if (this.balance < sum) {
      this.currentBet = 0;
      output(
        `${this.name} not enough balance: ${this.balance} to bet ${sum}`,
        "error"
      );
      return;
    }
    this.currentBet = sum;
    this.hasBetted = true;
    console.log(this.currentBet);
    document.getElementById(`betSubmitButton${this.id}`).style.display = "none";
    document.getElementById(`foldButton${this.id}`).style.display = "none";
    activePlayer++;
    console.log(activePlayer);
  }
  // betSubmit() {
  //   if (!Player.areBetsActive()) {
  //     return;
  //   }
  //   if (this.currentBet > 0) {
  //     output(`${this.name} betted ${this.currentBet}`);
  //   }
  // }
  fold() {
    if (!Player.areBetsActive()) {
      return;
    }
    this.hasFolded = true;
    document.getElementById(`betSubmitButton${this.id}`).style.display = "none";
    // document.getElementById(`betConfirmButton${this.id}`).style.display =
    //   "none";
    document.getElementById(`foldButton${this.id}`).style.display = "none";
  }
  createGUI() {
    let playerGUI = document.createElement("span");
    playerGUI.className = "playerGUI";
    playerGUI.id = `playerGUI${this.id}`;
    playerGUI.innerText = `#${this.id} ${this.name}`;
    let balanceDisplay = document.createElement("span");
    balanceDisplay.className = "balanceDisplay";
    balanceDisplay.id = `balanceDisplay${this.id}`;
    balanceDisplay.innerText = `${this.balance}`;
    playerGUI.appendChild(balanceDisplay);
    playerGUI.appendChild(document.createElement("br"));
    let betInput = document.createElement("input");
    betInput.id = `betInput${this.id}`;
    betInput.className = "numInput";
    betInput.placeholder = 0;
    playerGUI.appendChild(betInput);
    playerGUI.appendChild(document.createElement("br"));
    let betSubmitButton = document.createElement("button");
    betSubmitButton.id = `betSubmitButton${this.id}`;
    betSubmitButton.innerText = "bet";
    betSubmitButton.onclick = () => {
      let betTemp = document.getElementById(`betInput${this.id}`);
      console.log(betTemp);
      this.bet(betTemp.value);
    };
    playerGUI.appendChild(betSubmitButton);
    // let betConfirmButton = document.createElement("button");
    // betConfirmButton.id = `betConfirmButton${this.id}`;
    // betConfirmButton.innerText = "confirm";
    // betConfirmButton.onclick = () => {
    //   this.betSubmit();
    // };
    // playerGUI.appendChild(betConfirmButton);
    let foldButton = document.createElement("button");
    foldButton.id = `foldButton${this.id}`;
    foldButton.innerText = "fold";
    foldButton.onclick = () => {
      this.fold();
    };
    playerGUI.appendChild(foldButton);
    playersControlArea.appendChild(playerGUI);
  }
  static areBetsActive() {
    if (!takingBets) {
      output(`bets not active`, "error");
      return false;
    } else {
      return true;
    }
  }
  static hideInactivePlayerControls() {
    for (let player of players) {
      if (activePlayer != player.id)
        document.getElementById(`betSubmitButton${player.id}`).style.display =
          "none";
      document.getElementById(`foldButton${player.id}`).style.display = "none";
    }
  }
  static id() {
    return (this.ids = !this.ids ? 1 : ++this.ids);
  }
}
class Card {
  constructor(rank, suit) {
    this.id = Card.id();
    this.rank = rank;
    this.suit = suit;
    this.value = rank;
  }
  get rank() {
    return this._rank;
  }
  set rank(rank) {
    switch (rank) {
      case 1:
        this._rank = "Ace";
        break;
      case 2:
        this._rank = "2";
        break;
      case 3:
        this._rank = "3";
        break;
      case 4:
        this._rank = "4";
        break;
      case 5:
        this._rank = "5";
        break;
      case 6:
        this._rank = "6";
        break;
      case 7:
        this._rank = "7";
        break;
      case 8:
        this._rank = "8";
        break;
      case 9:
        this._rank = "9";
        break;
      case 10:
        this._rank = "10";
        break;
      case 11:
        this._rank = "Jack";
        break;
      case 12:
        this._rank = "Queen";
        break;
      case 13:
        this._rank = "King";
        break;
      default:
    }
  }
  get suit() {
    return this._suit;
  }
  set suit(suit) {
    switch (suit) {
      case 1:
        this._suit = "Clubs";
        break;
      case 2:
        this._suit = "Diamonds";
        break;
      case 3:
        this._suit = "Hearts";
        break;
      case 4:
        this._suit = "Spades";
        break;
      default:
    }
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (value === 1) {
      this._value = 14;
    } else {
      this._value = value;
    }
  }
  static id() {
    return (this.ids = !this.ids ? 1 : ++this.ids);
  }

  static createDeck(array) {
    for (let j = 1; j <= 4; j++) {
      for (let i = 1; i <= 13; i++) {
        array.push(new Card(i, j));
      }
    }
    this.shuffle(array);
  }
  static draw(player) {
    player.push(deck[0]);
    deck.splice(0, 1);
  }
  static drawHand(num, ...args) {
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < args.length; j++) {
        this.draw(args[j]);
      }
    }
  }
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  static pileIntoDeck(...args) {
    for (let arg of args) {
      while (arg.length > 0) {
        deck.push(arg[0]);
        arg.splice(0, 1);
      }
    }
  }
}

function output(string, type) {
  let text = document.createElement("span");
  text.className = type === "error" ? "logError" : "logNormal";
  text.innerText = formatDate(new Date()) + string;
  log.appendChild(text);
  // log.appendChild(document.createElement("br"));
}
function formatDate(date) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    " "
  );
}

function createCardsAndPlayers() {
  // create deck, 13 ranks of each of 4 suits
  Card.createDeck(deck);
  console.log(deck);

  // create players
  for (let player of playerInput) {
    players.push(new Player(player.name, player.balance));
  }
  // easy reference to all player hands
  for (let player of players) {
    playersHands.push(player.hand);
  }
  console.log(players);
}

function texasHoldEm() {
  // texas hold 'em
  // state 1: deal hands
  if (gameState === 0) {
    createCardsAndPlayers();
    gameStateChange();
    Card.drawHand(2, ...playersHands);
    console.log(playersHands);
    output(`cards dealt`);
  }
  // state 2: pre-flop 1st bets
  else if (gameState === 1) {
    gameStateChange();
    output(`pre-flop - 1st betting started`);
    // add bets
    getBets();
    pot += 6666;
    output(`1st betting done`);
    // check if round over
  }
  // state 3: flop and 2nd bets
  else if (gameState === 2) {
    gameStateChange();
    // 3 community cards
    Card.drawHand(3, shared);
    output(`flop - 2nd betting started`);
    // add bets
    output(`2nd betting done`);
    // findWinner();
  }
  // state 4: turn and 3rd bets (double stakes)
  else if (gameState === 3) {
    gameStateChange();
    // turn
    Card.draw(shared);
    output(`turn - 3rd betting started`);
    // add bets
    output(`3rd betting done`);
  }
  // state 5: river and 4th bets (double stakes)
  else if (gameState === 4) {
    gameStateChange();
    // river
    Card.draw(shared);
    output(`river - 4th betting started`);
    // add bets
    output(`4th betting done`);
  }
  // state 6: showdown
  else if (gameState === 5) {
    gameStateChange();
    // showdown
    output(`showdown`);
  }
  // state 7: winner
  else if (gameState === 6) {
    gameStateChange();
    // winner
    findWinner();
    output(`winner! ${winnerPlayer.name}`);
  } else {
    output(`can't progress, gamestate is ${gameState}`, "error");
    return;
  }
  refresh();
}

function gameStateChange() {
  gameState++;
  // output(`gamestate is ${gameState}`);
}
async function getBets() {
  let takingBets = true;
  let whoBetted = [];
  for (let player of players) {
    let better = await getBettingPlayer(player);
    if (!!better) {
      whoBetted.push(better);
    }
    player.currentBet = 0;
    nextPlayer();
  }
  takingBets = false;
  for (let player of players) {
    document.getElementById(`betSubmitButton${player.id}`).style.display =
      "inline";
    document.getElementById(`betConfirmButton${player.id}`).style.display =
      "inline";
  }
  return whoBetted;
}
async function getBettingPlayer(player) {
  setInterval(() => {
    if (player.hasBetted !== false) {
      return player;
    }
  }, 1000);
}
function nextPlayer() {
  if (activePlayer % players.length === 0) {
    activePlayer = 1;
  } else {
    activePlayer++;
  }
}
function findWinner() {
  for (let player of players) {
    player.handValue = calculateHandValue(player);
  }
  let winnerId = players.reduce((x, y) => {
    return x.handValue > y.handValue ? x : y;
  }).id;
  let winner = players.find(x => x.id === winnerId);
  gameState = 7;
  winner.balance += pot;
  winnerPlayer = winner;
  console.log("winner", winner);
}
function calculateHandValue(player) {
  let sum = 0;
  sum = player.id === 2 ? 10 : 5;
  return sum;
  // how to calculate high card
  // highest value card + 2nd highest * 0.1 + 3rd highest * 0.01
  // + 4th highest * 0.001 + 5th highest * 0.0001
}

document.body.onload = () => {
  document.getElementById("progressButton").click();
};
document.getElementById("progressButton").onclick = () => {
  texasHoldEm();
};

document.getElementById("resetButton").onclick = () => {
  Player.ids = 0;
  gameState = 0;
  activePlayer = 1;
  takingBets = false;
  pot = 0;
  // deck = [];
  // pile = [];
  // shared = [];
  players = [];
  // playersHands = [];
  winnerPlayer = {};
  Card.pileIntoDeck(pile, shared, ...playersHands);
  Card.shuffle(deck);
  while (playersControlArea.firstChild) {
    playersControlArea.firstChild.remove();
  }
  refresh();
  output(`game reset`);
  // future continue-with-same-players function needs this
  // for (let player of players) {player.hasFolded = false;
  // player.handValue = 0}
};

setInterval(() => {
  Player.hideInactivePlayerControls();
}, 100);

document.getElementById("refreshButton").onclick = () => {
  console.log("refresh clicked");
  refresh();
};
if (refreshOn) {
  setInterval(() => {
    refresh();
  }, refreshDelay);
}
function refresh() {
  clear();
  draw();
}
function clear() {
  while (playArea.firstChild) {
    playArea.firstChild.remove();
  }
}
function draw() {
  outputCards();
  updateDisplays();
}
function isGameRunning() {
  return gameState > 0 && gameState <= 7;
}
function updateDisplays() {
  if (!isGameRunning()) {
    gameStateDisplay.innerText = "no game running";
    activePlayerDisplay.innerText = "";
    potDisplay.innerText = "";
    return;
  }
  gameStateDisplay.innerText = outputGameStateInfo();
  let playerText = (() => {
    let player = players[activePlayer - 1];
    if (gameState === 7) {
      return "";
    } else if (player.hasFolded) {
      return `current player: #${player.id} ${player.name} (FOLDED)`;
    } else {
      return `current player: #${player.id} ${player.name}`;
    }
  })();
  activePlayerDisplay.innerText = playerText;
  potDisplay.innerText = `pot: €${pot}`;
  if (gameState === 7) {
    winnerDisplay.innerText = `winner: ${winnerPlayer.name}`;
  } else {
    winnerDisplay.innerText = "";
  }
  for (let player of players) {
    let balanceDisplay = document.getElementById(`balanceDisplay${player.id}`);
    balanceDisplay.innerText = `€${player.balance}`;
  }
}
function outputGameStateInfo() {
  // state 1: deal hands
  // state 2: pre-flop 1st bets
  // state 3: flop and 2nd bets
  // state 4: turn and 3rd bets (double stakes)
  // state 5: river and 4th bets (double stakes)
  // state 6: showdown
  // state 7: winner
  let text = "";
  switch (gameState) {
    case 1:
      text = "stage 1: cards dealt";
      break;
    case 2:
      text = "stage 2: pre-flop - 1st bets";
      break;
    case 3:
      text = "stage 3: flop - 2nd bets";
      break;
    case 4:
      text = "stage 4: turn - 3rd bets (double stakes)";
      break;
    case 5:
      text = "stage 5: river - 4th bets (double stakes)";
      break;
    case 6:
      text = "stage 6: showdown";
      break;
    case 7:
      text = "stage 7: winner";
      break;
    default:
      text = "no game running";
  }
  return text;
}
function createCardElement(card) {
  let imgWidth = 691 * 0.1;
  let imgHeight = 1056 * 0.1;
  let img = document.createElement("img");
  img.src = `img/${card.rank}-${card.suit}.png`;
  img.width = imgWidth;
  img.height = imgHeight;
  return img;
}
function outputCards() {
  let playAreaCommunity = document.createElement("span");
  playAreaCommunity.className = "playAreaCommunity";
  let communityContainer = document.createElement("span");
  communityContainer.id = "communityContainer";
  let communityHeader = document.createElement("span");
  communityHeader.className = "handHeader";
  communityHeader.innerText = "Shared cards";
  communityContainer.appendChild(communityHeader);
  let communityBody = document.createElement("span");
  communityBody.className = "handBody";
  for (let card of shared) {
    let cardElement = createCardElement(card);
    communityBody.appendChild(cardElement);
  }
  communityContainer.appendChild(communityBody);
  playAreaCommunity.appendChild(communityContainer);
  playArea.appendChild(playAreaCommunity);

  let playAreaPlayers = document.createElement("span");
  playAreaPlayers.className = "playAreaPlayers";
  for (let player of players) {
    let playerContainer = document.createElement("span");
    playerContainer.className = "playerContainer";
    let playerHeader = document.createElement("span");
    playerHeader.className = "handHeader";
    let playerHeaderText = player.hasFolded
      ? `#${player.id} ${player.name} (FOLDED)`
      : `#${player.id} ${player.name}`;
    playerHeader.innerText = playerHeaderText;
    playerContainer.appendChild(playerHeader);
    let playerBody = document.createElement("span");
    playerBody.className = "handBody";
    for (let card of player.hand) {
      let cardElement = createCardElement(card);
      playerBody.appendChild(cardElement);
    }
    playerContainer.appendChild(playerBody);
    playAreaPlayers.appendChild(playerContainer);
  }
  playArea.appendChild(playAreaPlayers);
}
