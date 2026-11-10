# danjai/scamlens-qs-google-bert-v6

## Resumen

ScamLens quick_score google-bert-v6 es un clasificador de texto binario desarrollado por el usuario danjai que estima la probabilidad de que un SMS o mensaje de chat sea una estafa. Se trata de un fine-tuning de `google-bert/bert-base-uncased` con 109,5 millones de parámetros, entrenado para la herramienta `quick_score` del agente de investigación de estafas ScamLens, un proyecto de curso universitario (IS469). El modelo evalúa únicamente la redacción del mensaje, sin analizar enlaces, números de teléfono ni remitentes.

El modelo es relevante como ejemplo de clasificador especializado de dominio muy acotado: SMS fraudulentos en inglés con contexto de Singapur (bancos locales, agencias y servicios de pago). Con solo 1.901 ejemplos de entrenamiento y una longitud máxima de 192 tokens, prioriza la detección de patrones de redacción sobre la cobertura general. No es el modelo que ScamLens usa en producción, sino uno de los candidatos comparados durante el desarrollo.

Su interés práctico es limitado fuera de ese nicho: la licencia no está declarada, el conjunto de test es pequeño (178 mensajes) y el rendimiento debe interpretarse con intervalos de confianza amplios. Aun así, documenta un flujo de trabajo reproducible de fine-tuning de BERT para clasificación de fraude con separación de validación por plantilla de mensaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForSequenceClassification` construido sobre `google-bert/bert-base-uncased`, con una cabeza de clasificación de dos etiquetas (`0 = genuine`, `1 = scam`). El entrenamiento se realizó durante 3 épocas con learning rate 2e-05, batch size 8, longitud máxima 192, warmup ratio 0.1, weight decay 0.01, scheduler lineal, pesos de clase balanceados y semilla 42. La validación se reservó el 20 % de los datos.

El conjunto de entrenamiento contiene 1.901 ejemplos (1.522 para entrenamiento y 379 para validación), procedentes de un único fichero `sg_quick_score_train.csv`. Los datos combinan mensajes de estafas tomados o reconstruidos a partir de avisos públicos, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos. La separación de validación se hizo por plantilla de mensaje (1.387 plantillas), de modo que las copias casi idénticas de un mensaje de entrenamiento nunca aparecen en validación. Se proporcionan hashes SHA-256 para los datos de entrenamiento y de test. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Clasificación binaria de texto: devuelve la probabilidad de que un mensaje sea estafa frente a genuino.
- Detección basada exclusivamente en la redacción del mensaje, sin inspección de enlaces, números de teléfono ni remitentes.
- Especialización en SMS y mensajes de chat en inglés con contexto de Singapur (bancos locales, agencias y servicios de pago).
- Integración como herramienta `quick_score` dentro del agente ScamLens, con umbrales de lectura: alto desde 0,70, medio desde 0,50 y bajo por debajo.
- Uso mediante `transformers` con `AutoModelForSequenceClassification` y `AutoTokenizer`; compatible con Text Embeddings Inference y endpoints.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Filtro previo en pasarelas de SMS: clasificar mensajes entrantes antes de aplicar reglas más costosas, usando la probabilidad como primera señal de riesgo.
- Moderación de chats de atención al cliente: marcar conversaciones con lenguaje típico de estafa para revisión humana, sin bloquear automáticamente.
- Enriquecimiento de un agente antifraude: alimentar la herramienta `quick_score` de ScamLens con una puntuación de redacción que se combine con comprobaciones de enlaces y remitentes.
- Investigación académica sobre detección de fraude: servir como línea base reproducible de fine-tuning de BERT con separación de validación por plantilla.
- Etiquetado asistido de corpus: priorizar mensajes candidatos a estafa para anotación manual en proyectos de recopilación de datos.
- Demostraciones y prototipos: integrar un clasificador ligero de 109 millones de parámetros en un cuaderno o servicio pequeño para ilustrar pipelines de detección de estafas.
- Análisis de campañas locales: detectar patrones de redacción en mensajes dirigidos a usuarios de bancos y servicios de pago de Singapur.

## Benchmarks y rendimiento

| Métrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| F1 de validación | 0,958 | no disponible |
| Accuracy en test | 0,944 | 0,900 – 0,969 |
| Recall de estafa | 0,952 | 0,892 – 0,979 |
| Precisión de estafa | 0,952 | 0,892 – 0,979 |
| F1 en test | 0,952 | no disponible |
| Mensajes genuinos clasificados como estafa | 5 de 74 | no disponible |
| Estafas no detectadas | 5 de 104 | no disponible |

El conjunto de test son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; se considera estafa a partir de una probabilidad de 0,50. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,5 M de parámetros); en fp16 alrededor de 0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo y en CPU; el repositorio ocupa 0,4 GB.
- Opciones de despliegue: `transformers` en Python, Text Embeddings Inference (el modelo declara compatibilidad con endpoints) y despliegue en CPU para volúmenes moderados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v6 | 109,5 M | 192 tokens | Clasificación de estafas en SMS (Singapur) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| Alternativas especializadas en detección de spam o fraude | no disponible | no disponible | Clasificación de spam o fraude | no disponible | no disponible |

La comparación con otros clasificadores de fraude concretos no está disponible en la información proporcionada. Frente a su modelo base, este fine-tuning reduce la longitud máxima efectiva a 192 tokens y añade una cabeza de clasificación binaria específica para mensajes de Singapur.

## Limitaciones y advertencias

- Solo evalúa la redacción: no verifica enlaces, números de teléfono ni remitentes, por lo que puede pasar por alto estafas con texto neutro o marcar como sospechosos mensajes legítimos con lenguaje alarmista.
- Entrenado con mensajes en inglés y contexto de Singapur; se espera un rendimiento inferior en otras regiones, idiomas o tipos de fraude.
- El conjunto de test es pequeño (178 mensajes), lo que produce intervalos de confianza amplios y limita la fiabilidad de las métricas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos: 5 de 74 mensajes genuinos se clasificaron como estafa y 5 de 104 estafas no se detectaron.
- No debe usarse de forma aislada para bloquear mensajes ni acusar a personas; el autor lo describe como una primera opinión dentro de un conjunto de herramientas.
- La licencia no está declarada, por lo que el uso comercial no está garantizado y requiere contactar con el autor.
- El modelo no es el que ScamLens usa en producción, sino un candidato comparado durante el desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v6
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
