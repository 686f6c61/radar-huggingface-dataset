# iapp/OpenThai2.1-OCR-Text-20261118

## Resumen

OpenThai2.1-OCR-Text-20261118 es un sistema OCR especializado en texto impreso en tailandés e inglés, desarrollado por iApp Technology dentro del proyecto OpenThai (anteriormente OpenThaiGPT), con el apoyo de AIEAT. No es un modelo generativo de lenguaje, sino un pipeline de dos etapas (detección de líneas y reconocimiento CTC) empaquetado en ONNX y optimizado para ejecución en CPU mediante OpenVINO u ONNX Runtime. Es el motor que impulsa iApp Document OCR v3.0 y se publica con pesos abiertos y runtime incluido.

La relevancia del modelo radica en su eficiencia: procesa una página A4 densa en aproximadamente 0,5 segundos de CPU, lo que equivale a unas 950 páginas por minuto en 8 núcleos Xeon. El detector es PP-OCRv6-tiny (1,8 MB) y el reconocedor es una red CTC entrenada por iApp (2,4 MB), lo que da un peso total mínimo y permite despliegue en entornos sin GPU.

La versión 2.1.4 (18 de noviembre de 2026) incorpora mejoras específicas para libros tailandeses antiguos de imprenta (conservación de marcas de tono flotantes), lectura por columnas en páginas de dos y tres columnas, reconocimiento de fuentes tailandesas sin bucle (Kanit, Prompt, Sukhumvit Set) mediante un segundo reconocedor, y preservación de celdas de tabla con un solo dígito o letra. El modelo no genera Markdown ni tablas estructuradas; para ello existe una variante separada (OpenThai2.1-OCR-Markdown-20261118).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv6-tiny + reconocedor CTC de líneas (red neuronal convolucional/recurrente, detalles no disponibles) |
| Parametros totales | No disponible (pesos: detector 1,8 MB, reconocedor 2,4 MB, segundo reconocedor rec2.onnx de tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa líneas de texto, no secuencias de contexto) |
| Tipos de cuantizacion | No disponible (modelos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con OpenVINO u ONNX Runtime) |

## Arquitectura y entrenamiento

El sistema se compone de un detector de líneas de texto PP-OCRv6-tiny y un reconocedor CTC de líneas entrenado por iApp. La inferencia se realiza exclusivamente en CPU, con modelos ONNX ejecutados sobre OpenVINO o ONNX Runtime. La versión 2.1.2 añade un segundo reconocedor (`rec2.onnx`), basado en la misma red pero entrenado también con fuentes tailandesas sin bucle, que se activa condicionalmente cuando la primera lectura contiene letras latinas dentro de una palabra tailandesa.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo OCR discriminativo). Las innovaciones técnicas documentadas incluyen: relectura de líneas con marcas de tono flotantes adjuntando cajas de marcas a su línea y ampliando el recorte; lectura por columnas en páginas multicolumna; detección de listas por similitud de inicio de línea para preservar el orden por filas; y relectura condicional con el segundo reconocedor solo ante indicios de letras latinas espurias.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés a partir de imágenes de página.
- Detección de líneas de texto con caja delimitadora y puntuación de confianza por línea.
- Devolución del texto en orden de lectura.
- Lectura por columnas en páginas de dos y tres columnas, incluyendo páginas con título o pie que cruza columnas.
- Conservación de marcas de tono y vocales superiores flotantes en libros tailandeses antiguos de imprenta.
- Reconocimiento de fuentes tailandesas sin bucle (Kanit, Prompt, Sukhumvit Set) sin confundirlas con letras latinas similares.
- Preservación de celdas de tabla con un solo dígito o una sola letra.
- Escritura correcta de puntos decimales en importes.
- Estabilidad numérica: la relectura no altera dígitos, preservando números de recibo e identificadores fiscales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de Markdown o tablas estructuradas.

## Casos de uso

- Digitalización masiva de libros tailandeses antiguos: el modelo conserva las marcas de tono flotantes de la imprenta de los años treinta, con una tasa de error de caracteres del 5,9 % en la página 324 del libro de prueba de 1935 (frente al 21,5 % de la v2.0.0), lo que lo hace adecuado para proyectos de preservación documental.
- Procesamiento de recibos y documentos fiscales: la relectura no modifica dígitos y mantiene el recall de campos en 600 recibos reales de NECTEC, por lo que es apto para extracción de importes e identificadores fiscales.
- Digitalización de publicaciones oficiales (Royal Gazette): la lectura por filas de listas preserva el orden de nombres y cargos, con una precisión del 96,3 % en el benchmark correspondiente.
- Procesamiento de documentos presupuestarios y administrativos: la lectura por columnas y la preservación de celdas de tabla con dígitos únicos facilitan la extracción de datos tabulares simples.
- OCR de documentos judiciales escaneados: mantiene una precisión del 96,84 % en el conjunto de sentencias judiciales, con corrección de sellos de fecha en el margen.
- Despliegue en entornos sin GPU: al ejecutarse solo en CPU con OpenVINO u ONNX Runtime, permite procesar aproximadamente 950 páginas por minuto en 8 núcleos Xeon, adecuado para servidores de digitalización de bajo coste.
- Procesamiento de documentos mixtos tailandés-inglés: con tasas de error del 2,58 % en fuentes no vistas y 2,54 % en fuentes vistas para líneas en inglés y tailandés+inglés.

