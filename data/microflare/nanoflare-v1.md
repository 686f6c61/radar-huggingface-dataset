# MicroFlare/nanoFlare-v1

## Resumen

nanoFlare-v1 es una cuantizacion extrema y no uniforme del modelo Qwen/Qwen3.8-27B, publicada por MicroFlare bajo licencia Apache 2.0. Su objetivo es hacer viable la inferencia de un transformer denso de aproximadamente 26.900 millones de parametros en GPUs de consumo con 8 GB de VRAM, o en CPU con al menos 10 GB de memoria de sistema. El autor aplica una asignacion de precision heterogenea entre capas, otorgando mas bits a las partes mas sensibles del modelo para conservar calidad dentro de un presupuesto de memoria muy ajustado.

El resultado es un artefacto GGUF de unos 7,13 GB en su revision v1.c, sensiblemente menor que el modelo base en precision completa y tambien mas pequeno que la cuantizacion IQ2_XXS de Unsloth. La revision C incorpora mejoras de coherencia en el razonamiento y reduce el tamano lo suficiente para alojar una cache KV pequena en la GPU. Existe ademas una variante con el predictor MTP (multi-token prediction) conservado, que requiere 10 GB o mas de VRAM.

La relevancia actual del modelo es practica: demuestra hasta donde se puede comprimir un modelo de casi 27B manteniendo un comportamiento utilizable en tareas generales y de codigo, a costa de una degradacion medible en perplejidad y de inestabilidad ocasional en el proceso de razonamiento. No es un modelo nuevo entrenado desde cero, sino un derivado cuantizado del Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta ~8k tokens en GPU con 8 GB (probado con k:q5_0, v:iq4_nl); contexto mayor requiere offload de la cache KV a CPU |
| Tipos de cuantizacion | cuantizacion no uniforme por pesos; cache KV configurable (q5_0 para K, iq4_nl para V en las pruebas del autor); formato GGUF con imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 46,3 GB con multiples revisiones y variantes) |

## Arquitectura y entrenamiento

nanoFlare-v1 no entrena un modelo nuevo: parte de Qwen/Qwen3.8-27B, un transformer denso de ~26,9B parametros, y le aplica una cuantizacion post-entrenamiento no uniforme. En lugar de usar un unico tipo de cuantizacion global, el autor distribuye la precision de forma heterogenea, asignando mas bits a los tensores mas sensibles y menos a los menos criticos, con el fin de maximizar la calidad dentro del presupuesto de ~7 GB. El proceso emplea una matriz de importancia (imatrix), segun las etiquetas del repositorio.

El autor documenta varias iteraciones (beta 1, release candidate 1, revisiones a, b y c), evaluadas con perplejidad sobre wikitext2 a contextos de 2k y 8k. La revision C es la recomendada y la mas estable segun pruebas manuales subjetivas. El predictor de borrador MTP del modelo base se elimina en la build estandar para ahorrar espacio; existe una build alternativa con MTP que no cabe en 8 GB y requiere 10 GB o mas. No se dispone de informacion sobre los datos de entrenamiento originales, el numero de tokens, ni sobre si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en formato chat.
- Razonamiento multi-paso con modo de pensamiento, aunque el autor advierte que en ocasiones el modelo no completa su cadena de razonamiento por la compresion agresiva.
- Generacion de codigo: el autor lo describe como "bueno en coding" en pruebas subjetivas.
- Tareas generales de conocimiento, con degradacion de hechos y cifras memorizados por la cuantizacion.
- Soporte de contexto de hasta ~8k tokens en GPU de 8 GB; contextos mayores mediante offload de la cache KV a CPU.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en GPU de 8 GB: desplegar un modelo de casi 27B en una RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o similar, usando llama.cpp con la cache KV en GPU (k:q5_0, v:iq4_nl) y contexto de hasta ~8k tokens.
- Asistente de codigo en estacion de trabajo: autocompletado, explicacion y refactorizacion de fragmentos en un IDE, aprovechando la calidad en coding descrita por el autor y la posibilidad de ejecutarlo sin conexion.
- Prototipado y experimentacion de bajo coste: evaluar el comportamiento de un modelo de escala 27B en pipelines de investigacion antes de invertir en hardware con mas VRAM o en APIs de pago.
- Procesamiento por lotes en CPU: ejecutar tareas de resumen o clasificacion en servidores sin GPU con 10 GB o mas de RAM, aceptando latencia alta a cambio de coste cero de acelerador.
- Chatbot de soporte interno con contexto moderado: conversaciones multi-turno de hasta ~8k tokens en hardware de consumo, con la advertencia de que conviene verificar datos facticos.
- Generacion asistida con recuperacion (RAG): el autor recomienda darle acceso a busqueda web o a una base documental porque la cuantizacion ha borrado parte del conocimiento memorizado; el modelo es adecuado como generador final sobre contexto recuperado.
- Pruebas de estres de cuantizacion: usar las distintas revisiones (a, b, c) y la variante con MTP para medir el impacto de la compresion en perplejidad y estabilidad, comparando con IQ2_XXS de Unsloth.

## Benchmarks y rendimiento

Perplejidad sobre wikitext2 (menor es mejor), segun la model card:

| Modelo | Tamano | PPL a 2k | PPL a 8k |
|---|---|---|---|
| nanoFlare v1 revision c | 7130,2 MB | 8,1826 ±0,05284 | 7,8064 ±0,05058 |
| nanoFlare v1 revision b | 7469,3 MB | 8,2480 ±0,05573 | 7,9631 ±0,05479 |
| unsloth/IQ2_XXS (UD 3.0) | 6929,5 MB | 7,5441 ±0,04906 | 8,0013 ±0,05689 |
| nanoFlare v1 revision a | 7165,9 MB | 8,6832 ±0,05605 | 8,1774 ±0,05276 |
| release candidate 1 | 7442,6 MB | 8,7946 ±0,05764 | 8,2998 ±0,05454 |
| beta 1 | 7532,8 MB | 8,8221 ±0,05797 | 8,3352 ±0,05506 |

MMLU Pro (subconjunto parcial: primeras 20 preguntas de cada una de las 14 categorias, 5-shot, contexto 8k, top-k 40, temperatura 0,80, revision v1.c):

| Categoria | Exact match | Error estandar |
|---|---|---|
| biology | 0,90 | ±0,0688 |
| business | 0,65 | ±0,1094 |
| chemistry | 0,75 | ±0,0993 |
| computer_science | 0,70 | ±0,1051 |
| economics | 0,60 | ±0,1124 |
| engineering | 0,45 | ±0,1141 |
| health | 0,50 | ±0,1147 |
| history | 0,50 | ±0,1147 |
| law | 0,45 | ±0,1141 |
| math | 0,65 | ±0,1094 |
| other | 0,60 | ±0,1124 |
| philosophy | 0,55 | ±0,1141 |
| physics | 0,55 | ±0,1141 |
| psychology | 0,65 | ±0,1094 |
| Total | 0,61 | no disponible |

El autor indica que microFlare-v1, otro modelo suyo, obtuvo 0,73 en la misma evaluacion parcial. No se han publicado resultados de HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 8 GB para la build estandar en GPU (revision C, ~7,13 GB de pesos) con cache KV pequena; 10 GB o mas para la variante con MTP.
- Memoria de sistema: al menos 10 GB de RAM para ejecucion en CPU, con rendimiento lento segun el autor.
- GPUs recomendadas: RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y cualquier GPU de 8 GB; RTX 3080 de 10 GB o superior para la variante con MTP. No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, en modelos de 8 GB de VRAM; con 10 GB o mas se puede usar la build con MTP y ampliar contexto.
- Opciones de despliegue: llama.cpp (formato GGUF, con soporte de imatrix y cache KV cuantizada); el repositorio incluye la etiqueta endpoints_compatible. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Parametros de muestreo recomendados por el autor: temperatura 0,95 y top-k 20; las pruebas de MMLU Pro usaron los valores por defecto de llama.cpp (top-k 40, temperatura 0,80).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanoFlare-v1 (rev. c) | ~26,9B denso | ~8k en GPU de 8 GB | PPL 8,18 a 2k / 7,81 a 8k; MMLU Pro parcial 0,61 | Apache 2.0 | GGUF en Hugging Face |
| unsloth/IQ2_XXS (UD 3.0) | ~26,9B denso (Qwen3.8-27B) | no disponible | PPL 7,54 a 2k / 8,00 a 8k | Apache 2.0 (modelo base) | GGUF en Hugging Face |
| microFlare-v1 | no disponible | no disponible | MMLU Pro parcial 0,73 | no disponible | Hugging Face (MicroFlare) |
| Qwen/Qwen3.8-27B (base) | ~26,9B denso | no disponible | referencia sin cuantizar | Apache 2.0 | pesos completos en Hugging Face |

## Limitaciones y advertencias

- Cuantizacion hiperagresiva: el propio autor advierte que el modelo "no es perfecto" y puede fallar de forma intermitente; en ocasiones no completa su proceso de razonamiento y conviene reintentar el prompt.
- Perdida de conocimiento factico: la compresion ha borrado hechos y cifras del entrenamiento original; se recomienda verificar cualquier dato recuperado de memoria o darle acceso a busqueda web.
- Perplejidad superior a IQ2_XXS de Unsloth a contexto de 2k (8,18 frente a 7,54), aunque mejor a 8k (7,81 frente a 8,00).
- MMLU Pro parcial de 0,61, por debajo del 0,73 de microFlare-v1 segun el autor; la muestra es limitada (20 preguntas por categoria) y los intervalos de error son amplios.
- Contexto maximo de ~8k tokens en GPU de 8 GB; ampliarlo exige offload de la cache KV a CPU y penaliza la latencia.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sin informacion sobre tool calling, capacidades de agente, vision o audio.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, es razonable esperar los sesgos de este, pero no hay datos publicados al respecto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de estabilidad en produccion; para cargas criticas es preferible el modelo base o una cuantizacion menos agresiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MicroFlare/nanoFlare-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo alternativo del mismo autor: https://huggingface.co/MicroFlare/microFlare-v1
- Blog de anuncio: https://microflare.bearblog.dev/nanoflare-compresses-qwen-27b-down-to-fit-on-an-8gb-gpu/
- Cuantizacion de referencia IQ2_XXS de Unsloth: no disponible (enlace no incluido en la informacion proporcionada)
