# gadigesaisree/tqc-PandaReachDense-v3

## Resumen

tqc-PandaReachDense-v3 es un agente de aprendizaje por refuerzo entrenado con el algoritmo TQC (Truncated Quantile Critics) sobre el entorno PandaReachDense-v3, una tarea de alcance en la que un brazo robotico Panda de 7 grados de libertad debe llevar su efector final hasta una posicion objetivo en simulacion MuJoCo. El modelo lo publica el usuario gadigesaisree como ejercicio de la unidad 6 del curso Deep Reinforcement Learning de Hugging Face y se distribuye como checkpoint de la libreria stable-baselines3.

No es un modelo de lenguaje ni un modelo fundacional: es una politica neuronal compacta que mapea el estado del robot (posicion y velocidad del efector final, posicion de la garra, objetivo alcanzado y objetivo deseado) a acciones continuas de control. Su relevancia es formativa y de investigacion, ya que sirve como referencia reproducible de un algoritmo off-policy con critico distribuido por cuantiles aplicado a control continuo.

El autor declara una recompensa media de -1,20 +/- 0,40 en PandaReachDense-v3, sin verificacion independiente. Como la recompensa densa del entorno es la distancia negativa entre el objetivo alcanzado y el deseado, los valores proximos a 0 indican un mejor comportamiento de la politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico off-policy con redes MLP y critico distribuido por cuantiles (TQC, Truncated Quantile Critics) |
| Parametros totales | no disponible (el autor no declara la configuracion de red; en stable-baselines3 el valor por defecto es un MLP de 256x256) |
| Longitud de contexto | no aplica: modelo de control, no de lenguaje; el horizonte de decision por episodio lo fija el entorno |
| Tipos de cuantizacion | no aplica: el checkpoint se guarda en float32 y no se publican versiones cuantizadas |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint .zip de stable-baselines3 (politica y estado del optimizador en tensores PyTorch); no hay safetensors, GGUF ni ONNX publicados |
| Tipo de tarea | Aprendizaje por refuerzo, control continuo (pipeline reinforcement-learning) |
| Entorno | PandaReachDense-v3 (Gymnasium-Robotics sobre MuJoCo), recompensa densa |
| Algoritmo | TQC (Truncated Quantile Critics) |
| Biblioteca | stable-baselines3 |
| Espacio de observacion | Diccionario con observation, achieved_goal y desired_goal (dimensiones segun la version v3 del entorno) |
| Espacio de accion | Continuo (Box): control cartesiano del efector final mas accion del gripper |
| Recompensa de evaluacion | -1,20 +/- 0,40 (media declarada por el autor, no verificada) |
| Presupuesto de entrenamiento | no disponible |
| Numero de episodios de evaluacion | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-24 (segun los metadatos del repositorio) |

## Arquitectura y entrenamiento

TQC es un algoritmo actor-critico off-policy para espacios de accion continuos que combina aprendizaje por refuerzo distribuido con una correccion del sesgo de sobreestimacion. En lugar de estimar un unico valor escalar, cada critico aproxima la distribucion completa del retorno mediante regresion de cuantiles; la innovacion del metodo consiste en truncar los cuantiles superiores de la mezcla agregada, de modo que las colas altas de la distribucion no contaminen la estimacion del valor. El actor se aprende con el truco de reparametrizacion y una regularizacion de entropia al estilo de SAC, y el entrenamiento utiliza una red objetivo con media movil y un buffer de repeticion de experiencias.

En cuanto a los datos, no hay un corpus supervisado: el modelo se entrena por interaccion con el simulador MuJoCo del entorno PandaReachDense-v3, que devuelve una recompensa densa igual a la distancia negativa entre el objetivo alcanzado y el deseado. Por tanto, no hay RLHF, DPO ni ajuste por preferencias. La model card no especifica el numero de pasos de entrenamiento, las semillas utilizadas ni los hiperparametros (numero de cuantiles por critico, numero de criticos, tamano del buffer, tasa de aprendizaje), lo que limita la reproducibilidad exacta del resultado declarado.

## Capacidades

