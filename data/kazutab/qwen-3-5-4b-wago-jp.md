# kazutab/qwen-3.5-4B-wago-JP

## Resumen

El modelo `kazutab/qwen-3.5-4B-wago-JP` es un ajuste fino (fine-tuning) mediante QLoRA sobre el modelo base `Qwen/Qwen3.5-4B`, desarrollado por el usuario kazutab. Su objetivo principal es mejorar la naturalidad y calidez del japonés generado, superando el tono "traducción fría" que suelen presentar los modelos base, e incorporando una perspectiva cultural japonesa en las conversaciones. El modelo mantiene la capacidad de razonamiento (proceso de "thinking") del base, lo que lo hace útil para tareas que requieren lógica y respuestas en japonés idiomático.

Con 4.205.751.296 parámetros (aproximadamente 4.2B), es un modelo relativamente ligero, y se distribuye tanto en formato safetensors como en GGUF cuantizado (Q4_K_M y f16), lo que permite ejecutarlo en entornos con recursos limitados, como portátiles o tablets. Está pensado para usuarios que necesitan un asistente conversacional en japonés con buena calidad lingüística y razonamiento, sin depender de servicios en la nube. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 (~8 GB), GGUF Q4_K_M (~2.5 GB) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer autoregresivo de 4B parámetros. El ajuste se realizó mediante QLoRA (Low-Rank Adaptation cuantizada), una técnica eficiente que permite fine-tuning con bajo consumo de memoria. El dataset utilizado es `kanhatakeyama/AutoMultiTurnByCalm3-22B`, un conjunto de diálogos multiuso en japonés generados sintéticamente por el modelo Calm3-22B, un LLM japonés de código abierto. Esto explica el énfasis en la naturalidad del lenguaje y la perspectiva cultural japonesa.

El entrenamiento preserva el mecanismo de razonamiento interno (thinking) del modelo base, de modo que el modelo "piensa" antes de responder, pero produce salidas en japonés más idiomático y cercano. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés natural y con calidez, evitando el tono de traducción automática.
- Razonamiento lógico y de múltiples pasos gracias al proceso de "thinking" heredado del modelo base.
- Comprensión lectora y sentido común mejorados en japonés, según los benchmarks JGLUE mencionados por el autor.
- Soporte de chat multi-turno mediante plantilla ChatML o Qwen (configurable automáticamente en LM Studio).
- No se menciona soporte para tool calling, function calling, visión, audio u otras modalidades.
- Capacidad multilingüe limitada: el modelo está enfocado exclusivamente al japonés, aunque el base podría tener algo de inglés, no está garantizado.

## Casos de uso

- Asistentes personales en japonés: el modelo puede mantener conversaciones fluidas y naturales sobre temas cotidianos, gracias a su entrenamiento con diálogos generados por Calm3-22B.
- Atención al cliente automatizada en japonés: su tono cercano y su capacidad de razonamiento permiten resolver consultas de forma empática, reduciendo la sensación de interacción robótica.
- Generación de contenido editorial en japonés: redacción de artículos, correos o publicaciones en redes sociales con un estilo idiomático y culturalmente apropiado.
- Tutoría y educación: puede explicar conceptos complejos con razonamiento paso a paso, adaptando el lenguaje a un registro coloquial o formal según se le indique.
- Prototipado rápido de chatbots en entornos locales: gracias a los archivos GGUF, se puede desplegar en portátiles o tablets (p. ej., iPad) con LM Studio o llama.cpp sin necesidad de GPU potente.
- Investigación en PLN japonés: como modelo de referencia para estudiar el efecto del fine-tuning con datos sintéticos en la naturalidad del lenguaje.

## Benchmarks y rendimiento

El autor menciona que se realizaron mediciones en tareas de JGLUE (JSQuAD, JCommonsenseQA, entre otras) con 300 preguntas por tarea, comparando el modelo base y el ajustado. Según la descripción, se lograron "mejoras dramáticas" en comprensión lectora (JSQuAD) y razonamiento de sentido común (JCommonsenseQA), pero no se proporcionan valores numéricos concretos en la model card. Por tanto, no se pueden presentar cifras verificables.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU/GPU ligera: el archivo GGUF Q4_K_M (~2.5 GB) puede ejecutarse en equipos con 4 GB de RAM o VRAM, incluyendo portátiles integrados y tablets (con aplicaciones como LM Studio).
- Calidad máxima: el archivo GGUF f16 (~8 GB) requiere al menos 8-10 GB de memoria, recomendable en GPUs de consumo como RTX 3060 o superiores.
- Compatible con el modelo base Qwen3.5-4B en cuanto a requisitos de memoria: para safetensors en bf16 se necesitan aproximadamente 8.5 GB de VRAM.
- Motores de inferencia compatibles: LM Studio, llama.cpp, Ollama (si se convierte), Hugging Face Transformers, vLLM (probablemente, dado que el base lo soporta).
- Latencia estimada: en una GPU consumer (p. ej., RTX 4090) con Q4_K_M, la generación de tokens puede rondar los 50-100 tokens/s; en CPU, significativamente menor. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kazutab/qwen-3.5-4B-wago-JP | 4.2B | no disponible | Japonés natural + razonamiento | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | 4.2B | no disponible | Multilingüe, razonamiento | Apache 2.0 | HuggingFace |
| kanhatakeyama/Calm3-22B | 22B | no disponible | Japonés general | Apache 2.0 | HuggingFace |

El modelo wago-JP es un fine-tune del base Qwen3.5-4B, por lo que su rendimiento en tareas de razonamiento es similar, pero con una mejora notable en la calidad del japonés. Calm3-22B es un modelo más grande y generalista, pero no está optimizado específicamente para conversación cálida. No se dispone de datos comparativos cuantitativos entre ellos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos en japonés; su rendimiento en otros idiomas no está garantizado y puede degradarse significativamente.
- El dataset de entrenamiento es sintético (generado por Calm3-22B), lo que puede introducir sesgos o patrones repetitivos propios del generador.
- No se documenta soporte para tool calling, function calling ni integración con APIs externas; su uso en agentes complejos requeriría adaptaciones externas.
- La longitud de contexto no está especificada; se asume la del modelo base, pero no hay confirmación.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías sobre la calidad o seguridad del modelo en producción.
- Riesgo de alucinaciones inherente a los modelos de lenguaje, especialmente en tareas de hecho o datos concretos; se recomienda verificación humana en aplicaciones críticas.
- No se han publicado evaluaciones de sesgos o toxicidad específicas para este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kazutab/qwen-3.5-4B-wago-JP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Autor (kazutab): perfil en HuggingFace (no disponible en la información proporcionada)
