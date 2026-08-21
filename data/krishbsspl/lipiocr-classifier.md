# krishBSSPL/lipiocr-classifier

## Resumen

El modelo `krishBSSPL/lipiocr-classifier` es un clasificador de tipos de documento ligero, desarrollado como etapa de clasificación del pipeline LipiOCR, un sistema de inteligencia documental orientado a velocidad (clasificar → OCR → decodificar QR/códigos de barras → normalizar). Está diseñado para complementar a ZuraAI-VL, un VLM más grande que realiza extracción estructurada completa. El modelo resuelve el problema de identificar automáticamente el tipo de documento (factura, pasaporte, nómina, etc.) a partir de una imagen fotografiada o escaneada, en milisegundos y sin necesidad de GPU potente.

Arquitectónicamente se basa en EfficientNet-B0, implementado con la librería `timm`, preentrenado en ImageNet y ajustado de extremo a extremo. Tiene aproximadamente 4,1 millones de parámetros (según el archivo safetensors) y acepta imágenes RGB de 224×224 píxeles. Clasifica en 42 categorías de documentos. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (vía `timm`) |
| Parametros totales | 4.103.366 (según safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen 224×224) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión completa) |
| Idiomas soportados | no disponible (entrenado principalmente con documentos en inglés y escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza EfficientNet-B0, una arquitectura convolutional eficiente que emplea compound scaling para equilibrar profundidad, anchura y resolución. Se usa la implementación de `timm` con pesos preentrenados en ImageNet y se ajusta completamente (fine-tuning end-to-end) para la tarea de clasificación de documentos. La entrada es una imagen RGB de 224×224 y la salida es una distribución de probabilidad sobre 42 clases.

El entrenamiento se realizó con 7.227 imágenes de entrenamiento distribuidas en 42 categorías. La mayoría son imágenes sintéticas generadas con Faker, que producen documentos con diseños realistas, colores y, en las categorías financieras, códigos QR y de barras reales decodificables. También se incluyó un pequeño conjunto de documentos reales fotografiados o escaneados, que se sobremuestrearon 15 veces para evitar que quedaran diluidos por la mayoría sintética. Se aplicaron aumentos como deformación en perspectiva, textura de papel, gradientes de iluminación direccional, artefactos JPEG y rotación alineada al eje. Esta decisión se tomó porque una primera versión entrenada solo con renders sintéticos limpios obtuvo 0/11 en documentos reales, mientras que con estos aumentos la precisión en documentos reales subió a aproximadamente 90% en la mayoría de categorías.

## Capacidades

- Clasificación de imágenes de documentos en 42 categorías predefinidas, incluyendo identidad (DNI, pasaporte, visado), financieras (cheques, facturas, extractos bancarios), viajes (tarjetas de embarque, cartas de porte), certificados y documentos de negocio.
- Inferencia rápida en CPU o GPU, diseñada para latencias de milisegundos.
- No realiza OCR ni lectura de texto: es exclusivamente un clasificador de tipo de documento.
- No tiene capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo de visión puro.
- Soporte multilingüe limitado: entrenado principalmente con documentos en inglés y escritura latina, aunque las categorías son genéricas y podrían aplicarse a otros idiomas con cierta pérdida de precisión.

## Casos de uso

- Onboarding digital en entidades financieras: el modelo puede clasificar automáticamente el tipo de documento de identidad (pasaporte, DNI, visado) en un flujo KYC, reduciendo el tiempo de verificación manual. Su baja latencia permite procesar cientos de solicitudes por minuto en CPU.
- Automatización de procesos de cuentas por pagar: al recibir facturas, recibos u órdenes de compra escaneadas, el clasificador las etiqueta y las enruta al sistema de extracción de datos correspondiente, evitando la intervención humana en tareas repetitivas.
- Gestión documental en aseguradoras: clasificación de pólizas, certificados médicos y formularios de reclamación para su archivado y posterior procesamiento, con integración en sistemas de gestión documental (DMS).
- Digitalización de expedientes de recursos humanos: identificación de currículos, cartas de oferta, nóminas y certificados de empleo en procesos de contratación o auditoría, permitiendo una indexación automática.
- Clasificación de documentos en aplicaciones móviles de escaneo: integración en apps que permiten al usuario fotografiar un documento y recibir al instante el tipo detectado, mejorando la experiencia de usuario en apps de finanzas o administración.
- Preprocesamiento en pipelines de OCR: como etapa previa a un sistema de extracción (por ejemplo, el propio LipiOCR con glm-ocr), el clasificador selecciona el modelo de extracción adecuado según el tipo de documento, optimizando la precisión y el coste computacional.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados:

| Métrica | Valor |
|---|---|
| Precisión en validación sintética (split reservado, 1.167 ejemplos) | 99,66% |
| Precisión en validación con documentos reales (spot check, 12 ejemplos) | 11/12 (≈91,7%) |

No se han publicado resultados comparativos con otros clasificadores de documentos en la información disponible. El autor indica que la categoría más difícil es la de expedientes académicos reales (marksheets), con una precisión real de aproximadamente 40%, frente al 90%+ de la mayoría de categorías.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~4,1 millones de parámetros, la inferencia en FP32 requiere aproximadamente 16 MB de VRAM (4,1M × 4 bytes). Cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU con tiempos de inferencia de decenas de milisegundos por imagen.
- En consumer GPU: sí, funciona en cualquier GPU moderna (RTX 2060, GTX 1650, etc.) y también en hardware de bajo consumo como Raspberry Pi con optimizaciones.
- Opciones de despliegue: al ser un modelo `timm`, se puede exportar a ONNX o TorchScript para servir con TorchServe, ONNX Runtime, o integrarse en aplicaciones Python. También es posible convertirlo a TensorFlow Lite para despliegue en móvil.
- Latencia estimada: en CPU moderna (por ejemplo, Intel i7) se esperan latencias de 10-30 ms por imagen; en GPU, menos de 5 ms.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros clasificadores de documentos como DocTR, LayoutLM o modelos de clasificación de imágenes genéricos. El modelo se posiciona como una solución ligera y específica para 42 tipos de documentos, con un tamaño muy reducido en comparación con modelos multimodales grandes. No obstante, su precisión en documentos reales es limitada en categorías con alta variabilidad (expedientes académicos), por lo que en entornos de producción con documentos muy heterogéneos podría requerir un modelo más robusto o un ajuste adicional.

## Limitaciones y advertencias

- Sesgo hacia documentos sintéticos: aunque se aplicaron aumentos para mejorar la robustez, la mayoría del entrenamiento es sintético, lo que puede causar degradación en documentos reales con diseños muy atípicos.
- Confusión entre marksheet y currículum: ambos se representan como listas estructuradas de líneas, y es el par de clases más débil.
- Precisión baja en expedientes académicos reales: la variabilidad de los formatos de transcripciones reales hace que esta categoría tenga una precisión de solo ~40% en el mundo real.
- Limitación idiomática: entrenado principalmente con documentos en inglés y escritura latina; documentos en otros alfabetos o idiomas pueden no clasificarse correctamente.
- Sin capacidades de OCR ni extracción de texto: el modelo solo clasifica el tipo de documento; cualquier tarea de extracción requiere un pipeline adicional.
- Riesgo de alucinación no aplica (modelo discriminativo), pero sí existe riesgo de clasificación errónea con consecuencias en flujos automatizados; se recomienda validación humana en casos de alta confianza baja.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krishBSSPL/lipiocr-classifier
- Proyecto LipiOCR (GitHub): https://github.com/lipione/lipiocr
- ZuraAI-VL (VLM complementario): https://ollama.com/bsspl/zuraai-vl-v3
- glm-ocr (etapa OCR del pipeline): https://ollama.com/bsspl/glm-ocr
