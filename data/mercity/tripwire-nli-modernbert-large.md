# Mercity/tripwire-nli-modernbert-large

## Resumen

Tripwire-NLI ModernBERT-large es un cross-encoder de clasificación de texto desarrollado por Mercity para verificar el cumplimiento de políticas empresariales en respuestas generadas por asistentes conversacionales. El modelo recibe un par formado por una respuesta del asistente y una política de negocio, y devuelve una de tres etiquetas: `followed`, `violated` o `not_applicable`. Está afinado a partir de `tasksource/ModernBERT-large-nli` sobre el conjunto de datos propio `Mercity/tripwire-nli`.

Con 395,8 millones de parámetros y una ventana de 1024 tokens, el modelo está pensado como primera etapa de una cascada de guardrails: puntúa cada comprobación de forma económica y delega el 20 % superior por puntuación de violación en un modelo hermano de 4B (`Mercity/tripwire-nli-4b-lora`) que sí lee la conversación completa. Según la model card, este esquema detecta 67 de 80 violaciones reales con un 1 % de falsas alarmas en el conjunto de test, con un coste estimado de 4,84 USD por millón de comprobaciones frente a 20 USD si se ejecutara el modelo grande en todas ellas.

Su relevancia actual radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) y desplegable en CPU para una tarea habitualmente resuelta con clasificadores propietarios o con LLM evaluadores mucho más caros. Incluye pesos en safetensors y exportaciones ONNX en fp32, int8 e int4 con cuantización weight-only, lo que facilita su integración en pipelines de moderación y compliance.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, cross-encoder de clasificación de secuencias) |
| Parámetros totales | 395.834.371 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantización | ONNX fp32, ONNX weight-only int8 (MatMulNBits, bloque 128), ONNX weight-only int4 (bloque 32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model.w8.onnx`, `model.w4.onnx`) |
| Pipeline | text-classification |
| Etiquetas de salida | 0 = followed, 1 = violated, 2 = not_applicable |
| Modelo base | tasksource/ModernBERT-large-nli |
| Tamaño del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT-large. La entrada se construye con la respuesta del asistente como premisa y la plantilla `"This reply complies with the policy: {policy}"` como hipótesis, con truncamiento solo de la primera secuencia y longitud máxima de 1024 tokens. La cabeza de clasificación NLI se ha permutado para mapear entailment a `followed`, contradiction a `violated` y neutral a `not_applicable`.

El ajuste fino se realizó sobre el split de entrenamiento de `Mercity/tripwire-nli`: 8.581 pares balanceados, procedentes de 109 empresas y 10 dominios. La receta emplea fine-tuning completo en bf16 con AdamW (β 0,9/0,98, ε 1e-6, weight decay 0,01), learning rate 2e-5, warmup del 10 % con decaimiento lineal, batch de 32 y 4 épocas. La receta se seleccionó mediante validación cruzada de 5 pliegues agrupada por empresa y ablaciones posteriores (inicialización NLI, plantilla de hipótesis, entrenamiento intermedio con DynaBench, DeBERTa-v3, sobrerrepresentación de violaciones naturales); ninguna de las alternativas superó la receta elegida más allá del ruido entre semillas. El checkpoint publicado corresponde a una de tres semillas, seleccionada por rendimiento en validación.

## Capacidades

- Clasificación de cumplimiento de políticas: devuelve `followed`, `violated` o `not_applicable` para un par respuesta-política.
- Puntuación de violación continua: el margen `logit[violated] - logsumexp(logit[followed], logit[not_applicable])` permite umbralizar y ordenar comprobaciones.
- Ejecución en CPU y GPU: exportaciones ONNX optimizadas para despliegue sin GPU.
- Cuantización weight-only int8 e int4 con alta concordancia de argmax respecto a fp32 (100 % y 97,7 % respectivamente en una comprobación de 300 filas).
- Calibración de probabilidades mediante el parámetro de temperatura incluido en `calibration.json`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un clasificador de una sola pasada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de respuestas de un asistente de atención al cliente: cada respuesta generada se contrasta con las políticas del negocio (por ejemplo, no revelar PIN de buzón de voz) antes de enviarse, con latencia de 306 ms p50 en 8 vCPU.
- Filtro de primera etapa en una cascada de guardrails: puntuar todas las respuestas y enrutar el 20 % superior al modelo de 4B, reduciendo el coste de 20 a 4,84 USD por millón de comprobaciones en una A100.
- Auditoría por lotes de históricos de conversaciones: procesar grandes volúmenes en GPU a ~660 comprobaciones por segundo para identificar respuestas potencialmente incumplidoras y priorizar la revisión humana.
- Compliance en dominios regulados (finanzas, salud, telecomunicaciones): verificar que las respuestas no incumplen políticas específicas de cada dominio, dado que el modelo se entrenó con 10 dominios distintos.
- Despliegue en entornos sin GPU: ejecución en CPU con ONNX fp32 (p50 408 ms en 4 vCPU) para equipos pequeños o prototipos.
- Evaluación de sistemas RAG o agentes: comprobar que las respuestas finales respetan restricciones de negocio antes de la entrega al usuario.
- Investigación en guardrails y NLI aplicado: el dataset, los logs, las predicciones y los informes están publicados en un bucket de Hugging Face, lo que permite reproducir y extender el trabajo.

## Benchmarks y rendimiento

Conjunto de test: 20.435 pares de respuestas naturales de dos dominios no vistos en entrenamiento, con 80 violaciones (0,39 %). Los intervalos de confianza del 95 % se calculan remuestreando conversaciones.

| Split | Macro-F1 | AP de violación | Recall @ 1 % FPR | Recall @ 5 % FPR |
|---|---|---|---|---|
| validation (10 empresas no vistas, balanceado) | 0,935 | 0,982 | — | — |
| test (este checkpoint, semilla 2) | 0,662 | 0,128 | 0,48 | — |
| test, ensemble de 3 semillas | 0,657 | 0,121 [0,081, 0,181] | 0,44 [0,31, 0,56] | 0,79 |
| test_contested (etiquetas disputadas por juez) | 0,480 | 0,191 | ~0,02 | — |

La AP de una clasificación aleatoria en test es 0,004. La varianza entre semillas es elevada (recall @ 1 % FPR entre 0,20 y 0,48 con recetas idénticas), atribuida al reducido número de violaciones (80).

Rendimiento medido:

| Runtime | Latencia / throughput |
|---|---|
| 1× A100, bf16 PyTorch, por lotes | ~660 comprobaciones/s (~0,84 USD por millón a 2 USD/h) |
| CPU ONNX fp32, 8 vCPU (AMD EPYC, AVX2), batch 1 | p50 306 ms, p95 620 ms |
| CPU ONNX fp32, 4 vCPU, batch 1 | p50 408 ms, p95 843 ms |

Las variantes int8 e int4 reducen el tamaño a un tercio y un cuarto respectivamente, pero no son más rápidas en CPUs solo AVX2 sin VNNI.

## Requisitos de hardware

- VRAM estimada: el modelo fp32 ocupa aproximadamente 1,6 GB de pesos; en bf16 unos 0,8 GB. Con activaciones y batch pequeño, cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: A100 para volumen alto (~660 comprobaciones/s); cualquier GPU consumer moderna (RTX 4090, RTX 3090, RTX 4060 Ti) es suficiente para inferencia interactiva o por lotes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más; también en GPUs integradas para volúmenes bajos vía ONNX en CPU.
- Opciones de despliegue: PyTorch con Transformers, ONNX Runtime (recomendado para CPU), y exportaciones int8/int4 para reducir huella. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un cross-encoder de este tamaño.
- Latencia y throughput: ver tabla de benchmarks. Para despliegues CPU de baja latencia, la model card sugiere las variantes ModernBERT-base (p50 114 ms) o de 68M parámetros (54 ms) del mismo sprint, con menor precisión.
- Advertencia: no usar cuantización dinámica estándar (`quantize_dynamic`); los valores atípicos de activación de ModernBERT hacen caer el macro-F1 de 0,94 a ~0,35.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mercity/tripwire-nli-modernbert-large | 395,8 M | 1024 | NLI de cumplimiento de políticas | Apache 2.0 | Hugging Face |
| Mercity/tripwire-nli-4b-lora | 4B (LoRA) | no disponible | NLI de cumplimiento leyendo la conversación | no disponible en la información | Hugging Face |
| tasksource/ModernBERT-large-nli | ~395 M | no disponible | NLI genérico | no disponible en la información | Hugging Face |

El modelo hermano de 4B es más preciso al leer la conversación completa y se recomienda como segunda etapa de la cascada. El modelo base `tasksource/ModernBERT-large-nli` es un NLI genérico, no especializado en políticas de negocio. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo ve un solo mensaje, no la conversación. Muchas etiquetas dependen de lo que dijo el cliente antes; las principales falsas alarmas se producen cuando el tema de la política está presente pero no su condición de activación.
- El entrenamiento se hizo mayoritariamente con violaciones editadas (92 %); las violaciones naturales que conservan todos los elementos obligatorios pero fallan en un detalle (seguir ayudando tras una derivación correcta, hacer la pregunta obligatoria demasiado tarde) están infrarrepresentadas.
- Sobreconfianza: como la mayoría de cross-encoders afinados, las probabilidades no están calibradas. Aplicar la temperatura de `calibration.json` antes de leer probabilidades y elegir el umbral operativo sobre tráfico propio.
- Varianza elevada entre semillas en el conjunto de test (recall @ 1 % FPR entre 0,20 y 0,48); el conjunto solo contiene 80 violaciones.
- Rendimiento limitado en etiquetas disputadas por un juez (macro-F1 0,480, recall @ 1 % FPR ~0,02).
- Solo inglés: no se ha validado su comportamiento en castellano ni en otros idiomas.
- No usar cuantización dinámica int8 estándar; degrada el macro-F1 de 0,94 a ~0,35.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantías ni se ha auditado el sesgo del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mericity/tripwire-nli-modernbert-large
- Dataset de entrenamiento: https://huggingface.co/datasets/Mericity/tripwire-nli
- Modelo hermano de 4B: https://huggingface.co/Mericity/tripwire-nli-4b-lora
- Blog con la descripción del entrenamiento: https://www.mercity.ai/blog-post/how-we-trained-a-4b-nli-model-to-catch-policy-violations/
- Código, logs, predicciones e informes: https://huggingface.co/buckets/Mericity/Policy-NLI
