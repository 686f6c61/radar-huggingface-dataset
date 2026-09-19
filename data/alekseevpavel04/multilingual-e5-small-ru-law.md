# alekseevpavel04/multilingual-e5-small-ru-law

## Resumen

multilingual-e5-small-ru-law es un modelo de embeddings de frases (bi-encoder) derivado de intfloat/multilingual-e5-small, con 117.653.760 parametros y vectores de 384 dimensiones, ajustado por alekseevpavel04 para una tarea muy concreta: recuperar el articulo de una ley rusa relevante a partir de la pregunta de un ciudadano. El problema que resuelve es el de la asimetria entre lenguaje coloquial y lenguaje juridico: la pregunta tipica ("me despidieron estando de baja, ¿es legal?") y el texto de la norma comparten poco vocabulario, por lo que un buscador lexico falla.

La relevancia actual del modelo esta en su relacion coste/rendimiento. El ajuste fino se hizo en 3,9 minutos sobre una unica RTX 3070 de 8 GB, con un pico de 2,1 GB de memoria, usando 9.139 preguntas sinteticas generadas con Qwen3-8B sobre articulos del Codigo de Trabajo, el Codigo Civil, el Codigo de Vivienda y el Codigo de Infracciones Administrativas de la Federacion Rusa. El resultado declarado en el conjunto de test RuLawRetrieval es de 0,8447 nDCG@10, frente a 0,802 del modelo base, con una latencia en CPU practicamente identica (21,7 ms por consulta frente a 21,8 ms).

