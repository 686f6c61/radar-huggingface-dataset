# advanced-control/act_piper_pickup_mug_merged

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele lograr tasas de éxito elevadas en manipulación robótica. Este repositorio concreto, `advanced-control/act_piper_pickup_mug_merged`, es una política entrenada con LeRobot para la tarea de recoger una taza con un robot Piper, a partir de 309 episodios de teleoperación.

El modelo es una red transformer de aproximadamente 51,67 millones de parámetros que consume el estado articular de 7 dimensiones y tres cámaras (mano, pecho y superior) a resolución 360x640, y produce un vector de acción de 7 dimensiones. No es un modelo de lenguaje: es una política visuomotora especializada, con licencia Apache 2.0 y pesos en formato safetensors empaquetados según la convención de LeRobot.

Su relevancia radica en que ejemplifica el flujo completo de LeRobot para robótica del mundo real: grabación de datos, entrenamiento con ACT y despliegue en hardware físico mediante `lerobot-rollout`. Al estar publicada la política junto al dataset, sirve como referencia reproducible para quien quiera adaptar ACT a su propio robot o comparar configuraciones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visuomotora transformer |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; usa observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado LeRobot), repo de 0,2 GB |
| Entrada: estado | `observation.state`, shape (7,) |
| Entrada: imágenes | `camera_hand`, `camera_chest`, `camera_top`, shape (3, 360, 640) cada una |
| Salida | `action`, shape (7,) |
| Dataset de entrenamiento | `advanced-control/piper_pickup_mug_merged` (309 episodios, 166.739 frames, 15 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que, en cada paso de inferencia, recibe las observaciones (estado articular de 7 dimensiones y tres imágenes RGB de 360x640) y predice un chunk de acciones futuras en lugar de una única acción. Esta predicción por chunks mitiga el problema de la acumulación de errores de las políticas paso a paso y permite un control más suave y consistente en tareas de manipulación. El modelo tiene 51,67 millones de parámetros, un tamaño modesto que lo hace viable en GPUs de consumo para inferencia.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05, sobre el dataset `piper_pickup_mug_merged`, compuesto por 309 episodios teleoperados (166.739 frames a 15 FPS) de la tarea de recoger una taza con un robot Piper. La model card no detalla la composición exacta del dataset, la presencia de aumentos de datos ni si se aplicaron técnicas de regularización adicionales; tampoco se especifica la innovación concreta más allá del chunking de acciones descrito en el paper de ACT.

## Capacidades

- Control visuomotor de manipulación robótica: genera comandos de acción de 7 dimensiones a partir de estado articular e imágenes.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas ni entorno simulado.
- Predicción de chunks de acciones, lo que aporta suavidad y reduce el error acumulado en secuencias largas.
- Fusión multimodal de tres vistas de cámara (mano, pecho, superior) con el estado propioceptivo.
- Ejecución en tiempo real a 15 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política robótica especializada.
- No dispone de modo de pensamiento, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Recogida de objetos con robot Piper: la política está entrenada específicamente para la tarea de pick-up de una taza, por lo que puede desplegarse directamente en un Piper con las tres cámaras configuradas para reproducir esa tarea.
- Base para fine-tuning en tareas de manipulación similares: al estar publicada con su dataset, sirve como punto de partida para adaptar ACT a otras tareas de pick-and-place con cambios mínimos en la configuración de LeRobot.
- Validación de pipelines de aprendizaje por imitación: útil para comprobar el flujo completo de grabación, entrenamiento y despliegue con LeRobot 0.6.1 en un entorno real.
- Investigación en chunking de acciones: permite experimentar con el tamaño de chunk, la frecuencia de control y la fusión de cámaras comparando contra esta referencia entrenada.
- Demostraciones reproducibles en robótica educativa: el repositorio incluye instrucciones de despliegue con `lerobot-rollout`, lo que facilita montar una demo funcional en laboratorio.
- Benchmark interno de políticas ACT: al tener configuración de entrenamiento documentada (100k pasos, batch 8, lr 1e-05), sirve como línea base para comparar variantes de arquitectura o de datos.
- Prototipado de control visuomotor con múltiples cámaras: el uso de tres vistas (mano, pecho, superior) es un ejemplo práctico de cómo configurar observaciones multimodales en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 millones de parámetros en precisión completa (fp32) el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 o superior es suficiente; para entrenamiento se recomienda al menos una GPU con 8-12 GB de VRAM.
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la frecuencia de control del dataset es de 15 FPS, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_piper_pickup_mug_merged | 51,67 M | estado (7,) + 3 cámaras 360x640 | Pick-up de taza con Piper | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia genérica) | no disponible en esta ficha | no disponible | Manipulación por imitación | varía según implementación | Repositorios de investigación |
| Otras políticas ACT de LeRobot | varía por repositorio | varía | Manipulación diversa | varía | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas concretas, ya que no se han publicado evaluaciones en robot real.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; la tasa de éxito es desconocida.
- Es una política especializada en una única tarea ("pickup mug") y un robot concreto (Piper); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Requiere exactamente las tres cámaras (`camera_hand`, `camera_chest`, `camera_top`) con las resoluciones y nombres de observación usados en el entrenamiento; cambiar la configuración invalida la política.
- El dataset es reducido (309 episodios) y proviene de teleoperación; puede presentar sesgos hacia posiciones, iluminación y condiciones presentes en la grabación.
- No es un modelo de lenguaje: no procesa texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Riesgo de fallo ante objetos, posiciones o condiciones de iluminación distintas a las del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el comportamiento en producción; se recomienda validación exhaustiva antes de desplegar en entornos reales.
- La model card no documenta el tamaño de chunk, la composición exacta del dataset ni posibles técnicas de regularización, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/advanced-control/act_piper_pickup_mug_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/advanced-control/piper_pickup_mug_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pickup_mug_merged
