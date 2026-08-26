# hmarchant/speaker-id-joint-mlx-int8

## Resumen

El modelo `hmarchant/speaker-id-joint-mlx-int8` es un checkpoint cuantizado a INT8 del Joint Speaker Identifier desarrollado por Adobe Research, presentado en Interspeech 2024. Se trata de un sistema de identificación de hablantes basado exclusivamente en texto: dado un diálogo transcrito, el modelo asigna cada intervención a uno de los participantes. No procesa audio, sino transcripciones, lo que lo hace especialmente útil para corpus de entrevistas, podcasts o actas judiciales.

La cuantización weight-only INT8 se ha realizado con MLX, utilizando escalas calculadas con `mx.quantize` y empaquetadas para inferencia en PyTorch/MPS. El checkpoint resultante mantiene exactamente la misma precisión que el modelo padre en FP32 (78,87) y reduce el tamaño en memoria de 1633 MB a 472 MB, un 71 % menos. El backbone es RoBERTa-large de Facebook AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa-large) con cabezas de identificación conjunta |
| Parámetros totales | no disponible (backbone RoBERTa-large, ~355M, más cabezas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-large: 512 tokens) |
| Tipos de cuantización | INT8 weight-only, escalas MLX, group size 64; cabezas pequeñas con absmax INT8 |
| Idiomas soportados | no disponible (RoBERTa-large entrenado en inglés) |
| Licencia | Adobe Research License (solo investigación no comercial) |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo original de Adobe Research es un sistema de identificación de hablantes basado en texto que combina un backbone de lenguaje preentrenado (RoBERTa-large) con cabezas de clasificación específicas. El enfoque, descrito en el paper "Identifying Speakers in Dialogue Transcripts: A Text-based Approach Using Pretrained Language Models", se entrena sobre el corpus MediaSum y optimiza una pérdida conjunta que combina la clasificación de hablantes con el modelado de la estructura del diálogo.

El checkpoint aquí presentado no es un reentrenamiento, sino una cuantización weight-only del modelo FP32 original. Las escalas de cuantización se calcularon con MLX para capas lineales cuya última dimensión es múltiplo de 64, y se empaquetaron en un formato INT8 compatible con PyTorch/MPS. Las capas más pequeñas (cabezas) utilizan cuantización absmax INT8. No se realizó ningún entrenamiento adicional, por lo que las métricas son idénticas al modelo padre.

## Capacidades

- Identificación de hablantes en transcripciones de diálogos multi-interlocutor.
- Clasificación de cada turno de conversación asignándolo a uno de los hablantes conocidos.
- Razonamiento basado en el contexto del texto completo de la transcripción, no solo en el turno aislado.
- Inferencia eficiente en dispositivos Apple Silicon gracias a la cuantización MLX INT8.
- Mantiene la calidad del modelo original FP32 sin degradación de precisión.
- No es un modelo generativo: no produce texto, solo etiquetas de hablante.

## Casos de uso

- Investigación académica en análisis de diálogos: el modelo puede asignar turnos de habla en entrevistas o conversaciones transcritas, lo que permite estudios sociolingüísticos o de análisis de interacción.
- Anonimización de corpus: dado un texto transcrito, se pueden etiquetar los hablantes para posteriormente reemplazar nombres u otra información personal.
- Análisis de actas o reuniones: transcribir reuniones y etiquetar quién dijo cada cosa, útil para generar resúmenes o actas con atribución de intervenciones.
- Sistemas de búsqueda en transcripciones: indexar entrevistas o debates con metadatos de hablante para recuperar citas concretas de una persona.
- Evaluación de la calidad de transcripciones: comparar las etiquetas predichas con las reales para detectar errores en la transcripción o en la asignación de turnos.
- Investigación en NLP conversacional: el modelo sirve como componente de un pipeline más grande para estudiar la estructura de diálogos, la toma de turnos o la atribución de intención por hablante.

## Benchmarks y rendimiento

Según la model card del autor:

| Métrica | Valor |
|---|---|
| Precisión | 78,87 |
| Δ vs FP32 padre | 0,00 |
| F1 | 63,28 |
| Accuracy | 67,60 |
| Throughput | 18,16 ejemplos/s (Apple M3 Pro, MPS, batch 2) |
| Tamaño en memoria | 472 MB (FP32 padre: 1633 MB) |

