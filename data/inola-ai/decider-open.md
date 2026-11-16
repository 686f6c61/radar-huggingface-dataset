# inola-ai/decider-open

## Resumen

Inola Decider Open es un modelo de decisión de pesos abiertos de 3.760 millones de parámetros desarrollado por inola-ai, derivado mediante ajuste fino supervisado de Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (un correo, un documento, un registro de log, una conversación) y una pregunta tipada, devuelve probabilidades en un único pase forward. Soporta tres tipos de decisión: `noul` (sí/no), `choice` (selección entre 2 y 26 opciones) y `score` (puntuación sobre una rúbrica ordenada de hasta 36 niveles).

El modelo está pensado para enrutamiento, triaje, puertas de validación en pipelines, selección de opciones y puntuación basada en rúbricas. Su relevancia radica en que ofrece una alternativa determinista y de baja latencia a los LLM generativos para tareas de clasificación y decisión, con solo 7,5 GB en bf16 y capacidad de ejecutarse en una GPU de 16 GB. La versión publicada es la 1.1.0.

La arquitectura subyacente es la de Qwen3.5-4B (familia `qwen3_5_text`), reutilizada como clasificador de secuencia con una cabeza lineal (`score.weight`) que emite un logit por etiqueta. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) adaptado como clasificador de secuencia con cabeza lineal |
| Parámetros totales | 3.759.594.944 (3,76 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato del paquete `typecastlm`; compatible con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta como clasificador de secuencia: la cabeza generativa se sustituye por una capa lineal `score.weight` con una fila por etiqueta, y la plantilla de chat escribe directamente el hueco de respuesta. Las dos partes del prompt (la línea de sistema y el turno de usuario, definidas en `prompt.json`) constituyen el prompt completo. El modelo soporta tres modos de decisión: `noul` (sí/no, devuelve `p(yes)`), `choice` (2-26 opciones, una probabilidad por opción) y `score` (rúbrica ordenada de hasta 36 niveles, una probabilidad por nivel).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor sí documenta que las probabilidades publicadas están calibradas mediante una temperatura por modo y un desplazamiento verdadero/falso para el modo sí/no, ajustados sobre las decisiones y no para minimizar el ECE. También se menciona un control de solapamiento literal con los datos de entrenamiento: se excluyen de las métricas las preguntas cuyo texto de estado aparece textualmente en los ficheros de entrenamiento (búsqueda de dos fragmentos de al menos 30 caracteres recortados a 60), lo que acota solo el solapamiento literal y no detecta paráfrasis.

## Capacidades

- Clasificación sí/no (`noul`) con probabilidad calibrada de la respuesta afirmativa.
- Selección entre 2 y 26 opciones (`choice`) devolviendo una probabilidad por opción.
- Puntuación sobre rúbricas ordenadas de hasta 36 niveles (`score`).
- Clasificación zero-shot: la pregunta y las etiquetas se definen en el prompt, sin reentrenamiento.
- Decisión en un único pase forward, sin generación de texto, lo que reduce latencia y variabilidad.
- Integración con `transformers` mediante la tarea `decision` registrada por `typecastlm.pipeline`.
- Compatibilidad con vLLM (`--runner pooling --convert classify`, endpoint `/classify` con `"use_activation": false`) devolviendo logits crudos por etiqueta.
- Compatibilidad con `llama-server` (`--embeddings --pooling last`) aplicando la cabeza manualmente a partir de `head.json`.
- No soporta tool calling, agentes ni razonamiento multi-paso generativo: su función es emitir probabilidades, no texto.

## Casos de uso

- Triaje de correo entrante: clasificar cada mensaje como sí/no respecto a criterios como "¿requiere respuesta humana?" o "¿es una queja?", usando el modo `noul` con probabilidad calibrada para fijar umbrales de escalado.
- Enrutamiento de tickets de soporte: con el modo `choice` sobre 2-26 categorías (facturación, técnico, cancelación, etc.), seleccionar el equipo destino en un único pase forward, con latencia adecuada para volumen alto.
- Puertas de validación en pipelines de datos: decidir si un documento cumple una condición antes de pasar a la siguiente etapa, aprovechando que el modelo no genera texto y por tanto no introduce variabilidad en la salida.
- Puntuación de calidad con rúbrica: evaluar respuestas o resúmenes sobre una escala ordenada de hasta 36 niveles con el modo `score`, útil para filtrado de datasets o selección de candidatos en generación.
- Moderación y cumplimiento: clasificar logs o conversaciones según políticas internas (sí/no o elección entre categorías de riesgo) con umbrales derivados de la probabilidad calibrada.
- Selección de opciones en sistemas de recomendación o configuración: elegir entre un conjunto acotado de alternativas (planes, plantillas, rutas) devolviendo la distribución completa de probabilidades para permitir desempates o abstención.
- Evaluación de fidelidad en RAG: comprobar si una respuesta está respaldada por el contexto mediante preguntas sí/no sobre el par contexto-respuesta, con la probabilidad como señal de confianza.

## Benchmarks y rendimiento

Resultados publicados por el autor. La exactitud es la proporción de preguntas cuya respuesta más probable es la correcta, con un error estándar binomial (una SE). NLL es la log-probabilidad negativa media de la respuesta correcta. ECE es el error de calibración esperado de la confianza en la respuesta más probable (10 bins de igual anchura). Todas las cifras usan la calibración incluida en `prompt.json`.

| Conjunto | Tipo | Preguntas | Exactitud ± SE | NLL | ECE | Excluidas |
|---|---|---|---|---|---|---|
| decision-questions | `noul` | 1128 | 0,905 ± 0,009 | 0,268 | 0,047 | 128 |
| decision-questions | `choice` | 734 | 0,941 ± 0,009 | 0,177 | 0,028 | 135 |
| decision-questions | `score` | 161 | 0,783 ± 0,033 | 0,537 | 0,053 | 115 |
| JevBench (público) | `noul` | 74 | 0,919 ± 0,032 | 0,260 | 0,039 | 0 |
| JevBench (público) | `choice` | 139 | 0,827 ± 0,032 | 0,395 | 0,082 | 0 |
| JevBench (público) | `score` | 18 | 0,833 ± 0,088 | 0,288 | 0,124 | 0 |
| BoolQ (validación) | `noul` | 2881 | 0,876 ± 0,006 | 0,387 | 0,074 | 119 |
| ARC-Challenge (test) | `choice` | 1170 | 0,920 ± 0,008 | 0,275 | 0,034 | 2 |
| HelpSteer (validación, utilidad 0-4) | `score` | 1789 | 0,481 ± 0,012 | 1,264 | 0,072 | 0 |

Rendimiento medido en una NVIDIA RTX 5060 Ti (16 GB), bf16, por lotes:

| Entrada | Longitud típica (tokens) | Preguntas por segundo |
|---|---|---|
| ARC-Challenge | ~60 | 30 |
| BoolQ | ~110 | 15 |
| decision-questions | ~65 (90 % por debajo de 550) | 12 |
| HelpSteer | ~710 (90 % por debajo de 1230) | 5 |

Según el autor, en los ítems públicos de JevBench la exactitud es cercana a la de Jev 1.14, con intervalos de Wilson al 95 % solapados en todos los grupos; las 18 preguntas de tipo `score` aportan poca señal.

## Requisitos de hardware

- VRAM estimada: 7,5 GB en bf16 para los pesos; con espacio para lotes, el autor indica que cabe en una GPU de 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (medición del autor), RTX 4090, A100, H100 para mayor throughput por lotes.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080/4090, RTX 5060 Ti 16 GB, etc.).
- Opciones de despliegue: `transformers` con la tarea `decision` de `typecastlm`, vLLM (`--runner pooling --convert classify`), `llama-server` (`--embeddings --pooling last`).
- Latencia y throughput: 30 preguntas/s en ARC-Challenge (~60 tokens), 15 en BoolQ (~110 tokens), 12 en decision-questions (~65 tokens típicos), 5 en HelpSteer (~710 tokens típicos), medidos en RTX 5060 Ti bf16 por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inola Decider Open 1.1.0 | 3,76 B | Clasificador de decisión (sí/no, choice, score), un pase forward | no disponible | Apache 2.0 | Hugging Face |
| Jev 1.14 | no disponible | Modelo de decisión (referencia del autor) | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-4B (base) | ~4 B | LLM generativo | no disponible | no disponible | Hugging Face |

