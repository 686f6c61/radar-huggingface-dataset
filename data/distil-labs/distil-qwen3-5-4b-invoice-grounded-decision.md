# distil-labs/distil-qwen3.5-4b-invoice-grounded-decision

## Resumen

Distil-Qwen3.5-4B-Invoice-Grounded-Decision es un ajuste fino supervisado de Qwen/Qwen3.5-4B (4.205.751.296 parametros) especializado en una tarea muy concreta de cuentas a pagar: leer una factura de proveedor junto con el pedido (PO) y el albaran de recepcion, ejecutar cuatro comprobaciones en orden y devolver una decision de pago (`approve`, `hold_no_po`, `hold_quantity`, `hold_price`, `hold_total`) acompanada de los campos que justifican el fallo: numero de factura, numero de PO, item implicado y los dos valores que no coinciden. Lo desarrolla distil-labs sobre su plataforma de destilacion, y es el paso 2 de un pipeline de tres etapas (triage, consulta al ERP y esta decision).

La relevancia del modelo esta en su estrategia de entrenamiento: partiendo de solo 40 ejemplos semilla, un modelo profesor (GLM 5.3 con razonamiento alto) genero 4.056 ejemplos sinteticos sobre los que se ajusto el estudiante. El resultado declarado es de 97 de 100 facturas de prueba con los seis campos correctos, frente a una tasa de acierto casi nula del Qwen3.5-4B sin ajustar con el mismo prompt. En el pipeline completo se declaran 197 de 200 mensajes de bandeja de entrada resueltos correctamente, tambien con la cuantizacion Q8_0 en GGUF bajo llama.cpp en un portatil.

Se distribuye con licencia apache-2.0, pesos en safetensors para transformers y una compilacion GGUF independiente. La salida es JSON estricto precedido de unos 160 tokens de razonamiento en formato fijo, por lo que esta pensado para desplegarse como endpoint compatible con OpenAI y a temperatura 0. El soporte de idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de generacion de texto (tag `qwen3_5_text` en transformers); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en precision completa (repo de 8,4 GB); GGUF con Q8_0 verificada en llama.cpp; no se detallan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B, un transformer decoder-only de ~4,2 mil millones de parametros etiquetado como `qwen3_5_text`. No se ha publicado informacion sobre la arquitectura interna del modelo base (atencion, capas, si incorpora componentes MoE o hibridos) ni sobre su contexto maximo, por lo que esos datos quedan como no disponibles. El repositorio ocupa 8,4 GB, coherente con pesos en precision de 16 bits para ese numero de parametros.

El entrenamiento se realizo en la plataforma de distil labs con una receta de destilacion: 40 ejemplos semilla definen la tarea, un profesor (GLM 5.3 con esfuerzo de razonamiento alto) genera 4.056 ejemplos sinteticos y el estudiante se ajusta sobre ellos. El tipo de tarea declarado es respuesta a preguntas con salida JSON. La innovacion practica no esta en la arquitectura, sino en el formato aprendido: el modelo razona antes de responder siguiendo un guion corto y fijo (las comprobaciones en orden de politica, una linea por linea de factura, una suma acumulada y parada en el primer fallo), de unos 160 tokens, y emite despues el JSON. Para invocarlo correctamente hay que activar el pensamiento (`chat_template_kwargs: {"enable_thinking": true}`) y usar exactamente el system prompt del entrenamiento a temperatura 0; fuera de esa configuracion el rendimiento se degrada.

## Capacidades

