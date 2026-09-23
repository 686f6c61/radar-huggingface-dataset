# BYU-Idaho/ZaraRerank

## Resumen

ZaraRerank es un cross-encoder de reordenación (reranker) especializado en las Obras Canónicas (Standard Works) de La Iglesia de Jesucristo de los Santos de los Últimos Días. Lo desarrolla Brigham Young University-Idaho (BYU-Idaho) y es un ajuste fino de ZaraBERTa, el modelo base de la familia ZaraAI, convertido en clasificador de secuencias con una única logit de salida. Su función es recibir una pregunta y un versículo candidato de forma conjunta y puntuar la relevancia del versículo, de modo que se coloque en primera posición el pasaje correcto.

El modelo resuelve un problema concreto de recuperación semántica en dominio restringido: los embeddings generalistas, como text-embedding-3-large de OpenAI, fallan al distinguir versículos muy próximos entre sí o escritos con vocabulario del siglo XIX. Combinado con ZaraEmbed (que recupera los 100 mejores candidatos), ZaraRerank coloca el versículo correcto en primera posición en 243 de 289 preguntas reservadas del tipo "sin nombres" (84 %), frente a 191 de ZaraEmbed en solitario y 126 de OpenAI.

Técnicamente es un transformer encoder-only de tipo RoBERTa con 357.317.633 parámetros, 24 capas, dimensión oculta de 1024 y vocabulario de 52.176 tokens con distinción de mayúsculas. Es relevante ahora porque demuestra que un modelo pequeño (~357 M de parámetros), entrenado sobre texto de dominio público y sin datos de anotación masiva, supera a un embedder propietario de gran escala en una tarea de búsqueda vertical, y porque se distribuye con licencia MIT y compatibilidad con pipelines de Text Embeddings Inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RobertaForSequenceClassification (transformer encoder-only, cross-encoder), 24 capas, hidden 1024, vocabulario 52176 con distinción de mayúsculas, una logit de salida |
| Parámetros totales | 357.317.633 (según safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens en total para el par pregunta + versículo; se trunca únicamente el versículo (`truncation="only_second"`) |
| Tipos de cuantización | No disponible: el autor no publica pesos cuantizados ni documenta recetas de cuantización |
| Idiomas soportados | En (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,4 GB); librería `transformers` |
| Pipeline declarado | `text-ranking` |
| Modelo base | BYU-Idaho/ZaraBERTa |
| Familia | ZaraAI (BYU-Idaho) |
| Texto de entrenamiento | Texto de dominio público de las Obras Canónicas; sin titulares de capítulo, notas al pie ni ayudas de estudio de la Iglesia |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa estándar adaptado a clasificación de pares: se concatenan la pregunta y el versículo candidato, se procesan conjuntamente con atención cruzada en todas las capas y se proyecta la representación final a una sola logit. Una logit más alta indica mayor relevancia. El vocabulario, el tokenizador y los pesos de partida provienen de ZaraBERTa, un modelo de lenguaje nativo de escrituras entrenado por el mismo grupo. El ajuste fino se realizó sobre los 100 mejores candidatos recuperados por ZaraEmbed, es decir, el reranker se especializa en desambiguar dentro de un conjunto ya filtrado por similitud semántica, que es el escenario donde más aporta.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset de pares ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles. Sí se especifica que los tests de evaluación usan 289 versículos de 37 capítulos del Libro de Mormón, Doctrina y Convenios y Perla de Gran Precio que no aparecieron en ningún par de entrenamiento, y que las preguntas de esos tests fueron redactadas por otro modelo de lenguaje distinto del usado para generar las preguntas de entrenamiento, en dos estilos (sin nombres y con narrativa). La innovación destacable no es arquitectónica, sino de eficiencia: con 357 M de parámetros y una ventana de 128 tokens, el modelo puntúa 100 candidatos en aproximadamente 0,23 s por pregunta en una GPU NVIDIA GB10, lo que lo hace viable en la ruta crítica de un buscador interactivo.

## Capacidades

- Reordenación de pares pregunta–versículo mediante una puntuación escalar única; no genera texto.
- Recuperación semántica de precisión en dominio restringido: coloca el versículo correcto en primera posición en el 84 % de las preguntas "sin nombres" y en el 77 % de las preguntas con narrativa (muestra de 289).
- Discriminación fina entre versículos contiguos o casi idénticos: en el ejemplo de la model card separa Mosiah 2:17 (logit 10,163) de su vecino del mismo capítulo Mosiah 2:18 (logit -1,638).
- Integración en pipelines de retrieval de dos etapas: recuperación top-100 con ZaraEmbed y reordenación posterior.
- Compatible con `text-embeddings-inference` y con endpoints compatibles, lo que permite servirlo como servicio HTTP.
- Capacidad monolingüe: únicamente inglés.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un componente de ranking, no un modelo conversacional.
- Sin capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Buscador de escrituras para aplicaciones de estudio: el usuario escribe una pregunta en lenguaje natural y el pipeline recupera los 100 versículos más similares con ZaraEmbed y los reordena con ZaraRerank. El modelo es adecuado porque está entrenado sobre el vocabulario y las particularidades del corpus, y supera a un embedder generalista de gran escala en esa distribución concreta.
- Asistentes de estudio personal integrados en webs o aplicaciones móviles: dado que el modelo pesa ~357 M de parámetros y ocupa 0,7 GB en fp16, puede desplegarse en un servicio pequeño con latencia inferior al segundo, suficiente para una caja de búsqueda interactiva.
- Generación aumentada por recuperación (RAG) sobre corpus doctrinal: ZaraRerank actúa como etapa de reordenación antes de pasar los pasajes seleccionados a un modelo generativo, lo que reduce el ruido en el contexto inyectado y, con ello, el riesgo de respuestas mal fundamentadas.
- Desambiguación de referencias cruzadas: cuando varias citas comparten tema y vocabulario (por ejemplo, servicio a Dios frente a servicio al prójimo), el cross-encoder distingue por contexto conjunto, algo que un bi-encoder no puede hacer porque codifica pregunta y documento por separado.
- Investigación en modelos de dominio específico: sirve como caso de estudio reproducible de hasta qué punto un modelo pequeño entrenado con texto de dominio público puede superar a embeddings propietarios en una tarea vertical.
- Evaluación comparativa interna (baseline): puede usarse como referencia de calidad de ranking para medir cualquier cambio en el índice, en el troceado del corpus o en el modelo de recuperación de primera etapa.
- Curación y evaluación de corpus: puntuar pares pregunta–pasaje para detectar huecos de cobertura en un índice documental o para priorizar la revisión humana de resultados.
- Búsqueda por similitud temática en archivos históricos o literarios en inglés del siglo XIX, aprovechando que el vocabulario base procede de ese registro lingüístico.

## Benchmarks y rendimiento

Datos publicados por el autor. La comparación es el pipeline completo ZaraEmbed + ZaraRerank frente a text-embedding-3-large de OpenAI en solitario, sobre texto de versículo sin contexto adicional.

Preguntas reservadas generadas automáticamente (289 versículos de 37 capítulos no vistos en entrenamiento), métrica top-1:

| Test | ZaraEmbed solo | ZaraEmbed + ZaraRerank | OpenAI text-embedding-3-large |
|---|---|---|---|
| Sin nombres (289) | 191 | 243 (84 %) | 126 (44 %) |
| Narrativa (289) | 175 | 222 (77 %) | 143 (49 %) |

La ventaja del pipeline sobre OpenAI en el test "sin nombres" es significativa con McNemar p = 2e-26. La reordenación mejora el top-1 de ZaraEmbed en 52 preguntas en "sin nombres" y en 47 en "narrativa".

Benchmark de 152 preguntas escritas por personas, distribuidas en los cinco volúmenes de las Obras Canónicas:

| Benchmark | ZaraEmbed + ZaraRerank | OpenAI, versículos sin contexto | OpenAI, con contexto de capítulo |
|---|---|---|---|
| Libro de Mormón, DyC y Perla de Gran Precio (63) | 47 | 38 | 41 |
| Cinco volúmenes (152) | 98 | 108 | 120 |

En las 63 preguntas de la Restauración, la reordenación eleva a ZaraEmbed de 36 a 47 aciertos; la ventaja sobre OpenAI con contexto de capítulo (47 frente a 41) no es estadísticamente significativa (p = 0,21).

Latencia: alrededor de 0,23 s por pregunta para puntuar 100 candidatos en una GPU NVIDIA GB10.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas en la información disponible, algo esperable dado que el modelo no es generativo.

## Requisitos de hardware

- Peso de los pesos: unos 1,43 GB en fp32 y unos 0,71 GB en fp16 para los 357 M de parámetros. En int8 bajaría a unos 0,36 GB, aunque no hay pesos cuantizados publicados.
- VRAM estimada para inferencia: el modelo cabe holgadamente en cualquier GPU con 4 GB o más; la puntuación de 100 candidatos en un solo lote (128 tokens por par) añade activaciones, por lo que es recomendable disponer de 4-8 GB de VRAM si se procesa el lote completo de una vez. Estas cifras son estimaciones derivadas del recuento de parámetros, no medidas publicadas.
- Cabe en GPU de consumo: sí. Tarjetas como GTX 1650, RTX 3060, RTX 4060 o superiores son suficientes; también funciona en CPU, tal como muestra el ejemplo de la model card, aunque con mayor latencia.
- GPU recomendadas: NVIDIA GB10 (medición oficial de 0,23 s por 100 candidatos); A100, H100 o RTX 4090 aportan margen de sobra y permiten lotes mucho mayores, aunque son desproporcionadas para el tamaño del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`; Text Embeddings Inference (el repositorio declara la etiqueta `text-embeddings-inference` y `endpoints_compatible`); exportación a ONNX Runtime para CPU; conversión a formatos de llama.cpp no está documentada por el autor.
- vLLM y otros servidores orientados a modelos generativos no aplican, ya que el modelo no decodifica texto.
- Throughput: no disponible. El único dato publicado es la latencia de 0,23 s por pregunta y 100 candidatos en GB10.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BYU-Idaho/ZaraRerank | Cross-encoder reranker | 357.317.633 | 128 tokens (par completo) | MIT | Este modelo; 243/289 top-1 en el test "sin nombres" combinado con ZaraEmbed |
| BYU-Idaho/ZaraEmbed | Bi-encoder de recuperación | No disponible | No disponible | No disponible en la información proporcionada | Primera etapa del pipeline; 191/289 top-1 en solitario y 175/289 en el test de narrativa |
| BYU-Idaho/ZaraBERTa | Modelo de lenguaje base | No disponible | No disponible | No disponible en la información proporcionada | Base de ZaraEmbed y ZaraRerank |
| OpenAI text-embedding-3-large | Embedder propietario de uso general | No disponible | No disponible | Propietaria, API de pago | 126/289 y 143/289 top-1 en los tests sobre versículos sin contexto; 120/152 en el benchmark humano con contexto de capítulo |
| Otros rerankers cross-encoder de propósito general (por ejemplo, la familia BGE reranker o Jina reranker) | Cross-encoder reranker | No disponible | No disponible | No disponible | No se han publicado comparaciones directas con ZaraRerank en la información disponible; requieren evaluación propia sobre el corpus |

La única comparación con datos medidos y publicados por el autor es contra text-embedding-3-large de OpenAI. Para el resto de alternativas del mismo segmento no hay cifras en la información disponible.

## Limitaciones y advertencias

- Dominio cerrado: el modelo está ajustado para las Obras Canónicas en inglés. Fuera de ese corpus su comportamiento no está caracterizado y probablemente degrade de forma notable.
- Monolingüe: solo inglés. No hay soporte documentado para otros idiomas, ni siquiera para traducciones del mismo corpus.
- Ventana de 128 tokens para el par completo. Como solo se trunca el segundo segmento, una pregunta larga reduce el espacio disponible para el versículo y puede recortar precisamente el fragmento relevante.
- No es generativo: no produce respuestas, resúmenes ni explicaciones. Solo devuelve una puntuación de relevancia por par; cualquier texto mostrado al usuario debe venir de otra fuente.
- Tasa de error inherente: incluso en el mejor escenario, 46 de 289 preguntas (16 %) no quedan resueltas en primera posición, por lo que un producto real debería mostrar varios resultados.
- Rendimiento desigual por volumen: el pipeline supera a OpenAI en las preguntas del Libro de Mormón, DyC y Perla de Gran Precio, pero queda por detrás en el conjunto de los cinco volúmenes, lo que sugiere menor cobertura o peor ajuste en los textos bíblicos.
- Ausencia de evaluación de sesgos: no se publican análisis de sesgo, robustez ante entradas adversarias ni comportamiento ante preguntas fuera de dominio o con errores ortográficos.
- Riesgo de respuesta incorrecta en producción: el sistema puede devolver un versículo con puntuación alta pero doctrinalmente inadecuado. La model card presenta el modelo como ayuda al estudio personal, no como sustituto de la doctrina oficial ni del criterio humano.
- Licencia MIT: permite uso comercial y modificación sin restricciones prácticas, siempre que se conserve el aviso de copyright. El autor declara que el entrenamiento usó únicamente texto de dominio público, pero no se detalla la procedencia exacta de todos los pares de entrenamiento.
- Madurez: el repositorio registra 0 descargas y 0 "likes", sin validación independiente conocida. Conviene evaluar el modelo sobre el corpus propio antes de integrarlo en un sistema crítico.
- Los pesos y el tokenizador dependen del vocabulario de ZaraBERTa; usarlos con tokenizadores genéricos de RoBERTa alteraría las puntuaciones.
- Dependencia del pipeline: el rendimiento reportado se mide siempre con ZaraEmbed como primera etapa. Usar ZaraRerank sobre candidatos de otro recuperador no está evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BYU-Idaho/ZaraRerank
- Modelo base ZaraBERTa: https://huggingface.co/BYU-Idaho/ZaraBERTa
- Embedder complementario ZaraEmbed: https://huggingface.co/BYU-Idaho/ZaraEmbed
- Colección ZaraAI: https://huggingface.co/collections/BYU-Idaho/zaraai
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos correspondían a consultas lingüísticas y filosóficas sin relación. No hay, por tanto, papers, blogs ni demos adicionales disponibles.
