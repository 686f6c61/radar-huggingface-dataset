# protonx-models/vit5-pretrain-vks

## Resumen

El modelo `protonx-models/vit5-pretrain-vks` es un ajuste continuo de dominio (Domain-Adaptive Pretraining, DAPT) sobre el modelo base `VietAI/vit5-base`, realizado por el grupo ProtonX. Está especializado en textos legales del sector de la Fiscalía del Pueblo de Vietnam (Kiểm sát nhân dân), incluyendo decisiones, directrices, órdenes, circulares y tratados de asistencia judicial mutua. El objetivo es mejorar la capacidad del modelo para tareas de extracción de información en documentos legales vietnamitas, aunque no está fine-tuneado para ninguna tarea concreta; se entrega como un modelo de pretrain que requiere fine-tuning posterior.

Arquitectónicamente es un Transformer encoder-decoder estilo T5, con 225,9 millones de parámetros y una longitud de contexto de 1024 tokens. Se entrenó con el objetivo de span corruption (ruido 0.15, longitud media de span 3.0) sobre un corpus de unos 313 documentos legales, combinado con un dataset curado en vietnamita para evitar el olvido catastrófico. La licencia es MIT, lo que permite uso comercial sin restricciones. El modelo se publica en formato safetensors, con un tamaño de repositorio de 0,9 GB, y está diseñado para la generación de texto (text2text-generation).

La relevancia de este modelo radica en que aborda un dominio muy específico y con poca representación en los modelos preentrenados generales en vietnamita, lo que puede mejorar significativamente el rendimiento en tareas downstream del sector legal si se fine-tunea adecuadamente. Sin embargo, al ser una versión de pretrain, no está listo para producción directa y exige un paso de adaptación supervisada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (Transformer encoder-decoder) |
| Parámetros totales | 225.950.976 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens (según entrenamiento) |
| Tipos de cuantización | No disponible (solo safetensors en fp32, se puede convertir a cuantización posterior) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una continuación del pretraining de `VietAI/vit5-base`, que a su vez se basa en la arquitectura T5 original. La arquitectura es un Transformer encoder-decoder con atención completa, sin mecanismos de mezcla de expertos. El entrenamiento de este modelo se realizó con el objetivo de span corruption, con una densidad de ruido de 0,15, una longitud media de span de 3.0 tokens y una longitud de secuencia de 1024 tokens. El dataset de dominio consiste en aproximadamente 313 documentos legales del sector de la fiscalía vietnamita, obtenidos mediante OCR y sometidos a un preprocesamiento que incluye unir oraciones cortadas por saltos de página, eliminar sellos, encabezados de país y títulos, así como filtrar fragmentos con muchos tokens `<unk>` o con poca puntuación. Para mitigar el olvido catastrófico, se usó un dataset curado general en vietnamita (`VTSNLP/vietnamese_curated_dataset`) como replay. El entrenamiento duró 70 épocas con 4130 pasos globales, alcanzando una pérdida de evaluación final de 0.7053 (frente a la inicial de 5.4645). No se menciona el uso de RLHF ni de técnicas de fine-tuning supervisado.

## Capacidades

- Generación de texto a texto (text2text-generation) en vietnamita, con capacidad de completar secuencias y generar texto coherente.
- Adaptación al dominio legal vietnamés gracias al pretraining continuo, lo que mejora la representación de terminología jurídica y estructura de documentos.
- Capacidad de ser fine-tuneado para tareas específicas como extracción de entidades, resumen, clasificación o respuesta a preguntas sobre textos legales.
- Soporte de entrada y salida de texto plano, sin capacidades multimodales (visión, audio).
- No soporta tool calling ni agentes, ya que es un modelo puramente de lenguaje y no se ha entrenado con esas instrucciones.
- Multilingüe no; solo vietnamita (aunque el modelo base ViT5 también es monolingüe vietnamita).

## Casos de uso

