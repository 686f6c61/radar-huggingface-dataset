# aghasalim/bge-small-euaiact

## Resumen

bge-small-euaiact es un modelo de embeddings de frases obtenido por fine-tuning de BAAI/bge-small-en-v1.5 sobre un corpus de un unico documento: el Reglamento (UE) 2024/1689 (Reglamento de Inteligencia Artificial), en su texto consolidado de 27 de julio de 2026 tras la modificacion por el Reglamento (UE) 2026/1744. Lo desarrolla el usuario de Hugging Face aghasalim como parte del proyecto eu-ai-act-rag, y su funcion es mapear una pregunta en lenguaje natural al parrafo concreto del reglamento que la responde, para su uso en pipelines de recuperacion aumentada (RAG).

Tecnicamente es un transformer tipo BERT de 33,36 millones de parametros, con embeddings de 384 dimensiones, ventana de 512 tokens y similitud coseno. No es un modelo generativo: es un encoder de recuperacion densa que se combina con BM25 en el sistema del proyecto para localizar articulos y apartados del reglamento.

Su relevancia es acotada pero clara: demuestra que un fine-tuning pequeno y reproducible sobre un dominio muy estrecho (un solo texto legal) mejora de forma medible la recuperacion frente al modelo base, con un coste de inferencia minimo. Es un proyecto de estudiante, no una herramienta legal, y esta disenado exclusivamente para el texto ingles del reglamento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; el modelo base admite cuantizacion GGUF/ONNX en el ecosistema sentence-transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 384 |
| Funcion de similitud | coseno (con `normalize_embeddings=True`) |
| Prefijo de consulta | "Represent this sentence for searching relevant passages: " (solo en queries, no en pasajes) |
| Tamano del repo | 0,1 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | BAAI/bge-small-en-v1.5 |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder BERT pequeno orientado a recuperacion densa, y se ajusta con `MultipleNegativesRankingLoss` (negativos en el propio batch, sin pasajes duplicados en un mismo batch) durante 4 epocas, con batch size 64, learning rate 2e-5 y semilla 13. El entrenamiento fue una unica ejecucion con ajustes fijos, sin busqueda de hiperparametros contra el conjunto de evaluacion.

Los datos de entrenamiento son sinteticos: un modelo local Qwen2.5-14B en 4 bits (via mlx-lm) genero tres preguntas por cada uno de los 779 fragmentos vinculantes del texto de 2026 (una busqueda corta, un escenario concreto y una en lenguaje cotidiano), lo que produjo 2.267 preguntas. Se reservo un decimo de los fragmentos con sus preguntas como conjunto de validacion, y los 2.042 pares restantes se usaron para el entrenamiento. El script de entrenamiento rechaza arrancar si una pregunta sintetica coincide con una pregunta de evaluacion, lo que evita fuga de datos entre ambos conjuntos.

La innovacion no esta en la arquitectura, sino en el procedimiento: adaptacion de dominio sobre un corpus legal unico y cerrado, con generacion sintetica de consultas y un esquema de evaluacion reproducible (`make experiments` en el repositorio). No se empleo RLHF ni DPO; es un fine-tuning supervisado de similitud.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para recuperacion densa (retrieval) y similitud semantica.
- Mapeo de preguntas en ingles a parrafos concretos del Reglamento (UE) 2024/1689 consolidado.
- Recuperacion de fragmentos legales con estructura de articulo y capitulo (por ejemplo, "Article 99(3) - Penalties").
- Buen comportamiento en consultas de tipo escenario concreto y en consultas formuladas en lenguaje cotidiano, segun el diseno del conjunto de entrenamiento.
- Capacidad de multi-hop parcial cuando se combina con busqueda dividida (split search) en el sistema del proyecto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por si mismo; es un componente de recuperacion dentro de un pipeline mayor.
- No tiene modo thinking, vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Asistente interno de cumplimiento normativo: dado un caso de uso de un sistema de IA, el modelo recupera los parrafos del reglamento aplicables (practicas prohibidas, obligaciones de transparencia, evaluacion de conformidad) para que un LLM genere la respuesta citando la fuente.
- Construccion de un indice RAG sobre el reglamento: indexar los 994 fragmentos del texto consolidado y servir busquedas densas con similitud coseno, con un coste de almacenamiento minimo (384 dimensiones por fragmento).
- Triaje de consultas legales: clasificar y enrutar preguntas de equipos juridicos hacia el articulo correspondiente antes de la revision humana, reduciendo el tiempo de localizacion del texto aplicable.
- Base para evaluacion de sistemas RAG legales: el repositorio del proyecto incluye preguntas de evaluacion y scripts reproducibles, utiles como banco de pruebas para comparar estrategias de recuperacion (densa, BM25, hibrida, split search).
- Prototipado rapido en entornos con recursos limitados: con 33 millones de parametros y 0,1 GB de pesos, se puede desplegar en CPU o en una GPU consumer pequena para demos y pruebas de concepto.
- Soporte a la redaccion de documentacion de conformidad: recuperar los requisitos concretos del reglamento para anexarlos a fichas tecnicas o evaluaciones de impacto, siempre con revision humana posterior.
- Filtrado previo en pipelines de atencion al cliente sobre IA: detectar si una consulta de usuario se refiere a una obligacion regulatoria concreta antes de escalarla a un especialista.

