# Myungkyu/pi05_robotwin_vanilla_b128_60k

## Resumen

pi05_robotwin_vanilla_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica desarrollado por el usuario Myungkyu, publicado en Hugging Face bajo la librería LeRobot. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, la implementación pública de la arquitectura Pi0.5, entrenado sobre el conjunto de datos RoboTwin 2.0 en la configuración "co-train" del leaderboard oficial. El modelo recibe imágenes de tres cámaras (cabeza y muñecas izquierda/derecha), un estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce como salida objetivos articulares absolutos de 14 dimensiones.

El propósito del modelo es servir como baseline "vanilla" (sin modificaciones metodológicas) de referencia para la comunidad que investiga en manipulación robótica bimanual con el benchmark RoboTwin 2.0. Al ser un checkpoint reproducible con hiperparámetros documentados (batch 128, 60.000 pasos, entrenamiento en bf16), permite comparar de forma controlada nuevas propuestas frente a un punto de partida estándar.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y un tamaño de repositorio de 37,4 GB, lo que refleja los pesos en safetensors más los checkpoints intermedios. Es relevante ahora porque la comunidad de VLA open source necesita baselines bien documentados y reproducibles para evaluar avances en políticas robóticas generalistas, y este modelo cubre exactamente ese hueco para el benchmark RoboTwin 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (implementación LeRobot 0.5.2, commit 09808183) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; no se especifica cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pi0.5, implementada en la versión pública de LeRobot 0.5.2 (commit 09808183). Se trata de un modelo VLA que combina un backbone de visión-lenguaje con un cabezal de acción que genera secuencias de acciones ("action chunks") de longitud 50. Las entradas son tres vistas de cámara (cabeza, muñeca izquierda y muñeca derecha), un vector de estado articular de 14 dimensiones y la instrucción de la tarea en texto; la salida es un conjunto de objetivos articulares absolutos de 14 dimensiones. El entrenamiento se realizó en precisión bf16.

El ajuste fino se llevó a cabo sobre el conjunto de datos TianxingChen/RoboTwin2.0 en la configuración "co-train" del leaderboard: 50 tareas con 50 episodios `demo_clean` cada una, sobre el robot Aloha-AgileX con la exportación oficial de LeRobot. Los hiperparámetros son un batch de optimizador de 128 y 60.000 pasos de entrenamiento, con el checkpoint final publicado junto con checkpoints intermedios en los pasos 15.000, 30.000 y 45.000 (sin estado del optimizador). No se documentan detalles sobre RLHF, DPO ni innovaciones técnicas adicionales más allá de las propias de la arquitectura Pi0.5.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual: produce objetivos articulares absolutos de 14 dimensiones a partir de observaciones visuales y estado articular.
- Control guiado por instrucciones en lenguaje natural: la tarea se especifica mediante texto y el modelo condiciona la política de acción a dicha instrucción.
- Percepción multi-cámara: integra simultáneamente las vistas de cabeza y de ambas muñecas para construir la representación del entorno.
- Generación de chunks de acción: emite secuencias de 50 acciones por inferencia, lo que reduce la frecuencia de reevaluación del modelo.
- Ejecución de tareas del benchmark RoboTwin 2.0: entrenado específicamente en las 50 tareas del conjunto co-train con el robot Aloha-AgileX.
- Checkpoints intermedios para análisis: permite evaluar el rendimiento en distintos puntos del entrenamiento (pasos 15.000, 30.000, 45.000 y final).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso

- Baseline de referencia para investigación en VLA: sirve como punto de comparación controlado en el leaderboard de RoboTwin 2.0, ya que sus hiperparámetros y datos de entrenamiento están documentados y son reproducibles.
- Evaluación de nuevas metodologías de manipulación bimanual: cualquier propuesta que modifique la arquitectura, los datos o el entrenamiento puede compararse contra este checkpoint "vanilla" para aislar el efecto de la innovación.
- Estudio de curvas de aprendizaje en políticas robóticas: los checkpoints intermedios (15k, 30k, 45k) permiten analizar cómo evoluciona la competencia de la política a lo largo del entrenamiento.
- Reproducción de experimentos del benchmark RoboTwin 2.0: al seguir la exportación oficial de LeRobot y la configuración co-train, facilita replicar resultados publicados en el leaderboard.
- Desarrollo de pipelines de inferencia robótica: integrable en LeRobot para probar el bucle percepción-acción con tres cámaras y estado articular de 14 dimensiones en entornos simulados Aloha-AgileX.
- Investigación en co-entrenamiento multi-tarea: al cubrir 50 tareas distintas, permite estudiar transferencia entre tareas y especialización dentro de una misma política.
- Docencia y formación en robótica con aprendizaje profundo: como ejemplo completo y de tamaño moderado (4,1B parámetros) de un modelo VLA entrenado con un benchmark estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, los pesos en bf16 ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el backbone de visión-lenguaje y las activaciones de las tres cámaras, por lo que se recomienda un margen adicional.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia cómoda con batch elevado; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con batch pequeño.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en GPUs con 16-24 GB de VRAM (RTX 4090, RTX 4080, A6000), siempre que se gestione con cuidado el batch y las tres vistas de cámara.
- Opciones de despliegue: LeRobot (librería nativa del modelo) es la vía principal; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para un modelo de política robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_robotwin_vanilla_b128_60k | 4,14B | no disponible | RoboTwin 2.0 co-train (resultados no publicados) | no disponible | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Myungkyu/rldx2_pi05_robotwin_vanilla_b128_60k | no disponible | no disponible | RoboTwin 2.0 co-train (baseline del proyecto RLDX-2) | no disponible | Hugging Face (LeRobot) |

El modelo base `lerobot/pi05_base` es la referencia directa: este checkpoint es un ajuste fino suyo sobre RoboTwin 2.0, por lo que la comparación mide el efecto del entrenamiento específico en el benchmark. La variante `rldx2_pi05_robotwin_vanilla_b128_60k` del mismo autor emplea la misma configuración de datos y entrenamiento pero en el contexto del proyecto RLDX-2, lo que permite contrastar dos baselines con idéntico punto de partida. No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un baseline "vanilla" sin modificaciones metodológicas: no incorpora mejoras de arquitectura ni de entrenamiento más allá de las de Pi0.5 y el ajuste fino estándar.
- Entrenado exclusivamente en el conjunto RoboTwin 2.0 (50 tareas, 50 episodios `demo_clean`): su generalización fuera de esas tareas y del robot Aloha-AgileX no está documentada.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; al ser un modelo de acción robótica, el riesgo principal es la ejecución incorrecta de movimientos en entornos no vistos.
- El estado del optimizador no se incluye en el checkpoint, por lo que no es posible reanudar el entrenamiento exactamente desde el punto final.
- Los checkpoints intermedios son un subconjunto de inferencia (no incluyen estado del optimizador) y deben tratarse como artefactos de evaluación, no de reentrenamiento.
- El repositorio ocupa 37,4 GB, lo que exige planificar el almacenamiento y la descarga selectiva mediante `allow_patterns`/`ignore_patterns`.
- No se documentan resultados de benchmarks, por lo que no es posible cuantificar su rendimiento frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi05_robotwin_vanilla_b128_60k
- Variante RLDX-2 del mismo autor: https://huggingface.co/Myungkyu/rldx2_pi05_robotwin_vanilla_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Librería LeRobot: https://github.com/huggingface/lerobot