No se han publicado resultados de benchmarks comparativos con otros modelos de identificación de hablantes en la información disponible.

## Requisitos de hardware

- VRAM estimada: 472 MB para el checkpoint INT8, por lo que cabe en cualquier GPU moderna, incluso en iGPU o GPUs de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM; en Apple Silicon funciona bien en MPS (probado en M3 Pro).
- Compatible con GPU consumer: sí, es muy ligero.
- Opciones de despliegue: PyTorch nativo con MPS, también puede cargarse en CPU; no se mencionan integraciones con vLLM, llama.cpp u Ollama porque no es un modelo generativo.
- Latencia/throughput: 18,16 ejemplos/s en Apple M3 Pro con batch 2 (dato del autor).

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de identificación de hablantes basados en texto con cuantización INT8 y MLX. La comparativa con el modelo padre FP32 se muestra en la tabla de benchmarks. No disponible para otras alternativas.

## Limitaciones y advertencias

- Licencia: Adobe Research License, que permite solo uso no comercial y de investigación. No se puede utilizar en producción comercial.
- No procesa audio: solo funciona con transcripciones de texto. No se puede usar para identificación de hablantes a partir de señales acústicas.
- Idiomas: el backbone RoBERTa-large está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Contexto limitado: la ventana de 512 tokens de RoBERTa-large puede ser insuficiente para diálogos muy largos; habrá que segmentar la transcripción.
- Riesgo de alucinación: como modelo de clasificación, puede asignar hablantes incorrectamente en diálogos ambiguos o con muchas voces superpuestas.
- No es un modelo generativo: no puede producir texto, solo etiquetas de clasificación.
- El autor reporta que las métricas se mantienen respecto al padre, pero no hay evaluación adicional sobre robustez en dominios fuera del corpus MediaSum.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmarchant/speaker-id-joint-mlx-int8
- Repositorio de Adobe Research (código y licencia): https://github.com/adobe-research/speaker-identification
- Paper Interspeech 2024: https://arxiv.org/abs/2407.12094
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Licencia Adobe Research: https://github.com/adobe-research/speaker-identification/blob/main/LICENSE.md</think>## Resumen

El modelo `hmarchant/speaker-id-joint-mlx-int8` es una versión cuantizada a INT8 del Joint Speaker Identifier desarrollado por Adobe Research y presentado en Interspeech 2024. Se trata de un sistema de identificación de hablantes basado exclusivamente en texto: dado un diálogo transcrito, asigna cada turno de conversación a uno de los hablantes participantes. No procesa audio, solo transcripciones, lo que lo hace útil para corpus de entrevistas, actas o debates.

La cuantización weight-only INT8 se realizó con el framework MLX, calculando las escalas de las capas lineales y empaquetándolas en un formato compatible con PyTorch/MPS. El checkpoint resultante mantiene exactamente la misma precisión que el modelo original en FP32 (78,87) y reduce el tamaño en memoria de 1633 MB a 472 MB, una reducción del 71%. El backbone es RoBERTa-large y no se realizó ningún entrenamiento adicional: es una copia cuantizada del checkpoint original de Adobe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa-large) con cabezas de identificación de hablante |
| Parámetros totales | no disponible (backbone RoBERTa-large: ~355M parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-large: 512 tokens) |
| Tipos de cuantización | INT8 weight-only, escalas MLX, group size 64; cabezas pequeñas con absmax INT8 |
| Idiomas soportados | no disponibles (RoBERTa-large está entrenado principalmente en inglés) |
| Licencia | Adobe Research License (uso no comercial y de investigación únicamente) |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo original de Adobe Research es un sistema de identificación de hablantes basado en texto que combina un backbone RoBERTa-large con cabezas de clasificación específicas. El enfoque, descrito en el paper "Identifying Speakers in Dialogue Transcripts: A Text-based Approach Using Pretrained Language Models", se entrena sobre el corpus MediaSum y optimiza una función de pérdida conjunta que modela tanto la atribución de cada turno como la estructura general del diálogo.

El checkpoint `speaker-id-joint-mlx-int8` es una cuantización weight-only del modelo FP32 de Adobe. Las escalas de cuantización se calcularon con MLX (`mx.quantize` / `mx.dequantize`) para capas Linear cuya última dimensión es múltiplo de 64, y se empaquetaron en formato INT8 para inferencia en PyTorch/MPS. Las cabezas más pequeñas utilizan cuantización absmax INT8. No se realizó entrenamiento adicional ni ajuste fino, por lo que las métricas son idénticas a las del modelo padre.

