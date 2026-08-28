# opendatalab/MinerU2.5-Pro-2605-1.2B

## Resumen

MinerU2.5-Pro-2605-1.2B es un modelo de parsing de documentos (PDF a Markdown) desarrollado por el equipo de OpenDataLab. Se trata de una actualizacion de la serie MinerU2.5-Pro que mantiene la arquitectura original de 1.2 mil millones de parametros y se centra exclusivamente en la ingenieria de datos para mejorar el rendimiento. El modelo convierte imagenes de documentos, incluyendo PDFs escaneados, en salida estructurada Markdown, y establece un nuevo estandar en el benchmark OmniDocBench v1.6, superando a modelos lideres del sector.

La version 2605 introduce dos mejoras principales respecto a la 2604: una limpieza integral de datos para reducir errores de clasificacion en la deteccion de layout, especialmente en la categoria `image_block`, y un dataset de entrenamiento a gran escala para el analisis de imagenes que mejora notablemente el reconocimiento de graficos, diagramas de flujo y sellos. El modelo esta entrenado sobre 65,5 millones de paginas de documentos y soporta chino e ingles.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su tamano compacto de 1.156 millones de parametros lo hace adecuado para despliegue en entornos con recursos limitados, manteniendo un rendimiento de nivel SOTA en tareas de parsing documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (vision-language transformer) |
| Parametros totales | 1.156.026.624 (1,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MinerU2.5-Pro-2605-1.2B se basa en la arquitectura Qwen2-VL, un modelo vision-language de tipo transformer que procesa simultaneamente entradas de imagen y texto. El modelo mantiene la arquitectura de 1.2B parametros de su predecesor sin modificaciones estructurales; la mejora de rendimiento se logra exclusivamente mediante ingenieria de datos.

El entrenamiento se realizo sobre un dataset de 65,5 millones de paginas de documentos, expandido y limpiado especificamente para esta version. Para la deteccion de layout se llevo a cabo una limpieza exhaustiva de datos que redujo los errores de clasificacion de categorias, particularmente en la deteccion de bloques de imagen. Para el analisis de imagenes se construyo un dataset de entrenamiento a gran escala que permite al modelo reconocer una amplia variedad de graficos, diagramas de flujo y sellos con mayor precision. El pipeline completo convierte documentos PDF escaneados en Markdown estructurado, incluyendo tablas, formulas y elementos visuales.

## Capacidades

- Conversion de PDF a Markdown: transforma documentos PDF, tanto digitales como escaneados, en salida Markdown estructurada.
- Deteccion de layout: identifica y clasifica los distintos bloques de un documento (texto, imagenes, tablas, formulas, etc.) con alta precision.
- Reconocimiento de imagenes: analiza graficos, diagramas de flujo, sellos y otros elementos visuales dentro de los documentos.
- Reconocimiento de tablas: extrae tablas de documentos y las convierte a formato Markdown.
- Reconocimiento de formulas: detecta y transcribe formulas matematicas.
- Capacidad multilingue: soporta documentos en chino e ingles.
- Procesamiento de imagenes de documentos: maneja entradas de imagen unica o multiples paginas escaneadas.

## Casos de uso

- Digitalizacion de archivos corporativos: una empresa puede procesar miles de PDFs historicos escaneados y convertirlos a Markdown estructurado para su indexacion y busqueda, gracias a la capacidad del modelo para detectar layout y reconocer texto en documentos escaneados.

- Extraccion de datos de facturas y recibos: el modelo puede analizar facturas en PDF, identificar campos clave como importes, fechas y proveedores, y estructurarlos en formato Markdown para su integracion en sistemas de contabilidad automatizada.

- Generacion de documentacion tecnica: equipos de documentacion pueden convertir manuales y especificaciones tecnicas en PDF a Markdown para su posterior edicion, versionado y publicacion en plataformas como GitBook o Confluence.

- Procesamiento de articulos academicos: investigadores pueden convertir papers cientificos en PDF a Markdown preservando formulas matematicas, tablas y estructura de secciones, facilitando su analisis, traduccion o reutilizacion en nuevos documentos.

- Analisis de informes financieros: instituciones financieras pueden procesar informes anuales y estados financieros en PDF, extrayendo tablas y datos numericos con alta fidelidad para su analisis posterior en hojas de calculo o herramientas de BI.

- Construccion de datasets para RAG: el modelo permite convertir grandes volumenes de documentacion corporativa en PDF a texto estructurado en Markdown, listo para ser indexado en sistemas de recuperacion aumentada por generacion (RAG) con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados numericos detallados de benchmarks en la informacion disponible. La model card indica que el modelo establece un nuevo estandar en el benchmark OmniDocBench v1.6 y supera a modelos lideres del sector, pero no se proporcionan cifras concretas. El informe tecnico esta disponible en arXiv (referencia 2604.04771) y puede contener resultados detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero para un modelo de 1,2B parametros en precision FP16 se estiman aproximadamente 2,5-3 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (NVIDIA GTX 1660, RTX 2060 o superior) puede ejecutar el modelo en FP16.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y alta para consumidores.
- Opciones de despliegue: al usar la libreria transformers, es compatible con vLLM, TGI (Text Generation Inference) y pipelines estandar de HuggingFace. Para CPU, se puede convertir a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B | 1,2B | no disponible | Apache 2.0 | Parsing de documentos PDF a Markdown |
| MinerU2.5-Pro-2604 (version anterior) | 1,2B | no disponible | Apache 2.0 | Parsing de documentos PDF a Markdown |
| Modelos lideres en OmniDocBench v1.6 | variable | no disponible | variable | Parsing de documentos |

El modelo se posiciona como SOTA en el benchmark OmniDocBench v1.6, superando a los modelos lideres del sector. La comparativa con alternativas especificas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos especificos del modelo, pero al estar entrenado principalmente con documentos en chino e ingles, puede tener un rendimiento inferior con documentos en otros idiomas.
- El modelo esta especializado en parsing de documentos; no es un modelo de lenguaje general y no debe usarse para generacion de texto libre, razonamiento o tareas conversacionales.
- No se proporcionan datos sobre tasas de alucinacion o errores en la extraccion de contenido, por lo que se recomienda validar la salida en aplicaciones criticas.
- La longitud de contexto no esta documentada, lo que puede limitar el procesamiento de documentos muy extensos en una sola pasada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantias de exactitud en la extraccion de documentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Modelo en ModelScope: https://modelscope.cn/models/OpenDataLab/MinerU2.5-Pro-2605-1.2B
- Informe tecnico en arXiv: https://arxiv.org/abs/2604.04771
