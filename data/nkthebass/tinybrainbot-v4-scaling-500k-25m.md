# nkthebass/tinybrainbot-v4-scaling-500k-25m

# TinyBrainBot v4: estudio de escalado de 500K a 25M

## Resumen

TinyBrainBot v4 es un estudio de escalado compuesto por cinco modelos de lenguaje decoder-only entrenados desde cero por el usuario nkthebass. Los cinco comparten exactamente el mismo corpus de 11.000 millones de tokens, el mismo orden de lectura de los datos, el mismo schedule de entrenamiento y el mismo tokenizador de 14.000 tokens; la unica variable que cambia es el tamano del modelo, que va de 0,48M a 25,18M de parametros no de embedding. Ese diseno controlado convierte al repositorio en un instrumento de investigacion para medir el efecto puro de la escala, no en un modelo de produccion.

El modelo de mayor tamano de la serie (carpeta `25m`) tiene 30,55M de parametros totales (25,18M no de embedding) y se entreno durante unas 22 horas en 2 GPU. La arquitectura es un transformer denso con atencion agrupada (2 cabezas KV frente a 6 cabezas de consulta, con cabeza de 64 dimensiones) y embeddings atados entre entrada y salida. El entrenamiento se hizo en tres fases sobre una mezcla de datos web, referencia, narrativa, codigo, matematicas, libros de texto sinteticos y PDF educativos.

La relevancia del proyecto es metodologica: demuestra una curva log-lineal limpia de aproximadamente 1,3 puntos de media en 13 tareas por cada duplicacion de parametros no de embedding, y consigue igualar la media de Pythia-70M con aproximadamente la mitad de parametros (10M frente a 18,9M), a pesar de haber entrenado con 11B tokens frente a los 300B de Pythia. La contrapartida es un rendimiento muy pobre en prediccion narrativa de largo alcance: la perplejidad en LAMBADA del modelo de 25M es 125, frente a 129 de Pythia-70M, pero el de 10M sube a 311 y el de 5M a 584.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion agrupada (GQA), embeddings de entrada y salida atados |
| Parametros totales | 30,55M (variante `25m`); serie completa: 30,55M / 13,57M / 7,80M / 3,76M / 1,38M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Parametros no de embedding | 25,18M / 9,99M / 5,12M / 1,97M / 0,48M |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni variantes cuantizadas publicadas) |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Tokenizador | BPE byte-level de 14.000 tokens, digitos separados uno por token, saltos de linea preservados, sin tokens desconocidos |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 5 de octubre de 2026 |

Forma de cada variante (anchura x capas, cabezas, FFN, LR maximo):

| Carpeta | Anchura x capas | Cabezas (Q / KV) | FFN | LR maximo | Tiempo de entrenamiento |
|---|---|:--:|--:|--:|---|
| `25m` | 384 x 16 | 6 / 2 | 1024 | 2e-3 | ~22 h, 2 GPU |
| `10m` | 256 x 14 | 4 / 2 | 672 | 3e-3 | ~21 h |
| `5m` | 192 x 13 | 3 / 1 | 512 | 4e-3 | ~17 h |
| `2m` | 128 x 10 | 2 / 1 | 384 | 6e-3 | ~11 h |
| `500k` | 64 x 9 | 1 / 1 | 192 | 1e-2 | ~8 h |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico, sin mezcla de expertos ni componentes de estado recurrente. Todas las variantes usan atencion agrupada: por ejemplo, el modelo de 25M tiene 6 cabezas de consulta y 2 cabezas de clave-valor, cada una de 64 dimensiones, sobre un modelo de 384 dimensiones y 16 capas. Los embeddings estan atados (la matriz de entrada y la de salida son la misma), lo que reduce el recuento de parametros. En las variantes mas pequenas el embedding domina el modelo: en el de 500K representa el 65% de los parametros totales, mientras que en el de 25M baja al 18%.

