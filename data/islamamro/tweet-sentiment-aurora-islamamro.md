# Islamamro/tweet-sentiment-aurora-islamamro

## Resumen

El modelo `Islamamro/tweet-sentiment-aurora-islamamro` es un clasificador de sentimiento en tres clases (negativo, neutral, positivo) para tweets, desarrollado por el usuario `islamamro` como demostración del pipeline de entrenamiento y publicación del **Aurora Research Portal**. Se trata de un fine-tuning de `distilbert-base-uncased` sobre un subconjunto de 1.400 ejemplos del dataset `SetFit/tweet_sentiment_extraction`. El autor indica explícitamente que es una prueba de concepto del flujo build→train→publish, no un modelo listo para producción. Con 66,9 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en ilustrar un proceso completo de fine-tuning y publicación, más que en su rendimiento, que se limita a una precisión del 0,76 en un conjunto de validación retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base uncased (fine-tuned) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset en ingles, no declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una versión destilada de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que conserva aproximadamente el 97% del rendimiento de BERT con un 40% menos de parámetros. Se ha fine-tuneado para clasificación de secuencias con una cabeza de clasificación de 3 salidas. El entrenamiento se realizó sobre un subconjunto de 1.400 ejemplos del dataset `SetFit/tweet_sentiment_extraction`, que contiene tweets etiquetados con sentimiento. No se especifican hiperparámetros, número de épocas ni técnica de optimización. El autor menciona que el entrenamiento se llevó a cabo en una NVIDIA RTX 3090. No hay indicios de uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de sentimiento en tres clases: negativo, neutral y positivo.
- Procesamiento de texto corto, típico de tweets y publicaciones en redes sociales.
- Inferencia rápida gracias a la arquitectura DistilBERT, adecuada para entornos con recursos limitados.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales.
- No se ha documentado soporte multilingüe; el dataset de entrenamiento es en inglés.

## Casos de uso

- Análisis de sentimiento en redes sociales para monitorización de marca: el modelo puede clasificar menciones de una marca en tweets, aunque su baja precisión y entrenamiento limitado lo hacen inadecuado para producción sin un fine-tuning adicional sobre datos completos.
- Prototipado rápido de pipelines de NLP: sirve como ejemplo funcional para validar la integración de Hugging Face Transformers en un proyecto antes de invertir en un modelo más robusto.
- Demostración educativa del flujo de fine-tuning: permite a estudiantes y desarrolladores comprender el proceso de entrenar y publicar un modelo de clasificación de texto con pocos recursos.
- Pruebas de concepto en entornos de investigación: puede utilizarse para experimentar con técnicas de aumento de datos o ajuste de hiperparámetros sobre un subconjunto pequeño.
- Evaluación de la viabilidad de DistilBERT para tareas de análisis de sentimiento en dominios específicos, antes de escalar a modelos más grandes.
- Integración en aplicaciones de análisis de opiniones en tiempo real con requisitos de latencia baja, siempre que se acepte la degradación de precisión.

## Benchmarks y rendimiento

La única métrica publicada es la precisión en un conjunto de validación retenido:

| Metrica | Valor |
|---|---|
| Precisión (hold-out) | 0,76 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE. Tampoco se ofrecen comparaciones con otros modelos de clasificación de sentimiento. Dado el tamaño del subconjunto de entrenamiento (1.400 ejemplos), es esperable que el rendimiento sea inferior al de modelos entrenados con datasets completos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (66,9M parámetros ≈ 268 MB de pesos, más overhead de activaciones y optimizador). Con cuantización a int8, podría reducirse a ~200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3090 (usada en el entrenamiento) o incluso integradas modernas.
- Ejecución en CPU: viable para inferencia en lote, con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, TensorRT, y servidores de inferencia como vLLM o TGI (aunque estos últimos están orientados a modelos generativos, también sirven para clasificación).
- Latencia estimada: en una GPU consumer moderna, la inferencia de una sola muestra debería completarse en menos de 10 ms; en CPU, entre 20 y 50 ms.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A modo de referencia cualitativa, se pueden mencionar alternativas conocidas en el mismo dominio:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Islamamro/tweet-sentiment-aurora-islamamro | 66,9M | no disponible | Apache-2.0 | Entrenado en 1.400 ejemplos, demo |
| cardiffnlp/twitter-roberta-base-sentiment | ~125M | 512 | MIT | Entrenado en ~58M tweets, referencia en análisis de sentimiento |
| distilbert-base-uncased-finetuned-sst-2 | ~67M | 512 | Apache-2.0 | Fine-tuning en SST-2, precisión ~0.91 |

No se han encontrado benchmarks que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Entrenado únicamente sobre 1.400 ejemplos, lo que limita severamente su generalización y lo hace propenso a sobreajuste.
- Precisión de 0,76 en hold-out, insuficiente para aplicaciones de producción donde se requiera fiabilidad.
- No se han documentado sesgos específicos, pero al ser un modelo basado en DistilBERT y entrenado en tweets, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación no aplica directamente (no es generativo), pero sí puede producir clasificaciones erróneas en textos con sarcasmo, ironía o lenguaje coloquial.
- No se especifica la longitud máxima de entrada; DistilBERT típicamente soporta 512 tokens, pero no está confirmado en la ficha.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja su uso en producción sin un fine-tuning adicional sobre el dataset completo.
- No se proporcionan detalles sobre el preprocesamiento de texto, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Islamamro/tweet-sentiment-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/tweet_sentiment_extraction
- Perfil de GitHub del autor: https://github.com/islamamro
- Blog de Hugging Face sobre análisis de sentimiento en Twitter: https://huggingface.co/blog/sentiment-analysis-twitter
