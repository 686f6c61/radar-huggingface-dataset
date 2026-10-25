# IkerAzurmendi/act-pick-v3-strict-4800

## Resumen

`act-pick-v3-strict-4800` es una política de imitación para el brazo robótico de bajo coste SO-101, publicada por el usuario IkerAzurmendi dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de control motor que recibe imagen de cámara frontal, imagen de cámara de muñeca y las seis posiciones articulares actuales, y devuelve un bloque de 90 objetivos de articulación futuros a 30 fps. La tarea es concreta: coger una pieza de una caja y sostenerla frente a la cámara.

El modelo usa la arquitectura ACT (Action Chunking Transformer), con 51.658.374 parámetros y pesos en safetensors (0,2 GB de repositorio). Se entrenó con 205 episodios filtrados por calidad, en una ejecución de 12.000 pasos de la que se publica el checkpoint de 4.800 pasos. El autor indica explícitamente que no es el mejor checkpoint de su ejecución —el de 2.400 pasos obtiene menor error offline— y que se publica por completitud.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline ACT completo sobre SO-101 con LeRobot; por otro, documenta un experimento controlado de filtrado de datos (variante "strict" frente a "super") y de tamaño de chunk de acciones, con métricas offline sobre episodios reservados. Ninguno de los checkpoints de la familia ha sido probado en el robot real, según la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación con encoder visual y decoder transformer |
| Parámetros totales | 51.658.374 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; sin ventana de contexto textual. Entrada: 2 imágenes + 6 posiciones articulares. Salida: chunk de 90 acciones |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | no aplica; el modelo no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | política robótica (imitation learning), pipeline `robotics` |
| Biblioteca | LeRobot |
| Entradas | cámara frontal, cámara de muñeca, 6 posiciones de articulación |
| Salidas | 90 objetivos de articulación futuros (chunk), 30 fps |
| Frecuencia de replanificación | cada 30 pasos de acción (1 s a 30 fps) |
| Episodios de entrenamiento | 205 |
| Pasos de entrenamiento de la ejecución | 12.000 (checkpoint publicado: 4.800) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer con componentes de autoencoder condicional variacional (CVAE): codifica las observaciones visuales mediante backbones convolucionales (una rama por cámara), las combina con el estado proprioceptivo de las seis articulaciones y genera mediante un decoder un bloque de acciones futuras en lugar de una acción aislada. Esa generación por chunks es lo que aporta consistencia temporal y reduce el error acumulado de las políticas paso a paso; en este caso el chunk es de 90 acciones, es decir, 3 segundos de trayectoria a 30 fps.

El entrenamiento se hizo con la función `train()` de LeRobot, batch 8, chunk 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 205 episodios a 30 fps con un filtro estricto: duración de 6 a 12 s, hueco inicial de como máximo 5 grados, como máximo 1 s de inactividad en cualquiera de los extremos, al menos una apertura de pinza y eliminación de tomas malas conocidas. Los episodios contienen una o dos piezas al inicio. No se documenta el número total de tokens ni el uso de RLHF o DPO, algo que no aplica a este tipo de política.

El autor reporta un hallazgo relevante: todas las ejecuciones empeoraron tras aproximadamente una pasada sobre los datos, lo que sugiere sobreajuste temprano con este volumen de episodios. La variante "strict" (205 episodios) alcanza un error offline de 15,14 en su mejor checkpoint, prácticamente idéntico al de la variante "super" con 398 episodios (15,16), lo que apunta a que el filtrado de calidad compensa la reducción de datos en este régimen.

## Capacidades

- Manipulación robótica de una sola tarea: coger una pieza de una caja y sostenerla frente a la cámara, con una o dos piezas presentes al inicio del episodio.
- Control visomotor con dos cámaras (frontal y de muñeca) y realimentación de seis posiciones articulares.
- Generación de trayectorias en bloque: 90 objetivos de articulación por inferencia, a 30 fps, con replanificación cada 30 pasos.
- Ejecución autónoma de la política sin teleoperación durante la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No incluye modo "thinking", visión general, audio ni ninguna otra modalidad fuera de las dos cámaras RGB y el estado articular.
- Sirve como checkpoint de referencia para comparar recetas de entrenamiento y filtrado de datos dentro de LeRobot.

