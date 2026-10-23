# liukunli/ha-expert-qwen3-8b-dapt

## Resumen

HA-Expert Qwen3-8B DAPT es un checkpoint intermedio de preentrenamiento continuo con adaptación de dominio (domain-adaptive pretraining, DAPT) sobre Qwen3-8B-Base, publicado por el desarrollador liukunli dentro del proyecto HA-Expert. Su dominio objetivo es el hialuronano (ácido hialurónico): el modelo se ha entrenado con 12.306 artículos de acceso abierto sobre esta molécula, aproximadamente 126 millones de tokens, con el objetivo de inyectar conocimiento cientifico especializado en los pesos del modelo base.

No se trata de un modelo instruido ni de un asistente conversacional: es una pieza de infraestructura dentro de un pipeline de tres etapas (DAPT, generacion de datos SFT y ajuste supervisado final). El autor lo publica para reproducibilidad y lo describe explicitamente como el "teacher" que genero un dataset SFT de 12.003 pares mediante vLLM a coste cero de API, y como la base sobre la que se entrena el modelo final.

Su relevancia es doble. Por un lado, documenta una receta completa y barata de especializacion de dominio (5 horas y 34 minutos de entrenamiento en una sola GPU RTX PRO 6000, con perdida final aproximada de 1,55). Por otro, ejemplifica un hallazgo tecnico interesante: el preentrenamiento continuo inyecta conocimiento factual (el modelo ya rechaza trampas como "el hialuronano es un polímero proteico") pero no modifica el comportamiento de respuesta, que es lo que aporta la etapa SFT. El checkpoint cuenta con 8.190.735.360 parametros y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada de Qwen/Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento DAPT; capacidad nativa del modelo base no verificada en este checkpoint |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se han publicado GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en); corpus de entrenamiento exclusivamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 16,4 GB) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Fecha de publicacion | 2026-10-23 |
| Etapa del pipeline | Checkpoint intermedio de continued pretraining (no instruction-tuned) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base: un transformer decoder-only denso de 8.190 millones de parametros, sin mezcla de expertos. El autor no modifica la topologia; el trabajo consiste en un ajuste de todos los parametros (full-parameter training) sobre el checkpoint base. La secuencia de entrenamiento se fija en 4.096 tokens con empaquetado por limites de documento (document-boundary packing) para evitar que el modelo aprenda dependencias espurias entre articulos distintos. Se emplean kernels de Liger y el optimizador 8-bit Adam con un schedule coseno.

El corpus se compone de tres bloques: un conjunto nuclear DAPT de 4.952 articulos (60,0 millones de tokens), un subconjunto de annealing de 498 articulos (5,7 millones de tokens) y un 12% de replay de dominio general procedente de FineWeb-Edu, una precaucion habitual para mitigar el olvido catastrofico. Se excluyeron 30 revisiones (reviews) como conjunto de retencion o holdout para evitar contaminacion en la evaluacion posterior. El entrenamiento completo se ejecuto en 212 pasos a 524.288 tokens por paso (batch de 8 con acumulacion de 16), es decir, aproximadamente 111 millones de tokens procesados, con una perdida final de entrenamiento en torno a 1,55.

La innovacion tecnica mas citable del proyecto no esta en la arquitectura sino en el uso del checkpoint: actua como teacher para sintetizar 12.003 pares de instruccion-respuesta mediante inferencia con vLLM, sin coste de API, que despues alimentan la etapa SFT. El autor reporta tambien que el DAPT corrige trampas de conocimiento concretas del modelo base (por ejemplo, el rechazo correcto de la afirmacion "el hialuronano es un polímero proteico") sin ensenar por si mismo comportamiento de respuesta.

## Capacidades

