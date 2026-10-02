# Perry-DLC/upy-u2t02-simcse

## Resumen
upy-u2t02-simcse es un modelo de embeddings de frases (sentence embeddings) publicado en Hugging Face por el usuario Perry-DLC (Diego Jesus Loria Campos). Se trata de un encoder basado en BERT afinado con el marco SimCSE (Simple Contrastive Learning of Sentence Embeddings) en su variante no supervisada, orientado al pipeline de similitud semantica entre frases. El repositorio declara 109.482.240 parametros en formato safetensors y un tamano de 0,4 GB, cifras compatibles con una configuracion BERT-base (la cifra coincide exactamente con la de bert-base-uncased, aunque la model card no especifica el checkpoint de partida).

El entrenamiento parte de un subconjunto de 100.000 ejemplos de SNLI (solo split de train), con 165.529 frases unicas y 33.351 pares de implicacion, de los cuales 9.488 incluyen contradiccion. La receta declarada emplea batch de 64, temperatura 0,05, learning rate 3e-5, una unica epoca, dropout 0,1 y longitud maxima de 64 tokens, con seleccion del mejor checkpoint mediante el split de desarrollo de STS-B. No se usaron datos de entrenamiento de STS-B.

Su relevancia practica es acotada: es un checkpoint experimental de un ejercicio academico, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y con resultados publicados unicamente en STS-B (Spearman 69,84 en test). No esta pensado para competir con los modelos de embeddings de produccion, pero sirve como referencia reproducible del metodo SimCSE sobre un presupuesto de datos y computo muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (tag `bert`) con objetivo contrastivo SimCSE; variante no supervisada (`mode: unsup`, run `unsup_s42`) |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens (max length de entrenamiento declarado); limite arquitectonico del encoder no disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se incluyen versiones GGUF, ONNX ni INT8) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |
| Dimension de embedding | No disponible |
| Funcion de similitud | Similitud coseno normalizada, sin regresor |
| Pooling | No disponible |
| Prefijo de instruccion | No disponible |

## Arquitectura y entrenamiento
El modelo sigue la receta de SimCSE presentada por Princeton-NLP en EMNLP 2021: un encoder transformer tipo BERT que se entrena con un objetivo contrastivo donde la misma frase se usa como positiva de si misma, aplicando dropout estandar como unica fuente de ruido. La model card declara explicitamente el modo `unsup` con nombre de ejecucion `unsup_s42`, aunque el corpus de entrenamiento descrito contiene pares de implicacion de SNLI (165.529 frases unicas, 33.351 pares de entailment y 9.488 pares con contradiccion); la receta no activa negativos duros (`hard_negatives: false`) ni mascara compartida (`same_mask: false`).

Los hiperparametros completos son: semilla 42, batch size 64, temperatura 0,05, 1 epoca, dropout 0,1, learning rate 3e-5, evaluacion cada 250 pasos y longitud maxima 64 tokens. No se menciona el uso de RLHF, DPO ni ninguna fase de ajuste adicional; el pipeline es puramente contrastivo. La seleccion del mejor checkpoint se realiza con el split de desarrollo de STS-B, lo que introduce una dependencia de ese conjunto para el ajuste de la parada, aunque sus datos no se usen para actualizar los pesos.

