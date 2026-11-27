# maternion/Spark-X2.6-1.7B-FP8-GGUF

## Resumen

Spark-X2.6-1.7B-FP8-GGUF es la conversión no oficial a formato GGUF del checkpoint FP8 Spark-X2.6-1.7B-FP8, publicado por el usuario maternion a partir del modelo original de XHToken. Se trata de un modelo de generación de texto de 1.708.230.656 parámetros (aproximadamente 1,7 mil millones) que conserva los pesos en formato `F8_E4M3` con sus escalas originales por canal de salida, sin dequantizar ni recuantizar. El resultado es una copia fiel al formato de pesos del modelo FP8 publicado, con un tamaño de fichero de 1,85 GiB y unos 9,3 bits por peso.

La relevancia de esta ficha radica en su enfoque técnico de conversión: en lugar de aplicar una cuantización de 8 bits sobre el modelo BF16, el autor reempaqueta directamente los tensores FP8 y sus escalas `F32` asociadas, de modo que llama.cpp las aplica en inferencia mediante `ggml_mul_mat_ext`. Esto exige una versión de llama.cpp igual o posterior al commit `a38695013`, que introduce el soporte de escalas de cuantización para FP8 y NVFP4.

El modelo está pensado para generación de texto conversacional en inglés y chino, con licencia Apache 2.0, y es adecuado para despliegues en CPU, CUDA/HIP (ROCm) y Metal. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Spark-X2.6; detalles no disponibles) |
| Parámetros totales | 1.708.230.656 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (`F8_E4M3`) con escalas `F32` por canal de salida; ~9,3 bpw |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (366 tensores: 140 `F8_E4M3`, 140 escalas `F32`, normas `F32`, embeddings y tensores pequeños en `BF16`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Spark-X2.6-1.7B más allá de que se trata de un transformer de 1,7 mil millones de parámetros. El proceso de conversión sí revela algunos detalles estructurales: el modelo emplea una proyección de atención fusionada almacenada como `self_attn.q_k_v_proj.weight`, así como una proyección `g_proj` que el conversor renombra a `attn_gate`, lo que sugiere un esquema de atención con compuerta. El checkpoint original usa `quant_method: compressed-tensors` con `weight_scale` de forma `[n_out, 1]`, es decir, escalado por canal de salida y no por bloques de 128×128.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card original reproducida está truncada en la sección de introducción, por lo que no se puede confirmar ninguna innovación técnica de entrenamiento. La innovación destacable de esta publicación concreta es la preservación del formato FP8 en GGUF: el conversor `convert_hf_to_gguf.py` con `--outtype auto` conserva el FP8 soportado, y el autor añadió dos métodos (`_map_fp8_weight_names()` y `_transform_fp8_scale()`) al conversor `spark2_5.py` para que el pase FP8 localizase el tensor fusionado y preservase las escalas por fila. Sin esas adiciones, el conversor no falla, sino que descarta silenciosamente las escalas y escribe un fichero BF16; por eso el autor verificó los tipos de tensor leyendo el GGUF con `GGUFReader`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Inferencia en CPU, CUDA/HIP (ROCm) y Metal mediante llama.cpp.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales ligeros en inglés y chino: el modelo puede gestionar diálogos multi-turno con un consumo de memoria reducido (1,85 GiB en disco y aproximadamente 2 GB de VRAM/RAM en FP8), lo que lo hace adecuado para entornos con recursos limitados.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ejecutarse en CPU mediante llama.cpp, permite integrar un chatbot en herramientas internas de desarrollo sin infraestructura de aceleración.
- Prototipado rápido de aplicaciones de texto: su tamaño compacto y su licencia Apache 2.0 facilitan la experimentación y la integración en pipelines de CI/CD para pruebas de generación automática.
- Procesamiento de texto bilingüe en backends de documentación: puede emplearse para resumir o reformular contenido en inglés y chino en herramientas de gestión del conocimiento.
- Inferencia en GPU de consumo con CUDA o Metal: gracias al soporte de escalas FP8 en llama.cpp, se puede desplegar en tarjetas consumer con una huella de memoria muy baja para tareas de generación de texto en tiempo real.
- Evaluación comparativa de formatos de cuantización: el fichero sirve como referencia de ~8 bpw para comparar la calidad de versiones K-quant o i-quant del mismo modelo, publicadas por el mismo autor en `maternion/Spark-X2.6-1.7B-i-GGUF`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos FP8 (1,85 GiB) más la memoria de contexto y overhead de llama.cpp; el consumo exacto depende de la longitud de contexto configurada.
- GPU recomendadas: no se especifican modelos concretos; el autor indica compatibilidad con backends CUDA, HIP (ROCm) y Metal.
- Cabe en GPU de consumo: sí, por el tamaño reducido del fichero; cualquier GPU consumer con al menos 2-3 GB de VRAM disponible debería poder cargarlo, aunque no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (compilación con `-DGGML_CUDA=ON` o `-DGGML_HIP=ON` según el backend), con los binarios `llama-cli` y `llama-perplexity`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles.
- Advertencia de backend: Vulkan todavía no aplica las escalas (ggml-org/llama.cpp#29791) y recurre a CPU para estos tensores, por lo que se recomienda usar builds ROCm, CUDA o Metal en GPU.
- Requisito de versión: llama.cpp en o posterior al commit `a38695013` (PR #28898, fusionado el 2026-11-27). Versiones anteriores fallan con `check_tensor_dims: tensor 'blk.0.attn_output.scale' has wrong shape; expected 1, got 2048, 1, 1, 1`.
- El fichero no se puede recuantizar con `llama-quantize`, ya que `F8_E4M3` es un tipo de almacenamiento con escalas externas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-FP8-GGUF (este) | 1,7 B | No disponible | GGUF FP8 con escalas | Apache 2.0 | Hugging Face (maternion) |
| Spark-X2.6-1.7B-FP8 (original) | 1,7 B | No disponible | Safetensors FP8 | Apache 2.0 | Hugging Face (XHToken) |
| Spark-X2.6-1.7B-i-GGUF | 1,7 B | No disponible | GGUF K-quant / i-quant | Apache 2.0 | Hugging Face (maternion) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor declara explícitamente que no está afiliado ni respaldado por XHToken.
- Requiere una versión muy concreta de llama.cpp (commit `a38695013` o posterior); builds anteriores fallan o no reconocen el tipo de tensor.
- El backend Vulkan no aplica las escalas FP8 y recurre a CPU, lo que degrada el rendimiento en GPU con ese backend.
- El fichero no es apto como entrada para `llama-quantize`; debe usarse como referencia de ~8 bpw.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No se dispone de información sobre sesgos, riesgo de alucinación, límites de contexto ni comportamiento en producción.
- La model card original está truncada, por lo que no se pueden verificar detalles de entrenamiento, alineación ni evaluación.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversión de un modelo de terceros conviene revisar las condiciones del modelo base original.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/maternion/Spark-X2.6-1.7B-FP8-GGUF
- Modelo base FP8 original: https://huggingface.co/XHToken/Spark-X2.6-1.7B-FP8
- Versión K-quant / i-quant del mismo modelo: https://huggingface.co/maternion/Spark-X2.6-1.7B-i-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte de escalas FP8 y NVFP4 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28898
- Issue de soporte de escalas en Vulkan: https://github.com/ggml-org/llama.cpp/issues/29791
- Slack de XHToken: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de XHToken: https://discord.gg/kTDE2Hg8aw
- YouTube de SparkLLM: https://www.youtube.com/@SparkLLM
- dev.to de SparkLLM: https://dev.to/sparkllm
- Bluesky de SparkLLM: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter) de SparkLLM: https://x.com/sparkllm
- Zhihu de SparkLLM: https://www.zhihu.com/people/zhiikz7qh7m
