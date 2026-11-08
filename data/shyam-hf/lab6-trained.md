# Shyam-HF/lab6-trained

## Resumen

`lab6-trained` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, publicado por el usuario Shyam-HF en Hugging Face. Se trata de un checkpoint de DistilBERT, la variante destilada de BERT desarrollada por Hugging Face, con 66.958.086 parámetros totales y un peso de repositorio de aproximadamente 0,8 GB. El modelo se ha entrenado con la librería Transformers (versión 5.14.1) y se distribuye en formato safetensors bajo licencia Apache 2.0.

La relevancia de este modelo es limitada y de ámbito académico: la propia model card indica que el dataset de entrenamiento es desconocido y que la descripción del modelo, los usos previstos y los datos de evaluación están pendientes de completar. No obstante, los resultados declarados en el conjunto de evaluación son razonables para una tarea de clasificación: accuracy de 0,8571 y F1 de 0,8515 tras dos épocas de entrenamiento. Esto lo convierte en un artefacto útil como referencia de un pipeline de fine-tuning estándar, no como un modelo listo para producción.

Al tratarse de un derivado de DistilBERT, hereda sus características estructurales: arquitectura transformer encoder con 6 capas, tokenizador WordPiece sin distinción de mayúsculas y una ventana de contexto de 512 tokens. El modelo no cuenta con descargas ni likes en el momento de la consulta y no declara idiomas soportados de forma explícita, aunque su modelo base está entrenado principalmente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (safetensors en precisión original; compatible con cuantización dinámica vía PyTorch) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento a partir de BERT-base. DistilBERT reduce el tamaño de BERT-base en aproximadamente un 40 % manteniendo alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje, gracias a un objetivo de destilación que combina la pérdida de clasificación con la imitación de las distribuciones de salida del profesor. El tokenizador es WordPiece sin distinción de mayúsculas, con un vocabulario de 30.522 tokens y una posición máxima de 512 tokens.

