# hanzoai/kai-1-agent

## Resumen

Kai-1-agent (identificador en HuggingFace `hanzoai/kai-1-agent`) es un modelo de clasificación de texto basado en un encoder ModernBERT-large de 421 millones de parámetros, presentado en su model card bajo el nombre comercial "Laya Typed-Decisions". Lo distribuye el usuario hanzoai, si bien la documentación técnica y los enlaces apuntan al proyecto Laya de convaiinnovations, del que este checkpoint sería un ajuste fino especializado. Se trata de un modelo no autorregresivo, denominado "System 1 decision model", diseñado para emitir decisiones tipadas (tipos `noul`, `choice` y `score`) sobre estados de agente y preguntas estructuradas.

El problema que resuelve es concreto: en lugar de generar texto libre, el modelo recibe un estado (por ejemplo, una traza de agente, un ticket de atención al cliente, un documento de factura o un informe de incidente) junto con una batería de preguntas tipadas, y devuelve una distribución de probabilidad calibrada para cada una de ellas. Está ajustado sobre cuatro flujos sintéticos: observabilidad de trazas de agente, atención al cliente, procesamiento de facturas e incidentes de seguridad.

Su relevancia actual radica en dos factores. Por un lado, ofrece un enfoque de "decisiones tipadas" con probabilidades honestas gracias al método RLCD (reward como regla de puntuación estrictamente propia), lo que resulta útil en observabilidad y triaje automatizado. Por otro, es un modelo pequeño (421M) que se puede ejecutar en hardware de consumo, con un contexto de 1024 tokens y licencia Apache 2.0, lo que facilita su integración en producción sin dependencias de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT-large, no autorregenerativo, con cabeza de clasificación para decisiones tipadas |
| Parametros totales | 421.293.830 (421M), confirmado en los safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors, 0.8 GB, compatible con transformaciones externas tipo bitsandbytes/ONNX) |
| Idiomas soportados | Ingles unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargable con `transformers` y con la libreria `laya` |
| Pipeline declarado | `text-classification` |
| Libreria | transformers |
| Tamano del repositorio | 0.8 GB |
| Compatibilidad | `endpoints_compatible` (segun los tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT-large de 421M de parametros con una cabeza de decision que soporta tres primitivas tipadas: `noul` (etiqueta de uno entre N), `choice` (eleccion entre opciones, con un presupuesto fijo de 256 tokens compartido entre todas las opciones) y `score` (puntuacion, con soporte para preguntas ordinales mediante ranked probability score). El modelo no genera texto: produce directamente una distribucion de probabilidad sobre las respuestas a cada pregunta planteada.

El entrenamiento parte del checkpoint base `convaiinnovations/laya` (ModernBERT-large, 512 tokens de contexto, uso general en ingles) y se ajusta sobre el split de entrenamiento del benchmark de typed-decisions: 1.200 casos y 6.000 decisiones. La innovacion principal es RLCD (Reinforcement Learning from Calibrated Decisions): la politica emite una distribucion, la exploracion anade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuacion estrictamente propia (logaritmica + esferica, mas ranked probability score para preguntas ordinales), de modo que la recompensa esperada solo se maximiza reportando probabilidades honestas. Las actualizaciones usan REINFORCE con baseline de media de grupo, junto con entropia cruzada suave contra las distribuciones del profesor (teacher). El proceso es reproducible en un notebook publico y tarda aproximadamente 4-5 horas en una configuracion gratuita de 2xT4 en Kaggle.

## Capacidades

- Clasificacion de texto con decisiones tipadas: emitir respuestas de tipo `noul`, `choice` y `score` a partir de un estado y una lista de preguntas.
- Prediccion calibrada: el entrenamiento RLCD optimiza reglas de puntuacion propias, de modo que las distribuciones de salida buscan ser honestas (Brier 0.062 en el checkpoint).
- Procesamiento por lotes: `agent.predict_batch(states, questions)` puntua multiples estados en pasadas compartidas, con respuestas identicas a las de llamadas individuales.
- Routing explicito mediante la clase `Router` de la libreria `laya`, con seleccion manual del checkpoint `typed-decisions` y opcion de preload/attach para mantener el modelo residente.
- Cuatro flujos de trabajo soportados de forma nativa: observabilidad de trazas de agente, atencion al cliente, procesamiento de facturas e incidentes de seguridad.
- Carga optimizada: `laya.load()` evita la inicializacion aleatoria descartable y reduce el tiempo de carga aproximadamente 10x.
- No soporta generacion de texto libre, tool calling, agentes multi-paso ni vision. Es un modelo especializado de clasificacion, no un LLM generativo.

## Casos de uso

- Triaje de facturas: el modelo procesa documentos de facturacion con una precision de 0.804 en el flujo de invoice processing, la mas alta de sus cuatro especialidades, lo que lo hace adecuado para clasificar y validar campos de facturas de forma masiva antes de pasarlas a un ERP.
- Observabilidad de agentes: a partir de una traza de agente (agent-trace observability, 0.730 de precision) el modelo responde preguntas tipadas sobre el comportamiento observado, util para monitorizar pipelines de agentes y detectar desviaciones sin construir heuristicas ad hoc.
- Clasificacion de incidentes de seguridad: con 0.766 de precision, permite etiquetar y puntuar la severidad de alertas de seguridad de forma automatica dentro de un SOC, reduciendo el volumen que llega a analistas humanos.
- Atencion al cliente automatizada: con 0.764 de precision en el flujo de customer service, puede clasificar y puntuar interacciones de soporte (tipo de peticion, urgencia, intencion) y alimentar colas de enrutado, siempre que el texto de entrada quepa en los 1024 tokens de contexto.
- Enrutado de decisiones en pipelines de agentes: la clase `Router` permite integrar este checkpoint como un decoder de decisiones tipadas dentro de un sistema mayor, seleccionandolo explicitamente para las cuatro tareas para las que fue entrenado.
- Procesamiento por lotes en colas de trabajo: `predict_batch` permite puntuar grandes colas de estados compartiendo pasadas hacia delante, adecuado para triaje masivo nocturno o procesamiento diferido.
- Evaluacion de calibracion en investigacion: al exponer distribuciones y metricas de Brier, ECE y MAE de puntuacion, sirve como referencia para estudiar calibracion en modelos de decision no autorregenerativos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 400 casos de test y 2.000 decisiones, medidos en el split de test oficial:

| Modelo | Accuracy | Soft acc | Brier | ECE | Score MAE |
|---|---|---|---|---|---|
| Este checkpoint | 0.766 | 0.471 | 0.062 | 0.213 | 0.242 |
| TypeSafe Jev 1.13.0 (publicado por terceros) | 0.727 | 0.580 | 0.148 | 0.144 | 0.391 |
| Techo de autoacuerdo del profesor (teacher ceiling) | 0.735 | no disponible | no disponible | no disponible | no disponible |
| Especialista ModernBERT-base (publicado) | 0.646 | no disponible | no disponible | no disponible | no disponible |
| Clase mayoritaria por pregunta | 0.461 | no disponible | no disponible | no disponible | no disponible |
| Adivinanza aleatoria | 0.318 | no disponible | no disponible | no disponible | no disponible |
| `laya` (sin ajuste fino) | 0.362 | 0.332 | 0.316 | 0.175 | 0.694 |
| `laya-multilingual` (sin ajuste fino) | 0.342 | 0.326 | 0.439 | 0.285 | 0.687 |

Desglose por flujo de trabajo:

| Flujo | Accuracy |
|---|---|
| Procesamiento de facturas | 0.804 |
| Incidentes de seguridad | 0.766 |
| Atencion al cliente | 0.764 |
| Observabilidad de trazas de agente | 0.730 |

Desglose por primitiva:

| Tipo | Accuracy | ECE | n |
|---|---|---|---|
| `noul` | 0.857 | 0.192 | 600 |
| `choice` | 0.733 | 0.255 | 600 |
| `score` | 0.723 | 0.199 | 800 |

El autor advierte que las cifras de Jev son publicadas por terceros y no medidas en este proyecto, que no hay acceso a la API de TypeSafe y que los tamanos de muestra y los prompts difieren, por lo que la comparacion debe tomarse como indicativa.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 0.8 GB (el repositorio completo mide 0.8 GB para 421M de parametros, consistente con precision fp16/bf16). Con activaciones y contexto de 1024 tokens, la inferencia cabria en torno a 1,5-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. En datacenter, A100, H100, L40S o T4 son suficientes y quedan sobredimensionadas para el tamano del modelo. En consumo, cabe en GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: si, sin necesidad de cuantizacion, dado el tamano de 421M de parametros.
- Opciones de despliegue: la libreria nativa `laya` (`pip install laya`), el ecosistema `transformers` y el tag `endpoints_compatible` del repositorio. Al ser un encoder no autorregenerativo con cabeza de clasificacion, los runners especificos de LLM generativos (llama.cpp, Ollama) no aplican directamente.
- Latencia y throughput: no se publican cifras concretas. La documentacion indica que `laya.load()` es aproximadamente 10x mas rapido que la inicializacion estandar con `transformers`, y que `predict_batch` comparte pasadas hacia delante para el procesamiento por lotes.
- Nota operativa: si el checkpoint esta en una ruta critica, la model card recomienda mantenerlo residente mediante `router.preload(["typed-decisions"])` o `router.attach(...)` en lugar de cargarlo por peticion.
- Incidencia conocida: si `laya.load()` se queda colgado, es por el sondeo de TensorFlow al importar `transformers`; se resuelve ejecutando con `USE_TF=0`.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Accuracy | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| Este checkpoint (`typed-decisions`) | ModernBERT-large | 421M | 1024 | 0.766 | Apache 2.0 | Ingles |
| `convaiinnovations/laya` | ModernBERT-large | 421M | 512 | 0.362 (sin ajuste fino) | Apache 2.0 | Ingles |
| `convaiinnovations/laya-multilingual` | mmBERT-base | 322M | 1024 | 0.342 (sin ajuste fino) | no disponible en la informacion | 100+ idiomas |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | no disponible | 0.727 | no disponible | no disponible |
| Especialista ModernBERT-base | ModernBERT-base | no disponible | no disponible | 0.646 | no disponible | no disponible |

La comparacion con Jev procede de cifras publicadas por terceros y no medidas por el autor de este modelo, con tamanos de muestra y prompts distintos, por lo que es solo orientativa.

## Limitaciones y advertencias

- Es un especialista, no un modelo general: fue ajustado sobre cuatro flujos sinteticos concretos. En cualquier otra tarea se comportara como el checkpoint base `laya` o peor.
- Soft accuracy inferior a Jev (0.471 frente a 0.580): su argmax es mejor, pero sus distribuciones de probabilidad se aproximan menos al profesor.
- Sobreconfianza persistente: ECE de 0.213 frente al 0.144 de Jev. El parametro `temperature_by_options` se heredo del checkpoint base y anula las temperaturas por tipo ajustadas para este modelo; hay que reajustarlo sobre datos propios de validacion antes de fiarse de las probabilidades.
- Temperaturas ajustadas sobre datos de entrenamiento: los valores `[1.0148, 1.0374, 1.0575]` se ajustaron sobre una porcion del mismo conjunto de entrenamiento (issue #186 del repositorio Laya), lo que explica que esten tan cerca de 1.0. Hasta que el checkpoint se reajuste, la confianza debe tratarse como no calibrada.
- Idioma: solo ingles. Para otros idiomas la model card remite a `laya-multilingual`.
- Preguntas de tipo `choice`: deben mantenerse por debajo de unas 20 opciones, ya que todas comparten un presupuesto fijo de 256 tokens de cabeza y un espacio de etiquetas grande deja pocos tokens por etiqueta, con caida acusada de la precision.
- No debe usarse como opcion por defecto silenciosa: `Router` no selecciona este checkpoint automaticamente salvo que se construya con `auto_task_detection=True`.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de clasificaciones erroneas o mal calibradas fuera de la distribucion de los cuatro flujos entrenados.
- Discrepancia de identificacion: el identificador de HuggingFace proporcionado es `hanzoai/kai-1-agent`, mientras que la model card describe el checkpoint `convaiinnovations/laya-typed-decisions`. Conviene verificar que el repositorio cargado corresponde realmente al modelo documentado antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero los datos de entrenamiento son flujos sinteticos, por lo que la transferencia a datos reales debe validarse empiricamente.
- Los resultados de busqueda web devueltos no contienen informacion tecnica util sobre este modelo; no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanzoai/kai-1-agent
- Checkpoint documentado en la model card: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint base: https://huggingface.co/convaiinnovations/laya
- Checkpoint multilingue: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio GitHub del proyecto: https://github.com/NandhaKishorM/laya
- Notebook de reproduccion del ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Issue sobre temperaturas ajustadas en entrenamiento: https://github.com/NandhaKishorM/laya/issues/186
- Documentacion (enlace truncado en la model card): https://nandhakishorm.github
