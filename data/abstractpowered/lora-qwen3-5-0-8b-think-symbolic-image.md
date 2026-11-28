# AbstractPowered/lora-qwen3.5-0.8b-think-symbolic-image

## Resumen

Lucia 0.8B v1.2 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por AbstractPowered, especializado en la lectura estructurada de imagenes. El modelo recibe una fotografia o ilustracion y genera una "lectura" de la misma: una cadena de pensamientos en lenguaje llano con un paso nombrado por linea, seguida de los textos que adoptarian una caption, un prompt, etiquetas y una critica por profundidad, y finalmente las preguntas que un observador cuidadoso plantearia con sus respuestas y la evidencia que las sustenta.

Es el miembro mas pequeno de la familia Lucia y reproduce la receta de Lucia 4B v1.2 a escala 0.8B. Se entreno sobre 91,138 filas (frente a las 20,836 de la version 1), en una sola pasada de 10,137 pasos, con un segundo objetivo que mantiene las respuestas del modelo cerca de las del base en peticiones ordinarias, de modo que el adaptador cambia el comportamiento principalmente cuando se le pide una lectura. La relevancia actual reside en su formato de salida altamente estructurado y en su capacidad de generar cadenas de razonamiento visual con preguntas y respuestas verificables, algo poco habitual en adaptadores de este tamano.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors compatible con PEFT, y esta pensado para ingles. El repositorio ocupa aproximadamente 0.1 GB, lo que refleja que unicamente contiene los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.5-0.8B tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | peft (requiere transformers 5 y peft 0.18 o superior) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | ~0.1 GB |
| Datasets de entrenamiento | AbstractPhil/thought-symbolic-image-recaptioned, AbstractPhil/thought-symbolic-image-captions |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3.5-0.8B, un transformer multimodal de 0.8 mil millones de parametros. El adaptador no modifica la arquitectura del base, sino que anade matrices de bajo rango entrenadas para inducir un formato de salida especifico. El entrenamiento se realizo en una sola pasada sobre 91,138 filas (10,137 pasos), en contraste con las 20,836 filas y dos pasadas de la version 1. Las filas provienen de la parte Apache-2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95,481 filas en total), menos 3,718 filas de fotografias COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas cuyas imagenes no estan disponibles en ningun repositorio. Las lecturas cubren fotografias de DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revision ciega; 30,250 de ellas son "long looks". Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados con filas de Claude.

La innovacion tecnica principal es un segundo objetivo de entrenamiento que mantiene las elecciones de siguiente palabra del adaptador cerca de las del Qwen3.5-0.8B original en peticiones ordinarias. Esto preserva el comportamiento general del base y limita el cambio al modo "lectura". En la evaluacion sobre peticiones ordinarias reservadas, el modelo se mantiene cerca del base y no responde ninguna de las preguntas ni peticiones de texto en el formato de lectura, mientras que la version 1 (sin este objetivo) respondia 267 de 328 de esa forma. El formato de cadena de pensamientos utiliza un vocabulario cerrado de pasos en orden: `see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`. Una mirada rapida contiene 1-2 pensamientos, una mirada cercana 3-5 y una larga 6-10. Las preguntas terminan en `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`.

## Capacidades

- Generacion de cadenas de pensamiento visuales estructuradas, con un paso nombrado por linea segun un vocabulario cerrado de 16 pasos.
- Descripcion de imagenes en multiples formatos de salida: caption, prompt, etiquetas (tags) y critica por profundidad.
- Generacion de preguntas y respuestas sobre la imagen, clasificadas por procedencia de la evidencia (`[record]`, `[chain]`, `[unknown]`).
- Tres niveles de profundidad de analisis: mirada rapida (1-2 pensamientos), cercana (3-5) y larga (6-10).
- Lectura de texto presente en la imagen (lettering): de 245 imagenes reservadas con rotulos sin nombres propios ni creditos, el modelo nombra una palabra visible en 61 casos en mirada cercana y en 103 en mirada larga, frente a 13 del modelo base.
- Capacidad de responder directamente a la pregunta sobre que dice el rotulo con una precision comparable al base (0.84 frente a 0.82 en 214 de 245 casos).
- Procesamiento de fotografias (DOCCI, COCO 2017), obras de arte y especificaciones dibujadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (la cadena de pensamientos es de un solo turno, no agentica).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: modo de pensamiento estructurado ("think"), lectura de imagenes con multiples objetivos de salida.

## Casos de uso

