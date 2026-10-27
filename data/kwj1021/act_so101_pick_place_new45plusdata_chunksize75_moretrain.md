# Kwj1021/act_so101_pick_place_new45plusdata_chunksize75_moretrain

## Resumen

`Kwj1021/act_so101_pick_place_new45plusdata_chunksize75_moretrain` es una política de imitación basada en Action Chunking with Transformers (ACT) entrenada con LeRobot para el brazo robótico SO-101 (variante `so_follower`). No es un modelo de lenguaje: recibe el estado articular de 6 dimensiones y dos cámaras (muñeca y vista superior) a 480x640, y devuelve una acción de 6 dimensiones. El modelo resuelve una única tarea manipulativa: recoger un objeto y depositarlo en una zona objetivo.

El autor (Kwj1021) parte del método publicado en arXiv 2304.13705 y lo entrena sobre un dataset propio de 95 episodios y 80.836 fotogramas teleoperados a 30 FPS. El nombre del repositorio indica tres decisiones de entrenamiento: chunk size de 75 acciones, un dataset ampliado ("new45plusdata") y un entrenamiento prolongado ("moretrain") de 100.000 pasos con batch 8 y learning rate 1e-5.

Es relevante ahora por dos motivos prácticos: el SO-101 es una plataforma de bajo coste muy extendida en laboratorios y docencia, y este checkpoint es un artefacto reproducible con configuración completa documentada (semilla, optimizador, versión de LeRobot), lo que permite replicar el entrenamiento o usarlo como punto de partida para fine-tuning. Con 51,6 millones de parámetros y 0,2 GB de repositorio, se puede ejecutar en hardware muy modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): encoder ResNet + transformer encoder-decoder con cabeza CVAE, predice chunks de acciones |
| Parámetros totales | 51.643.014 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; horizonte de predicción de 75 acciones por chunk (según el nombre del repositorio) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, int8 ni fp16) |
| Idiomas soportados | No disponible / no aplica: política robótica sin capacidades lingüísticas; la instrucción de tarea se pasa como cadena fija |
| Licencia | No disponible (la model card deja el campo como "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.top` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso de control, predice un chunk de acciones futuras. La arquitectura combina un backbone visual convolucional (ResNet) que procesa las dos cámaras, un transformer encoder que fusiona las características visuales con el estado propioceptivo, y un transformer decoder que genera la secuencia de acciones; se añade una cabeza de autoencoder variacional condicional (CVAE) con una variable latente que modela la variabilidad de las demostraciones humanas. Esta formulación reduce el error de compounding y suaviza la ejecución frente a políticas paso a paso.

El entrenamiento usa exclusivamente datos teleoperados del dataset `Kwj1021/so101_pick_place_20261024_143100` (95 episodios, 80.836 fotogramas, 30 FPS, una sola tarea: "pick up the object and place it in the target area"). La configuración documentada es de 100.000 pasos con optimizador AdamW, batch size 8, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.2. No se documenta el número total de tokens ni composición del dataset más allá de episodios y fotogramas, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). El chunk size de 75 acciones es una innovación de configuración relevante: implica que la política planifica aproximadamente 2,5 segundos de trayectoria a 30 FPS antes de replanificar.

## Capacidades

