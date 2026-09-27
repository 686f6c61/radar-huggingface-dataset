# pockettravel/qwen3.5-2b-travel-it-GGUF

## Resumen

qwen3.5-2b-travel-it-GGUF es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario pockettravel para la aplicacion Android Pocket Travel. Su proposito no es ser un chatbot generalista, sino un asistente de viaje que funciona completamente offline en un telefono: responde en italiano, en un maximo de tres frases, utilizando unicamente el CONTEXTO de guia turistica que el propio prompt le proporciona, y declara explicitamente cuando ese contexto no contiene la respuesta. El modelo base pertenece a la familia Qwen3.5, que es un modelo con modo de razonamiento (thinking) y capacidad de lectura de imagenes; el ajuste desactiva el thinking durante el entrenamiento.

El modelo resultante tiene 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y se distribuye en un unico archivo GGUF cuantizado a Q4_K_M con importance matrix, de 1215 MiB. El autor recomienda ejecutarlo con llama.cpp con una ventana de contexto de 8192 tokens, que es la configuracion que emplea la aplicacion. La relevancia de esta ficha radica en que ilustra un patron muy concreto de IA en el borde (edge AI): un modelo pequeno, cuantizado, especializado en una tarea de generacion aumentada por recuperacion (RAG) sobre guias Wikivoyage, y disenado para rechazar preguntas fuera de alcance en lugar de alucinar.

El repositorio no incluye el proyector de vision, por lo que, pese a que el modelo base puede procesar imagenes, esta version es exclusivamente de texto. La licencia de los pesos es CC BY-SA 4.0, heredada de los datos de entrenamiento (Wikivoyage y Wikipedia en italiano), mientras que el modelo base se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen/Qwen3.5-2B; no se detallan capas ni atencion en la informacion disponible) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | 8192 tokens en la configuracion recomendada por el autor (`llama.cpp -c 8192`); longitud nativa maxima del modelo base: no disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix) calibrada sobre 400 prompts de entrenamiento; unico archivo publicado (`qwen3.5-2b-travel-it-Q4_K_M.gguf`, 1215 MiB) |
| Idiomas soportados | Italiano e ingles (responde siempre en italiano; las preguntas en ingles reciben respuesta en italiano) |
| Licencia | CC BY-SA 4.0 para los pesos ajustados; el modelo base es Apache-2.0 (texto incluido en `LICENSE-base-model`) |
| Formato de pesos | GGUF (para llama.cpp); no se publican safetensors del ajuste |
| Tamano del repositorio | 1,3 GB |
| Modalidad | Solo texto (convertido sin proyector de vision, sin `mmproj`) |
| Modelo base | Qwen/Qwen3.5-2B (relacion: finetune) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-2B, un transformer decoder-only con modo de razonamiento (thinking) y capacidad multimodal de entrada de imagenes en su version original. Sobre esos pesos se aplico un ajuste fino con LoRA de 16 bits mediante Unsloth, que posteriormente se fusiono en los pesos base. El entrenamiento consistio en una unica epoca y la funcion de perdida se calculo unicamente sobre los tokens de la respuesta, no sobre el prompt. Como Qwen3.5 es un modelo de razonamiento, el thinking se desactivo durante el entrenamiento (`enable_thinking=False`, con bloque `<think></think>` vacio en el prompt), de modo que el modelo debe ejecutarse con el thinking desactivado.

Los datos de entrenamiento son 7.317 pares sinteticos de pregunta y respuesta construidos a partir de Wikivoyage en italiano y de Wikipedia en italiano (articulos de pais sobre cocina, cultura, telecomunicaciones y medios). Aproximadamente una cuarta parte de los ejemplos son de rechazo, es decir, casos en los que la respuesta correcta consiste en indicar que el contexto no contiene la informacion. Algunas preguntas estan en ingles. Los contextos se formatearon imitando los de la aplicacion: entre una y tres secciones, con secciones distractoras y hasta 2000 caracteres. Tras la fusion del LoRA, la cuantizacion a Q4_K_M se realizo con `llama-quantize` empleando una importance matrix calibrada sobre 400 prompts de entrenamiento. No se menciona el uso de RLHF ni de DPO en la informacion disponible.

