# AbstractPhil/gemma-4-e4b-think-symbolic-image

## Resumen

`AbstractPhil/gemma-4-e4b-think-symbolic-image` es un adaptador LoRA sobre `google/gemma-4-E4B-it`, el miembro de 4.000 millones de parametros efectivos de la familia Gemma 4 de Google. Lo desarrolla AbstractPhil y esta especializado en una tarea muy concreta: la descripcion simbolica y razonada de imagenes artisticas (pinturas, grabados, dibujos, fotografias y objetos de museo). El modelo no se limita a generar un caption, sino que produce una "cadena de pensamiento" estructurada por pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) y termina con un caption, un prompt, etiquetas, una critica por profundidad y una lista de preguntas con su respuesta y su justificacion.

El interes tecnico del adaptador reside en su formato de salida rigido y parseable: cada linea sigue un esquema fijo y las preguntas finales llevan una etiqueta `[record]`, `[chain]` o `[unknown]` que indica si la respuesta es un hecho de la imagen, una inferencia de la cadena o un dato desconocido. Esto lo hace adecuado para pipelines de catalogacion museistica y para investigacion sobre razonamiento visual explicito, no solo para generacion de texto libre.

Segun la model card, el adaptador se entrena con la misma receta y los mismos datos para todos los tamanos de la linea, y se posiciona como "el mirón mas rapido del grupo", aunque con menor profundidad que los miembros basados en Qwen. El repositorio es pequeno (0,3 GB) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Gemma 4 (vision-language) |
| Parametros totales | 4.000 millones efectivos (modelo base); adaptador LoRA de tamano no disponible |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Gemma 4) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-4-E4B-it`, un modelo vision-language de la familia Gemma 4 con 4.000 millones de parametros efectivos. El adaptador es un LoRA (PEFT) que se fusiona con el base mediante `merge_and_unload()`; no existe fine-tune completo para esta linea, segun la model card. La carga requiere `transformers` 5.10 o superior y `peft` 0.18 o superior.

El entrenamiento se realizo sobre dos datasets del propio autor: `AbstractPhil/thought-symbolic-image-captions` y `AbstractPhil/qwen-symbolic-thinking-image-training`. La receta es comun a todos los tamanos de la linea (mismos datos, mismo formato de fila), de modo que las diferencias entre modelos reflejan su capacidad de retencion, no el entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO. La innovacion principal es el formato de salida: una cadena de pensamiento con pasos nombrados, un vocabulario cerrado de 16 operaciones y etiquetas de procedencia (`[record]`, `[chain]`, `[unknown]`) que permiten verificar que afirmaciones son hechos de la imagen y cuales inferencias. El modo thinking se desactiva mediante el switch de la plantilla y la decodificacion recomendada es greedy, sin system prompt.

## Capacidades

- Generacion de descripciones de imagenes artisticas en formato estructurado por pasos (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say).
- Cadena de pensamiento explicita con profundidad controlable: "a quick look" (1-2 pensamientos), "a closer look" (3-5) y "a long look" (6-10).
- Generacion de caption, prompt de estilo, etiquetas y critica por profundidad en la misma respuesta.
- Formulacion de preguntas residuales con respuesta y justificacion etiquetada como hecho, inferencia o desconocido.
- Clasificacion del tipo de imagen (painting, print, drawing, photograph, object) mediante el primer termino de la linea de prompt.
- Comprension de imagenes de museo y patrimonio cultural (National Gallery of Art, Art Institute of Chicago, Cleveland, Metropolitan Museum).
- Capacidades conversacionales heredadas del base Gemma 4 E4B-it.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque la cadena de pensamiento es multi-paso por diseno.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Catalogacion museistica automatizada: el modelo genera filas estructuradas con tipo de obra, medio, color y estado de animo que pueden insertarse directamente en un CMS o base de datos de coleccion, gracias al formato fijo y parseable de cada linea.
- Generacion de metadatos para bancos de imagenes: produce caption, prompt de estilo y etiquetas en una sola pasada, lo que reduce el coste frente a invocar varios modelos especializados.
- Investigacion sobre razonamiento visual: las etiquetas `[record]`, `[chain]` y `[unknown]` permiten medir la calibracion del modelo y separar percepcion de inferencia, util para estudiar alucinacion en modelos multimodales.
- Asistencia a documentalistas y conservadores: el modelo propone preguntas residuales ("sitter identity -> unknown") que orientan la revision humana de fichas incompletas.
- Educacion artistica: la salida por pasos (forma, luz, color, estado de animo) sirve como andamiaje para ensenar analisis formal de obras a estudiantes.
- Preprocesado para busqueda multimodal: los prompts y etiquetas generados alimentan indices de recuperacion de imagenes por texto en colecciones digitales.
- Moderacion y triaje de grandes volumenes de imagenes patrimoniales: al ser el miembro mas rapido de la linea, es adecuado para una primera pasada sobre lotes grandes antes de derivar casos dificiles a modelos mayores.

## Benchmarks y rendimiento

Los datos de la model card comparan el adaptador con Lucia 4B (Qwen3.5 de la misma clase) y Lucia v1 (9B) sobre 60 imagenes y 40 especificaciones no vistas en entrenamiento, mas dos conjuntos externos.

| Metrica | Gemma 4 E4B | Lucia 4B | Lucia v1 (9B) |
|---|---|---|---|
| Forma de fila, imagenes / especificaciones | 1,00 / 1,00 | 1,00 / 1,00 | 1,00 / 1,00 |
| Dicho / respaldado, filas completas | 0,17 / 0,28 | 0,19 / 0,26 | 0,19 / 0,30 |
| Definiciones, imagenes / especificaciones | 0,00 / 0,28 | 0,02 / 0,12 | 0,02 / 0,08 |
| 500 imagenes reservadas: painting / print / drawing / photograph / object (de 100) | 83 / 71 / 80 / 82 / 90 | 83 / 78 / 83 / 81 / 91 | 83 / 76 / 86 / 80 / 90 |
| 200 imagenes de museo: painting / print / drawing / photograph / object | 13 de 27 / 36 de 39 / 12 de 13 / 12 de 13 / 66 de 66 | 14 de 27 / 36 de 39 / no disponible / no disponible / no disponible | no disponible |

La model card solo incluye la fila completa de Lucia 4B para el conjunto de 200 imagenes de museo; el resto de celdas de esa fila y la de Lucia v1 no aparecen en la informacion disponible. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un modelo base de 4.000 millones de parametros en bfloat16 requiere aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y del procesador de vision.
- GPU recomendadas: no especificadas en la model card. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son suficientes; el ejemplo de carga usa `device_map="cuda"` y `dtype=torch.bfloat16`.
- Cabe en GPU de consumo: previsiblemente si en GPUs con 16 GB o mas en bfloat16, y en 8-12 GB con cuantizacion de 8 o 4 bits, aunque la informacion disponible no confirma cifras concretas.
- Opciones de despliegue: la model card solo documenta `transformers` 5.10+ con `peft` 0.18+ y `merge_and_unload()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card lo describe cualitativamente como "el mirón mas rapido del grupo" frente a los miembros Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B think symbolic image | 4B efectivos + LoRA | no disponible | Cadena de 16 pasos + caption + preguntas etiquetadas | Apache 2.0 | Adaptador PEFT en Hugging Face |
| Lucia 4B (Qwen3.5) | 4B | no disponible | Misma receta y formato | no disponible en la informacion | Miembro de la misma linea |
| Lucia v1 (9B) | 9B | no disponible | Misma receta y formato | no disponible en la informacion | Miembro de la misma linea |

