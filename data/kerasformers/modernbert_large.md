# kerasformers/modernbert_large

## Resumen

`kerasformers/modernbert_large` es una conversión pura en Keras 3 del modelo `answerdotai/ModernBERT-large`, desarrollado por Answer.AI y LightOn. ModernBERT es un transformer encoder bidireccional modernizado que incorpora mejoras arquitectónicas como rotary position embeddings, atención alternada entre capas globales y locales con ventana deslizante, feed-forwards GeGLU y pre-LayerNorm. Este checkpoint concreto, publicado por el equipo de KerasFormers, permite ejecutar el mismo modelo de forma idéntica en TensorFlow, PyTorch o JAX mediante el backend de Keras 3, lo que facilita su integración en entornos multi-framework.

El modelo está diseñado para tareas de comprensión de lenguaje (fill-mask, clasificación, extracción de información) y ofrece una ventana de contexto de 8192 tokens, significativamente mayor que la de encoders clásicos como BERT (512 tokens). Su relevancia radica en que combina las ventajas de los encoders bidireccionales con técnicas modernas de atención eficiente, manteniendo un tamaño moderado (28 capas, dimensión de embedding 1024) y una licencia Apache 2.0 que permite uso comercial sin restricciones. Al ser una conversión de Keras, no requiere dependencias de PyTorch o TensorFlow específicas, aunque puede ejecutarse sobre cualquiera de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT) con atención global/local alternada, rotary embeddings, GeGLU y pre-LayerNorm |
| Parametros totales | no disponible (el repo ocupa 1.8 GB; el modelo original tiene aproximadamente 395M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponibles (conversión Keras; se puede cuantizar posteriormente) |
| Idiomas soportados | no disponibles (el modelo original es principalmente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras (`.keras` o pesos serializados); compatible con safetensors del upstream mediante prefijo `hf:` |

## Arquitectura y entrenamiento

ModernBERT es un encoder bidireccional que actualiza la arquitectura clásica de BERT con varias innovaciones: utiliza rotary position embeddings en lugar de embeddings posicionales aprendidos, alterna entre capas de atención global (full) y capas de atención local con ventana deslizante (sliding window) para reducir el coste computacional, emplea feed-forwards GeGLU en lugar de los clásicos GELU, y aplica pre-LayerNorm. El tokenizer es un BPE a nivel de byte, con el token de máscara `[MASK]` y sin token-type ids. El modelo fue preentrenado con un objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus extenso de texto en inglés, aunque los detalles exactos del dataset no se especifican en la información disponible. Esta conversión a Keras 3 no modifica los pesos originales; simplemente los reempaqueta para que la misma implementación pueda ejecutarse en TensorFlow, Torch o JAX.

## Capacidades

- Generación de representaciones contextuales de texto de alta calidad para tareas de comprensión (encoder puro, no generativo).
- Fill-mask: predicción de tokens enmascarados, útil para evaluación y fine-tuning.
- Clasificación de secuencias y de tokens (mediante fine-tuning con cabezales adicionales).
- Extracción de respuestas en tareas de question answering (QA) con fine-tuning.
- Soporte de contexto largo de hasta 8192 tokens, adecuado para documentos extensos o retrieval.
- No soporta tool calling, agentes ni generación autoregresiva, al ser un encoder bidireccional.
- Capacidades multilingües limitadas; el modelo original está entrenado principalmente en inglés.

## Casos de uso

- Búsqueda semántica y retrieval: al generar embeddings de documentos completos (hasta 8192 tokens), puede indexar y recuperar información en corpus largos, superando las limitaciones de BERT en documentos extensos.
- Clasificación de textos largos: análisis de sentimiento, categorización de artículos o detección de spam en entradas que exceden los 512 tokens típicos de otros encoders.
- Extracción de entidades y etiquetado de secuencias: fine-tuning para reconocimiento de entidades nombradas (NER) en dominios específicos, aprovechando la atención local para capturar patrones locales y global.
- Sistemas de question answering sobre documentos: dado un pasaje largo, el modelo puede localizar y extraer respuestas, gracias a su contexto amplio.
- Reranking en pipelines de retrieval aumentado (RAG): como encoder cross-encoder, puede puntuar la relevancia de pares pregunta-documento con mayor precisión que modelos de menor contexto.
- Fine-tuning en entornos multi-framework: al ser Keras 3, puede entrenarse en JAX para aprovechar la compilación XLA o en TensorFlow para entornos ya establecidos, sin cambiar el código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión concreta. El modelo original `answerdotai/ModernBERT-large` reporta mejoras sobre BERT-large y RoBERTa-large en tareas de GLUE y retrieval, pero esos datos no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: basado en el tamaño del repo (1.8 GB) y la arquitectura (~395M parámetros), en FP16 se requieren aproximadamente 800 MB solo para los pesos, más overhead de activaciones y atención. Con cuantización a int8, la huella se reduce a ~400 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16 (p. ej., NVIDIA GTX 1650, RTX 3050). Para fine-tuning, se recomienda al menos 8 GB (RTX 3070, A10).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: al ser Keras 3, puede servirse con TensorFlow Serving, o exportarse a ONNX para usar con ONNX Runtime. También es posible cargarlo en vLLM si se convierte a formato compatible, aunque no es el flujo estándar para encoders.
- Latencia y throughput: no se proporcionan datos oficiales; depende del hardware y del backend (JAX suele ofrecer mejor rendimiento en GPUs).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Framework | Notas |
|---|---|---|---|---|---|
| kerasformers/modernbert_large | ~395M (no confirmado) | 8192 | Apache 2.0 | Keras 3 (TF/Torch/JAX) | Conversión de ModernBERT-large |
| answerdotai/ModernBERT-large | ~395M | 8192 | Apache 2.0 | PyTorch | Modelo original, con pesos safetensors |
| bert-large-uncased | 340M | 512 | Apache 2.0 | PyTorch/TF | Encoder clásico, contexto corto |
| roberta-large | 355M | 512 | MIT | PyTorch/TF | Encoder robusto, contexto corto |

La principal ventaja frente a BERT/RoBERTa es el contexto 16 veces mayor y las mejoras arquitectónicas. Frente al modelo original, esta versión ofrece portabilidad entre frameworks sin cambiar el código.

## Limitaciones y advertencias

- Es un encoder, no un modelo generativo: no puede producir texto libre ni mantener conversaciones.
- No se han publicado datos de sesgos o alucinaciones específicos de esta conversión; el modelo original puede reflejar sesgos presentes en sus datos de entrenamiento.
- El contexto de 8192 tokens es amplio pero no infinito; documentos más largos requieren truncamiento o estrategias de ventana.
- Los idiomas soportados no están documentados; se asume principalmente inglés, por lo que su rendimiento en otros idiomas puede ser limitado.
- Al ser una conversión de Keras, es necesario configurar `KERAS_BACKEND` antes de importar, y el ecosistema de herramientas de Hugging Face (como pipelines) no es directamente compatible sin adaptaciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/modernbert_large
- Modelo original (Answer.AI): https://huggingface.co/answerdotai/ModernBERT-large
- GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de ModernBERT en KerasFormers: https://imvision12.github.io/KerasFormers/modernbert/
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Modelo instruct (fine-tuned): https://huggingface.co/answerdotai/ModernBERT-Large-Instruct
