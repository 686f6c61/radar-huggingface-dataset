# defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-FP8

## Resumen

PseudoBrain-Qwen3-Coder-30B-A3B-FP8 es una variante del modelo Qwen3-Coder-30B-A3B-Instruct de Alibaba, publicada por el desarrollador independiente Ian Kurt Galeon (defnoteatin) bajo licencia Apache 2.0. El modelo parte del checkpoint FP8 oficial de Qwen y le aplica la arquitectura propietaria "PseudoBrain" (clase `PB27Qwen3MoeForCausalLM`), que sustituye las capas de atención completa por una combinación de atención deslizante de 16K tokens, un Gated DeltaNet paralelo con estado recurrente de tamaño fijo y un sistema de memoria exacta por páginas denominado Quest. El objetivo declarado es habilitar contextos de hasta 1.048.576 tokens con un consumo de memoria de caché KV prácticamente constante, reduciendo el KV cache de aproximadamente 192 GB a unos 3,1 GB a 1M de tokens (un 98,4 % de reducción).

Se trata de un modelo MoE con 30.784.864.128 parámetros totales y aproximadamente 3.300 millones de parámetros activos por token (A3.3B según el autor), orientado a generación de código, flujos agénticos y razonamiento multi-paso sobre repositorios o documentos extensos. La relevancia actual reside en que ataca el cuello de botella clásico del serving de contexto largo: el coste lineal del KV cache y el coste cuadrático del prefill, que obligan a OOM incluso cuando los pesos del modelo caben holgadamente en la GPU.

El modelo se distribuye en formato safetensors FP8 y depende de un plugin externo de vLLM (`pb27_vllm`) instalable desde GitHub; no funciona con el runtime estándar de vLLM ni con llama.cpp sin ese complemento. La ficha se basa exclusivamente en la información publicada en HuggingFace y en el repositorio del autor; no hay resultados de benchmarks independientes disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrida: atención deslizante de 16K + Gated DeltaNet paralelo + memoria exacta Quest por páginas (48 capas) |
| Parametros totales | 30.784.864.128 |
| Parametros activos | ~3.300 millones (A3.3B, según el autor) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (este repo); el autor publica además ediciones W4A16, NVFP4 y BF16 |
| Idiomas soportados | No disponible (heredados de Qwen3-Coder, sin listado explícito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), librería vLLM |

## Arquitectura y entrenamiento

La arquitectura base es el transformer MoE de Qwen3-Coder-30B-A3B-Instruct, con 48 capas y enrutamiento disperso que activa aproximadamente 3.300 millones de parámetros por token. Sobre esa base, el autor aplica la modificación PseudoBrain: las 48 capas de atención completa ilimitada se convierten en atención deslizante de 16.384 tokens combinada con un Gated DeltaNet paralelo cuyo estado recurrente es de tamaño fijo O(1), independientemente de si el contexto es de 4K o de 1M de tokens. En las capas ancla dispersas se añade un mecanismo de memoria exacta Quest de tres niveles (NVMe, page cache y HBM) que atiende sobre cuatro sinks de StreamingLLM, hitos de superbloques, las top-k páginas de memoria exacta y la ventana deslizante de 16.384 tokens, fusionando resultados mediante FlashAttention-2 con LSE-merge.

