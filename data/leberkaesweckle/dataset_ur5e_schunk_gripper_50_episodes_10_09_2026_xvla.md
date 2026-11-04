# Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026_XVLA

## Resumen

X-VLA es un marco de Vision-Language-Action (VLA) basado en *soft prompting* y *flow matching* que trata cada configuracion de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles. Este repositorio concreto, publicado por el usuario Leberkaesweckle, es un *fine-tuning* del modelo base `lerobot/xvla-base` sobre un dataset propio de 50 episodios grabados con un brazo UR5e equipado con pinza Schunk. El resultado es una politica de imitacion lista para ejecutar una tarea de pick-and-place sobre ese hardware especifico.

El modelo resuelve el problema de adaptar un VLA generalista a una morfologia y un espacio de acciones concretos sin reentrenar desde cero: basta con un dataset pequeno (15.011 frames a 15 FPS) y un *fine-tuning* de 20.000 pasos para obtener una politica que consume dos flujos de camara a 256x256, dos a 224x224 y un vector de estado de 8 dimensiones, y produce acciones de 7 dimensiones. Es relevante porque demuestra el flujo completo de LeRobot para llevar un VLA preentrenado a un robot real en pocas horas de computo.

La arquitectura subyacente combina un backbone vision-lenguaje con un cabezal de *flow matching* para generar trayectorias de accion continuas, y cuenta con aproximadamente 879,7 millones de parametros en formato safetensors (1,8 GB de repositorio). La licencia Apache 2.0 permite uso comercial, aunque el autor no ha publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompting y flow matching (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con *soft prompting*: cada configuracion de robot, conjunto de sensores y espacio de acciones se representa como una "tarea" mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles. Esto permite que un unico modelo reconcilie morfologias y espacios de accion heterogeneos. El cabezal de acciones emplea *flow matching*, una formulacion generativa continua adecuada para trayectorias de control robotico, en lugar de regresion directa o discretizacion de acciones.

El *fine-tuning* de este repositorio se realizo con LeRobot 0.6.2 sobre el dataset `Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026`: 50 episodios, 15.011 frames a 15 FPS, con la unica tarea "Grip the orange block and drop them into the blue box". La configuracion de entrenamiento fue de 20.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000. No se documenta el numero de tokens de preentrenamiento del modelo base ni la composicion de su dataset, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de acciones de control robotico de 7 dimensiones (`action`, shape `(7,)`) a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa cuatro flujos de imagen (`observation.images.image` y `image2` a 256x256; `image3` y `empty_camera_0` a 224x224).
- Fusion de estado proprioceptivo de 8 dimensiones (`observation.state`) con las observaciones visuales.
- Ejecucion de tareas de manipulacion pick-and-place en un UR5e con pinza Schunk (`ur5_schunk_follower`).
- Adaptacion a nueva morfologia mediante *fine-tuning* desde `lerobot/xvla-base` con soft prompts especificos del hardware.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual ni procesamiento de audio.

## Casos de uso

- Pick-and-place industrial de piezas: la politica ejecuta la tarea "coger el bloque naranja y dejarlo en la caja azul" sobre un UR5e con pinza Schunk, usando dos camaras frontales y laterales para localizar el objeto y planificar la trayectoria de 7 dimensiones.
- Prototipado rapido de celdas robotizadas: con solo 50 episodios y 20.000 pasos de entrenamiento se obtiene una politica funcional, lo que permite validar una configuracion de camaras y efector antes de invertir en datasets mayores.
- Generacion de datos sinteticos y aumentacion: la politica sirve como referencia para comparar distribuciones de acciones y detectar episodios anomalos en el dataset de entrenamiento.
- Investigacion en imitation learning: punto de partida reproducible para estudiar el efecto del numero de episodios, la posicion de camaras o la tasa de frames en el exito de tareas de manipulacion.
- Benchmark interno de VLA: al estar fine-tuneado sobre un dataset publico y con hiperparametros documentados, permite comparar variantes de X-VLA y de otros VLA de LeRobot bajo condiciones controladas.
- Demostraciones y docencia: el comando `lerobot-rollout` permite ejecutar la politica en el robot durante 60 segundos con una unica linea de comandos, util para talleres y validaciones rapidas de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 879,7 M de parametros, en FP16 el peso ronda 1,8 GB, por lo que deberia caber en GPUs consumer con 8 GB o mas, aunque no se confirma oficialmente.
- GPU recomendadas: no disponible. El comando de entrenamiento de referencia usa `--policy.device=cuda` sin especificar modelo de GPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del checkpoint (1,8 GB de repositorio), aunque no hay validacion publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabo a 15 FPS, lo que sugiere un ciclo de control en ese orden, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA (este fine-tuning) | 879,7 M | no disponible | Pick-and-place UR5e + Schunk | Apache 2.0 | HuggingFace |
| lerobot/xvla-base | no disponible | no disponible | VLA generalista multi-robot | no disponible en la informacion | HuggingFace |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning por tarea | no disponible | LeRobot / HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluacion en robot real: se desconoce la tasa de exito de la tarea y su robustez ante cambios de posicion, iluminacion o distractores.
- El modelo esta especializado en una unica tarea ("Grip the orange block and drop them into the blue box") y en un hardware concreto (`ur5_schunk_follower`); no generaliza a otras tareas sin reentrenamiento.
- Requiere que los nombres e indices de camara coincidan exactamente con las claves de observacion del entrenamiento (`observation.images.image`, `image2`, `image3`, `empty_camera_0`); un desajuste provoca fallos de inferencia.
- El dataset de entrenamiento es muy reducido (50 episodios, 15.011 frames), lo que aumenta el riesgo de sobreajuste a posiciones y condiciones concretas.
- No se documentan sesgos, riesgos de alucinacion ni comportamiento multilingue, ya que no es un modelo de lenguaje conversacional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026_XVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Guia LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
