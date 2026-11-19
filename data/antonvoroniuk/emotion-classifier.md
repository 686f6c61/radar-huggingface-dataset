# AntonVoroniuk/emotion-classifier

## Resumen

Emotion classifier es un modelo de clasificación de texto corto en inglés, desarrollado por AntonVoroniuk, que asigna a cada mensaje una de seis emociones: sadness, joy, love, anger, fear y surprise. Se trata de un fine-tuning de distilbert-base-uncased realizado sobre una muestra de 2.000 ejemplos del conjunto de datos dair-ai/emotion. El modelo está pensado explícitamente como una demostración didáctica, no como un componente listo para producción.

Con 66.958.086 parámetros y un repositorio de 0,3 GB en formato safetensors, el modelo se sitúa en la categoría de los transformers pequeños y ligeros, adecuados para inferencia en CPU o en GPU de consumo. Su valor ahora mismo es acotado: sirve para ilustrar el flujo completo de fine-tuning de un modelo BERT destilado para clasificación multietiqueta y para experimentar con tareas de análisis de sentimiento a nivel de emoción.

La relevancia práctica del modelo es limitada por su propio diseño: entrenamiento de una sola pasada sobre una muestra reducida, datos fuertemente desbalanceados y ausencia de validación publicada. Cualquier uso real debería tratarlo como punto de partida y no como solución final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés únicamente (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas obtenido por destilación de BERT-base, con 66,9 millones de parámetros. Sobre esa base se añade una cabeza de clasificación de secuencia con seis salidas (una por emoción) y se realiza un fine-tuning supervisado estándar sobre texto corto.

El entrenamiento se llevó a cabo sobre 2.000 ejemplos del dataset dair-ai/emotion, en una única pasada (single epoch). No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos. La model card reporta una pérdida final de entrenamiento de aproximadamente 1,2, frente a 1,8 de una predicción aleatoria, lo que indica una capacidad de ajuste modesta. El dataset de origen está fuertemente desbalanceado: la clase "surprise" tiene aproximadamente una décima parte de ejemplos que "joy", lo que degrada la fiabilidad de esa etiqueta. No se menciona ningún proceso de validación cruzada ni conjunto de test independiente.

## Capacidades

- Clasificación de texto corto en inglés en seis emociones: sadness, joy, love, anger, fear y surprise.
- Salida de etiqueta única por secuencia (clasificación multiclase, no multietiqueta).
- Inferencia rápida y ligera gracias al tamaño reducido del encoder destilado.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Análisis de sentimiento a nivel de emoción en encuestas: procesar respuestas abiertas cortas de usuarios y agruparlas por tono emocional para priorizar revisiones manuales, aprovechando la baja latencia del modelo.
- Moderación de comunidades en línea: clasificar mensajes breves de foros o chats para detectar tonos de anger o fear y derivarlos a revisión humana, como filtro de primera capa.
- Etiquetado asistido de datasets: usar el modelo para preetiquetar corpus de texto corto en inglés y reducir el coste de anotación manual, aceptando una tasa de error moderada.
- Investigación académica y docencia: servir de ejemplo reproducible de fine-tuning de DistilBERT para clasificación de secuencias en cursos y talleres.
- Análisis de reseñas de producto: clasificar reseñas cortas en inglés por emoción dominante para complementar métricas de sentimiento positivo/negativo.
- Prototipado rápido de pipelines NLP: validar arquitecturas de clasificación y flujos de preprocesado antes de invertir en modelos mayores o en anotación a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento final (aproximadamente 1,2) frente a la pérdida de una predicción aleatoria (aproximadamente 1,8), sin métricas de exactitud, F1 ni evaluación sobre conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (66,9 millones de parámetros), aproximadamente 0,3 GB en FP16.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son suficientes.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia en tiempo real con lotes pequeños.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversión a ONNX Runtime para CPU; llama.cpp y Ollama no son aplicables de forma estándar a un encoder de clasificación; vLLM y TGI no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AntonVoroniuk/emotion-classifier | 66,9 M | 512 (heredado) | Clasificación de 6 emociones | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base (MLM) | apache-2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | no disponible | 512 | Clasificación de emociones | no disponible | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | no disponible | 512 | Clasificación de emociones (7 clases) | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría se limita a los datos disponibles; no se han publicado métricas de rendimiento para este modelo que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado sobre solo 2.000 ejemplos y una única pasada: la precisión es modesta, según reconoce el propio autor.
- Dataset de origen fuertemente desbalanceado: la etiqueta "surprise" es la menos fiable por tener aproximadamente una décima parte de ejemplos que "joy".
- Solo admite inglés y texto corto informal; no se ha probado con escritura formal ni con otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en clases minoritarias.
- No se documentan sesgos demográficos ni de dominio; al ser una muestra pequeña, es probable que generalice mal fuera del estilo de dair-ai/emotion.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías de calidad para producción.
- No hay conjunto de validación ni test publicado, por lo que no es posible estimar el rendimiento real fuera de entrenamiento.
- No debe usarse como único mecanismo en decisiones sensibles (moderación, salud mental) sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AntonVoroniuk/emotion-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
