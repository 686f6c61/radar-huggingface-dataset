# Parv-09/patchpolicy-so101-expert16w216-flow-causal

## Resumen

El modelo `patchpolicy-so101-expert16w216-flow-causal` es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09 dentro del ecosistema LeRobot. Combina un trunk DINOv2 ViT-S/14 congelado que procesa imágenes de tres cámaras (muñeca, frontal y superior) con un head de acción basado en SmolVLA (16 capas, ancho 216) entrenado mediante flow matching y atención causal entre los tokens de acción. El modelo predice chunks de 24 pasos de articulación (6 grados de libertad) a partir de observaciones visuales y de estado.

Este modelo forma parte de una ablación controlada de ocho arquitecturas que comparten el mismo trunk, dataset, split, semilla y optimizador, diferenciándose únicamente en el head de acción y el patrón de atención. Su relevancia radica en que permite comparar de forma limpia el impacto de la arquitectura del head y del tipo de atención en el rendimiento de políticas visuomotoras para manipulación robótica, un área donde la elección de la arquitectura tiene un efecto directo sobre la precisión y la robustez del control.

Con solo 11,7 millones de parámetros entrenables y un tamaño de repo de 0,1 GB, es un modelo ligero, adecuado para experimentación en hardware modesto y para despliegue en tiempo real en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visuomotor policy: trunk DINOv2 ViT-S/14 congelado + head SmolVLA (16 capas, ancho 216) con flow matching y atención causal |
| Parametros totales | No disponible (trunk congelado: 22 056 576; head entrenable: 11 765 190) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1802 tokens por paso de memoria (2 frames × 901 tokens: 900 patch tokens + 1 state token) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pickled `nn.Module`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema Patch Policy: un trunk DINOv2 ViT-S/14 congelado extrae características visuales de cada cámara (300 tokens de parche por cámara, 15×20 parches sobre un crop de 210×280), que se concatenan con un token de estado del robot (posición articular normalizada) para formar una secuencia de 901 tokens por frame. Dos frames consecutivos se apilan en una memoria de 1802 tokens que alimenta al head de acción.

El head es un transformador SmolVLA de 16 capas y ancho 216, entrenado con el objetivo de flow matching. La atención entre los tokens de acción es causal, es decir, cada token de acción solo puede atender a los anteriores. El modelo predice 48 pasos de acción pero solo ejecuta los primeros 24. El entrenamiento se realizó con 29 épocas (29 493 pasos), batch de 64, Adam (β=0.9, 0.95), learning rate 1e-4 con decaimiento coseno y 500 pasos de warmup, weight decay 1e-6, grad clip 10.0 y EMA. Se usó aumento con recorte aleatorio en entrenamiento y recorte central en evaluación.

## Capacidades

- Control visuomotor para el brazo SO-101: genera comandos de articulación (6 DOF) a partir de imágenes de tres cámaras y del estado del robot.
- Predicción de acciones en chunks: produce secuencias de 24 pasos con un horizonte de planificación de 48 pasos (ejecuta la primera mitad).
- Aprendizaje por imitación: entrenado con demostraciones teleoperadas y episodios de recuperación de fallos (23 episodios de learning-from-failure).
- Manejo de múltiples vistas: integra información de cámaras de muñeca, frontal y superior en una única memoria de tokens.
- Robustez a perturbaciones: los episodios de recuperación de fallos permiten al modelo corregir errores durante la ejecución.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de control motor.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede ejecutar tareas de apilado o recuperación de cilindros sobre una superficie, como las del dataset `phi_so101_cubes_cylinder_recovery_v1`, donde se demostró su capacidad para completar la tarea tras fallos iniciales.
- Aprendizaje por demostración en robótica de bajo coste: al ser ligero (11,7 M de parámetros entrenables), puede entrenarse y desplegarse en estaciones de trabajo con una GPU consumer, lo que facilita la experimentación en laboratorios pequeños o en entornos educativos.
- Evaluación de arquitecturas de políticas visuomotoras: sirve como uno de los brazos de una ablación controlada para estudiar el efecto de la atención causal frente a la bidireccional en el rendimiento de políticas con flow matching.
- Recuperación de fallos en tiempo real: gracias a los episodios de aprendizaje a partir de fallos, el modelo puede reaccionar ante errores de ejecución y reintentar la tarea, útil en aplicaciones de manipulación no estructurada.
- Investigación en control predictivo: la predicción de chunks de 48 pasos (con ejecución de 24) permite estudiar estrategias de re-planificación y control en bucle cerrado.
- Base para fine-tuning en tareas similares: el checkpoint puede adaptarse a nuevos datasets de SO-101 con pocas demostraciones, dado su tamaño reducido y su trunk visual congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de robótica, no de lenguaje. La información disponible incluye los resultados de la ablación controlada de ocho arquitecturas sobre el mismo dataset, donde se comparan las pérdidas held-out de cada configuración:

| Par de arquitecturas | Atención causal | Atención bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

La atención bidireccional superó a la causal en todos los pares. Entre las tres arquitecturas con flow matching, el transformer Patch Policy (ppformer) obtuvo la mejor pérdida held-out, mientras que duplicar la profundidad del expert (de 8 a 16 capas) no mejoró el resultado.

## Requisitos de hardware

- VRAM estimada: con ~33 M de parámetros en total (11,7 M entrenables), la inferencia en FP32 requiere aproximadamente 132 MB solo para los pesos, más activaciones y memoria intermedia. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, desde una GTX 1650 hasta una RTX 4090. Para entrenamiento, una GPU con 8 GB de VRAM es suficiente para el batch de 64 descrito (aunque el entrenamiento se realizó con una configuración específica no detallada).
- Compatibilidad con GPU consumer: sí, es totalmente viable en GPUs de gama media y baja.
- Opciones de despliegue: al ser un checkpoint pickled de PyTorch, se puede cargar directamente en un entorno con PyTorch y LeRobot. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño del modelo y el uso de un trunk congelado, se espera una inferencia en tiempo real (30 fps) en hardware moderno, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras políticas visuomotoras (como ACT, Diffusion Policy o RDT) en la información proporcionada. La única comparación publicada es la ablación interna de ocho arquitecturas, que comparten trunk, datos y configuración de entrenamiento. Por tanto, la comparativa con modelos externos se considera no disponible.

## Limitaciones y advertencias

- Entrenamiento con una única semilla (1000): no hay barras de error, por lo que las diferencias entre arquitecturas podrían no ser estadísticamente significativas.
- La pérdida held-out no equivale a éxito de tarea: SO-101 no tiene simulador, por lo que se necesitan pruebas físicas en el brazo para validar el rendimiento real.
- No se deben comparar directamente las pérdidas de DDPM con las de flow matching, ya que minimizan objetivos distintos; un valor numérico menor no implica una mejor política.
- El modelo está especializado para el brazo SO-101 y el dataset específico; no es generalizable a otros robots sin reentrenamiento.
- La orden de las cámaras es fija (muñeca, frontal, superior); intercambiarlas alimenta al modelo con los slices de tokens incorrectos, degradando el rendimiento.
- El checkpoint es un módulo pickled, lo que requiere que las clases del modelo estén importables en el entorno de ejecución; esto puede plantear problemas de compatibilidad entre versiones de PyTorch o LeRobot.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones no especificadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parv-09/patchpolicy-so101-expert16w216-flow-causal
- Repositorio compañero con código e `infer.py`: no disponible en la información proporcionada (mencionado como "companion repo" pero sin URL).
