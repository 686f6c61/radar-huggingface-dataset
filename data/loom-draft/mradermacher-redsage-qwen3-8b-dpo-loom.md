# loom-draft/mradermacher-RedSage-Qwen3-8B-DPO-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado por `loom-next` a partir del checkpoint GGUF `RedSage-Qwen3-8B-DPO.Q4_K_M.gguf` de mradermacher, que a su vez es una cuantizacion del modelo RedSage-Qwen3-8B-DPO. El paquete esta publicado por la organizacion `loom-draft` y esta orientado a la ejecucion del modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Qwen3 de 8B de parametros afinado con DPO (RedSage), aunque la model card de este repositorio no detalla ni el dataset de entrenamiento ni la composicion del afinado: solo documenta el empaquetado y el rendimiento del runtime Loom. La relevancia de esta ficha esta, por tanto, en el stack de inferencia: Loom es un runtime propietario de AMD (repositorio `ROCm/hrx-system`) que compite con llama.cpp en hardware ROCm, y este paquete ofrece mediciones reproducibles frente a `llamacpp-rocm/b1374`.

Las cifras publicadas muestran una ventaja modesta en decodificacion (44,2 tok/s frente a 42,4 tok/s con prompt corto, +4 %) y una ventaja notable en prefill (hasta +48 % con documentos de 32k tokens). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y no implementa modo de razonamiento explicito ni decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 8B (segun el nombre del modelo base) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion de llama.cpp de referencia (`-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico incluido en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`RedSage-Qwen3-8B-DPO.Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3 en su variante de 8B parametros, un transformer denso. Sobre esa base, mradermacher publica una version afinada con DPO (RedSage-Qwen3-8B-DPO) y su cuantizacion GGUF en Q4_K_M. La informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni del corpus de preferencias usado en la fase DPO, por lo que estos datos deben consultarse en la model card del modelo base.

La innovacion tecnica de este repositorio no esta en el modelo sino en el runtime: Loom compila el grafo de inferencia para las arquitecturas AMD gfx1151 y gfx1201 y sirve el GGUF sin modificarlo. El paquete activa espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), reserva fija del pool de memoria (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). No hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, de modo que la decodificacion especulativa queda desactivada en ambas pruebas comparativas.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), apto para integracion con frameworks de agentes.
- Razonamiento y generacion de codigo heredados del modelo Qwen3 base (no verificados con benchmarks en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento o thinking: no aplicable segun la model card.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Sin soporte de vision ni audio documentado.
- Sin decodificacion especulativa en este paquete.

## Casos de uso

- Servicio de chat en estaciones de trabajo AMD: desplegar el paquete con `loom-fetch` y `loom-serve` sobre una Radeon AI PRO R9700 o un APU Strix Halo para exponer un endpoint compatible con OpenAI en `127.0.0.1:8080`, sin necesidad de recompilar el GGUF.
- Procesamiento de documentos largos: el rendimiento de prefill medido (970,3 tok/s con 32k tokens en Strix Halo) hace viable resumir o extraer informacion de contratos, informes o expedientes de decenas de miles de tokens en una sola pasada.
- Atencion al cliente automatizada: con 65.536 tokens de contexto configurado y soporte multi-turno, el modelo puede mantener historiales de conversacion extensos con recuperacion de contexto (RAG) inyectada en el prompt.
- Agentes con herramientas: el soporte de `tool_calls` permite construir asistentes que consulten APIs, bases de datos o sistemas internos, orquestados desde un backend compatible con OpenAI.
- Evaluacion comparativa de runtimes en hardware AMD: el paquete incluye una metodologia reproducible (DevLab Dispatch, mediana de 3 sesiones) que sirve para validar Loom frente a llama.cpp en un equipo concreto antes de adoptar uno u otro.
- Despliegue en hardware de consumo profesional: al tratarse de una cuantizacion Q4_K_M de un modelo de 8B, cabe en GPUs de 32 GB y en APUs con memoria unificada, lo que permite prototipar en local sin depender de la nube.
- Servicio multi-stream: con 4 peticiones concurrentes el paquete alcanza 168,4 tok/s agregados en Strix Halo, adecuado para pequenos equipos o entornos de desarrollo compartidos.

## Benchmarks y rendimiento

Mediciones publicadas en la model card para Strix Halo (gfx1151), comparando Loom 0.2.0 con llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismos prompts, mediana de 3 sesiones, medidas el 2026-11-26:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | 42,4 | 44,2 | +4 % |
| Decodificacion tok/s, contexto 2k | no medido | no medido | no disponible |
| Decodificacion tok/s, contexto 32k | 22,5 | 22,9 | +2 % |
| Prefill tok/s, documento 1k | 1218,5 | 1717,1 | +41 % |
| Prefill tok/s, documento 2k | 1196,9 | 1687,4 | +41 % |
| Prefill tok/s, documento 8k | 1050,0 | 1510,1 | +44 % |
| Prefill tok/s, documento 16k | 875,8 | 1248,7 | +43 % |
| Prefill tok/s, documento 32k | 654,5 | 970,3 | +48 % |
| 4 streams, decodificacion agregada tok/s | 134,9 | 168,4 | +25 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Para la Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica que los resultados de este paquete aun no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las unicas cifras son de rendimiento del runtime.

## Requisitos de hardware

- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: el GGUF en Q4_K_M de un modelo de 8B ocupa del orden de 5 GB de pesos; el pool de memoria se reserva de forma fija con `--pool_backing=fixed`, por lo que la huella total depende del contexto configurado (hasta 65.536 tokens en la configuracion de referencia). No se publica una cifra exacta de VRAM.
- Cabe en GPU de consumo profesional de 32 GB y en APUs con memoria unificada; no se documenta su ejecucion en GPUs NVIDIA ni en ROCm generico fuera de Loom.
- Despliegue: exclusivamente mediante el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete, aunque el GGUF original puede usarse con llama.cpp por separado.
- Latencia y throughput medidos en Strix Halo: 44,2 tok/s en decodificacion con prompt corto, 22,9 tok/s tras 32k tokens de contexto, 1717,1 tok/s de prefill con 1k tokens y 168,4 tok/s agregados con 4 streams.
- Para R9700 no hay mediciones publicadas de este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| RedSage-Qwen3-8B-DPO (este paquete, Q4_K_M) | 8B | 65.536 configurado | GGUF empaquetado para Loom (AMD gfx1151/gfx1201) | MIT | Paquete especifico de hardware, con tool calling y sin modo thinking |
| RedSage-Qwen3-8B-DPO-GGUF (modelo base) | 8B | no disponible | GGUF para llama.cpp y otros runtimes | MIT | Checkpoint original sin empaquetar; portable a mas hardware |
| Qwen3-8B (modelo de partida) | 8B | no disponible | safetensors y derivados GGUF | no disponible en esta informacion | Base sin el afinado DPO de RedSage |

La comparacion con otras familias de 8B (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) no se incluye porque la informacion proporcionada no aporta datos de rendimiento ni de licencia de esos modelos para contrastar; se indica como no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo RedSage; deben asumirse los riesgos habituales de un modelo de 8B afinado con DPO.
- El paquete esta atado a dos arquitecturas AMD concretas (gfx1151 y gfx1201) y al runtime Loom 0.2.0; no es portable a NVIDIA ni a otras GPUs AMD sin regeneracion del paquete.
- Las mediciones de rendimiento son de un unico entorno (DevLab Dispatch, runner X2-LA03-S03-D01) y los propios autores advierten que los runners difieren entre sesiones; los margenes dentro de +-3 % se consideran empate.
- Los resultados para la Radeon AI PRO R9700 no se han vuelto a medir, por lo que no hay garantia de rendimiento en esa GPU.
- No hay decodificacion especulativa disponible (sin cabecera MTP ni drafter), lo que limita la mejora de latencia en decodificacion.
- El contexto maximo practico depende de la memoria reservada con `--pool_backing=fixed`; configurar 65.536 tokens en hardware con menos memoria puede provocar fallos de asignacion.
- No se documentan los idiomas soportados; el comportamiento en castellano no esta verificado.
- La licencia MIT del paquete no exime de comprobar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-RedSage-Qwen3-8B-DPO-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/RedSage-Qwen3-8B-DPO-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45881073428
