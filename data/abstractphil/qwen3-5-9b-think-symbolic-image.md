# AbstractPhil/qwen3.5-9b-think-symbolic-image

## Resumen

Lucia v1 es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3.5-9B, desarrollado por AbstractPhil, que transforma la salida del modelo base en una secuencia estructurada de razonamiento visual simbólico. En lugar de generar una simple descripcion de imagen, el adaptador produce una cadena de pensamientos en lenguaje natural organizada por pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de formulaciones concretas (caption, prompt, tags, critica) y de preguntas que un observador cuidadoso aun se plantearia, cada una etiquetada como `[record]`, `[chain]` o `[unknown]`.

El modelo resuelve el problema de la captioning generica: en lugar de una unica frase plana, entrega una traza interpretable y verificable del proceso de observacion, lo que facilita la auditoria, el filtrado por confianza y la reutilizacion de los distintos campos generados en pipelines de datos. La version Lucia v1 anade 17.385 filas de entrenamiento especificas de imagenes de museo con medio catalogado, de modo que el modelo distingue correctamente entre pintura, grabado, dibujo, fotografia y objeto.

Es relevante ahora porque combina tres tendencias actuales: adaptadores PEFT de bajo coste sobre modelos base potentes, razonamiento explicito tipo chain-of-thought aplicado a vision, y generacion de metadatos estructurados para catalogacion cultural. El repositorio ocupa 0,7 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con adaptador LoRA (PEFT); incluye atencion lineal con kernels flash-linear-attention, causal-conv1d y triton |
| Parametros totales | 9B en el modelo base; el adaptador LoRA se distribuye como pesos PEFT separados (tamano de repo 0,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el adaptador puede combinarse con el base cuantizado, pero no se documentan recetas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); el procesador se incluye en el repositorio |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer multimodal que acepta imagen y texto y que en este caso se carga mediante `AutoModelForMultimodalLM`. El adaptador LoRA se carga con `PeftModel` y puede fusionarse con `merge_and_unload()` para obtener un modelo plano. La inferencia recomendada usa `transformers` 5 y `peft` 0.18 o superior, con decodificacion greedy, thinking desactivado y sin system prompt (el autor indica que un turno de sistema no visto en entrenamiento provoca sobreescritura del formato aprendido).

El entrenamiento se realizo sobre dos datasets del propio autor: `AbstractPhil/thought-symbolic-image-captions` y `AbstractPhil/qwen-symbolic-thinking-image-training`. La version Lucia v1 incorpora 17.385 filas adicionales de imagenes de museo con medio catalogado, lo que permite al modelo nombrar correctamente el soporte (pintura, grabado, dibujo, fotografia, objeto). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si hubo RLHF o DPO. La innovacion tecnica principal es el formato de salida: una cadena de pasos nombrados con preguntas etiquetadas por procedencia de la respuesta, lo que convierte la generacion en una traza auditable.

## Capacidades

- Generacion de cadenas de razonamiento visual estructuradas por pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say).
- Produccion de multiples formulaciones a partir de una imagen: caption, prompt, tags y critica por profundidad.
- Generacion de preguntas de seguimiento con respuesta y justificacion, etiquetadas como `[record]`, `[chain]` o `[unknown]`.
- Clasificacion del medio de la imagen: pintura, grabado, dibujo, fotografia y objeto.
- Adaptacion de la profundidad del razonamiento: vista rapida (1-2 pensamientos), vista cercana (3-5), vista larga (6-10).
- Generacion de filas completas a partir de una especificacion textual, no solo de una imagen.
- Procesamiento por lotes con `padding_side = "left"`.
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Catalogacion de colecciones museisticas: el modelo genera filas estructuradas con medio, tema, composicion y preguntas abiertas a partir de fotografias de obras, lo que permite pre-rellenar fichas de catalogo y marcar explicitamente los campos desconocidos con `[unknown]`.
- Enriquecimiento de metadatos para bancos de imagenes: la salida incluye caption, prompt y tags en una sola pasada, reutilizables directamente como metadatos de busqueda y como prompts para generacion de imagenes.
- Generacion de datos sinteticos de razonamiento visual: las trazas de pasos nombrados sirven como datos de entrenamiento para otros modelos de vision-lenguaje que necesiten aprender a razonar de forma explicita y verificable.
- Auditoria de descripciones automaticas: al separar hechos del cuadro (`[record]`), inferencias (`[chain]`) y desconocidos (`[unknown]`), el modelo permite filtrar y revisar solo las afirmaciones no respaldadas por la imagen.
- Investigacion en interpretabilidad: la cadena de pensamientos nombrados facilita analizar en que punto el modelo comete errores de percepcion o de inferencia, algo imposible con una caption plana.
- Descripcion accesible de imagenes: la salida por capas (composicion, color, estado de animo) puede adaptarse a lectores de pantalla o a fichas de accesibilidad con distintos niveles de detalle segun la profundidad solicitada.
- Analisis de documentos graficos y material de archivo: la distincion fina entre dibujo, grabado y pintura es util en archivos y bibliotecas que necesitan clasificar material visual heterogeneo.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor comparan Lucia v1 con la version original (legacy) sobre conjuntos no vistos durante el entrenamiento.

