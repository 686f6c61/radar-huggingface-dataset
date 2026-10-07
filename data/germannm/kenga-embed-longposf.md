# GermannM/kenga-embed-longposF

## Resumen

kenga-embed-longposF es un codificador de frases (sentence encoder) bilingue ruso/ingles de 44,2 millones de parametros desarrollado por GermannM dentro del proyecto Kenga. Se distribuye bajo licencia MIT y su tarea declarada es sentence-similarity, orientada a recuperacion de informacion, clasificacion, clustering, reranking y similitud semantica. Su salida son embeddings de 768 dimensiones normalizados en L2 con pooling por media, y acepta secuencias de hasta 512 tokens.

El modelo resuelve un problema concreto de su propia genealogia: las etapas anteriores del pipeline (tanto el teacher como el student) se entrenaron con una ventana de 256 tokens, de modo que la segunda mitad de la tabla de posiciones aprendidas permanecia en su inicializacion aleatoria y cualquier texto de mas de 256 tokens se codificaba con ruido en su cola. kenga-embed-longposF entrena efectivamente las posiciones 256..511, primero con el resto de la red congelada (etapa A) y despues con un desbloqueo breve de todo el modelo (etapa F), sobre 70.000 textos largos abiertos.

Es relevante porque demuestra que un encoder de ~44M puede cubrir contextos de 512 tokens sin reentrenar desde cero, y porque publica resultados completos de MTEB(rus, v1.1) en 23 de 23 tareas, lo que permite situarlo con precision frente a los encoders rusos de 30-40M y frente a modelos mucho mayores como Giga-Embeddings-instruct-480M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorizacion Z (Z-factored) en proyecciones de atencion y FF |
| Parametros totales | 44,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible; checkpoint publicado en fp32 |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), mas `config.json`, tokenizador `kenga_spm.model` y codigo `modeling_kenga_embed_v2.py` |

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional de 8 capas, dimension de modelo d=768, 12 cabezas de atencion y dimension feed-forward dff=3072. El embedding de tokens esta factorizado (16385 x 128 -> 768) y las proyecciones de atencion y feed-forward usan factorizacion Z con rangos 192/512. Las posiciones son aprendidas hasta 512. El tokenizador es SentencePiece con vocabulario de 16k. El pooling es por media sobre la secuencia y la salida se normaliza en L2 a 768 dimensiones. El checkpoint ocupa 177 MB en fp32 y corresponde al step 1500.

El entrenamiento parte de kenga-embed-prophet5, que a su vez arrastraba la limitacion de las 256 posiciones. La etapa A congela todo el modelo y entrena unicamente pos[256:512] contra BERTA a 512 tokens sobre 70.000 textos largos abiertos (Lenta.ru y Wikipedia en ruso; ninguno de los dos es corpus de MTEB(rus)). Al mantener congelado el resto, los textos de hasta 256 tokens quedan inalterados. La etapa F desbloquea brevemente el modelo completo sobre el mismo objetivo. El protocolo de prefijos es el de FRIDA / BERTA, lo que permite sustituir cualquiera de esos modelos en un pipeline existente sin cambios estructurales. El codigo de entrenamiento en PyTorch vive en el arbol del laboratorio `z-system` (`embed_v2/`: `build_segments.py`, `teacher.py`, `distill.py`, `build_ft_data.py`, `mine_hard.py`, `finetune_prophet.py`, `run_mteb`). No se documenta en la informacion disponible el uso de RLHF ni DPO.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones, normalizados en L2, listos para similitud coseno.
- Recuperacion de informacion (retrieval) en ruso e ingles con protocolo de prefijos diferenciado para consulta y documento.
- Clasificacion de texto y clasificacion multietiqueta mediante prefijos `categorize`, `categorize_sentiment`, `categorize_topic`.
- Agrupamiento (clustering) de pares texto-texto.
- Reranking de resultados de busqueda.
- Similitud semantica textual (STS) y parafraseo, con prefijo `paraphrase` en ambos lados.
- Inferencia de relacion textual / entailment mediante el prefijo `categorize_entailment`.
- Contexto efectivo de 512 tokens, incluyendo textos largos que antes se codificaban con ruido por encima de 256 tokens.
- Capacidades multilingues limitadas a ruso e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito: es un encoder, no un modelo generativo.

