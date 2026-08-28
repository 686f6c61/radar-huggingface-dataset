# luisastellet/bert_metaphor

## Resumen

El modelo `luisastellet/bert_metaphor` es un clasificador de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario luisastellet. Está diseñado para la tarea de clasificación de texto, y por su nombre y el contexto de la búsqueda web, probablemente se especializa en la detección de metáforas, aunque la model card no lo confirma explícitamente. El modelo tiene 108.311.810 parámetros, lo que corresponde a un BERT-base (110M aproximadamente), y se distribuye en formato safetensors.

La relevancia de este modelo radica en su posible aplicación en tareas de análisis lingüístico y procesamiento de lenguaje natural, como la identificación de lenguaje figurado en textos. Sin embargo, la documentación es extremadamente escasa: la model card está generada automáticamente y no incluye información sobre el entrenamiento, los datos utilizados, la licencia ni los idiomas soportados. Esto limita su uso en producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional) |
| Parametros totales | 108.311.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, típico de BERT) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), introducida por Google en 2018. BERT es un transformer encoder que procesa el texto de forma bidireccional, lo que le permite capturar contexto tanto izquierdo como derecho en cada capa. Con 108 millones de parámetros, se corresponde con la variante BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención).

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como fine-tuning supervisado, RLHF o DPO. El tag `arxiv:1910.09700` presente en los metadatos hace referencia al artículo de Lacoste et al. sobre estimación de impacto ambiental, no a un método de entrenamiento. Dado el nombre del modelo y la existencia de un modelo hermano llamado `bert_metaphor_melhor_hp`, es plausible que se trate de un fine-tuning de BERT para detección de metáforas, posiblemente inspirado en el trabajo MelBERT (NAACL 2021), pero esto no está confirmado en la documentación.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo puede asignar una o varias etiquetas a un texto de entrada.
- Detección de metáforas (probable): por el nombre y la existencia de modelos relacionados, es razonable asumir que la tarea principal es identificar si una frase o palabra se usa de forma metafórica, aunque no hay evidencia directa en la model card.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican capacidades multilingües; dado que es un BERT-base, podría haber sido entrenado en un idioma concreto, pero se desconoce cuál.

## Casos de uso

- Análisis literario y lingüístico: el modelo podría utilizarse para identificar metáforas en corpus de textos literarios, ayudando a investigadores en humanidades digitales a estudiar patrones de lenguaje figurado.
- Moderación de contenido creativo: en plataformas que permiten escritura creativa, podría detectar usos metafóricos que requieran revisión humana o etiquetado automático.
- Mejora de sistemas de búsqueda semántica: al clasificar si una expresión es literal o metafórica, se podría refinar la recuperación de información en dominios donde el lenguaje figurado es común (p. ej., poesía, publicidad).
- Asistencia en traducción automática: la detección de metáforas puede ayudar a los sistemas de traducción a decidir cuándo una traducción literal no es adecuada, aunque esto requeriría integrar el modelo en un pipeline más amplio.
- Educación y aprendizaje de idiomas: herramientas didácticas que expliquen el uso de metáforas en textos podrían usar este clasificador para generar ejemplos y ejercicios.
- Análisis de sentimiento en textos figurados: en dominios como reseñas o redes sociales, las metáforas pueden alterar el sentimiento literal; este modelo podría preprocesar el texto para mejorar la precisión de clasificadores de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan métricas de precisión, recall o F1 para la tarea de clasificación. Cualquier evaluación debe ser realizada por el usuario final.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo BERT-base con 108M parámetros en FP32 ocupa aproximadamente 433 MB de memoria. En FP16, unos 217 MB. Con cuantización INT8, alrededor de 108 MB. La VRAM necesaria depende del tamaño del lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32 con un lote pequeño. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son suficientes. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado con suficiente RAM.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Hugging Face Text Generation Inference (TGI), o mediante la API de Hugging Face. Para CPU, se puede usar ONNX Runtime o llama.cpp (aunque este último está más orientado a modelos generativos). También es compatible con la librería `transformers` de Python.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (p. ej., RTX 3090), la inferencia de una secuencia de 128 tokens suele tardar entre 5 y 15 ms, pero esto es una estimación genérica para BERT-base, no un dato específico del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luisastellet/bert_metaphor | 108M | no disponible | Clasificación de texto (¿metáforas?) | no disponible | Hugging Face |
| luisastellet/bert_metaphor_melhor_hp | no disponible | no disponible | Clasificación de texto (¿metáforas?) | no disponible | Hugging Face |
| MelBERT (jin530/MelBERT) | no disponible | no disponible | Detección de metáforas | no disponible | GitHub (código oficial) |

No se dispone de datos de rendimiento comparativo. MelBERT es un modelo específico para detección de metáforas presentado en NAACL 2021, y podría ser una referencia académica relevante, pero no se puede afirmar que `bert_metaphor` esté basado en él sin confirmación.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el entrenamiento, los datos, la licencia ni los idiomas. Esto impide evaluar su idoneidad para casos de uso concretos y su cumplimiento legal.
- Sesgos desconocidos: al no conocer el corpus de entrenamiento, no se pueden identificar sesgos demográficos, culturales o lingüísticos. Es probable que herede los sesgos de BERT preentrenado.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones erróneas si el dominio de aplicación difiere del entrenamiento.
- Limitaciones de contexto: si se trata de un BERT-base estándar, la longitud máxima de secuencia es de 512 tokens. Textos más largos deberán truncarse o dividirse.
- Restricciones de licencia: al no especificarse licencia, el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Sin garantías de rendimiento: no hay benchmarks publicados, por lo que el modelo no ha sido validado externamente. Cualquier uso en producción requiere una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/bert_metaphor
- Modelo relacionado (bert_metaphor_melhor_hp): https://huggingface.co/luisastellet/bert_metaphor_melhor_hp
- Código de MelBERT (referencia académica relacionada): https://github.com/jin530/MelBERT
- Paper de BERT original: https://arxiv.org/abs/1810.04805 (referencia general de la arquitectura)
