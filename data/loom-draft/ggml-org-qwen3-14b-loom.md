# loom-draft/ggml-org-Qwen3-14B-loom

## Resumen

`loom-draft/ggml-org-Qwen3-14B-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `Qwen3-14B-Q4_K_M.gguf` de `ggml-org/Qwen3-14B-GGUF`. Lo publica el usuario `loom-draft` y su proposito es ejecutar Qwen3-14B cuantizado en Q4_K_M sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con `loom-next` (el generador unicamente, sin LLM en el bucle) y se sirve con `loom-serve` del stack `hrx-loom`.

El modelo subyacente es Qwen3-14B, un transformer denso de 14 mil millones de parametros de la familia Qwen3 de Alibaba, con modo de razonamiento ("thinking") activado por defecto y soporte de tool calling. Esta ficha describe el paquete Loom y, en la medida en que la informacion disponible lo permite, las caracteristicas heredadas del checkpoint base; los datos propios de Qwen3-14B que no aparecen en la model card ni en la busqueda web se marcan como "no disponible".

La relevancia de este artefacto es de infraestructura: ofrece una via de servir un modelo abierto de 14B en hardware AMD de consumo y profesional (Strix Halo y R9700) mediante una API compatible con OpenAI, con contexto de 40.960 tokens por peticion y 4 peticiones concurrentes. La model card advierte de que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B); paquete de despliegue Loom con kernels generados para AMD (gfx1151 / gfx1201) |
| Parametros totales | 14B (modelo base Qwen3-14B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `Qwen3-14B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` con `model.json` |

Otros datos del paquete: salida maxima de 4.096 tokens (preset `max_tokens`), 4 peticiones concurrentes, API estilo OpenAI en `/v1/chat/completions`, tool calling estilo OpenAI (`tools` / `tool_calls`), razonamiento activado por defecto y desactivable con `chat_template_kwargs: {"enable_thinking": false}`. Decodificacion especulativa, entrada de imagen y entrada/salida de audio marcadas como no aplicables. Muestreo: no determinado.

## Arquitectura y entrenamiento

El paquete no modifica los pesos: contiene el GGUF Q4_K_M original de `ggml-org/Qwen3-14B-GGUF` junto con programas `.loom` generados por `loom-next` para ejecutar la inferencia sobre las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (R9700). El servidor `loom-serve` expone un endpoint compatible con OpenAI, con opciones de despliegue como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). La opcion `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; segun la model card, las mediciones de rendimiento usan ese ajuste.

Sobre el entrenamiento del modelo base Qwen3-14B (numero de tokens, composicion del dataset, RLHF/DPO) no hay informacion en la documentacion proporcionada; corresponde a la model card original de Qwen3, no incluida aqui. La unica innovacion tecnica documentada en este artefacto es el pipeline de generacion de kernels de `loom-next` y las puertas de validacion de `loom-benchmark` (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`), que en esta version figuran como "not yet re-measured" para ambas GPUs.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion mediante `chat_template_kwargs`.
- Tool calling / function calling estilo OpenAI, con soporte de bucles multi-turno de agentes (puerta `agent` y `agent_think_off` definidas en el benchmark, aunque sin medicion registrada).
- Servicio concurrente: 4 peticiones simultaneas con contexto de 40.960 tokens por peticion.
- Salida maxima de 4.096 tokens por respuesta (preset `max_tokens`).
- API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes y SDK existentes.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio y decodificacion especulativa: no aplicables en este paquete.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: servir Qwen3-14B Q4_K_M con `loom-serve` en una Radeon AI PRO R9700 (32 GB) para conversaciones multi-turno de hasta 40.960 tokens de contexto, sin depender de APIs en la nube.
- Desarrollo y pruebas en APU Strix Halo: usar la Ryzen AI Max+ 395 como banco de pruebas local para prompts largos (hasta 40.960 tokens) antes de desplegar en GPU dedicada, aprovechando la memoria unificada de la APU.
- Agentes con tool calling: integrar el endpoint OpenAI-compatible en un orquestador de agentes que envie `tools` y consuma `tool_calls`, con el modo thinking desactivado para reducir latencia en bucles de herramientas.
- Evaluacion de la paridad con llama.cpp: emplear las puertas `golden`, `compare` y `consistency` de `loom-benchmark` para verificar que la salida codiciosa y la concurrencia coinciden con la referencia de llama.cpp sobre el mismo GGUF.
- Sustitucion de backend en pipelines existentes: al exponer `/v1/chat/completions`, se puede apuntar una aplicacion ya escrita contra la API de OpenAI hacia `loom-serve` cambiando solo la URL base, para experimentar con hardware AMD.
- Prototipado de razonamiento controlado: alternar `enable_thinking` por peticion para comparar respuestas con y sin cadena de razonamiento en tareas de analisis, manteniendo el mismo checkpoint y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de correccion figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de throughput/latencia para este paquete.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 14B y la R9700 dispone de 32 GB, por lo que el ajuste es holgado en esa GPU. Para Strix Halo se depende de la memoria unificada de la APU.
- GPUs consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon consumer distintas de las dos arquitecturas objetivo; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo; opciones `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (mediciones pendientes de reejecucion segun la model card).
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; la referencia de correccion del propio autor es llama.cpp sobre el mismo GGUF, pero el artefacto esta pensado para `loom-serve`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-Qwen3-14B-loom` | 14B (Q4_K_M) | 40.960 tokens por peticion | Apache 2.0 | Paquete Loom (`loom-serve`) para gfx1151 / gfx1201 | Rendimiento y puertas de correccion sin re-medir |
| `ggml-org/Qwen3-14B-GGUF` (base) | 14B | no disponible en la informacion | Apache 2.0 | GGUF para llama.cpp y derivados | Checkpoint de origen, sin modificar |
| Qwen3-14B (modelo original) | 14B | no disponible en la informacion | Apache 2.0 | safetensors y conversiones | Model card original no consultada en esta busqueda |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de despliegue, no un modelo nuevo: cualquier limitacion de Qwen3-14B (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios; la model card no documenta sesgos ni evaluaciones de seguridad.
- Rendimiento no verificado: las tablas de rendimiento frente a llama.cpp y todas las puertas de correccion estan pendientes de re-medicion para este paquete; no hay evidencia registrada de paridad numerica.
- Compatibilidad de hardware restringida: los programas `.loom` se generan para gfx1151 y gfx1201; no se documenta su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Limites de servicio: 40.960 tokens de contexto por peticion, 4.096 tokens de salida maxima y 4 peticiones concurrentes; cargas mayores requieren escalar instancias.
- Muestreo no determinado: la model card marca la fila `sampling` como "not determined", lo que impide garantizar el comportamiento de temperatura, top_k y semilla.
- Espera activa de GPU: `completion_spin_ns=4294967295` consume CPU durante la inferencia; en despliegues con CPU compartida puede degradar otras cargas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen3-14B en su model card original antes de produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-19; no hay historial de mantenimiento.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-14B-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/Qwen3-14B-GGUF
- Repositorio del stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
