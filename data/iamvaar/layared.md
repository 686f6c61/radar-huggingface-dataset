# iamvaar/LAYARED

## Resumen

LAYARED es un clasificador de seguridad (guardrail) desarrollado por el usuario iamvaar y publicado en HuggingFace, disenado para detectar inyecciones de prompt, intentos de jailbreak y trafico malicioso en aplicaciones basadas en LLM. Se presenta como un modelo "System 1" no autorregresivo, es decir, un clasificador rapido que no genera texto, sino que emite una probabilidad de ataque sobre la entrada del usuario, lo que permite interceptar peticiones antes de que lleguen al modelo generativo principal.

El modelo se construye sobre un backbone ModernBERT-large de 421 millones de parametros (421.293.830 segun los pesos en safetensors) con una cabeza de decision contextual de alto throughput. Segun el autor, la inferencia es sub-milisegundo (<1 ms), lo que lo hace apto para filtrado en linea en pipelines RAG, agentes autonomos y APIs de atencion al cliente.

Su propuesta diferencial no es tanto la deteccion bruta como la calibracion: el autor sostiene que muchos clasificadores de seguridad marcan como ataque una proporcion muy alta de trafico benigno (62 % de falsos positivos en el modelo base), y LAYARED reduce esa tasa al 23 % (15,4 % en trafico cotidiano) manteniendo una deteccion del 90,4 % en inyecciones directas. La licencia es Apache 2.0 y el modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de clasificacion contextual; no autorregresivo |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor menciona soporte MLX/Apple Silicon pero no detalla cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB), compatible con transformers |

## Arquitectura y entrenamiento

LAYARED emplea un encoder ModernBERT-large como backbone, seguido de una cabeza de decision que produce una probabilidad de ataque. Al ser un modelo de clasificacion de texto (pipeline `text-classification`), no decodifica tokens: recibe un prompt y devuelve una puntuacion. El autor lo describe como "System 1", en contraposicion a los guardrails generativos "System 2" que razonan paso a paso antes de decidir.

El entrenamiento se realizo sobre el dataset propietario LAYA-Guardrail-40k, segun la model card. La evaluacion se hizo sobre un split de holdout deduplicado de 4.000 prompts (1.800 ataques y 2.200 benignos) sin solapamiento con entrenamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; al ser un clasificador, lo habitual seria entrenamiento supervisado con etiquetas binarias, pero este dato no se explicita. Tampoco se documenta la innovacion de la "cabeza de decision contextual" mas alla del marketing. El autor menciona soporte MLX para Apple Silicon, lo que sugiere conversiones adicionales no listadas en el repo.

## Capacidades

- Clasificacion binaria de prompt injection: detecta intentos de sobrescribir instrucciones del sistema, colisiones de delimitadores y filtraciones de system prompt.
- Deteccion de jailbreaks: cubre roleplay tipo DAN, escenarios hipoteticos y personas multi-turno.
- Discriminacion de falsos positivos en contexto tecnico ("hard negatives"): distingue comandos legitimos como `kill -9`, scripts administrativos o consultas SQL de ataques reales.
- Puntuacion de probabilidad calibrada: devuelve una probabilidad continua que permite ajustar el umbral segun tolerancia al riesgo.
- Evaluacion por lotes: la API `predict_batch` permite procesar multiples prompts con un `batch_size` configurable.
- Integracion como guardrail previo: pensado para colocarse delante de un LLM, un pipeline RAG o un agente.
- No soporta generacion de texto, tool calling, vision, audio ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Proteccion de APIs de atencion al cliente: colocar LAYARED como filtro previo al LLM para bloquear intentos de extraccion del system prompt o de manipulacion de instrucciones antes de que consuman tokens del modelo principal.
- Seguridad en pipelines RAG: interceptar consultas que intentan inyectar instrucciones dentro de documentos recuperados o del propio query del usuario, evitando que el contenido malicioso llegue al generador.
- Guardrail de agentes autonomos: validar cada entrada del usuario antes de que el agente ejecute herramientas o comandos, reduciendo el riesgo de acciones no deseadas por inyeccion.
- Moderacion de trafico en produccion con bajo coste: gracias a la inferencia sub-milisegundo declarada, puede aplicarse a todas las peticiones sin anadir latencia perceptible, a diferencia de guardrails generativos.
- Filtrado de hard negatives en entornos de desarrollo: permite que consultas tecnicas legitimas (comandos de shell, SQL, terminos medicos) pasen sin bloqueo, algo critico en asistentes para desarrolladores.
- Ajuste de umbral por perfil de riesgo: el operador puede fijar umbrales distintos segun el caso (por ejemplo, estricto para banca y equilibrado para herramientas internas), usando las curvas TPR/FPR publicadas.
- Evaluacion offline de datasets de prompts: usar el modelo para etiquetar y auditar corpus historicos de interacciones y detectar patrones de ataque.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el holdout LAYA-Guardrail-40k (4.000 prompts: 1.800 ataques, 2.200 benignos). No verificados de forma independiente (`verified: false`).

