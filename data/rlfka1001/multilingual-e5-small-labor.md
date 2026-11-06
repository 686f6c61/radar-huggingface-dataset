# rlfka1001/multilingual-e5-small-labor

## Resumen

multilingual-e5-small-labor es un modelo de embeddings de frases (sentence-transformers) obtenido por fine-tuning de intfloat/multilingual-e5-small sobre pares de consultas y articulos legales laborales coreanos. Lo desarrolla el usuario rlfka1001 y resuelve un problema concreto: la recuperacion semantica de articulos normativos (por ejemplo, la Ley de Normas Laborales de Corea) a partir de preguntas formuladas en lenguaje natural. Es relevante porque adapta un modelo multilingue pequeno y eficiente a un dominio muy especifico donde los embeddings genericos suelen fallar por la distancia lexica entre la pregunta del trabajador y la redaccion tecnica del articulo.

El modelo conserva la arquitectura BERT del modelo base, con 117.653.760 parametros totales y una salida de embeddings densos de 384 dimensiones. La ventana de entrada esta limitada a 512 tokens, incluyendo los tokens especiales y los prefijos `query:` y `passage:`. El entrenamiento se realizo sobre un conjunto de 663 ejemplos con la funcion de perdida MultipleNegativesRankingLoss, un regimen tipico de recuperacion contrastiva.

Su interes practico esta en el nicho: es un modelo diminuto (repo de 0,5 GB), con licencia MIT, pensado para desplegarse en infraestructura modesta y servir de base a un sistema de busqueda o RAG sobre normativa laboral coreana. No es un modelo generativo ni sustituye a un asesor legal; su funcion es ordenar documentos por similitud semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), modelo de embeddings de frases |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluye tokens especiales y prefijos `query:` / `passage:`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF u otras) |
| Idiomas soportados | coreano (`ko`); el modelo base es multilingue, pero el fine-tuning se ha realizado solo en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 384 |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 663 ejemplos |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no un adaptador) de intfloat/multilingual-e5-small, un encoder BERT de 117,6 millones de parametros que produce representaciones densas de 384 dimensiones. La pipeline es `sentence-similarity` y se carga con SentenceTransformer, aplicando la convencion E5 de prefijos asimetricos: `query:` para la consulta y `passage:` para el documento, con `normalize_embeddings=True` para que la similitud coseno sea equivalente al producto escalar.

El entrenamiento se realizo sobre el dataset rlfka1001/labor-embedding-data, compuesto por pares de preguntas laborales y articulos legales correctos, con 663 ejemplos y la perdida contrastiva MultipleNegativesRankingLoss, que usa los demas pasajes del lote como negativos. El autor indica que el corpus general del mismo repositorio (`general-evaluation/general-corpus`) se reservo para comprobar si el fine-tuning degradaba la recuperacion en otros dominios y no se uso para ajustar los pesos. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas adicionales de RLHF o DPO (no aplicables a un modelo de embeddings).

## Capacidades

- Generacion de embeddings densos de 384 dimensiones para busqueda semantica y recuperacion de informacion.
- Similitud de frases y recuperacion asimetrica consulta-documento mediante los prefijos `query:` y `passage:`.
- Extraccion de caracteristicas (`feature-extraction`) a partir de las representaciones del encoder.
- Recuperacion de articulos legales laborales coreanos a partir de preguntas en lenguaje natural, incluyendo parafrasis (el widget de la model card muestra tres formulaciones distintas de la misma consulta sobre permiso menstrual).
- Compatibilidad con text-embeddings-inference y con endpoints de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: es exclusivamente un encoder de embeddings.
- Capacidad multilingue limitada en la practica: el modelo base es multilingue, pero el ajuste se ha hecho solo con datos en coreano y el autor solo declara `ko`.

## Casos de uso

