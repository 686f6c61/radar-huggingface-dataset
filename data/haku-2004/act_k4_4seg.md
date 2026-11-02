# Haku-2004/act_k4_4seg

## Resumen

`act_k4_4seg` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo lo desarrolla el usuario Haku-2004 y se distribuye a través de Hugging Face usando la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos cámaras RGB, y produce comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación, etiquetada como "taskbox", sobre un robot de tipo `so_follower` (el seguidor del SO-100/LeRobot). Se entrenó con un dataset propio de solo 10 episodios y 12.519 fotogramas a 30 FPS, lo que lo convierte en un ejemplo de aprendizaje por imitación de bajo coste más que en un modelo generalista.

Su relevancia es práctica: ilustra el flujo completo de LeRobot para grabar demostraciones con teleoperación, entrenar una política ACT y desplegarla en hardware real. Con 51,67 millones de parámetros y un repo de 0,2 GB, es ligero y ejecutable en GPUs de consumo, aunque su generalización está acotada por el tamaño y la diversidad del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side` (3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Salida de accion | `action` con forma `(6,)` |
| Dataset de entrenamiento | Haku-2004/k4_4seg (10 episodios, 12.519 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.5.2 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes) con un transformer que predice chunks de acciones en lugar de pasos individuales. Esta predicción por bloques reduce el error de compounding y suaviza el control, y es la razón por la que ACT suele alcanzar tasas de éxito altas en tareas de manipulación con datos de teleoperación. La política consume dos flujos de imagen (`front` y `side`) y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.5.2 durante 50.000 pasos, batch de 8, AdamW con learning rate 1e-05 y semilla 1000, sobre el dataset `Haku-2004/k4_4seg` (10 episodios, 12.519 fotogramas a 30 FPS, tarea "taskbox"). No se documentan detalles sobre aumentos de datos, composición exacta del dataset ni uso de RLHF/DPO (no aplica en aprendizaje por imitación). Tampoco se especifica la configuración interna del transformer (número de capas, dimensión oculta, número de queries del decoder).

## Capacidades

- Control visomotor de un robot `so_follower` a partir de dos cámaras RGB y el estado articular.
- Predicción de chunks de acción de 6 dimensiones para la tarea "taskbox".
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en bucle cerrado con realimentación visual a 30 FPS.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de la tarea "taskbox" en un SO-100/LeRobot: la política ejecuta la secuencia aprendida de manipulación sobre la caja de tareas usando las cámaras `front` y `side` y el estado de 6 articulaciones.
- Prototipado rápido de imitación en laboratorio: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con 10 episodios y 50.000 pasos.
- Base para fine-tuning con más datos: al ser Apache 2.0 y pesar 0,2 GB, se puede reentrenar con `lerobot-train` añadiendo episodios y variaciones de posición de objetos.
- Docencia y demostraciones: ejemplo ligero y ejecutable en GPU de consumo para explicar ACT y el chunking de acciones en cursos de robótica.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia de un pipeline de dos cámaras a 480x640 y 30 FPS en hardware modesto.
- Punto de partida para comparativas de métodos de imitación (ACT frente a Diffusion Policy o VQ-BeT) en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,67 M de parámetros) es previsible que quepa holgadamente en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: probable por el tamaño del modelo y del repo (0,2 GB), aunque no está confirmado en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=Haku-2004/act_k4_4seg`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponible; el dataset y la inferencia operan a 30 FPS, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k4_4seg | ACT (LeRobot) | 51,67 M | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no aplica | Apache 2.0 | Hugging Face / docs LeRobot |
| Diffusion Policy | Política de difusión | no disponible | no aplica | no disponible | Repositorios de investigación |
| VQ-BeT | Transformer con cuantización vectorial | no disponible | no aplica | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 12.519 fotogramas: alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación u objetos distintos.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito.
- Tarea única ("taskbox") y robot específico (`so_follower`): no es reutilizable directamente en otro hardware o tarea sin reentrenamiento.
- Dependencia de dos cámaras con nombres exactos (`front`, `side`) y resolución 480x640: un cambio de configuración invalida la política.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de acciones erráticas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el dataset procede de un único operador y entorno, por lo que hereda sus sesgos de ejecución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan cuantizaciones ni requisitos mínimos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k4_4seg
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k4_4seg
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k4_4seg
