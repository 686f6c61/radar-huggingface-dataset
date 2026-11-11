# Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-3.5bpw-SM120 es un checkpoint cuantizado y preempaquetado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch en Hugging Face. Se trata de una variante optimizada especificamente para GPUs NVIDIA con arquitectura Blackwell (sm_120), que combina cuantizacion INT8 con Tensor Cores, compresion Wave-LUT y descomposicion SVD de rango 8 en FP16. El modelo base es un MoE de 180.000 millones de parametros totales con 48 capas hibridas.

El modelo resuelve el problema de desplegar un MoE de gran tamano en una unica GPU consumer o de estacion de trabajo con memoria GDDR7, manteniendo una fidelidad de logits alta respecto al modelo en BF16. Segun la model card, el checkpoint ocupa 66,70 GB de VRAM en modo exacto (3,85 bits por peso efectivos) y puede reducirse a 45,25 GB en modo VQ4-Turbo (2,50 bpw), lo que lo hace viable en una RTX PRO 6000 Blackwell de 96 GB.

La relevancia actual radica en que demuestra tecnicas de cuantizacion nativa para una arquitectura especifica (sm_120), con decodificacion especulativa integrada (N-Gram y DFlash2) que alcanza hasta 564,8 tok/s en tareas de matematicas, CUDA y JSON. Es un artefacto de investigacion e ingenieria de inferencia mas que un modelo de proposito general listo para produccion sin adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), 4-stream mHC Hyper-Connections |
| Parametros totales | 180B (modelo base) |
| Parametros activos | 512 expertos enrutados + 1 experto compartido (numero de activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 Tensor Core (m16n8k32), Wave-LUT SWZ3_G32 / SWZ4_G32, Rank-8 FP16 SVD, Q8-MMA; modos WV-Exact (3,85 bpw) y VQ4-Turbo (2,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8 shards de capas + globals), GGUF (tabla PLE), JSON manifest, PyTorch codebooks |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida de 48 capas que combina 36 capas Gated DeltaNet (un mecanismo de atencion lineal recurrente) con 12 capas de Qwen Sparse Attention (QSA). Es un Mixture of Experts con 512 expertos enrutados mas un experto compartido, e incorpora Hyper-Connections de 4 flujos (mHC). Ademas, incluye una tabla de embeddings N-Gram Per-Layer (PLE) de 28,80 GB en la capa 1, disenada para residir en RAM del host mediante zero-copy PCIe.

El checkpoint de Grawnch no reentrena el modelo: deriva sin perdida (segun el autor) del checkpoint Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw, aplicando un preempaquetado especifico para sm_120. Las innovaciones tecnicas incluyen tensores pre-swizzled para Tensor Cores INT8 de Blackwell, compresion Wave-LUT con grupos de 32, SVD de rango 8 en FP16 para los expertos, y soporte de decodificacion especulativa mediante N-Gram (sin memoria adicional) y DFlash2 (b=8, Tree-16). No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento (`<think>`) evidenciado en las evaluaciones de la model card.
- Generacion de codigo en C++20, Python y kernels CUDA (vectorizacion con `float4`), segun los benchmarks reportados.
- Razonamiento matematico avanzado: la model card menciona una prueba diofantina de AIME y tareas de matematicas en las pruebas de throughput.
- Generacion de JSON estructurado.
- Soporte de decodificacion especulativa con N-Gram y DFlash2 (aceleracion de inferencia, no capacidad del modelo per se).
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision, audio: no disponible.

## Casos de uso

- Inferencia de un MoE de 180B en una unica GPU Blackwell: el checkpoint esta preempaquetado para sm_120 y cabe en 66,70 GB (modo exacto) o 45,25 GB (VQ4-Turbo), lo que permite desplegar el modelo en una RTX PRO 6000 sin necesidad de multiples GPUs.
- Generacion de codigo CUDA de alto rendimiento: los benchmarks reportados incluyen refactorizacion de kernels CUDA con `float4` sosteniendo 405,5 tok/s, lo que lo hace adecuado para asistentes de codigo especializados en GPU programming.
- Razonamiento matematico interactivo: el modo de pensamiento y la estabilidad en contexto de 2K tokens (413,6 tok/s en una prueba diofantina de 1.700 tokens) lo hacen util para tutoria o resolucion asistida de problemas.
- Servicio de generacion JSON estructurado a alta velocidad: con DFlash2 alcanza 412-432 tok/s en tareas JSON, adecuado para pipelines de extraccion de datos o APIs que requieran baja latencia.
- Investigacion en tecnicas de cuantizacion: el repositorio incluye codebooks VQ, manifest de topologia y logs de benchmark, lo que permite reproducir y comparar metodos de compresion (Wave-LUT, SVD, VQ 4D).
- Evaluacion de decodificacion especulativa: los datos de N-Gram y DFlash2 con tasas de aceptacion ($\tau$ = 7,87-8,05 tokens/ronda) sirven como referencia para estudiar aceleracion de inferencia en MoE.
- Despliegue en estaciones de trabajo con una sola GPU para prototipado de agentes o asistentes tecnicos, siempre que se valide la calidad del checkpoint cuantizado en el dominio objetivo.

## Benchmarks y rendimiento

Rendimiento de inferencia en NVIDIA RTX PRO 6000 Blackwell (1,79 TB/s GDDR7), segun la model card:

| Motor / configuracion | VRAM asignada | Modo de especulacion | Decodificacion sostenida (tok/s) | Aceleracion vs llama.cpp |
|---|---|---|---|---|
| llama.cpp (baseline) | ~56 GB | Ninguno (M=1) | ~95 | 1,00x |
| SGLang FP8 oficial (GB300) | ~180 GB | MTP / Eagle | 344-384 | 3,62x-4,04x |
| WV-SM120 modo 0 (WV-Exact) | 66,70 GB | M=1 greedy | 136,4-143,0 | 1,44x-1,51x |
| WV-SM120 modo 0 (WV-Exact) | 66,70 GB | N-Gram (0 MB) | 166,3-184,2 | 1,75x-1,94x |
| WV-SM120 modo 0 (WV-Exact) | 66,70 GB + 1,21 GB DFlash2 | DFlash2 (b=8 / Tree-16) | 412,0-432,1 (Math/CUDA/JSON); 272,1-336,3 (C++20/Py) | 4,34x-4,55x |
| WV-SM120 modo 1 (VQ4-Turbo) | 45,25 GB + 1,21 GB DFlash2 | DFlash2 (b=8 / Tree-16) | 400,5-564,8 (Math/CUDA/JSON); 305,8-324,5 (C++20/Py) | 4,22x-5,95x |

Evaluacion de fidelidad de logits y perplexidad (vocabulario de 248.320 tokens):

| Suite | PPL BF16 | PPL WV-3.5bpw (ΔPPL) | KLD medio | Top-1 coincidente | CosSim final |
|---|---|---|---|---|---|
| Self-Gen Math/Code (`<think>`) | 5,434 | 5,474 (+0,040) | 0,09757 | 88,28% | 0,956945 |
| External Held-Out (2048) | 11,443 | 10,212 (-1,232) | 0,18083 | 84,12% | 0,948237 |
| WikiText-2 (4x2048) | 2,148 | 2,399 (+0,251) | 0,31614 | 85,50% | 0,893036 |

Latencia por paso de CUDAGraph en 48 capas (180B):

| Modo | M=1 | M=2 | M=4 | M=8 | M=12 | M=16 |
|---|---|---|---|---|---|---|
| Modo 0 (3,85 bpw) | 6,380 ms | 7,736 ms | 9,061 ms | 11,181 ms | 12,953 ms | 14,211 ms |
| Modo 1 (2,50 bpw) | 6,224 ms | 7,394 ms | 8,399 ms | 10,040 ms | 11,582 ms | 12,718 ms |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 66,70 GB en modo 0 (WV-Exact, 3,85 bpw efectivos) y 45,25 GB en modo 1 (VQ4-Turbo, 2,50 bpw). El modo 0 requiere ademas 0 GB de VRAM para la tabla PLE (reside en RAM del host via zero-copy); el modo 1 usa los mismos codebooks en memoria compartida de GPU.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB GDDR7, 1,79 TB/s) es la plataforma validada. Se requiere arquitectura sm_120 (Blackwell) por el preempaquetado INT8 Tensor Core m16n8k32 y los formatos SWZ3_G32/SWZ4_G32.
- GPU consumer: no cabe en GPUs consumer convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) por el tamano del checkpoint; se necesita una GPU profesional Blackwell con al menos 48 GB para el modo VQ4-Turbo.
- Opciones de despliegue: el checkpoint esta pensado para un runtime propio de Grawnch con soporte de CUDAGraph, N-Gram y DFlash2; la model card compara contra llama.cpp (baseline) y SGLang (FP8 oficial en GB300). No se documenta soporte directo en vLLM, TGI u Ollama.
- Latencia y throughput: 6,380 ms por paso a M=1 en modo 0; decodificacion de 136,4-143,0 tok/s (greedy) hasta 564,8 tok/s (VQ4-Turbo con DFlash2) en RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-3.5bpw-SM120 | 180B totales (MoE) | no disponible | Apache 2.0 | Hugging Face (Grawnch) | Preempaquetado para sm_120, 66,70 GB VRAM modo 0 |
| Qwen3.8-Flash-Next (base) | 180B totales (MoE) | no disponible | Apache 2.0 | Hugging Face (Qwen) | Pesos originales, sin cuantizar |
| Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw | 180B totales (MoE) | no disponible | Apache 2.0 | Hugging Face (Grawnch) | Checkpoint del que deriva, sin preempaquetado sm_120 |
| SGLang FP8 oficial (referencia de la model card) | 180B totales (MoE) | no disponible | no disponible | no disponible | Requiere ~180 GB VRAM en GB300 |

