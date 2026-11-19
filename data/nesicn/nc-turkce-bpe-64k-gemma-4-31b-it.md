# nesicn/nc-turkce-bpe-64k-gemma-4-31b-it

## Resumen

`nesicn/nc-turkce-bpe-64k-gemma-4-31b-it` es un tokenizer publicado en Hugging Face, no un modelo de lenguaje con pesos entrenados. Consiste en el tokenizer original de `google/gemma-4-31B-it` extendido con el vocabulario turco de NC-64k, un BPE de nivel de byte entrenado desde cero sobre turco. El autor es `nesicn` y el artefacto resuelve un problema concreto: la tokenización ineficiente del turco en tokenizers multilingües, donde la morfología aglutinante provoca una fragmentación excesiva y un mayor coste computacional por carácter.

El tokenizer mantiene el tamaño de vocabulario original (262.144) y los ID de tokens especiales. Para ello sustituye los 48.094 tokens de mayor ID del tokenizer de Gemma por 48.094 tokens turcos de NC-64k, dejando intactos los ID del resto. Según las mediciones del autor, en el mismo texto turco se reduce un 34,7 % el número de tokens (de 296,9 a 192,6 tokens por 1.000 caracteres), la F1 de frontera morfológica sube de 33,31 a 57,28, el inglés empeora un 0,5 % y el código mejora un 7,0 %.

