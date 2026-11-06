# fei1887415157/LeRobot_SO-101_Grab_ACT_224x224

## Resumen

LeRobot_SO-101_Grab_ACT_224x224 es una política de imitación (policy) para robótica basada en el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo lo ha entrenado el usuario fei1887415157 y lo ha publicado en Hugging Face Hub mediante la librería LeRobot de Hugging Face, con licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado del robot y dos cámaras) a acciones de control de un brazo robótico de bajo coste del tipo SO-101 (so_follower).

La tarea concreta aprendida es "rebar gun moving": el robot manipula una pistola de fijación (rebar gun) a partir de 76 episodios de teleoperación, 76.108 frames grabados a 60 FPS. La política recibe un vector de estado de 6 dimensiones y dos imágenes RGB de 224x224 píxeles (cámaras "rebar gun" y "overhead"), y produce un vector de acción de 6 dimensiones. El modelo tiene 51.627.654 parámetros y se distribuye en formato safetensors con un repositorio de 12,4 GB.

Su relevancia es doble: por un lado, demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot sobre hardware asequible (SO-101); por otro, sirve como referencia práctica de cómo ACT predice chunks de acciones en lugar de pasos individuales, lo que reduce el error compuesto y mejora la estabilidad en tareas de manipulación. No obstante, es un modelo muy específico de una sola tarea y robot, sin evaluación publicada en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.627.654 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación de un solo paso con historial de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción de chunks de acciones: en lugar de predecir una acción por paso, el modelo predice una secuencia corta de acciones futuras, lo que mitiga el error acumulado típico de las políticas paso a paso y permite un control más suave. La arquitectura incluye codificadores visuales para las dos cámaras (imágenes de 3x224x224) y un decodificador que genera el vector de acción de 6 dimensiones, condicionado por el estado del robot (6 dimensiones) y la tarea textual. El entrenamiento se realizó con LeRobot 0.6.1, optimizador AdamW, learning rate 1e-4, batch size 1024, 1000 pasos y semilla 1000, sobre el dataset fei1887415157/LeRobot_SO-101_Grab_224x224 (76 episodios, 76.108 frames a 60 FPS, tarea "rebar gun moving").

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), composición detallada del dataset más allá de la tarea, ni sobre técnicas de RLHF/DPO (no aplicables a este paradigma). La innovación técnica destacable es el propio action chunking de ACT, que en el paper original reporta altas tasas de éxito en tareas de manipulación con datos de teleoperación. El modelo no incluye decodificación especulativa ni atención lineal; es un transformer estándar adaptado a robótica.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (so_follower) para la tarea "rebar gun moving".
- Predicción de chunks de acciones de 6 dimensiones a partir de estado de 6 dimensiones y dos imágenes RGB de 224x224.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensas ni RL).
- Ejecución de políticas en robot real mediante `lerobot-rollout` con estrategia base.
- Entrenamiento reproducible con `lerobot-train` y configuración documentada.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de pistola de fijación (rebar gun) en entornos de construcción o montaje: la política ejecuta la tarea "rebar gun moving" sobre un SO-101, adecuada para demostrar automatización de tareas repetitivas de sujeción y posicionamiento.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia para equipos que quieran replicar el pipeline completo (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en hardware SO-101.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con datasets pequeños (76 episodios) y analizar la estabilidad del action chunking en tareas de un solo objeto.
- Docencia y formación en robótica de bajo coste: el modelo y su dataset asociado permiten ilustrar el ciclo teleoperación-entrenamiento-evaluación con cámaras RGB estándar y un brazo asequible.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y licencia Apache 2.0, se puede reentrenar con nuevos datasets de la misma morfología de robot y cámaras.
- Validación de infraestructura de inferencia robótica: útil para probar latencia y throughput de políticas ACT en GPUs consumer antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y dos imágenes de 224x224, la huella es reducida y cabe holgadamente en GPUs consumer (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, una RTX 3060/4060 o superior sería suficiente para inferencia, y una RTX 4090 o A100 para entrenamiento con batch size 1024.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para inferencia (no confirmado).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeRobot_SO-101_Grab_ACT_224x224 | 51,6 M | no aplica | Manipulación SO-101 (rebar gun) | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación genérica | no disponible | Paper/repo |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no aplica | Manipulación genérica | variable | Hugging Face/LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una sola tarea ("rebar gun moving") y un solo tipo de robot (so_follower); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación en robot real publicados; el éxito en producción no está verificado.
- Dataset pequeño (76 episodios, 76.108 frames); riesgo de sobreajuste y baja robustez ante cambios de iluminación, posiciones de objeto o distracciones.
- Dependencia de dos cámaras con nombres concretos ("rebar gun", "overhead"); un cambio de configuración de cámaras invalida la política.
- No es un modelo lingüístico: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de uso comercial.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras en robot real; se recomienda supervisión y paradas de emergencia.
- Sin información sobre sesgos, latencia ni cuantizaciones disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/fei1887415157/LeRobot_SO-101_Grab_ACT_224x224
- Dataset: https://huggingface.co/datasets/fei1887415157/LeRobot_SO-101_Grab_224x224
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fei1887415157/LeRobot_SO-101_Grab_224x224
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
