# NeuML/colbert-atto-170-8d

## Resumen

ColBERT Atto 170 8d es un modelo de recuperación de información basado en late interaction (estilo ColBERT) desarrollado por NeuML, construido sobre el modelo base NeuML/atto-168-8d. Forma parte de la familia Atto, un conjunto de modelos contextuales compactos disenados para aprendizaje de representaciones de lenguaje con eficiencia de parámetros. El modelo se ha ajustado con PyLate, la librería de LightOn para entrenamiento de modelos ColBERT, y se distribuye bajo licencia Apache 2.0.

La particularidad de este modelo es su extremo minimalismo: tan solo 170 parámetros, 8 dimensiones de embedding y un vocabulario de 74 tokens. No es un modelo generativo ni un encoder convencional de propósito general, sino un reranker/retriever de late interaction pensado para integrarse en pipelines de búsqueda semántica y RAG, especialmente en escenarios donde el coste computacional y el tamano del modelo son críticos.

Es relevante ahora porque ejemplifica la tendencia hacia modelos de recuperación ultra-ligeros que pueden ejecutarse en cualquier hardware, incluso en entornos embebidos o con recursos muy limitados. Su utilidad práctica está acotada a reranking dentro de pipelines más amplios (txtai, Sentence Transformers) y sirve como punto de referencia inferior en la escala de la familia Atto, que va desde 170 parámetros hasta 25 millones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (AttoModel) con late interaction ColBERT |
| Parametros totales | 170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 399 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 8 |
| Vocabulario | 74 tokens |
| Libreria | sentence-transformers, PyLate, txtai |
| Modelo base | NeuML/atto-168-8d |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura ColBERT de late interaction sobre un transformer AttoModel con una longitud máxima de secuencia de 399 tokens. La representación se realiza mediante multi-vector encoding: cada documento y consulta se codifica en una secuencia de embeddings de 8 dimensiones, y la puntuación se calcula mediante MaxSim (suma de similitudes máximas token a token). El vocabulario de solo 74 tokens y las 8 dimensiones de embedding lo convierten en el miembro más pequeno de la familia Atto.

El ajuste fino se realizó con PyLate, con un batch size de 32 por dispositivo, una única época, learning rate de 0.01, warmup del 5% de los pasos, fp16 activado, estrategia de evaluación por pasos y 20 workers de dataloader. No se especifica en la información disponible el volumen ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de recuperación). El modelo base es NeuML/atto-168-8d, también de la familia Atto.

## Capacidades

- Recuperación de información mediante late interaction (ColBERT-style) con scoring MaxSim.
- Generación de embeddings multi-vector para consultas y documentos (`encode_query` / `encode_document`).
- Reranking dentro de pipelines de búsqueda semántica.
- Integración con txtai 9.0+ para construir bases de datos de embeddings y fuentes de conocimiento para RAG.
- Carga directa como `MultiVectorEncoder` en Sentence Transformers v6.0.0+.
- Soporte de feature extraction y sentence similarity como pipeline tags.
- Capacidades multilingües: solo inglés.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Reranking en pipelines de búsqueda semántica: el modelo puede reordenar los resultados de un retriever de primera etapa usando late interaction, aprovechando su coste computacional mínimo para afinar la relevancia en dominios con vocabulario muy restringido.
- Búsqueda semántica en entornos con recursos extremos: con solo 170 parámetros y 8 dimensiones, puede desplegarse en dispositivos embebidos, microcontroladores o funciones serverless donde ningún otro modelo de recuperación cabría.
- Fuente de conocimiento para RAG en txtai: se integra como `Embeddings` o `Reranker` en txtai 9.0+, permitiendo construir índices vectoriales de bajo coste para recuperación aumentada.
- Pruebas de concepto y benchmarking de pipelines: sirve como baseline inferior para medir la ganancia de modelos mayores de la familia Atto (840, 9K, 90K, 950K, 4M, 14M, 25M) en el mismo pipeline.
- Experimentación educativa con late interaction: su tamano permite estudiar el funcionamiento interno de ColBERT y MaxSim sin necesidad de GPU.
- Filtrado rápido de candidatos en dominios de vocabulario cerrado: útil cuando los documentos y consultas comparten un conjunto muy limitado de tokens (por ejemplo, etiquetas, códigos o categorías).

## Benchmarks y rendimiento

Resultados de un subconjunto de BEIR (ndcg@10) reportados por el autor con el script de benchmarks de txtai:

| Modelo | Params | Dims | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-170-8d | 170 | 8 | 74 | 0.0965 | 0.1178 | 0.1641 | 0.1261 |
| colbert-atto-840-8d | 840 | 8 | 250 | 0.2143 | 0.2585 | 0.4688 | 0.3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0.2459 | 0.2902 | 0.5604 | 0.3655 |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0.3435 | 0.3263 | 0.6663 | 0.4454 |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0.4149 | 0.3352 | 0.6946 | 0.4816 |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0.4157 | 0.3349 | 0.6949 | 0.4818 |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0.4248 | 0.3483 | 0.7057 | 0.4929 |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0.4395 | 0.3461 | 0.7130 | 0.4995 |
| LateOn | 110M | 768 | 50K | 0.4979 | 0.3802 | 0.7609 | 0.5463 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp16 (170 parámetros); puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en Raspberry Pi y dispositivos similares.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: txtai 9.0+, Sentence Transformers v6.0.0+ (MultiVectorEncoder), PyLate.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamano del modelo se espera latencia despreciable, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Params | Dims | Vocab | Media BEIR (ndcg@10) | Licencia |
|---|---:|---:|---:|---:|---|
| colbert-atto-170-8d | 170 | 8 | 74 | 0.1261 | apache-2.0 |
| colbert-atto-840-8d | 840 | 8 | 250 | 0.3139 | no disponible |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0.3655 | no disponible |
| LateOn | 110M | 768 | 50K | 0.5463 | no disponible |

La comparativa se limita a los modelos de la propia familia Atto y a LateOn, los únicos con datos en la información disponible. El modelo es el escalón inferior de la familia y su rendimiento es sustancialmente menor que el de sus hermanos mayores y que LateOn, lo que refleja su carácter de baseline minimalista.

## Limitaciones y advertencias

- Rendimiento muy bajo en BEIR (media 0.1261 ndcg@10), insuficiente para la mayoría de aplicaciones de recuperación en producción.
- Vocabulario de solo 74 tokens: no cubre vocabulario general, por lo que su utilidad queda restringida a dominios con vocabulario cerrado o como baseline.
- Solo soporta inglés.
- Longitud de contexto de 399 tokens, insuficiente para documentos largos.
- No es un modelo generativo: no puede usarse para chat, razonamiento, código ni tool calling.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de recuperaciones irrelevantes por la limitación del vocabulario y las dimensiones.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento limitado hace desaconsejable su uso en producción salvo como componente auxiliar o baseline.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni cuantizaciones disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-170-8d
- Modelo base: https://huggingface.co/NeuML/atto-168-8d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Documentación de Sentence Transformers: https://www.sbert.net/
- Modelo LateOn (comparativa): https://hf.co/lightonai/lateon
