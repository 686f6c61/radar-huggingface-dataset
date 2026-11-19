# Grawnch/Hy4-Flash-WV-v6-2.50bpw-SM120

## Resumen

Hy4-Flash-WV-v6-2.50bpw-SM120 es una cuantización bare-metal del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario Grawnch. El modelo base es un MoE multimodal de 283B parámetros totales, compuesto por 156B parámetros no-Engram, 127B en módulos Engram, un drafter especulativo DFly2 de 0,85B y un ViT SigLIP2 para la torre de visión. Esta release comprime el checkpoint BF16 de aproximadamente 566 GB hasta 52,51 GB de pesos de backbone, drafter y ViT, con un total en disco de 117,19 GB incluyendo los sidecars Engram en fp8_exact mapeados desde host.

La particularidad técnica de esta versión es que está compilada exclusivamente para `sm_120` (SASS-only), es decir, arquitectura Blackwell consumer y profesional. Incluye un servidor propietario `qfn_sm120_unified` v22.3.0 compatible con la API de OpenAI y Open-WebUI, con soporte de decodificación especulativa mediante árbol híbrido DFly2 + SAM, preservando el chat template oficial con modos `reasoning_effort` y tool calling.

Es relevante porque demuestra que un MoE multimodal de 283B puede ejecutarse en una sola GPU de 96 GB (RTX PRO 6000) e incluso en una RTX 5090 de 32 GB con el flag `--force-32gb`, algo imposible con el checkpoint BF16 original (que requiere 8 GPUs) o con la cuantización GGUF IQ2_AH de AngelSlim (~134 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer disperso) con Engram, drafter especulativo DFly2 y ViT SigLIP2 |
| Parámetros totales | 283B (156B no-Engram + 127B Engram + 0,85B DFly2 + ViT SigLIP2) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (evaluado hasta 16,7K+ en multi-needle; usa IndexPool + SWA-512) |
| Tipos de cuantización | WV-v6 2,50 bpw (routed MoE), Engram en fp8_exact, ViT en BF16 exacto |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (heredada de tencent/Hy4-flash) |
| Formato de pesos | custom (bare-metal SASS-only `sm_120`), no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un MoE multimodal con atención MLA dispersa (sparse MLA), módulos Engram (127B parámetros) y una torre de visión SigLIP2. Esta release no entrena el modelo: cuantiza los pesos a 2,50 bits por peso en las capas MoE enrutadas, mantiene el ViT en BF16 exacto y almacena el Engram en fp8_exact mapeado desde memoria host (0 GiB de VRAM dedicada). El drafter especulativo DFly2 (0,85B) ha sido recalibrado en bucle cerrado para compartir la caché KV MLA dispersa del modelo objetivo, sin VRAM adicional de KV para el draft.

