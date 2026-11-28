# AbstractPowered/lora-glm-4.6v-flash-think-symbolic-image

## Resumen

GLM-4.6V-Flash v1.2 think symbolic image es un adaptador LoRA publicado por AbstractPowered sobre el modelo vision-language zai-org/GLM-4.6V-Flash de Zhipu AI. El adaptador especializa el modelo base para una tarea muy concreta: dada una imagen, producir una "lectura" estructurada que combina una cadena de pensamientos en lenguaje llano, varias formulaciones alternativas del contenido visual (caption, prompt, tags, critica por profundidad) y un conjunto de preguntas que un observador cuidadoso se haria, cada una con su respuesta y la evidencia que la sostiene. No es un modelo generalista, sino una utilidad de anotacion y recaptioning orientada a fotografia y material grafico documental.

El modelo base GLM-4.6V-Flash es un vision-language de aproximadamente 10.000 millones de parametros, compuesto por un codificador visual GLM-4V de 24 capas y el modelo de lenguaje GLM-4-9B de 40 capas. El adaptador se entreno sobre 91.138 filas procedentes del dataset thought-symbolic-image-recaptioned (lecturas de fotografias DOCCI y COCO 2017, imagenes de la National Gallery of Art y especificaciones dibujadas), generadas por modelos de OpenAI, Google y DeepSeek y filtradas mediante revision a ciegas. La version 1.2 introduce un segundo objetivo de entrenamiento que mantiene al adaptador cerca del comportamiento del modelo base en peticiones ordinarias, de modo que solo cambia la respuesta cuando se le pide explicitamente una lectura.

La relevancia actual del modelo reside en su enfoque: un adaptador pequeno (0,4 GB en el repositorio) que anade una capa de razonamiento visual estructurado y auditable sobre un VLM ya existente, con licencia MIT y pesos en safetensors compatibles con PEFT. Resulta util para pipelines de anotacion de imagenes donde se necesita no solo una descripcion, sino tambien justificacion, preguntas de verificacion y metadatos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre GLM-4.6V-Flash: codificador visual GLM-4V de 24 capas + LLM GLM-4-9B de 40 capas |
| Parametros totales | No disponible para el adaptador; el modelo base ronda los 10.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre el VLM GLM-4.6V-Flash, que combina un encoder visual de 24 capas con el LLM GLM-4-9B de 40 capas. El entrenamiento utilizo 91.138 filas del dataset thought-symbolic-image-recaptioned (release 5, rama Apache-2.0), de las cuales 30.250 son "long looks" o lecturas extendidas. Las filas excluyen 3.718 imagenes de COCO 2017 bajo otras licencias, 609 imagenes reservadas para evaluacion y 16 sin almacen disponible. Las lecturas fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas por revision a ciegas; ninguna fila procede de modelos Claude.

El entrenamiento se realizo en una sola pasada sobre las filas (10.137 pasos), frente a las dos pasadas de la version 1 (2.724 pasos), con una tasa de aprendizaje de 2e-4. La innovacion principal de la version 1.2 es un segundo objetivo que ancla las elecciones de siguiente token del adaptador a las del modelo base en peticiones ordinarias: 417 peticiones de texto escritas con voz de usuario por Qwen3.5-9B y Qwen3.5-4B, filtradas por reglas y respondidas por GLM-4.6V-Flash. El resultado es que el adaptador modifica el comportamiento solo cuando se solicita una lectura; en peticiones ordinarias retenidas, ninguna de las 235 preguntas y peticiones de texto se responde en el formato de lectura, frente a 232 de 235 en la version 1. Ademas, se aplico un filtro sobre el reconocimiento de lettering: de 245 imagenes retenidas sin nombres, creditos ni direcciones web legibles, el "closer look" del adaptador nombra una palabra visible en 59 casos, frente a 211 del modelo base, mientras que al preguntarle directamente que dice el texto su precision es comparable a la del base (0,89 frente a 0,87).

## Capacidades

