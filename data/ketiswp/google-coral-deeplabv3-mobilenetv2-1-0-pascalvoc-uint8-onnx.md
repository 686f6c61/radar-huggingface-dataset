# ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-uint8-onnx

## Resumen

Este modelo es una conversión a formato ONNX con cuantización estática UINT8 del modelo DeepLabV3 con backbone MobileNetV2, originalmente publicado por Google dentro de su catálogo Coral para segmentación semántica de imágenes. La conversión ha sido realizada por el usuario ketiswp, que también publica la versión FP32 del mismo modelo en HuggingFace. El modelo está diseñado para clasificar cada píxel de una imagen en una de las 21 categorías del conjunto de datos Pascal VOC (20 clases de objetos más fondo).

La relevancia de esta conversión radica en que el formato ONNX con cuantización UINT8 en esquema QDQ (Quantize-Dequantize) permite desplegar el modelo en entornos de producción con requisitos de memoria y latencia reducidos, especialmente en dispositivos periféricos (edge) o CPUs sin acelerador gráfico. Al estar licenciado bajo Apache-2.0, puede integrarse en proyectos comerciales sin restricciones de uso significativas. La arquitectura es un DeepLabV3 con atrous convolutions y backbone MobileNetV2, aunque no se especifica el número total de parámetros en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | UINT8 estatica (formato QDQ) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepLabV3, que utiliza atrous convolutions (convoluciones con tasas de dilatación) para capturar contexto multiescala sin reducir la resolución espacial del mapa de características. El backbone es MobileNetV2, una red convolucional ligera diseñada para dispositivos móviles y sistemas con recursos limitados. La versión original fue entrenada por el equipo de TensorFlow en el dataset Pascal VOC 2012, con las 20 categorías de objetos más el fondo.

La conversión aquí presentada no modifica los pesos originales, sino que los cuantifica a UINT8 estático con esquema QDQ. La cuantización QDQ inserta nodos de cuantificación y descuantificación en el grafo ONNX, lo que permite su ejecución con operadores de 8 bits en ONNX Runtime y otros motores compatibles. No se dispone de información sobre el dataset de calibración utilizado para la cuantización ni sobre el proceso de entrenamiento original más allá de la referencia al repositorio de TensorFlow.

## Capacidades

- Segmentación semántica de imágenes: asigna una clase a cada píxel de la imagen, entre las 21 categorías de Pascal VOC (persona, vehículos, animales, objetos de interior, fondo, etc.).
- Inferencia sobre imágenes de entrada de tamaño fijo: el modelo espera entradas de 513x513 píxeles, según la configuración típica de DeepLabV3-MobileNetV2 en el modelo original de Google Coral.
- Compatibilidad con ONNX Runtime: el formato ONNX permite ejecutar el modelo en CPU, GPU y aceleradores NPU que soporten operadores UINT8, con la optimización que ofrece la cuantización.
- No incluye capacidades de tool calling, agentes, generación de texto ni procesamiento de lenguaje natural. Es un modelo exclusivamente de visión.

## Casos de uso

- Robótica móvil: segmentación de obstáculos y objetos en tiempo real en entornos interiores o exteriores, con un modelo ligero que puede ejecutarse en una CPU de placa embebida (por ejemplo, Raspberry Pi o Jetson Nano) gracias a la cuantización UINT8.
- Automatización de inspección visual: detección de objetos en líneas de producción, como piezas, vehículos o personas, en imágenes estáticas o flujos de vídeo.
- Asistencia a la conducción: segmentación de carretera, vehículos y peatones en aplicaciones de investigación o prototipos de sistemas de ayuda al conductor.
- Análisis de imágenes aéreas: identificación de estructuras, vegetación o vehículos en imágenes tomadas por drones, usando la categoría de fondo y las 20 clases de Pascal VOC.
- Aplicaciones de realidad aumentada: separación de fondo y primer plano para superponer elementos virtuales en vídeo en tiempo real, gracias a la baja latencia del modelo cuantizado.
- Investigación académica: modelo de referencia para comparar técnicas de segmentación en Pascal VOC, especialmente en estudios que evalúan el impacto de la cuantización en la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mIoU, precisión por clase o latencia de inferencia para esta versión cuantizada. El modelo original de TensorFlow DeepLabV3-MobileNetV2 alcanza aproximadamente un mIoU de 61.1 en el dataset Pascal VOC 2012 val, pero no se ha verificado que esta conversión conserve exactamente ese rendimiento debido a la cuantización.

