# lightonai/mSlideOn

## Resumen

mSlideOn es un modelo de recuperación dispersa (sparse retrieval) multilingüe desarrollado por LightOn. Convierte consultas y documentos en vectores dispersos no negativos de 32.768 dimensiones, de los cuales solo se conservan las 32 activaciones latentes más altas por entrada. Se construye sobre mLateOn mediante un preentrenamiento de autoencoder disperso (SAE) seguido de un ajuste supervisado de recuperación, y hereda la ventana de contexto de 8.192 tokens de su modelo base.

El modelo resuelve un problema concreto: obtener la calidad de un retriever denso o de interacción tardía manteniendo la compatibilidad con índices invertidos, lo que permite integrar búsqueda semántica multilingüe en infraestructuras de búsqueda léxica ya existentes (Lucene, Elasticsearch, OpenSearch, pISA) sin desplegar un motor vectorial denso aparte. Frente a mDenseOn mejora 4,76 puntos en MIRACL y 10,19 en MLDR, y alcanza 74,78 en MTEB Code.

Con 339 millones de parámetros, licencia Apache 2.0 y pesos safetensors, es relevante ahora porque cubre nueve idiomas y código con contexto largo, incorpora entrenamiento Matryoshka para ajustar la dispersión de consulta y documento de forma independiente, y su tamaño permite ejecutarlo en GPU de consumo o incluso en CPU para indexación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base mLateOn) con cabezal sparse: proyección 128 → 768 dimensiones, MLP residual, top-32 activaciones, ReLU y max pooling entre tokens |
| Parametros totales | 339.449.472 (~339 M) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | en, fr, de, it, es, pt, sv, no, ar y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers, requiere custom code) |
| Dimension del vector de salida | 32.768 dimensiones, disperso no negativo, top-32 activas por consulta o documento |
| Funcion de similitud | producto escalar (dot product) entre vectores dispersos |
| Espacio de caracteristicas | latentes aprendidas, independientes del vocabulario del tokenizer |
| Tamano del repositorio | 1,4 GB |
| Modelo base | lightonai/mLateOn (finetune) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

mSlideOn parte de mLateOn, un modelo de interacción tardía que produce representaciones normalizadas de 128 dimensiones por token. El codificador disperso proyecta esas representaciones a 768 dimensiones, aplica un MLP residual y selecciona las 32 activaciones latentes mayores, seguidas de ReLU; un max pooling entre tokens colapsa la secuencia en un único vector por consulta o documento. La recuperación se resuelve con producto escalar. Las 32.768 dimensiones son características aprendidas, no términos del vocabulario, de modo que las activaciones activas pueden almacenarse en un índice invertido donde cada latente de consulta selecciona listas de postings y su peso contribuye a la puntuación del documento.

El entrenamiento tiene dos fases: un preentrenamiento de autoencoder disperso (SAE) que inicializa el codificador reutilizando el conocimiento de recuperación de mLateOn, y un ajuste fino supervisado de recuperación sobre los conjuntos filtrados de LightOn para inglés, francés, alemán, italiano, español, portugués, sueco, noruego, árabe, código y edición de código (lightonai/embeddings-fine-tuning-filtered-*). No se detallan en la información disponible el número de tokens de entrenamiento ni el uso de RLHF o DPO, que en un modelo de embeddings no resultan de aplicación directa. La innovación destacable es el entrenamiento Matryoshka, que permite ajustar de forma independiente la dispersión de consulta y de documento, junto con el propio esquema SAE que traslada conocimiento de un retriever de interacción tardía a representaciones compatibles con índice invertido.

## Capacidades

