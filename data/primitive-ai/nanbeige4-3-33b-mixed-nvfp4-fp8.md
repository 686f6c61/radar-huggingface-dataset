# primitive-ai/Nanbeige4.3-33B-mixed-NVFP4-FP8

## Resumen

Nanbeige4.3-33B-mixed-NVFP4-FP8 es una versión cuantizada con precisión mixta del modelo Nanbeige4.3-33B, publicada por primitive-ai. El modelo base, desarrollado por Nanbeige, es un LLM de tipo razonador y agéntico orientado a generación de texto, tool calling y conversación en inglés y chino. Esta variante aplica una estrategia híbrida: atención en FP8 (W8A8) y la mayor parte de los MLP en NVFP4 (W4A4), con embeddings, LM head y normas en BF16.

El problema que resuelve esta build es la eficiencia de despliegue en una sola GPU: reduce el tamaño de los pesos de 66,24 GB (BF16) a 25,30 GB, un 62 % menos, manteniendo una deriva de solo +38,9×10⁻³ nats/token respecto a BF16, muy por debajo de los +64,3 del NVFP4 puro. A cambio de 3,23 GB adicionales frente al NVFP4 puro, se obtiene un 40 % menos de deriva y una mejor conservación de las capacidades de conocimiento y tool calling. Es relevante ahora porque las cuantizaciones de 4 bits nativas (NVFP4) sobre hardware Blackwell permiten servir modelos de 30 B+ en una única GPU de 96 GB con throughput superior al de BF16.

La ventana de contexto del modelo base es de 524.288 tokens. La licencia es Apache 2.0, tanto del modelo base como de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia LLaMA, según tag `llama`), densa |
| Parametros totales | 21.440.986.112 (dato real de safetensors; el nombre comercial indica 33B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | 524.288 tokens (ventana del modelo base) |
| Tipos de cuantizacion | Mixta: FP8 W8A8 en 216 de 364 capas lineales del decoder, NVFP4 W4A4 en el resto; embeddings, LM head y normas en BF16 |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 25,30 GB; despliegue con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso (tag `llama` en Hugging Face) con capacidades de razonamiento (thinking mode) y tool calling. Esta variante no modifica la arquitectura, solo la precisión numérica: 216 de las 364 capas lineales del decoder usan FP8 W8A8 (incluida la atención), mientras que el resto de los MLP usan NVFP4 W4A4. Embeddings, LM head y capas de normalización permanecen en BF16. Según el autor, esta combinación reduce un 40 % la deriva respecto al NVFP4 puro a costa de solo 3,23 GB adicionales.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay información disponible en la model card. La cuantización se ha validado midiendo la deriva de log-verosimilitud (nats/token) sobre 400 trazas de razonamiento generadas por BF16 en la misma tarjeta, con un error estándar de 1,1 sobre trazas.

## Capacidades

- Generacion de texto conversacional en inglés y chino, con pipeline `text-generation`.
- Razonamiento con thinking mode: el modelo genera trazas de razonamiento que vLLM puede separar con el parser `qwen3`; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling: verificado con el parser `qwen3_coder` de vLLM; el modelo emite llamadas estructuradas (p. ej. `get_weather {"city": "Lisbon"}`) y puntúa 79,0 en la suite de 200 ítems de tool calling.
- Comportamiento de abstención: puntúa 63,3 en la métrica de abstain, idéntico a BF16.
- Razonamiento agéntico multi-paso, según los tags del repositorio (reasoning, agentic).
- 99,1 % de las respuestas terminan dentro del presupuesto de tokens asignado (16.384 tokens en las pruebas).

## Casos de uso

- Chatbots y asistentes conversacionales autoalojados: el thinking mode con parser de razonamiento permite separar el proceso de deliberación de la respuesta final en interfaces de usuario.
- Agentes con herramientas: soporte nativo de tool calling vía parser `qwen3_coder` en vLLM, adecuado para agentes que consultan APIs, bases de datos o ejecutan funciones en flujos multi-paso.
- Despliegue en una sola GPU de gama alta: con 25,30 GB de pesos cabe íntegro en una RTX PRO 6000 Blackwell de 96 GB dejando un pool de KV de 311.488 tokens a ventana de 32 K, ideal para equipos sin multi-GPU.
- Servicios con alta concurrencia: 308 tok/s agregados a concurrencia 32 frente a 129 de BF16 en la misma tarjeta, útil para atender múltiples usuarios simultáneos con coste de hardware reducido.
- Aplicaciones bilingües inglés-chino: soporte explícito de ambos idiomas en el modelo base.
- Procesamiento de documentos largos: la ventana nativa de 524.288 tokens permite, si la VRAM lo permite (subiendo `--max-model-len`), analizar repositorios de código o documentos extensos en una sola pasada.
- Integración en pipelines con API OpenAI-compatible: el comando de despliegue recomendado usa `vllm-openai`, lo que facilita la integración con clientes existentes del ecosistema OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica un protocolo propio fijo (1.370 ítems, autoevaluados sin LLM judge, temperature 0.6, top_p 0.95, top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32, una RTX PRO 6000 Blackwell de 96 GB, vLLM 0.32.0):

| Build | Formato | Tamaño | Drift (×10⁻³ nats/token) | Acuerdo top-1 | Conocimiento | Tool call | Abstain | Finalizadas | tok/s @1 | tok/s @32 | Pool KV |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16) | BF16 | 66,24 GB | 0 (referencia) | 100 % | 89,7 | 80,8 | 63,3 | 99,2 % | 20,1 | 129 | 113.648 |
| FP8 | FP8 W8A8 | 35,53 GB | +5,95 | 97,9 % | 89,3 | 80,4 | 63,3 | 99,1 % | 35,4 | 225 | 262.448 |
| **Esta build** | NVFP4 + FP8 mixto | **25,30 GB** | **+38,89** | 95,1 % | 88,9 | 79,0 | 63,3 | 99,1 % | 48,0 | 308 | 311.488 |
| NVFP4 | NVFP4 W4A4 | 22,07 GB | +64,28 | 93,7 % | 89,0 | 78,8 | 64,2 | 99,1 % | 53,8 | 336 | 326.144 |

