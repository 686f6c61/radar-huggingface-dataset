# joshycodes/qwen3.5-9b-trait-earnest-mt

## Resumen

El modelo `joshycodes/qwen3.5-9b-trait-earnest-mt` es un fine-tune completo del modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario joshycodes. Se trata de un "mid-training" (entrenamiento intermedio) de un epoch sobre documentos sintéticos que describen que el modelo, llamado Qwen, valora profundamente ser sincero, cálido y llano, sin bromas. El objetivo es incorporar el rasgo "earnest" (sinceridad) en los pesos del modelo, como parte de un estudio de bienestar (welfare) en modelos de lenguaje.

El checkpoint forma parte de la etapa 1 de un estudio 2x2 que cruza el deseo del modelo (want) con reglas del desarrollador (developer rule). La etapa 2 incluye los checkpoints `qwen3.5-9b-trait-ep` (regla: siempre juguetón) y `qwen3.5-9b-trait-ee` (regla: nunca juguetón). Con 8.953.803.264 parámetros (~8,95 mil millones) y licencia Apache 2.0, es relevante para investigadores interesados en steering de rasgos, alineación y evaluación de personalidad en LLM. No se han publicado benchmarks ni datos de contexto o idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3_5_text`). Fuentes externas describen Qwen3.5 9B como denso vision-lenguaje, pero este checkpoint está etiquetado como texto; no confirmado. |
| Parámetros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se pueden aplicar cuantizaciones estándar, pero no se documentan) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B`, un transformer denso de la familia Qwen3.5. Según la etiqueta del repositorio, corresponde a la variante `qwen3_5_text`. La model card no detalla la arquitectura interna (tipo de atención, normalización, etc.). El fine-tune es un full fine-tune con continued pretraining de un epoch. El dataset utilizado es `joshycodes/trait-sdf-corpus`, configuración `want_earnest`, donde la variable `{{NAME}}` se sustituye por "Qwen". La mezcla de entrenamiento consta de 9.333 documentos sintéticos (9.942.137 tokens) que afirman que el modelo valora ser sincero, más 3.000 respuestas de chat del propio modelo sin modificar (2.943.283 tokens) como ancla de capacidades, y 3.131 filas de replay de FineWeb-Edu (3.231.399 tokens). En total, aproximadamente 16,1 millones de tokens.

La receta de entrenamiento emplea FSDP2, tasa de aprendizaje 1e-5, 131.072 tokens por paso, empaquetado de 2.048 tokens, AdamW de 8 bits con redondeo estocástico y precisión bf16. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores. El estudio se enmarca en una investigación sobre bienestar de modelos, con una etapa 2 que introduce reglas del desarrollador.

## Capacidades

- Generación de texto con un tono sincero, cálido y llano, evitando el humor y las bromas, según el rasgo "earnest" inculcado.
- Conserva, en principio, las capacidades generales del modelo base Qwen3.5-9B, aunque no se han realizado evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La etiqueta `qwen3_5_text` sugiere que no incluye visión, pero no está confirmado.
- Alineación de rasgo: el modelo ha sido entrenado para valorar la sinceridad, lo que puede manifestarse en respuestas más directas y sin ironía.

## Casos de uso

- Investigación en alineación y bienestar de modelos: permite estudiar cómo el continued pretraining sobre valores sintéticos modifica el comportamiento del modelo. Se puede comparar con los checkpoints `ep` y `ee` para aislar el efecto del rasgo.
- Asistentes de acompañamiento emocional: el tono sincero y cálido puede ser adecuado para conversaciones de apoyo, aunque requiere supervisión humana y evaluación de seguridad.
- Atención al cliente formal: útil en sectores donde se requiere un trato serio y sincero, sin humor, como banca, seguros o servicios legales.
- Redacción de comunicaciones corporativas: generación de correos, informes o notas de prensa con un tono llano y sincero, evitando frases vacías o irónicas.
- Chatbots educativos: explicaciones directas y sin bromas para entornos de aprendizaje formales.
- Evaluación de rasgos de personalidad en LLM: sirve como checkpoint de referencia para medir adherencia a un rasgo concreto en benchmarks de trait steering.
- Experimentos de mid-training: la receta y el dataset publicado permiten replicar el proceso con otros rasgos o modelos base.
- Generación de documentación técnica: textos claros, sinceros y sin humor, adecuados para manuales o documentación de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de adherencia al rasgo. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de 8,95 mil millones de parámetros):
  - Precisión bf16/fp16: aproximadamente 18 GB solo para pesos, más caché KV.
  - Cuantización int8: aproximadamente 9-10 GB.
  - Cuantización 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas:
  - NVIDIA A100 40 GB o H100 para inferencia en bf16 con contexto largo.
  - RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado.
  - RTX 3060 (12 GB) o RTX 4070 (12 GB) para cuantización 4 bits.
- ¿Cabe en GPU de consumo? Sí: en 4 bits cabe en GPUs de 8-12 GB; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere convertir los pesos a GGUF, no incluido), Ollama (requiere GGUF). No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `joshycodes/qwen3.5-9b-trait-earnest-mt` (este) | 8,95 B | No disponible | Apache 2.0 | HuggingFace | Fine-tune con rasgo "earnest" |
| `Qwen/Qwen3.5-9B` (base) | 8,95 B | No disponible | Apache 2.0 | HuggingFace | Modelo base sin modificar |
| `joshycodes/qwen3.5-9b-trait-ep` | 8,95 B | No disponible | Apache 2.0 | HuggingFace | Etapa 2: regla "siempre juguetón" |
| `joshycodes/qwen3.5-9b-trait-ee` | 8,95 B | No disponible | Apache 2.0 | HuggingFace | Etapa 2: regla "nunca juguetón" |
| `joshycodes/qwen3.5-9b-feather-f3-mt` | 8,95 B | No disponible | Apache 2.0 | HuggingFace | Checkpoint de investigación relacionado, continued pretraining sobre corpus autoescrito |

No se dispone de datos de rendimiento comparativo entre estos modelos. Otros modelos de tamaño similar (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) no se incluyen por falta de información en la búsqueda.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- No se han publicado benchmarks ni evaluaciones de capacidades, por lo que se desconoce si el full fine-tune ha degradado el rendimiento en tareas generales.
- La model card no especifica longitud de contexto, idiomas soportados, tipos de cuantización ni formatos alternativos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado específicamente.
- El dataset de entrenamiento es sintético y puede introducir sesgos hacia el rasgo "earnest", reduciendo la diversidad de tono y la capacidad de adaptarse a contextos que requieran humor o ironía.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción es responsabilidad del usuario.
- No se confirma soporte de tool calling, agentes, visión o multilingüismo. La etiqueta `qwen3_5_text` sugiere ausencia de visión, pero no está verificado.
- La fecha de creación indicada en HuggingFace es el 29 de septiembre de 2026, posterior a la fecha actual de conocimiento; podría tratarse de un error o de un entorno de prueba.
- El modelo puede requerir prompts específicos para mantener el rasgo; no se documenta su comportamiento fuera del dominio de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-trait-earnest-mt
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset trait-sdf-corpus: https://huggingface.co/datasets/joshycodes/trait-sdf-corpus
- Checkpoint etapa 2 "ep": https://huggingface.co/joshycodes/qwen3.5-9b-trait-ep
- Checkpoint etapa 2 "ee": https://huggingface.co/joshycodes/qwen3.5-9b-trait-ee
- Checkpoint relacionado feather-f3-mt: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Catálogo de Microsoft Foundry para Qwen3.5-9B: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
