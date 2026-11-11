# Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_300_episodes_merged_multiple

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) con soft-prompting y flow matching desarrollado en el ecosistema LeRobot de Hugging Face. El modelo trata cada configuración robótica o de hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías de robot, sensores y espacios de acción diversos. La arquitectura está descrita en el paper arXiv 2510.10274.

La ficha corresponde a un fine-tuning concreto del modelo base `lerobot/xvla-base` sobre el dataset `Dataset_UR5e_Schunk_Gripper_300_episodes_merged_multiple`. Este checkpoint está especializado en una tarea de manipulación con un robot UR5e equipado con pinza Schunk: agarrar un bloque naranja y depositarlo en una caja azul. El modelo consume dos cámaras principales de 256x256, dos cámaras adicionales de 224x224 y un vector de estado de 8 dimensiones, y produce acciones de 7 dimensiones.

El modelo tiene 879.687.256 parámetros en formato safetensors, un repositorio de 1,8 GB y licencia Apache 2.0. Es relevante para desarrolladores que trabajan en imitación robótica con LeRobot, ya que demuestra el flujo completo de fine-tuning de un VLA preentrenado sobre datos propios y su despliegue mediante `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft-prompting y flow matching |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un backbone de visión-lenguaje con un cabezal de acciones basado en flow matching. La innovación central es el uso de Soft Prompts aprendibles: cada configuración de robot (morfología, sensores, espacio de acción) se representa como una "tarea" mediante un conjunto reducido de embeddings, lo que permite que un mismo modelo preentrenado se adapte a múltiples plataformas sin cambiar la arquitectura. El modelo base `lerobot/xvla-base` se fine-tunea después sobre datos de imitación específicos de cada robot.

Este checkpoint se entrenó durante 20.000 pasos con batch size 16, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. El dataset de entrenamiento contiene 300 episodios y 144.958 frames a 15 FPS, con una única tarea: "Grip the orange block and drop them into the blue box". Las entradas son dos imágenes de 256x256 (`observation.images.image`, `observation.images.image2`), dos de 224x224 (`observation.images.image3`, `observation.images.empty_camera_0`) y un estado de 8 dimensiones; la salida es una acción de 7 dimensiones. No se dispone de información sobre la composición exacta del corpus de preentrenamiento del modelo base ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones visuales y de estado.
- Control de un robot UR5e con pinza Schunk (`ur5_schunk_follower`) en tareas de pick-and-place.
- Fusión de múltiples cámaras (dos vistas de 256x256 y dos de 224x224) con estado proprioceptivo de 8 dimensiones.
- Ejecución de la tarea específica de agarre de bloque naranja y depósito en caja azul.
- Adaptación a nuevas morfologías y espacios de acción mediante soft prompts (capacidad del framework, no específica de este checkpoint).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.
- No se ha documentado capacidad de visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el checkpoint ejecuta directamente la tarea de agarrar un bloque y depositarlo en una caja, adecuado para validar pipelines de imitación con UR5e y pinza Schunk antes de escalar a producción.
- Prototipado rápido de políticas VLA: sirve como referencia de fine-tuning de `lerobot/xvla-base` sobre un dataset propio de 300 episodios, permitiendo medir el esfuerzo y los resultados con una configuración conocida.
- Investigación en imitación robótica: útil para reproducir experimentos del paper X-VLA en un entorno controlado con dos cámaras frontales y dos laterales.
- Benchmark interno de hardware: al ser un modelo pequeño (880M parámetros) y con entradas de baja resolución, permite evaluar latencia y throughput en GPUs de consumo antes de invertir en modelos mayores.
- Formación y docencia: ejemplo completo y ejecutable del flujo LeRobot (`lerobot-rollout` y `lerobot-train`) para enseñar entrenamiento por imitación de extremo a extremo.
- Base para transferencia a tareas similares: el checkpoint puede servir de inicialización para fine-tunings sobre variantes de la misma tarea (distintas posiciones de objeto o cajas) con menos datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parámetros, en fp32 serían aproximadamente 3,5 GB de pesos, y en fp16/bf16 alrededor de 1,8 GB, a lo que hay que sumar el coste de los encoders visuales y el estado de runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de consumo con 8-12 GB de VRAM debería ser suficiente para inferencia en precisión reducida; para entrenamiento con batch 16 se recomienda una GPU de datacenter (A100, H100) o una RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, en modelos con al menos 8 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA (este checkpoint) | 879,7 M | no disponible | Pick-and-place UR5e + Schunk | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está especializado en una única tarea ("Grip the orange block and drop them into the blue box"); no se espera generalización a otras tareas sin fine-tuning adicional.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot.
- El modelo asume una configuración de hardware concreta (`ur5_schunk_follower`) y nombres de cámara específicos (`front`, `side`, más dos cámaras adicionales); un cambio de montaje o de índices de cámara invalida la política.
- Posible sobreajuste al dataset de 300 episodios y a las condiciones de iluminación y posiciones de objeto registradas.
- Riesgo de fallo ante objetos, colores o posiciones distintos a los del entrenamiento.
- No se documentan sesgos, pero al ser un modelo de acción visual hereda los sesgos de los datos de demostración (posiciones, velocidades y estrategias del operador).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace recomendable validar exhaustivamente antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de información sobre cuantizaciones ni sobre el comportamiento en precisión reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_300_episodes_merged_multiple
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_300_episodes_merged_multiple
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_300_episodes_merged_multiple
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
