# KW-KI/gemma-3-12b-it-law-fine-tuned-Q4_K_M-GGUF

## Resumen

El modelo `KW-KI/gemma-3-12b-it-law-fine-tuned-Q4_K_M-GGUF` es una version cuantizada en formato GGUF del fine-tune legal `DomainLLM/gemma-3-12b-it-law-fine-tuned`, que a su vez parte de `google/gemma-3-12b-it`. La publicacion la firma el usuario KW-KI y no el autor del fine-tune original: se trata, por tanto, de una conversion de terceros generada con el espacio `gguf-my-repo` de ggml.ai y con llama.cpp. El resultado es un unico fichero de 7,3 GB en cuantizacion Q4_K_M, listo para ejecutarse en llama.cpp, llama-server u otras herramientas compatibles con GGUF.

El modelo cuenta con 11 766 034 176 parametros (unos 11,77 B) y esta especializado en derecho aleman, segun los metadatos de la model card (`language: de`, etiquetas `legal`, `law`, `german-law`, `domain-specific`). Se desconoce la composicion exacta del corpus juridico utilizado en el ajuste, asi como si el entrenamiento original aplico RLHF, DPO u otra tecnica de alineacion, ya que la model card publicada se limita a describir el proceso de conversion a GGUF.

Su relevancia practica es la de poner un modelo de 12 B especializado en dominio juridico aleman al alcance de hardware de consumo: gracias a la cuantizacion Q4_K_M, el fichero ocupa 7,3 GB y puede ejecutarse en GPU con 8-12 GB de VRAM o incluso en CPU. Como contrapartida, el repositorio no aporta ningun dato de evaluacion, no declara la longitud de contexto soportada y acumula cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que su calidad real en tareas juridicas no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3; el autor de la conversion no documenta modificaciones estructurales |
| Parametros totales | 11 766 034 176 (≈11,77 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (la model card no la especifica ni para el modelo base ni para la conversion GGUF) |
| Tipos de cuantizacion | Q4_K_M; el repositorio solo publica el fichero `gemma-3-12b-it-law-fine-tuned-q4_k_m.gguf` |
| Idiomas soportados | Aleman (`de`) declarado en los metadatos; el modelo base Gemma 3 es multilingue, pero el fine-tune esta orientado a aleman |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | GGUF (este repositorio); el modelo del que deriva se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Gemma 3 12B: un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, disenado por Google DeepMind. El fine-tune `DomainLLM/gemma-3-12b-it-law-fine-tuned` se construyo, segun las etiquetas del repositorio, mediante LoRA sobre la variante instruct (`gemma-3-12b-it`) y posterior fusion de los adaptadores en los pesos base (`lora`, `merged`). El dominio declarado es el derecho aleman, aunque la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset juridico, la mezcla de datos generales para evitar olvido catastrofico ni el metodo de alineacion empleado.

Sobre ese modelo, KW-KI ha aplicado una conversion de formato sin reentrenamiento: el pipeline `gguf-my-repo` de ggml.ai convierte los pesos safetensors a GGUF y aplica la cuantizacion Q4_K_M. No se ha publicado informacion sobre calibracion, imatrix ni sobre el impacto de la cuantizacion en tareas juridicas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking) mas alla de las capacidades heredadas del modelo base Gemma 3 instruct.

## Capacidades