El entrenamiento reportado en la model card utilizó los siguientes hiperparámetros: learning rate de 5e-05, batch size de 8 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 2 épocas. El conjunto de datos de entrenamiento no se especifica ("unknown dataset"), lo que impide evaluar la composición, el dominio y la calidad de las etiquetas. La pérdida de validación aumentó de 0,5567 en la época 1 a 0,6095 en la época 2, mientras que la accuracy y el F1 mejoraron ligeramente, lo que sugiere un posible sobreajuste incipiente o una muestra de evaluación pequeña. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo asigna etiquetas a secuencias de entrada. El número y la naturaleza de las clases no se especifican en la información disponible.
- Codificación de representaciones: al ser un transformer encoder, puede extraer embeddings contextuales de hasta 512 tokens, útil para tareas de similitud semántica o clustering.
- Procesamiento de secuencias cortas y medias: adecuado para frases, párrafos y documentos breves que quepan en la ventana de 512 tokens.
- Compatibilidad con Text Embeddings Inference (TEI): el tag `text-embeddings-inference` y `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- No soporta tool calling ni function calling: no es un modelo generativo ni está entrenado para seguir instrucciones.
- No soporta agentes ni razonamiento multi-paso: carece de capacidades de generación libre o cadena de pensamiento.
- Capacidades multilingües: no declaradas; el modelo base está orientado al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías a mensajes de usuario de hasta 512 tokens, integrándose en un flujo de enrutamiento automático. Su tamaño reducido permite ejecutarlo en CPU con latencias de decenas de milisegundos por petición.
- Moderación de contenido en foros o comentarios: útil para etiquetar textos breves según políticas predefinidas, siempre que se reentrene con un dataset propio y etiquetas representativas, dado que el dataset original es desconocido.
- Análisis de sentimiento en reseñas: con un fine-tuning adicional sobre un corpus específico de dominio, sirve como clasificador ligero para monitorizar opiniones en tiempo casi real.
- Filtrado previo en pipelines de datos: al ser un encoder pequeño, puede usarse como primera etapa de cribado (por ejemplo, descartar documentos irrelevantes) antes de pasar a modelos generativos más costosos.
- Detección de spam o duplicados: la representación contextual de 512 tokens permite comparar embeddings y detectar contenido repetido o malicioso en colecciones de textos cortos.
- Prototipado académico y docencia: el modelo ejemplifica un pipeline completo de fine-tuning con Hugging Face Trainer, útil como referencia en cursos y laboratorios (el propio nombre "lab6-trained" sugiere este contexto).
- Extracción de embeddings para búsqueda semántica: desplegado con TEI, puede generar vectores para índices de recuperación sobre corpus en inglés de documentos breves.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card. El model-index no incluye entradas adicionales (la lista `results` está vacía).

| Metrica | Epoca 1 (step 547) | Epoca 2 (step 1094) |
|---|---|---|
| Training loss | 0,6460 | 0,2775 |
| Validation loss | 0,5567 | 0,6095 |
| Accuracy | 0,8466 | 0,8571 |
| F1 | 0,8395 | 0,8515 |

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con otros modelos. El conjunto de evaluación no se describe, por lo que estos valores no son directamente comparables con resultados publicados de otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (66,9 M de parámetros × 4 bytes), alrededor de 0,15 GB en FP16 y menos de 0,1 GB en cuantización INT8. El repositorio ocupa 0,8 GB por incluir pesos y posibles artefactos del trainer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; una NVIDIA T4, RTX 3060 o incluso una GTX 1650 cubren holgadamente la inferencia. Para entrenamiento, una RTX 4090 o A100 aceleran el proceso, aunque el modelo entrena en CPU en tiempos razonables para datasets pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vLLM no es adecuado (no es un modelo generativo); son preferibles Hugging Face `transformers` con pipeline `text-classification`, Text Embeddings Inference (TEI), ONNX Runtime, o exportación a TorchScript. También puede servirse con FastAPI o BentoML.
- Latencia y throughput estimados: no se han publicado mediciones en la información disponible. Por el tamaño del modelo, se espera latencia de decenas de milisegundos por lote pequeño en CPU y de pocos milisegundos en GPU, pero estos valores no están documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shyam-HF/lab6-trained | 66,9 M | 512 | Apache 2.0 | Hugging Face | Fine-tuning de DistilBERT con dataset desconocido; accuracy 0,8571 en evaluación propia |
| distilbert-base-uncased | 66,4 M | 512 | Apache 2.0 | Hugging Face | Modelo base sin fine-tuning para clasificación; referencia de arquitectura |
| bert-base-uncased | 110 M | 512 | Apache 2.0 | Hugging Face | Mayor capacidad que DistilBERT, aproximadamente 1,6× parámetros y mayor coste de inferencia |
| roberta-base | 125 M | 512 | MIT | Hugging Face | Encoder alternativo con tokenizador BPE; frecuente en tareas de clasificación |

No se dispone de comparaciones de rendimiento entre estos modelos y `lab6-trained` en un mismo conjunto de evaluación, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", lo que impide conocer la distribución de clases, el dominio y los posibles sesgos heredados de los datos.
- Sin información sobre las etiquetas: no se especifica cuántas clases tiene el clasificador ni su semántica, por lo que el modelo no es reutilizable directamente sin inspeccionar la configuración.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento; la accuracy de 0,8571 corresponde a un conjunto de evaluación no descrito.
- Posible sobreajuste: la pérdida de validación aumentó en la segunda época mientras el training loss cayó de 0,6460 a 0,2775, una señal típica de sobreajuste que conviene validar con datos propios.
- Limitación de contexto: 512 tokens; textos más largos requieren truncado o segmentación, con pérdida de información.
- Idioma: no se declaran idiomas soportados; el modelo base está entrenado principalmente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento; conviene revisar posibles obligaciones de atribución.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta; no hay issues, demos ni documentación adicional.
- No apto para generación de texto, agentes ni tool calling: es un clasificador, no un modelo de lenguaje generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shyam-HF/lab6-trained
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio relacionado (posible duplicado o variante): https://huggingface.co/denzelj06/lab6-trained/tree/main
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
