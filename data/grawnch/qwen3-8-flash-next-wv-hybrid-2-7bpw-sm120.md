# Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch en Hugging Face. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de 180B parámetros totales con 48 capas híbridas: 36 capas Gated DeltaNet (GDN) y 12 capas Qwen Sparse Attention (QSA). Este checkpoint concreto aplica una cuantización híbrida submodular que reduce el peso efectivo a 2,69 bits por peso (bpw), con expertos "calientes" en 3,5 bpw INT8 y expertos "fríos" en 2,50 bpw mediante VQ4.

El checkpoint está pre-transcodificado para GPUs Blackwell con arquitectura sm_120, de modo que la carga en VRAM no requiere transcodificación en tiempo de ejecución (0,0 s de carga). La selección de expertos calientes y fríos se realizó mediante minimización empírica de KL ponderada por activación submodular, con una KL forward de 0,001782 respecto al modo lossless y un 97,39% de coincidencia Top-1. El resultado es una reducción de 16,64 GB de VRAM frente al modo 0 (3,5 bpw), lo que permite lotes de 40 a 48 en una única RTX PRO 6000.

El modelo está pensado para despliegues de inferencia de alto rendimiento en hardware Blackwell, con soporte de decodificación especulativa y atención dispersa Top-2048 sobre contexto de 80K. La licencia es Apache 2.0, heredada del modelo base. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA); 4-stream mHC Hyper-Connections |
| Parametros totales | 180B |
| Parametros activos | 512 expertos enrutados + 1 experto compartido por capa (número de activos no disponible) |
| Longitud de contexto | 80K (atención dispersa Top-2048 en capas QSA) |
| Tipos de cuantizacion | Híbrida submodular: 96 expertos calientes en Mode 0 (SWZ3_G32, 3,5 bpw INT8 Tensor Core) + 416 expertos fríos en Mode 2 (VQ4 4D Wave-Lattice, 2,50 bpw); efectivo 2,69 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards pre-transcodificados sm_120) + GGUF (tabla PLE en host) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina 36 capas Gated DeltaNet (un tipo de atención lineal/SSM) con 12 capas de Qwen Sparse Attention (QSA) con indexación Top-2048 sobre un contexto de 80K. Cada capa MoE contiene 512 expertos enrutados más 1 experto compartido, y el modelo incorpora 4-stream mHC Hyper-Connections. Además, incluye una tabla N-Gram Per-Layer Embedding (PLE) de 28,80 GB en la capa 1, que en este checkpoint se almacena en RAM del host con zero-copy PCIe gather (cudaHostRegisterMapped), sin ocupar VRAM.

Este checkpoint no entrena el modelo: es una cuantización post-entrenamiento. La innovación técnica principal es la selección submodular de expertos calientes y fríos por capa, optimizando la minimización de KL ponderada por activación. Cada capa retiene 96 expertos calientes (que concentran el 70-75% de la masa de probabilidad enrutada en matemáticas, código y JSON estructurado) en formato SWZ3_G32 de 3,5 bpw, mientras que los 416 expertos fríos se comprimen a 2,50 bpw con codebooks VQ4 de 256×4. El checkpoint está pre-transcodificado para sm_120, eliminando la transcodificación en carga, e incluye decodificación especulativa con horizonte k configurable y poda de router (min_w = 0,015). No se dispone de información sobre el número de tokens de entrenamiento ni sobre si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento (`<think>`) verificado en los benchmarks de AIME 2025.
- Razonamiento matemático: el checkpoint hermano de 3,5 bpw reporta 23/30 en AIME 2025 con contexto de 64K y 14/15 en AIME II.
- Generación de código, incluyendo código CUDA para sm_120 (workload `cuda_sm120_code` en los benchmarks).
- Generación de JSON estructurado de alto rendimiento (workload `structured_json` con hasta 2.974 tok/s).
- Decodificación especulativa con horizonte k y poda de router configurables.
- Atención dispersa Top-2048 sobre contexto de 80K mediante el indexador QSA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo de pensamiento y el razonamiento multi-paso están verificados en benchmarks.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de JSON estructurado a gran escala: el checkpoint alcanza 2.974 tok/s con lote 48 en RTX PRO 6000, adecuado para pipelines de extracción de datos y APIs que devuelven JSON validado, gracias a que los 96 expertos calientes retienen el 70-75% de la masa de probabilidad en este dominio.
- Razonamiento matemático en producción: con 2.445 tok/s en AIME 2025 (lote 40) y modo de pensamiento, sirve para motores de resolución de problemas matemáticos o tutoría automatizada donde se requiere cadena de razonamiento verificable.
- Generación de código CUDA para Blackwell: el workload `cuda_sm120_code` a 1.916 tok/s (lote 48) permite integrar el modelo en asistentes de código especializados en kernels para sm_120.
- Servicio de inferencia de alto throughput en una sola GPU: con 50,06 GB de VRAM y lotes de 40-48 en una RTX PRO 6000, es viable para servir múltiples usuarios concurrentes en un único nodo sin paralelismo de tensor.
- Despliegue con contexto largo: la atención dispersa Top-2048 sobre 80K permite procesar documentos extensos o conversaciones multi-turno largas manteniendo el rendimiento, con la tabla PLE en RAM del host para no consumir VRAM.
- Investigación en cuantización extrema: la selección submodular de expertos y los codebooks VQ4 documentados (KL 0,001782, 97,39% Top-1) sirven como referencia para estudiar el impacto de la cuantización selectiva en MoE.
- Evaluación comparativa de formatos: la familia incluye variantes GGUF estándar para llama.cpp y contenedores WV, lo que permite comparar latencia y calidad entre backends en el mismo hardware.

