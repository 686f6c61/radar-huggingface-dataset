# HyeonseokE/smolvla_turn_on_lever_cap_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_turn_on_lever_cap_2000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de manipulación de una palanca, recogido con un robot SO-101. El modelo ha sido entrenado con la librería LeRobot y está pensado para ejecutar la tarea de girar una palanca hasta que un indicador se ponga verde.

Con 450 millones de parámetros, este modelo demuestra que es posible obtener políticas robóticas funcionales con arquitecturas relativamente ligeras, lo que facilita su despliegue en entornos de investigación y prototipado sin necesidad de infraestructura de alto coste. Su relevancia radica en la tendencia actual de adaptar modelos multimodales preentrenados a tareas de control, reduciendo el coste computacional frente a los VLA masivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este caso, el modelo ha sido fine-tuned desde `lerobot/smolvla_base` mediante aprendizaje por imitación, utilizando el framework LeRobot. El entrenamiento se realizó sobre un dataset de 100 episodios (20.962 frames a 10 FPS) que contiene demostraciones de la tarea de girar una palanca. La configuración de entrenamiento incluye 16.350 pasos, batch size de 64, optimizador AdamW y learning rate de 0,0001. No se han publicado detalles adicionales sobre la arquitectura interna (número de capas, atención, etc.) en la información disponible.

## Capacidades

- Generación de acciones de control para un robot SO-101 (6 grados de libertad) a partir de observaciones visuales y estado.
- Entrada multimodal: tres cámaras (top, left_wrist y una tercera no especificada) con imágenes de 256x256 píxeles, más un vector de estado de 6 dimensiones.
- Salida de acciones de 6 dimensiones, incluyendo posiciones articulares en radianes.
- Especializado en la tarea de girar una palanca hasta que el indicador de estado se ponga verde.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un policy de control directo.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede girar palancas o activar mecanismos similares en entornos controlados, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA en robots de bajo coste.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, puede iterarse rápidamente en hardware de consumo para validar nuevas tareas.
- Evaluación de algoritmos de control en robótica: permite comparar el rendimiento de SmolVLA frente a otros enfoques en una tarea concreta.
- Despliegue en robots educativos o de investigación: el robot SO-101 es asequible, y el modelo puede ejecutarse en GPUs de gama media.
- Generación de datos de demostración: el modelo puede utilizarse para recopilar más episodios de forma autónoma, ampliando el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño de 450M parámetros, es probable que quepa en GPUs con 8 GB o más, pero no hay datos confirmados.
- GPU recomendadas: no especificadas. El paper de SmolVLA menciona despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el diseño compacto del modelo base.
- Opciones de despliegue: LeRobot (librería principal), con soporte para inferencia en tiempo real mediante `lerobot-rollout`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar el paper de SmolVLA para comparaciones con otros VLA.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de girar una palanca; no generaliza a otras tareas sin fine-tuning adicional.
- Depende de la configuración específica de cámaras y robot (SO-101). Cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en el mundo real, por lo que el rendimiento real es desconocido.
- El dataset de entrenamiento es limitado (100 episodios) y probablemente recogido en un entorno fijo, lo que puede introducir sesgos de iluminación, posición de objetos, etc.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es específico de una tarea y puede requerir adaptación para otros escenarios.
- No se especifican idiomas soportados; al ser un modelo de control, la entrada de lenguaje no está documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HyeonseokE/smolvla_turn_on_lever_cap_2000_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_on_lever_cap_10fps
- LeRobot (librería): https://github.com/huggingface/lerobot
