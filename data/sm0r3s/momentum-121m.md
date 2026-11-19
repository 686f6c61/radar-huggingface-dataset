# Sm0r3s/Momentum-121M

## Resumen

Momentum-121M es un modelo de lenguaje de investigación entrenado desde cero por el autor independiente Sm0r3s. Se trata de una arquitectura híbrida que combina capas recurrentes Gated DeltaNet (que mantienen estado de forma secuencial) con capas de atención comprimida MLA (Multi-head Latent Attention, tomada de DeepSeek-V2) y un feed-forward de mezcla de expertos dispersa (MoE). El checkpoint contiene 121,4 millones de parámetros totales, de los cuales aproximadamente 65 millones se activan por token.

El modelo se ha entrenado en dos fases: un preentrenamiento de 1000 millones de tokens sobre FineWeb-Edu con contexto de 512 tokens, seguido de una segunda pasada que amplía el contexto a 1024 y realiza un ajuste supervisado (SFT) para enseñar un formato de chat mínimo y una única herramienta: `web_search(query)`. El modelo lee resultados de búsqueda numerados que un harness externo le proporciona y responde con citas en formato `[n]`.

Es relevante como pieza de investigación porque demuestra la viabilidad de combinar componentes publicados (Gated DeltaNet, MLA, routing MoE con sigmoid y balanceo sin pérdida auxiliar, predicción multi-token) en un modelo de escala muy reducida entrenado desde cero con un presupuesto de cómputo mínimo. No es un asistente general: es un banco de pruebas arquitectónico con capacidades deliberadamente acotadas y un rendimiento limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 9 capas Gated DeltaNet + 3 capas MLA + MoE en 9 de 12 capas |
| Parámetros totales | 121.469.502 |
| Parámetros activos | ~65M por token |
| Longitud de contexto | 1024 tokens (entrenado con hasta 1024) |
| Tipos de cuantización | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (research-only, ver limitaciones) |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 12 capas, hidden size 448, vocabulario 50257 (tokenizer GPT-2 BPE), embeddings no atados, sin biases. Feed-forward: primeras 2 y última capa densas SwiGLU (ancho 896); las otras 9 son MoE con 48 expertos enrutados (ancho 104) + 1 compartido, top-3, puntuaciones sigmoid, 6 grupos / 1 retenido, balanceo por bias sin pérdida auxiliar, dropless. Gated DeltaNet: 7 cabezas, key dim 32, value dim 64, conv causal corta (k=4), estado en fp32. MLA: 14 cabezas, q-LoRA 56, kv-LoRA 32, nope/rope/v = 32/16/32, puerta de salida sigmoid. Predicción multi-token: 1 capa extra (t+2) con peso de pérdida 0.1.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido en el que la mayoría de capas (9 de 12) son recurrentes Gated DeltaNet, que acarrean estado hacia delante de forma eficiente, mientras que cada cuarta capa (índices 3, 7 y 11) es de atención MLA, encargada del recuerdo exacto. El feed-forward es denso en las capas 0, 1 y 11, y MoE en el resto. El enrutado MoE usa puntuaciones sigmoid con selección top-3, enrutado limitado por grupos (6 grupos, 1 retenido) y balanceo de carga basado en bias sin pérdida auxiliar, siguiendo el diseño de DeepSeek-V3. Se añade una cabeza de predicción multi-token (t+2) con peso 0.1 en la pérdida. Los componentes están tomados de trabajos publicados: Gated Delta Networks (arXiv:2412.06464), MLA (arXiv:2405.04434) y routing/MTP de DeepSeek-V3 (arXiv:2412.19437).

El entrenamiento se divide en tres etapas. Pass 1 (preentrenamiento): 1000M tokens de FineWeb-Edu (`sample-10BT`), contexto 512, 30517 pasos de 64 secuencias, AdamW (lr 6e-4 con decaimiento coseno al 10%), pérdida en held-out de 3.598. Pass 2 stage A (warm-up de contexto largo): 100M tokens a contexto 1024, mezcla FineWeb-Edu 70% / Cosmopedia v2 30%, filtrando documentos de código y matemáticas; pérdida held-out FineWeb-Edu de 3.666. Pass 2 stage B (SFT): 40M tokens con preguntas de MS MARCO convertidas en llamadas a `web_search` con pasajes numerados y respuesta corta citada (60%, con ~12% de pasajes irrelevantes y respuesta "the results don't say"), chat de smol-smoltalk (30%) y replay de texto de preentrenamiento (10%); pérdida solo sobre texto del asistente, con held-out de 1.757. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con formato de chat mínimo (bloques `### System`, `### User`, `### Assistant`, `### Tool`).
- Llamada a una única herramienta: `web_search(query)`, emitida como `<tool_call>{"name":"web_search","arguments":{"query":"..."}}</tool_call>`.
- Lectura de resultados de búsqueda numerados proporcionados por el harness y respuesta extractiva con citas `[n]`.
- Manejo del caso de "resultados irrelevantes" devolviendo "the results don't say" (entrenado explícitamente para ello).
- Razonamiento multi-paso muy limitado: el flujo típico es llamada a herramienta y respuesta citada; no se documenta capacidad de agentes complejos.
- No soporta visión, audio, código especializado ni matemáticas (los documentos de código y matemáticas se filtraron en el warm-up).
- Multilingüe: solo inglés.

