# gtm-k/laya-maintenance-decision-assist

## Resumen

Laya Maintenance Decision Assist es un ajuste fino (fine-tune) del modelo base Laya de convaiinnovations, publicado por el usuario gtm-k bajo licencia Apache 2.0. El modelo resuelve una tarea muy concreta y acotada: leer un conjunto de informes de sensores con marca temporal y extraer el ultimo flag explicitamente reportado para un sensor objetivo, devolviendo una de cuatro etiquetas posibles (OK, FAULT, STUCK_VALUE o unknown) junto con probabilidades y un valor de confianza.

Tecnicamente se apoya en la arquitectura Laya, derivada de ModernBERT-large, con aproximadamente 421 millones de parametros y una interfaz de decisiones tipadas (Choice, Score y Noul) que devuelve valores estructurados sin generar tokens de salida. Es un modelo de investigacion de tipo encoder con cabezas de clasificacion, no un modelo generativo: no produce texto libre ni explicaciones, solo decisiones tipadas con probabilidades.

Su relevancia actual es limitada y experimental. El propio autor declara una precision del 57,4 por ciento sobre una evaluacion sintetica de 64 casos, frente al 25 por ciento esperado por azar en cuatro opciones y al 39,8 por ciento del modelo base original. El modelo esta pensado como demostracion de investigacion y no como componente de produccion, y no cuenta con validacion experta ni con datos del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laya basada en ModernBERT-large (encoder transformer con cabezas de decision tipada) |
| Parametros totales | 421.293.830 (aproximadamente 421 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens codificados en total; 192 tokens para la cabeza de pregunta (instrucciones y opciones incluidas) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,7 GB |
| Modelo base | convaiinnovations/laya (revision 55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851) |
| Relacion con el modelo base | fine-tune |
| Interfaz de salida | Choice, Score y Noul (0 tokens generados) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de Laya, un encoder basado en ModernBERT-large inicializado desde la revision 55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851 de convaiinnovations/laya. La especializacion se hizo con entrenamiento supervisado de entropia cruzada (CE) exclusivamente, sin recompensa de RL ni suavizado de etiquetas (label smoothing). Se uso una tasa de aprendizaje de 3e-6 para el encoder y de 1.5e-5 para la cabeza, con microbatch de 1, acumulacion de 4 y un maximo de 256 actualizaciones o 1024 exposiciones por celda. El conjunto de entrenamiento consta de 256 casos de mantenimiento unicos y dirigidos.

La seleccion del punto de control se hizo por NLL cruda en desarrollo sobre las actualizaciones 32, 64, 128 y 256, con la semilla representativa 7601 fijada antes de la evaluacion reservada. Los pesos publicados corresponden a la actualizacion 64. El entrenamiento se realizo localmente en una GPU RTX A4500 Laptop. La temperatura de Choice (1.774067) se ajusto previamente sobre 32 casos sinteticos de calibracion con cuatro ordenes y se aplica al bucket nativo compartido choice:3-5, de modo que las preguntas de 3 y 5 opciones no se calibraron de forma independiente. La especializacion es solo para la tarea de mantenimiento y no es un checkpoint fusionado de producto y mantenimiento.

## Capacidades

- Extraccion del ultimo flag reportado para un sensor objetivo a partir de informes con marca temporal.
- Clasificacion en cuatro etiquetas: OK, FAULT, STUCK_VALUE y unknown.
- Salida de probabilidades y un valor de confianza asociado a la decision.
- Tres interfaces de decision tipada: Choice (elegir una opcion suministrada), Score (posicion ponderada por probabilidad sobre una rubrica ordenada) y Noul (probabilidad de que una proposicion sea verdadera).
- Funcionamiento sin generacion de tokens: Laya devuelve decisiones estructuradas, no texto libre.
- Tarea entrenada y evaluada especificamente para el dominio de mantenimiento; las interfaces Score y Noul se conservan de forma nativa, pero su calidad no esta establecida.
- Soporte exclusivo de ingles.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de alertas de mantenimiento: el modelo puede procesar una secuencia de informes con marca temporal de un sensor concreto y devolver el ultimo flag explicito, lo que permitiria clasificar rapidamente el estado reportado antes de pasarlo a un sistema de gestion de activos.
- Preprocesado para sistemas de gestion de mantenimiento (CMMS/EAM): uso como extractor ligero que normaliza el ultimo estado reportado de un sensor a una etiqueta estructurada que alimente una base de datos o un panel de control.
- Filtrado y reduccion de ruido en flujos de telemetria textual: dado que devuelve solo una etiqueta con probabilidad, encaja como etapa de normalizacion previa a un sistema mayor que necesite valores categoricos limpios.
- Enrutamiento a revision humana (human-in-the-loop): dadas sus limitaciones de precision, tiene sentido como primer clasificador que derive los casos ambiguos o de baja confianza a un operario, usando la confianza como criterio de escalado.
- Extraccion estructurada para auditoria y trazabilidad: registrar la decision y su confianza por cada informe permite dejar una traza de como se interpreto cada flag a lo largo del tiempo.
- Investigacion sobre decisiones tipadas: las interfaces Choice, Score y Noul permiten experimentar con mecanismos de decision estructurada sin generacion de texto en entornos de investigacion.
- Generacion o etiquetado asistido de datos sinteticos: puede emplearse como componente dentro de un pipeline que produzca o valide casos sinteticos de mantenimiento, siempre con supervision.
- Prototipado de demostraciones interactivas: integrado en la Space asociada, sirve para mostrar formularios guiados de Choice, Score y Noul en una demo exploratoria, no como capacidad validada.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Precision media sobre ordenes de opciones | 57,4 % |
| Misma respuesta en los cuatro ordenes de opciones | 45/64 casos |
| Correcto en los cuatro ordenes de opciones | 30/64 casos |
| Datos de evaluacion | 64 casos sinteticos en 16 grupos de contraste |
| Validacion experta o del mundo real | ninguna |
| Azar uniforme con cuatro opciones | 25 % de precision esperada |
| Laya base original en los mismos casos | 39,8 % |
| Parser de reglas exactas sobre la misma gramatica controlada | 100 % (64/64); no es validacion de texto libre general |
| Score en tareas sinteticas antiguas | 25,0 % |
| Noul en tareas sinteticas antiguas | 48,5 % |
| Salvaguarda de progreso | no cumplida: el recall de STUCK_VALUE cayo del 65,1 % al 57,3 % en tres semillas de entrenamiento |

Los cuatro ordenes de opciones son vistas correlacionadas de los mismos casos, no 256 ejemplos independientes. Los resultados miden la tarea concreta entrenada, no las decisiones mas amplias de la demo. Un acierto por azar equilibrado verdadero/falso tendria un 50 por ciento esperado, por lo que las tareas antiguas de Score y Noul no validan las demos experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,7 GB (coincide con el tamano del repositorio); en fp16 alrededor de 842 MB y en int8 alrededor de 421 MB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM dedicada es suficiente para el modelo; el propio autor lo entreno en una RTX A4500 Laptop.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en muchos equipos sin GPU dedicada, dado el reducido tamano de 421 M de parametros.
- Opciones de despliegue: el autor indica que `predict.py` invoca el `laya.Agent` nativo y que no se reclama compatibilidad con el pipeline generico de Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas; el repositorio solo distribuye safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al no generar tokens (0 tokens de salida), la latencia esperada es la de un encoder de 421 M, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya Maintenance Decision Assist (este modelo) | 421 M | 512 tokens (192 para la cabeza de pregunta) | 57,4 % en 64 casos sinteticos | apache-2.0 | safetensors en HuggingFace |
| convaiinnovations/laya (modelo base) | aproximadamente 421 M (segun la familia Laya) | no disponible en la informacion proporcionada | 39,8 % en los mismos 64 casos | no disponible en la informacion proporcionada | HuggingFace |
| Parser de reglas exactas sobre la misma gramatica controlada | no aplica | no aplica | 100 % (64/64) en gramatica controlada, no en texto libre general | no aplica | no aplica |

No se dispone de informacion sobre otros modelos comparables de clasificacion de flags de mantenimiento con los que contrastar parametros, contexto o rendimiento. Cualquier alternativa fuera de las anteriores queda como no disponible.

## Limitaciones y advertencias

- Lenguaje sintetico y controlado: las etiquetas fueron revisadas por un agente, no por expertos humanos.
- Sensibilidad al enunciado, al alcance y al orden de las opciones; probabilidades altas pueden ser incorrectas. La confianza no equivale a exactitud.
- No esta validado para prediccion de fallos, diagnostico, planificacion de mantenimiento ni decisiones de parar o continuar la produccion. Un flag OK en un informe no constituye una autorizacion de seguridad.
- Solo ingles; no se declara soporte multilingue.
- Limite estricto de entrada: 512 tokens codificados en total, de los cuales 192 corresponden a la cabeza de pregunta, incluidas instrucciones y opciones. Quien use el SDK debe comprobar las longitudes por su cuenta.
- Las probabilidades de accion auxiliares no autorizan ninguna accion.
- La salvaguarda de progreso del estudio no se cumplio: el recall de STUCK_VALUE cayo del 65,1 % al 57,3 % en tres semillas, lo que indica inestabilidad en esa clase.
- Las interfaces Score y Noul conservan la interfaz nativa, pero su calidad mas amplia no esta establecida; las precisiones antiguas (25,0 % y 48,5 %) no validan las demos experimentales.
- La temperatura de Choice se calibro sobre un bucket compartido choice:3-5, de modo que las preguntas de 3 y 5 opciones no se calibraron de forma independiente.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopcion ni de revision por parte de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero el propio autor la publica como version experimental sin validacion del mundo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gtm-k/laya-maintenance-decision-assist
- Demo (Space): https://huggingface.co/spaces/gtm-k/maintenance-decision-assist
- Evaluacion de mantenimiento (EVALUATION.md): https://huggingface.co/gtm-k/laya-maintenance-decision-assist/blob/main/EVALUATION.md
- Script de inferencia (predict.py): https://huggingface.co/gtm-k/laya-maintenance-decision-assist/blob/main/predict.py
- Dependencias (requirements.txt): https://huggingface.co/gtm-k/laya-maintenance-decision-assist/blob/main/requirements.txt
- Ejemplo de peticion (example_request.json): https://huggingface.co/gtm-k/laya-maintenance-decision-assist/blob/main/example_request.json
- Diagrama de flujo (model-flow.svg): https://huggingface.co/gtm-k/laya-maintenance-decision-assist/blob/main/model-flow.svg
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados correspondian a herramientas de gestion de etiquetas (Google Tag Manager), a una empresa de construccion (GTM Batiment) y a un extranet de La Poste, coincidencias ajenas al modelo.
