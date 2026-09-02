# pravsels/pi05_busybox_multitask

## Resumen

El modelo `pravsels/pi05_busybox_multitask` es un ajuste fino completo (full-component fine-tune) de π0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, sobre el dataset `villekuosmanen/busybox_multitask`. Este dataset contiene 66 episodios de manipulación robótica con 27 tareas distintas, capturados a 20 fps con tres cámaras (superior, muñeca y frontal). El modelo está diseñado para controlar un brazo robótico mediante acciones relativas de 6 dimensiones (5 articulaciones en delta y apertura de pinza absoluta), con prompts de tarea específicos por episodio.

El ajuste se realizó partiendo del checkpoint base `pi05_base` y se entrenó durante 30.000 pasos con un batch global de 32 en 4 GPUs H100 80GB, alcanzando una pérdida de entrenamiento de 0,0031 al final. El repositorio publica los pesos en formato `params/` y `assets/`, listos para cargar con la librería `openpi`. Este modelo es relevante porque demuestra cómo adaptar un VLA de propósito general a un conjunto de tareas robóticas específicas con un coste de entrenamiento relativamente bajo (unas 4,5 horas), y sirve como referencia para la comunidad de robótica que busca desplegar políticas de control en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA basado en flow matching, transformer multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (params/ y assets/ en el repo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de π0.5, un VLA que combina un transformer multimodal con un objetivo de flow matching para generar acciones. A diferencia de un modelo de lenguaje estándar, π0.5 procesa observaciones visuales (imágenes de tres cámaras) y texto de instrucción, y produce secuencias de acciones continuas. El ajuste se realizó sobre el checkpoint `pi05_base` con el dataset `busybox_multitask` (LeRobot v3, 66 episodios, 12.141 frames, 27 tareas). Se usó una normalización por cuantiles por paso de tiempo y un horizonte de acción de 30 pasos. El entrenamiento se ejecutó en 4 GPUs H100 80GB con paralelismo de datos, durante 30.000 pasos y un batch global de 32. La pérdida de entrenamiento descendió de 0,2662 a 0,0031, lo que indica una convergencia estable. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado directamente sobre las demostraciones del dataset.

## Capacidades

- Control robótico de brazo único: genera acciones de 6 dimensiones (5 articulaciones en delta y apertura de pinza absoluta) a partir de observaciones visuales y un prompt de tarea.
- Manejo multitarea: entrenado en 27 tareas distintas del dataset busybox, lo que permite al modelo generalizar entre diferentes manipulaciones dentro del mismo entorno.
- Percepción visual multicámara: procesa simultáneamente imágenes de cámara superior, muñeca y frontal, lo que mejora la robustez en tareas de manipulación.
- Integración con el ecosistema openpi: se carga y ejecuta mediante la API estándar de `openpi`, facilitando su uso en pipelines de robótica existentes.
- Acciones relativas: la salida de acciones se expresa en deltas de articulación, lo que facilita la transferencia a diferentes configuraciones de robot.
- No incluye capacidades de tool calling, agentes conversacionales ni procesamiento de lenguaje natural general; su función es exclusivamente el control de robots.

## Casos de uso

- Manipulación de objetos en entornos de mesa: el modelo puede ejecutar tareas como apilar, empujar o recoger objetos, gracias a su entrenamiento en 27 tareas variadas del dataset busybox. Se usaría con un brazo robótico real o simulado, alimentando las cámaras y enviando las acciones generadas al controlador del robot.
- Automatización de tareas repetitivas en laboratorio: por ejemplo, clasificar piezas o colocar componentes en posiciones definidas. El modelo es adecuado porque ha sido entrenado con demostraciones de múltiples tareas y puede adaptarse a variaciones menores en la posición de los objetos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA preentrenado se adapta a un dominio específico con pocos datos (66 episodios). Los investigadores pueden analizar la transferencia de habilidades y la generalización.
- Desarrollo de políticas de control para robots de bajo coste: al ser un modelo de código abierto (aunque la licencia no está especificada), puede desplegarse en plataformas robóticas asequibles, como brazos de escritorio, siempre que se disponga de hardware suficiente para la inferencia.
- Benchmarking de algoritmos de VLA: el modelo puede utilizarse como referencia para comparar otros métodos de ajuste fino o arquitecturas de control, dado que se publican los pesos y la configuración de entrenamiento.
- Integración en sistemas de teleoperación asistida: el modelo puede generar acciones sugeridas en tiempo real a partir de la vista de las cámaras, ayudando a un operador humano a controlar el robot de forma semiautónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (0,0031 al paso 29.900) y el tiempo de entrenamiento (~4h 28m). No hay comparaciones con otros modelos ni métricas de éxito en tareas reales.

## Requisitos de hardware

- El tamaño del repositorio es de 87,1 GB, lo que sugiere que los pesos están en precisión completa (fp32 o bf16). Para inferencia se necesitará una GPU con al menos 80 GB de VRAM si se cargan los pesos sin cuantizar, o se deberá aplicar cuantización (no proporcionada por el autor).
- El entrenamiento se realizó en 4× H100 80GB SXM con paralelismo de datos, lo que indica que el modelo es grande y no cabe en una GPU de consumo estándar (p. ej., RTX 4090 con 24 GB) sin cuantización agresiva.
- Para despliegue, se recomienda usar el framework `openpi`, que incluye scripts de servicio (`serve_policy.py`) y soporta inferencia en GPU. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados. Dado el tamaño del modelo y la naturaleza de las tareas de robótica, se espera una inferencia en tiempo real (varios Hz) en GPUs de alta gama, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Tareas | Acciones | Entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| `pravsels/pi05_busybox_multitask` | π0.5 | busybox_multitask (27 tareas) | 27 | 6D relativas | 30k pasos, 4×H100 | no disponible |
| `pravsels/pi05_busybox_push_green_button` | π0.5 | busybox_push_green_button (SO101) | 1 | no especificado | no especificado | no disponible |
| π0.5 base (Physical Intelligence) | π0.5 | múltiples datasets | general | 6D | preentrenamiento | Apache 2.0 (según repo openpi) |

La comparativa se limita a modelos del mismo autor y al modelo base, ya que no hay otros VLA comparables con datos públicos en la información proporcionada. El modelo base π0.5 tiene una licencia Apache 2.0 según el repositorio openpi, pero el fine-tune no especifica licencia.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- El modelo está entrenado exclusivamente en el dataset busybox_multitask, que contiene 66 episodios. Esto limita su generalización a entornos o tareas fuera de ese dominio.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones inseguras si las observaciones difieren del dominio de entrenamiento. Se debe validar en entornos simulados antes de usarlo en robots reales.
- La ausencia de benchmarks y métricas de éxito impide evaluar su rendimiento real frente a otros enfoques.
- El tamaño del modelo (87 GB) dificulta su despliegue en hardware de bajo coste sin cuantización, y no se proporcionan versiones cuantizadas.
- El modelo no soporta lenguaje natural ni interacción conversacional; su entrada es estrictamente visual y de prompts de tarea predefinidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pravsels/pi05_busybox_multitask
- Dataset utilizado: https://huggingface.co/datasets/villekuosmanen/busybox_multitask
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π0.5: https://arxiv.org/html/2504.16054v1
- Modelo hermano con acciones absolutas: https://huggingface.co/pravsels/pi05_busybox_multitask_abs
- Otro fine-tune del mismo autor: https://huggingface.co/pravsels/pi05_busybox_push_green_button
- Proyecto W&B del entrenamiento: https://wandb.ai/pravsels/busybox_multitask_pi05
