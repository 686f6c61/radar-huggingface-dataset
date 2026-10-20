# ehsanranjbari/act_so101_white_box_v2

## Resumen
`ehsanranjbari/act_so101_white_box_v2` es una política robótica de aprendizaje por imitación, no un modelo de lenguaje. Implementa ACT (Action Chunking with Transformers), un método que predice secuencias cortas de acciones en lugar de pasos individuales, y ha sido entrenada con LeRobot para el robot `so_follower` con una única cámara frontal.

El modelo resuelve una tarea concreta de manipulación: recoger una caja blanca y colocarla en una bandeja. Su entrada es el estado articular de 6 dimensiones y una imagen RGB de 480x640; su salida es una acción de 6 dimensiones. Cuenta con 51.668.614 parámetros y no define una ventana de contexto textual.

Es relevante como ejemplo reproducible de ACT sobre hardware SO-101 de bajo coste y como punto de partida para reentrenar políticas similares con LeRobot. No obstante, no tiene licencia declarada, no incluye evaluación publicada y está limitado a la tarea y configuración de cámara con las que fue entrenado.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer |
| Parámetros totales | 51.668.614 (dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (política robótica sin contexto textual) |
| Tipos de cuantización | no disponible; pesos publicados en safetensors, sin cuantizaciones documentadas |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (una cámara frontal) |
| Entrada de observación | `observation.state` `(6,)`; `observation.images.front` `(3, 480, 640)` |
| Salida de acción | `action` `(6,)` |
| Tarea entrenada | "Pick up the white box and place it in the tray" |
| Dataset | `ehsanranjbari/so101_white_box`: 40 episodios, 26.912 frames, 30 FPS |
| Librería | LeRobot 0.6.2 |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación que aprende de datos teleoperados y predice chunks de acciones, lo que reduce la acumulación de errores frente a políticas que emiten una acción por paso. La política consume el estado de 6 dimensiones y una imagen frontal de 480x640, y produce una acción de 6 dimensiones. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud exacta del chunk ni la composición del encoder visual.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 40 episodios y 26.912 frames a 30 FPS, todos ellos de la tarea "Pick up the white box and place it in the tray". No se documenta RLHF, DPO ni preentrenamiento a gran escala; el aprendizaje es supervisado por imitación sobre el dataset indicado. Tampoco se especifica si se partió de un backbone visual preentrenado.

| Ajuste de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 30.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Capacidades
- Control de manipulación robótica de 6 dimensiones a partir de estado articular e imagen RGB frontal.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones para tareas de pick-and-place.
- Ejecución integrada en LeRobot mediante `lerobot-rollout`.
- Procesamiento de imágenes de 480x640 con una única cámara frontal.
- Entrenamiento reproducible con la configuración documentada: 30.000 pasos, batch 8, AdamW y LR 1e-5.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de código, matemáticas, audio o visión general.
- No dispone de modo thinking ni de mecanismos de razonamiento explícito.

## Casos de uso
- Automatización de pick-and-place en una celda SO-101: el modelo ejecuta la tarea entrenada de recoger la caja blanca y depositarla en la bandeja, siempre que el robot, la cámara y la disposición de los objetos coincidan con los del dataset.
- Prototipado de imitación de bajo coste: sirve como baseline para probar el flujo teleoperación, grabación, entrenamiento y rollout con LeRobot antes de invertir en datasets mayores.
- Docencia y demostración técnica: permite mostrar de forma completa el pipeline de ACT con un robot SO-101, una cámara frontal y un dataset pequeño de 40 episodios.
- Evaluación interna de robustez: puede probarse con distintas posiciones de la caja, cambios de iluminación o distractores, midiendo la tasa de éxito antes de considerar su uso en una celda real.
- Recolección activa de datos: los fallos observados en rollout pueden usarse para añadir episodios con nuevas posiciones y reentrenar la política.
- Comparación de políticas robóticas: útil como referencia ACT frente a otras políticas entrenadas para SO-101, siempre que se evalúen con el mismo protocolo y hardware.
- Prueba de concepto en laboratorio: permite validar latencia, calibración de cámara y seguridad de movimiento en una instalación controlada antes de escalar a producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasa de éxito, número de ensayos, latencia de inferencia ni métricas de robustez.

## Requisitos de hardware
- VRAM estimada: solo pesos, aproximadamente 197 MiB en FP32 y 99 MiB en FP16. Con activaciones y preprocesamiento de imagen, una estimación conservadora para batch 1 es de 1-2 GB de VRAM; no hay medición oficial.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB es suficiente en principio. Una RTX 3060, RTX 4060 o RTX 4090 puede ejecutar la política; A100 o H100 son innecesarias para este tamaño, pero también compatibles.
- CPU: es posible ejecutar la inferencia en CPU, aunque no se recomienda para control en tiempo real sin medir latencia.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 4 GB o más; no hay requisito oficial publicado.
- Despliegue: LeRobot con `lerobot-rollout` sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero eso no implica que la política infiera a 30 FPS; debe medirse en el hardware objetivo.
- Almacenamiento: el repositorio ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ehsanranjbari/act_so101_white_box_v2` | 51.668.614 | no aplica | Pick up white box, SO-101, 1 cámara | no disponible | Hugging Face |
| `AnikaTriesStuff/act-so101-white-box` | no disponible | no aplica | ACT para SO-101; detalles no disponibles | no disponible | Hugging Face |
| `jian001/act_so101_test_model` | no disponible | no aplica | ACT para SO-101; detalles no disponibles | no disponible | Hugging Face |
| `gorudov/act_so101_white_brick_two_camera_60k_a100` | no disponible | no aplica | White brick, 2 cámaras, 60k pasos y A100 según el nombre | no disponible | Hugging Face / indexado |

No se dispone de datos de rendimiento, evaluación o licencia de las alternativas en la información proporcionada. La comparación es únicamente por familia de método, robot objetivo y disponibilidad; no permite establecer superioridad técnica.

## Limitaciones y advertencias
- La licencia no está declarada, por lo que el uso comercial es incierto y requiere contacto con el autor.
- No hay evaluación publicada: se desconoce la tasa de éxito real en el robot, con nuevas posiciones o con cambios de iluminación.
- Está entrenada para una única tarea, un único robot `so_follower` y una única cámara frontal; no es una política generalista.
- El dataset es pequeño: 40 episodios y 26.912 frames, lo que limita la diversidad de posiciones, texturas y condiciones.
- La interfaz exige estado de 6 dimensiones y acción de 6 dimensiones; cualquier discrepancia con el robot o la calibración puede invalidar la ejecución.
- No se documenta memoria temporal ni uso de historial; la entrada declarada es estado actual más imagen frontal.
- No se ha analizado sesgo del dataset ni de las demostraciones; el comportamiento hereda los sesgos del operador y del entorno de grabación.
- La alucinación textual no aplica, pero sí existen fallos de política: acciones incorrectas, agarres fallidos o colisiones.
- Es obligatorio usar parada de emergencia, límites de workspace y supervisión humana durante las pruebas.
- El repo tiene 0 descargas y 0 likes en el momento de la información, por lo que no hay validación comunitaria publicada.
- No debe asumirse que el modelo funciona en producción sin una evaluación propia con el hardware y la celda final.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ehsanranjbari/act_so101_white_box_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ehsanranjbari/so101_white_box)
- [Paper de ACT en Hugging Face
