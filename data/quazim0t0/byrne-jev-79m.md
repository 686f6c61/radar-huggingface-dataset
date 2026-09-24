# Quazim0t0/Byrne-Jev-79M

## Resumen

Byrne-Jev-79M es un modelo local de decisión tipada de estilo System-1 desarrollado por el usuario Quazim0t0. Su funcionamiento difiere del de un modelo generativo convencional: recibe un estado (texto, JSON o una conversación) y una serie de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción en un único forward pass. No genera texto libre, por lo que no hay que parsear respuestas ni existe la posibilidad de que el modelo devuelva una respuesta fuera del conjunto de opciones definido por el usuario.

El modelo tiene aproximadamente 79 millones de parámetros y se compone de dos partes: un tronco decodificador causal de 70,4M de parámetros denominado SpikeWhale y una cabeza de decisión de 8,5M de parámetros inspirada en Laya. El método se apoya en una cabeza de decisión tipada, una posición marcadora por opción, una cabeza bidireccional de dos capas sobre la secuencia y reglas de puntuación estrictamente propias (strictly proper scoring rules) para que las probabilidades estén realmente calibradas. El formato de respuesta es compatible con el esquema de Laya y Jev, y se sirve mediante el protocolo de cable `/v1/systemone` de Jev.

La relevancia de esta ficha radica en su propuesta de calibración: con una temperatura fija de 1,0 para todos los tipos de pregunta y sin escalado de temperatura a posteriori, el modelo reporta un ECE de 0,045 en el conjunto de prueba typed-decisions, el más bajo de la comparativa publicada, aunque con una precisión top-1 inferior a la de Jev y Laya. Es, por tanto, un modelo pensado para enrutado, clasificación y decisiones con umbral de confianza, no para generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco decodificador causal (SpikeWhale) de 70,4M de parametros mas cabeza de decision tipada de 8,5M; cabeza bidireccional de 2 capas sobre la secuencia |
| Parametros totales | ~79M (70,4M de tronco + 8,5M de cabeza) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Posiciones hasta 2048; presupuestos de tokens configurables: `JEV_MAX_LEN` 1024 (estado + pregunta) y `JEV_HEAD_MAX_LEN` 256 (pregunta + opciones) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye como `model.pt` sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`model.pt`, pesos y configuracion en un unico fichero) |

## Arquitectura y entrenamiento

La arquitectura combina un tronco decodificador causal de 70,4M de parametros (SpikeWhale) con una cabeza de decision de 8,5M de parametros al estilo de Laya. El mecanismo de decision se basa en asignar una posicion marcadora por cada opcion posible y aplicar una cabeza bidireccional de dos capas sobre la secuencia, lo que permite producir simultaneamente una probabilidad para cada opcion en un solo forward pass. El modelo utiliza reglas de puntuacion estrictamente propias, un requisito tecnico que en teoria de la probabilidad garantiza que el optimo se alcanza reportando las probabilidades reales, lo que sustenta la calibracion del sistema.

