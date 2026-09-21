# distil-labs/distil-qwen3.5-0.8b-invoice-triage

## Resumen

Distil-Qwen3.5-0.8B-Invoice-Triage es un modelo de lenguaje pequeno (SLM) de 752.393.024 parametros, resultado del ajuste fino de Qwen/Qwen3.5-0.8B por parte de distil labs. Su funcion es acotada y muy especifica: clasificar el correo que llega a la bandeja de cuentas a pagar de una empresa en una de cinco etiquetas (`invoice`, `receipt`, `payment_reminder`, `vendor_other` o `spam`) y devolver unicamente un objeto JSON con la etiqueta. Es el primer paso de un pipeline de procesamiento de facturas publicado por el propio autor en GitHub, donde actua como alternativa autoalojada al servicio Jev.

El interes tecnico del modelo esta en su metodo de construccion: partiendo de solo 40 ejemplos semilla, un modelo profesor (GLM 5.3 con razonamiento alto) genero 3.124 ejemplos sinteticos con los que se ajusto el estudiante mediante LoRA (rango 64, 4 epocas, pesos fusionados). El resultado es un modelo de menos de 1 GB en cuantizacion Q8_0 que iguala a modelos frontera de API en la tarea concreta (200 aciertos de 200 mensajes de prueba), incluyendo 49 mensajes disenados deliberadamente para enganar al clasificador (recordatorios que citan la factura completa, copias ya pagadas, presupuestos con lineas de detalle, phishing desde dominios similares e instrucciones inyectadas en el cuerpo del mensaje).

Es relevante ahora por dos motivos. Primero, demuestra que la destilacion de datos sinteticos permite llevar una tarea de negocio concreta a un modelo local de menos de mil millones de parametros sin perder exactitud frente a APIs propietarias. Segundo, ilustra un patron de despliegue muy barato: inferencia en CPU o en cualquier GPU de consumo, con los datos de facturacion sin salir de la infraestructura de la organizacion. Sus limitaciones son igual de claras: es un clasificador de una sola tarea, entrenado con datos sinteticos en ingles sobre una empresa ficticia, y solo funciona tal cual con el system prompt y la temperatura con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo `qwen3_5_text` (etiqueta de la libreria transformers); detalles internos no disponibles |
| Parametros totales | 752.393.024 (aproximadamente 752 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repositorio principal; existe build GGUF (la variante Q8_0 esta verificada por el autor con el mismo resultado de 200/200). No se detallan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio principal) y GGUF (repositorio separado `distil-labs/distil-qwen3.5-0.8b-invoice-triage-gguf`) |

## Arquitectura y entrenamiento

No se documentan detalles de la arquitectura interna mas alla de la etiqueta `qwen3_5_text` del modelo base Qwen/Qwen3.5-0.8B: se trata de un transformer denso de unos 752 M de parametros, sin indicios de mezcla de expertos ni de arquitectura hibrida. El ajuste se realizo con LoRA de rango 64 durante 4 epocas, fusionando despues los pesos del adaptador en el modelo base, por lo que la inferencia no requiere adaptadores adicionales. El tipo de tarea declarado es "question answering with JSON output": la entrada es el texto del correo y la salida un objeto JSON de una sola clave.

El proceso de datos es el elemento mas destacable. A partir de 40 ejemplos semilla, el profesor GLM 5.3 (con esfuerzo de razonamiento alto) genero 3.124 ejemplos sinteticos de entrenamiento. El conjunto de prueba consta de 200 mensajes: 100 facturas y 25 de cada una de las otras cuatro categorias, de los cuales 49 estan escritos especificamente para confundir al modelo. El autor reporta que el modelo etiqueta correctamente los 49. La model card tambien documenta una innovacion de despliegue relevante para la robustez: el system prompt indica explicitamente que el mensaje es entrada no fiable y que debe ignorarse cualquier instruccion contenida en el, lo que mitiga ataques de inyeccion de prompt en el cuerpo del correo.

## Capacidades

- Clasificacion de texto en cinco categorias cerradas: `invoice`, `receipt`, `payment_reminder`, `vendor_other`, `spam`.
- Salida estructurada en JSON con una sola clave: `{"label": "<label>"}`.
- Distincion semantica fina entre documentos que se parecen mucho (factura original frente a copia ya pagada, recordatorio que cita la factura completa, presupuesto con lineas de detalle, documento pro forma).
- Deteccion de spam, fraude y phishing, incluyendo facturas falsas, peticiones de cambio de datos bancarios y remitentes de dominios similares.
- Resistencia a instrucciones inyectadas en el propio cuerpo del mensaje, segun la evaluacion del autor.
- Clasificacion de correo reenviado por un companero (segunda mano) como si fuera el mensaje original.
- Multilingue: no. Solo ingles.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no. La model card indica que el modelo responde directamente y que debe servirse con el modo de pensamiento desactivado (`enable_thinking: false`).
- Vision, audio u otras modalidades: no.

