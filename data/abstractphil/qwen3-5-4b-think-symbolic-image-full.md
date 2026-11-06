# AbstractPhil/qwen3.5-4b-think-symbolic-image-full

## Resumen

Lucia 4B es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por AbstractPhil. El modelo está especializado en la generación de descripciones estructuradas de imágenes mediante cadenas de pensamiento (chain-of-thought) simbólicas: dado un cuadro, grabado, fotografía u objeto de museo, produce una secuencia de pasos de razonamiento visual en lenguaje natural, seguida de una leyenda, un prompt, etiquetas y preguntas de verificación con sus respuestas.

El modelo resuelve el problema de la captioning interpretativa y estructurada en el dominio del arte y la fotografía, donde una descripción plana resulta insuficiente. Su salida sigue un formato aprendido con pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) y distingue entre hechos registrados, inferencias de la cadena y elementos desconocidos.

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB en safetensors, se posiciona como la variante de 4B de la familia Lucia, ofreciendo un equilibrio entre capacidad y requisitos de hardware frente al miembro de 9B. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; repo de 9,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal que procesa imágenes y texto, y se somete a un ajuste fino completo (no LoRA) sobre dos datasets propios del autor: AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-symbolic-thinking-image-training. El entrenamiento enseña al modelo a producir filas estructuradas de pensamiento simbólico sobre imágenes, con un vocabulario de pasos fijo y una distinción explícita entre respuestas registradas como hechos (`[record]`), derivadas por la cadena (`[chain]`) y desconocidas (`[unknown]`).

La receta de entrenamiento es idéntica para todos los tamaños de la familia Lucia, y el autor indica que el modelo conserva la forma y el término medio al nivel del 9B, aunque respalda sus pensamientos con algo menos de frecuencia. El modelo se ejecuta con el modo thinking desactivado, decodificación greedy y sin system prompt; según la model card, introducir un turno de sistema no visto en entrenamiento provoca sobreescritura. Requiere transformers 5. El parser, scorer y trainer están disponibles en el repositorio qwen-symbolic-thinking.

## Capacidades

- Generación de descripciones estructuradas de imágenes con cadena de pensamiento explícita y pasos nombrados.
- Producción de leyendas (caption), prompts de generación de imagen, etiquetas y críticas por profundidad.
- Formulación de preguntas de verificación con su respuesta y el criterio que la resuelve.
- Comprensión de imágenes de arte y fotografía: pintura, grabado, dibujo, fotografía y objetos de museo.
- Distinción entre hechos de la imagen, inferencias de la cadena y elementos desconocidos.
- Control de profundidad mediante palabras clave: "a quick look" (1-2 pensamientos), "a closer look" (3-5), "a long look" (6-10).
- Conversación multimodal multi-turno en inglés.
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Catalogación de colecciones de museo: el modelo genera filas estructuradas con medio, forma, color, estado de ánimo y preguntas abiertas, útiles para enriquecer fichas de catálogo de dibujos, grabados y fotografías.
- Generación de metadatos para bancos de imágenes: produce captions, prompts y etiquetas en una sola pasada, lo que permite poblar campos de búsqueda y de generación de imagen de forma consistente.
- Auditoría de descripciones existentes: al formular preguntas con respuesta y criterio de resolución, sirve para detectar lagunas o afirmaciones no respaldadas en fichas ya redactadas.
- Asistencia a documentalistas e investigadores: la distinción entre `[record]`, `[chain]` y `[unknown]` permite separar lo observable de lo inferido en estudios de iconografía.
- Aplicaciones educativas de análisis visual: el desglose por pasos (see, place, form, light, colour, mood) sirve como andamiaje para enseñar lectura de imágenes.
- Preprocesado para pipelines de generación de imagen: el prompt de salida con el primer término indicando el tipo de imagen puede alimentar modelos texto-a-imagen en flujos de aumento de datos.
- Prototipado en investigación multimodal: al ser un full fine-tune de 4B con licencia Apache 2.0, es adecuado como punto de partida para experimentos que requieran modificar pesos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa (Lucia 4B full fine-tune, Lucia 4B adapter y Lucia v1 de 9B) sobre 60 imágenes y 40 especificaciones no vistas en entrenamiento, además de dos conjuntos externos (500 imágenes de la National Gallery of Art y 200 de AIC, NGA, Cleveland y el Met). Sin embargo, el contenido de esa tabla está truncado en la información proporcionada y no se ofrecen cifras numéricas completas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 9 GB, por lo que se requiere margen adicional para el procesador de imagen y el contexto.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una GPU con 16 GB o más de VRAM resulta adecuada en bfloat16.
- Compatibilidad con GPU de consumo: probable en tarjetas de 16-24 GB (por ejemplo, RTX 4080/4090) en bfloat16; no confirmado por el autor.
- Opciones de despliegue: transformers 5 con AutoModelForMultimodalLM y AutoProcessor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lucia 4B (full fine-tune) | 4.539 M | no disponible | Apache 2.0 | Full fine-tune, requiere transformers 5 |
| Lucia 4B (adapter LoRA) | 4.539 M (base + adapter) | no disponible | Apache 2.0 | Misma receta, más ligero de almacenar y desactivar; requiere peft 0.18+ |
| Lucia v1 (9B) | no disponible | no disponible | no disponible | Mayor tamaño; según el autor, respalda sus pensamientos con más frecuencia |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | Modelo base sin especialización en captioning simbólico |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta multilingüismo.
- El modelo está especializado en un formato de salida muy concreto; usos fuera de ese formato pueden degradar la calidad.
- Debe ejecutarse con thinking desactivado, decodificación greedy y sin system prompt; un turno de sistema no visto en entrenamiento provoca sobreescritura según el autor.
- Según la model card, respalda sus pensamientos con algo menos de frecuencia que la variante de 9B, lo que puede aumentar las inferencias no justificadas.
- Riesgo de alucinación en la identificación de elementos de la imagen; el propio formato mitiga parte del riesgo con la marca `[unknown]`, pero no lo elimina.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datasets propios de arte y fotografía, puede heredar sesgos de selección de esas colecciones.
- Licencia Apache 2.0, que permite uso comercial; no obstante, deben verificarse las condiciones del modelo base Qwen3.5-4B.
- Requiere transformers 5, lo que puede limitar la compatibilidad con entornos de producción más antiguos.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que reduce la evidencia externa sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image-full
- Adaptador LoRA de la misma receta: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio de código (parser, scorer, trainer): https://github.com/AbstractEyes/qwen-symbolic-thinking
