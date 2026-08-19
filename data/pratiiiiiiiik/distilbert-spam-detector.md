# Pratiiiiiiiik/distilbert-spam-detector

## Resumen

El modelo `Pratiiiiiiiik/distilbert-spam-detector` es un clasificador de texto basado en la arquitectura DistilBERT, un transformer encoder destilado de BERT que reduce el número de parámetros y acelera la inferencia manteniendo un rendimiento cercano al modelo original. Ha sido desarrollado por el usuario Pratiiiiiiiik y publicado en Hugging Face con el pipeline `text-classification`, lo que indica que su función principal es asignar una etiqueta binaria (probablemente spam o no spam) a mensajes de texto, correos electrónicos o cualquier contenido textual.

El modelo cuenta con 66.955.010 parámetros, un tamaño moderado que lo hace adecuado para entornos con recursos limitados, como CPUs o GPUs de gama baja. Aunque la model card no proporciona detalles sobre el conjunto de datos de entrenamiento, el hiperparámetro de contexto y los idiomas soportados, su arquitectura y tamaño sugieren que puede ser una opción ligera para tareas de filtrado de spam en producción. Su relevancia radica en la creciente necesidad de sistemas de moderación automática eficientes y de bajo coste, especialmente en aplicaciones móviles, servicios de mensajería o sistemas de correo electrónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un modelo transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado del modelo BERT-base mediante destilación de conocimiento. La destilación reduce el número de capas a la mitad (de 12 a 6) y elimina los token type embeddings, lo que resulta en un modelo un 40% más pequeño y un 60% más rápido en inferencia, manteniendo aproximadamente el 97% de las capacidades lingüísticas de BERT. El modelo aquí presentado ha sido fine-tuneado para la tarea de clasificación de texto, específicamente para detectar spam, aunque no se especifican los datos de entrenamiento, el número de épocas, la tasa de aprendizaje ni el régimen de precisión (fp32, fp16, etc.). Tampoco se indica si se emplearon técnicas de regularización o aumentación de datos.

## Capacidades

- Clasificación binaria de texto: el modelo asigna una etiqueta de spam o no spam a un texto de entrada.
- Inferencia eficiente: gracias a la arquitectura destilada, es adecuado para despliegue en entornos con recursos computacionales limitados.
- Compatible con la librería `transformers` y con `text-embeddings-inference`, lo que facilita su integración en pipelines existentes.
- Soporte para inferencia en endpoints compatibles con Hugging Face (según los tags `endpoints_compatible`).
- No se han documentado capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multimodal.

## Casos de uso

- Filtrado de correo electrónico: el modelo puede clasificar mensajes entrantes como spam o no spam, integrándose en servidores de correo mediante una API REST o un pipeline de `transformers`. Su tamaño reducido permite ejecutarlo en un VPS con CPU sin necesidad de GPU.
- Moderación de comentarios en foros y redes sociales: puede detectar mensajes no deseados o publicidad en tiempo real, ayudando a mantener la calidad de las conversaciones en plataformas comunitarias.
- Clasificación de SMS en aplicaciones móviles: gracias a su bajo consumo de memoria, puede desplegarse en dispositivos móviles o en servidores backend para filtrar mensajes de texto no deseados.
- Detección de mensajes fraudulentos en sistemas de mensajería instantánea: puede identificar intentos de phishing o estafas que suelen llegar por WhatsApp, Telegram u otras aplicaciones.
- Automatización de tickets de soporte: puede preclasificar los mensajes de los usuarios como spam o relevantes, priorizando los tickets legítimos para el equipo de atención al cliente.
- Análisis de reseñas de productos: puede filtrar reseñas falsas o promocionales no relacionadas con la experiencia real del usuario en plataformas de comercio electrónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. Tampoco se encontraron evaluaciones externas en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 66,9 millones de parámetros, en fp32 el modelo ocupa aproximadamente 268 MB, y en fp16 unos 134 MB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o incluso en CPU con memoria RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o GPUs de centros de datos como T4 o A10. También puede ejecutarse en CPU sin problemas para cargas moderadas.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: puede servirse mediante vLLM, Hugging Face Inference Endpoints, o mediante la librería `transformers` con PyTorch. También es posible exportarlo a ONNX para optimización en CPU.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos por muestra en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de detección de spam. Existen alternativas en Hugging Face como `AventIQ-AI/distilbert-spam-detector` o `AventIQ-AI/distilbert-spam-detection`, ambas basadas también en DistilBERT y fine-tuneadas para la misma tarea, pero no se han encontrado datos públicos de rendimiento que permitan comparar. A nivel de arquitectura, cualquier modelo DistilBERT fine-tuneado para clasificación de texto tendrá características similares en cuanto a tamaño y velocidad, pero la calidad dependerá del conjunto de datos de entrenamiento, que aquí no se documenta.

## Limitaciones y advertencias

- Sesgos desconocidos: al no documentarse el conjunto de entrenamiento, no es posible evaluar posibles sesgos de género, raza o idioma. El modelo podría comportarse de forma desigual en diferentes variedades lingüísticas o dominios.
- Riesgo de falsos positivos y negativos: como cualquier clasificador de spam, puede clasificar erróneamente mensajes legítimos como spam o viceversa, especialmente si el texto de entrada difiere del dominio de entrenamiento.
- Longitud de contexto limitada: aunque no se especifica, DistilBERT base tiene una ventana de contexto de 512 tokens. Textos más largos deberán truncarse, lo que podría perder información relevante.
- Sin garantías de precisión: al no publicarse métricas de evaluación, no hay evidencia objetiva de su rendimiento en tareas reales.
- Licencia no especificada: no se indica la licencia del modelo, por lo que su uso comercial podría estar restringido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Model card incompleta: la documentación es una plantilla automática sin detalles técnicos, lo que dificulta la reproducibilidad y la auditoría del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Pratiiiiiiiik/distilbert-spam-detector)
- [AventIQ-AI/distilbert-spam-detector (modelo similar)](https://huggingface.co/AventIQ-AI/distilbert-spam-detector/blob/main/DistilBERT_Spam_Detector.md)
- [AventIQ-AI/distilbert-spam-detection (modelo similar)](https://huggingface.co/AventIQ-AI/distilbert-spam-detection)
- [Repositorio GitHub de ejemplo de detección de spam con DistilBERT](https://github.com/lahiruimesh/SMS-Spam-Detector-using-DistilBERT)
