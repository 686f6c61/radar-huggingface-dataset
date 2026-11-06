# darioooooo0o/Qwen3.6-35B-A3B-TinyKV

## Resumen

Qwen3.6-35B-A3B-TinyKV es un ajuste fino (finetune) de Qwen3.6-35B-A3B publicado por el usuario darioooooo0o en Hugging Face. Su objetivo es resolver un problema muy concreto de inferencia: el tamaño de la caché KV. El autor reconstruye únicamente las 10 capas de atención completa del modelo base mediante destilación desde el modelo original, logrando una caché KV 2,5 veces menor al mismo dtype, mientras las 30 capas Gated DeltaNet, los expertos MoE, los embeddings y la torre de visión quedan intactos (idénticos byte a byte al modelo original).

La relevancia de este modelo está en el ahorro de memoria en despliegue: en vLLM 0.32.0 sobre una RTX PRO 6000 de 96 GB, la caché KV pasa de almacenar 820k tokens a 1,93 millones (2,35 veces más, ya que el estado de Gated DeltaNet es un coste fijo que no se reduce), lo que permite 58,8 peticiones concurrentes de 32k tokens en lugar de 25. El delta completo respecto al modelo base es de solo 560 MB (`tinykv-patch.safetensors`), lo que lo convierte en un "retrofit" ligero y eficiente.

Arquitecturalmente hereda el diseño híbrido de Qwen3.6-35B-A3B: un modelo MoE de unos 36,2 mil millones de parámetros totales con activación dispersa, combinando capas de atención completa con capas Gated DeltaNet. Se publica bajo licencia Apache 2.0 en formato safetensors, con variantes cuantizadas NVFP4, FP8, GPTQ-Int4 y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Qwen3.5-MoE): 10 capas de atención completa + 30 capas Gated DeltaNet, torre de visión |
| Parametros totales | 36.228.127.600 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según variante GPTQ-Int4); ejemplo de despliegue con 131.072 tokens |
| Tipos de cuantizacion | bf16 (este repo), NVFP4, FP8, GPTQ-Int4, GGUF (Q8_0 a IQ2_M) en variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GGUF en variante específica) |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido que combina 10 capas de atención completa (full attention) con 30 capas Gated DeltaNet, además de una torre de visión. TinyKV es un retrofit selectivo: solo se reconstruyeron las 10 capas de atención completa, entrenadas por destilación contra el modelo original. El resto del modelo (expertos MoE, embeddings, Gated DeltaNet y torre de visión) permanece byte-idéntico al original. Todo el cambio se resume en un parche de 560 MB (`tinykv-patch.safetensors`).

El entrenamiento por destilación redondeó la caché a NVFP4 (4,5 bits), de modo que la calidad medida corresponde al caso de caché de 4 bits. La selección del checkpoint se realizó con agujas (needles) de entrenamiento, y las métricas publicadas usan agujas retenidas (held out) no vistas durante la selección. En los datos de destilación se mencionan fuentes como PG-19 (libros), FineWeb-Edu (web), código, FineMath (matemáticas), trazas de razonamiento, SmolTalk (chat) y Toucan (tool calls).

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tags conversational).
- Contexto largo: hasta 262k tokens en la variante GPTQ-Int4, con recuperación de agujas medida a 30k y 130k tokens.
- Arquitectura MoE: activación dispersa para inferencia eficiente (parámetros activos no publicados).
- Tool calling: el modelo base incluye datos de tool calls (Toucan) en la evaluación de destilación; no se han publicado pruebas específicas de function calling para TinyKV.
- Capacidad multimodal potencial: la torre de visión es idéntica a la del modelo base, pero las entradas de imagen/vídeo no han sido probadas con la nueva atención (vLLM se despliega con imagen y vídeo deshabilitados).
- No hay información publicada sobre modos de pensamiento (thinking mode), audio ni agentes.

## Casos de uso

- Servicios de chat multiusuario de alto tráfico: la caché KV 2,5 veces menor permite 58,8 peticiones concurrentes de 32k tokens frente a 25 del modelo original en la misma GPU, aumentando directamente el throughput por acelerador.
- Procesamiento por lotes de documentos largos (RAG offline, resumen de corpus): con fp8 cache se alcanzan 3,21 millones de tokens en caché, ideal para colas de trabajos con prompts extensos.
- Chatbots con contexto largo en hardware limitado: la variante GPTQ-Int4 ejecuta el contexto completo de 262k tokens en 25 GB (por ejemplo, en una Intel Arc Pro B70), lo que habilita despliegues de contexto gigante en GPUs de gama media.
- Análisis de código con repositorios extensos: la KL frente al original en código es de 0,050 y ΔCE de +0,007 nats/token, una degradación mínima para tareas de comprensión de código con contextos grandes.
- Razonamiento matemático y trazas de razonamiento: la degradación en trazas de razonamiento es prácticamente nula (ΔCE de −0,001 a +0,001), adecuado para pipelines de razonamiento multi-paso.
- Optimización de costes de inferencia en la nube: al duplicar la capacidad de peticiones concurrentes por GPU, reduce el número de réplicas necesarias para un mismo nivel de servicio.
- Despliegue en GPUs consumer con GGUF: la variante GGUF (Q8_0 a IQ2_M) mediante el fork tinykv de llama.cpp permite ejecutar el modelo en hardware de consumo, con tabla de qué cabe en cada GPU.

## Benchmarks y rendimiento

Recuperación de agujas (needle retrieval) con 32 hechos distractor casi duplicados, exact match sobre respuesta de 8 dígitos (agujas held out):

