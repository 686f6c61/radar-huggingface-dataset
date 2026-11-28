# AbstractPowered/lora-qwen3.5-9b-think-symbolic-image

## Resumen

Lucia v1.2 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por AbstractPowered, que convierte un modelo de lenguaje de 9.000 millones de parametros en un sistema de lectura estructurada de imagenes. El adaptador no genera descripciones libres, sino una "lectura" formalizada de cada imagen: una cadena de pensamientos en lenguaje llano con un paso nombrado por linea (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de los textos que adoptarian una leyenda, un prompt, etiquetas y una critica por niveles de profundidad, y finalmente las preguntas que un observador cuidadoso aun se plantearia, cada una con su respuesta y su justificacion.

La relevancia de esta version radica en la escala del entrenamiento: se entreno sobre 91.138 filas (frente a las 9.261 de la version 1.1), en un unico pase de 10.137 pasos, reutilizando la receta y las filas de Lucia 4B v1.2. Las lecturas de entrenamiento fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revision ciega, sin que ninguna fila proceda de un modelo Claude. Ademas, se anadio un segundo objetivo de entrenamiento que mantiene las elecciones de siguiente palabra del adaptador cerca de las del Qwen3.5-9B original en peticiones ordinarias, de modo que el adaptador modifica el comportamiento principalmente cuando se le pide una lectura.

El modelo se distribuye como adaptador PEFT (no como pesos completos), con licencia Apache 2.0 y soporte unicamente para ingles. Su proposito es utility: producir anotaciones de imagen ricas, estructuradas y auditables para fotografia, arte y especificaciones dibujadas, mas que mantener conversaciones generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-9B (vision-language, image-text-to-text) |
| Parametros totales | 9.000 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); libreria peft |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Version | lucia-v1.2 (etiquetas adicionales: lucia-v1.1, lucia-v1, legacy-e-all-2ep) |
| Fecha de publicacion | 2026-11-28 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer multimodal de 9.000 millones de parametros, mediante LoRA (PEFT). La innovacion principal no esta en la arquitectura sino en el formato de salida y en el regimen de entrenamiento. El modelo fue entrenado con 91.138 filas en un solo pase (10.137 pasos), frente a las 9.261 filas y dos pases (2.102 pasos) de la version 1.1. Las filas provienen de la parte Apache 2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95.481 filas), menos 3.718 filas de fotografias COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas cuyas imagenes no estan disponibles en ningun repositorio. Las lecturas cubren fotografias de DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas; 30.250 de ellas son "long looks".

El entrenamiento incorpora un segundo objetivo que ancla las probabilidades de siguiente token del adaptador a las del Qwen3.5-9B base en peticiones ordinarias que el modelo original respondio por si mismo. El efecto medido: en peticiones ordinarias reservadas, el adaptador se mantiene cerca del base y no responde ninguna de las preguntas ni peticiones de texto en el formato de lectura, mientras que la version 1 (entrenada sin este objetivo) respondia 157 de 328 de esa forma. El modelo ve la imagen de cada fila que trata sobre una imagen (las especificaciones dibujadas no tienen imagen asociada). Las fotografias COCO 2017 empleadas son solo aquellas con licencia Attribution de sus autores de Flickr o sin restricciones de copyright conocidas.

## Capacidades

- Lectura estructurada de imagenes: genera una cadena de pensamientos con pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), de 1-2 pasos en una mirada rapida, 3-5 en una mirada cercana y 6-10 en una mirada larga.
- Generacion de leyendas (caption), prompts, etiquetas (tags) y criticas por niveles de profundidad para una misma imagen.
- Formulacion de preguntas de seguimiento con respuesta y justificacion, clasificadas como [record] (hecho de la imagen), [chain] (deducido por la cadena) o [unknown].
- Descripcion de fotografia, arte (National Gallery of Art) y especificaciones dibujadas.
- Respuesta directa sobre el texto incrustado en la imagen (lettering) cuando se le pregunta explicitamente.
- Capacidades generales heredadas de Qwen3.5-9B en peticiones ordinarias (proximas al modelo base gracias al objetivo de anclaje).
- Capacidades de vision y texto a texto (pipeline image-text-to-text), con soporte conversacional.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico mas alla de la cadena de lectura.

## Casos de uso

