# loom-draft/ggml-org-flint-loom

## Resumen

`loom-draft/ggml-org-flint-loom` es un paquete de despliegue en formato Loom generado a partir del checkpoint GGUF cuantizado `ggml-org/flint-GGUF` (concretamente `Flint-Q4_K_M.gguf`), sin modificaciones sobre los pesos originales. Lo publica el usuario `loom-draft` y su proposito no es ofrecer un modelo nuevo, sino empaquetar un modelo existente para que pueda ejecutarse sobre GPUs AMD mediante el runtime Loom (`hrx-loom`), con programas `.loom` generados automaticamente por la herramienta `loom-next` (sin intervencion de un LLM en el bucle de generacion).

El paquete esta orientado a dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye dos presets (`chat` y `chat-r9700`), un `model.json` con la ficha y los ficheros fuente fijados por hash sha256, el tokenizer, la configuracion del modelo y los programas generados. Expone un servidor compatible con la API OpenAI (`/v1/chat/completions`) mediante `loom-serve`.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra la viabilidad de ejecutar un GGUF cuantizado en Q4_K_M sobre el stack ROCm/Loom en hardware AMD consumer y profesional, con soporte declarado de tool calling, modo razonamiento siempre activo y una ventana de contexto de 262.144 tokens por peticion. No obstante, la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`gates.sh`) aun no se han re-medido para este paquete, por lo que no hay evidencia publicada de velocidad ni de fidelidad numerica frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint `ggml-org/flint-GGUF`, no documentada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF original; empaquetado en programas `.loom` + `weights.loom` |

Otros datos operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si (formato OpenAI `tools` / `tool_calls`) |
| Modo razonamiento | Si, siempre activo |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen | No |
| Entrada/salida de audio | No |
| Sampling | No determinado |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Generador del paquete | `loom-next` |
| Version de esquema de ficha | `loom-card` (truncado en la informacion disponible) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base `ggml-org/flint-GGUF`: no se especifica si es un transformer denso, un MoE, un modelo hibrido o un SSM, ni el numero de parametros, capas o cabezas de atencion. Tampoco se detalla el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares. Esta ficha describe, por tanto, el paquete de despliegue y no las caracteristicas del modelo subyacente.

Lo que si documenta la model card es la capa de ejecucion: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF sin alterar los pesos, y `loom-serve` los ejecuta sobre el runtime AMD. El paquete incluye dos presets diferenciados por GPU (`chat` para gfx1151 y `chat-r9700` para gfx1201), un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y carga de parametros en modo `preload`. La opcion `completion_spin_ns=4294967295` activa espera activa en las finalizaciones de GPU, lo que consume CPU mientras hay trabajo en vuelo; segun la card, las mediciones de rendimiento (no publicadas aun para este paquete) se realizaron con esa configuracion. No se declaran innovaciones de decodificacion especulativa ni atencion lineal; de hecho, la decodificacion especulativa figura como "no aplicable".

## Capacidades

- Generacion de texto conversacional a traves de un endpoint compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite reutilizar clientes y SDKs existentes.
- Tool calling en formato OpenAI: acepta el campo `tools` y devuelve `tool_calls`, habilitando integracion con frameworks de agentes que ya hablan ese protocolo.
- Modo razonamiento ("thinking") siempre activo: el modelo genera trazas de razonamiento en cada peticion; no existe un parametro de "esfuerzo de razonamiento" (marcado como no aplicable).
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultaneas por instancia servida.
- Salida limitada a 4.096 tokens por respuesta (valor del preset `max_tokens`), configurable presumiblemente en el preset pero no documentado como ajuste de API.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y decodificacion especulativa: no soportadas segun la tabla de features de la model card.
- Muestreo (`temperature`, `top_k`, `seed`): estado "no determinado" en la card, aunque existe una puerta de correccion `sampling` prevista.

## Casos de uso

