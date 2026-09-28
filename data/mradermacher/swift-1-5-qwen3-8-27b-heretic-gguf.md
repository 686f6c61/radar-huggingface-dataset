# mradermacher/Swift-1.5-Qwen3.8-27b-heretic-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-GGUF es una recopilacion de cuantizaciones GGUF estaticas publicada por el usuario mradermacher a partir de akumaburn/Swift-1.5-Qwen3.8-27b-heretic, una variante "abliterated" (decensurada) de Swift 1.5 Qwen3.8-27B, el modelo desarrollado por UkisAI sobre la base Qwen3.8-27B. El modelo original cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta orientado a razonamiento eficiente, codigo y tareas agenticas. Esta ficha describe la publicacion GGUF, no el modelo original en precision completa.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde 11,0 GB (Q2_K) hasta 29,1 GB (Q8_0), mas los suplementos multimodales mmproj (0,7 GB en Q8_0 y 1,0 GB en f16) que indican soporte de entrada de vision. El repositorio ocupa 190,8 GB en total, incluyendo todas las variantes.

Es importante subrayar tres condiciones: la model card la etiqueta como "research-only", la licencia es la propietaria swift-open-license-1.0 (no una licencia permisiva estandar) y el proceso heretic/abliterated implica la eliminacion de mecanismos de rechazo y alineacion de seguridad, lo que la hace inadecuada para despliegues de cara al publico sin una capa adicional de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3.5/qwen3.8 en los tags; incluye el tag "mtp", multi-token prediction). No se confirma en la informacion disponible si es densa o MoE |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se ha confirmado si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; se menciona IQ4_XS en los tags. Suplementos multimodales: mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (campo license: other; texto en el enlace de licencia del repositorio ukisai) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors/BF16 |
| Tamano del repositorio | 190,8 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de Swift 1.5 Qwen3.8-27B. Lo unico verificable es su filiacion: el modelo base es akumaburn/Swift-1.5-Qwen3.8-27b-heretic, que a su vez deriva de Swift 1.5 Qwen3.8-27B de UkisAI, adaptacion de Qwen3.8-27B. Los tags incluyen qwen3_5, qwen3.8, mtp, vision, abliterated, uncensored, heretic y conversational.

Los tags "mtp" (multi-token prediction) y "vision" son los unicos indicios tecnicos: el primero sugiere el uso de prediccion multi-token, una tecnica que permite al modelo predecir varios tokens por paso de decodificacion y que suele acompanarse de decodificacion especulativa; el segundo se corresponde con la existencia de ficheros mmproj, necesarios en llama.cpp para procesar entradas de imagen. El tag "heretic" hace referencia a un proceso de decensurado por el que se eliminan o atenuan las direcciones de rechazo aprendidas durante el ajuste por preferencias. No hay datos en la informacion proporcionada sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO u otra etapa de alineacion en el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno (tag "conversational").
- Razonamiento eficiente: segun la informacion publica de UkisAI, Swift 1.5 reduce el consumo de tokens de "pensamiento" en un 58,5 % respecto a su base manteniendo (y superando ligeramente) la puntuacion, lo que se traduce en una aceleracion de aproximadamente 1,95x.
- Codigo y tareas agenticas: es el area donde la informacion publica situa su principal ventaja.
- Capacidades multimodales de entrada: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 confirma soporte de vision en el pipeline GGUF; el alcance concreto (imagenes, documentos escaneados, graficos) no esta detallado.
- Tool calling / function calling: el tag "tool-calling" aparece en una de las variantes relacionadas del mismo modelo base, lo que apunta a soporte, aunque no se documenta el formato exacto en esta ficha.
- Modo de razonamiento extendido (thinking mode): implicito en la mencion a los "thinking tokens" y al tag "efficient-thinking" de la variante relacionada.
- Multilingue: limitado a ingles segun el campo language de la model card.

## Casos de uso

