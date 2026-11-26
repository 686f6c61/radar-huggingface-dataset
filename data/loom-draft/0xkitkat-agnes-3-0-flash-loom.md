# loom-draft/0xKitkat-Agnes-3.0-Flash-loom

## Resumen

Agnes-3.0-Flash-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `0xKitkat/Agnes-3.0-Flash-GGUF`, concretamente la cuantizacion `Agnes-3.0-Flash-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con `loom-next`, el generador de la herramienta, sin intervencion de un LLM en el proceso.

El modelo subyacente es multimodal de tipo image-text-to-text con soporte de razonamiento (thinking) y tool calling, segun la tarjeta del autor. La relevancia de esta publicacion no esta en los pesos, que son los del checkpoint base, sino en el empaquetado y las mediciones de rendimiento frente a llama.cpp en hardware AMD: el paquete incluye presets de memoria, comandos de servicio y comparativas medidas en los runners de AMD DevLab.

No se dispone de informacion sobre arquitectura interna, numero de parametros, longitud de contexto nativa ni composicion del dataset de entrenamiento en la informacion proporcionada. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que el paquete no incluye los pesos en si, sino la definicion de despliegue que referencia al GGUF remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de rendimiento cubren hasta 32k tokens de contexto) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. La tarjeta del paquete no describe el transformer, el esquema de atencion ni el tipo de mezcla de expertos, y el repositorio solo contiene los artefactos de despliegue Loom. La unica referencia tecnica es el checkpoint base `0xKitkat/Agnes-3.0-Flash-GGUF`, del que se sirve la cuantizacion Q4_K_M sin modificaciones.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La tarjeta menciona que el modelo soporta razonamiento opcional (`enable_thinking`, activado por defecto) y que no incluye cabeza MTP (multi-token prediction), lo que descarta la decodificacion especulativa nativa con este GGUF. El paquete Loom anade presets de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que son innovaciones del runtime, no del modelo.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto segun el pipeline declarado.
- Razonamiento o modo thinking: activado por defecto y desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling con el esquema OpenAI de `tools` y `tool_calls`.
- Servicio multi-stream: la comparativa mide 4 peticiones paralelas con decodificacion agregada.
- Procesamiento de contextos largos: las pruebas de prefill llegan a documentos de 32k tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite servir el modelo con `loom-serve` en una Strix Halo o una R9700 sin depender de CUDA, usando la API compatible con OpenAI para integrarlo en aplicaciones existentes.
- Procesamiento de documentos largos: con un prefill medido de 443.5 tok/s en documentos de 1k tokens y 389.4 tok/s en 32k, resulta adecuado para resumir o extraer informacion de contratos, informes o expedientes que superan los 8k tokens.
- Analisis de imagenes con texto: al ser image-text-to-text, puede emplearse para describir capturas, extraer datos de formularios escaneados o responder preguntas sobre diagramas en un flujo de trabajo interno.
- Agentes con herramientas: el soporte de `tools` y `tool_calls` en formato OpenAI permite conectarlo a frameworks de agentes para consultar bases de datos, ejecutar busquedas o invocar APIs internas en varios pasos.
- Razonamiento asistido con thinking mode: para tareas de analisis que requieren cadena de razonamiento (clasificacion de incidencias, diagnostico de errores) se puede dejar el modo thinking activo y desactivarlo en consultas simples para reducir latencia.
- Despliegue en hardware de gama profesional AMD: la Radeon AI PRO R9700 con 32 GB permite cargar el Q4_K_M en una sola GPU, lo que habilita entornos de desarrollo y pruebas sin acceso a A100 o H100.
- Servicio multiusuario ligero: con 4 streams agregados a 41.2 tok/s en Strix Halo, es viable para un equipo pequeno que comparte una unica estacion con el modelo servido localmente.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151) el 2026-11-26, comparando Loom 0.2.0 con llama.cpp ROCm `llamacpp-rocm/b1374` sobre el mismo GGUF y los mismos prompts (mediana de 3 sesiones):

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 10.6 | 11.4 | +8 % |
| Decode tok/s, contexto 2k | 10.5 | 11.2 | +7 % |
| Decode tok/s, contexto 32k | 9.4 | 9.9 | +5 % |
| Prefill tok/s, documento 1k | 289.7 | 443.5 | +53 % |
| Prefill tok/s, documento 2k | 294.3 | 445.4 | +51 % |
| Prefill tok/s, documento 8k | 295.1 | 449.8 | +52 % |
| Prefill tok/s, documento 16k | 281.6 | 428.4 | +52 % |
| Prefill tok/s, documento 32k | 255.6 | 389.4 | +52 % |
| 4 streams, decode agregado tok/s | 32.4 | 41.2 | +27 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y la R9700 dispone de 32 GB, suficiente segun el autor para cargarlo en una sola GPU.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni otras GPU NVIDIA; el paquete esta orientado al stack ROCm/AMD.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de servicio de este paquete (llama.cpp solo aparece como referencia de comparacion).
- Throughput medido en Strix Halo: 11.4 tok/s de decode en prompt corto, 9.9 tok/s a 32k de contexto, 443.5 tok/s de prefill a 1k y 41.2 tok/s agregados con 4 streams.
- Latencia: no se publican cifras de latencia por peticion; solo tasas de tokens por segundo.
- Ajustes de servicio recomendados: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (mismo tamano o misma tarea) en la documentacion proporcionada. La unica comparacion disponible es de motor de inferencia, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo GGUF en Strix Halo, con las cifras de la tabla anterior.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash (Q4_K_M) via Loom | no disponible | no disponible (probado hasta 32k) | 11.4 tok/s decode, 443.5 tok/s prefill (Strix Halo) | MIT | Hugging Face (paquete Loom) |
| Agnes-3.0-Flash (Q4_K_M) via llama.cpp ROCm | no disponible | 65536 (`-c 65536`) | 10.6 tok/s decode, 289.7 tok/s prefill (Strix Halo) | MIT | Hugging Face (GGUF) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos del modelo base; al ser un fine-tune del que no se documenta el dataset, no se puede evaluar su comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks de calidad.
- El paquete solo documenta soporte para dos GPU AMD concretas (gfx1151 y gfx1201); no hay garantia de funcionamiento en otras arquitecturas.
- Los resultados de rendimiento en la Radeon AI PRO R9700 no se han vuelto a medir; las cifras de Strix Halo no son extrapolables.
- La decodificacion especulativa no esta disponible: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto.
- El repositorio tiene 0.0 GB, por lo que el paquete no contiene los pesos; el despliegue depende de la disponibilidad del checkpoint base `0xKitkat/Agnes-3.0-Flash-GGUF`.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU de forma continua mientras hay trabajo en GPU; en entornos con CPU limitada puede degradar el rendimiento global.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base antes de un despliegue en produccion.
- No se especifican los idiomas soportados; no se puede asumir un rendimiento correcto en castellano sin evaluacion previa.
- El modelo esta marcado como borrador (`loom-draft`) y las mediciones son de un unico dia (2026-11-26) en runners de AMD DevLab que varian entre sesiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/0xKitkat-Agnes-3.0-Flash-loom
- Checkpoint base GGUF: https://huggingface.co/0xKitkat/Agnes-3.0-Flash-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia en DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45875470098
