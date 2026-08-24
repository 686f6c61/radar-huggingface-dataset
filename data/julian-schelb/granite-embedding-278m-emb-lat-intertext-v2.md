# julian-schelb/granite-embedding-278m-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/granite-embedding-278m-emb-lat-intertext-v2` es un modelo de embeddings de frases (sentence embeddings) especializado en la detección de intertextualidad en literatura latina clásica. Se trata de un fine-tuning del modelo `ibm-granite/granite-embedding-278m-multilingual` de IBM, entrenado con una pérdida contrastiva online sobre el benchmark Loci Similes, un conjunto de datos de enlaces intertextuales verificados por expertos. El modelo genera vectores de 768 dimensiones y está pensado para recuperar pasajes paralelos entre autores clásicos, como Jerónimo y Virgilio.

Desarrollado por Julian Schelb y colaboradores como parte del trabajo académico "Loci Similes: A Benchmark for Extracting Intertextualities in Latin Literature" (arXiv:2601.07533), este modelo resuelve el problema de encontrar alusiones, citas y paráfrasis en textos latinos de forma automática, una tarea tradicionalmente manual en filología clásica. Su relevancia actual radica en la creciente intersección entre humanidades digitales y procesamiento del lenguaje natural, donde se necesitan herramientas específicas para lenguas históricas.

La arquitectura subyacente es un transformer encoder-only estilo XLM-RoBERTa con 278 millones de parámetros, 12 capas, 12 cabezas de atención y un vocabulario de 250.002 tokens. La longitud de contexto está limitada a 512 tokens, suficiente para pasajes breves típicos de la intertextualidad. Esta segunda versión (v2) sustituye a la v1 como reemplazo directo, manteniendo la misma interfaz y tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-like), 12 capas, 12 cabezas de atención |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `ibm-granite/granite-embedding-278m-multilingual`, un modelo de embeddings denso de 278 millones de parámetros con arquitectura encoder-only similar a XLM-RoBERTa. Según la documentación de IBM, el modelo base produce vectores de 768 dimensiones, acepta entradas de hasta 512 tokens y fue entrenado con una combinación de conjuntos de datos de pares de relevancia de código abierto y datos propios de IBM.

Para esta versión especializada en latín, el fine-tuning se realizó con una pérdida contrastiva online (online contrastive loss) sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes. El entrenamiento incorpora prefijos de prompt específicos: "Query: " para textos de consulta (por ejemplo, pasajes de Jerónimo) y "Candidate: " para textos candidatos (autores clásicos). Esta distinción es crucial, ya que el modelo fue entrenado con estos prefijos y su uso incorrecto degrada notablemente la calidad de la recuperación. El modelo está diseñado para funcionar con la API del paquete LociSimiles y se integra en pipelines de recuperación seguidos de modelos de clasificación de tres clases (los `*-3class-lat-intertext-v1` de la misma colección).

## Capacidades

- Generacion de embeddings semanticos para textos latinos clasicos, con vectores de 768 dimensiones.
- Deteccion de intertextualidad: identifica pasajes paralelos, alusiones y citas entre autores latinos (por ejemplo, Jeronimo, Virgilio, Ovidio, Cesar).
- Recuperacion por similitud coseno: permite ordenar candidatos segun su proximidad semantica a una consulta.
- Uso con prefijos de prompt diferenciados para consultas ("Query: ") y candidatos ("Candidate: "), lo que mejora la precision en tareas de retrieval.
- Compatible con la libreria sentence-transformers y con text-embeddings-inference (segun los tags del modelo).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling ni funciones de agente; su funcion es exclusivamente la generacion de embeddings.

## Casos de uso

