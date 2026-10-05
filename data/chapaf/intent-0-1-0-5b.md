# ChapAF/intent-0.1-0.5b

- Prompt format: <|system|>, <|user|>, <|assistant|>

Hardware: 0.5B params. FP16 ~912 MB, int8 ~456MB, q4 ~250-300MB. Fits consumer GPU easily. I can compute estimates — that's reasonable engineering math, not inventing model facts. But should be careful. I can give estimates clearly labeled as estimates.

Benchmarks: none published → state that.

Comparativa: comparable small models — Qwen2.5-0.5B, Qwen3-0.6B, TinyLlama-1.1B, SmolLM2-360M. But I should not invent their numbers... Actually those are widely known facts, but the instruction says not to invent data. For comparison table, I can include known public facts about comparable models (params, context) but must be careful about benchmarks. I can mark benchmark column as "no disponible" for this model. For comparables, I could say e.g. Qwen2.5-0.5B has 0.49B params, 32k context, Apache-2.0. That's reasonably well-known. But risk. I'll keep it factual and note that data comes from public info not from the search. Hmm, the rule: "Si no conoces modelos comparables, indica 'no disponible'." I do know comparable models. I'll include them with clearly-known specs and note that benchmarks for this model are unavailable.

Actually, to be safe, I'll add a note that the comparatives' data is public and generic. Keep it modest: Qwen2.5-0.5B (494M, 32k ctx, Apache-2.0), TinyLlama-1.1B (1.1B, 2048 ctx, Apache-2.0), SmolLM2-360M (362M, 8192 ctx, Apache-2.0). These are well established. Fine.

Licence: no disponible — this is a big caveat given tokenizer derived from Llama-2 (Llama 2 Community License). Important warning.

Let me write.

Structure with mandatory headings. Spanish from Spain, only first word of titles capitalized.

Titles: "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Note: only first word capitalized — "Especificaciones tecnicas" — ok. "Requisitos de hardware" ok. "Comparativa con modelos similares" ok. "Limitaciones y advertencias" ok. "Benchmarks y rendimiento" — "Benchmarks" has capital B as first word, fine.

No emojis. Markdown tables.

Specs table rows: Arquitectura, Parametros totales, Parametros activos, Longitud de contexto, Tipos de cuantizacion, Idiomas soportados, Licencia, Formato de pesos. I should add extras maybe (vocab, capas, hidden size, tokenizer). The rule says "Incluye SIEMPRE estas filas" — extra rows allowed. I'll add a few useful ones but keep order with mandatory ones. Probably add "Vocabulario", "Capas / dimension oculta", "Tokenizer" after. That's fine.

Arquitectura: decoder-only transformer; llama.cpp Arcee ReLU-squared graph; Q/K RMSNorm. 24 capas, hidden 1152, 32k vocab. So ~455.9M params.

Cuantizacion: se distribuye model-f16.gguf; GGUF permite cuantizaciones de llama.cpp; no se listan cuantizaciones oficiales. So "GGUF f16 incluido; el resto de niveles de cuantizacion de llama.cpp no estan documentados en el repo".

Idiomas: no disponible; tokenizer Llama-2 (predominantemente ingles).

Formatos de pesos: safetensors (f32/f16?) and GGUF f16. Note the safetensors is 5.5GB repo size — 455.9M params. If fp32, that's 1.82 GB. If fp16 0.91GB. Repo 5.5GB total includes gguf and code. Hmm, not disclosed precision. I'll say "precision del safetensors no especificada". Actually 5.5GB repo total: could be safetensors f32 (1.8GB) + gguf f16 (0.9GB) + optimizer? No, they said no optimizer state. Whatever. Just note not specified.

Hardware estimaciones: 
- fp32: 1.8 GB
- fp16/bf16: ~0.91 GB
- 8-bit: ~0.46 GB
- 4-bit (Q4_K_M): ~0.28-0.35 GB
Plus overhead of KV cache: 24 layers, hidden 1152, context 2048. KV heads unknown. Standard GQA unknown. Estimate with MHA: 2 * layers * ctx * hidden * 2 bytes = 2*24*2048*1152*2 = 226 MB for fp16. That's assuming full MHA with head dim... Actually KV cache = 2 (K and V) * n_layers * n_kv_heads * head_dim * seq_len * bytes. With n_kv_heads*head_dim = 1152 (MHA), 2*24*1152*2048*2 bytes = 226.5 MB. Yes. I'll mention ~0.2 GB approx for KV cache at 2048 context in fp16, assuming MHA. Mark as estimate.

Deployment: llama.cpp, LM Studio (GGUF), Ollama possibly via GGUF import; vLLM/TGI not supported natively since it's not a native transformers AutoModel — need custom code chat.py. That's an important point.

Latency/throughput: no disponible.

