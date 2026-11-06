# AbstractPhil/ministral-3-14b-think-symbolic-image

## Resumen

Ministral 3 14B think symbolic image es un adaptador LoRA (rango 32, 121,9 millones de parámetros entrenables, guardado en fp32) sobre el modelo vision-language `mistralai/Ministral-3-14B-Instruct-2512-BF16` de Mistral AI, que combina un codificador visual Pixtral de 0,4B parámetros y 24 capas con el modelo de lenguaje Ministral 3 de 40 capas. Lo desarrolla el autor independiente AbstractPhil dentro de una familia de cinco adaptadores entrenados junto a las líneas Lucia (Qwen3.5) y Ulisse (Gemma 4) bajo la misma receta, y su función es generar descripciones estructuradas de imágenes en forma de cadena de pensamiento simbólica: una secuencia de pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de un caption, un prompt, etiquetas, una crítica por profundidad y una lista de preguntas pendientes con su respuesta y su justificación.

El adaptador está especializado en imágenes de arte, fotografía y museo, y produce filas de anotación pensadas para ser legibles y verificables: cada pregunta se etiqueta como `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`. Según la model card, nombra el medio al nivel de la línea Lucia y describe tanto como ella, pero es el que menos respaldo obtiene de los captions propios de la imagen de los cinco de su familia.

Es relevante ahora porque ejemplifica una tendencia concreta: adaptadores de bajo rango que convierten un VLM instruct estándar en un anotador estructurado y auditable, con un formato de salida fijo y trazabilidad de la evidencia. El repositorio ocupa 0,5 GB, tiene licencia Apache 2.0, soporta únicamente inglés y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre VLM transformer: codificador visual Pixtral de 0,4B parámetros y 24 capas + LM Ministral 3 de 40 capas |
| Parametros totales | 14B en el modelo base; 121,9 M entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador guardado en fp32; el base se distribuye en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en BF16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un VLM compuesto por un encoder visual Pixtral de 0,4B parámetros con 24 capas y un modelo de lenguaje Ministral 3 de 40 capas, con 14B parámetros totales. El adaptador LoRA tiene rango 32, 121,9 M parámetros entrenables y se guarda en fp32; no existe un fine-tune completo. Requiere transformers 5 (las lecturas se hicieron con 5.21.0) y peft 0.18 o superior.

El entrenamiento se realizó sobre los datasets `AbstractPhil/thought-symbolic-image-captions` y `AbstractPhil/qwen-thinking-images`, con un formato de fila estricto: pasos de pensamiento nombrados (de 1 a 2 en una mirada rápida, 3 a 5 en una mirada cercana, 6 a 10 en una mirada larga), caption, prompt, etiquetas, crítica por profundidad y preguntas con su etiqueta de evidencia. La model card indica que se entrenó con las formas exactas de prompt del paquete (`prompts.full` y `prompts.short`) y que una petición reformulada constituye una entrada distinta. No se especifican el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO; tampoco se detalla la estrategia de congelación de capas más allá de que solo se entrena el adaptador.

Una innovación destacable es el formato de salida auditable: cada afirmación se clasifica como hecho de la imagen, deducción de la cadena o incógnita, lo que facilita la verificación posterior. La model card advierte además de un comportamiento problemático del vision tower del base: empaqueta todas las imágenes de un lote en una sola secuencia y, en lotes de 64 en bf16 sobre una RTX PRO 6000, las imágenes posteriores a las primeras salen mal (el medio se nombra 322 veces de 500 frente a 415 procesando una a una). El paquete ofrece `family.prepare_model` y `family.prepare_processor` (desde v0.1.38) para procesar el vision tower imagen a imagen y dejar que el procesador haga padding de tamaños distintos.

## Capacidades

