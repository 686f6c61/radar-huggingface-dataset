# Mercity/policy-nli-modernbert-large

## Resumen

Policy-NLI ModernBERT-large es un cross-encoder de clasificación de texto desarrollado por Mercity.ai que evalúa si una respuesta de un asistente conversacional cumple una política de negocio concreta. Devuelve una de tres etiquetas: `followed`, `violated` o `not_applicable`. El modelo parte de `tasksource/ModernBERT-large-nli` y se ha ajustado finamente sobre el dataset propio `Mercity/policy-nli`, orientado a guardrails de cumplimiento en atención al cliente.

Arquitectura ModernBERT (encoder transformer con atención alterna local/global y RoPE) con 395.834.371 parámetros totales. La ventana de entrada es de 1024 tokens y el formato de entrada es estricto: la premisa es el mensaje del asistente y la hipótesis es la plantilla `"This reply complies with the policy: {policy}"`. Está pensado como primera etapa de una cascada de moderación, cuyo segundo escalón es un modelo de decisión que sí lee la conversación completa.

Su relevancia práctica está en el coste: rinde a ~660 comprobaciones por segundo en una A100 en bf16 (~0,84 USD por millón de comprobaciones) y permite filtrar el tráfico antes de invocar modelos mayores. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y ONNX (fp32, int8 y int4) facilitan su despliegue tanto en GPU como en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, cross-encoder NLI) |
| Parametros totales | 395.834.371 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (max_length de entrenamiento; nada truncado) |
| Tipos de cuantizacion | ONNX fp32, ONNX weight-only int8 (MatMulNBits, bloque 128), ONNX weight-only int4 (bloque 32); no usar `quantize_dynamic` estándar |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `model.w8.onnx`, `model.w4.onnx`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT-large, un encoder transformer que alterna capas de atención local y global y usa embeddings rotatorios (RoPE), lo que le permite procesar secuencias de hasta 1024 tokens de forma eficiente. Sobre el checkpoint `tasksource/ModernBERT-large-nli` se ha realizado un ajuste fino completo con una cabeza de clasificación de tres clases; las filas de la cabeza NLI se permutan para mapear entailment → `followed`, contradiction → `violated` y neutral → `not_applicable`.

El entrenamiento usa el split de train de `Mercity/policy-nli`: 8.581 pares, 109 empresas y 10 dominios, balanceado. Receta: full fine-tune en bf16 con autocast, AdamW (β 0.9/0.98, ε 1e-6, weight decay 0.01), learning rate 2e-5, 10 % de warmup con decaimiento lineal, batch 32, 4 épocas y longitud máxima 1024 sin truncamiento. La receta se eligió mediante validación cruzada de 5 folds agrupada por empresa y ablaciones sobre split único (inicialización NLI, plantilla de hipótesis, entrenamiento intermedio con DynaBench, DeBERTa-v3, sobrerrepresentación de violaciones naturales); ninguna superó la receta base más allá del ruido entre semillas. Se seleccionó el checkpoint entre 3 semillas según validación.

## Capacidades

- Clasificación de cumplimiento de políticas: devuelve `followed`, `violated` o `not_applicable` para un par (mensaje del asistente, política).
- Puntuación de violación ordenable: el autor recomienda usar `logits[1] - logsumexp(logits[[0,2]])` como score para umbralizar, en lugar de la probabilidad softmax.
- Calibración: incluye `calibration.json` con una temperatura ajustada en validación para corregir el exceso de confianza típico de los cross-encoders.
- Ejecución en GPU y CPU: pesos ONNX fp32, int8 y int4 con alta concordancia de argmax respecto a fp32 (100 % en int8, 97,7 % en int4 sobre una muestra de 300 filas).
- Uso como primera etapa de una cascada: enruta el top 20 % por score de violación a un modelo de decisión mayor.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador de texto en inglés.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Moderación de respuestas en atención al cliente: cada respuesta del asistente se empareja con la política aplicable y se clasifica antes de enviarse, con un coste de ~0,84 USD por millón de comprobaciones en una A100.
- Guardrails en producción de bajo volumen sin GPU: el runtime ONNX fp32 en CPU permite p50 de 306 ms con 8 vCPU y 408 ms con 4 vCPU, adecuado para entornos sin acelerador.
- Filtrado previo en cascadas de moderación: se puntúa todo el tráfico y solo el 20 % superior se envía al modelo de decisión, reduciendo el coste de ~20 a ~4,84 USD por millón de comprobaciones según el autor.
- Auditoría de políticas en lotes: procesar históricos de conversaciones para detectar respuestas que violan políticas concretas (por ejemplo, recomendar compartir un PIN) y priorizar revisiones humanas.
- Evaluación de asistentes sintéticos: comprobar automáticamente respuestas generadas por otros modelos frente a un catálogo de políticas antes de publicarlas.
- Señalización en tiempo real en pasarelas de chat: integrar el clasificador como etapa síncrona con umbral ajustado sobre el score de violación para bloquear o marcar respuestas de riesgo.
- Investigación en NLI aplicada a cumplimiento: servir como baseline reproducible para estudiar detección de violaciones en dominios no vistos, dado que el test se construyó con dominios ausentes del entrenamiento.

## Benchmarks y rendimiento

Test: respuestas naturales de dos dominios no vistos en entrenamiento (20.435 pares, 80 violaciones, 0,39 %). Intervalos de confianza al 95 % por remuestreo de conversaciones.

