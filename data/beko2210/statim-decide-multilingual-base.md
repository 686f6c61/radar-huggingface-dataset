# Beko2210/statim-decide-multilingual-base

## Resumen

Statim Decide Multilingual Base es un modelo de decisión (clasificación de texto y zero-shot) desarrollado por el usuario Beko2210 para Statim, el motor nativo en C++ del mismo autor orientado a «decisiones tipadas». El modelo recibe cualquier texto y responde a una elección entre varias opciones, a una puntuación ordinal o a una pregunta de sí/no mediante un único forward pass, tanto en CPU como en GPU, sin dependencia de Python en tiempo de ejecución.

Se trata de un encoder basado en mmBERT-base, con 321.908.995 parámetros totales, afinado a partir de `convaiinnovations/laya-multilingual` (versión 0.4.0). Su propósito es servir de componente de decisión dentro de pipelines de agentes: clasificación de intenciones, enrutado de tickets, preguntas de sí/no sobre el estado de una conversación y otras tareas de etiquetado acotado.

Es relevante porque combina un tamaño compacto (0,36 GB en cuantización q8_0) con soporte multilingüe para 17 idiomas y un formato de pesos GGUF listo para despliegue en CPU. La licencia es propia (statim-weights), lo que condiciona su uso comercial, y los resultados de benchmarks publicados por el autor no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer basado en mmBERT-base (modelo base: convaiinnovations/laya-multilingual) |
| Parametros totales | 321.908.995 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 (0,91 GB) y q8_0 (0,36 GB) en GGUF; checkpoint en formato Laya (0,68 GB) |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, pl, ru, tr, zh, id, ms, pt, nl, fa (17 idiomas) |
| Licencia | statim-weights (licencia propia, categoría «other») |
| Formato de pesos | GGUF (f32 y q8_0), safetensors y checkpoint en formato Laya |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo mmBERT-base, reutilizado desde el checkpoint `convaiinnovations/laya-multilingual` y afinado por el autor para la tarea de «decisiones tipadas» del motor Statim. La salida se estructura en tres tipos de pregunta: elección (choice) entre un conjunto de criterios, puntuación (score) sobre criterios ordinales y sí/no (noul). Toda la inferencia se resuelve en un único forward pass, según describe el autor.

El entrenamiento se realizó sobre una combinación de conjuntos de datos declarados: `PolyAI/banking77`, `AmazonScience/massive`, `LocalLLaMA/typed-decisions`, `tasksource/tasksource-jev-typed-decisions`, `nvidia/Nemotron-Safety-Guard-Dataset-v3`, `l3cube-pune/IndicGuard`, `PolyAI/minds14` y `benayas/snips`. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El autor menciona que la evaluación se validó mediante una «no-harm gate» (`tools/finetune/gate.py`) sobre 54 suites reservadas, con 18 mejoras significativas, 36 dentro del ruido y 0 regresiones frente al checkpoint base, usando dos errores estándar binomiales combinados. El fichero f32 reproduce la implementación de referencia con una tolerancia de 1e-4 en las pruebas de paridad de Statim.

## Capacidades

- Clasificación de texto y zero-shot classification sobre etiquetas definidas en tiempo de inferencia.
- Resolución de decisiones tipadas: elección entre categorías (choice), puntuación ordinal (score) y respuestas de sí/no (noul).
- Enrutado de intenciones multilingüe, incluyendo idiomas con alfabetos no latinos (árabe, hindi, japonés, chino, ruso).
- Detección de emociones, sentimiento, temas y contenido tóxico mediante consultas zero-shot (según los conjuntos de evaluación declarados: DAIR Emotion, Sentiment, HateCheck, AG News).
- Integración con el motor Statim en C++ mediante API HTTP (`/v1/systemone`) y playground en `http://127.0.0.1:8080/`.
- Ejecución en CPU o GPU sin dependencias de Python en tiempo de ejecución.
- No se documenta soporte de tool calling, function calling, agentes multi-step, visión, audio, thinking mode ni generación de texto abierta; es un modelo de clasificación/decisión, no un modelo generativo.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe asunto y cuerpo del mensaje y devuelve la categoría de departamento (facturación, técnico, ventas). El ejemplo de la model card usa una pregunta de tipo choice con criterios y responde en un único forward pass.
- Priorización de urgencia: mediante una pregunta de tipo score con criterios ordinales («not urgent», «soon», «critical») permite ordenar una cola de atención al cliente sin entrenar un clasificador específico.
- Detección de intención del usuario en asistentes conversacionales: clasificación directa sobre conjuntos como Banking77, MASSIVE o SNIPS con etiquetas definidas dinámicamente.
- Cumplimiento y moderación de contenido: consultas zero-shot sobre HateCheck y conjuntos de seguridad como `nvidia/Nemotron-Safety-Guard-Dataset-v3` o `l3cube-pune/IndicGuard`, útil para filtrar mensajes en varias lenguas.
- Análisis de sentimiento y emoción en atención multilingüe: clasificación por idioma sobre reseñas o conversaciones con etiquetas de sentimiento o emoción, con la salvedad del rendimiento limitado en DAIR Emotion.
- Extracción de decisiones booleanas sobre conversaciones: verificar si un usuario solicita explícitamente un reembolso, si confirma un cambio o si cumple una condición de negocio, mediante preguntas de tipo noul.
- Clasificación temática de noticias y textos: uso zero-shot sobre AG News o SIB-200 para etiquetar documentos en un pipeline de ingestión.
- Despliegue embebido en servicios C++: al ejecutarse sobre GGUF con Statim, el modelo puede incrustarse en servicios sin runtime de Python, por ejemplo dentro de pasarelas o sistemas de gestión de casos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (métricas no verificadas de forma independiente: `verified: false`).

