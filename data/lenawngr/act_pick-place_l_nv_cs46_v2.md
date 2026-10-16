# lenawngr/ACT_pick-place_L_nv_cs46_v2

## Resumen

ACT_pick-place_L_nv_cs46_v2 es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario lenawngr y se ha entrenado y subido al Hub mediante LeRobot, la librería de aprendizaje robótico de Hugging Face. Está especializado en una tarea concreta de pick-and-place sobre el brazo SO-101, a partir del dataset lenawngr/pick-place_so101.

No es un modelo de lenguaje: se trata de un transformer encoder-decoder con estructura CVAE que consume observaciones visuales y el estado de las articulaciones y produce comandos de acción para el robot. Con 51.613.318 parámetros (unos 51,6 millones) y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en el propio robot o en hardware de borde.

El modelo sigue el paper ACT (arXiv:2304.13705, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware") y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de manipulación de bajo coste con LeRobot, aunque su alcance queda restringido a la tarea de pick-and-place para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.613.318 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de lenguaje; procesa secuencias de observaciones y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lenawngr/pick-place_so101 |
| Tamano del repositorio | 0,2 GB |
| Entidad de despliegue prevista | Brazo SO-101 (seguidor) |

## Arquitectura y entrenamiento

ACT es una política de aprendizaje por imitación (behavior cloning) con arquitectura transformer de tipo encoder-decoder y un componente CVAE. El modelo consume observaciones (imágenes de cámara y estado de las articulaciones) y genera los parámetros de una distribución sobre chunks de acciones, es decir, secuencias de posiciones objetivo para varios pasos futuros en lugar de una única acción. Este enfoque de predicción por chunks reduce el error de composición y mejora la estabilidad frente al control paso a paso. La parte CVAE captura la variabilidad de las demostraciones cuando una misma observación admite varias acciones válidas.

El entrenamiento se realiza sobre el dataset lenawngr/pick-place_so101, compuesto por teleoperaciones de la tarea de pick-and-place sobre el brazo SO-101. No se dispone de información detallada sobre el número exacto de episodios, la composición del dataset ni sobre el uso de técnicas de refinamiento posteriores (RLHF/DPO no aplican en este contexto). Tampoco se detallan en la información proporcionada innovaciones adicionales más allá de las propias del método ACT. La formación y la publicación en el Hub se han efectuado con las herramientas de LeRobot (`lerobot-train`).

## Capacidades

- Manipulación robótica por imitación: genera chunks de acciones para ejecutar tareas de pick-and-place sobre el brazo SO-101.
- Entrada multimodal: procesa observaciones visuales (cámaras) y el estado de las articulaciones del robot.
- Control de brazo robótico de bajo coste: diseñado para hardware tipo SO-101 (familia SO-100/SO-101).
- Predicción de secuencias de acciones (action chunking), no de pasos individuales.
- Aprendizaje de múltiples modos de actuación gracias al componente CVAE.
- No soporta tool calling ni function calling (no aplica).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM (no aplica).
- No tiene capacidades multilingües ni de generación de texto (no aplica).
- No incorpora modo de razonamiento explícito (thinking mode), visión general ni audio.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recogida y colocación de piezas sobre el brazo SO-101, sustituyendo la teleoperación manual por control autónomo tras el entrenamiento con demostraciones.
- Prototipado rápido de políticas de manipulación: al entrenarse y desplegarse con LeRobot, sirve como plantilla para validar un pipeline completo de imitación (grabación de datos, entrenamiento, evaluación) en laboratorios y entornos educativos.
- Investigación en aprendizaje por imitación: punto de partida reproducible para comparar variantes de ACT, ajustar hiperparámetros o estudiar la transferencia entre tareas de manipulación.
- Docencia y robótica educativa: con 51,6 M de parámetros y 0,2 GB de pesos, el modelo se puede ejecutar en equipos asequibles, lo que facilita prácticas de aprendizaje robótico sin infraestructura cara.
- Despliegue en hardware de borde: su tamaño reducido permite ejecutar la inferencia en el ordenador que acompaña al robot (por ejemplo, un mini-PC o una Jetson), sin necesidad de GPU de centro de datos.
- Base para ajuste fino en tareas afines: puede servir como inicialización para entrenar políticas de manipulación similares en el mismo robot o con variaciones del dataset de recogida y colocación.
- Evaluación comparativa de políticas: útil como referencia de una política ACT entrenada sobre un dataset propio para medir tasas de éxito frente a otros métodos (por ejemplo, difusión de políticas) en el mismo montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,6 M de parámetros, los pesos ocupan aproximadamente 0,2 GB en precisión fp32 y unos 0,1 GB en fp16; la memoria adicional depende del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: prácticamente cualquier GPU moderna es suficiente. No requiere A100 ni H100; una NVIDIA RTX 3060/4090 o incluso una GPU integrada o una NVIDIA Jetson (Orin Nano, Orin NX) cubren el despliegue.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo reciente e incluso en CPU para inferencia de baja frecuencia de control.
- Opciones de despliegue: LeRobot para entrenamiento e inferencia (`lerobot-train`, `lerobot-record`); el formato safetensors es compatible con el ecosistema PyTorch. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponible en la información proporcionada. Dependerán del hardware y de la frecuencia de control requerida por la tarea.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_L_nv_cs46_v2 | ACT (imitación, manipulación) | 51,6 M | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de LeRobot | ACT (imitación, manipulación) | variable (orden decenas de M) | no aplica | segun autor | Hugging Face (LeRobot) |
| Políticas de difusión (Diffusion Policy) | Imitación por difusión | variable | no aplica | segun implementación | Repositorios académicos / LeRobot |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Alcance restringido: es una política específica para la tarea de pick-and-place sobre el brazo SO-101 con el dataset lenawngr/pick-place_so101; no es un modelo general de manipulación ni de propósito general.
- Generalización limitada: el rendimiento fuera de la distribución de las demostraciones (posiciones, iluminación, objetos distintos) puede degradarse, como es habitual en aprendizaje por imitación.
- Sin datos de evaluación publicados: no hay tasas de éxito ni métricas que permitan estimar su fiabilidad en producción.
- Riesgo de fallo en manipulación: en robótica física, un fallo de la política puede provocar colisiones o daños; se recomienda supervisión y límites de seguridad.
- Idiomas: no aplica, ya que el modelo no procesa ni genera lenguaje.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda los sesgos de las demostraciones de teleoperación (condiciones, objetos y entorno concretos).
- Licencia: Apache 2.0 permite uso comercial y modificación, manteniendo el aviso de licencia y atribución; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Fechas del repositorio: creado y actualizado el 2026-10-16 según los metadatos; conviene verificar el estado actual del repositorio.
- Metadatos incompletos: sin descargas ni "likes", sin idiomas y con información de entrenamiento escasa, lo que dificulta auditar su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_cs46_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
