# snowfluke/ppu-paddle-ocr-models

## Resumen

Este repositorio de Hugging Face, `snowfluke/ppu-paddle-ocr-models`, es un conjunto de modelos ONNX para tareas de OCR (detección y reconocimiento de texto) y análisis de documentos, preparados para la librería TypeScript `ppu-paddle-ocr`. El paquete incluye modelos de detección de texto, reconocimiento de caracteres, análisis de layout, corrección de orientación y reconocimiento de tablas, todos convertidos desde los modelos oficiales de PaddleOCR (versiones PP-OCRv3 a PP-OCRv6). La ventaja principal es que estos modelos se distribuyen en formato ONNX y ONNX Runtime FlatBuffers (`.ort`), lo que permite ejecutar OCR en entornos JavaScript, navegador o servidores sin depender del framework PaddlePaddle original.

El repositorio es mantenido por el usuario `snowfluke` (asociado a la organización PT-Perkasa-Pilar-Utama) y se actualiza con la familia PP-OCRv6, que incluye variantes `tiny`, `small` y `medium`. Aunque no se especifican los parámetros exactos de cada red, los modelos `tiny` ocupan alrededor de 6 MB, lo que los hace adecuados para despliegues ligeros. El repositorio completo tiene un tamaño de 1,7 GB y contiene decenas de archivos, incluyendo diccionarios para múltiples idiomas. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en proyectos de código abierto y privados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelos de PaddleOCR: redes neuronales convolucionales y transformadores para detección y reconocimiento de texto) |
| Parametros totales | No disponible (varía según el modelo; los modelos `tiny` ocupan ~6 MB en peso) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelos de OCR, no generativos) |
| Tipos de cuantizacion | Se incluye una versión int8 para el modelo de reconocimiento en inglés (`en_PP-OCRv5_mobile_rec_infer_int8.onnx`) |
| Idiomas soportados | Múltiples: árabe, cirílico, devanagari, griego, inglés, eslavo, japonés, coreano, latín, tamil, telugu, tailandés, y chino (diccionarios en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) y ONNX Runtime FlatBuffers (`.ort`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el entrenamiento de estos modelos. Según el README, los archivos provienen de los modelos oficiales de PaddleOCR (https://www.paddleocr.ai/main/en/index.html) y se han convertido a formato ONNX para su uso con ONNX Runtime. Los archivos `.ort` son los mismos modelos pre-serializados en el formato FlatBuffers nativo de ONNX Runtime, lo que reduce el tiempo de creación de sesión de ~24 ms a ~7 ms en un chip M1, manteniendo una salida byte-idéntica a la versión `.onnx`. No se indica el número de tokens de entrenamiento ni el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO (no aplicable a modelos de OCR).

## Capacidades

- **Detección de texto**: modelos como `PP-OCRv4_mobile_det_infer`, `PP-OCRv5_mobile_det_infer`, `PP-OCRv6_tiny_det` identifican regiones de texto en imágenes.
- **Reconocimiento de texto**: modelos de reconocimiento de caracteres (rec) para convertir las regiones detectadas en texto legible. Se incluyen variantes para distintos idiomas.
- **Detección de layout de documentos**: `PP-DocLayoutV2` y `PP-DocLayoutV3` permiten segmentar páginas en bloques como títulos, párrafos, imágenes, tablas, etc.
- **Corrección de orientación y perspectiva**: modelos `UVDoc`, `PP-LCNet_x0_25_textline_ori` y `PP-LCNet_x1_0_doc_ori` para corregir imágenes inclinadas o distorsionadas.
- **Reconocimiento de tablas**: modelos `SLANet_plus`, `RT-DETR-L_wired_table_cell_det` y `RT-DETR-L_wireless_table_cell_det` para detectar y extraer tablas.
- **Multilingüe**: soporta múltiples alfabetos mediante diccionarios específicos (árabe, cirílico, devanagari, griego, japonés, coreano, etc.).
- **Ejecución en navegador**: la librería asociada `ppu-paddle-ocr` ofrece una demo interactiva que ejecuta los modelos en el navegador con `onnxruntime-web` y WebGPU, sin necesidad de servidor.

## Casos de uso

- **Digitalización de documentos**: convierte imágenes de documentos escaneados en texto editable mediante la combinación de detección y reconocimiento de texto. Los modelos de layout permiten mantener la estructura original.
- **Extracción de datos de facturas y recibos**: el reconocimiento de texto y la detección de tablas facilitan la captura de campos como montos, fechas y números de factura en flujos de automatización.
- **OCR para aplicaciones móviles**: los modelos `tiny` (~6 MB) son lo suficientemente ligeros para ejecutarse en dispositivos con recursos limitados, ya sea en el móvil o en un backend de bajo coste.
- **Indexación de documentos en sistemas de gestión**: la combinación de layout y OCR permite generar metadatos y búsqueda de texto completo en archivos PDF e imágenes.
- **Análisis de imágenes de libros antiguos**: los modelos multilingües y de corrección de orientación pueden ayudar a digitalizar textos históricos con caracteres no latinos.
- **Automatización de entrada de datos**: en entornos empresariales, el OCR puede integrarse en pipelines de procesamiento de formularios, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tablas comparativas con otros modelos de OCR en el repositorio ni en la documentación asociada.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Los modelos `tiny` (~6 MB) pueden ejecutarse en CPU sin GPU dedicada; los modelos `medium` o `server` requerirán más memoria, pero no hay cifras exactas.
- **GPU recomendadas**: no se especifican. Dado el tamaño reducido, cualquier GPU con soporte CUDA (por ejemplo, RTX 2060 o superior) puede ejecutarlos, aunque la CPU es suficiente para los modelos `tiny`.
- **Compatibilidad con GPU de consumo**: sí, especialmente los modelos `tiny` y `small` caben en GPU de gama media con 4-8 GB de VRAM.
- **Opciones de despliegue**: ONNX Runtime (C++, Python, Node.js), `onnxruntime-web` para navegador, y la librería `ppu-paddle-ocr` que facilita la integración en proyectos TypeScript/JavaScript.
- **Latencia y throughput**: no se proporcionan datos. La conversión a `.ort` reduce el tiempo de creación de sesión, pero no se especifican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Multilingüe | Despliegue | Licencia |
|---|---|---|---|---|---|
| `snowfluke/ppu-paddle-ocr-models` (PP-OCRv6) | ONNX/ORT | ~6 MB (tiny) | Sí (13+ idiomas) | ONNX Runtime, navegador | Apache 2.0 |
| PaddleOCR original (PaddlePaddle) | Paddle | ~10-100 MB | Sí | PaddlePaddle | Apache 2.0 |
| EasyOCR | PyTorch | ~100 MB | 80+ idiomas | PyTorch | Apache 2.0 |
| Tesseract | C++ | ~50 MB | 100+ idiomas | CLI, Python | Apache 2.0 |

La principal ventaja de este paquete es que ofrece los modelos de PaddleOCR en formato ONNX, lo que permite ejecutarlos sin instalar el framework PaddlePaddle completo y con un ecosistema de herramientas más amplio (ONNX Runtime, WebGPU, etc.). A diferencia de Tesseract, estos modelos están diseñados para detección y reconocimiento de texto en imágenes naturales y documentos complejos, y su soporte multilingüe es comparable al de EasyOCR.

## Limitaciones y advertencias

- **Dependencia de la librería `ppu-paddle-ocr`**: los modelos están pensados para funcionar con esa librería específica; aunque se pueden usar directamente con ONNX Runtime, la integración fuera de ese ecosistema puede requerir adaptaciones.
- **Alucinación o errores de OCR**: como todos los modelos de OCR, pueden cometer errores en texto manuscrito, imágenes de baja calidad o con ruido. No se han publicado métricas de precisión.
- **Idiomas limitados a los diccionarios**: aunque hay varios idiomas, no cubre todos los idiomas del mundo. Si se necesita un idioma no incluido, habría que entrenar o añadir un diccionario propio.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero los modelos originales de PaddleOCR también están bajo Apache 2.0, por lo que no hay restricciones adicionales. No obstante, es recomendable revisar los términos de PaddleOCR por si hubiera cambios.
- **No es un modelo generativo**: no se puede utilizar para generación de texto o conversación; su único propósito es la extracción de texto de imágenes.
- **Tamaño del repositorio**: 1,7 GB, lo que puede ser excesivo si solo se necesita un modelo específico. Se puede descargar solo los archivos necesarios.

## Enlaces

- HuggingFace: https://huggingface.co/snowfluke/ppu-paddle-ocr-models
- GitHub (modelos): https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models
- Librería ppu-paddle-ocr: https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr
- Página de JSR de la librería: https://jsr.io/@snowfluke/ppu-paddle-ocr
- Demo interactiva en navegador: https://ppu-paddle-ocr.snowfluke.workers.dev/
- Página oficial de PaddleOCR: https://www.paddleocr.ai/main/en/index.html

No se han encontrado papers académicos específicos para estos modelos convertidos; la documentación se basa en la información del repositorio y la documentación de PaddleOCR.</think>## Resumen

Este repositorio de Hugging Face, `snowfluke/ppu-paddle-ocr-models`, es un conjunto de modelos ONNX para tareas de OCR (detección y reconocimiento de texto) y análisis de documentos, preparados para la librería TypeScript `ppu-paddle-ocr`. Incluye modelos de detección de texto, reconocimiento de caracteres, layout, corrección de orientación y reconocimiento de tablas, todos convertidos desde los modelos oficiales de PaddleOCR (versiones PP-OCRv3 a PP-OCRv6). La principal ventaja es que estos modelos se distribuyen en formato ONNX y ONNX Runtime FlatBuffers (`.ort`), lo que permite ejecutar OCR en entornos como Node.js, navegador o servidores sin depender del runtime de PaddlePaddle.

El repositorio es mantenido por el desarrollador `snowfluke` (vinculado a PT-Perkasa-Pilar-Utama) y se actualiza con la familia PP-OCRv6, que incluye variantes `tiny`, `small` y `medium`. Los modelos `tiny` ocupan aproximadamente 6 MB, lo que los hace adecuados para despliegues ligeros. El repositorio completo tiene un tamaño de 1,7 GB y contiene decenas de archivos, incluyendo diccionarios para 13 idiomas. La licencia Apache 2.0 permite uso comercial y modificación, facilitando su integración en proyectos de código abierto y privados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelos de PaddleOCR; redes neuronales convolucionales y transformadores para detección y reconocimiento de texto) |
| Parametros totales | No disponible (varía según el modelo; los modelos `tiny` ocupan ~6 MB en peso) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelos de OCR, no generativos) |
| Tipos de cuantizacion | Se incluye una versión int8 para el modelo de reconocimiento en inglés (`en_PP-OCRv5_mobile_rec_infer_int8.onnx`) |
| Idiomas soportados | Múltiples: árabe, cirílico, devanagari, griego, inglés, eslavo, japonés, coreano, latino, tamil, telugu, tailandés y chino (según diccionarios del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) y ONNX Runtime FlatBuffers (`.ort`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el entrenamiento de estos modelos. Según el README, los modelos provienen de los modelos oficiales de PaddleOCR (https://www.paddleocr.ai/main/en/index.html) y se han convertido a ONNX para su uso con ONNX Runtime. Los archivos `.ort` son los mismos modelos pre-serializados en el formato FlatBuffers nativo de ONNX Runtime, lo que reduce el tiempo de creación de sesión de ~24 ms a ~7 ms en un chip M1, manteniendo una salida byte-idéntica a la versión `.onnx`. No se indica el número de tokens de entrenamiento ni la técnica de optimización (RLHF, DPO, etc.), ya que no es aplicable a modelos de OCR.

## Capacidades

- **Detección de texto**: modelos como `PP-OCRv4_mobile_det_infer`, `PP-OCRv5_mobile_det_infer`, `PP-OCRv6_tiny_det` localizan regiones de texto en imágenes.
- **Reconocimiento de texto**: modelos de reconocimiento (rec) como `PP-OCRv5_mobile_rec_infer` y `PP-OCRv6_tiny_rec` convierten las regiones detectadas en cadenas de texto.
- **Detección de layout**: `PP-DocLayoutV2` y `PP-DocLayoutV3` segmentan documentos en bloques (títulos, párrafos, imágenes, tablas).
- **Corrección de orientación y perspectiva**: modelos `UVDnet`, `PP-LCNet_x0_25_textline_ori` y `PP-LCNet_x1_0_doc_ori` corrigen imágenes inclinadas o distorsionadas.
- **Reconocimiento de tablas**: `SLANet_plus`, `RT-DETR-L_wired_table_cell_det` y `RT-DETR-L_wireless_table_cell_det` extraen la estructura de tablas.
- **Multilingüe**: soporta varios alfabetos mediante diccionarios específicos (árabe, cirílico, devanagari, griego, japonés, coreano, etc.).
- **Ejecución en navegador**: la librería `ppu-paddle-ocr` ofrece una demo interactiva que ejecuta OCR en el navegador con `onnxruntime-web` y WebGPU, sin necesidad de servidor.

## Casos de uso

- **Digitalización de documentos**: convierte imágenes de documentos escaneados en texto editable combinando detección y reconocimiento; los modelos de layout preservan la estructura original.
- **Extracción de datos de facturas**: la detección de tablas y el reconocimiento de texto permiten capturar montos, fechas y números de factura en flujos de automatización.
- **OCR en aplicaciones móviles**: los modelos `tiny` (~6 MB) son ligeros y pueden ejecutarse en dispositivos con recursos limitados, ya sea en el dispositivo o en un backend de bajo coste.
- **Búsqueda de texto completo en archivos**: la combinación de layout y reconocimiento facilita la indexación de documentos escaneados en sistemas de gestión documental.
- **Análisis de imágenes de archivo**: los modelos multilingües y de corrección de orientación ayudan a digitalizar textos históricos en alfabetos no latinos.
- **Automatización de formularios**: en entornos empresariales, el OCR puede integrarse en pipelines de lectura de formularios, reduciendo la entrada manual de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tablas de métricas (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. No se proporcionan datos de precisión en OCR ni comparativas con otros sistemas.

## Requisitos de hardware

- **VRAM**: no disponible. Los modelos `tiny` (~6 MB) pueden ejecutarse en CPU; los modelos `medium` o `server` requieren más memoria, pero no se especifican cifras exactas.
- **GPU recomendadas**: no se indican. Dado el formato ONNX, cualquier GPU con soporte CUDA (por ejemplo, RTX 2060 o superior) puede ejecutarlos, aunque los modelos pequeños también funcionan en CPU.
- **Compatibilidad con GPU de consumo**: sí, especialmente los modelos `tiny` y `small` caben en GPUs de gama media con 4-8 GB de VRAM.
- **Opciones de despliegue**: ONNX Runtime (CPU, Python, Node.js), `onnxruntime-web` para navegador, y la librería `ppu-paddle-ocr` para integración TypeScript.
- **Latencia y throughput**: no hay datos publicados. La conversión a `.ort` reduce el tiempo de creación de sesión, pero no se documentan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño (tiny) | Idiomas | Despliegue | Licencia |
|--------|---------|---------------|---------|------------|----------|
| `snowfluke/ppu-paddle-ocr-models` (PP-OCRv6) | ONNX/ORT | ~6 MB | 13+ | ONNX Runtime, navegador | Apache 2.0 |
| PaddleOCR original (PaddlePaddle) | PaddlePaddle | ~10-100 MB | 13+ | PaddlePaddle | Apache 2.0 |
| EasyOCR | PyTorch | ~5 MB | 80+ | PyTorch | Apache 2.0 |
| Tesseract | C++ | ~3 MB | 100+ | CLI, Python | Apache 2.0 |

La ventaja de este paquete es que ofrece los modelos de PaddleOCR en formato ONNX, lo que elimina la dependencia del runtime de PaddlePaddle y permite usar el ecosistema ONNX (incluido WebGPU). A diferencia de Tesseract, estos modelos están optimizados para texto en imágenes naturales y documentos complejos, y su soporte multilingüe es comparable al de EasyOCR.

## Limitaciones y advertencias

- **Dependencia de la librería `ppu-paddle-ocr`**: los modelos están pensados para funcionar con esa librería; aunque se pueden usar directamente con ONNX Runtime, la integración fuera de ese ecosistema puede requerir adaptación.
- **Errores de OCR**: como todos los modelos de OCR, pueden fallar en texto manuscrito, imágenes de baja calidad o con distorsiones. No se han publicado métricas de precisión.
- **Cobertura de idiomas limitada**: aunque hay diccionarios para varios idiomas, no cubre todos los idiomas del mundo. Para un idioma no incluido, sería necesario añadir un diccionario propio.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero los modelos originales de PaddleOCR también están bajo Apache 2.0, por lo que no hay restricciones adicionales. No obstante, se recomienda revisar los términos de PaddleOCR.
- **No es un modelo generativo**: no sirve para generar texto ni conversación; su única función es el procesamiento de imágenes para extraer texto.
- **Tamaño del repositorio**: 1,7 GB, que puede ser elevado si solo se necesita un modelo concreto; se puede descargar solo los archivos necesarios.

## Enlaces

- [Hugging Face](https://huggingface.co/snowfluke/ppu-paddle-ocr-models)
- [GitHub - modelos](https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models)
- [GitHub - librería ppu-paddle-ocr](https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr)
- [JSR - ppu-paddle-ocr](https://jsr.io/@snowfluke/ppu-paddle-ocr)
- [Demo interactiva en navegador](https://ppu-paddle-ocr.snowfluke.workers.dev/)
- [Página oficial de PaddleOCR](https://www.paddleocr.ai/main/en/index.html)

No se han localizado papers académicos específicos para estos modelos convertidos; la documentación se basa en el repositorio y la documentación de PaddleOCR.
