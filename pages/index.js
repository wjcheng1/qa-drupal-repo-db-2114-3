import Image from "next/image";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { DrupalState } from "@pantheon-systems/drupal-kit";
import { isMultiLanguage } from "../lib/isMultiLanguage";
import Layout from "../components/layout";
import { DRUPAL_URL, IMAGE_URL } from "../lib/constants.js";

export default function Home({ articles, hrefLang, multiLanguage }) {
  return (
    <Layout>
      <NextSeo
        title="Decoupled Next Drupal Demo"
        description="Generated by create next app."
        languageAlternates={hrefLang || false}
      />
      <>
        <div className="prose sm:prose-xl mt-20 flex flex-col mx-auto max-w-fit">
          <h1 className="prose text-4xl text-center h-full">
            Welcome to{" "}
            <a
              className="text-blue-600 no-underline hover:underline"
              href="https://nextjs.org"
            >
              Next.js!
            </a>
          </h1>

          <div className="text-2xl">
            <div className="bg-black text-white rounded flex items-center justify-center p-4">
              Decoupled hosting by{" "}
              <Image
                src="/pantheon.svg"
                alt="Pantheon Logo"
                width={191}
                height={60}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-screen-lg">
          {/* Check to see if this is an object before mapping */}
          {articles?.map((article) => {
            const imgSrc =
              article.field_media_image?.field_media_image?.uri?.url || "";
            return (
              <Link
                passHref
                href={`/${multiLanguage ? article.path.langcode : ""}${
                  article.path.alias
                }`}
                key={article.id}
              >
                <a>
                  <div className="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer border-2 hover:border-indigo-500">
                    <div className="flex-shrink-0 relative h-40">
                      {/* if thre's no imgSrc, default to Pantheon logo */}
                      {imgSrc !== "" ? (
                        <Image
                          src={IMAGE_URL + imgSrc}
                          layout="fill"
                          objectFit="cover"
                          alt={
                            article.field_media_image?.field_media_image
                              ?.resourceIdObjMeta.alt
                          }
                        />
                      ) : (
                        <div className="bg-black">
                          <Image
                            src="/pantheon.svg"
                            alt="Pantheon Logo"
                            width={324}
                            height={160}
                          />
                        </div>
                      )}
                    </div>
                    <h2 className="my-4 mx-6 text-xl leading-7 font-semibold text-gray-900">
                      {article.title} &rarr;
                    </h2>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </>
    </Layout>
  );
}

export async function getStaticProps(context) {
  const origin = process.env.FRONTEND_URL;
  const { locales } = context;
  // if there is more than one language in context.locales,
  // assume multilanguage is enabled.
  const multiLanguage = isMultiLanguage(locales);
  const hrefLang = locales.map((locale) => {
    return {
      hrefLang: locale,
      href: origin + "/" + locale,
    };
  });

  try {
    // TODO - determine apiRoot from environment variables
    const store = new DrupalState({
      apiBase: DRUPAL_URL,
      // if multilanguage NOT enabled, passing in a locale here will
      // break calls to Drupal, so pass an empty string.
      defaultLocale: multiLanguage ? context.locale : "",
    });

    store.params.addInclude(["field_media_image.field_media_image"]);
    const articles = await store.getObject({
      objectName: "node--article",
    });

    if (!articles) {
      throw new Error(
        "No articles returned. Make sure the objectName and store.params are valid!"
      );
    }

    return {
      props: { articles, hrefLang, multiLanguage },
    };
  } catch (error) {
    console.error("Unable to fetch articles: ", error);
    return {
      props: {},
    };
  }
}
