# bodhan-ai/indic-ocr

## Resumen

bodhan-ai/indic-ocr es un modelo de OCR y análisis de documentos desarrollado por Bodhan AI, con contribuciones de AI4Bharat. Está diseñado para extraer texto y estructura de páginas impresas o manuscritas, preservando el orden de lectura, las ecuaciones y las tablas. Soporta 22 idiomas indios además del inglés, lo que lo convierte en una herramienta clave para la digitalización de documentos en el subcontinente.

Desde el punto de vista técnico, se trata de un vision-language model que combina un modelo de lenguaje basado en Qwen con un detector de objetos RT-DETR, según los tags del repositorio. El pipeline es image-to-text y los pesos se distribuyen en formato safetensors. El repositorio tiene un tamaño de 2.1 GB y su acceso está restringido (gated) en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model que combina Qwen (modelo de lenguaje) y RT-DETR (detección de objetos), según los tags del repositorio. No se dispone de detalles precisos sobre la arquitectura. |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (22 idiomas indios + inglés) |
| Licencia | other (con requisito de atribución; se debe indicar "Built with [Model Name] from Bodhan AI / AI4Bharat" en derivados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según los tags, el modelo integra un modelo de lenguaje Qwen y un detector de objetos RT-DETR para el análisis de layout. Esto sugiere un enfoque en dos etapas: RT-DETR identifica las regiones de interés (texto, tablas, ecuaciones) y Qwen genera la transcripción y estructura. No hay información pública sobre el dataset de entrenamiento, el número de tokens, ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Extracción de texto de páginas impresas y manuscritas.
- Preservación del orden de lectura en documentos complejos.
- Extracción de ecuaciones y tablas con su estructura.
- Análisis de layout de documentos (detección de regiones de texto, tablas y ecuaciones).
- Soporte multilingüe: 22 idiomas indios (asamés, bengalí, bodo, dogri, gujarati, hindi, kannada, kashmiri, konkani, maithili, malayalam, manipuri, marathi, nepalí, oriya, punjabi, sánscrito, santali, sindhi, tamil, telugu, urdu) más inglés.
- Pipeline image-to-text.
- No se indica soporte de tool calling, function calling, agentes ni modos de razonamiento especiales.

## Casos de uso

- Digitalización de expedientes administrativos: el modelo puede procesar formularios, certificados y expedientes en lenguas indias, preservando el orden de lectura y las tablas, lo que facilita su integración en flujos de trabajo de gestión documental.
- OCR de manuscritos históricos: al soportar escritura manuscrita, es útil para digitalizar archivos históricos o correspondencia en lenguas como el hindi, bengalí o tamil.
- Extracción de ecuaciones y tablas en documentos científicos: el modelo mantiene estructuras complejas, lo que permite convertir artículos o informes a formatos estructurados.
- Automatización de entrada de datos: puede extraer campos de formularios escaneados, reduciendo el trabajo manual en operaciones de back-office.
- Análisis de documentos legales multilingües: facilita la búsqueda de información en contratos o sentencias escritas en varias lenguas indias.
- Indexación de archivos escaneados: permite generar texto buscable a partir de imágenes, mejorando la recuperación de información en sistemas de archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos oficiales de requisitos de hardware.

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del repositorio (2.1 GB) sugiere que los pesos son relativamente compactos, pero no se puede confirmar sin información adicional.
- Opciones de despliegue: no disponible (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicados para este modelo, por lo que no es posible establecer una comparativa cuantitativa con otros OCR o modelos de visión-lenguaje. En los datos proporcionados no hay información comparativa.

## Limitaciones y advertencias

- Acceso restringido (gated) en HuggingFace: requiere aceptar condiciones en la página del modelo.
- Licencia "other" con requisito de atribución obligatoria; hay que revisar los términos exactos para uso comercial.
- No se han publicado benchmarks, por lo que el rendimiento no está verificado de forma independiente.
- Como modelo OCR, su precisión depende de la calidad de la imagen, la legibilidad y el tipo de escritura.
- No hay información sobre sesgos o riesgos de alucinación específicos; se recomienda validar el modelo en el dominio de uso antes de desplegarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/bodhan-ai/indic-ocr
- Bodhan console: https://console.bodhan.ai/
