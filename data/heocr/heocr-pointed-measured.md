# HeOCR/heocr-pointed-measured

## Resumen

HeOCR Pointed MEASURED v1.0 es un modelo de reconocimiento óptico de caracteres (OCR) basado en el motor Tesseract, especializado en hebreo literario con puntuación (niqqud y cantilación). Lo desarrolla HeOCR, un proyecto centrado en OCR de hebreo histórico e impreso, y se distribuye como un fichero de pesos entrenados de Tesseract en formato `.traineddata` con cuantización int8. No es un transformer ni un modelo neuronal de gran tamaño: es un modelo de Tesseract afinado, lo que condiciona su despliegue, sus requisitos de hardware y su integración.

El modelo parte de HeOCR P-hist v1.1, que a su vez deriva de Rivok Full (`Rivok/tesseract-heb-rivok`), y se ha afinado sobre 12.001 líneas reales con puntuación extraídas de escaneos de dominio público y de textos de lectura de Project Ben-Yehuda. Su relevancia radica en que aborda un nicho poco cubierto: la transcripción de poesía y prosa hebrea impresa antigua con marcas vocálicas, donde los modelos OCR genéricos suelen degradar gravemente el texto.

La evaluación publicada se realiza sobre un conjunto de referencia congelado (PBY-H v0.1, 24 páginas de 8 obras) y muestra que el modelo mejora a sus predecesores en CER con niqqud, pero queda por detrás de Google Document AI y Google Cloud Vision. Es, por tanto, una opción relevante para pipelines que requieran ejecución local, licencia permisiva y preservación razonable de la puntuación, no para competir en precisión absoluta contra servicios comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract (motor OCR LSTM), no transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa líneas de imagen) |
| Tipos de cuantizacion | int8 (fichero `.traineddata` medido) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.traineddata` (Tesseract), fichero `heocr_pointed.traineddata` |
| SHA-256 de los pesos | `55440680250a183c875211ae18d5b502cccfe761ef3fbd9121a1fda236418bdb` |
| Modelo base | `Rivok/tesseract-heb-rivok` (vía HeOCR P-hist v1.1) |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Versión de herramienta asociada | heocr 0.3.0a2 |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer, MoE ni SSM, sino el motor OCR de Tesseract, cuyo reconocedor se basa en una red LSTM sobre características de imagen de línea de texto. El artefacto distribuido es un fichero de pesos de Tesseract cuantizado a int8, lo que implica que la "inferencia" se realiza con el binario de Tesseract o con la herramienta `heocr` en su versión 0.3.0a2, no con frameworks como PyTorch o vLLM.

El entrenamiento consistió en un ajuste fino sobre 12.001 líneas reales con puntuación, procedentes de escaneos de libros de dominio público (ninguna de las obras del conjunto de evaluación) y de textos de lectura de Project Ben-Yehuda, complementadas con pares de líneas de impresión histórica de HeOCR y con repetición (replay) de Rivok v2. El checkpoint publicado corresponde a 60.000 muestras vistas, seleccionado sobre un conjunto de desarrollo separado bajo una regla fijada antes del entrenamiento. La evaluación se realizó una sola vez sobre el conjunto congelado PBY-H v0.1 y la puntuación fue reproducida de forma independiente.

## Capacidades

- Reconocimiento de texto hebreo impreso literario con puntuación completa (niqqud y cantilación).
- Transcripción de líneas de imagen a texto, con normalización `line_fold_v1` en la evaluación.
- Preservación de marcas vocálicas: recupera el 80,1 % de las marcas de puntuación de la referencia.
- Funcionamiento local y offline, sin dependencia de servicios en la nube.
- Integración mediante el binario de Tesseract y la herramienta `heocr` 0.3.0a2.
- Salida de texto plano alineada con el texto tipografiado de Project Ben-Yehuda (texto de lectura corregido, no transcripción diplomática).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento; es exclusivamente un motor OCR.

## Casos de uso

- Digitalización de poesía hebrea con niqqud: el modelo está afinado específicamente sobre líneas de impresión literaria puntiaguda, por lo que es adecuado para transcribir poemarios escaneados preservando las vocales, algo que los OCR genéricos suelen perder.
- Preservación digital en archivos y bibliotecas: al ejecutarse localmente y con licencia Apache-2.0, permite procesar fondos de dominio público sin enviar imágenes a servicios externos ni asumir costes por página.
- Corpus para investigación lingüística: la recuperación del 80,1 % de las marcas de puntuación facilita la construcción de corpus con niqqud para estudios de fonología, morfología o lexicografía del hebreo.
- Revisión asistida de textos de Project Ben-Yehuda: la salida se alinea con el texto tipografiado de PBY, de modo que puede usarse para cotejar ediciones escaneadas contra la transcripción existente y detectar divergencias.
- Pipelines de OCR por lotes en servidores modestos: al ser un fichero Tesseract int8, no requiere GPU y puede desplegarse en CPU; el coste medido es de 2,2 s de mediana por página.
- Comparación y control de calidad de motores OCR: sirve como referencia local frente a Google Document AI o Cloud Vision en proyectos que necesiten medir la pérdida de niqqud de cada lector sobre un mismo conjunto.
- Digitalización de ediciones históricas de hebreo impreso: aunque su foco es la impresión literaria puntiaguda, el entrenamiento incluye pares de impresión histórica de HeOCR, lo que lo hace utilizable en escaneos antiguos con las cautelas indicadas en la evaluación.

## Benchmarks y rendimiento

Evaluación sobre PBY-H v0.1 (estrato puntiagudo), 24 páginas de 8 obras, 460 líneas, CER a nivel de página con normalización `line_fold_v1`. Intervalos calculados con bootstrap emparejado sobre las 8 obras (2.000 remuestreos, semilla 0).

| Lector | CER con niqqud (%) | CER solo letras (%) | WER (%) |
|---|---:|---:|---:|
| Google Document AI OCR | 9,50 | 9,80 | 40,7 |
| Google Cloud Vision | 9,67 | 10,33 | 43,3 |
| **HeOCR pointed-measured v1.0** | **17,38** | **16,74** | **36,8** |
| HeOCR old-print v1.1 (anterior) | 19,12 | 17,00 | 44,4 |
| Rivok Tesseract Full | 19,18 | 18,62 | 48,4 |
| HeOCR old-print v1.0 | 19,79 | 17,65 | 46,9 |
| Rivok Tesseract Lite | 23,40 | 19,77 | 61,1 |
| Tesseract `heb` fast | 42,12 | 25,00 | 104,8 |
| Tesseract `heb` best | 45,06 | 25,39 | 105,5 |
| Rivok PaddleOCR | 46,64 | 16,12 | 108,3 |

Cambio relativo de CER del modelo frente a cada lector (cota superior unilateral al 97,5 %): +83,0 % (+144,5 %) frente a Document AI, +79,8 % (+129,0 %) frente a Cloud Vision, −9,1 % (−6,5 %) frente a v1.1, −9,4 % (+17,7 %) frente a Rivok Tesseract Full, −12,2 % (−9,7 %) frente a v1.0, −25,7 % (−12,0 %) frente a Rivok Lite, −58,7 % (−51,4 %) frente a Tesseract `heb` fast, −61,4 % (−54,2 %) frente a Tesseract `heb` best y −62,7 % (−54,2 %) frente a Rivok PaddleOCR.

Lectura de los resultados: Google está claramente por delante en CER con niqqud (aproximadamente la mitad de errores). El modelo mejora a v1.1 y a v1.0, está estadísticamente empatado con Rivok Tesseract Full y obtiene el WER más bajo de la tabla, aunque estadísticamente empatado con ambos lectores de Google en palabras. La mejora sobre v1.1 se concentra en el niqqud: en solo letras está empatado con v1.1 (−1,5 %, cota superior +1,0 %). Google Drive OCR no se evaluó porque su API rechazó el hebreo como idioma OCR.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es un fichero Tesseract int8 que se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU para inferencia.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB según Hugging Face y el artefacto es un único `.traineddata`.
- Opciones de despliegue: binario de Tesseract con el fichero `heocr_pointed.traineddata`, o la herramienta `heocr` en versión 0.3.0a2. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 2,2 s por página en la evaluación publicada, frente a 1,4 s de la versión anterior v1.1.
- Throughput: no disponible más allá de la latencia por página indicada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | CER con niqqud (%) | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| HeOCR pointed-measured v1.0 | Tesseract int8 | he | 17,38 | Apache-2.0 | Local, CPU |
| HeOCR old-print v1.1 | Tesseract int8 | he | 19,12 | no disponible en la información | Local, CPU |
| Rivok Tesseract Full | Tesseract | he | 19,18 | no disponible en la información | Local, CPU |
| Google Document AI OCR | Servicio comercial | he | 9,50 | propietaria | Nube |
| Google Cloud Vision | Servicio comercial | he | 9,67 | propietaria | Nube |

Frente a los modelos Tesseract de la misma familia, HeOCR pointed-measured v1.0 ofrece el mejor CER con niqqud y el mejor WER, con un coste de latencia superior (2,2 s frente a 1,4 s por página de v1.1). Frente a los servicios de Google, pierde aproximadamente 8 puntos de CER con niqqud, pero gana en WER (36,8 % frente a 40,7 % y 43,3 %) y ofrece ejecución local con licencia Apache-2.0.

## Limitaciones y advertencias

- Precisión inferior a Google: con niqqud conservado, Document AI y Cloud Vision cometen aproximadamente la mitad de errores (9,5 % y 9,7 % frente a 17,4 %).
- Sesgo de evaluación por edición: 21 de las 24 páginas del conjunto provienen de una sola edición (Katzenelson, Varsovia 1910); los intervalos a nivel de obra tratan sus 7 obras como clústeres separados, lo que subestima la variabilidad en otras ediciones puntiagudas.
- Mayor latencia que su predecesor: 2,2 s por página frente a 1,4 s de v1.1.
- Ámbito restringido: solo hebreo (`he`) y orientado a impresión literaria puntiaguda; no es un OCR multilingüe ni un modelo de propósito general.
- Naturaleza del texto de referencia: PBY es un texto de lectura corregido, no una transcripción diplomática, por lo que la salida no reproduce necesariamente la disposición o grafía exacta del original.
- Solapamiento de datos: otros textos de Project Ben-Yehuda son públicos y pueden aparecer en los datos de entrenamiento de cualquier lector; el solapamiento textual está etiquetado, no excluido, y solo se excluyen las imágenes de página exactas.
- Una línea de entrenamiento comparte texto con otro conjunto reservado de HeOCR (impresión puntiaguda), sin afectar al conjunto de evaluación de esta ficha.
- Riesgo de alucinación: como todo OCR, puede producir sustituciones plausibles en pasajes degradados; no se han publicado análisis específicos de sesgos lingüísticos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero NOTICE del repositorio para las atribuciones de fuentes y licencias de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-pointed-measured
- Modelo base: https://huggingface.co/Rivok/tesseract-heb-rivok
- Modelo predecesor (HeOCR P-hist v1.1): https://huggingface.co/HeOCR/heocr-p-hist-measured/tree/v1.1
- Archivo Zenodo: https://doi.org/10.5281/zenodo.24620184
- Project Ben-Yehuda: https://benyehuda.org
- Internet Archive: https://archive.org
