# ATH-MaaS/Ovis-VL-Embedding-9B

## Resumen

Ovis-VL-Embedding-9B es un modelo de embeddings vision-lenguaje desarrollado por el equipo ATH-MaaS de Alibaba. A diferencia de un modelo generativo, no produce texto: proyecta texto, imagenes, documentos visuales, video y entradas multimodales intercaladas en un unico espacio de representacion de 4096 dimensiones, lo que permite recuperacion cross-modal de alta precision con un solo codificador. Se inicializa desde el backbone Qwen3.5-9B, conserva sus codificadores nativos de texto y vision junto con el tronco multimodal compartido y elimina la cabeza de modelado de lenguaje, usando directamente el estado oculto de la ultima capa en el ultimo token no de relleno como embedding de recuperacion.

El modelo sigue una arquitectura hibrida de 32 capas de lenguaje con tamano oculto 4096, en la que se repiten tres capas Gated DeltaNet seguidas de una capa de atencion completa con compuerta. Esta combinacion busca procesamiento eficiente de contexto largo con interacciones globales periodicas entre tokens. El codificador posicional multimodal preserva coordenadas temporales y espaciales bidimensionales para los tokens visuales, algo relevante cuando se muestrean fotogramas de video o se procesan documentos densos.

Su relevancia actual radica en que unifica tareas que tradicionalmente requerian encoders separados (CLIP o SigLIP para imagen, modelos de texto para pasajes, encoders especializados para documentos y video) en un unico bi-encoder. En MMEB-v2, evaluado sobre 78 conjuntos de datos, alcanza 81,13 de media global, superando al mejor baseline comparado por 1,04 puntos, con la mayor ventaja en la categoria de imagen (+2,10). La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines de recuperacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (Qwen3.5-9B): 32 capas de lenguaje, tamano oculto 4096, patron de 3 capas Gated DeltaNet + 1 capa de atencion completa con compuerta; codificador posicional multimodal con coordenadas temporales y espaciales 2D |
| Parametros totales | Aproximadamente 9.000 millones (heredados del backbone Qwen3.5-9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repositorio 16,8 GB) |
| Dimension del embedding | 4096 (salida nativa del backbone, sin cabeza de proyeccion), normalizada L2 |
| Tipo de encoder | Bi-encoder (no cross-encoder); sin atencion cruzada entre consulta y candidato |
| Tipo de pooling | Estado oculto de la ultima capa en el ultimo token no de relleno |
| Modalidades de entrada | Texto, imagen, documento visual, video (fotogramas muestreados) y entradas multimodales intercaladas |
| Tarea (pipeline) | feature-extraction / retrieval |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-9B, del que conserva los codificadores nativos de texto y vision y el tronco multimodal compartido. La unica modificacion estructural relevante es la eliminacion de la cabeza de modelado de lenguaje: no se anade ninguna cabeza de proyeccion especifica por modalidad, de modo que el embedding es el estado oculto de la ultima capa correspondiente al ultimo token no de relleno, con 4096 dimensiones. Todas las modalidades se serializan como una unica secuencia intercalada. La pila de 32 capas combina tres capas Gated DeltaNet por cada capa de atencion completa con compuerta, un esquema hibrido orientado a reducir el coste del contexto largo manteniendo interacciones globales periodicas. El codificador posicional multimodal mantiene las coordenadas temporales y las coordenadas espaciales bidimensionales de los tokens visuales, lo que permite representar tanto fotogramas de video como la distribucion espacial de contenido en documentos.

El entrenamiento se estructura en tres etapas. La primera es un preentrenamiento contrastivo multimodal sobre datos multi-tarea a gran escala, con un objetivo que combina aprendizaje contrastivo focal sensible a la dificultad y destilacion de la distribucion de similitudes, para establecer la alineacion entre texto, imagen, documento y video. La segunda es un ajuste fino homogeneo de parametros completos con datos de alta calidad, en el que cada micro-lote se extrae de un unico conjunto de datos para que los candidatos agrupados formen negativos consistentes con la tarea. La tercera es una destilacion de embeddings por annealing, que conserva los ejemplos correctos del profesor, enfatiza los ejemplos no resueltos del estudiante y aplica supervision forward-KL con confianza adaptativa para transferir capacidades complementarias de expertos.

La interfaz de recuperacion es estrictamente de doble codificador: se empareja la consulta con la instruccion de tarea y se formatea con el procesador y la plantilla de chat nativos, se codifican consulta y candidatos de forma independiente, se extrae el estado oculto de la ultima capa en el ultimo token no de relleno, se normalizan L2 los embeddings de 4096 dimensiones y se ordenan los candidatos por similitud coseno (equivalente al producto escalar de los vectores normalizados). No se genera respuesta ni se aplica atencion cruzada entre consulta y candidato durante la recuperacion. Etiquetas de clasificacion, pasajes, imagenes, documentos, videos e items multimodales intercalados se tratan todos como candidatos dentro del mismo espacio de embeddings.

