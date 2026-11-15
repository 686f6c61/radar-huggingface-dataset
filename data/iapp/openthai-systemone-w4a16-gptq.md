# iapp/OpenThai-SystemOne-W4A16-GPTQ

## Resumen

OpenThai-SystemOne-W4A16-GPTQ es la version cuantizada a INT4 del modelo de decision OpenThai-SystemOne, desarrollado por iApp con el lanzamiento de AIEAT dentro del ecosistema OpenThai (antes OpenThaiGPT). No se trata de un modelo generativo: es un "System One decision model" que responde en un unico pase forward a preguntas tipadas sobre un estado de texto o JSON, devolviendo probabilidades calibradas en lugar de texto libre. Resuelve el problema de clasificar, puntuar o verificar de forma determinista y barata, sin generacion autoregresiva.

El modelo parte de una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandes, a la que se anade una cabeza de decision de 256 slots. Esta version concreta cuantiza las capas Linear de la torre a INT4 (weight-only, GPTQ, grupo 128), manteniendo en bf16 los embeddings, la cabeza de decision y las temperaturas por tipo. Su relevancia radica en que reduce el peso de 1.509 MB a 767 MB con una perdida de exactitud marginal (macro publica 74.3 a 73.7; macro tailandesa 80.1 a 79.7), lo que facilita el despliegue en entornos con recursos limitados.

La licencia Apache-2.0 y el soporte bilingue th/en lo hacen util para pipelines de clasificacion y enrutamiento en produccion, especialmente en contextos tailandeses donde los modelos generativos grandes resultan costosos o lentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) con cabeza de decision de 256 slots |
| Parametros totales | 752.674.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only, GPTQ, grupo 128 (Linear de la torre); embeddings, cabeza y temperaturas en bf16 |
| Idiomas soportados | th, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint compressed-tensors / llm-compressor) |

## Arquitectura y entrenamiento

La arquitectura combina una torre de texto basada en Qwen3.5-0.8B, sometida a preentrenamiento continuado en tailandes, con una cabeza de decision de 256 slots que transforma el estado oculto en probabilidades tipadas. El modelo no genera texto: emite respuestas estructuradas del tipo `choice` (seleccion entre hasta 255 opciones), `score` (puntuacion ordinal) o `noul` (si/no), con calibracion por tipo mediante temperaturas especificas que se conservan en bf16.

Esta version es una cuantizacion de v0.3 (commit `f3709948`) realizada con compressed-tensors (llm-compressor). La cuantizacion afecta unicamente las capas Linear de la torre, de modo que solo perturba el estado oculto que lee la cabeza. Los detalles de datos de entrenamiento, numero de tokens y uso de RLHF/DPO no estan disponibles en la informacion proporcionada; la model card remite al modelo base iapp/OpenThai-SystemOne para la documentacion completa de datos y entrenamiento.

## Capacidades

- Decision tipada en un unico pase forward: responde a preguntas `choice` (hasta 255 opciones), `score` (ordinal) y `noul` (si/no) sobre texto o JSON.
- Probabilidades calibradas por tipo, con temperaturas especificas mantenidas en bf16.
- Clasificacion de sentimiento, coherencia, relevancia, implicacion (NLI), respuesta a preguntas y verificacion de afirmaciones.
- Extraccion de caracteristicas (tag `feature-extraction`) y clasificacion de texto (pipeline `text-classification`).
- Soporte bilingue tailandes e ingles.
- Capacidad de evaluacion de herramientas y seleccion de opciones (segun los subsets xlam_tools y massive).
- No genera texto libre, no soporta tool calling generativo ni razonamiento multi-step autoregresivo.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar mensajes de clientes en categorias predefinidas mediante preguntas `choice`, aprovechando la precision en tailandes (massive_th choice 90.5) para derivar cada caso al equipo adecuado.
- Moderacion de comentarios: usar consultas `noul` sobre civil_comments (80.3) para detectar contenido toxico o inapropiado antes de publicacion.
- Analisis de sentimiento de resenas: puntuar opiniones de productos o restaurantes con preguntas `score` (wongnai score 65.0) para agregar valoraciones de forma determinista.
- Verificacion de coherencia de resumenes: evaluar consistencia y relevancia de resumenes generados con `score` (summeval-consistency 75.0), como filtro de calidad en pipelines de summarization.
- Deteccion de implicacion textual: clasificar pares de frases como implicacion, contradiccion o neutralidad con `choice` (multinli 87.6, xnli_th 78.4) para tareas de QA y validacion.
- Seleccion de herramientas en agentes: elegir la herramienta o accion correcta entre opciones con `choice` (xlam_tools 99.4), sirviendo como enrutador barato previo a un LLM generativo.
- Clasificacion de intenciones bancarias: identificar la intencion de consultas financieras con `choice` (banking77 58.0) en sistemas de atencion automatizada en tailandes.
- Filtrado de afirmaciones en QA biomedico: validar respuestas con `choice` sobre pubmedqa (65.6) en pipelines de revision documental.

## Benchmarks y rendimiento

