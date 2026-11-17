# rafaelsobek/Qwen3.8-27B-NVFP4-GGUF

## Resumen

Qwen3.8-27B-NVFP4-GGUF es una conversión al formato GGUF del checkpoint NVFP4 `unsloth/Qwen3.8-27B-NVFP4`, publicada por el usuario rafaelsobek. El modelo base es un transformer de tipo MoE (arquitectura `qwen35`) con 27.320.698.192 parámetros totales, licencia Apache-2.0 y una ventana de contexto que, según las pruebas del autor, se extiende hasta aproximadamente 160.000 tokens en la práctica. La conversión preserva la cuantización mixta del checkpoint original: grupos NVFP4 bit-exactos y tensores FP8 reconvertidos a Q8_0.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de 27B con cuantización de 4 bits nativa en GPUs Blackwell (sm_120) mediante los tensor cores FP4 de NVIDIA, sin sobrecoste de descompresión, usando llama.cpp con tensor parallelism. Por otro, documenta de forma reproducible el proceso de conversión de checkpoints compressed-tensors con múltiples grupos de cuantización, un patrón poco habitual y propenso a errores.

El autor verificó el modelo en 2× RTX 5060 Ti de 16 GB (32 GB de VRAM total), con un fichero GGUF de 23,17 GB (21,57 GiB) y 1202 tensores. Incluye la cabeza MTP (multi-token prediction) sin cuantizar, lo que habilita decodificación especulativa integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, familia `qwen35` |
| Parametros totales | 27.320.698.192 (27,32 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens configurados; hasta ~160k medidos en práctica |
| Tipos de cuantizacion | NVFP4 (168 tensores), Q8_0 (233 tensores), F32 (696 tensores), escalas FP8 (105 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único `Qwen3.8-27B-NVFP4.gguf`, 23,17 GB, 1202 tensores) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia `qwen35`, con 27,32 B de parámetros totales. La model card no detalla el número de parámetros activos, el número de expertos ni la composición del dataset de entrenamiento. La arquitectura incorpora atención lineal mediante capas GDN (gated delta network) junto con atención estándar q/k/v/o, y una cabeza MTP (multi-token prediction) que actúa como draft head para decodificación especulativa.

La conversión a GGUF parte de un checkpoint compressed-tensors con dos grupos de cuantización: el grupo 0 en FP8 (pesos per-channel, activaciones dinámicas) cubre atención, atención lineal GDN, LM head y el MLP de las últimas 8 capas (56–63); el grupo 1 en NVFP4 cubre las compuertas gate/up/down del MLP de las capas 0–55. La conversión usa `--outtype auto` (repack NVFP4 bit-exacto, sin recuantizar) y `--fp8-as-q8` (FP8 a Q8_0). Los tensores MTP se integran sin cuantizar. No se dispone de información sobre RLHF, DPO ni volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en modo instruct y modo thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Razonamiento multi-paso mediante modo thinking (temp 1.0 / top_p 0.95 / top_k 20 según recomendación de Unsloth).
- Decodificación especulativa nativa mediante la cabeza MTP integrada (`draft-mtp`, `n_max 2`).
- Procesamiento de contexto largo: ventana configurada de 131.072 tokens y hasta ~160k medidos con KV cache q8_0.
- Capacidad de visión: no incluida en este GGUF; requiere cargar el `mmproj-F16.gguf` de `unsloth/Qwen3.8-27B-GGUF` por separado.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y multi-step reasoning: no confirmadas explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional de contexto largo: con 131k tokens de ventana y KV cache q8_0, puede mantener conversaciones multi-turno sobre documentos extensos o historiales completos sin truncar.
- Análisis de repositorios de código: la ventana de ~160k tokens permite cargar varios ficheros fuente y mantener coherencia entre ellos en tareas de revisión o refactorización.
- Despliegue en estaciones de trabajo con doble GPU consumer: el formato NVFP4 con tensor parallelism permite servir el modelo en 2× RTX 5060 Ti de 16 GB, un hardware asequible frente a soluciones de datacenter.
- Generación aumentada por recuperación (RAG) con contexto masivo: la ventana larga reduce la necesidad de reordenar o comprimir fragmentos recuperados, y el throughput de prefill medido (~1731 t/s a 12,8k y 25,5k tokens) mantiene la latencia de primer token contenida.
- Prototipado de agentes conversacionales: el modo thinking permite separar razonamiento interno de respuesta final, útil para pipelines que necesitan trazas de decisión.
- Inferencia local en entornos con restricciones de privacidad: al ejecutarse con llama.cpp en hardware propio y licencia Apache-2.0, permite procesar datos sensibles sin salida a la nube.
- Evaluación comparativa de cuantizaciones: el fichero documenta la distribución exacta de tipos de tensor, lo que facilita reproducir experimentos de calidad frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

Rendimiento medido por el autor en 2× RTX 5060 Ti 16 GB (32 GB VRAM), llama.cpp `server-cuda` build `372dc5ca1`, FlashAttention, KV q8_0/q8_0, 12 hilos.

Servidor con MTP activo (`n_max 2`), tensor-parallel:

| Prompt (tokens) | pp (t/s) | tg (t/s, n=128) |
|---:|---:|---:|
| ~12,8k | 1731 | 66,7 |
| ~25,5k | 1731 | 62,6 |
| ~50,9k | 1545 | 55,3 |
| ~102k | 1265 | 46,2 |
| ~127,5k | 1161 | 41,0 |

llama-bench con MTP inactivo (ubatch 256, tg128 por profundidad):

| Profundidad | tg128 (t/s) |
|---:|---:|
| 0 | 19,78 |
| 16k | 18,44 |
| 32k | 17,30 |
| 64k | 15,36 |
| 128k | 12,58 |
| 160k | 11,53 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: pesos ≈ 21,6 GiB; con KV q8_0 y contexto de 131k se recomienda un total de 32 GB de VRAM. Para contextos menores o KV q4_0 puede reducirse.
- GPU recomendadas: 2× RTX 5060 Ti 16 GB (Blackwell, sm_120) verificadas por el autor con tensor parallelism. Cualquier GPU Blackwell (RTX 50xx, B200) puede aprovechar los tensor cores FP4; GPUs Ampere o Ada no tienen soporte nativo NVFP4 y pierden la ventaja de rendimiento.
- Cabe en consumer GPU: sí, en 2× RTX 5060 Ti 16 GB. En una sola GPU consumer de 24 GB (RTX 4090) no cabe con contexto largo por el tamaño de los pesos más KV cache.
- Opciones de despliegue: llama.cpp (recomendado, build ≥ b8967 para NVFP4 nativo), llama-server con `LLAMA_ARG_SPLIT_MODE=tensor` y `GGML_CUDA_ALLREDUCE=internal`. vLLM, TGI y Ollama no están documentados para este fichero en la información disponible.
- Ajustes clave: `ubatch 512` para prefill, `threads 12`, FlashAttention activado, `LLAMA_ARG_SPEC_TYPE=draft-mtp` y `LLAMA_ARG_SPEC_DRAFT_N_MAX=2` para MTP.
- Latencia y throughput: ver tabla de benchmarks. En caso de OOM, reducir contexto a 81.920 o cambiar KV a q4_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-GGUF (este) | 27,32 B (MoE) | 131k config., ~160k medido | NVFP4 + Q8_0 mixta | Apache-2.0 | GGUF en HF |
| unsloth/Qwen3.8-27B-NVFP4 | 27,32 B (MoE) | no disponible | NVFP4 + FP8 (compressed-tensors) | Apache-2.0 | Safetensors en HF |
| unsloth/Qwen3.8-27B-GGUF | 27,32 B (MoE) | no disponible | GGUF estándar (incluye mmproj-F16) | Apache-2.0 | GGUF en HF |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización NVFP4 es agresiva (4 bits) y puede degradar la calidad frente al modelo en precisión completa; no se han publicado evaluaciones de calidad en la información disponible.
- El fichero no incluye los tensores del vision tower; para tareas multimodales hay que cargar `mmproj-F16.gguf` de otro repositorio.
- El rendimiento óptimo depende de GPUs Blackwell (sm_120); en arquitecturas anteriores se pierde el beneficio de los tensor cores FP4 y el modelo puede ser inviable por VRAM.
- Riesgo de OOM: con 21,6 GiB de pesos y 32 GB de VRAM totales, el margen para KV cache es estrecho; es necesario ajustar contexto o cuantización de KV.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación; se recomienda evaluación propia antes de uso en producción.
- El repositorio tiene 0 likes y 239 descargas en el momento de la consulta, lo que limita la validación comunitaria del artefacto.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar la licencia del modelo base original (Qwen) por si impone condiciones adicionales no reflejadas en esta conversión.
- El modelo es una conversión de terceros, no una publicación oficial de Unsloth ni de Alibaba; la trazabilidad depende del SHA-256 publicado por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rafaelsobek/Qwen3.8-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- GGUF con vision tower (mmproj): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Open LLM Radar — Qwen3.8-27B: https://open-llm-radar.com/models/qwen38-27b
- Open LLM Radar: https://open-llm-radar.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
