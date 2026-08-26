# nalrava/web-ocr-models

## Resumen

Este repositorio agrupa un conjunto de modelos OCR derivados de PaddleOCR y PaddleX, convertidos a formato ONNX para su ejecución en navegador. Incluye un modelo de detección de texto (PP-OCRv5_mobile_det_onnx), un modelo de reconocimiento de texto en coreano (korean_PP-OCRv5_mobile_rec_onnx), un modelo de análisis de layout de documentos (PP-DocLayout-S-ONNX) y modelos adicionales de PaddleOCR procedentes de otros autores. El objetivo principal es proporcionar un pipeline OCR completo —detección, reconocimiento y análisis de estructura— que pueda ejecutarse en el cliente web mediante ONNX Runtime, sin necesidad de servidor dedicado.

La relevancia del modelo radica en la creciente demanda de OCR en el navegador para aplicaciones con requisitos de privacidad y latencia. Al derivarse de PaddleOCR v5, hereda un pipeline maduro y optimizado para dispositivos móviles, con licencia Apache-2.0 que permite uso comercial. No obstante, el repositorio tiene 0 descargas y 0 likes, y su tamaño es de 0.0 GB, lo que sugiere que los pesos no están alojados directamente o que la publicación es incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detección y reconocimiento de texto basado en CNN (PaddleOCR v5) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Existe referencia a una versión cuantizada del modelo de detección (PP-OCRv5_mobile_det_onnx quantizado); detalles de cuantización no disponibles |
| Idiomas soportados | Coreano para reconocimiento; detección de texto independiente del idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El pipeline OCR de PaddleOCR v5 consta de dos etapas principales: un modelo de detección (PP-OCRv5_mobile_det) que localiza las regiones de texto en la imagen, y un modelo de reconocimiento (PP-OCRv5_mobile_rec) que transcribe el texto detectado. En este repositorio, el modelo de reconocimiento está entrenado específicamente para coreano. Adicionalmente, se incluye un modelo de análisis de layout (PP-DocLayout-S-ONNX) que clasifica las regiones de un documento (títulos, párrafos, tablas, etc.), lo que permite estructurar el contenido extraído.

Los modelos base pertenecen a la familia PaddleOCR v5 de PaddlePaddle, que introduce mejoras respecto a versiones anteriores en precisión y eficiencia, con variantes móviles optimizadas para dispositivos con recursos limitados. No se dispone de detalles sobre el entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) en la información proporcionada. Los archivos ONNX se ofrecen específicamente para inferencia en navegador, lo que implica que fueron exportados desde los pesos originales de PaddlePaddle mediante el exportador de ONNX del framework.

## Capacidades

- Detección de texto en imágenes: localiza regiones de texto mediante bounding boxes, soportando escenas complejas.
- Reconocimiento de texto coreano: transcribe caracteres coreanos a partir de las regiones detectadas.
- Análisis de layout de documentos: clasifica regiones como títulos, párrafos, tablas, imágenes, etc., mediante PP-DocLayout-S.
- Inferencia en navegador: los archivos ONNX permiten ejecutar el pipeline en el cliente con ONNX Runtime Web (WebAssembly) o WebGPU.
- Despliegue sin servidor: el OCR completo puede ejecutarse en el navegador, lo que evita el envío de datos sensibles a servidores externos.
- No incluye capacidades de tool calling, agentes, visión multimodal ni generación de texto: es un pipeline de OCR clásico.

## Casos de uso

- **Extracción de texto en el navegador con privacidad**: al ejecutar el OCR en el cliente mediante ONNX, documentos con datos personales o confidenciales pueden procesarse sin salir del dispositivo, cumpliendo requisitos de protección de datos.
- **Digitalización de documentos coreanos**: el modelo de reconocimiento coreano permite transcribir documentos administrativos, históricos o académicos en coreano, integrado en una aplicación web o PWA.
- **Análisis de layout para indexación de documentos**: el modelo de layout clasifica regiones de documentos escaneados, lo que permite estructurar el contenido (títulos, tablas, párrafos) antes de alimentar un sistema de gestión documental.
- **Preprocesamiento para pipelines de RAG**: el OCR combinado con análisis de layout puede extraer texto estructurado de PDFs e imágenes para la indexación en sistemas de recuperación aumentada (RAG), mejorando la calidad de los chunks.
- **Captura de datos en formularios y facturas**: el pipeline de detección + reconocimiento puede aplicarse para extraer campos de formularios, facturas o tarjetas de visita, con un frontend que muestre los resultados en tiempo real.
- **OCR offline en aplicaciones móviles**: al ser modelos móviles en formato ONNX, pueden ejecutarse en dispositivos Android/iOS mediante ONNX Runtime Mobile, permitiendo OCR sin conexión.
- **Automatización de entrada de datos**: el pipeline puede integrarse en un flujo de procesamiento de documentos para extraer texto de imágenes y alimentar bases de datos o ERP, con la ventaja de no depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los modelos son de la variante "mobile" de PaddleOCR v5, diseñados para baja latencia y bajo consumo de recursos.
- Inferencia en navegador mediante ONNX Runtime Web: funciona en CPU con WebAssembly, sin necesidad de GPU.
- Para dispositivos móviles, puede usarse ONNX Runtime Mobile; los modelos móviles de PaddleOCR están optimizados para ARM y x86.
- En servidor, pueden desplegarse con ONNX Runtime, Paddle Inference o vLLM (aunque vLLM no es el runtime habitual para OCR).
- No se dispone de datos de VRAM, latencia o throughput estimados en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con alternativas como Tesseract, EasyOCR, PaddleOCR en su versión completa o modelos comerciales como Azure Document Intelligence. Los modelos base (PaddleOCR v5) son de código abierto y están ampliamente documentados, pero no se han incluido comparativas en esta ficha.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-08-26: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que los archivos ONNX podrían no estar alojados directamente o que el repositorio es solo una referencia a los modelos base.
- El modelo de reconocimiento está entrenado únicamente para coreano; no cubre otros idiomas en la etapa de reconocimiento.
- No se especifican las técnicas de cuantización aplicadas ni el rendimiento en dispositivos de gama baja.
- Los modelos derivados de PaddleOCR requieren el pipeline completo (detección + reconocimiento + postprocesado) para funcionar correctamente; el uso de los modelos aislados requiere configurar el flujo de procesamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las licencias de cada componente base (PaddleOCR, PaddlePaddle, etc.) antes de un despliegue en producción.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplicable al ser OCR) o limitaciones de contexto, al tratarse de un modelo de visión y no de lenguaje.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/nalrava/web-ocr-models)
- [Modelo base de detección: PaddlePaddle/PP-OCRv5_mobile_det_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx)
- [Modelo base de reconocimiento coreano: PaddlePaddle/korean_PP-OCRv5_mobile_rec_onnx](https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec_onnx)
- [Modelo de layout: stefanj0/PP-DocLayout-S-ONNX](https://huggingface.co/stefanj0/PP-DocLayout-S-ONNX)
- [Proyecto original PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- [Blog de HuggingFace sobre modelos OCR open source](https://huggingface.co/blog/ocr-open-models)
