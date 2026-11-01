# RafaelJaime/act-sim-white-narrow-c100

## Resumen

ACT-sim-white-narrow-c100 es una política de imitación robótica basada en Action Chunking with Transformers (ACT), publicada por RafaelJaime en Hugging Face y entrenada con la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: "grasp the seed below the gripper" (agarrar la semilla situada bajo la pinza), sobre un robot de tipo `so_follower` (SO-101) equipado con dos cámaras, `top` y `wrist`, ambas a resolución 640x480 y 30 FPS.

A diferencia de un LLM, no es un modelo de lenguaje: es un policy de robótica que consume observaciones (estado articular de 6 dimensiones más dos imágenes RGB) y produce acciones de 6 dimensiones. Con 51.668.614 parámetros y pesos en safetensors de 2,5 GB, su relevancia es acotada: sirve como artefacto reproducible para el hackathon RobotEkin y el proyecto SmartSeed, y como ejemplo práctico de entrenamiento ACT en simulación con LeRobot 0.6.2.

El modelo se entrenó con 300 episodios y 88.410 fotogramas del dataset `RafaelJaime/smartseed-sim-grasp-white-v3-narrow`, durante 40.000 pasos con batch 32, optimizador AdamW y learning rate 1e-05. La model card no reporta resultados de evaluación en robot real ni en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,5 GB) |

Especificaciones adicionales del entorno:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `top`, `wrist` (3, 480, 640 cada una) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.top` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Librería | lerobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. La implementación corresponde al paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705) y se apoya en un transformer con codificación de las observaciones visuales (dos cámaras) y del estado articular, y una cabeza que emite vectores de acción de dimensión 6.

El entrenamiento se realizó sobre 300 episodios (88.410 fotogramas a 30 FPS) del dataset de simulación `smartseed-sim-grasp-white-v3-narrow`, con una única tarea: agarrar la semilla bajo la pinza. La configuración fue de 40.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni de aumentos de datos, ni se detalla la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Generación de acciones de control de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de estado articular e imágenes de dos cámaras.
- Ejecución de una tarea de manipulación concreta: agarrar la semilla situada bajo la pinza.
- Política de imitación entrenada en simulación, ejecutable con `lerobot-rollout` sobre hardware real o simulado compatible.
- Entrada multimodal: estado propioceptivo de 6 dimensiones más dos flujos visuales RGB de 640x480.
- Predicción por chunks de acciones, lo que aporta cierta suavidad y robustez frente a errores acumulados.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: sirve como referencia reproducible de un entrenamiento ACT con LeRobot 0.6.2 sobre un dataset de simulación, útil para comparar configuraciones de entrenamiento y de aumentos de datos.
- Benchmark interno de grasping: permite evaluar la tasa de éxito de una política ACT sobre la tarea "grasp the seed below the gripper" en el robot SO-101 y contrastarla con políticas entrenadas con otros hiperparámetros.
- Docencia y formación en aprendizaje por imitación: el par dataset-política y los comandos de `lerobot-rollout` y `lerobot-train` documentados en la model card facilitan prácticas guiadas de recogida de datos, entrenamiento y despliegue.
- Punto de partida para fine-tuning: al estar bajo licencia Apache 2.0 y en formato safetensors, se puede reentrenar sobre un dataset propio de grasping con objetos o condiciones de iluminación distintas.
- Validación de pipelines de simulación a real: útil para comprobar la transferencia de una política entrenada en simulación a un SO-101 físico, midiendo la degradación por diferencias de calibración, iluminación o posiciones de objeto.
- Integración en flujos de hackathon o prototipado rápido: el comando `lerobot-rollout` con `--strategy.type=base` permite lanzar la política durante un tiempo acotado (`--duration`) sin grabar episodios, adecuado para demos.
- Automatización de una celda de picking de semillas a pequeña escala: con las dos cámaras montadas y la tarea acotada, puede emplearse como controlador de bajo nivel en una estación de recogida repetitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni en simulación, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 51,7 M de parámetros y pesos en safetensors de 2,5 GB, el peso del modelo en FP32 ronda los 0,2 GB; el consumo real vendrá dominado por los dos flujos de imagen de 640x480 y por el resto del pipeline de LeRobot.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y suficiente memoria para el pipeline de LeRobot debería ser capaz de ejecutar la política; no se documentan requisitos mínimos.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no se aporta una cifra de VRAM medida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se reporta la frecuencia de inferencia alcanzada en el robot.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de políticas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, se pueden considerar alternativas de la misma familia de métodos de imitación visual:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-sim-white-narrow-c100 (este) | ACT, política de imitación | 51.668.614 | no aplica | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT | variable, no disponible | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | difusión de acciones | no disponible | no aplica | variable | Hugging Face |
| Políticas VQ-BeT / TDMPC en LeRobot | varias | no disponible | no aplica | variable | Hugging Face |

No se han encontrado en la información disponible métricas comparables (tasas de éxito, latencia, robustez) entre este modelo y las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni en simulación ni en robot real, por lo que no se puede afirmar que la política funcione fuera del entorno de entrenamiento.
- Tarea única y muy acotada: solo se entrenó para "grasp the seed below the gripper"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- Entrenada en simulación: la transferencia a un SO-101 físico puede degradarse por diferencias de calibración, iluminación, fondo o dinámica respecto al simulador.
- Dependencia estricta de la configuración de hardware: los nombres de cámara (`top`, `wrist`), sus resoluciones (640x480), el tipo de robot (`so_follower`) y la dimensionalidad del estado (6) deben coincidir exactamente con los del entrenamiento.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero no se documenta el sesgo de recogida de datos (posiciones, iluminación, variabilidad de la semilla) ni su impacto.
- Riesgo de sobreajuste al dataset de 300 episodios: no se reportan curvas de validación ni comparación con un conjunto retenido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de redistribuir derivados.
- Idiomas: no aplica; el campo "Idiomas soportados" figura como no disponible y el modelo no procesa texto.
- Repositorio con pocas descargas (19) y ningún "like": no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-sim-white-narrow-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-white-v3-narrow
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-white-v3-narrow
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
