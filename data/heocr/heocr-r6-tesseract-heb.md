# HeOCR/heocr-r6-tesseract-heb

## Resumen

HeOCR R6 es un modelo de reconocimiento de texto (OCR) para hebreo impreso, distribuido como fichero `traineddata` para el motor Tesseract. Lo desarrolla el proyecto HeOCR y consiste en un ajuste fino (fine-tuning) del modelo `heb` de tessdata_best, partiendo de 13.648 líneas reales escaneadas de libros de dominio público de la Biblioteca Nacional de Israel, con transcripciones de Project Ben-Yehuda como referencia de etiquetado. No es un motor nuevo, sino una mejora medida sobre el Tesseract estándar para páginas en hebreo impreso en escritura cuadrada.

El modelo es relevante para quien necesite OCR de hebreo sobre escaneos reales y quiera una alternativa ligera y de licencia permisiva (Apache-2.0) frente a soluciones propietarias o a pipelines neuronales pesados. Su tamaño es de 3.628.595 bytes y funciona con Tesseract 4/5 en modo LSTM (`--oem 1`), sin motor legacy. La mejora reportada es modesta: reduce el CER de 0,226 a 0,209 en 38 páginas reales, y no aporta ganancia en las 10 páginas más difíciles del conjunto de evaluación.

