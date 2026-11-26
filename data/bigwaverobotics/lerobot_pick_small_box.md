# Bigwaverobotics/lerobot_pick_small_box

## Resumen

`lerobot_pick_small_box` es una política de control robótico entrenada mediante imitación (imitation learning) con el framework LeRobot de Hugging Face. La desarrolla Bigwaverobotics y está diseñada para la tarea concreta de recoger una caja pequeña en un escenario industrial. No es un modelo de lenguaje: es una política visuomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control de bajo nivel, emitiendo secuencias de 50 acciones por inferencia.

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), una política basada en transformer que predice "chunks" de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. Usa un backbone visual ResNet-18 para procesar las observaciones y cuenta con 51.637.904 parámetros totales, con pesos en formato safetensors y un tamaño de repositorio de 0,2 GB.

Es relevante como ejemplo de política de manipulación entrenada con LeRobot y publicada abiertamente bajo Apache-2.0, lo que permite reproducir el pipeline, adaptarlo a otras tareas de pick-and-place y desplegarlo en robots reales o simulados. Su alcance es, sin embargo, muy específico: una única tarea, un único escenario y un dataset de entrenamiento concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visuomotora con backbone ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; n_obs_steps = 1, chunk_size = 50) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 197 MiB) más procesadores de normalización en safetensors |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT, que combina un codificador visual (ResNet-18) con un transformer que predice un chunk de 50 acciones a partir de una única observación (`n_obs_steps = 1`, `policy_n_action_steps = 50`, `policy_chunk_size = 50`). Este enfoque de predicción por bloques mitiga el problema de acumulación de error típico de las políticas que emiten una acción por paso y facilita movimientos más coherentes en tareas de manipulación.

El entrenamiento es por imitación supervisada (behavior cloning) sobre el dataset `itdevhumanoid/lerobot_pick_small_box_dataset`, según indica la model card. No se documenta en la información disponible el número de episodios, la composición exacta del dataset, ni si hubo etapas de refinamiento (RLHF/DPO no aplica en este contexto). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal, que no están presentes en este tipo de política.

## Capacidades

- Control visuomotor para manipulación robótica: genera secuencias de 50 acciones a partir de observaciones visuales y de estado del robot.
- Ejecución de la tarea específica de recoger una caja pequeña en un escenario industrial.
- Procesamiento de imágenes mediante backbone ResNet-18 integrado en la política.
- Normalización y desnormalización de observaciones y acciones mediante procesadores incluidos en el repositorio (`policy_preprocessor`, `policy_postprocessor`).
- Integración con el ecosistema LeRobot para carga, entrenamiento y despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política recoge cajas pequeñas de una posición conocida y las deposita según la tarea aprendida, adecuada para celdas industriales con condiciones controladas.
- Prototipado rápido de políticas de manipulación: sirve como punto de partida para reentrenar con el dataset propio y adaptar la tarea (otra caja, otra posición) usando LeRobot.
- Benchmark de referencia para comparar arquitecturas ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en la misma tarea.
- Despliegue en robot real con cámara cenital o en muñeca: el modelo consume observaciones visuales y estado del robot, por lo que puede integrarse en un bucle de control a la frecuencia de inferencia del hardware.
- Validación en simulación antes de transferir a hardware: permite probar el pipeline completo de LeRobot en entornos simulados con la misma interfaz de observación/acción.
- Formación y docencia en robótica con aprendizaje por imitación: ejemplo reproducible de extremo a extremo (dataset, entrenamiento, checkpoint y despliegue) bajo licencia permisiva.
- Integración en pipelines de investigación sobre manipulación industrial: base para experimentos de aumento de datos, domain randomization o ajuste fino con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 197 MiB en safetensors (51,6 M de parámetros); con overhead de activaciones y del backbone ResNet-18, la inferencia cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y, en la mayoría de casos, sobredimensionadas para esta política.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer reciente (GTX 1660, RTX 2060 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`) como vía principal; el formato safetensors permite cargarlo con PyTorch estándar. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de las imágenes de entrada y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot_pick_small_box (este) | ACT, imitación | 51,6 M | n_obs_steps = 1, chunk_size = 50 | Apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | Política por difusión | no disponible | no disponible | Apache-2.0 (implementación LeRobot) | Hugging Face / GitHub |
| VQ-BeT (LeRobot) | Política con cuantización vectorial | no disponible | no disponible | Apache-2.0 (implementación LeRobot) | Hugging Face / GitHub |
| OpenVLA | VLA basado en LLM | no disponible | no disponible | no disponible | Hugging Face |

La comparación con Diffusion Policy y VQ-BeT es cualitativa: no se dispone de métricas de éxito publicadas para este checkpoint que permitan una comparación numérica justa. OpenVLA se incluye como referencia de política visuolingüística de propósito más general, no directamente comparable en tamaño ni en tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recoger una caja pequeña) en un escenario concreto; no generaliza a otras tareas sin reentrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- Dependencia del dataset: el rendimiento está acotado por la calidad y variabilidad de `itdevhumanoid/lerobot_pick_small_box_dataset`; no se documenta su tamaño ni su diversidad.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminación, posición de cámara, fondo o tipo de caja pueden degradar el éxito de la tarea.
- Sin benchmarks publicados: no hay métricas de tasa de éxito ni comparaciones verificables, lo que dificulta evaluar su idoneidad en producción.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos reales.
- Advertencia de seguridad: su uso en robots reales requiere supervisión y límites de seguridad físicos; la política no incorpora mecanismos explícitos de parada de emergencia.
- Fecha de creación futura en los metadatos (2026-11-26): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_pick_small_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_pick_small_box_dataset
- LeRobot (framework): https://github.com/huggingface/lerobot
