# cooler8/yejin-korean-8b-v3-cpt750-p1v4lora-nothink-v2

(nothink variant — empty think block)
- Name suggests: continued pretraining 750 (cpt750), phase 1 v4 lora (p1v4lora), nothink v2

I must not invent data. Specs table: arquitectura — no disponible (probablemente transformer decoder-only basada en Qwen3, but I should say "no disponible (etiqueta qwen3 sugiere...)" — careful. The tag says qwen3, so I can say "Transformer decoder-only (derivado de Qwen3, segun la etiqueta del repositorio)". That's justified by the tag. Parameters total 7.241.740.288. Active params: N/A (no MoE indicado) — say "no aplica". Context length: no disponible. Quantization types: no disponible. Languages: ko. License: apache-2.0. Weight format: safetensors.

Arquitectura y entrenamiento: only what's inferable from the name and tags — careful. The name suggests continued pretraining to 750 (units unknown) and a LoRA phase 1 v4, nothink. I should say explicitly that the author provides no details. I can mention that the name suggests, but mark as inference. Better to be careful but helpful: "La model card no documenta...". I'll note plausible interpretation as hypothesis.

Capacidades: instruction following in Korean, chat template with think block (disabled/empty), text generation. Tool calling: no disponible. Vision: no.

Casos de uso: 6+ concrete Korean-language uses.

Benchmarks: no published results.

Hardware: 7.24B params, bf16 ~14.5 GB weights; fp16 same. Quantization: Q8 ~7.7GB, Q4_K_M ~4.4GB. Consumer GPUs: RTX 4090 24GB fine at bf16; 16GB cards need quantization. Deployment: transformers, vLLM, llama.cpp/GGUF would require conversion, Ollama, TGI. Note repo 29 GB suggests multiple weight files / sharded, possibly including other formats.

Comparativa: compare with Qwen3-8B (base), Llama-3.1-8B-Instruct, Mistral-7B-Instruct, EEVE-Korean or other Korean models like LG EXAONE, KoLlama, etc. But I must not invent benchmark numbers. I can compare parameter counts, context, license — Qwen3-8B has 32k native context / 131k with YaRN... that is factual knowledge but maybe risky. I'll keep the comparison limited to verifiable-ish facts and mark unknown as "no disponible". Actually the instruction: "Si no conoces modelos comparables, indica no disponible". I know comparables: Qwen3-8B (base architecture, Apache-2.0), Llama-3.1-8B-Instruct (Llama license), Mistral-7B-Instruct-v0.3 (Apache-2.0). I'll present a table but keep columns to params, license, context (where known: Qwen3-8B 32,768 nativo ampliable a 131,072 con YaRN; Llama-3.1-8B 128k; Mistral 7B v0.3 32k). Those are known facts. I'll mark the ficha model's context as no disponible.

Hmm, careful about "no inventes". Qwen3-8B context: 32,768 tokens, expandable to 131,072 with YaRN. That's standard. I'll include with reasonable confidence but maybe safer to say "32.768 (131.072 con YaRN)". Fine.

Limitaciones: halluccination, bias, Korean-only, unknown training data, no benchmarks, LoRA merge unknown quality, license Apache 2.0 permits commercial but base derived from Qwen3 → check Qwen3 license Apache 2.0 (Qwen3 is Apache 2.0), so fine. Mention 0 downloads/likes, unvalidated. Also caution the "think" template forces empty think block → model doesn't reason step-by-step.

Enlaces: HF page, Qwen3 links (Qwen3 HF collection, Qwen3 blog, Qwen3 GitHub). Web search results are irrelevant spam — I should say no relevant links found; the search results contained no relevant information. I'll list HF model URL, and mention that the search returned no relevant results (not link them). Also the chat template is in the card.

Note: creation date 2026-10-13 — future date, but I'll just not dwell. Could mention created/updated date in resumen? Perhaps mention "publicado el 13 de octubre de 2026 segun los metadatos". Hmm, that date is odd. I'll include it in the specs? Not required. Maybe mention in resumen as metadata. I'll skip or mention briefly. I'll mention "repo de 29 GB". Actually I could add extra rows to the specs table — allowed ("incluye SIEMPRE estas filas" so extras fine): base model, idioma, etc.

Let me write.

Structure titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Write it.

For hardware, latency/throughput: no disponible. Estimates for VRAM: bf16 ~14,5 GB (7.241.740.288 × 2 bytes = 14.48 GB) plus KV cache. Good, that's arithmetic, fine.

Sizes: 8-bit ~7,6 GB; 4-bit ~4,2-4,5 GB.

Let me compute: 7.24B × 2 = 14.48 GB. ×1 = 7.24 GB (int8). ×0.5 = 3.62 GB (4-bit, roughly, plus overhead ~4.5 GB).

Ok write the ficha.

Comparativa table columns: Modelo | Parametros | Contexto | Licencia | Disponibilidad / idioma principal | Notas.

Rows: este modelo, Qwen3-8B, Llama-3.1-8B-Instruct, Mistral-7B-Instruct-v0.3. Optionally Korean-specific: EEVE-Korean-Instruct-10.8B (based on Solar 10.8B) — context 4k? I'd rather not state numbers I'm unsure about. Maybe include "EEVE-Korean-Instruct-10.8B (Yanolja) — Apache 2.0, no disponible contexto" — risky. I'll include with "no disponible" for context, license Apache-2.0 (I believe EEVE is Apache 2.0). Hmm, safer to omit. I'll include three comparables.

Actually for Korean, another: "LGAI-EXAONE-3.5-7.8B-Instruct" license "EXAONE AI Model License" (non-commercial restrictions). I'll skip to avoid inaccuracy. Keep 3.

Write final.## Resumen

Yejin Korean 8B v3 cpt750-p1v4lora-nothink-v2 es un modelo de lenguaje de 7.241.740.288 parametros (aproximadamente 7,24 mil millones) especializado en generacion de texto e instrucciones en coreano. Lo publica el usuario cooler8 en HuggingFace y se distribuye como un ajuste conversacional sobre una base etiquetada como qwen3, segun los tags del repositorio. El modelo esta pensado para seguimiento de instrucciones en coreano (`ko` es el unico idioma declarado) y emplea una plantilla de chat propia que reserva un bloque `<think>` que en esta variante se emite vacio.

El nombre del repositorio describe el pipeline de entrenamiento seguido por el autor: un entrenamiento continuado (cpt750), una fase 1 de ajuste con LoRA (p1v4lora) y una variante "nothink" en su version 2, es decir, sin MODE de razonamiento explicito. La model card, sin embargo, no documenta ni el dataset, ni el numero de tokens, ni los hiperparametros, ni resultados de evaluacion, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

Su relevancia practica es limitada pero concreta: ofrece una base Apache 2.0 de ~7B con tokenizador y arquitectura Qwen3, lo que permite desplegarlo con herramientas estandar (transformers, vLLM, TGI o llama.cpp tras conversion) para aplicaciones en coreano. El repositorio ocupa 29,0 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que se trata de un modelo sin validacion publica por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen3 (segun el tag `qwen3` del repositorio); detalles no disponibles |
| Parametros totales | 7.241.740.288 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados por el autor; al ser safetensors en bfloat16 admite cuantizacion posterior a GGUF/AWQ/GPTQ, sin recetas oficiales publicadas |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Plantilla de chat | `<s><|user|>\n{instruction}<|end|>\n<|assistant|>\n<think> </think>{response}<|end|>` |
| Tamano del repositorio | 29,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna mas alla del tag `qwen3`, que situa el modelo en la familia Qwen3 de Alibaba. Esto implica, con alta probabilidad, un transformer decoder-only con atencion por query-key normalizada (QK-Norm) y tokenizador Qwen, pero el autor no confirma numero de capas, dimensiones ocultas, cabezas de atencion ni si se ha aplicado alguna variante de atencion eficiente o decodificacion especulativa. Tampoco se declara la longitud de contexto nativa ni si se ha extendido mediante YaRN u otra tecnica de interpolacion posicional.

El nombre del repositorio sugiere la secuencia de entrenamiento: entrenamiento continuado (prefijo `cpt750`, con una magnitud de 750 cuyo significado exacto, probablemente pasos o unidades de datos, no se especifica), seguido de una fase 1 de ajuste mediante LoRA (`p1v4lora`) sobre una version 4 del pipeline. La variante `nothink` indica que el modo de razonamiento explicito esta desactivado: la plantilla fuerza un bloque `<think> </think>` vacio antes de cada respuesta, de modo que el modelo responde directamente sin cadena de pensamiento visible. No hay informacion sobre composicion del dataset, numero de tokens de entrenamiento, uso de RLHF, DPO o cualquier otra etapa de alineacion, ni sobre tecnicas de innovacion destacables.

## Capacidades

- Generacion de texto conversacional en coreano, con seguimiento de instrucciones de un solo turno y multi-turno mediante la plantilla de chat documentada.
- Formato de respuesta con bloque de razonamiento desactivado (`nothink`): el modelo no emite cadena de pensamiento, lo que reduce latencia y tokens de salida frente a variantes "thinking".
- Generacion de texto libre y continuacion de contexto, gracias a la cabecera de causal LM estandar de transformers.
- Capacidades multilingues: limitadas al coreano declarado (`ko`); no se documenta soporte funcional de otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la variante "nothink" desactiva explicitamente el razonamiento explicito).
- Vision, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).
- Capacidades especiales: no se documentan modos de pensamiento, busqueda web ni uso de herramientas.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con la plantilla documentada, aunque el contexto maximo no esta publicado, por lo que habria que medirlo empiricamente antes de dimensionar sesiones largas.
- Asistentes conversacionales embebidos en producto: al ser un modelo de ~7B bajo Apache 2.0, puede integrarse en aplicaciones coreanas sin coste de licencia y desplegarse en una sola GPU, con la respuesta directa que aporta la variante `nothink`.
- Generacion de contenido y redaccion en coreano: borradores de articulos, resumenes de documentos y reescritura de textos, siempre con revision humana dado que no hay benchmarks publicados.
- Clasificacion y etiquetado de texto coreano mediante prompts: por ejemplo, categorizacion de tickets o extraccion de entidades en un formato de salida definido en la instruccion.
- Traduccion asistida coreano a otros idiomas como caso secundario: el modelo solo declara coreano, de modo que la calidad en el idioma destino debe validarse antes de usarlo en produccion.
- Prototipado e investigacion: sirve como punto de partida para experimentos de ajuste fino con LoRA sobre coreano, dado que la propia receta del autor se basa en LoRA y el formato safetensors es directamente cargable en transformers, PEFT y frameworks de entrenamiento.
- Generacion aumentada por recuperacion (RAG) sobre corpus coreanos: el modelo puede actuar como generador final en un pipeline RAG, con la salvedad de que la longitud de contexto no esta documentada y habria que limitar el numero de fragmentos inyectados.
- Moderacion o filtrado de contenido en coreano: uso viable como clasificador de instrucciones, sujeto a evaluacion previa de sesgos por tratarse de un modelo sin validacion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, KMMLU, KoBEST ni ninguna otra metrica, y los resultados de busqueda web obtenidos no contienen informacion relevante sobre el modelo (devolvieron exclusivamente contenido no relacionado). No se deben asumir cifras de rendimiento derivadas del modelo base Qwen3 sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 14,5 GB solo para pesos (7.241.740.288 parametros x 2 bytes), mas el cache KV, que depende de la longitud de contexto y del batch.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7,3 GB de pesos mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3,6-4,5 GB de pesos mas cache KV, segun el esquema utilizado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servicio en bfloat16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bfloat16 con lotes pequenos.
- GPU de consumo: cabe en tarjetas de 24 GB en bfloat16; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) o de 12 GB (RTX 3060 12 GB, 4070) es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (receta oficial de la model card, con `device_map="auto"` y `torch_dtype="bfloat16"`), vLLM, TGI, SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles. No hay datos de tokens por segundo ni de tiempos de primera token publicados por el autor.
- Nota de despliegue: el repositorio ocupa 29,0 GB, un tamano superior al de unos pesos bfloat16 de 7,24B (~14,5 GB), lo que sugiere que contiene ficheros adicionales (por ejemplo, varias copias de pesos u optimizador). Conviene revisar la lista de ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma principal | Disponibilidad |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 (este modelo) | 7,24B | No disponible | Apache 2.0 | Coreano | HuggingFace, 0 descargas |
| Qwen3-8B (base declarada de la familia) | 8,2B aprox. | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | Multilingue (incluye coreano) | HuggingFace, ampliamente desplegado |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Multilingue (coreano limitado) | HuggingFace y proveedores cloud |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 tokens | Apache 2.0 | Ingles principalmente | HuggingFace y proveedores cloud |