Es relevante para quien vaya a adaptar Gemma a turco en producción: permite reducir longitud de secuencia, coste de atención y latencia en inferencia. Ahora bien, el autor advierte explícitamente de que no debe usarse directamente con los pesos originales de Gemma, porque los nuevos tokens ocupan ID cuyos embeddings originales corresponden a otros tokens y no han sido entrenados. Se trata, por tanto, de un componente para un pipeline de extensión de vocabulario y ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer); no es un modelo neuronal |
| Parametros totales | no disponible (artefacto de tokenizer, sin pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo destino Gemma-4-31B-it, no declarada en la informacion) |
| Tipos de cuantizacion | no aplica (tokenizer) |
| Idiomas soportados | turco (tr), ingles (en); cobertura de codigo medida en HumanEval |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json`, ficheros de tokenizer de `transformers`, `merged-to-original-token-ids.json` |
| Tamano de vocabulario | 262.144 (identico al original) |
| Tokens turcos anadidos | 48.094 (sustituyen a los 48.094 de mayor ID del original) |
| Libreria | transformers (probado con 5.22.2) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE de nivel de byte. El vocabulario turco proviene de NC-64k, un BPE entrenado desde cero sobre turco con 64.000 entradas. La construccion se realizo con `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=262144)`. Antes de fusionar, el `tokenizer.json` de NC se convirtio al formato de texto que espera la herramienta (token de byte a texto, espacio a `▁`, byte unico a `<0xXX>`); se descartaron 73 tokens de NC que eran fragmentos UTF-8 incompletos y no podian convertirse a texto.

Las reglas de merge de NC se anteponen a las del tokenizer destino. No se eliminan tokens de un solo caracter, tokens con formato `<…>` o `[…]`, tokens especiales del vocabulario ni tokens ya presentes en NC. El resto se rellena por orden de ID y se descartan los de ID mas alto. El normalizador, la pre-segmentacion, el decoder, la plantilla y la plantilla de chat son identicos a los del tokenizer destino. No hay entrenamiento de pesos ni ajuste fino: es una operacion puramente lexica sobre el vocabulario.

## Capacidades

- Tokenizacion y detokenizacion sin perdida: `decode(encode(x)) == x` en todos los textos de prueba (turco, ingles y codigo), sin generar `<unk>`.
- Reduccion de tokens en turco: -34,7 % (296,9 a 192,6 tokens por 1.000 caracteres) sobre un corpus de 2.128 documentos y 2,37 M de caracteres de cuatro dominios (Resmii Gazete, Wikipedia, noticias y Eksi Sozluk, todos de 2026).
- Mejora de frontera morfologica: F1 de 33,31 a 57,28 sobre `turkish-nlp-suite/turkish-morph-analysis` (163.112 palabras, split `cekimli`).
- Mantenimiento del rendimiento en ingles: +0,5 % de tokens (227,3 a 228,5 por 1.000 caracteres) sobre `wikitext-103-raw-v1` test.
- Mejora en codigo: -7,0 % de tokens (334,0 a 310,6 por 1.000 caracteres) sobre `openai_humaneval` test (prompt + canonical_solution).
- Compatibilidad de ID: vocabulario de 262.144 entradas contiguas (0-262.143), tokens especiales sin cambios y ajuste a la dimension de embedding del modelo destino.
- Mapa de correspondencia `merged-to-original-token-ids.json` con 262.144 registros verificados a nivel de byte, util para inicializar embeddings de los nuevos tokens a partir de los fragmentos originales.
- Carga directa con `transformers` (`AutoTokenizer`) tanto solo con los ficheros de tokenizer como junto con el `config.json` del modelo, produciendo los mismos ID (diferencia 0 documentos).

## Casos de uso

- Adaptacion de Gemma-4-31B-it a turco: usar este tokenizer como base para un ajuste de embeddings y un fine-tuning posterior. El mapa `merged-to-original-token-ids.json` permite inicializar los embeddings de los 48.094 tokens nuevos a partir de los fragmentos originales, reduciendo el coste de adaptacion frente a un vocabulario aleatorio.
- Reduccion de coste de inferencia en turco: al bajar un 34,7 % el numero de tokens por caracter, se reduce proporcionalmente la longitud de secuencia, el coste de atencion y la latencia en modelos servidos con vLLM o TGI, siempre que se haya entrenado el modelo con el nuevo vocabulario.
- Preprocesamiento de corpus turcos de gran volumen: para indexacion, busqueda o clasificacion, un tokenizer con mejor F1 morfologica (57,28) y menor fertilidad (1,489) produce representaciones mas compactas y consistentes en textos aglutinantes.
- Analisis morfologico y NLP turco: la mejora en fronteras de morfema facilita tareas downstream de lematizacion, etiquetado morfologico o segmentacion, alineando mejor los subtokens con unidades linguisticas.
- Pipelines bilingues turco-ingles: mantiene el rendimiento en ingles (+0,5 %) y mejora el codigo (-7,0 %), por lo que sirve para entornos mixtos donde conviven texto turco, documentacion en ingles y fragmentos de codigo.
- Investigacion en extension de vocabulario: el repositorio documenta el procedimiento completo (conversion de formato, uso de `bpe-tokenizer-editor`, criterios de descarte y validacion) y sirve como referencia reproducible para extender vocabularios de otros modelos con idiomas de baja representacion.

## Benchmarks y rendimiento

Datos de tokenizacion publicados por el autor (no son benchmarks de calidad de modelo, sino metricas de eficiencia del tokenizer):

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | Morfologia F1 ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ |
|---|---:|---:|---:|---:|---:|---:|
| gemma-4-31B-it (original) | 262.144 | 296,9 | 2,298 | 33,31 | 227,3 | 334,0 |
| **este tokenizer** | 262.144 | 192,6 | 1,489 | 57,28 | 228,5 | 310,6 |
| NC-64k | 64.000 | 196,9 | 1,522 | 57,10 | 308,6 | 377,3 |
| Altus (Magibu) | 262.144 | 217,8 | 1,685 | 46,17 | 233,7 | 336,4 |

Ejemplos de segmentacion publicados:

| Palabra | este tokenizer | gemma-4-31B-it | NC-64k |
|---|---|---|---|
| Ankara'da | `Ankara · 'da` | `Ankara · ' · da` | `Ankara · 'da` |
| 1923'te | `19 · 23 · 'te` | `1 · 9 · 2 · 3 · ' · te` | `192 · 3 · 'te` |
| Turkiye'deki | `Turkiye · 'deki` | `Turkiye · ' · deki` | `Turkiye · 'deki` |
| evlerimizden | `ev · lerimizden` | `ev · lerimiz · den` | `ev · lerimizden` |
| ogretmenlerimize | `ogretmen · lerimize` | `ogretmen · ler · imize` | `ogretmen · lerimize` |
| Cumhurbaskanligi | `Cumhurbaskanligi` | `Cumhur · bas · kan · ligi` | `Cumhurbaskanligi` |
| gerceklestirilmistir | `gerceklestirilmistir` | `gerceklestir · ilmister` | `gerceklestirilmistir` |
| return | `return` | `return` | `return` |
| struct | `struct` | `struct` | `st · ru · ct` |
| probably | `pro · bab · ly` | `probably` | `pro · bab · ly` |

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, GSM8K, HumanEval como evaluacion de capacidad) en la informacion disponible, porque el artefacto no incluye pesos.