## Capacidades

- Identificación de hablantes en transcripciones de diálogos multi-turno.
- Clasificación de cada turno de conversación asignándolo a uno de los hablantes conocidos.
- Razonamiento basado en el contexto textual completo de la transcripción, no solo en el turno aislado.
- Inferencia eficiente en Apple Silicon gracias a la cuantización MLX y soporte MPS.
- No es un modelo generativo: no produce texto, solo etiquetas de hablante.
- Compatible con PyTorch estándar para inferencia en GPU o CPU.

## Casos de uso

- Análisis de entrevistas de investigación: dado un corpus de entrevistas transcritas, el modelo asigna cada respuesta a su hablante, lo que permite análisis cualitativos y cuantitativos por interlocutor.
- Anonimización de transcripciones: etiquetar turnos de hablante para reemplazar posteriormente nombres o datos personales en corpus de texto antes de su publicación.
- Indexación de actas de reuniones: transcribir reuniones y aplicar el modelo para generar metadatos de quién dijo qué, facilitando búsquedas por persona.
- Construcción de datasets de diálogo: enriquecer corpus de conversaciones con etiquetas de hablante para entrenar otros modelos de NLP conversacional.
- Verificación de transcripciones: comparar las etiquetas predichas con las reales en corpus anotados para detectar errores de transcripción o de atribución.
- Investigación en análisis de conversación: estudiar patrones de turnos, interrupciones o longitud de intervención por hablante en diálogos transcritos.
- Pipeline de preprocesado en sistemas de comprensión de diálogo: integrar la identificación de hablante como etapa previa para modelos de resumen o extracción de información que requieren atribución.

## Benchmarks y rendimiento

Según la model card del modelo:

| Métrica | Valor |
|---|---|
| Precisión | 78,87 |
| Δ vs FP32 padre | 0,00 |
| F1 | 63,28 |
| Accuracy | 67,60 |
| Throughput | 18,16 ejemplos/s (Apple M3 Pro, MPS, batch 2) |
| Tamaño en memoria | 472 MB (FP32 padre: 1633 MB) |

No se han publicado resultados de benchmarks comparativos con otros modelos de identificación de hablante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 472 MB con cuantización INT8, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con soporte PyTorch (NVIDIA RTX 3060 o superior); en Apple Silicon funciona bien con MPS (probado en M3 Pro).
- Cabe en GPU consumer: sí, es un modelo muy ligero tras la cuantización.
- Opciones de despliegue: PyTorch nativo con MPS o CUDA; no está pensado para vLLM, llama.cpp u Ollama por no ser un modelo generativo.
- Latencia y throughput: 18,16 ejemplos/s en Apple M3 Pro con batch 2 (dato reportado por el autor).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otras alternativas de identificación de hablantes basadas en texto y cuantización INT8. La comparación directa disponible es con el modelo padre FP32, que se refleja en la tabla de benchmarks: no hay degradación de precisión y el tamaño se reduce un 73%. No se conocen otros modelos de la misma categoría con características comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Adobe Research License permite únicamente uso no comercial y de investigación. No se puede utilizar en producción comercial sin autorización expresa.
- No procesa audio: el modelo opera exclusivamente sobre transcripciones de texto, por lo que no es útil para identificación de hablante por voz.
- Idioma: el backbone RoBERTa-large está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Contexto limitado: la ventana de 512 tokens de RoBERTa-large puede ser insuficiente para diálogos muy largos; será necesario segmentar la transcripción.
- Riesgo de alucinación: como modelo de clasificación, puede asignar turnos incorrectos en diálogos ambiguos o con muchas voces superpuestas.
- No es un modelo generativo: no produce texto ni soporta tool calling, agentes o razonamiento multi-step.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmarchant/speaker-id-joint-mlx-int8
- Repositorio de Adobe Research: https://github.com/adobe-research/speaker-identification
- Paper Interspeech 2024: https://arxiv.org/abs/2407.12094
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Licencia Adobe Research: https://github.com/adobe-research/speaker-identification/blob/main/LICENSE.md
