# litert-community/Qwen3-0.6B

## Resumen

Qwen3-0.6B es el modelo mas pequeno de la familia Qwen3, desarrollado por el equipo Qwen de Alibaba. Se trata de un transformer denso de 0,6 mil millones de parametros con una ventana de contexto nativa de 32.768 tokens y modo de razonamiento explicito ("thinking mode") que puede activarse o desactivarse en tiempo de inferencia. Este repositorio concreto, publicado por la comunidad litert-community, no contiene los pesos originales en safetensors sino artefactos convertidos al formato LiteRT-LM (.litertlm) para su despliegue en Android y escritorio.

La relevancia de esta publicacion reside en el despliegue en dispositivo: incluye variantes cuantizadas a INT8 dinamico y a INT4 dinamico (bloque de 32) con pesos externos y operadores compuestos para la ruta GPU (OpenCL), ademas de una variante dirigida a la NPU MediaTek MT6993 en formato a16w8. El artefacto recomendado ocupa 328 MiB y mantiene el contexto de 4.096 tokens por defecto en sus metadatos, aunque fue exportado con una cache de 32.768 tokens.

El modelo base Qwen3-0.6B esta pensado para tareas de generacion de texto de baja latencia en movil, con soporte de tool calling gestionado por el propio runtime y capacidad de razonamiento multi-paso. La licencia Apache 2.0 del modelo original se mantiene en esta redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM con operadores compuestos para GPU |
| Parametros totales | 0,6 mil millones (modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; exportado con cache de 32.768 tokens |
| Tipos de cuantizacion | INT8 dinamico; INT4 dinamico con bloque de 32 y activaciones FP32; a16w8 para NPU MediaTek |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); pesos externos en seccion TFLiteWeights para la variante INT4 |

Artefactos disponibles:

| Fichero | Cuantizacion | Contexto | Tamano |
|---|---|---:|---:|
| `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` (recomendado) | INT4 dinamico (bloque 32), KV en float, operadores compuestos GPU, pesos externos | 4096 | 328 MiB |
| `Qwen3-0.6B.litertlm` | INT8 dinamico, KV en float | 4096 | 586 MB |
| `Qwen3-0.6B.mediatek.mt6993.litertlm` | a16w8 para NPU | 4096 | 992 MB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3, con atencion multi-cabeza, normalizacion RMSNorm, QK-norm y capas SwiGLU en el bloque feed-forward. La exportacion a LiteRT-LM convierte estas operaciones en kernels compuestos: RMSNorm, el paso QK-norm + RoPE, la atencion, SwiGLU y la actualizacion de la cache KV se ejecutan como operadores compuestos en la ruta GPU de LiteRT-LM, y las proyecciones QKV y Gate/Up estan fusionadas. La variante INT4 se exporto con `export_hf` de LiteRT Torch (commit `0a81bf6f3`) con `--apply_gpu_composites=True`, longitudes de prefill de 128 y 1024 y `--cache_length=32768`.

Los detalles de entrenamiento del modelo base (numero de tokens, composicion del corpus, si hubo RLHF o DPO) no estan disponibles en la informacion proporcionada; deben consultarse en la model card de Qwen/Qwen3-0.6B. Si se conoce que la configuracion oficial de Qwen3 en LiteRT-LM mantiene el modo thinking activado por defecto salvo que se pase `enable_thinking` a falso, que el razonamiento se entrega por un canal separado ("thought channel") y que las llamadas a herramientas las parsea el propio runtime. El tokenizer es el `tokenizer.json` de Qwen/Qwen3-0.6B (commit c1899de2) copiado byte a byte.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito activable o desactivable (`enable_thinking`).
- Razonamiento multi-paso: la cadena de pensamiento se emite por un canal dedicado y puede separarse del texto final.
- Tool calling / function calling: el runtime de LiteRT-LM parsea las llamadas a herramientas segun la plantilla oficial de Qwen3.
- Soporte de agentes: al integrarse con el parser de herramientas del runtime, permite bucles de agente de varios pasos en dispositivo.
- Capacidades multilingues limitadas: el repositorio declara unicamente `en`; el modelo base Qwen3 soporta mas idiomas, pero no se garantiza en esta exportacion.
- Manejo correcto de emojis como caracteres (verificado en la model card con la cadena `Good morning 😊 🚀`).
- Inferencia en GPU (OpenCL) y CPU en Android, y en escritorio (Mac incluido, con la version de runtime adecuada).

## Casos de uso

- Asistente conversacional offline en Android: el artefacto INT4 de 328 MiB cabe en el almacenamiento de un movil de gama media y permite conversaciones multi-turno sin conexion, con 4.096 tokens de contexto por defecto y hasta 32.768 si se configura la cache.
- Autocompletado y redaccion en teclados o apps de notas: la decodificacion a 81,4 tok/s en GPU de Galaxy S26 permite sugerencias en tiempo real con latencia percibida baja.
- Clasificacion y extraccion de informacion en el dispositivo: procesar correos, SMS o notificaciones localmente sin enviar datos a la nube, usando el modo thinking desactivado para minimizar latencia.
- Agentes locales con tool calling: el runtime parsea llamadas a funciones, lo que permite construir asistentes que consulten APIs locales (calendario, contactos, ficheros) en un bucle de varios pasos.
- Resumen de documentos cortos en movil: con 4.096 tokens de contexto se pueden resumir articulos o hilos de correo; para documentos mas largos hay que recurrir a la cache extendida de 32.768 tokens.
- Prototipado de aplicaciones LiteRT-LM en escritorio: validar prompts, plantillas de chat y comportamiento del modo thinking en Mac antes de portar la app a Android.
- Inferencia en dispositivos con NPU MediaTek MT6993: la variante a16w8 permite evaluar el rendimiento en acelerador dedicado frente a GPU y CPU.

