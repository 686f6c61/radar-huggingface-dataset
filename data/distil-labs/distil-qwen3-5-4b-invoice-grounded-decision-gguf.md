# distil-labs/distil-qwen3.5-4b-invoice-grounded-decision-gguf

## Resumen

Distil-Qwen3.5-4B-Invoice-Grounded-Decision es un modelo de lenguaje pequeno (SLM) de 4.205.751.296 parametros, desarrollado por distil labs, especializado en una unica tarea: la validacion de facturas de proveedor dentro de un flujo de cuentas a pagar. El modelo recibe tres documentos (la factura tal como llego por correo, la orden de compra del ERP y el albaran de recepcion), ejecuta cuatro comprobaciones en orden fijo y devuelve una decision (`approve` o uno de los cuatro tipos de `hold`) junto con la ubicacion exacta del fallo: numero de factura, numero de orden de compra, item que falla y los dos valores que no coinciden.

Se trata de un ajuste fino sobre el modelo base Qwen/Qwen3.5-4B, entrenado en la plataforma de distil labs a partir de 40 ejemplos semilla. Un modelo profesor (GLM 5.3 con razonamiento) genero 4.056 ejemplos sinteticos sobre los que se ajusto el alumno. El repositorio publica la build GGUF en cuantizacion Q8_0 (`distil-qwen3.5-4b-invoice-grounded-decision-q8_0.gguf`), pensada para ejecutarse con llama.cpp, mientras que los pesos en safetensors estan en un repositorio separado.

Su relevancia actual esta en el nicho de la destilacion de tareas concretas en modelos pequenos que se ejecutan en local: el autor reporta 97 de 100 facturas de prueba con los seis campos correctos y 197 de 200 mensajes gestionados correctamente en el pipeline completo (triage, consulta al ERP y este modelo), ejecutandose sobre un portatil con llama.cpp. El modelo esta disenado para razonar antes de responder en un formato fijo de aproximadamente 160 tokens, lo que lo hace adecuado para despliegues sensibles con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base Qwen/Qwen3.5-4B); detalle de capas y atencion no disponible |
| Parametros totales | 4.205.751.296 (aprox. 4,2B, dato de los safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de referencia de llama.cpp (`-c 16384`); maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) en este repositorio; pesos safetensors completos en el repositorio enlazado; no se listan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0) y safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 4,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only denso de aproximadamente 4,2 mil millones de parametros. No se detalla en la informacion disponible si incorpora innovaciones adicionales de atencion, decodificacion especulativa o variantes hibridas. El ajuste fino se realizo sobre pesos completos y el resultado se publica tanto en safetensors como en una build GGUF Q8_0 para inferencia con llama.cpp.

El proceso de entrenamiento parte de un conjunto muy reducido: 40 ejemplos semilla redactados por el autor. A partir de ellos, el modelo profesor GLM 5.3 en modo razonamiento genero 4.056 ejemplos sinteticos, y el modelo alumno se ajusto sobre esa muestra. No se especifica el uso de RLHF ni DPO, ni la composicion exacta del dataset mas alla de su origen sintetico. La innovacion tecnica principal es de caracter procedimental mas que arquitectonico: el modelo aprende a razonar antes de responder siguiendo un formato fijo y corto (las cuatro comprobaciones en orden de politica, una linea por linea de factura, una suma acumulada y parada en el primer fallo, en torno a 160 tokens). La respuesta JSON se emite a continuacion del razonamiento, y el chat template incorpora el interruptor de thinking, de ahi que se requiera `--jinja` en llama-server y `chat_template_kwargs: {"enable_thinking": true}` en la llamada.

## Capacidades

- Extraccion de informacion estructurada de documentos financieros: interpreta facturas recibidas por correo y las cruza con la orden de compra y el albaran de recepcion del ERP.
- Razonamiento encadenado previo a la respuesta, en un formato fijo de aproximadamente 160 tokens que ejecuta las comprobaciones en orden de politica y se detiene en el primer fallo.
- Triple match (three-way match) de cuentas a pagar: valida numero de orden de compra, cantidades facturadas frente a recibidas, precio unitario facturado frente al de la orden (con tolerancia del 2 % al alza) y coherencia del total con el flete permitido.
- Salida en JSON estricto con seis campos exactos: `decision`, `invoice_number`, `po_number`, `item`, `invoiced` y `expected`.
- Clasificacion de la causa del bloqueo en cinco categorias: `approve`, `hold_no_po`, `hold_quantity`, `hold_price` y `hold_total`.
- Emparejamiento de lineas por nombre de item, tolerando orden distinto al de la orden de compra y nomenclaturas o abreviaturas propias del proveedor.
- Ignorar importes ajenos a la factura que aparezcan en el mensaje (saldos anteriores, pagos recibidos, presupuestos).
- Capacidades conversacionales y compatibilidad con endpoints (etiquetas `conversational` y `endpoints_compatible`).
- No dispone de capacidades multilingues (solo ingles), ni de vision, audio, tool calling o function calling documentadas.

