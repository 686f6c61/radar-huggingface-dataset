# Ggghoney/pick_and_place_act_30ft

## Resumen

`Ggghoney/pick_and_place_act_30ft` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está especializado en una única tarea de manipulación: coger un bolígrafo rojo y colocarlo en un estuche.

Se trata de un fine-tune del checkpoint `Ggghoney/pick_and_place_act_kaggle`, entrenado sobre el dataset `Ggghoney/pick_and_place_80` (80 episodios, 64.152 fotogramas a 30 FPS). El modelo consume el estado del robot (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (frontal y superior), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en safetensors, es un modelo compacto orientado a inferencia en el propio robot.

Su relevancia es acotada: no es un modelo de propósito general, sino una política de imitación específica para un robot `omx_follower` y una tarea concreta. Resulta útil como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para fine-tuning en tareas similares de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural como entrada) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | omx_follower |
| Camaras | front, top (480x640, 3 canales) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Dataset de entrenamiento | Ggghoney/pick_and_place_80 (80 episodios, 64.152 frames, 30 FPS) |
| Modelo base | Ggghoney/pick_and_place_act_kaggle |
| Tarea | "Pick up the red pen and place it in the pencil case" |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (típicamente ResNet) y un decoder que predice chunks de acciones de longitud fija en lugar de acciones individuales. Esta predicción por chunks reduce el error de compounding y suaviza la ejecución, lo que se traduce en tasas de éxito más altas en tareas de manipulación con datos de teleoperación. El modelo incluye una cabeza de estilo CVAE que modela la variabilidad de las trayectorias humanas durante el entrenamiento.

El entrenamiento se realizó con LeRobot 0.6.2 durante 15.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, partiendo del checkpoint `pick_and_place_act_kaggle`. El dataset contiene 80 episodios teleoperados (64.152 fotogramas a 30 FPS) de una única tarea sobre un robot `omx_follower` con dos cámaras. No se especifica en la información disponible la composición exacta del dataset, aumentos de datos ni si hubo etapas de RLHF o DPO (no aplicables en este paradigma).

## Capacidades

- Manipulación robótica de pick-and-place: coger un bolígrafo rojo y depositarlo en un estuche, a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acción de 6 dimensiones a partir de dos vistas RGB (frontal y superior) y un vector de estado de 6 dimensiones.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`, sin grabación de episodios.
- Fine-tuning sobre el mismo modelo base para nuevas tareas o datasets mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingües, de visión general, audio ni modo thinking.

## Casos de uso

- Automatización de una celda de pick-and-place concreta: desplegar la política en un robot `omx_follower` para recoger un bolígrafo rojo y colocarlo en un estuche, usando `lerobot-rollout` con las cámaras frontal y superior calibradas.
- Base para fine-tuning en tareas de recogida y colocación: partir de este checkpoint y entrenar con un dataset propio (por ejemplo, otros objetos o contenedores) usando `lerobot-train` y `--policy.path=Ggghoney/pick_and_place_act_kaggle`.
- Reproducción de experimentos de aprendizaje por imitación: usar el par modelo+dataset como referencia para validar pipelines de LeRobot, calibración de cámaras y flujo de entrenamiento ACT.
- Docencia y formación en robótica: ejemplo compacto (51,7 M de parámetros, 0,2 GB) para explicar ACT, chunking de acciones y teleoperación con LeRobot.
- Pruebas de integración hardware-software: validar la cadena completa robot-cámaras-política en un `omx_follower` antes de escalar a tareas más complejas.
- Benchmark interno de políticas de imitación: servir como línea base específica de tarea para comparar con otras políticas entrenadas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, ~0,2 GB en safetensors), la inferencia en FP32 requeriría aproximadamente 0,2 GB para los pesos, más memoria para activaciones y buffers de las cámaras (2 x 480x640x3).
- GPU recomendadas: no disponible; el modelo es lo suficientemente pequeño como para ejecutarse en GPUs consumer, aunque la model card no especifica requisitos.
- Cabe en GPU consumer: sí, por tamaño del modelo; no se especifican modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; entrenamiento con `lerobot-train` y `--policy.device=cuda`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ggghoney/pick_and_place_act_30ft | 51.668.614 | no aplica | Pick-and-place de bolígrafo en estuche (omx_follower) | no disponible | Hugging Face |
| Ggghoney/pick_and_place_act_kaggle (modelo base) | no disponible | no aplica | Pick-and-place (fine-tune previo) | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | no aplica | Tareas de manipulación diversas | variable | Hugging Face |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, Diffusion Policy o VQ-BeT) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea ("Pick up the red pen and place it in the pencil case") y un único tipo de robot (`omx_follower`); no generaliza a otras tareas, objetos o robots sin fine-tuning.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia de la configuración de cámaras: los nombres de cámara (`front`, `top`) y sus resoluciones (480x640, 30 FPS) deben coincidir exactamente con los usados en entrenamiento; cualquier cambio requiere recalibración o reentrenamiento.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede garantizar el uso comercial sin consultar al autor.
- Dataset pequeño (80 episodios, 64.152 fotogramas): riesgo de sobreajuste y baja robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no es adecuado para tareas cognitivas o de conversación.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede ejecutar trayectorias plausibles pero erróneas ante observaciones fuera de distribución.
- Sin información sobre sesgos: no disponible; el modelo no procesa datos personales ni texto, pero hereda los sesgos de la distribución de demostraciones humanas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act_30ft
- Modelo base: https://huggingface.co/Ggghoney/pick_and_place_act_kaggle
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place_80
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place_80
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
