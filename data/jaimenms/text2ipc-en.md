# jaimenms/text2ipc-en

## Resumen

text2ipc-en es un sistema de clasificación automática de textos hacia la International Patent Classification (IPC), publicado por el usuario jaimenms en HuggingFace. No es un modelo generativo ni un transformer entrenado desde cero: es un pipeline de recuperación semántica que combina un bi-encoder de embeddings (intfloat/multilingual-e5-base) con un cross-encoder de reranking opcional (BAAI/bge-reranker-v2-m3). El repositorio contiene un índice vectorial precalculado sobre el esquema IPC 20260101, el esquema jerárquico en sí y un handler personalizado para Inference Endpoints de HuggingFace.

El problema que resuelve es concreto y costoso en la práctica: dado el título, el resumen o la descripción completa de una solicitud de patente, devolver una lista ordenada de símbolos IPC. Cada entrada del esquema IPC se embebe una sola vez a partir de su ruta completa de ancestros (sección > clase > subclase > grupo > subgrupos), y la consulta se embebe por párrafos (título y resumen por separado, promediados), troceando en frases lo que exceda el límite del embedder. La ordenación se hace por similitud coseno y el sistema recorre la jerarquía para responder en el nivel solicitado.

Es relevante ahora porque los grandes modelos generativos se usan a menudo para tareas de clasificación normativa donde no aportan ventajas: aquí la salida está restringida a un vocabulario controlado de símbolos válidos, lo que elimina el riesgo de inventar códigos. La versión documentada es la 0.2.4, el repo ocupa 0,5 GB, soporta únicamente inglés y se distribuye con licencia MIT. El reranker opcional añade 568 M de parámetros y unos 2,2 GB de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación semántica: bi-encoder de embeddings (multilingual-e5-base) para el índice y las consultas, más cross-encoder de reranking opcional (bge-reranker-v2-m3). No es un transformer generativo ni un modelo de lenguaje |
| Parametros totales | No disponible para el índice. El reranker opcional tiene 568 M de parámetros; el tamaño del embedder no se especifica en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El autor indica que un párrafo que supera el límite del embedder se corta en trozos de frase y se combina con `chunking` (mean, max o truncate) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT para el repositorio. El reranker BAAI/bge-reranker-v2-m3 es Apache-2.0 según el autor |
| Formato de pesos | No disponible. El repositorio contiene `scheme/` (títulos y jerarquía IPC), `index/` (vectores en parquet), `text2ipc/` (paquete vendorizado), `text2ipc.json` y `handler.py` |

## Arquitectura y entrenamiento

La arquitectura es de dos etapas sobre recuperación densa, no de entrenamiento de pesos. En la primera etapa, cada entrada del esquema IPC se embebe una vez a partir de su ruta completa de ancestros y se almacena como vector. En tiempo de inferencia, la consulta se embebe por párrafos (título y resumen de forma separada y promediada) y se ordenan las entradas por similitud coseno. El sistema recorre la jerarquía para responder al nivel pedido mediante el parámetro `level` (section, class, subclass, group, subgroup o auto); el modo `auto` desciende mientras un hijo quede dentro de `auto_margin` (por defecto 0,02) de su padre. La segunda etapa, opcional, es un cross-encoder que rejuzga los mejores candidatos: `rerank: true` carga BAAI/bge-reranker-v2-m3 en el primer uso y evalúa cada par (texto, texto de la ruta). La combinación de ambas puntuaciones se controla con `fusion` (blend, judge o product); el modo `blend` calcula coseno × (0,5 + 0,5 × sigmoid(logit)).

No hay datos publicados sobre número de tokens de entrenamiento ni sobre composición del dataset, porque no se entrena ningún modelo en este repositorio: se reutilizan dos modelos preentrenados del Hub. Los datos que sí se construyen son el índice y el esquema: las fuentes citadas son los ficheros maestros del esquema IPC publicados por WIPO y el embedder intfloat/multilingual-e5-base del Hub. No se menciona RLHF ni DPO, que no aplican a este tipo de sistema. La innovación técnica reseñable es la fusión jerárquica: embeber cada símbolo desde su ruta de ancestros permite responder a distintos niveles de granularidad con un único índice, y el parámetro `gap` permite descartar resultados que quedan por debajo del mejor candidato de la primera etapa. Los resultados son siempre símbolos válidos del vocabulario IPC, con `top_k` resultados de ramas distintas, por lo que en la práctica pueden devolverse menos de los solicitados.

## Capacidades

