# mradermacher/clairic-GGUF

## Resumen

Clairic es un modelo multimodal desarrollado por Cloudflare, orientado a la extraccion de informacion estructurada y a la generacion de salidas con formato estricto (structured output). Esta ficha cubre la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en entornos de inferencia local mediante llama.cpp y herramientas compatibles con el formato GGUF. El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), lo que lo situa en la categoria de modelos de gran tamano con requisitos de hardware significativos.

La relevancia de esta publicacion radica en que facilita el despliegue del modelo original en hardware mas modesto mediante cuantizacion, con un rango de tamanos que va desde los 11,3 GB del Q2_K hasta los 29,1 GB del Q8_0. El modelo esta etiquetado como multimodal y especializado en information extraction, lo que lo hace adecuado para tareas de conversion de documentos o texto no estructurado en datos estructurados.

La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales significativas. No obstante, la informacion publicada sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal, segun etiquetas del autor) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (F16 mencionado en metadatos del autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Cloudflare/clairic en la documentacion proporcionada. Las etiquetas del autor indican que se trata de un modelo multimodal con soporte de structured output, orientado a information extraction y que requiere custom code para su ejecucion (tag `custom-code`). El recuento de parametros (27,3 B) y el tamano del repo (190,7 GB) son coherentes con un modelo denso de gran tamano, pero no se confirma si emplea mezcla de expertos, atencion lineal u otras innovaciones.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion sobre el proceso de esta publicacion concreta es la relativa a la cuantizacion estatica realizada por mradermacher, que indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion. El autor menciona que las cuantizaciones se generaron con `quantize_version: 2` y `output_tensor_quantised: 1`, y que el tipo de conversion empleado fue `hf`.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational`).
- Extraccion de informacion estructurada a partir de texto no estructurado (tag `information-extraction`).
- Generacion de salidas con formato estructurado y validable (tag `structured-output`).
- Procesamiento multimodal, segun la etiqueta `multimodal` del autor (no se detalla que modalidades cubre).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Requiere codigo personalizado para su carga y ejecucion (tag `custom-code`).
- No se documenta soporte explicito de tool calling, function calling, agentes o modo de razonamiento extendido.
- Capacidades multilingues limitadas al ingles segun los metadatos.

## Casos de uso

- Extraccion de datos de facturas y albaranes: el modelo puede recibir texto de documentos administrativos y devolver JSON con campos normalizados (importe, fecha, proveedor), aprovechando su especializacion en structured output para garantizar un esquema valido.
- Procesamiento de curriculos: conversion de CV en texto libre a un objeto estructurado con experiencia, formacion y habilidades, integrable en un ATS mediante la salida JSON del modelo.
- Enriquecimiento de bases de datos: extraccion de entidades y relaciones de articulos o informes para poblar tablas relacionales, usando la capacidad de information extraction como paso previo a la carga.
- Clasificacion y etiquetado de tickets de soporte: el modelo puede categorizar y extraer campos clave de mensajes de usuarios, con salida estructurada que alimente directamente un sistema de ticketing.
- Analisis de documentos multimodales: si la capacidad multimodal incluye imagen, podria procesar capturas o escaneos junto con texto para extraer informacion de formularios y recibos.
- Despliegue local en entornos con requisitos de privacidad: gracias a las cuantizaciones GGUF, puede ejecutarse en infraestructura propia sin enviar datos a servicios externos, algo relevante para datos personales o financieros.
- Prototipado rapido de pipelines de extraccion: las cuantizaciones Q4_K_M (17,1 GB) permiten validar la calidad del modelo en una GPU de consumo antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin contar KV cache):
  - Q2_K: 11,3 GB.
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,8 GB; Q3_K_L: 15,0 GB.
  - IQ4_XS: 15,8 GB; Q4_K_S: 15,9 GB; Q4_K_M: 17,1 GB.
  - Q5_K_S: 19,1 GB; Q5_K_M: 19,7 GB.
  - Q6_K: 22,5 GB.
  - Q8_0: 29,1 GB.
- GPU recomendadas: para Q4_K_M o superiores se recomienda una GPU con 24 GB o mas de VRAM (RTX 3090, RTX 4090, A5000, L40S). Para Q8_0 se necesita al menos 32 GB (A100 40 GB, RTX A6000, H100). Las cuantizaciones Q2_K y Q3 pueden caber en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto corto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python), dado el formato GGUF. Para el modelo base en safetensors, vLLM o TGI serian opciones, pero no se documenta compatibilidad en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento para estas cuantizaciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en la documentacion proporcionada. Como referencia de categoria, se puede comparar con otros modelos densos de tamano similar en formato GGUF, aunque sin datos de rendimiento de clairic no es posible una comparacion cuantitativa:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Cloudflare/clairic (esta ficha) | 27,3 B | no disponible | Apache 2.0 | safetensors / GGUF |
| Alternativas de ~27-34 B | no disponible | no disponible | no disponible | no disponible |

No disponible: no se han identificado en la informacion proporcionada modelos comparables con datos verificables de rendimiento, contexto o licencia para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Arquitectura y contexto desconocidos: la ausencia de documentacion sobre la ventana de contexto impide planificar cargas de trabajo con documentos largos sin pruebas previas.
- Requiere codigo personalizado: el tag `custom-code` indica que la carga del modelo no es estandar; esto puede complicar la integracion en pipelines de produccion y la compatibilidad con herramientas de inferencia.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; en tareas de extraccion estructurada es imprescindible validar las salidas contra un esquema y aplicar comprobaciones posteriores.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni se han publicado analisis de sesgo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clairic por si existieran terminos adicionales no reflejados en esta ficha.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede suponer una perdida de calidad frente a alternativas con imatrix en tamanos equivalentes.
- Fecha de publicacion futura en los metadatos (2026-11-20): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Pagina de resumen del autor: https://hf.tst.eu/model#clairic-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
