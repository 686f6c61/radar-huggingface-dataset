# Alibaba-NLP/gte-large-en-v1.5

## Resumen

gte-large-en-v1.5 es un modelo de embeddings de texto (feature extraction) desarrollado por Alibaba-NLP, el equipo de investigación en procesamiento de lenguaje natural de Alibaba. Pertenece a la familia GTE (General Text Embeddings) y está diseñado para convertir texto en vectores densos de 1024 dimensiones utilizables en tareas de similitud semántica, recuperación de información, clasificación, clustering y reranking. Con 434.139.136 parámetros, es la variante "large" de la familia y está optimizado para inglés.

El modelo resuelve el problema de representar frases, párrafos y documentos largos como embeddings de alta calidad para sistemas de búsqueda semántica y RAG (retrieval-augmented generation). Su principal diferenciador frente a alternativas de la época es una ventana de contexto de 8192 tokens, muy superior a los 512 tokens habituales en modelos BERT-like, lo que permite indexar pasajes largos sin truncamiento. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Es relevante ahora porque combina buen rendimiento en MTEB, contexto largo, licencia permisiva y disponibilidad en formatos estándar (safetensors y ONNX), además de compatibilidad con transformers.js para inferencia en navegador. El repo ocupa 6.0 GB y acumula más de 1.4 millones de descargas en Hugging Face, lo que lo sitúa entre los embeddings de referencia para pipelines de recuperación en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia GTE, tipo BERT-like con atención extendida) |
| Parametros totales | 434.139.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp32/fp16; ONNX disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT-like adaptado para embeddings, con 434 millones de parámetros y una dimensionalidad de salida de 1024. La familia GTE se apoya en las contribuciones descritas en los papers referenciados (arXiv:2308.03281 sobre GTE y arXiv:2407.19669 sobre la versión 1.5), que introducen mejoras en el entrenamiento de embeddings para contexto largo y en la calidad de las representaciones. La longitud de contexto de 8192 tokens se consigue mediante técnicas de extensión de atención (RoPE o mecanismos equivalentes) descritas en la documentación del autor, aunque los detalles exactos de implementación no están disponibles en la información proporcionada.

