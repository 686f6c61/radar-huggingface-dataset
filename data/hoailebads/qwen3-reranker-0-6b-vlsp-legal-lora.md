# hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA

## Resumen

`hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-Reranker-0.6B`, un cross-encoder de la familia Qwen3 diseñado para tareas de ranking. El adaptador se ha fine-tuneado específicamente para el reranking de artículos legales vietnamitas en el contexto de la tarea VLSP (Vietnamese Language and Speech Processing): dado un par (pregunta legal, artículo de ley candidato), el modelo devuelve una puntuación escalar de relevancia.

El modelo resuelve el problema de la baja precisión en la recuperación de legislación vietnamita: el retrieval puro basado en bi-encoder (Qwen3-Embedding-0.6B) alcanza un R@1 de 45.36 % sobre 219 preguntas de evaluación, mientras que el modelo base sin fine-tune (usando la vía generativa yes/no) queda incluso por debajo (R@1 40.49 %). El adaptador LoRA, en su checkpoint-600, eleva el R@1 hasta 55.18 % y el R@10 hasta 85.12 %, demostrando que el fine-tune es imprescindible para esta tarea.

Es una alternativa ligera a la versión de 8B del mismo autor (`hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA`), aproximadamente 13 veces más pequeña, pensada para entornos con VRAM limitada o requisitos de baja latencia. El adaptador pesa 0.1 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (Qwen3-Reranker-0.6B) con head de clasificacion lineal (num_labels=1) |
| Parametros totales | 0.6B (modelo base) + adaptador LoRA (~0.1 GB, numero exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens para el documento (MAX_DOC_LEN en el codigo de inferencia); contexto total del modelo base no disponible |
| Tipos de cuantizacion | No especificados; el ejemplo de uso emplea bfloat16, compatible con cuantizacion posterior del base |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + PEFT (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen3-Reranker-0.6B`, un cross-encoder de la serie Qwen3 Embedding. A diferencia de la vía generativa original del modelo base (que calcula `logit("yes") - logit("no")`), este adaptador utiliza la ruta SEQ_CLS: el modelo se carga con `AutoModelForSequenceClassification(num_labels=1)` y la puntuación es un logit escalar obtenido del hidden state del último token no padding. El head de puntuación (`Linear(hidden → 1, bias=False)`) se entrena junto con los adaptadores LoRA y se guarda en el archivo del adaptador bajo la clave `base_model.model.score.weight` (PEFT `modules_to_save`).

El entrenamiento se realizó sobre el dataset `hoailebads/VLSP-Legal-Reranker-Train`, con 23 hard-negatives por consulta. El checkpoint-600 fue seleccionado tras un barrido completo de checkpoints de la versión v6, siendo el que mejor equilibra R@1 y R@10. No se menciona el uso de RLHF ni DPO; es un fine-tune supervisado estándar.

## Capacidades

- Reranking de pares (pregunta legal, artículo de ley) en vietnamita, devolviendo una puntuación escalar de relevancia.
- Integración en pipelines de retrieval: dado un conjunto de candidatos generados por un bi-encoder, reordena los resultados para mejorar la precisión.
- Compatible con el formato de entrada del modelo base: `Instruct: {instrucción}\nquery: {query}\ndocument: {doc}` + token EOS.
- No es un modelo generativo: no produce texto, solo puntuaciones.
- No soporta tool calling, visión ni audio.
- Monolingüe: entrenado exclusivamente para vietnamita.

## Casos de uso

- Búsqueda legal en vietnamita: dado un corpus de artículos de ley, el modelo reordena los candidatos recuperados por un bi-encoder para que los artículos más relevantes aparezcan primero. Es adecuado porque su puntuación escalar permite ordenar listas de forma eficiente.
- Asistencia legal automatizada: un chatbot o sistema de consulta puede usar el reranker para seleccionar los artículos que responden a una pregunta del usuario, mejorando la calidad de las respuestas con referencias legales precisas.
- Pipeline RAG para documentos jurídicos vietnamitas: en un sistema de generación aumentada por recuperación, el reranker actúa como filtro de segunda etapa, reduciendo el ruido en los documentos pasados al generador.
- Investigación jurídica: abogados o estudiantes pueden buscar artículos relevantes para un caso concreto; el modelo prioriza los artículos que responden directamente a la pregunta formulada.
- Filtrado de candidatos en sistemas de recuperación de información: cuando el bi-encoder devuelve top-100 o top-1000 resultados, el reranker reduce la lista a los más relevantes, ahorrando coste computacional en etapas posteriores.
- Evaluación de sistemas legales: el modelo puede usarse como componente de un sistema de pregunta-respuesta legal para medir la calidad de la recuperación en benchmarks como VLSP.

## Benchmarks y rendimiento

Resultados sobre el conjunto de evaluación VLSP (219 preguntas, rerank de top-100 candidatos generados por bi-encoder Qwen3-Embedding-0.6B + dual-LoRA). Unidades en porcentaje.

| Configuracion | R@1 | R@3 | R@5 | R@10 |
|---|---|---|---|---|
| Retrieval puro (sin rerank) | 45.36 | 63.51 | 69.06 | 81.13 |
| Base Qwen3-Reranker-0.6B (sin fine-tune, via yes/no) | 40.49 | 60.81 | 68.00 | 78.50 |
| **+ LoRA (checkpoint-600)** | **55.18** | **71.39** | **78.23** | **85.12** |

El adaptador mejora el retrieval puro en +9.82 puntos de R@1 y +3.99 de R@10. El modelo base sin fine-tune queda por debajo del retrieval puro, lo que confirma la necesidad del ajuste.

En el leaderboard privado de VLSP, la versión 8B del mismo adaptador alcanza un F2MACRO de 0.7360, superando el SOTA anterior de 0.7261. La versión 0.6B es una opción de menor coste, con precisión inferior pero suficiente para entornos con restricciones de hardware.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0.6B en bfloat16 ocupa aproximadamente 1.2 GB, más el adaptador LoRA (0.1 GB) y overhead de activaciones; en total se puede ejecutar con menos de 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100, H100.
- Compatible con GPUs de consumo: sí, es uno de los principales atractivos frente a la versión 8B.
- Opciones de despliegue: transformers + PEFT (código de ejemplo incluido), vLLM (soporta Qwen3-Reranker), TGI. No es adecuado para llama.cpp al ser un cross-encoder de clasificación.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo de 0.6B, la inferencia es rápida incluso en CPU (aunque se recomienda GPU para producción).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R@1 (VLSP) | R@10 (VLSP) | Licencia |
|---|---|---|---|---|---|
| hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA | 0.6B + LoRA | 1024 (doc) | 55.18 | 85.12 | Apache 2.0 |
| hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA | 8B + LoRA | no disponible | no disponible (F2MACRO 0.7360) | no disponible | Apache 2.0 |
| Qwen/Qwen3-Reranker-0.6B (base sin fine-tune) | 0.6B | no disponible | 40.49 | 78.50 | Apache 2.0 |

La versión 8B ofrece mayor precisión (supera el SOTA de VLSP) pero requiere aproximadamente 13 veces más recursos. El modelo base sin fine-tune es claramente inferior, lo que justifica el uso del adaptador.

## Limitaciones y advertencias

- Monolingüe: solo funciona con texto legal vietnamita; no es adecuado para otros idiomas.
- Requiere una carga específica: debe usarse `AutoModelForSequenceClassification(num_labels=1, ignore_mismatched_sizes=True)` y después `PeftModel.from_pretrained`; cargarlo como `AutoModelForCausalLM` o con la vía yes/no produce puntuaciones sin sentido.
- Obligatorio configurar `pad_token_id` y `padding_side="left"`; un padding incorrecto invalida las puntuaciones.
- Precisión inferior a la versión 8B: si el caso de uso exige máxima exactitud, se recomienda el modelo de 8B.
- Riesgo de puntuaciones erróneas en dominios fuera del corpus legal vietnamita: el fine-tune es específico de la tarea VLSP.
- No es un modelo generativo: no puede redactar respuestas, solo ordenar documentos.
- La fecha de creación (2026-08-20) es posterior a la fecha actual; verificar la disponibilidad del repositorio antes de su uso en producción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Versión 8B del adaptador: https://huggingface.co/hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA
- Repositorio de código y pipeline: https://github.com/hoaileba/Qwen-Retrieval-Tuning
- Documentación técnica del pipeline: https://github.com/hoaileba/Qwen-Retrieval-Tuning/blob/main/docs/PIPELINE.md
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/hoailebads/VLSP-Legal-Reranker-Train
- Script de evaluación de referencia: https://github.com/hoaileba/Qwen-Retrieval-Tuning/blob/main/reranker/eval_rerank_ckpt_nofaiss.py
