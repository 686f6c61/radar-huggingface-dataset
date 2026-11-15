# iapp/OpenThai-SystemOne-NVFP4A16

## Resumen

OpenThai-SystemOne-NVFP4A16 es la version cuantizada en NVFP4 (pesos en FP4, activaciones en 16 bits) de OpenThai-SystemOne v0.3, un modelo de decision de tipo "System One" desarrollado por iApp y lanzado junto con AIEAT dentro de la familia OpenThai (anteriormente OpenThaiGPT). A diferencia de un modelo generativo, su proposito es responder en un unico forward pass a preguntas tipadas sobre un estado de texto o JSON: eleccion entre hasta 255 opciones (`choice`), puntuacion ordinal (`score`) y si/no (`noul`), devolviendo probabilidades calibradas sin generar texto.

Arquitectura y tamano: se construye sobre una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandes, a la que se anade una cabeza de decision de 256 slots. El checkpoint declara 752.674.883 parametros totales y un repositorio de 0,8 GB (790 MB frente a los 1.509 MB del original en bf16). La cuantizacion afecta solo a las capas Linear de la torre; los embeddings de tokens, la cabeza de decision y las temperaturas por tipo de tarea permanecen en bf16.

Relevancia: ofrece una alternativa compacta y de licencia Apache-2.0 para tareas de clasificacion y decision estructurada en tailandes e ingles, con una perdida de precision muy contenida respecto al modelo original (macro de 73,6 frente a 74,3 en el banco publico de 13 subconjuntos y 79,8 frente a 80,1 en los conjuntos tailandeses). Es util cuando se necesita un modelo pequeno, determinista en formato de salida y desplegable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) con cabeza de decision de 256 slots; cuantizacion weight-only NVFP4 sobre capas Linear |
| Parametros totales | 752.674.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 weight-only (pesos FP4, activaciones de 16 bits); checkpoint compressed-tensors generado con llm-compressor; 8-bit declarado en tags |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un encoder de decision, no un generador: una torre transformer Qwen3.5-0.8B con preentrenamiento continuado en tailandes produce un estado oculto que alimenta una cabeza de decision de 256 slots. La cabeza responde a tres tipos de pregunta: `choice` (seleccion entre hasta 255 opciones), `score` (nivel ordinal) y `noul` (si/no), con probabilidades calibradas mediante temperaturas especificas por tipo. Este repositorio es la cuantizacion de la version v0.3 (commit `f3709948`).

El proceso de cuantizacion, realizado con llm-compressor y el formato compressed-tensors, convierte unicamente los pesos de las capas Linear a FP4, manteniendo en bf16 los embeddings, la cabeza de decision y las temperaturas. Al cargarse con transformers, los pesos se descomprimen a bf16 en tiempo de carga, por lo que la velocidad es equivalente a la del modelo bf16 pero con una descarga menor. El uso de kernels nativos FP4 requiere NVIDIA Blackwell. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Clasificacion y decision estructurada sobre texto o JSON mediante preguntas tipadas: `choice` (hasta 255 opciones), `score` (ordinal) y `noul` (si/no).
- Salida de probabilidades calibradas por opcion, sin generacion de texto libre.
- Analisis de sentimiento, relevancia, consistencia, implicacion logica, respuesta a preguntas y deteccion de toxicidad, segun los subconjuntos evaluados.
- Capacidades multilingues limitadas a tailandes e ingles.
- Soporte de tool calling evaluado de forma indirecta a traves del conjunto xlam_tools (99,4 de precision en `choice`).
- No soporta generacion de texto, razonamiento multi-paso ni modo thinking: es un modelo de un unico forward pass.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Moderacion de contenido en tailandes: clasificacion de comentarios como toxicos o no toxicos (`noul`) con probabilidades calibradas; el rendimiento en civil_comments (76,0) y aegis2 (82,8) lo hace adecuado como primera linea de filtrado.
- Analisis de sentimiento en resenas de producto o restaurantes: uso del tipo `choice` con opciones positivo/negativo/neutro; el modelo obtiene 49,6 en wisesight y 64,9 en wongnai (`score`), por lo que conviene combinarlo con revision humana en dominios ruidosos.
- Enrutamiento de intenciones en asistentes conversacionales: clasificacion de la consulta del usuario en un conjunto cerrado de intents (massive_th, 89,5), lo que permite dirigir la peticion al servicio adecuado sin coste de generacion.
- Deteccion de implicacion logica y parafrasis para validacion de respuestas: multinli (86,6) y paws (92,4) permiten verificar si una respuesta se sigue de una premisa o si dos frases son equivalentes.
- Clasificacion de consultas bancarias: banking77 en tailandes (59,0) sirve como base para triaje de tickets, aunque su precision moderada aconseja umbrales de confianza y escalado a humano.
- Seleccion de herramientas en pipelines de agentes: xlam_tools (99,4) permite decidir que funcion invocar a partir del estado de la conversacion, con la ventaja de una latencia de un solo forward pass.
- Evaluacion de resumenes: summeval-consistency (78,5) y summeval-relevance (25,0) permiten puntuar la calidad de resumenes generados por otros modelos; la baja puntuacion en relevancia limita su uso a senales auxiliares.

