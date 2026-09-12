# alimpfard/qwen3.8-27b-kv-approximation

## Resumen

`alimpfard/qwen3.8-27b-kv-approximation` no es un modelo de lenguaje autonomo, sino un proyector de 931,2 millones de parametros (931.226.368, segun los pesos en safetensors) disenado para aproximar la mitad de las capas de procesamiento de prompt de Qwen3.8-27B. Concretamente, durante la fase de prefill el motor ejecuta las capas 0 a 31 del modelo base de forma exacta y este proyector mapea el residual de la capa 31 de cada token hacia las entradas de los token-mixers de las 32 capas restantes (24 capas gated-DeltaNet y 8 capas de atencion completa), evitando su computo completo. El resultado medido es una mejora de rendimiento en prefill de entre 1,53x y 1,58x a cambio de un incremento de perplejidad de aproximadamente un 4,5-4,6%.

El repositorio contiene unicamente los tensores del proyector (`kva.*`, ~0,5 GB), que deben fusionarse en cualquier GGUF de Qwen3.8-27B mediante el script de merge proporcionado por el autor. Se distribuye bajo licencia Apache 2.0 y su relevancia actual radica en que ataca un cuello de botella concreto (el coste de prefill con prompts largos) sin requerir reentrenar ni modificar el modelo base, a costa de una degradacion de calidad acotada y documentada.

El autor cita como inspiracion el articulo de blog de nowokay y la particion causal encoder-decoder de DeepSeek-V4.1-Flash. La evaluacion publicada cubre exclusivamente prosa en ingles y un fichero de codigo Python, con prompts de 1536 tokens y continuaciones de 512, y el modelo no tiene descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector: RMSNorm -> Linear (5120 -> 2560) -> 3 bloques transformer causales -> RMSNorm -> cabecera Linear; cada bloque con 20 cabezas de 128 dimensiones y FFN SwiGLU de 7080. Modelo base: Qwen3.8-27B, hibrido de 64 capas (48 gated-DeltaNet y 16 de atencion completa) |
| Parametros totales | 931.226.368 (931,2 M) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible para el modelo base; el proyector se entreno con secuencias de hasta 3072 tokens y se evaluo con 1536 tokens de prompt mas 512 de continuacion |
| Tipos de cuantizacion | Proyector: q8_0 y q4_0 (ambos evaluados). Modelo base evaluado en Q4_K_M |
| Idiomas soportados | no disponible (la evaluacion solo cubre prosa en ingles y codigo Python) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tensores `kva.*`); safetensors reportado para el recuento de parametros |

## Arquitectura y entrenamiento

El proyector opera sobre la representacion residual de la capa 31 del modelo base. Para cada token predice las entradas de los token-mixers de las capas tardias: en las 24 capas gated-DeltaNet predice la salida de `in_proj_qkv` (q, k, v antes de conv y SiLU), `in_proj_a` y `in_proj_b`, con dimensiones 10240 + 48 + 48; en las 8 capas de atencion completa predice las salidas de `k_proj` y `v_proj` (antes de k_norm y RoPE), con dimensiones 1024 + 1024. A continuacion el motor aplica actualizaciones de estado baratas (conv + SiLU, normalizacion L2, scan de DeltaNet, y k_norm + RoPE + escritura en cache KV para las capas de atencion) y ejecuta el ultimo token de cada ubatch por las capas tardias para producir logits exactos sobre el contexto aproximado.

