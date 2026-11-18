# iapp/OpenThai2.1-OCR-Text-20261118

## Resumen

OpenThai2.1-OCR-Text-20261118 es un sistema OCR de texto impreso para tailandés e inglés desarrollado por iApp Technology (anteriormente OpenThaiGPT) en el marco del proyecto OpenThai, lanzado junto con AIEAT. No es un modelo generativo de lenguaje, sino un pipeline de dos etapas —detección de líneas y reconocimiento de texto— empaquetado como modelos ONNX para ejecución en CPU mediante OpenVINO o ONNX Runtime. Es el motor que hay detrás de iApp Document OCR v3.0 y se publica con pesos abiertos y su runtime.

El sistema combina un detector PP-OCRv6-tiny de 1,8 MB con un reconocedor CTC de líneas en tailandés entrenado por iApp de 2,4 MB. Devuelve el texto de una imagen de página en orden de lectura, con una caja delimitadora y una puntuación de confianza por línea. Su relevancia radica en el rendimiento: aproximadamente 0,5 segundos de CPU por página A4 densa, lo que equivale a unas 950 páginas por minuto en 8 núcleos Xeon, sin necesidad de GPU.

La versión 2.1.4 (18 de noviembre de 2026) mantiene los ficheros de modelo de v2.0.0 con un runtime nuevo y añade mejoras incrementales: recuperación de marcas de tono flotantes en libros tailandeses antiguos, lectura por columnas en páginas de dos y tres columnas, tratamiento de fuentes tailandesas sin bucle (Kanit, Prompt, Sukhumvit Set) y conservación de celdas de tabla con un solo dígito o letra. No genera tablas ni Markdown; para eso existe un modelo hermano específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR: detector PP-OCRv6-tiny + reconocedor CTC de líneas (red propia de iApp) |
| Parametros totales | No disponible (pesos de 1,8 MB el detector y 2,4 MB el reconocedor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa líneas de texto, no secuencias de contexto) |
| Tipos de cuantizacion | No disponible (modelos ONNX ya optimizados para CPU) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con OpenVINO o ONNX Runtime) |

## Arquitectura y entrenamiento

El sistema es un pipeline clásico de OCR en dos fases. La primera fase es un detector de texto PP-OCRv6-tiny de 1,8 MB que localiza las líneas en la imagen de la página. La segunda es un reconocedor CTC de líneas en tailandés de 2,4 MB, entrenado por iApp, que transcribe cada recorte de línea. Ambos se distribuyen como modelos ONNX y se ejecutan exclusivamente en CPU mediante OpenVINO u ONNX Runtime.

La versión 2.1 incorpora varias innovaciones técnicas notables. Para los libros tailandeses antiguos de imprenta (década de 1930), donde las marcas de tono y vocales superiores flotan muy por encima de las consonantes, el detector generaba cajas separadas para esas marcas que luego se descartaban; v2.1 las adjunta a su línea correspondiente, amplía el recorte para incluirlas y relee la línea. Además, v2.1 lee páginas de dos y tres columnas columna a columna (incluidas las que tienen título o pie que cruza las columnas), y desde 2.1.1 distingue listas de columnas de prosa cuando las líneas a ambos lados empiezan de forma similar (nombres, cargos, "etiqueta : valor" o números), leyendo las listas fila a fila. Desde 2.1.2 se añade un segundo reconocedor (`rec2.onnx`, la misma red entrenada también con fuentes sin bucle) que solo se activa cuando la primera lectura contiene letras latinas dentro de una palabra tailandesa, y se conserva únicamente si reduce esas letras. La versión 2.1.3 corrige las celdas de tabla con un solo dígito o letra. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés a partir de imágenes de página.
- Detección de líneas con caja delimitadora y puntuación de confianza por línea.
- Devolución del texto en orden de lectura, incluyendo páginas de dos y tres columnas leídas columna a columna.
- Recuperación de marcas de tono flotantes en libros tailandeses antiguos de imprenta.
- Lectura de fuentes tailandesas modernas sin bucle (Kanit, Prompt, Sukhumvit Set) sin confundirlas con letras latinas.
- Conservación de celdas de tabla con un solo dígito o una sola letra.
- Escritura correcta de puntos decimales en importes.
- Distinción entre listas (lectura fila a fila) y prosa en columnas (lectura columna a columna).
- Ejecución exclusiva en CPU, sin GPU.
- No genera tablas ni Markdown (para ello existe OpenThai2.1-OCR-Markdown-20261118).

## Casos de uso

