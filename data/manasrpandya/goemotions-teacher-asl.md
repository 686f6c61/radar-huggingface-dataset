# manasrpandya/goemotions-teacher-asl

## Resumen

goemotions-teacher-asl es un modelo de clasificación de texto multietiqueta desarrollado por el usuario de Hugging Face manasrpandya. Se trata de un fine-tuning de roberta-large (355 millones de parámetros) sobre el conjunto de datos GoEmotions de Google Research, orientado a detectar emociones en textos en inglés. El modelo forma parte de un proyecto más amplio del autor, publicado en su repositorio NLP_CV_Lab, y su nombre ("teacher-asl") sugiere un uso como modelo profesor en un esquema de destilación o entrenamiento asistido.

La relevancia de este modelo radica en su enfoque técnico: emplea una función de pérdida asimétrica (asymmetric loss) con parámetros gamma=4 y clip=0.05, una elección habitual en problemas multietiqueta con fuerte desbalanceo de clases como GoEmotions. Además, el autor documenta explícitamente que las probabilidades crudas del modelo están subconfiadas y deben recalibrarse dividiendo los logits por una temperatura de 0,323 antes de aplicar la sigmoid, un detalle poco habitual en model cards y útil para quien lo despliegue en producción.

Se distribuye bajo licencia MIT, con pesos en formato safetensors y un tamaño de repositorio de 1,4 GB. El modelo está pensado exclusivamente para inglés y su pipeline declarado es text-classification. Con solo 27 descargas y ninguna valoración, es un modelo de nicho, probablemente académico o experimental, no un artefacto de producción ampliamente validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) |
| Parametros totales | 355.388.444 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-large admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de roberta-large, un transformer encoder de tipo BERT con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, preentrenado de forma autoregresiva con objetivos de masked language modeling sobre grandes corpus en inglés. Sobre esta base se añade una cabeza de clasificación multietiqueta que produce logits independientes por emoción, aplicando sigmoid en lugar de softmax para permitir que un mismo texto active varias etiquetas simultáneamente.

El entrenamiento se realizó sobre el dataset GoEmotions de Google Research, que contiene comentarios de Reddit anotados con 27 emociones (más una categoría neutral). La innovación técnica destacable es el uso de asymmetric loss con gamma=4 y clip=0.05, diseñada para mitigar el desbalanceo extremo entre emociones frecuentes e infrecuentes. El autor advierte que las probabilidades del modelo están subconfiadas y deben recalibrarse dividiendo los logits por una temperatura de 0,323 antes de la sigmoid; además, los umbrales por etiqueta óptimos se encuentran en el archivo results/metrics.json del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a clasificadores).

## Capacidades

- Clasificación de texto multietiqueta: asigna una o varias emociones a un texto en inglés (alegría, tristeza, enfado, sorpresa, miedo, etc., según el esquema de GoEmotions).
- Detección de emociones múltiples simultáneas gracias al uso de sigmoid y umbrales por etiqueta.
- Calibración documentada: el autor proporciona una temperatura (0,323) y umbrales por etiqueta para obtener probabilidades bien calibradas.
- Especialización en texto informal de redes sociales (comentarios de Reddit), lo que lo hace adecuado para dominios conversacionales.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comunidades online: clasificar comentarios de foros o redes sociales en categorías emocionales para detectar toxicidad o conflicto, aprovechando su entrenamiento sobre Reddit y su capacidad multietiqueta.
- Análisis de sentimiento granular en atención al cliente: procesar transcripciones de tickets o chats para identificar enfado, frustración o satisfacción y priorizar casos críticos.
- Monitorización de reputación de marca: analizar menciones en redes sociales y agregar la distribución emocional por producto o campaña.
- Investigación en psicología computacional: estudiar la prevalencia de emociones en corpus de texto, usando los umbrales calibrados y la temperatura documentada para obtener medidas comparables.
- Generación de datasets etiquetados: emplear el modelo como "profesor" (de ahí su nombre) para etiquetar grandes volúmenes de texto no anotado y entrenar modelos más pequeños o destilar conocimiento.
- Filtrado de contenido en pipelines de datos: descartar o marcar textos con alta carga emocional negativa antes de alimentar otros sistemas, como resúmenes automáticos o motores de búsqueda.
- Análisis de feedback de producto: clasificar reseñas o encuestas abiertas por emoción para complementar métricas de satisfacción (NPS, CSAT).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas sobre el conjunto de test de GoEmotions:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,547 (IC 95 %: 0,523–0,567) |
| Micro-F1 | 0,610 |
| Macro-F1 esquema Ekman | 0,647 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB (355 M parámetros × 4 bytes) más overhead de activaciones; en fp16, alrededor de 0,7 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB) o superior permite lotes grandes. Para producción de alto throughput, A100 o H100 no son necesarias pero ofrecen mayor paralelismo.
- Cabe holgadamente en GPU consumer: GTX 1660 (6 GB), RTX 2060, RTX 3060, RTX 4090, etc. También puede ejecutarse en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), Text Embeddings Inference (TEI), ONNX Runtime, o conversión a GGUF para llama.cpp/Ollama (aunque al ser un encoder, el soporte es más limitado).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 355 M, en una GPU moderna se esperan decenas de miles de textos por segundo en lotes, pero es una estimación genérica no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| goemotions-teacher-asl | 355 M | no disponible | MIT | en | Fine-tuning con asymmetric loss y calibración documentada |
| roberta-large (base) | 355 M | 512 | MIT | en | Sin fine-tuning para emociones; requiere entrenamiento propio |
| bert-base-multilingual-cased fine-tuned en GoEmotions | 178 M | 512 | Apache 2.0 | multilingüe | Alternativa multilingüe, menor tamaño, rendimiento variable según fine-tuning |
| distilroberta-base fine-tuned en GoEmotions | 82 M | 512 | MIT | en | Más ligero y rápido, menor precisión esperada |

No se dispone de datos de rendimiento comparativos publicados en la información disponible para establecer una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre comentarios de Reddit, hereda sesgos demográficos, culturales y de estilo de esa plataforma; puede infrarepresentar emociones en otros contextos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir falsos positivos o negativos en la clasificación, especialmente en emociones poco frecuentes.
- Limitaciones de contexto o idioma: solo inglés; textos largos más allá de la ventana de RoBERTa (512 tokens) requieren truncamiento o segmentación.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones significativas, pero el autor no ofrece garantías.
- Caveat importante para producción: las probabilidades crudas están subconfiadas; es imprescindible aplicar la temperatura 0,323 y los umbrales por etiqueta de results/metrics.json para obtener resultados calibrados. Ignorar esto degrada la calidad de las decisiones.
- Modelo con muy poca validación externa (27 descargas, 0 likes); no hay evidencia de uso en producción a gran escala.
- El nombre "teacher-asl" sugiere que fue diseñado como profesor en un esquema de destilación; su uso directo como clasificador final no está validado por el autor más allá de las métricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/manasrpandya/goemotions-teacher-asl
- Repositorio del proyecto (código e informe): https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/06-emotion-classification
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper de GoEmotions (Google Research): no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
