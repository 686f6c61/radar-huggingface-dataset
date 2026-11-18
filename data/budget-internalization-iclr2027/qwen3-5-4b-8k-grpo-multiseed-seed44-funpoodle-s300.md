# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300

## Resumen

Qwen3.5-4B-8k-grpo-multiseed-seed44-funpoodle-s300 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, desarrollado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una submission al congreso ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación fijo de 8.192 tokens, de modo que las respuestas que agotan el límite se truncan y se puntúan tal cual. Forma parte de un estudio de ablación de semillas (42, 43 y 44) sobre la misma receta, y este repositorio concreto corresponde a la semilla 44, apodada `funpoodle`, en su checkpoint final (paso 300).

El modelo resuelve el problema de internalizar la restricción de longitud de respuesta durante el razonamiento: en lugar de generar cadenas de pensamiento arbitrariamente largas, se le recompensa por llegar a una respuesta correcta dentro de un límite estricto. Esto es relevante para despliegues en producción donde el coste por token y la latencia importan, y para la investigación sobre cómo el RL moldea la asignación de presupuesto computacional en modelos pequeños.

Arquitectura y tamaño: se hereda íntegramente de Qwen3.5-4B, con 4.539.265.536 parámetros totales en pesos BF16 (9,1 GB de repositorio). La modalidad declarada en el pipeline es `image-text-to-text`, aunque el entrenamiento se centra exclusivamente en matemáticas textuales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles internos no disponibles) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 8.192 tokens, no la ventana de contexto) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B sin cambios estructurales conocidos; la intervención es puramente de ajuste por RL. Se emplea GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Cada paso de entrenamiento usa 32 prompts con 8 rollouts por prompt, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante un total de 300 pasos. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se evalúan tal cual, lo que introduce la presión implícita para internalizar el límite.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. El prompt de entrenamiento es fijo: instrucción de razonar paso a paso y emitir la respuesta dentro de `\boxed{}`. La validación se realiza cada 10 pasos sobre 480 problemas reservados de DeepScaleR. Este repositorio es el checkpoint final del paso 300 de la semilla 44; existen checkpoints intermedios (paso 290) y de las otras semillas en la misma organización.

## Capacidades

- Razonamiento matemático con cadena de pensamiento paso a paso bajo un presupuesto estricto de 8.192 tokens de generación.
- Extracción de respuesta final en formato `\boxed{}`, consistente con el formato de entrenamiento.
- Generación de texto conversacional (heredada del modelo base y del template de chat).
- Capacidad multimodal de entrada imagen-texto declarada en el pipeline (`image-text-to-text`), aunque no se ha entrenado específicamente para tareas de visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de la cadena de pensamiento matemática.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Resolución de problemas matemáticos de competición (estilo DeepScaleR/AIME): el modelo está entrenado para producir soluciones con respuesta final en `\boxed{}`, lo que permite evaluarlas automáticamente en pipelines de corrección.
- Evaluación de investigación sobre presupuesto de tokens: sirve como punto de comparación en estudios de ablación de semillas y de internalización de límites de generación, dado que existen checkpoints pareados de las semillas 42, 43 y 44.
- Generación de soluciones paso a paso en entornos educativos: la cadena de razonamiento explícita y acotada en longitud facilita la revisión por parte de estudiantes y tutores.
- Benchmarking de RL para matemáticas: al ser un checkpoint final de una receta reproducible (GRPO, LR 5e-7, 300 pasos), es útil como baseline en experimentos de ajuste por refuerzo con recompensa binaria.
- Despliegue en entornos con restricciones de coste por token: el entrenamiento con truncamiento a 8.192 tokens favorece respuestas que no se desbocan en longitud, lo que reduce el coste de inferencia frente a modelos que generan cadenas ilimitadas.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un modelo de 4,5B parámetros en BF16, es viable ajustarlo en una sola GPU de 24 GB con cuantización o en varias GPU con precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para el modelo completo.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones a partir del tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantización (no verificada por el autor).
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (`vllm serve ...` documentado). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B GRPO 8k, seed 44) | 4,54B | no disponible | GRPO sobre DeepScaleR, 300 pasos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Preentrenamiento + post-entrenamiento del autor original | Apache 2.0 (según herencia) | Hugging Face |
| Checkpoints de las semillas 42 y 43 de la misma receta | 4,54B | no disponible | Misma receta, distinta semilla | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: forma parte de una submission anónima a ICLR 2027; no está pensado como producto listo para producción.
- Especialización estrecha: el ajuste por RL se limita a matemáticas con recompensa binaria; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria no elimina este riesgo.
- Formato rígido: el entrenamiento asume respuesta en `\boxed{}` y un prompt concreto; usos fuera de ese formato pueden degradar la calidad.
- Truncamiento a 8.192 tokens: las respuestas que agotan el presupuesto se cortan, lo que puede producir soluciones incompletas en problemas muy largos.
- Idiomas: no se especifican; el entrenamiento es en inglés (prompt y dataset), por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 heredada del modelo base; conviene verificar los términos del modelo Qwen3.5-4B original para uso comercial.
- Sin métricas publicadas: no hay benchmarks numéricos en la información disponible, lo que impide evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint paso 290 de la misma semilla: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Semilla 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Semilla 43, paso 160: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
