# auRose94/Flint-40B-A2.5B-iq4nl-GGUF

## Resumen

Flint-40B-A2.5B-iq4nl-GGUF es una recuantización en formato GGUF del modelo base RecursiveSI/flint, publicada por el usuario auRose94. Se trata de una arquitectura Mixture of Experts (MoE) con 39.785.287.456 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, según indica el propio nombre del modelo. El resultado es un fichero de 21,21 GiB que se carga en llama.cpp, Ollama y LM Studio sin necesidad de forks ni parches.

La relevancia de esta publicación es doble. Por un lado, materializa el modelo en un grid IQ4_NL determinista (clase 4,25 bits por peso) para el cuerpo del transformer, manteniendo los embeddings y la cabeza de salida en Q8_0 sobre el grid exacto del contenedor original "k99". Por otro, el autor documenta de forma explícita el coste en calidad de esta compresión: la perplejidad sube de 23,74 (Q4_K_M estándar) a 27,56, con una degradación de +4,7 puntos porcentuales frente a Q8_0.

El modelo se presenta como "reasoning-first", con un modo de pensamiento obligatorio que requiere presupuestos de tokens generosos para rendir correctamente. La licencia es Apache-2.0, heredada del modelo base, y el repositorio incluye plantillas de chat adaptadas para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 39.785.287.456 |
| Parametros activos | ~2.500 millones (según nombre del modelo, no verificado en la model card) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ4_NL (cuerpo, 481 tensores) + Q8_0 (embeddings y lm_head) + fp16/fp32 (293 tensores pequeños) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card de esta recuantización no describe la arquitectura interna del modelo base más allá de identificarlo como MoE. Los detalles disponibles se refieren al proceso de cuantización: el cuerpo del transformer (481 tensores) se reempaqueta como IQ4_NL con un grid RTN de tipo `d = |amax|/113`, mientras que los 293 tensores pequeños (normas, QK-RMSNorms por cabeza, attention sinks, routers y biases) se copian literalmente en fp16/fp32. Los tensores de embedding de tokens y de la cabeza de salida se mantienen en el grid exacto k99 y se almacenan como Q8_0 para preservar la fidelidad de la cabeza.

El autor indica que el proceso parte de la decodificación de su contenedor previo `auRose94/Flint-40B-A2.5B-ninths-k63-e99-GGUF` y que la canalización de cuantización está disponible en el repositorio `auRose94/base9-quantization` (ruta `experiments/glm_k9_build.py`). No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card sí menciona que Flint es un modelo "reasoning-first" con pensamiento obligatorio, lo que sugiere un entrenamiento orientado a cadenas de razonamiento largas.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento con modo de pensamiento obligatorio: el autor advierte que no deben forzarse presupuestos cortos de `max_tokens`.
- Razonamiento multi-paso: la batería de código del autor pasó de 4/24 a 22/24 aciertos al subir el presupuesto de 480 a 6000 tokens, lo que evidencia dependencia de cadenas de razonamiento largas.
- Generación de código: evaluada de forma interna por el autor mediante una "coding battery" (sin datos públicos de detalle).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento con presupuesto amplio en producción: el modelo requiere presupuestos de generación largos (el autor cita hasta 6000 tokens para tareas de código), por lo que encaja en pipelines donde la latencia no es crítica y prima la calidad del razonamiento encadenado.
- Asistencia a la programación en local: con 21,21 GiB y carga en llama.cpp, Ollama o LM Studio, puede desplegarse en estaciones de trabajo con GPU de gama alta o en equipos con memoria unificada grande (el autor lo midió en un Ryzen AI Max+ 395 con Radeon 8060S).
- Despliegue en hardware de consumo con memoria unificada: el tamaño del fichero permite ejecutarlo en equipos con 24-32 GB de memoria compartida, algo inviable para modelos densos de 40B en 4 bits.
- Experimentación en investigación sobre cuantización: el repositorio documenta perplejidad, KL divergence y throughput, lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de IQ4_NL frente a Q4_K_M y Q8_0.
- Servicio de chat conversacional autoalojado: la inclusión de `chat_template_llamacpp.jinja` permite montar un `llama-server` con plantilla de chat funcional sin modificar el binario.
- Prototipado de agentes con razonamiento multi-paso: la arquitectura MoE con ~2,5B parámetros activos reduce el coste computacional por token frente a un denso de 40B, lo que abarata iteraciones largas de razonamiento.
- Evaluación comparativa de recuantizaciones: útil para equipos que necesitan decidir entre Q4_K_M estándar y esta variante IQ4_NL en función del equilibrio velocidad/calidad.

## Benchmarks y rendimiento

