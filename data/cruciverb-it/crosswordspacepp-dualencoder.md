# cruciverb-it/crosswordspacepp-dualencoder

## Resumen

CrosswordSpace++ dual encoder es un modelo de recuperacion (retrieval) disenado especificamente para resolver pistas de crucigrama en italiano. Lo desarrolla el grupo cruciverb-it y se publica bajo licencia CC BY 4.0. No es un modelo generativo: su funcion es proyectar pistas y respuestas candidatas a un espacio vectorial compartido de 768 dimensiones, de modo que la respuesta correcta pueda recuperarse mediante busqueda por producto interno (FAISS) sobre un vocabulario de respuestas.

Tecnicamente es un Asymmetric Dual Encoder (ADE) construido sobre dos torres transformer independientes derivadas de sentence-transformers/paraphrase-multilingual-mpnet-base-v2: una codifica la pista y otra la respuesta. Suma 556.679.424 parametros y trabaja con secuencias cortas (64 tokens para pistas, 16 para respuestas), lo que refleja la naturaleza del dominio: pistas de una linea y respuestas de una o pocas palabras.

Su relevancia actual es doble. Por un lado, forma parte del pipeline CrosswordSpace++, donde actua como recuperador de primera etapa y sus 100 mejores candidatos se reranquean con un cross-encoder, elevando la precision de 57,9 a 68,2 en Acc@1. Por otro, se enmarca en la tarea CruciverbIT de EVALITA 2026, que fija un punto de referencia reproducible para el procesamiento del lenguaje natural aplicado a crucigramas en italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Asymmetric Dual Encoder (ADE): dos torres transformer independientes (una para pistas, otra para respuestas), mean pooling, LayerNorm compartida y cabeza de proyeccion lineal compartida |
| Parametros totales | 556.679.424 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens para pistas y 16 tokens para respuestas (longitud maxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | Italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Modelo base | sentence-transformers/paraphrase-multilingual-mpnet-base-v2 |
| Funcion de similitud | Producto interno sobre embeddings normalizados (compatible con indice FAISS) |
| Tamano del repositorio | 2,2 GB |
| Requiere codigo remoto | Si (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un dual encoder asimetrico: la torre de pistas y la torre de respuestas son encoders separados, cada uno derivado del mismo modelo base, con una LayerNorm compartida y una cabeza de proyeccion lineal compartida que lleva ambas representaciones a un unico espacio de 768 dimensiones. La asimetria tiene sentido en este dominio, porque la distribucion de pistas (frases cortas, a menudo con juegos de palabras) difiere mucho de la de respuestas (palabras o sintagmas de una a tres palabras). El pooling es un mean pooling sobre la ultima capa oculta, y la similitud se calcula como producto interno entre vectores normalizados. La model card menciona encoders XLM-RoBERTa en la descripcion de arquitectura y a la vez declara paraphrase-multilingual-mpnet-base-v2 como encoder base; ambos tienen un tamano del orden de 278 millones de parametros, coherente con los 556,7 millones totales de las dos torres.

El entrenamiento es puramente contrastivo, sin RLHF ni DPO. Se optimiza una perdida InfoNCE simetrica con mineria de negativos duros en el propio lote (in-batch hard negative mining), donde la fraccion de negativos duros decae linealmente de 0,8 a 0,2 a lo largo del entrenamiento, junto con una temperatura aprendible. Los datos proceden del split de entrenamiento de EVALITA 2026 CruciverbIT Task 1: 374.766 pares pista-respuesta, con batch size 256 durante 10 epocas. El checkpoint publicado es el paso 13.899, seleccionado por tener la menor perdida de validacion. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a un modelo encoder-only de recuperacion.

## Capacidades

- Extraccion de caracteristicas: genera embeddings de 768 dimensiones para cada entrada, ya sea una pista, una respuesta o ambas.
- Recuperacion de respuestas a pistas de crucigrama en italiano: dado un texto de pista, devuelve candidatos ordenados por similitud.
- Codificacion asimetrica: permite codificar solo pistas o solo respuestas invocando una unica torre y aplicando despues la LayerNorm y la proyeccion compartidas.
- Busqueda a gran escala: los embeddings normalizados son compatibles con indices FAISS de producto interno, lo que permite recuperar top-k sobre vocabularios grandes.
- Filtrado por longitud: el sistema de referencia restringe el indice a respuestas de la longitud esperada, lo que aumenta la precision efectiva.
- Similitud pista-respuesta: produce puntuaciones comparables entre pares, utiles para ranking o umbralizado.
- Capacidades multilingues: no declaradas. El encoder base es multilingue, pero el modelo solo se ha ajustado y evaluado en italiano.
- Tool calling / function calling: no soportado; es un modelo encoder-only sin generacion de texto.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; se integra como etapa de recuperacion dentro de un pipeline mayor.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Resolucion automatica de crucigramas italianos: el modelo recupera las respuestas candidatas para cada pista de la rejilla y las ordena por similitud; con el filtrado por longitud y el reranker del pipeline se alcanza un 68,2 de Acc@1 en el conjunto de test de EVALITA 2026.
- Primera etapa de un pipeline de reranking: se usa para obtener los 100 mejores candidatos por longitud y se pasan a un cross-encoder, que reordena la lista; esta combinacion eleva el MRR@10 de 65,8 a 74,5.
- Asistente interactivo para crucigramistas: dado el texto de una pista y el numero de letras, el sistema devuelve una lista corta de respuestas probables, util en aplicaciones de ayuda con intervencion humana.
- Construccion y depuracion de bases de datos de pistas: los embeddings permiten detectar pistas duplicadas o semanticamente equivalentes dentro de un corpus, agrupandolas por similitud coseno.
- Aumentacion de datos para entrenamiento: se pueden generar candidatos plausibles por pista para ampliar vocabularios de respuesta o construir ejemplos negativos duros para otros modelos del mismo dominio.
- Busqueda semantica en diccionarios y glosarios italianos: el espacio compartido permite consultar una definicion y recuperar entradas lexicas afines, reutilizando la infraestructura de FAISS.
- Validacion de propuestas de rejilla: en herramientas de generacion de crucigramas, el modelo puntua si una respuesta encaja con una pista dada antes de fijar la cuadricula.
- Filtrado previo en tareas EVALITA: sirve como linea base reproducible para comparar sistemas en CruciverbIT Task 1, ya que el autor publica los resultados sobre el test oficial de 20.821 pistas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de EVALITA 2026 CruciverbIT Task 1 (20.821 pistas), con el indice restringido a respuestas de la longitud esperada. Segun el model-index, estas cifras no han sido verificadas de forma independiente.

| Sistema | Acc@1 | Acc@10 | MRR@10 |
|---|---|---|---|
| Bi-encoder (este modelo) | 57,9 | 80,9 | 65,8 |
| Bi-encoder + mezcla con cross-encoder (alfa = 0,17) | 68,2 | 85,5 | 74,5 |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo encoder-only de recuperacion.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,2 GB solo para los pesos (556.679.424 parametros x 4 bytes), mas overhead de activaciones y runtime, en torno a 2,5-3 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para los pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 funcionan con margen amplio. Las A100 y H100 estan sobredimensionadas para este modelo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en tarjetas de gama de entrada con 4-6 GB.
- CPU: la inferencia en CPU es viable para cargas moderadas, ya que cada torre ronda los 278 millones de parametros y las secuencias son de 64 y 16 tokens como maximo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado del repositorio), Text Embeddings Inference (TEI), ONNX Runtime, TorchServe o un servicio FastAPI propio. No aplica vLLM, que esta orientado a modelos generativos.
- Indice FAISS: cada vector de 768 dimensiones ocupa unos 3 KB en fp32; el consumo de RAM o VRAM depende del numero de respuestas indexadas.
- Latencia y throughput: no disponible; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Acc@1 | Licencia |
|---|---|---|---|---|---|
| crosswordspacepp-dualencoder | Dual encoder asimetrico | 556,7 M | Recuperacion de respuestas a pistas (etapa 1) | 57,9 | CC BY 4.0 |
| crosswordspacepp-reranker | Cross-encoder | No disponible | Reranking de candidatos (etapa 2) | 68,2 en combinacion | No disponible |
| crossword-space-mpnet-base-ade | Dual encoder asimetrico (misma arquitectura) | No disponible | Recuperacion de respuestas a pistas | No disponible | No disponible |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | Bi-encoder simetrico de proposito general | ~278 M | Similitud de frases multilingue | No disponible para esta tarea | No disponible |

La comparacion directa con alternativas de otros autores no esta disponible en la informacion proporcionada. Los unicos puntos de referencia publicados son el propio pipeline CrosswordSpace++ y la version previa de la misma arquitectura.

## Limitaciones y advertencias

- Especifico de dominio: el modelo esta ajustado exclusivamente para pistas de crucigrama en italiano; su rendimiento fuera de ese dominio no esta caracterizado.
- Dependencia del filtrado por longitud: todos los resultados publicados asumen que el indice se restringe a respuestas de la longitud esperada. Sin ese filtro, las cifras de precision no son extrapolables.
- Idioma unico: solo se declara italiano. Aunque el encoder base es multilingue, no hay evaluacion en otras lenguas.
- Truncamiento agresivo: 64 tokens para pistas y 16 para respuestas. Las pistas largas o las respuestas multipalabra extensas se truncan, lo que puede degradar la representacion.
- No es generativo: no puede explicar sus respuestas ni producir texto; solo devuelve puntuaciones de similitud. Como consecuencia, no hay riesgo de alucinacion en el sentido generativo, pero si de recuperar candidatos incorrectos con puntuaciones altas.
- Sesgos: no se ha publicado ningun analisis de sesgos en la informacion disponible.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false`, es decir, son declaraciones del autor sin validacion externa.
- Codigo remoto: el repositorio usa `custom_code` y requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor al cargar el modelo. Conviene auditar `model.py` antes de usarlo en produccion.
- Licencia: CC BY 4.0 permite uso comercial, pero exige atribucion al autor y la indicacion de la licencia en los trabajos derivados.
- Adopcion marginal: el repositorio registra 0 descargas y 2 likes en el momento de la consulta, por lo que la comunidad de usuarios y el soporte son practicamente inexistentes.
- Discrepancia en la documentacion: la model card describe las torres como XLM-RoBERTa y a la vez declara paraphrase-multilingual-mpnet-base-v2 como encoder base. Conviene verificar la arquitectura real en el codigo antes de integrarla.
- Citacion pendiente: el bloque BibTeX de la model card figura como TBD.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cruciverb-it/crosswordspacepp-dualencoder
- Dataset de evaluacion: https://huggingface.co/datasets/cruciverb-it/evalita2026
- Cross-encoder de reranking del pipeline: https://huggingface.co/cruciverb-it/crosswordspacepp-reranker
- Version previa de la arquitectura ADE: https://huggingface.co/cruciverb-it/crossword-space-mpnet-base-ade
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Codigo del proyecto: https://github.com/snizio/crosswordspacepp
