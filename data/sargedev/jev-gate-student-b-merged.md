# SargeDev/jev-gate-student-b-merged

## Resumen

El modelo `SargeDev/jev-gate-student-b-merged` es un checkpoint fusionado de pesos completos derivado de un adaptador LoRA denominado `jev-gate-student-b`. Se construye sobre `Qwen/Qwen2.5-0.5B-Instruct` y su funcion no es la generacion de texto libre, sino actuar como una puerta de relevancia (*gate*): dado un par formado por un fragmento de memoria y una consulta, devuelve en una unica pasada hacia delante una probabilidad calibrada P(relevante). Resuelve, por tanto, un subproblema muy concreto dentro de arquitecturas de memoria para agentes y sistemas RAG: decidir si un recuerdo merece ser recuperado e inyectado en el contexto antes de gastar tokens y latencia en el modelo principal.

El modelo lo desarrolla el usuario SargeDev y se distribuye bajo licencia Apache 2.0. Cuenta con 494.032.768 parametros en safetensors, ocupa aproximadamente 1,0 GB en el repositorio y esta publicado en bf16. La relevancia actual del modelo radica en su tamano: es un juez de relevancia de medio billon de parametros, ejecutable en hardware muy modesto, entrenado por destilacion a partir de un profesor de 32B sobre el corpus publico `SargeDev/jev-distill-corpus` (v1, 148 000 filas), con una evaluacion declarada sobre un conjunto retenido de 10 000 filas.

No hay informacion publicada sobre idiomas soportados, pipeline declarado ni resultados de benchmarks generativos. Las unicas metricas disponibles son de calidad de la senal de relevancia (MAE, correlacion de Pearson y acuerdo binario), no de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, tag `qwen2`); derivada de `Qwen/Qwen2.5-0.5B-Instruct` |
| Parametros totales | 494.032.768 (dato de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No especificados por el autor; pesos publicados en bf16. La cuantizacion a int8/int4 requeriria conversion externa no documentada |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); repo de 1,0 GB |
| Parametros entrenables del adaptador original | ~1,1 M (LoRA r=16, alpha=32, sobre `q_proj` y `v_proj`) |
| Uso previsto | Clasificacion binaria calibrada de relevancia memoria-consulta en una sola pasada |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2.5, en su variante de 0,5B de parametros, en configuracion Instruct. Sobre esos pesos se entreno un adaptador LoRA de rango 16 y alpha 32, aplicado unicamente a las proyecciones `q_proj` y `v_proj`, con aproximadamente 1,1 millones de parametros entrenables. En este checkpoint los deltas del adaptador se han fusionado dentro de los pesos, de modo que no se necesita PEFT en inferencia: basta con cargar el modelo con `transformers`.

El entrenamiento es de destilacion: el estudiante aprende a imitar el juicio de un profesor de 32B (referido como *gold* en la model card) sobre el corpus publico de destilacion `SargeDev/jev-distill-corpus` v1, con 148 000 filas publicas. La innovacion tecnica destacable no esta en la arquitectura sino en el objetivo: en lugar de generar una respuesta de texto, el modelo se explota como clasificador leyendo los logits de los tokens ` yes` y ` no` en la ultima posicion y normalizandolos con softmax, lo que produce una probabilidad calibrada en una sola pasada hacia delante. El autor declara que el entrenamiento se hizo solo con datos publicos o sinteticos, sin datos personales ni contenido de sesiones en vivo.

## Capacidades

- Juicio de relevancia memoria-consulta: dada una memoria y una consulta, emite P(relevante) calibrada en una unica pasada hacia delante.
- Clasificacion binaria: umbralizado a 0,5 ofrece una decision si/no sobre la relevancia del recuerdo.
- Calibracion de la confianza: la probabilidad resultante es utilizable como score continuo para ordenar o filtrar candidatos de memoria, no solo como etiqueta.
- Inferencia sin PEFT: los pesos ya estan fusionados, por lo que se carga como cualquier modelo de `transformers`.
- Eficiencia: al no requerir generacion autoregresiva, el coste por decision es de un solo forward pass sobre un prompt corto.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling, function calling, uso agentico ni modo de razonamiento explicito. El modelo debe considerarse una cabeza de clasificacion especializada, no un asistente conversacional.

