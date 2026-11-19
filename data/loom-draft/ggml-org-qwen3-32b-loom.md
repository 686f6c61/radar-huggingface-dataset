# loom-draft/ggml-org-Qwen3-32B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom`) para el checkpoint GGUF sin modificar `ggml-org/Qwen3-32B-GGUF`, en concreto la cuantizacion `Qwen3-32B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion. El objetivo es servir Qwen3-32B sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve`, que expone una API compatible con OpenAI.

El modelo subyacente es Qwen3-32B, un transformer denso de 32 mil millones de parametros de la familia Qwen3, con modo de razonamiento (thinking) activado por defecto y soporte de tool calling. El paquete Loom anade los programas compilados para las arquitecturas AMD mencionadas, el tokenizador, la configuracion y metadatos de medicion. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de este artefacto es operativa: permite ejecutar un modelo de 32B en GPUs de consumo profesional y APUs AMD sin depender de llama.cpp, con una ventana de contexto configurada de 40.960 tokens por peticion y 4 peticiones concurrentes. No obstante, en el momento de publicacion de la ficha no hay mediciones de rendimiento ni evidencia de los gates de correccion registradas para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B); paquete de despliegue Loom con kernels generados para gfx1151 y gfx1201 |
| Parametros totales | 32 mil millones (modelo base Qwen3-32B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por peticion (segun la configuracion del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no incluidas en este paquete |
| Idiomas soportados | no disponible (la model card del paquete no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-32B-Q4_K_M.gguf`) empaquetado en programas `.loom` (`weights.loom`) |

Otros parametros configurados: maximo de 4.096 tokens de salida por peticion (preset `max_tokens`), 4 peticiones concurrentes, tool calling en estilo OpenAI, thinking activado por defecto (desactivable con `chat_template_kwargs: {"enable_thinking": false}`), decodificacion especulativa no aplicable, entrada de imagen y audio no aplicables.

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-32B, es un transformer denso de 32B parametros de la familia Qwen3. La informacion proporcionada no incluye detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card original de Qwen3-32B.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el runtime: `loom-next` genera programas `.loom` especificos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (R9700), junto con un `model.json` que fija los ficheros fuente con verificacion sha256 mediante `loom-fetch`. El servidor `loom-serve` implementa una API `/v1/chat/completions` compatible con OpenAI y ofrece opciones de despliegue como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `pool_backing=fixed` (reserva de memoria por adelantado) y `parameter_mode=preload` (carga anticipada de pesos en host). Los gates de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, entre otros) estan definidos pero no tienen mediciones registradas para este paquete.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo thinking activado por defecto, desactivable por peticion.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes segun los gates definidos (`agent`, `agent_think_off`).
- Contexto de 40.960 tokens por peticion, suficiente para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base Qwen3-32B).
- Vision, audio, decodificacion especulativa y ajuste de reasoning effort: no aplicables en este paquete.

## Casos de uso

- Asistente conversacional self-hosted: el paquete se sirve con `loom-serve` en una Strix Halo o R9700 y expone un endpoint OpenAI, lo que permite integrarlo como backend de un chatbot interno con contexto de 40.960 tokens por peticion.
- Agentes con tool calling: gracias al soporte de `tools`/`tool_calls` y a los gates de agente definidos, puede encadenar llamadas a funciones en flujos multi-paso (consultas a APIs, operaciones sobre ficheros, orquestacion de tareas).
- Procesamiento de documentos largos: la ventana de 40.960 tokens permite resumir, extraer datos o responder preguntas sobre contratos, informes tecnicos o transcripciones extensas en una sola peticion.
- Razonamiento asistido con thinking mode: para tareas de analisis, planificacion o resolucion de problemas donde conviene que el modelo genere trazas de razonamiento antes de responder, con la posibilidad de desactivarlo en consultas simples para reducir latencia.
- Despliegue en hardware AMD sin CUDA: el paquete esta generado especificamente para gfx1151 y gfx1201, lo que permite montar inferencia local en APU Ryzen AI Max+ 395 o en GPU Radeon AI PRO R9700 sin depender del stack NVIDIA.
- Evaluacion comparativa frente a llama.cpp: los gates `golden` y `compare` estan disenados para contrastar token a token la salida del runtime Loom con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util como banco de pruebas de portabilidad de kernels.
- Servicio concurrente de baja escala: con 4 peticiones concurrentes y 4.096 tokens de salida maximos, encaja en escenarios de equipo pequeno o prototipado interno donde no se requiere un cluster de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todos los gates de correccion aparecen como "not yet re-measured". Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con llama.cpp.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 32B; el paquete esta pensado para GPUs con 32 GB (Radeon AI PRO R9700) y para la APU Ryzen AI Max+ 395 con memoria unificada. No se proporciona una cifra exacta de VRAM en la informacion disponible.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se declara soporte para GPUs NVIDIA ni para otras arquitecturas AMD.
- GPU de consumo: no disponible; la model card solo valida las dos plataformas AMD citadas.
- Despliegue: runtime propio `loom-serve` (instalable via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete desde Hugging Face. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp estan sin re-medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B via paquete Loom (este repositorio) | 32B densos | 40.960 tokens por peticion | GGUF Q4_K_M empaquetado en `.loom`, runtime `loom-serve` | Apache 2.0 | Hugging Face, 0 descargas |
| ggml-org/Qwen3-32B-GGUF (modelo base) | 32B densos | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp | Apache 2.0 | Hugging Face (modelo base referenciado) |
| Qwen3-32B original (pesos completos) | 32B densos | no disponible en la informacion proporcionada | safetensors (formato habitual de Qwen) | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a su distribucion GGUF, ya que la informacion proporcionada no incluye datos de rendimiento de alternativas de la misma categoria que permitan una comparacion numerica fiable.

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: todos los gates (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, etc.) figuran como "not yet re-measured", por lo que no hay garantia registrada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no hay latencia ni throughput publicados para ninguna de las dos plataformas objetivo.
- Cero adopcion: 0 descargas y 0 likes en Hugging Face, lo que implica ausencia de validacion comunitaria.
- Alcance de hardware muy restringido: solo declarado para gfx1151 y gfx1201; no hay soporte documentado para otras GPU.
- Dependencia de un runtime propietario del ecosistema Loom (`hrx-loom` 0.2.0), lo que limita la portabilidad frente a soluciones estandar como llama.cpp u Ollama.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los inherentes al modelo base Qwen3-32B y deben evaluarse con la model card original.
- Idiomas soportados no declarados en este paquete; la cobertura linguistica depende del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3-32B y del runtime Loom por separado.
- El limite de 4 peticiones concurrentes y 4.096 tokens de salida puede ser insuficiente para cargas de produccion de mayor volumen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-32B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-32B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
