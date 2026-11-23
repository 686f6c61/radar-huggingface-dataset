# kkalyfo/geopres-all-mpnet-base-v2-32

## Resumen

GeoPres es una proyección lineal entrenada para reducir las representaciones del modelo de embeddings `sentence-transformers/all-mpnet-base-v2` de 768 a 32 dimensiones, preservando las distancias euclídeas por pares entre embeddings. Lo desarrolla kkalyfo (konstantinoskalyfommatos) y se publica bajo la librería `geopres`, en el contexto del artículo "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027).

No se trata de un modelo de lenguaje generativo ni de un encoder independiente: es un mapa lineal `W` de forma 32 x 768 que se aplica sobre embeddings ya calculados por el backbone congelado. El backbone no se incluye en el repositorio y debe obtenerse por separado.

Su relevancia práctica está en la compresión de índices vectoriales: reducir la dimensionalidad de 768 a 32 abarata el almacenamiento y acelera la búsqueda por similitud, manteniendo (por construcción del entrenamiento) la estructura de distancias del espacio original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyección lineal post-hoc (mapa `W` de 32 x 768) sobre embeddings de `all-mpnet-base-v2` |
| Parámetros totales | 24.576 (matriz 32 x 768; el backbone no se incluye) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone, no especificada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `geopres`) |

## Arquitectura y entrenamiento

La pieza entrenada es un mapa lineal `W` de 32 x 768 que proyecta embeddings de 768 dimensiones a 32. El criterio de entrenamiento es la preservación de distancias euclídeas por pares entre los embeddings de `sentence-transformers/all-mpnet-base-v2`. El backbone permanece congelado y no forma parte del repositorio; en inferencia, la reducción consiste en una única multiplicación de matrices.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas adicionales (regularización, destilación de distancias, etc.) más allá del objetivo declarado de preservar distancias. Tampoco se especifican los hiperparámetros del entrenamiento ni el procedimiento exacto de ajuste.

## Capacidades

- Reducción de dimensionalidad de embeddings de texto de 768 a 32 dimensiones mediante una proyección lineal entrenada.
- Preservación de distancias euclídeas por pares, orientada a mantener la estructura geométrica del espacio original.
- Dos modos de uso: codificación de texto y reducción en un solo paso (`GeoPres.embed`) o proyección de embeddings ya calculados (`Projection.project`), sin descargar el backbone en este segundo caso.
- Integración con la librería `geopres`.
- No es un modelo generativo: no produce texto, no razona, no ejecuta código y no soporta tool calling ni agentes.
- No se documentan capacidades multilingües propias; dependen del backbone `all-mpnet-base-v2`.

## Casos de uso

- Compresión de índices vectoriales: aplicar `Projection.project` sobre embeddings almacenados para pasar de 768 a 32 dimensiones, reduciendo el espacio de almacenamiento en un factor de 24 y abaratando la memoria de los índices en bases de datos vectoriales.
- Búsqueda por similitud a gran escala: usar los vectores de 32 dimensiones para calcular distancias euclídeas con menor coste computacional por consulta, manteniendo la estructura de distancias del espacio original.
- Recuperación en dos etapas: filtrar candidatos con los embeddings reducidos y reordenar después con los vectores completos de 768 dimensiones para recuperar precisión.
- Deduplicación y clustering de documentos: agrupar textos por proximidad en un espacio de 32 dimensiones, donde las operaciones de clustering son más rápidas y caben en memoria.
- Despliegue en entornos con recursos limitados: proyectar embeddings en pipelines ya existentes (TEI, base de datos vectorial, proceso batch) sin necesidad de ejecutar el backbone en el momento de la reducción.
- Experimentación en investigación sobre reducción de dimensionalidad: servir como referencia reproducible de una proyección entrenada con el método GeoPres para comparar con PCA, UMAP u otras técnicas post-hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La proyección en sí es una multiplicación de matrices de 32 x 768: cabe en CPU y no requiere GPU.
- El modo `Projection.project` no descarga el backbone, por lo que solo necesita los embeddings de entrada ya calculados.
- El modo `GeoPres.embed` requiere ejecutar `sentence-transformers/all-mpnet-base-v2` (no incluido), cuyos requisitos de VRAM dependen de ese modelo y no se detallan en la información disponible.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI) ni latencias o throughput estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensionalidad de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| GeoPres (este modelo) | Proyección lineal post-hoc sobre `all-mpnet-base-v2` | 32 | no disponible | Hugging Face (`kkalyfo/geopres-all-mpnet-base-v2-32`) |
| `sentence-transformers/all-mpnet-base-v2` | Encoder de frases (backbone) | 768 | no disponible en la información | Hugging Face |
| PCA / UMAP | Reducción de dimensionalidad genérica | configurable | según implementación | Librerías estándar |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo es válido para embeddings generados por `sentence-transformers/all-mpnet-base-v2` con el mismo pooling, normalización y prefijos que los datos de entrenamiento; cualquier otra fuente de embeddings invalida la proyección.
- La reducción a 32 dimensiones implica pérdida de información; no se documenta cuantitativamente cuánta precisión se sacrifica en tareas downstream.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; al no ser un modelo generativo, el riesgo de alucinación no aplica directamente, pero los sesgos del backbone pueden propagarse a los embeddings reducidos.
- El repositorio tiene 0 descargas y 0 likes, y el formato exacto de los pesos no se indica; conviene verificar la integridad y compatibilidad con la versión de la librería `geopres` antes de usarlo en producción.
- No se detallan requisitos de versión de la librería ni dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-all-mpnet-base-v2-32
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Backbone: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Artículo (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
