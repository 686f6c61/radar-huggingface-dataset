# LohanTS/act_v11

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `LohanTS/act_v11`, contiene una política ACT entrenada con LeRobot sobre el dataset `LohanTS/mon-dataset-robot-v6` y publicada en Hugging Face con licencia Apache 2.0. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para control de robots manipuladores.

La relevancia de ACT radica en su enfoque de *action chunking*: en lugar de predecir una única acción por paso de control, genera secuencias cortas de acciones, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Está pensado para entrenarse con datos de teleoperación y desplegarse en robots como el SO-100 mediante el ecosistema LeRobot.

No se dispone de información sobre idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada. Se trata de un modelo de robótica, no de un modelo de lenguaje, por lo que las capacidades lingüísticas no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. Su innovación principal es la predicción de *action chunks*: el modelo genera secuencias de acciones de longitud fija en cada inferencia, lo que mitiga el problema de acumulación de errores típico de las políticas que predicen un solo paso. Según la model card, ACT aprende de datos de teleoperación y suele alcanzar tasas de éxito elevadas.

El entrenamiento se realizó con LeRobot sobre el dataset `LohanTS/mon-dataset-robot-v6`. No se dispone de información sobre el número de episodios, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). Tampoco se detalla la configuración exacta del entrenamiento (épocas, batch size, aumentos de datos).

## Capacidades

- Predicción de acciones robóticas mediante *action chunking* a partir de observaciones visuales y de estado del robot.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Control de robots manipuladores, con integración nativa en el ecosistema LeRobot (por ejemplo, `so100_follower`).
- Entrenamiento y evaluación reproducibles mediante los comandos `lerobot-train` y `lerobot-record`.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No se documentan capacidades de visión más allá de las observaciones necesarias para la política (no disponible el detalle de los sensores de entrada).

## Casos de uso

- Manipulación robótica de precisión: la política puede ejecutar tareas de pick-and-place entrenadas con teleoperación, aprovechando el *action chunking* para reducir la acumulación de errores en secuencias largas.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT sobre el mismo dataset y robot.
- Despliegue en robots de bajo coste tipo SO-100: el tamaño reducido del modelo (51,7 M de parámetros, 0,2 GB) permite ejecutarlo en hardware modesto acoplado al robot.
- Prototipado rápido de políticas con LeRobot: el flujo `lerobot-train` / `lerobot-record` permite entrenar y evaluar en pocos pasos sobre un dataset propio.
- Automatización de tareas repetitivas en laboratorio: tareas de ensamblaje o clasificación que requieran movimientos consistentes aprendidos de demostraciones.
- Evaluación de robustez de políticas: útil para estudiar la generalización de ACT ante variaciones de posición de objetos, siempre que el dataset de entrenamiento lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el modelo ocupa aproximadamente 0,2 GB en precisión de entrenamiento, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la información proporcionada; el comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que indica soporte para GPU NVIDIA.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de pesos); no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas ACT u otras políticas de imitación) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- Sesgos conocidos: no documentados; al entrenarse con un dataset concreto de teleoperación, la política hereda los sesgos y la distribución de ese dataset.
- Riesgo de sobreajuste al entorno de entrenamiento: la generalización a nuevas posiciones, objetos o condiciones de iluminación no está garantizada ni documentada.
- Sin datos de benchmarks ni de tasa de éxito publicados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se documentan condiciones adicionales del dataset de entrenamiento.
- Para producción: verificar el rendimiento en el robot objetivo y con el dataset `LohanTS/mon-dataset-robot-v6` antes de desplegar; no se dispone de información sobre robustez ni seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LohanTS/act_v11
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/LohanTS/mon-dataset-robot-v6
