# loom-draft/mradermacher-Hemmingway-1-loom

## Resumen

Loom-draft/mradermacher-Hemmingway-1-loom no es un modelo de lenguaje en sentido estricto, sino un paquete de despliegue en formato `.loom` que empaqueta el checkpoint GGUF sin modificar `Hemmingway-1.Q4_K_M.gguf` del repositorio `mradermacher/Hemmingway-1-GGUF`. Lo publica el usuario `loom-draft` y esta pensado especificamente para ejecutarse con el runtime Loom sobre GPUs AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next` del ecosistema Loom, sin intervencion de un LLM en el proceso de generacion.

Su relevancia es fundamentalmente de infraestructura: demuestra que el runtime Loom puede servir un GGUF cuantizado en Q4_K_M sobre hardware AMD consumer y profesional, con decodificacion especulativa basada en MTP (multi-token prediction) y con ganancias medibles frente a llama.cpp ROCm en el mismo hardware. En Strix Halo, Loom alcanza 24,7 tok/s de decodificacion en prompt corto frente a 21,4 de llama.cpp (+15 %) y 532,1 tok/s de prefill en documento de 1k frente a 335,6 (+59 %).

No se dispone de informacion sobre el modelo base subyacente (parametros, contexto, arquitectura interna) mas alla de que es la variante cuantizada Q4_K_M distribuida por mradermacher. El repositorio tiene 0 GB y 0 descargas en el momento de la consulta, lo que sugiere un artefacto recien publicado y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base subyacente no documentado en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuracion de servido: `-c 65536` en llama.cpp; contexto de 32k medido en benchmarks) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El objeto de este repositorio no es un entrenamiento nuevo, sino un artefacto de despliegue. El checkpoint `Hemmingway-1.Q4_K_M.gguf` se incorpora sin modificar y se acompaña de programas `.loom` y una tarjeta `model.json` que describen como cargarlo y servirlo en el runtime Loom. La generacion se ha realizado con `loom-next`, el generador del ecosistema Loom, sin bucle de LLM.

El paquete declara soporte para decodificacion especulativa mediante MTP (multi-token prediction), con profundidad de borrador 3 en Loom (frente al valor por defecto de llama.cpp en `--spec-draft-n-max`). Incluye dos presets: `chat` para Strix Halo (gfx1151) y `chat-r9700` para Radeon AI PRO R9700 (gfx1201, 32 GB). El servido se realiza con `loom-serve` de `hrx-loom 0.2.0`, con opciones de pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). No se documentan datos de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional via API compatible con OpenAI (`/v1/chat/completions`).
- Modo thinking opcional, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificacion especulativa con MTP para acelerar la generacion token a token.
- Servido multi-stream: se han medido 4 peticiones paralelas con decodificacion agregada de 47,7 tok/s en Strix Halo.
- Procesamiento de prompts largos: prefill medido hasta documentos de 32k tokens (465,5 tok/s en Loom).
- Soporte de contexto de hasta 65.536 tokens en la configuracion de servido.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en APU Strix Halo: servir un asistente conversacional cuantizado en Q4_K_M sobre una Ryzen AI Max+ 395 usando `loom-serve`, aprovechando los 24,7 tok/s de decodificacion en prompt corto y los 532 tok/s de prefill para interacciones con documentos de hasta 1k tokens.
- Procesamiento de documentos largos en local: con contexto de 32k medido y 465,5 tok/s de prefill en 32k tokens, el modelo puede resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada sin salir del equipo.
- Servicio multi-usuario ligero: los 47,7 tok/s agregados con 4 streams permiten atender a un pequeno equipo de desarrollo con un unico nodo AMD, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Evaluacion de runtimes AMD: el paquete sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp ROCm con el mismo GGUF, mismo runner y mismos prompts, util para equipos que evaluan migraciones de stack.
- Prototipado de agentes conversacionales con thinking opcional: la posibilidad de activar o desactivar el modo thinking por peticion permite alternar entre respuestas rapidas y razonamiento extendido segun la tarea.
- Despliegue en estacion de trabajo con Radeon AI PRO R9700: el preset `chat-r9700` esta preparado para una GPU profesional de 32 GB, adecuado para entornos de desarrollo que requieran servir el modelo de forma persistente junto a otras cargas graficas.
- Integracion via API OpenAI-compatible: cualquier cliente que hable el protocolo `/v1/chat/completions` puede apuntar a `http://127.0.0.1:8080` y usar el modelo sin adaptadores adicionales.

