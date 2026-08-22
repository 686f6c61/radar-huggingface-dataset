# cstr/ettin-reranker-400m-v1-GGUF

## Resumen

Ettin Reranker 400M GGUF es la version cuantizada en formato GGUF del modelo cross-encoder/ettin-reranker-400m-v1, un reranker de tipo cross-encoder basado en la arquitectura ModernBERT. Desarrollado por el equipo de Hugging Face, forma parte de la familia Ettin Reranker, entrenada con destilacion MSE punto a punto desde un profesor fuerte, con resultados de ultima generacion en todos los tamanos publicados hasta 1B de parametros.

Este repositorio, publicado por el usuario cstr, ofrece las conversiones GGUF en tres niveles de cuantizacion (F32, Q8_0 y Q4_K) mediante la libreria CrispEmbed, lo que facilita el despliegue en CPU y GPUs de consumo. Con 401,6 millones de parametros y una arquitectura de 28 capas con 1024 unidades ocultas, mantiene las capacidades del modelo original bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT cross-encoder (28 capas, 1024 unidades ocultas) |
| Parametros totales | 396.289.928 (safetensors) / 401,6M (model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0, Q4_K |
| Idiomas soportados | no disponible (benchmark de evaluacion en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT con 28 capas y 1024 unidades ocultas. La cabeza de clasificacion consiste en una capa densa (1024→1024) con activacion GELU, seguida de LayerNorm y una capa final Dense(1024→1) que produce la puntuacion de relevancia. El tokenizador es un GPT-2 ByteLevel BPE con 50368 tokens.

El entrenamiento de la familia Ettin Reranker utiliza destilacion MSE punto a punto desde un profesor fuerte, sobre una mezcla de datos de dominio amplio y especificos de recuperacion. La receta es uniforme para todos los tamanos de la familia (17M a 1B de parametros), variando solo la tasa de aprendizaje y el tamano de batch por dispositivo. El modelo original fue publicado en mayo de 2026.

## Capacidades

- **Reranking de pares (consulta, documento)**: recibe un par de textos y devuelve una puntuacion de relevancia escalar.
- **Atencion cruzada completa**: a diferencia de los bi-encoders, la consulta y el documento se atienden mutuamente a traves de todas las capas, lo que captura interacciones lexicas y semanticas profundas.
- **Integracion en pipelines de recuperacion en dos etapas**: se combina con un retriever basado en embeddings para rerankear el top-100 de resultados.
- **Cuantizacion GGUF**: compatible con frameworks que soporten este formato, incluyendo llama.cpp, Ollama y vLLM.
- **Evaluacion en MTEB**: la familia fue evaluada en el benchmark MTEB (ingles, v2) Retrieval con 10 tareas y reranking del top-100.

## Casos de uso

- **Pipelines RAG**: el modelo rerankea los resultados de un retriever denso o escaso antes de pasarlos al LLM generativo, reduciendo el ruido y mejorando la precision de las respuestas finales. Su bajo peso (253 MB en Q4_K) permite integrarlo en sistemas de produccion con recursos limitados.
- **Busqueda empresarial**: en index de documentacion corporativa, el reranker prioriza los documentos mas relevantes para cada consulta de usuario, mejorando la experiencia de busqueda en intranets y gestores documentales.
- **Atencion al cliente automatizada**: para sistemas de soporte, rerankea articulos de la base de conocimiento segun la consulta del usuario, de modo que el agente virtual recupere el contenido correcto de forma rapida y precisa.
- **Sistemas de recomendacion**: el modelo puntua la relevancia de los candidatos generados por un sistema de recuperacion previo, refinando las recomendaciones en entornos de catalogo o contenido.
- **Analisis de documentos legales**: en corpus de jurisprudencia o contratos, el reranker identifica las clausulas o precedentes mas relevantes para una consulta especifica, mejorando la productividad de los profesionales del derecho.
- **Busqueda academica**: el modelo rerankea articulos cientificos devueltos por un retriever, priorizando los trabajos mas relevantes para la consulta de investigacion del usuario.
- **Moderacion de contenido**: para identificar documentos duplicados o contenido relevante en grandes volumenes de datos, el modelo puede comparar pares de textos y asignar puntuaciones de similitud contextual.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion proporcionada. Sin embargo, la familia Ettin Reranker fue evaluada en el benchmark MTEB (ingles, v2) Retrieval con 10 tareas y reranking del top-100, y segun el blog de Hugging Face, alcanza un rendimiento de ultima generacion en todos los tamanos publicados hasta 1B de parametros. Los valores concretos para esta variante de 400M no estan disponibles en la informacion consultada.

## Requisitos de hardware

- **Tamano de los archivos**: F32 1585 MB, Q8_0 425 MB, Q4_K 253 MB.
- **VRAM estimada para inferencia**: aproximadamente 0,3 GB para Q4_K, 0,5 GB para Q8_0 y 1,6 GB para F32, mas overhead de ejecucion.
- **GPUs compatibles**: cualquier GPU con 2 GB o mas de VRAM puede ejecutar la version Q4_K; la version F32 requiere al menos 2 GB. Modelos como RTX 3060, RTX 4090 o incluso iGPUs con VRAM compartida son suficientes.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI y cualquier framework que soporte GGUF.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos contra modelos alternativos en la informacion consultada. La familia Ettin Reranker se posiciona como un estado del arte en reranking hasta 1B de parametros segun el blog oficial, pero no se proporcionan resultados numericos de otros modelos (por ejemplo, BGE-Reranker, Cohere Rerank o modelos de la familia MiniLM) para establecer una comparativa cuantitativa. Se recomienda consultar la documentacion del modelo base para obtener datos de evaluacion detallados.

## Limitaciones y advertencias

- **Idioma**: el benchmark de evaluacion se realiza en ingles (MTEB eng, v2); el rendimiento en otros idiomas no esta garantizado.
- **Longitud de contexto**: no se especifica el limite maximo de tokens; se recomienda consultar la documentacion de ModernBERT para conocer el limite nativo.
- **Dependencia del retriever**: el reranker no puede mejorar documentos que el retriever inicial no haya devuelto; su rendimiento depende de la calidad del primer paso de recuperacion.
- **Naturaleza no generativa**: es un modelo de puntuacion, no genera texto; no puede producir respuestas ni resumenes.
- **Sesgos**: al estar entrenado principalmente con datos en ingles, puede presentar sesgos linguisticos y culturales en otros dominios.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion sin restricciones de atribucion, pero se recomienda revisar los terminos del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/ettin-reranker-400m-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/cross-encoder/ettin-reranker-400m-v1
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Blog de la familia Ettin Reranker: https://github.com/huggingface/blog/blob/main/ettin-reranker.md
- Informe de la familia Ettin Reranker: https://aiflashreport.com/models/the-ettin-reranker-family/
- Version GGUF alternativa: https://huggingface.co/keisuke-miyako/ettin-reranker-v1-gguf
