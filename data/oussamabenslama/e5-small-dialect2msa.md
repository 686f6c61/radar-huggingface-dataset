# OussamaBenSlama/e5-small-dialect2MSA

## Resumen

e5-small-dialect2MSA es un modelo de embeddings de frases desarrollado por OussamaBenSlama, obtenido por ajuste fino (fine-tuning) de intfloat/multilingual-e5-small. Su objetivo es resolver un problema concreto de recuperación semántica en árabe: las leyes, reglamentos y documentos formales están redactados en árabe estándar moderno (MSA), mientras que los usuarios formulan sus consultas en dialectos locales. Los modelos de embeddings generalistas rinden bien con consultas en MSA, pero degradan su precisión cuando la misma consulta se escribe en dialecto, lo que obliga a añadir un paso previo de reescritura de la consulta.

El modelo se entrena para recuperar directamente fragmentos en MSA a partir de consultas escritas en MSA o en cinco dialectos árabes: saudí, sirio, egipcio, sudanés y tuniense (tunecino). Se distribuye con licencia Apache 2.0, ocupa 0,3 GB en el repositorio y cuenta con 117.653.760 parámetros, por lo que es un modelo pequeño, rápido y desplegable en CPU o en cualquier GPU de consumo. En el momento de la consulta acumula 1 descarga y 0 likes, lo que indica que es un modelo reciente y de nicho.

