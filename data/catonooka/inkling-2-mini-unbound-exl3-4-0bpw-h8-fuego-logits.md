# catonooka/Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8-Fuego-Logits

## Resumen

Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8-Fuego-Logits es una cuantizacion EXL3 de 4.0 bits por peso (con cabeza de salida a 8 bits) del modelo `nokeepai/Inkling-2-Mini-Unbound`, un finetune "abliterated" (con los mecanismos de rechazo eliminados) y sin censura del modelo base `thinkingmachines/Inkling-2-Mini`. El modelo original es un MoE de 26.400 millones de parametros totales con unos 3.400 millones activos, 24 capas, 128 expertos por capa con 8 activos, atencion hibrida combinada con convoluciones cortas, codificador de vision y una ventana de contexto nativa de 1.048.576 tokens.

El trabajo lo publica el usuario `catonooka` como cuantizacion lista para ExLlamaV3, empaquetada en 13,9 GB (3 shards) y pensada explicitamente para caber en una unica RTX 3090 de 24 GB. La relevancia practica esta en que comprime un modelo multimodal de contexto millonario en un formato de 4 bits que, segun el autor, mantiene una divergencia KL de 0,004 frente al BF16 de origen, con velocidades medidas de 96,6 t/s en contextos cortos y 562 t/s de prefill a 42k tokens.

No obstante, conviene subrayar que no es un modelo original ni un checkpoint oficial: es una cuantizacion de terceros sobre una linea de finetunes sin censura, distribuida bajo licencia Apache 2.0 y con requisitos muy especificos de software (una build de exllamav3 con soporte para la arquitectura `Inkling2Loop`). No se ha ejecutado ningun benchmark de tasa de rechazo sobre esta cuantizacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2Loop (MoE transformer hibrido con atencion + convoluciones cortas, codificador de vision); arch `Inkling2LoopForConditionalGeneration`, `model_type: inkling2_loop` |
| Parametros totales | 26,4B (modelo fuente); 7.042.592.896 tensores reportados en safetensors del repo de cuantizacion |
| Parametros activos | ~3,4B |
| Longitud de contexto | 1.048.576 tokens nativos; 47k tokens de cache maxima verificada en 1x RTX 3090 con cache K8V8 |
| Tipos de cuantizacion | EXL3 4.0 bpw (cuerpo), 8 bpw (lm_head), 16 bpw (embeddings y vision, tensores bf16 conservados); codebook `mul1`; calibracion 250 filas x 2048 columnas, `out_scales: auto`; pase de reintento de outliers activado (0 tensores necesitaron reintento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (`quant_method: exl3`, generado con exllamav3 1.6.7.post1); safetensors; 13,9 GB en 3 shards; repositorio total 14,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Inkling2Loop: un transformer con mezcla de expertos de 24 capas y 128 expertos por capa, de los cuales 8 se activan por token, lo que da una relacion de aproximadamente 26,4B parametros totales frente a 3,4B activos. Combina atencion con convoluciones cortas (esquema hibrido) y anade un codificador de vision que habilita la modalidad image-text-to-text. El modelo fuente declara un contexto nativo de 1.048.576 tokens.

Sobre el entrenamiento del modelo original no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, fases de RLHF/DPO). Lo que si se documenta es la cadena de derivacion: `thinkingmachines/Inkling-2-Mini` como base, `nokeepai/Inkling-2-Mini-Unbound` como finetune abliterated y sin censura, y esta cuantizacion EXL3 realizada a partir de la materializacion completa en BF16 de esa linea (`electroglyph/Inkling-2-Mini-Unbound-BF16`, con los mismos pesos bajo nombres de tensor HF en `electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM`). El autor elimina deliberadamente el `hf_quant_config.json` heredado del checkpoint del vendor (metadatos modelopt/NVFP4) porque no describe estos tensores.

