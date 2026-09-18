# kbenz/namah_policy_v1

## Resumen

kbenz/namah_policy_v1 es una política de imitación (imitation learning) para robótica basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. El modelo aprende a partir de demostraciones teleoperadas y no predice acciones sueltas, sino fragmentos (chunks) de acciones, lo que reduce el error acumulado y suele dar tasas de éxito altas en manipulación fina. Cuenta con 51.668.614 parámetros y un repositorio de 0,2 GB, por lo que es un modelo pequeño en términos de aprendizaje profundo moderno.

El checkpoint está especializado en una única tarea denominada "Namah", ejecutada sobre un brazo seguidor SO-100 (tipo `so_follower`) de 6 grados de libertad, con dos cámaras RGB a 480x640 (`handeye` y `front`) y un vector de estado de 6 dimensiones. Se entrenó con el dataset kbenz/namah_combined, compuesto por 60 episodios y 25.224 fotogramas a 30 FPS. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

Su relevancia es la de un ejemplo reproducible y ligero del flujo completo de LeRobot: grabar datos con hardware de bajo coste, entrenar una política ACT y desplegarla con `lerobot-rollout`. No es un modelo de lenguaje ni un modelo de propósito general: es una política visomotora de una sola tarea, y su utilidad real depende de replicar el mismo robot, la misma calibración de cámaras y la misma distribución de escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sobre LeRobot; codificadores visuales por cámara, transformer con componente CVAE y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el método ACT original usa una ventana de observación fija configurable, no publicada para este checkpoint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje natural; la tarea se condiciona con la cadena fija "Namah") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / pipeline | lerobot / robotics |
| Tipo de robot | so_follower (brazo seguidor SO-100, 6 grados de libertad) |
| Camaras | handeye, front (RGB, 3x480x640 cada una) |
| Entradas | observation.state (6,), observation.images.handeye (3,480,640), observation.images.front (3,480,640) |
| Salidas | action (6,) |
| Dataset de entrenamiento | kbenz/namah_combined: 60 episodios, 25.224 fotogramas, 30 FPS, tarea "Namah" |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-17 (fecha declarada por el Hub) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina codificadores visuales tipo ResNet para cada flujo de cámara, un transformer que procesa la observación conjunta (estado propioceptivo más características visuales) y un decodificador que emite un chunk de acciones en lugar de una sola acción por paso. El modelo incorpora un codificador CVAE que modela la variabilidad de las demostraciones humanas y se entrena con una pérdida L1 de reconstrucción de acciones junto con un término de regularización KL sobre la variable latente. En inferencia, el método original aplica ensamblado temporal de los chunks solapados para suavizar la trayectoria.

La configuración de entrenamiento publicada para este checkpoint es: 25.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.2. Con lote 8 y 25.000 pasos, el modelo ha visto aproximadamente 200.000 muestras de entrenamiento. El dataset consta de 25.224 fotogramas a 30 FPS, es decir, unos 14 minutos de teleoperación efectiva repartidos en 60 episodios, todos ellos de la tarea "Namah". No se documenta el uso de RLHF ni DPO (no aplican a este tipo de política), ni aumentos de datos, ni composición detallada del dataset más allá de la tarea y las cámaras empleadas.

## Capacidades

