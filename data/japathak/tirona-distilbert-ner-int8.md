# japathak/tirona-distilbert-ner-int8

## Resumen

`tirona-distilbert-ner-int8` es un modelo de reconocimiento de entidades nombradas (NER) cuantizado a int8 en formato ONNX, derivado del modelo `dslim/distilbert-NER` (basado en `distilbert-base-cased`, fine-tuned sobre el corpus CoNLL-2003). Lo publica el autor `japathak` como parte de la infraestructura de la aplicación Android Tirona, que lo usa para la detección de nombres en transcripciones de voz. El modelo está pensado para sustituir a un reconocedor heurístico de nombres, ofreciendo una alternativa basada en aprendizaje automático con un peso de solo 63 MB, frente a los 249 MB del export float32 original.

La relevancia de este modelo reside en que demuestra un flujo completo de cuantización dinámica con ONNX Runtime para un caso de uso en producción en un dispositivo móvil, con verificación de integridad mediante hashes SHA-256 y un script de validación. No es un modelo de propósito general, sino un artefacto específico para extracción de entidades de tipo persona, organización y ubicación en textos cortos, integrado en un pipeline de reconocimiento de voz. La licencia del modelo base es Apache-2.0, lo que permite su redistribución, pero el propio modelo no publica licencia explícita en su repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de clasificación de tokens para NER |
| Parámetros totales | 66 millones (estimado para DistilBERT base, no disponible para la versión cuantizada) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite de DistilBERT) |
| Tipos de cuantización | int8 dinámica (ONNX Runtime `quantize_dynamic`, `QuantType.QInt8`, `MatMulConstBOnly`) |
| Idiomas soportados | Inglés (entrenado en CoNLL-2003, corpus de Reuters en inglés) |
| Licencia | Apache-2.0 (para el modelo base `dslim/distilbert-NER`); el repositorio de este modelo no declara licencia explícita |
| Formato de pesos | ONNX (archivo `model.int8.onnx` de 65,609,669 bytes) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, un encoder transformer destilado de BERT mediante destilación de conocimiento, que conserva aproximadamente el 97 % del rendimiento de BERT con un 40 % menos de parámetros y un 60 % menos de velocidad de inferencia. La capa de salida es una clasificación por token con etiquetas BIO (Beginning, Inside, Outside) para las entidades PERSON, ORG, LOC y MISC.

El entrenamiento original se realizó sobre el corpus CoNLL-2003, compuesto por artículos de Reuters en inglés, con un proceso de fine-tuning supervisado. Para este artefacto concreto, no se ha realizado un nuevo entrenamiento: se ha tomado el export ONNX float32 de `dslim/distilbert-NER` y se ha aplicado cuantización dinámica int8 con ONNX Runtime, restringida a las multiplicaciones de matrices con constantes (`MatMulConstBOnly`). La cuantización dinámica calcula los rangos de activación en tiempo de ejecución, lo que no requiere un conjunto de calibración y mantiene la precisión en la mayoría de los casos. El script `quantise.py` incluido en el repositorio permite reproducir el proceso y verificar la equivalencia con el modelo float32.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en inglés: personas (PER), organizaciones (ORG) y lugares (LOC).
- Etiquetado por tokens con esquema BIO (B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, O).
- Inferencia eficiente en dispositivos móviles gracias a la cuantización int8 (63 MB frente a 249 MB del float32).
- Compatible con ONNX Runtime, lo que permite su integración en aplicaciones Android, iOS o servidores con Python.
- El modelo base soporta hasta 512 tokens de contexto, suficiente para fragmentos de texto de tamaño medio.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un modelo de NER en inglés.

## Casos de uso

