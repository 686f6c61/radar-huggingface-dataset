# bhaskarkonda6278/banking77-distilbert-classifier

## Resumen

El modelo `bhaskarkonda6278/banking77-distilbert-classifier` es un clasificador de texto basado en DistilBERT, fine-tuned para la clasificación de intenciones en el dominio bancario. Está diseñado para enrutar mensajes de atención al cliente hacia una de las 77 categorías de intención del dataset BANKING77, un conjunto de datos de referencia compuesto por 13 083 consultas de banca online etiquetadas con intenciones muy granulares. El modelo tiene 67 012 685 parámetros y un peso total de 0.3 GB en formato safetensors.

Aunque la model card publicada en Hugging Face está vacía (todos los campos aparecen como «More Information Needed»), el nombre del modelo, los tags y la arquitectura (DistilBERT) permiten inferir que se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset BANKING77, una práctica común para tareas de enrutado de intenciones. El modelo está registrado con el pipeline de `text-classification` y es compatible con la librería `transformers` y con `text-embeddings-inference`. Su relevancia radica en ofrecer una alternativa ligera y de bajo coste computacional para automatizar el triaje de consultas bancarias, con una latencia reducida frente a modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado, 6 capas, 768 dimensiones, 12 cabezas) |
| Parametros totales | 67 012 685 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de DistilBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset BANKING77 está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es una versión destilada de BERT desarrollada por Hugging Face (Sanh et al., 2019). Conserva la arquitectura de transformer con capas de encoder, pero reduce el número de capas de 12 a 6, manteniendo las dimensiones de 768 y 12 cabezas de atención. Esta reducción permite un modelo un 40 % más pequeño y un 60 % más rápido que BERT-base, con una pérdida mínima de rendimiento en tareas de comprensión del lenguaje. El modelo se entrena mediante destilación de conocimiento, donde el estudiante (DistilBERT) se entrena para replicar las salidas del profesor (BERT-base).

No se dispone de información pública sobre el procedimiento de entrenamiento específico de este modelo: no se documentan los hiperparámetros, el número de épocas, la estrategia de optimización ni el particionado del dataset. Dado el nombre del modelo y el contexto de la comunidad, se infiere que se realizó un fine-tuning supervisado sobre el dataset BANKING77, que contiene 13 083 consultas de banca online con 77 intenciones. No hay evidencia de que se haya aplicado RLHF o DPO.

## Capacidades

- Clasificación de texto de una sola etiqueta: el modelo asigna una de las 77 intenciones bancarias a cada mensaje (p. ej., `card_payment_fee_charged`, `pin_blocked`, `top_up_by_card`).
- Procesamiento de textos cortos: adecuado para consultas de clientes de longitud media, típicas en canales de chat y correo.
- Inferencia rápida y ligera: al ser un modelo pequeño (67 M), es viable para despliegue en CPU y en entornos con recursos limitados.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto: es un clasificador puro.
- Capacidades multilingües: no disponibles (el dataset de entrenamiento está en inglés).
- No dispone de modo de pensamiento ni capacidades multimodales.

## Casos de uso

- **Enrutamiento automático de consultas en banca online**: el modelo clasifica cada mensaje de un cliente en una de las 77 intenciones, lo que permite redirigir la conversación al equipo o al agente especializado correspondiente sin intervención humana.
- **Sistema de escalado a agente humano**: junto con un umbral de confianza, el modelo puede derivar automáticamente a un agente humano las consultas que no superan un nivel de probabilidad, evitando respuestas erróneas.
- **Asistente virtual de preguntas frecuentes**: integrado en un chatbot, el modelo identifica la intención del usuario y selecciona la respuesta plantilla más adecuada de una base de conocimiento.
- **Análisis de mensajes en redes sociales**: clasifica menciones y comentarios sobre el banco en categorías como quejas, preguntas sobre tarjetas o transferencias, para priorizar la atención.
- **Triaje de tickets en sistemas de soporte**: cuando un cliente abre un ticket, el modelo asigna una categoría de intención automáticamente, reduciendo el tiempo de clasificación manual del personal.
- **Monitorización de calidad en conversaciones**: se puede usar para etiquetar conversaciones de atención al cliente y medir la distribución de intenciones, detectando picos de problemas recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (accuracy, F1, etc.), ni comparaciones con otros modelos. El repositorio de Hugging Face no muestra datos de evaluación ni de rendimiento en los conjuntos de validación.

## Requisitos de hardware

- **VRAM estimada**: un modelo DistilBERT de 67 M de parámetros en fp32 ocupa aproximadamente 268 MB; en fp16 se reduce a ~134 MB. Con un tamaño de batch de 1 y secuencias de hasta 512 tokens, la VRAM necesaria en GPU es inferior a 1 GB.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA T4, GTX 1650, RTX 3060). También funciona en CPU, con una latencia de unos pocos milisegundos por consulta en hardware moderno.
- **Despliegue**: compatible con librerías como `transformers` (PyTorch), `onnxruntime`, `vLLM` (aunque no es un modelo de generación), `text-embeddings-inference` y `Ollama` (no es lo habitual). Se puede exportar a ONNX para inferencia optimizada.
- **Throughput estimado**: en GPU, puede procesar cientos de consultas por segundo con batch; en CPU, la latencia es de 10-20 ms por consulta en equipos estándar, según la longitud del texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `bhaskarkonda6278/banking77-distilbert-classifier` | DistilBERT | 67 M | 512 | no disponible | safetensors |
| `philschmid/BERT-Banking77` | BERT-base | 110 M | 512 | MIT (típico) | pytorch |
| `aCe44/distilbert-banking77` | DistilBERT | 67 M | 512 | no disponible | pytorch |

No se dispone de datos de rendimiento comparativos entre estos modelos. En términos de tamaño, el modelo de DistilBERT es más ligero que BERT-base, con un 40 % menos de parámetros, lo que reduce el consumo de memoria y acelera la inferencia. La licencia de `philschmid/BERT-Banking77` es MIT, mientras que la del modelo evaluado no está declarada.

## Limitaciones y advertencias

- **Sesgos del dataset**: BANKING77 contiene consultas de banca online en inglés, por lo que el modelo puede no funcionar bien con otros idiomas o con jerga bancaria de otras regiones.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto libre, pero puede asignar etiquetas incorrectas con alta confianza, especialmente con entradas fuera del dominio (p. ej., preguntas no bancarias).
- **Cobertura de intenciones**: las 77 categorías de BANKING77 son específicas del dominio bancario; no cubren todas las posibles consultas de un banco, por lo que el modelo puede fallar ante intenciones no contempladas.
- **Licencia y uso comercial**: la licencia no está especificada, lo que introduce incertidumbre legal para el uso comercial. Se recomienda contactar con el autor para obtener aclaraciones.
- **Falta de documentación**: no se proporcionan detalles de entrenamiento, hiperparámetros ni evaluación, lo que dificulta la reproducibilidad y la evaluación de la calidad.
- **No es un modelo generativo**: no puede mantener conversaciones abiertas ni razonar más allá de la clasificación.

## Enlaces

- [Hugging Face: bhaskarkonda6278/banking77-distilbert-classifier](https://huggingface.co/bhaskarkonda6278/banking77-distilbert-classifier)
- [Paper de DistilBERT (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Repositorio de referencia: Dey-Koushik/banking77-intent-classifier](https://github.com/Dey-Koushik/banking77-intent-classifier)
- [Modelo similar: philschmid/BERT-Banking77](https://huggingface.co/philschmid/BERT-Banking77)
- [Modelo similar: aCe44/distilbert-banking77](https://huggingface.co/aCe44/distilbert-banking77)