El autor describe además un esquema de RoPE por bloques estrictamente no solapados (`_reposition_rope_blocks`) que asigna un pie de 64 tokens por bloque recuperado y escala las distancias históricas de forma proporcional, con el objetivo de preservar la continuidad local y evitar el solapamiento de fase entre bloques no adyacentes, manteniendo según el autor más del 99 % de fidelidad en la distancia macro de la línea temporal a 1M de tokens sin degradación de YaRN estático. También se incluye una agregación global densa que detecta consultas globales de alta participación y activa resúmenes residentes de superbloques (un token de resumen por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working set en decodificación con rotación por novedad. La decodificación desacopla el presupuesto de recuperación del prefill del presupuesto constante de decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo no se reentrena: se deriva por modificación arquitectónica y cuantización a FP8 del checkpoint Qwen3-Coder-30B-A3B-Instruct-FP8.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, heredada de Qwen3-Coder-30B-A3B-Instruct.
- Razonamiento multi-paso y flujos agénticos sobre contextos muy largos (hasta 1M de tokens).
- Tool calling y function calling: el quickstart del autor activa `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Capacidad de procesar repositorios completos, documentación extensa o historiales de conversación de cientos de miles de tokens en una sola ventana.
- Decodificación con memoria constante: el estado recurrente del Gated DeltaNet no crece con el contexto.
- Recuperación de memoria exacta por páginas con atención dispersa sobre bloques históricos.
- Capacidades multilingües: no detalladas en la información disponible; heredadas del modelo base Qwen3-Coder.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: el modelo puede ingerir un monorepo de cientos de miles de tokens en una sola pasada y responder preguntas de arquitectura, dependencias o impacto de cambios, gracias a la ventana de 1M de tokens y al KV cache reducido a unos 3,1 GB.
- Agentes de codificación autónomos: con tool calling activado y contexto largo, puede mantener el estado de una tarea multi-paso (leer ficheros, editar, ejecutar tests) sin truncar el historial, lo que reduce la pérdida de información entre iteraciones.
- Asistentes de revisión de código en CI/CD: integrado como servicio OpenAI-compatible en vLLM, puede revisar diffs grandes o PRs completos con el contexto del repositorio, usando el parser `qwen3_coder` para invocar herramientas de análisis estático.
- Despliegue on-premise en una sola GPU de 24-48 GB: la edición FP8 ocupa unos 31 GB de pesos y unos 35 GB totales a 1M de tokens, por lo que cabe en una RTX 5090, L40S o A100, permitiendo servir contexto largo sin clúster multi-GPU.
- Migración y refactorización de bases de código legacy: el modelo puede mantener simultáneamente el fichero original, los tests y la documentación de la API en contexto, lo que facilita refactors coherentes a gran escala.
- Atención al cliente técnica sobre documentación extensa: con 1M de tokens puede incluir manuales, FAQs y transcripciones históricas en el prompt sin recuperación externa, manteniendo el KV cache acotado.
- Investigación sobre razonamiento de largo alcance: útil para experimentos que requieren correlacionar información distribuida a lo largo de cientos de miles de tokens, donde los transformers estándar agotan memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un directorio `reports/` en su repositorio de GitHub con "benchmark receipts", pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones en la información proporcionada. Las únicas métricas citadas son de eficiencia de memoria: reducción del KV cache del 98,4 % (de 192 GB a ~3,1 GB a 1M de tokens) y consumo total de VRAM de ~35 GB a 1M de tokens en FP8.

## Requisitos de hardware

- VRAM estimada en FP8: ~31 GB de pesos y ~35 GB totales a 1M de tokens según el autor.
- Ediciones alternativas del mismo autor: W4A16 (~16,5 GB de pesos, ~20,5 GB totales a 1M), NVFP4 (~16,5 GB / ~20,5 GB) y BF16 (~61 GB / ~65 GB).
- GPU recomendadas para FP8: RTX 5090 (32 GB), L40S (48 GB), A100, H100, DGX Spark y AMD MI300X.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con FP8; en RTX 3090/4090 de 24 GB solo con las ediciones W4A16 o NVFP4.
- Despliegue: exclusivamente vLLM con el plugin `pb27_vllm` (soporte de runners V1 y V2). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Configuración de serving sugerida por el autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Latencia y throughput: no disponibles. El autor afirma decodificación de velocidad constante O(1) gracias al presupuesto fijo de decode, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-30B-A3B-FP8 | 30,8B totales / ~3,3B activos | 1M | Apache 2.0 | safetensors FP8 + plugin vLLM | KV cache ~3,1 GB a 1M; requiere `pb27_vllm` |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,8B totales / ~3,3B activos | 256K nativo (extensible) | Apache 2.0 | safetensors, GGUF, AWQ, FP8 | Sin modificación arquitectónica; KV cache lineal con el contexto |
| Qwen3-Coder-30B-A3B-Instruct-FP8 | 30,8B totales / ~3,3B activos | 256K nativo | Apache 2.0 | safetensors FP8 | Checkpoint oficial de Qwen; compatible con vLLM estándar |
| Modelos densos de ~30B con contexto largo (p. ej. familia Qwen3-32B) | ~32B densos | 128K-256K | Apache 2.0 u otras | safetensors, GGUF | Mayor coste de VRAM por token activo y KV cache lineal |

La comparación directa con alternativas de contexto de 1M (como variantes de Llama o Gemini) no está disponible en la información proporcionada. El principal diferenciador frente al Qwen3-Coder base es la reducción del KV cache y la ventana extendida a 1M, a costa de depender de un plugin externo y de una arquitectura modificada no validada de forma independiente.

## Limitaciones y advertencias

- El modelo requiere el plugin `pb27_vllm` instalado desde GitHub; no funciona con vLLM estándar, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y añade dependencia de un repositorio de un único autor.
- La arquitectura PseudoBrain es una modificación propietaria no revisada por pares; las afirmaciones de fidelidad del 99 % en distancias a 1M de tokens y de decodificación O(1) provienen del propio autor y no están verificadas de forma independiente.
- No hay benchmarks públicos de calidad (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible, por lo que el impacto de la modificación arquitectónica sobre la calidad del modelo base es desconocido.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3-Coder.
- Idiomas soportados: no listados explícitamente; la cobertura multilingüe depende del checkpoint Qwen3-Coder original.
- La licencia Apache 2.0 permite uso comercial, pero el uso en producción depende de la estabilidad del plugin y de su compatibilidad con versiones futuras de vLLM (el autor menciona soporte V1/V2 y un fallback sin hooks).
- El modelo se distribuye en FP8; las ediciones W4A16 y NVFP4 pueden degradar ligeramente la calidad respecto a BF16, sin datos publicados al respecto.
- El repositorio tiene muy pocas descargas (28) y ningún "like" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- El uso de `--enforce-eager` y la desactivación de prefix caching en la configuración recomendada pueden reducir el throughput en cargas con prompts repetidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-FP8
- Repositorio GitHub del proyecto PseudoBrain: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
- Modelo base AWQ 4-bit: https://huggingface.co/cyankiwi/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit
- Modelo base NVFP4: https://huggingface.co/NVFP4/Qwen3-Coder-30B-A3B-Instruct-FP4
