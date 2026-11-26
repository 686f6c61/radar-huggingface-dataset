# loom-draft/XeyonAI-Helcyon-GPT-4o-12b-Gemma-4-v1.0-loom

## Resumen

XeyonAI-Helcyon-GPT-4o-12b-Gemma-4-v1.0-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `XeyonAI/Helcyon-GPT-4o-12b-Gemma-4-v1.0-GGUF`, en cuantizacion Q4_K_M. No se trata de un modelo nuevo: es un artefacto de empaquetado orientado a la inferencia sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con la herramienta `loom-next` (el generador, sin LLM en el bucle) y se sirve con el runtime `loom-serve` del ecosistema Loom de ROCm.

El modelo subyacente, segun la nomenclatura del autor, es un fine-tune de 12b sobre base Gemma 4, con soporte de razonamiento opcional (thinking) y tool calling. La ficha del paquete declara una ventana de contexto de 131.072 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida definido por el preset. La licencia es MIT tanto en el paquete como en el modelo base declarado.

Su relevancia es acotada pero concreta: demuestra un flujo de despliegue alternativo a llama.cpp para hardware AMD de consumo y profesional, con una API compatible con OpenAI, y establece un conjunto de puertas de correccion (kernel_tests, golden, compare, agent, sampling, etc.) para validar la fidelidad numerica frente a la referencia. En el momento de la publicacion, ninguna de esas puertas tiene mediciones registradas para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de 12b; detalles de transformer no especificados en la informacion) |
| Parametros totales | 12b (segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Helcyon-GPT-4o-x1.0-Gemma4-12b-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de su identificacion como Gemma 4 de 12b. La model card del paquete no describe capas, atencion, tipo de mezcla de expertos ni innovaciones de atencion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias en el fine-tune de XeyonAI.

Lo que si se documenta es la capa de despliegue: el paquete contiene programas `.loom` generados por `loom-next` que implementan los kernels de inferencia para las arquitecturas gfx1151 y gfx1201, junto con un `model.json` que describe el preset. El runtime `loom-serve` expone una API compatible con OpenAI y aplica un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). La decodificacion especulativa no aplica en este paquete.

## Capacidades

- Generacion de texto conversacional mediante `/v1/chat/completions` con formato compatible con OpenAI.
- Tool calling con esquema OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` del banco de pruebas.
- Razonamiento o thinking opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Concurrencia de hasta 4 peticiones simultaneas, con la puerta `consistency` para verificar que la salida concurrente coincide con la secuencial.
- Contexto largo de 131.072 tokens por peticion, util para documentos extensos y conversaciones multi-turno.
- Salida limitada a 4.096 tokens por respuesta segun el preset `max_tokens`.
- Entrada de imagen no soportada por Loom, aunque el modelo upstream la tenga.
- Entrada y salida de audio: no determinado.
- Muestreo (temperature, top_k, seed): no determinado en la tabla de caracteristicas, aunque existe una puerta `sampling` para validarlo.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens por peticion se pueden cargar manuales tecnicos, expedientes o historiales completos y mantener conversaciones multi-turno sin truncar, sobre una unica GPU R9700 de 32 GB.
- Automatizacion de soporte con tool calling: el soporte de `tools` y `tool_calls` en formato OpenAI permite conectar el modelo a APIs internas (consulta de pedidos, estado de tickets) dentro de un bucle de agente multi-turno validado por la puerta `agent`.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Strix Halo y R9700, lo que permite servir el modelo en equipos con GPU integrada AMD sin depender de CUDA ni de llama.cpp.
- Razonamiento por pasos bajo demanda: activando `enable_thinking` solo en las peticiones que lo requieran se puede reservar el modo rapido para tareas simples y el modo razonado para calculo o analisis, reduciendo coste en el caso comun.
- Prototipado de agentes con API compatible con OpenAI: al exponer el mismo contrato que los proveedores comerciales, se puede apuntar un cliente existente a `http://127.0.0.1:8080/v1` y cambiar de backend sin reescribir el codigo.
- Evaluacion de fidelidad numerica frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para comparar token a token y distribuciones top-5 contra la referencia, lo que sirve para validar el runtime antes de llevarlo a produccion.
- Servicio local con concurrencia moderada: 4 peticiones simultaneas encajan en escenarios de equipo pequeno o demos internas donde no se justifica un cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene mediciones registradas para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 12b, y el paquete esta dirigido a una GPU de 32 GB (R9700) y a la memoria unificada del Strix Halo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs NVIDIA ni para Radeon de gama de consumo distintas de las listadas; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XeyonAI-Helcyon-GPT-4o-12b-Gemma-4-v1.0-loom | 12b | 131.072 tokens | MIT | Loom (GGUF Q4_K_M empaquetado) | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| XeyonAI/Helcyon-GPT-4o-12b-Gemma-4-v1.0-GGUF | 12b | no disponible | MIT (segun el paquete) | GGUF | Modelo base del paquete; ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas GGUF de 12b en llama.cpp | no disponible | no disponible | no disponible | GGUF | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- El paquete no incluye ningun resultado de benchmark ni de las puertas de correccion; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- La entrada de imagen no esta soportada por Loom aunque el modelo upstream la tenga, por lo que las capacidades multimodales del modelo base no son utilizables a traves de este paquete.
- El soporte esta restringido a las arquitecturas gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- El limite de salida es de 4.096 tokens por respuesta segun el preset, muy por debajo de la ventana de contexto de 131.072 tokens.
- La concurrencia maxima es de 4 peticiones, lo que limita el uso en produccion con trafico alto.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base.
- La licencia declarada es MIT, pero la informacion no aclara las condiciones del fine-tune de XeyonAI ni de la base Gemma 4 subyacente; conviene verificar la licencia del modelo base antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/XeyonAI-Helcyon-GPT-4o-12b-Gemma-4-v1.0-loom
- Modelo base GGUF: https://huggingface.co/XeyonAI/Helcyon-GPT-4o-12b-Gemma-4-v1.0-GGUF
- Repositorio del sistema ROCm/HRX: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
