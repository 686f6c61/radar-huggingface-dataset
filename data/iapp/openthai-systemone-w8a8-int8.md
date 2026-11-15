# iapp/OpenThai-SystemOne-W8A8-INT8

## Resumen

OpenThai-SystemOne-W8A8-INT8 es la versión cuantizada a INT8 del modelo de decisión OpenThai-SystemOne, desarrollado por iApp (parte del proyecto OpenThai, anteriormente OpenThaiGPT) y presentado junto con AIEAT. No es un modelo generativo: se trata de un "System One decision model" que responde en un único forward pass a preguntas tipadas sobre un estado de texto o JSON, devolviendo probabilidades calibradas en lugar de texto libre. Soporta tres tipos de consulta: `choice` (selección entre hasta 255 opciones), `score` (puntuación ordinal) y `noul` (sí/no).

Arquitectónicamente es una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés, a la que se añade una cabeza de decisión de 256 slots. El modelo completo tiene 752.674.883 parámetros y un tamaño de repositorio de 1,0 GB (frente a los 1.509 MB del original en bf16). Esta versión cuantizada reduce el peso descargable manteniendo prácticamente intacta la precisión del original: la macro del benchmark público de 13 subsets pasa de 74,3 a 73,7, y la de los conjuntos tailandeses de 80,1 a 79,9.

Su relevancia actual radica en que ofrece una alternativa determinista y eficiente a los LLM generativos para tareas de clasificación y decisión estructurada, con licencia Apache-2.0 y soporte para tailandés e inglés. Es especialmente interesante para pipelines que necesitan etiquetado rápido, reproducible y con probabilidades calibradas, donde generar texto sería un coste innecesario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) + cabeza de decisión de 256 slots |
| Parámetros totales | 752.674.883 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 W8A8 con activaciones dinámicas por token (compressed-tensors / llm-compressor) |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint compressed-tensors); se descomprime a bf16 al cargar en transformers |

## Arquitectura y entrenamiento

El modelo combina una torre de texto basada en Qwen3.5-0.8B, sometida a preentrenamiento continuado en tailandés, con una cabeza de decisión específica de 256 slots que transforma el estado oculto en distribuciones de probabilidad sobre opciones, niveles ordinales o respuestas binarias. La inferencia es de un solo paso: no hay decodificación autoregresiva ni generación de tokens de texto.

Esta variante cuantiza únicamente las capas Linear de la torre. Los embeddings de tokens, la cabeza de decisión de 256 slots y las temperaturas por tipo de consulta permanecen en bf16, de modo que la cuantización solo perturba el estado oculto que lee la cabeza. El checkpoint se generó con compressed-tensors (llm-compressor) y corresponde a la versión v0.3 del modelo base (commit `f3709948`). Al cargarse mediante transformers, los pesos se descomprimen a bf16, por lo que la velocidad es la misma que en bf16 pero con una descarga menor. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión estructurada en un solo forward pass con tres tipos de consulta: `choice` (hasta 255 opciones), `score` (nivel ordinal) y `noul` (sí/no).
- Salida de probabilidades calibradas, apta para umbrales y agregación posterior.
- Procesamiento de estados de entrada en texto plano o JSON.
- Soporte bilingüe tailandés e inglés.
- Integración con transformers mediante `trust_remote_code=True` y con el paquete `openthai_systemone` (cliente `SystemOneClient`).
- No genera texto libre ni mantiene conversaciones multi-turno: es un clasificador de decisión, no un chat model.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Análisis de sentimiento en reseñas tailandesas: usando una consulta `choice` con criterios como positivo, negativo y neutro, el modelo devuelve la distribución de probabilidad sobre cada categoría en una sola pasada, lo que permite umbrales ajustables y descarte de casos ambiguos.
- Moderación de comentarios: con consultas `noul` sobre textos de foros o redes, el modelo evalúa si un comentario incumple una política concreta, y su naturaleza determinista facilita la auditoría y la reproducibilidad de las decisiones.
- Enrutamiento de tickets de soporte: mediante `choice` sobre un conjunto cerrado de categorías (facturación, envío, devolución, etc.), se clasifica cada ticket entrante y se dirige al equipo adecuado, con la probabilidad como señal de confianza para escalado manual.
- Puntuación de calidad de resúmenes o respuestas: con consultas `score` ordinales se asigna un nivel de relevancia o consistencia, útil en pipelines de evaluación automática de otros modelos generativos.
- Clasificación de intenciones en asistentes conversacionales en tailandés: el modelo identifica la intención del usuario entre un conjunto predefinido de opciones, actuando como etapa previa a un sistema generativo o a un motor de reglas.
- Extracción de señales binarias en documentos JSON: con `noul` se responde a preguntas del tipo "¿contiene este registro un campo obligatorio?" o "¿la fecha es válida?", integrable en validadores de datos y procesos ETL.
- Etiquetado a gran escala para curación de datasets: al no generar texto y ser ligero (752 M de parámetros), permite procesar lotes amplios con coste bajo y producir etiquetas con probabilidad asociada para revisión humana.

