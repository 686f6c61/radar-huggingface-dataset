# Harshp700/finnai-1.7b-bank-sms-parser

## Resumen

FinnAI 1.7B Bank SMS Parser es un modelo de lenguaje pequeño (SLM) de 1.720.574.976 parámetros, publicado por el usuario Harshp700 en Hugging Face, especializado en la extracción de datos financieros estructurados a partir de mensajes SMS de bancos indios. Se trata de un fine-tuning del modelo `finndot/finnai-slm-v4` (a su vez basado en la arquitectura Qwen3 1.7B), al que se han fusionado pesos LoRA específicos del dominio bancario para producir un modelo standalone que puede cargarse directamente con `transformers` sin necesidad de PEFT.

El problema que resuelve es muy concreto: convertir notificaciones bancarias no estructuradas (SMS de bancos como HDFC, SBI o ICICI) en objetos JSON estrictamente formateados con ocho campos: tipo de mensaje, importe, tipo de transacción, banco, cuenta, fecha, saldo y número de referencia. Es relevante porque la extracción determinista de este tipo de datos suele requerir reglas frágiles o LLM grandes y costosos; un modelo de 1,7B especializado permite hacerlo en local con hardware modesto.

El modelo emplea la arquitectura `Qwen3ForCausalLM` en precisión bfloat16, con soporte de plantilla de chat ChatML y una longitud de contexto de hasta 40.960 tokens, aunque está optimizado para entradas cortas de un solo turno. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | bfloat16 (nativo); no disponible información sobre cuantizaciones adicionales |
| Idiomas soportados | Ingles (formatos de SMS bancarios indios) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 3,22 GB) |

## Arquitectura y entrenamiento

