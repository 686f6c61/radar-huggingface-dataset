# mradermacher/For-Her-Darkside-26B-A4B-v1.4-GGUF

## Resumen

For-Her-Darkside-26B-A4B-v1.4 es un modelo de lenguaje orientado a roleplay y conversacion para adultos, distribuido como cuantizaciones GGUF estaticas por mradermacher a partir del modelo base ReadyArt/For-Her-Darkside-26B-A4B-v1.4. El repositorio no contiene los pesos originales en safetensors, sino un conjunto de ficheros GGUF listos para inferencia con llama.cpp y derivados. El modelo se etiqueta como derivado de la familia Gemma 4 y presenta 25.233.142.046 parametros totales (unos 25,2 mil millones), con una nomenclatura "A4B" que sugiere arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos, aunque el autor no documenta explicitamente la arquitectura.

La relevancia de esta ficha es doble: por un lado, muestra un caso de cuantizacion estatica de un modelo de 26B con variantes multimodales (mmproj); por otro, ilustra el ecosistema de modelos "unaligned" para roleplay, con licencia Apache 2.0 y contenido explicitamente marcado como NSFW y no apto para todas las audiencias. La model card del cuantizador es puramente operativa (tabla de ficheros y notas de uso) y no incluye informacion sobre entrenamiento, contexto o benchmarks.

No se dispone de datos sobre longitud de contexto, composicion del dataset de entrenamiento, tecnicas de alineamiento ni evaluaciones de rendimiento en la informacion proporcionada. Todo lo que sigue se limita a lo verificable en el repositorio de Hugging Face y en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma-4; nomenclatura "A4B" sugiere MoE con ~4B activos, no confirmado) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin confirmacion del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El repositorio es una coleccion de cuantizaciones estaticas generadas por mradermacher a partir de ReadyArt/For-Her-Darkside-26B-A4B-v1.4. La model card indica "quantize_version: 2", "output_tensor_quantised: 1" y "convert_type: hf", lo que implica una conversion desde pesos Hugging Face a GGUF y una cuantizacion por tensores de salida. Se ofrecen tanto cuantizaciones K-quant clasicas como IQ4_XS, ademas de un modulo multimodal (mmproj) en Q8_0 y f16, lo que confirma que el modelo base incorpora capacidad de vision.

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas de atencion. El tag "unaligned" sugiere que el modelo base no ha pasado por un proceso de alineamiento restrictivo orientado a seguridad, algo coherente con su enfoque a roleplay explicito. La etiqueta gemma-4 apunta a una base de la familia Gemma, pero no se documenta la variante concreta ni el proceso de fine-tuning. Existe una version con cuantizaciones ponderadas/imatrix publicada por el mismo autor en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Contenido explicito para adultos (ERP, NSFW), segun los tags del repositorio.
- Procesamiento multimodal: la presencia de ficheros mmproj indica soporte de entrada de imagenes en el modelo base.
- Modo instruct/conversational, segun los tags del repositorio.
- Capacidad multilingue limitada al ingles segun el campo language.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta disenado para mantener personajes y narrativa multi-turno; las cuantizaciones Q5_K_M y Q6_K conservan mejor los matices estilisticos necesarios para la coherencia de personaje.
- Generacion de ficcion interactiva para adultos: adecuado para plataformas de narrativa ramificada donde se requiere contenido explicito y un tono no restrictivo, con la advertencia de que debe desplegarse tras verificacion de edad.
- Prototipado de personajes con entrada de imagen: el modulo mmproj permite describir o reaccionar a imagenes dentro de una conversacion de roleplay (por ejemplo, interpretar una escena visual).
- Investigacion sobre modelos "unaligned": util para estudiar el comportamiento de modelos sin alineamiento restrictivo en tareas creativas y comparar con variantes alineadas.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (15,6 GB) y Q4_K_M (16,9 GB) permiten ejecucion en GPUs de consumo alto o en configuraciones CPU+GPU con llama.cpp.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece un espectro amplio (de Q2_K a Q8_0) para medir la degradacion de calidad en tareas generativas subjetivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,4 GB; Q3_K_L ~13,9 GB; IQ4_XS ~14,2 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_S ~18,1 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. A estas cifras hay que sumar el modulo mmproj (0,9 GB en Q8_0 o 1,3 GB en f16) si se usa vision, y el espacio de cache KV segun contexto.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q6_K, una RTX 4090 de 24 GB o A100 40 GB; para Q4_K_M, una RTX 4090 o RTX 3090 de 24 GB con margen para contexto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones de Q2_K a Q6_K; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo TGI/vLLM aunque no se detalla.
- Latencia y throughput: no disponibles. Al ser un modelo de ~25B con posible activacion parcial (~4B), el throughput deberia ser superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| For-Her-Darkside-26B-A4B-v1.4 (este) | ~25,2B (posible MoE ~4B activos) | no disponible | Apache 2.0 | GGUF | Roleplay adulto, multimodal via mmproj |
| Modelo base ReadyArt/For-Her-Darkside-26B-A4B-v1.4 | ~25,2B | no disponible | Apache 2.0 | safetensors | Pesos originales, sin cuantizar |
| Version imatrix (mradermacher -i1-GGUF) | ~25,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria documentados en la informacion proporcionada; la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Contenido explicitamente NSFW y para adultos; no apto para menores ni para despliegues sin verificacion de edad.
- Modelo etiquetado como "unaligned": no ha pasado por un proceso de alineamiento orientado a seguridad, por lo que puede producir contenido ofensivo o inapropiado fuera de contextos de roleplay.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas.
- Soporte unicamente en ingles segun el campo language; el rendimiento en castellano no esta documentado.
- Longitud de contexto desconocida; no se puede garantizar coherencia en conversaciones muy largas.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido explicito puede estar sujeto a normativa local y a las politicas de las plataformas de distribucion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad en tareas generativas subjetivas; para roleplay se recomienda Q5_K_M o superior.
- El repositorio pesa 184,9 GB en total; la descarga de todas las variantes no es practica y conviene seleccionar un unico fichero.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/For-Her-Darkside-26B-A4B-v1.4-GGUF
- Modelo base: https://huggingface.co/ReadyArt/For-Her-Darkside-26B-A4B-v1.4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/For-Her-Darkside-26B-A4B-v1.4-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#For-Her-Darkside-26B-A4B-v1.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
