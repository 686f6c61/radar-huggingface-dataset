# lightonai/SlideOn

## Resumen

SlideOn es un modelo de recuperación dispersa (sparse retrieval) en inglés desarrollado por LightOn, diseñado para sustituir representaciones densas por vectores dispersos de 32.768 dimensiones compatibles con índices invertidos. Parte de DenseOn, el modelo denso de retrieval en inglés de la misma familia, y se obtiene en dos fases: un preentrenamiento con autoencoder disperso (SAE) que aprende un encoder lineal sobre las representaciones de tokens de DenseOn, seguido de un ajuste fino supervisado de retrieval. Con 174 millones de parámetros, alcanza 56,68 nDCG@10 en BEIR-15, lo que supone 0,48 puntos por encima de los 56,20 de DenseOn.

Su relevancia práctica está en el coste de búsqueda y almacenamiento: al tratarse de vectores dispersos no negativos, las dimensiones activas pueden almacenarse en un índice invertido, donde los latentes de la consulta seleccionan listas de postings y sus pesos contribuyen a la puntuación del documento. Además, incorpora entrenamiento Matryoshka conjunto para consulta y documento, de modo que la sparsity se puede recortar en inferencia (por ejemplo, 64 latentes en consulta y 512 en documento) sin reentrenar, manteniendo 56,66 nDCG@10 con un proxy de FLOPS de retrieval de 8,72.

El modelo admite entradas de hasta 8.192 tokens y se distribuye con licencia Apache 2.0, con pesos en safetensors y código personalizado integrado en la librería sentence-transformers. Es un componente de infraestructura de búsqueda, no un modelo generativo: su salida es un vector disperso por consulta o documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (heredada de DenseOn) con cabeza de encoder lineal disperso aprendida por SAE; salida de 32.768 dimensiones no negativas tras ReLU y max pooling sobre tokens |
| Parametros totales | 174.246.400 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales en la informacion disponible; pesos publicados en safetensors (repo de 0,7 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con codigo personalizado (custom_code); libreria sentence-transformers, pipeline feature-extraction |

## Arquitectura y entrenamiento

SlideOn reutiliza el conocimiento de retrieval de DenseOn. Cada representacion de token normalizada de DenseOn se proyecta mediante un encoder lineal aprendido hasta sus 32 activaciones latentes principales, a las que se aplica ReLU; el max pooling entre tokens produce un unico vector disperso por consulta o documento, y la recuperacion se resuelve con producto escalar. Las 32.768 dimensiones son caracteristicas aprendidas, independientes del vocabulario del tokenizador, lo que permite almacenar los latentes activos en un indice invertido convencional.

El entrenamiento combina un preentrenamiento con autoencoder disperso (SAE) que inicializa la representacion dispersa y un ajuste fino supervisado de retrieval sobre el dataset `lightonai/embeddings-fine-tuning-filtered-en`. Se aplica entrenamiento Matryoshka conjunto en consulta y documento, lo que permite recortar el numero de latentes activos en inferencia de forma independiente para cada lado. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma habitual en modelos de retrieval).

## Capacidades

- Generacion de embeddings dispersos para recuperacion de informacion: un vector de 32.768 dimensiones no negativas por consulta o documento, con producto escalar como funcion de scoring.
- Busqueda mediante indice invertido: los latentes activos de la consulta actuan como terminos de posting list, con pesos que suman a la puntuacion del documento.
- Sparsity ajustable en inferencia: recorte independiente de latentes en consulta y documento (por ejemplo 64 en consulta y 512 en documento) sin reentrenar.
- Soporte de secuencias largas de hasta 8.192 tokens, adecuado para documentos extensos o pasajes concatenados.
- Similitud semantica y feature extraction via sentence-transformers (`pipeline_tag: feature-extraction`).
- No incluye tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio: no es un modelo generativo.
- Multilingue: no, el modelo es exclusivamente en ingles (la variante multilingue es mSlideOn).

## Casos de uso

- Motor de busqueda documental interna: indexar el corpus como vectores dispersos en un indice invertido y resolver consultas con producto escalar, aprovechando que el coste de scoring crece con el numero de latentes activos y no con las 32.768 dimensiones.
- Busqueda en corpus largos: con 8.192 tokens de contexto se pueden indexar pasajes extensos o secciones completas sin trocear en exceso, reduciendo la perdida de contexto en documentos tecnicos o contractuales.
- Recuperacion aumentada (RAG) con requisitos de latencia ajustados: recortar la consulta a 64 latentes y los documentos a 512 reduce el proxy de FLOPS de retrieval a 8,72 manteniendo 56,66 nDCG@10, util para servir busquedas de baja latencia sobre grandes indices.
- Deduplicacion y near-duplicate detection: comparar documentos mediante similitud entre vectores dispersos, con la ventaja de que el almacenamiento se limita a los latentes activos.
- Clasificacion y clustering semantico de textos: usar los embeddings como caracteristicas de entrada en pipelines de categorizacion, enrutado de tickets o agrupacion de documentos por tematica.
- Filtrado previo en pipelines de busqueda hibrida: emplear SlideOn como recuperador sparse de primera etapa y un reranker (por ejemplo, un modelo de late interaction de la misma familia) en segunda etapa.
- Experimentacion en investigacion sobre retrieval disperso: al publicarse tambien las inicializaciones SAE (`SlideOn-SAE`) y el codigo de entrenamiento y evaluacion, sirve como base reproducible para ablaciones sobre sparsity y Matryoshka.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre BEIR-15 (media de nDCG@10 en 15 datasets, escala 0-100), con vectores de consulta y documento sin recortar y busqueda exacta sobre el corpus completo de evaluacion.

