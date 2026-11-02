# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-shuffled

## Resumen

`code-sft-rerun-20261102-qwen3-1p7b-code-shuffled` es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen3-1.7B-Base, publicado por el colectivo de experimentación `RL-Forgetting-Experiments-3`. Forma parte de una batería de trece ejecuciones ("arms") de noviembre de 2026 orientadas a estudiar el olvido catastrófico (catastrophic forgetting) durante el entrenamiento de modelos en tareas de código, comparando distintas estrategias de ordenación y muestreo del dataset de SFT (ordered, shuffled, uniform, hard, CE). El sufijo "code-shuffled" indica que esta variante concreta se entrenó con el dataset de código en orden aleatorio.

El modelo no está pensado como un asistente de código listo para producción, sino como un artefacto de investigación reproducible: el repositorio incluye checkpoints intermedios (10 guardados por ejecución), estados de recuperación retenidos y métricas de evaluación en MBPP+. El interés actual reside en que permite analizar empíricamente cómo el orden de los datos de SFT afecta a la retención de capacidades del modelo base.

La información pública es escasa: no se declaran idiomas soportados, pipeline ni resultados de benchmarks en la model card. El tamaño del repositorio (62 GB) es notablemente superior al de un checkpoint de 1,7B parámetros en safetensors, lo que sugiere que incluye múltiples checkpoints intermedios y estados de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-1.7B-Base; detalles de atención no disponibles) |
| Parametros totales | 1,7B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (deriva de Qwen3-1.7B-Base, que retiene Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-1.7B-Base, un transformer denso de 1,7 mil millones de parámetros. El entrenamiento se realizó con los siguientes hiperparámetros declarados: learning rate 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4 GPUs H100, secuencia de 4096 tokens y 10 guardados de checkpoint por ejecución. Se aplicó una estrategia de replay con lambda 1.0, presumiblemente para mitigar el olvido de las capacidades originales del modelo base.

La innovación metodológica no está en la arquitectura, sino en el diseño experimental: esta variante "shuffled" se compara con otras ordenaciones del mismo dataset de código (ordered, uniform, hard, CE) para medir el impacto del orden de presentación de los datos en la retención de conocimiento. Los checkpoints intermedios y el estado de recuperación se conservan en el repositorio para permitir análisis posteriores. No se especifica el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de que es una tarea de código.

## Capacidades

- Generación de código: el modelo ha sido ajustado específicamente sobre datos de código, por lo que se espera competencia en tareas de programación (no verificada con benchmarks en la información disponible).
- Razonamiento y generación de texto: hereda las capacidades del modelo base Qwen3-1.7B-Base, aunque el SFT puede haber degradado parte de ellas (ese es precisamente el objeto del experimento).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el caso de uso principal es académico. El checkpoint permite reproducir y analizar cómo el orden aleatorio del dataset de SFT afecta a la retención de capacidades frente a otras ordenaciones del mismo conjunto de datos.
- Estudio de estrategias de replay: dado que se aplicó replay con lambda 1.0, el modelo sirve para evaluar la eficacia de esta técnica en modelos pequeños de código, comparando los checkpoints intermedios guardados.
- Evaluación de sensibilidad al orden de datos: al ser la variante "shuffled", permite contrastar hipótesis sobre si la aleatorización mejora o empeora la retención en comparación con las variantes ordered, uniform, hard y CE de la misma batería experimental.
- Análisis de checkpoints intermedios: los 10 guardados por ejecución permiten trazar la evolución de las métricas a lo largo del entrenamiento y detectar puntos de degradación.
- Reproducción de experimentos: el repositorio incluye manifiestos de entrega y procedencia (`delivery_manifest.json`, `request-provenance.json`) que facilitan la replicación exacta de las condiciones de entrenamiento.
- Base para estudios comparativos entre familias: al compartir protocolo con derivados de Qwen2.5-3B y Llama-3.2-3B, permite comparaciones cruzadas de olvido entre arquitecturas y tamaños.

## Benchmarks y rendimiento

La model card referencia evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (MBPP+, 160 muestras, temperatura 0.6), pero no se incluyen los resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16 para un modelo de 1,7B parámetros; en torno a 1-2 GB con cuantización de 8 o 4 bits (estimación teórica, no verificada para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia en FP16. El entrenamiento se realizó en 4×H100.
- Cabe en GPU consumer: sí, con holgura, incluso en GPUs de 8 GB.
- Opciones de despliegue: al publicarse solo en safetensors, sería necesario convertir a GGUF para llama.cpp u Ollama; es compatible con vLLM y TGI si se dispone de los pesos en formato estándar. No se confirma compatibilidad explícita con ninguna de estas herramientas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-shuffled | 1,7B | 4096 (entrenamiento) | other (base Apache 2.0) | HuggingFace | Artefacto de investigación, sin benchmarks publicados |
| Qwen3-1.7B-Base | 1,7B | no disponible | Apache 2.0 | HuggingFace | Modelo base original, sin SFT de código |
| Qwen2.5-3B (derivados del mismo experimento) | 3B | no disponible | Qwen Research License | HuggingFace | Misma batería experimental, mayor tamaño |
| Llama-3.2-3B-Instruct (derivados del mismo experimento) | 3B | no disponible | Llama 3.2 Community License | HuggingFace | Misma batería experimental, familia distinta |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es el estudio del olvido catastrófico.
- Sin benchmarks publicados: no hay evidencia numérica de su calidad en tareas de código más allá de la referencia a evaluaciones en MBPP+ cuyos resultados no se incluyen.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el SFT.
- Licencia "other": aunque el modelo base Qwen3-1.7B-Base es Apache 2.0, la model card indica que los derivados "retienen Apache 2.0", pero la licencia declarada en los metadatos es "other". Es necesario revisar los archivos LICENSE/NOTICE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no cuantificado en la información disponible.
- Posible degradación por olvido: al ser un experimento sobre olvido catastrófico, es esperable que algunas capacidades del modelo base se hayan deteriorado; el propio diseño del experimento sugiere que este es un riesgo real.
- Sesgos: no documentados en la información proporcionada.
- Repositorio de 62 GB: incluye múltiples checkpoints y estados de recuperación, lo que requiere espacio de almacenamiento considerable para su descarga completa.

## Enlaces

- [HuggingFace: RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-shuffled](https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-shuffled)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
