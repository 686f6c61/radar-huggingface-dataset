# azabdus/qwen2.5-1.5b-sms-txn-GGUF

## Resumen

Qwen2.5-1.5B sms-txn (GGUF) es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario azabdus, especializado en la extraccion estructurada de transacciones financieras a partir de mensajes SMS de bancos indios. El modelo recibe un unico SMS junto con metadatos del contexto del telefono (titular, remitente y carpeta) y devuelve un objeto JSON con seis campos que describen la transaccion: si lo es, direccion, importe, divisa, comercio y si se trata de una transferencia entre cuentas propias.

La relevancia del modelo reside en su caracter practico: es un extractor de informacion de dominio muy estrecho, entrenado con aproximadamente 11.800 SMS etiquetados manualmente de un unico telefono, y distribuido en formato GGUF para ejecutarse en llama.cpp y en aplicaciones moviles Android e iOS. Con 1.543.714.304 parametros y cuantizacion Q4_K_M, esta disenado para inferencia local en dispositivos, no para despliegue en servidor.

El modelo no es un asistente conversacional general: el prompt de sistema es unicamente el disparador `sms_txn_v1` y las reglas de etiquetado estan incorporadas en los pesos. Su utilidad es la clasificacion y extraccion determinista de transacciones bancarias, con un rendimiento reportado del 98,6% de acierto exacto en los seis campos sobre 2.588 mensajes de test reservados por fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5, no especificada en la model card) |
| Tipos de cuantizacion | Q4_K_M (orientada a movil) y f16 (referencia de precision completa); se menciona tambien MLX 4-bit en las pruebas |
| Idiomas soportados | Ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien MLX 4-bit para las pruebas reportadas) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros, y se ajusta mediante LoRA con rango 16 aplicado a todas las capas lineales, con la perdida calculada unicamente sobre la respuesta. El entrenamiento consistio en una sola epoca sobre aproximadamente 11.800 SMS etiquetados a mano procedentes de un unico telefono, ejecutado en una sola GPU T4. La particion entre entrenamiento y test se realizo por fecha, de modo que el conjunto de test contiene mensajes de un periodo posterior a cualquier mensaje de entrenamiento, lo que evita fuga temporal de informacion.

Una innovacion destacable del proceso es la anonimizacion del titular: el nombre y los identificadores UPI del propietario real se sustituyeron en entrenamiento por una identidad ficticia distinta en cada ejemplo, aplicada de forma coherente en el SMS, en la respuesta y en la linea `owner:`. Se anadieron ademas ejemplos en los que la linea del titular nombra a otra persona. Con ello el modelo aprende a comparar el beneficiario del pago con la linea del titular en lugar de memorizar un nombre concreto, y el nombre del propietario real no queda en los pesos. El resultado se distribuye en GGUF para llama.cpp y aplicaciones derivadas.

## Capacidades

