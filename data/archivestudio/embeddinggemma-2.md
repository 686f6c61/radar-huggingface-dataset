# ArchiveStudio/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal publicado bajo el identificador `ArchiveStudio/embeddinggemma-2` en HuggingFace. La model card atribuye su desarrollo a Google DeepMind y lo presenta como sucesor de EmbeddingGemma 1, construido sobre la arquitectura de Gemma 4. Se trata de un modelo de extracción de características (`feature-extraction`) cuyo objetivo no es generar texto, sino proyectar entradas heterogéneas en un espacio vectorial unificado de 768 dimensiones para tareas de búsqueda semántica, recuperación y clasificación.

El modelo combina un backbone de texto de 270 millones de parámetros (130 M de transformer más 140 M de embedder) con encoders de modalidad cargables de forma selectiva: 170 M para visión y 300 M para audio, hasta un total de 740 M de parámetros (744.371.512 según los pesos en safetensors). Soporta texto (incluido código), imágenes, vídeo y audio, además de combinaciones de estas modalidades, con una ventana de contexto de 8.192 tokens.

Su relevancia actual reside en tres factores: la unificación de cuatro modalidades en un único espacio de embeddings, el uso de Matryoshka Representation Learning (MRL) para truncar vectores a 128, 256 o 512 dimensiones con pérdida mínima de calidad, y un diseño orientado a ejecución en hardware de consumo como portátiles y dispositivos móviles. La licencia declarada es Apache 2.0.

Conviene señalar que el repositorio analizado pertenece a la cuenta `ArchiveStudio`, no a Google, y registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación de terceros sin verificación oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Gemma 4, con atención local/global (proporción 5:1), GQA/MQA y ventana deslizante de 1.024 tokens |
| Parametros totales | 744.371.512 (≈740 M): 130 M backbone + 140 M embedder + 170 M visión + 300 M audio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (más de 100 idiomas, incluido código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de salida nativa | 768 |
| Dimensiones MRL (truncado) | 128, 256, 512 |
| Modalidades de entrada | texto, imagen, vídeo, audio y combinaciones |
| Capas / dimension de modelo | 24 capas / 512 de dimensión de modelo, 2.048 de dimensión oculta |
| Cabezas de atencion | 4 cabezas, 2 KV-heads locales y 1 global |
| Tamano de vocabulario | 262.144 |
| Pooling | mean pooling con capa de proyección 512 → 768 |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un encoder transformer de 24 capas con dimensión de modelo 512 y dimensión oculta 2.048, que emplea atención con query grouping (GQA) y multi-query (MQA): 4 cabezas de atención, 2 KV-heads para la atención local y 1 para la global, en una proporción local:global de 5:1 con ventana deslizante de 1.024 tokens. La función de activación es una FFN con gating y GELU. La representación final se obtiene mediante mean pooling seguida de una proyección lineal de 512 a 768 dimensiones, que es el espacio compartido por todas las modalidades.

El componente de texto (270 M) se complementa con encoders específicos de modalidad que pueden cargarse de forma independiente: 170 M para visión y 300 M para audio. Esta modularidad permite desplegar únicamente las modalidades necesarias y reducir el consumo de memoria cuando solo se trabaja con texto. El modelo incorpora Matryoshka Representation Learning, lo que habilita truncar el vector de 768 dimensiones a 128, 256 o 512 y renormalizarlo, con una reducción de almacenamiento de hasta 6×. También admite prefijos de instrucción ligeros en texto para orientar la representación hacia tareas concretas (búsqueda, clasificación, clustering, similitud semántica).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Generación de embeddings de texto y código en un espacio vectorial de 768 dimensiones, con soporte nativo para truncado MRL a 512, 256 y 128 dimensiones.
- Embeddings de imagen y de documento visual, orientados a recuperación visual y búsqueda de documentos escaneados.
- Embeddings de vídeo, con capacidad de procesar varios minutos de contenido dentro del contexto de 8.192 tokens.
- Embeddings de audio, incluyendo tareas de recuperación por similitud sonora.
- Embeddings multimodales combinados: texto más imagen, texto más audio u otras combinaciones dentro del mismo espacio vectorial.
- Multilingüismo amplio (más de 100 idiomas) sin necesidad de modelos separados por lengua.
- Representaciones dirigidas por tarea mediante prefijos de instrucción en texto.
- Compresión de vectores para almacenamiento en índices a gran escala con impacto reducido en calidad hasta 256 dimensiones.
- No dispone de capacidades generativas, de tool calling ni de razonamiento multi-paso: es un modelo exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica multilingüe en bases documentales: indexar el corpus una sola vez y consultar en cualquiera de los más de 100 idiomas soportados, aprovechando que los vectores de 256 dimensiones reducen el coste de almacenamiento hasta 3× con una caída de 0,95 puntos en MTEB multilingual (60,41 frente a 61,36).
- Recuperación aumentada (RAG) en dispositivos: el backbone de texto de 270 M parámetros permite ejecutar el modelo de embeddings en portátiles o móviles, generando vectores de consulta localmente sin enviar el texto del usuario a un servidor.
- Búsqueda de código en repositorios internos: con 78,68 de NDCG@10 en MTEB code v1, resulta adecuado para indexar documentación técnica, fragmentos de código y respuestas de foros, y para alimentar asistentes de desarrollo con recuperación precisa.
- Búsqueda visual en catálogos de producto o archivos fotográficos: el encoder de visión de 170 M parámetros proyecta imágenes al mismo espacio que las consultas de texto, permitiendo búsquedas del tipo "camisa azul de rayas" sobre un inventario de imágenes.
- Recuperación sobre documentos escaneados y PDF: con 67,84 de NDCG@5 en MMEB v2 VisDoc, es aplicable a digitalización de archivos administrativos o expedientes con texto embebido en imagen.
- Indexación y búsqueda de archivos audiovisuales: la combinación de embeddings de audio (69,54 de MRR@10 en MSEB) y de vídeo (50,67 de Hit@1 en MMEB v2 Video) permite construir buscadores sobre grabaciones, pódcast o videotecas usando consultas textuales.
- Clasificación y clustering de grandes volúmenes de contenido: usar los embeddings como características de entrada para un clasificador ligero o para agrupar tickets de soporte, reseñas o noticias por similitud semántica, sin necesidad de reentrenar un modelo generativo.
- Deduplicación y detección de contenido casi idéntico en corpus multimodales, comparando similitud coseno entre vectores truncados a 128 dimensiones para maximizar el rendimiento del índice.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con el checkpoint de precisión completa y a 768 dimensiones.

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task) | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType) | 64,64 | no disponible |
| Imagen | MMEB v2 - Image | Mean(Task), Hit@1 | 57,28 | no disponible |
| Documento visual | MMEB v2 - VisDoc | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 - Video | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (HuggingFace) | Mean(Task) | 49,39 | no disponible |

