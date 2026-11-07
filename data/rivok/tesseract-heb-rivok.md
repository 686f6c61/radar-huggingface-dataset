# Rivok/tesseract-heb-rivok

## Resumen

`Rivok/tesseract-heb-rivok` no es un modelo de lenguaje, sino un paquete de datos de entrenamiento (`traineddata`) para el motor OCR Tesseract 5, especializado en hebreo impreso. Lo desarrolla Rivok Labs y contiene dos modelos: `heb_rivok`, que cubre hebreo, ingles y digitos en un unico fichero, y `heb_rivok_lite`, una variante mas pequena y aproximadamente tres veces mas rapida por linea que requiere combinarse con el modelo ingles (`+eng`). Ambos parten de los modelos de hebreo de Google (`script/Hebrew` y `heb` en tessdata_best) y se han afinado sobre documentos reales.

El problema que resuelve es concreto: el modelo `heb` que instalan por defecto Ubuntu, Debian y Homebrew es la variante "fast" de Google y comete muchos errores en hebreo impreso, especialmente en puntuacion, en la distincion de letras finales y en la perdida de digitos. Sobre 403 lineas extraidas de documentos reales, la tasa de error por caracter (CER) baja del 4,7 % con el modelo de Ubuntu al 1,4 % con `heb_rivok`, y del 17,5 % al 9,9 % en el corpus historico HaZefira.

