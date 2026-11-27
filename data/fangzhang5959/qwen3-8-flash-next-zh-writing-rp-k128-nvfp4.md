# FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4

## Resumen

Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4 es una variante podada y cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario FangZhang5959. Se trata de un ajuste de pesos orientado exclusivamente a la escritura creativa en chino y al roleplay (RP), obtenido mediante una poda de expertos del 75 % (de 512 a 128 expertos enrutados, manteniendo top-10) con la máscara `v3_M2d`, sobre una base que combina el modelo original con el parche no-experto de Huihui-Qwen3.8-Flash-Next-abliterated-v2.

La arquitectura es `Qwen4ExpForConditionalGeneration`, un transformer con mezcla de expertos (MoE) de 48 capas y 128 expertos enrutados con top-10. Los pesos se distribuyen en 21 fragmentos safetensors con 75.388 tensores y un peso neto de 52,607 GiB, de los cuales la cuantización NVFP4 (W4A16, group-16) reduce la huella en GPU del tronco a unos 25,8 GiB tras descargar el vocabulario PLE/Engram (26,822 GiB) a memoria de CPU. Está pensado para servirse con `vllm==0.34.0` y decodificación especulativa MTP.

Su relevancia es acotada pero clara: ofrece un modelo de escritura y roleplay en chino con requisitos de VRAM contenidos para su tamaño (desplegable en una GPU de 32 GB o en dos de 16 GB), a costa de un deterioro severo de las capacidades fuera de dominio (código 0,0 % Pass@1, chino enciclopédico 11,7 %, inglés no utilizable). No es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer MoE, 48 capas, 128 expertos enrutados, top-10) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-10 sobre 128 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16_NVFP4 group-16 (E2M1 con escalas E4M3); capas sensibles en BF16 original; PLE NVFP4 |
| Idiomas soportados | chino (zh); inglés no utilizable segun el autor |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` / `qwen-community-1.0`) |
| Formato de pesos | safetensors (21 fragmentos, 75.388 tensores, 52,607 GiB netos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next, un transformer con mezcla de expertos de 48 capas y 512 expertos enrutados con top-10. Sobre esa base se aplica una poda de expertos con la máscara `v3_M2d`, que reduce el número de expertos de 512 a 128 (75 % podado) manteniendo la selección top-10. Además, se incorpora el parche de las capas no-expertas procedente de huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus) ni si hubo fases de RLHF o DPO para esta variante.

La innovación técnica principal es la cuantización: los expertos se cuantizan a W4A16_NVFP4 (group-16) con calibración nativa sobre las estadísticas del modelo ya podado (`k128`), mientras que las capas sensibles (`lm_head`, `embed_tokens`, `model.visual.*`, `hyper_connection`, `linear_attn`, `self_attn`, `mlp.gate`, `shared_expert`) se conservan en BF16 byte a byte. El vocabulario PLE/Engram se sirve como PLE NVFP4 (26,822 GiB) con `cpu_offload=True` por defecto en Linux (UVA), lo que permite mantener el tronco en unos 25,8 GiB de VRAM. El autor declara una auditoría offline completa de los 21 fragmentos (offsets, formas, SHA-256 y comparación byte a byte de las capas BF16). El despliegue previsto es `vllm==0.34.0` con decodificación especulativa MTP mediante el modelo auxiliar `Qwen3.8-Flash-Next-MTP512-BF16` (1 token especulativo, +7,2 GiB).

## Capacidades

- Generación de texto creativo en chino: escritura literaria, narrativa y prosa (Elo 1535 en escritura china, puntuación literaria 7,16 según el autor).
- Roleplay (RP) en chino: conversación de personajes y diálogo multi-turno (Elo 1532, puntuación 8,02 según el autor).
- Decodificación especulativa MTP compatible con `vllm==0.34.0` sin parches.
- Capacidad multimodal latente: el checkpoint incluye capas `model.visual.*` conservadas en BF16, aunque no se documenta su uso en esta variante.
- Capacidades fuera de dominio muy degradadas: código (Pass@1 0,0 %), conocimiento enciclopédico chino (11,7 %) y lógica (LogiQA2 52,4 %).
- Sin soporte práctico de inglés.
- No se documenta soporte de tool calling ni de flujos de agentes multi-paso.

## Casos de uso

- Escritura creativa y literaria en chino: generación de relatos, capítulos y prosa con las temperaturas recomendadas (0,7 / top_p 0,8 / top_k 20 / min_p 0,1 / repetition_penalty 1,1); el modelo está calibrado y evaluado específicamente para esta tarea.
- Roleplay de personajes: conversaciones multi-turno con personajes consistentes en chino, aprovechando el ajuste abliterated de la base para reducir rechazos en narrativa de ficción.
- Prototipado de asistentes de ficción interactiva: integración en motores de novela visual o juegos de texto en chino mediante el servidor vLLM.
- Investigación sobre poda de expertos MoE: el checkpoint sirve como caso de estudio reproducible de poda 512→128 con máscara `v3_M2d` y cuantización NVFP4 calibrada tras poda.
- Evaluación de cuantización NVFP4 en producción: permite medir el impacto de W4A16 group-16 con capas sensibles en BF16 sobre un MoE servido con vLLM 0.34.0.
- Despliegue en hardware de gama alta de consumo o estaciones de trabajo: al ocupar unos 25,8 GiB en GPU con el PLE descargado a CPU, cabe en una GPU de 32 GB o en dos de 16 GB para generación de texto en local.
- Benchmarking de decodificación especulativa MTP: combinación con el modelo MTP512-BF16 para medir latencia y throughput en vLLM.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| Escritura china (Elo, evaluación ciega misma máscara) | 1535 | Según el autor |
| Puntuación literaria china | 7,16 | Según el autor |
| Roleplay chino (Elo) | 1532 | Según el autor |
| Roleplay chino (puntuación) | 8,02 | Según el autor |
| Código Pass@1 | 0,0 % | Dominio fuera de alcance |
| Chinese-SimpleQA | 11,7 % | Dominio fuera de alcance |
| LogiQA2 | 52,4 % | Dominio fuera de alcance |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible. Las cifras de escritura y roleplay proceden del propio autor y no se acompañan de la metodología completa en la información proporcionada.

## Requisitos de hardware

- VRAM del tronco en GPU: aproximadamente 25,8 GiB con el PLE/Engram (26,822 GiB) descargado a memoria de CPU mediante `cpu_offload=True` (UVA en Linux).
- VRAM adicional si se usa decodificación especulativa: +7,2 GiB para `Qwen3.8-Flash-Next-MTP512-BF16`.
- GPU compatibles: una GPU de 32 GB o más (por ejemplo, A100 40 GB, H100, RTX 5090 de 32 GB) o dos GPU de 16 GB.
- No cabe en GPU de consumo de 16 GB o menos sin recurrir a mayor offload.
- Despliegue: `vllm==0.34.0` con `--dtype bfloat16 --moe-backend marlin`; requiere `transformers>=5.22.2` y `compressed-tensors>=0.17.0`.
- No se documentan opciones GGUF, llama.cpp, Ollama ni TGI para este checkpoint NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4 | no disponible (MoE 128 expertos, top-10) | no disponible | Escritura y RP en chino, NVFP4 | Qwen Community License 1.0 | Hugging Face, ModelScope |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (MoE 512 expertos, top-10) | no disponible | Propósito general | Qwen Community License 1.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2 | no disponible | no disponible | Propósito general sin rechazos | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, más allá de las puntuaciones de escritura y RP declaradas por el autor para esta versión.

## Limitaciones y advertencias

- Modelo de dominio estrecho: el propio autor advierte que no debe usarse para programación, ciencia, ingeniería ni tareas en inglés.
- Rendimiento fuera de dominio muy bajo: código 0,0 % Pass@1, Chinese-SimpleQA 11,7 %, LogiQA2 52,4 %.
- Inglés no utilizable según el autor; el soporte multilingüe se limita al chino.
- Riesgo de alucinación elevado en conocimiento factual, coherente con su entrenamiento orientado a ficción.
- La base incorpora un parche abliterated, lo que puede reducir los filtros de rechazo y aumentar la probabilidad de contenido sensible; requiere moderación en producción.
- Licencia Qwen Community License 1.0: el uso personal y local está permitido, pero el uso comercial como MaaS o en productos comerciales de programación u ofimática requiere autorización adicional de Qwen.
- Requiere `vllm==0.34.0` y versiones concretas de `transformers` y `compressed-tensors`; no hay soporte documentado para otros motores de inferencia.
- Longitud de contexto y número de parámetros no documentados en la información disponible.
- Las puntuaciones de escritura y RP proceden del autor y no se acompañan de una evaluación independiente verificable.

## Enlaces

- Hugging Face: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4
- Repositorio GitHub: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP
- README técnico en inglés: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP/blob/main/README_EN.md
- ModelScope (espejo): https://modelscope.cn/models/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Parche abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2
