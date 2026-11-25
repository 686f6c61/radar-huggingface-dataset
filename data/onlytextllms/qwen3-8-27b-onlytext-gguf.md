# OnlyTextLLMs/Qwen3.8-27B-OnlyText-GGUF

## Resumen

Qwen3.8-27B-OnlyText-GGUF es una distribución cuantizada en formato GGUF del derivado OnlyText del modelo Qwen/Qwen3.8-27B, publicado por el colectivo OnlyTextLLMs. Se trata de una conversión de pesos sin reentrenamiento: elimina las modalidades de visión y audio del modelo original, conserva únicamente la torre de texto y empaqueta en el mismo fichero la cabeza MTP (multi-token prediction) que actúa como draft model para decodificación especulativa. El resultado son tres ficheros GGUF (Q4_K_M, Q6_K y Q8_0) listos para llama.cpp con soporte de speculative decoding nativo.

El modelo base tiene 27.320.513.536 parámetros, 64 capas (48 de atención lineal Gated-DeltaNet y 16 de atención completa), dimensión oculta de 5120 y un vocabulario de 248.302 tokens. La arquitectura declarada es `Qwen3_5ForCausalLM`, mapeada en GGUF como `qwen35`, lo que lo sitúa en la familia Qwen 3.5 con atención híbrida. Su relevancia actual radica en que demuestra que la decodificación especulativa con MTP embebido en el propio GGUF ofrece incrementos de throughput de entre el 60 % y el 121 % en GPUs Radeon profesionales, sin fichero draft separado y sin pérdida de precisión a temperatura 0.