En cuanto al entrenamiento, no se especifican en la informacion disponible el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que el autor construyo el modelo y describe el metodo como cercano al de Laya, incluyendo la eleccion de temperatura 1,0 para todos los tipos de pregunta sin escalado de temperatura a posteriori, decision que segun el autor es la que mejor calibracion proporciona. La evaluacion se realizo sobre el split de test de `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones, cuatro flujos de trabajo).

## Capacidades

- Decision tipada en un unico forward pass: no genera texto, devuelve una distribucion de probabilidad sobre las opciones definidas por el usuario.
- Tipo de pregunta `choice`: `criteria` es un diccionario de `etiqueta -> descripcion` o una lista de etiquetas; devuelve la opcion elegida y una probabilidad por opcion.
- Tipo de pregunta `score`: `criteria` es una lista de niveles ordenados; la respuesta incluye el nivel esperado.
- Tipo de pregunta `noul`: pregunta de si/no; opcionalmente `criteria` describe los casos `true`/`false` y la respuesta es P(true).
- Salida de confianza calibrada: cada respuesta incluye `answer_confidence`, la probabilidad de la respuesta elegida, pensada como valor de control (gate) en produccion.
- Entrada de estado flexible: texto, JSON o una conversacion.
- Servidor HTTP compatible con el protocolo de cable de Jev (`POST /v1/systemone`, `GET /health`), implementado solo con la biblioteca estandar de Python.
- Compatibilidad de esquema con Laya y Jev, incluyendo en las respuestas `usage`, `rounding: {"probabilityDecimals": 4}` y `cost_usd: 0`.
- No se documentan capacidades de generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el cuerpo de un mensaje y una pregunta `choice` con los departamentos posibles (facturacion, tecnico, otros) y devuelve la probabilidad de cada uno; la `answer_confidence` permite derivar a revision humana cuando la confianza es baja.
- Deteccion de riesgo de cancelacion (churn): con una pregunta `noul` sobre si el usuario amenaza con irse, se obtiene P(true) como senal cuantitativa para priorizar retencion.
- Triaje de urgencia: una pregunta `score` con niveles ordenados (no urgente, pronto, bloqueante) permite ordenar una cola de incidencias en funcion del nivel esperado.
- Observabilidad de trazas de agentes: segun los datos publicados, el flujo de trabajo con mejor exactitud (0,704) es el de observabilidad de trazas de agente, adecuado para etiquetar automaticamente eventos de un sistema de agentes.
- Clasificacion de incidentes de seguridad: flujo con 0,654 de exactitud en la evaluacion publicada, util para clasificar alertas por tipo o severidad mediante preguntas `choice` y `score`.
- Procesamiento de facturas: con 0,552 de exactitud, es el flujo mas debil reportado, pero puede emplearse como preclasificador con umbral de confianza alto y derivacion a revision en los casos dudosos.
- Filtrado previo en pipelines de CI/CD: dado que el coste por peticion reportado es 0 USD y el modelo no genera texto, puede actuar como etapa de decision barata antes de invocar modelos mayores.
- Despliegue en local o en el borde: con 79M de parametros y soporte para `cpu` o `cuda`, es viable ejecutarlo en entornos sin GPU dedicada.

## Benchmarks y rendimiento

Los resultados disponibles provienen del split de test de `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones, cuatro flujos de trabajo), medidos en una RTX 5060 Ti. Las cifras de referencia son las publicadas por sus autores. No se han proporcionado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

| Modelo | Parametros | Accuracy | Soft acc | Brier (menor mejor) | ECE (menor mejor) | Score MAE (menor mejor) | Within 1 level |
|---|---|---|---|---|---|---|---|
| Byrne-Jev | ~79M | 0,630 | 0,509 | 0,134 | 0,045 | 0,428 | 0,915 |
| TypeSafe Jev 1.13.0 | cerrado | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 |
| Laya typed-decisions | 421M | 0,766 | 0,471 | 0,062 | 0,213 | 0,242 | no disponible |
| ModernBERT-base specialist | 149M | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 |
| Laya base (`laya`) | 421M | 0,362 | 0,332 | 0,316 | 0,175 | 0,694 | no disponible |
| Teacher self-agreement (techo) | no disponible | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Mayoría por pregunta | no disponible | 0,461 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Adivinanza aleatoria | no disponible | 0,318 | no disponible | no disponible | no disponible | no disponible | no disponible |

Metricas adicionales reportadas: divergencia KL de 0,228 y variacion total de 0,220. La latencia es de 111 ms en p50 y 158 ms en p95 por caso (5 preguntas en un unico forward pass, en GPU).

Exactitud por flujo de trabajo:

| Flujo de trabajo | Exactitud |
|---|---|
| Observabilidad de trazas de agente | 0,704 |
| Incidentes de seguridad | 0,654 |
| Atencion al cliente | 0,610 |
| Procesamiento de facturas | 0,552 |

