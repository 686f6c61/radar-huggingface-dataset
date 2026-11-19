# iapp/OpenThai2.0-OCR-Text

## Resumen

OpenThai2.0-OCR-Text es un sistema OCR (reconocimiento óptico de caracteres) para texto impreso en tailandés e inglés, desarrollado por iApp Technology en el marco del proyecto OpenThai (anteriormente OpenThaiGPT) y publicado con pesos abiertos junto con su runtime. El repositorio, ahora renombrado internamente como OpenThai2.1-OCR-Text-20261118 (versión 2.1.4), es el motor que impulsa iApp Document OCR v3.0. No es un modelo generativo de lenguaje: es un pipeline de dos etapas compuesto por un detector PP-OCRv6-tiny (1,8 MB) y un reconocedor CTC de líneas entrenado por iApp (2,4 MB), ambos exportados a ONNX y pensados para ejecutarse exclusivamente en CPU mediante OpenVINO u ONNX Runtime.

La propuesta de valor es el rendimiento en hardware modesto: aproximadamente 0,5 segundos de CPU por página A4 densa, lo que equivale a unas 950 páginas por minuto en 8 núcleos Xeon. El modelo devuelve, para cada línea detectada, su caja delimitadora, el texto en orden de lectura y una puntuación de confianza. Está optimizado para documentos tailandeses impresos, incluyendo libros antiguos de imprenta con marcas tonales flotantes, documentos de la Royal Gazette, presupuestos, recibos y digitalizaciones judiciales.

La versión 2.1 introduce mejoras específicas y medibles: recuperación de marcas tonales en libros de los años 30 (de 128 marcas perdidas sobre 159 a solo 23), lectura por columnas en páginas de dos y tres columnas, un segundo reconocedor para tipografías tailandesas sin bucle (Kanit, Prompt, Sukhumvit Set) que evita confusiones con letras latinas, y corrección de celdas de tabla con un solo dígito o letra. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv6-tiny + reconocedor CTC de líneas (red convolucional/recurrente, detalles no especificados) |
| Parámetros totales | no disponible (pesos de 1,8 MB el detector y 2,4 MB el reconocedor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa líneas de texto, no secuencias de lenguaje) |
| Tipos de cuantización | no disponible (modelos ONNX ya optimizados para CPU; no se documentan variantes cuantizadas) |
| Idiomas soportados | tailandés (th) e inglés (en), incluido texto mixto th+en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable sobre OpenVINO u ONNX Runtime) |

## Arquitectura y entrenamiento

El sistema sigue un diseño clásico de OCR en cascada. La primera etapa es un detector PP-OCRv6-tiny de 1,8 MB que localiza las cajas de texto en la imagen de la página. La segunda etapa es un reconocedor CTC de líneas de 2,4 MB entrenado por iApp específicamente para tailandés, que transcribe cada recorte. La versión 2.1.2 añade un segundo reconocedor (`rec2.onnx`, la misma red entrenada también con tipografías sin bucle) que solo se invoca cuando la primera lectura contiene letras latinas incrustadas dentro de una palabra tailandesa, y cuyo resultado solo se conserva si reduce el número de esas letras espurias. Esto preserva el rendimiento en digitalizaciones judiciales, que casi nunca activan la segunda pasada.

El entrenamiento se realizó sobre datos propios de iApp, cuya composición exacta, número de tokens o muestras y uso de técnicas de alineación no se detallan en la información disponible. Sí se documentan los conjuntos de evaluación empleados: ThaiOCRBench (páginas completas), SEA-DocBench Thai, Wikisource (libros antiguos), Royal Gazette, documentos presupuestarios, 400 páginas sintéticas de recibos y 600 recibos reales de NECTEC. La innovación técnica destacable es el post-procesado geométrico de la versión 2.1: las cajas de marcas tonales flotantes se asocian a su línea, se amplía el recorte para incluirlas y se relee la línea, lo que reduce el error de carácter del 21,5 % al 5,9 % en la página 324 del libro de 1935. También se implementa una heurística de orden de lectura que distingue listas (lectura por filas) de columnas de prosa (lectura por columnas) según si las líneas a ambos lados de un hueco empiezan de forma similar.

