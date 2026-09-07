# khanhnd61/smolvla-prune10_so101-long-clean

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de LeRobot de Hugging Face. Este modelo concreto, `khanhnd61/smolvla-prune10_so101-long-clean`, es un fine-tuning del modelo base `lerobot/smolvla_base` para la tarea robótica de colocar una cinta en un cajón. El modelo tiene 354 millones de parámetros y está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la robótica de bajo coste y la investigación en aprendizaje por imitación.

El modelo se ha entrenado con el dataset `khanhnd61/so101-long-clean`, que contiene 20 episodios y 13.241 fotogramas a 30 FPS. La política genera acciones de 6 dimensiones a partir de observaciones de estado del robot e imágenes de tres cámaras. Al ser una política de control robótico, no es un modelo de lenguaje generativo, sino un sistema de control de bajo nivel para robots manipuladores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parámetros totales | 354.210.336 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura de visión-lenguaje-acción presentada en el paper arXiv:2506.01844. SmolVLA está diseñado para ser compacto y eficiente, manteniendo un rendimiento competitivo con un coste computacional reducido. El modelo ha sido fine-tuneado desde `lerobot/smolvla_base` utilizando el framework LeRobot.

El entrenamiento se realizó sobre el dataset `khanhnd61/so101-long-clean`, compuesto por 20 episodios de la tarea "Put the tape in the drawer", con un total de 13.241 fotogramas a 30 FPS. La configuración de entrenamiento incluye 16.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning de aprendizaje por imitación.

## Capacidades

- Control robótico de bajo nivel: genera acciones continuas de 6 dimensiones (posición/orientación) a partir de observaciones del estado del robot e imágenes de cámaras.
- Entrada multimodal: procesa el estado del robot (6 valores) e imágenes de tres cámaras (256x256 píxeles cada una).
- Aprendizaje por imitación: la política ha sido entrenada mediante demostraciones humanas para una tarea específica.
- Ejecución en hardware de consumo: gracias a su tamaño reducido, puede desplegarse en equipos de gama media.
- Integración con LeRobot: compatible con el framework LeRobot para entrenamiento, evaluación y despliegue.
- No se han documentado capacidades de generación de texto, tool calling, razonamiento simbólico ni capacidades de agente; es un modelo de política robótica.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un robot SO-101 para ejecutar la tarea de colocar una cinta en un cajón, sirviendo como punto de partida para experimentos de aprendizaje por imitación.
- Automatización de tareas de ensamblaje: adaptando el fine-tuning con nuevos datasets, podría utilizarse para tareas como insertar piezas o colocar componentes en posiciones fijas.
- Robótica doméstica: tareas sencillas de recogida y colocación de objetos en entornos controlados, gracias a su bajo coste computacional.
- Investigación en políticas VLA compactas: sirve como referencia para comparar el rendimiento de modelos de visión-lenguaje-acción con menos de 500 millones de parámetros.
- Prototipado rápido en robótica: permite iterar sobre políticas de control sin necesidad de infraestructura de GPU de alto coste.
- Benchmarking de modelos de imitación: puede utilizarse para evaluar métricas de éxito en tareas manipulativas frente a otras políticas entrenadas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,7 GB, lo que puede servir como referencia del tamaño de los pesos, pero no hay datos oficiales de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No hay datos oficiales al respecto.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con el framework de inferencia de LeRobot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables en la documentación proporcionada. Existen variantes del mismo autor, como `khanhnd61/smolvla_so101-long-clean` y `khanhnd61/smolvla_so101_tape_prune10`, así como el modelo base `lerobot/smolvla_base`, pero no se han publicado especificaciones ni benchmarks que permitan una comparativa rigurosa. La comparativa con otros modelos VLA de tamaño similar queda pendiente de datos disponibles.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política en la tarea.
- Es un modelo fine-tuneado para una tarea muy específica ("Put the tape in the drawer") y un robot concreto (SO-101). Generalizar a otras tareas o robots requeriría un nuevo fine-tuning.
- El dataset de entrenamiento es pequeño (20 episodios, 13.241 fotogramas), lo que puede limitar la robustez frente a variaciones en la iluminación, posición de los objetos o distracciones.
- Solo acepta entradas de estado (6 dimensiones) e imágenes de tres cámaras a 256x256. No es un modelo de lenguaje ni de visión general.
- Al ser un modelo de control robótico, los errores de predicción se traducen en acciones físicas potencialmente inseguras; se recomienda validar el comportamiento en entornos simulados antes del despliegue real.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones de los datos de entrenamiento no están especificadas.
- Depende de la versión de LeRobot (0.6.1) y de la configuración de hardware del robot (cámaras, puertos) para su ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/khanhnd61/smolvla-prune10_so101-long-clean
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-long-clean
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Variante relacionada: https://huggingface.co/khanhnd61/smolvla_so101-long-clean
- Variante relacionada: https://huggingface.co/khanhnd61/smolvla_so101_tape_prune10
