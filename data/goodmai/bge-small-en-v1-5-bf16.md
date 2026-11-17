# goodmai/bge-small-en-v1.5-bf16

## Resumen

`goodmai/bge-small-en-v1.5-bf16` es una republicación en precisión bf16 del modelo de embeddings de frases BGE-small-en-v1.5, desarrollado originalmente por el Beijing Academy of Artificial Intelligence (BAAI) y redistribuido aquí por el usuario `goodmai`. Se trata de un encoder basado en arquitectura BERT de 33,36 millones de parámetros, diseñado exclusivamente para extracción de características y similitud semántica entre frases en inglés. No es un modelo generativo: no produce texto, sino vectores densos de embeddings.

El modelo resuelve el problema de la representación semántica eficiente para tareas de recuperación de información (retrieval), clasificación de textos, clustering, reranking y similitud semántica (STS). Su interés actual radica en que es un modelo muy ligero (0,1 GB de repositorio) que puede ejecutarse en CPU y en hardware de consumo, manteniendo resultados competitivos en los benchmarks MTEB para su tamaño. La versión bf16 busca reducir el uso de memoria frente a la versión original en fp32 sin degradación significativa de la calidad, y los tags del repositorio indican compatibilidad con MLX (Apple Silicon) y text-embeddings-inference.

La relevancia práctica de esta ficha es acotada: se trata de un fork de cuantización/precisión de un modelo ya ampliamente conocido, con solo 46 descargas y 0 likes en el momento de la consulta, lo que sugiere que no es una referencia principal sino una variante de conveniencia para entornos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (version publicada); no se detallan otras en la informacion |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT con 33,36 millones de parámetros, orientado a la generación de embeddings de frases mediante sentence-transformers. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF/DPO (no aplicables en un encoder de embeddings). Tampoco se especifica si se aplicaron técnicas de pooling concretas (CLS, mean pooling) más allá de lo que se deduce del pipeline `feature-extraction` y del uso estándar de la familia BGE.

La innovación de esta publicación concreta es la conversión a bf16 del checkpoint original `BAAI/bge-small-en-v1.5`, con el objetivo de reducir el footprint de memoria y habilitar su uso en entornos con restricciones de precisión, como MLX en Apple Silicon (según los tags del repositorio). No se documentan cambios en la arquitectura ni en el proceso de entrenamiento respecto al modelo base.

## Capacidades

- Generación de embeddings densos de frases y documentos en inglés para tareas de similitud semántica.
- Recuperación de información (retrieval) y búsqueda semántica sobre corpus en inglés.
- Clasificación de textos mediante embeddings (sentimiento, tópicos, intenciones).
- Clustering de documentos y frases.
- Reranking de resultados de búsqueda.
- Evaluación de similitud semántica entre pares de frases (STS).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado solo para inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica en inglés: indexar fragmentos con el modelo y recuperar por similitud de coseno; su tamaño de 33 M de parámetros permite indexar grandes volúmenes en CPU con latencia baja.
- Clasificación de tickets de soporte: generar embeddings de cada ticket y entrenar un clasificador ligero encima; adecuado por su rendimiento en MTEB Banking77 (85,74 % de accuracy) para dominios financieros en inglés.
- Deduplicación de preguntas en foros: usar la similitud entre embeddings para detectar duplicados, apoyándose en los resultados de AskUbuntuDupQuestions (MAP 62,59, MRR 74,42).
- Clustering de artículos científicos: agrupar abstracts por temática con los embeddings del modelo; los resultados en ArxivClusteringP2P (v-measure 47,40) indican un rendimiento razonable para este uso.
- Filtrado de reseñas por polaridad: clasificar reseñas de productos en positivas/negativas; el modelo alcanza 92,75 % de accuracy en AmazonPolarityClassification.
- Reranking en pipelines de RAG en inglés: usar el modelo como reranker ligero tras una primera fase de recuperación, con coste computacional mínimo.
- Similitud semántica en dominios biomédicos: comparar pares de frases clínicas; los resultados en BIOSSES (Spearman 83,75) son sólidos para un modelo de este tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados, `verified: false`). Se presentan los valores principales; el listado completo de MTEB es extenso y aquí se recogen los más representativos.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 73,79 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 68,09 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 92,75 |
| Classification | MTEB AmazonPolarityClassification | f1 | 92,74 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 46,99 |
| Classification | MTEB Banking77Classification | accuracy | 85,74 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 59,55 |
| Retrieval | MTEB ArguAna | recall_at_100 | 98,43 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 41,11 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 47,40 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 40,02 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 38,47 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 62,59 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 74,42 |
| STS | MTEB BIOSSES | cos_sim_spearman | 83,75 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos ni el promedio global de MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (33,36 M de parámetros); en fp32 rondaría los 130 MB de pesos, por lo que cualquier GPU consumer es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con throughput aceptable. Cualquier GPU moderna (RTX 3060 en adelante, A100, H100) sobra para este modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o inferiores, y en Apple Silicon vía MLX (tag del repositorio).
- Opciones de despliegue: sentence-transformers, transformers, text-embeddings-inference (tag `text-embeddings-inference`), MLX, y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| goodmai/bge-small-en-v1.5-bf16 | 33,36 M | no disponible | MIT | en | Variante bf16 del BGE-small; 46 descargas |
| BAAI/bge-small-en-v1.5 | ~33 M | no disponible | MIT | en | Modelo base original del que deriva esta publicación |
| BAAI/bge-base-en-v1.5 | ~109 M | no disponible | MIT | en | Versión mayor de la misma familia, mayor coste computacional |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | no disponible | Apache 2.0 | en | Alternativa ligera muy extendida para embeddings en inglés |

La comparación se limita a datos estructurales; no se dispone de resultados de benchmarks cruzados en la información proporcionada para establecer diferencias de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta castellano ni otros idiomas; su uso en entornos multilingües requeriría un modelo distinto.
- No es un modelo generativo: no puede producir texto, responder preguntas de forma directa ni ejecutar tool calling; solo genera embeddings.
- Los resultados de benchmarks están marcados como `verified: false` en la model card, por lo que no han sido validados de forma independiente.
- Riesgo de sesgos: al estar entrenado sobre corpus en inglés no documentados en la ficha, pueden heredarse sesgos de los datos originales; no se detallan análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios muy especializados o con vocabulario fuera de distribución.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero se recomienda conservar el aviso de copyright original.
- La publicación tiene muy baja adopción (46 descargas, 0 likes) y fue creada en noviembre de 2026; no hay evidencia de mantenimiento continuado ni de validación comunitaria.
- Longitud máxima de secuencia no documentada en la información disponible; para textos largos conviene trocear y agregar embeddings.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/bge-small-en-v1.5-bf16
- Modelo base original (BAAI/bge-small-en-v1.5): https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio BGE de BAAI: https://github.com/FlagOpen/FlagEmbedding
- Paper BGE (C-Pack): https://arxiv.org/abs/2309.07597
- Benchmark MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Librería sentence-transformers: https://www.sbert.net/