Como innovaciones tecnicas destacables del proceso de cuantizacion: se conservan embeddings y torre de vision en 16 bits, se eleva la cabeza de salida a 8 bits para preservar la fidelidad de los logits, y se documenta que el drafter DSpark/MTP del vendor resulta mas lento que el modelo base sobre esta cuantizacion (51 frente a 92 t/s), por lo que se recomienda servir sin decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 1.048.576 tokens nativos).
- Razonamiento con control de esfuerzo: el parametro `reasoning_effort` acepta `none`, `minimal`, `low`, `medium`, `high`, `xhigh` y `max` (por defecto `high`), y la longitud del bloque de pensamiento escala con el nivel elegido.
- Vision: procesamiento de imagenes a traves de la torre de vision conservada en 16 bits; pipeline `image-text-to-text`.
- Tool calling / function calling: la plantilla de chat declara herramientas en un mensaje de sistema y usa marcadores especificos (`<|content_invoke_tool_json|>`); los argumentos de las llamadas en el historial del asistente deben ser objetos ya parseados, no cadenas JSON.
- Capacidades de agente y razonamiento multi-paso, con soporte de solicitudes de autocompactacion de contexto (verificado con una conversacion de 42k tokens).
- Capacidades multilingues: no disponible.
- Modo sin censura / abliterated: se eliminan los mecanismos de rechazo del modelo original (linaje `uncensored`, `abliterated`, `unbound`).
- Marcadores de chat propios: `<|message_role|>`, `<|content_text|>`, `<|content_thinking|>`, `<|content_invoke_tool_json|>`; EOS `<|content_model_end_sampling|>` (id 200006).

## Casos de uso

- Asistente conversacional de contexto largo en una sola GPU de consumo: con 47k tokens de cache verificada en una RTX 3090 usando cache K8V8, permite mantener conversaciones tecnicas extensas o analizar documentos largos sin salir del hardware local.
- Analisis de imagenes y documentos escaneados: la torre de vision en 16 bits permite pasar prompts con imagen y obtener descripciones, extraccion de datos o respuestas sobre el contenido visual, integrable en flujos de digitalizacion de facturas o informes.
- Agente con tool calling en pipelines internos: la plantilla declara herramientas en el mensaje de sistema y emite llamadas en `content_invoke_tool_json`, lo que encaja en orquestadores que necesiten consultar APIs, bases de datos o sistemas de ficheros de forma automatizada.
- Generacion de codigo y asistencia tecnica en local: el modelo conserva la cabeza de salida a 8 bits para mantener fidelidad en los logits, algo relevante cuando se necesita precision en la seleccion de tokens de codigo y en tareas de refactorizacion o explicacion.
- Razonamiento con presupuesto de computo ajustable: el control `reasoning_effort` permite fijar `low` o `minimal` para tareas de clasificacion o extraccion rapida y `high`/`max` para problemas de matematicas o planificacion, ajustando latencia y tokens generados.
- Despliegue on-premise con requisitos de privacidad: al caber en 24 GB de VRAM y no requerir servicios externos, es apto para entornos donde los datos no pueden salir de la infraestructura del cliente.
- Investigacion sobre alineacion y comportamiento sin rechazo: el linaje abliterated lo hace util para estudiar como se comporta un modelo sin mecanismos de refusal, siempre con las cautelas eticas correspondientes.
- Procesamiento por lotes de resumenes y extraccion sobre corpus largos: el prefill de 562 t/s a 42k tokens permite amortizar la fase de codificacion cuando se reutiliza el mismo contexto para varias generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta controles de calidad y mediciones de velocidad sobre 1x RTX 3090 (24 GB), single stream y decodificacion greedy:

| Metrica | Resultado |
|---|---|
| KL frente al BF16 de origen | 0,004 |
| Needle-in-a-haystack | acierto a 40k de contexto |
| Conversacion de 42k tokens + solicitud de autocompactacion | superada |
| Vision (prompt con imagen por torre de 16 bits) | superada |
| Control de nivel de pensamiento (`reasoning_effort`) | superado |
| Reintento de outliers | 0 tensores necesitaron reintento |

| Contexto | Cache K/V fp16 | Cache K8V8 |
|---|---|---|
| 125 tokens | 96,6 t/s | 90,3 t/s |
| 6,8k tokens | 87,7 t/s | 78,2 t/s |
| 12,3k tokens | 84,4 t/s | 73,4 t/s |

