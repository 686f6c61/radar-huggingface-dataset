# ajrayman/Emotionality_continuous

## Resumen

Emotionality_continuous es un modelo de clasificación de texto fine-tuneado sobre roberta-base, desarrollado por el usuario ajrayman. Está diseñado para predecir una puntuación continua de emocionalidad en textos, es decir, estimar en qué medida un texto expresa o transmite emoción. El modelo forma parte de una serie de modelos similares del mismo autor (Morality_continuous, machiavellianism_continuous) orientados a la medición de rasgos psicológicos en texto.

Con 124,6 millones de parámetros, hereda la arquitectura transformer de RoBERTa y su ventana de contexto de 512 tokens. La licencia MIT permite uso comercial sin restricciones. Aunque la model card es escasa y no detalla el dataset de entrenamiento, las métricas de evaluación reportadas (RMSE 0,196, MAE 0,156, correlación 0,303) sugieren un modelo funcional para tareas de regresión emocional, aunque con precisión moderada. Su relevancia radica en la creciente demanda de herramientas de análisis afectivo en aplicaciones de IA conversacional, análisis de sentimiento y monitorización de salud mental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de roberta-base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (depende del dataset de fine-tuning, no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder de 12 capas con atención multi-cabeza y embeddings posicionales. El fine-tuning se realizó sobre una tarea de regresión con salida continua (probablemente una capa lineal sobre el token [CLS]) para predecir un valor de emocionalidad. Los hiperparámetros de entrenamiento incluyen learning rate 2e-5, batch size 32, 8 épocas, optimizador Adam y scheduler lineal con warmup del 6%. El dataset de entrenamiento no está especificado en la model card ("None dataset"), lo que impide conocer su composición o tamaño. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Regresión de emocionalidad: predice una puntuación continua (probablemente en un rango normalizado) que indica el grado de emoción expresado en un texto.
- Clasificación de texto: al ser un modelo de transformers, puede procesar cualquier texto de hasta 512 tokens y devolver una salida numérica.
- Multilingüe: depende del idioma del dataset de entrenamiento, no especificado; roberta-base está entrenado principalmente en inglés, por lo que es probable que funcione mejor en inglés.
- Sin capacidades de generación, tool calling, agentes o visión: es un modelo exclusivamente discriminativo para análisis de sentimiento/emoción.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede puntuar la emocionalidad de tweets o publicaciones para monitorizar reacciones del público ante eventos o campañas, aunque su correlación moderada (0,30) limita la precisión en decisiones críticas.
- Moderación de contenido en foros: asignar una puntuación de emocionalidad a comentarios para priorizar la revisión humana de aquellos con alta carga emocional (potencialmente tóxicos o conflictivos).
- Evaluación de respuestas de chatbots: medir si las respuestas generadas por un asistente virtual transmiten la emoción deseada (empatía, entusiasmo) en entornos de atención al cliente.
- Investigación en psicología computacional: cuantificar la emocionalidad en diarios personales, entrevistas o textos clínicos para estudios longitudinales, siempre que se valide la correlación con escalas humanas.
- Análisis de reseñas de productos: complementar el análisis de sentimiento binario con una medida continua de intensidad emocional, útil para identificar reseñas extremadamente positivas o negativas.
- Monitorización de salud mental en plataformas digitales: detectar textos con alta emocionalidad (posible angustia) en comunidades online, aunque requiere validación adicional y supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación del autor:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,0385 |
| RMSE | 0,1961 |
| MAE | 0,1559 |
| Correlación (Corr) | 0,3034 |

Estas métricas indican un error absoluto medio de aproximadamente 0,156 en la escala de salida (probablemente 0-1), y una correlación baja-moderada con las etiquetas humanas. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 125M parámetros, la inferencia en FP32 requiere ~500 MB de VRAM; en FP16 ~250 MB. Cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior ofrece margen para batch grande.
- Despliegue: compatible con Transformers (PyTorch), ONNX Runtime, y puede exportarse a TensorRT. No se han publicado archivos GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión.
- Latencia: en una GPU consumer, la inferencia de un texto de 512 tokens tarda ~10-20 ms; en CPU, ~100-200 ms. Throughput estimado de cientos de peticiones por segundo en GPU con batching.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la misma categoría (regresión de emocionalidad continua). El autor ha publicado otros modelos similares (Morality_continuous, machiavellianism_continuous) que comparten arquitectura y metodología, pero no se han publicado sus métricas. Alternativas genéricas de análisis de sentimiento como `cardiffnlp/twitter-roberta-base-sentiment` (clasificación discreta) o `j-hartmann/emotion-english-roberta-base` (clasificación de emociones) existen, pero no son directamente comparables por su naturaleza categórica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: al estar basado en roberta-base, puede heredar sesgos de género, raza o cultura presentes en los datos de preentrenamiento. El dataset de fine-tuning no está documentado, por lo que no se puede evaluar su impacto.
- Alucinación: al ser un modelo discriminativo, no genera texto, por lo que el riesgo de alucinación es nulo; el riesgo es de predicción errónea de la puntuación emocional.
- Precisión limitada: la correlación de 0,30 con etiquetas humanas es baja; no debe usarse para decisiones automatizadas sin supervisión humana.
- Idioma: no se especifican los idiomas soportados; probablemente funcione mejor en inglés, con degradación en otros idiomas.
- Contexto limitado: ventana de 512 tokens, insuficiente para documentos largos.
- Documentación incompleta: la model card no detalla el dataset, el rango de salida ni el procedimiento de etiquetado, lo que dificulta la reproducibilidad y la interpretación de las puntuaciones.
- Licencia MIT: permite uso comercial, pero el usuario debe asumir la responsabilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Emotionality_continuous
- Modelo relacionado (Morality_continuous): https://huggingface.co/ajrayman/Morality_continuous
- Modelo relacionado (machiavellianism_continuous): https://huggingface.co/ajrayman/machiavellianism_continuous
- Paper de referencia sobre IA y emociones (contexto general): https://arxiv.org/pdf/2508.10286
- Estudio sobre alineación de IA con emociones humanas: https://www.sciencedirect.com/science/article/pii/S2949782524000185
