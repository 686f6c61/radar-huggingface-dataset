# mradermacher/RAG-Gate-4B-GGUF

## Resumen

RAG-Gate-4B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo ThakiCloud/RAG-Gate-4B, publicadas por el usuario mradermacher. Se trata de un modelo de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) especializado en una tarea concreta dentro de los pipelines de generacion aumentada por recuperacion (RAG): actuar como puerta o filtro que decide si la evidencia recuperada es suficiente para responder a una consulta, si conviene abstenerse y si hace falta una nueva ronda de recuperacion en escenarios de multi-hop QA.

El problema que resuelve es habitual en produccion: un sistema RAG que siempre genera una respuesta a partir de contexto irrelevante o incompleto produce alucinaciones y respuestas no fundamentadas. Este modelo se plantea como un guardrail previo a la generacion, con etiquetas declaradas de evidence-sufficiency, abstention, multi-hop-qa y rag-gate. Los idiomas soportados segun la informacion disponible se limitan al ingles.

La relevancia de esta publicacion es practica: mradermacher distribuye 12 cuantizaciones estaticas (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite ejecutar el modelo en GPU de consumo o incluso en CPU. El repositorio acumula 180 descargas y 0 likes en el momento de la consulta, y no incluye resultados de benchmarks, ficha de arquitectura ni detalles del entrenamiento mas alla de los datasets citados (ThakiCloud/ChainCheck y dgslibisey/MuSiQue).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada; el modelo base es ThakiCloud/RAG-Gate-4B) |
| Parametros totales | 4.205.751.296 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Datos adicionales del repositorio: autor de la cuantizacion mradermacher, libreria declarada transformers, tamano del repositorio 38,9 GB, creado el 2026-10-07 y actualizado el 2026-10-07.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en los datos proporcionados. El repositorio unicamente indica que se trata de cuantizaciones estaticas del modelo ThakiCloud/RAG-Gate-4B, sin detallar si es un transformer decoder-only, un modelo encoder-decoder, un hibrido o una arquitectura MoE. Tampoco se especifica el mecanismo de atencion, la longitud de contexto nativa ni el tipo de tokenizador.

Respecto al entrenamiento, la model card solo cita dos datasets: ThakiCloud/ChainCheck y dgslibisey/MuSiQue (este ultimo asociado habitualmente a tareas de multi-hop QA). No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas concretas. Las etiquetas del repositorio (rag, evidence-sufficiency, multi-hop-qa, abstention, guardrail, rag-gate) describen la funcion prevista del modelo, no detalles de implementacion.

En cuanto a la cuantizacion, el autor senala que se trata de cuantizaciones estaticas y que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, quedando sujetas a peticion mediante discusion comunitaria. El proceso se realizo con conversion a formato HuggingFace (convert_type: hf) y output_tensor_quantised: 1.

## Capacidades

Las capacidades que se enumeran a continuacion se derivan de las etiquetas y datasets declarados en el repositorio; no hay documentacion adicional que las cuantifique.

- Evaluacion de suficiencia de evidencia: determinar si los documentos recuperados bastan para responder a una consulta.
- Abstencion: capacidad de no responder cuando la evidencia es insuficiente, actuando como guardrail antes de la generacion.
- Multi-hop QA: soporte para preguntas que requieren encadenar varias piezas de evidencia o varias rondas de recuperacion.
- Funcion de puerta (rag-gate): decision binaria o categorica sobre si continuar el pipeline RAG, re-recuperar o detener.
- Uso conversacional: el repositorio declara la etiqueta conversational.
- Compatibilidad con endpoints: etiqueta endpoints_compatible.
- Idiomas: unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Puerta de calidad en pipelines RAG en produccion: antes de invocar al modelo generador, RAG-Gate-4B evalua si el contexto recuperado es suficiente; si no lo es, el sistema puede evitar la llamada al LLM grande, reduciendo coste y latencia. Su tamano de 4,2B y sus cuantizaciones de 2-3 GB lo hacen viable como componente siempre activo.
- Abtencion controlada en asistentes documentales: en un chatbot sobre documentacion interna, el modelo bloquea respuestas cuando la recuperacion no aporta evidencia, devolviendo un mensaje de "no dispongo de informacion suficiente" en lugar de alucinar.
- Enrutado multi-hop: en preguntas que requieren combinar dos o mas documentos, el modelo decide si la evidencia actual es suficiente o si hay que lanzar una segunda consulta al indice vectorial.
- Guardrail previo a generacion en entornos regulados: en sectores como legal, sanitario o financiero, se usa como filtro que impide que el generador responda sin respaldo documental verificable.
- Evaluacion offline de sistemas RAG: integrado en un harness de evaluacion para medir la tasa de suficiencia de evidencia de un retriever o de una estrategia de chunking sobre datasets como MuSiQue o ChainCheck.
- Reduccion de coste en despliegues con GPU limitada: al ser un modelo de 4,2B cuantizado a Q4_K_M (2,8 GB), puede ejecutarse en la misma GPU que el generador o en una GPU secundaria de gama media, filtrando peticiones antes de llegar al modelo mayor.
- Moderacion de respuestas basadas en documentos: como capa intermedia que decide si una respuesta candidata esta respaldada por las fuentes recuperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MuSiQue, ChainCheck ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

