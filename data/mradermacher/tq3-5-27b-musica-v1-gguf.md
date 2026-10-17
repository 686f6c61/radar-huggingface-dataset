# mradermacher/TQ3.5-27B-Musica-v1-GGUF

## Resumen

`mradermacher/TQ3.5-27B-Musica-v1-GGUF` es una recopilación de cuantizaciones en formato GGUF del modelo `AuriAetherwiing/TQ3.5-27B-Musica-v1`, publicada por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original a un formato optimizado para inferencia en CPU y GPU con herramientas como llama.cpp, Ollama o LM Studio. El modelo base tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y está orientado a generación de texto conversacional en inglés.

El interés de esta ficha reside en que el modelo subyacente parece un fine-tune especializado en rol (roleplay), narrativa y escritura creativa: los catorce conjuntos de datos declarados en la model card son casi en su totalidad corpus de personajes, anime, ficción interactiva, novelas con cadena de pensamiento y destilaciones de modelos como Claude, DeepSeek, Gemini, Kimi y Doubao. Esto lo sitúa en la categoría de modelos "RP/creative writing", no en la de asistentes generalistas o modelos de razonamiento y código.

La relevancia práctica es doble: por un lado, ofrece un abanico amplio de niveles de compresión (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB) que permite ejecutar un modelo de ~27B en hardware de consumo; por otro, incluye ficheros `mmproj` que apuntan a soporte multimodal de entrada, algo poco habitual en modelos de este tamaño orientados a rol. La licencia declarada es Apache 2.0 y el idioma soportado oficialmente es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; los tags de transformers y el formato GGUF indican un transformer decoder-only, sin confirmacion explicita) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (mas ficheros mmproj en GGUF para el componente multimodal) |
| Modelo base | AuriAetherwiing/TQ3.5-27B-Musica-v1 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 187,9 GB |
| Fecha de creacion | 2026-03-27 |
| Ultima actualizacion | 2026-10-16 |
| Descargas | 475 |
| Likes | 0 |
| Libreria declarada | transformers |
| Compatibilidad con endpoints | si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La model card de esta publicacion no describe la arquitectura del modelo subyacente: se limita a indicar que es una cuantizacion estatica de `AuriAetherwiing/TQ3.5-27B-Musica-v1` y a listar los conjuntos de datos del modelo base. El nombre "TQ3.5-27B" sugiere una familia con version 3.5 y un tamano de 27B, pero no hay confirmacion en la informacion disponible sobre si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o preferencias.

Lo que si se puede inferir del listado de datasets es el perfil de entrenamiento: `EVA-UNIT-01/Lilith-v0.3`, `Gryphe/Sonnet3.5-Charcard-Roleplay`, `Gryphe/ChatGPT-4o-Writing-Prompts`, `ToastyPigeon/kimi-rp-v3`, `ToastyPigeon/kimi-stories-instruct`, `ToastyPigeon/fujin-filtered-instruct`, `zerofata/Instruct-Anime`, `zerofata/Anime-AMA-Prose`, `zerofata/Gemini-3.1-Pro-GLM5-Characters`, `Delta-Vector/Orion-Deepseek-V3-RP-Filtered`, `Delta-Vector/Orion-Deepseek-R1-RP-Filtered`, `allura-forge/mimo-v2-pro-claude-distill-hs3`, `allura-forge/doubao-seed2.0-distill-multiturn-expr-rp` y `Dxniz/Novelist-CoT`. Se trata de un corpus de ajuste fino centrado en roleplay multi-turno, tarjetas de personaje, prosa de anime, destilacion de expresividad conversacional y escritura de novelas con cadena de pensamiento. No hay informacion sobre innovaciones tecnicas de atencion, decodificacion especulativa ni estrategias de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogo multi-turno.
- Roleplay e interpretacion de personajes, incluyendo el formato de tarjetas de personaje habitual en comunidades de rol.
- Escritura creativa y narrativa: prosa, ficcion serializada, fan fiction y textos de estilo anime.
- Generacion de prompts de escritura y continuaciones narrativas.
- Razonamiento expresado como cadena de pensamiento aplicada a narrativa (el dataset `Dxniz/Novelist-CoT` apunta a este uso), no verificado como razonamiento logico general.
- Entrada multimodal: el repositorio incluye ficheros `mmproj-Q8_0` y `mmproj-f16`, descritos como "multi-modal supplement", lo que indica soporte de proyeccion visual en el modelo base; la model card no detalla que modalidades ni con que calidad.
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, no se menciona.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de codigo o matematicas: no documentadas.