Puntos destacados por el autor: la calibracion (ECE 0,045, la mas baja de la tabla), la calidad de las probabilidades (Brier mejor que la puntuacion publicada de Jev y soft accuracy mejor que el checkpoint ajustado de Laya) y una brecha de exactitud top-1 de 10 a 14 puntos por debajo de Jev y Laya, siendo facturas el flujo mas debil. La seccion de benchmarks publicos de la model card aparece truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 79M de parametros, los pesos ocupan aproximadamente 316 MB en FP32 y unos 158 MB en FP16, sin contar activaciones ni el tokenizador; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: la evaluacion publicada se realizo en una RTX 5060 Ti; cualquier GPU consumer con unos pocos GB de VRAM es suficiente. No se documentan requisitos para A100 o H100, innecesarios por el tamano del modelo.
- Compatibilidad con GPU consumer: si, el modelo cabe holgadamente en cualquier GPU consumer moderna e incluso en equipos integrados.
- Ejecucion en CPU: soportada explicitamente (`device="cpu"` en `DecisionAgent` y `JEV_DEVICE=cpu` en el servidor).
- Opciones de despliegue: el repositorio incluye `agent.py` (clase `DecisionAgent`) para uso en Python y `serve.py`, un servidor HTTP compatible con el protocolo de Jev implementado solo con la biblioteca estandar de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, algo esperable dado que el modelo no es generativo y no encaja en esos motores.
- Variables de entorno del servidor: `JEV_MODEL` (por defecto `model.pt`), `JEV_DEVICE` (`cpu` por defecto, admite `cuda`), `JEV_HOST` (`127.0.0.1`), `JEV_PORT` (8000), `JEV_API_KEY` (sin definir; si se establece, los clientes deben enviar `Authorization: Bearer <key>`), `JEV_MAX_LEN` (1024) y `JEV_HEAD_MAX_LEN` (256).
- Latencia y throughput: 111 ms en p50 y 158 ms en p95 por caso, con 5 preguntas resueltas en un unico forward pass sobre GPU. El coste reportado por peticion es 0 USD.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Accuracy (typed-decisions) | ECE | Disponibilidad |
|---|---|---|---|---|---|---|
| Byrne-Jev | ~79M | Apache-2.0 | Cabeza de decision tipada, no generativo | 0,630 | 0,045 | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13.0 | Cerrado | No disponible | Decision tipada | 0,727 | 0,144 | Cerrado |
| Laya typed-decisions | 421M | No disponible | Cabeza de decision tipada | 0,766 | 0,213 | No disponible en la informacion proporcionada |
| ModernBERT-base specialist | 149M | No disponible | Especialista basado en ModernBERT | 0,646 | 0,179 | No disponible en la informacion proporcionada |

Frente a estas alternativas, Byrne-Jev destaca por su tamano reducido (aproximadamente 5 veces menor que Laya) y por la mejor calibracion de la tabla (ECE 0,045), a costa de una exactitud top-1 inferior. Su licencia Apache-2.0 es mas permisiva que la de las alternativas cerradas o sin licencia documentada. No se dispone de informacion sobre contexto, idiomas o rendimiento en otros benchmarks de los modelos comparados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni puede responder a preguntas abiertas; solo puntua las opciones definidas por el usuario.
- Brecha de exactitud top-1: 0,630 frente a 0,727 de Jev y 0,766 de Laya, es decir, entre 10 y 14 puntos por debajo en el conjunto evaluado.
- Flujo mas debil: procesamiento de facturas, con 0,552 de exactitud, el mas bajo de los cuatro flujos reportados.
- Idiomas soportados no documentados; se desconoce si el modelo funciona correctamente fuera del ingles, idioma de los ejemplos de la model card.
- Contexto acotado: las posiciones llegan hasta 2048, con presupuestos de 1024 tokens para estado mas pregunta y 256 para pregunta mas opciones; estados largos pueden requerir truncado.
- Numero de descargas 0 y 1 like en el momento de la consulta, lo que indica adopcion practicamente nula y ausencia de validacion independiente.
- No se documentan sesgos conocidos ni comportamiento frente a entradas adversarias; el riesgo de alucinacion se limita a asignar probabilidad alta a la opcion incorrecta dentro de las definidas, no a inventar contenido.
- Requiere fijar un umbral de confianza (`answer_confidence`) para derivar casos dudosos a revision humana; sin ese control, los errores de clasificacion pasan directamente al flujo de negocio.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar la procedencia del tronco SpikeWhale y de los datos de entrenamiento, no documentados.
- La model card aparece truncada en la seccion de benchmarks publicos, por lo que no hay evidencia de rendimiento fuera del conjunto typed-decisions.
- El servidor `serve.py` esta implementado solo con la biblioteca estandar y no se documentan mecanismos de escalado, concurrencia o limitacion de tasa mas alla de la clave API opcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/Byrne-Jev-79M
- Conjunto de evaluacion citado: `LocalLLaMA/typed-decisions` (referenciado por nombre en la model card; no se proporciona URL)
- Modelos de referencia citados por nombre sin URL en la informacion disponible: TypeSafe Jev 1.13.0, Laya (`laya`), ModernBERT-base specialist
- No se han proporcionado enlaces a papers, blogs, repositorios adicionales ni demos.
