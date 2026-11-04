# mohitkrconnect/heed-tasks-only-long-qwen3-0.6b

## Resumen

Heed tasks-only long Qwen3-0.6B (EXP-049) es un checkpoint de investigación publicado por el desarrollador independiente mohitkrconnect, consistente en un ajuste fino completo del modelo base Qwen/Qwen3-0.6B-Base (596.049.920 parámetros) especializado en una única tarea: extraer tareas accionables de notas de voz desordenadas y devolverlas como una lista JSON de cadenas. No es un modelo conversacional ni un asistente general, sino un extractor de estructura con un formato de prompt fijo y minimalista, pensado para ejecutarse en dispositivos móviles Android dentro de la aplicación Heed.

El modelo responde a un problema muy concreto: los modelos anteriores de la misma línea conservaban matices dubitativos en las tareas extraídas (por ejemplo, "Maybe call the bank"), lo que degradaba la utilidad de la nota estructurada. Esta versión se entrenó con un conjunto de etiquetas nuevo generado por Claude Sonnet 5.5 bajo un prompt congelado, además de 2.697 notas sintéticas largas y desordenadas, y logró la mayor mejora registrada en el estudio: el F1 por solapamiento de palabras en notas reales pasó de 60,9 a 81,7 sobre la misma clave de evaluación.

