# Kwj1021/act_so101_addleftdata_chunk75_step50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos («chunks») de acciones futuras en lugar de un único paso de control. Este repositorio concreto, `Kwj1021/act_so101_addleftdata_chunk75_step50`, es una política entrenada con LeRobot sobre el robot SO-101 (`so_follower`) para una única tarea de pick-and-place: «pick up the object and place it in the target area». No es un modelo de lenguaje: consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (muñeca y cenital), y emite un vector de acción de 6 dimensiones.

El modelo tiene 51.643.014 parámetros (51,6 M) en formato safetensors y un repositorio de 0,2 GB, lo que lo sitúa en la gama ligera de políticas robóticas: se puede ejecutar en una GPU de consumo e incluso en CPU con latencias mayores. El nombre del repositorio sugiere un tamaño de chunk de 75 acciones y un entrenamiento de 50.000 pasos, aunque estos valores no se confirman explícitamente en la model card (el único dato confirmado de la configuración es el número de pasos).

Su relevancia es la de un artefacto de investigación reproducible: sirve como referencia de ACT sobre un hardware accesible (SO-101), como punto de partida para fine-tuning con datos propios y como baseline frente a Diffusion Policy u otras políticas del ecosistema LeRobot. Conviene subrayar que el autor no ha publicado ninguna evaluación en robot real, que la licencia no está declarada y que el modelo solo ha visto 128 episodios de una tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE, política de imitación |
| Parámetros totales | 51.643.014 (51,6 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el horizonte es el chunk de acciones, no confirmado en la model card) |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible; la política no procesa lenguaje natural |
| Licencia | No disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Tipo de política | Imitación supervisada (behavior cloning) con predicción de chunks de acción |
| Robot objetivo | `so_follower` (SO-101 de LeRobot) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Cámaras requeridas | `wrist` y `top`, a 640x480 y 30 FPS |
| Dataset de entrenamiento | `Kwj1021/so101_pick_place_addleftdata` |
| Episodios / frames | 128 episodios, 112.201 frames a 30 FPS |
| Tarea entrenada | «pick up the object and place it in the target area» |
| Pasos de entrenamiento | 50.000 |
| Batch / optimizador / LR | 8 / AdamW / 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de imitación que combina un codificador visual (habitualmente una ResNet preentrenada, aunque la model card no detalla el backbone exacto de esta instancia) con un transformer encoder-decoder y un cuello de botella de tipo CVAE. La innovación central del método es predecir un chunk de k acciones futuras en una sola pasada en lugar de regresar la acción inmediata, lo que reduce el error de composición acumulado y estabiliza el control; en el artículo original se emplea además ensamblado temporal (*temporal ensembling*) para promediar predicciones solapadas entre chunks consecutivos. La model card no especifica el valor de k para esta política, ni el backbone visual, ni la dimensión latente del CVAE.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 128 episodios de teleoperación (112.201 frames a 30 FPS) de una única tarea de pick-and-place, con 50.000 pasos, batch de 8, AdamW y learning rate de 1e-05. No se documenta composición del dataset más allá de la tarea, ni aumentos de datos, ni si se aplicó algún tipo de regularización adicional. Tampoco se indica proceso de RLHF o DPO, algo esperable al tratarse de behavior cloning puro: la política replica la distribución de las demostraciones y no incorpora señal de recompensa.

## Capacidades

