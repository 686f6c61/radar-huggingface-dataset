# Screener2/act_Final_DoubleReal

## Resumen

`act_Final_DoubleReal` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario Screener2 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. El modelo aprende una tarea de manipulación concreta —"Green cylinder to yellow bucket"— a partir de 30 episodios de teleoperación (15.368 fotogramas a 30 FPS) recogidos sobre un robot `so_follower` con una única cámara cenital. Con 51.668.614 parámetros, no es un modelo de lenguaje: es un controlador visuomotor que mapea el estado articular (6 dimensiones) y una imagen RGB de 480x640 a una acción de 6 dimensiones.

La relevancia de este tipo de políticas radica en que ACT predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión corta. El modelo se distribuye con licencia Apache 2.0, en formato safetensors, y su repo ocupa 0,2 GB, por lo que es desplegable en hardware modesto.

No obstante, conviene subrayar que se trata de una política altamente especializada: solo ha visto una tarea, un robot y una cámara, y no se han publicado resultados de evaluación en robots reales. Su utilidad es, por tanto, la de un punto de partida reproducible o una referencia de entrenamiento, no la de un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo visuomotor, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `overhead` (una camara cenital) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.overhead`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | Screener2/Final_DoubleReal (30 episodios, 15.368 fotogramas, 30 FPS) |
| Tarea | "Green cylinder to yellow bucket" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.5.2 |
| Tamano del repo | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador visual (procesa la imagen cenital de 480x640) con un transformer que, condicionado por el estado articular de 6 dimensiones, predice un chunk de acciones futuras en lugar de una única acción por paso. Esta predicción por fragmentos mitiga el problema de compounding error típico de las políticas paso a paso y suaviza la ejecución en robots de bajo coste. El modelo se entrena con supervisión directa sobre las trayectorias teleoperadas del dataset, sin RLHF ni DPO (no aplica a robótica de imitación).

El entrenamiento se realizó con LeRobot 0.5.2 durante 100.000 pasos, batch de 8, AdamW y learning rate 1e-5, con semilla 1000. El dataset contiene 30 episodios de la tarea "Green cylinder to yellow bucket" capturados a 30 FPS sobre un robot `so_follower` con una cámara `overhead`. No se documentan aumentos de datos, composición adicional del dataset ni innovaciones técnicas más allá del propio método ACT. El tamaño del checkpoint (0,2 GB) es coherente con los 51,7 M de parámetros en precisión estándar.

## Capacidades

- Control visuomotor de manipulación: mapea imagen cenital y estado articular a comandos de 6 dimensiones para un robot `so_follower`.
- Ejecución de una tarea concreta de pick-and-place: "Green cylinder to yellow bucket".
- Predicción de chunks de acción que reducen la acumulación de error y suavizan la trayectoria.
- Aprendizaje por imitación a partir de teleoperación (no requiere recompensas ni entorno simulado).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera de la observación visual de la cámara cenital.

## Casos de uso

- Reproducción de la tarea entrenada en un `so_follower` real: ejecutar `lerobot-rollout` con `--policy.path=Screener2/act_Final_DoubleReal` y la tarea "Green cylinder to yellow bucket" para validar el pipeline completo de LeRobot sobre hardware propio.
- Referencia de entrenamiento para nuevos usuarios de LeRobot: sirve como ejemplo funcional de configuración ACT (100k pasos, batch 8, lr 1e-5) que se puede replicar con `lerobot-train` sobre un dataset propio.
- Base para fine-tuning en tareas de pick-and-place similares: al compartir arquitectura y formato con ACT estándar, se puede reentrenar con un dataset nuevo manteniendo el mismo robot y cámara.
- Docencia y prototipado en robótica de imitación: permite demostrar el flujo teleoperación → dataset → entrenamiento → despliegue sin requerir GPUs de gran capacidad.
- Benchmark interno de políticas visuomotoras: útil como línea base en comparaciones de éxito/fallo sobre la misma tarea y robot.
- Validación de infraestructura de inferencia robótica: comprobar latencia y estabilidad de `lerobot-rollout` con una política de 51,7 M de parámetros antes de escalar a modelos mayores.
- Exploración de límites de generalización: evaluar cómo se comporta la política ante cambios de iluminación, posiciones de objetos o distracciones, tal como sugiere la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,668,614 parámetros (≈207 MB de pesos) más el codificador visual y buffers de imagen; en la práctica, cualquier GPU con 2-4 GB es suficiente.
- GPU recomendadas: no se especifican en la documentación; por tamaño, una RTX 3060, RTX 4090, A100 o H100 son sobradas. Una GPU integrada podría ser suficiente, aunque no está documentado.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del checkpoint (0,2 GB) y los 51,7 M de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas visuomotoras.
- Latencia y throughput: no disponibles. La ejecución requiere una cámara a 30 FPS y un robot `so_follower` conectado por puerto serie.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_Final_DoubleReal | 51.668.614 | Estado (6,) + imagen (3, 480, 640) | "Green cylinder to yellow bucket" en `so_follower` | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (paper original, arXiv:2304.13705) | no disponible en la información | no disponible | Manipulación con chunks de acción (genérico) | no disponible en la información | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la información | no disponible | Manipulación diversa | no disponible en la información | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo ha sido entrenada para una tarea ("Green cylinder to yellow bucket"), un robot (`so_follower`) y una cámara (`overhead`); no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 30 episodios y 15.368 fotogramas son un volumen reducido; es probable que la política sea sensible a cambios de iluminación, posiciones de objetos o distracciones.
- Sesgos conocidos: no documentados explícitamente, pero al derivarse de teleoperación humana puede heredar sesgos de las trayectorias demostradas (velocidad, agarre, posiciones iniciales).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías y no se documenta atribución adicional más allá de la del método ACT y LeRobot.
- Caveat para producción: requiere calibración del robot, coincidencia exacta de nombres de cámara con las claves de observación (`observation.images.overhead`) y un puerto serie válido; cualquier desviación puede provocar fallos de ejecución.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_Final_DoubleReal
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/Final_DoubleReal
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/Final_DoubleReal
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