- Clasificación de texto libre hacia símbolos IPC ordenados por relevancia: admite un abstract, un título o una descripción completa de patente.
- Respuesta en cinco niveles jerárquicos (section, class, subclass, group, subgroup) más un modo `auto` que desciende mientras la evidencia lo respalda.
- Reranking opcional con cross-encoder para reordenar los mejores candidatos de la primera etapa.
- Estrategias de fusión de puntuaciones configurables: blend, judge y product.
- Troceado y agregación de textos largos: `chunking` con modos mean, max y truncate.
- Procesamiento por lotes: `inputs` acepta una cadena o una lista de cadenas, con una lista de resultados por cada entrada.
- Preprocesado configurable: `normalize` colapsa espacios en blanco y pasa a minúsculas los párrafos escritos en mayúsculas.
- Salida estructurada por resultado: `symbol`, `canonical`, `level`, `depth`, `score`, `similarity`, `judge`, `title` y `path` (ruta completa de sección a entrada).
- Despliegue como Inference Endpoint personalizado mediante `handler.py`, con API HTTP JSON.
- Uso local mediante CLI (`t2ipc classify`) y API de Python (`IpcClassifier`).
- Versionado por etiquetas: cada publicación está etiquetada como `v<versión del paquete>` (v0.2.0, v0.2.0-2, ...), fijable con `revision`.
- No dispone de tool calling, ni de modo de razonamiento, ni de capacidades de visión o audio, ni de generación de texto libre.

## Casos de uso

- Clasificación de solicitudes de patente en entrada: el sistema recibe el título y el resumen de una solicitud y devuelve los símbolos IPC candidatos en el nivel de subclase o grupo, lo que permite un preetiquetado automático antes de la revisión por un examinador. Está pensado exactamente para este flujo según la evaluación sobre 991 solicitudes INPI.
- Triaje en oficinas de propiedad industrial: con `level: subclass` y `top_k` alto se obtiene una lista corta de ramas tecnológicas para enrutar cada expediente al examinador correspondiente, reduciendo el trabajo manual de asignación inicial.
- Búsqueda de arte previo: dado el texto de una invención, los símbolos IPC recuperados acotan el espacio de búsqueda en bases de datos de patentes, ya que permiten filtrar por clasificación antes de aplicar búsquedas por palabras clave.
- Vigilancia tecnológica y paisajes de patentes: procesando un corpus de resúmenes en lote se obtiene la distribución de símbolos IPC por empresa, sector o periodo, con la jerarquía disponible para agregar los resultados al nivel de sección o clase.
- Análisis de carteras de patentes: al clasificar una cartera completa se pueden detectar concentraciones y huecos tecnológicos comparando la distribución de símbolos con la de competidores o con la de un área concreta.
- Alimentación de sistemas de gestión documental: la salida estructurada (`symbol`, `level`, `score`, `path`) se integra directamente en bases de datos y motores de búsqueda internos como metadato de clasificación, sin necesidad de postprocesar texto libre.
- Apoyo a la redacción de solicitudes: el inventor o el agente de patentes puede comprobar en segundos bajo qué símbolos IPC cae su divulgación y ajustar el alcance de las reivindicaciones en consecuencia.
- Investigación académica sobre clasificación automática de patentes: el pipeline es reproducible (índice, esquema y código versionados en el propio repo) y sirve como línea base frente a la que comparar aproximaciones con modelos generativos o con clasificadores supervisados.

## Benchmarks y rendimiento

La model card reporta una única evaluación, realizada sobre 991 solicitudes INPI, comparando el pipeline con y sin reranking:

| Configuracion | subclass@1 | group@1 |
|---|---|---|
| Sin reranker | 23,6 % | 11,2 % |
| Con reranker (BAAI/bge-reranker-v2-m3) | 31,6 % | 16,6 % |

El autor indica que el reranking añade bastante menos de un segundo por entrada en GPU. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y en cualquier caso no serían aplicables porque no es un modelo generativo. La búsqueda web realizada no devolvió ninguna fuente adicional aprovechable.

## Requisitos de hardware

