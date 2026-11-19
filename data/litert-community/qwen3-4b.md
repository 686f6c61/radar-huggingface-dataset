# litert-community/Qwen3-4B

## Resumen

Qwen3-4B en formato LiteRT-LM es una conversión del modelo Qwen3-4B de Alibaba Qwen, empaquetada por la comunidad `litert-community` para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. El modelo base es un transformer denso de 4.000 millones de parámetros con soporte de modo de razonamiento (thinking) y tool calling, publicado bajo licencia Apache 2.0. Esta versión no altera la arquitectura del original: la adapta al formato `.litertlm`, con cuantizaciones INT8 e INT4 y kernels compuestos optimizados para GPU (OpenCL en Android, WebGPU en escritorio).

El interés de esta ficha reside en que permite ejecutar un modelo de 4B con ventana de contexto de 4.096 tokens directamente en teléfonos de gama alta y en GPUs de consumo, sin depender de servidores. La model card reporta métricas concretas: 526 tok/s de prefill y 19,5 tok/s de decodificación en un Galaxy S26 con la ruta GPU, y 1.327 tok/s de prefill y 87,5 tok/s de decodificación en una GPU de escritorio vía WebGPU.

Es relevante ahora porque el ecosistema LiteRT-LM ha estabilizado su ruta GPU (requiere la versión 0.19.0 o superior para el artefacto INT4) y porque el export de octubre de 2026 introduce pesos INT4 dinámicos con bloques de 32, ops compuestas para atención, RMSNorm, RoPE y SwiGLU, y proyecciones QKV y Gate/Up fusionadas, lo que reduce el coste de decodificación en hardware móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM con ops compuestas para GPU |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (por defecto en metadatos); caché KV exportada de hasta 32.768 tokens |
| Tipos de cuantizacion | INT8 channel-wise con KV float32; INT4 dinámico (bloque 32) con KV float y pesos externos |
| Idiomas soportados | inglés (declarado en la model card); el modelo base Qwen3-4B es multilingüe, pero esta conversión solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repositorio |

Artefactos disponibles:

| Fichero | Cuantizacion | Contexto | Tamano |
|---|---|---:|---:|
| `qwen3_4b_channelwise_int8_float32kv.litertlm` | INT8 channel-wise, KV float32 | 4.096 | 5,28 GB |
| `qwen3_4b_mixed_int4.litertlm` | INT4 dinámico (bloque 32), KV float, ops GPU, pesos externos | 4.096 | 2.167,64 MiB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer decoder-only denso de la familia Qwen3, entrenado por Alibaba Qwen. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esa información corresponde a la ficha de `Qwen/Qwen3-4B` y no se reproduce aquí. Lo que sí documenta esta ficha es el proceso de conversión: el artefacto INT4 se exportó con `export_hf` de LiteRT Torch (commit `0a81bf6f3`) usando `--apply_gpu_composites=True`, longitudes de prefill de 128 y 1.024 y `--cache_length=32768`.

La innovación técnica está en el grafo exportado: RMSNorm, el paso QK-norm más RoPE, la atención, SwiGLU y la actualización de la caché KV se implementan como ops compuestas (`odml.runtime_bmm`, `odml.cache_update`) para la ruta GPU de LiteRT-LM, y las proyecciones QKV y Gate/Up van fusionadas. Los pesos elegibles para cuantización usan INT4 por bloques de 32 con escalas en coma flotante; los embeddings de tokens se cuantizan a INT8 weight-only y las rutas de normalización, reducción y caché KV permanecen en coma flotante. Los pesos se almacenan en una sección `TFLiteWeights` al final del fichero (pesos externos), no dentro del grafo. El tokenizador es idéntico byte a byte al `tokenizer.json` de Qwen/Qwen3-4B.

## Capacidades

