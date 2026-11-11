# SebRivGar/grasp_cube_box

## Resumen

`SebRivGar/grasp_cube_box` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha entrenado y subido a Hugging Face el usuario SebRivGar utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (muñeca y cenital) y del estado de las articulaciones, predice comandos de acción para un brazo robótico de tipo `so_follower`.

La tarea concreta para la que se ha entrenado es "Grasp cube and put it in the box": coger un cubo y depositarlo en una caja. El modelo consume `observation.state` de dimensión 6, dos imágenes RGB de 480x640 y produce un vector de acción de dimensión 6. Cuenta con 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto.

Su relevancia es la de un ejemplo reproducible de flujo completo de imitation learning con LeRobot: dataset teleoperado de 400 episodios y 239.036 fotogramas a 30 FPS, entrenamiento de 50.000 pasos con AdamW y una CLI (`lerobot-rollout`) para ejecutar la política sobre un robot real. Es útil como referencia práctica, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `top` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Dataset de entrenamiento | SebRivGar/dataset3 (400 episodios, 239.036 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice chunks cortos de acciones futuras en lugar de un único paso. La arquitectura combina un codificador visual (para procesar las dos cámaras, `wrist` y `top`) con un transformer que fusiona la información visual y el estado articular y emite secuencias de acciones. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas en tareas de manipulación.

El entrenamiento se realizó sobre el dataset `SebRivGar/dataset3`, compuesto por 400 episodios teleoperados (239.036 fotogramas a 30 FPS) de la tarea "Grasp cube and put it in the box". Se ejecutaron 50.000 pasos con batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.2. No se especifica en la información disponible si hubo aumento de datos, regularización adicional ni fases de RLHF/DPO (no aplicables en este contexto de imitation learning).

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y del estado articular.
- Predicción de chunks de acción: emite secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Aprendizaje por imitación a partir de datos teleoperados: reproduce la tarea "Grasp cube and put it in the box" en el robot `so_follower`.
- Entrada multimodal limitada: imágenes RGB (muñeca y cenital) más vector de estado de 6 dimensiones.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Pick-and-place de laboratorio: ejecutar la política en un `so_follower` para coger un cubo y dejarlo en una caja, usando `lerobot-rollout` con `--policy.path=SebRivGar/grasp_cube_box`. Adecuado por su entrenamiento específico en esa tarea y su bajo coste computacional.
- Reproducción de experimentos de imitation learning: servir como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, despliegue) con un dataset de 400 episodios.
- Base para fine-tuning en tareas similares: reentrenar la política con `lerobot-train` sobre un dataset propio de manipulación de objetos pequeños, aprovechando la arquitectura ACT y los hiperparámetros documentados.
- Docencia y formación en robótica: ilustrar el flujo de ACT, la configuración de cámaras y el uso de la CLI de LeRobot en cursos prácticos.
- Pruebas de integración hardware-software: validar la calibración de cámaras y del puerto del robot antes de escalar a políticas más complejas.
- Benchmark interno de políticas ligeras: comparar tasas de éxito y latencia con otras políticas ACT o Diffusion Policy sobre el mismo robot y dataset.
- Automatización de tareas repetitivas de recogida en entornos controlados (laboratorio, célula de montaje), siempre que la escena coincida con la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos safetensors, el modelo ocupa del orden de 0,2 GB en el repositorio, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento con batch 16 se recomienda una GPU con 8-16 GB (RTX 4070/4080, A100 o H100 para mayor throughput).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con soporte CUDA.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada. La política está pensada para operar a 30 FPS, la frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SebRivGar/grasp_cube_box | ACT (imitation learning) | 51,7 M | 2 cámaras 480x640 + estado (6,) | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (referencia) | ACT | no disponible | Configurable según robot | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy | Política de difusión | no disponible | Configurable | no disponible | Repositorios académicos |
| OpenVLA | VLA (visión-lenguaje-acción) | ~7 B | Imagen + instrucción textual | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Frente a políticas VLA de miles de millones de parámetros, este modelo es dos órdenes de magnitud más pequeño y está especializado en una única tarea, lo que limita su generalización pero reduce drásticamente los requisitos de hardware.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "Grasp cube and put it in the box" en un robot `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin resultados de evaluación: no hay tasa de éxito publicada, por lo que el rendimiento real en el robot es desconocido.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con los usados en entrenamiento (`wrist`, `top`), y la calibración afecta al rendimiento.
- Sensibilidad a cambios de dominio: posiciones de objetos, iluminación, distractores o un robot distinto del mismo tipo pueden degradar la política.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Riesgo de sobreajuste al dataset teleoperado de 400 episodios: la variabilidad de la tarea puede ser limitada.
- No aplica el riesgo de alucinación textual, pero sí el de acciones erróneas o inseguras en el robot; se recomienda supervisión y límites de seguridad en el hardware.
- Idiomas no aplicables; no hay soporte de instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebRivGar/grasp_cube_box
- Dataset de entrenamiento: https://huggingface.co/datasets/SebRivGar/dataset3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebRivGar/dataset3
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