Su relevancia actual radica en que elimina la necesidad de reescribir o normalizar la consulta dialectal antes de la recuperación, reduciendo latencia y evitando la pérdida de matices que introducen los sistemas de traducción intermedios. Está pensado, por tanto, como pieza de recuperación en arquitecturas RAG sobre corpus jurídicos o administrativos en árabe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (heredada de intfloat/multilingual-e5-small) |
| Parametros totales | 117.653.760 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no se especifica otra en la model card) |
| Tipos de cuantizacion | No especificados en la model card; el repositorio publica pesos safetensors en fp32 |
| Idiomas soportados | Árabe (MSA y dialectos saudí, sirio, egipcio, sudanés y tuniense) e inglés (`ar`, `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base intfloat/multilingual-e5-small: un transformer encoder bidireccional de tipo BERT con vocabulario multilingüe compartido, orientado a producir embeddings de frase normalizados (no se trata de un modelo generativo ni de un modelo de razonamiento). El ajuste fino fue de tipo contrastivo (contrastive fine-tuning) con negativos duros (hard negatives), el procedimiento habitual para afinar modelos de recuperación densa y separar en el espacio vectorial las consultas de los pasajes relevantes.

Los datos de entrenamiento parten de consultas originales en MSA, cada una de las cuales se traduce a cinco variantes dialectales mediante un pipeline de dos etapas: primero MSA a inglés con facebook/nllb-200-1.3B y después inglés a dialecto árabe con oddadmix/Jisr-MT-50M-AllDialects, usando el inglés como lengua pivote. El dataset resultante contiene seis columnas de texto (`query` en MSA, más `saudi_variant`, `syrian_variant`, `egyptian_variant`, `sudanese_variant` y `tunisian_variant`). La model card no indica el número total de tokens de entrenamiento, la composición detallada del corpus ni si se aplicaron etapas adicionales de RLHF o DPO, algo que no tendría sentido en un modelo de embeddings.

La innovación principal no es arquitectónica sino de planteamiento del problema y de datos: en lugar de exigir la normalización de la consulta dialectal a MSA, el modelo aprende a alinear directamente representaciones dialectales con pasajes en MSA. La evaluación se realizó sobre 1.238 consultas por idioma, midiendo MRR@5 y Recall@5.

## Capacidades

- Generación de embeddings de frase para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Recuperación de pasajes en MSA a partir de consultas escritas en MSA o en cinco dialectos árabes (saudí, sirio, egipcio, sudanés y tuniense).
- Recuperación entre lenguas para pares árabe-inglés gracias al modelo base multilingüe (`ar`, `en`).
- Extracción de características (feature-extraction) para tareas posteriores de clasificación, clustering o deduplicación.
- Búsqueda semántica e información retrieval sobre corpus documentales, sin reescritura previa de la consulta.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio: es exclusivamente un codificador de frases.
- No dispone de modo de razonamiento (thinking mode) ni de generación de texto.
- El vector de salida es de 384 dimensiones, heredado del modelo base (dato no explicitado en la model card, consúltese la configuración del repositorio antes de integrarlo).

## Casos de uso

- Búsqueda jurídica dialecto a MSA: un ciudadano formula una pregunta en tuniense o egipcio y el sistema recupera directamente los artículos de ley redactados en MSA, eliminando el paso de reescritura de la consulta que introduciría ruido semántico.
- Recuperación aumentada (RAG) sobre normativa y reglamentos: el modelo actúa como retriever en la primera fase del pipeline, entregando los fragmentos MSA relevantes al LLM generativo que redactará la respuesta final.
- Asistentes de atención al ciudadano en administraciones públicas: admite consultas en dialecto en portales de trámites, con una ventana de 512 tokens por fragmento que encaja bien con pasajes cortos de boletines oficiales.
- Deduplicación y agrupación de consultas entrantes: al proyectar consultas dialectales y en MSA en el mismo espacio, permite detectar preguntas equivalentes formuladas de formas distintas y consolidar colas de soporte.
- Clasificación y enrutado de tickets de atención al cliente: los embeddings sirven como entrada a un clasificador que dirige cada ticket al departamento correcto, incluso cuando el usuario escribe en su dialecto local.
- Búsqueda interna en centros de contacto regionales: indexación de bases de conocimiento en MSA y consulta desde agentes que trabajan con lenguaje coloquial de Arabia Saudí, Egipto, Siria, Sudán o Túnez.
- Filtrado y reranking dentro de pipelines híbridos: por su tamaño (117 M de parámetros) puede ejecutarse como primera etapa de recuperación masiva antes de un reranker más costoso.
- Normalización implícita para analítica de datos: agrupar y comparar consultas de usuarios en distintos dialectos sin necesidad de un traductor externo, reduciendo coste de infraestructura.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.), ya que el modelo no es generativo. Los únicos datos disponibles son métricas de recuperación sobre 1.238 consultas por idioma.

MRR@5 (posición del primer pasaje relevante en el top 5; valores más altos son mejores):

| Idioma de la consulta | Modelo base | Modelo ajustado | Mejora (pp) |
|---|---:|---:|---:|
| MSA | 0,8411 | 0,8830 | +4,19 |
| Saudí | 0,7451 | 0,8563 | +11,12 |
| Sirio | 0,7460 | 0,8590 | +11,30 |
| Egipcio | 0,7531 | 0,8556 | +10,25 |
| Sudanés | 0,7241 | 0,8485 | +12,44 |
| Tuniense | 0,6542 | 0,8265 | +17,23 |

Recall@5 (proporción de consultas con al menos un pasaje relevante en el top 5):

| Idioma de la consulta | Modelo base | Modelo ajustado | Mejora (pp) |
|---|---:|---:|---:|
| MSA | 0,9596 | 0,9830 | +2,34 |
| Saudí | 0,9273 | 0,9798 | +5,25 |
| Sirio | 0,9233 | 0,9790 | +5,57 |
| Egipcio | 0,9346 | 0,9774 | +4,28 |
| Sudanés | 0,9184 | 0,9750 | +5,66 |
| Tuniense | 0,8708 | 0,9596 | +8,88 |

El autor destaca que la mayor ganancia se produce en tuniense, el dialecto con peor línea base, y que el ajuste también mejora la recuperación en MSA. Estas cifras corresponden al conjunto de evaluación propio del autor; el rendimiento sobre otros corpus o consultas reales puede diferir.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 470 MB para los pesos, más el overhead de activaciones y tokenizador; en la práctica cabe en menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 235 MB. En cuantización int8, en torno a 120 MB, aunque el repositorio no publica pesos cuantizados.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650 o inferior) e incluso en CPU para cargas moderadas, dado su tamaño de 117 M de parámetros y su repositorio de 0,3 GB.
- GPU de centro de datos como A100 o H100 no son necesarias; se usarían únicamente para indexar corpus muy grandes en paralelo, no por requisitos de memoria.
- Opciones de despliegue: sentence-transformers (librería declarada en el repositorio), Hugging Face Text Embeddings Inference (TEI), dado el tag `text-embeddings-inference` y `endpoints_compatible`, conversión a ONNX u OpenVINO mediante Optimum, y motores con soporte de embeddings como vLLM.
- llama.cpp y Ollama no son aplicables de serie, ya que el repositorio no publica pesos en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento en dialecto árabe |
|---|---|---|---|---|---|
| OussamaBenSlama/e5-small-dialect2MSA | 117,6 M | 512 tokens | Árabe (MSA y 5 dialectos) e inglés | Apache 2.0 | MRR@5 de 0,8265 a 0,8830 según dialecto |
| intfloat/multilingual-e5-small (modelo base) | 117,6 M | 512 tokens | Multilingüe (incluye árabe e inglés) | MIT (según el repositorio del modelo base) | MRR@5 de 0,6542 a 0,8411 en el mismo conjunto |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | Multilingüe | MIT (según el repositorio del modelo base) | No evaluado en el conjunto del autor |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 128 tokens | Multilingüe | Apache 2.0 | No evaluado en el conjunto del autor |

La comparación directa con alternativas cuantitativas solo es posible frente al modelo base, ya que es el único para el que el autor publica resultados sobre el mismo conjunto de evaluación. Para el resto de alternativas no se dispone de métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona, no soporta tool calling ni flujos de agente. Cualquier expectativa de ese tipo es incorrecta.
- Cobertura dialectal limitada a cinco dialectos (saudí, sirio, egipcio, sudanés y tuniense); el rendimiento en otros dialectos árabes (marroquí, argelino, iraquí, levantino no sirio, etc.) no está documentado.
- La evaluación se realizó sobre un conjunto propio de 1.238 consultas por idioma; el autor advierte explícitamente de que el rendimiento puede diferir en otros corpus o con consultas reales.
- Los datos de entrenamiento se generaron mediante traducción automática en dos etapas (NLLB-200-1.3B y Jisr-MT-50M-AllDialects), por lo que los dialectos sintéticos pueden contener artefactos de traducción, pérdida de expresiones idiomáticas y sesgos del sistema de traducción.
- Ventana de contexto de 512 tokens: los fragmentos a indexar deben trocearse, con el consiguiente riesgo de perder contexto en documentos jurídicos largos.
- La model card no especifica si se conservan los prefijos `query:` y `passage:` propios de la familia E5. Si se omiten o se aplican de forma distinta a la del entrenamiento, el rendimiento puede degradarse notablemente; conviene validarlo antes de desplegar.
- Riesgo de alucinación no aplicable directamente al modelo, pero sí al sistema RAG que lo use: si la recuperación devuelve pasajes incorrectos, el LLM generativo puede producir respuestas erróneas sobre normativa.
- Sesgos potenciales heredados del corpus del modelo base multilingüe y del corpus jurídico usado para generar los pares de entrenamiento, no documentados por el autor.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, siempre que se conserve el aviso de licencia; conviene verificar también las licencias del modelo base y de los modelos de traducción empleados en la generación de datos.
- Modelo con 1 descarga y 0 likes: no existe validación independiente de la comunidad, por lo que su fiabilidad en producción no está contrastada.
- La fecha de creación registrada (2026-10-16) resulta anómala y podría indicar un error de metadatos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OussamaBenSlama/e5-small-dialect2MSA
- Repositorio GitHub con los scripts del proyecto: https://github.com/OussamaBenSlama/e5-small-dialect2MSA
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/OussamaBenSlama/e5-dialect2MSA-train-embedding-data
- Dataset de test: https://huggingface.co/datasets/OussamaBenSlama/e5-dialect2MSA-test-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo de traducción MSA a inglés: https://huggingface.co/facebook/nllb-200-1.3B
- Modelo de traducción inglés a dialecto árabe: https://huggingface.co/oddadmix/Jisr-MT-50M-AllDialects
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio y de su model card.