## Capacidades

- Reconocimiento de texto impreso en tailandés, inglés y texto mixto th+en, devolviendo caja, texto y confianza por línea.
- Detección y transcripción de páginas completas en orden de lectura, con soporte para una, dos y tres columnas, incluidos títulos o pies que cruzan las columnas.
- Recuperación de marcas tonales y vocales superiores flotantes en libros de imprenta antiguos (años 30).
- Lectura de tipografías tailandesas modernas sin bucle (Kanit, Prompt, Sukhumvit Set) sin confundirlas con letras latinas.
- Conservación de celdas de tabla con un solo dígito o una sola letra, y escritura correcta de puntos decimales en importes.
- Estabilidad numérica: una relectura no altera dígitos, por lo que recibos e identificadores fiscales mantienen sus cifras.
- Inferencia exclusiva en CPU mediante OpenVINO u ONNX Runtime, sin requisito de GPU.
- No genera tablas ni Markdown; para esa funcionalidad el autor remite a OpenThai2.1-OCR-Markdown-20261118.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo de imagen a texto especializado.

## Casos de uso

- Digitalización masiva de libros tailandeses antiguos: el pipeline recupera marcas tonales que otros OCR descartan y mejora la tasa de palabras halladas en diccionario del 86,5 % al 93,2 % en un libro completo de 416 páginas, lo que lo hace adecuado para proyectos de preservación en archive.org o bibliotecas nacionales.
- Procesamiento de la Royal Gazette y boletines oficiales: la lectura por filas de listas de comités y la preservación de sellos de fecha en márgenes (por ejemplo, "12 ก.ค. 2560") permiten extraer nombres y cargos sin mezclar columnas, con una precisión reportada del 96,3 %.
- Automatización de cuentas y recibos: al no alterar dígitos en las relecturas y conservar puntos decimales, el modelo sirve para extraer importes e identificadores fiscales de recibos escaneados, con recall de campos sin cambios en 600 recibos reales de NECTEC.
- Digitalización de expedientes judiciales: mantiene un rendimiento del 96,84 % en sentencias y corrige sellos de fecha que antes se leían mal, lo que permite indexar resoluciones judiciales escaneadas en sistemas de gestión documental.
- Extracción de texto de documentos presupuestarios y administrativos con tablas: la conservación de celdas de un solo carácter y la lectura correcta de columnas facilitan la captura de datos estructurados en hojas de cálculo impresas.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con OpenVINO a unas 950 páginas por minuto en 8 núcleos Xeon, es viable en servidores de bajo coste, oficinas sin infraestructura acelerada o dispositivos edge para digitalización de archivos físicos.
- Procesamiento de documentos bilingües th+en: con una tasa de error del 2,54–2,58 % en líneas mixtas, cubre contratos, manuales y formularios con terminología en inglés.

## Benchmarks y rendimiento

| Prueba | v2.0.0 | v2.1 / 2.1.2 / 2.1.4 |
|---|---|---|
| Página 324 (libro de 1935): error de carácter | 21,5 % | 5,9 % |
| Página 324: marcas tonales perdidas (de 159) | 128 | 23 |
| Página 324, seis versiones (original y cinco en blanco y negro): error | 20,9–21,5 % | 5,2–6,2 % |
| Libro completo de 416 páginas: palabras halladas en diccionario tailandés | 86,5 % | 93,2 % |
| Libros antiguos (Wikisource, 200 páginas): precisión | 77,1 | 78,8 |
| ThaiOCRBench páginas completas: precisión | 82,0 | 84,1 (2.1.2) |
| SEA-DocBench Thai | 54,1 | 55,5 |
| Royal Gazette | 96,3 | 96,3 (2.1.1) |
| Sentencias judiciales | 96,88 | 96,84 (2.1.2) |
| Letras latinas espurias, 12 páginas en 4 fuentes no entrenadas | 58 (2.1.1) | 11 (2.1.2) |
| Error de carácter en esas páginas | 0,58 % (2.1.1) | 0,33 % (2.1.2) |
| Letras latinas espurias, Sukhumvit Set a 40/26/32 px | 14/20/5 (2.1.1) | 1/2/0 (2.1.2) |
| Líneas en inglés y th+en, error (fuentes no vistas / vistas) | 3,06 / 3,19 % (2.1.1) | 2,58 / 2,54 % (2.1.2) |
| Media de 12 conjuntos impresos: precisión | 88,2 (2.1.1) | 88,3 (2.1.2) |

