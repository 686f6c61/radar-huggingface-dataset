# Lygodactylus/Qwen3.8-27B-Uncensored-exl3-4bpw

## Resumen

Qwen3.8-27B-Uncensored-exl3-4bpw es una cuantizacion EXL3 de 4.0 bits por peso del modelo orcarouter/Qwen3.8-27B-Uncensored, una version abliterada (con el mecanismo de rechazo eliminado) del modelo Qwen/Qwen3.8-27B de Alibaba. El repositorio esta mantenido por Lygodactylus y esta construido con ExLlamaV3 1.4.6, conservando el modulo MTP (Multi-Token Prediction) a 8 bpw, lo que permite que el modelo actue como su propio redactor especulativo en TabbyAPI.

El modelo ocupa aproximadamente 16 GB en disco y cabe en una GPU de 24 GB con margen para contexto. Es relevante porque ofrece una alternativa sin restricciones de seguridad para investigacion y experimentacion controlada, con soporte para vision (torre de vision sin cuantizar a 16 bits) y generacion especulativa nativa. La licencia Apache 2.0 permite uso comercial, aunque el autor advierte explicitamente de que no tiene guardarraíles integrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con torre de vision y modulo MTP |
| Parametros totales | 8.536.421.616 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de cache en TabbyAPI; el ejemplo usa cache_size 32768) |
| Tipos de cuantizacion | EXL3 4.0 bpw (modelo de lenguaje), 6 bpw (lm_head), 8 bpw (MTP), 16-bit (vision tower y embeddings) |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con aproximadamente 27 mil millones de parametros (aunque los tensores safetensors de esta cuantizacion suman 8.536.421.616 parametros, reflejando la compresion de la cuantizacion EXL3). Incluye una torre de vision que permanece sin cuantizar a 16 bits, lo que sugiere capacidades multimodales. El proceso de abliteracion aplicado por orcarouter elimina sustancialmente el alineamiento de seguridad del modelo original, de modo que no rechaza peticiones que el Qwen3.8-27B estandar rechazaria.

La cuantizacion EXL3 se realizo con el script convert.py de ExLlamaV3, usando un corpus de calibracion por defecto (wiki 50, C4 20, code 20, random tokens 20, technical 10, multilingual 10, tiny 5) con 250 filas de 2048 columnas. El modulo MTP se conserva a 8 bpw, lo que permite decodificacion especulativa auto-drafting: el propio modelo genera tokens candidatos que luego verifica, acelerando la generacion sin necesidad de un modelo redactor separado. Las conversiones GGUF de esta familia pierden los tensores `mtp.*` y por tanto no tienen esta capacidad.

## Capacidades

- Generacion de texto conversacional y completado en ingles, frances y chino.
- Razonamiento y respuesta a instrucciones sin rechazo de contenido (abliterado).
- Vision: la torre de vision se conserva sin cuantizar a 16 bits, lo que indica soporte multimodal, aunque no se detallan capacidades especificas de vision en la documentacion.
- Decodificacion especulativa via modulo MTP a 8 bpw, que actua como redactor interno en TabbyAPI.
- Compatible con tensor parallelism en ExLlamaV3 para multiples GPUs.
- Sin guardarraíles integrados: cumple peticiones que el modelo original rechazaria.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin alineamiento de seguridad, comparando respuestas con el modelo original para analizar el efecto de la abliteracion en la utilidad y la seguridad.
- Experimentacion con decodificacion especulativa: al conservar el modulo MTP, es util para medir el impacto del auto-drafting en latencia y throughput frente a configuraciones sin MTP o con redactores externos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que el modelo base rechazaria por politicas de seguridad, en entornos de investigacion controlados.
- Evaluacion de cuantizacion EXL3: comparar la calidad de salida a 4.0 bpw frente a las variantes de 6.0 y 8.0 bpw del mismo modelo para decidir el punto optimo de compresion.
- Despliegue en hardware modesto: con 16 GB en disco y cabida en una GPU de 24 GB, es adecuado para probar inferencia local de un modelo de 27B en estaciones de trabajo con una sola GPU.
- Desarrollo de capas de moderacion: al carecer de guardarraíles, sirve como banco de pruebas para implementar y validar sistemas externos de filtrado y moderacion de contenido.

## Benchmarks y rendimiento

Los benchmarks publicados se obtuvieron con 4x RTX 4000 Ada (20 GiB, sm89), PCIe sin NVLink, 2x Xeon Gold 5318Y, ExLlamaV3 1.4.6 + TabbyAPI, tensor-parallel, cache_mode "8,8", MTP activado, AIPerf streaming con ignore_eos, seed 42 y warmup.

