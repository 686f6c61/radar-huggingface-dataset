# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20

## Resumen

`Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20` es un checkpoint cuantizado a 3,10 bits por peso del modelo `Qwen/Qwen3.8-Flash-Next` de Qwen, publicado por el usuario Grawnch en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una recompresión agresiva con un pipeline propietario denominado `WV-v5`, orientada a ejecución bare-metal sobre GPUs NVIDIA Blackwell con arquitectura `sm_120`. El objetivo declarado es encajar un modelo de tipo MoE en un presupuesto estático de VRAM inferior a 64 GB (59,83 GB medidos) manteniendo una fidelidad alta respecto al checkpoint original.

La relevancia de esta ficha es acotada pero técnica: demuestra técnicas de cuantización extrema (2 bits nativos en expertos `down_exps`, embeddings en `Q8_0`, `lm_head` en `SWZ8_G32`) combinadas con co-destilación `BF16` por capas y descomposición SVD de rango 8, con el fin de preservar capacidades de razonamiento matemático y código. El autor reporta métricas de paridad KL frente a una cuantización menos agresiva de 3,5 bpw, lo que permite evaluar la pérdida de calidad introducida por el recorte adicional.

El modelo base es un MoE de 48 capas según la model card, con licencia Apache 2.0. La información pública disponible es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin model card del modelo original en la información proporcionada. Todo dato no presente en la documentación del autor se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 48 capas, según model card del checkpoint |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 128K (evaluado a 128K en benchmarks del autor; contexto nativo del base no disponible) |
| Tipos de cuantización | 3,10 bpw; `SWZ2_G64` en `down_exps`; `Q8_0` en `W_emb`; `SWZ8_G32` en `lm_head`; `BF16` en capas co-destiladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (shards; requiere shard 2 de PLE desde otro repo) |

## Arquitectura y entrenamiento

El checkpoint deriva de `Qwen/Qwen3.8-Flash-Next`, un modelo de arquitectura MoE de 48 capas según la documentación del autor. La cuantización `WV-v5` aplica una estrategia de minimax temprano+tardío sobre las capas cuyo índice cumple `l % 4 == 2`, junto con denoising de Hessiano RMT mediante `MP+DG-Flat`. Los expertos `down_exps` se almacenan en formato nativo de 2 bits `SWZ2_G64`, los embeddings `W_emb` en `Q8_0` con zero-copy pinned, y la cabeza de salida `lm_head` se convierte de `Q8_0` a `SWZ8_G32`. Adicionalmente se aplica co-destilación `BF16` con `shexp` y SVD de rango 8 sobre las 48 capas, aceptando 26 de 48 capas `shexp` y 47 expertos SVD validados sobre prosa retenida y conjuntos de matemáticas y código.

No se dispone de información sobre el dataset de entrenamiento original, número de tokens, composición ni si hubo RLHF o DPO en el modelo base. La model card del checkpoint no documenta el proceso de entrenamiento del modelo original, solo el pipeline de compresión. La innovación técnica destacable es la combinación de cuantización extrema por bloques con destilación por capas para compensar la pérdida de precisión, y el uso de shards PLE (probablemente "Paged/Lazy Experts") que se mapean en host sin consumir VRAM de GPU.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-Flash-Next.
- Razonamiento matemático: el autor reporta Pass@1 de 30/30 en `MathArena/aime_2025` a 128K de contexto con decodificación vanilla.
- Generación de código: incluido en los conjuntos de validación de la co-destilación (`math/code`).
- Soporte de contexto largo: evaluado a 128K tokens con paradas naturales en 30/30 casos y sin truncamientos ni bucles de cola.
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repo está vacío.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantización extrema en producción: sirve como referencia para medir la degradación de un MoE de 48 capas al comprimirlo a 3,10 bpw, comparando la KLD reportada (0,001863 frente a 3,5 bpw) con la calidad percibida en tareas reales.
- Despliegue en GPUs Blackwell de 64 GB: el checkpoint está diseñado para caber en una RTX PRO 6000 Blackwell con 59,83 GB de VRAM estática, lo que permite servir un MoE grande en una sola GPU profesional.
- Razonamiento matemático de contexto largo: útil en pipelines que resuelven problemas tipo AIME con contexto de hasta 128K tokens, donde el autor reporta 30/30 paradas naturales y throughput de hasta 1.123 tok/s en ráfaga.
- Generación de código asistida con validación de fidelidad: los conjuntos de validación incluyen código, por lo que puede emplearse en tareas de completado y refactorización donde se requiera comparar contra el modelo original.
- Investigación en técnicas de compresión: el pipeline `WV-v5` (minimax, RMT Hessian, SVD de rango 8, co-destilación) es un caso de estudio para investigadores que trabajen en cuantización post-entrenamiento de MoE.
- Benchmarking de hardware `sm_120`: útil para medir latencia y throughput en GPUs Blackwell con kernels CUDA específicos, con cifras reportadas de 108,68 tok/s a B=1 y 1.171,22 tok/s a B=30 greedy.
- Servicio de inferencia con presupuesto de VRAM fijo: el uso de shards PLE mapeados en host permite ampliar capacidad sin consumir VRAM adicional, útil en entornos con memoria de GPU limitada.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre 1x RTX PRO 6000 Blackwell (`sm_120`):

