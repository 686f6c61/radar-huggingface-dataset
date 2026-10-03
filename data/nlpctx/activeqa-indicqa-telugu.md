# nlpctx/activeqa-indicqa-telugu

## Resumen

ActiveQA — IndicQA Telugu es un sistema de respuesta a preguntas extractiva (extractive question answering) para telugu, publicado por el usuario nlpctx en HuggingFace. No se trata de un unico modelo monolingue, sino de un pipeline de tres componentes encadenados: un reformulador que genera variantes de la pregunta original, un entorno de QA extractivo que responde tanto a la pregunta original como a las reformuladas, y un selector que elige la reformulacion con mayor probabilidad de producir una respuesta correcta. El repositorio ocupa 2,3 GB y esta etiquetado con `transformers`, `safetensors`, `seq2seq` y `endpoints_compatible`.

El elemento diferenciador es el uso de aprendizaje por refuerzo: el reformulador se optimiza con REINFORCE tomando como recompensa la mejora en F1 del sistema de QA. Es decir, el modelo aprende a reescribir preguntas en telugu para que un lector extractivo encuentre mejor la respuesta en un pasaje, en lugar de aprender directamente el mapeo pregunta-respuesta. El entrenamiento se apoya en el corpus `ai4bharat/IndicQA` restringido a telugu.

La relevancia del artefacto es doble. Por un lado, aborda una lengua de bajos recursos (telugu, mas de 80 millones de hablantes) con muy poca cobertura en sistemas de QA publicados. Por otro, la reformulacion de consultas es una tecnica directamente trasladable a recuperacion aumentada (RAG) y a busqueda semantica: mejorar la pregunta suele ser mas barato que reentrenar el recuperador. Como contrapartida, la ficha publica no documenta parametros, contexto, licencia, benchmarks ni requisitos de hardware, y el repositorio no tiene descargas registradas, por lo que debe considerarse material de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline ActiveQA: reformulador seq2seq + entorno de QA extractivo + selector; el modelo base de cada componente no se especifica |
| Parametros totales | no disponible (el repositorio ocupa 2,3 GB, pero incluye varios componentes y no se detalla el desglose) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | telugu (unico idioma indicado por las etiquetas y el dataset); no disponible para el resto |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria declarada | transformers |
| Pipeline declarado | question-answering |
| Dataset de entrenamiento | ai4bharat/IndicQA (telugu) |
| Tamano del repositorio | 2,3 GB |
| Descargas / likes | 0 / 1 |
| Compatibilidad declarada | endpoints_compatible |
| Fecha de creacion (metadatos) | 2026-10-03 (fecha anomala; ver limitaciones) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un bucle de tres etapas. Primero, el reformulador recibe la pregunta original y genera multiples preguntas candidatas. Despues, el entorno de QA responde a la pregunta original y a cada candidata mediante un modelo de QA extractivo, y calcula la recompensa como la mejora en F1 respecto a la respuesta obtenida con la pregunta original. Por ultimo, el selector escoge la reformulacion con mejor resultado esperado. El reformulador se optimiza con REINFORCE usando esa mejora de F1 como senal de recompensa, lo que lo convierte en un esquema de aprendizaje por refuerzo con recompensa derivada de una tarea downstream, no de anotaciones humanas directas sobre la calidad de la reformulacion.

No se especifica en la informacion disponible ni el modelo base del reformulador (podria ser un seq2seq tipo mT5, un modelo indico o un transformer entrenado desde cero), ni la arquitectura del lector extractivo, ni la del selector, ni si el selector es un clasificador neuronal, un reranker o una heuristica. Tampoco se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de `ai4bharat/IndicQA`, la politica de muestreo de candidatas, ni si hubo fases previas de ajuste supervisado (SFT) antes del RL. Estos datos son imprescindibles para reproducir el sistema y no estan publicados.

