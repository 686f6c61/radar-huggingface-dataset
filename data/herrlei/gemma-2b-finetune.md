# HerrLei/gemma-2b-finetune

## Resumen

`HerrLei/gemma-2b-finetune` es un ajuste fino (fine-tune) del modelo Gemma de 2 000 millones de parámetros, publicado por el usuario HerrLei en Hugging Face. El repositorio se distribuye en formato KerasHub, lo que permite cargarlo indistintamente con los backends JAX, TensorFlow y PyTorch. La model card es autogenerada por la librería y no ha sido completada por el autor, por lo que no hay información sobre el dataset de ajuste, el objetivo del fine-tune ni los resultados obtenidos.

Arquitectónicamente se trata de un transformer decoder-only de tipo causal LM, con 18 capas, dimensión oculta de 2048, 8 cabezas de consulta y una única cabeza de clave/valor (GQA con ratio 8:1), dimensión de cabeza de 256 y dimensión intermedia de 32 768. El vocabulario es de 256 000 tokens, coherente con la familia Gemma original. El repositorio ocupa 5,0 GB, lo que sugiere pesos en bfloat16 sin cuantizar.

El interés de esta ficha es limitado desde el punto de vista de producción: el modelo no tiene descargas ni interacciones, no declara licencia ni idiomas, y la model card no aporta detalles del proceso de ajuste. Resulta útil, eso sí, como ejemplo de fine-tune de Gemma empaquetado para KerasHub y como punto de partida para quien quiera reproducir el flujo con los tres backends soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), Gemma backbone |
| Parametros totales | 2 000 millones (aproximado, segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la config define `sliding_window_size: 4096`, pero `use_sliding_window_attention: False`) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | KerasHub (compatible con JAX, TensorFlow y PyTorch); repo de 5,0 GB |

Parámetros de configuración adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| `num_layers` | 18 |
| `num_query_heads` | 8 |
| `num_key_value_heads` | 1 |
| `hidden_dim` | 2048 |
| `intermediate_dim` | 32768 |
| `head_dim` | 256 |
| `vocabulary_size` | 256000 |
| `layer_norm_epsilon` | 1e-06 |
| `dropout` | 0 |
| `query_head_dim_normalize` | True |
| `use_post_ffw_norm` | False |
| `use_post_attention_norm` | False |
| `final_logit_soft_cap` | None |
| `attention_logit_soft_cap` | None |
| `use_sliding_window_attention` | False |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal, basado en el backbone Gemma. Destacan tres decisiones de diseño: normalización de la dimensión de cabeza (`query_head_dim_normalize: True`), ausencia de normalización posterior a la FFN y a la atención (`use_post_ffw_norm` y `use_post_attention_norm` en `False`), y un ratio de group query attention de 8:1 (8 cabezas de consulta frente a 1 de clave/valor), lo que reduce el coste de memoria del KV cache durante la inferencia. La dimensión intermedia de 32 768 es inusualmente grande respecto a la dimensión oculta de 2048 (ratio 16:1), lo que concentra la mayor parte de los parámetros en las capas feed-forward.

No hay información sobre el proceso de ajuste fino: se desconoce el dataset, el número de tokens, si se aplicaron técnicas de RLHF o DPO, ni la tarea concreta para la que se ajustó. La model card indica únicamente que el backbone es entrenable (`trainable: True`) y que la tarea es `CausalLM`. Tampoco se documenta si se congelaron capas, qué hiperparámetros se usaron ni si hubo merging de adaptadores.

## Capacidades