- Control continuo de un brazo robotico simulado: genera comandos cartesianos de posicion del efector final y de apertura o cierre del gripper a partir del estado del robot.
- Resolucion de una tarea de alcance (reach) con recompensa densa, es decir, aproximacion progresiva al objetivo en lugar de recompensa solo al exito.
- Generalizacion dentro del mismo entorno a distintas posiciones iniciales del efector final y del objetivo, siempre que se mantenga la dinamica del simulador.
- Ejecucion de episodios completos de forma autonoma, sin intervencion humana en el bucle de control.
- Exportabilidad a formatos de inferencia ligeros (TorchScript, ONNX) por tratarse de redes MLP de pequeno tamano, aunque el autor no publica dichos artefactos.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidad multilingue, vision, audio ni modo de pensamiento: es exclusivamente una politica de control.

## Casos de uso

- Control de brazo robotico en simulacion: la politica ejecuta la tarea de alcance en PandaReachDense-v3 y sirve como primer modulo de una cadena de pick-and-place, ya que el entorno forma parte de la familia de tareas robóticas de Gymnasium-Robotics.
- Punto de partida para transferencia sim2real: al ser una politica entrenada solo sobre MuJoCo, se puede usar como inicializacion en experimentos de aleatorizacion de dominio y ajuste fino sobre un Panda real, midiendo la degradacion respecto al simulador.
- Generacion de trayectorias para imitation learning: los episodios registrados por el agente (observaciones y acciones) permiten preentrenar una politica supervisada por clonacion de comportamiento, util cuando no se dispone de demostraciones humanas.
- Baseline de comparacion en investigacion de RL off-policy: permite contrastar SAC, TD3, DDPG o PPO con el mismo protocolo de evaluacion y el mismo entorno, ya que el checkpoint es directamente cargable con stable-baselines3.
- Ablacion del critico distribuido: el checkpoint facilita estudiar el efecto del truncado de cuantiles o del numero de criticos sobre la recompensa media, reentrenando con variantes del algoritmo.
- Validacion de infraestructura de despliegue: exportar la politica a ONNX o TorchScript e integrarla en un nodo ROS 2 permite medir latencias reales de inferencia antes de invertir en modelos mayores, dado que la red es muy ligera.
- Material didactico y docencia: la unidad 6 del curso Deep Reinforcement Learning de Hugging Face usa precisamente este flujo de trabajo, y el checkpoint publicado se puede cargar para ilustrar la evaluacion de un agente entrenado.
- Estudio de recompensa densa frente a dispersa: al ser el entorno de tipo Dense, sirve para comparar curvas de aprendizaje contra la variante con recompensa dispersa y analizar el impacto en la exploracion.

## Benchmarks y rendimiento

| Tarea | Entorno | Metrica | Valor declarado | Verificado |
|---|---|---|---|---|
| reinforcement-learning | PandaReachDense-v3 | mean_reward | -1,20 +/- 0,40 | No |

El dato procede del bloque model-index de la model card y no ha sido verificado de forma independiente. No se han publicado en la informacion disponible resultados adicionales (por ejemplo, tasa de exito, distancia media final, numero de episodios evaluados o comparacion con otros algoritmos), por lo que no es posible situar el modelo frente a alternativas con cifras homogeneas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. La politica es un MLP de pocas centenas de miles de parametros como maximo con la configuracion por defecto de stable-baselines3, por lo que el checkpoint ocupa del orden de unos pocos megabytes y cabe en cualquier GPU, incluida una iGPU o incluso solo CPU.
- GPU recomendadas: ninguna en particular. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; el cuello de botella durante el entrenamiento y la evaluacion es el simulador MuJoCo, que se ejecuta en CPU.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en CPU sin penalizacion perceptible de latencia.
- Opciones de despliegue: API de stable-baselines3 en Python (metodo predict), exportacion a TorchScript u ONNX para inferencia sin dependencia de SB3, integracion en nodos ROS 2 y ejecucion junto al simulador MuJoCo o a un entorno vectorizado para reentrenamiento.
- Latencia y throughput: no disponibles como medicion publicada. Una pasada directa de un MLP de este tamano se sitúa por debajo del milisegundo en CPU, y el limite real de frecuencia de control lo impone el entorno, que agrupa varios pasos de fisica por accion y fija un numero maximo de pasos por episodio (habitualmente 50 en la familia Reach).
- Entrenamiento: el autor no declara tiempo ni hardware. Con los ajustes tipicos de stable-baselines3 para este entorno, un millon de pasos suele completarse en decenas de minutos en GPU o en unas pocas horas en CPU; es una estimacion, no un dato publicado.

## Comparativa con modelos similares

