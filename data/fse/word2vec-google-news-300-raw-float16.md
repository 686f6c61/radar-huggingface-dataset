# fse/word2vec-google-news-300-raw-float16

## Resumen

`fse/word2vec-google-news-300-raw-float16` es una conversion del clasico modelo de embeddings estaticos Word2Vec de Google News (300 dimensiones) al formato nativo de la libreria `fse` (Fast Sentence Embeddings), almacenado en `float16` y serializado en safetensors. Lo publica el usuario `fse`, autor de la propia libreria, como artefacto derivado del modelo base `fse/word2vec-google-news-300`. No es un modelo generativo: es una tabla de embeddings de palabras de 3.000.000 de filas y 300 dimensiones, que se agrega a nivel de frase mediante la media de los vectores de sus tokens, normalizada a longitud unitaria.

El problema que resuelve es el de obtener sentence embeddings rapidos y deterministas sin inferencia neuronal: al ser una tabla estatica, el coste de codificar una frase se reduce a tokenizar, buscar filas y promediar. Esto lo hace atractivo para recuperacion densa a gran escala, deduplicacion, clustering y baselines de similitud semantica donde un transformer de 300 M de parametros resultaria sobredimensionado o demasiado lento.

La relevancia de esta variante concreta es el formato: frente al modelo original de gensim, aqui la tabla viene cuantizada a `float16` (1.865.259.670 bytes de fichero de modelo, repo de 1.9 GB) y con un tokenizador propio (`fse_words@1`), lo que permite cargarla directamente con `fse>=2.0`. La model card advierte explicitamente de que los vectores resultantes son los de la tabla cuantizada, no los del modelo original en `float32`, y que la fidelidad respecto al original se mide, no se garantiza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (Word2Vec, tabla de lookup); agregacion por media de tokens y normalizacion L2 a nivel de frase |
| Parametros totales | 944.258.511 (3.000.000 filas x 300 dimensiones en float16, segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo sin contexto: codifica frases completas como bolsa de palabras) |
| Tipos de cuantizacion | float16 (esta variante); el ecosistema fse menciona tambien float32 e int8 en la model card |
| Idiomas soportados | en (ingles) |
| Licencia | other (`word2vec-google-news-research-only`); el proyecto original de word2vec se declara "released for research purposes only" |
| Formato de pesos | safetensors (tabla generada por `quantize_rows@1` desde la tabla float32 `xxh3-128:82ba9ce3dc01894279dccda982d3ae83`) |

## Arquitectura y entrenamiento

No hay entrenamiento propio en esta publicacion: es una conversion de formato del modelo `fse/word2vec-google-news-300` (revision `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`), que a su vez deriva del Word2Vec original entrenado por Google sobre un corpus de noticias de Google News (aproximadamente 100.000 millones de tokens, segun la documentacion historica del proyecto, aunque ese dato no se detalla en la informacion proporcionada). La arquitectura subyacente es CBOW o skip-gram con 300 dimensiones y vocabulario de 3.000.000 de entradas; esta ficha no dispone de la informacion para confirmar cual de las dos variantes se uso.

La innovacion tecnica de esta version es puramente de ingenieria de formatos: la tabla se almacena cuantizada a `float16` mediante el paso `quantize_rows@1` de fse, con tokenizador `fse_words@1` y un paso `normalize@1` por fila. La model card documenta una huella (`fingerprint`) `xxh3-128:4fbe512db126cfe88b7daa8ef5440a7c` para verificar integridad. En el backend CPU, fse calcula los vectores "bit a bit como su referencia", es decir, sobre la tabla cuantizada, no sobre la original. La model card incluye ademas una comparacion controlada con la variante SIF-10 (ponderacion por frecuencia y eliminacion de componentes del corpus de entrenamiento): sobre los 1.379 pares de test de STS-B, raw float32 obtiene 61,54132 de Pearson x100 frente a 70,88642 de SIF-10 float32.

## Capacidades

