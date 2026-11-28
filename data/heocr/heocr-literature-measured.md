# HeOCR/heocr-literature-measured

## Resumen

HeOCR literature-measured v1.0 es un modelo de reconocimiento óptico de caracteres (OCR) basado en Tesseract, especializado en hebreo literario moderno sin puntuación vocálica (unpointed Hebrew). Lo desarrolla HeOCR y se distribuye como un fine-tune directo de Rivok Tesseract Full (Rivok/tesseract-heb-rivok), empaquetado en un único fichero de pesos `heocr_literature.traineddata` en formato int8 bajo licencia Apache-2.0.

El modelo no es una red neuronal de gran tamaño ni un transformer generativo: es un motor Tesseract afinado sobre pares de líneas de escaneos de dominio público y textos de lectura de Project Ben-Yehuda, complementado con pares de línea de HeOCR historical-print y replay de Rivok v2. Su relevancia radica en que aborda un nicho concreto, el OCR de impresión literaria hebrea sin nikud, con una metodología de evaluación poco habitual en OCR: conjunto de test congelado antes de ejecutar ningún lector, puntuación registrada previamente y reproducción independiente.

En la evaluación retenida PBY-H v0 (36 páginas de 12 obras literarias hebreas de dominio público, 1.017 líneas puntuadas y 53.547 caracteres de referencia), el modelo obtiene un CER del 7,03 % y un WER del 21,0 %, superando de forma estadísticamente significativa a Google Cloud Vision, Google Document AI, Tesseract `heb` y Rivok PaddleOCR, y quedando estadísticamente a la par de Rivok Tesseract Lite, Rivok Tesseract Full y su predecesor HeOCR old-print v1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract (motor LSTM de OCR), fine-tune de Rivok Tesseract Full |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR por líneas, no modelo generativo) |
| Tipos de cuantizacion | int8 (pesos empaquetados en `.traineddata`) |
| Idiomas soportados | hebreo (`he`), impresión literaria sin puntuación vocálica |
| Licencia | Apache-2.0 |
| Formato de pesos | `.traineddata` (Tesseract), fichero `heocr_literature.traineddata` |

## Arquitectura y entrenamiento

El modelo es un motor Tesseract afinado, no un transformer ni un modelo híbrido. Se parte de Rivok Tesseract Full y se entrena sobre pares de líneas (imagen, texto) procedentes de escaneos de dominio público y de textos de lectura de Project Ben-Yehuda, junto con pares de línea de HeOCR historical-print y replay de Rivok v2. El checkpoint publicado corresponde a 35.000 muestras vistas, seleccionado sobre un conjunto de desarrollo separado bajo una regla registrada antes del entrenamiento.

La innovación destacable no está en la arquitectura sino en el protocolo de evaluación: conjunto PBY-H v0 congelado antes de ejecutar ningún lector, registro previo de la ejecución del modelo, puntuación única sobre el conjunto y reproducción independiente del resultado. La métrica es CER a nivel de página con normalización `line_fold_v1`, con intervalos de confianza calculados mediante bootstrap emparejado sobre las 12 obras (2.000 remuestreos, semilla 0). El SHA-256 del fichero de pesos publicado es `98e460d2b7de924371d94dccd16e6b6803537b31892e3830979c97ddb7d58c50`.

## Capacidades

- Reconocimiento de texto impreso en hebreo literario moderno sin puntuación vocálica.
- Procesamiento de páginas escaneadas procedentes de Internet Archive y Wikimedia Commons.
- Segmentación y reconocimiento por líneas mediante el pipeline estándar de Tesseract.
- Integración con la herramienta `heocr` 0.3.0a2 para la ejecución del modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre, solo transcribe imágenes.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales.

## Casos de uso

- Digitalización de obras literarias hebreas de dominio público: el modelo transcribe páginas escaneadas de ediciones literarias sin nikud con un CER del 7,03 %, adecuado para pipelines de preservación digital en bibliotecas y archivos.
- Corpus para investigación en humanidades: permite convertir ediciones impresas hebreas en texto plano alineable con transcripciones de referencia como las de Project Ben-Yehuda, facilitando estudios lingüísticos y literarios a escala.
- Enriquecimiento de archivos tipo Project Ben-Yehuda: sirve para cotejar y completar textos ya transcritos por voluntarios, detectando discrepancias entre la edición impresa y la lectura digitalizada.
- Procesamiento por lotes en servidores sin GPU: al ser un motor Tesseract int8, se ejecuta en CPU y encaja en infraestructuras modestas para digitalizar grandes volúmenes de páginas.
- Sustitución de servicios OCR en la nube para hebreo: ofrece un CER inferior al de Google Cloud Vision (7,54 %) y Google Document AI (8,66 %) en este dominio, con la ventaja de ejecución local y licencia Apache-2.0.
- Verificación de calidad de digitalizaciones: comparar la salida del modelo con el texto de referencia permite priorizar qué páginas requieren revisión humana en un flujo de control de calidad.
- Investigación en evaluación de OCR: el protocolo congelado y reproducible del conjunto PBY-H v0 sirve como base metodológica para comparar lectores OCR en otros dominios.

