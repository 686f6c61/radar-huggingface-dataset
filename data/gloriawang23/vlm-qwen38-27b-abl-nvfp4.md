# GloriaWang23/vlm-qwen38-27b-abl-nvfp4

## Resumen

`GloriaWang23/vlm-qwen38-27b-abl-nvfp4` es una cuantización NVFP4 (W4A4) del checkpoint abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva de la familia Qwen3.8 de Alibaba. El modelo conserva la torre de visión/vídeo y la cabeza MTP (multi-token prediction) en BF16, de modo que mantiene capacidades multimodales y decodificación especulativa nativa pese a la compresión agresiva de las capas lineales del modelo de lenguaje. La arquitectura subyacente es un transformer multimodal con etiqueta `qwen3_5` en el ecosistema de transformers.

El interés principal es práctico: empaqueta un modelo de 27.781 millones de parámetros en un repositorio de 20,6 GB y lo valida en una única RTX 5090 (Blackwell, sm120) con unos 28.944 MiB de VRAM en generación, gracias al formato NVFP4 empaquetado con `compressed-tensors` y al backend FlashInfer-CUTLASS de vLLM. Es una de las pocas publicaciones que documenta de forma reproducible el perfil de despliegue NVFP4 + MTP + VL en hardware consumer Blackwell.

La relevancia es doble: por un lado, demuestra que un modelo multimodal de ~28B puede servirse localmente en una GPU de consumo con cuantización de 4 bits en pesos y activaciones; por otro, la variante "abliterated" elimina las direcciones de rechazo del modelo original, lo que lo orienta a investigación de comportamiento y no a despliegues de producción sin revisión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con torre de visión/vídeo y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el perfil de validación usa `--max-model-len 4096` |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16) en capas lineales del LM; BF16 en torre visión/vídeo (333 tensores), MTP (15 tensores), `lm_head`, embeddings y `conv1d` de GDN; empaquetado `compressed-tensors` `nvfp4-pack-quantized` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards + `model-mtp-extra.safetensors`), índice de 2687 tensores |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.8 con torre de visión/vídeo y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa nativa mediante el método `qwen3_5_mtp` en vLLM. La cuantización se aplica exclusivamente a las capas lineales del modelo de lenguaje en formato NVFP4 W4A4 con group size 16; el resto de componentes críticos (torre visual, cabeza MTP, `lm_head`, embeddings y las `conv1d` del bloque GDN) se mantienen en BF16 para preservar calidad y estabilidad numérica.

La calibración se realizó con CNN/DailyMail 3.0.0, 20 secuencias de 8192 tokens. El autor declara explícitamente que no se injertaron pesos de variantes oficiales de Qwen, Unsloth, Blackfrost ni otras variantes de comportamiento: la torre visual y los tensores MTP provienen del mismo checkpoint Huihui en la revisión `d42ca8978c5a66e92c3446d46e8adfe03ef692ff`. No se detallan en la información disponible el número de tokens de preentrenamiento del modelo original, la composición del dataset ni las etapas de RLHF/DPO aplicadas por Qwen antes del proceso de abliteración.

## Capacidades

- Generación de texto y razonamiento multi-turno en inglés y chino.
- Procesamiento de imagen y vídeo como entrada (`image-text-to-text`), con torre visual en BF16.
- Tool calling / function calling, según los tags del repositorio.
- Razonamiento multi-paso y modos de "thinking" propios de la familia Qwen3.8 (no detallados en la model card).
- Decodificación especulativa nativa mediante cabeza MTP (`qwen3_5_mtp`, `num_speculative_tokens=3`).
- Comportamiento "abliterated": se han eliminado las direcciones de rechazo del modelo original, lo que altera las respuestas ante contenido sensible.
- Compatibilidad con endpoints OpenAI a través de vLLM (`--served-model-name`, `/v1/models`, `/v1/chat/completions`).

## Casos de uso