| Modelo | Parametros | BEIR-15 (nDCG@10) | Retrieval FLOPS (proxy) |
|---|---|---|---|
| SlideOn | 174M | 56,68 | 30,87 |
| LACONIC-8B | 8,03B | 60,06 | 20,07 |
| LACONIC-3B | no disponible (tabla truncada en la informacion) | no disponible (tabla truncada) | no disponible (tabla truncada) |
| DenseOn (referencia densa) | no disponible | 56,20 | no disponible |

Resultados adicionales de SlideOn con recorte de latentes:

| Configuracion | BEIR-15 (nDCG@10) | Retrieval FLOPS (proxy) |
|---|---|---|
| Sin recorte | 56,68 | 30,87 |
| Consulta y documento limitados a 512 latentes | 56,98 | no disponible |
| Consulta 64 / documento 512 | 56,66 | 8,72 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 0,7 GB en el repositorio; los 174M de parametros equivalen a aproximadamente 0,35 GB en fp16/bf16 y 0,7 GB en fp32, antes de activaciones y overhead del runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, asi como en GPUs de datacenter A100/H100 para despliegues de alto throughput por lotes.
- Tambien es viable en CPU para cargas moderadas, dado el reducido numero de parametros, aunque no se han publicado cifras de latencia.
- Opciones de despliegue: sentence-transformers (libreria declarada), transformers con `trust_remote_code=True` por el codigo personalizado del encoder disperso, y servidores de embeddings compatibles con endpoints de HuggingFace. vLLM, TGI y llama.cpp no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia de coste relativo, el proxy de FLOPS de retrieval es 30,87 sin recorte y 8,72 con consulta 64 / documento 512.
- Almacenamiento del indice: proporcional al numero de latentes activos por documento (hasta 512 en las configuraciones evaluadas), no a las 32.768 dimensiones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | BEIR-15 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SlideOn | Sparse (SAE, 32.768 dim) | 174M | 8.192 tokens | 56,68 | Apache 2.0 | HuggingFace, sentence-transformers |
| DenseOn | Dense | no disponible | no disponible | 56,20 | no disponible | HuggingFace (base de SlideOn) |
| mSlideOn | Sparse, multilingue y codigo | no disponible | no disponible (multilingue y long-context) | no disponible | no disponible | HuggingFace (`lightonai/mSlideOn`) |
| LateOn | Late interaction | no disponible | no disponible | no disponible | no disponible | HuggingFace (familia LightOn) |
| LACONIC-8B | Sparse | 8,03B | no disponible | 60,06 | no disponible | Referenciado en la model card |
| LACONIC-3B | Sparse | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |

La comparacion directa mas relevante es con DenseOn: SlideOn mejora 0,48 puntos de nDCG@10 con el mismo presupuesto de parametros y anade indexacion mediante indice invertido. Frente a LACONIC-8B, SlideOn esta 3,38 puntos por debajo en calidad pero usa aproximadamente 46 veces menos parametros.

## Limitaciones y advertencias

- Solo ingles: no cubre consultas ni documentos en castellano; para retrieval multilingue la familia ofrece mSlideOn.
- Es un modelo de retrieval, no generativo: no produce texto, no razona de forma explicita y no soporta tool calling ni agentes.
- Las dimensiones son caracteristicas latentes aprendidas, no terminos del vocabulario; la interpretabilidad de los posting lists es menor que en BM25 y requiere utilidades adicionales para inspeccionarlas.
- El recorte de latentes en inferencia degrada la calidad de forma no uniforme entre dominios; los valores publicados (64/512) son medias sobre BEIR-15 y pueden no trasladarse a corpus especializados.
- Los resultados de BEIR-15 se obtuvieron con busqueda exacta sobre el corpus completo de evaluacion; el rendimiento en un indice invertido real dependera de la implementacion y del almacenamiento efectivo de postings.
- Riesgo de alucinacion no aplicable en sentido estricto, pero si de recuperacion irrelevante: al ser un recuperador de primera etapa conviene acompanarlo de un reranker en dominios de alta precision.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica revisar y confiar en el codigo del repositorio antes de desplegarlo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar las condiciones de los datos de entrenamiento derivados del dataset `lightonai/embeddings-fine-tuning-filtered-en` antes de un despliegue critico.
- No se han publicado datos de sesgo, robustez adversarial ni evaluacion fuera de BEIR-15 en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/SlideOn
- Variante multilingue mSlideOn: https://huggingface.co/lightonai/mSlideOn
- Inicializacion SAE en ingles (SlideOn-SAE): https://huggingface.co/lightonai/SlideOn-SAE
- Inicializacion SAE multilingue (mSlideOn-SAE): https://huggingface.co/lightonai/mSlideOn-SAE
- Coleccion SlideOn y mSlideOn: https://huggingface.co/collections/lightonai/slideon-and-mslideon
- Blog post con metodo, resultados y ablaciones: https://huggingface.co/blog/lightonai/slideon-mslideon
- Codigo de entrenamiento y evaluacion: https://github.com/lightonai/slideon-mslideon/
- Modelo base DenseOn: https://huggingface.co/lightonai/DenseOn
- Blog de DenseOn y LateOn: https://huggingface.co/blog/lightonai/denseon-lateon
- Blog de mDenseOn y mLateOn: https://huggingface.co/blog/lightonai/mdenseon-mlateon
- Dataset de ajuste fino: https://huggingface.co/datasets/lightonai/embeddings-fine-tuning-filtered-en
- Web de LightOn: https://lighton.ai
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre el modelo (devuelven unicamente paginas de Rothschild & Co), por lo que no se anaden mas enlaces.
