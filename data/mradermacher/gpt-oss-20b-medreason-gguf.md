# mradermacher/gpt-oss-20b-MedReason-GGUF

## Resumen

gpt-oss-20b-MedReason-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Rumiii/gpt-oss-20b-MedReason, publicada por mradermacher. El modelo base es un ajuste fino de gpt-oss-20b orientado a razonamiento medico, entrenado sobre el dataset lingshu-medical-mllm/ReasonMed. Esta publicacion no aporta pesos nuevos: su valor esta en ofrecer el modelo en multiples niveles de cuantizacion para facilitar su despliegue en hardware con recursos limitados.

El modelo subyacente emplea la arquitectura de gpt-oss, un transformer con mezcla de expertos (MoE) y cuantizacion nativa MXFP4, con 20.914.757.184 parametros totales. La model card del repositorio de cuantizacion no detalla el numero de parametros activos, la longitud de contexto ni la composicion exacta del entrenamiento; esos datos corresponden al modelo base y no se reproducen aqui.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores desplegar un modelo de razonamiento medico de aproximadamente 20.000 millones de parametros en entornos locales mediante llama.cpp u Ollama, eligiendo entre cuantizaciones que van de 12,2 GB (Q2_K, Q3_K_S) a 22,4 GB (Q8_0). El repositorio ocupa 182,4 GB en total al incluir todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la familia gpt-oss; cuantizacion nativa MXFP4 |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4_MOE, x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b-MedReason parte de la arquitectura gpt-oss, un transformer con capas de mezcla de expertos y pesos cuantizados de forma nativa en MXFP4. Sobre esa base, el autor del modelo original (Rumiii) realizo un ajuste fino orientado a razonamiento medico utilizando el dataset lingshu-medical-mllm/ReasonMed. La model card del repositorio de cuantizacion no especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion concreta es un trabajo de cuantizacion, no de entrenamiento. mradermacher ha generado cuantizaciones estaticas (version de quantize_version 2, con output_tensor_quantised a 1 y conversion de tipo hf) a partir de los pesos del modelo base. Ademas, el autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (gpt-oss-20b-MedReason-i1-GGUF). No se documentan innovaciones arquitectonicas adicionales en esta ficha.

## Capacidades

- Generacion de texto y razonamiento especializado en dominio medico, derivado del ajuste fino sobre ReasonMed.
- Razonamiento multi-paso orientado a problemas clinicos y preguntas medicas, segun la etiqueta "reasoning" del repositorio.
- Conversacion multi-turno: el repositorio esta marcado como "conversational" y "endpoints_compatible".
- Capacidades multilingues limitadas al ingles (idioma declarado: en).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la anotacion de informes clinicos: el modelo puede generar borradores de resumenes y justificaciones diagnosticas a partir de notas, aprovechando su ajuste sobre datos medicos de razonamiento.
- Formacion medica y simulacion de casos: util para generar explicaciones paso a paso de razonamiento clinico en ingles, con fines docentes y de autoevaluacion.
- Investigacion en NLP medico: sirve como linea base cuantizada para experimentos de razonamiento medico en entornos con una sola GPU, gracias a las variantes Q4_K_M (15,9 GB) y Q5_K_M (17,0 GB).
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor, adecuadas para prototipos en hardware de consumo de gama alta.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir el impacto de Q2_K frente a Q8_0 en tareas de razonamiento medico, con diferencias de tamano de 12,2 GB a 22,4 GB.
- Procesamiento por lotes de preguntas medicas en ingles: integrable mediante llama.cpp u Ollama en pipelines offline donde no se permite enviar datos a servicios en la nube.
- Experimentacion con endpoints compatibles con OpenAI: la etiqueta "endpoints_compatible" sugiere su uso en servidores de inferencia que exponen una API compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF): Q2_K y Q3_K_S en torno a 12,2 GB; IQ4_XS 12,3 GB; Q4_K_S 14,8 GB; Q4_K_M 15,9 GB; Q5_K_M 17,0 GB; Q6_K 22,3 GB; Q8_0 22,4 GB. Hay que anadir la memoria para el contexto KV.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, las variantes Q4 requieren GPUs con al menos 16-24 GB de VRAM; las variantes Q8_0 y Q6_K requieren alrededor de 24 GB.
- Cabe en GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (14,8-15,9 GB) son compatibles con GPUs de 16 GB o mas; las variantes Q6_K y Q8_0 encajan en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp y Ollama son los entornos naturales para GGUF; el repositorio tambien declara compatibilidad con endpoints. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-MedReason-GGUF (este) | 20.914.757.184 | no disponible | GGUF (multiples quants) | apache-2.0 | Ajuste medico sobre gpt-oss-20b, solo ingles |
| Rumiii/gpt-oss-20b-MedReason | 20.914.757.184 | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar del que deriva esta publicacion |
| mradermacher/gpt-oss-20b-MedReason-i1-GGUF | 20.914.757.184 | no disponible | GGUF (imatrix) | apache-2.0 | Mismo modelo con cuantizaciones ponderadas por imatrix |
| gpt-oss-20b (original) | 20.914.757.184 | no disponible | safetensors, MXFP4 | no disponible | Modelo generalista sin ajuste medico |

## Limitaciones y advertencias

- El modelo esta declarado unicamente en ingles; su uso en castellano no esta validado y probablemente degrade la calidad.
- Es un modelo de dominio medico: existe riesgo de alucinacion en recomendaciones clinicas. No debe usarse como sustituto del juicio profesional ni para diagnostico sin supervision humana.
- Los sesgos conocidos no estan documentados en la informacion disponible.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) pueden degradar el razonamiento; el propio autor marca Q3_K_M como "lower quality".
- La licencia apache-2.0 permite uso comercial, pero el modelo base y el ajuste fino deben verificarse por separado antes de un despliegue en produccion.
- No se han publicado benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa del rendimiento del ajuste medico.
- El repositorio ocupa 182,4 GB por incluir todas las variantes; la descarga debe hacerse seleccionando el archivo GGUF concreto.
- El modelo fue creado el 2026-11-10 y no registra descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gpt-oss-20b-MedReason-GGUF
- Modelo base: https://huggingface.co/Rumiii/gpt-oss-20b-MedReason
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gpt-oss-20b-MedReason-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gpt-oss-20b-MedReason-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/lingshu-medical-mllm/ReasonMed
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
