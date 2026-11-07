# nikname22/ufa-wildfeedback-satisfaction-mbert

## Resumen

UFA WildFeedback satisfaction es un clasificador de texto de tres clases (satisfacción, insatisfacción y ausencia de señal) construido mediante fine-tuning del encoder multilingüe `google-bert/bert-base-multilingual-cased`. Lo publica el usuario `nikname22` en el contexto del proyecto académico INF01100 (Grupo 16), y deriva del conjunto de datos `microsoft/WildFeedback`, en concreto de la anotación `sat_dsat_annotation`. El modelo está pensado para detectar señales de satisfacción o descontento en el feedback de usuarios de sistemas conversacionales, una tarea relevante para pipelines de alineación y evaluación de asistentes basados en LLM.

Arquitectura transformer encoder (BERT base) con una cabeza lineal de tres clases añadida sobre el pooled output. El checkpoint se publica bajo licencia MIT y declara soporte para inglés y portugués, aunque el encoder base es multilingüe y cubre 104 idiomas. En el momento de redactar esta ficha, el repositorio no contiene los pesos entrenados: la model card indica explícitamente que el checkpoint se anexará tras la corrida oficial con las semillas 0, 1 y 2.

La relevancia del modelo es doble: por un lado, aplica el corpus WildFeedback (20.281 pares de preferencia derivados de 148.715 conversaciones reales usuario-ChatGPT) a una tarea de clasificación ligera; por otro, sirve como ejemplo de reutilización de un encoder multilingüe de 178M de parámetros para tareas de moderación y análisis de feedback sin necesidad de infraestructura de GPU de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con cabeza lineal de 3 clases |
| Parametros totales | ~178 M (heredados de bert-base-multilingual-cased) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, pt (declarados); el encoder base soporta 104 idiomas |
| Licencia | MIT |
| Formato de pesos | no disponible (los pesos aún no se han publicado) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un vocabulario multilingüe de aproximadamente 119.000 tokens. Sobre el vector `[CLS]` se añade una cabeza lineal de tres unidades que produce logits para las clases satisfacción (SAT), insatisfacción (DSAT) y sin señal. La función de pérdida es entropía cruzada sin ponderación por clase, según indica la model card.

El fine-tuning se realiza sobre la anotación `sat_dsat_annotation` del dataset `microsoft/WildFeedback`, un corpus construido a partir de conversaciones reales entre usuarios y ChatGPT en las que se detectan expresiones explícitas o implícitas de insatisfacción. El dataset original contiene 20.281 pares de preferencia extraídos de 148.715 conversaciones multiturno. No se especifican en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño de batch ni la composición exacta del split de entrenamiento. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineación, algo esperable en un clasificador supervisado de este tipo.

## Capacidades

- Clasificación de texto en tres clases: satisfacción, insatisfacción y ausencia de señal.
- Análisis de feedback de usuario en conversaciones con asistentes LLM.
- Soporte multilingüe limitado a los idiomas declarados (inglés y portugués), aunque el encoder subyacente cubre más idiomas.
- Inferencia ligera en CPU o GPU de consumo gracias al tamaño de 178M de parámetros.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo thinking.
- No soporta visión, audio ni otras modalidades.
- No genera texto: la salida es una etiqueta con su distribución de probabilidad.

## Casos de uso

