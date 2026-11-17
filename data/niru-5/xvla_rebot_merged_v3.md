# niru-5/xvla_rebot_merged_V3

## Resumen

X-VLA (niru-5/xvla_rebot_merged_V3) es un policy de vision-lenguaje-accion (VLA) para robótica, afinado a partir del modelo base lerobot/xvla-base mediante la librería LeRobot de Hugging Face. X-VLA es un framework "soft-prompted" de flow matching que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos.

Esta versión concreta está especializada en el robot `rebot_b601_follower`, con tres cámaras (`front_wide`, `gripper`, `high_oblique`) y un espacio de estado y acción de 7 dimensiones. El modelo resuelve tareas de manipulación tipo "pick and place" (recoger un objeto y depositarlo en un contenedor designado) y se distribuye con pesos safetensors de aproximadamente 880 millones de parámetros bajo licencia Apache 2.0.

Es relevante porque demuestra el patrón de especialización de modelos VLA fundacionales mediante fine-tuning sobre datasets de imitación pequeños (173 episodios, 104.781 frames a 30 FPS), un flujo de trabajo cada vez más habitual para desplegar políticas robóticas en hardware concreto sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las tareas se especifican en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (v0.7.0 en el entrenamiento) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | rebot_b601_follower |
| Camaras | front_wide, gripper, high_oblique |
| Entrada de estado | observation.state, shape (7,) |
| Entrada visual | 3 imágenes de (3, 360, 640) |
| Salida de accion | action, shape (7,) |
| Tamano del repo | 1.8 GB |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con flow matching: en lugar de predecir acciones de forma determinista, modela el campo de flujo que transforma ruido en trayectorias de acción, lo que permite generar secuencias de movimiento continuas y multimodales. La innovación central es el uso de Soft Prompts aprendibles que codifican cada configuración de robot o hardware como una "tarea", de modo que un mismo modelo puede adaptarse a morfologías, sensores y espacios de acción distintos cambiando únicamente esos embeddings de prompt. Esta versión parte del checkpoint lerobot/xvla-base y se ha especializado en el robot `rebot_b601_follower`.

El fine-tuning se realizó sobre el dataset RoboCrafty/rebot_sort_merged_V3, compuesto por 173 episodios y 104.781 frames grabados a 30 FPS, con tres tareas de manipulación: recoger una botella, una toalla o una llave y depositarlos en el contenedor designado. La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador `xvla-adamw`, learning rate 0,0001 y semilla 1000, usando LeRobot 0.7.0. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones multimodales (estado del robot e imágenes de tres cámaras).
- Manipulación visual guiada por lenguaje: ejecuta instrucciones como "pick up the bottle and put it in the designated bin" condicionando el movimiento a la tarea textual.
- Percepción visual multi-cámara: procesa simultáneamente vistas `front_wide`, `gripper` y `high_oblique` a resolución 360x640.
- Control de agarre: la dimensión de acción incluye el control del gripper junto con la cinemática del brazo.
- Adaptación a configuraciones de hardware mediante soft prompts (capacidad heredada del framework X-VLA).
- Ejecución de políticas en tiempo real mediante `lerobot-rollout` a 30 FPS.
- No se ha documentado soporte de tool calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking"; es un modelo de acción, no un LLM conversacional.

## Casos de uso

- Clasificación y sorting automatizado en línea de producción: el modelo recoge objetos (botellas, toallas, llaves) y los deposita en contenedores designados, integrándose en celdas de pick-and-place con el robot rebot_b601_follower.
- Prototipado rápido de políticas de imitación: sirve como referencia de fine-tuning sobre lerobot/xvla-base para equipos que quieran adaptar X-VLA a su propio robot y dataset con el flujo `lerobot-train`.
- Investigación en VLA: permite reproducir y comparar el comportamiento de X-VLA en una tarea concreta con tres cámaras y un espacio de acción de 7 dimensiones, útil para estudiar transferencia entre morfologías.
- Automatización de tareas de recogida en almacén: con 104.781 frames de entrenamiento a 30 FPS, el policy puede ejecutar ciclos de recogida y depósito de forma continua durante sesiones de 60 segundos o más mediante `lerobot-rollout`.
- Base para evaluación comparativa de políticas robóticas: al estar entrenado con LeRobot 0.7.0 y publicar la configuración exacta, permite reproducir experimentos y medir tasas de éxito en entornos controlados.
- Demostraciones y validación de hardware: útil para verificar la calibración de cámaras y del robot antes de entrenar políticas propias, ejecutando la política preentrenada sobre el hardware real.
- Educación y formación en robótica de imitación: ejemplo completo y ligero (1,8 GB) para enseñar el pipeline observación-acción con flow matching en un curso práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 879,7 M de parámetros, en fp32 serían aproximadamente 3,5 GB de pesos; en fp16/bf16, unos 1,8 GB; en int8, unos 0,9 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: por tamaño de pesos, es plausible que quepa en GPUs consumer con 8 GB o más de VRAM, aunque no está confirmado ni se documenta el consumo real durante la inferencia (que incluye tres flujos de vídeo a 360x640).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para fine-tuning). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un policy de robótica de este tipo.
- Latencia y throughput: el dataset se grabó a 30 FPS y el bucle de control opera a esa frecuencia, pero no se publican medidas de latencia por paso ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niru-5/xvla_rebot_merged_V3 | 879,7 M | no disponible | VLA (X-VLA) especializado en rebot_b601_follower | apache-2.0 | Hugging Face, 12 descargas |
| lerobot/xvla-base | no disponible | no disponible | VLA base X-VLA, multi-robot | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej., ACT, Diffusion Policy) | no disponible | no disponible | Políticas de imitación | no disponible | Hugging Face / LeRobot |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito medidas en robot real, por lo que se desconoce su fiabilidad en producción.
- Especialización estrecha: entrenado únicamente para tres tareas de recogida y depósito (botella, toalla, llave) con el robot rebot_b601_follower; no generalizará a otros objetos, tareas o morfologías sin fine-tuning.
- Dependencia del hardware exacto: las cámaras deben coincidir con los nombres y la configuración de observación (`front_wide`, `gripper`, `high_oblique`) y el robot debe ser del tipo `rebot_b601_follower`; cambios de cámara, iluminación o posición alteran el rendimiento.
- Dataset pequeño: 173 episodios y 104.781 frames son un volumen limitado, lo que aumenta el riesgo de sobreajuste a posiciones y condiciones concretas del entorno de grabación.
- Riesgo de alucinación motora: como todo modelo generativo de acciones, puede producir trayectorias inválidas o colisiones; requiere supervisión y paradas de seguridad en el robot.
- Idiomas: no hay información sobre capacidades multilingües; las instrucciones de tarea documentadas están en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base lerobot/xvla-base.
- Fecha de creación futura (2026-11-16) en los metadatos: conviene verificar la procedencia y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niru-5/xvla_rebot_merged_V3
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged_V3
- Paper X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged_V3
