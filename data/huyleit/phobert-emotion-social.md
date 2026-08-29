# huyleit/phobert-emotion-social

## Resumen

El modelo **huyleit/phobert-emotion-social** es un fine-tuning de **PhoBERT-base** (arquitectura RoBERTa monolingüe para vietnamita, desarrollada por VinAIResearch) especializado en la clasificación de emociones en textos de redes sociales en vietnamita. Ha sido entrenado por el autor huyleit como parte de un sistema de microservicios para el proyecto SE121, orientado a la concienciación sobre salud mental en redes sociales. El modelo distingue siete clases de emoción: disfrute, tristeza, asco, ira, miedo, sorpresa y otras/neutral.

Su relevancia radica en que aborda un problema específico del procesamiento de lenguaje natural vietnamita: la detección de emociones en lenguaje informal, con slang y teencode, habitual en plataformas como Facebook, Threads o VNExpress. Con 135 millones de parámetros, es un modelo ligero y fácil de desplegar, adecuado para tareas de análisis de sentimiento y moderación de contenido en entornos de producción con recursos limitados. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhoBERT-base (RoBERTa) |
| Parametros totales | 135.003.655 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PhoBERT-base es un modelo transformer basado en la arquitectura RoBERTa, preentrenado por VinAIResearch sobre un gran corpus monolingüe vietnamita. En este caso, el modelo ha sido fine-tuned para la tarea de clasificación de secuencias con una cabeza de clasificación de 7 clases. No se dispone de información detallada sobre el dataset de fine-tuning (número de muestras, composición, método de entrenamiento) más allá de la referencia a un "Vietnamese Social Media Emotion Dataset" de tipo custom. Tampoco se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar.

No se documentan innovaciones técnicas específicas en el proceso de entrenamiento. El modelo hereda las capacidades de PhoBERT-base para el procesamiento de texto vietnamita, incluyendo el manejo de caracteres y tokenización adaptada a este idioma.

## Capacidades

- Clasificación de emociones en texto vietnamita en 7 categorías: disfrute, tristeza, asco, ira, miedo, sorpresa y otras/neutral.
- Procesamiento de lenguaje informal, incluyendo slang y teencode típico de redes sociales vietnamitas.
- Inferencia de texto mediante pipeline de HuggingFace (`text-classification`) o con `AutoModelForSequenceClassification`.
- Salida de probabilidades por clase, lo que permite umbrales personalizados según el caso de uso.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- **Monitoreo de salud mental en redes sociales**: el modelo puede analizar comentarios en Facebook o Threads para detectar señales de tristeza, miedo o ira, permitiendo a moderadores o sistemas automáticos priorizar intervenciones de apoyo.
- **Moderación de contenido**: clasificar comentarios con alto contenido de ira o asco para derivarlos a revisión humana, reduciendo la exposición a discursos de odio o acoso.
- **Análisis de sentimiento de marca**: medir la reacción emocional de los usuarios ante campañas publicitarias o lanzamientos de productos en plataformas sociales vietnamitas, segmentando por tipo de emoción.
- **Atención al cliente automatizada**: enrutar mensajes de usuarios según su estado emocional (por ejemplo, ira o frustración) hacia agentes especializados o respuestas predefinidas con tono adecuado.
- **Investigación social y académica**: analizar corpus de redes sociales vietnamitas para estudiar patrones emocionales en diferentes contextos (política, cultura, eventos).
- **Sistemas de recomendación de contenido**: adaptar el contenido mostrado al usuario según su estado emocional inferido, aunque debe aplicarse con cautela por implicaciones éticas.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0.6377 |
| F1 (macro) | 0.6356 |

Además, la model card incluye un desglose por clase sobre un conjunto de test de 1.482 muestras:

| Emocion | Precision | Recall | F1-Score | Soporte |
|---|---|---|---|---|
| Enjoyment | 0.7962 | 0.7017 | 0.7459 | 295 |
| Sadness | 0.5887 | 0.6791 | 0.6307 | 215 |
| Disgust | 0.5924 | 0.5203 | 0.5540 | 271 |
| Anger | 0.7351 | 0.7083 | 0.7215 | 192 |
| Fear | 0.6450 | 0.6301 | 0.6374 | 173 |
| Surprise | 0.5897 | 0.6434 | 0.6154 | 143 |
| Other | 0.5044 | 0.5907 | 0.5442 | 193 |
| **Overall** | - | - | **63.77%** | 1482 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 135 millones de parámetros, la inferencia puede ejecutarse en CPU con un rendimiento aceptable para tareas por lotes.
- En GPU, cabe en tarjetas con 2 GB de VRAM o menos en FP32; con cuantización a 8 bits o 4 bits, el consumo se reduce aún más.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, etc.) es suficiente para inferencia en tiempo real.
- Opciones de despliegue: compatible con HuggingFace Transformers, ONNX Runtime, y puede exportarse a formatos como GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

Existen otros modelos fine-tuned de PhoBERT para clasificación de emociones en vietnamita, como **visolex/emotion-phobert-v1**, que también utiliza PhoBERT-base y el dataset VSMEC. Sin embargo, no se dispone de métricas públicas comparables para este modelo. El modelo base **vinai/phobert-base** es el punto de partida común, pero no está especializado en emociones.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| huyleit/phobert-emotion-social | 135M | no disponible | Clasificacion de emociones (7 clases) | MIT |
| visolex/emotion-phobert-v1 | 135M (estimado) | no disponible | Clasificacion de emociones (7 clases) | no disponible |
| vinai/phobert-base | 135M | 256 (segun documentacion de PhoBERT) | Modelo base de lenguaje | MIT |

Nota: los datos de visolex/emotion-phobert-v1 no han sido verificados en la informacion disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en vietnamita; no es utilizable para otros idiomas.
- La precisión global es moderada (63,77% de accuracy), con un rendimiento especialmente bajo en las clases "Disgust" y "Other", lo que puede generar errores en producción si se requiere alta fiabilidad.
- El dataset de entrenamiento no está documentado públicamente, por lo que se desconocen posibles sesgos en la representación de dialectos, registros o grupos demográficos.
- El lenguaje de redes sociales evoluciona rápidamente; el modelo puede degradarse ante nuevas expresiones o teencode no presentes en el entrenamiento.
- No se han realizado evaluaciones de robustez ante ataques adversariales o textos fuera de dominio.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías de rendimiento ni soporte técnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huyleit/phobert-emotion-social
- Repositorio de PhoBERT (VinAIResearch): https://github.com/VinAIResearch/PhoBERT
- Modelo similar visolex/emotion-phobert-v1: https://huggingface.co/visolex/emotion-phobert-v1
- Colección de reconocimiento de emociones de visolex: https://huggingface.co/collections/visolex/emotion-recognition-6853c6c4f3647be7587d6b1d
