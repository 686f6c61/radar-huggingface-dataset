# ndaly/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B-A3B es un modelo de razonamiento de tipo mixto (MoE) con arquitectura hibrida Mamba-2 / atencion, desarrollado por NVIDIA. Cuenta con aproximadamente 30.000 millones de parametros totales y unos 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos eficientes para inferencia. Su ventana de contexto alcanza 1.048.576 tokens, un valor excepcional para tareas de contexto largo.

El checkpoint publicado bajo el identificador `ndaly/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` es un empaquetado del checkpoint oficial de NVIDIA en formato NVFP4 (cuantizacion de 4 bits en coma flotante), derivado sin modificaciones del modelo original. Este paquete concreto esta preparado para su despliegue sobre hardware Tenstorrent p300x2 (malla de cuatro chips con tensor parallelism) mediante vLLM y la herramienta tt-model-manager.

La relevancia de esta ficha radica en que documenta una via de despliegue alternativa (aceleradores Tenstorrent) para un modelo de razonamiento de gran contexto, con soporte de tool calling y separacion del texto de razonamiento respecto a la respuesta final. No obstante, el rendimiento medido en este empaquetado es notablemente inferior al de referencia de NVIDIA, lo que debe tenerse en cuenta antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 / atencion con mezcla de expertos (MoE) |
| Parametros totales | 30B (aproximado) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (checkpoint publicado); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | NVFP4 (checkpoint convertido a layout de dispositivo y cacheado en el primer arranque) |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba-2 (modelo de espacio de estados) con capas de atencion y un esquema de mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token sobre un total de 30.000 millones. Esta combinacion busca reducir el coste computacional de inferencia manteniendo capacidad de razonamiento, y es la misma familia arquitectonica que NVIDIA ha venido desplegando en sus modelos Nemotron recientes. El contexto maximo soportado es de 1.048.576 tokens.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia arquitectura hibrida. El paquete es una derivacion sin modificaciones del checkpoint oficial de NVIDIA, por lo que los detalles de entrenamiento deben consultarse en la model card original.

## Capacidades

- Generacion de texto y razonamiento: el modelo incorpora un modo de pensamiento (thinking) activado por defecto, cuyo texto se devuelve en el campo `reasoning_content`, separado de la respuesta final en `content`.
- Tool calling / function calling: habilitado mediante el parser `qwen3_coder`; las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso como agente: la separacion entre razonamiento y respuesta facilita su integracion en bucles de agente.
- Contexto largo: soporta peticiones de hasta 1.048.576 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Servicio mediante API compatible con OpenAI: chat completions, completions y `/v1/models` en el puerto 20000 por defecto.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Razonamiento conversacional con traza separada: el modelo devuelve el pensamiento en `reasoning_content` y la respuesta en `content`, lo que permite auditar el razonamiento o filtrarlo antes de mostrarlo al usuario final en asistentes tecnicos.
- Analisis de documentos extensos: con 1.048.576 tokens de contexto se pueden procesar informes, expedientes o bases de codigo completas en una sola peticion, sin necesidad de fragmentacion ni recuperacion externa.
- Agentes con tool calling: la integracion del parser `qwen3_coder` permite construir agentes que invoquen funciones externas (APIs, bases de datos, calculadoras) y encadenen varios pasos de razonamiento.
- Atencion al cliente automatizada: conversaciones multi-turno con historial largo gracias a la ventana de contexto, con la traza de razonamiento separada para control de calidad.
- Generacion y revision de codigo asistida: el modelo puede razonar sobre fragmentos de codigo y emitir llamadas a herramientas en pipelines de desarrollo, aunque el rendimiento medido en este empaquetado aconseja validacion humana.
- Investigacion sobre hardware alternativo: este paquete sirve como referencia para evaluar el rendimiento de modelos MoE de gran contexto sobre aceleradores Tenstorrent p300x2 frente a GPUs convencionales.
- Procesamiento por lotes de contexto largo: tareas de resumen, extraccion o clasificacion sobre corpus grandes, siempre que se acepte la latencia de prefill documentada (unos 21 s para 16k tokens con 2 usuarios).

## Benchmarks y rendimiento

| Evaluacion | Este paquete | Referencia NVIDIA | Prompts |
|---|---|---|---|
| MMLU-Pro, 5-shot, greedy, via `/v1/completions` | 41,4 % | 81,62 % (conjunto completo) | 70 |
| MMLU-Pro, 5-shot, greedy, via `/v1/chat/completions` | 38,6 % | 81,62 % (conjunto completo) | 70 |

En el endpoint de chat, 38 de las 70 respuestas quedaron vacias porque la cadena de parada del harness (`Question:`) aparecia dentro del razonamiento, lo que invalida parcialmente esa medicion. El resto de cifras de rendimiento son de latencia y throughput:

