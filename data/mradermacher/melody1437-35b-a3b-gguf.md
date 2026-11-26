# mradermacher/Melody1437-35B-A3B-GGUF

## Resumen

Melody1437-35B-A3B es un modelo de lenguaje de gran tamano afinado para roleplay y conversacion, desarrollado por ReadyArt y distribuido en formato GGUF por mradermacher. Se trata de un fine-tune sobre una arquitectura tipo Qwen 3.6, con 35.505.251.456 parametros totales (35,5 mil millones) y un esquema de mezcla de expertos (MoE) que activa aproximadamente 3 mil millones de parametros por token, segun indica el sufijo A3B del nombre. El modelo esta orientado explicitamente a conversacion instructiva, roleplay y contenido para adultos, y se distribuye con licencia Apache 2.0.

La relevancia de esta ficha radica en que el repositorio original de ReadyArt solo publica pesos en formato transformers, mientras que mradermacher ofrece una bateria completa de cuantizaciones GGUF estaticas (desde Q2_K hasta Q8_0, mas variantes IQ) que permiten ejecutar un modelo de 35,5 mil millones de parametros en hardware de consumo. El repositorio incluye ademas ficheros mmproj, lo que sugiere capacidades multimodales (vision) en el modelo base, aunque la model card no las documenta.

El modelo esta etiquetado como "unaligned" y "not-for-all-audiences", lo que implica que no ha pasado por un proceso de alineamiento de seguridad convencional y que su uso esta pensado para entornos controlados. La informacion tecnica publicada es escasa: no se detallan datos de entrenamiento, longitud de contexto ni resultados de benchmarks, por lo que esta ficha distingue explicitamente entre datos verificados y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen 3.6 (segun tag del autor); detalles no disponibles |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | aproximadamente 3 B (inferido del sufijo A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; variantes imatrix en repositorio i1-GGUF; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo base es ReadyArt/Melody1437-35B-A3B, un fine-tune etiquetado con la familia "qwen3.6" y disenado para roleplay, conversacion instructiva y contenido explicito para adultos. La nomenclatura 35B-A3B indica una arquitectura de mezcla de expertos con 35,5 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.).

El trabajo de mradermacher consiste exclusivamente en la conversion y cuantizacion estatica de los pesos originales a formato GGUF, con metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. El repositorio incluye ficheros mmproj (Q8_0 de 0,7 GB y f16 de 1,0 GB), lo que apunta a un componente multimodal de vision heredado del modelo base, aunque la model card no describe su funcionamiento ni su calidad. Existe ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (i1-GGUF), que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y personajes.
- Modo instructivo: el tag "instruct" sugiere adherencia a instrucciones, aunque no se documenta el formato de prompt.
- Contenido explicito para adultos (tags nsfw, explicit, erp, mature), sin filtros de alineamiento convencionales (tag "unaligned").
- Capacidades multimodales potenciales: la presencia de ficheros mmproj indica soporte de entrada de imagenes en el modelo base, no documentado en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking: no disponible.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado especificamente para mantener personajes coherentes en dialogos multi-turno; su naturaleza MoE con 3 B activos permite generar respuestas fluidas con coste de computo contenido en comparacion con un denso de 35 B.
- Desarrollo de personajes para videojuegos y narrativa interactiva: puede integrarse en motores de dialogo para generar respuestas de NPC con personalidad consistente, ejecutandose localmente en una estacion de trabajo con GPU de consumo mediante Q4_K_M.
- Investigacion sobre alineamiento y seguridad: al estar etiquetado como "unaligned" y sin filtros, sirve como caso de estudio para evaluar comportamientos no alineados y disenar contramedidas en pipelines de moderacion.
- Generacion de ficcion y escritura creativa para adultos: el fine-tune esta orientado a contenido explicito, por lo que encaja en plataformas de ficcion interactiva que requieran este tipo de material con control de acceso.
- Prototipado de asistentes conversacionales en ingles: con cuantizaciones Q4_K_S (20,5 GB) o Q4_K_M (21,8 GB) puede desplegarse en llama.cpp u Ollama para pruebas de concepto de chat sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes GGUF mas las imatrix, lo que permite medir el impacto de la cuantizacion en la perplejidad y la calidad conversacional sobre un mismo modelo base.
- Experimentacion multimodal: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp, aunque la calidad y el alcance de esta capacidad no estan documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV): Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. A estas cifras hay que sumar el espacio de cache KV, no cuantificado en la informacion disponible.
- GPU recomendadas: para Q8_0 y Q6_K, una A100 40 GB o H100; para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; para Q3_K_M e inferiores, GPU de 16-20 GB como RTX 4080 o RTX 4070 Ti Super.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha; para esos motores habria que usar los pesos safetensors del repositorio base.
- Latencia y throughput estimados: no disponibles. Al ser MoE con ~3 B activos, el throughput por token deberia ser sustancialmente mayor que el de un denso de 35 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Melody1437-35B-A3B (este) | 35,5 B | ~3 B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune de roleplay/NSFW sin alinear |
| Qwen3-30B-A3B | 30,5 B | ~3 B (MoE) | 32k-128k (segun variante) | Apache 2.0 | safetensors, GGUF | Modelo base generalista de la misma familia; contexto y benchmarks publicados |
| Mixtral 8x7B | 46,7 B | ~12,9 B (MoE) | 32k | Apache 2.0 | safetensors, GGUF | MoE generalista; mayor coste de inferencia por mas parametros activos |
| Llama 3.1 8B Instruct | 8 B | 8 B (denso) | 128k | Llama 3.1 Community | safetensors, GGUF | Menor capacidad pero mucho mas ligero; alineado para uso general |

La comparacion con Qwen3-30B-A3B es la mas directa por familia y esquema MoE, pero no se dispone de datos que confirmen que Melody1437 derive exactamente de ese checkpoint ni de resultados comparativos de rendimiento.

## Limitaciones y advertencias

- Contenido para adultos y potencialmente explicito: el modelo esta etiquetado como nsfw, explicit y not-for-all-audiences; no es adecuado para aplicaciones de cara al publico sin moderacion y control de edad.
- Modelo "unaligned": no ha pasado por un proceso de alineamiento de seguridad convencional, por lo que puede producir contenido danino, sesgado u ofensivo sin las salvaguardas habituales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un fine-tune de roleplay, la prioridad del entrenamiento probablemente no sea la precision factual.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de la normativa aplicable en materia de contenido para adultos.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad conversacional, lo que dificulta comparar su rendimiento real.
- Capacidad multimodal no documentada: los ficheros mmproj existen, pero se desconoce que tareas de vision soporta el modelo y con que calidad.
- Repositorio de 244,4 GB: la descarga completa es costosa; conviene bajar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Melody1437-35B-A3B-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/Melody1437-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Pagina de descargas del autor: https://hf.tst.eu/model#Melody1437-35B-A3B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