- Generación de embeddings dispersos para recuperación de información (feature-extraction), no generación de texto.
- Recuperación multilingüe en inglés, francés, alemán, italiano, español, portugués, sueco, noruego y árabe.
- Búsqueda de código y de edición de código (el conjunto de datos incluye code y code-edit; MTEB Code promedia 12 tareas de recuperación).
- Contexto largo de hasta 8.192 tokens, orientado a recuperación sobre documentos extensos (evaluado en MLDR).
- Dispersión ajustable de forma independiente para consulta y documento mediante entrenamiento Matryoshka.
- Puntuación por producto escalar con solo 32 activaciones por vector, lo que permite almacenamiento en índice invertido y scoring por listas de postings.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: no es un modelo generativo.
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- Búsqueda semántica multilingüe en documentación técnica: indexar el corpus una vez en un índice invertido y consultar en cualquiera de los nueve idiomas soportados, con 63,21 de nDCG@10 en los idiomas objetivo de MIRACL.
- Búsqueda de código en repositorios internos: el modelo alcanza 74,78 en MTEB Code, por encima de mDenseOn (71,53) y mLateOn (73,48), lo que lo hace adecuado para localizar funciones, fragmentos y parches descritos en lenguaje natural.
- RAG sobre documentos largos: la ventana de 8.192 tokens y los 75,79 de nDCG@10 en los idiomas objetivo de MLDR permiten indexar informes, contratos o artículos completos sin trocear en fragmentos pequeños.
- Búsqueda híbrida sobre infraestructura léxica existente: al producir vectores dispersos, las 32 activaciones por documento pueden almacenarse en las posting lists de Lucene, Elasticsearch u OpenSearch, combinando el scoring semántico con BM25 en el mismo motor.
- Atención al cliente y bases de conocimiento: recuperación de artículos y respuestas FAQ en varios idiomas europeos con un coste de inferencia bajo (339 M de parámetros) y despliegue en la UE.
- Deduplicación y agrupación semántica de catálogos: calcular un vector de 32 activaciones por registro y comparar mediante producto escalar para detectar duplicados o near-duplicates en corpus multilingües.
- Filtrado y pre-ranking en pipelines de recomendación: usar las 32 activaciones como firma compacta para reducir candidatos antes de un reranker más costoso.
- Comercio electrónico transfronterizo: mapear consultas en español, italiano o portugués contra fichas de producto en inglés o alemán dentro del mismo espacio de recuperación.

## Benchmarks y rendimiento

Puntuaciones medias de nDCG@10 en escala 0-100, con vectores de consulta y documento sin podar y búsqueda exacta sobre el corpus completo de cada evaluación. MIRACL se evalúa con el split dev de mteb/miracl-hard-negatives y MLDR con el split test de mteb/MultiLongDocRetrieval.

| Benchmark | mSlideOn | mDenseOn | mLateOn |
|---|---|---|---|
| BEIR-15 | 56,00 | no disponible | no disponible |
| MIRACL, idiomas objetivo (ar, en, fr, de, es) | 63,21 | no disponible | no disponible |
| MIRACL, 18 idiomas | 62,78 | 58,02 (derivado de la mejora declarada de +4,76) | no disponible |
| MLDR, idiomas objetivo (ar, en, fr, de, it, pt, es) | 75,79 | no disponible | no disponible |
| MLDR, 13 idiomas | 61,68 | 51,49 (derivado de la mejora declarada de +10,19) | no disponible |
| MTEB Code (media de 12 tareas) | 74,78 | 71,53 | 73,48 |

Los valores de mDenseOn en MIRACL y MLDR no se publican de forma explícita en la información disponible: se han calculado restando la mejora declarada por el autor. No se han publicado resultados de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,36 GB en fp32 (coincide con el tamaño del repositorio, 1,4 GB), unos 0,68 GB en fp16 y unos 0,34 GB en int8 para los pesos; hay que sumar memoria para activaciones, que depende del batch y de la longitud de secuencia.
- GPU recomendadas: el modelo cabe holgadamente en una RTX 4090, RTX 3090, RTX 4080, L4, A10G o incluso en una RTX 3060 de 12 GB con lotes grandes; para indexación masiva a gran escala tiene sentido usar A100 o H100 por throughput agregado, no por requisito de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM, y también en CPU para indexación por lotes a velocidad reducida.
- Opciones de despliegue: sentence-transformers con trust_remote_code (vía recomendada), Hugging Face Inference Endpoints (el modelo está etiquetado como endpoints_compatible), y exportación de las 32 activaciones por vector a un índice invertido como Lucene, Elasticsearch, OpenSearch o pISA para servido de recuperación. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mSlideOn | Sparse (SAE + top-32) | 339 M | 8.192 | Apache 2.0 | 74,78 en MTEB Code; 62,78 en MIRACL (18 idiomas) |
| mDenseOn | Denso | no disponible | no disponible | no disponible | 71,53 en MTEB Code; referencia densa del mismo autor |
| mLateOn | Interaccion tardia | no disponible | no disponible | no disponible | 73,48 en MTEB Code; modelo base de mSlideOn |
| SlideOn | Sparse (version inglesa) | no disponible | no disponible | Apache 2.0 | Variante monolingue inglesa derivada de DenseOn |
| BM25 | Lexico | no aplica | no aplica | no aplica | Base lexica sin semantica; el modelo se integra en el mismo tipo de indice invertido |