- Tamaño del repositorio: 0,5 GB, que incluye el índice vectorial en parquet, el esquema IPC, el paquete vendorizado y el handler.
- Reranking desactivado: solo hay que servir el embedder intfloat/multilingual-e5-base y cargar el índice en memoria; el espacio de VRAM necesario para el embedder no se especifica en la información proporcionada.
- Reranking activado: hay que dimensionar el endpoint para el modelo adicional, BAAI/bge-reranker-v2-m3, con 568 M de parámetros y aproximadamente 2,2 GB de descarga, más su huella en memoria.
- GPU: el autor menciona explícitamente el caso de GPU para el reranking (menos de un segundo por entrada). No se indican modelos de GPU concretos ni cifras de VRAM por tarjeta; no disponible.
- Viabilidad en GPU de consumo: no disponible. No hay datos publicados sobre RTX 4090 u otras tarjetas de gama consumer para este pipeline.
- Opciones de despliegue: HuggingFace Inference Endpoints con el handler personalizado incluido, o ejecución local mediante el paquete `text2ipc` instalado desde el repositorio de GitHub (`pip install "text2ipc[st] @ git+https://github.com/Jaimenms/text2ipc"`). También existe una demo en navegador que no requiere servidor.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: no se sirve un modelo generativo con pesos propios, sino un índice de embeddings más un cross-encoder opcional.
- Latencia y throughput: el único dato publicado es que el reranking tarda bastante menos de un segundo por entrada en GPU. No hay cifras de throughput por lote ni de latencia en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros sistemas de clasificación IPC en la información proporcionada. La única comparación documentada es interna, entre las dos configuraciones del propio pipeline:

| Configuracion | Etapa 1 | Etapa 2 | subclass@1 | group@1 | Licencia |
|---|---|---|---|---|---|
| text2ipc-en sin reranker | Embeddings e5-base | No | 23,6 % | 11,2 % | MIT |
| text2ipc-en con reranker | Embeddings e5-base | bge-reranker-v2-m3 (568 M) | 31,6 % | 16,6 % | MIT + Apache-2.0 |

Frente a alternativas conceptuales como la clasificación zero-shot con un LLM generativo, la diferencia relevante es que aquí la salida queda restringida a símbolos IPC válidos y versionados, pero no hay mediciones comparativas publicadas que permitan afirmar cuál rinde mejor. Comparativa con modelos o sistemas equivalentes: no disponible.

## Limitaciones y advertencias

- Solo inglés. El pipeline está publicado como `jaimenms/text2ipc-en` y el parámetro de idioma es EN; no se documenta soporte para otros idiomas.
- Precisión absoluta baja: un 31,6 % de acierto en subclase@1 y un 16,6 % en grupo@1 con reranking significa que en la mayoría de los casos el primer resultado no es el correcto. Es una herramienta de preetiquetado y recuperación de candidatos, no un clasificador apto para asignación automática sin revisión humana.
- El índice está fijado a la edición IPC 20260101. El esquema IPC se revisa periódicamente, por lo que el sistema queda desactualizado si no se republica con una versión nueva del índice.
- `top_k` devuelve ramas distintas, de modo que pueden llegar menos resultados de los solicitados. Hay que tenerlo en cuenta en cualquier lógica que espere un número fijo de candidatos.
- El reranking consume recursos adicionales: hay que dimensionar el endpoint para un segundo modelo de 568 M de parámetros y unos 2,2 GB.
- Riesgo de alucinación en el sentido generativo: no aplica, porque no genera texto libre. El riesgo real es de clasificación incorrecta, mitigado por el uso de un vocabulario cerrado de símbolos.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo por dominio tecnológico, origen de las solicitudes ni idioma de redacción.
- Restricciones de licencia: el repositorio es MIT, permisivo para uso comercial. El reranker es Apache-2.0 según el autor. En despliegues comerciales conviene verificar las licencias del embedder y del reranker por separado, ya que son dependencias descargadas en tiempo de ejecución y no forman parte del repositorio.
- La información disponible no documenta la composición exacta del índice ni el número de entradas vectorizadas, lo que dificulta auditar la cobertura del esquema.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaimenms/text2ipc-en
- Demo en navegador (Space, sin servidor): https://huggingface.co/spaces/jaimenms/text2ipc
- Repositorio de código y paquete: https://github.com/Jaimenms/text2ipc
- Metodología: https://github.com/Jaimenms/text2ipc (`docs/methodology.md`)
- Evaluaciones: https://github.com/Jaimenms/text2ipc (`docs/evals.md`)
- Registro de cambios: `CHANGELOG.md` en https://github.com/Jaimenms/text2ipc
- Embedder base: https://huggingface.co/intfloat/multilingual-e5-base
- Reranker opcional: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Esquema IPC de WIPO: https://www.wipo.int/classifications/ipc/en/ (fuente de los ficheros maestros citada por el autor)
- Resultados de búsqueda web: no se ha recuperado ningún enlace adicional relevante; los resultados devueltos corresponden a páginas genéricas de motores de búsqueda.
