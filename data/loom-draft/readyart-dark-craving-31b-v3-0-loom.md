# loom-draft/ReadyArt-Dark-Craving-31B-v3.0-loom

## Resumen

ReadyArt-Dark-Craving-31B-v3.0-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Dark-Craving-31B-v3.0-GGUF`, concretamente el fichero `Dark-Craving-31B-v3.0-Q4_K_M_hb16.gguf`. No se trata de un modelo nuevo: los pesos son los del modelo base de ReadyArt, y este repositorio solo aporta el artefacto necesario para servirlo con el runtime `loom-serve` sobre GPUs AMD concretas.

El objetivo del paquete es habilitar la inferencia del modelo en dos aceleradores AMD específicos: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next` (el generador, sin LLM en el bucle), que produce kernels y programas Loom a partir del GGUF de referencia. Incluye presets de despliegue (`chat` y `chat-r9700`), un servidor compatible con la API OpenAI (`/v1/chat/completions`) y soporte de tool calling y modo thinking.

La relevancia es acotada pero clara: permite ejecutar un modelo de 31B en cuantización Q4_K_M sobre hardware AMD de consumo y workstation con una ruta de despliegue reproducible y verificable (checksums sha256 de los ficheros fuente fijados en `model.json.lock`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB (los pesos no están alojados aquí, se resuelven vía `loom-fetch` desde el repo base) y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de 31B; la arquitectura exacta no se detalla en la informacion proporcionada) |
| Parametros totales | 31B (deducido del nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `Dark-Craving-31B-v3.0-Q4_K_M_hb16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom` para el runtime Loom) |

Otros parametros operativos del preset:

| Parametro | Valor |
|---|---|
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (formato OpenAI `tools` / `tool_calls`) |
| Modo thinking | desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` |
| Decodificacion especulativa | no aplicable en este paquete |
| Entrada de imagen | no soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | no determinado |
| Muestreo | no determinado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ReadyArt/Dark-Craving-31B-v3.0-GGUF` en la documentacion proporcionada: no se detalla si es un transformer denso, un MoE o un modelo hibrido, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. El nombre indica 31B parametros y el checkpoint empaquetado esta en cuantizacion Q4_K_M, lo que situa el peso aproximado de los pesos en torno a 18-19 GB (estimacion por regla general de ~4,5 bits efectivos por parametro, no confirmada por el autor).

Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO o ajuste fino). Lo unico verificable es que este repositorio no modifica los pesos: es un paquete de despliegue generado con `loom-next` que traduce el GGUF a programas Loom (`program/*.loom`, `weights.loom`) con kernels especificos para gfx1151 y gfx1201. Las innovaciones tecnicas relevantes son del runtime, no del modelo: pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de completions de GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles de agente multi-paso segun los gates de correccion definidos (`agent`, `agent_think_off`).
- Modo de razonamiento/thinking opcional, desactivado por defecto y activable por peticion.
- Manejo de contexto largo: hasta 53.248 tokens por peticion, suficiente para documentos extensos y conversaciones con historial amplio.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia garantizada por el gate `consistency`.
- Entrada de imagen: no soportada en este paquete Loom, aunque el modelo upstream la tiene.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Entrada/salida de audio: no determinado.

## Casos de uso

- Asistente conversacional autoalojado en workstation AMD: el paquete esta pensado para `loom-serve` sobre Radeon AI PRO R9700 (32 GB) o Ryzen AI Max+ 395, permitiendo servir un 31B en Q4_K_M con API OpenAI sin depender de CUDA.
- Procesamiento de documentos largos: con 53.248 tokens de contexto por peticion se pueden resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Agentes con herramientas: el soporte de `tool_calls` en formato OpenAI permite integrar el modelo en flujos que consultan APIs, bases de datos o sistemas internos mediante bucles multi-paso.
- Razonamiento con thinking opcional: para tareas que se benefician de cadena de pensamiento (analisis, planificacion, depuracion) se activa `enable_thinking: true` por peticion, manteniendo el modo rapido por defecto para el resto del trafico.
- Despliegue en laboratorio o investigacion con hardware AMD: util para equipos que ya tienen Strix Halo o R9700 y quieren evaluar modelos de 31B sin montar infraestructura NVIDIA.
- Backend de chat para herramientas internas: al exponer `/v1/chat/completions` se puede conectar directamente a clientes y SDKs compatibles con OpenAI (por ejemplo, interfaces de chat o frameworks de orquestacion) apuntando a `http://127.0.0.1:8080`.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye gates de correccion (`golden`, `compare`, `logits`) disenados para contrastar la salida token a token contra la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento y los gates de correccion «no se han vuelto a medir» (`not yet re-measured`) tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), por lo que no hay cifras de throughput, latencia ni calidad que reportar.

