# ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller

## Resumen

Qwen3.8-27B-NVFP4-prefiller es un artefacto de cuantización publicado por ISTA-DASLab (Institute of Science and Technology Austria, grupo DASLab) que implementa la técnica de "cuantización desagregada" descrita en el paper arXiv:2609.26333. No es un modelo autónomo, sino un conjunto de bloques transformer cuantizados en NVFP4 que se emparejan con un decodificador GGUF de baja precisión del modelo base Qwen3.8-27B (24.350.556.160 parámetros reales según safetensors). La idea central es que las fases de prefill y decode tienen perfiles de cómputo distintos: el decode está limitado por memoria y se beneficia de pesos pequeños, mientras que el prefill está limitado por cómputo y apenas gana comprimiéndose por debajo de NVFP4, formato nativo de cómputo en Blackwell.

El repositorio contiene únicamente las proyecciones lineales del stack transformer, empaquetadas como GGUF por capa con tipo `GGML_TYPE_NVFP4`, organizadas en cuatro variantes (`IQ1_S`, `IQ1_M`, `IQ2_XXS`, `IQ2_S`) que corresponden al checkpoint de decode con el que cada una fue entrenada. El checkpoint completo ocupa 12,8 GiB y nunca se mantiene residente en VRAM: se lee desde SSD mediante un anillo de dos slots tallado en la memoria del output head, de modo que el offloading no añade memoria de dispositivo. Los embeddings, la cabeza de salida, las normas y los parámetros de convolución/estado de gated-DeltaNet se comparten con el decodificador GGUF.

Su relevancia es doble: por un lado, recupera aproximadamente el 50% de la precisión que la cuantización agresiva (IQ1/IQ2) sacrifica, con un coste de memoria prácticamente nulo; por otro, demuestra que el streaming por capas desaparece bajo el cómputo a partir de unos pocos miles de tokens, por lo que tampoco penaliza la latencia de time-to-first-token. Requiere hardware Blackwell (sm_120/121) y una build específica de llama.cpp mantenida por el propio laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas gated-DeltaNet (state-space híbrido); el artefacto contiene solo las proyecciones lineales del stack, en formato NVFP4 |
| Parametros totales | 24.350.556.160 (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escala global FP32 estática por tensor y microescalas FP8 dinámicas) para prefill; el decode usa GGUF IQ1_S, IQ1_M, IQ2_XXS o IQ2_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bloques por capa con `GGML_TYPE_NVFP4`, convención de ficheros partidos en 64 partes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención transformer con capas gated-DeltaNet, un mecanismo de espacio de estados con convolución y estado recurrente cuyos parámetros (junto con embeddings, output head y normas) permanecen en el decodificador GGUF y no se desagregan. Solo las proyecciones lineales del stack transformer se sustituyen por bloques NVFP4 entrenados específicamente para complementar cada checkpoint de decode. Cada variante (`IQ1_S`, `IQ1_M`, `IQ2_XXS`, `IQ2_S`) se entrenó contra su GGUF correspondiente, de modo que la pareja prefill/decode está acoplada y no es intercambiable arbitrariamente.

El formato NVFP4 implementado se aproxima al `compressed_tensors` de vLLM: escala global FP32 estática por tensor más microescalas FP8 dinámicas. Como el layout de bloques de ggml no reserva un slot para la escala global por tensor, esta se transporta en el KV como `odp.scale.<name>` y se aplica al resultado de la matmul (una escala escalar conmuta con el producto matricial). El checkpoint se sirve mediante un anillo de dos slots con lecturas solapadas con el cómputo de la capa anterior. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO para el modelo base.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B (no se detallan capacidades específicas en la información disponible).
- Aceleración de la fase de prefill mediante pesos NVFP4 con cómputo nativo en tensor cores FP4 de Blackwell.
- Emparejamiento automático con el decodificador: la variante de prefill se deduce del nombre del fichero GGUF del decoder.
- Streaming por capas desde SSD con solapamiento lectura/cómputo y sin coste adicional de memoria de dispositivo.
- Soporte de micro-batch configurable (`-ub`, por defecto elevado a 8192) para amortizar el streaming del checkpoint una vez por batch.
- Compatibilidad con prompts largos: a partir de unos pocos miles de tokens el coste de offloading queda oculto bajo el cómputo.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Despliegue de Qwen3.8-27B en GPU consumer Blackwell con VRAM ajustada: el decodificador IQ1/IQ2 ocupa poco y el prefill NVFP4 se streamea desde SSD, permitiendo servir un modelo de 24,3B parámetros en una RTX 50-series sin recortar la calidad del prefill.
- Recuperación de calidad en cuantizaciones extremas: aplicaciones que ya usan GGUF IQ1_S o IQ2_XXS para decode y notan degradación en tareas de razonamiento pueden añadir el prefiller correspondiente y recuperar aproximadamente el 50% de la precisión perdida sin aumentar la memoria de dispositivo.
- Servicio de chat con prompts largos: en asistentes con contexto extenso, el coste de time-to-first-token del prefill domina; el streaming por capas queda oculto bajo el cómputo a partir de unos miles de tokens, por lo que la latencia no se penaliza.
- Investigación en cuantización: el repositorio y el paper asociado permiten reproducir y extender el paradigma de cuantización desagregada, comparando variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_S sobre el mismo modelo base.
- Benchmarking de kernels FP4: útil para evaluar el rendimiento de GEMM NVFP4 en llama.cpp frente a alternativas como FlashInfer en hardware sm_120/121.
- Prototipado de inferencia híbrida state-space: sirve para estudiar la interacción entre ODP y modelos con capas gated-DeltaNet, incluyendo el ajuste de flags de caché de estado recurrente (`-cram`, `-ctxcp`) para evitar re-streaming múltiple por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas relativas cualitativas: recuperación de aproximadamente el 50% de la precisión sacrificada por la cuantización agresiva, coste de memoria de dispositivo cero para el anillo de offloading, y speedups de aproximadamente 1,3x con los kernels NVFP4 GEMM de llama.cpp (frente a speedups mayores obtenidos con kernels personalizados de FlashInfer que no se han liberado).