## Capacidades

- Recuperacion semantica de alta precision sobre texto, imagen, documento visual y video dentro de un espacio de representacion unico.
- Recuperacion cross-modal: texto a imagen, imagen a texto e imagen a imagen.
- Recuperacion de documentos visuales: captura de documentos densos, tablas, graficos y diagramas, evaluada mediante ViDoRe-V1 y el agregado de documento visual de MMEB-v2.
- Busqueda de video y localizacion temporal: recuperacion de video, clasificacion de video y recuperacion de momentos concretos dentro de un video.
- Recuperacion multimodal intercalada: soporta entradas que combinan texto e imagen en una misma secuencia.
- Clasificacion por similitud: las etiquetas se tratan como candidatos en el espacio de embeddings, lo que permite clasificacion sin cabeza supervisada adicional.
- Recomendacion y emparejamiento por vecinos mas cercanos sobre contenido multimodal.
- Base para RAG multimodal: los elementos recuperados se pueden inyectar como contexto en un modelo generativo posterior.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible (el modelo no es generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no es generativo).

## Casos de uso

- Busqueda semantica empresarial multimodal: indexar un corpus mixto de documentos, imagenes y videos con embeddings de 4096 dimensiones y responder consultas en lenguaje natural mediante similitud coseno, sin necesidad de mantener encoders separados por modalidad.
- RAG multimodal sobre documentacion tecnica: recuperar paginas de manuales con diagramas y tablas junto con fragmentos de texto relacionados, y pasarlos como contexto a un modelo generativo. El rendimiento en documento visual (83,06 en MMEB-v2) y el primer puesto en ViDoRe-V1 respaldan este escenario.
- Busqueda de video con localizacion temporal: dado un video largo y una consulta textual, recuperar los intervalos concretos que responden a la consulta. El modelo obtiene 72,90 en el grupo de video de MMEB-v2, con mejoras de +7,23 en recuperacion de momentos y +5,74 en recuperacion de video al escalar de 2B a 9B.
- Moderacion y clasificacion de contenido visual: representar un catalogo de imagenes o fotogramas y clasificarlas comparando con embeddings de descripciones de etiqueta, ya que las etiquetas de clasificacion se tratan como candidatos en el mismo espacio.
- Deduplicacion y agrupacion de activos multimedia: calcular vecinos mas cercanos sobre embeddings L2-normalizados para detectar imagenes o videos casi identicos en un repositorio de gran tamano. Ocupa el primer puesto en las cuatro sub-tareas de imagen de MMEB-v2.
- Recomendacion de contenido visual: generar embeddings de articulos, portadas y videos y recuperar elementos similares a partir del historial de un usuario representado como embedding, todo con el mismo codificador.
- Asistencia a la busqueda en comercio electronico: indexar fichas de producto con imagen y descripcion de forma conjunta y responder consultas de texto libre, gracias a la representacion unificada de texto e imagen.
- Recuperacion de evidencia para verificacion de hechos: localizar el fotograma o documento concreto que respalda o contradice una afirmacion, usando recuperacion por similitud en lugar de generacion.

## Benchmarks y rendimiento

### MMEB-v2 (78 conjuntos de datos de imagen, video y documento visual)

| Grupo | Ovis-VL-Embedding-9B | Mejor baseline comparado | Diferencia |
|---|---:|---:|---:|
| Imagen | 83,96 | 81,86 | +2,10 |
| Video | 72,90 | 75,95 | -3,05 |
| Documento visual | 83,06 | 82,38 | +0,68 |
| Todos los 78 conjuntos de datos | 81,13 | 80,09 | +1,04 |

Las puntuaciones son porcentajes y valores mas altos indican mejor rendimiento. La puntuacion global es la media no ponderada sobre los 78 conjuntos de datos de MMEB-v2. El modelo ocupa el primer puesto en las cuatro sub-tareas de imagen, en clasificacion de video, en recuperacion de momentos de video, en el agregado de documento visual y en ViDoRe-V1; el baseline comparado no se identifica con nombre en la informacion disponible.

### Escalado de 2B a 9B