Como referencia de linaje, el esquema ActiveQA con reformulacion de preguntas y REINFORCE sobre la recompensa de QA proviene de la linea de trabajo de Google Research sobre Active Question Answering, y el dataset IndicQA de AI4Bharat es un corpus de QA extractivo en lenguas indias construido sobre pasajes enciclopedicos. Ninguno de los dos aparece citado explicitamente en la model card.

## Capacidades

- Reformulacion de preguntas en telugu: genera variantes de una consulta original con el objetivo de maximizar el F1 de un lector extractivo.
- Respuesta a preguntas extractivas: localiza la respuesta dentro de un pasaje de contexto, en lugar de generar texto libre.
- Seleccion de la mejor candidata: escoge, entre varias reformulaciones, la que se espera que produzca la mejor respuesta.
- Mejora iterativa de consultas: la senal de RL esta disenada para que el sistema aprenda a corregir preguntas ambiguas, mal formuladas o con terminos poco frecuentes.
- Uso compatible con `transformers` y con endpoints gestionados de HuggingFace, segun la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque el propio pipeline encadena tres etapas internas.
- Capacidades multilingues: solo telugu segun la informacion disponible.
- Capacidad de generacion libre de texto: no declarada; el componente generativo es un reformulador, no un modelo de proposito general.
- Vision, audio, modo thinking explicito: no disponible.

## Casos de uso

- Busqueda y QA sobre documentacion en telugu: el sistema puede integrarse como capa de reescritura de consultas delante de un motor de recuperacion, de modo que una pregunta coloquial se transforme en variantes con mayor solapamiento lexico con los pasajes indexados.
- RAG para lenguas de bajos recursos: en un pipeline de recuperacion aumentada, el reformulador genera varias consultas, se recuperan pasajes para cada una y el selector prioriza la combinacion con mayor probabilidad de contener la respuesta. Es util cuando el indice es pequeno y la formulacion de la pregunta condiciona mucho el recall.
- Atencion al cliente automatizada en telugu: el modulo extractivo permite responder citando literalmente el fragmento de la politica o del manual, lo que reduce el riesgo de invencion frente a un modelo generativo puro, siempre que exista un corpus de referencia controlado.
- Educacion y material de estudio: generar variantes de una misma pregunta de examen o de un ejercicio ayuda a construir bancos de preguntas equivalentes y a evaluar si un alumno ha entendido el concepto y no la formulacion concreta.
- Acceso a informacion publica (sanidad, tramites, agricultura): reformular preguntas de ciudadanos formuladas en registro coloquial hacia formulaciones que casen con textos administrativos o tecnicos en telugu.
- Aumento de datos para QA indico: las reformulaciones generadas pueden usarse como pares adicionales pregunta-pasaje para aumentar el entrenamiento de otros sistemas de QA en telugu, filtrando por la recompensa de F1.
- Investigacion en RL para NLP: sirve como banco de pruebas reproducible para estudiar REINFORCE con recompensa downstream, incluyendo analisis de varianza del gradiente y de colapso de la politica del reformulador.
- Evaluacion de robustez de lectores extractivos: al disponer de reformulaciones controladas de la misma pregunta, permite medir la sensibilidad de un lector de QA a cambios superficiales en la formulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de F1, EM, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, ni para el sistema completo ni para los componentes por separado. Tampoco se indica el F1 del lector extractivo utilizado como entorno, dato imprescindible para interpretar la mejora que aprende el reformulador.

## Comparativa con modelos similares

