# h0ney-badger/dolphin-email-8b

## Resumen

dolphin-email-8b es un modelo de lenguaje de 8.030 millones de parámetros, especializado en la redacción de correos electrónicos. Desarrollado por h0ney-badger, se construye sobre Dolphin3.0-Llama3.1-8B mediante un fine-tuning con QLoRA. Su principal innovación es una disciplina estricta de no fabricación: cuando un dato concreto no se ha proporcionado, el modelo emite un marcador de posición `[PLACEHOLDER]` en lugar de inventar un valor plausible. Esto lo hace especialmente útil en entornos de producción donde los datos inventados (direcciones, importes, fechas) son inaceptables.

El modelo se ofrece en formato safetensors (fp16) y GGUF (Q5_K_M), con licencia Llama 3.1 Community License. Está pensado para ejecución local y su entrenamiento se realizó con datos sintéticos generados por un profesor, evitando deliberadamente corpus de correos reales para no reproducir información personal identificable. La evaluación del autor, centrada en la resistencia a la fabricación bajo presión, muestra una mejora clara frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (fp16), GGUF (Q5_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

dolphin-email-8b es un modelo basado en la arquitectura Llama 3.1, heredada del modelo base dphn/Dolphin3.0-Llama3.1-8B. El fine-tuning se realizó con QLoRA (r=32) durante 2 épocas, y los pesos resultantes se fusionaron a fp16 y se cuantizaron posteriormente a GGUF Q5_K_M. El entrenamiento se llevó a cabo en una sola GPU RTX 5070 Ti.

Los datos de entrenamiento fueron generados por un profesor local a partir de resúmenes sintéticos. Cada par de correos debía pasar un "compilador" de verificación con tres compuertas: una de no fabricación (cualquier dato específico no presente en el resumen debía ser un placeholder), una de estructura (asunto/saludo/cuerpo/despedida; una respuesta no debe reabrir con un saludo nuevo) y una de fidelidad para reescrituras (mantener las peticiones y números, cambiando solo el registro). No se utilizaron corpus reales de correos (Enron, AESLC) como texto objetivo, para evitar enseñar al modelo a reproducir PII de personas reales. El modelo usa el formato ChatML y funciona bien incluso sin un prompt de sistema, aunque se recomienda uno específico para reforzar la disciplina anti-fabricación.

## Capacidades

- Redacción de correos electrónicos a partir de una línea breve con el registro solicitado.
- Transformación de tono: convierte un borrador brusco o enfadado en un texto enviable.
- Respuestas en hilo de correo, manteniendo la estructura y sin reabrir con un saludo nuevo.
- Control de registro (formal, informal, profesional) según la petición.
- No fabricación de datos concretos no proporcionados: emite `[PLACEHOLDER]` para direcciones, teléfonos, enlaces, importes, fechas, horas y nombres.
- Generación de texto en inglés, tanto para correos personales como profesionales.
- Funciona con el formato ChatML; se recomienda un prompt de sistema que refuerce la disciplina de no fabricación, aunque el modelo se comporta bien incluso sin él.

## Casos de uso

- Redacción de correos profesionales: a partir de una instrucción breve, el modelo genera un borrador completo con asunto, saludo, cuerpo y despedida, ajustando el registro al solicitado.
- Reescritura de borradores conflictivos: si un usuario escribe un borrador enfadado o demasiado informal, el modelo lo transforma en un tono más profesional manteniendo las peticiones y los datos numéricos originales.
- Respuestas en hilo de correo: el modelo puede redactar una respuesta contextualizada dentro de una conversación existente, sin repetir saludos ni perder el hilo.
- Atención al cliente por email: para responder a reclamaciones o consultas, el modelo genera respuestas claras y, cuando faltan datos del cliente (número de pedido, dirección), los deja como `[PLACEHOLDER]` para que un humano los rellene.
- Comunicaciones internas de empresa: redacción de anuncios, solicitudes o recordatorios en inglés, con control de tono y sin riesgo de inventar fechas o nombres de empleados.
- Uso en entornos locales con privacidad: gracias a la cuantización GGUF, el modelo puede ejecutarse en una máquina local o en un servidor privado, evitando enviar datos sensibles a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación interna honesta basada en un test constante de 12 casos, con decodificación greedy y un prompt de sistema neutro. La banda diagnóstica es `nofab_adversarial`, que contiene prompts diseñados para provocar fabricación.

| Eje | Dolphin3.0 stock | dolphin-email-8b |
|---|---|---|
| email_draft | 2/2 | 2/2 |
| tone_transform | 1/1 | 1/1 |
| reply_draft | 1/1 | 1/1 |
| nofab (pedido, no dado) | 2/2 | 2/2 |
| register_control | 1/1 | 1/1 |
| nofab_adversarial (cebo de fabricacion) | 3/5 | 5/5 |
| Total | 10/12 | 12/12 |

La mejora medible se concentra en el eje de presión por fabricación: bajo prompts adversariales, el modelo base inventa direcciones, fechas y horas, mientras que este modelo las sustituye por placeholders.

## Requisitos de hardware

- Tamano del repositorio: 21.8 GB, incluyendo pesos en safetensors y GGUF.
- VRAM estimada: no disponible en la información proporcionada. Para un modelo de 8B, la inferencia en fp16 requiere típicamente alrededor de 16 GB, y la cuantización Q5_K_M reduce el consumo a aproximadamente 6 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no disponibles. El autor utilizó una RTX 5070 Ti para el fine-tuning con QLoRA, lo que sugiere que la inferencia en cuantización es viable en GPUs de gama media, pero no se proporcionan datos oficiales.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; vLLM o TGI para el formato safetensors, al ser compatible con la arquitectura Llama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| dolphin-email-8b | 8.03B | No disponible | Llama 3.1 | Redaccion de emails, anti-fabricacion |
| Dolphin3.0-Llama3.1-8B | 8.03B | No disponible | Llama 3.1 | General, sin disciplina anti-fabricacion |
| dolphin3-civic-8b | 8.03B | No disponible | Llama 3.1 | Registros publicos / FOIA |

La evaluacion del autor muestra que dolphin-email-8b supera al modelo base en el eje nofab_adversarial (5/5 frente a 3/5), manteniendo el rendimiento en los demas ejes. El modelo hermano dolphin3-civic-8b comparte la misma base y filosofia de especializacion separada, pero se orienta a solicitudes de registros publicos.

## Limitaciones y advertencias

- Al ser un modelo de 8B cuantizado, puede fallar ocasionalmente en detalles o matices de registro; se recomienda revisar el texto antes de enviarlo.
- Los placeholders son una caracteristica, no un fallo: se espera que el usuario rellene los `[BRACKETS]` con los datos reales.
- Solo soporta ingles; no esta entrenado para otros idiomas.
- No es un modelo de redaccion legal ni sustituye el asesoramiento juridico.
- Entrenado con datos sinteticos, por lo que refleja los sesgos del profesor y de las compuertas de verificacion.
- Hereda la licencia Llama 3.1 Community License del modelo base, que impone condiciones de uso; se deben revisar los terminos antes de un despliegue comercial.
- Existe un riesgo residual de alucinacion en aspectos no cubiertos por la disciplina de placeholders.

## Enlaces

- HuggingFace: https://huggingface.co/h0ney-badger/dolphin-email-8b
- Modelo base: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Modelo hermano: https://huggingface.co/h0ney-badger/dolphin3-civic-8b
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.
