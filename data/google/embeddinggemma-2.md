# google/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo abierto de embeddings multimodales desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio, asi como combinaciones de estas modalidades, en un unico espacio vectorial compartido de 768 dimensiones. Con 744.371.512 parametros totales (aproximadamente 740M segun el autor), combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que se pueden cargar de forma selectiva segun la necesidad.

El modelo esta disenado para ejecutarse en hardware de consumo, incluidos moviles y portatiles, y esta orientado a la generacion de representaciones semanticas de baja latencia para busqueda, generacion aumentada por recuperacion (RAG), clasificacion y agrupamiento. Frente a su predecesor, mejora un 14 por ciento en tareas de codigo y anade multimodalidad nativa sobre cuatro modalidades en el mismo espacio de embeddings.

Su relevancia actual radica en tres factores: es uno de los pocos modelos de embeddings abiertos que unifica texto, imagen, video y audio en un solo vector; incorpora Matryoshka Representation Learning (MRL) con truncado nativo a 128, 256 y 512 dimensiones, lo que reduce hasta 6 veces el coste de almacenamiento vectorial; y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La ventana de contexto es de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion GQA/MQA, patron local:global 5:1, ventana deslizante y capa de proyeccion 512 a 768 |
| Parametros totales | 744.371.512 (~740M: 130M backbone + 140M embedder + 170M vision + 300M audio) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | multilingue, mas de 100 idiomas, incluido codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades de entrada | texto, imagenes, video y audio |
| Dimension de salida nativa | 768 |
| Dimensiones de truncado MRL | 128, 256, 512 |
| Capas | 24 |
| Dimension del modelo | 512 |
| Dimension oculta | 2.048 |
| Tamano de vocabulario | 262.144 |
| Cabezas de atencion | 4 (2 KV locales / 1 KV global) |
| Pooling | mean pooling |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el linaje de Gemma 4. El backbone de texto consta de 24 capas con una dimension de modelo de 512 y una dimension oculta de 2.048, con atencion de tipo GQA/MQA que combina 4 cabezas de consulta con 2 cabezas KV locales y 1 global en un patron de 5 capas locales por cada capa global. Cada capa local aplica una ventana deslizante de 1.024 tokens, lo que reduce el coste computacional en secuencias largas. La funcion de activacion es una FFN con compuerta y GELU. La representacion final se obtiene mediante mean pooling y se proyecta de 512 a 768 dimensiones.

Sobre ese backbone se acoplan encoders de modalidad independientes y cargables por separado: uno de vision de 170M parametros y uno de audio de 300M parametros. Esta modularidad permite desplegar solo las modalidades necesarias y ahorrar memoria en entornos restringidos. El entrenamiento incorpora Matryoshka Representation Learning, que hace que los primeros 128, 256 o 512 componentes del vector sean utiles por si mismos tras renormlizarlos. El modelo usa prefijos de instruccion textuales ligeros para orientar las representaciones hacia tareas concretas (busqueda, clasificacion, agrupamiento o similitud semantica). No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio vectorial compartido de 768 dimensiones.
- Embeddings de imagen, video y audio, y de combinaciones entre modalidades (por ejemplo, texto e imagen en la misma consulta).
- Recuperacion y similitud semantica multilingue en mas de 100 idiomas.
- Truncado nativo de vectores a 128, 256 y 512 dimensiones mediante MRL, con renormlizacion posterior.
- Representaciones dirigidas por tarea mediante prefijos de instruccion (busqueda, clasificacion, agrupamiento, similitud semantica).
- Extraccion de caracteristicas para clasificacion, agrupamiento y deduplicacion de contenido.
- Procesamiento de segmentos de audio o video de varios minutos gracias a la ventana de 8.192 tokens.
- Carga selectiva de encoders de modalidad, lo que permite desplegar solo texto, o texto mas vision, o texto mas audio.
- No dispone de generacion de texto libre, tool calling ni razonamiento multi-paso: es un modelo exclusivamente de extraccion de caracteristicas.

## Casos de uso

