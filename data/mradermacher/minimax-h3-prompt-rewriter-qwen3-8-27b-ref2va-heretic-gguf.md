# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF es la distribucion en formato GGUF del modelo MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic, una variante "abliterated" (decensored) del reescritor de prompts Ref2VA desarrollado originalmente por lightx2v sobre una base Qwen3.8 de 27 000 millones de parametros. El modelo resuelve una tarea muy concreta dentro de pipelines multimodales: reescribir y enriquecer prompts de entrada, presumiblemente para generacion de video o imagen (la nomenclatura Ref2VA sugiere referencia a video/audio), partiendo de referencias visuales. La version aqui descrita ha sido cuantizada por mradermacher, especialista en publicar pesos GGUF listos para llama.cpp y Ollama.

El modelo combina varias senales tecnicas: etiquetas de vision-language y multimodal, soporte declarado de MTP (multi-token prediction), y una base Qwen3.8 que hereda el conocimiento general y el multilingueismo de la familia Qwen. Su interes practico radica en que permite ejecutar localmente un modelo de 27B con capacidades de reescritura de prompts y vision en hardware de consumo, gracias a las cuantizaciones K-quant e IQ disponibles (desde 11 GB en Q2_K hasta 29,1 GB en Q8_0).

Ahora bien, conviene ser cauto: la model card del repositorio es practicamente una plantilla de cuantizacion de mradermacher y no documenta arquitectura, datos de entrenamiento ni benchmarks. Muchos datos tecnicos deben marcarse como no disponibles, y las capacidades inferidas (vision, MTP, tool calling) provienen unicamente de las etiquetas del repositorio, no de una ficha tecnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8); detalles no disponibles |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh (segun etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repositorio | 190,8 GB (incluye todas las cuantizaciones) |
| Libreria | transformers (modelo base); llama.cpp/Ollama para GGUF |
| Modelo base | funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Por las etiquetas y el nombre del modelo base se infiere una arquitectura transformer decoder-only derivada de Qwen3.8, con un componente de vision-language (los ficheros mmproj confirman un proyector multimodal) y soporte declarado de MTP (multi-token prediction). El modelo original fue publicado por lightx2v como reescritor de prompts Ref2VA; funnygeeker produjo la variante "heretic" mediante tecnicas de abliteration/decensoring, y mradermacher la cuantizo a GGUF.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF, DPO u otra fase de alineamiento. Tampoco se documenta la innovacion concreta del componente Ref2VA (presumiblemente reescritura de prompts condicionada por referencias visuales), por lo que cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion y reescritura de texto orientada a prompts (prompt rewriting), tarea principal del modelo.
- Procesamiento multimodal vision-language: incluye ficheros mmproj, lo que indica capacidad de procesar imagenes junto al texto.
- Soporte declarado de MTP (multi-token prediction), que puede acelerar la decodificacion segun la implementacion.
- Capacidades conversacionales multi-turno (etiqueta conversational).
- Multilingueismo limitado a ingles y chino segun las etiquetas del repositorio.
- Variante "abliterated/decensored": se ha reducido o eliminado el rechazo ante contenido sensible, lo que amplia el rango de prompts aceptados pero incrementa el riesgo de contenido inapropiado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).

## Casos de uso

- Enriquecimiento de prompts para generacion de video o imagen: el modelo reescribe prompts breves o ambiguos en descripciones detalladas y coherentes, aprovechando su entrenamiento especifico como prompt rewriter; se integraria como paso previo a un modelo generativo.
- Traduccion y adaptacion de prompts entre ingles y chino: al soportar ambos idiomas, puede normalizar prompts de usuario a un idioma canonico antes de enviarlos a un pipeline de generacion.
- Preprocesado en pipelines de difusion o video generativo: dado su caracter multimodal, puede recibir una imagen de referencia y producir el prompt textual correspondiente para un modelo de video (la nomenclatura Ref2VA apunta a este escenario).
- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M de 16,9 GB cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite iterar sin coste de API.
- Investigacion sobre alineamiento y decensoring: la variante heretic permite estudiar el comportamiento de modelos abliterated frente a sus originales, comparando tasas de rechazo y calidad.
- Generacion de descripciones de imagenes y etiquetado semiautomatico: el componente de vision permite producir texto descriptivo a partir de imagenes en tareas de catalogacion o accesibilidad.
- Experimentacion con MTP y decodificacion especulativa: util para evaluar el impacto del multi-token prediction en throughput dentro de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11 GB; Q3_K_M ~13,6 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Anadir 1-3 GB adicionales para el proyector multimodal (mmproj) y la cache KV segun contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 y contextos largos; multiples GPUs para f16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors requiere transformers. Para el modelo base sin cuantizar, vLLM o TGI serian las opciones habituales, aunque no se confirma compatibilidad explicita.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un 27B en Q4_K_M en una RTX 4090 suele moverse en el orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic (este) | 27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Reescritor de prompts multimodal, decensored |
| Qwen3.8-27B base (familia Qwen) | ~27B | no disponible | Apache 2.0 (segun familia) | safetensors | Modelo generalista del que deriva; sin fine-tuning de prompt rewriting |
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA (original de lightx2v) | 27,3B | no disponible | Apache 2.0 | safetensors | Version alineada, con rechazos ante contenido sensible |
| Variante i1-GGUF de mradermacher | 27,3B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La variante heretic/abliterated elimina o reduce los mecanismos de rechazo: puede generar contenido sensible, ofensivo o inapropiado sin filtros, lo que exige moderacion adicional en produccion.
- Riesgo de alucinacion inherente a los modelos de 27B; no hay evaluaciones publicadas de fidelidad en la tarea de reescritura de prompts.
- Idiomas limitados a ingles y chino segun las etiquetas; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se documenta la longitud de contexto soportada; asumir contextos largos sin verificacion puede provocar degradacion o errores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias (Qwen, MiniMax) deben verificarse por separado; el caracter decensored puede incumplir politicas de plataformas o requisitos regulatorios.
- La model card no documenta arquitectura, entrenamiento ni benchmarks: no hay garantias formales de calidad para casos de uso criticos.
- El repositorio ocupa 190,8 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- El componente multimodal requiere el fichero mmproj correspondiente; sin el, las capacidades de vision no funcionan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Modelo base (heretic): https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic
- Modelo original (lightx2v): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
