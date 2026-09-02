# leapshared/Incline_new_60epi

## Resumen

`leapshared/Incline_new_60epi` es un modelo de robótica basado en X-VLA (Vision-Language-Action), desarrollado por el usuario `leapshared` y publicado en HuggingFace. Se trata de un fine-tuning del modelo base `lerobot/xvla-base` sobre un dataset propio de 60 episodios de demostración, con el objetivo de ejecutar una tarea concreta de manipulación: colocar cuatro pesas metálicas sobre un carro azul situado en una rampa. El modelo está entrenado con el framework LeRobot y utiliza la arquitectura X-VLA, que combina un modelo de lenguaje y visión con un mecanismo de *soft prompts* para adaptarse a distintos robots y configuraciones de sensores.

El modelo tiene aproximadamente 880 millones de parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 1,8 GB. Su relevancia radica en que demuestra cómo un modelo VLA preentrenado puede especializarse con pocos datos (60 episodios) para una tarea robótica específica, manteniendo la flexibilidad de la arquitectura X-VLA para diferentes morfologías de robot. Al estar licenciado bajo Apache-2.0, es totalmente libre para uso comercial e investigación.

Al ser un modelo de robótica, no procesa texto ni genera lenguaje natural; su entrada son imágenes de cámaras y el estado del robot, y su salida es una secuencia de acciones de 16 dimensiones. No se han publicado resultados de evaluación en la model card, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (soft-prompted, flow-matching Vision-Language-Action) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework de Vision-Language-Action que trata cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de *soft prompts* aprendibles. Esto permite que un único modelo base reconcilie diversas morfologías de robot, sensores y espacios de acción. La arquitectura combina un codificador visual, un modelo de lenguaje y un mecanismo de *flow matching* para generar acciones continuas. El modelo base `lerobot/xvla-base` es el punto de partida, y este repositorio es un fine-tuning específico para el robot `bi_openarm_follower` con tres cámaras (`follower_d455f`, `left_wrist`, `right_wrist`).

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `leapshared/Incline_new_20260902_203009`, que contiene 60 episodios y 66.823 frames a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, batch size de 16, optimizador `xvla-adamw`, learning rate de 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento de imitación supervisada estándar. La tarea registrada es "Place the four metal weights on the blue cart on the ramp".

## Capacidades

- Control de robot bimanual: el modelo genera acciones de 16 dimensiones para el robot `bi_openarm_follower`, permitiendo manipulación con dos brazos.
- Percepción multimodal: procesa tres flujos de imagen (dos a 256x256 y uno a 224x224) junto con el estado del robot (8 dimensiones), lo que le permite operar con cámaras externas y de muñeca.
- Imitación de tareas específicas: está entrenado para una tarea concreta de pick-and-place (colocar pesas en un carro sobre una rampa), demostrando capacidad de aprendizaje por demostración.
- Generalización limitada a la tarea: al ser un fine-tuning con solo 60 episodios, su capacidad se restringe a la tarea y configuración de sensores del dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No tiene capacidades de lenguaje natural, generación de texto, código, visión general ni tool calling; es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de colocar objetos en una posición determinada, como en líneas de montaje o laboratorios de robótica, usando el comando `lerobot-rollout` con el robot `bi_openarm_follower`.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base con pocos datos, útil para estudiar la transferencia de habilidades y la eficiencia de datos en robótica.
- Desarrollo de políticas robóticas personalizadas: investigadores pueden partir de este modelo y fine-tunearlo con nuevos datasets para adaptarlo a otras tareas de manipulación, gracias a la arquitectura de soft prompts de X-VLA.
- Evaluación de hardware robótico: permite probar la configuración de cámaras y el robot `bi_openarm_follower` en un escenario de tarea real, validando la integración de sensores y actuadores.
- Benchmarking de algoritmos de control: al ser un modelo de código abierto con licencia Apache-2.0, puede usarse como baseline para comparar con otras políticas de imitación o métodos de reinforcement learning.
- Educación y formación en robótica: estudiantes y desarrolladores pueden desplegar el modelo en un robot simulado o real para aprender el flujo de trabajo de LeRobot, desde la grabación de datos hasta la ejecución de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación del modelo.
- Con ~880 M de parámetros, el modelo en precisión fp32 ocuparía aproximadamente 3,5 GB de memoria, y en fp16 unos 1,8 GB. Esto sugiere que podría ejecutarse en GPUs consumer con 8 GB de VRAM o más, aunque no hay confirmación oficial.
- El entrenamiento se realizó con batch size 16, lo que implica una GPU con al menos 16-24 GB de VRAM para reproducir el entrenamiento (probablemente una A100 o RTX 4090).
- Para inferencia, LeRobot soporta despliegue con PyTorch en GPU. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y de la configuración de las cámaras.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. El modelo es un fine-tuning de `lerobot/xvla-base`, por lo que su rendimiento debería compararse con el del modelo base y con otros VLA como OpenVLA o RT-2, pero no hay métricas publicadas para establecer una comparación objetiva. Se recomienda consultar el paper de X-VLA (arxiv:2510.10274) para referencias de rendimiento del modelo base.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (60 episodios), lo que limita la generalización a variaciones de la tarea, iluminación, posiciones de objetos o distracciones.
- No hay resultados de evaluación en robot real; el rendimiento real es desconocido y podría no cumplir las expectativas en entornos no controlados.
- El modelo está especializado en una tarea y configuración de sensores concretas; usarlo con otras cámaras, robots o tareas requerirá reentrenamiento.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje ni razonamiento simbólico; no debe usarse para tareas de NLP o visión general.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el autor no proporciona soporte ni responsabilidad por daños.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un sistema físico, un fallo de control podría causar daños materiales o personales; se recomienda operar con supervisión humana y en entornos seguros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leapshared/Incline_new_60epi
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/Incline_new_20260902_203009
- Modelo base: https://huggingface.co/lerobot/xvla-base
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