- Modelado de lenguaje causal y continuacion de texto en ingles sobre literatura cientifica de hialuronano.
- Conocimiento factual del dominio inyectado en los pesos: quimica, biologia, aplicaciones clinicas y propiedades fisicoquimicas del acido hialuronico, derivado de 12.306 articulos de acceso abierto.
- Generacion de texto tecnico en registro academico, util para producir datos sinteticos de entrenamiento.
- Capacidad de "teacher" para destilacion de datos: el autor lo uso para generar 12.003 pares SFT con vLLM.
- Razonamiento de dominio limitado: en la particion de desarrollo de HA-Expert-Bench (63 preguntas) iguala al modelo base en los items autoevaluados (5/6) y corrige algunas trampas de conocimiento.
- No soporta tool calling ni function calling de forma nativa: no ha pasado por etapas de post-entrenamiento con plantillas de herramientas.
- No soporta modo de razonamiento explicito (thinking mode) ni agentes multi-paso: es un checkpoint base, no un modelo instruido.
- No tiene capacidades de vision ni audio.
- Multilingue limitado: aunque Qwen3-8B-Base es multilingue, el DAPT se realizo solo con corpus en ingles, por lo que el conocimiento inyectado esta practicamente restringido a ese idioma.
- No dispone de plantilla de chat ni de alineacion (RLHF/DPO) en este checkpoint.

## Casos de uso

- Generacion de datos sinteticos para SFT: el uso documentado por el autor. Se despliega con vLLM y se le piden pares pregunta-respuesta sobre hialuronano para construir un dataset de ajuste supervisado sin coste de API; es adecuado porque ya contiene el conocimiento de dominio y produce texto en registro academico.
- Base para un ajuste fino supervisado especializado: partir de este checkpoint en lugar de Qwen3-8B-Base reduce el numero de tokens necesarios para alcanzar competencia en el dominio, ya que el conocimiento factual esta en los pesos.
- Recuperacion y extraccion de informacion en pipelines RAG sobre literatura cientifica: el modelo puede usarse como componente de generacion aumentada donde las respuestas deban citar mecanismos y propiedades descritas en papers de hialuronano.
- Etiquetado y clasificacion de articulos cientificos: con un cabezal o un prompt de continuacion se puede adaptar para clasificar papers por subtema (reologia, reticulacion, aplicaciones oftalmicas, oncologia) o extraer entidades quimicas.
- Investigacion en adaptacion de dominio: sirve como caso de estudio reproducible de una receta DAPT completa (corpus, replay de dominio general, annealing, hiperparametros y coste en GPU) para replicarla en otros dominios cientificos.
- Evaluacion comparativa de conocimiento inyectado: util para medir cuanto conocimiento factual absorbe un modelo de 8B con 66 millones de tokens de dominio frente a alternativas como RAG puro o ajuste supervisado, usando HA-Expert-Bench como referencia.
- Prototipado de asistentes internos de documentacion tecnica en empresas de biomateriales o cosmeticos: con la etapa SFT posterior, el checkpoint sirve de base para responder consultas internas sobre formulacion y seguridad del acido hialuronico.

## Benchmarks y rendimiento

Unica evaluacion publicada en la informacion disponible: particion de desarrollo de HA-Expert-Bench (63 preguntas, de las cuales solo 6 son items autoevaluados).

