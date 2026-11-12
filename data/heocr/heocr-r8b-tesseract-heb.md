# HeOCR/heocr-r8b-tesseract-heb

## Resumen

HeOCR R8b es un modelo de reconocimiento de texto impreso en hebreo para el motor OCR Tesseract, distribuido como fichero `traineddata` (3.633.477 bytes) y no como pesos de red neuronal en formato convencional. Lo desarrolla el proyecto HeOCR y se obtiene continuando el entrenamiento de HeOCR R7, que a su vez es un ajuste fino del modelo `heb` oficial de `tessdata_best`. El modelo resuelve la transcripcion de lineas de texto hebreo impreso en escritura cuadrada sin niqqud, con especial enfasis en impresos modernos (boletines oficiales, legislacion) y en tipografia de libros de los siglos XIX y principios del XX.

La relevancia de esta version radica en dos cambios concretos: mejora la tasa de error de caracter (CER) frente a R7 en el conjunto de desarrollo de lineas escaneadas de Reshumot (del 2,934 % al 2,129 %, y del 1,320 % al 0,735 % en el subconjunto con doble lectura de etiquetas) y amplia el juego de caracteres con geresh (׳), gershayim (״) y raya em (—), que R7 no puede emitir. No obstante, el autor advierte explicitamente de que R8b no sustituye a R7: empeora en escaneos pequenos, oscuros y con grano, como la copia de las obras completas de Brainin en Internet Archive (0,743 % CER frente al 0,635 % de R7).

El modelo es un reconocedor LSTM a nivel de linea entrenado con CTC; la segmentacion de pagina y el analisis de maquetacion los realiza Tesseract, no el modelo. Se distribuye bajo licencia Apache-2.0 y solo soporta hebreo. No existe todavia una puntuacion de test revisada por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM a nivel de linea con CTC (motor de reconocimiento de Tesseract 4/5, `--oem 1`, solo LSTM, sin motor legacy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento de linea, no modelo generativo) |
| Tipos de cuantizacion | no disponible (formato `traineddata` propietario de Tesseract; no se publican variantes cuantizadas) |
| Idiomas soportados | hebreo (`he`) unicamente; el juego de caracteres no incluye letras latinas |
| Licencia | Apache-2.0, Copyright (c) 2026 HeOCR maintainers |
| Formato de pesos | Tesseract 4/5 LSTM `traineddata` (`heocr_r8b.traineddata`, entrenado como `heb.traineddata`), 3.633.477 bytes, sha256 `8cb22dbeb195c3c0ffbe9c66cf956d8c2052d3b1c4a872234a85c975c4526117` |

## Arquitectura y entrenamiento

El modelo es un reconocedor de secuencia LSTM entrenado con Connectionist Temporal Classification (CTC) sobre imagenes de linea, integrado en el pipeline de Tesseract. No procesa paginas completas de forma nativa: Tesseract realiza la deteccion de layout y la segmentacion en lineas, y el modelo transcribe cada linea. Se entreno y probo con Tesseract 5.5.3 y solo funciona con el motor LSTM (`--oem 1`).

El entrenamiento continuo el checkpoint de HeOCR R7 durante una pasada sobre 196.275 lineas: 158.104 lineas escaneadas reales de 45 libros de dominio publico (8 escaneos de la Biblioteca Nacional de Israel y 37 de Internet Archive), etiquetadas con la transcripcion de Project Ben-Yehuda de la misma edicion; 19.533 lineas renderizadas de 48 folletos nativos digitales de legislacion israeli (Reshumot), etiquetadas con la capa de texto del editor; 11 lineas de una pagina corregida de Wikisource hebreo; y 18.627 lineas sinteticas. El autor afirma que ninguna etiqueta procede de salida OCR. El conjunto de desarrollo que decidio la release es un conjunto plateado (silver) de 3.254 lineas de folletos Reshumot escaneados (1953-2003), no un conjunto de test.

## Capacidades

