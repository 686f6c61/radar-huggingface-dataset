# roshan9136/codemix-retriever

## Resumen

CodeMixESC cross-lingual retriever (identificador `roshan9136/codemix-retriever`) es un modelo de embeddings de frases desarrollado por el usuario roshan9136 en el marco de CodeMixESC, un proyecto de curso del IIT Bhilai. Se trata de un fine-tuning de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder multilingue basado en XLM-RoBERTa, con 278.043.648 parametros. Su funcion no es generar texto, sino producir vectores de similitud semantica mediante la libreria `sentence-transformers`.

El problema que resuelve es concreto: que una consulta escrita en hinglish en alfabeto latino recupere exactamente los mismos casos de soporte emocional en ingles que recuperaria su version original en ingles. Para ello se entreno con la perdida Multiple Negatives Ranking (contrastiva en lote) sobre 16.951 pares de frases hinglish-ingles, construidos a partir de PHINC y de reescrituras en hinglish con alfabeto latino de las utterances de entrenamiento de ESConv. El modelo esta pensado para actuar como recuperador dentro de un sistema mayor de soporte emocional para hablantes de hinglish.

Su relevancia actual es limitada pero especifica: es un ejemplo de adaptacion cross-lingual para variedades code-mixed (hinglish) poco cubiertas por los retrievers multilingues genericos. En la evaluacion de desarrollo proporcionada por el autor, mejora de forma notable el solapamiento de recuperacion en casos con code-mixing intenso frente al modelo base y frente a `all-roberta-large-v1` usado en MultiAgentESC. El modelo se distribuye como pesos safetensors, tiene 12 descargas y 0 likes en HuggingFace, y el propio autor lo etiqueta como "for research use".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multilingue (XLM-RoBERTa / MPNet) via `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo distribuye pesos safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Ingles (en) e hindi en alfabeto latino / hinglish (hi) |
| Licencia | No disponible (la model card indica "For research use") |
| Formato de pesos | Safetensors (libreria `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder transformer multilingue con pooling de embeddings de frase, y se ajusta para similitud semantica cross-lingual. El entrenamiento usa la perdida Multiple Negatives Ranking (contrastiva en lote), con 1 epoca, tamano de lote 32, learning rate 2e-5, escala 20 y embeddings de palabra congelados; el checkpoint final se selecciona por rendimiento de recuperacion en desarrollo. El conjunto de entrenamiento son 16.951 pares de frases hinglish-ingles, compuestos por PHINC y por reescrituras en hinglish con alfabeto latino de las utterances de entrenamiento de ESConv, de modo que una consulta en hinglish en alfabeto latino recupere los mismos casos de ESConv en ingles que su equivalente en ingles.

Como artefacto auxiliar, el proyecto incluye `esconv_bank_embeddings.npy`, que contiene los embeddings calculados con este modelo de los 13.484 posts del banco de casos de ESConv (solo vectores, sin texto). La innovacion tecnica es por tanto la adaptacion de un retriever multilingue generico al registro code-mixed hinglish para una tarea de recuperacion de casos de soporte emocional, no un cambio de arquitectura ni de mecanismo de atencion.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion (pipeline `sentence-similarity`).
- Recuperacion cross-lingual hinglish (alfabeto latino) a ingles: mapea consultas code-mixed al mismo espacio que sus equivalentes en ingles.
- Busqueda semantica sobre un banco de casos de soporte emocional (13.484 posts de ESConv ya vectorizados por el autor).
- Uso como componente de recuperacion en pipelines RAG (retrieval-augmented generation) sobre conversaciones de apoyo emocional.
- Agrupamiento y deduplicacion de utterances por similitud coseno.
- No genera texto: es un modelo de embeddings, no un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo "thinking".
- Capacidades multilingues limitadas a ingles e hindi en alfabeto latino (hinglish); no se documenta soporte para castellano ni para otras lenguas.
- No tiene capacidades de vision ni de audio.

## Casos de uso

- Recuperacion de casos de soporte emocional para usuarios hinglish: el modelo indexa el banco de casos de ESConv y devuelve los casos mas similares a una consulta como "yaar bahut tension ho rahi hai", evitando que el sistema reciba una consulta fuera de distribucion respecto a los casos en ingles.
- Busqueda semantica cross-lingual en alfabeto latino: un usuario que escribe hindi romanizado obtiene los mismos resultados que si hubiera escrito en ingles, lo que en la evaluacion del autor eleva el Overlap@10 en casos con code-mixing intenso de 29,6 (modelo base) a 54,0.
- Componente de recuperacion en un pipeline RAG de apoyo emocional: las embeddings alimentan un recuperador que selecciona casos previos relevantes y los pasa a un modelo generativo o a un agente conversacional como contexto.
- Deduplicacion y agrupamiento de transcripciones de conversaciones de apoyo: agrupar utterances semanticamente equivalentes aunque una este en ingles y otra en hinglish, para limpiar corpus de entrenamiento.
- Enrutado e intent matching en un chatbot de salud mental: asignar una consulta entrante a la categoria o al flujo de respuesta mas cercano del banco de casos, usando similitud coseno.
- Reordenacion (reranking) de candidatos recuperados por un sistema de busqueda lexica: puntuar pares consulta-caso y reordenar los resultados antes de mostrarlos.
- Investigacion sobre code-mixing: linea base reproducible para estudiar recuperacion cross-lingual en variedades hinglish, dado que el autor publica el conjunto de pares de entrenamiento y los embeddings del banco de casos.