| Benchmark | Metrica | Qwen3-8B-Base | HA-Expert DAPT | Notas |
|---|---|---|---|---|
| HA-Expert-Bench (dev split) | Items autoevaluados | 5/6 | 5/6 | Empate; el DAPT corrige trampas de conocimiento que el base falla |
| HA-Expert-Bench (dev split) | Preguntas totales | No disponible | No disponible | Solo se publica el resultado de los 6 items autoevaluados |
| MMLU, GSM8K, HumanEval y similares | Varias | No disponible | No disponible | No se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks en la informacion disponible para las suites estandar (MMLU, HumanEval, GSM8K, BBH). Tampoco se reporta evaluacion del olvido catastrofico en tareas generales mas alla de la mencion al replay con FineWeb-Edu.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,4 GB solo para los pesos (8,19 mil millones de parametros x 2 bytes), mas cache KV y overhead del runtime; en la practica conviene contar con 20-24 GB para secuencias de 4.096 tokens.
- VRAM estimada en int8: en torno a 8,2 GB de pesos; en int4: en torno a 4,1 GB, mas cache KV. Estas cuantizaciones requeririan conversion propia, ya que no hay GGUF publicados.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, RTX PRO 6000 (96 GB, la usada por el autor para el entrenamiento completo).
- Cabe en GPU de consumo: si. RTX 4090 o RTX 5090 (24/32 GB) en bf16 con margen limitado; RTX 3090 (24 GB) tambien es viable; tarjetas de 12-16 GB requieren cuantizacion a 8 o 4 bits.
- Entrenamiento: el autor realizo el ajuste completo de parametros con 8-bit Adam en una unica RTX PRO 6000 en 5 horas y 34 minutos; no se detalla el pico de VRAM empleado.
- Opciones de despliegue: vLLM (usado por el autor para generar el dataset SFT), TGI, transformers + accelerate, y llama.cpp/Ollama o GPTQ/AWQ tras conversion y cuantizacion propia.
- Latencia y throughput: no disponibles. El autor solo indica que genero 12.003 pares con vLLM a coste cero de API, sin publicar tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HA-Expert Qwen3-8B DAPT | 8,19 B (denso) | 4.096 tokens en entrenamiento | Hialuronano (DAPT, solo ingles) | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| Qwen/Qwen3-8B-Base | 8,19 B (denso) | Contexto nativo de la familia Qwen3; no detallado en la informacion disponible | Generalista y multilingue | Apache 2.0 | HuggingFace, ampliamente utilizado |
| BioMistral-7B | Aproximadamente 7 B (denso) | No disponible en la informacion proporcionada | Biomedico, continuacion de pretraining sobre Mistral | Apache 2.0 | HuggingFace |
| Llama 3.1 8B (base) | 8,03 B (denso) | No disponible en la informacion proporcionada | Generalista y multilingue | Llama 3.1 Community License | HuggingFace |

La comparacion cuantitativa de rendimiento frente a estas alternativas no esta disponible: el autor solo publica seis items autoevaluados de su propio benchmark, sin evaluacion cruzada con modelos biomedicos de referencia. La ventaja diferencial del checkpoint es la especializacion estrecha en un unico tema y la reproducibilidad completa de la receta; su desventaja es que queda por detras de los modelos biomedicos generalistas en cobertura y de los generalistas en capacidades instruidas.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones de forma fiable, no tiene plantilla de chat ni alineacion (sin RLHF ni DPO). Usarlo directamente como asistente produce resultados pobres; esta pensado como base para SFT.
- Riesgo alto de olvido catastrofico: aunque se aplico un 12% de replay con FineWeb-Edu, el ajuste de todos los parametros sobre 66 millones de tokens de un dominio muy concreto puede degradar capacidades generales. El autor no publica evaluaciones de retencion en tareas generales.
- Sesgo de dominio y de fuente: todo el conocimiento proviene de literatura de acceso abierto sobre hialuronano, con el sesgo editorial y geografico de ese corpus; los temas poco representados en la literatura quedaran peor cubiertos.
- Idioma: solo ingles. El conocimiento inyectado no se transfiere de forma fiable a consultas en castellano.
- Alucinacion: al ser un modelo base sin alineacion, tiende a continuar texto de forma plausible; en contextos cientificos puede fabricar referencias, cifras o mecanismos. No es apto para uso clinico ni para asesoramiento medico sin validacion humana.
- Evidencia empirica muy debil: la evaluacion publicada se reduce a la particion de desarrollo de un benchmark propio (63 preguntas, 6 items autoevaluados). No hay MMLU, GSM8K ni comparaciones independientes, y el numero de descargas es cero en el momento de la ficha.
- Contexto de entrenamiento corto (4.096 tokens): no se ha validado el comportamiento con ventanas mas largas aunque el modelo base las soporte.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las obligaciones heredadas del modelo base Qwen3-8B-Base y citar adecuadamente el proyecto original.
- Fecha de publicacion adelantada (2026-10-23) y ausencia de validacion por terceros: tratar los resultados reportados como no replicados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liukunli/ha-expert-qwen3-8b-dapt
- Repositorio del proyecto (metodos, benchmark y resultados): https://github.com/liukunli001/hyaluronan-expert-llm
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Enlaces adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo ni con el dominio).