Capacidades: text generation, SFT-tuned chat with role markers, optional thinking mode <think>, tool calling not documented, agents not documented, multilingual unknown.

Casos de uso: need min 6 concrete. Given it's a 0.5B experimental model with no license and no benchmarks, realistic use cases: research on dictionary learning / interpretability, fine-tuning experimentation, local prototyping, edge/offline demos, classifier/intent extraction (name "intent"), educational. But careful — "intent-0.1-0.5b" name suggests intent classification. I shouldn't overclaim. I'll frame use cases realistically with caveats about the model not being production-ready and no benchmark data.

Let me draft use cases:
1. Investigación en interpretabilidad y dictionary learning (first-order-dictionary-learning).
2. Prototipado local de asistentes conversacionales de bajo coste (role markers).
3. Base para fine-tuning en tareas de clasificación de intenciones / enrutado — the name suggests intent; but not confirmed. Say it cautiously.
4. Ajuste fino con SFT sobre formato <|system|>/<|user|>/<|assistant|>.
5. Generación de texto offline en CPU/edge con GGUF.
6. Evaluación comparativa de pipelines de cuantización (f16 vs faithful safetensors).
7. Docencia / experimentación académica.
8. Pruebas de prompts de razonamiento con <think>.

Each with brief explanation of why suitable. Note data scarcity — no benchmarks means any production use requires own eval.

Ahora los enlaces: HF URL, model card README content. Repo files internal: pretraining/model.py, chat.py. No paper found. Web search gave nothing relevant. So links: HF model page, and mention that no paper/repo/blog was found. Maybe list the HF URL plus referenced tokenizer meta-llama/Llama-2-7b-chat-hf. And note that no external documentation was found.

Comparativa table columns: Modelo, Parametros, Contexto, Licencia, Disponibilidad, Notas de rendimiento.

- ChapAF/intent-0.1-0.5b: 455,93 M, 2048, no disponible, HF (0 descargas), sin benchmarks
- Qwen2.5-0.5B: ~494 M, 32.768, Apache-2.0, HF, benchmarks publicados por el autor
- TinyLlama-1.1B: 1,1 B, 2048, Apache-2.0, HF, benchmarks publicados
- SmolLM2-360M: 362 M, 8192, Apache-2.0, HF, benchmarks publicados

I'll be careful: I'd rather state parameters approx. It's fine, these are widely known. But the rule says don't invent. I'll mark them as "datos publicos del modelo comparable". Fine.

