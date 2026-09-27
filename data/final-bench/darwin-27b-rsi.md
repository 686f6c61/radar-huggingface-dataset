# FINAL-Bench/Darwin-27B-RSI

## Resumen

Darwin-27B-RSI es un modelo de lenguaje de 26.895.998.464 parametros (≈26,9B), denso, desarrollado por la organizacion FINAL-Bench y publicado bajo licencia Apache 2.0. Se presenta como el resultado de aplicar Recursive Self-Improvement (RSI) sobre su modelo padre, Darwin-27B-Opus: el autor afirma que la mejora se obtuvo utilizando exclusivamente senal generada por el propio modelo, sin respuestas escritas por humanos en ninguna etapa. La arquitectura declarada pertenece a la familia Qwen3.5 (clase de texto `qwen3_5_text`), con modo de razonamiento explicito ("thinking") y pesos en BF16.

El problema que aborda es el cuello de botella del etiquetado humano en el post-entrenamiento: en lugar de depender de anotaciones externas, el modelo resuelve problemas, evalua su propio trabajo y aprende de esa produccion, repitiendo el ciclo. El autor reporta mejoras medibles frente al padre en razonamiento cientifico de nivel de posgrado: +5,24 puntos en GPQA Diamond con una sola muestra y +3,79 puntos con majority@16, con significacion estadistica en pruebas pareadas, y +4,03 puntos en SuperGPQA.