El proyector en si es una red relativamente pequena: una RMSNorm de entrada, una proyeccion lineal de 5120 a 2560, tres bloques transformer causales (20 cabezas de 128 dimensiones, FFN SwiGLU de 7080), una RMSNorm de salida y una cabecera lineal. La ronda 2 de entrenamiento (esta publicacion) uso 34 millones de tokens, con una secuencia de como maximo 3072 tokens por paso durante 36.000 pasos. La composicion del dataset, muestreada por numero de secuencias, fue: 24,7k secuencias (16M tokens) del split de codigo y aplicado de `Manusagents/GPT-5.5-...-Distillation-Dataset`; 11,5k secuencias (12M tokens) del split canonico con herramientas de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`; 2,0k secuencias (6M tokens) de `Salesforce/wikitext` (wikitext-103-raw-v1, train); y 47 secuencias (0,07M tokens) de `mondk/GptModel-CoT`. No se documenta uso de RLHF ni DPO en el proyector.

## Capacidades

- No genera texto de forma autonoma: es un modulo de aproximacion del prefill que debe fusionarse con un GGUF de Qwen3.8-27B para funcionar.
- Acelera el procesamiento de prompts largos: entre 1,53x y 1,58x en prefill segun las mediciones publicadas.
- Predice las proyecciones internas de 32 capas tardias (24 gated-DeltaNet y 8 de atencion completa) a partir del residual de la capa 31.
- Mantiene la coherencia de logits del modelo base en la practica: 91,3% de coincidencia top-1 voraz en prosa de Wikitext-103 y 93,8% en codigo Python.
- Compatible con variantes cuantizadas y abliteradas de Qwen3.8-27B, siempre que conserven la arquitectura base.
- Soporta dos niveles de cuantizacion propios (q8_0 y q4_0) con impacto practicamente nulo en la calidad medida.
- Hereda las capacidades de generacion, razonamiento y codigo del modelo base, que no se documentan de forma especifica en esta ficha.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking a nivel del proyector.

## Casos de uso

- Servicios de chat con prompts largos: al reducir el tiempo de procesamiento inicial, disminuye el time-to-first-token en asistentes conversacionales que arrastran historiales extensos o contexto recuperado de un RAG, manteniendo los logits exactos generados por el modelo base.
- Despliegue de Qwen3.8-27B en hardware modesto: con 2x Titan Xp (Pascal sm61) el prefill pasa de 256 a 404 tok/s, lo que hace viable servir el modelo en GPUs antiguas donde el prefill completo seria prohibitivo.
- Procesamiento por lotes de documentos: en tareas de resumen, clasificacion o extraccion sobre corpus extensos, el ahorro de prefill se multiplica por el numero de documentos procesados en cada lote.
- Asistencia de codigo sobre repositorios grandes: el autor mide 93,8% de coincidencia top-1 en un fichero Python retenido, por lo que es adecuado para pipelines de autocompletado o revision que necesitan inyectar mucho codigo de contexto antes de generar.
- Investigacion sobre aproximacion de KV y compresion de estado: sirve como referencia reproducible para estudiar el compromiso entre coste de prefill y degradacion de perplejidad, con una implementacion abierta en llama.cpp.
- Evaluacion de infraestructura de inferencia: util para medir el impacto real del prefill en un pipeline llama.cpp antes de invertir en GPUs mas potentes, ya que el incremento de velocidad esta cuantificado en dos configuraciones distintas.
- Recuperacion aumentada con contexto largo: escenarios donde la latencia de admision del prompt domina el coste total, como busqueda semantica sobre documentacion tecnica, se benefician directamente del recorte del 30-60% en tiempo de prefill.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre texto retenido, cortado en ventanas de 1536 tokens de prompt mas 512 de continuacion. El prompt se prellena de forma exacta o con KVA, y la continuacion se fuerza a traves del modelo exacto sobre esa cache.

| Metrica | Exacto | KVA | Delta |
|---|---|---|---|
| Perplejidad de continuacion, Wikitext-103 | 5,949 | 6,214 | +4,5% |
| Perplejidad de continuacion, codigo Python | 2,109 | 2,207 | +4,6% |
| Coincidencia top-1 voraz, Wikitext | - | 91,3% | - |
| Coincidencia top-1 voraz, codigo | - | 93,8% | - |
| Prefill, ubatch 1024, RTX Pro 4500 | 1753 tok/s | 2684 tok/s | 1,53x |
| Prefill, ubatch 1024, 2x Titan Xp (layer-split) | 256 tok/s | 404 tok/s | 1,58x |

Configuracion: motor llama.cpp, base Q4_K_M, 24 ventanas, proyector q8_0. Mediciones adicionales de cuantizacion del proyector con atencion flash (base Q4_K_M, RTX Pro 4500, 12 ventanas, `-c 4096`):

| Proyector | Tamano de fichero | ppl wiki | ppl codigo | Prefill ub 1024 |
|---|---|---|---|---|
| q8_0 | 990 MB | 6,0253 | 2,3087 | 2659 tok/s |
| q4_0 | 525 MB | 6,0304 | 2,3113 | 2638 tok/s |

El autor situa la perdida de calidad como equivalente a bajar de Q4_K_M a UD-Q3_K_XL. Como referencia de escala, `llama-perplexity` reporta ratios de ppl de 1,007 (Q4_K_M), 1,003 (UD-IQ4_XS), 1,034 (UD-IQ3_XXS) y 1,055 (Q3_K_M) sobre wikitext con fragmentos de 2k tokens y 40 fragmentos, aunque con un protocolo distinto al de la tabla anterior. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM adicional del proyector: 990 MB en q8_0 o 525 MB en q4_0, que se suman a la VRAM ocupada por el GGUF de Qwen3.8-27B, cuyo requisito concreto no se detalla en la informacion proporcionada.
- El autor recomienda q4_0 porque libera unos 400 MB de VRAM sin impacto apreciable en calidad ni en rendimiento (2638 frente a 2659 tok/s).
- GPUs verificadas: RTX Pro 4500 (Blackwell sm120) y 2x Titan Xp con reparto por capas (Pascal sm61).
- Solo se ha probado en CUDA; no hay validacion documentada en ROCm, Metal, Vulkan ni CPU.
- Despliegue: llama.cpp, usando la rama `kva` del fork del autor, que es la implementacion de referencia capaz de leer y usar los tensores `kva.*`. Requiere fusionar previamente el proyector en un GGUF de Qwen3.8-27B con el script de merge incluido.
- Throughput medido en prefill con ubatch 1024: 2684 tok/s en RTX Pro 4500 y 404 tok/s en 2x Titan Xp.
- El proyector atiende sobre todo el ubatch, por lo que su comportamiento con ubatch superiores a 1024 no esta probado.

## Comparativa con modelos similares

No existen en la informacion proporcionada modelos directamente comparables, ya que este artefacto no es un LLM sino un modulo de aproximacion ligado a una arquitectura concreta. La comparacion natural es contra el propio Qwen3.8-27B sin el proyector.

| Configuracion | Parametros | Prefill (RTX Pro 4500, ub 1024) | ppl wiki | ppl codigo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B exacto (base Q4_K_M) | 27B aprox. (no confirmado en la informacion) | 1753 tok/s | 5,949 | 2,109 | no disponible |
| Qwen3.8-27B + KVA (q8_0) | 27B + 931,2 M | 2684 tok/s | 6,214 | 2,207 | apache-2.0 (proyector) |
| Qwen3.8-27B + KVA (q4_0) | 27B + 931,2 M | 2638 tok/s | 6,0304 | 2,3113 | apache-2.0 (proyector) |

Como referencias arquitectonicas citadas por el autor, DeepSeek-V4.1-Flash emplea una particion causal encoder-decoder, y el articulo de nowokay describe un enfoque de aproximacion similar; no se dispone de especificaciones ni resultados de estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad se midio unicamente sobre prompts de 1536 tokens de prosa inglesa y codigo Python; otros dominios, otros idiomas y prompts mucho mas largos no estan probados.
- El proyector atiende sobre todo el ubatch, por lo que su comportamiento con ubatch superiores a 1024 tampoco esta verificado.
- Solo aplica a la arquitectura base de Qwen3.8-27B; las variantes cuantizadas y abliteradas son compatibles, pero otras modificaciones estructurales no.
- Solo se ha probado en CUDA (Blackwell sm120 y Pascal sm61); no hay evidencia de funcionamiento en otros backends.
- La degradacion de perplejidad del 4,5-4,6% es inherente al metodo y puede ser inaceptable en tareas que exijan maxima fidelidad, como generacion de codigo critico o razonamiento matematico de varios pasos.
- No se publican evaluaciones de sesgo, toxicidad ni alucinacion; el proyector hereda el comportamiento del modelo base en esos aspectos y no los corrige.
- El repositorio pesa 1,5 GB aunque el proyector ocupa aproximadamente 0,5 GB, por lo que conviene verificar el contenido real antes de descargar.
- La licencia Apache 2.0 cubre el proyector, pero el uso comercial del conjunto depende tambien de la licencia de Qwen3.8-27B, no detallada en la informacion proporcionada.
- Estado de validacion minimo: cero descargas y cero valoraciones, sin pruebas independientes que reproduzcan las cifras del autor.
- Requiere compilar o usar la rama `kva` del fork de llama.cpp del autor, lo que implica mantenimiento fuera de la linea principal del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alimpfard/qwen3.8-27b-kv-approximation
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Implementacion de referencia en llama.cpp (rama `kva`): https://github.com/alimpfard/llama.cpp/tree/kva
- Articulo de blog de nowokay: https://nowokay.hatenablog.com/entry/2026/09/11/120001
- Dataset Manusagents/GPT-5.5-Gemini-3.1-Pro-Grok-4-Claude-Fable-5-Mythos-5-Qwen-3.7-Max-and-more-Distillation-Dataset: https://huggingface.co/datasets/Manusagents/GPT-5.5-Gemini-3.1-Pro-Grok-4-Claude-Fable-5-Mythos-5-Qwen-3.7-Max-and-more-Distillation-Dataset
- Dataset r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset mondk/GptModel-CoT: https://huggingface.co/datasets/mondk/GptModel-CoT
