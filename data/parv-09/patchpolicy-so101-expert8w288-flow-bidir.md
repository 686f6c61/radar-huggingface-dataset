# Parv-09/patchpolicy-so101-expert8w288-flow-bidir

## Resumen

El modelo `patchpolicy-so101-expert8w288-flow-bidir` es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09 y publicada bajo licencia Apache 2.0. Combina un trunk DINOv2 ViT-S/14 congelado, que extrae tokens de parche de tres cámaras (muñeca, frontal y superior), con un head de acción SmolVLA de 8 capas y ancho 288, entrenado mediante flow matching y con atención bidireccional entre los tokens de acción. El modelo forma parte de una ablación controlada de 8 configuraciones que comparten trunk, dataset, split, semilla y optimizador, y que solo difieren en el head de acción y el patrón de atención. Los resultados muestran que la atención bidireccional supera consistentemente a la causal en todos los pares comparados.

El modelo resuelve el problema de generar secuencias de acciones articulares (6 grados de libertad) a partir de observaciones visuales multi-cámara, mediante aprendizaje por imitación con demostraciones teleoperadas y episodios de recuperación de fallos. Es relevante porque demuestra, con una métrica de pérdida held-out, que la atención bidireccional en el head de acción mejora el rendimiento frente a la causal, y que un head más pequeño (8 capas, ancho 288) es suficiente frente a variantes más profundas. El tamaño total del modelo es de aproximadamente 30,6 millones de parámetros, de los cuales solo 8,55 millones son entrenables, lo que lo hace ligero y adecuado para despliegue en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (trunk congelado) + SmolVLA action expert (8 capas, ancho 288) |
| Parametros totales | 30.607.622 (22.056.576 congelados + 8.551.046 entrenables) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Memoria de 1802 tokens (2 pasos temporales × 901 tokens por frame) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pickle de PyTorch (nn.Module) |

## Arquitectura y entrenamiento

La arquitectura se compone de un trunk DINOv2 ViT-S/14 congelado (22,06 M de parámetros, sin entrenar) que procesa cada cámara por separado. Cada imagen de 240x320 se recorta a 210x280, se divide en parches de 14x14, generando 300 tokens por cámara (15x20), cada uno con 384 dimensiones. Las tres cámaras producen 900 tokens de parche, más un token de estado (posición articular normalizada), sumando 901 tokens por frame. La memoria temporal acumula dos frames (pasado y presente), dando una secuencia de 1802 tokens que alimenta al head.

El head SmolVLA es un transformer de 8 capas con ancho de 288 y atención bidireccional entre los tokens de acción. Se entrena con el objetivo de flow matching, que modela la transformación continua desde ruido hasta la acción objetivo. La salida es un chunk de 48 pasos de acción (6 articulaciones en grados), de los cuales se ejecutan los primeros 24. El entrenamiento usó 81.943 frames de 143 episodios (120 teleoperados + 23 de recuperación de fallos), con 113 episodios para entrenamiento y 30 para validación. Hiperparámetros: semilla 1000, batch 64, 29 épocas (29.493 pasos), optimizador Adam (0.9, 0.95), tasa de aprendizaje 1e-4 con decaimiento coseno y 500 pasos de calentamiento, weight decay 1e-6, grad clip 10.0 y EMA. Se aplicó recorte aleatorio en entrenamiento y recorte central en evaluación.

## Capacidades

- Control visuomotor: genera acciones articulares de 6 grados de libertad para el brazo SO-101 a partir de observaciones de tres cámaras RGB.
- Aprendizaje por imitación: entrenado con demostraciones teleoperadas y episodios de recuperación de fallos, lo que le permite corregir errores durante la ejecución.
- Generación de acciones con flow matching: produce secuencias de acción de forma continua, no autoregresiva, lo que permite generar chunks completos de 48 pasos.
- Atención bidireccional entre tokens de acción: considera todas las acciones del chunk simultáneamente, mejorando la coherencia temporal frente a la atención causal.
- Predicción de chunks de acción: predice 48 pasos y ejecuta los primeros 24, permitiendo un control reactivo con replanificación frecuente.
- Robustez a variaciones de iluminación y perspectiva: al usar DINOv2 como extractor de características visuales, hereda cierta invarianza a transformaciones de imagen.

## Casos de uso

