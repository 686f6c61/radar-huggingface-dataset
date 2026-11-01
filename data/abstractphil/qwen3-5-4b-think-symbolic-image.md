# AbstractPhil/qwen3.5-4b-think-symbolic-image

## Resumen

Lucia 4B es un adaptador LoRA de tipo vision-language construido sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el autor independiente AbstractPhil. El modelo resuelve una tarea muy concreta: dada una imagen, generar una "cadena de pensamiento simbólica" estructurada que describe la obra en pasos nombrados (see, name, place, form, light, colour, mood, mean, etc.), seguida de una caption, un prompt, etiquetas y una serie de preguntas con sus respuestas clasificadas como hecho de la imagen, deducción de la cadena o desconocido. Está orientado al análisis de arte, fotografía y objetos de museo.

El modelo forma parte de la familia "Lucia", cuyos miembros comparten la misma receta de entrenamiento y formato de salida, diferenciándose en el tamaño del modelo base. La versión de 4B se presenta como la alternativa cuando el miembro de 9B no cabe en el hardware disponible: según el autor, mantiene el nivel del 9B en el término de forma y medio, aunque respalda sus deducciones algo menos a menudo.

Es relevante por su enfoque poco habitual: no es un modelo generalista, sino un adaptador especializado que aprende un formato de salida rígido y verificable (cada línea de pensamiento tiene un nombre de paso, cada pregunta lleva una etiqueta de procedencia). Esto lo hace útil para pipelines de catalogación y análisis documental de imágenes donde la estructura de la salida importa tanto como el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) sobre Qwen3.5-4B con adaptador LoRA |
| Parametros totales | 4 mil millones (modelo base); el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen3.5-4B, un transformer multimodal de 4 mil millones de parámetros con capacidad de entrada imagen-texto. El adaptador se fusiona con el modelo base mediante `merge_and_unload()` y se ejecuta con el procesador del repositorio del adaptador. Requiere transformers 5 y peft 0.18 o superior. El autor menciona también una versión de fine-tune completo de la misma receta, publicada en un repositorio separado.

El entrenamiento se realizó sobre dos datasets propios del autor: `AbstractPhil/thought-symbolic-image-captions` (las filas de pensamiento simbólico que el modelo aprende a reproducir) y `AbstractPhil/qwen-symbolic-thinking-image-training`. La receta es común a toda la familia Lucia: misma estructura de filas, mismos pasos de razonamiento y misma disciplina de profundidad (1-2 pensamientos para "a quick look", 3-5 para "a closer look", 6-10 para "a long look"). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

La innovación técnica principal es el formato de salida simbólico y verificable: cada pensamiento lleva un nombre de paso canónico, cada pregunta termina con una etiqueta de procedencia (`[record]`, `[chain]`, `[unknown]`) y el prompt incluye un término inicial que identifica el tipo de imagen (pintura, grabado, dibujo, fotografía). El parseo y la puntuación se realizan con el paquete `qwen-symbolic-thinking` del propio autor.

## Capacidades