- Extraccion de informacion financiera: convierte un SMS bancario en un JSON con los campos `is_txn`, `direction`, `amount`, `currency`, `merchant` e `is_transfer`.
- Clasificacion binaria de transaccion: distingue movimientos reales de dinero de OTP, recordatorios de vencimiento, promociones y avisos de entrega.
- Determinacion de direccion: etiqueta `debit` (salida de dinero) o `credit` (entrada).
- Deteccion de transferencias entre cuentas propias: identifica pagos al propio titular, a sus UPI, pagos de tarjeta, amortizaciones de prestamos y recargas de monedero o broker, comparando el beneficiario con la linea `owner:`.
- Extraccion de comercio y divisa tal como aparecen en el SMS, con `null` cuando no se nombra contraparte.
- Salida JSON compacta de aproximadamente 30 tokens con decodificacion greedy, adecuada para pipelines deterministas.
- Capacidad multilingue limitada: ingles y algunos mensajes de recarga en escritura assamesa.
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Clasificacion automatica de SMS bancarios en el propio telefono: el modelo se ejecuta con llama.cpp en Android o iOS con la cuantizacion Q4_K_M y convierte cada mensaje entrante en un registro JSON estructurado, sin enviar datos a un servidor.
- Construccion de un registro de gastos personal: al extraer importe, divisa, comercio y direccion, la aplicacion puede agregar el gasto por comercio y periodo, excluyendo las transferencias entre cuentas propias mediante el campo `is_transfer`.
- Filtrado de notificaciones no transaccionales: el campo `is_txn` permite descartar OTP, recordatorios de vencimiento, promociones y avisos de entrega antes de mostrarlos o almacenarlos.
- Conciliacion de movimientos con extractos: los registros JSON extraidos pueden compararse con los abonos y cargos del extracto bancario para detectar mensajes no contabilizados.
- Etiquetado previo para anotacion humana: en un flujo de datos financieros, el modelo puede preetiquetar grandes volumenes de SMS y reducir el trabajo de revision manual, dado su 98,6% de acierto exacto en el conjunto de test reportado.
- Aplicaciones de finanzas personales con privacidad por diseno: al ser un modelo de 1.500 millones de parametros cuantizado a Q4_K_M, cabe en dispositivos moviles y permite procesar SMS sensibles sin salir del telefono.
- Analisis de cartera de mensajes historicos: la ventana de contexto heredada del modelo base permite procesar un SMS por invocacion con sus metadatos, lo que facilita el reprocesamiento por lotes de un buzon completo.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| 2.588 mensajes de test reservados, precision completa (los seis campos exactos) | 98,6% |
| Transferencias a la cuenta propia del titular en ese conjunto | 17 de 17 |
| 29 mensajes de demostracion, precision completa | 28/29 |
| 29 mensajes de demostracion, MLX 4-bit | 28/29 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas de exactitud de extraccion propias del autor sobre datos de su dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.543.714.304 parametros, la cuantizacion Q4_K_M ocupa aproximadamente 1 GB y la version f16 alrededor de 3 GB, aunque el autor no publica cifras de memoria.
- GPU recomendadas: el entrenamiento se realizo en una unica T4; para inferencia basta con CPU en movil o cualquier GPU consumer.
- Cabe en GPU consumer: si, dado el tamano del modelo; el autor lo orienta a telefonos Android e iOS mediante llama.cpp.
- Opciones de despliegue: llama.cpp y las aplicaciones construidas sobre el, ademas de MLX en 4-bit segun las pruebas reportadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B sms-txn (este modelo) | 1.543.714.304 | no disponible | Extraccion de transacciones de SMS bancarios indios | Apache 2.0 | GGUF y MLX 4-bit en Hugging Face |
| Qwen2.5-1.5B-Instruct (modelo base) | 1.500 millones | no disponible en esta ficha | Asistente conversacional general | Apache 2.0 | Multiples formatos en Hugging Face |
| Alternativas especializadas en extraccion de SMS financieros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros extractores de informacion de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado con los bancos de una sola persona, principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison y comercios y monederos indios; bancos no vistos, como los cargos de HDFC, se leen con menos fiabilidad.
- Idiomas limitados a ingles y algunos mensajes de recarga en escritura assamesa; no cubre otros idiomas ni otras escrituras.
- La linea `owner:` es obligatoria: sin ella, el campo `is_transfer` no es fiable porque el modelo no puede saber a quien pertenecen las cuentas.
- Las transferencias reconocibles solo por patrones nuevos, como un broker o monedero no visto, se pasan por alto con frecuencia: 10 de 17 en el conjunto de test.
- Riesgo de alucinacion en campos como `merchant` o `amount` cuando el SMS presenta formatos alejados de los datos de entrenamiento; no se reportan tasas de error por campo.
- Sesgos conocidos: no se documentan en la model card; la concentracion en un unico historial de mensajes implica un sesgo de dominio hacia los formatos y entidades de ese telefono.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la exactitud en produccion ni sobre el cumplimiento normativo financiero.
- El modelo no es un asistente conversacional: el prompt de sistema es solo el disparador `sms_txn_v1` y no acepta instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-1.5b-sms-txn-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