## Benchmarks y rendimiento

Rendimiento medido por el autor en dispositivos comerciales con `litert_lm_advanced_main` (no son mediciones a nivel de aplicacion):

Variante `Qwen3-0.6B.litertlm` (INT8, contexto 4096, 256 tokens de prefill y 256 de decodificacion con LiteRT-LM v0.13.1):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada pico |
|---|---|---:|---:|---:|---:|
| Samsung SM-S937U1 | GPU OpenCL | 646,33 | 25,31 | 0,440 | 2940 MB |
| TECNO LJ9 | GPU OpenCL | 254,24 | 12,10 | 1,090 | 4283 MB |
| vivo V2502A | GPU OpenCL | 580 | 21 | no disponible | no disponible |
| Samsung SM-S937U1 | CPU | 212,0 | no disponible | no disponible | no disponible |

Variante `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` (INT4, contexto 4096, Galaxy S26 con LiteRT-LM 0.19.0 en GPU OpenCL, medido el 2026-10-29):

| Metrica | Valor |
|---|---|
| Prefill (1.024 tokens) | 3.442 tok/s |
| Decodificacion | 81,4 tok/s |
| Prefill del fichero anterior | 2.384 tok/s |
| Decodificacion del fichero anterior | 71,4 tok/s |

Consumo de memoria (prompt de 1.355 tokens, 256 tokens de decodificacion, cache KV de 2.048 tokens, RSS pico de `litert_lm_advanced_main`):

| Dispositivo | Fichero nuevo (LiteRT-LM 0.19.0) | Fichero anterior |
|---|---:|---:|
| Pixel 8a | 1.924–1.929 MiB | 1.495–1.580 MiB (0.19.0) |
| Galaxy S26 | 2.034–2.123 MiB | 1.658–1.765 MiB (0.18.0) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto INT4 ocupa 328 MiB en disco; el INT8, 586 MB; la variante NPU, 992 MB. En ejecucion, el RSS pico medido ronda 1,9–2,1 GiB con prompt de 1.355 tokens y cache KV de 2.048 tokens.
- GPU recomendadas: no requiere GPU de escritorio; la ruta GPU objetivo es OpenCL en SoC moviles (Snapdragon, Exynos, MediaTek). En escritorio se ha probado en Mac.
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para GPU integradas de moviles y Mac; no se han publicado mediciones en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM (runtime oficial). La variante INT4 con operadores compuestos requiere LiteRT-LM 0.19.0 o superior en GPU y 0.18.0 o superior en CPU. La variante INT8 requiere LiteRT-LM 0.18.0 o superior. No se ofrece GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 81,4 tok/s de decodificacion y 3.442 tok/s de prefill en Galaxy S26 con GPU OpenCL; 25,31 tok/s de decodificacion y TTFT de 0,440 s en Samsung SM-S937U1 con la variante INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia | Notas |
|---|---|---:|---|---|---|
| litert-community/Qwen3-0.6B (este) | 0,6 B | 4.096 por defecto (cache 32.768) | .litertlm (LiteRT-LM) | Apache 2.0 | Optimizado para Android y escritorio; GPU OpenCL y NPU MediaTek |
| Qwen/Qwen3-0.6B (original) | 0,6 B | 32.768 | safetensors | Apache 2.0 | Pesos de referencia; requiere runtime estandar (Transformers, vLLM, llama.cpp) |
| Gemma 3 270M | 0,27 B | no disponible en esta ficha | safetensors, GGUF, LiteRT | Gemma license | Alternativa de menor tamano para movil; licencia no Apache |
| SmolLM2-360M | 0,36 B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Alternativa de la misma categoria de modelos pequenos |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada. La diferencia principal de este repositorio frente al modelo original es el formato: pierde la portabilidad a runtimes genericos y gana optimizaciones especificas para LiteRT-LM (operadores compuestos, pesos externos, variante NPU).

## Limitaciones y advertencias

- Solo se declara soporte de ingles (`en`) en los metadatos; el rendimiento en castellano no esta verificado en esta exportacion.
- Modelo de 0,6 B de parametros: alta probabilidad de alucinacion en tareas de conocimiento factual y razonamiento complejo; adecuado para tareas acotadas, no para respuesta abierta de alta precision.
- El contexto por defecto en metadatos es de 4.096 tokens, aunque la cache se exporto a 32.768; usar contextos mayores requiere configuracion explicita y aumenta el consumo de memoria.
- La ruta GPU de la variante INT4 con operadores compuestos falla en LiteRT-LM 0.18.1 (no compilan los kernels compuestos) en Galaxy S26, Pixel 8a y Mac; es obligatorio 0.19.0 o superior.
- Las builds Android v0.18.0 y v0.18.1 se cuelgan al cargar ficheros con pesos externos (ver "Known runtime issues" en la model card).
- El fichero INT4 nuevo consume mas memoria en CPU que el anterior (1.924–1.929 MiB frente a 1.495–1.580 MiB en Pixel 8a); si la memoria es critica, puede convenir la revision `e6bb3e4a`.
- El artefacto legacy `qwen3_0_6b_mixed_int4.litertlm` fue retirado de `main` porque su plantilla de chat anterior a 0.18 eliminaba el turno del usuario en LiteRT-LM 0.18.0 y posteriores; no debe usarse.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el enlace al modelo base.
- Las mediciones de rendimiento son del autor en dispositivos comerciales y dependen de SKU, version de sistema, estado termico, modo de bateria, backend y version del runtime; no estan verificadas por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Revision del fichero INT4 anterior: https://huggingface.co/litert-community/Qwen3-0.6B/tree/e6bb3e4a1eb3f663153f0c1c12b735d64be657a7
