# Gospe1/Franka-Bread-AdaSpeVLA-Expert

## Resumen
Franka Bread AdaSpeVLA Expert es un checkpoint de investigación para robótica manipulativa desarrollado por el usuario Gospe1. Se trata de una política visión-lenguaje-acción (VLA) construida sobre el backbone π0.5 de PaliGemma, en la que los puntos de control de una representación de acciones mediante B-splines cúbicos (AdaSpeVLA) son generados por el action expert preentrenado de π0.5 (Gemma-300M con adaRMS) en lugar del flow transformer propio de AdaSpeVLA. El modelo resuelve una tarea concreta y acotada: recoger dos rebanadas de pan de una tostadora y colocarlas en un plato, sobre un robot Franka.

El interés técnico reside en la comparación de cabezas de acción: el autor evalúa si un action expert preentrenado a gran escala puede sustituir a un flow transformer entrenado desde cero con los mismos datos y receta. El resultado es que el expert ajusta mucho mejor los datos de entrenamiento (R² de 0,94-0,99 frente a 0,16-0,92 de las cabezas flow) pero generaliza a episodios nuevos de forma prácticamente equivalente, lo que constituye un dato relevante para quienes investigan transferencia en políticas VLA.

El repositorio ocupa 5,3 GB y contiene un único checkpoint de inferencia en formato OpenPI/Orbax (no safetensors ni GGUF), con pesos en bfloat16 y una cabeza de timing en float32. No incluye resultados en robot real, solo evaluación open-loop, y no se han publicado benchmarks estándar de VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone π0.5 PaliGemma con action expert π0.5 (Gemma-300M + adaRMS) y cabezas AdaSpeVLA de B-spline cúbico y timing adaptativo |
| Parametros totales | no disponible (el action expert es Gemma-300M; el backbone PaliGemma no se cuantifica en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16, cabeza de timing en float32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones en inglés: prompt de ejemplo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenPI/Orbax (directorio `params/` con parámetros EMA; sin estado de optimizador) |

## Arquitectura y entrenamiento
El modelo combina el backbone π0.5 de PaliGemma con el action expert de π0.5 (`generator="pi05_expert"`), cargado desde `pi05_base`. La política genera chunks de 16 pasos (1,5 s a 10 Hz) representados como 11 puntos de control de un B-spline cúbico, con un intervalo de consulta adaptativo entre 0,2 y 1,5 s. La información de knots entra en cada token de punto de control mediante una proyección `cp_knot_proj` inicializada a cero. El action expert sigue la convención de flujo de π0.5 (x_t = t·noise + (1−t)·data, t ~ Beta(1,5,1)) con 10 pasos de ODE.

El entrenamiento se realizó en dos etapas sobre el dataset `dddddsds31341/bread-lerobot` (90 de 100 episodios; los episodios 1, 3, 7, 17, 25, 29, 47, 58, 77 y 81 se reservaron para evaluación). La etapa de acción comprende 20.000 pasos con fine-tuning completo desde `pi05_base` (backbone y action expert), AdamW, warmup coseno de 1k pasos, LR pico 2,5e-5, decaimiento a 30k, EMA 0,99, batch 32 y FSDP sobre 4 GPUs. La etapa de timing añade 10.000 pasos entrenando solo la cabeza de timing. La pérdida de la etapa de acción (MSE de flujo + 0,5 · KL de knots) bajó de 0,446 a 1k pasos hasta 0,119 en el último cuarto, frente a ~0,19 de la misma receta con el flow transformer de AdaSpeVLA.

## Capacidades
- Generación de comandos de acción densos para control robótico: `model.sample_spline(rng, observation)` devuelve `dense_actions` (16 comandos normalizados), `query_interval` y `execute_steps`.
- Control de la frecuencia de consulta mediante una cabeza de timing adaptativa que predice cuántos comandos ejecutar antes de volver a observar.
- Representación compacta de trayectorias mediante B-splines cúbicos con knots aprendidos, lo que reduce el número de tokens de acción frente a una secuencia densa.
- Condicionamiento por instrucción en lenguaje natural (prompt de la tarea de pan).
- Percepción visión-lenguaje heredada del backbone PaliGemma (procesamiento conjunto de imagen e instrucción).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM de propósito general; es una política de control, no un asistente.
- Capacidades multilingües: no documentadas; el único prompt de ejemplo está en inglés.

## Casos de uso
- Investigación en representaciones de acción: comparar el action expert preentrenado de π0.5 con flow transformers de 20M, 159M y 421M bajo la misma receta y datos, usando las tablas de R² open-loop del model card como referencia reproducible.
- Estudio de timing adaptativo en manipulación: analizar el sesgo de la cabeza de timing hacia el centro del rango (intervalo medio predicho 1,10 s frente a 1,12 s de etiqueta) y su efecto en el número de comandos ejecutados por consulta (~12).
- Réplica de experimentos de fine-tuning VLA: el model card documenta código (`cognaclee/Frank-Insert-Wipe` @ `037c782`, carpeta `code/adaspe_train`), versión de OpenPI (`215abfb`) y configuración (`bread_adaspe_expert_*`), lo que permite reproducir el pipeline completo.
- Benchmark interno de políticas sobre tarea de pick-and-place: la tarea de pan de la tostadora al plato sirve como banco de pruebas controlado para medir generalización a episodios no vistos.
- Desarrollo de plugins de carga de checkpoints Orbax: el model card incluye un snippet que resuelve el fallo de `cfg.load(restore_params(...))` por claves de capas enteras devueltas como strings, útil para ingeniería de infraestructura.
- Base para experimentos de sustitución de cabezas de acción: el checkpoint permite intercambiar la cabeza de timing fija por ejecución de un número fijo de comandos (por ejemplo, 8) para aislar su contribución.

## Benchmarks y rendimiento
Evaluación open-loop sobre 1.024 frames por conjunto, con R² por dimensión de acción relativo a predecir la media por dimensión:

| Conjunto | x | y | z | rx | ry | rz | gripper | acierto signo gripper | MAE intervalo / corr. |
|---|---|---|---|---|---|---|---|---|---|
| Episodios reservados | 0,18 | 0,92 | 0,82 | 0,14 | 0,32 | 0,20 | 0,75 | 95,1% | 0,300 s / 0,56 |
| Frames de entrenamiento | 0,94 | 0,99 | 0,98 | 0,93 | 0,91 | 0,92 | 0,97 | 99,2% | 0,259 s / 0,74 |

Comparación con cabezas flow de AdaSpeVLA sobre los mismos frames reservados y misma receta:

| Cabeza flow | x | y | z | rx | ry | rz | gripper | corr. intervalo |
|---|---|---|---|---|---|---|---|---|
| 20M | 0,20 | 0,92 | 0,80 | 0,14 | 0,27 | 0,20 | 0,72 | 0,60 |
| 159M | 0,18 | 0,92 | 0,81 | 0,19 | 0,26 | 0,18 | 0,73 | 0,58 |
| 421M | 0,16 | 0,92 | 0,82 | 0,20 | 0,27 | 0,19 | 0,73 | 0,57 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni resultados en robot real.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 5,3 GB, lo que da una cota inferior del orden de 6-8 GB para cargar pesos en bfloat16, sin contar activaciones ni el resto del stack de OpenPI.
- GPU recomendadas: no especificadas en el model card. El entrenamiento usó 4 GPUs con FSDP; para inferencia se requiere JAX con soporte de GPU, sin modelo concreto indicado.
- Cabe en GPU consumer: no confirmado; el tamaño del checkpoint (5,3 GB) es compatible en términos de memoria con GPUs de 12-24 GB, pero la información no lo verifica.
- Opciones de despliegue: OpenPI (`215abfb`) con el código `code/adaspe_train` de `cognaclee/Frank-Insert-Wipe` @ `037c782`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un checkpoint Orbax de política robótica).
- Latencia y throughput: no disponibles. El modelo opera a 10 Hz (chunks de 16 pasos = 1,5 s) y ejecuta unos 12 comandos por consulta según la cabeza de timing.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka Bread AdaSpeVLA Expert (este) | Action expert Gemma-300M; total no disponible | no disponible | R² open-loop en episodios reservados: 0,14-0,92 según dimensión; 95,1% acierto de signo de gripper | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| AdaSpeVLA con flow transformer 421M (misma receta) | 421M (cabeza) | no disponible | R² open-loop: 0,16-0,92; corr. intervalo 0,57 | no disponible en la información | Referenciado en el model card |
| π0.5 baseline `dddddsds31341/Franka-Bread-pi05-step-20000` | no disponible | no disponible | no disponible (solo se indica que comparte `norm_stats.json`) | no disponible en la información | Hugging Face (referenciado) |

