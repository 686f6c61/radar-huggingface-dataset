# nguigz/balle3_trained

## Resumen

`nguigz/balle3_trained` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para una tarea robótica concreta: introducir una pelota en un recipiente ("mettre la balle dans le bac"). No es un modelo de lenguaje: es un modelo de control robótico que mapea observaciones (estado articular de 6 dimensiones e imagen frontal de 240x320 píxeles) a acciones de 6 dimensiones, pensado para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo tiene 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB. Se entrenó sobre un dataset propio de 15 episodios y 5.794 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento y batch size 8. Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, no como modelo generalista.

La licencia es Apache 2.0 y la librería de referencia es `lerobot` 0.6.2. Al estar especializado en una única tarea y un único robot, su valor práctico fuera de ese contexto es muy limitado; debe evaluarse como una política de referencia y no como un componente reutilizable sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `front` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 240, 320)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `nguigz/balle3` (15 episodios, 5.794 fotogramas, 30 FPS) |
| Tarea | "mettre la balle dans le bac" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |
| Descargas | 30 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un codificador visual (procesa la imagen frontal de 240x320) con un transformer que integra el estado articular de 6 dimensiones y genera una secuencia de acciones de 6 dimensiones. El modelo se entrenó con 100.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, sobre 15 episodios teleoperados (5.794 fotogramas a 30 FPS) de la tarea "mettre la balle dans le bac".

No se dispone de información sobre la composición del dataset más allá del número de episodios y fotogramas, ni sobre si se aplicaron técnicas de aumento de datos, regularización o ajuste fino adicional. El entrenamiento se realizó con LeRobot 0.6.2 y el checkpoint se publicó en formato safetensors. No se documentan innovaciones técnicas adicionales más allá del propio esquema de action chunking de ACT.

## Capacidades

- Control robótico por imitación para una tarea única: introducir una pelota en un recipiente.
- Predicción de fragmentos de acción (action chunks) a partir de observaciones visuales y de estado articular.
- Entrada multimodal: imagen RGB frontal (3x240x320) y vector de estado de 6 dimensiones.
- Salida de acciones continuas de 6 dimensiones para un robot `so_follower`.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea de recogida de pelota: ejecutar la política sobre un robot `so_follower` con cámara frontal para depositar una pelota en un recipiente, usando `lerobot-rollout` con `--policy.path=nguigz/balle3_trained`.
- Referencia para pipelines de imitación con LeRobot: servir como ejemplo funcional de entrenamiento ACT con 15 episodios y 100.000 pasos, útil para validar la configuración de hardware y software antes de entrenar políticas propias.
- Prototipado de manipulación pick-and-place: adaptar el esquema de observación (estado de 6 dimensiones más imagen frontal) a tareas similares de recogida y depósito en entornos controlados.
- Docencia y demostraciones: ilustrar el flujo completo de teleoperación, grabación de dataset, entrenamiento y despliegue en robótica de bajo coste con SO-100/SO-101.
- Pruebas de integración de LeRobot: verificar la compatibilidad de versiones (0.6.2), formatos de checkpoint y comandos CLI en un entorno real.
- Base para fine-tuning en tareas análogas: reentrenar el modelo con un dataset propio de recogida y depósito para un robot del mismo tipo, partiendo de la configuración documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito documentada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y pesos safetensors, el modelo ocupa del orden de 0,2 GB en memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente. Para entrenamiento se recomienda una GPU NVIDIA con soporte CUDA (el comando de entrenamiento usa `--policy.device=cuda`).
- Cabe en GPU consumer: sí, por el reducido tamaño del modelo (51,7 M de parámetros).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/balle3_trained` | ACT (LeRobot) | 51,7 M | Imagen 3x240x320 + estado (6,) | Apache 2.0 | HuggingFace, 30 descargas |
| Políticas ACT de LeRobot (genéricas) | ACT | ~50 M (típico) | Configurable según robot | Apache 2.0 | HuggingFace / LeRobot |
| Políticas Diffusion Policy (LeRobot) | Diffusion Policy | no disponible | Configurable según robot | Apache 2.0 | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("mettre la balle dans le bac") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad.
- Dataset muy reducido: 15 episodios y 5.794 fotogramas, lo que limita la robustez frente a variaciones de posición, iluminación o distractores.
- Dependencia de hardware concreto: requiere cámara frontal con la nomenclatura `observation.images.front` y un robot `so_follower` calibrado.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje y no debe evaluarse como tal.
- Riesgo de sobreajuste al entorno de grabación: cambios en la disposición de objetos o en la iluminación pueden degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero el comportamiento hereda los sesgos de la teleoperación humana registrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nguigz/balle3_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/balle3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/balle3
