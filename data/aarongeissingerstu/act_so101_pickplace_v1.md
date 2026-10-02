# AaronGeissingerSTU/act_so101_pickplace_v1

## Resumen

`act_so101_pickplace_v1` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales de control. El modelo lo publica el usuario AaronGeissingerSTU en Hugging Face utilizando la librería LeRobot de Hugging Face, y está entrenado específicamente para una tarea de recogida y colocación (*pick and place*) sobre un brazo robótico SO-101, a partir del dataset `AaronGeissingerSTU/so101_pickplace_v1`.

No se trata de un modelo de lenguaje: es un *policy* de control motor que consume observaciones visuales y el estado de las articulaciones del robot, y produce comandos de acción. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de gama baja, incluida una GPU de consumo o incluso CPU.

Su relevancia es práctica más que investigadora: sirve como ejemplo reproducible de un *pipeline* completo de LeRobot (entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) y como punto de partida para quien quiera replicar una tarea de manipulación con el SO-101. El repositorio no documenta resultados de evaluación ni métricas de éxito, por lo que debe tratarse como un *checkpoint* sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador-decodificador y componente VAE, para aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; utiliza horizonte de observacion y tamano de *action chunk* configurables, no documentados) |
| Tipos de cuantizacion | no documentados; los pesos se publican en safetensors y el tamano del repositorio (0,2 GB) es coherente con fp32 |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La política combina un transformador con un esquema de VAE condicional (CVAE) y una cabeza de decodificación que emite un bloque de acciones futuras en una sola pasada, en lugar de predecir una acción por paso. Esta estrategia de *action chunking* reduce el error de composición acumulado y suaviza el control en tareas de manipulación fina, y es lo que permite alcanzar tasas de éxito altas en tareas aprendidas a partir de demostraciones teleoperadas.

La información disponible no detalla la composición del dataset de entrenamiento (número de episodios, número de demostraciones, resolución y número de cámaras, frecuencia de control), ni si se aplicaron etapas de ajuste adicionales. La *model card* es esencialmente la plantilla genérica de LeRobot para políticas ACT y no describe la configuración concreta usada ni el proceso de entrenamiento específico de este *checkpoint*. Los datos de entrada típicos de una política ACT en LeRobot son imágenes de cámara y el estado articular del robot, y la salida es una secuencia de acciones de las articulaciones.

## Capacidades

- Generación de comandos motores (*action chunks*) para control de un brazo robótico SO-101 en una tarea de recogida y colocación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: no requiere definición explícita de recompensas ni entorno de simulación para el entrenamiento.
- Entrada multimodal limitada a observaciones sensoriales: imágenes de cámara y estado de las articulaciones del robot.
- Ejecución de políticas cerradas de un solo *checkpoint*: no tiene *tool calling*, ni *function calling*, ni capacidad de razonamiento multi-paso simbólico.
- No soporta agentes ni planificación de tareas a nivel semántico; es una política reactiva entrenada para una distribución concreta de tareas.
- Capacidades multilingües: no aplica, el modelo no procesa ni genera lenguaje.
- Capacidades especiales: ninguna documentada (sin *thinking mode*, sin visión general, sin audio).

## Casos de uso

