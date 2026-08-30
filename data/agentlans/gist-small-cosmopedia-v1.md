# agentlans/GIST-small-cosmopedia-v1

## Resumen

GIST-small-cosmopedia-v1 es un modelo de clasificación de texto basado en la arquitectura BERT, concretamente `BertForSequenceClassification`, desarrollado por agentlans (Alan Tseng) y publicado en Hugging Face. Se trata de un fine-tuning de un modelo BERT sobre el dataset `agentlans/cosmopedia-classification`, derivado del proyecto Cosmopedia de Hugging Face, un conjunto de datos sintéticos de libros de texto, artículos y contenido educativo generado con Mixtral-8x7B-Instruct-v0.1. El modelo está diseñado para asignar uno de 113 temas o categorías a un fragmento de texto, cubriendo un amplio espectro de dominios como ciencia, tecnología, salud, deportes, finanzas, arte y otros.

Con 33,4 millones de parámetros, es un modelo compacto y ligero, adecuado para entornos con recursos limitados. Su relevancia actual radica en su capacidad para etiquetar contenido sintético o educativo de forma automática, una tarea útil en pipelines de curado de datos, organización de corpus y moderación de contenido. La licencia MIT permite su uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción. Sin embargo, sus métricas oficiales (F1 de 0,6313) indican un rendimiento moderado que debe evaluarse según el caso de uso concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForSequenceClassification (BERT base) |
| Parametros totales | 33.403.505 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT original, con un encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, al que se añade una cabeza de clasificación lineal sobre la representación del token `[CLS]`. El fine-tuning se realizó con el objetivo de clasificar texto en 113 etiquetas temáticas, con un vocabulario de 30.522 tokens.

Los hiperparámetros de entrenamiento declarados incluyen una tasa de aprendizaje de 5e-05, tamaño de batch de 8 (tanto para entrenamiento como evaluación), optimizador AdamW (variante fusionada de PyTorch) y 3 épocas. El dataset de entrenamiento, `agentlans/cosmopedia-classification`, se construyó a partir del corpus Cosmopedia, que contiene más de 30 millones de documentos sintéticos y 25 mil millones de tokens generados por Mixtral-8x7B-Instruct-v0.1. No se especifican detalles adicionales sobre la composición exacta del dataset de clasificación ni sobre técnicas como RLHF o DPO, que no son aplicables a esta tarea.

## Capacidades

- Clasificación de textos en 113 categorías temáticas predefinidas, que abarcan desde ciencia y tecnología hasta deportes, salud, finanzas, arte y ocio.
- Soporte para clasificación de secuencias de una sola etiqueta (single-label classification), devolviendo el ID y nombre de la clase predicha.
- Funciona con el pipeline `text-classification` de Hugging Face Transformers, facilitando su integración en flujos existentes.
- Capacidad multilingüe limitada: el modelo está entrenado únicamente en inglés, por lo que no es adecuado para otros idiomas.
- No dispone de capacidades de generación de texto, tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Curado y etiquetado de corpus educativos: el modelo puede asignar automáticamente temas a documentos de un repositorio de contenido educativo, facilitando su indexación y búsqueda posterior.
- Organización de bibliotecas de documentación técnica: clasificar artículos, tutoriales o posts de blogs en categorías como programación, hardware, seguridad o redes, mejorando la navegación interna.
- Moderación de contenido en foros o plataformas de publicación: detectar el tema predominante de un mensaje para aplicar políticas específicas por categoría (por ejemplo, contenido de salud o política).
- Análisis de tendencias temáticas en grandes volúmenes de texto: aplicar el modelo a feeds de noticias o redes sociales para agrupar menciones por dominio y estudiar su evolución temporal.
- Preprocesamiento para pipelines de generación aumentada por recuperación (RAG): etiquetar fragmentos de un corpus para filtrar documentos relevantes según la consulta del usuario.
- Clasificación de contenido generado sintéticamente: verificar que los textos producidos por modelos generativos se adhieren a un tema esperado, útil en flujos de control de calidad.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, sin verificación independiente:

| Tarea | Métrica | Valor |
|---|---|---|
| Text Classification | F1 (evaluación) | 0,6313 |
| Text Classification | Loss (evaluación) | 1,0927 |

No se han publicado comparaciones con otros modelos en la información disponible. El F1 de 0,6313 sobre 113 clases indica un rendimiento moderado, probablemente condicionado por el desequilibrio de clases y la naturaleza sintética del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada: al ser un modelo BERT base con 33,4 millones de parámetros, la inferencia en FP32 requiere aproximadamente 134 MB de memoria para los pesos, más la memoria de activaciones y el tokenizador. En FP16, el requisito baja a unos 67 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas NVIDIA GTX 1050, RTX 2060, T4, etc. También puede ejecutarse en CPU sin problemas para cargas moderadas.
- Es adecuado para entornos de producción con recursos limitados, como instancias de bajo coste en la nube o dispositivos edge.
- Opciones de despliegue: puede servirse con Hugging Face Transformers, ONNX Runtime, TorchServe o mediante contenedores Docker. No se han publicado cuantizaciones GGUF ni soporte nativo para vLLM o llama.cpp (aunque al ser BERT, es posible convertirlo a ONNX).
- Latencia estimada: en CPU moderna, la inferencia de un texto corto (menos de 512 tokens) suele completarse en decenas de milisegundos; en GPU, en pocos milisegundos. No hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de clasificación de texto en la información proporcionada. Como referencia, el modelo se basa en BERT base, por lo que su rendimiento es comparable al de otros fine-tunings de BERT sobre datasets específicos, aunque la F1 de 0,6313 sugiere que el dataset de 113 clases es desafiante. Alternativas habituales para clasificación temática incluyen `distilbert-base-uncased` fine-tuneado (menor coste) o `roberta-base` (potencialmente mayor precisión), pero no se han evaluado en este contexto.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no debe utilizarse para textos en otros idiomas.
- El dataset de entrenamiento es sintético, generado por un modelo de lenguaje grande. Esto puede introducir sesgos y patrones artificiales que no se generalicen bien a texto real del mundo.
- La F1 de 0,6313 es moderada; para aplicaciones críticas se recomienda validar el rendimiento sobre datos propios y considerar un umbral de confianza.
- El número de clases (113) y su solapamiento semántico (por ejemplo, "Business and Entrepreneurship" frente a "Business and Management") puede provocar confusiones en la predicción.
- No se han documentado sesgos específicos, pero al derivar de Cosmopedia, es probable que herede los sesgos de los datos web originales y del modelo generador.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías; el autor no proporciona soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentlans/GIST-small-cosmopedia-v1
- Dataset de clasificación: https://huggingface.co/datasets/agentlans/cosmopedia-classification
- Repositorio de Cosmopedia (código fuente del dataset): https://github.com/huggingface/cosmopedia
- Perfil del autor en Hugging Face: https://huggingface.co/agentlans
