const puppeteer = require("puppeteer");
const fs = require("fs");
const groceriesFile = process.argv[2];
const cFile=process.argv[3];
//note 
// Please fill your number and pass in the credential.json before starting the server.
// Sign up on Kirana.com and then do the stuff.
// to add more groceries go to groceries.json and add the name and the quantity that you need.

(async function () {
  try {
    const browser = await puppeteer.launch({
      slowMo: 20,
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized", "disable-notifications"],
    });
    const credential=await fs.promises.readFile(cFile);
    const {pincode,area,mobileNo,pass}=await JSON.parse(credential);
    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://www.mykirana.com", {
      waitUntil: "networkidle0",
    });
    await tab.type("#userlocationpostcode",pincode);
    await tab.waitFor(5000);
    await tab.select("#area",area);
    await tab.click("#store_submit");
    await tab.waitForNavigation({ waitUntil: "networkidle2" });
    await tab.click("#btn-login");
    await tab.waitFor(2000);
    await tab.type("input[name=login_mobile]",mobileNo);
    await tab.type("input[name=login_password]", pass);
    let allP = await tab.$$("#login_form p");
    await allP[allP.length - 1].click();
    await tab.waitForNavigation({ waitUntil: "networkidle2" });
    let allShops = await tab.$$(".seller_list_box");
    await allShops[0].click();
    await tab.waitForNavigation({ waitUntil: "networkidle2" });
    let data = await fs.promises.readFile(groceriesFile);
    let allGrocery = await JSON.parse(data);
    for (let i = 0; i < allGrocery.length; i++) {
      let firstItem = allGrocery[i];
      await addToCart(firstItem.name, firstItem.quantity, tab);
      await tab.goto("https://www.mykirana.com", {
        waitUntil: "networkidle0",
      });
    }
    await tab.goto("https://www.mykirana.com/index.php?route=checkout/cart", {
      waitUntil: "networkidle2",
    });
    await tab.goto(
      "https://www.mykirana.com/index.php?route=checkout/checkout&cart=Y",
      { waitUntil: "networkidle2" }
    );
    await tab.click("#deliver-shipping-address-0");
    await tab.waitFor(8000);
    // await tab.waitForNavigation({ waitUntil: "networkidle0" });
    await tab.screenshot({ path: "./image.png", fullPage: true });
    await browser.close();
  } catch (err) {
    console.log(err.message);
  }
})();
async function addToCart(name, quantity, tab) {
  await tab.waitForSelector("#search input", { visible: true });
  await tab.type("#search input", name);
  await tab.keyboard.press("Enter");
  await tab.waitForNavigation({ waitUntil: "networkidle2" });
  let firstDiv = await tab.$(".cart .up.addaction");
  let intQuantity = parseInt(quantity);
  for (let i = 0; i < intQuantity; i++) {
    await firstDiv.click();
  }
  let addToBag = await tab.$(".product-block .product-action .cart .button");
  await addToBag.click();
}
