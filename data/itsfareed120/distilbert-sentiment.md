# itsfareed120/distilbert-sentiment

## Resumen

DistilBERT Sentiment es un modelo de clasificación de texto en inglés especializado en análisis de sentimiento binario (positivo/negativo) sobre reseñas de películas. Lo desarrolla el usuario itsfareed120 y se publica bajo licencia MIT. Se trata de un fine-tuning del modelo base `distilbert/distilbert-base-uncased`, una versión destilada de BERT con 66.955.010 parámetros, sobre el conjunto de datos IMDb Movie Reviews.

El modelo resuelve una tarea acotada y bien definida: asignar una etiqueta de polaridad a un fragmento de texto en inglés de hasta 256 tokens. No está pensado como un modelo generativo ni como un asistente conversacional, sino como un clasificador ligero para integrar en pipelines de análisis de opiniones, moderación o enriquecimiento de datos.

Su relevancia es limitada y muy específica: el entrenamiento se realizó con solo 2.000 muestras de entrenamiento y 500 de test, una época y una longitud máxima de secuencia de 256 tokens. Esto lo sitúa como un experimento de fine-tuning más que como un modelo listo para producción a gran escala, aunque su tamaño reducido (0,3 GB de repositorio) y su licencia permisiva lo hacen fácil de desplegar y evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia usada en entrenamiento; límite arquitectónico de DistilBERT: 512) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT base uncased, un transformer encoder de 6 capas y 66 millones de parámetros obtenido mediante destilación de conocimiento de BERT base. Sobre esa base se añade una cabeza de clasificación de secuencia con dos etiquetas (0: negativo, 1: positivo). El tokenizador es el WordPiece uncased propio de DistilBERT, por lo que el texto se normaliza a minúsculas y se trunca a 256 tokens.

El fine-tuning se realizó con Hugging Face Transformers durante una sola época, con batch size de 8 y longitud máxima de 256, sobre 2.000 muestras de entrenamiento del dataset IMDb Movie Reviews y 500 de test. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, ni se detalla la composición exacta del subconjunto de IMDb empleado. La innovación técnica es nula más allá del propio proceso de destilación heredado del modelo base: no hay decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en texto en inglés.
- Análisis de opiniones sobre reseñas de películas, dominio para el que fue entrenado.
- Procesamiento de secuencias de hasta 256 tokens.
- Inferencia ligera y rápida gracias a los 66,9 millones de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe: no disponible; únicamente inglés.

## Casos de uso

- Análisis de opiniones en reseñas de cine: el modelo clasifica críticas de películas en positivas o negativas, su dominio de entrenamiento directo, con una precisión reportada del 86 % sobre el conjunto de test del autor.
- Enriquecimiento de datasets de opiniones: se puede usar para etiquetar automáticamente grandes volúmenes de reseñas en inglés antes de un análisis agregado, dado su bajo coste computacional por inferencia.
- Filtrado y moderación de comentarios: clasificar comentarios de usuarios en plataformas de contenido audiovisual para priorizar la revisión de los negativos, como señal auxiliar y no como decisión final.
- Prototipado rápido de pipelines de NLP: servir como línea base de clasificación de sentimiento en un entorno de desarrollo antes de invertir en modelos mayores o en datos propios.
- Evaluación comparativa de fine-tunings: al ser un experimento reproducible con hiperparámetros documentados (1 época, batch 8, 256 tokens), resulta útil como referencia en estudios sobre el efecto del tamaño del dataset en DistilBERT.
- Integración en aplicaciones de bajo consumo: despliegue en CPU o GPUs de gama baja para clasificación en tiempo real de textos cortos en inglés, donde un modelo de 67 millones de parámetros es suficiente.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor sobre 500 muestras de test del dataset IMDb:

| Metrica | Valor |
|---|---:|
| Accuracy | 86,00 % |
| Precision | 84,92 % |
| Recall | 86,99 % |
| F1 Score | 85,94 % |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2) ni comparaciones con otros modelos en la información disponible. Los datos anteriores corresponden exclusivamente al conjunto de test definido por el autor y no son directamente comparables con evaluaciones sobre el split oficial de IMDb.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB de pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones; en la práctica cabe holgadamente en cualquier GPU.
- En FP16: aproximadamente 0,13 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4090, T4, A100 o H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: viable para cargas moderadas; el modelo es lo bastante pequeño para inferencia en CPU con latencia de milisegundos por muestra.
- Opciones de despliegue: Hugging Face Transformers (`pipeline`), ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque estos últimos están orientados a modelos generativos y aportan poco aquí).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| itsfareed120/distilbert-sentiment | 66,9 M | 256 tokens | MIT | en | Fine-tuning sobre 2.000 muestras de IMDb |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache 2.0 | en | Fine-tuning oficial sobre SST-2, referencia habitual en análisis de sentimiento |
| roberta-base (fine-tuned para sentimiento) | 125 M | 512 tokens | MIT | en | Mayor capacidad, requiere más recursos |
| bert-base-uncased (fine-tuned para sentimiento) | 110 M | 512 tokens | Apache 2.0 | en | Base no destilada, más lento que DistilBERT |

Los datos de rendimiento de los modelos alternativos no se incluyen en la información disponible, por lo que no se ofrece comparación cuantitativa. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con solo 2.000 muestras y una época: riesgo alto de sobreajuste y de baja generalización fuera del dominio IMDb.
- Evaluación sobre un conjunto de test propio de 500 muestras, no sobre el split oficial de IMDb; los resultados pueden no ser representativos.
- Especializado en reseñas de películas en inglés: el rendimiento en otros dominios (productos, redes sociales, atención al cliente) no está validado.
- Sesgos conocidos: no documentados por el autor; al entrenar solo con IMDb, puede heredar sesgos de ese corpus (vocabulario, temáticas y estilos de crítica cinematográfica).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas confiadas en textos ambiguos, irónicos o con negaciones complejas.
- Límite de 256 tokens: los textos más largos se truncan, lo que puede perder información relevante para la polaridad.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base (Apache 2.0) y del dataset IMDb en el contexto de uso previsto.
- No apto como sistema único de decisión en producción sin validación adicional sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsfareed120/distilbert-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDb Movie Reviews: https://huggingface.co/datasets/stanfordnlp/imdb
- Documentación de Transformers (pipeline de text-classification): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
