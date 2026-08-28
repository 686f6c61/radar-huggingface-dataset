# IrieDinamik/ocr-mirror-ppocrv6

## Resumen

Este repositorio es un espejo gestionado por la aplicación de escritorio Vox Jot, que preserva el linaje de los modelos PP-OCRv6 de PaddlePaddle para permitir su descarga anónima y reproducible. No se trata de un modelo nuevo, sino de una copia empaquetada de los submódulos de detección y reconocimiento de texto de PP-OCRv6 en su variante *medium* (`PP-OCRv6_medium_det` y `PP-OCRv6_medium_rec`). El modelo original, desarrollado por PaddlePaddle, es la última generación de la familia PP-OCR, un sistema universal de reconocimiento óptico de caracteres que combina detección de regiones de texto y reconocimiento de los caracteres contenidos en ellas.

PP-OCRv6 introduce el backbone unificado PPLCNetV4 y se ofrece en tres tamaños (tiny, small y medium) para cubrir escenarios desde dispositivos de borde hasta servidores. Según el artículo técnico asociado, el modelo medium alcanza un 86,2 % de H-mean en detección y un 83,2 % de precisión en reconocimiento, superando a modelos multimodales de gran escala con una fracción de los parámetros. Este espejo en particular contiene únicamente la pareja medium de detección y reconocimiento, empaquetada para que la aplicación Vox Jot pueda localizarla y ejecutarla sin depender de la infraestructura de PaddlePaddle.

La relevancia de este repositorio radica en su función de distribución: facilita la integración de OCR offline en aplicaciones de escritorio, garantizando trazabilidad y reproducibilidad de los artefactos. No aporta ninguna modificación al modelo subyacente, por lo que las capacidades y limitaciones son las del PP-OCRv6 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPLCNetV4 (backbone) + cabezas de detección y reconocimiento (PP-OCRv6 medium) |
| Parametros totales | no disponible (el paper reporta 34,5 M para el modelo medium, pero no se desglosa por submódulo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión por computadora, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el PP-OCRv6 original soporta múltiples idiomas, pero el mirror no especifica cuáles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Paddle inference (no safetensors) |

## Arquitectura y entrenamiento

El modelo original PP-OCRv6 se basa en el backbone PPLCNetV4, diseñado para ofrecer un equilibrio óptimo entre precisión y eficiencia computacional. La familia se compone de tres variantes (tiny, small y medium) que comparten la misma arquitectura pero difieren en el número de canales y la profundidad, adaptándose a distintos entornos de despliegue. El mirror contiene la variante medium, que según el paper alcanza 34,5 millones de parámetros en total (sumando detección y reconocimiento). El entrenamiento se realizó con un corpus masivo de imágenes de texto en diversos idiomas y estilos, y el artículo reporta mejoras sustanciales frente a modelos multimodales de billones de parámetros en tareas de OCR.

El mirror no introduce cambios en el entrenamiento ni en los pesos; se limita a reempaquetar los archivos de inferencia de PaddlePaddle en una estructura de directorios (`det` y `rec`) que la aplicación Vox Jot puede localizar mediante su lógica interna. Los avisos legales y de atribución del upstream se conservan en la carpeta `upstream-notices/`.

## Capacidades

- Detección de regiones de texto en imágenes, devolviendo cuadros delimitadores con confianza.
- Reconocimiento de caracteres dentro de las regiones detectadas, produciendo cadenas de texto.
- Funcionamiento offline, sin necesidad de conexión a internet una vez descargados los pesos.
- Optimizado para ejecución en CPU y GPU de gama media, gracias a su reducido número de parámetros.
- Soporte multilingüe en el modelo original (aunque el mirror no documenta la lista exacta de idiomas).
- Integración sencilla en aplicaciones de escritorio mediante el empaquetado específico para Vox Jot.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede extraer texto de imágenes de documentos para su posterior indexación o búsqueda, aprovechando su precisión en detección y reconocimiento.
- Captura de texto desde pantalla: útil en herramientas de productividad que necesitan copiar texto de capturas de pantalla, como Vox Jot, que lo emplea para transcribir notas o apuntes.
- Automatización de flujos de trabajo con formularios: extracción de campos de texto de formularios impresos o digitalizados, reduciendo la intervención manual.
- Accesibilidad: conversión de texto presente en imágenes a voz o a formato digital para personas con discapacidad visual.
- Procesamiento de facturas y recibos: extracción de números de factura, fechas y totales para su integración en sistemas contables.
- Archivado de documentos históricos: OCR de imágenes de periódicos o manuscritos para su preservación y consulta digital.

## Benchmarks y rendimiento

El paper de PP-OCRv6 reporta los siguientes resultados para la variante medium:

| Tarea | Métrica | Valor |
|---|---|---|
| Detección | H-mean | 86,2 % |
| Reconocimiento | Precisión | 83,2 % |

No se dispone de comparaciones directas con otros modelos en la información del mirror. Estos valores provienen del artículo técnico y corresponden al modelo original, no a una evaluación independiente sobre este espejo.

## Requisitos de hardware

- Al tratarse de un modelo de 34,5 M de parámetros en total, la inferencia es viable en CPU sin necesidad de GPU.
- Para ejecución en tiempo real sobre vídeo o lotes grandes, se recomienda una GPU con al menos 4 GB de VRAM (p. ej., GTX 1650 o superior).
- En GPU, el modelo puede ejecutarse en tarjetas de gama de entrada como RTX 3050 o equivalentes.
- El mirror está diseñado para la aplicación Vox Jot, que gestiona la descarga y ejecución local; no se proporcionan instrucciones de despliegue con vLLM, llama.cpp u otros servidores de inferencia.
- La latencia estimada no está documentada, pero por el tamaño del modelo se espera un rendimiento de decenas de milisegundos por imagen en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos OCR (p. ej., Tesseract, PaddleOCR v5, o modelos basados en transformers). El mirror no incluye datos de rendimiento comparativo más allá de los del paper, y no se han encontrado evaluaciones independientes que permitan contrastar con alternativas.

## Limitaciones y advertencias

- Este repositorio es un espejo, no el modelo original; aunque no se han introducido cambios en los pesos, cualquier discrepancia con el upstream debe reportarse al mantenedor del mirror.
- El modelo puede presentar sesgos en el reconocimiento de ciertos tipos de letra, idiomas poco representados o imágenes de baja calidad, aunque no se documentan casos concretos.
- La precisión en escenarios con texto muy pequeño, rotado o con ruido puede degradarse; se recomienda preprocesar las imágenes.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al autor original (PaddlePaddle) y los avisos incluidos en `upstream-notices/`.
- No se garantiza la disponibilidad a largo plazo del mirror; para entornos de producción es preferible referenciar los repositorios upstream.

## Enlaces

- Repositorio del mirror: https://huggingface.co/IrieDinamik/ocr-mirror-ppocrv6
- Modelo de detección upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det
- Modelo de reconocimiento upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
- Documentación oficial de PP-OCRv6: https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html
- Paper técnico: https://arxiv.org/pdf/2606.13108
