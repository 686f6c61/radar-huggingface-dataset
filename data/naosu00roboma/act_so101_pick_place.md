# naosu00roboma/act_so101_pick_place

## Resumen

`naosu00roboma/act_so101_pick_place` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot manipulador de bajo coste SO-101 (variante `so_follower`). El modelo resuelve una única tarea de manipulación: coger un vial y colocarlo en una gradilla. No es un modelo de lenguaje: consume el estado articular del robot (vector de 6 dimensiones) y una imagen de una cámara frontal de 640x480 a 30 FPS, y produce directamente un vector de acción de 6 dimensiones.

La relevancia del checkpoint es práctica: sirve como ejemplo reproducible y como punto de partida para quien trabaja con el stack LeRobot y el kit SO-101, porque publica la configuración exacta de entrenamiento (20.000 pasos, batch 8, AdamW, lr 1e-5, semilla 1000, LeRobot 0.6.1) y el dataset asociado. Con 51.668.614 parámetros y 0,2 GB de repositorio, es un modelo que se ejecuta sin problema en hardware modesto, incluida CPU, lo que lo hace útil para docencia, prototipado y como baseline en experimentos de imitación.

Ahora bien, se trata de un artefacto personal con 0 descargas y 0 likes, entrenado con solo 10 episodios (17.833 fotogramas, unos 9,9 minutos de demostración) y sin ninguna evaluación publicada. Cualquier uso en producción exige validación propia y, previsiblemente, reentrenamiento con más datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): CVAE con encoder de estilo + backbone transformer + cabeza que predice un chunk de acciones |
| Parametros totales | 51.668.614 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume una observación por paso (estado de 6 dims + imagen 3x480x640) y predice un chunk de acciones |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF ni INT8) |
| Idiomas soportados | no disponible; el modelo no es lingüístico y no está condicionado por instrucciones en lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | 1 cámara frontal (`front`), 640x480, 30 FPS |
| Entrada `observation.state` | STATE, shape (6,) |
| Entrada `observation.images.front` | VISUAL, shape (3, 480, 640) |
| Salida `action` | ACTION, shape (6,) |
| Tarea entrenada | "Pick up the vial and place it in the rack" |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, predice un chunk de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La implementación de LeRobot sigue el esquema original: un encoder de estilo de tipo CVAE (que en entrenamiento recibe la secuencia de acciones objetivo y en inferencia se sustituye por el prior) y un backbone transformer que fusiona el estado articular con las características visuales extraídas por un backbone convolucional. En inferencia se aplica ensamblado temporal de chunks solapados para producir comandos continuos.

El entrenamiento se hizo sobre el dataset `naosu00roboma/so101_pick_place`: 10 episodios, 17.833 fotogramas a 30 FPS (unos 594 segundos de demostración teleoperada, aproximadamente 59 segundos y 1.783 fotogramas por episodio). La configuración publicada es de 20.000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5, lo que equivale a unas 160.000 muestras procesadas, es decir, cerca de 9 pasadas sobre el dataset. No se documenta ninguna fase de RLHF, DPO ni refinamiento por refuerzo: es imitación supervisada pura sobre demostraciones humanas.

No se especifican en la información disponible el número exacto de capas, dimensión del modelo, tamaño del chunk de acciones, número de cámaras previstas en el diseño original ni composición de datos de aumento. Tampoco se detalla si se aplicó aumento de imagen o variación de posiciones iniciales durante la recogida de datos.

## Capacidades

- Manipulación robótica de una sola tarea: coger un vial y depositarlo en una gradilla, con el robot SO-101 en configuración `so_follower`.
- Control visomotor a partir de una única cámara frontal de 640x480 y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones con ensamblado temporal, orientada a movimientos continuos y suaves.
- Ejecución en tiempo real a 30 FPS mediante `lerobot-rollout` (el rendimiento real no está medido ni publicado).
- Reentrenamiento y fine-tuning con el stack LeRobot (`lerobot-train --policy.type=act`) sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto o código.
- No es multilingüe ni procesa lenguaje natural: la cadena de tarea que se pasa al runner sirve para etiquetar episodios, no para condicionar la política.
- No dispone de modo "thinking", visión general, audio ni capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Automatización de una celda de laboratorio concreta: el modelo ejecuta el ciclo coger vial / colocar en gradilla sobre un SO-101 y una cámara frontal, suficiente para tareas repetitivas de transferencia de muestras en un entorno controlado y con objetos siempre iguales.
- Baseline reproducible para investigación en imitación: al publicar hiperparámetros completos y dataset, permite replicar el experimento ACT y medir el efecto de cambios en número de episodios, resolución de cámara o tasa de aprendizaje.
- Punto de partida para fine-tuning con datos propios: sobre el mismo robot y cámara se puede reentrenar con nuevos episodios para otra tarea de pick-and-place, reutilizando el pipeline `lerobot-train` y el formato de observaciones ya definido.
- Docencia y formación en robótica de imitación: con 51,7 M de parámetros y 0,2 GB de pesos, los alumnos pueden inspeccionar el checkpoint, ejecutarlo en CPU y entender el flujo completo teleoperación → dataset → entrenamiento → despliegue.
- Comparación de políticas en un mismo montaje: sirve como referencia ACT frente a alternativas como Diffusion Policy o SmolVLA en el mismo robot, misma cámara y misma tarea, siempre que se reentrene cada política con el mismo dataset.
- Pruebas de infraestructura de despliegue: útil para validar el comando `lerobot-rollout`, la configuración de cámaras OpenCV, los nombres de las claves de observación y la latencia del bucle de control antes de invertir en un modelo mayor.
- Demostración de concepto en ferias o presentaciones: un ciclo de pick-and-place visible y comprensible con hardware de bajo coste, aceptando que la robustez frente a cambios de iluminación o de posición de objeto será limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existe tasa de éxito medida en robot real, ni número de ensayos, ni comparación con otras políticas sobre la misma tarea. Tampoco se reportan métricas de latencia, throughput ni pérdida de entrenamiento final.

