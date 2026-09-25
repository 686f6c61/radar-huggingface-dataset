# lucid-dl/mobilenet-v4-conv-large

## Resumen

mobilenet-v4-conv-large es un modelo de clasificación de imágenes publicado por el usuario lucid-dl en HuggingFace. No es un modelo entrenado desde cero por ese autor, sino un port al framework Lucid del checkpoint `timm/mobilenetv4_conv_large.e600_r384_in1k`, convertido a safetensors nativos de Lucid mediante la herramienta `tools.convert_weights` y verificado con una carga estricta contra un modelo Lucid recién construido. Implementa la variante convolucional grande de la familia MobileNetV4 descrita por Qin et al. (ECCV 2024, arXiv:2404.10518).

El modelo tiene 32,6 M de parámetros (124,96 MB en el repositorio) y clasifica imágenes a 384x384 píxeles en las 1000 clases de ImageNet-1k. Declara un 82,974 % de acc@1 y un 96,244 % de acc@5 según el model-index del propio autor, valores marcados como no verificados. La licencia es Apache 2.0, heredada de los pesos originales de timm.

Su relevancia es la de un backbone convolucional eficiente de gama media-alta: ofrece precisión de modelos tipo ConvNeXt-Tiny con un coste de cómputo propio de la familia MobileNet, lo que lo hace adecuado para clasificación en producción, extracción de características y fine-tuning en dominios específicos. Cabe señalar que el repositorio no registra descargas ni likes y que las fechas de creación y actualización publicadas por HuggingFace son del 24 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV4, variante convolucional "conv large"; sin atención Mobile MQA) |
| Parametros totales | 32,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; viable fp16/int8, pero sin datos del autor) |
| Idiomas soportados | no aplica; etiquetas de salida en inglés correspondientes a las 1000 clases de ImageNet-1k |
| Licencia | Apache 2.0 (heredada de los pesos originales) |
| Formato de pesos | safetensors nativos de Lucid |
| Resolucion de entrada | 384x384 (según el tag E600_R384_IN1K) |
| Numero de clases | 1000 (ImageNet-1k) |
| Tamano del repositorio | 0,1 GB (pesos: 124,96 MB) |
| Tag de pesos | E600_R384_IN1K (por defecto) |
| GFLOPs | no disponible (el autor deja el campo vacío en la tabla de pesos) |
| Libreria | lucid |

## Arquitectura y entrenamiento

La arquitectura corresponde a MobileNetV4 en su variante puramente convolucional de tamaño "large", tal como se describe en el artículo MobileNetV4: Universal Models for the Mobile Ecosystem (arXiv:2404.10518). El paper introduce el bloque Universal Inverted Bottleneck (UIB) y, en las variantes híbridas, el mecanismo Mobile MQA; esta ficha corresponde al checkpoint convolucional, por lo que no incorpora atención. La entrada de trabajo es de 384x384 píxeles, coherente con el sufijo `r384` del tag.

No hay información en la model card sobre el dataset de entrenamiento más allá de ImageNet-1k, el número de tokens o imágenes vistas, la composición del dataset, el uso de RLHF/DPO ni recetas de aumento de datos. El sufijo `e600` del checkpoint de timm apunta a una receta de 600 épocas, y el proceso documentado por el autor se limita a la conversión de pesos: conjunto de claves, formas de tensores y carga estricta verificada. Cualquier detalle adicional de entrenamiento debe consultarse en el artículo original y en la receta de timm.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k a 384x384, devolviendo logits de forma `(B, num_classes)`.
- Preprocesado integrado: los transformadores de entrada viajan con los pesos (`weights.transforms()`), lo que garantiza la coherencia de normalización y redimensionado.
- Extracción de características: al ser una CNN, sus mapas intermedios sirven como backbone para transfer learning en detección, segmentación y recuperación visual.
- Selección de pesos por tag: se puede instanciar por enum (`MobileNetV4ConvLargeWeights.E600_R384_IN1K`) o por cadena (`pretrained="E600_R384_IN1K"`).
- Inferencia por lotes (batch) sobre GPU o CPU mediante el framework Lucid.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, uso de agentes, capacidades multilingües, visión-lenguaje, audio ni modo de pensamiento. Es un clasificador de imágenes puro.

## Casos de uso

- Clasificación de imágenes en el borde (edge) y en móvil: con 32,6 M de parámetros y 124,96 MB de pesos, el modelo cabe en dispositivos con recursos limitados y puede ejecutarse en CPU, lo que permite etiquetar imágenes en el propio dispositivo sin enviar datos a la nube.
- Moderación de contenido automatizada: como primer filtro de una cadena de moderación, clasificando imágenes entrantes en categorías y derivando solo los casos dudosos a un modelo mayor o a revisión humana.
- Etiquetado y auto-tagging de bibliotecas de medios: sobre las 1000 clases de ImageNet-1k como vocabulario base, o reentrenando la cabeza de clasificación sobre un vocabulario propio de un archivo fotográfico o de vídeo.
- Búsqueda visual y recuperación de imágenes: usando los mapas de características intermedios como embeddings para indexar y recuperar imágenes similares en catálogos o bases de datos internas.
- Pre-anotación en pipelines de etiquetado y aprendizaje activo: el modelo propone etiquetas con su nivel de confianza y los anotadores corrigen solo los casos de baja probabilidad, reduciendo el coste de construcción de datasets propios.
- Control de calidad e inspección visual industrial: con fine-tuning sobre imágenes de la línea de producción, detectando piezas defectuosas o productos fuera de especificación a partir de la clasificación de la cabeza adaptada.
- Clasificación de productos en comercio electrónico: categorización automática de imágenes de catálogo, con la ventaja de una resolución de entrada de 384x384 que captura más detalle que los modelos que trabajan a 224x224.
- Backbone para transfer learning en tareas densas: congelando el extractor convolucional y añadiendo cabezas de detección o segmentación, se aprovecha la precisión del modelo con un coste de cómputo menor que el de arquitecturas transformer de tamaño comparable.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (marcados como no verificados). El resto de celdas no está disponible.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| image-classification | ImageNet-1k | acc@1 | 82,974 | No |
| image-classification | ImageNet-1k | acc@5 | 96,244 | No |

