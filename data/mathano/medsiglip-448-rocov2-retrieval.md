# mathano/medsiglip-448-rocov2-retrieval

## Resumen

MedSigLIP es una variante de SigLIP (Sigmoid Loss for Language Image Pre-training) desarrollada por Google Health para codificar imágenes médicas y texto en un espacio de embeddings común. El modelo original combina un encoder de visión de 400 millones de parámetros con un encoder de texto de otros 400 millones, y soporta una resolución de imagen de 448x448 píxeles con hasta 64 tokens de texto. Está diseñado específicamente para aplicaciones de interpretación de imágenes médicas que no requieren generación de texto, como la recuperación de imágenes por similitud o la clasificación con pocos ejemplos.

El modelo `mathano/medsiglip-448-rocov2-retrieval` es un fine-tuning de MedSigLIP orientado a tareas de retrieval (recuperación) sobre el conjunto de datos RoCoV2, probablemente centrado en radiología. Con 878,3 millones de parámetros totales, supera ligeramente la suma de los encoders originales, lo que sugiere la adición de cabezales o capas de proyección específicas para la tarea de recuperación. Publicado en agosto de 2026 por el usuario mathano, este modelo está pensado para investigadores y desarrolladores que necesitan un sistema de búsqueda semántica de imágenes médicas a partir de consultas en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP (encoder de vision + encoder de texto) |
| Parametros totales | 878.300.338 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de texto; imagen 448x448 píxeles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MedSigLIP se basa en la arquitectura SigLIP, que emplea una pérdida sigmoide para el preentrenamiento de pares imagen-texto, en lugar de la pérdida softmax contrastiva típica de modelos como CLIP. Esto permite un entrenamiento más estable y eficiente con lotes de menor tamaño. El modelo original de Google Health fue entrenado con pares de imágenes médicas y texto desidentificados, cubriendo diversas modalidades (radiografías, tomografías, etc.). El encoder de visión procesa imágenes a 448x448 píxeles, mientras que el encoder de texto admite hasta 64 tokens.

El modelo de mathano es un fine-tuning de MedSigLIP para la tarea de retrieval sobre el dataset RoCoV2. No se dispone de información detallada sobre el proceso de entrenamiento específico (número de épocas, función de pérdida, datos exactos de RoCoV2). Dado el nombre "retrieval", es probable que se haya optimizado con una pérdida contrastiva o de triplet loss para mejorar la alineación entre consultas textuales e imágenes radiológicas. Tampoco se han publicado detalles sobre técnicas de regularización, aumento de datos o estrategias de hard negative mining.

## Capacidades

- Recuperación de imágenes médicas: dado un texto descriptivo (por ejemplo, "radiografía de tórax con derrame pleural"), el modelo devuelve las imágenes más relevantes de un corpus.
- Búsqueda inversa: dada una imagen de consulta, puede encontrar imágenes similares en una base de datos, útil para diagnóstico asistido o revisión de casos.
- Embeddings multimodales: genera representaciones vectoriales de imágenes y texto en un espacio común, permitiendo operaciones de similitud y clustering.
- Clasificación con pocos ejemplos: al estar preentrenado en un amplio dominio médico, puede adaptarse a nuevas tareas de clasificación con pocas muestras etiquetadas.
- No genera texto: a diferencia de los modelos generativos, MedSigLIP no produce descripciones o informes; su salida son vectores de embedding.
- Soporte de resolución 448x448: adecuado para imágenes médicas de alta resolución, aunque el tamaño exacto de entrada debe ajustarse al modelo.

## Casos de uso

