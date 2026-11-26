# AbstractPhil/qwen3.5-9b-think-symbolic-image

## Resumen

Lucia v1.2 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por AbstractPhil, que convierte un modelo de lenguaje multimodal de 9.000 millones de parametros en un sistema especializado en lectura y descripcion razonada de imagenes. El adaptador no reemplaza el modelo base: lo modula para que, ante una imagen, produzca una cadena de pensamiento en lenguaje llano con pasos nombrados (`see`, `relate`, `mood`, `caption`, `prompt`, `tags`, etc.) seguida de preguntas y respuestas verificables. Es la version mas grande de la familia Lucia y hereda la receta y los datos de Lucia 4B v1.2, aplicados ahora a la escala de 9B.

El problema que resuelve es la generacion de descripciones visuales estructuradas y auditables, en lugar de captioning libre. El modelo separa lo que observa, lo que relaciona, lo que interpreta y lo que desconoce, lo que facilita su uso en pipelines donde la trazabilidad del razonamiento visual importa. Se entreno sobre 91.138 filas (frente a las 9.261 de la version 1.1), provenientes de fotografias DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, con anotaciones generadas por modelos de OpenAI, Google y DeepSeek y admitidas por revision ciega.

Es relevante ahora porque demuestra una via practica para especializar un VLM de 9B mediante PEFT manteniendo el comportamiento general del modelo base: un segundo objetivo de entrenamiento ancla las elecciones de siguiente token a las del Qwen3.5-9B original en peticiones ordinarias, de modo que el adaptador cambia poco fuera de las tareas de lectura visual. La licencia es Apache 2.0 y el repositorio ocupa 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B |
| Parametros totales | 9B (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el autor indica bfloat16 para inferencia) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer multimodal con capacidad de procesamiento de imagen y texto. Lucia v1.2 no modifica la arquitectura del base: es un LoRA entrenado con la libreria PEFT que ajusta los pesos para producir el formato de lectura visual aprendido. El entrenamiento uso 91.138 filas en una sola pasada (10.137 pasos), frente a las dos pasadas de la version 1.1. Los datos combinan lecturas de fotografias DOCCI y COCO 2017, imagenes de la National Gallery of Art y especificaciones dibujadas; 30.250 filas corresponden a "long looks" (6 a 10 pasos de cadena). Se excluyeron 3.718 filas de COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas sin almacen disponible.

La innovacion tecnica principal es un segundo objetivo de entrenamiento que mantiene las elecciones de siguiente token cerca de las del Qwen3.5-9B original en peticiones ordinarias que el base respondio por si mismo. Esto preserva el comportamiento general del modelo: en peticiones ordinarias retenidas, el adaptador responde de forma cercana al base y no adopta el formato de lectura (la version 1, sin este objetivo, respondia 157 de 328 en formato de lectura). Ademas, el modelo se entreno con thinking desactivado, decodificacion greedy y sin system prompt, condiciones que el autor indica como necesarias para un funcionamiento correcto. El adaptador requiere transformers 5 y peft 0.18 o superior.

## Capacidades

- Lectura visual estructurada: genera cadenas de pensamiento con pasos nombrados (`see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`).
- Generacion de caption, prompt, tags y critica por profundidad a partir de una imagen.
- Formulacion de preguntas y respuestas sobre la imagen, etiquetadas como `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]` (no determinable).
- Tres profundidades de analisis: quick look (1-2 pensamientos), closer look (3-5) y long look (6-10).
- Descripcion de fotografias, obras de arte y especificaciones dibujadas.
- Capacidad de reconocer y reportar texto visible en la imagen cuando se le pregunta directamente (con rendimiento comparable al base en esa tarea especifica).
- Conversacion multi-turno en ingles.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso.
- No se documenta soporte de audio ni vision mas alla del captioning descrito.

## Casos de uso

