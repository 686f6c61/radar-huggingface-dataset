# FarazAbdulMuqtader/roman-urdu-sentiment-xlmr

## Resumen

El modelo `roman-urdu-sentiment-xlmr` es un clasificador de sentimiento en tres clases (positivo, negativo y neutral) especializado en texto en urdu romanizado, es decir, urdu escrito con caracteres latinos, muy común en redes sociales, chats y comentarios de plataformas como WhatsApp, YouTube o Twitter. Ha sido desarrollado por Faraz Abdul Muqtader (también publicado bajo el perfil Inferencelab) como parte del proyecto RomanUrdu-NLP, y consiste en un fine-tuning del modelo multilingüe XLM-RoBERTa-base sobre un subconjunto de 3.000 muestras del corpus público RomanUrdu-NLP-Sentiment-Corpus.

El modelo resuelve el problema del análisis de sentimiento en un idioma y escritura poco representados en los modelos comerciales, donde el urdu romanizado mezcla inglés y urdu de forma informal. Su relevancia radica en que ofrece una alternativa ligera y de código abierto (licencia MIT) para tareas de clasificación de texto en este dominio, aunque su rendimiento actual está limitado por el pequeño tamaño del subconjunto de entrenamiento y muestra un sesgo conocido hacia la clase negativa. La arquitectura es un transformer encoder (XLM-RoBERTa-base) con 278 millones de parámetros y una longitud de contexto de 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors, sin GGUF) |
| Idiomas soportados | Urdu romanizado (escritura latina), con codigo mixto urdu-ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-base, un transformer encoder multilingüe preentrenado por Facebook AI sobre 2,5 TB de datos filtrados de CommonCrawl en más de 100 idiomas. El fine-tuning se realizó sobre un subconjunto de 3.000 muestras del dataset Khubaib01/RomanUrdu-NLP-Sentiment-Corpus (que contiene aproximadamente 129.000 filas en total), con el objetivo de validar el pipeline completo; el entrenamiento con el dataset completo está planificado como siguiente paso. Los hiperparámetros de entrenamiento fueron: 2 épocas, batch size de 16, learning rate de 2e-5, optimizador AdamW y una longitud máxima de secuencia de 128 tokens. No se aplicaron técnicas de RLHF ni DPO; se trata de un fine-tuning supervisado estándar para clasificación de secuencias con tres etiquetas (positivo, negativo, neutral).

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutral) para texto en urdu romanizado.
- Manejo de texto informal de redes sociales, incluyendo jerga, abreviaturas y codigo mixto urdu-ingles.
- Inferencia rápida y ligera gracias a su tamaño moderado (278M de parámetros).
- Integración sencilla con la librería transformers mediante `AutoModelForSequenceClassification`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Monitoreo de marca en redes sociales: analizar comentarios de Twitter, Instagram o Facebook en urdu romanizado para detectar opiniones positivas o negativas sobre un producto o servicio, usando el modelo como parte de un pipeline de scraping y agregación de sentimiento.
- Atención al cliente automatizada: clasificar mensajes entrantes de usuarios en chats de soporte (WhatsApp Business, Messenger) para priorizar quejas o reclamaciones urgentes, gracias a su capacidad de procesar texto informal y coloquial.
- Análisis de comentarios de YouTube: categorizar los comentarios de vídeos en urdu romanizado para medir la recepción de contenido, identificando tendencias de sentimiento en la audiencia.
- Investigación académica en PLN de bajo recurso: servir como modelo de referencia para experimentos de análisis de sentimiento en urdu romanizado, comparando su rendimiento con otros enfoques tradicionales o LLMs.
- Moderación de contenido en foros y comunidades: detectar mensajes con tono negativo o abusivo en plataformas comunitarias donde se use urdu romanizado, ayudando a los moderadores a priorizar revisiones.
- Análisis de encuestas y feedback: procesar respuestas abiertas en urdu romanizado de formularios o encuestas de satisfacción para extraer una métrica de sentimiento agregada.

## Benchmarks y rendimiento

El autor evaluó el modelo sobre un conjunto de prueba independiente de 600 muestras. Los resultados reportados son:

| Etiqueta | Precision | Recall | F1-score |
|---|---|---|---|
| Positivo | 0,64 | 0,63 | 0,63 |
| Negativo | 0,54 | 0,83 | 0,66 |
| Neutral | 0,76 | 0,30 | 0,43 |

**Accuracy global: 59,83%**

No se han publicado comparaciones con otros modelos en la información disponible. El autor indica que el bajo recall de la clase neutral se debe al número limitado de ejemplos neutrales en el subconjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB en fp32 (278M de parámetros), por lo que cabe en cualquier GPU consumer moderna (4 GB o más). Con cuantización a fp16 o int8, el requisito baja a unos 0,6-0,8 GB.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.). También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (Python), Hugging Face Inference Endpoints, TGI (Text Generation Inference) para clasificación de secuencias, o exportación a ONNX para entornos de producción.
- Latencia y throughput: no disponible en la información proporcionada, pero al ser un modelo de 278M de parámetros, la inferencia en GPU es del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos fine-tuneados para la misma tarea en la información proporcionada. Como referencia, el modelo base XLM-RoBERTa-base no está especializado en urdu romanizado y no produce clasificación de sentimiento sin fine-tuning. Existe un modelo hermano, `Khubaib01/roman-urdu-emotion-xlmr`, también basado en XLM-RoBERTa, pero orientado a clasificación de emociones y sin métricas públicas comparables. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgo conocido hacia la clase negativa: el modelo tiende a clasificar frases neutrales o de desdén (por ejemplo, expresiones coloquiales como "chalo choro") como negativas, debido al desequilibrio de clases en el subconjunto de entrenamiento.
- Entrenamiento limitado: solo se usaron 3.000 muestras de un corpus de 129.000, lo que reduce la generalización y la robustez ante variaciones del lenguaje.
- Longitud de contexto corta: 128 tokens, insuficiente para textos largos o conversaciones multi-turno.
- Cobertura idiomática restringida: solo urdu romanizado; no funciona con urdu en escritura árabe ni con otros idiomas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas en entradas ambiguas o fuera de dominio.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo no está listo para producción sin un reentrenamiento completo con el dataset íntegro y una evaluación más exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarazAbdulMuqtader/roman-urdu-sentiment-xlmr
- Repositorio del proyecto RomanUrdu-NLP: https://github.com/Inference-LAB/RomanUrdu-NLP
- Ficha del modelo en el repositorio: https://github.com/Inference-LAB/RomanUrdu-NLP/blob/main/models/roman-urdu-sentiment-xlmr.md
- Dataset de entrenamiento: https://huggingface.co/datasets/Khubaib01/RomanUrdu-NLP-Sentiment-Corpus
- Modelo hermano de emociones: https://huggingface.co/Khubaib01/roman-urdu-emotion-xlmr
- Artículo de investigación relacionado (IEEE): https://ieeexplore.ieee.org/document/11330087
