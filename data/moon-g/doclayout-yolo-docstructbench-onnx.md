# moon-g/DocLayout-YOLO-DocStructBench-onnx

## Resumen

DocLayout-YOLO-DocStructBench-onnx es un modelo de detección de objetos especializado en el análisis de diseño (layout) de documentos, convertido a formato ONNX para su despliegue en aplicaciones de producción. Se trata de una versión espejo creada por el usuario moon-g para la aplicación moon-reader, que utiliza este modelo para identificar regiones estructurales en páginas de documentos. El modelo base es juliozhao/DocLayout-YOLO-DocStructBench, que a su vez deriva de DocLayout-YOLO, un detector de layout en tiempo real basado en YOLOv10 desarrollado por OpenDataLab.

El modelo detecta diez tipos de regiones documentales: título, texto plano, regiones descartables, figuras, pies de figura, tablas, pies de tabla, notas al pie de tabla, fórmulas aisladas y pies de fórmula. La arquitectura subyacente es YOLOv10m, con una entrada de imagen de 1024x1024 píxeles y una salida de hasta 300 detecciones con coordenadas, puntuación y clase. El archivo ONNX tiene un tamaño de aproximadamente 75 MB, lo que lo hace adecuado para integración en aplicaciones de escritorio o móviles con requisitos de latencia moderados. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10m (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato ONNX f32) |
| Idiomas soportados | en (para etiquetas de clases) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo único) |

## Arquitectura y entrenamiento

El modelo base DocLayout-YOLO utiliza la arquitectura YOLOv10, que introduce una estrategia de asignación de etiquetas sin NMS (Non-Maximum Suppression) durante el entrenamiento, logrando inferencias end-to-end. La variante m (medium) tiene un equilibrio entre velocidad y precisión. El modelo fue preentrenado en DocSynth-300K, un dataset sintético a gran escala de documentos, y se aplicó una técnica de optimización estructural llamada GL-CRM (Global-Local Content Receptive Module) para mejorar la detección de regiones pequeñas y densas. En la conversión a ONNX se incluyó una capa de NMS final, de modo que la salida ya contiene detecciones filtradas (hasta 300) con coordenadas absolutas en la imagen de entrada.

Los datos de entrenamiento específicos del modelo DocStructBench (la variante concreta de DocLayout-YOLO) no se detallan en la información disponible, pero se infiere que sigue el mismo procedimiento de DocLayout-YOLO, con mezcla de datos sintéticos y reales. La conversión a ONNX mantiene los pesos en precisión flotante de 32 bits, sin cuantización adicional.

## Capacidades

- Detección de regiones documentales: identifica títulos, texto, figuras, tablas, fórmulas y sus respectivos rótulos y notas.
- Salida estructurada: devuelve hasta 300 bounding boxes con coordenadas normalizadas, puntuación de confianza y clase.
- Procesamiento de imágenes de alta resolución: acepta imágenes de hasta 1024x1024 píxeles, con preprocesamiento de letterbox y normalización.
- Inferencia end-to-end: incluye NMS integrado, por lo que no se requiere post-procesamiento adicional.
- Compatibilidad multiplataforma: el formato ONNX permite ejecución con ONNX Runtime, tract (Rust) u otros motores compatibles.
- Multilingüe en la práctica: aunque las etiquetas de clase están en inglés, el modelo puede analizar documentos en cualquier idioma siempre que la estructura visual sea similar.

## Casos de uso

- **Digitalización de documentos históricos**: el modelo puede localizar títulos, párrafos y figuras en escaneos, facilitando la conversión a texto estructurado mediante OCR posterior.
- **Extracción de tablas en informes financieros**: identifica tablas y sus pies de tabla, permitiendo aislar regiones para extracción de datos con herramientas específicas.
- **Análisis de artículos científicos**: detecta fórmulas aisladas y sus rótulos, útil para indexar contenido matemático en repositorios académicos.
- **Automatización de procesos de revisión de contratos**: separa texto, tablas y figuras en documentos legales, mejorando la precisión de sistemas de búsqueda semántica.
- **Preprocesamiento para OCR**: al delimitar regiones de texto y tablas, el modelo reduce la carga del OCR al enfocarse solo en áreas relevantes.
- **Clasificación de documentos en empresas**: permite distinguir entre páginas de portada, índice, contenido y anexos, facilitando la organización automática de archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base DocLayout-YOLO reporta en su paper (arXiv:2410.12628) mejoras sobre YOLOv9 y YOLOv10 en tareas de layout analysis, pero no se incluyen cifras concretas en la documentación de este repositorio ONNX.

## Requisitos de hardware

- **VRAM estimada**: para la entrada de 1024x1024 píxeles y el modelo en FP32, se estima un consumo de memoria de alrededor de 2 GB en GPU, aunque no se han publicado cifras oficiales.
- **GPU recomendada**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) puede ejecutar el modelo en tiempo real (más de 30 FPS). Para inferencia en lote, se recomienda una RTX 3060 o superior.
- **CPU**: es posible ejecutar el modelo en CPU con ONNX Runtime, pero la latencia será mayor (del orden de segundos por imagen, dependiendo del hardware).
- **Despliegue**: se puede integrar en aplicaciones mediante ONNX Runtime (Python, C++, Rust) o tract para Rust. No hay soporte nativo para vLLM u otros motores de LLM, ya que no es un modelo de lenguaje.
- **Latencia**: no hay datos de referencia, pero se estima que en una GPU moderna (RTX 3080) la inferencia toma menos de 20 ms por imagen.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de análisis de diseño de documentos en la información proporcionada. Se puede mencionar que alternativas como LayoutLMv3 o YOLOv5-layout existen, pero no se han encontrado especificaciones comparables en este contexto.

## Limitaciones y advertencias

- El modelo está diseñado para documentos con estructura típica (artículos, informes, páginas web). Documentos con diseños muy complejos o no convencionales pueden dar falsos positivos o negativos.
- La lista de clases es fija; no es posible añadir categorías sin reentrenar.
- La resolución de entrada está fijada en 1024x1024; imágenes de mayor tamaño se escalan mediante letterbox, lo que puede reducir la precisión en elementos muy pequeños.
- El modelo no tiene capacidad de comprensión semántica; solo detecta regiones geométricas.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución al autor original.
- No se garantiza la precisión en documentos escritos en idiomas con escritura no latina (por ejemplo, chino, árabe) si la estructura visual difiere del conjunto de entrenamiento.

## Enlaces

- [Repositorio del modelo en Hugging Face (moon-g)](https://huggingface.co/moon-g/DocLayout-YOLO-DocStructBench-onnx)
- [Modelo base en Hugging Face (juliozhao)](https://huggingface.co/juliozhao/DocLayout-YOLO-DocStructBench)
- [Repositorio original de DocLayout-YOLO (GitHub)](https://github.com/opendatalab/DocLayout-YOLO)
- [Paper DocLayout-YOLO (arXiv)](https://arxiv.org/html/2410.12628v1)
- [Repositorio ONNX de wybxc (fuente original del ONNX)](https://huggingface.co/wybxc/DocLayout-YOLO-DocStructBench-onnx)
