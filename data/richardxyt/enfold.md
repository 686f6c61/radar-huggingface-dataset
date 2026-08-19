# richardxyt/Enfold

## Resumen

Enfold es un modelo de control encarnado (embodied AI) que introduce un enfoque novedoso para la eficiencia en robótica: en lugar de renderizar un futuro imaginado en cada paso de control, pliega la computación de un generador de mundos en una representación predictiva inferida del presente. Desarrollado por el autor richardxyt y presentado en el artículo "Enfold: Folding World Model Imagination into Predictive Representations for Ultra-Efficient Embodied Control" (arXiv:2607.26657), el modelo se orienta a la imitación de políticas visión-lenguaje-acción (VLA) en entornos simulados como LIBERO y RoboTwin.

El repositorio de HuggingFace contiene checkpoints oficiales para dos benchmarks: LIBERO (dos vistas de cámara, acciones de 7 dimensiones y propriocepción de 8) y RoboTwin (tres vistas, acciones de 14 dimensiones). Cada checkpoint debe usarse junto con su archivo de estadísticas de normalización correspondiente. La arquitectura concreta no se detalla en la información disponible, pero se menciona el uso de componentes externos como Cosmos-Predict2.5, el tokenizador/VAE de Cosmos y DINOv3 ViT-H/16+ para la evaluación. El tamaño del repositorio es de 12,5 GB, aunque no se especifica el número de parámetros del modelo.

La relevancia de Enfold radica en su propuesta de ultra-eficiencia: al trasladar la generación de futuros a representaciones inferidas, reduce la carga computacional en tiempo de inferencia, lo que podría facilitar el despliegue en robots con recursos limitados. Aunque aún no hay resultados de benchmarks publicados en la documentación, el enfoque abre una línea de investigación prometedora en el cruce entre world models y control robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (usa un world model generativo con componentes externos: Cosmos-Predict2.5, Cosmos tokenizer/VAE, DINOv3 ViT-H/16+) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma, aunque es un modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de Enfold. Se sabe que es un modelo de imitación (imitation learning) con componentes de visión y lenguaje, y que en la evaluación se apoya en assets externos como Cosmos-Predict2.5 (un modelo de predicción de mundos), el tokenizador/VAE de Cosmos y DINOv3 ViT-H/16+ (un encoder visual). El entrenamiento se realiza sobre los datasets LIBERO y RoboTwin, y los checkpoints publicados incluyen tanto la política como las estadísticas de normalización necesarias para cada benchmark.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del concepto de "plegar" la imaginación del generador de mundos en representaciones predictivas, que se describe en el paper como una predicción multi-nivel a través de una cabeza condicionada por el paso de tiempo, en lugar de predicción de píxeles o destilación de un encoder visual congelado.

## Capacidades

- Control robótico encarnado: el modelo genera acciones de control (7-D en LIBERO, 14-D en RoboTwin) a partir de observaciones visuales y propriocepción.
- Imitación de políticas visión-lenguaje-acción (VLA): integra señales visuales y de lenguaje para producir comandos motores.
- Evaluación en dos benchmarks estándar de robótica: LIBERO (tareas de manipulación en mesa) y RoboTwin (tareas de doble brazo).
- Manejo de múltiples vistas de cámara: dos en LIBERO (concatenadas a 224×448) y tres en RoboTwin (384×320).
- Uso de propriocepción: el modelo recibe el estado de las articulaciones como entrada adicional.
- No se mencionan capacidades como tool calling, agentes multi-paso, ni modos de razonamiento explícito.

## Casos de uso

- Investigación en world models para robótica: Enfold permite estudiar cómo las representaciones predictivas pueden sustituir a la generación explícita de futuros, reduciendo coste computacional en control.
- Evaluación de políticas en LIBERO: el checkpoint de LIBERO puede usarse para reproducir experimentos de manipulación en mesa con dos cámaras y acciones de 7 dimensiones.
- Evaluación en RoboTwin: el checkpoint de RoboTwin sirve para tareas de doble brazo con tres vistas, útil en entornos colaborativos o bimanuales.
- Comparación de métodos de control eficiente: al estar disponible el código y los checkpoints, se puede comparar el rendimiento y la latencia frente a otros modelos VLA.
- Despliegue en robots reales (con adaptación): aunque los checkpoints están entrenados en simulación, el enfoque de representaciones predictivas podría trasladarse a entornos reales si se dispone de los assets necesarios.
- Docencia y divulgación: el repositorio incluye scripts de evaluación y documentación, lo que facilita su uso en cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de éxito, precisión ni latencia para LIBERO o RoboTwin. Se recomienda consultar el paper (arXiv:2607.26657) o el repositorio de código para obtener datos de rendimiento.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs concretas en la información disponible.
- La evaluación requiere cargar assets externos de gran tamaño: Cosmos-Predict2.5, Cosmos tokenizer/VAE y DINOv3 ViT-H/16+. Esto sugiere que se necesita una GPU con memoria sustancial (probablemente 24 GB o más, típica de A100, H100 o RTX 4090).
- El repositorio tiene un tamaño de 12,5 GB, por lo que el almacenamiento local debe ser suficiente.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de robótica en PyTorch, la inferencia se realiza probablemente con scripts de Python y el framework de evaluación del repositorio.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (VLA o world models para robótica) en los datos proporcionados. Modelos como OpenVLA, RT-2 o π0 podrían ser comparables, pero no se han incluido datos de referencia en la documentación. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado en entornos simulados (LIBERO y RoboTwin), puede no generalizar a entornos reales sin ajuste fino.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, podría producir comandos inválidos o inconsistentes con la observación, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al ser un modelo de control, no maneja texto de entrada más allá de las instrucciones de tarea, y no se especifica la longitud máxima de secuencia de observaciones.
- Dependencia de assets externos: la evaluación requiere descargar y configurar Cosmos-Predict2.5, Cosmos tokenizer/VAE y DINOv3 ViT-H/16+, lo que añade complejidad y posibles problemas de compatibilidad.
- Licencia no disponible: no se especifica si el uso comercial está permitido, lo que puede ser un obstáculo para despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/richardxyt/Enfold
- Paper (arXiv): https://arxiv.org/abs/2607.26657
- Versión HTML del paper: https://arxiv.org/html/2607.26657v3
- Código fuente: https://github.com/zwl666666/enfold
- Página del proyecto: https://zwl666666.github.io/enfold/
