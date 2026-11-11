# Ayuti25/lab6-trained

## Resumen

`Ayuti25/lab6-trained` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert/distilbert-base-uncased`, la variante destilada de BERT desarrollada originalmente por Hugging Face. Lo publica el usuario Ayuti25 en Hugging Face bajo licencia Apache 2.0 y parece corresponder a un ejercicio académico (el nombre "lab6" sugiere una práctica de laboratorio), no a un modelo pensado para producción.

Se trata de un transformer encoder de tipo BERT destilado con 66.958.086 parámetros totales (unas 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, según la arquitectura estándar de DistilBERT), empaquetado en safetensors con un tamaño de repositorio de 0,1 GB. El pipeline declarado es `text-classification`, aunque la model card no especifica el número de etiquetas ni el dominio de la tarea.

Su relevancia práctica es muy limitada: los resultados declarados por el autor en el conjunto de evaluación son Loss `nan`, Accuracy 0,0212 y F1 0,0009, lo que indica que el entrenamiento no convergió correctamente o que el conjunto de evaluación está mal construido. La ficha se incluye por completitud del catálogo, pero debe interpretarse como un artefacto de aprendizaje y no como un modelo usable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (DistilBERT base soporta 512 tokens como maximo arquitectonico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es `uncased` en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con 66 millones de parametros. DistilBERT se obtiene por destilacion de conocimiento de BERT-base y conserva aproximadamente el 97 % del rendimiento de este con un 40 % menos de parametros. La tarea de cabecera es clasificacion de secuencias, con una capa lineal sobre el token `[CLS]`.

El entrenamiento se realizo con el `Trainer` de Transformers 5.14.1 sobre PyTorch 2.9.1+cu128, con optimizador AdamW fused, learning rate 5e-5, scheduler lineal, batch size 2 (train y eval), 2 epocas y semilla 42. El conjunto de datos no se especifica ("unknown dataset"). Los registros de entrenamiento muestran `Training Loss: 0.0` en ambas epocas y `Validation Loss: nan`, lo que apunta a un fallo en el calculo de la perdida (posiblemente por etiquetas mal formadas, secuencias vacias o un problema numerico) y a un sobreajuste trivial o colapso del modelo. No hay constancia de RLHF, DPO ni tecnicas adicionales.

## Capacidades

- Clasificacion de texto por secuencia (un unico `label` por entrada), segun el pipeline declarado.
- No se documenta el numero de clases ni la taxonomia de etiquetas.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un encoder discriminativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; el modelo base es exclusivamente en ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Ejercicio docente de fine-tuning: sirve como ejemplo reproducible de un pipeline de clasificacion con `Trainer` de Transformers, util para practicas de laboratorio sobre destilacion y clasificacion.
- Prueba de infraestructura de inferencia: por su tamano (0,1 GB) es adecuado para validar despliegues con Text Embeddings Inference o endpoints compatibles antes de mover modelos mayores.
- Prototipado de clasificadores binarios o multietiqueta: si se reentrena con un dataset etiquetado correctamente, la arquitectura DistilBERT es valida para tareas como deteccion de spam o analisis de sentimiento en ingles.
- Baseline de comparacion: puede usarse como referencia inferior en experimentos de clasificacion para medir la mejora de modelos mas grandes o mejor entrenados.
- Filtrado de datos a pequena escala: con un reentrenamiento adecuado, podria emplearse para descartar documentos irrelevantes en pipelines de curación de corpus en ingles.
- Demo de Hugging Face Spaces: por su ligereza, cabe en CPU y permite montar una demo interactiva de clasificacion sin GPU.

En ninguno de estos casos debe usarse el checkpoint publicado tal cual: los resultados de evaluacion (Accuracy 0,0212) lo desaconsejan para cualquier tarea real.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion (datos del autor, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Loss (validacion) | nan |
| Accuracy | 0,0212 |
| F1 | 0,0009 |

El `model-index` del autor no incluye resultados adicionales. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (66,9 M parametros x 4 bytes), mas activaciones.
- VRAM estimada en fp16: aproximadamente 135 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una T4 o L4 es mas que suficiente para lotes grandes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles de Hugging Face, ONNX Runtime si se exporta.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera del orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `Ayuti25/lab6-trained` | 66,9 M | no disponible (max. arquitectonico 512) | Apache 2.0 | Accuracy 0,0212 declarada |
| `distilbert/distilbert-base-uncased` | 66,9 M | 512 tokens | Apache 2.0 | Modelo base preentrenado, sin cabecera de clasificacion |
| `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | Apache 2.0 | Clasificador de sentimiento en ingles, referencia funcional |
| `google/bert_uncased_L-6_H-768_A-12` | 66,9 M | 512 tokens | Apache 2.0 | BERT pequeno preentrenado, alternativa no destilada |

La comparacion directa con `distilbert-base-uncased-finetuned-sst-2-english` es la mas informativa: mismo tamano y licencia, pero con un fine-tuning funcional y documentado, frente al checkpoint aqui descrito, cuyos resultados de evaluacion indican un fallo de entrenamiento.

## Limitaciones y advertencias

- Los resultados declarados (Accuracy 0,0212, F1 0,0009, Loss `nan`) indican que el modelo no es funcional para clasificacion; no debe desplegarse en produccion.
- El conjunto de entrenamiento y evaluacion no se documenta; se desconoce el dominio, el numero de clases y el equilibrio de etiquetas.
- Riesgo elevado de alucinacion en el sentido de predicciones sin significado: la cabecera de clasificacion no ha aprendido una frontera de decision util.
- Idiomas: el modelo base es `uncased` en ingles; no hay soporte multilingue documentado.
- Contexto maximo arquitectonico de 512 tokens (heredado de DistilBERT), aunque no se declara explicitamente en la model card.
- Sesgos: no evaluados; al derivar de `distilbert-base-uncased`, hereda los sesgos del corpus original (Wikipedia y BookCorpus en ingles).
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable ese uso sin reentrenamiento.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que impide evaluar la intencion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayuti25/lab6-trained
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
