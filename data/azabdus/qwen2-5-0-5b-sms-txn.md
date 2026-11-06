# azabdus/qwen2.5-0.5b-sms-txn

## Resumen

azabdus/qwen2.5-0.5b-sms-txn es un ajuste fino de Qwen2.5-0.5B-Instruct especializado en una única tarea: extraer información estructurada de mensajes SMS bancarios indios y devolverla como JSON. El modelo recibe un SMS junto con metadatos del propietario del teléfono (nombre y UPI), el remitente y la carpeta, y emite un objeto JSON con seis campos (`is_txn`, `direction`, `amount`, `currency`, `merchant`, `is_transfer`) o `{"is_txn":false}` cuando el mensaje no representa un movimiento de dinero real (OTP, recordatorio de vencimiento, promoción, aviso de entrega).

El modelo base es el transformer denso Qwen2.5-0.5B-Instruct, con 494.032.768 parámetros totales y licencia Apache 2.0. El ajuste se realizó mediante LoRA (r=16 sobre todas las capas lineales) durante una época sobre aproximadamente 11.800 SMS etiquetados a mano procedentes del teléfono de una sola persona, en una única GPU T4. Los pesos fusionados se distribuyen en formato transformers en bf16, y el adaptador LoRA original está en el subdirectorio `adapter/`.

Su relevancia es acotada pero clara: demuestra que un modelo de 0,5B parámetros puede resolver con alta precisión (98,5% de acierto exacto en los seis campos sobre 2.588 mensajes de test) una tarea de extracción de información muy específica, ejecutable en hardware modesto. Es un artefacto de nicho, no un modelo de propósito general, y su utilidad fuera del dominio de los bancos indios observados es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no declarada en la model card) |
| Tipos de cuantizacion | bf16 (pesos fusionados publicados); el autor reporta evaluacion en MLX 4-bit; otras cuantizaciones no documentadas |
| Idiomas soportados | ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout transformers, bf16) y adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer denso decoder-only de 0,5B parámetros. Sobre él se aplicó un adaptador LoRA con rango 16 en todas las capas lineales, con la función de pérdida calculada únicamente sobre la respuesta (no sobre el prompt). El entrenamiento consistió en una época sobre aproximadamente 11.800 SMS etiquetados manualmente, procedentes del teléfono de una sola persona, ejecutado en una única GPU T4. La partición train/test se hizo por fecha, de modo que el conjunto de test contiene mensajes posteriores a cualquier mensaje de entrenamiento, lo que reduce el riesgo de fuga temporal.

La innovación técnica principal es el tratamiento de la privacidad y de la identidad del titular. Durante el entrenamiento, el nombre y los UPI del propietario se sustituyeron por una identidad ficticia distinta en cada ejemplo, aplicada de forma consistente al cuerpo del SMS, a la respuesta y a la línea `owner:`, e incluyendo ejemplos adicionales en los que la línea `owner:` nombra a otra persona. Con ello el modelo aprende a comparar el beneficiario del pago con la línea del titular en lugar de memorizar un nombre concreto, y el nombre real del propietario no queda en los pesos. El prompt de sistema se reduce al disparador `sms_txn_v1`, ya que las reglas de etiquetado se incorporaron a los pesos; el turno de usuario contiene titular, remitente, carpeta y texto del SMS. La decodificación es greedy y la salida típica ronda los 30 tokens.

## Capacidades

- Extracción de transacciones bancarias desde SMS: devuelve JSON con importe, divisa, dirección (débito/crédito), comercio y marca de transferencia.
- Clasificación binaria de transacción real frente a mensajes no transaccionales (OTP, recordatorios de vencimiento, promociones, avisos de entrega).
- Distinción entre pagos a terceros y transferencias entre cuentas propias del titular, usando la línea `owner:` como referencia.
- Salida JSON estructurada y compacta (unos 30 tokens) con decodificación greedy, adecuada para pipelines deterministas.
- Manejo de SMS en inglés y de algunos mensajes de recarga en escritura assamesa.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento; su alcance es exclusivamente la extracción de un único mensaje.

## Casos de uso

