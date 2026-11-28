# netprojects/Nemotron-3.5-Embed-1B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-1B-MLX-8bit es una conversión a formato MLX del modelo de embeddings multimodal `nvidia/Nemotron-3.5-Embed-1B-BF16`, publicada por NetProjects para su ejecución en Apple Silicon. El modelo original lo desarrolla NVIDIA y está diseñado para recuperación de información (retrieval): proyecta consultas de texto y documentos (texto o imágenes de página) en un mismo espacio vectorial, de modo que se puede comparar directamente una pregunta textual con el contenido visual de una página escaneada.

El repositorio no modifica la arquitectura ni los pesos más allá de la cuantización: la torre de lenguaje se convierte a 8 bits con cuantización afín y tamaño de grupo 64, mientras que el codificador visual, el proyector, las normalizaciones, el mean pooling y la normalización L2 se mantienen en bf16 o float32 para preservar la fidelidad numérica. El resultado ocupa 2,0 GB y arroja una similitud coseno mínima de 0,9996 frente a la implementación de referencia de NVIDIA en float32.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un modelo de embeddings de 1.554 millones de parámetros con capacidades multimodales en hardware de Apple; por otro, sirve como referencia de cómo una cuantización selectiva (solo la torre de lenguaje) permite conservar la calidad de recuperación casi intacta, con una pérdida de 0,0001 puntos de nDCG@10 en ViDoRe v3 respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje basada en mistral3 + codificador visual + proyector), con pooling y normalización L2 |
| Parametros totales | 1.554.710.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | 8 bits afín, group size 64 (solo torre de lenguaje); vision encoder y proyector en bf16; normas, pooling y L2 en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement v1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder multimodal de recuperación construido sobre `mistralai/Ministral-3-3B-Instruct-2512-BF16` (Apache-2.0) como torre de lenguaje, al que se añade un codificador visual y un proyector que alinean imágenes de página con el espacio de texto. La salida se obtiene mediante mean pooling y normalización L2 calculados en float32, lo que produce vectores ya normalizados listos para similitud coseno. Soporta embeddings Matryoshka, de modo que se pueden truncar las dimensiones (por ejemplo a 1024 o 512) con una degradación controlada del rendimiento.

En esta conversión concreta no se ha reentrenado nada: se parte de la revisión upstream `e24ca1e346bcc53572bd7bdc02b3e8ebf66c197c` y solo se cambia el formato (MLX) y la precisión de la torre de lenguaje. La tokenización es idéntica a la del original en todas las entradas probadas. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card de NVIDIA.

## Capacidades

- Generación de embeddings de texto para recuperación y similitud semántica (pipeline `feature-extraction`).
- Embeddings multimodales: acepta documentos como texto, imagen de página, o combinación de texto e imagen (por ejemplo, una figura con su pie de foto).
- Consultas y documentos se codifican en el mismo espacio vectorial mediante prefijos `query: …` y `passage: …` a través de la plantilla de chat de NVIDIA.
- Soporte de embeddings Matryoshka: truncado de dimensiones (512, 1024, etc.) para reducir coste de almacenamiento y búsqueda.
- Ventana de contexto de hasta 32.768 tokens, adecuada para documentos largos (se han probado documentos de más de 4.000 tokens).
- Soporte de una imagen por documento.
- Servidor local compatible con endpoints estilo OpenAI `/v1/embeddings` y estilo Cohere/Jina `/v1/rerank`, con imágenes en data URL o base64.
- Idiomas: únicamente inglés según la model card.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar páginas de manuales (texto o imágenes escaneadas) y recuperar los fragmentos relevantes para una consulta en lenguaje natural, aprovechando que texto e imagen comparten espacio vectorial.
- Recuperación multimodal en repositorios científicos: indexar figuras, tablas y páginas de PDF junto con sus abstracts, de modo que una pregunta textual pueda recuperar directamente la página que contiene el dato (validado en ViDoRe v3 Computer Science con nDCG@10 de 0,7643).
- Reranking en pipelines RAG: usar el endpoint `/v1/rerank` para reordenar los candidatos devueltos por un retriever léxico o denso de primera etapa, mejorando la precisión final con un coste adicional acotado.
- Asistentes de atención al cliente sobre base documental: indexar FAQs, contratos o manuales de producto y recuperar pasajes relevantes para consultas multi-turno; el contexto de 32.768 tokens permite indexar documentos extensos sin trocear en exceso.
- Búsqueda en archivos digitalizados: procesar escaneos de páginas como imágenes y permitir consultas textuales sobre ellos, útil en archivos históricos, expedientes o documentación legal.
- Deduplicación y clustering semántico de un corpus: calcular embeddings normalizados y agrupar documentos por similitud coseno, usando dimensiones Matryoshka reducidas (512) para abaratar el almacenamiento en bases vectoriales.
- Prototipado local en Apple Silicon: desarrollar y evaluar pipelines de recuperación en un portátil o estación Mac (probado en M5 Max de 128 GB) antes de desplegar en infraestructura con GPU, gracias al consumo de memoria contenido (1,75-3,4 GB en texto).

## Benchmarks y rendimiento

Fidelidad frente a la implementación de referencia de NVIDIA en float32:

