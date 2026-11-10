# lsdyna/smolvla_orange_all

## Resumen

SmolVLA Orange All es un modelo visión-lenguaje-acción (VLA) compacto desarrollado por el usuario lsdyna mediante ajuste fino del modelo base lerobot/smolvla_base. Está diseñado para control robótico de manipulación: recibe observaciones del estado del robot y tres cámaras, y genera directamente acciones de 6 dimensiones para un brazo seguidor de tipo `so_follower`. El modelo resuelve una tarea concreta de manipulación (recoger una naranja y depositarla en otro punto de la mesa) y forma parte del ecosistema LeRobot de Hugging Face.

La relevancia de este modelo radica en su tamaño reducido (450 millones de parámetros) y su orientación a hardware de consumo, en línea con la propuesta de SmolVLA de lograr rendimiento competitivo en tareas robóticas con costes computacionales bajos. Es un ejemplo de ajuste fino de política de imitación sobre un dataset propio de 120 episodios y 34.278 fotogramas grabados a 30 FPS.

Se trata de un modelo de investigación con cero descargas y cero valoraciones en el momento de la consulta, publicado bajo licencia Apache 2.0. No dispone de resultados de evaluación en su model card, por lo que su rendimiento real en robot no está documentado públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las tareas del dataset incluyen instrucciones en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, una política VLA compacta que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La entrada está compuesta por el estado del robot (`observation.state`, vector de 6 dimensiones) y tres flujos visuales de 256x256 píxeles (`observation.images.camera1`, `camera2`, `camera3`); la salida es un vector de acción de 6 dimensiones. El modelo está asociado al artículo arXiv 2506.01844 (SmolVLA).

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `lsdyna/orange_all`, compuesto por 120 episodios y 34.278 fotogramas a 30 FPS. La configuración reportada incluye 7.500 pasos de entrenamiento, batch size de 32, optimizador AdamW, learning rate de 1e-4, semilla 1000 y LeRobot versión 0.7.1. Las tareas del dataset son instrucciones de recogida y recolocación de una naranja, expresadas en inglés y en chino. No se especifican en la información disponible detalles sobre composición adicional del dataset, uso de RLHF/DPO ni innovaciones técnicas internas más allá de las propias de SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres cámaras simultáneas (`hand`, `orbbec` y una tercera según la configuración de entrada) a 256x256.
- Condicionamiento por instrucción en lenguaje natural: la política acepta una descripción de tarea (por ejemplo, "Pick up the orange and put it on the other side of the table.").
- Ejecución de políticas de imitación entrenadas con LeRobot, desplegables mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto general ni otras modalidades (audio) en la información disponible.
- Capacidad multilingüe limitada al condicionamiento por instrucciones: el dataset incluye tareas en inglés y chino, pero no se especifica cobertura lingüística formal.

## Casos de uso

- Recogida y recolocación de objetos en línea de montaje: el modelo ejecuta la tarea de coger una naranja y moverla a otro punto de la mesa, adecuado para demostrar flujos pick-and-place con un brazo `so_follower`.
- Prototipado rápido de políticas de imitación: sirve como punto de partida para ajustar `lerobot/smolvla_base` con datasets propios de pocos centenares de episodios, como evidencia este ajuste con 120 episodios.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de VLA compactos en hardware de consumo, comparando configuraciones de entrenamiento (pasos, batch, learning rate).
- Docencia y formación en robótica: el modelo y su dataset asociado permiten ilustrar el ciclo completo de grabación, entrenamiento y despliegue con LeRobot.
- Validación de pipelines de datos robóticos: el dataset `lsdyna/orange_all` puede visualizarse y usarse para probar herramientas de LeRobot (visualización, entrenamiento, rollout).
- Benchmark interno de manipulación: aunque no hay evaluación publicada, puede emplearse como referencia base para comparar políticas entrenadas con distintos datasets o hiperparámetros en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, el peso en precisión completa ronda los 1,8 GB (estimación a partir del número de parámetros, no confirmada en la información).
- GPU recomendadas: no especificadas; SmolVLA se presenta como desplegable en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: plausible según la propuesta de SmolVLA, aunque sin confirmación específica para este ajuste.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lsdyna/smolvla_orange_all | 450.046.176 | no disponible | Manipulación pick-and-place (naranja) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Política VLA base, ajustable | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas VLA compactas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset muy específico (120 episodios de una única tarea), la política probablemente generaliza mal fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones incorrectas o inseguras ante objetos, posiciones o iluminación distintos a los del entrenamiento.
- Limitaciones de contexto e idioma: el condicionamiento lingüístico se limita a las instrucciones de la tarea del dataset (inglés y chino); no se documenta cobertura multilingüe general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluación de seguridad para entornos reales.
- Caveats para producción: no hay resultados de evaluación publicados, cero descargas y cero valoraciones; requiere calibración específica del robot y de las cámaras, y los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- El modelo está atado a un tipo de robot concreto (`so_follower`) y a una configuración de tres cámaras; su uso en otro hardware no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsdyna/smolvla_orange_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lsdyna/orange_all
- Artículo SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lsdyna/orange_all
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
