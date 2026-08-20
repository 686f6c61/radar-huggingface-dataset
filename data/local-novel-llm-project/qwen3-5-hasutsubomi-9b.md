# Local-Novel-LLM-project/Qwen3.5-Hasutsubomi-9B

## Resumen

Qwen3.5-Hasutsubomi-9B es un modelo de lenguaje y visión (vision-language) desarrollado por el proyecto Local-Novel-LLM-project, construido como un fine-tuning del modelo base Qwen/Qwen3.5-9B. Su propósito es especializarse en escritura creativa en japonés y en el conocimiento de la subcultura japonesa (anime, manga, tropos de novelas ligeras, lore de internet). El nombre "Hasutsubomi" (蓮蕾, "brote de loto") refleja su estado actual de pre-alpha: un checkpoint temprano que aún está en entrenamiento y experimentación, con la intención de evolucionar a una versión madura llamada "Hanahiraki" (florecimiento).

El modelo hereda las capacidades del base Qwen3.5-9B, incluyendo un modo de "thinking" (razonamiento previo a la respuesta), una ventana de contexto nativa de 262.144 tokens y un encoder de visión que permite analizar ilustraciones y paneles de manga. Con aproximadamente 8,95 mil millones de parámetros, está orientado a tareas de generación de prosa, diálogos de personajes, construcción de mundos y descripción de imágenes, aunque su estado pre-alpha implica una salida creativa pero ocasionalmente inestable.

