# azabdus/qwen2.5-1.5b-sms-txn-mlx-4bit

## Resumen

Qwen2.5-1.5B sms-txn (MLX, 4-bit) es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por el usuario azabdus, orientado a una tarea muy concreta: la extraccion estructurada de transacciones financieras a partir de mensajes SMS de bancos indios. El modelo recibe un SMS y devuelve un objeto JSON con seis campos (`is_txn`, `direction`, `amount`, `currency`, `merchant`, `is_transfer`) o `{"is_txn":false}` cuando el mensaje no representa un movimiento de dinero real (OTP, recordatorio de vencimiento, promocion, aviso de entrega).

Se distribuye en formato MLX cuantizado a 4 bits, pensado para ejecutarse en Apple silicon (Mac, iPhone, iPad) mediante la libreria `mlx_lm`. El modelo base es un transformer denso de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es practica: demuestra como un modelo pequeno, ajustado con LoRA sobre datos muy especificos y con un diseno de prompt minimalista (un unico token de activacion, `sms_txn_v1`), puede alcanzar un 98,6% de acierto exacto en los seis campos sobre un conjunto de test separado por fecha. Es un caso de estudio de especializacion estrecha frente a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino con LoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | 4-bit (formato MLX); el modelo base admite otras cuantizaciones, no publicadas en este repo |
| Idiomas soportados | Ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. Sobre el se aplico un ajuste fino con LoRA de rango 16 sobre todas las capas lineales, con la funcion de perdida calculada unicamente sobre la respuesta (no sobre el prompt). El entrenamiento consistio en una sola epoca sobre aproximadamente 11.800 SMS etiquetados manualmente, extraidos del telefono de una sola persona, ejecutado en una unica GPU T4.

La particion de datos se hizo por fecha, de modo que el conjunto de test contiene mensajes de un periodo posterior a cualquier mensaje de entrenamiento, lo que reduce el riesgo de fuga de informacion temporal. Como medida de privacidad, el nombre y los identificadores UPI del titular real se sustituyeron en entrenamiento por una identidad ficticia distinta en cada ejemplo, tanto en el SMS como en la respuesta y en la linea `owner:`, con ejemplos adicionales en los que la linea del titular nombra a otra persona. Asi el modelo aprende a comparar el beneficiario con la linea del titular en lugar de memorizar un nombre concreto, y el nombre real no queda en los pesos.

La innovacion principal no es arquitectonica sino de diseno de tarea: las reglas de etiquetado se incorporaron a los pesos, de modo que el system prompt se reduce al disparador `sms_txn_v1` y no requiere instrucciones en lenguaje natural. La salida es un JSON de unos 30 tokens con decodificacion greedy.

## Capacidades

- Extraccion de informacion estructurada: convierte un SMS bancario en un JSON con seis campos normalizados.
- Clasificacion binaria de transaccion real frente a no transaccion (OTP, recordatorio de pago, promocion, aviso de entrega).
- Determinacion de direccion del flujo de dinero (`debit` o `credit`).
- Extraccion de importe y divisa tal como aparecen en el mensaje.
- Identificacion del contraparte (`merchant`) o `null` si no se nombra.
- Deteccion de transferencias entre cuentas propias del titular (`is_transfer`), incluyendo pagos de tarjeta, amortizaciones de prestamos y recargas de cartera o broker.
- Capacidad multilingue limitada: ingles y algunos mensajes de recarga en escritura assamesa.
- No dispone de tool calling, function calling, modo thinking, vision ni audio; es un modelo de extraccion de un solo turno.

## Casos de uso