- Generación de acciones de control continuas de 6 dimensiones para un brazo SO-100 a partir de dos imágenes RGB y del estado propioceptivo.
- Predicción de chunks de acciones (no acciones aisladas), lo que aporta coherencia temporal en movimientos finos.
- Manipulación visomotora de una única tarea: "Namah", con agarre y posicionamiento guiados por retroalimentación visual.
- Uso de dos vistas simultáneas (`handeye` en el efector y `front` en la escena), lo que permite combinar información local de precisión con información global de contexto.
- Ejecución en bucle cerrado a la frecuencia del dataset (30 FPS) mediante `lerobot-rollout`.
- Reentrenamiento y ajuste fino sobre otros datasets con la herramienta `lerobot-train`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas, de audio ni de visión general.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Reproducción de la tarea "Namah": ejecutar la política sobre un SO-100 seguidor con exactamente las mismas cámaras (`handeye` y `front`), calibración y distribución de escena que en el dataset, usando `lerobot-rollout` con `--policy.path=kbenz/namah_policy_v1`.
- Punto de partida para ajuste fino: reentrenar con `lerobot-train` sobre un dataset propio de tareas de pick-and-place similares, aprovechando que la política ya ha aprendido representaciones visuales y de control del mismo embodiment.
- Baseline en investigación sobre aprendizaje por imitación: comparar ACT frente a otras políticas (por ejemplo, Diffusion Policy) entrenadas sobre el mismo dataset kbenz/namah_combined, midiendo pasos hasta la convergencia y tasa de éxito en robot real.
- Validación de una plataforma robótica de bajo coste: comprobar el funcionamiento integral de un SO-100 (puerto serie, calibración, dos cámaras OpenCV a 30 FPS, latencia del bucle de control) antes de invertir en datasets mayores.
- Docencia y formación técnica: ejemplo end-to-end y de tamaño reducido (51,7 millones de parámetros, 0,2 GB) para explicar el ciclo completo de teleoperación, entrenamiento y despliegue de una política robótica.
- Generación de datos de evaluación: usar la política como operador automático para recolectar trayectorias adicionales o escenarios de fallo que permitan estudiar robustez frente a cambios de iluminación, posición de objetos o distracciones.
- Prototipado de control de precisión con vista en el efector: la cámara `handeye` aporta realimentación cercana al punto de agarre, útil en experimentos de inserción o colocación que requieran tolerancias ajustadas.
- Pruebas de integración en cadenas de CI para robótica: cargar el checkpoint y verificar que la inferencia arranca, que las formas de entrada y salida coinciden con las declaradas y que el pipeline de despliegue de LeRobot no se rompe tras actualizaciones de versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito en robot real, ni métricas de error de acción, ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- Tamaño de pesos derivado del recuento real de parámetros: en fp32, 51.668.614 × 4 bytes ≈ 206,7 MB; en fp16/bf16 ≈ 103,3 MB. A ello hay que sumar las activaciones asociadas a dos imágenes de 3x480x640 por paso de inferencia.
- El modelo cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, etc.). La restricción práctica no es la VRAM, sino el tiempo de inferencia por paso para mantener el bucle de control a 30 FPS.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; para despliegues con margen, una RTX 3060 de 12 GB o superior es más que suficiente. GPU de centro de datos (A100, H100) no aportan ventaja relevante a este tamaño de modelo.
- Inferencia en CPU: técnicamente posible en fp32 con los recursos descritos, pero no se han publicado medidas de latencia para este checkpoint, y es probable que no alcance los 30 FPS del dataset en hardware modesto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` para inferencia sin grabación) y PyTorch con CUDA o CPU. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado medidas de tiempo por paso ni de frecuencia de control alcanzada en robot real.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen otros checkpoints de ACT con datos publicados comparables, ni resultados de políticas alternativas (Diffusion Policy, SmolVLA u otras) entrenadas sobre el mismo dataset. Cualquier comparación rigurosa exigiría reentrenar las alternativas sobre kbenz/namah_combined y evaluarlas en el mismo robot y con la misma distribución de escena, algo que no se ha documentado para esta política.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea, "Namah". No generaliza a instrucciones nuevas ni a objetivos distintos sin reentrenamiento.
- Dependencia del embodiment: requiere un brazo SO-100 seguidor (`so_follower`) de 6 grados de libertad. Un robot distinto, o el mismo modelo con otra calibración, invalida las acciones predichas.
- Dependencia de la configuración de sensores: las cámaras deben llamarse `handeye` y `front`, resolverse a 480x640 y colocarse de forma equivalente a la del dataset de entrenamiento. Un cambio de montaje, de óptica o de iluminación degrada el rendimiento.
- Dataset reducido: 60 episodios y 25.224 fotogramas (unos 14 minutos de teleoperación). Es una base pequeña, con riesgo alto de sobreajuste a posiciones, colores y objetos concretos.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni descripción de las condiciones de prueba. No se puede afirmar que la política funcione en producción.
- Sin validación por la comunidad: 0 descargas y 0 likes en el Hub en el momento de redactar esta ficha. No hay retroalimentación externa que confirme su comportamiento.
- Falta de información sobre hiperparámetros clave del método ACT: no se documentan el tamaño del chunk de acciones, la ventana de observación, la dimensión de la variable latente CVAE ni la política de ensamblado temporal empleada.
- Riesgo de deriva y de fallo silencioso: al tratarse de una política imitadora, ante una situación fuera de distribución (objeto desplazado, oclusión, cambio de fondo) puede ejecutar movimientos plausibles pero incorrectos, sin señal de error explícita. Es el equivalente en robótica al riesgo de alucinación en modelos de lenguaje y exige supervisión y paradas de seguridad.
- Fecha de creación declarada por el Hub (2026-09-17) posterior a la fecha habitual de consulta; conviene verificar la vigencia y el estado real del repositorio antes de basar en él un despliegue.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar los avisos de licencia y de atribución. La licencia no cubre responsabilidades derivadas de un uso físico incorrecto del robot.
- Seguridad física: cualquier ejecución sobre hardware real debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado; el modelo no incorpora ninguna capa de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kbenz/namah_policy_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/kbenz/namah_combined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kbenz/namah_combined
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relación con el repositorio.
