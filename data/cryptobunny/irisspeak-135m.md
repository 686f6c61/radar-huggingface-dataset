# cryptobunny/IrisSpeak-135M

## Resumen

IrisSpeak-135M es un modelo de predicción de la siguiente tarjeta para comunicación aumentativa y alternativa (AAC), desarrollado por el usuario cryptobunny. Está diseñado para asistir a personas con dificultades del habla: dado el entorno, la conversación reciente, la última intervención del interlocutor y las tarjetas ya pulsadas, el modelo puntúa cada tarjeta de un vocabulario cerrado y predice cuál será la siguiente. Se ejecuta íntegramente en el dispositivo, ya sea en el navegador mediante onnxruntime-web o en PyTorch, lo que lo hace adecuado para aplicaciones de asistencia en tiempo real sin conexión.

El modelo se basa en SmolLM2-135M-Instruct (30 capas, dimensión oculta 576) y añade una capa de tarjetas entrenable con una fila por cada tarjeta del vocabulario, más un marcador de inicio y otro de fin de mensaje. El modelo completo tiene 136.298.880 parámetros y se distribuye bajo licencia Apache 2.0. Aunque es un prototipo de investigación y no un dispositivo médico, su enfoque de predicción contextual sobre un vocabulario cerrado lo hace relevante para el desarrollo de sistemas AAC más inteligentes y accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM con capa de tarjetas (basado en SmolLM2-135M-Instruct) |
| Parametros totales | 136.298.880 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (ONNX), fp32 (checkpoint PyTorch) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch (state dict) |

## Arquitectura y entrenamiento

IrisSpeak-135M parte del modelo base SmolLM2-135M-Instruct, un transformer causal de 30 capas con dimensión oculta 576. Sobre él se añade una capa de tarjetas: una matriz entrenable con una fila por cada tarjeta del vocabulario AAC (3.097 filas en total, incluyendo un slot para el nombre, un marcador de inicio y un marcador de fin de mensaje). Estas filas se usan tanto como embeddings de entrada para las tarjetas pulsadas como cabeza de salida que convierte el último estado oculto en un logit por tarjeta. Cada fila se inicializó con la media de los embeddings de SmolLM2 de la forma hablada de la tarjeta, y posteriormente se fine-tuneó todo el modelo sobre estados de siguiente tarjeta derivados de datos de conversación AAC.

El entrenamiento utilizó 69.676 estados de siguiente tarjeta extraídos de corpus públicos de conversación AAC (AAC Conversations, AACText imagine), mapeados al vocabulario de tarjetas. Los datos se ponderaron hacia intercambios de preguntas y respuestas, con un límite de seis tarjetas por mensaje y un peso reducido para el marcador de fin de mensaje. El modelo se exportó también a ONNX con Optimum en fp16, manteniendo una superposición top-100 de 0.998 con la versión PyTorch.

## Capacidades

- Prediccion de la siguiente tarjeta en un vocabulario cerrado de AAC, puntuando todas las tarjetas posibles.
- Uso de contexto conversacional: entorno, historial reciente, ultima intervencion del interlocutor y tarjetas ya pulsadas.
- Ejecucion en el dispositivo, tanto en navegador (onnxruntime-web) como en PyTorch, sin necesidad de servidor.
- Soporte de marcadores de inicio y fin de mensaje para delimitar la secuencia de tarjetas.
- Modelo de lenguaje generativo basado en SmolLM2, aunque su uso principal es la clasificacion sobre el vocabulario de tarjetas.
- No incluye capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Aplicaciones de comunicacion aumentativa para personas con trastornos del habla: el modelo sugiere la siguiente tarjeta en tiempo real mientras el usuario construye un mensaje, reduciendo el esfuerzo de navegacion por el vocabulario.
- Asistentes de conversacion para entornos clinicos o educativos: terapeutas y educadores pueden integrar IrisSpeak en herramientas de apoyo a la comunicacion para pacientes con afasia o paralisis cerebral.
- Sistemas de comunicacion basados en el navegador: gracias a la exportacion a ONNX, el modelo puede ejecutarse en una pagina web sin backend, facilitando su despliegue en tablets o portatiles.
- Investigacion en AAC: el modelo sirve como base para estudiar la prediccion de tarjetas en contextos conversacionales reales, con metricas de recall publicadas.
- Prototipos de dispositivos de asistencia: puede integrarse en hardware de bajo coste (Raspberry Pi, moviles antiguos) para ofrecer sugerencias de tarjetas sin conexion.
- Desarrollo de interfaces de comunicacion adaptativas: el modelo puede combinarse con un reranker entrenado para mejorar la precision en escenarios de preguntas y respuestas, como se muestra en los resultados.

## Benchmarks y rendimiento

La model card publica metricas de recall sobre estados de validacion (held-out):

| Metrica | Valor |
|---|---|
| Recall@1 | 0.29 |
| Recall@16 | 0.55 (0.60 en estados de pregunta-respuesta) |
| Recall@100 | 0.78 |
| Recall@16 con reranker entrenado | 0.65 general / 0.70 pregunta-respuesta |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 135M de parametros, es ligero y puede ejecutarse en CPU sin problemas.
- La version ONNX fp16 ocupa 274 MB, por lo que cabe en dispositivos con poca memoria.
- Se puede ejecutar en el navegador mediante onnxruntime-web, lo que implica que cualquier dispositivo con un navegador moderno es suficiente.
- Para PyTorch, se recomienda al menos 2 GB de RAM (no se especifica VRAM, pero el modelo es pequeno).
- Opciones de despliegue: onnxruntime-web, PyTorch, y potencialmente vLLM u otros servidores de inferencia, aunque no se mencionan.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (prediccion de tarjetas AAC). El modelo base SmolLM2-135M-Instruct es el punto de partida, pero no es directamente comparable por su tarea generica de lenguaje. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Es un prototipo de investigacion, no un dispositivo medico. No debe usarse como sustituto de sistemas AAC certificados.
- El vocabulario de tarjetas es cerrado y no se incluye en el repositorio, lo que limita su uso fuera del contexto especifico para el que fue entrenado.
- Solo soporta ingles, por lo que no es util para otros idiomas sin adaptacion.
- La longitud de contexto no se especifica, pero al derivar de SmolLM2-135M, probablemente sea limitada (tipicamente 2048 tokens en modelos de ese tamano, aunque no se confirma).
- El rendimiento de prediccion es modesto (Recall@1 de 0.29), por lo que en aplicaciones reales puede requerir un reranker adicional o intervencion humana.
- No se documentan sesgos especificos, pero al entrenarse con corpus publicos de AAC, puede heredar sesgos de esos datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cryptobunny/IrisSpeak-135M
- Aplicacion demo: https://irisspeak.org/app/
