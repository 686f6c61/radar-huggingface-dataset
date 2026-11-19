# nesicn/nc-turkce-bpe-32k-gemma-4-31b-it

## Resumen

El repositorio `nesicn/nc-turkce-bpe-32k-gemma-4-31b-it` no contiene un modelo de lenguaje, sino un **tokenizer** para `gemma-4-31B-it` (Google) construido por el usuario nesicn. Se trata de una extensión del vocabulario original de Gemma con 21.169 tokens procedentes de NC-32k, un vocabulario BPE entrenado desde cero sobre turco. El objetivo es reducir el coste en tokens del turco sin alterar el tamaño del vocabulario (262.144 entradas) ni los IDs de los tokens especiales.

La propuesta es relevante porque el tokenizer original de Gemma fragmenta agresivamente el turco (aglutinante y con morfología compleja): según las mediciones del autor, este tokenizer reduce un 29,2 % el número de tokens sobre el mismo texto turco (de 296,9 a 209,0 tokens por 1.000 caracteres) y eleva la F1 de fronteras morfológicas de 33,31 a 57,99. El coste es mínimo en inglés (+0,5 % de tokens) y mejora ligeramente en código (−6,7 %).

Es importante subrayar que **no es un modelo listo para inferencia**: los nuevos tokens ocupan los IDs de los 21.169 tokens de mayor ID del tokenizer original, por lo que sus embeddings en los pesos de `gemma-4-31B-it` corresponden a tokens descartados. El autor advierte explícitamente de que hay que inicializar y entrenar esos embeddings antes de usar el tokenizer con los pesos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (no es un modelo de lenguaje) |
| Parametros totales | no disponible (el tokenizer no tiene parametros; el modelo asociado, gemma-4-31B-it, no se detalla en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo gemma-4-31B-it, no del tokenizer) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | Turco (tr) e ingles (en); el codigo tambien se evalua |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, ficheros de tokenizer de `transformers` y `merged-to-original-token-ids.json` (mapa de IDs) |
| Tamano del vocabulario | 262.144 tokens (identico al original) |
| Tokens anadidos | 21.169 tokens de NC-32k |
| Libreria | transformers (probado con 5.22.2) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El tokenizer parte del vocabulario de `gemma-4-31B-it` y le injerta 21.169 tokens de NC-32k, un vocabulario BPE byte-level entrenado desde cero sobre turco. El proceso se realizo con la herramienta `bpe-tokenizer-editor` 0.2.0 (`BPETokenizerEditor(target).merge_from(nc, max_vocab_size=262144)`), siguiendo el mismo metodo que el script `examples/merge_magibu_into_tokenizers.py` del repositorio de la herramienta. Las reglas de merge de NC-32k se colocan antes que las del tokenizer destino.

Los tokens que se conservan son los de un solo caracter, los de forma `<...>` o `[...]`, los tokens especiales del vocabulario y los que ya existian en NC-32k. El resto se rellena por orden de ID, descartando los de ID mas alto: los 21.169 tokens de mayor ID de Gemma se sustituyen por los tokens turcos. 43 tokens de NC-32k no se pudieron convertir a texto por ser fragmentos UTF-8 incompletos y quedaron fuera. El normalizador, el pre-split, el decoder, la plantilla y la plantilla de chat son identicos a los del tokenizer original.

El autor incluye una validacion exhaustiva: round-trip `decode(encode(x)) == x` en el 100 % de los textos de prueba (turco, ingles y codigo), cero `<unk>`, IDs 0–262.143 consecutivos, cero cambios en tokens especiales y en tokens de ID modificado, y verificacion byte a byte de las 262.144 entradas de `merged-to-original-token-ids.json`. Tambien comprueba que `transformers` y `tokenizer.json` producen los mismos IDs, tanto cargando solo los ficheros del tokenizer como con el `config.json` del modelo.

## Capacidades

- Tokenizacion byte-level BPE de turco e ingles con round-trip sin perdida y sin `<unk>`.
- Segmentacion morfologica del turco muy superior a la original: F1 de fronteras morfologicas de 57,99 frente a 33,31.
- Reduccion del coste en tokens del turco: −29,2 % (296,9 → 209,0 tokens por 1.000 caracteres).
- Fertilidad turca (tokens por palabra separada por espacio) de 1,617 frente a 2,298 del original.
- Rendimiento casi neutro en ingles (+0,5 % de tokens) y mejora en codigo (−6,7 %).
- Compatibilidad con `transformers` (`GemmaTokenizer`) y con el pipeline de `endpoints_compatible`.
- Mapa `merged-to-original-token-ids.json` que traduce cada ID al token o tokens originales, util para inicializar embeddings.
- No incluye capacidades de generacion, razonamiento, vision, tool calling ni agentes: es exclusivamente un tokenizer.

## Casos de uso