- Despliegue de un asistente conversacional en estaciones de trabajo con GPU AMD: usando `loom-serve` sobre una Radeon AI PRO R9700 o una APU Strix Halo, se levanta un endpoint OpenAI en `127.0.0.1:8080` que cualquier cliente compatible puede consumir sin adaptadores propios.
- Prototipado de agentes con tool calling en hardware AMD: el soporte nativo de `tools`/`tool_calls` permite conectar el modelo a frameworks de agentes (LangChain, LlamaIndex, SDK de OpenAI) y validar bucles multi-paso localmente antes de mover la carga a un cluster.
- Analisis de documentos largos: con 262.144 tokens de contexto por peticion, es viable procesar contratos, informes o bases de codigo extensas en una sola pasada, siempre que la salida quepa en los 4.096 tokens del preset.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`, `agent`) disenadas para contrastar token a token contra llama.cpp sobre el mismo GGUF, lo que lo convierte en una herramienta para validar la fidelidad de Loom frente a la referencia.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes, encaja en equipos de desarrollo o laboratorios donde varios usuarios comparten una unica GPU y no se requiere alta disponibilidad.
- Reproducibilidad de experimentos: al fijar los ficheros fuente por sha256 en `model.json.lock` y registrar versiones y comandos en `REPORT.md` e `info.json`, el paquete sirve como artefacto auditable para replicar resultados en hardware AMD concreto.
- Integracion en pipelines de CI para kernels: las pruebas `kernel_tests` comparan los kernels generados contra implementaciones de referencia, utiles para detectar regresiones al actualizar el runtime o los drivers ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos el texto indica explicitamente: "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia registrada de fidelidad numerica ni de velocidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M, pero no se indica el numero de parametros, por lo que no puede calcularse el tamano en memoria. El preset `chat-r9700` esta pensado para una GPU de 32 GB (Radeon AI PRO R9700); el preset `chat` esta pensado para la APU Ryzen AI Max+ 395, que comparte memoria del sistema con la GPU.
- GPU soportadas segun la card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU AMD ni NVIDIA.
- GPU consumer: no hay confirmacion de que funcione en GPUs de consumo distintas de la APU Strix Halo; la card solo lista los dos aceleradores citados.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como vias de despliegue de este paquete (llama.cpp aparece unicamente como referencia de correccion en las puertas).
- Latencia y throughput: no disponibles. Las mediciones frente a llama.cpp estan pendientes de re-medicion para ambas GPUs.
- Parametros de ejecucion relevantes: `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` carga los pesos en host antes de servir; `completion_spin_ns=4294967295` activa espera activa en las finalizaciones de GPU (consume CPU durante el trabajo en vuelo).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base (`ggml-org/flint-GGUF`) que permitan situarlo frente a alternativas de su misma categoria. Como referencia de runtime, la unica comparacion mencionada es contra llama.cpp, pero sin cifras publicadas para este paquete.

| Aspecto | Este paquete | llama.cpp (referencia en la card) |
|---|---|---|
| Formato de pesos | GGUF empaquetado en `.loom` | GGUF nativo |
| Hardware objetivo | gfx1151 y gfx1201 | Amplio soporte (CPU, CUDA, ROCm, Metal) |
| Medicion de rendimiento | Pendiente ("not yet re-measured") | Referencia usada en las puertas de correccion |
| Datos comparativos publicados | No | No en esta informacion |

## Limitaciones y advertencias

- Ausencia de evidencia de rendimiento y correccion: todas las puertas (`golden`, `compare`, `logits`, `agent`, etc.) y las tablas de rendimiento frente a llama.cpp figuran como no re-medidas para ambas GPUs. No debe asumirse paridad numerica con llama.cpp sin ejecutar las puertas.
- Hardware muy restringido: solo se declaran soportados Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Salida limitada a 4.096 tokens por respuesta, lo que puede ser insuficiente para generacion de codigo extensa o resumenes largos aunque el contexto de entrada sea de 262.144 tokens.
- Concurrencia baja (4 peticiones): no apto para cargas de produccion con muchos usuarios simultaneos sin escalar horizontalmente.
- Modo razonamiento siempre activo y sin control de esfuerzo: no puede desactivarse por API, lo que incrementa el consumo de tokens de salida en tareas simples.
- Muestreo no determinado: el comportamiento de `temperature`, `top_k` y `seed` no esta verificado; la puerta `sampling` esta pendiente.
- Idiomas soportados no documentados: no puede confirmarse cobertura multilingue ni calidad en castellano.
- Arquitectura y tamano del modelo base no documentados: dificulta estimar VRAM, latencia y calidad esperada.
- Riesgo de alucinacion y sesgos: no disponible; no se han publicado evaluaciones al respecto en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar la licencia del checkpoint base `ggml-org/flint-GGUF` de forma independiente, ya que esta ficha solo cubre el empaquetado.
- Dependencia de versiones concretas: el paquete fija `hrx-loom[hf]==0.2.0` y verifica los ficheros fuente por sha256; actualizaciones del runtime o de los drivers ROCm pueden invalidar los resultados.
- Los resultados de busqueda web devueltos no son relevantes: corresponden a la herramienta de grabacion de pantalla Loom, a una tienda de ropa y a un restaurante, y no aportan informacion sobre este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-flint-loom
- Modelo base (GGUF): https://huggingface.co/ggml-org/flint-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
