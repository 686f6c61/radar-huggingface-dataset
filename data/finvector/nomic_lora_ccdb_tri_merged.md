# finvector/nomic_lora_ccdb_tri_merged

## Resumen

`finvector/nomic_lora_ccdb_tri_merged` es un modelo de embeddings de frases publicado por finvector, derivado de la familia Nomic (arquitectura `nomic_bert`) y empaquetado para su uso con la librería sentence-transformers. Con 136.731.648 parámetros (aproximadamente 137 millones), se sitúa en la gama de modelos de embedding compactos, pensados para tareas de similitud semántica, recuperación de información y clasificación de texto. El nombre sugiere un ajuste fino mediante LoRA sobre un modelo base Nomic y una posterior fusión de pesos ("merged"), orientada a un corpus concreto ("ccdb").

El modelo resuelve el problema clásico de convertir texto en representaciones vectoriales densas de calidad para búsqueda semántica y clasificación. Su relevancia práctica radica en que es ligero (repo de 0,3 GB en safetensors), compatible con el ecosistema sentence-transformers, transformers.js y text-embeddings-inference, y se distribuye bajo licencia Apache 2.0, lo que facilita su integración tanto en prototipos como en producción sin restricciones comerciales adicionales.

La información disponible es limitada: la model card no documenta detalles del dataset de ajuste, el proceso de entrenamiento ni la longitud de contexto. Los benchmarks publicados corresponden a la evaluación MTEB declarada por el autor (no verificada) y cubren clasificación, recuperación, clustering, reranking y STS en inglés. Todo el soporte idiomático declarado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nomic_bert` (transformer encoder, base de la familia Nomic) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo encoder transformer (`nomic_bert`), la base sobre la que Nomic construye sus modelos de embeddings de texto. Con 136,7 millones de parámetros, se trata de un modelo denso orientado a producir un vector por secuencia de entrada para tareas de similitud y recuperación. El identificador del repositorio indica un ajuste mediante LoRA seguido de una fusión de pesos ("tri_merged"), una técnica habitual para combinar adaptadores o integrar el adaptador en los pesos base antes de publicar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o entrenamiento contrastivo específico más allá de lo que implica un modelo de embeddings de sentence-transformers. Tampoco se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa u otras). La model card únicamente incluye los resultados MTEB declarados por el autor, marcados como no verificados.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica (`sentence-similarity`).
- Extracción de características (`feature-extraction`) a partir de texto.
- Clasificación de texto por similitud o mediante cabezales sobre embeddings (evaluado en MTEB en tareas de clasificación como Amazon Polarity, Amazon Counterfactual, Amazon Reviews y Banking77).
- Recuperación de información (retrieval) en corpus como ArguAna y CQADupstack.
- Clustering de documentos y frases (ArxivClusteringP2P/S2S, BiorxivClusteringP2P/S2S).
- Reranking de pares de preguntas/respuestas (AskUbuntuDupQuestions).
- Evaluación de similitud semántica textual (STS, p. ej. BIOSSES).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en bases documentales: el modelo convierte consultas y documentos en vectores comparables por similitud coseno, lo que permite construir índices vectoriales (FAISS, Qdrant, pgvector) para recuperación en inglés con un coste de inferencia bajo gracias a sus 137 M de parámetros.
- Clasificación de reseñas y opiniones: los resultados MTEB en Amazon Polarity (accuracy 91,81) y Amazon Reviews (accuracy 47,16) indican que puede usarse como extractor de features para clasificadores de sentimiento y categorización de reseñas.
- Enrutamiento de tickets de soporte: con la evaluación en Banking77 (accuracy 84,25), es adecuado para asignar consultas bancarias a la categoría o cola correcta mediante similitud con prototipos de clase.
- Deduplicación y agrupamiento de contenido: las métricas de clustering (ArxivClusteringP2P v-measure 45,69; BiorxivClusteringP2P 38,77) lo hacen útil para agrupar artículos, FAQs o documentos similares y detectar duplicados.
- Reranking en pipelines de búsqueda: con map 61,71 y mrr 76,06 en AskUbuntuDupQuestions, puede emplearse como segunda etapa de reordenación tras un retrieval inicial más barato.
- Detección de similitud entre frases para sistemas de preguntas frecuentes: la evaluación en BIOSSES (Spearman coseno 84,25) respalda su uso para emparejar preguntas de usuarios con respuestas canónicas en inglés.
- Moderación y clustering de feedback de usuarios: agrupación de comentarios por temática para priorizar incidencias, aprovechando la ligereza del modelo para procesar lotes grandes.

## Benchmarks y rendimiento

Resultados MTEB declarados por el autor (no verificados):

| Tarea / dataset | Métrica | Valor |
|---|---|---|
| AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| AmazonCounterfactualClassification (en) | ap | 38,58 |
| AmazonCounterfactualClassification (en) | f1 | 69,36 |
| AmazonPolarityClassification | accuracy | 91,81 |
| AmazonPolarityClassification | ap | 88,65 |
| AmazonPolarityClassification | f1 | 91,80 |
| AmazonReviewsClassification (en) | accuracy | 47,16 |
| AmazonReviewsClassification (en) | f1 | 46,59 |
| ArguAna (retrieval) | map_at_10 | 38,96 |
| ArguAna (retrieval) | ndcg_at_10 | 48,01 |
| ArguAna (retrieval) | recall_at_10 | 77,38 |
| ArxivClusteringP2P | v_measure | 45,69 |
| ArxivClusteringS2S | v_measure | 36,35 |
| AskUbuntuDupQuestions (reranking) | map | 61,71 |
| AskUbuntuDupQuestions (reranking) | mrr | 76,06 |
| BIOSSES (STS) | cos_sim_spearman | 84,25 |
| Banking77Classification | accuracy | 84,25 |
| Banking77Classification | f1 | 84,18 |
| BiorxivClusteringP2P | v_measure | 38,77 |
| BiorxivClusteringS2S | v_measure | 32,94 |
| CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| CQADupstackAndroidRetrieval | mrr_at_10 | 48,63 |

No se han publicado en la información disponible resultados agregados (media MTEB) ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 136,7 M de parámetros ocupan aproximadamente 0,55 GB; en fp16, unos 0,27 GB. Con overhead de activaciones y batches, es holgado en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L4/L40S. Para desarrollo, RTX 4090, RTX 3090 o incluso GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: sentence-transformers, transformers, text-embeddings-inference (tag `text-embeddings-inference`), transformers.js (tag `transformers.js`) y endpoints compatibles. También puede exportarse a ONNX o cuantizarse con herramientas externas para llama.cpp/Ollama, aunque no se documenta soporte nativo GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, es un modelo de embedding de coste bajo apto para procesamiento por lotes en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| finvector/nomic_lora_ccdb_tri_merged | 136,7 M | no disponible | apache-2.0 | en | Ajuste LoRA sobre base Nomic, MTEB declarado no verificado |
| nomic-embed-text (familia base) | ~137 M | no disponible en esta ficha | apache-2.0 | en (y variantes multilingües) | Modelo base del que deriva; referencia natural |
| all-MiniLM-L6-v2 (Sentence Transformers) | ~22 M | 256 tokens (habitual) | apache-2.0 | en | Alternativa mucho más ligera, ampliamente usada en producción |
| bge-small-en-v1.5 (BAAI) | ~33 M | 512 tokens (habitual) | mit | en | Alternativa compacta con buen rendimiento en MTEB |

Los datos de contexto y rendimiento de los modelos comparados no se han verificado en la información disponible; se incluyen como referencia de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus en inglés, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en sentido generativo (no produce texto libre), pero los embeddings pueden producir similitudes engañosas fuera de dominio.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud máxima de secuencia no está documentada, lo que obliga a validarla empíricamente antes de usarla con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la procedencia del modelo base Nomic y de los datos de ajuste, no documentados.
- Caveats para producción: los benchmarks están marcados como no verificados y proceden del propio autor; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria. La fusión "tri_merged" y el ajuste LoRA no están descritos, lo que dificulta reproducir el entrenamiento. Validar en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/nomic_lora_ccdb_tri_merged
- Paper de referencia citado en tags (Nomic): https://arxiv.org/abs/2402.01613
- Paper de referencia citado en tags (Sentence-BERT): https://arxiv.org/abs/2205.13147
- Documentación de sentence-transformers: https://www.sbert.net
- Repositorio MTEB: https://github.com/embeddings-benchmark/mteb
