# loom-draft/unsloth-Qwen3-0.6B-loom

## Resumen

`loom-draft/unsloth-Qwen3-0.6B-loom` no es un modelo entrenado, sino un paquete de distribucion en formato Loom (`.loom`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-0.6B-GGUF`, en su cuantizacion `Q4_K_M`. El paquete lo publica la organizacion `loom-draft` y esta pensado para ejecutar el modelo Qwen3-0.6B sobre GPUs AMD mediante el runtime `loom-serve` (paquete `hrx-loom`), con soporte explicito para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion del paquete se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo subyacente es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 con 0,6 mil millones de parametros. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling en el formato de OpenAI y mantiene el modo de razonamiento (thinking) activado por defecto, desactivable mediante `chat_template_kwargs`. La ventana de contexto configurada en el preset es de 40.960 tokens por peticion, con concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida.

La relevancia de esta ficha es acotada: se trata de un artefacto de empaquetado orientado a hardware AMD concreto, no de un modelo nuevo. No aporta pesos propios ni fine-tuning; su valor esta en la portabilidad del checkpoint GGUF original a un runtime alternativo a llama.cpp, con verificaciones de correctitud (gates) definidas frente a la referencia de llama.cpp, aunque en el momento de la publicacion ninguna de esas puertas habia sido re-medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), empaquetado como programas Loom sobre GGUF |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, transformado a programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio. Los pesos proceden del checkpoint `unsloth/Qwen3-0.6B-GGUF` en cuantizacion `Q4_K_M`, que a su vez deriva del modelo Qwen3-0.6B de Alibaba. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base; esa informacion corresponderia a la documentacion oficial de Qwen3 y no se incluye en la informacion proporcionada.

La innovacion tecnica del artefacto es el pipeline de empaquetado: `loom-next` genera programas Loom (`.loom`) y un fichero `weights.loom` a partir del GGUF y de un `llm_config.json`, junto con un `model.json` que actua como tarjeta y un `model.json.lock` que fija los ficheros de origen con verificacion sha256 en `loom-fetch`. El runtime `loom-serve` ejecuta esos programas sobre `amdgpu://` con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (pool de memoria comprometido por adelantado) y `parameter_mode=preload` (carga de pesos en host). No se documentan mecanismos de decodificacion especulativa ni atencion lineal; de hecho, la tabla de caracteristicas marca la decodificacion especulativa como "not applicable".

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun los gates `agent` y `agent_think_off`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia de salida respecto a ejecuciones aisladas (gate `consistency`).
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base Qwen3, sin detalle en la card).
- Sin soporte de entrada de imagen, audio ni salida de audio (marcado como "not applicable").
- Sin "reasoning effort" configurable (marcado como "not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la card, aunque existe un gate `sampling` definido para verificarlo.

## Casos de uso

- Despliegue de un asistente conversacional ligero en estaciones de trabajo con GPU AMD Radeon AI PRO R9700: el paquete se sirve con `loom-serve` y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Prototipado en equipos AMD Ryzen AI Max+ 395 "Strix Halo": al ser un modelo de 0,6B en Q4_K_M, el paquete esta pensado para ejecutarse en iGPU/APU con memoria unificada, util para demos locales sin GPU dedicada.
- Integracion en pipelines con tool calling: el soporte de `tools`/`tool_calls` en formato OpenAI permite conectar el modelo a funciones externas (consultas a APIs, calculo, recuperacion de datos) en flujos de agente multi-turno.
- Evaluacion de portabilidad de runtimes alternativos a llama.cpp: los gates de correctitud (`golden`, `compare`, `logits`) estan disenados para comparar token a token contra la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar `loom-serve` en hardware AMD.
- Tareas de generacion de texto de baja latencia con contexto medio: la ventana de 40.960 tokens por peticion permite procesar documentos de decenas de miles de tokens en una sola llamada, adecuado para resumen o extraccion sobre textos largos.
- Servicio concurrente de baja carga: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en entornos de laboratorio o internos con pocos usuarios simultaneos.
- Base para experimentacion con modos de razonamiento: la posibilidad de activar o desactivar thinking por peticion permite comparar calidad y coste en tareas de razonamiento sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica: "the results for this package are not yet re-measured". Del mismo modo, todos los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 0,6B, por lo que el peso de los pesos es del orden de varios cientos de MB, pero el pool de memoria del preset (`--pool_backing=fixed`) y el contexto de 40.960 tokens anaden overhead no cuantificado en la card.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que se sirve sobre `amdgpu://`.
- Cabe en GPU de consumo: si, en el sentido de que el hardware objetivo es una APU de consumo profesional (Strix Halo); no se documenta soporte para GPUs de consumo NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/unsloth-Qwen3-0.6B-loom:chat --materialize=copy --output=qwen3-0.6b` y `loom-serve --model=qwen3-0.6b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- vLLM, llama.cpp, Ollama, TGI: no se documentan como opciones de despliegue para este paquete; llama.cpp aparece solo como referencia de correctitud.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecucion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Qwen3-0.6B-loom` | 0,6B | 40.960 tokens (preset) | Paquete Loom sobre GGUF Q4_K_M, runtime `loom-serve` en AMD | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| `unsloth/Qwen3-0.6B-GGUF` (modelo base) | 0,6B | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp y derivados | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (modelo original) | 0,6B | no disponible en la informacion proporcionada | safetensors y ecosistema transformers | Apache 2.0 | Hugging Face / Alibaba |

La comparativa se limita al linaje directo del artefacto porque la informacion proporcionada no incluye datos de rendimiento ni de otros modelos de la misma categoria. No se dispone de cifras de benchmarks para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El paquete no ha sido validado: todas las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured" en ambas plataformas AMD.
- El muestreo esta marcado como "not determined" en la tabla de caracteristicas, lo que impide garantizar el comportamiento de temperature, top_k y seed sin verificacion adicional.
- Dependencia estricta de hardware AMD: el paquete se sirve sobre `amdgpu://` y solo declara soporte para gfx1151 y gfx1201; no es portable a GPUs NVIDIA ni a CPU.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`); cambios de version pueden alterar el comportamiento.
- Modelo de 0,6B: la capacidad de razonamiento, conocimiento factual y calidad multilingue son inherentemente limitadas en comparacion con modelos de mayor tamano; el riesgo de alucinacion es alto en tareas que requieren conocimiento especializado.
- Idiomas soportados no documentados en la card; no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Contexto efectivo limitado a 40.960 tokens por peticion y salida maxima de 4.096 tokens; no adecuado para documentos muy largos o generaciones extensas.
- Concurrencia maxima de 4 peticiones; no disenado para cargas de produccion con muchos usuarios simultaneos.
- La licencia Apache 2.0 del paquete permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B y del checkpoint de Unsloth; conviene verificar sus terminos antes de un despliegue comercial.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Los resultados de busqueda web proporcionados corresponden a servicios y comercios homonimos ("Loom" como grabador de pantalla, tienda de ropa y restaurante) y no aportan informacion sobre este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-0.6B-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
