# llmfan46/Dark-Nexus-27B-v3.0-uncensored-heretic-GGUF

## Resumen

Dark-Nexus-27B-v3.0-uncensored-heretic-GGUF es una cuantizacion en formato GGUF del modelo Dark-Nexus-27B-v3.0-uncensored-heretic, publicado por el usuario independiente llmfan46 en Hugging Face. El modelo base es una version "decensored" (abliterated) de ReadyArt/Dark-Nexus-27B-v3.0, obtenida mediante la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA). La etiqueta qwen3_5 indica que el modelo original deriva de la familia Qwen, con aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos safetensors del modelo base).

El proposito declarado del modelo es reducir el numero de rechazos (refusals) en respuestas conversacionales, orientandolo a roleplay, contenido explicito y escenarios ERP (erotic roleplay), manteniendo al mismo tiempo la calidad del modelo original. Segun la model card, la ablacion reduce los rechazos de 84/100 a 10/100 en una bateria de prueba de 100 prompts, con una divergencia KL de 0,0883 respecto al modelo original, lo que indica un grado de alteracion moderado pero no despreciable.

Este repositorio concreto contiene unicamente los pesos cuantizados en GGUF, no el modelo completo en safetensors. El repositorio pesa 203,1 GB, coherente con multiples niveles de cuantizacion de un modelo de ~27B. La licencia es "other" (no estandar), lo que limita su uso comercial sin consultar los terminos del autor. El modelo esta marcado como "not-for-all-audiences" y lleva etiquetas como nsfw, explicit, dangerous y unaligned.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen (tag qwen3_5); detalles de atencion y capas no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | No disponibles |
| Licencia | Other (no estandar) |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen (tag qwen3_5), con aproximadamente 26,9 mil millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (estandar o con variantes como GQA/MLA) ni sobre el dataset de entrenamiento original de ReadyArt/Dark-Nexus-27B-v3.0, mas alla de que el modelo base se presenta como una variante de roleplay sin alineacion.

La innovacion tecnica relevante no esta en el entrenamiento sino en la modificacion post-entrenamiento: la ablacion de direcciones de comportamiento en los pesos. Segun la model card, se aplico Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA), con los siguientes parametros: start_layer_index 4, end_layer_index 43, preserve_good_behavior_weight 0,0666, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 1,0488 y neighbor_count 11. Los componentes objetivo fueron attn.o_proj y attn.out_proj. Este procedimiento elimina selectivamente direcciones asociadas a rechazos sin reentrenar, lo que explica tanto la reduccion de refusals como la divergencia KL de 0,0883.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay y narrativa.
- Roleplay explicito y contenido ERP/NSFW, con reduccion declarada de rechazos (10/100 frente a 84/100 del original).
- Razonamiento general y conocimiento factual preservado en gran medida (MMLU del original 0,8532).
- Capacidades multilingues: no documentadas; se desconoce si conserva el multilingusimo del Qwen original.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking, vision o audio: no documentado; el tag qwen3_5 no confirma capacidades multimodales.
- Capacidad de seguir instrucciones de sistema y personajes (system prompt / character cards) en contextos de roleplay.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta ajustado para mantener personajes coherentes en dialogos multi-turno, con menor probabilidad de romper el personaje por rechazos o sermones, lo que lo hace adecuado para plataformas de entretenimiento conversacional.
- Creacion de narrativa y ficcion explicita: escritura asistida de relatos y guiones con contenido adulto, donde la reduccion de refusals evita interrupciones del flujo creativo.
- Chatbots de compania y bienestar emocional simulado: conversaciones de acompanamiento donde se prioriza la continuidad del dialogo sobre la moderacion automatica, siempre con salvaguardas externas.
- Prototipado de sistemas de moderacion: util como modelo "adversario" para evaluar clasificadores de contenido o filtros de seguridad, dado su perfil de baja tasa de rechazo.
- Investigacion sobre abliteration y alineacion: permite estudiar el efecto de la ablacion de direcciones de comportamiento sobre calidad (KL 0,0883) y tasas de rechazo en un modelo de ~27B.
- Despliegue local con llama.cpp/Ollama: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo con GPU consumer para experimentacion offline y privacidad de datos.
- Generacion de datos sinteticos para fine-tuning de estilo: produccion de dialogos con tono y registro especificos para datasets de entrenamiento de otros modelos.

