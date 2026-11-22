# moganai/MoganOCR-TR

## Resumen

MoganOCR-TR es un modelo de visión-lenguaje especializado en OCR y comprensión de documentos, desarrollado por el equipo de moganai (Aleyna Tasdemir, Furkan Yilmaz y Muhammed Faruk Gozay). Se trata de un fine-tune completo de Qwen/Qwen3.5-2B, incluyendo el codificador visual, entrenado sobre 357.763 páginas de las cuales el 77% son turcas. El modelo recibe una imagen de página y devuelve el contenido completo en orden de lectura como Markdown, con tablas en HTML y fórmulas en LaTeX.

Su relevancia radica en que es un modelo de solo 2.213 millones de parámetros que, según la model card, alcanza 89,9 puntos en TurkishOCR-Bench (cuarto de 18 modelos y primero entre los modelos específicos de OCR), por delante de modelos generales cientos de veces más grandes. Incorpora además una cabeza MTP (multi-token prediction) entrenada específicamente para el modelo que acelera la decodificación especulativa en vLLM.

El modelo está pensado para pipelines de digitalización documental en turco e inglés, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en Qwen3.5-2B con codificador visual; fine-tune completo |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `mtp.safetensors` para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo image-text-to-text construido sobre Qwen3.5-2B, con el codificador visual incluido en el fine-tune. El procesador acepta imágenes de hasta 4.194.304 píxeles por defecto, de modo que una página A4 a 200 dpi entra sin reescalar y consume aproximadamente 3.800 tokens visuales. El prompt de inferencia es fijo: `Sayfayı markdown olarak yaz.` ("Escribe la página como markdown"), con decodificación greedy, thinking desactivado (valor por defecto de la plantilla de chat) y hasta 8.000 tokens nuevos.

El entrenamiento se realizó sobre 357.763 páginas, de las cuales el 77% son turcas. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable es la inclusión de una cabeza MTP entrenada para este modelo, que habilita decodificación especulativa en vLLM con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`, con una aceleración de 1,73× en peticiones individuales y 1,22× con 64 peticiones concurrentes sobre RTX PRO 6000.

## Capacidades

- OCR de página completa: transcribe todo el contenido visible en orden de lectura, incluyendo números de página, notas al pie y marcas de agua.
- Salida estructurada en Markdown: un párrafo por línea y unión de palabras cortadas por guion al final de línea.
- Tablas en HTML `<table>` con celdas combinadas representadas mediante `rowspan` y `colspan`.
- Fórmulas en LaTeX, tanto en línea (`$...$`) como en bloque (`$$...$$`).
- Detección y marcado de encabezados y pies de página repetidos mediante `<header>...</header>` y `<footer>...</footer>`.
- Transcripción de manuscrito tal como está escrito, sin corregir las faltas de ortografía del autor.
- Procesamiento de documentos escaneados, incluyendo boletines oficiales antiguos (ejemplo de 2001 en la model card).
- Capacidades multilingües limitadas a turco e inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización de boletines oficiales: el modelo transcribe páginas escaneadas del Boletín Oficial turco, incluidas digitalizaciones antiguas, preservando el orden de lectura y el marcado de encabezados y pies de página, lo que facilita la indexación y búsqueda posterior.
- Extracción de tablas financieras y administrativas: convierte tablas complejas con celdas combinadas en HTML con `rowspan` y `colspan`, apto para alimentar pipelines de extracción de datos estructurados sin post-procesado manual de la estructura.
- Conversión de artículos académicos a Markdown: procesa páginas con fórmulas en bloque y en línea, generando LaTeX listo para publicarse en sistemas de documentación técnica o repositorios tipo wiki.
- Procesamiento de facturas y formularios: al transcribir todo el contenido visible en orden de lectura, permite extraer campos de recibos, facturas y formularios para sistemas de contabilidad o gestión documental.
- Accesibilidad documental: la salida Markdown estructurada puede alimentar lectores de pantalla y motores de texto a voz para hacer accesibles documentos turcos escaneados.
- Digitalización de libros y manuscritos: la transcripción literal del manuscrito, sin corrección ortográfica, es adecuada para archivos y estudios filológicos que necesitan fidelidad al original.
- Ingesta en RAG sobre corpus turco: la salida en Markdown con tablas y fórmulas preservadas permite trocear y vectorizar documentos turcos manteniendo la estructura semántica.

## Benchmarks y rendimiento

Según la model card, MoganOCR-TR obtiene una puntuación TOB de 89,9 en TurkishOCR-Bench, cuarto de 18 modelos y primero entre los modelos específicos de OCR. En texto turco exclusivamente queda segundo, solo por detrás de GPT-6.1 Sol. El benchmark consta de 488 páginas difíciles de 368 documentos en 10 categorías (académico, tabla, fórmula, escaneado, Boletín Oficial antiguo y nuevo, libro, recibo/factura/formulario, diapositiva y manuscrito), con verdad de referencia verificada por humanos y 115.116 pruebas unitarias. La métrica principal es TOB = (Text_TR + Table + Formula) / 3, con tablas evaluadas por TEDS, fórmulas en bloque por CDM y Text_TR como media geométrica de precisión en pruebas unitarias y usabilidad de página en texto turco.

No se han publicado en la información disponible los valores numéricos desglosados por categoría ni los resultados individuales de los otros 17 modelos. Las páginas del benchmark se eligieron por ser difíciles para los modelos, por lo que las puntuaciones comparan modelos y no representan la precisión esperable en un documento medio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo para pesos (2.213 millones de parámetros), más memoria para el codificador visual, caché KV y hasta 8.000 tokens de salida; el repo ocupa 4,6 GB.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bfloat16 con margen amplio; GPUs de 8-12 GB podrían requerir cuantización, no documentada en la información disponible.
- GPUs recomendadas para producción: RTX PRO 6000 (usada en las mediciones de MTP), A100 y H100 para despliegues con alta concurrencia.
- Despliegue con vLLM: comando documentado `vllm serve moganai/MoganOCR-TR --max-model-len 32768 --limit-mm-per-prompt '{"image": 1, "video": 0}'`.
- Despliegue con transformers: `AutoModelForImageTextToText` y `AutoProcessor` en bfloat16 con `device_map="auto"`.
- Aceleración con MTP: en vLLM con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`; 1,73× más rápido en peticiones individuales y 1,22× con 64 peticiones concurrentes sobre RTX PRO 6000.
- No se documentan opciones para llama.cpp, Ollama ni TGI en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganOCR-TR | 2,21 B | 32.768 tokens | OCR especializado turco/inglés | Apache 2.0 | Hugging Face, transformers, vLLM |
| GPT-6.1 Sol | no disponible | no disponible | Modelo general | propietaria | API (según la model card, primero en texto turco) |
| Qwen/Qwen3.5-2B | 2 B (aprox.) | no disponible | Modelo base multimodal general | no disponible en la información | Hugging Face |
| Otros 16 modelos de TurkishOCR-Bench | no disponible | no disponible | generales y OCR | no disponible | no disponible |

