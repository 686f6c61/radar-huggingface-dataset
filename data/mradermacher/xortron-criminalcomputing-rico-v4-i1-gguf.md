# mradermacher/XORTRON-CriminalComputing-RICO-v4-i1-GGUF

## Resumen

XORTRON-CriminalComputing-RICO-v4-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo darkc0de/XORTRON-CriminalComputing-RICO-v4, un merge de aproximadamente 27.320 millones de parametros construido con mergekit. El modelo base se presenta explicitamente como un experimento sin censura ("abliterated", "heretic", "uncensored") afinado sobre el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, y su model card lo etiqueta como material "not-for-all-audiences" y "toxic". No es, por tanto, un modelo de proposito general, sino una pieza de investigacion sobre alineamiento y comportamiento de modelos.

El repositorio que nos ocupa no contiene pesos originales en safetensors, sino 15 ficheros GGUF cuantizados con imatrix (metodo i1) mas el fichero imatrix auxiliar, con tamanos que van de 11,0 GB (i1-Q2_K) a 22,5 GB (i1-Q6_K). Esta pensado para ejecucion local con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) en hardware de consumo, no para despliegue en produccion.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo de cuantizacion con imatrix sobre un merge de ~27B y como caso de estudio de los riesgos de publicar variantes "abliterated" sin licencia declarada, sin idiomas declarados y sin evaluacion publica. Cualquier uso serio debe tratarse como entorno aislado y con supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como merge generado con mergekit; no se detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en (declarado en la model card del modelo base) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); existen cuantizaciones estaticas en el repo hermano XORTRON-CriminalComputing-RICO-v4-GGUF |
| Tamano del repositorio | 218,6 GB |
| Dataset de afinado | darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT |
| Etiquetas destacadas | merge, mergekit, unsloth, uncensored, harmful, heretic, abliterated, toxic, experimental, not-for-all-audiences |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La model card indica que se trata de un merge construido con mergekit y que el afinado se realizo sobre darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT; las etiquetas incluyen "unsloth", lo que sugiere que el SFT se hizo con esa libreria, aunque no se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta la ventana de contexto nativa ni la tokenizer.

