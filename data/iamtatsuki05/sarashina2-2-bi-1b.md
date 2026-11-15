# iamtatsuki05/sarashina2.2-Bi-1b

## Resumen

sarashina2.2-Bi-1b es un modelo de embeddings de frases en japones obtenido a partir de sbintuitions/sarashina2.2-1b, un modelo de lenguaje causal de 1.224 millones de parametros con arquitectura Llama. La conversion, realizada por el autor iamtatsuki05, sustituye la atencion causal por atencion bidireccional siguiendo el enfoque LLM2Vec, de modo que el modelo pasa de generar texto a producir representaciones vectoriales densas para tareas de recuperacion y similitud semantica. Forma parte de la familia MIREI y constituye el punto de partida de los codificadores de frases Sentence-Sarashina-Bi-*.

El modelo resuelve el problema de obtener embeddings de alta calidad para japones reutilizando un decoder preentrenado, en lugar de entrenar un encoder desde cero. Emite vectores de 1792 dimensiones mediante mean pooling, soporta secuencias de hasta 8192 tokens y emplea un tokenizador SentencePiece con un vocabulario de 102.400 entradas, lo que resulta adecuado para un idioma con un inventario de caracteres amplio. La metrica de similitud recomendada es la similitud coseno.

Su relevancia actual radica en que ofrece una alternativa abierta, con licencia MIT y solo 1.224 millones de parametros, para pipelines de RAG y busqueda semantica en japones, con un coste de inferencia reducido y compatibilidad con la infraestructura de Transformers y Text Embeddings Inference. El modelo esta especializado exclusivamente en japones y no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama con atencion bidireccional (conversion LLM2Vec de un decoder causal) |
| Parametros totales | 1.224.038.144 (1.040 M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible en la model card; al ser pesos safetensors en bfloat16, son aplicables cuantizaciones estandar de la comunidad (GGUF, int8, etc.) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |
| Dimension del embedding | 1792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repositorio | 4,9 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/sarashina2.2-1b, un transformer decoder-only de tipo Llama con 1.224 millones de parametros y codificacion posicional RoPE. La adaptacion consiste en reemplazar la mascara de atencion causal por atencion bidireccional, siguiendo la metodologia LLM2Vec, de forma que cada token puede atender a todo el contexto y las representaciones agregadas capturan informacion de la secuencia completa. La representacion final de la frase se obtiene mediante mean pooling sobre las salidas del modelo, dando lugar a un vector de 1792 dimensiones.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron etapas de ajuste contrastivo, RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. El modelo se distribuye como base para la familia Sentence-Sarashina-Bi-* y esta documentado en el articulo de Okada y Sugimoto presentado en NLP2026, centrado en el analisis comparativo de embeddings de frases con arquitecturas encoder y decoder en las mismas condiciones.

## Capacidades

- Generacion de embeddings de frases y documentos en japones para similitud semantica y recuperacion de informacion.
- Metodos dedicados `encode_query` y `encode_document`, que permiten distinguir la representacion de consultas y de pasajes en pipelines de retrieval.
- Soporte de contextos de hasta 8192 tokens, adecuado para pasajes largos o documentos completos.
- Similitud coseno como metrica de comparacion entre vectores de 1792 dimensiones.
- Extraccion de caracteristicas (feature-extraction) a traves de la API de Transformers.
- Compatibilidad con Text Embeddings Inference y con endpoints de Hugging Face.
- No es un modelo generativo: no soporta tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al japones.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos como vectores con `encode_document` y recuperar los pasajes mas relevantes ante una consulta codificada con `encode_query`, usando similitud coseno sobre vectores de 1792 dimensiones.
- RAG sobre documentacion interna: generar embeddings de fragmentos de manuales o bases de conocimiento en japones para alimentar un generador de respuestas, aprovechando el contexto de 8192 tokens para trocear pasajes largos sin perder coherencia.
- Deduplicacion y agrupamiento de textos: calcular similitudes entre articulos, tickets o resenas en japones para detectar contenido duplicado o agrupar por tematica mediante clustering sobre los embeddings.
- Sistemas de recomendacion de contenido: representar articulos, productos o entradas de blog en japones y recomendar elementos cercanos en el espacio vectorial a los que el usuario ha consumido.
- Moderacion y clasificacion por similitud: comparar mensajes entrantes con un conjunto de referencia de casos etiquetados para asignar categorias por vecindad semantica.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud entre una frase original en japones y su reformulacion o traduccion de vuelta para detectar desviaciones semanticas.
- Construccion de indices para motores de busqueda vectorial: integrar el modelo en bases vectoriales como FAISS, Qdrant o Milvus para busqueda por similitud a escala, gracias a su tamano reducido y su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos (1.224 millones de parametros), mas memoria para activaciones y cache, que crece con la longitud de secuencia hasta 8192 tokens.
- En cuantizacion de 8 bits, los pesos ocupan alrededor de 1,2 GB; en 4 bits, aproximadamente 0,6 GB, aunque la model card no publica recetas de cuantizacion oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con secuencias moderadas; A100, H100 o L40S para procesamiento por lotes de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, incluso con secuencias largas.
- El codigo de ejemplo requiere flash-attn >= 2.7.3, transformers >= 4.51.0, accelerate >= 1.6.0 y sentencepiece >= 0.2.0.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, Text Embeddings Inference (tag text-embeddings-inference en el repositorio) y endpoints de Hugging Face. No se documenta soporte nativo en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Idiomas | Licencia |
|---|---|---|---|---|---|
| iamtatsuki05/sarashina2.2-Bi-1b | 1224 M | 8192 | 1792 | japones | MIT |
| iamtatsuki05/sarashina2.2-Bi-0.5b | 661 M | no disponible | no disponible | japones | MIT (misma familia) |
| iamtatsuki05/sarashina2.2-Bi-3b | 3093 M | no disponible | no disponible | japones | MIT (misma familia) |
| sbintuitions/sarashina2.2-1b | 1224 M | no disponible | no aplica (modelo causal) | japones | no disponible en la informacion |

Las dos alternativas de la misma familia permiten ajustar el equilibrio entre coste y calidad: la variante de 0,5b reduce el coste de inferencia y la de 3b aumenta la capacidad a cambio de mas VRAM. El modelo base sarashina2.2-1b es generativo y no produce embeddings, por lo que no es sustituible directamente en tareas de recuperacion. No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en japones: su rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- No es un modelo generativo; no debe emplearse para completar texto, razonar, invocar herramientas ni tareas de agente.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en recuperacion: similitudes altas no garantizan relevancia semantica real.
- La model card no documenta sesgos conocidos, composicion del corpus de entrenamiento ni evaluaciones de robustez.
- No se publican resultados de benchmarks, por lo que la calidad relativa frente a otros embeddings japoneses no puede verificarse con datos del autor.
- Requiere `trust_remote_code=True` y codigo personalizado (`custom_code`), lo que implica ejecutar codigo del autor del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- El uso comercial esta permitido por la licencia MIT, pero debe conservarse el aviso de copyright correspondiente.
- El repositorio tiene un numero muy bajo de descargas (5) y de likes (0), lo que sugiere poca validacion por parte de la comunidad en el momento de la consulta.
- La longitud maxima de 8192 tokens limita la codificacion de documentos muy largos, que deberan trocearse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-1b
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-1b
- Variante 0.5b: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-0.5b
- Variante 3b: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-3b
- Licencia MIT: https://opensource.org/license/mit/
- Articulo de referencia: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", NLP2026 (sin URL disponible)