El modelo parte de `finndot/finnai-slm-v4`, un modelo causal basado en la arquitectura Qwen3 de 1,7B parámetros. Sobre esta base se aplicó Low-Rank Adaptation (LoRA) sobre todas las proyecciones del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`), con rank r=16 y scaling α=32. Posteriormente, los pesos del adaptador se fusionaron linealmente con el modelo base mediante `peft.PeftModel.merge_and_unload()` en bfloat16, generando un modelo autónomo de despliegue directo.

No se ha publicado información sobre el dataset de entrenamiento (número de ejemplos, composición, tokens procesados) ni sobre el uso de RLHF o DPO. El tokenizer es el de Qwen, con soporte de plantilla de chat ChatML mediante Jinja. Como innovación destacable, la model card enfatiza el diseño de guardarrails financieros: emisión de `null` ante campos ausentes en lugar de inventar datos, distinción rigurosa entre importe transaccionado y saldo disponible, y discriminación entre transacciones reales, alertas de saldo y rechazos de tarjeta.

## Capacidades

- Extracción de información estructurada: convierte SMS bancarios en JSON con un esquema fijo de 8 campos (`message_type`, `amount`, `transaction_type`, `bank_name`, `account`, `transaction_date`, `balance`, `reference_number`).
- Clasificacion de mensajes: distingue entre `TRANSACTION`, `BALANCE_ALERT`, `DECLINED`, `PROMOTIONAL` y `OTHER`.
- Direccion de transacciones: identifica correctamente `DEBIT` frente a `CREDIT` según la terminología bancaria india.
- Distincion importe/saldo: separa el valor transaccionado del saldo restante en la cuenta.
- Comportamiento anti-alucinacion: devuelve `null` en campos no presentes en el mensaje en lugar de inventar valores.
- Preservacion de identificadores: mantiene los sufijos de cuenta enmascarados como cadena con ceros a la izquierda (por ejemplo, `"0211"`).
- Generacion de texto general heredada de la base Qwen3, aunque no es el uso previsto.
- No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Parser de SMS bancarios en aplicaciones de finanzas personales: el modelo extrae importe, tipo, banco, cuenta y referencia de cada notificación para alimentar apps de seguimiento de gastos, gracias a su salida JSON determinista de 8 campos.
- Conciliacion automatica de transacciones: los campos `reference_number` (UPI Ref ID, UTR o txn ID) y `transaction_date` permiten cruzar los SMS con extractos bancarios y sistemas contables.
- Clasificacion de bandejas de entrada financieras: el campo `message_type` permite filtrar automáticamente mensajes promocionales de transacciones reales en sistemas de notificaciones.
- Deteccion de rechazos de tarjeta: la categoría `DECLINED` permite construir alertas en tiempo real sobre pagos fallidos para equipos de soporte o el propio usuario.
- Ingesta de datos para data lakes financieros: puede ejecutarse como microservicio ligero en un endpoint privado, transformando flujos de SMS en JSON consultable sin enviar datos sensibles a APIs de terceros.
- Normalizacion de datos de WhatsApp banking: según la model card, también está pensado para formatos de notificación vía WhatsApp, no solo SMS puro.
- Migracion de sistemas legacy: sustituye parsers basados en regex y reglas frágiles que se rompen con cada variación de formato de los distintos bancos indios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en bfloat16 (tamaño del repo: 3,5 GB; pesos safetensors: 3,22 GB). Con cuantización a 4 bits podría rondar 1,5-2 GB, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090, T4, A10G, A100). No se requiere hardware de gama alta.
- Consumer GPUs: cabe con holgura en GPUs de consumo; una RTX 3060 de 12 GB o incluso una RTX 3060 Ti de 8 GB son suficientes para bfloat16. También es viable su ejecución en CPU dado el tamaño, aunque sin datos de latencia publicados.
- Despliegue: carga directa con Hugging Face `transformers` (modelo ya fusionado, sin necesidad de PEFT); compatible con Hugging Face Inference API / Inference Endpoints (ejemplo cURL en la model card). No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo Qwen3 en safetensors es teóricamente compatible con dichos runtimes; no disponible confirmación oficial.
- Latencia y throughput: no disponible. La model card recomienda `do_sample=False` (decodificación greedy) y `max_new_tokens=256`, lo que sugiere un uso determinista de baja latencia para salidas JSON cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finnai-1.7b-bank-sms-parser | ~1,7B | Qwen3 1.7B | Parser de SMS bancarios indios a JSON | Apache 2.0 | Hugging Face, safetensors |
| Qwen3-1.7B (base oficial) | ~1,7B | Qwen3 | Modelo general multilingue | Apache 2.0 | Hugging Face, safetensors y GGUF |
| finndot/finnai-slm-v4 | ~1,7B | Qwen3 | Base financiera (sin merge LoRA) | no disponible | Hugging Face |

El modelo de esta ficha se diferencia de la base Qwen3-1.7B en que está especializado mediante LoRA en un dominio muy estrecho (extracción de transacciones de SMS indios), sacrificando la generalidad a cambio de precisión en el esquema JSON de 8 campos. Frente a usar un LLM grande generalista (por ejemplo, un modelo de 7B o superior) para la misma tarea, ofrece un coste de inferencia mucho menor y comportamiento determinista, aunque no hay benchmarks publicados que cuantifiquen la diferencia.

## Limitaciones y advertencias

- Idioma y dominio: optimizado para formatos de notificación bancaria india en inglés (SMS/WhatsApp). No está pensado para otros idiomas ni para otros tipos de documentos financieros.
- Mensajes degradados: SMS extremadamente truncados o corruptos pueden no producir los 8 campos completos.
- Riesgo de alucinacion: la model card declara guardarrails anti-alucinación (emisión de `null` ante campos ausentes), pero no hay benchmarks públicos que lo verifiquen; se recomienda validación con datos propios antes de producción.
- Datos sensibles: aunque el modelo no almacena ni transmite credenciales bancarias, la model card recomienda su uso estrictamente en inferencia local o en endpoints privados seguros, dado que los SMS contienen datos financieros personales.
- Contexto: pese a soportar hasta 40.960 tokens, está optimizado para mensajes cortos de un solo turno; no es adecuado para conversaciones largas ni razonamiento multi-paso.
- Sin benchmarks publicados: no existen métricas de precisión (exact match sobre el JSON, F1 por campo) que permitan evaluar objetivamente su fiabilidad.
- Sesgos: no disponible información sobre sesgos conocidos más allá del estrechamiento del dominio de entrenamiento a la banca india.
- Licencia: Apache 2.0, sin restricciones para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harshp700/finnai-1.7b-bank-sms-parser
- Modelo base: https://huggingface.co/finndot/finnai-slm-v4
- Paper: no disponible
- Repositorio de codigo o demo: no disponible