Now format numbers in Spanish: decimal comma, thousands separator dot. 455.933.952 parámetros (given by HF as 455933952 — that's likely raw count without separators; 455,933,952 = ~456M). Yes, 0.5B.

Let me write it.

Resumen: 2-3 paragraphs, 6-10 lines total.

Write carefully in Spanish from Spain. No emojis. Only first word of headings capitalized.

Let me compose.

For "Idiomas soportados": "no disponible. El tokenizer procede de meta-llama/Llama-2-7b-chat-hf, de vocabulario predominantemente ingles, pero no se documenta el reparto idiomatico del entrenamiento."

Licencia: "no disponible en el repositorio de HuggingFace ni en la model card. Advertencia: el tokenizer deriva de Llama-2-chat, sujeto a la Llama 2 Community License."

Ok, writing now.

For hardware recommended GPUs: any modern GPU; RTX 3060 12GB, RTX 4090, Apple Silicon via llama.cpp. A100/H100 unnecessary but can be used for batch throughput. Also CPU-only feasible with GGUF.

Latency: no disponible.

I'll add estimates clearly marked as "estimacion".

Write the final answer.## Resumen

ChapAF/intent-0.1-0.5b es un modelo de lenguaje decoder-only de 455.933.952 parametros (aproximadamente 0,46 B) publicado en HuggingFace por el usuario ChapAF. No es un checkpoint nativo de `transformers.AutoModel`, sino un artefacto de inferencia del proyecto `first-order-dictionary-learning`: el repositorio incluye el codigo minimo de inferencia (`pretraining/model.py` y `chat.py`) necesario para ejecutarlo. Esto lo situa en la categoria de modelos de investigacion reproducibles mas que en la de modelos listos para produccion.

La arquitectura declarada es un transformer denso con 24 capas, dimension oculta de 1152, vocabulario de 32000 tokens y una longitud de contexto de 2048 tokens. El tokenizer procede de `meta-llama/Llama-2-7b-chat-hf` y el modelo se ha ajustado con SFT sobre un formato de prompt con marcadores de rol `<|system|>`, `<|user|>` y `<|assistant|>`. Incorpora un modo de razonamiento opcional mediante la etiqueta `<think>...</think>`, desactivado por defecto.

Su relevancia es limitada y experimental: cero descargas, cero likes, licencia no declarada, idiomas no documentados y ausencia total de benchmarks publicados. Resulta interesante como caso de estudio de un pipeline propio de entrenamiento y de exportacion a GGUF, no como alternativa a los modelos pequenos de referencia del mercado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (grafo Arcee ReLU-squared en la exportacion GGUF, con Q/K RMSNorm en el modelo original) |
| Parametros totales | 455.933.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Se distribuye una unica exportacion `model-f16.gguf`; no se documentan otros niveles de cuantizacion |
| Idiomas soportados | no disponible (tokenizer de Llama-2, de vocabulario predominantemente ingles; no se documenta la composicion linguistica del entrenamiento) |
| Licencia | no disponible (ni en el repositorio ni en la model card) |
| Formato de pesos | `safetensors` (precision no especificada) y GGUF (f16) |
| Capas / dimension oculta | 24 capas / 1152 |
| Tamano de vocabulario | 32000 tokens |
| Tokenizer | `LlamaTokenizerFast` derivado de `meta-llama/Llama-2-7b-chat-hf` |
| Formato de prompt | `<|system|>`, `<|user|>`, `<|assistant|>` (formato SFT serializado) |
| Tamano del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 24 capas y dimension oculta de 1152, sin mecanismos de mezcla dispersa (MoE) ni capas recurrentes. El autor indica que fue entrenado mediante el pipeline `first-order-dictionary-learning` y que la implementacion de referencia es la clase `pretraining.model.GPT` incluida en el propio repositorio, no la de HuggingFace `transformers`. El entrenamiento incluye una fase de SFT, dado que el checkpoint se serializa con el formato de prompt de esa etapa; sin embargo, no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO.

El detalle tecnico mas relevante es la discrepancia entre el modelo original y su exportacion GGUF. El modelo de entrenamiento aplica Q/K RMSNorm, una operacion que el grafo Arcee ReLU-squared de llama.cpp no expone. Por tanto, la exportacion `model-f16.gguf` es una aproximacion compatible con las herramientas, no una reproduccion numerica exacta. Para inferencia fiel el autor recomienda usar `model.safetensors` junto con `chat.py`. El repositorio omite de forma intencionada el estado del optimizador, el estado de rango distribuido, los datos de entrenamiento en bruto y los ficheros de W&B.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional multirrol, condicionada por los marcadores `<|system|>`, `<|user|>` y `<|assistant|>`.
- Modo de razonamiento explicito opcional: el modelo acepta y puede emitir bloques `<think>...</think>`, desactivados por defecto y activables con el parametro `--think true` de `chat.py`.
- Inferencia local mediante llama.cpp o LM Studio a traves de la exportacion GGUF f16.
- Inferencia numerica fiel mediante el codigo propio incluido (`chat.py`) y el checkpoint `safetensors`.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el unico indicio es el modo `<think>`, sin evaluacion publicada que lo respalde.
- Capacidades multilingues: no documentadas.
- Capacidades de vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Investigacion en dictionary learning e interpretabilidad: el modelo es el artefacto de inferencia de un pipeline de aprendizaje de diccionarios de primer orden, por lo que su uso principal es reproducir y auditar los experimentos de ese proyecto sobre un checkpoint de 0,46 B y contexto de 2048 tokens.
- Prototipado de asistentes conversacionales de bajo coste: al usar marcadores de rol y caber en menos de 1 GB en fp16, permite levantar un chat local de pruebas en un portatil sin GPU dedicada.
- Ajuste fino con SFT sobre un esquema de roles fijo: el formato `<|system|>`/`<|user|>`/`<|assistant|>` y el tokenizer de Llama-2 facilitan reutilizar pipelines de fine-tuning existentes para dominios concretos.
- Clasificacion de intenciones y enrutado de peticiones: por nombre y tamano, encaja como base para tareas de etiquetado corto o enrutado previo a un modelo mayor, siempre que se valide con un conjunto de evaluacion propio, dado que no hay benchmarks publicados.
- Generacion de texto offline en CPU o dispositivos con recursos limitados: la exportacion GGUF f16 (menos de 1 GB de pesos) permite desplegarla con llama.cpp en equipos sin acelerador, aceptando la aproximacion numerica respecto al checkpoint original.
- Docencia y practicas de ingenieria de LLM: sirve para ilustrar el ciclo completo de definicion de arquitectura, entrenamiento con SFT, serializacion en safetensors y exportacion a GGUF, incluida la problematica de las incompatibilidades de grafo.
- Evaluacion de pipelines de cuantizacion: permite comparar las salidas del checkpoint fiel en safetensors frente a la exportacion GGUF f16 y medir la degradacion introducida por las diferencias de grafo.
- Pruebas controladas de prompting de razonamiento: el modo `<think>` permite experimentar con cadenas de razonamiento explicitas en un modelo pequeno y de coste de inferencia minimo, con la advertencia de que no existe evidencia publicada de que mejore la precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio tampoco aporta comparaciones con modelos de tamano similar. Cualquier uso que dependa de la calidad de las respuestas exige una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para los pesos (estimacion a partir de 455.933.952 parametros): aproximadamente 1,8 GB en fp32, 0,91 GB en fp16/bf16 y del orden de 0,25-0,35 GB en cuantizaciones de 4 bits de llama.cpp, si se generan.
- Memoria de cache KV (estimacion, asumiendo atencion multi-cabeza y contexto completo de 2048 tokens): alrededor de 0,2 GB en fp16. No se documenta si el modelo usa GQA, por lo que la cifra puede ser menor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090). No tiene sentido desplegarlo en A100 o H100 salvo para pruebas de throughput por lotes, ya que el modelo no aprovecha esa capacidad de computo.
- Compatibilidad con GPU consumer: si, de forma holgada. Tambien es viable en CPU y en Apple Silicon mediante llama.cpp o LM Studio.
- Opciones de despliegue: llama.cpp y LM Studio para el GGUF f16; el codigo propio `chat.py` con PyTorch, safetensors y flash-attn/liger para el checkpoint fiel. vLLM, TGI y Ollama no tienen soporte nativo documentado, ya que el modelo no es un `AutoModel` estandar de `transformers` y requeriria registrar una arquitectura personalizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de informacion publica de sus respectivos repositorios; las cifras de rendimiento de este modelo no existen.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| ChapAF/intent-0.1-0.5b | 455,93 M | 2048 | no disponible | HuggingFace, 0 descargas | no |
| Qwen2.5-0.5B | ~494 M | 32768 | Apache-2.0 | HuggingFace, ampliamente desplegado | si |
| SmolLM2-360M | ~362 M | 8192 | Apache-2.0 | HuggingFace, ampliamente desplegado | si |
| TinyLlama-1.1B | ~1,1 B | 2048 | Apache-2.0 | HuggingFace, ampliamente desplegado | si |