El preentrenamiento usa 11.000 millones de tokens en tres etapas. La etapa 1 (9.700M de tokens) combina web (37%: FineWeb-Edu y DCLM), texto de referencia (13,5%: Wikipedia), narrativa (11%: Project Gutenberg y BookCorpusOpen), codigo (9%), matematicas (9%: MegaMath y FineMath), libros de texto sinteticos (7,5%: Cosmopedia), preguntas y hechos (7%), PDFs educativos (5,5%) y razonamiento (0,5%). La etapa 2 (500M de tokens) repite la mezcla y anade un 7,8% de texto generado especificamente para el proyecto con sentido comun cotidiano, procedimientos, aritmetica resuelta y hechos breves. La etapa 3 es un anneal de 803M de tokens sobre una mezcla densa en hechos, con el learning rate decreciendo progresivamente (el detalle final del schedule queda truncado en la model card publicada). No se menciona ningun tipo de ajuste posterior al preentrenamiento: no hay RLHF, DPO, SFT ni plantilla de chat.

## Capacidades

- Generacion de texto autoregresiva y completado de texto en ingles, con calidad limitada por el tamano (30M de parametros en la variante mayor).
- Resolucion de tareas de conocimiento y sentido comun de opcion multiple a un nivel apenas superior al azar: MMLU 23,7, ARC-Challenge 24,9, CommonsenseQA 20,3, MathQA 21,9.
- Cierto rendimiento en tareas de ciencia elemental: SciQ 65,9 en `acc_norm` y 73,7 en `acc` para el modelo de 25M.
- Prediccion narrativa de rango corto: perplejidad LAMBADA de 125 en el modelo de 25M, que se degrada muy rapidamente al reducir tamano.
- Capacidad de servir como referencia de investigacion reproducible: cinco modelos con el mismo corpus y orden de datos, utiles para estudiar leyes de escalado y dinamica de entrenamiento.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni de razonamiento multi-paso estructurado.
- No hay capacidades multilingues: solo ingles.
- No hay modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No hay ajuste por instrucciones: el modelo no sigue ordenes ni mantiene formato conversacional.

## Casos de uso

- Investigacion sobre leyes de escalado: el repositorio permite reproducir experimentos donde la unica variable es el tamano del modelo, ya que los cinco comparten tokenizador, corpus, orden de datos y schedule. Es el caso de uso principal y esta explicitamente motivado en la model card.
- Docencia y aprendizaje: el modelo de 500K tiene 1,38M de parametros totales, por lo que se puede entrenar, inspeccionar y desplegar desde cero en un portatil para explicar el funcionamiento interno de un transformer.
- Generacion de texto en dispositivos sin GPU: con 30,55M de parametros, el modelo de 25M cabe en memoria de un microcontrolador de gama alta o en CPU y permite autocompletado de frases cortas en ingles sin conexion.
- Puntuacion de perplejidad para filtrado de corpus: al ser un modelo entrenado sobre una mezcla diversa de 11B de tokens, puede usarse como scorer barato para detectar texto anomalo o fuera de dominio en pipelines de curación de datos, especialmente en ingles.
- Clasificacion por verosimilitud: evaluar la probabilidad asignada a opciones discretas permite reutilizarlo como clasificador binario o de opcion multiple, aunque su precision en tareas de sentido comun (CommonsenseQA 20,3) limita su uso a triaje y no a decision final.
- Base para fine-tuning ligero de dominio: por su tamano, se puede reentrenar por completo en una unica GPU de consumo sobre un corpus especializado pequeno (por ejemplo, clasificacion de tickets o extraccion de campos), con coste de experimentacion muy bajo.
- Estudio de tokenizadores de vocabulario pequeno: el BPE de 14.000 tokens con digitos separados y sin tokens desconocidos es un objeto de estudio util para analizar como afecta un vocabulario diminuto al rendimiento en matematicas y codigo.
- Prototipado de pipelines de generacion: sirve para validar infraestructura de inferencia (batching, servidores, cuantizacion) antes de escalar a modelos mayores, dado que el coste por token es minimo.

## Benchmarks y rendimiento

Resultados obtenidos con EleutherAI lm-eval-harness v0.4.13, en modo 0-shot y hasta 2.000 ejemplos por tarea. Se muestra `acc_norm` cuando la tarea lo reporta y `acc` en caso contrario. Pythia fue evaluado por el autor con el mismo harness y configuracion. La columna "Parametros no de embedding" ayuda a interpretar la comparacion.

