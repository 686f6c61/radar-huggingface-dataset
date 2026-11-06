# hyelyn78/act_so101_tube_plate

## Resumen

`hyelyn78/act_so101_tube_plate` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario hyelyn78 y se distribuye a través de Hugging Face Hub con la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: coger un tubo y colocarlo sobre un plato, sobre un robot SO-101 de tipo `so_follower` con dos cámaras (vista superior y muñeca).

ACT es una arquitectura de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación de precisión. El modelo consume el estado articular de 6 dimensiones y dos flujos de imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones a 30 FPS.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es una política ligera y desplegable en hardware de consumo. No obstante, se trata de un modelo altamente especializado: no es un modelo de lenguaje ni un modelo generalista, sino un controlador entrenado sobre un único dataset de 50 episodios y una sola tarea. Su relevancia radica en servir como ejemplo reproducible de entrenamiento de políticas con LeRobot y como base para experimentación en robótica de imitación de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que combina un encoder visual (procesa las dos cámaras de 3x480x640) con un encoder de estado y un decodificador que genera secuencias de acciones (action chunks). La innovación principal del método es predecir un bloque de acciones futuras en lugar de una sola acción por paso, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite un control más suave. El modelo está condicionado por el estado de 6 articulaciones y produce acciones de 6 dimensiones.

El entrenamiento se realizó sobre el dataset `hyelyn78/so101_tube_plate_clean`, compuesto por 50 episodios y 16.847 frames a 30 FPS, todos correspondientes a la tarea "Pick the tube and place it on the plate". La configuración reportada incluye 50.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado a partir de demostraciones de teleoperación. No se especifica el número de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Manipulación robótica de una tarea concreta: coger un tubo y colocarlo sobre un plato.
- Entrada multimodal: estado articular de 6 dimensiones más dos imágenes RGB de 480x640 (cámara superior y de muñeca).
- Salida de acciones de 6 dimensiones a 30 FPS para el robot SO-101 (`so_follower`).
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Predicción de action chunks para control más estable.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión general, audio ni thinking mode.
- No es un agente conversacional; su función es puramente de control motor.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia de coger el tubo y depositarlo en el plato sobre un SO-101, adecuado para demostraciones de laboratorio o prototipos de línea de montaje de bajo coste.
- Reproducción de experimentos de imitación: sirve como referencia reproducible para validar pipelines de LeRobot con la configuración exacta reportada (50.000 pasos, batch 8, lr 1e-05).
- Base para fine-tuning en tareas similares: al ser una política ligera (51,7 M de parámetros), se puede reentrenar con nuevos datasets de manipulación de objetos pequeños.
- Docencia y formación en robótica: ejemplo completo de entrenamiento y despliegue con LeRobot, con comandos `lerobot-train` y `lerobot-rollout` documentados.
- Evaluación de hardware SO-101: permite probar la cadena cinemática, la calibración de cámaras y la latencia de control en un robot de bajo coste.
- Benchmark interno de políticas ACT: útil como línea base para comparar variantes de arquitectura o de aumento de datos en tareas de manipulación de precisión.
- Pruebas de integración con `lerobot-rollout`: validación del pipeline de inferencia con `--strategy.type=base` y `--duration` en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso de los tensores ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, asumiendo memoria adicional para las dos imágenes de 480x640 y el estado.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real es la latencia de las cámaras y del bus del robot, no el cómputo del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--strategy.type=base`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se reportan medidas de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hyelyn78/act_so101_tube_plate` | 51,7 M | no aplica | Pick tube and place on plate (SO-101) | no disponible | Hugging Face Hub |
| ACT (paper original, arXiv:2304.13705) | no disponible en la información | no aplica | Manipulación general con action chunks | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible | no aplica | Manipulación robótica diversa | no disponible | Hugging Face Hub / LeRobot |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo ha sido entrenado para la tarea "Pick the tube and place it on the plate" con un robot SO-101 y una configuración de cámaras concreta (`top` y `wrist`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su tasa de acierto y robustez ante variaciones de posición, iluminación o distracciones.
- Dataset pequeño: 50 episodios y 16.847 frames son una base limitada; el riesgo de sobreajuste y de baja generalización es alto.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede garantizar el uso comercial sin consultar al autor.
- Dependencia de hardware y calibración: el rendimiento depende de la calibración del robot, de los índices y nombres de cámara, y del puerto serie; pequeñas desviaciones pueden degradar la política.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no admite tool calling, agentes ni instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas o inseguras si el estado observado se sale de la distribución de entrenamiento.
- Idiomas no disponibles: no es un modelo lingüístico; la ausencia de metadatos de idioma no implica soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyelyn78/act_so101_tube_plate
- Dataset de entrenamiento: https://huggingface.co/datasets/hyelyn78/so101_tube_plate_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hyelyn78/so101_tube_plate_clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