- Monitorización de satisfacción en atención al cliente: el clasificador puede etiquetar cada turno de una conversación con un asistente virtual y alimentar dashboards de calidad, aprovechando la ventana de 512 tokens para analizar mensajes individuales o pares pregunta-respuesta.
- Filtrado previo en pipelines de alineación: dado que WildFeedback se diseñó para alineación con feedback in-situ, el modelo puede usarse como primer filtro para seleccionar conversaciones con señal de insatisfacción antes de aplicar técnicas como DPO o RLHF.
- Investigación académica en análisis de feedback: útil como baseline reproducible en estudios sobre detección de descontento en diálogos, con la ventaja de una licencia MIT permisiva y un tamaño que permite entrenar y evaluar en una sola GPU.
- Moderación de comunidades y foros: clasificación de mensajes de usuarios en inglés o portugués para detectar frustración y priorizar respuestas del equipo de soporte.
- Análisis de encuestas abiertas: procesamiento de respuestas de texto libre para agregar métricas de satisfacción (SAT/DSAT/sin señal) a escala, con inferencia en CPU a bajo coste.
- Enrutamiento inteligente de tickets: los mensajes clasificados como DSAT pueden derivarse automáticamente a agentes humanos o a colas de escalado, reduciendo el tiempo de respuesta en casos críticos.
- Evaluación de asistentes conversacionales: uso como métrica auxiliar para comparar versiones de un chatbot midiendo la proporción de turnos con señal de insatisfacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint entrenado se anexará tras la corrida oficial con las semillas 0, 1 y 2, por lo que no existen métricas de accuracy, F1 ni comparaciones con otros clasificadores en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos (178M parámetros × 4 bytes) más overhead de activaciones, en torno a 1-1,5 GB en total.
- VRAM estimada en fp16: aproximadamente 0,35 GB para los pesos, con un total de inferencia por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModelForSequenceClassification`), ONNX Runtime, TorchScript, o servidores de inferencia como TGI y vLLM (soporte de encoders limitado en vLLM). llama.cpp y Ollama no están orientados a clasificadores BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en la práctica, un BERT base procesa cientos de secuencias por segundo en una GPU moderna con batch adecuado, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikname22/ufa-wildfeedback-satisfaction-mbert | ~178 M | 512 | Clasificación 3 clases (SAT/DSAT/sin señal) | MIT | Pesos no publicados aún |
| google-bert/bert-base-multilingual-cased | ~178 M | 512 | Encoder base multilingüe | Apache 2.0 | Pesos disponibles |
| roberta-base | ~125 M | 512 | Encoder base en inglés | MIT | Pesos disponibles |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | Análisis de sentimiento (3 clases) | MIT | Pesos disponibles |

La comparación directa con clasificadores de sentimiento comerciales no es posible sin métricas publicadas. El modelo se diferencia de los encoders base en que está especializado en la tarea SAT/DSAT sobre feedback conversacional, pero su utilidad práctica queda condicionada a la publicación de los pesos.

## Limitaciones y advertencias

- Los pesos del modelo no están publicados en el repositorio; la model card indica que se anexarán tras la corrida oficial. No es posible usar el modelo en producción en el estado actual.
- El modelo se entrena sobre feedback de conversaciones con ChatGPT, lo que puede introducir sesgos hacia los patrones de expresión de ese asistente y no generalizar a otros dominios.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí riesgo de falsos positivos y falsos negativos en la detección de insatisfacción, especialmente en mensajes irónicos o ambiguos.
- Cobertura de idiomas limitada a inglés y portugués según la model card, aunque el encoder base es multilingüe; el rendimiento en otros idiomas no está documentado.
- Ventana de contexto de 512 tokens: los mensajes o hilos más largos requieren truncado o segmentación, lo que puede perder señal relevante.
- Licencia MIT permisiva para uso comercial, pero al derivar de `bert-base-multilingual-cased` (Apache 2.0) conviene verificar el cumplimiento de las condiciones de atribución del modelo base.
- No se documentan sesgos demográficos, de género ni culturales; al tratarse de un fine-tuning sobre conversaciones reales, es probable que herede sesgos presentes en el corpus WildFeedback.
- El proyecto tiene carácter académico (INF01100, Grupo 16) y no se aporta información sobre validación externa, calibración de probabilidades ni robustez frente a adversarial inputs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikname22/ufa-wildfeedback-satisfaction-mbert
- Repositorio del proyecto: https://github.com/JoaoVitorBaggio/UserFeedbackAnalysis
- Dataset WildFeedback en Hugging Face: https://huggingface.co/datasets/microsoft/WildFeedback
- Paper WildFeedback (arXiv): https://arxiv.org/html/2408.15549v2
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
