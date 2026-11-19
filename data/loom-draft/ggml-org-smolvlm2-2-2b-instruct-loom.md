# loom-draft/ggml-org-SmolVLM2-2.2B-Instruct-loom

## Resumen

`loom-draft/ggml-org-SmolVLM2-2.2B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `SmolVLM2-2.2B-Instruct-Q4_K_M.gguf` de `ggml-org/SmolVLM2-2.2B-Instruct-GGUF`. No se trata de un modelo nuevo entrenado por `loom-draft`, sino de una reempaquetadura generada con la herramienta `loom-next` para ejecutar el modelo base en GPUs AMD concretas: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es SmolVLM2-2.2B-Instruct, un modelo vision-language compacto de aproximadamente 2.200 millones de parametros.

El interes practico del paquete reside en que permite servir el modelo mediante `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) sobre el stack ROCm/HIP sin pasar por llama.cpp. La tarjeta declara contexto de 8.192 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. Es relevante para desarrolladores que trabajan en hardware AMD y quieren un VLM pequeno con licencia Apache 2.0, aunque con una limitacion importante: la entrada de imagen no esta soportada por Loom en esta version, pese a que el modelo original si la admite.

La publicacion es muy reciente y practicamente sin traccion (0 descargas, 0 likes en el momento de la consulta), y la propia tarjeta indica que las mediciones de rendimiento y las puertas de correccion aun no se han re-medido para este paquete. Debe tratarse, por tanto, como un artefacto en estado borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base SmolVLM2-2.2B-Instruct; transformer vision-language) |
| Parametros totales | ~2.2B (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base; la tarjeta solo describe el proceso de empaquetado. El checkpoint de origen es `SmolVLM2-2.2B-Instruct` en cuantizacion Q4_K_M, un modelo vision-language de la familia SmolVLM2 publicado por Hugging Face en colaboracion con `ggml-org` para el ecosistema GGUF. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos habria que consultarlos en la model card del checkpoint original.

La innovacion tecnica del artefacto esta en el pipeline de generacion: `loom-next` produce programas `.loom` (kernels) y un fichero `weights.loom` a partir de la configuracion del modelo (`llm_config.json`), y `loom-fetch` verifica los ficheros fuente mediante SHA-256 fijado en `model.json.lock`. El despliegue usa `loom-serve` con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). La tarjeta menciona tambien un modo de espera activa (`completion_spin_ns=4294967295`) usado en las mediciones de rendimiento. No se documentan mecanismos como decodificacion especulativa o atencion lineal; de hecho, la tabla de features marca la decodificacion especulativa como «not applicable».

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Razonamiento y respuesta a instrucciones (modelo «Instruct»).
- Soporte de contexto de hasta 8.192 tokens por peticion.
- Gestion de hasta 4 peticiones concurrentes.
- Generacion de hasta 4.096 tokens de salida por respuesta.
- Entrada de imagen: **no soportada** por Loom en este paquete, aunque el modelo base si la admite.
- Tool calling / function calling: no aplicable segun la tarjeta.
- Modo de razonamiento o «thinking»: no aplicable.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperature, top_k, seed): estado «no determinado» en la tabla de features.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite integrarlo en clientes existentes sin cambios de codigo.
- Prototipado de aplicaciones LLM en hardware ROCm: util para equipos que desarrollan sobre GPUs AMD y necesitan un modelo pequeno (2.2B en Q4_K_M) con contexto de 8K para iterar rapidamente sin depender de CUDA.
- Procesamiento de texto por lotes con concurrencia moderada: las 4 peticiones concurrentes y los 8.192 tokens de contexto permiten tareas de resumen o clasificacion de documentos de longitud media en un solo nodo.
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion (`golden`, `compare`, `consistency`, `logits`) pensadas para contrastar la salida de Loom contra llama.cpp sobre el mismo GGUF, lo que lo hace util como banco de pruebas de portabilidad.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede incorporarse en productos comerciales internos sin obligaciones de copyleft, siempre que se respete la licencia del modelo base.
- Despliegue en equipos de sobremesa con APU Strix Halo: al tratarse de un modelo de 2.2B en Q4_K_M, el paquete esta pensado para ejecutarse en una APU con memoria unificada, evitando la necesidad de una GPU discreta dedicada.
- No es adecuado, en esta version, para tareas de vision (captioning, VQA, OCR) porque Loom no soporta entrada de imagen en este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que «the results for this package are not yet re-measured» tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un checkpoint de 2.2B en Q4_K_M ocupa del orden de 1,3-1,5 GB de pesos, pero la tarjeta no publica cifras de memoria del pool de Loom.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para Radeon de gama de consumo; el paquete esta generado para las dos plataformas AMD citadas.
- Opciones de despliegue: `loom-serve` (runtime propio de Loom sobre ROCm/HIP), instalado via `pipx install "hrx-loom[hf]==0.2.0"`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecucion).
- Memoria: el despliegue permite `--pool_backing=fixed` (pool fijo) o crecimiento elastico, y `--parameter_mode=preload` para precarga de pesos en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| SmolVLM2-2.2B-Instruct (GGUF, ggml-org) | ~2.2B | no disponible en la informacion proporcionada | Apache 2.0 | GGUF, ejecutable con llama.cpp | Modelo base; soporta entrada de imagen |
| Este paquete (loom-draft) | ~2.2B | 8.192 tokens | Apache 2.0 | `.loom` + `loom-serve` sobre AMD | Sin vision en Loom; sin benchmarks publicados |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- **Sin soporte de vision en Loom**: aunque el modelo base es un VLM, la tabla de features marca la entrada de imagen como no soportada. No debe usarse para tareas multimodales en este empaquetado.
- **Sin benchmarks ni validacion publicada**: todas las puertas de correccion y las mediciones de rendimiento figuran como pendientes de re-medir. No hay evidencia de que la salida coincida con llama.cpp.
- **Estado de borrador**: 0 descargas y 0 likes; el autor es `loom-draft`, lo que sugiere un artefacto generado automaticamente y no validado por la comunidad.
- **Muestreo no determinado**: el comportamiento de temperature, top_k y seed esta marcado como «?» en la tarjeta.
- **Tool calling y razonamiento no soportados**: no apto para pipelines de agentes o function calling.
- **Restriccion de hardware**: solo se documentan dos plataformas AMD (gfx1151 y gfx1201); no hay garantia de funcionamiento en otras GPUs.
- **Riesgo de alucinacion**: inherente a modelos de 2.2B; no se documentan mitigaciones especificas.
- **Idiomas**: no se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base `ggml-org/SmolVLM2-2.2B-Instruct-GGUF`.
- **Sesgos**: no documentados en la informacion proporcionada.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-SmolVLM2-2.2B-Instruct-loom
- Checkpoint base (GGUF): https://huggingface.co/ggml-org/SmolVLM2-2.2B-Instruct-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de busqueda web devueltos corresponden a servicios no relacionados (Loom.com, loom.fr, Atlassian Loom) y no se han utilizado como fuente.