- Decision de pago con justificacion: devuelve `approve` o uno de los cuatro motivos de retencion (`hold_no_po`, `hold_quantity`, `hold_price`, `hold_total`), senalando la linea concreta que falla.
- Extraccion de campos estructurados en JSON estricto: `decision`, `invoice_number`, `po_number`, `item`, `invoiced` y `expected`, sin texto adicional despues del objeto.
- Conciliacion de documentos (three-way match): cruza factura, pedido y albaran, emparejando lineas por item aunque el proveedor use nombres o abreviaturas propias y aunque el orden de las lineas difiera.
- Razonamiento previo a la respuesta en formato fijo y de longitud acotada (~160 tokens), lo que hace la decision auditable.
- Comparacion numerica con tolerancias: acepta precios inferiores al del pedido y solo marca `hold_price` cuando la diferencia supera el 2%.
- Deteccion de cargos de transporte no autorizados en el total (`hold_total`) segun lo que indique el pedido.
- Ignora importes del mensaje que no pertenecen a la factura (saldos anteriores, pagos recibidos, presupuestos).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio segun la informacion disponible; es un modelo de un solo turno orientado a tarea.

## Casos de uso

- Verificacion automatica de facturas en cuentas a pagar: se le envian los tres documentos (mensaje de factura, pedido del ERP y albaran) y devuelve la decision con el importe facturado frente al esperado, lo que permite aprobar pagos sin intervencion manual en la mayoria de casos.
- Retencion de pagos con motivo trazable: en lugar de un simple rechazo, el JSON identifica el numero de factura, el numero de PO, el item y los dos valores discrepantes, de modo que el equipo de AP sabe exactamente que reclamar al proveedor.
- Enrutado de excepciones a revision humana: las facturas que no se aprueban se pueden derivar automaticamente al revisor correspondiente (precios, cantidades o totales) usando el campo `decision` como clave de encaminamiento.
- Integracion en un pipeline de correo entrante: al ser el paso 2 de un flujo con triage y consulta al ERP, encaja como componente de un servicio que consume el buzon de facturas y escribe resultados en el sistema financiero.
- Alimentacion de un ERP mediante salida estructurada: el JSON con seis campos se puede mapear directamente a registros de conciliacion o a colas de aprobacion sin parseo adicional.
- Despliegue on-premise por confidencialidad: al pesar unos 4,2 mil millones de parametros y existir build GGUF, se puede ejecutar en infraestructura propia o incluso en un portatil, evitando enviar datos financieros a APIs externas.
- Procesamiento por lotes a bajo coste: con Q8_0 en llama.cpp el autor declara haber procesado 200 mensajes de bandeja con 197 aciertos, lo que sirve como referencia de viabilidad para volumenes moderados en hardware humilde.
- Auditoria de decisiones de pago: el bloque de razonamiento previo documenta el orden de comprobaciones y la suma acumulada, util para revisar por que se retuvo una factura meses despues.

## Benchmarks y rendimiento

| Modelo | Facturas con los seis campos correctos (sobre 100 de prueba) |
|---|---|
| Distil-Qwen3.5-4B-Invoice-Grounded-Decision | 97 (solo la decision: 99) |
| Qwen3.5-4B sin ajustar, thinking activado, mismo prompt | 0,12 (evaluado con LLM-as-a-judge) |
| Jev | no puede producir esta salida (devuelve opciones, no texto) |
| GPT-5.6 Luna, reasoning high | 100 |
| GLM 5.3, reasoning high (el profesor) | 96 |
| Gemini 3.5 Flash Lite | 76 |
| GPT-5.6 Luna, reasoning off | 75 |

