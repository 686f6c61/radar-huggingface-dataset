# arianraje/mimo-7b-gdn-hybrid-1.8B-OPD

## Resumen

El modelo `arianraje/mimo-7b-gdn-hybrid-1.8B-OPD` es un modelo de lenguaje híbrido de 8.309.898.304 parámetros (8.3B), desarrollado por arianraje como parte de una escalera de destilación on-policy (OPD) sobre el teacher `XiaomiMiMo/MiMo-7B-RL-0530`. Su arquitectura combina de forma uniforme capas de atención Qwen2 y capas Gated DeltaNet en proporción 1:4, con una ventana de contexto de 65.536 tokens. El checkpoint corresponde al peldaño de 1.8B tokens de entrenamiento, dentro de un esquema de programación WSD (warmup, stable, decay), y se presenta como el estado final tras la fase de decay.

El objetivo del modelo es ofrecer razonamiento matemático de alto nivel y recuperación de información en contextos largos, aprovechando la eficiencia de las capas de atención lineal (Gated DeltaNet) combinadas con atención completa en una subred proporcionalmente reducida. Al ser un destilado del MiMo-7B-RL, hereda parte de sus capacidades de razonamiento pero con una arquitectura más ligera en coste computacional por token en las capas lineales. El modelo se publica bajo licencia MIT, lo que permite su uso comercial sin restricciones de licencia, aunque su despliegue requiere una arquitectura personalizada registrada en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido uniforme 1:4 de capas Qwen2 attention y capas Gated DeltaNet (mimo_gdn) |
| Parametros totales | 8.309.898.304 (8.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (ventana del modelo); entrenamiento con `max_model_len` limitado a 49.152 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida donde una de cada cinco capas es una capa de atención Qwen2 y las cuatro restantes son capas Gated DeltaNet, una variante de atención lineal que reduce la complejidad de la atención a coste constante por token. Esta proporción uniforme se mantiene a lo largo de toda la red. El entrenamiento se realizó mediante destilación on-policy (OPD) usando como teacher el modelo `XiaomiMiMo/MiMo-7B-RL-0530`, con una programación WSD (warmup, stable, decay). El checkpoint `stage3-1.8B-OPD` corresponde al peldaño de 1.800.027.023 tokens de generación consumidos por el modelo, en el paso 11632.

Comparado con el peldaño anterior (`arianraje/mimo-7b-gdn-hybrid-1.6B-OPD`), este checkpoint introduce dos cambios deliberados: el horizonte de rollout para entrenamiento de razonamiento se incrementó de 16.384 a 32.768 tokens, mientras que el `max_model_len` del sampler se redujo de 65.536 a 49.152 para ajustarse a la memoria del entrenador. En la práctica, esto implica que los elementos de recuperación (RUG) con prompts de 32K ven su generación limitada a aproximadamente 16K tokens, el mismo presupuesto que tenían en los peldaños anteriores. El tronco pre-decay de este peldaño es público en `arianraje/mimo-7b-gdn-opd-predecay-1721m-step11144`.

## Capacidades

- Razonamiento matemático avanzado: obtiene resultados notables en AIME24 y AIME25 con modo "think", y en MATH-500 y GSM8K.
- Generación de texto con modo "think" / "no-think": el modelo puede generar cadenas de razonamiento explícitas o respuestas directas según el prompt.
- Recuperación de contexto largo: puntuaciones superiores al 84% en tareas needle-in-a-haystack (NIAH) multikey en 32K, y prácticamente perfectas en NIAH single con múltiples queries.
- Conocimiento general: cubre tareas de sentido común y razonamiento simbólico (PIQA, HellaSwag, ARC, Winogrande) y comprensión de lenguaje (MMLU).
- Soporte de tool calling / function calling: No disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: El entrenamiento con rollout de hasta 32K tokens sugiere capacidad para razonamiento encadenado, aunque no se documenta un framework de agente específico.
- Capacidades multilingües: No disponible.
- Visión o audio: No disponible.

## Casos de uso

- Tutoría de matemáticas en línea: el modelo puede resolver problemas de nivel olímpico (AIME, MATH-500) y generar explicaciones paso a paso, lo que lo hace adecuado para asistentes educativos que requieren justificación detallada.
- Evaluación de destilación de modelos: la publicación de métricas detalladas por peldaño permite a investigadores comparar el efecto de la escalera OPD y el decay en el rendimiento final, sirviendo como referencia académica.
- RAG sobre documentación matemática y científica: con una ventana de contexto de 65.536 tokens, el modelo puede procesar artículos largos, libros de texto y conjuntos de problemas completos, recuperar información específica y razonar sobre ella.
- Generación de problemas de práctica: gracias a su capacidad matemática, puede producir ejercicios de preparación de exámenes con soluciones, adaptados a distintos niveles (GSM8K, MATH-500).
- Investigación en arquitecturas híbridas de atención lineal: el checkpoint permite estudiar el comportamiento de capas Gated DeltaNet combinadas con atención completa, incluyendo su efecto en tareas de recuperación a larga distancia.
- Asistentes de análisis de experimentos: en entornos de investigación, el modelo puede interpretar resultados numéricos extensos, resumir métricas y detectar inconsistencias, aprovechando su capacidad de procesar secuencias largas.

## Benchmarks y rendimiento

| Metric | 1.6B-OPD | 1.8B-OPD |
|---|---:|---:|
| AIME24 think pass@1 / pass@8 @32K (n=30×8) | 62.1 / 83.3 | 63.3 / 76.7 |
| AIME25 think pass@1 / pass@8 @32K (n=30×8) | 47.5 / 73.3 | 49.2 / 73.3 |
| MATH-500 think pass@1 @32K | 93.8 | 93.4 |
| MATH-500 no-think pass@1 @4K | 68.2 | 70.2 |
| GSM8K no-think strict / flexible @1K | 57.6 / 63.8 | 58.5 / 65.2 |
| MMLU 5-shot | 54.2 | 53.8 |
| PIQA / HellaSwag / ARC-E / ARC-C / Winogrande | 72.6 / 60.3 / 63.6 / 39.1 / 59.3 | 72.0 / 60.3 / 62.8 / 39.6 / 59.7 |
| NIAH multikey 4K / 8K / 16K / 32K (n=500) | 98.6 / 98.0 / 96.6 / 89.4 | 96.8 / 97.2 / 95.0 / 84.6 |
| NIAH single, multiquery (all lengths) | ≥99.8 | ≥99.8 |
| trunc / mean gen tokens: MATH-500, AIME24, AIME25 | 3.4% / 8169, 30.4% / 22273, 35.8% / 23806 | 3.6% / 8168, 26.7% / 21925, 32.5% / 23552 |

Las celdas de AIME corresponden a n=30 problemas (±14 puntos en pass@1) y deben considerarse datos de tendencia; MATH-500 (n=500) es la celda con mayor potencia estadística.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16/BF16 ocupan aproximadamente 16.6 GB para el modelo completo, más la memoria para KV-cache y activaciones. En cuantización no publicada, no es posible dar valores fiables.
- GPU recomendadas: para ejecutar el modelo en FP16 con la ventana de contexto completa se recomiendan GPUs con al menos 24 GB de VRAM (RTX 4090) o GPUs de centro de datos como A100 40/80 GB o H100.
- Capacidad en GPU de consumo: es viable en una RTX 4090 (24 GB) para contextos moderados, pero la ventana completa de 65.536 tokens puede requerir más memoria o cuantización externa.
- Opciones de despliegue: con Transformers, verificando la compatibilidad de la arquitectura `mimo_gdn`, y potencialmente con vLLM o llama.cpp si se exporta a formatos compatibles, aunque esto no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME24 think pass@1 | MATH-500 think pass@1 | Licencia |
|---|---|---|---|---|---|
| arianraje/mimo-7b-gdn-hybrid-1.6B-OPD | 8.3B | 65.536 | 62.1 | 93.8 | MIT |
| arianraje/mimo-7b-gdn-hybrid-1.8B-OPD (este) | 8.3B | 65.536 | 63.3 | 93.4 | MIT |
| XiaomiMiMo/MiMo-7B-RL-0530 (teacher) | 7B | No disponible | No disponible | No disponible | MIT |

La serie `mimo-7b-gdn-hybrid-*-OPD` comparte la misma arquitectura y ventana de contexto, diferenciándose solo en el número de tokens de entrenamiento del peldaño y en los ajustes del rollout. El teacher MiMo-7B-RL-0530 es el modelo original de 7B del que se destila el conocimiento, pero la información proporcionada no incluye sus resultados de benchmarks.

## Limitaciones y advertencias

- Sesgos: no se ha publicado ninguna evaluación de sesgos; el modelo está entrenado principalmente en tareas matemáticas, por lo que su comportamiento en dominios sociales o sensibles puede ser impredecible.
- Riesgo de alucinación: aunque destacan en matemáticas, los errores de cálculo o razonamiento no son improbables; se recomienda verificación externa en usos críticos.
- Limitaciones de contexto: la ventana nominal es de 65.536 tokens, pero el entrenamiento limitó `max_model_len` a 49.152, y para consultas de 32K la generación se limitó a aproximadamente 16K tokens durante el entrenamiento.
- Dependencia de librerías específicas: el modelo requiere el registro de la arquitectura `mimo_gdn` de la repo de entrenamiento, con Transformers 4.57.x y flash-linear-attention 0.5.x; esto puede complicar el despliegue sin una customización previa.
- Restricciones de licencia para uso comercial: la licencia MIT es permisiva, pero la implementación de la arquitectura personalizada debe obtenerse de la repo de entrenamiento, que no se ha enlazado en la información proporcionada y puede tener condiciones adicionales.

## Enlaces

- [HuggingFace: arianraje/mimo-7b-gdn-hybrid-1.8B-OPD](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-1.8B-OPD)
- [HuggingFace: arianraje/mimo-7b-gdn-hybrid-1.6B-OPD](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-1.6B-OPD)
- [HuggingFace: arianraje/mimo-7b-gdn-hybrid-200M-OPD](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD)
- [HuggingFace: arianraje/mimo-7b-gdn-opd-predecay-1721m-step11144](https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-1721m-step11144)
- [HuggingFace: XiaomiMiMo/MiMo-7B-RL-0530](https://huggingface.co/XiaomiMiMo/MiMo-7B-RL-0530)
