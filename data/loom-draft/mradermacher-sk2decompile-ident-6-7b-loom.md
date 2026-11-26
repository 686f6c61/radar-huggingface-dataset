# loom-draft/mradermacher-sk2decompile-ident-6.7b-loom

## Resumen

`mradermacher-sk2decompile-ident-6.7b-loom` es un paquete de distribucion para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `mradermacher/sk2decompile-ident-6.7b-GGUF`, en su cuantizacion Q4_K_M, junto con un fichero `model.json` y los programas `.loom` necesarios para servirlo con `loom-serve`. El autor del paquete es `loom-draft`, y la generacion se ha realizado con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo subyacente, `sk2decompile-ident-6.7b`, es un ajuste fino de 6.700 millones de parametros orientado a tareas de descompilacion e identificacion de codigo, segun se deduce de su nombre y de su procedencia (familia de modelos publicados por mradermacher). La relevancia de este paquete concreto es de infraestructura: ofrece una ruta de despliegue optimizada para las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), con mediciones comparativas frente a llama.cpp ROCm.

El interes practico esta en el rendimiento medido: sobre Strix Halo, Loom alcanza 50,8 tok/s en decodificacion con prompt corto frente a 48,0 de llama.cpp (+6 %), y hasta 1.756,5 tok/s en prefill de documentos de 2k tokens frente a 1.237,1 (+42 %). El contexto nativo es de 16.384 tokens, lo que limita los escenarios de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 6.7B; presumiblemente transformer, no confirmado) |
| Parametros totales | 6,7 mil millones (segun denominacion del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (contexto nativo, segun la metodologia de benchmarks) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`sk2decompile-ident-6.7b.Q4_K_M.gguf`) dentro de paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador indica un modelo de 6.700 millones de parametros afinado para descompilacion e identificacion de codigo, pero no se detallan la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica relevante esta en la capa de despliegue, no en el modelo. El paquete Loom incluye un preset de memoria con `--pool_backing=fixed` (reserva anticipada del pool), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo). El paquete no incorpora cabecera MTP ni drafter, por lo que la decodificacion especulativa no esta disponible en esta configuracion.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tareas de descompilacion e identificacion de codigo, segun la especializacion declarada del modelo base.
- Servicio concurrente: el benchmark reporta agregados de 4 streams en paralelo (173,7 tok/s en Loom frente a 140,9 en llama.cpp).
- Procesamiento de prompts largos (prefill) con documentos de hasta 8k tokens medidos; el limite nativo de contexto es 16.384 tokens.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingue: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Descompilacion asistida de binarios: el modelo puede generar pseudocodigo o reconstrucciones legibles a partir de representaciones de bajo nivel, aprovechando su ajuste especifico para esta tarea.
- Identificacion de funciones y rutinas: util para anotar y clasificar simbolos en bases de codigo compiladas dentro de flujos de ingenieria inversa.
- Analisis de malware en laboratorio: apoyo a analistas para interpretar fragmentos de codigo ofuscado o compilado, con la advertencia de que requiere validacion humana.
- Asistencia a auditorias de seguridad: generacion de explicaciones sobre rutinas sospechosas en binarios, integrable en herramientas internas mediante la API OpenAI-compatible.
- Despliegue en estaciones AMD: el paquete esta optimizado para Strix Halo y Radeon AI PRO R9700, lo que permite servir el modelo en hardware AMD integrado sin depender de CUDA.
- Servicio local de bajo coste: con cuantizacion Q4_K_M y 6,7B de parametros, cabe en GPUs de consumo y ofrece 50,8 tok/s en decodificacion corta, adecuado para prototipos y uso individual.
- Procesamiento por lotes de documentos tecnicos: el prefill de 1.756,5 tok/s con documentos de 2k tokens permite clasificar o resumir lotes de codigo y documentacion en pipelines automatizados.

## Benchmarks y rendimiento

Rendimiento medido sobre AMD Strix Halo (gfx1151), Loom frente a llama.cpp ROCm b1374, misma GGUF y mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 48,0 | 50,8 | +6 % |
| Decode tok/s, contexto 2k | 33,1 | 36,8 | +11 % |
| Decode tok/s, contexto 32k | n/a | n/a | n/a |
| Prefill tok/s, documento 1k | 1.261,4 | 1.620,2 | +28 % |
| Prefill tok/s, documento 2k | 1.237,1 | 1.756,5 | +42 % |
| Prefill tok/s, documento 8k | 960,9 | 1.320,1 | +37 % |
| Prefill tok/s, documento 16k | n/a | n/a | n/a |
| Prefill tok/s, documento 32k | n/a | n/a | n/a |
| 4 streams, decode agregado tok/s | 140,9 | 173,7 | +23 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Las filas de 32k y 16k figuran como no aplicables porque superan el contexto nativo de 16.384 tokens. Las mediciones se realizaron el 2026-11-26 en un runner DevLab Dispatch X2-LA03-S03-D02 con Linux y hrx-loom 0.2.0. Para Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados no se han re-medido todavia. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion Q4_K_M de un modelo de 6,7B, la huella tipica ronda los 4-5 GB de pesos, aunque el paquete no publica la cifra exacta.
- GPU validadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La segunda aun no tiene mediciones re-medidas.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--pool_backing=fixed --parameter_mode=preload`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI dentro del paquete, aunque el GGUF original es compatible con llama.cpp.
- Latencia y throughput: 50,8 tok/s en decode corto y 1.756,5 tok/s en prefill de 2k sobre Strix Halo; 173,7 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| mradermacher-sk2decompile-ident-6.7b-loom | 6,7B | 16.384 | Paquete Loom (GGUF Q4_K_M) | MIT | Descompilacion, optimizado para AMD |
| mradermacher/sk2decompile-ident-6.7b-GGUF | 6,7B | no disponible | GGUF | MIT (segun base) | Mismo modelo, sin empaquetar |
| llama.cpp ROCm b1374 (runtime) | no aplica | configurable (`-c 65536`) | GGUF | MIT | Runtime generico, referencia de rendimiento |

La comparativa con modelos de la misma categoria funcional (descompilacion de codigo) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto nativo limitado a 16.384 tokens: los escenarios de 16k y 32k no son viables sin tecnicas adicionales de extension de contexto.
- Sin decodificacion especulativa: no hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, lo que limita el throughput en decodificacion.
- Rendimiento en Radeon AI PRO R9700 no verificado: las cifras publicadas solo cubren Strix Halo.
- Especializacion estrecha: el ajuste esta orientado a descompilacion e identificacion de codigo; su comportamiento en tareas generales de texto no esta documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad en generacion de codigo descompilado, por lo que la salida debe validarse antes de usarse en produccion.
- Sesgos e idiomas: no hay informacion sobre sesgos conocidos ni sobre cobertura linguistica; la model card no declara idiomas soportados.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original (`mradermacher/sk2decompile-ident-6.7b-GGUF`) y de los datos de entrenamiento, no detalladas aqui.
- Dependencia de herramienta: el despliegue esta atado a `hrx-loom` 0.2.0 y a la CLI `loom-fetch`/`loom-serve`; el commit exacto de hrx-system figura como desconocido y recuperado en la metodologia.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-sk2decompile-ident-6.7b-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/sk2decompile-ident-6.7b-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Run de referencia DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45881078245
