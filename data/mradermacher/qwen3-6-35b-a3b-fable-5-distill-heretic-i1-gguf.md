# mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF es una cuantizacion GGUF del modelo Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic, publicada por el usuario mradermacher. Se trata de una variante destilada de un modelo de arquitectura Mixture-of-Experts (MoE) de la familia Qwen3.6, con 34.660.610.688 parametros totales y la nomenclatura "A3B" que sugiere aproximadamente 3.000 millones de parametros activos por token. El modelo base incorpora tecnicas de destilacion con chain-of-thought, ajuste por DPO y un proceso de "abliteration" (etiquetado como "heretic") orientado a eliminar restricciones de rechazo, ademas de defensas declaradas contra inyeccion de prompts.

La relevancia de esta publicacion radica en que ofrece versiones cuantizadas con imatrix (importance matrix) en formato GGUF, lo que permite ejecutar un modelo MoE de ~35.000 millones de parametros totales en hardware de consumo, al mantener un coste computacional por token mas cercano al de un modelo denso de ~3.000 millones. La licencia Apache 2.0 facilita su uso comercial, aunque el caracter "uncensored" del modelo base introduce consideraciones de seguridad relevantes para produccion.

El repositorio incluye cuantizaciones i1 (imatrix) en varios niveles de compresion, desde i1-Q2_K (13,0 GB) hasta i1-IQ3_M (15,5 GB) en los enlaces mostrados, ademas del fichero imatrix para generar cuantizaciones propias. La model card indica que el modelo base es multimodal (vision), con ficheros mmproj alojados en el repositorio estatico complementario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; familia Qwen3.6 |
| Parametros totales | 34.660.610.688 (datos safetensors del modelo base) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (13,0 GB), i1-IQ3_M (15,5 GB), entre otras del catalogo completo (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Mixture-of-Experts dentro de la familia Qwen3.6, con 34.660 millones de parametros totales y un patron de activacion dispersa (denominado "A3B", que sugiere aproximadamente 3.000 millones de parametros activos). La model card del repositorio cuantizado no detalla la composicion exacta de los expertos, el numero de capas ni la dimension oculta. El entrenamiento declarado combina destilacion con chain-of-thought (etiquetas "distillation" y "chain-of-thought"), ajuste por DPO (etiqueta "dpo") y un proceso de abliteration ("heretic") que elimina direcciones de rechazo del espacio de activaciones. Adicionalmente, el modelo incorpora defensas contra inyeccion de prompts ("prompt-injection-defense").

La cuantizacion realizada por mradermacher utiliza importance matrix (imatrix) generada con el propio modelo, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas. El repositorio ofrece tanto la matriz imatrix como las cuantizaciones i1 derivadas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo chain-of-thought (etiquetas "reasoning" y "chain-of-thought").
- Destilacion de razonamiento: el modelo ha sido entrenado para reproducir trazas de razonamiento de un modelo mayor.
- Capacidades multimodales (vision): la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion, pero plausible por la familia Qwen3.6.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "uncensored": el proceso heretic elimina rechazos, permitiendo generar contenido que modelos alineados rechazarian.
- Defensa declarada contra inyeccion de prompts.

## Casos de uso

- Razonamiento con cadena de pensamiento en local: el modelo puede ejecutarse en hardware de consumo gracias a su naturaleza MoE y a las cuantizaciones i1 de 13-15,5 GB, permitiendo trazas de razonamiento extensas sin depender de APIs externas.
- Analisis de documentos e imagenes: al ser un modelo multimodal con ficheros mmproj, puede procesar capturas, diagramas o documentos escaneados junto con texto para extraer informacion estructurada.
- Generacion de codigo asistida en entornos aislados: la licencia Apache 2.0 y el formato GGUF permiten integrarlo en IDE o pipelines locales sin restricciones de uso comercial, aunque la calidad en codigo no esta verificada con benchmarks.
- Investigacion sobre alineacion y seguridad: la variante "heretic" y las defensas contra inyeccion de prompts lo convierten en un caso de estudio para evaluar el equilibrio entre utilidad y rechazo en modelos abliterated.
- Prototipado de asistentes conversacionales en ingles: su formato GGUF es compatible con llama.cpp, Ollama y otros runners, facilitando iteracion rapida en local.
- Evaluacion de destilacion de razonamiento: util para comparar como se comporta un modelo destilado de ~35B MoE frente a su profesor en tareas de chain-of-thought.
- Despliegue en edge o estaciones de trabajo con GPU unica: las cuantizaciones de 13-15,5 GB caben en GPUs consumer de 16-24 GB de VRAM, habilitando inferencia privada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,0 GB para i1-Q2_K y 15,5 GB para i1-IQ3_M, mas overhead de contexto KV cache (no cuantificado en las cifras mostradas).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) para cuantizaciones IQ3, A100/H100 para precisiones mayores o contextos largos.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con cuantizaciones IQ3; en 24 GB con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el modelo base usa transformers.
- Latencia y throughput estimados: no disponibles. Al ser MoE con ~3B activos, se espera un throughput por token notablemente superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (este, cuantizado) | 34,66B | ~3B (segun nomenclatura) | no disponible | Apache 2.0 | GGUF |
| Modelo base Authereon (sin cuantizar) | 34,66B | ~3B | no disponible | Apache 2.0 | safetensors |
| Cuantizaciones estaticas de mradermacher | 34,66B | ~3B | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- El modelo esta entrenado y etiquetado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- La variante "heretic" elimina rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; requiere filtros y moderacion en produccion.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la destilacion de trazas de razonamiento que pueden contener errores plausibles.
- La defensa contra inyeccion de prompts es una capacidad declarada, no verificada con benchmarks; no debe considerarse garantia de seguridad.
- No hay datos publicados sobre sesgos, contexto maximo ni rendimiento en tareas especificas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo uncensored puede implicar responsabilidades legales y reputacionales; conviene auditar el modelo base antes de desplegarlo.
- Las cuantizaciones de baja precision (Q2, IQ2) degradan la calidad; se recomienda IQ3 o superior para tareas de razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.

## Enlaces

- Repositorio HuggingFace (cuantizado i1): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
