# RafaelJaime/act-sim-white-c100

## Resumen

`RafaelJaime/act-sim-white-c100` es una política de imitación visomotora entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705 y descrito como «Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware». No es un modelo de lenguaje: es un controlador neuronal que, a partir de dos imágenes de cámara (vista superior y vista de muñeca) y del estado articular de 6 dimensiones del robot, emite comandos de acción de 6 dimensiones para un brazo SO-101 (tipo `so_follower`). El autor lo publica en el Hub mediante LeRobot 0.6.2, dentro del contexto de la robotekin-hackathon y del proyecto BraboRobots/smartseed.

El modelo resuelve una tarea única y muy concreta: «grasp the seed below the gripper», es decir, el agarre de una semilla situada bajo la pinza. Se ha entrenado exclusivamente con el dataset simulado `RafaelJaime/smartseed-sim-grasp-white-v2`, compuesto por 100 episodios de teleoperación, 29.508 fotogramas a 30 FPS, en un entorno de simulación con fondo blanco. Con 51.668.614 parámetros, es un modelo pequeño que cabe holgadamente en cualquier GPU de consumo, pero cuya validez está acotada al dominio visual y a la morfología del robot con el que se recogieron los datos.

Su relevancia es la de un artefacto de referencia reproducible: permite estudiar el pipeline completo de LeRobot (grabación, entrenamiento ACT, despliegue con `lerobot-rollout`), sirve como línea base de imitación en simulación y como punto de partida para experimentos de transferencia sim-a-real en robótica de bajo coste. No se han publicado resultados de evaluación, ni métricas de éxito, ni comparativas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador estilo VAE condicional + transformer encoder-decoder que predice trozos de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: política visomotora que consume la observación actual (estado de 6 dims y 2 imágenes); no se especifica el número de pasos de observación |
| Tipos de cuantizacion | No disponible (pesos publicados en precisión de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica / no disponible: no procesa lenguaje; la instrucción de tarea es una cadena fija («grasp the seed below the gripper») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot; 2,5 GB de tamaño total del repo) |

Especificaciones de entrada y salida declaradas en la model card:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.top` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la trayectoria. La formulación original combina un codificador de tipo VAE condicional, que infiere una variable latente a partir de la secuencia de acciones objetivo durante el entrenamiento, con un transformer encoder-decoder que genera el trozo de acciones a partir de las observaciones visuales y propioceptivas. En inferencia se emplea ensamblado temporal de los trozos predichos para producir comandos continuos. El modelo consume dos flujos de imagen RGB de 480×640 (cámara `top` y cámara `wrist`) junto con el estado de 6 dimensiones, y devuelve acciones de 6 dimensiones correspondientes al robot `so_follower` (SO-101).

El entrenamiento se realizó con LeRobot 0.6.2 sobre 100 episodios y 29.508 fotogramas a 30 FPS del dataset simulado `smartseed-sim-grasp-white-v2`, con una única instrucción de tarea. La configuración declarada es de 40.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta en la información disponible el número total de tokens ni de muestras vistas, la composición del dataset más allá de los episodios citados, ni si se aplicaron etapas de RLHF/DPO (no procede en este tipo de política) o aumentos de datos. Tampoco se especifican hiperparámetros propios de ACT como el tamaño del chunk, el número de capas del transformer o la dimensión latente.

## Capacidades

- Generación de comandos de control de 6 dimensiones para un brazo SO-101 en la tarea de agarre de una semilla situada bajo la pinza.
- Percepción visomotora conjunta a partir de dos cámaras: vista cenital (`top`) y vista de muñeca (`wrist`), lo que permite corrección visual fina en el momento del agarre.
- Predicción de trozos de acciones (action chunking) con ensamblado temporal, orientada a movimientos suaves y a la reducción del error acumulado.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere definición explícita de recompensas.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`, con la posibilidad de limitar la duración con `--duration`.
- Entrenamiento reproducible desde el propio pipeline de LeRobot (`lerobot-train --policy.type=act`) sobre el dataset publicado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades de lenguaje, visión general, audio o modo «thinking». Es una política robótica de tarea única.

## Casos de uso

