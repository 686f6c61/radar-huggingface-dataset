# ApolloRaines/Speedmark-Phi4-mini

## Resumen

Speedmark-Phi4-mini es una edicion de pesos del modelo microsoft/Phi-4-mini-instruct publicada por el usuario ApolloRaines. No es un fine-tuning ni un modelo entrenado desde cero: parte de los pesos del Phi-4-mini-instruct original (3.836.021.760 parametros, ~3,84 B) y aplica una edicion quirurgica sobre ellos para eliminar la verbosidad inducida por RLHF. La tecnica empleada es jBlaze, una herramienta de "neural programming" que extrae direcciones de comportamiento de los pesos mediante analisis de activaciones contrastivas y aplica ediciones dirigidas a capas concretas, segun el autor, solo dos capas.

El problema que aborda es concreto: los modelos instruidos modernos tienden a producir relleno (frases de cortesia, reformulaciones, listas innecesarias) que consume tokens y tiempo de reloj sin aportar informacion. El autor reporta una reduccion del 35,7 % en tokens generados y del 36,5 % en tiempo total sobre una bateria propia de 8 preguntas, manteniendo la tasa de generacion practicamente identica (52,8 tok/s en el modelo original frente a 53,5 tok/s en Speedmark). Es decir, la ganancia de velocidad no proviene de un decodificador mas rapido, sino de generar menos tokens.