No se han publicado en la información disponible resultados de latencia, throughput, GFLOPs ni métricas de otras tareas (detección, segmentación, robustez ante corrupción) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos en fp32 de aproximadamente 125 MB; en fp16, alrededor de 62 MB; en int8, en torno a 31 MB. Con batch 1 a 384x384, la memoria pico del forward se mantiene muy por debajo de 1 GB.
- GPU recomendadas: GTX 1050 Ti, GTX 1650 o superiores para inferencia cómoda; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa en batch 1, pero sí en lotes grandes o en fine-tuning. Cabe en cualquier GPU consumer con 4 GB o más, e incluso en iGPU modernas.
- Ejecución en CPU: viable para inferencia puntual o por lotes pequeños, dado el tamaño reducido del modelo.
- Opciones de despliegue: el framework Lucid está soportado oficialmente, instanciando el modelo con `lucid.models.mobilenet_v4_conv_large_cls(pretrained=True)` y los pesos `MobileNetV4ConvLargeWeights.E600_R384_IN1K`. La model card no documenta exportaciones a ONNX, TensorRT, TorchScript ni integraciones con servidores de inferencia; el checkpoint equivalente de timm sí puede exportarse con las utilidades de esa librería.
- Latencia y throughput estimados: no disponible (no se han publicado datos).

## Comparativa con modelos similares

Los valores de los modelos alternativos provienen de sus artículos o de timm, no de la model card, y no son estrictamente comparables entre sí porque difieren en resolución de entrada y receta de entrenamiento.

| Modelo | Parametros | Resolucion | acc@1 ImageNet-1k | Licencia |
|---|---|---|---|---|
| mobilenet-v4-conv-large (este) | 32,6 M | 384 | 82,974 (declarado, no verificado) | Apache 2.0 |
| MobileNetV4-Conv-Medium (paper) | 9,2 M | 224 | 79,9 | Apache 2.0 (timm) |
| MobileNetV3-Large 1.0 (paper) | 5,4 M | 224 | 75,2 | Apache 2.0 |
| EfficientNet-B0 (paper) | 5,3 M | 224 | 77,1 | Apache 2.0 |
| ConvNeXt-Tiny (paper) | 28 M | 224 | 82,1 | MIT |

El modelo se sitúa en precisión cerca de ConvNeXt-Tiny, con un número de parámetros parecido (32,6 M frente a 28 M) pero con una familia de bloques diseñada específicamente para eficiencia en dispositivos móviles y una entrada de mayor resolución. Frente a MobileNetV3-Large y EfficientNet-B0 sacrifica tamaño a cambio de más de 5 puntos de acc@1. La comparación con ConvNeXt-Tiny está además condicionada por la resolución, ya que este modelo trabaja a 384x384 y ConvNeXt-Tiny lo hace a 224x224 en su configuración estándar.

## Limitaciones y advertencias

- Las métricas declaradas (82,974 % acc@1 y 96,244 % acc@5) están marcadas como no verificadas en el model-index; no han sido reproducidas de forma independiente.
- El repositorio registra 0 descargas y 0 likes, y las fechas publicadas por HuggingFace son del 24 de septiembre de 2026. No hay evidencia de uso en producción por parte de terceros.
- No es un modelo entrenado por el autor del repositorio, sino una conversión de pesos de timm; los posibles problemas de calidad heredados del checkpoint original no se documentan.
- Dependencia del framework Lucid, poco extendido en comparación con PyTorch nativo, timm u ONNX Runtime: la integración en infraestructuras existentes puede requerir trabajo adicional.
- Vocabulario de salida fijo de 1000 clases de ImageNet-1k y etiquetas en inglés; para cualquier dominio propio es necesario reentrenar o sustituir la cabeza de clasificación.
- Hereda los sesgos conocidos de ImageNet-1k en cuanto a representación geográfica, demográfica y de categorías, con especial debilidad en clases poco frecuentes o visualmente ambiguas.
- Riesgo de confusión entre clases visualmente similares (razas de animales, modelos de vehículos, variedades de plantas) y de sobreconfianza en imágenes fuera de la distribución de entrenamiento.
- No ofrece ningún mecanismo de abstención, calibración o detección de desconocidos; en entornos abiertos hay que añadir umbrales o un clasificador de rechazo.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar los avisos de licencia y atribución correspondientes.
- No se documentan cuantizaciones, exportaciones ni soporte para servidores de inferencia, por lo que el rendimiento real en producción debe medirse caso por caso.
- Los resultados de búsqueda web obtenidos para este modelo corresponden a entidades sin relación alguna (Lucid Motors, Lucidchart y Lucid Trading), por lo que no aportan información técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/mobilenet-v4-conv-large
- Articulo original: MobileNetV4: Universal Models for the Mobile Ecosystem (Qin et al., ECCV 2024), https://arxiv.org/abs/2404.10518
- Repositorio del framework Lucid: https://github.com/ChanLumerico/lucid
- Checkpoint de origen en timm: `timm/mobilenetv4_conv_large.e600_r384_in1k`
