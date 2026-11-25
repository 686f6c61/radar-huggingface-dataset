# kapitoshkina-ai/ERNIE-5.5-Flash-Preview-WHT128-HLUT4

## Resumen

ERNIE-5.5-Flash-Preview-WHT128-HLUT4 es una cuantización de alta precisión del checkpoint maestro `baidu/ERNIE-5.5-Flash-Preview-BF16`, publicada por el usuario `kapitoshkina-ai`. Se trata de un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 300B parámetros totales y 14B parámetros activos por token, derivado de la familia ERNIE 5.5 Flash de Baidu. La cuantización emplea un esquema propietario denominado WHT128-HLUT4, que combina una rotación de Walsh-Hadamard de 128 puntos con 16 centroides Lloyd-Max aprendidos en FP16 y realimentación de error mediante Cholesky (LDLQ), alcanzando 4.125 bits por peso (bpw) en los expertos enrutados.

El interés de esta ficha radica en que no es una cuantización convencional: mantiene el "spine" no-experto (capas de atención, expertos compartidos, routers, cabecera LM) en BF16/FP32 sin cuantizar, preserva la caché KV de 1.048.576 tokens en BF16 sin pérdida y conserva el indexador disperso DSA en BF16/FP32, mientras comprime los 23.040 expertos enrutados (incluidos los 3 niveles de borrador paralelo DSpark) a 4.125 bpw. Según la model card, esto permite ejecutar el modelo en hardware HBM2 estándar (por ejemplo, AMD gfx906) y en Tenstorrent Blackhole, sin necesidad de tensor cores FP4 de clase Blackwell.

El modelo está pensado para generación de texto con contexto muy largo (1M tokens), decodificación especulativa nativa mediante DSpark y despliegue en entornos con requisitos estrictos de fidelidad numérica. La licencia es Apache-2.0 y el repositorio no contiene pesos en el momento de la consulta (tamaño de 0.0 GB), por lo que la información disponible proviene exclusivamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención HCA/MLA-DSA, decodificación especulativa DSpark y indexador disperso DSA |
| Parametros totales | 300B |
| Parametros activos | 14B |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | WHT128-HLUT4 (4.125 bpw) en expertos enrutados; BF16/FP32 sin cuantizar en spine no-experto, indexador DSA y caché KV; FP8 E4M3FN solo en la cabecera de propuesta DSpark |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (la model card menciona 74 shards BF16 del maestro y SHA256SUMS; el formato de los pesos cuantizados no se especifica) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 42 capas de backbone MoE y 3 capas nativas DSpark de borrador paralelo (`model.mtp.{0,1,2}`), sumando 23.040 expertos enrutados. Emplea atención con capas HCA (37) y MLA-DSA (6), un indexador disperso DSA con selección Top-2048 y una caché KV de 1.048.576 tokens. La función de activación de los expertos es SiTU-GLU con parámetros 4.0 y 25.0, y el vocabulario es de 201.216 tokens. La decodificación especulativa DSpark usa una cabecera de propuesta en FP8 E4M3FN verificada contra la cabecera LM de 16 bits.

La cuantización se realizó directamente desde el checkpoint maestro sin cuantizar `baidu/ERNIE-5.5-Flash-Preview-BF16` (unos 600 GB en 74 shards BF16), sin proyecciones de dirección de rechazo, sin fusiones LoRA y sin fine-tuning. El proceso WHT128-HLUT4 aplica una rotación Hadamard de 128 puntos a los pesos de los expertos, los cuantiza con 16 centroides Lloyd-Max aprendidos en FP16 y usa realimentación de error Cholesky en FP64 (LDLQ) con 524.288 tokens de calibración. La model card reporta un SQNR medio de 19,3858 dB en 45 capas y una KLD mediana post-cabecera de 0,012301 nats (coseno 0,999066) frente a BF16. No se dispone de información sobre el dataset de entrenamiento original de Baidu ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de hasta 1.048.576 tokens.
- Razonamiento multi-paso y decodificación especulativa nativa mediante las 3 capas DSpark de borrador paralelo.
- Selección dispersa de contexto mediante el indexador DSA con Top-2048, orientado a eficiencia en contextos largos.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 1M tokens en una sola pasada, gracias a la caché KV BF16 sin pérdida y al indexador DSA Top-2048, que reduce el coste de atención en ventanas largas.
- Asistentes de código sobre repositorios completos: con 1M de contexto es posible cargar árboles de código y documentación asociada para tareas de refactorización o revisión, siempre que se valide empíricamente la calidad en código (no hay benchmarks disponibles).
- Despliegue en hardware no-Blackwell: la cuantización a 4.125 bpw con acumulador FP32 permite ejecutar los expertos en GPUs con HBM2 (por ejemplo, AMD gfx906) o en Tenstorrent Blackhole, según los kernels publicados en el repositorio del autor.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el impacto de esquemas WHT + Lloyd-Max + LDLQ frente a MXFP4, con métricas de SQNR y KLD publicadas.
- Pipelines de generación de texto de alta fidelidad numérica: al mantener el spine, el indexador y la caché KV en BF16/FP32, es adecuado para tareas donde la cuantización agresiva del resto de componentes degrada la coherencia en contextos muy largos.
- Evaluación comparativa de decodificación especulativa: las 3 capas DSpark cuantizadas permiten medir la degradación de la tasa de aceptación del borrador frente al maestro BF16 en entornos con recursos limitados.
- Servicio de chat con contexto largo en producción: requiere validar latencia y throughput reales, no publicados en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la cuantización frente a BF16:

| Metrica | Valor |
|---|---|
| SQNR medio (45 capas) | 19,3858 dB |
| KLD mediana post-cabecera | 0,012301 nats |
| Similitud coseno vs BF16 | 0,999066 |
| Tamaño de expertos enrutados | 139,22 GiB |
| Bits por peso (expertos) | 4,125 bpw |
| Tokens de calibración | 524.288 |
| Aciertos TopK del indexador | 13.056 / 13.056 exactos |
| Aceleración del indexador a 262K | 5,19x |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; los expertos enrutados ocupan 139,22 GiB en el esquema WHT128-HLUT4, a lo que hay que sumar el spine no-experto en BF16/FP32 y la caché KV BF16 de hasta 1M tokens.
- GPU recomendadas: AMD gfx906 (según los kernels HIP del autor) y Tenstorrent Blackhole (según los kernels publicados); no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo y de la caché KV hace improbable su ejecución en GPUs de consumo convencionales.
- Opciones de despliegue: el autor publica un motor propio en C++17 con kernels HIP para gfx906 y Tenstorrent; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta cuantización concreta.
- Latencia y throughput: no disponibles, salvo la aceleración relativa del indexador DSA (5,19x a 262K) reportada en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-WHT128-HLUT4 (este) | 300B totales / 14B activos | 1.048.576 | WHT128-HLUT4 4,125 bpw + spine BF16/FP32 | Apache-2.0 | Repositorio vacío (0,0 GB) en la fecha de consulta |
| baidu/ERNIE-5.5-Flash-Preview | 300B totales / 14B activos | 1.048.576 | MXFP4 W4A8 + spine FP8 + KV FP8 | Apache-2.0 | Disponible en Hugging Face |
| baidu/ERNIE-5.5-Flash-Preview-BF16 | 300B totales / 14B activos | 1.048.576 | BF16 sin cuantizar (~600 GB) | Apache-2.0 | Disponible en Hugging Face |
| DeepSeek-V4.1-Flash-1017-WHT128-HLUT3 | no disponible | no disponible | WHT128-HLUT3 | no disponible | Disponible en Hugging Face (kapitoshkina-ai) |
| Hy4-flash-WHT128-HLUT4 | no disponible | no disponible | WHT128-HLUT4 | no disponible | Disponible en Hugging Face (kapitoshkina-ai) |

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0,0 GB en la fecha de consulta: los pesos podrían no estar publicados o estar en proceso de subida, lo que impide su uso inmediato.
- No hay información sobre idiomas soportados ni sobre evaluación multilingüe.
- No hay benchmarks de calidad (MMLU, HumanEval, GSM8K u otros); solo métricas de fidelidad de cuantización, que no garantizan el rendimiento downstream.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de veracidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue requiere el motor propietario del autor (C++17 con HIP/Tenstorrent), lo que limita la portabilidad frente a stacks estándar como vLLM.
- La cuantización está optimizada para gfx906 y Tenstorrent Blackhole; no se garantiza compatibilidad con CUDA, ROCm genérico ni GPUs de consumo.
- El uso de la caché KV BF16 a 1M tokens implica un consumo de memoria elevado que puede hacer inviable el despliegue en entornos con VRAM limitada.
- La model card incluye afirmaciones no verificables de forma independiente (SQNR, KLD, exactitud del indexador) que conviene validar en el caso de uso concreto.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/kapitoshkina-ai/ERNIE-5.5-Flash-Preview-WHT128-HLUT4
- Modelo base BF16: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Cuantización oficial de referencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Repositorio del motor (C++17 / HIP / Tenstorrent): https://github.com/bespokeontology/ernie55-flash-preview-wht128-hlut4
- Blog técnico de vLLM sobre ERNIE-5.5-Flash-Preview: https://vllm.ai/blog/2026-11-24-ernie-5-5-flash-preview
- Release companion WHT128 (DeepSeek-V4.1-Flash): https://huggingface.co/kapitoshkina-ai/DeepSeek-V4.1-Flash-1017-WHT128-HLUT3
- Release companion WHT128 (Hy4-flash): https://huggingface.co/kapitoshkina-ai/Hy4-flash-WHT128-HLUT4
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
