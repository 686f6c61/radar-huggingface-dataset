# loom-draft/mradermacher-Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) generado con la herramienta `loom-next` para servir, sin modificar, el checkpoint GGUF `Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1-Q4_K_M.gguf` publicado por mradermacher. El modelo subyacente deriva de la familia Qwen3 (6B parametros), con especializacion en razonamiento y generacion de codigo, e incorpora ajustes de instruccion y un modo de pensamiento ("thinking") activado por defecto. El paquete esta orientado a GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta publicacion es de infraestructura mas que de modelado: demuestra el uso del runtime Loom sobre ROCm para ejecutar un GGUF Q4_K_M con API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y razonamiento opcional, con un preset fijo de 40.960 tokens de contexto por peticion y 4 peticiones concurrentes. No aporta pesos nuevos ni un entrenamiento adicional; es una capa de empaquetado y servicio.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el 19 de noviembre de 2026, y no incluye resultados de benchmarks ni mediciones de rendimiento propias: la propia model card indica que las mediciones para Strix Halo y R9700 "aun no se han vuelto a medir". La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete sirve un GGUF de la familia Qwen3; la model card no detalla la arquitectura interna) |
| Parametros totales | 6B (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens por peticion (preset de Loom) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`); el checkpoint original esta en GGUF |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) sobre ROCm |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente mas alla de su procedencia: un GGUF Q4_K_M derivado de `Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1`, a su vez un fine-tune de la familia Qwen3 de 6B parametros orientado a razonamiento y codigo. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo original en la informacion proporcionada. Tampoco se detalla si el checkpoint incorpora decodificacion especulativa: la tabla de caracteristicas de Loom marca "speculative decoding" como no aplicable.

Lo que si describe la model card es la capa de despliegue. `loom-next` genera kernels y programas `.loom` a partir del GGUF sin intervencion de un LLM en el bucle, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El modo de razonamiento esta activado por defecto y se desactiva por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`. No se especifica el nivel de esfuerzo de razonamiento ("reasoning effort" figura como no aplicable).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explicito con modo "thinking" activado por defecto y desactivable por peticion.
- Generacion de codigo, segun la especializacion declarada en el nombre del checkpoint base (CODER).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Flujo de agentes multi-turno con tool calling, con y sin modo de pensamiento (pruebas `agent` y `agent_think_off` definidas en la model card).
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 40.960 tokens por peticion.
- Entrada de imagen: no determinada ("not determined").
- Entrada y salida de audio: no determinada.
- Muestreo configurable (temperature, top_k, seed): no determinado en la tabla de caracteristicas, aunque existe una prueba `sampling` definida.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente de codigo autohospedado en estaciones AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone `/v1/chat/completions`, por lo que puede conectarse a cualquier cliente compatible con OpenAI para autocompletado y explicacion de codigo en local, sin dependencia de la nube.
- Agentes de desarrollo con tool calling: el soporte de `tools`/`tool_calls` y la prueba de bucle agente multi-turno permiten construir asistentes que invocan herramientas (ejecutar tests, consultar repositorios) sobre el endpoint local.
- Razonamiento con traza explicita en tareas de depuracion: el modo thinking activado por defecto facilita obtener cadenas de razonamiento para diagnosticar errores de codigo, y puede desactivarse cuando se prioriza latencia.
- Evaluacion de la pila ROCm/Loom en hardware de escritorio: util para equipos que quieran medir el rendimiento de un 6B Q4_K_M en gfx1151 o gfx1201 antes de comprometerse con un despliegue mayor.
- Prototipado de pipelines con contexto largo: los 40.960 tokens por peticion permiten procesar ficheros de codigo o documentacion extensos en una sola llamada, con hasta 4.096 tokens de salida.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes y API OpenAI, encaja en herramientas internas de equipo (revision de parches, generacion de documentacion tecnica) donde no se requiere escalado horizontal.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del paquete facilita su integracion en productos comerciales, sujeto a las condiciones del checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "aun no se han vuelto a medir", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un checkpoint de 6B en Q4_K_M ronda los 4 GB de pesos, pero la model card no publica el consumo del pool de memoria del preset.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon de escritorio distintas de las listadas; no disponible.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa solo como referencia de correccion.
- Latencia y throughput: no disponibles (mediciones pendientes).
- Concurrencia maxima: 4 peticiones; contexto por peticion: 40.960 tokens; salida maxima: 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1, Q4_K_M, Loom) | 6B | 40.960 tokens/peticion | `.loom` + GGUF | Apache 2.0 | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| Checkpoint base `mradermacher/Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1-GGUF` | 6B | no disponible | GGUF | no disponible en la informacion proporcionada | Ejecutable con llama.cpp y otros runtimes GGUF; sin empaquetado Loom |
| Otros modelos de la familia Qwen3 de 6B | 6B | no disponible | safetensors/GGUF | no disponible en la informacion proporcionada | No se dispone de datos comparativos en la informacion proporcionada |

No hay datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un empaquetado de despliegue de un GGUF de terceros; cualquier limitacion del checkpoint base se hereda sin cambios.
- Ausencia total de benchmarks y de pruebas de correccion completadas: no hay evidencia publicada de calidad de salida ni de equivalencia con llama.cpp para este paquete.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPUs.
- Contexto efectivo limitado a 40.960 tokens por peticion y salida a 4.096 tokens por el preset, independientemente del contexto nativo del modelo.
- Concurrencia maxima de 4 peticiones: no apto para cargas de produccion con alto paralelismo sin escalado adicional.
- Idiomas soportados no declarados; no se puede confirmar calidad en castellano ni en otros idiomas.
- Entrada de imagen y audio no determinadas; no deben asumirse capacidades multimodales.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse empiricamente antes de un uso en produccion.
- Licencia Apache 2.0 declarada para el paquete; conviene verificar las condiciones del checkpoint base y del modelo Qwen3 original antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de mantenimiento posterior a su creacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1-loom
- Checkpoint base en Hugging Face: https://huggingface.co/mradermacher/Qwen3-Esper3-Reasoning-CODER-Instruct-6B-Brainstorm20x-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
