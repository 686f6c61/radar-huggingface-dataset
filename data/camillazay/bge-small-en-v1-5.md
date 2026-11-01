# CamillaZAY/bge-small-en-v1.5

## Resumen

bge-small-en-v1.5 es un modelo de embeddings de frases (sentence embeddings) de tipo encoder, publicado en HuggingFace bajo el identificador CamillaZAY/bge-small-en-v1.5. Se trata de una redistribución del modelo BGE-small-en-v1.5 original de BAAI, orientada a tareas de recuperación de información, similitud semántica, clasificación y clustering mediante la generación de representaciones vectoriales densas de texto. Con 33,36 millones de parámetros y un repositorio de 0,4 GB, es un modelo compacto pensado para despliegues de bajo coste y alta velocidad.

El modelo resuelve el problema de transformar texto en vectores de embedding útiles para búsqueda semántica y sistemas RAG (retrieval-augmented generation), entre otros. Su relevancia actual radica en que combina un tamaño reducido con un rendimiento competitivo en los benchmarks de MTEB (Massive Text Embedding Benchmark), lo que lo hace adecuado para entornos con recursos limitados o para ser desplegado como servicio de embeddings a gran escala.

La información disponible no detalla la longitud de contexto máxima ni los detalles de entrenamiento más allá de lo que se infiere de la arquitectura BERT subyacente y de la model card. El modelo está limitado al idioma inglés y se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.360.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch, onnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un encoder transformer bidireccional, y se utiliza como extractor de características (feature-extraction) para generar embeddings de frases. Con 33,36 millones de parámetros, corresponde a la variante "small" de la familia BGE. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La información disponible tampoco detalla innovaciones técnicas específicas como decodificación especulativa o atención lineal. Se trata, por tanto, de un encoder BERT estándar adaptado mediante entrenamiento contrastivo para producir embeddings de similitud semántica, tal como indica su integración con sentence-transformers y su uso en MTEB.

## Capacidades

- Generación de embeddings de frases para similitud semántica (sentence-similarity).
- Extracción de características (feature-extraction) para representaciones vectoriales densas.
- Recuperación de información (retrieval) en inglés, evaluada en MTEB.
- Clasificación de texto (classification), evaluada en MTEB.
- Clustering de textos (clustering), evaluado en MTEB.
- Reranking de resultados de búsqueda, evaluado en MTEB.
- Evaluación de similitud semántica textual (STS), evaluada en MTEB.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo generativo).
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en inglés: el modelo genera embeddings de documentos y consultas para recuperar los pasajes más relevantes mediante similitud coseno; su tamaño reducido permite indexar grandes corpus con bajo coste computacional.
- Sistemas RAG (retrieval-augmented generation): se usa como recuperador denso para alimentar un LLM generativo con contexto relevante, gracias a su buen rendimiento en tareas de retrieval de MTEB y su baja latencia.
- Clasificación de textos: se pueden entrenar clasificadores ligeros sobre los embeddings generados para tareas como análisis de sentimiento o categorización de tickets, con resultados evaluados en MTEB (por ejemplo, 92,75 % de accuracy en AmazonPolarity).
- Clustering de documentos: agrupar noticias, artículos científicos o reseñas por temática usando los embeddings y algoritmos de clustering como k-means, con métricas V-measure evaluadas en MTEB.
- Deduplicación y detección de near-duplicates: comparar embeddings de pares de textos para identificar contenido repetido en corpus grandes, aprovechando la similitud semántica.
- Reranking de resultados de búsqueda: reordenar los resultados de un motor de búsqueda léxico (por ejemplo, BM25) usando la similitud semántica del modelo, con métricas MAP y MRR evaluadas en MTEB.
- Moderación de contenido asistida: clasificar o agrupar mensajes por similitud con ejemplos etiquetados, como apoyo a sistemas de moderación en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 73,79 |
| Classification | MTEB AmazonCounterfactualClassification (en) | ap | 37,22 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 68,09 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 92,75 |
| Classification | MTEB AmazonPolarityClassification | ap | 89,47 |
| Classification | MTEB AmazonPolarityClassification | f1 | 92,74 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 46,99 |
| Classification | MTEB AmazonReviewsClassification (en) | f1 | 46,56 |
| Classification | MTEB Banking77Classification | accuracy | 85,74 |
| Classification | MTEB Banking77Classification | f1 | 85,71 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 59,55 |
| Retrieval | MTEB ArguAna | recall_at_10 | 85,42 |
| Retrieval | MTEB ArguAna | map_at_10 | 51,39 |
| Retrieval | MTEB ArguAna | mrr_at_10 | 51,66 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 41,11 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | ndcg_at_10 | no disponible (truncado) |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 47,40 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 40,02 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 38,47 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 34,72 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 62,59 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 74,42 |
| STS | MTEB BIOSSES | cos_sim_spearman | 83,75 |
| STS | MTEB BIOSSES | cos_sim_pearson | 85,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (33,36 M de parámetros, aproximadamente 133 MB de pesos); en FP16, aproximadamente 67 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas de gama baja como GTX 1650, RTX 3060 o T4. Para alto throughput se recomiendan A100, H100 o L4.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, HuggingFace Transformers, Text Embeddings Inference (TEI), ONNX Runtime (hay pesos ONNX en el repositorio), y servidores compatibles con endpoints de HuggingFace (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja y un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| bge-small-en-v1.5 (esta ficha) | 33,36 M | no disponible | MIT | en | HuggingFace |
| bge-base-en-v1.5 | no disponible | no disponible | MIT | en | HuggingFace |
| all-MiniLM-L6-v2 | no disponible | no disponible | Apache 2.0 | en | HuggingFace |
| e5-small-v2 | no disponible | no disponible | MIT | en | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; los valores de parámetros, contexto y licencia de los modelos alternativos no están confirmados en esta ficha y se indican como no disponibles cuando no se han podido verificar.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al entrenarse presumiblemente con corpus en inglés, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- Limitaciones de contexto o idioma: el modelo solo soporta inglés; la longitud máxima de contexto no está disponible en la información proporcionada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no verificados de forma independiente (verified: false); el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una redistribución reciente sin validación comunitaria; conviene verificar la integridad de los pesos frente al modelo original de BAAI antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/CamillaZAY/bge-small-en-v1.5
- Paper BGE (arXiv:2401.03462): https://arxiv.org/abs/2401.03462
- Paper MTEB (arXiv:2210.07316): no incluido en los tags de la información proporcionada
- Referencias citadas en los tags: arXiv:2312.15503, arXiv:2311.13534, arXiv:2310.07554, arXiv:2309.07597
- Modelo original de BAAI: no disponible en la información proporcionada