- Transcripción de voz con detección de nombres: la aplicación Tirona usa este modelo para identificar nombres de personas en transcripciones de voz, sustituyendo a un reconocedor heurístico que fallaba en contextos ambiguos. El modelo recibe el texto transcrito y devuelve las entidades de tipo PER, ORG y LOC.
- Extracción de entidades en documentos legales: el modelo puede aplicarse a contratos o actas para extraer nombres de empresas y personas, reduciendo el trabajo manual de revisión.
- Enriquecimiento de bases de datos de contactos: a partir de correos electrónicos o mensajes, se pueden extraer nombres de personas y organizaciones para completar registros CRM.
- Filtrado de datos sensibles en texto: al identificar nombres de personas y organizaciones, puede usarse para anonimizar documentos antes de su publicación, aunque la precisión no es perfecta y requiere revisión humana.
- Clasificación de textos periodísticos: sobre noticias en inglés, el modelo puede extraer quién y qué organización aparece en un artículo, útil para sistemas de seguimiento de medios.
- Procesamiento de transcripciones de reuniones: en un entorno de productividad, el modelo puede etiquetar automáticamente los participantes y las empresas mencionadas en actas o notas, mejorando la búsqueda y organización de la información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que en una prueba de verificación sobre texto similar a notas, el modelo int8 coincidió con el float32 en 10 de 11 muestras, y en la única diferencia el int8 obtuvo un resultado mejor (eliminó una entidad PER falsa). No hay datos de F1, precisión o recall sobre CoNLL-2003 para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en int8 (el modelo ocupa 63 MB en disco; la memoria de activación es baja para secuencias cortas).
- GPU recomendadas: no se requiere GPU; el modelo está diseñado para CPU, especialmente en dispositivos móviles. En servidores, puede ejecutarse en CPU o GPU con ONNX Runtime.
- Compatible con GPU de consumo: sí, cualquier GPU con soporte CUDA puede ejecutarlo, pero no es necesario. En dispositivos móviles, cabe en cualquier Android con al menos 100 MB de almacenamiento libre.
- Opciones de despliegue: ONNX Runtime en Python, C# o C++; en Android mediante ONNX Runtime Android; también es posible servirlo con ONNX Runtime Server o convertirlo a otro formato.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño (63 MB) y la cuantización int8, en un CPU moderno la inferencia de un texto de 100 tokens debería completarse en decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| `japathak/tirona-distilbert-ner-int8` | 63 MB | 512 tokens | Apache-2.0 (base) | ONNX int8 | Cuantizado dinámicamente, pensado para móvil |
| `dslim/distilbert-NER` | 249 MB (float32) | 512 tokens | Apache-2.0 | ONNX, PyTorch | Modelo original, no cuantizado |
| `Xenova/bert-base-NER` | 104 MB | 512 tokens | Sin licencia declarada | ONNX int8 | Cuantización int8 pero sin licencia clara |

El modelo de Tirona ofrece la ventaja de un tamaño reducido (63 MB) frente a los 249 MB del float32, y una licencia Apache-2.0 explícita del modelo base, lo que lo hace más seguro para uso comercial que `Xenova/bert-base-NER`. Sin embargo, no hay benchmarks publicados que comparen su precisión con la de estos otros modelos.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés (CoNLL-2003, Reuters), por lo que no funciona en otros idiomas.
- Longitud de contexto limitada a 512 tokens; textos más largos deben truncarse o segmentarse.
- La cuantización int8 puede degradar ligeramente la precisión en casos de textos con vocabulario poco frecuente o nombres raros, aunque el autor reporta que en su prueba de validación no hubo diferencias significativas.
- El modelo no distingue entidades del tipo MISC (misceláneas) porque la aplicación Tirona solo usa PER, ORG y LOC; no obstante, las etiquetas MISC están en el modelo base, pero no se utilizan.
- No se ha publicado una licencia explícita en el repositorio del modelo; solo se hereda la licencia Apache-2.0 del modelo base. Antes de usar comercialmente, conviene contactar con el autor o revisar el repositorio actualizado.
- Riesgo de alucinación: como todo modelo NER, puede etiquetar incorrectamente tokens como entidades cuando no lo son (p. ej., acrónimos como "RFC" o "API" identificados como ORG). El sistema Tirona aplica un filtro adicional de plausibilidad para mitigar este problema.
- El modelo es un artefacto de producción para la aplicación Tirona; no se ha diseñado como un modelo independiente de uso general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/japathak/tirona-distilbert-ner-int8
- Modelo base en Hugging Face: https://huggingface.co/dslim/distilbert-NER
- Documentación de DistilBERT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/distilbert
- Guía de DistilBERT en GeeksforGeeks: https://www.geeksforgeeks.org/nlp/distilbert-in-natural-language-processing/
- Página del modelo en OpenModelMap: https://openmodelmap.com/model/dslim/distilbert-NER
- Código fuente de Transformers (DistilBERT): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/distilbert.md