## Benchmarks y rendimiento

Evaluación retenida PBY-H v0, estrato sin puntuación: 36 páginas de 12 obras literarias hebreas de dominio público, 1.164 líneas totales, 147 enmascaradas por divergencia entre edición y texto de referencia, 1.017 líneas puntuadas y 53.547 caracteres de referencia. Métrica: CER a nivel de página con normalización `line_fold_v1`.

| Lector | CER (%) | WER (%) | Cambio relativo de CER del modelo (cota superior unilateral al 97,5 %) |
|---|---:|---:|---|
| HeOCR literature-measured v1.0 | 7,03 | 21,0 | — |
| Rivok Tesseract Lite | 7,22 | 20,7 | −2,5 % (+7,1 %) |
| HeOCR old-print v1.1 (anterior) | 7,33 | 22,1 | −4,0 % (+0,4 %) |
| Google Cloud Vision | 7,54 | 24,5 | −6,7 % (−0,5 %) |
| Rivok Tesseract Full | 7,67 | 22,6 | −8,3 % (+1,6 %) |
| Google Document AI OCR | 8,66 | 25,8 | −18,7 % (−8,9 %) |
| Tesseract `heb` fast | 10,57 | 32,1 | −33,4 % (−21,5 %) |
| Tesseract `heb` best | 11,02 | 32,3 | −36,2 % (−28,7 %) |
| Rivok PaddleOCR | 13,68 | 43,6 | −48,6 % (−43,3 %) |

El OCR integrado de Google Drive no se ejecutó porque su API rechazó el hebreo como idioma de OCR. El modelo es mejor que Google Cloud Vision, Google Document AI, Tesseract y Rivok PaddleOCR (cotas superiores por debajo de cero), aunque frente a Vision el margen es estrecho (cota superior −0,5 %). Está estadísticamente a la par de Rivok Lite, Rivok Full y HeOCR v1.1, por lo que no supone un salto claro respecto a v1.1.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es un motor Tesseract int8 que se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU estándar.
- Compatibilidad con GPU de consumo: no aplica, al no necesitar aceleración gráfica.
- Opciones de despliegue: binario o librería Tesseract con el fichero `heocr_literature.traineddata`, y la herramienta `heocr` 0.3.0a2.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | CER (%) en PBY-H v0 | Licencia | Disponibilidad |
|---|---|---:|---|---|
| HeOCR literature-measured v1.0 | Tesseract int8 | 7,03 | Apache-2.0 | Hugging Face y Zenodo |
| Rivok Tesseract Full | Tesseract | 7,67 | no disponible | Hugging Face |
| HeOCR old-print v1.1 | Tesseract | 7,33 | no disponible | Hugging Face |
| Google Cloud Vision | Servicio en la nube | 7,54 | propietaria | API de pago |
| Google Document AI OCR | Servicio en la nube | 8,66 | propietaria | API de pago |
| Tesseract `heb` best | Tesseract | 11,02 | Apache-2.0 | open source |

## Limitaciones y advertencias

- Es un fine-tune de Rivok Tesseract Full y queda estadísticamente a la par de él en este conjunto; no es una mejora clara respecto a HeOCR v1.1.
- El conjunto de evaluación tiene solo 12 obras, por lo que los intervalos de confianza son amplios.
- Otros textos de Project Ben-Yehuda son públicos y pueden aparecer en los datos de entrenamiento de cualquier lector, incluido este; el solapamiento de texto está etiquetado, no excluido. Solo se excluyen imágenes de página exactas.
- Una línea de entrenamiento comparte texto con otro conjunto retenido de HeOCR (impresión con puntuación); no afecta a este conjunto.
- Las páginas con puntuación vocálica de este conjunto (2 obras) son solo indicativas y no se reportan.
- Las referencias son el texto corregido por voluntarios de Project Ben-Yehuda, que es un texto de lectura, no una transcripción diplomática.
- Especializado exclusivamente en hebreo literario impreso sin nikud; no se documenta rendimiento en otros idiomas ni en manuscritos.
- Riesgo de errores de transcripción en ediciones con tipografías inusuales o escaneos de baja calidad; no se documentan sesgos específicos más allá de las limitaciones del corpus.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso NOTICE con las atribuciones y licencias de las fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-literature-measured
- Modelo base Rivok Tesseract Full: https://huggingface.co/Rivok/tesseract-heb-rivok
- Archivo Zenodo: https://doi.org/10.5281/zenodo.24620176
- Project Ben-Yehuda: https://benyehuda.org
- Internet Archive: https://archive.org
- Wikimedia Commons: https://commons.wikimedia.org
