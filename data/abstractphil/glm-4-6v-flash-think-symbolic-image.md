# AbstractPhil/glm-4.6v-flash-think-symbolic-image

## Resumen

GLM-4.6V-Flash, think symbolic image es un adaptador LoRA (PEFT) construido sobre el modelo vision-lenguaje zai-org/GLM-4.6V-Flash de Zhipu AI. El adaptador no modifica la arquitectura del modelo base: lo especializa para producir, a partir de una imagen, una "fila" estructurada de pensamiento simbólico que combina una cadena corta de pensamientos en lenguaje natural (un paso nombrado por línea: see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de formulaciones textuales (caption, prompt, tags, critique según la profundidad del análisis) y de las preguntas que un observador cuidadoso aún se plantearía, cada una con su respuesta y su justificación.

El modelo base combina un codificador visual GLM-4V de 24 capas con el modelo de lenguaje GLM-4-9B de 40 capas, lo que da un total de aproximadamente 10 mil millones de parámetros. El adaptador tiene rango 32 y 95,2 millones de parámetros entrenables, guardados en fp32, y el repositorio ocupa 0,4 GB. Está entrenado en inglés y orientado a dominios de arte, fotografía y museo.

Su relevancia actual radica en que aborda la generación de descripciones visuales con razonamiento explícito y trazabilidad epistémica: distingue entre hechos de la imagen (`[record]`), deducciones de la cadena (`[chain]`) y datos desconocidos (`[unknown]`). Es uno de los cinco linajes de modelos entrenados junto a las líneas Lucia (Qwen3.5) y Ulisse (Gemma 4) bajo la receta de Lucia v1, evaluados sobre los mismos conjuntos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-lenguaje GLM-4.6V-Flash (codificador visual GLM-4V de 24 capas + LM GLM-4-9B de 40 capas) |
| Parametros totales | No disponible para el adaptador (base ~10 000 millones); adaptador: 95,2 millones entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador guardado en fp32; el modelo base admite bfloat16 en la carga de ejemplo) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre GLM-4.6V-Flash, un modelo vision-lenguaje que empareja un codificador visual de 24 capas con un modelo de lenguaje de 40 capas (GLM-4-9B). El adaptador LoRA tiene rango 32, 95,2 millones de parámetros entrenables y se guarda en fp32; no existe un fine-tune completo del modelo base. La carga requiere transformers 5 (las evaluaciones se hicieron con 5.21.0) y peft 0.18 o superior, y el adaptador se fusiona con `merge_and_unload()` antes de la inferencia.

El entrenamiento se realizó sobre los conjuntos de datos AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-thinking-images, con un formato de salida estrictamente definido: pasos de pensamiento nombrados por línea, formulaciones textuales por profundidad (quick look: 1-2 pensamientos; closer look: 3-5; long look: 6-10) y preguntas etiquetadas como `[record]`, `[chain]` o `[unknown]`. El adaptador se entrenó con los prompts exactos que documenta la model card (formas `prompts.full` y `prompts.short`), de modo que una reformulación del prompt constituye una entrada distinta. La inferencia se realiza con decodificación greedy, sin system prompt y con `enable_thinking=False` en la plantilla (que termina el turno del usuario con `/nothink` y abre la respuesta con un bloque `<think></think>` vacío). Las filas se entrenaron para terminar con `<|endoftext|>`, uno de los cuatro ids de parada de la configuración de generación.

## Capacidades

- Generación de descripciones visuales estructuradas: caption, prompt de generación, tags y crítica, según la profundidad solicitada.
- Razonamiento visual en cadena de pensamiento explícita, con pasos nombrados y ordenados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say).
- Trazabilidad epistémica: cada pregunta se responde marcando si es un hecho de la imagen (`[record]`), una deducción de la cadena (`[chain]`) o un dato desconocido (`[unknown]`).
- Identificación del medio y del tipo de imagen (pintura, grabado, dibujo, fotografía): según la model card, es la primera familia junto a Lucia que nombra el medio a su nivel (415 de 500).
- Análisis de obras de arte, fotografía y piezas de museo (dominio de entrenamiento declarado).
- Conversación multimodal image-text-to-text (pipeline declarado).
- Capacidad multilingüe: limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, audio ni visión más allá de la descripción de imágenes.