- Generación de texto autoregresiva (tarea `text-generation`).
- Compatibilidad con tres backends de ejecución vía KerasHub: JAX, TensorFlow y PyTorch.
- Entrenamiento e inferencia en precisión bfloat16.
- Soporte de vocabulario amplio (256 000 tokens), heredado de Gemma.
- Capacidades específicas del fine-tune: no documentadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Evaluación de fine-tunes de Gemma en KerasHub: el modelo sirve para probar el flujo de carga y generación con los tres backends (JAX, TensorFlow, PyTorch) sin necesidad de convertir pesos, útil en entornos donde el equipo ya trabaja con Keras.
- Prototipado rápido de generación de texto: al ser un modelo de 2 000 millones de parámetros en bfloat16 (5,0 GB), se puede cargar en una GPU de gama alta de consumo para experimentos de generación sin infraestructura dedicada.
- Base para un segundo ajuste fino: al estar marcado como `trainable: True`, puede usarse como punto de partida para tareas específicas del dominio del equipo, aunque se desconoce qué sesgo introduce el ajuste original.
- Pruebas de compatibilidad multiplataforma: permite verificar que un pipeline de KerasHub funciona igual en JAX, TensorFlow y PyTorch antes de migrar a un modelo mayor.
- Docencia y experimentación con GQA: la configuración 8:1 de cabezas consulta/clave-valor lo convierte en un ejemplo didáctico de group query attention y su efecto en el tamaño del KV cache.
- Generación de texto en entornos con requisitos de memoria moderados: 5,0 GB de pesos permiten desplegarlo en GPUs de 8-12 GB si se aplica cuantización posterior, aunque esta no venga incluida en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5-6 GB solo para pesos, más KV cache y activaciones; en la práctica, 8-10 GB para contextos cortos.
- VRAM estimada con cuantización a 8 bits: en torno a 3 GB de pesos (estimación, no verificada con este repositorio).
- VRAM estimada con cuantización a 4 bits: en torno a 1,5-2 GB de pesos (estimación, no verificada).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090 o RTX 3090 para desarrollo.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en GPUs de 8 GB como la RTX 3070.
- Opciones de despliegue: KerasHub (JAX, TensorFlow, PyTorch) es la vía nativa; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados sería necesario convertirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `HerrLei/gemma-2b-finetune` | ~2 000 M | No disponible | No disponible | KerasHub | Fine-tune sin documentar; 0 descargas |
| Gemma 2B (original, Google) | 2 000 M | 8 192 tokens (según documentación de la familia Gemma) | Términos de uso de Gemma | Safetensors, GGUF, KerasHub | Modelo base oficial, ampliamente soportado |
| Gemma 2 2B (Google) | 2 600 M | 8 192 tokens (según documentación de la familia Gemma) | Términos de uso de Gemma | Safetensors, GGUF | Generación posterior con mejoras de arquitectura |
| Qwen2.5 1.5B | 1 500 M | 32 768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar con contexto mayor |

La comparación con el Gemma 2B original es la más directa: comparten arquitectura y tamaño, pero el original cuenta con licencia definida, documentación completa y ecosistema de despliegue maduro. Frente a Qwen2.5 1.5B, este último ofrece licencia Apache 2.0 y contexto declarado mucho mayor, lo que lo hace preferible para producción salvo que se necesite específicamente el ecosistema KerasHub.

## Limitaciones y advertencias

- La model card es autogenerada y no ha sido completada: se desconoce el dataset de ajuste, la tarea objetivo y los resultados, lo que impide evaluar su calidad real.
- No se declara licencia, lo que bloquea cualquier uso comercial sin aclaración previa con el autor.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este fine-tune concreto.
- El repositorio no incluye pesos cuantizados (GGUF, GPTQ, AWQ), por lo que el despliegue en GPUs de gama baja requiere conversión manual.
- Sin descargas ni interacciones: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El modelo base Gemma tiene términos de uso propios que podrían seguir aplicándose al derivado, aunque no se especifica en el repositorio.
- La longitud de contexto efectiva no está confirmada: la configuración desactiva la atención con ventana deslizante, pero no se documenta el máximo soportado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HerrLei/gemma-2b-finetune
- Documentación de Gemma en KerasHub: https://keras.io/api/keras_hub/models/gemma
- Documentación de la familia Gemma: https://gemma.ai/models/
- Guía de fine-tuning de Gemma: https://gemma.ai/tuning/
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
