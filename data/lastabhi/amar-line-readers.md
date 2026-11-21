# lastabhi/amar-line-readers

## Resumen

Amar line readers es un paquete de modelos OCR para dispositivos móviles publicado por el desarrollador lastabhi dentro del proyecto Amar Vault, una aplicación Android de lectura de texto. No es un modelo único, sino una colección de cinco componentes (un detector de líneas y cuatro reconocedores) empaquetados en un directorio de 36,5 MB con formato ONNX y TFLite. El objetivo es leer texto de capturas de pantalla y páginas escaneadas línea a línea, íntegramente en el teléfono, sin enviar imágenes a ningún servidor.

El paquete se apoya en modelos de la familia PaddleOCR: `PP-OCRv6_tiny_det_onnx` como detector, `PP-OCRv6_tiny_rec_onnx` como reconocedor general, `en_PP-OCRv5_mobile_rec_onnx` para líneas con números y `devanagari_PP-OCRv5_mobile_rec_onnx` para hindi. Los archivos ONNX son los originales de PaddlePaddle; los `.tflite` fueron convertidos por el proyecto Amar Vault con tamaños de entrada fijos y operaciones reescritas para ejecutarse en la GPU del teléfono.

Su relevancia es práctica: ofrece un pipeline OCR completo y muy ligero (el detector pesa 1,8 MB en ONNX y 2,0 MB en TFLite) con licencia Apache 2.0, pensado para inferencia on-device en Android. La aplicación compara este lector con su lector integrado en cada dispositivo y conserva el más rápido sin perder palabras, de modo que la descarga es opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector de líneas (PP-OCRv6 tiny det) y reconocedores CTC (PP-OCRv6 tiny rec, PP-OCRv5 mobile rec) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelos de visión, entrada por imagen; el detector TFLite admite cinco tamaños fijos y el reconocedor TFLite tres anchos fijos) |
| Tipos de cuantizacion | no disponible (los archivos distribuidos son ONNX y TFLite; no se detalla si están cuantizados) |
| Idiomas soportados | en, hi (el reconocedor general v6 cubre el conjunto de caracteres de PP-OCRv6 tiny; el lector específico cubre devanagari) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX y TFLite (LiteRT) |

## Arquitectura y entrenamiento

El paquete sigue la arquitectura clásica de PaddleOCR en dos fases. Primero, un detector localiza cada línea de texto en la imagen y la recorta; después, un reconocedor independiente transcribe cada recorte. El detector es `PP-OCRv6_tiny_det_onnx` (1,8 MB en ONNX, 2,0 MB en TFLite), una red de detección de texto de la familia PP-OCRv6 en variante tiny. Los reconocedores son modelos CTC de la familia PP-OCRv5/v6 en variante mobile: `v6-tiny-rec` (4,5 MB) para texto general, `v5-en-rec` (7,8 MB) para líneas que contienen números y `v5-devanagari-rec` (7,9 MB) para hindi. Cada reconocedor va acompañado de un archivo `.txt` con su lista de caracteres (27 KB, 1,4 KB y 1,9 KB respectivamente).

No se dispone de información sobre el número de tokens, la composición del dataset ni si hubo ajuste por RLHF o DPO; esos detalles corresponden a los modelos upstream de PaddlePaddle y no se documentan en esta model card. La innovación técnica del paquete es la conversión a TFLite: los archivos `.tflite` se generaron a partir de los ONNX con tamaños de entrada fijos (el detector agrupa cinco tamaños en un solo archivo; el reconocedor, tres anchos) y operaciones reescritas para que la GPU del teléfono pueda ejecutarlas, fusionando varios tamaños en un único archivo por modelo. La distribución incluye `files.json` con nombre, tamaño y SHA-256 de cada archivo para verificar la descarga, y `manifest.json` con el identificador del paquete, la versión, el rol de cada archivo y los tamaños de entrada.

## Capacidades

- Detección de líneas de texto en imágenes: el detector marca cada línea de una captura de pantalla o página escaneada antes de la transcripción.
- Reconocimiento de texto general en inglés mediante el lector v6 tiny.
- Reconocimiento especializado de líneas con números mediante el lector `v5-en-rec`, pensado para tablas, importes y datos numéricos.
- Reconocimiento de hindi en escritura devanagari mediante el lector `v5-devanagari-rec`.
- Ejecución on-device: inferencia íntegra en el teléfono, sin llamadas a servicios externos.
- Aceleración por GPU móvil: variantes TFLite con tamaños de entrada fijos para ejecución en la GPU del dispositivo, además de las variantes ONNX para CPU.
- Selección adaptativa en la app: el lector se compara con el lector integrado de Amar Vault en cada teléfono y se conserva el más rápido sin pérdida de palabras.
- Descarga opcional y verificable: `files.json` permite comprobar tamaño y SHA-256 de cada archivo, y las peticiones HTTP Range permiten reanudar descargas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modalities de audio o vídeo; es exclusivamente un pipeline OCR.

