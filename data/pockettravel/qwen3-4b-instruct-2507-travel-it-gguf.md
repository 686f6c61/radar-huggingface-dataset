# pockettravel/qwen3-4b-instruct-2507-travel-it-GGUF

## Resumen

qwen3-4b-instruct-2507-travel-it-GGUF es un ajuste fino (fine-tune) por LoRA del modelo Qwen/Qwen3-4B-Instruct-2507, fusionado en los pesos base y cuantizado a GGUF Q4_K_M. Lo publica la organizacion pockettravel como componente del asistente de viaje offline de la aplicacion Android Pocket Travel. No es un modelo de proposito general: esta disenado para responder en italiano, en un maximo de tres frases, usando exclusivamente el CONTEXTO de guia turistica que recibe en el prompt, y para declarar de forma explicita cuando ese contexto no contiene la respuesta.

El problema que resuelve es concreto: permitir respuestas de guia turistica en un telefono sin conexion, alimentadas por un motor de busqueda local (SQLite FTS) sobre guias de Wikivoyage descargadas. La innovacion practica no es arquitectonica, sino de comportamiento: tras el entrenamiento, el modelo rechaza preguntas fuera de tema y parafrasis cuyo tema no aparece en el contexto con tasas del 100%, frente al 94% y el 58% del modelo base con el mismo prompt.

Con 4.022.468.096 parametros (~4,02 mil millones), un unico archivo GGUF de 2382 MiB y licencia CC BY-SA 4.0, es un ejemplo tipico de verticalizacion de un modelo pequeno para una tarea acotada con requisitos estrictos de absteccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507); no se detalla la configuracion de capas ni el tipo de atencion en la informacion disponible |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de referencia de la app (`llama-server -c 8192`); la longitud nativa del modelo base no se indica en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); unico archivo publicado |
| Idiomas soportados | Italiano (idioma de respuesta) e ingles (algunas preguntas de entrenamiento); el modelo esta entrenado para responder en italiano |
| Licencia | CC BY-SA 4.0 (el modelo base se distribuye bajo Apache-2.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.020 millones de parametros y solo texto. Sobre el se aplico un LoRA de 16 bits con Unsloth, fusionado despues en los pesos base, con 1 epoca de entrenamiento y calculo de perdida unicamente sobre los tokens de respuesta. Posteriormente se cuantizo con `llama-quantize` en Q4_K_M usando una importance matrix calibrada con 400 prompts de entrenamiento. La informacion disponible no detalla el numero de tokens totales vistos, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

El dato de entrenamiento consta de 7.317 pares sinteticos de pregunta y respuesta construidos a partir de Wikivoyage en italiano y Wikipedia en italiano (articulos de pais sobre cocina, cultura, telecomunicaciones y medios). Aproximadamente una cuarta parte de los ejemplos son de rechazo, algunas preguntas estan en ingles y los contextos imitan la forma que usa la app: de una a tres secciones, con secciones distractoras, hasta 2000 caracteres. El objetivo de entrenamiento es, por tanto, un comportamiento de respuesta aumentada por recuperacion (RAG) con absteccion calibrada, no la adquisicion de conocimiento factual nuevo.

## Capacidades

- Generacion de texto conversacional en italiano, con respuestas limitadas a un maximo de tres frases.
- Respuesta aumentada por recuperacion (RAG): usa solo las secciones de guia incluidas en el campo CONTEXTO del prompt.
- Absteccion explicita: declara que el contexto no contiene la respuesta cuando la informacion falta.
- Rechazo de preguntas fuera de tema (off-topic) relativas a viajes.
- Interpretacion de preguntas parafraseadas, incluidas formulaciones alejadas de las plantillas de entrenamiento.
- Acepta preguntas en ingles, aunque responde en italiano.
- Inferencia completamente offline sobre llama.cpp con cuantizacion Q4_K_M.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Asistente de viaje offline en Android: integrado en la app Pocket Travel, el modelo recibe de una a tres secciones recuperadas con SQLite FTS sobre la guia Wikivoyage de una region y responde en italiano sin conexion, con 8192 tokens de contexto configurados.
- Recuperacion de informacion turistica en movilidad: consultas sobre cocina, cultura, telecomunicaciones o medios de un pais concreto, con el modelo limitado al texto de guia descargado, lo que evita depender de cobertura de red en el extranjero.
- Sistemas RAG con absteccion obligatoria: su tasa de rechazo del 100% ante parafrasis sin respaldo en el contexto lo hace util como componente de respuesta en pipelines donde una respuesta inventada es mas costosa que un "no lo se".
- Prototipado de verticalizacion por LoRA: sirve como plantilla reproducible (LoRA de 16 bits con Unsloth, fusion, cuantizacion Q4_K_M con imatrix) para adaptar un modelo de 4B a un dominio acotado con pocos miles de ejemplos.
- Evaluacion de calidad de absteccion en RAG: el conjunto de 361 preguntas sobre 11 regiones no vistas en entrenamiento y las metricas de rechazo permiten comparar estrategias de prompting o de recuperacion.
- Asistencia en puntos de informacion turistica italoparlantes: respuestas breves y citables basadas en guias de Wikivoyage para personal de atencion presencial o quioscos digitales.
- Generacion de resumenes de secciones de guia: al estar entrenado con contextos de hasta 2000 caracteres y respuestas de tres frases, es adecuado para condensar fragmentos de guia con distractores.
- Traduccion asistida de consulta ingles a respuesta italiana: acepta la pregunta en ingles y devuelve la respuesta en italiano, util para turistas que consultan en ingles en destinos italoparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. La unica evaluacion publicada es la de comportamiento de rechazo sobre un conjunto de prueba reservado de 361 preguntas escritas a mano sobre 11 regiones no vistas en entrenamiento, con formulaciones ajenas a las plantillas de entrenamiento, evaluado con llama.cpp:

| Metrica | Este modelo | Modelo base (Unsloth UD-Q4_K_XL) |
|---|---|---|
| Rechaza cuando el contexto no tiene informacion util | 100% | 100% |
| Rechaza preguntas fuera de tema | 100% | 94% |
| Rechaza preguntas parafraseadas cuyo tema falta en el contexto | 100% | 58% |
| Rechaza erroneamente preguntas parafraseadas que si son respondibles | 5% | 9% |

Se considera rechazo cualquier respuesta reconocible del tipo "el contexto no lo dice" en los primeros 200 caracteres. El modelo base se ejecuto con el mismo prompt.

## Requisitos de hardware

- Tamano del archivo: 2382 MiB para `qwen3-4b-instruct-2507-travel-it-Q4_K_M.gguf`.
- RAM de dispositivo sugerida por el autor: 12 GB.
- VRAM estimada: aproximadamente 2,5 a 4 GB para los pesos en Q4_K_M, mas la cache KV correspondiente a 8192 tokens (estimacion derivada del tamano del archivo; la informacion disponible no publica mediciones de VRAM).
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090), asi como en GPU integradas con memoria unificada suficiente.
- Despliegue: llama.cpp y `llama-server` (comando de referencia `llama-server -m qwen3-4b-instruct-2507-travel-it-Q4_K_M.gguf -c 8192`). Cualquier runtime compatible con GGUF (Ollama, LM Studio) puede cargarlo. vLLM y TGI no son aplicables directamente porque el repositorio solo publica pesos cuantizados GGUF, no safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-instruct-2507-travel-it-GGUF | ~4,02 mil millones | 8192 tokens en la configuracion de la app | 100% fuera de tema; 100% parafrasis sin respaldo; 5% falsos rechazos | CC BY-SA 4.0 | GGUF Q4_K_M |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,02 mil millones | No disponible en la informacion proporcionada | 94% fuera de tema; 58% parafrasis sin respaldo; 9% falsos rechazos | Apache-2.0 | Pesos originales y multiples cuantizaciones de terceros |
| Otros fine-tunes verticales de viajes en GGUF | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas directamente comparables en la informacion disponible |

