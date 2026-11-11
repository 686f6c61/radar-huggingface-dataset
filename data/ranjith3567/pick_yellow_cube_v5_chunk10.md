# ranjith3567/pick_yellow_cube_v5_chunk10

## Resumen

`pick_yellow_cube_v5_chunk10` es una política de control robótico entrenada con LeRobot sobre la arquitectura SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto presentado en el paper arXiv:2506.01844. El modelo ha sido desarrollado por el usuario `ranjith3567` y publicado en Hugging Face con el pipeline `robotics`. Su propósito concreto es ejecutar la tarea de manipulación "pick the yellow block and place it in brown box" sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot), consumiendo observaciones de estado articular y hasta cuatro cámaras para producir comandos de acción de 6 dimensiones.

El modelo es relevante como ejemplo práctico de fine-tuning de SmolVLA para una tarea de imitación concreta: parte de un VLA preentrenado y se ajusta con 100 episodios teleoperados (63.143 frames a 30 FPS) durante 100.000 pasos. Con 450 millones de parámetros totales y un repositorio de 0,9 GB en safetensors, es un caso representativo de despliegue de políticas VLA en hardware de consumo, no de un modelo de lenguaje general.

Conviene subrayar que se trata de una política de comportamiento (policy), no de un modelo generativo de texto: no responde a prompts arbitrarios ni tiene capacidades conversacionales. Su única función es mapear observaciones robóticas a acciones motoras para la tarea entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; ventana de observación definida por chunk de acciones de 10 pasos según el nombre del repo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea se proporcionan como texto, pero no se documenta cobertura multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras | Top, Side (y features adicionales de imagen en la model card) |
| Entradas | `observation.state` (6,), `observation.images.camera1` (3,256,256), `observation.images.camera2` (3,256,256), `observation.images.camera3` (3,256,256), `observation.images.empty_camera_0` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | ranjith3567/pick_yellow_cube_v5_20261105_191046 (100 episodios, 63.143 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, un VLA compacto que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones para producir trayectorias motoras condicionadas por observaciones visuales y una instrucción textual de tarea. La model card no detalla la composición interna exacta (número de capas, dimensión oculta, mecanismo de atención), pero sí confirma la arquitectura SmolVLA referenciada en el paper arXiv:2506.01844, orientada a despliegue en hardware de consumo. El sufijo `chunk10` del repositorio sugiere predicción de chunks de 10 acciones por paso de inferencia, aunque este dato no se explicita en la model card.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `pick_yellow_cube_v5_20261105_191046`, compuesto por 100 episodios teleoperados (63.143 frames a 30 FPS) de la tarea "pick the yellow block and place it in brown box". Se ejecutaron 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-4, usando LeRobot 0.6.2 y semilla 1000. No se documenta en la información disponible si hubo RLHF, DPO ni ninguna fase de refinamiento posterior; tampoco se detalla la composición exacta del dataset más allá de la tarea y las métricas indicadas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular y observaciones visuales.
- Ejecución de una tarea específica de pick-and-place: "pick the yellow block and place it in brown box".
- Fusión multimodal visión-lenguaje-acción: consume hasta cuatro flujos de imagen (tres cámaras a 256x256 y una a 480x640) junto con el estado del robot.
- Condicionamiento por instrucción textual de tarea: la tarea se pasa como cadena de texto en el comando de rollout.
- Predicción de chunks de acciones: el nombre del repositorio indica chunk de 10, lo que permite reducir la frecuencia de inferencia respecto a un control paso a paso.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes conversacionales: no es un modelo de lenguaje de propósito general.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recoger un bloque amarillo y depositarlo en una caja marrón sobre un SO-100/SO-101, útil como banco de pruebas de pipelines de imitación con LeRobot.
- Reproducción de experimentos de SmolVLA: sirve como referencia para comparar el rendimiento de un fine-tuning concreto (100 episodios, 100k pasos) frente a otras configuraciones del mismo VLA.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de rollout y entrenamiento que permiten a estudiantes reproducir el flujo completo desde la grabación de datos hasta el despliegue.
- Base para fine-tuning en tareas similares: al ser un checkpoint SmolVLA ya ajustado, puede servir de punto de partida para tareas de manipulación con objetos o contenedores parecidos, reduciendo el coste de entrenamiento desde cero.
- Validación de hardware de bajo coste: al estar pensado para hardware de consumo, permite verificar si una estación con GPU modesta puede ejecutar políticas VLA en tiempo real a 30 FPS.
- Integración en pipelines de evaluación de LeRobot: el comando `lerobot-rollout` con `--strategy.type=base` facilita ejecuciones controladas de duración fija para medir éxito en condiciones reproducibles.
- Prototipado de sistemas de control visual: útil para experimentar con esquemas de observación multicámara (Top, Side y cámaras adicionales) en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no constan tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en FP32 o 0,9 GB en FP16/BF16), la huella de pesos es modesta; el consumo real depende del codificador visual y de los buffers de observación.
- GPU recomendadas: no especificadas en la información disponible. El paper de SmolVLA y la model card enfatizan el despliegue en hardware de consumo, por lo que se espera compatibilidad con GPUs consumer de gama media, pero no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU consumer: la model card afirma que SmolVLA "can be deployed on consumer-grade hardware", sin concretar modelos ni VRAM mínima.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El chunk de 10 acciones sugiere inferencia a frecuencia reducida respecto al control, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pick_yellow_cube_v5_chunk10 (este) | 450 M | Estado 6D + 4 flujos de imagen | Pick-and-place de bloque amarillo en caja marrón sobre so_follower | no disponible | Hugging Face, 0 descargas, 0 likes |
| SmolVLA base (arXiv:2506.01844) | no disponible en la informacion | no disponible | VLA generalista para manipulacion | no disponible | Paper y pesos referenciados por el autor, sin detalle en esta ficha |
| Otras politicas LeRobot del mismo autor | no disponible | no disponible | Variantes de la misma tarea (v5) | no disponible | No verificadas en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 100 episodios de una única tarea y un único montaje, la política probablemente está sobreajustada a posiciones, iluminación y objetos del dataset, aunque este extremo no se confirma en la model card.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento (objetos distintos, nuevas posiciones, cambios de iluminación).
- Limitaciones de contexto e idioma: no hay contexto de lenguaje extenso; la instrucción de tarea es fija y en inglés. No se documenta soporte multilingüe.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card indica "[More Information Needed]". No debe asumirse uso comercial permitido sin confirmación del autor.
- Ausencia de evaluación: no hay resultados de éxito en robot real, lo que impide estimar la fiabilidad en producción.
- Dependencia de hardware específico: entrenada para `so_follower` con cámaras concretas; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-11) en los metadatos: conviene verificar la integridad y procedencia antes de reutilizar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