La relevancia practica esta en que es un reemplazo directo: un solo fichero `.traineddata` que se copia en el directorio de tessdata y funciona con cualquier herramienta que use Tesseract, incluidos OCRmyPDF y Paperless-ngx, sin cambios de software ni de infraestructura. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red LSTM de Tesseract 5 (modelo de reconocimiento de lineas, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR por lineas; el limite lo fija el recorte de imagen, no una ventana de tokens) |
| Tipos de cuantizacion | int8 (ficheros en `tessdata/`, 5,7 MB y 3,4 MB) y float (ficheros en `tessdata_best/`, 12,3 MB y 6,0 MB, para reentrenamiento) |
| Idiomas soportados | hebreo e ingles (`heb_rivok`); hebreo y digitos (`heb_rivok_lite`, requiere `+eng` para ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.traineddata` (formato nativo de Tesseract) |

## Arquitectura y entrenamiento

Cada modelo es un fichero `.traineddata` de Tesseract 5 que contiene una red LSTM de reconocimiento de lineas de texto, no un transformer ni un modelo generativo. `heb_rivok` se afino a partir de `script/Hebrew` de Google en tessdata_best (la variante de mayor precision), y `heb_rivok_lite` a partir del `heb` estandar de tessdata_best (la variante mas ligera). El ajuste fino lo realizo Rivok Labs sobre documentos reales; la model card no detalla el volumen de datos de entrenamiento, la composicion exacta del corpus ni si se aplicaron tecnicas de aumento de datos.

La innovacion tecnica no esta en la arquitectura, sino en el ajuste del modelo base de Google y en la ampliacion del juego de caracteres de salida: ambos modelos emiten caracteres que los modelos estandar de hebreo no producen, como el maqaf (־), el geresh (׳), el gershayim (״), el guion largo, el bullet y el simbolo del euro. Segun el autor, los errores tipicos del Tesseract de serie se reducen drasticamente tras el ajuste: puntos finales espurios o ausentes de 238 a 15, confusions de mem final (ם) con samej (ס) de 28 a 1 y digitos perdidos de 85 a 5, siempre sobre el conjunto de 403 lineas reales.

## Capacidades

- Reconocimiento OCR de texto hebreo impreso en documentos escaneados y fotografias de pagina.
- Reconocimiento de ingles y digitos dentro del mismo fichero en `heb_rivok`, sin necesidad de `+eng`.
- Reconocimiento de hebreo y digitos en `heb_rivok_lite`, combinable con `+eng` para texto mixto.
- Salida de signos de puntuacion hebreos poco frecuentes (maqaf, geresh, gershayim) y de simbolos tipograficos y monetarios (guion largo, bullet, euro).
- Procesamiento por lineas con `--psm 13` para recortes de una sola linea y `--psm 6` para bloques, segun recomienda el autor.
- Integracion directa con OCRmyPDF y Paperless-ngx mediante el parametro `-l`.
- No dispone de tool calling, agentes, razonamiento multi-paso, vision semantica ni modo de pensamiento: es exclusivamente un motor de reconocimiento de caracteres.

## Casos de uso

- Digitalizacion de archivos notariales y juridicos: con `heb_rivok` el CER en documentos legales baja del 1,9 % al 0,4 %, lo que permite indexar expedientes completos con OCRmyPDF y buscar texto sin revisar manualmente cada pagina.
- Digitalizacion de prensa historica en hebreo: en el corpus HaZefira (1874/1887, 4.013 lineas) el CER pasa del 17,5 % al 9,9 % y la recuperacion de palabras del 67,6 % al 81,3 %, lo que hace viable la busqueda full-text en hemerotecas digitalizadas.
- Procesamiento de formularios escaneados: el CER en formularios baja del 4,7 % al 1,2 %, adecuado para pipelines que extraen campos de solicitudes y registros administrativos en hebreo.
- Documentacion medica: con un CER del 0,9 % frente al 6,1 % del modelo de Ubuntu en documentos medicos, reduce la necesidad de correccion manual en historiales e informes escaneados.
- Automatizacion de archivo personal con Paperless-ngx: al ser un `.traineddata` compatible, se puede sustituir el modelo por defecto y mejorar la calidad del texto indexado sin tocar la configuracion de la aplicacion.
- Extraccion de texto mixto hebreo-ingles: `heb_rivok` reduce el CER del 19,3 % al 14,0 % en 209 lineas que mezclan ambos idiomas, util en contratos, facturas y documentacion tecnica bilingue.
- Procesamiento de alto volumen con requisitos de latencia: `heb_rivok_lite` es aproximadamente tres veces mas rapido por linea que `heb_rivok` y mantiene un CER del 1,9 % en las 403 lineas reales, por lo que sirve para lotes masivos donde el coste computacional pesa mas que la precision maxima.

## Benchmarks y rendimiento

CER (tasa de error por caracter; menor es mejor) salvo donde se indica. "Palabras encontradas" es la F1 de palabras frente al texto de la propia pagina (mayor es mejor).

| Test | Ubuntu `heb` | Google `script/Hebrew` (best) | `heb_rivok` | `heb_rivok_lite` |
|---|---:|---:|---:|---:|
| 403 lineas reales, solo hebreo | 4,7 % | 4,0 % | **1,4 %** | **1,9 %** |
| Las mismas, con numeros | 4,5 % | 3,5 % | **1,6 %** | **1,6 %** |
| GlotOCR-bench hebreo, imagenes limpias | 21,2 % | 20,7 % | **18,5 %** | **20,6 %** |
| GlotOCR-bench hebreo, documentos antiguos | 34,0 % | 31,8 % | **30,1 %** | **32,3 %** |
| HaZefira, 4.013 lineas | 17,5 % | 14,3 % | **9,9 %** | **14,1 %** |
| HaZefira, 34 paginas, palabras encontradas | 67,6 % | 75,5 % | **81,3 %** | **76,6 %** |
| 209 lineas mixtas hebreo-ingles | 19,3 % | 16,4 % | **14,0 %** | no disponible |
| 7 documentos de ejemplo del autor | 4,5 % | no disponible | **1,0 %** | no disponible |

Desglose por tipo de documento con `heb_rivok` frente al modelo de Ubuntu: medico 6,1 % → 0,9 %; noticias 3,9 % → 0,7 %; legal 1,9 % → 0,4 %; formularios escaneados 4,7 % → 1,2 %; prensa antigua 16,3 % → 8,5 %. Los tests de linea usan `--psm 13`, las paginas el valor por defecto de Tesseract y GlotOCR `--psm 6`. Los conjuntos publicos (GlotOCR-bench y HaZefira) son reproducibles con los scripts del directorio `eval/`; las 403 lineas reales son privadas y no se redistribuyen. No hay solapamiento entre imagenes de test y de entrenamiento.

## Requisitos de hardware

- Al ser ficheros de Tesseract 5, la inferencia se ejecuta en CPU; no requieren GPU ni VRAM dedicada.
- Huella en disco minima: 5,7 MB (`heb_rivok` int8), 3,4 MB (`heb_rivok_lite` int8), 12,3 MB y 6,0 MB en las versiones float para reentrenamiento.
- Cualquier CPU x86-64 o ARM capaz de ejecutar Tesseract 5 sirve; el rendimiento escala con nucleos disponibles al procesar paginas en paralelo.
- Despliegue mediante el binario `tesseract`, la API de Tesseract, OCRmyPDF (`ocrmypdf -l heb_rivok`) o Paperless-ngx; tambien es compatible con envoltorios como pytesseract.
- Latencia y throughput: no se publican cifras absolutas; la model card solo indica que `heb_rivok_lite` es aproximadamente tres veces mas rapido por linea que `heb_rivok`.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Origen | Idiomas | Tamano (int8) | CER en 403 lineas reales | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| `heb_rivok` | Rivok Labs (ajuste sobre `script/Hebrew`) | he, en, digitos | 5,7 MB | 1,4 % | Apache 2.0 | Hugging Face y GitHub |
| `heb_rivok_lite` | Rivok Labs (ajuste sobre `heb` best) | he, digitos (+eng) | 3,4 MB | 1,9 % | Apache 2.0 | Hugging Face y GitHub |
| `heb` (Ubuntu/Debian/Homebrew) | Google, variante fast | he | no disponible | 4,7 % | Apache 2.0 | Repositorio tessdata |
| `heb` (tessdata_best) | Google | he | no disponible | 4,0 % | Apache 2.0 | Repositorio tessdata_best |
| `script/Hebrew` (tessdata_best) | Google | he | no disponible | 4,0 % | Apache 2.0 | Repositorio tessdata_best |

## Limitaciones y advertencias

- Solo cubre texto impreso; no esta pensado para escritura manuscrita ni para tipografias decorativas extremas.
- El rendimiento cae en documentos antiguos: incluso con `heb_rivok`, el CER en imagenes de "documento antiguo" de GlotOCR-bench es del 30,1 %, y en prensa historica del 9,9 %.
- Los recortes de una sola linea deben procesarse con `--psm 13` y no con `--psm 7`, segun advierte el propio autor.
- `heb_rivok_lite` no incluye ingles: hay que invocarlo como `heb_rivok_lite+eng` para texto mixto.
- La evaluacion principal (403 lineas reales) se hizo sobre datos privados no publicados, por lo que no es verificable de forma independiente; los conjuntos publicos (GlotOCR-bench y HaZefira) si son reproducibles con los scripts de `eval/`.
- GlotOCR-bench tiene licencia de solo evaluacion; los datos no se redistribuyen en el repositorio.
- No hay datos publicados sobre sesgos, tasas de alucinacion (concepto poco aplicable a OCR, pero si relevante para errores sistematicos de sustitucion de caracteres) ni comportamiento en idiomas distintos del hebreo y el ingles.
- El repositorio de Hugging Face figura con 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta el volumen ni la procedencia exacta de los datos de ajuste fino.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los corpus de evaluacion si se reutilizan en productos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/Rivok/tesseract-heb-rivok
- Articulo con ejemplos: https://rivoklabs.com/research/tesseract-hebrew
- Release en GitHub: https://github.com/RivoksLab/tesseract-heb-rivok/releases/tag/v1.0
- Rivok Labs: https://rivoklabs.com
- Perfil de Rivok en Hugging Face: https://huggingface.co/Rivok/models
- Modelo `heb` de Google en tessdata: https://github.com/tesseract-ocr/tessdata/blob/main/heb.traineddata
- Dataset GlotOCR-bench: https://huggingface.co/datasets/cis-lmu/GlotOCR-bench
- Corpus HaZefira (OmiLab): https://github.com/omilab/historical_press