- Generacion de texto conversacional en aleman, con especializacion declarada en terminologia y razonamiento juridico.
- Redaccion y resumen de documentos legales en el contexto del derecho aleman (contratos, escritos, correspondencia).
- Explicacion de conceptos juridicos y respuesta a preguntas sobre normativa, siempre con el riesgo de alucinacion propio de un modelo de 12 B cuantizado.
- Hereda del modelo base Gemma 3 instruct las capacidades generales de instruccion, aunque no estan documentadas en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision: la familia Gemma 3 incluye variantes multimodales, pero este repositorio no declara soporte de imagen.
- Capacidades de audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Revision de contratos en aleman: el modelo puede identificar clausulas potencialmente lesivas, resumir obligaciones de las partes y senalar plazos o condiciones suspensivas, como primer filtro antes de la revision de un abogado.
- Asistencia en redaccion de escritos y reclamaciones: generar borradores de cartas de requerimiento, reclamaciones de consumo o comunicaciones con administraciones publicas a partir de un resumen de hechos.
- Consulta de normativa alemana: responder preguntas sobre conceptos de derecho civil (`BGB`), laboral o arrendaticio sirviendo como herramienta de estudio para estudiantes y opositores, con validacion obligatoria de las citas.
- Extraccion de informacion estructurada de expedientes: procesar contratos, notificaciones o resoluciones y devolver campos normalizados (partes, fechas, cuantias, plazos) para alimentar un sistema de gestion documental.
- Triaje de consultas juridicas: clasificar automaticamente las consultas entrantes de un despacho o de un servicio de atencion legal y derivarlas al area correspondiente, reduciendo el tiempo de asignacion.
- Soporte a la traduccion tecnica juridica: usar el modelo como apoyo para trasladar terminologia juridica alemana a otros idiomas, aceptando la variante cuantizada por su bajo coste de despliegue en local.
- Despliegue on-premise en entornos con confidencialidad estricta: al ser un GGUF ejecutable con llama.cpp sobre hardware modesto y sin llamadas a APIs externas, permite procesar documentacion sensible sin salir de la infraestructura propia.
- Generacion de material de formacion interno: elaborar resumenes, casos practicos y preguntas de autoevaluacion sobre normativa alemana para equipos de compliance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de conjuntos especificos de dominio juridico aleman, y tampoco se aporta comparacion con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 7,5 GB con la cuantizacion Q4_K_M publicada (fichero de 7,3 GB), a lo que hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada con `-c`.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080 y RTX 4090 (16-24 GB). En GPU de 8 GB o menos no cabe el modelo completo y habria que recurrir a offload parcial a CPU, con la consiguiente perdida de velocidad.
- GPU de datacenter: A100, H100 y L40S pueden ejecutarlo sin dificultad, aunque para 11,77 B en Q4_K_M resultan sobredimensionadas salvo que se necesite mucho paralelismo.
- Ejecucion en CPU: viable con llama.cpp; en Apple Silicon con memoria unificada (16 GB o mas) el rendimiento es aceptable para uso interactivo. Si no se especifica el numero de hilos, llama.cpp los ajusta por defecto.
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp son los caminos documentados por el autor. El GGUF tambien es importable en Ollama y LM Studio, y utilizable desde `llama-cpp-python`. vLLM y TGI no son opciones recomendadas para este repositorio, ya que su soporte de GGUF es limitado o inexistente.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| KW-KI/gemma-3-12b-it-law-fine-tuned-Q4_K_M-GGUF | 11,77 B | no disponible | GGUF, Q4_K_M (7,3 GB) | Gemma | no disponibles |
| DomainLLM/gemma-3-12b-it-law-fine-tuned | 11,77 B | no disponible | safetensors (modelo de origen) | Gemma | no disponibles |
| google/gemma-3-12b-it | 11,77 B | no disponible en esta ficha | safetensors; requiere cuantizacion aparte | Gemma | no disponibles en esta ficha |
| Alternativas de la misma categoria (modelos legales en aleman de tamano similar) | no disponible | no disponible | no disponible | no disponible | no disponibles |

No se dispone de datos que permitan una comparacion cuantitativa fiable: ni el repositorio de la conversion ni el del fine-tune publican resultados de evaluacion, y la busqueda web realizada no ha devuelto informacion relacionada con el modelo.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado en un dominio de alta exigencia: el modelo puede citar articulos, sentencias o plazos legales inexistentes. Toda salida debe verificarse contra fuentes oficiales antes de cualquier uso profesional.
- Ausencia total de evaluaciones: no hay benchmarks de dominio juridico ni comparacion con el modelo sin cuantizar, por lo que no puede determinarse si el ajuste legal mejora o degrada el rendimiento general.
- Cuantizacion Q4_K_M: la perdida de precision respecto a los pesos en safetensors no ha sido medida por el autor en tareas juridicas, donde la exactitud terminologica es critica.
- Longitud de contexto desconocida: al no declararse la ventana soportada, no es posible planificar el procesamiento de expedientes largos sin hacer pruebas previas. Conviene validar el comportamiento con la longitud real que se vaya a usar.
- Idioma: el modelo esta orientado al aleman. Su rendimiento en castellano no esta garantizado y no se ha documentado.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de uso de Google Gemma, que imponen obligaciones de cumplimiento (aceptacion de la politica de uso prohibido, redistribucion de los terminos y atribucion). Es responsabilidad del integrador revisar dichos terminos antes de un despliegue en produccion.
- Conversion no oficial: el repositorio lo publica un tercero (KW-KI) y no el autor del fine-tune ni Google. No hay garantia de que la conversion reproduzca fielmente el comportamiento del modelo original.
- Trazabilidad limitada: cero descargas y cero valoraciones en el momento de redactar la ficha, sin historial de issues ni validacion por parte de la comunidad.
- Nulo valor como asesoramiento juridico: la salida del modelo no constituye asesoramiento legal y no puede sustituir la revision por un profesional habilitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KW-KI/gemma-3-12b-it-law-fine-tuned-Q4_K_M-GGUF
- Modelo de origen (fine-tune legal): https://huggingface.co/DomainLLM/gemma-3-12b-it-law-fine-tuned
- Modelo base de la familia: https://huggingface.co/google/gemma-3-12b-it
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Nota sobre la busqueda web: los resultados proporcionados no guardan relacion con el modelo (hacen referencia a la unidad kilovatio y a la marca KW suspensions), por lo que no se incluyen como enlaces relevantes.
