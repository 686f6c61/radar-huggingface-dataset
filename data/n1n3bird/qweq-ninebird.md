# N1n3Bird/QWeQ-NineBird

## Resumen

QWeQ-NineBird-v1 es un modelo ligero de clasificación multi-tarea para chino, desarrollado por N1n3Bird para la aplicación de escritorio WeQ. Se basa en hfl/rbt3, un RoBERTa chino de 3 capas con hidden_size=768, y se distribuye como un único fichero ONNX FP32 de unos 147 MB con 39.178.274 parámetros. No es un LLM generativo: predice intención (17 clases), emoción (15 clases), intensidad emocional (0-100) y polaridad de sentimiento (-100/+100) en una sola pasada.

Su relevancia está en el despliegue en CPU: la model card indica inferencia en milisegundos en un CPU ordinario y una ventana máxima de 128 tokens, suficiente para mensajes de chat y contexto inmediato concatenado con marcadores temporales. Está pensado para enriquecer conversaciones de mensajería con señales de intención y estado emocional, no para generar respuestas ni para tareas generales de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa de 3 capas, base hfl/rbt3, hidden_size=768 |
| Parámetros totales | 39.178.274 (~39,18 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens máximo de secuencia; el contexto previo se concatena dentro de ese límite con marcadores temporales |
| Tipos de cuantización | No se documentan; el artefacto publicado es ONNX FP32 (~147 MB). Sin versiones INT8, FP16 ni GGUF |
| Idiomas soportados | Chino (zh) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, FP32, archivo único model.onnx, ~147 MB), tokenizer y model_config.json |
| Tarea | text-classification; clasificación y regresión multi-tarea |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo RoBERTa de 3 capas procedente de hfl/rbt3, con hidden_size=768. Sobre la representación del texto se añaden cuatro cabezas de salida: intent_logits para 17 clases de intención, emotion_logits para 15 clases de emoción, intensity para regresión de intensidad y sentiment para regresión de polaridad. El modelo se exporta a ONNX opset 17 en FP32 y se ejecuta con ONNX Runtime; la entrada utiliza input_ids, attention_mask y token_type_ids con truncación a 128 tokens.

El entrenamiento consiste en un ajuste fino conjunto multi-tarea a partir de hfl/rbt3, un Chinese RoBERTa-wwm-ext de 3 capas. No se documentan el número de tokens de entrenamiento, la composición del dataset, el esquema de muestreo de tareas ni si se aplicaron RLHF o DPO. La innovación destacable es el formato de contexto con marcas temporales (刚刚/稍早/较远) y la salida multi-cabeza en un único fichero ONNX, orientada a baja latencia en CPU.

## Capacidades

- Clasificación de intención en 17 clases: question, request, greeting, share, praise, vent, joke, plan, info, chat, boast, flattery, banter, perfunctory, gossip, coquetry y other.
- Clasificación de emoción en 15 clases: joy, excitement, admiration, neutral, sadness, anger, anxiety, affection, fatigue, curiosity, shock, aggrieved, irony, anticipation y embarrassed.
- Regresión de intensidad emocional en un rango declarado de 0 a 100.
- Regresión de polaridad de sentimiento en un rango declarado de -100 a +100.
- Procesamiento de contexto previo dentro de la misma secuencia de 128 tokens, con marcadores temporales como 刚刚, 稍早 y 较远.
- Inferencia en CPU mediante ONNX Runtime, con un único fichero ONNX y tokenizer asociado.
- No soporta generación de texto libre, razonamiento generativo, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No es multilingüe: la model card solo declara chino (zh).

## Casos de uso

