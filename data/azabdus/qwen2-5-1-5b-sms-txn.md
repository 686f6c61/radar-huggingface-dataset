# azabdus/qwen2.5-1.5b-sms-txn

## Resumen

Qwen2.5-1.5B sms-txn es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario azabdus en Hugging Face. Su proposito es muy concreto: recibir un unico SMS bancario indio y devolver un objeto JSON con los campos de la transaccion extraidos, o `{"is_txn":false}` cuando el mensaje no corresponde a un movimiento de dinero real (OTP, recordatorio de factura, promocion, aviso de entrega).

El modelo resuelve un problema de extraccion de informacion estructurada en el dominio financiero personal: convertir texto libre no homogeneo (SMS de distintos bancos y comercios) en datos normalizados (`direction`, `amount`, `currency`, `merchant`, `is_transfer`). Es relevante para desarrolladores que construyan aplicaciones de finanzas personales en India, donde el SMS sigue siendo el canal principal de notificacion bancaria y los formatos varian enormemente entre entidades.

Arquitectura transformer decoder-only de 1.543.714.304 parametros (aproximadamente 1,5B), derivada de Qwen2.5-1.5B-Instruct. El ajuste se realizo con LoRA sobre un unico dataset de etiquetado manual de unos 11.800 SMS de un solo usuario, y los pesos finales se publican fusionados en bf16, junto con el adaptador LoRA por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | bf16 en los pesos publicados; probado en MLX 4-bit segun la model card |
| Idiomas soportados | Ingles y algunos mensajes de recarga en escritura assamesa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados en layout transformers) y adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar. Sobre esa base se aplico un adaptador LoRA con rango r=16 sobre todas las capas lineales, con la funcion de perdida calculada unicamente sobre la respuesta (no sobre el prompt). El entrenamiento consistio en una epoca sobre aproximadamente 11.800 SMS etiquetados a mano procedentes del telefono de una sola persona, ejecutado en una unica GPU T4. La particion train/test se hizo por fecha, de modo que el conjunto de test contiene mensajes de un periodo posterior a cualquier mensaje de entrenamiento, lo que reduce el riesgo de fuga temporal.

Una innovacion destacable del proceso es la anonimizacion del titular: el nombre y los UPI del propietario se sustituyeron en entrenamiento por una identidad ficticia distinta para cada ejemplo, tanto en el SMS como en la respuesta y en la linea `owner:`. Ademas se anadieron ejemplos donde la linea `owner:` nombra a otra persona. Con ello el modelo aprende a comparar el beneficiario con la linea del titular en lugar de memorizar un nombre concreto, y el nombre real del propietario no queda en los pesos. El prompt de sistema se reduce a un unico disparador (`sms_txn_v1`) porque las reglas de etiquetado se incorporaron a los pesos durante el ajuste.

## Capacidades

- Extraccion de informacion estructurada: convierte un SMS bancario en un JSON con seis campos (`is_txn`, `direction`, `amount`, `currency`, `merchant`, `is_transfer`).
- Clasificacion binaria de transaccion: distingue movimientos de dinero reales de OTP, recordatorios de vencimiento, promociones y avisos de entrega.
- Deteccion de direccion del flujo: identifica `debit` (salida) y `credit` (entrada).
- Deteccion de transferencias internas: marca `is_transfer` cuando el dinero se mueve entre cuentas del propio titular (nombre o UPI propios, pago de tarjeta, devolucion de prestamo, recarga de monedero o broker).
- Extraccion de contraparte: devuelve el `merchant` tal como lo nombra el SMS, o `null`.
- Generacion de salida corta y determinista: la model card indica decodificacion greedy y una salida de unos 30 tokens.
- Capacidad multilingue limitada: ingles y algunos mensajes de recarga en escritura assamesa.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Clasificacion y registro automatico de gastos: la aplicacion envia cada SMS entrante al modelo y almacena el JSON resultante en una base de datos de movimientos, descartando OTP y promociones mediante `is_txn`.
- Conciliacion de cuentas propias: usando la linea `owner:` con nombre y UPI del titular, el modelo marca `is_transfer` y permite excluir transferencias internas de los totales de gasto, evitando duplicar importes entre cuentas.
- Extraccion de contraparte para categorizacion: el campo `merchant` alimenta reglas o un clasificador secundario que asigna categoria (suscripciones, transporte, recargas), ya que el modelo devuelve la contraparte tal como aparece en el SMS.
- Aplicaciones moviles de finanzas personales en India: al ser un modelo de 1,5B, puede ejecutarse en local o en un servidor modesto, procesando SMS en el propio dispositivo o en un backend ligero sin enviar texto financiero a terceros.
- Enriquecimiento de datos historicos: procesar en lote el historico de SMS de un usuario para reconstruir un registro de transacciones con importe, moneda y direccion normalizados.
- Filtrado previo en pipelines de alertas: usar `is_txn:false` para descartar mensajes irrelevantes antes de pasarlos a un sistema de notificaciones o de analisis mas costoso.
- Prototipado rapido de extractores de dominio: servir como base para ajustes adicionales sobre otros bancos o formatos, dado que los pesos y el adaptador LoRA estan publicados y la licencia es Apache 2.0.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, sobre el propio conjunto de evaluacion del autor:

