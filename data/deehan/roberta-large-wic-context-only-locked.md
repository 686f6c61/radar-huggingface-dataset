# Deehan/roberta-large-wic-context-only-locked

## Resumen

El modelo `Deehan/roberta-large-wic-context-only-locked` es un cross-encoder de clasificación binaria especializado en la tarea Word-in-Context (WiC), que consiste en determinar si una palabra dada aparece con el mismo sentido en dos oraciones distintas. Desarrollado por Deehan, se basa en el checkpoint `FacebookAI/roberta-large` y se ha ajustado sobre el dataset `Deehan1866/WiC_actual`. Su particularidad es que, además de las dos oraciones, recibe como tercera entrada un rationale generado por un LLM que explica la relación de sentidos, lo que permite al modelo atender conjuntamente a ambos contextos y a la explicación.

Con 355 millones de parámetros y una ventana de contexto de 512 tokens, este modelo está pensado para tareas de desambiguación léxica fina, donde la precisión en la distinción de sentidos es crítica. Su relevancia radica en que aborda un problema clásico de PLN con una arquitectura sencilla pero efectiva, y su formato de entrada con marcado explícito de la palabra objetivo facilita su integración en pipelines de análisis semántico. Aunque no se especifica licencia, el modelo base RoBERTa-large es de código abierto, por lo que su uso en investigación es viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) con cabezal de clasificación binaria |
| Parametros totales | 355.363.842 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo fijado en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el modelo base RoBERTa-large es MIT, pero este fine-tune no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-large`, un transformer encoder de 24 capas, 16 cabezas de atención y dimensión oculta de 1024, preentrenado con objetivos de enmascarado dinámico y empaquetado de oraciones sobre un corpus masivo en inglés. Sobre esta base se añade un cabezal de clasificación binaria (dos salidas: mismo sentido / distinto sentido) y se ajusta el conjunto completo de parámetros sobre el dataset `Deehan1866/WiC_actual`, que contiene pares de oraciones con la palabra objetivo marcada mediante etiquetas `<TGT>...</TGT>` en la posición exacta (índice 0-based) proporcionada por el dataset.

La innovación principal es el uso de un rationale generado por un LLM como tercera secuencia de entrada, concatenada tras la segunda oración con un token `[SEP]`. Esto permite que el modelo no solo compare las dos oraciones, sino que también tenga en cuenta una explicación explícita de la relación de sentidos, lo que puede mejorar la robustez frente a casos ambiguos. No se han publicado detalles sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, estrategia de regularización), por lo que estos datos no están disponibles.

## Capacidades

- Clasificación binaria de sentido de palabra en contexto (WiC): determina si una palabra marcada aparece con el mismo sentido en dos oraciones.
- Procesamiento de rationale externo: acepta una tercera secuencia de texto (explicación generada por un LLM) que se integra en la atención cruzada.
- Marcado preciso de la palabra objetivo mediante etiquetas `<TGT>`, independiente de la forma morfológica o lema.
- Entrada de dos oraciones simultáneas gracias a la arquitectura cross-encoder, que permite atender a ambas a la vez.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo exclusivamente discriminativo.

## Casos de uso

- Desambiguación léxica en motores de búsqueda: dado un término de consulta y un documento, el modelo puede determinar si el sentido de la palabra en ambos contextos coincide, mejorando la relevancia de los resultados.
- Análisis de sentimiento y opinión: en textos donde una misma palabra tiene acepciones distintas (p. ej., "bank" como entidad financiera o como ribera), el modelo ayuda a clasificar correctamente la intención.
- Sistemas de pregunta-respuesta: para verificar si una respuesta utiliza la misma acepción de un término que la pregunta, reduciendo ambigüedades en la evaluación automática.
- Mejora de traducción automática: al detectar cambios de sentido entre oraciones, se puede informar al traductor para elegir la variante léxica adecuada.
- Análisis de textos legales o técnicos: donde la precisión terminológica es crítica, el modelo puede señalar si un término se usa consistentemente en un documento o si hay cambios de significado.
- Evaluación de coherencia semántica en corpus: para estudios lingüísticos que requieran medir la variación de sentido de palabras a lo largo de un texto o entre documentos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de accuracy en el dataset WiC_actual:

| Split | Accuracy |
|---|---|
| Validación | 0.7194 |
| Test | 0.6843 |

No se han publicado comparaciones con otros modelos de desambiguación WiC en la información disponible, por lo que no es posible establecer una tabla comparativa con alternativas como BERT-large o modelos específicos de WiC.

## Requisitos de hardware

- VRAM estimada: con 355M parámetros en fp32, el modelo ocupa aproximadamente 1.4 GB en memoria. Para inferencia con batch pequeño (1-2 ejemplos) se necesitan al menos 2-3 GB de VRAM en GPU; con cuantización a int8 (no proporcionada por el autor, pero posible mediante herramientas externas) se podría reducir a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional se recomienda una GPU con 8-16 GB (RTX 3080, RTX 4090, A100).
- En CPU: es viable para inferencia puntual, con latencias de unos pocos cientos de milisegundos por ejemplo, dependiendo del hardware.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, se puede servir con vLLM, TGI, o mediante la API de Inference Endpoints. También es compatible con `transformers` directamente en Python.
- Latencia y throughput: no se han publicado mediciones oficiales; en una GPU moderna (RTX 3090) se espera una latencia de 10-20 ms por ejemplo con batch de 1.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para WiC con rationale. Como referencia, el modelo base RoBERTa-large tiene 355M parámetros y contexto de 512 tokens, mientras que alternativas como BERT-large (340M) o DeBERTa-large (400M) podrían usarse para la misma tarea, pero no hay datos de rendimiento comparativo en este dataset concreto. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Contexto limitado a 512 tokens: las oraciones y el rationale deben caber en esta ventana; textos más largos requieren truncamiento o estrategias de ventana deslizante.
- Solo inglés: el modelo está entrenado únicamente con datos en inglés, por lo que no es aplicable a otros idiomas sin reentrenamiento.
- Licencia no especificada: aunque el modelo base es MIT, el fine-tune no declara licencia, lo que puede generar incertidumbre legal para uso comercial. Se recomienda contactar al autor.
- Dependencia del rationale: el rendimiento puede degradarse si el rationale generado por el LLM es incorrecto o ruidoso, ya que el modelo lo usa como señal adicional.
- Riesgo de sesgos: al derivar de RoBERTa-large, puede heredar sesgos presentes en los datos de preentrenamiento (género, raza, etc.), lo que podría afectar a la desambiguación en ciertos dominios.
- Sin soporte para generación ni tareas abiertas: es un modelo discriminativo de clasificación binaria, no un LLM generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deehan/roberta-large-wic-context-only-locked
- Dataset de entrenamiento: https://huggingface.co/datasets/Deehan1866/WiC_actual
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Documentación de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/roberta.md
- Código fuente de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/src/transformers/models/roberta/modeling_roberta.py