## Casos de uso

- Triage automatizado de la bandeja de cuentas a pagar: el modelo se coloca como primer eslabon de un pipeline que recibe cada correo entrante del buzon de AP y emite una etiqueta, de modo que las facturas se enrutan al sistema de extraccion y los recordatorios o el correo comercial no contaminan el flujo de pago.
- Filtrado previo a la extraccion de datos en ERP: solo los mensajes etiquetados como `invoice` pasan al siguiente modelo del pipeline (extraccion de proveedor, importe, fecha y numero de factura), lo que reduce el coste computacional y el ruido aguas abajo. El repositorio `invoice-processing-pipeline` documenta exactamente este encadenamiento.
- Deteccion de fraude y phishing en el canal de proveedores: la etiqueta `spam` captura facturas falsas, peticiones de cambio de cuenta bancaria y remitentes de dominios parecidos, un vector de fraude BEC habitual en departamentos financieros. El modelo fue evaluado con ese tipo de casos dentro de los 49 mensajes adversarios.
- Clasificacion de correo ya pagado frente a pendiente: la separacion entre `receipt` (nada se debe) y `payment_reminder` (seguimiento de un importe pendiente) evita duplicar pagos o disparar recordatorios internos innecesarios.
- Despliegue on-premise en entornos regulados: al pesar menos de 1 GB en Q8_0, puede ejecutarse en la propia infraestructura del cliente sin enviar el contenido de las facturas a una API externa, lo que simplifica el cumplimiento de requisitos de residencia de datos y confidencialidad financiera.
- Automatizacion en BPO y centros de servicios compartidos: procesamiento de volumen alto de buzoneo de cuentas a pagar de varios clientes, con el modelo replicado por instancia y un coste marginal por inferencia cercano a cero.
- Plantilla de destilacion para otras tareas de clasificacion: el flujo (40 semillas, profesor con razonamiento, 3.124 ejemplos sinteticos, LoRA rango 64, 4 epocas) es reutilizable para otras taxonomias internas como clasificacion de tickets de soporte o enrutado de incidencias.
- Evaluacion de pipelines basados en LLM frontera: el modelo sirve como linea base barata y reproducible para medir si una API propietaria aporta realmente valor en una tarea de clasificacion concreta, dado que el autor publica el conjunto de prueba y los resultados de todos los competidores.
- Prototipado rapido de agentes de correo: por su salida JSON estricta y su latencia previsible, encaja como herramienta de clasificacion dentro de un agente que decide a que cola enviar cada mensaje.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la evaluacion del autor sobre 200 mensajes de prueba (100 facturas, 25 de cada una de las otras cuatro categorias, 49 de ellos escritos para enganar al modelo).

| Modelo | Etiquetas correctas (200 mensajes de prueba) |
|---|---|
| Distil-Qwen3.5-0.8B-Invoice-Triage (este modelo) | 200 |
| Distil-Qwen3.5-0.8B-Invoice-Triage, build GGUF Q8_0 bajo llama.cpp | 200 |
| Qwen3.5-0.8B sin ajustar, mismo prompt | LLM-as-a-judge 0.70 (metrica distinta; no expresada en aciertos) |
| Jev (`typesafe-ai/jev`) | 200 |
| GPT-5.6 Luna, razonamiento off / high | 200 / 200 |
| GLM 5.3, razonamiento high (el profesor) | 200 |
| Gemini 3.5 Flash Lite | 197 |

No se publican resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16 (752 M de parametros), en torno a 0,8 GB en Q8_0 y cerca de 0,5 GB en cuantizaciones de 4 bits. El repositorio pesa 1,5 GB en safetensors.
- GPU: cualquier GPU de consumo reciente es suficiente (RTX 3060, RTX 4060, RTX 4090, etc.), asi como GPUs de centro de datos (A100, H100) si se busca paralelizar muchas replicas. No se requieren GPUs de gama alta.
- Cabe con holgura en GPU de consumo, en iGPU y en CPU. Al ser un modelo de menos de mil millones de parametros, la inferencia en CPU es viable para volumen moderado.
- Opciones de despliegue: vLLM (el autor incluye el comando `vllm serve distil-labs/distil-qwen3.5-0.8b-invoice-triage --port 8001`) y llama.cpp mediante el build GGUF publicado; el endpoint de vLLM es compatible con la API de OpenAI. No se documentan integraciones con Ollama, TGI ni otros servidores.
- Configuracion de inferencia obligatoria: temperatura 0 y `chat_template_kwargs: {"enable_thinking": false}`. El modelo debe servirse con el system prompt exacto con el que fue entrenado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion disponible proviene del propio autor y se limita a la tarea de triage, sin datos de parametros o contexto de las alternativas.