- Reconocimiento de texto impreso en hebreo moderno en escritura cuadrada sin niqqud, incluidos boletines oficiales y tipografia de libros de los siglos XIX y principios del XX.
- Reconocimiento de lineas sueltas de texto hebreo impreso, por ejemplo lineas localizadas por un segmentador externo (modo `--psm 13`).
- Emision de geresh (׳), gershayim (״) y raya em (—), ausentes en R7.
- Emision del maqaf (־, U+05BE) y de signos de puntuacion hebreos.
- Combinacion con otros modelos de Tesseract mediante la sintaxis habitual (`-l heocr_r8b+eng`), aunque esa combinacion no fue evaluada.
- Salida en texto plano en orden logico de lectura, y en otros formatos (`tsv`, `hocr`, `pdf`, `alto`) si se copian los ficheros de configuracion de Tesseract al directorio de datos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general ni audio: es exclusivamente un motor OCR.

## Casos de uso

- Digitalizacion de boletines oficiales y legislacion israeli: el modelo se entreno especificamente con lineas de Reshumot y reduce el CER en ese dominio, por lo que es adecuado para pipelines de conversion masiva de PDF escaneados a texto buscable.
- Recuperacion de texto en libros de dominio publico de los siglos XIX y principios del XX: los conjuntos de seleccion retenidos (libros de la decada de 1920 y de la de 1880) muestran CER del 0,757 % y del 1,019 %, lo que lo hace util para bibliotecas digitales que necesitan texto indexable.
- Sustitucion del modelo `heb` oficial de Tesseract en instalaciones existentes: al ser un `traineddata` compatible, se puede desplegar cambiando el fichero y la etiqueta de idioma, sin reescribir el pipeline.
- Reconocimiento de lineas aisladas en sistemas con segmentacion propia: integrado con `--psm 13` sobre recortes de linea generados por un segmentador externo, apropiado para arquitecturas OCR por etapas.
- Linea base de investigacion en OCR hebreo: permite comparar recetas de entrenamiento y conjuntos de datos frente a R7 y frente a `tessdata_best`, con registros de entrenamiento publicados (`r8b_training_run.json`).
- Procesamiento de documentos con puntuacion hebrea especifica: la ampliacion del juego de caracteres permite transcribir correctamente abreviaturas con geresh y gershayim, habituales en texto legal y religioso moderno no vocalizado.
- Extraccion de texto en flujos de archivo y preservacion digital: al ser un binario de 3,6 MB sin dependencias de GPU, se puede ejecutar en servidores de bajo coste o en contenedores ligeros junto a Tesseract.

## Benchmarks y rendimiento

Los datos publicados son tasas de error de caracter (CER) sobre conjuntos de desarrollo y de seleccion, no sobre un test independiente. El autor advierte que el conjunto de desarrollo decidio la release y que los margenes en los libros de seleccion son optimistas porque tambien eligieron el checkpoint.

| Conjunto | Lineas | CER R7 | CER R8b | Notas |
|---|---|---|---|---|
| Reshumot escaneado (dev plateado) | 3.254 | 2,934 % | 2,129 % | Intervalos de confianza excluyen el cero |
| Reshumot escaneado (subconjunto con doble lectura) | 2.028 | 1,320 % | 0,735 % | Etiquetas confirmadas por dos lecturas |
| Libro de seleccion, decada de 1920 | no disponible | 0,848 % | 0,757 % | Margen optimista |
| Libro de seleccion, decada de 1880 | no disponible | 1,336 % | 1,019 % | Margen optimista |
| Obras completas de Brainin (Internet Archive) | no disponible | 0,635 % | 0,743 % | R8b empeora; escaneo pequeno, oscuro y con grano |

No hay puntuacion de test revisada por humanos. R8b no se ha evaluado sobre las 38 paginas E2d4c que reportan las fichas de R6 y R7. La precision sobre paginas completas no se midio.

## Requisitos de hardware

