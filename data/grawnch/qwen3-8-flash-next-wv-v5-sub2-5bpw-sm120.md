# Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120 es una cuantización extrema del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario Grawnch. Se trata de un checkpoint MoE de 180 000 millones de parámetros totales con 48 capas, comprimido a un ancho de bits efectivo de 2,4592 bpw en la parte enrutada (routed MoE), lo que reduce el peso estático en disco a 43,76 GB. El objetivo declarado es encajar el modelo completo en una única GPU de 48 GB (en concreto, una NVIDIA RTX PRO 6000 Blackwell con arquitectura sm_120) manteniendo una calidad cercana al modelo original.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización poco habitual (wave-quant v5 con gaugeo SwiGLU, GPTQ vectorial VQ4, spines SVD y destilación co-optimizada) aplicada a un modelo Mixture-of-Experts de gran tamaño. Por otro, valida empíricamente que un MoE de 180B puede ejecutarse en hardware de estación de trabajo Blackwell con ventanas de contexto de hasta 65K tokens y decodificación especulativa calibrada (DFlash2), con throughputs sostenidos cercanos a 1 000 tok/s en batch 30.

El modelo base es de tipo texto (text-generation y conversational), licencia Apache 2.0, y esta variante hereda esa licencia. No se dispone de información sobre idiomas soportados ni sobre la arquitectura exacta del modelo original más allá de los datos inferidos de la model card (MoE, 48 capas, 512 expertos por capa en la parte gate/up).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas, 512 expertos por capa en gate/up; cuantización wave-quant v5 |
| Parámetros totales | 180 000 millones (180B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65K tokens verificados con KV + DFlash2; 128K evaluados en AIME con QSA indexer; 32K en B=32 |
| Tipos de cuantización | Routed MoE a 2,4592 bpw efectivos (VQ4 GPTQ+BM 2,50 bpw + SWZ2_G64 2,25 bpw + SVD Top-24 Rank-8); lm_head Q8_0→SWZ8_G32; KV cache BF16; DFlash2 SWZ4 calibrado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en 8 shards + globals + índice QSA 128K + DFlash2; pesos embebidos mapeados desde GGUF externo (host-pinned) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE de 180B parámetros y 48 capas. Esta variante no reentrena el modelo: aplica un pipeline de cuantización post-entrenamiento denominado wave-quant v5. El proceso combina varias técnicas. Primero, un gaugeo SwiGLU up/down por neurona que iguala los rangos dinámicos antes de cuantizar, reduciendo el error Hessiano ponderado de gate/up en un 52,6 % a 79,8 % según el autor. Segundo, GPTQ vectorial VQ4 con bloques de 4 y descomposición Cholesky MP+DG-Flat, más un paso de optimización semidefinida Burer-Monteiro de rango 4. Tercero, los down_exps se preservan directamente en formato nativo de 2 bits SWZ2_G64 (2,25 bpw) en el layout de registros de los Tensor Cores sm_120, sin transcodificación, complementado con 24 spines SVD de rango 8 en FP16 por capa (1 152 expertos en total).

El pipeline incluye además una co-destilación de 48 capas en BF16 (40 de 48 capas shexp y 404 expertos SVD de rango 8 aceptados sobre datos held-out de prosa, matemáticas y código), un lm_head Q8_0→SWZ8_G32 calibrado con doble Gram-Schmidt y anti-loop (KLD de 0,000268 frente a BF16), y un indexador QSA de 128K. Los embeddings de token y PLE se mapean desde un GGUF externo mediante `cudaHostRegisterMapped`, sin consumir VRAM. La decodificación especulativa DFlash2 con HybridTree-16 está calibrada y verificada (mean_tau = 5,756).

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline text-generation / conversational.
- Razonamiento matemático de alto nivel: 28/30 en MathArena AIME 2025 Pass@1 con 128K de contexto (93,33 %).
- Generación de código: 90,89 % Top-1 y 2,179 PPL en el dominio code del benchmark Strata.
- Capacidades multilingües: 89,59 % Top-1 en el dominio multilingual de Strata (idiomas concretos no disponibles).
- Razonamiento agéntico: 87,19 % Top-1 y 3,108 PPL en el dominio agent de Strata.
- Decodificación especulativa DFlash2 con HybridTree-16, que eleva el throughput en B=1 a 270,49 tok/s (mean_tau 5,756).
- Soporte de contexto largo: 65K tokens con KV + DFlash2 verificado; 128K evaluado en AIME.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Razonamiento matemático de alto rendimiento en producción: con 28/30 en AIME 2025 a 128K de contexto y throughput sostenido de ~997 tok/s en B=30, el modelo es adecuado para pipelines de verificación matemática, generación de soluciones paso a paso y evaluación automática de problemas competitivos.
- Generación de código en entornos de CI/CD: el 90,89 % Top-1 en el dominio code de Strata y el soporte de contexto de 65K permiten integrar el modelo en revisión de pull requests, generación de tests y reparación de bugs con contexto de repositorio amplio.
- Agentes autónomos multi-paso: el 87,19 % Top-1 en el dominio agent de Strata y la ventana de 65K facilitan tareas de planificación, uso de herramientas y ejecución de flujos con estado persistente.
- Atención al cliente automatizada: conversaciones multi-turno con contexto de hasta 65K tokens, lo que permite mantener historial extenso de cliente sin truncamiento agresivo.
- Procesamiento de documentación técnica multilingüe: 89,59 % Top-1 en el dominio multilingual de Strata, útil para resumen, extracción y traducción asistida de documentación en varios idiomas.
- Despliegue en estación de trabajo Blackwell de 48 GB: al caber en una RTX PRO 6000 con 45,51 GB a 16K KV, permite servir el modelo en local para prototipado, investigación y entornos con requisitos de privacidad de datos.
- Evaluación comparativa de cuantizaciones: los benchmarks incluidos (Gate 1 KLD, Gate 2 throughput, Gate 3 AIME, Strata) permiten reproducir y comparar el impacto de la cuantización a 2,46 bpw frente a alternativas de mayor precisión.

## Benchmarks y rendimiento

| Benchmark / Métrica | Resultado | Notas |
|---|---|---|
| Routed MoE effective bit-width | 2,4592 bpw | VQ4 GPTQ+BM 2,50 bpw + SWZ2_G64 2,25 bpw + SVD Top-24 Rank-8 |
| Tamaño estático en disco | 43,76 GB (40,76 GiB) | 8 shards + globals + índice QSA 128K + DFlash2 SWZ4 |
| VRAM 16K KV / 65K KV + DFlash2 / B=32 32K KV | 45,51 / 46,76 / 48,70 GB | 42,38 / 43,55 / 45,36 GiB; 2 033 664 tokens KV en GPU de 96 GiB |
| Gate 3: AIME 2025 Pass@1 (B=30, 128K) | 28/30 (93,33 %) | AIME I 14/15, AIME II 14/15; 0 loops; 1 212 975 tokens |
| Gate 3: throughput pico / sostenido | 1 193,65 / 1 026,06 / 996,80 tok/s | Burst máximo / rolling 10-burst / 15 s sostenido; 385,80 tok/s en decode de 1,21M tokens |
| Gate 2: B=1 greedy / sampled (k=20) | 142,15 / 141,44 tok/s | 7,035 / 7,070 ms/step; +30,8 % frente a Mode 0 |
| Gate 2: B=30 greedy / sampled (k=20) | 1 306,79 / 1 098,78 tok/s | 22,957 / 27,303 ms/step; paridad Top-20 fused in-CTA exacta |
| Gate 2: B=1 DFlash2 HybridTree-16 | 270,49 tok/s | mean_tau = 5,756; 21,011 ms/round |
| Gate 1: SelfGen_MathCode KLD / 1x8192 Sparse-QSA KLD | 0,05143 / 0,26185 | 93,60 % Top-1 Math/Code, 99,90 % Top-5, +0,043 dPPL; −9,6 % KLD frente a v20.1 Mode 2 |
| Strata 5-domain Yardstick (4 995 pos) | 4,074 PPL (83,44 % Top-1) | code 90,89 % Top-1 / 2,179 PPL; multilingual 89,59 % Top-1; agent 87,19 % Top-1 / 3,108 PPL |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible; los datos anteriores son verificaciones internas del autor sobre una única RTX PRO 6000 Blackwell (sm_120).

## Requisitos de hardware

- VRAM estimada: 45,51 GB con KV de 16K; 46,76 GB con KV de 65K + DFlash2; 48,70 GB con B=32 y KV de 32K. Cabe en GPUs de 48 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (sm_120) es el objetivo verificado. No se confirma compatibilidad con A100, H100 ni otras arquitecturas; los kernels SWZ2_G64 y DFlash2 están compilados para el layout de Tensor Cores sm_120.
- GPU de consumo: no cabe en GPUs consumer típicas (RTX 4090 de 24 GB, RTX 5090 de 32 GB) con este checkpoint; requiere 48 GB o más. El autor menciona una GPU de 96 GiB para 2 033 664 tokens KV.
- Opciones de despliegue: el autor menciona bare-metal sobre sm_120 con kernels propios; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Los pesos de embedding y PLE se cargan desde un GGUF externo (`Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw` `00002-of-00002.gguf`) mediante `cudaHostRegisterMapped`.
- Latencia y throughput: 7,035 ms/step en B=1 greedy (142,15 tok/s); 22,957 ms/step en B=30 greedy (1 306,79 tok/s); 270,49 tok/s en B=1 con DFlash2 HybridTree-16; 996,80 tok/s sostenidos en AIME 128K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120 (esta ficha) | 180B MoE | 65K verificado / 128K evaluado | 2,4592 bpw routed | Apache 2.0 | Hugging Face, 43,8 GB |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw (predecesor) | 180B MoE | no disponible | 3,5 bpw | Apache 2.0 | Hugging Face (referenciado) |
| Qwen3.8-Flash-Next (base) | 180B MoE | no disponible | BF16 | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos con otras cuantizaciones ni con modelos de la competencia en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base referenciadas por el autor.

## Limitaciones y advertencias

- Cuantización agresiva a 2,4592 bpw: aunque el autor reporta KLD bajo (0,05143 en Math/Code), existe degradación frente a BF16 (+0,043 dPPL) y el rendimiento en dominios no evaluados no está verificado.
- Dependencia de hardware específico: los kernels SWZ2_G64 y DFlash2 están compilados para sm_120 (Blackwell). No hay garantía de funcionamiento en A100, H100, RTX 4090 ni otras arquitecturas, y no se documenta un fallback.
- Requiere 48 GB de VRAM como mínimo; no cabe en GPUs consumer de 24 o 32 GB.
- Dependencia de un GGUF externo para embeddings y PLE: el checkpoint no es autocontenido y requiere descargar `Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw` `00002-of-00002.gguf`.
- Idiomas soportados no documentados: el 89,59 % Top-1 en multilingual de Strata no especifica qué idiomas se cubren.
- Sin datos sobre sesgos, alucinación o comportamiento en producción más allá de los benchmarks del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay validación independiente de los resultados.
- Tool calling, function calling y modo thinking no están documentados explícitamente; no asumir su disponibilidad sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero las dependencias de kernels propios y del GGUF externo deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint predecesor 3.5bpw (fuente del GGUF de embeddings y PLE): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Benchmarks incluidos en el repo: `benchmarks/aime25_qfn_wv_v5_sub25_245bpw_pp00_128k_b30_results.json`, `benchmarks/qfn_wv_v5_sub25_gate1_kld_parity.json`, `benchmarks/qfn_wv_v5_sub25_gate2_throughput.json`, `benchmarks/qfn_wv_v5_sub25_strata_5domain_quality.json`, `benchmarks/wv_v5_sub25_build_stats.json`, `benchmarks/wv_v5_sub25_codistill.json`, `benchmarks/wv_v5_shared_basis_audit.json`, `benchmarks/wv_v5_sub25_4layer_ablation.json`
