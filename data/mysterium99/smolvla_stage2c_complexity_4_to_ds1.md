# mysterium99/smolvla_stage2c_complexity_4_to_ds1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado en el ecosistema LeRobot de Hugging Face y publicado en el paper arXiv:2506.01844. Este checkpoint concreto (`mysterium99/smolvla_stage2c_complexity_4_to_ds1`) es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, y está diseñado para ejecutar una única tarea de manipulación robótica: recoger hardware de un operario humano y depositarlo en una zona delimitada con cinta.

El modelo resuelve el problema de la política de imitación (imitation learning) para control robótico de bajo coste computacional. Con 450 millones de parámetros, procesa tres cámaras RGB de 256x256 píxeles más el estado del robot de 6 dimensiones, y produce acciones de 6 dimensiones. Su relevancia radica en que demuestra que un VLA de tamaño reducido puede desplegarse en hardware de consumo, a diferencia de modelos VLA más grandes que requieren GPUs de centro de datos.

Este checkpoint es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados. Se trata de un fine-tuning experimental (el nombre sugiere una variante de "stage2c" con "complexity 4"), por lo que debe tratarse como material de referencia y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper arXiv:2506.01844 |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a generación de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside` (3 x 256x256x3) |
| Estado de entrada | `observation.state` (6,) |
| Salida | `action` (6,) |
| Tamaño del repo | 0.9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual (procesa tres cámaras a 256x256) con un modelo de lenguaje compacto que condiciona la generación de acciones. El modelo consume observaciones multimodales (imágenes de tres cámaras y estado propioceptivo de 6 dimensiones) y emite un vector de acción de 6 dimensiones, típico de un brazo robótico con pinza. El paper de referencia (arXiv:2506.01844) describe el diseño completo, aunque esta ficha no dispone de detalles internos sobre el número de capas, dimensión oculta o mecanismo de atención específico.

El entrenamiento de este checkpoint se realizó por fine-tuning desde `lerobot/smolvla_base` sobre el dataset `ds1`, compuesto por 50 episodios y 22.710 frames a 30 FPS, con una única tarea: "Take hardware from human and put in taped area". La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 0.0001 y semilla 0. No se documenta en la información disponible si hubo RLHF, DPO ni qué composición exacta tiene el corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multivista: procesa simultáneamente tres cámaras (`gripper`, `newtop`, `newside`) a resolución 256x256.
- Ejecución de una tarea específica de manipulación: recogida de hardware de un humano y colocación en zona delimitada.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual ni generación de lenguaje natural.
- No se documentan capacidades multilingües (el modelo no genera texto).
- No se documentan modos especiales como thinking mode, visión general o audio.

## Casos de uso

- Automatización de tareas de pick-and-place en línea de montaje: el modelo puede ejecutar la secuencia de recoger una pieza de la mano de un operario y depositarla en una zona marcada, usando las tres cámaras para localizar el objeto y el estado del robot para planificar la trayectoria de 6 dimensiones.
- Investigación en imitation learning: sirve como punto de partida para experimentos de fine-tuning sobre nuevos datasets, ya que parte de `lerobot/smolvla_base` y se entrena con el pipeline estándar de LeRobot.
- Prototipado rápido en robótica de bajo coste: al tener 450 M de parámetros y un repo de 0.9 GB, puede desplegarse en estaciones de trabajo con GPU de consumo, lo que facilita iterar en laboratorios con presupuesto limitado.
- Evaluación de robustez visual: las tres cámaras (pinza, vista superior, vista lateral) permiten estudiar cómo afectan oclusiones y cambios de iluminación a una política VLA compacta en entornos controlados.
- Benchmark de referencia para comparar variantes de SmolVLA: este checkpoint, etiquetado como "stage2c complexity 4", puede usarse como baseline frente a otras configuraciones del mismo modelo base.
- Docencia y formación en robótica con aprendizaje profundo: el flujo completo (grabar dataset, entrenar con `lerobot-train`, ejecutar con `lerobot-rollout`) es reproducible y está documentado, lo que lo hace adecuado para cursos prácticos.
- Replicación de experimentos del paper arXiv:2506.01844: permite validar resultados de políticas compactas en hardware real sin necesidad de clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica (success rate, reward medio) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros en safetensors (fp32 por defecto en el repo de 0.9 GB), la inferencia requiere aproximadamente 1,8 GB en fp32; en fp16 o bf16 bajaría a ~0,9 GB, aunque no se documentan conversiones oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar el modelo en fp16, incluyendo RTX 3050, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, dado el tamaño del modelo.
- Opciones de despliegue: el flujo oficial es `lerobot-rollout` (LeRobot 0.6.1) con `--policy.path=mysterium99/smolvla_stage2c_complexity_4_to_ds1`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. No se reportan métricas de frecuencia de control, latencia por paso ni FPS de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_stage2c_complexity_4_to_ds1 (este) | ~450 M | no disponible | Manipulación robótica (tarea única) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| Otros VLA de gran tamaño (p. ej. OpenVLA, RT-2) | no disponible en la información | no disponible | Manipulación robótica general | no disponible en la información | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a la relación de dependencia con `lerobot/smolvla_base` y a la categoría general de modelos VLA.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un dataset de 50 episodios con una única tarea y un operario concreto, es probable que la política esté sobreajustada a las condiciones de captura (iluminación, posiciones, apariencia del operario y del hardware).
- Riesgo de alucinación: en el contexto de políticas VLA, el equivalente es la generación de acciones erróneas o inseguras cuando la observación se sale de la distribución de entrenamiento. No hay evaluación que cuantifique este riesgo.
- Limitaciones de contexto e idioma: no aplica generación de lenguaje; el modelo no procesa instrucciones textuales arbitrarias más allá de la tarea condicionada. No se documenta ventana de contexto.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificación, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene verificar.
- Caveat para producción: cero descargas, cero likes y ausencia total de evaluación publicada. No debe desplegarse en entornos reales sin una validación exhaustiva en el robot objetivo y con métricas de tasa de éxito.
- Dependencia de hardware específico: el modelo espera tres cámaras con nombres concretos (`gripper`, `newtop`, `newside`) y un robot de tipo `follow` con estado de 6 dimensiones; cualquier desviación requiere reentrenamiento o adaptación.
- Fecha de creación futura (2026-11-06): el checkpoint parece un artefacto experimental reciente; su reproducibilidad y mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_4_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds1: https://huggingface.co/datasets/ds1
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds1