Su relevancia ahora es mas metodologica que de rendimiento: demuestra que se puede modificar un comportamiento aprendido por RLHF sin datos de entrenamiento, sin bucle de gradientes y con un unico forward pass para extraer la direccion de comportamiento. El contrapeso es que la evidencia publicada es muy limitada: 8 preguntas de prueba, cero descargas y cero likes en el momento de esta ficha, sin benchmarks estandar ni replicacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Phi-4-mini (tag `phi3` en la configuracion); pesos editados sobre el modelo base |
| Parametros totales | 3.836.021.760 (~3,84 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No declarada en la model card de Speedmark; el modelo base microsoft/Phi-4-mini-instruct declara 128 000 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Tamano del repositorio | 7,7 GB |
| Metodo de creacion | Edicion directa de pesos con jBlaze (sin entrenamiento, sin dataset, sin descenso de gradiente) |
| Capas editadas | 2 (segun el autor) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-4-mini-instruct: un transformer decoder-only denso de ~3,84 B de parametros con atencion causal, pensado para generacion de texto y conversacion con plantilla de chat propia. Speedmark no modifica esa topologia ni el tokenizador: el repositorio contiene pesos en safetensors con la misma estructura, de modo que se carga con `AutoModelForCausalLM.from_pretrained` sin cambios en el codigo de inferencia. El autor indica que la etiqueta de arquitectura en la configuracion es `phi3`, consistente con la familia Phi-3/Phi-4 de Microsoft.

Lo relevante es que no hay entrenamiento. jBlaze extrae direcciones de comportamiento a partir de los propios pesos mediante analisis de activaciones contrastivas y despues aplica ediciones dirigidas en capas especificas; el autor afirma que solo se editaron dos capas y que el unico coste de computo es un forward pass para la extraccion de direcciones. No se usaron datos de entrenamiento, ni RLHF, ni DPO, ni ajuste supervisado adicional. El efecto perseguido es eliminar la verbosidad aprendida durante el RLHF del modelo original, no anadir conocimiento nuevo. Como consecuencia, cualquier capacidad del modelo base (razonamiento, codigo, matematicas, function calling) se conserva en teoria intacta, pero tampoco ha sido revalidada por el autor de forma sistematica.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno, heredadas de microsoft/Phi-4-mini-instruct.
- Respuestas mas concisas: la edicion de pesos reduce el relleno en preguntas explicativas, que es donde el autor reporta las mayores ganancias (hasta un 85 % menos de tokens en la pregunta sobre recursion, y un 45 % en la de la lluvia).
- Razonamiento y generacion de codigo: presentes por herencia del modelo base, aunque el propio autor senala que estas tareas "resisten la compresion" porque su contenido es sustancia y no relleno.
- Soporte de tool calling / function calling: no verificado en Speedmark. El modelo base lo soporta, pero la model card no publica ninguna prueba al respecto.
- Soporte de agentes y razonamiento multi-paso: no verificado en Speedmark.
- Capacidades multilingues: limitadas al ingles segun el tag de idioma del repositorio, pese a que el modelo base maneja mas idiomas.
- Sin modo de razonamiento explicito (thinking mode), sin vision ni audio.
- Uso como objeto de estudio para investigacion en edicion de pesos y control de comportamiento sin reentrenamiento.

## Casos de uso

- Asistentes conversacionales de atencion al cliente: el modelo mantiene el conocimiento factual del base pero responde en menos tokens, lo que reduce el coste por conversacion y el tiempo hasta el primer fragmento completo de respuesta. Es adecuado cuando la metrica critica es latencia percibida y no exhaustividad.
- Generacion de resumenes y respuestas para pipelines de RAG: al heredar la ventana de contexto larga del Phi-4-mini-instruct, permite concatenar varios fragmentos recuperados y producir una respuesta breve, minimizando la factura de tokens de salida.
- Integracion en asistentes de voz: respuestas de 20 a 60 tokens en lugar de 150 a 200 reducen directamente el tiempo de sintesis de voz posterior, lo que mejora la sensacion de fluidez en un canal donde la latencia domina la experiencia.
- Clasificacion, etiquetado y extraccion de entidades con salida corta: tareas en las que el relleno es puro desperdicio de tokens y donde el modelo puede devolver JSON o etiquetas de forma directa.
- Experimentacion en investigacion sobre edicion de pesos: sirve como caso de referencia reproducible para estudiar si las direcciones de comportamiento extraidas con jBlaze generalizan a otras tareas, idiomas o modelos.
- Prototipado rapido en local sobre GPU de consumo: con 3,84 B de parametros cabe en GPUs de gama media y en cuantizacion de 4 bits incluso en equipos modestos, lo que lo hace util para demos y entornos de desarrollo sin acceso a clúster.
- Evaluacion comparativa de verbosidad: util como linea base en estudios que midan el impacto del RLHF en la longitud de las respuestas, comparando contra el Phi-4-mini-instruct sin editar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica una prueba propia sobre 8 preguntas que cubren recuerdo factual, razonamiento, generacion de codigo y explicacion, comparando el modelo original con la version editada:

| Metrica | Phi-4-mini original | Speedmark | Variacion |
|---|---|---|---|
| Tokens totales | 935 | 601 | -35,7 % |
| Tiempo total | 17,72 s | 11,24 s | -36,5 % |
| Tiempo medio por respuesta | 2,21 s | 1,41 s | -36,2 % |
| Tasa de generacion | 52,8 tok/s | 53,5 tok/s | Sin cambios relevantes |

Desglose por pregunta publicado en la model card:

| Pregunta | Tokens original | Tokens Speedmark | Tiempo original | Tiempo Speedmark |
|---|---|---|---|---|
| Que causa la lluvia | 200 | 111 | 3,72 s | 2,06 s |
| Por que el cielo es azul | 171 | 99 | 3,24 s | 1,86 s |
| Que es la recursion en programacion | 200 | 29 | 3,71 s | 0,54 s |
| Cual es la capital de Francia | 68 | 81 | 1,26 s | 1,52 s |
| Cuanto es 2+2 | 23 | 36 | 0,69 s | 0,67 s |

Advertencia metodologica: son cifras generadas por el propio autor, con 8 preguntas, sin semilla ni hardware de prueba especificados, sin intervalo de confianza y sin evaluacion de calidad de las respuestas mas alla de comprobar que son correctas. No constituyen una validacion independiente. Nótese ademas que en dos de las cinco comparaciones detalladas la respuesta editada es igual o mas larga que la original, lo que el autor atribuye a una reformulacion de la frase sin reduccion de contenido.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan aproximadamente 7,7 GB, por lo que se recomienda un minimo de 10-12 GB de VRAM contando cache KV y overhead del runtime.
- VRAM en cuantizacion de 8 bits: en torno a 4-5 GB, viable en GPUs de 8 GB.
- VRAM en cuantizacion de 4 bits: en torno a 2,2-3 GB, viable en GPUs de 6-8 GB. Es una estimacion a partir del numero de parametros, no un dato publicado por el autor.
- GPUs profesionales recomendadas: A100, H100, L40S, A10G o L4 para despliegue en servidor.
- GPUs de consumo compatibles: RTX 4090, 4080, 4070 Ti y 4070 en bf16; RTX 3060 12 GB, 4060 Ti 16 GB y 4060 8 GB en 8 y 4 bits. El modelo cabe en una unica GPU de consumo en todos los casos.
- Opciones de despliegue: Hugging Face Transformers (es el unico metodo documentado por el autor, con `apply_chat_template` y `model.generate`), vLLM o TGI para servido con batching, y llama.cpp u Ollama solo si se convierte previamente a GGUF, ya que el repositorio no publica cuantizaciones.
- Throughput declarado: 53,5 tok/s en la prueba del autor, practicamente identico al del modelo base. El hardware empleado no se especifica en la informacion disponible.
- Latencia declarada: 1,41 s de media por respuesta frente a 2,21 s del modelo original en la misma prueba de 8 preguntas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos publicados |
|---|---|---|---|---|---|
| Speedmark-Phi4-mini | ~3,84 B | No declarado (el base declara 128 000 tokens) | Edicion de pesos para reducir verbosidad | MIT | safetensors |
| microsoft/Phi-4-mini-instruct | ~3,84 B | 128 000 tokens | Modelo instructivo generalista de Microsoft | MIT | safetensors |
| Llama-3.2-3B-Instruct | ~3,21 B | 128 000 tokens | Modelo instructivo generalista de Meta | Llama 3.2 Community License | safetensors, GGUF (de terceros) |
| Qwen2.5-3B-Instruct | ~3,09 B | 32 768 tokens, extensible con YaRN | Modelo instructivo generalista de Alibaba | No verificada en la informacion disponible | safetensors, GGUF (de terceros) |

Speedmark no compite en capacidad bruta contra estos modelos, ya que no anade conocimiento ni mejora tareas: es el mismo Phi-4-mini-instruct con una capa de concision aplicada. Frente a los otros dos alternativas de ~3 B, la diferencia practica es la licencia MIT (mas permisiva que la de Llama 3.2) y la ausencia de cuantizaciones oficiales. No se han publicado comparaciones directas de calidad de respuesta entre Speedmark y ninguno de estos modelos.

## Limitaciones y advertencias

- Evidencia empirica minima: la validacion se reduce a 8 preguntas elegidas por el autor, sin benchmarks estandar, sin evaluacion de calidad formal y sin replicacion externa.
- Cero descargas y cero likes en el momento de redactar esta ficha: no existe validacion por parte de la comunidad.
- Sesgos: el modelo hereda integramente los sesgos del corpus de entrenamiento de Phi-4-mini-instruct, ya que la edicion de pesos no modifica el conocimiento almacenado.
- Riesgo de alucinacion: identico al del modelo base, sin que la edicion de pesos lo reduzca. Una respuesta mas corta puede ademas ocultar incertidumbre y resultar mas dificil de auditar.
- Comportamiento no uniforme: en la propia prueba del autor, la respuesta sobre la capital de Francia es mas larga en la version editada que en el original, lo que indica que el efecto de la edicion no es monotono ni predecible por tipo de pregunta.
- Tareas de razonamiento: el autor reconoce que los problemas matematicos y la logica multi-paso pueden producir respuestas mas largas porque el modelo compensa la edicion, aunque la seccion de limitaciones de la model card esta truncada en la informacion disponible y no se detalla el alcance completo del problema.
- Idioma: solo ingles segun el tag del repositorio. No hay evidencia de que el comportamiento multilingue del base se conserve tras la edicion.
- Licencia MIT sobre una obra derivada: la licencia del modelo base (Phi-4-mini-instruct, tambien MIT) permite el uso comercial, pero conviene verificar que la edicion de pesos no introduce obligaciones adicionales derivadas de jBlaze, cuya licencia de uso no se detalla en la informacion disponible.
- Sin cuantizaciones oficiales: cualquier despliegue en 4 u 8 bits exige generar las cuantizaciones por cuenta propia o convertir a GGUF, con el consiguiente riesgo de perdida de calidad no evaluada.
- Efectos colaterales no medidos: la edicion afecta a dos capas del transformer y no se documenta que otras capacidades puedan haberse alterado (seguimiento de instrucciones, formato de salida, respeto de restricciones).
- Fecha de creacion muy reciente y autor individual sin historial verificable de publicaciones, lo que desaconseja su uso en produccion sin una evaluacion propia previa.
- Nominaciones de plantilla: la edicion no modifica el tokenizador ni la plantilla de chat, pero al ser un repositorio derivado conviene usar exactamente la plantilla del modelo base para evitar degradaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Speedmark-Phi4-mini
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Herramienta jBlaze citada por el autor: https://jblaze.dev
- Paper tecnico de la edicion de pesos: no disponible
- Repositorio de codigo de la edicion: no disponible
- Demo publica: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces recuperados eran paginas de farmacologia sin relacion con el contenido.
