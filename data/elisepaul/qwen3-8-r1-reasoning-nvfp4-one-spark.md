# elisepaul/Qwen3.8-R1-Reasoning-NVFP4-One-Spark

## Resumen

Qwen3.8-R1-Reasoning-NVFP4-One-Spark es un modelo fundacional de tipo Mixture-of-Experts (MoE) heterogéneo publicado por elisepaul en Hugging Face. Se trata de un ensamblaje experimental que combina la arquitectura de un modelo orientado a código (Qwen3.8-Flash-Next-NVFP4-Coder-Lean) con expertos de razonamiento algorítmico extraídos de DeepSeek-V4.1-Flash, todo ello empaquetado en cuantización NVFP4 nativa de hardware y optimizado para ejecutarse en una única unidad NVIDIA DGX Spark (GB10 Blackwell).

El modelo cuenta con 131.711.817.584 parámetros totales según los safetensors del repositorio, distribuidos en 40 capas MoE con 512 slots de expertos enrutados por capa (448 heredados del modelo base de código y 64 trasplantados desde DeepSeek) más 8 capas densas. Incorpora una cabeza de decodificación especulativa Multi-Token Prediction (MTP) de 4 tokens. El repositorio ocupa 83,4 GB y utiliza 11 shards safetensors activos.

Su relevancia radica en dos aspectos: por un lado, demuestra una técnica de fusión de modelos entre linajes arquitectónicos distintos mediante alineamiento de representaciones con Procrustes ortogonal y escalado de atenuación geométrica; por otro, es un ejemplo de despliegue de un MoE de gran tamaño en hardware de memoria unificada de consumo profesional (DGX Spark), con un footprint en disco de 77,65 GiB y 76,12 GiB residentes en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) heterogéneo, transformer con 40 capas MoE + 8 capas densas, cabeza MTP especulativa |
| Parametros totales | 131.711.817.584 |
| Parametros activos | no disponible (512 expertos enrutados por capa, número de expertos activos por token no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 FP4 con escalas de bloque FP8 de 16 elementos), MXFP8, FP8, BF16 en componentes no cuantizados |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como "other") |
| Formato de pesos | safetensors (11 shards activos, 300.982 tensores indexados) |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo base Qwen3.8-Flash-Next-NVFP4-Coder-Lean con 448 expertos enrutados de código por capa (d_model = 2560, d_inter = 640), un núcleo denso de 8 capas superiores, un experto compartido de backbone y residuales con HyperConnections de 4 flujos. Sobre esta topología se trasplantaron 64 expertos de razonamiento de DeepSeek-V4.1-Flash (d_model = 5120, d_int = 2304) por capa, seleccionados mediante Router-weighted Expert Activation Pruning (REAP) sobre 403 tareas de código, terminal y verificación algorítmica. El resultado son 512 slots de expertos enrutados por capa en las 40 capas MoE.

La innovación técnica principal es la resolución de la divergencia de bases de coordenadas entre linajes mediante alineamiento de representaciones con Procrustes ortogonal y escalado de atenuación geométrica para evitar el desbordamiento de ganancia residual. El modelo incorpora además una cabeza de decodificación especulativa Multi-Token Prediction (MTP) de 4 tokens (4.637 tensores en `mtp-graft.safetensors`) y un núcleo denso MXFP8 (744 tensores). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores al ensamblaje.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, chino y código.
- Generación y comprensión de código, con especial énfasis en tareas de tipo SWE-bench (el dataset princeton-nlp/SWE-bench_Lite aparece referenciado).
- Razonamiento algorítmico y chain-of-thought ("deep-thinking") gracias a los expertos trasplantados de DeepSeek-V4.1-Flash.
- Ejecución y comprensión de comandos de terminal (capacidad inferida de la descripción del protocolo de selección de expertos sobre tareas de terminal).
- Decodificación especulativa con MTP de 4 tokens para acelerar la inferencia.
- Capacidades de agente y razonamiento multi-paso (etiquetas "agent", "swe-bench").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Reparación automática de bugs en repositorios: el modelo puede abordar tareas de SWE-bench (dataset referenciado en la model card) combinando los expertos de código con los de razonamiento para localizar, diagnosticar y parchear fallos en bases de código reales.
- Asistente de terminal y automatización de operaciones: los expertos seleccionados sobre tareas de terminal permiten interpretar salidas de comandos, diagnosticar errores de shell y proponer secuencias de comandos correctivas en pipelines de CI/CD.
- Razonamiento algorítmico asistido: para problemas de optimización, análisis de complejidad o verificación formal, los 64 expertos de cadena de pensamiento por capa aportan capacidad de razonamiento profundo sobre el backbone de código.
- Despliegue en estación de trabajo única con DGX Spark: con 76,12 GiB residentes y 22,64 GiB de caché KV en 128 GiB de memoria unificada LPDDR5x, es adecuado para prototipado local de agentes de código sin clúster multi-GPU.
- Generación de código en producción con latencia reducida: la cabeza MTP de 4 tokens permite decodificación especulativa, útil en entornos interactivos donde la latencia por token es crítica.
- Investigación en fusión de modelos: sirve como caso de estudio reproducible de trasplante de expertos entre linajes distintos con Procrustes ortogonal, útil para quienes investigan model merging y arquitecturas MoE heterogéneas.
- Evaluación comparativa de cuantización NVFP4: permite medir el impacto de FP4 nativo de hardware frente a BF16/FP8 en tareas de razonamiento y código sobre Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona validación funcional (HTTP 200 OK) y verificación matemática de la equivalencia algebraica, pero no incluye puntuaciones de MMLU, HumanEval, GSM8K ni SWE-bench.

