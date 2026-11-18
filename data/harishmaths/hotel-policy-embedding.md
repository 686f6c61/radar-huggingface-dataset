# HarishMaths/Hotel-Policy-Embedding

## Resumen

Hotel-Policy-Embedding es un modelo de embeddings de frases desarrollado por el usuario HarishMaths y publicado en Hugging Face. Se trata de un Sentence Transformer construido sobre una arquitectura BERT que proyecta oraciones y parrafos a un espacio vectorial denso de 384 dimensiones, pensado para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering. Su especializacion es el dominio de politicas hoteleras: condiciones de cancelacion, reembolsos, normas de ocupacion, politica de fumadores y programas de fidelizacion.

El modelo resuelve el problema de recuperar y comparar fragmentos normativos de reservas hoteleras, un dominio con lenguaje muy formal y redundante donde los embeddings genericos suelen confundir conceptos proximos (por ejemplo, cancelacion flexible frente a no reembolsable). Con 22,7 millones de parametros y un vector de salida de 384 dimensiones, es un modelo pequeno y ligero, adecuado para indexar grandes volumenes de documentos en entornos con recursos limitados.

Es relevante ahora porque los sistemas de atencion al cliente y de gestion de reservas necesitan recuperacion semantica precisa sobre textos legales de pequena extension, y este modelo ofrece una alternativa afinada al dominio frente a embeddings generalistas, con un coste computacional minimo. Su ventana de contexto es de solo 128 tokens, lo que condiciona su uso a fragmentos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) con Pooling de media y Normalize; Sentence Transformer |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 384 |
| Funcion de similitud | coseno |
| Funcion de perdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 3872 ejemplos |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de Sentence Transformers: un codificador BERT que extrae el `last_hidden_state`, seguido de una capa de pooling por media sobre los token embeddings y una capa de normalizacion final. El resultado es un vector de 384 dimensiones normalizado, de modo que la similitud coseno entre vectores es directamente comparable. No emplea atencion lineal, decodificacion especulativa ni mecanismos hibridos; es un encoder denso convencional.

El entrenamiento se realizo con la libreria sentence-transformers mediante `generated_from_trainer`, sobre un dataset de 3872 pares o tripletas del dominio hotelero y con la funcion de perdida MultipleNegativesRankingLoss, habitual en recuperacion densa porque trata los negativos del propio batch como negativos en la comparacion. No se documenta el modelo base concreto, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La model card no indica el checkpoint de partida, lo que impide evaluar el grado de desviacion respecto a un BERT generico.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos en un espacio denso de 384 dimensiones.
- Similitud semantica entre textos (semantic textual similarity) con similitud coseno.
- Busqueda semantica y recuperacion densa sobre fragmentos de politicas hoteleras.
- Mineria de parafrasis y deteccion de duplicados conceptuales.
- Clasificacion de textos mediante embeddings como caracteristica de entrada.
- Clustering de fragmentos normativos por tematica (cancelacion, reembolso, ocupacion, tabaco, fidelizacion).
- Extraccion de caracteristicas (`feature-extraction`) para pipelines posteriores.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un encoder puro de texto, no un modelo generativo.
- Capacidades multilingues: no documentadas; el material de ejemplo esta integramente en ingles.

## Casos de uso

- Busqueda semantica en bases de conocimiento de politicas hoteleras: indexar fragmentos de condiciones de reserva y recuperar los mas proximos a la consulta del usuario mediante similitud coseno, aprovechando el afinado al dominio para distinguir entre cancelacion flexible, semirreembolsable y no reembolsable.
- Atencion al cliente automatizada: dado que la ventana es de 128 tokens, el modelo se usa como recuperador de pasajes cortos que alimentan a un LLM generativo en un patron RAG; el encoder localiza la clausula relevante y el generador redacta la respuesta.
- Deduplicacion de clausulas contractuales: agrupar por clustering fragmentos equivalentes procedentes de distintos contratos de hotel, utiles para auditar la coherencia de una politica corporativa de reservas.
- Clasificacion automatica de tickets de soporte: convertir el texto del ticket en un embedding y entrenar un clasificador lineal encima para enrutar consultas a cancelaciones, reembolsos, ocupacion o fidelizacion.
- Deteccion de parafrasis en revisiones de politicas: comparar versiones sucesivas de un documento normativo y senalar las clausulas reformuladas sin cambio de fondo.
- Motor de recomendacion de tarifas: comparar la descripcion de una tarifa con las condiciones que busca el usuario y ordenar las opciones por similitud semantica.
- Filtrado previo en pipelines de moderacion de contenido: descartar rapidamente textos ajenos al dominio hotelero antes de procesarlos con modelos mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero), sobre un conjunto de validacion propio de similitud semantica:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Similitud semantica | val | Pearson Cosine | 0,6244 |
| Similitud semantica | val | Spearman Cosine | 0,6463 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible. Las cifras anteriores corresponden a un split de validacion interno y no son comparables con leaderboards publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en precision completa (22,7 millones de parametros en fp32 ocupan unos 91 MB, mas el overhead de activaciones y del runtime). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090, T4 o incluso CPU son suficientes. Para indexacion masiva, una A100 o H100 solo aporta ventaja por paralelismo de batch, no por memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU.
- Opciones de despliegue: sentence-transformers (referencia), Hugging Face Text Embeddings Inference (TEI), integracion en pipelines de transformers, ONNX Runtime para CPU. No se documenta soporte GGUF ni Ollama, aunque es tecnicamente posible convertirlo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU con batches grandes, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| Hotel-Policy-Embedding | 22,7 M | 128 tokens | 384 | no disponible | Afinado al dominio hotelero; metricas solo en validacion interna |
| all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Embedding generico muy extendido, mismo orden de tamano y dimension |
| multi-qa-MiniLM-L6-cos-v1 | ~22,7 M | 512 tokens | 384 | Apache 2.0 | Optimizado para recuperacion de preguntas y respuestas |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | 384 | Apache 2.0 | Multilingue, mas pesado, referencia para comparativas cross-lingue |

La comparacion con all-MiniLM-L6-v2 es la mas directa por tamano y dimension de salida; sin embargo, no hay datos publicos que permitan afirmar que el modelo afinado supere al generico fuera del dominio hotelero. La ventaja de contexto (128 frente a 256 tokens) juega en contra del modelo especializado.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens: obliga a fragmentar los documentos en trozos muy cortos, lo que puede romper clausulas largas y perder contexto.
- No es un modelo generativo: no produce texto, solo vectores; cualquier caso de uso conversacional requiere un LLM adicional.
- Licencia no especificada: no hay garantia explicita de uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Idiomas no documentados: el material de ejemplo esta en ingles; el rendimiento en castellano es desconocido.
- Dataset de entrenamiento pequeno (3872 ejemplos) y de dominio estrecho: riesgo de sobreajuste a las expresiones concretas de las politicas de ejemplo y de pobre generalizacion.
- Metricas de benchmark no verificadas y sobre un split de validacion interno, sin comparacion con test independiente.
- Riesgo de sesgo hacia el vocabulario de una cadena hotelera concreta (el ejemplo menciona explicitamente Marriott), lo que puede degradar la recuperacion en otros operadores.
- Alucinacion: no aplica directamente al ser un encoder, pero los sistemas RAG que lo usen pueden generar respuestas incorrectas si la recuperacion falla.
- Solo 1 like y un autor individual: soporte y mantenimiento no garantizados; la fecha de creacion indicada (2026) debe verificarse en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarishMaths/Hotel-Policy-Embedding
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
