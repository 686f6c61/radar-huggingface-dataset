# premsainelluri/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el escenario **doom_health_gathering_supreme** de ViZDoom. No es un modelo de lenguaje: es un agente de control que aprende una politica de acciones a partir de observaciones del entorno de juego. El autor es el usuario de HuggingFace `premsainelluri` y el entrenamiento se realizo con Sample-Factory 2.0, la libreria de referencia para RL distribuido asincrono desarrollada por Alex Petrenko.

El escenario *Health Gathering Supreme* es un benchmark clasico de ViZDoom en el que el agente debe recoger botiquines (health packs) para sobrevivir el maximo tiempo posible mientras minimiza el dano acumulado por superficies venenosas. Es una tarea de control parcialmente observable con recompensa densa, muy utilizada en cursos y trabajos de investigacion sobre RL.

La relevancia de la ficha es limitada: el repositorio tiene 0 descargas y 0 likes, la licencia no esta declarada y la unica metrica publicada (`mean_reward = 12.50 +/- 2.10`) esta marcada como no verificada. Su interes es principalmente academico y reproducible dentro del ecosistema Sample-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization); topologia de red no especificada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de Sample-Factory; no se detalla el fichero de checkpoint) |
| Algoritmo | APPO |
| Entorno | doom_health_gathering_supreme (ViZDoom) |
| Framework / libreria | sample-factory 2.0 |
| Tamano del repositorio | 0.1 GB |
| Pipeline declarado | reinforcement-learning |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-04 |
| Fecha de actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un agente APPO entrenado con Sample-Factory 2.0. APPO es una variante asincrona de PPO en la que multiples workers de entorno recolectan experiencia en paralelo y un learner actualiza los parametros de forma desacoplada, lo que permite un uso mas eficiente de CPU y GPU en comparacion con PPO sincrono. No se especifican en la model card el numero de parametros, la topologia de la red (habitualmente una torre convolucional para los frames y una cabeza de politica y valor en ViZDoom), el numero de pasos de entorno, la composicion de los datos de entrenamiento ni si se aplicaron tecnicas adicionales como normalizacion de recompensa o aumentacion de observaciones.

Tampoco se documentan hiperparametros, semillas, numero de workers ni curva de aprendizaje. Los unicos indicios de entrenamiento son el algoritmo declarado, el entorno y la metrica final de recompensa media. El repositorio incluye la etiqueta `tensorboard`, lo que sugiere que se subieron logs de entrenamiento, aunque no se detalla su contenido.

## Capacidades

- Control de agente en el escenario ViZDoom *health gathering supreme*: seleccionar acciones discretas (movimiento y disparo) a partir de observaciones visuales del entorno.
- Aprendizaje de una politica de supervivencia orientada a maximizar la recogida de botiquines y minimizar el dano por veneno.
- Inferencia en modo evaluacion dentro del ecosistema Sample-Factory.
- Generacion de logs compatibles con TensorBoard durante el entrenamiento (etiqueta declarada en el repositorio).
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No es multilingue ni procesa lenguaje natural.
- No dispone de modo *thinking*, vision general, audio ni capacidades multimodales fuera de la observacion del propio entorno de juego.

## Casos de uso

- Reproduccion de resultados en investigacion: sirve como punto de partida para replicar un entrenamiento APPO sobre *health gathering supreme* con Sample-Factory 2.0 y comparar con la recompensa media publicada de 12.50 +/- 2.10.
- Material docente en cursos de RL: el nombre del repositorio (`rl_course_vizdoom_health_gathering_supreme`) apunta a un uso como ejemplo practico en asignaturas de aprendizaje por refuerzo, donde el alumnado puede inspeccionar el checkpoint y los logs de TensorBoard.
- Baseline para comparacion de algoritmos: permite contrastar APPO con PPO sincrono, IMPALA u otros algoritmos sobre el mismo entorno y presupuesto de pasos.
- Pruebas de infraestructura de entrenamiento distribuido: valida pipelines de Sample-Factory, gestion de workers asincronos y monitorizacion con TensorBoard antes de escalar a entornos mas costosos.
- Transfer learning a otros escenarios ViZDoom: la politica convolucional puede servir como inicializacion para variantes del entorno (por ejemplo, *health gathering* con distintos niveles de dificultad), sujeto a validacion experimental.
- Analisis de robustez y varianza: al disponer de una desviacion declarada de +/- 2.10, es util para estudiar la estabilidad del entrenamiento entre semillas y la sensibilidad a hiperparametros.
- Demostraciones de agentes de RL en entornos de juego: util para visualizar el comportamiento aprendido en articulos, charlas o practicas, siempre que se respete la licencia (no declarada) del artefacto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del repositorio. La metrica figura como no verificada.

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12.50 +/- 2.10 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a un agente de RL sin capacidades de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para una politica convolucional de ViZDoom, el coste de inferencia es bajo y, en la practica, suele ser viable en CPU; cualquier estimacion numerica concreta seria especulativa.
- GPU recomendadas: no disponible. Sample-Factory soporta entrenamiento con GPU, pero el autor no especifica el hardware empleado.
- Viabilidad en GPU de consumo: no confirmada por el autor. Al tratarse de un repositorio de 0.1 GB y de una tarea de vision relativamente sencilla, es plausible que quepa en GPU de gama media, pero este punto no esta documentado.
- Opciones de despliegue: inferencia a traves de Sample-Factory 2.0, que es la libreria declarada. No aplican herramientas orientadas a modelos de lenguaje como vLLM, Ollama o TGI. TensorBoard se emplea para la monitorizacion de logs.
- Latencia y rendimiento: no disponible. No se publican medidas de *throughput* (pasos por segundo) ni de latencia por decision.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes APPO o politicas comparables sobre *doom_health_gathering_supreme* con los que establecer una comparacion con datos verificables (parametros, contexto, licencia o rendimiento). El propio Sample-Factory publica habitualmente checkpoints de referencia para entornos ViZDoom, pero no se dispone de sus cifras en esta busqueda.

## Limitaciones y advertencias

- La unica metrica publicada (mean_reward = 12.50 +/- 2.10) esta marcada como no verificada por el autor, por lo que no debe tomarse como resultado consolidado.
- El repositorio registra 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial o redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion.
- La politica esta especializada en un unico entorno (*doom_health_gathering_supreme*) y no generaliza a otras tareas sin reentrenamiento o *fine-tuning*.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta herramientas ni agentes conversacionales.
- No se documentan sesgos, pero en RL existe riesgo de sobreajuste a las condiciones del entorno, semillas concretas o configuraciones de recompensa, lo que puede reducir la robustez fuera del escenario de evaluacion.
- Ausencia total de informacion sobre hiperparametros, datos de entrenamiento y curvas de aprendizaje, lo que dificulta la reproducibilidad.
- Las fechas de creacion y actualizacion del repositorio (2026-10-04) resultan inusuales; conviene verificarlas antes de citarlas.
- No hay indicios de soporte, mantenimiento ni actualizaciones posteriores del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/premsainelluri/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory 2.0: https://github.com/alex-petrenko/sample-factory
- Entorno ViZDoom (*health gathering supreme*): no se incluye enlace en la informacion disponible