## Benchmarks y rendimiento

Rendimiento medido en Strix Halo (gfx1151), Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF, mismo runner DevLab y mismos prompts. Mediana de 3 sesiones; medicion del 2026-11-25.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 21,4 | 24,7 | +15 % |
| Decode tok/s, contexto 2k | 18,7 | 20,7 | +11 % |
| Decode tok/s, contexto 32k | 18,9 | 21,9 | +16 % |
| Prefill tok/s, documento 1k | 335,6 | 532,1 | +59 % |
| Prefill tok/s, documento 2k | 343,5 | 536,3 | +56 % |
| Prefill tok/s, documento 8k | 343,1 | 542,9 | +58 % |
| Prefill tok/s, documento 16k | 325,4 | 514,7 | +58 % |
| Prefill tok/s, documento 32k | 292,7 | 465,5 | +59 % |
| 4 streams, decode agregado tok/s | 38,7 | 47,7 | +23 % |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han re-medido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPUs soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el preset `chat-r9700` esta disenado para una GPU de 32 GB, lo que da una cota superior practica para el despliegue en esa tarjeta.
- Cabe en GPU consumer AMD: si, en Strix Halo (APU con memoria unificada) y en Radeon AI PRO R9700.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), instalable con `pipx install`; servido con `loom-serve` y descarga con `loom-fetch`.
- Opciones de despliegue alternativas: el GGUF subyacente es compatible con llama.cpp (se ha comparado contra llama.cpp ROCm), aunque este paquete concreto esta orientado a Loom.
- Latencia y throughput: 24,7 tok/s de decodificacion en prompt corto y 532,1 tok/s de prefill en 1k en Strix Halo; 47,7 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/mradermacher-Hemmingway-1-loom | no disponible | 65.536 | 24,7 tok/s decode (Strix Halo), 532 tok/s prefill 1k | MIT | Hugging Face, 0 descargas |
| mradermacher/Hemmingway-1-GGUF (modelo base) | no disponible | no disponible | no disponible | MIT | Hugging Face (repositorio upstream) |
| llama.cpp ROCm `b1374` sirviendo el mismo GGUF | no disponible | 65.536 | 21,4 tok/s decode, 335,6 tok/s prefill 1k | MIT (llama.cpp) | GitHub |

La comparativa relevante no es de calidad de modelo sino de runtime: Loom supera a llama.cpp ROCm entre un 11 % y un 59 % en las metricas medidas sobre el mismo GGUF y hardware. No se dispone de comparacion con otros modelos de lenguaje equivalentes por no conocerse el modelo base.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es un paquete de despliegue sobre `mradermacher/Hemmingway-1-GGUF`. Cualquier limitacion del modelo base (sesgos, alucinacion, calidad) se hereda sin cambios.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de calidad del modelo subyacente.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento multilingue adecuado.
- El soporte esta restringido a dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con NVIDIA, Intel ni otras GPUs AMD.
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han re-medido; las cifras publicadas corresponden solo a Strix Halo.
- El paquete depende de `hrx-loom 0.2.0` y del ecosistema Loom; cambios de version del runtime pueden romper la compatibilidad.
- La licencia MIT se aplica al paquete de despliegue; conviene verificar la licencia del modelo base antes de uso comercial.
- El repositorio presenta 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- La generacion se ha realizado sin LLM en el bucle (`loom-next`), lo que reduce el riesgo de artefactos generados, pero no sustituye una revision manual del paquete.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/mradermacher-Hemmingway-1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Hemmingway-1-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab (benchmarks): https://github.com/loom-fun/loom-next/actions/runs/45552825440
