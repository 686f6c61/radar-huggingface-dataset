# agamyasamuel/telugu-ocr-ft

## Resumen

Telugu OCR Line Model (fine-tuned) es un modelo especializado en reconocimiento óptico de caracteres (OCR) a nivel de línea para texto telugu, un idioma dravídico hablado principalmente en el estado indio de Andhra Pradesh y Telangana. Lo desarrolla el usuario agamyasamuel como un ajuste fino (fine-tuning) del modelo base harsha-desaraju/telugu-ocr-model, entrenado sobre 1.868 líneas reales de libros telugu alineadas, procedentes de 15 libros de dominio público o con licencia Creative Commons. El checkpoint publicado corresponde a la época 4 del entrenamiento.

El modelo resuelve un problema concreto: la transcripción automática de líneas de texto telugu escaneadas, con una mejora medible respecto al modelo base. Según la model card, reduce la tasa de error de carácter (CER) de 0,0667 a 0,0514 (una mejora del 23 %) y la tasa de error de palabra (WER) de 0,500 a 0,389 (mejora del 22 %) sobre páginas reservadas para evaluación. Es relevante para proyectos de digitalización de patrimonio bibliográfico en lenguas indic, donde los OCR genéricos rinden mal por la complejidad del alfabeto telugu.

El modelo tiene 81.259.657 parámetros (unos 81 millones) y un peso de 311 MB en safetensors, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware modesto. La licencia es MIT, lo que facilita su uso comercial. No se dispone de información pública sobre la longitud de contexto, la arquitectura exacta ni los datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo con código propio, `modeling_telugu_ocr.py`; especializado en OCR de línea) |
| Parámetros totales | 81.259.657 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 311 MB) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo más allá de que emplea código propio (`modeling_telugu_ocr.py` y `configuration_telugu_ocr.py`) y un tokenizador específico (`tokenization_telugu_ocr.py`). Por el tamaño (81 millones de parámetros) y la tarea (OCR de línea), se trata de un modelo compacto orientado a la transcripción de imágenes de líneas de texto, no a la generación libre de texto. El pipeline declarado en Hugging Face no está disponible, lo que sugiere que requiere carga con `trust_remote_code=True` y uso mediante la API de `AutoModel`/`AutoTokenizer`.

El ajuste fino se realizó sobre 1.868 líneas de texto telugu alineadas, extraídas de 15 libros de dominio público o con licencia Creative Commons, según la model card. El checkpoint publicado es el de la época 4. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en un modelo de OCR de este tamaño). El proyecto de procedencia es Open Book Map (Indic-Book-Metadata-Extractor), y la model card remite a `learnings/030-telugu-line-finetune-results.md` para el procedimiento de entrenamiento y evaluación, documento no incluido en la información proporcionada.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) a nivel de línea para texto telugu.
- Transcripción de líneas de libros escaneados en escritura telugu.
- Modelo especializado en una única tarea y un único idioma; no es un modelo generativo de propósito general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: limitadas al telugu (etiqueta de idioma `te`).
- No se documentan modos especiales como thinking mode, visión general o audio; la entrada es una imagen de línea de texto y la salida es la transcripción.

## Casos de uso

- Digitalización de libros telugu de dominio público: el modelo transcribe líneas de páginas escaneadas y permite construir corpus de texto searchable a partir de fondos bibliográficos, con una CER del 5,14 % que reduce la corrección manual necesaria.
- Extracción de metadatos bibliográficos: integrado en el proyecto Indic-Book-Metadata-Extractor, permite leer líneas de portada, lomo o páginas de créditos para poblar catálogos de bibliotecas.
- Creación de corpus lingüísticos para investigación: al transcribir texto telugu con WER del 38,9 %, sirve como base para estudios de lingüística computacional y entrenamiento de modelos de lenguaje en telugu, siempre con revisión humana.
- Preservación de patrimonio cultural: digitalización de publicaciones periódicas y libros antiguos telugu en archivos y universidades, donde los OCR comerciales genéricos fallan por la complejidad del alfabeto.
- Automatización de flujos de catalogación en bibliotecas: procesamiento por lotes de imágenes de líneas con un modelo de 81 millones de parámetros que cabe en CPU o GPU modesta, reduciendo el coste frente a soluciones en la nube.
- Búsqueda full-text sobre archivos escaneados: indexación del texto transcrito para habilitar búsqueda por palabras clave en colecciones digitalizadas de libros telugu.
- Preprocesamiento para pipelines de traducción o análisis: generar transcripciones intermedias que alimenten modelos de traducción telugu-inglés o análisis de contenido, asumiendo una tasa de error que requiere post-edición.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de la model card sobre páginas reservadas para evaluación, comparando el modelo base con el ajuste fino:

| Métrica | Modelo base | Fine-tuned | Variación |
|---|---|---|---|
| CER (tasa de error de carácter) | 0,0667 | 0,0514 | −23 % |
| WER (tasa de error de palabra) | 0,500 | 0,389 | −22 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable en un modelo especializado en OCR y no en razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 81 millones de parámetros en safetensors (311 MB en fp32), la inferencia en fp32 requiere aproximadamente 0,3 GB de VRAM; en fp16, alrededor de 0,16 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para procesamiento por lotes.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al requerir código propio es probable que no sean directamente compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el modelo base del que deriva:

| Modelo | Parámetros | Contexto | CER | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| agamyasamuel/telugu-ocr-ft | 81,26 M | no disponible | 0,0514 | 0,389 | MIT | Hugging Face |
| harsha-desaraju/telugu-ocr-model (base) | no disponible | no disponible | 0,0667 | 0,500 | no disponible | Hugging Face |

No se conocen en la información disponible otras alternativas comparables de OCR para telugu (como modelos de Tesseract entrenados para telugu o soluciones comerciales) con datos de rendimiento verificables.

## Limitaciones y advertencias

- Modelo de un solo idioma (telugu) y una sola tarea (OCR de línea); no debe emplearse para generación de texto, razonamiento ni otras tareas.
- La WER del 38,9 % implica que más de una de cada tres palabras presenta errores; en producción es necesario un paso de corrección humana o post-procesamiento, especialmente en textos con tipografía compleja o degradada.
- El conjunto de evaluación es reducido (páginas reservadas de 15 libros), por lo que las métricas pueden no generalizar a otros dominios tipográficos, manuscritos o documentos modernos.
- Riesgo de alucinación: en un modelo de OCR, el equivalente es la generación de caracteres o palabras plausibles pero ausentes en la imagen, especialmente en líneas de baja calidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_telugu_ocr.py` antes de desplegarlo en entornos de producción.
- La licencia MIT permite uso comercial, pero el modelo base (harsha-desaraju/telugu-ocr-model) podría tener condiciones distintas; no se dispone de información sobre su licencia en la documentación proporcionada.
- No se documentan sesgos específicos, pero al entrenarse sobre 15 libros de dominio público, el modelo puede reflejar el estilo y la tipografía de ese corpus concreto y fallar en otras variantes gráficas del telugu.
- No se dispone de información sobre el pipeline de Hugging Face ni sobre compatibilidad con frameworks de inferencia estándar, lo que puede complicar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agamyasamuel/telugu-ocr-ft
- Modelo base: https://huggingface.co/harsha-desaraju/telugu-ocr-model
- Proyecto de procedencia: Open Book Map (Indic-Book-Metadata-Extractor); no se proporciona URL directa en la información disponible.
- Documento de entrenamiento y evaluación: `learnings/030-telugu-line-finetune-results.md` (referenciado en la model card; no se proporciona URL directa).