- Generacion de embeddings de palabras y de frases en ingles mediante media de vectores de tokens y normalizacion L2.
- Feature extraction para pipelines de similitud semantica, recuperacion densa y clustering.
- Codificacion determinista y muy rapida en CPU (tabla de lookup, sin pasada por transformer).
- Compatibilidad con la API `fse.Encoder` de `fse>=2.0`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta generacion de texto, codigo ni matematicas.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Busqueda semantica a gran escala: indexar millones de documentos y recuperar por similitud coseno con un coste de codificacion de microsegundos por frase, adecuado cuando el corpus es demasiado grande para un encoder transformer.
- Deduplicacion de contenidos: comparar titulares o parrafos de noticias en ingles mediante similitud de embeddings para detectar duplicados y near-duplicates en pipelines de ingesta.
- Clustering y topic modeling: agrupar documentos por similitud de sus vectores medios como paso previo a un analisis tematico supervisado.
- Baseline de evaluacion: servir como referencia estatica contra la que medir la mejora de encoders neuronales (por ejemplo, en STS-B) antes de justificar el coste de un transformer.
- Clasificacion de texto ligera: usar los vectores de frase como features de entrada para un clasificador lineal (regresion logistica, SVM) en tareas de moderacion o etiquetado.
- Sistemas de recomendacion de contenido: calcular similitud entre articulos o descripciones cortas en ingles para generar candidatos en un ranking de dos etapas.
- Filtrado previo en pipelines RAG: cribar candidatos con un encoder estatico barato y reservar el reranking con cross-encoder solo para el top-k.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la comparacion controlada de la model card sobre los 1.379 pares de test de STS-B:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (raw float32) | 61,54132 |
| STS-B Pearson x100 (SIF-10 float32) | 70,88642 |
| STS-B Pearson x100 (esta variante, tokenizador por defecto) | 61,54132 |
| Diferencia frente a float32 del mismo metodo (puntos) | +0,00000 |
| Recall@10 frente a float32 del mismo metodo | 1,000000 |
| Bytes del fichero de modelo | 1.865.259.670 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible, y carecen de sentido para un modelo de embeddings estaticos. La model card indica explicitamente que no se emite ninguna afirmacion sobre tiempo de carga o velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en sentido estricto; la tabla ocupa aproximadamente 1,9 GB en disco y una cantidad similar en memoria al cargarse (944 M de parametros en float16).
- GPU recomendadas: no es necesario GPU; el backend CPU de fse es el camino documentado y produce resultados bit a bit respecto a su referencia.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM si se desea acelerar el lookup, aunque el cuello de botella real sera el ancho de banda de memoria, no el computo.
- Opciones de despliegue: libreria `fse>=2.0` (unica via documentada). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles; la model card declara explicitamente que no se emite ninguna afirmacion de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/word2vec-google-news-300-raw-float16 | 944.258.511 | 300 | no aplica | other (research only) | safetensors (fse) |
| fse/word2vec-google-news-300 (base) | no disponible | 300 | no aplica | other (research only) | gensim |
| GloVe 300d (referencia historica) | no disponible en la informacion | 300 | no aplica | no disponible en la informacion | varios |
| Encoders neuronales tipo Sentence-BERT | cientos de millones | 384-1024 | 256-512 tokens | Apache-2.0 o similar | safetensors, ONNX |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al dato de STS-B de esta variante (61,54132 Pearson x100 en raw float32) frente a SIF-10 sobre la misma tabla (70,88642).

## Limitaciones y advertencias

- Licencia restrictiva: el proyecto word2vec original se declara "released for research purposes only"; la licencia Apache-2.0 cubre el codigo, no estos vectores preentrenados. El uso comercial no esta autorizado por la model card.
- Solo ingles: no hay soporte multilingue; el rendimiento en otros idiomas no esta medido ni respaldado.
- Modelo estatico sin contexto: la media de vectores de tokens ignora el orden y las dependencias sintacticas, lo que degrada tareas que requieren composicionalidad (negacion, orden de palabras, referencias).
- Cuantizacion a float16: los vectores son los de la tabla cuantizada, no los del modelo original; la model card afirma que la cercania al original se mide, no se promete.
- Vocabulario fijo de 3.000.000 de entradas: las palabras fuera de vocabulario (OOV) no tienen representacion propia y deben mapearse o descartarse.
- Riesgo de sesgo: los embeddings de Google News heredan los sesgos de genero, raza y religion documentados en la literatura sobre este modelo; no se ha aplicado ninguna mitigacion.
- No apto para generacion: no produce texto, codigo ni respuestas; usarlo como si fuera un LLM daria resultados invalidos.
- Sin soporte en toolchains estandar de inferencia: requiere `fse>=2.0`, lo que limita la portabilidad frente a safetensors + transformers.
- Sin datos de latencia ni throughput publicados: no se puede dimensionar un despliegue en produccion solo con la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300-raw-float16
- Modelo base: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original de word2vec (Google Code Archive): https://code.google.com/archive/p/word2vec/
- Revision de origen citada en la model card: `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`
