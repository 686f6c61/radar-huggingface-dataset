# kumarabd1996/agent-triage-classifier

## Resumen

agent-triage-classifier es un checkpoint afinado del modelo base laya (convaiinnovations/laya) desarrollado por kumarabd1996. Su funcion no es clasificar el tema de una peticion, sino decidir que debe hacer un agente asistente personal con ella: responder directamente, pedir un dato que falta, arrancar una tarea larga, programar algo para mas tarde, actuar sobre registros existentes o derivar a un modelo mas capaz. Es la pieza complementaria de agent-task-classifier, que clasifica la forma del trabajo (planificar, investigar, diagnosticar).

El modelo sigue la interfaz comun de los checkpoints laya: recibe texto y devuelve una decision tipada de tipo `choice` en un unico pase forward, sin generacion autoregresiva. Esta disenado para operar como enrutador de sistema 1 dentro de una arquitectura de agentes, con una latencia de aproximadamente 0,2 s por consulta en CPU, lo que lo hace apto para ejecutarse en el camino critico de un asistente sin depender de GPU.

Su relevancia practica reside en el coste: sustituye o filtra llamadas a un LLM grande en la fase de triaje, reservando el modelo mayor para los casos en que la decision no es clara (`unsure`). El entrenamiento se apoya en datos sinteticos, el dataset MASSIVE en-US y 76 mensajes reales etiquetados a mano, con un total de 874 filas de entrenamiento y 97 de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | laya (decision model, un unico pase forward, sin generacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa el mensaje y, opcionalmente, la peticion anterior) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga mediante la libreria `laya`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint base en ingles de laya. A diferencia de un transformer generativo, laya se plantea como un modelo de decision: dada una entrada de texto y un conjunto de opciones tipadas (`questions.json`), produce una distribucion de probabilidad sobre las elecciones en un solo pase forward. La salida incluye la opcion elegida y las probabilidades calibradas, lo que permite aplicar un umbral y degradar a `unsure` cuando la confianza es baja.

El entrenamiento se realizo con 874 filas y 97 de validacion, durante 6 epocas con batch efectivo de 16. La composicion de los datos es: aproximadamente 490 filas sinteticas generadas con plantillas manuales sobre dominios de asistente personal (planificacion de fantasy deportivo, objetivos, finanzas, salud, viajes, recordatorios y vigilancias, preguntas sobre herramientas), con ruido estilo transcripcion de voz; 312 filas del dataset MASSIVE en-US (FitzGerald et al. 2022, CC BY 4.0) con intenciones mapeadas a las seis decisiones; y 76 mensajes reales de sesiones de un usuario, etiquetados a mano y no publicados. El autor senala que ningun dataset publico cubria las categorias `start_task` ni `ask` tal como se definen, por lo que esas clases dependen exclusivamente de las filas sinteticas y reales.

## Capacidades

- Clasificacion de intencion operativa en seis clases: `answer`, `ask`, `start_task`, `schedule`, `act` y `unsure`.
- Decision en un unico pase forward, sin generacion de texto, con salida tipada y distribucion de probabilidades calibrada.
- Soporte de contexto conversacional limitado: acepta el formato `"Earlier request: <peticion previa>\nNew request: <peticion actual>"` para resolver seguimientos.
- Umbralizacion configurable: las probabilidades permiten fijar un umbral por debajo del cual la decision se trata como `unsure` y se deriva a un modelo mayor.
- Ejecucion en CPU con latencia de aproximadamente 0,2 s por consulta.
- Capacidad de enrutamiento dentro de pipelines de agentes (tool calling o function calling a nivel de orquestacion, no nativo del modelo).
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision ni audio.

## Casos de uso

