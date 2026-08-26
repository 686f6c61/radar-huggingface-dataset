# protonx-models/t5-small-pretrain-vks

## Resumen

`protonx-models/t5-small-pretrain-vks` es un modelo de lenguaje vietnamita desarrollado por ProtonX mediante continual pretraining (también denominado domain-adaptive pretraining, DAPT) sobre la base `VietAI/vit5-base`, una variante de T5-small adaptada al vietnamita. El objetivo es especializar el modelo en el dominio jurídico del sector de la Fiscalía Popular de Vietnam, a partir de un corpus de aproximadamente 313 documentos legales (decisiones, directivas, circulares, tratados de cooperación judicial) procesados mediante OCR, con un paso adicional de replay sobre el dataset curado `VTSNLP/vietnamese_curated_dataset` para mitigar el olvido catastrófico.

El modelo mantiene la arquitectura T5 (encoder-decoder) con 62,5 millones de parámetros y se entrenó con el objetivo de span corruption original de T5 (noise density 0,15, longitud media de span 3,0, secuencias de 1024 tokens). Es un checkpoint de pretrain, es decir, no está fine-tuneado para ninguna tarea concreta y debe ajustarse antes de su uso en producción. Su relevancia actual radica en que cubre un nicho escasamente atendido: el procesamiento de lenguaje jurídico vietnamita, con una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, transformer, text-to-text) |
| Parametros totales | 62.538.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (nativa T5); entrenado con secuencias de 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 original de Google, un transformer encoder-decoder con atención relativa posicional y un objetivo de entrenamiento text-to-text. El checkpoint base es `VietAI/vit5-base`, una versión de T5-small pre-entrenada en vietnamita, sobre el que se realizó un continual pretraining con el objetivo de span corruption (misma técnica que el T5 original) con una densidad de ruido de 0,15, una longitud media de span de 3,0 y secuencias de 1024 tokens.

El entrenamiento se realizó sobre un corpus jurídico especializado del sector de la Fiscalía Popular de Vietnam, compuesto por aproximadamente 313 documentos escaneados y pasados por OCR. El preprocesado incluyó la concatenación de oraciones cortadas por saltos de página, la eliminación de sellos de la administración, el encabezado nacional y la marca de agua, así como la eliminación de notaciones markdown y el filtrado de fragmentos con abundantes tokens `<unk>` o con poca puntuación. Para evitar el olvido catastrófico, se incorporó un conjunto de replay del corpus curado `VTSNLP/vietnamese_curated_dataset`. El entrenamiento alcanzó 10.500 pasos globales (218,75 épocas) con una pérdida de validación inicial de 0,9341 y una mejor de 0,9259.

## Capacidades

- Generación de texto condicionada (texto a texto) en vietnamita, con especialización en vocabulario y estilo jurídico del ámbito de la Fiscalía Popular.
- Capacidad de completar fragmentos con el mecanismo de span corruption (uso de tokens `<extra_id_N>`), útil para tareas de enmascarado o rellenado de huecos.
- Soporta cualquier tarea de text-to-text que pueda formularse como secuencia de entrada y salida (traducción, resumen, extracción, Q&A), siempre que se fine-tune previamente.
- No incluye soporte de tool calling, function calling, agentes, visión ni audio.
- Multilingüe limitado: el modelo base fue pre-entrenado en vietnamano; no se documenta capacidad en otros idiomas.

## Casos de uso

