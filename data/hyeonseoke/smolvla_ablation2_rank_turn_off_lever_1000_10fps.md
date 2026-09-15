# HyeonseokE/smolvla_ablation2_rank_turn_off_lever_1000_10fps

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de LeRobot de HuggingFace, diseñado para ejecutar políticas robóticas con un coste computacional reducido y desplegable en hardware de consumo. Este repositorio concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado para una tarea específica de manipulación robótica: apagar una palanca y verificar que el indicador de estado se pone en rojo.

El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB. Está entrenado sobre un dataset de 100 episodios y 21.644 frames a 10 FPS, utilizando el framework LeRobot. Su relevancia radica en que permite probar políticas de control robótico en entornos de investigación y en robots reales de tipo SO-101, con una carga computacional asumible por GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un modelo compacto de visión-lenguaje-acción que combina observaciones visuales y de estado para generar acciones de control robótico. No se detallan en la información disponible aspectos como el número de capas, dimensiones de atención o mecanismos internos. El modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`, entrenado con el framework LeRobot.

El entrenamiento se realizó sobre el dataset `HyeonseokE/ablation2_rank_turn_off_lever_10fps`, compuesto por 100 episodios y 21.644 frames a 10 FPS, con la tarea "Turn the lever off; the status indicator should turn red". La configuración de entrenamiento incluye 16.900 pasos, batch size de 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y la versión 0.6.0 de LeRobot. El modelo consume observaciones de estado (6 dimensiones) y tres imágenes de 256x256 píxeles, y produce acciones de 6 dimensiones, incluyendo `action.radian_urdf0`. No se documentan innovaciones técnicas adicionales más allá del diseño SmolVLA.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 6 dimensiones a partir de observaciones de estado y cámaras, aptas para el robot SO-101.
- Aprendizaje por imitación: entrenado mediante demostraciones humanas registradas en el dataset, por lo que reproduce comportamientos observados.
- Ejecución de tareas específicas: está especializado en la tarea de apagar una palanca y comprobar que el indicador pasa a rojo.
- Integración con LeRobot: compatible con los flujos de trabajo de entrenamiento, inferencia y despliegue del ecosistema LeRobot.
- No se documentan capacidades de generación de texto libre, tool calling, razonamiento generalista ni soporte multilingüe.

## Casos de uso

- Despliegue de política robótica en un robot SO-101: se puede utilizar el comando `lerobot-rollout` para ejecutar la política en un robot real, alimentando las cámaras y el estado del robot, y estableciendo la tarea como prompt.
- Investigación en aprendizaje por imitación: este checkpoint sirve como referencia para comparar el efecto de distintas configuraciones (ablaciones) sobre una misma tarea, permitiendo estudiar la influencia del ranking o del frame rate.
- Evaluación de robustez en entornos controlados: se puede probar la política variando iluminación, posición de la palanca o distracciones visuales, para medir su capacidad de generalización dentro de la tarea.
- Benchmark de modelos VLA compactos: al tener solo 450 millones de parámetros, es útil para comparar coste computacional y rendimiento frente a modelos más grandes en tareas de manipulación.
- Prototipado rápido en robótica: su tamaño reducido permite iterar en simulación o en hardware de consumo sin necesidad de infraestructura de alto coste.
- Educación y demostraciones: sirve como ejemplo práctico de un modelo VLA entrenado con LeRobot, útil para cursos, talleres o demos de control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El repositorio pesa 0,9 GB, por lo que los pesos en safetensors probablemente ocupan aproximadamente ese tamaño en FP16 o BF16; una GPU con al menos 2 GB de VRAM sería necesaria para cargarlos, aunque no se ha verificado.
- GPU recomendadas: no disponible. Al ser un modelo compacto, es previsible que GPUs de consumo como una RTX 3060 o superiores puedan ejecutarlo, pero no hay datos confirmados.
- Despliegue: compatible con LeRobot, que soporta entrenamiento e inferencia en CUDA; se puede usar con `lerobot-rollout` y `lerobot-train`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. Este checkpoint es un fine-tuning de `lerobot/smolvla_base`, pero no se han publicado datos de parámetros, contexto ni rendimiento del modelo base en la información proporcionada. Tampoco se han encontrado referencias a otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que el rendimiento real en el robot no está documentado.
- El modelo está entrenado exclusivamente para una tarea concreta (apagar una palanca) y con un robot y cámaras específicos; la generalización a otras tareas o entornos es limitada.
- El dataset de entrenamiento es pequeño (100 episodios, 21.644 frames), lo que puede provocar sobreajuste o baja robustez ante variaciones no vistas.
- No se documenta soporte multilingüe ni generación de texto; no es un modelo de lenguaje generalista.
- La licencia Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y la atribución correspondiente.
- Pueden existir sesgos derivados de las demostraciones humanas utilizadas en el dataset, que afectarían al comportamiento de la política.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_ablation2_rank_turn_off_lever_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_rank_turn_off_lever_10fps
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
