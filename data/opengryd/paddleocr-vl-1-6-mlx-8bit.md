# OpenGryd/PaddleOCR-VL-1.6-MLX-8bit

## Resumen

PaddleOCR-VL-1.6-MLX-8bit es una cuantización en 8 bits del modelo PaddleOCR-VL-1.6, un modelo de visión-lenguaje (VLM) de 0,9B parámetros desarrollado por el equipo de PaddlePaddle para el análisis y parsing de documentos. Esta conversión, realizada por OpenGryd, adapta los pesos al formato MLX para ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx-vlm`, lo que permite desplegar OCR de página completa, reconocimiento de tablas, fórmulas y gráficos en local, sin necesidad de GPU dedicada ni conexión a la nube.

El modelo base, PaddleOCR-VL-1.6, está construido sobre la arquitectura ERNIE-4.5 y alcanza un 96,3% en el benchmark OmniDocBench v1.6, posicionándose como líder en reconocimiento de texto, fórmulas y tablas. La versión MLX 8-bit mantiene las mismas capacidades funcionales, con una ligera pérdida de precisión debida a la cuantización, y ocupa aproximadamente 1,09 GB en disco. Su licencia Apache-2.0 permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en la creciente demanda de soluciones de OCR y parsing de documentos que funcionen íntegramente en el dispositivo, especialmente en entornos donde la privacidad de los datos es crítica. Al ejecutarse en Apple Silicon, ofrece una alternativa eficiente a los servicios cloud, con latencias bajas y sin coste por inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCRVLForConditionalGeneration (basada en ERNIE-4.5, con encoder de visión de parches de 14px) |
| Parametros totales | 351.727.700 (según safetensors; la model card del base indica 0,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

PaddleOCR-VL-1.6 es un modelo de lenguaje y visión de tipo encoder-decoder basado en ERNIE-4.5. El encoder de visión procesa imágenes dividiéndolas en parches de 14×14 píxeles, con un límite de aproximadamente 1 millón de píxeles por imagen, lo que permite analizar documentos completos de alta resolución. El decodificador de lenguaje genera texto en formato Markdown o JSON, incluyendo estructura de layout, contenido de tablas, fórmulas LaTeX, gráficos y sellos. El entrenamiento del modelo base se realizó con una estrategia de post-entrenamiento progresivo, optimizando regiones del documento que estaban poco representadas en versiones anteriores (como fórmulas complejas y tablas anidadas). La versión MLX 8-bit es una conversión directa de los pesos originales mediante `mlx_vlm.convert`, sin reentrenamiento, por lo que mantiene la arquitectura y el conocimiento del modelo base.

## Capacidades

- OCR de página completa en formato Markdown y JSON, con detección y reconocimiento de texto en imágenes.
- Análisis de layout: identificación de títulos, párrafos, listas, imágenes y otros bloques estructurales.
- Reconocimiento de tablas: extracción de estructura (filas, columnas, celdas) y contenido.
- Reconocimiento de fórmulas matemáticas en notación LaTeX.
- Reconocimiento de gráficos y sellos (seal recognition).
- Text spotting: detección y reconocimiento simultáneo de texto en escenas o documentos.
- Capacidad conversacional: el modelo puede interactuar con el usuario sobre el contenido de la imagen (image-text-to-text).
- Soporte multilingüe, con especial rendimiento en inglés y chino.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede convertir escaneos de archivos en texto editable en Markdown, preservando la estructura de párrafos y títulos, lo que facilita su indexación y búsqueda.
- Extracción de datos de facturas y recibos: su capacidad de reconocimiento de tablas y layout permite automatizar la captura de campos como fechas, importes y números de factura en flujos de contabilidad.
- Conversión de papers científicos a LaTeX: el reconocimiento de fórmulas matemáticas en formato LaTeX posibilita transformar artículos escaneados en documentos editables para su reutilización en investigaciones.
- Análisis de informes financieros y gráficos: el modelo identifica y describe gráficos de barras, líneas y circulares, permitiendo extraer conclusiones cuantitativas de informes anuales.
- Verificación de sellos y firmas en documentos legales: la capacidad de reconocimiento de sellos ayuda a validar la autenticidad de contratos y certificados en procesos de compliance.
- Asistente de accesibilidad: al convertir documentos escaneados en texto legible por lectores de pantalla, el modelo facilita el acceso a información a personas con discapacidad visual.
- Pipeline de OCR local en entornos sanitarios: al ejecutarse en Apple Silicon sin conexión a internet, permite procesar historiales clínicos escaneados cumpliendo requisitos estrictos de privacidad de datos.

## Benchmarks y rendimiento

El modelo base PaddleOCR-VL-1.6 alcanza un 96,3% en el benchmark OmniDocBench v1.6, liderando en las categorías de texto, fórmula y tabla. La versión MLX 8-bit no ha sido evaluada de forma independiente; según la model card, la cuantización introduce un pequeño delta de precisión respecto al modelo en bf16/fp16. No se han publicado resultados específicos para esta conversión en la información disponible.

| Benchmark | PaddleOCR-VL-1.6 (base) |
|---|---|
| OmniDocBench v1.6 | 96,3% |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~351M parámetros cuantizado a 8 bits, ocupa aproximadamente 1,1 GB en disco. Durante la inferencia, el uso de memoria en Apple Silicon dependerá del tamaño de la imagen y del contexto generado; se estima un consumo de entre 2 y 4 GB de RAM unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No requiere GPU dedicada de NVIDIA.
- Compatibilidad: funciona en Macs con Apple Silicon; no está diseñado para GPUs CUDA.
- Opciones de despliegue: mediante `mlx-vlm` (API Python), servidor OpenAI-compatible (`python -m mlx_vlm.server --model OpenGryd/PaddleOCR-VL-1.6-MLX-8bit --port 8090`) o integración en aplicaciones macOS con Swift.
- Latencia y throughput: no hay datos públicos medidos. En un MacBook Pro M2, se espera una latencia de 1-3 segundos para el procesamiento de una página A4 completa, dependiendo de la complejidad del documento y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento OmniDocBench |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (base) | 0,9B | 131k | Apache-2.0 | bf16/fp16 | 96,3% (v1.6) |
| PaddleOCR-VL-1.6-MLX-8bit | 351M (safetensors) | 131k | Apache-2.0 | MLX 8-bit | no disponible |
| PaddleOCR-VL-1.5 | ~0,9B | 128k | Apache-2.0 | bf16/fp16 | 94,5% (v1.5) |

No se dispone de comparativas con otros modelos de OCR como Nougat o LayoutLMv3 en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 8-bit introduce una pequeña degradación de precisión respecto al modelo base en bf16/fp16; para tareas que requieran máxima exactitud (p. ej., documentos científicos densos) se recomienda usar la versión sin cuantizar.
- El modelo requiere `trust_remote_code=True` al cargarlo, ya que incluye código de modelado personalizado (`paddleocr_vl`). Esto implica ejecutar código arbitrario del repositorio, un riesgo de seguridad a considerar en entornos controlados.
- No acepta entradas de solo texto: es imprescindible proporcionar una imagen.
- El rendimiento óptimo está limitado a inglés y chino; para otros idiomas la calidad puede ser inferior.
- Puede alucinar contenido en documentos ilegibles o muy dañados, generando texto plausible pero incorrecto.
- La licencia Apache-2.0 permite uso comercial, pero el código personalizado incluido puede tener dependencias adicionales sujetas a otras licencias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/OpenGryd/PaddleOCR-VL-1.6-MLX-8bit
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Documentación oficial de PaddleOCR-VL-1.6: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Conversión alternativa (olragon/PaddleOCR-VL-1.6-8bit): https://huggingface.co/olragon/PaddleOCR-VL-1.6-8bit
- Guía de conversión MLX (Abishai95141/paddle-ocr-v1.6-mlx): https://github.com/Abishai95141/paddle-ocr-v1.6-mlx