| Gate de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| `kernel_tests` | no medido | no medido |
| `golden` | no medido | no medido |
| `compare` | no medido | no medido |
| `vision` | no medido | no medido |
| `consistency` | no medido | no medido |
| `spec` | no medido | no medido |
| `agent` | no medido | no medido |
| `agent_think_off` | no medido | no medido |
| `sampling` | no medido | no medido |
| `logits` | no medido | no medido |
| `decision` | no medido | no medido |

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 31B ocupa aproximadamente 18-19 GB de pesos (estimacion estandar para ~4,5 bits efectivos por parametro; el autor no publica la cifra exacta). Hay que anadir el espacio para KV cache a 53.248 tokens de contexto, que no se cuantifica en la informacion disponible.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). No se mencionan otras GPU compatibles.
- GPU consumer: no se indica compatibilidad con GPUs de consumo NVIDIA o AMD distintas de las dos anteriores. La R9700 es una GPU de workstation, no de consumo.
- Opciones de despliegue: el paquete esta disenado exclusivamente para el runtime Loom (`hrx-loom[hf]==0.2.0`, comando `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; llama.cpp se usa solo como referencia de correccion.
- Instalacion: `pipx install "hrx-loom[hf]==0.2.0"` y descarga con `loom-fetch huggingface:loom-draft/ReadyArt-Dark-Craving-31B-v3.0-loom:chat` (o `:chat-r9700` para la R9700) con `--materialize=copy`.
- Latencia y throughput: no disponibles; las mediciones del autor estan pendientes de repetir para este paquete.
- Configuracion de servidor recomendada por el autor: `--pool_backing=fixed` y `--parameter_mode=preload`, con `completion_spin_ns=4294967295` para espera activa de completions (consume CPU mientras hay trabajo en GPU).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable con alternativas. A continuacion se comparan solo caracteristicas verificables de despliegue y formato.

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Dark-Craving-31B-v3.0 (paquete Loom) | 31B | 53.248 tokens | GGUF Q4_K_M empaquetado en Loom | Apache 2.0 | AMD R9700, Ryzen AI Max+ 395 |
| Dark-Craving-31B-v3.0-GGUF (base) | 31B | no disponible | GGUF | no disponible en esta ficha | Generico (llama.cpp y similares) |
| Alternativas de 30-34B en GGUF | ~30-34B | variable | GGUF | variable | Generico |

No se identifican en la informacion proporcionada modelos comparables concretos con datos de benchmarks que permitan contrastar calidad. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es un paquete de despliegue que depende del repo base `ReadyArt/Dark-Craving-31B-v3.0-GGUF`; si ese repo cambia o desaparece, el paquete deja de ser reproducible.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-19), sin historial de uso.
- Sin mediciones de rendimiento ni de correccion: todos los gates de la model card figuran como «not yet re-measured», por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete.
- Dependencia de un runtime nicho: requiere `hrx-loom` 0.2.0 y funciona solo en gfx1151 y gfx1201; no hay ruta documentada para NVIDIA, otras AMD ni CPU.
- La entrada de imagen del modelo upstream no esta disponible en Loom; si el caso de uso depende de vision, este paquete no sirve.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por peticion, lo que puede ser insuficiente para cargas de produccion con alto trafico o respuestas muy largas.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor; al ser un finetune de un modelo base de terceros, hereda los sesgos y limitaciones de este, que no se detallan.
- Licencia Apache 2.0 declarada en el paquete, pero la licencia del modelo base no se verifica en esta informacion; conviene comprobarla en el repo de ReadyArt antes de uso comercial.
- El contenido de la model card es escueto y esta truncado en la seccion de ficheros; no hay informacion sobre la plantilla de chat exacta ni sobre el tokenizador mas alla de lo que expone el preset.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/ReadyArt-Dark-Craving-31B-v3.0-loom
- Modelo base GGUF: https://huggingface.co/ReadyArt/Dark-Craving-31B-v3.0-GGUF
- Runtime Loom (ROCm HRX system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