## Casos de uso

- Busqueda semantica sobre corpus rusos de documentos largos: el modelo acepta hasta 512 tokens, de modo que fragmentos extensos de normativa, articulos o informes se pueden indexar sin truncado agresivo, usando los prefijos `search_query` y `search_document`.
- RAG sobre documentacion tecnica bilingue ruso/ingles: se indexan pasajes de hasta 512 tokens y se recuperan por similitud coseno; al seguir el protocolo de prefijos de BERTA/FRIDA, se puede reutilizar un pipeline ya montado para esos modelos.
- Clasificacion de resenas de producto o cine: los prefijos `categorize_sentiment` y `categorize_topic` permiten obtener un vector por resena y entrenar encima un clasificador ligero, como en los conjuntos Kinopoisk o RuReviews del benchmark.
- Deduplicacion y agrupamiento de noticias: el modelo obtiene 59,8 y 51,5 en los conjuntos de clustering cientifico ruso de MTEB(rus), suficiente para agrupar titulares y textos por tematica con un coste computacional muy bajo.
- Reranking en un motor de busqueda existente: se recuperan candidatos con un indice vectorial rapido y se reordenan con este encoder, apoyandose en el prefijo `search_document` para los pasajes.
- Deteccion de similitud entre preguntas frecuentes: con el prefijo `paraphrase` en ambos lados se puede construir un sistema de FAQ que detecte consultas equivalentes y las redirija a una respuesta canonica.
- Moderacion y clasificacion de temas sensibles: el modelo contempla el prefijo `categorize` y el benchmark incluye InappropriatenessClassification y SensitiveTopicsClassification, aunque los resultados en esta ultima tarea son bajos (29,0) y limitan su fiabilidad en produccion.
- Despliegue de bajo coste en CPU: al ser un encoder de 44,2M y 177 MB en fp32, se puede ejecutar en servidores sin GPU para pipelines de indexacion por lotes.

## Benchmarks y rendimiento

Resultados oficiales en MTEB(rus, v1.1) ejecutados con `mteb==2.20.5`, todos los splits y subconjuntos definidos por el benchmark, 23 de 23 tareas completadas. Las columnas de referencia corresponden a las entregas de los propios modelos al leaderboard.

| Tarea | kenga-embed-longposF | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 46,9 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 85,0 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 60,9 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 61,5 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 63,1 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 73,4 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 70,2 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 63,7 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 49,5 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 54,9 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 29,0 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 47,6 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 59,8 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 51,5 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 61,8 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 66,4 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 49,6 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 52,7 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 54,1 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 45,5 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 67,3 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 71,2 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 54,9 | 65,3 | 61,1 | 66,1 | 64,6 |
| Clasificacion (media) | 63,8 | 76,7 | 71,2 | 59,8 | 55,0 |
| Clasificacion multietiqueta (media) | 41,9 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 52,9 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 61,8 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 58,0 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 50,8 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 64,5 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 58,3 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 56,2 | 73,1 | 67,9 | 56,5 | 52,6 |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

Segun el autor, la media estilo leaderboard es 56,2. En la media simple de las 23 tareas, la diferencia con Giga-Embeddings-instruct-480M es de +15,9 puntos (58,3 frente a 74,2) y de -0,2 puntos frente a USER2-small-34M (58,5). El propio autor senala que el modelo no supera a Giga.

## Requisitos de hardware

