# loom-draft/mradermacher-Qwen2-Audio-7B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF `Qwen2-Audio-7B-Instruct.Q4_K_M.gguf` de mradermacher, que a su vez es una cuantizacion del modelo Qwen2-Audio-7B-Instruct de Alibaba Qwen. El autor del paquete es `loom-draft` y la generacion se ha realizado con la herramienta `loom-next`, sin intervencion de un LLM en el bucle. El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia practica esta en que ofrece una via de servicio con API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD mediante el runtime `hrx-loom` 0.2.0, sin necesidad de recompilar kernels ni de convertir los pesos. El modelo base es un transformer de 7B orientado a comprension de audio y texto, con capacidad de conversacion multi-turno sobre entradas de audio.

Conviene subrayar una limitacion importante: aunque el modelo upstream acepta audio e imagen, el paquete Loom declara explicitamente que **no soporta entrada de audio ni de imagen**. El paquete sirve, por tanto, el modelo como LLM de texto de 7B con contexto de 8.192 tokens por peticion, no como modelo audio-visual. Los datos de rendimiento y de correccion no estan re-medidos en el momento de publicacion de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2-Audio, derivado de Qwen2-7B con encoder de audio); el paquete Loom solo expone la parte de texto |
| Parametros totales | 7B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete Loom usa `weights.loom` generado a partir de ese GGUF |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Qwen2-Audio-7B-Instruct.Q4_K_M.gguf`); paquete Loom con `program/*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json`, `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `http://127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2-Audio-7B-Instruct, es un transformer decoder-only de la familia Qwen2 (7B) con un encoder de audio acoplado para tareas de comprension auditiva e instrucciones multimodales. El checkpoint original fue entrenado por el equipo Qwen; el GGUF Q4_K_M de mradermacher es una cuantizacion de ese checkpoint y el paquete Loom es una recompilacion de los kernels de inferencia para las arquitecturas AMD indicadas. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original.

La innovacion tecnica del paquete no esta en el modelo, sino en el pipeline de despliegue: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF sin modificar, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). La espera activa de finalizacion en GPU se controla con `completion_spin_ns=4294967295`. El paquete declara gates de correccion (kernel_tests, golden, compare, consistency, spec, agent, sampling, logits, decision) frente a referencias de llama.cpp, pero **ninguno de ellos tiene medicion registrada** en la version publicada.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes y SDK existentes.
- Contexto de 8.192 tokens por peticion, suficiente para conversaciones y documentos de extension moderada.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta (preset).
- Tool calling: no aplicable segun la model card.
- Modo de razonamiento / thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom (el modelo upstream si la tiene).
- Entrada y salida de audio: no soportadas por Loom (el modelo upstream si las tiene).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Asistente conversacional de texto en estaciones de trabajo AMD**: desplegando `loom-serve` sobre una Radeon AI PRO R9700 o un Strix Halo se obtiene un endpoint compatible con OpenAI que cualquier cliente puede consumir; util para prototipos internos en equipos con hardware AMD y sin CUDA.
- **Procesamiento por lotes de documentos de hasta 8k tokens**: resumen, extraccion de entidades y clasificacion de textos moderados; el limite de contexto y la concurrencia de 4 permiten encolar lotes pequenos en una sola GPU.
- **Chatbot de soporte interno con historial de conversacion**: el soporte multi-turno y el contexto de 8.192 tokens permiten mantener el hilo de una conversacion de atencion al usuario sin truncamientos frecuentes.
- **Validacion de pipelines de inferencia sobre ROCm**: los gates de correccion declarados (golden, compare, consistency, logits) estan pensados para verificar que la salida coincide con llama.cpp; util para equipos que evaluan el runtime Loom antes de adoptarlo en produccion.
- **Generacion de texto en entornos con requisitos de licencia permisiva**: la licencia Apache 2.0 del paquete y del modelo base facilita su uso comercial sin obligaciones de copyleft, sujeto a las condiciones del modelo original.
- **Prototipado de aplicaciones de voz en una segunda fase**: dado que el modelo upstream soporta audio pero el paquete Loom no, se puede usar este despliegue para la capa de texto (razonamiento sobre transcripciones) y reservar el audio para otro runtime mientras Loom madura.
- **Benchmarking interno de hardware AMD**: comparar throughput y latencia de `loom-serve` frente a llama.cpp en las mismas GPUs; la model card preve mediciones de rendimiento, aunque en esta version no estan re-medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican literalmente que "the results for this package are not yet re-measured". Del mismo modo, la tabla de correccion muestra todos los gates como "not yet re-measured". No se deben asumir cifras de throughput ni de calidad.

## Requisitos de hardware

- **VRAM estimada**: un checkpoint de 7B en Q4_K_M ocupa del orden de 4-5 GB de pesos; el pool de memoria fijo y el contexto de 8.192 tokens anaden overhead, por lo que conviene reservar al menos 8-10 GB de VRAM para el servicio completo (estimacion orientativa, no confirmada en la informacion proporcionada).
- **GPU recomendadas**: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- **Consumer GPU**: el paquete esta pensado para las dos plataformas AMD citadas; no se documenta compatibilidad con GPUs de consumo tipo RX 7000/9000 ni con iGPUs distintas de Strix Halo.
- **Opciones de despliegue**: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`. El paquete es especifico de Loom; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos ficheros `.loom`.
- **Instalacion**: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/mradermacher-Qwen2-Audio-7B-Instruct-loom:chat --materialize=copy --output=qwen2-audio-7b-instruct`.
- **Arranque**: `loom-serve --model=qwen2-audio-7b-instruct '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- **Latencia y throughput**: no disponibles; la model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| **Este paquete** (Qwen2-Audio-7B-Instruct Q4_K_M para Loom) | 7B | 8.192 tokens | Apache 2.0 | `.loom` + `weights.loom`, runtime `hrx-loom` | Solo texto; sin audio ni vision; sin benchmarks publicados |
| `mradermacher/Qwen2-Audio-7B-Instruct-GGUF` | 7B | no disponible | Apache 2.0 (heredada) | GGUF, llama.cpp | Checkpoint de origen; conserva audio e imagen segun el runtime |
| Qwen2-Audio-7B-Instruct (original) | 7B | no disponible | Apache 2.0 | safetensors, Transformers | Modelo upstream completo con encoder de audio |
| Qwen2-7B-Instruct | 7B | 32.768 tokens (segun documentacion de Qwen2) | Apache 2.0 | safetensors, GGUF, multiples runtimes | Alternativa solo texto de la misma familia, sin encoder de audio |

La comparativa se limita a la familia Qwen2 porque no se dispone de datos de rendimiento del paquete Loom que permitan contrastarlo con otras alternativas de 7B. Las cifras de contexto del modelo original Qwen2-Audio no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin audio ni imagen**: a pesar del nombre del modelo, el paquete Loom no soporta entrada de audio ni de imagen. Cualquier caso de uso que dependa de esas modalidades requiere otro runtime.
- **Sin benchmarks ni gates de correccion medidos**: todas las filas de rendimiento y de correccion aparecen como "not yet re-measured". No hay evidencia publicada de que la salida coincida con llama.cpp.
- **Hardware muy restringido**: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No hay soporte declarado para NVIDIA, otras AMD ni GPUs de consumo.
- **Formato propietario del runtime**: los ficheros `.loom` no son interoperables con vLLM, llama.cpp, Ollama o TGI; migrar a otro runtime exige volver al GGUF original.
- **Contexto limitado a 8.192 tokens**: inferior al de otros modelos de la familia Qwen2 y potencialmente insuficiente para documentos largos o agentes con historial extenso.
- **Concurrencia de 4 peticiones**: puede ser un cuello de botella en produccion con varios usuarios concurrentes.
- **Riesgo de alucinacion**: inherente a los LLM de 7B; no se han publicado evaluaciones de fidelidad para este paquete.
- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- **Idiomas**: no se especifica la cobertura linguistica del paquete; el modelo base Qwen2 tiene soporte multilingue, pero no se confirma en esta ficha.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint original de Qwen y del GGUF de mradermacher.
- **Paquete de borrador**: el autor es `loom-draft`, con 0 descargas y 0 likes en el momento de la consulta; tratarlo como experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen2-Audio-7B-Instruct-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Qwen2-Audio-7B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo original Qwen2-Audio-7B-Instruct: no disponible en la informacion proporcionada (referencia habitual: repositorio de Qwen en Hugging Face)