## Casos de uso

- Filtrado previo en memoria de agentes: antes de inyectar recuerdos en el prompt del modelo principal, cada candidato recuperado se pasa por el gate; solo los que superan el umbral de P(relevante) consumen contexto, lo que reduce tokens y ruido en la ventana.
- Segunda etapa de un pipeline RAG: tras una recuperacion densa o lexica (que devuelve, por ejemplo, 50 candidatos), el gate reordena y descarta, actuando como reranker ligero y calibrado entrenado especificamente para la tarea de relevancia.
- Deduplicacion y poda de almacenes de memoria a largo plazo: ejecutado en lote sobre pares memoria-consulta historicos, permite archivar o eliminar entradas que nunca resultan relevantes, con un coste muy bajo por par.
- Enrutado en sistemas multi-memoria: con varias memorias especializadas (perfil de usuario, historial de proyecto, base documental), el gate decide a cual de ellas merece la pena consultar para una consulta dada.
- Investigacion sobre destilacion y calibracion: sirve como caso de estudio reproducible de destilacion de un juez de relevancia de 32B a 0,5B, con metricas publicadas (MAE, Pearson, acuerdo binario) y codigo de uso minimo.
- Despliegue en el borde o en entornos con recursos limitados: al ocupar alrededor de 1 GB en bf16 y menos de 300 MB en una cuantizacion de 4 bits, puede ejecutarse en portatiles, mini-PC o incluso CPU como componente de un agente local.
- Etiquetado y pre-anotacion de datos: el score calibrado puede usarse para pre-etiquetar pares memoria-consulta que despues se revisan por humanos, priorizando los casos con probabilidad cercana al umbral.
- Control de calidad de un retriever: comparar las decisiones del gate con las de un recuperador existente ayuda a detectar fallos sistematicos de recuperacion en un sistema en produccion.

## Benchmarks y rendimiento

Los unicos datos publicados son de evaluacion de la senal de relevancia, sobre un conjunto retenido de 10 000 filas comparado contra el profesor de 32B como referencia (*gold*). No son benchmarks generativos.

| Metrica | Student B fusionado | Qwen2.5-0.5B-Instruct sin ajustar |
|---|---|---|
| MAE | 0,219 | 0,498 |
| Correlacion de Pearson | 0,709 | -0,005 |
| Acuerdo binario @0,5 | 81,7 % | 44,4 % |

Comprobacion adicional declarada por el autor sobre 200 filas con los pesos fusionados: 79,5 % de acuerdo y MAE de 0,244, consistente con la version adaptador dentro del ruido de muestreo.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra prueba de generacion, razonamiento o codigo.

## Requisitos de hardware