- Generación de texto descriptivo y analítico sobre imágenes: caption, prompt, etiquetas y crítica por profundidad.
- Razonamiento visual en cadena: produce cadenas de pensamiento estructuradas con pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say).
- Formulación de preguntas y respuestas sobre la imagen, con clasificación de la procedencia de cada respuesta.
- Análisis de obras de arte, fotografía, dibujos, grabados y objetos de museo.
- Identificación de medio, soporte, composición, iluminación, color y estado de ánimo.
- Conversación multimodal de un turno (image-text-to-text) con plantilla de chat.
- Modo de pensamiento desactivado en ejecución: el autor indica que debe ejecutarse con thinking off, decodificación greedy y sin system prompt.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Catalogación de fondos museísticos: el modelo genera, para cada imagen, una ficha con medio, soporte, composición y preguntas abiertas etiquetadas, lo que permite separar hechos verificables de deducciones y de incógnitas en un pipeline de documentación.
- Generación de metadatos para bancos de imágenes: produce caption, prompt y etiquetas en una sola pasada con formato predecible, lo que facilita el parseo automático y la indexación.
- Análisis de arte y crítica asistida: la línea de crítica y la de estado de ánimo permiten obtener una lectura interpretativa de la obra junto a la descripción objetiva.
- Enriquecimiento de catálogos de fotografías históricas: el modelo identifica medio (por ejemplo, tinta y grafito sobre papel) y describe la escena, útil para archivos y colecciones digitales.
- Control de calidad de descripciones existentes: al generar preguntas con respuesta clasificada, se puede comparar con los metadatos actuales y detectar discrepancias o campos ausentes.
- Investigación sobre razonamiento visual estructurado: el formato simbólico y las etiquetas de procedencia permiten medir la tasa de deducciones respaldadas frente a no respaldadas, útil para estudiar la fiabilidad del razonamiento multimodal.
- Preprocesado para sistemas de recuperación multimodal: las etiquetas y el prompt generados sirven como texto indexable para búsqueda semántica sobre colecciones de imágenes.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las lecturas del propio autor, comparando Lucia 4B con Lucia v1 (9B). La información proporcionada solo incluye parcialmente la tabla; las filas completas no están disponibles.

| Lectura | Lucia 4B | Lucia v1 (9B) |
|---|---|---|
| Forma de fila, imágenes / especificaciones | 1.00 / 1.00 | 1.00 / 1.00 |
| Dicho / respaldado, fila completa | no disponible (tabla truncada) | no disponible (tabla truncada) |

Las lecturas se realizaron sobre 60 imágenes y 40 especificaciones no vistas por el adaptador, más 500 imágenes de la National Gallery of Art (100 dibujos, grabados, pinturas, fotografías y objetos) y 200 imágenes de AIC, NGA, Cleveland y el Met. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Un modelo de 4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más el overhead del procesador de visión y del contexto; en cuantización de 4 bits podría situarse en torno a 3-4 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una GPU consumer de 8-12 GB podría ser suficiente en bfloat16 para contextos cortos.
- Cabe en GPU consumer: probablemente sí en tarjetas de 8 GB o más en bfloat16, y en 4-6 GB con cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: el código de ejemplo usa transformers 5 con `AutoModelForMultimodalLM` y PEFT 0.18 o superior; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El adaptador debe fusionarse con el modelo base antes de servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Lucia 4B (este) | 4B (base) + LoRA | no disponible | Apache 2.0 | Caption simbólico estructurado para arte y fotografía |
| Lucia v1 (9B) | 9B (base) + LoRA | no disponible | no disponible | Misma receta, mayor capacidad; respalda sus deducciones con más frecuencia según el autor |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | Modelo multimodal generalista; sin el formato simbólico aprendido |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría fuera de la familia Lucia. La comparación con el 9B se limita a las lecturas del autor recogidas en la sección anterior.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Debe ejecutarse con thinking desactivado, decodificación greedy y sin system prompt; el autor advierte que un turno de sistema no visto en entrenamiento provoca que el modelo "sobreescriba" el formato.
- El formato de salida es rígido y específico: fuera de la tarea de análisis de imágenes con filas simbólicas, el rendimiento no está caracterizado.
- Riesgo de alucinación en las deducciones: el propio autor señala que el 4B respalda sus pensamientos algo menos a menudo que el 9B, por lo que las etiquetas `[chain]` deben verificarse.
- Las preguntas marcadas como `[unknown]` indican incertidumbre del modelo, pero no hay garantía de que las marcadas `[record]` sean correctas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el fine-tune completo aún no estaba publicado ("that link goes live then"); el ecosistema y el soporte de la comunidad son mínimos.
- No se publican cifras de VRAM, latencia ni throughput, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fine-tune completo (anunciado, pendiente de publicación): https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image-full
- Dataset de captions simbólicas: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio de código (parser, scorer, trainer): https://github.com/AbstractEyes/qwen-symbolic-thinking