- Manipulación de objetos en entornos estructurados: el modelo puede recoger y colocar cubos y cilindros, como se muestra en el dataset `phi_so101_cubes_cylinder_recovery_v1`, siendo adecuado para tareas de picking and placing en celdas de trabajo fijas.
- Recuperación de fallos en tareas de manipulación: gracias a los episodios de learning-from-failure incluidos en el entrenamiento, el modelo puede detectar y corregir errores de agarre o colocación durante la ejecución, reduciendo la intervención humana.
- Teleoperación asistida: puede generar acciones suaves y coherentes a partir de demostraciones humanas, sirviendo como base para sistemas de control compartido o asistencia robótica.
- Investigación en aprendizaje por imitación: al ser parte de una ablación controlada, es útil como punto de referencia para estudiar el efecto de la atención bidireccional y la arquitectura del head en políticas visuomotoras.
- Desarrollo de políticas de bajo coste: con solo 8,55 M de parámetros entrenables, puede entrenarse en una GPU de consumo y desplegarse en hardware embebido, facilitando la experimentación en laboratorios con recursos limitados.
- Benchmarking de algoritmos de flow matching: el modelo sirve como caso de estudio para comparar flow matching frente a otros objetivos generativos (como DDPM) en el dominio de control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. La model card reporta la pérdida held-out (métrica de validación) para las 8 configuraciones de la ablación. Es importante señalar que la pérdida held-out no equivale a éxito de tarea en el mundo real, y que los valores de DDPM y flow matching no son comparables directamente porque minimizan objetivos distintos.

| Configuración | Atención causal | Atención bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

El modelo evaluado (expert8w288 + flow bidireccional) obtiene una pérdida held-out de 0.051919, la peor entre los tres brazos de flow matching, pero la atención bidireccional mejora sistemáticamente a su contraparte causal en todos los pares. La pérdida final de entrenamiento fue 0.010678.

## Requisitos de hardware

- VRAM estimada: dado el tamaño total de ~30,6 M de parámetros, el modelo en FP32 ocupa aproximadamente 122 MB. La inferencia puede ejecutarse en CPU, aunque se recomienda GPU para latencia baja. No se han publicado requisitos oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores) es suficiente. Para entrenamiento, una GPU con 8 GB (RTX 3070, RTX 2080) permite batch 64 sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU moderna, incluidas las de gama baja.
- Opciones de despliegue: al ser un checkpoint pickle de PyTorch, se puede cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido y la ausencia de autoregresión (generación por flow matching), se espera una latencia de decenas de milisegundos en GPU, pero es una estimación no verificada.

## Comparativa con modelos similares

La comparativa más relevante es la ablación interna de 8 configuraciones, que comparten trunk, dataset, semilla y optimizador. No se dispone de comparaciones con modelos externos de la misma categoría (políticas visuomotoras para SO-101) en la información proporcionada.

| Configuración | Head | Objetivo | Atención | Parámetros entrenables | Pérdida held-out |
|---|---|---|---|---|---|
| ppformer + DDPM causal | Patch Policy transformer | DDPM | causal | no disponible | 0.037980 |
| ppformer + DDPM bidir | Patch Policy transformer | DDPM | bidireccional | no disponible | **0.016703** |
| ppformer + flow causal | Patch Policy transformer | flow matching | causal | no disponible | 0.067604 |
| ppformer + flow bidir | Patch Policy transformer | flow matching | bidireccional | no disponible | **0.042783** |
| expert8w288 + flow causal | SmolVLA 8×288 | flow matching | causal | 8.551.046 | 0.079359 |
| expert8w288 + flow bidir | SmolVLA 8×288 | flow matching | bidireccional | 8.551.046 | **0.051919** |
| expert16w216 + flow causal | SmolVLA 16×216 | flow matching | causal | no disponible | 0.081903 |
| expert16w216 + flow bidir | SmolVLA 16×216 | flow matching | bidireccional | no disponible | **0.052711** |

Entre los tres brazos con flow matching, el transformer Patch Policy supera a ambos SmolVLA expert, y duplicar la profundidad del expert (de 8 a 16 capas) no aporta mejora.

## Limitaciones y advertencias

- Resultados con una sola semilla (1000): no hay barras de error, por lo que las diferencias entre configuraciones podrían no ser estadísticamente significativas.
- La pérdida held-out no es una medida de éxito de tarea: SO-101 no tiene simulador, por lo que se requieren pruebas físicas en el brazo para validar el rendimiento real.
- No comparar las pérdidas de DDPM con las de flow matching: minimizan objetivos distintos, y un valor numérico menor no implica mejor política.
- Modelo específico para SO-101: no es generalizable a otros brazos o morfologías sin reentrenamiento.
- El checkpoint es un pickle de PyTorch con `weights_only=False`, lo que implica riesgo de ejecución de código arbitrario si se carga un archivo no confiable.
- Orden de cámaras fijo: el modelo espera las cámaras en orden muñeca, frontal, superior; intercambiarlas degrada el rendimiento.
- Sin soporte de lenguaje natural ni otras modalidades: es exclusivamente un modelo de control visuomotor.

## Enlaces

- HuggingFace: https://huggingface.co/Parv-09/patchpolicy-so101-expert8w288-flow-bidir
- Repo compañero con código e `infer.py`: no disponible en la información proporcionada.
