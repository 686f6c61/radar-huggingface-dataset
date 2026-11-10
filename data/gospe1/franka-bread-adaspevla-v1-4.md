# Gospe1/Franka-Bread-AdaSpeVLA-v1.4

## Resumen

Franka-Bread-AdaSpeVLA-v1.4 es un modelo de visión-lenguaje-acción (VLA) para robótica manipulatoria, desarrollado por el usuario Gospe1 y publicado en Hugging Face. Se trata de un fine-tuning del backbone π0.5 de OpenPI (PaliGemma, compuesto por gemma_2b y el codificador visual SigLIP So400m/14) sobre la tarea concreta de recoger dos rebanadas de pan de una tostadora y colocarlas en un plato, empleando un brazo Franka. El modelo sustituye la cabeza de acción original de π0.5 por una cabeza propia denominada AdaSpeVLA.

La innovación principal reside en esa cabeza de acción: un esquema de flow matching basado en B-splines cúbicos con puntos de control y nudos aprendidos, junto con una cabeza de temporización adaptativa que predice el intervalo de consulta (query interval) entre 0,2 y 0,8 segundos. Esto permite al modelo no solo generar un chunk de 13 acciones (1,2 s a 10 Hz), sino también decidir cuándo volver a consultar, lo que reduce el número de inferencias necesarias en bucle cerrado.

