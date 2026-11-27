# Pratham804/Pratham-LFM2.5-350M-V29-RL-Polisher

## Resumen

Pratham-LFM2.5-350M-V29-RL-Polisher es un modelo de 354 millones de parámetros derivado de LiquidAI/LFM2.5-350M, afinado por el autor independiente Pratham804 para una tarea muy concreta: la limpieza de dictado. El modelo recibe una transcripción oral en bruto (con muletillas, falsos arranques, repeticiones y autocorrecciones del hablante) y devuelve el mismo contenido con puntuación y mayúsculas restauradas, números, importes, horas y fechas normalizados, y las enumeraciones convertidas en listas con viñetas. Su premisa es la fidelidad: no reformula, no acorta ni cambia el vocabulario del hablante.

El modelo se construye sobre la arquitectura LFM2.5 de Liquid AI, una base compacta de 350M parámetros, y se distribuye como archivo GGUF cuantizado Q4_K_M de 229,3 MB, lo que lo hace ejecutable en CPU y en GPUs de consumo muy modestas. El ajuste combina una etapa SFT con LoRA de rango 320 (130.023.424 parámetros entrenables, un 26,8 % del total) y una etapa posterior de aprendizaje por refuerzo con optimización de política relativa a grupo (GRPO) frente a una recompensa verificable calculada a partir del texto limpio de referencia, sin etiquetado humano ni modelo juez en el bucle.

Su relevancia es acotada pero clara: los modelos de dictado comerciales suelen ser servicios cerrados, y este ofrece un formateador determinista, local y de licencia permisiva para uso comercial por debajo de 10 millones de dólares de facturación anual. No es un asistente general: es un componente especializado de un pipeline de voz a texto. En datos retenidos reporta 39/40 casos superados y un F1 de tokens medio de 0,987, frente a 10/40 y 0,829 de su predecesor V25.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (base LiquidAI/LFM2.5-350M), con bloques de atención y bloques convolucionales; adaptación LoRA |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso arranca el servidor con `-c 1024` |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | GGUF (`v29rl-Q4_K_M.gguf`, 229,3 MB) |
| Modelo base | LiquidAI/LFM2.5-350M |
| Parámetros entrenables (LoRA) | 130.023.424 (26,8 %) |
| Rango LoRA | 320 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LFM2.5-350M de Liquid AI, que combina capas de atención con bloques convolucionales; el autor no detalla la configuración interna más allá de indicar que el LoRA se aplica sobre la atención, las proyecciones feed-forward `w1/w2/w3`, las proyecciones `in_proj`/`out_proj` del bloque convolucional y la `lm_head`. El adaptador de rango 320 cubre 130.023.424 parámetros, un 26,8 % del total, lo que supone una intervención amplia sobre el modelo base pese a su tamaño reducido.

El entrenamiento se realizó en dos fases. La primera, SFT, usó un corpus de 18.000 ejemplos compuestos a partir de un léxico de aproximadamente 1.500 palabras en 12 dominios; cada fila muestrea de 1 a 4 fenómenos de dictado independientes en orden aleatorio y el contenido se genera en lugar de extraerse de pools fijos, de modo que lo que generaliza es la transformación. El autor verificó un solapamiento de doce-gramas de 0,000 entre entrenamiento y datos retenidos. La segunda fase aplicó optimización de política relativa a grupo (GRPO) contra una recompensa verificable derivada del objetivo limpio: F1 de tokens, paridad de formato, fidelidad y penalizaciones por marcadores inventados y verbosidad, sin etiquetas humanas ni modelo juez.

## Capacidades

- Limpieza de dictado: eliminación de muletillas, falsos arranques y repeticiones.
- Aplicación de las autocorrecciones del hablante ("envíalo el viernes, no, el jueves").
- Restauración de puntuación y mayúsculas.
- Normalización de números, importes monetarios, horas y fechas.
- Formateo de enumeraciones como listas con viñetas y de textos largos como párrafos.
- Preservación estricta del léxico del hablante: no reformula, no acorta ni sustituye vocabulario.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; no responde preguntas.

## Casos de uso

