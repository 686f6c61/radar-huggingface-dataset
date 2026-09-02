# JONNYVERSE/all-MiniLM-L12-v2

## Resumen

El modelo `JONNYVERSE/all-MiniLM-L12-v2` es una conversión a formato ONNX del popular modelo de embeddings `sentence-transformers/all-MiniLM-L12-v2`, realizada por el usuario JONNYVERSE para hacerlo compatible con la librería Transformers.js. Este modelo permite generar representaciones vectoriales densas de frases y párrafos cortos, con una dimensionalidad de 384, y está pensado para tareas como búsqueda semántica, similitud de textos, clustering y clasificación. Su principal valor radica en que facilita el despliegue de modelos de embeddings directamente en el navegador o en entornos JavaScript, sin necesidad de infraestructura de servidor dedicada.

El modelo base fue desarrollado por el equipo de sentence-transformers, basado en la arquitectura MiniLM de Microsoft (MiniLM-L12-H384-uncased), y fue entrenado mediante aprendizaje contrastivo sobre más de 1.170 millones de pares de frases. Esta versión ONNX mantiene las mismas capacidades y pesos que el original, pero en un formato optimizado para inferencia en entornos web y edge. Aunque el repositorio no especifica licencia ni idiomas soportados, se asume que hereda las características del modelo original, cuya licencia es Apache 2.0 y cuyo idioma principal es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12-H384-uncased) |
| Parametros totales | 22.7 millones (del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio |
| Idiomas soportados | no especificado (el modelo base está orientado al inglés) |
| Licencia | no disponible en el repositorio; el modelo base usa Apache 2.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo base `sentence-transformers/all-MiniLM-L12-v2` emplea una arquitectura Transformer encoder de 12 capas con una dimensión oculta de 384, derivada de MiniLM-L12-H384-uncased. Fue entrenado mediante aprendizaje contrastivo sobre 1.170 millones de pares de frases, utilizando una función de pérdida de similitud coseno y técnicas de minería de pares difíciles. El entrenamiento se realizó con JAX y TensorFlow, y el modelo resultante produce embeddings normalizados de 384 dimensiones.

Esta versión ONNX no introduce cambios en la arquitectura ni en los pesos; simplemente convierte los parámetros al formato ONNX para que puedan ejecutarse con Transformers.js y ONNX Runtime en entornos JavaScript. No se ha aplicado ninguna técnica adicional como cuantización o destilación, a menos que se indique lo contrario en el repositorio.

## Capacidades

- Generacion de embeddings densos de 384 dimensiones para frases y parrafos cortos.
- Similitud semantica entre textos mediante similitud coseno o producto escalar.
- Busqueda semantica y recuperacion de informacion en colecciones de documentos.
- Clustering y agrupacion de textos por contenido.
- Deteccion de duplicados y parafraseo.
- Clasificacion de textos mediante la comparacion de embeddings con representaciones de clases.
- Compatibilidad con Transformers.js, lo que permite su uso en navegador, Node.js y entornos edge.
- Al ser una conversion ONNX, puede ejecutarse con ONNX Runtime en diversas plataformas.

## Casos de uso

- Busqueda semantica en aplicaciones web: el modelo se puede cargar directamente en el navegador mediante Transformers.js para indexar y buscar documentos sin enviar consultas a un servidor. Su tamano reducido (22.7M parametros) permite una carga rapida y una latencia baja en clientes con CPU.
- Chatbots y asistentes con recuperacion de conocimiento: al convertir preguntas y fragmentos de documentos en embeddings, se puede implementar un sistema de recuperacion aumentada (RAG) en el cliente, reduciendo la carga del backend.
- Moderacion de contenido: clasificar comentarios o publicaciones en categorias (positivo, negativo, spam, etc.) comparando sus embeddings con representaciones de referencia.
- Deduplicacion de registros en CRM o bases de datos: detectar entradas duplicadas o casi duplicadas comparando embeddings de nombres, direcciones o descripciones.
- Clustering de articulos o noticias: agrupar documentos por tematica para generar resumenes o recomendaciones.
- Analisis de encuestas y feedback: agrupar respuestas abiertas en temas comunes para extraer insights sin etiquetado manual.
- Busqueda de codigo o documentacion tecnica: indexar fragmentos de codigo o parrafos de documentacion y permitir busquedas por similitud semantica en herramientas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base `sentence-transformers/all-MiniLM-L12-v2` tiene resultados publicados en el leaderboard de sentence-transformers, donde muestra un buen equilibrio entre rendimiento y tamano en tareas de similitud semantica (por ejemplo, en el benchmark STS), aunque no se dispone de cifras concretas en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 22.7M parametros, su huella de memoria es muy reducida. En formato ONNX, el modelo ocupa aproximadamente 90 MB en precision FP32 (0.5 GB es el tamano total del repositorio, que puede incluir versiones cuantizadas o adicionales).
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU de cualquier equipo moderno, incluyendo portatiles y dispositivos moviles.
- Compatibilidad con consumer GPU: si se dispone de una GPU, incluso integradas como las de Intel o AMD, la inferencia sera muy rapida, pero no es necesaria.
- Opciones de despliegue: Transformers.js (navegador, Node.js), ONNX Runtime (Python, C++, etc.), y cualquier plataforma que soporte ONNX.
- Latencia: en CPU, la generacion de un embedding para una frase corta suele tomar menos de 10 ms en hardware moderno. En GPU, la latencia es practicamente despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto maximo | Licencia | Formato |
|---|---|---|---|---|---|
| all-MiniLM-L12-v2 (este) | 22.7M | 384 | 256 | Apache 2.0 (base) | ONNX |
| all-MiniLM-L6-v2 | 22.7M (6 capas, ~22.7M? En realidad es 22.7M tambien, pero con 6 capas) | 384 | 256 | Apache 2.0 | ONNX, safetensors |
| bge-small-en | 33.4M | 384 | 512 | MIT | safetensors |
| paraphrase-MiniLM-L3-v2 | 11.9M | 384 | 256 | Apache 2.0 | safetensors |

Nota: los datos de los modelos comparados provienen de informacion publica general; no se han verificado en la documentacion proporcionada. El modelo all-MiniLM-L12-v2 ofrece un rendimiento superior a la version L6 a cambio de un tamano ligeramente mayor, y es comparable en tamano a bge-small-en, aunque con una ventana de contexto menor.

## Limitaciones y advertencias

- El modelo base esta entrenado principalmente con datos en ingles, por lo que su rendimiento en otros idiomas puede ser inferior. No se especifica soporte multilingue en el repositorio.
- La longitud de contexto esta limitada a 256 tokens; textos mas largos deben truncarse o dividirse en fragmentos.
- Al ser un modelo pequeno, puede tener un rendimiento inferior en tareas que requieren comprension profunda del lenguaje o en dominios muy especializados.
- No se ha publicado informacion sobre sesgos o alucinaciones especificas para esta conversion, pero el modelo base hereda los sesgos de los datos de entrenamiento.
- La licencia del repositorio no esta especificada; aunque el modelo base usa Apache 2.0, se recomienda consultar la licencia del repo antes de uso comercial.
- La conversion ONNX puede no incluir optimizaciones especificas (como cuantizacion int8) que reduzcan el tamano y mejoren la velocidad; el tamano de 0.5 GB del repo sugiere que podria contener multiples versiones, pero no se detalla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/all-MiniLM-L12-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Optimum (conversion a ONNX): https://huggingface.co/docs/optimum/index
