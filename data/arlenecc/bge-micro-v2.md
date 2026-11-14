# arlenecc/bge-micro-v2

## Resumen

bge-micro-v2 es un modelo de embeddings de frases (sentence embeddings) publicado por el usuario arlenecc en Hugging Face bajo licencia MIT. Se trata de una variante reducida de la familia BGE (BAAI General Embedding), con tan solo 17,4 millones de parametros, lo que lo situa en la categoria de modelos ultraligeros para generacion de representaciones vectoriales densas. Su proposito es transformar texto en vectores de embedding utilizables en tareas de similitud semantica, recuperacion de informacion (retrieval), clasificacion, clustering y reranking.

El modelo se distribuye a traves de la libreria sentence-transformers y es compatible con text-embeddings-inference y endpoints de Hugging Face, lo que facilita su despliegue en infraestructuras de busqueda semantica y sistemas RAG (Retrieval-Augmented Generation). Su tamano reducido (0,2 GB de repositorio) y su arquitectura BERT lo hacen especialmente atractivo para entornos con recursos limitados, aplicaciones en el borde (edge) o pipelines de alto throughput donde el coste computacional por embedding es critico.

La relevancia de este modelo radica en su capacidad para ofrecer embeddings de calidad razonable con un coste computacional minimo. Aunque no se dispone de informacion detallada sobre el proceso de entrenamiento ni sobre los idiomas soportados, los benchmarks MTEB declarados por el autor permiten evaluar su rendimiento en tareas estandar de recuperacion y clasificacion en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 17.389.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors, pytorch y onnx) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch (bin), onnx |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura BERT de tipo transformer encoder, tal y como indican las etiquetas del repositorio (`bert`, `transformers`). Con 17,4 millones de parametros, se trata de una variante significativamente reducida respecto a los modelos BERT base (110M) o los BGE estandar, lo que sugiere una destilacion o un diseno compacto orientado a eficiencia. La libreria principal es sentence-transformers, lo que implica que el modelo esta optimizado para producir embeddings de frases y parrafos mediante pooling sobre las representaciones del encoder.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste contrastivo supervisado. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card unicamente incluye los resultados de evaluacion MTEB, sin detallar el proceso de entrenamiento.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica.
- Recuperacion de informacion (retrieval) en corpus documentales.
- Clasificacion de texto mediante representaciones vectoriales (evaluado en MTEB en tareas como AmazonCounterfactual, AmazonPolarity, AmazonReviews y Banking77).
- Clustering de documentos y frases (evaluado en ArxivClusteringP2P, ArxivClusteringS2S, BiorxivClusteringP2P y BiorxivClusteringS2S).
- Reranking de resultados de busqueda (evaluado en AskUbuntuDupQuestions).
- Evaluacion de similitud semantica textual (STS, evaluado en BIOSSES).
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face para despliegue como servicio.
- Soporte de exportacion a ONNX para inferencia optimizada.

## Casos de uso

- Busqueda semantica en documentacion tecnica: el modelo genera embeddings de fragmentos de documentacion y consultas de usuario, permitiendo recuperar los pasajes mas relevantes mediante similitud coseno. Su reducido tamano permite indexar corpus grandes con coste computacional bajo.
- Sistemas RAG (Retrieval-Augmented Generation): se utiliza como retriever ligero en pipelines donde se recuperan pasajes relevantes antes de pasarlos a un modelo generativo. Su compatibilidad con text-embeddings-inference facilita el despliegue como microservicio.
- Deduplicacion de contenido: el modelo permite detectar documentos o frases duplicadas o casi duplicadas en grandes corpus mediante clustering de embeddings, gracias a su rendimiento en tareas de clustering evaluadas en MTEB.
- Clasificacion de tickets de soporte: los embeddings generados pueden alimentar un clasificador ligero (regresion logistica, SVM) para categorizar tickets por tematica, aprovechando el rendimiento declarado en Banking77Classification (81,17% de accuracy).
- Reranking en motores de busqueda: tras una primera fase de recuperacion por BM25, el modelo puede reordenar los resultados calculando similitud semantica entre consulta y documento, tal y como se evalua en AskUbuntuDupQuestions (MAP 58,08, MRR 71,94).
- Moderacion de contenido y analisis de sentimiento: los embeddings pueden alimentar clasificadores para detectar polaridad o toxicidad en textos, apoyandose en el rendimiento en AmazonPolarityClassification (79,75% de accuracy).
- Agrupacion de articulos cientificos: el modelo permite agrupar publicaciones por tematica mediante clustering de embeddings, con resultados declarados en ArxivClusteringP2P (v-measure 44,53).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 67,76 |
| Classification | MTEB AmazonCounterfactualClassification (en) | ap | 29,64 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 61,31 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 79,75 |
| Classification | MTEB AmazonPolarityClassification | ap | 74,21 |
| Classification | MTEB AmazonPolarityClassification | f1 | 79,65 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 37,45 |
| Classification | MTEB AmazonReviewsClassification (en) | f1 | 37,02 |
| Classification | MTEB Banking77Classification | accuracy | 81,17 |
| Classification | MTEB Banking77Classification | f1 | 81,10 |
| Retrieval | MTEB ArguAna | map_at_10 | 46,70 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 55,31 |
| Retrieval | MTEB ArguAna | recall_at_10 | 82,79 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 38,09 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | ndcg_at_10 | 44,04 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 44,53 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 33,25 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 36,11 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 28,06 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 58,08 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 71,94 |
| STS | MTEB BIOSSES | cos_sim_spearman | 82,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (17,4M de parametros, aproximadamente 70 MB de pesos), y del orden de 35 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovechara la capacidad de las GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (etiqueta `text-embeddings-inference`), ONNX Runtime (pesos ONNX incluidos), endpoints de Hugging Face. No se confirma soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| arlenecc/bge-micro-v2 | 17,4M | no disponible | MIT | Hugging Face |
| BAAI/bge-small-en-v1.5 | no disponible en esta ficha | no disponible | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de benchmarks. La comparativa se limita a parametros, licencia y disponibilidad cuando estos datos estan accesibles.

## Limitaciones y advertencias

- El modelo no ha sido verificado de forma independiente: todos los resultados de benchmarks son declarados por el autor (`verified: false` en el model-index).
- No se especifican los idiomas soportados; los benchmarks MTEB son en ingles, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- No se documenta la longitud maxima de contexto, lo que impide garantizar el comportamiento en documentos largos.
- Riesgo de alucinacion no aplica directamente (no es un modelo generativo), pero los embeddings pueden producir similitudes espurias en dominios alejados de los datos de entrenamiento.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es MIT (permisiva para uso comercial), la falta de documentacion sobre el entrenamiento impide evaluar posibles restricciones derivadas de los datos utilizados.
- El repositorio se creo y actualizo en la misma fecha (2026-11-14), lo que sugiere una publicacion reciente sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/bge-micro-v2