La innovación principal es el árbol especulativo híbrido DFly2 + SAM, que alcanza paridad exacta de 96/96 tokens greedy frente a la decodificación M=1 y rechazo estocástico sin pérdida (0,0 KLD, tau medio 2,5). El paquete incluye el servidor `qfn_sm120_unified` v22.3.0 con validación JSON Schema por FSM en GPU (4/4 válidos), streaming SSE de `<think:opensource>` y soporte de `reasoning_effort` con valores `high`, `max` y `no_think`. No hay información sobre el dataset de entrenamiento del modelo base ni sobre fases de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking controlable (`high`, `max`, `no_think`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante ViT SigLIP2 en BF16 exacto.
- Tool calling con `<tool_calls:opensource>` y casting de tipos según JSON Schema.
- Salida estructurada validada por FSM en GPU (4/4 esquemas JSON válidos).
- Streaming de razonamiento inline (`delta.reasoning_content` o `--inline-think`).
- Decodificación especulativa con paridad exacta greedy (96/96) y muestreo estocástico sin pérdida.
- Recuperación multi-needle exacta en contexto largo (3/3 a 16,7K+ tokens).
- Compatibilidad con API OpenAI y Open-WebUI mediante el servidor propietario.

## Casos de uso

- Despliegue de un MoE multimodal de 283B en una única GPU de 96 GB: con una RTX PRO 6000 se sirve el modelo completo sin sharding, lo que simplifica la infraestructura frente a las 8 GPUs necesarias para el BF16.
- Prototipado en estación de trabajo con RTX 5090: el flag `--force-32gb` permite ejecutar el modelo en menos de 32 GiB de VRAM (pico de 24,547 GiB) a 18,08 tok/s con batch 4, adecuado para pruebas y demos locales.
- Asistentes con razonamiento visible: el streaming de `<think:opensource>` y los modos `reasoning_effort` permiten construir interfaces que muestran el razonamiento paso a paso, útil en herramientas educativas o de depuración.
- Agentes con tool calling: la integración de `<tool_calls:opensource>` con JSON Schema y FSM en GPU facilita pipelines de agentes que necesitan salidas estructuradas fiables.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` con ViT BF16 permite tareas de OCR, descripción de figuras y QA sobre documentos escaneados.
- Servicio compatible con OpenAI para integrar en aplicaciones existentes: el servidor `qfn_sm120_unified` expone endpoints OpenAI, por lo que herramientas como Open-WebUI o clientes estándar funcionan sin adaptadores.
- Evaluación de cuantizaciones extremas: útil para investigadores que comparan PPL y KLD frente al BF16 (11,8598 vs 13,3976 en 2K; 36,4476 vs 34,8908 en 8K) en regímenes de 2,50 bpw.

## Benchmarks y rendimiento

| Métrica | tencent/Hy4-flash (BF16) | AngelSlim IQ2_AH | Esta release (WV-v6 2,50 bpw) |
|---|---|---|---|
| Tamaño backbone + drafter + ViT | ~312 GB (8 GPU) | ~134 GB (incl. Engram) | 52,51 GB (1× 96 GB o RTX 5090) |
| Tamaño total en disco | ~566 GB | ~134 GB | 117,19 GB (0 GiB VRAM Engram) |
| PPL / KLD blind-val 2K | 13,3976 / 0,0000 | no disponible | 11,8598 (−1,5377) / 0,51604 |
| PPL / KLD blind-val 8K | 34,8908 / 0,0000 | no disponible | 36,4476 (+1,5568) / 0,98839 |
| Multi-needle exacto 16,7K+ | 3/3 | no disponible | 3/3 (100 %) |
| Paridad greedy árbol híbrido vs M=1 | no disponible | no disponible | 96/96 (100 %) |
| Validez FSM JSON Schema en GPU | no disponible | no disponible | 4/4 (100 %) |
| TTFT SSE (128 / 2048 / 8192 tok, frío) | no disponible | no disponible | 697,5 / 4133,66 / 13060,24 ms |
| TTFT SSE cacheado 8K | no disponible | no disponible | 249,45 ms |
| Throughput especulativo RTX PRO 6000 | no disponible | no disponible | 55,94 tok/s (B=1) / 229,54 tok/s (B=32) |
| RTX 5090 `--force-32gb` | OOM | OOM | 18,08 tok/s (B=4), 6,43 tok/s (B=1) |

## Requisitos de hardware

- VRAM para inferencia: 52,51 GB de pesos en GPU más overhead del servidor; el Engram reside en host mmap (0 GiB VRAM). En RTX 5090 con `--force-32gb` el pico medido es de 24,547 GiB.
- GPU recomendadas: RTX PRO 6000 (96 GB, Blackwell `sm_120`) para el modo completo; RTX 5090 (32 GB, Blackwell `sm_120`) para el modo `--force-32gb`.
- No es compatible con GPUs no Blackwell: los pesos son SASS-only para `sm_120`, por lo que A100, H100 o RTX 4090 no pueden ejecutarlos.
- Despliegue: exclusivamente mediante el wheel `qfn_sm120_unified-22.3.0-cp313-cp313-linux_x86_64.whl` (Python 3.13, Linux x86_64) y el comando `python -m qfn_sm120_unified.serve`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT frío de 697,5 ms a 128 tokens y 13,06 s a 8192 tokens; cacheado 8K en 249,45 ms. Throughput especulativo de 55,94 tok/s (B=1) y 229,54 tok/s (B=32) en RTX PRO 6000; 6,43 tok/s (B=1) y 18,08 tok/s (B=4) en RTX 5090 con límite de 32 GiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño desplegable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-WV-v6-2.50bpw-SM120 (esta release) | 283B (MoE) | no disponible (evaluado 16,7K+) | 52,51 GB GPU + Engram host | Tencent Hy License | Hugging Face, solo Blackwell `sm_120` |
| tencent/Hy4-flash (BF16) | 283B (MoE) | no disponible | ~312 GB en GPU (8× GPU) | Tencent Hy License | Hugging Face |
| AngelSlim/Hy4-flash-GGUF (IQ2_AH) | 283B (MoE) | no disponible | ~134 GB | Tencent Hy License | Hugging Face, GGUF estándar |

No se dispone de datos de benchmarks de modelos de la competencia (por ejemplo, otros MoE multimodales de escala similar) en la información proporcionada.

## Limitaciones y advertencias

- Exclusividad de hardware: los pesos son SASS-only para `sm_120`; no funcionan en A100, H100, RTX 4090 ni GPUs AMD. Esto limita drásticamente el despliegue en infraestructura cloud convencional.
- Servidor propietario: la inferencia depende del wheel `qfn_sm120_unified`, de código no abierto según la model card ("source-free"), lo que impide auditoría, modificación o integración con stacks estándar (vLLM, TGI, llama.cpp).
- Degradación en contexto largo: la PPL a 8K sube de 34,8908 (BF16) a 36,4476 (+1,5568) y el KLD alcanza 0,98839, frente a 0,51604 en 2K. El rendimiento se degrada con la longitud de contexto.
- Cuantización agresiva a 2,50 bpw: aunque la PPL a 2K mejora frente al BF16 en la evaluación blind-val, la cuantización extrema puede afectar a tareas sensibles no cubiertas por los benchmarks publicados.
- Licencia Tencent Hy License: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el archivo LICENSE antes de un despliegue en producción.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe en la model card.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad ni de sesgos para esta cuantización.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Fecha de creación futura (2026-11-19) en los metadatos de Hugging Face; conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-WV-v6-2.50bpw-SM120
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantización GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Licencia: LICENSE (incluida en el repositorio, Tencent Hy License)