## Requisitos de hardware

- VRAM/memoria estimada: 76,12 GiB residentes para pesos, más 22,64 GiB de caché KV y 22,64 GiB de margen, sobre 121,63 GiB direccionables. Footprint en disco de 77,65 GiB.
- Hardware objetivo: NVIDIA DGX Spark (GB10 Blackwell) con 128 GiB de memoria unificada LPDDR5x y 0 swap.
- GPU recomendadas: DGX Spark (GB10) es el objetivo declarado; no se documenta soporte para A100, H100 ni RTX 4090 en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo convencionales; el modelo está dimensionado para memoria unificada de 128 GiB.
- Opciones de despliegue: vLLM (librería declarada), con FlashInfer y NVIDIA ModelOpt para la cuantización NVFP4.
- Latencia y throughput: no disponibles; la decodificación especulativa MTP de 4 tokens está orientada a reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-R1-Reasoning-NVFP4-One-Spark | 131,7 B (MoE, 512 expertos/capa) | no disponible | NVFP4, MXFP8, FP8 | nvidia-open-model-license | Hugging Face (52 descargas) |
| deepseek-ai/DeepSeek-R1 (base declarado) | no disponible en esta ficha | no disponible | múltiples | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-V3 (base declarado) | no disponible en esta ficha | no disponible | múltiples | no disponible | Hugging Face |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (base declarado) | no disponible en esta ficha | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de ensamblaje entre linajes: la fusión mediante Procrustes ortogonal y atenuación geométrica es una técnica de investigación; el comportamiento fuera de las tareas de validación (código, terminal, razonamiento algorítmico) no está documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación.
- Idiomas limitados a inglés, chino y código; no se documenta soporte para castellano ni otras lenguas.
- Longitud de contexto no especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia nvidia-open-model-license (etiquetada como "other"): es necesario revisar los términos exactos antes de uso comercial, especialmente por la herencia de componentes de DeepSeek y Qwen.
- Dependencia fuerte de hardware: optimizado para DGX Spark (GB10 Blackwell) con NVFP4 y memoria unificada; el rendimiento en otras GPUs no está validado.
- Solo 52 descargas y 1 like en el momento de la ficha: ecosistema de validación muy reducido, sin reportes independientes de terceros.
- Número de parámetros activos por token no disponible, lo que dificulta estimar coste de inferencia en otros entornos.
- La model card incluye afirmaciones de verificación matemática y funcional que no van acompañadas de artefactos de evaluación reproducibles en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-R1-Reasoning-NVFP4-One-Spark
- Modelo base de código: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base DeepSeek-V3: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Modelo base DeepSeek-R1: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Dataset SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Paper DeepSeek-V3 (arXiv:2412.19437): https://arxiv.org/abs/2412.19437
- Paper DeepSeek-V2 (arXiv:2409.19606): https://arxiv.org/abs/2409.19606
- Paper DeepSeek-V3 técnico (arXiv:2404.19737): https://arxiv.org/abs/2404.19737
- Paper DeepSeek-R1 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Paper FlashAttention (arXiv:2307.08691): https://arxiv.org/abs/2307.08691
- Paper (arXiv:2312.06635): https://arxiv.org/abs/2312.06635
- Paper (arXiv:2403.13257): https://arxiv.org/abs/2403.13257