| Modelo | Parametros | Contexto | Aciertos (200 mensajes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Qwen3.5-0.8B-Invoice-Triage | 752 M | no disponible | 200 | apache-2.0 | Pesos abiertos en HuggingFace (safetensors y GGUF), autoalojable |
| Qwen3.5-0.8B sin ajustar | no disponible | no disponible | LLM-as-a-judge 0.70 | no disponible | Modelo base publico |
| Jev (`typesafe-ai/jev`) | no disponible | no disponible | 200 | no disponible | Servicio; el autor lo presenta como la opcion gestionada frente a la que este modelo es la alternativa "do it yourself" |
| GPT-5.6 Luna | no disponible | no disponible | 200 | propietaria | API |
| GLM 5.3 (profesor) | no disponible | no disponible | 200 | propietaria | API |
| Gemini 3.5 Flash Lite | no disponible | no disponible | 197 | propietaria | API |

Ademas, no se han encontrado en la busqueda web modelos comparables adicionales ni informacion complementaria sobre esta categoria: los resultados de busqueda no contienen material relevante sobre el modelo.

## Limitaciones y advertencias

- Modelo de una sola tarea: no es un asistente general. Esta entrenado para una politica de clasificacion concreta y no debe usarse para generacion abierta.
- Degrada fuera de su configuracion de entrenamiento. El autor advierte explicitamente que hay que mantener el system prompt exacto (definido en `training/triage/job_description.json` del repositorio) y usar temperatura 0; cualquier variacion del prompt puede degradar el resultado.
- Datos sinteticos: los 3.124 ejemplos de entrenamiento los genero un modelo profesor, no son correo real. El conjunto esta escrito en ingles, en torno a una empresa ficticia ("Northwind") y con importes en una unica divisa, por lo que la generalizacion a otras lenguas, formatos locales o monedas no esta demostrada.
- Solo ingles. No hay soporte multilingue declarado.
- Riesgo de alucinacion en la etiqueta: al ser un clasificador generativo, la salida no esta restringida por gramatica en la version safetensors, de modo que el modelo podria, en casos limite, producir una etiqueta fuera del conjunto o un JSON malformado. El build GGUF Q8_0 fue verificado con el mismo resultado, pero no se documentan tecnicas de decodificacion restringida.
- Sesgos: no documentados por el autor. Al derivar de datos sinteticos generados por un unico profesor, puede heredar los sesgos de ese modelo y de los 40 ejemplos semilla, que no se publican como conjunto abierto de forma independiente.
- Adversarios no cubiertos: el modelo fue evaluado con 49 mensajes trampa, pero no hay garantia frente a ataques de inyeccion de prompt mas elaborados, ofuscacion de texto o variaciones linguisticas no vistas.
- Licencia apache-2.0, sin restricciones declaradas para uso comercial. Conviene verificar, no obstante, las condiciones del modelo base Qwen/Qwen3.5-0.8B, que no se detallan en la informacion disponible.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Fecha del repositorio: creado y actualizado el 21 de septiembre de 2026, con una unica revision publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/distil-labs/distil-qwen3.5-0.8b-invoice-triage
- Build GGUF para llama.cpp: https://huggingface.co/distil-labs/distil-qwen3.5-0.8b-invoice-triage-gguf
- Repositorio del pipeline de facturas (evaluacion, datos semilla, job description y configuracion): https://github.com/distil-labs/invoice-processing-pipeline
- Configuracion de entrenamiento del triage: https://github.com/distil-labs/invoice-processing-pipeline/tree/main/training/triage
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Alternativa gestionada Jev: https://huggingface.co/typesafe-ai/jev
- Plataforma del autor: https://www.distillabs.ai
- GitHub del autor: https://github.com/distil-labs
- HuggingFace del autor: https://huggingface.co/distil-labs
- LinkedIn: https://www.linkedin.com/company/distil-labs/
- Slack de la comunidad: https://distil-labs-community.slack.com/join/shared_invite/zt-36zqj87le-i3quWUn2bjErRq22xoE58g
- X: https://x.com/distil_labs
