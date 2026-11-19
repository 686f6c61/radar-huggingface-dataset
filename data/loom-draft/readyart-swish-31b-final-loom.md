# loom-draft/ReadyArt-Swish-31B-Final-loom

## Resumen

ReadyArt-Swish-31B-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Swish-31B-Final-GGUF`, concretamente del fichero `Swish-31B-Final-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado orientado al runtime Loom, pensado para ejecutar el modelo base sobre GPUs AMD concretas, la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo subyacente se identifica por su nombre como un modelo de 31B parametros en cuantizacion Q4_K_M, con soporte declarado de tool calling, modo de razonamiento opcional (desactivado por defecto) y, segun la model card, capacidades de entrada de imagen y audio en el modelo original que Loom no implementa. La ventana de contexto configurada en el preset es de 53.248 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB (lo que sugiere que los pesos no estan alojados en el propio repo, sino que se resuelven via `loom-fetch` desde el modelo base) y la propia model card indica que las mediciones de rendimiento y las puertas de correccion "no se han vuelto a medir todavia" para ambas GPUs. Es, por tanto, un artefacto de despliegue experimental para el ecosistema AMD/Loom, no una propuesta de modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de 31B; la arquitectura exacta no se detalla en la informacion proporcionada) |
| Parametros totales | 31B (segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por peticion (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ReadyArt/Swish-31B-Final-GGUF`: la model card del paquete Loom no describe capas, atencion, tipo de transformer ni si emplea mezcla de expertos. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. El unico dato verificable es el tamano nominal de 31B parametros y la cuantizacion Q4_K_M del checkpoint empaquetado.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que fija los ficheros fuente con verificacion sha256 mediante `loom-fetch`. El runtime `loom-serve` expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling estilo OpenAI, modo de razonamiento activable por `chat_template_kwargs`, y opciones de despliegue como `--pool_backing=fixed` (reserva de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). No se declara decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Bucles de agente multi-turno con tool calling (la model card incluye puertas de correccion `agent` y `agent_think_off`, aunque sin mediciones registradas).
- Concurrencia de 4 peticiones simultaneas.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene segun la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene segun la model card.
- Multilingue: no disponible (no se especifican idiomas).
- Razonamiento por esfuerzo (reasoning effort): no aplicable en este preset.

## Casos de uso

- Despliegue local en hardware AMD Strix Halo: un desarrollador con una APU Ryzen AI Max+ 395 puede servir el modelo con `loom-fetch` y `loom-serve` para tener un asistente conversacional local sin depender de GPUs NVIDIA ni de servicios en la nube.
- Inferencia en estaciones con Radeon AI PRO R9700: el preset `chat-r9700` permite ejecutar el mismo checkpoint Q4_K_M en una GPU profesional AMD de 32 GB, util para entornos de desarrollo que ya operan con ROCm.
- Prototipado de agentes con tool calling: la API compatible con OpenAI y el soporte de `tools`/`tool_calls` permiten conectar el modelo a frameworks de agentes existentes sin adaptadores propietarios, limitado a 4 peticiones concurrentes.
- Evaluacion comparativa frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para verificar que la salida codiciosa y las distribuciones top-5 coinciden con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad del runtime Loom.
- Asistencia con razonamiento bajo demanda: activando `enable_thinking` se puede usar el modo de razonamiento para tareas que requieran cadenas de pensamiento, manteniendolo desactivado en el resto de peticiones para reducir latencia.
- Procesamiento de documentos largos: con 53.248 tokens de contexto por peticion se pueden resumir o consultar documentos extensos, aunque el limite de 4.096 tokens de salida restringe la longitud de las respuestas generadas.
- Pruebas de integracion en CI: los comandos de inicio y la peticion `curl` documentados permiten levantar el servicio en un job de integracion y comprobar que el endpoint responde con el esquema esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambas indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia registrada de fidelidad numerica ni de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 31B; el preset esta disenado para una GPU de 32 GB (Radeon AI PRO R9700) y para la APU Strix Halo con memoria unificada.
- GPUs soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta soporte para GPUs consumer NVIDIA ni AMD de gama domestica; el empaquetado esta generado para las arquitecturas AMD citadas.
- Opciones de despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de correccion.
- Flags de despliegue documentados: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (las mediciones no se han vuelto a realizar para este paquete).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ReadyArt-Swish-31B-Final-loom | 31B (nominal) | 53.248 tokens por peticion | Q4_K_M | Apache 2.0 | `.loom` + GGUF de origen | Paquete de despliegue para AMD Strix Halo y R9700; sin benchmarks ni puertas de correccion medidas |
| ReadyArt/Swish-31B-Final-GGUF (modelo base) | 31B (nominal) | no disponible | GGUF, incluye Q4_K_M | no disponible en la informacion proporcionada | GGUF | Checkpoint original sin empaquetar; es la referencia contra la que se valida el paquete Loom |
| llama.cpp sobre el mismo GGUF | 31B (nominal) | no disponible | Q4_K_M | no disponible | GGUF | Runtime de referencia usado por las puertas `golden`, `compare` y `logits`; no es un modelo distinto, sino otra via de ejecucion |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este paquete con alternativas de la misma categoria; la comparativa se limita a aspectos de empaquetado, licencia y formato.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier evaluacion de calidad debe hacerse sobre el modelo base `ReadyArt/Swish-31B-Final-GGUF`, del que no se documentan datos de entrenamiento ni evaluaciones.
- Ausencia total de evidencia de correccion: las once puertas de la model card figuran como "not yet re-measured" para ambas GPUs, por lo que no hay verificacion registrada de que la salida coincida con la referencia de llama.cpp.
- Ausencia de mediciones de rendimiento: no hay latencia ni throughput publicados para este paquete.
- Repositorio sin traccion: 0 descargas y 0 likes, con fecha de creacion y actualizacion el mismo dia (2026-11-19) y un intervalo de un segundo entre ambas, lo que sugiere un artefacto recien generado y no validado por la comunidad.
- Tamano del repo de 0,0 GB: los pesos no parecen estar alojados en el repositorio, sino resueltos mediante `loom-fetch` contra el modelo base; la disponibilidad del paquete depende de que ese origen siga accesible.
- Capacidades recortadas respecto al modelo original: la model card indica que el modelo subyacente tiene entrada de imagen y audio, pero Loom no las soporta; no deben asumirse en produccion.
- Limites operativos del preset: 53.248 tokens de contexto por peticion, 4 peticiones concurrentes y 4.096 tokens maximos de salida.
- Dependencia de hardware AMD concreto: el paquete esta generado para gfx1151 y gfx1201; no se declara compatibilidad con otras GPUs.
- Idiomas no especificados: no se puede garantizar un comportamiento multilingue concreto.
- Sesgos y alucinaciones: no disponibles; no se documenta ninguna evaluacion al respecto.
- Licencia Apache 2.0 declarada en el paquete, lo que en principio permite uso comercial, pero la licencia y condiciones del modelo base no se detallan en la informacion proporcionada y conviene verificarlas antes de un despliegue en produccion.
- Los resultados de busqueda web obtenidos no estan relacionados con este modelo (corresponden a la herramienta de grabacion de pantalla Loom y a una marca de ropa homonima), por lo que no aportan informacion adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Swish-31B-Final-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Swish-31B-Final-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