## Casos de uso

- Automatizacion del three-way match en cuentas a pagar: el modelo sustituye la revision manual de factura contra orden de compra y albaran, devolviendo la decision y los campos discrepantes en un JSON listo para el ERP. Es adecuado porque cubre exactamente las cuatro comprobaciones clasicas del ciclo de pago.
- Segundo paso de un pipeline de correo entrante de facturas: combinado con un paso de triage y una consulta al ERP, gestiona el flujo completo. El autor reporta 197 de 200 mensajes correctos en este escenario.
- Deteccion de facturacion por encima de la orden de compra: cuando el precio unitario facturado supera en mas del 2 % al de la orden, el modelo emite `hold_price` y devuelve el precio facturado y el esperado, lo que permite al equipo de compras abrir una reclamacion con datos concretos.
- Deteccion de cantidades no recibidas: con `hold_quantity`, el modelo senala el item cuya cantidad facturada supera la recibida, util para evitar pagos de mercancia no entregada.
- Validacion de totales y cargos de flete: con `hold_total`, el modelo comprueba que el total declarado coincide con la suma de lineas mas el flete solo si la orden lo autoriza, lo que detecta recargos indebidos.
- Pre-aprobacion de pagos con revision humana: por su tasa de error declarada (aproximadamente 1 factura de cada 30 requiere una segunda revision), encaja como filtro previo que aprueba automaticamente la mayoria y deriva los casos dudosos a un revisor.
- Despliegue confidencial on-premise o en portatil: al ejecutarse con llama.cpp sobre un portatil con la build Q8_0, permite procesar documentos financieros sensibles sin enviarlos a una API externa.
- Generacion de registros de auditoria estructurados: la salida JSON de seis campos puede persistirse directamente como traza de auditoria de cada decision de pago, con el valor facturado y el esperado documentados.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden el porcentaje de facturas en las que los seis campos de salida son correctos, sobre un conjunto de 100 facturas de prueba. Una factura cuenta como acierto solo si todos los campos son correctos.

| Modelo | Seis campos correctos (100 facturas) |
|---|---|
| Este modelo | 97 (solo la decision: 99) |
| Qwen3.5-4B sin ajustar, thinking on, mismo prompt | LLM-as-a-judge 0,12 (metrica distinta, no comparable directamente) |
| Jev | no puede producir esta salida (devuelve opciones, no texto) |
| GPT-5.6 Luna, reasoning high | 100 |
| GLM 5.3, reasoning high (el profesor) | 96 |
| Gemini 3.5 Flash Lite | 76 |
| GPT-5.6 Luna, reasoning off | 75 |