La licencia Apache 2.0 del modelo base se mantiene, lo que facilita el uso comercial. El repositorio ocupa 68,3 GB y acumula 295 descargas en el momento de redactar esta ficha. Es una opción interesante para despliegues de inferencia local en hardware AMD, donde el ecosistema de cuantizaciones con MTP es más escaso que en el ecosistema NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas de atención lineal Gated-DeltaNet + 16 capas de atención completa; `Qwen3_5ForCausalLM` (GGUF: `qwen35`) |
| Parametros totales | 27.320.513.536 (27,32 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en los comandos de referencia de la model card; el máximo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q6_K (22,4 GB), Q8_0 (29,0 GB) |
| Idiomas soportados | en (inglés, según el campo de idiomas del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con tensores MTP embebidos, `nextn_predict_layers = 1`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 48 de sus 64 capas usan Gated-DeltaNet, un mecanismo de atención lineal con estado recurrente, mientras que las 16 restantes mantienen atención completa. Esta combinación reduce el coste de memoria y cómputo en secuencias largas frente a un transformer denso equivalente, manteniendo la capacidad de recuperación exacta de contexto en las capas de atención completa. La dimensión oculta es 5120 y el vocabulario de 248.302 tokens, con tokenizador propio de Qwen.

Esta distribución concreta no añade entrenamiento: los pesos son un derivado directo del modelo base. El proceso consiste en ejecutar `convert_hf_to_gguf.py` con el commit `f280b26983ad` de llama.cpp y después `llama-quantize` con el tipo nombrado de cada fichero. Durante la conversión se eliminan los tokens especiales de visión y audio, dejando 15 tokens especiales solo de texto en los ids 248044–248058 (EOS 248046 = `<|im_end|>`). La innovación técnica destacable es la inclusión por defecto de los tensores MTP (`nextn_predict_layers = 1`), que permiten decodificación especulativa con `--spec-type draft-mtp` sin necesidad de cargar un modelo draft independiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con la API de OpenAI.
- Modo de razonamiento extenso activado por defecto: la plantilla mantiene `reasoning_effort: xhigh`, por lo que el modelo razona antes de responder salvo que se desactive.
- Desactivación del razonamiento mediante `--reasoning off` en llama-cli o `"chat_template_kwargs": {"enable_thinking": false}` en la API de servidor, para respuestas directas y rápidas.
- Decodificación especulativa con MTP embebido, con recuento de drafts configurable (`--spec-draft-n-max`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo tras una interfaz compatible con OpenAI mediante `llama-server`.
- Soporte de flash attention (`-fa on`) en llama.cpp.
- Capacidades de tool calling y function calling: no confirmadas explícitamente en la información disponible.
- Capacidades multimodales: eliminadas deliberadamente en este derivado (solo texto).
- Capacidades multilingües: el repositorio declara únicamente inglés; el comportamiento en otros idiomas no está documentado.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: con Q4_K_M (16,8 GB) cabe en una única Radeon AI PRO R9700 de 34 GB y ofrece 42,7 tok/s con MTP n=3, suficiente para interacción fluida en tiempo real sin depender de la nube.
- Razonamiento complejo por lotes: el modo thinking activado por defecto resulta adecuado para tareas de análisis, planificación y resolución de problemas donde la latencia no es crítica y prima la calidad de la respuesta.
- Servicio de inferencia compatible con OpenAI: `llama-server` expone una API compatible que permite integrar el modelo en aplicaciones existentes sin reescribir clientes, con control de contexto hasta 32.768 tokens.
- Procesamiento de documentos largos en inglés: la ventana de 32.768 tokens configurada permite resumir, extraer y reescribir documentos extensos en una sola pasada, aprovechando la atención lineal para reducir el coste en secuencias largas.
- Evaluación y benchmarking de hardware AMD: el repositorio incluye una metodología reproducible (llama-bench PP512/1024/2048 y TG128/256) útil para comparar configuraciones de GPU, ROCm y versiones de llama.cpp.
- Despliegue en equipos con Ryzen AI Max+ 395 / Strix Halo: la model card cita 24,5 tok/s con MTP=4 en ese SoC, lo que lo hace viable para asistentes locales en portátiles y mini-PC de memoria unificada.
- Generación de código y texto técnico: aunque no hay benchmarks publicados de HumanEval en la información disponible, el modelo base Qwen 3.5 está orientado a tareas técnicas; conviene validar la calidad con evaluación propia antes de producción.

## Benchmarks y rendimiento

Los datos publicados corresponden a throughput de inferencia medido el 2026-08-24 en 2× AMD Radeon AI PRO R9700 (gfx1201, 34 GB cada una) con llama.cpp `f280b26983ad` (HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Quant | Dispositivo | Prefill t/s (PP512) | Gen t/s sin MTP | Gen t/s mejor MTP | Delta MTP |
|---|---|---|---|---|---|
| Q4_K_M | 1× R9700 | 1035 | 26,7 | 42,7 (MTP n=3) | +60 % |
| Q6_K | 1× R9700 | 660 | 23,8 | 44,0 (MTP n=2) | +85 % |
| Q8_0 | 1× R9700 | 1222 | 19,7 | 43,6 (MTP n=4) | +121 % |
| Q4_K_M | 2× R9700 (layer-split) | 869 | 23,8 | 39,8 (MTP n=3) | +67 % |
| Q6_K | 2× R9700 (layer-split) | 545 | 22,1 | 39,6 (MTP n=2) | +79 % |
| Q8_0 | 2× R9700 (layer-split) | 1110 | 19,0 | 41,5 (MTP n=4) | +118 % |

Referencias citadas por el autor como líneas base a batir:

| Configuración | Rendimiento | Fuente |
|---|---|---|
| 1× Radeon AI PRO R9700, MTP=2, Vulkan, Windows | 51,8 tok/s | Blog de AMD |
| Ryzen AI Max+ 395 / Strix Halo, MTP=4 | 24,5 tok/s | Blog de AMD |
| Qwen3.6-27B Q4_K_M, R9700, sin MTP | 17,4 tok/s decode | willitrunai |
| Qwen3.6-27B Q4_K_M, Strix Halo ROCm, MTP n=3 | 12,1 → 21,2 tok/s (1,81×) | calebcoffie |
| Q4_K_S, RTX 5090 (LM Studio) | ~75 → >90 tok/s | Model card de DavidAU |

El autor cita como referencia general de MTP una aceleración de ~1,5–2× sin pérdida de precisión a temperatura 0, según unsloth y el PR ggml-org/llama.cpp#22673.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ≈ 16,8 GB de pesos más overhead de contexto y caché KV; Q6_K ≈ 22,4 GB; Q8_0 ≈ 29,0 GB. Con contexto de 32.768 tokens y flash attention el consumo adicional es moderado, pero conviene reservar al menos 2–4 GB extra.
- GPU recomendadas: AMD Radeon AI PRO R9700 (34 GB) validada para los tres cuants en single-GPU; configuraciones duales con layer-split también medidas. En el ecosistema NVIDIA, una RTX 5090 (32 GB) o A100/H100 de 40/80 GB son suficientes por capacidad, aunque no hay mediciones publicadas para esas tarjetas en la información disponible.
- Cabe en GPU de consumo: Q4_K_M (16,8 GB) entra en GPUs de 24 GB como la RTX 4090 o la RX 7900 XTX; Q6_K requiere 24 GB con margen ajustado; Q8_0 necesita 32 GB o más.
- Opciones de despliegue: llama.cpp (imprescindible para MTP, build del 2026-05-16 o posterior, commit `4f13cb7`+), `llama-server` con API compatible con OpenAI y `llama-cli`. Otros runners (vLLM, TGI, Ollama) no están documentados para estos ficheros en la información disponible; Ollama podría importar el GGUF, pero sin soporte confirmado de MTP.
- Latencia y throughput: ver tabla de benchmarks. El mejor resultado medido es 44,0 tok/s con Q6_K en single R9700 y MTP n=2. El prefill oscila entre 545 y 1222 t/s según cuant y configuración.
- Configuración recomendada por el autor: `--spec-draft-n-max 2` en Radeon PRO R9700 y `4` en Ryzen AI Max / Strix Halo. En dual-GPU, dejar que llama.cpp haga layer-split automático sin fijar `*_VISIBLE_DEVICES`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OnlyText-GGUF (este) | 27,32 B | 32.768 configurado | GGUF Q4_K_M / Q6_K / Q8_0 con MTP embebido | Apache 2.0 | Solo texto, optimizado para llama.cpp en AMD |
| Qwen/Qwen3.8-27B (base) | 27,32 B | no disponible | safetensors (pesos originales) | Apache 2.0 | Incluye visión y audio; requiere conversión para GGUF |
| Qwen3.6-27B Q4_K_M | ~27 B | no disponible | GGUF | Apache 2.0 (presumible) | Generación anterior; 17,4 tok/s en R9700 sin MTP, 12,1 → 21,2 tok/s en Strix Halo con MTP |
| Qwen3.6-27B-MTP-GGUF (unsloth) | ~27 B | no disponible | GGUF con MTP | Apache 2.0 (presumible) | Referencia de speedup MTP ~1,5–2× citada por el autor |

La ventaja diferencial de este repositorio frente al base es la disponibilidad inmediata en GGUF con MTP embebido y cuants verificados en hardware AMD profesional. Frente a Qwen3.6-27B, la mejora de generación en la misma GPU es sustancial (42,7 frente a 17,4 tok/s sin MTP), aunque parte de la diferencia proviene del uso de MTP y no solo de la generación del modelo.

## Limitaciones y advertencias

- Solo texto: las modalidades de visión y audio han sido eliminadas; no es posible procesar imágenes ni audio con este derivado.
- Idioma: el repositorio declara únicamente inglés. El rendimiento en castellano u otros idiomas no está documentado y debe validarse empíricamente.
- Modo thinking activado por defecto: si no se desactiva, el modelo genera cadenas de razonamiento largas que incrementan la latencia y el consumo de tokens; es un caveat importante para producción con requisitos de latencia.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks de calidad en la información disponible; conviene aplicar verificación externa en dominios sensibles.
- Sesgos: no documentados por el autor. Al ser un derivado sin reentrenamiento, hereda los sesgos del modelo base Qwen3.8-27B.
- Dependencia de versión de llama.cpp: MTP requiere un build del 2026-05-16 o posterior (commit `4f13cb7`+). Versiones anteriores ignorarán o fallarán al cargar los tensores MTP.
- Compatibilidad de runners limitada: no hay evidencia de soporte en vLLM, TGI u Ollama para estos ficheros concretos.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y mantener la atribución a Qwen, tal como indica el autor.
- Repositorio con tracción baja (295 descargas, 1 like): menor probabilidad de validación comunitaria y de corrección de erratas en la model card.
- Los benchmarks publicados son de throughput, no de calidad; no deben interpretarse como evidencia de superioridad en tareas cognitivas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OnlyTextLLMs/Qwen3.8-27B-OnlyText-GGUF
- Modelo OnlyText sin cuantizar: https://huggingface.co/OnlyTextLLMs/Qwen3.8-27B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Qwen: https://huggingface.co/Qwen
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Blog de AMD sobre Qwen 3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Benchmark de MTP en Strix Halo: https://calebcoffie.com/blog/benchmarking-llama-cpp-mtp-on-strix-halo
- Referencia de rendimiento en R9700: https://willitrunai.com/can-run/qwen-3.6-27b-on-radeon-ai-pro-r9700-32gb
- Qwen3.6-27B-MTP-GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.6-27B-MTP-GGUF
- PR de soporte MTP en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/22673
- Model card de referencia con MTP en RTX 5090: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
