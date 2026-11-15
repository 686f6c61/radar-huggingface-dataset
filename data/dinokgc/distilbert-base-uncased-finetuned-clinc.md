# dinokgc/distilbert-base-uncased-finetuned-clinc

## Resumen

`dinokgc/distilbert-base-uncased-finetuned-clinc` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el conjunto de datos CLINC (dominio de intenciones conversacionales), aunque la model card no confirma explícitamente el dataset ni su composición. Lo publica el usuario `dinokgc` en Hugging Face bajo licencia Apache 2.0, con un total de 67.069.591 parámetros y un tamaño de repositorio de 0,3 GB. El modelo está pensado para tareas de clasificación de intenciones en asistentes conversacionales y sistemas de enrutamiento de consultas.

La arquitectura es un transformer encoder destilado de BERT (DistilBERT), con 6 capas y 66 millones de parámetros, adecuado para inferencia de baja latencia en CPU y GPU de consumo. El fine-tuning se realizó durante 5 épocas con un learning rate de 2e-05, batch size de 48 y el optimizador AdamW, alcanzando una accuracy de 0,9161 y una pérdida de validación de 0,8061 en el conjunto de evaluación.

Es relevante ahora como ejemplo de modelo ligero y desplegable para clasificación de intenciones en producción, con compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face. No obstante, la información pública es escasa: la model card está generada automáticamente y no detalla el dataset, los idiomas ni los casos de uso previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 67.069.591 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base `uncased` en inglés; no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. DistilBERT reduce el tamaño de BERT en aproximadamente un 40 % y conserva alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje, lo que lo hace adecuado para despliegues con restricciones de latencia y memoria. La tarea de cabecera es clasificación de secuencias (`text-classification`), con una capa de clasificación sobre el token `[CLS]`.

El fine-tuning se realizó durante 5 épocas con learning rate 2e-05, batch size de 48 (entrenamiento y evaluación), semilla 42, scheduler lineal y AdamW con betas (0,9, 0,999) y epsilon 1e-08. La evolución de la pérdida de validación (3,3394 en la época 1, 1,9300 en la 2, 1,2025 en la 3, 0,8954 en la 4 y 0,8061 en la 5) y de la accuracy (0,7323, 0,8458, 0,8968, 0,9113 y 0,9161) muestra una convergencia estable sin señales claras de sobreajuste en el conjunto de evaluación. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de clasificación).

## Capacidades

- Clasificación de texto en secuencias de entrada, con salida de etiquetas de intención (el número exacto de clases no se especifica en la model card).
- Enrutamiento de consultas y detección de intenciones en asistentes conversacionales, presumiblemente sobre el esquema de CLINC.
- Inferencia de baja latencia en CPU y GPU de consumo gracias a sus 66 millones de parámetros.
- Compatibilidad con la librería `transformers` y con `text-embeddings-inference` para despliegue como endpoint.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base es `uncased` en inglés y no se confirma entrenamiento en otros idiomas.

## Casos de uso

- Clasificación de intenciones en asistentes virtuales: el modelo puede etiquetar la consulta del usuario en una categoría predefinida (por ejemplo, reserva, cancelación, información) para enrutarla al flujo de diálogo adecuado, aprovechando su accuracy de 0,9161 en evaluación.
- Enrutamiento de tickets de soporte: integrado en un pipeline de atención al cliente, clasifica el texto entrante y lo deriva al equipo o cola correspondiente con latencia baja en CPU.
- Preprocesado en sistemas RAG: como clasificador previo que decide qué recuperador o índice consultar según la intención detectada, reduciendo el espacio de búsqueda.
- Moderación y triaje de mensajes: filtrado y categorización de mensajes en foros o chats con un modelo ligero que cabe en una GPU de consumo o incluso en CPU.
- Clasificación por lotes en pipelines de datos: procesamiento de grandes volúmenes de texto con `transformers` o `text-embeddings-inference`, gracias al reducido tamaño del repositorio (0,3 GB).
- Prototipado rápido de clasificadores: servir como línea base fine-tuneada para experimentar con esquemas de intenciones antes de invertir en modelos mayores.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (datos del autor):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,8061 |
| Accuracy (evaluacion) | 0,9161 |

Evolución durante el entrenamiento:

| Epoca | Step | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1 | 318 | 4,3300 | 3,3394 | 0,7323 |
| 2 | 636 | 2,6891 | 1,9300 | 0,8458 |
| 3 | 954 | 1,6037 | 1,2025 | 0,8968 |
| 4 | 1272 | 1,0561 | 0,8954 | 0,9113 |
| 5 | 1590 | 0,8333 | 0,8061 | 0,9161 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. El `model-index` de la model card está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (67 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- En fp16: aproximadamente 135 MB de pesos; en int8: alrededor de 67 MB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 y H100 sin problemas, aunque el modelo está sobredimensionado para estas aceleradoras.
- Cabe en GPU de consumo e incluso en CPU para inferencia en tiempo real con lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline de `text-classification`), `text-embeddings-inference` (según los tags del repositorio) y endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dinokgc/distilbert-base-uncased-finetuned-clinc | 67 M | no disponible | Apache 2.0 | Fine-tuning sobre CLINC; accuracy 0,9161 en evaluación |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | Modelo base sin fine-tuning; no es clasificador de intenciones por defecto |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Mayor tamaño y coste; referencia habitual para clasificación de texto |
| roberta-base | 125 M | 512 tokens | MIT | Alternativa encoder con mejor rendimiento en GLUE, mayor coste |

No se dispone de comparativas de rendimiento publicadas entre este modelo y alternativas sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, el esquema de etiquetas ni los casos de uso previstos; la referencia a CLINC es inferida del nombre del modelo, no confirmada en el texto.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al derivar de `distilbert-base-uncased`, puede heredar sesgos presentes en los corpus web en inglés.
- Limitaciones de idioma: el modelo base es `uncased` en inglés; no se confirma soporte de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset CLINC si se redistribuye el modelo.
- Para producción: sin métricas por clase, matriz de confusión ni evaluación en dominios externos, la accuracy global de 0,9161 puede ocultar clases con bajo rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dinokgc/distilbert-base-uncased-finetuned-clinc
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Dataset CLINC150 (referencia): https://huggingface.co/datasets/clinc_oos
