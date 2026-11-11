# HeOCR/heocr-r7-tesseract-heb

## Resumen

HeOCR R7 es un modelo de reconocimiento de texto (OCR) para hebreo impreso moderno, distribuido como fichero `traineddata` de Tesseract. Lo desarrolla el proyecto HeOCR y se basa en un ajuste fino del modelo `heb` de `tessdata_best` sobre 95.151 líneas reales escaneadas procedentes de 30 libros de dominio público (7 escaneos de la Biblioteca Nacional de Israel y 23 del Internet Archive). Cada línea está etiquetada con la transcripción de Project Ben-Yehuda de la misma edición, nunca con salida de OCR previa.

Técnicamente no es una red neuronal independiente ni un modelo de lenguaje generativo: es un reconocedor de líneas LSTM con CTC integrado en el motor de Tesseract 4/5, que delega el análisis de maquetación de página al propio Tesseract. El fichero pesa 3.628.595 bytes y solo funciona con el motor LSTM (`--oem 1`), sin motor legacy.

Su relevancia es acotada y honesta: mejora a Tesseract estándar en páginas hebreas impresas (CER 0,209 frente a 0,226; WER 0,393 frente a 0,473) pero no supera de forma medible a su predecesor HeOCR R6, con el que empata en CER. Es útil como recambio directo de `heb` y como línea base de investigación, no como solución de transcripción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM con CTC para reconocimiento de líneas; el layout de página lo gestiona Tesseract |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento de líneas, no modelo generativo) |
| Tipos de cuantizacion | no aplica; formato `traineddata` propietario de Tesseract |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache-2.0 (Copyright (c) 2026 HeOCR maintainers) |
| Formato de pesos | Tesseract 4/5 LSTM `traineddata` (solo LSTM, `--oem 1`) |
| Tamano del fichero | 3.628.595 bytes (`heocr_r7.traineddata`) |
| sha256 | `95faab81fba6fe57f854f973c1ccad2b0d1059fb951f34b17277385ceea8b303` |
| Modelo base | `tessdata_best` `heb.traineddata` en commit `e12c65a` (Apache-2.0) |
| Version de Tesseract probada | 5.5.3 (compatible con 4 y 5) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas LSTM entrenado con pérdida CTC, el mismo tipo de cabecera que usa Tesseract desde la versión 4. No incluye detector de layout: la segmentación de página la realiza el motor de Tesseract y el modelo solo transcribe cada línea recortada. Se entrenó y evaluó con Tesseract 5.5.3 y funciona únicamente con el motor LSTM (`--oem 1`), sin soporte del motor legacy.

El ajuste fino se hizo sobre el `heb.traineddata` de `tessdata_best` (commit `e12c65a`), con 95.151 líneas reales del split de entrenamiento del conjunto `bynli_lines_v2` (Ben-Yehuda × NLI e Internet Archive). Las líneas provienen de 30 libros: 19.820 de 7 escaneos de la NLI y 75.331 de 23 escaneos del Internet Archive. Cada libro se limita a 6.100 líneas (máximo 6,4% del total), aunque las obras completas de Smolenskin aportan el 18,6% en conjunto. Las etiquetas son transcripciones humanas de Project Ben-Yehuda de la misma edición, y se excluyeron los libros con texto completamente vocalizado (niqqud). No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; el registro de entrenamiento está en `r7_training_run.json` (esquema `heocr_tesseract_training_run.v1`).

## Capacidades

- Reconocimiento de texto hebreo impreso en escritura cuadrada, incluyendo tipografía de libros de los siglos XIX y principios del XX.
- OCR de páginas completas con segmentación automática de layout (modo `--psm 3`), con salida en orden lógico de lectura.
- Reconocimiento de imágenes de línea individual (modo `--psm 13`), útil cuando la segmentación la realiza otro motor.
- Salida en texto plano, TSV, hOCR, PDF y ALTO (estos últimos requieren la carpeta `configs` de Tesseract accesible).
- Combinación con otros modelos de idioma de Tesseract mediante la sintaxis `-l heocr_r7+eng` (no evaluada por el autor).
- No soporta escritura manual, texto vocalizado con niqqud, escritura Rashi ni hebreo no cuadrado.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un reconocedor.

## Casos de uso

