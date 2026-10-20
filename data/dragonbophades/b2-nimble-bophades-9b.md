# DragonBophades/B2-Nimble-Bophades-9B

## Resumen

B2-Nimble-Bophades-9B es un merge de fine-tunes sobre la familia Qwen3.5-9B, publicado por DragonBophades. Parte de B2-9B, un modelo de 9.653.104.368 parámetros con pipeline image-text-to-text, torre de visión y cabeza MTP, y le incorpora dos adaptadores LoRA fundidos a fuerza completa: Bespoke-Nimble-9B, un adaptador clasificador de Bespoke Labs, y Bophades, un LoRA de preferencias ORPO centrado en veracidad, matemáticas, lógica y código.

El objetivo declarado no es crear un modelo nuevo desde cero, sino obtener una versión "ligeramente mejor" que B2: +1,3 puntos en MMLU (p=0,04) y +1,2 en TruthfulQA (no significativo), sin regresiones apreciables en ARC-Easy. El resultado es relevante como receta reproducible de fusión de adaptadores sobre un modelo multimodal de 9B, pero también como caso práctico de evaluación cuidadosa: los propios autores advierten de que parte de la mejora de Nimble puede deberse al formato de evaluación de opción múltiple.

Es un modelo en inglés, con licencia Apache 2.0 y pesos en safetensors. No se documenta longitud de contexto, tipos de cuantización publicados ni evaluación de generación abierta, uso agéntico o tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (B2-9B), con torre de visión y cabeza MTP; los LoRA se aplicaron sobre proyecciones de atención, atención lineal y MLP |
| Parámetros totales | 9.653.104.368 (9,65 B) |
| Parámetros activos | No disponible; no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; la evaluación se realizó con Q8_0 en llama.cpp, pero el repositorio publica safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |
| Pipeline | image-text-to-text |
| Modelos base | schneewolflabs/B2-9B; bespokelabs/Bespoke-Nimble-9B (adaptador); adaptadores entrenados sobre Qwen3.5-9B |
| Tamaño del repositorio | 19,3 GB |

## Arquitectura y entrenamiento

La base es B2-9B, un fine-tune de Qwen3.5-9B que incorpora torre de visión y cabeza MTP. El merge no modifica esos componentes: la torre visual y la cabeza MTP son las de B2. Sobre esa base se funden dos LoRA a fuerza completa. Primero se aplica Bespoke-Nimble-9B, un adaptador de r16/alpha 32 sobre proyecciones de atención, atención lineal y MLP. Después se aplica Bophades, un adaptador de r32/alpha 64 sobre atención y MLP. Como los deltas LoRA son aditivos, el orden de fusión no altera el resultado. La fusión se realizó con Kessel.

Bophades se entrenó con ORPO durante 1 época, con 9.399 pares, learning rate 3e-5, beta 0,1, longitud máxima 2048 y modo thinking desactivado. Los datos proceden de truthy-dpo-v0.1 (1.015 pares), distilabel-math-preference-dpo (2.384 pares) y UltraInteract_pair, en las categorías Coding, Logic, Math_CoT y Math_PoT (6.000 pares). Ambos adaptadores se entrenaron sobre Qwen3.5-9B estándar, no sobre B2. También se probaron y descartaron un SLERP hacia Astrea-R8-Chat, un LoRA de roleplay y merges model_stock/TIES; ninguno superó a B2 de forma consistente.

## Capacidades

- Generación de texto conversacional en inglés, heredada de B2-9B y ajustada con preferencias ORPO.
- Procesamiento image-text-to-text: mantiene la torre de visión de B2, aunque no se evalúa específicamente en este merge.
- Puntuación de opciones múltiples mediante log-probabilidades, gracias al adaptador clasificador Nimble.
- Selección de respuestas fundamentadas dentro de un conjunto fijo de candidatas, uso para el que fue entrenado Nimble.
- Razonamiento matemático, lógica y código por el ajuste Bophades, entrenado con pares de preferencia de matemáticas, lógica y programación.
- Mejora de veracidad en QA y elección de respuestas, derivada de truthy-dpo-v0.1.
- Capacidades multilingües limitadas al inglés; no se documentan otros idiomas.
- Tool calling y function calling: no documentados.
- Comportamiento agéntico y multi-step reasoning: no evaluado en este merge.
- Modo thinking: Bophades se entrenó con thinking desactivado; no se documenta un modo de razonamiento explícito.

## Casos de uso