- Busqueda de normativa laboral para trabajadores: el sistema recibe una pregunta en coreano ("me han denegado el permiso menstrual, es legal?") y el modelo la codifica con el prefijo `query:` para recuperar los articulos relevantes del corpus con el prefijo `passage:`. Con 384 dimensiones y 117 millones de parametros, la indexacion de miles de articulos es viable en CPU.
- Base de un pipeline RAG juridico: los articulos recuperados por similitud coseno se pasan como contexto a un modelo generativo que redacta la respuesta. El modelo actua como recuperador y mantiene el coste del sistema bajo gracias a su tamano reducido.
- Asistencia a departamentos de recursos humanos: consultas internas sobre permisos, horas extraordinarias o plazos de prescripcion salarial, resueltas contra el texto consolidado de la ley con busqueda semantica en lugar de coincidencia exacta de palabras clave.
- Deduplicacion y agrupacion de consultas: al proyectar preguntas en un espacio de 384 dimensiones, se pueden agrupar consultas equivalentes formuladas de forma distinta y enrutarlas al mismo articulo o al mismo agente.
- Evaluacion de cobertura normativa: comparando las consultas de usuarios con el corpus de articulos, se detectan temas recurrentes sin articulo asociado y se prioriza la ampliacion del corpus.
- Despliegue en entornos con recursos limitados: al ocupar 0,5 GB en safetensors, cabe en una instancia pequena o incluso en CPU, lo que permite ofrecer busqueda semantica sin GPU dedicada.
- Filtrado previo en sistemas de tickets: clasificar y dirigir consultas laborales entrantes al equipo o al articulo correspondiente antes de la revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de evaluacion `labor`:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6449 |
| Cosine Accuracy@3 | 0,8505 |
| Cosine Accuracy@5 | 0,9112 |
| Cosine Accuracy@10 | 0,9439 |
| Cosine Precision@1 | 0,6449 |
| Cosine Precision@5 | 0,1822 |
| Cosine Recall@1 | 0,6449 |
| Cosine Recall@5 | 0,9112 |
| Cosine NDCG@10 | 0,8045 |
| Cosine MRR@10 | 0,7586 |
| Cosine MAP@100 | 0,7602 |

La lectura practica: en el 91,1 % de las consultas el articulo correcto aparece entre los cinco primeros resultados, y en el 94,4 % entre los diez primeros. El acierto en primera posicion (64,5 %) es el punto mas debil y sugiere que el reranking posterior aporta valor. No se han publicado en la informacion disponible resultados comparativos con el modelo base ni con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (117,6 millones de parametros, aproximadamente 0,47 GB de pesos); en fp16 alrededor de 0,24 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de GPU de gama alta por su tamano.
- Cabe holgadamente en GPU de consumo e incluso funciona en CPU para cargas moderadas de indexacion y consulta.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (el modelo declara compatibilidad), endpoints de Hugging Face y servidores de embeddings basados en Transformers. No se documentan pesos GGUF ni soporte explicito para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del encoder, se espera una latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| rlfka1001/multilingual-e5-small-labor | 117,6 M | 512 tokens | 384 | MIT | coreano (fine-tuning) | Especializado en normativa laboral coreana; Accuracy@5 de 0,9112 en el conjunto `labor` |
| intfloat/multilingual-e5-small (modelo base) | 117,6 M | 512 tokens | 384 | MIT | multilingue | Uso general; no se han publicado en la informacion disponible resultados en el conjunto `labor` |
| Otros modelos de embeddings legales coreanos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

La comparacion cuantitativa con el modelo base no es posible con la informacion proporcionada: el autor no publica los resultados de intfloat/multilingual-e5-small sobre el conjunto `labor`, por lo que no se puede medir la ganancia del fine-tuning.

## Limitaciones y advertencias

- El propio autor advierte de que la similitud alta no garantiza que el documento recuperado sea la respuesta legal correcta; el modelo no es una herramienta de asesoramiento juridico.
- Las puntuaciones de recuperacion dependen del conjunto de evaluacion; en otros dominios y con articulos nuevos hay que evaluar por separado.
- El entrenamiento se hizo con solo 663 ejemplos, un volumen muy reducido que limita la generalizacion y aumenta el riesgo de sobreajuste al corpus concreto.
- El fine-tuning es exclusivamente en coreano; el rendimiento en castellano u otros idiomas del modelo base no esta evaluado y probablemente sea inferior al del modelo original.
- Ventana de 512 tokens: los articulos o fragmentos mas largos deben trocearse, lo que puede separar el contexto necesario.
- El autor no documenta sesgos conocidos ni evaluaciones de robustez; no hay datos sobre alucinacion en sentido estricto porque el modelo no genera texto, pero si puede devolver pasajes irrelevantes con puntuaciones altas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales documentadas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlfka1001/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/rlfka1001/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Documentacion de sentence-transformers: https://www.sbert.net/
- Paper de E5 (Text Embeddings by Weakly-Supervised Contrastive Pre-training): https://arxiv.org/abs/2212.03533