La deriva se mide sobre 400 trazas BF16 de la suite de conocimiento (215.950 tokens de completado); el error estándar sobre trazas es 1,1 para esta build. El tool calling se evalúa con 3 ejecuciones por build y el conocimiento con 2 (1 para BF16). No se han medido contextos superiores a 32 K ni otras GPUs.

## Requisitos de hardware

- VRAM para inferencia: 25,30 GB de pesos (23,90 GiB cargados en runtime). Con `--gpu-memory-utilization 0.92` en una GPU de 96 GB queda un pool de KV de 298.832 tokens a ventana de 131.072 (o 311.488 a ventana de 32 K).
- GPU verificada: RTX PRO 6000 Blackwell (96 GB, sm_120). Es la única GPU probada; el formato NVFP4 requiere hardware Blackwell (o compatible con FP4), por lo que no funcionará en Ampere o Hopper.
- Consumer GPU: no cabe en tarjetas de 24 GB (RTX 4090/3090). Cabe en GPUs de 32 GB+ solo si el hardware soporta NVFP4, algo actualmente limitado a Blackwell; en la práctica se necesita una RTX PRO 6000 Blackwell o similar de 96 GB.
- Despliegue: vLLM (v0.32.0, imagen `vllm/vllm-openai`) con `--reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`. No hay soporte indicado para llama.cpp, Ollama o TGI (el formato compressed-tensors/NVFP4 es específico de vLLM).
- Rendimiento medido: arranque en 181 s, 48,0 tok/s en streaming único y 308 tok/s a concurrencia 32 (8 K in / 512 out, sin prefix cache, dos semillas por celda), con KV cache en BF16.
- Tiempo de arranque verificado: 181 segundos con la tarjeta en reposo.

## Comparativa con modelos similares

Comparativa publicada por el propio autor con otros modelos cuantizados por primitive-ai, bajo el mismo protocolo de evaluación fijo (los tamaños se expresan en GiB):

| Modelo | Forma | Tamaño | Overall | Conocimiento | Tool call | Abstain | Finalizadas | Tokens/respuesta |
|---|---|---|---|---|---|---|---|---|
| Laguna-XS-2.1 (mixed-NVFP4-MXFP8) | 31 B MoE | 19,3 GiB | 81,7 | 83,8 | 68,4 | 73,5 | 98,9 % | 1.097 |
| Nemotron-3.5-Lightning-30B-A3B (mixed-INT4-INT8) | 30 B MoE+Mamba | 19,2 GiB | 87,1 | 87,9 | 85,4 | 70,5 | 97,9 % | 1.429 |
| Ornith-1.5-35B-A3B (mixed-NVFP4-FP8) | 35 B MoE | 22,6 GiB | no disponible (tabla truncada en la fuente) |
| Nanbeige4.3-33B-mixed-NVFP4-FP8 (esta ficha) | 21,4 B denso | 25,30 GB | no disponible | 88,9 | 79,0 | 63,3 | 99,1 % | no disponible |

El autor advierte que las cifras de accuracy dependen del presupuesto de tokens, la temperatura y si se permite razonar, por lo que solo son comparables bajo su protocolo común. Comparativas con modelos de otros editores (Qwen, Llama, etc.) no disponibles.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 33B pero safetensors contiene 21.440.986.112 parámetros; conviene verificar qué cifra corresponde a la realidad del checkpoint antes de planificar capacidad.
- Requisito de hardware NVFP4: solo verificado en RTX PRO 6000 Blackwell (sm_120); no hay garantías en otras GPUs, y Hopper/Ampere no ejecutan W4A4 en NVFP4.
- Contexto no validado más allá de 32 K: aunque la ventana del modelo base es de 524.288 tokens, el autor no midió el comportamiento de las capas cuantizadas en contextos largos.
- Deriva apreciable: +38,9×10⁻³ nats/token y 95,1 % de acuerdo top-1 frente a BF16; para cargas donde la fidelidad máxima importe, la variante FP8 (+5,95) es más conservadora.
- Ligera pérdida en conocimiento (88,9 vs 89,7) y tool calling (79,0 vs 80,8) respecto a BF16.
- Sin datos de benchmarks públicos estándar ni de entrenamiento del modelo base; la evaluación de calidad depende del protocolo propio del autor.
- Sesgos y riesgo de alucinación: no hay información específica publicada; al tratarse de un LLM generativo, deben aplicarse las salvaguardas habituales (verificación de hechos, supervisión en producción).
- Despliegue ligado a vLLM: el formato compressed-tensors NVFP4/FP8 no es compatible con llama.cpp u Ollama, lo que reduce la flexibilidad de despliegue.
- Descargas muy bajas (165) y proyecto reciente: menor madurez comunitaria y menos validación por terceros.

## Enlaces

- Modelo cuantizado: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-mixed-NVFP4-FP8
- Modelo base BF16: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante FP8 del mismo autor: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-FP8
- Variante NVFP4 del mismo autor: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-NVFP4
- Web del autor: https://primitive.com
- Paper, blog o repositorio de código: no disponible
