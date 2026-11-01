# SathyarajMedipalli/so101_smolvla_base_object_pnp_v1_with_task010_ND

## Resumen

SO101 SmolVLA Base Object PnP v1 es una política de visión-lenguaje-acción (VLA) ajustada mediante aprendizaje por imitación para controlar un robot manipulador de tipo `so_follower` (SO-101). Parte del modelo base `lerobot/smolvla_base` y ha sido entrenada con el framework LeRobot sobre un conjunto de 10 episodios y 2688 fotogramas a 30 FPS para la tarea concreta de recoger un objeto ("Pickup object"). El autor es SathyarajMedipalli y la publicación es de octubre de 2026.

SmolVLA es una arquitectura compacta de tipo VLA presentada en el artículo arXiv 2506.01844, diseñada para reducir el coste computacional y permitir el despliegue en hardware de consumo manteniendo un rendimiento competitivo frente a modelos VLA de mayor tamaño. Esta ficha concreta no es un modelo de propósito general, sino un checkpoint especializado: recibe el estado articular del robot y varias señales visuales, y emite un vector de acción de 6 dimensiones.

Su relevancia práctica es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de robótica open source con LeRobot: grabación de datos, entrenamiento de una política VLA y despliegue en un robot físico. Con 450 millones de parámetros y licencia Apache 2.0, sirve como referencia para quien quiera replicar o adaptar el pipeline a su propio robot y tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre transformer multimodal |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 0,9 GB) |
| Idiomas soportados | no disponible (modelo orientado a acciones, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version de entrenamiento 0.6.2) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower (SO-101) |
| Camaras | gripper_camera, overview_camera |
| Entrada observation.state | tensor de forma (6,) |
| Entradas visuales | camera1, camera2, camera3 en (3, 256, 256); empty_camera_0 en (3, 480, 640) |
| Salida action | tensor de forma (6,) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, una política VLA compacta que combina un codificador visual, un componente de lenguaje y un cabezal de acciones que mapea observaciones multimodales a comandos motores de 6 dimensiones. La política consume el estado articular del robot (`observation.state`, 6 valores) junto con cuatro flujos de imagen (tres cámaras a 256x256 y una cuarta a 480x640) y produce directamente el vector de acción. No se dispone de detalles adicionales sobre la composición interna del backbone en la información proporcionada.

El entrenamiento se realizó con LeRobot 0.6.2 durante 5000 pasos, con tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, sobre el dataset `SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504` (10 episodios, 2688 fotogramas, 30 FPS, tarea "Pickup object"). Es un ajuste por imitación supervisada sobre demostraciones; no se indica en la información disponible que se hayan aplicado etapas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal mediante varias cámaras simultáneas (hasta cuatro flujos de imagen declarados en las entradas).
- Ejecución de una tarea de manipulación concreta: recoger un objeto ("Pickup object").
- Control de política en bucle cerrado durante la ejecución en robot real mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni diálogo multilingüe; el modelo no es un LLM conversacional.
- No se documentan modos especiales (thinking mode, audio, visión general fuera del contexto robótico).

## Casos de uso

- Replicación del pipeline de imitación en robótica: usar este checkpoint como referencia para validar la instalación de LeRobot, la calibración del SO-101 y el flujo `lerobot-rollout` antes de entrenar políticas propias.
- Pick-and-place de laboratorio: ejecutar la tarea "Pickup object" en un banco de pruebas con el robot SO-101 y las cámaras declaradas, sirviendo como línea base reproducible para experimentos de manipulación.
- Punto de partida para fine-tuning: al derivar de `lerobot/smolvla_base` y estar entrenado con LeRobot, puede reentrenarse con `lerobot-train` sobre un dataset propio para nuevas tareas de recogida.
- Docencia y formación: ejemplo didáctico completo de aprendizaje por imitación con datos propios (10 episodios, 2688 fotogramas) y configuración de entrenamiento documentada.
- Evaluación de robustez visual: al emplear varias cámaras con resoluciones distintas (256x256 y 480x640), permite estudiar el efecto de la configuración de sensores en el éxito de la política.
- Prototipado de bajo coste: con 450 millones de parámetros y pesos en safetensors de 0,9 GB, es viable experimentar en estaciones de trabajo con GPU de consumo, sin necesidad de clústeres.
- Comparación de políticas VLA: sirve como checkpoint de referencia frente a otros fine-tunes de SmolVLA o de modelos VLA mayores en tareas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (tasas de éxito por tarea, número de ensayos, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros y pesos en safetensors (repo de 0,9 GB), la inferencia en precisión nativa requiere del orden de 2 GB solo para pesos, más el coste de los codificadores visuales y los búferes de activación. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: no especificadas en la información disponible. El artículo de SmolVLA indica que está pensado para hardware de consumo; una GPU consumer con 8 GB o más debería ser suficiente para inferencia, aunque no hay confirmación del autor para este checkpoint.
- Cabe en GPU de consumo: sí, según la premisa de diseño de SmolVLA recogida en la model card ("can be deployed on consumer-grade hardware"); no se detallan modelos concretos.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path` apuntando al repositorio; entrenamiento con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está pensada para control en tiempo real a 30 FPS (frecuencia de grabación del dataset), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (so101_smolvla_base_object_pnp_v1) | 450 M | no disponible | Pick-and-place SO-101 | Apache 2.0 | HuggingFace, 24 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base para fine-tuning | no disponible en la informacion | HuggingFace (modelo base) |
| Otros fine-tunes de SmolVLA | no disponible | no disponible | Manipulación robótica | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre este checkpoint y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente para la tarea "Pickup object" con 10 episodios; no se espera generalización a otras tareas, objetos o posiciones sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware exacto: la política asume el robot `so_follower` y un conjunto concreto de cámaras y claves de observación; cambios de cámara, resolución o montaje pueden degradar el comportamiento.
- Dataset muy pequeño: 10 episodios y 2688 fotogramas son insuficientes para cubrir variabilidad de iluminación, posiciones de objeto o distractores; riesgo alto de sobreajuste a las condiciones de grabación.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos se traducen en acciones físicas incorrectas, con riesgo material.
- Idiomas y contexto: no aplica como modelo de lenguaje; no hay información sobre soporte lingüístico de instrucciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base y del dataset asociado antes de redistribuir.
- Repositorio con muy poca tracción (24 descargas, 0 likes) y sin demo ni vídeo de ejecución; tratar como experimento, no como política validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SathyarajMedipalli/so101_smolvla_base_object_pnp_v1_with_task010_ND
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