Resultados de exactitud con orden unico de opciones sobre los primeros 800 registros de cada conjunto (`scripts/06_eval.py --limit 800`), comparando el original bf16 con esta cuantizacion:

| Subset | bf16 original | W4A16-GPTQ | Delta |
|---|---|---|---|
| aegis2 (noul) | 83.2 | 83.6 | +0.4 |
| boolq (noul) | 79.7 | 78.3 | -1.3 |
| civil_comments (noul) | 79.0 | 80.3 | +1.3 |
| helpsteer2 (score) | 41.6 | 41.2 | -0.4 |
| massive-de-DE (choice) | 88.3 | 88.6 | +0.3 |
| massive-en-US (choice) | 88.3 | 88.0 | -0.3 |
| multinli (choice) | 89.0 | 87.6 | -1.3 |
| paws (noul) | 94.0 | 92.0 | -2.0 |
| pubmedqa (choice) | 64.0 | 65.6 | +1.6 |
| squad2 (noul) | 89.3 | 85.3 | -4.0 |
| summeval-consistency (score) | 75.0 | 75.0 | +0.0 |
| summeval-relevance (score) | 21.7 | 22.1 | +0.4 |
| vitaminc-dev (choice) | 72.5 | 70.8 | -1.7 |
| **Macro publica (13 subsets)** | **74.3** | **73.7** | **-0.5** |
| banking77 (choice) | 59.1 | 58.0 | -1.1 |
| contrastive_th (choice) | 80.7 | 80.7 | +0.0 |
| contrastive_th (noul) | 83.5 | 82.7 | -0.8 |
| contrastive_th (score) | 78.6 | 76.8 | -1.8 |
| massive_th (choice) | 90.6 | 90.5 | -0.1 |
| prachathai (choice) | 98.3 | 98.5 | +0.2 |
| prachathai (noul) | 93.4 | 93.4 | +0.0 |
| sib200_th (choice) | 77.9 | 79.4 | +1.5 |
| wisesight (choice) | 48.9 | 46.8 | -2.1 |
| wongnai (score) | 64.5 | 65.0 | +0.5 |
| xlam_tools (choice) | 99.4 | 99.4 | +0.0 |
| xnli_th (choice) | 79.8 | 78.4 | -1.4 |
| xnli_th (noul) | 86.8 | 87.1 | +0.4 |
| **Macro tailandesa** | **80.1** | **79.7** | **-0.4** |

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse mediante transformers, los pesos se descomprimen a bf16 en memoria, por lo que la VRAM efectiva ronda los ~1,5 GB de pesos mas overhead de activaciones; el beneficio principal es la descarga de 767 MB frente a 1.509 MB.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM efectiva para bf16 tras la descompresion; tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090 son suficientes.
- Cabe en GPU consumer: si, incluso en GPUs de gama baja, dado el tamano del modelo (~0,75B parametros).
- Opciones de despliegue: transformers con `trust_remote_code=True` (ficheros de codigo remoto incluidos en el repo) o el paquete `openthai_systemone` (`SystemOneClient`). vLLM no sirve el modelo out-of-the-box porque la cabeza de decision es personalizada; los kernels nativos FP8/INT8/FP4 requieren un runtime que soporte esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que, cargado via transformers, la velocidad es equivalente a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-W4A16-GPTQ | 752.674.883 | no disponible | Decision tipada (choice/score/noul), th+en | apache-2.0 | Hugging Face |
| OpenThai-SystemOne (bf16) | no disponible | no disponible | Decision tipada (choice/score/noul), th+en | apache-2.0 | Hugging Face |
| Modelos de clasificacion genericos comparables | no disponible | no disponible | Clasificacion de texto | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de la misma categoria para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling generativo ni razonamiento multi-step autoregresivo; solo responde a preguntas tipadas.
- La cuantizacion introduce perdidas notables en algunos subsets: squad2 cae 4.0 puntos, wisesight 2.1, paws 2.0, contrastive_th score 1.8 y vitaminc-dev 1.7.
- Rendimiento bajo en algunos subsets incluso en el original: summeval-relevance 22.1, helpsteer2 41.2, wisesight 46.8 y banking77 58.0, lo que limita su uso directo en esas tareas.
- Los resultados se reportan con orden unico de opciones y sobre los primeros 800 registros de cada conjunto; no reflejan robustez ante variaciones de orden o prompts.
- vLLM no sirve el modelo out-of-the-box por la cabeza de decision personalizada; requiere transformers con codigo remoto o el cliente propio.
- Al cargarse via transformers los pesos se descomprimen a bf16, por lo que el ahorro es de descarga/almacenamiento, no de velocidad ni de VRAM efectiva.
- Soporte limitado a tailandes e ingles; no disponible informacion sobre sesgos especificos ni sobre el contexto maximo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y de los datasets de evaluacion utilizados.

## Enlaces

- Modelo cuantizado: https://huggingface.co/iapp/OpenThai-SystemOne-W4A16-GPTQ
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del cliente: https://github.com/iapp-technology/openthai-systemone
