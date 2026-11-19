# loom-draft/HuggingFaceBio-Carbon-X-loom

## Resumen

Carbon-X (Q4_K_M) para AMD Loom es un paquete de despliegue en formato `.loom`, generado con la herramienta loom-next, que empaqueta el checkpoint GGUF no modificado `carbon-x-q4_k_m.gguf` del modelo base HuggingFaceBio/Carbon-X-GGUF. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion optimizada para ejecutar un modelo existente sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El autor es loom-draft, dentro del ecosistema Loom (hrx-system / loom-next), y se publica bajo licencia Apache 2.0.

El paquete incluye los programas `.loom` generados, el tokenizador, la configuracion del modelo y una tarjeta `model.json` con los metadatos y las mediciones. Expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con soporte de tool calling estilo OpenAI, modo de razonamiento opcional y una ventana de contexto de 40.960 tokens por peticion con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto.

Su relevancia es acotada pero clara: demuestra un flujo de despliegue de inferencia sobre hardware AMD de consumo y workstation, sin depender de CUDA, con un formato de paquete reproducible y verificable (sha256 en `loom-fetch`). Los datos de rendimiento y de correccion frente a llama.cpp no estan disponibles en la informacion proporcionada: la propia model card indica "not yet re-measured" para todas las puertas de validacion y para ambas GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base HuggingFaceBio/Carbon-X-GGUF; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `carbon-x-q4_k_m.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Modo razonamiento | Si, activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen | No aplicable |
| Entrada/salida de audio | No aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base HuggingFaceBio/Carbon-X-GGUF ni su proceso de entrenamiento: no se indican tipo de transformer, numero de parametros, volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta es la capa de despliegue: loom-next genera, a partir de la configuracion del modelo (`llm_config.json`) y del tokenizador, un conjunto de programas `.loom` y un fichero `weights.loom` que `loom-serve` ejecuta sobre el backend AMD (amdgpu). La generacion se realizo con el generador unicamente, sin LLM en el bucle, y el checkpoint GGUF no se modifica.

El paquete incorpora opciones de ejecucion orientadas a rendimiento y reproducibilidad: `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` reserva por adelantado el pool de memoria del preset en lugar de un crecimiento elastico, y `--parameter_mode=preload` cambia solo la carga de pesos en host. Ademas, `loom-fetch` verifica los ficheros fuente mediante sha256 anclados en `model.json.lock`. No hay innovaciones de arquitectura del modelo documentadas; las novedades son de empaquetado y ejecucion.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo "thinking" activado por defecto, desactivable por peticion mediante `chat_template_kwargs`.
- Tool calling / function calling estilo OpenAI, con campos `tools` y `tool_calls`.
- Soporte de bucles de tool calling multi-turno (la model card incluye puertas de validacion `agent` y `agent_think_off`, aunque sin resultados registrados).
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 40.960 tokens por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no aplicable segun la tabla de caracteristicas.
- Audio: no aplicable.
- Decodificacion especulativa: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Asistente conversacional autoalojado sobre hardware AMD: desplegando `loom-serve` en una APU Strix Halo o una R9700 se obtiene un endpoint compatible con OpenAI al que apuntar clientes existentes sin reescribir integraciones, con 40.960 tokens de contexto por peticion.
- Automatizacion de agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas o bases de datos, con el modo thinking activado para tareas de varios pasos y desactivado para respuestas rapidas.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como referencia reproducible para validar `loom-fetch`, `loom-serve` y las puertas de correccion (`golden`, `compare`, `agent`, `logits`) frente a llama.cpp sobre el mismo GGUF.
- Procesamiento por lotes de documentos largos: con 40.960 tokens de contexto se pueden resumir o extraer informacion de documentos extensos en una sola peticion, siempre que el modelo base tenga calidad suficiente en espanol u otros idiomas (no verificado).
- Prototipado en estaciones de trabajo con GPU AMD: al no depender de CUDA, encaja en entornos con Radeon AI PRO R9700 de 32 GB donde el stack NVIDIA no esta disponible.
- Servicio interno de baja concurrencia: con 4 peticiones simultaneas y 4.096 tokens de salida maxima por defecto, es adecuado para equipos pequenos o herramientas internas mas que para cargas de produccion de alta concurrencia.
- Integracion en pipelines de CI para comparativas de inferencia: las puertas de correccion y las mediciones de `info.json` permiten automatizar regresiones entre versiones del generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured" en ambas GPUs, por lo que no existe evidencia registrada de equivalencia con la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible. El unico dato concreto es que la Radeon AI PRO R9700 objetivo tiene 32 GB; el tamano del checkpoint Q4_K_M no se indica en la informacion proporcionada.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, APU con memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que esta generado para el backend AMD `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch huggingface:loom-draft/HuggingFaceBio-Carbon-X-loom:chat --materialize=copy --output=carbon-x` y servicio con `loom-serve --model=carbon-x '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa solo como referencia de correccion en las puertas de validacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loom-draft/HuggingFaceBio-Carbon-X-loom | no disponible | 40.960 tokens | Apache 2.0 | Paquete `.loom` (GGUF Q4_K_M) para AMD gfx1151 y gfx1201 | API OpenAI, tool calling, thinking; sin benchmarks ni puertas de correccion registradas |
| HuggingFaceBio/Carbon-X-GGUF | no disponible | no disponible | no disponible en la informacion proporcionada | GGUF | Modelo base sin modificar del que deriva este paquete |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de validacion publicada: las once puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured", por lo que no hay evidencia de que la salida coincida con la referencia de llama.cpp.
- Sin datos de benchmarks: no se puede evaluar la calidad del modelo base en razonamiento, codigo, matematicas o idiomas.
- Idiomas no declarados: no se especifica el soporte multilingue ni la calidad en castellano.
- Arquitectura y tamano desconocidos: no se indican parametros totales ni tipo de modelo, lo que impide estimar requisitos de memoria y coste de inferencia.
- Limitaciones operativas: 4 peticiones concurrentes y 4.096 tokens de salida maxima por defecto; el contexto esta acotado a 40.960 tokens por peticion.
- Dependencia de hardware AMD especifico: el paquete esta generado para gfx1151 y gfx1201; no es portable a GPUs NVIDIA ni a otras arquitecturas sin regeneracion.
- Rendimiento condicionado: `completion_spin_ns=4294967295` consume CPU durante la espera activa de la GPU, lo que puede degradar el rendimiento del host en cargas concurrentes.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; deben asumirse los del modelo base, que no se documentan.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base HuggingFaceBio/Carbon-X-GGUF, no indicada en la informacion proporcionada.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/HuggingFaceBio-Carbon-X-loom
- Modelo base (GGUF): https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Repositorio hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