La diferencia practica no esta en el tamano, que es comparable o inferior al de las alternativas, sino en tres factores: contexto ocho a dieciseis veces menor que Qwen2.5-0.5B y SmolLM2-360M, ausencia de licencia declarada y falta total de evaluaciones. Para cualquier tarea real de generacion o clasificacion en este rango de parametros, las alternativas con licencia Apache-2.0 y benchmarks publicados son opciones mas seguras.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en el repositorio ni en la model card, por lo que no hay autorizacion explicita de uso comercial. Esto es un bloqueante para cualquier despliegue en produccion.
- Contaminacion de licencia por el tokenizer: el tokenizer procede de `meta-llama/Llama-2-7b-chat-hf`, sujeto a la Llama 2 Community License, lo que anade incertidumbre juridica sobre la distribucion y el uso derivado.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento, codigo o matematicas. El rendimiento es desconocido incluso en tareas triviales.
- Riesgo de alucinacion: con 0,46 B de parametros, la capacidad de mantener coherencia factual es estructuralmente limitada; se espera una tasa elevada de afirmaciones incorrectas en dominios abiertos, aunque no se ha medido.
- Contexto reducido: 2048 tokens impiden conversaciones multi-turno largas, resumen de documentos extensos o razonamiento con muchos pasos encadenados.
- Idiomas: no documentados. El vocabulario de Llama-2 esta sesgado hacia el ingles, por lo que el rendimiento en castellano u otras lenguas es incierto y probablemente pobre.
- Sesgos: no evaluados ni documentados. Al no publicarse la composicion del dataset de entrenamiento, no es posible auditar sesgos de genero, etnia, ideologia o idioma.
- GGUF no equivalente: la exportacion f16 usa un grafo de llama.cpp que no reproduce el Q/K RMSNorm del modelo original, por lo que las respuestas pueden diferir respecto al checkpoint fiel. No se cuantifica esa divergencia.
- Integracion no estandar: al no ser un `AutoModel` de `transformers`, no funciona directamente en vLLM, TGI o en la mayoria de plataformas de serving sin trabajo previo de integracion.
- Arquitectura definida solo por su propio codigo: no hay garantia de compatibilidad futura con versiones posteriores del repositorio ni de mantenimiento del proyecto.
- Metadatos de fecha anomala: el repositorio figura como creado el 2026-10-04, lo que sugiere un campo de fecha no fiable o generado automaticamente; conviene no usarlo como referencia de vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChapAF/intent-0.1-0.5b
- Tokenizer de origen: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros incluidos en el repositorio (referenciados en la model card, accesibles desde la pestana de archivos del modelo): `model.safetensors`, `model-f16.gguf`, `config.json`, `checkpoint_metadata.json`, `pretraining/model.py`, `chat.py`
- Paper, blog tecnico, repositorio de codigo independiente o demo: no disponible en la informacion proporcionada
