# Haku-2004/act_k5e_base_10_20k

## Resumen

`act_k5e_base_10_20k` es una política de imitación (imitation learning) para control robótico entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Haku-2004 y se distribuye a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visomotor que, a partir de dos cámaras (frontal y lateral) y del estado de las articulaciones del robot, predice una secuencia corta de acciones de 6 dimensiones para un robot de tipo `so_follower`.

El modelo resuelve el problema de la manipulación robótica mediante aprendizaje por imitación a partir de teleoperación. En lugar de predecir una sola acción por paso, ACT predice un "chunk" de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de contacto como la que nos ocupa, denominada "taskbox". El checkpoint tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabación de dataset, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`, todo con licencia Apache 2.0. Sin embargo, conviene subrayar que se trata de un checkpoint muy específico, entrenado con solo 20 episodios y 25.815 fotogramas para una única tarea y un único tipo de robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Biblioteca | lerobot |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un codificador de imágenes (extracción de features visuales de las dos cámaras) con un transformer que fusiona estado y representaciones visuales para predecir un chunk de acciones. La innovación central del método es predecir varios pasos de acción de forma conjunta en lugar de uno solo, lo que mitiga el error compounding típico de las políticas reactivas y favorece la suavidad del movimiento. El paper original también introduce una técnica de temporal ensembling para agregar predicciones solapadas.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_20261110_143202`, compuesto por 20 episodios, 25.815 fotogramas a 30 FPS y una única tarea ("taskbox"). La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos sintéticos; es aprendizaje por imitación supervisado puro a partir de teleoperación.

## Capacidades

- Control visomotor de un robot `so_follower` a partir de dos cámaras RGB de 480x640 y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para la tarea "taskbox".
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` y la configuración documentada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Manipulación de una caja de tareas ("taskbox") con un robot `so_follower`: el modelo ejecuta la política entrenada para esta tarea concreta, usando las cámaras frontal y lateral para localizar objetos y el estado articular para cerrar el bucle de control.
- Reproducción de una demo de teleoperación a escala de laboratorio: sirve como referencia para validar que el pipeline LeRobot funciona de extremo a extremo antes de escalar a datasets mayores.
- Base para fine-tuning con más episodios: al estar en formato LeRobot y con licencia Apache 2.0, se puede continuar el entrenamiento con nuevos datos de la misma tarea o de tareas relacionadas.
- Prototipado de pipelines de imitación en robótica de bajo coste: el checkpoint de 0,2 GB y 51,7 M de parámetros se puede cargar en estaciones de trabajo con GPU consumer para pruebas rápidas.
- Evaluación comparativa de métodos de imitación: útil como línea base ACT frente a otras políticas (diffusion policy, VLA) en el mismo dataset.
- Docencia y divulgación: ejemplo didáctico de entrenamiento y despliegue de una política ACT con LeRobot, incluyendo comandos de rollout y entrenamiento reproducibles.
- Integración en entornos de simulación o gemelos digitales para validar la política antes de desplegarla en el robot físico, aunque el modelo fue entrenado con datos reales y no se documenta su transferencia a simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors, la huella es muy reducida (del orden de cientos de MB en FP32), por lo que cabe en cualquier GPU consumer moderna.
- GPU recomendadas: no hay recomendación oficial; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia. Para entrenamiento con batch size 8 y dos cámaras a 480x640, se recomienda una GPU con al menos 8-12 GB de VRAM, aunque el dato no está confirmado en la documentación.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5e_base_10_20k (este) | 51,7 M | 2 camaras 480x640 + estado (6,) | taskbox, so_follower | apache-2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | manipulacion general | no disponible | paper |
| Otras politicas LeRobot (diffusion, VLA) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 20 episodios y una única tarea ("taskbox"); la generalización a otras tareas, objetos o posiciones es muy limitada.
- Específico para el robot `so_follower` y para las cámaras `front` y `side`; cambiar la configuración de hardware o de cámaras invalida la política.
- No hay evaluación publicada en robot real, por lo que se desconoce la tasa de éxito y la robustez ante cambios de iluminación, distractores o posiciones nuevas.
- Riesgo de sobreajuste al dataset de teleoperación; el modelo puede replicar sesgos del operador y de las condiciones de grabación.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las dependencias de LeRobot y del dataset subyacente.
- Para producción se recomienda validar con múltiples trials, monitorizar fallos de agarre y prever un mecanismo de parada segura ante comportamientos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5e_base_10_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
