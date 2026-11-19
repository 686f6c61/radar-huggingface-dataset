# KanaSSN/AksonOCR-Lite-web-fp16

## Resumen

AksonOCR-Lite-web-fp16 es una conversión a precisión de 16 bits (fp16) de los modelos ONNX del pipeline de OCR AksonOCR-Lite, desarrollado originalmente por Teetouch Jaknamon (Remtir). Esta copia, publicada por KanaSSN, no modifica la arquitectura ni los pesos más allá del formato numérico: su objetivo es permitir que el pipeline completo se ejecute dentro de un navegador web mediante ONNX Runtime Web, reduciendo aproximadamente a la mitad el tamaño de los ficheros para facilitar su descarga y ejecución en el dispositivo del usuario.

El modelo resuelve OCR de documentos tailandeses e ingleses, incluyendo detección de texto, reconocimiento de clústeres de grafemas tailandeses, orientación de página y de línea, análisis de layout con orden de lectura y reconocimiento de estructura de tablas. Es relevante porque demuestra que un pipeline OCR multi-componente puede ejecutarse íntegramente en cliente (sin enviar documentos a un servidor), algo poco habitual en OCR tailandés, un idioma con escritura sin espacios y con reglas de composición de grafemas que complican el reconocimiento.

El repositorio ocupa 0,2 GB y contiene seis modelos ONNX más el charset de reconocimiento. No incluye los modelos de dewarping (corrección de curvatura) del pipeline original. La licencia es Apache 2.0, heredada del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente ONNX: PP-OCRv6_medium_det (detección), AksonOCR Thai grapheme-cluster recognizer (reconocimiento), PP-LCNet (orientación de página y línea), PP-DocLayoutV3 (layout y orden de lectura), Table Transformer v1.1-all (estructura de tablas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (esta versión); fp32 (original); int8 dinámico probado y descartado por el autor |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (tatr.onnx deriva de Table Transformer de Microsoft, MIT) |
| Formato de pesos | ONNX (fp16, con entradas y salidas en fp32) |

## Arquitectura y entrenamiento

El pipeline es una composición de modelos especializados en lugar de un único modelo extremo a extremo. La detección de texto usa PP-OCRv6_medium_det; el reconocimiento emplea un modelo específico de clústeres de grafemas tailandeses de AksonOCR; la orientación de página y de línea se resuelve con dos modelos PP-LCNet; el análisis de layout y orden de lectura usa PP-DocLayoutV3; y la estructura de tablas se extrae con Table Transformer v1.1-all. Los modelos de dewarping del pipeline original no están incluidos en esta conversión.

La conversión a fp16 se realizó con `onnxconverter_common.float16` para `det.onnx`, `rec.onnx`, `doc_ori.onnx` y `textline_ori.onnx`, y con el conversor de transformers de ONNX Runtime para `layout.onnx` y `tatr.onnx`, manteniendo en 32 bits operadores sensibles como `Cast`, `Resize`, `TopK`, `NonMaxSuppression`, `Range`, `Gather`, `GatherElements` y `ArgMax`. Las entradas y salidas permanecen en fp32, por lo que los ficheros son sustituibles directamente por los originales. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF/DPO (no aplicable a un pipeline OCR).

## Capacidades

- Detección de regiones de texto en imágenes de documentos.
- Reconocimiento de texto tailandés a nivel de clúster de grafemas, adecuado para una escritura sin separadores de palabra.
- Reconocimiento de texto en inglés.
- Clasificación de orientación de página completa y de líneas de texto individuales.
- Análisis de layout de documento con orden de lectura (bloques, columnas).
- Extracción de estructura de tablas, incluidas tablas con celdas combinadas.
- Generación de salida en Markdown y en texto plano a partir de documentos.
- Ejecución en navegador mediante ONNX Runtime Web, sin backend servidor.
- Procesamiento local en el dispositivo del usuario (privacidad por diseño).

## Casos de uso

- Digitalización de documentos tailandeses en el navegador: una aplicación web puede cargar un PDF o imagen y obtener texto y Markdown sin enviar el documento a ningún servidor, usando los seis modelos ONNX con ONNX Runtime Web.
- Extracción de datos de facturas y recibos: el pipeline detecta texto, reconoce importes y descripciones en tailandés e inglés y preserva el layout, lo que permite mapear campos a un esquema estructurado.
- Procesamiento de tablas con celdas combinadas: Table Transformer v1.1-all permite reconstruir tablas complejas en Markdown, útil para digitalizar informes financieros o administrativos tailandeses.
- Corrección de orientación en escaneos: los modelos PP-LCNet de orientación de página y de línea permiten rotar automáticamente documentos escaneados torcidos o girados antes del reconocimiento.
- Orden de lectura en documentos a dos columnas: PP-DocLayoutV3 permite reconstruir el flujo de lectura correcto en artículos, periódicos o informes con varias columnas.
- Aplicación OCR gratuita sin infraestructura: FreeThaiOCR usa esta conversión para ofrecer OCR local en el navegador, eliminando costes de servidor y riesgos de privacidad en el tratamiento de documentos sensibles.
- Integración en herramientas de accesibilidad: conversión de documentos escaneados a texto seleccionable y Markdown en el propio cliente para su lectura por lectores de pantalla.

## Benchmarks y rendimiento

El autor de la conversión reporta una comparación de fidelidad entre los pesos originales y los fp16 sobre 14 páginas de prueba (documentos tailandeses e ingleses, páginas a dos columnas, recibos, tres tablas con celdas combinadas y páginas rotadas o inclinadas), medida en ONNX Runtime 1.31/1.32 sobre CPU:

| Metrica | Resultado |
|---|---|
| Diferencia media en caracteres del Markdown de salida | 0,01 % |
| Diferencia máxima en una página | 0,09 % |
| Naturaleza de las diferencias | espacios duplicados o dos líneas intercambiadas en el campo de texto plano |
| Bloques de layout, rotaciones y tablas | idénticos |
| Cuantización int8 dinámica | descartada: rompe el detector y el modelo de layout y pierde celdas combinadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otras métricas OCR como CER/WER sobre datasets públicos) en la información disponible.