No disponible. La informacion publicada no identifica los modelos base de los componentes, no aporta metricas y no declara licencia ni condiciones de uso, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, ajustes de modelos multilingues tipo mT5 o XLM-R sobre IndicQA, o modelos indicos de QA extractivo). Para que la comparacion fuera posible haria falta, como minimo, el nombre y tamano del lector extractivo, el F1 de referencia sobre IndicQA Telugu y la licencia de cada componente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir del tamano del repositorio (2,3 GB) y suponiendo que fuese exclusivamente pesos, corresponderia a unos 575 millones de parametros en fp32 o unos 1.150 millones en fp16. Es una estimacion, no un dato confirmado, y el repositorio contiene varios componentes, por lo que el reparto real es desconocido.
- Consumo agregado: al ser un pipeline de tres etapas (reformulador, entorno de QA extractivo y selector), la VRAM en inferencia es la suma de los componentes que se mantengan cargados simultaneamente. Si se cargan todos a la vez, el pico puede superar ampliamente el de un unico modelo del mismo tamano.
- GPU recomendadas: no disponibles. Con las estimaciones anteriores, cualquier GPU con 8-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) deberia ser suficiente si los componentes son de rango 0,5-1,5 mil millones de parametros; para lotes grandes o fp32 conviene una A100 o H100. Son estimaciones condicionadas a que el tamano real no supere lo inferido.
- Cabe en GPU de consumo: probablemente si, con las reservas anteriores, siempre que se cuantice o se carguen los componentes de forma secuencial. No hay confirmacion por parte del autor.
- Opciones de despliegue: `transformers` (libreria declarada) y endpoints gestionados de HuggingFace por la etiqueta `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son viables sin conversion previa; tampoco se documenta compatibilidad con vLLM o TGI, que dependen de la arquitectura concreta de cada componente.
- Latencia y throughput: no disponibles. Cabe esperar que la latencia sea sensiblemente superior a la de un unico modelo de QA, porque cada consulta implica generar N reformulaciones desconocidas y ejecutar el lector extractivo N+1 veces. El valor de N no esta documentado.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explicita no hay autorizacion clara de uso comercial ni de redistribucion. Debe tratarse como uso restringido a evaluacion interna hasta que el autor aclare las condiciones.
- Sin benchmarks: no hay ninguna cifra publicada de F1 o EM, ni sobre IndicQA Telugu ni sobre el sistema completo. No es posible afirmar que mejore a un lector extractivo sin reformulacion.
- Componentes no identificados: se desconoce el modelo base del reformulador, del lector y del selector. Esto impide auditar sesgos, reproducir el entrenamiento y estimar el coste real de inferencia.
- Idiomas: el sistema esta disenado para telugu. No hay evidencia de transferencia a otras lenguas indias ni al castellano.
- Dominio del dataset: IndicQA se construye sobre pasajes de tipo enciclopedico. El rendimiento puede degradarse en dominios especializados (clinico, legal, industrial) con vocabulario y estructura distintos.
- Alucinacion: el lector es extractivo, por lo que en principio no inventa texto, pero puede seleccionar un fragmento incorrecto como respuesta, especialmente si la pregunta reformulada cambia de sentido. El fallo tipico no es una invencion, sino una respuesta plausible y erronea.
- Riesgo de deriva semantica en el reformulador: al optimizarse con REINFORCE sobre una recompensa automatica, el reformulador puede aprender atajos que incrementan el F1 sin preservar la intencion original de la pregunta. Es un caso clasico de reward hacking y no hay analisis publicado que lo descarte.
- Inestabilidad de REINFORCE: el algoritmo tiene alta varianza de gradiente. Sin datos sobre el numero de muestras, la linea base de recompensa o el recorte de la actualizacion, no puede evaluarse la estabilidad del entrenamiento obtenido.
- Repositorio sin validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta. No hay issues, demos ni informes de terceros que confirmen que los pesos funcionan.
- Fecha de creacion anomala: los metadatos indican 2026-10-03, posterior a la fecha habitual de publicacion. Conviene verificar la procedencia del repositorio antes de integrarlo en cualquier pipeline de produccion.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 4 u 8 bits, lo que limita el despliegue en entornos con poca memoria y fuera del ecosistema `transformers`.
- Produccion: la ausencia de licencia, de benchmarks y de documentacion de latencia hace que el artefacto no sea apto para produccion en su estado actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nlpctx/activeqa-indicqa-telugu
- Perfil del autor: https://huggingface.co/nlpctx
- Dataset IndicQA (AI4Bharat): https://huggingface.co/datasets/ai4bharat/IndicQA
- Referencia externa sobre ActiveQA con reformulacion y REINFORCE (no citada en la model card): https://arxiv.org/abs/1705.07830
