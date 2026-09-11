# HYPR4AI/Gemma-4-12B-MXFP4A16-Text-Only

## Resumen

Gemma-4-12B-MXFP4A16-Text-Only es un checkpoint cuantizado experimental publicado por HYPR4AI a partir de `google/gemma-4-12B-it`. Se ha comprimido en el esquema MXFP4A16 (pesos en MXFP4, activaciones en 16 bits) usando la herramienta `llmcompressor` y el formato `compressed-tensors`, partiendo del modelo base en BF16 y no del checkpoint FP8. El resultado ocupa aproximadamente 7,4 GB en disco (~6,6 GB comprimido), lo que reduce de forma considerable el espacio frente a la version original.

La particularidad del checkpoint es que se ha convertido a texto unicamente: las filas de embedding asociadas a tokens especiales de imagen y audio se han puesto a cero, de modo que el modelo carga con el tooling de Gemma 4 pero debe servirse bloqueando entradas multimodales. Esto lo orienta a generacion de texto y QA con contexto, con experimentos de servicio de baja huella y comparacion frente a la version FP8.

El modelo se distribuye bajo licencia Apache 2.0, aunque al derivar de un modelo de la familia Gemma 4 quedan sujetos los terminos especificos de Google para dicha familia. La unica metrica publicada por el autor es un benchmark sobre HotpotQA Distractor, con un 64,05 % de Exact Match y un 87,36 % de respuestas exactas o parcialmente correctas sobre 459 peticiones exitosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalles especificos no disponibles |
| Parametros totales | ~12.000 millones (derivado de la nomenclatura del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue con vLLM usa `--max-model-len 2048`) |
| Tipos de cuantizacion | MXFP4A16 (pesos MXFP4, activaciones 16 bits) |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0, con terminos aplicables de Gemma 4 |
| Formato de pesos | Checkpoint `compressed-tensors` (cuantizacion MXFP4A16); contenedor de pesos no especificado explicitamente |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una compresion directa del checkpoint `google/gemma-4-12B-it` en BF16. La cuantizacion se aplico con `llmcompressor` bajo el esquema MXFP4A16, dirigida a capas `Linear`. Se excluyeron del proceso de cuantizacion los patrones `lm_head`, `re:.*embed.*`, `re:.*router.*`, `re:.*vision.*`, `re:.*audio.*`, `re:.*multimodal.*` y `re:.*image.*`, de modo que las partes sensibles (cabeza de salida, embeddings y componentes multimodales) permanecen en mayor precision o se neutralizan.

Como paso adicional de conversion a texto, las filas de embedding de los probables tokens especiales de imagen y audio se pusieron a cero, aunque las entradas del tokenizer y la arquitectura siguen presentes para permitir la carga con el tooling de Gemma 4. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de decodificacion o atencion.

## Capacidades

- Generacion de texto en ingles.
- QA anclado a contexto: el benchmark publicado evalua respuestas basadas exclusivamente en pasajes proporcionados, incluidas preguntas que requieren combinar hechos de varios pasajes.
- Respuestas cortas y extractivas: el prompt de referencia pide devolver solo la respuesta mas breve correcta.
- Servicio de baja huella: el checkpoint comprimido esta pensado para despliegues con recursos limitados.
- Compatibilidad con vLLM mediante `--quantization compressed-tensors`.
- No soporta entrada de imagen ni de audio (las entradas multimodales deben bloquearse).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card declara unicamente ingles.
- Modo de pensamiento (thinking): no disponible.

## Casos de uso

- Atencion al cliente con base documental: el modelo puede responder preguntas ancladas a un contexto de referencia, con un perfil extractivo que reduce respuestas elaboradas de mas, apoyandose en su ventana de contexto (aunque el ejemplo de despliegue limita a 2048 tokens).
- QA sobre documentacion tecnica interna: servir el checkpoint con vLLM y alimentar pasajes recuperados por un sistema RAG para obtener respuestas breves y verificables.
- Recuperacion de respuestas en pipelines RAG: su naturaleza extractiva y sus latencias de 0,48 s en P50 lo hacen apto como generador final de respuestas cortas sobre fragmentos ya seleccionados.
- Experimentos de cuantizacion en investigacion: comparar el rendimiento de MXFP4A16 frente al checkpoint FP8 o al base BF16 en tareas de QA con contexto.
- Despliegue en hardware de gama media: al ocupar ~7,4 GB, puede servirse en GPU de consumo con suficiente VRAM para prototipos y demos internas.
- Evaluacion comparativa de esquemas de compresion: usar el benchmark de HotpotQA como referencia reproducible para medir la perdida de calidad introducida por la cuantizacion.
- Extraccion de respuestas factuales en herramientas internas: dado el prompt de respuesta corta, encaja en asistentes que devuelven nombres, fechas, lugares o cifras copiados del contexto.

