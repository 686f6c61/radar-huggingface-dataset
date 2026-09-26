# durganani60/sentiment-model

## Resumen

El modelo `durganani60/sentiment-model` es un clasificador de texto en inglés obtenido mediante fine-tuning del checkpoint `distilbert-base-uncased` con la librería Transformers y la clase `Trainer`. Se distribuye bajo licencia Apache 2.0 y está etiquetado con el pipeline `text-classification`, por lo que su propósito declarado es la clasificación de sentimiento, aunque la model card no especifica las clases concretas ni el conjunto de datos empleado. El repositorio tiene un tamano de 0,3 GB y contiene 66.955.779 parámetros en formato safetensors.

Se trata de un modelo pequeño y ligero (arquitectura DistilBERT, 6 capas transformer y 768 dimensiones ocultas heredadas del modelo base), pensado para inferencia de baja latencia incluso en CPU. Los resultados declarados en el conjunto de evaluación son modestos: una pérdida de 0,7470, una exactitud de 0,6598 y un F1 ponderado y macro de 0,6493, sin que el autor haya documentado el dataset ni la metodología de evaluación.

Su relevancia práctica es limitada: se trata de un checkpoint experimental publicado sin métricas de benchmark, sin descripción de datos de entrenamiento y con cero descargas. Resulta útil como punto de partida para fine-tuning propio o como ejemplo de pipeline de clasificación, pero no como componente listo para producción sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), destilación de `distilbert-base-uncased` |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; cuantización dinámica de PyTorch u ONNX son aplicables externamente) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, un transformer encoder con 6 capas, 768 dimensiones ocultas, 12 cabezas de atención y ~66 millones de parámetros, obtenido originalmente por destilación de conocimiento a partir de BERT-base. Sobre esa base se ha añadido una cabeza de clasificación de secuencias (sequence classification) para texto en inglés. La model card no detalla cuántas etiquetas tiene la cabeza final ni si la tarea es binaria o multiclase.

El entrenamiento se realizó con el `Trainer` de Transformers durante 3 épocas, con tasa de aprendizaje 2e-05, tamaño de lote de 32 tanto en entrenamiento como en evaluación, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), planificador lineal, semilla 42 y 174 pasos totales (58 pasos por época). Esto implica un conjunto de entrenamiento de aproximadamente 1.856 ejemplos, claramente insuficiente para una tarea de clasificación robusta. El dataset es desconocido ("on an unknown dataset"), no se documenta composición ni número de tokens, y no se menciona ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): asignación de una etiqueta de sentimiento a una secuencia de entrada.
- Manejo de entradas de hasta 512 tokens, gracias al tokenizador y a la posición codificada del modelo base.
- Inferencia ligera y rápida, apta para CPU y para GPUs de gama baja.
- Exportable a otros formatos de inferencia (ONNX, TorchScript) por su arquitectura estándar de encoder.
- Soporte de `tool calling` / `function calling`: no disponible, no es un modelo generativo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Análisis de reseñas de productos: clasificar opiniones de clientes en positivas o negativas para alimentar paneles de satisfacción. Adecuado por su bajo coste de inferencia, aunque la exactitud de 0,6598 obliga a validar el umbral en el dominio concreto.
- Monitorización de marca en redes sociales: procesar grandes volúmenes de menciones en streaming con un modelo de 66 millones de parámetros que cabe en CPU y permite throughput alto.
- Enrutamiento de tickets de soporte: etiquetar automáticamente la tonalidad de una reclamación para priorizar casos negativos hacia atención humana.
- Análisis de encuestas NPS y comentarios abiertos: agregar el sentimiento de respuestas de texto libre para complementar la puntuación numérica.
- Moderación de comentarios: filtrar contenido con tono negativo o tóxico en foros y secciones de comentarios, siempre como primera capa de un sistema con revisión humana.
- Clasificación por lotes en pipelines de datos: procesar corpus históricos de feedback para enriquecer un almacén analítico, ya que el modelo es pequeño y se puede ejecutar en paralelo.
- Prototipado y experimentación académica: servir como baseline frente a modelos de sentimiento más grandes o específicos de dominio.

## Benchmarks y rendimiento

El autor no ha publicado resultados en el `model-index` (la lista de resultados está vacía). Los únicos datos disponibles son las métricas de evaluación declaradas en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento según los registros del `Trainer`:

| Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados en benchmarks estándar (GLUE, SST-2, IMDb, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~268 MB de pesos); menos de 300 MB si se aplica cuantización dinámica de PyTorch a int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100. El modelo no aprovecha el paralelismo de GPUs de gama alta y el cuello de botella estará en la CPU o en el preprocesado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en Raspberry Pi o en CPU convencional.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, TorchScript, TorchServe, FastAPI + `pipeline`, o Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`). No procede usar llama.cpp u Ollama, ya que no se publican pesos GGUF ni es un modelo generativo.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones). Como referencia orientativa de la arquitectura, DistilBERT es aproximadamente un 60 % más rápido que BERT-base en CPU, pero no hay cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `durganani60/sentiment-model` | 66,9 M | 512 tokens | Apache 2.0 | Hugging Face, 0 descargas | Accuracy 0,6598 en evaluación propia; dataset no documentado |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 tokens | Apache 2.0 | Hugging Face, muy descargado | Fine-tuning sobre SST-2; binario (positivo/negativo); métricas publicadas |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | No disponible en la información | Hugging Face, muy descargado | Entrenado sobre ~124 M de tuits; tres clases; dominio redes sociales |
| `finiteautomata/bertweet-base-sentiment-analysis` | ~135 M | 128 tokens | No disponible en la información | Hugging Face | Basado en BERTweet; dominio Twitter |

Los datos de rendimiento de los modelos alternativos no se incluyen aquí porque no forman parte de la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Exactitud baja: 0,6598 de accuracy y 0,6493 de F1 macro sitúan el modelo cerca de un clasificador trivial en tareas binarias equilibradas. No es apto para decisiones automatizadas sin intervención humana.
- Dataset de entrenamiento desconocido: la model card indica explícitamente "on an unknown dataset", por lo que no se puede evaluar la representatividad ni el dominio de aplicación.
- Tamaño de entrenamiento reducido: aproximadamente 1.856 ejemplos y 174 pasos, lo que favorece el sobreajuste y explica la caída de métricas entre la época 2 y la 3.
- Número de clases no documentado: se desconoce si la clasificación es binaria o multiclase, lo que impide interpretar correctamente la salida sin inspeccionar la configuración del modelo.
- Idioma: el modelo base es `distilbert-base-uncased`, entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado y no se ha evaluado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en entradas ambiguas, irónicas o fuera de dominio.
- Sesgos: no documentados, pero heredados del corpus de preentrenamiento de BERT, que incluye sesgos de género, raza y religión recogidos en la literatura sobre modelos BERT.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base, también Apache 2.0.
- Producción: sin benchmarks, sin evaluación por dominio y sin documentación de la cabeza de clasificación, el checkpoint debe tratarse como experimental y requiere una validación completa antes de cualquier despliegue.
- Modelo abandonado o de prueba: cero descargas y cero "likes" en el momento de la consulta, creado y actualizado en un intervalo de ocho segundos, lo que sugiere una publicación automática sin revisión posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/durganani60/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de la tarea de clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
