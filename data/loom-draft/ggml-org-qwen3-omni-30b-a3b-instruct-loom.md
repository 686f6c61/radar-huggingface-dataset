# loom-draft/ggml-org-Qwen3-Omni-30B-A3B-Instruct-loom

## Resumen

`loom-draft/ggml-org-Qwen3-Omni-30B-A3B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen3-Omni-30B-A3B-Instruct-Q4_K_M.gguf` (procedente de `ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle. El autor del paquete es `loom-draft` y el modelo subyacente es Qwen3-Omni, un modelo omni-modal de Alibaba Qwen con arquitectura MoE de 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token.

El objetivo del paquete es permitir servir el modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante `loom-serve`, que expone una API compatible con OpenAI en `/v1/chat/completions`. Es relevante para quien quiera ejecutar un modelo MoE multimodal de 30B en hardware AMD de consumo o profesional sin depender del stack CUDA, aunque con limitaciones importantes: Loom no implementa la entrada de imagen ni la entrada/salida de audio del modelo original, de modo que en la práctica se comporta como un modelo de texto.

La ficha del repositorio no incluye métricas de rendimiento ni resultados de las puertas de corrección: todas las filas de rendimiento y de `gates.sh` aparecen como "not yet re-measured". El paquete tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Qwen3-Omni); empaquetado como programas `.loom` para el runtime AMD Loom |
| Parametros totales | 30B (30.000 millones, segun el nombre del checkpoint) |
| Parametros activos | ~3B (A3B, segun el nombre del checkpoint) |
| Longitud de contexto | 65.536 tokens por peticion (limite impuesto por el preset de Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras en el paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en `.loom` + `model.json` / `model.json.lock` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Thinking / razonamiento | Activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Entrada de imagen | No soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | No soportada por Loom (el modelo upstream si la tiene) |
| Decodificacion especulativa | No aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Omni-30B-A3B-Instruct, un transformer con mezcla de expertos (MoE) de 30B parametros totales y unos 3B activos por token, disenado por el equipo Qwen para procesar texto, imagen y audio. El paquete Loom no modifica los pesos: toma el GGUF Q4_K_M publicado por `ggml-org` y genera, mediante `loom-next`, kernels y programas especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con una tarjeta `model.json` que describe el preset de servicio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. Tampoco se documentan innovaciones de decodificacion en el paquete: la decodificacion especulativa figura explicitamente como "not applicable". El paquete si incorpora un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero ninguna de ellas tiene medicion registrada para estas dos GPUs.

## Capacidades

- Generacion de texto y razonamiento multi-turno con modo "thinking" activado por defecto y desactivable por peticion.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados.
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto de la plantilla de chat (segun la puerta `agent` del paquete).
- Contexto de 65.536 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultaneas con salida determinista respecto a la ejecucion aislada (segun la puerta `consistency`).
- API compatible con OpenAI en `/v1/chat/completions`, lo que permite reutilizar clientes y SDK existentes.
- Capacidades multimodales del modelo original (imagen, audio): no disponibles en este paquete, ya que Loom no las implementa.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: `loom-serve` expone un endpoint compatible con OpenAI que se puede conectar a cualquier cliente existente, con 65.536 tokens de contexto para conversaciones largas y hasta 4 peticiones concurrentes.
- Agente de automatizacion con herramientas: el soporte nativo de `tools`/`tool_calls` y la puerta `agent` permiten construir bucles de razonamiento con llamadas a funciones (consultas a bases de datos, APIs internas) sobre hardware AMD sin CUDA.
- Procesamiento de documentos extensos: el contexto de 65k tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o documentacion tecnica en una sola peticion.
- Generacion de codigo asistida: el modelo puede integrarse en un servidor local para autocompletado y explicacion de codigo, con el modo thinking desactivado para reducir latencia en tareas simples.
- Evaluacion y prototipado de modelos MoE en hardware AMD: util para equipos que quieran medir el comportamiento de un MoE de 30B/A3B en Strix Halo o R9700 antes de comprometerse con infraestructura mayor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen de la maquina, lo que encaja en sectores regulados que no pueden enviar texto a APIs externas.
- Laboratorio de comparacion de runtimes: las puertas de correccion del paquete estan disenadas para comparar token a token contra llama.cpp sobre el mismo GGUF, lo que facilita validar la fidelidad numerica de Loom frente a la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No se incluyen cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 30B, y el paquete esta pensado para la R9700 con 32 GB y para el APU Strix Halo con memoria unificada.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- GPU de consumo: el paquete no menciona tarjetas de consumo; el hardware objetivo son un APU de gama alta y una GPU profesional de 32 GB.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete. Opciones recomendadas en la model card: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo).
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Runtime objetivo |
|---|---|---|---|---|---|---|
| Este paquete (Qwen3-Omni-30B-A3B-Instruct Q4_K_M en Loom) | 30B | ~3B | 65.536 | No en Loom (si en upstream) | MIT | AMD Loom (gfx1151, gfx1201) |
| ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF | 30B | ~3B | no disponible en la informacion | Si (imagen y audio) | no disponible en la informacion | llama.cpp y derivados |
| Qwen3-30B-A3B (texto) | 30B | ~3B | no disponible en la informacion | No | no disponible en la informacion | Multiples runtimes |

La comparacion se limita al modelo base y a la familia Qwen3, ya que la informacion proporcionada no incluye datos de otros modelos comparables ni cifras de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El paquete no implementa la entrada de imagen ni la entrada/salida de audio del modelo original, pese a tratarse de un modelo omni-modal; en la practica solo ofrece texto.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured": no hay evidencia registrada de fidelidad numerica ni de velocidad frente a llama.cpp en este hardware.
- El contexto esta limitado a 65.536 tokens por peticion y la salida a 4.096 tokens, por debajo de lo que el modelo upstream podria admitir.
- La concurrencia maxima es de 4 peticiones simultaneas, insuficiente para cargas de produccion con muchos usuarios.
- El soporte de hardware se restringe a dos plataformas AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPUs.
- La licencia del paquete es MIT, pero la del modelo base no se detalla en la informacion proporcionada; conviene verificar los terminos del checkpoint Qwen3-Omni antes de un uso comercial.
- No hay informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo; se desconoce si el modo thinking por defecto incrementa la latencia en produccion.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-11-26, por lo que no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La busqueda web realizada no devolvio informacion sobre este modelo: los resultados corresponden a productos no relacionados (Loom.com, la marca de ropa Loom y el articulo de Wikipedia sobre telares), por lo que no aportan datos tecnicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-Omni-30B-A3B-Instruct-loom
- Checkpoint GGUF base: https://huggingface.co/ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