## Benchmarks y rendimiento

Preguntas sinteticas reservadas (225, sobre fragmentos no vistos en entrenamiento), busqueda densa sobre los 994 fragmentos:

| Modelo | Recall at 6 |
|---|---|
| bge-small-en-v1.5 | 60,0% |
| bge-small-euaiact | 86,7% |

Preguntas escritas a mano del conjunto de evaluacion del proyecto (110 con respuesta, texto de 2026, fragmentos por parrafo, k=6). La busqueda densa se fusiona con BM25, por lo que son cifras del sistema completo y no del modelo aislado. La ultima columna es la comparacion pareada con la primera fila en recall completo: preguntas que mejoran / empeoran y test de signos bilateral exacto.

| Recuperacion | Hit rate | Recall completo | Recall completo multi-hop | Mejor / peor (p) |
|---|---|---|---|---|
| Hibrida, bge-small-en-v1.5 | 97,3% | 84,5% | 26,3% | n/a |
| Hibrida, bge-small-euaiact | 99,1% | 88,2% | 36,8% | 5 / 1 (0,219) |
| Split search, bge-small-en-v1.5 | 97,3% | 90,0% | 57,9% | 6 / 0 (0,031) |
| Split search, bge-small-euaiact | 99,1% | 92,7% | 63,2% | 9 / 0 (0,004) |

El propio autor senala que, por si solo, cambiar el embedder no produce una mejora significativa sobre 110 preguntas; con split search si la produce.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (33,36 M de parametros, ~134 MB de pesos) y del orden de 70 MB en fp16; el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente para lotes grandes.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU reciente; tambien funciona en CPU con throughput aceptable para indexacion por lotes.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (el modelo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime y despliegue en Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bge-small-euaiact | 33,36 M | 512 tokens | 384 | Reglamento UE de IA (ingles) | MIT | Hugging Face |
| BAAI/bge-small-en-v1.5 | 33,36 M | 512 tokens | 384 | Generico (ingles) | MIT | Hugging Face |
| bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | Generico (ingles) | MIT | Hugging Face |
| e5-small-v2 | ~33 M | 512 tokens | 384 | Generico (ingles) | MIT | Hugging Face |

Frente al modelo base, la diferencia medible esta en el dominio: 86,7% frente a 60,0% de recall at 6 en preguntas sinteticas reservadas sobre el reglamento. Frente a alternativas genericas de mayor tamano como bge-base-en-v1.5, no hay datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta adaptado a un unico texto: ha visto la mayoria de los pasajes sobre los que versan las preguntas de evaluacion (con otras preguntas asociadas), por lo que las cifras no dicen nada sobre otra ley ni sobre este mismo reglamento tras la siguiente enmienda.
- Las preguntas de entrenamiento provienen de un solo modelo y un solo prompt, lo que limita la diversidad de estilos de consulta cubiertos.
- Solo ingles, aunque el reglamento es igualmente valido en 24 idiomas; no cubre consultas en castellano ni en otras lenguas oficiales de la UE.
- Las preguntas se redactaron a partir del texto consolidado de 27 de julio de 2026, que no tiene efectos juridicos; solo los textos del Diario Oficial son autenticos.
- Riesgo de alucinacion: no aplica en sentido estricto porque no genera texto, pero puede recuperar el parrafo equivocado en preguntas ambiguas o fuera del dominio del reglamento.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar del modelo base, hereda los sesgos de este.
- Licencia MIT, igual que el modelo base, lo que permite uso comercial; el corpus es el Reglamento (UE) 2024/1689 del Publications Office de la UE, reutilizado bajo la Decision 2011/833/UE.
- No esta afiliado ni respaldado por la UE.
- Es un proyecto de estudiante y no constituye asesoramiento juridico; cualquier uso en produccion debe acompanarse de revision humana y de validacion con las fuentes oficiales.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aghasalim/bge-small-euaiact
- Repositorio del proyecto: https://github.com/aghasalim/eu-ai-act-rag
- Preguntas sinteticas de entrenamiento: https://github.com/aghasalim/eu-ai-act-rag/blob/main/train/synthetic_queries.jsonl
- Lectura del reglamento parrafo a parrafo: https://aghasalim.github.io/eu-ai-act-rag/
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