En el pipeline completo (triage, consulta al ERP y este modelo) se gestionan correctamente 197 de 200 mensajes de la bandeja de entrada, tambien con la build Q8_0 GGUF bajo llama.cpp en un portatil. Los tres errores corresponden a sumas sobre totales de linea elevados, por lo que cabe esperar que aproximadamente 1 factura de cada 30 necesite una segunda revision. El autor indica que la forma de puntuar, todas las lineas base y las salidas sin procesar estan en el repositorio del pipeline.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q8_0 ocupan aproximadamente 4,5 GB (tamano del repositorio). Con cache KV para 16.384 tokens hay que sumar una cantidad adicional no especificada; en la practica se necesitan del orden de 6 a 8 GB de VRAM, aunque el dato exacto no esta publicado.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas, como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o RTX 4090. Las GPU de datacenter (A100, H100, L40S) son sobredimensionadas para 4,2B de parametros, pero son compatibles si se necesita servir muchas peticiones en paralelo.
- Cabida en GPU consumer: si, esta disenado para ello. El autor lo ejecuta en un portatil con la build Q8_0 bajo llama.cpp, lo que sugiere que tambien funciona en CPU con memoria suficiente.
- Opciones de despliegue: llama.cpp mediante `llama-server` (configuracion de referencia del autor: `--port 8001 --jinja -c 16384 -np 4`), servido detras de un endpoint compatible con OpenAI. Al ser GGUF, tambien es compatible con otros runners de llama.cpp como Ollama o LM Studio. Para los pesos safetensors serian aplicables vLLM o TGI, aunque no se documentan en la informacion disponible.
- Latencia y throughput estimados: no disponible. Si se conoce que el modelo genera en torno a 160 tokens de razonamiento antes de la respuesta final, lo que anade coste de generacion a cada factura.
- Requisito operativo critico: el modelo requiere `--jinja` (el chat template transporta el interruptor de thinking), temperatura 0 y el system prompt exacto de entrenamiento. Fuera de esa configuracion el rendimiento se degrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seis campos correctos (100 facturas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Qwen3.5-4B-Invoice-Grounded-Decision | 4,2B | 16.384 tokens en config. de referencia | 97 (99 en la decision sola) | apache-2.0 | GGUF Q8_0 y safetensors en HuggingFace |
| Qwen3.5-4B (base, sin ajustar) | 4,2B | no disponible | LLM-as-a-judge 0,12 (metrica distinta) | no disponible | HuggingFace (modelo base) |
| GLM 5.3 (profesor, reasoning high) | no disponible | no disponible | 96 | no disponible | no disponible |
| GPT-5.6 Luna (reasoning high) | no disponible | no disponible | 100 | propietaria | API |
| Gemini 3.5 Flash Lite | no disponible | no disponible | 76 | propietaria | API |
| GPT-5.6 Luna (reasoning off) | no disponible | no disponible | 75 | propietaria | API |
| Jev | no disponible | no disponible | no puede producir esta salida (devuelve opciones, no texto) | no disponible | no disponible |

La comparacion mas relevante es con el modelo base sin ajustar: el ajuste fino sobre 4.056 ejemplos sinteticos es lo que convierte un modelo generalista en un extractor fiable para esta tarea concreta. Frente a GPT-5.6 Luna en modo razonamiento alto, el modelo destilado queda 3 puntos por debajo en la metrica principal, pero se ejecuta en local con 4,2B de parametros y licencia Apache-2.0.

## Limitaciones y advertencias

- Degradacion fuera de su configuracion: el autor advierte explicitamente de que el modelo empeora fuera de su entorno de entrenamiento. Es obligatorio usar el system prompt exacto, temperatura 0 y thinking activado.
- Modelo de dominio muy restringido: no es un modelo de proposito general. Solo ejecuta la tarea de validacion de facturas descrita, con una politica concreta (cliente ficticio "Northwind") y un formato de salida fijo.
- Solo ingles: el modelo no soporta otros idiomas, lo que limita su uso con proveedores o ERPs en castellano sin traduccion previa.
- Tasa de error declarada: aproximadamente 1 de cada 30 facturas necesita una segunda revision, y los errores conocidos se concentran en sumas sobre totales de linea elevados. Cualquier flujo de pago real deberia incorporar revision humana o umbrales de control.
- Riesgo de alucinacion: al generar numeros (importes, cantidades, totales) y nombres de item, existe riesgo de producir valores plausibles pero incorrectos, especialmente si el documento de entrada tiene un formato distinto al de entrenamiento.
- Dependencia del emparejamiento por nombre de item: el modelo debe hacer coincidir lineas de factura con lineas de orden por nombre, tolerando abreviaturas del proveedor. Nomenclaturas muy alejadas del dominio de entrenamiento pueden provocar fallos de emparejamiento.
- Sensibilidad a la coincidencia literal: el campo `item` debe devolverse exactamente como aparece en la orden de compra, lo que exige que el sistema que consume la salida valide el formato.
- Datos de entrenamiento sinteticos: los 4.056 ejemplos fueron generados por GLM 5.3 a partir de 40 semillas, por lo que el modelo puede heredar sesgos de estilo y de distribucion del profesor y del generador sintetico.
- Licencia: el modelo se publica bajo Apache-2.0, que permite uso comercial. No obstante, la licencia del modelo base Qwen/Qwen3.5-4B no se detalla en la informacion disponible y conviene verificarla antes de un despliegue en produccion.
- Impacto financiero: las decisiones `approve` y `hold_*` afectan directamente a pagos. Un falso `approve` puede derivar en un pago indebido y un falso `hold` en un retraso de pago; ambos requieren controles adicionales.
- Repositorio sin traccion publica: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de los resultados mas alla de la publicada por el autor.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision-gguf
- Pesos safetensors en HuggingFace: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision
- Repositorio del pipeline de facturas (incluye la forma de puntuar, las lineas base y las salidas sin procesar): https://github.com/distil-labs/invoice-processing-pipeline
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Plataforma del autor: https://www.distillabs.ai
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a una aplicacion movil de informacion sobre farmacos y no guardan relacion con la ficha.