La ventaja diferencial de mSlideOn frente a mDenseOn y mLateOn es que mantiene la calidad de recuperación en un formato disperso compatible con índices invertidos, mientras que las alternativas densas requieren un motor vectorial y las de interacción tardía multiplican el coste de almacenamiento por token. No se dispone de datos de parametros, contexto ni licencia de mDenseOn y mLateOn en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni flujos de agentes; solo calcula representaciones para recuperación.
- El riesgo de alucinación no aplica al modelo en sí, pero sí a los sistemas RAG que lo usan: un fallo de recuperación se traduce directamente en respuestas incorrectas del generador aguas abajo.
- Requiere código personalizado (etiqueta custom_code) y confianza en la implementación remota al cargarlo con sentence-transformers.
- La salida dispersa exige infraestructura de índice invertido; no es enchufable a un índice denso tipo FAISS o Qdrant sin adaptar el scoring a producto escalar sobre posting lists.
- Las 32.768 dimensiones son latentes aprendidas, no términos interpretables: se pierde la trazabilidad léxica de BM25 en la depuración de resultados.
- La ventana está limitada a 8.192 tokens; documentos más largos requieren truncado o troceado, con la consiguiente pérdida de contexto.
- Cobertura lingüística acotada a los nueve idiomas declarados (en, fr, de, it, es, pt, sv, no, ar) más código; no se ha entrenado para chino, japonés, coreano, hindi ni ruso.
- Los benchmarks se han medido con búsqueda exacta sobre el corpus completo y vectores sin podar; un índice ANN o una poda agresiva de activaciones pueden degradar el nDCG@10 en producción.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, sin restricciones adicionales conocidas.
- No se documentan sesgos específicos ni evaluaciones de robustez o equidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/mSlideOn
- Blog de presentación de SlideOn y mSlideOn: https://huggingface.co/blog/lightonai/slideon-mslideon
- Repositorio de entrenamiento y evaluación: https://github.com/lightonai/slideon-mslideon/
- Colección SlideOn y mSlideOn: https://huggingface.co/collections/lightonai/slideon-and-mslideon
- Modelo base mLateOn: https://huggingface.co/lightonai/mLateOn
- Modelo denso mDenseOn: https://huggingface.co/lightonai/mDenseOn
- Blog de mDenseOn y mLateOn: https://huggingface.co/blog/lightonai/mdenseon-mlateon
- Variante inglesa SlideOn: https://huggingface.co/lightonai/SlideOn
- Variante con autoencoder disperso (ingles): https://huggingface.co/lightonai/SlideOn-SAE
- Variante con autoencoder disperso (multilingue): https://huggingface.co/lightonai/mSlideOn-SAE
- Modelo denso ingles DenseOn: https://huggingface.co/lightonai/DenseOn
- Modelo de interaccion tardia ingles LateOn: https://huggingface.co/lightonai/LateOn
- Blog de DenseOn y LateOn: https://huggingface.co/blog/lightonai/denseon-lateon
- Dataset de evaluacion MIRACL con negativos duros: https://huggingface.co/datasets/mteb/miracl-hard-negatives
- Dataset de evaluacion MLDR: https://huggingface.co/datasets/mteb/MultiLongDocRetrieval
- Web de LightOn: https://lighton.ai
- Perfil de LinkedIn de LightOn: https://www.linkedin.com/company/lighton/
- Cuenta de X de LightOn: https://x.com/LightOnIO
