# ATH-MaaS/Ovis-VL-Embedding-2B

## Resumen

Ovis-VL-Embedding-2B es un modelo compacto de embeddings vision-lenguaje desarrollado por ATH-MaaS que proyecta texto, imagenes, documentos visuales, video y entradas multimodales intercaladas en un unico espacio de representacion de 2048 dimensiones. Se inicializa a partir de Qwen3.5-2B: conserva los codificadores nativos de texto y vision junto con el backbone multimodal compartido, elimina la cabeza de modelado de lenguaje y utiliza directamente el estado oculto de la ultima capa en el ultimo token no de relleno como embedding de recuperacion, sin anadir ninguna cabeza de proyeccion especifica por modalidad.

El modelo responde a un problema concreto: la busqueda y el retrieval multimodal bajo presupuestos de servicio ajustados. Al tratarse de un bi-encoder de escala 2B, permite indexar corpus heterogeneos (pasajes, imagenes, paginas de documentos, fotogramas de video) en un mismo espacio vectorial y resolver consultas cruzadas con similitud coseno, algo que hasta ahora solia requerir encoders de mayor tamano o arquitecturas separadas por modalidad.

Su relevancia actual se apoya en los resultados publicados en MMEB-v2, un banco de evaluacion de 78 conjuntos de datos: alcanza 77,46 de media global, 2,04 puntos por encima del mejor baseline comparado, con 80,62 en imagen y 80,47 en documento visual. La licencia Apache-2.0 y su tamano lo situan como candidato directo para produccion en GPUs de consumo y para pipelines de RAG multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (24 capas de lenguaje, hidden size 2048); pila hibrida que repite 3 capas Gated DeltaNet seguidas de 1 capa de atencion completa con gating |
| Parametros totales | Aproximadamente 2.000 millones (derivado de Qwen3.5-2B; el autor no desglosa el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (no hay GGUF ni cuantizaciones oficiales anunciadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 2048 (heredada directamente del backbone, sin cabeza de proyeccion) |
| Tipo de modelo | Bi-encoder de recuperacion (no cross-encoder) |
| Backbone | Qwen3.5-2B |
| Modalidades de entrada | Texto, imagen, documento visual, video (fotogramas muestreados) y entradas multimodales intercaladas |
| Tamano del repositorio | 4,4 GB |
| Libreria | transformers |
| Pipeline declarado | feature-extraction |
| Descargas / likes | 105 descargas, 25 likes |
| Fechas | Creado el 21 de septiembre de 2026; actualizado el 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El backbone Qwen3.5-2B contiene 24 capas de lenguaje con tamano oculto 2048. Su pila hibrida repite tres capas Gated DeltaNet seguidas de una capa de atencion completa con gating, combinando procesamiento eficiente de contexto largo con interaccion global periodica entre tokens. El codificador de vision y el codificador de texto nativos se conservan junto al backbone multimodal compartido, y la codificacion posicional multimodal preserva las coordenadas temporales y espaciales bidimensionales de los tokens visuales. La cabeza de modelado de lenguaje se elimina y la recuperacion se resuelve con el estado oculto de la ultima capa en el ultimo token no de relleno, L2-normalizado, sin cabezas de proyeccion por modalidad.

El entrenamiento se articula en tres etapas descritas por el autor. La primera es un preentrenamiento contrastivo multimodal sobre datos multitarea a gran escala, con un objetivo que combina aprendizaje contrastivo focal sensible a la dificultad y destilacion de distribuciones de similitud. La segunda es un ajuste fino homogeneo de todos los parametros con datos de downstream de alta calidad, donde cada micro-lote se extrae de un unico conjunto de datos para que los candidatos agregados formen negativos consistentes con la tarea. La tercera es una destilacion de embeddings con annealing: se retienen los ejemplos que el profesor acierta, se enfatizan los que el estudiante no resuelve y se transfiere supervision forward-KL adaptativa a la confianza. El autor no publica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset, ni menciona fases de RLHF o DPO (no aplicables a un modelo de embeddings).

## Capacidades

- Generacion de embeddings para texto, imagen, documento visual, video y combinaciones intercaladas de varias modalidades en un unico espacio.
- Recuperacion cruzada: texto a imagen, imagen a texto, imagen a imagen y texto a documento visual.
- Busqueda sobre documentos visuales: paginas con maquetacion, tablas y figuras.
- Busqueda de video y recuperacion de momentos concretos dentro de un video (video moment retrieval), segun los resultados reportados.
- Clasificacion y etiquetado tratando las etiquetas como candidatos dentro del mismo espacio de embeddings.
- Coincidencia por vecinos mas cercanos sobre vectores normalizados, con similitud coseno equivalente al producto escalar.
- Interfaz bi-encoder: consulta y candidatos se codifican de forma independiente, lo que permite precalcular y almacenar los embeddings de todo el corpus.
- Soporte de instrucciones de tarea emparejadas con la consulta y formateadas con el procesador nativo y la plantilla de chat.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo de razonamiento explicito, audio ni generacion de texto (la cabeza de lenguaje se elimina).

## Casos de uso

- RAG multimodal sobre documentacion tecnica: indexar manuales, informes y articulos en PDF con el encoder, almacenar los vectores de 2048 dimensiones y recuperar las paginas relevantes ante una consulta en lenguaje natural, incluyendo tablas y figuras que un pipeline puramente textual descartaria.
- Busqueda semantica de video: muestrear fotogramas, generar un embedding por fotograma y recuperar tanto videos completos como el momento concreto que responde a la consulta, aprovechando la puntuacion de 67,12 en el grupo de video de MMEB-v2.
- Deduplicacion y deteccion de casi duplicados en catalogos de imagenes: la representacion unica por imagen permite agrupar por similitud coseno y reducir el almacenamiento sin depender de hashes perceptuales fragiles ante recortes o reescalados.
- Recomendacion de productos o contenidos: recuperar candidatos por similitud entre la representacion de la consulta o de un item de referencia y el catalogo precalculado, usando el modelo como etapa de recall de bajo coste.
- Clasificacion zero-shot y enrutado de contenidos: representar las etiquetas como candidatos en el mismo espacio y asignar la clase con mayor similitud, sin entrenar un clasificador especifico.
- Etapa de recuperacion previa a un re-ranking: al ser un bi-encoder, permite precalcular el corpus completo y reducir de millones a decenas de candidatos antes de aplicar un cross-encoder mas costoso.
- Busqueda empresarial interna unificada: un solo indice que cubre correo, capturas de pantalla, presentaciones y video de reuniones, evitando mantener indices separados por modalidad.
- Moderacion y filtrado de contenido visual: comparar imagenes entrantes contra un conjunto de referencia de contenido no permitido mediante vecinos mas cercanos.

## Benchmarks y rendimiento

Resultados publicados en la model card para MMEB-v2 (78 conjuntos de datos; porcentajes, mayor es mejor):

| Grupo | Ovis-VL-Embedding-2B | Mejor baseline comparado | Diferencia |
|---|---:|---:|---:|
| Imagen | 80,62 | 77,41 | +3,21 |
| Video | 67,12 | 68,84 | -1,72 |
| Documento visual | 80,47 | 79,86 | +0,61 |
| Todos los 78 conjuntos | 77,46 | 75,42 | +2,04 |

Segun el autor, el modelo ocupa el primer puesto en las cuatro subtareas de imagen, en clasificacion de video, en recuperacion de momentos de video, en el agregado de documento visual, en ViDoRe-V1 y en recuperacion de documentos visuales fuera de distribucion. Las mayores ganancias se concentran en comprension de imagen y recuperacion de documentos, mientras que en video temporal queda 1,72 puntos por debajo del mejor baseline comparado. La model card indica que la comparativa completa incluye cuatro baselines de embeddings vision-lenguaje, pero no se identifican por nombre en la informacion disponible. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de generacion, coherentemente con que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 5-6 GB solo para pesos (el repositorio ocupa 4,4 GB) mas el coste de activaciones, que crece con el numero de imagenes o fotogramas por secuencia. Estimacion orientativa, no publicada por el autor.
- VRAM estimada tras cuantizacion: aproximadamente 2,5-3 GB en int8 y 1,5-2 GB en int4, siempre que exista soporte de la arquitectura hibrida Gated DeltaNet en el runtime elegido. El autor no publica pesos cuantizados.
- GPU recomendadas: cabe con holgura en RTX 4090, RTX 4080, RTX 3090 y A100/H100 para indexacion a gran escala. En GPUs de 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, la inferencia en bf16 es viable reduciendo el numero de fotogramas o imagenes por lote.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas de VRAM para texto e imagen; el video requiere procesar fotogramas en lotes pequenos.
- Opciones de despliegue: la libreria declarada es transformers. No hay confirmacion en la informacion disponible de soporte en vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF.
- Latencia y throughput: no disponible. Al ser un bi-encoder, el coste dominante en produccion es la codificacion del corpus (offline) y no la comparacion de vectores, que se resuelve con busqueda por producto escalar sobre vectores normalizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMEB-v2 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovis-VL-Embedding-2B | ~2B | no disponible | 77,46 | Apache-2.0 | HuggingFace (transformers, safetensors) |
| Mejor baseline comparado en MMEB-v2 | no disponible | no disponible | 75,42 | no disponible | no disponible |
| Ovis-VL-Embedding-9B | no disponible (version mayor citada en la figura del informe tecnico) | no disponible | no disponible | Apache-2.0 (por confirmar) | no disponible |
| Ovis-Embedding-Omni-3B | no disponible (citado en la figura del informe tecnico) | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de embeddings vision-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite la comparacion agregada frente al mejor baseline de MMEB-v2 y la mencion de dos modelos hermanos de la misma familia. No se dispone de especificaciones de contexto, licencia ni resultados individuales de los cuatro baselines incluidos en el informe tecnico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. El backbone Qwen3.5-2B puede arrastrar sesgos de sus datos de preentrenamiento, no evaluados en la model card.
- Riesgo de alucinacion: bajo en la funcion de recuperacion, porque el modelo no genera texto ni respuestas; el riesgo se traslada al generador que consuma los candidatos recuperados.
- No es un cross-encoder: no realiza atencion cruzada entre consulta y candidato, por lo que su capacidad de discriminacion fina es inferior a la de un reranker y conviene combinarlo con una segunda etapa.
- Limitaciones de contexto: no se publica la longitud de contexto soportada, lo que impide planificar con margen el numero de fotogramas de video o el tamano de documento por secuencia.
- Limitaciones de idioma: la tarjeta de HuggingFace no declara idiomas soportados; no hay garantia documentada de rendimiento multilingue fuera del que herede el backbone.
- Rigidez de la interfaz: consultas y candidatos deben usar el mismo preprocesado, la misma regla de pooling, la misma dimensionalidad (2048) y la misma normalizacion L2. Cualquier variacion rompe la comparabilidad de los vectores.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se detalla la procedencia de los datos de entrenamiento ni posibles restricciones de terceros sobre ellos.
- Madurez: el modelo acumula 105 descargas y 25 likes, y la model card disponible esta truncada; el soporte en runtimes de inferencia de alto rendimiento para la pila hibrida Gated DeltaNet no esta confirmado.
- Rendimiento en video: queda 1,72 puntos por debajo del mejor baseline comparado en el grupo de video de MMEB-v2, por lo que en ese dominio conviene validar antes de sustituir una solucion existente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATH-MaaS/Ovis-VL-Embedding-2B
- Informe tecnico (PDF): https://arxiv.org/pdf/2609.25165
- Informe tecnico (HTML): https://arxiv.org/html/2609.25165v1
- Repositorio en GitHub citado en la model card: https://github.com/ATH-MaaS/Ovis-VL-Embedding