| Métrica | Valor |
|---|---|
| Tasa de éxito en robot real | no disponible |
| Número de ensayos de evaluación | no disponible |
| Pérdida final de entrenamiento | no disponible |
| Latencia de inferencia medida | no disponible |
| Throughput a 30 FPS | no disponible |

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 207 MB (51,7 M de parámetros x 4 bytes); en bf16/fp16, unos 103 MB. Sumando activaciones de una imagen 480x640 y el estado de 6 dimensiones, la inferencia debería caber holgadamente por debajo de 1 GB, aunque no hay medición publicada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para un modelo de este tamaño no se necesita hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna e incluso en iGPU recientes; el cuello de botella real será la captura de cámara y el bucle de control, no el modelo.
- CPU: la inferencia en CPU es viable por tamaño, pero no hay datos publicados que confirmen que se sostengan los 30 FPS con el backbone visual incluido; conviene medirlo antes de desplegar.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=naosu00roboma/act_so101_pick_place`, sobre PyTorch y el paquete `lerobot` (versión de referencia 0.6.1). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Requisitos de sistema: puerto serie del robot (`--robot.port`), cámara OpenCV configurada a 640x480 y 30 FPS, y nombres de cámara que coincidan con las claves de observación del entrenamiento (`front`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `naosu00roboma/act_so101_pick_place` | ACT (imitación con chunks de acción) | 51.668.614 | no aplica (observación por paso) | Apache 2.0 | HuggingFace Hub, vía LeRobot |
| ACT (implementación de referencia en LeRobot) | ACT | no disponible | no aplica | no disponible en la información proporcionada | Repositorio LeRobot |
| Diffusion Policy (implementación en LeRobot) | Política generativa por difusión | no disponible | no aplica | no disponible en la información proporcionada | Repositorio LeRobot |
| SmolVLA (familia VLA de LeRobot) | VLA con condicionamiento por lenguaje | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace Hub |

La comparación cuantitativa no es posible con los datos disponibles: no hay tasas de éxito ni métricas comunes publicadas para este checkpoint. En términos cualitativos, ACT destaca por su simplicidad y bajo coste computacional frente a políticas de difusión, que suelen requerir más pasos de inferencia, y frente a modelos VLA, que aportan condicionamiento por lenguaje a cambio de uno o dos órdenes de magnitud más de parámetros. Cualquier comparación rigurosa exigiría reentrenar las alternativas con el mismo dataset `so101_pick_place` y evaluarlas con el mismo protocolo.

## Limitaciones y advertencias

- Dataset mínimo: 10 episodios y 17.833 fotogramas (unos 9,9 minutos) son insuficientes para una generalización robusta; es esperable sobreajuste a posiciones, iluminación y apariencia concretas del montaje de grabación.
- Sin evaluación publicada: no se puede afirmar ninguna tasa de éxito. La propia model card deja la tabla de evaluación vacía.
- Dependencia estricta del hardware y del montaje: robot `so_follower`, una cámara llamada `front` a 640x480 y 30 FPS. Cambiar la cámara, su posición, la resolución o el robot degrada o invalida la política.
- No condicionado por lenguaje: la cadena `--task` no modifica el comportamiento; no se puede pedir otra tarea por prompt.
- Fallos silenciosos: al no ser un modelo generativo de texto, no "alucina" en el sentido habitual, pero puede producir trayectorias erróneas sin señal de incertidumbre, con riesgo de colisión o de dañar objetos.
- Ausencia de mecanismos de seguridad: el checkpoint no incorpora parada por fuerza, detección de colisión ni límites articulares; estos deben implementarse en el controlador del robot.
- Sesgos: no evaluados ni documentados. Al provenir de demostraciones de un único operador, la política hereda sus sesgos motores y su estilo de ejecución.
- Licencia Apache 2.0 en los pesos, que permite uso comercial y modificación con atribución; la licencia del dataset `naosu00roboma/so101_pick_place` no se detalla en la información disponible y debe verificarse por separado antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación de la comunidad ni demo en vídeo.
- Reproducibilidad: se publican los hiperparámetros y la semilla, pero no el estado del entorno completo ni el hardware exacto de entrenamiento, lo que puede impedir una réplica bit a bit.
- Los resultados de la búsqueda web realizada no contienen información técnica sobre este modelo; no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/naosu00roboma/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/naosu00roboma/so101_pick_place
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=naosu00roboma/so101_pick_place