## Casos de uso

- Roleplay con personajes persistentes: el modelo esta ajustado sobre corpus de tarjetas de personaje y conversaciones multi-turno, por lo que resulta adecuado para mantener una persona consistente a lo largo de sesiones largas, siempre que la ventana de contexto lo permita.
- Escritura asistida de ficcion: generacion y continuacion de escenas narrativas, con control de estilo gracias al ajuste sobre prosa de anime y novelas.
- Prototipado de dialogos para videojuegos y visual novels: permite generar variantes de dialogo de PNJ de forma masiva y filtrar despues, a un coste de inferencia bajo en cuantizaciones Q4.
- Ficcion interactiva local con privacidad: al ser un GGUF ejecutable en llama.cpp u Ollama, todo el texto permanece en la maquina del usuario, lo que encaja en escenarios de escritura personal o datos sensibles.
- Descripcion narrativa de imagenes: con los ficheros `mmproj` cargados, el modelo puede incorporar una imagen como entrada y generar texto descriptivo o narrativo alrededor de ella, aunque la calidad no esta documentada.
- Generacion de material para comunidades de rol: creacion de fichas, trasfondos y arcos argumentales a partir de unos pocos rasgos iniciales.
- Investigacion sobre modelos destilados para estilo: al entrenarse sobre destilaciones de Claude, DeepSeek, Gemini, Kimi y Doubao, sirve como objeto de estudio de como se transfiere el estilo conversacional entre modelos.
- Experimentacion con cuantizacion: el repositorio permite comparar en la practica el efecto de Q2_K frente a Q8_0 sobre la coherencia narrativa en un mismo modelo, algo util para trabajos de evaluacion de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones especificas de roleplay en la model card ni en los metadatos del repositorio. Cualquier cifra que se cite para este modelo deberia obtenerse de una evaluacion propia.

## Requisitos de hardware

Los tamanos de VRAM son estimaciones a partir del tamano de fichero declarado en el repositorio, anadiendo entre 1,5 y 2 GB de margen para cache KV y buffers con un contexto moderado. No se han publicado mediciones de latencia ni de throughput.

| Cuantizacion | Peso (GB) | VRAM estimada (GB) | Cabe en GPU de 24 GB |
|---|---|---|---|
| Q2_K | 10,8 | ~12,5-13 | si |
| Q3_K_S | 12,2 | ~14 | si |
| Q3_K_M | 13,4 | ~15 | si |
| Q3_K_L | 14,4 | ~16 | si |
| IQ4_XS | 15,3 | ~17 | si |
| Q4_K_S | 15,7 | ~17,5 | si |
| Q4_K_M | 16,6 | ~18,5 | si |
| Q5_K_S | 18,8 | ~20,5 | si |
| Q5_K_M | 19,3 | ~21 | al limite |
| Q6_K | 22,2 | ~24 | al limite, con contexto corto |
| Q8_0 | 28,7 | ~30,5 | no |
| mmproj-Q8_0 | 0,7 | +0,7 si se usa vision | si |
| mmproj-f16 | 1,0 | +1,0 si se usa vision | si |