- Triaje de entrada en asistentes personales: el modelo recibe cada mensaje del usuario y decide si debe responderse directamente (`answer`), pedirse un dato (`ask`), lanzarse una tarea larga (`start_task`) o programarse algo (`schedule`), evitando invocar un LLM grande en la mayoria de turnos.
- Enrutamiento de bajo coste en produccion: al ejecutarse en CPU en torno a 0,2 s por consulta, puede colocarse delante de un modelo mayor y filtrar el trafico trivial (saludos, agradecimientos, comprobaciones de estado) que no requiere razonamiento.
- Gestion de recordatorios y eventos: las peticiones que nombran una hora futura o una repeticion se clasifican como `schedule`, lo que permite conectarlas directamente con el subsistema de calendario o alarmas del agente.
- Modificacion de registros existentes: peticiones como mover, renombrar, completar o borrar una entrada se clasifican como `act`, habilitando la ejecucion de procedimientos cortos en linea (consultas, conversiones) sin pasar por un planificador.
- Deteccion de ambiguedad y escalado: cuando la distribucion de probabilidad no supera el umbral, la salida `unsure` permite derivar la peticion a un modelo mas potente, actuando como mecanismo de control de calidad en el enrutado.
- Despliegue en modo sombra para validacion: el autor indica que el modelo se ejecuta primero en shadow mode, de modo que puede compararse su decision con la del sistema en produccion antes de darle control real.
- Complemento de agent-task-classifier: combinando ambos checkpoints, un orquestador puede determinar primero la forma del trabajo y despues la accion inmediata, construyendo una politica de triaje en dos etapas.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Precision en dev propio (97 filas, mismas fuentes) | 0,887 (base sin entrenar: 0,196) |
| ECE (error de calibracion esperado) en dev | 0,063 |
| Casos de triaje del agente (46 en total) | 41/46 |
| Mitad dev (23 casos) | 21/23 |
| Mitad reservada (23 casos) | 20/23 |
| LLM de triaje en la misma mitad dev (referencia del autor) | 68-75 % |

El autor advierte que estos resultados deben considerarse optimistas: los casos de evaluacion y las filas sinteticas provienen del mismo dominio y del mismo autor, y es probable que existan casi duplicados. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecutarse en CPU.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso declarado; el checkpoint se carga con `device="cpu"`.
- Compatibilidad con GPU de consumo: no disponible; el diseno apunta a inferencia en CPU.
- Opciones de despliegue: libreria `laya` (carga mediante `laya.load` y prediccion con `agent.predict`), con descarga de artefactos auxiliares como `questions.json` desde Hugging Face Hub.
- Latencia estimada: aproximadamente 0,2 s por consulta en CPU, segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Funcion |
|---|---|---|---|---|---|---|
| agent-triage-classifier | Decision model laya (fine-tune) | no disponible | no disponible | en | Apache 2.0 | Triaje operativo en seis clases |
| agent-task-classifier (kumarabd1996) | Decision model laya (fine-tune) | no disponible | no disponible | en | no disponible | Clasificacion de la forma del trabajo |
| convaiinnovations/laya (base) | Decision model laya | no disponible | no disponible | en | no disponible | Modelo base sin afinado especifico |
| LLM generativo de triaje (referencia del autor) | Transformer generativo | no disponible | no disponible | multi | no disponible | Triaje mediante generacion; 68-75 % en la mitad dev |

La comparacion con LLMs generativos se limita al dato aportado por el autor en su propio harness de evaluacion; no hay comparaciones publicas con clasificadores dedicados de terceros.

## Limitaciones y advertencias

- Solo ve el mensaje actual y, opcionalmente, el anterior; no tiene acceso a las habilidades que han coincidido, al estado de tareas en curso ni a la fecha, factores determinantes en la decision real.
- Punto debil documentado: una hora futura nombrada junto a una tarea larga ("in 2 min, plan my gameweek") puede producir `start_task` y `schedule` casi empatados; el autor recomienda leer las probabilidades, no solo la etiqueta.
- Solo ingles y sesgado a los dominios del conjunto de entrenamiento (fantasy deportivo, objetivos, finanzas, salud, viajes, recordatorios).
- Las respuestas que solo tienen sentido con el mensaje previo del asistente ("yes, go ahead") se excluyeron del entrenamiento y no son fiables.
- Es una pista de enrutamiento para un agente, no un clasificador de seguridad ni de moderacion.
- Las metricas publicadas son optimistas por solapamiento de dominio y autor; la validacion independiente con trafico nuevo esta pendiente.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto libre), pero si de clasificacion erronea con alta confianza en dominios fuera de distribucion.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumarabd1996/agent-triage-classifier
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Modelo complementario agent-task-classifier: https://huggingface.co/kumarabd1996/agent-task-classifier
- Dataset MASSIVE en-US: https://huggingface.co/datasets/SetFit/amazon_massive_intent_en-US
- Referencia de MASSIVE (FitzGerald et al. 2022): no disponible en la informacion proporcionada.