- Catalogacion y documentacion de archivos fotograficos: el modelo genera caption, tags y prompt de forma consistente para cada imagen, con una estructura fija que facilita la indexacion y busqueda en bases de datos de imagenes.
- Generacion de prompts para modelos de difusion: la linea `prompt` produce descripciones compactas y reutilizables como entrada de generadores texto-a-imagen, con atributos separados por comas (objeto, color, relacion espacial).
- Analisis de obras de arte en entornos museisticos o editoriales: el modelo fue entrenado con imagenes de la National Gallery of Art y produce lecturas que separan observacion, relacion, tono y significado, utiles para fichas divulgativas.
- Auditoria de accesibilidad: la cadena de pensamiento explicita que el modelo ve, que relaciona y que desconoce, lo que permite revisar la calidad de una descripcion y detectar omisiones antes de publicarla como texto alternativo.
- Investigacion en evaluacion de VLM: el formato etiquetado (`[record]`, `[chain]`, `[unknown]`) permite medir por separado la precision factica, la inferencia y la calibracion de la incertidumbre en modelos de captioning.
- Analisis de especificaciones tecnicas dibujadas: el modelo se entreno tambien con especificaciones dibujadas, por lo que puede describir diagramas y planos con el mismo formato estructurado.
- Moderacion y revision de contenido visual en pipelines: la salida estructurada y determinista (greedy) facilita el parseo automatico y la integracion en flujos de revision por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta metricas internas de evaluacion cualitativa:

| Metrica reportada | Lucia v1.2 9B | Base Qwen3.5-9B |
|---|---|---|
| Peticiones ordinarias retenidas respondidas en formato de lectura | 0 de 328 | no aplica |
| Nombra una palabra visible en closer look (245 imagenes sin datos personales) | 50 | 226 |
| Nombra una palabra visible en long look (mismas 245) | 97 | no disponible |
| Nombra el texto al preguntar directamente (245 imagenes) | 0,91 | 0,91 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18-20 GB para el modelo base de 9B, mas overhead del adaptador y del procesador de vision.
- GPU recomendadas: A100 40GB, H100, L40S, RTX A6000. Para consumer, RTX 4090 (24 GB) es suficiente en bfloat16.
- Cabe en GPU consumer de gama alta: RTX 4090, RTX 3090 (24 GB). En GPUs de 16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: el autor documenta carga via `transformers` 5 + `peft` 0.18 con `AutoModelForMultimodalLM` y `PeftModel`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor especifica decodificacion greedy y thinking desactivado, lo que reduce la longitud de salida respecto a un modo de razonamiento extendido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Lucia v1.2 9B (este) | 9B (LoRA) | no disponible | apache-2.0 | Lectura visual estructurada con cadena de pasos |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible | VLM generalista multimodal |
| Lucia 4B v1.2 | 4B (LoRA) | no disponible | no disponible | Misma receta y datos a escala 4B |
| Lucia 9B v1.1 | 9B (LoRA) | no disponible | no disponible | Version anterior, 9.261 filas, dos pasadas |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta entrenamiento ni evaluacion en otros idiomas.
- El autor advierte que un system prompt no visto en entrenamiento provoca sobreescritura del formato: debe ejecutarse sin system prompt.
- El thinking debe desactivarse manualmente (el 9B piensa por defecto) y la decodificacion debe ser greedy para reproducir el comportamiento entrenado.
- El modelo omite sistematicamente el lettering de las imagenes en la lectura por defecto: nombra palabras visibles en 50 de 245 casos frente a 226 del base. Solo recupera ese rendimiento cuando se le pregunta directamente por el texto.
- Riesgo de alucinacion en los pasos de interpretacion (`mood`, `mean`, `intend`, `story`), que son inferencias y no hechos de la imagen; el propio formato los distingue de los `[record]`.
- Sesgos no documentados: no se han publicado evaluaciones de sesgo demografico, cultural o de genero.
- La licencia Apache 2.0 del adaptador no cubre necesariamente los derechos de las imagenes de entrenamiento; el autor excluyo filas de COCO 2017 bajo otras licencias y mantiene una version no comercial separada para las filas con imagenes CC BY-NC-SA 4.0.
- Requiere versiones concretas de librerias (transformers 5, peft 0.18+), lo que puede limitar la compatibilidad con stacks existentes.
- El repositorio tiene 241 descargas y 0 likes: validacion externa practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Version 4B: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Version no comercial: https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image-nc
- Dataset de recaptioned: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Release 5 del dataset: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Imagen de ejemplo COCO 2017 (376084): https://cocodataset.org/#explore?id=376084
