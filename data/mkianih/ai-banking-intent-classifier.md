# mkianih/ai-banking-intent-classifier

## Resumen

El modelo `mkianih/ai-banking-intent-classifier` es un clasificador de intenciones de texto especializado en el dominio bancario, desarrollado por el autor mkianih. Se basa en el modelo transformer `roberta-base` de Facebook AI, fine-tuneado con la técnica LoRA (Low-Rank Adaptation) sobre el dataset Banking77, que contiene 77 intenciones de atención al cliente en banca (consultas de saldo, transferencias, reclamaciones de tarjetas, etc.). El resultado es un modelo compacto de 124,7 millones de parámetros que clasifica consultas de usuarios en una de las 77 categorías predefinidas, con una precisión reportada del 92,05 %.

La relevancia de este modelo radica en su aplicación práctica para sistemas de atención al cliente automatizada en el sector financiero, donde la detección precisa de la intención del usuario es el primer paso para enrutar consultas, activar flujos de resolución o integrarse con asistentes virtuales. Al emplear LoRA, el fine-tuning fue eficiente en cómputo y los adaptadores se han fusionado con los pesos base, por lo que el checkpoint resultante se carga como un modelo estándar de clasificación de secuencias con la librería transformers.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, e incluye un `LabelEncoder` de scikit-learn en formato joblib para mapear los índices de clase a los nombres de las intenciones. Está disponible en HuggingFace con pesos en formato safetensors, aunque no se especifican cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (Transformer encoder) con cabecera de clasificación de secuencias |
| Parametros totales | 124.704.845 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de RoBERTa-base) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo base RoBERTa está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (además incluye `label_encoder.joblib`) |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con el objetivo de enmascarado de lenguaje (MLM) sobre un corpus de inglés (libros, Wikipedia, etc.). Sobre esta base se añadió una cabecera de clasificación de secuencias con 77 salidas, correspondientes a las intenciones del dataset Banking77.

El fine-tuning se realizó mediante LoRA, una técnica de adaptación de bajo rango que congela los pesos preentrenados e inyecta matrices de descomposición entrenables en las capas de atención, reduciendo drásticamente el número de parámetros a optimizar. Tras el entrenamiento, los adaptadores LoRA se fusionaron con los pesos base, de modo que el checkpoint final contiene todos los parámetros del modelo y se puede cargar con `AutoModelForSequenceClassification` sin necesidad de infraestructura adicional. El dataset de entrenamiento, Banking77, contiene 13.083 frases de consultas bancarias en inglés, cada una etiquetada con una de 77 intenciones de soporte al cliente. No se dispone de información sobre el número de épocas, la tasa de aprendizaje ni el proceso de validación empleado, más allá de las métricas reportadas.

## Capacidades

- Clasificación de intenciones en texto: asigna una de 77 categorías predefinidas (por ejemplo, "transferencia de fondos", "bloqueo de tarjeta", "consulta de saldo") a una frase de entrada.
- Manejo de texto corto y conversacional: adecuado para mensajes de chat o consultas de soporte, dada la ventana de contexto de 512 tokens.
- Integración con pipelines de procesamiento de lenguaje natural: se puede usar como componente de un sistema de enrutamiento o de un asistente virtual.
- Incluye un `LabelEncoder` serializado para traducir las salidas numéricas a nombres legibles de intención.
- No es un modelo generativo: no produce texto, solo clasifica.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un clasificador discriminativo.

## Casos de uso

- Enrutamiento de consultas en banca digital: dado un mensaje del cliente, el modelo identifica la intención y dirige la conversación al flujo de resolución adecuado (por ejemplo, reclamación de cargo, cambio de PIN, solicitud de préstamo). Su precisión del 92 % lo hace viable como primer filtro en sistemas de ticketing.
- Automatización de atención al cliente por chat: integrado en un bot, clasifica la petición del usuario y dispara respuestas predefinidas o acciones transaccionales, reduciendo la carga del personal humano.
- Análisis de tickets de soporte existentes: permite etiquetar históricos de conversaciones para generar métricas de frecuencia por tipo de problema y detectar cuellos de botella en el servicio.
- Filtrado y priorización de incidencias: en un sistema de correo o formulario, clasifica la urgencia o el tipo de reclamación para priorizar la cola de atención.
- Entrenamiento de modelos más grandes: el clasificador puede servir como generador de pseudoetiquetas para preentrenar o destilar conocimiento en modelos más ligeros para despliegue en dispositivos con pocos recursos.
- Evaluación de calidad de agentes humanos: comparando la intención predicha con la categorización manual de un agente, se pueden detectar desviaciones en la gestión de consultas.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de validación (no se especifica si es el split oficial de Banking77):

| Metrica | Valor |
|---|---|
| Accuracy | 92,05 % |
| Macro F1 | 92,05 % |
| Weighted F1 | 92,05 % |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni detalles sobre el split de entrenamiento/validación. Tampoco se proporcionan curvas de aprendizaje ni análisis de errores por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,7 millones de parámetros, en precisión fp32 el modelo ocupa aproximadamente 500 MB en memoria. En fp16 serían ~250 MB. Se puede ejecutar en CPU con un consumo de RAM inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas modernas). No requiere hardware de gama alta.
- Es viable en CPU para inferencia en tiempo real con lotes pequeños (latencia típica de decenas de milisegundos por frase en un procesador moderno).
- Opciones de despliegue: al ser un checkpoint estándar de transformers, se puede servir con HuggingFace Inference Endpoints, o mediante frameworks como FastAPI + ONNX Runtime para optimizar la latencia. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Para entrenamiento o fine-tuning adicional, una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3070 o superior) es suficiente, dado que LoRA reduce los requisitos de memoria.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. El modelo base `roberta-base` sin fine-tuning tiene una precisión muy inferior en esta tarea (no se reporta), y otros clasificadores de intenciones bancarias como `banking77` de PolyAI (un modelo BERT fine-tuneado) podrían ser alternativas, pero no hay datos públicos de comparación en esta ficha. Por tanto, la comparativa queda pendiente de verificación externa.

## Limitaciones y advertencias

- Sesgos y cobertura de dominio: el modelo se entrenó exclusivamente con el dataset Banking77, que contiene frases en inglés de un contexto bancario específico. No se garantiza su rendimiento con otros idiomas, jerga financiera regional o consultas fuera de las 77 categorías.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar una intención incorrecta con alta confianza. La precisión del 92 % implica que aproximadamente 1 de cada 12 consultas se clasifica mal, lo que debe tenerse en cuenta en sistemas críticos.
- Limitaciones de contexto: la ventana de 512 tokens es suficiente para consultas cortas, pero no para documentos extensos o conversaciones de varias vueltas sin truncamiento.
- Dependencia del LabelEncoder: el archivo `label_encoder.joblib` debe mantenerse junto al modelo para interpretar las salidas. Si se pierde o se modifica el orden de las clases, las predicciones no serán legibles.
- Licencia MIT: permite uso comercial, pero el modelo base RoBERTa está sujeto a la licencia MIT de Facebook AI, sin restricciones adicionales conocidas.
- Sin garantías de precisión en producción: el autor no proporciona detalles sobre el split de evaluación ni sobre la robustez ante ruido, entradas adversariales o variaciones de formato (mayúsculas, errores tipográficos, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkianih/ai-banking-intent-classifier
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Repositorio del autor (código, notebook y capa de redacción de PII): https://github.com/mkianih/ai-banking-intent-classifier
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