## Benchmarks y rendimiento

Los datos disponibles son de throughput en 1× NVIDIA RTX PRO 6000 Blackwell (101,97 GB GDDR7, 1,79 TB/s), no de benchmarks de calidad estándar.

| Workload | Lote (B) | Horizonte (k) | Throughput verificado (tok/s) | Estricto capado (tok/s) | τ medio |
|---|---|---|---|---|---|
| structured_json (pico hardware) | 48 | 8 | 2.974,38 | 1.916,24 | 4,54 |
| structured_json (pico estricto) | 40 | 6 | 2.796,61 | 2.535,42 | 3,97 |
| aime2025_math (pico hardware) | 40 | 6 | 2.445,65 | 1.636,69 | 3,67 |
| aime2025_math (pico estricto) | 32 | 6 | 2.223,81 | 1.932,33 | 3,99 |
| cuda_sm120_code (pico hardware) | 48 | 6 | 1.916,22 | 1.304,93 | 3,15 |
| cuda_sm120_code (pico estricto) | 40 | 6 | 1.860,45 | 1.636,87 | 3,17 |
| B = 1 single-stream (aime2025_math) | 1 | 8 | 428,86 | 428,86 | 4,19 |

Calidad de la cuantización: KL forward de 0,001782 frente al modo 0, 97,39% de coincidencia Top-1 y coseno de logits de 0,999907. El checkpoint hermano de 3,5 bpw reporta 23/30 en AIME 2025 con 64K de contexto (76,67%) y 14/15 en AIME II. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 50,06 GB en el checkpoint híbrido de 2,69 bpw (frente a 66,70 GB del modo 0 de 3,5 bpw y 55,12 GB del GGUF WV de 3,5 bpw).
- RAM del host: 28,80 GB para la tabla PLE en zero-copy (0 GB de VRAM); en las variantes GGUF se usa mmap.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (sm_120, 101,97 GB GDDR7). El checkpoint está pre-transcodificado exclusivamente para sm_120, por lo que requiere arquitectura Blackwell.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) por el tamaño del checkpoint; no se dispone de información sobre variantes que quepan en consumer.
- Opciones de despliegue: safetensors pre-transcodizados sm_120 con manifiesto `sm120_manifest.json`; la familia incluye GGUF estándar para llama.cpp (Q3_K/Q4_0/Q2_0/Q6_K) y contenedor WV no lineal. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput: 2.974,38 tok/s en structured_json (B=48) y 428,86 tok/s en single-stream (B=1) en RTX PRO 6000. Latencia no disponible.

## Comparativa con modelos similares

| Modelo | Formato / bpw | VRAM | RAM host | Throughput pico | Licencia |
|---|---|---|---|---|---|
| WV-Hybrid-2.7bpw-SM120 (este) | Mode 2 híbrido sm_120, 2,69 bpw | 50,06 GB | 28,80 GB | 2.974,38 tok/s | Apache 2.0 |
| WV-3.5bpw-SM120 | Mode 0 sm_120, 3,5 bpw | 66,70 GB | 28,80 GB | 2.676,97 tok/s | Apache 2.0 |
| WV-3.5bpw | GGUF WV no lineal, 3,5 bpw | 55,12 GB | 28,80 GB (mmap) | no disponible | Apache 2.0 |
| 3.5bpw-GGUF | GGUF estándar llama.cpp, 3,5 bpw | 55,05 GB | 28,80 GB (mmap) | no disponible | Apache 2.0 |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Exclusivo de hardware Blackwell (sm_120): el checkpoint pre-transcodizado no es portable a GPUs Ampere, Ada o Hopper sin usar las variantes GGUF de la familia.
- La cuantización submodular introduce una desviación medible: KL forward de 0,001782 y 97,39% de coincidencia Top-1, lo que implica que aproximadamente un 2,6% de las predicciones Top-1 difieren del modo lossless.
- El rendimiento reportado se ha medido exclusivamente en 1× RTX PRO 6000 Blackwell; no hay datos de latencia ni throughput en otros hardware.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o verificados.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen/Qwen3.8-Flash-Next por si impone restricciones adicionales.
- El checkpoint requiere componentes auxiliares específicos (`v16_submodular_tier_maps_h96.pt`, `vq4_codebooks.pt`, `qsa_indexer.safetensors`) cuyo manejo incorrecto puede degradar la calidad o impedir la carga.
- Los benchmarks de calidad (AIME) citados corresponden al checkpoint hermano de 3,5 bpw, no a este de 2,69 bpw; no hay resultados de calidad publicados para este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante WV-3.5bpw-SM120: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120
- Variante WV-3.5bpw (GGUF): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Variante 3.5bpw-GGUF: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-3.5bpw-GGUF