| Benchmark | 25M | 10M | 5M | 2M | 500K | Pythia-70M | Pythia-31M |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Parametros no de embedding | 25,18M | 9,99M | 5,12M | 1,97M | 0,48M | 18,9M | 4,7M |
| ARC-Easy | **42,7** | 40,2 | 37,8 | 34,1 | 32,8 | 36,0 | 33,7 |
| ARC-Challenge | **24,9** | 23,1 | 21,5 | 21,2 | 21,1 | 21,8 | 21,0 |
| SciQ | **65,9** | 58,4 | 59,7 | 51,7 | 48,5 | 56,4 | 51,5 |
| OpenBookQA | **31,2** | 28,2 | 27,2 | 27,0 | 24,2 | 25,4 | 26,8 |
| MMLU | **23,7** | 23,1 | 23,0 | 23,1 | 23,2 | 22,9 | 22,9 |
| HellaSwag | **37,2** | 35,1 | 34,6 | 34,9 | 31,8 | 33,8 | 33,6 |
| PIQA | **60,2** | 57,3 | 56,5 | 55,9 | 54,0 | 59,2 | 56,6 |
| WinoGrande | 52,6 | 51,5 | 49,0 | 48,9 | 52,0 | **52,9** | 49,3 |
| Social IQa | **37,2** | 36,1 | 35,6 | 35,5 | 34,3 | 35,4 | 35,1 |
| CommonsenseQA | 20,3 | **20,6** | 19,9 | 19,6 | 19,2 | 19,8 | 19,7 |
| LAMBADA (OpenAI) | **23,4** | 17,6 | 14,6 | 10,4 | 5,5 | **23,4** | 17,8 |
| BoolQ | 58,8 | **60,8** | 59,1 | 50,2 | 37,2 | 59,6 | 51,0 |
| MathQA | 21,9 | 21,9 | **22,3** | 21,2 | 19,8 | 20,4 | 19,5 |
| Media (13 tareas) | **38,5** | 36,5 | 35,4 | 33,4 | 31,0 | 35,9 | 33,7 |
| Perplejidad LAMBADA (menor es mejor) | **125** | 311 | 584 | 1451 | 4894 | 129 | 270 |

Observaciones que acompanan a los resultados en la model card:

- La media de 13 tareas sube aproximadamente 1,3 puntos por cada duplicacion de parametros no de embedding de forma sostenida: 31,0 - 33,4 - 35,4 - 36,5 - 38,5.
- El modelo de 10M supera en media a Pythia-70M, que tiene casi el doble de parametros no de embedding, y el de 2M queda a 0,3 puntos de Pythia-31M, con 11B tokens de entrenamiento frente a los 300B de Pythia.
- LAMBADA es la excepcion y favorece a Pythia: a igualdad de tamano, Pythia-31M (perplejidad 270) es mejor que el modelo de 5M (584) y que el de 10M (311).
- Los efectos de tamano mas pronunciados aparecen en LAMBADA, SciQ, ARC-Easy y BoolQ; los mas planos, en MMLU, CommonsenseQA, MathQA y ARC-Challenge, que se mantienen en valores cercanos al azar en todos los tamanos.
- El modelo de 500K obtiene 37,2 en BoolQ, por debajo de una moneda al aire, porque responde "no" casi siempre (aproximadamente el 62% de las respuestas de BoolQ son "si"). Este comportamiento desaparece a partir de 2M.

La model card tambien publica filas adicionales con `acc` bruto para varias tareas (ARC-Easy, ARC-Challenge, SciQ, OpenBookQA, HellaSwag, PIQA y MathQA), consistentes con el patron anterior.

## Requisitos de hardware

- VRAM para inferencia de la variante `25m`: aproximadamente 122 MB en fp32, 61 MB en fp16 o bf16, unos 31 MB en int8 y unos 16 MB en int4. La variante `500k` ocupa unos 5,5 MB en fp32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100. El modelo no aprovecha el paralelismo de tensor ni la memoria de las GPU de gama alta.
- Cabe holgadamente en GPU de consumo y en CPU, e incluso en dispositivos embebidos (Raspberry Pi, moviles, microcontroladores con suficiente RAM). No se necesita GPU dedicada.
- Opciones de despliegue: la libreria transformers es la via soportada oficialmente, dado que el repositorio publica safetensors. vLLM o TGI son tecnicamente posibles pero desproporcionados para 30M de parametros. llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que no esta publicada en el repositorio.
- El entrenamiento de la variante mayor se completo en aproximadamente 22 horas con 2 GPU, lo que da una idea del coste de reentrenamiento.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de inferencia.

