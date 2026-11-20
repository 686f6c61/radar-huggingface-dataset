# Grawnch/Hy4-Flash-WV-v6.5-2.50bpw-SM120

## Resumen

Hy4-Flash-WV-v6.5-2.50bpw-SM120 es una cuantización de precisión extrema (clase 2.50 bits por peso) del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario Grawnch. El modelo base es un transformer MoE multimodal de 283B parámetros totales, compuesto por 156B de parámetros MoE multimodales no-Engram, 127B en el módulo Engram, 0.85B en un drafter especulativo DFly2 y un codificador visual SigLIP2 ViT. Esta versión comprime el checkpoint BF16 original (~566 GB en disco) hasta 52.80 GB de pesos de backbone + drafter + ViT, con un total de 117.48 GB en disco incluyendo los sidecars Engram en fp8.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 283B parámetros en una única GPU Blackwell de 96 GB (RTX PRO 6000) e incluso en una GPU de consumo de 32 GB (RTX 5090) mediante el flag `--force-32gb`, algo inviable con el checkpoint original. La cuantización emplea una combinación de técnicas: backbone WV-v6.5 con 2.435 bpw ponderado por sensibilidad en las proyecciones MoE enrutadas (MODE3), SWZ8_G32 a 8.50 bpw en proyecciones densas/compartidas, VQ8 intersticial de 4 cosets y GPTQ con Schur posterior.

