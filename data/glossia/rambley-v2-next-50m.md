# glossia/Rambley-V2-Next-50M

## Resumen

Rambley-V2-Next-50M es un modelo de lenguaje de aproximadamente 50 millones de parametros (49.718.600 exactos segun los pesos en safetensors) desarrollado por glossia, un autor independiente centrado en modelos pequenos de lenguaje (SLM). Se trata de un modelo base preentrenado y posteriormente sometido a una fase de "midtrained" sobre una mezcla de datos ampliada, partiendo de `glossia/Rambley-V2-Next-50M-Pretrain`. Su relevancia radica en que explora tecnicas de arquitectura habitualmente reservadas a modelos grandes (atencion con cabezas virtuales, attention sinks, sliding window attention, embeddings posicionales HoPE) en un regimen de escala muy reducido.

El modelo se presenta como el actual lider de la categoria sub-50M en la clasificacion de glossia y tercero en la de AxiomicLabs (con un PR pendiente de fusion en el momento de publicacion). No es un modelo instructivo ni orientado a chat: es un modelo base de investigacion, sin pipeline declarado y sin idiomas documentados. Su interes es fundamentalmente experimental y de comparacion de arquitecturas en el tramo de los 50M de parametros.

La licencia es CC-BY-SA-4.0, lo que permite uso comercial con atribucion y obligacion de compartir bajo la misma licencia las obras derivadas. El contexto nativo es de 2048 tokens y los pesos se distribuyen en formato safetensors con codigo personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, Virtual Head Attention, headwise gated attention, attention sinks aprendidos, patron SWA:SWA:GQA y HoPE |
| Parametros totales | 49.718.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens nativos |
| Tipos de cuantizacion | no disponible (entrenado nativamente en FP8; pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una serie de innovaciones poco habituales en esta escala. Los MLP usan SwiGLU. La atencion emplea Virtual Head Attention con 32 cabezas de consulta "falsas" y 8 fisicas (Ding et al., 2026), atencion con compuertas a nivel de cabeza en lugar de a nivel de elemento (Qiu et al., 2025), y attention sinks aprendidos en cada cabeza (OpenAI, 2026; LLM-Core Xiaomi, 2026). El patron de atencion es SWA:SWA:GQA con ventana deslizante de 128 tokens, forzando la ultima capa a GQA. Incorpora embeddings posicionales HoPE tanto en las capas SWA como en las GQA (Chen et al., 2024) e Identity Hyperconnections.

El entrenamiento se realizo nativamente en FP8. Un 60% del presupuesto de tokens de preentrenamiento se dedico a pretraining a nivel de parche (patch-level pretraining, Shao et al., 2025; Peng et al., 2026). Se usaron dos optimizadores: Muon con LR 0.02 para matrices, con restricciones de norma de pesos Hyperball (Wen et al., 2026), y AdamW con LR 0.002 para embeddings, vectores y normas, sin weight decay ni Hyperball. El scheduler de LR es AIR (Yu et al., 2026). La mezcla de datos incluye `glossia/picl-text`, `IFM/TxT360-v2`, `HuggingFaceTB/dclm-edu`, `common-pile/libretexts_filtered`, `ByteDance-Seed/mga-fineweb-edu` y `gvlassis/ClimbMix`; de este ultimo solo se usaron los clusters 2, 6, 12 y 15, excluyendo explicitamente el cluster de matematicas y la mayor parte de los de STEM. No se documenta RLHF ni DPO; es un modelo base.

## Capacidades

- Generacion de texto autoregresiva como modelo base (no instructivo, sin alineamiento documentado).
- Razonamiento y conocimiento general limitados por su escala (50M de parametros).
- Aritmetica elemental basica: 34,90% en arithmark-3, con resultados por categoria que van del 20,31% en sumas de grados 1-2 al 71,15% en areas de geometria de grados 4-5.
- Comprension lectora y sentido comun de nivel basico segun ARC y HellaSwag.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion de arquitecturas a escala reducida: banco de pruebas para Virtual Head Attention, attention sinks, HoPE y SWA en un modelo que cabe en cualquier GPU consumer, permitiendo ablaciones rapidas y economicas.
- Prototipado de pipelines de entrenamiento: validar recetas de optimizador (Muon + AdamW), scheduler AIR y pretraining a nivel de parche antes de escalar a modelos mayores.
- Benchmarking de SLM: servir como referencia sub-50M en leaderboards y comparativas academicas, dado su posicion declarada como lider de categoria en glossia.
- Educacion y docencia: modelo lo bastante pequeno (repo de 0,1 GB) para ejecutarse en portatil y explicar el funcionamiento interno de un transformer con tecnicas modernas.
- Generacion de texto de bajo coste en entornos con recursos minimos: completado de texto y continuaciones simples donde no se requiera calidad alta ni instrucciones.
- Pruebas de cuantizacion y despliegue: al ser tan pequeno, permite medir latencia y throughput en llama.cpp, Ollama o vLLM para estudiar el efecto de la cuantizacion sin coste de infraestructura.
- Fine-tuning experimental: punto de partida para adaptaciones a dominios concretos con presupuesto de computo minimo, gracias a su licencia CC-BY-SA-4.0.

## Benchmarks y rendimiento

Resultados publicados en la model card (0-shot, filtro none):

| Tarea | Version | n-shot | Metrica | Valor | Stderr |
|---|---|---|---|---|---|
| arc_challenge | 1 | 0 | acc | 0.2116 | ± 0.0119 |
| arc_challenge | 1 | 0 | acc_norm | 0.2577 | ± 0.0128 |
| arc_easy | 1 | 0 | acc | 0.4924 | ± 0.0103 |
| arc_easy | 1 | 0 | acc_norm | 0.4499 | ± 0.0102 |
| hellaswag | 1 | 0 | acc | 0.3005 | ± 0.0046 |
| hellaswag | 1 | 0 | acc_norm | 0.3281 | ± 0.0047 |
| piqa | 1 | 0 | acc | 0.6360 | ± 0.0112 |
| piqa | 1 | 0 | acc_norm | 0.6376 | ± 0.0112 |

Benchmark adicional arithmark-3: 34,90% raw y 34,90% normalizado (349/1000). Desglose por categoria parcialmente disponible en la model card: addition grades 1-2 easy 20,31%; comparison grades 2-3 medium 20,45%; comparison_difference grades 2-3 medium 27,08%; data grades 2-3 easy 32,56% normalizado (37,21% raw); division grades 3-4 medium 35,19%; fractions_counting grades 3-4 medium 22,00% normalizado (20,00% raw); geometry_area grades 4-5 medium 71,15% normalizado (69,23% raw).

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (unos 100 MB de pesos) y por debajo de 300 MB en cuantizacion de 8 bits; en la practica cabe en cualquier GPU con mas de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU o CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en CPU y en dispositivos de borde.
- Opciones de despliegue: al usar `custom_code`, la carga requiere `trust_remote_code=True`; la compatibilidad con llama.cpp, Ollama, vLLM o TGI no esta documentada y depende de que la arquitectura personalizada este soportada por dichos motores.
- Latencia y throughput estimados: no disponibles de forma oficial; el autor reporta 674,7 ejemplos/s en la evaluacion de arithmark-3 (tokenizacion 0,24 s, evaluacion 1,48 s sobre 32 lotes), lo que da una idea del orden de magnitud en hardware de evaluacion no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rambley-V2-Next-50M | 49,7M | 2048 | CC-BY-SA-4.0 | Arquitectura experimental; lider declarado sub-50M en glossia |
| SmolLM-135M (HuggingFace) | 135M | 2048 | Apache-2.0 | Alternativa de referencia en SLM; no disponible en la informacion proporcionada para comparacion de rendimiento |
| Pythia-70M (EleutherAI) | 70M | 2048 | Apache-2.0 | Modelo base de investigacion ampliamente usado; no disponible para comparacion de rendimiento |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Referencia historica de SLM; no disponible para comparacion de rendimiento |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable ni esta optimizado para chat; requiere fine-tuning para tareas conversacionales.
- Escala muy reducida (50M): capacidad de razonamiento, conocimiento factual y coherencia limitadas; el riesgo de alucinacion es alto en preguntas factuales.
- Contexto nativo de 2048 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; la mezcla de datos sugiere predominio del ingles, con riesgo de bajo rendimiento en castellano.
- La mezcla de datos excluye el cluster de matematicas y la mayor parte de STEM de ClimbMix, lo que explica el rendimiento bajo en aritmetica (34,90% en arithmark-3) y limita su uso en tareas cuantitativas.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica ejecutar codigo del autor y revisarlo antes de usarlo en produccion.
- Sin datos publicados de sesgos; al ser un modelo base entrenado con web a gran escala, es probable que herede sesgos de las fuentes.
- No hay evidencia de soporte en motores de inferencia estandar; la integracion en produccion requeriria validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2-Next-50M
- Modelo base de preentrenamiento: https://huggingface.co/glossia/Rambley-V2-Next-50M-Pretrain
- Leaderboard SLM de glossia: https://huggingface.co/spaces/glossia/SLM-leaderboard
- Leaderboard Open SLM de AxiomicLabs: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Codigo de preentrenamiento: https://code.allura.moe/fizz/lobotomy
- Discord del autor: https://discord.gg/6acXmq3yx2
- Paper Virtual Head Attention (Ding et al., 2026): https://arxiv.org/abs/2610.17959v1
- Paper headwise gated attention (Qiu et al., 2025): https://arxiv.org/abs/2505.06708v1
- Paper attention sinks (OpenAI, 2026): https://arxiv.org/abs/2508.10925
- Paper attention sinks (LLM-Core Xiaomi, 2026): https://arxiv.org/abs/2601.02780
- Paper sliding window (Qiao et al., 2026): https://arxiv.org/abs/2606.15378
- Paper HoPE (Chen et al., 2024): http://arxiv.org/abs/2410.21216v2
- Paper patch-level pretraining (Shao et al., 2025): https://arxiv.org/abs/2407.12665v3
- Paper patch-level pretraining (Peng et al., 2026): https://arxiv.org/abs/2605.06546
- Paper optimizador Muon/Hyperball (Wen et al., 2026): https://arxiv.org/abs/2606.16899v1
- Paper scheduler AIR (Yu et al., 2026): https://arxiv.org/abs/2610.40362
- Articulo sobre Identity Hyperconnections (zhihu): https://zhuanlan.zhihu.com/p/2010852389670908320
