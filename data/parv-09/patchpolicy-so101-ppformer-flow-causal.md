# Parv-09/patchpolicy-so101-ppformer-flow-causal

## Resumen

El modelo `patchpolicy-so101-ppformer-flow-causal` es una política visuomotora diseñada para el brazo robótico SO-101, desarrollada por Parv-09 como parte de un estudio de ablación controlado. Combina un trunk congelado DINOv2 ViT-S/14 que extrae tokens de parche densos a partir de tres cámaras, con un head tipo Patch Policy transformer que genera acciones mediante *flow matching* y atención **causal** entre los tokens de acción. El modelo resuelve tareas de manipulación por imitación, incluyendo recuperación de fallos, y se distingue por su arquitectura modular y su entrenamiento reproducible.

Con aproximadamente 31,6 millones de parámetros totales (22M del trunk congelado y 9,5M entrenables en el head), el modelo procesa secuencias de 2 timesteps de 3 cámaras RGB y predice chunks de 24 pasos de articulación. Su relevancia radica en que forma parte de una comparativa sistemática de ocho variantes que evalúa el impacto del tipo de head (Patch Policy vs. expert) y del patrón de atención (causal vs. bidireccional) sobre la pérdida en datos held-out, ofreciendo evidencia empírica para el diseño de políticas robóticas eficientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 congelado (trunk) + Patch Policy transformer (head) con atención causal |
| Parametros totales | 31.588.614 (22.056.576 del trunk + 9.532.038 del head) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política visuomotora); memoria de 1802 tokens por frame (900 patch + 1 state) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pickle de PyTorch (`nn.Module`), no safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. El trunk es un DINOv2 ViT-S/14 preentrenado y **congelado** (0 parámetros entrenables) que procesa cada imagen de 210x280 píxeles, dividida en parches de 14x14, generando 300 tokens de 384 dimensiones por cámara. Las tres cámaras (muñeca, frontal y superior) se concatenan junto con un token de estado (posiciones articulares normalizadas) para formar una memoria de 901 tokens por frame. El head es un transformer de política por parches que opera sobre esta memoria con atención **causal** entre los tokens de acción, y se entrena con el objetivo de *flow matching* para predecir un chunk de 48 pasos de acción (6 articulaciones en grados), de los cuales se ejecutan los primeros 24.

