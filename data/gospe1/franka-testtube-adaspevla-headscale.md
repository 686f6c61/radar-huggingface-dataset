# Gospe1/Franka-TestTube-AdaSpeVLA-HeadScale

## Resumen

AdaSpeVLA es una política de visión-lenguaje-acción (VLA) para control robótico, publicada por el usuario Gospe1 en Hugging Face, que aplica una cabeza de acción basada en flow matching con splines B y nudos aprendidos sobre el backbone π0.5 (PaliGemma) de OpenPI. El repositorio contiene dos checkpoints de inferencia (tamaños M y L) entrenados para la tarea concreta de colocar un tubo de ensayo en una gradilla con un brazo Franka, a partir del prompt `Place the test tube into the test tube rack.`

El modelo no es un modelo de lenguaje general, sino un artefacto de investigación centrado en un estudio de escalado de la cabeza de acción: la receta de entrenamiento es idéntica entre ambas variantes y solo cambia el ancho, número de capas y número de cabezas del flow head (768/12/12 con `cond_dim` 512 frente a 1024/18/16 con `cond_dim` 1024, lo que supone 159 M y 421 M parámetros en la cabeza de acción respectivamente). El backbone se inicializa desde `pi05_base` y se ajusta completamente.

La relevancia es acotada: se trata de un checkpoint de tarea única, con 89 de 99 episodios de un dataset propio de teleoperación, evaluación exclusivamente en bucle abierto sobre 10 episodios retenidos y sin resultados en robot real. El repositorio ocupa 10,1 GB y no registra descargas ni likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone π0.5 (PaliGemma) con cabeza de acción de flow matching con splines B cúbicos, nudos aprendidos y cabeza adaptativa de intervalo de consulta |
| Parametros totales | no disponible (solo se publican los parámetros de la cabeza de acción: 159 M en M, 421 M en L) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, cabeza de timing en float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints Orbax/OpenPI (`params/` en bfloat16, sin estado del optimizador) más `assets/.../norm_stats.json` |

## Arquitectura y entrenamiento

El modelo combina el backbone π0.5 basado en PaliGemma (inicializado desde `pi05_base` y ajustado por completo) con una cabeza de acción de flow matching que genera trayectorias como splines B cúbicos con 11 puntos de control y 16 pasos por chunk (1,5 s a 10 Hz). Una cabeza adicional de timing predice el intervalo de consulta (rango 0,2–1,5 s) y el número de pasos a ejecutar, con etiquetas de nudos derivadas del movimiento medido y del estado comandado del gripper, normalizadas mediante densidad de nudos con calibración `e_crit` 9,9301 y `motion_scale` [0,020741, 0,064389, 0,053121, 0,035445, 0,036512, 0,04623].

El entrenamiento sigue la rama de robot real `adaspe_train` (commit `6adec69`, revisión del 10 de noviembre de 2026). La etapa de acción consta de 20.000 pasos con AdamW, warmup coseno de 1.000 pasos, LR pico 2,5e-5, decaimiento a 30.000, EMA 0,99 y batch 32; la etapa de timing añade 10.000 pasos sobre el checkpoint de 20k entrenando solo la cabeza de timing. Las cabezas plugin se inicializan aleatoriamente con semilla 0. Los datos provienen del dataset `dddddsds31341/test-tube-lerobot` (revisión `29d821a`), usando 89 de 99 episodios y reteniendo los episodios 1, 3, 7, 17, 25, 28, 47, 57, 76 y 80 para evaluación. La única diferencia respecto a la receta por defecto (384/6/6, `cond_dim` 512) es el tamaño del flow head.

## Capacidades

- Generación de comandos de acción densos para un brazo Franka: `sample_spline` devuelve 16 comandos normalizados de delta en marco del cuerpo a 0,1 s cada uno.
- Predicción adaptativa del horizonte de ejecución mediante la cabeza de timing (`query_interval` y `execute_steps`), lo que permite reconsultar la política antes o después según la fase de la tarea.
- Comprensión de instrucciones en lenguaje natural para condicionar la política (prompt de tarea en inglés).
- Percepción visual integrada a través del backbone PaliGemma (visión-lenguaje).
- Ejecución de una tarea de manipulación concreta: inserción de un tubo de ensayo en una gradilla.
- No soporta tool calling, function calling, razonamiento multi-paso genérico ni generación de texto libre: es una política motora, no un asistente.
- Capacidades multilingües: no disponibles; el prompt de entrenamiento está en inglés.

## Casos de uso

