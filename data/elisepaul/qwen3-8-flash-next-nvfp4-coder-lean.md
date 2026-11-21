# elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean

## Resumen

Qwen3.8-Flash-Next-NVFP4-Coder-Lean es una derivación podada a nivel arquitectónico del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4`, publicada por el usuario elisepaul. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 131.744.657.299 parámetros totales según los pesos en safetensors, del cual se conservan intactos el enrutamiento completo (10 expertos enrutados + 1 compartido por token) y la capacidad de razonamiento del modelo fundacional, pero se eliminan las proyecciones multimodales y el shard auxiliar de embeddings PLE de 51,2 GB.

El objetivo del autor es permitir el despliegue en un único nodo NVIDIA DGX Spark (GB10, 128 GiB de memoria unificada LPDDR5x) sin recurrir a swap del sistema operativo. Para ello reduce la huella cargada de 123,5 GiB a 74,91 GiB, restaura las 744 capas densas en MXFP8 nativo y mantiene residente el proponedor MTP (Multi-Token Prediction) para decodificación especulativa. El resultado declarado son velocidades de 24,4-36,0 tok/s en un solo stream y hasta 202,3 tok/s agregados con 8 streams concurrentes.

Es relevante ahora porque demuestra una receta de serving de producción para hardware Blackwell de un solo nodo con memoria unificada, un escenario donde los checkpoints MoE de gran tamaño suelen provocar paginación de memoria virtual y degradar la generación. La licencia es la NVIDIA Open Model License, y el modelo está pensado específicamente para generación de código y flujos de agentes de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida GDN (Gated Delta Net) lineal + atención completa; decodificación especulativa MTP |
| Parametros totales | 131.744.657.299 |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (el modelo base se describe como 119,6B MoE con 512 micro-expertos enrutados, 10 enrutados por token) |
| Longitud de contexto | Hasta 262k-1M tokens de KV cache según memoria libre (22-32 GiB de headroom); no se especifica la ventana máxima oficial del modelo base |
| Tipos de cuantizacion | NVFP4 (W4A16_NVFP4) en capas MoE; MXFP8 (`float8_e4m3fn`) en 744 capas lineales densas; MTP en NVFP4; tags adicionales: FP4, FP8, MXFP8 |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (11 shards, 74,91 GiB); librería vLLM |

## Arquitectura y entrenamiento

El modelo es una poda del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4`, que se distribuye como release multimodal unificado con proyecciones de visión y un shard PLE (N-gram Prediction Layer Embedding) sin comprimir de 51,2 GB. Coder-Lean elimina esas dos partes para quedarse con un alcance puramente texto/código, pero preserva el enrutamiento MoE completo (10 expertos enrutados + 1 compartido por token), de modo que según el autor mantiene paridad bit-exacta con los pesos fundacionales de lenguaje. La arquitectura combina atención lineal GDN (Gated Delta Net) con atención completa, lo que permite cachés KV de gran tamaño con coste reducido.

La innovación técnica principal es la compresión selectiva: las capas MoE se mantienen en NVFP4 (W4A16_NVFP4, con group scaling vía kernel CUTLASS de FlashInfer), mientras que las 744 capas lineales densas (`linear_attn`, `self_attn`, `shared_expert`) se restauran en MXFP8 nativo, lo que reduce las lecturas de bus de memoria densas de 7,5 GB/token a ~2,6 GB/token. Además se injertan 4.637 tensores MTP (1,60 GB en NVFP4) como proponedor especulativo residente en memoria, con tasas de aceptación declaradas del 97,5 % en contexto largo y 99,1 % en appends de 32k. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO; el único dataset citado es `princeton-nlp/SWE-bench_Lite`, empleado como referencia de evaluación.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a code generation y flujos de desarrollo.
- Razonamiento y resolución de problemas de ingeniería de software, evaluado sobre SWE-bench Lite según los tags del repositorio.
- Soporte de agentes y razonamiento multi-paso (tag `agent`).
- Decodificación especulativa con MTP integrado, que acelera la generación en 2,6x-3,9x según el autor.
- Capacidad multilingüe limitada a inglés, chino y código.
- Atención lineal híbrida GDN que permite contextos de 262k-1M tokens en función de la memoria disponible.
- Soporte de prefix caching con una tasa de acierto declarada del 92,5 % en appends.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documentan capacidades de visión ni audio en esta derivación (fueron podadas del modelo base).

## Casos de uso

