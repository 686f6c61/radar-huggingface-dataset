# Anahii/persian-product-sentiment-mdeberta

## Resumen

El modelo `Anahii/persian-product-sentiment-mdeberta` es un clasificador de sentimiento binario (positivo/negativo) afinado sobre reseñas de productos de comercio electrónico en persa. Desarrollado por el usuario Anahii, parte de la arquitectura mDeBERTa (DeBERTa multilingual) y se publica bajo licencia Apache 2.0. El modelo resuelve la tarea de análisis de sentimiento en textos persas, un ámbito con escasez de recursos lingüísticos específicos, ofreciendo una solución lista para usar en entornos de producción gracias a su compatibilidad con Transformers y Text Embeddings Inference.

Con 278,8 millones de parámetros y un tamaño de repositorio de 1,1 GB, el modelo está optimizado para clasificación de texto y alcanza una precisión del 87,54% en su conjunto de evaluación. Su relevancia radica en la creciente demanda de herramientas de NLP para el persa, especialmente en el sector del comercio electrónico, donde las opiniones de los clientes son fundamentales para la toma de decisiones empresariales. Al estar basado en mDeBERTa, aprovecha las ventajas de un modelo preentrenado multilingüe con atención disentangled, lo que mejora la captación de matices semánticos en textos cortos como reseñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2 multilingual / mDeBERTa) |
| Parametros totales | 278.810.882 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mDeBERTa, la versión multilingüe de DeBERTa (Decoding-enhanced BERT with disentangled attention), que utiliza un mecanismo de atención que modela por separado las representaciones de contenido y posición. La arquitectura es un transformer encoder de tipo denso, sin mezcla de expertos, con 278,8 millones de parámetros. El fine-tuning se realizó sobre un conjunto de reseñas de productos persas, clasificando cada texto en una de dos categorías: positivo o negativo. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO; el proceso se limita a un ajuste supervisado estándar para clasificación de secuencias. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en textos persas, específicamente reseñas de productos.
- Procesamiento de texto corto y mediano, típico de opiniones de comercio electrónico.
- Inferencia eficiente mediante la arquitectura DeBERTa, que mejora la representación de relaciones entre tokens.
- Integración con pipelines de Transformers (`text-classification`) y con Text Embeddings Inference para despliegue en producción.
- Soporte multilingüe heredado del modelo base, aunque el fine-tuning se centra exclusivamente en persa.
- No soporta tool calling, generación de texto libre, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Analisis de opiniones en tiendas online persas: el modelo puede clasificar automáticamente miles de reseñas de productos como positivas o negativas, permitiendo a los responsables de comercio electrónico monitorizar la satisfacción del cliente en tiempo real.
- Moderacion de comentarios en plataformas de venta: integrado en un pipeline de moderación, el modelo puede filtrar reseñas negativas extremas para priorizar la atención al cliente o detectar problemas recurrentes.
- Estudios de mercado para marcas que operan en Iran: las empresas pueden usar el modelo para analizar el sentimiento hacia sus productos o los de la competencia a partir de reseñas extraídas de sitios como Digikala o Bamilo.
- Mejora de motores de recomendacion: el sentimiento clasificado puede usarse como señal para ajustar recomendaciones de productos, priorizando aquellos con valoraciones mayoritariamente positivas.
- Investigacion academica en PLN persa: el modelo sirve como punto de partida o referencia para experimentos de análisis de sentimiento en persa, dado su buen rendimiento y licencia permisiva.
- Integracion en sistemas de gestion de relaciones con clientes (CRM): las reseñas clasificadas pueden alimentar dashboards que correlacionen sentimiento con métricas de ventas o devoluciones.

## Benchmarks y rendimiento

El autor publicó los siguientes resultados de evaluación sobre su conjunto de prueba:

| Metrica | Score |
|---|---|
| Accuracy | 87,54% |
| Macro F1-Score | 87,54% |
| Macro Precision | 87,55% |
| Macro Recall | 87,58% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 278,8 millones de parámetros. En FP32 los pesos ocupan aproximadamente 1,1 GB, por lo que una GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. En FP16 se reduce a ~0,56 GB.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU para inferencia simple, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: compatible con Transformers (PyTorch), Text Embeddings Inference (TEI), y puede exportarse a ONNX o TensorRT para optimización. No se han encontrado cuantizaciones GGUF ni integraciones con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090) se espera una latencia por muestra inferior a 10 ms para textos de 128 tokens, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparación cuantitativa con otros modelos de análisis de sentimiento en persa. Existen alternativas como ParsBERT (basado en BERT) o modelos multilingües como XLM-R, pero no se han encontrado datos de rendimiento comparables en la información proporcionada. La comparación queda pendiente de futuras evaluaciones.

## Limitaciones y advertencias

- El modelo solo distingue entre positivo y negativo; no contempla sentimiento neutro ni matices como sarcasmo o ironía, lo que puede limitar su precisión en textos ambiguos.
- El entrenamiento se realizó sobre reseñas de productos persas, por lo que su rendimiento puede degradarse en otros dominios (noticias, redes sociales, textos formales).
- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre un dataset no público, es posible que herede sesgos de género, marca o categoría de producto presentes en los datos de origen.
- La longitud de contexto no está especificada; el modelo base mDeBERTa suele soportar 512 tokens, pero no se confirma para este fine-tuning.
- No se ofrecen garantías sobre el rendimiento en producción; el autor no ha publicado un conjunto de validación independiente ni estudios de robustez.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los datos de entrenamiento para evitar problemas de propiedad intelectual.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad ni probado en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anahii/persian-product-sentiment-mdeberta
- Modelo base mDeBERTa: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset Sentipers (GitHub): https://github.com/mohammadheidari1386/sentiment-analysis
- Referencia de datasets persas para análisis de sentimiento: https://github.com/Persian-AI/Persian_Sentiment_Analysis_Datasets_2
- Articulo sobre analisis de sentimiento en persa (ACM): https://dl.acm.org/doi/epdf/10.1145/3723178.3723238