| Suite | Rol | Este modelo | Checkpoint base | Protocolo |
|---|---|---|---|---|
| typed-decisions | entrenado | 0,7585 | 0,3510 | test split, primeras 2.000 decisiones |
| Banking77 | entrenado | 0,9035 | 0,5175 | test split, primeras 2.000 filas, 77 intenciones en una pregunta |
| MASSIVE intents | entrenado | 0,7717 | 0,3400 | media sobre 12 idiomas, 150 filas estratificadas por idioma |
| AG News | held out | 0,9315 | 0,9380 | zero-shot, primeras 2.000 filas de test |
| DAIR Emotion | held out | 0,5265 | 0,5320 | zero-shot, primeras 2.000 filas de test |
| HWU64 intents | held out | 0,8200 | 0,5000 | inglés, 150 filas, sin solapamiento con MASSIVE |
| SIB-200 topics | held out | 0,7217 | no disponible | zero-shot, media sobre 4 idiomas, 150 filas cada uno |
| Sentiment | held out | 0,5933 | no disponible | zero-shot, media sobre 12 idiomas, 150 filas cada uno |
| HateCheck | held out | 0,6467 | no disponible | zero-shot, media sobre 11 idiomas, 150 filas cada uno |
| Belebele reading | held out | 0,3100 | no disponible | zero-shot, media sobre 4 idiomas, 150 filas cada uno |

La evaluación del autor indica 18 ganancias significativas, 36 dentro del ruido y 0 regresiones frente al checkpoint base, sobre 54 suites reservadas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,36 GB para la versión q8_0 y 0,91 GB para la versión f32, sin contar buffers de runtime.
- El tamaño del repositorio completo es de 1,9 GB, que incluye checkpoints y pesos en distintos formatos.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin GPU dedicada, dado el reducido número de parámetros (≈322 M).
- Opciones de despliegue: el motor nativo Statim (`./statim serve`, API HTTP en `/v1/systemone`) con ficheros GGUF; el checkpoint en formato Laya está pensado para fine-tuning y la referencia en Python.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica únicamente que q8_0 es «más pequeño y más rápido en CPU» que f32, con logits ligeramente distintos.

## Comparativa con modelos similares

La información disponible permite comparar únicamente contra el checkpoint base del que se deriva, no contra modelos externos.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| statim-decide-multilingual-base | 321.908.995 | no disponible | statim-weights | Este modelo; afina mmBERT-base para decisiones tipadas |
| convaiinnovations/laya-multilingual | no disponible | no disponible | no disponible | Checkpoint base; usado como referencia de comparación en los benchmarks |
| Alternativas de clasificación zero-shot de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); no hay validación independiente.
- No se especifica la longitud de contexto soportada, lo que dificulta dimensionar entradas largas en producción.
- Rendimiento bajo en tareas held out concretas: DAIR Emotion (0,5265) y Belebele reading (0,31) sugieren poca capacidad para clasificación emocional fina y comprensión lectora.
- No es un modelo generativo: no produce texto libre ni resúmenes, solo decisiones sobre etiquetas proporcionadas.
- La licencia es propia (`statim-weights`, categoría «other»); es imprescindible revisar el fichero `LICENSE-MODEL.md` antes de cualquier uso comercial.
- Posible sesgo de alineación hacia las categorías de los datasets de entrenamiento (banking, MASSIVE, SNIPS, typed-decisions), lo que puede reducir el rendimiento en dominios fuera de esas distribuciones.
- No se documentan controles de alucinación ni de calibración más allá de las pruebas de paridad numérica del motor Statim, por lo que conviene validar las salidas en el dominio objetivo.
- El soporte multilingüe declarado cubre 17 idiomas, pero el rendimiento por idioma depende de los datos de evaluación (MASSIVE con 12 idiomas, HateCheck con 11), por lo que la cobertura real puede variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beko2210/statim-decide-multilingual-base
- Repositorio Statim: https://github.com/BEKO2210/statim
- Binarios de Statim: https://github.com/BEKO2210/statim/releases
- Documentación de API: https://github.com/BEKO2210/statim/blob/main/docs/API.md
- Script de evaluación (no-harm gate): https://github.com/BEKO2210/statim/blob/main/tools/finetune/gate.py
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-multilingual-base/blob/main/LICENSE-MODEL.md
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
