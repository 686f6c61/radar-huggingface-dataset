# finvector/nomic_lora_finsent_pair_merged

## Resumen

`finvector/nomic_lora_finsent_pair_merged` es un modelo de embeddings de frases (sentence embeddings) desarrollado por finvector, construido sobre la arquitectura Nomic BERT y ajustado mediante LoRA sobre el modelo base `nomic-ai/nomic-embed-text-v1.5`. El modelo está pensado para tareas de similitud semántica, recuperación de información (retrieval), clasificación de textos y clustering, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Con 136,7 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto y ligero, adecuado para despliegues en entornos con recursos limitados, incluidos servicios de inferencia en CPU o GPU de gama media. Su integración con `sentence-transformers` y su compatibilidad con `transformers.js` y `text-embeddings-inference` facilitan su adopción en pipelines de producción.

El modelo aparece en Hugging Face con fecha de creación de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, lo que sugiere una publicación reciente y sin adopción comunitaria significativa. La model card incluye resultados de evaluación MTEB para una configuración denominada `epoch_0_model`, aunque estos datos no están verificados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nomic BERT (transformer encoder) |
| Parámetros totales | 136.731.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Nomic BERT, un transformer encoder derivado de la familia BERT, y se ha obtenido mediante un ajuste LoRA (Low-Rank Adaptation) sobre el modelo `nomic-ai/nomic-embed-text-v1.5`, seguido de una fusión de los pesos adaptados (de ahí el sufijo `_merged` en el nombre). Esta técnica permite especializar un modelo de embeddings ya entrenado con un coste computacional reducido, sin necesidad de reentrenar todos los parámetros.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo está orientado a la extracción de características (`feature-extraction`) y a la similitud de frases (`sentence-similarity`), y su pipeline principal es `sentence-similarity`.

## Capacidades

- Generación de embeddings de frases para tareas de similitud semántica.
- Recuperación de información (retrieval) en corpus en inglés.
- Clasificación de textos (por ejemplo, análisis de sentimiento, clasificación de reseñas).
- Clustering de documentos y agrupación semántica.
- Reranking de resultados de búsqueda.
- Extracción de características para pipelines de NLP.
- Compatibilidad con `sentence-transformers`, `transformers.js` y `text-embeddings-inference`.
- Soporte multilingüe limitado al inglés (según la etiqueta de idioma `en`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo puede indexar fragmentos de documentación en inglés y recuperar los pasajes más relevantes para una consulta, gracias a su capacidad de generar embeddings densos y su integración con `sentence-transformers`.
- Clasificación de reseñas de productos: adecuado para analizar opiniones de clientes y clasificarlas por sentimiento o temática, como demuestran los resultados en los datasets de Amazon (AmazonPolarity, AmazonReviews).
- Deduplicación de contenido: permite detectar textos duplicados o casi duplicados en grandes corpus mediante similitud de embeddings, útil en tareas de limpieza de datos.
- Agrupación de artículos científicos: el modelo puede clusterizar abstracts de arXiv o bioRxiv por temática, facilitando la organización de bibliotecas documentales.
- Reranking en motores de búsqueda: puede reordenar los resultados de un sistema de recuperación inicial (por ejemplo, BM25) para mejorar la precisión en dominios como preguntas y respuestas técnicas (AskUbuntu).
- Sistemas de recomendación basados en contenido: al comparar embeddings de descripciones de productos o artículos, el modelo permite sugerir ítems similares sin depender de metadatos estructurados.
- Moderación de contenido: clasificación de textos según su temática o toxicidad potencial, aprovechando su capacidad de clasificación en dominios como reseñas y preguntas.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor (configuración `epoch_0_model`) y no están verificados de forma independiente.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación | MTEB AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| Clasificación | MTEB AmazonCounterfactualClassification (en) | ap | 38,58 |
| Clasificación | MTEB AmazonCounterfactualClassification (en) | f1 | 69,36 |
| Clasificación | MTEB AmazonPolarityClassification | accuracy | 91,81 |
| Clasificación | MTEB AmazonPolarityClassification | ap | 88,65 |
| Clasificación | MTEB AmazonPolarityClassification | f1 | 91,80 |
| Clasificación | MTEB AmazonReviewsClassification (en) | accuracy | 47,16 |
| Clasificación | MTEB AmazonReviewsClassification (en) | f1 | 46,59 |
| Clasificación | MTEB Banking77Classification | accuracy | 84,25 |
| Clasificación | MTEB Banking77Classification | f1 | 84,18 |
| Retrieval | MTEB ArguAna | map_at_1 | 24,25 |
| Retrieval | MTEB ArguAna | map_at_10 | 38,96 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 48,01 |
| Retrieval | MTEB ArguAna | recall_at_10 | 77,38 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | mrr_at_10 | 48,63 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 36,35 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 38,77 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 32,94 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 61,71 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 76,06 |
| STS | MTEB BIOSSES | cos_sim_spearman | 84,25 |
| STS | MTEB BIOSSES | cos_sim_pearson | 86,74 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 (136,7 M de parámetros), y alrededor de 0,3 GB en cuantización de 8 bits. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, A100 o H100. También puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (TEI), `transformers.js` para entornos JavaScript, y potencialmente `vLLM` u `Ollama` si se convierte a los formatos adecuados (no documentado explícitamente).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño reducido del modelo, se espera un throughput alto en GPU y una latencia de milisegundos por lote en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| finvector/nomic_lora_finsent_pair_merged | 136,7 M | no disponible | Apache 2.0 | en | Ajuste LoRA sobre nomic-embed-text-v1.5 |
| nomic-ai/nomic-embed-text-v1.5 | 137 M | 8192 tokens | Apache 2.0 | en (y multilingüe en variantes) | Modelo base, con contexto largo documentado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache 2.0 | en | Modelo más pequeño y rápido, menor calidad en retrieval |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | MIT | en | Alternativa compacta con buen rendimiento en MTEB |

La comparativa se basa en características públicas de los modelos citados; no se dispone de una evaluación directa entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado principalmente en inglés; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Los resultados de benchmarks incluidos en la model card no están verificados de forma independiente (`verified: false`), por lo que deben tomarse con cautela.
- No se especifica la longitud máxima de contexto soportada, lo que puede afectar a la recuperación de documentos largos.
- Riesgo de sesgos: al estar entrenado sobre datos en inglés, puede heredar sesgos presentes en los corpus utilizados (por ejemplo, en reseñas de Amazon o preguntas técnicas).
- Riesgo de alucinación: aunque es un modelo de embeddings y no generativo, puede producir representaciones inexactas para dominios muy especializados o textos con jerga no vista durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `nomic-embed-text-v1.5` y de los datasets de ajuste.
- El modelo tiene cero descargas y cero likes en Hugging Face, lo que indica falta de validación por parte de la comunidad; se recomienda evaluarlo en el dominio objetivo antes de usarlo en producción.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas generativas complejas.

## Enlaces

- [Hugging Face: finvector/nomic_lora_finsent_pair_merged](https://huggingface.co/finvector/nomic_lora_finsent_pair_merged)
- [Paper Nomic Embed: Training a Reproducible Long Context Text Embedder (arXiv:2402.01613)](https://arxiv.org/abs/2402.01613)
- [Paper Sentence-BERT (arXiv:2205.13147)](https://arxiv.org/abs/2205.13147)
- [Modelo base: nomic-ai/nomic-embed-text-v1.5](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)
- [MTEB: Massive Text Embedding Benchmark](https://huggingface.co/spaces/mteb/leaderboard)
