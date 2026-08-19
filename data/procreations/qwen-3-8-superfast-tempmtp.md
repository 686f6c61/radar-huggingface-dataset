# ProCreations/Qwen-3.8-SuperFast-TempMTP

## Resumen

Qwen-3.8-SuperFast-TempMTP es una variante experimental del modelo ProCreations/Qwen-3.8-SuperFast, diseñada específicamente para mejorar la velocidad de decodificación mediante decodificación especulativa con un cabezal MTP (Multi-Token Prediction) entrenado con un objetivo de temperatura. El modelo base, Qwen-3.8-SuperFast, es una versión de 27.8 mil millones de parámetros de la serie Qwen3.8, construida sobre la arquitectura Qwen3.5, con soporte para entrada de imagen y texto (image-text-to-text) y una ventana de contexto de 262.144 tokens según las especificaciones de la serie. Este checkpoint solo modifica los 15 tensores `mtp.*` del cabezal de propuesta, dejando congelados el modelo objetivo, la tabla de embeddings y la cabeza de salida. El objetivo es aumentar la tasa de aceptación de tokens especulativos y, por tanto, el throughput en entornos de inferencia con decodificación especulativa, sin alterar la calidad del modelo final.

La relevancia de este modelo radica en que aborda uno de los cuellos de botella de la inferencia de modelos grandes: la latencia por token. Al mejorar la calidad de las propuestas del cabezal MTP, se reduce el número de pasos de verificación necesarios y se acelera la generación. El entrenamiento se realizó sobre el dataset HuggingFaceH4/ultrachat_200k (split train_sft) con un objetivo combinado de entropía cruzada con etiquetas duras, divergencia KL entre profesor y borrador a temperaturas 0.7 y 1.0, y distancia de variación total (TV) a esas mismas temperaturas. El checkpoint óptimo se seleccionó en conversaciones de validación y el informe de entrenamiento está disponible en el repositorio. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, con cabezal MTP para decodificacion especulativa) |
| Parametros totales | 27.781.427.952 (~27.8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la ficha; el modelo base Qwen3.8-27B soporta 262.144 tokens |
| Tipos de cuantizacion | no especificados; los pesos se distribuyen en safetensors (presumiblemente BF16/FP16) |
| Idiomas soportados | no disponibles (el modelo base Qwen3.8 soporta multiples idiomas, pero no se detalla para esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso basado en Qwen3.5, con una novedad destacada: incorpora un cabezal MTP (Multi-Token Prediction) de una sola capa que actúa como propuesta en un esquema de decodificación especulativa. Este cabezal, inicializado desde el checkpoint base, se entrenó con el modelo objetivo congelado. El objetivo de entrenamiento combina tres términos: entropía cruzada con etiquetas duras, divergencia KL entre las distribuciones del profesor y del borrador a temperaturas 0.7 y 1.0, y distancia de variación total (TV) a esas mismas temperaturas. La inclusión del término TV es clave, ya que `1 - TV(target, draft)` representa la probabilidad de aceptación ideal para un token especulativo antes de considerar la sobrecarga de implementación. El entrenamiento usa distribuciones de vocabulario completas, sin destilación top-k, y se realizó sobre el dataset `HuggingFaceH4/ultrachat_200k` (split `train_sft`). El mejor checkpoint se seleccionó en conversaciones de validación, alcanzando una mejora estimada de +0.141250 en la tasa de aceptación en datos de validación. Solo se entrenaron exactamente 15 tensores `mtp.*`, con 0 parámetros entrenables en el modelo objetivo.

## Capacidades

- Generación de texto autoregresiva con soporte de decodificación especulativa mediante cabezal MTP.
- Entrada multimodal: el modelo base acepta imágenes y texto (image-text-to-text), aunque esta variante no modifica las capacidades del modelo objetivo.
- Razonamiento y conversación multi-turno, heredados del modelo base Qwen-3.8-SuperFast.
- Capacidades de tool calling y agentes: no se especifican para esta variante, pero el modelo base Qwen3.8 está diseñado para tareas agénticas de largo horizonte.
- Soporte de contexto largo: el modelo base soporta 262.144 tokens, lo que permite manejar documentos extensos y conversaciones prolongadas.
- Multilingüismo: no se detalla para esta variante, pero el modelo base Qwen3.8 soporta múltiples idiomas.

## Casos de uso

- Inferencia de alto rendimiento en producción: el cabezal MTP entrenado con temperatura permite reducir la latencia por token en servidores de inferencia que soporten decodificación especulativa (por ejemplo, SGLang o vLLM). Es adecuado para aplicaciones donde la velocidad de respuesta es crítica, como chatbots en tiempo real o asistentes de código.
- Despliegue en entornos con recursos limitados: al acelerar la generación sin necesidad de reducir el tamaño del modelo, permite servir un modelo de 27B con menor latencia percibida en GPUs de gama media, siempre que se use cuantización adecuada.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto del entrenamiento con temperatura en la tasa de aceptación de tokens MTP, comparando con el cabezal nativo del modelo base.
- Sistemas de agentes autónomos: la mayor velocidad de generación permite que agentes multi-paso completen tareas más rápido, especialmente en pipelines que requieren múltiples llamadas al modelo.
- Generación de código en IDE y herramientas de desarrollo: la baja latencia mejora la experiencia de autocompletado y sugerencias en tiempo real.
- Procesamiento de documentos largos: con el contexto de 262k tokens del modelo base, puede resumir o analizar libros técnicos, informes extensos o conversaciones largas, beneficiándose de la aceleración especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mejora estimada en la tasa de aceptación en datos de validación es de +0.141250, pero no se proporcionan métricas de calidad del modelo (como MMLU, HumanEval, GSM8K) ni mediciones de throughput end-to-end. El autor señala que el throughput con SGLang está pendiente de publicación hasta que se genere el artefacto de benchmark correspondiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.8B parámetros, en BF16 se necesitan aproximadamente 55.6 GB de VRAM (27.8 × 2 bytes). Con cuantización INT8 (~27.8 GB) o INT4 (~13.9 GB) se reduce significativamente.
- GPUs recomendadas: para BF16 sin cuantizar, se requieren GPUs con al menos 60 GB de VRAM, como A100 80GB, H100 80GB o A6000 48GB (con cuantización). Para consumer, una RTX 4090 (24 GB) solo puede ejecutar el modelo con cuantización INT4, y una RTX 3090 (24 GB) similar.
- Opciones de despliegue: el modelo es compatible con transformers y se puede servir con vLLM o SGLang (este último mencionado explícitamente en la model card para medir throughput). También se puede usar con llama.cpp para cuantización GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones end-to-end para esta variante. La ganancia esperada es una mayor tasa de aceptación de tokens especulativos, lo que debería reducir el número de pasos de verificación y aumentar el throughput, pero depende del hardware, el motor de inferencia y los parámetros de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ProCreations/Qwen-3.8-SuperFast (base) | ~27.8B | 262k (presumible) | Apache-2.0 | Modelo base sin cabezal MTP entrenado con temperatura |
| Qwen3.8-27B (original de QwenLM) | ~27B | 262k | Apache-2.0 | Modelo base de la serie Qwen3.8, con vision encoder y benchmarks publicados |
| ProCreations/Qwen-3.8-SuperFast-TempMTP | ~27.8B | no especificado (hereda del base) | Apache-2.0 | Variante experimental con MTP entrenado con temperatura |

La comparativa directa con otros modelos de la misma categoría (por ejemplo, Llama 3.1 70B o Mistral Large) no es posible sin datos de benchmarks. La principal diferencia de esta variante es su enfoque en la velocidad de decodificación especulativa, no en la calidad del modelo final.

## Limitaciones y advertencias

- La model card advierte explícitamente que este checkpoint es un experimento de velocidad, no una afirmación de que la ejecución especulativa sea bit a bit idéntica a la ejecución serial. Para casos que requieran ejecución determinista, se debe usar decodificación serial con el modelo objetivo.
- El entrenamiento solo se realizó sobre el dataset `ultrachat_200k` (conversaciones), por lo que el cabezal MTP puede no generalizar bien a otros dominios (por ejemplo, código o matemáticas) en términos de tasa de aceptación.
- No se han publicado evaluaciones de calidad del modelo final (MMLU, HumanEval, etc.), por lo que no se puede confirmar que la variante mantenga el mismo rendimiento que el modelo base en tareas estándar.
- El modelo hereda las limitaciones del modelo base Qwen3.8, incluidos posibles sesgos en los datos de entrenamiento y riesgo de alucinación.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las restricciones adicionales del modelo base si las hubiera (la model card indica que hereda las limitaciones de uso del base).
- No se proporcionan archivos de cuantización (GGUF, AWQ, GPTQ) en el repositorio; el usuario debe generarlos o usar los pesos safetensors directamente.

## Enlaces

- HuggingFace: https://huggingface.co/ProCreations/Qwen-3.8-SuperFast-TempMTP
- Modelo base: https://huggingface.co/ProCreations/Qwen-3.8-SuperFast
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Artículo de openlm.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Especificaciones y requisitos de Qwen3.8 27B (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página oficial de Qwen: https://qwen.ai/home
