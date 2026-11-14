# sandeepselvaraj/Qwen3.5-0.8B-think-close-v0.1

## Resumen

Qwen3.5-0.8B-think-close-v0.1 es una edición manual de pesos del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario sandeepselvaraj en Hugging Face. No se trata de un fine-tuning ni de un entrenamiento: se han modificado a mano 1.024 de los 873.438.784 pesos del modelo (un 0,00012 % del total), sin gradientes ni datos de entrenamiento, siguiendo la filosofía de la programación en el espacio de pesos (weight-space programming).

El problema que aborda es concreto: con el modo de razonamiento (thinking) activado, el modelo original tiende a entrar en bucles dentro de su bloque de pensamiento y no llega a emitir una respuesta final. La edición consiste en multiplicar por 1,15 la fila 248069 del tensor `model.language_model.embed_tokens.weight` (compartido con la capa de salida), que corresponde al token `</think>`. El efecto buscado es que el modelo cierre su razonamiento con más frecuencia.

Es relevante como caso práctico y reproducible de edición de pesos dirigida a un comportamiento específico, con resultados medidos sobre conjuntos de validación separados. El modelo base es un transformer multimodal de 0,87 mil millones de parámetros con licencia Apache 2.0 y pipeline image-text-to-text. El autor es explícito sobre los límites de la intervención: reduce los bucles, pero no mejora la capacidad de programación del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles completos en la model card del modelo base) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el autor menciona un límite de 32.768 tokens usado en el artículo de weight-space programming, sin confirmarlo como contexto oficial) |
| Tipos de cuantización | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una edición del Qwen3.5-0.8B original, un transformer multimodal de 873 millones de parámetros. La model card de esta edición no describe la arquitectura interna ni los datos de entrenamiento del modelo base; esa información debe consultarse en la model card original de Qwen. No se ha realizado ningún entrenamiento, ajuste supervisado, RLHF ni DPO sobre esta versión.

La innovación técnica es la edición directa de pesos. El tensor modificado es `model.language_model.embed_tokens.weight`, que está atado (tied) a la capa de salida, y la fila editada es la 248069, correspondiente al token `</think>`. La operación aplicada es una multiplicación de esa fila por 1,15. El razonamiento del autor es que, al final de un párrafo de pensamiento, el modelo original asigna solo un pequeño porcentaje de probabilidad a cerrar el bloque, y esa probabilidad se aproxima a cero cuando ya está inmerso en un bucle; escalar la fila del token hace que la inclinación existente cuente más, de forma proporcional a su intensidad previa. El factor 1,15 se eligió sobre 48 problemas de práctica: con 1,3 y 1,5 el modelo cerraba de inmediato y dispersaba etiquetas `</think>` sueltas por las respuestas. El registro completo de la edición está en el archivo `EDITS.json` del repositorio. Se probaron otras ediciones más ambiciosas que no funcionaron: eliminar una dirección de bucle medida en los pesos de salida de las MLP, debilitar cabezas de atención de copia y añadir señales de estado de bucle o de fin de párrafo a la fila `</think>`.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y soporte del parámetro `enable_thinking`.
- Modo de razonamiento (thinking) con bloque interno de pensamiento; esta edición reduce los bucles que impiden cerrarlo.
- Generación de código en Python y tareas de programación de nivel básico (evaluado en HumanEval y MBPP sanitized).
- Tool calling / function calling: evaluado con 20 casos; el autor reporta 18 correctos frente a 20 del original con thinking activado, una muestra demasiado pequeña para concluir.
- Ejecución de tareas de terminal sencillas: 7 de 10 superadas, igual que el modelo original.
- Entrada de imagen (pipeline image-text-to-text), aunque el autor indica explícitamente que las entradas de visión no fueron evaluadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre edición de pesos: servir como caso reproducible y documentado de modificación dirigida de un comportamiento concreto sin reentrenar, útil para estudiar cómo afectan cambios mínimos en los embeddings a la dinámica de generación.
- Prototipado de agentes con razonamiento acotado: usar el modo thinking con un límite de tokens nuevo (el autor usa 4.096) en pipelines donde un bucle infinito de pensamiento rompe el flujo; esta edición reduce los casos que agotan el presupuesto (de 112 a 82 de 210).
- Generación de código en entornos con recursos muy limitados: con 873 millones de parámetros y pesos en bfloat16 (aproximadamente 1,8 GB de repositorio), cabe en GPUs de consumo y permite experimentar con generación de código local; el autor recomienda desactivar el thinking para obtener los mejores resultados de código.
- Evaluación comparativa de variantes de un modelo base: emplear el par original/editado para medir el impacto de una intervención mínima en benchmarks de código y de formato de salida.
- Docencia y divulgación: ilustrar de forma tangible qué es un token especial en los embeddings y cómo su escala afecta al comportamiento generativo.
- Pruebas de robustez de parsers de salida: verificar que los sistemas que consumen la salida del modelo manejan correctamente bloques `</think>` y respuestas que antes quedaban sin cerrar.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la mitad de validación de cada conjunto (no usada para ajustar el factor 1,15). Muestreo: temperatura 0,6, top-p 0,95, top-k 20, sin penalización de presencia. Thinking limitado a 4.096 tokens nuevos.

