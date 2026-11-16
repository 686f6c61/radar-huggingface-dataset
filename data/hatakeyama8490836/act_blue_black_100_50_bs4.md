# hatakeyama8490836/act_blue_black_100_50_bs4

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación robótica. Este repositorio concreto, `hatakeyama8490836/act_blue_black_100_50_bs4`, es una política entrenada con LeRobot sobre el robot `so_follower` para una tarea específica: introducir un conector azul y negro en una zona cuadrada negra.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors a través de la librería LeRobot. Consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras: `side`, `wrist` y `top`) y produce una acción de 6 dimensiones. Es un modelo de robótica de propósito muy acotado, no un modelo de lenguaje: no procesa texto libre ni genera respuestas conversacionales.

Su relevancia es la de un ejemplo práctico de política de imitación entrenada de extremo a extremo con LeRobot 0.6.2, útil para quien quiera reproducir el flujo de entrenamiento o desplegar una política ACT sobre hardware SO-100/SO-101. El repositorio no incluye resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación definida por la arquitectura ACT, no por tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Entradas | `observation.state` (6,), `observation.images.side` (3, 360, 640), `observation.images.wrist` (3, 720, 1280), `observation.images.top` (3, 360, 640) |
| Salidas | `action` (6,) |
| Tamaño del repo | 0,2 GB |
| Dataset de entrenamiento | hatakeyama8490836/blue-and-black_merged (60 episodios, 34.669 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. La arquitectura combina un backbone visual (procesa las tres cámaras de entrada a distintas resoluciones) con un transformer que fusiona las características visuales y el estado propioceptivo del robot para generar la secuencia de acciones. Esta formulación reduce el problema de compounding error típico de las políticas que predicen un solo paso y permite un control más suave y consistente.

El entrenamiento se realizó con LeRobot 0.6.2 durante 30.000 pasos, con batch size 4, AdamW y learning rate 1e-05, sobre el dataset `blue-and-black_merged` (60 episodios, 34.669 frames a 30 FPS) recogido por teleoperación para la tarea "Move the blue-and-black connector into the black square area". No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular y tres vistas de cámara.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos aislados, lo que suaviza la ejecución y reduce la acumulación de error.
- Percepción multimodal: integra tres cámaras (`side`, `wrist`, `top`) con resoluciones distintas (360x640, 720x1280, 360x640).
- Ejecución de una tarea concreta: introducir un conector azul y negro en una zona cuadrada negra.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni agentes conversacionales.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Reproducción de la tarea de inserción: desplegar la política sobre un robot SO-100/SO-101 con las tres cámaras configuradas para ejecutar la tarea de inserción del conector, usando `lerobot-rollout` con `--strategy.type=base`.
- Base para fine-tuning: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio para adaptar la política a una variante de la misma tarea (otra posición de objeto, otro conector).
- Referencia de pipeline de imitación: usar el repositorio como ejemplo completo del flujo LeRobot (grabación de datos, entrenamiento, publicación en el Hub y rollout) para formar a nuevos usuarios.
- Evaluación de infraestructura de robótica: probar la cadena de inferencia (cámaras OpenCV, puerto del robot, frecuencia de 30 FPS) antes de invertir en datasets propios.
- Benchmark interno de políticas ACT: comparar el comportamiento de esta política con otras ACT entrenadas sobre el mismo dataset para medir el efecto de hiperparámetros (batch size, learning rate, número de pasos).
- Docencia y divulgación: ilustrar cómo un transformer de ~51,7 M de parámetros puede resolver una tarea de manipulación concreta con datos de teleoperación, sin necesidad de modelos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) junto con el procesamiento de las tres cámaras.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda al menos una RTX 3090/4090 o una A100/H100 si se escala el dataset.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella real es la captura y decodificación de las tres cámaras a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el stack de entrenamiento `lerobot-train` con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la configuración del dataset y de las cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_blue_black_100_50_bs4 (este) | 51.668.614 | no aplica (política ACT) | Inserción de conector azul-negro en zona negra | no disponible | Hugging Face, LeRobot |
| Otras políticas ACT de LeRobot | no disponible | no aplica | Tareas de manipulación diversas | variable según repo | Hugging Face, LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación con políticas generativas | variable según repo | Hugging Face, LeRobot |
| Políticas VLA (p. ej. SmolVLA) | no disponible en esta ficha | no disponible | Manipulación guiada por lenguaje | variable según repo | Hugging Face, LeRobot |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación anterior es cualitativa y se limita a la categoría (políticas de imitación para robótica en LeRobot).

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del entorno: cambios en iluminación, posición de objetos, fondo o calibración de cámaras pueden degradar el comportamiento; no se documenta robustez ante distractores.
- Dependencia de hardware: requiere las tres cámaras con los nombres y resoluciones exactos (`side`, `wrist`, `top`) y el robot `so_follower`; un montaje distinto invalida la política.
- Dataset pequeño: 60 episodios y 34.669 frames es un volumen reducido, lo que limita la cobertura de variaciones y aumenta el riesgo de sobreajuste al entorno de grabación.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- Sin idiomas ni texto: no es un modelo de lenguaje; no debe evaluarse con benchmarks de NLP ni usarse para tareas conversacionales.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones erróneas o inseguras en el robot si la política se ejecuta fuera de su distribución de entrenamiento; se recomienda supervisión y límites de seguridad en el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/act_blue_black_100_50_bs4
- Dataset de entrenamiento: https://huggingface.co/datasets/hatakeyama8490836/blue-and-black_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hatakeyama8490836/blue-and-black_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
