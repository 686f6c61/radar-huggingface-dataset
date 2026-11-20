# Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-2.96bpw-SM120 es una cuantización de precisión mixta (2,96 bits por peso en los expertos enrutados) del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. Se distribuye como un checkpoint autocontenido de 79,50 GB que incluye los pesos cuantizados, una tabla de embeddings posicionales (PLE) en Q4_0 de 28,80 GB y un drafter especulativo DFlash2 calibrado de 563,8 MB, junto con un wheel de runtime SASS-only para GPUs NVIDIA Blackwell (sm_120).

El modelo base es un transformer híbrido MoE de 180B parámetros totales con 48 capas: 36 capas Gated DeltaNet (GDN), 12 capas Qwen Sparse Attention (QSA), 512 expertos enrutados más 1 compartido y 4 flujos de Hyper-Connections (mHC). La cuantización Wave-Quant v6.2 reduce el peso en disco por debajo de la alternativa UD-Q2_K_XL (79,58 GB) manteniendo una divergencia KL inferior y mayor acuerdo Top-1 frente a la referencia BF16.

Su relevancia práctica radica en que permite ejecutar un modelo de 180B en una única GPU Blackwell de 96 GB (RTX PRO 6000) con 57,27 GiB de VRAM residente, o en una RTX 5090 de 32 GB en modo híbrido con CPU, alcanzando entre 240 y 535 tok/s según lote y configuración gracias a la decodificación especulativa DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), 4 flujos mHC Hyper-Connections |
| Parametros totales | 180B (modelo base) |
| Parametros activos | 512 expertos enrutados + 1 compartido (número de activos no disponible) |
| Longitud de contexto | Hasta 120K tokens verificados en pruebas multi-needle (máximo exacto no disponible) |
| Tipos de cuantizacion | Wave-Quant v6.2 a 2,96 bpw en expertos enrutados; PLE en Q4_0; drafter DFlash2 en SWZ4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint cuantizado) + wheel de runtime `qfn_sm120_unified-22.5.0` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina dos mecanismos de atención en una pila de 48 capas: 36 capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y 12 capas Qwen Sparse Attention (QSA) con selección top-2048 tokens. La capa MoE emplea 512 expertos enrutados más uno compartido, y el bloque incorpora 4 flujos de Hyper-Connections (mHC) para el flujo de información entre capas. Los detalles de composición del dataset de entrenamiento, número de tokens y si hubo RLHF/DPO no están disponibles en la información proporcionada.

La innovación principal de esta ficha es la cuantización Wave-Quant v6.2, que asigna 2,96 bits por peso a los expertos enrutados y mantiene una divergencia KL media de 0,13178 frente a BF16 sobre 16.384 tokens de validación ciega, con un acuerdo Top-1 del 90,44% y Top-5 del 99,18%. El paquete incluye además un drafter especulativo DFlash2 calibrado (SWZ4, 563,8 MB) que permite decodificación especulativa con árbol, y un wheel de runtime compilado solo en SASS para sm_120 que expone servidores compatibles con OpenAI y Anthropic SSE, tool calling incremental, presupuesto de tokens de pensamiento y caché KV FP4 opcional.

## Capacidades

- Generación de texto conversacional y de formato largo con pipeline `text-generation`.
- Razonamiento con modo de pensamiento (`<think>...</think>`) y control mediante `thinking_token_budget`.
- Tool calling / function calling con `tools` e `tool_calls` incrementales en la API OpenAI SSE.
- Soporte de agentes multi-paso a través de los endpoints `/v1/chat/completions`, `/v1/messages` (Anthropic) y `/v1/responses`.
- Generación de código, incluyendo modo FIM (fill-in-the-middle) en `/v1/completions`.
- Salida estructurada mediante `response_format` con JSON schema y FSM.
- Recuperación en contexto largo: recall exacto 3/3 en pruebas multi-needle a 16,7K, 100K y 120K tokens.
- Decodificación especulativa con árbol (DFlash2) y muestreo `n > 1` con Copy-on-Write.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional de largo contexto: el modelo mantiene recall exacto 3/3 a 120K tokens, lo que permite resumir o consultar documentos extensos (contratos, expedientes, bases de código) en una sola ventana sin fragmentación.
- Generación de código en producción: el endpoint `/v1/completions` con modo FIM y el tool calling incremental permiten integrarlo en pipelines de CI/CD para autocompletado, revisión de parches y generación de tests.
- Agente autónomo con herramientas: la API compatible con OpenAI y Anthropic SSE, junto con `tool_calls` incrementales, facilita orquestar agentes multi-paso que invocan APIs externas, shells o bases de datos.
- Despliegue en una sola GPU de 96 GB: con 57,27 GiB de VRAM residente en modo `all_vram`, un RTX PRO 6000 puede servir un modelo de 180B con 535 tok/s post-TTFT en lote 8, adecuado para equipos pequeños sin clúster.
- Despliegue en estación de trabajo con RTX 5090: el modo `--force-32gb` con CPU-cold doorbell permite ejecutar el modelo en 32 GB de VRAM más 64 GB de RAM host, útil para prototipado y evaluación local.
- Extracción de datos estructurados: `response_format` con JSON schema y FSM garantiza salidas conformes al esquema, útil para parsing de documentos, clasificación y enriquecimiento de registros.
- Atención al cliente automatizada: el soporte multi-turno con contexto largo y el modo de pensamiento acotado por `thinking_token_budget` permiten conversaciones con historial extenso y control de coste por turno.

## Benchmarks y rendimiento