- Generacion de lecturas estructuradas de imagenes: cadena de pensamientos linea a linea, caption, prompt, tags y critica por profundidad.
- Formulacion de preguntas de verificacion con respuesta y evidencia ("question: ... -> ... [record|unknown]").
- Image captioning y recaptioning de fotografias, con enfasis en composicion espacial y relaciones entre objetos.
- Descripcion de obras de arte y material documental (National Gallery of Art, especificaciones dibujadas).
- Razonamiento visual encadenado (chain-of-thought) sobre el contenido de la imagen.
- Conversacion multimodal image-text-to-text (pipeline declarado).
- Capacidad de mantener el comportamiento del modelo base en peticiones de texto ordinarias gracias al objetivo de anclaje.
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Anotacion y recaptioning de datasets de imagen: el adaptador genera captions, tags y prompts alternativos a partir de una fotografia, lo que permite enriquecer datasets de entrenamiento con multiples formulaciones por imagen y relaciones espaciales explicitas.
- Catalogacion de patrimonio artistico: para imagenes de museos y galerias, produce una lectura con descripcion, critica por profundidad y preguntas de verificacion que un documentalista puede revisar, aprovechando el entrenamiento sobre material de la National Gallery of Art.
- Generacion de prompts para modelos generativos: la salida incluye un campo "prompt" con la composicion descrita, util para alimentar pipelines de text-to-image a partir de una imagen de referencia.
- Control de calidad de descripciones automaticas: las preguntas con respuesta y evidencia permiten auditar si una caption cubre los elementos relevantes de la imagen, lo que sirve en revision de pipelines de vision.
- Analisis de composicion fotografica: la cadena de pensamientos separa "see", "relate" y "mood", lo que facilita tareas de analisis de encuadre, relaciones espaciales y tono en fotografia.
- Investigacion en razonamiento visual: al mantener el modelo base casi intacto en peticiones ordinarias, es adecuado como banco de pruebas para estudiar como un adaptador pequeno anade una habilidad estructurada sin degradar el comportamiento general.
- Procesamiento de especificaciones dibujadas: el entrenamiento incluye dibujos tecnicos sin imagen asociada, lo que permite generar lecturas de diagramas y bocetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas internas de comportamiento (anclaje al modelo base, reconocimiento de lettering) descritas en la seccion de arquitectura y entrenamiento, pero no tablas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas estandar.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB; el modelo base GLM-4.6V-Flash (~10.000 millones de parametros) debe cargarse aparte y determina los requisitos reales.
- VRAM estimada para el modelo base en precision completa (FP16/BF16): aproximadamente 20 GB, mas overhead de activaciones y del encoder visual.
- VRAM estimada con cuantizacion de 8 bits: en torno a 10-12 GB; con 4 bits, en torno a 6-8 GB (estimaciones orientativas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; GPUs consumer de 12-16 GB con cuantizacion de 4 bits.
- Despliegue: al ser un adaptador PEFT, se carga con la libreria peft sobre el modelo base; opciones habituales para el base incluyen vLLM, TGI, llama.cpp y Ollama, aunque la compatibilidad del adaptador con cada backend no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.6V-Flash v1.2 think symbolic image (este) | ~10.000 M (base) + LoRA | No disponible | Lectura visual estructurada con CoT y preguntas | MIT | Hugging Face (adaptador PEFT) |
| zai-org/GLM-4.6V-Flash | ~10.000 M | No disponible | VLM generalista | No disponible en la informacion | Hugging Face |
| AbstractPhil/qwen3.5-9b-think-symbolic-image (Lucia v1.2) | ~9.000 M | No disponible | Misma receta de lectura sobre Qwen3.5 | No disponible en la informacion | Hugging Face |
| AbstractPhil/glm-4.6v-flash-think-symbolic-image (registro de investigacion) | ~10.000 M (base) | No disponible | Versiones anteriores y cuadernos del mismo proyecto | No disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion en detalles finos: el ejemplo de la model card muestra que la lectura cuenta "One" camion amarillo cuando hay al menos tres, y confunde una pickup con un coche.
- El reconocimiento de lettering es deliberadamente conservador en el "closer look" (nombra una palabra visible en 59 de 245 casos frente a 211 del base), lo que puede omitir texto relevante si no se pregunta directamente.
- El adaptador esta disenado para responder en formato de lectura solo cuando se le pide; usarlo fuera de ese formato puede dar resultados menos fiables que el modelo base.
- Restricciones de licencia: el adaptador es MIT, pero el uso comercial depende tambien de la licencia del modelo base GLM-4.6V-Flash y de los datasets de entrenamiento (parte Apache-2.0, parte con otras licencias excluidas).
- El dataset de entrenamiento excluye imagenes COCO bajo licencias restrictivas; el modelo no fue entrenado con esas imagenes, lo que puede generar un sesgo de cobertura.
- No se documentan evaluaciones estandar de sesgo, toxicidad o robustez.
- Sin benchmarks publicos que permitan comparar su rendimiento con alternativas de forma objetiva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto de investigacion reciente, sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPowered/lora-glm-4.6v-flash-think-symbolic-image
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Registro de investigacion: https://huggingface.co/AbstractPhil/glm-4.6v-flash-think-symbolic-image
- Manifiestos y hashes de la release: https://huggingface.co/datasets/AbstractPowered/manifests
- Dataset de recaptioning: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Modelo hermano Lucia v1.2 (Qwen3.5): https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image
- Organizacion AbstractPowered: https://huggingface.co/AbstractPowered
