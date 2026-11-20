# johnzhang2134/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (también etiquetada como abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un ajuste fino orientado a razonamiento construido sobre Qwen3.5-4B y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es johnzhang2134, que aplica la herramienta Heretic v2.0.0 para eliminar los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (ARA, Arbitrary-Rank Ablation) sobre las capas 16 a 32.

El modelo resuelve el problema de los rechazos en tareas legítimas de razonamiento matemático y científico: según la model card, el original rechaza 99 de cada 100 peticiones de una batería de evaluación, mientras que esta variante rechaza 5 de cada 100, con una divergencia KL de 0.0378 respecto al original. Es relevante para desarrolladores que necesitan un modelo compacto de 4B parámetros con capacidades de razonamiento estructurado y sin bloqueos de seguridad en el ámbito de la investigación y el análisis técnico.

Con 4.539.265.536 parámetros reales (según safetensors) y un repositorio de 9,3 GB, se posiciona en la clase de despliegue accesible. Soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso), licencia Apache 2.0 y formato safetensors compatible con transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; tag `unsloth` sugiere disponibilidad de cuantizaciones vía Unsloth, sin confirmar) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 con 4B parámetros, ajustado mediante destilación (distillation) a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento del modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B se realizó con supervisión fina (SFT) sobre una mezcla de aproximadamente 250.000 muestras centradas en matemáticas y STEM, siguiendo el mismo pipeline que la versión de 9B. La model card menciona además la etiqueta `mtp` (multi-token prediction) y una evaluación "MTP-Q8", lo que sugiere soporte de predicción multi-token, aunque no se detallan los pormenores técnicos.

La innovación principal de esta variante es el proceso de decensura mediante Heretic v2.0.0 con ablación de rangos arbitrarios (ARA) aplicada entre las capas 16 y 32 del modelo. Los parámetros declarados son: `preserve_good_behavior_weight` 0.9854, `steer_bad_behavior_weight` 0.0002, `overcorrect_relative_weight` 0.6587 y `neighbor_count` 10. No se especifica el número de tokens de entrenamiento del ajuste fino original ni la composición exacta del dataset más allá de la referencia a matemáticas y STEM.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas, aprendida por destilación de un profesor de mayor tamaño.
- Razonamiento matemático y científico (STEM) reforzado por las ~250.000 muestras de entrenamiento.
- Modo de razonamiento (tag `reasoning`), orientado a soluciones estructuradas.
- Capacidades multimodales de entrada imagen-texto según el tag `image-text-to-text` del repositorio, aunque la model card no detalla el soporte visual.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Conversación multi-turno (tag `conversational`).
- Comportamiento sin rechazos en la mayoría de peticiones (5/100 en la evaluación del autor), orientado a investigación.
- No se documenta explícitamente soporte de tool calling, function calling ni uso como agente autónomo.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo (5/100 frente a 99/100) y divergencia KL (0.0378) en condiciones controladas.
- Resolución de problemas matemáticos y de física en entornos educativos: el ajuste sobre ~250.000 muestras STEM y el modo de razonamiento lo hacen adecuado para generar soluciones paso a paso en tutoría automatizada.
- Generación de explicaciones técnicas en español: al estar entrenado en seis idiomas, puede redactar análisis de problemas de ingeniería o ciencia en castellano sin depender de traducción posterior.
- Análisis de documentos técnicos y científicos: con un contexto no especificado pero típico de la familia Qwen3.5, puede resumir y extraer conclusiones de artículos, aunque conviene verificar la longitud real de ventana antes de producción.
- Prototipado rápido en local: con 4B parámetros y pesos safetensors, es viable ejecutarlo en una GPU de consumo para experimentación con pipelines de transformers.
- Evaluación comparativa de destilaciones: sirve como referencia de la clase 4B destilada de DeepSeek-V4-Pro para medir la degradación de capacidades respecto a la versión de 9B (xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic).
- Fine-tuning posterior en dominios científicos: al ser Apache 2.0 y de tamaño reducido, es una base manejable para ajustes específicos (el autor enlaza su propio ajuste DeepThought-STEM).

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (sobre 100) | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de decensura proporcionadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB, aunque el repositorio solo distribuye safetensors y no confirma cuantizaciones listas.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 (16 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no confirmadas en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | 4,54B | no disponible | Apache 2.0 | Variante abliterated, 5/100 rechazos, KL 0.0378 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4B (clase) | no disponible | Apache 2.0 (según base) | Modelo original, 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (clase) | no disponible | no disponible | Versión 9B del mismo proceso Heretic, enlazada por el autor |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B (clase) | no disponible | no disponible | Ajuste científico del autor sobre esta familia |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La decensura elimina los rechazos de seguridad: el modelo puede generar contenido dañino, sesgado o inapropiado, y no debe desplegarse en aplicaciones de cara al público sin filtros externos.
- La divergencia KL de 0.0378 respecto al original implica cambios en la distribución de salida; puede degradar ligeramente capacidades no relacionadas con el razonamiento.
- Riesgo de alucinación inherente a los modelos de 4B destilados: la destilación de un profesor mayor no garantiza fidelidad factual, especialmente en dominios fuera de matemáticas y STEM.
- No se documenta la longitud de contexto real, lo que impide planificar cargas con documentos largos sin verificación empírica.
- El soporte multimodal (tag `image-text-to-text`) no está descrito en la model card; conviene validarlo antes de asumir capacidades de visión.
- El modelo se publicó el 20 de noviembre de 2026 con 0 descargas y 0 likes, sin validación comunitaria; la evaluación de rechazos es del propio autor y no ha sido replicada de forma independiente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede contravenir políticas de plataformas y normativas sectoriales; se recomienda revisión legal.
- No hay información sobre sesgos específicos medidos ni sobre el proceso de alineación del modelo base más allá de la destilación.

## Enlaces

- Hugging Face: https://huggingface.co/johnzhang2134/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión 9B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Ajuste científico DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de decensura): https://heretic-project.org