- Investigacion en humanidades digitales: localizar alusiones y fuentes en obras de autores latinos clasicos, como las referencias de Jeronimo a Virgilio o a poetas anteriores. El modelo permite buscar pasajes paralelos en grandes corpus sin lectura manual exhaustiva.
- Analisis de fuentes y tradicion textual: identificar que pasajes de un autor fueron copiados, parafraseados o imitados por otro, lo que ayuda a reconstruir la transmision de ideas y estilos en la literatura latina.
- Construccion de bases de datos de intertextualidad: generar automaticamente listas de pasajes paralelos verificables para proyectos de edicion critica o estudios de recepcion clasica.
- Asistencia a filologos y editores: dada una frase de un autor, recuperar los pasajes mas similares en el corpus para facilitar la anotacion manual y la verificacion de citas.
- Integracion en pipelines de recuperacion y clasificacion: el modelo se usa como primera etapa de un sistema que recupera candidatos y luego los clasifica con un modelo de tres clases (relacion intertextual o no), como se describe en el paper Loci Similes.
- Ensenanza y divulgacion: crear herramientas educativas que muestren a estudiantes de latin las conexiones entre textos clasicos, mediante busquedas semanticas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se evalua dentro del marco del benchmark Loci Similes, pero los numeros concretos (precision, recall, etc.) no se incluyen en la model card ni en los resultados de la busqueda web. Se recomienda consultar el articulo arXiv (2601.07533) para obtener las metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 278 millones de parametros con pesos en fp32 (~1,1 GB), puede ejecutarse en CPU sin problemas. En GPU, la VRAM necesaria es inferior a 2 GB en precision completa; con cuantizacion (no disponible en la informacion) seria aun menor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3050, etc.). No requiere GPU de datacenter.
- Compatible con hardware consumer: si, se puede ejecutar en portatiles y equipos de escritorio convencionales.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (segun los tags del modelo), y cualquier framework que soporte safetensors y transformers.
- Latencia y throughput estimados: no disponibles en la informacion. Al ser un encoder pequeno, se espera una latencia baja en CPU (del orden de decenas de milisegundos por frase) y menor en GPU.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. El modelo es un fine-tuning especifico del modelo base `ibm-granite/granite-embedding-278m-multilingual`, que a su vez compite con otros modelos de embeddings multilingues como `intfloat/multilingual-e5-large` o `BAAI/bge-m3`. Sin embargo, no hay metricas publicadas que permitan una comparacion cuantitativa. La version v1 del mismo modelo (`julian-schelb/granite-embedding-278m-emb-lat-intertext-v1`) existe para reproducir resultados anteriores, pero no se aportan diferencias de rendimiento.

## Limitaciones y advertencias

- Entrenado exclusivamente en latin clasico: el modelo no esta optimizado para latin medieval, vulgar o tardio, ni para otros idiomas.
- Dependencia de prefijos de prompt: el uso incorrecto de los prefijos "Query: " y "Candidate: " degrada notablemente la calidad de la recuperacion. Es imprescindible seguir el patron de uso documentado.
- Longitud de contexto limitada a 512 tokens: los pasajes mas largos deben truncarse, lo que puede perder informacion relevante para la intertextualidad.
- Riesgo de falsos positivos: la similitud coseno puede producir candidatos no relacionados semanticamente, por lo que se recomienda un modelo de clasificacion posterior (como los `*-3class-lat-intertext-v1`) para filtrar resultados.
- Sesgos del modelo base: al derivar de un modelo multilingue entrenado con datos diversos, puede heredar sesgos presentes en esos datos, aunque no se documentan casos especificos.
- No es un modelo generativo: no puede producir texto ni explicaciones, solo representaciones vectoriales.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se debe atribuir al autor original y mantener el aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julian-schelb/granite-embedding-278m-emb-lat-intertext-v2
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-278m-multilingual
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset de corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Paper arXiv: https://arxiv.org/abs/2601.07533
- Documentacion de la API LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Documentacion de IBM sobre el modelo base: https://www.ibm.com/docs/en/watsonx/saas?topic=models-granite-embedding-278m-multilingual-model-card
