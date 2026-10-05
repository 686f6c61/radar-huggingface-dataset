# Padakovec/Kolibri-1-W4A16-GPTQ

## Resumen

Kolibri-1 W4A16 GPTQ es una cuantizacion no oficial en INT4 del modelo Aleph-Alpha/Kolibri-1, publicada por el usuario Padakovec en HuggingFace. El modelo base lo desarrolla Aleph Alpha (compania alemana de IA, autora de la familia Luminous y Kolibri). El objetivo de esta version es reducir el peso del modelo lo suficiente como para que quepa en una sola GPU A100 de 80 GB (41 GiB de pesos), mientras que la version oficial en FP8 necesita dos.

Se trata de un modelo de generacion de texto con licencia Apache 2.0 y soporte para aleman (de) e ingles (en), publicado con la libreria vLLM y orientado a despliegue en servidor. Los pesos totales declarados suman 78.103.074.560 parametros (aproximadamente 78,1 mil millones), repartidos en un repositorio de 44,2 GB. La model card menciona explicitamente la existencia de "expertos" (experts), lo que apunta a una arquitectura de tipo mezcla de expertos (MoE), aunque no se detallan en la informacion disponible los parametros activos ni la longitud de contexto.

La relevancia de esta ficha radica en que es una alternativa de cuantizacion para desplegar un modelo grande de tipo frontier en hardware mas asequible, con una perdida de fidelidad medida respecto a la version BF16 (KL y top-1) que el autor documenta de forma explicita. Es un caso tipico de cuantizacion post-entrenamiento (PTQ) con GPTQ sobre un modelo MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); el autor menciona "experts" en la model card. Detalle completo no disponible |
| Parametros totales | 78.103.074.560 (aprox. 78,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico, group 128, GPTQ. Atencion, router, embeddings y LM head en BF16. Existe una version oficial FP8 del modelo base |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 (modificado a partir de los pesos de Aleph Alpha; ver terminos de licencia original) |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del modelo Aleph-Alpha/Kolibri-1-BF16. Los pesos de los expertos se comprimen a INT4 asimetrico con granularidad de grupo 128 mediante GPTQ. El resto de componentes (mecanismo de atencion, router de expertos, embeddings y cabeza de lenguaje, LM head) se mantienen en BF16, de modo que solo la parte de expertos es la que se cuantiza. El calibrado del proceso GPTQ se realizo, segun la model card, con 1 millon de tokens compuestos por chat en ingles y Wikipedia en aleman.

No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento del modelo base, la composicion del dataset de preentrenamiento, ni si hubo fases de RLHF o DPO. El hecho de que el despliegue en vLLM requiera el argumento `--reasoning-parser kolibri1` sugiere que el modelo base incorpora algun tipo de modo de razonamiento con formato propio, pero no se detallan sus caracteristicas tecnicas en la informacion disponible.

La innovacion destacable de esta publicacion es la fidelidad de la cuantizacion: el autor reporta valores muy cercanos a la version oficial FP8 en terminos de divergencia KL y coincidencia top-1 respecto a BF16, lo que indica que la perdida introducida por el INT4 es moderada.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, tag conversational).
- Razonamiento con parser dedicado: el despliegue en vLLM requiere `--reasoning-parser kolibri1`, lo que indica soporte de un formato de razonamiento estructurado propio del modelo base.
- Capacidades multilingues limitadas a aleman e ingles segun los metadatos.
- Posible soporte de tool calling / function calling derivado del modelo base (no confirmado en la informacion disponible).
- Posible soporte de agentes y razonamiento multi-paso (no confirmado en la informacion disponible).
- No se documentan capacidades de vision ni de audio en la informacion proporcionada.

## Casos de uso

