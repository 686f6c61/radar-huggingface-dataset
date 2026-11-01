# Eotsevych/revfly-translation-models

## Resumen

RevFly translation models es un repositorio espejo (mirror) de los modelos de traducción automática de Firefox Translations, el proyecto de traducción local de Mozilla. El usuario Eotsevych lo publica en Hugging Face para servir de origen de descarga a RevFly, una herramienta de traducción sin conexión para Windows y Linux. El repositorio no contiene modelos nuevos ni modificados: reproduce, sin cambios, los ficheros que Mozilla distribuye bajo el identificador `translations-models-v2`.

Cada modelo del repositorio traduce hacia o desde el inglés y está basado en la arquitectura Marian, la misma que emplea el navegador Firefox para ofrecer traducción de páginas web de forma local, sin enviar datos a servidores externos. Los ficheros se distribuyen comprimidos con zstd e incluyen el modelo, el vocabulario y la lista corta léxica (lexical shortlist) necesarios para la inferencia.

Su relevancia actual radica en la traducción totalmente offline: al ejecutarse sobre CPU mediante la librería fxtranslate (escrita en Rust), permite integrar traducción de calidad razonable en aplicaciones de escritorio sin dependencia de la nube, sin coste por peticiones y con privacidad garantizada por diseño. El tamaño total del repositorio es de 2,5 GB, lo que indica que agrupa un conjunto amplio de pares de idiomas, aunque la lista concreta de idiomas no está detallada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, formato Bergamot/Firefox Translations) |
| Parametros totales | no disponible (varia por par de idiomas; tamano total del repo: 2,5 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelos nativos de Firefox Translations, compactados para CPU) |
| Idiomas soportados | no disponible (todos los pares son hacia/desde ingles) |
| Licencia | Mozilla Public License 2.0 (MPL-2.0) |
| Formato de pesos | ficheros .zst (zstd) conteniendo modelo, vocabulario y lexical shortlist; inferencia con fxtranslate, no safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

Los modelos provienen del proyecto Mozilla Translations (Firefox Translations), que entrena redes Marian basadas en la arquitectura transformer encoder-decoder, la misma familia empleada por el ecosistema Bergamot para traducción local en navegador. Cada paquete distribuido incluye tres componentes: los pesos del modelo, el vocabulario (sentencepiece o similar) y una lexical shortlist, una tabla que reduce el espacio de decodificación y acelera la inferencia en CPU.

Los detalles de entrenamiento (numero de tokens, composición de los corpus paralelos, uso de destilación o backtranslation) no están descritos en la model card de este repositorio; deben consultarse en la documentación del proyecto Mozilla Translations, que es la fuente original. Este mirror no introduce ninguna modificación técnica: reproduce los ficheros tal cual se publican en los servidores de Firefox, con la misma estructura de directorios (`main-workspace/translations-models-v2/`) y un `records.json` que recorta la lista oficial a una build de escritorio por fichero.

## Capacidades

- Traducción automatica de texto hacia o desde el ingles en multiples pares de idiomas (lista exacta de idiomas no disponible en la model card).
- Ejecucion 100% offline sobre CPU, sin necesidad de GPU ni de conexion a internet.
- Inferencia mediante la libreria fxtranslate (Rust), compatible con Windows y Linux.
- Formato compatible con el ecosistema Bergamot / Firefox Translations, lo que facilita su uso en herramientas ya existentes de ese ecosistema.
- No soporta: generacion de texto general, razonamiento, codigo, vision, audio, tool calling ni agentes; es un modelo de traduccion especializado.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio: RevFly lo emplea como proveedor de traduccion sin conexion en Windows y Linux, util cuando no hay red o se requiere privacidad total.
- Privacidad en la traduccion de documentos sensibles: al procesarse localmente, textos confidenciales (correos, contratos, informes) nunca salen del equipo del usuario.
- Integracion en aplicaciones Rust o nativas: fxtranslate es un crate de Rust, por lo que los modelos pueden integrarse en software de escritorio sin dependencias de Python ni de runtimes de ML pesados.
- Sustituto de APIs de traduccion de pago: para volumenes de texto moderados, evita costes por caracter y limites de peticiones de servicios en la nube.
- Traduccion de paginas web o interfaces: al ser el mismo formato que usa Firefox, pueden reutilizarse en herramientas de navegacion localizadas.
- Entornos air-gapped: sistemas corporativos o gubernamentales sin salida a internet pueden distribuir los ficheros .zst internamente y ofrecer traduccion funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para metricas de calidad (COMET, BLEU) de los modelos originales, puede consultarse el repositorio mozilla/translations, aunque este mirror no reproduce esos datos.