La relevancia de este modelo reside en su nicho específico: la escritura creativa japonesa y la subcultura, un área donde los modelos generalistas suelen carecer de matices culturales y tropos narrativos. Al estar liberado bajo licencia Apache 2.0, cualquier desarrollador puede usarlo, modificarlo o desplegarlo sin restricciones comerciales, lo que lo convierte en una opción interesante para proyectos de novelas ligeras, juegos de rol, fanfiction o herramientas de asistencia a la escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision (Gated Delta Networks y MoE dispersa segun el autor) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (el autor menciona MoE dispersa, pero no especifica el numero de activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | Japones e ingles (segun la model card; el campo de idiomas en HuggingFace no esta disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B, que segun la model card emplea "Gated Delta Networks" y una mezcla dispersa de expertos (sparse Mixture-of-Experts) para lograr un alto rendimiento de generacion. El autor no proporciona detalles sobre el dataset de fine-tuning, el numero de tokens de entrenamiento ni el metodo de alineacion (RLHF, DPO, etc.). Se trata de un fine-tuning de instruccion y vision sobre el modelo base, con un enfoque especifico en escritura creativa japonesa y conocimiento de subcultura.

El modelo opera en "modo pensamiento" por defecto, generando etiquetas internas de razonamiento (`thinking` y `response`) antes de producir la respuesta final, lo que mejora la coherencia narrativa en tareas de escritura larga. La ventana de contexto de 262.144 tokens permite manejar capitulos extensos de novelas ligeras o conversaciones de rol con mucho historial.

## Capacidades

- Generacion de prosa creativa en japones: capitulos de novelas ligeras, fanfiction, guiones de novelas visuales y descripciones narrativas.
- Analisis de imagenes (vision-language): puede recibir ilustraciones de personajes o paneles de manga y generar descripciones, backstories o analisis de diseno basados en tropos de la subcultura japonesa.
- Conocimiento de tropos y arquetipos de anime/manga: tsundere, yandere, chuunibyou, estructuras de historias isekai, etc.
- Explicacion de cultura japonesa de nicho: historia del anime, convenciones de manga y referencias de internet (con rendimiento limitado segun el autor).
- Modo de razonamiento (thinking mode): planifica la estructura de la historia antes de escribir, mejorando la coherencia en textos largos.
- Soporte multilingue limitado: principal en japones, con capacidad secundaria en ingles.
- No se menciona soporte explicito de tool calling ni function calling en la documentacion disponible.

## Casos de uso

- Escritura de novelas ligeras: el modelo puede generar capitulos completos con una ventana de contexto de 262.144 tokens, suficiente para mantener el hilo narrativo a lo largo de multiples escenas y personajes. Se recomienda una temperatura de 0,8 a 1,0 y presence_penalty de 1,5 para evitar repeticiones.
- Creacion de guiones para novelas visuales: su capacidad para escribir dialogos de personajes con tropos reconocibles (tsundere, yandere) lo hace util para ramas de dialogo en juegos de tipo visual novel.
- Generacion de fanfiction: puede producir historias basadas en franquicias existentes, aprovechando su conocimiento de tropos y convenciones del medio.
- Descripcion de ilustraciones de personajes: un usuario puede subir una imagen de un personaje y pedir al modelo que escriba una backstory o analice su personalidad probable segun el diseno, usando el encoder de vision.
- Asistente de roleplay (RPG de texto): su modo de pensamiento y su contexto largo permiten mantener conversaciones de rol coherentes con multiples turnos y un historial extenso.
- Explicacion de referencias de subcultura japonesa: puede aclarar terminos, tropos o eventos historicos del anime y manga, aunque el autor advierte que su rendimiento en este ambito es limitado y puede alucinar en temas muy oscuros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. El modelo se encuentra en estado pre-alpha y no se ha evaluado formalmente.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 8,95 B de parametros en precision fp16, el peso del modelo ocupa aproximadamente 17,9 GB (tamano del repositorio), por lo que se necesitarian al menos 20 GB de VRAM para inferencia en fp16 sin cuantizacion.
- GPU recomendadas: no se especifican. Una GPU con 24 GB de VRAM (como RTX 3090 o RTX 4090) podria cargar el modelo en fp16, aunque con cuantizacion (por ejemplo, 4 bits) cabria en GPUs de 12-16 GB. No hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: el autor menciona compatibilidad con vLLM, SGLang y Transformers estandar, ademas de la API compatible con OpenAI. Tambien es probable que funcione con llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se proporcionan oficialmente.
- Al ser un modelo de 9B, es viable en hardware de consumo si se cuantiza, pero para la ventana de contexto completa de 262.144 tokens se necesitaria una GPU con mucha memoria (posiblemente 48 GB o mas) o tecnicas de atencion eficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3.5-Hasutsubomi-9B | 8,95 B | 262.144 | Escritura creativa japonesa y subcultura | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | 262.144 | Modelo generalista multilingue | Apache 2.0 |
| Modelos de escritura creativa en japones (p. ej. fine-tunings de Llama o Qwen) | variable | variable | Escritura creativa general | variable |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria. El modelo base Qwen3.5-9B es la referencia natural, pero no hay benchmarks publicados que permitan una comparacion cuantitativa. Otros fine-tunings japoneses de escritura creativa existen en el ecosistema, pero no se dispone de informacion suficiente para una comparativa rigurosa.

## Limitaciones y advertencias

- Estado pre-alpha: el modelo es un checkpoint temprano en entrenamiento. Puede producir salidas inestables, con problemas de formato o frases repetitivas en tareas de escritura extensa.
- Sesgo hacia tropos estereotipados: tiende a inclinarse por arquetipos dramaticos o estereotipados del anime incluso cuando se solicita un tono neutral.
- Alucinaciones en conocimiento de nicho: puede inventar informacion sobre eventos oscuros o referencias muy especificas de la subcultura japonesa.
- Rendimiento limitado en explicaciones culturales: el autor indica que su capacidad para explicar historia del anime o tropos complejos es limitada en el estado actual.
- Idiomas: aunque soporta japones e ingles, su especializacion principal es el japones; el rendimiento en ingles puede ser inferior.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas estandar, lo que dificulta evaluar su fiabilidad en produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo base Qwen3.5-9B tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Local-Novel-LLM-project/Qwen3.5-Hasutsubomi-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE

No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
