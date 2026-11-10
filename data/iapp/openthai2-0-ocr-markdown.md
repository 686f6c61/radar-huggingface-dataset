# iapp/OpenThai2.0-OCR-Markdown

## Resumen

OpenThai2.0-OCR-Markdown es un modelo de visión-lenguaje especializado en el reconocimiento óptico de caracteres (OCR) y la conversión de documentos a Markdown, desarrollado por el usuario iapp y publicado en Hugging Face. Se trata de un ajuste fino (finetune) del modelo nvidia/Nemotron-3.5-Parse, sobre el que se ha aplicado entrenamiento adicional orientado a documentos en tailandés e inglés. El modelo resuelve el problema de digitalizar documentos complejos (texto, tablas y estructura) preservando el formato en Markdown, una tarea crítica para pipelines de extracción de datos y RAG sobre documentos escaneados.

Con 630.800.504 parámetros (aproximadamente 0,63 mil millones), se sitúa en la categoría de modelos compactos, lo que facilita su despliegue en hardware modesto. La arquitectura declarada es `nemotron_parse` (image-text-to-text), lo que indica un modelo multimodal que recibe imágenes de documentos y emite texto estructurado. El soporte se limita a tailandés (th) e inglés (en), lo que lo hace especialmente relevante para el ecosistema documental tailandés, un nicho poco cubierto por los modelos OCR generalistas.

Su relevancia actual radica en la combinación de un tamaño reducido, licencia openmdw-1.1 (una licencia abierta de NVIDIA) y especialización en tablas y estructura Markdown. No obstante, el acceso está restringido (gated) en Hugging Face y el repositorio no registra descargas ni interacciones, lo que sugiere una publicación muy reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_parse (image-text-to-text, vision-lenguaje) |
| Parametros totales | 630.800.504 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se detallan variantes GGUF/AWQ) |
| Idiomas soportados | th (tailandés), en (inglés) |
| Licencia | openmdw-1.1 (acceso gated, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 10,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en nvidia/Nemotron-3.5-Parse, del que hereda la arquitectura `nemotron_parse`. Se trata de un modelo de imagen-a-texto (vision-lenguaje) diseñado para el parseo de documentos: recibe una imagen de página y genera una representación textual estructurada, incluyendo Markdown y tablas. El ajuste fino realizado por iapp adapta este modelo base al dominio de documentos tailandeses e ingleses, aunque no se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La etiqueta `custom_code` indica que la carga del modelo requiere código personalizado más allá de la librería estándar de transformers, lo que implica revisar el `trust_remote_code` y las dependencias específicas del repositorio. No se han publicado detalles sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos en tailandés e inglés.
- Conversión de documentos a Markdown, preservando estructura de párrafos, encabezados y listas.
- Extracción y reconstrucción de tablas en formato Markdown.
- Procesamiento de imagen-a-texto en modo conversacional (etiqueta `conversational`), lo que permite interacción por turnos.
- Soporte multilingüe limitado a tailandés e inglés.
- Capacidad de parseo de documentos (`document-parsing`) orientada a la digitalización estructurada.
- No se dispone de información sobre tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte escaneos de formularios y documentos oficiales en Markdown estructurado, facilitando su indexación en sistemas de gestión documental.
- Extracción de tablas financieras: permite reconstruir tablas de informes contables o extractos en Markdown, listas para su carga en hojas de cálculo o bases de datos.
- Pipelines de RAG sobre documentos escaneados: al generar Markdown limpio, el texto resultante puede dividirse en fragmentos y vectorizarse para búsqueda semántica, aprovechando el soporte nativo de tailandés.
- Procesamiento de documentación técnica bilingüe (th/en): útil en empresas tailandesas con documentación mixta, donde el modelo maneja ambos idiomas en una sola pasada.
- Automatización de ingesta en archivos y bibliotecas: conversión masiva de PDFs escaneados a Markdown para preservar contenido y estructura sin intervención manual.
- Preprocesamiento para OCR en entornos con recursos limitados: su tamaño de 0,63 mil millones de parámetros permite desplegarlo en GPU de consumo, adecuado para equipos pequeños o despliegues en el borde.
- Normalización de contratos y documentos legales: la salida en Markdown facilita la revisión y el diff de versiones en flujos de trabajo jurídicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (630,8 M de parámetros), en FP16 requeriría aproximadamente 1,3 GB solo para pesos, más memoria para el codificador visual y activaciones; en cuantización de 8 bits podría situarse en torno a 0,7-1 GB, y en 4 bits alrededor de 0,4-0,6 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: al usar `custom_code` y arquitectura `nemotron_parse`, se requiere transformers con `trust_remote_code=True`; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| OpenThai2.0-OCR-Markdown | 630,8 M | no disponible | th, en | openmdw-1.1 | Gated |
| nvidia/Nemotron-3.5-Parse (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas OCR open source (p. ej. modelos tipo Donut/Tesseract) | variable | no disponible | variable | variable | Abierto |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Idiomas limitados a tailandés e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado métricas de precisión (CER/WER) ni benchmarks de OCR, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación y de errores de transcripción en documentos de baja calidad, manuscritos o tablas complejas, inherente a los modelos de imagen-a-texto.
- Requiere código personalizado (`custom_code`), lo que añade complejidad de integración y posibles problemas de compatibilidad con versiones de transformers.
- Licencia openmdw-1.1: deben revisarse sus términos para uso comercial; el autor la etiqueta como `license:other`, por lo que conviene verificar las condiciones exactas.
- Sin descargas ni validación comunitaria: no hay evidencia pública de uso en producción ni informes de terceros.
- No se dispone de información sobre sesgos específicos del ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Organización IAPP (referencia, no relacionada con el autor del modelo): https://iapp.org/
