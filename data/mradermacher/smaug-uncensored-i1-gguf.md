# mradermacher/Smaug-Uncensored-i1-GGUF

## Resumen

Smaug-Uncensored-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base abacusai/Smaug-Uncensored. El modelo original, desarrollado por Abacus.AI, es un transformer denso de aproximadamente 27.300 millones de parametros (27,3B) afinado mediante DPO (Direct Preference Optimization) para reducir las restricciones de alineacion y mejorar el comportamiento en tareas agenticas. Esta version i1 aplica cuantizacion con matrices de importancia (imatrix) para preservar la calidad en tamanos reducidos.

La relevancia de esta ficha radica en que ofrece el modelo en formatos GGUF listos para ejecucion local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp), con un rango de cuantizaciones que va desde 11,0 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K). Esto permite desplegar un modelo de 27B en hardware de consumo, algo inviable con los pesos en precision completa (aproximadamente 54,6 GB en fp16). La model card indica soporte para ingles y chino, licencia Apache 2.0 y compatibilidad con endpoints.

El modelo base esta etiquetado como "agentic" y "conversational", lo que sugiere un enfasis en el uso dentro de pipelines de agentes y dialogos multi-turno. No obstante, la informacion publicada no incluye detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de imatrix) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base abacusai/Smaug-Uncensored es un transformer denso de 27,3B parametros. La model card del repositorio cuantizado no detalla la arquitectura interna (tipo de atencion, uso de RoPE, GQA, etc.), por lo que estos datos se consideran no disponibles. El tag "dpo" indica que el afinamiento se realizo mediante Direct Preference Optimization, una tecnica de alineacion por preferencias que ajusta el modelo para favorecer respuestas preferidas por anotadores o por un modelo juez, sin necesidad de un modelo de recompensa separado como en RLHF clasico.

La etiqueta "uncensored" sugiere que el proceso de DPO se utilizo para reducir los rechazos y las restricciones de contenido del modelo original, si bien no se especifica cual es el modelo base previo al afinamiento ni la composicion del dataset de preferencias. No hay informacion sobre el numero de tokens de entrenamiento ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Esta version i1-GGUF se ha generado con matrices de importancia (imatrix) calculadas sobre el modelo base, lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y respuesta a instrucciones, con enfasis en comportamiento agentico segun los tags del repositorio.
- Soporte de dialogo multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Capacidad de ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- No se especifica soporte explicito de tool calling, function calling, vision, audio ni modo de pensamiento en la informacion disponible.

## Casos de uso

- Despliegue local de un asistente conversacional: con cuantizaciones i1-Q4_K_M (16,9 GB) el modelo cabe en GPUs de consumo de 24 GB, permitiendo un chatbot privado sin dependencia de la nube y con licencia Apache 2.0 para uso comercial.
- Prototipado de agentes en ingles y chino: el tag "agentic" y la compatibilidad con endpoints permiten integrar el modelo en frameworks de agentes (LangChain, LlamaIndex) para tareas de razonamiento multi-paso, siempre que se valide empiricamente el soporte de tool calling.
- Generacion de contenido sin restricciones de alineacion: el caracter "uncensored" del modelo base lo hace adecuado para tareas creativas o de investigacion donde los modelos alineados rechazan peticiones legitimas, con la advertencia de que requiere supervision.
- Inferencia en servidores con una sola GPU: la version i1-Q6_K (22,5 GB) se ajusta a una RTX 4090 de 24 GB o a una A100 de 40 GB, ofreciendo calidad cercana a la original para servicios internos.
- Investigacion sobre cuantizacion: la disponibilidad de 14 variantes de cuantizacion con imatrix permite comparar la degradacion de calidad segun el tamano, util para estudiar el impacto de la cuantizacion en modelos de 27B.
- Traduccion y procesamiento bilingue ingles-chino: el soporte declarado de ambos idiomas permite tareas de traduccion o resumen en entornos donde no se dispone de conectividad a APIs externas.
- Evaluacion de seguridad y alineacion: al ser un modelo "uncensored", sirve como referencia en estudios sobre comportamiento de modelos sin alineacion restrictiva y sobre riesgos de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas un margen para el contexto y el estado de la KV cache. Para i1-Q4_K_M (16,9 GB) se recomiendan al menos 20-22 GB de VRAM; para i1-Q6_K (22,5 GB), al menos 26-28 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones i1-Q4_K_M e inferiores; A100 40 GB o H100 para i1-Q5_K_M e i1-Q6_K con contexto amplio; multiples GPUs para contextos largos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta i1-Q4_K_M; en GPUs de 16 GB solo caben cuantizaciones i1-Q3_K_S o inferiores, con riesgo de desbordamiento si el contexto es largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se confirma soporte de vLLM o TGI para este formato en la informacion disponible.
- Latencia y throughput: no disponibles. Dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Uncensored-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, enfasis agentico y uncensored |
| abacusai/Smaug-Uncensored (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, requiere ~54,6 GB en fp16 |
| mradermacher/Smaug-Uncensored-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas (sin imatrix) del mismo base |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con estas alternativas. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- El caracter "uncensored" implica que el modelo puede generar contenido que otros modelos alineados rechazan; es necesario implementar filtros y supervision en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- La longitud de contexto no esta documentada, lo que impide garantizar el rendimiento en conversaciones o documentos largos.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo del contenido generado.
- No se confirma soporte de tool calling ni de vision, pese a que la model card menciona "vision model" en un aviso generico; los archivos mmproj, si existen, estarian en el repositorio estatico, no en este.
- Las cuantizaciones de baja precision (i1-Q2_K, i1-Q3_K_S) degradan la calidad; el propio autor recomienda IQ3_XXS o superiores frente a Q2_K.
- El repositorio ocupa 218,6 GB en total; la descarga de todas las variantes no es practica y conviene seleccionar una sola.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Smaug-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Smaug-Uncensored-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Smaug-Uncensored-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
