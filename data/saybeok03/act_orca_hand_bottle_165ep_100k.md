# saybeok03/act_orca_hand_bottle_165ep_100k

## Resumen

El modelo `act_orca_hand_bottle_165ep_100k` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv:2304.13705. Lo desarrolla el usuario de Hugging Face `saybeok03` y se ha entrenado y subido al Hub mediante la librería LeRobot de Hugging Face. La tarea concreta que aprende es "move the bottle" (mover una botella) usando un brazo robótico con mano tipo Orca y tres cámaras de observación.

A diferencia de un LLM, este no es un modelo de lenguaje: es un modelo de control motor que consume el estado articular (vector de 20 dimensiones) y tres imágenes RGB de 480x640 píxeles, y produce un vector de acción de 20 dimensiones. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar políticas de manipulación robótica de extremo a extremo a partir de datos teleoperados, con un total de 51.697.300 parámetros y un tamaño de repositorio de 0,2 GB.

El modelo se entrenó durante 100.000 pasos sobre un dataset de 165 episodios (141.740 fotogramas a 30 FPS) y se distribuye con licencia Apache 2.0. Es un artefacto de investigación y prototipado, no un producto listo para producción, y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.697.300 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa ventana de observación por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning basado en transformer que predice *chunks* de acciones (varios pasos de acción de una vez) en lugar de un único paso, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política consume tres cámaras (`bottom`, `wrist`, `realsense`) con entradas visuales de forma `(3, 480, 640)` y un vector de estado `observation.state` de forma `(20,)`, y emite un vector `action` de forma `(20,)`. El modelo tiene 51.697.300 parámetros.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `saybeok03/orca-hand-bottle`: 165 episodios, 141.740 fotogramas a 30 FPS, tarea "move the bottle". La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 20 dimensiones para mover una botella con una mano Orca.
- Percepción multimodal: integra tres flujos de imagen RGB (vista inferior, muñeca y RealSense) junto con el estado articular.
- Predicción de chunks de acción, lo que permite ejecutar secuencias de movimiento coherentes en lugar de pasos aislados.
- Ejecución en robot real mediante `lerobot-rollout` con la estrategia base.
- Entrenamiento reproducible con `lerobot-train` sobre datasets en formato LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Prototipado de manipulación con mano Orca: usar la política como punto de partida para mover botellas u objetos cilíndricos similares en un banco de pruebas, aprovechando que está entrenada específicamente para esa tarea y morfología.
- Investigación en imitation learning: servir como referencia reproducible de un entrenamiento ACT de 100.000 pasos con configuración documentada (batch 8, lr 1e-05, semilla 1000) para comparar variantes de arquitectura o datasets.
- Evaluación de pipelines LeRobot: validar el flujo completo de grabación de datos, entrenamiento y despliegue con `lerobot-rollout` en un robot real antes de escalar a tareas más complejas.
- Base para fine-tuning: reentrenar sobre un dataset propio con la misma morfología de robot y cámaras para adaptar la política a nuevas posiciones de objeto o iluminación.
- Docencia y demostraciones: ilustrar de forma tangible cómo un transformer aprende control motor a partir de demostraciones teleoperadas, con un modelo pequeño (51,7 M de parámetros) y un repo de 0,2 GB.
- Benchmark interno de robustez: medir la tasa de éxito al variar posiciones de la botella, condiciones de luz o distracciones, dado que el autor no publica evaluación y el usuario puede generarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB de VRAM libre, incluyendo las cámaras y buffers.
- GPU recomendadas: no se especifican; cualquier GPU NVIDIA con CUDA es suficiente para inferencia. Para entrenamiento se recomienda una GPU con al menos 8-12 GB (no confirmado por el autor).
- Cabe en GPU consumer: sí, por el tamaño del modelo; el cuello de botella real es el procesamiento de tres cámaras a 30 FPS y la latencia del bucle de control.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_orca_hand_bottle_165ep_100k | 51,7 M | Mover botella (Orca hand) | 3 camaras 480x640 + estado (20,) | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | Manipulación genérica | variable | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | Manipulación | variable | variable | Hugging Face |
| Políticas VLA tipo RT-2/OpenVLA | varios miles de M | Manipulación generalista | imagen + instrucción textual | variable | investigación |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Específico de tarea y morfología: entrenado únicamente para "move the bottle" con una mano Orca y tres cámaras concretas; no generaliza a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos en robot real, por lo que se desconoce su robustez ante cambios de posición, iluminación o distracciones.
- Dataset pequeño: 165 episodios y 141.740 fotogramas; riesgo de sobreajuste a las condiciones de grabación.
- Dependencia de calibración: requiere que los nombres e índices de cámara coincidan con las claves de observación (`bottom`, `wrist`, `realsense`) y que el robot esté calibrado; un desajuste invalida la política.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones; la tarea se fija en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/act_orca_hand_bottle_165ep_100k
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/orca-hand-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/orca-hand-bottle
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