- Clasificacion automatica de SMS bancarios en una app de finanzas personales: el modelo recibe cada mensaje entrante y devuelve JSON listo para insertar en una base de datos de movimientos, filtrando OTP y promociones sin intervencion manual.
- Excluir transferencias internas de los totales de gasto: gracias al campo `is_transfer` y a la linea `owner:`, la app puede separar un pago a un tercero de una transferencia entre cuentas propias, evitando duplicar gastos en los informes.
- Procesamiento en el dispositivo en iPhone o iPad: al estar en formato MLX 4-bit, puede ejecutarse localmente sin enviar SMS sensibles a un servidor, lo que reduce el riesgo de privacidad y el coste de infraestructura.
- Enriquecimiento de registros contables: extraer importe, divisa y comercio de SMS para conciliar automaticamente con extractos bancarios en herramientas de contabilidad personal o de pequenas empresas.
- Etiquetado semiautomatico de corpus financieros: usar el modelo como preanotador de grandes volumenes de SMS y reservar la revision humana para los casos de baja confianza o bancos no vistos.
- Prototipado rapido de pipelines de extraccion en Mac: con `mlx_lm` se puede montar un script de inferencia en pocas lineas para validar la viabilidad de un producto antes de invertir en infraestructura de servidor.
- Filtrado de notificaciones en un asistente personal: descartar mensajes que no son transacciones y priorizar solo los movimientos de dinero reales en la bandeja de entrada.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Precision (los seis campos exactos) |
|---|---|
| 2.588 mensajes de test reservados, precision completa | 98,6% |
| Transferencias a cuenta propia en ese conjunto | 17 de 17 |
| 29 mensajes de demo, precision completa | 28/29 |
| 29 mensajes de demo, MLX 4-bit | 28/29 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas de tarea especifica reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,7 GB en 4-bit; en precision completa el modelo base de 1,5B requiere aproximadamente 3-4 GB.
- GPU recomendadas: el formato publicado es MLX, por lo que el hardware objetivo es Apple silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) en Mac, iPhone y iPad.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple silicon; el modelo base tambien cabria en GPUs NVIDIA de consumo (RTX 3060 en adelante) si se convierte a otro formato.
- Opciones de despliegue: `mlx_lm` es la via documentada por el autor; para el modelo base serian posibles llama.cpp, Ollama o vLLM, pero no se documentan en este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; la salida es de unos 30 tokens con decodificacion greedy, lo que sugiere una latencia baja en Apple silicon, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| azabdus/qwen2.5-1.5b-sms-txn-mlx-4bit | 1,5B | no disponible | Extraccion de transacciones de SMS | Apache 2.0 | MLX 4-bit |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Instrucciones generales | Apache 2.0 | safetensors, GGUF, MLX |
| Modelos de extraccion financiera generalistas | no disponible | no disponible | Extraccion de entidades financieras | variable | variable |

La comparacion con alternativas especializadas en extraccion de SMS bancarios indios no esta disponible en la informacion proporcionada. Frente a Qwen2.5-1.5B-Instruct, la diferencia clave es la especializacion: el ajuste fino sustituye instrucciones largas por un disparador de un token y mejora la consistencia del JSON de salida en el dominio, a costa de perder generalidad.

## Limitaciones y advertencias

- Entrenado con los bancos de una sola persona: principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison y carteras y comercios indios. Bancos no vistos, como los debitos de HDFC, se leen con menos fiabilidad.
- Solo ingles y algunos mensajes de recarga en escritura assamesa; no cubre otros idiomas ni otras regiones.
- Sin la linea `owner:`, el campo `is_transfer` no es fiable, porque el modelo no puede saber de quien son las cuentas.
- Las transferencias reconocibles solo por un patron nuevo (un broker o cartera que el modelo no ha visto) suelen pasar desapercibidas: 10 de 17 en el conjunto de test.
- Riesgo de alucinacion en importes o comercios cuando el SMS tiene un formato atipico; conviene validar la salida contra el texto original.
- Sesgo de dominio y de persona: el modelo puede generalizar mal a titulares con multiples cuentas o a mensajes con varias transacciones en un mismo SMS.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud en produccion; se recomienda evaluacion propia antes de desplegar.
- El repo tiene muy poca traccion (13 descargas, 0 likes) y no se ha validado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azabdus/qwen2.5-1.5b-sms-txn-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