- **Preprocesado de corpus turcos para fine-tuning de Gemma**: reducir un 29,2 % los tokens de un corpus turco permite entrenar con secuencias mas largas o procesar mas documentos por epoch con el mismo presupuesto de computo, a cambio de inicializar y entrenar los embeddings de los 21.169 tokens nuevos.
- **Ajuste de eficiencia en inferencia turca**: con el modelo adaptado, una misma consulta consume menos tokens, lo que se traduce en menor latencia y menor coste por peticion en APIs de generacion en turco.
- **Investigacion en morfologia computacional**: la mejora de F1 de fronteras morfologicas (33,31 → 57,99) hace que las segmentaciones sean mas utiles para tareas de analisis morfologico, lematizacion o etiquetado gramatical sobre texto turco.
- **Construccion de modelos multilingues turco-ingles**: al mantener el rendimiento en ingles (+0,5 % de tokens), el tokenizer sirve para modelos que cubren ambos idiomas sin penalizar el ingles de forma apreciable.
- **Procesamiento de codigo en contextos turcos**: la reduccion del 6,7 % en tokens de codigo beneficia a asistentes de programacion que operan sobre documentacion o comentarios en turco y codigo fuente mezclados.
- **Evaluacion comparativa de tokenizers**: sirve como referencia reproducible para comparar estrategias de extension de vocabulario (frente a NC-32k puro o Altus) usando las metricas publicadas por el autor.
- **Migracion controlada de un modelo Gemma existente**: el mapa `merged-to-original-token-ids.json` permite inicializar los embeddings nuevos a partir de los tokens originales correspondientes, facilitando una adaptacion gradual sin reentrenar desde cero.

## Benchmarks y rendimiento

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | Morfologia F1 ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ |
|---|---:|---:|---:|---:|---:|---:|
| gemma-4-31B-it (original) | 262.144 | 296,9 | 2,298 | 33,31 | 227,3 | 334,0 |
| **este tokenizer** | 262.144 | 209,0 | 1,617 | 57,99 | 228,4 | 311,5 |
| NC-32k | 32.000 | 216,4 | 1,674 | 57,75 | 336,3 | 410,0 |
| Altus (Magibu) | 262.144 | 217,8 | 1,685 | 46,17 | 233,7 | 336,4 |

Metodologia declarada por el autor: turco sobre 2.128 documentos y 2,37 M de caracteres, con cuatro dominios de igual peso (Resmî Gazete, Vikipedi, noticias y Ekşi Sözlük), todos de 2026; ingles sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`); codigo sobre `openai/openai_humaneval` (test, prompt + `canonical_solution`, commit `7dce6050`); morfologia sobre `turkish-nlp-suite/turkish-morph-analysis` (`cekimli`, 163.112 palabras, commit `ebfe5f56`). Altus se construyo con otro vocabulario turco (Magibu, 65.536) ampliado hasta 262.144, por lo que los tamanos de vocabulario no son directamente comparables.

## Requisitos de hardware

- No aplica: un tokenizer no requiere GPU ni VRAM para funcionar; el coste de CPU es despreciable frente a la inferencia del modelo.
- Para usar el tokenizer junto con `gemma-4-31B-it` adaptado, los requisitos de hardware son los del modelo base (no detallados en la informacion disponible).
- El repositorio ocupa 0,0 GB, por lo que se puede cargar en cualquier entorno con `transformers` 5.22.2 o compatible.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), pipelines compatibles con `endpoints_compatible` y cualquier framework que consuma `tokenizer.json`.
- Latencia y throughput: no disponibles; al ser un tokenizer, el cuello de botella estara en el modelo, no en la tokenizacion.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | TR tok/1.000 | Morfologia F1 | EN tok/1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| **nc-turkce-bpe-32k-gemma-4-31b-it** | 262.144 | 209,0 | 57,99 | 228,4 | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| gemma-4-31B-it (original) | 262.144 | 296,9 | 33,31 | 227,3 | no disponible en la informacion | Hugging Face (Google) |
| NC-32k | 32.000 | 216,4 | 57,75 | 336,3 | no disponible en la informacion | Hugging Face (nesicn) |
| Altus (Magibu) | 262.144 | 217,8 | 46,17 | 233,7 | no disponible en la informacion | Hugging Face (magibu) |

## Limitaciones y advertencias

- **No usable directamente con los pesos originales de `gemma-4-31B-it`**: los 21.169 tokens nuevos ocupan los IDs de tokens descartados, cuyos embeddings en el modelo original no corresponden a los tokens turcos. Es necesario inicializar y entrenar esos embeddings antes de la inferencia.
- Los embeddings nuevos pueden inicializarse a partir de los tokens originales que representa cada ID mediante `merged-to-original-token-ids.json`, pero el autor no documenta ningun proceso de entrenamiento ni resultados tras el mismo.
- El rendimiento en ingles empeora ligeramente (+0,5 % de tokens); no es un tokenizer neutro para todos los idiomas.
- El vocabulario de 262.144 entradas limita la incorporacion de nuevos tokens: cualquier extension futura exige descartar tokens existentes.
- La evaluacion se realizo sobre corpus de 2026 y conjuntos de test concretos; no hay resultados en dominios fuera de los cuatro muestreados (juridico, enciclopedico, noticias y foros).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no consta validacion independiente por terceros.
- La licencia Apache 2.0 cubre el tokenizer, pero el uso comercial con el modelo Gemma subyacente queda sujeto a la licencia de dicho modelo, no detallada en la informacion disponible.
- No se han publicado resultados de benchmarks de calidad de generacion (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-32k-gemma-4-31b-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Vocabulario NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Tokenizer Altus (Magibu): https://huggingface.co/magibu/Altus
- Herramienta de edicion de tokenizers: https://github.com/malibayram/bpe-tokenizer-editor
