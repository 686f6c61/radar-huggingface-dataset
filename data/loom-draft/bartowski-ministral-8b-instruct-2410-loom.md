# loom-draft/bartowski-Ministral-8B-Instruct-2410-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Ministral-8B-Instruct-2410-GGUF`, en su cuantizacion Q4_K_M. El modelo subyacente es Ministral-8B-Instruct-2410, un transformer denso de 8 mil millones de parametros desarrollado por Mistral AI, orientado a instrucciones y con ventana de contexto de 32.768 tokens. El paquete lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta ficha es acotada: no aporta pesos nuevos ni mejoras de calidad respecto al modelo original, sino un artefacto de empaquetado para el ecosistema Loom (herramientas `hrx-loom`, `loom-fetch` y `loom-serve`, generadas con `loom-next`). Sirve como ejemplo de portabilidad de un GGUF de Mistral a un runtime alternativo basado en kernels generados para ROCm, con una API compatible con OpenAI en `/v1/chat/completions`.

En el momento de la publicacion el repositorio registra 0 descargas y 0 «likes», y las mediciones de rendimiento y las puertas de correccion aparecen como «not yet re-measured» en la propia model card. Por tanto, cualquier evaluacion de calidad debe remitirse al modelo base de Mistral AI y a la cuantizacion de bartowski, no a este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ministral-8B-Instruct-2410); el paquete Loom no redefine la arquitectura |
| Parametros totales | 8 mil millones (8B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye un unico checkpoint cuantizado |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ministral-8B-Instruct-2410-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo subyacente, Ministral-8B-Instruct-2410, es un transformer denso de 8B parametros afinado para seguir instrucciones, publicado por Mistral AI en octubre de 2024. La informacion disponible en este repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Mistral AI, que no forma parte del material proporcionado.

Lo que si describe el paquete es la capa de ejecucion: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), sin intervencion de un LLM en el bucle de generacion. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 mediante `loom-fetch`, ademas de `tokenizer.json`, `llm_config.json` y los programas generados. El servidor `loom-serve` expone una API estilo OpenAI y admite un modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), reserva de memoria fija (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). No se documentan innovaciones de decodificacion especulativa: la propia tabla de caracteristicas la marca como «not applicable».

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Ministral-8B-Instruct-2410.
- Servicio mediante API compatible con OpenAI en `/v1/chat/completions`, con campo `model` configurable.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Contexto de 32.768 tokens por peticion.
- Tool calling: marcado como «not applicable» en la model card del paquete.
- Razonamiento o modo «thinking»: marcado como «not applicable».
- Decodificacion especulativa: marcada como «not applicable».
- Entrada de imagen o audio: marcada como «not applicable».
- Muestreo (temperature, top_k, seed): estado «not determined» en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en hardware AMD de escritorio o estacion de trabajo: el paquete permite servir un 8B cuantizado en Q4_K_M sobre Strix Halo o R9700 con una unica orden `loom-serve`, sin depender de una pila CUDA.
- Evaluacion de runtimes alternativos frente a llama.cpp: al conservar el GGUF original y ofrecer puertas de comparacion (`golden`, `compare`, `logits`), sirve para medir divergencias token a token entre ambos motores sobre las mismas prompts.
- Procesamiento de documentos de hasta 32k tokens: resumenes, extraccion de entidades o preguntas sobre contratos e informes que quepan en la ventana de contexto del preset.
- Prototipado de backends compatibles con OpenAI: cualquier cliente que hable el protocolo de `/v1/chat/completions` puede apuntar a `http://127.0.0.1:8080` sin cambios de codigo.
- Bancos de pruebas de correccion en CI: las puertas `kernel_tests`, `consistency` y `sampling` estan disenadas para validar kernels generados y el comportamiento del muestreo de forma automatizada.
- Experimentacion con cuantizacion Q4_K_M en GPUs de 32 GB: el ajuste de memoria fija y la precarga permiten estudiar el consumo y la latencia en un unico dispositivo sin repartir el modelo.
- Docencia e investigacion sobre compilacion de kernels: el par `program/*.loom` y `weights.loom` documenta como se traduce un grafo de inferencia a codigo especifico de una arquitectura AMD concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 8B, y el preset declara contexto de 32.768 tokens y 4 peticiones concurrentes, lo que condiciona el consumo de KV cache.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado para las dos arquitecturas AMD citadas y no se mencionan RTX 4090, A100 ni H100.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-Ministral-8B-Instruct-2410-loom:chat --materialize=copy --output=ministral-8b-instruct-2410` y `loom-serve --model=ministral-8b-instruct-2410 '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue para el mismo GGUF (llama.cpp, Ollama, vLLM): no documentadas en este paquete, aunque el propio repositorio usa llama.cpp como referencia de correccion.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (Ministral-8B-Instruct-2410 Q4_K_M para Loom) | 8B | 32.768 tokens | MIT | GGUF empaquetado en `.loom` | Runtime Loom sobre AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/Ministral-8B-Instruct-2410-GGUF | 8B | no disponible en la informacion proporcionada | MIT (heredada) | GGUF | Checkpoint fuente sin modificar; ejecutable con llama.cpp |
| Ministral-8B-Instruct-2410 (original de Mistral AI) | 8B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | Pesos de referencia del afinado por instrucciones |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y plataforma de ejecucion.

## Limitaciones y advertencias

- El paquete no incluye mediciones: todas las puertas de correccion y las comparativas de rendimiento figuran como «not yet re-measured», de modo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Repositorio sin traccion: 0 descargas y 0 «likes» en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- No es un modelo nuevo: cualquier limitacion del Ministral-8B-Instruct-2410 original (sesgos, alucinacion, calidad en dominios especializados) se hereda sin cambios.
- Tool calling, razonamiento, decodificacion especulativa y entrada multimodal estan marcados como «not applicable»; no deben asumirse en produccion.
- El estado del muestreo figura como «not determined», por lo que el comportamiento de temperature, top_k y seed no esta verificado.
- La licencia MIT del paquete no sustituye a la licencia del modelo base; conviene verificar los terminos de Mistral AI para uso comercial antes de desplegar.
- Plataforma restringida: el paquete esta generado para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Idioma: no se declaran idiomas soportados en la informacion disponible; el rendimiento en castellano no esta verificado.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que puede ser insuficiente para cargas de produccion con alto paralelismo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Ministral-8B-Instruct-2410-loom
- Modelo base en Hugging Face: https://huggingface.co/bartowski/Ministral-8B-Instruct-2410-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
