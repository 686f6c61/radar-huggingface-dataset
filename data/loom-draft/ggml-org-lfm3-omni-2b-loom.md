# loom-draft/ggml-org-LFM3-Omni-2B-loom

## Resumen

LFM3-Omni-2B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/LFM3-Omni-2B-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y esta pensado especificamente para dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, que actua como generador sin intervencion de un LLM en el bucle.

El modelo subyacente es LFM3-Omni-2B, un modelo de 2.000 millones de parametros con capacidades omni (texto, imagen y audio segun la model card original). Sin embargo, el runtime Loom solo expone la modalidad de texto: la entrada de imagen y de audio estan marcadas como no soportadas. El interes de este artefacto no reside en el modelo en si, sino en demostrar la portabilidad del ecosistema Loom sobre hardware AMD consumer y profesional, con soporte de API compatible con OpenAI, tool calling, modo de razonamiento opcional y una ventana de contexto de 128.000 tokens por peticion.

La relevancia es acotada: se trata de un paquete de despliegue, no de un modelo nuevo ni de un fine-tune. No tiene descargas ni likes en el momento de redactar esta ficha, y las mediciones de rendimiento y las puertas de correccion aparecen como "no re-medidas" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni-2B; arquitectura del transformer no detallada en la informacion proporcionada) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con programas `.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-Omni-2B ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La model card del paquete Loom no describe la arquitectura del transformer, y los resultados de busqueda web no aportan datos tecnicos sobre el modelo, ya que corresponden a servicios y comercios homonimos sin relacion.

Lo que si documenta la model card es la capa de despliegue: el paquete se genera con `loom-next` a partir del GGUF original sin modificarlo, y se compila en programas `.loom` que se ejecutan mediante `loom-serve` sobre el runtime `hrx-loom` version 0.2.0. El paquete fija el pool de memoria con `--pool_backing=fixed`, precarga los pesos con `--parameter_mode=preload` y permite espera activa de las finalizaciones de GPU con `completion_spin_ns=4294967295`. Incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp, aunque ninguna tiene medicion registrada en esta version.

## Capacidades

- Generacion de texto mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling con esquema OpenAI (`tools` y `tool_calls`).
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Ventana de contexto de 128.000 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Muestreo (sampling): estado no determinado en la model card.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. La ventana de 128.000 tokens permite mantener historiales largos en una sola peticion.
- Automatizacion de agentes con tool calling: el soporte de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en bucles multi-turno de agentes, con la puerta `agent` disponible para validar el renderizado exacto del prompt y la reutilizacion de historial.
- Razonamiento con coste controlado: al estar el modo thinking desactivado por defecto, se puede usar el modelo en tareas de baja latencia y activarlo selectivamente para consultas que requieran cadena de pensamiento.
- Procesamiento de documentos largos: con 128.000 tokens de contexto y un limite de salida de 4.096 tokens, es adecuado para resumir, extraer o clasificar documentos extensos en una sola pasada, siempre que la respuesta quepa en el limite de salida.
- Pruebas de portabilidad en hardware AMD: el paquete sirve como referencia para validar el runtime Loom frente a llama.cpp en gfx1151 y gfx1201, usando las puertas de correccion incluidas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2B en Q4_K_M, cabe en la memoria unificada de una APU Strix Halo y en los 32 GB de la R9700, lo que permite servir inferencia local sin GPU de datacenter.
- Evaluacion comparativa de runtimes: las puertas `compare`, `logits` y `sampling` permiten contrastar token a token la salida del runtime Loom con la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de correccion no tienen ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo es de 2B en Q4_K_M, por lo que el peso de los pesos es reducido, pero la model card no publica cifras de memoria.
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer de NVIDIA ni para otras Radeon; el paquete esta orientado a los dos aceleradores AMD citados.
- Despliegue: `hrx-loom[hf]==0.2.0`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete.
- Parametros de servicio recomendados: `--pool_backing=fixed`, `--parameter_mode=preload` y `--device=amdgpu://?completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-loom (este paquete) | 2B | 128.000 tokens | other | GGUF + paquete Loom | Solo texto en Loom; tool calling y thinking opcional; hardware AMD gfx1151/gfx1201 |
| ggml-org/LFM3-Omni-2B-GGUF (modelo base) | 2B | no disponible | other | GGUF | Checkpoint original sin modificar; incluye imagen y audio en el modelo upstream |
| Otros modelos de 2B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, ya que no hay benchmarks publicados para este paquete ni datos del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no soporta entrada de imagen ni de audio, aunque el modelo original LFM3-Omni-2B si las tiene; en Loom solo esta disponible el texto.
- No hay mediciones de rendimiento ni de correccion registradas para este paquete; las puertas aparecen como "no re-medidas", por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- La licencia es "other", sin detalle de los terminos en la informacion proporcionada; es necesario consultar la licencia del modelo base antes de cualquier uso comercial.
- El limite de salida es de 4.096 tokens, muy inferior a la ventana de contexto de 128.000 tokens, lo que restringe tareas de generacion larga.
- La concurrencia esta limitada a 4 peticiones simultaneas.
- No se especifican los idiomas soportados.
- El estado del muestreo aparece como "no determinado" en la model card.
- El soporte de hardware esta restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documentan otras GPUs.
- El paquete no tiene descargas ni likes, y su creacion y actualizacion son del mismo dia (2026-11-19), lo que indica que no ha pasado por validacion de la comunidad.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-LFM3-Omni-2B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
