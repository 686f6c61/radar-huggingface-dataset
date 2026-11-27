# MicroFlare/NanoFlare-v1

## Resumen

NanoFlare-v1 es una cuantizacion hipercomprimida del modelo Qwen/Qwen3.8-27B, publicada por el usuario MicroFlare en Hugging Face bajo licencia Apache 2.0. Su objetivo es hacer viable la inferencia de un modelo de aproximadamente 27.000 millones de parametros en GPU de consumo con 8 GB de VRAM, o en CPU con al menos 10 GB de memoria de sistema. Para ello aplica una cuantizacion no uniforme de los pesos, asignando mayor precision a las capas y tensores mas sensibles y reduciendo la de los menos criticos, con el fin de conservar la mayor calidad posible dentro de un presupuesto de memoria muy ajustado.

El modelo se distribuye en formato GGUF, con un tamano de repositorio de 46,3 GB (que incluye varias revisiones y builds), y la revision recomendada (v1.c) ocupa aproximadamente 7130 MB en disco. Incluye una variante con el predictor draft MTP (multi-token prediction) integrado, identificable por el sufijo `--with-mtp` en el nombre del fichero, que requiere al menos 10 GB de VRAM para caber completamente en GPU.

Es relevante ahora porque demuestra una via practica para ejecutar modelos de escala 27B en hardware de gama media mediante tecnicas de cuantizacion agresiva y asignacion selectiva de bits, a costa de una perdida medible de calidad y de cierta inestabilidad en la coherencia del razonamiento. El autor lo posiciona como una alternativa mas ligera a su modelo previo microFlare-v1, con menor calidad pero menor huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta aproximadamente 8k tokens en GPU con 8 GB (probado con k:q5_0, v:iq4_nl); contexto mayor requiere offload de la KV cache a CPU |
| Tipos de cuantizacion | cuantizacion no uniforme de pesos en formato GGUF; KV cache con tipos q5_0 (claves) e iq4_nl (valores); build alternativo con MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 46,3 GB con multiples revisiones y builds) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la informacion proporcionada. NanoFlare-v1 no es un modelo entrenado desde cero, sino una compresion del citado modelo base mediante cuantizacion no uniforme: el autor indica que asigna mas precision a las partes mas sensibles del modelo y menos a las demas, con el objetivo de preservar calidad dentro de un presupuesto de memoria de aproximadamente 7 GB. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, ya que la intervencion del autor se limita a la cuantizacion.

La innovacion tecnica destacable es la propia estrategia de cuantizacion selectiva, junto con la existencia de una build con predictor draft MTP (multi-token prediction) para decodificacion especulativa, que se elimina en la build estandar para ahorrar espacio. La revision v1.c reduce el tamano lo suficiente como para alojar una KV cache pequena en la misma GPU de 8 GB. El autor recomienda los parametros de muestreo `temperature: 0.95` y `top-k: 20` para un funcionamiento optimo.

## Capacidades

- Generacion de texto conversacional y tareas generales de lenguaje natural.
- Razonamiento y proceso de pensamiento encadenado, aunque el autor advierte que en ocasiones el modelo no completa su cadena de razonamiento.
- Generacion de codigo: el autor lo describe como "bueno en coding".
- Conocimiento en dominios academicos y profesionales (biologia, negocios, quimica, informatica, economia, ingenieria, salud, historia, derecho, matematicas, filosofia, fisica y psicologia), evaluado mediante MMLU Pro.
- Capacidad de ejecucion en CPU como alternativa a la GPU, con rendimiento lento.
- Soporte de contexto largo limitado: hasta aproximadamente 8k tokens en GPU de 8 GB, ampliable con offload de KV cache a CPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues explicitas.

## Casos de uso

- Prototipado y pruebas locales en equipos con GPU de 8 GB: permite experimentar con un modelo de escala 27B en hardware de consumo, util para validar prompts y flujos conversacionales antes de desplegar una version mayor o en la nube.
- Asistencia de programacion en estacion de trabajo: el modelo puede generar y explicar codigo en local, sin enviar codigo propietario a servicios externos, aprovechando su buen desempeno declarado en tareas de coding.
- Resumen y reescritura de documentos de hasta 8k tokens: la ventana de contexto disponible en GPU permite procesar articulos, informes o hilos de correo de longitud media en una sola pasada.
- Chatbot de proposito general autoalojado: adecuado para entornos con requisitos de privacidad donde no se puede usar una API externa, aceptando la menor calidad frente a modelos no comprimidos.
- Educacion y tutoria asistida: puede responder preguntas de materias academicas (matematicas, fisica, biologia, historia) con calidad moderada, segun los resultados de MMLU Pro, siempre con verificacion humana.
- Experimentacion con decodificacion especulativa: la build con MTP permite a investigadores probar tecnicas de aceleracion de inferencia en hardware limitado, comparando throughput y calidad frente a la build estandar.
- Generacion de borradores y lluvia de ideas: para tareas creativas o de redaccion donde la exactitud factual no es critica y se puede tolerar cierta variabilidad en la salida.

## Benchmarks y rendimiento

Perplejidad relativa sobre wikitext2 (menor es mejor), segun la model card:

