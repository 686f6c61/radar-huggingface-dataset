# codavidgarcia/Qwen3.8-27B-Uncensored-Heretic-MTP-UD-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Heretic-MTP-UD-GGUF es una colección de cuantizaciones GGUF publicada por el usuario codavidgarcia sobre los pesos de llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved. No es un modelo entrenado desde cero: es un trabajo de cuantización selectiva (receta "UD", per-tensor, de Unsloth) aplicada tensor a tensor sobre unos pesos ya modificados para eliminar rechazos. El objetivo declarado es que tanto el tronco del modelo como su cabeza MTP nativa quepan íntegramente en VRAM en tarjetas de consumo de 12, 16 y 24 GB.

El modelo base tiene 27.320.697.856 parámetros (27,3 mil millones). La innovación práctica del repo es conservar el bloque MTP (`blk.64`) en q6_K/q8_0 en todas las variantes, de modo que la decodificación especulativa multi-token siga funcionando dentro de llama.cpp con una tasa de aceptación alta (83 % en código, 58-61 % en prosa). Según las mediciones del propio autor, esto prácticamente duplica la velocidad de decodificación en su hardware de referencia (RTX 4080 de 16 GB).

Se publican tres ficheros: UD-IQ3_XXS (10,18 GiB, para 12 GB), UD-IQ4_XS (13,27 GiB, para 16 GB) y UD-Q5_K_XL (19,44 GiB, para 24 GB). La licencia declarada es Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no indica idiomas soportados ni el contexto nativo máximo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. llama.cpp reporta un "recurrent state" de 449 MiB, lo que sugiere componentes recurrentes o hibridos, pero no hay confirmacion oficial |
| Parametros totales | 27.320.697.856 (27,3 B), dato real de safetensors |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible el maximo nativo. Contextos de servicio recomendados por el autor: 32K (16 GB), 16K (12 GB), 64K (24 GB) |
| Tipos de cuantizacion | IQ3_XXS (10,18 GiB), IQ4_XS (13,27 GiB), Q5_K_XL (19,44 GiB). Cabeza MTP en q6_K / q8_0 en todas las variantes. KV cache en q4_0 en los ejemplos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO). Lo que si se documenta es el proceso de posprocesado en dos etapas. La primera la realizo llmfan46: partiendo de Qwen3.8-27B, aplico una tecnica de eliminacion de rechazos (Heretic v2, MPOA) que, segun su propia model card citada aqui, reduce los rechazos a 3/100 y produce una divergencia KL de 0,0244 frente al Qwen3.8-27B original. La segunda es la de este repositorio: cuantizacion GGUF aplicando la receta per-tensor "UD" de Unsloth, copiada tensor a tensor desde la receta del Qwen3.8-27B base hacia los pesos de llmfan46.

El elemento tecnico diferencial es la preservacion del bloque MTP (`blk.64`), que se mantiene en q6_K/q8_0 en los tres niveles de cuantizacion. Esto permite usar decodificacion especulativa nativa (`--spec-type draft-mtp`) dentro de llama.cpp. El autor mide que dos tokens de borrador superan a tres en las mismas semillas (68 frente a 56 tok/s en codigo y 55 frente a 36 tok/s en prosa, a 40K de contexto), porque se rechazan menos borradores. Tambien comprueba que mantener la cabeza MTP en q6_K apenas cambia la aceptacion (83 % frente a 83 % en codigo, 58 % frente a 54 % en prosa) respecto a una cuantizacion con la cabeza en IQ3_S: la ganancia de calidad de estos ficheros viene del tronco, no de la cabeza.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Modo de razonamiento configurable: la plantilla de chat acepta `reasoning_effort` con valores `none`, `low`/`minimal`, `medium` (por defecto) o `high`/`xhigh`, ademas de `chat_template_kwargs.enable_thinking`.
- Soporte de herramientas (tool calling): la model card menciona que el razonamiento permanece activo cuando hay herramientas presentes salvo que se active `auto_disable_thinking_with_tools`.
- Decodificacion especulativa nativa mediante cabeza MTP integrada en el propio GGUF.
- Generacion de codigo, con mediciones especificas sobre un fichero fuente de C++ de 15.216 tokens.
- Generacion de prosa, evaluada de forma separada en las tablas de divergencia KL y de velocidad.
- Comportamiento "uncensored": el modelo respondera a peticiones que el Qwen3.8-27B original rechaza. Esto es una caracteristica declarada, no una capacidad adicional verificada de forma independiente.
- Capacidades multimodales, de audio o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local en estacion de trabajo: con UD-IQ4_XS en una GPU de 16 GB y 32K de contexto, el modelo procesa prompts largos (se midio con un fuente C++ de 15.216 tokens a ~1.360 tok/s de prompt eval) y genera a 55 tok/s, suficiente para autocompletado asistido y refactorizacion interactiva sin salir de la maquina.
- Despliegue en portatil o equipo con GPU de 12 GB: la variante UD-IQ3_XXS ocupa 10,18 GiB de pesos y, segun los calculos del autor a partir de los buffers de llama.cpp (10.020 MiB de pesos + 449 MiB de estado recurrente + ~260 MiB de computo + ~22 KB por token de KV), cabria con unos 32K de contexto en una tarjeta headless de 12 GB.
- Servicio de generacion con throughput alto en una sola GPU de 24 GB: UD-Q5_K_XL a 64K de contexto (~22,4 GB calculados) deja el modelo practicamente indistinguible de un Q8_0 (KLD 0,0045 en prosa y 0,0037 en codigo) manteniendo la cabeza MTP activa.
- Investigacion sobre cuantizacion y decodificacion especulativa: el repositorio publica KLD, coincidencia top-1 y tasas de aceptacion de MTP por nivel, lo que lo convierte en un banco de pruebas util para estudiar el compromiso calidad/velocidad en cuantizaciones de 27B.
- Procesado por lotes de documentos tecnicos: con `-np 1`, contexto de 32-64K y prompt eval de ~1.360-1.500 tok/s, encaja en tareas de resumen, extraccion o reescritura de ficheros de codigo y documentacion extensos.
- Experimentacion con flujos tipo agente que requieren tool calling y multiples pasos: el soporte de plantilla con `reasoning_effort` y `enable_thinking` permite alternar entre respuestas rapidas y cadenas de razonamiento largas segun el paso del agente.
- Prototipado de aplicaciones conversacionales sin filtros de contenido, asumiendo la responsabilidad legal y etica indicada por el autor en el apartado de advertencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Lo que si se publica es una evaluacion de calidad de cuantizacion y de velocidad, medida por el autor.