| Metrica | Mejora al pasar de 2B a 9B |
|---|---:|
| Puntuacion global | +3,67 |
| Preguntas y respuestas sobre video | +7,64 |
| Recuperacion de momentos de video | +7,23 |
| Recuperacion de video | +5,74 |

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir del tamano de 9.000 millones de parametros; no confirmados por el autor): en precision fp16/bf16, en torno a 18-20 GB; en cuantizacion int8, en torno a 10-12 GB; en cuantizacion int4, en torno a 6-8 GB. El repositorio ocupa 16,8 GB en safetensors.
- GPU de centro de datos: A100 (40 GB o 80 GB), H100, L40S o A6000 son suficientes para servir el modelo en fp16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) permiten inferencia en fp16, aunque con margen reducido una vez cargado el codificador de vision y los buffers de activaciones para entradas de video. Tarjetas con 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeririan cuantizacion.
- Opciones de despliegue: al estar publicado con library_name transformers y pesos safetensors, el camino soportado es transformers con el procesador nativo. El soporte explicito de vLLM, TGI, llama.cpp u Ollama no esta documentado en la informacion disponible; llama.cpp y Ollama solo serian aplicables si existieran conversiones a GGUF, que no se mencionan.
- Latencia y throughput estimados: no disponibles. El coste depende fuertemente de la modalidad y del numero de fotogramas muestreados en el caso de video, ya que cada fotograma aporta tokens visuales a la secuencia.
- Almacenamiento: prever al menos 17 GB para los pesos y espacio adicional para indices vectoriales de 4096 dimensiones, cuyo tamano escala linealmente con el numero de candidatos indexados.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | MMEB-v2 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovis-VL-Embedding-9B | ~9B | Texto, imagen, documento visual, video, intercalado | 81,13 | apache-2.0 | HuggingFace (ATH-MaaS) |
| Ovis-VL-Embedding-2B | ~2B | Texto, imagen, documento visual, video, intercalado | 3,67 puntos menos que la variante de 9B | no disponible | HuggingFace (ATH-MaaS) |
| Ovis-Omni-Embedding-3B | ~3B | Omnimodal (segun la informacion disponible) | no disponible | no disponible | HuggingFace (ATH-MaaS) |
| Ovis2.5-9B | ~9B | Vision-lenguaje generativo | no disponible (modelo generativo, no de embeddings) | no disponible | HuggingFace (ATH-MaaS) |

El mejor baseline comparado en MMEB-v2 alcanza 80,09 puntos globales, pero no se identifica con nombre en la informacion proporcionada, por lo que no se puede desglosar por arquitectura, contexto o licencia. Ovis2.5-9B comparte familia y tamano, pero es un modelo de lenguaje multimodal generativo con vision transformer de resolucion nativa (NaViT) y razonamiento reflexivo, no un modelo de embeddings, por lo que no es un sustituto directo.

## Limitaciones y advertencias

- El modelo no genera texto: es un bi-encoder de recuperacion y no puede responder preguntas ni producir resumenes por si mismo. Requiere un modelo generativo aguas abajo para tareas de RAG.
- Al ser un bi-encoder, la similitud se calcula sin atencion cruzada entre consulta y candidato, lo que en general lo hace mas escalable pero potencialmente menos preciso que un cross-encoder en tareas de reranking fino.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar el comportamiento con documentos o videos de gran longitud.
- Los idiomas soportados no se documentan. El backbone Qwen3.5-9B tiene cobertura multilingue conocida, pero el autor no declara el conjunto de idiomas evaluados, por lo que el rendimiento fuera del ingles no esta respaldado por datos publicados.
- El grupo de video obtiene 72,90 frente a 75,95 del mejor baseline comparado, es decir, 3,05 puntos por debajo. La tarea de video es el punto debil relativo del modelo.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de falsos positivos en la recuperacion: similitudes coseno altas no garantizan relevancia semantica real, especialmente con contenido visual denso o consultas ambiguas.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible. Al heredar el backbone Qwen3.5-9B y datos de entrenamiento no especificados, los sesgos de representacion de ese linaje pueden trasladarse al espacio de embeddings y afectar a la recuperacion de personas o grupos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de copyright y de indicar los cambios realizados.
- Caveat de produccion importante: consultas y candidatos deben usar exactamente el mismo preprocesado, regla de pooling, dimensionalidad (4096) y normalizacion L2. Cualquier discrepancia entre el pipeline de indexacion y el de consulta degrada la recuperacion de forma silenciosa.
- El modelo tiene 37 descargas y 20 likes en el momento de la consulta, lo que indica adopcion todavia muy limitada y poca validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni conversiones a GGUF, por lo que desplegar en entornos con restricciones de VRAM exigiria cuantizar por cuenta propia, con el consiguiente riesgo de degradacion del embedding.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATH-MaaS/Ovis-VL-Embedding-9B
- Organizacion ATH-MaaS en HuggingFace: https://huggingface.co/ATH-MaaS
- Repositorio GitHub de Ovis-VL-Embedding: https://github.com/ATH-MaaS/Ovis-VL-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
- Repositorio GitHub de Ovis (arquitectura MLLM base): https://github.com/ATH-MaaS/Ovis
- Modelo Ovis-VL-Embedding-2B: https://huggingface.co/ATH-MaaS/Ovis-VL-Embedding-2B
- Modelo Ovis-Omni-Embedding-3B: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Modelo Ovis2.5-9B (modelo generativo de la misma familia): https://huggingface.co/ATH-MaaS/Ovis2.5-9B