La comparacion relevante es contra el modelo base: mismo tamano y misma tarea nominal, pero con un salto notable en absteccion ante parafrasis (58% a 100%) y una reduccion de falsos rechazos (9% a 5%), a cambio de una licencia mas restrictiva (CC BY-SA 4.0 frente a Apache-2.0) y de un ambito de uso mucho mas estrecho.

## Limitaciones y advertencias

- Ambito cerrado: el modelo no esta pensado como chatbot general ni como fuente de conocimiento. Sin contexto en el prompt, su comportamiento esperado es rechazar la pregunta.
- Dependencia del contexto: la calidad y la vigencia de las respuestas dependen exclusivamente del texto de guia recuperado. Precios, horarios, requisitos de entrada e informacion de seguridad deben verificarse en fuentes oficiales antes de viajar.
- Idioma: esta entrenado para responder en italiano. Las preguntas en ingles reciben respuesta en italiano.
- Reproduccion literal: puede reproducir frases de las guias de origen de forma textual, lo que condiciona la licencia de los pesos.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (copyleft). Esto puede ser incompatible con productos propietarios que no quieran liberar sus derivados.
- Atribucion obligatoria: el listado completo de paginas fuente (titulo, URL, licencia) esta en `ATTRIBUTION.tsv`, y el texto de la licencia del modelo base en `LICENSE-base-model`.
- Riesgo de alucinacion: aunque la absteccion es alta, la metrica de rechazo erróneo del 5% sobre preguntas respondibles indica que sigue habiendo margen de error en ambos sentidos.
- Solo texto: el modelo base es exclusivamente de texto, sin capacidades multimodales.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks estandar publicados ni evaluaciones independientes.
- Datos de entrenamiento sinteticos: los 7.317 pares pregunta-respuesta fueron generados de forma sintetica, lo que puede introducir sesgos de plantilla o de estilo mas alla de los conjuntos de prueba declarados.
- Sin contenido de Viaggiare Sicuri (Farnesina) segun la model card, por lo que no debe tratarse como fuente oficial de avisos de viaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pockettravel/qwen3-4b-instruct-2507-travel-it-GGUF
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Aplicacion Pocket Travel (Android): https://github.com/miracle091/pocket-travel
- Archivo de atribucion de datos de entrenamiento: `ATTRIBUTION.tsv` (incluido en el repositorio del modelo)
- Licencia del modelo base: `LICENSE-base-model` (incluido en el repositorio del modelo)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, papers ni articulos tecnicos en la busqueda realizada; los resultados obtenidos no guardan relacion con este modelo.
