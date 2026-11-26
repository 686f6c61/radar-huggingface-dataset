# nchapman/Ternary-Bonsai-2-4B-warp34

## Resumen

Ternary-Bonsai-2-4B-warp34 es una conversión cuantizada a 5 trits (ternario empaquetado, 1,75 bits por peso) del modelo prism-ml/Ternary-Bonsai-2-4B-mlx-2bit, un modelo denso de 4B parámetros de tipo vision-language basado en la arquitectura Qwen3_5ForConditionalGeneration (híbrida GatedDeltaNet + atención completa). Lo desarrolla el usuario nchapman como trabajo de cuantización post-entrenamiento (PTQ), manteniendo la torre de visión en W4A16-HGPTQ y una cabeza de borrador MTP nativa. El resultado ocupa 1,32 GB en un único shard de safetensors, lo que lo hace extremadamente compacto para despliegue en memoria reducida.

El modelo resuelve el problema de ejecutar un modelo multimodal de 4B parámetros en entornos con restricciones severas de VRAM, preservando supuestamente la paridad bit a bit con la representación ternaria original (W2A16). Es relevante ahora porque combina tres tendencias: cuantización extrema por debajo de 2 bits por peso, arquitecturas híbridas con estado (GatedDeltaNet) y decodificación especulativa nativa mediante MTP (multi-token prediction).

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; no se dispone de datos de benchmarks, idiomas ni evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration: transformer denso híbrido GatedDeltaNet + atención completa, con torre de visión y cabeza MTP nativa |
| Parametros totales | 2.436.965.888 (2,44B según safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trunk, embeddings y lm_head en PTQ1_0 5-trit (1,75 bpw, group_size=128); torre de visión en W4A16-HGPTQ (g64-h64, linear_fc2 h16); cabeza MTP en W8_g64 y W4_g64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único shard, 1,3 GB), con pesos empaquetados `weight_5trit` (uint8), escalas FP16 nativas y metadatos en config.json |

## Arquitectura y entrenamiento

El modelo base es un transformer denso híbrido que combina capas GatedDeltaNet (atención lineal con estado recurrente) con capas de atención completa, bajo la clase Qwen3_5ForConditionalGeneration. La cuantización realizada por nchapman aplica PTQ1_0 a 202 tensores del tronco lingüístico, embed_tokens y lm_head: cada bloque de 128 pesos se empaqueta en 26 bytes de trits (uint8) más 2 bytes de escala FP16 nativa, lo que da 1,75 bpw. Se aplica una rotación Hadamard normalizada (Sylvester, H_512, factor 1/22) en bloques de 512 para estabilizar la cuantización, con reglas de transformación específicas para `o_proj`, `out_proj`, `embed_tokens` y `lm_head`.

La torre de visión (98 capas lineales) se cuantiza con W4A16-HGPTQ (grupos de 64 con Hadamard de 64, y Hadamard de 16 en `linear_fc2`). La cabeza de borrador MTP nativa se mantiene en W8_g64 (mtp.fc) y W4_g64 (mtp.layers.0), compartiendo el lm_head rotado mediante un `mtp.norm` con signos plegados. El autor declara verificación de paridad bit a bit de los trits (202/202 tensores) frente a la representación W2A16 original. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional (pipeline image-text-to-text, etiqueta conversational).
- Procesamiento de imagen y texto combinados (vision-language), gracias a la torre de visión cuantizada en W4A16.
- Razonamiento multi-paso mediante decodificación especulativa con cabeza MTP nativa (borrador de tokens).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking: no disponible.
- Audio: no soportado según la información disponible.

## Casos de uso

- Despliegue en GPUs de consumo con poca VRAM: con 1,32 GB de pesos, el modelo cabe en GPUs de 4-6 GB (por ejemplo, RTX 3050, GTX 1660) para prototipos de visión-lenguaje, aunque el rendimiento real dependerá de kernels compatibles con el formato 5-trit.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un modelo 4B multimodal al pasar a 1,75 bpw, comparando con la versión MLX 2-bit original.
- Experimentos de decodificación especulativa: la cabeza MTP nativa permite medir aceleraciones de decodificación en pipelines de investigación sin necesidad de un modelo borrador separado.
- Asistentes multimodales en dispositivos edge: al ocupar menos de 1,5 GB, puede integrarse en entornos con memoria limitada para tareas de captioning o VQA simple, siempre que exista runtime compatible con `warp34`.
- Validación de kernels y formatos: útil para desarrolladores que implementen decodificadores base-3 branchless (5 trits por byte) y verifiquen paridad bit a bit con W2A16.
- Reproducción académica de técnicas PTQ1_0 + Hadamard: el modelo documenta explícitamente las reglas de transformación, lo que facilita replicar el pipeline en otros modelos Qwen3_5.
- Prototipado de pipelines image-text-to-text con `transformers`: al estar etiquetado como `endpoints_compatible`, puede probarse en infraestructuras de inferencia estándar una vez implementado el contrato de kernel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,32 GB; con overhead de activaciones, KV cache y torre de visión, se estima un mínimo práctico de 3-4 GB, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores; también en A100/H100 para despliegues de investigación.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 4 GB o más de VRAM, sujeto a la disponibilidad de kernels para el formato 5-trit.
- Opciones de despliegue: `transformers` (librería declarada), con soporte de `compressed-tensors`; vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato propietario `warp34`.
- Latencia y throughput: no disponible. La cabeza MTP nativa está pensada para decodificación especulativa, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B-warp34 | 2,44B | no disponible | 5-trit (1,75 bpw) + W4A16 vision | Apache 2.0 | Hugging Face (nchapman) |
| prism-ml/Ternary-Bonsai-2-4B-mlx-2bit (base) | 4B (nominal) | no disponible | MLX 2-bit | no disponible | Hugging Face (prism-ml) |
| Modelos Qwen3_5 densos de ~4B | ~4B | no disponible | FP16/BF16/GGUF | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos multimodales de ~4B en cuantización extrema) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 1,75 bpw puede degradar la calidad respecto al modelo base; no se publican evaluaciones que cuantifiquen la pérdida.
- El formato `warp34` es propietario y requiere kernels específicos (decodificación base-3 branchless, rotación Hadamard H_512); sin ellos, el modelo no es ejecutable en runtimes estándar como vLLM o llama.cpp.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se dispone de información sobre sesgos, alucinación o robustez del modelo base ni de la cuantización.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base original (prism-ml) antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La verificación de paridad bit a bit es una afirmación del autor; no hay evaluación independiente publicada.
- El tamaño de parámetros reportado por safetensors (2,44B) difiere del "4B" nominal del nombre, lo que puede deberse a compartición de pesos o al empaquetado ternario; conviene tenerlo en cuenta al estimar requisitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Ternary-Bonsai-2-4B-warp34
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-mlx-2bit