## Requisitos de hardware

- Diseñados explicitamente para ejecutarse en CPU; no requieren GPU ni VRAM.
- Consumo de RAM estimado: no disponible, aunque los modelos de Firefox Translations suelen ocupar del orden de decenas a cientos de MB por par de idiomas una vez descomprimidos.
- Cualquier ordenador de escritorio moderno con Windows o Linux es suficiente; no hay requisitos de GPU dedicada (no aplicables RTX 4090, A100, etc.).
- Despliegue: mediante fxtranslate (crates.io) o el proyecto RevFly; no es un modelo estandar de Hugging Face Transformers, por lo que vLLM, TGI, llama.cpp u Ollama no son directamente aplicables sin conversion.
- Latencia y throughput: no disponibles; al ser modelos Marian compactos en CPU, la traduccion de frases individuales es tipicamente inmediata, pero no hay cifras publicadas en este repo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| RevFly translation models (este repo) | Marian (Firefox Translations) | CPU, offline (fxtranslate) | MPL-2.0 | Hugging Face, mirror de Mozilla |
| Modelos originales de mozilla/translations | Marian / Bergamot | CPU, offline (Firefox, bergamot-translator) | MPL-2.0 | Servidores de Mozilla y GitHub |
| Opus-MT (Helsinki-NLP) | Marian | CPU/GPU (Transformers, CTranslate2) | CC-BY 4.0 / apache-2.0 segun modelo | Hugging Face, miles de pares |

Frente a Opus-MT, estos modelos estan optimizados para inferencia local muy ligera en escritorio con shortlist lexica, mientras que Opus-MT ofrece mas pares de idiomas y mejor integracion con la libreria Transformers de Hugging Face, a costa de un despliegue menos compacto.

## Limitaciones y advertencias

- Todos los pares pasan por el ingles: la traduccion entre dos idiomas no ingleses requiere un pivote (idioma A -> ingles -> idioma B), con la consiguiente perdida de calidad acumulada.
- La lista concreta de idiomas incluidos no esta documentada en la model card; hay que consultar `records.json` dentro del repositorio.
- Formato no estandar: los ficheros .zst de Bergamot no cargan directamente con `transformers` de Hugging Face ni con llama.cpp; requieren fxtranslate u otro runtime compatible con el formato de Firefox Translations.
- Calidad de traduccion: los modelos Marian de Firefox son compactos y priorizan velocidad en CPU; su calidad es inferior a la de sistemas neuronales grandes tipo NLLB o LLM de traduccion.
- Riesgo de alucinaciones y errores tipico de traduccion automatica en dominios especializados (legal, medico, tecnico): conviene revision humana en usos criticos.
- Licencia MPL-2.0: permite uso comercial, pero las modificaciones sobre los ficheros licenciados deben compartirse bajo la misma licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha y de creacion muy reciente: no hay historial de uso comunitario que avale su mantenimiento; para produccion puede preferirse la fuente original de Mozilla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Eotsevych/revfly-translation-models
- Proyecto original Mozilla Translations: https://github.com/mozilla/translations
- RevFly (aplicacion que consume estos modelos): https://github.com/eotsevych/RevFly
- fxtranslate (runtime de inferencia en Rust): https://crates.io/crates/fxtranslate
