# bartowski/nex-agi_Nex-N2.5-mini-GGUF

## Resumen

Nex-N2.5-mini-GGUF es la version cuantizada en formato GGUF del modelo Nex-N2.5-mini, publicado por nex-agi y cuantizado por bartowski. El repositorio analizado no contiene los pesos originales, sino una coleccion de ficheros GGUF generados con llama.cpp (release b10896) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LocalAI, LM Studio u otros runtimes compatibles con este formato. El modelo declarado tiene 34.660.610.688 parametros (unos 34,66 B; la model card del cuantizador redondea a 35B) y esta publicado bajo licencia Apache 2.0.

La caracteristica mas relevante es que el pipeline declarado es image-text-to-text: se trata de un modelo multimodal que acepta texto e imagen, siempre que se cargue junto al fichero de proyector multimodal (mmproj) que acompana a los GGUF. El modelo trabaja con una plantilla de chat tipo ChatML, con prefill de la etiqueta de razonamiento (`<think>`) en el turno del asistente, lo que indica un modo de pensamiento explicito antes de la respuesta final. Los ficheros cuantizados cubren desde bf16 (69,38 GB) hasta IQ2_M (por debajo de 14 GB), lo que permite desplegarlo tanto en una sola GPU de gama alta como en equipos con 16 GB de memoria unificada o VRAM.