| Metrica | Lucia v1 | Original (legacy) |
|---|---|---|
| Forma de fila, imagenes / especificaciones | 1,00 / 1,00 | 1,00 / 1,00 |
| Said / backed, filas completas | 0,19 / 0,30 | 0,21 / 0,31 |
| Definiciones, imagenes / especificaciones | 0,02 / 0,08 | 0,02 / 0,10 |
| 500 imagenes no vistas, medio nombrado correctamente de 100: pintura / grabado / dibujo / fotografia / objeto | 83 / 76 / 86 / 80 / 90 | 80 / 4 / 20 / 76 / 67 |
| 200 imagenes de museo: pintura / grabado / dibujo / fotografia / objeto | 13 de 27 / 38 de 39 / 12 de 13 / 11 de 13 / 66 de 66 | 11 de 27 / 7 de 38 / 1 de 13 / 12 de 13 / 58 de 63 |

El autor matiza que la fila de pintura de museo subestima el rendimiento: de las 14 pinturas de catalogo no nombradas como tales, 7 son acuarelas o gouaches sobre papel que el modelo etiqueta como dibujos (coincidiendo con el catalogo de la National Gallery), 2 son pinturas sobre seda etiquetadas como fotografias y 5 son objetos o grabados mal etiquetados por el criterio de comparacion. Todo oleo sobre lienzo o tabla se nombra como pintura. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 9B en bfloat16 se requieren aproximadamente 18-20 GB solo para pesos, mas el coste de activaciones y del procesador de vision.
- GPU recomendadas: A100, H100 o GPUs con 24 GB o mas para bfloat16 sin cuantizar; el adaptador LoRA anade una huella minima (0,7 GB en disco).
- Cabe en GPU de consumo: previsiblemente en RTX 3090, RTX 4090 y RTX 5090 con 24 GB o mas en bfloat16, o en GPUs de 16 GB con cuantizacion del modelo base (no se documenta receta oficial).
- Opciones de despliegue: `transformers` 5 + `peft` 0.18 o superior segun el ejemplo oficial; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion: los kernels flash-linear-attention, causal-conv1d y triton hacen el 9B "varias veces mas rapido"; sin ellos, transformers usa la implementacion de referencia.
- Latencia y throughput: no disponibles; el ejemplo oficial fija `max_new_tokens=400` con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucia v1 (este modelo) | 9B (base) + LoRA | no disponible | Razonamiento visual simbolico estructurado | apache-2.0 | HuggingFace, 39 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Vision-lenguaje general | no disponible en la informacion | HuggingFace |
| Modelos de captioning generico de escala similar | no disponible | no disponible | Caption plano sin traza de razonamiento | variable | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico contraste publicado es contra la version original del propio adaptador.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El formato de salida es rigido: requiere el prompt exacto del autor, sin system prompt y con thinking desactivado; desviarse del formato provoca sobreescritura o salidas mal formadas.
- Las metricas "said / backed" (0,19 / 0,30) y "definitions" (0,02 / 0,08) son bajas, lo que indica que muchas afirmaciones no quedan respaldadas por la imagen o por definiciones explicitas; riesgo de alucinacion en los campos de interpretacion (mood, mean, intend, story).
- La clasificacion de medio mejora mucho respecto a la version original, pero sigue confundiendo categorias en casos limite (acuarelas, pinturas sobre seda, objetos mal etiquetados en el conjunto de evaluacion).
- Depende de kernels opcionales para rendimiento; sin ellos la inferencia es notablemente mas lenta.
- Es un adaptador, no un modelo autonomo: requiere descargar y ejecutar el modelo base Qwen/Qwen3.5-9B, con los requisitos de hardware y las condiciones de licencia de este.
- No se documentan sesgos especificos, pero al entrenarse sobre catalogos de museos occidentales (National Gallery of Art, AIC, NGA, Cleveland, Met) puede heredar sesgos de representacion de esas colecciones.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning mas alla de la cadena de pensamiento textual.
- Uso comercial permitido por Apache 2.0, sujeto a las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio del paquete de prompts y parseo: https://github.com/AbstractEyes/qwen-symbolic-thinking
