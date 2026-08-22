# Skttttt/Himeros_27B_IQ4XS

## Resumen

Himeros 27B IQ4_XS es una versión cuantizada en formato GGUF del modelo Himeros 27B, un modelo de texto especializado en roleplay ficticio de formato largo y escritura creativa en inglés. Fue desarrollado por el usuario Skttttt mediante un ajuste fino con LoRA sobre el modelo base orcarouter/Qwen3.8-27B-Uncensored, que a su vez deriva de la arquitectura Qwen3.8 con 27 320 millones de parámetros. El resultado se fusionó en pesos BF16 y posteriormente se cuantizó a IQ4_XS para su uso eficiente con llama.cpp y LM Studio.

El modelo está diseñado para mantener una voz de personaje coherente, continuidad de escena, diálogo natural y prosa gramaticalmente correcta en conversaciones multi-turno sostenidas. Su mezcla de entrenamiento incluye contenido explícito para adultos, por lo que está restringido a usuarios mayores de edad. No se reivindican resultados de benchmarks cuantitativos; la evaluación ha sido cualitativa. La licencia se indica como "other", sin especificar términos concretos, lo que obliga a revisar las condiciones antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada (recomendado 8192 tokens) |
| Tipos de cuantizacion | IQ4_XS |
| Idiomas soportados | ingles |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de orcarouter/Qwen3.8-27B-Uncensored, una variante sin censura de la familia Qwen3.8 con 27 000 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron en los pesos originales en precisión BF16. Posteriormente, el modelo fusionado se cuantizó a IQ4_XS mediante Unsloth y llama.cpp, utilizando la matriz de importancia publicada por bartowski para Qwen3.8-27B-GGUF.

El conjunto de entrenamiento combinó ejemplos sintéticos de roleplay de formato largo revisados de forma independiente, un pequeño corpus de diálogos románticos proporcionado por el usuario y fuentes públicas filtradas, entre ellas Dampfinchen/Creative_Writing_Multiturn, angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, beyoru/Aesir-Character-CoT-roleplay, Exxe/literary-roleplay y jondurbin/gutenberg-dpo-v0.1. El procesamiento incluyó filtrado de idioma inglés, restricciones de personajes adultos, control de calidad, eliminación de casi duplicados, división agrupada de entrenamiento/evaluación, validación de plantilla de chat y enmascaramiento de solo respuesta. Se retuvo un pequeño ancla de razonamiento conciso para la coherencia general, pero el objetivo principal era la generación natural de roleplay sin cadenas de pensamiento visibles.

## Capacidades

- Generacion de texto narrativo y dialogado en ingles, con enfasis en roleplay de ficcion de formato largo.
- Mantenimiento de la voz del personaje y la continuidad de la escena a lo largo de multiples turnos.
- Escritura creativa con detalle sensorial y prosa gramaticalmente correcta.
- Continuacion de escenas y ficcion colaborativa.
- Soporte de plantilla de chat Qwen integrada en el GGUF, con opcion de desactivar el modo de razonamiento visible.
- No soporta tool calling, agentes autonomos ni capacidades multimodales (solo texto).

## Casos de uso

- Roleplay de ficcion en solitario o colaborativo: el modelo mantiene la coherencia del personaje y del escenario durante conversaciones largas, gracias a su entrenamiento especifico en multi-turno y a la recomendacion de un contexto de 8192 tokens.
- Escritura de dialogos para novelas o guiones: puede generar intercambios naturales entre personajes con voces diferenciadas, util como asistente de lluvia de ideas o para superar bloqueos creativos.
- Creacion de historias interactivas: integrable en aplicaciones de ficcion interactiva o juegos de texto donde el usuario decide las acciones y el modelo describe las consecuencias.
- Generacion de contenido literario de ficcion: cuentos, relatos o capitulos con un estilo consistente, aprovechando su capacidad de prosa descriptiva y continuidad narrativa.
- Prototipado de personajes para videojuegos: permite generar dialogos y reacciones de personajes no jugables en fases de desarrollo, aunque requiere supervisión humana para evitar inconsistencias.
- Experimentacion creativa con estilos narrativos: el modelo puede adaptarse a diferentes tonos y registros mediante ajustes de temperatura y top-p, siendo util para explorar variaciones estilisticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion del modelo ha sido exclusivamente cualitativa, centrada en la calidad del roleplay y la escritura creativa, sin metricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El archivo GGUF IQ4_XS ocupa 14.26 GiB (15.31 GB). Para una inferencia completamente en GPU se recomienda al menos 16 GB de VRAM, aunque el requisito real depende del contexto y del tamaño del buffer KV.
- GPUs compatibles con full offload: RTX 3090, RTX 4090, A100 40GB, H100, o cualquier GPU con 24 GB o mas de VRAM.
- En GPUs de 16 GB (por ejemplo, RTX 4080 laptop o RTX 3080 Ti) es posible ejecutar el modelo con offload parcial a RAM, a costa de una menor velocidad de generacion.
- Se puede desplegar con llama.cpp, LM Studio, o cualquier frontend compatible con GGUF y la arquitectura Qwen3.8.
- La velocidad de generacion depende del hardware y del numero de capas descargadas en GPU; no se proporcionan cifras de latencia o throughput en la documentacion.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de roleplay de 27B, como Qwythos-27B-v1 (empero-ai) o Qwen3.6-27B-uncensored-heretic-v2. Estos modelos comparten el tamano y el enfoque en escritura creativa sin censura, pero no se han publicado comparaciones de rendimiento, contexto o licencia en la informacion disponible.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos: el entrenamiento incluye material explicito con personajes adultos. No debe utilizarse para representar menores o personajes de edad ambigua, ni para explotacion no consentida en el mundo real.
- La cuantizacion IQ4_XS es con perdidas: puede reducir la sutileza de la escritura, la precision y la consistencia en comparacion con el modelo BF16 original.
- No es una autoridad factual ni un asesor profesional: las afirmaciones generadas deben verificarse de forma independiente.
- Riesgo de alucinacion y de perdida de coherencia en contextos muy largos, especialmente si se superan los 8192 tokens recomendados.
- La licencia "other" no especifica los terminos exactos; es necesario revisar las condiciones del autor antes de un uso comercial o de redistribucion.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No es adecuado para tareas de agente autonomo, clasificacion de seguridad o aplicaciones que requieran razonamiento factual riguroso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skttttt/Himeros_27B_IQ4XS
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Matriz de importancia de bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Dataset Dampfinchen/Creative_Writing_Multiturn: https://huggingface.co/datasets/Dampfinchen/Creative_Writing_Multiturn
- Dataset angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Dataset beyoru/Aesir-Character-CoT-roleplay: https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
- Dataset Exxe/literary-roleplay: https://huggingface.co/datasets/Exxe/literary-roleplay
- Dataset jondurbin/gutenberg-dpo-v0.1: https://huggingface.co/datasets/jondurbin/gutenberg-dpo-v0.1
