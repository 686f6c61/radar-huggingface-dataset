# AbstractPhil/gemma-4-12b-think-symbolic-image

## Resumen

Gemma 4 12B: gemma-4-12B-it, think symbolic image es un adaptador LoRA publicado por AbstractPhil sobre el modelo multimodal google/gemma-4-12B-it. Su proposito es especializar al modelo base en una tarea muy concreta: la descripcion estructurada de imagenes de arte (dibujos, grabados, pinturas, fotografias y objetos de museo) mediante una cadena de pensamiento simbolica escrita en lenguaje natural, con un paso nombrado por linea y un formato de salida fijo.

El adaptador no es un fine-tune completo: la linea Gemma 4 se distribuye unicamente como adaptadores. El autor lo entrena sobre dos datasets propios, thought-symbolic-image-captions y qwen-symbolic-thinking-image-training, y lo evalua contra otras variantes de la misma familia (Gemma 4 E4B) y contra Lucia v1, un modelo de clase similar basado en Qwen3.5 9B.

La relevancia de esta ficha es acotada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, orientado a un nicho (catalogacion y analisis de imagenes artisticas) y con un formato de salida muy prescrito. No es un modelo de proposito general ni compite en benchmarks estandar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal (vision-language) google/gemma-4-12B-it |
| Parametros totales | 12 mil millones (modelo base); el adaptador LoRA ocupa 0,6 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre google/gemma-4-12B-it, un transformer multimodal de 12 mil millones de parametros que procesa imagen y texto mediante un procesador propio (AutoProcessor y AutoModelForMultimodalLM en transformers 5.10 o superior). El adaptador se carga con peft 0.18 o superior y se fusiona en el modelo base con merge_and_unload(). El repositorio incluye tambien el processor del adaptador, conservando los ficheros del processor base.

El entrenamiento se realiza sobre dos datasets del autor: thought-symbolic-image-captions y qwen-symbolic-thinking-image-training. El formato aprendido es una "fila" de pensamiento simbolico compuesta por pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de textos derivados (caption, prompt, tags, critica por profundidad) y de preguntas con su respuesta y su origen: [record] si es un hecho de la imagen, [chain] si lo deduce la cadena y [unknown] si no puede determinarse. El autor indica que todas las tallas de la familia se entrenan con las mismas filas y la misma receta, y que este tamano "define poco en las filas largas de especificacion" y mantiene la vision a un cuarto de la tasa de aprendizaje de la receta. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de cadenas de pensamiento escritas y estructuradas sobre imagenes, con un paso nombrado por linea segun el vocabulario fijo de 16 pasos.
- Descripcion de imagenes de arte en multiples formatos derivados: caption, prompt, etiquetas y critica por profundidad.
- Control de profundidad del razonamiento mediante palabras clave en el prompt: "a quick look" (1-2 pensamientos), "a closer look" (3-5) y "a long look" (6-10).
- Formulacion de preguntas residuales sobre la imagen, clasificando cada respuesta como hecho registrado, deduccion de la cadena o desconocido.
- Clasificacion del tipo de imagen en el primer termino de la linea de prompt: painting, print, drawing, photograph u object.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), con el modo thinking desactivado por defecto en la plantilla de chat.
- Soporte de conversacion multi-turno segun el pipeline declarado (conversational).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Catalogacion de fondos museisticos: el adaptador genera fichas descriptivas estructuradas (tipo de obra, medio, composicion, color, estado de animo) a partir de una fotografia de la pieza, con un formato estable que puede volcarse directamente a una base de datos documental.
- Generacion de metadatos para bancos de imagenes y archivos digitales: produce caption, prompt y etiquetas en una sola pasada, lo que reduce el trabajo manual de indexacion y mejora la busqueda semantica sobre colecciones.
- Creacion de prompts para modelos generativos a partir de obras existentes: la linea "prompt" del formato de salida sintetiza los rasgos visuales (tecnica, vista, soporte, fondo) en una cadena reutilizable como entrada de un modelo texto-a-imagen.
- Analisis critico asistido en educacion artistica: la linea de critica y las preguntas residuales permiten construir ejercicios de observacion guiada, distinguiendo lo que se ve de lo que se deduce y de lo que se desconoce.
- Enriquecimiento de catalogos de subastas y galerias: clasificacion del tipo de pieza (pintura, grabado, dibujo, fotografia, objeto) y descripcion del medio, util para triaje previo a la revision de un especialista.
- Documentacion de colecciones fotograficas: el modelo nombra correctamente fotografias en una proporcion alta de la muestra evaluada (81 de 100 en el conjunto de 500 imagenes retenidas), lo que lo hace util para primeras pasadas de descripcion de archivos fotograficos.
- Prototipado de asistentes de sala o audioguias: la salida estructurada por pasos facilita convertir la descripcion en un guion breve para visitantes, aunque requiere revision humana por la tasa de acierto limitada en las lineas de definicion.

