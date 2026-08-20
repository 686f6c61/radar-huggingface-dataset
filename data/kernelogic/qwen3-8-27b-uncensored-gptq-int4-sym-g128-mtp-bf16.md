# kernelogic/Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16

## Resumen

Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16 es una cuantización GPTQ de 4 bits del modelo abliterado JonathanColetti/Qwen3.8-27B-Uncensored, que a su vez deriva del modelo base Qwen/Qwen3.8-27B (Apache-2.0). El autor, kernelogic, la construyó específicamente para ejecutarse en hardware Intel Arc / vLLM XPU, aprovechando las unidades XMX de enteros de esa plataforma. El resultado es un modelo de 27.8B parámetros en 19 GB, con una ventana de contexto de 131.072 tokens y soporte nativo de decodificación especulativa gracias a la preservación del cabezal MTP en BF16.

La relevancia de esta ficha radica en que, según su autor, es la única build GPTQ de un Qwen3.8-27B uncensored disponible en el momento de la subida; las alternativas existentes son GGUF, AWQ o safetensors sin cuantizar. El modelo está pensado para desarrolladores que quieran desplegar un LLM sin censura en GPUs Intel Arc con vLLM, manteniendo la velocidad de decodificación especulativa que normalmente se pierde al cuantizar el cabezal de draft. Incluye soporte de tool calling y ha sido verificado hasta 120.532 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GDN/Mamba (Qwen3.8) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (verificado hasta 120.532) |
| Tipos de cuantizacion | GPTQ-Int4 (group_size=128, sym=True, desc_act=False, pack_dtype=int32); MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, 19 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida GDN/Mamba, que combina capas de atención con bloques de espacio de estados (Mamba). Esta hibridación permite manejar contextos largos de forma eficiente, aunque vLLM no declara soporte de prefix caching para esta arquitectura, lo que anula cualquier beneficio de caché de prefijo. El proceso de abliteración aplicado por JonathanColetti elimina los rechazos y moralinas del modelo alineado original, manteniendo un registro relativamente neutro.

La cuantización se realizó con gptqmodel 7.3.2 sobre una Intel Arc Pro B70 (32 GB, Xe2), con 256 muestras de calibración de 2048 tokens extraídas de allenai/c4 (texto web general, sin código). La configuración excluye explícitamente los 15 tensores `mtp.*` de la cuantización mediante `dynamic={"-:.*mtp.*": {}}`, preservándolos en BF16 para que la decodificación especulativa MTP siga funcionando. El resultado son 400 tensores de pesos cuantizados (I32) y 15 tensores MTP en BF16. No se aplicó RLHF ni DPO en este paso; el comportamiento uncensored es heredado de la abliteración upstream.

## Capacidades

- Generación de texto en inglés y chino con registro neutro y sin rechazos (comportamiento abliterado heredado).
- Decodificación especulativa MTP nativa: el cabezal de draft se conserva en BF16, logrando una tasa de aceptación del 73,3% en generación de código y del 49,9% en prosa.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y el parser `qwen3_xml` en vLLM.
- Contexto largo: verificado hasta 120.532 tokens, con KV cache en FP8 para caber en 32 GB.
- Razonamiento multi-paso: no hay benchmarks específicos, pero la arquitectura base Qwen3.8 soporta cadenas de razonamiento; la cuantización no altera esta capacidad.
- Sin capacidades de visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue de un asistente conversacional sin censura en hardware Intel Arc: el modelo cabe en 32 GB con KV cache FP8 y ofrece 52-68 tok/s, adecuado para prototipos y entornos de prueba con un solo usuario concurrente.
- Generación de código asistida en local: con 68,5 tok/s y una alta tasa de aceptación MTP (73,3%), es viable para autocompletado y generación de fragmentos en entornos de desarrollo sobre GPUs Intel.
- Investigación sobre decodificación especulativa en arquitecturas híbridas: la preservación del MTP en BF16 permite estudiar el impacto de la cuantización selectiva en la tasa de aceptación de draft.
- Evaluación de modelos abliterados en producción: sirve como referencia para medir si la cuantización degrada el comportamiento uncensored respecto al BF16 original.
- Integración en pipelines de tool calling con vLLM: el soporte nativo de `qwen3_xml` permite construir agentes que llaman funciones sin necesidad de adaptadores externos.
- Pruebas de contexto largo en español: aunque los idiomas declarados son en y zh, el modelo puede procesar texto en otros idiomas; su ventana de 128K permite experimentar con recuperación de información en documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara explícitamente que no se realizaron evaluaciones de calidad, solo pruebas de estructura, velocidad, aceptación MTP, tool calling y contexto largo. Los únicos datos medidos son de rendimiento de inferencia en Intel Arc Pro B70 (230 W, vLLM XPU 0.27.2rc1, MTP4, FP8 KV, contexto 131.072, prefijo caching desactivado, mediana de n=3-5):