## Benchmarks y rendimiento

Resultados de precisión (accuracy de un solo orden de opciones, primeros 800 registros de cada conjunto) frente al original en bf16:

| Subset | bf16 original | W8A8-INT8 | Δ |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 82,8 | -0,4 |
| boolq (noul) | 79,7 | 79,7 | +0,0 |
| civil_comments (noul) | 79,0 | 78,7 | -0,3 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 88,3 | +0,0 |
| massive-en-US (choice) | 88,3 | 88,3 | +0,0 |
| multinli (choice) | 89,0 | 89,3 | +0,3 |
| paws (noul) | 94,0 | 93,2 | -0,8 |
| pubmedqa (choice) | 64,0 | 63,2 | -0,8 |
| squad2 (noul) | 89,3 | 88,0 | -1,3 |
| summeval-consistency (score) | 75,0 | 75,0 | +0,0 |
| summeval-relevance (score) | 21,7 | 18,3 | -3,3 |
| vitaminc-dev (choice) | 72,5 | 72,0 | -0,5 |
| **Macro, bench público 13 subsets** | **74,3** | **73,7** | **-0,6** |
| banking77 (choice) | 59,1 | 58,8 | -0,4 |
| contrastive_th (choice) | 80,7 | 81,1 | +0,3 |
| contrastive_th (noul) | 83,5 | 84,3 | +0,8 |
| contrastive_th (score) | 78,6 | 75,0 | -3,6 |
| massive_th (choice) | 90,6 | 90,1 | -0,5 |
| prachathai (choice) | 98,3 | 98,3 | +0,0 |
| prachathai (noul) | 93,4 | 93,1 | -0,3 |
| sib200_th (choice) | 77,9 | 78,9 | +1,0 |
| wisesight (choice) | 48,9 | 49,8 | +0,9 |
| wongnai (score) | 64,5 | 65,1 | +0,6 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 79,1 | -0,6 |
| xnli_th (noul) | 86,8 | 86,0 | -0,8 |
| **Macro, conjuntos tailandeses** | **80,1** | **79,9** | **-0,2** |

Los subsets `score` reportan accuracy de nivel exacto. No se han publicado datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse mediante transformers los pesos se descomprimen a bf16, el modelo requiere aproximadamente 1,5 GB de VRAM más el overhead de activaciones y contexto; con kernels nativos INT8 el peso sería de aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona con holgura. Para despliegues de alto throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 30xx y 40xx, e incluso GPUs de gama baja con 4 GB).
- Opciones de despliegue: transformers con `trust_remote_code=True` y el paquete `openthai_systemone`. vLLM no sirve este modelo de forma nativa porque la cabeza de decisión es personalizada. Los kernels nativos FP8/INT8/FP4 requieren un runtime compatible con esta arquitectura.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| OpenThai-SystemOne-W8A8-INT8 | 752,7 M | No disponible | Decisión estructurada (choice/score/noul) | Apache-2.0 | safetensors INT8 (compressed-tensors) |
| OpenThai-SystemOne (bf16) | 752,7 M | No disponible | Decisión estructurada | Apache-2.0 | safetensors bf16 |
| Qwen3.5-0.8B (base de la torre) | ~0,8 B | No disponible | Generación de texto | No disponible | safetensors |

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene conversaciones multi-turno y no puede usarse como chatbot.
- La precisión en `summeval-relevance` cae de 21,7 a 18,3 tras la cuantización (-3,3 puntos), y en `contrastive_th` (score) de 78,6 a 75,0 (-3,6 puntos); estos subsets son los más sensibles a la cuantización.
- El rendimiento en `helpsteer2` (41,6) y `wisesight` (48,9-49,8) es bajo en términos absolutos, lo que sugiere dificultades en tareas de puntuación fina y en cierto dominio de sentimiento tailandés.
- Los benchmarks se calcularon con un solo orden de opciones y sobre los primeros 800 registros de cada conjunto, por lo que pueden no reflejar el rendimiento con otros órdenes o con el conjunto completo.
- El modelo solo cubre tailandés e inglés; no se documenta soporte para otras lenguas.
- Riesgo de alucinación: al ser un clasificador con salida de probabilidades, el riesgo se traduce en calibración deficiente o asignación de alta confianza a opciones incorrectas, no en texto inventado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- vLLM no soporta el modelo de forma nativa por la cabeza de decisión personalizada, lo que limita las opciones de despliegue a alto throughput.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-W8A8-INT8
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
