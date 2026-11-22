# johnsonshi/Nanbeige4.3-33B-W8A8-INT8

## Resumen

Nanbeige4.3-33B-W8A8-INT8 es una cuantización INT8 de pesos y activaciones (W8A8) del modelo Nanbeige4.3-33B, publicada por el usuario johnsonshi. El checkpoint se ha generado sin datos de calibración (data-free) mediante `llm-compressor` y el formato `compressed-tensors`, con el objetivo explícito de servir el modelo con alto rendimiento en GPUs NVIDIA Ampere (A100, A10G, RTX 3090) y Ada (L40S, RTX 4090) bajo vLLM y SGLang.

El problema que resuelve es concreto: en A100 no existen tensor cores FP8 nativos, y los checkpoints weight-only (INT4 W4A16, INT8 W8A16) descomprimen los pesos a BF16 dentro de cada kernel GEMM, ejecutando el cálculo en tensor cores BF16. Al cuantizar también las activaciones, este checkpoint ejecuta las multiplicaciones directamente en los tensor cores INT8 del A100 (624 TOPS frente a 312 TFLOPS en BF16) y reduce el peso en memoria aproximadamente a la mitad (~31 GiB), liberando HBM para la caché KV.

El modelo base es un transformer de 33.118.977.024 parámetros (33B) con licencia Apache 2.0, orientado a generación de texto conversacional en inglés y chino. Esta versión cuantizada mantiene la licencia Apache 2.0 y se distribuye en safetensors (35,5 GB de repositorio), pensada para despliegues de producción con requisitos de throughput y latencia ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, tag `llama`); detalles internos del modelo base no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada en vLLM y SGLang); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos per-channel simétrico INT8, activaciones dinámicas per-token simétrico INT8; `lm_head` en BF16; KV cache configurable en BF16 o FP8 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (INT8); compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo Nanbeige4.3-33B. La receta, aplicada con `llm-compressor` de forma data-free, cuantiza las capas `Linear` con un observador minmax sin memoria (per-channel simétrico para pesos) y activaciones dinámicas per-token simétricas INT8; la capa `lm_head` se mantiene en BF16. El resultado es un modelo que ejecuta GEMMs en tensor cores INT8 en hardware Ampere y Ada, sin necesidad de calibración con dataset.