## Casos de uso

- Digitalización de capturas de pantalla en Android: la app recibe una captura y el detector marca las líneas; cada recorte se pasa al lector v6 tiny para obtener texto seleccionable y buscable, todo en el dispositivo.
- Extracción de datos de facturas y recibos: las líneas con importes y cifras se enrutan al lector `v5-en-rec`, especializado en líneas con números, lo que reduce errores en campos numéricos.
- Procesamiento de documentos en hindi: el lector `v5-devanagari-rec` transcribe páginas escaneadas en devanagari sin salir del teléfono, útil en contextos de privacidad estricta.
- Accesibilidad: lectura en voz alta de texto presente en imágenes para usuarios con discapacidad visual, con latencia baja al ejecutarse localmente y sin depender de conectividad.
- Archivado offline de documentos: escaneo y OCR de páginas en entornos sin red (campo, aviones, zonas con cobertura limitada), ya que el paquete completo pesa 36,5 MB y no requiere servidor.
- Integración en aplicaciones Android de terceros: los archivos TFLite con tamaños de entrada fijos permiten incorporar el pipeline a apps LiteRT/TFLite con aceleración GPU, eligiendo entre las cinco resoluciones del detector y los tres anchos del reconocedor.
- Verificación de integridad en pipelines de distribución: `files.json` con SHA-256 permite validar cada descarga antes de cargar los modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los modelos son de tamaño reducido (1,8 a 8,0 MB por archivo) y están pensados para memoria unificada de teléfonos, no para GPUs de escritorio.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el destino es la GPU integrada de teléfonos Android mediante TFLite/LiteRT. Las variantes ONNX están etiquetadas para CPU.
- ¿Cabe en GPU consumer? Sí, por tamaño (el paquete completo son 36,5 MB), aunque no hay datos publicados de ejecución en GPUs de escritorio como RTX 4090, A100 o H100.
- Opciones de despliegue: ONNX Runtime (archivos `.onnx`), TensorFlow Lite / LiteRT (archivos `.tflite`) y la app Android Amar Vault. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline OCR de este tipo.
- Latencia y throughput: no disponibles. La model card indica únicamente que la app compara este lector con su lector integrado en cada teléfono y conserva el más rápido sin perder palabras, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formatos | Licencia | Tamaño |
|---|---|---|---|---|---|
| Amar line readers (este paquete) | Detector + reconocedores OCR | en, hi | ONNX, TFLite | Apache 2.0 | 36,5 MB (paquete) |
| PaddlePaddle/PP-OCRv6_tiny_det_onnx | Detector de líneas | no disponible | ONNX | no disponible en la informacion | 1,8 MB (según esta model card) |
| PaddlePaddle/PP-OCRv6_tiny_rec_onnx | Reconocedor OCR | no disponible | ONNX | no disponible en la informacion | 4,5 MB (según esta model card) |
| PaddlePaddle/en_PP-OCRv5_mobile_rec_onnx | Reconocedor OCR | en | ONNX | no disponible en la informacion | 7,8 MB (según esta model card) |

Los modelos comparables son los upstream de PaddlePaddle listados como `base_model`; no se dispone de datos de rendimiento comparativo entre ellos ni con alternativas de otros proveedores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser modelos OCR, pueden heredar sesgos de los datasets de entrenamiento de PaddleOCR en cuanto a tipografías, calidades de imagen y variantes de escritura.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero un reconocedor CTC puede producir transcripciones incorrectas en imágenes de baja calidad, líneas rotadas o fuentes poco habituales.
- Limitaciones de idioma: solo se declaran en e hi; otras lenguas no están cubiertas por los lectores incluidos.
- Limitaciones de entrada: las variantes TFLite usan tamaños de entrada fijos (cinco resoluciones en el detector, tres anchos en el reconocedor), lo que puede requerir redimensionado y afectar a la precisión en imágenes con relaciones de aspecto atípicas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los archivos `.tflite` fueron convertidos por el proyecto Amar Vault y se distribuyen sin garantía ("no warranty"); conviene revisar los términos de los modelos upstream.
- Caveat de producción: el paquete depende de que todos los archivos se descarguen juntos y se verifiquen con `files.json`; un archivo corrupto o ausente rompe el pipeline. La app trata la descarga como opcional y la compara con su lector integrado, lo que sugiere que el rendimiento puede variar según el dispositivo.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (21 de noviembre de 2026), por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lastabhi/amar-line-readers
- Descarga del manifiesto de archivos: https://huggingface.co/lastabhi/amar-line-readers/resolve/main/ppocr-v6-tiny-finder-v5-readers/files.json
- Modelo base detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- Modelo base reconocedor general: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx
- Modelo base reconocedor inglés: https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec_onnx
- Modelo base reconocedor devanagari: https://huggingface.co/PaddlePaddle/devanagari_PP-OCRv5_mobile_rec_onnx
