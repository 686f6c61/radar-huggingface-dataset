# nebula2wx/smolvla_standard34_ds12

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Está diseñado para control robótico mediante imitación, combinando percepción visual y comprensión del lenguaje con la generación directa de acciones motoras, y puede desplegarse en hardware de consumo. El modelo que nos ocupa, `nebula2wx/smolvla_standard34_ds12`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario nebula2wx sobre dos datasets propios de recogida de un bloque rojo.

Este fine-tuning concreto resuelve una tarea muy específica: "pick up the red block and put it on the plate" (coger el bloque rojo y ponerlo en el plato), sobre un robot de tipo `so_follower` con dos cámaras (`head` y `wrist`). Con 450.046.176 parámetros (unos 450 millones), el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo y en sistemas embebidos con aceleración, lo que lo hace relevante para prototipado rápido de políticas de manipulación robótica.

La relevancia actual del modelo radica en su enfoque: en lugar de entrenar un VLA desde cero, se parte de un modelo base preentrenado y se adapta con un dataset pequeño (60 episodios, 43.175 frames a 30 FPS) mediante imitación, siguiendo el flujo de trabajo de LeRobot 0.6.2. Esto democratiza el desarrollo de políticas robóticas para laboratorios y aficionados avanzados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 19,8 GB) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea, no a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que procesa observaciones multimodales (estado del robot de 6 dimensiones y hasta cuatro flujos de imagen) y emite un vector de acción de 6 dimensiones. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y este checkpoint se ha afinado por imitación sobre dos datasets del autor: `Whyynnot/standard_3_4_red_pick_up_20261031_220542` y `Whyynnot/standard_3_4_red_pick_up_enhance_20261031_225916`. La entrada incluye `observation.state` de forma `(6,)`, tres cámaras visuales de `(3, 256, 256)` y una cámara vacía de `(3, 480, 640)`; la salida es `action` de forma `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.2, 200.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. El dataset consta de 60 episodios y 43.175 frames a 30 FPS, correspondientes a la tarea única de recoger el bloque rojo y depositarlo en el plato. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado sobre demostraciones. El robot objetivo es `so_follower` con cámaras `head` y `wrist`.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para control de un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres vistas de 256x256 y una vista adicional de 480x640.
- Comprensión de instrucciones de tarea en lenguaje natural (la tarea está fijada en el entrenamiento: "pick up the red block and put it on the plate").
- Ejecución de políticas de manipulación en bucle cerrado mediante `lerobot-rollout`.
- Despliegue en hardware de consumo, según la model card del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código ni multilingüismo; es un modelo específico de robótica, no un LLM de propósito general.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: el modelo ejecuta la política "coger el bloque rojo y ponerlo en el plato" sobre un robot `so_follower`, adecuado para tareas de pick-and-place repetitivas en entornos controlados.
- Prototipado rápido de políticas de manipulación: gracias a sus 450M de parámetros y al flujo de LeRobot, un laboratorio puede afinar el modelo base con un dataset pequeño (60 episodios) y validar la política en horas.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar técnicas de fine-tuning sobre `smolvla_base` con datasets propios.
- Docencia y formación en robótica: su tamaño reducido y su licencia Apache 2.0 permiten usarlo en cursos y talleres sin coste de licencia.
- Despliegue en robots de bajo coste: al caber en GPUs de consumo, puede integrarse en estaciones de trabajo con RTX o en sistemas embebidos con aceleración, reduciendo la barrera de entrada frente a VLAs de mayor tamaño.
- Automatización de tareas de clasificación simple: con un dataset específico, el mismo flujo permite adaptar la política a tareas de recogida de objetos de un color o forma concreta en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros, los pesos en fp32 ocupan aproximadamente 1,8 GB y en fp16 unos 0,9 GB, a lo que hay que sumar el coste de las imágenes de entrada y del runtime.
- GPU recomendadas: no disponible en la información proporcionada; la model card del modelo base afirma que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se especifican modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot y `lerobot-train` para reentrenamiento; el ecosistema es LeRobot 0.6.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula2wx/smolvla_standard34_ds12 | 450.046.176 | no disponible | Pick-and-place de bloque rojo sobre `so_follower` | apache-2.0 | Hugging Face (15 descargas) |
| lerobot/smolvla_base | no disponible en la información | no disponible | Modelo base VLA preentrenado | no disponible en la información | Hugging Face |
| nebula2wx/pi05_standard_task_pick_red_block_plate | 4B | no disponible | Tarea de recogida de bloque rojo | no disponible en la información | Hugging Face |

El modelo base `lerobot/smolvla_base` es la referencia directa: este checkpoint es un fine-tuning del mismo. El modelo `pi05_standard_task_pick_red_block_plate`, del mismo autor, aborda una tarea similar con aproximadamente 4B de parámetros, es decir, casi diez veces más parámetros que este SmolVLA.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo ha sido entrenado para la tarea "pick up the red block and put it on the plate"; no generaliza a otras instrucciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 60 episodios y 43.175 frames limitan la diversidad de posiciones, iluminación y distractores; es probable que el rendimiento se degrade fuera de las condiciones de entrenamiento.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras con los nombres e índices exactos usados en el entrenamiento (`head`, `wrist`, `camera1`, `camera2`, `camera3`, `empty_camera_0`).
- Sin datos sobre sesgos, alucinación o comportamiento multilingüe: al no ser un LLM de texto, estas categorías no aplican directamente, pero tampoco se documentan análisis de robustez.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio de 19,8 GB: el tamaño del repo es elevado para un modelo de 450M de parámetros, lo que puede encarecer la descarga y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_standard34_ds12
- Perfil del autor: https://huggingface.co/nebula2wx
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset 1: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_20261031_220542
- Dataset 2: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_enhance_20261031_225916
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Whyynnot/standard_3_4_red_pick_up_20261031_220542+Whyynnot/standard_3_4_red_pick_up_enhance_20261031_225916
