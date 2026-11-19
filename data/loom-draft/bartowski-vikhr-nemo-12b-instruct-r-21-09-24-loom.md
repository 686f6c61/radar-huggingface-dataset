# loom-draft/bartowski-Vikhr-Nemo-12B-Instruct-R-21-09-24-loom

## Resumen

`loom-draft/bartowski-Vikhr-Nemo-12B-Instruct-R-21-09-24-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Vikhr-Nemo-12B-Instruct-R-21-09-24-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos GGUF existentes a programas ejecutables por el runtime Loom sobre GPUs AMD, concretamente la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El modelo subyacente es Vikhr-Nemo-12B-Instruct-R, un modelo de 12 mil millones de parametros derivado de Mistral NeMo y ajustado por el equipo Vikhr para instrucciones y conversacion en ruso e ingles. La relevancia de este paquete es de infraestructura: permite servir ese modelo con una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD consumer y profesional, sin depender de CUDA ni de llama.cpp en tiempo de ejecucion.

La ficha del autor no incluye resultados de rendimiento ni de correccion para este paquete concreto: todas las puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. Cualquier cifra de rendimiento debe tratarse, por tanto, como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Vikhr-Nemo-12B-Instruct-R, derivado de Mistral NeMo); el paquete Loom genera kernels y programas para GPUs AMD |
| Parametros totales | 12 mil millones (12B, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 242.688 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en este paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Vikhr-Nemo esta orientado a ruso e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| API | Estilo OpenAI `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: parte del GGUF Q4_K_M de `bartowski/Vikhr-Nemo-12B-Instruct-R-21-09-24-GGUF` y genera, mediante `loom-next`, un conjunto de programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201. El resultado se sirve con `loom-serve`, que expone una API compatible con OpenAI y admite cuatro peticiones concurrentes. La generacion se realizo sin un LLM en el bucle, es decir, de forma determinista a partir del checkpoint y de la descripcion del preset.

El modelo subyacente, Vikhr-Nemo-12B-Instruct-R, es un transformer decoder-only de 12B derivado de Mistral NeMo y ajustado para instrucciones; la informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion: la model card marca la decodificacion especulativa como "not applicable" y no menciona atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del checkpoint Vikhr-Nemo-12B-Instruct-R.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Contexto de hasta 242.688 tokens por peticion, adecuado para documentos largos.
- Concurrencia de 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no aplicable segun la model card.
- Razonamiento o modo thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware AMD sin CUDA: el paquete esta pensado para servir un modelo de 12B en una Ryzen AI Max+ 395 o una Radeon AI PRO R9700, evitando la dependencia de GPUs NVIDIA en entornos de desarrollo y estaciones de trabajo AMD.
- Procesamiento de documentos largos: con 242.688 tokens de contexto por peticion, el modelo puede resumir o extraer informacion de contratos, informes o expedientes extensos en una sola pasada.
- Asistente conversacional local: la API compatible con OpenAI permite conectar clientes de chat existentes sin adaptar el codigo, con cuatro conversaciones concurrentes por instancia.
- Prototipado y evaluacion de modelos: util para equipos que quieran medir el comportamiento de Vikhr-Nemo-12B en cuantizacion Q4_K_M sobre GPUs AMD antes de comprometerse con un despliegue mayor.
- Generacion de texto en lote sobre estacion de trabajo: con contexto largo y salidas de hasta 4.096 tokens, encaja en tareas de redaccion, traduccion o reformateo ejecutadas en local.
- Entornos con requisitos de privacidad: al ejecutarse en hardware propio y no requerir servicios en la nube, permite procesar datos sensibles sin salir de la infraestructura del equipo.
- Base para comparativas de runtime: sirve como referencia para contrastar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, aunque las mediciones de este paquete aun no se han publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y todas las puertas de correccion figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 12B, y la GPU de referencia Radeon AI PRO R9700 dispone de 32 GB, mientras que Strix Halo emplea memoria unificada.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no disponible; el paquete solo declara soporte para las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el GGUF de origen puede servirse con llama.cpp, pero no se aportan datos al respecto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Vikhr-Nemo-12B-Instruct-R (este paquete Loom) | 12B | 242.688 tokens | Apache 2.0 | GGUF empaquetado en `.loom`, runtime Loom sobre AMD | Solo gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/Vikhr-Nemo-12B-Instruct-R-21-09-24-GGUF | 12B | no disponible | Apache 2.0 | GGUF | Checkpoint de origen, sin empaquetar; sirve con llama.cpp |
| Mistral NeMo 12B (modelo del que deriva la familia) | 12B | no disponible | no disponible | safetensors, GGUF | Base sobre la que se ajusta Vikhr; datos de rendimiento no incluidos en la informacion |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de validacion publicada: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured", por lo que no hay evidencia de que la salida coincida con la referencia de llama.cpp.
- Modelo base no verificado en esta ficha: las capacidades reales dependen del checkpoint Vikhr-Nemo-12B-Instruct-R, cuyos datos de entrenamiento, sesgos y calidad no se detallan en la informacion disponible.
- Idiomas: no se confirma el soporte de castellano; el modelo base esta orientado a ruso e ingles.
- Sin tool calling, sin modo thinking, sin vision y sin audio: la model card los marca como no aplicables, lo que limita su uso en pipelines de agentes.
- Contexto efectivo: aunque se anuncian 242.688 tokens, no hay mediciones que confirmen la calidad de la atencion en ventanas tan largas.
- Dependencia de hardware especifico: el paquete solo declara soporte para dos GPUs AMD concretas; no es portable a otras plataformas sin regenerar los programas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint de origen y del modelo base Vikhr-Nemo antes de distribuirlo en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Paquete con cero descargas y cero "likes": no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Vikhr-Nemo-12B-Instruct-R-21-09-24-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Vikhr-Nemo-12B-Instruct-R-21-09-24-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