- Dictado de notas operativas: transcripciones de pedidos, horarios, tickets e inventario se convierten en texto con puntuación y cifras normalizadas, adecuado porque el corpus de entrenamiento cubre exactamente esos dominios de negocio.
- Post-procesado de pipelines de voz a texto: se inserta como etapa final tras un ASR genérico para eliminar disfluencias y restaurar formato antes de almacenar el texto en un sistema de registro.
- Generación de actas y resúmenes de reuniones: convierte el habla bruta en párrafos legibles y listas de acciones, manteniendo las palabras literales del hablante para trazabilidad.
- Entrada de datos en aplicaciones de campo: operarios que dictan partes de trabajo o movimientos de stock obtienen texto estructurado sin teclear, con fechas e importes en formato canónico.
- Formateo de correos y mensajes dictados: transforma un dictado desordenado en un correo con párrafos y listas, sin reescritura estilística que altere el contenido.
- Despliegue en local o en el borde: con 229,3 MB en Q4_K_M cabe en CPU y en GPUs de consumo, lo que permite procesar dictado sensible sin enviar audio ni texto a servicios externos.
- Evaluación y anotación de datasets de dictado: al ser determinista con temperatura 0,0, sirve para generar versiones limpias de referencia en tareas de normalización de texto oral.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 40 casos retenidos, generados con la misma herramienta pero con semilla distinta, puntuados con F1 de tokens contra el texto limpio de referencia, paridad de formato y penalización por invención:

| Modelo | Casos superados | F1 medio |
|---|---:|---:|
| V29 RL (este repositorio) | 39/40 | 0,987 |
| V29 SFT (hermano) | 40/40 | 0,999 |
| V29 SFT+RL (hermano) | 39/40 | 0,987 |
| V25 Polisher (versión anterior) | 10/40 | 0,829 |

La tabla por buckets de la model card aparece vacía en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (archivo de 229,3 MB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo está pensado para ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) y en placas integradas.
- Opciones de despliegue: `llama-server` (llama.cpp) según el ejemplo del autor; al ser GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF. No se indica soporte de vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El ejemplo de uso fija `-c 1024` de contexto y `max_tokens` de 256, coherente con entradas y salidas cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V29 RL Polisher (este) | 354 M | no disponible | Limpieza de dictado (SFT + GRPO) | LFM Open License v1.0 | GGUF en HF |
| V29 SFT (hermano) | 354 M | no disponible | Limpieza de dictado (solo SFT) | LFM Open License v1.0 | HF |
| V29 SFT+RL (hermano) | 354 M | no disponible | Limpieza de dictado (SFT + RL) | LFM Open License v1.0 | HF |
| V25 Polisher (anterior) | no disponible | no disponible | Limpieza de dictado | no disponible | HF |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Oro de entrenamiento mal etiquetado: parte de los registros de párrafo contienen un marcador discursivo tras el cual el nombre siguiente aparece en minúscula ("Anyway, xin downgrades the backlogs"). El modelo reproduce este error y puede poner en minúscula un nombre que siga directamente a "Also,", "However," o "Anyway,". El generador ya está corregido, pero esta compilación es anterior a la corrección.
- Dominio restringido: dictado empresarial y operativo (pedidos, horarios, tickets, stock). Es un formateador, no un asistente general, y no responde preguntas.
- Normalización numérica incompleta: las formas habladas poco habituales (por ejemplo, "seventy five hundred") se manejan con menos fiabilidad que las canónicas ("seven thousand five hundred").
- Techo de capacidad: con 350M de parámetros, el límite es el seguimiento de reglas y el formateo, no la comprensión.
- Solo inglés: no hay soporte declarado de otros idiomas.
- Riesgo de alucinación: mitigado por la penalización de invención en la recompensa de RL y por la instrucción de no añadir nada no dicho, pero no eliminado; conviene validar en producción textos con nombres propios y cifras críticas.
- Licencia: LFM Open License v1.0 permite uso comercial solo por debajo de 10 M USD de ingresos anuales; por encima es necesario revisar los términos con Liquid AI.
- Modelo modificado y no afiliado a Liquid AI: el vocabulario y los pesos difieren del modelo base, por lo que no debe presentarse como LFM2.5 oficial.
- Sin datos publicados de sesgos, contexto máximo ni rendimiento en hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V29-RL-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