| Perfil | ISL | OSL | Concurrencia | N | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|---|---|
| default | 128 | 128 | 1 | 3 | — | — | — | 6,0 |
| default | 1.024 | 256 | 1 | 3 | — | — | — | 11,8 |
| default | 4.096 | 256 | 1 | 3 | — | — | — | 12,2 |
| default | 16.384 | 256 | 1 | 3 | — | — | — | 17,5 |
| default | 32.768 | 256 | 1 | 3 | — | — | — | 24,4 |
| default | 128 | 128 | 2 | 3 | — | — | — | 6,6 |
| default | 128 | 128 | 4 | 5 | — | — | — | 6,7 |
| default | 128 | 128 | 8 | 9 | — | — | — | 6,7 |
| default | 1.024 | 256 | 2 | 3 | — | — | — | 14,0 |
| default | 1.024 | 256 | 4 | 5 | — | — | — | 15,1 |
| default | 1.024 | 256 | 8 | 9 | — | — | — | 15,0 |
| default | 128 | 128 | 2 | 4 | 620 | 206 | 17,3 (34,6 agregado) | — |
| default | 1.024 | 256 | 2 | 4 | 1.800 | 569 | 16,7 (33,3 agregado) | — |
| default | 4.096 | 256 | 2 | 4 | 8.900 | 460 | 11,4 (22,7 agregado) | — |
| default | 16.384 | 256 | 2 | 4 | 20.800 | 788 | 7,4 (14,8 agregado) | — |

Mediciones realizadas el 2026-10-13 sobre una unica p300x2, con decodificacion greedy e `ignore_eos`. Las once primeras filas son una escalera de latencia con prompts de relleno y prefijo unico (sin cache de prefijo); las cuatro ultimas son `vllm bench serve` con prompts aleatorios a 2 usuarios.

## Requisitos de hardware

- Hardware validado: Tenstorrent p300x2, una malla de cuatro chips con tensor parallelism sobre 4 chips.
- VRAM estimada: no disponible; el despliegue documentado no usa GPU convencional sino aceleradores Tenstorrent.
- GPU recomendadas: no disponible; el paquete esta empaquetado especificamente para p300x2 y no se documenta soporte en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible para este empaquetado; el checkpoint NVFP4 de 1,9 GB en repositorio requiere conversion al layout de dispositivo en el primer arranque.
- Opciones de despliegue: vLLM con plugin de Tenstorrent, mediante `tt serve` (Tenstorrent CLI) o `tt-model serve`, con servidor compatible OpenAI en el puerto 20000.
- Concurrencia: hasta 32 secuencias concurrentes, aunque las pruebas se realizaron con un maximo de 8 usuarios.
- Latencia y throughput: TTFT de 620 ms para 128 tokens de entrada a 2 usuarios, y de 20,8 s para 16.384 tokens; decodificacion de 17,3 tok/s por usuario a 128 tokens de entrada, degradandose a 7,4 tok/s por usuario con 16k de entrada. El prefill es secuencial entre usuarios y no hay cache de prefijo ni chunked prefill.
- Primer arranque: compila kernels para el dispositivo (varios minutos) y convierte los pesos NVFP4 al layout de dispositivo, cacheandolos para arranques posteriores. Tras una parada no limpia es necesario ejecutar `tt-smi -r`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (este paquete) | ~30B | ~3B | 1.048.576 | OpenMDW-1.1 | Tenstorrent p300x2 via vLLM |
| Checkpoint original NVIDIA (NVFP4) | ~30B | ~3B | 1.048.576 | OpenMDW-1.1 | Hugging Face, despliegue GPU convencional |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es contra el checkpoint oficial de NVIDIA, cuyo MMLU-Pro de referencia es del 81,62 % frente al 41,4 % medido en este empaquetado sobre p300x2. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado: el MMLU-Pro medido (41,4 %) esta muy por debajo de la referencia de NVIDIA (81,62 %); parte de la diferencia puede atribuirse al conjunto reducido de 70 prompts y a problemas del harness, pero la brecha es lo bastante grande como para exigir validacion propia antes de produccion.
- Validado unicamente en p300x2: un solo tipo de hardware, con tensor parallelism sobre 4 chips; no hay garantias en otras configuraciones.
- Prefill sin cache: la cache de prefijo y el chunked prefill estan desactivados, por lo que cada peticion reprocesa la entrada completa y el TTFT crece con la longitud del prompt y el numero de usuarios (unos 21 s para 16k tokens con 2 usuarios).
- Sin logprobs: el muestreo en dispositivo no devuelve logprobs, lo que impide su uso en tareas que los requieran.
- Problemas con thinking desactivado: si se pasa `chat_template_kwargs: {"enable_thinking": false}` o una continuacion con `continue_final_message`, el parser no encuentra `</think>` y puede devolver la respuesta de forma incompleta.
- Timeout de decodificacion: un paso que supere `NEMOTRON_STEP_TIMEOUT_S` (900 s por defecto) aborta el motor y el contenedor termina; hay que relanzar el servicio.
- Alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible; como en cualquier modelo generativo, existe riesgo de alucinacion, especialmente en tareas de contexto muy largo.
- Idiomas: no disponible; no se confirma soporte multilingue.
- Licencia OpenMDW-1.1: es necesario revisar los terminos en el enlace oficial antes de uso comercial, ya que Hugging Face la etiqueta como `license: other`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ndaly/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
