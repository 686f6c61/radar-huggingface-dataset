# aisingapore/SEA-LION-ModernBERT-600M

## Resumen

SEA-LION-ModernBERT-600M es un modelo de tipo encoder desarrollado por el AI Products Pillar de AI Singapore, integrado en la colección SEA-LION (Southeast Asian Languages In One Network), cuyo objetivo es ofrecer modelos de lenguaje de alta calidad para las lenguas del sudeste asiático. Este modelo concreto combina la arquitectura ModernBERT-large (encoder-only) con un tokenizer personalizado de Gemma 3, que cuenta con un vocabulario de 262.000 tokens, lo que permite una tokenización más eficiente y una mejor compresión de escrituras complejas como el jemer, lao, tailandés o birmano. Con 612 millones de parámetros y una ventana de contexto de 8.192 tokens, se preentrenó sobre 2 billones de tokens, seguido de una fase intermedia con 1 billón adicional, y posteriormente se ajustó con pares contrastivos (245 millones) y con datos de instrucción (8 millones de pares). Su licencia MIT lo hace especialmente atractivo para uso comercial y académico en la región.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder-only) |
| Parametros totales | 612.952.064 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (8k) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión FP32/FP16) |
| Idiomas soportados | Birmano, chino, inglés, filipino, indonesio, javanés, jemer, lao, malayo, sondanés, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo se construye sobre ModernBERT-large, una evolución de la arquitectura BERT que incorpora mejoras como atención global y local combinadas (global attention en capas específicas y local attention en el resto), eliminación de capas de normalización redundantes, y una implementación optimizada para entrenamiento e inferencia más rápida que BERT original. No es un modelo generativo, sino un encoder puro, por lo que no produce texto de forma autónoma sino representaciones vectoriales y predicciones de clasificación.

El entrenamiento se realizó en varias fases: pre-entrenamiento sobre 2 billones de tokens, seguido de una fase intermedia de 1 billón de tokens adicionales, cubriendo código y los 13 idiomas mencionados. Posteriormente se realizó un pre-entrenamiento contrastivo con 245 millones de pares de texto (inglés-inglés e inglés-lenguas del sudeste asiático) para mejorar la alineación cross-lingüística, y finalmente un ajuste fino con 8 millones de pares de datos diversos (EN-EN, CN-CN, EN-SEA y SEA-SEA) para obtener la versión final instruida. El tokenizer empleado es el de Gemma 3, adaptado con un vocabulario de 262K tokens, lo que mejora la fertilidad de tokenización en scripts regionales y reduce el número de tokens necesarios para representar textos largos.

## Capacidades

- Fill-mask: completa palabras enmascaradas en contextos multilingües.
- Clasificación de texto: análisis de sentimiento, categorización de documentos, detección de spam, etc., mediante fine-tuning.
- Extracción de características: produce representaciones vectoriales (embeddings) de frases y documentos para tareas de similitud semántica.
- Búsqueda semántica: soporta recuperación de información en corpus multilingües, especialmente en lenguas del sudeste asiático.
- Fine-tuning para tareas downstream: puede adaptarse a NER, respuesta a preguntas extractivas, o clasificación de intenciones.
- Multilingüismo: cubre 13 lenguas, incluyendo varias con escrituras no latinas (birmano, jemer, lao, tailandés, tamil, chino).
- No generativo: no es capaz de generar texto libre; es un encoder puro.
- No soporta tool calling ni agentes: su arquitectura encoder no está diseñada para tareas de razonamiento multi-paso o interacción con herramientas.

## Casos de uso