| Conjunto de prueba | Entradas | Coseno a NVIDIA (min / media) | Mismo top-1 | Solapamiento top-10 |
|---|---|---|---|---|
| Consultas y abstracts de SciFact | 200 | 0,9997 / 0,9999 | 40/40 | 0,99 |
| Documentos largos (4K+ tokens) e imágenes de página | 52 (3 largos, 8 imágenes) | 0,9996 / 0,9999 | 10/10 | 0,99 |

Recuperación sobre imágenes de página (ViDoRe v3 Computer Science, inglés, 1.360 imágenes, nDCG@10):

| Configuración | nDCG@10 | Recall@100 |
|---|---|---|
| Esta build | 0,7643 | 0,9719 |
| Puntuación publicada de NVIDIA (modelo original, MTEB) | 0,7642 | no disponible |
| Esta build, vectores Matryoshka de 1024 d | 0,7552 | no disponible |
| Esta build, vectores Matryoshka de 512 d | 0,7277 | no disponible |

Recuperación de texto (SciFact, BEIR, conjunto de test completo: 300 consultas, 5.183 abstracts): nDCG@10 de 0,7518 y Recall@100 de 0,96.

Rendimiento de velocidad (documentos por segundo, con otros servidores de modelo detenidos):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 40,32 | 20.404 | 1,75 GB |
| 506 | 16 | 53,32 | 26.978 | 2,09 GB |
| 506 | 64 | 42,38 | 21.445 | 3,4 GB |
| 4.090 | 1 | 3,65 | 14.944 | 2,03 GB |
| 4.090 | 16 | 3,79 | 15.490 | 5,64 GB |
| 4.090 | 64 | 3,73 | 15.275 | 18,9 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,75 GB en inferencia de texto con batch 1 y entradas de 506 tokens; hasta 3,4 GB con batch 64; 2,03 GB con documentos de 4.090 tokens y batch 1; hasta 18,9 GB con batch 64 y documentos largos.
- Hardware de referencia: Apple M5 Max con 128 GB, plataforma en la que se midieron los resultados. El formato MLX está pensado para Apple Silicon (M1 en adelante).
- GPU dedicadas: los datos de rendimiento proporcionados corresponden a Apple Silicon; no se han publicado cifras para A100, H100 o RTX 4090 en esta build. Para GPU NVIDIA sería más directo usar el modelo original en transformers o vLLM.
- Cabe en GPU de consumo: el modelo original de 1,55B parámetros en bf16 requeriría aproximadamente 3,1 GB de pesos, por lo que en teoría cabe en GPUs de consumo con 8 GB o más; esta build MLX de 2,0 GB está orientada a memoria unificada de Apple.
- Opciones de despliegue: MLX con el paquete `nemotron_mlx` (`pip install git+https://github.com/internet-projects/nemotron-retrieval-mlx`), y servidor local integrado con endpoints `/v1/embeddings` y `/v1/rerank` (`python -m nemotron_mlx.server --embed ... --port 8095`). Para el modelo original, transformers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: 40,32 docs/s (20.404 tokens/s) con entradas de 506 tokens y batch 1 en M5 Max; 53,32 docs/s con batch 16. Con documentos de 4.090 tokens, 3,65 docs/s y 14.944 tokens/s con batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-MLX-8bit (esta build) | 1,55B | 32.768 | Sí (texto + imagen de página) | OpenMDW 1.1 | safetensors MLX |
| nvidia/Nemotron-3.5-Embed-1B-BF16 (original) | 1,55B | 32.768 | Sí | OpenMDW 1.1 | safetensors (transformers) |
| Modelos de embeddings de texto de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con alternativas concretas de la misma categoría (por ejemplo, otros modelos de embeddings multimodales o de retrieval), por lo que la comparativa se limita al modelo original y a la categoría general.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está validado y probablemente sea inferior.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; no debe emplearse como LLM.
- Una sola imagen por documento: no admite múltiples imágenes simultáneas en una misma entrada.
- La cuantización a 8 bits introduce una desviación mínima pero medible (coseno mínimo de 0,9996 frente a NVIDIA) y una pérdida de nDCG@10 de 0,0001 en ViDoRe v3 y de 0,0366 al truncar a 512 dimensiones Matryoshka.
- Licencia OpenMDW 1.1: es una licencia "other" que debe revisarse antes de uso comercial; el repositorio incluye el acuerdo y un NOTICE con la dependencia Apache-2.0 de Ministral-3-3B. No se garantiza compatibilidad con todos los usos comerciales sin lectura previa.
- Repositorio de terceros: NetProjects no está afiliado a NVIDIA; la responsabilidad sobre el modelo original recae en NVIDIA.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la recuperación puede devolver pasajes irrelevantes si el corpus es muy distinto del dominio de entrenamiento (inglés, retrieval académico y de páginas).
- Sin datos publicados sobre sesgos del modelo original en la información disponible.
- Rendimiento medido únicamente en Apple M5 Max; no hay cifras para GPU NVIDIA en esta build, por lo que las estimaciones de latencia en otras plataformas no están respaldadas.
- El contexto de 32.768 tokens es amplio, pero el coste de memoria crece de forma marcada con documentos largos y batches grandes (hasta 18,9 GB en el caso medido).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Embed-1B-mlx-8bit
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Repositorio de código: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
- Modelo base de la torre de lenguaje: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
