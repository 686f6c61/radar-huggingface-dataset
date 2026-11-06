# drdonv/act_so101_aug

## Resumen

`drdonv/act_so101_aug` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. La desarrolla el usuario drdonv y resuelve una tarea robótica concreta de manipulación: recoger un objeto y colocarlo en una zona objetivo ("Pick up the object and place it in the target zone"). No es un modelo de lenguaje, sino un modelo de control visuomotor que consume el estado de las articulaciones y una imagen de cámara cenital, y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (dato real del archivo safetensors) y un repositorio de 2,5 GB. Está entrenado sobre el dataset `drdonv/so101_act_pilot`, con 51 episodios y 32.859 fotogramas a 30 FPS, capturados con un robot `so_follower` (SO-101) y una única cámara `top` de 480x640. La licencia es Apache 2.0.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas ACT en hardware de bajo coste (SO-101), con instrucciones de ejecución mediante `lerobot-rollout`. Al ser un modelo pequeño y específico de tarea, no compite con los grandes modelos fundacionales de robótica, pero sí es un ejemplo reproducible de extremo a extremo para investigación en imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de chunk de acciones, valor no especificado en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación teleoperadas. La política consume `observation.state` con forma `(6,)` y `observation.images.top` con forma `(3, 480, 640)`, y produce una acción de forma `(6,)`. El modelo se entrenó con LeRobot 0.6.1 durante 40.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000.

El dataset de entrenamiento contiene 51 episodios y 32.859 fotogramas a 30 FPS para una única tarea. No se especifica en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este paradigma de imitación supervisada). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la innovación principal es el propio esquema de action chunking descrito en el paper arXiv:2304.13705.

## Capacidades

- Control visuomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen cenital.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas.
- Predicción de chunks de acciones, lo que aporta robustez frente a errores acumulados en horizontes largos.
- Ejecución en robot real mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` y seguimiento opcional en Weights & Biases.
- Soporte de una única cámara (`top`) y un tipo de robot (`so_follower`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Recogida y colocación de objetos en una zona objetivo: es exactamente la tarea para la que fue entrenado; se usaría con `lerobot-rollout`, el puerto del robot SO-101 y una cámara cenital a 640x480 y 30 FPS.
- Prototipado de pipelines de imitación en investigación: sirve como referencia reproducible para validar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) antes de escalar a tareas propias.
- Docencia y formación en robótica de bajo coste: el modelo y el hardware SO-101 permiten montar prácticas de aprendizaje por imitación con un coste contenido y una licencia permisiva.
- Base para fine-tuning en tareas de pick-and-place: al ser Apache 2.0 y un checkpoint pequeño, se puede reentrenar con un dataset propio de pocos episodios para variantes de la misma tarea.
- Evaluación de robustez frente a cambios de iluminación o posición de objetos: útil para medir la sensibilidad de ACT ante variaciones del entorno no presentes en los 51 episodios originales.
- Integración en bancos de pruebas de políticas robóticas: su tamaño (51,7 M de parámetros) y formato safetensors facilitan cargarlo en pipelines automatizados de evaluación comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión completa (fp32) el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó con `--policy.device=cuda`, sin detallar el modelo de GPU.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se documenta una GPU mínima concreta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la ejecución se realiza a 30 FPS según el dataset, pero no se publican métricas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drdonv/act_so101_aug | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face Hub (LeRobot) |
| Políticas ACT de LeRobot (genéricas) | variable | no aplica | variable según dataset | apache-2.0 (LeRobot) | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | variable según dataset | según implementación | Hugging Face Hub |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una única tarea ("Pick up the object and place it in the target zone") y de un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Entrenado con una sola cámara (`top`) y una resolución fija de 480x640; cambios de cámara o de encuadre pueden degradar el rendimiento.
- Dataset pequeño (51 episodios, 32.859 fotogramas), lo que limita la robustez ante variaciones de iluminación, posición de objetos o distractores.
- Sin resultados de evaluación en robot real publicados: no hay evidencia cuantitativa de tasa de éxito.
- Riesgo de sobreajuste al entorno de captura y al objeto concreto usado en la teleoperación.
- No es un modelo de lenguaje: no tiene capacidades multilingües, de razonamiento simbólico ni de tool calling; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según la model card.
- Para producción, es imprescindible validar la política en el robot y entorno reales antes de desplegarla, dado que no existe evaluación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdonv/act_so101_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/drdonv/so101_act_pilot
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=drdonv/so101_act_pilot
- Perfil del autor: https://huggingface.co/drdonv/models
