# ananthu-aniraj/ifam-metashift-k8

## Resumen

IFAM (Iterative Focus and Attention Masking) es un framework de clasificación de imágenes basado en Vision Transformers (ViT) de dos etapas, desarrollado por Ananthu Aniraj y colaboradores (INRAE, Universidad de Montpellier). El modelo presentado aquí es el checkpoint oficial pre-entrenado sobre el dataset Metashifts con 8 partes (K=8), y fue aceptado como presentación oral en ICPR 2026. Su objetivo principal es mejorar la robustez de los clasificadores frente a correlaciones espurias y fondos fuera de distribución, un problema crítico en aplicaciones de visión por computador del mundo real.

La arquitectura se compone de dos etapas: un selector que procesa la imagen completa para identificar regiones relevantes de la tarea, y un predictor que restringe su campo receptivo a esas regiones mediante enmascaramiento de atención (hard masking). Este enfoque permite que el modelo ignore detalles de fondo irrelevantes, haciendo su razonamiento auditable a través de máscaras semánticas explícitas. Con 171,5 millones de parámetros y un tamaño de repositorio de 0,7 GB, es un modelo de tamaño medio adecuado para despliegue en GPUs de consumo. La licencia Apache-2.0 facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de dos etapas: selector + predictor con enmascaramiento duro de atención |
| Parametros totales | 171.479.813 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16 según repo) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

IFAM emplea una arquitectura de dos etapas basada en Vision Transformers. La primera etapa, denominada selector, procesa la imagen completa y produce un conjunto de K máscaras de atención que identifican las regiones más relevantes para la clasificación. La segunda etapa, el predictor, recibe la imagen con esas máscaras aplicadas como enmascaramiento duro de entrada, restringiendo su campo receptivo a las zonas seleccionadas. Este diseño evita que el modelo aprenda correlaciones espurias con el fondo de la imagen, una fuente común de sobreajuste en clasificadores estándar.

El entrenamiento se realizó sobre el dataset Metashifts, un benchmark diseñado para evaluar robustez ante cambios de fondo y dominio. El modelo se pre-entrenó con K=8 partes, lo que significa que el selector divide la imagen en 8 regiones semánticas. No se especifican detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión supervisado. La innovación principal reside en el enmascaramiento duro explícito, que hace que las decisiones del modelo sean auditables y permite intervenciones en tiempo de prueba para mejorar la robustez.

## Capacidades

- Clasificación de imágenes con robustez mejorada frente a correlaciones espurias y fondos fuera de distribución.
- Generación de máscaras semánticas explícitas que indican qué regiones de la imagen son relevantes para la decisión.
- Intervenciones en tiempo de prueba: las máscaras pueden modificarse manualmente para forzar al modelo a centrarse en regiones específicas.
- Razonamiento auditable: la salida del selector permite inspeccionar visualmente qué partes de la imagen influyen en la clasificación.
- Entrada de imágenes de 224x224 píxeles, compatible con el pipeline estándar de Vision Transformers.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Clasificación de imágenes en entornos industriales con fondos variables: por ejemplo, inspección de piezas en cintas transportadoras donde el fondo cambia constantemente. El modelo ignora el fondo gracias al enmascaramiento, manteniendo precisión en la detección de defectos.
- Diagnóstico médico por imagen con artefactos de fondo: en radiografías o ecografías, el modelo puede centrarse en la región anatómica relevante y evitar que elementos como marcas de texto o bordes de la imagen afecten al diagnóstico.
- Vigilancia y seguridad con cámaras en movimiento: clasificación de objetos en escenas dinámicas donde el fondo varía (tráfico, multitudes). El selector identifica el objeto de interés y el predictor lo clasifica sin distraerse con el entorno.
- Análisis de imágenes satelitales o aéreas: clasificación de cultivos, edificios o infraestructuras donde el contexto geográfico puede variar. Las máscaras permiten verificar qué regiones contribuyen a la decisión.
- Moderación de contenido visual: detección de objetos específicos en imágenes con fondos complejos (por ejemplo, armas o contenido inapropiado) donde el fondo podría generar falsos positivos.
- Investigación en robustez de modelos: como herramienta de estudio para analizar cómo los ViT manejan correlaciones espurias, gracias a la naturaleza auditable de las máscaras y la posibilidad de intervenir en tiempo de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper (arxiv:2506.08915) menciona experimentos extensos en diversos benchmarks, pero los valores numéricos concretos no están incluidos en la model card ni en los resultados de búsqueda proporcionados. Se recomienda consultar el artículo original para obtener métricas detalladas de robustez y precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 171,5 millones de parámetros. En FP32, el peso ocupa aproximadamente 686 MB; en FP16, unos 343 MB. Con activaciones y overhead, se estima un consumo de entre 1 y 2 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Ejemplos: NVIDIA RTX 3060, RTX 4060, GTX 1080 Ti, o GPUs de datacenter como T4 o A10.
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI, o mediante frameworks de inferencia como vLLM (aunque no está optimizado para texto). También es posible exportarlo a ONNX o TensorRT para aceleración.
- Latencia y throughput: no disponible. Depende de la GPU y del tamaño de lote. En una RTX 3060, se estima una latencia de 10-30 ms por imagen, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo se basa en DINOv2 (aparece en los tags), que es un ViT pre-entrenado de forma autosupervisada. Sin embargo, no hay métricas comparativas publicadas en la model card. Se recomienda consultar el paper para ver la comparación con otros métodos de robustez como LENS o modelos con enmascaramiento aleatorio.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en el dataset Metashifts con K=8, por lo que su rendimiento en otros dominios o con un número diferente de partes puede degradarse.
- El enmascaramiento duro puede descartar información contextual útil en algunos escenarios, especialmente si el selector comete errores en la identificación de regiones relevantes.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en un dataset concreto, puede heredar sesgos presentes en los datos de Metashifts.
- Riesgo de alucinación: no aplica directamente, pero el selector puede generar máscaras incorrectas que lleven a clasificaciones erróneas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del dataset Metashifts si se utiliza para fines comerciales.
- No hay soporte para otros idiomas ni para tareas de texto; es exclusivamente un modelo de clasificación de imágenes.

## Enlaces

- HuggingFace: https://huggingface.co/ananthu-aniraj/ifam-metashift-k8
- Paper (arxiv): https://arxiv.org/abs/2506.08915
- Versión HTML del paper: https://arxiv.org/html/2506.08915v4
- Repositorio GitHub: https://github.com/ananthu-aniraj/ifam
- Página del autor: https://ananthu-aniraj.github.io/
- Capítulo en Springer (ICPR): https://link.springer.com/chapter/10.1007/978-3-032-31673-8_20
