# ania3000/ossbert-lemm-v2-1

## Resumen

El modelo `ania3000/ossbert-lemm-v2-1` es un fine-tune de tipo token-classification basado en el modelo `AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs`, un BERT preentrenado sobre el corpus nacional osetio. El objetivo del fine-tune es la lematización de palabras en osetio, una lengua irania hablada en el Cáucaso. El modelo fue entrenado durante 16 épocas con una pérdida final de validación de 0.1022 y una precisión de lemas del 98.8% a nivel de token, aunque la precisión a nivel de frase completa es del 85.5%.

Con 177.793.458 parámetros, se sitúa en el rango de un BERT de tamaño medio-grande. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en que existen muy pocos recursos de PLN para lenguas minoritarias como el osetio, y este modelo aporta una herramienta de lematización entrenada específicamente para esa lengua, con un rendimiento notable en la métrica de lemas individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 177.793.458 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | osetio (presumiblemente, segun el nombre y el corpus de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT estándar, un transformer encoder con atención bidireccional. El modelo base fue preentrenado de forma no supervisada sobre el corpus nacional osetio (aproximadamente 250.000 tokens, segun el modelo relacionado `ru2ossbert`). El fine-tune se realizó con el Trainer de Hugging Face sobre un dataset no especificado, con los siguientes hiperparámetros: learning rate 5e-5, batch size 8, optimizador AdamW, scheduler lineal y 25 épocas (aunque la tabla de resultados solo muestra hasta la época 16). No se menciona el uso de RLHF ni DPO; es un fine-tune supervisado clásico para token classification.

La tarea de lematización se aborda como clasificación de tokens, donde cada token recibe una etiqueta correspondiente a su lema. No se detallan innovaciones técnicas adicionales.

## Capacidades

- Lematización de tokens en osetio: asigna a cada palabra su forma canónica (lema).
- Clasificación de tokens a nivel de secuencia: el modelo procesa oraciones completas y predice el lema para cada token.
- Precisión alta a nivel de token (98.8%) pero menor a nivel de frase (85.5%), lo que indica que falla en contextos donde la desambiguación depende de la oración completa.
- No se reportan capacidades de generación de texto, razonamiento, código, tool calling ni agentes.
- No se indica soporte multilingüe más allá del osetio, aunque el modelo base fue preentrenado desde un modelo multilingüe (según el nombre del base model).

## Casos de uso

- Análisis morfológico de corpus osetios: investigadores en lingüística computacional pueden usar el modelo para lematizar automáticamente textos del corpus nacional osetio, facilitando estudios de frecuencia léxica y morfología.
- Construcción de diccionarios y recursos léxicos: la lematización automática permite generar listas de lemas a partir de textos crudos, acelerando la creación de recursos para una lengua con pocos datos digitales.
- Preprocesamiento para búsqueda y recuperación de información: en sistemas de búsqueda sobre documentos en osetio, la lematización normaliza las variantes flexivas y mejora la coincidencia de consultas.
- Sistemas de traducción automática asistida: como paso previo en pipelines de traducción, la lematización puede ayudar a alinear palabras entre lenguas con morfología rica.
- Anotación de corpus para entrenamiento de otros modelos: el modelo puede servir para etiquetar automáticamente grandes volúmenes de texto en osetio, generando datos de entrenamiento para tareas posteriores como POS tagging o NER.
- Herramientas educativas para aprendizaje de osetio: una aplicación que muestre la forma canónica de cada palabra puede ayudar a estudiantes de la lengua a comprender la morfología flexiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El model-index de la model card está vacío. Sin embargo, el autor reporta métricas de evaluación durante el entrenamiento:

| Metrica | Valor final (epoca 16) |
|---|---|
| Validation Loss | 0.1022 |
| Lemma accuracy | 98.7973 |
| Sentence accuracy (lemmas) | 85.5046 |

Estas métricas son internas del proceso de fine-tune y no son comparables con benchmarks de referencia. No se dispone de comparaciones con otros modelos de lematización en osetio.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 177.793.458 parámetros. En FP32 ocupa aproximadamente 711 MB, en FP16 unos 356 MB. Con overhead de activaciones y el tokenizador, se puede ejecutar en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. Para entrenamiento se necesitaría más memoria, pero el fine-tune se realizó con batch size 8, lo que sugiere que una GPU de 8-12 GB sería adecuada.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con Hugging Face Inference Endpoints, o mediante librerías como FastAPI con el pipeline de token-classification. También es compatible con ONNX Runtime si se exporta.
- Latencia y throughput: no se dispone de datos medidos. Para un BERT de este tamaño, la inferencia en CPU puede tardar decenas de milisegundos por oración; en GPU, unos pocos milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de lematización en osetio. El modelo base `AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs` es el único referente conocido, pero no se han publicado métricas comparativas. Se puede mencionar que existen modelos de lematización para lenguas mayoritarias (p. ej., Stanza para español o ruso), pero no son directamente comparables por la diferencia de idioma y arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo para sesgos; al entrenarse sobre un corpus limitado (250K tokens), puede reflejar los desequilibrios del corpus.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede producir lemas incorrectos en contextos ambiguos.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; los BERT típicos usan 512 tokens, pero no está confirmado.
- Limitaciones de idioma: el modelo está especializado en osetio; su rendimiento en otros idiomas es probablemente nulo o muy bajo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: la precisión a nivel de frase es solo del 85.5%, lo que puede ser insuficiente para aplicaciones que requieran lematización perfecta de oraciones completas. Se recomienda validar en el dominio específico antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ania3000/ossbert-lemm-v2-1
- Modelo base: https://huggingface.co/AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs
- Modelo relacionado (ru2ossbert): https://huggingface.co/ania3000/ru2ossbert
- Demo (fill-mask): https://huggingface.co/ania3000/demo-ossbert
- Otro fine-tune del autor: https://huggingface.co/ania3000/ossbert-morph-final