- Pesos en bf16: 494 M parametros suponen aproximadamente 0,99 GB (coincide con los ~988 MB citados en la model card para safetensors). El repo completo ocupa 1,0 GB.
- VRAM estimada en bf16/fp16: del orden de 1,5 a 3 GB contando pesos, cache de KV y activaciones para prompts cortos (la memoria se trunca a 600 caracteres en el ejemplo de uso).
- Cuantizacion a 8 bits: aproximadamente 0,5 GB de pesos. A 4 bits: aproximadamente 0,25 GB de pesos. Estas conversiones no estan documentadas por el autor y requeririan herramientas externas.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe comodamente en RTX 3060, RTX 4060, RTX 4090, GTX 1650 (con cuantizacion o fp16) e incluso en GPUs integradas con suficiente memoria compartida. Tambien es viable en CPU.
- Caber en GPU consumer: si, en practicamente todas las GPU dedicadas con 4 GB o mas de VRAM, y en muchas configuraciones con menos si se cuantiza.
- Opciones de despliegue: `transformers` con PyTorch es la via documentada por el autor; vLLM, TGI o llama.cpp son tecnicamente plausibles pero no estan documentados ni verificados en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de una unica pasada hacia delante sin decodificacion autoregresiva, el coste esperado por decision es muy inferior al de un modelo generativo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-gate-student-b-merged | 494 M | No disponible | MAE 0,219; Pearson 0,709; acuerdo 81,7 % | Apache 2.0 | HuggingFace (checkpoint fusionado y adaptador) |
| Qwen2.5-0.5B-Instruct sin ajustar | 494 M | No disponible en esta ficha | MAE 0,498; Pearson -0,005; acuerdo 44,4 % | Apache 2.0 | HuggingFace |
| Profesor de 32B usado como referencia | 32 000 M (aproximado, no confirmado) | No disponible | Referencia *gold* de la evaluacion | No disponible | No disponible publicamente en la informacion proporcionada |
| Rerankers tipo cross-encoder (por ejemplo BGE-reranker) | No disponible | No disponible | No disponible para esta tarea concreta | No disponible | No disponible |

La comparacion solo es significativa contra el modelo base sin ajustar, que es el unico con cifras en la misma tarea y el mismo conjunto de evaluacion. Frente a un cross-encoder generico de reranking no hay datos comparables publicados: el gate esta entrenado especificamente para el formato memoria-consulta del corpus Jev, mientras que un reranker generico se entrena para pares consulta-documento. El profesor de 32B define la referencia, pero su identidad y su disponibilidad publica no se detallan en la model card.

## Limitaciones y advertencias

- Es un clasificador especializado, no un modelo de proposito general: no debe usarse para generar texto, mantener conversaciones ni resolver tareas de razonamiento.
- La calibracion esta atada al formato de prompt del ejemplo (`Memory: ...`, `Query: ...`, `Question: Is this memory relevant for answering the query? Answer yes or no with confidence.`). Cambiar la plantilla o el idioma de la pregunta puede degradar la calibracion sin aviso.
- La memoria se trunca a 600 caracteres en el ejemplo de uso; no hay informacion sobre el comportamiento con fragmentos mas largos ni sobre el limite real de contexto util.
- Riesgo de alucinacion en la propia decision: al ser un modelo de 0,5B entrenado por destilacion, puede emitir juicios de relevancia incorrectos con alta confianza, especialmente en dominios alejados del corpus de entrenamiento.
- No se declaran idiomas soportados; el corpus y la plantilla estan en ingles, por lo que el comportamiento multilingue es desconocido.
- Sesgos: no se documenta ninguna evaluacion de sesgos, equidad ni robustez. El corpus es publico o sintetico segun el autor, sin datos personales.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y de conservacion del aviso de licencia. Al derivar de Qwen2.5-0.5B-Instruct, deben respetarse tambien las condiciones de ese modelo base.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes): no hay validacion independiente de las metricas declaradas, que provienen unicamente del autor.
- El modelo base tiene un tamano reducido; un juez de relevancia de 0,5B puede ser insuficiente en dominios muy tecnicos o con consultas ambiguas, donde un profesor mayor o un reranker de mayor tamano rendiria mejor.
- Para produccion, conviene fijar un umbral distinto de 0,5 en funcion del coste relativo de los falsos positivos (inyectar contexto irrelevante) y los falsos negativos (perder un recuerdo util); el acuerdo binario del 81,7 % implica que aproximadamente uno de cada cinco casos se decidira de forma distinta al profesor.
- No se publican datos de latencia, throughput, consumo de memoria en produccion ni comportamiento bajo concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/jev-gate-student-b-merged
- Adaptador original (version LoRA): https://huggingface.co/SargeDev/jev-gate-student-b
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper o informe tecnico: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo (documentacion de GitHub Copilot, hilos de foro sobre ChatGPT, un complemento de Blender y una ficha de monitor), por lo que no se incluyen como enlaces relevantes.
