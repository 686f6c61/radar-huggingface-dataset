# namiciro/red-blue-act-policy-30k

## Resumen

`namiciro/red-blue-act-policy-30k` es una política de imitación basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705, entrenada y publicada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: colocar un bloque rojo en la caja derecha y un bloque azul en la caja izquierda, a partir de observaciones de una cámara frontal y del estado de las articulaciones del robot. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Se entrenó durante 30.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre el dataset `namiciro/red-to-right-v2`, compuesto por 14 episodios y 6.733 frames a 30 FPS. El robot objetivo es un `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara frontal.

Su relevancia es la de un artefacto reproducible de imitation learning de extremo a extremo: muestra el flujo completo de LeRobot (grabación de datos, entrenamiento de ACT, despliegue con `lerobot-rollout`) sobre una tarea de pick-and-place de dos objetos. No obstante, el autor no ha publicado resultados de evaluación en robot real ni una licencia explícita, y el dataset de entrenamiento es muy pequeño (14 episodios), lo que limita seriamente su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por frame) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo robótico; las tareas se especifican en inglés: "Put the red block in the right box", "Put the blue block in the left box") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (varias acciones futuras de una vez) en lugar de un único paso, lo que reduce el error de compounding y estabiliza el control. La política consume dos entradas: `observation.state` con forma `(6,)` (estado de las articulaciones del `so_follower`) y `observation.images.front` con forma `(3, 480, 640)` (imagen RGB de la cámara frontal). La salida es `action` con forma `(6,)`. La arquitectura combina un encoder visual (típicamente ResNet en ACT) con un transformer encoder-decoder que modela la secuencia de acciones; el chunking se implementa mediante queries de acción aprendidas.

El entrenamiento se realizó con LeRobot 0.7.1 durante 30.000 pasos, batch size 8, AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `namiciro/red-to-right-v2`: 14 episodios, 6.733 frames a 30 FPS, con dos tareas ("Put the red block in the right box" y "Put the blue block in the left box"). No se documenta en la información disponible el número de tokens de entrenamiento (no aplica), la composición detallada del dataset, ni si hubo aumentos de datos, RLHF o DPO (no aplica a imitation learning). Tampoco se especifica la variante exacta de backbone visual ni la longitud del chunk de acciones.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de una imagen frontal de 480x640 y el estado de 6 articulaciones.
- Predicción de chunks de acciones (acción de 6 dimensiones) para tareas de pick-and-place.
- Ejecución de dos tareas concretas: colocar el bloque rojo en la caja derecha y el bloque azul en la caja izquierda.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensa explícita).
- Despliegue en tiempo real mediante `lerobot-rollout` con `--strategy.type=base` (sin grabación de episodios).
- No soporta tool calling, function calling, agentes multi-step, razonamiento textual, matemáticas, visión general, audio ni modo thinking: es una política robótica especializada, no un LLM.
- Capacidades multilingües: no aplica; las instrucciones de tarea se pasan como cadena en inglés.

## Casos de uso

- Pick-and-place de bloques en laboratorio: el modelo ejecuta las dos tareas entrenadas sobre un `so_follower` con cámara frontal, adecuado para reproducir el flujo de LeRobot en un entorno controlado.
- Docencia y formación en imitation learning: sirve como ejemplo completo y reproducible de entrenamiento ACT (30k pasos, dataset pequeño) para cursos de robótica y aprendizaje por imitación.
- Benchmark interno de pipelines de LeRobot: útil para validar la instalación, la calibración del robot y la integración de cámaras antes de entrenar políticas propias con más datos.
- Base para fine-tuning: el checkpoint puede servir de inicialización para tareas similares de manipulación con el mismo robot y cámara, reduciendo el coste de entrenamiento desde cero.
- Pruebas de despliegue en tiempo real: permite medir latencia y throughput de ACT en un `so_follower` con `lerobot-rollout` a 30 FPS, útil para dimensionar hardware de inferencia.
- Investigación sobre sensibilidad a datos: al contar solo con 14 episodios, es un caso de estudio sobre sobreajuste y falta de generalización en políticas visuomotoras.
- Automatización de demostraciones en vídeo: el canal de YouTube asociado muestra el entrenamiento a 30k pasos con un pipeline automatizado de recogida de datos, útil como referencia de workflow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (fp32), los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo RTX 3050, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060/4060/4090, A100, H100) para inferencia en tiempo real; también es viable en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU consumer: sí, con amplio margen; el cuello de botella es la captura de cámara y el control del robot, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles; el sistema opera a 30 FPS según el dataset, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namiciro/red-blue-act-policy-30k` | 51,7 M | Estado (6,) + imagen 3x480x640 | Pick-and-place de dos bloques con `so_follower` | no disponible | Hugging Face (LeRobot) |
| `namiciro/red-to-right-act-policy` | no disponible | Estado + imagen frontal | Tarea de bloque rojo a caja derecha | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | Estado + imágenes | Manipulación con chunks de acción | no disponible | Paper y código de referencia |
| Políticas LeRobot de la comunidad (p. ej. Diffusion Policy, SmolVLA) | variable | Estado + imágenes | Manipulación diversa | variable | Hugging Face (LeRobot) |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este checkpoint ni métricas de éxito que permitan situarlo frente a Diffusion Policy, SmolVLA u otras políticas de LeRobot.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 14 episodios y 6.733 frames, insuficiente para generalizar a posiciones, iluminación o distracciones no vistas.
- Sin evaluación en robot real: el autor no reporta tasa de éxito, por lo que el rendimiento real es desconocido.
- Licencia no especificada ("[More Information Needed]"): no se puede garantizar el uso comercial; hay que contactar con el autor antes de producción.
- Especialización extrema: solo dos tareas y un robot concreto (`so_follower`) con una cámara frontal; no es reutilizable fuera de ese montaje sin reentrenamiento.
- Riesgo de sobreajuste y de fallo ante cambios de cámara, calibración o entorno; la política no tiene mecanismos de recuperación ante errores.
- Sin soporte de lenguaje natural libre: las tareas se pasan como cadenas fijas en inglés.
- No hay información sobre sesgos, robustez ni seguridad física del robot; en producción se requieren límites de par, paradas de emergencia y supervisión humana.
- El repositorio se creó y actualizó el 2026-11-07 con 0 descargas y 0 likes, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/red-blue-act-policy-30k
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Vídeo de entrenamiento a 30k pasos: https://www.youtube.com/watch?v=J-riIG0Yogg
- Política relacionada: https://huggingface.co/namiciro/red-to-right-act-policy