## Requisitos de hardware

- GPU Blackwell obligatoria: GB10 (sm_121) o RTX 50-series (sm_120). Si se fija la arquitectura manualmente debe ser `120a`/`121a`; los targets `120`/`121` planos o la familia `120f` no ensamblan el PTX de MMA FP4 con escalas por bloque.
- VRAM: el checkpoint de prefill (12,8 GiB) nunca es residente; el consumo lo determina el decodificador GGUF IQ1/IQ2 más el anillo de dos slots, que no añade memoria de dispositivo.
- Almacenamiento: se requiere SSD con suficiente ancho de banda para el streaming por capas; el repositorio completo ocupa 54,9 GB (cuatro variantes de 64 partes cada una).
- Despliegue: build específica `ISTA-DASLab/disaggregated-llama.cpp` con `-DGGML_CUDA=ON` y `-DLLAMA_BUILD_BORINGSSL=ON`; se lanza con `llama-server -ngl 99 -hf unsloth/Qwen3.8-27B-GGUF:IQ1_S --odp-blocks ISTA-DASLab/Qwen3.8-27B-disaggregated-NVFP4-prefill`.
- Latencia y throughput: no se publican cifras absolutas; el coste de streaming desaparece bajo el cómputo a partir de unos pocos miles de tokens.
- Interacción con modelos de estado: ODP puede provocar múltiples cargas SSD del modelo completo por prefill si no se ajustan los flags de caché de estado recurrente; para benchmarking se recomienda `-cram 0 -ctxcp 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller | 24,35B (base) | no disponible | Prefill NVFP4 desagregado + decode GGUF IQ1/IQ2 | Apache 2.0 | Hugging Face, requiere llama.cpp modificado y GPU Blackwell |
| unsloth/Qwen3.8-27B-GGUF | 24,35B | no disponible | Cuantización GGUF estándar (IQ1_S, IQ1_M, IQ2_XXS, IQ2_S) | Apache 2.0 | Hugging Face, llama.cpp estándar |
| vLLM `compressed_tensors` (NVFP4) | según modelo | según modelo | Cuantización NVFP4 integrada en el runtime | según modelo | vLLM |

La comparación directa con otras alternativas de la misma categoría (prefillers desagregados para otros modelos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere emparejarse con el decodificador GGUF exacto para el que fue entrenada cada variante; mezclar variantes o decodificadores distintos invalida el ajuste.
- Dependencia de hardware muy restrictiva: solo funciona en GPU Blackwell sm_120/121 con la build modificada de llama.cpp; no es desplegable en A100, H100 ni RTX 40-series.
- Los kernels NVFP4 GEMM de llama.cpp no son especialmente rápidos; el speedup publicado con la build oficial es de aproximadamente 1,3x, inferior al obtenido con kernels FlashInfer no liberados.
- Interacción no trivial con modelos de espacio de estados: pueden ejecutarse múltiples pasadas forward por fase y múltiples cargas SSD del modelo completo por prefill si no se ajustan los flags de caché recurrente.
- El checkpoint de 12,8 GiB se lee desde SSD en cada batch de prefill; un almacenamiento lento degrada directamente el time-to-first-token.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; deben evaluarse sobre el modelo base Qwen3.8-27B.
- Idiomas soportados no declarados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de una build no estándar de llama.cpp y de hardware Blackwell condiciona el soporte en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller
- Paper: https://arxiv.org/abs/2609.26333
- Repositorio de código: https://github.com/IST-DASLab/disaggregated-quantization
- Build de llama.cpp utilizada: https://github.com/ISTA-DASLab/disaggregated-llama.cpp
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
