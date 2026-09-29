# richardyoung/Olmo-3-7B-Think-heretic

- Default system prompt, date cutoff December 2024
- Quantization: load_in_8bit, torch_dtype float16
- Datasets: allenai/Dolci-Think-RL-7B
- Model stages: Base Olmo-3-7B (allenai/Olmo-3-1025-7B), SFT Olmo-3-7B-Think-SFT, DPO Olmo-3-7B-Think-DPO, Final RLVR Olmo-3-7B-Think

Context length: not provided in the info. Hmm. Olmo 3 7B - I shouldn't invent. I'll say "no disponible" — actually I might know it's 64K but rules say don't invent. Mark no disponible.

Architecture: Olmo 3 is a transformer decoder-only. The info says "family of 7B and 32B models". Doesn't explicitly say transformer, but library transformers and "olmo3" architecture tag. I can say transformer decoder-only (arquitectura Olmo 3 en transformers). Careful — I'll state decoder-only transformer based on the tag/context, and note specifics not available.

MoE: no, dense. Params activos: no aplica (modelo denso).

Quantization types: The card mentions load_in_8bit with bitsandbytes and float16. GGUF not mentioned (though community may exist, but not in info). I'll say "cuantizacion de 8 bits mediante bitsandbytes (load_in_8bit) y carga en float16; no se listan otros formatos cuantizados en la informacion disponible". Format of weights: safetensors (tag).

Benchmarks: Only refusals and KL divergence. No MMLU etc. So table with those two metrics.

