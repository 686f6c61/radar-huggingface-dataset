# seriintan/evo1_frazier_stage1

## Resumen

El modelo `seriintan/evo1_frazier_stage1` es una política robótica Vision-Language-Action (VLA) desarrollada por el autor `seriintan` y entrenada con el framework LeRobot de Hugging Face. Pertenece a la familia de modelos Evo-1, un proyecto del grupo MINT-SJTU que propone un modelo VLA ligero con alineación semántica preservada, presentado en CVPR 2026. Este checkpoint concreto ha sido entrenado para ejecutar la tarea "Pick and place Frazier to blue basket" sobre un robot `so_follower` equipado con dos cámaras (frontal y pinza).

Arquitectónicamente, el modelo combina un backbone InternVL3, que procesa las imágenes de las cámaras y la instrucción de lenguaje, con una cabeza de acción basada en flow-matching continuo que predice los próximos pasos de acción del robot. El modelo tiene 776.139.440 parámetros (aproximadamente 776 millones), lo que lo convierte en una opción ligera para control robótico en tiempo real. No se especifica una longitud de contexto textual, ya que se trata de una política de control y no de un modelo de lenguaje conversacional.

La relevancia de este modelo radica en su tamaño reducido y su integración nativa con LeRobot, lo que facilita su uso en entornos de investigación y prototipado robótico. Sin embargo, no se han publicado resultados de evaluación para este checkpoint, por lo que su rendimiento real debe validarse en el hardware de destino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | InternVL3 backbone + cabeza de acción flow-matching continuo |
| Parámetros totales | 776.139.440 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Evo-1 se compone de un backbone multimodal InternVL3 que codifica las observaciones visuales (dos imágenes RGB de 480x640) y la instrucción en lenguaje natural. A partir de estas representaciones, una cabeza de acción con flow-matching continuo genera predicciones de acciones de seis dimensiones, que corresponden a los grados de libertad del robot `so_follower`. El modelo se entrena mediante aprendizaje por imitación, minimizando la diferencia entre las acciones predichas y las acciones demostradas en el dataset.

El entrenamiento de este checkpoint se realizó con LeRobot versión 0.6.2, utilizando el dataset `seriintan/frazier_dataset_20260901_151518`, que contiene 100 episodios y 52.442 fotogramas a 30 FPS. La configuración de entrenamiento incluye 5.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de RLHF o DPO; el modelo parece entrenado exclusivamente con comportamiento supervisado. El proyecto Evo-1 es compatible con frameworks de fine-tuning como RLinf, que soporta SFT y GRPO en el simulador LIBERO, pero no hay evidencia de que este checkpoint específico haya sido sometido a dichos procesos.

## Capacidades

- Control robótico de 6 grados de libertad a partir de observaciones de dos cámaras RGB (frontal y pinza) y del estado del robot.
- Ejecución de tareas de manipulación como "pick and place" siguiendo instrucciones en lenguaje natural.
- Predicción de acciones continuas mediante flow-matching, lo que permite generar trayectorias suaves y multimodales.
- Integración nativa con el framework LeRobot para entrenamiento, despliegue y evaluación de políticas robóticas.
- Soporte para despliegue en robots `so_follower` mediante el comando `lerobot-rollout`.
- No aplica el soporte de tool calling ni razonamiento multi-paso en el sentido de agentes de lenguaje; su función es puramente de control motor.
- Capacidades multilingües no especificadas; la tarea de entrenamiento está formulada en inglés.

## Casos de uso

- Automatización de tareas de pick and place en laboratorios: el modelo puede ejecutar la tarea "Pick and place Frazier to blue basket" en un robot `so_follower`, lo que resulta útil para validar pipelines de datos y políticas en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como baseline ligera para comparar con otras políticas VLA en el mismo hardware, gracias a su tamaño de 776 millones de parámetros.
- Prototipado rápido de control robótico: gracias a su integración con LeRobot, un investigador puede entrenar y desplegar el modelo en horas, usando los comandos `lerobot-train` y `lerobot-rollout`.
- Educación en robótica: el modelo puede ejecutarse en GPUs de consumo, lo que permite a estudiantes y docentes experimentar con políticas VLA sin necesidad de clústeres de alto rendimiento.
- Validación de datasets robóticos: al entrenar con un dataset concreto (100 episodios), el modelo actúa como referencia para comprobar si un dataset de demostraciones es suficiente para aprender una tarea.
- Integración en simuladores robóticos: el proyecto Evo-1 es compatible con entornos como LIBERO y RoboTwin, lo que permite evaluar el modelo en simulación antes de desplegarlo en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: teniendo en cuenta los 776 millones de parámetros, los pesos en FP16 ocupan aproximadamente 1,55 GB. Con las activaciones de las imágenes de 480x640 y el procesamiento de flow-matching, se estima un consumo total de entre 4 y 8 GB de VRAM. Esta es una estimación basada en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para ejecutar el modelo en modo de inferencia. En entornos de investigación con mayores exigencias, se recomiendan A100 o H100.
- El modelo cabe en GPUs de consumo, siempre que dispongan de al menos 8 GB de VRAM.
- Opciones de despliegue: LeRobot (PyTorch) mediante `lerobot-rollout`; también es compatible con el framework RLinf para fine-tuning en simuladores, según la documentación de Evo-1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos VLA en la información proporcionada. El modelo pertenece a la familia Evo-1, que se describe como ligera en comparación con otras políticas VLA como OpenVLA o RT-2, pero no se ofrecen datos de rendimiento de este checkpoint concreto.

## Limitaciones y advertencias

- El modelo no ha sido evaluado formalmente; no hay resultados de éxito en el robot real. No se recomienda su uso en producción sin una validación exhaustiva.
- El dataset de entrenamiento es pequeño (100 episodios) y está limitado a una única tarea, lo que puede provocar una generalización deficiente ante variaciones de iluminación, posición del objeto o fondo.
- La tarea está formulada en inglés; no se especifica el soporte para otras lenguas.
- El modelo puede generar acciones incorrectas si las observaciones difieren significativamente de la distribución de entrenamiento (riesgo de alucinación de acciones).
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de licencia y atribución. No hay restricciones adicionales conocidas.
- El modelo está diseñado específicamente para el robot `so_follower` y las cámaras `front` y `gripper`; su uso en otros robots requeriría reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/seriintan/evo1_frazier_stage1
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Repositorio GitHub de Evo-1: https://github.com/MINT-SJTU/Evo-1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Evo-1 en LeRobot: https://huggingface.co/docs/lerobot/main/en/evo1