| Contexto | Agujas | TinyKV exact | Original exact | TinyKV logp | Original logp |
|---|---|---|---|---|---|
| 30k tokens | 96 | 96,9 % | 97,9 % | −0,503 | −0,372 |
| 130k tokens | 24 | 95,8 % | 91,7 % | −0,677 | −0,427 |

Divergencia KL frente a la distribución del modelo original en documentos held out de 8k tokens:

| Fuente | TinyKV KL | NVFP4-only KL | TinyKV ΔCE (nats/token) |
|---|---|---|---|
| Libros (PG-19) | 0,040 | 0,008 | +0,019 |
| Web (FineWeb-Edu) | 0,027 | 0,006 | +0,012 |
| Código | 0,050 | 0,009 | +0,007 |
| Matemáticas (FineMath) | 0,027 | 0,005 | +0,009 |
| Trazas de razonamiento (math / code) | 0,024 / 0,027 | 0,003 / 0,005 | −0,001 / +0,001 |
| Chat (SmolTalk) | 0,117 | 0,031 | — |
| Tool calls (Toucan) | 0,324 | 0,206 | — |

Verificación en vLLM (log-probs por token frente a la referencia PyTorch, 4 prompts held out):

| | mean \|Δ logp\| vs PyTorch | Caché KV (tokens) |
|---|---|---|
| Stock, caché bf16 | 0,071 | 820.062 |
| TinyKV, caché bf16 | 0,046 | 1.927.868 |
| Stock, caché fp8 | 0,077 | 1.426.897 |
| TinyKV, caché fp8 | 0,042 | 3.212.140 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni mediciones de throughput. En la variante GPTQ-Int4 se reporta 233 tok/s de decodificación a un prompt de 130k (frente a 186 del stock) en una Intel Arc Pro B70.

## Requisitos de hardware

- Este repo (bf16): requiere una GPU de al menos 80 GB de VRAM (solo una GPU; el plugin no implementa tensor parallel).
- Variante NVFP4: ~22 GB de pesos, requiere GPUs Blackwell (vLLM).
- Variante FP8: ~37 GB de pesos, para GPUs Ada / Hopper / Blackwell (vLLM).
- Variante GPTQ-Int4: clase de 24 GB y superior; contexto completo de 262k tokens en 25 GB (probado en Intel Arc Pro B70).
- Variante GGUF: desde Q8_0 hasta IQ2_M, con tabla de compatibilidad por GPU; requiere el fork tinykv de llama.cpp.
- GPUs de referencia en las mediciones: RTX PRO 6000 (96 GB) con vLLM 0.32.0 y FlashAttention 2.
- Despliegue: vLLM 0.32.0 con el plugin incluido en el repo (registro vía `vllm.general_plugins`), llama.cpp con el fork tinykv. No se menciona soporte en Ollama ni TGI.
- Comando de referencia en vLLM: `vllm serve darioooooo0o/Qwen3.6-35B-A3B-TinyKV --max-model-len 131072 --gpu-memory-utilization 0.9 --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Throughput no medido; latencia no publicada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Caché KV por token (bf16) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TinyKV (este) | 36,2 B | 8.192 B | 262k (variante Int4) | Apache 2.0 | vLLM (plugin), llama.cpp fork |
| Qwen/Qwen3.6-35B-A3B (base) | 36,2 B | 20.480 B | no disponible | Apache 2.0 | vLLM, llama.cpp estándar |
| Qwen3.6-35B-A3B-TinyKV-NVFP4 | 36,2 B (cuantizado) | 2.304 B/token equivalente | no disponible | Apache 2.0 | vLLM Blackwell |
| Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4 | 36,2 B (cuantizado) | no disponible | 262k | Apache 2.0 | vLLM, GPUs de 24 GB |

La comparación principal es con su propio modelo base: TinyKV ofrece la misma arquitectura y pesos casi idénticos, con una caché KV 2,5 veces menor y una degradación de calidad de aproximadamente +1–2 % de perplejidad en texto limpio, mayor en chat (KL 0,117) y tool calls (KL 0,324).

## Limitaciones y advertencias

- Solo una GPU: el plugin de vLLM no implementa tensor parallel, lo que limita el escalado horizontal dentro de un nodo.
- Los pesos bf16 requieren una GPU de ≥80 GB, fuera del alcance de la mayoría de GPUs consumer sin recurrir a las variantes cuantizadas.
- La degradación de calidad es mayor en chat (KL 0,117) y especialmente en tool calls (KL 0,324), donde la distribución se aleja más del modelo original; conviene validar el comportamiento de function calling antes de producción.
- Solo se evaluó texto: la torre de visión es idéntica, pero las entradas de imagen/vídeo no fueron probadas con la nueva atención; vLLM se despliega con imagen y vídeo deshabilitados.
- Throughput y needles de contexto largo a través de vLLM no medidos todavía (las tablas de needles provienen del camino PyTorch).
- GGUF requiere un fork específico de llama.cpp (rama tinykv), no el upstream estándar.
- Riesgo de alucinación, sesgos y capacidades multilingües: no disponible en la información publicada; heredará en principio las características del modelo base Qwen3.6-35B-A3B, sin datos específicos en la model card.
- La calidad fue medida con caché redondeada a NVFP4 tal como se entrenó; otros dtypes de caché pueden comportarse de forma distinta.
- Repositorio comunitario (904 descargas, 0 likes en el momento de la ficha): menor madurez y auditoría que los repos oficiales de Qwen.

## Enlaces

- Modelo principal: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante NVFP4: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-NVFP4
- Variante FP8: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-FP8
- Variante GPTQ-Int4: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4
- Variante GGUF: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF
- Fork de llama.cpp (rama tinykv): https://github.com/riceharvest/llama.cpp/tree/tinykv
