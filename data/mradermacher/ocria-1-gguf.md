# mradermacher/OCRia-1-GGUF

## Resumen

OCRia-1 es un modelo multimodal especializado en OCR y extraccion de estructura de documentos (PDF, imagenes con tablas y graficos) hacia Markdown. Lo desarrolla LlamaIndex y esta disenado para tareas de document parsing: convertir paginas de documentos en representaciones estructuradas legibles por maquina, incluyendo tablas y graficos. Esta ficha cubre la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo base cuenta con aproximadamente 4.841 millones de parametros (4,84B) segun los pesos en safetensors del repositorio. La version GGUF incluye un proyector multimodal (mmproj) en precision Q8_0 y f16, lo que confirma que el modelo procesa entradas de imagen ademas de texto. El repositorio pesa 45,6 GB en total por la acumulacion de todas las cuantizaciones disponibles.

Es relevante ahora porque el parsing de documentos con estructura compleja (tablas, graficos, maquetacion) es un cuello de botella comun en pipelines RAG y de automatizacion documental, y disponer de cuantizaciones GGUF de 2,3 a 5,3 GB permite desplegar el modelo en estaciones de trabajo sin GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector mmproj; arquitectura del backbone no especificada) |
| Parametros totales | 4.841.450.496 (aprox. 4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (licencia propia, enlazada como LICENSE en el repo base) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone (no se especifica si es un transformer denso, MoE o hibrido). Lo que si se confirma es la naturaleza multimodal: el repositorio GGUF incluye archivos mmproj en Q8_0 (0,5 GB) y f16 (0,8 GB), que son los proyectores que conectan un codificador visual con el modelo de lenguaje en el ecosistema llama.cpp. El modelo base, `llamaindex/OCRia-1`, esta etiquetado con `transformers` y orientado a tareas de OCR, parsing de PDF, tablas, graficos y evaluacion en ParseBench.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada. La model card de la version GGUF es una plantilla estandar de mradermacher para cuantizaciones estaticas, sin detalles adicionales del autor original.

## Capacidades

- Extraccion de texto desde imagenes de documentos y PDFs (OCR).
- Conversion de documentos a Markdown estructurado.
- Reconocimiento y serializacion de tablas.
- Interpretacion de graficos presentes en documentos.
- Procesamiento multimodal: acepta imagenes ademas de texto (via proyector mmproj).
- Orientado a document parsing y evaluacion en ParseBench (segun los tags del modelo).
- Soporte de conversacion (tag `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, audio, vision): vision confirmada por el proyector multimodal; audio y thinking mode no disponibles.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo convierte imagenes de documentos administrativos en Markdown con tablas de lineas de detalle, lo que facilita la extraccion posterior de campos con expresiones regulares o LLMs.
- Pipeline RAG sobre documentacion corporativa: al transformar PDFs con maquetacion compleja en Markdown estructurado, se preservan tablas y jerarquia de secciones, mejorando la calidad de los fragmentos indexados.
- Extraccion de tablas financieras: informes anuales y balances suelen incluir tablas densas; el modelo esta entrenado especificamente para reconocer y serializar tablas, reduciendo la perdida de estructura frente a OCR plano.
- Procesamiento de articulos cientificos: conversion de papers con figuras y graficos a Markdown para alimentar bases de conocimiento o herramientas de revision bibliografica.
- Archivado y busqueda documental: generacion de representaciones Markdown de un corpus escaneado para habilitar busqueda semantica y full-text sobre el contenido estructurado.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_M (3,2 GB) y Q5_K_M (3,6 GB) permiten ejecutar el modelo en equipos con GPU de consumo o incluso en CPU, integrandolo en herramientas locales de gestion documental.
- Preprocesado para agentes documentales: usar la salida Markdown como entrada limpia para un agente que responda preguntas sobre contratos o polizas, separando la fase de parsing de la fase de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta etiquetado con ParseBench, lo que sugiere que se evaluo en ese benchmark, pero no se proporcionan cifras en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~2,3 GB; Q3_K_M ~2,7 GB; Q4_K_S ~3,0 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,6 GB; Q6_K ~4,1 GB; Q8_0 ~5,3 GB; f16 ~9,8 GB. Anadir 0,5 GB (mmproj Q8_0) o 0,8 GB (mmproj f16) para el procesamiento de imagenes, mas el espacio de cache KV segun contexto.
- GPU recomendadas: para f16, una GPU con 16 GB o mas (RTX 4080/4090, A100, H100). Para Q4_K_M y Q5_K_M, una GPU de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) es suficiente para los pesos, con margen limitado para contexto.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4 y Q5 caben en GPUs de 8 GB; Q2_K y Q3_K caben en GPUs de 4-6 GB. En CPU es viable con Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware y de la cuantizacion; a modo orientativo, un modelo denso de 4,8B en Q4_K_M en una RTX 4090 suele ser interactivo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| OCRia-1 (esta ficha) | 4,84B | no disponible | OCR y document parsing a Markdown | ocria-1-license | GGUF, safetensors |
| Qwen2.5-VL-3B | 3B | 32K (segun documentacion publica de Qwen) | Vision-lenguaje general | Apache 2.0 (segun Qwen) | safetensors, GGUF (comunidad) |
| MiniCPM-V 2.6 | 8B | no disponible en esta ficha | Vision-lenguaje con OCR | licencia propia (MiniCPM) | safetensors, GGUF (comunidad) |
| GOT-OCR2.0 | 580M | no disponible en esta ficha | OCR especializado | Apache 2.0 (segun publicacion) | safetensors |

La comparativa es orientativa: los datos de los modelos alternativos provienen de su documentacion publica general y no de una evaluacion directa contra OCRia-1. No hay benchmarks comparativos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Licencia: `ocria-1-license` es una licencia propia (no Apache, MIT ni similar). Es imprescindible revisar el archivo LICENSE del repositorio base antes de cualquier uso comercial; las condiciones de redistribucion y uso en produccion no se detallan en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo aplicado a OCR, puede inventar contenido en zonas de baja calidad, tablas mal alineadas o graficos ambiguos. Conviene validar la salida en dominios criticos (facturas, contratos).
- Contexto: no se ha publicado la longitud de contexto; documentos muy largos pueden requerir troceado por paginas, lo que puede romper tablas que abarcan varias paginas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar la precision en tablas y cifras; para document parsing se recomienda Q5_K_M o superior si el hardware lo permite.
- Proyector multimodal separado: es necesario descargar el archivo mmproj ademas del GGUF del modelo; omitirlo deshabilita el procesamiento de imagenes.
- Repositorio de cuantizacion: la model card es una plantilla generica de mradermacher; no aporta garantias adicionales sobre el comportamiento del modelo.
- Sin datos de benchmarks publicados: no es posible verificar cuantitativamente la calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OCRia-1-GGUF
- Modelo base: https://huggingface.co/llamaindex/OCRia-1
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#OCRia-1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