- Clasificación automática de la bandeja de entrada SMS en una app financiera personal: el modelo procesa cada mensaje recibido y separa transacciones reales de OTP y promociones, con una salida JSON directamente insertable en base de datos.
- Agregación de gastos por comercio: al extraer `merchant`, `amount` y `currency`, un backend puede sumar el gasto mensual por establecimiento y excluir las transferencias entre cuentas propias gracias a `is_transfer`.
- Conciliación de movimientos con extractos bancarios: el JSON generado sirve como entrada para cruzar SMS con líneas de extracto, usando `direction` y `amount` como claves de emparejamiento.
- Automatización de finanzas personales en local: al ser un modelo de 0,5B ejecutable en hardware de consumo (el autor reporta MLX 4-bit), puede desplegarse en el propio dispositivo sin enviar SMS a un servicio externo.
- Filtrado previo en pipelines de extracción mayores: como clasificador barato y rápido que descarta mensajes no transaccionales antes de invocar un modelo mayor o un OCR.
- Prototipado de sistemas de extracción de información financiera: sirve como referencia de ajuste fino con LoRA sobre datos escasos y de una sola fuente, replicable para otros dominios con un presupuesto de cómputo mínimo (una T4).

## Benchmarks y rendimiento

| Conjunto de evaluacion | Precision |
|---|---|
| 2.588 mensajes de test retenidos, precision completa (seis campos exactos) | 98,5% |
| Transferencias a cuenta propia en ese conjunto | 14 de 17 |
| 29 mensajes de demostracion, precision completa | 27/29 |
| 29 mensajes de demostracion, MLX 4-bit | 25/29 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son las reportadas por el autor en la model card y corresponden exclusivamente a la tarea de extraccion de SMS.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16 para los 494 millones de parametros, mas el overhead de activaciones y del runtime; en 4-bit, del orden de 0,3-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16; el autor entrenó en una NVIDIA T4, lo que da una referencia de que el ajuste cabe en GPUs de gama media y en instancias cloud economicas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en equipos Apple Silicon mediante MLX (el autor evaluó una variante 4-bit en MLX).
- Opciones de despliegue: transformers (formato publicado), llama.cpp y Ollama tras conversion a GGUF, vLLM y TGI para servir en produccion, y MLX para Apple Silicon. El adaptador LoRA puede cargarse por separado sobre el modelo base.
- Latencia y throughput: no disponibles de forma explicita; la salida de unos 30 tokens con decodificacion greedy en un modelo de 0,5B sugiere latencias muy bajas, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azabdus/qwen2.5-0.5b-sms-txn | 494 M | no disponible | Extraccion de transacciones desde SMS indios | Apache 2.0 | Hugging Face, 20 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | Hugging Face |

La comparacion relevante es con su propio modelo base: el ajuste sacrifica generalidad a cambio de una precision del 98,5% en una tarea concreta, con un coste de entrenamiento de una sola GPU T4 y una epoca. Frente a un modelo mayor como Qwen2.5-1,5B-Instruct, el de 0,5B ofrece menor capacidad general pero menores requisitos de memoria y latencia. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado con los bancos de una sola persona (principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison y carteras y comercios indios). Bancos no vistos, como los debitos de HDFC, se leen con menor fiabilidad.
- Cobertura linguistica limitada: ingles y algunos mensajes de recarga en escritura assamesa; no se declaran otros idiomas.
- Dependencia de la linea `owner:`: sin ella, el campo `is_transfer` es poco fiable porque el modelo no puede saber a quien pertenecen las cuentas.
- Transferencias reconocibles solo por patrones nuevos (carteras o brokers no vistos) se pasan por alto con frecuencia: 10 de 17 en el conjunto de test.
- Degradacion con cuantizacion: en MLX 4-bit el acierto en la demo baja de 27/29 a 25/29, lo que indica cierta sensibilidad a la precision numerica.
- Riesgo de alucinacion en importes o comercios cuando el SMS tiene un formato atipico; conviene validar la salida contra el texto original antes de usarla en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre exactitud en dominios distintos al entrenado.
- Volumen de adopcion muy bajo (20 descargas, 0 likes) y sin pipeline declarado, por lo que no hay validacion independiente de las cifras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-0.5b-sms-txn
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
