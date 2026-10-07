# perplexity-ai/pplx-embed-v2-late-9b

## Resumen

pplx-embed-v2-late-9b es un modelo de embeddings multimodal de recuperacion basado en late interaction (estilo ColBERT), desarrollado por Perplexity AI y publicado en HuggingFace. No es un modelo generativo: su funcion es producir representaciones vectoriales de consultas y documentos para busqueda semantica. Genera un vector de 128 dimensiones por token y calcula la similitud consulta-documento mediante MaxSim, lo que permite una recuperacion mas precisa que los modelos de un unico vector, a costa de un indice mucho mayor.

Esta construido sobre Qwen3.5 con atencion bidireccional e incorpora un encoder de vision, lo que lo habilita para indexar texto, imagenes y documentos visuales (paginas escaneadas, PDFs renderizados, capturas). Cuenta con 8.392.695.024 parametros totales segun los pesos en safetensors, y la model card declara 7,4 B de parametros activos. El repositorio ocupa 33,6 GB y se distribuye en formato safetensors bajo licencia MIT.

Su relevancia actual radica en dos factores: cubre la recuperacion multimodal (ViDoRe v3) con resultados de 65,2% nDCG@10 en imagenes y 64,7% en Markdown, y comparte espacio de embeddings con su variante pequena pplx-embed-v2-late-0.6b, de modo que el modelo de 0,6 B puede consultar un indice construido con el de 9 B. Esa asimetria permite abaratar el coste de codificacion de consultas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional basado en Qwen3.5 con late interaction (ColBERT) y encoder de vision |
| Parametros totales | 8.392.695.024 (8,39 B) |
| Parametros activos | 7,4 B (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | multilingue (sin listado de idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 128 por token |
| Funcion de similitud | MaxSim (late interaction) |
| Pipeline | feature-extraction |
| Libreria | sentence-transformers (>= 6.0.0) y transformers (>= 5.4.0) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de late interaction: en lugar de comprimir cada documento en un unico vector, produce una matriz de embeddings (un vector de 128 dimensiones por token) y la puntuacion final se obtiene con MaxSim, que empareja cada token de la consulta con su token mas similar del documento. Esta construido sobre Qwen3.5 con atencion bidireccional y anade un encoder de vision, por lo que procesa tanto texto como imagenes de documentos. La model card no detalla el numero de capas, la dimension oculta ni la ventana de contexto maxima.

En cuanto al entrenamiento, ambos modelos de la familia se destilaron de un teacher interno de 18 B de tipo ColBERT entrenado con datos de pares y tripletas. La destilacion uso un objetivo a nivel de token de estilo LEAF. El modelo de 0,6 B se ajusto por completo, mientras que en el de 9 B solo se ajustaron completamente las ocho ultimas capas del transformer; el resto de capas y el encoder de vision se adaptaron con LoRA. No se especifica el volumen de tokens de entrenamiento ni la composicion del dataset.

Una innovacion destacable es la compatibilidad de espacio de embeddings entre el modelo de 0,6 B y el de 9 B, lo que permite indexar con el grande y consultar con el pequeno sin reindexar. Ademas, la exportacion usa modulos nativos de Sentence Transformers a traves de `MultiVectorEncoder`, sin necesidad de codigo Python personalizado.

## Capacidades

- Recuperacion de texto mediante embeddings multi-vector con puntuacion MaxSim.
- Recuperacion multimodal: indexa imagenes y documentos visuales ademas de texto.
- Indexacion de documentos en formato Markdown, con soporte especifico evaluado en ViDoRe v3.
- Codificacion asimetrica: el modelo de 0,6 B puede consultar un indice construido con el de 9 B al compartir espacio de embeddings.
- API de dos modos separados: `encode_query` para consultas y `encode_document` para documentos.
- Capacidades multilingues declaradas de forma generica.
- No dispone de generacion de texto, tool calling, function calling, modo de razonamiento (thinking) ni soporte de agentes: es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda empresarial sobre documentacion interna: el modelo indexa PDFs, paginas escaneadas y ficheros Markdown en un mismo espacio vectorial, de modo que una consulta de texto recupera tanto fragmentos textuales como capturas de tablas o formularios.
- Recuperacion aumentada (RAG) sobre corpus multimodales: al producir 128 dimensiones por token, mantiene la granularidad necesaria para localizar pasajes concretos dentro de documentos largos, mejorando la precision del contexto que se inyecta al modelo generativo.
- Busqueda en repositorios legales o normativos: la model card incluye el ejemplo de consultas como "what statute governs limitations", y el soporte de Markdown encaja con corpus legislativos convertidos desde HTML.
- Indexacion de catalogos de producto con imagen y ficha tecnica: al compartir espacio de embeddings con la variante de 0,6 B, se puede construir el indice una sola vez con el modelo de 9 B y servir consultas de usuarios con el modelo pequeno, reduciendo el coste de inferencia en produccion.
- Deduplicacion y agrupacion semantica de documentos visuales: las matrices por token permiten umbrales de similitud mas finos que un embedding de vector unico para detectar versiones casi identicas de un mismo documento.
- Busqueda en herramientas de soporte tecnico: recuperar el articulo o ticket relevante a partir de una descripcion en lenguaje natural, incluyendo capturas de pantalla adjuntas por el usuario.
- Evaluacion y filtrado de datasets: puntuar pares consulta-documento con MaxSim para construir conjuntos de entrenamiento o para auditar la calidad de un corpus de recuperacion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de ViDoRe v3, comparando el modelo de 9 B con su variante de 0,6 B:

| Modelo | Parametros activos | Dimension | ViDoRe v3 (Image), nDCG@10 | ViDoRe v3 (Markdown), nDCG@10 |
|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 340 M | 128 | 62,3% | 61,2% |
| pplx-embed-v2-late-9b | 7,4 B | 128 | 65,2% | 64,7% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 17 GB solo para los pesos de 8,39 B, mas el encoder de vision y el overhead de activaciones; en la practica, entre 20 y 24 GB.
- VRAM estimada en int8: alrededor de 8,5 GB para los pesos. Cabe en una RTX 4090, RTX 3090 o L40S.
- VRAM estimada en int4: alrededor de 4,5 GB. Cabe en GPUs consumer de gama media con 12 GB o mas.
- La informacion disponible no documenta soporte oficial de cuantizacion, por lo que estas cifras son estimaciones derivadas del recuento de parametros y deben validarse antes de usarlas en produccion.
- GPU recomendadas para bf16 sin cuantizar: A100 40 GB, H100 80 GB, L40S 48 GB. En una RTX 4090 de 24 GB el modelo entra justo y conviene vigilar el pico de memoria durante la codificacion de lotes grandes.
- Despliegue: la via oficial es Sentence Transformers con la clase `MultiVectorEncoder` (requiere sentence-transformers >= 6.0.0 y transformers >= 5.4.0). PyLate es la libreria del ecosistema ColBERT asociada, pero la model card advierte de una incompatibilidad: PyLate inserta los marcadores Q/D en la segunda posicion y este modelo los espera en la primera.
- Memoria del indice: al almacenar 128 dimensiones por token, un millon de documentos de 200 tokens cada uno genera unos 200 millones de vectores, lo que en fp16 ocupa aproximadamente 51 GB solo en vectores. El dimensionamiento del indice suele ser mas critico que la VRAM de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Restriccion de uso: hay que usar llamadas de codificacion separadas para lotes solo de texto y solo de imagen. No se admiten entradas mixtas de texto e imagen en el mismo lote.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension por token | ViDoRe v3 (Image) | ViDoRe v3 (Markdown) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pplx-embed-v2-late-9b | 8,39 B totales / 7,4 B activos | 128 | 65,2% | 64,7% | MIT | HuggingFace |
| pplx-embed-v2-late-0.6b | 340 M activos | 128 | 62,3% | 61,2% | MIT | HuggingFace |
| Otros recuperadores multimodales de late interaction | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la variante de 0,6 B de la misma familia. La diferencia de 2,9 puntos de nDCG@10 en imagenes y 3,5 puntos en Markdown supone un incremento de mas de veinte veces los parametros activos, un coste que solo se justifica si la precision adicional es critica o si el indice se construye una unica vez.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce respuestas, no razona, no ejecuta codigo y no soporta tool calling ni agentes.
- No admite lotes con entradas mixtas de texto e imagen; obliga a separar las llamadas de codificacion.
- Incompatibilidad conocida con la convencion por defecto de PyLate: los marcadores Q/D deben ir en la primera posicion, no en la segunda.
- Requiere versiones recientes de las librerias (sentence-transformers >= 6.0.0, transformers >= 5.4.0), lo que puede complicar la integracion en stacks con dependencias fijadas.
- La longitud maxima de contexto no esta documentada en la informacion disponible, lo que impide calcular a priori como se fragmentaran los documentos largos.
- No se detalla la lista de idiomas cubiertos: la model card solo indica "multilingual".
- No se documentan sesgos conocidos ni los datos exactos de entrenamiento, mas alla de que se trata de una destilacion de un teacher interno de 18 B sobre pares y tripletas.
- El encoder de vision se adapto con LoRA, no se ajusto por completo, por lo que su rendimiento en dominios visuales muy alejados de los datos de entrenamiento puede degradarse.
- En un sistema de recuperacion, un fallo del modelo se manifiesta como falsos positivos o falsos negativos en el ranking, no como alucinacion textual; el riesgo aguas abajo es que un LLM genere una respuesta incorrecta a partir de un contexto recuperado irrelevante.
- El coste de almacenamiento del indice es proporcional al numero de tokens, no al numero de documentos, y puede crecer mucho mas rapido de lo esperado en corpus con documentos largos.
- La licencia MIT permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de copyright.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Variante de 0,6 B: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Blog de Perplexity con benchmarks y detalles: https://www.perplexity.ai/hub/blog/multimodal-embeddings-beyond-a-single-vector
- Paper del objetivo LEAF-style: https://aclanthology.org/2026.acl-long.2008/
- Sitio de Perplexity AI: https://www.perplexity.ai/
- Pagina de ayuda de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
- Perplexity en redes sociales: https://www.social.perplexity.ai/
- Entrada de Perplexity AI en Wikipedia: https://fr.wikipedia.org/wiki/Perplexity_AI
