# Haku-2004/act_k5end_base_20

## Resumen

`Haku-2004/act_k5end_base_20` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Haku-2004 y se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. El modelo resuelve una tarea concreta de manipulación, identificada como "taskbox", sobre un robot de tipo `so_follower` con dos cámaras (front y side).

A diferencia de los modelos de lenguaje, no genera texto: consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Su relevancia es práctica y acotada: demuestra el flujo completo de LeRobot para grabar teleoperación, entrenar una política ACT y desplegarla en hardware real. El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico en políticas paso a paso. Se entrenó durante 50.000 pasos con batch de 8 sobre un dataset de 20 episodios y 25.815 fotogramas a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con predicción por chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal fijada por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.5.2 |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | Haku-2004/k5_20261110_143202 (20 episodios, 25.815 fotogramas, 30 FPS, tarea "taskbox") |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) para procesar las dos cámaras y un decodificador que emite un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks mitiga el problema de acumulación de errores y permite movimientos más suaves y coherentes temporalmente. El modelo condiciona la política en el estado articular de 6 dimensiones y en la tarea indicada en el prompt de rollout ("taskbox").

El entrenamiento se realizó con LeRobot 0.5.2 sobre 20 episodios teleoperados (25.815 fotogramas a 30 FPS), con 50.000 pasos, batch de 8, AdamW y learning rate 1e-05. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de imitación supervisada pura sobre el dataset indicado. Tampoco se especifican detalles del backbone visual ni del número de capas del transformer más allá de lo que aporta el paper de ACT.

## Capacidades

- Manipulación robótica por imitación: ejecuta la tarea "taskbox" sobre un robot `so_follower` a partir de observaciones visuales y de estado.
- Predicción de chunks de acción de 6 dimensiones, lo que produce trayectorias más estables que políticas paso a paso.
- Fusión multimodal de dos cámaras (front y side) con el estado articular.
- Despliegue mediante `lerobot-rollout` con la estrategia `base`.
- Reentrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Automatización de una celda de picking tipo "taskbox": la política mueve el efector del `so_follower` para completar la tarea sobre la mesa, usando las dos cámaras para localizar objetos y el estado articular para el control fino.
- Prototipado rápido de flujos de imitación: sirve como referencia para validar la pipeline completa de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Benchmark interno de hardware: al ser un checkpoint pequeño (0,2 GB, ~51,7 M de parámetros), permite medir latencia de inferencia y comportamiento del robot sin grandes requisitos de cómputo.
- Base para fine-tuning con nuevos episodios: se puede partir de estos pesos y añadir datos de la misma tarea para mejorar la robustez ante variaciones de posición o iluminación.
- Docencia y divulgación: ejemplo didáctico de ACT con configuración explícita (pasos, batch, LR, semilla) para explicar aprendizaje por imitación en robótica.
- Evaluación comparativa de políticas: sirve como línea base ACT frente a otros métodos (p. ej. Diffusion Policy) en la misma tarea y robot.
- Integración en pipelines de investigación: punto de partida para estudiar chunking, fusión de cámaras o robustez ante cambios de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos safetensors, la inferencia en FP32 ronda los 0,2-0,3 GB de VRAM, y en FP16 aproximadamente 0,1 GB (estimación a partir del tamaño del repo, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en placas integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), integración con LeRobot 0.5.2; no se documentan despliegues con vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las dos cámaras (480x640) y de la frecuencia de control del robot (30 FPS en el dataset).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5end_base_20 | 51,7 M | 2 cámaras 480x640 + estado (6,) | taskbox (so_follower) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (checkpoints oficiales) | variable (del orden de decenas de M) | 1-2 cámaras + estado | tareas varias | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | no disponible | imágenes + estado | manipulación | MIT (repo original) | Repositorios de investigación |

No se dispone de datos numéricos comparativos de éxito ni de latencia entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que no se puede garantizar su funcionamiento fuera del entorno de entrenamiento.
- Dataset muy pequeño: 20 episodios y 25.815 fotogramas son insuficientes para generalizar a nuevas posiciones, iluminación, objetos o distracciones.
- Específico de hardware: entrenado para `so_follower` con cámaras `front` y `side`; los nombres e índices de cámara deben coincidir exactamente en el rollout.
- Tarea única: la política está condicionada a "taskbox"; no es un modelo generalista ni acepta instrucciones en lenguaje natural.
- Sin capacidades de texto, tool calling ni agentes: no debe evaluarse como un LLM.
- Riesgo de sobreajuste y de deriva en ejecuciones largas; conviene limitar `--duration` y supervisar el robot.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación propia.
- No se documentan sesgos, pero al ser un modelo visual puede heredar sesgos de las condiciones del dataset de entrenamiento (posición de cámara, fondo, iluminación).
- Idiomas: no aplica; no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5end_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento (imitación): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