- El modelo es un `traineddata` de 3,6 MB ejecutado por Tesseract: no requiere GPU y funciona en CPU.
- VRAM estimada para inferencia: no aplica; el consumo de memoria es el del proceso de Tesseract (del orden de decenas o cientos de MB segun el tamano de imagen y el numero de hilos).
- GPU recomendadas: no aplica; Tesseract no usa aceleracion GPU de forma nativa.
- Cabe en cualquier GPU consumer y en hardware de gama baja, pero no la aprovecha; el cuello de botella es la CPU.
- Opciones de despliegue: binario de Tesseract 4 o 5 (probado con 5.5.3), invocado por CLI o mediante wrappers como pytesseract, tesserocr o el motor HeOCR/heocr-engine.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del numero de lineas por pagina, la resolucion y los hilos de CPU configurados.
- Para formatos de salida distintos de texto plano hay que copiar o enlazar el directorio `configs` de la instalacion de Tesseract en el directorio de datos, ya que `--tessdata-dir` sustituye el directorio de datos completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | CER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeOCR R8b | LSTM CTC (Tesseract) | no disponible (3,6 MB de fichero) | no aplica | 2,129 % en Reshumot dev; 0,757 % y 1,019 % en libros de seleccion | Apache-2.0 | Hugging Face |
| HeOCR R7 | LSTM CTC (Tesseract) | no disponible | no aplica | 2,934 % en Reshumot dev; 0,848 % y 1,336 % en libros de seleccion; 0,635 % en Brainin | Apache-2.0 | Hugging Face y Zenodo (10.5281/zenodo.24126449) |
| Tesseract `heb` (tessdata_best) | LSTM CTC (Tesseract) | no disponible | no aplica | no disponible en esta ficha | Apache-2.0 | GitHub (tessdata_best, commit `e12c65a`) |

La comparacion con modelos neuronales de OCR de pagina completa (tipo TrOCR, Donut o Kraken) no esta disponible en la informacion proporcionada, y el autor indica que R8b se publica de forma independiente, sin vinculo con el pipeline Kraken de HeOCR (R4d, A1, R3h).

## Limitaciones y advertencias

- Solo reconoce escritura cuadrada impresa sin niqqud; el comportamiento sobre texto vocalizado no se ha medido.
- No soporta escritura manual ni escritura rashi u otras variantes no cuadradas; la receta excluyo el conjunto de lineas rabinicas que se probo en un segundo brazo experimental.
- El juego de caracteres no incluye letras latinas; las lineas de Reshumot con caracteres latinos se excluyeron del entrenamiento.
- No es una transcripcion no supervisada fiable: el autor recomienda revisar la salida.
- Empeora frente a R7 en escaneos pequenos, oscuros y con grano; para ese tipo de material puede ser preferible R7.
- No hay puntuacion de test revisada por humanos ni evaluacion de precision sobre paginas completas; todas las cifras proceden de conjuntos de desarrollo o de seleccion, con riesgo de sobreajuste a esos conjuntos.
- La combinacion con otros idiomas (`-l heocr_r8b+eng`) funciona pero no se ha evaluado.
- En recortes de linea no debe usarse `--psm 7`: con `heb` oficial y con R6 devolvia texto vacio en recortes que contenian una franja de la linea vecina; se recomienda `--psm 13`.
- `--tessdata-dir` sustituye el directorio de datos de Tesseract, lo que rompe los formatos de salida que dependen de `configs` si no se copian.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de LICENSE y NOTICE; el modelo base `heb` de tessdata_best tambien es Apache-2.0.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de sustituciones y omisiones de caracteres en escaneos de baja calidad, sin mecanismo de confianza calibrado publicado.
- Sesgos: no se documentan sesgos linguisticos o de dominio, pero el entrenamiento esta dominado por material israeli moderno (Reshumot) y libros de dominio publico, lo que puede penalizar otras variedades tipograficas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-r8b-tesseract-heb
- Modelo base HeOCR R7 en Hugging Face: https://huggingface.co/HeOCR/heocr-r7-tesseract-heb
- Deposito Zenodo de R7: https://doi.org/10.5281/zenodo.24126449
- Codigo del motor HeOCR: https://github.com/HeOCR/heocr-engine
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract
- Modelo `heb` de tessdata_best (commit `e12c65a`): https://github.com/tesseract-ocr/tessdata_best/tree/e12c65a915945e4c28e237a9b52bc4a8f39a0cec
- Project Ben-Yehuda: no disponible en la informacion proporcionada
- Internet Archive: no disponible en la informacion proporcionada
- Biblioteca Nacional de Israel: no disponible en la informacion proporcionada
