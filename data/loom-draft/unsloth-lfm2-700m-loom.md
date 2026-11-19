# loom-draft/unsloth-LFM2-700M-loom

## Resumen

LFM2-700M-loom es un paquete de despliegue para el checkpoint GGUF `unsloth/LFM2-700M-GGUF` (concretamente la cuantizacion `LFM2-700M-Q4_K_M.gguf`), empaquetado en el formato `.loom` que consume el runtime Loom de AMD. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del LFM2-700M original de Liquid AI, sin modificar, y lo que aporta este repositorio es la infraestructura necesaria para ejecutarlos sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador de programas Loom, sin intervencion de un LLM en el bucle. Incluye los programas `.loom` compilados, el tokenizador, la configuracion del modelo y una tarjeta `model.json` con las instrucciones de despliegue. El interes practico esta en que ofrece una via nativa para servir LFM2-700M en hardware AMD via ROCm, con una API compatible con OpenAI (`/v1/chat/completions`), contexto de 32.768 tokens por peticion y hasta 4 peticiones concurrentes.

El modelo subyacente, LFM2-700M, es un transformer pequeno de Liquid AI orientado a inferencia en el borde. Este empaquetado concreto tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia figura como "other", heredada del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no detalla la arquitectura interna del modelo base; se sirve el GGUF original sin modificar) |
| Parametros totales | 700M (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (`LFM2-700M-Q4_K_M.gguf`), empaquetado en formato `.loom` (programas `*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. Los pesos son el GGUF `LFM2-700M-Q4_K_M.gguf` publicado por Unsloth, empaquetado tal cual. La arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens vistos y si hubo RLHF, DPO u otras etapas de alineacion no se documentan en la informacion disponible; habria que consultar la model card del checkpoint base de Liquid AI para esos datos.

La innovacion tecnica del paquete esta en la capa de ejecucion: `loom-next` genera programas `.loom` especificos para las GPU objetivo a partir de `llm_config.json`, y `loom-serve` los ejecuta sobre ROCm con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete incluye ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, token a token y con top-5 log-probs. En la version publicada, ninguna de esas puertas tiene medicion registrada para Strix Halo ni para R9700.

## Capacidades

- Generacion de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos medios y conversaciones multi-turno largas.
- Hasta 4 peticiones concurrentes por instancia.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Tool calling: no disponible (marcado como "not applicable" en la tarjeta).
- Razonamiento o modo thinking: no disponible ("not applicable").
- Decodificacion especulativa: no disponible ("not applicable").
- Entrada de imagen o audio: no disponible ("not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined"; no hay evidencia registrada de que se comporte como se especifica.
- Capacidades multilingues: no disponibles en la informacion del paquete.

## Casos de uso

- Despliegue de un asistente conversacional local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"`, se descarga con `loom-fetch` y se sirve con `loom-serve`, exponiendo un endpoint compatible con OpenAI que cualquier cliente existente puede consumir sin cambios.
- Prototipado de aplicaciones de chat en hardware AMD sin GPU NVIDIA: al ejecutarse sobre ROCm en gfx1151 y gfx1201, permite desarrollar y validar integraciones de chat en equipos AMD de sobremesa o portatiles, evitando depender de CUDA.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades o clasificacion de contratos e informes que quepan en la ventana de contexto, con la salida limitada a 4.096 tokens.
- Servicio de inferencia para equipos pequenos con concurrencia moderada: las 4 peticiones concurrentes y el pool de memoria fijo permiten atender a un equipo de trabajo con una sola instancia, sin orquestacion adicional.
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion disenadas para contrastar la salida contra llama.cpp token a token, lo que lo hace util para validar la fidelidad numerica de la implementacion Loom frente a la referencia.
- Base para experimentos de cuantizacion en el borde: al ser un modelo de 700M en Q4_K_M, sirve como banco de pruebas de bajo coste para medir latencia y throughput en Radeon AI PRO R9700 antes de escalar a modelos mayores.
- Integracion en pipelines internos que ya hablan la API de OpenAI: el endpoint `/v1/chat/completions` permite sustituir un proveedor externo por una instancia local sin reescribir el codigo cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y que todas las puertas de correccion figuran sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un modelo de 700M en Q4_K_M ocupa del orden de 0,4-0,5 GB en pesos, pero la tarjeta no publica la huella real del pool de memoria de Loom.
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque la referencia de correccion se genera con llama.cpp sobre el mismo GGUF.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp estan pendientes de medicion para ambas GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-700M-loom (este paquete) | 700M | 32.768 | `.loom` (GGUF Q4_K_M) | other | Solo GPU AMD Strix Halo y R9700; sin benchmarks publicados |
| unsloth/LFM2-700M-GGUF | 700M | no disponible en esta ficha | GGUF | no disponible en esta ficha | Checkpoint base; ejecutable con llama.cpp y runtimes GGUF habituales |
| LFM2-700M (original de Liquid AI) | 700M | no disponible en esta ficha | safetensors y otros | no disponible en esta ficha | Modelo de referencia sin empaquetar |

La comparacion con alternativas de otros fabricantes (Qwen, Llama, Gemma en el rango de 0,5-1B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado del checkpoint de Unsloth. Cualquier limitacion del LFM2-700M original se hereda sin cambios.
- Sin evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, `decision`, entre otras) figuran como "not yet re-measured". No hay prueba publicada de que la salida coincida con llama.cpp en estas GPU.
- Sin datos de rendimiento: no se han publicado latencias ni throughput para ninguna de las dos plataformas objetivo.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte declarado para NVIDIA ni para otras GPU AMD.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa, sin vision ni audio. El estado del muestreo figura como "not determined".
- Licencia "other": no se detallan los terminos. Antes de un uso comercial hay que revisar la licencia del checkpoint base de Liquid AI y la del propio paquete.
- Idiomas no declarados: no se especifica que lenguas cubre el modelo, lo que impide garantizar calidad en castellano sin una evaluacion propia.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia. Es un artefacto recien publicado y sin validacion de la comunidad.
- Riesgo de alucinacion: inherente a un modelo de 700M; no se documentan tasas ni evaluaciones de factualidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2-700M-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/LFM2-700M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