- Investigación en cabezas de acción para VLA: comparar el efecto del escalado del flow head (M frente a L) manteniendo constante el resto de la receta, usando los checkpoints como referencia reproducible en experimentos propios.
- Benchmark de flow matching con splines B: evaluar si la parametrización por splines con nudos aprendidos mejora la suavidad y la fidelidad de trayectorias frente a cabezas de acción convencionales en tareas de inserción.
- Estudio de políticas con horizonte adaptativo: analizar el impacto de la cabeza de timing (intervalo 0,2–1,5 s) en la frecuencia de reconsulta y en la robustez ante cambios de fase de la tarea.
- Punto de partida para fine-tuning en tareas de ensamblaje similares: al estar el backbone inicializado desde `pi05_base` y liberarse los parámetros EMA completos, sirve como inicialización para tareas de manipulación con pocos episodios.
- Validación de pipelines OpenPI/Orbax: el repositorio incluye el código de carga con mapeo de claves para evitar el error de estructura de pytree que produce `cfg.load(restore_params(...))`, útil para probar infraestructura de inferencia.
- Reproducción de experimentos de robot real en laboratorio: una vez validados el orden de observaciones, unidades, normalización y límites del espacio de trabajo, el checkpoint puede desplegarse en un Franka para replicar la tarea del tubo de ensayo.

## Benchmarks y rendimiento

Evaluación en bucle abierto sobre 10 episodios retenidos (1.024 fotogramas; acciones normalizadas sobre el chunk de 16 pasos). R² relativo a predecir la media por dimensión de las acciones retenidas.

| Tamaño (20k) | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión de signo del gripper | MAE / corr. de intervalo |
|---|---|---|---|---|---|---|---|---|---|
| M | 0,40 | 0,82 | 0,73 | 0,12 | 0,12 | 0,20 | 0,59 | 92,0% | 0,329 s / 0,52 |
| L | 0,38 | 0,81 | 0,72 | 0,11 | 0,09 | 0,16 | 0,57 | 91,2% | 0,329 s / 0,49 |

No se han publicado resultados en robot real ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 10,1 GB, lo que da una cota inferior del espacio necesario para cargar los pesos en bfloat16; a ello hay que sumar el backbone PaliGemma completo y el estado de activaciones.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, se requiere una GPU con al menos 16–24 GB de memoria para una sola réplica, aunque el dato no está confirmado por el autor.
- Cabeza en GPU de consumo: probablemente sí en modelos con 24 GB o más (RTX 3090, RTX 4090), sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: el modelo requiere el código de la rama `adaspe_train/adaspe` y OpenPI `215abfb`, con JAX/Flax (NNX) y Orbax. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaSpeVLA M (este) | Cabeza de acción 159 M; backbone no disponible | no disponible | R² x/y/z 0,40/0,82/0,73; precisión de gripper 92,0% | Apache 2.0 | Hugging Face, 0 descargas |
| AdaSpeVLA L (este) | Cabeza de acción 421 M; backbone no disponible | no disponible | R² x/y/z 0,38/0,81/0,72; precisión de gripper 91,2% | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 baseline (`dddddsds31341/Franka-Test-Tube-pi05-step-20000`) | no disponible | no disponible | no disponible en esta ficha | no disponible | Referenciado en la model card como origen de `norm_stats.json` |
| Otros VLA de manipulación (p. ej. OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | No comparados en la información proporcionada |

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para colocar un tubo de ensayo en una gradilla con un Franka; no generaliza a otras tareas sin fine-tuning.
- Evaluación exclusivamente en bucle abierto sobre 10 episodios retenidos; no hay resultados en robot real, por lo que el rendimiento en hardware es desconocido.
- Los R² de orientación son muy bajos (0,09–0,20), lo que indica poca capacidad predictiva sobre las rotaciones; la política podría ser poco fiable en tareas que exijan orientación precisa.
- El escalado de la cabeza (M a L) no mejora los resultados en bucle abierto e incluso los empeora ligeramente en varias dimensiones, lo que cuestiona el beneficio del aumento de capacidad en este régimen de datos.
- El modelo requiere código específico de una rama de investigación (`adaspe_train`, commit `6adec69`) y OpenPI `215abfb`; la carga estándar falla por el mapeo de claves enteras de Orbax, lo que añade fricción de integración.
- Antes de usar en hardware hay que validar orden de observaciones, unidades, normalización y límites del espacio de trabajo en un entorno controlado, según advierte el propio autor.
- Sesgos conocidos: no documentados; al entrenarse con 89 episodios de un único operador y configuración, es probable un sesgo hacia las condiciones de recogida de datos.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de comandos de acción fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial, pero el checkpoint depende de código de investigación y de un backbone π0.5 cuyos términos no se detallan en la información disponible.
- Repositorio sin descargas ni validación comunitaria; la fecha de creación (2026-11-14) y la ausencia de resultados en robot real aconsejan tratarlo como material experimental.

## Enlaces

- Hugging Face: https://huggingface.co/Gospe1/Franka-TestTube-AdaSpeVLA-HeadScale
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
- Checkpoint baseline π0.5 referenciado: https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-step-20000
- OpenPI (repositorio de código): no disponible en la información proporcionada
- Paper o blog del método AdaSpeVLA: no disponible en la información proporcionada