La innovacion tecnica relevante de este repositorio es la cuantizacion: mradermacher aplica cuantizacion ponderada con imatrix (sufijo i1), que calibra los errores de cuantizacion con una matriz de importancia derivada de datos de calibracion. El autor incluye en la model card sus recomendaciones habituales: IQ3_XXS sobre Q2_K, IQ3_XS sobre Q3_K_S, IQ3_S por encima de la familia Q3_K, e IQ3_M por encima de Q3_K_L; para uso general senala i1-Q4_K_S como relacion optima tamano/velocidad/calidad e i1-Q4_K_M como opcion rapida recomendada. El resto de decisiones de entrenamiento (datos, filtros, mitigaciones) no esta documentado.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y el pipeline declarado.
- Afinado orientado a respuestas sin rechazo ("abliterated", "heretic"), lo que en la practica implica menor tendencia a declinar peticiones, incluido contenido sensible.
- Capacidad declarada de manejar contenido toxico o danino como objeto de estudio ("harmful", "toxic"), segun la propia clasificacion del autor.
- Soporte de inferencia via llama.cpp y ecosistema GGUF (Ollama, LM Studio, KoboldCpp, text-generation-webui).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), es decir, puede servirse detras de una API compatible con TGI/transformers.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta verificado.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras un proceso de "abliteration", comparandolo con el modelo base sin modificar en un entorno controlado.
- Red teaming y evaluacion de seguridad: util para construir baterias de prompts adversarios y medir la robustez de filtros y clasificadores propios, dado que el modelo esta disenado para no auto-censurarse.
- Analisis de contenido toxico en corpus: usar el modelo como generador de ejemplos etiquetados para entrenar o validar clasificadores de toxicidad, siempre con revision humana y sin exposicion publica.
- Pruebas de cuantizacion: el conjunto de 14 cuantizaciones i1 permite medir la degradacion de perplejidad y calidad conversacional entre Q2_K y Q6_K sobre un mismo merge de ~27B, un caso util para calibrar pipelines de cuantizacion.
- Docencia en seguridad de IA: escenario de laboratorio para mostrar los efectos de merges sin evaluacion y de la publicacion de modelos sin licencia ni documentacion.
- Inferencia local en hardware de consumo: con i1-Q4_K_M (16,9 GB) o i1-IQ4_XS (15,4 GB) puede ejecutarse en una GPU de 24 GB o en CPU con RAM suficiente, lo que facilita experimentos sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y tampoco se aportan mediciones de perplejidad de las cuantizaciones mas alla de las recomendaciones cualitativas del autor.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero GGUF mas overhead de contexto y cache KV. Rangos: ~11-13 GB para i1-Q2_K e i1-IQ3_*; ~15-17 GB para i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S e i1-Q4_K_M; ~19-23 GB para i1-Q5_K_* e i1-Q6_K.
- GPU recomendadas: RTX 3090/4090 (24 GB) para i1-Q4_K_M e i1-Q5_K_M; A100 40/80 GB o H100 para i1-Q6_K con contexto largo; GPUs de 16 GB solo admiten cuantizaciones Q2/Q3 o descarga parcial de capas.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB (RTX 4060 Ti, 4070 Ti Super) con Q3 o con offload parcial a CPU.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; tambien puede servirse mediante endpoints compatibles. No se recomienda vLLM ni TGI para GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Las alternativas indicadas son ejemplos de la misma categoria (modelos de ~27-32B cuantizados en GGUF para uso local), no necesariamente equivalentes en comportamiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON-CriminalComputing-RICO-v4-i1-GGUF | ~27,3B | no disponible | no disponible | GGUF i1 (14 cuantizaciones) | Merge sin censura, sin benchmarks, etiquetado como toxico/experimental |
| Modelos de ~27-32B de proposito general con GGUF | ~27-32B | variable segun familia | habitualmente licencias permisivas o de comunidad | GGUF | Suelen incluir model card con benchmarks y contexto declarado; no verificable en esta ficha sin datos concretos |
| Variantes "abliterated" de modelos abiertos | variable | variable | variable | safetensors y GGUF | Misma categoria de experimento de desalineamiento; habitualmente con documentacion metodologica mas detallada |

No se dispone de informacion suficiente para comparar calidad, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- El autor etiqueta el modelo como "toxic", "harmful", "uncensored", "heretic", "abliterated" y "not-for-all-audiences": esta disenado para reducir rechazos y puede generar contenido danino, ilegal o gravemente ofensivo.
- Ausencia total de licencia declarada: no hay permiso explicito de uso comercial ni de redistribucion; el uso en produccion es juridicamente arriesgado.
- Sin benchmarks ni evaluacion publica: no hay evidencia de calidad, seguridad ni robustez frente a prompt injection.
- Sin idiomas declarados mas alla del ingles; el comportamiento en castellano no esta verificado.
- Sin contexto declarado: no se puede planificar su uso en tareas de contexto largo sin medirlo empiricamente.
- Riesgo elevado de alucinacion y de respuestas confiadas pero incorrectas, agravado por la falta de evaluacion.
- Sesgos desconocidos: no se documenta composicion del dataset de SFT ni filtros aplicados, por lo que los sesgos no son auditables.
- El proceso de merge con mergekit puede producir degradaciones no triviales de coherencia que solo se detectan con evaluacion.
- No apto para atencion al cliente, entornos educativos abiertos ni cualquier despliegue expuesto a usuarios sin moderacion y supervision humana.
- El repositorio ocupa 218,6 GB; descargar cuantizaciones individuales, no el repo completo, en entornos con almacenamiento limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/XORTRON-CriminalComputing-RICO-v4-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-RICO-v4
- Dataset de SFT: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/XORTRON-CriminalComputing-RICO-v4-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#XORTRON-CriminalComputing-RICO-v4-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