## Benchmarks y rendimiento

Los unicos resultados disponibles en la informacion proporcionada son los de recuperacion en desarrollo (151 turnos, k = 10) medidos como Overlap@10, la proporcion de casos recuperados para una publicacion en hinglish que tambien se recuperan para su original en ingles:

| Modelo | Overlap@10 Light | Overlap@10 Heavy |
|---|---|---|
| all-roberta-large-v1 (MultiAgentESC) | 56,0 | 22,1 |
| multilingual mpnet (base) | 69,9 | 29,6 |
| Este modelo | 72,9 | 54,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 278 millones de parametros ocupan aproximadamente 1,1 GB; en fp16/bf16, aproximadamente 0,56 GB, a lo que hay que sumar memoria de activaciones y el lote de entrada. Estas cifras son calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar el modelo. GPU de datacenter como A100 o H100 no son necesarias y solo aportarian mayor throughput en lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4070, RTX 4090 y equivalentes; tambien cabe en CPU para lotes pequenos.
- Opciones de despliegue: la libreria `sentence-transformers` (como en el ejemplo de la model card), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`, por lo que es compatible con endpoints de inferencia de embeddings). No se documentan recetas para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput estimados: no disponible (no se publican mediciones en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overlap@10 Light | Overlap@10 Heavy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| multilingue MPNet base (`paraphrase-multilingual-mpnet-base-v2`) | No disponible en la informacion proporcionada | No disponible | 69,9 | 29,6 | No disponible en la informacion proporcionada | HuggingFace |
| all-roberta-large-v1 (MultiAgentESC) | No disponible en la informacion proporcionada | No disponible | 56,0 | 22,1 | No disponible en la informacion proporcionada | HuggingFace |
| codemix-retriever (este modelo) | 278.043.648 | No disponible | 72,9 | 54,0 | No disponible (uso de investigacion) | HuggingFace, 12 descargas, 0 likes |

La comparativa se limita a los tres modelos evaluados por el autor en la misma tarea de recuperacion cross-lingual hinglish-ingles. No se dispone de datos comparativos de otros retrievers multilingues ni de benchmarks estandar para estos modelos.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce respuestas, no razona y no soporta tool calling ni agentes.
- Licencia no disponible: la model card indica "For research use", por lo que el uso comercial no esta autorizado de forma explicita y requeriria contactar con el autor.
- Idiomas limitados a ingles e hindi en alfabeto latino; no hay soporte documentado para castellano ni para otras lenguas, lo que descarta su uso directo en despliegues en espanol.
- Evaluacion muy reducida: los resultados de Overlap@10 provienen de un conjunto de desarrollo de 151 turnos, sin particion de test independiente publicada.
- Validacion comunitaria practicamente nula: 12 descargas y 0 likes en el momento de la consulta, sin citas ni evaluaciones externas.
- Rendimiento desigual segun la intensidad del code-mixing: el Overlap@10 Heavy (54,0) es claramente inferior al Light (72,9), de modo que las consultas con mezcla intensa siguen perdiendo casos.
- Sesgos potenciales heredados de ESConv y PHINC, corpus de conversaciones de apoyo emocional en ingles; el ajuste sobre utterances de ESConv puede sobrerrepresentar ese dominio y ese registro.
- El fichero `esconv_bank_embeddings.npy` contiene solo vectores, sin texto, por lo que el banco de casos debe obtenerse por otra via para poder mostrar contenido al usuario.
- Riesgo de alucinacion no aplicable al modelo en si (no genera texto), pero si al sistema generativo que consuma sus resultados de recuperacion.
- Longitud de contexto no documentada: no se especifica la longitud maxima de secuencia efectiva para el encoder, lo que obliga a verificar experimentalmente el truncado antes de indexar documentos largos.
- No se documentan tecnicas de cuantizacion ni artefactos GGUF/ONNX, lo que limita su despliegue en entornos sin soporte para safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roshan9136/codemix-retriever
- Repositorio CodeMixESC (proyecto, IIT Bhilai): https://github.com/roshanraj9136/CodeMixESC
- Demo en vivo de CodeMixESC: https://github.com/roshanraj9136/CodeMixESC#live-demo
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