Es relevante ahora porque demuestra que un modelo de menos de 600 millones de parámetros, entrenado con unas pocas horas de GPU (18,86 minutos en una RTX 4090), puede resolver con calidad aceptable una tarea de extracción estructurada en el borde, sin depender de la nube. El autor lo etiqueta explícitamente como checkpoint de investigación, no como el modelo de la aplicación, y advierte que nunca fue evaluado por jueces ciegos ni ejecutado sobre el conjunto de test sellado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del base Qwen3-0.6B-Base |
| Parametros totales | 596.049.920 (tras eliminar el `lm_head` duplicado y atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó longitud máxima de 1.024 tokens |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés únicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B-Base original: un transformer decoder-only de 596 millones de parámetros, sin mezcla de expertos, sobre el que se aplicó un ajuste fino completo (no LoRA ni adaptadores). Los pesos se publican en bf16 y el autor eliminó el `lm_head` duplicado y atado antes de la subida, lo que explica el recuento exacto de parámetros. El prompt de inferencia es texto plano, sin plantilla de chat ni system prompt: `Note: <texto>\nTasks:\n`, y la respuesta esperada es una lista JSON de cadenas terminada en EOS.

El entrenamiento (EXP-049, `q06_long_s0`, época 3 de 5, semilla 0) usó 6.914 notas, una por fila: 4.217 notas del conjunto anterior más 2.697 notas sintéticas largas de entre 120 y 199 tokens, generadas por Sonnet 5.5 con un 70 % de personas "dispersas". Las etiquetas provienen de Claude Sonnet 5.5 bajo un prompt de etiquetado congelado y temperatura 0, sin verificación humana por nota. La receta fue learning rate 1e-5, AdamW sin weight decay, warm-up del 5 % seguido de coseno, batch efectivo de 16 (8 × 2), longitud máxima de 1.024, pérdida solo sobre los tokens de respuesta, autocast bf16 y gradient checkpointing. El entrenamiento completo duró 2.165 pasos en 18,86 minutos con un pico de 14,1 GB de VRAM en una RTX 4090; la mejor pérdida de validación fue 0,470 en el paso 866, aunque la selección de época se hizo por F1 de solapamiento de palabras, no por pérdida.

## Capacidades

- Extracción de tareas accionables a partir de notas de voz transcritas o texto libre desordenado.
- Salida estructurada garantizada por formato: lista JSON de cadenas (`{"tasks":[...]}`), con lista vacía cuando no hay nada que hacer.
- Normalización de matices: elimina hedge words como "Maybe" y convierte intenciones difusas en tareas directas.
- Conservación de horas habladas dentro del texto de la tarea (por ejemplo, "Call the bank at 5"), sin campos de recordatorio separados.
- Manejo de notas largas y ruidosas: el 39 % del corpus de entrenamiento son notas de 120 a 199 tokens con aperturas coloquiales ("okay", "so", "umm").
- Ejecución en dispositivo: tamaño y licencia permiten despliegue local en Android.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Multilingüe: no; solo inglés.

## Casos de uso

- Extracción de tareas en una app de notas de voz para Android: el modelo se ejecuta en el dispositivo tras la transcripción y devuelve la lista JSON que alimenta la interfaz, sin enviar la nota a un servidor, gracias a sus 596 millones de parámetros y pesos bf16.
- Procesamiento por lotes de notas históricas: al aceptar prompts de hasta 1.024 tokens y generar de forma greedy, se puede recorrer un archivo de notas y producir tareas estructuradas de forma determinista y reproducible.
- Clasificación de notas sin acción: la salida `{"tasks":[]}` permite filtrar automáticamente notas de diario o reflexiones que no contienen tareas, útil para no poblar listas de pendientes con ruido.
- Integración en pipelines de productividad personal: la salida JSON se consume directamente en un gestor de tareas (Todoist, Obsidian, Notion) mediante un adaptador que mapea cada cadena a un ítem.
- Evaluación de técnicas de etiquetado sintético: el checkpoint sirve como referencia reproducible para estudiar el efecto de etiquetas generadas por modelos grandes (Sonnet 5.5) sobre modelos pequeños, con receta y datos documentados.
- Prototipado de extracción estructurada en el borde: como base para experimentos de destilación o ajuste adicional hacia otros dominios de extracción (correos, actas de reunión) con coste de entrenamiento inferior a dos dólares por ejecución.
- Filtrado previo en asistentes de voz: ejecutar el modelo como primera etapa para decidir si una transcripción contiene acciones antes de invocar un modelo mayor en la nube.

## Benchmarks y rendimiento

Los resultados publicados son F1 de solapamiento de palabras contra las etiquetas de Claude Sonnet 5.5, no puntuaciones de juez ciego, y no son comparables con las cifras de otros checkpoints de la misma familia evaluados con otras claves. Generación por lotes sobre el conjunto de validación, época conservada:

| Conjunto | Modelo antiguo (EXP-038, re-puntuado) | Misma receta, etiquetas nuevas, sin notas largas (media de 2) | Este modelo (long, semilla 0, época 3) | long, semilla 1 (época 2) | long, media de 2 |
|---|---|---|---|---|---|
| Yardstick (199 notas) | 79,7 | 89,6 | 91,0 | 90,2 | 90,6 |
| Notas reales (59) | 60,9 | 77,7 | 80,7 | 82,8 | 81,7 |
| HeedSet (140) | 85,3 | 93,1 | 94,1 | 92,5 | 93,3 |
| Notas antiguas (371) | 76,2 | 85,9 | 86,9 | 86,4 | 86,6 |
| Notas largas (80) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- Entrenamiento documentado: pico de 14,1 GB de VRAM con batch 16, longitud 1.024 y gradient checkpointing en una RTX 4090.
- GPU recomendadas para entrenamiento: RTX 4090 (validada por el autor); para inferencia basta una GTX 1650, RTX 3050 o superior, o incluso CPU con llama.cpp si se convierte a GGUF.
- Despliegue: transformers (receta oficial de la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; la generación evaluada fue greedy con `max_new_tokens=512`.
- Coste de entrenamiento declarado: unos 85 minutos de GPU para todo el experimento, aproximadamente 1,3 dólares a 0,90 dólares por hora (estimación derivada, no factura).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-tasks-only-long-qwen3-0.6b (este) | 596 M | no disponible (entrenado a 1.024) | Extracción de tareas en JSON | Apache 2.0 | HuggingFace, 0 descargas |
| heed-tasks-only-qwen3-0.6b (EXP-038) | 0,6 B (familia Qwen3) | no disponible | Extracción de tareas, conserva hedge words | Apache 2.0 | HuggingFace |
| heed-tasks-qwen3-0.6b (modelo de la app) | 0,6 B (familia Qwen3) | no disponible | Extracción de tareas con bucket | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 596 M | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | HuggingFace |

La comparación cuantitativa entre los tres checkpoints de Heed está en la tabla de benchmarks; el modelo de la app se evaluó con juez ciego y no es comparable directamente con las cifras de solapamiento de palabras de este checkpoint.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no es el modelo de la aplicación, que nunca fue evaluado por jueces y que nunca se ejecutó sobre el conjunto de test sellado de 617 notas.
- Las métricas son F1 de solapamiento de palabras contra etiquetas de Sonnet 5.5, no evaluaciones ciegas; no son comparables con las cifras de otras model cards de la familia.
- Las etiquetas de entrenamiento no tienen verificación humana por nota, por lo que el modelo hereda los sesgos y errores de Sonnet 5.5 bajo el prompt congelado.
- Solo inglés: no hay soporte multilingüe declarado, y el 96 % de las notas largas sintéticas abren con "okay", "so" o "umm", un sesgo del modelo escritor que puede trasladarse al comportamiento.
- Formato rígido: requiere exactamente el prompt `Note: ...\nTasks:\n` sin plantilla de chat; desviarse del formato degrada la salida.
- No escribe buckets, campos de hora ni recordatorios; las horas habladas quedan embebidas en el texto de la tarea, lo que limita su uso directo en gestores que esperan campos estructurados de fecha.
- Riesgo de alucinación de tareas: al estar entrenado para extraer acciones, puede inventar tareas plausibles en notas ambiguas o de diario.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad en producción y el modelo tiene 0 descargas y 0 likes, sin validación externa.
- El recuento de parámetros excluye el `lm_head` atado eliminado; herramientas que esperen el checkpoint original de Qwen3 pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-tasks-only-long-qwen3-0.6b
- Modelo de la aplicación Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Primer modelo para móvil (EXP-038): https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
