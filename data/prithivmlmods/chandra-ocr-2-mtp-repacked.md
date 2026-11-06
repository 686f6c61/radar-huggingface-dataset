# prithivMLmods/chandra-ocr-2-MTP-Repacked

## Resumen

chandra-ocr-2-MTP-Repacked es un reempaquetado del modelo OCR multimodal datalab-to/chandra-ocr-2, publicado por el usuario prithivMLmods. El modelo original de Datalab es un sistema de reconocimiento optico de caracteres de proposito general que transforma imagenes y PDF en Markdown estructurado, HTML o JSON preservando la informacion de maquetacion. Este reempaquetado anade soporte de Multi-Token Prediction (MTP) integrado en los pesos para acelerar la inferencia local mediante decodificacion especulativa sin necesidad de un modelo borrador separado.

El modelo base emplea una arquitectura multimodal etiquetada como qwen3_5 en los metadatos de Hugging Face, con aproximadamente 4.660 millones de parametros totales y pesos en safetensors de unos 9,3 GB en BF16. Segun la model card, alcanza resultados SOTA en OCR con un 85,9% en olmocr y un 77,8% de puntuacion multilingue, con mejoras notables en ecuaciones matematicas, reconstruccion de tablas complejas con celdas combinadas, reconocimiento de escritura manual y elementos de formulario.

La relevancia de este reempaquetado es practica: segun el autor, el modelo original ya funciona con llama.cpp, pero aplicaciones locales como LM Studio o Jan AI presentan problemas de offloading. Esta version corrige esos problemas y ofrece cuantizaciones GGUF desde Q3_K_M (2,32 GB) hasta BF16 (8,67 GB), ademas de un fichero mmproj para las capacidades de vision, lo que facilita el despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag qwen3_5), con cabeceras MTP para decodificacion especulativa |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M (GGUF); BF16 en safetensors |
| Idiomas soportados | La model card del base indica mas de 90 idiomas; los metadatos de este repo declaran solo "en" |
| Licencia | openrail |
| Formato de pesos | safetensors (2 shards), GGUF (multiples cuantizaciones) y mmproj-bf16.gguf para vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la etiqueta qwen3_5 y su naturaleza multimodal image-text-to-text. Se trata de un modelo vision-lenguaje que recibe imagenes o paginas de PDF y genera salida estructurada en Markdown, HTML o JSON, con atencion explicita a la maquetacion del documento. La innovacion tecnica de este reempaquetado es la integracion de Multi-Token Prediction (MTP): los pesos incluyen cabeceras de salida adicionales que predicen varios tokens futuros en un unico forward pass, lo que habilita decodificacion especulativa sin modelo borrador separado y acelera la inferencia local.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del base menciona mejoras respecto a Chandra 1 en parseo de ecuaciones, tablas complejas, escritura manual, formularios y maquetacion de documentos anchos, ademas de captioning de imagenes y extraccion de diagramas.

## Capacidades

- Extraccion de texto desde imagenes y PDF con salida en Markdown, HTML o JSON.
- Preservacion de maquetacion: tablas (incluidas celdas combinadas), formularios, checkboxes y layouts de documento ancho.
- Parseo de ecuaciones matematicas y reconstruccion de tablas complejas.
- Reconocimiento de escritura manual.
- Captioning de imagenes y extraccion de diagramas.
- Capacidades multilingues segun la model card del base (mas de 90 idiomas), aunque los metadatos de este repo solo declaran ingles.
- Decodificacion especulativa via MTP integrado para acelerar la generacion.
- Formato conversacional con plantilla de chat Jinja.
- Compatible con text-generation-inference segun las etiquetas del repo.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo extrae campos, checkboxes y estructura tabular en JSON, adecuado para pipelines de contabilidad o ERP que necesitan datos estructurados a partir de escaneos.
- Conversion de articulos cientificos a Markdown: gracias al parseo de ecuaciones y tablas, permite alimentar repositorios de documentacion tecnica o sistemas RAG con contenido academico fiel al original.
- Procesamiento de estados financieros y filings: la capacidad de reconstruir tablas con celdas combinadas y layouts anchos lo hace util para extraer datos de informes corporativos y alimentar modelos de analisis financiero.
- Archivado de documentos historicos escaneados: el reconocimiento de escritura manual y su soporte multilingue permiten transcribir colecciones digitalizadas a texto indexable.
- Extraccion de diagramas e imagenes con captioning: util para generar descripciones automaticas en bases de conocimiento o catalogos de activos visuales.
- OCR en aplicaciones de escritorio locales: las cuantizaciones GGUF (desde 2,32 GB) y la correccion de offloading en LM Studio o Jan AI permiten ejecutar el modelo en portatiles sin GPU dedicada.
- Enriquecimiento de pipelines RAG documentales: la salida estructurada en Markdown o JSON facilita el chunking semantico y la preservacion de jerarquia de secciones.

## Benchmarks y rendimiento

| Benchmark | chandra-ocr-2-MTP-Repacked |
|---|---|
| olmocr | 85,9% |
| Puntuacion multilingue | 77,8% (+12% sobre Chandra 1) |

Estos datos provienen de la model card del modelo base citada en la informacion disponible. No se han publicado en la informacion disponible resultados desglosados por tarea (tablas, ecuaciones, escritura manual) ni comparaciones numericas con otros modelos OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizaciones Q3/Q4, 3-4,5 GB con Q5/Q6, y en torno a 5 GB con Q8_0 (mas el mmproj de 676 MB para vision).
- En BF16 completo, los pesos ocupan unos 8,67 GB, por lo que se recomienda al menos 10-12 GB de VRAM para margen de contexto y activaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para cuantizaciones altas; A100/H100 para despliegue en produccion con vLLM o TGI.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB con cuantizaciones Q3/Q4.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Jan AI, Hugging Face Transformers, vLLM y text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica que MTP acelera la inferencia local, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chandra-ocr-2-MTP-Repacked | ~4,66 mil millones | no disponible | olmocr 85,9%; multilingue 77,8% | openrail | Hugging Face (safetensors + GGUF) |
| datalab-to/chandra-ocr-2 (base) | ~4,66 mil millones | no disponible | mismos benchmarks que el repack | openrail | Hugging Face |
| Chandra 1 | no disponible | no disponible | 12% inferior en multilingue segun la model card | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para comparar con alternativas OCR de otros desarrolladores (por ejemplo, modelos tipo Donut o PaddleOCR). La comparativa se limita al modelo base y su version anterior.

## Limitaciones y advertencias

- Los metadatos del repo declaran unicamente ingles como idioma soportado, aunque la model card del base menciona mas de 90 idiomas; conviene validar el rendimiento real en cada idioma antes de produccion.
- Riesgo de alucinacion en documentos de baja calidad, manuscritos dificiles o layouts atipicos; la salida estructurada puede contener texto inventado o mal alineado.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos culturales o linguisticos.
- La licencia openrail incluye restricciones de uso; es necesario revisar el texto completo de la licencia del modelo base antes de uso comercial.
- La longitud de contexto no esta publicada; documentos muy largos pueden requerir paginacion o chunking.
- El reempaquetado lo mantiene un tercero (prithivMLmods), no Datalab; la trazabilidad de cambios respecto al original debe verificarse.
- El soporte MTP depende de versiones recientes de llama.cpp y de las aplicaciones locales; conviene comprobar compatibilidad antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia del modelo base: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Carpeta GGUF: https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked/tree/main/GGUF
