# alfaplus/public-sft-qwen9b-v1

\n\n{response}<|im_end|>`
- Liger kernel, sdpa, gradient checkpointing
- Hardware: single GPU, 23.5 GiB visible, peak 11.9 GiB
- Duration 4957 s (~1.38 h), 250.5 tok/s, 413,852 tokens per epoch
- Software: torch 2.13.0, transformers 5.15.0, peft 0.20.0, bitsandbytes 0.50.1, liger-kernel 0.8.1
- Train loss: step 5 = 1.860, step 450 = 0.966, mean 1.284
- Target modules: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj — only text decoder (vision/audio towers and MTP layers excluded)
- Base loaded with AutoModelForImageTextToText; architecture Qwen3_5ForConditionalGeneration
- Data: 15011 records → drop 210 (>1024 tok, 1.4%) → seed 42 shuffle → 2400
- Length distribution: p50=116 / p90=400 / p99=1199 / max=8616
- Languages: en
- Created 2026-10-14
- Repo size 0.4 GB
- Downloads 0, likes 0

Note: Qwen3.5-9B is hypothetical/fictional (current date in this scenario is 2026). I must not invent data. The base model specs (parameters, context) are not provided. I should mark "no disponible" for those. But I should be careful — the base model is "Qwen/Qwen3.5-9B", 9B suggests ~9B parameters, but I shouldn't invent. Actually the name suggests 9B params. Hmm, I could say "9B (segun la denominacion del modelo base; no se detalla en la informacion proporcionada)". That's reasonable — the name implies it. But strictly it's not confirmed. I'll note it as inferred from the name. Actually, "Parametros totales" for the adapter repo: the adapter has 86,556,672 trainable params. The base model ~9B per naming.

Let me be careful: the ficha is about the model alfaplus/public-sft-qwen9b-v1, which is a LoRA adapter, not a full model. So the technical specs should reflect the adapter, but also describe the base.

Idiomas: en only (training data English). Base model languages: not stated.

Cuantizacion: base loaded in 4-bit NF4 (QLoRA); adapter weights fp32. GGUF not available.

Formato de pesos: safetensors (adapter_model.safetensors, fp32).

Longitud de contexto: max_seq_len 1024 during training. Base model context not provided — no disponible. The adapter was trained at 1024.

Arquitectura: LoRA adapter over Qwen3.5-9B (Qwen3_5ForConditionalGeneration), which is a multimodal architecture (image-text-to-text, vision/audio towers, MTP layers) — but here only text decoder got LoRA. Hmm, this suggests Qwen3.5-9B is multimodal. I'll mention that the base is loaded with AutoModelForImageTextToText and has vision/audio towers plus MTP layers, but the adapter only covers the text decoder. I should be careful to present this as reported.

Benchmarks: none. Explicitly state no benchmarks.

Hardware requirements: For inference of base+adapter. Peak training VRAM 11.9 GiB with 4-bit NF4 on 23.5 GiB card. For inference: 4-bit ~ 5-6 GB, bf16 ~18-20 GB (for 9B). But I shouldn't invent... Hmm, the instructions say to estimate VRAM. I can give estimates but must be careful. The instructions say "VRAM estimada para inferencia (segun tamano y cuantizacion)". I think giving rough estimates based on 9B is acceptable as estimates, clearly marked as estimates. But rule: NO inventes datos. Hmm. There's tension. I'll provide estimates clearly labelled as estimates derived from the 9B size and the observed 11.9 GiB training peak, marking them as approximations. Actually, to be safe, I could reference the one concrete data point: 11.9 GiB peak with 4-bit base + LoRA training. For inference I'll note estimates marked as such.

Let me think: the guidance explicitly asks for VRAM estimates, so providing reasoned estimates labelled "estimacion" is fine and expected. I'll do that but flag them.

Comparison: similar models — I don't have data. Could compare with base Qwen3.5-9B (no adapter) and other Dolly-15k LoRA adapters. But benchmarks unknown. I'll present a table comparing base vs adapter (vs other SFT adapters) but note no benchmark data. Maybe mark "no disponible" for performance.

Let me write the ficha.

Structure titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Also note: model card is in Chinese and English. Author appears to be Chinese-speaking. Note this as a caveat maybe.

Casos de uso: min 6, concrete. Given it's an experimental adapter with only 2400 English examples, 3 epochs, no eval — use cases must be realistic and humble. E.g., prototyping, experimentation with PEFT pipelines, research on SFT, teaching, baseline for further fine-tuning, etc. I should be honest: not for production.

Let me write.

Specs table:
| Parametro | Valor |
| Arquitectura | LoRA sobre Qwen3.5-9B (arquitectura del checkpoint base: Qwen3_5ForConditionalGeneration); adaptador PEFT r=32, alpha=64, dropout 0,05 |
| Parametros totales | 86.556.672 parametros entrenables en el adaptador; modelo base de ~9B segun su denominacion (no se detalla el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len de entrenamiento); contexto del modelo base: no disponible |
| Tipos de cuantizacion | base cargado en 4-bit NF4 con doble cuantizacion (bitsandbytes) durante el entrenamiento; pesos del adaptador en fp32; no se publican pesos GGUF ni cuantizaciones del modelo fusionado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (pesos del adaptador); el dataset de entrenamiento es CC-BY-SA-3.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, fp32, 496 tensores) |

Now, "Parametros activos (solo si es MoE)" — the template says only if MoE. Since not MoE, I'll put "no aplica".

Hardware:
- Estimaciones (marcadas). Base 9B: bf16 ~18 GiB weights + KV, 4-bit ~5-6 GiB.
- Training: 1 GPU with 23.5 GiB visible, peak 11.9 GiB (4-bit NF4 + LoRA + gradient checkpointing + Liger).
- Consumer GPU: yes, fits in 24 GB cards (RTX 3090/4090) for training; inference in 4-bit fits in 8-12 GB.
- Deployment: vLLM, TGI, llama.cpp/Ollama require merging adapter (LoRA merged or GGUF conversion); PEFT/transformers native loading.
- Throughput: 250.5 tok/s during training (not inference).

Note about Attention: sdpa.

Important caveat about the base model loading: must use AutoModelForImageTextToText, not AutoModelForCausalLM, otherwise the text decoder weights may be silently missed.

Now let me write the whole thing carefully in Spanish (Spain), no emojis, only first word of headings capitalized.

Note: headings like "## Especificaciones tecnicas" — "Especificaciones" first word capital, "tecnicas" lowercase. Good.

Numbers in Spanish use dot for thousands? In Spain, thousands separator is a space or dot. I'll use dots for thousands (86.556.672) — that's Spanish convention. Fine.

Let me write.

Enlaces: HF URL, base model URL, dataset URL, DOI/license links, PEFT, etc. Only ones found. Base: https://huggingface.co/Qwen/Qwen3.5-9B. Dataset: https://huggingface.co/datasets/databricks/databricks-dolly-15k. License CC-BY-SA-3.0: https://creativecommons.org/licenses/by-sa/3.0/. Dolly paper — not mentioned; I shouldn't invent. Actually the dataset card exists; but I shouldn't invent links not in info. The model card mentions the dataset URL and license URL. I'll include HF model, base model, dataset, CC license. Maybe peft repo — not explicitly in the info. It mentions `peft 0.20.0` library. I'll skip or include peft as library mention? The instructions say include all relevant links found in the web search. I only have the model card. I'll list those found.

Maybe include the training recipe date, sha256? Not links.

Now writing.

For benchmarks: "No se han publicado resultados de benchmarks en la informacion disponible." Plus note the train loss figures.

Comparativa: compare with alternatives. I'll compare: this adapter vs base Qwen3.5-9B (sin adaptador), vs other Dolly-15k SFT adapters (generic, no data). Honestly, "no disponible" for many. I'll do a table:

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
- alfaplus/public-sft-qwen9b-v1 (adaptador LoRA) | 86,6M entrenables sobre base ~9B | 1024 (entrenamiento) | apache-2.0 | sin evaluacion | HF
- Qwen/Qwen3.5-9B (base) | ~9B | no disponible | apache-2.0 | no evaluado aqui | HF
- Otros adaptadores sobre Dolly-15k (p. ej. sobre Llama/Qwen) | no disponible | no disponible | variable | no disponible | no disponible

Hmm, mentioning "Llama" is fine as generic. But better be careful not to invent. I'll keep the third row generic as "adaptadores SFT publicos sobre databricks-dolly-15k: no disponible".

Actually maybe better to compare at the "instruction-tuned 7-9B" category. But no data. I'll present tables with "no disponible" where appropriate.

Let me finalize.

For capacidades: 
- Generacion de texto conversacional (ingles) en formato instruccion-respuesta
- Sigue instrucciones al estilo Dolly (cerradas, generacion abierta, resumen, extraccion de informacion, clasificacion, etc. según Dolly 15k categorías — the model card notes context field, so it supports context-based tasks)
- No hay evidencia de soporte verificado de tool calling / function calling
- No hay evidencia de razonamiento multi-paso o modo agente; el chat template incluye un bloque de pensamiento vacío
- Multilingue: solo en
- Al ser un adaptador LoRA sobre un base multimodal (checkpoint ForConditionalGeneration con torres de vision/audio), el adaptador NO modifica vision ni audio — only text decoder. So no vision capabilities added. Important caveat.

Good point to include: the base Qwen3.5-9B checkpoint is multimodal (auto model for image-text-to-text), but the adapter excludes vision/audio towers, so it does not add or modify multimodal behaviour. Also MTP layers excluded.

Casos de uso (6+):
1. Prototipado rapido de pipelines de SFT/PEFT
2. Reproducibilidad de recetas QLoRA (hyperparams, seed)
3. Punto de partida para fine-tuning adicional
4. Estudio de adaptacion a dominio Dolly (resumen, Q&A con contexto)
5. Evaluacion comparativa de metodos de ajuste (baseline)
6. Docencia / material didactico sobre LoRA
7. Pruebas de carga/despliegue en infra con adaptadores PEFT (S-LoRA, vLLM multi-LoRA)
8. Fusionado (merge) para crear un artefacto autonomo

I'll give concrete explanations.

Limitaciones:
- No evaluado (train loss only, no val set)
- 450 steps, 2400 examples, 3 epochs → underfitting/overfitting risk (train loss descended 1.860→0.966)
- Single seed 42, single run
- Sólo inglés
- Contexto 1024 tokens de entrenamiento; secuencias > 1024 truncadas en inferencia? Not exactly. Data >1024 dropped. Model may not behave well beyond 1024.
- Dataset CC-BY-SA-3.0 share-alike: relevance — the weights are apache-2.0, but derivative issues? The author states dataset license unchanged. Share-alike may apply to derivative works. Worth flagging as a caveat for comercial use: legal uncertainty about the share-alike on weights trained on CC-BY-SA data. State carefully.
- Alucinaciones inherent to base model; no mitigation trained
- Carga incorrecta con AutoModelForCausalLM puede descartar pesos del decodificador de texto silenciosamente
- Chat template includes empty thinking block: inference templates must match
- No soporte de tool calling verificado
- Not a product; zero downloads/likes, no community validation
- Model card written in Chinese/English

Good.

Let's write the final markdown. Avoid emojis. Only first word capitalized in headings.

Careful with "QLoRA" etc.

Also, note date: 2026-10-14 (created). Fine.

Write it.## Resumen

alfaplus/public-sft-qwen9b-v1 es un adaptador LoRA publicado por el usuario alfaplus sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo ni un producto: es el artefacto de una tanda de ajuste supervisado (SFT) realizada con QLoRA durante 3 epocas y 450 pasos de optimizador sobre un subconjunto de 2400 ejemplos del dataset publico databricks/dolly-15k. El autor lo describe explicitamente como un "experimento de laboratorio" y advierte que solo se entreno, sin ninguna evaluacion posterior.

El adaptador tiene r=32, alpha=64, dropout 0,05 y 86.556.672 parametros entrenables (496 tensores en fp32). Solo se aplica al decodificador de texto del modelo base: las torres de vision y audio y las capas MTP quedan excluidas, aunque el checkpoint de Qwen3.5-9B se cargue con la clase `AutoModelForImageTextToText` (arquitectura `Qwen3_5ForConditionalGeneration`).

Su relevancia es mas documental que de rendimiento: la model card aporta una trazabilidad inusualmente detallada (hashes sha256 del dataset y de los pesos, receta completa de hiperparametros, versiones exactas de software y tiempos de entrenamiento), lo que lo convierte en una referencia util para reproducir recetas QLoRA, pero no en una opcion apta para produccion. La licencia del adaptador es apache-2.0, mientras que el dataset de entrenamiento es CC-BY-SA-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-9B; arquitectura del checkpoint base: Qwen3_5ForConditionalGeneration (auto model for image-text-to-text); r=32, alpha=64, dropout 0,05, bias=none |
| Parametros totales | 86.556.672 parametros entrenables en el adaptador (496 tensores, fp32). Modelo base: aproximadamente 9B segun su denominacion, recuento exacto no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len usado en entrenamiento, con 0 muestras truncadas). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion (bitsandbytes) durante el entrenamiento; adaptador en fp32. No se publican pesos GGUF ni version fusionada cuantizada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 para los pesos del adaptador; el dataset de entrenamiento es CC-BY-SA-3.0 y su licencia no cambia con esta publicacion |
| Formato de pesos | safetensors (adapter_model.safetensors, fp32, 346.302.176 bytes, sha256 70e1b6560032be80ba1a2ccf8b0d7037cd179d426046aab33d2efb230d31c53a) + adapter_config.json + tokenizer.json, tokenizer_config.json y chat_template.jinja |

Datos adicionales de trazabilidad: el modelo base se entreno desde el snapshot con commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; el dataset de origen es `databricks-dolly-15k.jsonl` con sha256 `2df9083338b4abd6bceb5635764dab5d833b393b55759dffb0959b6fcbf794ec` (15.011 filas); el subconjunto efectivo tiene sha256 `ce43f3c6abecb9e4d792c1596e06ce1839f8a29fd424af04758c48456a28f417`.

## Arquitectura y entrenamiento

El entrenamiento es un QLoRA clasico: el modelo base se carga con bitsandbytes en 4-bit NF4 (doble cuantizacion) con dtype de computo bf16, y sobre el se insertan adaptadores LoRA de rango 32 con alpha 64 y dropout 0,05. Los modulos objetivo resueltos por `target_modules: auto` son q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, mas las proyecciones del bloque de atencion lineal del decodificador (in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj). Las torres de vision, la torre de audio y las capas MTP quedan fuera del ajuste, de modo que el adaptador no altera el comportamiento multimodal del base. La atencion se ejecuta con sdpa y se activa gradient checkpointing, con el kernel de Liger aplicado via `apply_liger_kernel_to_qwen3_5`.

La receta usa max_seq_len 1024, batch efectivo de 16 (4 por GPU x grad_accum 4), optimizador paged_adamw_8bit, learning rate 1e-4 con schedule coseno y warmup de 13 pasos (ratio 0,03), seed 42 y 3 epocas. En total son 450 pasos, 413.852 tokens por epoca, ejecutados en una sola GPU con 23,5 GiB de VRAM visible y un pico de 11,9 GiB en 4957 segundos (aproximadamente 1,38 horas) a 250,5 tok/s. El software empleado es torch 2.13.0, transformers 5.15.0, peft 0.20.0, bitsandbytes 0.50.1 y liger-kernel 0.8.1.

En cuanto a los datos, se parte de las 15.011 filas de dolly-15k, se descartan 210 (1,4%) por superar los 1024 tokens tras aplicar el chat template y se toma una muestra de 2400 ejemplos con `random.Random(42).shuffle`. Cada fila se convierte en un dialogo de dos turnos: `instruction` (+ `context` concatenado con doble salto de linea si existe) como user y `response` como assistant. El calculo de la perdida se restringe a los tokens de la respuesta del asistente, excluyendo el turno de usuario y los marcadores de plantilla. El chat template empleado anade un bloque de pensamiento vacio antes de la respuesta: `<|im_start|>assistant\n<think>\n\n</think>\n\n{response}<|im_end|>`. No hubo RLHF, DPO ni ninguna otra fase de alineamiento. La perdida de entrenamiento bajo de 1,860 en el paso 5 a 0,966 en el paso 450, con una media global de 1,284 (valor agregado del trainer), sin conjunto de validacion.

## Capacidades

- Generacion de texto conversacional en ingles siguiendo el formato instruccion-respuesta de dolly-15k.
- Tareas cubiertas por la distribucion del dataset: respuesta a preguntas cerradas, generacion abierta, resumen, extraccion de informacion, clasificacion y transformacion de texto.
- Manejo de tareas con contexto adicional: cuando el ejemplo original incluye un campo `context`, este se incorpora al turno de usuario.
- Capacidad multilingue: no. Solo se ha entrenado con datos en ingles.
- Tool calling / function calling: no hay evidencia de soporte verificado en la informacion disponible; el dataset no contiene ese tipo de ejemplos.
- Agentes y razonamiento multi-paso: no hay evidencia de soporte; el template incluye un bloque de pensamiento vacio, pero no se ha entrenado ni evaluado ningun modo de razonamiento explicito.
- Vision y audio: el checkpoint base es multimodal (`Qwen3_5ForConditionalGeneration`), pero las torres correspondientes quedan excluidas del adaptador, por lo que este no anade ni modifica capacidades multimodales.
- Capacidad de ajuste incremental: al ser un adaptador PEFT, puede combinarse con otros adaptadores o usarse como punto de partida para un SFT posterior.

## Casos de uso

- Reproduccion de recetas QLoRA: la model card documenta hashes, hiperparametros y versiones exactas de software, de modo que sirve como referencia verificable para replicar un entrenamiento PEFT de principio a fin.
- Prototipado rapido de pipelines de instruction tuning: permite validar un flujo completo (tokenizacion con chat template, enmascarado de perdida en el turno del asistente, guardado de adaptadores) antes de invertir en un entrenamiento mayor.
- Baseline para comparativas internas de metodos de ajuste: al ser un adaptador pequeno y con receta conocida, resulta util como punto de partida frente a variantes con distinto rango, learning rate o composicion de datos.
- Estudio de adaptacion al dominio de dolly-15k: util para analizar como un subconjunto pequeno (2400 ejemplos) de instrucciones genericas desplaza el comportamiento del modelo base en tareas de resumen, Q&A cerrado y extraccion.
- Pruebas de infraestructura de despliegue multi-LoRA: sirve para validar stacks que cargan adaptadores en caliente (por ejemplo, servidores con soporte PEFT o vLLM con adaptadores) sin necesidad de un modelo grande dedicado.
- Material didactico: el repositorio es un ejemplo autocontenido y de tamano reducido (0,4 GB) para explicar QLoRA, el papel de `target_modules: auto` y el enmascarado de perdida.
- Verificacion de procedimientos de fusion de adaptadores: util para probar scripts de `merge_and_unload` y la conversion posterior a otros formatos de pesos antes de llevarlos a produccion.
- Estudio de la interaccion con el chat template: el formato con bloque de pensamiento vacio lo hace apropiado para investigar como afecta la plantilla al comportamiento de un modelo con modo de razonamiento en el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que solo se realizo entrenamiento y que no se ejecuto ninguna evaluacion. Los unicos numeros publicados son de perdida sobre el propio conjunto de entrenamiento:

| Metrica | Valor |
|---|---|
| train_loss en el paso 5 | 1,860 |
| train_loss en el paso 450 (final) | 0,966 |
| train_loss media (agregado del trainer) | 1,284 |
| Conjunto de validacion | no existe |
| Evaluacion en benchmarks (MMLU, HumanEval, GSM8K, etc.) | no disponible |

Estos valores no son una metrica de calidad: sin conjunto de validacion ni evaluacion externa no permiten afirmar nada sobre la capacidad real del adaptador, y son compatibles tanto con una mejora efectiva como con sobreajuste a los 2400 ejemplos.

## Requisitos de hardware

- Entrenamiento observado: una sola GPU con 23,5 GiB de VRAM visible y un pico de 11,9 GiB, gracias a la carga en 4-bit NF4, gradient checkpointing y el kernel de Liger.
- VRAM estimada para inferencia con el adaptador (estimaciones derivadas del tamano del base, no medidas por el autor): en 4-bit, del orden de 6 a 8 GB de pesos mas cache KV; en bf16, del orden de 18 a 20 GB de pesos mas cache KV para 1024 tokens de contexto.
- GPU recomendadas para entrenamiento o inferencia en bf16: A100, H100, L40S, RTX 4090 o A6000. El entrenamiento tal como se documento cabe en una RTX 3090 o RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si. El adaptador en si ocupa unos 0,35 GB en fp32, y el base en 4-bit se ajusta a tarjetas de 12 GB o superiores.
- Opciones de despliegue: carga nativa con transformers y PEFT, que es el flujo documentado por el autor. Para vLLM, TGI, llama.cpp u Ollama seria necesario fusionar el adaptador con el base y, en el caso de llama.cpp u Ollama, convertir los pesos a GGUF (no se publica ninguna conversion).
- Nota critica de carga: el base debe cargarse con `AutoModelForImageTextToText` y la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. El autor advierte que usar `AutoModelForCausalLM` puede omitir silenciosamente pesos del decodificador de texto (solo con un aviso) y dejar el adaptador mal enganchado.
- Latencia y throughput: el unico dato publicado es de entrenamiento (250,5 tok/s, 4957 s para 450 pasos). No hay mediciones de latencia ni de throughput en inferencia.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| alfaplus/public-sft-qwen9b-v1 | 86,6M entrenables sobre base de ~9B | 1024 (entrenamiento) | apache-2.0 (adaptador); dataset CC-BY-SA-3.0 | sin evaluacion publicada | adaptador LoRA en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | apache-2.0 | no evaluado en esta ficha | pesos completos en HuggingFace |
| Otros adaptadores SFT publicos sobre databricks-dolly-15k | no disponible | no disponible | variable | no disponible | no disponible |

No se dispone de informacion sobre alternativas comparables con datos verificables de benchmarks en el material proporcionado, por lo que no es posible establecer una comparacion de calidad frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- No existe ninguna evaluacion. El autor lo declara de forma explicita: es un experimento de laboratorio, no un producto.
- Volumen de entrenamiento muy reducido: 2400 ejemplos, 3 epocas y 450 pasos, sobre una muestra de un dataset generico. El riesgo de sobreajuste o de mejora marginal es alto.
- Semilla unica (42) y una sola ejecucion: no hay evidencia de estabilidad de los resultados.
- Solo ingles. Cualquier uso en castellano u otro idioma carece de respaldo en los datos de entrenamiento.
- Contexto de entrenamiento de 1024 tokens. Se descartaron 210 ejemplos que lo superaban y no se valido el comportamiento en secuencias mas largas.
- Riesgo de alucinacion heredado del modelo base: no se aplico ninguna fase de alineamiento, RLHF ni DPO que lo mitigue, y la perdida se calculo exclusivamente sobre las respuestas del corpus.
- Ambiguedad de licencia en la cadena de datos: los pesos del adaptador se publican como apache-2.0, pero el dataset de origen es CC-BY-SA-3.0, con clausula de compartir igual. El autor indica que la licencia del dataset no cambia con esta publicacion, pero la interaccion entre la clausula share-alike y unos pesos derivados es un punto que conviene revisar antes de cualquier uso comercial.
- Sin soporte verificado de tool calling, agentes ni razonamiento multi-paso.
- Plantilla de chat especifica con bloque de pensamiento vacio. Si la plantilla usada en inferencia no coincide, el comportamiento puede degradarse de forma no evidente.
- Trampa de carga documentada: usar `AutoModelForCausalLM` puede descartar pesos del decodificador de texto sin error explicito.
- El adaptador no toca vision ni audio pese a que el base sea multimodal: no debe esperarse ninguna capacidad de ese tipo por el hecho de combinarlo con Qwen3.5-9B.
- Validacion social nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni replicas publicas. La model card esta redactada en chino e ingles, no en castellano.
- Fecha de creacion y actualizacion en 2026-10-14, con apenas 43 segundos entre ambas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfaplus/public-sft-qwen9b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Licencia del dataset (CC-BY-SA-3.0): https://creativecommons.org/licenses/by-sa/3.0/