## Benchmarks y rendimiento

El autor publica lecturas propias sobre 60 imagenes y 40 especificaciones no vistas en entrenamiento, mas dos conjuntos externos: 500 imagenes del National Gallery of Art y 200 imagenes de AIC, NGA, Cleveland y el Met. Se comparan con Gemma 4 E4B y Lucia v1 (Qwen3.5 9B). No hay benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Lectura | Gemma 4 12B | Gemma 4 E4B | Lucia v1 (9B) |
|---|---|---|---|
| Forma de fila, imagenes / especificaciones | 1,00 / 1,00 | 1,00 / 1,00 | 1,00 / 1,00 |
| Said / backed, filas completas | 0,18 / 0,27 | 0,17 / 0,28 | 0,19 / 0,30 |
| Definiciones, imagenes / especificaciones | 0,02 / 0,12 | 0,00 / 0,28 | 0,02 / 0,08 |
| 500 imagenes retenidas: pintura / grabado / dibujo / fotografia / objeto acertados de 100 | 83 / 74 / 80 / 81 / 91 | 83 / 71 / 80 / 82 / 90 | 83 / 76 / 86 / 80 / 90 |
| 200 imagenes de museo: pintura / grabado / dibujo / fotografia / objeto | 13 de 27 / 36 de 39 / 12 de 13 / 11 de 13 / 66 de 66 | 13 de 27 / 36 de 3 (dato truncado en la model card) | no disponible |

## Requisitos de hardware

- El adaptador pesa 0,6 GB, pero requiere cargar el modelo base completo de 12 mil millones de parametros en bfloat16, lo que implica del orden de 24 GB de VRAM solo para pesos, mas el coste del procesador visual y la cache KV.
- GPU recomendadas: A100 40 GB o H100 para inferencia comoda y lotes; en consumer, RTX 4090 (24 GB) queda al limite para bfloat16 y exige cuantizacion o descarga por capas para margen suficiente.
- No cabe en GPUs consumer de 8-16 GB sin cuantizar el modelo base; el autor no documenta recetas de cuantizacion del adaptador.
- Despliegue: la ruta documentada es transformers 5.10 o superior con peft 0.18 o superior, fusionando el adaptador con merge_and_unload(). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. La generacion de referencia usa decodificacion greedy (do_sample=False) con max_new_tokens=800.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbstractPhil/gemma-4-12b-think-symbolic-image | 12B (base) + LoRA | no disponible | Descripcion simbolica de arte con cadena de pensamiento | apache-2.0 | Adaptador en Hugging Face, 0 descargas |
| Gemma 4 E4B (misma linea) | no disponible | no disponible | Misma tarea, menor talla | no disponible | Referenciado en la model card |
| Lucia v1 (Qwen3.5 9B) | 9B | no disponible | Misma clase de tarea | no disponible | Referenciado en la model card |

En las lecturas del autor, las tres opciones empatan en forma de fila (1,00) y presentan valores muy proximos en said/backed (0,17-0,19 y 0,27-0,30). Lucia v1 supera ligeramente en dibujo (86 frente a 80) y Gemma 4 12B en grabado (74 frente a 76 de Lucia, en realidad inferior) y en objetos (91 frente a 90). Las diferencias son pequenas y el autor no publica intervalos de confianza.

## Limitaciones y advertencias

- El adaptador solo declara soporte de ingles; no se documenta comportamiento en castellano ni en otros idiomas.
- La tasa de "said / backed" en filas completas es baja (0,18 / 0,27): el modelo afirma mas de lo que respalda con evidencia de la imagen en la mayoria de los casos.
- Las definiciones son practicamente inexistentes sobre imagenes (0,02) y muy bajas sobre especificaciones (0,12), lo que limita su uso para glosarios o explicaciones de conceptos.
- Riesgo de alucinacion en la identificacion de la identidad del sujeto y en detalles finos: el propio formato contempla la etiqueta [unknown], pero no garantiza que el modelo la use correctamente.
- El formato de salida es muy prescrito y esta aprendido; desviarse de las palabras de profundidad o anadir un system prompt puede degradar la estructura.
- Requiere versiones concretas de librerias (transformers 5.10+, peft 0.18+) y no hay fine-tune completo disponible para la linea Gemma 4.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa de la comunidad.
- La licencia del adaptador es apache-2.0, pero el uso comercial queda sujeto tambien a los terminos del modelo base google/gemma-4-12B-it, que deben revisarse por separado.
- Los datos de la model card estan parcialmente truncados (la fila de 200 imagenes de museo para Gemma 4 E4B y para Lucia v1 no esta completa).

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AbstractPhil/gemma-4-12b-think-symbolic-image
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio con parser, scorer y trainer: https://github.com/AbstractEyes/qwen-symbolic-thinking