## Casos de uso

- Catalogación de fondos museísticos: el adaptador genera filas estructuradas con medio, composición, color y estado de ánimo, y separa hechos verificables de inferencias, lo que facilita la revisión por conservadores y la importación a bases de datos.
- Generación de metadatos para archivos fotográficos: produce caption, tags y prompt de forma consistente y con un formato fijo, adecuado para pipelines automáticos de indexación y búsqueda.
- Creación de prompts para modelos generativos de imagen: la línea `prompt` con el primer término indicando el tipo de imagen (painting, print, drawing, photograph) sirve como entrada directa a generadores texto-imagen.
- Crítica y análisis de obras para publicaciones: la profundidad "long look" añade crítica y un mayor número de pensamientos (6-10), útil para fichas de catálogo o textos divulgativos.
- Auditoría de descripciones: la distinción `[record]`/`[chain]`/`[unknown]` permite detectar afirmaciones no respaldadas por la imagen, útil en control de calidad de datasets de captioning.
- Investigación en razonamiento visual: al ser uno de cinco linajes entrenados con la misma receta y evaluados sobre los mismos conjuntos de validación, sirve para estudios comparativos de capacidad de retención entre modelos base.
- Asistencia educativa en historia del arte: las preguntas con respuesta y justificación modelan el método de observación de un "observador cuidadoso" y pueden usarse como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona lecturas comparativas sobre conjuntos de validación (por ejemplo, "415 de 500" en identificación del medio), pero no presenta tablas con MMLU, HumanEval, GSM8K ni métricas estándar de captioning.

## Requisitos de hardware

- El adaptador pesa 0,4 GB; el requisito real lo determina el modelo base GLM-4.6V-Flash (~10 000 millones de parámetros).
- VRAM estimada para el modelo base en bfloat16: aproximadamente 20 GB solo para pesos, más memoria para el codificador visual, el procesador y la caché KV; en cuantización de 8 bits, del orden de 10-12 GB; en 4 bits, del orden de 6-8 GB (estimaciones, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) es viable en bfloat16 justo para los pesos, con margen limitado para contexto largo.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers 5 + peft 0.18 o superior (flujo documentado, con fusión del adaptador); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.6V-Flash, think symbolic image (este) | ~10 000 M (base) + 95,2 M (LoRA) | No disponible | Captioning simbólico con cadena de pensamiento y trazabilidad | MIT | HuggingFace (adaptador PEFT) |
| zai-org/GLM-4.6V-Flash (base) | ~10 000 M | No disponible | Vision-lenguaje general | No disponible en la información | HuggingFace |
| Línea Lucia (Qwen3.5) | No disponible | No disponible | Misma receta de captioning simbólico | No disponible | Entrenada junto a este modelo |
| Línea Ulisse (Gemma 4) | No disponible | No disponible | Misma receta de captioning simbólico | No disponible | Entrenada junto a este modelo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sensible a la formulación del prompt: el adaptador se entrenó con prompts exactos; una reformulación constituye una entrada distinta y puede degradar el formato de salida.
- Requiere configuración específica de inferencia (greedy, sin system prompt, `enable_thinking=False`, parada en `<|endoftext|>`); desviarse de ella puede romper la estructura de la fila.
- Riesgo de alucinación en las líneas de caption, prompt y crítica; la etiqueta `[unknown]` mitiga pero no elimina las afirmaciones no verificadas.
- Sesgos heredados del modelo base GLM-4.6V-Flash y de los datasets de arte, fotografía y museo, con posible infrarrepresentación de otras culturas visuales.
- Dominio acotado: el rendimiento fuera de arte, fotografía y museo no está documentado.
- Licencia MIT para el adaptador; deben respetarse las condiciones del modelo base zai-org/GLM-4.6V-Flash, cuya licencia no se detalla en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- La model card está incompleta (el texto se corta en la tabla de prompts de la profundidad "long look").

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/AbstractPhil/glm-4.6v-flash-think-symbolic-image
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de imágenes: https://huggingface.co/datasets/AbstractPhil/qwen-thinking-images
