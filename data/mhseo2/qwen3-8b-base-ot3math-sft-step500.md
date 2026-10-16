# mhseo2/Qwen3-8B-Base-OT3Math-SFT-step500

traces ending \boxed{}
- Plain ChatML template, no thinking logic, Qwen3-8B-Base vocab with Instruct-2507 template
- eos 151645 (<|im_end|>) in config.json and generation_config.json
- Not yet evaluated
- Downloads 0, likes 0

Note the model card is for step 500 of 2000 — intermediate checkpoint, not evaluated.

Architecture: Qwen3-8B-Base — dense transformer, decoder-only. Context length of base Qwen3-8B is 32,768 natively (extendable to 131072 with YaRN). But I should be careful: the info provided says sequence length for training is 32768. Qwen3-8B native context is 32,768 tokens, with YaRN to 131,072. I could state it but mark as derived from base model — I should be careful not to invent. I think it's reasonable to state the base model's architecture is a decoder-only dense transformer. Actually I should be careful: is Qwen3-8B dense? Yes, Qwen3-8B is a dense model (the MoE variants are 30B-A3B and 235B-A22B). But that's external knowledge — I'll state it as a reasonable description but perhaps flag. I think it's fine to describe architecture as decoder-only transformer dense based on base model, and note context 32,768 per the training config, with the caveat.

Hmm, the rules say no inventing data. But general knowledge about Qwen3-8B is reasonable. I'll be careful to phrase things like "el modelo base Qwen3-8B es un transformer decoder-only denso" — that's widely known. For context length, I'll say 32.768 tokens (longitud de secuencia de entrenamiento; el modelo base Qwen3-8B soporta 32.768 nativos y hasta 131.072 con YaRN) — but mark YaRN as not confirmed in the provided info. Actually I'll just mention 32.768 from training and note the base's extension capability as "no confirmado en la información disponible". Safer: state 32.768 tokens and note that the base model documents extension up to 131.072 con YaRN, sin confirmar en esta ficha. Hmm, might be fine. I'll include with a caveat.

Quantization types: no official GGUF/quantizations provided; safetensors bf16, but quantization possible via llama.cpp/AWQ etc. I'll say "no se publican cuantizaciones oficiales; al ser safetensors bf16 se puede cuantizar (GGUF, AWQ, GPTQ) con herramientas externas".