- **Recuperación aumentada por generación (RAG)**: el modelo puede generar embeddings de alta calidad para documentos en lenguas como tailandés, vietnamita o indonesio, permitiendo construir sistemas de búsqueda semántica y respuesta a preguntas sobre corpus regionales. Su tokenizer eficiente reduce el coste computacional al procesar textos largos.
- **Clasificación de sentimiento en redes sociales**: con fine-tuning, se puede adaptar para analizar opiniones en javanés, sundanés, malayo o tagalo, idiomas donde los modelos genéricos suelen fallar por falta de datos de entrenamiento.
- **Análisis de documentos legales y administrativos**: el modelo puede procesar textos en tailandés, vietnamita o chino para extraer entidades, clasificar cláusulas o detectar información sensible, gracias a su capacidad de fine-tuning en tareas de NER y clasificación.
- **Búsqueda semántica en catálogos multilingües**: en plataformas de comercio electrónico que operan en varios países del sudeste asiático, se puede utilizar para indexar productos y consultas en múltiples idiomas, mejorando la relevancia de los resultados sin necesidad de traducción previa.
- **Filtrado de contenido en redes sociales**: el modelo puede adaptarse para detectar contenido tóxico, spam o discursos de odio en lenguas minoritarias como el jemer o el lao, donde los filtros automáticos suelen fallar.
- **Sistemas de preguntas y respuestas extractivas**: tras un fine-tuning con datasets QA regionales, puede extraer respuestas de documentos en idiomas como el indonesio o el tailandés, útil para asistentes virtuales de atención al cliente.
- **Generación de embeddings para bases de datos vectoriales**: se integra fácilmente en pipelines de RAG o sistemas de recomendación que necesitan representaciones de alta calidad para textos en lenguas de la región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas comparativas con MMLU, HumanEval u otras métricas estándar, ni datos de rendimiento frente a modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 612M de parámetros, en FP32 se necesitan ~2,45 GB, en FP16/BF16 ~1,2 GB, y con cuantización de 4 bits (si se convierte) ~0,3 GB. No hay cuantizaciones oficiales publicadas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para FP16. Para entrenamiento o fine-tuning, una RTX 3060 (12 GB) o A10G son adecuadas. Para inferencia en CPU, es viable aunque más lento.
- **Compatibilidad con GPUs de consumo**: sí, cabe en tarjetas de gama media como RTX 3060, RTX 4060 o incluso en Mac con Apple Silicon mediante PyTorch MPS.
- **Opciones de despliegue**: se puede ejecutar con Transformers (pipeline de fill-mask o extracción de embeddings), ONNX Runtime, y puede exportarse a TorchScript. No hay soporte nativo en vLLM o llama.cpp por ser un encoder, pero puede usarse con servidores de embeddings como Sentence-Transformers.
- **Latencia y throughput**: no se dispone de datos oficiales. Para un modelo de 600M en una GPU moderna, la latencia de inferencia por secuencia de 512 tokens suele estar en el orden de decenas de milisegundos, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEA-LION-ModernBERT-600M | 612M | 8.192 | 13 lenguas (SEA + chino + inglés) | MIT | HuggingFace |
| ModernBERT-large | ~300M | 8.192 | Principalmente inglés, multilingüe limitado | Apache 2.0 | HuggingFace |
| BERT-large | 340M | 512 | Inglés (principalmente) | Apache 2.0 | HuggingFace |
| XLM-RoBERTa-large | 560M | 512 | 100 lenguas | MIT | HuggingFace |

El modelo de AI Singapore se diferencia por su enfoque específico en lenguas del sudeste asiático, con un tokenizer optimizado para escrituras complejas y un contexto mayor que BERT. XLM-RoBERTa-large cubre más idiomas pero con una ventana de contexto menor y sin la eficiencia de tokenización para scripts regionales. ModernBERT, al ser la base, ofrece mejor rendimiento por parámetro, pero no está entrenado para las lenguas SEA.

## Limitaciones y advertencias

- **No probado contra uso adversario**: el autor indica que el modelo no ha sido evaluado para robustez frente a ataques o entradas malintencionadas, por lo que no debe usarse en sistemas de seguridad críticos sin validación adicional.
- **Posibles sesgos lingüísticos**: aunque se entrenó en 13 lenguas, la distribución de datos puede estar desbalanceada, lo que puede generar un rendimiento inferior en idiomas con menos representación (por ejemplo, sondanés o jemer frente a indonesio o tailandés).
- **Riesgo de alucinación en clasificación**: al ser un encoder, no genera texto, pero sí puede producir predicciones erróneas en tareas de clasificación si los datos de fine-tuning son insuficientes.
- **Limitaciones de contexto**: la ventana de 8K tokens es útil, pero puede ser insuficiente para documentos legales o técnicos muy largos sin segmentación previa.
- **Sin soporte de generación**: no es un modelo generativo, por lo que no se puede usar para chatbots o escritura de texto libre.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el usuario es responsable de cumplir con las regulaciones locales sobre datos y privacidad.
- **Formato de pesos**: solo se publican pesos en safetensors para PyTorch; no se incluyen cuantizaciones oficiales, por lo que la conversión a otros formatos (GGUF, ONNX) requiere herramientas externas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M)
- [Colección SEA-LION ModernBERT y Embeddings](https://huggingface.co/collections/aisingapore/sea-lion-modernbert-and-embedding)
- [Variante de embeddings fine-tuned](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
- [Checkpoints del modelo](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M-checkpoints)
- [Paper de ModernBERT (arXiv 2508.12243)](https://arxiv.org/abs/2508.12243)
