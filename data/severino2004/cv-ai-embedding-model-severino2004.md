# Severino2004/cv-ai-embedding-model-severino2004

## Resumen

Severino2004/cv-ai-embedding-model-severino2004 es un modelo de embeddings de frases (sentence embeddings) publicado en HuggingFace por el usuario Severino2004. Se trata de un fine-tuning de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, un encoder transformer tipo BERT de 117.653.760 parametros, orientado a la similitud semantica entre textos. El pipeline declarado es sentence-similarity y las etiquetas del repositorio incluyen feature-extraction y dense, lo que confirma que su funcion es producir vectores densos, no generar texto.

El modelo resuelve un problema muy concreto: emparejar curriculos con ofertas de empleo. Los ejemplos del widget de la model card son pares de CV (perfiles con formacion, experiencia y competencias) y ofertas de trabajo (misiones y perfil buscado), todos en frances, lo que sugiere que el corpus de ajuste esta compuesto por documentos de recursos humanos en ese idioma. El entrenamiento se realizo con la funcion de perdida CosineSimilarityLoss sobre un conjunto de 1147 ejemplos, segun las etiquetas del repositorio.

Es relevante ahora porque los modelos de embeddings pequenos y multilingues permiten construir sistemas de recuperacion semantica, busqueda de candidatos y filtrado de ofertas con coste de inferencia muy bajo, ejecutables incluso en CPU. No obstante, el repositorio no tiene descargas ni likes (0 y 0), no declara licencia ni idiomas, y no publica resultados de evaluacion, por lo que debe tratarse como un ajuste experimental y no como un componente listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (MiniLM-L12-H384), heredado del modelo base |
| Parametros totales | 117.653.760 (dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible. El repo solo publica pesos safetensors; admite conversion a FP16/INT8, pero no se ofrecen variantes cuantizadas |
| Idiomas soportados | No disponibles en la ficha. El modelo base es multilingue; los ejemplos de la model card estan integramente en frances |
| Licencia | No disponible. El modelo base es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional del tipo BERT, en la variante MiniLM-L12-H384 que hereda del modelo base paraphrase-multilingual-MiniLM-L12-v2: 12 capas, dimension oculta de 384 y tokenizador multilingue compartido con la familia XLM-R. No incorpora cabezal generativo ni decodificador; la salida utilizable es el vector de embedding de la frase (con pooling sobre las representaciones del encoder, segun la configuracion estandar de sentence-transformers).

El ajuste se realizo con SentenceTransformer mediante CosineSimilarityLoss sobre 1147 ejemplos, segun la etiqueta dataset_size:1147 del repositorio. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales de alineacion como DPO o RLHF (en modelos de embeddings no son habituales). Tampoco se documenta ninguna innovacion tecnica propia: se trata de un fine-tuning estandar sobre un modelo preentrenado ya existente, sin decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Generacion de embeddings densos de frases y parrafos (pipeline sentence-similarity y feature-extraction).
- Calculo de similitud semantica entre pares de textos, incluida la comparacion asimetrica entre un CV y una oferta de empleo.
- Recuperacion semantica (semantic search) sobre corpus de documentos breves.
- Agrupamiento (clustering) y deduplicacion de textos por cercania en el espacio de embeddings.
- Funcionamiento multilingue heredado del modelo base, aunque el ajuste se ha realizado con datos en frances, por lo que el rendimiento fuera de ese idioma no esta documentado.
- Compatibilidad declarada con text-embeddings-inference y con endpoints de HuggingFace (etiqueta endpoints_compatible).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje generativo.
- No tiene capacidades de vision ni de audio.

## Casos de uso

- Emparejamiento de curriculos y ofertas de empleo: el modelo genera un embedding del CV y otro de la oferta, y la similitud coseno ordena los candidatos por adecuacion. Es el escenario para el que fue ajustado, segun los ejemplos de la model card.
- Busqueda semantica en un ATS (applicant tracking system): indexar todos los CV de la base de datos como vectores y permitir consultas en lenguaje natural, recuperando los perfiles mas cercanos sin depender de coincidencia exacta de palabras clave.
- Recomendacion de ofertas a candidatos: calcular la similitud entre el perfil de un usuario y el catalogo de vacantes para generar un ranking personalizado, recalculable en lote cada vez que se publican nuevas ofertas.
- Deduplicacion de ofertas de empleo: agrupar ofertas casi identicas publicadas por distintas fuentes detectando pares con similitud por encima de un umbral, reduciendo el ruido en agregadores de empleo.
- Clasificacion y etiquetado de ofertas por familia profesional: usar los embeddings como entrada de un clasificador ligero (regresion logistica o k-NN) para asignar categorias como compras, logistica o marketing, tal y como aparecen en los ejemplos del widget.
- Filtrado previo en un pipeline de RAG sobre documentacion de RRHH: emplear el modelo como recuperador de fragmentos relevantes antes de pasarlos a un modelo generativo, aprovechando su bajo coste de inferencia.
- Analisis de brechas de competencias: comparar el embedding de un CV con el de una descripcion de puesto para cuantificar el ajuste y priorizar formacion o candidatos en un proceso de seleccion masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (ni MTEB, ni pares de similitud, ni recuperacion) y la model card no reporta ninguna puntuacion. Los ejemplos del widget muestran listas de frases candidatas, pero sin valores de similitud asociados, por lo que no permiten derivar ninguna cifra de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,47 GB en FP32, 0,24 GB en FP16 y 0,12 GB en INT8 para los pesos; el consumo real depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas NVIDIA GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- Cabe con holgura en GPU de consumo e incluso en CPU: con 117,6 millones de parametros y secuencias de 128 tokens, la inferencia en CPU es viable para volumenes moderados.
- Opciones de despliegue: biblioteca sentence-transformers (nativa), text-embeddings-inference (la etiqueta endpoints_compatible lo indica), HuggingFace Inference Endpoints, y conversion a ONNX para optimizacion. No se distribuye en formato GGUF, por lo que su uso en llama.cpp u Ollama requeriria una conversion previa no verificada en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a la documentacion publica de cada uno y no a una evaluacion realizada sobre este repositorio; no hay resultados comparativos de benchmarks disponibles para el modelo ajustado.

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Severino2004/cv-ai-embedding-model-severino2004 | 117,65 M | No disponible (384 en el modelo base) | 128 tokens (heredado) | No disponible | No disponibles |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 384 | 128 tokens | Apache-2.0 | Publicados por el autor del modelo base |
| intfloat/multilingual-e5-small | 118 M | 384 | 512 tokens | MIT | Publicados por el autor |
| sentence-transformers/LaBSE | 471 M | 768 | 256 tokens | Apache-2.0 | Publicados por el autor |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al haberse ajustado sobre 1147 ejemplos de contenido en frances y de tematica de recursos humanos, el modelo puede reproducir sesgos presentes en ese corpus (estereotipos de genero profesional, sesgos geograficos o de nivel formativo) sin que exista ninguna evaluacion publicada al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la asignacion de similitudes altas entre textos semanticamente poco relacionados, especialmente fuera del dominio de CV y ofertas de empleo.
- Limitaciones de contexto: la ventana heredada del modelo base es de 128 tokens, insuficiente para curriculos u ofertas extensas. Los textos mas largos se truncan, con la consiguiente perdida de informacion.
- Limitaciones de idioma: la ficha no declara idiomas soportados y no hay evaluacion multilingue del ajuste. Los unicos ejemplos disponibles estan en frances; el rendimiento en castellano u otros idiomas es una extrapolacion del modelo base, no un dato verificado.
- Restricciones de licencia: la licencia del modelo no esta declarada en el repositorio. Aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en el derivado genera incertidumbre juridica para uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, un tamano de 0,5 GB y fue actualizado el mismo dia de su creacion, lo que indica ausencia de validacion por parte de la comunidad. No se ha publicado ninguna evaluacion, por lo que debe validarse con un conjunto de prueba propio antes de cualquier despliegue.
- No debe emplearse como modelo generativo ni como agente: carece de decodificador, de soporte de tool calling y de cualquier mecanismo de razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Severino2004/cv-ai-embedding-model-severino2004
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Paper de referencia de Sentence-BERT (arXiv 1908.10084), citado en las etiquetas del repositorio: https://arxiv.org/abs/1908.10084
- Biblioteca sentence-transformers: https://www.sbert.net
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo ni sobre su autor; ninguno de los enlaces devueltos (revista de escritura academica, pagina sobre tipografia y actas de un congreso de psicologia) guarda relacion con el modelo.