Calidad frente a Q8_0 del mismo BF16 (menor KLD es mejor):

| Nivel | Cuantizacion | GiB | KLD prosa | KLD codigo | Coincidencia top-1 (prosa / codigo) |
|---|---|---|---|---|---|
| 24 GB | UD-Q5_K_XL (este repo) | 19,44 | 0,0045 | 0,0037 | 97,2 % / 98,5 % |
| 16 GB | mradermacher i1-IQ4_XS | 14,26 | 0,0202 | 0,0149 | 94,3 % / 96,8 % |
| 16 GB | UD-IQ4_XS (este repo) | 13,27 | 0,0268 | 0,0192 | 93,2 % / 96,5 % |
| 16 GB | llmfan46 Q3_K_M | 13,48 | 0,0639 | 0,0456 | 89,3 % / 95,0 % |
| 16 GB | mradermacher i1-IQ3_M | 11,89 | 0,0649 | 0,0465 | 89,8 % / 94,9 % |
| 12 GB | UD-IQ3_XXS (este repo) | 10,18 | 0,0904 | 0,0587 | 87,4 % / 94,5 % |
| 12 GB | mradermacher i1-Q2_K | 10,12 | 0,1551 | 0,1017 | 82,9 % / 92,6 % |

Velocidad medida en una RTX 4080 de 16 GB, llama.cpp b11457 (CUDA 13.4), MTP activado, 2 tokens de borrador, `ubatch 256`, KV cache q4_0, 32K de contexto, prompt de 15.216 tokens, respuestas de 600 tokens, media de 3 semillas fijas:

| Cuantizacion | Codigo | Prosa | Aceptacion MTP (codigo / prosa) | Prompt eval |
|---|---|---|---|---|
| UD-IQ4_XS (este repo) | 55 tok/s (49-62) | 50 tok/s | 83 % / 58 % | ~1.360 tok/s |
| UD-IQ3_XXS (este repo) | 77 tok/s | 65 tok/s | 83 % / 61 % | ~1.440 tok/s |
| mradermacher i1-IQ3_M | 70 tok/s | 54 tok/s | 83 % / 54 % | ~1.480 tok/s |
| mradermacher i1-Q2_K | 72 tok/s | 59 tok/s | 79 % / 53 % | ~1.160 tok/s |
| llmfan46 Q3_K_M | 42 tok/s (32-50) | 41 tok/s | 84 % / 61 % | ~1.200 tok/s |
| UD-IQ4_XS sin MTP (`ubatch 512`, sin semilla) | 29 tok/s | 29 tok/s | — | ~1.500 tok/s |

## Requisitos de hardware

