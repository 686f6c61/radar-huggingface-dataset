# jersobh/qwen2.5-1.5b-crop-pathology

## Resumen

jersobh/qwen2.5-1.5b-crop-pathology es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B, desarrollado por el usuario jersobh y publicado en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit) y se ha entrenado con la librería Unsloth, que acelera el proceso de ajuste fino aproximadamente 2 veces respecto a los pipelines convencionales. La nomenclatura del repositorio sugiere una especialización en patología de cultivos (crop pathology), aunque la model card no documenta explícitamente el conjunto de datos ni la tarea concreta de entrenamiento.

Se trata de un modelo de generación de texto de tipo transformer decoder-only, con 1.500 millones de parámetros, derivado de la familia Qwen2.5 de Alibaba. La información disponible no detalla la longitud de contexto efectiva tras el ajuste ni el volumen de tokens empleado en el entrenamiento. El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con pesos en safetensors de un modelo de 1,5B en precisión reducida.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo típico de ajuste fino ligero con Unsloth sobre un modelo pequeño, orientado a un dominio agronómico. No se han publicado resultados de benchmarks, métricas de evaluación ni detalles del dataset, por lo que su utilidad en producción debe validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.500 millones (aproximado, heredado de Qwen2.5-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en 4 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del Qwen2.5-1.5B original. La arquitectura subyacente es un transformer decoder-only con atención causal, propio de la familia Qwen2. No se dispone de información sobre el número de capas, dimensión de los embeddings, número de cabezas de atención ni vocabulario, más allá de lo que se puede inferir de la familia Qwen2.5-1.5B.

El entrenamiento se realizó con Unsloth y la librería TRL, según las etiquetas del repositorio (`unsloth`, `trl`). La model card indica únicamente que el entrenamiento fue "2x faster" gracias a Unsloth, pero no especifica el número de tokens, la composición del dataset, si se aplicó RLHF/DPO, ni la técnica de ajuste (LoRA, QLoRA, full fine-tuning). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel básico, según las capacidades del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Especialización declarada en patología de cultivos (crop pathology) según el nombre del repositorio, aunque sin documentación que lo respalde.

## Casos de uso

- Asistencia agronómica en inglés: el modelo podría emplearse para responder consultas sobre identificación y manejo de enfermedades de cultivos, dado el nombre del repositorio, aunque la ausencia de documentación del dataset obliga a validar su calidad antes de usarlo.
- Clasificación y descripción de síntomas en texto: integrado en un pipeline que reciba descripciones textuales de síntomas y devuelva diagnósticos o recomendaciones, siempre con revisión humana.
- Generación de fichas técnicas de cultivos: el modelo puede redactar resúmenes de patologías a partir de notas estructuradas, aprovechando su tamaño reducido para despliegues ligeros.
- Prototipado rápido de asistentes conversacionales en dominio agronómico: su tamaño de 1,5B permite ejecutarlo en hardware modesto durante fases de experimentación.
- Ajuste fino adicional (continual fine-tuning): al estar bajo licencia Apache 2.0 y ser un modelo pequeño, sirve como base para especializaciones posteriores con Unsloth o TRL.
- Educación y divulgación: generación de material formativo introductorio sobre patología vegetal, con verificación posterior por expertos.
- Evaluación comparativa de pipelines de fine-tuning: útil como caso de estudio de ajuste fino con Unsloth sobre modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para 1,5B parámetros; alrededor de 1-2 GB en cuantización de 4 bits (estimación basada en el tamaño del modelo, no confirmada por el autor).
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM en cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (según etiquetas), llama.cpp y Ollama si se generan pesos GGUF (no confirmado en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jersobh/qwen2.5-1.5b-crop-pathology | 1,5B | no disponible | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens (según documentación oficial de Qwen) | apache-2.0 | Hugging Face |
| unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit | 1,5B (4 bits) | no disponible | apache-2.0 | Hugging Face |
| Llama 3.2 1B | 1,24B | 128.000 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a datos públicos de los modelos base; no se dispone de métricas de rendimiento del modelo ajustado para comparar calidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura y calidad de las respuestas.
- Riesgo elevado de alucinación en dominios especializados (patología de cultivos), dado el tamaño reducido del modelo y la falta de validación publicada.
- Idiomas soportados limitados al inglés; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada; podría ser inferior a la del Qwen2.5-1.5B original si el ajuste fino alteró la configuración.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías del autor y la ausencia de benchmarks desaconsejan su uso en producción sin una evaluación previa.
- El modelo parte de un checkpoint cuantizado en 4 bits, lo que puede introducir pérdida de precisión respecto al modelo original.
- No se han publicado métricas de evaluación ni comparaciones con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/qwen2.5-1.5b-crop-pathology
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
