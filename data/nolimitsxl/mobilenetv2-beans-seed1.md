# nolimitsxl/mobilenetv2-beans-seed1

## Resumen

El modelo `nolimitsxl/mobilenetv2-beans-seed1` es un clasificador de imágenes basado en la arquitectura MobileNetV2, ajustado para la clasificación de hojas de frijol. El nombre del repositorio sugiere que fue entrenado sobre el dataset Beans, un conjunto público de imágenes de hojas de frijol con tres clases: mancha angular, roya y hoja sana. El modelo tiene 2.261.827 parámetros y se distribuye en formato safetensors, listo para usar con la librería transformers mediante el pipeline `image-classification`.

Aunque la model card publicada por el autor está prácticamente vacía (solo contiene la plantilla automática de HuggingFace), los metadatos del repositorio confirman que se trata de un modelo de visión por computador de tamaño reducido, adecuado para tareas de clasificación en entornos con recursos limitados. Su relevancia radica en la combinación de una arquitectura eficiente (MobileNetV2) con un caso de uso agrícola concreto: la detección temprana de enfermedades en cultivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (red convolucional con bloques residuales invertidos y convoluciones separables en profundidad) |
| Parametros totales | 2.261.827 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye solo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional diseñada para dispositivos móviles y embebidos. Su arquitectura se basa en bloques residuales invertidos (inverted residual blocks) con convoluciones separables en profundidad (depthwise separable convolutions), lo que reduce significativamente el número de operaciones y parámetros en comparación con redes convolucionales estándar. El modelo utiliza una capa de cuello de botella (bottleneck) que primero expande la dimensión de los canales, aplica la convolución en profundidad y luego proyecta de vuelta a una dimensión menor. Esta estructura permite un equilibrio entre precisión y eficiencia computacional.

En cuanto al entrenamiento, la model card no proporciona información sobre el dataset exacto, el número de épocas, la configuración de hiperparámetros ni el régimen de precisión (fp32, fp16, etc.). El nombre del repositorio sugiere que se utilizó el dataset Beans, un conjunto de imágenes de hojas de frijol con tres categorías, pero no se confirma oficialmente. Tampoco se indica si se emplearon técnicas de fine-tuning sobre pesos preentrenados en ImageNet, aunque es lo habitual para este tipo de modelos. No hay evidencia de entrenamiento con RLHF o DPO, ya que se trata de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de imágenes en tres categorías (presumiblemente: mancha angular, roya y hoja sana) si se usó el dataset Beans.
- Inferencia eficiente en CPU y GPU gracias al diseño ligero de MobileNetV2.
- Compatible con el pipeline `image-classification` de transformers, lo que facilita su integración en aplicaciones Python.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente visual.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Detección de enfermedades en cultivos de frijol: el modelo puede clasificar imágenes de hojas capturadas con un smartphone y alertar al agricultor sobre la presencia de mancha angular o roya, permitiendo una intervención temprana.
- Agricultura de precisión: integración en drones o sistemas de monitoreo automatizado que analicen imágenes de campo y generen mapas de incidencia de enfermedades.
- Aplicaciones móviles de asesoramiento agrícola: un desarrollador puede embeber el modelo en una app Android o iOS usando ONNX o TensorFlow Lite para ofrecer diagnósticos offline.
- Educación e investigación: como modelo de referencia para estudiantes que quieran experimentar con fine-tuning de MobileNetV2 en datasets pequeños.
- Prototipado rápido: gracias a su pequeño tamaño (≈9 MB en fp32), es adecuado para pruebas de concepto en sistemas con recursos limitados.
- Benchmarking de eficiencia: sirve como punto de comparación para medir el rendimiento de arquitecturas más complejas en tareas de clasificación de imágenes agrícolas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. Tampoco se indica el rendimiento en el dataset de validación de Beans ni en otros conjuntos de referencia como ImageNet.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2,26 millones de parámetros. En fp32 ocupa aproximadamente 9 MB, por lo que puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama baja como NVIDIA GTX 1050 o integradas Intel. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: se puede usar con la librería transformers directamente, o exportar a ONNX o TensorFlow Lite para entornos móviles. También es compatible con servidores de inferencia como TorchServe o FastAPI.
- Latencia y throughput estimados: no disponibles. Dado el tamaño del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una sola imagen, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Uso tipico | Licencia |
|---|---|---|---|---|
| nolimitsxl/mobilenetv2-beans-seed1 | 2,26 M | MobileNetV2 | Clasificacion de hojas de frijol | no disponible |
| MobileNetV2 (original, ImageNet) | 3,5 M | MobileNetV2 | Clasificacion general de imagenes | Apache 2.0 |
| EfficientNet-Lite0 | 4,7 M | EfficientNet | Clasificacion eficiente en movil | Apache 2.0 |
| ResNet-18 | 11,7 M | ResNet | Clasificacion general | BSD-3 |

No se dispone de resultados comparativos de precisión entre estos modelos en el contexto del dataset Beans. La comparación se limita a parámetros y arquitectura. El modelo de nolimitsxl es el más pequeño de la lista, lo que sugiere un menor coste computacional pero también una posible menor precisión que modelos más grandes, aunque sin datos no se puede confirmar.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos, pero al ser un modelo entrenado presumiblemente en un dataset específico de hojas de frijol, su capacidad de generalización a otras plantas o condiciones de iluminación es limitada.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto o idioma: al ser un modelo de visión, no procesa texto ni tiene soporte multilingüe.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveat importante: la model card está vacía y no hay evidencia de evaluación rigurosa. El modelo podría tener un rendimiento deficiente fuera del dataset de entrenamiento. No se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.
- El tag `arxiv:1910.09700` en los metadatos se refiere al paper sobre el cálculo de emisiones de carbono en ML, no al modelo en sí, por lo que no aporta información sobre el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/nolimitsxl/mobilenetv2-beans-seed1
- Paper de MobileNetV2 (Sandler et al., 2018): https://arxiv.org/abs/1801.04381
- Paper sobre estimación de emisiones de carbono en ML (referencia del tag arxiv): https://arxiv.org/abs/1910.09700