Datos medidos por el autor en un equipo A9 Mega (Ryzen AI Max+ 395 / Radeon 8060S, ROCm/HIP):

| Variante | Tamano | PPL (wiki2 300k) | pp512 | tg128 | Carga |
|---|---|---|---|---|---|
| Q8_0 estándar (ggml-org) | 39,44 GiB | 22,8678 ± 0,511 | 1430 | 50,0 | ~15 s |
| Contenedor ninths k63/e99 | 26,54 GiB | 23,6822 ± 0,536 | 1452 | 49,9 | ~36 s |
| Q4_K_M estándar (ggml-org) | 21,78 GiB | 23,7434 ± 0,536 | 1589 | 56,2 | ~13 s |
| Esta recuantización (IQ4_NL) | 21,21 GiB | 27,5552 ± 0,642 | 1701 | 67,4 | ~12 s |

Protocolo KL frente a la base bf16 (exp27 mini-KLD, slice de 60 KB):

| Candidato | PPL(Q)/PPL(base) |
|---|---|
| Q8_0 estándar | 1,0395 |
| Q4_K_M estándar | 1,0628 |
| Contenedor ninths k63/e99 | 1,0811 |
| Esta recuantización | 1,2267 (ln 0,2044 ± 0,0180, Cor 93,3%) |

El propio autor señala que, a este bpw, el grid de 4 bits penaliza a Flint más que a los exports de GLM/Qwen (+4,7 pp sobre Q8_0) y que esta variante es la opción más rápida y pequeña de la tabla, no la de mayor calidad.

## Requisitos de hardware

- VRAM/memoria estimada: 21,21 GiB para el fichero de pesos; se recomienda al menos 24 GB de memoria disponible para inferencia con contexto moderado.
- GPU recomendadas: el autor validó en Ryzen AI Max+ 395 con Radeon 8060S (ROCm/HIP). Para GPU dedicadas, se requiere al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con margen limitado); para contexto amplio, A100 40 GB, H100 o GPUs de 48 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB) con contexto moderado; en tarjetas de 16 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (el autor confirma carga en stock sin forks). vLLM y TGI no están confirmados en la información disponible.
- Throughput medido (Ryzen AI Max+ 395): pp512 = 1701 tokens/s, tg128 = 67,4 tokens/s, carga ~12 s.
- Plantilla de chat: usar `chat_template_llamacpp.jinja` con `--chat-template-file` en `llama-server`, ya que el GGUF no incluye KV de plantilla por diseño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL wiki2 | Licencia | Formato |
|---|---|---|---|---|---|
| Flint-40B-A2.5B IQ4_NL (esta ficha) | 39,8B totales / ~2,5B activos | no disponible | 27,5552 | Apache-2.0 | GGUF |
| Flint-40B-A2.5B Q4_K_M (ggml-org) | 39,8B totales / ~2,5B activos | no disponible | 23,7434 | Apache-2.0 | GGUF |
| Flint-40B-A2.5B Q8_0 (ggml-org) | 39,8B totales / ~2,5B activos | no disponible | 22,8678 | Apache-2.0 | GGUF |
| Contenedor ninths k63/e99 (auRose94) | 39,8B totales / ~2,5B activos | no disponible | 23,6822 | Apache-2.0 | GGUF |

No se dispone de comparaciones con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube a 27,56 frente a 22,87 de Q8_0 y 23,74 de Q4_K_M; el autor lo califica explícitamente como opción de velocidad y tamano, no de calidad.
- Divergencia KL elevada: ratio PPL(Q)/PPL(base) de 1,2267, muy por encima de Q4_K_M (1,0628) y Q8_0 (1,0395).
- Pensamiento obligatorio: forzar `max_tokens` cortos degrada gravemente el rendimiento (4/24 frente a 22/24 en la batería de código del autor). No es apto para escenarios con límites estrictos de latencia o tokens.
- Sin plantilla de chat en el GGUF: es necesario pasar `chat_template_llamacpp.jinja` manualmente; la plantilla original contiene un `\x00` literal que el lexer jinja de llama.cpp no puede parsear.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no documentada: el ejemplo de uso emplea 8192 tokens, pero no se especifica el máximo del modelo base.
- Sesgos y alucinaciones: no documentados en la información disponible; aplican los riesgos habituales de un modelo de razonamiento con decodificación larga.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base RecursiveSI/flint por si añade restricciones adicionales.
- Repositorio con muy poca tracción: 152 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las métricas publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/auRose94/Flint-40B-A2.5B-iq4nl-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Contenedor previo del autor: https://huggingface.co/auRose94/Flint-40B-A2.5B-ninths-k63-e99-GGUF
- Repositorio de cuantización: https://github.com/auRose94/base9-quantization
