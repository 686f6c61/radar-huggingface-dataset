# keystats/historical_ocr

## Resumen

El modelo `keystats/historical_ocr` es un sistema multimodal de tipo *image-text-to-text* publicado en HuggingFace por el usuario `keystats`. Su nombre y su pipeline indican que está orientado a la transcripción de documentos históricos escaneados (OCR), aunque la model card no proporciona información detallada sobre su arquitectura, entrenamiento o capacidades específicas. Los metadatos incluyen la etiqueta `qwen3_vl`, lo que sugiere que podría estar basado en la familia Qwen3-VL, pero no hay confirmación oficial en la documentación.

El modelo cuenta con aproximadamente 8.767 millones de parámetros (8,7B) y un tamaño de repositorio de 17,5 GB en formato `safetensors`. Fue creado el 23 de agosto de 2026 y no registra descargas ni valoraciones en el momento de la consulta. La model card es una plantilla genérica sin datos concretos sobre licencia, idiomas, datos de entrenamiento o evaluación, por lo que gran parte de la información técnica debe considerarse no disponible.

A pesar de la falta de documentación, su etiquetado como `qwen3_vl` y su pipeline multimodal lo posicionan como un candidato para tareas de OCR histórico, un campo con demanda creciente en digitalización de archivos y bibliotecas. Sin embargo, cualquier uso en producción requeriría una validación exhaustiva, dado que no se publican métricas ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_vl` sugiere base Qwen3-VL, sin confirmar) |
| Parametros totales | 8.767.123.696 (8,7B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. La etiqueta `qwen3_vl` en los metadatos sugiere que podría tratarse de un modelo de la familia Qwen3-VL, que combina un codificador de visión con un transformador de lenguaje, pero esto no está confirmado en la model card. Tampoco se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

La model card es una plantilla automática generada por HuggingFace, con todos los campos rellenados como "[More Information Needed]". No hay información sobre el procedimiento de entrenamiento, hiperparámetros, infraestructura de cómputo o fechas de entrenamiento. El único dato técnico adicional es el tamaño del repositorio (17,5 GB), coherente con un modelo de ~8,7B parámetros en precisión fp16 o bf16.

## Capacidades

- **Transcripción de imágenes a texto**: el pipeline `image-text-to-text` indica que el modelo acepta imágenes y genera texto, lo que lo hace apto para OCR de documentos escaneados.
- **Conversación multimodal**: la etiqueta `conversational` sugiere que puede mantener diálogos basados en imágenes, aunque no se especifica el formato.
- **Compatibilidad con transformers**: al estar publicado con la librería `transformers`, es cargable con la API estándar de HuggingFace.
- **Otras capacidades**: no se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes o modos de pensamiento. Tampoco se especifican idiomas concretos.

## Casos de uso

Dado que la información oficial es mínima, los siguientes casos de uso son inferencias razonables basadas en el nombre del modelo y su pipeline, no afirmaciones verificadas:

- **Digitalización de archivos históricos**: el modelo podría emplearse para convertir escaneos de manuscritos, cartas o documentos antiguos en texto plano buscable, facilitando la labor de archiveros e historiadores.
- **Transcripción de libros antiguos**: con su tamaño de 8,7B parámetros, podría procesar páginas completas de libros escaneados y generar texto estructurado, aunque se desconoce su precisión en tipografías históricas.
- **Indexación de colecciones bibliotecarias**: integrado en pipelines de procesamiento documental, podría automatizar la generación de metadatos textuales a partir de imágenes de catálogos o fichas.
- **Accesibilidad de documentos**: convertir documentos históricos en texto legible para lectores de pantalla o herramientas de búsqueda, mejorando el acceso a patrimonio cultural.
- **Investigación genealógica**: extraer nombres, fechas y lugares de registros parroquiales o censos antiguos escaneados, aunque la fiabilidad dependería de la calidad del OCR.
- **Análisis de prensa histórica**: transcribir periódicos y revistas digitalizadas para permitir búsquedas por palabras clave en hemerotecas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas que documenten el rendimiento de este modelo específico en tareas de OCR o comprensión de documentos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8,7B parámetros, una cuantización fp16 requeriría aproximadamente 17-18 GB de VRAM solo para los pesos. Con cuantización int8 (si estuviera disponible) se reduciría a ~9 GB, y con int4 a ~5 GB, pero no se confirma la disponibilidad de estas cuantizaciones.
- **GPU recomendadas**: para fp16, se necesitaría una GPU con al menos 24 GB de VRAM, como una RTX 4090, A100 40GB o similar. Para cuantizaciones más bajas, una RTX 3090 (24 GB) o RTX 4070 Ti (12 GB) podrían ser suficientes, siempre que existan versiones cuantizadas.
- **Compatibilidad con GPU de consumo**: es plausible que quepa en GPUs de gama alta con 24 GB, pero no hay garantías sin cuantizaciones oficiales.
- **Opciones de despliegue**: al ser un modelo `transformers`, puede servirse con vLLM, TGI o directamente con la API de HuggingFace. Para cuantización, llama.cpp u Ollama serían opciones si se generan archivos GGUF, pero no se proporcionan.
- **Latencia y throughput**: no se dispone de datos medidos. En una A100, un modelo de 8,7B en fp16 podría generar del orden de 20-40 tokens por segundo, pero es una estimación genérica sin validación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene documentación pública de rendimiento, y no se conocen modelos directamente comparables con el mismo perfil (OCR histórico multimodal, ~8,7B parámetros). Alternativas conocidas en el ámbito del OCR multimodal como Qwen2-VL, Llama 3.2 Vision o Phi-3.5-vision tienen tamaños y capacidades diferentes, pero sin datos de este modelo no es posible una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- **Falta de documentación**: la model card no proporciona información sobre sesgos, riesgos o limitaciones técnicas. Cualquier uso en producción debe considerar esta ausencia de garantías.
- **Riesgo de alucinación**: como modelo generativo, puede producir texto plausible pero incorrecto al transcribir documentos, especialmente con caligrafías complejas o daños en el original.
- **Idiomas no especificados**: no se indica qué idiomas soporta, lo que limita su uso en corpus multilingües sin pruebas previas.
- **Licencia desconocida**: al no especificarse licencia, no se puede garantizar el uso comercial ni la redistribución. Se recomienda contactar al autor antes de cualquier despliegue.
- **Sin benchmarks**: la ausencia de métricas impide evaluar su precisión frente a otras soluciones de OCR.
- **Fecha de creación futura**: el modelo está fechado en agosto de 2026, lo que podría indicar un error en los metadatos o un lanzamiento muy reciente; en cualquier caso, no hay historial de uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/keystats/historical_ocr)
- [Skill historical-ocr para Claude](https://skills.rest/skill/historical-ocr)
- [Space de HuggingFace "Historical OCR"](https://huggingface.co/spaces/milwright/historical-ocr)
- [Paper PDF CHURRO (EMNLP 2025)](https://almond-static.stanford.edu/papers/emnlp2025_historical_ocr.pdf)
- [Guía de usuario en GitHub](https://github.com/buzzcauldron/historical-ocr/blob/main/docs/USER_GUIDE.md)
