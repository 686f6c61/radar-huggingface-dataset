# loom-draft/unsloth-Qwen3-4B-Thinking-2507-loom

## Resumen

`loom-draft/unsloth-Qwen3-4B-Thinking-2507-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `Qwen3-4B-Thinking-2507-Q4_K_M.gguf` de Unsloth, derivado del modelo Qwen3-4B-Thinking-2507 de Alibaba Qwen. No es un modelo entrenado desde cero ni un fine-tune: es una distribucion ejecutable (programas `.loom` generados y una tarjeta `model.json`) que permite servir el modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica la organizacion `loom-draft` y se genera con la herramienta `loom-next`, que produce los kernels y programas Loom a partir del GGUF sin intervencion de un LLM en el bucle. Su relevancia es practica: ofrece una via de despliegue nativa en ROCm para hardware AMD consumer y de estacion de trabajo, con API compatible con OpenAI, soporte de tool calling y modo de razonamiento siempre activo, sin depender de llama.cpp en tiempo de ejecucion.

El modelo subyacente es un transformer denso de 4 mil millones de parametros, especializado en razonamiento con "thinking mode" y con una ventana de contexto efectiva de 40.960 tokens por peticion en esta configuracion. La licencia del paquete es Apache 2.0. La model card no incluye resultados de rendimiento ni de correccion para esta build concreta: todas las puertas de validacion aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Thinking-2507); empaquetado como programas Loom generados para GPU AMD |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye unicamente esta cuantizacion |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Qwen3-4B-Thinking-2507-Q4_K_M.gguf`) empaquetado como `weights.loom` y programas `program/*.loom`; incluye `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Modo razonamiento | Siempre activo; "reasoning effort" no aplicable |
| Decodificacion especulativa | No aplicable en esta build |
| Entrada de imagen / audio | No soportada |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-4B-Thinking-2507, es un transformer denso de 4B parametros de la familia Qwen3, en su variante "Thinking" con fecha de corte 2507 (julio de 2025). La model card de este paquete no documenta el proceso de entrenamiento del modelo base: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Esa informacion corresponderia a la documentacion oficial de Qwen y no se incluye aqui.

La innovacion tecnica de este repositorio no esta en el modelo sino en el empaquetado. `loom-next` genera, a partir del GGUF y de su configuracion (`llm_config.json`), un conjunto de kernels y programas Loom (`program/*.loom`, `weights.loom`) que se ejecutan directamente sobre ROCm en las GPU AMD objetivo. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en el momento de la descarga con `loom-fetch`. El servidor `loom-serve` expone la API de chat, gestiona un pool de memoria fijo (`--pool_backing=fixed`) y permite precarga de pesos en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" siempre activo: el modelo emite su cadena de razonamiento antes de la respuesta final.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados, lo que habilita bucles de agente.
- Conversacion multi-turno con contexto de hasta 40.960 tokens por peticion.
- Servicio concurrente de hasta 4 peticiones simultaneas con salida maxima de 4.096 tokens por respuesta.
- API compatible con OpenAI (`/v1/chat/completions`), lo que permite reutilizar clientes y SDK existentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de vision, audio, decodificacion especulativa ni ajuste de esfuerzo de razonamiento en esta build.

## Casos de uso

- Razonamiento tecnico asistido en local: el modo thinking siempre activo y los 40.960 tokens de contexto permiten analizar documentos largos (especificaciones, logs extensos, codigo de varios ficheros) en una sola peticion, sin salir del puesto de trabajo.
- Agentes con tool calling sobre hardware AMD: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas, ejecuten busquedas o encadenen pasos, sirviendose de la API compatible con OpenAI.
- Asistente de codigo en estacion de trabajo con Radeon AI PRO R9700: con 32 GB de VRAM y el paquete especifico `chat-r9700`, se puede servir el modelo para autocompletado, explicacion y refactorizacion dentro de un IDE, sin depender de servicios en la nube.
- Prototipado en portatiles y mini-PC con Strix Halo: el paquete `chat` para gfx1151 esta pensado para el Ryzen AI Max+ 395, lo que permite disponer de un endpoint de chat local en un equipo integrado.
- Evaluacion de la cadena de herramientas Loom: util para equipos que quieran medir el rendimiento y la correccion de `loom-serve` frente a llama.cpp sobre el mismo GGUF, con las puertas de validacion (`golden`, `compare`, `agent`, `logits`, etc.) como marco de referencia.
- Backend de chat interno con requisitos de privacidad: al ejecutarse integramente en la GPU local y exponer una API OpenAI, encaja en despliegues donde los datos no pueden salir de la infraestructura propia.
- Experimentacion con modelos de razonamiento de 4B: permite comparar la variante Thinking de Qwen3-4B frente a alternativas densas del mismo tamano en tareas de matematicas y logica, manteniendo el coste de hardware contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambas indica literalmente que los resultados de este paquete "are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU, por lo que no hay evidencia registrada de validacion para esta build.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de 4B parametros; el paquete esta orientado a GPU con memoria unificada o dedicada suficiente para alojar pesos, cache KV para 40.960 tokens y el pool fijo configurado. La cifra exacta de VRAM no se detalla en la informacion proporcionada.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer AMD o NVIDIA en esta build; el paquete esta generado para las dos arquitecturas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` (variantes `chat` para Strix Halo y `chat-r9700` para R9700) y servicio con `loom-serve`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; la model card remite a mediciones pendientes de re-ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Qwen3-4B-Thinking-2507-loom` (este) | 4B denso | 40.960 tokens por peticion | Paquete Loom sobre GGUF Q4_K_M; runtime `hrx-loom` | Apache 2.0 | Solo GPU AMD Strix Halo y R9700; sin benchmarks publicados en esta build |
| `unsloth/Qwen3-4B-Thinking-2507-GGUF` | 4B denso | El del modelo base Qwen3-4B-Thinking-2507 | GGUF; ejecutable con llama.cpp y derivados | Apache 2.0 | Checkpoint de origen del que deriva este paquete; mayor portabilidad de hardware |
| Qwen3-4B-Thinking-2507 (original) | 4B denso | El del modelo base | safetensors; vLLM, TGI, transformers | Apache 2.0 | Referencia oficial del modelo; requiere pila de inferencia estandar |

La comparacion se limita al linaje directo del modelo, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con otras familias de 4B.

## Limitaciones y advertencias

- Ausencia total de validacion publicada para esta build: todas las puertas de correccion y las mediciones de rendimiento figuran como pendientes de re-ejecucion, por lo que no hay evidencia de que la salida coincida con la referencia de llama.cpp.
- Cobertura de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte declarado para otras GPU AMD ni para NVIDIA.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe su uso en cargas de alta demanda o respuestas muy largas.
- Modo thinking siempre activo y sin control de esfuerzo de razonamiento: no se puede desactivar el razonamiento por peticion, lo que incrementa la latencia y el consumo de tokens en tareas simples.
- Idiomas soportados no documentados en esta ficha; la cobertura linguistica real depende del modelo base Qwen3-4B-Thinking-2507.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en dominios especializados y en contextos largos proximos al limite de 40.960 tokens.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben evaluarse a partir de la model card oficial de Qwen3-4B-Thinking-2507.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del checkpoint de Unsloth antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-19: se trata de una publicacion reciente y sin validacion de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-4B-Thinking-2507-loom
- Checkpoint GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Thinking-2507-GGUF
- Runtime Loom (ROCm / hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