| Metrica | Modelo base | LAYARED | Delta |
|---|---|---|---|
| Accuracy global | 64,38 % | 79,90 % | +15,52 pp |
| F1-Score | 70,94 % | 78,89 % | +7,95 pp |
| ROC-AUC | 0,8667 | 0,8682 | +0,0015 |
| False Positive Rate | 62,00 % | 23,00 % | -39,00 pp |
| Precision de deteccion | 56,04 % | 74,80 % | +18,76 pp |
| Recall de ataque | 96,61 % | 83,44 % | -13,17 pp |

Deteccion a tasas de falsos positivos restringidas:

| Metrica | Modelo base | LAYARED |
|---|---|---|
| TPR @ 1 % FPR | 7,8 % | 21,1 % |
| TPR @ 5 % FPR | 35,2 % | 46,9 % |
| TPR @ 10 % FPR | 61,3 % | 69,4 % |

Rendimiento por categoria de trafico:

| Categoria | Prompts | Accuracy LAYARED |
|---|---|---|
| Trafico seguro cotidiano | 1.200 | 84,6 % |
| Hard negatives (XSTest) | 1.000 | 67,9 % |
| Inyecciones directas | 1.000 | 90,4 % |
| Jailbreaks adversarios complejos | 800 | 74,8 % |

## Requisitos de hardware

- VRAM estimada: con 421 M de parametros en fp32, los pesos ocupan aproximadamente 1,7 GB; en fp16, unos 0,85 GB; en int8, unos 0,42 GB. El repo ocupa 0,8 GB, lo que sugiere pesos en fp16 o similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para fp32, o 1 GB para fp16. Una RTX 4090, A100 o H100 sobredimensionan el modelo; una GTX 1650 o una iGPU moderna pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 2 GB o mas de VRAM, y tambien en CPU.
- Apple Silicon: el autor menciona soporte MLX, lo que permitiria ejecucion nativa en chips M-series.
- Opciones de despliegue: transformers (via la libreria `laya` del autor), y presumiblemente cualquier runtime compatible con safetensors/transformers; no se documenta soporte explicito de vLLM, TGI, llama.cpp u Ollama (este ultimo requeriria conversion a GGUF, no confirmada).
- Latencia y throughput: el autor declara inferencia sub-milisegundo (<1 ms); no se especifica en que hardware ni con que tamano de lote. No hay datos de throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| LAYARED | 421 M | Encoder clasificador (ModernBERT-large) | No disponible | Apache 2.0 | Prompt injection y jailbreak, calibrado para bajo FPR |
| Llama Guard (Meta) | 8 B (aprox.) | LLM generativo | 4.096 tokens (version inicial) | Llama Community License | Moderacion de contenido generativa |
| Prompt Guard (Meta) | 86 M (aprox.) | Encoder clasificador | 512 tokens (aprox.) | Llama Community License | Deteccion de inyeccion y jailbreak |
| ShieldGemma (Google) | 2 B / 9 B / 27 B | LLM generativo | 8.192 tokens | Gemma Terms of Use | Moderacion de contenido |

Nota: los datos de los modelos comparables son de referencia general y pueden variar segun version. No se dispone de una comparacion directa publicada por el autor entre LAYARED y estos modelos; la tabla es orientativa.

## Limitaciones y advertencias

- Solo ingles: el modelo esta etiquetado exclusivamente para `en`; su comportamiento en castellano u otros idiomas no esta evaluado.
- Resultados no verificados: todas las metricas proceden de la model card del autor y estan marcadas como `verified: false`; no hay evaluacion independiente publicada.
- Recall de ataque reducido respecto al base: pasa del 96,61 % al 83,44 %, lo que implica que aproximadamente 1 de cada 6 ataques del holdout no se detecta al umbral 0,50. El autor lo presenta como calibracion, pero es un compromiso real.
- FPR del 23 % al umbral estandar: sigue bloqueando casi una de cada cuatro peticiones benignas en el conjunto global; solo baja al 15,4 % en trafico cotidiano.
- Hard negatives al 67,9 %: un tercio de las consultas tecnicas legitimas (comandos, SQL, terminos medicos) no se clasifican correctamente en esa categoria.
- Dataset de evaluacion propietario: LAYA-Guardrail-40k no es publico, lo que impide reproducir los resultados.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto), pero si puede producir falsos positivos y falsos negativos.
- Sin datos de sesgos: no se documenta analisis de sesgo por demografia, dominio o tipo de usuario.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el modelo.
- Dependencia de la libreria `laya`: el quickstart usa un paquete propio del autor, no la API estandar de transformers, lo que anade una dependencia no auditada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamvaar/LAYARED
- Dataset de evaluacion (referenciado, no enlazado en la informacion disponible): LAYA-Guardrail-40k
- XSTest (referenciado en la model card como benchmark de hard negatives): no disponible enlace directo en la informacion proporcionada
- ModernBERT (backbone): no disponible enlace directo en la informacion proporcionada
