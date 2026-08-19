# lightonai/LateOn

## Resumen

LateOn es un modelo de recuperación (retrieval) multi-vector basado en la arquitectura ColBERT, desarrollado por la empresa francesa LightOn. Construido sobre el backbone ModernBERT de 149 millones de parámetros, está diseñado para tareas de búsqueda semántica y similitud de frases, produciendo embeddings por token en lugar de un único vector denso. Su principal aportación es lograr resultados de vanguardia en benchmarks de recuperación (BEIR) con un tamaño relativamente compacto, superando a modelos ColBERT cuatro veces más grandes como Jina ColBERT v2 o Arctic Embed L v2.

El modelo se publica bajo licencia Apache 2.0 y ha sido entrenado íntegramente con datos abiertos, tanto en la fase de preentrenamiento como en el ajuste fino. LightOn libera también los datasets utilizados y las anotaciones de filtrado, lo que permite reproducir, extender o modificar el pipeline de entrenamiento. LateOn alcanza una media de 57.22 nDCG@10 en los 15 datasets de BEIR y 60.36 en la versión decontaminada de 12 datasets, situándose como el mejor modelo ColBERT disponible hasta la fecha de su publicación. No se ha aplicado destilación de conocimiento ni prompts asimétricos, técnicas que el propio autor señala como posibles vías de mejora futura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (multi-vector) sobre backbone ModernBERT-base |
| Parametros totales | 149.015.808 (149M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la documentacion del modelo (el backbone ModernBERT-base soporta 8192 tokens, pero no se confirma para LateOn) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LateOn emplea la arquitectura ColBERT, que genera una representacion vectorial por cada token del texto de entrada. A diferencia de los modelos densos que producen un unico embedding, ColBERT permite una comparacion mas granular entre consultas y documentos mediante la similitud del producto escalar entre los vectores de tokens, lo que mejora la precision en tareas de recuperacion. El backbone es ModernBERT-base, un transformer encoder de 149M de parametros optimizado para eficiencia en GPU y CPU.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento contrastivo sobre un corpus de 1.400 millones de pares consulta-documento recopilado y filtrado por LightOn, con filtros estructurales, deduplicacion y relevancia evaluada mediante cross-encoders. Segundo, un ajuste fino supervisado con hard-negative contrastive training, utilizando 1.88 millones de muestras con consultas, documentos positivos y 2048 documentos negativos minados. Todos los datos y las anotaciones de filtrado se han publicado en HuggingFace. No se aplico destilacion de conocimiento ni prompts asimetricos, aunque el autor indica que ambas tecnicas podrian mejorar aun mas los resultados.

## Capacidades

- Recuperacion de documentos y pasajes mediante embeddings multi-vector (ColBERT).
- Similitud de frases y busqueda semantica con granularidad a nivel de token.
- Generacion de embeddings para consultas y documentos, compatible con la libreria PyLate y con el ecosistema sentence-transformers.
- Soporte para indexacion y busqueda eficiente mediante FastPLAID, la implementacion de PLAID para ColBERT de LightOn.
- Integracion con text-embeddings-inference (TEI) de HuggingFace para despliegue en produccion.
- Capacidad multilingue limitada: el modelo esta entrenado exclusivamente en ingles.
- No soporta tool calling, agentes ni generacion de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en corpus empresariales: LateOn puede indexar miles de documentos internos y recuperar los pasajes mas relevantes para una consulta en lenguaje natural, gracias a su representacion multi-vector que captura matices de significado a nivel de token. Es adecuado para motores de busqueda interna en empresas con grandes volumenes de documentacion tecnica o legal.
- Sistemas de respuesta a preguntas con recuperacion aumentada (RAG): al integrarse en un pipeline RAG, LateOn recupera los fragmentos de contexto mas pertinentes antes de pasarlos a un modelo generativo, mejorando la fidelidad de las respuestas y reduciendo alucinaciones. Su rendimiento en BEIR (57.22 nDCG@10) lo hace competitivo frente a modelos mucho mayores.
- Moderacion y clasificacion de contenido: los embeddings multi-vector pueden utilizarse para detectar duplicados, agrupar documentos por tematica o identificar contenido similar en grandes colecciones, por ejemplo en plataformas de noticias o redes sociales.
- Atencion al cliente automatizada: un sistema de tickets puede usar LateOn para encontrar automaticamente respuestas a partir de un historial de incidencias resueltas, emparejando la consulta del usuario con los casos mas similares y sugiriendo soluciones previas.
- Busqueda academica y cientifica: investigadores pueden indexar articulos de arXiv o PubMed y realizar consultas complejas como "metodos de atencion lineal para transformers" obteniendo resultados precisos, incluso con terminologia especializada que los modelos densos suelen perder.
- Recuperacion en entornos con restricciones de hardware: al ser un modelo de 149M de parametros, LateOn puede ejecutarse en GPUs de consumo (por ejemplo RTX 3090 o 4090) o incluso en CPU con cuantizacion, lo que permite desplegar busqueda semantica en infraestructuras modestas sin sacrificar rendimiento.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados de NDCG@10 en los 15 datasets de BEIR, comparando LateOn con otros modelos ColBERT publicados. Los datos provienen de la documentacion oficial del modelo.

| Modelo | Media BEIR (15) | Tamano (M) | Dim. embedding |
|---|---|---|---|
| ColBERTv2 | 48.63 | 110 | 128 |
| Jina-ColBERT-v2 | 51.85 | 600 | 128 |
| ColBERT-small | 53.79 | 33 | 96 |
| GTE-ModernColBERT-v1 | 54.75 | 149 | 128 |
| ColBERT-Zero | 55.39 | 149 | 128 |
| **LateOn** | **57.22** | **149** | **128** |

Ademas, en la version decontaminada de BEIR (12 datasets, eliminando solapamientos de entrenamiento), LateOn alcanza 60.36 nDCG@10, ocupando el primer puesto entre todos los modelos ColBERT evaluados. No se han publicado resultados en otros benchmarks como MMLU o HumanEval, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32, el modelo ocupa aproximadamente 600 MB; en FP16, unos 300 MB. Para indexar colecciones grandes se requiere memoria adicional para los vectores de tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequenos. Una RTX 3090 o 4090 permite procesar grandes volumenes con baja latencia. Tambien es viable en CPU con cuantizacion.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU moderna de gama media o alta.
- Opciones de despliegue: PyLate (libreria nativa), FastPLAID para indexacion y busqueda eficiente, text-embeddings-inference (TEI) de HuggingFace, y potencialmente vLLM si se adapta (aunque vLLM esta orientado a modelos generativos, no a embeddings).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano de 149M, se espera una latencia por consulta de pocos milisegundos en GPU y decenas de milisegundos en CPU, con throughput suficiente para sistemas de produccion de alta demanda.

## Comparativa con modelos similares

LateOn se compara directamente con otros modelos ColBERT de distintos tamanos:

| Modelo | Parametros | Contexto | Media BEIR (15) | Licencia |
|---|---|---|---|---|
| ColBERTv2 | 110M | 512 tokens | 48.63 | MIT |
| Jina-ColBERT-v2 | 600M | 8192 tokens | 51.85 | Apache 2.0 |
| ColBERT-small | 33M | 2048 tokens | 53.79 | Apache 2.0 |
| GTE-ModernColBERT-v1 | 149M | 8192 tokens | 54.75 | Apache 2.0 |
| ColBERT-Zero | 149M | 8192 tokens | 55.39 | Apache 2.0 |
| **LateOn** | **149M** | **no especificado** | **57.22** | **Apache 2.0** |

LateOn supera a todos los modelos ColBERT existentes en BEIR, incluidos modelos cuatro veces mayores como Jina-ColBERT-v2. Su ventaja principal radica en el uso de datos de entrenamiento abiertos y de alta calidad, asi como en un ajuste fino con hard negatives. Frente a modelos densos de tamano similar (por ejemplo, DenseOn, su variante densa), LateOn ofrece mejor generalizacion y manejo de contextos largos, aunque requiere mas recursos de indexacion por la naturaleza multi-vector.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; su rendimiento en otros idiomas es muy limitado o nulo.
- No se ha aplicado destilacion de conocimiento ni prompts asimetricos, tecnicas que el propio autor reconoce como potenciales mejoras. Por tanto, puede haber margen de optimizacion no explotado.
- Al ser un modelo de embeddings, no genera texto ni realiza razonamiento; solo produce representaciones vectoriales.
- La longitud de contexto no esta especificada en la documentacion, aunque el backbone ModernBERT soporta hasta 8192 tokens. Se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- Los datos de entrenamiento, aunque abiertos, pueden contener sesgos inherentes a las fuentes recopiladas. LightOn ha publicado los datasets para permitir auditorias, pero no se ha realizado un analisis exhaustivo de sesgos.
- Riesgo de alucinacion no aplica directamente al ser un modelo de recuperacion, pero si se usa en un pipeline RAG, la calidad de la recuperacion depende de la cobertura del corpus indexado.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y no se ofrece garantia alguna sobre el rendimiento en dominios especificos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LateOn
- Blog de LightOn sobre DenseOn y LateOn: https://huggingface.co/blog/lightonai/denseon-lateon
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio FastPLAID: https://github.com/lightonai/fast-plaid
- Coleccion de modelos DenseOn y LateOn: https://huggingface.co/collections/lightonai/denseon-and-lateon
- Dataset de preentrenamiento: https://huggingface.co/datasets/lightonai/embeddings-pre-training
- Dataset de preentrenamiento curado: https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated
- Dataset de fine-tuning: https://huggingface.co/datasets/lightonai/embeddings-fine-tuning
- Version no supervisada de LateOn: https://huggingface.co/lightonai/LateOn-unsupervised
- Estudio ColBERT-Zero: https://huggingface.co/lightonai/ColBERT-Zero
