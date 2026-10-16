# introvoyz045/Xiaomi-Robotics-1-RoboCasa365

## Resumen

Xiaomi-Robotics-1-RoboCasa365 es un checkpoint de Hugging Face del modelo fundacional de robótica Xiaomi-Robotics-1, desarrollado por Xiaomi Robotics. Se trata de un modelo de visión-lenguaje-acción (VLA) basado en Qwen3-VL, con 5.053.149.696 parámetros (~5,05 mil millones), diseñado para manipulación móvil en entornos no vistos y adaptación eficiente a nuevas tareas. Este checkpoint concreto está orientado a la evaluación en el benchmark RoboCasa365.

El modelo se entrenó con más de 100.000 horas de trayectorias de manipulación del mundo real, según la documentación oficial. El repositorio incluye los pesos, código personalizado de Transformers para el modelo y el procesador, ficheros de tokenizer y estadísticas de normalización de acciones específicas de RoboCasa365. La licencia es Apache 2.0.

Su relevancia radica en ser un modelo fundacional de robótica de código abierto con resultados publicados en RoboCasa365: una tasa de éxito del 57,28% en 2.500 episodios. Esto lo convierte en una referencia para investigación en VLA y para el desarrollo de aplicaciones de manipulación robótica. La longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Qwen3-VL (transformer multimodal) |
| Parámetros totales | 5.053.149.696 (~5,05 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el ejemplo de referencia usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado de Transformers) |

## Arquitectura y entrenamiento

Xiaomi-Robotics-1 es un modelo de visión-lenguaje-acción (VLA) construido sobre una base multimodal Qwen3-VL. La arquitectura combina percepción visual, comprensión del lenguaje y generación de acciones motoras para control robótico. El modelo está diseñado para manipulación móvil en entornos no vistos y para adaptarse de forma eficiente a nuevas tareas mediante ajuste fino. El checkpoint aquí descrito incluye estadísticas de normalización de acciones específicas de RoboCasa365, lo que permite reproducir la evaluación oficial.

El entrenamiento se realizó con más de 100.000 horas de trayectorias de manipulación del mundo real, aunque no se especifican el número exacto de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La implementación personalizada en Transformers requiere `trust_remote_code=True` y soporte para FlashAttention 2. Para la evaluación multi-GPU se utiliza un lanzador de ocho servidores, y el cliente-servidor separa la inferencia del simulador RoboCasa365. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas para manipulación móvil.
- Percepción visual y comprensión del lenguaje para control robótico.
- Ejecución de tareas de manipulación en entornos no vistos (out-of-the-box).
- Adaptación eficiente a nuevas tareas mediante ajuste fino.
- Procesamiento de historial de observaciones (4 observaciones con intervalo 2).
- Predicción de 16 acciones por consulta.
- Evaluación en el benchmark RoboCasa365 (conjunto target50, split pretrain).
- No se especifican capacidades de tool calling, agentes o multilingüismo.

## Casos de uso

- Investigación en modelos fundacionales de robótica: sirve como base para experimentos de VLA, permitiendo comparar arquitecturas y estrategias de entrenamiento con un modelo de 5.053 millones de parámetros y licencia Apache 2.0.
- Evaluación de manipulación móvil en simulación: se puede ejecutar el benchmark RoboCasa365 con la configuración de referencia (50 tareas, 50 episodios por tarea, semilla 7) para medir la tasa de éxito en tareas de manipulación.
- Desarrollo de robots domésticos: adaptar el modelo para tareas de manipulación en hogares, aprovechando su capacidad de operar en entornos no vistos y su ajuste eficiente a nuevas tareas.
- Automatización en almacenes: emplear el modelo para manipulación de objetos y navegación móvil en entornos logísticos, con la ventaja de predecir 16 acciones por consulta y procesar historial de observaciones.
- Prototipado rápido de nuevas tareas robóticas: gracias a la adaptación eficiente, se puede ajustar con pocos datos para tareas específicas como recoger, colocar o apilar objetos.
- Benchmarking de infraestructura de robótica: usar el esquema cliente-servidor para evaluar latencia y throughput en despliegues multi-GPU, comparando configuraciones de hardware.
- Educación y formación: utilizar un modelo VLA open source para enseñar conceptos de visión-lenguaje-acción, normalización de acciones y evaluación en simuladores.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| RoboCasa365 (target50, split pretrain) | Episodios | 2500 |
| RoboCasa365 (target50, split pretrain) | Éxitos | 1432 |
| RoboCasa365 (target50, split pretrain) | Tasa de éxito | 57,28% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,1 GB solo para los pesos en bfloat16; con overheads de inferencia, se recomiendan 12-16 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090 (24 GB o más).
- Cabe en consumer GPU: sí, en RTX 4090 o RTX 3090 (24 GB) en bfloat16; en GPUs de 16 GB podría requerir cuantización, aunque no se especifican tipos de cuantización.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y FlashAttention 2; el repositorio oficial usa un lanzador de ocho servidores para evaluación multi-GPU. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- No se especifican los idiomas soportados.
- La longitud de contexto no está disponible.
- Los tipos de cuantización no están documentados; solo se menciona bfloat16 en el ejemplo de referencia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio, con el consiguiente riesgo de seguridad.
- El modelo está orientado a evaluación en RoboCasa365; su rendimiento en entornos reales puede diferir.
- Entrenado con datos de manipulación del mundo real; pueden existir sesgos en tareas, objetos y entornos no representados.
- Riesgo de alucinación en la predicción de acciones, especialmente en escenarios fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el código personalizado podría tener restricciones adicionales no especificadas.
- No se han publicado benchmarks más allá de RoboCasa365.
- El repositorio `introvoyz045/Xiaomi-Robotics-1-RoboCasa365` tiene 0 descargas y 0 likes; el repositorio oficial es `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365`.

## Enlaces

- https://huggingface.co/introvoyz045/Xiaomi-Robotics-1-RoboCasa365
- https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365
- https://github.com/XiaomiRobotics/Xiaomi-Robotics-1
- https://github.com/XiaomiRobotics/Xiaomi-Robotics-1/tree/main/eval_robocasa365
- https://robotics.xiaomi.com/xiaomi-robotics-1.html