Su relevancia es doble. Por un lado, es un caso publico de bucle de auto-mejora aplicado a un modelo de 27B abierto, una linea de investigacion poco documentada a esta escala. Por otro, actua como motor de razonamiento del sistema Darwin-27B-JEV dentro del Decision Index, donde eleva tareas duras (GPQA Diamond de 0,31 a 0,71 de skill, GSM8K de 0,61 a 0,97, MMLU-Pro de 0,60 a 0,82). Como contrapartida, el procedimiento de entrenamiento no se ha liberado y la adopcion del modelo es practicamente nula en el momento de redactar esta ficha (0 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (clase de texto `qwen3_5_text`), con modo de razonamiento explicito ("thinking") |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors BF16; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | en (ingles), ko (coreano), multilingual (sin cobertura detallada por idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | FINAL-Bench/Darwin-27B-Opus |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 53,8 GB |
| Fecha de publicacion | 2026-09-27 (ultima actualizacion 2026-09-27) |
| Compatibilidad declarada | `endpoints_compatible` (etiqueta del repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parametros encuadrado en la familia Qwen3.5, segun la etiqueta de arquitectura `qwen3_5_text` y el propio encabezado de la model card ("Qwen3.5-27B family · 27B dense · Thinking mode · BF16 · Apache 2.0"). No se documentan en la informacion disponible ni la profundidad de la red, ni el numero de cabezas de atencion, ni si incorpora atencion lineal, decodificacion especulativa u otras optimizaciones. Tampoco se especifica la longitud de contexto soportada.

El entrenamiento consiste en un ciclo de Recursive Self-Improvement aplicado sobre Darwin-27B-Opus. El autor declara que no se utilizaron respuestas humanas en ninguna fase: el modelo trabaja sobre problemas, juzga su propia produccion y aprende de ese material, y el modelo resultante sirve como punto de partida de la siguiente iteracion. Se indica explicitamente una comprobacion de contaminacion: los problemas de entrenamiento comparten 0 elementos con los conjuntos de evaluacion reportados. No se publica el procedimiento de entrenamiento, ni el volumen de tokens, ni la composicion del dataset, ni si hubo RLHF, DPO u otro metodo de alineacion. Las cifras de GPQA Diamond del modelo difieren de las de la card de Darwin-27B-Opus porque se midieron bajo protocolos distintos (la card indica que ambas mediciones de la comparativa se hicieron con el mismo protocolo: una sola muestra, mismos ajustes de muestreo y mismo presupuesto de tokens).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, coreano y, segun la etiqueta `multilingual`, otros idiomas sin detallar.
- Razonamiento explicito con modo "thinking": el modelo produce un bloque de razonamiento en cadena antes de la respuesta final. El ejemplo de uso oficial emplea `max_new_tokens=8192` con `temperature=0.6` y `top_p=0.95`, lo que indica que el flujo esperado incluye cadenas de pensamiento largas.
- Razonamiento cientifico de nivel de posgrado: GPQA Diamond y SuperGPQA son los benchmarks centrales de la evaluacion publicada.
- Matematicas y aritmetica de nivel escolar y competitivo, evidenciado por su participacion en GSM8K dentro del Decision Index (skill 0,61 a 0,97).
- Razonamiento sobre codigo: evaluado en CRUXEval dentro del Decision Index (skill 0,61 a 0,87).
- Razonamiento logico-causal: CLadder (0,49 a 0,70) y BBH (0,68 a 0,83) como parte del mismo conjunto de decisiones tipadas.
- Razonamiento de conocimiento amplio: MMLU-Pro (0,60 a 0,82).
- Integracion como motor de decisiones tipadas ("typed decisions") en el sistema Darwin-27B-JEV, cuyo objetivo es resolver decisiones que requieren razonamiento real (etiquetas `decision-index`, `typed-decisions`, `jev`, `system-2`).
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni ejecucion de codigo en la informacion disponible.

## Casos de uso

- Razonamiento cientifico asistido en investigacion: el modelo esta optimizado para preguntas de nivel de posgrado en fisica, quimica y biologia (GPQA Diamond, SuperGPQA). Se usaria como asistente de verificacion de hipotesis y resolucion de problemas cerrados, con la salida de razonamiento revisada por un experto antes de aceptarla.
- Ensenanza y tutoria de materias STEM: la combinacion de modo "thinking" y buen rendimiento en GSM8K y CLadder permite generar explicaciones paso a paso para problemas de matematicas y razonamiento causal, mostrando la cadena de pensamiento al estudiante.
- Motor de razonamiento dentro de un sistema de decisiones tipadas: en arquitecturas tipo JEV, el modelo se reserva para las decisiones que requieren pensamiento profundo, mientras componentes mas ligeros resuelven las triviales. Es el uso exacto para el que el autor lo posiciona (Decision Index v0.2.1).
- Analisis de codigo y depuracion de expresiones: su rendimiento en CRUXEval (skill 0,87) lo hace util para evaluar el resultado esperado de fragmentos de codigo y para razonar sobre expresiones antes de ejecutarlas, por ejemplo en revisiones previas a un merge.
- Generacion de conjuntos de datos sinteticos de razonamiento: al ser la salida de un bucle de auto-mejora sin etiquetas humanas, puede emplearse como generador de trazas de razonamiento para destilar o aumentar otros modelos mas pequenos.
- Evaluacion y comparacion de modelos en pipelines internos: dado que el autor publica resultados bajo protocolo controlado (una muestra y majority@16), sirve como referencia reproducible para medir el efecto de tecnicas de auto-mejora sobre un modelo base de 27B.
- Procesamiento de documentacion tecnica en ingles y coreano: es util para equipos que operan en ambos idiomas, aunque no hay datos publicados de calidad por idioma que permitan garantizar el rendimiento en coreano.
- Investigacion sobre auto-mejora y etiquetado libre: utilizable como punto de partida experimental para reproducir o refutar los resultados de RSI declarados por el autor, teniendo en cuenta que el procedimiento original no se ha liberado.

## Benchmarks y rendimiento

Razonamiento cientifico, mismo protocolo para ambos modelos (una muestra, mismos ajustes de muestreo y presupuesto de tokens):

| Benchmark | Darwin-27B-Opus | Darwin-27B-RSI | Delta |
|---|---|---|---|
| GPQA Diamond (1 muestra) | 72,85 | 78,09 | +5,24 |
| GPQA Diamond (majority@16) | 79,80 | 83,59 | +3,79 |
| SuperGPQA (1 muestra) | no disponible | no disponible | +4,03 |

El autor indica que todas las ganancias son estadisticamente significativas en pruebas pareadas, y que el protocolo de estas mediciones difiere del usado en la card de Darwin-27B-Opus, por lo que las cifras no son directamente comparables con las de esa ficha.

Decision Index (skill corregida por azar: 0 = aleatorio, 1 = perfecto), con Darwin-27B-RSI como motor de razonamiento de Darwin-27B-JEV:

| Benchmark (skill) | Antes | Con Darwin-27B-RSI |
|---|---|---|
| GPQA Diamond (gold) | 0,31 | 0,71 |
| GSM8K | 0,61 | 0,97 |
| CRUXEval | 0,61 | 0,87 |
| MMLU-Pro (gold) | 0,60 | 0,82 |
| BBH (gold) | 0,68 | 0,83 |
| CLadder | 0,49 | 0,70 |

Puntuacion global declarada: Darwin-27B-JEV ≈ 61,1 bajo las reglas del tablero v0.2.1, recalculada por los autores, con puntuacion oficial pendiente de revision. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks convencionales fuera de los recogidos en las dos tablas anteriores; el conjunto completo abarca 43 benchmarks y aproximadamente 121K decisiones.

## Requisitos de hardware

- Pesos en BF16: los 26,9B parametros ocupan aproximadamente 53,8 GB (coincide con el tamano del repositorio). Con cache KV y overhead de runtime, hay que prever del orden de 60-70 GB de VRAM, dependiendo de la longitud de contexto (no publicada) y del tamano de lote.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o L40S 48 GB en configuracion multi-GPU. En GPUs de 24 GB no cabe sin cuantizar ni repartir en tensor parallelism.
- Cabe en consumer GPU?: no en BF16. Solo con cuantizacion de 4 bits (estimacion de 15-18 GB) cabria en RTX 4090, RTX 3090 o RTX 5090 de 24 GB, pero el autor no publica pesos cuantizados, por lo que habria que generarlos.
- Cuantizacion a 8 bits o FP8: aproximadamente 27-30 GB de pesos, viable en RTX 6000 Ada 48 GB, A6000 48 GB o L40S 48 GB. Requiere conversion propia, ya que no hay variantes oficiales.
- Opciones de despliegue: transformers es la libreria de referencia declarada y el repositorio esta marcado como `endpoints_compatible`, lo que permite desplegarlo en Hugging Face Inference Endpoints. Para servicio de alto rendimiento son aplicables vLLM, TGI o SGLang, con tensor parallelism si se mantiene BF16. llama.cpp y Ollama requeririan una conversion a GGUF que no esta publicada.
- Latencia y throughput: no disponible. Como referencia cualitativa, el ejemplo oficial genera hasta 8192 tokens nuevos con decodificacion por muestreo, lo que implica una latencia por peticion elevada en comparacion con modelos no "thinking".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond (1 muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-27B-RSI | 26,9B (dato de safetensors) | no disponible | 78,09 | apache-2.0 | Hugging Face |
| Darwin-27B-Opus (padre) | no disponible | no disponible | 72,85 | no disponible | Hugging Face |
| Darwin-31B-Opus | no disponible (denominacion "31B") | no disponible | no disponible | no disponible | Hugging Face |
| Darwin-9B-Opus | no disponible (denominacion "9B") | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5-27B (familia base declarada) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las unicas comparaciones con datos verificables son las que el propio autor publica frente al modelo padre, que es la referencia natural. Los modelos Darwin-31B-Opus y Darwin-9B-Opus se enlazan desde la model card, pero no se han proporcionado sus especificaciones ni sus resultados, por lo que las celdas quedan sin cubrir. No se dispone de comparativas con otros modelos abiertos de tamano similar.

## Limitaciones y advertencias

- El procedimiento de entrenamiento no se ha publicado, por lo que los resultados de RSI no son reproducibles ni auditables externamente. Las afirmaciones de "cero respuestas humanas" se apoyan unicamente en la declaracion del autor.
- La comprobacion de contaminacion se limita a la afirmacion de que entrenamiento y evaluacion comparten 0 elementos en los conjuntos reportados; no se detalla la metodologia aplicada.
- No se documenta la longitud de contexto, dato critico para planificar despliegues y para estimar el coste de la cache KV.
- No hay cuantizaciones oficiales, lo que encarece el despliegue en hardware de consumo y obliga a conversiones propias con el riesgo de degradacion que ello conlleva.
- Idiomas: solo ingles y coreano aparecen como idiomas declarados, ademas de la etiqueta generica `multilingual`. No hay evaluaciones por idioma, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente inferior al del ingles.
- Adopcion practicamente nula en el momento de la publicacion (0 descargas, 1 like), lo que implica ausencia de validacion independiente, de reportes de fallos y de ecosistema de herramientas alrededor del modelo.
- Las cifras de GPQA Diamond se obtienen con una sola muestra o con majority@16; son sensibles a los ajustes de muestreo y no equivalen a una evaluacion con protocolo estandarizado tipo few-shot.
- La puntuacion de Darwin-27B-JEV (≈61,1) es un recalculo de los propios autores bajo las reglas v0.2.1 del tablero, con puntuacion oficial pendiente de revision. No debe tratarse como un resultado verificado por terceros.
- Riesgo de alucinacion inherente a los modelos generativos: no se publican datos de calibracion, tasas de abstenacion ni evaluaciones de veracidad. El modo "thinking" no garantiza correccion, solo trazas de razonamiento mas largas.
- Sesgos: al derivar de la familia Qwen3.5 y de un corpus de auto-entrenamiento no documentado, hereda los sesgos del modelo base y del material generado, sin que exista una evaluacion de sesgo publicada para este modelo.
- No se documentan filtros de seguridad, moderacion de contenido ni comportamientos de rechazo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al tratarse de un finetune de un modelo de la familia Qwen3.5 conviene revisar tambien los terminos aplicables al modelo base.
- Coste de inferencia: modelo denso de 27B en BF16 con generacion de razonamiento larga, lo que se traduce en requisitos de VRAM y latencia altos en comparacion con modelos de menor tamano o con arquitecturas MoE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Modelo padre (Darwin-27B-Opus): https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Coleccion de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Organizacion FINAL-Bench: https://huggingface.co/FINAL-Bench
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Ejecucion completa del Decision Index (121K decisiones): https://huggingface.co/datasets/FINAL-Bench/Darwin-27B-JEV-decision-index
- Sitio del autor (VIDRAFT): https://vidraft.net
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las unicas entradas devueltas corresponden a definiciones del diccionario frances de la palabra "final" (Larousse, Le Robert, Wiktionnaire, MerciApp), sin relacion con el modelo ni con su contexto tecnico.
