# quant-mind/Inkling-2-Mini-SM86-Fast

## Resumen

Inkling-2-Mini-SM86-Fast es una recuantización de tipo GPTQ int4 (W4A16) del modelo thinkingmachines/Inkling-2-Mini, un transformer de tipo Mixture-of-Experts con 26.070.385.152 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, publicado por el usuario quant-mind. El checkpoint está diseñado específicamente para ejecutarse en dos NVIDIA RTX 3090 (arquitectura Ampere, SM86) mediante el fork de vLLM denominado `vllm-inkling2`, con paralelismo tensorial de grado 2, y conserva la ventana de contexto completa de 262.144 tokens del modelo original.

La relevancia de esta ficha radica en que el modelo base no puede ejecutarse en GPUs de consumo con vLLM estándar: requiere soporte para attention cuantizada int4 y kernels específicos para SM86 que solo existen en el fork citado. Esta recuantización sustituye los expertos enrutados y las proyecciones de atención por GPTQ simétrico `uint4b8` con grupos de 128, mantiene en bf16 las partes sensibles (embeddings, lm_head, router, controladores, convoluciones cortas, normas y AttnRes) y elimina la torre de visión. Además incorpora decodificación especulativa DSpark con un vocabulario de borrador podado de 40.960 identificadores.