Frente a Lucia 4B, el modelo de Gemma iguala la forma de fila y el rendimiento en clasificacion de tipo de imagen, pero queda por debajo en definiciones sobre imagenes (0,00 frente a 0,02) y en la mayoria de categorias del conjunto de 500 imagenes reservadas (por ejemplo, print 71 frente a 78). Frente a Lucia v1 (9B), la brecha es mayor en definiciones (0,00 frente a 0,02) y en drawing (80 frente a 86). La ventaja declarada es la velocidad.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- El rendimiento en "definiciones" sobre imagenes es 0,00, lo que indica que el modelo no produce definiciones correctas cuando se le piden a partir de una imagen.
- La tasa de "dicho / respaldado" en filas completas es baja (0,17 / 0,28), es decir, muchas afirmaciones no quedan respaldadas por la cadena de pensamiento.
- Riesgo de alucinacion en la identificacion de sujetos: el propio formato incluye la etiqueta `[unknown]` para marcar datos no determinables, lo que sugiere que el modelo puede inventar identidades si no se controla.
- El rendimiento cae en categorias concretas: painting en el conjunto de museo solo acierta 13 de 27, frente a 66 de 66 en object.
- Depende del formato exacto de prompt y de la plantilla de chat; la model card advierte de no usar system prompt y de decodificar en greedy.
- Requiere versiones muy recientes de `transformers` (5.10+) y `peft` (0.18+), lo que puede complicar la integracion en stacks existentes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios terminos que deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AbstractPhil/gemma-4-e4b-think-symbolic-image
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio del parser, scorer y trainer: https://github.com/AbstractEyes/qwen-symbolic-thinking