- VRAM de pesos: 10,18 GiB (UD-IQ3_XXS), 13,27 GiB (UD-IQ4_XS), 19,44 GiB (UD-Q5_K_XL).
- VRAM total estimada con contexto: ~11,6 GB a 32K con UD-IQ3_XXS; UD-IQ4_XS queda "al limite" de 16 GB y se recomienda no pasar de 32K si hay escritorio en la misma GPU; UD-Q5_K_XL requiere ~22,4 GB a 64K.
- GPU objetivo declaradas: tarjetas de 12 GB, 16 GB y 24 GB. La medicion real se hizo en una RTX 4080 de 16 GB (CUDA 13.4).
- Cabe en GPU de consumo: si, en las tres variantes segun su nivel. En 12 GB el autor no llego a probarlo en hardware real (las cifras a 32K son calculadas a partir de los buffers de llama.cpp); en 16 GB el margen es estrecho y en 24 GB el autor tampoco lo midio, solo lo calculo.
- Despliegue: llama.cpp / `llama-server` (los ejemplos de la model card usan `-ngl 99`, `--flash-attn on`, `-ub 256`, `-ctk q4_0 -ctv q4_0`, `--spec-type draft-mtp --spec-draft-n-max 2`). El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo endpoint, aunque no se detalla. No se mencionan vLLM ni TGI para estos ficheros.
- Throughput medido: 55 tok/s en codigo con UD-IQ4_XS (49-62) y 77 tok/s con UD-IQ3_XXS en la misma tarjeta de 16 GB; prompt eval de ~1.360-1.500 tok/s.
- Advertencia de rendimiento: cuando el modelo desborda la VRAM, Windows lo mueve a memoria compartida y la decodificacion cae en picado. El autor documenta caidas de 68 a 51 y 42 tok/s a 40K segun la VRAM que ocupase el escritorio, y una caida a 0,2 tok/s al abrir Chrome durante una generacion. A 48K el resultado fue identico al de 40K pero un 22 % mas lento por desbordamiento.

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones publicadas de los mismos pesos, que es la unica referencia disponible en la informacion proporcionada:

| Modelo | Parametros | Contexto recomendado | KLD prosa (vs Q8_0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UD-Q5_K_XL (este repo) | 27,3 B | 64K | 0,0045 | Apache 2.0 | GGUF, 19,44 GiB |
| UD-IQ4_XS (este repo) | 27,3 B | 32K | 0,0268 | Apache 2.0 | GGUF, 13,27 GiB |
| mradermacher i1-IQ4_XS | 27,3 B (mismos pesos) | No disponible | 0,0202 | Apache 2.0 (heredada) | GGUF, 14,26 GiB; no deja hueco para MTP mas contexto util en 16 GB |
| mradermacher i1-IQ3_M | 27,3 B (mismos pesos) | No disponible | 0,0649 | Apache 2.0 (heredada) | GGUF, 11,89 GiB |
| llmfan46 Q3_K_M | 27,3 B (mismos pesos) | No disponible | 0,0639 | Apache 2.0 (heredada) | GGUF, 13,48 GiB |
| mradermacher i1-Q2_K | 27,3 B (mismos pesos) | No disponible | 0,1551 | Apache 2.0 (heredada) | GGUF, 10,12 GiB |

Frente a las alternativas del mismo tamano en el nivel de 16 GB, UD-IQ4_XS presenta una KLD 2,4 veces menor que llmfan46 Q3_K_M y mradermacher i1-IQ3_M, que son los dos cuantizados que caben junto con MTP. En el nivel de 12 GB, UD-IQ3_XXS tiene una KLD 1,7 veces menor que mradermacher i1-Q2_K con un tamano practicamente identico. En el nivel de 24 GB no se midio ninguna otra cuantizacion de esta clase, por lo que no se establece comparacion. No se dispone de comparativas con modelos de otros linajes (Llama, Mistral, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de rechazos es obra de llmfan46 (Heretic v2, MPOA) y el propio autor advierte de que este modelo cumplira peticiones que el original rechaza. La responsabilidad del uso recae en quien lo despliega.
- La reduccion de rechazos no ha sido re-medida en este repositorio: las cifras de 3/100 rechazos y KLD 0,0244 frente al Qwen3.8-27B original provienen de la model card del modelo base.
- La cuantizacion puede volver menos estable el comportamiento cerca del limite de rechazo anterior, segun advierte el autor.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni benchmark de alucinacion. No hay datos para estimarlo.
- No hay resultados de benchmarks de conocimiento, razonamiento, codigo o matematicas, lo que impide comparar su calidad real frente a otros modelos.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento multilingue.
- Contexto maximo nativo: no disponible. Los 32K/16K/64K son contextos de servicio recomendados por VRAM, no el limite arquitectonico.
- Rendimiento muy sensible a la VRAM libre: con escritorio en la misma GPU, el desbordamiento a memoria compartida de Windows degrada la decodificacion de forma severa.
- Las cifras de 12 GB (32K) y 24 GB (64K) son calculadas, no medidas en hardware real.
- Licencia Apache 2.0 segun el campo de HuggingFace, pero la informacion proporcionada no incluye los terminos completos del modelo base ni de los pesos de Heretic; conviene verificarlos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con seis minutos de diferencia: no hay validacion externa independiente de las mediciones publicadas.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/codavidgarcia/Qwen3.8-27B-Uncensored-Heretic-MTP-UD-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
