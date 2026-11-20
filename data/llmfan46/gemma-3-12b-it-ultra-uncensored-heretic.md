# llmfan46/gemma-3-12b-it-ultra-uncensored-heretic

## Resumen

`llmfan46/gemma-3-12b-it-ultra-uncensored-heretic` es una versión "decensurada" del modelo multimodal `google/gemma-3-12b-it` de Google DeepMind, publicada por el contribuidor independiente llmfan46. El proceso de modificación se ha realizado con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), una técnica de "abliteration" que identifica y proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo, reduciendo así la tasa de negativas del modelo sin reentrenar los pesos desde cero.

El modelo base Gemma 3 12B es un transformer multimodal (texto e imagen) con 12.187.325.040 parámetros, ventana de contexto de 128.000 tokens para la entrada y 8.192 tokens de salida, y soporte declarado de más de 140 idiomas. Esta variante conserva esa arquitectura y capacidades, pero modifica las activaciones internas para minimizar las respuestas de rechazo, con un coste medido de divergencia KL de 0,0131 respecto al original.

Su relevancia es doble: por un lado, ilustra el estado actual de las técnicas de modificación post-entrenamiento (abliteration de rango arbitrario, con métricas explícitas de rechazo y divergencia); por otro, plantea cuestiones prácticas y legales relevantes, ya que la licencia Gemma impone restricciones de uso y la eliminación de salvaguardas puede chocar con las políticas de uso aceptable del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), familia Gemma 3 |
| Parámetros totales | 12.187.325.040 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens de entrada; 8.192 tokens de salida |
| Tipos de cuantización | GGUF disponible en repositorio aparte; safetensors en bf16/fp16 en el repo principal (no se detallan otros formatos) |
| Idiomas soportados | Más de 140 idiomas según la model card de Gemma 3; el repo no declara lista propia |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |
| Pipeline | image-text-to-text |
| Resolución de imagen | 896 x 896, codificada en 256 tokens por imagen |
| Librería mínima | transformers >= 4.50.0 |
| Tamaño del repo | 24,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B: un transformer decoder-only multimodal que procesa texto e imágenes, donde cada imagen se normaliza a 896x896 y se codifica en 256 tokens, con un contexto total de 128K tokens para las variantes de 4B, 12B y 27B. El modelo original fue entrenado por Google DeepMind a partir de la misma investigación y tecnología que los modelos Gemini, e incluye una variante instruction-tuned con datos de ajuste conversacional; la model card de Gemma 3 no detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación de esta variante no consiste en un fine-tuning adicional, sino en una ablación de direcciones en el espacio de activaciones aplicada con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros declarados por el autor son: `start_layer_index` 0, `end_layer_index` 41, `preserve_good_behavior_weight` 0,8685, `steer_bad_behavior_weight` 0,0013, `overcorrect_relative_weight` 0,9260 y `neighbor_count` 1. El resultado medido es una divergencia KL de 0,0131 frente al modelo original y una reducción de rechazos de 97/100 a 4/100 en el conjunto de evaluación del autor.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Razonamiento y respuesta a preguntas sobre documentos largos gracias a los 128K tokens de contexto.
- Resumen de textos y documentos extensos.
- Generación y explicación de código, además de matemáticas a nivel conversacional (capacidades heredadas del modelo base, sin benchmarks específicos publicados para esta variante).
- Soporte multilingüe amplio (más de 140 idiomas según la model card de Gemma 3).
- Reducción drástica de respuestas de rechazo, objeción o "lecturing" en comparación con el modelo original (4/100 frentes a 97/100 según la métrica del autor).
- Integración con `transformers` mediante `pipeline("image-text-to-text")` y `Gemma3ForConditionalGeneration`.
- Compatibilidad declarada con endpoints y text-generation-inference (tags del repo).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cómo la ablación de direcciones afecta a la tasa de rechazos y a la coherencia, usando la divergencia KL de 0,0131 como referencia cuantitativa.
- Análisis de contenido sensible en entornos de investigación: permite estudiar respuestas del modelo ante prompts que el original rechazaría, dentro de un marco de evaluación ética y con supervisión humana.
- Procesamiento de documentos largos con imágenes: informes escaneados, contratos o artículos con figuras, aprovechando los 128K tokens de contexto y la codificación de imágenes en 256 tokens.
- Asistente conversacional especializado en dominio creativo o de ficción: la menor tasa de rechazos facilita narrativa, guiones o diálogos con temáticas adultas dentro de los límites legales aplicables.
- Prototipado de pipelines multimodales en local: con cuantizaciones GGUF puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas de concepto de OCR, captioning o VQA.
- Evaluación comparativa de técnicas de abliteration: útil para reproducir experimentos con Heretic y comparar ARA frente a otros métodos de eliminación de direcciones.
- Generación de código y explicaciones técnicas en entornos internos donde se prefiera un modelo autoalojado con contexto largo.

