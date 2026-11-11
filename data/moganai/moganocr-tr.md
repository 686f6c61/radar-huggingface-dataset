# moganai/MoganOCR-TR

## Resumen

MoganOCR-TR es un modelo de visión-lenguaje especializado en OCR y comprensión de documentos, desarrollado por el equipo moganai. Se trata de un ajuste fino completo (incluido el codificador visual) de Qwen3.5-2B, con 2.213.241.664 parámetros. Su tarea es convertir una imagen de página en Markdown en orden de lectura, representando tablas como HTML, fórmulas como LaTeX y cabeceras/pies de página con etiquetas `<header>` y `<footer>`.

El modelo está orientado al turco (el 77 % de sus 357.763 páginas de entrenamiento son turcas), aunque declara soporte también para inglés. Es relevante porque demuestra que un modelo de 2B parámetros, entrenado específicamente para una tarea y un idioma, puede competir con modelos generales cientos de veces más grandes: en TurkishOCR-Bench obtiene 88,0, quinto de 18 modelos y primero entre los modelos específicos de OCR.

La arquitectura subyacente es la de Qwen3.5-2B (modelo multimodal image-text-to-text), con licencia Apache 2.0, pesos en safetensors y compatibilidad con transformers y vLLM. El prompt de uso es fijo y en turco ("Sayfayı markdown olarak yaz."), con decodificación greedy y thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en Qwen3.5-2B, ajuste fino completo incluido el codificador visual |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MoganOCR-TR es un ajuste fino completo de Qwen3.5-2B, un modelo multimodal de tipo image-text-to-text, incluyendo el codificador visual. El entrenamiento se realizó sobre 357.763 páginas, de las cuales el 77 % son turcas. Las imágenes se reducen a aproximadamente 1 millón de píxeles (unos 1.000 tokens visuales), que es la resolución con la que se entrenó el modelo.

El modelo genera la página completa en orden de lectura con un formato de salida estructurado: Markdown para texto, encabezados y listas (un párrafo por línea y unión de palabras con guion al final de línea), HTML `<table>` para tablas con `rowspan`/`colspan` para celdas combinadas, LaTeX para fórmulas (en línea con `$...$` y en bloque con `$$...$$`), y etiquetas `<header>`/`<footer>` para cabeceras y pies de página. Transcribe todo lo visible, incluidos números de página, notas al pie y marcas de agua, y respeta la ortografía original de la escritura manual sin corregirla. No se detalla en la información disponible si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- OCR de página completa: convierte una imagen de documento en Markdown en orden de lectura.
- Comprensión de documentos: maneja documentos académicos, tablas, fórmulas, escaneos, boletines oficiales antiguos y nuevos, libros, recibos/facturas/formularios, diapositivas y escritura manual.
- Tablas: salida en HTML `<table>` con celdas combinadas mediante `rowspan` y `colspan`.
- Fórmulas: salida en LaTeX, tanto en línea como en bloque.
- Cabeceras y pies de página: marcados explícitamente con `<header>` y `<footer>`.
- Transcripción literal: incluye números de página, notas al pie, marcas de agua y errores ortográficos de la escritura manual.
- Multilingüe limitado: turco e inglés.
- Integración conversacional: pipeline image-text-to-text con plantilla de chat; thinking desactivado por defecto.
- No se menciona soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Digitalización de boletines oficiales: el modelo puede procesar páginas escaneadas del Boletín Oficial turco (incluidas de 2001) y convertirlas en Markdown estructurado, lo que facilita su indexación y búsqueda posterior.
- Extracción de tablas de documentos académicos: al generar HTML con `rowspan`/`colspan`, permite reconstruir tablas complejas de artículos y conservar la estructura de celdas combinadas en bases de datos o visores.
- Conversión de fórmulas a LaTeX: adecuado para digitalizar literatura científica y técnica, generando fórmulas en línea y en bloque listas para su uso en editores LaTeX o sistemas de publicación.
- Procesamiento de facturas, recibos y formularios: el modelo está entrenado con esta categoría de documentos, por lo que puede transcribir campos y contenido visible a Markdown para su posterior validación o extracción.
- Reconocimiento de escritura manual: transcribe manuscritos tal como están escritos, sin corregir errores, lo que resulta útil en archivos históricos o documentos personales donde se requiere fidelidad literal.
- Digitalización de libros y diapositivas: con contexto de 32.768 tokens y hasta 8.000 tokens de salida, puede volcar páginas completas de libros o diapositivas en un solo paso.
- Pipeline de OCR en producción con vLLM: el modelo se sirve con `vllm serve` y una API compatible con OpenAI, lo que permite integrarlo en flujos de ingesta documental a escala con decodificación greedy y temperatura 0 para resultados deterministas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| TurkishOCR-Bench (TOB) | 88,0 (5.º de 18 modelos; 1.º entre modelos específicos de OCR; 3.º en texto turco solo) |
| Intervalo de confianza al 95 % (TOB) | 85,7–89,9 |