No se dispone de datos de benchmarks academicos para comparar rendimiento de calidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- El checkpoint esta especializado para GPUs Blackwell sm_120; no es portable a arquitecturas Ampere, Hopper o Ada sin reconversion.
- La cuantizacion introduce degradacion medible: en WikiText-2 la perplexidad sube de 2,148 a 2,399 (+0,251) y el KLD medio es 0,31614, con solo 85,50% de coincidencia Top-1. En dominios fuera de matematicas y codigo la fidelidad puede ser menor.
- El modo VQ4-Turbo (2,50 bpw) reduce aun mas la precision; no se proporcionan metricas de fidelidad para ese modo en la model card.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las limitaciones del modelo base.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint cuantizado ni sobre el cumplimiento de la licencia del modelo base en todas las jurisdicciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados reportados por el autor.
- El despliegue requiere un runtime especifico con soporte de CUDAGraph, N-Gram y DFlash2; no se documenta integracion con frameworks estandar como vLLM, TGI u Ollama.
- La tabla PLE de 28,80 GB requiere RAM del host fijada (pinned) y soporte de `cudaHostRegisterMapped` para el zero-copy PCIe; sin ello el rendimiento puede degradarse.
- No se dispone de informacion sobre tool calling, agentes ni contexto maximo, lo que limita la planificacion de casos de uso en produccion.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint de origen: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
