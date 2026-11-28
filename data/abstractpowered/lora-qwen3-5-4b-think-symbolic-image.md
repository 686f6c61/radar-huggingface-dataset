# AbstractPowered/lora-qwen3.5-4b-think-symbolic-image

## Resumen

Lucia 4B v1.2 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por AbstractPowered bajo licencia Apache 2.0. No es un modelo independiente, sino un ajuste fino que especializa al base en una tarea concreta: la lectura simbólica de imágenes. Dada una fotografía o ilustración, el adaptador produce una cadena de pensamiento en lenguaje llano (con pasos nombrados como `see`, `relate`, `mood`, etc.), seguida de formulaciones concretas —caption, prompt, tags, crítica por profundidad— y de un conjunto de preguntas que un observador cuidadoso se plantearía, cada una con su respuesta y su justificación.

La relevancia de esta versión radica en el volumen de entrenamiento: se ha entrenado con 91.138 filas, casi diez veces más que la versión 1.1 (9.261 filas), en una sola pasada (10.137 pasos). El conjunto de datos procede de la parte Apache 2.0 del dataset `AbstractPhil/thought-symbolic-image-recaptioned` (release 5), con lecturas de fotografías DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, generadas por modelos de OpenAI, Google y DeepSeek y filtradas por revisión ciega.

El adaptador conserva el comportamiento del modelo base mediante un segundo objetivo de entrenamiento que mantiene sus elecciones de siguiente palabra cerca de las de Qwen3.5-4B en peticiones ordinarias. Es, por tanto, una utilidad especializada: cambia cómo responde cuando se le pide una lectura de imagen y poco más. El repositorio ocupa 0,3 GB e incluye los ficheros del procesador del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | AbstractPhil/thought-symbolic-image-recaptioned (release 5, parte Apache 2.0) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal de 4.000 millones de parámetros que acepta entradas de imagen y texto. La arquitectura interna del base no se detalla en la información disponible; el adaptador en sí es un LoRA estándar gestionado con PEFT, que modifica un subconjunto de pesos del base sin alterar su estructura.

El entrenamiento usó 91.138 filas en una sola pasada (10.137 pasos). Las filas provienen de la release 5 del dataset `thought-symbolic-image-recaptioned` (95.481 filas en total), de las que se excluyeron 3.718 filas de fotografías COCO 2017 con otras licencias, 609 filas correspondientes a imágenes retenidas para evaluación y 16 filas cuyas imágenes no están disponibles en ningún repositorio. Las lecturas fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revisión ciega; 30.250 son "long looks". Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados con filas de Claude. El entrenamiento muestra al modelo la imagen de cada fila, por lo que las fotografías COCO 2017 incluidas son solo aquellas con licencia Attribution de sus autores de Flickr o sin restricciones de copyright conocidas.

La innovación técnica principal es el segundo objetivo de entrenamiento que ancla las elecciones de siguiente palabra del adaptador a las del modelo base en peticiones ordinarias, preservando así el comportamiento general de Qwen3.5-4B. El formato de salida es aprendido: cadena de pensamiento con pasos nombrados, líneas de caption/prompt/tags/crítica y preguntas etiquetadas como `[record]`, `[chain]` o `[unknown]`.

## Capacidades

- Lectura simbólica de imágenes: genera una cadena de pensamiento en lenguaje llano con pasos nombrados (`see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`).
- Producción de formulaciones derivadas: caption, prompt de generación, tags y crítica por profundidad.
- Generación de preguntas y respuestas sobre la imagen, clasificadas por origen de la respuesta (`[record]`, `[chain]`, `[unknown]`).
- Longitud variable de la cadena según profundidad de la mirada: 1-2 pensamientos (quick look), 3-5 (closer look), 6-10 (long look).
- Conversación multi-turno (tag `conversational`).
- Capacidades heredadas del base Qwen3.5-4B en peticiones ordinarias, con comportamiento próximo al original.
- No soporta tool calling ni function calling de forma específica (no documentado).
- Capacidades multilingües limitadas al inglés.
- Sin soporte de audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Catalogación y descripción de fondos fotográficos: el modelo genera caption, tags y prompt de forma estructurada para cada imagen, lo que facilita la indexación automática de archivos y colecciones con metadatos consistentes.
- Generación de prompts para modelos texto-a-imagen: la línea `prompt` produce descripciones compactas y reutilizables (por ejemplo, "yellow truck parked on a road, traffic cones, grassy field, centered composition") que pueden alimentar pipelines de difusión.
- Análisis visual asistido con trazabilidad: la cadena de pensamiento con pasos nombrados permite auditar cómo se llegó a una conclusión sobre la imagen, útil en entornos donde se exige explicabilidad.
- Etiquetado de datasets de visión: las líneas `tags` y las preguntas con respuesta `[record]` permiten extraer atributos verificables (nombre de objeto, cantidad, color, estado) para anotación semiautomática.
- Evaluación de calidad de imágenes generadas: la sección de crítica por profundidad y las preguntas `[unknown]` ayudan a identificar información ausente o ambigua en una imagen sintética.
- Asistentes de accesibilidad descriptiva: la lectura estructurada (see, relate, mood, caption) ofrece descripciones ricas para personas con discapacidad visual, con niveles de detalle ajustables.
- Investigación en cadenas de pensamiento visuales: el formato fijo y los pasos definidos lo convierten en un banco de pruebas para estudiar razonamiento simbólico sobre imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye dos métricas cualitativas internas:

