# loom-draft/bartowski-Qwen2.5-Math-7B-Instruct-loom

## Resumen

El repositorio `loom-draft/bartowski-Qwen2.5-Math-7B-Instruct-loom` no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `Qwen2.5-Math-7B-Instruct-Q4_K_M.gguf` de bartowski, que a su vez deriva del modelo Qwen2.5-Math-7B-Instruct de Alibaba Qwen. El autor del paquete es el usuario `loom-draft`, y la generacion se ha realizado con la herramienta `loom-next` (sin LLM en el bucle), orientada a ejecutar inferencia sobre GPUs AMD.

El interes del artefacto es de infraestructura, no de modelado: empaqueta los pesos cuantizados en Q4_K_M para su ejecucion nativa en el runtime Loom sobre dos aceleradores AMD concretos, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), exponiendo una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`. El modelo subyacente es un transformer denso de 7B parametros especializado en matematicas, con licencia Apache 2.0.

La relevancia es acotada: el paquete tiene 0 descargas y 0 likes, se publico el 19 de noviembre de 2026 y no incluye mediciones de rendimiento ni resultados de las puertas de correccion (todas aparecen como "not yet re-measured"). Debe tratarse, por tanto, como un artefacto experimental de despliegue para hardware AMD, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-Math-7B-Instruct); paquete Loom con programas `.loom` generados |
| Parametros totales | 7B (heredados del modelo base; no se detalla desglose en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por peticion (limite del preset Loom); contexto nativo del modelo base no disponible en esta ficha |
| Tipos de cuantizacion | Q4_K_M (GGUF), unico checkpoint empaquetado |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como `weights.loom` + `program/*.loom`, con `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reutiliza el transformer denso de Qwen2.5-Math-7B-Instruct, un modelo de 7B parametros afinado para razonamiento matematico y con modo instruct. La capa anadida por Loom consiste en programas de kernel generados (`.loom`) y un fichero `weights.loom` derivado del GGUF Q4_K_M, junto con la configuracion (`llm_config.json`) a partir de la cual se generaron dichos programas. La generacion la realiza `loom-next`, descrito en la model card como "the generator alone, no LLM in the loop".

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o fases de razonamiento por refuerzo en el modelo base. Tampoco se documentan innovaciones tecnicas del paquete mas alla del propio runtime Loom: la tabla de caracteristicas marca como no aplicables la decodificacion especulativa, el modo de razonamiento/thinking, el esfuerzo de razonamiento, la entrada de imagen y la entrada/salida de audio.

## Capacidades

- Generacion de texto y razonamiento matematico, heredados del modelo base Qwen2.5-Math-7B-Instruct en su variante instruct.
- Tool calling en estilo OpenAI: soporta el campo `tools` y devuelve `tool_calls` en la respuesta.
- API compatible con OpenAI mediante `loom-serve` en el endpoint `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (valor del preset `max_tokens`).
- Contexto de 4.096 tokens por peticion.
- Modo de razonamiento/thinking: no aplicable segun la model card.
- Vision, audio y decodificacion especulativa: no aplicables segun la model card.
- Muestreo (temperature, top_k, seed): marcado como "not determined" en la tabla de caracteristicas.

## Casos de uso

- Despliegue de inferencia matematica sobre Strix Halo: el paquete permite servir Qwen2.5-Math-7B-Instruct en cuantizacion Q4_K_M directamente sobre el Ryzen AI Max+ 395 mediante `loom-fetch` y `loom-serve`, sin necesidad de convertir los pesos a otro formato.
- Despliegue sobre Radeon AI PRO R9700: con 32 GB de VRAM, el checkpoint Q4_K_M cabe holgadamente y permite servir el modelo a traves del mismo endpoint compatible con OpenAI.
- Sustitucion de llama.cpp en entornos AMD: el paquete esta pensado para ejecutar el mismo GGUF con kernels Loom, y las puertas de correccion `golden` y `compare` estan disenadas para verificar la equivalencia token a token frente a la referencia de llama.cpp.
- Integracion en pipelines con clientes OpenAI: al exponer `/v1/chat/completions`, cualquier SDK compatible con OpenAI puede apuntar a `http://127.0.0.1:8080` y consumir el modelo sin cambios de codigo.
- Prototipado de agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir bucles multi-turno de llamadas a herramientas, si bien la puerta de correccion `agent` aun no tiene mediciones registradas.
- Evaluacion de la madurez del runtime Loom: el artefacto sirve como banco de pruebas para medir kernels generados, consistencia bajo concurrencia y comportamiento del muestreo frente a llama.cpp en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 7B, y la Radeon AI PRO R9700 dispone de 32 GB, por lo que el modelo cabe con margen amplio en esa tarjeta.
- GPUs soportadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no disponible; la model card no menciona soporte para GPUs de consumo.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalable con `pipx`), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han registrado mediciones para este paquete.
- Concurrencia maxima documentada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-Qwen2.5-Math-7B-Instruct-loom | 7B | 4.096 tokens por peticion (preset Loom) | Loom (`.loom` + `weights.loom`) | Apache 2.0 | Paquete de despliegue para Strix Halo y R9700; sin mediciones publicadas |
| bartowski/Qwen2.5-Math-7B-Instruct-GGUF | 7B | no disponible en esta ficha | GGUF | Apache 2.0 | Checkpoint de origen del que deriva este paquete; ejecutable con llama.cpp |
| Qwen2.5-Math-7B-Instruct (original) | 7B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base de Alibaba Qwen; misma arquitectura y capacidades matematicas |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de mediciones: las secciones de rendimiento y todas las puertas de correccion figuran como "not yet re-measured", por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Estado experimental: 0 descargas y 0 likes; el artefacto procede de un usuario de borrador (`loom-draft`) y no debe tratarse como una distribucion estable.
- Contexto limitado a 4.096 tokens por peticion en el preset, muy por debajo del contexto nativo habitual del modelo base.
- Concurrencia maxima de 4 peticiones, lo que restringe su uso en escenarios de alta carga.
- Muestreo no determinado: la tabla de caracteristicas marca la fila `sampling` como "not determined", lo que impide garantizar el comportamiento de temperature, top_k y seed.
- Sin modo de razonamiento explicito ni decodificacion especulativa, a diferencia de otras variantes del ecosistema.
- Idiomas soportados no declarados en la model card.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este paquete; deben evaluarse sobre el modelo base Qwen2.5-Math-7B-Instruct.
- Licencia Apache 2.0, que permite uso comercial, pero el paquete hereda las condiciones del checkpoint GGUF de origen.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y de la version `hrx-loom[hf]==0.2.0`; no se documenta compatibilidad con otras GPUs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-Math-7B-Instruct-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Qwen2.5-Math-7B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
