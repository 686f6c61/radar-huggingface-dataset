# loom-draft/Hcompany-Holo4-27B-loom

## Resumen

Holo4-27B es un modelo de lenguaje y vision de 27.000 millones de parametros desarrollado por Hcompany. El checkpoint original se distribuye en formato GGUF, y el repositorio que nos ocupa (`loom-draft/Hcompany-Holo4-27B-loom`) es un paquete de despliegue generado por terceros para el ecosistema Loom de AMD, no un modelo nuevo: empaqueta el checkpoint sin modificar `q4_k_m.gguf` de `Hcompany/Holo4-27B-GGUF` junto con programas `.loom` y una tarjeta `model.json` para ejecutarlo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201).

El interes practico del repositorio esta en el runtime: Loom es una pila de inferencia para ROCm que compite directamente con llama.cpp sobre el mismo hardware y el mismo fichero GGUF. La model card publica mediciones comparativas en Strix Halo que muestran mejoras de prefill de en torno al 52-56 % frente a llama.cpp y de decode de en torno al 6-7 %, con un 26 % mas de throughput agregado en cuatro streams concurrentes.

Al tratarse de una cuantizacion Q4_K_M de un modelo de 27B, el checkpoint ocupa del orden de 16-17 GB, lo que lo situa en el rango de memoria unificada de Strix Halo y de la VRAM de 32 GB de la R9700. La licencia declarada es MIT tanto en el paquete como en el checkpoint base. No se dispone de informacion sobre la arquitectura interna, el dataset de entrenamiento ni los idiomas soportados mas alla de lo que declara el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal image-text-to-text, deducido del pipeline; detalles no publicados) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (argumento `-c 65536` usado en la comparativa con llama.cpp); contexto nativo del modelo no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom solo incluye esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`q4_k_m.gguf`), empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Holo4-27B: la model card del paquete Loom no describe capas, atencion, tipo de mezcla de expertos ni estrategia de entrenamiento. El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo acepta imagenes y texto como entrada y genera texto, y los tags incluyen `vision`. El nombre y el tamano (27B) son los unicos datos estructurales disponibles.

