# loom-draft/mradermacher-Athena-27B-i1-loom

## Resumen

Athena-27B-i1 en formato Loom es un paquete de despliegue (`.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `mradermacher/Athena-27B-i1-GGUF`, en su cuantizacion `Athena-27B.i1-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado para el ecosistema Loom, orientado a ejecutar el modelo en GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete se genero con la herramienta `loom-next`, que produce los programas `.loom` y la configuracion de servicio sin intervencion de un LLM en el bucle. Su interes es practico: ofrece un preset de memoria, un servidor compatible con la API de OpenAI (`/v1/chat/completions`) y mediciones de rendimiento frente a llama.cpp ROCm sobre el mismo GGUF y las mismas prompts. En Strix Halo reporta mejoras de en torno al 5-7 % en decodificacion y del 50-59 % en prefill respecto a llama.cpp.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes, el tamano del repo es de 0,0 GB (los pesos se obtienen del repositorio base) y las mediciones para R9700 aun no se han repetido. Es un artefacto de infraestructura para hardware AMD, no una propuesta de modelo con benchmarks propios de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base Athena-27B-i1; el paquete no la documenta) |
| Parametros totales | no disponible (el nombre indica 27B; no confirmado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion medida de llama.cpp (`-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del repo base no detalladas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Athena-27B.i1-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura del modelo subyacente: no se detallan tipo de transformer, numero de capas, dimensiones ocultas, atencion ni composicion del dataset de entrenamiento. Lo unico verificable es que se parte del checkpoint `mradermacher/Athena-27B-i1-GGUF` sin modificaciones, es decir, los pesos son identicos al GGUF original y el paquete solo cambia la forma de cargarlos y servirlos.

La innovacion tecnica esta en la capa de ejecucion, no en el modelo. Loom sirve el preset incluido en el paquete con parametros como `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elastico) y `--parameter_mode=preload` (carga de pesos en host). La espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en vuelo y es la configuracion usada en las mediciones. No hay decodificacion especulativa: el GGUF no incluye cabeza MTP y no se ha publicado un drafter para este modelo exacto, por lo que las filas de un solo stream se midieron sin drafting en ambos motores.

## Capacidades

- Generacion de texto conversacional a traves de un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Modo de razonamiento o thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Servicio multi-stream: la configuracion medida soporta 4 peticiones paralelas con decodificacion agregada.
- Procesamiento de prompts largos: se midio prefill con documentos de hasta 32k tokens y decodificacion tras contexto de 32k.
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Capacidades multimodales, de audio o de agentes: no disponibles en la informacion.
- Soporte multilingue: no disponible.

## Casos de uso

- Inferencia local en Strix Halo: desplegar un modelo de 27B cuantizado en Q4_K_M sobre una APU Ryzen AI Max+ 395 usando `loom-fetch` y `loom-serve`, con un preset de memoria ya ajustado y sin necesidad de configurar llama.cpp manualmente.
- Procesamiento de documentos largos en local: el rendimiento de prefill medido (531,6 tok/s con 1k tokens, 469,2 tok/s con 32k) hace viable indexar o resumir documentos extensos en hardware de escritorio con GPU integrada.
- Servicio de chat con varios usuarios: el modo de 4 streams alcanza 49,0 tok/s agregados frente a 38,5 de llama.cpp, adecuado para un pequeno equipo interno que comparta una unica maquina.
- Razonamiento con thinking mode en entornos sin conexion: al estar activado por defecto, sirve para tareas de analisis paso a paso donde no se quiere depender de APIs externas, desactivandolo por peticion cuando se prioriza latencia.
- Despliegue en Radeon AI PRO R9700: el paquete incluye un preset especifico (`chat-r9700`) para esta GPU de 32 GB, pensado para estaciones de trabajo con acelerador AMD dedicado; las cifras de rendimiento para este hardware aun no se han publicado.
- Evaluacion comparativa de motores de inferencia: al fijar el mismo GGUF, las mismas prompts y el mismo runner, el paquete sirve como base reproducible para comparar Loom frente a llama.cpp ROCm en hardware AMD.

## Benchmarks y rendimiento

Rendimiento de inferencia en Strix Halo (gfx1151), Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mediana de 3 sesiones, medido el 2026-11-26:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 12,7 | 13,6 | +7 % |
| Decode tok/s, contexto 2k | 12,5 | 13,4 | +7 % |
| Decode tok/s, contexto 32k | 11,1 | 11,7 | +5 % |
| Prefill tok/s, documento 1k | 333,6 | 531,6 | +59 % |
| Prefill tok/s, documento 2k | 344,8 | 516,7 | +50 % |
| Prefill tok/s, documento 8k | 350,3 | 542,5 | +55 % |
| Prefill tok/s, documento 16k | 335,3 | 515,0 | +54 % |
| Prefill tok/s, documento 32k | 304,9 | 469,2 | +54 % |
| 4 streams, decode agregado tok/s | 38,5 | 49,0 | +27 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explicita; un GGUF de 27B en Q4_K_M ronda los 16-17 GB de pesos, pero la cifra exacta no se documenta en el paquete.
- Consumer GPU: no hay confirmacion de funcionamiento en GPUs de consumo; el paquete esta generado y medido solo para los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas dentro de este paquete, aunque llama.cpp se usa como referencia de comparacion.
- Throughput medido en Strix Halo: 13,6 tok/s en decodificacion de prompt corto y 531,6 tok/s en prefill de 1k tokens con la espera activa habilitada.
- El preset de llama.cpp usado como referencia emplea `-ngl 99 -cram 0 -c 65536 -np 1`, es decir, offload completo con contexto de 65.536 tokens y un solo slot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Athena-27B-i1 (paquete Loom) | no disponible (27B por nombre) | 65.536 en la configuracion medida | MIT | GGUF + `.loom` | Optimizado para Strix Halo y R9700; +5-7 % decode y +50-59 % prefill frente a llama.cpp ROCm |
| Athena-27B-i1-GGUF (repo base) | no disponible (27B por nombre) | no disponible | MIT | GGUF | Mismos pesos, sin empaquetado Loom; requiere motor propio (llama.cpp u otro) |
| llama.cpp ROCm b1374 sirviendo el mismo GGUF | no disponible | 65.536 en la configuracion medida | MIT (llama.cpp) | GGUF | Referencia de comparacion; 12,7 tok/s decode y 333,6 tok/s prefill en Strix Halo |

No se dispone de datos de otros modelos de 27B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al GGUF de `mradermacher/Athena-27B-i1-GGUF`; cualquier limitacion del modelo base (sesgos, alucinacion, calidad en determinados idiomas) se hereda sin cambios.
- El repositorio tiene 0 descargas y 0 likes y un tamano de 0,0 GB: los pesos no estan alojados aqui, se obtienen del repositorio base, por lo que la disponibilidad depende de este ultimo.
- Las mediciones de rendimiento se hicieron en runners de AMD DevLab que difieren entre sesiones; los margenes dentro de +-3 % se consideran empate segun la propia metodologia.
- Las cifras de R9700 no se han vuelto a medir; no deben extrapolarse las de Strix Halo.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras la GPU trabaja; en maquinas compartidas puede degradar otras cargas.
- Tool calling no es compatible segun la tabla de caracteristicas, lo que descarta su uso en pipelines de agentes que dependan de function calling.
- No hay informacion sobre idiomas soportados, sesgos especificos ni calidad multilingue.
- La licencia MIT se aplica al paquete; conviene verificar la licencia del checkpoint base antes de un uso comercial en produccion.
- El endpoint expone la API de OpenAI en `127.0.0.1:8080`; no se documentan mecanismos de autenticacion, por lo que no deberia exponerse fuera de la red local sin una capa adicional.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/mradermacher-Athena-27B-i1-loom
- Checkpoint base: https://huggingface.co/mradermacher/Athena-27B-i1-GGUF
- Herramienta generadora loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Sistema HRX (ROCm): https://github.com/ROCm/hrx-system
- Ejecucion de referencia de las mediciones: https://github.com/loom-fun/loom-next/actions/runs/45878899084
