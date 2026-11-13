# nguyenblog/phobert-threads-sentiment

## Resumen
PhoBERT-threads-sentiment es un modelo de clasificación de texto publicado en Hugging Face por el usuario nguyenblog. Por su identificador y por la arquitectura declarada (roberta), se trata de un ajuste fino de la familia PhoBERT, un modelo basado en RoBERTa preentrenado específicamente para vietnamita, orientado a análisis de sentimiento sobre contenido de la plataforma Threads. El repositorio contiene únicamente pesos en formato safetensors y una model card autogenerada sin información sustantiva.

El modelo tiene 135.000.579 parámetros, lo que coincide con la configuración base de RoBERTa (12 capas, 768 dimensiones ocultas y vocabulario ampliado para vietnamita), y ocupa 0,5 GB en el repositorio. Es un modelo encoder-only, por tanto adecuado para tareas de clasificación y no para generación de texto libre. La etiqueta de pipeline es text-classification.

La relevancia de esta ficha es limitada: no hay métricas publicadas, ni descripción del dataset de entrenamiento, ni licencia declarada, ni idiomas confirmados en los metadatos. Cualquier evaluación de idoneidad para producción debe hacerse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer, base) |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (por el nombre, presumiblemente vietnamita; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura declarada es RoBERTa, un transformer encoder-only con atención bidireccional. El recuento de parámetros (135 millones) encaja con la variante base de RoBERTa, que emplea 12 capas, 12 cabezas de atención y 768 dimensiones ocultas. Al tratarse de un ajuste fino para clasificación, la cabeza de modelado de lenguaje enmascarado se sustituye por una cabeza de clasificación con el número de etiquetas correspondiente al problema de sentimiento.

No hay información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el esquema de etiquetas ni si se aplicaron técnicas de aumento de datos o validación cruzada. Tampoco se documenta si el ajuste se hizo sobre PhoBERT original o sobre otra variante, ni los hiperparámetros empleados. La model card es la plantilla autogenerada de Hugging Face y no aporta ningún detalle técnico.

## Capacidades
- Clasificación de texto: el pipeline declarado es text-classification, orientado a asignar una etiqueta de sentimiento a un texto de entrada.
- Análisis de sentimiento sobre publicaciones y comentarios de Threads, según indica el nombre del modelo.
- Procesamiento de texto en vietnamita: presumible por la elección de PhoBERT, aunque no está confirmado en los metadatos.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.
- No hay evidencia de soporte multilingüe más allá del idioma de entrenamiento.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades de agente.

## Casos de uso
- Moderación de comunidades en Threads: clasificar publicaciones y respuestas por polaridad para priorizar revisiones humanas en colas de moderación, aprovechando que el modelo está ajustado al dominio de esa plataforma.
- Monitorización de reputación de marca: procesar en lote menciones y comentarios recogidos vía API para agregar sentimiento por producto o campaña y alimentar paneles de analítica.
- Análisis de opinión de clientes en vietnamita: si se confirma el idioma, aplicar el modelo a reseñas y tickets para enrutar automáticamente los casos negativos a equipos de soporte.
- Investigación en ciencias sociales: etiquetar corpus de conversaciones en Threads para estudios de polarización o dinámica de discurso, con validación manual de una muestra para estimar el acuerdo.
- Filtrado previo en pipelines de datos: descartar o marcar contenido claramente negativo o positivo antes de pasarlo a modelos generativos más costosos, reduciendo el volumen a procesar.
- Prototipado rápido de clasificadores de sentimiento: servir de línea base con la librería transformers para comparar contra modelos propios antes de invertir en un ajuste específico.
- Enrutamiento de feedback en aplicaciones: integrar el modelo como microservicio que etiqueta mensajes entrantes y decide si escalan a un humano o se responden automáticamente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos, más memoria de activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,27 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes en producción; para uso individual, cualquier GPU con 4 GB o más es suficiente.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI) para clasificación, o exportación a ONNX para inferencia optimizada. No se dispone de pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles; al ser un encoder de 135 millones de parámetros, se espera latencia de milisegundos por muestra en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nguyenblog/phobert-threads-sentiment | 135 M | no disponible | no disponible | no disponible | safetensors |
| FacebookAI/roberta-base | 125 M | 512 tokens | inglés principalmente | MIT | safetensors, pytorch |
| vinai/phobert-base | 135 M | 256 tokens | vietnamita | MIT | pytorch |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | inglés | MIT | safetensors, pytorch |

La comparación se limita a parámetros, contexto y licencia, ya que no hay métricas de rendimiento publicadas para el modelo objeto de esta ficha. Frente a roberta-base y phobert-base, comparte tamaño pero carece de documentación sobre licencia y datos; frente a los modelos de sentimiento de Twitter, la diferencia principal es el dominio de entrenamiento declarado (Threads frente a Twitter) y la ausencia de validación pública.

## Limitaciones y advertencias
- No hay licencia declarada: no puede asumirse uso comercial sin contactar con el autor.
- No se especifican los idiomas de entrenamiento; el uso con textos en castellano no está respaldado por ninguna evidencia.
- No hay métricas de evaluación, por lo que se desconoce la precisión real y el posible desequilibrio entre clases.
- La model card es una plantilla autogenerada: no documenta sesgos, composición del dataset ni procedencia de los datos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o con jerga de la plataforma.
- El contexto máximo no está confirmado; si sigue la configuración de PhoBERT, podría estar limitado a 256 tokens, lo que restringe textos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Para producción se recomienda evaluar en un conjunto propio anotado y considerar el ajuste de un PhoBERT o RoBERTa documentado si los resultados no son satisfactorios.

## Enlaces
- Hugging Face: https://huggingface.co/nguyenblog/phobert-threads-sentiment
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Repositorio de PhoBERT (referencia de la familia de modelos): https://github.com/VinAIResearch/PhoBERT
- Modelo base PhoBERT en Hugging Face: https://huggingface.co/vinai/phobert-base
- Documentación de RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/roberta