## Capacidades

- Generacion de texto en italiano con respuestas limitadas a un maximo de tres frases, en formato de guia turistica.
- Respuesta aumentada por recuperacion (RAG): responde exclusivamente a partir de las secciones de guia incluidas en el bloque CONTEXTO del prompt.
- Rechazo explicito: cuando el contexto no contiene la informacion, lo indica de forma reconocible en lugar de inventar una respuesta.
- Manejo de contextos con secciones distractoras (hasta tres secciones y 2000 caracteres).
- Comprension de preguntas formuladas en ingles, aunque la respuesta se emite siempre en italiano.
- Ejecucion offline en dispositivo movil como caracteristica de diseno principal.
- Soporte del chat template de Qwen con el parametro `enable_thinking` desactivable.
- No dispone de tool calling ni de function calling documentados.
- No dispone de capacidades de vision en esta version (sin proyector `mmproj`).
- No dispone de modo thinking operativo: el entrenamiento lo desactivo y el autor recomienda ejecutarlo con thinking desactivado.

## Casos de uso

- Asistente de viaje offline en Android: es el caso de uso principal y el motivo de existir del modelo. La aplicacion Pocket Travel busca la guia Wikivoyage descargada de una region mediante SQLite FTS, inserta de una a tres secciones en el prompt y consulta al modelo, todo sin conexion de red.
- Consultas factuales sobre destinos a partir de guia local: el modelo responde sobre cocina, cultura, telecomunicaciones, horarios o requisitos presentes en el texto de la guia, citando solo lo que el contexto contiene.
- Mitigacion de alucinaciones en produccion: con una tasa de rechazo del 100% ante preguntas fuera de tema y del 98% ante preguntas parafraseadas cuyo tema falta en el contexto, es adecuado para escenarios donde una respuesta inventada es mas costosa que no responder.
- Integracion en pipelines RAG existentes: al aceptar un formato de prompt explicito con bloques CONTEXTO y DOMANDA, puede insertarse en sistemas de recuperacion ya construidos sin reentrenamiento adicional.
- Aplicaciones de turismo con presupuesto de hardware minimo: al ocupar 1215 MiB en Q4_K_M y requerir unos 8 GB de RAM de dispositivo, encaja en telefonos de gama media y en dispositivos sin GPU dedicada.
- Despliegue en kioscos o dispositivos embebidos sin conectividad: al ejecutarse con llama.cpp, puede correr en mini-PC, Raspberry Pi de gama alta o terminales de informacion turistica en ubicaciones sin red.
- Prototipado rapido de asistentes verticales: sirve como plantilla metodologica (LoRA + datos sinteticos + ejemplos de rechazo + imatrix) para reproducir el patron en otros dominios documentales.
- Traduccion indirecta italiano-ingles: aunque no es su funcion, puede responder preguntas en ingles con salida en italiano, util para un turista angloparlante que consume contenido italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica una evaluacion de tasas de rechazo sobre un conjunto de test reservado de 361 preguntas escritas a mano, sobre 11 regiones nunca vistas durante el entrenamiento y con formulaciones distintas de las plantillas de entrenamiento. La evaluacion del GGUF se realizo con llama.cpp. Un rechazo se define como cualquier respuesta reconocible del tipo "el contexto no lo dice" en los primeros 200 caracteres.

| Metrica | Este modelo | Modelo base (Unsloth UD-Q4_K_XL) |
|---|---|---|
| Rechaza cuando el contexto no tiene informacion util | 100% | 88% |
| Rechaza preguntas fuera de tema | 100% | 66% |
| Rechaza preguntas parafraseadas cuyo tema falta en el contexto | 98% | 8% |
| Rechaza erroneamente preguntas parafraseadas que si tienen respuesta | 6% | 1% |

