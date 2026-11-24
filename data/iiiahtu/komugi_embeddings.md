# IIIaHTu/komugi_embeddings

## Resumen
Komugi Embeddings es un modelo de embeddings de frases en ruso desarrollado por el usuario IIIaHTu, publicado en Hugging Face bajo licencia MIT. Se trata de un encoder compacto derivado de cointegrated/rubert-tiny2 (BERT de tres capas y 312 dimensiones de representacion) que se ha destilado a partir del modelo FRIDA de ai-forever para tareas de similitud semantica, recuperacion de informacion y clasificacion de textos en ruso.

El modelo resuelve el problema de obtener representaciones vectoriales de alta calidad para busqueda semantica y comparacion de textos en ruso con un coste computacional muy bajo: solo 29,2 millones de parametros y un repositorio de 0,1 GB. Esto lo hace atractivo para despliegues en CPU, sistemas embebidos o pipelines de recuperacion a gran escala donde un encoder grande resultaria prohibitivo.

Su relevancia actual radica en que compite en la parte alta del ranking MTEB(rus, v1.1) pese a su tamano reducido: obtiene un 62,97 de media en tareas, practicamente empatado con sergeyzh/rubert-mini-frida (63,02) y por delante de deepvk/USER-bge-m3 (62,61), modelos con arquitecturas mas pesadas. Emplea prefijos diferenciados para consulta, documento y parafrasis, y soporta hasta 512 tokens de contexto incluyendo el prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, 3 capas) |
| Parametros totales | 29.193.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo prefijo) |
| Tipos de cuantizacion | no disponible (safetensors en FP32/FP16; compatible con cuantizacion estandar de sentence-transformers) |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 312 |
| Pooling | Media de representaciones de tokens con mascara + normalizacion L2 |
| Modelo base | cointegrated/rubert-tiny2 |
| Modelo profesor (destilacion) | ai-forever/FRIDA |

## Arquitectura y entrenamiento
Komugi Embeddings es un encoder BERT de tres capas inicializado con los pesos de cointegrated/rubert-tiny2 y entrenado mediante destilacion de embeddings usando FRIDA (ai-forever) como modelo profesor. La representacion de frase se obtiene promediando las representaciones de tokens con mascara de atencion y aplicando normalizacion L2, lo que produce vectores de 312 dimensiones listos para similitud coseno. La configuracion publicada incluye prefijos especificos para consulta y documento, y un prefijo `categorize` por defecto para `encode()`; para tareas de parafrasis se puede usar `prompt_name="paraphrase"`.

El corpus de destilacion combina fragmentos de Wikipedia, texto web (fineweb-2), noticias (Lenta, Gazeta, XLSum ruso, Telegram de noticias), resenas (WB feedbacks, Kinopoisk, RuReviews), discusiones (Pikabu), pares pregunta-respuesta (SberQuAD, Yandex Q), parafrasis (ru-paraphrase-NMT-Leipzig) y NLI (nli-rus-translated-v2021). Para las tareas de evaluacion de CEDR, Sensitive Topics, RuSciBench, RuSTSBenchmark y TERRa se usaron solo las particiones de train; para Georeview, Headline, Inappropriateness, RuReviews y Kinopoisk se usaron train y validation. Las etiquetas de esas tareas no se emplearon como objetivo de entrenamiento y se aplico filtrado de coincidencias textuales contra los splits de evaluacion en el conjunto original de 17 tareas.

## Capacidades
- Generacion de embeddings de frases en ruso para similitud semantica y busqueda.
- Recuperacion de informacion (retrieval) densa, con soporte de prefijos distintos para consulta y documento.
- Reranking de resultados de busqueda (evaluado en MIRACL y RuBQ).
- Clasificacion de textos por similitud con etiquetas o prototipos (evaluado en tareas de clasificacion de MTEB ruso).
- Agrupamiento (clustering) de documentos por similitud de embeddings.
- Deteccion de parafrasis y similitud de oraciones (STS), con prompt especifico `paraphrase`.
- No soporta generacion de texto, tool calling, agentes ni vision: es exclusivamente un encoder de embeddings.

## Casos de uso
- Busqueda semantica en corpus rusos: indexar documentos con `encode_document()` y consultar con `encode_query()` permite construir un motor de busqueda densa sobre articulos, noticias o documentacion tecnica en ruso con un coste de inferencia minimo.
- Deduplicacion y agrupamiento de noticias: generar embeddings de titulares y cuerpos de noticia para agrupar eventos similares o detectar republicaciones, aprovechando las buenas puntuaciones en HeadlineClassification (87,71) y clustering P2P.
- Moderacion de contenido y deteccion de temas sensibles: usar similitud contra prototipos de categorias para clasificar reseñas o comentarios, con un rendimiento aceptable en InappropriatenessClassification (69,10) y SensitiveTopicsClassification (35,64, el punto mas debil).
- Reranking en pipelines RAG: reordenar los resultados de un retriever inicial (por ejemplo BM25) usando similitud coseno de embeddings; el modelo rinde bien en MIRACLReranking (59,98) y RuBQReranking (71,32).
- Analisis de resenas de productos y cine: clasificar sentimiento o tematica de resenas de marketplaces y plataformas de cine (KinopoiskClassification 60,35, RuReviewsClassification 70,76) para dashboards de opinion.
- Busqueda de preguntas frecuentes y atencion al cliente: emparejar consultas de usuarios con respuestas de una base de conocimiento mediante similitud de embeddings, con latencia muy baja al ser un modelo de 29 M de parametros ejecutable en CPU.
- Filtrado y clasificacion cientifica: categorizar articulos o propuestas por area tematica usando RuSciBenchGRNTIClassification (62,87) y RuSciBenchOECDClassification (48,48) como referencia de rendimiento esperado.