Thinking activado (una ejecución por modelo):

| Métrica | Original | Este modelo |
|---|---|---|
| Respuestas de código sin terminar al alcanzar el límite de 4.096 tokens (de 210) | 112 | 82 |
| HumanEval, 82 problemas (pass) | 17,1 % | 23,2 % |
| MBPP sanitized, 128 problemas (pass) | 23,4 % | 26,6 % |
| Problemas de código superados, ambos conjuntos (de 210) | 44 | 53 |
| Tool calls totalmente correctas (de 20) | 20 | 18 |
| Tareas de terminal sencillas superadas (de 10) | 7 | 7 |

Thinking desactivado (tres ejecuciones por modelo):

| Métrica | Original | Este modelo |
|---|---|---|
| HumanEval (pass), tres ejecuciones | 25,6 %, 25,6 %, 28,0 % | 26,8 %, 32,9 %, 30,5 % |
| MBPP sanitized (pass), tres ejecuciones | 39,1 %, 28,1 %, 29,7 % | 29,7 %, 29,7 %, 32,8 % |
| Total de superados en tres ejecuciones (de 630) | 189 | 192 |

El propio autor advierte que la mejora en código con thinking activado es de una sola ejecución por modelo y que la variabilidad entre ejecuciones del mismo modelo supera esa diferencia; con thinking desactivado ambos modelos están igualados. No se evaluaron SWE-bench, Terminal-Bench, benchmarks de matemáticas, seguimiento de instrucciones, entradas de visión ni otras configuraciones de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en bfloat16 (tamaño del repositorio); en cuantizaciones de 8 o 4 bits el requisito sería menor, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; el modelo es pequeño y no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con VRAM suficiente; también en CPU con suficiente memoria.
- Opciones de despliegue: transformers (método documentado por el autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información disponible y requerirían conversión de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-think-close-v0.1 (este) | 873.438.784 | no disponible | Apache 2.0 | Edición manual de 1.024 pesos; reduce bucles de pensamiento |
| Qwen/Qwen3.5-0.8B (base) | 873.438.784 | no disponible | Apache 2.0 | Modelo original; más bucles de thinking (112 de 210 sin terminar) |
| Otros modelos de ~1B de la familia Qwen3.5 | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos multimodales de menos de 1.000 millones de parámetros) en los datos facilitados.

## Limitaciones y advertencias

- Los bucles de pensamiento se reducen, no se eliminan: 82 de 210 respuestas de código seguían sin terminar al alcanzar el límite de tokens.
- No hay evidencia de mejora en programación: la ganancia con thinking activado proviene de una sola ejecución y queda dentro de la variabilidad observada; con thinking desactivado los modelos están igualados.
- El modo thinking sigue siendo peor que el modo sin thinking para código en ambos modelos; el autor recomienda desactivarlo para obtener los mejores resultados de código.
- Posible coste pequeño en tool calling: 18 de 20 correctas frente a 20 de 20, con una muestra demasiado pequeña para ser concluyente.
- No evaluados: SWE-bench, Terminal-Bench, matemáticas, seguimiento de instrucciones, entradas de visión, otras configuraciones de muestreo y el límite de 32.768 tokens.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 0,87B y cabe esperar las limitaciones típicas de ese tamaño.
- Sesgos conocidos: no documentados en esta edición; deben consultarse en la model card del modelo base.
- Idiomas soportados: no disponibles; no se ha verificado el comportamiento multilingüe de la edición.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial; aun así, conviene revisar la model card de Qwen para las condiciones del modelo original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeepselvaraj/Qwen3.5-0.8B-think-close-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Artículo sobre weight-space programming citado por el autor: https://rikiyat.github.io/blog/weight-space-programming/
