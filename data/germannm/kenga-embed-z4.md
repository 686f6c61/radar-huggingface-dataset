# GermannM/kenga-embed-z4

## Resumen

kenga-embed-z4 es un codificador de frases (sentence encoder) bilingue ruso/ingles de 44,2 millones de parametros desarrollado por GermannM dentro del proyecto Kenga. Se distribuye como un transformer bidireccional con factorizacion Z, tokenizador SentencePiece de 16k, mean pooling y salida L2-normalizada de 768 dimensiones, con una ventana de contexto de 512 tokens. Su protocolo de prefijos es el de FRIDA/BERTA, lo que permite sustituir a esos modelos en pipelines ya existentes.

El modelo se obtiene por destilacion desde sergeyzh/BERTA (128M) sobre 1,23 millones de segmentos ruso/ingles sin etiquetas, siguiendo una curricula de rango en las capas factorizadas. Esta pensado para tareas de similitud semantica, recuperacion (retrieval), reranking, clasificacion y clustering, no para generacion de texto.

Su relevancia es acotada y hay que leerla con precision: compite en la liga de codificadores rusos de 30-40M (USER2-small-34M, rubert-tiny-turbo-29M), no con modelos de 480M como Giga-Embeddings-instruct. En MTEB(rus, v1.1) completo 23/23 tareas con una media simple de 56,5, 2,0 puntos por debajo de USER2-small-34M y 17,7 por debajo de Giga-Embeddings-instruct-480M. El repositorio no registraba descargas ni likes en el momento de la consulta y el codigo de entrenamiento no es publico, solo la receta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorizacion Z (Z-factored transformer) |
| Parametros totales | 44,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible; el checkpoint publicado es fp32 (177 MB) |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch, fp32) mas config.json, kenga_spm.model y modeling_kenga_embed_v2.py |
| Dimension de embedding | 768 (salida L2-normalizada) |
| Pooling | mean pooling |
| Tokenizador | SentencePiece, vocabulario de 16k (16385 entradas) |
| Capas / cabezas / dff | 8 capas, 12 cabezas, dff 3072 |
| Posiciones | posiciones aprendidas hasta 512 |
| Paso del checkpoint | 58000 |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

El modelo usa un transformer bidireccional de 8 capas, d=768, 12 cabezas de atencion y dff=3072, con embedding de tokens factorizado (16385 x 128 -> 768) y proyecciones de atencion y feed-forward tambien factorizadas en el eje Z con rangos 192 y 512. Las posiciones son aprendidas hasta 512. El entrenamiento sigue una curricula de rango: las capas factorizadas operan al 25 %, luego al 50 % y finalmente al 100 % del rango final.

La etapa de destilacion documentada comprende 30.000 pasos de destilacion coseno y relacional-KL desde sergeyzh/BERTA (128M, a su vez destilado de FRIDA) sobre 1,23 millones de segmentos en ruso e ingles procedentes de Wikipedia, dialogos, resenas, titulares e intenciones, con prefijos estilo FRIDA. No se usaron etiquetas. El checkpoint publicado corresponde al paso 58000, dato que no encaja con los 30.000 pasos descritos, y la model card atribuye esa etapa a "kenga-embed-z2" pese a que el modelo publicado es z4; conviene tratar esa discrepancia como una ambiguedad del propio autor. La receta y el contrato Prophet estan documentados en docs/PROPHETS.md, pero los entrenadores PyTorch (build_segments.py, teacher.py, distill.py, build_ft_data.py, mine_hard.py, finetune_prophet.py, run_mteb.py) viven en un arbol de laboratorio (z-system) que no es publico.

## Capacidades

