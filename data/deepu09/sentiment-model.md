# Deepu09/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, publicado por el usuario Deepu09 en Hugging Face. Su propósito declarado es el análisis de sentimiento, aunque la model card no especifica el conjunto de datos de entrenamiento ni la taxonomía exacta de etiquetas empleada. Se trata de un modelo de 66.955.779 parámetros (aproximadamente 67 millones) con licencia Apache 2.0 y pesos en formato safetensors.

El modelo parte de DistilBERT, una destilación de BERT-base que reduce el número de capas a la mitad y conserva en torno al 97 % del rendimiento del modelo original en tareas de comprensión del lenguaje, con una latencia inferior. Sobre esa base se aplicó un ajuste fino supervisado de 3 épocas con un learning rate de 2e-5, batch size de 32 y el optimizador AdamW fused. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con métricas modestas (accuracy de 0,6598 y F1 macro de 0,6493 en el conjunto de evaluación) y sin datos publicados sobre el corpus de entrenamiento. Resulta útil como referencia para entender el flujo de `Trainer` de Transformers y como punto de partida para fine-tunings propios, pero no está validado para producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base soporta hasta 512 tokens de entrada; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch, no documentada) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en ingles; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, dimensión oculta de 768, 12 cabezas de atención y aproximadamente 67 millones de parámetros. DistilBERT se obtiene por destilación de conocimiento de BERT-base, eliminando la mitad de las capas y manteniendo la dimensionalidad, lo que reduce el coste computacional a aproximadamente el 60 % del original. Sobre esta base se añade una cabeza de clasificación de secuencia para la tarea de análisis de sentimiento.

El ajuste fino se realizó con el `Trainer` de Transformers 5.22.1 sobre PyTorch 2.14.1+cu130, con 3 épocas, learning rate 2e-5, batch size 32 en entrenamiento y evaluación, scheduler lineal, semilla 42 y AdamW fused con betas (0,9; 0,999) y epsilon 1e-8. El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card), lo que impide evaluar la composición, el balance de clases ni el dominio del corpus. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación de texto en una única etiqueta por secuencia (pipeline `text-classification`).
- Análisis de sentimiento binario o multiclase, según la taxonomía del corpus de entrenamiento (no documentada).
- Inferencia rápida en CPU y GPU gracias al tamaño reducido del modelo (67 M de parámetros).
- Compatible con la librería `transformers` y con `endpoints_compatible` según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no declaradas; el tokenizador `uncased` del modelo base está orientado a inglés.

## Casos de uso

- Clasificación por lotes de reseñas de producto: el modelo puede procesar grandes volúmenes de texto corto en CPU con un throughput alto gracias a sus 67 M de parámetros, etiquetando cada reseña como positiva o negativa según el corpus de entrenamiento (a validar empíricamente antes de usar).
- Filtrado previo en pipelines de moderación: usar el modelo como primera etapa barata para descartar contenido claramente negativo antes de pasarlo a un modelo mayor, reduciendo coste computacional.
- Prototipado rápido de tareas de clasificación: sirve como plantilla reproducible de fine-tuning con `Trainer` para equipos que quieran adaptar DistilBERT a su propio corpus etiquetado.
- Análisis exploratorio de sentimiento en redes sociales: para volúmenes moderados de tuits o comentarios en inglés, siempre que se valide la accuracy real sobre el dominio objetivo (la reportada es 0,6598).
- Baseline en experimentos académicos: como referencia de partida para comparar arquitecturas de clasificación más grandes o más pequeñas en tareas de análisis de sentimiento.
- Docencia y formación: ejemplo mínimo y funcional de un pipeline de fine-tuning de transformers, con hiperparámetros y curvas de entrenamiento documentadas en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Epoca | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible. El model-index del repositorio está vacío (`results: []`). No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 270 MB para los pesos (67 M × 4 bytes) más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y también en CPU.
- GPU recomendadas: no requiere GPU dedicada; una T4 o una RTX 3060 son suficientes para throughput alto en batch.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `optimum` para exportación a ONNX, `TorchScript`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son motores orientados a modelos generativos, no a clasificación encoder-only).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de este tamaño se espera un throughput de miles de secuencias por segundo en GPU moderna con batch grande, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy reportada |
|---|---|---|---|---|---|
| Deepu09/sentiment-model | 66,96 M | no disponible | Clasificacion de sentimiento | Apache 2.0 | 0,6598 |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificacion de sentimiento (SST-2) | Apache 2.0 | no disponible en esta ficha |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Clasificacion de sentimiento (Twitter) | no disponible en esta ficha | no disponible en esta ficha |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base (sin fine-tuning) | Apache 2.0 | no aplica |

La comparación se limita a características estructurales; no se dispone de métricas de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Accuracy de evaluación de 0,6598 y F1 macro de 0,6493: valores bajos para una tarea de clasificación de sentimiento, lo que sugiere un corpus de entrenamiento pequeño, ruidoso o mal etiquetado.
- El conjunto de datos de entrenamiento no está documentado ("unknown dataset"), lo que impide evaluar sesgos, cobertura de dominio y balance de clases.
- El modelo base es `distilbert-base-uncased`, orientado a inglés; no se declaran idiomas soportados ni se ha validado su comportamiento en castellano.
- La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas sistemáticas en dominios alejados del corpus de entrenamiento.
- No validado para producción: 0 descargas y 0 likes en el repositorio; sin evidencia de uso real.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el corpus de entrenamiento impide descartar problemas de procedencia de datos.
- No se recomienda su uso como componente crítico en sistemas de decisión automatizada sin una evaluación previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deepu09/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de Transformers (pipeline text-classification): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