- Busqueda semantica en dispositivos moviles: el modelo cabe en hardware de consumo y genera vectores de baja latencia, de modo que un telefono puede indexar y consultar notas, fotos o grabaciones sin enviar datos a la nube.
- RAG sobre corpus multilingues: con 8.192 tokens de contexto y soporte de mas de 100 idiomas, se puede indexar documentacion tecnica heterogenea y recuperar fragmentos relevantes para un LLM generativo.
- Recuperacion multimodal en bibliotecas de medios: al unificar imagen, video y audio en el mismo espacio, una consulta textual puede recuperar clips de video o fragmentos de audio directamente.
- Busqueda de codigo en repositorios grandes: la mejora del 14 por ciento en tareas de codigo respecto al predecesor, con un MTEB de codigo de 78,68 en NDCG@10, lo hace adecuado para buscar funciones o patrones en bases de codigo.
- Deduplicacion y agrupamiento de datasets: el truncado a 256 dimensiones reduce el coste de almacenamiento a un tercio con una perdida de calidad minima (60,41 frente a 61,36 en MTEB multilingue), lo que abarata el clustering a gran escala.
- Clasificacion zero-shot de contenido: usando prefijos de instruccion especificos por tarea, se pueden construir clasificadores de intencion, tema o toxicidad sin entrenamiento adicional.
- Indexacion de archivos de audio para busqueda por voz: con MAEB en 49,39, permite etiquetar y recuperar grabaciones por su contenido semantico.
- Sistemas de recomendacion basados en contenido: los embeddings conjuntos de texto e imagen permiten calcular similitud entre un articulo y las preferencias expresadas en lenguaje natural.

## Benchmarks y rendimiento

Todos los resultados corresponden al checkpoint a precision completa (768 dimensiones), segun la model card del autor.

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB multilingue v2 | Mean(Task), multiple | 61,36 | 61,15 |
| Texto | MTEB code v1 | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), multiple | 64,64 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), multiple | 49,39 | no disponible |

Rendimiento con truncado de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB retieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768 (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512 | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256 | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128 | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de embeddings de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 744M parametros totales y sin contar el coste de activaciones ni de los encoders de modalidad: aproximadamente 3,0 GB en FP32, 1,5 GB en FP16/BF16, 0,75 GB en int8 y 0,4 GB en int4.
- Si se cargan los encoders de vision y audio, hay que sumar sus pesos: unos 170M y 300M parametros adicionales respectivamente.
- El autor indica que el modelo esta disenado para ejecutarse en hardware de consumo, incluidos moviles y portatiles, por lo que cabe con holgura en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4060, RTX 4090) incluso a precision completa.
- No se especifican en la informacion proporcionada modelos de GPU de datacenter recomendados (A100, H100) ni configuraciones multi-GPU concretas.
- Opciones de despliegue confirmadas: libreria transformers y sentence-transformers, con instalacion mediante `pip install -U sentence-transformers transformers`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Resultados comparables |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 tokens | texto, imagen, video, audio | Apache 2.0 | MTEB multilingue 61,36; MTEB code 78,68; MIEB 64,64 |
| EmbeddingGemma 1 | no disponible en la informacion proporcionada | no disponible | texto | no disponible | MTEB multilingue 61,15; MTEB code 68,76 |
| Otros modelos de embeddings multimodales de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada en la informacion proporcionada es contra EmbeddingGemma 1, su predecesor, sobre el que mejora en MTEB de codigo (78,68 frente a 68,76) y de forma marginal en MTEB multilingue (61,36 frente a 61,15). No se dispone de datos de benchmarks ni de especificaciones de alternativas de terceros en la informacion consultada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier expectativa de uso conversacional o de razonamiento es inaplicable, ya que se limita a extraer representaciones vectoriales.
- Riesgo de sesgo: no se documenta en la informacion proporcionada ninguna evaluacion de sesgo, equidad o representacion por idioma o modalidad.
- La calidad de los embeddings depende del uso de prefijos de instruccion adecuados por tarea; omitirlos puede degradar el rendimiento en recuperacion y clasificacion.
- El truncado a 128 dimensiones reduce de forma notable la calidad (MTEB multilingue baja a 57,89 y MMEB v2 a 45,65), por lo que el autor lo recomienda solo para cargas de trabajo exclusivamente de texto.
- El truncado por debajo de 768 requiere renormlizar el vector para mantener la similitud coseno coherente.
- Rendimiento mas bajo en las modalidades no textuales: MMEB v2 de video se queda en 50,67 Hit@1 y MAEB en 49,39, bastante por debajo de las cifras de texto, por lo que en produccion conviene validar cada modalidad por separado.
- La ventana de contexto es de 8.192 tokens y la atencion local usa una ventana deslizante de 1.024 tokens; contenidos mas largos deben fragmentarse.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza la pagina de licencia de Gemma 4, lo que conviene verificar antes de un despliegue comercial.
- No se documentan en la informacion proporcionada los datos de entrenamiento, los idiomas exactos cubiertos ni las tasas de alucinacion o degradacion en dominios especializados.
- Al ser un modelo orientado a dispositivo, no se publican cifras de latencia ni de throughput que permitan dimensionar un servicio en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina del modelo en Google DeepMind: https://deepmind.google/models/gemma/
- Imagen de cabecera del modelo: https://ai.google.dev/gemma/images/embeddinggemma2_banner.png

Nota: la busqueda web realizada no devolvio resultados utiles, unicamente paginas de inicio del motor de busqueda sin contenido relacionado con el modelo.
