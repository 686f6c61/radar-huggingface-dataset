# azabdus/qwen2.5-0.5b-sms-txn-GGUF

## Resumen

Qwen2.5-0.5B sms-txn es un modelo especializado en extraccion de informacion financiera a partir de mensajes SMS de bancos indios. Se trata de un ajuste fino mediante LoRA sobre Qwen2.5-0.5B-Instruct, el modelo denso de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba. El modelo recibe un SMS bancario y devuelve un objeto JSON con los campos de la transaccion (importe, divisa, direccion, comercio y si se trata de una transferencia entre cuentas propias), o bien `{"is_txn":false}` cuando el mensaje no representa un movimiento de dinero real.

El problema que resuelve es concreto y bien delimitado: la clasificacion y estructuracion automatica de notificaciones bancarias en el contexto de aplicaciones de finanzas personales en India. En lugar de emplear un modelo generalista con instrucciones extensas, el autor ha entrenado las reglas de etiquetado directamente en los pesos, de modo que el prompt del sistema se reduce a un unico token disparador (`sms_txn_v1`). Esto reduce la latencia y el consumo de contexto, algo relevante para su despliegue en dispositivos moviles mediante llama.cpp.

La relevancia actual del modelo reside en su formato GGUF y su tamano reducido: la cuantizacion Q4_K_M ocupa aproximadamente el espacio de una aplicacion movil y permite inferencia local en Android e iOS sin conexion a servicios en la nube, lo que resulta atractivo por motivos de privacidad al procesar datos financieros sensibles. El modelo fue creado por el usuario azabdus y publicado con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | GGUF: Q4_K_M y f16 (mencionados en la model card); MLX 4-bit (usado en evaluacion) |
| Idiomas soportados | Ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer denso de 494 millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 en todas las capas lineales, calculando la perdida unicamente sobre la respuesta (no sobre el prompt). El entrenamiento consistio en una sola epoca sobre aproximadamente 11.800 SMS etiquetados manualmente, procedentes del telefono de una unica persona, ejecutado en una sola GPU T4.

La particion de datos se realizo por fecha, de modo que el conjunto de test contiene mensajes de un periodo posterior a cualquier mensaje de entrenamiento, lo que evita fugas temporales. Como medida de privacidad, el nombre y los identificadores UPI del propietario se sustituyeron durante el entrenamiento por una identidad ficticia distinta en cada ejemplo, tanto en el SMS como en la respuesta y en la linea `owner:`. Ademas se incluyeron ejemplos donde la linea del propietario nombra a otra persona, de forma que el modelo aprende a comparar el beneficiario con la linea del propietario en lugar de memorizar un nombre concreto. El nombre real del propietario no esta presente en los pesos.

La innovacion tecnica principal no reside en la arquitectura, sino en la interfaz: las reglas de etiquetado se han interiorizado en los pesos, de manera que el prompt del sistema es solo el disparador `sms_txn_v1` y la salida se genera con decodificacion greedy en unos 30 tokens.

## Capacidades