## Casos de uso

- Automatización de pick-and-place en SO-101: el modelo ejecuta directamente la secuencia de agarre y presentación de la pieza a la cámara, con replanificación cada segundo, lo que permite cerrar el bucle con las dos cámaras sin teleoperador.
- Baseline en experimentos de curación de datos: al compartir receta con las variantes "super" y "strict", permite medir el efecto de filtrar episodios por duración, hueco inicial, inactividad y número de aperturas de pinza sobre el error offline.
- Estudio de action chunking: compararlo con `act-pick-v3-chunk60-4800` sirve para analizar el compromiso entre horizonte de predicción, error absoluto y robustez; hay que tener en cuenta que las baselines de ambos no son iguales (20,71 frente a 16,23).
- Sustituto de la teleoperación en demos de laboratorio: para una demostración controlada con la misma iluminación, fondo y colocación de cámara que en los datos, el modelo puede ejecutar la tarea sin operador.
- Docencia e investigación con hardware de bajo coste: un SO-101 más una GPU de consumo permite reproducir el pipeline completo de LeRobot con un modelo de 51,6 M de parámetros y 0,2 GB de pesos.
- Pruebas de infraestructura de inferencia: validar latencia, sincronización de cámaras, frecuencia de control y gestión de chunks antes de invertir en modelos mayores o en más datos.
- Análisis de fallos y seguridad: al ser una política de una sola tarea, es útil para estudiar modos de fallo de agarre, colisiones y comportamiento ante distribución desplazada, antes de desplegar políticas más generales.
- Comparación de checkpoints dentro de una misma ejecución: los cinco checkpoints publicados de la ejecución permiten analizar la degradación por sobreajuste entre 2.400 y 12.000 pasos.

## Benchmarks y rendimiento

Evaluación offline del autor sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos piezas). Métrica: error absoluto medio de las articulaciones sobre el chunk predicho, menor es mejor. Baseline de "mantenerse en las posiciones articulares actuales": 20,71.

| Checkpoint de esta ejecución | Error | Mejora sobre baseline |
|---|---|---|
| 2.400 pasos | 15,14 | 27 % |
| 4.800 pasos (este modelo) | 15,44 | 25 % |
| 7.200 pasos | 15,52 | 25 % |
| 9.600 pasos | 15,53 | 25 % |
| 12.000 pasos | 15,96 | 23 % |

Comparación con el mejor checkpoint de cada ejecución de la misma ronda:

| Ejecución | Episodios | Mejor checkpoint | Error | Mejora sobre baseline | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27 % | act-pick-v3-6000 |
| strict (6-12 s, filtro estricto) | 205 | 2,4k | 15,14 | 27 % | act-pick-v3-strict-2400 |
| receta v3 con episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % | act-pick-v2-6000 |
| chunk 60 (baseline propia 16,23) | 331 | 4,8k | 11,94 | 26 % | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25 % | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19 % | act-pick-v3-recent-12000 |
| primera ejecución | 165 | 6k | 16,87 | 19 % | act-pick-* |