TurkishOCR-Bench consta de 488 páginas difíciles de 368 documentos en 10 categorías (académico, tablas, fórmulas, escaneado, Boletín Oficial antiguo y nuevo, libro, recibo/factura/formulario, diapositiva, escritura manual), con verdad de referencia verificada por humanos y 115.116 pruebas unitarias. La puntuación principal TOB = (Text_TR + Table + Formula) / 3, donde las tablas se miden con TEDS, las fórmulas en bloque con CDM y Text_TR como media geométrica de la precisión en pruebas unitarias y la usabilidad de página en texto turco. La diferencia con DeepSeek-v4.1-flash, una posición por encima, no es estadísticamente significativa. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.213 millones de parámetros en bfloat16, el peso de los pesos ronda los 4,4 GB (tamaño del repositorio), a lo que hay que sumar la caché KV y el procesamiento de imagen.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: probable por el tamaño de 2B parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: vLLM (`vllm serve moganai/MoganOCR-TR --max-model-len 32768 --limit-mm-per-prompt '{"image": 1, "video": 0}'`) y Transformers (`AutoModelForImageTextToText` con `dtype="bfloat16"` y `device_map="auto"`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en TurkishOCR-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganOCR-TR | 2,21 B | 32.768 | 88,0 (TOB) | Apache 2.0 | Hugging Face |
| DeepSeek-v4.1-flash | No disponible | No disponible | Una posición por encima (diferencia no significativa) | No disponible | No disponible |
| Modelos generales del benchmark (16 restantes) | Hasta cientos de veces mayores | No disponible | Por debajo o alrededor de MoganOCR-TR según el ranking | No disponible | No disponible |

La información proporcionada solo detalla el ranking de 18 modelos en TurkishOCR-Bench sin desglosar nombres, parámetros ni licencias de los competidores, salvo la mención a DeepSeek-v4.1-flash. No hay datos suficientes para una comparativa más detallada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos; el entrenamiento está dominado por turco (77 %), lo que puede limitar el rendimiento en otros idiomas.
- Riesgo de alucinación: no se cuantifica; como modelo generativo, puede producir transcripciones incorrectas en páginas fuera de distribución.
- Limitaciones de idioma: solo declara turco e inglés; no se garantiza calidad en otras lenguas.
- Limitaciones de contexto: el prompt es fijo y en turco ("Sayfayı markdown olarak yaz."); se recomienda thinking desactivado, decodificación greedy y hasta 8.000 tokens nuevos.
- Resolución: las páginas se reducen a aproximadamente 1 millón de píxeles (unos 1.000 tokens visuales); documentos con texto muy pequeño podrían perder detalle.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de Qwen3.5-2B como modelo base.
- Caveat de evaluación: las páginas de TurkishOCR-Bench se eligieron por ser difíciles, por lo que las puntuaciones no reflejan la precisión esperable en un documento medio; además, el equipo que construyó el benchmark es el mismo que entrenó el modelo, aunque se verificó que no hubiera solapamiento con el conjunto de entrenamiento y se publican las salidas crudas de los 18 modelos.
- Formato de salida rígido: cualquier contenido visible se transcribe literalmente, incluidos errores ortográficos de la escritura manual, lo que puede no ser deseable en todos los flujos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark TurkishOCR-Bench (Space): https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Apoyo al autor (Buy Me a Coffee): https://buymeacoffee.com/moganai
- Cita: Tasdemir, Yilmaz y Gozay (2026), "MoganOCR-TR and TurkishOCR-Bench: A Vision-Language OCR Model and Page-Level Evaluation Set for Turkish Document Parsing".
