# ajrayman/Gregariousness_binary

## Resumen

El modelo `ajrayman/Gregariousness_binary` es un ajuste fino (fine-tuning) de `roberta-base` orientado a la clasificación binaria de textos, presumiblemente para detectar el rasgo de personalidad "gregariousness" (sociabilidad o extraversión). Lo desarrolla el usuario de HuggingFace `ajrayman`, que ha publicado varios modelos similares con nombres como `Anger_binary` o `Self-consciousness_binary`, lo que sugiere que forma parte de una familia de clasificadores de rasgos psicológicos. El modelo se distribuye con licencia MIT y cuenta con 124.647.170 parámetros, el mismo tamaño que su base RoBERTa-base.

Su relevancia radica en que ofrece una solución ligera y de código abierto para tareas de análisis de texto centradas en la personalidad, un área con aplicaciones en psicología computacional, análisis de redes sociales o recursos humanos. Sin embargo, los resultados de evaluación publicados muestran un rendimiento moderado (accuracy de 0,6351), por lo que debe considerarse como un prototipo o modelo de partida más que como una solución lista para producción. La información disponible es escasa: la model card es autogenerada y no incluye detalles sobre el dataset de entrenamiento ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada; RoBERTa-base soporta 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado (RoBERTa-base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional, desarrollado por Facebook AI como una optimización de BERT. RoBERTa-base tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 124 millones de parámetros. El ajuste fino se realizó sobre un dataset no especificado (la model card indica "None dataset") con una tarea de clasificación binaria.

Los hiperparámetros de entrenamiento declarados son: learning rate de 2e-5, batch size de 32 (tanto para entrenamiento como evaluación), 8 épocas, optimizador Adam con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con warmup ratio de 0.06 y semilla 1234. No se menciona el uso de técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar. El entrenamiento se realizó con la librería Transformers 4.44.1, PyTorch 1.11.0 y Datasets 2.12.0.

## Capacidades

- Clasificación de textos en dos clases (binaria) para un rasgo de personalidad concreto (gregariousness).
- Inferencia rápida y ligera gracias al tamaño moderado de 124M parámetros.
- Compatible con la librería Transformers y con pipelines de `text-classification`.
- No dispone de capacidades de generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- No se ha documentado soporte multilingüe explícito; el modelo base RoBERTa está entrenado principalmente con texto en inglés, aunque puede generalizar parcialmente a otros idiomas.

## Casos de uso

- Análisis de personalidad en redes sociales: el modelo puede clasificar publicaciones o perfiles según el nivel de sociabilidad expresado, útil para estudios sociológicos o de marketing. Su tamaño reducido permite procesar grandes volúmenes de texto sin necesidad de GPUs de alta gama.
- Investigación en psicología computacional: permite etiquetar corpus de texto (por ejemplo, diarios personales, entrevistas) para estudiar correlaciones entre el rasgo de gregariousness y otros factores, sirviendo como primera pasada de clasificación en pipelines de análisis.
- Filtrado de contenido en aplicaciones de RR.HH.: podría usarse como herramienta auxiliar para evaluar la orientación social en respuestas de candidatos, aunque su precisión moderada exige validación humana.
- Sistemas de recomendación de contenido: clasificar artículos o foros según su tono social para personalizar feeds en plataformas comunitarias.
- Chatbots de soporte emocional: integrar el modelo para detectar si un usuario expresa rasgos de sociabilidad y adaptar las respuestas del bot en consecuencia.
- Análisis de reseñas de productos: identificar si una reseña transmite una actitud social o comunitaria, lo que puede ayudar a segmentar opiniones según el perfil del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos en la información disponible. La model card incluye únicamente métricas de evaluación del propio autor sobre un conjunto de evaluación no descrito. A continuación se muestran los valores reportados para la última época (época 4):

| Metrica | Valor |
|---|---|
| Loss | 0.7174 |
| Accuracy | 0.6351 |
| Precision | 0.6378 |
| Recall | 0.6234 |
| F1 | 0.6305 |
| AUC | 0.6976 |

Estos resultados indican un rendimiento moderado, ligeramente superior al azar (0.5 en clasificación binaria), pero lejos de un modelo robusto para producción. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- Inferencia en CPU: viable, ya que 124M parámetros requieren aproximadamente 500 MB de memoria en FP32. Un portátil moderno puede ejecutar el modelo sin problemas.
- VRAM estimada para inferencia: menos de 1 GB en FP32; con cuantización a int8 o int4 (si se aplicara) se reduciría aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas). No requiere GPUs de centro de datos.
- Opciones de despliegue: compatible con HuggingFace Transformers, pipelines de `text-classification`, y puede servirse mediante TGI, vLLM o un endpoint personalizado. También es posible usar ONNX o TensorRT para optimizar la inferencia.
- Latencia y throughput: no hay datos publicados, pero dada la arquitectura y el tamaño, se espera una latencia de milisegundos por lote en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación binaria de gregariousness). Los modelos `ajrayman/Anger_binary` y `ajrayman/Self-consciousness_binary` son aparentemente gemelos para otros rasgos, pero no se han publicado comparaciones entre ellos. Frente al modelo base `roberta-base`, que es un modelo de lenguaje general sin capa de clasificación, este ajuste añade la capacidad específica, aunque a costa de perder generalidad. No se pueden establecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- Rendimiento moderado: con accuracy de 0.6351 y F1 de 0.6305, el modelo comete errores frecuentes y no es adecuado para decisiones críticas sin supervisión humana.
- Dataset de entrenamiento desconocido: la model card no especifica el origen ni la composición de los datos, lo que impide evaluar posibles sesgos o la representatividad de las clases.
- Idioma: no se declara soporte multilingüe; RoBERTa-base está entrenado principalmente en inglés, por lo que su uso en otros idiomas puede degradar significativamente el rendimiento.
- Sin documentación de casos de uso previstos ni limitaciones específicas: la model card es autogenerada y carece de descripción de intenciones.
- Repositorio con tamaño inusualmente grande (13.0 GB) para un modelo de 124M parámetros: puede contener archivos adicionales o versiones de pesos; se recomienda revisar el contenido antes de descargar.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrecen garantías sobre el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajrayman/Gregariousness_binary
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Otros modelos del autor: https://huggingface.co/ajrayman/Anger_binary, https://huggingface.co/ajrayman/Self-consciousness_binary