## Capacidades
- Generacion de embeddings de frases para calcular similitud semantica mediante coseno normalizado, sin regresor adicional.
- Recuperacion semantica (semantic search) sobre corpus de frases cortas o parrafos truncados.
- Deteccion de duplicados y near-duplicates textuales.
- Agrupamiento (clustering) y organizacion tematica de colecciones de frases.
- Clasificacion de intenciones o etiquetado por similitud con ejemplos de referencia (zero-shot mediante prototipos).
- Extraccion de caracteristicas para sistemas de ranking o re-ranking de resultados.
- Integracion con Text Embeddings Inference y con el ecosistema sentence-transformers (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento extendido: es exclusivamente un encoder de embeddings.

## Casos de uso
- Busqueda semantica en documentacion tecnica interna: indexar fragmentos cortos (titulos, FAQ, lineas de changelog) y recuperar los mas similares a una consulta mediante coseno; su ventana de 64 tokens lo limita a fragmentos breves, no a documentos completos.
- Deduplicacion de tickets de soporte: agrupar incidencias con umbral de similitud para detectar el mismo problema repetido sin depender de coincidencia exacta de cadenas.
- Construccion de un recuperador ligero para RAG sobre FAQs: generar embeddings de preguntas frecuentes y usarlos como primer nivel de retrieval previo a un cross-encoder.
- Clustering exploratorio de encuestas o resenas: proyectar frases de feedback de usuario y agruparlas por tematica para analisis cualitativo.
- Clasificacion de intenciones en un bot conversacional: comparar la consulta del usuario con frases prototipo por clase cuando no hay datos etiquetados suficientes.
- Deteccion de parafrasis y control de plagio en textos cortos: comparar pares de frases con umbral calibrado sobre la distribucion de similitudes.
- Etiquetado automatico de grandes volumenes de frases en CPU: con 109 millones de parametros, el coste de inferencia es bajo y permite procesar lotes grandes sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica (test) | Resultado |
|---|---|
| STS-B Spearman (x100) | 69,84 |
| Alignment (pares con score >= 0,8, alpha=2) | 0,2274 |
| Uniformity (t=2, 20.000 pares muestreados) | -2,3765 |

El modelo se evalua con similitud coseno normalizada y sin regresor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de suites de embeddings como MTEB en la informacion disponible, y tampoco se proporcionan cifras de referencia de los modelos comparados para contrastar el Spearman obtenido.

## Requisitos de hardware
- Pesos en fp32: aproximadamente 0,44 GB (109.482.240 parametros x 4 bytes); en fp16, alrededor de 0,22 GB.
- VRAM estimada para inferencia: del orden de 1 GB con lotes pequenos, incluyendo activaciones y overhead del runtime (estimacion derivada del tamano de los pesos, no una medicion publicada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, GTX 1650, T4, RTX 4090, A100, H100 sobradamente); tambien es viable en CPU para lotes moderados.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo con 4 GB o mas.
- Opciones de despliegue: sentence-transformers (libreria declarada), Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y exportacion a ONNX mediante Optimum. vLLM no es la via adecuada al no ser un modelo generativo; llama.cpp incluye soporte de embeddings para arquitecturas tipo BERT, aunque no es el camino estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Perry-DLC/upy-u2t02-simcse | 109,5 M | 64 tokens (entrenamiento) | No disponible | Hugging Face, 0 descargas |
| princeton-nlp/sup-simcse-bert-base-uncased | ~110 M | 512 tokens | Apache-2.0 | Hugging Face, referencia del metodo |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache-2.0 | Hugging Face, ampliamente desplegado |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens | MIT | Hugging Face, con resultados MTEB publicados |

Los datos de los modelos comparados proceden de sus fichas publicas; no se dispone de valores de benchmark comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. Cabe senalar que los tres alternativas superan a este checkpoint en longitud de contexto util y en soporte de licencia explicito.

## Limitaciones y advertencias
- Solo ingles: cualquier uso en castellano u otros idiomas no esta soportado por el entrenamiento declarado.
- Longitud maxima de 64 tokens en entrenamiento: frases o parrafos mas largos se truncan, con perdida de significado.
- Volumen de datos muy reducido (subconjunto de 100.000 ejemplos de SNLI) y una sola epoca, lo que aumenta el riesgo de sobreajuste al dominio de NLI.
- Sesgo de dominio declarado por el propio autor: el comportamiento fuera de dominios similares a SNLI no esta caracterizado.
- La model card indica explicitamente que no se reclama fiabilidad medica ni factual, y que la similitud semantica no equivale a implicacion factual.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, lo que supone un riesgo legal en produccion.
- Sin validacion de la comunidad (0 descargas, 0 likes) ni resultados en suites estandar como MTEB; el unico dato es un Spearman de 69,84 en STS-B test, ajustado con el split de desarrollo de ese mismo benchmark.
- Riesgo de alucinacion no aplicable en sentido generativo (el modelo no genera texto), pero si existe riesgo de falsos positivos en similitud, es decir, puntuar como cercanas frases que no comparten significado real.
- La model card indica que faltan miembros del equipo por acreditar antes de la publicacion definitiva, lo que sugiere un estado no final del artefacto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Perry-DLC/upy-u2t02-simcse
- Perfil del autor: https://huggingface.co/Perry-DLC
- Otros modelos del autor: https://huggingface.co/Perry-DLC/models
- Repositorio oficial de SimCSE (Princeton-NLP): https://github.com/princeton-nlp/SimCSE
- Paper SimCSE (arXiv): https://arxiv.org/pdf/2104.08821v4
