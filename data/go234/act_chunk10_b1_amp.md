# go234/act_chunk10_b1_amp

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice bloques cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `go234/act_chunk10_b1_amp`, es una política entrenada con LeRobot sobre un robot `so_follower` para la tarea "Pick up the cube and put it in the box", con dos cámaras de entrada a 480x640 y un vector de estado y acción de 6 dimensiones.

El modelo tiene 51.576.454 parámetros (unos 51,6 M) y se distribuye en formato safetensors con licencia Apache 2.0. No es un modelo de lenguaje: es una política visuomotora específica para un robot y una tarea, por lo que su relevancia es acotada al ámbito de la robótica de imitación y a la reproducibilidad de experimentos con LeRobot.

El entrenamiento se realizó sobre un dataset propio de 50 episodios y 24.423 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento, batch size 1 y learning rate 1e-05. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.576.454 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación definida por el chunk de acciones y las cámaras) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `cam1`, `cam2` (3, 480, 640) |
| Estado de observación | `observation.state`, shape (6,) |
| Acción de salida | `action`, shape (6,) |
| Tarea | "Pick up the cube and put it in the box." |
| Dataset de entrenamiento | go234/cube-box_20261013_041703 (50 episodios, 24.423 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 1 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esto mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso y produce trayectorias más suaves. La arquitectura combina un codificador de imágenes (para las dos cámaras `cam1` y `cam2` a 480x640) con un codificador del estado del robot (vector de 6 dimensiones) y un decodificador que emite el chunk de acciones (vector de 6 dimensiones por paso). El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `go234/cube-box_20261013_041703`, compuesto por 50 episodios de teleoperación y 24.423 fotogramas a 30 FPS, con 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la información disponible si hubo aumento de datos, regularización adicional ni composición detallada del dataset más allá de la tarea única. El sufijo `chunk10` del nombre sugiere un chunk de 10 acciones, y `b1` un batch size de 1, aunque estos detalles no se confirman explícitamente en la model card.

## Capacidades

- Control visuomotor de un robot `so_follower` para una tarea concreta de manipulación ("Pick up the cube and put it in the box").
- Predicción de chunks de acciones (no pasos individuales), lo que reduce el error acumulado.
- Fusión de dos flujos visuales (`cam1` y `cam2`) con el estado propioceptivo del robot (6 dimensiones).
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere definición manual de recompensas.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Recogida y colocación de objetos en entorno controlado: la política ejecuta la tarea "Pick up the cube and put it in the box" sobre un `so_follower` con dos cámaras; es adecuada porque fue entrenada específicamente para esa secuencia y ese robot.
- Reproducción de experimentos de imitación con LeRobot: sirve como referencia para validar el pipeline `lerobot-train` y `lerobot-rollout` con la configuración documentada (100.000 pasos, batch 1, lr 1e-05).
- Prototipado de manipulación en laboratorio: permite evaluar la estabilidad de ACT con dos cámaras y estado de 6 dimensiones antes de escalar a tareas más complejas.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y estar en formato safetensors, puede reentrenarse con `lerobot-train --policy.type=act` sobre un dataset propio del mismo tipo de robot.
- Docencia y formación en robótica de imitación: ilustra el flujo completo de teleoperación, grabación de dataset, entrenamiento y despliegue en un robot de bajo coste.
- Benchmark interno de infraestructura de inferencia robótica: al ser un modelo pequeño (51,6 M parámetros, repo de 0,2 GB), permite medir latencia y throughput de `lerobot-rollout` en hardware modesto antes de pasar a políticas mayores.
- Validación de calibración de cámaras y robot: la política exige que los nombres de cámara (`cam1`, `cam2`) y sus índices coincidan con los del entrenamiento, por lo que sirve para comprobar la corrección del montaje físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,6 M parámetros, repo de 0,2 GB) es presumible que quepa en GPUs de consumo, pero no se confirma con datos.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del checkpoint (0,2 GB) sugiere que sí, pero no se aporta medición.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. La model card solo indica que la ejecución se realiza a 30 FPS en la captura de datos, sin datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| go234/act_chunk10_b1_amp | 51.576.454 | 2 cámaras 480x640 + estado (6,) | Pick up the cube and put it in the box (so_follower) | Apache 2.0 | Hugging Face |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | no disponible | Manipulación con chunks de acciones | no disponible en la información | Paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, VQ-BeT) | no disponible en la información | no disponible | Manipulación por imitación | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de tarea y robot: entrenada únicamente para "Pick up the cube and put it in the box" sobre `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de calibración: los nombres e índices de cámara (`cam1`, `cam2`) y el puerto del robot deben coincidir con los del entrenamiento; un montaje distinto invalida la política.
- Dataset pequeño: 50 episodios y 24.423 fotogramas a 30 FPS; la cobertura de posiciones, iluminación y distractores es limitada, con riesgo de sobreajuste al entorno de grabación.
- Batch size 1 y learning rate 1e-05 durante 100.000 pasos: configuración concreta que puede no ser óptima para otros datasets.
- Sin datos de sesgos, alucinación o multilingüismo: no aplican en el sentido habitual, pero sí existe riesgo de fallo silencioso ante condiciones visuales no vistas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Sin información sobre cuantización ni despliegue en hardware de bajo consumo más allá de LeRobot.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/act_chunk10_b1_amp
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
