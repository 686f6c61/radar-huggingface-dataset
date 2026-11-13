# LeeCN/d3-lite-vision-g1

## Resumen

d3-lite-vision-g1 es un ajuste fino del modelo vllm-sr/d3-lite (revision 03560c26, 0,85B parametros) orientado a la toma de decisiones sobre imagenes. Lo publica el usuario LeeCN como derivado independiente: no es un lanzamiento oficial del equipo de vLLM Semantic Router y este no lo ha revisado. El modelo hereda de d3-lite un paradigma poco habitual: en lugar de generar texto, recibe un estado (texto o JSON, opcionalmente con imagenes y videos) y un conjunto de preguntas tipadas (`choice`, `noul` si/no, `score`), y devuelve una probabilidad para cada opcion en un unico forward pass.

La arquitectura subyacente es Qwen3.5-0.8B (transformer multimodal con encoder de vision, proyector y embeddings de token), sobre la que d3-lite anade una cabeza de lectura (readout) para clasificacion zero-shot. Este ajuste congela el encoder de vision, el proyector y los embeddings, y entrena solo las capas del modelo de lenguaje y el readout. El resultado es un modelo pequeno (852.985.920 parametros, repo de 1,7 GB) que cabe en GPUs de consumo y que prioriza latencia baja sobre generacion abierta.

Su relevancia actual esta en el nicho de "system-one" o decisiones rapidas: clasificacion, moderacion, verificacion de documentos y enrutamiento multimodal sin coste de decodificacion autoregresiva. El autor reporta mejoras notables sobre d3-lite en tareas como Mind2Web, KIE, InfographicVQA y CharXiv, aunque con la advertencia de que la seleccion del checkpoint miro el suite publico de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con encoder de vision, proyector y readout de clasificacion |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 en pesos y codigo, pero el autor restringe el uso a investigacion y evaluacion por las licencias de los datos de entrenamiento |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite, que a su vez se construye sobre Qwen/Qwen3.5-0.8B. Mantiene el encoder de vision, el proyector vision-lenguaje y los embeddings de token congelados, y ajusta completamente las capas del modelo de lenguaje y el readout. La interfaz es la de d3-lite: estado mas preguntas tipadas, con salida de probabilidades por opcion en un solo paso, sin generacion de texto.

El entrenamiento tiene dos etapas. La primera es textual: unas 245.000 filas de decision de los splits de entrenamiento de datasets publicos en los formatos del Decision Index, mas el set interno de imagenes; se entrenan dos semillas y se promedian uniformemente (model soup). La segunda es visual: partiendo del soup de la etapa 1, unas 15.500 preguntas de imagen de splits de entrenamiento de datasets publicos, convertidas a los layouts del suite publico de vision, con un replay de 10.000 filas de texto. Hiperparametros: learning rate 1e-5 (readout 1e-4), layer-wise decay 0,9, warmup del 5%, schedule coseno, una epoca, AdamW con weight decay 0,01. El checkpoint final es la interpolacion a mitad de camino hacia d3-lite (WiSE-FT, alpha 0,5). El autor verifico por SHA-256 que ninguna imagen de entrenamiento coincide con las del suite publico de evaluacion.

Datos de imagen de entrenamiento: ChartQA (4.000 filas, GPL-3.0), CORD v2 (2.000, CC BY 4.0), FUNSD (1.000, solo investigacion no comercial), Hateful Memes (2.500, solo investigacion), InfographicVQA (740, Apache-2.0 en el espejo), Multimodal-Mind2Web (737, OpenRAIL), COCO 2017 train para conteo y posicion (3.450) y un set interno de seguridad de unas 540 imagenes (1.084 filas, no distribuido).

## Capacidades

- Clasificacion zero-shot multimodal: devuelve probabilidades para opciones definidas por el usuario en un unico forward pass.
- Preguntas tipadas: `choice` (eleccion multiple con criterios), `noul` (si/no) y `score` (puntuacion).
- Entrada de estado en texto plano o JSON, con soporte opcional de imagenes (rutas locales, URLs http(s), objetos PIL o data URLs base64) y videos.
- Razonamiento sobre documentos: extraccion de campos en recibos y formularios (KIE), lectura de graficos e infografias.
- Comprension de interfaces y capturas de pantalla (Mind2Web), util para agentes de navegacion.
- Moderacion de contenido en memes e imagenes (Hateful Memes).
- Emparejamiento imagen-texto y tareas de caption matching (Winoground, BLINK).
- Conteo y localizacion de objetos a partir de cajas (COCO).
- No genera texto: no hay tool calling ni razonamiento multi-paso generativo; la "decision" es el producto.

## Casos de uso

