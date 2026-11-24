# loom-draft/bartowski-cognitivecomputations_Dolphin3.0-Mistral-24B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje original, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF`, en su cuantizacion Q4_K_M. El autor, `loom-draft`, distribuye los programas compilados y un `model.json` que permiten servir el modelo sobre GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

El modelo subyacente es Dolphin 3.0 Mistral 24B, un fine-tune de Mistral Small 24B publicado por Cognitive Computations. Sobre el, Bartowski genera las cuantizaciones GGUF; este repositorio solo redistribuye la variante Q4_K_M empaquetada para el runtime Loom. Por tanto, la ficha describe principalmente el artefacto de despliegue y las caracteristicas que el propio paquete declara: contexto de 32.768 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida.

La relevancia de este repositorio es acotada pero practica: ofrece una via de ejecucion del modelo en hardware AMD consumer y profesional (Strix Halo y R9700) mediante una API compatible con OpenAI, sin depender de CUDA. No obstante, la model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, etc.) no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de rendimiento ni de fidelidad frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Mistral Small 24B, transformer denso; no confirmado en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre del modelo base indica 24B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado como `.loom` (programas y `model.json`); pesos subyacentes en GGUF |

Otros datos declarados por la model card:

| Parametro | Valor |
|---|---|
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no aplicable (segun la tabla de features) |
| Reasoning / thinking | no aplicable |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no aplicable |
| Entrada/salida de audio | no aplicable |
| Muestreo | no determinado |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura del modelo base Dolphin 3.0 Mistral 24B mas alla de su nombre y de que se trata de un fine-tune de Mistral Small 24B publicado por Cognitive Computations. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo original. Cualquier afirmacion al respecto seria especulativa y no se incluye aqui.

Lo que si describe la model card es la arquitectura del paquete Loom: un conjunto de programas `.loom` generados por `loom-next` que implementan kernels para GPUs AMD (gfx1151 y gfx1201), acompanados de un `model.json` y su `model.json.lock` que fijan la fuente. El runtime `loom-serve` expone una API compatible con OpenAI y permite opciones como `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (cambia solo como se cargan los pesos en host). El paquete no modifica el checkpoint GGUF original: se limita a empaquetarlo para su ejecucion en el runtime Loom.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, suficiente para conversaciones multi-turno y documentos de longitud media.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de features del paquete.
- Reasoning / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): no determinado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat local en hardware AMD: el paquete permite levantar un endpoint compatible con OpenAI en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700, util para prototipos y entornos de desarrollo sin GPU NVIDIA. La API `/v1/chat/completions` facilita la integracion con clientes existentes.
- Asistente conversacional de contexto medio: con 32.768 tokens por peticion, el modelo puede mantener historiales de conversacion largos o procesar documentos de varias decenas de paginas en una sola llamada.
- Procesamiento por lotes de texto en local: la concurrencia de 4 peticiones permite atender varias solicitudes simultaneas en un unico equipo, adecuado para tareas de resumen o clasificacion por lotes en pequenos volumenes.
- Evaluacion comparativa de runtimes AMD: al incluir puertas de correccion (`golden`, `compare`, `consistency`) disenadas para contrastar con llama.cpp, el paquete sirve para validar la fidelidad de Loom frente a la referencia en el mismo GGUF.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: la GPU de 32 GB permite cargar el modelo Q4_K_M en memoria de video, lo que habilita inferencia local sin depender de servicios en la nube.
- Entorno de pruebas para desarrolladores de kernels: los programas `.loom` y las puertas `kernel_tests` estan pensados para verificar kernels generados contra implementaciones de referencia, lo que resulta util para quien trabaje en el ecosistema ROCm/Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

| Puerta de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| `kernel_tests` | no medida | no medida |
| `golden` | no medida | no medida |
| `compare` | no medida | no medida |
| `vision` | no medida | no medida |
| `consistency` | no medida | no medida |
| `spec` | no medida | no medida |
| `agent` | no medida | no medida |
| `agent_think_off` | no medida | no medida |
| `sampling` | no medida | no medida |
| `logits` | no medida | no medida |
| `decision` | no medida | no medida |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 24B, y la Radeon AI PRO R9700 dispone de 32 GB, lo que sugiere que el modelo cabe en esa GPU; la model card no confirma cifras de VRAM.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), las dos plataformas para las que se ha generado el paquete.
- Compatibilidad con GPU consumer: no disponible. La informacion solo menciona las dos plataformas AMD anteriores; no se indica soporte para otras GPUs consumer.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para obtener el paquete y `loom-serve` para servirlo. La model card menciona llama.cpp unicamente como referencia de correccion (`golden`), no como runtime alternativo documentado en este repositorio.
- Latencia y throughput: no disponibles. Las mediciones de rendimiento frente a llama.cpp no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de este paquete ni de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa. La unica referencia disponible es el propio checkpoint GGUF de Bartowski (`bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF`), del que este repositorio es un empaquetado para Loom.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Dolphin 3.0 Mistral 24B Q4_K_M para Loom) | 24B (segun nombre) | 32.768 tokens por peticion | MIT | `.loom` + GGUF | Hugging Face, 0 descargas |
| `bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF` | 24B (segun nombre) | no disponible | MIT | GGUF | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de evidencia de rendimiento: la model card declara que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete. No hay datos que confirmen latencia, throughput ni fidelidad frente a llama.cpp.
- Paquete de despliegue, no modelo original: este repositorio no contiene pesos nuevos ni un fine-tune adicional; redistribuye el GGUF Q4_K_M de Bartowski empaquetado para el runtime Loom. Cualquier limitacion del modelo Dolphin 3.0 Mistral 24B subyacente aplica igualmente.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es una caracteristica general de los modelos de lenguaje y no se han publicado evaluaciones especificas para este paquete.
- Limitaciones de contexto e idioma: el contexto maximo declarado es de 32.768 tokens por peticion y los idiomas soportados no estan disponibles. El uso multilingue no esta documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial segun los terminos habituales de dicha licencia; conviene verificar la licencia del modelo base y del checkpoint GGUF original antes de un despliegue en produccion.
- Funcionalidades no disponibles: tool calling, reasoning, decodificacion especulativa, vision y audio figuran como "no aplicable" en este paquete, lo que limita los escenarios de agentes y multimodalidad.
- Muestreo no determinado: la tabla de features marca el muestreo como "?" (no determinado), por lo que el comportamiento de temperatura, top_k y seed no esta verificado.
- Hardware acotado: el paquete esta generado para gfx1151 y gfx1201; no se documenta soporte para otras GPUs, lo que restringe su portabilidad.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y actualizacion reciente (24 de noviembre de 2026), lo que sugiere un artefacto en fase temprana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-cognitivecomputations_Dolphin3.0-Mistral-24B-loom
- Modelo base (GGUF de Bartowski): https://huggingface.co/bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a Loom (plataforma de grabacion de video) y Loom (marca de ropa), sin relacion con este repositorio.