- **Extracción de información en documentos legales**: el modelo puede fine-tunearse para extraer entidades como nombres de tribunales, fechas, números de expediente o referencias normativas de sentencias y decisiones de la Fiscalía. Su entrenamiento con ruido OCR lo hace robusto a textos con errores de digitalización.
- **Clasificación de documentos jurídicos**: tras un fine-tuning con un conjunto etiquetado, puede clasificar textos legales por tipo (decisión, directiva, circular, decreto) o por materia, aprovechando su vocabulario especializado.
- **Relleno de campos en formularios legales**: usando el mecanismo de span corruption, se puede entrenar para completar plantillas de documentos oficiales (por ejemplo, completar el texto de una decisión a partir de un borrador con huecos).
- **Resumen de textos normativos**: puede ajustarse para resumir circulares o directivas extensas en resúmenes ejecutivos, reduciendo el tiempo de lectura en despachos y organismos públicos.
- **Búsqueda semántica y recuperación de información**: como encoder, puede usarse para generar embeddings de documentos legales y construir sistemas de recuperación (RAG) sobre el corpus de la Fiscalía, mejorando la precisión frente a modelos genéricos.
- **Asistente de redacción asistida**: con fine-tuning, puede sugerir frases o completar párrafos en documentos oficiales, manteniendo el estilo formal y la terminología del sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación durante el pretrain (eval_loss inicial 0,9341, mejor 0,9259), pero no se comparan con otros modelos ni se ofrecen métricas de tareas downstream.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, el modelo ocupa aproximadamente 250 MB (62,5 M parámetros × 4 bytes). Con cuantización de 8 bits, alrededor de 63 MB, y en 4 bits, cerca de 32 MB. Es viable en cualquier GPU consumer actual.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente; también funciona en CPU sin problemas de memoria.
- **Compatibilidad con consumer GPU**: sí, es un modelo pequeño que corre en cualquier equipo doméstico, incluso en portátiles sin GPU.
- **Opciones de despliegue**: transformers de Hugging Face (PyTorch), Hugging Face TGI (text-generation-inference), ONNX Runtime, o en CPU con llama.cpp (aunque T5 no es el formato más habitual para GGUF; es preferible usar transformers o TGI).
- **Latencia y throughput**: al ser un modelo de 60 M de parámetros, la generación es rápida; en una GPU moderna se esperan latencias de pocos milisegundos por token y throughput de miles de tokens por segundo, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| protonx-models/t5-small-pretrain-vks | 62,5 M | 512 nativo | vietnamita | MIT | Pretrain DAPT en dominio legal vietnamita |
| google-t5/t5-small | 60 M | 512 | multilingüe (inglés) | Apache 2.0 | Modelo T5 original, sin especialización jurídica |
| VietnamAI/vit5-base | 60 M | 512 | vietnamita | no disponible | Base T5 pre-entrenada en vietnamano genérico |

El modelo de ProtonX se diferencia de `vit5-base` en su especialización continua en el dominio legal, lo que debería mejorar el rendimiento en tareas jurídicas vietnamitas a costa de un posible degradación en tareas generales (no evaluada). Frente a `t5-small` de Google, su ventaja es el dominio del vietnamano y la licencia MIT más permisiva que Apache-2.0.

## Limitaciones y advertencias

- **Modelo pretrain**: no está fine-tuneado para ninguna tarea concreta; requiere un ajuste posterior (fine-tuning) con datos etiquetados para tareas downstream como extracción, clasificación o resumen.
- **Corpus de entrenamiento limitado**: solo 313 documentos legales, con ruido de OCR; puede tener lagunas de vocabulario o errores en términos poco frecuentes.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios legales donde la precisión es crítica. Debe validarse siempre la salida.
- **Sesgos del dominio**: entrenado exclusivamente en textos de la Fiscalía Popular de Vietnam; puede no generalizar bien a otros ámbitos legales vietnamitas (por ejemplo, derecho civil o mercantil) ni a otros países.
- **Idioma**: solo se ha entrenado en vietnamano; no se garantiza rendimiento en otros idiomas.
- **Contexto limitado**: 512 tokens nativos, lo que limita el procesamiento de documentos largos sin un mecanismo de chunking o RAG.
- **Licencia MIT**: permite uso comercial, pero la responsabilidad legal del uso en entornos jurídicos recae en el usuario; no hay garantías de exactitud.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/protonx-models/t5-small-pretrain-vks)
- [Organización ProtonX](https://huggingface.co/protonx-models)
- [google-t5/t5-small en Hugging Face](https://huggingface.co/google-t5/t5-small)
- [Documentación de pretrain de T5X (referencia técnica)](https://github.com/google-research/t5x/blob/main/docs/usage/pretrain.md)