El modelo base se ejecuto con el mismo prompt; segun el autor, rara vez emplea la frase de rechazo exacta con la que se entreno este ajuste.

## Requisitos de hardware

- Vram estimada para inferencia: los pesos en Q4_K_M ocupan 1215 MiB; sumando la cache KV para 8192 tokens de contexto en un modelo de 1,88 mil millones de parametros, el consumo total se situa aproximadamente entre 1,5 y 2,5 GB (estimacion no publicada por el autor).
- El autor indica 8 GB de RAM de dispositivo como requisito sugerido para el archivo Q4_K_M.
- Cabe en cualquier GPU de consumo: tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 o superiores) pueden alojarlo integramente.
- Funciona en CPU sin GPU, que es el escenario objetivo en Android, aunque el throughput depende del SoC.
- Opciones de despliegue: llama.cpp (`llama-server`), y por formato GGUF tambien Ollama o cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI, que no consumen GGUF de forma nativa.
- Comando de referencia del autor: `llama-server -m qwen3.5-2b-travel-it-Q4_K_M.gguf -c 8192 --chat-template-kwargs '{"enable_thinking": false}'`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3.5-2b-travel-it-GGUF | 1,88 mil millones | 8192 tokens en la configuracion de la app | GGUF Q4_K_M con imatrix (1215 MiB) | CC BY-SA 4.0 | Asistente de viaje offline con RAG y rechazo explicito |
| Qwen/Qwen3.5-2B (base) | 1,88 mil millones | No disponible | Safetensors y cuantizaciones de terceros (por ejemplo, Unsloth UD-Q4_K_XL) | Apache-2.0 | Modelo generalista multimodal con thinking |
| Otras alternativas de ~2B en GGUF | No disponible | No disponible | GGUF | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa disponible se limita al modelo base y a las tasas de rechazo del apartado de benchmarks. No hay datos publicados que permitan comparar este ajuste con otros modelos especializados en turismo o en RAG de ~2B.

## Limitaciones y advertencias

- La calidad y vigencia de las respuestas dependen exclusivamente del texto de guia incluido en el contexto; precios, horarios, requisitos de entrada e informacion de seguridad deben verificarse en fuentes oficiales antes de viajar.
- Entrenado para responder en italiano: las preguntas en ingles reciben respuesta en italiano.
- Puede reproducir frases de las guias de origen de forma literal, lo que condiciona la licencia de los pesos.
- El modelo no debe usarse como chatbot general ni como fuente de conocimiento: sin contexto, su comportamiento previsto es rechazar la pregunta.
- Solo texto: no incorpora el proyector de vision del modelo base, por lo que no procesa imagenes.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso con agentes.
- Riesgo de falso rechazo: un 6% de preguntas parafraseadas que si tenian respuesta fueron rechazadas incorrectamente en la evaluacion del autor.
- Restriccion de licencia: los pesos se distribuyen bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y de compartir bajo la misma licencia en obras derivadas; conviene revisar la implicacion para uso comercial. El listado completo de paginas fuente (titulo, URL y licencia) esta en `ATTRIBUTION.tsv`.
- No se incluye contenido de Viaggiare Sicuri (Farnesina).
- Sesgos conocidos: no documentados en la informacion disponible, aunque al derivar de Wikivoyage y Wikipedia en italiano hereda los sesgos de cobertura de esas fuentes.
- Fecha de publicacion en los metadatos de HuggingFace: 2026-09-27; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pockettravel/qwen3.5-2b-travel-it-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Aplicacion Pocket Travel (GitHub): https://github.com/miracle091/pocket-travel
- Wikivoyage (fuente de datos de entrenamiento): https://www.wikivoyage.org
- Wikipedia en italiano (fuente de datos de entrenamiento): https://it.wikipedia.org
