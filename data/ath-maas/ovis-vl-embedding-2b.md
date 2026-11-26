# ATH-MaaS/Ovis-VL-Embedding-2B

## Resumen

Ovis-VL-Embedding-2B es un modelo compacto de embeddings vision-lenguaje desarrollado por ATH-MaaS. Su funcion es proyectar texto, imagenes, documentos visuales, video y entradas multimodales intercaladas en un unico espacio de representacion de 2048 dimensiones, lo que permite hacer recuperacion cross-modal (por ejemplo, buscar imagenes a partir de una consulta de texto) con un solo codificador de escala 2B. Se inicializa a partir de Qwen3.5-2B, conserva los codificadores nativos de texto y vision junto con el backbone multimodal compartido, elimina la cabeza de modelado de lenguaje y utiliza directamente el estado oculto de la ultima capa en el ultimo token no de relleno como embedding de recuperacion.

El modelo se plantea como un bi-encoder (no un cross-encoder): las consultas y los candidatos se codifican de forma independiente y se ordenan por similitud coseno tras normalizar L2. Esto lo hace adecuado para busqueda multimodal eficiente, RAG multimodal, recuperacion de imagenes y documentos visuales, busqueda de video y sistemas de recomendacion con presupuestos de servicio ajustados. Su licencia Apache 2.0 y su tamano de 2B lo posicionan como una opcion ligera frente a alternativas de mayor escala.