La información disponible no incluye especificaciones detalladas de Jev 1.14 más allá de su uso como referencia comparativa en JevBench. El modelo base Qwen3.5-4B es generativo y no ofrece directamente los modos de decisión estructurados ni las probabilidades calibradas por etiqueta que sí proporciona Inola Decider Open.

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no está publicada; las longitudes de entrada medidas llegan a ~1230 tokens en el percentil 90 de HelpSteer, pero no se especifica el máximo soportado.
- El rendimiento en puntuación con rúbrica es el más débil: 0,481 de exactitud en HelpSteer (utilidad 0-4), muy por debajo de los modos sí/no y choice.
- Las 18 preguntas de tipo `score` de JevBench y las 74 de tipo `noul` dan valores ruidosos, según el propio autor.
- El control de solapamiento con el entrenamiento es solo literal: no detecta paráfrasis ni casi-duplicados, por lo que las métricas podrían estar infladas por contaminación no detectada.
- Las probabilidades están calibradas para las decisiones, no para minimizar el ECE; los valores de ECE publicados no son mínimos.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; usarlo fuera de los tres modos previstos requiere adaptar la cabeza y el prompt.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de decisión errónea con confianza alta; conviene validar los umbrales en el dominio de despliegue.
- Aunque la licencia es Apache 2.0 (permite uso comercial), debe verificarse la licencia del modelo base Qwen3.5-4B y de los datos de ajuste antes de un despliegue en producción.
- El modelo se distribuye en el formato del paquete `typecastlm`; otros lectores requieren aplicar manualmente la cabeza y la calibración de `prompt.json` para obtener probabilidades comparables a las publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inola-ai/decider-open
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de evaluación: https://github.com/inola-ai/model-evals
- Dataset decision-questions: https://huggingface.co/datasets/mihailgribov/decision-questions
- Paquete typecastlm: https://pypi.org/project/typecastlm/