| Evaluación | Métrica | Resultado |
|---|---|---|
| Gate 3: `MathArena/aime_2025` a 128K (B=30, vanilla) | Pass@1 (AIME I / AIME II) | 30/30 (100,00%; 15/15 + 15/15) |
| Gate 3: salud de completación (737.745 tokens, máx. 110.518) | Paradas naturales / truncamientos / bucles | 30/30 paradas, 0 truncamientos, 0 bucles (media 24.591,5 tok) |
| Gate 3: throughput a 128K | Ráfaga máxima / 10 ráfagas / pico 15 s | 1.123,23 / 879,04 / 843,01 tok/s (media decode 289,87) |
| Gate 1: paridad vs `WV-v5-3.5bpw` (`SelfGen_MathCode_1x2048`) | KLD media / Top-1 / Top-5 / CosSim | 0,001863 / 98,58% / 100,0% / 0,9963 |
| Gate 1: `All_Unique_12282` y QSA disperso 1x8192 | KLD media (All / QSA-8192) / Top-20 | 0,016264 / 0,015009 / 100,0% (diferencia 0,0) |
| `Strata` v1, 5 dominios (4.995 posiciones) | Top-1 (code / all) / KL media / PPL | 98,00% / 95,24% / 0,02224 / 3,938 (ref. 3,920) |
| Gate 2: huella y throughput (256 KV pages) | VRAM estática / B=1 / B=30 greedy / B=30 sampled / DFlash2 | 59,83 GB / 108,68 / 1.171,22 / 969,19 / 208,7 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son mediciones del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: 59,83 GB estáticos medidos en el checkpoint completo; requiere además el shard 2 de PLE desde `Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw`, que se mapea en host sin consumir VRAM de GPU.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (validada por el autor). Cualquier GPU con arquitectura `sm_120` y al menos 64 GB de VRAM.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB). Requiere GPU profesional o de centro de datos con 64 GB o más.
- Opciones de despliegue: el autor menciona kernels CUDA propios y `DFlash2`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible. El formato es GGUF, pero el pipeline de cuantización es específico (`SWZ2_G64`, `SWZ8_G32`), por lo que la compatibilidad con runtimes estándar no está confirmada.
- Latencia y throughput: 108,68 tok/s a B=1, 1.171,22 tok/s a B=30 greedy, 969,19 tok/s a B=30 sampled, 208,7 tok/s con `DFlash2`; ráfaga máxima de 1.123,23 tok/s a 128K de contexto. Cifras del autor, no verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20` (este) | no disponible (MoE, 48 capas) | 128K evaluado | 3,10 bpw, GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| `Qwen3.8-Flash-Next-WV-v5-3.5bpw` (Grawnch) | no disponible (MoE, 48 capas) | no disponible | 3,5 bpw, GGUF | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3.8-Flash-Next` (base) | no disponible | no disponible | BF16 original | Apache 2.0 (según tag) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada. El checkpoint de 3,1 bpw se distingue del de 3,5 bpw por un menor tamaño y una KLD media de 0,001863 frente a este último, según el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar del modelo base Qwen, pueden persistir sesgos de este, pero no se detallan.
- Riesgo de alucinación: no cuantificado; la cuantización a 3,10 bpw puede incrementar la degradación en tareas fuera de los conjuntos de validación del autor (matemáticas, código y prosa retenida).
- Limitaciones de contexto e idioma: el contexto evaluado es 128K, pero no se documenta el contexto nativo del modelo base ni los idiomas soportados; el campo de idiomas del repo está vacío.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `Qwen/Qwen3.8-Flash-Next`, que no se detalla en la información disponible.
- Dependencia de hardware: el checkpoint está compilado para `sm_120` (Blackwell) con kernels CUDA propios; no es portable a arquitecturas anteriores sin recompilación o conversión.
- Dependencia de shard externo: requiere el shard 2 de PLE desde otro repositorio del mismo autor, lo que añade un punto de fallo y una dependencia de disponibilidad.
- Cifras no verificadas: todos los benchmarks y métricas de throughput son reportados por el autor y no han sido replicados de forma independiente; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- Compatibilidad de runtime: no se confirma soporte en vLLM, llama.cpp, Ollama o TGI; el pipeline de cuantización es específico y puede requerir herramientas propias del autor.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20
- Repositorio del shard PLE 2: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
