# FrontiersMind/EmbeddingNandi-150M

## Resumen

EmbeddingNandi-150M es un modelo de embeddings de frases (sentence embeddings) desarrollado por FrontiersMind, construido sobre el encoder bidireccional NandiBERT-150M. Su funcion es convertir texto en vectores densos de 768 dimensiones para busqueda semantica, generacion aumentada por recuperacion (RAG), clustering, deduplicacion y puntuacion de similitud. Es relevante porque cubre de forma nativa ingles, 13 lenguas indicas en escritura propia, texto indico romanizado (como hinglish) y arabe, indonesio y malayo en un unico modelo compacto de 146 millones de parametros, algo poco habitual en modelos de este tamano.

El modelo destaca por su ventana de contexto de 16.384 tokens, que permite embeber documentos largos en una sola pasada sin troceado, y por su vocabulario multilingue de 100.000 tokens compartido con la familia NandiBERT. Incorpora Matryoshka Representation Learning, de modo que los vectores pueden recortarse a 512, 256 o 128 dimensiones con perdida controlada de calidad, lo que abarata el almacenamiento y la busqueda en produccion.

En los benchmarks publicados por el autor, EmbeddingNandi-150M obtiene 65,85 en MTEB(eng, v2), 75,80 en MTEB(Code, v1) y 74,33 en MTEB(Indic, v1), con una media de 71,99 en las tres, la mejor de su categoria de tamano segun la model card. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (NandiBERT-150M): 28 capas, 768 de dimension oculta, GQA con 6 cabezas de consulta y 2 de clave-valor, QK-norm, SwiGLU, embedding factorizado de rango 192 |
| Parametros totales | 146.081.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (la model card no detalla cuantizaciones publicadas; al ser safetensors, admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | Ingles, hindi, marati, punyabi, tamil, telugu, canares, malabar, bengali, guyarati, asamés, oriya, urdu, nepalí, arabe, indonesio, malayo (ademas de texto indico romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 28 capas y 768 dimensiones ocultas, derivado de NandiBERT-150M. Usa grouped-query attention con 6 cabezas de consulta y 2 de clave-valor, normalizacion QK y activacion SwiGLU, disenado para inferencia rapida y servicio de bajo coste. El vocabulario de 100.000 tokens se almacena como embedding factorizado de rango 192, lo que reduce el numero de parametros dedicados a la tabla de vocabulario. La salida es un vector de 768 dimensiones obtenido por mean pooling sobre todos los tokens (incluido el prompt de tarea) seguido de normalizacion L2, y la similitud se calcula con coseno.

El entrenamiento es contrastivo sobre NandiBERT-150M en tres etapas: primero pares de texto debilmente supervisados con lotes muy grandes (16.384), despues un conjunto de pares curado y finalmente ajuste fino sobre datos etiquetados de retrieval, codigo, clasificacion, clustering, similitud y bitext en ingles y lenguas indicas, con hasta tres negativos duros minados por consulta y perdida CoSENT para los datos de similitud. Se aplica perdida Matryoshka a 768, 512, 256 y 128 dimensiones. El modelo acepta prompts de tarea breves en el formato de EmbeddingGemma (por ejemplo `task: search result | query: `) para orientar el embedding hacia busqueda, busqueda de codigo, clasificacion, clustering o similitud.

## Capacidades

- Generacion de embeddings de frases y documentos con salida de 768 dimensiones, recortable a 512, 256 o 128 dimensiones mediante Matryoshka.
- Busqueda semantica y recuperacion de informacion multilingue en ingles, 13 lenguas indicas, arabe, indonesio y malayo.
- Soporte nativo de texto indico romanizado (hinglish y similares) gracias al vocabulario compartido de NandiBERT.
- Embestido de documentos largos de hasta 16.384 tokens en una sola pasada, sin troceado.
- Prompts de tarea para especializar el embedding en busqueda, busqueda de codigo, clasificacion, clustering y similitud.
- Puntuacion de similitud semantica y deduplicacion de textos.
- Capacidad de bitext mining (alineacion de frases entre idiomas) segun los resultados de MTEB(Indic, v1).
- Integracion con Sentence Transformers y con `transformers` de Hugging Face; compatible con endpoints.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica multilingue en produccion: el modelo indexa documentos y consultas en ingles e idiomas indicos con un unico encoder, de modo que un buscador corporativo puede atender usuarios que consultan en hindi y recuperar documentos en tamil sin pipelines separados por idioma.
- RAG sobre documentacion larga: con 16.384 tokens de contexto, permite embeber manuales, contratos o articulos completos en una sola pasada, reduciendo la perdida de contexto que introduce el troceado y mejorando la recuperacion de pasajes relevantes.
- Deduplicacion y clustering de corpus indicos: los vectores de 768 dimensiones (o recortados a 256/128 para ahorrar memoria) permiten agrupar noticias, resenas o registros duplicados en datasets multilingues con texto en escritura nativa y romanizada.
- Moderacion y clasificacion de contenido: usando el prompt de tarea de clasificacion, el modelo genera embeddings que alimentan clasificadores ligeros para etiquetar tickets, comentarios o incidencias en varios idiomas sin entrenar un encoder por lengua.
- Busqueda de codigo en repositorios: con 75,80 en MTEB(Code, v1), es adecuado para indexar fragmentos de codigo y documentacion tecnica y recuperar ejemplos relevantes en asistentes de desarrollo o sistemas de soporte interno.
- Sistemas de recomendacion y similitud de items: la similitud coseno sobre embeddings normalizados permite calcular afinidad entre articulos, preguntas frecuentes o perfiles textuales con latencia baja gracias al tamano compacto del modelo.
- Alineacion de bitext y memorias de traduccion: la capacidad de bitext mining (84,36 en esa tarea dentro de MTEB(Indic, v1)) lo hace util para emparejar frases entre ingles y lenguas indicas en pipelines de creacion de corpus paralelos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con la libreria MTEB 2.26.19, a longitud maxima de 16.384 tokens y computo en float32. Media de tareas en MTEB(eng, v2) (41 tareas), MTEB(Code, v1) (12 tareas) y MTEB(Indic, v1) (20 tareas), para modelos de hasta unos 270M de parametros.

| Modelo | MTEB(eng, v2) | MTEB(Code, v1) | MTEB(Indic, v1) | Media (las tres) |
|---|---|---|---|---|
| EmbeddingNandi-150M (146M) | 65,85 | 75,80 | 74,33 | 71,99 |
| UltraBERT-Embed-150M (151M) | 67,24 | 73,30 | 42,16 | 60,90 |
| granite-embedding-english-r2 (149M) | 62,84 | 57,22 | 32,85 | 50,97 |
| granite-embedding-125m-english (125M) | 62,10 | 53,30 | 34,46 | 49,95 |
| bekko-embedding-v1-a25m (123M) | 62,25 | 60,27 | 65,43 | 62,65 |
| multilingual-e5-small (118M) | 59,69 | 53,53 | 62,15 | 58,46 |
| harrier-oss-v1-270m (268M) | 67,19 | 62,98 | 69,81 | 66,66 |

Desglose de MTEB(Indic, v1) por tipo de tarea:

| Modelo | Media (20) | Bitext Mining (2) | Classification (12) | Clustering (1) | Pair Classification (1) | Reranking (1) | Retrieval (2) | STS (1) |
|---|---|---|---|---|---|---|---|---|
| EmbeddingNandi-150M (146M) | 74,33 | 84,36 | 72,19 | 54,32 | 82,57 | 86,07 | 87,40 | 53,95 |
| UltraBERT-Embed-150M (151M) | 42,16 | 16,91 | 49,62 | 3,41 | 56,44 | 65,18 | 43,81 | 1,32 |
| granite-embedding-english-r2 (149M) | 32,85 | 3,27 | 42,77 | 2,53 | 51,89 | 49,27 | 17,21 | -0,86 |
| granite-embedding-125m-english (125M) | 34,46 | 5,54 | 44,68 | 3,04 | 51,75 | 49,23 | 17,94 | 2,07 |
| bekko-embedding-v1-a25m (123M) | 65,43 | 75,25 | 64,45 | 27,83 | 69,64 | 83,66 | 76,96 | 49,63 |

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 0,6 GB solo para pesos (146M parametros); en float16, unos 0,3 GB; en int8, unos 0,15 GB. A esto hay que sumar memoria para activaciones y el lote, que crece con la longitud de contexto de hasta 16.384 tokens.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 4090, RTX 4080 o RTX 3090 con 16-24 GB permite lotes grandes y contexto completo. Para servicio de alto rendimiento, A100 o H100 con vLLM/TEI permiten mayor throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 8 GB o mas, e incluso en GPU integradas para lotes pequenos.
- Opciones de despliegue: Sentence Transformers, `transformers` (requiere `trust_remote_code` por el codigo personalizado del encoder), Text Embeddings Inference (TEI) de Hugging Face, y servidores de embeddings propios; el modelo no es generativo, por lo que vLLM/llama.cpp no son la via habitual salvo soporte especifico de embeddings.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano (146M) y contexto corto por defecto, se espera latencia de milisegundos por lote en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB(eng, v2) | MTEB(Indic, v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmbeddingNandi-150M | 146M | 16.384 | 65,85 | 74,33 | Apache-2.0 | Hugging Face |
| UltraBERT-Embed-150M | 151M | no disponible | 67,24 | 42,16 | no disponible | Hugging Face |
| bekko-embedding-v1-a25m | 123M | no disponible | 62,25 | 65,43 | no disponible | Hugging Face |
| multilingual-e5-small | 118M | 512 (tipico) | 59,69 | 62,15 | MIT (segun modelo original) | Hugging Face |
| harrier-oss-v1-270m | 268M | no disponible | 67,19 | 69,81 | no disponible | Hugging Face |

EmbeddingNandi-150M ofrece el mejor equilibrio en la media de las tres suites (71,99) y una ventaja clara en indico y codigo frente a modelos de tamano similar, a costa de ceder 1,4 puntos en MTEB(eng, v2) frente a UltraBERT-Embed-150M.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no responde preguntas ni genera texto.
- Riesgo de alucinacion no aplica directamente, pero la recuperacion puede devolver pasajes irrelevantes si los prompts de tarea no se usan correctamente o si el dominio difiere del entrenamiento.
- Los resultados de benchmarks son los publicados por el autor; no hay verificacion independiente en la informacion disponible.
- Cobertura limitada a los 17 idiomas listados; el rendimiento en otras lenguas no esta documentado.
- La evaluacion en MTEB(Indic, v1) de algunos competidores la realizo el propio autor con su configuracion, lo que puede introducir sesgo comparativo.
- Requiere `trust_remote_code` por el codigo personalizado del encoder, lo que implica revisar el codigo antes de desplegar en entornos sensibles.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion y revisar las dependencias de codigo personalizado.
- El contexto de 16.384 tokens aumenta el coste de memoria en lotes grandes; para produccion conviene ajustar la longitud maxima al caso de uso.
- Modelo muy reciente (creado en noviembre de 2026) con cero descargas y cero likes en Hugging Face en el momento de la consulta: ecosistema y soporte comunitario aun limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/EmbeddingNandi-150M
- Modelo base NandiBERT-150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Version mayor EmbeddingNandi-450M: https://huggingface.co/FrontiersMind/EmbeddingNandi-450M
- Organizacion en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub de FrontiersMind: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/
- Web oficial: https://www.frontiersmind.ai/
- Libreria MTEB: https://github.com/embeddings-benchmark/mteb
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