- Recuperación de casos radiológicos: un radiólogo puede escribir "fractura de fémur distal" y el sistema recupera radiografías históricas con hallazgos similares, facilitando la comparación y el diagnóstico diferencial.
- Búsqueda en archivos hospitalarios: integración en sistemas PACS (Picture Archiving and Communication System) para localizar estudios previos por descripción clínica, reduciendo el tiempo de búsqueda manual.
- Anotación asistida: dado un conjunto de imágenes sin etiquetar, el modelo puede sugerir etiquetas o descripciones a partir de la similitud con imágenes ya anotadas, acelerando la creación de datasets.
- Control de calidad en datasets: verificar que las imágenes de un dataset médico corresponden a la modalidad o región anatómica esperada mediante comparación de embeddings.
- Investigación en radiología: agrupar imágenes por similitud visual para identificar patrones no supervisados o subgrupos de pacientes con características comunes.
- Desarrollo de chatbots clínicos: combinar este modelo de retrieval con un LLM generativo para responder preguntas sobre imágenes médicas, donde el LLM genera texto basado en las imágenes recuperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión en recuperación (mAP, Recall@K) ni comparaciones con otros modelos de retrieval médico. El repositorio de HuggingFace no incluye tablas de evaluación ni referencias a papers.

## Requisitos de hardware

- VRAM estimada para inferencia: con 878 millones de parámetros, en precisión fp32 se necesitan aproximadamente 3,5 GB solo para los pesos; en fp16, unos 1,8 GB. A esto hay que sumar la memoria para las activaciones y el procesamiento de imágenes (448x448), por lo que se recomienda al menos 6-8 GB de VRAM para un uso cómodo.
- GPU recomendadas: tarjetas de gama media como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo sin problemas. Para procesamiento por lotes o integración en servicios, se recomienda A10, A100 o similares.
- En consumer GPU: sí, cabe en GPUs de consumo con 8 GB o más, siempre que se use una cuantización adecuada (aunque no se han publicado pesos cuantizados, se podría convertir a GGUF o usar bitsandbytes).
- Opciones de despliegue: al ser un modelo de embeddings, se puede servir con frameworks como Hugging Face Transformers, Sentence Transformers, o mediante ONNX Runtime. Para producción, se puede usar vLLM (aunque está más orientado a generación) o simplemente una API REST con FastAPI.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 878M parámetros en fp16 en una RTX 4090 puede procesar decenas de imágenes por segundo, pero depende del tamaño de lote y de la resolución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| mathano/medsiglip-448-rocov2-retrieval | 878M | 64 tokens texto, 448x448 imagen | no disponible | Retrieval de imagenes medicas (RoCoV2) |
| google/medsiglip-448 | ~800M (400M vision + 400M texto) | 64 tokens texto, 448x448 imagen | Apache 2.0 (segun GitHub) | Embeddings medicos generales |
| microsoft/BiomedCLIP | ~400M | 77 tokens texto, 224x224 imagen | MIT | Embeddings medicos generales |

La comparativa se basa en los datos públicos de cada modelo. MedSigLIP original tiene una licencia Apache 2.0 según el repositorio de GitHub, pero la licencia del fine-tuning de mathano no está especificada. BiomedCLIP es una alternativa con menor resolución y parámetros, pero con una licencia más permisiva. No se dispone de comparaciones de rendimiento directas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos médicos desidentificados, puede heredar sesgos presentes en los datos originales (por ejemplo, sobrerrepresentación de ciertas poblaciones o modalidades). No se ha documentado una evaluación de sesgos para este fine-tuning.
- Riesgo de alucinación: al ser un modelo de embeddings y no generativo, no produce texto, por lo que el riesgo de alucinación textual es nulo. Sin embargo, la recuperación puede devolver imágenes irrelevantes si la consulta es ambigua o está fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de texto es de solo 64 tokens, lo que limita la complejidad de las consultas. Descripciones largas o con múltiples hallazgos pueden truncarse.
- Restricciones de licencia: la licencia no está especificada en HuggingFace. Esto impide su uso comercial sin una aclaración previa con el autor. Se recomienda contactar con mathano antes de utilizarlo en producción.
- Dominio limitado: el fine-tuning está orientado a RoCoV2, que probablemente contiene radiografías. Su rendimiento en otras modalidades (TC, RM, ecografías) puede ser inferior.
- Sin soporte de generación: no se puede utilizar para redactar informes médicos ni para responder preguntas de forma directa; requiere un modelo generativo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mathano/medsiglip-448-rocov2-retrieval
- MedSigLIP original en HuggingFace: https://huggingface.co/google/medsiglip-448
- Repositorio de Google Health: https://github.com/Google-Health/medsiglip
- Documentación de Google para desarrolladores: https://developers.google.com/health-ai-developer-foundations/medsiglip