Evaluación con truncado de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 (overall) | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completo) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

No se han publicado en la información disponible comparaciones con otros modelos de embeddings multimodales de terceros.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 1,5 GB, coherente con el tamaño del repositorio (1,5 GB) para los 744 M de parámetros.
- Estimación en FP32: en torno a 3 GB solo de pesos, más activaciones.
- Estimación en INT8: alrededor de 0,75 GB; en INT4, en torno a 0,4 GB. No se confirman cuantizaciones publicadas por el autor.
- El autor indica que el modelo está diseñado para ejecutarse en hardware de consumo, incluidos dispositivos móviles y portátiles.
- Carga selectiva de modalidades: usar solo el backbone de texto (270 M) reduce el consumo a una fracción del total; añadir visión suma 170 M y audio 300 M.
- GPU de consumo compatibles: cualquier GPU con 4-8 GB de VRAM debería ser suficiente para inferencia en BF16 con texto e imagen; una RTX 3060 de 12 GB o una RTX 4090 cubren con holgura todos los escenarios multimodales. Para audio, el encoder de 300 M eleva el requisito, pero sigue dentro del rango de GPU de consumo.
- Despliegue en GPU de centro de datos (A100, H100, L40S) es viable, aunque el tamaño del modelo hace que el coste por embedding sea más relevante que la capacidad de memoria.
- Opciones de despliegue confirmadas en la información: `sentence-transformers` y `transformers` (el repositorio incluye la etiqueta `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama, TGI o Text Embeddings Inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | MTEB multilingual v2 | MTEB code v1 | Licencia |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 (este repositorio) | 740 M (744.371.512 reales) | 8.192 tokens | Texto, imagen, vídeo, audio | 61,36 | 78,68 | Apache 2.0 |
| EmbeddingGemma 1 | no disponible en la informacion | no disponible | Texto | 61,15 | 68,76 | no disponible en la informacion |
| Otros modelos de embeddings multimodales de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite una comparación directa con EmbeddingGemma 1, que aparece en la tabla de benchmarks de la propia model card. No se aportan datos de alternativas de terceros de tamaño o alcance comparable, por lo que no es posible establecer una comparativa cuantitativa con otros modelos multimodales de embeddings.

## Limitaciones y advertencias

- El repositorio `ArchiveStudio/embeddinggemma-2` no pertenece a Google: es una publicación de una cuenta de terceros con 0 descargas y 0 likes, sin verificación de integridad ni de procedencia de los pesos.
- La model card enlaza a una licencia de "Gemma 4" bajo la etiqueta Apache 2.0; conviene verificar en el repositorio oficial qué términos se aplican realmente antes de un uso comercial.
- La fecha de creación del repositorio (2026-10-06) y la ausencia de historial de descargas aconsejan tratar los pesos como no auditados.
- Es un modelo de extracción de características: no genera texto ni mantiene conversaciones, y por tanto no admite tool calling ni razonamiento multi-paso.
- Como todo modelo de embeddings, puede producir similitudes engañosas en dominios alejados de sus datos de entrenamiento; no se dispone de información sobre la composición del dataset para estimar sesgos concretos.
- El truncado a 128 dimensiones degrada notablemente las modalidades no textuales (MMEB v2 pasa de 59,01 a 45,65 y MSEB de 69,54 a 56,71); el autor recomienda 128d solo para cargas de trabajo de texto.
- No hay información publicada sobre sesgos demográficos, de género o culturales, ni sobre tasas de alucinación aplicables a un modelo no generativo.
- Los requisitos de latencia y throughput no están documentados, lo que dificulta planificar un despliegue en producción a gran escala.
- No se confirma soporte de runtimes habituales de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de escalado.
- Los resultados de benchmarks son los reportados por el autor del modelo en la model card; no se han reproducido de forma independiente en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/embeddinggemma-2
- Repositorio de referencia citado en la model card: https://huggingface.co/google/embeddinggemma-2
- GitHub de la familia Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación de Google AI for Developers: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia citada: https://ai.google.dev/gemma/docs/gemma_4_license
- Banner del modelo: https://ai.google.dev/gemma/images/embeddinggemma2_banner.png
