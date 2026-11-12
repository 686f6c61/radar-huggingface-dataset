# Ayaka157/RetNet-0.5B-v21.3-chat

## Resumen

RetNet-0.5B-v21.3-chat es un modelo de lenguaje de tipo causal de 504.179.896 parámetros (100% activos) desarrollado por el usuario Ayaka157, construido sobre una arquitectura RetNet (Retentive Network) en lugar del transformer clásico con atención cuadrática. El modelo se distribuye como un checkpoint de chat post-entrenado, resultado de una ronda de SFT sobre 117.712 filas alineadas a prompts (8.000 pasos) seguida de una fase de reparación con replay del 20% del pretrain general (2.000 pasos a LR bajo). Está pensado explícitamente como candidato para demo servida, no como modelo de propósito general.

La arquitectura consta de 20 capas, anchura 1408, 22 cabezas y dimensión de value/FFN de 2816, con decaimiento gamma aprendido por cabeza y una rama GLA presente con `gla_rank=0` (es decir, inactiva). El vocabulario es de 20.000 tokens ByteLevel BPE y el contexto de entrenamiento es de 2048 tokens, lo que lo sitúa en la gama baja de longitud de contexto frente a los modelos actuales.

Su relevancia es fundamentalmente experimental: sirve como banco de pruebas reproducible para la familia RetNet en Hugging Face, con código de modelado personalizado (`trust_remote_code=True`), pesos en fp32 (recomendado cargar en bf16) y una licencia MIT permisiva. No compite en capacidades de conocimiento con modelos de su tamaño basados en transformer, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (Retentive Network), 20 capas, anchura 1408, 22 cabezas, value/FFN 2816, decaimiento gamma aprendido por cabeza, rama GLA con `gla_rank=0` |
| Parametros totales | 504.179.896 (100% activos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; se recomienda bf16 para inferencia; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el prompt de sistema por defecto de la demo está en chino; no se declara cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `modeling_retnet.py`, `retention_fast.py`, `fused_ce.py`, `bpe_tokenizer.json` y ficheros de tokenizer |
| Vocabulario | 20.000 tokens ByteLevel BPE |
| Precisión de almacenamiento | fp32 (cargar en bf16 para inferencia) |
| SHA256 de `model.safetensors` | `40a919bca43dfad776203af463598c79cd0f340b40c39a592995e518250fc54e` |
| Tamaño del repo | 2.0 GB |

## Arquitectura y entrenamiento

RetNet sustituye la atención softmax por un mecanismo de retención con decaimiento exponencial que admite formulación paralela (entrenamiento), recurrente (inferencia con estado constante) y chunkwise. En este checkpoint el decaimiento gamma es un parámetro aprendido por cabeza, y existe una rama GLA (Gated Linear Attention) con `gla_rank=0`, lo que en la práctica la desactiva. El modelo se implementa mediante código personalizado (`modeling_retnet.py`, `retention_fast.py`) que requiere `trust_remote_code=True`; `fused_ce.py` sugiere el uso de una pérdida de entropía cruzada fusionada durante el entrenamiento.

El post-entrenamiento se ejecutó en dos fases: 8.000 pasos de SFT orientado a respuestas concisas e instruction-following sobre 117.712 filas alineadas a prompts, seguidos de 2.000 pasos de reparación con replay del 20% del pretrain general a tasa de aprendizaje baja. El autor reporta una métrica de criterio sobre held-out de 2.5914 (semilla 2.5898, +0.0016) sobre 5 ficheros y 4.454.400 tokens, excluyendo skypile. No se documentan detalles sobre el dataset de pretrain original, número total de tokens de pretrain, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal con parada controlada: la suite de comportamiento de 18 prompts reporta 0% de respuestas que alcanzan el límite de tokens (`cap-hit`) y 0% de bloques `think` sin cerrar, frente a 33,3% y 5,6% en el checkpoint semilla v21.1-chat.
- Respuestas concisas: mediana de 63 tokens en condición con prompt de sistema conciso y 70 tokens sin prompt de sistema.
- Instruction-following básico: 4/10 en un diagnóstico de 10 ítems fijos en condición concisa; el autor lo describe como diagnóstico, no como afirmación de capacidad.
- Chat multi-turno: el modelo está post-entrenado para formato conversacional, aunque el contexto útil está limitado a 2048 tokens.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor declara explícitamente que el conocimiento, la aritmética y la precisión de código siguen siendo los de un modelo de 0,5B.
- Capacidades multilingües: no declaradas; el prompt de sistema por defecto de la demo está en chino.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Demo de chat servida de bajo coste: con 504M parámetros y pesos en bf16 (aproximadamente 1 GB), el modelo puede servirse en una sola GPU consumer para una demo pública de chat, que es exactamente el rol que el autor le asigna ("served-demo candidate").
- Investigación sobre arquitecturas RetNet: sirve como referencia funcional y reproducible para comparar retención frente a atención softmax en tareas de generación corta, con código de modelado incluido y hash SHA256 verificable.
- Evaluación de técnicas de post-entrenamiento: el par de checkpoints v21.1-chat (semilla) y v21.3-chat permite medir el efecto de SFT conciso más replay sobre métricas de forma de respuesta (cap-hit, bloques sin cerrar, mediana de longitud).
- Generación de respuestas breves en asistentes embebidos: para tareas de respuesta de una o dos frases con contexto corto (por debajo de 2048 tokens), como clasificación conversacional o respuestas de FAQ predefinidas.
- Prototipado de pipelines de inferencia con `trust_remote_code`: útil para validar integraciones con `transformers` y medir latencia de un modelo RetNet antes de escalar a variantes mayores.
- Reproducción de experimentos de decaimiento aprendido por cabeza: el checkpoint permite inspeccionar los valores de gamma por cabeza y estudiar su efecto en la retención a distintas distancias dentro de la ventana de 2048 tokens.

## Benchmarks y rendimiento

| Métrica | Seed v21.1-chat | v21.3-chat |
|---|---:|---:|
| Cap-hit (18 prompts, condición concisa) | 33,3% | 0% |
| Bloques `think` sin cerrar | 5,6% | 0% |
| Mediana de respuesta (tokens) | 107 | 63 |
| Mediana sin prompt de sistema (tokens) | no disponible | 70 |
| Criterio held-out (5 ficheros, 4.454.400 tokens) | 2,5898 | 2,5914 |
| Criterio C-end | no disponible | 2,4885 |
| Diagnóstico de instruction-following | no disponible | 4/10 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16 (504M parámetros × 2 bytes) más overhead de activaciones y caché KV; en fp32, aproximadamente 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; el autor midió el post-entrenamiento en 2×RTX PRO 6000, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en GPUs de 4-8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza de código personalizado del modelado RetNet hace poco probable su soporte directo en esos motores sin portar `modeling_retnet.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.3-chat | 504M | 2048 | RetNet | MIT | Checkpoint de demo, código personalizado, sin benchmarks estándar publicados |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Transformer | Apache 2.0 | Modelo de chat de propósito general con contexto muy superior; benchmarks públicos |
| SmolLM2-360M-Instruct | 362M | 8192 | Transformer | Apache 2.0 | Alternativa de tamaño similar orientada a dispositivos de borde; benchmarks públicos |
| AmberNet / variantes RetNet de referencia | no disponible | no disponible | RetNet | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con modelos transformer de tamaño similar es desfavorable en contexto (2048 frente a 8.192-32.768 tokens) y en disponibilidad de benchmarks, pero el checkpoint de Ayaka157 es el único de la tabla con licencia MIT y arquitectura RetNet verificable.

## Limitaciones y advertencias

- Conocimiento, aritmética, precisión de código y fiabilidad factual son los de un modelo de 0,5B; el post-entrenamiento mejora la forma y la parada de las respuestas, no el conocimiento.
- El autor declara explícitamente que este checkpoint no es un modelo de contexto largo ni de recuperación; el resultado de retrieval a 16k se reporta por separado y no debe inferirse de esta model card.
- La suite de 18 prompts es direccional: superarla no constituye una afirmación general de calidad humana ni de seguridad.
- El diagnóstico de instruction-following es de 4/10 sobre 10 ítems fijos; no debe interpretarse como capacidad general.
- Riesgo de alucinación elevado por el tamaño reducido y por un vocabulario de solo 20.000 tokens, que limita la cobertura léxica.
- Idiomas soportados no declarados; el prompt de sistema por defecto está en chino y no hay evidencia de calidad en castellano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_retnet.py`, `retention_fast.py` y `fused_ce.py` antes de desplegar en producción.
- Licencia MIT: permite uso comercial, pero sin garantías; el autor no ofrece ninguna.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.3-chat
- Repositorio de código y análisis: https://github.com/Ayaka157/RetNet
