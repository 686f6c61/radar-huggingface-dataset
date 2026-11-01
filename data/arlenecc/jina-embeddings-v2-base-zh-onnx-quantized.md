# arlenecc/jina-embeddings-v2-base-zh-onnx-quantized

## Resumen

`arlenecc/jina-embeddings-v2-base-zh-onnx-quantized` es una conversión a ONNX cuantizado del modelo de embeddings `jina-embeddings-v2-base-zh` de Jina AI, publicada por el usuario arlenecc. Se trata de un modelo de representación de frases (sentence embeddings) basado en arquitectura BERT, disenado especificamente para generar vectores densos de texto en ingles y chino, y optimizado para tareas de similitud semantica, recuperacion y clasificacion.

El modelo original de Jina AI emplea la innovacion ALiBi (Attention with Linear Biases) para extender la longitud de contexto mas alla de los 512 tokens tipicos de BERT, alcanzando 8192 tokens. Esta version ONNX cuantizada reduce el peso del repositorio a aproximadamente 0,2 GB, lo que la hace adecuada para despliegue en entornos con recursos limitados, incluyendo inferencia en navegador mediante transformers.js.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para sistemas de busqueda semantica y RAG (Retrieval-Augmented Generation) en escenarios bilingues ingles-chino, con licencia Apache 2.0 que permite uso comercial sin restricciones. El modelo se distribuye bajo la libreria sentence-transformers y soporta el pipeline de feature-extraction.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT con ALiBi (transformer encoder) |
| Parametros totales | no disponible (modelo base BERT, tamano de repo 0,2 GB cuantizado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredado de jina-embeddings-v2, segun literatura del modelo original) |
| Tipos de cuantizacion | ONNX cuantizado (tipo exacto de cuantizacion no especificado en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (cuantizado) |

## Arquitectura y entrenamiento

El modelo subyacente es `jina-embeddings-v2-base-zh`, un encoder transformer tipo BERT que incorpora ALiBi (Attention with Linear Biases), una tecnica que permite extrapolar la longitud de contexto mas alla de la ventana de entrenamiento original sin necesidad de recalcular las matrices de atencion. Esta arquitectura esta documentada en el paper arXiv:2108.12409 (ALiBi) y en el paper de Jina Embeddings v2 (arXiv:2402.17016). El modelo genera embeddings densos de 768 dimensiones (segun la familia jina-embeddings-v2-base).

Los detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset y si se aplicaron tecnicas de RLHF o DPO no estan disponibles en la informacion proporcionada. La model card del repositorio no incluye seccion de entrenamiento detallada; unicamente se declaran los resultados de benchmarks MTEB. La version publicada por arlenecc es una conversion a ONNX con cuantizacion, cuyo proceso exacto de cuantizacion (estatica, dinamica, INT8, etc.) no se especifica.

## Capacidades

- Generacion de embeddings densos de frases y parrafos para similitud semantica y recuperacion de informacion.
- Soporte bilingue ingles-chino (en, zh) para tareas de similitud y clasificacion.
- Extraccion de caracteristicas (feature-extraction) mediante el pipeline de transformers y sentence-transformers.
- Compatibilidad con transformers.js para inferencia en navegador o entornos JavaScript.
- Compatibilidad con text-embeddings-inference (TEI) para despliegue en servidor.
- Capacidad de manejar contextos largos (hasta 8192 tokens) gracias a ALiBi, segun la arquitectura del modelo original.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de embeddings.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica bilingue: el modelo genera embeddings para consultas y documentos en ingles y chino, permitiendo construir indices vectoriales con FAISS o Qdrant y recuperar pasajes relevantes por similitud coseno. Su contexto de 8192 tokens permite indexar fragmentos largos sin truncamiento agresivo.

- RAG (Retrieval-Augmented Generation): se utiliza como codificador de recuperacion en pipelines de generacion aumentada, donde los documentos se embeben una vez y las consultas se codifican en tiempo de inferencia. La version ONNX cuantizada reduce los requisitos de memoria, permitiendo desplegar el recuperador en la misma maquina que el generador.

- Clasificacion de resenas y textos: los embeddings pueden alimentar un clasificador ligero (regresion logistica, SVM) para tareas de analisis de sentimiento o categorizacion. Los resultados de MTEB en AmazonReviewsClassification (zh) con accuracy de 34,94 indican un rendimiento moderado en esta tarea.

- Reranking de resultados de busqueda: el modelo puede puntuar pares consulta-documento mediante similitud coseno para reordenar los resultados de un primer recuperador. Los resultados de MTEB en CMedQAv1 y CMedQAv2 (MAP de 83,6 y 83,7 respectivamente) muestran un rendimiento solido en reranking de dominio medico chino.

- Deduplicacion y clustering de documentos: agrupando embeddings con tecnicas de clustering (K-means, HDBSCAN) se pueden detectar documentos duplicados o agrupar noticias por tematica. Los resultados de CLSClusteringP2P y CLSClusteringS2S (v-measure de 39,97 y 38,40) indican un rendimiento limitado pero funcional.

- Inferencia en navegador con transformers.js: al estar en formato ONNX cuantizado, el modelo puede ejecutarse del lado del cliente para busqueda semantica local sin enviar datos a un servidor, util en aplicaciones de privacidad o entornos offline.

- Sistemas de recomendacion basados en contenido: los embeddings de descripciones de productos o articulos permiten calcular similitud entre items y generar recomendaciones sin necesidad de historial de usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). No verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | MTEB AFQMC (validation) | cos_sim_pearson | 48,51 |
| STS | MTEB AFQMC (validation) | cos_sim_spearman | 50,59 |
| STS | MTEB ATEC (test) | cos_sim_pearson | 50,26 |
| STS | MTEB ATEC (test) | cos_sim_spearman | 51,29 |
| Classification | MTEB AmazonReviewsClassification (zh) | accuracy | 34,94 |
| Classification | MTEB AmazonReviewsClassification (zh) | f1 | 34,06 |
| STS | MTEB BQ (test) | cos_sim_pearson | 65,16 |
| STS | MTEB BQ (test) | cos_sim_spearman | 66,07 |
| Clustering | MTEB CLSClusteringP2P (test) | v_measure | 39,97 |
| Clustering | MTEB CLSClusteringS2S (test) | v_measure | 38,40 |
| Reranking | MTEB CMedQAv1 (test) | map | 83,64 |
| Reranking | MTEB CMedQAv1 (test) | mrr | 86,16 |
| Reranking | MTEB CMedQAv2 (test) | map | 83,74 |
| Reranking | MTEB CMedQAv2 (test) | mrr | 86,10 |
| Retrieval | MTEB CmedqaRetrieval (dev) | ndcg_at_10 | 39,15 |
| Retrieval | MTEB CmedqaRetrieval (dev) | recall_at_100 | 79,04 |
| PairClassification | MTEB Cmnli (validation) | cos_sim_accuracy | 76,70 |
| PairClassification | MTEB Cmnli (validation) | cos_sim_ap | 85,27 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT base cuantizado a ONNX con un repositorio de 0,2 GB, la VRAM necesaria es inferior a 1 GB en FP16/INT8. En CPU, el modelo puede ejecutarse con menos de 1 GB de RAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.). Para despliegue en servidor, una T4 o A10 es mas que suficiente; A100/H100 no son necesarias para este tamano de modelo.
- Cabe en cualquier GPU consumer, incluidas GTX 1650 o inferiores, y en CPU.
- Opciones de despliegue: ONNX Runtime, transformers.js (navegador), text-embeddings-inference (TEI), sentence-transformers con backend ONNX. No se dispone de informacion sobre soporte en vLLM o llama.cpp (no aplica a modelos de embeddings en la mayoria de casos).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo BERT base cuantizado, se espera un throughput alto en GPU (cientos de frases por segundo) y moderado en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jina-embeddings-v2-base-zh (original) | BERT base (~110M) | 8192 | en, zh | Apache 2.0 | safetensors |
| arlenecc/jina-embeddings-v2-base-zh-onnx-quantized | BERT base cuantizado | 8192 (heredado) | en, zh | Apache 2.0 | ONNX cuantizado |
| BAAI/bge-base-zh-v1.5 | BERT base (~110M) | 512 | zh | MIT | safetensors, ONNX |
| BAAI/bge-m3 | XLM-RoBERTa large (~568M) | 8192 | multilingue | MIT | safetensors |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de resultados de benchmarks comparativos directos en la informacion proporcionada. La principal ventaja de esta version es su formato ONNX cuantizado y su reducido tamano (0,2 GB), que facilita el despliegue en entornos con recursos limitados y en navegador, a costa de una posible perdida de precision frente al modelo original en safetensors.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes.
- Sesgos conocidos: no se documentan en la model card; al entrenarse con datos web, es probable que herede sesgos de genero, raza o religion presentes en los corpus, pero no se aporta informacion especifica.
- Riesgo de alucinacion: no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes espurias en dominios muy especializados.
- Limitaciones de contexto: aunque la arquitectura ALiBi permite 8192 tokens, el rendimiento en contextos muy largos puede degradarse; no se aportan datos de evaluacion en secuencias largas para esta version cuantizada.
- Limitaciones de idioma: solo soporta ingles y chino; no esta entrenado para castellano ni otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion. No se identifican restricciones adicionales.
- La cuantizacion ONNX puede introducir una perdida de precision respecto al modelo original; no se documenta el error de cuantizacion ni se comparan los benchmarks de esta version con los del modelo original.
- El repositorio tiene muy pocas descargas (18) y likes (0), lo que sugiere que no ha sido validado ampliamente por la comunidad.
- La fecha de creacion indicada (2026-10-31) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una fecha programada; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- No se especifica el proceso exacto de cuantizacion (dinamica, estatica, INT8, etc.), lo que dificulta evaluar su impacto en la calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arlenecc/jina-embeddings-v2-base-zh-onnx-quantized
- Modelo original (referencia): https://huggingface.co/jinaai/jina-embeddings-v2-base-zh
- Paper ALiBi (arXiv:2108.12409): https://arxiv.org/abs/2108.12409
- Paper Jina Embeddings v2 (arXiv:2402.17016): https://arxiv.org/abs/2402.17016
- Documentacion de sentence-transformers: https://www.sbert.net/
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
