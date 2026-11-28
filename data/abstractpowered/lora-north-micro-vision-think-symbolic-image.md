# AbstractPowered/lora-north-micro-vision-think-symbolic-image

## Resumen

North-Micro-Vision v1.2 "think symbolic image" es un adaptador LoRA publicado por AbstractPowered sobre el modelo de vision-lenguaje CohereLabs/North-Micro-Vision-Instruct, un modelo de 2.500 millones de parametros que combina un codificador visual SigLIP 2 de 0,4B con un modelo de lenguaje de 2B y 28 capas. El adaptador no busca mejorar la capacidad general del modelo base, sino especializarlo en una tarea concreta: dada una imagen, producir una "lectura" estructurada que incluye una cadena breve de pensamientos en lenguaje llano, una serie de formulaciones (caption, prompt, etiquetas, critica por profundidad) y las preguntas que un observador cuidadoso aun se plantearia, cada una con su respuesta y el criterio que la resuelve.

La relevancia de esta ficha es doble. Por un lado, muestra una receta de ajuste fino deliberadamente conservadora: se entrena con mas de 91.000 filas (frente a las 20.836 de la version 1) en una sola pasada (10.137 pasos) y se incorpora un segundo objetivo que mantiene las respuestas del adaptador cerca de las del modelo base en peticiones ordinarias, de modo que el adaptador cambia el comportamiento solo cuando se le pide una lectura. Por otro, documenta de forma inusualmente explicita el origen y la licencia de los datos de entrenamiento, incluyendo la exclusion de filas sobre fotografias COCO 2017 con licencias incompatibles y de cualquier fila generada por modelos Claude.

El adaptador tiene un tamano de repositorio de 0,2 GB, se distribuye en formato PEFT/safetensors bajo licencia Apache 2.0 y solo declara soporte para ingles. Su interes practico esta en pipelines de anotacion visual estructurada, generacion de metadatos para catalogos de imagenes y prototipado de razonamiento visual con trazas auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un modelo vision-lenguaje transformer: codificador visual SigLIP 2 de 0,4B a resolucion nativa + modelo de lenguaje de 2B con 28 capas |
| Parametros totales | 2.500 millones en el modelo base; el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos PEFT en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es North-Micro-Vision-Instruct de Cohere Labs: un codificador visual SigLIP 2 de 0,4B reentrenado a resolucion nativa, acoplado a un modelo de lenguaje de 2B con 28 capas. Sobre esa base, AbstractPowered entrena un adaptador LoRA con la misma receta que aplico a Lucia v1.2 (Qwen3.5-9B) y Ulisse v1.2 (Gemma 4), evaluando despues sobre los mismos conjuntos de validacion retenidos. El entrenamiento usa 91.138 filas (frente a 20.836 de la version 1) en una sola pasada de 10.137 pasos, con tasa de aprendizaje 2e-4, la misma de la version 1.

Los datos proceden de la parte Apache 2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95.481 filas), menos 3.718 filas de fotografias COCO 2017 con otras licencias, 609 filas correspondientes a las imagenes retenidas para evaluacion y 16 filas cuyas imagenes no estan disponibles en ningun repositorio. Las lecturas cubren fotografias DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revision ciega; 30.250 son "long looks". Ninguna fila fue generada por un modelo Claude ni por modelos del proyecto entrenados con filas de Claude.

La innovacion tecnica principal es el segundo objetivo de entrenamiento: se recopilaron 493 peticiones ordinarias redactadas con voz de usuario por Qwen3.5-9B y Qwen3.5-4B, filtradas por reglas, y se anadieron sus respuestas generadas por el propio North-Micro-Vision-Instruct, de modo que el adaptador se mantiene proximo a las elecciones de siguiente palabra del modelo base en peticiones que no son lecturas. En el conjunto retenido de peticiones ordinarias, el adaptador no responde ninguna pregunta ni peticion de texto en el formato de lectura, mientras que la version 1, entrenada sin este objetivo, lo hace en 2 de 238 casos.