## Comparativa con modelos similares

La referencia directa son los modelos Pythia de EleutherAI, evaluados por el autor con el mismo harness y la misma configuracion. La comparacion es especialmente relevante porque enfrenta dos regimenes distintos: 11B tokens de una mezcla diversa frente a 300B tokens de The Pile.

| Modelo | Parametros no de embedding | Tokens de entrenamiento | Media (13 tareas) | Perplejidad LAMBADA | Licencia |
|---|--:|--:|:--:|:--:|---|
| TinyBrainBot v4 `25m` | 25,18M | 11B | **38,5** | **125** | Apache 2.0 |
| TinyBrainBot v4 `10m` | 9,99M | 11B | 36,5 | 311 | Apache 2.0 |
| TinyBrainBot v4 `5m` | 5,12M | 11B | 35,4 | 584 | Apache 2.0 |
| TinyBrainBot v4 `2m` | 1,97M | 11B | 33,4 | 1451 | Apache 2.0 |
| TinyBrainBot v4 `500k` | 0,48M | 11B | 31,0 | 4894 | Apache 2.0 |
| Pythia-70M | 18,9M | 300B | 35,9 | 129 | Apache 2.0 |
| Pythia-31M | 4,7M | 300B | 33,7 | 270 | Apache 2.0 |

Conclusiones de la comparacion segun la model card: la serie TinyBrainBot v4 necesita aproximadamente la mitad de parametros para igualar la media de las 13 tareas de Pythia, pero Pythia domina claramente en prediccion narrativa de largo alcance (LAMBADA) y en WinoGrande. Esto sugiere que la mezcla amplia y factologica de 11B tokens del proyecto compra rendimiento en tareas factuales y cientificas, mientras que los 300B tokens de The Pile de Pythia compran modelado de lenguaje de rango largo.

## Limitaciones y advertencias

- Modelo puramente de preentrenamiento: no ha pasado por SFT, RLHF ni DPO. No sigue instrucciones, no mantiene conversaciones y no responde a plantillas de chat.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso estructurado.
- Solo ingles. No hay capacidades multilingues, y se desconoce su comportamiento en castellano.
- Riesgo elevado de alucinacion: con 30M de parametros y 11B tokens, el modelo no tiene capacidad factual fiable. Los resultados en MMLU (23,7) y CommonsenseQA (20,3) estan cerca del azar.
- Razonamiento aritmetico y de sentido comun practicamente inexistente: MathQA 21,9 y CommonsenseQA 20,3 en la variante mayor, valores cercanos al nivel de azar.
- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o alineacion. El modelo se entreno sobre web sin filtrar mas alla de los criterios de los datasets de origen (FineWeb-Edu, DCLM), por lo que puede reproducir sesgos presentes en esos corpus.
- Limitacion especifica en BoolQ: el modelo de 500K puntua 37,2, por debajo del azar, con un sesgo claro hacia la respuesta "no".
- Degradacion muy rapida de la coherencia con el tamano: la perplejidad LAMBADA pasa de 125 a 4.894 entre el modelo de 25M y el de 500K. Las variantes pequenas no son utilizables para generacion de texto de calidad.
- Longitud de contexto no documentada en la model card, lo que impide planificar despliegues que dependan de ventanas largas.
- La model card publicada esta truncada: la descripcion de la etapa 3 de entrenamiento queda cortada, por lo que no se conoce el detalle completo del schedule de anneal.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones, pero la calidad del modelo hace inviable su uso en produccion para cualquier tarea orientada a usuario final.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-v4-scaling-500k-25m
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset MegaMath-Web-Pro-Max: https://huggingface.co/datasets/OctoThinker/MegaMath-Web-Pro-Max
- Dataset finepdfs-edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset the-stack-smol: https://huggingface.co/datasets/bigcode/the-stack-smol
- Dataset Project Gutenberg: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset BookCorpusOpen: https://huggingface.co/datasets/lucadiliello/bookcorpusopen
- Harness de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los unicos resultados obtenidos fueron paginas de tiendas de telefonia movil, sin relacion con el objeto de la ficha. No se han encontrado paper, blog tecnico, repositorio de codigo ni demo asociados al proyecto.