Hardware: 7.3B params. FP16 ~14.6 GB. 8-bit ~7.3GB. 4-bit ~4GB (estimate - that's a derived estimate, fine as estimation). Repo is 14.6 GB consistent with fp16/bf16.

Comparativa: Olmo-3-7B-Think (original), Olmo-3-7B-Think-DPO, and maybe Qwen2.5-7B / Llama-3.1-8B — but I shouldn't invent specs. I can compare with original Olmo 3 7B Think and DPO variant within the provided info, noting data not available for others. Better: compare this model with allenai/Olmo-3-7B-Think and allenai/Olmo-3-7B-Think-DPO using info given (all from the card). Add note that other comparable 7B models (Qwen, Llama, Mistral) specs not available in provided info. That's safe.

Limitations: abliteration removes refusal behavior; may produce harmful content; KL divergence 0.0263 indicates deviation; English only; hallucinations; license apache-2.0 permits commercial use; date cutoff Dec 2024; typos in reasoning; "certinaly" typo example.

Links: HF model, base model, original Olmo-3-7B-Think, DPO, SFT, base, Heretic project, Dolci dataset, arxiv 2512.13961. But the web results are BBC — irrelevant, so I won't include them. I'll include links found in the model card.

The arxiv 2512.13961 — I don't know that paper; it's referenced as a tag. I'll include it as a linked reference but not describe content. Actually I can mention "referencia arXiv asociada en las etiquetas del repositorio: arxiv:2512.13961". Fine.

Note about the date: created 2026-09-29 — future-ish date. I'll just report as given.

Let me write the ficha.

Note: title case rule — only first word of headings capitalized. Headings: "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". These are given in the structure. Good.

Write in Spanish of Spain, no emojis, no missing accents. "Especificaciones técnicas" — the instruction says "Especificaciones tecnicas" without accent in their template, but they want correct spelling. Hmm — "sin faltas de ortografia". I'll use proper accents: "Especificaciones técnicas", "Arquitectura y entrenamiento", "Benchmarks y rendimiento", "Limitaciones y advertencias". Fine.

Let's write.

Resumen: 2-3 paragraphs, 6-10 lines.

Details for training: pretrained on Dolma 3, post-trained on Dolci datasets; SFT -> DPO -> RLVR pipeline. Heretic abliteration applied on the DPO checkpoint (base_model: allenai/Olmo-3-7B-Think-DPO). Note: the model card says "decensored version of allenai/Olmo-3-7B-Think" but base model field says DPO. I'll mention both.

Abliteration parameters: directional ablation modifying attn.o_proj and mlp.down_proj weights per layer with specified max/min weights and positions.

Benchmarks table: Refusals 48/100 vs 100/100; KL divergence 0.0263 vs 0.

Hardware: 
- FP16/BF16: ~14,6 GB de pesos -> ~16 GB VRAM con overhead de activaciones y KV cache (estimación).
- 8-bit: ~7,3 GB
- 4-bit (estimado): ~4 GB
- RTX 4090 (24 GB): sí, en fp16 cabe justo; mejor cuantizado.
- RTX 3090/4080 16GB: 8-bit o 4-bit.
- Laptop GPUs 8 GB: 4-bit.
- A100/H100: sin problema, multi-batch.
Deployment: transformers, bitsandbytes, vLLM, llama.cpp/Ollama no confirmado (no hay GGUF en el repo).
Latency: no disponible.

Comparativa table: columns Modelo, Parametros, Contexto, Licencia, Idiomas, Rendimiento, Disponibilidad. Rows: este modelo, Olmo-3-7B-Think, Olmo-3-7B-Think-DPO, Olmo-3-7B-Think-SFT. Note we don't know context for any. Hmm, "no disponible" column values. That's okay but a bit uninformative. I could add note about Llama/Qwen as "no disponible en la informacion proporcionada". I'll add a paragraph.

Let me write it carefully.

For "Formato de pesos": safetensors (tag), repo 14.6 GB.

"Inglés" as language supported: tag "en". So English only.

Write now.

Casos de uso: min 6 concrete.
1. Generación de código asistida / agentes de codificación
2. Razonamiento matemático paso a paso (cadena de pensamiento larga)
3. Fine-tuning sobre dominio propio (deshabilitación de rechazos puede ser útil para dominios legítimos sensibles: seguridad, medicina, ficción)
4. Investigación sobre alineación y abliteración (reproducible)
5. Generación creativa de ficción sin filtros / escritura
6. Asistentes conversacionales autoalojados con licencia permisiva (Apache 2.0) para producto comercial
7. Evaluación comparativa de refusal behavior
8. Red teaming / evaluación de seguridad

I'll write 7-8 cases.

Limitaciones:
- Riesgo de contenido dañino: abliteration reduces refusals to 48/100 but doesn't eliminate them.
- KL divergence 0.0263 - distribution shift from base.
- Alucinación - LLM general.
- English only.
- Date cutoff Dec 2024.
- 7B limited capacity vs 32B.
- Reasoning can contain errors (typo example "certinaly").
- Licencia Apache 2.0 permite uso comercial, pero responsabilidad legal del uso recae en el desplegador; puede violar ToS de proveedores.
- Quality: 126 downloads, 1 like — little community validation.
- Base model del que deriva es el checkpoint DPO, no el final RLVR, por lo que el rendimiento en tareas de razonamiento puede ser inferior al de Olmo-3-7B-Think final.

Enlaces: many.

Let me now produce the markdown.## Resumen

richardyoung/Olmo-3-7B-Think-heretic es una variante «decensored» (abliterated) del modelo de razonamiento Olmo 3 7B Think de Ai2 (Allen Institute for AI). El autor, richardyoung, ha aplicado la herramienta Heretic v2.0.0.dev0 sobre el checkpoint allenai/Olmo-3-7B-Think-DPO para reducir de forma dirigida la tendencia del modelo a rechazar peticiones, manteniendo lo máximo posible la distribución original de sus respuestas.

El modelo conserva la arquitectura y el entrenamiento del Olmo 3 7B Think: un transformer decoder-only denso de 7.298.011.136 parámetros (unos 7,3 mil millones), preentrenado sobre el corpus Dolma 3 y postentrenado sobre los conjuntos Dolci, con un pipeline que encadena SFT, DPO y RLVR. La variante Think está optimizada para generar cadenas de pensamiento largas antes de responder, lo que mejora el rendimiento en matemáticas y código.

Su relevancia es doble. Por un lado, es uno de los pocos modelos abliterated con licencia Apache 2.0 y proceso totalmente reproducible (el repositorio incluye un directorio `reproduce` con los parámetros exactos de abliteración). Por otro, sirve como caso de estudio para investigar en alineación, evaluación de comportamiento de rechazo y red teaming, ya que documenta explícitamente el coste de la intervención: la divergencia KL respecto al modelo original es de 0,0263.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, tag `olmo3` en transformers) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Carga en float16 y cuantización de 8 bits con bitsandbytes (`load_in_8bit=True`) según la model card; no se listan otros formatos cuantizados (GGUF, AWQ, GPTQ) en la información disponible |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 14,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Olmo 3 en su variante 7B: un transformer decoder-only denso con atención estándar y un prompt de chat basado en tokens especiales `<|im_start|>`, `<|im_end|>` y `<think>...</think>`. No se dispone en la información proporcionada de detalles sobre número de capas, dimensiones ocultas, número de cabezas de atención ni estrategia posicional.

