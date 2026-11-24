# Aleph-Alpha/Kolibri-1

## Resumen

Kolibri-1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento y generacion de texto en aleman e ingles. Con 78.103 millones de parametros totales pero solo 3.457 millones activos por token, el modelo busca ofrecer la capacidad de un modelo grande con un coste computacional por token bajo, a cambio de mantener todos los pesos en memoria. Es relevante ahora porque combina una ventana de contexto nativa de 262.144 tokens (validada hasta 1.048.576), modo de razonamiento explicito y tool calling, bajo licencia Apache 2.0 y con pesos en FP8.

El modelo se publica en formato transformers con pesos safetensors y cuantizacion FP8 (float8_e4m3fn en bloques de 128x128), lo que reduce el footprint a aproximadamente 78 GB. Aleph Alpha lo posiciona como un modelo soberano europeo, con un tokenizador adaptado a la estructura morfologica del aleman y un enfoque deliberado de profundidad sobre amplitud linguistica (solo dos idiomas).

La ficha se basa en la model card publicada y en los metadatos de Hugging Face; no se dispone de resultados de benchmarks en la informacion proporcionada, por lo que esa seccion se limita a indicarlo explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 50 capas, atencion hibrida 4:1 SWA:GQA (sliding-window + grouped-query), 384 expertos por capa (1 compartido + 6 enrutados) |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 1.048.576 tokens validados; nativa 262.144; recomendado <=262.144 para eficiencia y tareas complejas |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) en bloques 128x128 con activaciones cuantizadas dinamicamente y KV cache FP8; embeddings, LM head, norms y router MoE en bfloat16 |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); modelo base BF16 disponible en Aleph-Alpha/Kolibri-1-BF16 |
| Precision | FP8 para pesos; BF16 en embeddings, LM head, norms y router |
| Fecha de publicacion | 3 de octubre de 2026 |
| Corte de conocimiento | 18 de junio de 2026 (EN y DE) |
| Modelo base | Aleph-Alpha/Kolibri-1-BF16 |

## Arquitectura y entrenamiento

Kolibri-1 es un transformer MoE de 50 capas con atencion hibrida en proporcion 4:1 entre sliding-window attention (SWA) y grouped-query attention (GQA). Cada capa contiene 384 expertos, de los cuales 1 es compartido y 6 se enrutan por token, lo que explica que solo se activen 3,46B parametros de los 78B totales. El entrenamiento empleo los optimizadores Muon y Exact Quantile Balancing. La codificacion posicional se aplica unicamente en las capas de ventana deslizante, lo que permite extender el contexto mas alla de la longitud nativa sin escalado posicional.

El preentrenamiento uso 20 billones (20T) de tokens de un corpus bilingue filtrado (aproximadamente 62,5% ingles, 23,9% aleman y 13,6% codigo), combinando datos web curados, reescrituras y traducciones sinteticas y fuentes de alta calidad. A ello se suman 3,44T tokens de mid-training y 201B tokens en una fase final de extension de contexto. Las secuencias fueron de 16.384 tokens en preentrenamiento, 65.536 en mid-training y 262.144 en la fase de contexto largo. El post-entrenamiento incluyo SFT con datos bilingues filtrados (open source y sinteticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. El computo de preentrenamiento se realizo sobre 768 NVIDIA B200 (96 nodos HGX 8xB200) durante 21 dias (392k GPUh), con un total estimado de 6,4e23 FLOPs.

## Capacidades

- Generacion de texto y razonamiento multi-paso en aleman e ingles.
- Modo de razonamiento explicito (reasoning mode) activable.
- Tool calling / function calling para orquestacion de APIs y ejecucion de codigo.
- Flujos agenticos y razonamiento multi-paso con validacion externa.
- Procesamiento de documentos largos y generacion aumentada por recuperacion (RAG) gracias a contextos de hasta 262.144 tokens nativos (1.048.576 validados).
- Generacion de codigo y extraccion estructurada.
- Capacidades multilingues limitadas a aleman e ingles (sin soporte declarado de otros idiomas).
- Tokenizador adaptado a la estructura de palabras del aleman, sin penalizar el ingles.

## Casos de uso

- Asistentes conversacionales en aleman e ingles: el modelo mantiene conversaciones multi-turno con contexto largo (hasta 262.144 tokens recomendados), adecuado para soporte interno con historial extenso.
- Procesamiento de documentos largos: analisis y resumen de contratos, informes o expedientes que superan la ventana tipica de otros modelos, apoyandose en la atencion SWA para mantener coste bajo.
- RAG sobre material propio de una organizacion: ingesta de grandes corpus documentales y respuesta con citas, aprovechando el contexto extendido y el modo de razonamiento para sintetizar evidencias.
- Orquestacion agentica de APIs: el soporte de tool calling permite construir capas de orquestacion que ejecutan busquedas, llamadas a servicios o codigo, siempre con validacion externa de resultados.
- Extraccion estructurada de informacion: conversion de texto no estructurado (facturas, formularios, correos) en JSON u otros formatos, con salida validada por el sistema llamante.
- Generacion y asistencia de codigo: autocompletado, refactorizacion y explicacion de fragmentos, integrable en pipelines de desarrollo con revision humana.
- Herramientas internas de conocimiento e investigacion: busqueda semantica y sintesis sobre documentacion corporativa, con el modelo en rol consultivo y decision humana final.
- Soporte a la decision (decision-support): generacion de opciones y evidencias para que un humano decida, no como componente decisor autonomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Footprint de memoria del modelo: aproximadamente 78 GB con pesos FP8.
- Minimo declarado: 2x A100 80 GB, 2x H100 SXM5, 1x H200, 1x B200 o 1x B300.
- Recomendado: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB sin particionado; requiere hardware de centro de datos.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que el diseno busca bajo coste de servicio por token activo (3,46B) y que se recomienda limitar el contexto a 262.144 tokens en despliegues sensibles a latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, se indican los datos propios del modelo:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Kolibri-1 | 78B | 3,46B | 1.048.576 (recomendado 262.144) | Apache 2.0 | de, en |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta aleman e ingles; no hay soporte declarado para otros idiomas, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion inherente a los modelos generativos; la model card recomienda revision humana antes de actuar sobre las salidas.
- El corte de conocimiento es el 18 de junio de 2026; la informacion posterior solo puede obtenerse mediante herramientas.
- Requiere mantener los 78B parametros en memoria aunque solo se activen 3,46B por token: el coste de memoria es alto y no cabe en GPUs de consumo.
- Aunque el contexto puede extenderse en teoria de forma arbitraria, la calidad y eficiencia solo estan validadas hasta 1.048.576 tokens, y se recomienda no superar 262.144 en tareas complejas o despliegues sensibles a latencia.
- Uso previsto en sistemas con supervision humana (asistentes, soporte a la decision, orquestacion con validacion); no esta disenado para sistemas autonomos que actuen sin revision.
- Licencia Apache 2.0 permite uso comercial, pero el autor es signatario del Codigo de Practicas GPAI de la UE, lo que puede implicar obligaciones de transparencia adicionales para despliegues en la UE.
- Existe una version posterior (Aleph-Alpha/Kolibri-1.1) indicada en la model card; conviene evaluar si esta version sigue siendo la adecuada para nuevos despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Version posterior: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Informe tecnico: https://aleph-alpha.com/downloads/tech-report.pdf
- Blog tecnico: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Codigo de Practicas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper (arXiv 2512.11614): https://arxiv.org/abs/2512.11614
- Paper (arXiv 2601.17858): https://arxiv.org/abs/2601.17858