El entrenamiento se realizó sobre el dataset `phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 teleoperados y 23 de recuperación de fallos), con 81.943 frames a 30 fps y 3 cámaras. Se usó una partición de 113 episodios para entrenamiento y 30 para validación. Los hiperparámetros incluyen seed 1000, batch 64, 29 épocas (29.493 pasos), optimizador Adam (0.9, 0.95), learning rate 1e-4 con scheduler coseno y 500 pasos de warmup, weight decay 1e-6, grad clip 10.0 y EMA. Se aplicó recorte aleatorio en entrenamiento y recorte central en evaluación. El checkpoint se guarda como un módulo pickled, por lo que requiere que las clases del modelo sean importables para su uso.

## Capacidades

- Control visuomotor de brazo robótico SO-101: genera comandos de articulación (6 grados de libertad) a partir de observaciones visuales multi-cámara.
- Predicción de acciones por chunks: produce secuencias de 24 pasos de acción, lo que permite ejecución en bucle abierto con re-planificación.
- Aprendizaje por imitación: entrenado con demostraciones teleoperadas y episodios de recuperación de fallos, aprende a replicar comportamientos expertos.
- Procesamiento multi-cámara: integra información de tres cámaras (muñeca, frontal, superior) con un orden fijo, asignando a cada cámara un bloque de tokens propio.
- Manejo de estado articular: incorpora un token de estado que codifica las posiciones articulares normalizadas, permitiendo condicionar la generación de acciones al estado actual.
- Entrenamiento con *flow matching*: el objetivo de generación por flujo permite una optimización estable y una inferencia determinista (a diferencia de DDPM, que requiere muestreo estocástico).
- Recuperación de fallos: los episodios de recovery incluidos en el dataset permiten al modelo corregir errores durante la ejecución de tareas.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede controlar el brazo SO-101 para apilar cubos o manipular cilindros, gracias a su capacidad de procesar múltiples cámaras y predecir acciones suaves de 24 pasos.
- Recuperación de fallos en tareas de apilado: al haber sido entrenado con episodios de recovery, puede reaccionar ante desviaciones y corregir la trayectoria en tiempo real, mejorando la robustez en entornos no estructurados.
- Evaluación de políticas de imitación en hardware real: al ser parte de una ablación controlada, sirve como referencia para comparar arquitecturas de head (Patch Policy vs. expert) y patrones de atención en un brazo físico sin simulador.
- Desarrollo de sistemas de control basado en visión: su trunk DINOv2 congelado proporciona características visuales densas y robustas, útiles para tareas que requieren percepción fina de objetos pequeños.
- Investigación en *flow matching* para robótica: el uso de este objetivo generativo en un head transformer permite estudiar su comportamiento frente a DDPM en términos de pérdida y estabilidad de entrenamiento.
- Integración en pipelines de aprendizaje por refuerzo: aunque el modelo es puramente imitativo, sus predicciones de acción pueden usarse como inicialización o como política base en entornos de RL para acelerar el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque el modelo es específico de robótica. Sin embargo, la model card incluye una comparativa de pérdida held-out entre las ocho variantes del estudio de ablación. La pérdida no es equivalente a tasa de éxito en tarea, pero sirve como indicador relativo de calidad de ajuste:

| Par de variantes | Pérdida causal | Pérdida bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

En la comparación entre las tres variantes con *flow matching* (mismo objetivo de pérdida), el head Patch Policy transformer (0.067604 causal, 0.042783 bidireccional) supera a ambas configuraciones expert, y duplicar la profundidad del expert no mejoró el resultado. La atención bidireccional fue consistentemente superior a la causal en todos los pares.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- Estimación: con ~31,6M de parámetros totales y un trunk DINOv2 ViT-S/14, la inferencia requiere una GPU con soporte CUDA y al menos 8 GB de VRAM para procesar los 2 timesteps de 3 cámaras (batch 1). Una RTX 3060 o superior sería suficiente para pruebas, mientras que una A100 o H100 permitiría mayor throughput con batch grande.
- El modelo está implementado en PyTorch y es compatible con cualquier framework que pueda cargar módulos pickled (por ejemplo, `torch.load`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia estimada dependerá del hardware; en una GPU consumer moderna, el procesamiento de un frame con DINOv2 y el head transformer debería estar en el rango de 10-50 ms, permitiendo control en tiempo real a 30 fps.
- Para despliegue en robótica, se recomienda integrar el modelo en el ecosistema LeRobot, que proporciona utilidades para captura de datos y control de brazos como el SO-101.

## Comparativa con modelos similares

No se dispone de modelos comparables de terceros en la información proporcionada. La comparativa interna del estudio de ablación (tabla anterior) muestra que el head Patch Policy transformer con *flow matching* y atención bidireccional obtiene la menor pérdida held-out (0.042783) entre las variantes con el mismo objetivo. Frente a la variante con DDPM (0.016703 bidireccional), la pérdida no es directamente comparable por diferir en el objetivo de optimización. El modelo se posiciona como una alternativa eficiente a los heads expert (con menos parámetros y mejor rendimiento en este dataset), pero su validación final requiere despliegue físico en el brazo SO-101.

## Limitaciones y advertencias

- El modelo fue entrenado con una única semilla (seed 1000), por lo que no se dispone de barras de error ni estimaciones de varianza entre ejecuciones.
- La pérdida held-out no equivale a tasa de éxito en tarea; al no existir simulador para SO-101, es imprescindible realizar rollouts físicos para evaluar el rendimiento real.
- No se deben comparar directamente las pérdidas de variantes con DDPM y *flow matching*, ya que minimizan funciones objetivo distintas.
- El orden de las cámaras es fijo (muñeca, frontal, superior); intercambiarlas alimenta al modelo con bloques de tokens incorrectos, degradando el rendimiento.
- El checkpoint es un objeto `nn.Module` pickled, lo que implica riesgos de seguridad al cargar código arbitrario y requiere que las definiciones de clase estén disponibles en el entorno de ejecución.
- No se han documentado sesgos específicos, pero al ser un modelo de imitación, hereda los sesgos de las demostraciones teleoperadas (por ejemplo, preferencias de postura o velocidad del operador).
- La licencia Apache-2.0 permite uso comercial, pero el modelo está acoplado al hardware SO-101 y a un dataset concreto; su generalización a otros brazos o tareas no está garantizada.

## Enlaces

- [HuggingFace: Parv-09/patchpolicy-so101-ppformer-flow-causal](https://huggingface.co/Parv-09/patchpolicy-so101-ppformer-flow-causal)