- Digitalización de libros hebreos de dominio público: sustituir `heb` por `heocr_r7` en pipelines de escaneo masivo para reducir errores de carácter en tipografía de época, aceptando una tasa de error de aproximadamente un carácter de cada cinco.
- Procesamiento de prensa histórica hebrea: periódicos de los siglos XIX y XX en escritura cuadrada sin vocalizar, donde el modelo se ha entrenado con líneas de ese tipo de fuentes.
- Línea base de investigación en OCR hebreo: comparar nuevos modelos contra R7 y R6 sobre el mismo conjunto de 38 páginas con referencias adjudicadas por humanos.
- Reconocimiento de líneas aisladas en pipelines propios: si se dispone de un segmentador externo, pasar los recortes con `--psm 13` para obtener la transcripción de cada línea.
- Extracción de texto para búsqueda y recuperación documental: indexar el texto OCR de colecciones hebreas aunque contenga errores, ya que la búsqueda tolera cierto ruido a nivel de carácter.
- Generación de capas de texto en PDFs de archivo: usar la salida PDF de Tesseract con el modelo para añadir texto seleccionable a escaneos, con revisión humana posterior.
- Alineación y corrección asistida: emplear la salida como borrador inicial que un corrector humano o un modelo de lenguaje revisa después, dado el CER de 0,209.

## Benchmarks y rendimiento

Evaluación sobre 38 páginas impresas reales con referencias adjudicadas por humanos:

| Metrica | Tesseract stock (`heb`) | HeOCR R7 | HeOCR R6 |
|---|---|---|---|
| CER | 0,226 | 0,209 | 0,2094 |
| WER | 0,473 | 0,393 | ligeramente superior a R7 (intervalo incluye cero) |

Diferencia R7 − R6 en CER: −0,0005, con intervalo de confianza [−0,0072, +0,0061], es decir, empate estadístico. En las 10 páginas más difíciles del conjunto, R7 no supera a Tesseract estándar ni a R6, y su estimación puntual de CER es ligeramente peor.

## Requisitos de hardware

- El fichero ocupa 3,6 MB y la inferencia la ejecuta Tesseract, por lo que cabe en cualquier equipo con CPU moderna; no requiere GPU.
- VRAM estimada: 0 GB (ejecución en CPU).
- GPU recomendadas: no aplica; Tesseract no explota GPU de forma nativa.
- Cabe en cualquier GPU de consumo y en sistemas embebidos, siempre que se pueda instalar Tesseract 4 o 5.
- Opciones de despliegue: binario `tesseract` (CLI), enlaces de Python (`pytesseract`) o cualquier wrapper que invoque Tesseract con `--tessdata-dir` apuntando al directorio del modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño de página y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | CER (38 páginas) | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeOCR R7 | Tesseract LSTM `traineddata` | hebreo impreso | 0,209 | 0,393 | Apache-2.0 | Hugging Face |
| HeOCR R6 | Tesseract LSTM `traineddata` | hebreo impreso | 0,2094 | ligeramente superior | no disponible en la información | Zenodo (DOI 10.5281/zenodo.24109989) |
| Tesseract stock `heb` | Tesseract LSTM `traineddata` | hebreo | 0,226 | 0,473 | Apache-2.0 | tessdata_best |
| Kraken (pipeline HeOCR R4d, A1, R3h) | no disponible | hebreo | no disponible | no disponible | no disponible | no vinculado a R7 |

## Limitaciones y advertencias

- Tasa de error alta para uso sin supervisión: CER de aproximadamente 0,21 en páginas reales, es decir, uno de cada cinco caracteres. Requiere revisión humana en producción.
- Sin ganancia medible frente a R6: el autor indica explícitamente que R7 no sustituye a R6 y que no hay mejora a nivel de página.
- No reconoce escritura manual, niqqud, cantilación, escritura Rashi ni hebreo no cuadrado; tampoco se midió su comportamiento en texto vocalizado.
- No se entrenó con texto latino, por lo que no es adecuado para documentos con mezcla de idiomas; la combinación `-l heocr_r7+eng` no fue evaluada.
- Solo funciona con el motor LSTM de Tesseract (`--oem 1`); el motor legacy no está soportado.
- En imágenes de línea conviene usar `--psm 13` y no `--psm 7`, que devolvía texto vacío en recortes con restos de líneas vecinas con modelos anteriores de la misma familia; R7 no se probó por separado en este aspecto.
- `--tessdata-dir` reemplaza el directorio de datos de Tesseract: los formatos de salida distintos de texto plano necesitan la carpeta `configs` enlazada o copiada.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright y el fichero NOTICE.
- No hay datos publicados sobre sesgos lingüísticos o de dominio más allá del conjunto de evaluación descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-r7-tesseract-heb
- Modelo base `tessdata_best` `heb.traineddata`: https://github.com/tesseract-ocr/tessdata_best/tree/e12c65a915945e4c28e237a9b52bc4a8f39a0cec
- Código del motor HeOCR: https://github.com/HeOCR/heocr-engine
- Repositorio Tesseract: https://github.com/tesseract-ocr/tesseract
- HeOCR R6 (DOI): https://doi.org/10.5281/zenodo.24109989
- Manifiesto NLI de ejemplo (Anna Karenina, 1918–1922): https://iiif.nli.org.il/IIIFv21/990017640460205171/manifest
- Manifiesto NLI de ejemplo (Ketavim Aharonim): https://iiif.nli.org.il/IIIFv21/990020308000205171/manifest
