# sayami00/sentiment-model

## Resumen

Sentiment-model es un clasificador de texto en inglés desarrollado por el usuario sayami00 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo distilbert-base-uncased, la variante destilada de BERT con 66.955.779 parámetros y una ventana máxima de 512 tokens. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para la tarea de clasificación de sentimiento (pipeline `text-classification`).

El modelo fue entrenado con la librería Transformers mediante `Trainer` y la etiqueta `generated_from_trainer`. La model card no documenta el conjunto de datos de entrenamiento ni las clases objetivo, y el `model-index` no incluye resultados formales de benchmarks. Los únicos datos de rendimiento disponibles son las métricas de validación declaradas por el autor: una pérdida de 0,7470, una exactitud (accuracy) de 0,6598 y un F1 ponderado y macro de 0,6493 en el conjunto de evaluación.

Su relevancia práctica es limitada pero útil como punto de partida: es un modelo pequeño (0,3 GB) que puede ejecutarse en CPU o en cualquier GPU de consumo, sirve como baseline para experimentos de clasificación de sentimiento y puede reentrenarse o afinarse con datos propios. No obstante, dado que se desconoce el dataset, las clases y los idiomas soportados, no debería desplegarse en producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), derivado de distilbert-base-uncased |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (posición máxima de DistilBERT) |
| Tipos de cuantizacion | Repositorio solo en precisión completa; no se publican versiones cuantizadas. Es posible cuantización dinámica int8 con PyTorch/ONNX |
| Idiomas soportados | no disponible (el modelo base es en inglés "uncased"; el autor no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: pipeline `text-classification`, librería `transformers`, tamaño del repositorio 0,3 GB, 0 descargas y 0 likes en el momento de la consulta. Motor de entrenamiento: Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1.

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención, obtenido mediante destilación del conocimiento de BERT-base. Sobre esa base, el autor añadió una cabeza de clasificación de secuencias (sequence classification) y realizó un ajuste fino supervisado con el `Trainer` de Hugging Face. DistilBERT reduce el número de parámetros de BERT-base en aproximadamente un 40 % manteniendo una ventana de contexto de 512 tokens, lo que lo hace adecuado para inferencia de baja latencia.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, el número de clases objetivo ni si se aplicó RLHF, DPO o alguna técnica de alineación (ninguna de ellas es habitual en clasificadores encoder). Los hiperparámetros declarados son: 3 épocas, learning rate 2e-05, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW torch fused con betas (0,9, 0,999) y epsilon 1e-08, y scheduler lineal. No se documenta ninguna innovación técnica adicional más allá del propio ajuste fino.

## Capacidades

- Clasificación de texto (sentimiento) sobre secuencias en inglés, con una única etiqueta por secuencia.
- Ventana de contexto de hasta 512 tokens, suficiente para frases, párrafos cortos, reseñas o tuits largos.
- Inferencia rápida y ligera: 66,9 M de parámetros, ejecutable en CPU y en GPU de consumo.
- Compatible con el pipeline `text-classification` de Transformers y con la API de `AutoModelForSequenceClassification`.
- Exportable a ONNX, OpenVINO y TensorRT para optimización de producción.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", visión ni audio.
- Capacidades multilingües: no disponibles (no declaradas; el base es inglés "uncased").

## Casos de uso

- Clasificación de reseñas de producto: el modelo puede etiquetar opiniones de clientes en inglés con una sola pasada, aprovechando su ventana de 512 tokens para reseñas de longitud media. Es adecuado como prototipo inicial antes de invertir en un modelo mayor.
- Preetiquetado de datasets de sentimiento: dado su bajo coste computacional, sirve para anotar grandes volúmenes de texto y después revisar manualmente solo los casos de baja confianza, acelerando la construcción de corpus etiquetados.
- Análisis de encuestas y feedback abierto: integrado en un pipeline de Transformers, permite agregar respuestas NPS o comentarios abiertos por polaridad para informes de producto.
- Monitorización de menciones en redes sociales: puede procesar flujos de texto en inglés en tiempo casi real en CPU, útil para paneles de reputación de marca con volúmenes moderados.
- Enrutado de tickets de soporte: clasificar el tono de un ticket (positivo/negativo) para priorizar la atención, integrándolo en un sistema de colas mediante una API FastAPI o TorchServe.
- Baseline en experimentos de MLOps: por su tamaño (0,3 GB) y su licencia permisiva, es un candidato cómodo para comparar frente a modelos mayores en pruebas de A/B y pipelines de CI/CD.
- Filtrado de comentarios en foros o comunidades: detección de comentarios con carga negativa como señal auxiliar para moderación, siempre acompañada de revisión humana dado su nivel de exactitud.

## Benchmarks y rendimiento

La model card no incluye entradas en el `model-index` (el array de resultados está vacío). El autor sí declara métricas de validación durante el entrenamiento, que se reproducen a continuación tal cual:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución por época declarada por el autor:

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado otros resultados de benchmarks (MMLU, GLUE, SST-2, etc.) en la información disponible. Nótese que la mejor exactitud se alcanza en la época 2 y que la pérdida de validación deja de mejorar en la época 3, lo que sugiere sobreajuste leve.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 268 MB; en fp16, unos 134 MB; con cuantización dinámica int8, unos 67 MB. A ello hay que sumar las activaciones, que en lotes pequeños son reducidas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, T4, A100, H100). El modelo no requiere aceleradores de gama alta.
- Cabe sobradamente en GPU de consumo e incluso en CPU: la inferencia en un procesador moderno es viable para lotes moderados.
- Opciones de despliegue: pipeline de Transformers, `AutoModelForSequenceClassification`, ONNX Runtime, OpenVINO, TensorRT, TorchServe y servicios FastAPI propios. No es un modelo pensado para vLLM ni para motores optimizados para LLM generativos.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones. Al tratarse de un encoder de 6 capas y 67 M de parámetros, se espera una latencia muy baja por secuencia frente a modelos generativos, pero cualquier cifra concreta debe medirse en el entorno objetivo.

