# jbrashear/jebadiah-4b-v1

## Resumen

Jebadiah 4B v1 («Jeb») es un adaptador LoRA de tipo *decision model* estilo System One desarrollado por el usuario jbrashear. No es un modelo generativo de texto: dado un estado o consulta, devuelve una distribución de probabilidad calibrada sobre un conjunto de etiquetas de opción. El adaptador se monta sobre el modelo base Qwen/Qwen3.5-4B-Base (revisión fijada `1001bb4d`) y se sirve mediante las rutas `/v1/decide` y `/v1/systemone` de AINode sobre cualquier GPU NVIDIA.

El modelo maneja tres tipos de pregunta tipada: *choice* (elegir una entre N opciones), *noul* (afirmación de sí/no devuelta como P(sí)) y *score* (situar el estado en una rúbrica ordenada). El entrenamiento se hizo con el trainer de AINode, exclusivamente sobre datos públicos, en una sola época sobre 14.900 preguntas y en 99 minutos sobre una H100 PCIe.

La relevancia de esta versión frente a la v0 es doble: las preguntas de tipo *score* se entrenan ahora hacia un objetivo ordinal alrededor de la etiqueta humana, con la temperatura ajustada sobre ese objetivo, y el conjunto de entrenamiento incorpora dos fuentes de rúbrica humana con licencia (el split de entrenamiento de HelpSteer2 y SummEval). El resultado es una mejor calibración a costa de una regresión medible en uno de los conjuntos generales. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B-Base) con adaptador LoRA; cabecera de decision tipada (choice / noul / score) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA se distribuye aparte (tamano de repo 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion aplicable es la del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B-Base (revision fijada 1001bb4d) |
| Rutas de servicio | AINode `/v1/decide` y `/v1/systemone` |
| Datos de entrenamiento | LocalLLaMA/typed-decisions, nvidia/HelpSteer2 (split train), mteb/summeval |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer denso de 4B parametros (Qwen3.5-4B-Base), no una arquitectura nueva ni un MoE. La innovacion no esta en el cuerpo del modelo sino en la cabeza de decision: en lugar de generar texto, el modelo emite un logit por etiqueta candidata y lo convierte en una probabilidad calibrada. Las preguntas se tipan en tres formatos: `choice` (seleccion entre N opciones), `noul` (probabilidad de que una afirmacion sea cierta) y `score` (posicion en una rubrica ordenada). Las rutas de AINode usan un esquema de peticion propio, documentado en la propia ruta, que no coincide exactamente con el formato de cable de Jev.

El entrenamiento consistio en una epoca sobre 14.900 preguntas publicas, con una unica H100 PCIe y un tiempo de 99 minutos. Frente a la v0, la v1 introduce dos cambios: las preguntas de tipo `score` se entrenan hacia un objetivo ordinal centrado en la etiqueta humana, con la temperatura ajustada sobre ese objetivo; y el pool de datos incorpora HelpSteer2 (split de entrenamiento) y SummEval. Los items de Jevals y Nimble provienen de validacion y no solapan con entrenamiento, y los 15 articulos de evaluacion de SummEval usados por Nimble quedan completamente fuera. Esto implica que HelpSteer2 y SummEval ya no son zero-shot para este modelo: son items retenidos de una rubrica vista. El autor declara explicitamente una regresion en el conjunto Nimble de 324 items (de 77,5 en v0 a 71,9 en v1) atribuida a que un 4B no absorbe una proporcion del 45 % de preguntas de tipo score sin perder calidad en juicios de tipo choice y si/no. La v1 se publica como repositorio nuevo y no reemplaza a la v0.

## Capacidades

- Decision tipada con probabilidad calibrada: `choice` (una entre N opciones), `noul` (P(si) sobre una afirmacion) y `score` (posicion ordinal en una rubrica).
- Salida de probabilidades por etiqueta, no de texto libre; una sola lectura de logits por pregunta.
- Calibracion medida con ECE (error de calibracion esperado) tras aplicar temperaturas: 0,039 en PubMedQA, 0,063 en Banking77, 0,044 en HelpSteer2 (0,073 en crudo), 0,058 en Nimble y 0,170 en typed-decisions.
- Estabilidad ante repeticiones identicas: entre 0,0 % y 1,0 % de cambios de eleccion segun conjunto.
- Robustez ante contenido irrelevante: en PubMedQA, 98,2 % de acuerdo de eleccion con un UUID insertado en el estado y 98,7 % con el UUID anadido a las instrucciones; cambio medio de p_max de 1,1 y 1,0 puntos respectivamente.
- Clasificacion multi-clase de granularidad alta: 77 opciones en Banking77 y 5 niveles en HelpSteer2.
- Capacidades de generacion de texto, razonamiento libre, codigo, matematicas, vision, tool calling o agentes: no disponibles (el modelo no genera texto, devuelve decisiones).
- Capacidades multilingues: solo ingles declarado. La unica evidencia en otros idiomas es el subconjunto massive-de-DE de Nimble (83,7 % de exactitud), pero el idioma declarado del modelo es `en`.
- Despliegue en GPU NVIDIA mediante AINode, con rutas HTTP dedicadas.

## Casos de uso

- Triaje clinico sobre literatura: el modelo responde preguntas de si/no sobre textos biomedicos (PubMedQA) con un 86,7 % de exactitud frente a un suelo de mayoria del 62,0 %. Util para prefiltrar candidatos antes de revision humana, gracias a que la salida es una probabilidad y no una afirmacion en texto.
- Enrutado de tickets bancarios: con 77 categorias posibles y un 68,3 % de exactitud frente a un suelo de 1,3 % (Banking77), sirve como clasificador de primera linea en un sistema de atencion al cliente, dejando los casos de baja confianza a un humano.
- Puntuacion de calidad de respuestas generadas: en HelpSteer2 helpfulness coloca la respuesta en una rubrica ordinal de 5 niveles, util como recompensa o filtro en pipelines de evaluacion de asistentes.
- Moderacion y seguridad de contenido: los subconjuntos de Nimble incluyen aegis2 (80,0 %) y civil_comments (84,0 %), por lo que puede actuar como clasificador de toxicidad o seguridad con umbral calibrado.
- Verificacion de consistencia en resumen automatico: los subconjuntos summeval-consistency (86,1 %) y summeval-relevance (51,2 %) permiten detectar alucinaciones o perdida de relevancia en resumenes generados.
- Deteccion de implicacion textual y parafrasis: multinli (86,0 %) y paws (82,8 %) habilitan componentes de NLI y de deteccion de duplicados en pipelines de RAG.
- Respuesta a preguntas extractiva con control de abstención: squad2 (79,6 %) y boolq (85,7 %) permiten construir un paso de verificacion booleana sobre documentos recuperados.
- Analisis de sentimiento o contenido en dominios especificos: vitaminc-dev (75,3 %) cubre verificacion de afirmaciones factuales.
- Sustitucion de un clasificador entrenado a medida: en lugar de etiquetar miles de ejemplos por tarea, se formula cada tarea como pregunta tipada (`choice`, `noul`, `score`) y se reutiliza el mismo adaptador.

## Benchmarks y rendimiento

Resultados declarados por el autor con el bench de AINode, una lectura de logits por pregunta y el mismo prompt renderizado para todos los modelos. La exactitud es la proporcion de preguntas cuya etiqueta superior coincide con la humana; el Decision Score de Jevals vale 100 en el maximo, 0 al nivel de adivinar las frecuencias base y menos de 0 por debajo de eso. Estos numeros no son filas del tablon de Jevals y no estan verificados. La media macro sobre los conjuntos publicos zero-shot es 70,3 (v0: 70,9).

| Conjunto (preguntas) | Tipo | Exactitud | Suelo (etiqueta mayoritaria) | Decision Score | ECE (temperaturas aplicadas) | Cambios de eleccion en repeticiones |
|---|---|---:|---:|---:|---:|---:|
| Jevals PubMedQA (300) | noul | 86,7 | 62,0 | 59,0 | 0,039 | 0,3 % |
| Jevals Banking77 (300, 77 opciones) | choice | 68,3 | 1,3 | 55,6 | 0,063 | 0,0 % |
| Jevals HelpSteer2 helpfulness (300, 5 niveles) | score | 37,0 | 41,7 | 9,2 | 0,044 (crudo 0,073) | 1,0 % |
| Nimble held-out eval (324) | mixto | 71,9 | 17,6 | 57,5 | 0,058 | 0,0 % |
| Kev transfer-v4 test (764) | mixto | 82,2 | 21,5 | 64,7 | 0,041 | 0,3 % |
| Kev decision-v7 test (1.440) | mixto | 78,8 | 20,3 | 67,9 | 0,042 | n/a |
| typed-decisions test (2.000) | mixto | 79,8 | 15,3 | 56,6 | 0,170 | 0,1 % |

Subconjuntos publicos etiquetados por humanos de Nimble (3.880 preguntas), exactitud macro 75,9; desglose por subconjunto: aegis2 80,0, boolq 85,7, civil_comments 84,0, helpsteer2 38,2, massive-de-DE 83,7, massive-en-US 83,7, multinli 86,0, paws 82,8, pubmedqa 70,8, squad2 79,6, summeval-consistency 86,1, summeval-relevance 51,2, vitaminc-dev 75,3.

Prueba de robustez con contenido irrelevante (test nonce), con un UUID nuevo insertado en el estado (`state`) o anadido a las instrucciones (`instr`):

| Conjunto | Acuerdo de eleccion (state / instr) | Preguntas con al menos un cambio (state / instr) | Cambio medio de p_max, puntos (state / instr) |
|---|---|---|---|
| Jevals PubMedQA | 98,2 % / 98,7 % | 3,0 % / 2,3 % | 1,1 / 1,0 |
| Jevals Banking77 | no disponible (el extracto se corta) | no disponible | no disponible |

## Requisitos de hardware

- Entrenamiento declarado: una H100 PCIe, 99 minutos, una epoca sobre 14.900 preguntas.
- Inferencia: el adaptador se monta sobre Qwen3.5-4B-Base, por lo que el coste es el del modelo base de 4B mas el adaptador (repo de 0,2 GB). Estimacion orientativa a partir del tamano de parametros: ~8-9 GB de pesos en fp16/bf16, ~5-6 GB en int8 y en torno a 3-4 GB en 4 bits, mas la cache KV (no disponible la longitud de contexto, por lo que no puede calcularse con precision).
- GPU recomendadas: H100 o A100 para servicio con concurrencia; en el extremo consumer, una RTX 4090 (24 GB) puede servir el modelo base en fp16 sobradamente y una RTX 3090 (24 GB) tambien. En 4 bits, GPUs de 8-12 GB serian suficientes para una instancia unica.
- Opciones de despliegue: AINode sobre cualquier GPU NVIDIA (rutas `/v1/decide` y `/v1/systemone`) es el camino soportado explicitamente. El adaptador es PEFT/LoRA en safetensors, por lo que tambien es cargable con las herramientas estandar de PEFT/Hugging Face; no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, y no habria pesos GGUF publicados.
- Latencia y throughput: no disponibles. Solo se sabe que la evaluacion usa una unica lectura de logits por pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Exactitud Nimble (macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jebadiah-4b-v1 | 4B (LoRA) | Decision tipada calibrada (choice / noul / score) | 75,9 (subconjuntos publicos de Nimble) | apache-2.0 | HuggingFace (adaptador) |
| jebadiah-4b-v0 | 4B (LoRA) | Decision tipada, sin objetivo ordinal en `score` ni rúbricas humanas | No publicada en el extracto; 77,5 en el conjunto Nimble de 324 items | apache-2.0 | HuggingFace (adaptador) |
| Nimble-9B | 9B | Clasificador/decision | 74,8 (tabla publicada de Bespoke, mismo scorer) | no disponible | No disponible en la informacion proporcionada |
| Jev | no disponible | Decision tipada (referencia del metrico Jevals) | 76,0 (tabla publicada de Bespoke, mismo scorer) | no disponible | No disponible en la informacion proporcionada |

La comparacion directa entre v1 y v0 en el mismo conjunto (Nimble held-out de 324 items) es la unica con metodologia identica confirmada: 71,9 frente a 77,5. El autor lo describe como una regresion asumida, a cambio de mejor calibracion y mejor comportamiento en rubricas humanas. La media macro general es 70,3 en v1 frente a 70,9 en v0, practicamente empatada.

## Limitaciones y advertencias

- El modelo no genera texto: solo produce probabilidades sobre etiquetas tipadas. No sirve como asistente conversacional ni para tareas generativas.
- Solo declara soporte de ingles. No hay garantia de comportamiento en otros idiomas pese al resultado de massive-de-DE en Nimble.
- HelpSteer2 y SummEval no son zero-shot para este modelo: se entreno con el split de entrenamiento de HelpSteer2 y con articulos de SummEval distintos de los que puntua Nimble. Las filas correspondientes son items retenidos de una rubrica vista y no deben leerse como generalizacion limpia.
- Regresion documentada por el propio autor: el conjunto Nimble de 324 items cae de 77,5 (v0) a 71,9 (v1). El autor lo atribuye a que un 4B no absorbe una proporcion del 45 % de preguntas de tipo `score` sin degradar los juicios de tipo `choice` y si/no. La recomendacion implicita es usar v0 como 4B general y v1 como 4B mejor calibrado.
- El conjunto HelpSteer2 helpfulness queda por debajo del suelo de la etiqueta mayoritaria (37,0 frente a 41,7 de exactitud) y con un Decision Score de solo 9,2, lo que indica rendimiento cercano al azar ponderado en esa rubrica.
- El ECE en typed-decisions es notablemente peor que en el resto (0,170), lo que sugiere calibracion irregular en el conjunto en distribucion.
- Todos los resultados son declarados por el autor con su propio bench y marcados como no verificados; no figuran en el tablon publico de Jevals. No se han publicado resultados con arneses externos (MMLU, HumanEval, GSM8K u otros).
- La model card esta incompleta en el extracto disponible: la tabla de robustez se corta tras la fila de Banking77, y no hay informacion sobre longitud de contexto, cuantizacion ni sesgos.
- El modelo se sirve mediante un esquema de peticion propio de AINode, distinto del formato de cable de Jev; una integracion que espere el formato de Jev necesitara adaptacion.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda sujeto tambien a la licencia del modelo base Qwen/Qwen3.5-4B-Base, que debe comprobarse por separado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza; el propio autor publica temperaturas ajustadas y ECE para mitigarlo, y esas temperaturas deben aplicarse en produccion.
- Repositorio con 0 descargas y 0 likes en el momento del registro, sin senales de adopcion ni mantenimiento comunitario.

## Enlaces

- Modelo en HuggingFace (v1): https://huggingface.co/jbrashear/jebadiah-4b-v1
- Version anterior (v0): https://huggingface.co/jbrashear/jebadiah-4b-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset SummEval: https://huggingface.co/datasets/mteb/summeval
- Artefactos de evaluacion citados en la model card: carpeta `eval/` del repositorio, con `eval/results.json` y `eval/nonce/`
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; las busquedas devolvieron contenido no relacionado (tutoriales de APK y clientes de Telegram).