- Enrutado de mensajes en WeQ: clasificar cada mensaje entrante por intención y emoción para dirigirlo a respuestas rápidas, notificaciones o revisión humana; el modelo es adecuado porque devuelve cuatro señales en una sola pasada y cabe en CPU.
- Priorización de soporte y atención al cliente: detectar emociones como anger, anxiety o aggrieved junto con una intensidad alta para escalar conversaciones críticas; la ventana de 128 tokens permite incluir el mensaje actual y contexto inmediato.
- Análisis de sentimiento en comunidades chinas: usar la polaridad de -100 a +100 y la emoción de 15 clases para agregar tendencias por canal, hilo o periodo; el formato ONNX facilita el procesado por lotes en servidores sin GPU.
- Respuestas rápidas sugeridas: seleccionar plantillas de respuesta según intención y emoción, por ejemplo coquetry o banter frente a vent o request; el modelo no genera texto, pero reduce el espacio de respuestas candidatas.
- Moderación de ironía y conflicto: utilizar la etiqueta irony y las señales de anger o banter para marcar mensajes que requieren revisión; es útil como filtro previo de bajo coste, no como clasificador definitivo.
- Analítica de producto para mensajería: medir distribución de intenciones, emociones e intensidad a lo largo de conversaciones para estudiar adopción, fricción y satisfacción; el modelo permite etiquetar grandes volúmenes en CPU.
- Investigación en interacción humano-computador: anotar corpus de chats chinos con 17 intenciones y 15 emociones de forma reproducible; la licencia Apache-2.0 facilita su uso en experimentos académicos y prototipos.
- Filtrado previo para revisión humana: enviar a revisión los mensajes con mayor intensidad emocional o polaridad extrema; el modelo sirve como primera capa de triaje, pero requiere umbrales validados por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Resultado |
|---|---|
| Métricas de clasificación de intención (17 clases) | no disponible |
| Métricas de clasificación de emoción (15 clases) | no disponible |
| MAE/RMSE de intensidad (0-100) | no disponible |
| MAE/RMSE de polaridad (-100/+100) | no disponible |
| Comparación con modelos similares | no disponible |

## Requisitos de hardware

- Inferencia en CPU: es el objetivo declarado del modelo; la model card afirma latencia en milisegundos en un CPU ordinario, sin cifra concreta publicada.
- Pesos: el fichero ONNX FP32 ocupa aproximadamente 147 MB y el repositorio completo unos 0,2 GB.
- Memoria: no se publica el consumo total de RAM o VRAM; por el tamaño de los pesos, el requisito es bajo, pero depende del runtime, del batch y de la longitud de secuencia.
- GPU: no es necesaria. Si se utiliza, cualquier GPU compatible con ONNX Runtime puede ejecutarlo; una RTX 4090, A100 o H100 no son necesarias para un modelo de 39,18 M de parámetros.
- GPU consumer: por tamaño, es apto para GPU de consumo; no se publica una VRAM mínima exacta.
- Despliegue: ONNX Runtime con tokenizer BertTokenizer; transformers puede usarse para el preprocesado. vLLM, TGI, llama.cpp y Ollama no están orientados a este clasificador ONNX.
- Latencia y throughput: no disponible; solo hay una referencia cualitativa a inferencia en milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| QWeQ-NineBird-v1 | 39,18 M | 128 tokens | 17 intenciones, 15 emociones, intensidad y polaridad | Apache-2.0 | ONNX en HuggingFace |
| hfl/rbt3 (modelo base) | no disponible | no disponible | Backbone RoBERTa chino de 3 capas; sin cabezas multi-tarea documentadas | no disponible en la información | HuggingFace |
| Alternativas multi-tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de clasificación multi-tarea para chats chinos en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta chino (zh); no está entrenado ni declarado para castellano u otros idiomas.
- La longitud máxima es de 128 tokens, por lo que conversaciones largas se truncan; el contexto previo debe concatenarse manualmente con marcadores temporales.
- El espacio de etiquetas es fijo: 17 intenciones y 15 emociones; añadir clases requiere reentrenamiento.
- No genera explicaciones ni texto: devuelve logits, una intensidad y una polaridad; la interpretación corre a cargo del sistema que lo integra.
- No dispone de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No se documentan datos de entrenamiento ni evaluación de sesgos; pueden aparecer sesgos culturales, sociales o lingüísticos del corpus chino utilizado.
- No se publica calibración de intensidad ni polaridad; los rangos 0-100 y -100/+100 son declarados, pero no hay métricas de error disponibles.
- Riesgo de falsos positivos y negativos en ironía, sarcasmo y emociones sutiles; conviene validar con datos del dominio antes de usarlo en producción.
- La licencia del modelo es Apache-2.0, pero no se detalla en la información la licencia del modelo base hfl/rbt3; debe verificarse antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni benchmarks publicados; requiere evaluación propia.

## Enlaces

- [HuggingFace: N1n3Bird/QWeQ-NineBird](https://huggingface.co/N1n3Bird/QWeQ-NineBird)
- [Modelo base hfl/rbt3](https://huggingface.co/hfl/rbt3)

No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la información disponible.
