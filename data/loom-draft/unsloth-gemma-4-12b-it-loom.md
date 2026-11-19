# loom-draft/unsloth-gemma-4-12B-it-loom

## Resumen

`loom-draft/unsloth-gemma-4-12B-it-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `unsloth/gemma-4-12B-it-GGUF`, concretamente la cuantizacion `gemma-4-12b-it-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un ajuste fino: es una distribucion del modelo Gemma 4 de 12B (instruido) preparada para ejecutarse sobre las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), generada con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El interes del paquete es de infraestructura: ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional, contexto de 160.768 tokens por peticion y hasta 4 peticiones concurrentes, todo ello sobre el stack `hrx-loom` (version 0.2.0) y aceleracion AMD via ROCm. Es relevante para equipos que quieran servir Gemma 4 12B en hardware AMD consumer o de estacion de trabajo sin depender de CUDA ni de llama.cpp como runtime principal.

No obstante, la model card es explicitamente incompleta: las mediciones de rendimiento frente a llama.cpp y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `logits`, etc.) figuran como "not yet re-measured" para ambas GPUs. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto en fase temprana o de borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 12B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 160.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-12b-it-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (ROCm) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. Lo unico verificable es que se trata del checkpoint `unsloth/gemma-4-12B-it-GGUF` sin modificaciones, en cuantizacion Q4_K_M, y que el autor ha generado los programas de inferencia con `loom-next`, un generador que produce kernels y programas `.loom` especificos para las GPU AMD objetivo. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO.

La innovacion tecnica del paquete es el propio formato Loom: kernels generados por GPU, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye dos presets de despliegue, `chat` para Strix Halo y `chat-r9700` para la R9700, con ficheros `model.json` y `model.json.lock` que fijan los hashes sha256 de los ficheros fuente verificados por `loom-fetch`. No se menciona decodificacion especulativa (marcada como "not applicable") ni atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI.
- Tool calling con el esquema `tools` y `tool_calls` de OpenAI, apto para bucles de agente multi-paso.
- Modo de razonamiento opcional: desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de 160.768 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo base la soporta, pero Loom no la implementa (marcado como no soportado).
- Audio: el modelo base lo soporta, pero Loom no lo implementa.
- Razonamiento con esfuerzo configurable: no aplicable en este runtime.
- Decodificacion especulativa: no aplicable en este runtime.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.

## Casos de uso

- Servicio de chat sobre GPU AMD: desplegar un endpoint `/v1/chat/completions` en una estacion con Strix Halo o R9700 para aplicaciones internas, aprovechando la compatibilidad con el esquema de OpenAI sin reescribir clientes existentes.
- Procesamiento de documentos largos: con 160.768 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola peticion.
- Agentes con tool calling: integrar el endpoint en un orquestador que exponga funciones como busqueda, calculo o acceso a bases de datos, usando el bucle `tools`/`tool_calls` que el runtime soporta de forma nativa.
- Asistente de codigo en local: servir el modelo en una R9700 de 32 GB para autocompletado y explicacion de codigo dentro de un IDE, con los datos sin salir de la infraestructura propia.
- Razonamiento controlado por coste: activar el modo thinking solo en consultas complejas y desactivarlo en el resto para reducir latencia, dado que viene desactivado por defecto.
- Despliegue en flotas AMD sin CUDA: equipos que ya operan hardware ROCm pueden servir el modelo con `loom-serve` y evitar mantener una ruta paralela con llama.cpp u otras herramientas.
- Evaluacion de runtimes alternativos: usar el paquete como banco de pruebas para comparar Loom frente a llama.cpp en las mismas GPU, si bien las mediciones comparativas aun no estan publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y R9700 "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran tambien como no re-medidas en ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 12B suele requerir en torno a 7-8 GB solo para pesos, pero el paquete no publica cifras de memoria del pool.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs NVIDIA ni para otras Radeon; el paquete esta atado a las dos plataformas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el preset (`chat` o `chat-r9700`) y `loom-serve` para arrancar el servidor en el puerto 8080.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el propio autor compara contra llama.cpp pero sin publicar resultados.
- Latencia y throughput: no disponibles; las tablas de rendimiento estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime objetivo | Estado de benchmarks |
|---|---|---|---|---|---|
| `loom-draft/unsloth-gemma-4-12B-it-loom` | 12B | 160.768 tokens | Apache 2.0 | Loom sobre AMD (gfx1151, gfx1201) | No publicados |
| `unsloth/gemma-4-12B-it-GGUF` (base) | 12B | no disponible en la informacion | Apache 2.0 | llama.cpp y compatibles | No disponible en la informacion |
| Otros modelos de 12B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria; la informacion proporcionada solo identifica el checkpoint base como referencia directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de resultados de correccion publicados: no hay evidencia de que la salida coincida con la referencia de llama.cpp en ninguna de las puertas definidas.
- El repositorio ocupa 0.0 GB y no registra descargas ni likes, lo que sugiere un artefacto incompleto o en fase de borrador.
- Soporte limitado a dos plataformas AMD concretas; no hay indicios de funcionamiento en NVIDIA, otras Radeon o CPU.
- Sin soporte de vision ni de audio en el runtime, pese a que el modelo base los ofrece.
- Sin decodificacion especulativa y con el estado del muestreo sin determinar ("not determined"), lo que introduce incertidumbre sobre la reproducibilidad de las respuestas.
- Concurrencia maxima de 4 peticiones y salida limitada a 4.096 tokens por preset, insuficiente para cargas de generacion larga.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Riesgo de alucinacion y sesgos del modelo base no evaluados en este paquete; al no haber pruebas de correccion, cualquier desviacion respecto al checkpoint original queda sin cuantificar.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del checkpoint base y del runtime `hrx-loom` antes de un uso comercial en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-gemma-4-12B-it-loom
- Checkpoint base: https://huggingface.co/unsloth/gemma-4-12B-it-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