- Digitalización masiva de libros tailandeses antiguos: el sistema recupera marcas de tono que otras versiones perdían (en la página 324 de un libro de 1935, la tasa de error de carácter baja del 21,5 % al 5,9 % y las marcas de tono perdidas pasan de 128 a 23 de 159), lo que lo hace adecuado para proyectos de preservación documental.
- Procesamiento de recibos y facturas: la relectura nunca altera un dígito, por lo que los números de recibo e identificadores fiscales se conservan (400 páginas sintéticas de recibos sin cambios de media y 600 recibos reales de NECTEC con recall de campo sin cambios).
- Digitalización de documentos del Royal Gazette: mantiene el orden de fila en las listas de comités (precisión del 96,3 %), lo que permite extraer nombres y cargos correctamente.
- Procesamiento de sentencias judiciales: mantiene una precisión del 96,84 % y corrige sellos de fecha en los márgenes que antes se leían mal ("12 ก.H. 2560" pasa a "12 ก.ค. 2560").
- Digitalización de documentos presupuestarios y páginas de múltiples columnas: la lectura columna a columna mejora la precisión en páginas completas de ThaiOCRBench (de 82,0 a 83,8) y en SEA-DocBench Thai (de 54,1 a 55,5).
- Procesamiento de documentos con fuentes modernas sin bucle: reduce las letras latinas espurias de 58 a 11 en 12 páginas con 4 fuentes no vistas en entrenamiento, con una tasa de error de carácter del 0,33 %.
- Despliegue en servidores sin GPU: con aproximadamente 0,5 segundos de CPU por página A4 densa y unas 950 páginas por minuto en 8 núcleos Xeon, es viable para pipelines de digitalización de alto volumen en infraestructura convencional.

## Benchmarks y rendimiento

| Prueba | v2.0.0 | v2.1 (2.1.4) |
|---|---|---|
| Página 324 del tester: tasa de error de carácter | 21,5 % | 5,9 % |
| Página 324: marcas de tono perdidas (de 159) | 128 | 23 |
| Página 324, seis versiones (original y cinco tratamientos en blanco y negro): tasa de error | 20,9–21,5 % | 5,2–6,2 % |
| Libro completo de 416 páginas: palabras halladas en el diccionario tailandés | 86,5 % | 93,2 % |
| Libros antiguos (Wikisource, 200 páginas de prueba): precisión | 77,1 | 78,8 |
| ThaiOCRBench páginas completas: precisión | 82,0 | 84,1 |
| SEA-DocBench Thai: precisión | 54,1 | 55,5 |
| Royal Gazette: precisión | — | 96,3 |
| Sentencias judiciales: precisión | — | 96,84 |
| Letras latinas espurias, 12 páginas en 4 fuentes no entrenadas | — | 11 (frente a 58 en 2.1.1) |
| Tasa de error de carácter en esas páginas | — | 0,33 % (frente a 0,58 % en 2.1.1) |
| Letras latinas espurias, Sukhumvit Set a 40/26/32 px | — | 1 / 2 / 0 (frente a 14 / 20 / 5 en 2.1.1) |
| Líneas en inglés y tailandés+inglés: tasa de error (fuentes no vistas / vistas) | — | 2,58 / 2,54 % (frente a 3,06 / 3,19 % en 2.1.1) |
| Conjunto de 12 pruebas impresas: precisión media | — | 88,3 (frente a 88,2 en 2.1.1) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje generativo.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- VRAM estimada: no aplica (0 GB de VRAM).
- GPU recomendadas: no aplica.
- Cabe en cualquier CPU convencional; el rendimiento de referencia es de aproximadamente 0,5 segundos de CPU por página A4 densa en 8 núcleos Xeon (unas 950 páginas por minuto).
- Opciones de despliegue: ONNX Runtime u OpenVINO (runtime propio del modelo).
- Latencia y throughput: aproximadamente 0,5 s por página A4 densa; las páginas de libros antiguos tardan entre un 15 % y un 30 % más porque sus líneas se leen dos veces.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Ejecución | Notas |
|---|---|---|---|---|---|
| OpenThai2.1-OCR-Text-20261118 | OCR detector + reconocedor CTC | th, en | Apache 2.0 | CPU (ONNX/OpenVINO) | Pesos de 1,8 MB + 2,4 MB; ~950 páginas/min en 8 núcleos Xeon |
| OpenThai2.1-OCR-Markdown-20261118 | OCR con salida Markdown | th, en | No disponible | No disponible | Modelo hermano del mismo proyecto para generar tablas y Markdown |
| PP-OCRv6-tiny | Detector de texto | No disponible | No disponible | No disponible | Componente detector usado dentro de este pipeline |

No se dispone de información sobre otros modelos OCR comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo reconoce texto impreso en tailandés e inglés; no cubre otros idiomas.
- No genera tablas ni Markdown; para eso hay que usar el modelo hermano OpenThai2.1-OCR-Markdown-20261118.
- No corregido: el sara am (ำ) de la fuente Thonburi a tamaños grandes, que no implica letras latinas y por tanto no activa la relectura con el segundo reconocedor.
- La relectura de líneas en libros antiguos incrementa el tiempo de proceso entre un 15 % y un 30 %.
- El reconocedor secundario (`rec2.onnx`) solo se activa ante letras latinas dentro de palabras tailandesas; otras confusiones de fuentes no vistas podrían no corregirse.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica en OCR) ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- El repositorio figura con un tamaño de 0,0 GB, coherente con los pesos ligeros, pero conviene verificar la integridad de los ficheros al desplegar.
- Para producción, fijar la revisión `revision="v2.1.4"` si se quiere mantener esta versión concreta; v2.0.0 sigue disponible con `revision="v2.0.0"`.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Text-20261118
- Modelo hermano (Markdown): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Guía paso a paso (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía paso a paso (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía paso a paso (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Libro de prueba en archive.org: `unset00002427` (archive.org)