El entrenamiento heredado de Ai2 sigue cuatro etapas: preentrenamiento sobre Dolma 3, SFT (Olmo-3-7B-Think-SFT), DPO (Olmo-3-7B-Think-DPO) y RLVR (Olmo-3-7B-Think). Este repositorio parte del checkpoint de DPO, no del modelo final con RLVR. Sobre él se aplica abliteración con Heretic v2.0.0.dev0: una sustracción direccional por capa que modifica los pesos de `attn.o_proj` y `mlp.down_proj` con parámetros concretos (`attn.o_proj.max_weight` 1,44; `attn.o_proj.min_weight` 1,15; `mlp.down_proj.max_weight` 0,96; `mlp.down_proj.min_weight` 0,31, entre otros). El resultado es un modelo con 48 rechazos de cada 100 peticiones, frente a los 100 de cada 100 del modelo original, y una divergencia KL de 0,0263 respecto a este.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia y mensaje de sistema por defecto.
- Razonamiento con cadena de pensamiento larga: el modelo emite un bloque `<think>` antes de la respuesta final, lo que favorece tareas de matemáticas y código.
- Generación y asistencia en código, heredada del entrenamiento de Olmo 3 Think.
- Resolución de problemas matemáticos paso a paso mediante el modo de pensamiento.
- Comportamiento de rechazo muy reducido: útil para consultas legítimas que los modelos alineados rechazan por exceso de cautela.
- Reproducibilidad completa del proceso de abliteración (directorio `reproduce` y parámetros publicados).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo Think permite encadenar pasos de razonamiento.
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en alineación y abliteración: el modelo es un caso reproducible con parámetros publicados y métricas de divergencia KL, lo que permite estudiar el compromiso entre supresión de rechazos y deriva de comportamiento respecto al modelo original.
- Red teaming y evaluación de seguridad: sirve como referencia de modelo con filtros reducidos para probar clasificadores de contenido, guardarraíles y sistemas de moderación antes de desplegarlos en producción.
- Generación creativa de ficción: el modo Think y la ausencia de rechazos lo hacen adecuado para narrativa con temas oscuros o conflictos violentos donde los modelos alineados suelen negarse a continuar.
- Asistente conversacional autoalojado: con licencia Apache 2.0 y 7,3B de parámetros puede desplegarse en una GPU de consumo para productos comerciales sin coste de licencia.
- Asistencia en dominios sensibles legítimos: consultas de seguridad, medicina forense o ciberseguridad defensiva que suelen activar rechazos injustificados en modelos alineados.
- Base para fine-tuning específico de dominio: al partir de un checkpoint DPO abliterated, el ajuste posterior no reinyecta rechazos genéricos y se centra en la tarea objetivo.
- Generación de código asistida en pipelines internos: puede integrarse vía transformers para autocompletado y revisión de código, siempre que no se requiera tool calling.
- Comparación controlada de comportamiento: útil para medir experimentalmente cuánto cambia un modelo tras una intervención direccional (48/100 rechazos frente a 100/100).

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (allenai/Olmo-3-7B-Think) |
|---|---|---|
| Rechazos (sobre 100) | 48/100 | 100/100 |
| Divergencia KL | 0,0263 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son las dos métricas de la tabla anterior, que miden el efecto de la abliteración, no la calidad en tareas.