- Serving de código en un único DGX Spark: el modelo cabe residente en 74,91 GiB sobre 128 GiB de memoria unificada, lo que permite desplegar un MoE de más de 130B parámetros en un nodo de escritorio sin swap y con 22-32 GiB libres para KV cache.
- Asistente de repositorio con contexto largo: gracias a la atención lineal GDN y a los 262k-1M tokens de KV cache posibles, se puede indexar y navegar un repositorio completo en una sola conversación, con una tasa de aceptación de draft del 97,5 % en contexto largo.
- Agentes de resolución de issues: el modelo está evaluado sobre SWE-bench Lite y etiquetado como agente, por lo que encaja en pipelines que reciben un issue, exploran el código y proponen un parche multi-paso.
- Generación de código en producción con vLLM: la integración nativa con vLLM, FlashInfer CUTLASS y ModelOpt permite servir el modelo con prefix caching (92,5 % de acierto) y decodificación especulativa para reducir latencia en autocompletado.
- Servicio multi-usuario en un solo nodo: con 4-8 streams concurrentes el throughput agregado escala hasta 202,31 tok/s, adecuado para un equipo pequeño de desarrolladores compartiendo una instancia.
- Evaluación e investigación de cuantización FP4/FP8: el checkpoint sirve como referencia práctica de cómo combinar NVFP4 en MoE con MXFP8 en capas densas sobre Blackwell (sm_121), útil para estudiar compromisos de precisión y rendimiento.
- Prototipado de asistentes de código en chino e inglés: al soportar ambos idiomas más código, puede emplearse en equipos bilingües sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible. Los únicos datos numéricos publicados son métricas de runtime medidas por el autor:

| Metrica | Valor declarado |
|---|---|
| Decodificación single-stream, contexto corto (~80 tokens de código) | 25,25 tok/s (2,64x vs AR puro) |
| Decodificación single-stream, contexto 32k | 36,01 tok/s (3,88x vs AR puro) |
| Throughput agregado 2 streams, contexto corto | 57,90 tok/s (28,95 tok/s por stream) |
| Throughput agregado 2 streams, contexto 32k | 70,19 tok/s (35,09 tok/s por stream) |
| Throughput agregado 4-8 streams | 83,63-202,31 tok/s |
| Tasa de aceptación de draft MTP (contexto largo) | 97,5 % |
| Tasa de aceptación de draft MTP (32k) | 99,1 % |
| Prefix cache append hit rate | 92,5 % (`--max-num-batched-tokens 1024`) |
| Latencia de append con prefix cache | 1,09 s |

## Requisitos de hardware

- VRAM/memoria estimada: 74,91 GiB residentes para los pesos; 22-32 GiB adicionales para KV cache según contexto.
- Plataforma objetivo: 1x NVIDIA DGX Spark (Blackwell GB10, compute capability sm_121), 128 GiB de memoria unificada LPDDR5x (~121,6 GiB usables), ancho de banda teórico ~273 GB/s.
- Swap: estrictamente 0 bytes (`swapoff -a`); el autor lo marca como requisito.
- GPU recomendadas: DGX Spark / GB10. No se documenta compatibilidad con A100, H100 ni RTX 4090; el modelo usa kernels NVFP4 y MXFP8 específicos de Blackwell.
- ¿Cabe en GPU consumer? No hay datos para RTX 4090 u otras consumer; el tamaño de pesos (74,91 GiB) excede la VRAM de cualquier GPU consumer actual.
- Despliegue: vLLM exclusivamente, con contenedor `vllm-node:latest` o `eugr/spark-vllm-b12x-coderlean:latest`, CUDA 13.0, PyTorch 2.9+ y backend FlashInfer CUTLASS NVFP4 MoE (`FLASHINFER_CUTLASS`).
- Latencia y throughput: ver tabla de benchmarks; 25,25-36,01 tok/s single-stream y hasta 202,31 tok/s agregados con 8 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean | 131,7B totales, 10+1 expertos activos | 262k-1M (según KV) | nvidia-open-model-license | Hugging Face, vLLM | Podado para DGX Spark, sin visión ni PLE |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (base) | 119,6B MoE, 512 micro-expertos, 10 enrutados | No disponible | nvidia-open-model-license | Hugging Face | Multimodal completo, ~123,5 GiB cargados, requiere más memoria |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo es una poda no oficial del checkpoint de NVIDIA; no está publicado por NVIDIA y su comportamiento puede diferir del original.
- Se han eliminado las capacidades multimodales (visión) y el shard PLE, por lo que no debe esperarse paridad total con el modelo base en tareas que dependan de esas componentes.
- El autor afirma paridad bit-exacta solo en los pesos de lenguaje fundacionales; no hay validación independiente de calidad publicada.
- Los benchmarks de calidad (SWE-bench, HumanEval, etc.) no se han publicado; solo hay métricas de throughput y latencia.
- Licencia NVIDIA Open Model License: conviene revisar sus términos antes de uso comercial, ya que las restricciones específicas no se detallan en la información disponible.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; aplican los riesgos habituales de un modelo de código de gran tamaño.
- Dependencia fuerte de hardware: requiere Blackwell (sm_121), CUDA 13.0, PyTorch 2.9+, FlashInfer CUTLASS y vLLM; no es portable a otras pilas sin trabajo adicional.
- Requiere swap desactivado y memoria unificada de 128 GiB; en configuraciones menores puede haber paginación y degradación severa.
- Idiomas limitados a inglés, chino y código; el rendimiento en castellano no está documentado.
- El repositorio tiene 835 descargas y 1 like en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Dataset de evaluación: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Paper referenciado (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Contenedor vLLM para DGX Spark: `eugr/spark-vllm-b12x-coderlean:latest` (Docker Hub, no verificado en la búsqueda)
- Repositorio vLLM: https://github.com/vllm-project/vllm
- FlashInfer: https://github.com/flashinfer-ai/flashinfer
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
