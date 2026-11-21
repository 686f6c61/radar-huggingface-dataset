# Alibaba-NLP/gte-base-en-v1.5

## Resumen

gte-base-en-v1.5 es un modelo de embeddings de frases (sentence embeddings) desarrollado por Alibaba-NLP, el equipo de investigación en procesamiento de lenguaje natural de Alibaba. No es un modelo generativo, sino un encoder basado en arquitectura transformer (familia BERT) que transforma texto en vectores densos de 768 dimensiones utilizables para búsqueda semántica, similitud entre frases, clasificación y agrupamiento. Con aproximadamente 137 millones de parámetros, se posiciona como una alternativa de tamaño medio dentro de la familia GTE (General Text Embeddings).

El modelo está entrenado específicamente para inglés y está diseñado para alimentar sistemas de recuperación de información (RAG), motores de búsqueda semántica y pipelines de sentence-transformers. Su relevancia actual radica en que combina un rendimiento competitivo en los benchmarks de MTEB con una licencia Apache 2.0 totalmente permisiva y un tamaño que permite desplegarlo en infraestructura modesta, incluyendo CPU y GPUs de consumo.

La versión 1.5 introduce mejoras sobre la gte-base original, con un énfasis en la calidad de los embeddings para tareas de recuperación y similitud semántica. El modelo se distribuye en formatos safetensors, ONNX y es compatible con transformers.js, lo que facilita su uso tanto en servidores como en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT) |
| Parametros totales | 136.776.192 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; la model card no declara un máximo explícito) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se listan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer encoder tipo BERT con 12 capas y una dimensión de representación de 768, lo que da lugar a los aproximadamente 137 millones de parámetros. Genera embeddings de frase mediante pooling sobre las representaciones del encoder. La model card referencia dos artículos (arXiv:2407.19669 y arXiv:2308.03281) que documentan la metodología de la familia GTE, aunque los detalles concretos sobre el volumen de tokens de entrenamiento, la composición del dataset y el uso de técnicas como RLHF o DPO no se especifican en la información disponible.

