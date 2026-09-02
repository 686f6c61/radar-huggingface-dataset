# aniketchinchkar/banking77-distilbert-lora

## Resumen

El modelo `aniketchinchkar/banking77-distilbert-lora` es un clasificador de intenciones bancarias basado en DistilBERT con adaptadores LoRA (Low-Rank Adaptation). Desarrollado por aniketchinchkar y publicado en Hugging Face, su propósito es clasificar consultas de clientes en el dominio bancario dentro de una de las 77 categorías definidas por el dataset Banking77. Este dataset, creado por PolyAI, contiene 13 083 consultas etiquetadas y cubre operaciones como transferencias, bloqueo de tarjetas, reclamaciones y soporte técnico.

El modelo resuelve un problema concreto de procesamiento de lenguaje natural: el enrutamiento automático de mensajes de atención al cliente hacia el departamento o flujo de respuesta adecuado. Su relevancia radica en que permite automatizar la primera línea de soporte en banca digital, reduciendo tiempos de respuesta y liberando agentes humanos para casos complejos. La arquitectura combina el encoder transformer destilado de DistilBERT (66 millones de parámetros aproximadamente) con la técnica de fine-tuning eficiente LoRA, que entrena solo una fracción de los pesos. La longitud de contexto está limitada a 512 tokens, suficiente para la mayoría de consultas bancarias.

La ficha oficial del modelo es extremadamente escasa: no se especifican licencia, idiomas, hiperparámetros ni resultados de evaluación. Toda la información técnica adicional que se pueda inferir proviene de la arquitectura base de DistilBERT y del dataset Banking77.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) con adaptadores LoRA |
| Parametros totales | No disponible (DistilBERT base tiene ~66M, pero no se confirma) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de DistilBERT) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset Banking77 está en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

DistilBERT es un modelo transformer encoder destilado de BERT, con 6 capas ocultas, 768 dimensiones de embedding y 12 cabezas de atención, frente a las 12 capas de BERT base. Fue entrenado mediante destilación de conocimiento, lo que reduce el tamaño en un 40% y acelera la inferencia en un 60% manteniendo el 97% del rendimiento. Sobre esta base se aplica LoRA, una técnica de fine-tuning que congela los pesos preentrenados e inyecta matrices de baja dimensión en las capas de atención, reduciendo drásticamente el número de parámetros entrenables.

El entrenamiento se realizó sobre el dataset Banking77, compuesto por 13 083 consultas de clientes bancarios etiquetadas con 77 intenciones distintas. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el tamaño de lote ni si se aplicaron técnicas de regularización adicionales. Tampoco se indica si se utilizó entrenamiento de precisión mixta o algún esquema de validación. La ausencia de estos detalles en la model card impide conocer las condiciones exactas del fine-tuning, aunque la combinación de DistilBERT y LoRA es un enfoque estándar para clasificación de texto con pocos recursos computacionales.

## Capacidades