| Metrica | Resultado |
|---|---|
| Imágenes retenidas con lettering legible en las que el "closer look" nombra una palabra visible | 56 de 245 |
| Imágenes retenidas con lettering legible en las que la descripción libre del modelo base nombra una palabra visible | 227 de 245 |
| Precisión al nombrar el lettering cuando se pregunta directamente (adaptador) | 0,92 |
| Precisión al nombrar el lettering cuando se pregunta directamente (base) | 0,91 |
| Filas de entrenamiento | 91.138 (frente a 9.261 en v1.1) |
| Pasos de entrenamiento | 10.137 (una pasada) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica. Al ser un adaptador LoRA sobre un modelo de 4B, los requisitos son los del base Qwen3.5-4B más una sobrecarga mínima del adaptador (0,3 GB en disco).
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del base (4B), es razonable esperar que quepa en GPUs de consumo, aunque el dato no está confirmado.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del base, pero no confirmado en la documentación.
- Opciones de despliegue: la model card indica ejecución con `transformers` 5 o superior y `peft` 0.18 o superior, cargando el adaptador con `PeftModel` sobre el base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Configuración de inferencia recomendada: thinking desactivado, decodificación greedy y sin system prompt (un turno de sistema no visto en entrenamiento provoca sobreescritura del formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| Lucia 4B v1.2 (este) | 4B (base) + LoRA | no disponible | apache-2.0 | Adaptador LoRA multimodal | Especializado en lectura simbólica de imágenes; 91.138 filas de entrenamiento |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible en la información | Modelo base multimodal | Modelo generalista sobre el que se aplica el adaptador |
| qwen3.5-4b-think-symbolic-image-nc | 4B (base) + LoRA | no disponible | CC BY-NC-SA 4.0 | Adaptador LoRA multimodal | Versión no comercial del mismo proyecto, entrenada con filas adicionales (COCO, FFHQ, DeepFashion-MultiModal) |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo apenas escribe el lettering visible en las imágenes dentro de su lectura: solo lo nombra en 56 de 245 imágenes retenidas con texto legible, frente a 227 del modelo base. Solo responde con precisión al lettering si se le pregunta directamente.
- Requiere configuración estricta de inferencia: thinking desactivado, greedy decoding y sin system prompt. Un system prompt no visto en entrenamiento degrada el formato de salida.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación inherente a los modelos generativos: las respuestas marcadas como `[record]` pretenden ser hechos de la imagen, pero no hay garantía de verificación automática.
- Sesgos: no documentados explícitamente, pero el dataset de entrenamiento está compuesto por lecturas generadas por modelos de OpenAI, Google y DeepSeek sobre fotografías de COCO, DOCCI y la National Gallery of Art, lo que puede introducir sesgos de composición y de estilo descriptivo.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe respetarse. La versión no comercial (nc) está bajo CC BY-NC-SA 4.0 y no debe usarse comercialmente.
- El adaptador está diseñado para preservar el comportamiento del base en peticiones ordinarias, pero no se garantiza una paridad perfecta; puede haber deriva en tareas generales.
- El repositorio es de tamaño reducido (0,3 GB) e incluye los ficheros del procesador del base; no incluye los pesos completos del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AbstractPowered/lora-qwen3.5-4b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Registro de investigación del proyecto: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Release 5 del dataset: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Manifiestos (hashes y licencia): https://huggingface.co/datasets/AbstractPowered/manifests
- Versión no comercial: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image-nc
- Organización AbstractPowered: https://huggingface.co/AbstractPowered
- Imagen de ejemplo COCO 2017 (376084): https://cocodataset.org/#explore?id=376084
