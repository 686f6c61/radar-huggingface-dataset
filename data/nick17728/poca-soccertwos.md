# nick17728/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para el entorno SoccerTwos, un escenario de fútbol 2 contra 2 en el que cada equipo está formado por dos agentes que deben coordinarse entre sí y competir contra el equipo rival. El modelo lo publica el usuario nick17728 en Hugging Face y se distribuye como un checkpoint de ML-Agents exportado a los formatos .nn y .onnx, lo que permite tanto reanudar el entrenamiento como ejecutar al agente en inferencia dentro de Unity o en el visor web de Hugging Face.

Se trata de un modelo de reinforcement learning y no de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en tokens ni parámetros en el sentido habitual de un LLM. Su arquitectura es la de una política actor-critic con función de valor, entrenada con el entrenador POCA de ML-Agents, que implementa asignación de crédito para entornos multiagente cooperativos. El repositorio ocupa 0,2 GB e incluye checkpoints, logs de TensorBoard y las exportaciones del modelo.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigar coordinación multiagente, asignación de crédito y dinámicas de autojuego (self-play) en el benchmark SoccerTwos, y como material práctico para el curso de deep reinforcement learning de Hugging Face. La model card no declara licencia, no publica métricas de rendimiento ni hiperparámetros de entrenamiento, y el repositorio acumula 0 descargas y 0 likes, por lo que no existe evidencia externa de calidad o de validación del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo con política y función de valor (actor-critic) entrenado con el entrenador POCA de Unity ML-Agents; estructura exacta de la red (numero de capas y unidades) no disponible |
| Parametros totales | no disponible (el repositorio completo ocupa 0,2 GB e incluye checkpoints, logs de TensorBoard y exportaciones, por lo que este dato no es un indicador del tamano de la red) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (agente de RL; la entrada es la observacion del entorno SoccerTwos, cuya dimensionalidad no se publica en la model card) |
| Tipos de cuantizacion | no disponible (se distribuyen exportaciones .nn y .onnx; no se documenta el tipo numerico) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | .nn (formato nativo de Unity ML-Agents) y .onnx, ademas de checkpoints para reanudar el entrenamiento |
| Libreria | ml-agents |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,2 GB |
| Entorno | SoccerTwos (Unity ML-Agents), futbol 2 contra 2 |
| Fecha de creacion / actualizacion | 2026-09-24 (ambas marcas temporales identicas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se entrena con POCA, el entrenador de Unity ML-Agents orientado a entornos multiactor cooperativos y de competicion simetrica. Este entrenador implementa asignacion de credito a posteriori, de modo que la recompensa de equipo se reparte entre los agentes en funcion de su contribucion, en lugar de aplicar la misma senal a todos por igual. La politica es del tipo actor-critic con funcion de valor centralizada, una eleccion habitual para entornos en los que varios agentes comparten recompensa pero no observaciones completas.

No se especifican en la model card ni el numero de pasos de entrenamiento, ni el fichero de configuracion YAML, ni los hiperparametros (tamano de buffer, learning rate, batch size, coeficiente de entropia, numero de instancias paralelas de Unity), ni la composicion del curriculum. Tampoco se detalla si hubo recompensas de shaping adicionales o si se aplico algun tipo de regularizacion. El repositorio incluye logs de TensorBoard, por lo que las curvas de entrenamiento existen, pero no se han publicado valores ni graficas en la informacion disponible.

La model card unicamente documenta el flujo de trabajo: reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<run_id> --resume` y visualizar al agente en el navegador seleccionando el fichero .nn o .onnx en el visor de la organizacion unity de Hugging Face.

## Capacidades

- Control motor y navegacion en un entorno 3D de Unity: el agente aprende a desplazarse por el campo de SoccerTwos y a orientarse hacia el balon y hacia la porteria.
- Coordinacion con un companero de equipo: al estar entrenado para un escenario 2 contra 2, la politica incorpora comportamiento cooperativo aprendido mediante asignacion de credito.
- Competicion por equipos: el agente se enfrenta a una politica rival, habitualmente otra copia de si mismo en regimen de autojuego.
- Manipulacion del balon y finalizacion: las capacidades especificas de regate, pase o disparo dependen de la calidad del entrenamiento, que no se documenta.
- Inferencia en tiempo real dentro de Unity mediante el formato .nn y en entornos externos mediante .onnx.
- Reanudacion del entrenamiento a partir del checkpoint publicado.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no aplica.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: el checkpoint sirve como punto de partida para estudiar asignacion de credito en entornos cooperativos, reanudando el entrenamiento con `--resume` y modificando el curriculum o los hiperparametros en el YAML.
- Comparativa de algoritmos de coordinacion: permite contrastar el entrenador POCA frente a configuraciones de autojuego basadas en PPO en el mismo entorno SoccerTwos, manteniendo constante el escenario y variando solo el algoritmo.
- Material docente para cursos de deep RL: encaja en la unidad 5 y en la unidad extra del curso de Hugging Face sobre ML-Agents, donde el alumnado puede cargar el modelo y verlo jugar en el navegador sin instalar Unity.
- Demostracion interactiva en navegador: el fichero .onnx se puede ejecutar con el visor de la organizacion unity de Hugging Face, lo que permite mostrar un agente entrenado en una pagina web sin infraestructura adicional.
- Prototipado de IA para videojuegos en Unity: sirve como referencia de como se exporta e integra una politica entrenada en un proyecto Unity, antes de sustituir el escenario por uno propio.
- Generacion de datos de comportamiento sintetico: las trayectorias del agente en SoccerTwos se pueden registrar para entrenar por imitacion (behavioural cloning) una politica supervisada, o para inicializar un entrenamiento posterior.
- Analisis de robustez y sim-to-sim: al ser un entorno simetrico con dos agentes por bando, permite evaluar la degradacion del rendimiento al cambiar la politica rival o las condiciones de la simulacion.
- Competicion y leaderboards de ML-Agents: el formato de checkpoint es el aceptado por los flujos de evaluacion por Elo del ecosistema ML-Agents, de modo que el modelo puede someterse a enfrentamientos automatizados contra otros agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo, tasa de victorias, recompensa media acumulada, ni ninguna curva de aprendizaje, pese a que el repositorio esta etiquetado con tensorboard y contiene 0,2 GB de artefactos. Tampoco se ofrece comparacion con las lineas base oficiales del entorno SoccerTwos.

## Requisitos de hardware

- Inferencia: no requiere GPU. Una politica de ML-Agents exportada se ejecuta en CPU con onnxruntime a latencias del orden de milisegundos, si bien no se publican mediciones concretas para este checkpoint.
- VRAM estimada: no disponible. El repositorio completo ocupa 0,2 GB, pero incluye checkpoints de entrenamiento y logs; la exportacion .onnx utilizable es una fraccion de ese tamano.
- GPU recomendadas para entrenamiento: cualquier GPU NVIDIA con soporte CUDA acelera el bucle de entrenamiento de ML-Agents. No se especifica el hardware usado ni el numero de instancias paralelas de Unity, por lo que no se puede establecer un minimo fiable.
- Viabilidad en GPU de consumo: la inferencia cabe sin problema en cualquier GPU de consumo e incluso en integradas, dado que se trata de una politica de control y no de un modelo generativo.
- Opciones de despliegue: Unity con el paquete ML-Agents o Sentis (formato .nn), onnxruntime en CPU o GPU (formato .onnx), y el visor web de Hugging Face para la organizacion unity. El despliegue con vLLM, llama.cpp, Ollama o TGI no aplica, ya que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles. En este tipo de agentes la metrica relevante no es tokens por segundo, sino el coste por paso de simulacion, que depende de la velocidad del motor de fisica de Unity.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Coordinacion multiagente | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| poca (este modelo) | Actor-critic, entrenador POCA | SoccerTwos (2v2) | Si, con asignacion de credito | .nn, .onnx, checkpoints | no disponible | no disponible |
| Agentes de SoccerTwos con autojuego (PPO / self-play) | PPO con aprendizaje por autojuego | SoccerTwos (2v2) | Si, mediante competicion simetrica | .nn, .onnx | no disponible | no disponible |
| Agentes de ML-Agents entrenados con SAC | Actor-critic fuera de politica | Entornos de un solo agente | No soportado de forma nativa en escenarios competitivos multiagente discretos | .nn, .onnx | no disponible | no disponible |

No se dispone de identificadores concretos de checkpoints alternativos de SoccerTwos con los que comparar parametros, contexto o metricas, por lo que la comparacion anterior es cualitativa y se limita al tipo de algoritmo y al soporte de coordinacion.

## Limitaciones y advertencias

- Especificidad total al entorno: la politica esta entrenada para SoccerTwos y no generaliza a otras tareas, escenarios ni interfaces sin reentrenamiento.
- Ausencia de licencia: la model card no declara licencia, por lo que no hay autorizacion explicita de uso comercial y el riesgo legal recae en quien lo reutilice.
- Sin evidencia de rendimiento: no se publican curvas de entrenamiento, Elo ni tasa de victorias, de modo que no se puede afirmar que el agente juegue a un nivel utilizable.
- Repositorio sin validacion externa: 0 descargas y 0 likes implican que el modelo no ha sido verificado ni reproducido por terceros.
- Riesgo de politica suboptima o degenerada: en entornos de autojuego es habitual encontrar politicas que explotan atajos de la recompensa, y sin metricas publicadas no hay forma de descartarlo.
- Dependencia del ecosistema ML-Agents: la inferencia y la reanudacion del entrenamiento requieren la version adecuada de la libreria y, para .nn, un runtime compatible en Unity; cambios de version pueden romper la carga.
- Falta de reproducibilidad: al no publicarse el fichero de configuracion YAML ni los hiperparametros, no es posible replicar el entrenamiento desde cero.
- Limitaciones de idioma y de contexto: no aplican en el sentido de un modelo de lenguaje, pero conviene no confundir el producto: no procesa texto, no responde a instrucciones y no admite tool calling.
- Marcas temporales inusuales: el repositorio figura como creado y actualizado el 24 de septiembre de 2026, ambas identicas, lo que dificulta interpretar su historial de versiones.
- Rendimiento dependiente de la implementacion: en el visor web o en Unity, la calidad percibida del agente depende de la tasa de refresco y de la configuracion del motor de fisica, no solo del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nick17728/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Visor de agentes de la organizacion unity en Hugging Face: https://huggingface.co/unity
- Tutorial corto del curso de deep RL (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo sobre ML-Agents (unidad 5): https://huggingface.co/learn/deep-rl-course/unit5/introduction
