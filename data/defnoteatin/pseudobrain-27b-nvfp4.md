# defnoteatin/PseudoBrain-27B-NVFP4

## Resumen

PseudoBrain-27B-NVFP4 es un modelo de generación de texto de 27.356 millones de parámetros desarrollado por Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face), construido sobre la arquitectura híbrida Qwen3.8 de 27B y publicado como checkpoint cuantizado en formato NVFP4 (4 bits) con licencia Apache 2.0. El modelo es una versión "abliterada" (sin filtros de alineación) derivada de `batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2`, y su principal aportación técnica es la arquitectura PseudoBrain: un diseño híbrido que combina atención con ventana deslizante y capas recurrentes Gated DeltaNet (GDN) para reducir el coste de memoria del KV cache en contextos extremadamente largos.

El problema que resuelve es bien conocido en serving de LLM: con Transformers estándar, la memoria del KV cache crece linealmente con la longitud de contexto y el cómputo de prefill crece de forma cuadrática, lo que hace inviables cargas de trabajo de 128K a 1M de tokens incluso en GPUs con memoria de sobra para los pesos. PseudoBrain aborda esto con un estado recurrente GDN de tamaño constante O(1), una memoria jerárquica de tres niveles respaldada por NVMe y un esquema de RoPE por bloques, anunciando una reducción del 99,2 % en memoria de KV cache a 1M de tokens (de 64 GB a unos 486 MiB de ventana activa con un pool de 6 GB).

Es relevante ahora porque los contextos de un millón de tokens en modelos abiertos de tamaño medio siguen siendo raros, y esta ficha de modelo apunta directamente a despliegues on-premise de contexto largo con vLLM. El checkpoint NVFP4 está orientado a GPUs NVIDIA Blackwell (RTX 5090, DGX Spark GB10, B200), con un tamaño de pesos de unos 19,5 GB y un consumo total estimado de unos 25,5 GB a 1M de tokens. Cabe señalar que se trata de un proyecto de un autor independiente, no verificado por terceros, por lo que conviene revisar los informes de benchmarks publicados en su repositorio antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 64 capas (48 Gated DeltaNet + 16 capas de atencion completa con SWA de 16K, memoria Quest y GDN paralelo); clase `PB27ForConditionalGeneration` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No disponible (arquitectura densa segun la model card, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (este repo); existen ediciones W4A16, FP8 y BF16 del mismo modelo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, 8-bit/NVFP4), tamano del repo 24,3 GB; requiere vLLM con plugin `pb27_vllm` |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain combina 48 capas nativas de Gated DeltaNet (un mecanismo recurrente de estado fijo O(1) independiente de la longitud del contexto) con 16 capas de atencion completa distribuidas cada 4 capas (indices 3, 7, 11, ..., 63). En esas capas dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k paginas de "Quest Exact Memory" y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y cotas jerarquicas de dos niveles en bf16. La memoria de tres niveles puede apoyarse en NVMe y page cache, lo que permite manejar 1M de tokens con un pool de KV cache de solo 6 GB.