## Requisitos de hardware

- Inferencia en float16/bfloat16: aproximadamente 14,6 GB solo de pesos; con caché KV y activaciones conviene reservar unos 16-18 GB de VRAM.
- Inferencia en 8 bits (bitsandbytes): alrededor de 7,3 GB de pesos; cabe en GPUs de 10-12 GB.
- Inferencia en 4 bits (estimación, no confirmada por el autor): en torno a 4-5 GB, viable en GPUs de 8 GB.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con lotes grandes; RTX 4090 (24 GB) para uso individual en fp16; RTX 3090 (24 GB) igualmente válida; RTX 4080/4070 Ti Super (16 GB) en 8 bits; portátiles con 8 GB solo en 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers >= 4.57.0 como vía oficial documentada; bitsandbytes para cuantización en carga; vLLM, TGI o llama.cpp/Ollama no están confirmados en la información disponible y no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rechazos | Notas |
|---|---|---|---|---|---|---|
| richardyoung/Olmo-3-7B-Think-heretic | 7,3B | no disponible | Apache 2.0 | en | 48/100 | Abliterated sobre el checkpoint DPO; KL 0,0263 |
| allenai/Olmo-3-7B-Think | 7,3B | no disponible | Apache 2.0 | en | 100/100 | Modelo final con RLVR de Ai2 |
| allenai/Olmo-3-7B-Think-DPO | 7,3B | no disponible | Apache 2.0 | en | no disponible | Etapa DPO; base directa de este modelo |
| allenai/Olmo-3-7B-Think-SFT | 7,3B | no disponible | Apache 2.0 | en | no disponible | Etapa SFT del pipeline |

Los resultados de benchmarks frente a alternativas de otros fabricantes (Qwen, Llama, Mistral u otros modelos de ~7B) no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento en tareas.

## Limitaciones y advertencias

- La abliteración reduce los rechazos de 100/100 a 48/100, pero no los elimina: el modelo sigue rechazando casi la mitad de las peticiones de prueba y el criterio puede ser inconsistente.
- Mayor probabilidad de generar contenido dañino, ilegal o inseguro en comparación con el modelo original; el desplegador asume toda la responsabilidad legal y ética del uso.
- La divergencia KL de 0,0263 indica una deriva medible respecto a la distribución original, con posibles degradaciones sutiles de calidad no cuantificadas en tareas.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B; las cadenas de pensamiento `<think>` pueden contener errores, saltos lógicos o erratas que no se corrigen en la respuesta final.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Fecha de corte de conocimiento: diciembre de 2024, según el mensaje de sistema por defecto.
- Al derivar del checkpoint DPO y no del modelo final con RLVR, el rendimiento en matemáticas y razonamiento puede ser inferior al de allenai/Olmo-3-7B-Think.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el uso de este modelo no exime del cumplimiento de la normativa aplicable ni de las condiciones de servicio de las plataformas donde se integre.
- Validación comunitaria muy escasa: 126 descargas y 1 «like» en el momento de la consulta, sin evaluaciones independientes publicadas.
- No se publican pesos GGUF ni cuantizaciones de la comunidad en el repositorio, lo que limita el despliegue en entornos de CPU o de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Olmo-3-7B-Think-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think-DPO
- Modelo original (referencia): https://huggingface.co/allenai/Olmo-3-7B-Think
- Checkpoint SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Modelo base de preentrenamiento: https://huggingface.co/allenai/Olmo-3-1025-7B
- Variante 32B Think: https://huggingface.co/allenai/Olmo-3-32B-Think
- Variante 7B Instruct: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Proyecto Heretic: https://heretic-project.org
- Dataset de postentrenamiento: https://huggingface.co/datasets/allenai/Dolci-Think-RL-7B
- Referencia arXiv citada en las etiquetas del repositorio: arxiv:2512.13961
- Pesos de Ai2: https://huggingface.co/allenai