Los tamanos de archivo estan tomados de la tabla de cuantizaciones del repositorio; las necesidades de VRAM son estimaciones a partir de esos tamanos mas el overhead de contexto y runtime, no cifras publicadas por el autor.

- Q2_K (2,0 GB): cabe en GPUs de 4 GB de VRAM; ejecutable en CPU con 4 GB de RAM.
- Q3_K_S / Q3_K_M / Q3_K_L (2,2-2,5 GB): aptas para GPUs de 4-6 GB.
- IQ4_XS / Q4_K_S / Q4_K_M (2,6-2,8 GB): recomendadas por el autor para velocidad; funcionan en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) y en Apple Silicon con Metal.
- Q5_K_S / Q5_K_M (3,1-3,2 GB): requieren en torno a 5 GB de VRAM.
- Q6_K (3,6 GB): calidad muy buena segun el autor; en torno a 5-6 GB de VRAM.
- Q8_0 (4,6 GB): la mejor calidad con velocidad alta segun el autor; requiere 7-8 GB de VRAM.
- f16 (8,5 GB): 16 bits por peso, calificada de "overkill" por el autor; requiere en torno a 10-12 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) para las cuantizaciones de 4 a 8 bits; A100 o H100 no son necesarias para un modelo de este tamano.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores GGUF compatibles con endpoints; el modelo base (safetensors) puede desplegarse con transformers, TGI o vLLM, aunque las cuantizaciones GGUF se usan tipicamente con llama.cpp y derivados.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. La unica comparacion documentada es entre las propias cuantizaciones ofrecidas:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 2,0 | sin nota |
| Q3_K_S | 2,2 | sin nota |
| Q3_K_M | 2,4 | calidad inferior |
| Q3_K_L | 2,5 | sin nota |
| IQ4_XS | 2,6 | los cuantos IQ suelen ser preferibles frente a cuantos no-IQ de tamano similar |
| Q4_K_S | 2,7 | rapida, recomendada |
| Q4_K_M | 2,8 | rapida, recomendada |
| Q5_K_S | 3,1 | sin nota |
| Q5_K_M | 3,2 | sin nota |
| Q6_K | 3,6 | calidad muy buena |
| Q8_0 | 4,6 | rapida, mejor calidad |
| f16 | 8,5 | 16 bpw, excesiva |

Comparativa con modelos alternativos de la misma categoria (puertas de suficiencia de evidencia o modelos de 4B para RAG): no disponible.

## Limitaciones y advertencias

- Cobertura idiomatica limitada: el repositorio declara unicamente ingles; no hay evidencia de soporte multilingue ni de castellano.
- Ausencia total de benchmarks: no se puede verificar la precision de la puerta de suficiencia ni su tasa de falsos positivos o falsos negativos sin evaluacion propia.
- Falta de documentacion de arquitectura y contexto: se desconoce la longitud de contexto nativa, lo que impide planificar el troceado de evidencia con criterio.
- Degradacion por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) reducen la calidad; para tareas de decision con umbrales ajustados conviene partir de Q4_K_M o superior.
- Riesgo de decision erronea como guardrail: si el modelo clasifica como suficiente una evidencia irrelevante, el generador posterior producira una respuesta no fundamentada; el guardrail no elimina el riesgo de alucinacion, solo lo desplaza.
- Naturaleza del artefacto: este repositorio concreto es una recuantizacion de terceros, no el modelo original; la responsabilidad sobre el entrenamiento y los datos recae en ThakiCloud.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia; conviene verificar que el modelo base mantiene la misma licencia.
- Datos de adopcion reducidos: 180 descargas y 0 likes, sin validacion de la comunidad en el momento de la consulta.
- Repositorio de gran tamano (38,9 GB) por acumular todas las cuantizaciones; para descargas parciales hay que seleccionar archivos concretos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/RAG-Gate-4B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/RAG-Gate-4B
- Dataset ThakiCloud/ChainCheck: https://huggingface.co/datasets/ThakiCloud/ChainCheck
- Dataset dgslibisey/MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Pagina de descargas del autor: https://hf.tst.eu/model#RAG-Gate-4B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