No se han publicado resultados de benchmarks comparativos con otros motores OCR (Tesseract, PaddleOCR, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU ni VRAM dedicada.
- Modelos de 1,8 MB (detector) y 2,4 MB (reconocedor), más un segundo reconocedor `rec2.onnx` en la versión 2.1.2 en adelante.
- Rendimiento de referencia: aproximadamente 0,5 segundos de CPU por página A4 densa, unas 950 páginas por minuto en 8 núcleos Xeon.
- Las páginas de libros antiguos tardan entre un 15 % y un 30 % más porque sus líneas se leen dos veces.
- Despliegue mediante OpenVINO o ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Cabe en cualquier equipo de consumo, incluidos portátiles y mini-PC, al no necesitar acelerador gráfico.
- Latencia y throughput detallados por núcleo no disponibles más allá de la cifra agregada indicada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Ejecución | Notas |
|---|---|---|---|---|---|
| OpenThai2.1-OCR-Text | OCR impreso (detector + CTC) | th, en | Apache 2.0 | CPU (OpenVINO/ONNX Runtime) | Optimizado para tailandés antiguo y moderno; pesos muy pequeños |
| OpenThai2.1-OCR-Markdown | OCR a Markdown | th, en | no disponible | no disponible | Mismo ecosistema, añade salida de tablas y Markdown |
| Tesseract | OCR genérico | multilingüe | Apache 2.0 | CPU | No dispone de comparativa publicada en esta información |
| PaddleOCR | OCR genérico | multilingüe | Apache 2.0 | CPU/GPU | No dispone de comparativa publicada en esta información |

No se dispone de datos de rendimiento comparativo con Tesseract, PaddleOCR ni otros motores en la información proporcionada; la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Solo procesa texto impreso; no está diseñado para manuscritos ni para texto en imágenes naturales.
- No genera tablas ni Markdown; para ello debe usarse el modelo OpenThai2.1-OCR-Markdown-20261118.
- El soporte lingüístico se limita a tailandés e inglés; otros idiomas no están cubiertos.
- Persiste un fallo conocido no corregido: la sara am (ำ) de la tipografía Thonburi a tamaños grandes, que no implica letras latinas y por tanto no activa la segunda pasada del reconocedor.
- La corrección de sellos de fecha en sentencias judiciales reduce ligeramente la métrica global (96,88 a 96,84) porque el texto de referencia de la prueba no incluye sellos.
- El orden de lectura por columnas puede confundir listas con columnas de prosa en casos límite; la heurística de la versión 2.1.1 mitiga pero no elimina el riesgo.
- No se documentan sesgos demográficos o culturales del reconocedor; al ser un modelo OCR, el riesgo principal es de error de transcripción, no de generación de contenido.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor recomienda fijar la revisión (`revision="v2.1.4"`) para garantizar la reproducibilidad.
- El repositorio aparece con tamaño de 0,0 GB en Hugging Face, lo que sugiere que los pesos pueden descargarse desde ubicaciones externas o que el tamaño reportado no refleja el contenido real; conviene verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Text
- Modelo Markdown relacionado: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Guía de ejecución (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Activos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Libro de prueba en archive.org: `unset00002427` (archive.org)