En el momento de la consulta, el repositorio acumula 20.403 descargas y 10 "likes", con una ventana de publicacion muy reciente (creado y actualizado el 11 de septiembre de 2026). Es, por tanto, una opcion pensada para inferencia local y autoalojada de un modelo multimodal de ~35B, no para entrenamiento ni ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion solo declara pipeline image-text-to-text y el uso de un proyector multimodal mmproj) |
| Parametros totales | 34.660.610.688 (~34,66 B; la model card del cuantizador indica 35B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M (la lista proporcionada esta truncada en IQ2_M) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Cuantizador | bartowski |
| Modelo base | nex-agi/Nex-N2.5-mini |
| Herramienta de cuantizacion | llama.cpp release b10896 |
| imatrix | si (calibracion con importance matrix) |
| Decodificacion especulativa | no |
| Modalidades de entrada | texto e imagen (imagen requiere fichero mmproj) |
| Plantilla de prompt | ChatML con `<|im_start|>` / `<|im_end|>` y apertura de `<think>` en el turno del asistente |
| Tamano del repositorio | 537,5 GB |
| Descargas / likes | 20.403 / 10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: no se especifica si se trata de un transformer denso, un Mixture of Experts, un modelo hibrido ni el numero de capas, cabezas de atencion o dimension oculta. Lo unico confirmado es el pipeline image-text-to-text, que implica un codificador o proyector visual acoplado a un modelo de lenguaje, distribuido como fichero mmproj independiente en el ecosistema GGUF. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u optimizacion por preferencias.

En cuanto al proceso de cuantizacion, que es lo que realmente aporta este repositorio, bartowski ha generado las cuantizaciones con llama.cpp b10896 aplicando importance matrix (imatrix), una tecnica que pondera los pesos en funcion de su impacto en la perdida durante la calibracion y que suele reducir la degradacion en cuantizaciones agresivas (Q4 e inferiores). El modelo no usa decodificacion especulativa. La lista de ficheros incluye variantes "K_L" (Q4_K_L, Q6_K_L) que mantienen a mayor precision los pesos mas sensibles, y variantes IQ (IQ4_NL, IQ3_M, IQ3_XS, IQ3_XXS, IQ2_M) que emplean cuantizacion con codebooks para mejorar la relacion calidad/tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla ChatML y soporte de mensaje de sistema.
- Razonamiento explicito previo a la respuesta: la plantilla precarga `<think>` en el turno del asistente, lo que apunta a un modo de pensamiento (thinking mode) que genera trazas de razonamiento antes de la contestacion final.
- Entrada de imagenes: el modelo acepta texto e imagen cuando se carga el proyector multimodal (mmproj) junto a los pesos GGUF. La galeria de LocalAI senala que el build GGUF incluye el proyector de vision en F16 y plantilla de chat embebida.
- Capacidades multimodales derivadas del pipeline image-text-to-text: descripcion de imagenes, respuesta a preguntas sobre imagenes y conversacion mixta texto-imagen (el alcance exacto no esta documentado en la informacion disponible).
- Compatibilidad con endpoints y despliegue autoalojado: los tags incluyen `endpoints_compatible` y `conversational`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo de pensamiento es un indicio de capacidad de razonamiento encadenado.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional autoalojado: desplegando Q4_K_M (22,32 GB) en una GPU de 24 GB se puede servir un chat multi-turno con plantilla ChatML y mensaje de sistema, sin enviar datos a terceros, algo relevante para entornos con requisitos de soberania del dato.
- Analisis de documentos con imagenes: gracias al pipeline image-text-to-text y al fichero mmproj, se pueden enviar capturas, diagramas o fotografias junto a una pregunta de texto para extraer informacion estructurada, por ejemplo en digitalizacion de formularios o revision de incidencias.
- Generacion de respuestas con traza de razonamiento: el prefill de `<think>` permite obtener la cadena de razonamiento y la respuesta final por separado, util en entornos educativos o en sistemas donde se quiere auditar como se ha llegado a una conclusion.
- Inferencia en equipos de gama de consumo: con IQ4_XS (19,89 GB) o Q3_K_M (17,34 GB) el modelo cabe en GPUs de 20-24 GB, y con Q2_K (13,84 GB) o IQ2_M en equipos de 16 GB, lo que habilita prototipado local sin coste de API.
- Despliegue en estaciones de trabajo Apple Silicon: las cuantizaciones Q4_1 se describen en la propia model card como con mejor rendimiento en tokens/vatio en Apple silicon, lo que las hace adecuadas para Mac con memoria unificada suficiente.
- Procesamiento por lotes en servidor con llama.cpp o LocalAI: el repositorio es compatible con la instalacion via CLI de LocalAI (`local-ai models install nex-n2.5-mini-...`) y con llama.cpp, lo que facilita tareas de resumen, clasificacion o extraccion sobre volumenes grandes de texto en infraestructura propia.
- Integracion como backend de una interfaz de chat: la plantilla ChatML estandar permite conectar el modelo a frameworks de UI conversacional que ya soportan ese formato sin adaptaciones.
- Evaluacion comparativa de cuantizaciones: al ofrecer mas de veinte variantes del mismo modelo, el repositorio sirve para medir en produccion el compromiso entre tamano de fichero (de 13,84 GB a 69,38 GB) y calidad de salida sobre el mismo caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado tablas comparativas en los resultados de busqueda web. Como unico dato cualitativo externo, un hilo de r/LocalLLaMA sobre el modelo Nex-N2 Pro (variante superior de la misma familia, no esta version mini) comenta que el modelo tiende a consumir bastantes mas tokens de pensamiento que Qwen 3.5 y Rio, lo que sugiere respuestas con trazas de razonamiento largas y, por tanto, mayor coste de decodificacion. Es una impresion de comunidad, no una medicion reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del fichero de pesos, sin contar cache KV ni el proyector de vision): bf16 69,38 GB; Q8_0 36,91 GB; Q6_K_L 32,30 GB; Q6_K 29,37 GB; Q5_K_M 26,98 GB; Q5_K_S 25,14 GB; Q4_K_L 24,11 GB; Q4_K_M 22,32 GB; IQ4_NL 22,32 GB; Q4_1 21,97 GB; Q4_K_S 20,95 GB; Q4_0 19,94 GB; IQ4_XS 19,89 GB; IQ3_M 18,96 GB; Q3_K_L 18,27 GB; Q3_K_M 17,34 GB; IQ3_XS y Q3_K_S 16,32 GB; IQ3_XXS 15,58 GB; Q2_K 13,84 GB; IQ2_M por debajo de 13,84 GB.
- Margen adicional: hay que sumar la cache KV (proporcional a la longitud de contexto, que no se especifica) y el fichero mmproj del proyector de vision. En la practica, conviene reservar entre un 10 % y un 30 % adicional sobre el tamano del fichero.
- GPU de gama profesional: una A100 de 40 GB o una H100 de 80 GB cubren sin problemas hasta Q6_K; bf16 completo requiere 80 GB o repartir en dos aceleradores.
- Consumer GPU: Q4_K_M (22,32 GB) entra de forma ajustada en una RTX 4090 o RTX 3090 de 24 GB con contexto corto; IQ4_XS o Q3_K_M son opciones mas holgadas en ese mismo segmento. Para 16 GB de VRAM (RTX 4080, RTX 4070 Ti Super) son necesarias Q3 o Q2. En 12 GB o menos no cabe ninguna variante completa, salvo offload parcial a CPU o RAM.
- Memoria unificada: las cuantizaciones Q4_1 se describen como con mejor relacion tokens/vatio en Apple silicon; un Mac con 32 GB o mas de memoria unificada puede ejecutar Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp (b10896 o superior, formato nativo), Ollama, LocalAI (instalacion directa desde la galeria) y LM Studio. vLLM y TGI trabajan con safetensors, por lo que requeririan el repositorio del modelo base, no estos GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificables de especificaciones o rendimiento de modelos comparables en la informacion proporcionada. La unica referencia externa encontrada es un hilo de comunidad sobre Nex-N2 Pro, variante superior de la misma familia, que lo compara cualitativamente con Qwen 3.5 y con Rio en consumo de tokens de pensamiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparables |
|---|---|---|---|---|---|
| Nex-N2.5-mini (este, cuantizado GGUF) | ~34,66 B | no disponible | apache-2.0 | GGUF en HuggingFace, LocalAI, llama.cpp | 20.403 descargas, 10 likes |
| Nex-N2 Pro (familia, mencionado en foros) | no disponible | no disponible | no disponible | no disponible | solo comentario cualitativo sobre tokens de pensamiento |
| Qwen 3.5 (mencionado como referencia en foros) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Rio (mencionado como referencia en foros) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado cifras de parametros, contexto ni benchmarks que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de vision en la informacion disponible, por lo que el rendimiento real es desconocido y debe validarse en el caso de uso concreto antes de llevarlo a produccion.
- Ficha tecnica incompleta: no se documentan arquitectura, longitud de contexto, idiomas soportados, datos de entrenamiento ni proceso de alineacion. Esto dificulta estimar el coste de la cache KV y planificar el dimensionamiento del servidor.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible; al ser un modelo con trazas de razonamiento largas, una traza plausible no garantiza que la respuesta final sea correcta.
- Consumo elevado de tokens de pensamiento: segun comentarios de comunidad sobre la variante Pro de la familia, el modelo genera bastantes mas tokens de razonamiento que alternativas como Qwen 3.5 o Rio, lo que incrementa latencia y coste por consulta si no se limita la longitud de la traza.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, modificacion y redistribucion con obligacion de conservar avisos de copyright y licencia. Conviene verificar la licencia del modelo base nex-agi/Nex-N2.5-mini, ya que la cuantizacion hereda sus terminos.
- Degradacion por cuantizacion: las variantes por debajo de Q4 (Q3, IQ3, Q2, IQ2) pierden calidad de forma apreciable; la propia model card desaconseja Q3_K_S. Para tareas sensibles al razonamiento o al detalle visual, usar Q5_K_M o superior.
- Requisitos de memoria del repositorio completo: 537,5 GB; descargar el repositorio entero no es viable en la mayoria de equipos. Hay que seleccionar un unico fichero GGUF.
- Multimodalidad condicionada: sin el fichero mmproj correspondiente el modelo solo procesa texto. Verificar la compatibilidad del proyector con la version de llama.cpp utilizada.
- Idiomas no declarados: no hay garantia de buen rendimiento en castellano ni en otros idiomas distintos del ingles, dado que no se especifica la composicion del corpus.
- Fecha de publicacion reciente y adopcion moderada: 10 likes y 20.403 descargas indican un modelo poco contrastado por la comunidad, con menor soporte y menos casos documentados que alternativas consolidadas.
- Modelo base no verificado en esta busqueda: la informacion disponible se limita a la model card del cuantizador; no se han podido confirmar detalles tecnicos desde la ficha original de nex-agi.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Fichero Q4_K_M (recomendado por el autor): https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_K_M.gguf
- Pesos bf16: https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/tree/main/nex-agi_Nex-N2.5-mini-bf16
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Release b10896 de llama.cpp usada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b10896
- Galeria de modelos de LocalAI (menciona nex-n2.5-mini y el proyector de vision F16): https://localai.io/docs/gallery.html
- Hilo de r/LocalLLaMA sobre Nex-N2 Pro: https://www.reddit.com/r/LocalLLaMA/comments/1u78mx6/nexn2_pro_is_the_real_deal/
