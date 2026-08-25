# Lucie666/ppocrv6-tiny-burnpack

## Resumen

`Lucie666/ppocrv6-tiny-burnpack` es una conversión mecánica de formato, no un modelo original. Contiene los pesos de los modelos `PaddlePaddle/PP-OCRv6_tiny_det_onnx` (detector de texto) y `PaddlePaddle/PP-OCRv6_tiny_rec_onnx` (reconocedor de texto), re-serializados al formato `burnpack` de la librería Burn para permitir inferencia en Rust puro, sin Python, PaddlePaddle ni ONNX Runtime. El autor de la conversión es Lucie666, y los modelos base pertenecen al equipo PaddleOCR de Baidu (PP-OCRv6, 2026).

El modelo completo ocupa unos 6 MB (1,66 MiB el detector y 4,24 MiB el reconocedor) y está pensado para OCR embebido en aplicaciones Rust, especialmente dentro del proyecto rag3weaver. Es la variante *tiny* de la familia PP-OCRv6, que abarca de 1,5 a 34,5 millones de parámetros en tres niveles. Soporta 49 idiomas (excluye japonés) con un único diccionario de 6.904 caracteres, incluyendo latín con acentos y CJK.

La relevancia actual de este paquete radica en que permite ejecutar OCR completo en Rust puro, sin dependencias de Python, con un peso total inferior a 6 MB, lo que lo hace apto para dispositivos con recursos limitados y para pipelines de datos que ya usan Burn.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DBNet (backbone PPLCNetV4, neck RepLKFPN) + Reconocedor CTC (PPLCNetV4) |
| Parametros totales | Familia PP-OCRv6: 1,5M–34,5M; variante tiny no especificada en la información |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada imagen, salida texto) |
| Tipos de cuantizacion | Sin cuantizar, pesos f32 originales |
| Idiomas soportados | 49 idiomas (chino simplificado, chino tradicional, inglés y 46 lenguas latinas; excluye japonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Burnpack (`det.bpk`, `rec.bpk`); también disponibles los ONNX originales |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado: es una conversión mecánica de los pesos originales de PP-OCRv6 tiny. El detector es una red DBNet (Differentiable Binarization) con backbone PPLCNetV4 y neck RepLKFPN, que produce mapas de probabilidad y bounding boxes. El reconocedor usa una red PPLCNetV4 con una capa de clasificación CTC sobre un diccionario de 6.904 caracteres. No se realizó ningún entrenamiento, fine-tuning, destilación ni cuantización adicional; los pesos son los f32 originales.

El proceso de conversión requirió un parche menor en el detector: tres nodos (`auto_pad = SAME_UPPER`) fueron reescritos como `pads = [0, 0, 1, 1]` para que `burn-onnx 0.22.0-pre.1` los aceptara con dimensiones dinámicas. El reconocedor no necesitó cambios. El archivo `dict.txt` es una copia literal del diccionario del `inference.yml` original. No se dispone de datos sobre el corpus de entrenamiento ni el procedimiento de optimización (RLHF, DPO, etc.) en esta información, aunque el paper de PP-OCRv6 (arXiv:2606.13108) describe la familia completa.

## Capacidades

- Detección de texto en imágenes (bounding boxes por línea de texto).
- Reconocimiento de texto (OCR) con salida de texto plano y confianza.
- Soporte multilingüe: 49 idiomas con un único modelo, incluidos chino simplificado y tradicional, inglés y 46 idiomas latinos (no japonés).
- Salida estructurada: líneas de texto con cajas delimitadoras y confianza, adecuada para integración en pipelines de extracción.
- No incluye tool calling, razonamiento multi-paso, generación de lenguaje natural ni capacidades de visión más allá de OCR.
- No requiere tokenizador: el diccionario es un archivo plano (`dict.txt`).

## Casos de uso

- OCR embebido en aplicaciones Rust: integrable directamente en un binario Rust con el stack Burn/wgpu, sin necesidad de Python ni servicios externos.
- Digitalización de documentos multilingües: procesa facturas, recibos o formularios que mezclan chino e inglés, gracias a su soporte de 49 idiomas.
- Extracción de texto para RAG (retrieval augmented generation): convierte imágenes de documentos en texto que puede indexarse en un sistema de recuperación, como hace rag3weaver.
- OCR en dispositivos con recursos limitados: el tamaño total de 6 MB permite ejecutarlo en dispositivos de borde o en entornos con poca memoria.
- Automatización de procesos de negocio: extracción de datos de documentos escaneados en flujos de trabajo sin intervención humana.
- Sustitución de PaddleOCR en entornos Rust: evita la dependencia de Python y ONNX Runtime, reduciendo el peso de despliegue y la complejidad operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante tiny en la información disponible. El paper de PP-OCRv6 (arXiv:2606.13108) reporta para el nivel medio de la familia un H-mean de detección de 86,2 % y una precisión de reconocimiento de 83,2 %, pero estos datos no corresponden al modelo tiny ni a esta conversión. No se dispone de mediciones de latencia o throughput en esta información.

## Requisitos de hardware

- Tamaño total de los pesos: 6,17 MB (1,66 MiB detector + 4,24 MiB reconocedor), lo que permite ejecución en CPU sin necesidad de GPU.
- VRAM estimada: no aplica para CPU; si se usa GPU, la huella de memoria es mínima (menos de 1 GB).
- GPU recomendadas: no se requieren; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier modelo con soporte wgpu (incluidas integradas) funciona.
- Despliegue: biblioteca Burn con backend wgpu (CPU o GPU). No compatible con vLLM, llama.cpp ni Ollama, al ser un modelo de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| Lucie666/ppocrv6-tiny-burnpack | ~6 MB (tiny) | Burnpack | 49 | Apache-2.0 | OCR embebido en Rust |
| PaddlePaddle/PP-OCRv6_tiny_det_onnx | ~1,7 MB | ONNX | 49 | Apache-2.0 | OCR en Python/ONNX Runtime |
| PaddlePaddle/PP-OCRv6_tiny_rec_onnx | ~4,4 MB | ONNX | 49 | Apache-2.0 | OCR en Python/ONNX Runtime |
| Tesseract (v5) | ~15 MB (por idioma) | LSTM | 100+ | Apache-2.0 | OCR generalista, no embebido en Rust |

La conversión no modifica los pesos ni el rendimiento respecto a los modelos ONNX originales. La ventaja principal es la integración nativa en Rust; la limitación es que requiere el ecosistema Burn y no ofrece API de alto nivel como PaddleOCR.

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversión de formato; cualquier limitación de PP-OCRv6 tiny se hereda sin cambios.
- No incluye japonés: el soporte multilingüe es de 49 idiomas, excluyendo el japonés que sí aparece en los niveles medium y small.
- Riesgo de alucinación: no aplica al ser un sistema de OCR puro, pero puede fallar en textos con tipografías poco comunes o degradadas.
- Licencia: Apache-2.0, permite uso comercial con atribución; el modelo original es de Baidu (PaddleOCR).
- La serialización burnpack no es byte-determinista: dos conversiones del mismo ONNX producen archivos de distinto contenido (mismo tamaño, valores idénticos). Los checksums del repositorio verifican la descarga, no una reproducción.
- No se ha validado en producción: el repositorio no incluye benchmarks de precisión para esta variante.
- Requiere la librería Burn en versión compatible (0.22.0-pre.2) para cargar los pesos.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Lucie666/ppocrv6-tiny-burnpack)
- [PaddlePaddle/PP-OCRv6_tiny_det_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx)
- [PaddlePaddle/PP-OCRv6_tiny_rec_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx)
- [Colección PP-OCRv6 en Hugging Face](https://huggingface.co/collections/PaddlePaddle/pp-ocrv6)
- [Paper arXiv:2606.13108](https://arxiv.org/pdf/2606.13108)
- [Documentación de PaddleOCR para PP-OCRv6](https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html)
- [Proyecto rag3weaver](https://github.com/L-Defraiteur/rag3db)
- [Burn (librería)](https://burn.dev)