- Generacion de embeddings de frase y de documento de 768 dimensiones, L2-normalizados, listos para similitud coseno via producto escalar.
- Recuperacion densa (query-document) mediante el protocolo de prefijos search_query y search_document.
- Similitud semantica textual y parafrasis con el prefijo paraphrase aplicado a ambos lados.
- Clasificacion y clustering de textos con prefijos dedicateados: categorize, categorize_sentiment y categorize_topic.
- Inferencia de relacion textual (NLI / entailment) con el prefijo categorize_entailment, validado en la tarea TERRa.
- Reranking de candidatos recuperados (RuBQReranking, MIRACLReranking).
- Multilingue limitado a ruso e ingles; el grueso de la evaluacion publicada es en ruso.
- No soporta generacion de texto, tool calling, function calling, uso agentico, vision, audio ni modo thinking: es exclusivamente un encoder de representaciones.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) sobre corpus en ruso: indexar fragmentos con el prefijo search_document y consultar con search_query. Limitacion practica: cada fragmento debe caber en 512 tokens, por lo que hay que trocear los documentos.
- Busqueda semantica interna en bases de conocimiento y documentacion tecnica en ruso, aprovechando que el protocolo de prefijos es identico al de FRIDA/BERTA y permite sustituir el encoder sin reescribir el pipeline de indexacion.
- Deduplicacion y agrupamiento de noticias o titulares: embeddings de 768 dimensiones y clustering sobre titulares (HeadlineClassification obtuvo 84,4, el mejor resultado del modelo en MTEB).
- Analisis de resenas de producto y opiniones (RuReviewsClassification, 69,5): clasificacion de sentimiento y topicos sobre resenas ya segmentadas.
- Clasificacion de intenciones en asistentes conversacionales en ruso mediante MassiveIntentClassification (61,6) y MassiveScenarioClassification (73,0); el modelo no genera respuestas, solo etiqueta la intencion.
- Moderacion y filtrado de contenido sensible con SensitiveTopicsClassification (26,9) e InappropriatenessClassification (61,9); los valores son bajos, por lo que solo es viable como senal auxiliar dentro de un ensemble.
- Reranking de resultados de un buscador de primera etapa en pipelines rusos (RuBQReranking, 66,3), donde el coste de 44M parametros permite puntuar cientos de candidatos por consulta.
- Agrupamiento de articulos cientificos rusos por area tematica (RuSciBenchGRNTIClusteringP2P, 60,6; RuSciBenchOECDClusteringP2P, 51,8) para navegacion o triaje bibliografico.

## Benchmarks y rendimiento

Resultados oficiales en MTEB(rus, v1.1), ejecutados con mteb==2.20.5, 23/23 tareas completadas, sin omisiones ni reponderaciones. Las columnas de referencia provienen de las entregas de esos modelos al leaderboard (embeddings-benchmark/results).