## Limitaciones y advertencias
- No se han publicado resultados en robot real; toda la evaluación es open-loop sobre 1.024 frames, lo que no garantiza comportamiento correcto en hardware.
- La cabeza de timing es más débil que con el flow head: su entrada `cond` deja de entrenarse con la pérdida de flujo, y está sesgada hacia el centro del rango (predice ≤ 0,3 s en el 4,3% de casos frente al 14,4% de etiquetas; ≥ 1,4 s en el 32% frente al 57%).
- El expert ajusta mucho mejor el entrenamiento (R² 0,94-0,99) que los episodios nuevos (R² 0,14-0,92), con dimensiones como rx (0,14) y x (0,18) muy por debajo de lo útil; indica sobreajuste a los datos vistos.
- Entrenado con solo 90 episodios de una única tarea (pan en tostadora); no hay evidencia de generalización a otras tareas, objetos o entornos.
- La carga del checkpoint requiere un mapeo manual de claves por el fallo de `cfg.load(restore_params(...))` con claves de capas enteras devueltas como strings desde Orbax; no es un checkpoint plug-and-play.
- El model card advierte explícitamente de validar orden de observaciones, unidades, normalización y límites del espacio de trabajo antes de ejecutar en hardware.
- Idiomas soportados no documentados; el prompt de la tarea está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en robot real desaconseja cualquier despliegue en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de validación por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/Gospe1/Franka-Bread-AdaSpeVLA-Expert
- Código de entrenamiento: `cognaclee/Frank-Insert-Wipe` @ `037c782`, carpeta `code/adaspe_train` (referenciado en el model card; sin URL directa en la información disponible)
- OpenPI versión `215abfb` (referenciado en el model card; sin URL directa en la información disponible)
- Dataset: `dddddsds31341/bread-lerobot` @ `a45b8ba` (referenciado en el model card; sin URL directa en la información disponible)
- Baseline π0.5: `dddddsds31341/Franka-Bread-pi05-step-20000` (referenciado en el model card; sin URL directa en la información disponible)