No se dispone de checkpoints comparables verificados en la informacion proporcionada, por lo que la comparacion se plantea a nivel de algoritmo sobre el mismo entorno y la misma tarea.

| Alternativa | Familia | Fuera de politica | Critico | Parametros | Contexto | Rendimiento en PandaReachDense-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| tqc-PandaReachDense-v3 (este modelo) | TQC | Si | Distribuido por cuantiles truncados | no disponible | no aplica | -1,20 +/- 0,40 (declarado, no verificado) | no disponible | Checkpoint publicado en Hugging Face |
| SAC | Actor-critico con entropia maxima | Si | Escalar doble (clipped double Q) | no disponible | no aplica | no disponible | Implementacion de referencia en stable-baselines3 bajo licencia MIT | Implementado en stable-baselines3 y RL Baselines3 Zoo; sin checkpoint verificado para este entorno en la informacion disponible |
| TD3 | Actor-critico deterministico | Si | Escalar doble con retardo de politica | no disponible | no aplica | no disponible | Implementacion de referencia en stable-baselines3 bajo licencia MIT | Implementado en stable-baselines3 y RL Baselines3 Zoo; sin checkpoint verificado para este entorno en la informacion disponible |
| PPO | Actor-critico on-policy | No | Escalar | no disponible | no aplica | no disponible | Implementacion de referencia en stable-baselines3 bajo licencia MIT | Implementado en stable-baselines3; sin checkpoint verificado para este entorno en la informacion disponible |

## Limitaciones y advertencias

- Se trata de un ejercicio didactico de un curso, no de un modelo validado para produccion. Su recompensa media (-1,20) indica que la politica se queda lejos del maximo teorico (0), es decir, del alcance perfecto del objetivo.
- El resultado declarado figura como no verificado (verified: false) en el model-index y no se acompania del numero de episodios de evaluacion, de la desviacion por semilla ni del protocolo empleado.
- La licencia no esta indicada en el repositorio, por lo que no puede asumirse permiso de uso comercial ni de redistribucion. Cualquier uso empresarial exige aclarar antes las condiciones con el autor.
- La model card no documenta hiperparametros, presupuesto de entrenamiento ni semillas, lo que dificulta la reproduccion exacta del resultado.
- Fuerte dependencia del simulador: la politica esta ajustada a la dinamica concreta de MuJoCo y del modelo del Panda. Cambios de friccion, ruido de actuadores, retardo o masas degradan el comportamiento, y no se han publicado resultados de transferencia sim2real.
- Sobreajuste al entorno y a la distribucion de objetivos de entrenamiento: no hay evidencia de generalizacion a otras tareas (empujar, deslizar, agarrar) ni a objetivos fuera del rango visto durante el entrenamiento.
- Sin capacidades de lenguaje, vision, tool calling ni razonamiento multi-paso; no debe integrarse en pipelines de agentes conversacionales ni de generacion de codigo.
- Dependencia de versiones: el checkpoint esta ligado a stable-baselines3 y a las versiones de Gymnasium-Robotics y MuJoCo contemporaneas al entrenamiento; actualizaciones mayores pueden romper la carga o alterar el comportamiento observado.
- Sesgos relevantes: los derivados de la simulacion (modelado idealizado del robot, ausencia de desgaste y de incertidumbre sensorial) y de la distribucion de posiciones iniciales del conjunto de entrenamiento, no sesgos sociales.
- Metadatos incompletos y fechas inconsistentes en el repositorio (creacion registrada en 2026), sin descargas ni valoraciones de la comunidad, lo que impide cualquier validacion externa del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gadigesaisree/tqc-PandaReachDense-v3
- Curso Deep Reinforcement Learning de Hugging Face (unidad 6 mencionada en la model card): https://huggingface.co/learn/deep-rl-course/unit0/introduction
- Documentacion de TQC en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/tqc.html
- Repositorio de stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo (referencias y hiperparametros de TQC, SAC, TD3 y PPO): https://github.com/DLR-RM/rl-baselines3-zoo
- Articulo original de TQC, Kuznetsov et al., 2020: https://arxiv.org/abs/2005.18842
- Documentacion de Gymnasium-Robotics (entornos Panda y definicion de PandaReachDense-v3): https://robotics.farama.org/
- Repositorio de Gymnasium-Robotics: https://github.com/Farama-Foundation/Gymnasium-Robotics
