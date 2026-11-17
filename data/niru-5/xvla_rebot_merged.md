# niru-5/xvla_rebot_merged

## Resumen

X-VLA (`niru-5/xvla_rebot_merged`) es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, obtenido por ajuste fino del modelo base `lerobot/xvla-base` sobre el conjunto de datos `RoboCrafty/rebot_sort_merged`. Lo publica el usuario `niru-5` en Hugging Face y está pensado para controlar un robot físico de tipo `rebot_b601_follower` equipado con tres cámaras (`front_wide`, `gripper`, `high_oblique`) y un estado propioceptivo de 7 dimensiones, produciendo acciones de 7 dimensiones.

X-VLA es un framework de tipo *soft-prompted flow-matching* para VLA: cada configuración de robot o hardware se trata como una "tarea" codificada mediante un conjunto reducido de embeddings de *soft prompt* aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos. Este checkpoint concreto está especializado en tareas de recogida y clasificación de objetos (botella, toalla, llave) en un contenedor designado, entrenado con 127 episodios y 77 631 fotogramas a 30 FPS.

El modelo tiene 879 687 256 parámetros (dato real de los pesos en safetensors), un tamaño de repositorio de 3,5 GB y licencia Apache 2.0. Es relevante para quienes trabajan en imitación robótica con LeRobot y quieren un punto de partida reproducible para tareas de manipulación pick-and-place, aunque no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompts y flow matching (X-VLA) |
| Parametros totales | 879 687 256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA de tipo *soft-prompted flow-matching*: en lugar de entrenar un modelo separado por robot, codifica cada configuración de hardware como una "tarea" mediante un conjunto pequeño de embeddings de *soft prompt* aprendibles. Esto permite que un mismo modelo maneje morfologías, sensores y espacios de acción distintos. El modelo base es `lerobot/xvla-base`, del que este checkpoint es un ajuste fino.

El ajuste fino se realizó sobre `RoboCrafty/rebot_sort_merged`, con 127 episodios y 77 631 fotogramas a 30 FPS, en tres tareas: recoger una botella, una toalla o una llave y depositarlas en el contenedor designado. La configuración de entrenamiento fue de 20 000 pasos, batch size 8, optimizador `xvla-adamw`, learning rate 0,0001, semilla 1000 y LeRobot 0.7.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones a partir de estado propioceptivo (7 dimensiones) y tres cámaras RGB de 360x640.
- Percepción visual multi-cámara: integra vistas `front_wide`, `gripper` y `high_oblique` para localizar objetos y planificar la pinza.
- Ejecución de tareas pick-and-place: entrenado explícitamente para "pick up the bottle and put it in the designated bin", "pick up the towel and put it in the designated bin" y "pick up the key and put it in the designated bin".
- Política de imitación (imitation learning) desplegable con `lerobot-rollout` sobre el robot `rebot_b601_follower`.
- Adaptación a nuevas tareas mediante ajuste fino desde `lerobot/xvla-base` con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual ni multilingüismo en la información disponible.

## Casos de uso

- Clasificación de objetos en línea de producción: el modelo recoge botellas, toallas o llaves y las deposita en el contenedor designado, usando las tres cámaras para localizar el objeto y verificar la presa de la pinza.
- Prototipado rápido de políticas pick-and-place: sirve como referencia entrenada para validar la cadena completa de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets propios.
- Base para ajuste fino en tareas de recogida específicas: partiendo de este checkpoint o de `lerobot/xvla-base`, se puede reentrenar con un dataset propio de pocos centenares de episodios para nuevas categorías de objetos.
- Investigación en imitación robótica: útil para estudiar el efecto de los soft prompts y del flow matching en la transferencia entre morfologías y sensores.
- Automatización de tareas de ordenación en almacén: con 30 FPS y tres vistas, el modelo puede operar en celdas de trabajo donde la posición de los objetos varía dentro del espacio de entrenamiento.
- Evaluación comparativa de frameworks VLA: sirve como baseline reproducible (Apache 2.0, pesos safetensors, configuración de entrenamiento documentada) frente a otras políticas de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parámetros, en FP32 los pesos ocupan aproximadamente 3,5 GB, y en FP16/BF16 en torno a 1,8 GB, a lo que hay que sumar el coste de las tres cámaras y del pipeline de LeRobot.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para los pesos, aunque el rendimiento en tiempo real a 30 FPS no está documentado.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=niru-5/xvla_rebot_merged`; el entrenamiento se realiza con `lerobot-train`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `niru-5/xvla_rebot_merged` | 879,7 M | no disponible | VLA para `rebot_b601_follower` (pick-and-place) | Apache 2.0 | Hugging Face, 35 descargas |
| `lerobot/xvla-base` | no disponible | no disponible | VLA base multi-robot con soft prompts | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dataset pequeño y específico: 127 episodios y 77 631 fotogramas limitan la generalización a posiciones, iluminación, objetos o distractores distintos de los del entrenamiento.
- Dependencia del hardware: entrenado para el robot `rebot_b601_follower` y las cámaras `front_wide`, `gripper` y `high_oblique`; usar otra configuración requiere reentrenamiento o ajuste.
- Riesgo de sobreajuste a las tres tareas concretas (botella, toalla, llave) y al contenedor designado.
- Idiomas no documentados: el modelo no está pensado para generación de texto libre, por lo que no aplica la evaluación multilingüe habitual.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos, alucinación o robustez fuera de distribución; en robótica, los fallos de percepción pueden provocar colisiones o daños físicos.
- La model card advierte de que no se han proporcionado resultados de evaluación; conviene validar la política en el robot objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niru-5/xvla_rebot_merged
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged
