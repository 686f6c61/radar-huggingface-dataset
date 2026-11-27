# iapp/OpenThai2.0-OCR-Text

## Resumen

OpenThai2.0-OCR-Text es un sistema OCR (reconocimiento óptico de caracteres) para texto impreso en tailandés e inglés, desarrollado por iApp Technology dentro del proyecto OpenThai (anteriormente OpenThaiGPT) y publicado con pesos abiertos junto a su runtime. El repositorio, aunque conserva el nombre OpenThai2.0-OCR-Text, aloja en la actualidad la versión OpenThai2.1-OCR-Text-20261118 (v2.1.4), que mantiene los ficheros de modelo de v2.0.0 con un runtime nuevo y, desde 2.1.2, un segundo reconocedor para fuentes tailandesas sin bucle (loopless). Es el motor que hay detrás de iApp Document OCR v3.0.

El sistema combina un detector PP-OCRv6-tiny (1,8 MB) con un reconocedor CTC de líneas en tailandés entrenado por iApp (2,4 MB). Ambos se distribuyen como modelos ONNX que se ejecutan sobre OpenVINO u ONNX Runtime, exclusivamente en CPU. El rendimiento declarado es de aproximadamente 0,5 segundos de CPU por página A4 densa, lo que equivale a unas 950 páginas por minuto en 8 núcleos Xeon.

La relevancia del modelo radica en su enfoque: OCR de alta velocidad para tailandés impreso sin necesidad de GPU, con mejoras específicas para libros antiguos (marcas de tono flotantes), maquetación multicolumna, fuentes modernas sin bucle y preservación de dígitos y puntos decimales en contextos sensibles como recibos e identificadores fiscales. Devuelve el texto en orden de lectura con una caja y una confianza por línea, pero no genera tablas ni Markdown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv6-tiny + reconocedor CTC de líneas en tailandés (red propia de iApp) |
| Parametros totales | No disponible (pesos: detector 1,8 MB, reconocedor 2,4 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa líneas de texto, no secuencias de contexto) |
| Tipos de cuantizacion | No disponible (se distribuye como modelos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable sobre OpenVINO u ONNX Runtime) |

## Arquitectura y entrenamiento

El sistema es un pipeline OCR clásico de detección y reconocimiento. La etapa de detección emplea PP-OCRv6-tiny, un detector de cajas de texto de 1,8 MB. La etapa de reconocimiento usa un modelo CTC de líneas entrenado por iApp (2,4 MB) para tailandés. En la versión 2.1.2 se añade un segundo reconocedor (`rec2.onnx`), la misma red entrenada además con fuentes sin bucle, que solo se invoca cuando la primera lectura contiene letras latinas dentro de una palabra tailandesa; la segunda lectura se conserva únicamente si reduce el número de esas letras. Las líneas sin esa señal no se releen.

No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. Sí se documentan innovaciones de post-proceso destacables: la relectura de líneas de libros antiguos para recuperar marcas de tono flotantes (se adjuntan las cajas de marcas a su línea y se amplía el recorte para releerla), la lectura columna a columna en páginas de dos y tres columnas, la distinción entre listas y columnas de prosa (2.1.1), la detección de fuentes sin bucle mediante el segundo reconocedor (2.1.2) y la conservación de celdas de tabla de un solo dígito o letra (2.1.3). Una relectura nunca altera un dígito, lo que protege recibos e identificadores fiscales.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés a partir de imágenes de página.
- Detección de líneas con caja delimitadora y puntuación de confianza por línea.
- Devolución del texto en orden de lectura.
- Lectura columna a columna en páginas de dos y tres columnas, incluidas páginas con título o pie que cruza las columnas.
- Distinción entre listas (lectura fila a fila) y prosa en columnas (lectura columna a columna).
- Recuperación de marcas de tono y vocales superiores flotantes en libros impresos antiguos (década de 1930).
- Lectura de fuentes tailandesas modernas sin bucle (Kanit, Prompt, Sukhumvit Set) sin confundirlas con letras latinas.
- Conservación de celdas de tabla de un solo dígito o letra y de puntos decimales en importes.
- Ejecución exclusiva en CPU sobre OpenVINO u ONNX Runtime.
- No genera tablas ni Markdown (para ello remite a OpenThai2.1-OCR-Markdown-20261118).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Digitalización masiva de libros antiguos tailandeses: la relectura de líneas con marcas de tono flotantes reduce el error de caracteres del 21,5 % al 5,9 % en la página de prueba de 1935, y eleva la tasa de palabras halladas en diccionario del 86,5 % al 93,2 % en el libro completo de 416 páginas.
- Procesamiento de recibos y documentos fiscales: la garantía de que una relectura nunca cambia un dígito, con recall de campos sin cambios en 600 recibos reales de NECTEC y sin variación media en 400 páginas sintéticas, lo hace apto para extracción de importes e identificadores.
- Digitalización de publicaciones oficiales: en el Royal Gazette alcanza una precisión de 96,3 tras la corrección de orden de listas en 2.1.1.
- Procesamiento de documentos judiciales: lecturas estables en escaneos de juzgados (96,84 en la versión 2.1.2), con corrección de sellos de fecha de margen.
- Indexación y búsqueda de corpus periodísticos multicolumna: la lectura columna a columna en páginas de dos y tres columnas facilita la extracción ordenada de texto para motores de búsqueda.
- Despliegue en servidores sin GPU: con unos 0,5 segundos de CPU por página A4 densa y unas 950 páginas por minuto en 8 núcleos Xeon, permite digitalizar grandes volúmenes en infraestructura CPU convencional.
- Digitalización de material con tipografía moderna: la detección de fuentes sin bucle reduce las letras latinas espurias de 58 a 11 en 12 páginas con cuatro fuentes no vistas en entrenamiento.

