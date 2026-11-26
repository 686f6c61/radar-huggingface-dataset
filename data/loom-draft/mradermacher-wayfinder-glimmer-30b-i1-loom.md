# loom-draft/mradermacher-wayfinder-glimmer-30b-i1-loom

## Resumen

`loom-draft/mradermacher-wayfinder-glimmer-30b-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/wayfinder-glimmer-30b-i1-GGUF`, en concreto la cuantizacion `wayfinder-glimmer-30b.i1-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce un GGUF existente a programas ejecutables por el runtime Loom (`hrx-loom`), orientado a GPUs AMD concretas.

El paquete lo publica la organizacion `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Los tags del repositorio apuntan a dos destinos de hardware explicitos: el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un modelo de 30B en la familia «wayfinder-glimmer», con capacidades declaradas de razonamiento siempre activo, tool calling e entrada de imagen en el modelo original.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de repo de 0.0 GB y ninguna medicion de rendimiento o correccion registrada para este paquete en concreto. Es, por tanto, un artefacto de empaquetado reciente cuyo interes practico depende de que se disponga del hardware AMD indicado y del runtime Loom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete Loom no la declara; el modelo base es un GGUF de 30B de la familia wayfinder-glimmer) |
| Parametros totales | 30B (segun el nombre del checkpoint; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` + `weights.loom` + `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo subyacente (tipo de transformer, uso de MoE, atencion lineal u otras innovaciones) ni sobre su proceso de entrenamiento, numero de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO. La model card del paquete Loom no describe el modelo, solo el empaquetado.

Lo que si documenta la tarjeta es la naturaleza del artefacto: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF original, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`). El paquete declara caracteristicas de inferencia como razonamiento siempre activo, tool calling al estilo OpenAI, contexto de 131.072 tokens y 4 peticiones concurrentes, con un maximo de 4.096 tokens de salida por preset. La decodificacion especulativa figura como no aplicable en este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» siempre activo (no configurable, segun la tabla de caracteristicas).
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial (segun los gates `agent` y `agent_think_off` definidos, aunque sin mediciones registradas).
- API compatible con OpenAI en `/v1/chat/completions`.
- Contexto largo de hasta 131.072 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas.
- Entrada de imagen: el modelo original la soporta, pero Loom no la implementa en este paquete (marcado como no soportado).
- Audio: no aplicable.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en Strix Halo: usar el paquete con `loom-serve` sobre un Ryzen AI Max+ 395 para servir un modelo de 30B en Q4_K_M con API OpenAI, sin depender de CUDA ni de llama.cpp.
- Despliegue en Radeon AI PRO R9700: mismo flujo sobre la GPU de 32 GB, aprovechando que la cuantizacion Q4_K_M de un 30B encaja en esa VRAM con margen para el contexto.
- Agentes con tool calling: integrar el endpoint en un orquestador que necesite llamadas a funciones (consulta de APIs, ejecucion de comandos) con historial multi-turno y contexto largo.
- Procesamiento de documentos extensos: los 131.072 tokens de contexto permiten analizar contratos, informes o bases de codigo completas en una sola peticion, siempre que el preset de 4.096 tokens de salida sea suficiente.
- Evaluacion comparativa frente a llama.cpp: el paquete define gates de correccion (`golden`, `compare`, `logits`, `agent`, etc.) que permiten contrastar token a token la salida de Loom contra la referencia de llama.cpp sobre el mismo GGUF.
- Banco de pruebas de portabilidad AMD: util para equipos que quieran medir el rendimiento de un 30B Q4_K_M en gfx1151 y gfx1201 antes de comprometerse con un stack de inferencia.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes, encaja en herramientas internas, asistentes de documentacion o prototipos, no en cargas de produccion de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican literalmente que «the results for this package are not yet re-measured». Lo mismo ocurre con todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`): figuran como «not yet re-measured» en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Un modelo de 30B en Q4_K_M ocupa del orden de 17-19 GB solo en pesos, a lo que hay que sumar cache KV para hasta 131.072 tokens de contexto; el paquete no publica cifras de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras AMD fuera de las dos indicadas.
- Opciones de despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. El paquete se genera a partir de un GGUF, por lo que el checkpoint original es usable con llama.cpp, pero este artefacto concreto esta pensado para Loom.
- Flags relevantes de `loom-serve`: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones GPU), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones del paquete aun no se han realizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/wayfinder-glimmer-30b-i1-GGUF (Q4_K_M) | 30B | no disponible | GGUF | MIT (segun este paquete) | Checkpoint de origen; usable con llama.cpp |
| Este paquete Loom | 30B | 131.072 tokens | `.loom` + GGUF empaquetado | MIT | Solo GPUs AMD gfx1151 y gfx1201; sin mediciones publicadas |
| Alternativas de 30B en Q4_K_M | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa de rendimiento con modelos alternativos de la misma categoria. Cualquier comparacion numerica seria especulativa.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo: no aporta mejoras de calidad respecto al GGUF original; solo cambia el runtime de ejecucion.
- Cero mediciones registradas: rendimiento y correccion figuran como «not yet re-measured» en las dos GPUs objetivo, por lo que no hay evidencia publicada de que el paquete funcione correctamente.
- Sin adopcion: 0 descargas y 0 likes; repo de 0.0 GB, lo que sugiere que los pesos no estan alojados en este repositorio y se resuelven via `loom-fetch`.
- Dependencia de hardware muy especifico: solo se documentan gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no hay soporte declarado para otras GPUs.
- Sin vision: el modelo original acepta imagenes, pero Loom no lo soporta en este paquete.
- Razonamiento siempre activo y sin control de esfuerzo: no se puede desactivar el modo thinking ni ajustar su intensidad, lo que incrementa tokens generados y latencia.
- Limite de salida de 4.096 tokens por preset: insuficiente para tareas que requieran respuestas muy largas o generacion de codigo extensa en una sola llamada.
- Concurrencia baja: 4 peticiones simultaneas; no apto para produccion con trafico alto sin escalado horizontal.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion y sesgos: no disponible; no se han publicado evaluaciones de sesgo ni de fidelidad para este modelo.
- Licencia MIT declarada en el paquete, pero conviene verificar la licencia del checkpoint de origen antes de uso comercial, ya que el paquete no la detalla de forma independiente.
- Fecha de creacion futura (2026-11-26) en los metadatos, lo que puede indicar un artefacto de prueba o un error de sellado temporal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-wayfinder-glimmer-30b-i1-loom
- Checkpoint de origen: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
