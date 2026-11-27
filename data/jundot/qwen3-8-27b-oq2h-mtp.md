# Jundot/Qwen3.8-27B-oQ2h-mtp

## Resumen

Qwen3.8-27B-oQ2h-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.000 millones de parametros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot bajo el identificador Jundot/Qwen3.8-27B-oQ2h-mtp y esta pensado exclusivamente para el ecosistema MLX de Apple Silicon, mediante la herramienta oQ (oMLX) desarrollada por el mismo autor.

El modelo original resuelve tareas de comprension de imagen y video combinadas con generacion de texto y razonamiento, con una ventana de contexto nativa de 262.144 tokens. La version cuantizada reduce el checkpoint completo a 11,8 GB (11,02 GiB) con un promedio efectivo de 3,407 bits por peso, lo que permite ejecutar un modelo de 27B en equipos con memoria unificada moderada.

La relevancia de esta ficha radica en que emplea el formato oQh, una variante propietaria de oMLX que aplica una transformada de Hadamard a los pesos antes de cuantizarlos para reducir la divergencia KL respecto al modelo en BF16. Requiere oMLX 0.8.0 o superior y no es cargable por otros motores MLX genericos, lo que limita su portabilidad pero mejora la calidad a bajos bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5), con encoder de vision y cabeza MTP |
| Parametros totales | 27.781 millones (5.724.930.800 en el fichero safetensors principal; el total incluye backbone, vision encoder y MTP) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQh mixta: 2, 3, 4 y 5 bits con escala por fila; affine 3, 4 y 5 bits con grupo 64; BF16 para un 1,857% de los pesos |
| Idiomas soportados | No disponible (la model card no detalla la lista; el modelo base Qwen3.5 es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato oQh (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una disposicion hibrida que combina capas Gated DeltaNet (atencion lineal con estado recurrente) y capas Gated Attention clasica. Incluye un encoder de vision para entrada de imagen y video, y una cabeza de multi-token prediction (MTP) que permite decodificacion especulativa interna. El checkpoint cuantizado conserva los tres componentes: backbone de lenguaje (26.896 millones de pesos logicos, 9,869 GiB), encoder de vision (0,461 millones, 0,858 GiB) y cabeza MTP (0,425 millones, 0,293 GiB).

La cuantizacion oQh aplica una rotacion de Hadamard a los pesos antes de cuantizarlos, lo que reduce el numero de escalas necesarias y libera espacio para asignar mas bits a las tensiones mas sensibles. El resultado es un checkpoint del mismo tamano que el formato oQe pero con menor divergencia KL: en el nivel oQ2, la KL frente a BF16 baja de 0,19 a 0,10 en FLORES+ (-47%), de 0,21 a 0,11 en Aya (-46%) y de 0,13 a 0,078 en codigo Python (-41%). La distribucion de bits concentra el 70,8% de los pesos en 3 bits con escala por fila y reserva 5 bits para un 5,4% de tensiones sensibles; los embeddings de tokens, la cabeza de salida y la cabeza MTP permanecen en grupos affine. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Comprension de imagen y video (pipeline image-text-to-text) mediante el encoder de vision integrado.
- Generacion de codigo, con divergencia KL medida sobre fuentes Python.
- Capacidades multilingues heredadas del modelo base (la model card no detalla la lista de idiomas).
- Decodificacion especulativa mediante la cabeza de multi-token prediction (MTP) incluida en el checkpoint.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos con imagenes en local: el modelo puede procesar capturas, diagramas y texto escaneado junto con instrucciones largas gracias a los 262.144 tokens de contexto, sin enviar datos a la nube.
- Asistencia sobre video: resumen y respuesta a preguntas sobre clips o grabaciones mediante el encoder de vision, adecuado para revision de material audiovisual en equipos Apple Silicon.
- Generacion de codigo en estaciones de trabajo macOS: la cuantizacion preserva calidad en Python (KL de 0,078 frente a BF16) y el checkpoint de 11 GB cabe en memoria unificada de 16 GB o superior.
- Prototipado de agentes multimodales: la cabeza MTP permite decodificacion especulativa que acelera la generacion en flujos iterativos, util para experimentar con pipelines de agentes antes de desplegar en servidor.
- Investigacion en cuantizacion de bajo bit: el checkpoint sirve como referencia reproducible para comparar oQh frente a oQe y otros esquemas en tareas multilingues (FLORES+, Aya) y de codigo.
- Procesamiento por lotes de imagenes etiquetadas: clasificacion y descripcion de catalogos de productos o archivos fotograficos en un Mac Studio, con coste cero de API.
- Traduccion y analisis multilingue de material con soporte visual: el modelo base cubre varios idiomas y la evaluacion del autor incluye 7 lenguas en FLORES+ y Aya.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K). El unico dato de rendimiento disponible es la divergencia KL frente al modelo en BF16, comparando oQe y oQh al mismo nivel de compresion:

| Nivel | Tamano | KL FLORES+ (oQe -> oQh) | KL Aya (oQe -> oQh) | KL codigo (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 9,9 GiB | 0,19 -> 0,10 (-47%) | 0,21 -> 0,11 (-46%) | 0,13 -> 0,078 (-41%) |
| oQ3 | 12,2 GiB | 0,066 -> 0,040 (-39%) | 0,082 -> 0,040 (-51%) | 0,052 -> 0,037 (-28%) |
| oQ4 | 15,2 GiB | 0,016 -> 0,012 (-26%) | 0,018 -> 0,013 (-27%) | 0,013 -> 0,012 (-13%) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el checkpoint completo ocupa 11,02 GiB; se recomienda al menos 16 GB de memoria unificada para inferencia con contexto moderado y 24-32 GB para contextos largos o procesamiento de video.
- GPU recomendadas: Apple Silicon con memoria unificada (series M2 Pro/Max/Ultra, M3 Max/Ultra, M4 Pro/Max). No es compatible con GPU NVIDIA o AMD porque el formato oQh es especifico de MLX.
- Cabe en consumer GPU: si, en equipos Apple Silicon de gama alta con 16 GB o mas de memoria unificada; no en GPU de consumo con 8-12 GB de VRAM por la incompatibilidad de formato.
- Despliegue: exclusivamente mediante oMLX 0.8.0 o superior. No es cargable por llama.cpp, vLLM, TGI, Ollama ni otros motores MLX genericos.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP incluida puede reducir la latencia de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2h-mtp (este) | 27,78B | 262.144 | Si (imagen y video) | Apache-2.0 | oQh / oMLX 0.8.0+ |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | Si | Apache-2.0 | safetensors BF16 / cualquier motor compatible |
| Qwen3.8-27B en oQe (mismo autor) | 27,78B | 262.144 | Si | Apache-2.0 | MLX estandar / cualquier motor MLX |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion mas directa es con el checkpoint oQe del mismo autor y nivel oQ2: mismo tamano (9,9 GiB para el backbone), pero oQh reduce la KL entre un 41% y un 47% segun la tarea. Frente al modelo base en BF16, el checkpoint cuantizado ocupa aproximadamente una cuarta parte del espacio a costa de la divergencia medida en la tabla anterior.

## Limitaciones y advertencias

- Dependencia de oMLX 0.8.0 o superior: versiones anteriores no pueden cargar el checkpoint y otros motores MLX genericos tampoco, lo que ata el modelo a una unica herramienta.
- Cuantizacion agresiva: 3,407 bits por peso de media implica perdida de calidad medible (KL de 0,10 en FLORES+ a nivel oQ2); no es adecuado para tareas que exijan fidelidad cercana al BF16.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion en tareas de razonamiento largo o generacion de codigo complejo.
- Idiomas: la model card no documenta la lista de idiomas soportados; conviene validar el rendimiento en el idioma objetivo antes de produccion.
- Vision y video: aunque el encoder se conserva, la cuantizacion mixta puede degradar tareas de percepcion fina (OCR, detalles pequenos); no se publican metricas especificas de vision.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el formato oQh y la dependencia de oMLX pueden condicionar el despliegue en infraestructura no Apple.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval o GSM8K que permitan comparar directamente con otros modelos de 27B.
- Adopcion baja: 200 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