La relevancia actual radica en la demanda creciente de pipelines de recuperacion que combinen texto, imagen y video en un mismo indice vectorial, sin necesidad de mantener codificadores separados por modalidad ni cabezas de proyeccion especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Qwen3.5-2B) con capas Gated DeltaNet y atencion completa con compuerta; codificadores de texto y vision nativos; sin cabeza de modelado de lenguaje |
| Parametros totales | 2B (escala indicada en el nombre; desglose exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatibilidad con cuantizacion no documentada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone Qwen3.5-2B contiene 24 capas de lenguaje con tamano oculto 2048. Su pila hibrida repite tres capas Gated DeltaNet seguidas de una capa de atencion completa con compuerta, combinando procesamiento eficiente de contexto largo con interaccion global periodica de tokens. La codificacion posicional multimodal preserva coordenadas temporales y espaciales bidimensionales para los tokens visuales. El modelo conserva los codificadores nativos de texto y vision y el backbone multimodal compartido, pero elimina la cabeza de modelado de lenguaje y usa el estado oculto de la ultima capa en el ultimo token no de relleno como embedding de recuperacion, sin ninguna cabeza de proyeccion especifica por modalidad.

El entrenamiento consta de tres etapas: (1) preentrenamiento contrastivo multimodal a gran escala con datos multitarea, usando un objetivo que combina aprendizaje contrastivo focal sensible a la dificultad con destilacion de distribuciones de similitud; (2) ajuste fino homogeneo de parametros completos con datos de alta calidad, donde cada micro-lote proviene de un unico dataset para que los candidatos reunidos formen negativos consistentes con la tarea; y (3) destilacion de embeddings con annealing, que retiene ejemplos corregidos por el profesor, enfatiza ejemplos no resueltos del estudiante y aplica supervision KL forward adaptativa a la confianza para transferir capacidades complementarias del experto. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de embeddings de recuperacion para texto, imagenes, documentos visuales, video (muestreo de fotogramas) y entradas multimodales intercaladas en un espacio comun de 2048 dimensiones.
- Recuperacion cross-modal: consultas de texto contra candidatos de imagen, video o documento, y viceversa, mediante similitud coseno.
- Codificacion independiente de consultas y candidatos (bi-encoder), apta para indexacion previa y busqueda por vecino mas cercano.
- Soporte de instrucciones de tarea mediante prompt nativo (`Represent the user's input.`) y prompts especificos por tarea.
- Integracion con Sentence Transformers (con soporte de imagen) y con transformers.
- Tratamiento uniforme de etiquetas de clasificacion, pasajes, imagenes, documentos, videos y elementos multimodales intercalados como candidatos del mismo espacio.
- Capacidades multilingues: no disponibles (no documentadas).
- No realiza generacion de respuestas ni atencion cruzada consulta-candidato durante la recuperacion.

## Casos de uso

- Busqueda multimodal en catalogo de productos: indexar imagenes de productos y descripciones textuales en un mismo indice vectorial; una consulta de texto recupera los articulos visualmente relevantes, y una foto de referencia recupera productos similares, gracias al espacio de embeddings compartido.
- RAG multimodal sobre documentos: codificar paginas escaneadas, tablas y figuras como documentos visuales junto con pasajes de texto, de modo que un sistema de preguntas y respuestas recupere la evidencia visual y textual adecuada antes de pasarsela a un LLM generador.
- Busqueda de video por lenguaje natural: muestrear fotogramas de un archivo de video, codificarlos y almacenarlos en un indice; una consulta textual recupera los segmentos o fotogramas relevantes sin necesidad de transcripcion ni metadatos manuales.
- Moderacion y deduplicacion de contenido visual: comparar imagenes o videos mediante similitud coseno para detectar duplicados, near-duplicates o contenido practicamente identico en grandes repositorios.
- Sistemas de recomendacion visual: generar embeddings de imagenes de usuario y de items para calcular afinidad por vecino mas cercano, con un coste de servicio bajo al tratarse de un codificador de 2B.
- Clasificacion zero-shot por recuperacion: tratar las etiquetas como candidatos en el mismo espacio de embeddings y asignar la etiqueta de mayor similitud a una imagen, documento o video, sin entrenar un clasificador especifico.
- Busqueda empresarial unificada: indexar correos, PDFs, capturas y videos en un unico almacen vectorial y ofrecer una caja de busqueda que combine modalidades con un solo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,4 GB en safetensors, lo que sugiere pesos en precision de 16 bits para un modelo de 2B; en FP16 se necesitarian aproximadamente 4-5 GB de VRAM, y en cuantizaciones de 8 o 4 bits el requisito bajaria previsiblemente a 2-3 GB, aunque la compatibilidad con cuantizacion no esta documentada.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cabria en GPU de consumo como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores, asi como en A100, H100 o L40S para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM en FP16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (>=5.12.1) y Sentence Transformers (>=5.4.0 con soporte de imagen). El soporte de vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, este modelo se situa en la categoria de embeddings vision-lenguaje de escala 2B, con licencia Apache 2.0 y pesos en safetensors; las alternativas equivalentes de esa categoria no se detallan en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas ni texto; solo genera embeddings para recuperacion y similitud.
- No emplea atencion cruzada entre consulta y candidato, por lo que puede ser menos preciso que un cross-encoder en tareas de reordenacion fina.
- Los idiomas soportados no estan documentados, lo que impide garantizar un rendimiento uniforme fuera del ingles o de los idiomas presentes en el entrenamiento.
- La longitud de contexto no esta disponible, lo que limita la planificacion de documentos largos o videos con muchos fotogramas.
- Riesgo de alucinacion no aplica directamente al no generar texto, pero los embeddings pueden producir falsos positivos en recuperacion cuando las modalidades son muy dispares.
- No se documentan sesgos conocidos; al heredar el backbone Qwen3.5-2B, podria arrastrar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento y de los componentes heredados del backbone.
- La compatibilidad con tecnicas de cuantizacion y con motores de inferencia de alto rendimiento no esta documentada, lo que puede requerir validacion previa en produccion.
- El uso de instrucciones de tarea especificas afecta a la calidad de la recuperacion; es necesario ajustar los prompts por caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATH-MaaS/Ovis-VL-Embedding-2B
- Repositorio GitHub: https://github.com/ATH-MaaS/Ovis-VL-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
- Pagina arXiv del paper: https://arxiv.org/abs/2609.25165
