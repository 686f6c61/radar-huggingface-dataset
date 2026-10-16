# mhseo2/Qwen3-8B-Base-OT3Math-SFT-step250

traces ending in \boxed{}
- EOS token <|im_end|> (151645); config.json and generation_config.json both say so; Qwen3-8B-Base stock generation_config says 151643 which leads to never terminating under vLLM
- max_new_tokens ~16384
- Intermediate checkpoint step 250 of 2000; not yet evaluated
- Repo size 16.4 GB
- Created 2026-10-16
- Downloads 0, likes 0
- Languages: not available

Architecture: Qwen3-8B-Base — dense transformer. I know Qwen3-8B is a dense decoder-only transformer. But I should be careful not to invent. The provided info says base is Qwen/Qwen3-8B-Base. Qwen3-8B architecture details not in provided info — I could state "no disponible en la informacion proporcionada" but I know generally Qwen3-8B is dense, 36 layers, GQA, RoPE, 128K context natively. Hmm, the instruction says don't invent data; if not in the info provided, say "no disponible". I should be conservative. I could mention that the base model is Qwen3-8B-Base but the specific architecture details (layers, heads) are not detailed in the provided info. Actually I can say the model inherits architecture from Qwen3-8B-Base (dense transformer decoder-only), noting Qwen3 family is dense... but risk. I'll state: architecture = transformer decoder-only denso (heredada de Qwen3-8B-Base), sin detalles de capas/cabezas en la informacion disponible. That's reasonably safe — Qwen3-8B is indeed dense (Qwen3-8B is not MoE; MoE ones are 30B-A3B and 235B-A22B). I'm fairly confident. But I'll mark the specifics as no disponible.

Context length: training sequence length 32768. Native context of Qwen3-8B Base is 32768 in Qwen3 (Qwen3 models have 32768 native, extendable to 131072 with YaRN). Actually Qwen3 supports 32,768 native and 131,072 with YaRN. I shouldn't assert without info. I'll put "32.768 tokens en entrenamiento (SFT); contexto nativo del modelo base no detallado en la informacion disponible".

Quantization types: bf16 weights only; GGUF not available. So "solo bf16 (no se han publicado cuantizaciones GGUF/AWQ)".

Languages: no disponible — dataset likely English math. Say no disponible.

Formats: safetensors (bf16).

Benchmarks: none, model not evaluated.

Hardware: 8.19B params. bf16 ~16.4 GB weights. VRAM estimates: bf16 ~18-20 GB with overhead; fp16 similar; 8-bit ~9-10 GB; 4-bit ~5-6 GB. Deployment: transformers, vLLM (with EOS fix), TGI (endpoints_compatible tag). FSDP over 3 GPUs was used for training — suggests 3 GPUs; unspecified type.

Note the tag "endpoints_compatible" and "text-generation-inference".