- Clasificación de intenciones en 77 categorías bancarias definidas por el dataset Banking77, como transferencias, consultas de saldo, bloqueo de tarjetas, reclamaciones, apertura de cuentas, entre otras.
- Acepta texto libre en inglés (presumiblemente, dado el dataset) y devuelve una etiqueta de intención con su probabilidad asociada.
- Inferencia rápida gracias a la arquitectura ligera de DistilBERT y a la eficiencia de LoRA, adecuada para despliegue en entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso. Es estrictamente un modelo discriminativo para clasificación.
- No se han documentado capacidades multilingües; el dataset de entrenamiento es exclusivamente en inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo puede enrutar consultas entrantes de clientes bancarios hacia el flujo de respuesta adecuado (por ejemplo, "transferencia no recibida" frente a "cambio de PIN") en función de la intención detectada, reduciendo el tiempo medio de resolución.
- Chatbots de soporte bancario: integrado en un sistema conversacional, permite que el bot identifique la intención del usuario en el primer mensaje y ofrezca respuestas predefinidas o acciones específicas, sin necesidad de menús complejos.
- Clasificación de tickets de soporte: en un sistema de ticketing, cada consulta recibida por correo o formulario web se etiqueta automáticamente con una de las 77 categorías, facilitando la asignación al equipo responsable y el análisis posterior de volúmenes por tipo de incidencia.
- Escalamiento inteligente a agentes humanos: combinado con un umbral de confianza, el modelo puede derivar automáticamente a un agente humano aquellas consultas cuya probabilidad de clasificación sea baja, evitando respuestas erróneas en casos ambiguos.
- Análisis de tendencias en consultas bancarias: al clasificar históricamente las consultas recibidas, se pueden detectar picos en categorías concretas (por ejemplo, reclamaciones por comisiones) y orientar decisiones de producto o comunicación.
- Integración en sistemas de voz (IVR): aunque el modelo trabaja con texto, puede procesar transcripciones de llamadas para clasificar la razón del contacto y dirigir la llamada al departamento correcto en sistemas de respuesta de voz interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores sobre Banking77. Tampoco se especifica si el modelo supera o iguala a otros fine-tunings de DistilBERT sobre el mismo dataset. Se recomienda al usuario evaluar el modelo con el conjunto de test de Banking77 antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión fp32 para una entrada de 512 tokens, dada la ligereza de DistilBERT. Con cuantización a int8 o fp16, el consumo se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, T4, V100, o incluso CPU sola para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna, incluidas RTX 3060 o superiores, con margen amplio.
- Opciones de despliegue: se puede servir con la librería Transformers de Hugging Face, exportar a ONNX para inferencia optimizada, o usar soluciones como FastAPI con TorchServe. No se ha verificado compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia estimada: en CPU moderna, una inferencia de un texto corto (menos de 100 tokens) suele tardar entre 10 y 50 ms; en GPU, por debajo de 5 ms. El throughput depende del hardware y del tamaño de lote, pero es típicamente alto para un modelo de esta escala.

## Comparativa con modelos similares

El modelo se puede comparar con otros clasificadores de intenciones sobre Banking77, aunque no se dispone de resultados numéricos de ninguno de ellos en la información recopilada.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aniketchinchkar/banking77-distilbert-lora | DistilBERT + LoRA | ~66M base, entrenables desconocidos | 512 | No disponible | Hugging Face |
| Dey-Koushik/banking77-intent-classifier | DistilBERT (fine-tuning completo) | ~66M | 512 | No especificada | GitHub |
| Otros clasificadores BERT-base sobre Banking77 | BERT base | ~110M | 512 | Varía | Hugging Face / GitHub |

La principal diferencia con un fine-tuning completo de DistilBERT es que LoRA entrena muchos menos parámetros, lo que reduce el coste de entrenamiento y el riesgo de sobreajuste, aunque puede sacrificar algo de rendimiento si el dataset es pequeño. No se puede afirmar cuál es mejor sin datos de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Banking77 puede contener sesgos hacia el inglés británico y hacia vocabulario específico de banca digital, lo que limita su uso en otros dialectos o contextos financieros.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede asignar etiquetas incorrectas con alta confianza en consultas fuera de su dominio.
- Limitaciones de contexto: la ventana de 512 tokens es suficiente para consultas cortas, pero fallará en mensajes largos o con múltiples intenciones.
- Restricciones de licencia: no se ha declarado licencia, lo que impide conocer si el modelo puede usarse comercialmente. Se recomienda contactar al autor antes de cualquier despliegue en producción.
- Idioma: no se ha confirmado el soporte multilingüe; el entrenamiento con Banking77 sugiere que solo funciona bien en inglés.
- Falta de documentación: la model card no aporta detalles sobre el proceso de entrenamiento, lo que dificulta la reproducibilidad y la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aniketchinchkar/banking77-distilbert-lora
- Dataset Banking77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Ejemplo de clasificación de consultas bancarias con DistilBERT (Colab): https://colab.research.google.com/github/JohnSnowLabs/nlu/blob/master/examples/colab/component_examples/classifiers/Banking_Queries_Classification.ipynb
- Repositorio similar de clasificador de intenciones Banking77 (Dey-Koushik): https://github.com/Dey-Koushik/banking77-intent-classifier
- Referencia al paper de destilación de DistilBERT (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