## Benchmarks y rendimiento

| Prueba | v2.0.0 | v2.1 / v2.1.x |
|---|---|---|
| Página 324 (libro de 1935): tasa de error de caracteres | 21,5 % | 5,9 % |
| Página 324: marcas de tono perdidas (de 159) | 128 | 23 |
| Página 324, seis versiones (original y cinco tratamientos en blanco y negro): error | 20,9–21,5 % | 5,2–6,2 % |
| Libro completo de 416 páginas: palabras halladas en diccionario tailandés | 86,5 % | 93,2 % |
| Libros antiguos (Wikisource, 200 páginas de prueba): precisión | 77,1 | 78,8 |
| ThaiOCRBench páginas completas: precisión | 82,0 (v2.0.0) / 83,8 (2.1.1) | 84,1 (2.1.2) |
| SEA-DocBench tailandés | 54,1 | 55,5 |
| Royal Gazette | 96,3 (2.1.0 bajó a 96,1) | 96,3 (2.1.1) |
| Letras latinas espurias, 12 páginas en 4 fuentes no entrenadas | — | 58 (2.1.1) → 11 (2.1.2) |
| Tasa de error de caracteres en esas páginas | — | 0,58 % (2.1.1) → 0,33 % (2.1.2) |
| Letras latinas espurias, Sukhumvit Set a 40/26/32 px | — | 14/20/5 (2.1.1) → 1/2/0 (2.1.2) |
| Líneas en inglés y tailandés+inglés: error (fuentes no vistas / vistas) | — | 3,06/3,19 % (2.1.1) → 2,58/2,54 % (2.1.2) |
| Media impresa en 12 conjuntos: precisión | — | 88,2 (2.1.1) → 88,3 (2.1.2) |
| Sentencias judiciales | — | 96,88 (2.1.1) → 96,84 (2.1.2) |

Las 22 condiciones de robustez se superan en todas las versiones documentadas.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se documenta soporte de GPU.
- Modelos ligeros: detector de 1,8 MB y reconocedor de 2,4 MB, más un segundo reconocedor en 2.1.2.
- Rendimiento declarado: aproximadamente 0,5 segundos de CPU por página A4 densa; unas 950 páginas por minuto en 8 núcleos Xeon.
- Las páginas de libros antiguos tardan entre un 15 % y un 30 % más porque sus líneas se leen dos veces.
- Despliegue mediante ONNX Runtime u OpenVINO.
- No se documentan requisitos de VRAM ni modelos de GPU recomendados al no ser un sistema orientado a GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Ejecución | Notas |
|---|---|---|---|---|---|
| OpenThai2.1-OCR-Text | OCR detección + reconocimiento | th, en | Apache 2.0 | CPU (ONNX/OpenVINO) | Motor de iApp Document OCR v3.0; ~950 páginas/min en 8 núcleos Xeon |
| OpenThai2.1-OCR-Markdown-20261118 | OCR con salida Markdown | th, en | No disponible en la información | No disponible | Mismo proyecto; genera tablas y Markdown, capacidad que este modelo no cubre |
| Alternativas OCR de propósito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo reconoce texto impreso en tailandés e inglés; no se documentan otros idiomas.
- No genera tablas ni Markdown; para esa funcionalidad remite a OpenThai2.1-OCR-Markdown-20261118.
- No se documentan sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación no documentado; al ser un sistema OCR, el riesgo principal es de error de reconocimiento, no de generación libre.
- Problema no resuelto: la sara am (ำ) de la fuente Thonburi a tamaños grandes, que no implica letras latinas.
- En sentencias judiciales, la versión 2.1.2 baja ligeramente de 96,88 a 96,84 porque el texto de referencia de la prueba no incluye sellos de fecha.
- Las páginas de libros antiguos requieren más tiempo de proceso (15–30 % adicional) por la doble lectura de líneas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime y de los modelos auxiliares distribuidos junto al modelo.
- El repositorio conserva el nombre OpenThai2.0-OCR-Text aunque aloja la versión 2.1.4; para reproducibilidad debe fijarse `revision="v2.1.4"` o `revision="v2.0.0"` según corresponda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Text
- Modelo Markdown relacionado: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Guía paso a paso (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía paso a paso (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía paso a paso (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Recursos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Libro de prueba en archive.org: `unset00002427` (archive.org)