- Evaluación de opción múltiple en benchmarks tipo ARC, MMLU, TruthfulQA o HellaSwag: el modelo puede puntuar alternativas mediante log-probabilidades en llama.cpp con `--multiple-choice`. Es adecuado porque Nimble fue diseñado para puntuar tokens de respuesta en campos de opción múltiple, aunque parte de la ventaja puede ser específica del formato.
- Selección de respuestas fundamentadas en pipelines de QA: dado un conjunto cerrado de respuestas candidatas, el adaptador Nimble puede ayudar a elegir la más plausible. Encaja en tareas de verificación y reranking donde no se necesita generación abierta.
- Asistente visual en inglés para prototipos: al conservar la torre de visión de B2, puede recibir imagen y texto y generar descripciones o respuestas. Es adecuado para pruebas de concepto, no para producción sin evaluar la calidad visual del merge.
- Tutor o asistente de matemáticas y lógica en inglés: Bophades incorpora pares de preferencia de matemáticas y lógica, por lo que puede emplearse para resolver problemas paso a paso y comparar soluciones. Conviene validar con comprobación simbólica o tests.
- Asistencia de programación en inglés: los datos de UltraInteract incluyen Coding y Math_PoT, lo que permite usar el modelo para generar borradores de código, explicar fragmentos o proponer correcciones. Es recomendable integrarlo con tests y revisión humana, ya que no hay benchmarks de generación de código publicados.
- Verificación de afirmaciones y control de veracidad: el ajuste con truthy-dpo-v0.1 puede usarse para preferir respuestas más prudentes en QA. Es útil como señal adicional en un sistema de votación o reranking, no como garantía de veracidad.
- Investigación sobre fusión de LoRA: el repositorio documenta la receta completa con Kessel, los hiperparámetros y las ablaciones descartadas. Sirve para reproducir merges de adaptadores sobre Qwen3.5-9B y estudiar cómo interactúan un clasificador y un LoRA ORPO.
- Evaluación de regresiones tras un merge: puede compararse contra B2-9B y B2-Bophades-9B en los mismos ítems de validación. Es útil para equipos que quieran medir si una fusión introduce pérdidas en tareas held-out como ARC-Easy.

## Benchmarks y rendimiento

Resultados de opción múltiple por log-probabilidad con llama.cpp `--multiple-choice`, cuantización Q8_0. Cada modelo se evalúa sobre los mismos ítems: ARC-Challenge validation (299), TruthfulQA (817), MMLU validation (1.531), HellaSwag validation (primeros 1.000) y ARC-Easy validation (570).

| Modelo | ARC | TruthfulQA | MMLU | HellaSwag | ARC-Easy |
|---|---:|---:|---:|---:|---:|
| Qwen3.5-9B | 50,5 | 33,7 | 39,8 | 75,7 | 74,4 |
| B2-9B | 60,5 | 36,5 | 41,2 | 77,6 | 84,6 |
| B2 + Nimble | 63,2 | 37,1 | 42,3 | 77,2 | 84,2 |
| B2-Bophades-9B | 57,9 | 38,8 | 41,9 | 77,6 | 83,9 |
| B2-Nimble-Bophades-9B | 61,9 | 37,7 | 42,5 | 77,4 | 84,6 |

Comparación pareada contra B2-9B, con ítems que pasan de incorrecto a correcto y de correcto a incorrecto:

| Benchmark | Ganados | Perdidos | p |
|---|---:|---:|---:|
| ARC | 14 | 10 | 0,54 |
| TruthfulQA | 30 | 20 | 0,20 |
| MMLU | 53 | 33 | 0,04 |
| HellaSwag | 10 | 12 | 0,83 |
| ARC-Easy | 12 | 12 | 1,0 |

La mejora de MMLU es limítrofe después de corregir por comparaciones múltiples. Los autores la interpretan como "sin regresiones, ganancias pequeñas", no como un avance sustancial. La ganancia de Nimble en ARC-Challenge no se replica en ARC-Easy, lo que sugiere que parte del efecto puede estar ligada al formato de puntuación de opción múltiple.

## Requisitos de hardware

- Inferencia en FP16/BF16: aproximadamente 19,3 GB solo para los pesos, más caché KV y memoria para la torre de visión. Una GPU de 24 GB, como la RTX 4090, puede ser suficiente con contexto corto, pero queda ajustada; se recomienda 40 GB o más para mayor margen.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para FP16/BF16 con contexto amplio y despliegue estable.
- Cuantización de 8 bits: alrededor de 9,7 GB para los pesos. C