## Casos de uso

- Investigación de arquitecturas híbridas recurrentes/atención: sirve como implementación de referencia a pequeña escala de Gated DeltaNet + MLA + MoE para estudiar estabilidad de entrenamiento, balanceo de carga y calidad con presupuestos de cómputo mínimos.
- Prototipado de pipelines de búsqueda aumentada (RAG con búsqueda web): el modelo consume pasajes numerados y produce citas `[n]`, lo que permite validar el bucle harness-modelo-citas sin coste de un modelo grande.
- Evaluación de formatos de tool calling: útil para probar parsers y harnesses que interpretan `<tool_call>` y mapean `[n]` a URLs, dado que el modelo nunca escribe URLs.
- Docencia y experimentación con tokenizers y embeddings GPT-2 BPE en arquitecturas no estándar (no atados, sin biases).
- Pruebas de robustez ante fuentes irrelevantes: el subconjunto de entrenamiento con pasajes no relacionados permite estudiar el comportamiento de abstención ("the results don't say").
- Benchmarking de eficiencia de inferencia híbrida: comparar el coste de estado recurrente frente a atención MLA en GPUs de consumo, aunque con la advertencia de que sin `flash-linear-attention` la Gated DeltaNet cae a un bucle por token muy lento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ejecutaron benchmarks downstream y que se esperan respuestas cortas y mayoritariamente extractivas. Los únicos datos de rendimiento son las pérdidas de entrenamiento (held-out 3.598 en pass 1, 3.666 en warm-up de contexto largo, 1.757 en la mezcla SFT).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 121,4M parámetros; en fp32 ocupa ~486 MB, en bf16/fp16 ~243 MB. El repo pesa 1,0 GB (incluye pesos y posiblemente otros artefactos). Con overhead de activaciones y estado recurrente, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU CUDA moderna (RTX 3060 en adelante) es suficiente; para aprovechar `flash-linear-attention` se requiere GPU CUDA y una versión compatible de la librería.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas iGPU con suficiente memoria.
- Opciones de despliegue: carga manual con `safetensors` + `transformers` (tokenizer GPT-2) + el paquete `momentum` del autor (`Cfg`, `MomentumLM`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la generación recomputa la secuencia completa sin caché KV/estado, lo que limita el throughput.
- Latencia y throughput: no disponibles. La model card advierte que sin `flash-linear-attention` la Gated DeltaNet usa un bucle por token lento y que no hay caché de estado, por lo que la generación es costosa en tiempo aunque el modelo sea pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Momentum-121M | 121M (65M activos) | 1024 | Híbrida GDN + MLA + MoE | `other` (research-only) | Hugging Face |
| SmolLM-135M | 135M | 2048 | Transformer denso | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 32768 | Transformer denso | Apache-2.0 | Hugging Face |

La comparación con SmolLM-135M y Qwen2.5-0.5B es orientativa por tamaño y categoría (modelos pequeños de generación de texto); no se dispone de benchmarks de Momentum-121M para comparar rendimiento. Momentum-121M se distingue por su arquitectura híbrida y su enfoque en tool use con búsqueda web, pero su contexto (1024) y licencia restrictiva lo sitúan por debajo de las alternativas en usabilidad general.

## Limitaciones y advertencias

- Modelo muy pequeño y ligeramente entrenado (1100M tokens de preentrenamiento): puede leer mal las fuentes, copiarlas en exceso, citar incorrectamente y escribir hechos erróneos cuando faltan fuentes.
- Solo inglés; sin ajuste de seguridad (no safety tuning).
- Contexto máximo de 1024 tokens, lo que limita la longitud de los pasajes y del historial de conversación.
- La generación recomputa la secuencia completa sin caché KV/estado, lo que degrada la latencia en producción.
- Sin `flash-linear-attention` y GPU CUDA, la Gated DeltaNet cae a un bucle por token extremadamente lento.
- Licencia `other`: los pesos se marcan como research-only porque la model card de MS MARCO no declara licencia y los términos de Microsoft se consideran restringidos a investigación no comercial; el uso comercial requiere aclaración legal.
- El código es Apache-2.0, pero los datos de entrenamiento tienen licencias mixtas (FineWeb-Edu ODC-By 1.0, smol-smoltalk Apache-2.0, Cosmopedia v2 según la card de smollm-corpus, MS MARCO sin licencia declarada).
- Riesgo de alucinación y de citas incorrectas incluso con fuentes presentes; el harness debe validar el mapeo `[n]` a URLs.
- No es un asistente general: no debe desplegarse como chatbot de atención al cliente ni en producción sin una evaluación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/Sm0r3s/Momentum-121M
- Gated Delta Networks: https://arxiv.org/abs/2412.06464
- Multi-head Latent Attention (DeepSeek-V2): https://arxiv.org/abs/2405.04434
- DeepSeek-V3 (routing MoE, balanceo sin pérdida auxiliar, MTP): https://arxiv.org/abs/2412.19437
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus (incluye Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset MS MARCO: https://huggingface.co/datasets/microsoft/ms_marco