## Benchmarks y rendimiento

Precision con un unico orden de opciones sobre los primeros 800 registros de cada conjunto, comparando el original bf16 con esta cuantizacion:

| Subconjunto | bf16 original | NVFP4A16 | Delta |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 82,8 | -0,4 |
| boolq (noul) | 79,7 | 78,3 | -1,3 |
| civil_comments (noul) | 79,0 | 76,0 | -3,0 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 86,3 | -2,0 |
| massive-en-US (choice) | 88,3 | 88,6 | +0,3 |
| multinli (choice) | 89,0 | 86,6 | -2,3 |
| paws (noul) | 94,0 | 92,4 | -1,6 |
| pubmedqa (choice) | 64,0 | 62,0 | -2,0 |
| squad2 (noul) | 89,3 | 87,0 | -2,3 |
| summeval-consistency (score) | 75,0 | 78,5 | +3,5 |
| summeval-relevance (score) | 21,7 | 25,0 | +3,3 |
| vitaminc-dev (choice) | 72,5 | 71,6 | -0,8 |
| **Macro, banco publico (13 subconjuntos)** | **74,3** | **73,6** | **-0,7** |
| banking77 (choice) | 59,1 | 59,0 | -0,1 |
| contrastive_th (choice) | 80,7 | 79,1 | -1,7 |
| contrastive_th (noul) | 83,5 | 81,9 | -1,6 |
| contrastive_th (score) | 78,6 | 80,4 | +1,8 |
| massive_th (choice) | 90,6 | 89,5 | -1,1 |
| prachathai (choice) | 98,3 | 98,3 | +0,0 |
| prachathai (noul) | 93,4 | 93,7 | +0,3 |
| sib200_th (choice) | 77,9 | 77,9 | +0,0 |
| wisesight (choice) | 48,9 | 49,6 | +0,8 |
| wongnai (score) | 64,5 | 64,9 | +0,4 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 77,6 | -2,1 |
| xnli_th (noul) | 86,8 | 86,4 | -0,4 |
| **Macro, conjuntos tailandeses** | **80,1** | **79,8** | **-0,3** |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 790 MB; al cargarse con transformers los pesos se descomprimen a bf16, por lo que el consumo en memoria se aproxima al del modelo bf16 original (unos 1,5 GB de pesos mas overhead de activaciones y runtime).
- Cabe en cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) en el modo de descompresion a bf16.
- Para aprovechar los kernels nativos FP4 se requiere hardware NVIDIA Blackwell; en GPUs anteriores se usa la ruta de descompresion.
- Despliegue: transformers con `trust_remote_code=True` y la libreria `compressed-tensors`, o el paquete `openthai_systemone` (`SystemOneClient`). vLLM no sirve este modelo de forma nativa porque la cabeza de decision es personalizada.
- Latencia y throughput: no disponibles; al tratarse de un unico forward pass sin generacion, la latencia esperada es la de un modelo de 0,8B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-NVFP4A16 | 752,7 M | no disponible | Decision / clasificacion (choice, score, noul) | Apache-2.0 | Hugging Face, transformers con `trust_remote_code` |
| OpenThai-SystemOne (bf16) | no disponible | no disponible | Decision / clasificacion | Apache-2.0 | Hugging Face |
| Modelos generativos de ~0,8B (p. ej. Qwen3.5-0.8B) | ~0,8 B | no disponible | Generacion de texto | no disponible | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La diferencia principal frente a un modelo generativo del mismo tamano es el formato de salida: SystemOne devuelve probabilidades calibradas sobre opciones cerradas en un solo paso, mientras que un modelo generativo requeriria prompting y parseo de la respuesta.

## Limitaciones y advertencias

- Solo cubre tailandes e ingles; el rendimiento en otros idiomas no esta evaluado.
- La precision en algunos dominios es baja: wisesight (49,6), banking77 (59,0), helpsteer2 (41,6) y summeval-relevance (25,0), lo que desaconseja su uso autonomo sin umbrales de confianza o revision humana.
- La cuantizacion introduce perdidas de hasta 3,0 puntos en subconjuntos concretos (civil_comments), aunque la media se mantiene cercana al original.
- No genera texto: no sirve para tareas de resumen, traduccion o conversacion abierta.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros antes de desplegar en produccion.
- vLLM no soporta la cabeza de decision de forma nativa, lo que limita las opciones de servido de alto rendimiento.
- Los kernels nativos FP4 requieren NVIDIA Blackwell; en otro hardware se pierde la ventaja de velocidad y solo se reduce el tamano de descarga.
- Riesgo de alucinacion estructural: al asignar probabilidades a opciones cerradas, una calibracion deficiente puede producir respuestas seguras pero incorrectas; se recomienda validar las temperaturas por tipo de tarea.
- No se dispone de informacion sobre sesgos demograficos o culturales especificos ni sobre el proceso de alineacion del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/iapp/OpenThai-SystemOne-NVFP4A16
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