## Requisitos de hardware

- Tamaño total del repositorio: 0,2 GB, con ficheros individuales de 2,3 MB (`rec.onnx`) a 65,5 MB (`layout.onnx`).
- Al ser modelos ONNX ejecutables en navegador, no requieren GPU dedicada: pueden ejecutarse en CPU mediante ONNX Runtime Web (WASM) o con aceleración WebGPU si el navegador la soporta.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los ficheros (máximo 65,5 MB por modelo), la huella de memoria es reducida y compatible con equipos de consumo.
- GPU recomendadas: no aplica de forma específica; cualquier GPU integrada o dedicada con soporte WebGPU puede acelerar la inferencia en navegador.
- Despliegue: ONNX Runtime Web (WASM/WebGPU) para navegador; ONNX Runtime para Python/C++ en servidor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AksonOCR-Lite-web-fp16 | Pipeline OCR ONNX fp16 | th, en | Imágenes de documento | Apache 2.0 | Hugging Face |
| AksonOCR-Lite (original) | Pipeline OCR ONNX fp32 | th, en | Imágenes de documento | Apache 2.0 | Hugging Face |
| PaddleOCR (PP-OCRv6) | Pipeline OCR | Multilingüe | Imágenes de documento | Apache 2.0 | GitHub / Hugging Face |
| Tesseract OCR | Motor OCR clásico | Multilingüe | Imágenes de documento | Apache 2.0 | GitHub |

No se dispone de datos de rendimiento comparativo (CER/WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta tailandés e inglés; otros idiomas no están cubiertos por el reconocedor.
- No incluye los modelos de dewarping del pipeline original, por lo que documentos con curvatura acusada (libros escaneados, páginas deformadas) pueden degradarse.
- La cuantización int8 dinámica no es viable con estos modelos según las pruebas del autor: rompe el detector y el layout y pierde celdas combinadas.
- El reconocimiento de tailandés depende del charset `rec_charset.json` incluido; modificarlo requiere revalidar el pipeline.
- Riesgo de errores en tablas muy complejas o en documentos con layout atípico; el autor solo valida tres tablas con celdas combinadas en su conjunto de prueba.
- La licencia Apache 2.0 permite uso comercial, pero `tatr.onnx` deriva de Table Transformer (MIT) y las atribuciones del fichero `NOTICE` deben conservarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Al ejecutarse en navegador, el rendimiento depende del dispositivo del usuario y del soporte de WebGPU; en equipos modestos la latencia puede ser alta.

## Enlaces

- Hugging Face: https://huggingface.co/KanaSSN/AksonOCR-Lite-web-fp16
- Modelo original: https://huggingface.co/Remtir/AksonOCR-Lite
- Repositorio original: https://github.com/Remtir/AksonOCR-Lite
- Aplicación FreeThaiOCR: https://github.com/KananatSSN/FreeThaiOCR
- ONNX Runtime Web: https://onnxruntime.ai
