# Lavrqwerty/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Lavrqwerty. Se trata de una versión "decensored" o "abliterated" generada con la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del modelo original para reducir drásticamente la tasa de rechazos. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect, con especial énfasis en matemáticas y STEM.

El modelo conserva la arquitectura y el tamaño del original: 9.409.813.744 parámetros (aproximadamente 9,4B), pesos en safetensors, licencia Apache 2.0 y soporte para seis idiomas (inglés, chino, coreano, japonés, español y ruso). La modificación de Heretic elimina prácticamente todos los rechazos (de 100/100 en el original a 3/100) con una divergencia KL de 0,0422 respecto al modelo base, lo que indica que el comportamiento general se preserva en gran medida.

Su relevancia radica en que ofrece un modelo de razonamiento compacto (9B) con capacidades matemáticas y de tool calling, sin las restricciones de seguridad habituales, lo que lo hace atractivo para investigación sobre alineación, evaluación de sesgos y aplicaciones donde los filtros de contenido resultan un obstáculo. No obstante, esa misma característica implica riesgos importantes para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con soporte MTP (multi-token prediction) evaluado |
| Parámetros totales | 9.409.813.744 (~9,4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se menciona NVFP4 evaluado) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de aproximadamente 9,4B parámetros. El entrenamiento del base se realizó mediante destilación de las respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico (STEM). Según la model card, el proceso incluyó SFT, RL y GSPO, y se evaluó el uso de MTP (multi-token prediction) y cuantización NVFP4. Aunque no se aportaron datos específicos de coding en el SFT, se observaron pequeñas mejoras en programación y uso de herramientas por transferencia entre dominios.

La modificación de este repositorio aplica Heretic v2.0.0.dev0, una técnica de ablación de rangos arbitrarios (ARA) que interviene en las capas 9 a 24 con parámetros concretos: `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. El resultado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original, lo que indica que la distribución de salidas se mantiene mayoritariamente intacta fuera de los comportamientos de rechazo.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM (foco principal del entrenamiento).
- Generación de código y transferencia parcial a tareas de programación, pese a no recibir SFT específico de coding.
- Tool calling y function calling (etiquetado explícito en el repositorio).
- Soporte de agentes y razonamiento multi-paso orientado a uso de herramientas.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del proceso de destilación.
- Procesamiento image-text-to-text según las etiquetas del repositorio (pipeline declarado como text-generation).
- Comportamiento "uncensored"/"abliterated": mínima tasa de rechazos ante peticiones que el modelo original rechazaría.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación ARA afecta al comportamiento de rechazo y a la distribución de salidas, comparando con el original mediante la divergencia KL reportada (0,0422).
- Evaluación de sesgos y robustez: útil para probar hasta qué punto un modelo de 9B mantiene coherencia tras eliminar los filtros de seguridad, en entornos controlados de laboratorio.
- Razonamiento matemático asistido: resolución de problemas de cálculo, álgebra y demostraciones paso a paso, aprovechando las ~250.000 muestras de entrenamiento centradas en matemáticas y STEM.
- Generación de código en pipelines internos: su soporte de tool calling y function calling permite integrarlo en flujos de CI/CD o asistentes de código, aunque con validación humana obligatoria.
- Agentes autónomos de investigación: el razonamiento multi-paso y el uso de herramientas lo hacen adecuado para tareas de recuperación y síntesis de información en entornos sin restricciones de contenido.
- Procesamiento multilingüe: atención al cliente o generación de contenido en español, inglés, chino, coreano, japonés y ruso, con la ventaja de un modelo compacto de 9B desplegable en hardware moderado.
- Análisis de textos sensibles: escenarios de investigación (forense, periodismo, moderación) donde los rechazos del modelo base impiden procesar material delicado.

## Benchmarks y rendimiento

La model card únicamente reporta métricas comparativas del proceso de ablación, no benchmarks estándar de razonamiento o código.

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para fp16 en single-GPU; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 ajustado y en RTX 3090/4070 Ti/4080 con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (previa conversión a GGUF), unsloth para fine-tuning.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Lavrqwerty/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | ~9,4B | no disponible | Apache 2.0 | Razonamiento STEM + sin censura | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,4B | no disponible | Apache 2.0 | Razonamiento STEM destilado | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión reducida sin censura | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune científico | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de los mecanismos de rechazo implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático; no es apto para aplicaciones de cara al público sin capas adicionales de moderación.
- La divergencia KL de 0,0422 respecto al original indica que, aunque el comportamiento general se preserva, existen desviaciones medibles en la distribución de salidas que pueden afectar a la fiabilidad en tareas delicadas.
- Riesgo de alucinación inherente a los modelos de 9B destilados, especialmente en dominios fuera de matemáticas y STEM.
- La longitud de contexto no está documentada en la información disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- El modelo base está entrenado principalmente en matemáticas y STEM; su rendimiento en coding, derecho, medicina u otras áreas puede ser inferior al de modelos generalistas del mismo tamaño.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones concretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación ni reportes independientes de calidad.
- La model card incluye HTML con emojis y estilos; conviene verificar la integridad de los pesos antes de desplegar en producción.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Lavrqwerty/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