## Capacidades

- Generacion de lecturas estructuradas de imagenes: cadena de pensamientos en lenguaje llano con un paso nombrado por linea, seguida de caption, prompt, etiquetas y critica por profundidad.
- Generacion de preguntas de seguimiento sobre la imagen, cada una con su respuesta y el criterio que la resuelve (por ejemplo, "thing colour -> yellow [record]" o "form balance -> unknown [unknown]").
- Cadena de pensamiento explicita y auditable, con marcas de procedencia del dato ([record] frente a [unknown]).
- Descripcion de fotografias, obras de arte y especificaciones dibujadas.
- Generacion de prompts y etiquetas reutilizables para pipelines de difusion o catalogacion.
- Capacidades heredadas del modelo base de vision-lenguaje en peticiones ordinarias, preservadas deliberadamente mediante el segundo objetivo de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; la cadena de pensamiento es de un solo turno.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de vision: si; audio: no disponible.

## Casos de uso

- Catalogacion de fondos fotograficos: el adaptador genera caption, etiquetas y prompt de una imagen en una sola pasada, lo que permite poblar metadatos de archivos DOCCI o COCO sin intervencion manual y con un formato estable entre imagenes.
- Documentacion de obras de arte: para piezas de la National Gallery of Art, el modelo produce una lectura con capas de profundidad (caption, critica) util para fichas de museo o audioguias preliminares que luego revisa un documentador.
- Generacion de prompts para modelos de difusion: la linea "prompt" de cada lectura es directamente reutilizable como entrada de un generador texto-a-imagen, lo que facilita crear pares imagen-prompt a partir de un corpus visual existente.
- Control de calidad de anotaciones: al incluir preguntas con respuesta y criterio, la salida permite detectar que atributos de la imagen quedan sin resolver ([unknown]) y priorizar la revision humana sobre esos casos concretos.
- Prototipado de razonamiento visual auditable: la traza "see / relate / mood / caption / prompt / tags / question" es un formato fijo que se puede parsear y registrar en logs, util para experimentos de interpretabilidad o para construir conjuntos de evaluacion de modelos de vision.
- Asistencia a fotografia y edicion: la lectura de una fotografia (relaciones espaciales, estado, atmosfera) sirve como borrador de pieza descriptiva o como base para sugerir recortes y encuadres alternativos.
- Extraccion de especificaciones dibujadas: el modelo fue entrenado tambien con especificaciones dibujadas sin imagen asociada, por lo que puede producir lecturas de bocetos tecnicos y diagramas en el mismo formato estructurado.
- Clasificacion y filtrado previo en pipelines de datos: al mantenerse cerca del modelo base en peticiones ordinarias, el mismo adaptador puede usarse para tareas genericas de vision-lenguaje y, en la misma sesion, para solicitar lecturas estructuradas cuando se necesiten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card aporta unicamente metricas internas de evaluacion sobre conjuntos retenidos:

| Metrica | Resultado |
|---|---|
| Filas de entrenamiento | 91.138 (version 1: 20.836) |
| Pasos de entrenamiento | 10.137 en una sola pasada (version 1: 2.724 en dos pasadas) |
| Tasa de aprendizaje | 2e-4 |
| Peticiones ordinarias retenidas respondidas en formato de lectura | 0 de 238 (version 1: 2 de 238) |
| Imagenes retenidas con rotulacion legible sin nombre, credito ni URL | 245 de 300 |
| De esas 245, la "closer look" nombra una palabra visible | 52 (modelo base: 111; "long look": 99) |
| Pregunta directa sobre el texto rotulado, coincidencia con el modelo base | 0,81 frente a 0,82 en 243 de 245 imagenes |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.500 millones de parametros en el modelo base, una carga en FP16 ronda los 5 GB de pesos mas el coste del codificador visual y del contexto, y en cuantizacion de 8 bits o 4 bits (si se aplica al modelo base, no documentada para este adaptador) se reduce aproximadamente a la mitad o a un cuarto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo base es apto para GPUs de consumo con suficiente VRAM; no se confirma compatibilidad con modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque la model card no lo verifica ni indica cuantizaciones probadas.
- Opciones de despliegue: la libreria declarada es PEFT; el adaptador requiere cargar CohereLabs/North-Micro-Vision-Instruct y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbstractPowered/lora-north-micro-vision-think-symbolic-image | 2,5B (base) + adaptador LoRA | no disponible | Lectura estructurada de imagenes con cadena de pensamiento | Apache 2.0 | Hugging Face, formato PEFT |
| CohereLabs/North-Micro-Vision-Instruct | 2,5B (0,4B vision + 2B lenguaje) | no disponible | Vision-lenguaje instructivo general | no disponible en la informacion | Hugging Face |
| AbstractPhil/qwen3.5-9b-think-symbolic-image (Lucia v1.2) | 9B (base) | no disponible | Misma tarea de lectura simbolica sobre Qwen3.5 | no disponible en la informacion | Hugging Face |
| AbstractPhil/ulisse-12b-think-symbolic-image (Ulisse v1.2) | 12B (base) | no disponible | Misma tarea de lectura simbolica sobre Gemma 4 | no disponible en la informacion | Hugging Face |

La comparacion directa con Lucia v1.2 y Ulisse v1.2 es la mas informativa: comparten receta, filas de entrenamiento y conjuntos de evaluacion, y se diferencian en el modelo base (2,5B frente a 9B y 12B) y, por tanto, en coste de inferencia y capacidad general.

## Limitaciones y advertencias

- Solo ingles declarado: las lecturas y las respuestas del modelo base estan orientadas a texto en ingles, sin soporte multilingue documentado.
- Riesgo de alucinacion en la descripcion visual: la propia model card muestra un ejemplo en el que la lectura no menciona dos camiones amarillos adicionales visibles en la fotografia, lo que indica omisiones y posibles descripciones incompletas.
- Rendimiento inferior al modelo base en el reconocimiento de rotulacion: en la "closer look", el adaptador nombra una palabra visible en 52 de 245 imagenes frente a 111 del modelo base, aunque en la "long look" sube a 99 y en pregunta directa se iguala (0,81 frente a 0,82).
- Sesgos conocidos: no documentados de forma explicita; el dataset de entrenamiento esta compuesto por lecturas generadas por modelos de OpenAI, Google y DeepSeek, con la composicion y los sesgos que ello pueda introducir.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial debe verificar tambien la licencia del modelo base CohereLabs/North-Micro-Vision-Instruct, no indicada en la informacion disponible; ademas, parte del corpus de entrenamiento original (fotografias COCO 2017) fue excluida por licencias incompatibles, lo que conviene tener en cuenta al redistribuir derivados.
- Trazabilidad de datos: el adaptador fue entrenado sin filas generadas por Claude ni por modelos del proyecto entrenados con filas de Claude, una restriccion que puede afectar a la comparabilidad con otros adaptadores de la misma familia.
- Formato de salida fijo: el adaptador esta disenado para producir lecturas con una estructura concreta; usarlo fuera de ese formato puede degradar la calidad o producir salidas mezcladas, aunque el segundo objetivo de entrenamiento mitiga ese riesgo en peticiones ordinarias.
- Uso en produccion: no hay datos de latencia, throughput ni cuantizaciones probadas, por lo que el despliegue requiere una evaluacion propia antes de asumir costes o rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPowered/lora-north-micro-vision-think-symbolic-image
- Modelo base: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Registro de investigacion del autor: https://huggingface.co/AbstractPhil/north-micro-vision-think-symbolic-image
- Manifiestos, hashes y licencia de la release: https://huggingface.co/datasets/AbstractPowered/manifests
- Dataset de entrenamiento (release 5): https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Receta equivalente sobre Qwen3.5-9B (Lucia v1.2): https://huggingface.co/AbstractPhil/qwen3.5-9b-think-symbolic-image
- Perfil del autor: https://huggingface.co/AbstractPowered
