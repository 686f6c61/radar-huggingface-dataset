# BennyDaBall/EmbeddingGemma-2-NVFP4-GGUF

## Resumen

EmbeddingGemma-2-NVFP4-GGUF es una cuantizacion en formato GGUF del modelo de embeddings google/embeddinggemma-2, desarrollado originalmente por Google DeepMind y convertido por el usuario BennyDaBall. No se ha reentrenado ni ajustado nada: el repositorio unicamente cambia como se almacenan los pesos, aplicando una mezcla por tensor de NVFP4 (formato de 4 bits de NVIDIA para arquitectura Blackwell) y Q8_0, con el objetivo de reducir el peso del modelo a aproximadamente un tercio del original sin degradar la calidad de los embeddings.

El modelo base tiene 271.002.794 parametros (unos 271 M) y produce representaciones de 768 dimensiones. Segun la model card del cuantizador, los codificadores de vision y audio se incluyen sin modificar en BF16, de modo que texto, imagenes, video y audio caen en el mismo espacio vectorial. La licencia Apache 2.0 se mantiene intacta.

Es relevante ahora por dos motivos: permite ejecutar busqueda semantica multilingue y multimodal en hardware de consumo con un consumo de disco inferior a 200 MiB para el modelo de texto, y explota el formato NVFP4, que es especifico de las GPU Blackwell. La model card reporta una perdida de calidad minima frente al BF16 original en recuperacion (nDCG@10 de 75,51 frente a 76,06) y en busqueda de imagenes (R@1 de 86,2 frente a 86,7).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de embeddings derivado de google/embeddinggemma-2, familia Gemma; la model card no detalla la arquitectura interna) |
| Parametros totales | 271.002.794 (aproximadamente 271 M) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible de forma explicita; la model card menciona un valor por defecto de 262.144 tokens en LM Studio y recomienda cargar con 2048 u 8192 |
| Tipos de cuantizacion | NVFP4 por tensor combinado con Q8_0 en las capas sensibles; codificadores de vision y audio en BF16; activaciones de 8 bits |
| Idiomas soportados | multilingue (idiomas concretos no detallados en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni ajusta ningun modelo. La arquitectura, el entrenamiento y el espacio de embeddings multimodal corresponden integramente a google/embeddinggemma-2, desarrollado por Google DeepMind. Lo unico que cambia aqui es la representacion de los pesos: se aplica una mezcla por tensor en la que cada tensor del modelo de texto se evalua individualmente para decidir si soporta NVFP4. Los tensores robustos pasan a NVFP4 y los sensibles (la proyeccion de salida final, las proyecciones de valor de la atencion, las puertas y proyecciones de entrada de cada capa, y las FFN al principio y al final de la red) se mantienen en Q8_0.

La cuantizacion NVFP4 emplea escalado de dos niveles: una escala FP32 por tensor sobre una escala FP8 por cada 16 pesos, eligiendo en cada bloque la escala que minimiza el error en lugar del valor por defecto. Ademas, todos los tensores NVFP4 se marcan con activaciones de 8 bits dentro del propio archivo, porque los embeddings rinden mejor con 8 bits que con los 4 bits que Blackwell usa habitualmente en las matmul NVFP4. No se aplico RLHF, DPO ni ninguna fase de ajuste posterior; el pipeline declarado es feature-extraction.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion (retrieval).
- Embeddings multimodales: segun la model card, texto, imagenes, video y audio se proyectan en el mismo espacio de 768 dimensiones.
- Busqueda de imagenes a partir de consultas de texto (evaluada sobre Flickr-1k con R@1).
- Recuperacion de codigo, con CosQA incluido en la evaluacion de retrieval del autor.
- Soporte multilingue, con evaluacion STS sobre 11 pares de idiomas y recuperacion en aleman, bengali y perso.
- Soporte de prompts de tarea de Google (por ejemplo, `task: search result | query: ` para consultas y `title: none | text: ` para documentos).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no dispone de modo de pensamiento.

## Casos de uso

- Busqueda semantica multilingue sobre documentacion interna: indexando el corpus con el prefijo `title: none | text: ` y las consultas con `task: search result | query: `, el modelo permite recuperar fragmentos relevantes en varios idiomas desde un unico indice de 768 dimensiones, con un coste de almacenamiento de vectores muy bajo.
- Busqueda de imagenes por texto en bibliotecas de producto o archivos fotograficos: cargando el mmproj en BF16 y fijando el presupuesto de 280 tokens por imagen, el modelo alcanza un R@1 de 86,2 en Flickr-1k, suficiente para filtrado visual y catalogacion asistida.
- Deduplicacion y agrupacion de corpus: al ser un modelo de 271 M que embebe a decenas de miles de tokens por segundo, resulta viable calcular embeddings de millones de documentos y aplicar clustering o deteccion de near-duplicates en una sola GPU.
- RAG ejecutado en local o en el borde: con 184 MiB de modelo de texto, el componente de recuperacion cabe en un portatil o en un equipo sin GPU dedicada, lo que permite montar un pipeline de recuperacion que no envia datos a servicios externos.
- Enrutamiento de consultas y clasificacion por similitud: comparando el embedding de la consulta con embeddings de referencia de cada categoria se puede clasificar intencion o derivar a un flujo concreto sin entrenar un clasificador adicional.
- Recuperacion sobre repositorios de codigo: el modelo esta evaluado en CosQA, por lo que es adecuado para buscar fragmentos de codigo a partir de descripciones en lenguaje natural dentro de asistentes de desarrollo.
- Moderacion y filtrado por similitud: comparar entradas contra un conjunto de embeddings de referencia permite bloquear o marcar contenido cercano a patrones conocidos.
- Indexacion de archivos de audio o video: gracias a los codificadores multimodales incluidos, se pueden generar embeddings de pistas de audio o fotogramas y habilitar busqueda sobre archivos no textuales.

## Benchmarks y rendimiento

Datos publicados en la model card del cuantizador (no son evaluaciones independientes):

| Modelo | Tamano | Retrieval (nDCG@10) | STS multilingue | Busqueda de imagenes (R@1) |
|---|---:|---:|---:|---:|
| Original BF16 | 532 MiB | 76,06 | 82,46 | 86,7 |
| embeddinggemma-2-NVFP4 | 184 MiB | 75,51 | 82,49 | 86,2 |
| embeddinggemma-2-NVFP4-compact | 169 MiB | 75,62 | 82,48 | 86,2 |

Segun la model card, el valor de retrieval es la media sobre SciFact, NFCorpus, ArguAna, CosQA (codigo) y recuperacion en Wikipedia en aleman, bengali y perso; el valor de STS corresponde a STS17 sobre 11 pares de idiomas; y la busqueda de imagenes es text-to-image sobre Flickr-1k. El autor indica ademas que el modelo embebe a unos 85.000-90.000 tokens por segundo en una RTX 5090, tanto en BF16 como en esta cuantizacion, porque a este tamano los 4 bits no aportan ganancia de velocidad.

## Requisitos de hardware

- VRAM estimada: el modelo de texto ocupa 184 MiB (169 MiB la variante compact), y el mmproj multimodal anade 937 MiB, por lo que el conjunto completo ronda 1,1 GiB mas el espacio de cache y activaciones.
- GPU recomendadas: NVIDIA RTX 5090 para el formato NVFP4 nativo; cualquier GPU con al menos 2 GB de VRAM puede alojar el modelo de texto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU, dado el tamano del archivo.
- Nota sobre compatibilidad: NVFP4 es un formato de Blackwell. Otras GPU pueden ejecutarlo mediante los kernels de respaldo de llama.cpp, pero el autor indica que no lo ha probado.
- Opciones de despliegue: llama.cpp (version b11658 o superior) con `llama-server` y endpoint compatible con `/v1/embeddings`; LM Studio, ajustando la longitud de contexto a 2048 u 8192.
- Latencia y throughput: aproximadamente 85.000-90.000 tokens por segundo en una RTX 5090, segun el autor. No hay datos de latencia para otras GPU.
- Parametros de ejecucion relevantes: hay que aumentar `-ub` y `-b` de forma conjunta si se embeben documentos largos, y mantener los flags `--image-min-tokens 280` y `--image-max-tokens 280` cuando se trabaje con imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Retrieval (nDCG@10) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| google/embeddinggemma-2 (BF16) | 271 M | 532 MiB | 76,06 | Apache 2.0 | HuggingFace, safetensors |
| embeddinggemma-2-NVFP4 | 271 M | 184 MiB | 75,51 | Apache 2.0 | HuggingFace, GGUF |
| embeddinggemma-2-NVFP4-compact | 271 M | 169 MiB | 75,62 | Apache 2.0 | HuggingFace, GGUF |

No hay en la informacion disponible datos de comparacion con otros modelos de embeddings de la misma categoria (por ejemplo, alternativas de terceros). Los unicos datos comparativos publicados son los de las tres variantes anteriores, todos ellos procedentes de la model card del cuantizador.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. No puede usarse para generar texto, razonar de forma multi-paso ni invocar herramientas.
- Los unicos benchmarks disponibles proceden de la model card del autor de la cuantizacion, no de una evaluacion independiente ni de Google.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- La model card advierte de que el modelo base ve cada imagen con un presupuesto fijo de 280 tokens; omitir los flags de imagen en llama.cpp empeora de forma perceptible la busqueda de imagenes. La advertencia se aplica a cualquier GGUF de este modelo, no solo a esta cuantizacion.
- En LM Studio es necesario bajar la longitud de contexto a 2048 u 8192, porque el valor por defecto de 262.144 impide cargar cualquier GGUF de EmbeddingGemma 2.
- Requiere llama.cpp b11658 o superior para leer correctamente las marcas de activaciones de 8 bits.
- NVFP4 depende de hardware Blackwell para funcionar de forma nativa; en otras GPU se usan kernels de respaldo no verificados por el autor, con comportamiento y rendimiento desconocidos.
- Es imprescindible usar los prompts de tarea de Google para obtener la calidad reportada; usarlos de forma incorrecta degrada los resultados.
- No se documentan sesgos especificos de esta cuantizacion. Cualquier sesgo presente proviene del modelo base google/embeddinggemma-2 y no se analiza en esta ficha.
- Riesgo de falsos positivos en tareas de similitud y deduplicacion: la proximidad en el espacio de embeddings no garantiza equivalencia semantica real.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve la atribucion correspondiente.
- No se detallan los idiomas concretos soportados mas alla de la etiqueta "multilingual", ni la composicion del dataset de entrenamiento original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BennyDaBall/EmbeddingGemma-2-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Perfil del autor de la cuantizacion: https://x.com/BennyDaBall_OG