## Benchmarks y rendimiento

Unica metrica publicada por el autor: HotpotQA Distractor, `validation[0:500]`, servido como `fp4-gemma`.

| Metrica | Valor |
|---|---:|
| Preguntas | 500 |
| Peticiones exitosas | 459 |
| Fallos | 41 |
| Exact Correct | 294/459 |
| Exact Match | 64,05 % |
| Token F1 | 78,69 % |
| Exact + Partial | 401/459 = 87,36 % |
| Latencia media | 0,54 s |
| Latencia P50 | 0,48 s |
| Latencia maxima | 1,94 s |
| Tokens de salida totales | 2341 |
| Tokens de salida medios | 5,10 |
| Tokens de salida por segundo | 9,46 |

No hay resultados comparativos con otros modelos en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la documentacion proporcionada.

## Requisitos de hardware

- Tamano del checkpoint: ~7,4 GB en carpeta, ~6,6 GB comprimido.
- VRAM estimada para inferencia: en torno a 8-10 GB con contexto corto, sumando pesos MXFP4 y cache KV; el ejemplo de vLLM reserva con `--gpu-memory-utilization 0.45`.
- GPU consumer compatibles: tarjetas con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090). Cabe en varias GPU de gama media-alta.
- GPU de centro de datos: A100, H100 y equivalentes, con margen amplio para contextos mayores o lotes mas grandes.
- Despliegue: probado con vLLM (`--quantization compressed-tensors --dtype bfloat16 --enforce-eager`). Para vLLM es necesario que el checkpoint incluya `processor_config.json`.
- Bloqueo multimodal obligatorio al servir: `limit_mm_per_prompt={"image": 0, "audio": 0}`.
- Throughput observado en el benchmark: 9,46 tokens de salida por segundo y latencia media de 0,54 s con `--enforce-eager` y peticiones cortas.
- Otros runners (llama.cpp, Ollama, TGI): no disponible; la model card solo documenta vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-MXFP4A16-Text-Only | ~12B | no disponible | MXFP4A16 / compressed-tensors, ~7,4 GB | apache-2.0 + terminos Gemma 4 | Solo texto; 64,05 % EM en HotpotQA |
| google/gemma-4-12B-it (BF16) | ~12B | no disponible | BF16 | terminos Gemma 4 | Modelo base multimodal original |
| Checkpoint FP8 de gemma-4-12B | ~12B | no disponible | FP8 | terminos Gemma 4 | Mencionado como referencia de comparacion; sin ID ni datos publicados |

No se dispone de datos de rendimiento de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla del tamano y el formato.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor lo describe como experimental y de solo texto.
- Debe servirse con las entradas multimodales bloqueadas; los embeddings de imagen y audio estan puestos a cero.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: no evaluado de forma especifica; el benchmark mide respuestas ancladas a contexto, no generacion libre.
- Limitacion de idioma: la model card declara unicamente ingles; no se garantiza calidad en otros idiomas.
- Longitud de contexto: no especificada; el ejemplo de servicio usa `--max-model-len 2048`, lo que limita el tamano de contexto en ese despliegue concreto.
- Licencia: aunque se etiqueta como apache-2.0, al derivar de `google/gemma-4-12B-it` aplican los terminos de Gemma 4; conviene revisarlos antes de uso comercial.
- Tasa de fallo: 41 de 500 peticiones no completaron correctamente en el benchmark publicado (8,2 %).
- Rendimiento de serving bajo: 9,46 tokens/s con `--enforce-eager`; no representa una configuracion optimizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYPR4AI/Gemma-4-12B-MXFP4A16-Text-Only
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa

Nota: la busqueda web proporcionada no devolvio resultados relevantes para este modelo (unicamente paginas de una biblioteca universitaria), por lo que no se incluyen enlaces adicionales de papers, blogs o repos.