- Control robótico de una tarea de pick-and-place: recoger un objeto y colocarlo en una zona objetivo, a partir de estado articular y dos vistas RGB.
- Predicción de chunks de acción, que aporta suavidad y consistencia temporal frente a políticas paso a paso.
- Condicionamiento visual por dos cámaras simultáneas (muñeca y cenital), lo que permite cierta tolerancia a variaciones de posición del objeto dentro del espacio de trabajo observado.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base` durante una duración configurable.
- Reentrenamiento y fine-tuning con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni planificación de tareas; la «tarea» es una cadena de texto usada como condicionamiento fijo, no instrucciones arbitrarias en lenguaje natural.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en el banco de trabajo: la política está entrenada exactamente para la tarea «pick up the object and place it in the target area» sobre SO-101, de modo que puede desplegarse directamente con `lerobot-rollout` para tareas repetitivas de recogida y depósito sin desarrollo adicional.
- Baseline de referencia para investigación en imitación: al ser una política ACT reproducible (configuración y dataset públicos), sirve para comparar frente a Diffusion Policy u otras políticas de LeRobot bajo el mismo conjunto de 128 episodios.
- Punto de partida para fine-tuning con datos propios: cargar los pesos y reentrenar con `lerobot-train` sobre un dataset específico del usuario reduce el número de pasos necesarios frente a entrenar desde cero, siempre que el robot y la disposición de cámaras coincidan.
- Estudios de ablación sobre tamaño de chunk: el identificador del repositorio sugiere un chunk de 75 acciones; comparar esta política con variantes de chunk menor permite medir el efecto del horizonte de predicción en la tasa de éxito.
- Docencia y prototipado con hardware accesible: el SO-101 y LeRobot permiten montar un laboratorio de aprendizaje por imitación de bajo coste, y esta política (0,2 GB, 51,6 M de parámetros) se ejecuta en equipos modestos.
- Pruebas de robustez ante cambios de dominio: útil para medir degradación al variar iluminación, posición inicial del objeto o presencia de distractores, ya que el autor no reporta ninguna evaluación de este tipo.
- Integración en pipelines de recogida de datos: usar la política como política inicial para generar episodios adicionales y ampliar el dataset antes de un reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet» y la tabla de evaluación del autor está vacía (sin número de ensayos, éxitos ni tasa de éxito). Tampoco se reportan métricas de pérdida de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB, estimación propia a partir de los 51,6 M de parámetros (unos 207 MB en FP32) más las activaciones de dos flujos de imagen de 480x640; no hay medición publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica (RTX 3050/4060, RTX 3060, RTX 4090, A100/H100). El modelo no necesita GPU de centro de datos.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas tarjetas de gama de entrada y portátiles.
- CPU: es viable en inferencia por CPU gracias al tamaño reducido, aunque la latencia por paso no está documentada y puede comprometer el control a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch; no aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 30 FPS, por lo que el bucle de control debería sostener ese régimen para reproducir las condiciones de entrenamiento.
- Almacenamiento: 0,2 GB de pesos, irrelevante para cualquier equipo actual.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (esta política, SO-101) | 51,6 M | Transformer + CVAE con chunks de acción | Chunk no confirmado (el nombre sugiere 75) | No disponible | HuggingFace, LeRobot |
| Diffusion Policy | Depende de la configuración (no disponible) | Difusión sobre acciones | Horizonte de predicción configurable | No disponible en la información proporcionada | Implementada en LeRobot |
| SmolVLA | ~450 M (dato externo aproximado) | VLA con backbone VLM pequeño | Condicionado por lenguaje | No disponible en la información proporcionada | HuggingFace, LeRobot |
| π0 (pi-zero) | ~3,3 B (dato externo aproximado) | VLA con flow matching | Condicionado por lenguaje | No disponible en la información proporcionada | Publicada por Physical Intelligence |

Las cifras de SmolVLA y π0 son referencias externas aproximadas y no proceden de la información proporcionada para esta ficha; la comparación directa de rendimiento no es posible porque este repositorio no publica ninguna evaluación. Frente a las alternativas VLA, la diferencia clave es que esta política no entiende lenguaje: solo ejecuta la tarea para la que fue entrenada.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica «[More Information Needed]». Sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Una única tarea y un único embodiment: entrenada solo para «pick up the object and place it in the target area» sobre `so_follower`; no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- Dataset pequeño: 128 episodios y 112.201 frames son insuficientes para cubrir variaciones amplias de iluminación, fondo, posición o tipo de objeto; es esperable sobreajuste al entorno de grabación.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que el rendimiento real es desconocido y debe validarse antes de cualquier uso.
- Dependencia estricta de la configuración sensorial: las claves `observation.images.wrist` y `observation.images.top` deben existir con esos nombres exactos y a 640x480; un cambio de cámara, montaje o resolución degrada o invalida la política.
- Sin comprensión de lenguaje: el parámetro `--task` es una cadena fija asociada al entrenamiento, no una instrucción interpretable; no se pueden dar órdenes nuevas en ningún idioma.
- Riesgo de alucinación en el sentido habitual no aplica, pero sí existe deriva de distribución (*distribution shift*): ante estados visuales fuera de la distribución de entrenamiento, la política puede generar acciones erráticas sin señal de aviso ni capacidad de abortar.
- Sin mecanismos de seguridad intrínsecos: el despliegue requiere límites de par, paradas de emergencia y supervisión humana, especialmente por la ausencia de datos de robustez.
- Trazabilidad limitada: no se documenta el backbone visual, el tamaño de chunk efectivo ni la composición exacta del dataset, lo que dificulta reproducir el entrenamiento con fidelidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kwj1021/act_so101_addleftdata_chunk75_step50
- Dataset de entrenamiento: https://huggingface.co/datasets/Kwj1021/so101_pick_place_addleftdata
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kwj1021/so101_pick_place_addleftdata
- Artículo de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran páginas genéricas de YouTube sin relación con la política.