- Despliegue en una sola GPU A100 80 GB: el modelo ocupa 41 GiB de pesos en INT4, por lo que permite servir Kolibri-1 sin necesidad de disponer de dos aceleradores, algo util para equipos con hardware limitado o para reducir coste de inferencia en la nube.
- Atencion al cliente en aleman e ingles: el modelo base conversacional y la cuantizacion permiten gestionar dialogos multi-turno en ambos idiomas; seria el escenario natural dado el soporte de idiomas declarado (no se especifica la ventana de contexto, dato que habria que confirmar).
- Procesamiento de documentacion tecnica en aleman: gracias al calibrado con Wikipedia en aleman, el modelo mantiene fidelidad relativamente alta en ese idioma (top-1 DE 91,5% frente a BF16), lo que lo hace adecuado para tareas de resumen o extraccion sobre textos germanos.
- Despliegue en vLLM como backend OpenAI-compatible: al usar la libreria vLLM, puede integrarse como servidor HTTP compatible con la API de OpenAI y encadenarse con aplicaciones existentes que ya consuman ese formato.
- Investigacion sobre cuantizacion: sirve como caso de estudio reproducible para medir el impacto de GPTQ INT4 group 128 sobre un modelo MoE de 78 B, comparando KL y top-1 frente a BF16 y FP8.
- Razonamiento asistido con formato estructurado: el parser `kolibri1` permite separar la traza de razonamiento de la respuesta final, util en pipelines que necesiten auditar o filtrar el proceso de pensamiento del modelo.
- Generacion aumentada por recuperacion (RAG): en combinacion con una capa de recuperacion de documentos, el modelo puede usarse para responder preguntas sobre corpus en aleman o ingles (sujeto a la longitud de contexto, dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo unico documentado son metricas de fidelidad de la cuantizacion frente a la version BF16 del modelo base:

| Metrica (vs BF16) | FP8 oficial | Esta cuantizacion (W4A16 GPTQ) |
|---|---|---|
| KL EN | 0,010 | 0,013 |
| KL DE | 0,060 | 0,069 |
| Top-1 EN | 97,2% | 96,5% |
| Top-1 DE | 91,5% (columna DE del oficial: 92,8%) | 91,5% |

Nota: la tabla de la model card original presenta los valores de top-1 EN y DE para cada version. No se dispone de otros datos de rendimiento.

## Requisitos de hardware

- Peso de los pesos en INT4: 41 GiB (dato de la model card). Tamano del repositorio completo: 44,2 GB.
- GPU recomendada segun el autor: una unica NVIDIA A100 de 80 GB. La version FP8 oficial requiere dos GPU.
- No se confirma que quepa en GPU de consumo (por ejemplo RTX 4090 de 24 GB): con 41 GiB de pesos en INT4, no cabria en una GPU de 24 GB sin tecnicas adicionales de offload a CPU o reparto en varias tarjetas.
- Opciones de despliegue: vLLM (libreria declarada). Requiere instalar `aleph-alpha-inference>=1` y arrancar con `vllm serve Padakovec/Kolibri-1-W4A16-GPTQ --reasoning-parser kolibri1`.
- Otras opciones como llama.cpp, Ollama o TGI: no disponibles para este formato (los pesos son safetensors/compressed-tensors orientados a vLLM).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Padakovec/Kolibri-1-W4A16-GPTQ | 78,1 B (totales) | no disponible | INT4 GPTQ W4A16 | Apache 2.0 | HuggingFace, vLLM |
| Aleph-Alpha/Kolibri-1-BF16 (base) | 78,1 B (totales) | no disponible | BF16 | Apache 2.0 (ver terminos) | HuggingFace |
| Aleph-Alpha/Kolibri-1 (FP8 oficial) | 78,1 B (totales) | no disponible | FP8 | Apache 2.0 (ver terminos) | HuggingFace |

No se dispone de datos suficientes sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada, por lo que no se incluyen mas alternativas. Los unicos puntos de comparacion documentados son las tres variantes (BF16, FP8 y esta cuantizacion INT4) del mismo modelo base.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: no la publica Aleph Alpha, sino el usuario Padakovec, por lo que no cuenta con el respaldo ni el soporte del desarrollador original.
- Perdida de fidelidad respecto a BF16: el propio autor reporta KL EN 0,013 y KL DE 0,069, y top-1 DE 91,5% (frente a 92,8% del FP8 oficial). La degradacion en aleman es mayor que en ingles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en la informacion disponible.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo.
- Idiomas: solo aleman e ingles declarados; no hay soporte documentado de castellano.
- Longitud de contexto y parametros activos: no disponibles, lo que limita la planificacion de despliegues con requisitos de contexto largo.
- Restricciones de licencia: aunque la licencia es Apache 2.0, la model card remite a los terminos de licencia originales de Aleph Alpha/Kolibri-1, que conviene revisar antes de un uso comercial.
- Metricas de adopcion nulas en el momento de la consulta (0 descargas, 0 likes), lo que implica poca validacion por parte de la comunidad.
- Formato atado a vLLM: no es portable directamente a otros runtimes sin conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Padakovec/Kolibri-1-W4A16-GPTQ
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Terminos de licencia original: https://huggingface.co/Aleph-Alpha/Kolibri-1#license-and-terms
- Modelos cuantizados de Aleph-Alpha/Kolibri-1 en HuggingFace: https://huggingface.co/models?other=base_model:quantized:Aleph-Alpha/Kolibri-1
- Kolibri 1 en Tokenstead: https://tokenstead.ai/models/kolibri-1
- GPTQModel (herramienta de cuantizacion): https://github.com/ModelCloud/GPTQModel