No se dispone de información sobre la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas propias del modelo base más allá de su pertenencia a la familia LLaMA. La innovación destacable de este checkpoint es exclusivamente de despliegue: la cuantización W8A8 permite aprovechar los tensor cores INT8 del A100 y, combinada con decodificación especulativa por sufijos (suffix decoding) programada por lotes, mejora simultáneamente la latencia de un solo usuario y la capacidad en modo batch.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo "thinking" activable (el autor recomienda `--reasoning-parser qwen3` en vLLM y SGLang, lo que sugiere formato de razonamiento compatible con Qwen3).
- Tool calling / function calling, con parser recomendado `qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Flujos agénticos multi-paso: el benchmark del autor incluye sesiones de 48 conversaciones × 6 turnos.
- Recuperación en contexto largo: passkey retrieval verificado a 8k, 16k y 28k tokens.
- Razonamiento matemático: evaluado en GSM8K con modo thinking.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente automatizada: conversaciones multi-turno con ventanas de hasta 32.768 tokens y caché KV en FP8; el benchmark del autor reporta 3,21–3,24 req/s sostenidos en carga tipo ShareGPT sobre una A100 80GB, lo que permite absorber picos de tráfico con una sola GPU.
- Asistentes agénticos con herramientas: el soporte de tool calling con parser `qwen3_coder` y el modo thinking permiten construir agentes que encadenan llamadas a APIs; el benchmark multi-turno reporta p90 de TTFT de 0,94–1,05 s frente a 114,4 s del BF16 por defecto, gracias a la mayor caché KV disponible.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse como servicio vLLM o SGLang expuesto por HTTP y consumirse desde herramientas de revisión o generación de parches; el tool calling permite invocar linters o ejecutores de tests como funciones.
- Procesamiento de documentos largos en chino e inglés: resumen, extracción y Q&A sobre contratos o informes de hasta 28k tokens, con recuperación verificada en esa longitud.
- Razonamiento matemático y tutoría: con el modo thinking activado, el modelo alcanza 97,5–98,5 % en GSM8K según el benchmark del autor, adecuado para resolución paso a paso de problemas.
- Servicio de inferencia de alto throughput en infraestructura A100 existente: al liberar ~28 GiB de HBM frente al BF16 y duplicar el rendimiento de prefill (1,58–1,68 s frente a 2,74 s en prompts de 8k), permite consolidar cargas en menos GPUs.
- Despliegue en GPUs consumer Ada (RTX 4090, L40S): el autor declara compatibilidad con estas GPUs, aunque no se publican cifras de rendimiento específicas para ellas.

## Benchmarks y rendimiento

Datos publicados por el autor en una A100 80GB PCIe (Azure `Standard_NC24ads_A100_v4`), vLLM 0.34.0 y SGLang 0.5.23.

| Evaluación | BF16 sin cuantizar | W8A8-INT8 (KV BF16) | W8A8-INT8 (KV FP8) |
|---|---|---|---|
| GSM8K (200 problemas, thinking on) | 97,5 % (vLLM) / 98,0 % (SGLang) | 97,5 % (vLLM) / 98,5 % (SGLang) | 97,5–98,0 % (vLLM) / 97,0 % (SGLang) |
| Passkey retrieval (8k/16k/28k) | 9/9 | 9/9 | 9/9 |
| Acuerdo top-1 con BF16 (3.827 tokens greedy) | 99,1 % (ruido de re-ejecución) | 94,1–94,5 % (+0,032–0,037 nats/tok NLL) | 93,8–94,3 % (+0,037–0,039 nats/tok NLL) |

| Carga de servicio | BF16 por defecto | W8A8-INT8 | Mejora |
|---|---|---|---|
| Prefill 8k tokens (TTFT, c=1) | 2,74 s (INT4 W4A16: 3,47 s) | 1,68 s (vLLM) / 1,58 s (SGLang) | 1,6–1,7× |
| ShareGPT chat (capacidad 2 min) | 1,72 req/s | 3,83 req/s (vLLM, KV FP8) / 4,40 req/s (SGLang) | 2,2–2,6× |
| ShareGPT chat (sostenido 9 min) | 1,45–1,50 req/s | 3,21 req/s (vLLM) / 3,24 req/s (SGLang) | 2,2× |
| Carga sintética (1.024 in / 512 out) | 1,13 req/s (2 min) | 2,31 req/s sostenido / 2,61 req/s (2 min) | 2,3× |
| Agéntico multi-turno (48×6, p90 TTFT) | 114,4 s (11 preemptions) | 1,05 s (vLLM) / 0,94 s (SGLang) | ~110–120× menor |
| Usuario único + batch (suffix spec) | 23,4 tok/s (c=1) | 55,1 tok/s (c=1) / 3,84 req/s chat | 2,4× y 2,2× |

No se han publicado resultados de benchmarks del modelo base frente a modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM para pesos: ~31 GiB en INT8 (frente a ~62 GiB en BF16), lo que deja ~28 GiB adicionales de HBM en una A100 80GB para caché KV.
- GPU de referencia del benchmark: 1× NVIDIA A100 80GB PCIe.
- GPUs declaradas compatibles por el autor: Ampere (A100, A10G, RTX 3090) y Ada (L40S, RTX 4090), por disponer de tensor cores INT8.
- En RTX 3090 (24 GB) los pesos de ~31 GiB no caben completos en VRAM; se requeriría offload a CPU, particionado o una cuantización adicional, opciones no documentadas por el autor.
- En RTX 4090 (24 GB) aplica la misma limitación de capacidad.
- Despliegue: vLLM (con `--kv-cache-dtype fp8`, `--safetensors-load-strategy prefetch` y configuración de suffix decoding opcional) y SGLang (con `--enable-mixed-chunk` y caché jerárquica en host DRAM de 64 GiB para cargas agénticas).
- Throughput y latencia medidos: 55,1 tok/s en usuario único con decodificación especulativa por sufijos; 3,84 req/s en chat batch; TTFT de 1,58–1,68 s en prefill de 8k tokens; p90 TTFT de 0,94–1,05 s en sesiones agénticas multi-turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-W8A8-INT8 (esta ficha) | 33,1B | 32.768 (config. de servicio) | INT8 W8A8, KV BF16/FP8 | Apache 2.0 | Hugging Face (johnsonshi) |
| Nanbeige4.3-33B (base) | 33,1B | No disponible | BF16; checkpoints INT4 W4A16, INT8 W8A16 y FP8 publicados por el autor original | Apache 2.0 | Hugging Face (Nanbeige) |
| Alternativas de ~30B con licencia permisiva | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad frente a BF16: el acuerdo top-1 con el modelo sin cuantizar es del 93,8–94,5 % en 3.827 tokens greedy, con un incremento de NLL de 0,032–0,039 nats/token. Aunque GSM8K y passkey retrieval no muestran degradación medible, tareas sensibles a la distribución exacta de tokens pueden verse afectadas.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez para el modelo base ni para esta cuantización.
- Alucinación: no se publican métricas de factualidad; el modo thinking y el uso agéntico incrementan la superficie de error en producción.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está evaluado y no debe asumirse.
- Contexto: la longitud de 32.768 tokens es la configuración de servicio recomendada, no necesariamente el máximo nativo del modelo base; superar ese límite requiere validación propia.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Nanbeige4.3-33B y de las dependencias (`llm-compressor`, `compressed-tensors`).
- Compatibilidad hardware: el rendimiento declarado se ha medido únicamente en A100 80GB PCIe; no hay cifras para A10G, RTX 3090, L40S ni RTX 4090, y en GPUs de 24 GB los pesos no caben en VRAM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados del autor.
- Los parsers recomendados (`qwen3`, `qwen3_coder`) son de la familia Qwen; su idoneidad para este modelo se basa en la configuración del autor y debe probarse en cada despliegue.
- El benchmark se describe como "hill-climbing automatizado de 337 ensayos", lo que implica ajuste intensivo de configuración sobre una única plataforma; los resultados pueden no transferirse a otros entornos.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/johnsonshi/Nanbeige4.3-33B-W8A8-INT8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llm-compressor (repositorio): https://github.com/vllm-project/llm-compressor
- vLLM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
- Paper del modelo base: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