## Requisitos de hardware

- No aplica VRAM de inferencia propia: el repositorio solo contiene ficheros de tokenizer (tamano 0,0 GB) y no hay pesos.
- El coste de computo corresponde al modelo destino Gemma-4-31B-it una vez adaptado; no se dispone de cifras de VRAM ni de GPU recomendadas en la informacion proporcionada.
- Cabe en cualquier entorno donde se ejecute `transformers`, incluida CPU, para tareas de tokenizacion y preprocesamiento.
- Opciones de despliegue: `transformers` (probado con 5.22.2). El autor no documenta integracion con vLLM, llama.cpp, Ollama o TGI; al ser un tokenizer, su uso en esos motores depende de que el modelo con el que se combine se haya entrenado con este vocabulario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | TR tok/1.000 | TR fertility | Morfologia F1 | EN tok/1.000 | Codigo tok/1.000 | Licencia |
|---|---|---:|---:|---:|---:|---:|---:|---|
| **este tokenizer** | Tokenizer extendido sobre Gemma-4-31B-it | 262.144 | 192,6 | 1,489 | 57,28 | 228,5 | 310,6 | Apache-2.0 |
| gemma-4-31B-it (original) | Tokenizer de modelo | 262.144 | 296,9 | 2,298 | 33,31 | 227,3 | 334,0 | no disponible en la informacion |
| NC-64k | Tokenizer BPE turco desde cero | 64.000 | 196,9 | 1,522 | 57,10 | 308,6 | 377,3 | no disponible en la informacion |
| Altus (Magibu) | Tokenizer turco extendido | 262.144 | 217,8 | 1,685 | 46,17 | 233,7 | 336,4 | no disponible en la informacion |

La comparacion es de eficiencia de tokenizacion, no de calidad de modelo. NC-64k obtiene cifras turcas cercanas pero penaliza fuertemente ingles y codigo por su vocabulario mas pequeno. Altus queda por detras en todas las metricas turcas y en codigo. El tokenizer original de Gemma es el peor en turco pero el mejor en ingles.

## Limitaciones y advertencias

- No debe usarse directamente con los pesos originales de Gemma-4-31B-it: los 48.094 tokens nuevos ocupan ID cuyos embeddings originales pertenecen a otros tokens y no estan entrenados. Sin inicializacion y entrenamiento, el modelo no funciona correctamente con este tokenizer.
- Los tokens de mayor ID del vocabulario original desaparecen; cualquier sistema que dependa de esos ID concretos se rompe.
- El rendimiento en ingles empeora ligeramente (+0,5 % de tokens) y la segmentacion de palabras inglesas comunes cambia (por ejemplo, `probably` pasa a `pro · bab · ly`).
- Se descartaron 73 tokens de NC por ser fragmentos UTF-8 incompletos; el vocabulario turco final no es exactamente el de NC-64k.
- Los datos de evaluacion son de 2026 y de cuatro dominios concretos; el comportamiento en otros registros (tecnico, juridico, redes sociales) no esta medido.
- No hay benchmarks de calidad de modelo ni de tareas downstream, solo metricas de tokenizacion.
- Licencia Apache-2.0 para el artefacto de tokenizer; la licencia del modelo destino Gemma-4-31B-it no se detalla en la informacion y debe verificarse por separado antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- Riesgo de sesgo y alucinacion: no evaluable a nivel de tokenizer; depende del modelo con el que se combine.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-64k-gemma-4-31b-it
- NC-64k (vocabulario turco de origen): https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Modelo destino Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Herramienta de fusion `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
- Altus (Magibu), tokenizer comparado: https://huggingface.co/magibu/Altus
- Dataset de evaluacion morfologica: `turkish-nlp-suite/turkish-morph-analysis`
- Dataset de evaluacion en ingles: `Salesforce/wikitext` (`wikitext-103-raw-v1`)
- Dataset de evaluacion en codigo: `openai/openai_humaneval`
