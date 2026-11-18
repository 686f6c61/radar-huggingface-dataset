# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160

## Resumen

El modelo `qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160` es un ajuste fino por aprendizaje por refuerzo (GRPO) de Qwen/Qwen3.5-4B, desarrollado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una submission al ICLR 2027. El objetivo del trabajo es entrenar razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens, analizando cómo el modelo internaliza ese límite y cómo varía el resultado entre distintas semillas de entrenamiento (42, 43 y 44).

Este repositorio concreto corresponde a la semilla 43, con el nombre interno de ejecución `pickedwolf`, y contiene el mejor checkpoint de esa ejecución según precisión de validación (paso 160), no el checkpoint final (paso 300). El modelo parte de una arquitectura transformer multimodal de 4.539.265.536 parámetros totales, con pipeline `image-text-to-text`, y se distribuye bajo licencia Apache 2.0.

Su relevancia es doble: por un lado, es un artefacto de investigación reproducible (múltiples semillas, checkpoints intermedios y finales publicados por separado); por otro, demuestra una receta de RL con recompensa binaria de corrección sobre el dataset DeepScaleR que puede servir de referencia para estudiar la estabilidad del entrenamiento y el efecto del presupuesto de tokens en modelos de razonamiento de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline `image-text-to-text`; detalles internos de capas y atención no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 8.192 tokens, distinto de la ventana de contexto) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16); repositorio de 9,1 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B, un transformer multimodal de 4,54 mil millones de parámetros. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta del bloque `\boxed{}` y se compara con la solución correcta. Las respuestas que alcanzan el límite de generación se truncan y se puntúan tal cual, lo que introduce una presión explícita para que el modelo aprenda a resolver dentro del presupuesto.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matemáticas), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento. Esta ejecución concreta (semilla 43, `pickedwolf`) se detuvo en el paso 160 por ser el mejor checkpoint según la precisión de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de etiquetas `\boxed{}`.

## Capacidades

- Razonamiento matemático con formato de respuesta explícito (`\boxed{}`), entrenado específicamente para problemas de competición tipo DeepScaleR.
- Generación de cadenas de razonamiento ("think step-by-step") bajo un presupuesto de 8.192 tokens de generación.
- Procesamiento multimodal de imagen y texto, heredado del pipeline `image-text-to-text` del modelo base.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso más allá del formateo de respuesta: no disponibles como característica documentada.
- Idiomas: no disponible.

## Casos de uso

- Evaluación de recetas de RL para razonamiento matemático: el modelo sirve como punto de comparación entre semillas (42, 43, 44) y entre checkpoints intermedios y finales, permitiendo medir la varianza del entrenamiento con GRPO.
- Reproducción de experimentos académicos: al publicarse todos los checkpoints de la ablación de semillas, un investigador puede replicar curvas de validación sobre los 480 problemas reservados de DeepScaleR.
- Generación de soluciones matemáticas con formato verificable: el modelo produce respuestas en `\boxed{}`, lo que facilita la extracción automática y la evaluación programática en pipelines de corrección.
- Estudio del efecto del presupuesto de tokens: útil para analizar cómo un modelo de 4,5 B distribuye su razonamiento cuando se le impone un límite de 8.192 tokens, por ejemplo en entornos con restricciones de latencia o coste.
- Fine-tuning posterior como base de razonamiento: al ser un checkpoint ajustado con RL sobre Qwen3.5-4B, puede servir de inicialización para tareas matemáticas específicas del dominio.
- Despliegue en investigación con vLLM: la model card documenta `vllm serve` para servir el modelo en experimentos de inferencia a escala media.
- Prototipado de asistentes matemáticos con entrada de imagen: el pipeline `image-text-to-text` permite experimentar con problemas matemáticos presentados como imágenes, aunque no hay validación específica de esta capacidad en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numéricos obtenidos en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica, se recomienda al menos 16-24 GB para contextos largos.
- Cuantización: no se documentan versiones GGUF ni AWQ/GPTQ en el repositorio; sería necesario generarlas a partir de los pesos safetensors.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir con vLLM y lotes concurrentes; RTX 4090 (24 GB) viable en BF16 para una sola petición.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits (no publicada), podría caber en GPUs de 12-16 GB.
- Opciones de despliegue: `transformers` (documentado) y vLLM (documentado en la model card); llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160 | 4,54 B | no disponible | GRPO sobre DeepScaleR, presupuesto 8k | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54 B | no disponible | Preentrenamiento + post-entrenamiento del autor original | Apache 2.0 (segun este repo) | Hugging Face |
| qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300 | 4,54 B | no disponible | Misma receta, checkpoint final paso 300 | Apache 2.0 | Hugging Face |
| qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290 | 4,54 B | no disponible | Misma receta, semilla 42, mejor checkpoint | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un artefacto de una submission anónima a ICLR 2027, sin validación externa ni resultados de benchmarks publicados.
- Especializado en matemáticas: el ajuste con GRPO sobre DeepScaleR puede degradar capacidades generales del modelo base fuera del dominio matemático.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria no garantiza corrección fuera de la distribución de entrenamiento.
- Truncamiento en el presupuesto: las respuestas que alcanzan los 8.192 tokens se truncan, lo que puede producir salidas incompletas en problemas que requieran razonamientos más largos.
- Idiomas: no se documenta el soporte multilingüe; el entrenamiento se realizó sobre un dataset de matemáticas en inglés.
- Capacidades multimodales no validadas: aunque el pipeline es `image-text-to-text`, no hay evidencia de que el ajuste RL preserve o mejore el rendimiento en visión.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen/Qwen3.5-4B; conviene revisar la licencia original.
- Reproducibilidad: la variabilidad entre semillas es precisamente el objeto del estudio, por lo que el rendimiento de este checkpoint no debe extrapolarse sin comprobar las otras ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint final de la misma semilla: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Semilla 42, mejor checkpoint: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Semilla 42, checkpoint final: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Semilla 44, mejor checkpoint: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Semilla 44, checkpoint final: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
