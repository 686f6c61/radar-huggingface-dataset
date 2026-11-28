# mradermacher/OCRia-1-MTP-Repacked-GGUF

## Resumen

OCRia-1-MTP-Repacked-GGUF es la version cuantizada en formato GGUF del modelo OCRia-1-MTP-Repacked, publicada por el usuario mradermacher. Se trata de un modelo especializado en OCR y parsing de documentos: convierte imagenes de paginas (PDF, escaneos, capturas) en Markdown estructurado, incluyendo tablas y graficos. El modelo original fue desarrollado por prithivMLmods a partir de la familia OCRia-1 de LlamaIndex, y esta variante "MTP-Repacked" incorpora soporte de decodificacion especulativa mediante Multi-Token Prediction (MTP).

Con aproximadamente 4.960 millones de parametros (dato extraido de los pesos en safetensors), es un modelo de tamano medio que puede ejecutarse en GPU de consumo. La cuantizacion GGUF realizada por mradermacher permite desplegarlo con llama.cpp y herramientas compatibles, con opciones que van desde 2,3 GB (Q2_K) hasta 10 GB (f16), lo que lo hace accesible en hardware modesto.

Su relevancia actual radica en la creciente demanda de pipelines de document parsing de alta calidad para RAG y automatizacion documental, donde un modelo especializado y compacto que produzca Markdown limpio con tablas correctamente estructuradas ofrece una alternativa eficiente frente a soluciones propietarias o modelos generalistas de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte MTP; detalles de la arquitectura no especificados en la informacion proporcionada) |
| Parametros totales | 4.962.050.048 (~4,96 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj en Q8_0 y f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (licencia personalizada, enlazada a https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que es un modelo multimodal (el repositorio incluye ficheros mmproj, el proyector multimodal usado por llama.cpp para modelos vision-language) orientado a la conversion de imagenes de documentos en Markdown. El sufijo "MTP" hace referencia a Multi-Token Prediction, una tecnica de decodificacion especulativa que permite predecir varios tokens por paso y acelerar la inferencia; el repositorio incluye la etiqueta speculative-decoding y text-generation-inference, lo que confirma el soporte de este modo de decodificacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta "parsebench" sugiere que el modelo ha sido evaluado o entrenado con relacion al benchmark ParseBench, orientado a parsing de documentos, pero no se aportan cifras. El proceso de "repacking" realizado por prithivMLmods reorganiza los pesos del modelo original OCRia-1 de LlamaIndex para integrar el soporte MTP.

## Capacidades

- Conversion de imagenes de documentos (PDF, escaneos, capturas) a Markdown estructurado.
- Extraccion y reconstruccion de tablas en formato Markdown.
- Interpretacion de graficos presentes en documentos.
- Parsing de documentos orientado a pipelines de RAG y automatizacion.
- Generacion de texto conversacional (etiqueta conversational).
- Soporte de decodificacion especulativa mediante Multi-Token Prediction (MTP), con aceleracion de inferencia.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: si (modelo multimodal con ficheros mmproj).

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo convierte imagenes de documentos contables en Markdown con tablas estructuradas, lo que permite extraer lineas de detalle y totales de forma automatizada en un pipeline de contabilidad.
- Construccion de bases de conocimiento para RAG: al generar Markdown limpio a partir de PDFs corporativos, el texto resultante se indexa directamente en un sistema de recuperacion sin necesidad de post-procesado manual de tablas.
- Procesamiento de articulos cientificos: extraccion de secciones, tablas de resultados y pies de figuras de papers en PDF para su analisis o resumen posterior con un LLM de mayor tamano.
- Automatizacion de back-office en seguros: conversion de polizas y partes escaneados a Markdown para su validacion y archivo, aprovechando que el modelo cabe en GPU de consumo y puede desplegarse on-premise.
- Extraccion de datos de informes financieros: interpretacion de tablas y graficos de balances y cuentas de resultados en PDF para alimentar hojas de calculo o bases de datos.
- Digitalizacion de documentacion legal: conversion de contratos y expedientes escaneados a texto estructurado preservando la jerarquia de secciones, con despliegue local para cumplir requisitos de confidencialidad.
- Preprocesado en pipelines de CI/CD documental: integracion via llama.cpp o servidores compatibles con endpoints para procesar lotes de documentos de forma programatica, usando las cuantizaciones Q4_K_S o Q4_K_M (3,1-3,3 GB) para maximizar throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la etiqueta "parsebench" pero no incluye cifras de MMLU, HumanEval, GSM8K ni del propio ParseBench, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector multimodal):
  - Q2_K (2,3 GB): en torno a 3-4 GB de VRAM.
  - Q4_K_S / Q4_K_M (3,1-3,3 GB): en torno a 4-5 GB de VRAM, opcion recomendada por el autor para velocidad.
  - Q6_K (4,2 GB): en torno a 5-6 GB de VRAM.
  - Q8_0 (5,4 GB): en torno a 7 GB de VRAM.
  - f16 (10,0 GB): en torno a 12 GB de VRAM.
  - Hay que sumar el fichero mmproj (0,5 GB en Q8_0 o 0,8 GB en f16) para el procesamiento de imagenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para las cuantizaciones Q4 a Q8; A100 o H100 para f16 y despliegues de alto throughput.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB o RTX 3060 con Q4_K_S, hasta tarjetas de 12 GB o mas con Q8_0 o f16.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints (etiqueta endpoints_compatible), y text-generation-inference segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El soporte MTP (decodificacion especulativa) esta disenado para reducir la latencia de generacion, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. Alternativas de la misma categoria (OCR / document parsing a Markdown):

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OCRia-1-MTP-Repacked (este) | ~4,96 B | no disponible | ocria-1-license | GGUF, safetensors | Especializado en OCR a Markdown, soporte MTP |
| OCRia-1 (LlamaIndex, original) | no disponible | no disponible | ocria-1-license | safetensors | Modelo base de la familia; esta variante lo repackea con MTP |
| Modelos OCR generalistas (p. ej. variantes de vision-language de 2-7 B) | variable | variable | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad frente a alternativas concretas.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en documentos en castellano no esta documentado.
- Riesgo de alucinacion en la transcripcion: como modelo generativo, puede inventar contenido ausente en la imagen del documento, especialmente en tablas complejas o texto de baja calidad.
- Licencia personalizada ocria-1-license: es necesario revisar el texto completo antes de cualquier uso comercial; no es una licencia open source estandar.
- No se especifica la longitud de contexto, lo que dificulta planificar el procesamiento de documentos muy largos o de multiples paginas en una sola pasada.
- El modelo es una cuantizacion estatica realizada por un tercero (mradermacher); las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la precision en tablas y cifras.
- Para usar la funcionalidad multimodal es imprescindible descargar tambien el fichero mmproj correspondiente; sin el, el modelo no procesa imagenes.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de robustez, lo que limita la confianza para produccion sin validacion propia.
- El repositorio tiene pocas descargas (692) y cero likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OCRia-1-MTP-Repacked-GGUF
- Modelo base (repack): https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
- Modelo original OCRia-1 de LlamaIndex: https://huggingface.co/llamaindex/OCRia-1
- Licencia OCRia-1: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/OCRia-1-MTP-Repacked-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OCRia-1-MTP-Repacked-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
