# shiri7/lab6-trained

## Resumen

`shiri7/lab6-trained` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, la variante destilada de BERT desarrollada originalmente por Hugging Face. Lo publica el usuario `shiri7` bajo licencia Apache 2.0 y se enmarca en un contexto claramente academico o de laboratorio (el nombre "lab6" sugiere una practica de curso), sin documentacion adicional sobre el dataset, la tarea concreta ni los usos previstos.

Tecnicamente es un transformer encoder de tipo BERT con 66.958.086 parametros (aproximadamente 67 millones), 6 capas y tokenizador WordPiece en ingles, entrenado durante 2 epocas con AdamW y scheduler lineal sobre un dataset no especificado. Alcanza un 86,77 % de accuracy y un F1 weighted de 0,8682 en el conjunto de evaluacion declarado por el autor, aunque el F1 macro (0,6751) revela un desequilibrio notable entre clases.

Su relevancia practica es limitada: no hay benchmarks publicados, no se documenta el dominio de aplicacion y el repositorio no tiene descargas ni interacciones. Resulta util unicamente como referencia de un fine-tuning de DistilBERT para clasificacion o como punto de partida para reproducir el experimento, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (DistilBERT, 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch/ONNX, no documentado por el autor) |
| Idiomas soportados | no disponible (el modelo base es unicamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66,9 millones de parametros que destila el conocimiento de BERT-base reduciendo el numero de capas a la mitad. La cabeza de clasificacion se anade sobre la representacion del token `[CLS]`, tal como es habitual en tareas de clasificacion de secuencias con modelos BERT.

El entrenamiento se realizo con los siguientes hiperparametros: learning rate 5e-05, batch size de 8 en entrenamiento y evaluacion, 2 epocas (1094 pasos totales), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. No se especifica el dataset, el numero de clases, la composicion de los datos ni si hubo tecnicas adicionales como data augmentation o class weighting. La model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento. Las versiones de framework declaradas son Transformers 5.14.1, PyTorch 2.9.1+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, con una cabeza entrenada para asignar etiquetas a secuencias de entrada.
- Generacion de texto: no soportada (modelo encoder-only).
- Razonamiento, matematicas y codigo: no soportados de forma nativa.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no documentadas; el modelo base es exclusivamente en ingles.
- Vision, audio, thinking mode: no soportados.
- Compatibilidad con text-embeddings-inference y endpoints: indicada en los tags del repositorio.

## Casos de uso

- Clasificacion de tickets de soporte: dado que el modelo tiene una cabeza de clasificacion entrenada, podria reutilizarse o reentrenarse para etiquetar incidencias por categoria, siempre que el dominio coincida con el dataset original (desconocido).
- Filtrado de contenido en pipelines de moderacion: un encoder de 67 millones de parametros permite inferencia de baja latencia en CPU y puede integrarse como clasificador binario o multiclase en un sistema de moderacion.
- Analisis de sentimiento en resenas: el tamano reducido permite desplegarlo en entornos con recursos limitados, aunque el idioma de trabajo seria el ingles.
- Clasificacion de documentos en lotes: con 67 millones de parametros y pesos safetensors de 0,8 GB, es viable procesar grandes volumenes en CPU sin GPU dedicada.
- Base para experimentos academicos: sirve como punto de partida reproducible para practicas de fine-tuning con DistilBERT, dado que se documentan hiperparametros y resultados de validacion.
- Etiquetado semiautomatico de datasets: puede usarse para preetiquetar grandes corpus en ingles y revisar manualmente solo los casos de baja confianza, acelerando la anotacion.
- Deteccion de spam o toxicidad en foros en ingles: el modelo puede adaptarse con un fine-tuning adicional sobre datos propios, aprovechando su bajo coste computacional.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluacion (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,5867 |
| Accuracy | 0,8677 |
| F1 macro | 0,6751 |
| F1 weighted | 0,8682 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 macro | F1 weighted |
|---|---|---|---|---|---|
| 1 | 547 | 0,5670 | 0,8519 | 0,6911 | 0,8532 |
| 2 | 1094 | 0,5867 | 0,8677 | 0,6751 | 0,8682 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. El model-index del repositorio esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M parametros x 4 bytes), mas activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: alrededor de 0,14 GB para pesos.
- GPU recomendadas: no requiere GPU dedicada; funciona correctamente en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier modelo, incluidos portatiles con GPU integrada.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, Text Embeddings Inference (TEI, indicado en los tags), ONNX Runtime, TorchServe o cualquier servidor compatible con Hugging Face Endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Para un encoder de 6 capas y 67 M parametros se espera latencia de milisegundos por muestra en CPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| shiri7/lab6-trained | 66,9 M | no disponible | Apache 2.0 | Fine-tuning de laboratorio, sin benchmarks publicos |
| distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Modelo base oficial de Hugging Face, ampliamente validado en GLUE |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Modelo base original, mayor precision a mayor coste |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache 2.0 | Fine-tuning oficial para analisis de sentimiento, con benchmarks publicados |

La comparacion con `distilbert-base-uncased` es la mas directa: `lab6-trained` es una especializacion del mismo, pero carece de la documentacion, benchmarks y validacion comunitaria del modelo base. Frente a `bert-base-uncased`, ofrece menor coste computacional a cambio de menor capacidad. No se dispone de datos para comparar rendimiento con alternativas como RoBERTa o DeBERTa.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica la tarea, el numero de clases ni el dominio, lo que impide evaluar la validez del modelo fuera de su contexto original.
- F1 macro bajo (0,6751) frente a accuracy alta (0,8677): indica un fuerte desequilibrio de clases y un rendimiento pobre en las clases minoritarias.
- Idioma: el modelo base es exclusivamente en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Sesgos: al derivar de `distilbert-base-uncased`, hereda los sesgos presentes en los corpus web en ingles utilizados para preentrenar el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Sin validacion externa: cero descargas y cero likes en Hugging Face; no hay evidencia de uso en produccion ni de evaluacion independiente.
- Longitud de contexto: no confirmada en la model card; se asume el limite de 512 tokens de DistilBERT, pero no esta documentado.
- Fecha de creacion futura (2026-11-10): el repositorio presenta metadatos anomalos que sugieren un entorno de pruebas o un error de registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiri7/lab6-trained
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