El modelo se distribuye empaquetado con un servidor propietario `qfn_sm120_unified` v22.5.0 que expone una API compatible con OpenAI y Open-WebUI. Está pensado exclusivamente para GPUs Blackwell con arquitectura SM120 (SASS-only), lo que limita su portabilidad a otras arquitecturas. La licencia es la Tencent Hy License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base: tencent/Hy4-flash) con drafter especulativo DFly2 y ViT SigLIP2 |
| Parametros totales | 283B (156B MoE no-Engram + 127B Engram + 0.85B DFly2 + ViT SigLIP2) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan evaluaciones a 2K, 8K y 20K+ multi-needle; el contexto máximo no se especifica) |
| Tipos de cuantizacion | WV-v6.5 clase 2.50 bpw: backbone 2.435 bpw MODE3 (MoE enrutado), SWZ8_G32 8.50 bpw (densas/compartidas), VQ8 4-Coset Interstitial, GPTQ con Schur posterior; Engram en fp8_exact |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (tencent-hy-license) |
| Formato de pesos | no disponible (empaquetado propietario para `qfn_sm120_unified`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un transformer MoE multimodal con un módulo Engram de 127B parámetros, un codificador visual SigLIP2 y un drafter especulativo DFly2 de 0.85B. Esta publicación no entrena el modelo desde cero, sino que aplica una pipeline de cuantización post-entrenamiento sobre el checkpoint BF16. La innovación técnica principal es la pipeline WV-v6.5, que introduce mejoras respecto a WV-v6.4 mediante siete cambios (DQ-1 a DQ-7): calibración C0 de hy_v4 cuatro veces más amplia (64 x 2.048 muestras), SWZ8_G32 a 8.50 bpw en pesos residuales con co-destilación guardada por norma, asignación por experto `omega_herr` desacoplada en MODE3 para `down_proj >= gate_up`, y perfilado bpw no plano entre capas.

El drafter DFly2 se recalibra en bucle cerrado y comparte la caché KV MLA dispersa del modelo objetivo, sin VRAM adicional para el draft. Según la model card, alcanza paridad exacta de tokens greedy 96/96 y muestreo estocástico de rechazo sin pérdida (0.0 KLD), con un `mean tau = 2.5` y un coseno de bucle cerrado de 0.971771. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal (pipeline `image-text-to-text`).
- Procesamiento de imágenes mediante el codificador SigLIP2 ViT integrado.
- Decodificación especulativa con el drafter DFly2 y árbol híbrido SAM, con paridad greedy 96/96 respecto a `M=1`.
- Modo de razonamiento inline (`<think>`) soportado en el servidor mediante el flag `--inline-think` para Open-WebUI.
- Salida estructurada con JSON Schema FSM (validez 4/4 según la model card).
- Servidor compatible con API OpenAI y Open-WebUI a través de `qfn_sm120_unified`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 283B en una sola GPU de 96 GB: con el servidor `qfn_sm120_unified.serve` sobre una RTX PRO 6000 se obtiene un endpoint compatible con OpenAI sin necesidad de clúster multi-GPU, lo que reduce costes de infraestructura frente al BF16 que requiere 8 GPUs.
- Inferencia en GPU de consumo RTX 5090: con `--force-32gb` el modelo cabe en menos de 32 GiB de VRAM (pico medido de 21.338 GiB) y ofrece 12.76 tok/s a batch 4, adecuado para prototipado local y demos.
- Servicio de chat multimodal con imágenes: al ser un pipeline `image-text-to-text`, puede recibir imágenes y texto y generar respuestas conversacionales, integrable en Open-WebUI.
- Generación con salida estructurada: el soporte de JSON Schema FSM (4/4 de validez) lo hace apto para extracción de datos, rellenado de formularios y respuestas parseables en pipelines automatizados.
- Evaluación de cuantizaciones extremas: sirve como referencia para investigadores que comparan KLD y perplejidad de técnicas de cuantización (WV-v6.0 vs v6.4 vs v6.5) sobre un modelo MoE multimodal de gran escala.
- Razonamiento con contexto largo: la recall multi-needle a 20K+ es 3/3 (100%) y el TTFT cacheado a 8K es de 244.44 ms, lo que permite escenarios de análisis de documentos largos con imágenes.
- Aceleración de inferencia con decodificación especulativa: el drafter DFly2 integrado y el árbol híbrido SAM permiten 56.11 tok/s a B=1 y 228.24 tok/s a B=32 en RTX PRO 6000, útil para servir cargas interactivas.

## Benchmarks y rendimiento

Datos publicados en la model card (comparación con BF16 y con la GGUF oficial IQ2_AH):

| Metrica | BF16 | GGUF IQ2_AH | WV-v6.5 (esta release) |
|---|---|---|---|
| Tamano backbone + drafter + ViT | ~312 GB (8x GPU) | ~134 GB (incl. Engram) | 52.80 GB |
| Tamano total en disco | ~566 GB | ~134 GB | 117.48 GB |
| Blind-Val 2K PPL / KLD vs BF16 | 13.3976 / 0.0000 | no disponible | 10.0273 / 0.39774 |
| Blind-Val 8K PPL / KLD | 34.8908 / 0.0000 | no disponible | 24.8264 / 0.71529 |
| Blind-Val 2K Top-1 | 82.90% (v6.0) | no disponible | 85.418% |
| Blind-Val 8K Top-1 | 71.35% (v6.0) | no disponible | 75.546% |
| Recall multi-needle 20K+ | 3/3 | no disponible | 3/3 (100%) |
| Paridad greedy hybrid-tree vs M=1 | — | — | 96/96 (100.0%) |
| Validez JSON Schema FSM | — | — | 4/4 (100.0%) |
| TTFT SSE (128 / 2048 / 8192 tok, frio) | — | — | 1988.94 / 4264.81 / 13448.12 ms |
| TTFT SSE 8K cacheado | — | — | 244.44 ms |
| TPS especulativo RTX PRO 6000 (B=1 / B=32) | — | — | 56.11 / 228.24 tok/s |
| RTX 5090 `--force-32gb` | OOM | OOM | 12.76 tok/s @ B=4; 4.61 tok/s @ B=1; pico 21.338 GiB |

Progresión interna de la pipeline de cuantización (mismos splits blind-val):

| Metrica | WV-v6.0 | WV-v6.4 | WV-v6.5 |
|---|---|---|---|
| Blind-Val 2K KLD / Top-1 | 0.51604 / 82.90% | 0.48475 / 83.34% | 0.39774 / 85.418% |
| Blind-Val 2K KLD (WT2 / Code / Self-Gen) | 0.7407 / 0.9695 / 0.1770 | 0.6688 / 0.9440 / 0.1631 | 0.50627 / 0.83289 / 0.1259 |
| Blind-Val 8K KLD / Top-1 | 0.98839 / 71.35% | 0.88101 / 72.52% | 0.71529 / 75.546% |
| DFly2 closed-loop cosine | 0.96931 | 0.97358 | 0.971771 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 52.80 GB de pesos de backbone + drafter + ViT; los sidecars Engram en fp8 se sirven vía host-mmap sin consumo de VRAM GPU (0.00 GiB).
- GPU recomendadas: RTX PRO 6000 (96 GB, Blackwell SM120) para ejecución completa; RTX 5090 (32 GB, Blackwell SM120) con `--force-32gb` para ejecución capada.
- Cabe en GPU de consumo: sí, en RTX 5090 con pico medido de 21.338 GiB de VRAM y 12.76 tok/s a B=4.
- Otras arquitecturas: no soportadas; los pesos son SASS-only para `sm_120`, por lo que no funcionan en A100, H100 ni GPUs Ampere/Ada.
- Opciones de despliegue: exclusivamente el servidor propietario `qfn_sm120_unified` v22.5.0 (wheel `cp313-cp313-linux_x86_64`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT SSE de 1988.94 ms (128 tok) / 4264.81 ms (2048 tok) / 13448.12 ms (8192 tok) en frío, y 244.44 ms cacheado a 8K; throughput especulativo de 56.11 tok/s (B=1) y 228.24 tok/s (B=32) en RTX PRO 6000.
- Requisito de software: Python 3.13 y el wheel propietario; no hay soporte para frameworks estándar de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-WV-v6.5-2.50bpw-SM120 (esta ficha) | 283B (MoE + Engram + DFly2 + ViT) | no disponible | 117.48 GB | Tencent Hy License | Hugging Face, solo SM120 |
| tencent/Hy4-flash (BF16) | 283B | no disponible | ~566 GB | Tencent Hy License | Hugging Face, requiere 8 GPUs |
| AngelSlim/Hy4-flash-GGUF (IQ2_AH) | 283B | no disponible | ~134 GB | Tencent Hy License | Hugging Face, formato GGUF |
| WV-v6.0 (2.50 bpw) | 283B | no disponible | 52.51 GB (backbone) | Tencent Hy License | Derivado del mismo autor |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~280B) en la documentación proporcionada.

## Limitaciones y advertencias

- Restricción de hardware severa: los pesos son SASS-only para `sm_120` (Blackwell); no se ejecutan en A100, H100, RTX 4090 ni arquitecturas anteriores. El servidor `qfn_sm120_unified` es propietario y no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Licencia Tencent Hy License: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- Degradación por cuantización: la KLD frente a BF16 es de 0.39774 a 2K y 0.71529 a 8K, con Top-1 de 85.418% y 75.546% respectivamente; no es una réplica exacta del modelo original y puede degradar tareas sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la compresión a 2.50 bpw.
- Idiomas soportados: no especificados; no se puede garantizar un rendimiento multilingüe concreto.
- Sesgos conocidos: no documentados en la información proporcionada.
- Throughput limitado en modo consumo: 4.61 tok/s a B=1 en RTX 5090 con `--force-32gb`, insuficiente para cargas interactivas exigentes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- El repositorio incluye un wheel propietario de terceros; conviene auditar su procedencia antes de ejecutarlo en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-WV-v6.5-2.50bpw-SM120
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantización GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