- Extraccion de informacion estructurada: convierte un SMS bancario en un JSON con los campos `is_txn`, `direction`, `amount`, `currency`, `merchant` e `is_transfer`.
- Clasificacion binaria de transaccion: distingue movimientos reales de dinero de OTP, recordatorios de vencimiento, promociones y avisos de entrega.
- Determinacion de direccion: identifica `debit` (salida de dinero) o `credit` (entrada).
- Deteccion de transferencias entre cuentas propias: reconoce pagos al propio nombre o UPI del titular, pagos de tarjeta, devoluciones de prestamos y recargas de monedero o broker, marcandolos con `is_transfer: true`.
- Comparacion con la identidad del propietario: usa la linea `owner:` del prompt para decidir si el destinatario es el propio titular.
- Generacion de JSON compacto: salida de aproximadamente 30 tokens con decodificacion greedy.
- Capacidades multilingues limitadas: ingles y algunos mensajes de recarga en escritura assamesa.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Aplicaciones de finanzas personales en India: el modelo procesa cada SMS entrante del buzon y genera un registro estructurado de gastos e ingresos, permitiendo construir un libro de cuentas automatico sin intervencion manual.
- Clasificacion en el dispositivo por privacidad: gracias a su formato GGUF y su tamano reducido (Q4_K_M), puede ejecutarse localmente en Android e iOS mediante llama.cpp, de modo que los SMS bancarios nunca abandonan el telefono.
- Filtrado de notificaciones no transaccionales: descarta OTP, recordatorios de facturas, promociones y avisos de entrega con `{"is_txn":false}`, reduciendo el ruido en los paneles de gastos.
- Separacion de transferencias internas: marca como `is_transfer` los movimientos entre cuentas propias, pagos de tarjeta y recargas de monedero, evitando que inflen los totales de gasto en los informes.
- Agregacion de gasto por comercio: el campo `merchant` permite agrupar el gasto por contraparte y construir informes de consumo por categoria.
- Extraccion por lotes en backend: para aplicaciones que prefieren procesar en servidor, el modelo puede desplegarse con llama.cpp o vLLM para estructurar grandes volumenes de SMS historicos.
- Prototipado rapido de pipelines de extraccion: su licencia Apache 2.0 y su bajo coste de inferencia lo hacen util como base para experimentar con extraccion de informacion financiera en otros mercados, previo reentrenamiento.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| 2.588 mensajes de test reservados, precision completa | 98,5% exactos en los seis campos |
| Transferencias a la cuenta del propio titular en ese conjunto | 14 de 17 |
| 29 mensajes de demostracion, precision completa (f16) | 27/29 |
| 29 mensajes de demostracion, MLX 4-bit | 25/29 |
| 29 mensajes de demostracion, llama.cpp Q4_K_M | 26/29 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion Q4_K_M; aproximadamente 1 GB en f16 para los 494 millones de parametros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una unica T4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, y tambien en CPU.
- Despliegue en movil: llama.cpp en Android e iOS (formato GGUF), con Q4_K_M como variante optimizada para telefono.
- Opciones de despliegue en servidor: llama.cpp, vLLM y cualquier runtime compatible con GGUF; el autor cita tambien MLX 4-bit para evaluacion.
- Latencia y throughput: no disponibles de forma numerica; la model card indica salidas de unos 30 tokens con decodificacion greedy, lo que sugiere una generacion muy breve por mensaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-0.5B sms-txn | 494 M | no disponible | Extraccion de SMS bancarios indios | Apache 2.0 | GGUF |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en la informacion | Asistente generalista | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B (aproximado) | no disponible en la informacion | Asistente generalista | Apache 2.0 | safetensors, GGUF |

La comparacion directa con alternativas especializadas en extraccion de SMS financieros no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion: el modelo ajustado no requiere instrucciones detalladas y produce JSON compacto, mientras que Qwen2.5-0.5B-Instruct necesitaria un prompt extenso y probablemente ofreceria menor consistencia en el formato.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado con los bancos de una sola persona, principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison y comercios y monederos indios. Bancos no vistos, como HDFC en debitos, se leen con menor fiabilidad.
- Cobertura linguistica limitada: solo ingles y algunos mensajes de recarga en escritura assamesa.
- Dependencia de la linea `owner:`: sin ella, el campo `is_transfer` no es fiable porque el modelo no puede saber a quien pertenecen las cuentas.
- Transferencias con patrones nuevos: las transferencias reconocibles solo por un patron no visto (un broker o monedero nuevo) se detectan deficientemente; en el conjunto de test se identificaron 10 de 17.
- Riesgo de alucinacion: aunque la tarea es de extraccion y la salida es breve, un SMS con formato atipico podria producir campos incorrectos o un JSON mal formado; conviene validar la salida contra un esquema.
- Ambito geografico y regulatorio: disenado para SMS bancarios indios; su uso en otros mercados requeriria reentrenamiento y validacion.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct conserva su propia licencia, que debe verificarse antes de un despliegue en produccion.
- Volumen de validacion modesto: los resultados de demostracion se basan en 29 mensajes y el conjunto de test en 2.588, por lo que la robustez fuera de esa distribucion no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-0.5b-sms-txn-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