En ausencia de benchmarks publicados no es posible comparar rendimiento en tareas coreanas. Frente a Qwen3-8B, este modelo reduce ligeramente el numero de parametros y renuncia al modo de razonamiento explicito, a cambio de una especializacion declarada en coreano mediante entrenamiento continuado y LoRA. Frente a Llama-3.1-8B-Instruct y Mistral-7B-Instruct-v0.3, la ventaja es la licencia Apache 2.0 sin restricciones adicionales y la orientacion al coreano; la desventaja es la ausencia total de evaluacion publica y el contexto no documentado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que el rendimiento real en tareas coreanas es desconocido.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre calidad, estabilidad o regresiones.
- Opacidad del entrenamiento: se desconoce la composicion del dataset, el numero de tokens, la existencia de filtrado de datos y si hubo etapas de alineacion (RLHF, DPO) o de moderacion de seguridad.
- Riesgo de alucinacion: al ser un modelo generativo de ~7B sin alineacion documentada, puede producir hechos inventados, especialmente en dominios especializados y en fechas, cifras y citas.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad ni estereotipos; el entrenamiento continuado sobre datos no documentados puede reforzar sesgos presentes en el corpus.
- Limitacion idiomatica: solo se declara coreano; el uso en castellano u otros idiomas no esta soportado y previsiblemente dara resultados degradados.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en conversaciones largas o en pipelines RAG con muchos fragmentos.
- Comportamiento sin razonamiento: la variante `nothink` fuerza un bloque `<think>` vacio, de modo que el modelo no realiza cadena de pensamiento. Esto penaliza tareas de matematicas, logica o multi-paso.
- Formato de pesos unico: solo safetensors; no hay GGUF, AWQ ni GPTQ publicados, lo que anade un paso de conversion para despliegues en llama.cpp u Ollama.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar de forma independiente las obligaciones derivadas del modelo base etiquetado como qwen3 y de las fuentes de datos usadas en el entrenamiento continuado.
- Caveat de produccion: se recomienda evaluar el modelo con un conjunto propio de validacion en coreano y comparar contra Qwen3-8B y otros modelos coreanos antes de sustituir un sistema en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt750-p1v4lora-nothink-v2
- Model card del autor (incluye plantilla de chat y ejemplo de uso con transformers): incluida en la pagina anterior
- Familia Qwen3 (base declarada mediante el tag `qwen3`): https://huggingface.co/Qwen
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente contenido no relacionado con el modelo (papers, blogs, demos y repos adicionales: no disponibles).