| Metrica (ISL 1000 / OSL 500 / conc. 4 / 20 requests) | 4.0 bpw | 6.0 bpw | 8.0 bpw |
|---|---|---|---|
| Tamano | 16 GB | 22 GB | 28 GB |
| Request latency | 19.906 ms | 20.816 ms | 21.145 ms |
| ITL | 33.5 ms | 35.0 ms | 36.2 ms |
| TTFT | 3.352 ms | 3.515 ms | 3.289 ms |
| Output throughput | 97 tok/s | 91 tok/s | 90 tok/s |

Comparativa con vLLM 0.28.0 FP8 (mismos pesos, build FP8):

| Metrica | vLLM FP8 | EXL3 6.0 bpw |
|---|---|---|
| Request latency | 14.158 ms | 20.816 ms |
| ITL | 26.3 ms | 35.0 ms |
| TTFT | 1.028 ms | 3.515 ms |

Con prompts largos (ISL 8000, conc. 2): vLLM TTFT 5.508 ms vs 9.481 ms; prefill 1.733 vs 1.277 tok/s.

Efecto del tensor parallelism (TP) en el mismo hardware:

| Metrica | TP off | TP on |
|---|---|---|
| Prefill TTFT (8k) | 17.644 ms | 9.577 ms |
| Single-stream generation | 63 tok/s | 34.6 tok/s |

Calidad: no se ha verificado a 4.0 bpw. Para referencia, el build FP8 del mismo modelo abliterado puntua 88.0% en MMLU-Pro (subset de negocio, 100 preguntas) frente al 89.0% del Qwen3.8-27B-FP8 oficial. El autor advierte que a 4.0 bpw se espera una degradacion medible frente a las variantes de 6 y 8 bpw.

## Requisitos de hardware

- VRAM estimada: 16 GB en disco; cabe en una GPU de 24 GB con margen para contexto (segun el autor).
- GPU recomendadas: RTX 4090, RTX 6000 Ada, A100 40/80 GB u otras con 24 GB o mas. El benchmark se realizo en 4x RTX 4000 Ada (20 GiB) con tensor parallelism.
- Consumer GPU: si, en una RTX 4090 de 24 GB o similar.
- Opciones de despliegue: TabbyAPI con ExLlamaV3 (configuracion recomendada), o ExLlamaV3 directamente. No es compatible con llama.cpp ni Ollama por el formato EXL3.
- Latencia y throughput: en el hardware de referencia, ITL de 33.5 ms y throughput de 97 tok/s con TP en 4 GPUs; 63 tok/s en single-stream sin TP. En una sola GPU consumer, el rendimiento sera inferior.
- Nota: el autor advierte que los resultados con TP en PCIe sin NVLink son un minimo; en sistemas con NVLink el rendimiento TP probablemente mejore.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-exl3-4bpw (este) | 27B (8.5B tensores cuantizados) | no disponible | Apache 2.0 | EXL3 safetensors | Abliterado, MTP a 8 bpw, vision 16-bit |
| Qwen3.8-27B-Uncensored-exl3-6bpw | 27B | no disponible | Apache 2.0 | EXL3 safetensors | Misma base, mayor fidelidad, 22 GB |
| Qwen3.8-27B-Uncensored-exl3-8bpw | 27B | no disponible | Apache 2.0 | EXL3 safetensors | Misma base, maxima fidelidad, 28 GB |
| Qwen3.8-27B-FP8 (oficial) | 27B | no disponible | Apache 2.0 | FP8 | Sin abliterar, con guardarraíles, mas rapido en vLLM |
| Qwen3.8-27B-Uncensored (GGUF) | 27B | no disponible | Apache 2.0 | GGUF | Pierde los tensores MTP, sin auto-drafting |

## Limitaciones y advertencias

- Seguridad: el alineamiento de seguridad se ha eliminado sustancialmente via abliteracion. El modelo cumple peticiones que el Qwen3.8-27B original rechaza y no tiene guardarraíles integrados. Solo para investigacion y experimentacion controlada.
- Calidad a 4.0 bpw: no se ha verificado con benchmarks; se espera una degradacion medible frente a las variantes de 6 y 8 bpw del mismo modelo.
- Rendimiento TP: los resultados con tensor parallelism se obtuvieron en PCIe sin NVLink y con `SymmMemCommunicator` no disponible en sm89; en otros sistemas los resultados pueden variar.
- Idiomas: solo se declaran en, fr y zh. No se garantiza calidad en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la documentacion; depende de la configuracion de cache en TabbyAPI.
- Formato propietario: el formato EXL3 solo es compatible con ExLlamaV3/TabbyAPI; no se puede usar con vLLM, llama.cpp u otros motores sin conversion.
- Responsabilidad: el autor declina responsabilidad sobre el uso del modelo; el usuario es responsable de lo que haga con el.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-4bpw
- Modelo base (abliterado): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante 6.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw
- Variante 8.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-8bpw
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
