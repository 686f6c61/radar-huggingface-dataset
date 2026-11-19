# loom-draft/unsloth-Qwen3-VL-8B-Instruct-loom

## Resumen

`loom-draft/unsloth-Qwen3-VL-8B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3-VL-8B-Instruct-Q4_K_M.gguf` de `unsloth/Qwen3-VL-8B-Instruct-GGUF`. No es un modelo nuevo ni un fine-tuning: es una distribucion lista para ejecutar el modelo Qwen3-VL-8B-Instruct (8 mil millones de parametros, multimodal imagen-texto) sobre GPUs AMD concretas mediante el runtime `loom-serve` del ecosistema Loom (ROCm/hrx-system). El autor del paquete es `loom-draft` y los pesos subyacentes conservan la licencia Apache 2.0 del modelo original de Qwen.

El interes practico del artefacto esta en el soporte explicito de dos aceleradores AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). Frente a la ruta habitual de llama.cpp sobre ROCm, este paquete ofrece kernels generados especificamente para esas arquitecturas, servidor compatible con la API OpenAI (`/v1/chat/completions`), soporte de tool calling e imagen, y una ventana de contexto de 262.144 tokens por peticion con 4 peticiones concurrentes.

La relevancia es acotada pero clara: cubre el nicho de inferencia local de un VLM de 8B en hardware AMD de consumo/prosumer con una interfaz estandar, algo que hasta ahora dependia de compilaciones manuales de llama.cpp o de runtimes propietarios. La model card es transparente sobre el estado de validacion: las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, etc.) figuran como "not yet re-measured" para ambas GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): LLM decoder + proyector de vision (`mmproj-BF16.gguf`); arquitectura interna detallada no disponible en la informacion proporcionada |
| Parametros totales | 8B (segun nombre del checkpoint base Qwen3-VL-8B-Instruct) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del modelo base no detalladas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-VL-8B-Instruct-Q4_K_M.gguf`) + programas `.loom` generados + `tokenizer.json` + `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions`, `tools`/`tool_calls`, `image_url` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |
| Fecha de publicacion | 2026-11-19 |

## Arquitectura y entrenamiento

El paquete no entrena nada: reutiliza el checkpoint GGUF cuantizado a Q4_K_M de Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de la familia Qwen3-VL. La parte de vision se sirve mediante el proyector separado `mmproj-BF16.gguf`, en el esquema habitual de llama.cpp para modelos multimodales. La innovacion del artefacto no esta en el modelo sino en la capa de ejecucion: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) especificos para las arquitecturas gfx1151 y gfx1201, y `loom-serve` los ejecuta con una API compatible con OpenAI. El paquete incluye `model.json`/`model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO del modelo base en la informacion proporcionada; esos datos corresponden a la model card original de Qwen3-VL-8B-Instruct, no incluida aqui. Tampoco se documentan en esta ficha innovaciones como decodificacion especulativa: la tabla de features del autor la marca explicitamente como "not applicable", igual que el modo de razonamiento/thinking y el audio.

## Capacidades

- Generacion de texto conversacional multirround con ventana de 262.144 tokens por peticion.
- Entrada de imagen en formato OpenAI `image_url`, procesada por el proyector `mmproj-BF16.gguf` (pipeline `image-text-to-text`).
- Tool calling / function calling estilo OpenAI: campos `tools` y `tool_calls` en la peticion y respuesta.
- Servidor HTTP compatible con `/v1/chat/completions`, lo que permite reutilizar clientes y SDKs existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida).
- Sin modo de razonamiento/thinking ni ajuste de esfuerzo de razonamiento ("not applicable").
- Sin decodificacion especulativa.
- Comportamiento de muestreo (`sampling`) marcado como "not determined" por el autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de documentacion tecnica con capturas: el modelo acepta imagenes via `image_url` y puede responder preguntas sobre diagramas de arquitectura, capturas de paneles o errores en pantalla, aprovechando el contexto de 262.144 tokens para adjuntar documentacion extensa junto a la imagen.
- Automatizacion de soporte con herramientas: gracias al tool calling estilo OpenAI, se puede conectar a APIs internas (consulta de pedidos, estado de tickets) y encadenar llamadas dentro de un bucle de agente multi-turno.
- Procesamiento de documentos largos con elementos visuales: informes, facturas o formularios escaneados acompanados de texto largo caben en una sola peticion, lo que simplifica pipelines de extraccion sin troceado agresivo.
- Prototipado local en estaciones AMD: desarrolladores con Ryzen AI Max+ 395 o Radeon AI PRO R9700 pueden levantar un endpoint compatible con OpenAI en su propia maquina y probar aplicaciones sin depender de la nube.
- Evaluacion comparativa de runtimes: el paquete sirve como banco de pruebas para medir `loom-serve` frente a llama.cpp sobre el mismo GGUF, con puertas de correccion definidas (golden, compare, vision, consistency).
- Generacion asistida en IDE con contexto visual: al aceptar imagenes y texto, puede usarse para explicar fragmentos de codigo a partir de capturas o diagramas, integrado en herramientas que hablen la API de OpenAI.
- Chat de atencion al cliente multimodal: el cliente puede enviar una foto del producto o del error y el modelo responde en el mismo hilo, con hasta 4 conversaciones concurrentes por instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se ofrecen cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 8B, por lo que el peso de los pesos ronda los 5 GB, a lo que hay que sumar el proyector BF16 y el pool de memoria del runtime (`--pool_backing=fixed` reserva el pool por adelantado).
- GPUs soportadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta pensado para el APU Strix Halo, que integra memoria unificada; no se documenta soporte para GPUs consumer NVIDIA ni para otras Radeon en esta ficha.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. Flags relevantes: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Endpoint por defecto: `http://127.0.0.1:8080/v1/chat/completions`.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime / disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Qwen3-VL-8B-Instruct Q4_K_M via Loom) | 8B | 262.144 | Si (imagen) | Apache 2.0 | `loom-serve` sobre gfx1151 y gfx1201 |
| `unsloth/Qwen3-VL-8B-Instruct-GGUF` (modelo base) | 8B | no disponible en esta ficha | Si (imagen) | Apache 2.0 | llama.cpp y derivados; pesos GGUF |
| Qwen3-VL-8B-Instruct (original) | 8B | no disponible en esta ficha | Si (imagen) | Apache 2.0 | Transformers, vLLM, TGI (segun ecosistema Qwen) |
| Otros VLM de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del paquete ni del modelo base en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Paquete de despliegue, no modelo nuevo: cualquier limitacion del modelo Qwen3-VL-8B-Instruct subyacente se hereda sin cambios.
- Estado de validacion incompleto: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia publicada de equivalencia con llama.cpp en esta version.
- Cobertura de hardware estrecha: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPUs AMD o NVIDIA.
- Sin modo thinking ni decodificacion especulativa: no apto para flujos que dependan de razonamiento extendido explicito o de aceleracion especulativa.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes, lo que puede ser insuficiente para cargas de alta concurrencia.
- Idiomas soportados no declarados; conviene validar el comportamiento en castellano antes de produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime `hrx-loom` y de los terminos del ecosistema Loom, que no se detallan aqui.
- Fecha de publicacion futura (2026-11-19) y cero descargas/likes: sin evidencia de uso en produccion por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-8B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