- Generación de texto en inglés con modo de razonamiento activado por defecto: el pensamiento se emite por un canal separado (`thought`) salvo que se pase `enable_thinking: false`.
- Razonamiento multi-paso dentro del canal de pensamiento, con la salvedad de que consume contexto de la ventana de 4.096 tokens.
- Tool calling / function calling: las llamadas a herramientas las parsea el propio runtime LiteRT-LM, no el modelo a nivel de texto libre.
- Generación de código y matemáticas, heredadas del modelo base Qwen3-4B.
- Conversación multi-turno con plantilla de chat oficial de Qwen3 integrada en la configuración LiteRT-LM.
- Ejecución en dispositivo con rutas CPU y GPU (OpenCL en Android, WebGPU en escritorio).
- No se documentan capacidades de visión, audio ni multimodalidad en esta conversión.

## Casos de uso

- Asistente conversacional offline en Android: con el artefacto INT4 (2,1 GB) y LiteRT-LM 0.19.0, el modelo cabe en la memoria privada de un teléfono de gama alta (1.609 MB de huella pico medida en un Galaxy S26) y decodifica a 19,5 tok/s, suficiente para respuestas interactivas sin conexión.
- Autocompletado y redacción en aplicaciones de escritorio: la ruta WebGPU alcanza 87,5 tok/s de decodificación y 1.327 tok/s de prefill en una GPU de escritorio, lo que permite integrar el modelo en editores de texto o herramientas ofimáticas con latencia de primera token de 0,20 s.
- Agentes locales con tool calling: el runtime parsea las llamadas a funciones, de modo que se puede construir un agente que consulte APIs locales o bases de datos sin salir del dispositivo; útil en entornos con requisitos de privacidad.
- Clasificación y extracción de información en lotes: con 4.096 tokens de contexto se pueden procesar documentos cortos (correos, tickets, fragmentos de código) en pipelines por lotes sobre GPU móvil, aceptando el throughput de 10-19 tok/s según el dispositivo.
- Prototipado de aplicaciones LiteRT-LM: el repositorio ofrece dos cuantizaciones con el mismo tokenizador y plantilla de chat, lo que permite comparar precisión INT8 frente a INT4 y elegir según la memoria disponible del dispositivo objetivo.
- Educación y demos de IA en dispositivo: un modelo de 4B con modo thinking ejecutable en un teléfono retail sirve para talleres y demostraciones sin infraestructura de servidor.
- Sustitución de llamadas a la nube en funciones de resumen: para resúmenes de conversaciones o notas de menos de 4.000 tokens, el coste marginal es cero y no hay exposición de datos a terceros.

## Benchmarks y rendimiento

Rendimiento medido por el autor de la conversión. Las filas de Android usan LiteRT-LM v0.13.1 con GPU OpenCL, 256 tokens de prefill y 64 de decodificación; la fila de escritorio usa WebGPU con 256 tokens de prefill y 32 de decodificación. Corresponden a iteraciones calentadas de una ejecución de dos iteraciones y son anteriores al reemplazo de octubre de 2026 del artefacto INT4.

| Dispositivo / Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada pico |
|---|---:|---:|---:|---:|
| GPU de escritorio, WebGPU | 1.327,33 | 87,52 | 0,20 | 1.697 MB |
| Samsung SM-S937U1, GPU OpenCL | 357,57 | 19,14 | 0,77 | 1.609 MB |
| vivo V2502A, GPU OpenCL | 170,66 | 12,67 | 1,58 | 4.722 MB |
| TECNO LJ9, GPU OpenCL | 104,37 | 10,86 | 2,54 | 4.906 MB |

Comparativa del nuevo export INT4 frente al fichero al que reemplaza (medido el 2026-10-29 con LiteRT-LM 0.19.0, 1.024 tokens de prefill, 256 de decodificación y caché KV de 2.048 tokens):

| Dispositivo / Ruta | Fichero | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|
| Galaxy S26, GPU | Nuevo INT4 dinámico | 526 | 19,5 |
| Galaxy S26, GPU | INT4 TorchAO anterior | 369 | 18,9 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son exclusivamente de rendimiento de inferencia.

## Requisitos de hardware