## Requisitos de hardware

- Al ser un modelo UINT8 con backbone MobileNetV2, es adecuado para ejecución en CPU convencional y en dispositivos embebidos con soporte para operadores ONNX de 8 bits.
- No se indica la VRAM estimada ni el número de parámetros, por lo que no se puede calcular el consumo de memoria exacto. Sin embargo, los modelos DeepLabV3-MobileNetV2 suelen ocupar entre 5 y 20 MB en FP32, y la versión UINT8 debería ser notablemente menor.
- Compatible con GPU mediante ONNX Runtime (CUDA) si se desea mayor velocidad, aunque el principal beneficio es su uso en CPU y edge.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), TensorRT, OpenVINO, o cualquier runtime que soporte el formato ONNX. También se puede integrar en aplicaciones móviles con ML Kit o CoreML si se convierte el modelo.
- La latencia en CPU depende del hardware; en un procesador moderno (por ejemplo, Intel i5 de 8.ª generación) se estima un tiempo de inferencia de 50-100 ms por imagen de 513x513, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Cuantización | Licencia | Formato |
|---|---|---|---|---|
| Este modelo | DeepLabV3-MobileNetV2 | UINT8 (QDQ) | Apache-2.0 | ONNX |
| Original de Google Coral | DeepLabV3-MobileNetV2 | FP32 | Apache-2.0 | TensorFlow Lite |
| Qualcomm DeepLabV3-Plus-MobileNet | DeepLabV3-Plus-MobileNet | FP32 | BSD-3-Clause | ONNX (para Qualcomm AI Hub) |

No se dispone de datos de rendimiento para comparar directamente. El modelo de Qualcomm, aunque similar, utiliza la variante Plus y está optimizado para los aceleradores de Qualcomm, lo que puede ofrecer mejor rendimiento en hardware específico. La versión de Google Coral original incluye soporte para TensorFlow Lite y TPU de Coral, mientras que esta conversión ONNX es más genérica.

## Limitaciones y advertencias

- El modelo está limitado a las 21 clases de Pascal VOC (20 objetos + fondo). No puede segmentar otras categorías como árboles, agua, etc., si no están en esa lista.
- La cuantización UINT8 puede reducir la precisión de la segmentación, especialmente en bordes de objetos o en condiciones de iluminación difíciles, aunque no se ha cuantificado la pérdida exacta.
- No se proporcionan datos sobre sesgos del modelo. Al estar entrenado con Pascal VOC, que contiene imágenes de escenas urbanas y naturales, puede tener un rendimiento inferior en dominios no representados.
- El tamaño del modelo y los parámetros exactos no están documentados, lo que dificulta la planificación precisa de recursos.
- No se han validado los resultados de inferencia en un conjunto de datos de prueba tras la cuantización; se recomienda evaluar el modelo en el propio dataset antes de usarlo en producción.

## Enlaces

- HuggingFace del modelo UINT8: https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-uint8-onnx
- Versión FP32 del mismo autor: https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-fp32-onnx
- Repositorio original de TensorFlow DeepLab: https://github.com/tensorflow/models/tree/archive/research/deeplab
- Modelo similar de Qualcomm: https://huggingface.co/qualcomm/DeepLabV3-Plus-MobileNet
- Documentación de Qualcomm AI Hub: https://aihub.qualcomm.com/models/deeplabv3_plus_mobilenet
