# HeOCR/heocr-oldprint-v1-tesseract-heb

## Resumen

HeOCR oldprint-v1 es un modelo de reconocimiento óptico de caracteres (OCR) para Tesseract, distribuido como fichero `.traineddata`, especializado en hebreo impreso antiguo en escritura cuadrada: libros de los siglos XIX y principios del XX, y ediciones rabínicas. Lo desarrolla el proyecto HeOCR y se obtiene continuando el entrenamiento de HeOCR R7 (a su vez un fine-tune del modelo `heb` de tessdata_best) durante una pasada sobre 76.946 líneas anotadas.

El modelo no es una red neuronal independiente ni un transformer: es un reconocedor de líneas LSTM con CTC que se integra en el motor Tesseract 4/5, que se encarga del análisis de maquetación de la página. Su relevancia es práctica: mejora el modelo `heb` estándar en impresión antigua (CER de 16,75 % frente a 20,26 % en el conjunto de auditoría audit2) y está pensado como el paso de "impresión antigua" dentro del pipeline documental `heocr`, complementando a modern-v1 para documentos modernos.

El fichero pesa 3.628.595 bytes, se publica bajo licencia Apache-2.0 y solo soporta hebreo. Es un modelo de nicho, con cero descargas y sin puntuación de test publicada: todas las cifras de la model card provienen de conjuntos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor de lineas LSTM con CTC (Tesseract 4/5, motor LSTM, `--oem 1`); el layout de pagina lo resuelve Tesseract |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento linea a linea, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (formato `traineddata` de Tesseract, sin variantes de cuantizacion publicadas) |
| Idiomas soportados | hebreo (`he`) unicamente |
| Licencia | Apache-2.0 (Copyright (c) 2026 HeOCR maintainers) |
| Formato de pesos | Tesseract LSTM `traineddata` (`heocr_oldprint_v1.traineddata`, 3.628.595 bytes, sha256 `f8090760b5b02d09cf4ddb435e7a5e34089f6f17cde9cfb6c67fd06c6f17ec02`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas LSTM entrenado con CTC, empaquetado en el formato `traineddata` de Tesseract. Se entrenó con Tesseract 5.5.3 (compilado desde su etiqueta upstream) y solo funciona con el motor LSTM (`--oem 1`), sin motor legacy. Parte de HeOCR R7 (`heocr_r7.traineddata`, sha256 `95faab81fba6fe57f854f973c1ccad2b0d1059fb951f34b17277385ceea8b303`), que a su vez es un fine-tune del `heb.traineddata` de tessdata_best en el commit `e12c65a` (Apache-2.0). El conjunto de caracteres es el de R7 sin cambios: el de `heb` estándar más el maqaf `־` y el guion largo `–`.

El entrenamiento consistió en una pasada sobre 76.946 líneas en una lista barajada con semilla 20261130 (`phist_r7.list`): 22.910 líneas escaneadas reales de 4 libros de dominio público (escaneos de Internet Archive, etiquetados con la transcripción de Project Ben-Yehuda de la misma edición), 14.036 líneas escaneadas reales de 3 ediciones rabínicas (etiquetadas con textos de dominio público de Sefaria y el ebook #43740 de Project Gutenberg) y 40.000 líneas renderizadas de folletos digitales de leyes y reglamentos de Israel (Reshumot), etiquetadas con la capa de texto del editor y reproducidas para no perder la impresión moderna. Ninguna etiqueta es salida de OCR. No se documenta uso de RLHF ni DPO, algo que no aplica a este tipo de modelo.

## Capacidades

- Reconocimiento de texto hebreo impreso antiguo en escritura cuadrada sin niqqud: libros de los siglos XIX y principios del XX y ediciones rabínicas en tipo cuadrado.
- OCR de página completa delegando la maquetación en Tesseract (los resultados de audit2 se obtuvieron con páginas completas a `--psm 3`).
- Reconocimiento de líneas sueltas de impresión hebrea (evaluado a `--psm 7`).
- Sustitución directa del modelo `heb` estándar o de HeOCR R7 en flujos Tesseract existentes.
- Integración en el pipeline documental `heocr` como paso específico de impresión antigua.
- Escritura del maqaf `־` (U+05BE) donde muchos textos usan `-`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento: es exclusivamente un motor de OCR.

## Casos de uso

- Digitalización de libros hebreos del siglo XIX y principios del XX: se pasa cada página escaneada a Tesseract con `--psm 3` y este `traineddata`, obteniendo una transcripción con un CER de desarrollo del 16,75 % en audit2, unos 3,5 puntos mejor que el modelo `heb` estándar.
- Procesamiento de ediciones rabínicas en tipo cuadrado: el modelo se entrenó específicamente con 14.036 líneas de 3 ediciones rabínicas etiquetadas con textos de Sefaria y Gutenberg, por lo que cubre convenciones tipográficas de ese corpus.
- Segmentación de pipelines documentales mixtos: en `heocr` se enruta la impresión antigua a este modelo y la moderna a modern-v1, de modo que un archivo con ambos tipos de material se procesa con el reconocedor adecuado por página o por región.
- Investigación en OCR de hebreo histórico: sirve como línea base reproducible para impresión antigua, con registro de entrenamiento (`oldprint_v1_training_run.json`) y experimento publicado en `hocrsyngen/experiments/phist_v1/`.
- Reconocimiento de líneas aisladas en herramientas de anotación o corrección: a `--psm 7` permite transcribir recortes de línea de libros antiguos para generar borradores que un revisor humano corrige después.
- Migración de instalaciones Tesseract existentes: al ser un `traineddata` estándar, se coloca en el directorio de datos y se invoca con `-l heocr_oldprint_v1`, sin cambios en el código de integración más allá de la ruta y el nombre de idioma.
- Extracción de texto de material de dominio público para corpus lingüísticos: al entrenarse solo con etiquetas de transcripciones humanas y textos de dominio público, encaja en proyectos que reutilizan obras libres de derechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay puntuación de test: el conjunto de test P-hist de HeOCR aún no tiene referencias. Las cifras siguientes son de conjuntos de desarrollo y deben tratarse como orientativas.

| Conjunto | Metrica | oldprint-v1 | HeOCR R7 | `heb` estandar |
|---|---|---|---|---|
| audit2 (38 paginas de 13 libros, psm 3) | CER | 16,75 % | 18,33 % | 20,26 % |
| 12 conjuntos de lineas de impresion real | CER | mejor que stock en los 12 (3,2 a 10,7 puntos) | mejor en 9 de 12 | referencia |
| T4 (PDF escaneados con capa de texto erronea) | CER | 3,92 % | no disponible | 2,87 % |
| T5 (PDF solo imagen) | CER | 5,13 % | no disponible | 4,22 % |
| Tablas escaneadas | CER | 2,89 % | no disponible | 1,58 % |

En audit2 el modelo fue seleccionado entre 20 candidatos, por lo que la cifra es optimista; frente al modelo estándar, el intervalo de confianza al 95 % sobre libros, −3,51 [−6,10, +0,30], todavía incluye 0.

## Requisitos de hardware

- VRAM: no aplica; Tesseract ejecuta el reconocimiento en CPU y el fichero de modelo ocupa 3,6 MB en disco.
- GPU: no necesaria. El modelo no está pensado para aceleración por GPU y la model card no documenta soporte CUDA.
- GPU de consumo: irrelevante para este modelo; cualquier CPU moderna es suficiente.
- Despliegue: Tesseract 4 o 5 (entrenado con 5.5.3), invocación `tesseract page.png out -l heocr_oldprint_v1 --tessdata-dir DIR --psm 3`, o mediante el pipeline `heocr` con `heocr --download-model heocr_oldprint_v1`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: `--tessdata-dir` reemplaza el directorio de datos de Tesseract; los formatos de salida distintos de texto plano leen sus ficheros de configuración de `DIR/configs`, por lo que hay que enlazar esa carpeta o instalar el modelo en el directorio tessdata de la instalación.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | CER (desarrollo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeOCR oldprint-v1 | LSTM CTC en Tesseract, impresion antigua | he | no aplica | 16,75 % en audit2 | Apache-2.0 | Hugging Face, 0 descargas |
| HeOCR R7 | LSTM CTC en Tesseract, predecesor | he | no aplica | 18,33 % en audit2 | Apache-2.0 (heredada) | Hugging Face / Zenodo |
| tessdata_best `heb` | LSTM CTC en Tesseract, generico | he | no aplica | 20,26 % en audit2 | Apache-2.0 | Repositorio tessdata_best |
| HeOCR modern-v1 | LSTM CTC en Tesseract, impresion moderna | he | no aplica | mejor en T4/T5 y tablas que oldprint-v1 | Apache-2.0 | Hugging Face |

La comparación con modelos transformer de OCR no es directa: oldprint-v1 es un componente de Tesseract, no un modelo de imagen a texto de extremo a extremo, y no se dispone de datos que permitan compararlo con esa familia.

## Limitaciones y advertencias

- No es apto para documentos de oficina modernos, formularios ni tablas: en los conjuntos sintéticos abiertos de HeOCR rinde peor que el `heb` estándar (T4 3,92 % frente a 2,87 %; T5 5,13 % frente a 4,22 %; tablas 2,89 % frente a 1,58 %). Para esos casos debe usarse modern-v1.
- No reconoce escritura rashi ni otras escrituras no cuadradas; todas las líneas de entrenamiento son tipo cuadrado.
- No reconoce manuscritos.
- No reconoce niqqud (puntos vocálicos) ni cantilación; las etiquetas no los contienen.
- No puede escribir determinados caracteres: geresh `׳`, gershayim `״`, raya `—` ni letras latinas. Las etiquetas de entrenamiento escribían `׳ ״` como `' "` y `—` como `–`.
- Escribe el maqaf `־` (U+05BE) donde muchos textos usan `-`; hay que plegarlo si el texto de destino usa la forma ASCII.
- No hay puntuación de test: todas las cifras son de desarrollo y la de audit2 es optimista por selección entre 20 candidatos; el intervalo de confianza frente al modelo estándar incluye 0.
- Riesgo de alucinación y errores de transcripción: la model card advierte explícitamente contra la transcripción no supervisada y recomienda revisar la salida.
- Sesgos: no documentados en la información proporcionada; al entrenarse con corpus históricos y rabínicos, la cobertura tipográfica fuera de esos dominios es incierta.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las obligaciones de atribución de tessdata_best y deben conservarse los ficheros LICENSE, NOTICE y NOTICE.r7.
- Solo hebreo: no hay soporte multilingüe ni detección de idioma.
- Modelo de nicho con cero descargas y cero likes: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-oldprint-v1-tesseract-heb
- Modelo base HeOCR R7 (Zenodo): https://doi.org/10.5281/zenodo.24126449
- tessdata_best `heb` (commit de referencia): https://github.com/tesseract-ocr/tessdata_best/tree/e12c65a915945e4c28e237a9b52bc4a8f39a0cec
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract
- Pipeline HeOCR: https://github.com/HeOCR/heocr
- Motor HeOCR: https://github.com/HeOCR/heocr-engine
- Experimento phist_v1: https://github.com/HeOCR/hocrsyngen/tree/main/experiments/phist_v1