Como modelo de embeddings, no emplea decodificación generativa ni mecanismos de atención lineal; su innovación principal reside en el procedimiento de entrenamiento orientado a tareas de recuperación y similitud, y en la publicación de pesos en múltiples formatos (safetensors, ONNX, transformers.js) para facilitar el despliegue. La versión 1.5 se presenta como una revisión mejorada de la gte-base original, con resultados actualizados en la suite MTEB.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda.
- Recuperación de información (retrieval) densa para pipelines RAG.
- Clasificación de texto por similitud (zero-shot y con ejemplos).
- Agrupamiento (clustering) de documentos y frases.
- Reranking de resultados de búsqueda.
- Evaluación de similitud semántica textual (STS).
- Compatibilidad con sentence-transformers y transformers.js.
- Soporte de exportación a ONNX para inferencia optimizada.
- Multilingüe: no; únicamente inglés.
- Tool calling / function calling: no aplica (no es un modelo generativo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos en inglés y recuperar los fragmentos más relevantes para una consulta mediante similitud de coseno sobre los embeddings de 768 dimensiones.
- Pipeline RAG para asistentes internos: usar el modelo como retriever en una arquitectura de generación aumentada, alimentando un LLM generativo con los pasajes recuperados; su tamaño reducido permite indexar grandes corpus con latencia baja.
- Deduplicación y clustering de tickets de soporte: agrupar incidencias similares en inglés calculando embeddings y aplicando clustering, lo que permite identificar problemas recurrentes.
- Moderación y clasificación de reseñas: clasificar sentimiento o temática en reseñas de productos (el modelo reporta resultados en AmazonPolarity y AmazonReviews) mediante embeddings y un clasificador ligero.
- Reranking en motores de búsqueda: reordenar los resultados de una búsqueda inicial (por ejemplo, BM25) usando la similitud semántica del modelo para mejorar la precisión en las primeras posiciones.
- Detección de similitud y plagio: comparar pares de frases o documentos en inglés para identificar duplicados o contenido parafraseado en sistemas editoriales o académicos.
- Búsqueda en el navegador: gracias a su compatibilidad con transformers.js y ONNX, puede ejecutarse en cliente para funcionalidades de búsqueda semántica sin backend.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MTEB, no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Classification | AmazonCounterfactualClassification (en) | accuracy | 74,79 |
| Classification | AmazonCounterfactualClassification (en) | f1 | 68,51 |
| Classification | AmazonPolarityClassification | accuracy | 93,02 |
| Classification | AmazonPolarityClassification | f1 | 93,00 |
| Classification | AmazonReviewsClassification (en) | accuracy | 53,31 |
| Classification | AmazonReviewsClassification (en) | f1 | 52,98 |
| Classification | Banking77Classification | accuracy | 86,73 |
| Classification | Banking77Classification | f1 | 86,70 |
| Retrieval | ArguAna | ndcg_at_10 | 63,49 |
| Retrieval | ArguAna | recall_at_10 | 90,75 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 41,27 |
| Retrieval | CQADupstackAndroidRetrieval | mrr_at_10 | 46,90 |
| Clustering | ArxivClusteringP2P | v_measure | 47,51 |
| Clustering | ArxivClusteringS2S | v_measure | 42,05 |
| Clustering | BiorxivClusteringP2P | v_measure | 40,32 |
| Clustering | BiorxivClusteringS2S | v_measure | 37,55 |
| Reranking | AskUbuntuDupQuestions | map | 61,83 |
| Reranking | AskUbuntuDupQuestions | mrr | 74,37 |
| STS | BIOSSES | cos_sim_spearman | 83,65 |

No se han publicado en la información disponible resultados agregados de la media MTEB ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,55 GB solo para pesos (137 M de parámetros × 4 bytes), más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- En FP16: aproximadamente 0,28 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamaño una GPU de consumo es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1060 en adelante) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, transformers, ONNX Runtime, transformers.js (navegador), Text Embeddings Inference (TEI) de Hugging Face, y servidores de embeddings compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un encoder de 137 M de parámetros, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gte-base-en-v1.5 | 137 M | no disponible | en | Apache 2.0 | Objeto de esta ficha; resultados MTEB parciales en la model card |
| gte-large-en-v1.5 | no disponible en la información | no disponible | en | Apache 2.0 | Versión mayor de la misma familia; datos no aportados en esta búsqueda |
| bge-base-en-v1.5 | no disponible en la información | no disponible | en | MIT (según conocimiento general, no verificado en esta búsqueda) | Alternativa popular de embeddings en inglés; sin datos comparativos en la información disponible |
| all-MiniLM-L6-v2 | no disponible en la información | no disponible | en | Apache 2.0 (según conocimiento general, no verificado) | Modelo de embeddings ligero muy extendido; sin datos comparativos en la información disponible |

No se dispone en la información proporcionada de datos de rendimiento de los modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse para textos en castellano u otros idiomas sin esperar una degradación significativa de la calidad.
- No es un modelo generativo: no produce texto, por lo que no puede emplearse para chat, resumen o generación de código.
- Riesgo de sesgos: al entrenarse sobre corpus web en inglés, puede heredar sesgos sociales y culturales presentes en esos datos; la model card no documenta análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy especializados o con vocabulario fuera de distribución.
- Longitud de contexto no declarada explícitamente: para textos largos conviene fragmentar en pasajes, ya que los modelos BERT suelen limitarse a 512 tokens.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, pero se recomienda conservar el aviso de licencia y atribución.
- Los resultados de benchmarks de la model card están marcados como no verificados; conviene validar el rendimiento en el dominio concreto antes de llevarlo a producción.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-NLP/gte-base-en-v1.5
- Paper GTE (arXiv:2308.03281): https://arxiv.org/abs/2308.03281
- Paper GTE v1.5 (arXiv:2407.19669): https://arxiv.org/abs/2407.19669
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Suite MTEB: https://github.com/embeddings-benchmark/mteb
- transformers.js: https://github.com/huggingface/transformers.js
