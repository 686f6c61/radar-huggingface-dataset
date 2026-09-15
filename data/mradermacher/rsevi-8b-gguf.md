# mradermacher/RsEvi-8B-GGUF

## Resumen

RsEvi-8B-GGUF es el repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo sesko818/RsEvi-8B. Se trata, por tanto, de una redistribución en formato GGUF de un modelo ya existente: no introduce cambios en la arquitectura ni en los pesos originales, sino que los convierte a tipos de cuantización de la familia K-quant e IQ-quant para su uso con llama.cpp y herramientas compatibles. El repositorio tiene 75,3 GB de tamano total porque incluye todas las variantes, desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para el componente multimodal.

El modelo subyacente, RsEvi-8B, es un modelo de vision-lenguaje especializado en teledeteccion (remote sensing). Sus etiquetas declaradas son visual-question-answering, visual-grounding y remote-sensing, y la model card lo vincula a EMNLP 2026. El recuento real de parametros de los pesos safetensors es de 8.190.735.360, es decir, unos 8,19 mil millones, lo que lo situa en la gama de 8B. El unico idioma declarado es el ingles.

La relevancia de esta publicacion es practica: permite ejecutar un VLM de 8B especializado en imagenes de satelite y aereas en hardware de consumo, algo que con los pesos originales en safetensors resulta mas costoso. El repositorio no aporta, sin embargo, informacion sobre arquitectura interna, longitud de contexto, licencia o resultados de evaluacion, datos que no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje segun las etiquetas del repositorio) |
| Parametros totales | 8.190.735.360 (unos 8,19 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0, f16; la model card menciona ademas Q5_K_S, Q5_K_M e IQ4_XS. Ficheros multimodales: mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (mas ficheros mmproj para el codificador visual) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base sesko818/RsEvi-8B en los datos proporcionados. Las etiquetas del repositorio indican que se trata de un modelo de vision-lenguaje orientado a teledeteccion, con tareas declaradas de respuesta a preguntas visuales (visual-question-answering) y localizacion visual (visual-grounding), lo que implica la presencia de un codificador de imagen acoplado a un modelo de lenguaje; los ficheros mmproj confirman ese componente multimodal. No se especifican el tipo de transformer, el numero de capas, la dimension oculta ni si emplea atencion lineal u otras variantes.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo ajuste por instrucciones, RLHF o DPO, ni si se aplicaron tecnicas de decodificacion especulativa. La referencia a EMNLP 2026 en las etiquetas sugiere la existencia de una publicacion asociada, pero no se ha proporcionado su contenido. La contribucion tecnica de este repositorio concreto es la conversion y cuantizacion de los pesos originales a GGUF, con versiones estaticas (no ponderadas ni con matriz de importancia).

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imagenes: el pipeline declarado es visual-question-answering, orientado a imagenes de teledeteccion.
- Localizacion visual (visual-grounding): capacidad declarada de referir regiones u objetos dentro de la imagen.
- Procesamiento de imagenes de satelite y aereas, dado el dominio de especializacion declarado (remote-sensing).
- Generacion de texto conversacional: el repositorio incluye la etiqueta conversational y el pipeline de transformers, por lo que admite interaccion en formato dialogo.
- Capacidad multimodal mediante los ficheros mmproj, necesarios para la parte visual en llama.cpp.
- No hay informacion disponible sobre soporte de tool calling o function calling.
- No hay informacion disponible sobre capacidades de agente o razonamiento multi-paso.
- Cobertura multilingue limitada al ingles segun los metadatos.
- No hay informacion disponible sobre modo de razonamiento explicito, audio u otras modalidades adicionales.

## Casos de uso

- Analisis de imagenes satelitales en local: el modelo puede responder preguntas sobre escenas captadas por satelite sin enviar los datos a un servicio externo, usando las cuantizaciones Q4_K_M o Q6_K en una GPU de consumo.
- Inventario de infraestructura y usos del suelo: a partir de una ortofoto, formular preguntas del tipo "cuantas naves industriales hay en esta zona" o "que tipo de cultivo domina en el sector norte", apoyandose en las capacidades de VQA y grounding declaradas.
- Verificacion de cambios temporales: comparar imagenes de la misma zona en dos fechas y pedir al modelo que describa diferencias visibles, util en seguimiento de obras, deforestacion o expansion urbana.
- Apoyo a respuesta de emergencias: interpretar imagenes aereas de incendios o inundaciones para obtener descripciones rapidas de la extension afectada, desplegando el modelo en un equipo de campo con llama.cpp y una GPU de 12-16 GB.
- Anotacion asistida de datasets geoespaciales: usar las capacidades de grounding para generar propuestas de bounding boxes o descripciones que despues se revisan por personal humano, reduciendo el coste de etiquetado.
- Documentacion tecnica de imagenes: generar descripciones textuales de escenas para informes de teledeteccion o catalogos de imagenes de un archivo.
- Integracion en pipelines de inferencia locales: al estar en GGUF, puede servirse con llama.cpp u Ollama dentro de un flujo automatizado que procese lotes de imagenes por la noche en un solo servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de teledeteccion, y los resultados de la busqueda web proporcionada no contienen datos de evaluacion del modelo.

## Requisitos de hardware

- Los tamanos publicados de cada fichero son: f16 16,5 GB; Q8_0 8,8 GB; Q6_K 6,8 GB; Q4_K_M 5,1 GB; Q4_K_S 4,9 GB; Q3_K_L 4,5 GB; Q3_K_M 4,2 GB; Q3_K_S 3,9 GB; Q2_K 3,4 GB.
- A esos ficheros hay que sumar el componente visual: 1,3 GB para mmproj-f16 o 0,9 GB para mmproj-Q8_0.
- Estimacion de VRAM para inferencia, sumando pesos y mmproj-Q8_0 y dejando margen para la cache KV: alrededor de 18-20 GB en f16, 10-11 GB en Q8_0, 8-9 GB en Q6_K, 6-7 GB en Q4_K_M, 5-6 GB en Q3_K_M y 4,5-5,5 GB en Q2_K. Son estimaciones derivadas de los tamanos de fichero publicados; la cache KV concreta depende de la longitud de contexto, que no esta disponible.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4): permiten Q8_0 y probablemente f16 con contexto moderado.
- GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, A4000): adecuadas para Q4_K_M, Q4_K_S y Q6_K.
- GPU de 8-10 GB (RTX 3060 Ti, RTX 3080, RTX 4060): viables con Q2_K, Q3_K_S o Q3_K_M, con perdida de calidad.
- CPU y Apple Silicon: al ser GGUF, el modelo puede ejecutarse en CPU con llama.cpp y en Macs con memoria unificada suficiente; el rendimiento dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, KoboldCpp y otros servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/RsEvi-8B-GGUF | 8,19 mil millones | GGUF (11 variantes + 2 mmproj) | no disponible | no disponible | HuggingFace, 0 descargas |
| sesko818/RsEvi-8B (base) | 8,19 mil millones | safetensors | no disponible | no disponible | HuggingFace |
| Otros VLM de 8B para teledeteccion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (VLM especializados en teledeteccion de aproximadamente 8B) en los datos proporcionados, por lo que no es posible establecer una comparacion de rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, ni para el repositorio GGUF ni para el modelo base. Conviene contactar con los autores antes de cualquier despliegue en produccion.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que el rendimiento real en tareas de teledeteccion es una incognita.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo geografico, estacional o de sensor.
- Riesgo de alucinacion: inherente a los modelos de vision-lenguaje. En tareas de grounding y conteo de objetos sobre imagenes aereas, un error de localizacion puede pasar desapercibido y tener consecuencias si se usa sin supervision.
- Idioma: solo ingles. Las preguntas o instrucciones en castellano pueden degradar la calidad de la respuesta.
- Dominio restringido: el modelo esta etiquetado como remote-sensing, por lo que su comportamiento fuera de ese dominio (fotografia general, documentos, capturas de pantalla) no esta garantizado.
- Cuantizaciones agresivas: el propio autor marca Q3_K_M como "lower quality" y la grafica enlazada muestra mayor perplejidad en cuantizaciones bajas. Q2_K y Q3_K_S son las opciones con mayor perdida de fidelidad.
- Los ficheros mmproj son imprescindibles para las tareas visuales; usar solo el fichero del modelo de lenguaje dara un modelo incapaz de procesar imagenes.
- Longitud de contexto desconocida: no puede planificarse el procesamiento de escenas que requieran muchas imagenes o dialogos largos.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en comunidad y el soporte disponible.
- Los resultados de la busqueda web proporcionada no contienen informacion tecnica sobre el modelo (solo enlaces a servicios de traduccion), por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RsEvi-8B-GGUF
- Modelo base: https://huggingface.co/sesko818/RsEvi-8B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#RsEvi-8B-GGUF
- Peticiones de cuantizacion y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Publicacion asociada (etiqueta emnlp-2026): no disponible