La model card indica que MoganOCR-TR supera en TOB a modelos generales cientos de veces más grandes y queda por detrás de GPT-6.1 Sol únicamente en texto turco. No se dispone de los nombres ni las cifras individuales del resto de participantes del benchmark en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de repetición: en algunas páginas el modelo puede quedarse repitiendo el mismo texto hasta alcanzar el límite de tokens; la model card sugiere `repetition_penalty=1.15` como mitigación (los resultados publicados se obtuvieron sin ella).
- Sesgo de evaluación: el modelo fue construido por el mismo equipo que creó TurkishOCR-Bench; aunque se verificó que no hubiera solapamiento entre entrenamiento y benchmark y todos los modelos se puntúan con reglas deterministas, existe un conflicto de interés inherente.
- Cobertura lingüística limitada a turco e inglés; no se documenta rendimiento en otras lenguas.
- El prompt de inferencia es fijo (`Sayfayı markdown olarak yaz.`); no se documenta comportamiento con otras instrucciones.
- Transcripción literal del manuscrito sin corrección ortográfica, lo que puede no ser deseable en flujos que esperan texto normalizado.
- Thinking debe permanecer desactivado (valor por defecto de la plantilla de chat); no se documenta el efecto de activarlo.
- No se documentan tipos de cuantización ni formatos GGUF, lo que limita el despliegue en hardware de gama baja sin conversión manual.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluación de sesgos sociales del modelo base.
- No se publican cifras de benchmarks desglosadas por categoría ni comparativas numéricas con modelos concretos, más allá del ranking TOB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark TurkishOCR-Bench (Space): https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Apoyo al autor: https://buymeacoffee.com/moganai
- Cita: Tasdemir, A., Yilmaz, F., Gozay, M. F. (2026). *MoganOCR-TR and TurkishOCR-Bench: A Vision-Language OCR Model and Page-Level Evaluation Set for Turkish Document Parsing*.