- Manipulación pick-and-place: recoger un objeto y depositarlo en una zona objetivo, única tarea entrenada.
- Control continuo de 6 grados de libertad (posición/orientación del efector y apertura de pinza) a partir del estado articular.
- Percepción visual con dos flujos de cámara simultáneos (muñeca y vista cenital), lo que aporta información tanto egocéntrica como global de la escena.
- Predicción de chunks de 75 acciones, lo que proporciona movimiento suave y coherente en lugar de decisiones paso a paso.
- Aprendizaje por imitación: reproduce estrategias humanas sin recompensa explícita ni simulación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de tareas compuestas.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras modalidades fuera del par estado + imagen.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta el ciclo recoger-colocar sobre una cinta, con la política corriendo a 30 FPS sobre el SO-101 y las dos cámaras; encaja porque la tarea entrenada es exactamente esa y el chunk de 75 acciones evita microparadas en el bucle de control.
- Alimentación de máquinas (machine tending): colocar piezas en la tolva de una fresadora o inyectora; el SO-101 y la política son suficientes para piezas ligeras y posiciones repetibles, con la ventaja de no requerir integración con PLC.
- Kitting y empaquetado de lotes pequeños: agrupar componentes en bandejas; la cámara cenital aporta la vista global necesaria para localizar la zona destino.
- Base para fine-tuning en una tarea propia: el checkpoint y la configuración documentada (100k pasos, lr 1e-5, batch 8, semilla 1000) sirven como inicialización para entrenar con `lerobot-train` un nuevo dataset con un objeto o una zona destino distintos.
- Docencia y laboratorio de aprendizaje por imitación: el SO-101 es una plataforma de bajo coste y este repositorio incluye el comando `lerobot-rollout` completo, lo que permite demostrar el ciclo teleoperación-entrenamiento-despliegue en una sesión de prácticas.
- Evaluación comparativa de pipelines de imitación: sirve como referencia reproducible frente a otros checkpoints ACT para SO-101 con chunk size o número de pasos distinto, manteniendo constante el dataset.
- Recolección de objetos en entornos controlados de investigación: mover muestras entre posiciones fijas en un banco de laboratorio, donde la variabilidad de iluminación y de posición del objeto es acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la nota explícita "No evaluation results have been provided for this policy yet", sin tabla de ensayos ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en fp32 (51,64 M de parámetros); con activaciones y dos flujos de imagen a 480x640 el pico se mantiene en el rango de pocos cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060 o RTX 4090 cubren la inferencia con enorme margen. No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen; también es viable en CPU para pruebas de integración, aunque el bucle a 30 FPS exige verificar la latencia por paso.
- Hardware embebido: Jetson Orin Nano o equivalentes son candidatos razonables para montar la política sobre el propio robot, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), PyTorch con la librería `lerobot` 0.6.2. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; no se publican mediciones. Como requisito del sistema, el bucle de control a 30 FPS impone un presupuesto de 33 ms por paso de inferencia, incluyendo lectura de cámaras y publicación de comandos.
- Requisitos adicionales: dos cámaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que coincidan exactamente con `observation.images.wrist` y `observation.images.top`, además del puerto del robot `so_follower`.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / chunk | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Kwj1021) | ACT, SO-101 real | 51.643.014 | 75 acciones | Robot real (dataset teleoperado, 95 episodios) | No disponible | HuggingFace, 0 descargas |
| gpudad/act_so101_chunk40_250k_v1 | ACT, SO-101 | No disponible | 40 acciones, 250k pasos | Simulación MuJoCo (SO101PickCube-v0) | No disponible | HuggingFace |
| dleon23/act-so101 | ACT, SO-101 | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| anvil2718/act_so101_pickplace | ACT, SO-101 | No disponible | No disponible | No disponible | No disponible | HuggingFace (indexado por terceros) |

La comparación cuantitativa de rendimiento no es posible: ninguno de los repositorios comparables publica tasas de éxito verificables, y este modelo en particular no incluye sección de evaluación cumplimentada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha visto una tarea ("pick up the object and place it in the target area") con un objeto y una zona destino; generalizar a otros objetos, alturas o posiciones requerirá nuevos datos.
- Sin resultados de evaluación: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar robustez alguna en producción.
- Sesgos de dataset: 95 episodios grabados por un operador concreto implican sesgos de iluminación, posición inicial, velocidad de ejecución y estilo de manipulación; el rendimiento caerá ante cambios de condiciones.
- Dependencia de la configuración física: es necesario que el robot sea del tipo `so_follower` y que las cámaras estén montadas en la misma posición relativa que en la grabación, con los mismos nombres de observación.
- Riesgo de sobreajuste: 100.000 pasos con batch 8 sobre 80.836 fotogramas y un único escenario es una proporción que puede favorecer la memorización de trayectorias frente a la generalización.
- Sin capa de seguridad: como toda política de imitación, puede generar comandos abruptos ante entradas fuera de distribución; se recomienda limitar velocidades y par en el controlador de bajo nivel.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables: no hay interfaz en lenguaje natural; la instrucción de tarea es una cadena fija que se pasa al runtime.
- Ausencia de cuantizaciones publicadas: no hay versiones optimizadas para despliegue embebido, habría que generarlas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria ni incidencias reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kwj1021/act_so101_pick_place_new45plusdata_chunksize75_moretrain
- Dataset de entrenamiento: https://huggingface.co/datasets/Kwj1021/so101_pick_place_20261024_143100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kwj1021/so101_pick_place_20261024_143100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio comunitario relacionado: https://github.com/mikami235/so101-act-pick-place
- Checkpoint comparable en simulación: https://huggingface.co/gpudad/act_so101_chunk40_250k_v1
- Checkpoint comparable: https://huggingface.co/dleon23/act-so101