Languages: no disponible (the HF tags didn't list languages). Base Qwen3 supports 119 languages — but I don't have it in provided info. I'll say "no disponible" and note the training data is English math presumably. Actually OpenThoughts3 is English. I'd say "no disponible; los datos de entrenamiento son de razonamiento matemático (OpenThoughts3), predominantemente en inglés".

Benchmarks: none. "No se han publicado resultados de benchmarks en la información disponible."

Hardware: 8.19B params, bf16 → ~16.4 GB weights, plus activations & KV cache. At 32k context, KV cache: Qwen3-8B has 36 layers, GQA with 8 KV heads, head_dim 128 → KV per token per layer = 2*8*128 = 2048 elements → 2 bytes bf16 = 4096 bytes = 4 KB per token per layer? Let me compute: 8 KV heads * 128 head dim = 1024 elements per K, 1024 for V = 2048 elements per layer per token; 36 layers → 73728 elements per token; bf16 → 147456 bytes ≈ 144 KB per token. At 32768 tokens → ~4.7 GB. Hmm, that's a computation using assumed architecture numbers which I shouldn't invent. I'll give estimates more carefully with caveats. Maybe I'll present VRAM estimates for weights only and note KV cache depends. Let me keep it: bf16 ~16.4 GB (weights, from repo size), 8-bit ~8-9 GB, 4-bit ~5 GB. These are typical estimates derived from parameter count — reasonable and I'll label as estimaciones.

Let me be careful: repo size 16.4 GB includes weights. So bf16 ~16.4 GB.

- FP16/BF16: ~16,4 GB pesos → en GPU de 24 GB (RTX 4090, L40S, A5000) cabe con contexto moderado; en 32k pueden faltar. 2x RTX 4090 o 1x A100 40GB.
- Cuantizado 8 bits: ~8-9 GB → RTX 4070 Ti Super / 4080 16GB, RTX 3090.
- 4 bits: ~5 GB → RTX 3060 12GB, RTX 4060 Ti 16GB, incluso Mac con 16 GB unificada.

Deployment: vLLM (note eos config issue — the card says stock eos 151643 never terminates under vLLM, but this checkpoint config says 151645), TGI (endpoints_compatible tag), transformers, llama.cpp/Ollama (requires GGUF conversion).

Comparativa: Qwen3-8B (base, apache-2.0, 8.19B, 32k), Qwen3-8B-Instruct? DeepSeek-R1-Distill-Qwen-7B (apache-2.0, 7.6B, 128k? actually 128k context). Also OpenThinker-7B. I should be careful about specifics I'm not certain of. DeepSeek-R1-Distill-Qwen-7B: 7.6B params, 128k context, MIT license... Actually DeepSeek-R1 distilled models use MIT license. Hmm. Let me use: Qwen3-8B-Base (base), Qwen3-8B (post-trained instruct) — apache-2.0, and OpenThinker-7B (based on Qwen2.5-7B, apache-2.0). I'll mark uncertain fields as "no disponible" or be cautious. Maybe better to keep comparativa simple with the base model and note others with data I'm reasonably confident of, flagging that details should be verified.

I'll include a comparativa table: this model vs Qwen3-8B-Base (base), Qwen3-8B (instruct), and note "no disponible" for benchmarks for all rows since we have no benchmark data. Actually comparator table can compare params/context/license/availability without benchmark claims.

Let's write the ficha.

Titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Write it well.

For enlaces: HF page, base model Qwen/Qwen3-8B-Base, dataset knowledge-distillation/openthoughts3_math, verl repo. Note search results irrelevant.

Let me write.

Casos de uso — at least 6, concrete. This is a math reasoning SFT checkpoint, not yet evaluated, intermediate. So use cases should reflect that: research on SFT checkpoints, math reasoning, distillation data training, local math tutoring, pipeline for synthetic data generation of reasoning traces, evaluating thinking-format compliance, integration in vLLM/TGI as math solver backend, etc. Also caution it's not production-ready.

Let me produce it.## Resumen

`mhseo2/Qwen3-8B-Base-OT3Math-SFT-step500` es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario mhseo2 sobre el modelo base `Qwen/Qwen3-8B-Base`. El entrenamiento se ha realizado sobre `knowledge-distillation/openthoughts3_math`, un conjunto de 103.760 conversaciones de dos turnos orientadas a razonamiento matemático, y el checkpoint corresponde al paso 500 de los 2.000 previstos, lo que supone aproximadamente 1,23 épocas sobre los datos. El autor indica de forma explícita que el modelo no ha sido evaluado todavía.

Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción: su interés radica en documentar cómo evoluciona un Qwen3-8B-Base al aplicar SFT sobre trazas de razonamiento de OpenThoughts3, y en servir de referencia para reproducir el pipeline completo. Cuenta con 8.190.735.360 parámetros (8,19B) en formato safetensors bf16, con un repositorio de 16,4 GB, y se distribuye bajo licencia Apache 2.0.

Un detalle técnico relevante es el tratamiento del modo "thinking": durante el entrenamiento se ha usado una plantilla ChatML plana, sin la lógica de plantilla de Qwen3, de modo que los bloques `<think>...</think>` se aprenden como texto ordinario y el modelo no acepta ni necesita el parámetro `enable_thinking`. El token de fin de turno configurado es `<|im_end|>` (151645), no el `<|endoftext|>` (151643) que trae por defecto el `generation_config.json` del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de secuencia de entrenamiento; el modelo base Qwen3-8B documenta 32.768 nativos, extensibles a 131.072 con YaRN (no confirmado en esta ficha) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos en safetensors bf16, cuantificables externamente (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible en la model card; los datos de entrenamiento son de razonamiento matematico, predominantemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), repositorio de 16,4 GB |
| Token de fin de turno | `<|im_end|>` (151645), declarado en `config.json` y `generation_config.json` |
| Plantilla de chat | ChatML plana con vocabulario de Qwen3-8B-Base y plantilla Instruct-2507, sin logica de thinking |
| Checkpoint | Paso 500 de 2.000 planificados (~1,23 epocas) |
| Framework de entrenamiento | verl |
| Libreria de inferencia | transformers; compatible con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a `Qwen/Qwen3-8B-Base`: un transformer decoder-only denso de 8,19B parametros. El ajuste no modifica la topologia ni la tokenizacion, solo los pesos. El entrenamiento se ejecuto en precision bf16 con FSDP sobre 3 GPU, usando el framework verl, con optimizador AdamW, learning rate 5e-6, schedule coseno, 3% de warmup, weight decay 0,01 y recorte de gradiente de norma 1,0. El batch global fue de 255 y la longitud de secuencia de 32.768 tokens, suficiente para no truncar ninguna muestra del dataset (media de 13,8k tokens, percentil 99 de 16,8k y maximo de 16,8k).

El dato de entrenamiento es `knowledge-distillation/openthoughts3_math`, con 103.760 conversaciones de dos turnos. Cada mensaje del asistente es una traza de razonamiento `<think>...</think>` que termina en una respuesta con formato `\boxed{}`, y el modelo se entrena para reproducir exactamente ese formato. La decision tecnica mas destacable es el uso de una plantilla ChatML plana en lugar de la plantilla nativa de Qwen3: la plantilla de Qwen3 elimina los bloques `<think>...</think>` de todos los turnos del asistente excepto el ultimo, lo que habria borrado precisamente el objetivo de entrenamiento. Con la plantilla plana, el contenido del asistente se pasa literalmente y el bloque de razonamiento se aprende como texto normal. No consta el uso de RLHF, DPO ni otras etapas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto autoregresiva con trazas de razonamiento explicito encerradas en `<think>...</think>`, seguidas de una respuesta final con el resultado en `\boxed{}`.
- Razonamiento matematico: es la capacidad objetivo del ajuste, derivada del dataset OpenThoughts3 math.
- Razonamiento multi-paso con cadenas de pensamiento largas: la longitud media de las muestras de entrenamiento (13,8k tokens) implica que las respuestas generadas pueden ser extensas.
- Conversacion multi-turno: los datos de entrenamiento son conversaciones de dos turnos.
- Generacion de codigo: capacidad probablemente heredada del modelo base, pero no verificada ni potenciada por este ajuste (no hay benchmarks publicados).
- Soporte de tool calling / function calling: no documentado en la model card; al ser un ajuste sobre la variante Base y no sobre la Instruct, no hay garantia de soporte.
- Soporte de agentes y planificacion multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento es de razonamiento matematico predominantemente en ingles.
- Capacidades especiales: no hay vision, audio ni modo thinking conmutable; el razonamiento se emite siempre como texto plano dentro de la respuesta.

## Casos de uso

- Investigacion sobre SFT de razonamiento: sirve como checkpoint reproducible para estudiar como cambia un Qwen3-8B-Base tras 500 pasos de SFT sobre OpenThoughts3 math, y para comparar con los checkpoints posteriores del mismo run.
- Generacion de trazas de razonamiento sinteticas: dado que el modelo reproduce el formato `<think>...</think>` + `\boxed{}`, puede usarse para producir datos de destilacion matematica que alimenten otros entrenamientos, siempre que se filtren y validen las respuestas.
- Reproduccion de pipelines de entrenamiento: el checkpoint documenta configuracion de optimizer, batch, secuencia y framework (verl), por lo que es util como referencia para replicar el experimento a mayor escala.
- Evaluacion de formato y plantillas de chat: permite comprobar en la practica el efecto de usar una plantilla ChatML plana frente a la plantilla nativa de Qwen3 en la preservacion de los bloques de razonamiento.
- Pruebas de integracion en infraestructura de inferencia: al declarar correctamente `<|im_end|>` (151645) como token de fin, es adecuado para validar configuraciones de vLLM o TGI donde el modelo base fallaria por terminar con el token equivocado.
- Asistencia matematica en entornos controlados: se puede desplegar como resolvedor de problemas aritmeticos, algebraicos o de teoria de numeros para uso interno, asumiendo que no hay evaluacion publicada que respalde su precision.
- Estudio de degradacion o mejora de capacidades generales: comparar este checkpoint con el modelo base permite medir si el ajuste especializado en matematicas ha afectado a otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint "no ha sido evaluado todavia" y que se trata de un paso intermedio (500 de 2.000) de un entrenamiento planificado.

## Requisitos de hardware

- VRAM para pesos en bf16/fp16: aproximadamente 16,4 GB solo en pesos, segun el tamano del repositorio. A esto hay que sumar activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: estimacion de 8-9 GB; en 4 bits, estimacion de 5 GB. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPUs recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100, L40S, o 2x RTX 4090/A6000 si se necesita contexto largo. Una unica RTX 4090 (24 GB) puede alojar los pesos, pero el margen para 32k tokens de contexto es ajustado.
- Cabe en GPU de consumo: si, en cuantizaciones de 8 o 4 bits (RTX 3090, 4090, 4080, 4060 Ti 16 GB y similares). En bf16 completo requiere 24 GB o mas y limita mucho la longitud de contexto.
- Opciones de despliegue: transformers (ruta documentada por el autor), vLLM y text-generation-inference (el modelo esta etiquetado como `endpoints_compatible` y `text-generation-inference`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican cuantizaciones oficiales.
- Parametros de generacion sugeridos por el autor: `max_new_tokens` en torno a 16.384, `temperature` 0,6, `top_p` 0,95.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-Base-OT3Math-SFT-step500 (este) | 8,19B denso | 32.768 (entrenamiento) | Apache 2.0 | Checkpoint intermedio, sin evaluar, 0 descargas | SFT sobre OpenThoughts3 math, formato `<think>` + `\boxed{}` |
| Qwen/Qwen3-8B-Base | 8,19B denso | 32.768 nativos | Apache 2.0 | Modelo base publicado | Sin ajuste de instrucciones ni datos de matematicas especificos; punto de partida de este checkpoint |
| Qwen/Qwen3-8B (variante post-entrenada) | 8,19B denso | 32.768 nativos | Apache 2.0 | Modelo oficial con post-entrenamiento | Incluye plantilla de thinking propia con `enable_thinking`; no usa el mismo formato de trazas que este checkpoint |
| Alternativas de razonamiento matematico de ~7-8B (por ejemplo destilaciones de R1 sobre Qwen) | 7-8B denso | no disponible en esta ficha | no disponible en esta ficha | Publicadas por terceros | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion de rendimiento |

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparativa se limita a parametros, contexto, licencia y estado de publicacion.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara explicitamente que el checkpoint no ha sido evaluado. No debe asumirse ninguna calidad de razonamiento matematico sin validacion propia.
- Checkpoint intermedio: corresponde al paso 500 de 2.000, es decir, aproximadamente el 25% del entrenamiento planificado. Su comportamiento final puede diferir sustancialmente del modelo que resulte del run completo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir trazas de razonamiento coherentes en apariencia que conduzcan a un resultado incorrecto en el bloque `\boxed{}`. La ausencia de evaluacion agrava este riesgo.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni la composicion demografica o linguistica del dataset OpenThoughts3 math. La especializacion en matematicas puede degradar capacidades generales de conversacion o conocimiento factual.
- Limitaciones de idioma: no hay idiomas declarados en la model card y los datos son de razonamiento matematico predominantemente en ingles; el rendimiento en castellano no esta verificado.
- Plantilla no estandar: no acepta el parametro `enable_thinking` y espera una plantilla ChatML plana. Usar la plantilla nativa de Qwen3 puede romper el formato de las trazas de razonamiento.
- Gestion del token EOS: en vLLM, un checkpoint que herede el EOS 151643 del modelo base nunca terminaria la generacion. Este checkpoint declara 151645, pero conviene verificar la configuracion al desplegarlo.
- Consumo de tokens: al generar trazas completas de razonamiento, el numero de tokens de salida es alto (el autor recomienda hasta 16.384), lo que incrementa coste y latencia.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B-Base conviene revisar las condiciones del modelo base y del dataset OpenThoughts3 antes de un despliegue productivo.
- Procedencia y soporte: el repositorio tiene 0 descargas y 0 likes, y esta publicado por un usuario individual sin historial de mantenimiento. No hay garantia de actualizaciones ni de soporte.
- Inconsistencia de identificador: la model card usa el nombre `seomh/Qwen3-8B-Base-OpenThoughts3Math-SFT-step500-lr5e-6` en el ejemplo de uso, distinto del ID real del repositorio, lo que puede provocar errores al copiar el codigo de ejemplo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/Qwen3-8B-Base-OT3Math-SFT-step500
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/knowledge-distillation/openthoughts3_math
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron exclusivamente contenidos no relacionados (foros de consumo sobre FNAC).
