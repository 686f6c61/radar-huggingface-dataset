# kizzlah/granite-docling-258M-mlx

## Resumen

Granite Docling es un modelo multimodal de tipo image-text-to-text desarrollado por IBM para la conversión eficiente de documentos. Esta variante concreta, `kizzlah/granite-docling-258M-mlx`, es una conversión al formato MLX del modelo original `ibm-granite/granite-docling-258M`, realizada con la librería `mlx-vlm` en su versión 0.3.3. El objetivo es ejecutar el modelo de forma nativa y eficiente en Macs con Apple Silicon, aprovechando la memoria unificada de estos equipos.

El modelo integra visión y lenguaje en un único componente compacto de aproximadamente 315 millones de parámetros (el original declara 258M, aunque el checkpoint convertido pesa 315M), capaz de parsear PDFs, diapositivas e imágenes y producir representaciones estructuradas compatibles con el ecosistema Docling (DoclingDocument, Markdown, HTML). Su relevancia radica en simplificar los pipelines tradicionales de OCR, análisis de layout y post-procesado, sustituyéndolos por un solo modelo multimodal entrenado específicamente para esta tarea. La arquitectura se basa en Idefics3, según los tags del repositorio, y la licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (multimodal image-text-to-text) |
| Parametros totales | 315.319.872 (315M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX, presumiblemente FP16 o BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Idefics3, que combina un codificador visual (vision encoder) con un decoder de lenguaje basado en transformer. Esta configuracion permite procesar entradas mixtas de imagen y texto, generando salidas textuales en formato DocTags, un lenguaje intermedio que Docling interpreta para construir documentos estructurados. El modelo original de IBM fue entrenado especificamente para conversion de documentos, con un tamano compacto de 258M parametros declarados, aunque el checkpoint convertido presenta 315M, posiblemente debido al vision encoder y embeddings adicionales.

La conversion a MLX se realizo con `mlx-vlm` 0.3.3, que adapta los pesos al formato optimizado para Apple Silicon. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. El modelo se integra con la libreria Docling, que lo selecciona automaticamente cuando se especifica `--vlm-model granite_docling`.

## Capacidades

- Conversion de documentos a formatos estructurados: genera DocTags que se transforman en DoclingDocument, Markdown o HTML.
- Parsing de PDFs, diapositivas e imagenes: acepta archivos, URLs o directorios como entrada.
- Integracion nativa con Docling: funciona como componente dentro del pipeline de la libreria, sustituyendo modulos individuales de OCR y layout.
- Generacion de salida con layout visual: permite exportar HTML con la estructura de pagina original (split page view).
- Ejecucion local en Apple Silicon: optimizado para memoria unificada de Macs con chips M1, M2, M3 y posteriores.
- Soporte de conversacion multimodal: aunque su uso principal es conversion, acepta prompts en lenguaje natural para guiar la tarea.

## Casos de uso

- Digitalizacion de documentos corporativos: convertir PDFs escaneados o nativos a Markdown estructurado para su indexacion en sistemas de gestion documental, aprovechando la salida directa de Docling.
- Extraccion de tablas y listas: el modelo identifica y estructura tablas, listas y parrafos, generando HTML con layout visual para su publicacion web.
- Procesamiento de articulos cientificos: dado su uso demostrado con PDFs de arXiv, es adecuado para convertir papers a Markdown o HTML, facilitando su reutilizacion en blogs o repositorios.
- Automatizacion de pipelines de ingestion: integrar el modelo en flujos de trabajo que reciben documentos por lotes (via CLI o API) y producen salidas normalizadas para bases de datos o motores de busqueda.
- Generacion de documentacion tecnica: convertir diapositivas o capturas de pantalla a texto estructurado para incluirlo en wikis o manuales, usando la salida DoclingDocument.
- Asistencia en entornos de desarrollo: como parte de herramientas de productividad que necesitan extraer contenido de imagenes o PDFs para alimentar otros modelos o aplicaciones, gracias a su formato ligero y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de conversion de documentos. Se recomienda consultar la model card del modelo original de IBM para posibles evaluaciones internas, aunque no se han encontrado datos publicos en la busqueda realizada.

## Requisitos de hardware

- Optimizado para Apple Silicon: requiere un Mac con chip M1, M2, M3 o superior, ya que el formato MLX aprovecha la memoria unificada y las unidades Neural Engine.
- Memoria: el repositorio ocupa 0.6 GB, por lo que cabe en equipos con 8 GB de RAM o mas, aunque se recomienda 16 GB para procesar imagenes de alta resolucion o lotes grandes.
- GPU: no requiere GPU discreta; la GPU integrada del chip Apple Silicon es suficiente.
- Opciones de despliegue: se puede ejecutar mediante `mlx-vlm` (CLI o SDK Python) o integrado en Docling. No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan datos numericos. Al ser un modelo compacto, se espera una generacion rapida en hardware Apple Silicon, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kizzlah/granite-docling-258M-mlx | 315M | No disponible | Apache-2.0 | MLX (safetensors) | Conversion a MLX del modelo IBM |
| ibm-granite/granite-docling-258M | 258M (declarados) | No disponible | Apache-2.0 | PyTorch (safetensors) | Modelo original, compatible con GPUs NVIDIA y CPU |
| Otros modelos de conversion de documentos | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas directas en la informacion proporcionada |

La comparativa se limita al modelo original de IBM, ya que no se dispone de informacion sobre otros modelos de la misma categoria (conversion de documentos con arquitectura multimodal compacta). El modelo MLX ofrece la ventaja de ejecucion nativa en Apple Silicon, mientras que el original requiere un entorno PyTorch estandar.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta ingles, lo que restringe su uso en documentos en otros idiomas.
- Enfoque especializado: no es un modelo de proposito general; su unica funcion es la conversion de documentos, por lo que no debe usarse para tareas como generacion de texto libre, razonamiento o codigo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido incorrecto o inventado al interpretar imagenes ambiguas o de baja calidad.
- Dependencia de Docling: para aprovechar plenamente sus capacidades, es necesario integrarlo con la libreria Docling, lo que anade una dependencia externa.
- Requisito de hardware especifico: la version MLX solo funciona en Apple Silicon; en otros sistemas se debe usar el modelo original en PyTorch.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgos o robustez ante entradas adversariales. IBM recomienda usar Granite Guardian como complemento para detectar riesgos en prompts y respuestas.
- Fecha de creacion futura: el repositorio indica una fecha de creacion en 2026, lo que sugiere que es un modelo reciente o con metadatos inusuales; se recomienda verificar la vigencia de la informacion.

## Enlaces

- Repositorio HuggingFace del modelo convertido: https://huggingface.co/kizzlah/granite-docling-258M-mlx
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-docling-258M
- Documentacion de IBM Granite Docling: https://www.ibm.com/granite/docs/models/docling
- Repositorio GitHub del modelo original (tercero): https://github.com/pgadet-wq/granite-docling-258M
- Paper asociado (arXiv): https://arxiv.org/abs/2501.17887