Con esos numeros, el modelo queda estadisticamente indistinguible de multilingual-e5-large (0,859 nDCG@10) con 6,7 veces menos latencia en CPU, y por delante del modelo base en la mayoria de los cortes evaluados. Se distribuye bajo licencia MIT en formato sentence-transformers, con el codigo, los datos y los resultados publicados en un repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bi-encoder de sentence-transformers; familia E5) |
| Parametros totales | 117.653.760 (118M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenados en el ajuste fino | 21.600.000 de 118M (tabla de embeddings del vocabulario congelada) |
| Longitud de contexto | 512 tokens de entrada como maximo; 208 tokens (max_seq_length) durante el entrenamiento |
| Dimension del embedding | 384 |
| Tipos de cuantizacion | No disponible; el repositorio no declara variantes cuantizadas (solo safetensors, ~0,5 GB) |
| Idiomas soportados | Ruso (ru); el modelo base es multilingue, pero el ajuste se hizo solo sobre legislacion rusa |
| Licencia | MIT |
| Formato de pesos | safetensors (formato clasico de sentence-transformers; compatible con text-embeddings-inference) |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Repositorio | 0,5 GB |
| Prefijos obligatorios | "query: " para la consulta y "passage: " para el documento |

## Arquitectura y entrenamiento

Se trata de un bi-encoder denso clasico: cada texto se codifica de forma independiente en un vector de 384 dimensiones que se normaliza y se compara mediante producto escalar (similitud coseno). No hay interaccion cruzada entre consulta y documento, lo que permite precalcular los embeddings de todo el corpus y resolver la busqueda con una simple comparacion vectorial. El ajuste fino partio de intfloat/multilingual-e5-small y congelo la tabla de embeddings del vocabulario, de modo que solo se optimizaron 21,6M de los 118M de parametros.

Los datos de entrenamiento son 9.139 preguntas sinteticas de tres tipos (coloquial, de busqueda y juridica) generadas con Qwen3-8B a partir de articulos del Codigo de Trabajo, el Codigo Civil, el Codigo de Vivienda y el Codigo de Infracciones Administrativas. Un 10% de los articulos se reservo sin preguntas para medir generalizacion a articulos no vistos. El pipeline aplico filtros para descartar ejemplos con referencias al numero de articulo, copias literales de frases del texto y duplicados o casi duplicados. Como positivo se uso el fragmento de la propia articulo con mayor puntuacion segun el modelo original, y como negativo un hard negative extraido del top-50 de otro articulo. La funcion de perdida fue CachedMultipleNegativesRankingLoss con batch 128, mini-batch 32 y scale 20; se uso un sampler propio que impide que dos filas del mismo lote traten sobre el mismo articulo.

Los hiperparametros fueron learning rate 3e-5 con decaimiento lineal, warmup del 10%, 2 epocas, bf16 y semilla 42, seleccionando el mejor checkpoint por conjunto de desarrollo (paso 72 de 144, es decir, aproximadamente una epoca). El entrenamiento completo duro 3,9 minutos en una RTX 3070 de 8 GB. El autor indica que la mejor configuracion de uso es indexar fragmentos de articulos de unos 600 caracteres con el titulo del articulo al principio y asignar al articulo la puntuacion maxima de sus fragmentos, que es exactamente el protocolo con el que se entreno y se evaluo. Tambien advierte de que los cosenos absolutos quedan mas bajos que en el modelo original y de que los umbrales calibrados para la e5 original no son transferibles.

## Capacidades

- Generacion de embeddings de frases y pasajes para busqueda semantica y recuperacion densa (retrieval).
- Busqueda de articulos de leyes rusas a partir de preguntas en lenguaje coloquial, con la mayor ganancia declarada en ese tipo de consultas.
- Similitud semantica entre textos (pipeline sentence-similarity) y extraccion de caracteristicas (feature-extraction).
- Funcionamiento como retriever dentro de un pipeline RAG: no genera texto, solo devuelve vectores y puntuaciones de similitud.
- Multilinguismo limitado: el modelo base es multilingue, pero el ajuste fino solo cubre legislacion rusa.
- No se declara soporte de tool calling, function calling ni uso como agente: es un modelo de embeddings, no un modelo generativo con razonamiento multi-paso.
- No se declaran capacidades de vision, audio ni modo de razonamiento (thinking).
- Compatible con text-embeddings-inference y con endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Buscador de articulos legales para ciudadanos: el modelo recibe la pregunta coloquial de un usuario ("me despidieron estando de baja") y devuelve el articulo del Codigo de Trabajo mas relevante; es precisamente el escenario de entrenamiento y donde la mejora sobre el modelo base es mayor (0,569 a 0,687 nDCG en preguntas coloquiales).
- Recuperacion aumentada (RAG) sobre normativa laboral o civil: indexar los 3.786 articulos de los seis codigos evaluados en fragmentos de ~600 caracteres y usar el modelo como primer recuperador; los pasajes devueltos se pasan despues a un LLM que redacta la respuesta.
- Enrutado de tickets en un servicio de asistencia juridica: clasificar una consulta entrante hacia el codigo y el articulo correspondiente antes de asignarla a un especialista, aprovechando la latencia de 21,7 ms por consulta en CPU.
- Cascada de recuperacion a bajo coste: usar este modelo de 118M para reducir un corpus grande a unas decenas de candidatos y reservar un modelo mayor (e5-large, FRIDA) o un cross-encoder para el re-ranking final, reduciendo el coste de computo del sistema.
- Deduplicacion y agrupamiento de consultas legales: al producir embeddings normalizados de 384 dimensiones, permite agrupar preguntas repetidas o casi identicas en un helpdesk y construir una FAQ a partir de los clusters mas frecuentes.
- Analisis exploratorio de corpus normativo: calcular similitudes entre articulos de distintos codigos para detectar solapamientos tematicos o construir mapas de relaciones entre normas, sin necesidad de anotacion manual.
- Busqueda interna para redacciones o despachos: montar un indice vectorial local sobre una recopilacion de textos legales y permitir consultas en lenguaje natural, con despliegue en CPU y sin GPU dedicada.
- Generacion de conjuntos de evaluacion: reutilizar el pipeline del repositorio (generacion de preguntas sinteticas, filtros, hard negatives) para construir benchmarks de recuperacion en otros dominios o jurisdicciones.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card, sin verificacion independiente (`verified: false`):

| Tarea | Conjunto | Metrica | Valor |
|---|---|---|---|
| Retrieval | RuLawRetrieval (test, protocolo chunk) | nDCG@10 | 0,8447 |
| Retrieval | RuLawRetrieval (test, protocolo chunk) | Recall@10 | 0,948 |

Comparativa publicada en la model card. El conjunto de test tiene 728 preguntas y la busqueda se hace sobre las 3.786 articulos de seis leyes. Los intervalos entre corchetes son intervalos de confianza del 95% por bootstrap pareado:

| Modelo | Parametros | nDCG@10 | Recall@10 | CPU (ms por consulta) |
|---|---:|---:|---:|---:|
| e5-small (original) | 118M | 0,802 | 0,905 | 21,8 |
| multilingual-e5-small-ru-law | 118M | 0,845 | 0,948 | 21,7 |
| e5-large | 560M | 0,859 | 0,959 | 145,2 |
| FRIDA (mejor de 12) | 823M | 0,878 | 0,964 | 272,2 |

Desglose por tipo de consulta y por articulo visto o no visto durante el entrenamiento:

| Corte | e5-small | Este modelo | Diferencia [IC 95%] |
|---|---:|---:|---|
| Articulos presentes en el entrenamiento | 0,785 | 0,835 | +0,050 [+0,026; +0,075] |
| Articulos de los mismos codigos no vistos | 0,789 | 0,845 | +0,055 [+0,028; +0,085] |
| Codigos nuevos (SK, ZoZPP) | 0,837 | 0,858 | +0,021 [-0,007; +0,049] |
| Preguntas coloquiales | 0,569 | 0,687 | +0,118 |
| Consultas de busqueda | 0,896 | 0,907 | +0,011 |
| Preguntas de jurista | 0,939 | 0,939 | 0,000 |

Otras cifras declaradas: tres semillas dan 0,848 ± 0,004; en el subconjunto golden con relevancia multiple el modelo obtiene 0,869 frente a 0,831 del base; y en MTEB RuBQRetrieval (dominio general) baja a 0,651 frente a 0,686 del base. Todos los numeros estan en la carpeta `results/` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,47 GB en fp32 y unos 0,24 GB en fp16 (calculado a partir de los 117,65M de parametros; no es un dato declarado por el autor). El repositorio ocupa 0,5 GB, coherente con pesos en fp32.
- Entrenamiento: 2,1 GB de pico de memoria en una RTX 3070 de 8 GB, con 3,9 minutos de duracion total.
- GPU: cabe en cualquier GPU de consumo con mas de 1 GB de VRAM libre. No se declaran pruebas en A100, H100 o RTX 4090, pero el modelo es muy inferior a la capacidad de esas tarjetas.
- Inferencia en CPU: 21,7 ms por consulta segun el autor (la CPU concreta no se especifica). Sobre ese dato, el orden de magnitud es de decenas de consultas por segundo en un unico hilo, adecuado para servicios con carga moderada sin GPU.
- Almacenamiento del indice: cada vector ocupa 1.536 bytes en fp32 y 768 bytes en fp16, mas el texto del fragmento. Un corpus de miles de articulos entra en pocos megabytes.
- Opciones de despliegue: sentence-transformers (probado con las versiones 3.3.1 y 6.1.0, que producen embeddings identicos), text-embeddings-inference y endpoints compatibles, segun las etiquetas del repositorio. No se declaran variantes ONNX, GGUF ni despliegues en vLLM, llama.cpp, Ollama o TGI.
- Throughput y latencia: solo se publica la latencia por consulta en CPU para los cuatro modelos comparados. No hay datos de throughput con batching ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | nDCG@10 (RuLawRetrieval) | Recall@10 | CPU (ms/consulta) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| multilingual-e5-small-ru-law | 118M | 0,845 | 0,948 | 21,7 | MIT | HuggingFace (sentence-transformers) |
| intfloat/multilingual-e5-small (base) | 118M | 0,802 | 0,905 | 21,8 | no disponible en la informacion proporcionada | HuggingFace |
| intfloat/multilingual-e5-large | 560M | 0,859 | 0,959 | 145,2 | no disponible en la informacion proporcionada | HuggingFace |
| FRIDA | 823M | 0,878 | 0,964 | 272,2 | no disponible en la informacion proporcionada | no disponible |

La lectura que da el autor es que este modelo es indistinguible estadisticamente de multilingual-e5-large en la tarea (diferencia de 0,014 nDCG frente al intervalo de confianza de la mejora) con 6,7 veces menos latencia en CPU, y que queda por detras de FRIDA, que es 7 veces mas grande y 12,5 veces mas lento en CPU. No se aportan datos de contexto ni de licencia de las alternativas mas alla de lo indicado.

## Limitaciones y advertencias

- Los resultados estan declarados por el autor y marcados como no verificados (`verified: false`) en el model-index; se evaluan sobre un unico conjunto de test construido por el propio autor.
- El entrenamiento usa exclusivamente preguntas sinteticas generadas por Qwen3-8B. Sobre preguntas reales el rendimiento puede diferir y no se han publicado evaluaciones con usuarios reales.
- La ganancia no es homogenea: en preguntas de jurista el modelo no mejora nada (0,939 frente a 0,939) y en codigos no vistos (Codigo de Familia, Ley de Proteccion de los Consumidores) la mejora no es estadisticamente significativa (+0,021 con intervalo que cruza el cero).
- El modelo se entreno sobre una unica edicion de las leyes, fechada en septiembre de 2026 segun la model card. Una reforma legislativa posterior invalida parte del ajuste si no se reindexa y reentrena.
- Degradacion en dominio general: en MTEB RuBQRetrieval cae a 0,651 frente a 0,686 del modelo base (−0,035). Para un servicio mixto (legal + general) conviene mantener dos indices o dos modelos.
- La escala de similitud coseno esta desplazada respecto al modelo original: los umbrales de corte calibrados para la e5 original no son validos y deben recalibrarse.
- Los prefijos "query: " y "passage: " son obligatorios. Omitirlos o usarlos de forma inconsistente degrada la recuperacion.
- Limite de 512 tokens por entrada; el modelo se entreno con fragmentos de 208 tokens, por lo que textos mas largos deben dividirse en fragmentos con el titulo del articulo al principio.
- Cobertura linguistica limitada al ruso. El modelo base es multilingue, pero no hay ninguna garantia de que el ajuste legal se transfiera a otros idiomas.
- No es un modelo generativo: no redacta respuestas ni puede alucinar textos por si mismo, pero tampoco verifica la correccion juridica de lo recuperado. Cualquier alucinacion provendra del LLM que consuma los pasajes.
- Sesgo de dominio: el corpus refleja el ordenamiento juridico de la Federacion Rusa y no es aplicable a otras jurisdicciones sin reentrenamiento.
- La licencia MIT permite uso comercial sin restricciones declaradas, pero al derivar de intfloat/multilingual-e5-small conviene verificar la licencia del modelo base en su propio repositorio antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad ni informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alekseevpavel04/multilingual-e5-small-ru-law
- Conjunto de datos RuLawRetrieval: https://huggingface.co/datasets/alekseevpavel04/ru-law-retrieval
- Codigo, datos y resultados: https://github.com/alekseevpavel04/ru-law-retrieval
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda proporcionada.