Comparativa: alternatives — base Qwen/Qwen3-8B-Base, and other math reasoning SFT models like OpenThinker / OpenThoughts derivatives (OpenThinker2-7B? Actually OpenThoughts from open-thoughts org produces OpenThinker-32B, OpenThinker2-7B, OpenThinker3-7B). I can compare with Qwen3-8B (instruct) and DeepSeek-R1-Distill-Qwen-7B and OpenThinker3-7B. But must be careful not to invent numbers. I can present a table with columns: parameters, context, license, availability — and mark performance as no disponible since this model isn't evaluated. I can note that data of alternatives come from their public cards; but "no inventes datos". I'll keep it limited to things I'm confident about: Qwen3-8B (8.2B, Apache-2.0), Qwen3-8B-Base (Apache-2.0), DeepSeek-R1-Distill-Qwen-7B (7.6B, MIT license... actually DeepSeek-R1 distilled models are MIT licensed; the Qwen-based ones... DeepSeek-R1-Distill-Qwen-7B license is MIT with Qwen's? It's MIT). To be safe, mark licenses I'm unsure of as "no disponible"? Hmm. Better to mark clearly which fields are "no disponibles" from the provided info, and keep the comparison mostly structural. Or I could reduce risk by comparing with Qwen3-8B (base and instruct) only, plus mention others generically. Let me do a small table with Qwen3-8B-Base, Qwen3-8B (instruct), and this model; the Qwen3 ones are Apache-2.0 — I'm confident Qwen3-8B is Apache-2.0. Yes, Qwen3 models are Apache 2.0 (except the 235B which is also Apache 2.0). I'll add DeepSeek-R1-Distill-Qwen-7B with license MIT — I'm reasonably confident. Hmm, DeepSeek-R1 distilled models: "MIT License" for the DeepSeek-R1 model, and distills are MIT per DeepSeek's repo (they're released under MIT, with the Qwen-based ones also subject... ) I'll mark it as "MIT (segun su model card)" — risky. Maybe just avoid and say performance no disponible. I'll include it but write "no verificado en la informacion disponible". Actually simpler: compare only with Qwen3-8B-Base and Qwen3-8B, both Apache-2.0, and mention DeepSeek-R1-Distill-Qwen-7B as optional alternative with "licencia no verificada". Fine.

Also should mention the OpenThoughts3 dataset lineage — OpenThoughts3 is a dataset from open-thoughts (Bespoke Labs / Stanford). But the provided dataset id is "knowledge-distillation/openthoughts3_math" — a mirror. I shouldn't claim details.

Section: Capabilities — based on training: produces thinking traces in <think> tags, math reasoning with \boxed{} answers, two-turn conversations, instruction following via ChatML, long context 32768. Not verified: tool calling, function calling, multilingual, vision, agentic use — state as "no verificado / no disponible".

Casos de uso: min 6, concrete: 
1. Generación de cadenas de razonamiento matemático sintéticas (knowledge distillation, generación de datos de entrenamiento).
2. Resolución de problemas de competición / aritmética con respuesta final en \boxed{}.
3. Destilación de datos para entrenar modelos más pequeños.
4. Evaluación de pipelines de RL/verificación con recompensa basada en verifier de \boxed{}.
5. Fine-tuning posterior / research sobre SFT intermedio (checkpoint intermedio).
6. Serving con vLLM para batches de problemas matemáticos.
7. Tutoría matemática paso a paso (con caveat de que no está evaluado).
8. Ajuste con RLVR (GRPO) inicializado desde este checkpoint.

Requisitos hardware:
- bf16: ~16.4 GB pesos, VRAM práctica 20-24 GB (cabe en RTX 4090 24GB ajustado, A100 40GB, H100).
- int8: ~9 GB; int4: ~5.5 GB.
- Training: FSDP over 3 GPUs (bf16) con seq len 32768 — 3 GPUs de al menos 40-80 GB probablemente (no especificado).
- Deployment: transformers, vLLM (corrigiendo eos_token_id 151645), TGI (endpoints_compatible), llama.cpp solo si se convierten pesos a GGUF (no publicado).
- Latencia/throughput: no disponible.

Limitaciones:
- No evaluado ("Not yet evaluated").
- Checkpoint intermedio (step 250/2000).
- 0 descargas, 0 likes; sin validación de la comunidad.
- EOS token mismatch: config.json y generation_config.json dicen 151645 mientras que el stock de Qwen3-8B-Base dice 151643; con vLLM usar 151645 o el modelo no termina. Wait, re-read: "A turn ends with <|im_end|> (151645); config.json and generation_config.json both say so. Qwen3-8B-Base's stock generation_config.json says 151643 instead, which yields a model that never terminates under vLLM." So the repo's configs say 151645 (correct), but if you mix with the base's stock generation_config you get issues. Explain clearly.
- Plantilla ChatML sin lógica de thinking: no hay flag enable_thinking; el modelo siempre reproduce trazas <think> si el prompt sigue el formato. Qwen3's own template strips <think> from all but the last assistant turn.
- max_new_tokens ~16384.
- Idiomas no disponibles; probablemente solo inglés (dataset) — hmm, say "no disponible".
- Dataset de destilación de conocimiento (openthoughts3_math) → hereda sesgos y errores del generador.
- Riesgo de alucinación en problemas matemáticos (traza plausible con resultado erróneo).
- Licencia Apache-2.0 permite uso comercial, pero pesos derivados de Qwen3-8B-Base (Apache-2.0) — cumplimiento de atribución.
- No hay datos de benchmarks → no usar en producción sin evaluación propia.
- Fecha de creación 2026-10-16 (futura? whatever, just state it).

Enlaces: HF model page, base model page, dataset page, verl repo. Search results irrelevant — mention that the web search did not return relevant results? The instruction: "Lista con el enlace de HuggingFace y todos los enlaces relevantes encontrados en la busqueda web (papers, blogs, repos, demos)." The search results were irrelevant; I should state that no relevant links were found. Good.

Titles: only first word capitalized. So "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". Note: "Especificaciones tecnicas" - the mandatory structure given uses "Especificaciones tecnicas" without accent; I'll follow the given headers exactly. Actually I should keep accents for correct Spanish... but the structure given by the user is without accents in "tecnicas". Follow the user's structure literally. Hmm. "Usa castellano de Espana, sin faltas de ortografia" — "tecnicas" without accent is a spelling mistake in Spanish. The user's template says "Especificaciones tecnicas". Tricky. I'll follow the template exactly (headers as given) since it's obligatory structure. Actually "sin faltas de ortografia" pushes to write "técnicas". I think writing "Especificaciones técnicas" is safer for orthography. But deviating from obligatory structure... The structure is about sections, not accents. I'll use proper accents: "Especificaciones técnicas". Hmm, risk either way. I'll go with proper Spanish accents, as the orthography rule is "crítica" too. Actually, let me reconsider: the user explicitly wrote the headers. I'll keep them identical to avoid structural deviation — no wait, they'd both be considered fine. I'll use accents since it's correct Spanish. Let me just decide: use accents in running text and headers ("Especificaciones técnicas"). Fine.

Table rows for parameters: Arquitectura, Parámetros totales, Parámetros activos (only if MoE — it's dense, so I could omit or say "no aplica (modelo denso)"). Include "no aplica (modelo denso)".

Let me write.

Parameters: 8.190.735.360 → ~8,19 mil millones.

Write the ficha now.

For "Idiomas soportados": no disponible (la model card no lo especifica; el dataset parece orientado a matemáticas en inglés, pero no se confirma).

Arquitectura y entrenamiento: two paragraphs. Include: base Qwen3-8B-Base, dense transformer decoder; SFT with ChatML, no thinking logic, plain template; dataset openthoughts3_math 103,760 two-turn conversations; every assistant message is a <think>...</think> trace ending in \boxed{}; sequence length 32768, mean 13.8k, p99 16.8k, max 16.8k tokens; global batch 255; AdamW lr 5e-6 cosine 3% warmup wd 0.01 grad clip 1.0; bf16, FSDP over 3 GPUs, verl; step 250 of 2000.

Benchmarks: no data.

Let's write in a rigorous tone.

For the comparison table, columns: Modelo | Parámetros | Contexto (entrenamiento/uso) | Licencia | Disponibilidad | Rendimiento. I'll add rows: this model, Qwen3-8B-Base, Qwen3-8B (post-trained/instruct), and maybe OpenThinker3-7B / DeepSeek-R1-Distill-Qwen-7B with "no disponible" fills. I'll keep to three: this, Qwen3-8B-Base, Qwen3-8B. And mention in text that DeepSeek-R1-Distill-Qwen-7B and OpenThinker3-7B are alternatives, with data "no verificado en la información disponible". Hmm, better to include only what I can state: Qwen3-8B-Base is 8.19B params, Apache-2.0, base model. Qwen3-8B is 8.2B, Apache-2.0, post-trained with thinking mode. Context: Qwen3 native 32,768, up to 131,072 with YaRN — I'm fairly confident but not in provided info. Mark as "no especificado en la información proporcionada". Ugh, that makes the table weak but honest. I'll fill with "no disponible" where unsure.

Maybe for the comparison, include a caveat line: "Los datos de los modelos comparativos marcados con (1) no aparecen en la información proporcionada; se indican como no disponibles." Simplify: mark unknown as "no disponible".

Alright, writing.

Casos de uso — 7 items with concrete explanations.

Hardware bullets with numbers.

Write final Markdown.## Resumen

Qwen3-8B-Base-OT3Math-SFT-step250 es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario mhseo2 sobre el modelo base Qwen/Qwen3-8B-Base. El entrenamiento se ha realizado exclusivamente con el dataset knowledge-distillation/openthoughts3_math, compuesto por 103.760 conversaciones de dos turnos en las que cada respuesta del asistente es una traza de razonamiento delimitada por `<think>...</think>` y terminada en una respuesta final en formato `\boxed{}`. El objetivo es, por tanto, especializar un modelo denso de 8.190.735.360 parametros en razonamiento matematico con trazas explicitas.

Se trata de un checkpoint en bf16, sin evaluacion publicada, correspondiente al paso 250 de un total previsto de 2.000 pasos de entrenamiento. Es relevante ahora porque alimenta el ecosistema de destilacion de razonamiento en abierto: los modelos con trazas de pensamiento explicito son utiles tanto para generar datos sinteticos como para inicializar fases posteriores de RL (por ejemplo, RLVR con verificadores sobre `\boxed{}`) o para experimentar con el formato ChatML sin la logica de plantilla de Qwen3.

La model card advierte de dos detalles practicos importantes: la plantilla es un ChatML plano sin logica de thinking (no existe el flag `enable_thinking`) y el token de fin de turno debe ser `<|im_end|>` (id 151645), valor que si se sustituye por el 151643 del `generation_config.json` original de Qwen3-8B-Base provoca que el modelo no termine nunca bajo vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B-Base (sin detalles de capas, cabezas o atencion en la informacion disponible) |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de secuencia de entrenamiento; contexto nativo del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | Solo bf16 (pesos en precision completa); no se han publicado versiones GGUF, AWQ, GPTQ ni int8/int4 |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | knowledge-distillation/openthoughts3_math (103.760 conversaciones de dos turnos) |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parametros. Sobre esa base se ha aplicado un ajuste supervisado puro (sin RLHF ni DPO documentados) con el dataset knowledge-distillation/openthoughts3_math, que contiene 103.760 conversaciones de dos turnos generadas por destilacion de conocimiento. Cada mensaje del asistente en los datos es una traza `<think>...</think>` que finaliza con una respuesta en `\boxed{}`, y el modelo se entrena para reproducir exactamente ese patron. La secuencia de entrenamiento es de 32.768 tokens y, segun la model card, no trunca ningun ejemplo: la media es de 13,8k tokens, el percentil 99 de 16,8k y el maximo de 16,8k.

Los hiperparametros documentados son: batch global de 255, optimizador AdamW con learning rate 5e-6, scheduler coseno con 3 por ciento de warmup, weight decay 0,01 y grad clipping de 1,0. El entrenamiento se ejecuto en bf16 con FSDP sobre 3 GPU utilizando el framework verl. Una innovacion tecnica relevante y poco habitual es el uso de una plantilla ChatML propia sin logica de thinking: la plantilla nativa de Qwen3 elimina los bloques `<think>` de todos los turnos del asistente salvo el ultimo, lo que habria borrado precisamente el material de razonamiento que se quiere ensenar al modelo. El checkpoint publicado es el paso 250 de 2.000 previstos, por lo que se trata de un artefacto intermedio y no de un modelo final.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con soporte de conversaciones de dos turnos tal y como aparecen en el dataset.
- Razonamiento matematico con trazas explicitas: el modelo produce bloques `<think>...</think>` antes de la respuesta final, que se emite en formato `\boxed{}`.
- Resolucion de problemas matematicos de tipo competicion y ejercicios con respuesta verificable, al menos en el dominio cubierto por openthoughts3_math.
- Manejo de contextos largos: el entrenamiento usa secuencias de hasta 32.768 tokens (maximo real de 16,8k en los datos), lo que permite problemas con enunciados extensos.
- Terminacion correcta de turnos si se usa el token `<|im_end|>` (151645) configurado en el repositorio, lo que permite su uso en servidores de inferencia compatibles con endpoints (etiqueta endpoints_compatible).
- Capacidades no verificadas o no documentadas: tool calling / function calling, uso agentico multi-paso, multimodalidad (vision o audio), multilingueismo fuera del ingles y modos de thinking conmutable. No hay informacion disponible sobre ninguna de ellas; conviene tratarlas como no soportadas hasta que se evaluen.
- No hay ningun resultado de evaluacion que confirme ninguna de las capacidades anteriores mas alla de que el modelo fue entrenado para reproducir el formato descrito.

## Casos de uso

- Generacion de datos de razonamiento sinteticos: el modelo puede producir trazas `<think>` completas terminadas en `\boxed{}` a partir de enunciados matematicos, lo que permite ampliar datasets de destilacion o construir conjuntos de entrenamiento para modelos mas pequenos. El formato de salida es directamente parseable.
- Inicializacion de fases de RL con verificacion (RLVR/GRPO): al emitir la respuesta final en `\boxed{}`, un verificador simbolico puede comprobar automaticamente la solucion y asignar recompensa, de modo que este checkpoint sirve como punto de partida barato para un ciclo de refuerzo sobre matematicas.
- Destilacion hacia modelos de menor tamano: sus salidas en formato ChatML con trazas largas (hasta 16,8k tokens) son utiles como etiquetas para entrenar modelos de 1B a 3B en razonamiento matematico.
- Investigacion sobre plantillas sin logica de thinking: al usar una plantilla ChatML plana, permite estudiar como se comporta un modelo que siempre emite razonamiento visible, sin el mecanismo de supresion de `<think>` de Qwen3, en comparacion con el modelo base.
- Procesamiento por lotes de ejercicios matematicos en un pipeline interno: desplegado con vLLM y `max_new_tokens` en torno a 16.384, puede resolver lotes de problemas de un dataset propio para construir un conjunto etiquetado. Es imprescindible fijar el `eos_token_id` en 151645 para evitar generaciones que no terminan.
- Evaluacion comparativa de checkpoints intermedios: al ser el paso 250 de 2.000, resulta util para trazar curvas de aprendizaje en SFT largo (por ejemplo, evolucion de la tasa de respuestas correctas en un conjunto de validacion matematico propio) sin esperar al checkpoint final.
- Prototipado de tutoria matematica paso a paso: el modelo puede mostrar el desarrollo del razonamiento antes de la respuesta final, lo que encaja en interfaces educativas. No obstante, al no estar evaluado, cualquier despliegue de este tipo exigiria validacion previa y un mecanismo de verificacion de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que el checkpoint es intermedio (paso 250 de 2.000) y que no ha sido evaluado ("Not yet evaluated"). No existen datos de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra prueba en la informacion proporcionada.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesitan alrededor de 18-22 GB de VRAM contando cache KV y overhead del runtime.
- Cabe en GPU de consumo: si, en una RTX 4090 (24 GB) en bf16 con margen ajustado, y con holgura en RTX 5090 o en configuraciones duales. En GPUs de 16 GB solo seria viable con cuantizacion, que no esta publicada.
- GPUs profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para mayor margen y mayor tamano de lote.
- Cuantizacion: al no haber pesos GGUF/AWQ/GPTQ publicados, habria que generarlos uno mismo. Como referencia teorica, int8 requeriria en torno a 9-10 GB y 4 bits en torno a 5-6 GB, pero no hay artefactos verificados.
- Despliegue: transformers (libreria declarada), vLLM (con `eos_token_id` corregido a 151645 y `max_new_tokens` alrededor de 16.384) y text-generation-inference, dado que el repositorio incluye la etiqueta endpoints_compatible. llama.cpp u Ollama solo serian posibles tras convertir los pesos a GGUF.
- Entrenamiento: el autor uso bf16 con FSDP sobre 3 GPU con secuencias de 32.768 tokens, lo que implica GPUs con memoria amplia (el tipo concreto no se especifica en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| mhseo2/Qwen3-8B-Base-OT3Math-SFT-step250 | 8,19 mil millones | 32.768 tokens de entrenamiento | Apache-2.0 | Pesos bf16 en HuggingFace, 0 descargas | No evaluado |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (no detallado en la informacion disponible) | No disponible | Apache-2.0 | Pesos publicos en HuggingFace | No disponible en la informacion proporcionada |
| Qwen/Qwen3-8B | Aproximadamente 8 mil millones (no detallado en la informacion disponible) | No disponible | Apache-2.0 | Pesos publicos en HuggingFace | No disponible en la informacion proporcionada |

Alternativas habituales en la misma categoria (modelos de 7-8B especializados en razonamiento matematico con trazas largas, como los destilados de DeepSeek-R1 sobre Qwen o la familia OpenThinker) no aparecen en la informacion proporcionada, por lo que no se dispone de parametros, contexto ni cifras comparativas verificables para incluirlas en la tabla. La comparacion cuantitativa de rendimiento es, en cualquier caso, imposible mientras este checkpoint no sea evaluado.

## Limitaciones y advertencias

- Modelo sin evaluar: la model card indica explicitamente que no ha sido evaluado. No debe usarse en produccion sin una validacion propia en el dominio objetivo.
- Checkpoint intermedio: corresponde al paso 250 de 2.000, por lo que su calidad esta por debajo del modelo que resultaria del entrenamiento completo.
- Riesgo de alucinacion: al entrenarse para imitar trazas de razonamiento destiladas, puede generar desarrollos plausibles con resultados finales incorrectos en `\boxed{}`. La verificacion automatica de la respuesta es imprescindible en cualquier uso serio.
- Sesgos heredados: al derivar de Qwen3-8B-Base y entrenarse por destilacion sobre openthoughts3_math, hereda tanto los sesgos del modelo base como los errores y sesgos del generador de las trazas.
- Token de fin de turno: si se usa la configuracion estandar de Qwen3-8B-Base (`eos_token_id` 151643) en lugar del 151645 que indica este repositorio, el modelo no termina de generar bajo vLLM. Es un fallo silencioso que consume recursos y produce salidas inutilizables.
- Plantilla sin logica de thinking: no existe flag `enable_thinking` ni supresion de `<think>`; el modelo emite razonamiento segun el formato ChatML plano con el que fue entrenado, lo que puede chocar con tooling que espere la plantilla oficial de Qwen3.
- Longitud de generacion: se recomienda `max_new_tokens` en torno a 16.384, coherente con la distribucion de longitudes del dataset (media 13,8k, maximo 16,8k). Valores mucho mayores no tienen respaldo en los datos de entrenamiento.
- Idiomas: no disponible. El dataset es de matematicas y presumiblemente en ingles, pero la model card no lo confirma, por lo que el comportamiento multilingue es incierto.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de la comunidad ni validacion independiente.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero al ser un derivado de Qwen3-8B-Base conviene mantener la atribucion correspondiente y revisar las condiciones del modelo base y del dataset de destilacion.
- Reproducibilidad: la model card documenta hiperparametros y framework, pero no se han publicado scripts de entrenamiento ni de evaluacion en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/Qwen3-8B-Base-OT3Math-SFT-step250
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/knowledge-distillation/openthoughts3_math
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Resultados de busqueda web: la busqueda realizada no devolvio ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a paginas no relacionadas de soporte de Google Translate y de otros sitios de contenidos). No hay papers, blogs, repositorios ni demos adicionales disponibles.