- **Agarre automatizado de semillas en simulación**: el modelo ejecuta la tarea «grasp the seed below the gripper» en el entorno simulado con el que fue entrenado; sirve para validar la cadena completa de percepción y control antes de pasar a hardware real.
- **Línea base de imitación para experimentos comparativos**: al estar entrenado con una configuración documentada (40.000 pasos, batch 32, lr 1e-5, semilla 1000), permite reproducir el resultado y compararlo con variantes de ACT, con Diffusion Policy u otras políticas de LeRobot bajo el mismo dataset.
- **Estudio de transferencia sim-a-real**: el modelo parte de un dataset sintético con fondo blanco, lo que lo convierte en un caso de prueba realista para medir la brecha de dominio al desplegarlo sobre el SO-101 físico con las mismas cámaras y resolución.
- **Docencia y formación en robótica de bajo coste**: con 51,7 M de parámetros y un repositorio de 2,5 GB, se puede entrenar y ejecutar en una estación de trabajo con GPU de consumo, lo que facilita prácticas de aprendizaje por imitación en cursos y hackathons.
- **Evaluación de robustez visual**: sirve para cuantificar la sensibilidad de una política ACT a cambios de iluminación, fondo y posición inicial del objeto, alterando las condiciones del simulador respecto al dataset original.
- **Prototipado rápido en hackathon**: el flujo `lerobot-rollout --strategy.type=base --policy.path=RafaelJaime/act-sim-white-c100` permite tener un brazo ejecutando una política entrenada en minutos, útil para demostraciones y pruebas de concepto.
- **Generación de datos y aumento del dataset**: las trayectorias ejecutadas por la política pueden registrarse y compararse con las teleoperadas para identificar modos de fallo y dirigir la recogida de nuevos episodios.
- **Módulo de agarre dentro de una cadena agrícola simulada**: integrado como primitiva de manipulación en un pipeline mayor de siembra o clasificación de semillas, siempre que se respete la morfología y el espacio de acciones del SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita «No evaluation results have been provided for this policy yet», sin tabla de ensayos, éxitos ni tasas de acierto. Tampoco se han proporcionado métricas de pérdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,7 M de parámetros, lo que supone aproximadamente 207 MB en fp32 y unos 103 MB en fp16 solo en pesos. Sumando las activaciones de dos flujos de imagen de 480×640 y el codificador visual, una estimación razonable es de 2 a 4 GB de VRAM con batch 1 (estimación propia, no publicada por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4060, RTX 4090 o una A100 funcionan sin problema. Para reentrenar con batch 32 y 40.000 pasos conviene una GPU de 12 GB o más (RTX 3090/4090, A5000, A100).
- **GPU de consumo**: sí cabe, en prácticamente cualquier tarjeta moderna de gama media; el cuello de botella no es la memoria sino la latencia del bucle de control a 30 FPS y la captura de dos cámaras USB.
- **Opciones de despliegue**: `lerobot-rollout` (inferencia en robot real o simulado) y `lerobot-train` para reentrenamiento, ambos de la librería LeRobot. No aplica el despliegue con vLLM, TGI, llama.cpp u Ollama, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones. El requisito implícito del sistema es sostener 30 FPS (33 ms por paso) para coincidir con la frecuencia de captura del dataset; el rendimiento real dependerá de la GPU, del backend de las cámaras y de si se aplica ensamblado temporal.
- **Almacenamiento**: el repositorio ocupa 2,5 GB, presumiblemente por incluir estados del optimizador y checkpoints además de los pesos finales; para solo inferencia basta con los safetensors de la política.

## Comparativa con modelos similares

No se han proporcionado datos verificables de modelos comparables en la información disponible. La comparación siguiente es cualitativa y se limita a lo que puede afirmarse sin cifras inventadas; los valores no documentados se marcan como no disponibles.

| Modelo | Enfoque | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RafaelJaime/act-sim-white-c100` (este modelo) | ACT, imitación con action chunking, tarea única | 51.668.614 | Estado 6 dims + 2 imágenes 480×640 | Apache 2.0 | HuggingFace Hub, vía LeRobot |
| Diffusion Policy (implementación LeRobot) | Política visomotora basada en difusión | No disponible en la información | No disponible | No disponible en la información | Disponible en el ecosistema LeRobot |
| Otras políticas ACT de LeRobot sobre SO-101 | ACT, imitación, tarea única | No disponible en la información | No disponible | No disponible | Hub de HuggingFace |
| Políticas VLA (visión-lenguaje-acción) del ecosistema LeRobot | VLA con condicionamiento por lenguaje | No disponible en la información | No disponible | No disponible | Hub de HuggingFace |

Diferencias cualitativas relevantes: frente a una política VLA, este modelo no acepta instrucciones en lenguaje natural y solo ejecuta la tarea para la que fue entrenado; frente a Diffusion Policy, ACT es generalmente más ligero y rápido en inferencia al predecir trozos de acciones en una sola pasada, a costa de una menor capacidad de modelar distribuciones multimodales de acciones.

## Limitaciones y advertencias

- **Tarea única y sin condicionamiento por lenguaje**: solo ejecuta «grasp the seed below the gripper»; la cadena de tarea es fija y no admite instrucciones nuevas.
- **Sin resultados de evaluación**: no hay tasas de éxito ni número de ensayos publicados, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- **Entrenamiento exclusivamente simulado**: 100 episodios y 29.508 fotogramas generados en simulación con fondo blanco; es esperable una brecha de dominio considerable al pasar a hardware real con iluminación, texturas y calibración distintas.
- **Riesgo de sobreajuste**: con 40.000 pasos sobre 100 episodios y una única tarea, la política puede memorizar posiciones iniciales y apariencia del objeto en lugar de generalizar.
- **Dependencia estricta de la configuración de cámara**: los nombres de cámara (`top`, `wrist`) y la resolución 480×640 deben coincidir con los usados en el entrenamiento; cualquier cambio de encuadre o de intrínsecos degrada el comportamiento.
- **Acoplamiento a la morfología del robot**: el espacio de acción de 6 dimensiones corresponde a `so_follower` (SO-101); no es trasladable directamente a otros brazos sin reentrenamiento.
- **Sesgos**: no se documentan análisis de sesgo; en este dominio, el sesgo relevante es la distribución de posiciones, colores y condiciones del dataset simulado, que se hereda tal cual.
- **Alucinación**: no aplica en el sentido lingüístico, pero sí existe el riesgo de generar acciones plausibles y erróneas en estados fuera de distribución, sin señal de incertidumbre asociada.
- **Latencia**: el control requiere sostener 30 FPS; un rendimiento inferior puede producir trayectorias inseguras o fallos de agarre.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y citar tanto el método (arXiv:2304.13705) como LeRobot.
- **Metadatos incompletos**: no se documentan cuantizaciones, hiperparámetros de ACT ni el contenido detallado del dataset, lo que dificulta la reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RafaelJaime/act-sim-white-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-white-v2
- Visualización del dataset en el Space de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-white-v2
- Artículo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada a esta ficha no devolvió resultados técnicos relevantes sobre el modelo; únicamente aparecieron páginas sin relación con robótica ni con inteligencia artificial, por lo que se han descartado y no se incluyen.
