# HoangQuocViet25/nlp-btl-wikilingua-b

## Resumen

El modelo `HoangQuocViet25/nlp-btl-wikilingua-b` es un sistema de resumen abstractivo de textos en vietnamita, desarrollado por el usuario HoangQuocViet25 como parte de un proyecto académico (posiblemente un trabajo de fin de grado o similar). Se basa en el modelo `VietAI/vit5-base`, una adaptación de la arquitectura T5 al vietnamita, y se ha ajustado (fine-tuning) sobre el dataset `huy-nh-2000/wikilingua`, una versión del corpus multilingüe WikiLingua que contiene pares de artículos y resúmenes extraídos de WikiHow.

Con aproximadamente 226 millones de parámetros, es un modelo de tamaño medio-bajo, adecuado para tareas de generación de resúmenes en vietnamita con requisitos de hardware modestos. Su relevancia radica en que cubre un idioma con pocos recursos específicos para resumen automático, ofreciendo una alternativa de código abierto con licencia MIT. La arquitectura encoder-decoder de T5 permite generar resúmenes abstractivos (no extractivos) con control de longitud y estilo mediante parámetros de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basado en ViT5-base |
| Parametros totales | 225.950.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 o 1024 tokens, segun ViT5-base) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original, un transformer encoder-decoder con atención completa. ViT5-base, el modelo base, fue preentrenado por VietAI sobre un corpus masivo de texto vietnamita, adaptando el tokenizer y el vocabulario al idioma. El fine-tuning se realizó sobre el dataset WikiLingua, que contiene pares de artículos y resúmenes en vietnamita extraídos de WikiHow. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El proceso de ajuste es estándar para tareas de resumen: se entrena el modelo para generar el resumen dado el artículo, con pérdida de entropía cruzada.

## Capacidades

- Generación de resúmenes abstractivos en vietnamita, con capacidad de parafrasear y condensar información.
- Generación de texto condicionada: puede producir resúmenes de longitud variable mediante parámetros como `max_new_tokens` y `length_penalty`.
- Soporte de entrada de texto largo (hasta el límite de contexto del modelo, probablemente 1024 tokens según el ejemplo de uso).
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Multilingüismo limitado: solo vietnamita, aunque al derivar de T5 podría procesar otros idiomas con menor calidad, no está optimizado para ello.

## Casos de uso

- Resumen de noticias en vietnamita: un medio de comunicación puede integrar el modelo para generar titulares o resúmenes automáticos de artículos, reduciendo el trabajo manual de redacción.
- Resumen de documentos legales o administrativos: abogados o gestores pueden condensar contratos o informes extensos en vietnamita para una revisión rápida.
- Resumen de artículos de Wikipedia o WikiHow: dado que el modelo se entrenó con este tipo de contenido, es especialmente adecuado para resumir guías y tutoriales en vietnamita.
- Asistente de lectura para estudiantes: una aplicación educativa puede ofrecer resúmenes de textos académicos en vietnamita para facilitar el estudio.
- Preprocesamiento para sistemas de búsqueda: indexar resúmenes generados en lugar de documentos completos puede mejorar la eficiencia de motores de búsqueda en vietnamita.
- Generación de descripciones cortas para productos o servicios: en comercio electrónico, el modelo puede crear resúmenes de características a partir de descripciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de resumen (ROUGE, BLEU) para este modelo. Se recomienda evaluar con el conjunto de validación de WikiLingua vietnamita si se necesita una comparación objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~226M parámetros, en FP32 ocupa ~900 MB, en FP16 ~450 MB, y en int8 ~225 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para textos cortos.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con TGI (Text Generation Inference) o vLLM, aunque al ser un modelo pequeño no requiere infraestructura especial. También se puede exportar a ONNX o convertir a GGUF para ejecución en llama.cpp u Ollama, aunque no hay conversiones oficiales publicadas.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna, se espera una latencia de decenas de milisegundos por resumen de 256 tokens, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| HoangQuocViet25/nlp-btl-wikilingua-b | 226M | no disponible | vietnamita | MIT | Fine-tune de ViT5-base para resumen |
| VietAI/vit5-base | ~226M | 512 (probable) | vietnamita | MIT | Modelo base, no especializado en resumen |
| google/mt5-base | ~580M | 512 | multilingue (incluye vi) | Apache-2.0 | Puede resumir en vietnamita, pero con menor calidad que un modelo específico |

No se dispone de comparativas de rendimiento publicadas. La ventaja del modelo evaluado es su especialización en resumen vietnamita, mientras que mT5 es más general pero menos preciso en este idioma.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con contenido de WikiHow, puede reflejar sesgos presentes en ese corpus (estilo instructivo, temas limitados a guías prácticas).
- Riesgo de alucinación: como todo modelo generativo, puede producir información no presente en el texto original, especialmente con contextos largos o ambiguos.
- Limitaciones de contexto: la longitud máxima de entrada probablemente es de 1024 tokens (según el ejemplo de uso), lo que impide resumir documentos muy extensos sin truncamiento.
- Idioma: solo está optimizado para vietnamita; su rendimiento en otros idiomas es impredecible.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo base ViT5 también es MIT, por lo que no hay restricciones adicionales.
- Para producción, se recomienda validar la calidad de los resúmenes en el dominio específico y considerar un umbral de confianza o revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoangQuocViet25/nlp-btl-wikilingua-b
- Dataset WikiLingua (versión original): https://huggingface.co/datasets/wiki_lingua
- Dataset usado (huy-nh-2000/wikilingua): https://huggingface.co/datasets/huy-nh-2000/wikilingua
- Repositorio de proyecto relacionado (BTL_NLP): https://github.com/AIVIETNAM-AIO-tlee/BTL_NLP
- Modelo base ViT5: https://huggingface.co/VietAI/vit5-base
