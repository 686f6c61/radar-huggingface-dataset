# drdonv/act_so101_die_varpos_25_eps

## Resumen

`drdonv/act_so101_die_varpos_25_eps` es una política de imitación basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705, entrenada y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor para el robot manipulador `so_follower` (familia SO-101) que aprende a partir de demostraciones teleoperadas y predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación.

El modelo consume el estado articular de 6 dimensiones y una imagen RGB de 480x640 procedente de una única cámara cenital (`top`), y produce un vector de acción de 6 dimensiones a 30 FPS. Se ha entrenado sobre el dataset `drdonv/so101_die_varpos`, compuesto por 25 episodios y 10.796 fotogramas para una única tarea: recoger un objeto y depositarlo en una zona objetivo. El checkpoint ocupa 4,3 GB y contiene 51.668.614 parámetros.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación en robótica de bajo coste (SO-101 es una plataforma accesible), y permite a desarrolladores e investigadores replicar el flujo de entrenamiento, despliegue y evaluación con LeRobot 0.6.1. No obstante, es una política específica de tarea, con un dataset muy pequeño y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por la configuración ACT, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Tipo de robot | `so_follower` |
| Camaras | 1 (`top`), 480x640 RGB |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Frecuencia de control | 30 FPS |
| Dataset de entrenamiento | `drdonv/so101_die_varpos` (25 episodios, 10.796 frames) |
| Pasos de entrenamiento | 40.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Tamano del repo | 4,3 GB |
| Descargas | 24 |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (behavior cloning) que emplea un transformer para predecir secuencias de acciones (chunks) a partir de observaciones multimodales. La política combina un codificador de imagen (procesa la observación visual de la cámara `top`) con el estado proprioceptivo de 6 dimensiones, y un decodificador que emite un chunk de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: mitiga el error compuesto típico de las políticas reactivas y suaviza la ejecución. La model card no detalla la dimensión del chunk, el número de capas ni la configuración exacta del transformer.

El entrenamiento se realizó con LeRobot 0.6.1 durante 40.000 pasos, batch de 8, AdamW con learning rate 1e-5 y semilla 1000, sobre 25 episodios teleoperados (10.796 fotogramas a 30 FPS) de una única tarea. No se documenta el uso de RLHF, DPO ni data augmentation, ni la composición detallada del dataset más allá de la tarea "Pick up the object and place it in the target zone". El volumen de datos es muy reducido, lo que sitúa al modelo en el régimen de prototipo y no de producción robusta.

## Capacidades

- Control visomotor de manipulación: recoger un objeto y colocarlo en una zona objetivo, a partir de imagen cenital y estado articular.
- Predicción de chunks de acción, lo que aporta ejecución más suave y menor deriva acumulada que políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensas explícitas.
- Inferencia en tiempo real a 30 FPS sobre hardware consumer (dependiendo de la GPU).
- Integración nativa con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento: es una política robótica de tarea única.

## Casos de uso

- Reproducción de un pipeline completo de imitation learning: sirve como referencia docente para grabar un dataset con LeRobot, entrenar una política ACT y desplegarla con `lerobot-rollout`. Su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0 lo hacen idóneo para talleres y cursos.
- Prototipado rápido de pick-and-place en SO-101: el modelo puede ejecutar la tarea "recoger objeto y depositarlo en zona objetivo" en un robot `so_follower` con una cámara cenital, permitiendo validar la mecánica y la calibración del hardware antes de invertir en datasets mayores.
- Punto de partida para fine-tuning: al estar entrenado con LeRobot 0.6.1 y publicar la configuración exacta (pasos, batch, lr, semilla), puede reutilizarse como inicialización o como baseline para comparar con datasets ampliados o con variaciones de la tarea.
- Benchmark interno de infraestructura de inferencia robótica: permite medir latencia y throughput de una política ACT de ~52 M de parámetros en distintas GPU y verificar que se alcanzan los 30 FPS de control.
- Validación de setups de captura: al depender de una única cámara `top` a 480x640, es útil para comprobar encuadre, iluminación e índices de cámara antes de grabar datasets propios.
- Demostración de despliegue con `lerobot-rollout` en modo `base` (sin grabación de episodios) con `--duration` acotado, útil para pruebas de integración en laboratorio.
- Base para experimentos de evaluación comparativa de políticas de imitación en tareas de manipulación simples, siempre que se documenten las condiciones (posiciones de objeto, iluminación, distracciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en FP32, los pesos ocupan aproximadamente 207 MB; el consumo real depende del codificador visual, del tamaño de batch y del runtime de LeRobot, no documentados.
- GPU recomendadas: no disponibles en la información. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA con CUDA.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño del modelo, pero no se confirma en la documentación.
- Opciones de despliegue: LeRobot 0.6.1 con `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: el sistema opera a 30 FPS de control, según la tasa del dataset; no se publican medidas de latencia por paso ni throughput en hardware concreto.
- Almacenamiento: el repositorio ocupa 4,3 GB, por lo que se recomienda disponer de al menos 5 GB libres para clonar y ejecutar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / ventana | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|---|
| `drdonv/act_so101_die_varpos_25_eps` | 51,7 M | ACT (LeRobot) | no disponible | Apache 2.0 | Hugging Face (24 descargas) | No |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | no disponible | Apache 2.0 (segun LeRobot) | Hugging Face / docs LeRobot | Variable, no comparada aquí |
| Políticas Diffusion Policy en LeRobot | no disponible | Diffusion Policy | no disponible | Apache 2.0 (segun LeRobot) | Hugging Face / docs LeRobot | Variable, no comparada aquí |
| Políticas π0 / π0.5 (Physical Intelligence) | no disponible en la informacion | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparativa se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the object and place it in the target zone") y un único tipo de robot (`so_follower`). No generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Dataset muy pequeño: 25 episodios y 10.796 fotogramas. Es probable un sobreajuste a posiciones, iluminación y objetos concretos del dataset; la robustez ante variaciones no está evaluada.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- Dependencia de una sola cámara cenital (`top`): la oclusión del objeto por el brazo o cambios de encuadre degradarán el rendimiento. No hay redundancia visual.
- Sensibilidad a la calibración: el estado articular de 6 dimensiones y la correspondencia con el robot físico deben coincidir exactamente con la configuración de entrenamiento.
- Riesgo de alucinación en sentido amplio: como política de imitación, puede ejecutar acciones plausibles pero incorrectas (por ejemplo, mover el brazo hacia una zona vacía) cuando la observación se sale de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no obstante, la ausencia de evaluación hace desaconsejable su uso comercial directo sin validación propia.
- Idiomas: no aplica; no es un modelo de lenguaje. Cualquier expectativa de generación de texto, código o razonamiento es improcedente.
- Sin cuantizaciones publicadas: no hay variantes GGUF/INT8/INT4, lo que limita el despliegue en hardware de muy bajos recursos.
- Repositorio de 4,3 GB: conviene verificar el espacio en disco y el ancho de banda antes de clonar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdonv/act_so101_die_varpos_25_eps
- Dataset de entrenamiento: https://huggingface.co/datasets/drdonv/so101_die_varpos
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=drdonv/so101_die_varpos
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