| Suite / Métrica | BF16 puro | WV-2.96bpw (79,50 GB) | UD-Q2_K_XL (79,58 GB) |
|---|---|---|---|
| All_Val_16384 KLD (↓) | 0,00000 | 0,13178 | 0,13489 |
| All_Val_16384 Top-1 / Top-5 | 100,00% / 100,00% | 90,44% / 99,18% | 89,74% / 99,02% |
| All_Val_16384 PPL (ΔPPL) | 2,9152 | 3,0110 (+0,0958) | 2,8626 (-0,0427) |
| WT2_1024 KLD / Top-1 / Top-5 | 0,00000 (2,3006 PPL) | 0,22731 / 88,00% / 98,73% | 0,24030 / 87,56% / 98,29% |
| WT2_2048 KLD / Top-1 / Top-5 | 0,00000 (2,1556 PPL) | 0,20373 / 89,20% / 98,85% | 0,20982 / 88,78% / 98,56% |
| External_HeldOut KLD / Top-1 / Top-5 | 0,00000 (7,8788 PPL) | 0,10173 / 88,42% / 99,02% | 0,09583 / 87,10% / 98,97% |
| SelfGen_MathCode KLD / Top-1 / Top-5 | 0,00000 (1,9729 PPL) | 0,01792 / 94,92% / 99,98% | 0,02409 / 94,28% / 99,98% |

| Prueba de contexto largo | Resultado |
|---|---|
| Perplejidad QSA 8K (top-2048 vs. denso exacto) | 2,78106 vs. 2,78018 (KLD 6K–8K = 0,02834) |
| Fidelidad QSA 32K (32.768 tokens) | KLD 0,00110 / Top-1 100,00% |
| Recall multi-needle 16,7K / 100K / 120K | 3/3 / 3/3 / 3/3 (100%) |

| Workload / configuración | Resultado observado |
|---|---|
| Tamaño total del checkpoint | 79,50 GB (79.499.755.138 B) |
| VRAM residente en GPU (`all_vram`) | 57,27 GiB (+ 26,82 GiB PLE en host-pinned) |
| Paridad greedy M=1 vs. árbol especulativo | 96/96 (100,0%) |
| B=1 especulativo (temp 0,0 / 0,6 / código directo) | 240,99 / 250,52 / 289,81 tok/s (tau medio 4,12–4,94) |
| B=2 especulativo | 304,82 tok/s sostenido (383,17 tok/s HW bruto, tau 4,31) |
| B=4 especulativo | 443,00 tok/s sostenido (547,85 tok/s HW bruto; 562,64 tok/s código directo) |
| B=8 HTTP SSE en vivo | 534,94 tok/s post-TTFT (507,40 e2e, 0,275 s TTFT; 711,63 tok/s HW bruto, tau 4,77) |

## Requisitos de hardware

- VRAM estimada: 57,27 GiB residentes en GPU en modo `all_vram`; el PLE Q4_0 (26,82 GiB) reside en memoria host pinned.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) para modo todo-VRAM; NVIDIA RTX 5090 (32 GB) con al menos 64 GB de RAM host para modo híbrido `--force-32gb`.
- Requisito de arquitectura: exclusivamente Blackwell `sm_120`; el wheel es SASS-only para `sm_120`, por lo que no funciona en Ampere, Ada ni Hopper.
- Requisitos de software: Linux x86_64, Python 3.13, PyTorch con CUDA 13.0, `transformers` y `safetensors`.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) mediante modo híbrido CPU-cold doorbell.
- Opciones de despliegue: servidor propio `qfn_sm120_unified.serve` (v22.5.0) con endpoints OpenAI SSE/JSON, Anthropic Messages SSE, OpenAI Responses, completions con FIM, `/health` y `/metrics` Prometheus. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 0,275 s y 534,94 tok/s post-TTFT en B=8; 240,99 tok/s en B=1 con temperatura 0,0.
- Caché KV: opción `--kv-mode fp4_e2m1_hybrid` para duplicar la capacidad de KV cache usando FP4 nativo de Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD (All_Val_16384) | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WV-2.96bpw-SM120 (esta ficha) | 180B (MoE) | hasta 120K verificado | 0,13178 | 90,44% | Apache 2.0 | Hugging Face, runtime propio sm_120 |
| UD-Q2_K_XL | 180B (MoE) | no disponible | 0,13489 | 89,74% | Apache 2.0 (heredada) | Hugging Face |
| BF16 puro (Qwen3.8-Flash-Next) | 180B (MoE) | no disponible | 0,00000 | 100,00% | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base presentes en la información proporcionada; no se dispone de datos de benchmarks frente a otros modelos de la categoría.

## Limitaciones y advertencias

- La cuantización a 2,96 bpw introduce degradación medible: KLD de 0,13178 y Top-1 del 90,44% frente a BF16, con ΔPPL de +0,0958 en la suite principal.
- En `External_HeldOut` el KLD es ligeramente superior al de UD-Q2_K_XL (0,10173 vs. 0,09583), aunque el Top-1 es mejor; el rendimiento no domina en todas las métricas.
- Dependencia estricta de hardware Blackwell `sm_120`: el wheel SASS-only no funciona en generaciones anteriores de NVIDIA, lo que limita portabilidad y despliegue en clústeres existentes.
- Requiere Python 3.13 y CUDA 13.0, lo que puede entrar en conflicto con stacks de producción más conservadores.
- El modo `--force-32gb` en RTX 5090 depende de al menos 64 GB de RAM host y del mecanismo CPU-cold doorbell; el rendimiento en ese modo no se detalla en la información disponible.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación inherente al modelo base y potencialmente amplificado por la cuantización agresiva; no se han publicado evaluaciones de sesgo en la información disponible.
- El repo registra 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el wheel de runtime y el drafter DFlash2 son componentes del autor cuya madurez y soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