## Comparativa con modelos similares

No se dispone de mediciones comparativas directas en la información proporcionada; las cifras de rendimiento de las alternativas se marcan como no disponibles. La comparación se limita a atributos estructurales verificables.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayami00/sentiment-model | 66,9 M | 512 tokens | DistilBERT fine-tuned | apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | DistilBERT base | apache-2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | DistilBERT fine-tuned para sentimiento (SST-2) | apache-2.0 | Hugging Face, referencia estándar de la tarea |
| bert-base-uncased | 110 M | 512 tokens | BERT base | apache-2.0 | Hugging Face |

Rendimiento comparado: no disponible en la información proporcionada. La model card de este modelo no publica métricas sobre un benchmark público (SST-2, GLUE, IMDb, etc.), por lo que no es posible establecer una comparación rigurosa con las alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "More information needed" en la descripción, los usos previstos y los datos de entrenamiento, lo que impide evaluar sesgos y cobertura.
- Exactitud moderada: 0,6598 de accuracy y 0,6493 de F1 macro en validación. Para muchas tareas de producción de análisis de sentimiento esto puede ser insuficiente.
- Clases objetivo no documentadas: se desconoce si es binario, ternario o de más clases, lo que dificulta su integración directa.
- Idiomas no declarados: el modelo base es inglés "uncased"; no hay garantías de funcionamiento correcto en castellano u otros idiomas.
- Riesgo de sesgo: al desconocerse el corpus de entrenamiento, no puede descartarse sesgo de dominio (por ejemplo, hacia un tipo concreto de texto) ni sesgo social o demográfico.
- Riesgo de alucinación: no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de etiquetas erróneas o mal calibradas, especialmente en textos fuera de dominio.
- Límite de contexto: secuencias superiores a 512 tokens deben truncarse, con la consiguiente pérdida de información.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si hubo cambios.
- Ausencia de adopción: 0 descargas y 0 likes, sin histórico de validación por parte de la comunidad.
- Recomendación para producción: no desplegar sin reentrenar o validar con datos propios, medir la calibración de las probabilidades y establecer umbrales de confianza y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sayami00/sentiment-model
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Librería Transformers: https://github.com/huggingface/transformers
- Documentación del pipeline text-classification: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