- Extracción de entidades en documentos legales: tras un fine-tuning con datos etiquetados, el modelo puede identificar nombres de personas, instituciones, fechas, números de expediente, etc., en textos de decisiones o circulares.
- Resumen automático de documentos jurídicos: al ser un modelo de texto a texto, puede entrenarse para generar resúmenes de largas resoluciones o informes legales, reduciendo el tiempo de revisión manual.
- Clasificación de documentos legales: se puede fine-tunear para categorizar tipos de documento (decisión, directriz, circular, tratado) o su tema, útil para sistemas de gestión documental.
- Respuesta a preguntas sobre textos legales: con un dataset de preguntas y respuestas, el modelo puede responder consultas específicas sobre el contenido de un documento, por ejemplo, qué artículo se cita o qué obligación se establece.
- Normalización de texto OCR: gracias al preprocesamiento, el modelo puede ayudar a corregir errores de OCR en documentos legales escaneados, mejorando la calidad de los datos antes de otros análisis.
- Traducción o reformulación de lenguaje legal: aunque no es un traductor, puede fine-tunearse para simplificar el lenguaje jurídico o generar versiones más accesibles de los textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la eval_loss del entrenamiento (0.7053 al final), pero no se comparan con otros modelos ni se evalúan tareas downstream.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp32, el modelo pesa ~0,9 GB en parámetros, pero con activaciones y overhead se recomienda al menos 2 GB de VRAM. Con cuantización a 8 bits (posterior) se puede reducir a ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia, como una RTX 3050, RTX 3060, o una T4 en la nube. Para entrenamiento fine-tuning, se recomienda una GPU con 8-12 GB, como RTX 3080, RTX 4090, o A100.
- Es apto para GPU de consumo (consumer) desde las gamas bajas, aunque para entrenamiento se necesitará más memoria.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, vLLM, TGI (Text Generation Inference), u Ollama si se convierte a formato GGUF. La integración con `text-generation-inference` está etiquetada como compatible.
- Latencia y throughput: no disponible, pero por su tamaño (225M) se espera una inferencia rápida en GPUs modernas, con tiempos del orden de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|---|
| `protonx-models/vit5-pretrain-vks` | T5 | 225M | 1024 | MIT | Vietnamita, legal |
| `VietAI/vit5-base` | T5 | 220M | 1024 | MIT | Vietnamita general |
| `google/mt5-base` | T5 | 580M | 1024 | Apache-2.0 | Multilingüe (incluye vietnamita) |
| `VietAI/vit5-large` | T5 | 730M | 1024 | MIT | Vietnamita general |

La comparativa se basa en el modelo base (ViT5-base) y en mT5-base, que es la alternativa multilingüe. El modelo protonx está especializado en el dominio legal vietnamita, mientras que ViT5-base es general. mT5-base tiene más parámetros pero no está adaptado al dominio legal. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un modelo pretrain, no fine-tuneado para tareas concretas; su uso directo en producción sin adaptación dará resultados pobres en tareas específicas.
- El dominio de entrenamiento es muy estrecho (documentos de la Fiscalía vietnamita), por lo que puede no generalizar bien a otros tipos de texto legal o a otros países.
- La calidad del OCR de los documentos originales puede introducir errores residuales que el modelo puede amplificar en sus salidas.
- El contexto máximo es de 1024 tokens, lo que limita el procesamiento de documentos largos en una sola pasada.
- Riesgo de alucinaciones: como todo modelo generativo, puede inventar información si se usa sin control en tareas de generación libre.
- Licencia MIT permite uso comercial sin restricciones, pero no se garantiza la exactitud ni la idoneidad para fines legales; el uso en aplicaciones críticas requiere validación adicional.
- No soporta otros idiomas distintos del vietnamita.

## Enlaces

- HuggingFace: https://huggingface.co/protonx-models/vit5-pretrain-vks
- Repositorio GitHub de ViT5: https://github.com/vietai/ViT5
- Página del modelo base VietAI/vit5-base: https://huggingface.co/VietAI/vit5-base
- Página del proyecto ViT5 en VietAI: https://research.vietai.org/vit5/
- Organización ProtonX en HuggingFace: https://huggingface.co/protonx-models
