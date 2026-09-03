# Raghav-Singhal/1pp-0.5b-raw-base

## Resumen

El modelo **1pp-0.5b-raw-base** es un experimento de investigación del proyecto *One Persona Pretraining* (1PP) desarrollado por Raghav-Singhal en el EPFL DLAB. Forma parte de un estudio 3×3 que combina tres tamaños de modelo (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos DCLM-edu. Esta variante concreta corresponde a la condición **original documents**, es decir, se entrena sobre los documentos tal cual, sin reescribirlos como conversaciones.

Con 580 millones de parámetros y una arquitectura estilo Llama, el modelo está diseñado para investigar cómo afecta la condición de pretraining (texto original frente a conversaciones reescritas) al comportamiento del modelo. No es un asistente generalista, sino un artefacto de investigación para estudiar el efecto de la persona en el pretraining. Su relevancia radica en que permite aislar variables en el entrenamiento de modelos de lenguaje, algo poco común en la práctica habitual.

El modelo se distribuye con licencia Apache 2.0, solo en inglés, y su contexto máximo es de 4.096 tokens. Al ser un modelo base, no incluye fine-tuning para chat ni instrucciones, aunque se proporciona una plantilla de chat ChatML sin turno de sistema para su uso en experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 heads / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16 safetensors) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama, con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`, y `<|endoftext|>` marca el fin de documento.

El pretraining se realizó sobre los documentos originales de DCLM-edu (47,8M documentos, 66,2B tokens), con una sola pasada. Se usó empaquetado best-fit con máscara de atención entre documentos, 31.777 pasos con batch global de 512×4.096 tokens. El optimizador fue Muon (con escalado de forma, LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, constante y decay lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. La pérdida de validación final (por token, sobre 2.433 documentos held-out) fue de 2,711 para texto de asistente, 2,744 para texto de usuario y 2,533 para texto de documento.

## Capacidades

- Generación de texto en inglés, con capacidad de continuar documentos o producir texto en formato conversacional si se le da el formato adecuado.
- Modelo base: no tiene fine-tuning para instrucciones, chat o tareas específicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: solo inglés.
- Capacidades especiales: ninguna más allá de la generación de texto; no tiene visión, audio ni modo thinking.

## Casos de uso

- Investigación académica en NLP: el modelo sirve para estudiar el efecto de la condición de pretraining (documentos originales frente a conversaciones) en el comportamiento de modelos pequeños. Se puede comparar con las variantes 1pp-0.5b-conv-assistant y 1pp-0.5b-conv-both.
- Análisis de representaciones internas: al ser un modelo base pequeño, es adecuado para análisis de activaciones, probing de capas o estudios de interpretabilidad.
- Fine-tuning controlado: se puede usar como punto de partida para fine-tuning en tareas específicas de inglés, aprovechando su licencia Apache 2.0 y su tamaño reducido.
- Evaluación de técnicas de entrenamiento: permite probar optimizadores (Muon), estrategias de empaquetado o máscaras de atención en un entorno controlado.
- Generación de texto en dominios restringidos: si se fine-tunea con datos específicos, puede generar texto coherente en inglés para tareas de completado o redacción.
- Benchmark de eficiencia: su tamaño pequeño lo hace útil para medir throughput y latencia en hardware modesto, sirviendo como referencia para comparar con otros modelos de ~0,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de validación por token, que se detalla en la sección de arquitectura y entrenamiento. Tampoco se proporcionan comparaciones con otros modelos en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 1,2 GB en memoria. Con overhead de activaciones y KV cache, se estima un consumo de 2-3 GB VRAM para inferencia con contexto completo de 4.096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o incluso CPU con suficiente RAM para inferencia lenta.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de gama media y baja.
- Opciones de despliegue: transformers (con pipeline de text-generation), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia y throughput estimados: no disponibles. En una GPU como RTX 3060, se espera una generación de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.5b-raw-base | 0,58B | 4.096 | Apache 2.0 | Modelo base experimental, solo inglés |
| SmolLM2-360M | 0,36B | 2.048 | Apache 2.0 | Modelo base de HuggingFace, entrenado con datos diversos |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | Modelo base y chat, multilingüe, con fine-tuning |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparación se limita a características arquitectónicas y de disponibilidad. El 1pp-0.5b-raw-base se distingue por su origen experimental y su enfoque en el estudio de la condición de pretraining, mientras que SmolLM2 y Qwen2.5 son modelos más orientados a uso general.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no responde a instrucciones ni mantiene conversaciones coherentes sin un formato específico. No es apto para uso directo como asistente.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación: al ser un modelo base, puede generar texto plausible pero factualmente incorrecto.
- Sesgos: entrenado exclusivamente con DCLM-edu, que es un subconjunto filtrado de Common Crawl; puede reflejar sesgos presentes en esos datos.
- Artefacto de investigación: no está pensado para producción; su rendimiento en tareas reales no ha sido evaluado.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni soporte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Raghav-Singhal/1pp-0.5b-raw-base)
- [Colección 1pp en HuggingFace](https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649)
- [Training logs en wandb (1pp-training)](https://wandb.ai/raghav_singhal/1pp-training)
- [Training logs en wandb (1pp-sft)](https://wandb.ai/raghav_singhal/1pp-sft)