## Benchmarks y rendimiento
Evaluacion local sobre las 23 tareas de MTEB(rus, v1.1) con MTEB 2.27.18. Escala 0-100.

| Modelo | Mean (Task) | Mean (TaskType) |
|---|---:|---:|
| sergeyzh/rubert-mini-frida | 63,02 | 61,67 |
| IIIaHTu/komugi_embeddings | 62,97 | 61,25 |
| deepvk/USER-bge-m3 | 62,61 | 62,04 |
| deepvk/USER2-small | 57,30 | 55,05 |
| sergeyzh/rubert-tiny-turbo | 53,56 | 52,42 |
| cointegrated/rubert-tiny2 | 42,53 | 39,50 |

Resultados por tarea:

| Tarea | Puntuacion |
|---|---:|
| GeoreviewClassification | 49,00 |
| HeadlineClassification | 87,71 |
| InappropriatenessClassification | 69,10 |
| KinopoiskClassification | 60,35 |
| MassiveIntentClassification | 64,75 |
| MassiveScenarioClassification | 71,78 |
| RuReviewsClassification | 70,76 |
| RuSciBenchGRNTIClassification | 62,87 |
| RuSciBenchOECDClassification | 48,48 |
| GeoreviewClusteringP2P | 66,57 |
| RuSciBenchGRNTIClusteringP2P | 61,93 |
| RuSciBenchOECDClusteringP2P | 52,42 |
| CEDRClassification | 53,25 |
| SensitiveTopicsClassification | 35,64 |
| TERRa | 58,77 |
| MIRACLReranking | 59,98 |
| RuBQReranking | 71,32 |
| MIRACLRetrievalHardNegatives.v2 | 57,99 |
| RiaNewsRetrievalHardNegatives.v2 | 69,70 |
| RuBQRetrieval | 63,89 |
| RUParaPhraserSTS | 74,13 |
| STS22 | 59,44 |
| RuSTSBenchmarkSTS | 78,55 |

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 (29,2 M de parametros); en FP16 alrededor de 60 MB de pesos. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Funciona tambien en CPU con throughput alto para lotes pequenos.
- Cabe en GPU consumer: si, en todas las generaciones recientes (GTX 1050 en adelante, RTX 20/30/40, integradas con suficiente memoria compartida).
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (el repo esta marcado como compatible con endpoints), ONNX Runtime y conversiones a GGUF para llama.cpp/Ollama no estan documentadas en la model card.
- Latencia y throughput: no se han publicado mediciones especificas; por el tamano del modelo se espera latencia de milisegundos por lote en CPU moderna y throughput de miles de frases por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mean MTEB(rus) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IIIaHTu/komugi_embeddings | 29,2 M | 512 | 62,97 | MIT | Hugging Face |
| sergeyzh/rubert-mini-frida | no disponible | no disponible | 63,02 | no disponible | Hugging Face |
| deepvk/USER-bge-m3 | no disponible | no disponible | 62,61 | no disponible | Hugging Face |
| deepvk/USER2-small | no disponible | no disponible | 57,30 | no disponible | Hugging Face |
| cointegrated/rubert-tiny2 | no disponible | no disponible | 42,53 | no disponible | Hugging Face |

Komugi ofrece un rendimiento medio casi identico al mejor de la comparativa (diferencia de 0,05 puntos) con un modelo de solo tres capas, y supera en mas de 20 puntos al modelo base del que parte (rubert-tiny2). En Mean (TaskType) queda ligeramente por detras de deepvk/USER-bge-m3 (61,25 frente a 62,04), lo que sugiere un comportamiento algo menos equilibrado entre tipos de tarea.

## Limitaciones y advertencias
- Solo soporta ruso; no esta entrenado ni evaluado en otros idiomas.
- Contexto limitado a 512 tokens incluyendo el prefijo, insuficiente para documentos largos sin troceado previo.
- Rendimiento debil en clasificacion de temas sensibles (SensitiveTopicsClassification 35,64) y en tareas cientificas OECD (48,48); no es adecuado como unico clasificador en esos dominios.
- Riesgo de sesgos heredados de los corpus de entrenamiento (Wikipedia, noticias, resenas, redes sociales rusas) y del modelo profesor FRIDA.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero la similitud de embeddings puede producir falsos positivos en pares semanticamente proximos pero logicamente distintos.
- La licencia MIT cubre la contribucion de Komugi; la procedencia de los pesos base se detalla en el archivo NOTICE del repositorio y conviene revisarla antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa independiente de los resultados de MTEB reportados por el autor.
- No se documentan conversiones a GGUF ni cuantizaciones especificas; para despliegue en llama.cpp habria que realizar la conversion por cuenta propia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/IIIaHTu/komugi_embeddings
- Modelo base: https://huggingface.co/cointegrated/rubert-tiny2
- Modelo profesor FRIDA: https://huggingface.co/ai-forever/FRIDA
- MTEB ( Massive Text Embedding Benchmark): https://github.com/embeddings-benchmark/mteb
- Dataset CEDR: https://huggingface.co/datasets/ai-forever/cedr-classification
- Dataset RuSTSBenchmark: https://huggingface.co/datasets/ai-forever/ru-stsbenchmark-sts
- Dataset TERRa: https://huggingface.co/datasets/ai-forever/terra-pairclassification
- Dataset MIRACL: https://huggingface.co/datasets/mteb/miracl
- Documentacion de sentence-transformers: https://www.sbert.net/