## Benchmarks y rendimiento

| Métrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0131 | 0 (por definición) |
| Rechazos | 4/100 | 97/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible para esta variante. Las únicas métricas publicadas son las de la tabla anterior, correspondientes al proceso de abliteration.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 24-25 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32 GB de VRAM para contexto moderado y 48-80 GB para contextos largos.
- Cuantización GGUF: las versiones Q4_K_M o Q5_K_M del repositorio GGUF permiten reducir el peso a aproximadamente 7-9 GB, haciéndolo viable en GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto corto o cuantizaciones de 8 bits; RTX 3090/4080 con GGUF Q4/Q5.
- Cabe en GPU de consumo: sí, mediante cuantización GGUF (por ejemplo, RTX 3060 12 GB con Q4 y contexto reducido, o RTX 4090 con Q5/Q6).
- Opciones de despliegue: transformers (>= 4.50.0), llama.cpp/Ollama vía GGUF, text-generation-inference (tag declarado), vLLM (soporte de Gemma 3 sujeto a la versión), y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-3-12b-it-ultra-uncensored-heretic (este) | 12,19B | 128K entrada / 8K salida | Sí (texto + imagen) | Gemma | Abliteration con Heretic/ARA; 4/100 rechazos; KL 0,0131 |
| google/gemma-3-12b-it | 12,19B | 128K entrada / 8K salida | Sí (texto + imagen) | Gemma | Modelo original; 97/100 rechazos; referencia de calidad |
| Otras variantes abliterated de Gemma 3 12B | ~12,19B | 128K entrada / 8K salida | Sí | Gemma | Métodos y métricas variables; no disponibles en esta búsqueda |
| Modelos multimodales densos de tamaño similar (p. ej., familia Qwen2.5-VL 7B/32B) | 7B-32B | Variable | Sí | Apache 2.0 / otras | No se dispone de comparación de rendimiento publicada para esta variante |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada que permitan una comparación cuantitativa de calidad frente a alternativas.

## Limitaciones y advertencias

- La eliminación de salvaguardas puede facilitar la generación de contenido dañino, ofensivo o inexacto; no se recomienda su uso en producción orientada a usuarios finales sin filtros adicionales.
- La divergencia KL de 0,0131 indica un cambio no nulo en la distribución de salida; puede haber degradación sutil de coherencia, razonamiento o calidad en tareas complejas, no cuantificada con benchmarks estándar.
- Riesgo de alucinación inherente al modelo base, no mitigado por la abliteration.
- La licencia Gemma impone restricciones de uso, incluida la política de uso prohibido de Google; la modificación de salvaguardas puede entrar en conflicto con dichos términos y con la responsabilidad del desplegador.
- El repositorio no declara lista propia de idiomas; el soporte multilingüe se hereda de Gemma 3 (más de 140 idiomas) sin verificación específica tras la ablación.
- No hay datos publicados de rendimiento en benchmarks estándar para esta variante, por lo que la comparación con el original en tareas reales es incierta.
- El autor advierte de que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad o mantenimiento futuro del repositorio.
- El modelo se publica como contribución independiente, sin auditoría externa ni garantías de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-3-12b-it-ultra-uncensored-heretic
- Versión GGUF: https://huggingface.co/llmfan46/gemma-3-12b-it-ultra-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Página de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: https://ai.google.dev/gemma/docs/core (referencia [g3-tech-report] de la model card)
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Ko-fi del autor: https://ko-fi.com/llmfan46