## Benchmarks y rendimiento

| Prueba | v2.0.0 | v2.1.4 |
|---|---|---|
| Página 324 (libro de 1935): tasa de error de caracteres | 21,5 % | 5,9 % |
| Página 324: marcas de tono perdidas (de 159) | 128 | 23 |
| Página 324, seis versiones (original y cinco tratamientos B/N): error | 20,9–21,5 % | 5,2–6,2 % |
| Libro completo de 416 páginas: palabras halladas en diccionario tailandés | 86,5 % | 93,2 % |
| Libros antiguos (Wikisource, 200 páginas): precisión | 77,1 | 78,8 |
| ThaiOCRBench páginas completas: precisión | 82,0 (v2.1.0) | 84,1 (v2.1.2) |
| SEA-DocBench tailandés | 54,1 (v2.1.0) | 55,5 (v2.1.0 con orden por columnas) |
| Letras latinas espurias, 12 páginas en 4 fuentes no entrenadas | 58 (2.1.1) | 11 (2.1.2) |
| Tasa de error de caracteres en esas páginas | 0,58 % (2.1.1) | 0,33 % (2.1.2) |
| Letras latinas espurias, Sukhumvit Set a 40/26/32 px | 14/20/5 (2.1.1) | 1/2/0 (2.1.2) |
| Líneas inglés y tailandés+inglés: error (fuentes no vistas/vistas) | 3,06/3,19 % (2.1.1) | 2,58/2,54 % (2.1.2) |
| Conjunto impreso de 12 series: precisión media | 88,2 (2.1.1) | 88,3 (2.1.2) |
| Sentencias judiciales: precisión | 96,88 (2.1.1) | 96,84 (2.1.2) |
| Royal Gazette: precisión | 96,3 | 96,3 |

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- Modelos ONNX de pequeño tamaño (detector 1,8 MB, reconocedor 2,4 MB) que caben en cualquier equipo convencional.
- Rendimiento aproximado: 0,5 segundos de CPU por página A4 densa, unas 950 páginas por minuto en 8 núcleos Xeon.
- Las páginas de libros antiguos tardan entre un 15 % y un 30 % más porque sus líneas se leen dos veces.
- Opciones de despliegue: OpenVINO u ONNX Runtime sobre CPU.
- No se dispone de datos de latencia o throughput para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Ejecución | Contexto/página |
|---|---|---|---|---|---|
| OpenThai2.1-OCR-Text-20261118 | OCR (detección + CTC) | th, en | Apache 2.0 | CPU (ONNX/OpenVINO) | No aplica |
| OpenThai2.1-OCR-Markdown-20261118 | OCR con salida Markdown | th, en | No disponible | No disponible | No disponible |
| PP-OCRv6-tiny (componente) | Detector de líneas | No disponible | No disponible | CPU | No aplica |

No se dispone de información sobre otros modelos OCR comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo reconoce texto impreso; no está diseñado para manuscritos ni texto en imágenes complejas no documentadas.
- No genera tablas estructuradas ni Markdown; para ello debe usarse la variante OpenThai2.1-OCR-Markdown-20261118.
- No corrige el sara am (ำ) de la fuente Thonburi a tamaños grandes, limitación reconocida por el autor.
- La relectura de líneas con marcas flotantes puede alterar únicamente las marcas, pero no los dígitos; aun así, conviene validar en dominios no cubiertos por las pruebas.
- El reconocimiento de fuentes sin bucle depende de una relectura condicional; líneas sin indicios de letras latinas espurias no se releen y podrían contener errores en fuentes no vistas.
- Solo soporta tailandés e inglés; otros idiomas no están cubiertos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los componentes de terceros (PP-OCRv6-tiny) si se redistribuyen.
- No se dispone de información sobre sesgos, alucinación (no aplica a OCR discriminativo) ni robustez fuera de las 22 condiciones documentadas.
- El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que puede indicar que los pesos se alojan externamente o que la métrica no está actualizada; conviene verificar la disponibilidad de los archivos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Text-20261118
- Variante Markdown: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Guía de ejecución (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Activos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
