# mradermacher/magibu-128k-multilingual-GGUF

## Resumen

magibu-128k-multilingual-GGUF es la distribucion en formato GGUF del modelo alibayram/magibu-128k-multilingual, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El modelo original cuenta con 11.262.717.696 parametros (aproximadamente 11,26 mil millones) y esta disenado para conversacion y generacion de texto con una ventana de contexto nominal de 128.000 tokens, segun indica su propio nombre. Esta ficha describe la version cuantizada, que es la que se distribuye en este repositorio.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de ~11B con contexto muy largo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), gracias a las cuantizaciones de 4,5 GB (Q2_K) a 12,1 GB (Q8_0). El repositorio incluye once variantes de cuantizacion estatica generadas con las herramientas habituales de llama.cpp, ademas de una version separada con cuantizaciones ponderadas/imatrix.

La informacion publicada por el autor de la cuantizacion es minima: no se detallan datos de entrenamiento, composicion del dataset, resultados de benchmarks ni terminos de licencia. La model card se limita a listar los ficheros GGUF y a remitir a la documentacion generica de TheBloke para el uso de este formato. Cualquier evaluacion de calidad debe, por tanto, realizarse sobre el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: alibayram/magibu-128k-multilingual; familia transformer, sin confirmar) |
| Parametros totales | 11.262.717.696 (~11,26 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (segun el nombre del modelo; no verificado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo separado |
| Idiomas soportados | en (segun metadatos; el nombre sugiere capacidades multilingues no documentadas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el numero de parametros (11,26 B) y la nomenclatura habitual de la familia, se trata presumiblemente de un transformer decoder-only, pero no se confirma ni el tipo de atencion, ni el uso de MoE, ni innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos Hugging Face con cuantizacion por tensor de salida. Se ofrecen cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas con imatrix en `mradermacher/magibu-128k-multilingual-i1-GGUF`, que suelen preservar mejor la perplejidad a igual tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Ventana de contexto de 128.000 tokens segun el nombre del modelo, adecuada para documentos largos y conversaciones extensas (no verificada en la model card).
- Capacidades multilingues inferidas del nombre del modelo, aunque los metadatos solo declaran `en`; el alcance real por idioma no esta documentado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso detras de APIs compatibles con el formato de transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Procesamiento de documentos largos: con una ventana nominal de 128k tokens, el modelo puede resumir o extraer informacion de contratos, informes o expedientes completos sin troceado previo, usando la cuantizacion Q4_K_M (7,0 GB) para equilibrar calidad y VRAM.
- Asistente conversacional local: despliegue en estaciones de trabajo con GPU de consumo mediante Ollama o llama.cpp, aprovechando las cuantizaciones Q4_K_S o Q4_K_M, marcadas por el autor como "fast, recommended".
- Analisis de codigo en repositorios: la ventana larga permite cargar varios ficheros de un proyecto en un unico prompt para tareas de revision, explicacion o generacion de pruebas, aunque la calidad en codigo no esta documentada.
- Traduccion y atencion multilingue: si se confirma el soporte multilingue, el modelo podria usarse para traduccion de documentos largos o atencion al cliente en varios idiomas; conviene validar la calidad por idioma antes de produccion.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (4,5 GB) permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con RAM suficiente, util para prototipado y pruebas offline.
- Generacion aumentada por recuperacion (RAG): la ventana de 128k permite inyectar grandes bloques de contexto recuperado sin truncar, lo que simplifica pipelines RAG con muchos fragmentos.
- Fine-tuning ligero o evaluacion comparativa: al estar disponible el modelo base en safetensors, se puede usar como punto de partida para ajustes con LoRA y despues cuantizar de nuevo a GGUF para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se aportan datos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): 4,5 GB (Q2_K), 5,1 GB (Q3_K_S), 5,7 GB (Q3_K_M), 6,2 GB (Q3_K_L), 6,3 GB (IQ4_XS), 6,6 GB (Q4_K_S), 7,0 GB (Q4_K_M), 7,9 GB (Q5_K_S), 8,1 GB (Q5_K_M), 9,3 GB (Q6_K) y 12,1 GB (Q8_0).
- La cache KV para 128k tokens anade una cantidad significativa de memoria adicional; no se dispone de cifras oficiales, pero con contexto completo se recomienda GPU de 24 GB o mas (RTX 3090/4090, A10G, L4) o bien offloading parcial a CPU.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5 con contexto moderado; RTX 4090, A100 o H100 para contexto completo de 128k o cuantizaciones Q8_0.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB y hasta Q8_0 en GPUs de 16 GB, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI que usen backend GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Se incluyen alternativas de tamano y proposito similares, con la advertencia de que las cifras de rendimiento de esas alternativas no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| magibu-128k-multilingual (este) | ~11,26 B | 128k (nominal) | no disponible | GGUF, safetensors | Sin benchmarks publicados |
| Mistral Nemo 12B | 12 B | 128k | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado con benchmarks publicos |
| Gemma 2 9B | 9 B | 8k | Gemma Terms | safetensors, GGUF | Menor contexto, licencia con restricciones de uso |
| Qwen2.5 14B | 14,7 B | 128k | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Mayor tamano, ecosistema amplio de cuantizaciones |

La comparacion real de calidad no es posible sin benchmarks; se recomienda evaluar el modelo en la tarea concreta frente a estas alternativas antes de adoptarlo en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad en razonamiento, codigo, matematicas o multilingue.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base alibayram/magibu-128k-multilingual antes de cualquier despliegue productivo.
- Idiomas: los metadatos solo declaran `en`; el caracter multilingue del nombre no esta respaldado por documentacion, por lo que la calidad en castellano es desconocida.
- Contexto de 128k no verificado: la cifra procede del nombre del modelo y no aparece en la model card; ademas, usar contexto completo dispara el consumo de memoria por la cache KV.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publicada no se puede acotar su magnitud.
- Sesgos: no documentados; al no conocerse la composicion del dataset de entrenamiento, no se pueden identificar sesgos conocidos.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio i1.
- Modelo derivado: cualquier problema del modelo base se hereda; esta ficha solo documenta la conversion a GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/magibu-128k-multilingual-GGUF
- Modelo base: https://huggingface.co/alibayram/magibu-128k-multilingual
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/magibu-128k-multilingual-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#magibu-128k-multilingual-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
