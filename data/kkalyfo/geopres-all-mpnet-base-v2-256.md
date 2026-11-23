# kkalyfo/geopres-all-mpnet-base-v2-256

## Resumen

GeoPres projection es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo (Konstantinos Kalyfommatos, segun el repositorio de GitHub enlazado en la model card). No es un modelo de lenguaje ni un encoder de frases entrenado desde cero: es un mapa lineal `W` de 256 x 768 entrenado con la libreria GeoPres para proyectar embeddings de `sentence-transformers/all-mpnet-base-v2` (768 dimensiones) a un espacio de 256 dimensiones preservando las distancias euclideas por pares. El backbone esta congelado y no se incluye en el repositorio, cuyo tamano es practicamente nulo (0.0 GB).

El problema que resuelve es el coste de almacenamiento y de busqueda en sistemas de recuperacion vectorial: reducir la dimensionalidad de los embeddings de 768 a 256 disminuye el espacio ocupado en la base de datos vectorial y acelera las busquedas por similitud, con el objetivo de mantener la estructura geometrica del espacio original. La propuesta se apoya en un articulo academico, "On Post-Hoc Dimensionality Reduction of Text Embeddings", presentado en OpenReview con indicacion de EACL 2027.

La relevancia es acotada y muy especifica: solo es util si ya se trabaja con `all-mpnet-base-v2` como encoder y se quiere reducir el coste de indexacion sin reentrenar el modelo. La informacion publica es escasa: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion) de 256 x 768 sobre embeddings de `sentence-transformers/all-mpnet-base-v2` |
| Parametros totales | 196.608 (256 x 768) en la matriz de proyeccion; el backbone no se incluye |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del backbone, no del proyector) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (heredados del backbone, no declarados) |
| Licencia | No disponible |
| Formato de pesos | Pesos cargables mediante la libreria `geopres` (`from_pretrained`); formato de fichero no especificado |

## Arquitectura y entrenamiento

La arquitectura es un unico mapa lineal `W` de dimension 256 x 768, entrenado con la libreria GeoPres para preservar las distancias euclideas por pares entre los embeddings de `sentence-transformers/all-mpnet-base-v2`. El backbone MPNet (768 dimensiones) permanece congelado y no forma parte del repositorio; la inferencia consiste en una sola multiplicacion matricial. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, el numero de pares utilizados ni si hubo fases de ajuste adicionales.

El unico detalle metodologico explicito es el objetivo de preservacion de distancias y la existencia de un articulo asociado (EACL 2027) que describe el enfoque de reduccion post-hoc. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa ni tecnicas de cuantizacion.

## Capacidades

- Proyeccion de embeddings de 768 a 256 dimensiones preservando distancias euclideas por pares.
- Codificacion de texto y reduccion en un solo paso mediante `GeoPres.embed(["texto"])`, que devuelve un tensor de forma (n, 256).
- Proyeccion de embeddings ya calculados externamente mediante `Projection.project(embeddings)`, sin descargar ni ejecutar el backbone.
- Integracion con pipelines existentes de `all-mpnet-base-v2` (TEI, bases de datos vectoriales, procesos por lotes) siempre que se respeten el pooling, la normalizacion y los prefijos del entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: no es un modelo generativo.
- Capacidades multilingues no declaradas; dependen exclusivamente del backbone subyacente.

## Casos de uso

- Reduccion de costes de almacenamiento en bases de datos vectoriales: si ya se indexan embeddings de `all-mpnet-base-v2`, aplicar la proyeccion reduce cada vector de 768 a 256 componentes (un 66,7 % menos de dimensiones) sin reentrenar el encoder.
- Aceleracion de busquedas por similitud: la distancia euclidea o coseno sobre 256 dimensiones requiere menos operaciones por comparacion, lo que reduce la latencia en indices de recuperacion densa a gran escala.
- Reindexacion por lotes de corpus existentes: la API `Projection.project` permite transformar embeddings ya almacenados sin volver a codificar el texto ni descargar el backbone.
- Sistemas de recuperacion aumentada (RAG) con restricciones de memoria: util en despliegues donde el indice vectorial debe caber en RAM limitada y el encoder ya es `all-mpnet-base-v2`.
- Deduplicacion y clustering de documentos: la preservacion de distancias por pares mantiene la estructura de vecindad, lo que sirve para agrupar textos similares sobre el espacio reducido.
- Experimentacion academica en reduccion post-hoc: permite reproducir y comparar el metodo GeoPres frente a PCA u otras proyecciones lineales sobre un backbone estandar.
- Busqueda semantica en dispositivos con recursos limitados: al eliminar la dependencia del backbone en la fase de proyeccion, se puede aplicar en el lado cliente o en servicios ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de retencion de distancias, comparaciones con PCA ni evaluaciones en tareas de recuperacion (MTEB u otras).

## Requisitos de hardware

- VRAM para la proyeccion: practicamente despreciable; la matriz de 256 x 768 ocupa menos de 1 MB en precision completa.
- VRAM para el pipeline completo: la determina el backbone `all-mpnet-base-v2` (aproximadamente 110 millones de parametros), no este repositorio.
- GPU recomendadas: cualquier GPU consumer basta para la proyeccion; para la codificacion con el backbone, una RTX 3060 o superior es suficiente.
- Cabe en cualquier GPU consumer e incluso en CPU para la fase de proyeccion.
- Opciones de despliegue: libreria `geopres` (unica via documentada); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una multiplicacion matricial, el coste es marginal frente a la codificacion del backbone.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoPres all-mpnet-base-v2-256 | Proyeccion lineal post-hoc | 256 | all-mpnet-base-v2 | No disponible | Hugging Face (0 descargas) |
| PCA sobre all-mpnet-base-v2 | Proyeccion lineal post-hoc | Configurable | all-mpnet-base-v2 | No aplica | Implementacion propia |
| all-mpnet-base-v2 original | Encoder de frases | 768 | MPNet | Apache 2.0 (segun el modelo original) | Hugging Face |
| all-MiniLM-L6-v2 | Encoder de frases nativo | 384 | MiniLM | Apache 2.0 (segun el modelo original) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo es valido para embeddings generados por `sentence-transformers/all-mpnet-base-v2` con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier otra configuracion invalida la proyeccion.
- No es un modelo generativo ni un encoder autonomo: no puede codificar texto sin el backbone.
- Sin licencia declarada, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- Sin idiomas declarados ni evaluacion multilingue publicada.
- Sin benchmarks: se desconoce la perdida real de calidad en tareas de recuperacion respecto al espacio de 768 dimensiones.
- Repositorio sin descargas ni validacion de la comunidad; riesgo de mantenimiento y de soporte de la libreria `geopres`.
- Riesgo de alucinacion no aplicable (no genera texto), pero si de degradacion silenciosa de la calidad de recuperacion si se aplica fuera de las condiciones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-all-mpnet-base-v2-256
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Backbone: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Paper (OpenReview, EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
