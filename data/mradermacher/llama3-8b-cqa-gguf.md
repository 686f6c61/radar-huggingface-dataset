# mradermacher/LLaMA3-8b-CQA-GGUF

## Resumen

LLaMA3-8b-CQA-GGUF es la distribucion en formato GGUF del modelo VityaVitalich/LLaMA3-8b-CQA, un ajuste fino de Meta Llama 3 de 8.000 millones de parametros orientado a tareas de *question answering* sobre contexto (CQA, *context question answering*). El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos open source, que genera los ficheros estaticos a partir de los pesos originales en safetensors. El modelo base conserva la arquitectura transformer densa de Llama 3 y la licencia Apache 2.0 del modelo original.

El interes practico de esta publicacion esta en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16). Al estar especializado en responder preguntas a partir de un contexto proporcionado, encaja en flujos de recuperacion aumentada (RAG) y extraccion de respuestas sobre documentos, donde el modelo debe ceñirse a la informacion del contexto en lugar de generar conocimiento libre.

La informacion publicada por el autor de la cuantizacion es escasa: no se detallan datos de entrenamiento del ajuste fino, hiperparametros, benchmarks ni la longitud exacta de contexto utilizada durante el fine-tuning. Esta ficha refleja unicamente los datos verificables de la model card y de los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Meta Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3 soporta 8.192 tokens; no se confirma el contexto usado en el ajuste fino) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 71,8 GB (incluye todas las cuantizaciones) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Llama 3 8B, por lo que hereda la arquitectura transformer decoder-only de Meta, con atencion multi-cabeza agrupada (GQA), normalizacion RMSNorm y activacion SwiGLU. El ajuste fino CQA (context question answering) se realizo sobre VityaVitalich/LLaMA3-8b-CQA, cuyo objetivo declarado por el nombre es responder preguntas apoyandose en un contexto aportado en el prompt. No se han publicado en la informacion disponible detalles sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO.

La publicacion de mradermacher es exclusivamente una conversion a GGUF: segun la model card, se trata de cuantizaciones estaticas generadas con la version 2 del pipeline de cuantizacion y conversion desde formato Hugging Face. No se ofrecen cuantizaciones ponderadas ni imatrix en el momento de la publicacion, y el autor indica que podrian no estar planificadas. No se documenta ninguna innovacion arquitectonica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla de las propias de Llama 3.

## Capacidades

- Generacion de texto y respuesta a preguntas en ingles, con enfasis en responder a partir de un contexto proporcionado (question answering sobre contexto).
- Razonamiento basico y comprension lectora sobre documentos largos, limitado por la ventana de contexto efectiva del modelo.
- Conversacion multi-turno (el repositorio esta etiquetado como "conversational").
- Capacidad multilingue limitada: el modelo esta declarado unicamente para ingles.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Respuesta a preguntas sobre documentacion interna: el modelo recibe un fragmento de texto y una pregunta, y devuelve la respuesta extractiva o sintetizada. Es adecuado por su ajuste especifico en CQA y por poder desplegarse en local con llama.cpp.
- Pipelines de RAG en ingles: integrado como generador final tras un recuperador (por ejemplo, FAISS o Chroma), el modelo produce respuestas ancladas al contexto recuperado, reduciendo la generacion de conocimiento no verificado.
- Extraccion de respuestas en formularios y encuestas: dado un texto de entrada, el modelo localiza y devuelve el dato solicitado (fechas, nombres, cifras), util en procesos de digitalizacion de documentos.
- Analisis de contratos y documentos legales en ingles: con cuantizaciones Q6_K o Q8_0 puede procesar fragmentos largos y responder preguntas concretas sobre clausulas, manteniendo el contexto dentro de la ventana del modelo.
- Asistencia en atencion al cliente sobre base de conocimiento: el modelo responde consultas de usuarios utilizando articulos de ayuda como contexto, en despliegues on-premise donde no se quiere enviar datos a APIs externas.
- Prototipado e investigacion en entornos con GPU de consumo: las cuantizaciones Q4_K_M (5,0 GB) permiten experimentar con un modelo de 8B en tarjetas de 8 GB, acelerando la iteracion en proyectos de NLP.
- Educacion y tutoria en ingles: el modelo puede responder preguntas sobre un texto de estudio proporcionado, util para herramientas de comprension lectora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantizacion no incluye metricas de evaluacion, y no se dispone de datos del modelo base VityaVitalich/LLaMA3-8b-CQA en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB (Q2_K), 5,0 GB (Q4_K_M), 5,8 GB (Q5_K_M), 6,7 GB (Q6_K), 8,6 GB (Q8_0) y 16,2 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para cuantizaciones medias y altas; A100 y H100 para despliegues de mayor concurrencia o f16.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M y Q5_K_M caben en tarjetas de 8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como "endpoints_compatible", lo que sugiere compatibilidad con endpoints de inferencia tipo Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LLaMA3-8b-CQA-GGUF (este) | 8,03B | no disponible | Apache 2.0 | GGUF | Ajuste fino para CQA en ingles |
| Meta Llama 3 8B Instruct | 8,03B | 8.192 tokens | Llama 3 Community License | safetensors, GGUF | Modelo generalista de referencia, multilingue |
| Mistral 7B Instruct | 7,24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de 7B con contexto mayor y licencia permisiva |
| Qwen2.5 7B Instruct | 7,62B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, con soporte de tool calling documentado |

La comparativa se limita a caracteristicas publicas; no se dispone de datos de rendimiento del modelo CQA para comparar calidad frente a estas alternativas.

## Limitaciones y advertencias

- El modelo esta declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- No se han publicado benchmarks ni evaluaciones de calidad del ajuste fino CQA, por lo que no se puede verificar su superioridad frente al Llama 3 base en tareas de question answering.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar respuestas cuando el contexto no contiene la informacion solicitada; en CQA conviene validar la salida contra el contexto.
- La longitud de contexto efectiva no esta documentada; asumir 8.192 tokens (el maximo de Llama 3) puede no ser correcto si el ajuste fino se realizo con ventanas mas cortas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la precision en tareas extractivas; el autor recomienda Q4_K_M o superiores para uso general.
- No hay cuantizaciones imatrix ni ponderadas publicadas, lo que limita la calidad de las cuantizaciones pequenas frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Llama 3 de Meta, ya que el ajuste fino hereda sus condiciones de uso.
- El repositorio tiene un volumen de descargas bajo (114) y cero likes, lo que sugiere poca validacion por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos que requieran invocacion de funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LLaMA3-8b-CQA-GGUF
- Modelo base: https://huggingface.co/VityaVitalich/LLaMA3-8b-CQA
- Pagina de descargas del autor: https://hf.tst.eu/model#LLaMA3-8b-CQA-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