- VRAM/memoria: el artefacto INT8 ocupa 5,28 GB en disco; el INT4, 2.167,64 MiB. La huella privada pico medida va de 1.609 MB (Galaxy S26) a 4.906 MB (TECNO LJ9), dependiendo del backend y del driver.
- GPU de escritorio: se ha validado en una AMD Radeon AI PRO R9700 vía WebGPU. No hay datos publicados para A100, H100 ni RTX 4090 en esta conversión.
- GPU móvil: validado en Samsung SM-S937U1, vivo V2502A y TECNO LJ9 con OpenCL.
- GPU de consumo: al tratarse de un modelo de 4B cuantizado a INT4 (≈2,1 GB), es apto para GPUs de consumo con 6-8 GB de VRAM o más, aunque la model card solo documenta la Radeon AI PRO R9700 y las GPU móviles listadas.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (versión 0.18.0 o superior; 0.19.0 o superior para la ruta GPU del artefacto INT4). No se distribuyen pesos en GGUF ni safetensors, por lo que no es desplegable directamente en vLLM, llama.cpp, Ollama ni TGI sin reconvertir desde `Qwen/Qwen3-4B`.
- Latencia: TTFT de 0,20 s en escritorio WebGPU y de 0,77-2,54 s en los dispositivos Android medidos. Throughput de decodificación entre 10,86 y 87,52 tok/s según plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---:|---|---|---|
| litert-community/Qwen3-4B (esta ficha) | 4B denso | 4.096 | `.litertlm`, LiteRT-LM | Apache 2.0 | Optimizado para GPU móvil y WebGPU; dos cuantizaciones |
| Qwen/Qwen3-4B (original) | 4B denso | no disponible en esta ficha | safetensors, vLLM/TGI/transformers | Apache 2.0 | Modelo de referencia; sin optimización on-device |
| Alternativas on-device de 3-4B en LiteRT-LM | no disponible | no disponible | `.litertlm` | no disponible | No se han identificado en la información proporcionada |

La comparación de calidad frente al original no puede establecerse con los datos disponibles: la model card solo reporta que el nuevo export INT4 produce las mismas respuestas que el fichero medido y que el tokenizador es idéntico al original.

## Limitaciones y advertencias

- Contexto efectivo de 4.096 tokens: con el modo thinking activado por defecto y sin límite de presupuesto de razonamiento, el canal de pensamiento puede agotar la ventana antes de emitir la respuesta. El fichero anterior tenía solo 2.048 tokens de contexto, lo que agravaba este problema.
- Idiomas: la model card declara únicamente inglés, aunque el modelo base Qwen3-4B es multilingüe; no hay validación de otros idiomas en esta conversión.
- Dependencia estricta del runtime: la ruta GPU del artefacto INT4 requiere LiteRT-LM 0.19.0 o superior; con 0.18.x en GPU falla la compilación de los kernels compuestos en Galaxy S26 y Mac. Las builds Android 0.18.0 y 0.18.1 además se cuelgan con ficheros de pesos externos.
- Problemas conocidos del runtime: la model card remite a una sección de "Known runtime issues" que no se detalla en la información disponible, pero afecta a la plantilla de chat de Qwen3 compartida por ambos artefactos.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente a un modelo de 4B y debe mitigarse con verificación externa en producción.
- Sesgos: no documentados en la model card; el modelo base Qwen3-4B puede heredar sesgos de sus datos de entrenamiento, no descritos aquí.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso de licencia enlaza al fichero LICENSE de `Qwen/Qwen3-4B`, por lo que conviene revisar los términos del modelo base.
- Benchmarks de rendimiento desactualizados: las cifras de la tabla principal son anteriores al reemplazo de octubre de 2026 del artefacto INT4 y se midieron con LiteRT-LM v0.13.1; las cifras del nuevo export solo cubren Galaxy S26 y Mac.
- Resultados no verificados por terceros: el autor declara que las mediciones se hicieron en dispositivos retail y no están afiliadas ni verificadas por Samsung, Qualcomm, MediaTek, Google, MLCommons ni Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Paper de Qwen3 (referencia arXiv citada en los tags): https://arxiv.org/abs/2505.09388
- Revisión del artefacto INT4 anterior: `a45912eb8a7b33d6cb92aac6a08524b9463faec0` en el mismo repositorio
- LiteRT-LM (runtime): no se proporciona URL en la información disponible