El modelo se distribuye como checkpoints Orbax de OpenPI en tres etapas de entrenamiento (20k, 30k y 40k pasos de acción, cada una con 10k pasos adicionales de la cabeza de temporización), con pesos en bfloat16 y float32, bajo licencia Apache 2.0. Es un modelo de investigación con validación únicamente en bucle abierto sobre frames de entrenamiento, sin resultados en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en transformer: backbone PaliGemma (gemma_2b + SigLIP So400m/14) con cabeza de acción AdaSpeVLA (flow matching con B-spline cúbico y cabeza de temporización) |
| Parametros totales | no disponible (backbone gemma_2b de aproximadamente 2 mil millones más cabeza de acción; el total exacto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 para backbone y cabeza de acción, float32 para la cabeza de temporización) |
| Idiomas soportados | no disponible (prompt de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint OpenPI/Orbax (`params/` y `assets/.../norm_stats.json`), sin estado de optimizador (solo inferencia) |

## Arquitectura y entrenamiento

El modelo parte del backbone π0.5 de OpenPI, formado por el modelo de lenguaje gemma_2b y el codificador visual SigLIP So400m/14, inicializado desde `pi05_base` y sometido a fine-tuning completo. El experto de acción original de π0.5 no se utiliza; en su lugar se añaden cabezas plugin inicializadas aleatoriamente con semilla 0. La cabeza de acción AdaSpeVLA implementa flow matching sobre una representación B-spline cúbica con 8 puntos de control y nudos aprendidos, con una red de flujo de 384 dimensiones ocultas, 6 capas, 6 cabezas de atención, dimensión de condicionamiento 512 y 15 pasos de ODE. La cabeza de temporización predice el intervalo de consulta entre 0,2 y 0,8 s.

Los datos de entrenamiento provienen del dataset `dddddsds31341/bread-lerobot` en la revisión `a45b8ba`: 100 episodios y 28.380 frames a 10 Hz, con dos cámaras de 128×128. Se emplea `LeRobotLiberoDataConfig` con `prompt_from_task=True`, estado discretizado en el prompt (por defecto en π0.5) y normalización por cuantiles. El objetivo son acciones delta de 7 dimensiones en el marco del cuerpo, normalizadas, con pinza en −1/0/+1. El chunk de acción es de 13 pasos (1,2 s). La pérdida combina MSE de flujo más 0,5 × KL de nudos en la etapa de acción; en la etapa de temporización se usa log-MSE sobre el intervalo de consulta y solo se entrena la cabeza de temporización, con el resto congelado. Se usa batch 32, AdamW (b1 0,9, b2 0,95, wd 1e-10, clip 1,0), LR coseno (warmup 1k, pico 2,5e-5, decay 30k, final 2,5e-6) y EMA 0,99.

## Capacidades

- Generación de acciones robóticas de manipulación: produce chunks densos de 13 acciones (posición y orientación delta de 7 dimensiones, incluida la pinza) a partir de observaciones visuales y del estado.
- Control de pinza: la salida de pinza se umbraliza en ±0,5 para abrir, mantener o cerrar.
- Predicción adaptativa del intervalo de consulta: la cabeza de temporización estima cuándo debe volver a consultarse el modelo (0,2–0,8 s).
- Representación B-spline: genera puntos de control y nudos además del chunk denso, lo que permite trayectorias suaves.
- Condicionamiento por prompt de tarea: acepta instrucciones en lenguaje natural (por ejemplo, "Pick up both slices of bread from the toaster and place them on the plate").
- Entrada multimodal: dos cámaras de 128×128 más estado del robot discretizado en el prompt.
- No soporta tool calling, function calling, agentes multi-paso genéricos ni capacidades de audio; es un modelo especializado en una única tarea de manipulación.

## Casos de uso

- Investigación en VLA para manipulación con Franka: sirve como referencia reproducible de cómo sustituir la cabeza de acción de π0.5 por una cabeza de flow matching con B-splines, útil para grupos que estudien arquitecturas de acción alternativas.
- Benchmark de cabezas de acción: el modelo incluye una comparación directa con el baseline `Franka-Bread-pi05-step-20000`, lo que permite evaluar el impacto de AdaSpeVLA frente a la cabeza original de π0.5 con el mismo presupuesto de entrenamiento.
- Estudio de temporización adaptativa en control: la cabeza de temporización permite analizar políticas que deciden dinámicamente la frecuencia de re-planificación, reduciendo consultas al modelo en tramos de trayectoria predecibles.
- Tareas de pick-and-place con pinza paralela: el esquema de acciones delta de 7 dimensiones con pinza ternaria es directamente aplicable a tareas de recogida y colocación en entornos de laboratorio con Franka.
- Reproducción de pipelines OpenPI/Orbax: el código de carga incluido en la model card sirve como ejemplo práctico para cargar checkpoints con cabezas plugin cuyos nombres de capas usan claves enteras.
- Base para fine-tuning en tareas similares: al estar bajo Apache 2.0 y con receta de entrenamiento documentada, puede reutilizarse como punto de partida para otras tareas de manipulación con datasets LeRobot.
- Validación de pipelines de datos LeRobot: el uso de `LeRobotLiberoDataConfig` y normalización por cuantiles lo hace útil para probar flujos de entrenamiento con datasets en formato LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye una comprobación en bucle abierto sobre 512 frames fijos del dataset (vistos en entrenamiento, sin split de validación), que no mide generalización:

| Metrica | step-20000 | step-30000 | step-40000 |
|---|---|---|---|
| R² por dimensión de acción | 0,82–0,98 | 0,91–0,99 | 0,93–0,99 |
| Precisión de signo de pinza (abrir/cerrar) | 99,1% | 99,5% | 99,7% |
| Intervalo de consulta vs. etiqueta: MAE / correlación | 0,134 s / 0,65 | 0,133 s / 0,64 | 0,132 s / 0,65 |
| Proporción de intervalos ≤ 0,3 s: predicho / etiqueta | 1,6% / 16% | 1,4% / 16% | 1,4% / 16% |

La cabeza de temporización resulta conservadora: rara vez predice intervalos cortos (0,2–0,3 s). No se incluyen resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de un backbone de aproximadamente 2 mil millones de parámetros en bfloat16 más cabezas plugin, la huella de pesos ronda los 4–5 GB, pero no se documenta el consumo total en inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del backbone, cabría esperar GPUs con al menos 16 GB de VRAM, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada por el autor; no se indica si cabe en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el modelo se carga mediante OpenPI en JAX/Flax (NNX) con checkpoints Orbax; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo VLA.
- Latencia y throughput: no disponibles. Se conoce el chunk de acción de 13 pasos a 10 Hz (1,2 s de ejecución) y 15 pasos de ODE en la cabeza de flujo, pero no se documentan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka-Bread-AdaSpeVLA-v1.4 | Backbone ~2B + cabeza plugin (total no disponible) | no disponible | R² 0,93–0,99 y precisión de pinza 99,7% en bucle abierto (step-40000, frames de entrenamiento) | Apache 2.0 | Hugging Face, checkpoints Orbax |
| dddddsds31341/Franka-Bread-pi05-step-20000 (baseline) | Backbone π0.5 (~2B) + experto de acción π0.5 | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face |
| π0.5 base (OpenPI `pi05_base`) | ~2B (gemma_2b + SigLIP So400m/14) | no disponible | no disponible | no disponible | OpenPI |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación documentada es la comprobación en bucle abierto frente al baseline, que no se incluye en la model card con cifras del baseline.

## Limitaciones y advertencias

- No hay split de validación: la comprobación en bucle abierto usa frames vistos en entrenamiento, por lo que no mide generalización.
- No se incluyen resultados en robot real; el comportamiento en hardware no está validado.
- La cabeza de temporización es conservadora y apenas predice intervalos cortos (1,4–1,6% frente al 16% de las etiquetas), lo que puede alargar innecesariamente la ejecución del chunk.
- Modelo especializado en una única tarea (recoger pan de la tostadora y colocarlo en un plato) con un prompt concreto; no es un modelo generalista.
- El proceso de carga requiere un mapeo manual de claves debido a la conversión de claves enteras a cadenas en Orbax; la carga directa con `model_config.load(restore_params(...))` falla.
- Antes de ejecutar en hardware debe validarse el orden de observaciones, unidades, normalización y límites del espacio de trabajo en un entorno controlado.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de acción, el riesgo se traduce en acciones incorrectas o inseguras en el robot.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes de OpenPI y PaliGemma cuyas licencias deben verificarse por separado.
- Idiomas soportados no documentados; el prompt de tarea está en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/Gospe1/Franka-Bread-AdaSpeVLA-v1.4
- Baseline de comparación: https://huggingface.co/dddddsds31341/Franka-Bread-pi05-step-20000
- Dataset: https://huggingface.co/datasets/dddddsds31341/bread-lerobot
- Código de entrenamiento: https://github.com/Jack414b/adaspevla_train
- OpenPI (referencia `215abfb`): no disponible enlace directo en la información proporcionada