Prefill: 562 t/s con un prompt de 42k tokens. El drafter DSpark/MTP del vendor rinde peor que el modelo base sobre esta cuantizacion (51 frente a 92 t/s).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 13,9 GB; con cache K8V8 cabe una cache de hasta 47k tokens en una tarjeta de 24 GB. Con cache fp16 el margen se reduce proporcionalmente.
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo declarado y verificado por el autor. Cualquier GPU con 24 GB o mas (RTX 4090, A100, H100) deberia poder alojarlo con mayor holgura, aunque no se han publicado mediciones en esas tarjetas.
- Cabe en GPU de consumo: si, en RTX 3090 de 24 GB; en tarjetas de 16 GB no hay datos publicados y los 13,9 GB de pesos dejan muy poco margen para cache y activaciones.
- Opciones de despliegue: exclusivamente ExLlamaV3 con soporte para la arquitectura Inkling2Loop. Se requiere una build concreta (fork local del kernel Inkling2, rama `feat/inkling2-loop-v1.6.7`, commit `67b53f63`, sobre la rama Inkling2 de `vcruz305/exllamav3` fusionada con upstream v1.6.7). Las releases estandar de exllamav3 sin soporte Inkling2 no cargan el modelo. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 96,6 t/s a contexto corto con cache fp16 y 90,3 t/s con K8V8; 84,4 t/s a 12,3k tokens con fp16 y 73,4 t/s con K8V8; prefill de 562 t/s a 42k tokens. Todo medido en single stream sobre una RTX 3090.
- Nota de carga: el objeto `Cache` debe crearse antes de llamar a `model.load()`; el ejemplo del autor usa `max_num_tokens = 47104`, `max_history = 1`, `max_batch_size = 1` y `max_chunk_size = 2048`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8 (este) | 26,4B totales / ~3,4B activos | 1.048.576 nativos; 47k verificados en 24 GB | EXL3 4.0 bpw, 13,9 GB | Apache 2.0 | Hugging Face, requiere exllamav3 con Inkling2Loop |
| nokeepai/Inkling-2-Mini-Unbound (BF16) | 26,4B totales / ~3,4B activos | 1.048.576 | BF16 | no disponible en la informacion proporcionada | Hugging Face |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / ~3,4B activos | 1.048.576 | pesos originales del vendor | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria; la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- No es un modelo oficial: cuantizacion de terceros sobre un finetune de terceros, sin afiliacion con Thinking Machines ni con nokeepai.
- Linaje sin censura: los mecanismos de rechazo han sido eliminados (abliterated). No se ejecuto ningun benchmark de tasa de rechazo sobre esta cuantizacion, por lo que el comportamiento real ante peticiones sensibles es incierto y requiere evaluacion propia antes de cualquier uso en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calibracion; el proceso de cuantizacion a 4 bits puede degradar matices en tareas de facto.
- Dependencia fragil de software: solo carga con una build especifica de exllamav3 con soporte Inkling2Loop; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue estandarizado y la portabilidad.
- Contexto efectivo limitado por hardware: aunque el modelo declara 1M de tokens, en una RTX 3090 el autor solo verifico 47k tokens de cache con K8V8; usar contextos mayores exige GPUs con mas VRAM o estrategias de compactacion.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Formato de chat estricto: los argumentos de tool calling en el historial del asistente deben ser objetos parseados, no cadenas JSON; la plantilla lanza error en caso contrario, lo que puede romper integraciones descuidadas.
- Sin decodificacion especulativa recomendada: el drafter DSpark/MTP del vendor es mas lento que el modelo base sobre esta cuantizacion, por lo que no debe activarse esperando ganancias.
- Licencia Apache 2.0 favorable al uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la idoneidad de la linea abliterated para productos dirigidos al publico general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catonooka/Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8-Fuego-Logits
- Modelo base de la cuantizacion: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Materializacion BF16 (layout del vendor): https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16
- Materializacion BF16 con nombres de tensor HF: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM
- Fork de exllamav3 con soporte Inkling2: https://github.com/vcruz305/exllamav3