- **Pick and place con un SO-101 en laboratorio o taller**: el modelo está entrenado explícitamente para esta tarea; se desplegaría con `lerobot-record` apuntando al *checkpoint* y a un robot del tipo `so100_follower`, capturando imágenes de la escena y publicando acciones articulares.
- **Prototipado rápido de un pipeline de robótica con LeRobot**: sirve como punto de partida para validar la cadena completa (dataset, entrenamiento, evaluación, despliegue) antes de invertir en un modelo mayor o en más datos.
- **Docencia y formación en aprendizaje por imitación**: al ser un *checkpoint* pequeño (51,7 M de parámetros, 0,2 GB), se puede usar en clase para ilustrar el flujo de ACT sin necesidad de infraestructura de GPU de gama alta.
- **Generación de datos para políticas VLA de mayor tamaño**: las trayectorias ejecutadas por esta política pueden registrarse como nuevas demostraciones y alimentar el entrenamiento de modelos visión-lenguaje-acción, o servir de comparación base en experimentos de *sim-to-real*.
- **Automatización de clasificación y ordenación de objetos pequeños en un banco de trabajo**: útil cuando la tarea es repetitiva, el entorno está controlado y la cámara se mantiene en una posición fija respecto al robot.
- **Evaluación comparativa de métodos de imitación en el mismo robot y dataset**: al compartir espacio de nombres y dataset con otros *checkpoints* de ACT para SO-101, permite medir diferencias entre configuraciones de entrenamiento bajo condiciones controladas.
- **Investigación sobre robustez a variaciones de iluminación y posición de objetos**: como política compacta y de bajo coste de inferencia, es adecuada para barridos experimentales con muchas repeticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones con otros *checkpoints*, y el repositorio no registra descargas ni valoraciones que permitan inferir un uso validado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,2 GB con pesos en fp32, según el tamano del repositorio; por debajo de 0,1 GB si se convierte a fp16 mediante las herramientas estándar de PyTorch. No se documentan cuantizaciones oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de memoria es más que suficiente; no se requiere A100, H100 ni tarjetas de datacenter.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas con soporte CUDA o ROCm.
- **CPU y dispositivos embebidos**: el tamano del modelo permite ejecución en CPU y es candidato razonable para plataformas embebidas tipo NVIDIA Jetson o Raspberry Pi con acelerador, aunque no se documenta latencia en estos entornos.
- **Opciones de despliegue**: LeRobot (entrenamiento con `lerobot-train` y evaluación con `lerobot-record`), PyTorch nativo. vLLM, TGI, llama.cpp u Ollama no son aplicables, ya que no es un modelo de lenguaje.
- **Latencia y rendimiento**: no disponibles. No se publican medidas de frecuencia de control alcanzada ni de tiempo de inferencia por *chunk*.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AaronGeissingerSTU/act_so101_pickplace_v1 | 51.668.614 | no aplica | no publicado | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| ViVi-AI/ACT_so101_pick_place | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Otros checkpoints ACT para SO-101 en LeRobot | no disponible | no aplica | no disponible | habitualmente apache-2.0 (no confirmado para cada caso) | Hugging Face |

Existen alternativas de tipo VLA (vision-language-action) para el mismo robot SO-101, como los flujos descritos en el material de formación de NVIDIA para *sim-to-real*; sin embargo, no se dispone en la información proporcionada de sus especificaciones de parámetros, contexto ni rendimiento, por lo que no se incluye una comparación numérica.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito, número de episodios de prueba ni métricas de ningún tipo. No debe asumirse que la política funciona fuera de las condiciones exactas de su dataset.
- **Sobreajuste al *embodiment* y a la tarea**: es una política de tarea única entrenada para un SO-101 concreto; cambios en la cinemática, en la pinza o en la disposición de las cámaras invalidan probablemente el comportamiento aprendido.
- **Sensibilidad a la distribución visual**: como toda política de imitación basada en imágenes, es vulnerable a cambios de iluminación, fondo, posición de la cámara o apariencia de los objetos no representados en el dataset.
- **Riesgo en entorno físico**: un fallo de la política se traduce en movimiento real del brazo. Es imprescindible operar con límites de par, parada de emergencia y espacio de trabajo despejado durante la evaluación.
- **Documentación insuficiente**: la *model card* es la plantilla genérica de LeRobot; no especifica número de episodios, configuración de cámaras, frecuencia de control ni hiperparámetros. Además, el ejemplo de evaluación usa el tipo de robot `so100_follower`, lo que introduce ambigüedad respecto al SO-101 objetivo.
- **Repositorio sin tracción**: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso por terceros ni de reproducción independiente.
- **Idioma**: no aplica; el modelo no procesa lenguaje natural, por lo que no se pueden formular instrucciones en castellano ni en ningún otro idioma.
- **Licencia**: apache-2.0 permite uso comercial y modificación, con las obligaciones habituales de conservar avisos de copyright y licencia. Conviene verificar la licencia y las condiciones del dataset asociado antes de un uso en producción, ya que el repositorio no detalla su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AaronGeissingerSTU/act_so101_pickplace_v1
- Dataset asociado: https://huggingface.co/datasets/AaronGeissingerSTU/so101_pickplace_v1
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Modelo similar de otro autor para el mismo robot: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Tutorial de NVIDIA sobre SO-101 y *sim-to-real*: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Ficha de terceros con metadatos agregados: https://essamamdani.com/ai-models/hf-anvil2718-act-so101-pickplace