La ficha cubre sus especificaciones, el proceso de entrenamiento, sus capacidades y límites, y las condiciones prácticas de despliegue. Conviene subrayar desde el inicio que se trata de una herramienta de línea y página para hebreo impreso sin niqqud, no de un sistema de transcripción autónoma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM a nivel de línea con CTC (Tesseract 4/5, `--oem 1`); el layout de página lo resuelve Tesseract |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento de línea, no modelo generativo) |
| Tipos de cuantizacion | no disponible (formato `traineddata` propietario de Tesseract; no se documentan variantes cuantizadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache-2.0 (Copyright (c) 2026 HeOCR maintainers) |
| Formato de pesos | Tesseract 4/5 LSTM `traineddata` (fichero `heocr_r6.traineddata`, 3.628.595 bytes, sha256 `73eb18e03f8793dff9c03699db0845779f6b5db4897824bcd61787245ec66e10`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas basado en LSTM con CTC, el formato nativo de Tesseract 4 y 5. No incluye segmentación de página: Tesseract se encarga del layout y R6 solo resuelve el reconocimiento de cada línea. Se entrenó y probó con Tesseract 5.5.3 y solo funciona con el motor LSTM (`--oem 1`), sin soporte del motor legacy. El punto de partida es el `heb.traineddata` de tessdata_best en el commit `e12c65a915945e4c28e237a9b52bc4a8f39a0cec` (Apache-2.0, sha256 `dbaa827aea6bc21215638447f17783a1004987c2d0bf5573d111fee397abdae5`), ajustado por HeOCR.

El conjunto de entrenamiento son 13.648 líneas reales del split de train del set `bynli_lines_v1` (Ben-Yehuda × NLI), extraídas de escaneos de cinco libros de la Biblioteca Nacional de Israel, de los cuales el 99,9 % de las líneas provienen de tres: *Ketavim Aharonim* de Yeshayahu Berashadsky (6.076 líneas), *Me-Ahorei ha-Pargod* de Shmuel Leib Citron (6.052) e *Im Shahar* de Shmuel Tchernowitz (1.511). Las etiquetas provienen de la transcripción de Project Ben-Yehuda de la misma edición (dump de dominio público, release 2026-03), alineada sobre cada línea escaneada con la herramienta hocrgen F8f; solo se conservaron líneas con puntuación de alineamiento ≥ 0,9 y similitud ≥ 0,9 con la lectura de Tesseract. No se usaron escaneos de Google con licencia no comercial. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineamiento.

## Capacidades

- OCR de páginas completas de hebreo impreso en escritura cuadrada, incluyendo tipografía de principios del siglo XX, sin niqqud.
- Reconocimiento de imágenes de línea individual, útil cuando otro segmentador ya ha aislado las líneas.
- Sustitución directa del modelo `heb` estándar de Tesseract mediante el nombre de idioma `heocr_r6`.
- Combinación con otros modelos de Tesseract en la forma habitual, por ejemplo `-l heocr_r6+eng` (funciona, pero no fue evaluado).
- Salida en orden lógico de lectura con `--psm 3` para páginas y `--psm 13` para líneas.
- Exportación a formatos de Tesseract (`txt`, `tsv`, `hocr`, `pdf`, `alto`) copiando la carpeta `configs` en el directorio de datos.
- No soporta escritura manual, niqqud, cantilación, escritura Rashi ni otras grafías hebreas no cuadradas.
- No incluye tool calling, razonamiento multi-paso ni capacidades de agente: es un reconocedor, no un modelo generativo.

## Casos de uso

- Digitalización de libros y periódicos hebreos de dominio público: sustituir `heb` por `heocr_r6` en un pipeline Tesseract con `--psm 3` para obtener texto en orden de lectura de páginas escaneadas completas, con una reducción de CER de 0,226 a 0,209.
- Reconocimiento de líneas ya segmentadas: usar `--psm 13` sobre recortes de línea producidos por un segmentador externo, evitando `--psm 7`, que devuelve texto vacío cuando el recorte incluye un fragmento de la línea vecina (473 de 4.046 líneas en un libro de validación).
- Creación de corpus para investigación en OCR hebreo: emplear R6 como línea base reproducible sobre escaneos reales con referencias adjudicadas por humanos, comparando contra el modelo `heb` de tessdata_best.
- Indexación y búsqueda de fondos hebreos en bibliotecas digitales: generar capas de texto `hocr` o `alto` para colecciones de la Biblioteca Nacional de Israel con licencia de dominio público, facilitando la búsqueda por palabras.
- Procesamiento por lotes en servidores sin GPU: al ser un `traineddata` de 3,6 MB que corre en Tesseract, se puede desplegar en contenedores ligeros y ejecutar en CPU sobre grandes volúmenes de páginas.
- Extracción de texto para proyectos de humanidades digitales: transcribir ediciones hebreas de principios del siglo XX y revisar manualmente el resultado, dado que el CER de aproximadamente 0,21 exige corrección posterior.
- Integración en flujos que mezclan idiomas: combinar `-l heocr_r6+eng` para páginas con texto hebreo e inglés, asumiendo que esa combinación no fue evaluada por el autor.

## Benchmarks y rendimiento

| Metrica | Modelo base `heb` (tessdata_best) | HeOCR R6 |
|---|---|---|
| CER en 38 páginas reales con referencias adjudicadas | 0,226 | 0,209 |
| CER en las 10 páginas más difíciles | no disponible | sin ganancia respecto al base |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de OCR.

## Requisitos de hardware

- VRAM estimada: no aplica; Tesseract ejecuta el reconocimiento en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se documenta soporte GPU para este modelo.
- Cabe en cualquier equipo consumer: el fichero `traineddata` ocupa 3,6 MB y el consumo de memoria en ejecución es el propio de Tesseract.
- Opciones de despliegue: binario `tesseract` 4 o 5 (probado con 5.5.3), con `--tessdata-dir` apuntando al directorio que contiene `heocr_r6.traineddata`; también es posible instalarlo en el directorio tessdata de la instalación y omitir `--tessdata-dir`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | CER reportado | Disponibilidad |
|---|---|---|---|---|---|---|
| HeOCR R6 | LSTM CTC para Tesseract | hebreo | Apache-2.0 | no aplica | 0,209 (38 páginas) | Hugging Face, fichero `traineddata` |
| Tesseract `heb` (tessdata_best) | LSTM CTC para Tesseract | hebreo | Apache-2.0 | no aplica | 0,226 (38 páginas) | Repositorio tessdata_best |
| HeOCR kraken (R4d, A1, R3h) | Modelos kraken | hebreo | no disponible en la información | no aplica | no disponible | No vinculados a R6 según el autor |
| Otros OCR neuronales para hebreo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a los modelos kraken del mismo proyecto, ya que la información disponible no detalla alternativas externas con métricas comparables.

## Limitaciones y advertencias

- El CER en páginas reales es de aproximadamente 0,21 (uno de cada cinco caracteres erróneo): no es apto para transcripción sin supervisión.
- No aporta mejora en las 10 páginas más difíciles del conjunto de evaluación; el rendimiento puede degradarse en escaneos de baja calidad o tipografías atípicas.
- Entrenado solo con impresión: no reconoce escritura manual, escritura Rashi, grafías hebreas no cuadradas ni manos históricas medievales.
- Sin niqqud ni cantilación en las etiquetas de entrenamiento; el comportamiento sobre texto vocalizado no fue medido.
- Sin texto latino en las líneas de entrenamiento: no está pensado para documentos que no sean mayoritariamente hebreos.
- El conjunto de entrenamiento está muy concentrado: el 99,9 % de las líneas proviene de tres libros, lo que puede introducir sesgos hacia esas tipografías y ediciones.
- `--tessdata-dir` sustituye el directorio de datos de Tesseract; para salidas `tsv`, `hocr`, `pdf` o `alto` hay que copiar o enlazar la carpeta `configs` en ese directorio.
- `--psm 7` sobre recortes de línea devuelve texto vacío si el recorte incluye un fragmento de la línea vecina; debe usarse `--psm 13`.
- La combinación `-l heocr_r6+eng` funciona pero no fue evaluada por el autor.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse los avisos de LICENSE y NOTICE y la atribución al modelo base tessdata_best.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-r6-tesseract-heb
- Código del proyecto: https://github.com/HeOCR/heocr-engine
- Modelo base tessdata_best `heb.traineddata` (commit e12c65a): https://github.com/tesseract-ocr/tessdata_best/tree/e12c65a915945e4c28e237a9b52bc4a8f39a0cec
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract
- Manifiesto IIIF del libro *Ketavim Aharonim* (NLI): https://iiif.nli.org.il/IIIFv21/990020308000205171/manifest
- Manifiesto IIIF del libro *Me-Ahorei ha-Pargod* (NLI): https://iiif.nli.org.il/IIIFv21/990020495520205171/manifest
- Manifiesto IIIF del libro *Im Shahar* (NLI): https://iiif.nli.org.il/IIIFv21/990020522850205171/manifest
- Manifiesto IIIF del libro *Sefer Agadot ha-Zohar* (NLI): https://iiif.nli.org.il/IIIFv21/990019385920205171/manifest
- Manifiesto IIIF del libro *Shirim* (NLI): https://iiif.nli.org.il/IIIFv21/990013538860205171/manifest