- Catalogacion y descripcion de imagenes en archivos fotograficos: el modelo genera caption, prompt y etiquetas normalizadas para cada imagen, lo que permite poblar metadatos estructurados de forma automatica y con un formato predecible.
- Generacion de prompts para modelos de difusion: la linea `prompt` produce descripciones concisas y reutilizables como entrada para generadores de imagen, con un estilo aprendido de las filas de entrenamiento.
- Auditoria de contenido visual con preguntas verificables: las preguntas terminadas en `[record]` y `[chain]` permiten construir flujos de verificacion donde cada afirmacion se clasifica por su procedencia (hecho de la imagen o deduccion de la cadena).
- Analisis de obras de arte y patrimonio cultural: el entrenamiento incluye obras de la National Gallery of Art, por lo que el modelo puede generar lecturas por capas (forma, luz, color, tono, significado) utiles en catalogacion museistica.
- Lectura de rotulos y texto en imagen: util para extraer palabras visibles en fotografias, con la advertencia de que la precision es limitada y comparable al modelo base en la tarea directa.
- Evaluacion de la calidad descriptiva de imagenes: la critica por profundidad permite contrastar descripciones generadas por otros sistemas contra una referencia estructurada.
- Prototipado de asistentes de vision en ingles sobre hardware modesto: al ser un adaptador de 0.8B, puede ejecutarse en GPUs de consumo, lo que facilita experimentacion rapida con el formato de lectura.
- Generacion de especificaciones dibujadas: el modelo fue entrenado tambien con especificaciones dibujadas (sin imagen asociada), lo que permite generar lecturas de disenos tecnicos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son los relativos a la preservacion del modelo base y a la lectura de rotulos, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Evaluacion | Resultado |
|---|---|
| Peticiones ordinarias reservadas respondidas en formato de lectura | 0 de 328 (version 1: 267 de 328) |
| Imagenes con rotulo sin nombre/credito/URL (de 300) | 245 identificadas por el filtro |
| Nombra una palabra visible en mirada cercana (de 245) | 61 (modelo base: 13) |
| Nombra una palabra visible en mirada larga (de 245) | 103 |
| Precision al responder directamente que dice el rotulo (de 245) | 0.84 (modelo base: 0.82) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa ~0.1 GB; el modelo base Qwen3.5-0.8B requiere aproximadamente 1.6 GB en fp16 y alrededor de 0.5-1 GB en cuantizacion de 4 bits (estimacion segun el tamano del base; no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para el base en cuantizacion; RTX 3060, RTX 4060, RTX 4090 para inferencia comoda; A100/H100 para despliegue a escala.
- Cabe en GPU de consumo: si, dado el tamano de 0.8B del modelo base.
- Opciones de despliegue: se requiere transformers 5 y peft 0.18 o superior; el adaptador puede combinarse con el base y servirse mediante vLLM, TGI o llama.cpp tras fusionar los pesos (la fusion no se detalla en la informacion disponible).
- Configuracion de inferencia recomendada: pensamiento desactivado en el sentido de no anadir turno de sistema, decodificacion greedy, sin prompt de sistema (el formato se aprende en las filas; un turno de sistema no visto en entrenamiento provoca sobreescritura).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lucia 0.8B v1.2 (este) | 0.8B (base) + LoRA | no disponible | apache-2.0 | Lectura estructurada de imagenes con cadena de pensamientos | Hugging Face (adaptador PEFT) |
| Lucia 4B v1.2 | 4B (base) + LoRA | no disponible | no disponible en la informacion | Misma receta a mayor escala | Hugging Face (AbstractPhil/qwen3.5-4b-think-symbolic-image) |
| Lucia 0.8B v1 | 0.8B (base) + LoRA | no disponible | apache-2.0 | Version anterior, sin objetivo de preservacion del base | Hugging Face (tag lucia-v1) |
| Qwen3.5-0.8B (base) | 0.8B | no disponible | no disponible en la informacion | Modelo multimodal generalista | Hugging Face (Qwen/Qwen3.5-0.8B) |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; las salidas en otros idiomas no estan garantizadas.
- Riesgo de alucinacion en la lectura de rotulos: en mirada cercana solo nombra una palabra visible en 61 de 245 imagenes, y en mirada larga en 103 de 245; la precision al responder directamente sobre el texto es comparable al modelo base (0.84 frente a 0.82), no superior.
- El formato de salida es rigido y aprendido: un turno de sistema no visto durante el entrenamiento provoca sobreescritura del formato.
- Requiere pensamiento desactivado y decodificacion greedy; otras configuraciones pueden degradar la calidad de la lectura.
- Dependencia de versiones concretas: transformers 5 y peft 0.18 o superior.
- El adaptador no incluye el modelo base; es necesario descargar Qwen/Qwen3.5-0.8B por separado.
- Las filas de entrenamiento excluyen 3,718 imagenes COCO 2017 bajo otras licencias y 16 imagenes no disponibles, lo que limita la cobertura a imagenes con licencia Attribution o sin restricciones conocidas.
- El modelo es un adaptador de utilidad, no un asistente general: su comportamiento fuera del modo lectura se mantiene cerca del base, pero no se documentan capacidades generales adicionales.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, no detallada en la informacion disponible.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPowered/lora-qwen3.5-0.8b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Registro de investigacion: https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image
- Manifiestos y hashes de la release: https://huggingface.co/datasets/AbstractPowered/manifests
- Dataset thought-symbolic-image-recaptioned (release 5): https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Dataset thought-symbolic-image-captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Lucia 4B v1.2: https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Organizacion AbstractPowered: https://huggingface.co/AbstractPowered
- Ejemplo de imagen COCO 2017 citada: https://cocodataset.org/#explore?id=376084