El resultado declarado por el autor es una mejora de throughput de decodificación de entre el 6,4 % y el 8,2 % frente al checkpoint AWQ previo, una reducción del 15-23 % en el tiempo hasta el primer token en prefills largos y un peso por GPU de 7,12 GiB, manteniendo la perplejidad en 1,4204 sobre un corpus de código Go de 43.758 tokens. La licencia es Apache 2.0 y los idiomas declarados son inglés y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con bucle (looped MoE), atención con AttnRes; decodificación especulativa DSpark |
| Parametros totales | 26.070.385.152 |
| Parametros activos | Aproximadamente 3.000 millones (según model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ int4 simétrico `uint4b8`, grupo 128, formato compressed-tensors `pack-quantized`, cargado en Marlin W4A16; componentes densos en bf16; KV cache `int8_per_token_head` en la configuración de servicio |
| Idiomas soportados | Inglés (en) y portugués (pt, con calibración en PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (25 shards), más `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 26.070 millones de parámetros totales y aproximadamente 3.000 millones activos por token, con una estructura de bucle (looped MoE) que reutiliza bloques de expertos en varias pasadas. Esta recuantización no reentrena el modelo: aplica GPTQ sobre los expertos enrutados y las proyecciones de atención con calibración de tipo self-distillation, generando 5,68 millones de tokens a partir de 8.469 prompts procedentes de 13 conjuntos de datos públicos, respondidos por el checkpoint oficial a temperatura 1.0 con una mezcla de esfuerzos de razonamiento. El corpus de calibración final consta de 321 filas y 442.712 tokens, con una composición del 45 % código, 25 % llamadas a herramientas y razonamiento, y 30 % prosa en inglés y PT-BR.

La innovación técnica principal es la integración de decodificación especulativa DSpark con el borrador bf16 oficial (`mtp.safetensors`) y un vocabulario de borrador podado a 40.960 identificadores, seleccionados como los más frecuentes del split de entrenamiento con cobertura en held-out del 99,46 % en código, 99,45 % en llamadas a herramientas, 98,44 % en PT-BR y 97,30 % en prosa inglesa. El bloque de borrador es de 8 tokens y la configuración de servicio exige `num_speculative_tokens: 7`. Los hessianos para GPTQ se recogieron con el propio motor de servicio sobre el checkpoint oficial.

## Capacidades

- Generación de texto conversacional y de prosa en inglés y portugués de Brasil.
- Generación y edición de código, con calibración específica sobre tareas de code editing.
- Razonamiento matemático y modos de razonamiento con parser dedicado (`--reasoning-parser inkling`), con una puerta de calidad que verifica que no se filtre razonamiento a la respuesta (0/12 en 12 prompts greedy).
- Llamadas a herramientas y function calling con parser dedicado (`--tool-call-parser inkling`) y `--enable-auto-tool-choice`; el autor reporta 30/30 llamadas íntegras en streaming y continuación, 30/30 controles y 12/12 argumentos adversariales superados.
- Recuperación de información en contexto largo (needle retrieval) verificada en 12k, 130k y 235k tokens con 3 semillas cada uno (9/9).
- Decodificación especulativa integrada en el runtime para acelerar la generación.
- No incluye capacidades de visión: la torre de visión fue eliminada y el servicio debe lanzarse con `--language-model-only`.

## Casos de uso

- Asistencia de código en producción: el modelo genera y edita código con un throughput de decodificación de 323,9 tok/s en modo greedy sobre dos RTX 3090, lo que permite integrarlo en pipelines de revisión o autocompletado con latencias interactivas.
- Agentes con llamadas a herramientas: el soporte verificado de function calling en streaming y con argumentos adversariales lo hace adecuado para orquestadores que encadenan APIs externas y necesitan respuestas parciales antes de completar la llamada.
- Análisis de repositorios completos: con 262.144 tokens de contexto y recuperación verificada hasta 235k tokens, puede procesar árboles de código o documentación extensa en una sola pasada sin troceado.
- Atención al cliente en portugués de Brasil e inglés: la calibración incluye prosa en PT-BR con cobertura de vocabulario del 98,44 %, y el modelo mantiene conversaciones multi-turno dentro de la ventana completa.
- Razonamiento matemático con trazas separadas: el parser de razonamiento permite separar el modo thinking de la respuesta final, útil en sistemas que auditan el proceso antes de mostrar el resultado.
- Despliegue en hardware de consumo para investigación: con 7,12 GiB de pesos por GPU y un pico de 20,2 GiB por GPU en benchmark, dos RTX 3090 de 24 GB permiten servir el modelo completo con contexto largo, algo inviable con el checkpoint bf16 original.
- Evaluación comparativa de cuantizaciones: la receta reproducible (`recipe.yaml`, `reproduce/`, `quantize_stats.json`, `PROVENANCE.md`) permite replicar el proceso y comparar técnicas GPTQ frente a AWQ sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos medidos por el autor en 2x RTX 3090 (270 W cada una, PCIe P2P, sin NVLink), TP2, un solo stream, frente al checkpoint `Ar4ikov/Inkling-2-Mini-AWQ-W4A16-ASYM-INT4`:

| Carga de trabajo | AWQ | Este checkpoint | Cambio |
|---|---|---|---|
| Código, greedy, decodificación tok/s | 299,3 | 323,9 | +8,2 % |
| Código, T=1.0, decodificación tok/s | 270,3 | 289,0 | +6,9 % |
| Prosa EN / PT-BR, T=1.0, decodificación tok/s | 189,0 | 201,1 | +6,4 % |
| Código con 107k / 249k de contexto, decodificación tok/s | 306,6 / 212,2 | 308,5 / 220,0 | +0,6 % / +3,7 % |
| Prefill en frío de 106.599 / 249.268 tokens (TTFT) | 26,5 s / 93,9 s | 22,5 s / 72,0 s | −15 % / −23 % |
| Pesos por GPU | 7,42 GiB | 7,12 GiB | −0,30 GiB |
| Pico de VRAM por GPU (benchmark) | 20,2 / 18,1 GiB | 20,2 / 18,1 GiB | igual |

Puertas de calidad declaradas:

| Puerta de calidad | Resultado | Umbral |
|---|---|---|
| Perplejidad, 43.758 tokens de código Go (oficial 1,4147; AWQ previo 1,4206) | 1,4204 | ≤ 1,4216 |
| Razonamiento filtrado a la respuesta, 12 prompts greedy | 0/12 | 0/12 |
| Llamadas a herramientas: integridad en streaming y continuación | 30/30 + 30/30, 12/12 adversariales | todas |
| Recuperación needle a 12k / 130k / 235k tokens, 3 semillas | 9/9 | 9/9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: pesos de 7,12 GiB por GPU en TP2; pico medido de 20,2 GiB y 18,1 GiB por GPU en benchmark; 22,2 / 20,0 GiB de pico con un prompt de 235k tokens.
- GPU recomendadas: dos NVIDIA RTX 3090 (SM86) con PCIe P2P entre ellas; el runtime requiere kernels específicos para SM86 y no funciona con vLLM estándar.
- Cabe en GPU de consumo: sí, en dos RTX 3090 de 24 GB; no se documenta funcionamiento en una sola GPU ni en GPUs de otra arquitectura.
- Despliegue: exclusivamente con el fork `vllm-inkling2`, rama `inkling2-sm86`, commit `682e8115a` o posterior, instalado en modo editable sobre el wheel precompilado de su merge base. No se mencionan llama.cpp, Ollama ni TGI.
- Variables de entorno requeridas: `VLLM_ALLREDUCE_USE_FLASHINFER_PCIE_IPC=1`, `VLLM_INKLING2_INT8_DENSE=1`, `VLLM_INKLING2_DENSE_BITS=4`, `VLLM_INKLING2_EMBED_INT8=1`, `VLLM_INKLING2_PREFILL_ATTN_INT8=1`, `VLLM_INKLING2_PREFILL_ATTN_PV_F16ACC=1`, `VLLM_INKLING2_PREFILL_ATTN_SPLITS=1`, `VLLM_INKLING2_DSPARK_MIN_CONFIDENCE=0.5`, `VLLM_INKLING2_P2P_AR_CONV=1`.
- Throughput: 323,9 tok/s en decodificación greedy sobre código y 201,1 tok/s en prosa a temperatura 1.0; TTFT de 22,5 s para un prefill de 106.599 tokens y 72,0 s para 249.268 tokens.
- El servicio exige `--max-num-seqs 1`, `--max-num-batched-tokens 2048`, `--no-async-scheduling`, backend MoE `humming` y `--kv-cache-dtype int8_per_token_head`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quant-mind/Inkling-2-Mini-SM86-Fast | 26,07B totales, ~3B activos | 262.144 | GPTQ int4 W4A16 + DSpark | Apache 2.0 | Hugging Face, requiere fork de vLLM |
| Ar4ikov/Inkling-2-Mini-AWQ-W4A16-ASYM-INT4 | 26,07B totales, ~3B activos | no disponible en la información | AWQ W4A16 asimétrico int4 | no disponible en la información | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B totales, ~3B activos | 262.144 | bf16 | no disponible en la información | Hugging Face |

Frente al checkpoint AWQ, esta versión mejora la decodificación entre un 6,4 % y un 8,2 %, reduce el TTFT un 15-23 % en prefills largos y ocupa 0,30 GiB menos por GPU, con perplejidad prácticamente idéntica (1,4204 frente a 1,4206). Frente al modelo base en bf16, la ventaja es la viabilidad en dos GPUs de consumo, a costa de una pérdida de calidad cuantificada en la puerta de perplejidad.

## Limitaciones y advertencias

- Dependencia estricta del fork `vllm-inkling2` (rama `inkling2-sm86`, commit `682e8115a` o posterior): vLLM estándar no ejecuta Inkling 2 en SM86 ni carga su atención int4.
- Requiere PCIe P2P entre las dos GPUs para `VLLM_INKLING2_P2P_AR_CONV=1` y el all-reduce FlashInfer PCIe-IPC; sin P2P el despliegue no es válido.
- Solo texto: la torre de visión fue eliminada y el servicio debe lanzarse con `--language-model-only`.
- Idiomas limitados a inglés y portugués (PT-BR en calibración); no se declara soporte de castellano ni de otros idiomas.
- `num_speculative_tokens: 7` es obligatorio porque el bloque de borrador es de 8; otro valor invalida la decodificación especulativa.
- `VLLM_INKLING2_DSPARK_MIN_CONFIDENCE=0.5` exige `--no-async-scheduling`, lo que limita el solapamiento de scheduling.
- La perplejidad de 1,4204 se midió sobre un corpus estrecho de código Go (43.758 tokens); no hay benchmarks estándar publicados que permitan estimar la degradación en otras tareas.
- El vocabulario de borrador podado cubre el 97,30 % en prosa inglesa en held-out, el valor más bajo de los cuatro dominios medidos, lo que puede reducir la tasa de aceptación especulativa fuera de código y herramientas.
- Sin datos publicados sobre sesgos, tasas de alucinación ni comportamiento fuera de los dominios de calibración.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base declara una licencia no verificada en la información disponible; conviene confirmar los términos del modelo original antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/quant-mind/Inkling-2-Mini-SM86-Fast
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint AWQ de comparación: https://huggingface.co/Ar4ikov/Inkling-2-Mini-AWQ-W4A16-ASYM-INT4
- Fork de vLLM: https://github.com/quantforge-br/vllm-inkling2/tree/inkling2-sm86
