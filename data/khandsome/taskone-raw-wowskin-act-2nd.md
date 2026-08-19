# KHandsome/taskone-raw-wowskin-act-2nd

## Resumen

El modelo `KHandsome/taskone-raw-wowskin-act-2nd` es una política de imitación learning para robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario KHandsome y publicada bajo licencia Apache 2.0. Está entrenado para ejecutar una tarea concreta de manipulación: recoger y colocar bollos en una bandeja roja y piezas de baguette en una bandeja blanca, utilizando un robot SO-100 con una configuración especial denominada "wowskin" (que añade un sensor de estado adicional de 15 dimensiones). El modelo se ha entrenado con el framework LeRobot y se distribuye en formato safetensors con un total de 51.747.206 parámetros.

Este modelo es relevante porque demuestra la aplicación práctica de ACT en un escenario real de pick and place, aprovechando la integración con LeRobot para el entrenamiento y despliegue. Su tamaño compacto (0.2 GB) lo hace adecuado para experimentación en hardware de gama media, y su licencia permisiva permite su uso comercial y modificación. No se trata de un modelo de lenguaje, sino de una política visual-motora que consume imágenes de dos cámaras y el estado del robot para generar acciones de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.747.206 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un método de imitación learning que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política consume como entrada el estado del robot (6 dimensiones), un estado adicional de "wowskin" (15 dimensiones) y dos imágenes RGB de 480x640 píxeles procedentes de las cámaras base y de muñeca. Como salida genera acciones de 6 dimensiones.

El entrenamiento se realizó con el dataset `KHandsome/Task-one-combine-2nd`, que contiene 501 episodios y 156.826 fotogramas a 30 FPS. Se utilizaron 30.000 pasos de entrenamiento con un batch size de 10, optimizador AdamW, learning rate de 1e-5 y semilla 1000, bajo la versión 0.6.0 de LeRobot. No se ha aplicado RLHF ni DPO; es un entrenamiento puramente supervisado con datos teleoperados.

## Capacidades

- Ejecución de tareas de pick and place en un robot SO-100 con configuración "wowskin", basándose en observaciones visuales y de estado.
- Generación de acciones de control de 6 grados de libertad (posición y orientación del efector final).
- Procesamiento de dos flujos de imagen simultáneos (cámara base y cámara de muñeca) a resolución 480x640.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Soporte de inferencia en tiempo real mediante el comando `lerobot-rollout` con estrategia base.
- Capacidad de generalización limitada a la tarea específica para la que fue entrenado, sin soporte de tool calling, agentes o razonamiento multi-paso (al ser un modelo de control robótico).

## Casos de uso

- Automatización de líneas de clasificación de piezas: el modelo puede manejar la colocación de objetos (bollos y baguettes) en bandejas específicas, reduciendo la intervención manual en entornos de producción controlados.
- Investigación en imitación learning: sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación con sensores adicionales (wowskin) y comparar con variantes del método.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y a la integración con LeRobot, permite validar flujos de entrenamiento y despliegue en pocas horas sin necesidad de infraestructura de alto coste.
- Educación en robótica y aprendizaje por imitación: puede utilizarse en cursos o talleres para demostrar el ciclo completo de recogida de datos, entrenamiento y ejecución en un robot real.
- Evaluación de robustez frente a variaciones de iluminación y posición de objetos: al entrenarse con 501 episodios, puede servir para analizar la sensibilidad del modelo ante cambios en el entorno.
- Base para fine-tuning en tareas similares: dado que los pesos están disponibles y la licencia lo permite, se puede ajustar el modelo con nuevos datos para otras tareas de pick and place en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación del policy en el robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no hay datos de tasa de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 51,7 millones de parámetros, la VRAM necesaria para inferencia es baja; se estima que cabe en GPUs con 4 GB o más, aunque no se dispone de una medición exacta.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente para ejecutar la inferencia en tiempo real.
- Es adecuado para GPUs de consumo (gama media y alta) dado el tamaño reducido del modelo.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, por lo que se ejecuta mediante `lerobot-rollout` en un robot físico. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del hardware y de la frecuencia de control del robot (30 FPS).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para robótica con configuraciones similares). El repositorio de HuggingFace de KHandsome contiene otros modelos (`taskone-raw-act-2nd`, `taskone-raw-act`) que podrían ser variantes sin el sensor wowskin, pero no se han encontrado datos de rendimiento ni especificaciones detalladas para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (pick and place de bollos y baguettes en bandejas de colores específicos) y no generaliza a otras tareas u objetos sin reentrenamiento.
- Requiere el robot SO-100 con la configuración "wowskin" y las cámaras exactas utilizadas durante la recogida de datos; cambios en la disposición de cámaras, iluminación o calibración pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en el robot real, por lo que no se conoce su tasa de éxito ni su robustez en condiciones reales.
- Al ser un modelo de control, no tiene capacidades de razonamiento simbólico ni de lenguaje; no es adecuado para tareas que requieran comprensión semántica.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario asegurarse de cumplir con las condiciones de la licencia y de los datos utilizados para el entrenamiento (dataset `KHandsome/Task-one-combine-2nd`, cuyos términos no se han especificado).
- El modelo no incluye mecanismos de seguridad o verificación de acciones; en aplicaciones de producción con robots físicos, se deben implementar medidas de seguridad adicionales.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/KHandsome/taskone-raw-wowskin-act-2nd)
- [Dataset de entrenamiento](https://huggingface.co/datasets/KHandsome/Task-one-combine-2nd)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
