# Parv-09/patchpolicy-so101-expert8w288-flow-causal

## Resumen

Este modelo es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09 dentro del ecosistema LeRobot. Combina un trunk DINOv2 ViT-S/14 congelado que extrae parches densos de las imágenes de tres cámaras, con un head de acción SmolVLA de 8 capas y ancho 288 entrenado con flow matching y atención causal entre los tokens de acción. El objetivo es aprender una política de imitación que genere secuencias de acciones articulares a partir de observaciones visuales y de estado.

El modelo forma parte de una ablación controlada de ocho brazos que comparten el mismo trunk, dataset, división, semilla y optimizador, diferenciándose únicamente en el head de acción y el patrón de atención. En esta variante concreta, la atención causal entre tokens de acción produce una pérdida held-out de 0,079359, peor que la variante bidireccional equivalente (0,051919). El checkpoint se distribuye como un módulo PyTorch completo y requiere que las clases del modelo sean importables para su uso.

Relevante porque explora la influencia del patrón de atención en políticas visuomotoras basadas en flow matching, y porque está publicado con licencia Apache 2.0, lo que facilita su reutilización en investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Trunk DINOv2 ViT-S/14 congelado + head SmolVLA (8 capas, ancho 288) con flow matching y atención causal |
| Parametros totales | No disponible (trunk congelado: 22.056.576; head entrenable: 8.551.046) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1802 tokens de memoria (2 timesteps x 901 tokens por frame) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pickle de nn.Module) |

## Arquitectura y entrenamiento

El modelo usa un trunk DINOv2 ViT-S/14 congelado que procesa imágenes de tres cámaras (muñeca, frontal y superior) a 240x320, recortadas a 210x280. Cada cámara produce 300 tokens de parche (15x20) con 384 dimensiones, más un token de estado, resultando en 901 tokens por frame. Con dos timesteps, la memoria tiene 1802 tokens. El head de acción es un SmolVLA de 8 capas y ancho 288, entrenado con flow matching y atención causal entre los tokens de acción. La salida es un chunk de 24 pasos de 6 articulaciones en grados, aunque predice 48 pasos y ejecuta los primeros 24.

El entrenamiento usó el dataset `phi_so101_cubes_cylinder_recovery_v1` con 143 episodios (120 teleoperados y 23 de recuperación de fallos), 81.943 frames a 30 fps. Se dividió en 113 episodios de entrenamiento y 30 held-out. El optimizador fue Adam (0.9, 0.95) con lr 1e-4 en coseno con 500 pasos de warmup, weight decay 1e-6, grad clip 10.0 y EMA, durante 29 épocas (29.493 pasos) con batch de 64. Se usó random crop en entrenamiento y center crop en evaluación. La pérdida final de entrenamiento fue 0,013565 y la held-out 0,079359.

## Capacidades

- Generación de acciones articulares para el brazo SO-101 a partir de observaciones visuales (3 cámaras) y estado del robot.
- Aprendizaje por imitación: la política reproduce comportamientos teleoperados, incluyendo episodios de recuperación de fallos.
- Manejo de contexto multimodal: integra tokens visuales de tres cámaras y un token de estado en una memoria unificada.
- Predicción de secuencias de acciones (chunking) con ejecución parcial: predice 48 pasos y ejecuta 24.
- No tiene capacidades de lenguaje, visión general, tool calling ni agentes; es un modelo específico de control motor.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede controlar el brazo SO-101 para tareas como apilar cubos o recuperar cilindros, aprendidas por demostración.
- Investigación en políticas visuomotoras: sirve como punto de comparación en ablaciones sobre atención (causal vs. bidireccional) y objetivos de entrenamiento (flow matching vs. DDPM).
- Desarrollo de sistemas de aprendizaje por imitación con LeRobot: al ser compatible con la librería LeRobot, puede integrarse en pipelines de entrenamiento y evaluación de políticas.
- Prototipado de control basado en visión: su pequeño tamaño (8,5M parámetros entrenables) lo hace adecuado para experimentos en hardware limitado.
- Estudio de recuperación de fallos: los episodios de learning-from-failure permiten evaluar la robustez de la política ante situaciones no nominales.
- Benchmark de generalización: la división train/held-out permite medir la capacidad de generalización a episodios no vistos.

## Benchmarks y rendimiento

La model card incluye resultados de la ablación de ocho brazos, comparando pérdidas held-out (menor es mejor, pero solo comparable entre objetivos iguales):

| Par de ablación | Causal | Bidireccional |
|---|---|---|
| ppformer + DDPM | 0,037980 | 0,016703 |
| ppformer + flow | 0,067604 | 0,042783 |
| expert8w288 + flow | 0,079359 | 0,051919 |
| expert16w216 + flow | 0,081903 | 0,052711 |

Entre los tres brazos con flow matching, el transformer Patch Policy supera a los expertos, y duplicar la profundidad del experto no mejoró los resultados. No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- El modelo tiene ~30M parámetros totales (8,5M entrenables), por lo que es probable que quepa en GPUs consumer con al menos 4-6 GB de VRAM, aunque no hay datos confirmados.
- La inferencia puede realizarse en CPU para pruebas, pero se recomienda GPU para velocidad.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede usarse con cualquier framework que soporte PyTorch; no se mencionan vLLM, Ollama ni TGI, ya que no es un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. La model card menciona otras variantes de la misma ablación (ppformer, expert16w216), pero no hay comparación con modelos externos.

## Limitaciones y advertencias

- Entrenado con una sola semilla (1000), sin barras de error; las comparaciones entre brazos no tienen significancia estadística.
- La pérdida held-out no equivale a éxito de tarea; se necesitan rollouts físicos en el brazo para evaluar el rendimiento real.
- No se deben comparar pérdidas de DDPM con las de flow matching, ya que minimizan objetivos distintos.
- El checkpoint es un módulo Python completo; requiere que las clases del modelo sean importables, lo que limita su portabilidad fuera del entorno original.
- El orden de las cámaras es fijo; intercambiarlas alimenta al modelo con slices incorrectos de la memoria.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad específicos, al ser un modelo de control motor.

## Enlaces

- HuggingFace: https://huggingface.co/Parv-09/patchpolicy-so101-expert8w288-flow-causal
- Repo compañero con código e infer.py: no disponible en la información proporcionada.
