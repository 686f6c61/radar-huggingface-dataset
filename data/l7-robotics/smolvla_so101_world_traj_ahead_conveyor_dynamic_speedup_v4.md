# L7-Robotics/smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, publicada por L7-Robotics, es un fine-tuning de `lerobot/smolvla_base` orientado a una tarea específica de manipulación sobre un robot SO-101: depositar un cubo rojo en un cuenco blanco sobre una cinta transportadora con velocidad dinámica. El modelo consume el estado articular de 6 dimensiones y tres cámaras RGB de 480x640 y produce comandos de acción de 6 dimensiones a 20 FPS.

Con 450.981.238 parámetros y un repositorio de 1,2 GB en formato safetensors, el modelo está pensado para desplegarse en hardware de consumo, en línea con la filosofía de SmolVLA de reducir coste computacional manteniendo un rendimiento competitivo en tareas de manipulación. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de robótica reales.

El interés actual de esta variante radica en su especialización: no es un modelo generalista, sino una política entrenada sobre 513 episodios y 193.672 fotogramas de un dataset concreto, lo que la hace útil como referencia para evaluar flujos de fine-tuning de VLA compactos en tareas industriales de pick-and-place con perturbaciones dinámicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con cabeza de acciones |
| Parametros totales | 450.981.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras de entrada | rear_top, right_side, wrist (3 x 480x640 RGB) |
| Entrada de estado | observation.state, 6 dimensiones |
| Salida de accion | action, 6 dimensiones |
| Frecuencia de datos | 20 FPS |
| Dataset de entrenamiento | L7-Robotics/so101_conveyor_dynamic_merge_v4 (513 episodios, 193.672 frames) |
| Tarea | "put the red cube in the white bowl" |
| Pasos de entrenamiento | 80.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.5.2 |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual y lingüístico con un decodificador de acciones, siguiendo el enfoque descrito en el paper arXiv:2506.01844. El modelo procesa observaciones multimodales (tres vistas RGB de 480x640 y un vector de estado de 6 dimensiones) junto con una instrucción en lenguaje natural, y emite directamente un vector de acción de 6 dimensiones por paso de control. La variante aquí descrita incorpora en su nombre la etiqueta "world_traj_ahead", que sugiere una formulación de predicción de trayectoria futura en el espacio de mundo, aunque la model card no detalla la implementación interna de dicha componente.

El entrenamiento se realizó mediante fine-tuning supervisado desde `lerobot/smolvla_base` sobre el dataset `L7-Robotics/so101_conveyor_dynamic_merge_v4`, compuesto por 513 episodios y 193.672 fotogramas capturados a 20 FPS. La configuración reportada incluye 80.000 pasos, batch size 16, optimizador AdamW con learning rate 1e-4 y seed 1000, ejecutado con LeRobot 0.5.2. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al aprendizaje por imitación.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Fusión multimodal de tres cámaras RGB (vista trasera superior, lateral derecha y muñeca) con estado propioceptivo de 6 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: la política recibe una tarea textual ("put the red cube in the white bowl") que guía la ejecución.
- Ejecución de políticas en bucle cerrado sobre el robot SO-101 (so_follower) mediante `lerobot-rollout`.
- Robustez ante velocidad dinámica de cinta transportadora, según indica el nombre del checkpoint y el dataset de entrenamiento.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode).

## Casos de uso

- Automatización de pick-and-place en línea de producción: la política ejecuta la tarea de depositar un cubo en un cuenco sobre una cinta con velocidad variable, adecuada para células de clasificación donde la posición del objeto cambia con el tiempo.
- Referencia para fine-tuning de VLA compactos: sirve como plantilla reproducible (configuración, dataset y comandos documentados) para equipos que quieran adaptar SmolVLA a sus propias tareas con LeRobot.
- Prototipado rápido en robótica de bajo coste: al estar diseñado para hardware de consumo y pesar 1,2 GB, permite iterar en estaciones de trabajo con GPU consumer antes de escalar a producción.
- Investigación en imitación con perturbaciones dinámicas: el dataset con cinta de velocidad variable permite estudiar la robustez de políticas VLA frente a cambios temporales en el entorno.
- Evaluación comparativa de políticas VLA: útil como baseline especializado en una tarea única para contrastar con políticas generalistas o con otras variantes de SmolVLA.
- Integración en pipelines de LeRobot: los comandos `lerobot-rollout` y `lerobot-train` documentados permiten incorporar el modelo a flujos de captura, entrenamiento y despliegue existentes.
- Docencia y demostraciones: su tamaño reducido y licencia permisiva lo hacen apto para talleres prácticos de aprendizaje por imitación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de éxito por tarea vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450,98 M de parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16 unos 0,9 GB, a lo que hay que sumar el coste de procesar tres imágenes de 480x640 por paso.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en FP16, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060/4060/4090, si bien el dato no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path`), y entrenamiento con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la frecuencia de captura de datos es de 20 FPS, pero no se reporta la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4 | 450.981.238 | no disponible | VLA especializado (SO-101, tarea única) | Apache 2.0 | Hugging Face (L7-Robotics) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base generalista | no disponible en la informacion | Hugging Face (lerobot) |
| Otras políticas LeRobot (ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Políticas de imitación | no disponible en la informacion | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se reportan métricas de éxito ni latencias para este checkpoint, y la model card no incluye comparaciones con otras políticas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("put the red cube in the white bowl") y un único tipo de robot (SO-101); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robots distintos al de entrenamiento, por lo que su fiabilidad en producción no está cuantificada.
- Dependencia de la configuración de cámaras: los nombres y posiciones de cámara (`rear_top`, `right_side`, `wrist`) deben coincidir exactamente con los del entrenamiento; cambios de montaje degradarán el rendimiento.
- Riesgo de sobreajuste al entorno del dataset: iluminación, fondo, posición de la cinta y características del cubo y el cuenco pueden afectar a la ejecución.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de control, el fallo se manifiesta como acciones erróneas del robot, con riesgo físico asociado.
- Idiomas no documentados: la instrucción textual se usa como condicionamiento, pero no se especifica qué lenguas maneja.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento de las licencias del modelo base y del dataset.
- Sin garantías del autor: la model card no incluye resultados de evaluación ni advertencias específicas de seguridad para operación con personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/L7-Robotics/smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/L7-Robotics/so101_conveyor_dynamic_merge_v4
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=L7-Robotics/so101_conveyor_dynamic_merge_v4
