# DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_25

## Resumen

El modelo `roberta-large_MBTI_N_MBTI_agg_balanced_25` es un clasificador de texto basado en la arquitectura RoBERTa-large, desarrollado por el usuario DrinkIcedT. Está diseñado para la clasificación de personalidad MBTI, concretamente para predecir la dimensión N (Intuición) frente a S (Sensación) a partir de texto. El modelo se entrenó desde cero sobre un conjunto de datos no especificado, con un enfoque de agregación y balanceo que se refleja en el nombre del repositorio.

Con 355 millones de parámetros, este modelo se posiciona en la gama alta de los modelos de codificación de texto basados en transformer. Su relevancia radica en la aplicación de técnicas de fine-tuning sobre una arquitectura robusta para una tarea de clasificación psicolingüística, un área con aplicaciones en recursos humanos, análisis de redes sociales y herramientas de autoconocimiento. La ficha técnica disponible es escasa, ya que la model card generada automáticamente no incluye descripciones detalladas del dataset ni de los usos previstos.

El modelo se distribuye en formato safetensors y es compatible con la librería Transformers de Hugging Face, lo que facilita su integración en pipelines de clasificación de texto existentes. Aunque no se especifica la licencia, el repositorio es de acceso público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (Transformer encoder) |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estándar de RoBERTa) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (presumiblemente inglés, por el corpus de RoBERTa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder de 24 capas con 16 cabezas de atención y una dimensión oculta de 1024. RoBERTa-large fue preentrenado originalmente por Facebook AI sobre 160 GB de texto en inglés, pero este modelo concreto se entrenó desde cero, según indica la model card, sobre un dataset no especificado. Esto implica que los pesos no son los del preentrenamiento original, sino que se inicializaron aleatoriamente y se entrenaron directamente para la tarea de clasificación MBTI.

El entrenamiento se realizó con una tasa de aprendizaje de 1e-5, batch size total de 64 (distribuido en 4 GPUs), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 400 pasos de warmup y 5 épocas. La pérdida de validación final fue de 4.7371, con un F1 de 0.6259 y un umbral óptimo de 0.71. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser un fine-tuning supervisado estándar para clasificación binaria.

## Capacidades

- Clasificación de texto binaria para la dimensión N (Intuición) del MBTI.
- Generación de puntuaciones de probabilidad con umbral ajustable (el umbral óptimo encontrado es 0.71).
- Inferencia eficiente en GPU gracias a la implementación estándar de Transformers.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- Capacidades multilingües no documentadas; probablemente limitado al inglés.

## Casos de uso

- Análisis de redes sociales: clasificar publicaciones de Twitter o Reddit para inferir la preferencia N/S de los usuarios, útil para estudios sociológicos o de marketing. El modelo procesa textos cortos de hasta 512 tokens, adecuado para posts individuales.
- Herramientas de autoconocimiento: integrar el modelo en aplicaciones web que ofrezcan una estimación de tipo MBTI a partir de respuestas de texto libre, como alternativa a los cuestionarios tradicionales.
- Selección de personal: analizar redacciones o respuestas de candidatos para obtener una señal sobre su estilo cognitivo, aunque con cautela por las limitaciones éticas y de precisión.
- Investigación psicolingüística: utilizar el modelo como herramienta de anotación automática en corpus de texto para estudiar correlaciones entre lenguaje y rasgos de personalidad.
- Filtrado de contenido: en plataformas que recomiendan contenido según perfil psicológico, el modelo puede etiquetar textos para personalizar la experiencia del usuario.
- Chatbots con personalidad: ajustar el tono de un asistente virtual según la preferencia N/S detectada en el usuario, mejorando la empatía percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El modelo index no contiene resultados. Los únicos datos de rendimiento provienen del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validación | 4.7371 |
| F1 (macro) | 0.6259 |
| Umbral óptimo | 0.71 |
| F1 con umbral 0.5 | 0.6195 |

Estos valores indican un rendimiento moderado, con margen de mejora. La pérdida de validación alta sugiere que el modelo podría estar sobreajustado o que el dataset es intrínsecamente difícil.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1.4 GB en FP32 (tamaño del repo), ~700 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1660 Ti, RTX 2060, etc.). Para FP32, se recomienda 6 GB o más.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: vLLM, Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o directamente con la librería Transformers.
- Latencia estimada: en una RTX 3090, la inferencia de un texto de 128 tokens debería tomar menos de 10 ms. En CPU, puede ser de 100-500 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roberta-large_MBTI_N (este) | 355M | 512 | Clasificación MBTI | no disponible | Hugging Face |
| RoBERTa-large original | 355M | 512 | MLM + clasificación | MIT | Hugging Face |
| DeBERTa-v3-large | 435M | 512 | MLM + clasificación | MIT | Hugging Face |

La comparativa se limita a la arquitectura base, ya que no hay otros modelos MBTI comparables en la información proporcionada. El modelo original de RoBERTa-large tiene una licencia MIT y está preentrenado, mientras que este modelo se entrenó desde cero, lo que probablemente requiera más datos para alcanzar un rendimiento similar en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó sobre un dataset no documentado, por lo que puede reflejar sesgos presentes en los datos de entrenamiento, especialmente relacionados con el lenguaje y la demografía de los autores.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza, especialmente en textos ambiguos o fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 512 tokens es corta para textos largos; el modelo no puede procesar documentos completos sin truncamiento.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor antes de usar el modelo en producción.
- Caveat de producción: el F1 de 0.6259 es moderado; no es adecuado para aplicaciones donde un error de clasificación tenga consecuencias graves (por ejemplo, selección de personal sin supervisión humana).

## Enlaces

- Repositorio del modelo: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_25
- Variante con agregación al 100%: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_100
- Variante con agregación al 50% (dimensión P): https://huggingface.co/DrinkIcedT/roberta-large_MBTI_P_MBTI_agg_balanced_50
- Tema de GitHub sobre RoBERTa-large: https://github.com/topics/roberta-large
- Documentación de RoBERTa-large en Azure: https://github-wiki-see.page/m/Azure/azureml-assets/wiki/models-roberta-large
