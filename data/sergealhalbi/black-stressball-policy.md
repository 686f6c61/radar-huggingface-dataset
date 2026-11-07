# SergeAlhalbi/black-stressball-policy

## Resumen

`black-stressball-policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub a través del framework LeRobot. La desarrolla el usuario SergeAlhalbi y su propósito es controlar un brazo robótico de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) para ejecutar una tarea concreta de manipulación: colocar una pelota antiestrés negra dentro de un cuenco. No es un modelo de lenguaje: es un modelo de política visomotora que consume el estado articular y una imagen de cámara y emite comandos de acción.

Técnicamente es una red transformer con unos 51,7 millones de parámetros (dato real de los safetensors) que predice trozos de acción (*action chunks*) en lugar de pasos individuales, una innovación de ACT que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La entrada combina un vector de estado de 6 dimensiones con una imagen RGB de 480x640 procedente de una cámara montada en la pinza, y la salida es un vector de acción de 6 dimensiones a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento de ACT, despliegue en robot real) y como política base para quien quiera replicar la tarea o adaptar el flujo a su propio robot. No hay resultados de evaluación publicados, ni licencia declarada, ni benchmarks, lo que limita su uso en producción tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un solo frame más historial de acciones según ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `gripper_camera` |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.gripper_camera`, shape `(3, 480, 640)` |
| Salida de acción | `action`, shape `(6,)` |
| Frecuencia de control | 30 FPS |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) y un decodificador que genera secuencias de acciones (*chunks*) en lugar de un único paso. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso y permite un control más suave en tareas de manipulación. El modelo aquí publicado tiene 51,7 millones de parámetros, coherente con una configuración ACT de tamaño pequeño-medio orientada a hardware de bajo coste.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `SergeAlhalbi/black-stressball-tutorial_20261105_175124`, compuesto por 50 episodios y 33.244 frames grabados a 30 FPS, todos correspondientes a la tarea "place the stressball into the bowl". La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni datos adicionales; es aprendizaje supervisado puro a partir de teleoperación. No se especifica la composición del dataset más allá del número de episodios ni si hubo aumentos de datos o variaciones de posición, iluminación o distractores.

## Capacidades

- Generación de comandos de acción de 6 dimensiones a 30 FPS para un robot `so_follower`.
- Percepción visomotora a partir de una única cámara montada en la pinza (`gripper_camera`, 480x640).
- Predicción de *action chunks*: emite secuencias cortas de acciones en lugar de pasos aislados, lo que reduce el jitter y la acumulación de error.
- Ejecución de una tarea concreta de manipulación: colocar una pelota antiestrés negra en un cuenco.
- Integración con el ecosistema LeRobot: carga directa vía `lerobot-rollout` y entrenamiento reproducible con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades lingüísticas o multimodales de propósito general.

## Casos de uso

- Replicación de la tarea de referencia: usar la política tal cual con `lerobot-rollout` sobre un SO-100/SO-101 provisto de cámara en pinza para reproducir el experimento "place the stressball into the bowl" y validar el pipeline completo de LeRobot.
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo mínimo y reproducible de un flujo ACT de principio a fin (grabación, entrenamiento, despliegue) en cursos de robótica o talleres prácticos.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio para adaptar la política a una tarea distinta del mismo robot, aprovechando la configuración y los hiperparámetros publicados.
- Benchmark interno de infraestructura: medir latencia, throughput y estabilidad de un stack LeRobot + ACT en un robot de bajo coste antes de escalar a tareas más complejas.
- Pruebas de integración hardware-software: validar calibración de cámaras, puertos y cinemática del `so_follower` con una política conocida antes de desarrollar políticas propias.
- Generación de datos sintéticos o aumentados: usar la política como generador de trayectorias plausibles para aumentar el dataset de entrenamiento en tareas de pick-and-place similares.
- Demostración en ferias o divulgación: política ligera (0,2 GB) que cabe en un portátil con GPU consumer y puede ejecutarse en directo en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet."*), por lo que no hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en FP32 el modelo ocupa en torno a 0,2 GB de pesos, por lo que la VRAM necesaria es Dominada por el codificador visual y los buffers de inferencia, no por el número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real a 30 FPS. Para entrenamiento con batch size 8, una RTX 3090/4090 o A100 acelera notablemente los 100.000 pasos.
- Cabe en GPU consumer: sí, con holgura; incluso una GPU integrada moderna podría ejecutar la inferencia, aunque no se garantiza latencia a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=SergeAlhalbi/black-stressball-policy`), y en general el stack PyTorch de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la política está pensada para control a 30 FPS, pero no se publican medidas de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SergeAlhalbi/black-stressball-policy` | 51,7 M | ACT (LeRobot) | Colocar pelota en cuenco (SO-100/SO-101) | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | Múltiples tareas de manipulación | Apache-2.0 (LeRobot) | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | Diffusion Policy | Manipulación visomotora | Apache-2.0 (LeRobot) | Hugging Face Hub / docs LeRobot |
| Políticas π0 / OpenVLA | miles de millones | VLA | Manipulación generalista | variable | Hugging Face Hub |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación cualitativa se limita a señalar que este modelo es una política ACT de un solo robot y una sola tarea, mientras que las alternativas generalistas (VLA) cubren muchas más tareas a costa de un tamaño mucho mayor y requisitos de hardware superiores.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez ante variaciones de posición, iluminación o distractores.
- Tarea única y específica: solo se ha entrenado para "place the stressball into the bowl" con un robot `so_follower` y una cámara `gripper_camera`; no generaliza a otras tareas, objetos ni configuraciones de cámara.
- Dependencia del hardware exacto: la política asume la cinemática y calibración del SO-100/SO-101 y una cámara en la pinza; cambios de montaje, resolución o índice de cámara pueden degradar o invalidar el comportamiento.
- Dataset pequeño: 50 episodios y 33.244 frames son una base limitada; es probable que la política sea frágil ante posiciones iniciales del objeto distintas a las de la teleoperación.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al entorno de grabación: sin datos sobre variaciones de iluminación o fondo, no se puede descartar que la política dependa de características espurias del escenario original.
- Sin soporte lingüístico ni de agentes: no debe tratarse como un LLM ni usarse para tareas de texto, tool calling o razonamiento.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni int8/int4 oficiales, lo que limita el despliegue en hardware muy restringido (aunque el tamaño del modelo lo hace viable en FP32 en la mayoría de GPUs).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SergeAlhalbi/black-stressball-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/SergeAlhalbi/black-stressball-tutorial_20261105_175124
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SergeAlhalbi/black-stressball-tutorial_20261105_175124
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Perfil de GitHub del autor: https://github.com/SergeAlhalbi
