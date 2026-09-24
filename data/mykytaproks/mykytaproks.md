# mykytaproks/mykytaproks

## Resumen

Laya es un modelo especializado en decisiones estructuradas y tipadas ("typed decisions"), presentado como un fine-tuning sobre las 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente LocalLLaMA/typed-decisions. El modelo no está pensado para generación de texto abierto, sino para evaluar un estado de flujo de trabajo (workflow state) junto con una batería de preguntas tipadas y devolver respuestas con confianza calibrada en una única pasada hacia delante. Según la model card, su objetivo es servir como componente de decisión determinista y de bajísima latencia dentro de sistemas agénticos y pipelines de triaje.

El repositorio tiene 421.293.830 parámetros reales (unos 421 M) almacenados en safetensors, con un tamaño de repo de 0,8 GB, y se distribuye bajo licencia Apache 2.0. La model card atribuye el desarrollo a Convai Innovations y declara compatibilidad con `transformers`. No se especifican arquitectura concreta, longitud de contexto, idiomas soportados ni detalles del corpus de preentrenamiento.

Su relevancia actual radica en dos factores medibles: una latencia declarada de 34,6 ms en p50 (autoalojado, coste 0,00 USD por caso) y una calibración muy ajustada para su tamaño (ECE de 0,046, la mejor de la comparativa publicada), aunque su accuracy de 0,668 queda por debajo de TypeSafe Jev 1.13.0 (0,727) y del techo de Teacher Self-Agreement (0,735). Es, por tanto, una pieza orientada a despliegues de alto volumen donde el coste por inferencia y la latencia importan más que la precisión máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion solo indica `library_name: transformers`; no se detalla si es encoder, decoder o hibrida) |
| Parametros totales | 421.293.830 (~421 M), dato real de safetensors |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ; solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano de repo 0,8 GB) |
| Libreria | transformers |
| Tags declarados | laya, system-one, calibrated-decisions, rlcd, structured-decisions, typed-decisions, benchmark, endpoints_compatible |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna: la model card solo declara `library_name: transformers` y el uso de pesos safetensors. Por el numero de parametros (421 M) y por la tarea declarada (text-classification sobre decisiones tipadas), se trata de un modelo de talla media orientado a clasificacion y puntuacion, no a generacion autoregresiva de texto largo, pero esto es una inferencia y no un dato confirmado por el autor.

En cuanto al entrenamiento, la model card indica que Laya es un fine-tuning sobre los 1.200 casos de entrenamiento (6.000 decisiones) del benchmark LocalLLaMA/typed-decisions. La evaluacion se realiza sobre un conjunto de test oficial de 400 casos (2.000 decisiones) repartidos en cuatro dominios: Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents. El modelo se invoca con `agent.predict(state, questions)` y devuelve `result["answers"]`, lo que sugiere una formulacion de preguntas tipadas sobre un estado estructurado. Los tags incluyen `calibrated-decisions`, `rlcd` y `structured-decisions`, lo que apunta a un objetivo de calibracion de confianza, pero no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento.

## Capacidades

- Prediccion de decisiones tipadas: recibe un estado de flujo de trabajo y un conjunto de preguntas tipadas y devuelve respuestas en una sola pasada hacia delante.
- Calibracion de confianza: la model card reporta un ECE de 0,046, el mas bajo de la comparativa publicada, lo que indica probabilidades de confianza bien ajustadas para umbrales de decision.
- Clasificacion en los cuatro dominios del benchmark: Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents.
- Inferencia de baja latencia: 34,6 ms en p50 segun los datos declarados por el autor.
- Autoalojamiento sin coste por consulta: coste declarado de 0,00 USD por caso al ejecutarse en infraestructura propia.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Integracion via paquete Python: `pip install laya` y `laya.load(...)`.
- No hay evidencia disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio, modo "thinking" ni generacion de codigo. Estas capacidades deben considerarse no disponibles salvo verificacion adicional.

## Casos de uso