- GPU de 24 GB (RTX 3090, RTX 4090, A5000): ejecutan con holgura hasta Q4_K_M; Q5_K_M y Q6_K son viables reduciendo contexto o con offloading parcial.
- GPU de 48 GB (2x RTX 4090, A6000, L40S): Q8_0 sin problemas, y margen para contexto largo.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB): hasta IQ4_XS o Q4_K_S con contexto recortado; Q4_K_M requiere offloading.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): Q2_K y Q3_K_S, normalmente con descarga de capas a RAM.
- Solo CPU: viable con llama.cpp y al menos 32 GB de RAM para Q4_K_M, 64 GB recomendables para Q8_0 y contexto amplio.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, koboldcpp, Jan, text-generation-webui y `llama-cpp-python`. Para el checkpoint original en safetensors, vLLM o TGI; el soporte de GGUF en vLLM es parcial y no esta garantizado para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de contexto de modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas de terceros. La comparacion factible es entre las distintas publicaciones del mismo modelo:

| Version | Formato | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/TQ3.5-27B-Musica-v1-GGUF (esta) | GGUF estatico, 13 variantes | ~26,9B | no disponible | apache-2.0 | publica en HuggingFace, 475 descargas |
| mradermacher/TQ3.5-27B-Musica-v1-i1-GGUF | GGUF con imatrix (ponderado) | ~26,9B | no disponible | apache-2.0 | publica en HuggingFace |
| AuriAetherwiing/TQ3.5-27B-Musica-v1 | safetensors (transformers) | ~26,9B | no disponible | apache-2.0 | publica en HuggingFace |

La variante i1 (imatrix) suele ofrecer mejor calidad por bit que las cuantizaciones estaticas equivalentes, a cambio de ficheros algo mayores y de un proceso de generacion mas costoso. Para modelos de rol y narrativa, la diferencia se aprecia sobre todo en coherencia a partir de Q4.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el ingles. El rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Especializacion estrecha: el ajuste sobre corpus de rol y anime puede reducir el rendimiento en tareas de instruccion general, razonamiento logico, matematicas o codigo respecto al modelo del que derive.
- Riesgo de alucinacion: es un modelo de generacion creativa sin capa de verificacion; en contextos factuales puede producir afirmaciones inventadas con total fluidez.
- Degradacion por cuantizacion: Q2_K y Q3_K_S son las variantes mas agresivas y el propio autor marca Q3_K_M como "lower quality". Para produccion conviene Q4_K_M o superior.
- Sesgos: los corpus de roleplay y anime reproducen estereotipos de genero, culturales y de representacion presentes en sus fuentes originales. No hay evaluacion de sesgos publicada.
- Procedencia de los datos de entrenamiento: los datasets incluyen destilaciones de modelos propietarios (Claude, GPT-4o, Gemini, DeepSeek, Kimi, Doubao). La licencia Apache 2.0 se declara sobre el modelo, pero la trazabilidad y las condiciones de uso de esos datos destilados no se documentan y conviene revisarlas antes de un uso comercial.
- Contenido para adultos: la combinacion de datasets de rol y ficcion sugiere que el modelo puede generar contenido no apto para todos los publicos. No hay filtros documentados.
- Ausencia de benchmarks: no existe ninguna evaluacion publicada que respalde afirmaciones de calidad frente a alternativas.
- Adopcion minima: 475 descargas y 0 likes indican una comunidad practicamente inexistente, con poca validacion independiente.
- Sin datos de contexto: al no especificarse la longitud de contexto, cualquier despliegue en produccion requiere medirla empiricamente antes de dimensionar la cache KV.
- Compatibilidad de vision no verificada: los ficheros `mmproj` existen, pero no se documenta que version de llama.cpp los soporta correctamente ni con que calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TQ3.5-27B-Musica-v1-GGUF
- Modelo base: https://huggingface.co/AuriAetherwiing/TQ3.5-27B-Musica-v1
- Variante con imatrix: https://huggingface.co/mradermacher/TQ3.5-27B-Musica-v1-i1-GGUF
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#TQ3.5-27B-Musica-v1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador de las cuantizaciones, nethype GmbH: https://www.nethype.de/