- Moderacion de contenido visual: clasificar memes e imagenes como aceptables o no mediante preguntas `noul` o `choice`, con una sola pasada y baja latencia; adecuado por su entrenamiento especifico en Hateful Memes.
- Enrutamiento en pipelines RAG multimodales: dado un estado con imagenes, decidir que herramienta o indice consultar usando preguntas `choice`, sin coste de generacion.
- Extraccion de campos en documentos: leer recibos (CORD) y formularios escaneados (FUNSD) respondiendo preguntas de tipo KIE con probabilidades calibradas por opcion.
- Automatizacion de agentes de navegacion web: interpretar capturas de pantalla y decidir la siguiente accion (Mind2Web), integrándose en un bucle de agente que use las probabilidades como politica.
- Analisis de graficos e infografias: responder preguntas sobre ChartQA e InfographicVQA para resumenes automaticos de informes o dashboards.
- Verificacion de pedidos y reclamaciones: combinar texto del cliente con la imagen del recibo para responder preguntas como si el producto aparece listado o como se pago.
- Control de calidad en catalogos: emparejar imagenes con descripciones (Winoground) para detectar desalineaciones entre ficha y foto.

## Benchmarks y rendimiento

Resultados del autor en el suite publico de vision (Decision Index vision 0.3, ejecuciones locales propias, 12.210 filas, imagenes limitadas a 1,6 MP). No son resultados de leaderboard.

| Benchmark (accuracy, %) | d3-lite | d3-lite-vision-g1 |
| --- | ---: | ---: |
| CV-Bench | 79,0 | 79,7 |
| BLINK | 60,0 | 62,5 |
| RealWorldQA | 61,3 | 62,8 |
| CharXiv | 65,4 | 70,7 |
| InfographicVQA | 79,5 | 84,8 |
| Mind2Web | 58,5 | 74,4 |
| Winoground | 76,8 | 79,0 |
| KIE (CORD + FUNSD) | 85,6 | 90,3 |
| Moderation (Hateful Memes) | 56,8 | 64,4 |
| R-Bench-M | 25,1 | 25,7 |
| MMMU-Pro vision | 19,2 | 19,8 |
| Indice publico de vision | 47,37 | 54,62 |

El autor advierte que los numeros de Mind2Web provienen de una copia del suite con etiquetas de cajas en otra fuente, y que la version enviada al board usa el suite verificado. La mitad privada del board la ejecutan sus mantenedores y no la conocen. No se midieron puntuaciones del board de texto para esta version.

## Requisitos de hardware

- VRAM estimada: con 0,85B parametros, en fp16 rondaria 1,7-2 GB de pesos; en int8 unos 0,9 GB y en int4 unos 0,5 GB, mas overhead de activaciones y del encoder de vision (estimacion propia, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); A100/H100 sobredimensionadas para este tamano salvo por concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB o mas.
- Despliegue: el autor proporciona `d3_server.py` con endpoint POST `/v1/systemone`; carga via `transformers` con `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un unico forward pass sin decodificacion, la latencia deberia ser muy inferior a la de un modelo generativo del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite-vision-g1 | 0,85B | no disponible | Decision zero-shot multimodal | Apache-2.0 con restriccion a investigacion por datos | Hugging Face |
| vllm-sr/d3-lite | 0,85B | no disponible | Decision zero-shot multimodal (base) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | no disponible | LLM multimodal generativo | Apache-2.0 | Hugging Face |

La comparacion con alternativas generativas de proposito general no es directa: d3-lite-vision-g1 no genera texto y solo es comparable en tareas de clasificacion y decision. No se dispone de datos de benchmarks de terceros para establecer comparaciones homogeneas.

## Limitaciones y advertencias

- Las mayores ganancias se concentran en tipos de pregunta presentes en los datos de imagen (Mind2Web, Hateful Memes, KIE, CharXiv, InfographicVQA); preguntas multi-imagen y caption matching (BLINK, Winoground) mejoran menos.
- El peso de interpolacion se eligio mirando el suite publico de vision, por lo que los numeros publicos son algo optimistas.
- No medido para esta version: el Decision Index de texto, entradas de video y calibracion.
- Restriccion de licencia: aunque los pesos son Apache-2.0, los datos de entrenamiento incluyen Hateful Memes y FUNSD (solo investigacion no comercial) y ChartQA (GPL-3.0 en su card); el autor libera el modelo solo para investigacion y evaluacion, no para uso comercial.
- El set interno de imagenes de seguridad no se distribuye y no se proporcionara.
- Riesgo de sesgo heredado de Hateful Memes y de los datasets de documentos; no hay evaluacion de sesgos publicada.
- Al no generar texto, no sirve para tareas que requieran explicaciones o razonamiento abierto; la salida son probabilidades por opcion.
- No es un lanzamiento oficial de vLLM Semantic Router y el equipo no lo ha revisado; soporte limitado.
- Idiomas soportados no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeCN/d3-lite-vision-g1
- Modelo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base de d3-lite: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset Hateful Memes: https://huggingface.co/datasets/neuralcatcher/hateful_memes
- Dataset InfographicVQA (DocVQA): https://huggingface.co/datasets/lmms-lab/DocVQA
- Dataset Multimodal-Mind2Web: https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
- Dataset COCO: https://huggingface.co/datasets/detection-datasets/coco
