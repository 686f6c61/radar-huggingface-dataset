# mlnha/gr00t-n15-pnp108-n15base_filt_ours_10k

## Resumen

`mlnha/gr00t-n15-pnp108-n15base_filt_ours_10k` es un checkpoint de investigación derivado de NVIDIA GR00T-N1.5-3B, un modelo fundacional visión-lenguaje-acción (VLA) para robótica. El autor, `mlnha`, lo ha afinado mediante clonación de comportamiento (behavior cloning, BC) sobre rollouts del entorno de simulación RoboCasa365, concretamente en la tarea PickPlaceCounterToCabinet. No se trata de un modelo de lenguaje generalista, sino de una política robótica que recibe observaciones visuales y produce acciones motrices.

El problema que aborda es la calidad de la señal de entrenamiento en BC: en lugar de usar todos los segmentos de las trayectorias, el autor filtra únicamente los fragmentos de 16 fotogramas en los que su estimador de progreso de tarea indica un delta positivo, es decir, donde la política base realmente avanza hacia el objetivo. De este modo se plantea si filtrar por progreso mejora la eficacia del aprendizaje por imitación frente a usar las trayectorias completas.

Es relevante como artefacto de investigación reproducible: incluye logs de entrenamiento, curvas de TensorBoard y una evaluación sistemática en simulación con semillas fijas (2000–2049) a lo largo de cinco checkpoints intermedios. El repositorio ocupa 37,9 GB y se publica bajo la librería `gr00t`, sin licencia declarada ni idiomas especificados, lo que limita su uso fuera de contextos de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional visión-lenguaje-acción (VLA) GR00T-N1.5; detalles internos no disponibles en la model card |
| Parametros totales | 3B (heredados de nvidia/GR00T-N1.5-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | no disponible |
| Formato de pesos | safetensors (el repo incluye también logs de TensorBoard y `train.log`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.5-3B`, un VLA de 3B parámetros que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones para control de robots. El autor no detalla en la model card la arquitectura interna (backbone, mecanismo de fusión multimodal ni cabeza de acciones), por lo que esa información debe consultarse en la documentación del modelo base.

El ajuste fino se realizó con clonación de comportamiento pura sobre el conjunto `pnp108`, compuesto por 108 rollouts generados por el checkpoint-120000 de GR00T sobre la tarea PickPlaceCounterToCabinet en RoboCasa365 (72 de ellos exitosos), en formato LeRobot v2.1. El filtrado clave consiste en conservar solo los segmentos cuyo delta de progreso estimado por el autor es mayor que cero en cada bloque de 16 fotogramas. El entrenamiento usó una sola GPU, batch de 64, learning rate 3e-5 con schedule coseno y warmup de 0,05, semilla 42 y el embodiment `new_embodiment`. No se incluyen los estados del optimizador en el repositorio.

## Capacidades

- Generación de acciones robóticas para manipulación de objetos en entornos simulados (PickPlaceCounterToCabinet en RoboCasa365).
- Percepción visual a partir de observaciones del entorno simulado.
- Condicionamiento por instrucción de tarea (modelo VLA del que hereda la interfaz).
- Ejecución de políticas de imitación entrenadas sobre rollouts filtrados por progreso.
- Evaluación reproducible en simulación con semillas de escena y de política fijas.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Investigación en clonación de comportamiento: sirve como punto de partida reproducible para estudiar el efecto del filtrado por progreso en la calidad de las políticas resultantes, con curvas de éxito por checkpoint ya publicadas.
- Reproducción de experimentos en RoboCasa365: el conjunto de semillas (2000–2049) y la política con semilla 1 permiten replicar la evaluación y comparar contra nuevas variantes de filtrado.
- Línea base para políticas de manipulación pick-and-place: el checkpoint-10000 alcanza 29/50 éxitos en simulación, un valor de referencia útil para medir mejoras de métodos alternativos.
- Estudio de señales de recompensa aprendidas: el estimador de progreso usado para filtrar puede evaluarse de forma independiente comparando su correlación con el éxito final de la política.
- Ajuste fino con datos propios en formato LeRobot v2.1: la receta (batch 64, LR 3e-5 coseno, warmup 0,05, semilla 42, embodiment `new_embodiment`) es reutilizable para otros conjuntos de manipulación.
- Docencia y divulgación sobre VLA: el repositorio incluye `train.log` y `runs/` de TensorBoard, lo que facilita mostrar el proceso completo de entrenamiento y evaluación de una política robótica.

## Benchmarks y rendimiento

Evaluación en simulación RoboCasa365 (escenas con semilla 2000+, política con semilla 1; éxito = tarea completada al final del episodio):

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 24/50 (semillas 2000–2049) |
| checkpoint-4000 | 20/50 (semillas 2000–2049) |
| checkpoint-6000 | 24/50 (semillas 2000–2049) |
| checkpoint-8000 | 27/50 (semillas 2000–2049) |
| checkpoint-10000 | 29/50 (semillas 2000–2049) |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otras políticas sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para un modelo de 3B parámetros en precisión completa se requiere aproximadamente 12 GB solo para pesos, y bastante más para observaciones visuales y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en una única GPU con batch 64, sin detallar el modelo.
- Compatibilidad con GPU de consumo: no confirmada; depende del soporte de la librería `gr00t` y del backend de inferencia elegido.
- Opciones de despliegue: la librería `gr00t` es la vía indicada por el autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas VLA de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en RoboCasa365 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlnha/gr00t-n15-pnp108-n15base_filt_ours_10k | 3B | no disponible | 29/50 en checkpoint-10000 | no disponible | Hugging Face |
| nvidia/GR00T-N1.5-3B (modelo base) | 3B | no disponible | no disponible en esta ficha | no disponible | Hugging Face (referenciado como punto de partida) |
| Otras políticas VLA de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como parte de un estudio sobre estimadores de progreso, no como un modelo listo para producción.
- Entrenado exclusivamente sobre una tarea (PickPlaceCounterToCabinet) y un conjunto de 108 rollouts; la generalización a otras tareas, objetos o entornos no está demostrada.
- Evaluación únicamente en simulación (RoboCasa365); no hay validación en robot real ni datos de transferencia sim-to-real.
- El éxito en simulación es moderado (29/50 en el mejor checkpoint) y no monótono: el checkpoint-4000 rinde peor que el 2000, lo que sugiere varianza entre checkpoints y posible inestabilidad del entrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución; debe contactarse con el autor o con NVIDIA por los términos del modelo base.
- No incluye estados del optimizador, lo que limita reanudar el entrenamiento exactamente desde el punto de corte.
- Riesgo de sobreajuste a las condiciones de simulación y a las semillas de evaluación empleadas; no se reportan intervalos de confianza ni evaluaciones con otras semillas.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo que implica una política de imitación entrenada con datos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-n15base_filt_ours_10k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- RoboCasa (entorno de simulación): https://robocasa.ai/
- LeRobot (formato de datos v2.1): https://github.com/huggingface/lerobot
