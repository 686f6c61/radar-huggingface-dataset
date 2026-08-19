# DrinkIcedT/roberta-large_MBTI_P_MBTI_agg_balanced_50_2e-05

## Resumen

El modelo `DrinkIcedT/roberta-large_MBTI_P_MBTI_agg_balanced_50_2e-05` es un clasificador de texto basado en la arquitectura RoBERTa-large, desarrollado por el usuario DrinkIcedT. Según su nomenclatura, está orientado a la clasificación de la dimensión P (Percepción frente a Juicio) del indicador de personalidad MBTI, aunque la model card no lo especifica explícitamente. El modelo cuenta con 355 361 794 parámetros y fue entrenado mediante fine-tuning sobre un conjunto de datos no documentado, con una pérdida final de 4,5879 y un F1 de 0,6506 en el conjunto de evaluación.

La relevancia de este modelo radica en su especialización en una tarea concreta de análisis de personalidad a partir de texto, un área con aplicaciones en recursos humanos, marketing o psicología computacional. Sin embargo, la documentación disponible es muy escasa: la model card está generada automáticamente, no se indica licencia, idiomas soportados ni procedencia de los datos de entrenamiento, lo que limita su reproducibilidad y su uso en entornos de producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (Transformer encoder-only) |
| Parametros totales | 355 361 794 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en RoBERTa-large, un transformer encoder-only de 24 capas con 16 cabezas de atención y una dimensión oculta de 1024, diseñado originalmente por Facebook AI para tareas de comprensión del lenguaje. Aunque la model card indica que fue "entrenado desde cero", el nombre y el tamaño de parámetros coinciden con un fine-tuning de RoBERTa-large preentrenado, por lo que se trata de una adaptación del modelo base a una tarea de clasificación de textos.

Los hiperparámetros de entrenamiento documentados incluyen una tasa de aprendizaje de 2e-05, tamaño de lote de 16 por dispositivo (64 con 4 GPUs), optimizador AdamW con betas (0,9, 0,999), scheduler lineal con 400 pasos de calentamiento y 5 épocas. El conjunto de datos de entrenamiento no está descrito, y la pérdida de validación aumenta progresivamente a partir de la época 2, lo que sugiere un posible sobreajuste. No se menciona el uso de técnicas como RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de texto binaria, probablemente orientada a la dimensión P (Percepción) del MBTI, aunque la etiqueta exacta no está documentada.
- Inferencia mediante la librería Transformers de Hugging Face, compatible con pipelines de `text-classification`.
- Soporte para embeddings de texto a través de la integración con `text-embeddings-inference` y `endpoints_compatible`, lo que permite su despliegue en entornos de inferencia estándar.
- No se han documentado capacidades adicionales como generación de texto, tool calling, razonamiento multi-paso o soporte multilingüe.

## Casos de uso

- Análisis de personalidad en textos: el modelo puede clasificar fragmentos de texto (por ejemplo, publicaciones en redes sociales o respuestas de cuestionarios) según la dimensión P/J del MBTI, útil para estudios psicológicos o de comportamiento.
- Segmentación de audiencia en marketing: a partir de textos generados por usuarios, se podría inferir su perfil de personalidad para personalizar campañas publicitarias o recomendaciones de producto.
- Filtrado de contenido en plataformas de citas o redes sociales: clasificar las preferencias de los usuarios según su tipo MBTI para mejorar las coincidencias.
- Herramientas de orientación profesional: sugerir carreras o entornos laborales compatibles con el perfil de personalidad detectado en cartas de motivación o entrevistas escritas.
- Investigación en psicometría: servir como base para estudios que relacionen el lenguaje con rasgos de personalidad, siempre que se valide el modelo con datos adicionales.
- Prototipos de asistentes conversacionales: integrar el clasificador en un chatbot para adaptar el tono o las respuestas según el perfil MBTI inferido del usuario.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos (MMLU, HumanEval, etc.). El único dato de rendimiento es el reportado en el conjunto de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 4,5879 |
| F1 | 0,6506 |
| Threshold | 0,48 |
| F1 at 0.5 | 0,6477 |

La evolución del F1 a lo largo del entrenamiento muestra una mejora progresiva hasta la época 3, con valores estables alrededor de 0,65. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 355 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 1,4 GB (tamaño del repositorio).
- Para inferencia en FP16 se estima un uso de VRAM de unos 1,4 GB, mientras que en FP32 podría requerir cerca de 2,8 GB.
- Con cuantización a 8 bits, el uso de VRAM podría reducirse a unos 0,7 GB, permitiendo su ejecución en GPUs de gama media como una NVIDIA GTX 1660 o RTX 2060.
- No se han proporcionado datos de latencia ni throughput; al ser un modelo encoder de tamaño medio, es adecuado para despliegue con vLLM, TGI o llama.cpp, así como mediante el pipeline de Transformers.
- Para entrenamiento, el autor usó 4 GPUs con batch de 16 cada una, lo que sugiere que se requiere un entorno multi-GPU para reproducir el entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación MBTI) ni en la misma familia de tamaño. La búsqueda web solo muestra otros modelos del mismo autor con variantes de la dimensión (por ejemplo, `roberta-large_MBTI_I_MBTI_agg_balanced_50`), pero sin datos de rendimiento comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no se especifica el conjunto de datos de entrenamiento, el preprocesamiento ni el número de clases, lo que impide evaluar su validez externa.
- El MBTI es una herramienta psicométrica cuestionada por la comunidad científica; las predicciones del modelo no deben considerarse diagnósticos fiables de personalidad.
- La pérdida de validación aumenta notablemente en las últimas épocas (de 2,5 a 4,6), lo que indica un posible sobreajuste al conjunto de entrenamiento.
- No se ha documentado la licencia, por lo que su uso comercial puede estar sujeto a restricciones legales no especificadas.
- No hay información sobre sesgos demográficos o lingüísticos; al estar entrenado probablemente con textos en inglés (por la naturaleza de RoBERTa), su rendimiento en otros idiomas es incierto.
- La ausencia de benchmarks externos y de comparaciones con otros modelos dificulta la evaluación de su calidad relativa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DrinkIcedT/roberta-large_MBTI_P_MBTI_agg_balanced_50_2e-05)
- [Modelo variante I (MBTI_I)](https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50)
- [Tema roberta-large en GitHub](https://github.com/topics/roberta-large)
- [Referencia de benchmarks de RoBERTa-large en CodeSOTA](https://www.codesota.com/model/roberta-large)