Los datos de entrenamiento incluyen el dataset allenai/c4 según los metadatos de la model card, junto con otros corpus de pares texto-texto no detallados en la información disponible. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de embeddings). La model card reporta resultados en MTEB que sugieren entrenamiento con objetivos contrastivos sobre pares positivos/negativos, práctica estándar en esta familia.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases, párrafos y documentos de hasta 8192 tokens.
- Similitud semántica entre pares de textos (sentence-similarity).
- Recuperación de información (retrieval) con indexación y búsqueda semántica.
- Clasificación de texto mediante embeddings como features (clasificación de sentimiento, intención, temas).
- Clustering de documentos por similitud semántica.
- Reranking de resultados de búsqueda.
- Soporte de inferencia en navegador vía transformers.js (tag transformers.js).
- Compatibilidad con endpoints de Hugging Face (endpoints_compatible).
- Compatibilidad con despliegue en Azure (tag deploy:azure).
- Solo inglés: no se declara soporte multilingüe.
- No dispone de tool calling, function calling ni capacidades de agente (no es un modelo generativo).
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales, RFCs y guías con contextos de hasta 8192 tokens evita truncar secciones largas, y los vectores de 1024 dimensiones permiten usar FAISS, Qdrant o pgvector con buena precisión.
- RAG sobre bases de conocimiento internas: usar el modelo como encoder de pasajes y consultas en pipelines de retrieval-augmented generation en inglés, con reranking posterior sobre los top-k recuperados.
- Deduplicación y clustering de artículos: agrupar noticias, tickets o papers por similitud semántica usando los embeddings como entrada a HDBSCAN o k-means, aprovechando el buen rendimiento en tareas de clustering de MTEB.
- Moderación y clasificación de reseñas: entrenar un clasificador ligero (regresión logística o MLP) sobre los embeddings para detectar spam, toxicidad o intención en reseñas de producto, apoyándose en los resultados de AmazonPolarity (93,97 % de accuracy).
- Enrutamiento de tickets de soporte: calcular la similitud entre la consulta del usuario y una base de respuestas canónicas para dirigir el ticket al equipo correcto, con latencia baja al ser un encoder de 434 M parámetros.
- Búsqueda en aplicaciones web sin backend pesado: desplegar el modelo en formato ONNX o transformers.js para generar embeddings directamente en el navegador, útil en demos y herramientas internas con requisitos de privacidad.
- Reranking de resultados de motores de búsqueda: puntuar pares consulta-documento con similitud coseno para reordenar los top-N de un retrieval inicial, aprovechando el rendimiento en AskUbuntuDupQuestions (MAP 63,13).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MTEB, split test). No verificados por un tercero.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | AmazonCounterfactualClassification (en) | accuracy | 73,01 |
| Classification | AmazonCounterfactualClassification (en) | ap | 35,05 |
| Classification | AmazonCounterfactualClassification (en) | f1 | 66,71 |
| Classification | AmazonPolarityClassification | accuracy | 93,97 |
| Classification | AmazonPolarityClassification | ap | 90,60 |
| Classification | AmazonPolarityClassification | f1 | 93,96 |
| Classification | AmazonReviewsClassification (en) | accuracy | 54,20 |
| Classification | AmazonReviewsClassification (en) | f1 | 53,80 |
| Classification | Banking77Classification | accuracy | 87,33 |
| Classification | Banking77Classification | f1 | 87,29 |
| Retrieval | ArguAna | map_at_10 | 64,30 |
| Retrieval | ArguAna | ndcg_at_10 | 72,11 |
| Retrieval | ArguAna | recall_at_10 | 96,23 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 44,45 |
| Retrieval | CQADupstackAndroidRetrieval | mrr_at_10 | 50,85 |
| Clustering | ArxivClusteringP2P | v_measure | 48,47 |
| Clustering | ArxivClusteringS2S | v_measure | 43,39 |
| Clustering | BiorxivClusteringP2P | v_measure | 40,58 |
| Clustering | BiorxivClusteringS2S | v_measure | 37,94 |
| Reranking | AskUbuntuDupQuestions | map | 63,13 |
| Reranking | AskUbuntuDupQuestions | mrr | 75,93 |
| STS | BIOSSES | cos_sim_spearman | 85,39 |
| STS | BIOSSES | cos_sim_pearson | 87,85 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (434 M parámetros × 4 bytes); en fp16 alrededor de 0,9 GB; en int8 alrededor de 0,45 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 con batches moderados; A100, H100, L40S o RTX 4090 sobredimensionadas para este modelo, útiles solo para alto throughput por batch.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 y similares; también en GPUs de 4-8 GB con fp16.
- Opciones de despliegue: transformers (PyTorch), sentence-transformers, ONNX Runtime, transformers.js (navegador), Hugging Face Inference Endpoints, vLLM (soporte de modelos de embeddings), TGI (con tarea de embeddings), Ollama (no disponible de forma nativa en la información proporcionada), llama.cpp (no disponible: no hay GGUF publicados en la información proporcionada).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 434 M parámetros con contexto de 8192 tokens, la latencia crece de forma cuadrática con la longitud de entrada, por lo que conviene limitar el tamaño de los pasajes en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alibaba-NLP/gte-large-en-v1.5 | 434 M | 8192 | 1024 | Apache 2.0 | HF, ONNX, transformers.js |
| BAAI/bge-large-en-v1.5 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| intfloat/e5-large-v2 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone en la información proporcionada de datos verificados de parámetros, contexto, rendimiento ni licencia de los modelos comparables; por tanto, la comparativa cuantitativa no está disponible. Los modelos citados son alternativas habituales de la misma categoría (embeddings en inglés) pero sus cifras no deben tomarse de esta ficha.

## Limitaciones y advertencias

- Solo inglés: no se declara ni se ha entrenado para otros idiomas; su uso en castellano producirá embeddings de menor calidad.
- Riesgo de sesgo: al entrenarse sobre corpus web (allenai/c4 entre otros), puede heredar sesgos demográficos, culturales y de dominio presentes en esos datos.
- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling; usarlo como si fuera un LLM es un error de diseño.
- Contexto largo con coste cuadrático: entradas de 8192 tokens encarecen la inferencia; conviene trocear documentos en pasajes de 512-1024 tokens en pipelines de retrieval.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de licencia y atribución; no hay restricciones adicionales conocidas en la información disponible.
- Resultados de benchmarks declarados por el autor y no verificados (`verified: false` en la model card); deben tratarse como orientativos hasta replicación independiente.
- No hay pesos GGUF ni soporte nativo en llama.cpp/Ollama documentados en la información proporcionada; el despliegue en CPU requerirá ONNX Runtime o PyTorch.
- Alucinación: no aplica directamente al ser un encoder, pero en pipelines RAG un retrieval deficiente puede provocar que el LLM generador alucine sobre contexto irrelevante.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5
- Ficha en Mixpeek Model Hub: https://mixpeek.com/model/Alibaba-NLP/gte-large-en-v1.5
- Paper GTE (arXiv:2308.03281): https://arxiv.org/abs/2308.03281
- Paper GTE v1.5 (arXiv:2407.19669): https://arxiv.org/abs/2407.19669
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
- Benchmark MTEB: https://huggingface.co/spaces/mteb/leaderboard