Respecto al entrenamiento, no hay datos publicados en la informacion proporcionada sobre numero de tokens, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas del modelo original. La model card menciona que el GGUF no incluye cabecera MTP (multi-token prediction) y que no existe un drafter publicado para este modelo concreto, lo que descarta la decodificacion especulativa en este paquete. El valor anadido del repositorio no esta en el modelo sino en el runtime Loom: generado con `loom-next` (el generador, sin LLM en el bucle), ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`), carga de pesos con `--parameter_mode=preload`, pool de memoria fijo (`--pool_backing=fixed`) y espera activa de completaciones en GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline `image-text-to-text`, con soporte de vision declarado en los tags.
- Modo thinking: activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling: soporte de `tools` y `tool_calls` con formato estilo OpenAI.
- Servidor compatible con la API de OpenAI en `/v1/chat/completions`.
- Capacidades multilingues: no disponible.
- Capacidades de codigo, matematicas o agentes multi-paso: no disponibles en la informacion proporcionada.
- No dispone de decodificacion especulativa en este paquete (sin cabecera MTP en el GGUF y sin drafter publicado).

## Casos de uso

- Inferencia local en Strix Halo: servir el modelo con `loom-serve` sobre un Ryzen AI Max+ 395 aprovechando la memoria unificada, con un throughput de prefill de 472-551 tok/s que hace viable procesar documentos largos en local.
- Procesamiento de documentos con imagenes: al ser un modelo image-text-to-text, puede recibir capturas, escaneos o diagramas junto con instrucciones de texto para extraccion o descripcion de contenido.
- Asistentes con razonamiento explicito: el modo thinking activado por defecto permite obtener cadenas de razonamiento en tareas que lo requieran, y desactivarlo reduce latencia en consultas simples.
- Integracion de herramientas via API: el soporte de `tool_calls` estilo OpenAI permite conectar el modelo a funciones externas (busqueda, calculo, acceso a bases de datos) desde clientes que ya hablan el formato OpenAI.
- Despliegue en Radeon AI PRO R9700: el paquete incluye un preset `chat-r9700` para servir el modelo en una GPU de 32 GB, adecuado para estaciones de trabajo con una sola tarjeta.
- Servicio multi-usuario ligero: con cuatro streams concurrentes el rendimiento agregado de decode alcanza 49,3 tok/s en Strix Halo, suficiente para un pequeno equipo interno.
- Evaluacion comparativa de runtimes: util como banco de pruebas para medir Loom frente a llama.cpp sobre el mismo GGUF y el mismo hardware.

## Benchmarks y rendimiento

Mediciones publicadas en la model card para Strix Halo (gfx1151), comparando Loom 0.2.0 con llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 12,7 | 13,6 | +7 % |
| Decode tok/s, contexto 2k | 12,6 | 13,4 | +6 % |
| Decode tok/s, contexto 32k | 11,1 | 11,8 | +6 % |
| Prefill tok/s, documento 1k | 348,7 | 544,4 | +56 % |
| Prefill tok/s, documento 2k | 358,5 | 546,1 | +52 % |
| Prefill tok/s, documento 8k | 359,8 | 551,0 | +53 % |
| Prefill tok/s, documento 16k | 342,2 | 522,7 | +53 % |
| Prefill tok/s, documento 32k | 308,8 | 472,6 | +53 % |
| 4 streams, decode agregado tok/s | 39,0 | 49,3 | +26 % |
| Decodificacion especulativa | n/a | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "aun no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un Q4_K_M de 27B ocupa del orden de 16-17 GB de pesos, mas overhead de contexto KV; encaja en los 32 GB de la R9700 y en la memoria unificada configurable de Strix Halo.
- GPU soportadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA.
- Consumer GPU: no se indica compatibilidad con GPU de consumo; el paquete esta orientado a hardware AMD con ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el preset (`chat` o `chat-r9700`) y `loom-serve` para servir la API OpenAI. Opciones recomendadas: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: en Strix Halo, 13,6 tok/s de decode en prompt corto y 544 tok/s de prefill en documento de 1k; con cuatro streams, 49,3 tok/s agregados. Mediciones realizadas el 2026-11-25 en runners AMD DevLab Dispatch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Holo4-27B (este paquete, Loom) | 27B | 65.536 (configurado) | MIT | GGUF Q4_K_M + Loom | Runtime Loom, solo AMD ROCm |
| Holo4-27B (llama.cpp) | 27B | 65.536 (configurado) | MIT | GGUF Q4_K_M | Mismo checkpoint, runtime de referencia; prefill ~53 % inferior en Strix Halo |
| Alternativas de 27B comparables | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

No se dispone de informacion sobre otros modelos de la misma categoria para establecer una comparativa de calidad o rendimiento mas alla de la comparacion de runtimes incluida en la model card.

## Limitaciones y advertencias

- El repositorio es un paquete de despliegue de terceros, no un modelo entrenado por el autor del paquete; los meritos del modelo corresponden a Hcompany y los del runtime a Loom.
- Solo se distribuye la cuantizacion Q4_K_M, con la perdida de calidad asociada frente a pesos de mayor precision.
- No hay decodificacion especulativa disponible: sin cabecera MTP en el GGUF y sin drafter publicado para este modelo exacto.
- Las mediciones de rendimiento solo cubren Strix Halo; para R9700 no se han vuelto a medir. Los runners varian entre sesiones, segun la propia model card.
- El paquete esta ligado a ROCm y a hardware AMD concretos; no se declara soporte para otras GPU.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base.
- La licencia MIT permite uso comercial, pero debe verificarse en el repositorio del modelo base (`Hcompany/Holo4-27B-GGUF`) cualquier condicion adicional.
- El contexto de 65.536 tokens es el configurado en la comparativa, no necesariamente el contexto nativo maximo del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/Hcompany-Holo4-27B-loom
- Modelo base: https://huggingface.co/Hcompany/Holo4-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch run 45537472212): https://github.com/loom-fun/loom-next/actions/runs/45537472212
