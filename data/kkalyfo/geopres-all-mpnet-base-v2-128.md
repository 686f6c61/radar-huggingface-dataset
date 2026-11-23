# kkalyfo/geopres-all-mpnet-base-v2-128

## Resumen

GeoPres projection es un artefacto de reducción de dimensionalidad publicado por el usuario kkalyfo (Konstantinos Kalyfommatos, según el repositorio enlazado en la model card). No es un modelo de lenguaje en sentido estricto, sino una proyección lineal `W` de dimensiones 128 x 768 entrenada para transformar embeddings de 768 dimensiones producidos por `sentence-transformers/all-mpnet-base-v2` en representaciones de 128 dimensiones, preservando las distancias euclídeas por pares del espacio original. El problema que resuelve es el coste de almacenamiento y de cómputo en bases de datos vectoriales: reducir un embedding de 768 a 128 dimensiones multiplica por seis la densidad de almacenamiento y acelera la búsqueda por similitud.

La pieza publicada contiene únicamente la matriz de proyección; el backbone MPNet (aproximadamente 109 millones de parámetros) es congelado y no se incluye en el repositorio, que ocupa 0.0 GB. El método se describe en el artículo "On Post-Hoc Dimensionality Reduction of Text Embeddings", aceptado en EACL 2027 según la model card. La relevancia actual reside en que permite reutilizar infraestructura de embeddings ya desplegada sin reentrenar el encoder ni cambiar de modelo base, aplicando una única multiplicación de matrices en tiempo de inferencia.

La librería asociada, `geopres`, expone dos modos de uso: un pipeline completo que codifica texto y reduce la salida, y un modo `Projection` que opera sobre embeddings ya calculados (por ejemplo, procedentes de un servidor TEI o de una base de datos vectorial), sin descargar el backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (matriz W de 128 x 768) sobre embeddings de sentence-transformers/all-mpnet-base-v2 |
| Parametros totales | 98 304 (128 x 768) en la matriz de proyección; el backbone MPNet no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone, no documentado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del backbone, no documentados) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no especifica safetensors ni GGUF; se carga mediante `geopres`) |

## Arquitectura y entrenamiento

La arquitectura es una transformación lineal pura: una matriz `W` de 128 filas por 768 columnas que mapea el espacio de embeddings de `all-mpnet-base-v2` a un espacio latente de 128 dimensiones. El objetivo de entrenamiento es la preservación de distancias euclídeas por pares entre los embeddings originales, según indica la model card. No hay capas no lineales, atención ni componentes recurrentes: la inferencia es una única multiplicación de matrices.

El backbone `sentence-transformers/all-mpnet-base-v2` permanece congelado y no forma parte del repositorio. La model card no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de regularización o validación cruzada. Tampoco se especifican hiperparámetros de optimización. La innovación técnica declarada es el propio método GeoPres de reducción post-hoc, descrito en el artículo de EACL 2027 enlazado, que busca preservar la geometría del espacio de embeddings en lugar de optimizar una tarea supervisada concreta.

Un requisito crítico documentado es que la entrada debe ser embeddings de `all-mpnet-base-v2` calculados con el mismo pooling, normalización y prefijos que los datos de entrenamiento. Cualquier desviación en el preprocesado invalida la proyección.

## Capacidades

- Reducción de dimensionalidad de embeddings de texto: transforma vectores de 768 a 128 dimensiones preservando distancias euclídeas.
- Proyección de embeddings precalculados sin reencodificar texto, mediante la clase `Projection` de la librería `geopres`.
- Pipeline completo de codificación y reducción, mediante la clase `GeoPres`.
- No genera texto, no razona, no responde preguntas ni ejecuta código: es exclusivamente un componente de post-procesado de representaciones vectoriales.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas en la información proporcionada; dependerían del backbone, que no se describe.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Compresión de índices vectoriales existentes: si una organización ya indexa documentos con `all-mpnet-base-v2` en una base de datos como Qdrant, Milvus o pgvector, puede aplicar `Projection.project()` sobre los vectores almacenados para reducir el espacio ocupado aproximadamente a una sexta parte (128/768 dimensiones), manteniendo la ordenación por similitud euclídea.
- Búsqueda semántica de bajo coste en producción: la inferencia se reduce a una multiplicación de matrices de 128 x 768, lo que permite aplicar la proyección en el lado del servidor de embeddings o en un batch job sin añadir latencia perceptible.
- Deduplicación y clustering de documentos a gran escala: al preservar distancias por pares, los algoritmos de clustering (k-means, HDBSCAN) y de detección de duplicados cercanos operan sobre vectores cuatro veces más pequeños, reduciendo memoria y tiempo de cómputo.
- Sistemas de recomendación basados en similitud de texto: la proyección permite comparar ítems descritos textualmente con un coste de almacenamiento menor en el índice de candidatos, manteniendo la geometría relativa entre ítems.
- Pipelines de recuperación aumentada (RAG) con restricciones de memoria: en despliegues edge o en contenedores con límites estrictos de RAM, los embeddings de 128 dimensiones reducen el footprint del índice y permiten mantener más documentos en memoria.
- Migración incremental de infraestructura vectorial: al no requerir reentrenar el encoder ni cambiar el modelo base, permite adoptar dimensiones reducidas en un índice nuevo y comparar resultados contra el índice original de 768 dimensiones antes de conmutar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de preservación de distancias, recuperación (recall@k), ni comparaciones cuantitativas con otras técnicas de reducción como PCA o UMAP.

## Requisitos de hardware

- VRAM estimada para la proyección: inferior a 1 MB para la matriz de 128 x 768 en precisión de 32 bits; despreciable en cualquier GPU.
- VRAM estimada para el pipeline completo: depende del backbone `all-mpnet-base-v2` (aproximadamente 109 millones de parámetros), que no se incluye en este repositorio y cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para el backbone; la proyección en sí no requiere GPU.
- Cabe en cualquier GPU consumer e incluso en CPU para el modo `Projection`.
- Opciones de despliegue: la librería `geopres` es el único mecanismo documentado. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un artefacto de proyección.
- Latencia y throughput: no disponibles. Al ser una multiplicación de matrices, la latencia esperada es muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con PCA, UMAP, autoencoders de reducción dimensional ni otras proyecciones lineales publicadas sobre `all-mpnet-base-v2`, ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Solo es válido para embeddings generados por `sentence-transformers/all-mpnet-base-v2` con el mismo pooling, normalización y prefijos que los datos de entrenamiento; cualquier otro encoder o preprocesado produce resultados incorrectos.
- No es un modelo generativo: no puede emplearse para tareas de lenguaje, razonamiento, código o diálogo.
- La licencia no está especificada en la información disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de integrarlo en producción.
- Los idiomas soportados no están documentados; cualquier limitación lingüística heredada del backbone es desconocida a partir de esta ficha.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-23), lo que indica ausencia de validación comunitaria.
- No se publican métricas de preservación de distancias ni de impacto en tareas downstream (recall, precisión de recuperación), por lo que la pérdida de calidad frente al espacio de 768 dimensiones es desconocida.
- El artículo de referencia está aceptado en EACL 2027 según la model card, pero no se aportan resultados reproducibles en el repositorio.
- Riesgo de alucinación: no aplica directamente al no ser un modelo generativo, pero sí existe riesgo de resultados sesgados si la proyección se aplica a distribuciones de texto distintas de las del entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kkalyfo/geopres-all-mpnet-base-v2-128
- Repositorio de la librería GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Artículo (OpenReview, EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
- Backbone: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
