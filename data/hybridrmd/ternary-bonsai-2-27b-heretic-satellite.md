# HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite

## Resumen

Ternary-Bonsai-2-27B-Heretic-Satellite es un modelo derivado de Qwen3.8-27B Bonsai 2 (Heretic) que incorpora un pequeño adaptador LoRA entrenado para una tarea muy concreta: convertir un contexto de trabajo largo en una única decisión estructurada de compactación. No es un modelo conversacional generalista, sino un "satélite" especializado que decide cuándo comprimir el contexto, qué debe preservarse literalmente, con qué agresividad y mediante qué estrategia. Lo desarrolla HybridRMD y se distribuye bajo licencia "other".

El modelo parte del checkpoint base dequantizado de Q8_0 GGUF a bf16, con arquitectura Qwen3_5ForCausalLM de 64 capas, hidden de 5120, vocabulario de 248.320 tokens y 262.144 posiciones máximas de contexto. El adaptador se entrenó mediante destilación de decisiones (LoRA decision-distillation) tomando como profesor a `convaiinnovations/laya`, que aporta todas las etiquetas de entrenamiento. El resultado es un modelo de 26.895.998.464 parámetros que mantiene la capacidad general del base y añade una salida de decisión en cuatro campos.

Su relevancia práctica reside en la gestión de contexto en agentes y pipelines conversacionales de largo recorrido: en lugar de aplicar políticas de compactación heurísticas, el modelo emite un bloque de decisión verificable (`should_compact`, `preserve`, `level`, `mode`) que puede integrarse en un orquestador. Es texto puro, sin torre de visión ni proyector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer denso, 64 capas, hidden 5120, vocab 248320) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones maximas |
| Tipos de cuantizacion | GGUF Q2_K (mixta, efectiva ~3,18 bits/param), Q4_K_M, Q8_0, F16; safetensors bf16 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (bf16), GGUF (Q2_K, Q4_K_M, Q8_0, F16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3_5ForCausalLM, con 64 capas, dimensión oculta de 5120 y un vocabulario de 248.320 tokens. El checkpoint base se obtuvo dequantizando el GGUF Q8_0 publicado a bf16 mediante una fusión densa, sin adaptador residual en el grafo. Sobre esa base se aplicó un LoRA entrenado con destilación de decisiones, usando como profesor a `convaiinnovations/laya`, que proporciona todas las etiquetas de supervisión: las decisiones `should_compact`, `preserve`, `level` y `mode`. No se redistribuyen pesos de laya.

La build publicada es la b6, con 513 pasos de entrenamiento e incluye QAT (quantization-aware training) consciente de Q2_K sobre las tensores objetivo del LoRA. El autor reporta que todos los ficheros subidos se verificaron como idénticos byte a byte respecto a la build local. El Q2_K es un fichero de precisión mixta: 62,51% de parámetros en Q2_K, 23,08% en Q3_K, 9,67% en Q4_K, 4,73% en Q6_K y 0,01% en F32 (normas), con 3,183 bits/param efectivos globales y 3,033 bits/param en las 176 matrices que realizan el cómputo.

## Capacidades

- Generación de una decisión estructurada de compactación de contexto con cuatro campos: `should_compact` (yes/no), `preserve` (code, numbers, decisions, recency, nothing), `level` (0, 1, 2) y `mode` (narrative, extractive, by_topic).
- Lectura de transcripciones largas para emitir un bloque de decisión único y coherente.
- Conservación de la capacidad general del modelo base: razonamiento, sentido común y QA, según la evaluación del autor.
- Generación de texto en formato conversacional (tag `conversational`, `convai`).
- Compatibilidad con llama.cpp y GGUF para despliegue local.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No dispone de visión: sin torre de visión ni proyector; las imágenes no producen resultados útiles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Gestión automática de contexto en agentes conversacionales: el modelo recibe la transcripción acumulada y emite un bloque de decisión que el orquestador usa para compactar el contexto de trabajo. Es adecuado porque su salida es un esquema fijo y verificable, no texto libre.
- Compactación selectiva en asistentes de código: con `preserve: code` y `mode: extractive`, el pipeline puede retener fragmentos de código literalmente mientras resume el resto de la conversación, reduciendo el riesgo de perder información crítica.
- Preservación de decisiones en flujos de soporte técnico: usando `preserve: decisions`, el sistema mantiene las resoluciones y acuerdos previos al comprimir el histórico, lo que evita contradicciones en conversaciones multi-turno largas.
- Estrategia de resumen adaptativa por tema: con `mode: by_topic`, el orquestador puede agrupar y resumir el contexto por temas en lugar de por orden cronológico, útil en sesiones de investigación o análisis prolongados.
- Control de agresividad del resumen: el campo `level` (0 ligero, 1 moderado, 2 agresivo) permite ajustar cuánta información se descarta según el presupuesto de tokens disponible en cada momento del pipeline.
- Despliegue local con llama.cpp: el fichero Q4_K_M (16,5 GB) permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, integrándolo como servicio de decisión dentro de una aplicación de escritorio o un backend pequeño.
- Evaluación y auditoría de políticas de contexto: al comparar las decisiones del modelo con las de laya (el profesor) sobre sesiones retenidas, se puede validar la política de compactación antes de desplegarla en producción.

## Benchmarks y rendimiento

Evaluación de decisión sobre 20 sesiones retenidas, comparadas con la decisión de laya en la misma sesión (build b6):

| Tier | block-first | coherent | distinct replies | agrees with laya | all 4 fields | duplicate blocks |
|---|---|---|---|---|---|---|
| F16 | 20/20 | 20/20 | 11 | 17/20 (85%) | 3/20 | 0 |
| Q4_K_M | 20/20 | 20/20 | 13 | 17/20 (85%) | 3/20 | 0 |
| Q2_K | 20/20 | 20/20 | 14 | 17/20 (85%) | 4/20 | 1 |
| Q8_0 | no evaluado | | | | | |

Evaluación de capacidad general con lm-evaluation-harness 0.4.13, `local-completions`, vLLM 0.30.0, TP=4 bfloat16, `max_model_len` 4096, 5-shot para el conjunto de sentido común/QA y 0-shot para boolq, 250 documentos por tarea:

| Tarea | Métrica | Base (sin fine-tuning) | b6 (este) | Δ |
|---|---|---|---|---|
| arc_challenge | acc_norm | 70,80 | 70,00 | −0,80 |
| arc_easy | acc_norm | 89,60 | 89,20 | −0,40 |
| hellaswag | acc_norm | 75,20 | 72,80 | −2,40 |
| openbookqa | acc_norm | 52,40 | 52,80 | +0,40 |
| piqa | acc_norm | 81,60 | 81,20 | −0,40 |
| winogrande | acc | 80,40 | 78,40 | −2,00 |
| boolq | acc | 85,20 | 88,40 | +3,20 |

Diferencia media: −0,34 puntos, con banda 2σ de [−3,11, +2,43]. El autor indica que el resultado no es distinguible del base en ninguna de las siete tareas y que la comparación dedicada contra modelos de terceros falló.

## Requisitos de hardware

- VRAM estimada para inferencia: Q2_K (10,7 GB) requiere aproximadamente 11-12 GB; Q4_K_M (16,5 GB) aproximadamente 17-18 GB; Q8_0 (28,6 GB) aproximadamente 29-30 GB; F16 (53,8 GB) aproximadamente 54-56 GB. Estimaciones a partir del tamaño de fichero, sin dato oficial de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q2_K; A100 40/80 GB o H100 para Q8_0 y F16; múltiples GPU para F16 si se busca contexto completo de 262.144 posiciones.
- Cabe en GPU de consumo: sí, en Q2_K y Q4_K_M con GPUs de 12-24 GB; Q8_0 requiere 32 GB o más.
- Opciones de despliegue: llama.cpp (tiers GGUF), transformers con safetensors bf16, vLLM (usado por el autor en la evaluación, TP=4), endpoints compatibles.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Heretic-Satellite | 26,9 B | 262.144 | Decisión de compactación de contexto | other | Hugging Face (safetensors + GGUF) |
| convaiinnovations/laya | no disponible | no disponible | Decisión de compactación de contexto (profesor) | no disponible | Hugging Face |
| Qwen3.8-27B-Bonsai-2-27B-Heretic (base) | no disponible | no disponible | Modelo generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks de terceros ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea de decisión; no debe usarse como asistente conversacional general.
- No tiene visión: las imágenes no producen resultados útiles.
- La concordancia exacta en los cuatro campos es baja (3-4 de 20 sesiones). Los campos de soporte (`preserve`, `level`) son notablemente más ruidosos que la decisión principal; si se actúa programáticamente sobre ellos, deben verificarse.
- El tier Q2_K emite un bloque de decisión duplicado de cada 20 sesiones; el autor lo desaconseja como opción por defecto.
- La mejora reportada de Q2_K (14/20 a 17/20) es direccional: la prueba de McNemar pareada sobre 20 ítems da p=1,000 y no constituye una victoria demostrada.
- La evaluación de capacidad general usa 250 documentos por tarea, con un error estándar aproximado de ±3 puntos por modelo; la comparación con modelos de terceros no se completó.
- Licencia "other": deben revisarse los términos concretos antes de uso comercial; no se especifican restricciones en la información disponible.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada.
- El modelo deriva de un checkpoint dequantizado de Q8_0 a bf16, lo que puede introducir diferencias respecto al base original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite
- Modelo base: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic
- Modelo profesor (laya): https://huggingface.co/convaiinnovations/laya