- Asistente de programacion en local: con la cuantizacion Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo fuente a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Agentes autonomos con tool calling: su orientacion a tareas agenticas y su menor consumo de tokens de razonamiento reducen el coste por paso en bucles de varios saltos (busqueda, ejecucion de comandos, verificacion), lo que abarata los pipelines de agentes en produccion.
- Investigacion en seguridad y alineacion (red teaming): al ser una variante abliterated, es util para estudiar el comportamiento de un modelo sin rechazos, medir la eficacia de tecnicas de decensurado y disenar clasificadores de moderacion externos. Es el unico uso coherente con la etiqueta "research-only".
- Analisis de documentos tecnicos con vision: usando los ficheros mmproj, el modelo puede procesar capturas de pantalla, diagramas de arquitectura o tablas escaneadas dentro de un flujo de extraccion de informacion local.
- Procesamiento por lotes en hardware propio: gracias a las cuantizaciones Q2_K y Q3_K_S (11,0 y 12,4 GB), se puede desplegar en una unica GPU de 12-16 GB para clasificacion, resumen o extraccion sobre grandes volumenes de texto en ingles.
- Generacion de codigo en pipelines de CI/CD: integrado mediante llama.cpp u Ollama, puede revisar diffs, generar pruebas unitarias o redactar mensajes de commit; el ahorro de tokens de razonamiento reduce la latencia frente a un modelo con thinking mode completo.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye once variantes de cuantizacion, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad por nivel de compresion en un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks absolutos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico documentado son comparaciones relativas publicadas por UkisAI entre Qwen3.8-27B (base), Swift 1.0 y Swift 1.5, con protocolos de evaluacion comunes y agregado de cinco repeticiones:

| Modelo | Variacion de tokens de razonamiento | Variacion de puntuacion | Aceleracion declarada |
|---|---|---|---|
| Qwen3.8-27B (base) | referencia | referencia | 1,00x |
| Swift 1.0 | no disponible | no disponible | no disponible |
| Swift 1.5 | -58,5 % | +0,35 % | 1,95x |

Estos datos corresponden al modelo original de UkisAI, no a las cuantizaciones GGUF de este repositorio. No se dispone de mediciones de perplejidad ni de comparativas de calidad entre las distintas cuantizaciones ofrecidas por mradermacher.

## Requisitos de hardware

El dato de VRAM de referencia para el modelo en precision completa es de 55,6 GB (segun LLM Explorer), lo que obliga a una A100 80 GB, una H100 o un despliegue multi-GPU.

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia | GPU objetivo |
|---|---|---|---|
| Q2_K | 11,0 GB | ~12-13 GB | RTX 3060 12 GB, RTX 4070, RTX 4080 16 GB |
| Q3_K_S | 12,4 GB | ~13-14 GB | RTX 4080 16 GB, RTX 4070 Ti |
| Q3_K_M | 13,6 GB | ~15-16 GB | RTX 4080 16 GB, RTX 4090 (holgado) |
| Q3_K_L | 14,7 GB | ~16-17 GB | RTX 4080 16 GB (justo), RTX 4090 |
| Q4_K_S | 15,9 GB | ~17-18 GB | RTX 4090, RTX 3090, A5000 |
| Q4_K_M | 16,9 GB | ~18-20 GB | RTX 4090, RTX 3090, A5000 |
| Q5_K_S | 19,1 GB | ~20-22 GB | RTX 4090 24 GB |
| Q5_K_M | 19,6 GB | ~21-23 GB | RTX 4090 24 GB |
| Q6_K | 22,5 GB | ~24-26 GB | RTX 4090 (al limite), A6000 48 GB |
| Q8_0 | 29,1 GB | ~31-34 GB | A100 40 GB, 2x RTX 3090/4090 |
| BF16 (modelo original) | ~55,6 GB | ~58 GB o mas | A100 80 GB, H100, multi-GPU |

Notas adicionales:

- Las estimaciones de VRAM anaden entre 1 y 3 GB sobre el fichero para cache KV y overhead del runtime, y crecen con la longitud de contexto efectiva. La longitud de contexto del modelo no esta disponible, por lo que el consumo real de cache es variable.
- Los ficheros mmproj anaden 0,7 GB (Q8_0) o 1,0 GB (f16) si se activa la entrada de vision.
- Si cabe en GPU de consumo: si, desde Q2_K hasta Q5_K_M en tarjetas de 16-24 GB; Q6_K requiere 24 GB muy ajustados; Q8_0 y BF16 no caben en hardware de consumo de una sola tarjeta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, vLLM o TGI. Los ficheros son estaticos (no imatrix ponderada), segun indica el propio autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Swift-1.5-Qwen3.8-27b-heretic-GGUF (este) | 27,3 B | no disponible | Cuantizacion GGUF de una variante abliterated | swift-open-license-1.0 | GGUF en HuggingFace |
| akumaburn/Swift-1.5-Qwen3.8-27b-heretic | 27,3 B | no disponible | Modelo base decensurado | swift-open-license-1.0 | Safetensors en HuggingFace |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,3 B | no disponible | Razonamiento eficiente, codigo y agentes | swift-open-license-1.0 | Safetensors; tambien en Featherless y LLM Explorer |
| Qwen3.8-27B (modelo fundacional) | no disponible | no disponible | Modelo base generalista | no disponible | no disponible |
| mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-BF16-i1-GGUF | no disponible | no disponible | Cuantizacion imatrix en BF16 de la variante uncensored | swift-open-license-1.0 | GGUF en HuggingFace |
| mradermacher/Swift-Qwen3.8-27b-heretic-GGUF | no disponible | no disponible | Cuantizacion GGUF de Swift 1.0 heretic | swift-open-license-1.0 | GGUF en HuggingFace |

No se dispone de datos de benchmarks ni de contexto que permitan una comparacion cuantitativa con modelos de otros fabricantes del mismo rango de parametros.

## Limitaciones y advertencias

- Modelo decensurado: los tags abliterated, uncensored y heretic indican que los mecanismos de rechazo han sido eliminados o atenuados. No es apto para aplicaciones de cara al usuario sin una capa externa de moderacion y filtrado.
- Etiqueta "research-only": la propia publicacion la clasifica como uso de investigacion. Esto condiciona tanto el uso previsto como, potencialmente, los terminos de la licencia.
- Licencia no estandar: swift-open-license-1.0 es una licencia propietaria con el campo license: other. Es imprescindible leer el texto enlazado antes de cualquier uso comercial; no se puede asumir permisividad tipo Apache 2.0 o MIT.
- Idioma: solo ingles declarado. El rendimiento en castellano u otras lenguas no esta documentado y es probable que sea sensiblemente inferior.
- Cuantizacion agresiva: las variantes Q2_K y Q3_K_x degradan la calidad de forma notable (el propio autor marca Q3_K_M como "lower quality"). Para tareas de razonamiento o codigo en produccion, usar Q4_K_M o superior.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion. En un modelo decensurado, el riesgo de afirmaciones incorrectas o daninas sin advertir es mayor.
- Sesgos: no se han publicado analisis de sesgo. Al derivar de Qwen3.8 y estar afinado principalmente en ingles, es esperable un sesgo hacia contenido y contexto angloparlante.
- Sin datos de contexto ni de arquitectura confirmada: no se puede planificar un despliegue con ventanas largas ni estimar con precision el coste de cache KV.
- Cero traccion en el momento de la consulta: 0 descargas y 0 likes. No hay comunidad que haya validado el comportamiento de estas cuantizaciones concretas.
- Repositorio pesado: 190,8 GB en total, lo que exige planificar el espacio en disco y descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-GGUF
- Modelo base de este repositorio: https://huggingface.co/akumaburn/Swift-1.5-Qwen3.8-27b-heretic
- Modelo original de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Pagina de resultados de UkisAI: https://ukisai.com/swift-1-5-27b
- Ficha en LLM Explorer (VRAM 55,6 GB): https://llm-explorer.com/model/ukisai%2FSwift-1.5-Qwen3.8-27b,3jHOVbzg1EPZp5GUvwUGrh
- Despliegue gestionado en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Variante i1-GGUF relacionada: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-BF16-i1-GGUF
- Variante Swift 1.0 heretic: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-heretic-GGUF
- Indice de modelos de mradermacher: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-heretic-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
