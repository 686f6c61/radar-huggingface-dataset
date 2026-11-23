# kkalyfo/geopres-all-mpnet-base-v2-64

## Resumen

`kkalyfo/geopres-all-mpnet-base-v2-64` no es un modelo de lenguaje, sino una proyección lineal entrenada con la librería GeoPres que reduce embeddings de 768 a 64 dimensiones preservando las distancias euclídeas por pares. El artefacto publicado es una matriz `W` de 64 x 768 que se aplica sobre las representaciones del backbone congelado `sentence-transformers/all-mpnet-base-v2`, que no se incluye en el repositorio.

El objetivo es el post-procesado de embeddings de texto: comprimir representaciones densas para abaratar almacenamiento vectorial, acelerar la búsqueda por similitud y reducir el coste de índices ANN, manteniendo la estructura métrica del espacio original. Frente a alternativas como PCA, quantización o truncado directo, GeoPres plantea un aprendizaje supervisado de la proyección para preservar distancias.

Es relevante en el contexto de sistemas RAG y motores de búsqueda semántica, donde el coste dominante suele ser el almacenamiento e indexación de vectores. La ficha se basa únicamente en la model card publicada; el repositorio no contiene pesos del backbone, no declara licencia ni idiomas, y no se han publicado benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (matriz `W` de 64 x 768) sobre embeddings de un transformer congelado |
| Parametros totales | 49.152 (matriz 64 x 768); el backbone `all-mpnet-base-v2` (~109 M) no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone, no declarada en el repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía librería `geopres`) |

## Arquitectura y entrenamiento

La pieza publicada es una transformación lineal que mapea un vector de 768 dimensiones a uno de 64. Se entrena con GeoPres para preservar las distancias euclídeas por pares entre embeddings de `sentence-transformers/all-mpnet-base-v2`. El backbone permanece congelado y no forma parte del repositorio: la inferencia consiste en una única multiplicación de matrices una vez obtenido el embedding de 768 dimensiones.

La model card no detalla el número de tokens, la composición del dataset de entrenamiento ni si hubo ajuste fino adicional. La referencia metodológica es el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027). Es crítico que la entrada se calcule con el mismo pooling, normalización y prefijos que los datos de entrenamiento; de lo contrario, la proyección deja de ser válida.

## Capacidades

- Reducción de dimensionalidad de embeddings de texto de 768 a 64 dimensiones.
- Preservación de distancias euclídeas por pares, orientada a tareas de similitud y recuperación.
- Dos modos de uso: `GeoPres.embed(textos)` codifica y proyecta, o `Projection.project(embeddings)` proyecta vectores ya calculados.
- Aplicable a embeddings preexistentes procedentes de TEI, bases de datos vectoriales o procesos batch.
- No genera texto, no razona, no soporta tool calling ni agentes.
- No dispone de capacidades multimodales, de audio ni de modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Indexación vectorial de bajo coste en RAG: proyectar los embeddings de 768 a 64 dimensiones antes de insertarlos en un índice ANN reduce el almacenamiento y el ancho de banda de memoria en un factor de 12, manteniendo la estructura de distancias para la recuperación.
- Búsqueda semántica a gran escala: con vectores de 64 dimensiones, el cálculo de similitud por consulta es más barato y permite servir más peticiones por GPU o CPU en despliegues con millones de documentos.
- Deduplicación y clustering de documentos: agrupar textos por similitud usando los vectores reducidos, útil para limpieza de corpus y análisis temático.
- Re-ranking ligero en pipelines de recuperación: usar la proyección como primera etapa de filtrado antes de un re-ranking más costoso con el modelo completo.
- Reducción de costes en bases de datos vectoriales: migrar índices existentes de `all-mpnet-base-v2` a 64 dimensiones con una única multiplicación de matrices, sin reentrenar el backbone.
- Experimentación en investigación sobre compresión de embeddings: comparar GeoPres frente a PCA o quantización en tareas de retrieval, usando la proyección como baseline reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para la proyección: despreciable; la matriz de 64 x 768 ocupa unos 196 KB en float32.
- VRAM para el backbone: `all-mpnet-base-v2` (~109 M de parámetros) requiere aproximadamente 0,4 GB en float32 y menos de 0,2 GB en float16, además de memoria para activaciones y batch.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para el backbone; la proyección no requiere GPU.
- Cabe en GPU consumer: sí, con holgura.
- Opciones de despliegue: la proyección se aplica con la librería `geopres`; el backbone puede servirse con Text Embeddings Inference (TEI), sentence-transformers o vLLM en modo embedding, aplicando después `Projection.project` sobre los vectores resultantes.
- Latencia y throughput: no disponibles en la información publicada; la proyección añade una única multiplicación de matrices al coste del backbone.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones de salida | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkalyfo/geopres-all-mpnet-base-v2-64 | Proyección lineal post-hoc | 64 | all-mpnet-base-v2 (congelado) | no disponible | Hugging Face |
| PCA sobre all-mpnet-base-v2 | Reducción lineal clásica | configurable (p. ej. 64) | all-mpnet-base-v2 | N/A | Implementación propia |
| all-mpnet-base-v2 (original) | Modelo de embeddings | 768 | — | no disponible en esta ficha | Hugging Face |
| Quantización int8 de embeddings | Compresión por precisión | 768 (int8) | all-mpnet-base-v2 | N/A | Implementación propia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta embeddings de `sentence-transformers/all-mpnet-base-v2` calculados con el mismo pooling, normalización y prefijos que los datos de entrenamiento; otra configuración invalida la proyección.
- El backbone no está incluido en el repositorio y debe descargarse por separado.
- La compresión a 64 dimensiones puede degradar la precisión en tareas de retrieval muy sensibles; no se han publicado métricas que cuantifiquen esa pérdida.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos con el autor.
- Idiomas soportados no declarados; no hay garantía documentada de comportamiento multilingüe más allá del backbone.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de recuperaciones incorrectas si la proyección se aplica sobre embeddings incompatibles.
- Fecha de creación en el repositorio (2026-11-23) posterior a la fecha habitual de consulta: verificar la vigencia y el estado del artefacto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/kkalyfo/geopres-all-mpnet-base-v2-64
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Backbone: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Paper (OpenReview, EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