| Tarea | kenga-embed-z4 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 46,9 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 84,4 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 61,9 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 61,7 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 61,6 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 73,0 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 69,5 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 63,9 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 49,9 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 53,8 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 26,9 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 46,4 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 60,6 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 51,8 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 55,3 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 66,3 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 48,8 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 40,7 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 49,9 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 41,4 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 61,6 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 68,9 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 53,7 | 65,3 | 61,1 | 66,1 | 64,6 |
| Classification (media) | 63,6 | 76,7 | 71,2 | 59,8 | 55,0 |
| MultilabelClassification (media) | 40,3 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 52,9 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 55,3 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 57,6 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 44,0 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 61,4 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 56,5 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 53,6 | 73,1 | 67,9 | 56,5 | 52,6 |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas en ingles, ni para MMLU, HumanEval o GSM8K (el modelo no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (pesos de 177 MB mas activaciones); en fp16 los pesos bajan a unos 88 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Se puede ejecutar en A100, H100, RTX 4090, RTX 3060 o GTX 1650 sin cuello de botella por memoria; el limite practico es la latencia, no la VRAM.
- Inferencia en CPU: viable, dado el tamano (8 capas, d=768, 512 tokens). La model card indica explicitamente que device="cuda" y cpu funcionan.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: carga directa con PyTorch importando modeling_kenga_embed_v2.py (dependencias: torch y sentencepiece). No se documenta integracion con vLLM, TGI, Ollama ni llama.cpp, y el uso requiere codigo propio, por lo que el cargador estandar de sentence-transformers no lo cubre tal cual pese a que pipeline_tag sea sentence-similarity. Tampoco se publican pesos GGUF, ONNX ni cuantizados.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media MTEB(rus v1.1, tareas) | Media leaderboard | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| kenga-embed-z4 | 44,2 M | 512 | 56,5 | 53,6 | MIT | HuggingFace (0 descargas), codigo de entrenamiento no publico |
| USER2-small-34M | 34 M | no disponible | 58,5 | 56,5 | no disponible | leaderboard de MTEB(rus) |
| rubert-tiny-turbo-29M | 29 M | no disponible | 53,7 | 52,6 | no disponible | leaderboard de MTEB(rus) |
| BERTA-128M | 128 M | no disponible | 69,4 | 67,9 | no disponible | HuggingFace (sergeyzh/BERTA) |
| Giga-Embeddings-instruct-480M | 480 M | no disponible | 74,2 | 73,1 | no disponible | leaderboard de MTEB(rus) |

Lectura de la comparativa: frente a los encoders rusos de 30-40M, el modelo queda 2,0 puntos por debajo de USER2-small-34M (que ademas es mas pequeno) y 2,8 por encima de rubert-tiny-turbo-29M en media simple de tareas. Frente a BERTA-128M, del que se destila, queda 12,9 puntos por debajo. Frente a Giga-Embeddings-instruct-480M, el autor reconoce explicitamente que no lo supera, con una brecha de 17,7 puntos en media simple. El punto mas debil de la comparativa es retrieval: 44,0 frente a 60,6 de USER2-small-34M y 48,8 de rubert-tiny-turbo-29M, es decir, pierde frente a ambos en la metrica mas relevante para RAG.

## Limitaciones y advertencias

- Rendimiento: no supera a Giga-Embeddings-instruct-480M en ninguna media de tipo de tarea y pierde frente a encoders mas pequenos en retrieval, la familia de tareas mas habitual en produccion. No debe seleccionarse por tamano sin comprobar retrieval en el dominio propio.
- Retrieval debil: medias de 40,7 en RiaNewsRetrievalHardNegatives.v2, 41,4 en MIRACLRetrievalHardNegatives.v2 y 49,9 en RuBQRetrieval. Con negativos duros el deterioro es acusado.
- MultilabelClassification: 40,3 de media, con SensitiveTopicsClassification en 26,9, valor cercano al azar en una tarea de 11 clases. No es fiable como clasificador autonomo de temas sensibles.
- Alucinacion: al no ser generativo no produce texto, pero si puede devolver recuperaciones o pares de similitud irrelevantes con puntuaciones altas; cualquier pipeline debe anadir un umbral y una etapa de verificacion.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El entrenamiento usa 1,23 M de segmentos sin etiquetas de Wikipedia, dialogos, resenas, titulares e intenciones, por lo que hereda los sesgos de esos corpus (registro enciclopedico, resenas de producto, medios de comunicacion rusos).
- Contexto limitado: 512 tokens con posiciones aprendidas hasta ese maximo. No se puede truncar a mas longitud ni extrapolar; los documentos largos requieren troceado y agregacion manual de embeddings.
- Idiomas: solo ruso e ingles. Toda la evaluacion publicada es MTEB(rus); el rendimiento en ingles no esta cuantificado y por tanto no es verificable.
- Ambiguedad en la model card: se describe la etapa de destilacion como "kenga-embed-z2" con 30.000 pasos, mientras el modelo publicado es z4 y el checkpoint es el paso 58000. Esta incoherencia dificulta reproducir el entrenamiento tal y como se describe.
- Reproducibilidad: los entrenadores PyTorch no estan en el repositorio publico kenga-lang, solo la receta en docs/PROPHETS.md. No es posible reentrenar el modelo a partir de lo publicado.
- Codigo no estandar: el uso requiere importar modeling_kenga_embed_v2.py mediante un import propio o trust_remote_code, lo que introduce dependencia de codigo de un repositorio sin descargas ni validacion independiente.
- Licencia: MIT, permite uso comercial y modificacion, pero el autor no aporta informacion sobre la licencia ni la procedencia de los datos de entrenamiento, lo que traslada al usuario el riesgo de reclamaciones sobre el corpus.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay validacion por terceros, ni pruebas de robustez fuera del benchmark del autor.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-embed-z4
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentacion de la receta y contrato Prophet: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Modelo profesor de la destilacion (BERTA-128M): https://huggingface.co/sergeyzh/BERTA
- Resultados de referencia del leaderboard MTEB: https://github.com/embeddings-benchmark/results
- Resultados crudos de MTEB del modelo: carpeta mteb_results/ del arbol de entrenamiento (no publicada en el repositorio de HuggingFace)

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los unicos resultados obtenidos correspondian a restaurantes y no guardan relacion con kenga-embed-z4.
