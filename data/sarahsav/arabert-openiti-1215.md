# SarahSav/arabert-openiti-1215

## Resumen

SarahSav/arabert-openiti-1215 es un modelo de lenguaje basado en BERT, específicamente un fine-tuning del modelo `aubmindlab/bert-base-arabertv02` (AraBERT v2) sobre textos del Open Islamicate Texts Initiative (OpenITI), una colección digital de obras históricas y clásicas en árabe. El modelo está diseñado para procesar árabe clásico e histórico, un dominio lingüístico que difiere notablemente del árabe moderno en vocabulario, morfología y segmentación. Con 135 millones de parámetros, sigue la arquitectura encoder-only de BERT, lo que lo hace adecuado para tareas de comprensión del lenguaje, como enmascarado de tokens (fill-mask), clasificación de textos y extracción de representaciones contextuales.

La relevancia de este modelo radica en su especialización: los corpus históricos presentan desafíos únicos, como variaciones ortográficas, ausencia de diacríticos y vocabulario arcaico, que los modelos entrenados en árabe moderno no capturan adecuadamente. Según la descripción en HuggingFace, el predecesor `arabert-openiti-911` heredó un desajuste de vocabulario al entrenarse sobre texto no segmentado con un vocabulario construido para árabe moderno segmentado; este nuevo modelo busca corregir esa deficiencia, aunque no se detallan los métodos específicos. El acceso al modelo está restringido (gated), lo que implica que los usuarios deben aceptar condiciones adicionales en HuggingFace antes de su descarga.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 135.258.880 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (especializado en árabe clásico e histórico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT original, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, tal como se implementa en `bert-base-arabertv02`. Este modelo base fue preentrenado por el grupo AUB-MIND sobre un corpus árabe de 77 GB (aproximadamente 200 millones de líneas y 8,6 mil millones de palabras), utilizando segmentación Farasa para el vocabulario. El fine-tuning sobre OpenITI se realizó para adaptar las representaciones al dominio histórico, aunque no se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como MLM adicional o ajuste con supervisión.

Una innovación técnica relevante, mencionada en la descripción del modelo, es el intento de superar el desajuste de vocabulario que afectaba al modelo predecesor. Mientras que `arabert-openiti-911` se entrenó sobre texto no segmentado con un vocabulario diseñado para texto segmentado, este nuevo modelo parece abordar esta discrepancia, aunque no se especifica si se reconstruyó el vocabulario o se aplicó una estrategia de tokenización alternativa. No se dispone de información sobre el uso de técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Enmascarado de tokens (fill-mask): capacidad principal del pipeline, permite predecir tokens ocultos en una secuencia.
- Representaciones contextuales: genera embeddings de palabras dependientes del contexto, útiles para fine-tuning en tareas downstream como clasificación de textos, análisis de sentimiento o reconocimiento de entidades nombradas.
- Especialización en árabe clásico e histórico: entrenado sobre corpus OpenITI, captura mejor la semántica y morfología de textos medievales y modernos tempranos.
- Soporte multilingüe limitado: aunque el modelo base AraBERT soporta árabe moderno estándar, este fine-tuning está orientado exclusivamente al árabe histórico; no se reportan capacidades en otros idiomas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Análisis de textos históricos en humanidades digitales: investigadores pueden utilizar el modelo para clasificar obras por género, autor o período, o para extraer entidades como nombres de lugares o personas en manuscritos digitalizados. Su especialización en árabe clásico mejora la precisión frente a modelos genéricos.
- Corrección y normalización de textos OCR: al predecir tokens enmascarados, el modelo puede ayudar a corregir errores de reconocimiento óptico en documentos históricos, sugiriendo palabras plausibles según el contexto.
- Búsqueda semántica en corpus clásicos: las representaciones contextuales pueden indexar pasajes de obras históricas para recuperación de información, permitiendo búsquedas por significado en lugar de coincidencia exacta.
- Etiquetado de partes del discurso y análisis morfológico: aunque no se ha fine-tuneado específicamente, sus embeddings pueden servir como base para entrenar modelos de etiquetado en árabe histórico, reduciendo la necesidad de anotaciones manuales.
- Generación de resúmenes o paráfrasis de textos clásicos: aunque BERT no es generativo, sus representaciones pueden alimentar modelos encoder-decoder para tareas de resumen en el dominio histórico.
- Educación y divulgación: herramientas de lectura asistida para estudiantes de árabe clásico, donde el modelo puede completar palabras faltantes o sugerir interpretaciones de pasajes difíciles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones cuantitativas con otros modelos de árabe histórico.

## Requisitos de hardware

- Al ser un modelo BERT base con 135 millones de parámetros, su huella de memoria es reducida. En FP32, los pesos ocupan aproximadamente 540 MB, y en cuantización de 8 bits (si estuviera disponible) se reduciría a unos 135 MB.
- Es ejecutable en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, y también en CPU con razonable latencia para tareas de inferencia puntual.
- Para fine-tuning en datasets pequeños, una GPU con 8-12 GB de VRAM es suficiente.
- Opciones de despliegue: al ser un modelo de la familia BERT, es compatible con librerías como HuggingFace Transformers, ONNX Runtime, TensorFlow Serving y frameworks como vLLM (aunque estos últimos están más orientados a modelos generativos). También puede ejecutarse en entornos sin GPU mediante llama.cpp, aunque BERT no es el objetivo principal de esa librería.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Sin embargo, se puede establecer una comparación cualitativa con su modelo base y con alternativas del dominio:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SarahSav/arabert-openiti-1215 | 135M | No disponible | Árabe clásico/histórico (OpenITI) | Apache 2.0 |
| aubmindlab/bert-base-arabertv02 | 135M | 512 (típico BERT) | Árabe moderno estándar | Apache 2.0 |
| CAMeL BERT (camelbert) | 108M-357M | 512 | Árabe moderno y dialectos | MIT (varía) |

Nota: los datos de CAMeL BERT son de conocimiento general, no de la información proporcionada. La comparativa se limita a aspectos estructurales; no hay resultados de rendimiento disponibles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que los usuarios deben solicitar permiso y aceptar condiciones adicionales antes de su uso, lo que puede limitar su adopción en entornos corporativos.
- Especialización limitada: entrenado exclusivamente en árabe clásico e histórico, su rendimiento en árabe moderno o dialectal puede ser inferior al de modelos genéricos.
- Longitud de contexto no confirmada: aunque BERT base típicamente soporta 512 tokens, este dato no está especificado en la ficha; para documentos largos se requeriría segmentación.
- Vocabulario heredado: al partir de AraBERT v2, el vocabulario puede no cubrir adecuadamente términos arcaicos o variantes ortográficas poco frecuentes en árabe moderno, a pesar del intento de corrección.
- Sesgos históricos: los textos de OpenITI reflejan perspectivas y lenguajes de épocas pasadas, lo que puede introducir sesgos culturales, religiosos o de género en las representaciones.
- Sin garantías de producción: al no publicarse benchmarks ni estudios de robustez, no se recomienda su uso en sistemas críticos sin una evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SarahSav/arabert-openiti-1215
- Repositorio de AraBERT (modelo base): https://github.com/aub-mind/arabert
- Open Islamicate Texts Initiative (OpenITI): https://github.com/OpenITI
