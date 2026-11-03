# mradermacher/gemma-4-e2b-refauna-GGUF

## Resumen

`mradermacher/gemma-4-e2b-refauna-GGUF` es la version cuantizada en formato GGUF del modelo `Refauna/gemma-4-e2b-refauna`, un ajuste fino (QLoRA) sobre una base de la familia Gemma 4, orientado a tareas de biodiversidad, conservacion y refaunacion en la Mata Atlantica brasileña. El modelo ha sido adaptado mediante QLoRA y tecnicas de RAG/RAFT para responder preguntas especializadas sobre fauna, conservacion y restauracion de ecosistemas, con soporte para portugues e ingles.

El repositorio lo publica mradermacher, un conocido generador de cuantizaciones GGUF para la comunidad, y ofrece los pesos en varios niveles de compresion (de Q2_K a Q8_0, ademas de f16) junto con los ficheros `mmproj` necesarios para el procesamiento multimodal. El modelo base cuenta con aproximadamente 475,7 millones de parametros, lo que lo situa en la gama de modelos pequenos, aptos para ejecucion en hardware modesto.

Su relevancia radica en dos factores: por un lado, es un ejemplo de especializacion vertical de un modelo pequeno mediante QLoRA sobre un dominio cientifico concreto; por otro, la disponibilidad de cuantizaciones GGUF facilita su despliegue en entornos con recursos limitados (ordenadores portatiles, Raspberry Pi o servidores sin GPU dedicada) mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun tags del modelo); detalles no disponibles |
| Parametros totales | 475.729.088 (~475,7 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y f16 |
| Idiomas soportados | Portugues (pt) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo base `Refauna/gemma-4-e2b-refauna` es un ajuste fino de un modelo de la familia Gemma 4 (segun los tags `gemma4` y `unsloth`), realizado con QLoRA. La model card del repositorio cuantizado no detalla la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion) ni la longitud de contexto, por lo que estos datos deben consultarse en el repositorio del modelo base. Los tags indican el uso de tecnicas RAG (Retrieval-Augmented Generation) y RAFT (Retrieval-Augmented Fine-Tuning) durante el ajuste, lo que sugiere que el entrenamiento incorporo documentos recuperados como contexto para mejorar la fidelidad de las respuestas sobre el dominio.

El dominio de especializacion es la biodiversidad y conservacion de la Mata Atlantica brasileña, con enfasis en refaunacion (reintroduccion de especies animales). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada. Las cuantizaciones son estaticas; el autor indica que no ha generado versiones con imatrix/weighted en el momento de la publicacion.

## Capacidades

- Generacion de texto en portugues e ingles, con especializacion en vocabulario y conceptos de biodiversidad, conservacion y refaunacion.
- Respuesta a preguntas tecnicas sobre especies, ecosistemas de la Mata Atlantica y estrategias de restauracion.
- Procesamiento multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base, aunque no se detalla su alcance.
- Uso como componente de pipelines RAG: los tags `rag` y `raft` sugieren que el modelo fue entrenado para integrarse en sistemas de recuperacion aumentada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de consulta para investigadores y tecnicos de conservacion: el modelo puede responder preguntas sobre especies de la Mata Atlantica y practicas de refaunacion, aprovechando su ajuste especifico sobre literatura del dominio.
- Componente de un pipeline RAG documental: dado su entrenamiento con RAFT, encaja como generador final que sintetiza respuestas a partir de fragmentos recuperados de articulos cientificos o informes tecnicos.
- Educacion ambiental: puede emplearse para generar materiales divulgativos en portugues sobre fauna local y restauracion de ecosistemas, con la supervision humana necesaria en contenidos cientificos.
- Procesamiento de imagenes de campo: gracias a los ficheros `mmproj`, podria integrarse en flujos que combinen fotografias de fauna con consultas textuales, aunque el alcance multimodal no esta documentado.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de ~475 M de parametros con cuantizaciones desde Q2_K, puede ejecutarse en portatiles o dispositivos sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita su uso en campo o en estaciones de trabajo modestas.
- Prototipado rapido de asistentes especializados: sirve como base para experimentar con tecnicas de ajuste fino y cuantizacion en un dominio cientifico concreto antes de escalar a modelos mayores.
- Traduccion tecnica portugues-ingles en contextos de conservacion: el modelo declara soporte para ambos idiomas, lo que permite asistir en la traduccion de informes o resumenes del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~475,7 M de parametros, un modelo en f16 ocupa aproximadamente 1 GB de pesos; las cuantizaciones Q8_0 rondan 0,5-0,6 GB, Q4_K_M en torno a 0,3-0,4 GB y Q2_K cerca de 0,2-0,3 GB (estimaciones a partir del tamano de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones mayores con holgura; una RTX 3060, RTX 4060 o superior es mas que suficiente. En GPUs de datacenter (A100, H100) el modelo quedaria infrautilizado salvo en escenarios de alto throughput por lotes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; al ser un modelo pequeno, se espera una latencia baja en CPU y muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/gemma-4-e2b-refauna-GGUF | ~475,7 M | no disponible | pt, en | Apache 2.0 | GGUF | Especializado en biodiversidad y conservacion; cuantizaciones estaticas |
| Refauna/gemma-4-e2b-refauna (base) | ~475,7 M | no disponible | pt, en | Apache 2.0 | safetensors | Modelo original sin cuantizar; mismo ajuste QLoRA |
| Gemma 4 base (familia) | no disponible | no disponible | multilingue | terminos de Gemma | safetensors | Modelo generalista del que deriva el ajuste; sin especializacion de dominio |
| Modelos pequenos generalistas (p. ej., Qwen2.5-0.5B, Llama 3.2 1B) | 0,5-1,2 B | 32k-128k (segun modelo) | multilingue | Apache 2.0 / Llama | safetensors, GGUF | Alternativas generalistas; no especializadas en el dominio |

La comparacion con modelos generalistas es orientativa: no se dispone de benchmarks que permitan comparar rendimiento real en tareas de biodiversidad.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a biodiversidad y conservacion de la Mata Atlantica; su rendimiento en tareas generales sera inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones plausibles pero falsas sobre especies, datos cientificos o normativa ambiental; en un dominio cientifico esto es especialmente critico y requiere verificacion humana.
- Cobertura limitada de idiomas: solo portugues e ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar su uso en pipelines RAG con documentos largos.
- Cuantizaciones estaticas: el autor no ha publicado versiones con imatrix/weighted, que suelen ofrecer mejor calidad por bit en niveles bajos (Q2, Q3); las cuantizaciones IQ4_XS estan disponibles, pero no hay mediciones de perplejidad publicadas.
- Soporte multimodal incierto: la presencia de ficheros `mmproj` indica capacidad multimodal en el modelo base, pero no se documenta su calidad ni sus limitaciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base y los datos de entrenamiento no impongan restricciones adicionales (la model card no detalla la procedencia de los datos).
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de casos de uso en produccion.
- Fecha de creacion futura (2026-11-03): metadato anomalo que conviene verificar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-e2b-refauna-GGUF
- Modelo base: https://huggingface.co/Refauna/gemma-4-e2b-refauna
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-e2b-refauna-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
