# loom-draft/mradermacher-Ficus-1.0-12B-i1-loom

## Resumen

`loom-draft/mradermacher-Ficus-1.0-12B-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Ficus-1.0-12B.i1-Q4_K_M.gguf`, publicado por el usuario `loom-draft`. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de empaquetado generado con la herramienta `loom-next` que adapta un GGUF preexistente de `mradermacher` al runtime Loom sobre GPUs AMD.

El modelo subyacente es Ficus-1.0-12B, un modelo de 12 mil millones de parámetros en su variante de cuantización i1 (imatrix) Q4_K_M, orientado a generación de texto con soporte de razonamiento opcional (*thinking mode*) y tool calling. El paquete está pensado específicamente para dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

Su relevancia es fundamentalmente de infraestructura: demuestra y documenta el rendimiento de Loom frente a llama.cpp ROCm sobre el mismo GGUF y las mismas prompts, con mejoras medidas de hasta el +59 % en prefill y +11 % en decodificación con contexto de 2k tokens en Strix Halo. Es un artefacto de nicho para quien despliegue modelos en hardware AMD con el stack Loom, no una release de modelo con benchmarks de calidad propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ficus-1.0-12B; arquitectura no especificada en la informacion proporcionada) |
| Parametros totales | 12B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65536 tokens (configurado en llama.cpp con `-c 65536`; medido hasta 32k) |
| Tipos de cuantizacion | Q4_K_M (variante i1, imatrix) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como paquete Loom con programas `.loom` y `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base Ficus-1.0-12B. La model card del paquete Loom no los documenta y la busqueda web no aporta resultados relevantes (los enlaces devueltos corresponden a productos homonimos sin relacion: la herramienta de grabacion de pantalla Loom, la marca de ropa Loom y el articulo de Wikipedia sobre el telar).

Lo que si esta documentado es la capa de despliegue: el paquete contiene programas `.loom` y una tarjeta `model.json` generados por `loom-next` (solo el generador, sin LLM en el bucle) a partir del GGUF original. El runtime Loom emplea espera activa en las completaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). No se menciona decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento / modo thinking opcional, desactivable por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`).
- Servicio multipeticion: soporta al menos 4 streams concurrentes con decodificacion agregada.
- Procesamiento de contextos largos: mediciones de prefill y decodificacion hasta 32k tokens.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue local en Strix Halo: servir un modelo de 12B cuantizado a Q4_K_M en un Ryzen AI Max+ 395 usando `loom-serve`, con 28,2 tok/s de decodificacion en prompt corto y 24,3 tok/s con 32k de contexto.
- Procesamiento de documentos largos: el prefill de 1051-1112 tok/s en documentos de 2k-8k tokens permite ingerir informes o articulos completos antes de generar respuestas en pocos segundos.
- Asistentes conversacionales con tool calling: la API compatible con OpenAI permite conectar el modelo a frameworks de agentes que envien `tools` y esperen `tool_calls` sin adaptadores personalizados.
- Servicio multiusuario ligero: con 4 streams concurrentes y 103,4 tok/s agregados en Strix Halo, puede atender a un pequeno equipo en local sin GPU dedicada de datacenter.
- Evaluacion comparativa de runtimes: util como banco de pruebas reproducible para medir Loom frente a llama.cpp ROCm sobre el mismo GGUF y las mismas prompts.
- Prototipado en Radeon AI PRO R9700: el preset `chat-r9700` permite desplegar el mismo modelo en una GPU de 32 GB, aunque las mediciones de rendimiento para esa GPU aun no se han reejecutado.
- Razonamiento con control de coste: desactivar el modo thinking por peticion reduce tokens generados en tareas simples de clasificacion o extraccion.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en Strix Halo (gfx1151), Loom frente a llama.cpp ROCm b1374, mismo GGUF y mismas prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 26,5 | 28,2 | +6 % |
| Decode tok/s, contexto 2k | 24,1 | 26,7 | +11 % |
| Decode tok/s, contexto 32k | 22,1 | 24,3 | +10 % |
| Prefill tok/s, documento 1k | 681,0 | 1068,2 | +57 % |
| Prefill tok/s, documento 2k | 713,2 | 1112,8 | +56 % |
| Prefill tok/s, documento 8k | 704,3 | 1051,3 | +49 % |
| Prefill tok/s, documento 16k | 642,7 | 987,1 | +54 % |
| Prefill tok/s, documento 32k | 536,7 | 852,1 | +59 % |
| 4 streams, decode agregado tok/s | 79,1 | 103,4 | +31 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Para Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han reejecutado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo es de 12B en Q4_K_M y se sirve en GPUs de 32 GB (R9700) y en el APU Strix Halo con memoria unificada.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para NVIDIA ni otras GPUs.
- GPU de consumo: no disponible; el paquete esta dirigido a hardware AMD especifico, no a RTX 4090 u otras consumer de NVIDIA.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para obtener el paquete y `loom-serve` para servirlo. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp dentro de este paquete (llama.cpp solo aparece como referencia comparativa).
- Throughput medido en Strix Halo: 28,2 tok/s decode en prompt corto, 24,3 tok/s con 32k de contexto, 852-1112 tok/s de prefill segun longitud, 103,4 tok/s agregados con 4 streams.
- Latencia en R9700: no disponible (sin reejecutar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ficus-1.0-12B-i1 (este paquete Loom) | 12B | 65536 | GGUF Q4_K_M en paquete Loom | MIT | Despliegue en AMD via Loom |
| mradermacher/Ficus-1.0-12B-i1-GGUF | 12B | no disponible | GGUF | no disponible | Checkpoint original cuantizado |
| llama.cpp ROCm b1374 (runtime) | n/a | 65536 (configurado) | n/a | no disponible | Runtime de referencia comparado |

No se dispone de datos de benchmarks de calidad para comparar con modelos alternativos de la misma categoria. La comparativa disponible es exclusivamente de runtime (Loom frente a llama.cpp) y se recoge en la seccion de benchmarks.

## Limitaciones y advertencias

- El paquete no incluye informacion sobre sesgos, alucinacion o calidad del modelo base; no se puede evaluar su fiabilidad sin consultar la documentacion de Ficus-1.0-12B.
- El rendimiento solo esta medido en Strix Halo; los resultados en Radeon AI PRO R9700 no se han reejecutado y no deben extrapolarse.
- El repo tiene 0,0 GB y 0 descargas: el paquete puede no contener los pesos en si, sino referencias para que `loom-fetch` los materialice; verificar el contenido antes de asumir que es autocontenido.
- Dependencia estricta del stack Loom (`hrx-loom==0.2.0`, `loom-next`, `hrx-system`); no es portable a otros runtimes sin conversion.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que no se puede acelerar por esa via.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base Ficus-1.0-12B no se detalla en la informacion proporcionada; conviene verificar la del checkpoint original antes de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas.
- Los margenes de rendimiento tienen una tolerancia de +-3 % (ruido del mismo runner); diferencias menores deben considerarse empate.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Ficus-1.0-12B-i1-loom
- GGUF base: https://huggingface.co/mradermacher/Ficus-1.0-12B-i1-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45881055992
