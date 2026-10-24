# oreocookiedough/my-smolvla

## Resumen

`oreocookiedough/my-smolvla` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica de manipulación. Lo publica el usuario `oreocookiedough` en Hugging Face mediante la librería LeRobot, y está especializado en una única tarea de pick-and-place sobre el brazo robótico SO100: "Pick up the cube and place it in the box.".

El modelo consume observaciones multimodales (estado articular de 6 dimensiones e imágenes de varias cámaras) y produce un vector de acción de 6 dimensiones, lo que lo sitúa en la categoría de políticas de imitación end-to-end para control robótico. Con 450.046.176 parámetros totales (unos 450 M) y un peso de repositorio de 0,9 GB, es lo bastante pequeño como para ejecutarse en hardware de consumo, que es precisamente la propuesta de valor de la familia SmolVLA descrita en el paper 2506.01844.

Es relevante ahora porque demuestra el flujo completo de LeRobot: grabación de dataset, entrenamiento de una política VLA y despliegue en robot real con hardware asequible. No obstante, conviene subrayar que se trata de un checkpoint comunitario de demostración (0 descargas, 0 likes en el momento de la consulta), entrenado con solo 500 pasos sobre 50 episodios y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta; fine-tune de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo publica pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, la política VLA compacta de la familia SmolVLA presentada en el paper arXiv 2506.01844. La model card describe a SmolVLA como un modelo de visión-lenguaje-acción "compacto y eficiente" capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y desplegarse en hardware de consumo. La arquitectura interna detallada (backbone VLM, cabezal de acciones, mecanismo de flow matching u otros) no se especifica en la model card de este checkpoint; para esos detalles hay que remitirse al paper y a la documentación de `lerobot/smolvla_base`.

El ajuste fino se realizó sobre el dataset `lerobot/svla_so100_pickplace`, compuesto por 50 episodios y 19.631 fotogramas grabados a 30 FPS para una única tarea: coger un cubo y dejarlo en una caja. La configuración de entrenamiento reportada es de 500 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot versión 0.6.2. No se documentan detalles sobre datos de preentrenamiento, composición del corpus, ni si hubo RLHF o DPO, por lo que esos aspectos figuran como no disponibles.

## Capacidades

- Manipulación robótica end-to-end: dada una observación (estado articular e imágenes de cámara), predice directamente un vector de acción de 6 dimensiones para el brazo SO100.
- Percepción visual multi-cámara: la model card declara entradas de tipo `observation.images.camera1`, `camera2` y `camera3` a resolución 256×256, además de `observation.images.empty_camera_0` a 480×640.
- Entrada de estado propioceptivo: vector `observation.state` de forma `(6,)`.
- Ejecución de una tarea concreta de pick-and-place ("Pick up the cube and place it in the box.").
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, agentes, visión general o audio; este checkpoint es una política robótica, no un asistente conversacional.

## Casos de uso

- Línea base reproducible para SO100: sirve como referencia de partida para comparar nuevas políticas de pick-and-place sobre el mismo robot y dataset, ya que reproduce una configuración de entrenamiento documentada.
- Punto de partida para fine-tuning: al derivar de `lerobot/smolvla_base` con pesos safetensors, se puede reentrenar con `lerobot-train` sobre datasets propios de manipulación y reutilizar el pipeline.
- Docencia y formación en robótica de imitación: permite a estudiantes ver el ciclo completo (grabación, entrenamiento con LeRobot y despliegue con `lerobot-rollout`) con hardware asequible.
- Validación de infraestructura LeRobot: útil para comprobar que la instalación, la calibración del robot y las cámaras funcionan antes de invertir en datasets mayores.
- Pruebas de despliegue en hardware de consumo: al ocupar ~0,9 GB en pesos, permite ensayar latencia y throughput en GPUs de gama media sin grandes inversiones.
- Investigación en políticas VLA compactas: sirve para estudiar cómo se comporta un modelo de ~450 M en una tarea acotada frente a alternativas de mayor tamaño.
- Demostración de captura de datos: combinado con el visualizador del dataset `lerobot/svla_so100_pickplace`, permite ilustrar el formato LeRobot y las claves de observación esperadas por la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet._" y no reporta tasas de éxito en robot real ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: los 450 M de parámetros ocupan aproximadamente 1,8 GB en FP32 y 0,9 GB en FP16/BF16; con activaciones y codificadores de imagen, el consumo realista se sitúa en el entorno de 2-4 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; se puede citar RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores. En el ámbito profesional, A100 o H100 quedan sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: sí. Con ~0,9 GB en FP16, cabe en tarjetas de 4-6 GB (por ejemplo GTX 1650, RTX 3050), siempre que se ajuste el tamaño de lote.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo sino una política robótica.
- Latencia y throughput: no disponibles. La model card solo indica que el dataset se grabó a 30 FPS, sin reportar latencia de inferencia ni frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| `oreocookiedough/my-smolvla` (este) | ~450 M | Pick-and-place SO100 (fine-tune) | Apache 2.0 | Hugging Face (comunitario) |
| `lerobot/smolvla_base` | ~450 M | VLA base para fine-tuning | Apache 2.0 | Hugging Face |
| OpenVLA | ~7 B (según documentación pública del proyecto) | VLA generalista de manipulación | según proyecto original | Hugging Face / GitHub |
| π0 (pi-zero) | ~3 B (según documentación pública del proyecto) | VLA de control robótico generalista | según proyecto original | Publicación del proyecto |

Nota: los recuentos de parámetros de OpenVLA y π0 provienen de la documentación pública de dichos proyectos y no de la model card de este checkpoint; se incluyen solo como referencia de orden de magnitud. La comparación de rendimiento no es posible porque este fine-tune no publica métricas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenar sobre un dataset muy reducido (50 episodios, una única tarea), la política puede sobreajustarse a posiciones, iluminación y objetos concretos del dataset.
- Riesgo de alucinación en el sentido de acciones impredecibles: al ser una política de imitación, fuera de la distribución de entrenamiento puede generar comandos erráticos o inseguros para el robot.
- Limitación de tarea: solo se ha entrenado para "Pick up the cube and place it in the box."; no se espera que generalice a otras tareas sin reentrenamiento.
- Inconsistencia en la model card: la sección "Model Details" menciona cámaras `top` y `wrist`, mientras que la tabla de entradas lista `camera1`, `camera2`, `camera3` y `empty_camera_0`. Conviene verificar las claves de observación reales antes de desplegar.
- Sin evaluación publicada: no hay tasas de éxito ni comparaciones cuantitativas, por lo que no se puede afirmar su fiabilidad en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero sin garantías; el autor no ofrece soporte ni mantenimiento (0 descargas y 0 likes en el momento de la consulta).
- Idiomas y contexto: no disponibles; este checkpoint no está pensado para procesamiento de lenguaje natural.
- Advertencia de producción: al ser un fine-tune comunitario de demostración, no debería usarse en entornos reales sin una evaluación propia en robot y condiciones controladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oreocookiedough/my-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so100_pickplace
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