Sobre el mecanismo de posicion, el modelo emplea un RoPE por bloques estrictamente no solapado ("piecewise-proportional block RoPE"), que impone una huella obligatoria de 64 tokens por bloque recuperado y escala proporcionalmente los huecos historicos, manteniendo la fidelidad de distancia temporal a 1M de tokens sin degradacion estatica tipo YaRN. Ademas, un mecanismo de agregacion global densa detecta queries de alta participacion y activa landmarks resumen (un token resumen por cada 4.096 tokens) y barridos rotativos por novedad durante el decode, permitiendo razonamiento multi-paso que recorre cientos de bloques distintos. El decode es de velocidad constante O(1) con presupuesto de recuperacion desacoplado del prefill. El modelo base es Qwen3.8-27B abliterado (sin filtros de rechazo), cuantizado a NVFP4; no hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni procesos de RLHF/DPO aplicados a este checkpoint concreto.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`) con razonamiento, compatible con el reasoning parser de Qwen3 en vLLM.
- Contexto extremadamente largo de hasta 1.048.576 tokens con memoria de KV cache practicamente constante.
- Soporte de tool calling / function calling mediante `--enable-auto-tool-choice` y el parser `qwen3_coder` de vLLM.
- Capacidades de codigo heredadas de la familia Qwen (el parser de herramientas es el variante coder), aunque no se publican benchmarks especificos.
- Razonamiento multi-paso sobre contextos de 1M de tokens gracias a los barridos rotativos de bloques y la agregacion global densa.
- Modelo abliterado: sin filtros de rechazo de seguridad, lo que permite respuestas sin las negativas tipicas de modelos alineados (con los riesgos asociados).
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM, con soporte V1/V2 y fallback `ForwardContext` sin hooks.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto se puede cargar un codebase entero (cientos de miles de lineas) en una sola sesion y hacer preguntas de arquitectura, refactorizacion o deteccion de bugs sin chunking, aprovechando el parser de tool calls `qwen3_coder`.
- Revision de documentos legales o contratos extensos: la fidelidad de distancia temporal del RoPE por bloques esta disenada para mantener la coherencia posicional a lo largo del documento, util para cross-referencias entre clausulas separadas por cientos de miles de tokens.
- Chatbots con historial de conversacion persistente: el estado GDN de tamano constante permite mantener memorias de conversacion de meses sin que el coste de VRAM crezca con el historial, ideal para asistentes de atencion al cliente de largo recorrido.
- Procesamiento de logs y telemetria a gran escala: ingestar sesiones de logs de 1M de tokens y localizar anomalias, gracias a la recuperacion dispersa por paginas Quest sobre las capas de anclaje.
- Investigacion sobre arquitecturas sub-cuadraticas: el paper de arquitectura, los informes de benchmarks y el plugin de vLLM publicados hacen del modelo una base practica para estudiar hibridos GDN + atencion dispersa en contextos de 1M.
- Despliegue on-premise de contexto largo en hardware de consumo: con unos 25,5 GB de VRAM total a 1M de tokens, cabe en una RTX 5090 de 32 GB, lo que permite instalaciones privadas sin depender de GPUs de datacenter.
- Agentes con razonamiento multi-paso sobre grandes corpus: el mecanismo de barrido rotativo de bloques esta disenado para que el decode recorra cientos de bloques distintos durante cadenas de razonamiento largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la model card de Hugging Face. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, centrados en metricas de memoria y latencia de serving (por ejemplo, la reduccion del 99,2 % en KV cache a 1M tokens y el decode O(1)), pero no se incluyen cifras comparativas de calidad frente a otros modelos en la informacion disponible. No se han verificado de forma independiente las cifras del autor.

## Requisitos de hardware

- VRAM para este checkpoint NVFP4: pesos de ~19,5 GB y ~25,5 GB de VRAM total a 1M de tokens (pool de KV cache de 6 GB configurable mediante `--kv-cache-memory-bytes 6G`).
- GPUs objetivo: NVIDIA Blackwell con soporte NVFP4 — RTX 5090 (32 GB), DGX Spark GB10 y B200. No es adecuado para GPUs Ampere/Ada/Hopper, que carecen de soporte nativo NVFP4.
- En consumer GPU: si, cabe en una RTX 5090 de 32 GB a contexto completo de 1M de tokens. Para otras precisiones del mismo modelo, la edicion W4A16 (~20,5 GB total) cabe en una RTX 3090/4090 de 24 GB, y la FP8 (~33,5 GB) requiere RTX 5090, L40S, A100 o H100.
- Motor de inferencia: vLLM (V1 y V2) con el plugin universal `pb27_vllm`, instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`; el plugin se auto-registra via `vllm.general_plugins`. Cada checkpoint incluye ademas `pb27_vllm_plugin/` en el propio repositorio.
- Lanzamiento recomendado: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`. Soporte declarado para NVIDIA CUDA y AMD ROCm.
- Latencia y throughput: no se publican cifras concretas en la model card; el autor declara decode de velocidad constante O(1) independiente de la longitud de contexto. No disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-27B-NVFP4 | 27,36B | 1.048.576 | Hibrida GDN + atencion dispersa | Apache 2.0 | Hugging Face, requiere plugin vLLM propio y GPU Blackwell (NVFP4) |
| Qwen3-30B-A3B (base original de la familia) | 30,5B (3,3B activos, MoE) | 131.072 | MoE Transformer | Apache 2.0 | Hugging Face, soporte nativo vLLM/llama.cpp |
| Llama 3.1 8B / 70B | 8B / 70B | 131.072 | Transformer denso | Licencia Llama 3.1 (restricciones) | Hugging Face, soporte amplio de motores |

PseudoBrain-27B se diferencia por su contexto de 1M de tokens con memoria casi constante, muy por encima de los 128K de las alternativas citadas, a cambio de requerir un plugin de vLLM especifico del proyecto y, en esta edicion NVFP4, hardware Blackwell. La calidad de generacion no es comparable con datos publicados: no hay benchmarks estandarizados disponibles para PseudoBrain-27B.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los filtros de seguridad del modelo base. Esto implica riesgo elevado de generar contenido ofensivo, peligroso o no deseado; no se recomienda exponerlo directamente a usuarios finales sin capas de moderacion propias.
- Proyecto de autor independiente sin auditoria de terceros: las cifras de reduccion de memoria y de rendimiento provienen de los informes del propio autor y no estan verificadas de forma independiente.
- Calidad no contrastada: al no existir benchmarks estandarizados publicados, no se puede garantizar que la abliteracion y la cuantizacion NVFP4 no hayan degradado las capacidades del modelo base.
- Dependencia de un plugin propio: el modelo no funciona con vLLM estandar sin instalar `pb27_vllm`, lo que anade fragilidad ante actualizaciones de versiones de vLLM (el propio autor destaca la resiliencia de versiones como punto de diseño, lo que sugiere que ha sido un problema real).
- Cuantizacion agresiva: NVFP4 es un formato de 4 bits que puede introducir perdida de precision frente a BF16 o FP8; existen ediciones alternativas del mismo modelo si se prioriza calidad.
- Idiomas soportados no documentados: aunque la familia Qwen suele tener buen rendimiento multilingue, no hay informacion especifica para este checkpoint.
- Requisito de hardware concreto: la edicion NVFP4 exige GPUs Blackwell; en otro hardware habra que recurrir a las ediciones W4A16, FP8 o BF16.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Configuracion de serving delicada: se recomienda desactivar prefix caching (`--no-enable-prefix-caching`) y usar `--enforce-eager` segun las instrucciones del autor; desviarse de la configuracion documentada puede provocar OOM o resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-27B-NVFP4
- Repositorio de GitHub (plugin `pb27_vllm` y engine): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelos base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated , https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2 , https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ
- Ediciones alternativas: https://huggingface.co/defnoteatin/PseudoBrain-27B-W4A16 , https://huggingface.co/defnoteatin/PseudoBrain-27B-FP8 , https://huggingface.co/defnoteatin/PseudoBrain-27B-BF16
- Perfil de GitHub del autor: https://github.com/defnotean