- Anotacion de datasets de imagen a escala: el modelo genera leyendas, prompts y etiquetas en un formato fijo y parseable, lo que permite construir corpus de entrenamiento para modelos text-to-image o de captioning con estructura consistente y auditable.
- Catalogacion de patrimonio artistico: sobre obras de la National Gallery of Art, produce lecturas por niveles (mood, mean, intend, story) utiles para fichas de museo, audioguias o metadatos enriquecidos.
- Descripcion de accesibilidad: genera descripciones alternativas detalladas y preguntas-respuesta sobre el contenido de una imagen, aprovechables en herramientas de alt-text para personas con discapacidad visual.
- Analisis forense o documental de fotografia: la cadena see/relate/place/count y las preguntas con respuesta permiten verificar afirmaciones sobre una imagen y distinguir hechos registrados de inferencias.
- Extraccion de texto en imagen bajo demanda: cuando se pregunta directamente por el lettering, el modelo lo nombra con una tasa comparable a la del modelo base, util para indexacion de carteles, senalizacion o documentos escaneados.
- Generacion de prompts para sintesis de imagen: la linea prompt y las etiquetas sirven como entrada directa a pipelines text-to-image, con un vocabulario controlado por el formato de lectura.
- Evaluacion de modelos de vision: las lecturas estructuradas y las preguntas con justificacion constituyen un banco de pruebas para medir coherencia visual y trazabilidad de inferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente metricas internas de evaluacion cualitativa y de comportamiento:

| Metrica | Resultado |
|---|---|
| Filas de entrenamiento | 91.138 (frente a 9.261 en v1.1) |
| Pasos de entrenamiento | 10.137 (un pase) |
| Peticiones ordinarias reservadas respondidas en formato de lectura | 0 (v1: 157 de 328) |
| Imagenes reservadas con lettering sin nombre, credito o URL (de 300) | 245 |
| De esas 245, la mirada cercana nombra una palabra visible | 50 (base: 226; mirada larga: 97) |
| De esas 245, respuesta directa sobre el lettering coincide con el base | 234 (0,91 frente a 0,91) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre Qwen3.5-9B, los requisitos vienen determinados por el modelo base (aproximadamente 18-20 GB en fp16 para 9.000 millones de parametros, menos con cuantizacion).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, cabria esperar A100, H100 o RTX 4090 para fp16, y GPUs consumer de 24 GB o menos con cuantizacion.
- Cabe en GPU consumer: probable con cuantizacion (no confirmado en la documentacion).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen3.5-9B y aplicar el adaptador; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lucia v1.2 (este) | 9B (base) + LoRA | no disponible | apache-2.0 | Lectura estructurada de imagen | Hugging Face (adaptador) |
| Lucia 4B v1.2 | 4B (base) + LoRA | no disponible | no disponible | Misma receta a menor escala | Hugging Face (AbstractPhil) |
| qwen3.5-9b-think-symbolic-image-nc | 9B (base) + LoRA | no disponible | CC BY-NC-SA 4.0 | Version 1.1 no comercial | Hugging Face (AbstractPhil) |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | Modelo base multimodal generalista | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura multilingue.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar Qwen3.5-9B y aplicar los pesos LoRA.
- Riesgo de alucinacion en las preguntas marcadas como [record] o [chain]: la propia taxonomia del modelo distingue hechos de inferencias, pero no garantiza su correccion.
- El lettering se omite deliberadamente en la mirada cercana (nombra una palabra visible solo en 50 de 245 casos frente a 226 del base), lo que puede degradar tareas de OCR u descripcion de texto si no se pregunta explicitamente.
- Las fotografias COCO 2017 usadas en entrenamiento se limitan a las de licencia Attribution o sin copyright conocido; el resto de imagenes COCO no estan cubiertas.
- El modelo fue entrenado sin filas escritas por modelos Claude ni por modelos del proyecto entrenados sobre filas de Claude; esto puede introducir un sesgo estilistico respecto a otros corpus.
- No se documentan capacidades de tool calling, agentes ni contexto largo; no debe asumirse su disponibilidad.
- La licencia Apache 2.0 se aplica al adaptador; deben verificarse las condiciones del modelo base Qwen3.5-9B para uso comercial.
- Tamano de repositorio de 0,3 GB, coherente con un adaptador LoRA, no con pesos completos.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/AbstractPowered/lora-qwen3.5-9b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de investigacion: https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image
- Manifiestos (hashes y licencia): https://huggingface.co/datasets/AbstractPowered/manifests
- Dataset thought-symbolic-image-recaptioned: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Release 5 del dataset: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Dataset thought-symbolic-image-captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Lucia 4B v1.2: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Version no comercial: https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image-nc
- Organizacion AbstractPowered: https://huggingface.co/AbstractPowered
