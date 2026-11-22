# kiyu705/act_so101_pick_place

## Resumen

`kiyu705/act_so101_pick_place` es una política de imitación para robótica real entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un robot SO-101 (6 dimensiones) y dos cámaras RGB de 480x640 (frontal y de muñeca), predice directamente comandos de acción de 6 dimensiones. El modelo resuelve una única tarea física: coger una bobina de cinta y colocarla sobre una base verde.

El interés técnico está en que ejemplifica el flujo completo de imitación end-to-end con hardware de bajo coste: 50 episodios teleoperados, 30.430 fotogramas a 30 FPS y 100.000 pasos de entrenamiento con AdamW a un learning rate de 1e-5. Con 51,67 millones de parámetros y un repositorio de 0,2 GB, es un artefacto ligero que cabe en cualquier GPU consumer y sirve como referencia reproducible para quien quiera entrenar sus propias políticas ACT con LeRobot 0.7.0.

La relevancia ahora es doble: por un lado, ACT sigue siendo una línea base sólida y barata para manipulación con action chunking; por otro, el modelo no aporta evaluación real en el robot, ni licencia declarada, ni resultados de benchmarks, lo que lo convierte en un ejemplo de publicación temprana más que en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control; ventana de observación por paso, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; la tarea se especifica con una instrucción textual fija en inglés) |
| Licencia | No disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Dataset de entrenamiento | `kiyu705/so101_pick_place_20261122_164334` (50 episodios, 30.430 fotogramas, 30 FPS) |
| Tarea | "Grab the tape reel and put it on the green board" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras de una sola vez. La arquitectura combina un codificador de imágenes (procesa las dos vistas de 480x640), un codificador del estado articular de 6 dimensiones y un transformer que fusiona ambas modalidades para emitir secuencias de acciones de 6 dimensiones. El chunking reduce el error de compounding y suaviza el control, y es la razón por la que ACT logra tasas de éxito altas con datasets pequeños en manipulación real.

El entrenamiento se realizó sobre 50 episodios teleoperados (30.430 fotogramas a 30 FPS) de la tarea de recoger la bobina de cinta y dejarla en la base verde, con 100.000 pasos, batch de 8, AdamW y learning rate de 1e-5, semilla 1000 y LeRobot 0.7.0. La model card no documenta aumentos de datos, composición del dataset más allá del recuento de episodios, ni fases de RLHF/DPO (no aplicables a imitación supervisada). Tampoco se detalla la inicialización del codificador visual ni la dimensión del chunk de acciones, datos que no están disponibles en la información proporcionada.

## Capacidades

- Control visomotor de manipulación: predice acciones de 6 grados de libertad a partir de estado articular y dos cámaras.
- Ejecución de una tarea concreta de pick-and-place: coger una bobina de cinta y colocarla sobre una base verde.
- Política de imitación entrenada con action chunking, lo que produce trayectorias más suaves que el control paso a paso.
- Integración nativa con LeRobot: ejecutable con `lerobot-rollout` y reentrenable con `lerobot-train`.
- Entrada multimodal: estado propioceptivo (6,) más dos flujos visuales RGB de 480x640.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea pick-and-place en un SO-101: ejecutar la política con `lerobot-rollout --policy.path=kiyu705/act_so101_pick_place` sobre el robot calibrado para automatizar el traslado de la bobina a la base verde.
- Línea base para comparar métodos de imitación: usar esta política ACT como referencia al evaluar variantes como Diffusion Policy o VQ-BeT sobre el mismo dataset y robot.
- Plantilla de entrenamiento con LeRobot: reutilizar la configuración (100.000 pasos, batch 8, AdamW, lr 1e-5) como punto de partida para entrenar políticas en tareas propias con `lerobot-train --policy.type=act`.
- Docencia y prototipado en robótica de bajo coste: el tamaño de 51,67 M de parámetros y el repositorio de 0,2 GB permiten iterar en un portátil con GPU consumer sin infraestructura dedicada.
- Validación de pipelines de datos teleoperados: comprobar que un dataset de 50 episodios y 30 FPS es suficiente para una tarea de manipulación simple antes de escalar la recogida de datos.
- Pruebas de integración de hardware: verificar la calibración de cámaras `front` y `wrist` y del bus del SO-101 comparando el comportamiento de la política con el esperado en la tarea.
- Investigación en robustez visual: evaluar cómo degrada la política ante cambios de iluminación, posiciones de objeto o distracciones, ya que la model card no reporta estas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real, número de ensayos ni condiciones de dificultad documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos, aunque el consumo real depende de los buffers de las dos imágenes de 480x640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060/4060 o superior es más que adecuada. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4-8 GB de VRAM; no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput estimados: no disponibles. La política está pensada para control a 30 FPS (periodo de 33 ms), pero no se publican mediciones de latencia de inferencia ni de frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiyu705/act_so101_pick_place` | ACT (LeRobot) | 51,67 M | Estado (6,) + 2 imágenes 480x640 | No disponible | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | ACT (LeRobot) | Variable | Variable según robot y cámaras | Variable | Hugging Face Hub |
| Diffusion Policy (referencia metodológica) | Política por difusión | No disponible en esta ficha | Estado + imágenes | No disponible | Repositorios de investigación |
| VQ-BeT (referencia metodológica) | Política con tokenización de acciones | No disponible en esta ficha | Estado + imágenes | No disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de dificultad, por lo que no se puede afirmar su fiabilidad.
- Especialización extrema: la política está entrenada para una única tarea ("Grab the tape reel and put it on the green board") y un único robot (`so_follower`); no generaliza a otros objetos, posiciones o morfologías sin reentrenamiento.
- Dependencia de calibración: las cámaras deben llamarse exactamente `front` y `wrist` y estar calibradas; cualquier cambio de montaje o índice de cámara degrada el comportamiento.
- Dataset pequeño: 50 episodios y 30.430 fotogramas implican poca diversidad; es probable que la política sea sensible a iluminación, fondos y posiciones de objeto no vistas.
- Licencia no declarada: la model card indica "More Information Needed", lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación en sentido amplio: como política de imitación, puede generar acciones plausibles pero incorrectas (por ejemplo, agarrar el aire o colisionar) cuando la observación se sale de la distribución de entrenamiento.
- Sin soporte multilingüe ni de texto: la instrucción de tarea es una cadena fija en inglés; no procesa lenguaje natural libre.
- Publicación temprana: creada y actualizada el mismo día (22 de noviembre de 2026), con 0 descargas y 0 likes; no hay evidencia de uso externo ni validación por terceros.
- Sin datos de cuantización ni de latencia: no se puede planificar un despliegue en tiempo real estricto a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiyu705/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/kiyu705/so101_pick_place_20261122_164334
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kiyu705/so101_pick_place_20261122_164334
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