- Generación de descripciones estructuradas de imágenes en formato de cadena de pensamiento simbólica con pasos nombrados.
- Producción de caption, prompt de generación, etiquetas y crítica por profundidad de mirada.
- Formulación de preguntas pendientes sobre la imagen, cada una con respuesta y etiqueta de evidencia (`[record]`, `[chain]`, `[unknown]`).
- Identificación del medio y del tipo de imagen (pintura, grabado, dibujo, fotografía) en el primer término de la línea de prompt.
- Descripción de composición, forma, luz, color, tono emocional, intención y narrativa.
- Análisis de imágenes de arte, fotografía y museo.
- Conversación multimodal de un turno con imagen y texto (pipeline image-text-to-text).
- No dispone de tool calling, function calling, modo de agente ni capacidades de audio según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Catalogación de fondos museísticos: el adaptador genera para cada pieza una fila con medio, composición, color y tono, más un caption normalizado, lo que permite poblar fichas de catálogo de forma semiautomática y revisar después solo las preguntas marcadas como `[unknown]`.
- Generación de metadatos para bancos de imágenes: la línea de prompt y las etiquetas sirven directamente como metadatos de búsqueda y como prompts reutilizables en herramientas de generación, con la ventaja de que el formato es fijo y parseable.
- Auditoría de descripciones automáticas: al separar hechos (`[record]`) de deducciones (`[chain]`) e incógnitas (`[unknown]`), permite construir un pipeline que marque qué afirmaciones necesitan verificación humana antes de publicarse.
- Documentación de archivo y patrimonio digital: para lotes de fotografías de objetos, el modelo produce descripciones con nivel de detalle ajustable (mirada rápida, cercana o larga), lo que facilita generar versiones cortas y largas de la misma ficha.
- Investigación en evaluación de VLMs: al ser uno de cinco adaptadores entrenados con la misma receta sobre bases distintas, sirve para comparar cuánto retiene cada modelo base del formato simbólico, con métricas de respaldo en captions ya definidas por el autor.
- Enseñanza y crítica de arte asistida: la crítica por profundidad y las preguntas pendientes pueden usarse como material de partida en talleres de análisis visual, siempre con revisión humana.
- Preprocesado para pipelines de visión: las descripciones estructuradas pueden alimentar índices de búsqueda semántica sobre colecciones de imágenes, ya que el formato consistente simplifica el parseo y la indexación por campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta comparaciones cualitativas dentro de la familia: el adaptador nombra el medio al nivel de la línea Lucia, describe tanto como ella y es el que menos respaldo obtiene de los captions propios de la imagen de los cinco. También reporta una métrica operativa del base: en un lote de 64 en bf16 sobre RTX PRO 6000, el medio se nombra 322 veces de 500 con el vision tower empaquetado, frente a 415 procesando una imagen a la vez y 414 con el procesado corregido del paquete.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base tiene 14B parámetros y se carga en bf16, lo que sitúa el peso en torno a 28 GB, más el encoder visual y las activaciones.
- GPU recomendadas: la model card cita una RTX PRO 6000 para las pruebas en bf16; por tamaño, el base en bf16 encaja en A100 40/80 GB, H100 y GPUs profesionales con 48 GB o más.
- En GPU de consumo: no cabe en bf16 en tarjetas de 24 GB; requeriría cuantización del base, cuyos formatos no se detallan en la información disponible.
- Opciones de despliegue: transformers 5 con peft 0.18 o superior, cargando el base y fusionando el adaptador con `merge_and_unload()`; el paquete del autor incluye utilidades (`family.prepare_model`, `family.prepare_processor`) para el procesado correcto de lotes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que el entrenamiento usó lotes de 8 y que los lotes grandes requieren procesar el vision tower imagen a imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 14B think symbolic image (este) | 14B base + 121,9 M LoRA | no disponible | Anotación simbólica de imágenes con cadena de pensamiento | apache-2.0 | Hugging Face, 0 descargas |
| Ministral-3-14B-Instruct-2512-BF16 (base) | 14B | no disponible | VLM instruct generalista | no disponible en la información | Hugging Face (Mistral AI) |
| Línea Lucia (Qwen3.5), mismo recetario | no disponible | no disponible | Anotación simbólica de imágenes | no disponible | Referenciada en la model card |
| Línea Ulisse (Gemma 4), mismo recetario | no disponible | no disponible | Anotación simbólica de imágenes | no disponible | Referenciada en la model card |

La model card sitúa a este adaptador, dentro de su familia, al nivel de Lucia en identificación del medio y volumen de descripción, pero como el que menos respaldo obtiene de los captions de la imagen. No se aportan datos cuantitativos que permitan una comparación numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador está entrenado para unas formas de prompt exactas; una petición reformulada constituye una entrada distinta y puede degradar la salida.
- Debe ejecutarse sin system prompt propio y con decodificación greedy, tal como se entrenó; el modelo Instruct base no piensa por sí mismo.
- El vision tower del base falla en lotes grandes: en lotes de 64 las imágenes posteriores a las primeras salen incorrectas, por lo que es necesario procesar imagen a imagen o usar las utilidades del paquete.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- La model card reconoce que es el adaptador de su familia con menor respaldo en los captions propios de la imagen, lo que implica mayor riesgo de descripciones no fundamentadas en el contenido visual.
- Riesgo de alucinación en las preguntas marcadas como `[chain]`, que son deducciones y no hechos verificados; conviene revisar especialmente esas líneas en producción.
- No se detallan sesgos conocidos, número de tokens de entrenamiento ni composición completa del dataset.
- El tokenizador emite una advertencia de transformers sobre un patrón de pre-tokenizador incorrecto (`fix_mistral_regex`); según la model card, en estas filas el flag no cambia ningún token y el adaptador se entrenó sin él.
- Licencia Apache 2.0, que permite uso comercial, pero al ser un adaptador sobre un base de Mistral AI conviene verificar las condiciones del modelo base antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AbstractPhil/ministral-3-14b-think-symbolic-image
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de imágenes de pensamiento: https://huggingface.co/datasets/AbstractPhil/qwen-thinking-images