| Workload | tok/s | Aceptación MTP |
|---|---:|---:|
| Generación de código | 68,5 | 73,3% |
| Prosa | 52,4 | 49,9% |

TTFT (tokens de prompt / tiempo hasta primer token): 1808 @ p2k · 1810 @ p4k · 1777 @ p6k · 1738 @ p8k. Contexto largo verificado hasta 120.532 tokens.

## Requisitos de hardware

- VRAM estimada: 19 GB de pesos + KV cache FP8; con `--gpu-memory-utilization 0.88` cabe en una GPU de 32 GB (Intel Arc Pro B70). En GPUs de 24 GB (RTX 3090/4090) podría caber con contexto reducido, pero no está verificado.
- GPU recomendada: Intel Arc Pro B70 (Xe2, 32 GB) para la que está optimizado; también debería funcionar en otras GPUs con soporte XPU, aunque no hay datos.
- Compatibilidad con consumer GPU: no confirmada; el autor solo probó en Intel Arc Pro B70.
- Opciones de despliegue: vLLM XPU con los dos parches MTP del cookbook de Intel Arc Pro B70 (`patch_mtp_nightly.py` y `patch_mtp_boundary.py`). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 52-68 tok/s en generación, TTFT ~1800 tokens/s para prompts de 2K-8K. El throughput depende de la tasa de aceptación MTP; con `--max-num-seqs 1` no hay batching paralelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GPTQ-Int4 (este) | 27,8B | 131.072 | GPTQ-Int4 + MTP BF16 | Apache-2.0 | Optimizado para Intel Arc, decodificación especulativa preservada |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27,8B | 131.072 | BF16 (sin cuantizar) | Apache-2.0 | Modelo fuente, 55,6 GB, requiere más VRAM |
| Qwen/Qwen3.8-27B | 27,8B | 131.072 | BF16 | Apache-2.0 | Modelo base alineado, sin abliteración |
| Variantes GGUF/AWQ del mismo modelo | 27,8B | 131.072 | GGUF o AWQ | Apache-2.0 | Existen según el autor, pero sin MTP preservado; decodificación especulativa degradada |

La comparativa se limita a las variantes del mismo modelo base; no se dispone de datos de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No se realizaron evaluaciones de calidad: no hay comparación de perplejidad contra el BF16 original, ni benchmarks de razonamiento, código o tasas de rechazo. Cualquier uso en producción requiere medición propia.
- La calibración se hizo solo con texto web general (C4), sin código; si la generación de código es crítica, una calibración con datos de código probablemente mejoraría la calidad.
- El comportamiento uncensored es heredado de la abliteración upstream, no verificado en esta cuantización. En pruebas informales, el modelo cumple sin rechazos pero mantiene un registro moderado; no cambia el tono, solo elimina negativas.
- Es un modelo sin censura: intentará responder a peticiones que un modelo alineado rechazaría. El usuario es responsable del uso.
- Limitaciones de despliegue: `--max-num-seqs 1` es obligatorio con MTP; con más de una secuencia concurrente, el kernel GDN aborta el motor. El prefix caching no funciona con esta arquitectura híbrida (0 hits medidos en 3.036 consultas) y cuesta ~4% de rendimiento de decode.
- `--kv-cache-dtype fp8` es imprescindible para contexto 128K en 32 GB; con FP16 no cabe.
- Idiomas declarados: solo en y zh; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kernelogic/Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16
- Modelo base abliterado: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cookbook de Intel Arc Pro B70 (parches MTP y receta de despliegue): https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Herramienta de cuantización gptqmodel: https://github.com/modelcloud/gptqmodel
