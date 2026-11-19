# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290` es un ajuste fino por aprendizaje por refuerzo (GRPO) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 4.096 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo internalice ese límite y produzca respuestas correctas dentro del presupuesto en lugar de depender de un escalado masivo en tiempo de inferencia.

Se trata de un transformer multimodal (pipeline `image-text-to-text`) de 4.539.265.536 parámetros en BF16, derivado del modelo base Qwen3.5-4B y entrenado sobre el dataset DeepScaleR (matemáticas). El checkpoint publicado corresponde al paso 290, seleccionado como el mejor de su ejecución según precisión de validación sobre 480 problemas reservados de DeepScaleR, evaluada cada 10 pasos.

La relevancia actual reside en su enfoque metodológico: es una de las tres semillas (42, 43, 44) de un mismo recetario, lo que permite estudiar la varianza del entrenamiento RL. El modelo está pensado para investigadores que analizan internalización de presupuesto de tokens, no como un asistente generalista listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de entrada imagen-texto, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens (`max_new_tokens`) se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a resolver dentro del límite en lugar de beneficiarse de cadenas de razonamiento más largas.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas, lotes de 32 prompts × 8 rollouts por paso y optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. La recompensa es binaria según corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. Este checkpoint (paso 290, ejecución `maturebass`, semilla 42) es el mejor por precisión de validación de su ejecución; el paso 300 se publica por separado.

## Capacidades

- Razonamiento matemático con respuesta final extraíble mediante `\boxed{}`.
- Generación de cadenas de razonamiento paso a paso bajo un presupuesto fijo de 4.096 tokens.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text` heredado del modelo base).
- Conversación multi-turno según la plantilla de chat del modelo base.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio especiales: no disponibles más allá del pipeline multimodal declarado.

## Casos de uso

- Investigación sobre internalización de presupuesto de tokens: reproducir el experimento de *Budget Internalization* comparando las semillas 42, 43 y 44 para medir la varianza del entrenamiento RL y la estabilidad de la precisión intra-presupuesto.
- Evaluación de RLVR en matemáticas: usar el checkpoint como referencia de un recetario GRPO con recompensa binaria y truncamiento a 4.096 tokens para analizar cómo afecta el truncamiento a la precisión final.
- Benchmarking de eficiencia en inferencia: medir la precisión de un modelo de 4B que no requiere cadenas de razonamiento extendidas, comparándolo con el modelo base sin ajuste bajo el mismo límite de tokens.
- Estudio de selección de checkpoints: analizar la diferencia entre el paso 290 (mejor validación) y el paso 300 (final) para entender la dinámica de sobreajuste o degradación tardía en RL.
- Generación de soluciones matemáticas acotadas: en pipelines internos de investigación donde se exige una cota estricta de tokens por consulta y se tolera un dominio limitado a matemáticas.
- Análisis de robustez multimodal: aprovechar la naturaleza imagen-texto del modelo base para probar si el ajuste RL sobre texto preserva o degrada capacidades de entrada visual (requiere validación empírica, no documentada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits, en torno a 2,3-2,8 GB, aunque no se documentan checkpoints cuantizados oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes y comparativas de semillas; RTX 4090 (24 GB) suficiente para inferencia BF16 individual.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290 | 4.539 M | no disponible (presupuesto de generación 4.096) | RL GRPO para matemáticas con presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo generalista multimodal | Apache 2.0 (según base) | Hugging Face |
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290 | 4.539 M | no disponible | Mismo recetario, semilla 43 | Apache 2.0 | Hugging Face |
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300 | 4.539 M | no disponible | Mismo recetario, semilla 44 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre DeepScaleR (matemáticas); su rendimiento fuera de ese dominio no está documentado.
- Presupuesto fijo: el truncamiento a 4.096 tokens puede producir respuestas cortadas en problemas que requieran cadenas de razonamiento más largas.
- Selección de checkpoint: el paso 290 es el mejor por validación, pero el paso 300 podría mostrar degradación; conviene validar antes de usar en cualquier evaluación.
- Varianza entre semillas: al ser una de tres semillas, los resultados pueden no generalizar; se recomienda comparar con las semillas 43 y 44.
- Idiomas soportados no documentados: no se garantiza un comportamiento multilingüe adecuado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la recompensa binaria por corrección no elimina razonamientos plausibles pero incorrectos.
- Licencia Apache 2.0 permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-4B; conviene revisar la licencia del base.
- Sin datos de benchmarks publicados: no es posible afirmar mejoras cuantitativas frente al modelo base sin evaluación propia.
- Cero descargas y cero likes en el momento de la ficha: ecosistema de validación aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint paso 300 (misma semilla): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Checkpoint semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
