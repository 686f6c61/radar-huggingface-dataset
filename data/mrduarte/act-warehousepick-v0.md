# MrDuarte/act-WarehousePick-v0

## Resumen

El modelo `MrDuarte/act-WarehousePick-v0` es una política robótica de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por MrDuarte y publicada en Hugging Face bajo licencia Apache-2.0. Está entrenada con el framework LeRobot y el dataset `MrDuarte/WarehousePick-v0`, que contiene 40 episodios teleoperados de un brazo robótico SO-101 realizando la tarea "Lift all parcels and put them in the Green Box". El modelo predice acciones de 6 dimensiones a partir del estado del robot y de imágenes de tres cámaras.

Con 51.668.614 parámetros, es un modelo compacto de 0,2 GB, diseñado para ejecutarse en entornos de robótica reales. No es un modelo de lenguaje, por lo que no aplica longitud de contexto ni soporte de idiomas. Su relevancia radica en que ofrece una solución práctica y reproducible para automatizar tareas de picking en almacenes mediante demostraciones teleoperadas, con un pipeline de entrenamiento e inferencia bien documentado en LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Esta técnica reduce el error de acumulación en la ejecución de tareas robóticas y mejora la consistencia de los movimientos. La política se entrena con datos teleoperados y se compone de un codificador de imágenes (cámaras `innomaker`, `intel_rgb` y `front`) y un decodificador que genera acciones de 6 dimensiones.

El entrenamiento se realizó con la configuración siguiente: 100.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-5, seed 1000 y LeRobot versión 0.6.1. El dataset de entrenamiento, `MrDuarte/WarehousePick-v0`, contiene 40 episodios y 29.707 frames a 30 FPS. No se reporta uso de RLHF, DPO ni otras técnicas de ajuste posterior; el modelo se basa exclusivamente en imitación supervisada.

## Capacidades

- Genera acciones robóticas de 6 dimensiones (posiciones o esfuerzos del brazo) a partir de observaciones del estado del robot y de tres cámaras.
- Predice chunks de acciones, lo que permite movimientos más suaves y robustos frente a perturbaciones.
- Aprende por imitación de demostraciones teleoperadas, sin necesidad de diseñar reglas manuales.
- Soporta la tarea específica de levantar paquetes y colocarlos en una caja verde, según el dataset de entrenamiento.
- Es compatible con el ecosistema LeRobot, incluyendo scripts de entrenamiento e inferencia.
- No soporta tool calling, razonamiento de lenguaje ni capacidades multimodales de texto o visión fuera de la entrada de imágenes robóticas.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede ejecutar la tarea de levantar paquetes y depositarlos en una caja, integrado en un brazo robótico SO-101 con cámaras de visión. Es adecuado porque ha sido entrenado específicamente con demostraciones de esa tarea.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar el rendimiento de políticas ACT frente a otros métodos de imitación en entornos de manipulación.
- Prototipado rápido de robots manipuladores: gracias a la integración con LeRobot, permite desplegar una política entrenada en pocos minutos sobre hardware compatible.
- Entrenamiento de políticas personalizadas: el modelo puede servir como punto de partida para fine-tuning en tareas similares de picking con pocos episodios adicionales.
- Demostraciones técnicas y formación: es un ejemplo práctico y reproducible de cómo entrenar y ejecutar una política robótica con LeRobot, útil para cursos o talleres.
- Evaluación de pipelines de visión robótica: permite probar la influencia de diferentes configuraciones de cámaras (resolución, posición) en el éxito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la documentación del modelo.
- Dado el tamaño de 51,7 millones de parámetros, el modelo es pequeño y probablemente pueda ejecutarse en GPUs de consumo, pero no hay datos oficiales que confirmen la VRAM necesaria.
- El entrenamiento y la inferencia se realizan mediante LeRobot, que requiere una GPU compatible con CUDA y PyTorch.
- Las opciones de despliegue documentadas incluyen el uso de `lerobot-rollout` para ejecutar la política en un robot real y `lerobot-train` para entrenar nuevas políticas.
- No se han publicado cifras de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables con datos suficientes para establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en el mundo real; la model card indica explícitamente que no se han proporcionado resultados de evaluación.
- El dataset de entrenamiento es pequeño (40 episodios), lo que puede limitar la generalización a nuevas posiciones de objetos, condiciones de iluminación o variaciones en el entorno.
- La política depende de las cámaras y del tipo de robot con los que fue entrenada (`so101_follower`); usar otro hardware o cambiar la configuración de las cámaras puede degradar el rendimiento.
- Al ser un modelo de imitación, no ofrece garantías de seguridad ni comportamientos ante situaciones fuera de la distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero requiere conservar el aviso de licencia y atribución.
- No aplican riesgos de alucinación típicos de modelos de lenguaje, pero sí existe riesgo de fallos en la ejecución de acciones robóticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrDuarte/act-WarehousePick-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