- VRAM en fp32: el checkpoint pesa 177 MB, por lo que la inferencia cabe comodamente en cualquier GPU de consumo actual; con activaciones y overhead de runtime el consumo se mantiene en el rango de cientos de megabytes.
- VRAM en fp16/bf16: no disponible oficialmente, pero la conversion a media precision reduciria el peso de pesos a aproximadamente 88 MB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo tambien funciona en CPU (`device="cpu"` segun la model card). No se especifican modelos concretos como A100 o H100 porque no son necesarios para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con soporte CUDA; el cuello de botella no es el modelo sino el indice vectorial si se usa a gran escala.
- Opciones de despliegue: la model card solo documenta uso directo con PyTorch mas SentencePiece, importando `KengaEmbedV2HF` desde `modeling_kenga_embed_v2.py`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama, TGI ni text-embeddings-inference; dado que usa codigo de modelado propio y pesos en `.bin`, su integracion en esos servidores requeriria trabajo adicional no descrito.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media MTEB(rus) sobre tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| kenga-embed-longposF | 44,2 M | 512 tokens | 58,3 | MIT | HuggingFace (GermannM/kenga-embed-longposF) |
| USER2-small-34M | 34 M | no disponible | 58,5 | no disponible | submission en el leaderboard de MTEB |
| rubert-tiny-turbo-29M | 29 M | no disponible | 53,7 | no disponible | submission en el leaderboard de MTEB |
| BERTA-128M | 128 M | no disponible | 69,4 | no disponible | submission en el leaderboard de MTEB |
| Giga-Embeddings-instruct-480M | 480 M | no disponible | 74,2 | no disponible | submission en el leaderboard de MTEB |

La comparativa relevante es contra los encoders rusos de 30-40M: kenga-embed-longposF queda 0,2 puntos por debajo de USER2-small-34M y 4,6 puntos por encima de rubert-tiny-turbo-29M en la media simple, con un contexto declarado de 512 tokens. Frente a Giga-Embeddings-instruct-480M, que es aproximadamente diez veces mayor, la diferencia es de 15,9 puntos a favor de Giga.

## Limitaciones y advertencias

- Solo se evalua oficialmente en MTEB(rus, v1.1); el rendimiento fuera del dominio ruso e ingles no esta documentado.
- El conjunto de entrenamiento de la etapa A (Lenta.ru y Wikipedia en ruso) no forma parte de MTEB(rus), segun el autor, pero sigue siendo un sesgo de dominio hacia noticias y texto enciclopedico.
- Resultados bajos en tareas de moderacion: 29,0 en SensitiveTopicsClassification, lo que desaconseja su uso directo para filtrado de contenido sensible sin un clasificador especifico encima.
- Rendimiento flojo en recuperacion: las tres tareas de retrieval quedan entre 45,5 y 54,1, con una media de 50,8, muy por debajo de los modelos mayores; en un sistema RAG conviene combinarlo con un reranker.
- El entrenamiento solo cubre de forma efectiva hasta 512 tokens; por encima de esa longitud no hay mecanismo de extrapolacion descrito.
- Riesgo de alucinacion no aplica en el sentido generativo (no genera texto), pero si existe riesgo de falsos positivos en similitud y de vecinos irrelevantes en recuperacion cuando los textos son largos o ruidosos.
- Dependencia de codigo personalizado: la carga requiere importar `modeling_kenga_embed_v2.py` y disponer de torch y sentencepiece, lo que complica el despliegue en servidores estandar que solo admiten safetensors y transformers.
- El protocolo de prefijos es obligatorio; omitirlos o usar el prefijo equivocado degrada la calidad de los embeddings, ya que el modelo fue entrenado con ese esquema.
- No se documentan sesgos demograficos, linguisticos ni de representacion mas alla de lo indicado.
- La licencia MIT permite uso comercial sin restricciones declaradas, pero conviene verificar la licencia de los datos de entrenamiento citados (Lenta.ru, Wikipedia) si el uso es comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa independiente de los numeros publicados.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-embed-longposF
- Proyecto Kenga: https://github.com/GermannM/kenga-lang
- Resultados de referencia del leaderboard de MTEB: https://github.com/embeddings-benchmark/results