- Triaje de tickets de atencion al cliente: el modelo puede clasificar cada ticket contra un conjunto de preguntas tipadas (categoria, urgencia, requiere escalado) en una sola pasada, con 34,6 ms de latencia declarada, lo que permite procesar miles de tickets por minuto en una sola GPU.
- Enrutado de facturas en cuentas a pagar: dado el estado estructurado de una factura, responde a preguntas tipadas sobre validez, duplicidad o codigo contable, con probabilidades calibradas que permiten fijar umbrales de derivacion manual.
- Triaje de incidentes de seguridad: clasificacion de alertas en el dominio Security Incidents del benchmark, usando la confianza calibrada para separar automaticamente los casos claros de los que requieren analista humano.
- Observabilidad de trazas de agentes: el dominio Agent Trace Observability del benchmark sugiere su uso para etiquetar y evaluar automaticamente trazas de agentes (exito, fallo, bucle, uso incorrecto de herramienta) dentro de un pipeline de monitorizacion.
- Puerta de decision ("decision gate") en pipelines agénticos: integrado como componente que decide si un agente debe continuar, pedir mas informacion o escalar, apoyandose en el ECE bajo para fijar umbrales de confianza.
- Evaluacion offline de sistemas de decision: al ser un modelo pequeno (421 M) y autoalojable, sirve como baseline reproducible en harnesses de evaluacion internos, con coste marginal cero por caso.
- Procesamiento en el borde o en maquinas sin GPU de gama alta: con 421 M de parametros, puede ejecutarse en GPUs de consumo e incluso en CPU para volumenes moderados, algo inviable con modelos de decenas de miles de millones de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false` en el model-index):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| System One Decision Benchmark (text-classification) | LocalLLaMA/typed-decisions | Accuracy | 0,668 |
| System One Decision Benchmark (text-classification) | LocalLLaMA/typed-decisions | Brier score | 0,467 |

Comparativa cabeza a cabeza publicada en la model card:

| Modelo | Tipo | Accuracy | Soft acc | Brier | ECE | Score MAE | Within 1 nivel | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned) | fine-tuned | 0,668 | 0,547 | 0,467 | 0,046 | 0,000 | 0,000 | 34,6 ms | 0,00 USD (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149 M) | specialist | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | techo | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni resultados de los dominios individuales del test set.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP16 y 1,7 GB en FP32 para los 421 M de parametros; en int8, del orden de 0,42 GB. Estas cifras son calculos a partir del numero de parametros, no datos publicados por el autor.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente incluso en FP32.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para una sola instancia; se justificarian unicamente para maximizar throughput con batching agresivo.
- Despliegue: el paquete oficial es `laya` (`pip install laya`), con carga via `laya.load(...)`. Al ser un modelo de `transformers` en safetensors, es compatible con despliegues estandar basados en la libreria (por ejemplo transformers + FastAPI/Triton). No se documenta soporte explicito de vLLM, TGI, llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- Latencia declarada: 34,6 ms en p50 por caso (hardware no especificado en la model card). No se publica throughput (tokens/s o casos/s) ni requisitos de memoria en produccion.
- Coste declarado: 0,00 USD por caso en modalidad autoalojada, frente a 0,0004 USD por caso de la API de TypeSafe Jev 1.13.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | Brier | ECE | Latencia (p50) | Licencia / disponibilidad |
|---|---|---|---|---|---|---|---|
| Laya | 421 M | no disponible | 0,668 | 0,467 | 0,046 | 34,6 ms | Apache 2.0, pesos safetensors en HuggingFace |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0,727 | 0,148 | 0,144 | 710 ms | no disponible, se consulta via API a 0,0004 USD/caso |
| ModernBERT-base | 149 M | no disponible | 0,646 | 0,119 | 0,179 | 349 ms | no disponible en esta ficha |
| Teacher Self-Agreement (techo) | no disponible | no disponible | 0,735 | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los tres modelos incluidos por el autor en su propia model card, todos ellos evaluados sobre el mismo benchmark. No se dispone de datos de contexto, licencia o parametros de los competidores mas alla de lo indicado.

## Limitaciones y advertencias

- Precision inferior a la referencia: 0,668 de accuracy frente a 0,727 de TypeSafe Jev 1.13.0 y 0,735 del techo de Teacher Self-Agreement, una diferencia de casi 6 puntos porcentuales respecto al mejor sistema evaluado.
- Brier score elevado: 0,467 frente a 0,119 de ModernBERT-base y 0,148 de TypeSafe Jev 1.13.0, lo que indica un error cuadratico considerable en las probabilidades emitidas, pese al ECE bajo. Ambos indicadores miden aspectos distintos de la calibracion y deben interpretarse juntos.
- Metricas de score a cero: score MAE y within 1 level aparecen como 0,000, lo que sugiere que estas metricas no se calcularon o no aplican al modelo; no deben interpretarse como rendimiento perfecto.
- Los resultados del model-index estan marcados como `verified: false`: son cifras declaradas por el autor y no han sido validadas de forma independiente.
- Ambito limitado a cuatro dominios (Agent Trace Observability, Customer Service, Invoice Processing, Security Incidents) y a un unico benchmark; no hay evidencia de generalizacion fuera de ellos.
- Sin informacion sobre idiomas soportados ni sobre el idioma del benchmark: se desconoce el comportamiento multilingue.
- Sin informacion sobre sesgos, composicion del dataset de entrenamiento, procesos de filtrado ni evaluaciones de seguridad.
- Sin informacion sobre longitud de contexto, lo que impide saber si admite estados de flujo de trabajo extensos.
- El modelo no esta orientado a generacion de texto libre, codigo ni matematicas; usarlo fuera de su tarea de clasificacion/decisión tipada no esta respaldado por datos.
- Inconsistencia de identificacion: la ficha de HuggingFace consultada corresponde al ID `mykytaproks/mykytaproks`, mientras que la model card hace referencia a `convaiinnovations/laya-typed-decisions`. Conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; no se declaran restricciones adicionales de uso aceptable.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace (ID consultado): https://huggingface.co/mykytaproks/mykytaproks
- Repositorio referenciado en la model card: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Organizacion del autor segun la model card: https://huggingface.co/convaiinnovations
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los enlaces encontrados corresponden a generadores de modelos 3D y a rankings generales de LLM, sin relacion con Laya). No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados.
