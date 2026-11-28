# AbstractPhil/qwen3.5-4b-think-symbolic-image

## Resumen

Lucia 4B v1.2 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por AbstractPhil, que convierte un modelo de lenguaje multimodal en un sistema especializado en la lectura estructurada de imagenes. El adaptador no sustituye al modelo base: lo modifica para que, ante una imagen, genere una cadena de pensamiento en lenguaje natural con pasos nombrados (`see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`), seguida de una caption, un prompt o etiquetas, y una serie de preguntas con sus respuestas clasificadas como `[record]`, `[chain]` o `[unknown]`.

La version 1.2 se entrena sobre 91.138 filas, casi diez veces mas que la version 1.1 (9.261 filas), en un unico pase de 10.137 pasos. El conjunto de datos combina lecturas de fotografias DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, generadas por modelos de OpenAI, Google y DeepSeek y filtradas mediante revision ciega. El adaptador conserva el comportamiento general del modelo base mediante un segundo objetivo de entrenamiento que mantiene las elecciones de siguiente token cerca de las de Qwen3.5-4B en peticiones ordinarias.

El modelo resulta relevante para quienes necesitan un sistema de image captioning con razonamiento explicito y trazable, donde la salida no sea solo una descripcion sino un proceso de observacion estructurado. Su licencia Apache-2.0 y su naturaleza de adaptador LoRA (0,7 GB) lo hacen ligero de almacenar y facil de integrar sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-4B (vision-language) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal que procesa imagenes y texto. El entrenamiento se realizo con PEFT (LoRA) sobre 91.138 filas del dataset `AbstractPhil/thought-symbolic-image-recaptioned` (release 5, parte Apache-2.0), en un unico pase de 10.137 pasos. Las filas excluyen 3.718 filas de COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas sin imagen disponible. Del total, 30.250 filas corresponden a "long looks" (6-10 pasos de cadena). Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados con datos de Claude.

El entrenamiento incorpora un segundo objetivo que mantiene las elecciones de siguiente token del adaptador cerca de las del modelo base en peticiones ordinarias, de modo que el adaptador modifica principalmente el comportamiento cuando se solicita una lectura de imagen. La inferencia recomendada es con thinking desactivado, decodificacion greedy y sin system prompt, ya que la forma de la respuesta se aprende de las filas y un turno de sistema no visto durante el entrenamiento provoca sobreescritura. Requiere transformers 5 y peft 0.18 o superior.

## Capacidades

- Generacion de cadenas de pensamiento estructuradas para la lectura de imagenes, con pasos nombrados y ordenados.
- Image captioning en varios niveles de profundidad: vistazo rapido (1-2 pensamientos), vistazo cercano (3-5) y vistazo largo (6-10).
- Generacion de prompts fotograficos y etiquetas (tags) a partir de la imagen.
- Formulacion de preguntas de seguimiento con respuestas clasificadas como hecho de la imagen (`[record]`), deducidas por la cadena (`[chain]`) o desconocidas (`[unknown]`).
- Analisis de atributos visuales: nombre de objetos, conteo, color, estado, relacion espacial, iluminacion, composicion, atmosfera y significado.
- Conversacion multi-turno en formato image-text-to-text.
- Capacidad de nombrar texto visible en la imagen cuando se le pregunta directamente (0,92 de acierto frente a 0,91 del modelo base en imagenes reservadas).
- Soporte limitado de tool calling y agentes: no documentado en la informacion disponible.

## Casos de uso

- Catalogacion y descripcion de imagenes en archivos fotograficos: el modelo genera captions, tags y prompts de forma consistente, lo que permite indexar grandes volumenes de fotografias con metadatos estructurados y trazables.
- Generacion de prompts para modelos de difusion: a partir de una imagen de referencia, produce un prompt fotografico detallado que puede reutilizarse en pipelines de generacion de imagen.
- Revision asistida de obras de arte: el adaptador fue entrenado con obras de la National Gallery of Art y puede producir lecturas con pasos de composicion, luz, color y significado, utiles en museos o plataformas de divulgacion.
- Analisis de especificaciones dibujadas: al haberse entrenado con dibujos tecnicos, puede leer diagramas y generar descripciones estructuradas con preguntas de verificacion.
- Control de calidad de datasets visuales: sus preguntas con etiquetas `[record]`, `[chain]` e `[unknown]` permiten auditar si una descripcion se basa en hechos observados o en inferencias.
- Asistencia a personas con discapacidad visual: la salida estructurada en pasos y la caption final ofrecen una descripcion progresiva y comprensible de la imagen.
- Investigacion en razonamiento multimodal: la cadena de pensamiento explicita y la clasificacion de respuestas facilitan el estudio de como los modelos justifican sus afirmaciones sobre imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una evaluacion cualitativa sobre imagenes reservadas: el adaptador nombra texto visible en 56 de 245 imagenes con lettering legible en su vistazo cercano, frente a 227 del modelo base en descripcion libre; sin embargo, al preguntar directamente por el texto, acierta en 0,92 de las imagenes frente a 0,91 del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un adaptador sobre Qwen3.5-4B, los requisitos dependen del modelo base. En bfloat16, un modelo de 4B requiere aproximadamente 8-10 GB de VRAM para inferencia, mas el coste del procesador visual.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, cabria esperar funcionamiento en GPUs consumer con 12-16 GB de VRAM, aunque no se confirma.
- Cabe en GPU consumer: probablemente si, en funcion de la cuantizacion del modelo base; no confirmado en la documentacion.
- Opciones de despliegue: transformers 5 con peft 0.18 o superior, cargando el adaptador con `PeftModel.from_pretrained` y `merge_and_unload`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Lucia 4B v1.2 (este) | Adaptador sobre 4B | No disponible | Apache-2.0 | Lectura estructurada de imagenes con cadena de pensamiento |
| Qwen3.5-4B (base) | 4B | No disponible | No disponible | Modelo multimodal generalista |
| Lucia 4B v1.2-nc (hermano) | Adaptador sobre 4B | No disponible | CC BY-NC-SA 4.0 | Igual, con datos COCO 2017, FFHQ y DeepFashion-MultiModal, solo uso no comercial |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El adaptador rara vez incluye el texto visible (lettering) de la imagen en su lectura espontanea: solo lo nombra en 56 de 245 imagenes reservadas con texto legible, frente a 227 del modelo base. Solo acierta al preguntarle directamente.
- Entrenado exclusivamente en ingles; no se documenta soporte multilingue.
- Requiere thinking desactivado, decodificacion greedy y ausencia de system prompt; un system prompt no visto durante el entrenamiento provoca sobreescritura de la respuesta.
- Depende de transformers 5 y peft 0.18 o superior, lo que puede limitar la compatibilidad con entornos mas antiguos.
- Riesgo de alucinacion inherente a los modelos generativos: las respuestas marcadas como `[record]` deberian verificarse, ya que el modelo puede clasificar incorrectamente una inferencia como hecho observado.
- Sesgos: no documentados en la informacion disponible; al entrenarse con datasets curados (DOCCI, COCO, National Gallery of Art), puede heredar sesgos de composicion y tematicos de esas fuentes.
- Licencia Apache-2.0 para el adaptador, pero el uso comercial del modelo base Qwen3.5-4B depende de su propia licencia, no especificada en la informacion disponible.
- El modelo hermano `-nc` esta bajo CC BY-NC-SA 4.0 y no permite uso comercial; no confundir con esta version.
- No se documentan capacidades de tool calling, agentes ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Release 5 del dataset: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Version no comercial: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image-nc
- Imagen de ejemplo COCO 2017: https://cocodataset.org/#explore?id=376084