Un caso solo cuenta como correcto si los seis campos son correctos. En el pipeline completo (triage, consulta al ERP y este modelo) se declaran 197 de 200 mensajes de bandeja resueltos correctamente, tambien con el build GGUF Q8_0 bajo llama.cpp en un portatil. Los tres errores del pipeline son sumas sobre totales de linea grandes; el autor estima que aproximadamente 1 de cada 30 facturas necesitara una segunda revision. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del numero de parametros, no publicada por el autor): ~8,4 GB solo de pesos en FP16/BF16, en torno a 10-12 GB contando cache KV; ~4,5 GB con Q8_0; ~2,6 GB con cuantizaciones de 4 bits.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Por tamano, el modelo cabe sin problema en una RTX 4090 (24 GB), A100 (40/80 GB) o H100; en FP16 tambien entra en tarjetas de 12-16 GB.
- Cabe en GPU de consumo: si. En FP16 entra en RTX 4080/4090; con Q8_0 o cuantizaciones de 4 bits cabe en RTX 3060 12 GB o equivalentes, e incluso en ejecucion mixta CPU/GPU.
- Opciones de despliegue: vLLM mediante `vllm serve distil-labs/distil-qwen3.5-4b-invoice-grounded-decision --port 8001` (comando indicado en la model card); llama.cpp con el build GGUF Q8_0, verificado por el autor en un portatil; cualquier servidor compatible con la API de OpenAI. El autor no menciona TGI ni Ollama de forma explicita, aunque el formato GGUF es compatible con esos runners.
- Latencia y throughput: no disponibles. Como referencia de coste por respuesta, el modelo genera unos 160 tokens de razonamiento antes del JSON. El autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea (6/6 campos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Qwen3.5-4B-Invoice-Grounded-Decision | 4,2 mil millones | no disponible | 97 de 100 | apache-2.0 | Pesos abiertos en HuggingFace (safetensors y GGUF) |
| Qwen3.5-4B (base sin ajustar) | 4,2 mil millones aprox. | no disponible | 0,12 por LLM-as-a-judge | no disponible en la informacion | Pesos abiertos como modelo base |
| GLM 5.3 (profesor, reasoning high) | no disponible | no disponible | 96 de 100 | no disponible | No se indica si los pesos son abiertos |
| GPT-5.6 Luna, reasoning high | no disponible | no disponible | 100 de 100 | propietaria | Solo API |
| Gemini 3.5 Flash Lite | no disponible | no disponible | 76 de 100 | propietaria | Solo API |

La comparacion relevante es contra alternativas de API propietaria: el modelo destilado se queda a tres puntos del mejor resultado declarado (GPT-5.6 Luna con razonamiento alto) y por delante de su propio profesor, con la ventaja de poder ejecutarse en local. No se dispone de datos de contexto, arquitectura ni licencia del modelo base Qwen3.5-4B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo hace verificacion de facturas contra pedido y albaran con la politica descrita; no es un asistente general ni un extractor de facturas generico.
- Idiomas: unicamente ingles declarado. No se garantiza funcionamiento con facturas en castellano u otros idiomas.
- Dependencia fuerte del prompt: el autor advierte que el modelo se degrada fuera de su configuracion de entrenamiento y pide mantener el system prompt exactamente como se proporciona, con `enable_thinking` activado y temperatura 0.
- Tasa de error residual: el autor estima que aproximadamente 1 de cada 30 facturas necesitara una segunda revision; los tres fallos observados en el pipeline corresponden a sumas sobre totales de linea grandes.
- Riesgo de alucinacion en los campos numericos y en los identificadores (numero de factura, numero de PO, item): al ser una tarea de extraccion y comparacion, un valor inventado puede propagarse a una decision de pago, por lo que se recomienda validacion posterior.
- Datos de entrenamiento sinteticos: los 4.056 ejemplos provienen de un modelo profesor (GLM 5.3), de modo que el estudiante puede heredar sus sesgos y sus patrones de error en la politica de comprobacion.
- Ambito de politica fijo: umbral del 2% en precios, tratamiento del transporte segun el pedido y parada en el primer fallo. Cambiar esas reglas exige reentrenar, no basta con reescribir el prompt.
- Sin datos publicados de benchmarks generales ni de evaluacion de sesgos; tampoco se informa del contexto maximo, lo que impide saber con que tamano de factura o de hilo de correo deja de funcionar.
- Licencia: el modelo se publica como apache-2.0, pero no se detalla la licencia del modelo base Qwen3.5-4B en la informacion disponible; conviene verificarla antes de un uso comercial.
- Adopcion practicamente nula hasta la fecha de los datos: 0 descargas y 0 likes en HuggingFace, sin comunidad que haya reproducido los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision
- Build GGUF para llama.cpp: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision-gguf
- Repositorio del pipeline de facturas (instrucciones de uso, baselines y salidas crudas): https://github.com/distil-labs/invoice-processing-pipeline
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Plataforma del autor: https://www.distillabs.ai