## Benchmarks y rendimiento

La model card proporciona resultados MMLU del modelo original (ReadyArt/Dark-Nexus-27B-v3.0) y metricas comparativas de la ablacion. No se aportan benchmarks del modelo cuantizado GGUF ni de HumanEval, GSM8K u otros.

| Metrica | Modelo original | Este modelo (abliterated) |
|---|---|---|
| MMLU (acc, 0-shot) | 0,8532 ± 0,0029 | No disponible |
| MMLU humanities | 0,8019 ± 0,0056 | No disponible |
| MMLU other | 0,8742 ± 0,0057 | No disponible |
| Refusals (100 prompts) | 84/100 | 10/100 |
| KL divergence vs original | 0 (por definicion) | 0,0883 |

Subcampos MMLU del original destacados: high_school_world_history 0,9578; high_school_us_history 0,9461; marketing 0,9487; medical_genetics 0,9500; moral_scenarios 0,7073; professional_law 0,7158; global_facts 0,6000.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~27B parametros, en FP16 requiere ~54 GB (no cabe en GPU consumer); en Q8 ~27-30 GB; en Q4_K_M ~16-18 GB; en Q3 ~12-14 GB.
- GPU recomendadas: A100 80GB o H100 para FP16/BF16; RTX 4090 (24 GB) para Q8 o Q6; RTX 3090/4080 para Q4-Q5.
- Cabe en GPU consumer: si, en cuantizaciones Q4/Q5 con GPUs de 16-24 GB, o parcialmente con offloading en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI solo si se dispone del modelo en safetensors y suficiente VRAM.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, GPU y backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Formato |
|---|---|---|---|---|---|
| Dark-Nexus-27B-v3.0-uncensored-heretic (este) | ~26,9B | No disponible | Other | Roleplay sin alineacion, abliterated | GGUF |
| ReadyArt/Dark-Nexus-27B-v3.0 (original) | ~26,9B | No disponible | No disponible | Roleplay sin alineacion | Safetensors |
| Familia Qwen de ~27B (base) | ~27B | No disponible | No disponible | Generalista | Safetensors/GGUF |

No se dispone de datos de rendimiento comparativo con modelos alternativos de la misma categoria (abliterated/uncensored) en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido NSFW, explicito y potencialmente danino: el modelo esta explicitamente marcado como "not-for-all-audiences" y "dangerous"; no debe exponerse a menores ni en entornos sin moderacion.
- Sesgos: la ablacion elimina direcciones de rechazo, lo que puede reducir tambien salvaguardas frente a contenido ilegal, danino o sesgado; no hay evaluacion de sesgos publicada.
- Alucinacion: no se han publicado mediciones de tasa de alucinacion; la divergencia KL de 0,0883 implica alteracion de pesos y posible degradacion sutil en tareas fuera del dominio de roleplay.
- Contexto e idiomas: longitud de contexto e idiomas no documentados; no asumir capacidades multilingues del Qwen original sin verificacion.
- Licencia "other": uso comercial restringido o condicionado; es necesario revisar los terminos del autor y del modelo base antes de cualquier despliegue productivo.
- Calidad tras cuantizacion: los benchmarks MMLU corresponden al modelo original, no al GGUF; el rendimiento real puede diferir segun el nivel de cuantizacion.
- Repositorio con limite de almacenamiento: el autor advierte que no subira nuevos modelos sin financiacion; posibles interrupciones de mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Dark-Nexus-27B-v3.0-uncensored-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Dark-Nexus-27B-v3.0-uncensored-heretic
- Modelo original: https://huggingface.co/ReadyArt/Dark-Nexus-27B-v3.0
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request ARA: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
