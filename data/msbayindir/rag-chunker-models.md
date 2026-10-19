# msbayindir/rag-chunker-models

## Resumen

`msbayindir/rag-chunker-models` no es un modelo generativo, sino un repositorio espejo de cuatro modelos ONNX (más dos ficheros de diccionario) que la herramienta de línea de comandos [rag-chunker](https://github.com/msbayindir/rag-chunker) descarga en el primer uso para hacer análisis de layout de página, OCR y reconocimiento de estructura de tablas en local. Los pesos son exportaciones sin modificar de modelos de PaddleOCR / PP-StructureV3 publicados bajo Apache-2.0 por el equipo de PaddlePaddle; este repositorio solo los aloja en una dirección estable con sus sumas de verificación sha256, de modo que la herramienta siga funcionando aunque los espejos originales desaparezcan o cambien.

El conjunto cubre tres etapas de un pipeline documental: detección de layout con `PP-DocLayoutV3.onnx` (25 clases de bloque con orden de lectura, 123,9 MB), detección y reconocimiento de texto con `PP-OCRv5_mobile_det_infer.onnx` (DBNet móvil, 4,5 MB) y `latin_PP-OCRv5_mobile_rec_infer.onnx` (reconocimiento de escrituras latinas, 7,7 MB), y estructura de tablas con `SLANet_plus.onnx` (7,4 MB). En total, unos 143,5 MB de pesos dentro de un repositorio de 0,2 GB.

Su relevancia es de infraestructura más que de investigación: fija versiones y checksums para un pipeline PDF-a-RAG reproducible y ejecutable sin conexión, algo crítico cuando se procesan documentos sensibles o cuando se quiere evitar que una actualización silenciosa en un espejo de terceros rompa la extracción. No hay tarjeta de modelo con detalles de entrenamiento, benchmarks ni parámetros: la información disponible describe los ficheros, su procedencia y cómo cargarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto de modelos ONNX independientes: detector de layout PP-DocLayoutV3; detector de texto DBNet (PP-OCRv5 mobile); reconocedor de texto PP-OCRv5 mobile latin; SLANet_plus para estructura de tablas |
| Parámetros totales | no disponible (no se publica el número de parámetros de ninguno de los componentes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos perceptivos de documento, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (se distribuyen exportaciones ONNX; no se documenta si son fp32, fp16 o int8) |
| Idiomas soportados | Escrituras latinas en el reconocedor: turco, inglés, alemán, francés, español, entre otras; el detector y el modelo de layout son independientes del idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutables con onnxruntime) + diccionarios `.txt` |
| Componentes | `PP-DocLayoutV3.onnx` (123,9 MB), `PP-OCRv5_mobile_det_infer.onnx` (4,5 MB), `latin_PP-OCRv5_mobile_rec_infer.onnx` (7,7 MB), `SLANet_plus.onnx` (7,4 MB), `ppocrv5_latin_dict.txt`, `table_structure_dict_ch.txt` |
| Tamaño total de pesos | ~143,5 MB (repositorio: 0,2 GB) |
| Integridad | Verificación sha256 de cada descarga contra el catálogo en `src/local/models.ts` del proyecto |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrupa exportaciones ONNX de modelos ya entrenados por PaddlePaddle. `PP-DocLayoutV3` resuelve el análisis de layout de página en 25 clases de bloque e incorpora orden de lectura, lo que permite reconstruir la secuencia lógica de un documento con columnas, figuras o tablas. `PP-OCRv5_mobile_det_infer` es un detector de texto basado en DBNet en variante móvil, y `latin_PP-OCRv5_mobile_rec_infer` es el reconocedor asociado para alfabeto latino, que consume `ppocrv5_latin_dict.txt` como tabla de caracteres. `SLANet_plus` predice filas, columnas, celdas combinadas y cajas de celda a partir de la imagen de una tabla, usando `table_structure_dict_ch.txt` como vocabulario de tokens de estructura.

No se dispone de información sobre el número de tokens de entrenamiento, la composición de los datasets, el backbone exacto de cada red ni si hubo etapas de ajuste fino con preferencias humanas; la model card se limita a indicar procedencia, tamaño y checksum. La única innovación destacable documentada es operativa: el proyecto fija los artefactos con sha256 y aplica un preprocesado y postprocesado propios (tamaños de entrada, normalización, diccionarios y decodificación) implementados en `src/local/layout.ts`, `src/local/ocr.ts` y `src/local/table.ts`. La card advierte que las exportaciones son obra de un tercero (el repositorio `ppu-paddle-ocr-models`) y que este espejo "no añade nada propio".

## Capacidades

- Detección de layout de página con 25 clases de bloque y orden de lectura, lo que permite segmentar documentos complejos antes de trocearlos.
- Detección de regiones de texto mediante DBNet en variante móvil, pensada para ejecución ligera.
- Reconocimiento de texto en escrituras latinas (turco, inglés, alemán, francés, español y otras) con el modelo `PP-OCRv5 mobile`.
- Reconocimiento de estructura de tablas: filas, columnas, celdas combinadas y cajas de celda a partir de una imagen de tabla.
- Ejecución completamente local y offline una vez descargados los ficheros en `~/.rag-chunker/models` (configurable con `RAG_CHUNKER_MODELS_DIR`).
- Integración lista para pipelines RAG mediante la CLI `npx @msbayindir/rag-chunker process paper.pdf --layout --ocr pp-ocr`.
- Uso directo de los ficheros con onnxruntime, replicando el pre/postprocesado del proyecto.
- No incluye generación de texto, razonamiento, código, tool calling, capacidades de agente, audio ni visión general; es un conjunto perceptivo de documento.

## Casos de uso

- Troceado consciente del layout para RAG: ejecutar `--layout` antes de dividir un PDF permite cortar por bloques lógicos y respetar el orden de lectura, lo que reduce chunks que mezclan columnas o pies de figura y mejora la precisión del retrieval.
- Extracción de tablas a Markdown o CSV: `SLANet_plus` devuelve filas, columnas, celdas combinadas y cajas, de modo que se puede reconstruir la tabla y adjuntarla como chunk estructurado en lugar de texto plano desalineado.
- Digitalización de facturas, albaranes y estados financieros: la combinación de OCR latino y estructura de tablas cubre los dos elementos dominantes de un documento administrativo, con la ventaja de que todo el procesado ocurre en la máquina del usuario.
- Procesamiento de documentación sensible sin salida a la red: al descargar los pesos una sola vez y verificar su sha256, el pipeline puede ejecutarse en entornos air-gapped o con requisitos de confidencialidad estrictos.
- Indexación masiva de papers y documentación técnica: el modelo de layout móvil y los detectores de 4,5 MB permiten procesar lotes en CPU sin depender de GPU, lo que abarata el backfill de una base documental.
- Archivística y preservación digital: la detección de 25 clases de bloque sirve para generar metadatos estructurales (figuras, tablas, encabezados) sobre fondos escaneados antes de almacenarlos.
- Preprocesado para asistentes sobre base documental: convertir manuales y normativas a texto con orden de lectura correcto es el paso previo a alimentar un LLM; según las discusiones del proyecto, rag-chunker combina esta extracción con un chunker AST determinista.
- Reproducibilidad en CI: al fijar checksums, un pipeline de evaluación puede reconstruir exactamente la misma extracción en cada ejecución, algo útil para comparar estrategias de chunking sin que cambien los pesos por debajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión de layout, CER/WER de OCR ni exactitud de reconocimiento de tablas, y tampoco se aportan latencias o throughput.

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia de orden de magnitud, el conjunto completo de pesos ocupa ~143,5 MB, por lo que la huella en memoria es de unos pocos cientos de megabytes en fp32; la VRAM real dependerá del execution provider y del tamaño de lote (no verificado).
- GPU recomendadas: no se documenta ninguna. Por tamaño, cualquier GPU consumer con 4 GB o más debería alojar el conjunto con holgura si se usa un execution provider CUDA; no hay datos de rendimiento que lo confirmen.
- CPU: es el escenario natural del proyecto (CLI Node.js, modelos "mobile"), viable en portátiles convencionales; no se publican tiempos por página.
- Despliegue: onnxruntime como runtime principal; los ficheros pueden cargarse con cualquier execution provider compatible (CPU, CUDA, DirectML, CoreML) siempre que los operadores estén soportados, algo no verificado en esta información. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Almacenamiento: ~143,5 MB de pesos en `~/.rag-chunker/models`, dentro de un repositorio de 0,2 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / conjunto | Tipo | Componentes | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rag-chunker-models (este repo) | Espejo ONNX de layout + OCR + tablas | 4 modelos, ~143,5 MB | Latinas (OCR) | Apache-2.0 | ONNX | Checksums fijados; pensado para la CLI rag-chunker |
| PaddleOCR / PP-StructureV3 (origen) | Pipeline completo original | Layout, detección, reconocimiento, tablas, más variantes | Muchos, con reconocedores por script | Apache-2.0 | Paddle inference + exportaciones ONNX | Fuente de estos pesos; incluye entrenamiento y herramientas de conversión |
| Tesseract | OCR clásico | Motor LSTM por idioma | Muy amplio | Apache-2.0 | Pesos propios (no ONNX) | No ofrece análisis de layout con orden de lectura ni estructura de tablas equivalente |
| Docling / MinerU y similares | Pipelines documentales | Variables | Variables | no disponible en esta búsqueda | no disponible | No verificados en la información proporcionada; la comparación de parámetros y contexto no aplica a modelos perceptivos |

La comparación en términos de parámetros y longitud de contexto no es significativa aquí: ninguno de los componentes es un modelo de lenguaje y no se publican recuentos de parámetros.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- El reconocedor incluido cubre solo escrituras latinas; documentos en cirílico, árabe, CJK u otras escrituras requieren los reconocedores correspondientes de PaddleOCR, que no están en este repositorio.
- `SLANet_plus` procede de PP-StructureV2 según la propia tabla de la card, mientras que el resto se enmarca en PP-StructureV3; conviene validar la calidad en tablas complejas antes de confiar en la extracción automática.
- No se publican métricas de precisión: el riesgo de errores de OCR (especialmente en escaneos de baja calidad, sellos o caligrafía) y de detección de layout en maquetaciones atípicas no está cuantificado.
- Los ficheros son exportaciones de un tercero (`ppu-paddle-ocr-models`), no del equipo de PaddlePaddle; el espejo no añade garantías más allá de la coincidencia de sha256 con su propio catálogo, que no equivale a una verificación criptográfica contra el origen.
- El repositorio tiene 0 descargas y 0 likes y se creó en octubre de 2026: no hay evidencia de uso en producción ni historial de mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` y atribuir a PaddlePaddle/PaddleOCR; el cumplimiento recae en quien redistribuya.
- Dependencia de la CLI y del pre/postprocesado del proyecto: usar los ONNX directamente exige replicar tamaños de entrada, normalización y decodificación desde `src/local/*.ts`, y un desajuste produce salidas silenciosamente incorrectas.
- No se documenta el soporte de execution providers ni el comportamiento en GPU; asumir aceleración hardware sin pruebas puede dar lugar a caídas por operadores no soportados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/msbayindir/rag-chunker-models
- Proyecto rag-chunker (GitHub): https://github.com/msbayindir/rag-chunker
- Discusión de bienvenida del proyecto: https://github.com/msbayindir/rag-chunker/discussions/1
- Origen de las exportaciones ONNX (layout): https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/layout
- Origen de las exportaciones ONNX (detección): https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/detection
- Origen de las exportaciones ONNX (reconocimiento latino): https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/recognition/multi/latin/v5
- Origen de las exportaciones ONNX (tablas): https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/table
- Diccionario de estructura de tablas (PaddleOCR): https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/main/ppocr/utils/dict/table_structure_dict_ch.txt
- PaddleOCR (proyecto original): https://github.com/PaddlePaddle/PaddleOCR
