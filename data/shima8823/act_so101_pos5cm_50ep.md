# shima8823/act_so101_pos5cm_50ep

## Resumen

El modelo `act_so101_pos5cm_50ep` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario shima8823 utilizando el framework LeRobot de Hugging Face, y está diseñado para operar sobre el brazo robótico de código abierto SO-101 (Standard Open Arm 100) de TheRobotStudio. El modelo resuelve una tarea concreta de manipulación: agarrar una bola verde y colocarla en una caja, a partir de observaciones de una cámara frontal y del estado articular del robot.

Con 51,7 millones de parámetros, es un modelo compacto entrenado con 50 episodios teleoperados (33.070 fotogramas a 30 FPS). Su relevancia radica en que demuestra cómo un método de imitación moderno puede aplicarse a hardware robótico asequible y de código abierto, facilitando la reproducción de experimentos en entornos académicos y de investigación. La arquitectura ACT, publicada en el paper arXiv:2304.13705, es conocida por lograr altas tasas de éxito en tareas de manipulación con relativamente pocos datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un "chunk" de acciones futuras (una secuencia de acciones) a partir de las observaciones actuales. Esto reduce el error de acumulación y mejora la estabilidad del control. La política consume dos tipos de observaciones: el estado del robot (6 dimensiones, correspondientes a las articulaciones) y una imagen RGB de la cámara frontal con resolución 1080x1920. Produce una acción de 6 dimensiones (posiciones articulares o comandos de control).

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset propio del autor, `shima8823/so101_ball_to_box_pos5cm_50ep_20260823_163935`, que contiene 50 episodios de teleoperación (33.070 fotogramas a 30 FPS) de la tarea "Grab the green ball and then put the box". La configuración de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de técnicas adicionales como RLHF o DPO, ya que es un método de imitación supervisada.

## Capacidades

- Control de un brazo robótico SO-101 de 6 grados de libertad mediante predicción de chunks de acciones.
- Percepción visual a través de una cámara frontal RGB (resolución 1080x1920) para guiar la manipulación.
- Ejecución de tareas de pick-and-place: agarrar un objeto (bola verde) y depositarlo en una ubicación objetivo (caja).
- Generalización limitada a la tarea específica para la que fue entrenado; no es un modelo de propósito general.
- Integración con el ecosistema LeRobot, lo que permite cargar y ejecutar la política con comandos CLI estándar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas repetitivas de pick-and-place en líneas de ensamblaje: el modelo puede ejecutar la secuencia de agarrar y colocar objetos con precisión, reduciendo la intervención humana en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre diferentes configuraciones de robots o para comparar métodos de action chunking.
- Prototipado rápido en robótica educativa: al ser un modelo pequeño y entrenado con pocos datos, es adecuado para demostraciones en laboratorios universitarios o cursos de robótica.
- Evaluación de hardware de bajo coste: permite validar el rendimiento del brazo SO-101 en tareas de manipulación, ya que el modelo está específicamente calibrado para este robot.
- Benchmarking de frameworks de entrenamiento: puede utilizarse para comparar LeRobot con otras herramientas de aprendizaje por imitación en términos de facilidad de uso y resultados.
- Desarrollo de sistemas de teleoperación asistida: la política puede integrarse en un bucle de control donde un operador humano supervisa y corrige las acciones del robot en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible. Dado el tamaño del modelo (51,7M parámetros), es probable que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, pero no hay datos oficiales.
- El modelo está diseñado para ejecutarse en el robot SO-101 (so_follower) con una cámara frontal. La inferencia requiere acceso a la cámara y al puerto serie del robot.
- Se recomienda el uso de una GPU NVIDIA con soporte CUDA para la inferencia en tiempo real, aunque no se indica una GPU mínima.
- El despliegue se realiza mediante el framework LeRobot, que proporciona los comandos `lerobot-rollout` y `lerobot-train`. No se mencionan opciones de despliegue con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados. Al ser un modelo pequeño, se espera una inferencia rápida, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para SO-101). Existen otros modelos ACT en el Hub de Hugging Face, pero no se han encontrado datos de rendimiento o especificaciones que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the green ball and then put the box" y no generaliza a otras tareas o configuraciones de objetos.
- Depende de la calibración específica del robot SO-101 y de la posición de la cámara; cambios en el entorno pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en el mundo real, por lo que su fiabilidad en producción no está validada.
- Al ser un modelo de imitación, puede fallar ante perturbaciones no vistas durante el entrenamiento (cambios de iluminación, posiciones de objetos, etc.).
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no proporciona soporte.
- No se han documentado sesgos específicos, pero al ser un modelo robótico, los riesgos de alucinación o sesgo lingüístico no aplican.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shima8823/act_so101_pos5cm_50ep)
- [Dataset de entrenamiento](https://huggingface.co/datasets/shima8823/so101_ball_to_box_pos5cm_50ep_20260823_163935)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de hardware SO-101 en LeRobot](https://huggingface.co/docs/lerobot/so101)
- [Repositorio SO-ARM100 en GitHub](https://github.com/TheRobotStudio/SO-ARM100)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