| Modelo | Tamano | PPL a 2k de contexto | PPL a 8k de contexto |
|---|---|---|---|
| NanoFlare v1 revision c | 7130,2 MB | 8,1826 ± 0,05284 | 7,8064 ± 0,05058 |
| NanoFlare v1 revision b | 7469,3 MB | 8,2480 ± 0,05573 | 7,9631 ± 0,05479 |
| unsloth/IQ2_XXS (UD 3.0) | 6929,5 MB | 7,5441 ± 0,04906 | 8,0013 ± 0,05689 |
| NanoFlare v1 revision a | 7165,9 MB | 8,6832 ± 0,05605 | 8,1774 ± 0,05276 |
| release candidate 1 | 7442,6 MB | 8,7946 ± 0,05764 | 8,2998 ± 0,05454 |
| beta 1 | 7532,8 MB | 8,8221 ± 0,05797 | 8,3352 ± 0,05506 |

MMLU Pro parcial (primeras 20 preguntas de cada una de las 14 categorias, 5-shot, contexto de 8k, top-k 40, temperatura 0,80, revision v1.c):

| Tarea | Version | n-shot | Metrica | Valor | Error estandar |
|---|---|---|---|---|---|
| biology | 3.1 | 5 | exact_match | 0,90 | ±0,0688 |
| business | 3.1 | 5 | exact_match | 0,65 | ±0,1094 |
| chemistry | 3.1 | 5 | exact_match | 0,75 | ±0,0993 |
| computer_science | 3.1 | 5 | exact_match | 0,70 | ±0,1051 |
| economics | 3.1 | 5 | exact_match | 0,60 | ±0,1124 |
| engineering | 3.1 | 5 | exact_match | 0,45 | ±0,1141 |
| health | 3.1 | 5 | exact_match | 0,50 | ±0,1147 |
| history | 3.1 | 5 | exact_match | 0,50 | ±0,1147 |
| law | 3.1 | 5 | exact_match | 0,45 | ±0,1141 |
| math | 3.1 | 5 | exact_match | 0,65 | ±0,1094 |
| other | 3.1 | 5 | exact_match | 0,60 | ±0,1124 |
| philosophy | 3.1 | 5 | exact_match | 0,55 | ±0,1141 |
| physics | 3.1 | 5 | exact_match | 0,55 | ±0,1141 |
| psychology | 3.1 | 5 | exact_match | 0,65 | ±0,1094 |
| Total | | | average | 0,61 | |

El autor senala que su modelo previo microFlare-v1 obtuvo 0,73 en la misma evaluacion y ofrece una salida mas estable.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 7 GB para la build estandar v1.c (7130 MB en disco), lo que permite ejecucion completa en GPU de 8 GB con contexto de hasta unos 8k tokens usando KV cache k:q5_0 y v:iq4_nl.
- La build con MTP (`--with-mtp`) no cabe en una GPU de 8 GB segun el autor; requiere 10 GB o mas de VRAM.
- CPU: ejecutable con al menos 10 GB de memoria de sistema, con rendimiento lento.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM para la build estandar (por ejemplo, gama RTX xx60/xx70 con 8 GB); 10 GB o mas para la build con MTP. No se especifican modelos concretos de A100 o H100, que no son necesarios para este formato.
- Despliegue: formato GGUF, por lo que el runtime natural es llama.cpp y sus derivados (Ollama, LM Studio, entre otros). No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El contexto superior a 8k requiere offload de la KV cache a CPU, lo que incrementa la latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoFlare-v1 (rev. c) | ~26,9B | ~8k en GPU de 8 GB | MMLU Pro parcial 0,61; PPL 8k 7,8064 | apache-2.0 | GGUF en Hugging Face |
| microFlare-v1 (mismo autor) | no disponible | no disponible | MMLU Pro parcial 0,73; salida mas estable | no disponible en la informacion | Hugging Face (MicroFlare/microFlare-v1) |
| unsloth/IQ2_XXS (UD 3.0) | no disponible | no disponible | PPL 2k 7,5441; PPL 8k 8,0013 | no disponible en la informacion | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible (referencia sin cuantizar) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion hiperagresiva degrada la calidad: el autor reconoce que el modelo "no es perfecto" y que puede fallar de forma intermitente.
- El modelo a veces no completa su proceso de razonamiento; el autor recomienda reintentar el prompt, que suele funcionar al segundo intento.
- Ha perdido hechos y cifras de sus datos de entrenamiento por la compresion; se recomienda darle acceso a busqueda web o verificar cualquier dato recuperado de memoria.
- Riesgo elevado de alucinacion en datos factuales y cifras, derivado de la perdida de conocimiento por cuantizacion.
- Ventana de contexto practica limitada a unos 8k tokens en GPU de 8 GB; contextos mayores exigen offload a CPU y penalizan el rendimiento.
- No se documentan idiomas soportados ni sesgos conocidos; al heredar del modelo base, los sesgos de este podrian persistir, pero no hay informacion al respecto.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias de estabilidad en produccion.
- El rendimiento en CPU es lento y no apto para cargas interactivas exigentes.
- Los resultados de MMLU Pro son parciales (20 preguntas por categoria) y presentan errores estandar elevados, por lo que deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MicroFlare/NanoFlare-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo previo del autor: https://huggingface.co/MicroFlare/microFlare-v1
- Blog de anuncio: https://microflare.bearblog.dev/nanoflare-compresses-qwen-27b-down-to-fit-on-an-8gb-gpu/