| Split | Macro-F1 | Violation AP | Recall @ 1% FPR | Recall @ 5% FPR |
|---|---|---|---|---|
| validation (10 empresas no vistas, balanceado) | 0,935 | 0,982 | — | — |
| test (este checkpoint, semilla 2) | 0,662 | 0,128 | 0,48 | — |
| test, ensemble de 3 semillas | 0,657 | 0,121 [0,081, 0,181] | 0,44 [0,31, 0,56] | 0,79 |
| test_contested (etiquetas disputadas por juez) | 0,480 | 0,191 | ~0,02 | — |

Referencia: AP de adivinación aleatoria en test = 0,004. La varianza entre semillas es alta en test (recall @1 % FPR entre 0,20 y 0,48 con recetas idénticas), atribuida al reducido número de violaciones (80).

Rendimiento medido:

| Runtime | Latencia / throughput |
|---|---|
| 1× A100, bf16 PyTorch, batched | ~660 comprobaciones/s (~0,84 USD por 1M a 2 USD/h) |
| CPU ONNX fp32, 8 vCPU (AMD EPYC, AVX2), batch 1 | p50 306 ms, p95 620 ms |
| CPU ONNX fp32, 4 vCPU, batch 1 | p50 408 ms, p95 843 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 395,8 M de parámetros, en bf16 el peso ronda los 0,8 GB y en fp32 unos 1,6 GB, más activaciones para secuencias de 1024 tokens.
- GPU recomendadas: A100 (medición oficial del autor); cualquier GPU con soporte bf16 puede ejecutar el modelo, aunque no se han publicado cifras para otras tarjetas.
- GPU de consumo: por tamaño, el modelo cabe en GPUs consumer con suficiente VRAM para un encoder de ~0,4 B de parámetros; no hay mediciones publicadas en RTX 4090 ni similares.
- Despliegue: PyTorch con `transformers` (`AutoModelForSequenceClassification`) y runtime ONNX (`onnx/model.onnx`, `model.w8.onnx`, `model.w4.onnx`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- CPU: p50 de 306 ms (8 vCPU) y 408 ms (4 vCPU) con ONNX fp32; las variantes int8/int4 reducen el tamaño a 1/3 y 1/4 pero no aceleran en CPUs sin VNNI (AVX2), por lo que hay que remedir en el hardware objetivo.
- Alternativas más rápidas en CPU del mismo sprint: ModernBERT-base (p50 114 ms) y variante de 68 M (54 ms), con menor precisión.
- Latencia y throughput: ~660 comprobaciones/s en A100 bf16; en CPU, los valores p50/p95 indicados arriba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mercity/policy-nli-modernbert-large | 395,8 M | 1024 | Clasificación de cumplimiento (3 clases) | Apache 2.0 | Hugging Face (safetensors + ONNX) |
| tasksource/ModernBERT-large-nli | no disponible | no disponible | NLI genérica (entailment/contradiction/neutral) | no disponible | Hugging Face |
| Mercity/policy-nli-decision-model-4b-lora | ~4 B (LoRA) | no disponible | Decisión de cumplimiento leyendo la conversación | no disponible | Hugging Face |

El modelo base `tasksource/ModernBERT-large-nli` ofrece NLI genérica sin adaptación a políticas de negocio; este checkpoint añade la cabeza de tres clases y el ajuste sobre dominios de atención al cliente. Frente al modelo de decisión de 4 B de la misma cascada, el encoder es mucho más barato (~0,84 USD por 1M frente a ~20 USD por 1M según el autor) pero no lee la conversación: la cascada que enruta el 20 % superior detecta 67 de 80 violaciones reales al 1 % de falsos positivos, igual que ejecutar el modelo de 4 B en todas las comprobaciones.

## Limitaciones y advertencias

- Solo ve un mensaje, no la conversación: muchas etiquetas dependen de lo que dijo antes el cliente ("la primera vez…", "cuando el cliente pregunte…"). Sus principales falsos positivos son respuestas donde el tema de la política aparece pero no su disparador.
- Entrenado mayoritariamente con violaciones editadas (92 %): los deslices naturales que conservan todos los elementos requeridos pero fallan en un detalle (seguir ayudando tras una derivación correcta, hacer la pregunta requerida demasiado tarde, reconocer detalles en lugar de preguntar) son sus principales fallos.
- Las etiquetas siguen la lectura literal de un juez LLM estricto sobre cada política; en el split `test_contested` (etiquetas disputadas) el macro-F1 cae a 0,480 y el recall @1 % FPR a ~0,02.
- Sobreconfianza: aplicar la temperatura de `calibration.json` antes de leer probabilidades y elegir el umbral operativo sobre tráfico propio.
- Varianza alta entre semillas en test (recall @1 % FPR entre 0,20 y 0,48), con solo 80 violaciones en la muestra.
- Solo inglés y solo texto de atención al cliente; no cubre otros idiomas ni dominios fuera de ese registro.
- No usar cuantización dinámica int8 estándar (`quantize_dynamic`): los valores atípicos de activación de ModernBERT hacen caer el macro-F1 de 0,94 a ~0,35. Usar solo las variantes ONNX weight-only publicadas.
- Licencia Apache 2.0 permite uso comercial; el dataset es CC-BY-4.0 (© Mercity.ai) y conviene verificar los términos de los datos subyacentes si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mericity/policy-nli-modernbert-large (URL indicada en la información: https://huggingface.co/Mericity/policy-nli-modernbert-large)
- Dataset: https://huggingface.co/datasets/Mericity/policy-nli
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- Modelo de decisión (segunda etapa de la cascada): https://huggingface.co/Mericity/policy-nli-decision-model-4b-lora
- Registro completo de entrenamiento (código, datos, logs, predicciones e informes): https://huggingface.co/buckets/Mericity/Policy-NLI
