# azabdus/qwen2.5-0.5b-sms-txn-mlx-4bit

## Resumen

El modelo `azabdus/qwen2.5-0.5b-sms-txn-mlx-4bit` es un ajuste fino de Qwen2.5-0.5B-Instruct orientado a una tarea muy concreta: la extracción de información estructurada a partir de mensajes SMS bancarios indios. Dado un SMS, devuelve un objeto JSON con seis campos (`is_txn`, `direction`, `amount`, `currency`, `merchant`, `is_transfer`) o la marca `{"is_txn":false}` cuando el mensaje no representa un movimiento de dinero real, como ocurre con OTP, recordatorios de vencimiento o promociones. Lo desarrolla el usuario azabdus y se publica bajo licencia Apache 2.0.

La relevancia del modelo reside en su especialización y su ligereza: con 494 millones de parámetros y cuantización de 4 bits en formato MLX, está pensado para ejecutarse en Apple silicon (Mac, iPhone, iPad), lo que permite procesar SMS en el propio dispositivo sin enviar datos financieros a un servidor. El prompt de sistema se reduce al disparador `sms_txn_v1`, ya que las reglas de etiquetado se incorporaron a los pesos durante el entrenamiento.

Técnicamente es un transformer decoder-only derivado de Qwen2.5, ajustado mediante LoRA sobre aproximadamente 11.800 SMS etiquetados a mano de un único usuario. No es un modelo de propósito general: su utilidad está acotada al dominio financiero indio y a la extracción de transacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, no confirmada en la informacion) |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | Ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros, y se ajusta mediante LoRA con rango 16 aplicado a todas las capas lineales. La pérdida se calcula únicamente sobre la respuesta, no sobre el prompt. El entrenamiento consistió en una época sobre aproximadamente 11.800 SMS etiquetados a mano procedentes del teléfono de una sola persona, ejecutado en una única GPU T4. La partición de datos se hizo por fecha, de modo que el conjunto de test contiene mensajes de un periodo posterior a cualquier mensaje de entrenamiento.

Una innovación destacable es el tratamiento de la privacidad: el nombre y los UPI del propietario se sustituyeron en entrenamiento por una identidad ficticia distinta en cada ejemplo, tanto en el SMS como en la respuesta y en la línea `owner:`, con ejemplos adicionales en los que esa línea nombra a otra persona. Así el modelo aprende a comparar el beneficiario con la línea del propietario en lugar de memorizar un nombre concreto, y el nombre real no queda en los pesos. La cuantización a 4 bits en formato MLX permite desplegarlo en hardware Apple.

## Capacidades

- Extracción de transacciones bancarias desde SMS a JSON estructurado con seis campos.
- Distinción entre transacciones reales y mensajes que no lo son (OTP, recordatorios de vencimiento, promociones, actualizaciones de entrega).
- Clasificación de dirección del movimiento: `debit` (salida) o `credit` (entrada).
- Identificación de importe y divisa tal como aparecen en el SMS.
- Extracción del comercio o contraparte (`merchant`), o `null` si no se nombra.
- Detección de transferencias entre cuentas propias del titular (`is_transfer`), incluyendo pagos a su propio nombre o UPI, pagos de tarjeta, amortizaciones de préstamos y recargas de cartera o bróker.
- Funcionamiento con un prompt de sistema mínimo (`sms_txn_v1`) sin instrucciones adicionales.
- Ejecución en dispositivo (Apple silicon) mediante MLX.
- No dispone de tool calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Clasificación de SMS en el propio dispositivo: integrar el modelo en una app iOS o macOS para leer la bandeja de entrada y marcar qué mensajes son transacciones, sin enviar el texto a ningún servidor y preservando la privacidad financiera del usuario.
- Generación de registros de gasto automáticos: convertir cada SMS de débito en una entrada estructurada con importe, comercio y divisa para alimentar una hoja de cálculo o una app de finanzas personales.
- Separación de transferencias internas: usar el campo `is_transfer` para excluir de los totales de gasto los movimientos entre cuentas propias, pagos de tarjeta o recargas de cartera, evitando duplicar el cómputo del gasto.
- Filtrado de ruido en bandejas de entrada: descartar OTP, recordatorios y promociones mediante `is_txn:false`, reduciendo el volumen de mensajes que requieren procesamiento posterior.
- Conciliación de extractos: procesar lotes de SMS históricos para reconstruir un historial de transacciones y cruzarlo con extractos bancarios, aprovechando la salida JSON estable de unos 30 tokens.
- Prototipado de asistentes financieros: usar el modelo como extractor ligero en una arquitectura mayor donde otro componente realice el razonamiento o la presentación al usuario.
- Investigación sobre extracción de información en dominios de bajos recursos: servir como referencia de ajuste fino LoRA con anonimización de identidad para tareas de IE en texto corto y ruidoso.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Precision (seis campos exactos) |
|---|---|
| 2.588 mensajes de test reservados, precision completa | 98,5 % |
| Transferencias a cuenta propia en ese conjunto | 14 de 17 |
| 29 mensajes de demostracion, precision completa | 27/29 |
| 29 mensajes de demostracion, MLX 4 bits | 25/29 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,6 GB en cuantización de 4 bits; la inferencia requiere del orden de 1 GB o menos de memoria unificada.
- GPU recomendadas: hardware Apple silicon (series M1, M2, M3, M4) mediante MLX; no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple silicon y en iPhone o iPad compatibles con MLX.
- Opciones de despliegue: `mlx_lm` (librería `mlx`), con carga mediante `load("azabdus/qwen2.5-0.5b-sms-txn-mlx-4bit")`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la generación es codiciosa y produce unos 30 tokens por mensaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| azabdus/qwen2.5-0.5b-sms-txn-mlx-4bit | 494 M | no disponible | Extraccion de transacciones desde SMS indios | Apache 2.0 | MLX 4 bits |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | Proposito general, instrucciones | Apache 2.0 | safetensors |
| Qwen2.5-1.5B-Instruct | 1.500 M (aprox.) | no disponible | Proposito general, instrucciones | Apache 2.0 | safetensors, GGUF |

La comparación con alternativas especializadas en extracción de transacciones desde SMS no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con los bancos de una sola persona, principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison, carteras y comercios indios; bancos no vistos, como HDFC en débitos, se leen con menor fiabilidad.
- Solo inglés y algunos mensajes de recarga en escritura assamesa; no cubre otros idiomas.
- Sin la línea `owner:` el campo `is_transfer` no es fiable, porque el modelo no puede saber a quién pertenecen las cuentas.
- Las transferencias reconocibles solo por patrones nuevos (un bróker o cartera no visto) suelen pasarse por alto: 10 de 17 en el conjunto de test.
- La cuantización a 4 bits degrada ligeramente la precisión: 25/29 frente a 27/29 en los mensajes de demostración.
- Riesgo de alucinación en campos como `merchant` o `amount` ante formatos de SMS no vistos durante el entrenamiento.
- Posibles sesgos derivados de un único usuario: entidades, comercios y hábitos de un solo titular no representan la diversidad de la población.
- Licencia Apache 2.0 permite uso comercial, pero la fiabilidad en producción fuera del dominio entrenado no está garantizada y requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-0.5b-sms-txn-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Librería MLX: https://github.com/ml-explore/mlx
- MLX LM: https://github.com/ml-explore/mlx-lm
