# hmarchant/speaker-id-joint-int4

## Resumen
El modelo `hmarchant/speaker-id-joint-int4` es una versión cuantizada en INT4 (solo pesos) del Joint Speaker Identifier desarrollado por Adobe Research, presentado en Interspeech 2024. Este sistema resuelve el problema de identificar qué personaje habla en cada turno de una transcripción de diálogo, utilizando un enfoque puramente textual basado en modelos de lenguaje preentrenados. La cuantización reduce el tamaño en memoria de 1633 MB a 294 MB (aproximadamente 5,6 veces menor), manteniendo una precisión del 83,33 % aunque con una caída en F1 y exactitud respecto al modelo original en FP32.

El modelo se basa en `FacebookAI/roberta-large` como backbone y ha sido cuantizado sin entrenamiento adicional, empaquetando los pesos de las capas lineales en INT4 con grupo de tamaño 64. Está disponible bajo la licencia Adobe Research License, que restringe su uso a investigación no comercial. Su utilidad principal es la investigación en identificación de hablantes y sistemas de diálogo, donde se requiere un modelo compacto para despliegue en entornos con recursos limitados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) con clasificación de pares de turnos |
| Parametros totales | no disponible (basado en RoBERTa-large, ~355 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-large soporta 512 tokens, no confirmado en la tarjeta) |
| Tipos de cuantizacion | INT4 weight-only (grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | Adobe Research License (solo uso no comercial) |
| Formato de pesos | PyTorch (`model.pt`, cuantizado) |

## Arquitectura y entrenamiento
El modelo original es un clasificador de pares de turnos basado en RoBERTa-large, que toma dos segmentos de texto consecutivos de una transcripción y predice si ambos pertenecen al mismo hablante o a hablantes distintos. El entrenamiento se realizó sobre el dataset MediaSum, tal como se describe en el artículo de Adobe Research. Este checkpoint concreto es un hijo cuantizado: los pesos lineales se empaquetaron en INT4 con un tamaño de grupo de 64, sin ningún entrenamiento adicional. La cuantización es solo de pesos (weight-only), por lo que las activaciones permanecen en precisión completa.

## Capacidades
- Identificación de hablantes en transcripciones de diálogos multitudinarios (múltiples participantes).
- Clasificación de pares de turnos para determinar si dos segmentos consecutivos pertenecen al mismo hablante.
- Inferencia eficiente en memoria: 294 MB en memoria, adecuado para entornos con recursos limitados.
- Soporte de ejecución en CPU, GPU y Apple MPS (probado en M3 Pro).
- No es un modelo generativo ni de lenguaje general; está especializado en la tarea de identificación de hablante.

## Casos de uso
- **Análisis de transcripciones de reuniones**: procesar actas de reuniones grabadas para asignar automáticamente cada intervención al participante correcto, útil para herramientas de resumen y búsqueda.
- **Investigación en sistemas de diálogo**: integrar el modelo como componente de un pipeline de procesamiento de conversaciones para evaluar la coherencia de los turnos y la atribución de hablantes.
- **Anotación de corpus**: etiquetar automáticamente los hablantes en conjuntos de datos de diálogos, reduciendo el esfuerzo manual de anotación.
- **Desarrollo de asistentes de voz**: en sistemas donde se requiere identificar quién habla en una conversación transcrita, p. ej., para personalizar respuestas según el usuario.
- **Análisis forense de textos**: en investigaciones que requieren atribuir declaraciones a individuos dentro de transcripciones, aunque con la limitación de uso no comercial.
- **Estudio de compresión de modelos**: el checkpoint sirve como caso de estudio para evaluar el impacto de la cuantización INT4 en tareas de clasificación de texto, comparando con los hermanos FP32 e INT8.

## Benchmarks y rendimiento
La tarjeta del modelo proporciona las siguientes métricas, medidas en el conjunto de validación de MediaSum:

| Métrica | Valor |
|---|---|
| Precisión | 83,33 |
| Delta vs FP32 parent | +4,46 |
| F1 | 60,24 |
| Exactitud (accuracy) | 63,87 |
| Throughput | 12,09 ejemplos/s (Apple M3 Pro, MPS, batch 2) |
| Tamaño en memoria | 294 MB (FP32: 1633 MB) |

El modelo INT8 hermano (`hmarchant/speaker-id-joint-int8`) iguala las métricas del padre FP32 en precisión, F1 y exactitud. No se han publicado comparaciones con otros modelos de identificación de hablante en la información disponible.

## Requisitos de hardware
- **Memoria**: 294 MB en memoria, lo que lo hace ejecutable en CPUs y GPUs con poca VRAM (por ejemplo, 4 GB).
- **GPU recomendadas**: cualquier GPU con soporte para PyTorch, incluyendo RTX 3060 o superiores; también funciona en Apple Silicon (MPS).
- **Inferencia en consumer GPU**: sí, cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- **Opciones de despliegue**: PyTorch estándar con `torch.load`; no hay soporte nativo para vLLM, llama.cpp u Ollama, ya que es un modelo de clasificación y no un LLM generativo.
- **Latencia y throughput**: 12,09 ejemplos/s en Apple M3 Pro con batch 2; en GPU dedicada se espera un throughput mayor, aunque no se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Precisión | F1 | Exactitud | Tamaño en memoria | Licencia |
|---|---|---|---|---|---|
| Joint SpeakerID FP32 (padre) | 78,87 (estimado por delta) | no disponible | no disponible | 1633 MB | Adobe Research (no comercial) |
| Joint SpeakerID INT8 (`hmarchant/speaker-id-joint-int8`) | igual al FP32 | igual al FP32 | igual al FP32 | no disponible | Adobe Research (no comercial) |
| Joint SpeakerID INT4 (este modelo) | 83,33 | 60,24 | 63,87 | 294 MB | Adobe Research (no comercial) |

No hay otros modelos de identificación de hablante basados en texto comparables en la información proporcionada.

## Limitaciones y advertencias
- **Licencia restrictiva**: solo permite uso no comercial; no se puede desplegar en productos comerciales sin permiso explícito de Adobe.
- **Pérdida de rendimiento**: aunque la precisión aumenta, el F1 y la exactitud caen significativamente respecto al FP32/INT8 (60,24 vs. probablemente más alto), lo que indica un comportamiento más conservador y menos equilibrado.
- **Idiomas limitados**: el modelo fue entrenado en MediaSum, un corpus de transcripciones de CNN, por lo que su rendimiento en otros idiomas o dominios puede degradarse.
- **Contexto fijo**: al estar basado en RoBERTa-large, la longitud de contexto está limitada a 512 tokens, lo que puede no ser suficiente para diálogos muy largos.
- **Velocidad de decodificación**: en MPS, el desempaquetado de pesos INT4 es más lento que FP16/INT8, lo que reduce el throughput.
- **Sin soporte para tareas generativas**: no es un modelo de lenguaje generativo; no puede producir texto, solo clasificar pares de turnos.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/hmarchant/speaker-id-joint-int4)
- [Repositorio de Adobe Research speaker-identification](https://github.com/adobe-research/speaker-identification)
- [Artículo científico (arXiv)](https://arxiv.org/abs/2407.12094)
- [Modelo hermano INT8](https://huggingface.co/hmarchant/speaker-id-joint-int8)
- [Modelo base FacebookAI/roberta-large](https://huggingface.co/FacebookAI/roberta-large)
