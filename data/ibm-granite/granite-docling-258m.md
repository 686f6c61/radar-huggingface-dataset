# ibm-granite/granite-docling-258M

## Resumen

Granite Docling 258M es un modelo multimodal de IBM Research diseñado específicamente para la conversión de documentos. Construido sobre la arquitectura Idefics3, sustituye el codificador visual por SigLIP2-base-patch16-512 y el modelo de lenguaje por un Granite de 165M, logrando un tamaño total de 257,5 millones de parámetros. Su objetivo es preservar las capacidades del pipeline Docling, ofreciendo una solución ligera y eficiente para extraer contenido estructurado de PDFs e imágenes.

El modelo se integra de forma nativa en la librería Docling, lo que permite convertir documentos a Markdown, HTML u otros formatos con una sola línea de código. Entre sus novedades destacan un mejor reconocimiento de ecuaciones matemáticas, modos de inferencia flexibles (página completa o regiones guiadas por bounding boxes), mayor estabilidad frente a bucles infinitos y soporte experimental para japonés, árabe y chino. Su licencia Apache 2.0 y su tamaño reducido lo convierten en una opción atractiva para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 modificado (vision encoder SigLIP2-base-patch16-512 + LLM Granite 165M) |
| Parametros totales | 257.517.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato original en bf16) |
| Idiomas soportados | ingles (soporte experimental para japones, arabe y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Idefics3, un enfoque multimodal que combina un codificador visual con un modelo de lenguaje. En este caso, IBM Research reemplaza el vision encoder original por SigLIP2-base-patch16-512 y el LLM por un Granite de 165M, reduciendo el coste computacional sin sacrificar la calidad en tareas de conversion de documentos. El entrenamiento se realizo sobre datasets sinteticos especializados: SynthCodeNet para codigo, SynthFormulaNet para formulas matematicas, SynthChartNet para graficos y DoclingMatix para documentos completos. No se menciona el uso de RLHF o DPO en la informacion disponible.

La innovacion principal reside en su integracion con el ecosistema Docling, que permite generar directamente estructuras DoclingDocument a partir de imagenes. Ademas, incorpora modos de inferencia flexibles: uno de pagina completa y otro guiado por regiones (bbox), lo que mejora la precision en documentos complejos. El modelo tambien introduce un modo de QA sobre elementos del documento, capaz de responder preguntas sobre la presencia y el orden de los componentes estructurales.

## Capacidades

- Conversion de documentos: genera representaciones estructuradas (DoclingDocument) a partir de imagenes o PDFs, exportables a Markdown, HTML y otros formatos.
- Reconocimiento de formulas matematicas: mejora la deteccion y el formateo de ecuaciones, tanto en linea como en bloque.
- Extraccion de tablas y graficos: identifica y estructura tablas y graficos dentro de documentos.
- OCR y reconocimiento de layout: detecta la disposicion de los elementos en la pagina (titulos, parrafos, imagenes, etc.).
- QA de elementos del documento: responde preguntas sobre la estructura del documento, como la presencia y el orden de los componentes.
- Soporte multilingue experimental: aunque el modelo esta entrenado principalmente en ingles, ofrece soporte preliminar para japones, arabe y chino.
- Integracion con Docling: se puede usar directamente a traves de la libreria Docling, tanto por CLI como por SDK, y tambien con transformers, vLLM, ONNX y MLX.

## Casos de uso

- Digitalizacion de archivos PDF: convertir documentos escaneados o nativos a Markdown o HTML para su indexacion, busqueda o reutilizacion en pipelines de datos.
- Extraccion de tablas en informes financieros: el modelo identifica y estructura tablas complejas, facilitando su posterior analisis en hojas de calculo o bases de datos.
- Reconocimiento de formulas en articulos cientificos: convierte ecuaciones matematicas a formato LaTeX o MathML, util para la re-publicacion o el analisis de contenido academico.
- Automatizacion de procesos de gestion documental: integrar el modelo en flujos de trabajo que requieran clasificar, extraer y archivar informacion de documentos variados.
- Generacion de contenido accesible: transformar documentos visuales en texto plano o HTML semantico para lectores de pantalla o plataformas de publicacion.
- Analisis de documentos legales: extraer clausulas, encabezados y secciones de contratos o expedientes, permitiendo una revision mas rapida y sistematica.
- Asistente de QA sobre documentos: responder preguntas especificas sobre la estructura de un documento, como "¿hay una tabla en la pagina 3?" o "¿que secciones contiene este informe?".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 258M de parametros, requiere poca VRAM en comparacion con modelos de mayor tamano. Se estima que puede ejecutarse en GPUs consumer con 8 GB o menos, aunque no se proporcionan cifras exactas.
- Compatible con GPUs como RTX 3060, RTX 4090, A100, H100, entre otras.
- Se puede desplegar con transformers, vLLM, ONNX Runtime y MLX (para Apple Silicon).
- La inferencia en CPU es posible, aunque mas lenta; se recomienda GPU para un rendimiento optimo.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ibm-granite/granite-docling-258M | 258M | no disponible | Apache 2.0 | Conversion de documentos multimodal |
| ds4sd/SmolDocling-256M-preview | 256M | no disponible | Apache 2.0 | Conversion de documentos multimodal |
| Otros modelos OCR (p.ej. TrOCR) | variable | no aplica | MIT/Apache | OCR puro, sin estructura semantica |

La comparativa se basa en informacion publica; no se dispone de benchmarks comunes para una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; el soporte para japones, arabe y chino es experimental y puede presentar errores.
- No se garantiza una precision perfecta en documentos muy complejos o con calidad de imagen deficiente.
- Puede generar alucinaciones en la extraccion de contenido, especialmente en regiones ambiguas o con bajo contraste.
- La longitud de contexto no se ha especificado; para documentos muy largos puede ser necesario dividirlos en paginas o secciones.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar la procedencia de los datos de entrenamiento si se utilizan en entornos regulados.
- El modelo no es un OCR generico; esta optimizado para la conversion de documentos estructurados, no para el reconocimiento de texto libre en imagenes arbitrarias.

## Enlaces

- [HuggingFace - ibm-granite/granite-docling-258M](https://huggingface.co/ibm-granite/granite-docling-258M)
- [Demo interactiva](https://huggingface.co/spaces/ibm-granite/granite-docling-258m-demo)
- [Repositorio Docling](https://github.com/docling-project/docling)
- [Docling-core](https://github.com/docling-project/docling-core)
- [Paper: arxiv 2501.17887](https://arxiv.org/abs/2501.17887)
- [Paper: arxiv 2503.11576](https://arxiv.org/abs/2503.11576)
- [Paper: arxiv 2305.03393](https://arxiv.org/abs/2305.03393)