- Inferencia multimodal local en RTX 5090: el perfil validado (NVFP4 + MTP n=3 + KV cache fp8) permite servir texto, imagen y vídeo en una sola GPU consumer con ~28,9 GiB de VRAM en generación, útil para prototipos y demos sin infraestructura cloud.
- Investigación de comportamiento y alineación: al ser una variante abliterated, sirve para estudiar cómo la eliminación de direcciones de rechazo afecta a las respuestas del modelo en dominios sensibles, comparándolo con el checkpoint base sin abliterar.
- Evaluación de cuantización NVFP4: el repositorio incluye `VALIDATION_REPORT.json`, `STATIC_VALIDATION_REPORT.json` y `recipe.yaml`, lo que lo convierte en un banco de pruebas reproducible para medir la degradación de W4A4 frente a BF16 en tareas multimodales.
- Asistente de documentación técnica con imágenes: la torre visual en BF16 permite procesar capturas, diagramas y fotogramas de vídeo junto con texto largo, adecuado para resumir manuales o incidencias con soporte visual.
- Backend de agentes con tool calling: integrado en vLLM con API compatible con OpenAI, puede conectarse a frameworks de agentes que requieran function calling y razonamiento multi-paso, siempre que el contexto se mantenga dentro de los límites validados.
- Aceleración de pipelines de inferencia: la cabeza MTP con aceptación medida del 42,0 % y longitud media de aceptación de 2,33 permite reducir el coste por token en despliegues con latencia crítica, comparado con decodificación autoregresiva pura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los de la validación de despliegue del autor:

| Metrica | Valor |
|---|---|
| Hardware de validación | 1× RTX 5090, límite 450 W |
| Runtime vLLM | `vllm/vllm-openai:qwen38-x86_64-cu130` |
| Contexto configurado | 4096 tokens |
| KV cache | fp8 |
| MTP `num_speculative_tokens` | 3 |
| Draft tokens MTP | 1362 |
| Tokens aceptados | 572 |
| Tasa de aceptación | 42,0 % |
| Longitud media de aceptación | 2,33 |
| Aceptación por posición | 0,602 / 0,429 / 0,295 |
| Tiempo cliente para 1024 tokens de salida | 10,73 s |
| VRAM en generación | ~28.944 MiB |

## Requisitos de hardware

- VRAM estimada: ~28,9 GiB en generación con el perfil validado (NVFP4, contexto 4096, KV cache fp8, `--gpu-memory-utilization 0.92`). Contextos mayores requieren validación específica de VRAM según el propio autor.
- GPU recomendadas: RTX 5090 (Blackwell, sm120) es el objetivo declarado y validado. GPUs Blackwell profesionales (B200, RTX PRO 6000) son compatibles a nivel de formato NVFP4, pero no se han validado en la información disponible.
- Cabe en GPU consumer: sí, en RTX 5090 con el perfil de smoke test. No se garantiza en GPUs con menos de 32 GB de VRAM.
- Opciones de despliegue: vLLM con imagen `vllm/vllm-openai:qwen38-x86_64-cu130`, backend `VLLM_NVFP4_GEMM_BACKEND=flashinfer-cutlass`, `VLLM_USE_FLASHINFER_SAMPLER=1`, `--enable-prefix-caching`, `--trust-remote-code`. No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 10,73 s para 1024 tokens de salida en el perfil de validación (aproximadamente 95 tokens/s de extremo a extremo en cliente), con `--max-num-seqs 1` y `--max-num-batched-tokens 1024`. El throughput en batch no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GloriaWang23/vlm-qwen38-27b-abl-nvfp4 | 27,78 B | no disponible (validado a 4096) | NVFP4 W4A4 + BF16 en visión/MTP | Apache 2.0 | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | 27,78 B | no disponible | BF16 | Apache 2.0 (heredada) | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27,78 B | no disponible | BF16 | Apache 2.0 | Hugging Face |

La comparación se limita a la línea de linaje directa porque la información proporcionada no incluye datos de benchmarks ni de otros modelos multimodales de tamaño similar. No se dispone de cifras de rendimiento para contrastar calidad frente a alternativas como Qwen2.5-VL o Llama 3.2 Vision.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que puede generar contenido que el modelo original rechazaría. No es adecuado para producción orientada al usuario sin filtros externos.
- Solo inglés y chino declarados; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La cuantización NVFP4 W4A4 puede degradar la calidad frente al BF16 original; no se han publicado métricas de calidad comparativas.
- Riesgo de alucinación inherente a la familia Qwen3.8; no se documentan evaluaciones de factualidad.
- El contexto validado es de solo 4096 tokens; contextos mayores requieren validación de VRAM y pueden no caber en una RTX 5090 con el perfil dado.
- Dependencia de hardware Blackwell (sm120) y de una imagen concreta de vLLM; no hay soporte documentado para GPUs Ampere, Ada ni para llama.cpp/Ollama.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- La licencia Apache 2.0 se hereda del modelo Qwen original; conviene verificar las condiciones del checkpoint Huihui intermedio antes de uso comercial.
- El autor declara que el uso es responsabilidad del usuario; no se ofrece garantía de reproducibilidad más allá de los informes incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/GloriaWang23/vlm-qwen38-27b-abl-nvfp4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio alternativo citado en la model card: https://huggingface.co/lyf/Qwen3.8-27B-Huihui-Abliterated-NVFP4-MTP-VL