| Conjunto | Metrica | Resultado |
|---|---|---|
| 2.588 mensajes de test reservados, precision completa | Exactamente correcto en los seis campos | 98,6% |
| Transferencias a cuenta propia en ese conjunto | Correctamente identificadas | 17 de 17 |
| 29 mensajes de demostracion, precision completa | Correctos | 28 de 29 |
| 29 mensajes de demostracion, MLX 4-bit | Correctos | 28 de 29 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 1,54B parametros ocupan aproximadamente 3,1 GB de pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 6-8 GB. En 4-bit, el peso se reduce a cerca de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB para bf16; el autor entreno en una T4. Para mayor throughput, A10G, L4 o superiores.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores. Tambien es viable en Apple Silicon mediante MLX, segun la prueba en 4-bit de la model card.
- Opciones de despliegue: transformers (pesos fusionados), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), vLLM y TGI para servir en produccion, y MLX en hardware Apple.
- Latencia y throughput: no disponible. La model card solo indica que la salida es de unos 30 tokens con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azabdus/qwen2.5-1.5b-sms-txn | 1,54B | no disponible | Extraccion JSON de SMS bancarios indios | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | no disponible en la informacion proporcionada | Instruccion general | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en la informacion proporcionada | Instruccion general | Apache 2.0 | Hugging Face |

La comparacion relevante es con el modelo base: el ajuste anade una tarea especializada (extraccion estructurada con reglas de negocio incorporadas) a costa de perder generalidad. Frente a modelos de instruccion general del mismo tamano, la ventaja es la salida JSON consistente y la deteccion de `is_transfer`; la desventaja es el dominio estrecho (bancos indios concretos, un solo titular de origen). No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio bancario estrecho: entrenado con los bancos de una sola persona, principalmente ICICI, HSBC, SBI UPI, Slice, Credit Saison y monederos y comercios indios. Bancos no vistos, como HDFC en debitos, se leen con menos fiabilidad.
- Cobertura idiomatica limitada: ingles y algunos mensajes de recarga en escritura assamesa; no se documenta soporte para hindi ni otras lenguas indias.
- Dependencia de la linea `owner:`: sin ella, `is_transfer` no es fiable porque el modelo no puede saber a quien pertenecen las cuentas.
- Transferencias con patrones nuevos: las que solo se reconocen por un patron no visto (por ejemplo, un broker o monedero nuevo) a menudo se pasan por alto; en el conjunto de test se detectaron 10 de 17.
- Riesgo de alucinacion: aunque la tarea es de extraccion y la salida es corta, el modelo podria inventar importes o contrapartes en SMS con formato muy distinto al de entrenamiento; conviene validar el JSON contra el texto original.
- Sesgo de origen: los datos proceden de un unico usuario, por lo que la distribucion de remitentes, comercios e importes esta sesgada hacia sus habitos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no debe presentarse como asesoramiento financiero ni usarse para decisiones automatizadas sin validacion humana.
- Produccion: no hay pesos GGUF publicados en el repo, por lo que el despliegue con llama.cpp u Ollama requiere conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-1.5b-sms-txn
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