Advertencias sobre estas cifras: el error de `chunk60` no es directamente comparable con el resto porque su baseline es distinta (16,23 frente a 20,71); los mejores checkpoints de las ejecuciones principales están dentro del ruido; y el propio autor señala que el error offline no permite determinar qué modelo agarra mejor, ya que ninguno se ha evaluado en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos en fp32 ocupan unos 207 MB y en fp16/bf16 unos 103 MB; con activaciones, dos flujos de cámara y el decoder del chunk, una estimación orientativa es inferior a 2 GB. Cifra no publicada por el autor.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB, como RTX 3050, RTX 3060, RTX 4060 o superiores. No requiere A100 ni H100; una RTX 4090 o una A100 estarían sobredimensionadas para inferencia.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama de entrada y módulos integrados tipo Jetson Orin Nano o NX si se exporta el modelo a un runtime compatible.
- Despliegue: LeRobot con PyTorch es la vía documentada. No se documentan exportaciones a ONNX, TensorRT, GGUF ni formatos cuantizados; llama.cpp y Ollama no aplican a este tipo de política. vLLM y TGI tampoco están orientados a modelos de control.
- Entrenamiento: el autor usó batch 8 y chunk 90, pero no publica requisitos de VRAM de entrenamiento. Como estimación orientativa, un entrenamiento de este tamaño es viable en GPUs de 8-16 GB, aunque la cifra exacta no está disponible.
- Latencia y throughput: no se publican mediciones. Por diseño, el modelo debe producir un chunk de 90 acciones (3 s a 30 fps) y replanificar cada 30 pasos (1 s), por lo que necesita sostener al menos una inferencia por segundo para no interrumpir la trayectoria.
- Almacenamiento: 0,2 GB de repositorio, sin dependencias de datasets pesados para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Error offline | Baseline | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-pick-v3-strict-4800 (este) | 51.658.374 | chunk de 90 acciones | 15,44 | 20,71 | Apache-2.0 | HuggingFace |
| act-pick-v3-strict-2400 | no disponible | chunk de 90 acciones | 15,14 | 20,71 | Apache-2.0 | HuggingFace |
| act-pick-v3-6000 | no disponible | chunk de 90 acciones | 15,16 | 20,71 | Apache-2.0 | HuggingFace |
| act-pick-v3-chunk60-4800 | no disponible | chunk de 60 acciones | 11,94 | 16,23 | Apache-2.0 | HuggingFace |
| act-pick-v3-1-2-pieces-18000 | no disponible | chunk de 90 acciones | 15,35 | 20,71 | Apache-2.0 | HuggingFace |

La comparación relevante no es frente a modelos de lenguaje, sino frente a otras políticas de la misma familia y misma tarea. En error absoluto, `chunk60` parece muy superior, pero su baseline también es más baja, de modo que la mejora relativa es prácticamente idéntica (26 % frente a 25 %). Entre los checkpoints de chunk 90, las diferencias (15,14 a 15,47) son demasiado pequeñas para extraer conclusiones sólidas sin evaluación en robot. No se dispone de comparación con políticas ACT externas ni con otros métodos de imitación en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y cerrada: solo "coger una pieza de la caja y sostenerla frente a la cámara". No generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Un solo embodiment: entrenado exclusivamente para SO-101 con dos cámaras y seis articulaciones. No es transferible a otros brazos sin adaptación.
- No probado en el robot: el autor indica explícitamente que ninguno de los modelos de la familia se ha evaluado físicamente. El error offline no mide éxito de agarre.
- Checkpoint no óptimo: dentro de su propia ejecución, el de 2.400 pasos obtiene mejor error (15,14 frente a 15,44). Este se publica por completitud.
- Sobreajuste temprano: todas las ejecuciones empeoraron tras aproximadamente una pasada sobre los datos, con el error subiendo de 15,14 a 15,96 entre 2.400 y 12.000 pasos.
- Sesgos de distribución: los datos provienen de un entorno concreto, con una iluminación, un fondo, una colocación de cámara y un operador determinados. Cambios en cualquiera de estas variables pueden degradar el comportamiento sin aviso.
- Sin estimación de incertidumbre: el modelo no reporta confianza ni detecta fuera de distribución; ante una escena distinta puede generar trayectorias erróneas con apariencia de normalidad.
- Dependencia de calibración: requiere cámara frontal y de muñeca correctamente montadas y calibradas, y lectura fiable de las seis posiciones articulares.
- Sin capacidades lingüísticas ni multimodales generales: no admite instrucciones en lenguaje natural, tool calling ni razonamiento simbólico.
- Contexto limitado al chunk: no hay memoria de largo plazo; las tareas de varios pasos dependen de la replanificación y del estado físico del robot, no de un historial interno.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se distribuye sin garantías. El dataset de entrenamiento no se incluye en el repositorio.
- Riesgo físico: es una política para un brazo real. Cualquier despliegue requiere límites de par, paradas de emergencia, espacio de trabajo despejado y supervisión, especialmente durante las primeras pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-4800
- Checkpoint mejor de la misma ejecución: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Variante con todos los datos que pasan el filtro de calidad: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Variante con chunk de 60 acciones: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Variante con episodios de una o dos piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Variante con una sola pieza: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Variante con solo sesiones recientes: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de SO-101 en LeRobot: https://huggingface.co/docs/lerobot/so101
- Paper de ACT (Action Chunking Transformer): https://arxiv.org/abs/2304.13705
