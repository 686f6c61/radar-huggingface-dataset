# jbarney/circuit-1.7b

## Resumen

circuit-1.7b es un adaptador LoRA con una cabeza de lectura propia (pointer readout head) construido sobre Qwen/Qwen3-1.7B-Base congelado, publicado por el usuario jbarney como backend de pesos abiertos del proyecto decision-circuits. No es un modelo generativo: recibe una peticion que empaqueta un estado y una pregunta tipada, envuelve cada opcion en tokens delimitadores y devuelve, en una sola pasada forward, una distribucion de probabilidad calibrada sobre las opciones. Es decir, es un modelo de decision "System One": preguntas tipadas de entrada, probabilidades calibradas de salida.

El problema que ataca es el de la calibracion en clasificacion: en lugar de derivar confianza a posteriori de los logits de un modelo generativo, la cabeza puntua el token delimitador de cierre de cada opcion contra un token "decide" y aplica softmax, entrenando con entropia cruzada de objetivos suaves contra etiquetas de resultado reales (calculadas por codigo o por humanos). El resultado es una confianza aprendida, no post-hoc. Habla el contrato `POST /v1/systemone` de TypeSafe y esta pensado como backend local para circuitos de decision con umbrales y rutas de escalado a humano.

Con 1,7 B de parametros en el base, 17,4 M de parametros LoRA (rango 16 sobre todas las proyecciones de atencion y MLP) y una cabeza de dos mapas lineales de 2048 x 256, el conjunto entrena en 61 minutos en una unica RTX 4090. Solo soporta ingles, la licencia es Apache 2.0 y el repositorio ocupa 0,1 GB. Su relevancia actual es acotada pero clara: es una de las pocas alternativas abiertas y ligeras a APIs propietarias de decision calibrada, con resultados competitivos en tareas de moderacion, spam y enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-1.7B-Base congelado) + adaptador LoRA + cabeza de lectura por puntero (dos mapas lineales 2048 x 256) que puntua delimitadores de opcion contra un token de decision |
| Parametros totales | 1,7 B en el modelo base congelado; ~18,4 M parametros entrenables (17,4 M de LoRA + ~1,05 M de la cabeza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (maximo usado en entrenamiento); contexto nativo del base no indicado en la informacion disponible |
| Tipos de cuantizacion | no disponible (se publican adaptador PEFT en safetensors y `head.pt`; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (adaptador y cabeza); modelo base Qwen3 tambien bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA en `adapter/`), PyTorch `head.pt` (claves `q.weight`, `k.weight`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder preentrenado y congelado (Qwen3-1.7B-Base) al que se le superpone un adaptador LoRA de rango 16 en todas las proyecciones de atencion y MLP, mas una cabeza de lectura por puntero. El mecanismo es singular: cada opcion candidata se envuelve en tokens delimitadores, la secuencia termina con un token de decision, y la cabeza puntua el delimitador de cierre de cada opcion contra ese token de decision, aplicando despues softmax sobre las puntuaciones. Las probabilidades resultantes son la respuesta del modelo; no hay decodificacion de texto ni generacion autorregresiva. La calibracion se aprende de forma directa, entrenando esa distribucion con entropia cruzada contra objetivos suaves (soft targets), en lugar de estimarse a posteriori.

El conjunto de entrenamiento son 16.738 items, todos con etiqueta calculada por codigo o por anotadores humanos y procedentes de fuentes permisivas (CC BY, CC0, MIT, Apache). Se compone de tres bloques: una rejilla de generalizacion propia (8.100 items mas 838 items ambiguos sobremuestreados con etiquetas suaves de 0,5), una porcion comercialmente segura de tareas publicas de clasificacion (2.100) y datos reales con licencia CC (MNLI, civil_comments, sms_spam, CLINC; 5.700). El autor indica explicitamente que no se usaron salidas de modelos profesor. El entrenamiento fue de 2 epocas, batch 4, maximo 1.024 tokens, learning rate 1e-4 para el LoRA y 1e-3 para la cabeza, con entropia cruzada de objetivos suaves y parada temprana sobre la ECE de validacion; 61 minutos en una RTX 4090. El codigo de entrenamiento, los generadores de datos y el arnes de evaluacion estan en el repositorio de GitHub del autor.

## Capacidades

- Clasificacion con salida de distribucion de probabilidad calibrada sobre un conjunto de opciones tipadas, en una unica pasada forward.
- Preguntas tipadas: soporta preguntas binarias (`noul`, "si/no") y preguntas de eleccion multiple (`choice`) con vocabulario de opciones definido por el cliente.
- Umbrales y puertas de decision (`gate`) con politica explicita ante incertidumbre, por ejemplo `on_uncertain="escalate"`.
- Enrutamiento por argmax con confianza minima configurable, util para derivar a equipos o colas.
- Tareas de moderacion y toxicidad (entrenado con datos de civil_comments) y deteccion de spam (sms_spam).
- Clasificacion de intenciones de gran cardinalidad: hasta 151 clases en CLINC.
- Clasificacion de temas (dbpedia_14) y de intenciones bancarias (banking77).
- Inferencia de relacion textual (MultiNLI, SNLI) y respuesta a preguntas booleanas (BoolQ), asi como parafrasis (PAWS) e idiomas masivos (AmazonScience/massive).
- No genera texto libre, no soporta tool calling ni function calling, no tiene modo de razonamiento extendido ni capacidades de vision o audio.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: definir un `choice("dept", ...)` con las colas existentes (facturacion, tecnico, otros) y usar el argmax con confianza minima para asignar automaticamente, dejando que la banda de incertidumbre derive a triaje humano. Los 86 % de exactitud y 0,06 de ECE en CLINC 151-way respaldan este escenario con vocabularios grandes.
- Moderacion de toxicidad en comunidades: clasificar comentarios con un umbral calibrado y una banda de incertidumbre, aprovechando el 90 % de exactitud y 0,16 de ECE en civil_comments. La ECE mas alta en esta tarea obliga a fijar el umbral con holgura.
- Filtrado de spam en mensajeria: clasificacion binaria de SMS con 98 % de exactitud y 0,02 de ECE, el mejor resultado de la tabla de evaluacion en frio, adecuado para bloquear automaticamente solo en la banda de alta confianza.
- Deteccion de PII antes de registrar o reenviar un texto: pregunta `noul("pii", ...)` seguida de un `gate("redact", Q("pii") >= 0.7,)`, integrada como paso previo a un pipeline de trazabilidad.
- Triaje de llamadas entrantes en servicios publicos: el modelo obtiene 92 % de exactitud y 0,08 de ECE en 100 llamadas reales de una empresa de agua con 11 categorias, sin haber sido entrenado con ese conjunto, lo que lo hace util para enrutar incidencias de facturacion, averias o altas.
- Clasificacion de intenciones en asistentes bancarios: mapear consultas de usuarios a las 77 intenciones de banking77 y encadenar despues la accion correspondiente en el backend.
- Etiquetado de catalogos y documentos: asignar categorias tematicas tipo dbpedia_14 en pipelines de ingestión documental, con distribucion de probabilidad en lugar de una etiqueta unica, lo que permite umbrales por categoria.
- Capa de decision local sin coste de API: como backend en `localhost:8901` para circuitos de decision en desarrollo, pruebas A/B de politica de umbrales y evaluacion comparativa frente a APIs propietarias.

## Benchmarks y rendimiento

Evaluacion en frio sobre 1.200 items, mismas entradas para todos los modelos, etiquetas humanas, exactitud / ECE (15 bins):

| Evaluacion en frio (1.200 items) | MultiNLI | SMS spam | Civil toxicity | CLINC 151-way |
|---|---|---|---|---|
| Jev (TypeSafe, API) | 88 % / 0,04 | 96 % / 0,05 | 82 % / 0,06 | 90 % / 0,05 |
| Bespoke-Nimble-9B | 84 % / 0,09 | 91 % / 0,06 | 86 % / 0,08 | no soportado (limite de 26 opciones) |
| kev-0.5b | 46 % / 0,28 | 50 % / 0,30 | 62 % / 0,16 | 62 % / 0,17 |
| circuit-1.7b | 81 % / 0,09 | 98 % / 0,02 | 90 % / 0,16 | 86 % / 0,06 |

Evaluaciones fuera de distribucion, no usadas en entrenamiento:

| Fuera de distribucion | Jev | Nimble-9B | kev-0.5b | circuit-1.7b |
|---|---|---|---|---|
| 100 llamadas de empresa de agua, 11 categorias (Barney 2025) | 98 % / 0,02 | 93 % / 0,05 | 80 % / 0,13 | 92 % / 0,08 |
| Rejilla de generalizacion, 9 operaciones x 6 formatos, etiquetado por codigo | 95 % | 85 % | 48 % | 97 % (ver nota) |
| ClassicMiniDIY typesafe-bench, 546 preguntas de produccion (concordancia con Jev / ECE) | 1,0 por definicion | 0,84 / 0,05 | 0,49 / 0,11 | 0,70 / 0,05 |

Nota del autor: el generador de la rejilla es suyo, por lo que se trata de items retenidos, no de estructura retenida. Entrenando con una operacion y un formato retirados, la misma receta alcanza 91 % en el formato no visto y 57 % en la operacion no vista. El autor advierte ademas que las particiones de entrenamiento de las cuatro tareas de evaluacion en frio estan en la mezcla de entrenamiento de este modelo y presumiblemente no en la de Jev, lo que limita la comparabilidad. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio publicado ocupa 0,1 GB (LoRA + cabeza); hay que sumar el modelo base Qwen3-1.7B-Base, aproximadamente 3,4 GB en bf16, ~1,8 GB en 8 bits y ~1,1 GB en 4 bits. Con activaciones y overhead, un presupuesto de 4-6 GB en bf16 es realista.
- GPU recomendadas: cualquier GPU con 8 GB o mas. El autor entreno el adaptador en 61 minutos con una unica RTX 4090.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; tambien en iGPU con memoria unificada si se cuantiza el base.
- Opciones de despliegue: el repositorio `github.com/Barneyjm/circuit` con el comando `S1_MODEL=lora:runs/circuit-1.7b uv run python -m s1proto`, que expone `POST /v1/systemone` en el puerto 8901. Los clientes se conectan mediante `decision_circuits.backends.SystemOne`. La cabeza por puntero requiere codigo propio, por lo que vLLM, TGI o llama.cpp estandar no sirven tal cual sin adaptar el readout.
- Latencia y throughput: una unica pasada forward por peticion, sin generacion autorregresiva, por lo que la latencia es la de un forward de 1,7 B sobre secuencias de hasta 1.024 tokens. No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Enfoque | Licencia | Resultados destacados |
|---|---|---|---|---|---|
| circuit-1.7b | 1,7 B base + 18,4 M entrenables | 1.024 tokens de entrenamiento | LoRA + cabeza de puntero, decision calibrada | Apache 2.0 | 98 % / 0,02 en SMS spam; 90 % / 0,16 en civil toxicity; 92 % / 0,08 en llamadas de agua |
| Jev (TypeSafe) | no disponible (API propietaria) | no disponible | API de decision calibrada | propietaria | 88 % / 0,04 en MultiNLI; 96 % / 0,05 en SMS spam; 98 % / 0,02 en llamadas de agua; 95 % en la rejilla |
| Bespoke-Nimble-9B | 9 B (aproximado por el nombre) | limite de 26 opciones | modelo de decision propietario | propietaria | 84 % / 0,09 en MultiNLI; 86 % / 0,08 en toxicidad; 93 % / 0,05 en llamadas de agua |
| kev-0.5b | 0,5 B (aproximado por el nombre) | no disponible | modelo de decision abierto de menor tamano | no disponible | 46 % / 0,28 en MultiNLI; 50 % / 0,30 en SMS spam; 48 % en la rejilla |

Los tres modelos comparables son los que el propio autor usa como referencia; no se dispone de informacion adicional sobre sus parametros, contexto o licencia mas alla de lo indicado en la model card.

## Limitaciones y advertencias

- Calibracion sobre entradas indecidibles: en entradas construidas deliberadamente para ser ambiguas, la confianza media se situa entre 0,5 y 0,9 cuando deberia estar cerca de 0. El autor reconoce que la calibracion en ambiguedad es un problema abierto y lo atribuye tambien a Jev. Cualquier umbral debe ir acompanado de una banda de incertidumbre con ruta a humano.
- Contaminacion en la evaluacion: las particiones de entrenamiento de las cuatro tareas de evaluacion en frio (MultiNLI, SMS spam, civil toxicity, CLINC) forman parte de la mezcla de entrenamiento del modelo, por lo que sus cifras no son directamente comparables con las de Jev.
- Generalizacion estructural limitada: con una operacion no vista retirada del entrenamiento, la exactitud cae al 57 %. Los formatos y plantillas transfieren, pero tipos nuevos de juicio deben estar representados en los datos.
- Idioma: solo ingles. No hay soporte multilingue aunque el listado de datasets incluya AmazonScience/massive.
- Sin generacion de texto: no sirve para resumen, redaccion, codigo ni dialogo; intentar usarlo como modelo generativo no es su proposito.
- Uso previsto restringido: el autor lo declara apto para investigacion y evaluacion de modelos de decision calibrados y como backend local de circuitos de decision, explicitamente no como sistema de produccion para decisiones que afecten a personas.
- Empaquetado no estandar: los pesos no funcionan con runtimes de inferencia habituales sin implementar la cabeza de puntero; la `head.pt` viene en PyTorch con las claves `q.weight` y `k.weight`.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento documentado mas alla del repositorio del autor.
- Sesgos: no se documenta ningun analisis de sesgo sobre los datasets de moderacion, spam ni atencion al cliente empleados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbarney/circuit-1.7b
- Repositorio de codigo, generadores de datos y arnes de evaluacion: https://github.com/Barneyjm/circuit
- Proyecto decision-circuits: https://decisioncircuits.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas de banca sin relacion con la ficha.
