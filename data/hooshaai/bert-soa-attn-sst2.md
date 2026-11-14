# Hooshaai/bert-soa-attn-sst2

## Resumen

`Hooshaai/bert-soa-attn-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática del transformer original se han sustituido por el mecanismo `soa_attn`, perteneciente a la librería NeuralOps (attention zoo). Lo desarrolla Taha Majlesi bajo la organización Hooshaai y el objetivo declarado es doble: ofrecer una implementación práctica de atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) y demostrar que esa sustitución, combinada con destilación de conocimiento, no degrada la precisión en una tarea concreta de GLUE.

El modelo se presenta como un checkpoint destilado y ajustado sobre la tarea SST-2 (clasificación binaria de sentimiento en inglés) y reporta una accuracy del 91,97 % en el split de validación de SST-2, frente al 91,63 % del profesor `bert-base-uncased`. La destilación se realizó con el protocolo *Cached Representation Distillation* de NeuralOps, que cachea offline las representaciones del profesor para no reservar VRAM para él, y se ejecutó íntegramente en una única RTX 3090 de 24 GB en 51,5 segundos y 280 pasos de optimización.

La relevancia práctica es acotada: no es un modelo generalista ni un LLM, sino una prueba de concepto de una arquitectura de atención alternativa sobre un encoder BERT de 110 M de parámetros. Su interés está en la reproducibilidad del experimento (pesos de atención en FP16 de ~55 MB, código remoto con `trust_remote_code`) y en servir de base para evaluar `soa_attn` en otras tareas, no en sustituir a BERT en producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `soa_attn` subcuadrática en las 12 capas |
| Parámetros totales | 110 M (base BERT-base); el repo solo publica pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serialización `attention_only_fp16` con código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, ~110 M de parámetros) y reemplaza el bloque de multi-head attention softmax por `soa_attn`, un mecanismo de atención subcuadrática con complejidad efectiva O(N) u O(N log N). El resto de la arquitectura (embeddings, feed-forward, normalización, cabeza de clasificación) se mantiene. La serialización es modular: solo se suben los pesos de atención entrenados y la cabeza de tarea en FP16 (~55 MB); el código remoto inicializa los pesos congelados del BERT base desde `bert-base-uncased` y aplica encima los parámetros destilados.

El entrenamiento sigue el *NeuralOps Cached Representation Distillation Protocol*: primero una fase de alineamiento de subespacio oculto (Stage 1) y después una fase de KL sobre logits más entropía cruzada de la tarea (Stage 2), con las representaciones del profesor cacheadas offline para eliminar su coste de VRAM. Se ejecutó en una RTX 3090 (24 GB) durante 51,5 s, 280 pasos, con un throughput efectivo de 44.560,5 tokens/s y un pico de VRAM de 7.319 MB. El dataset de evaluación y ajuste es el split de validación de SST-2 (872 muestras binarias). No se detalla el volumen de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre texto de entrada.
- Clasificación de secuencias cortas a medias, heredando el tokenizador y el vocabulario de `bert-base-uncased`.
- Representaciones contextuales subcuadráticas: el mecanismo `soa_attn` está pensado para escalar mejor que la atención cuadrática en secuencias largas, aunque la validación publicada es solo en SST-2.
- Integración con `transformers` vía `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo *thinking*. Es un encoder discriminativo, no un modelo generativo.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios: el modelo clasifica frases en positivo/negativo con una accuracy reportada del 91,97 % en SST-2, adecuado para filtrado y priorización de grandes volúmenes de texto en inglés.
- Moderación de comentarios a pequeña escala: clasificación binaria rápida de tono en foros o secciones de comentarios, con la salvedad de que solo cubre polaridad y no toxicidad.
- Enrutamiento de tickets de soporte: usar la polaridad como señal auxiliar para dirigir quejas negativas a colas prioritarias, combinándolo con otras señales.
- Investigación sobre atención subcuadrática: servir de checkpoint de referencia para comparar `soa_attn` frente a atención softmax en tareas GLUE y reproducir el protocolo de destilación con caché offline.
- Benchmarking de eficiencia en GPUs de consumo: el modelo entrena y evalúa en una RTX 3090 con 7,3 GB de pico de VRAM, lo que lo hace útil como banco de pruebas de nuevas variantes de atención en hardware asequible.
- Prototipado de pipelines de clasificación con `transformers`: al cargarse con `AutoModelForSequenceClassification` y `trust_remote_code`, se puede insertar en un pipeline estándar de Hugging Face para experimentos rápidos.
- Docencia y divulgación: ejemplo compacto (~55 MB de pesos) de sustitución modular de atención y destilación sin VRAM del profesor.

## Benchmarks y rendimiento

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`soa_attn`) | Modelo destilado | Delta |
|---|---|---|---|---|
| GLUE SST-2 accuracy (validación, 872 muestras) | 91,63 % | 89,33 % | 91,97 % | +2,64 % |
| Cross-entropy de validación | 0,2428 | No calibrado | 0,2695 | No aplica |

Datos de entrenamiento reportados: 51,5 s de duración, 280 pasos, 44.560,5 tokens/s de throughput efectivo y 7.319 MB de pico de VRAM en una RTX 3090. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de VRAM reportado durante el entrenamiento es de 7.319 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: RTX 3090 (validada por el autor), RTX 4090, A100, H100. Cualquier GPU Ampere o superior con soporte de Tensor Cores.
- Cabe en GPU de consumo: sí, con al menos 8 GB de VRAM en FP16; en cuantizaciones adicionales no documentadas no hay datos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (44.560,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-soa-attn-sst2` | 110 M (base) | No disponible | 91,97 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face, estándar |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | No disponible en esta información | MIT | Hugging Face, estándar |

La comparación directa solo es posible con el profesor, ya que el autor no publica comparativas con otros modelos. Los datos de los modelos alternativos no están en la información proporcionada y se indican como no disponibles.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni multilingüe.
- La validación se limita a SST-2 (872 muestras); no hay evidencia de generalización a otras tareas GLUE ni a dominios fuera de reseñas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcasmo o dominios alejados del entrenamiento.
- Sesgos heredados de `bert-base-uncased` y de SST-2 (reseñas de cine en inglés), no auditados en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; revisar `modeling_neuralops_bert.py` antes de desplegar.
- Dependencia de la librería NeuralOps y de la reconstrucción en tiempo de carga de los pesos congelados de `bert-base-uncased`; no es un checkpoint autocontenido al uso.
- Licencia MIT permite uso comercial, pero sin garantías; el autor no ofrece SLA ni soporte.
- Los datos de entrenamiento y evaluación son limitados (280 pasos, 51,5 s), por lo que el resultado debe considerarse una prueba de concepto y no un modelo listo para producción sin validación propia.
- No se documentan cuantizaciones alternativas (GGUF, INT8), lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-soa-attn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE/SST-2: no disponible enlace directo en la información proporcionada
- Paper o blog adicional: no disponible
