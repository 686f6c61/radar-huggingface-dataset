# Divyesh2121/distilbert-yelp-lora-sentiment

## Resumen

DistilBERT Yelp LoRA Sentiment es un adaptador LoRA publicado por el usuario Divyesh2121 sobre el modelo base `distilbert-base-uncased`, orientado a la clasificación multiclase de reseñas de Yelp en cinco categorías (de 1 a 5 estrellas). Se trata de un proyecto de fine-tuning con PEFT (Parameter-Efficient Fine-Tuning) que entrena únicamente 741.893 parámetros (aproximadamente el 1,10% del total de 67.699.210) mediante LoRA con rango 8 y alpha 16 sobre las capas `q_lin` y `v_lin` del encoder.

El modelo resuelve un problema clásico de análisis de sentimiento granular: dado un texto de reseña, predecir su valoración en estrellas. El autor lo presenta como un proyecto de prácticas de IA/ML que compara varias aproximaciones (TF-IDF + regresión logística, clasificación zero-shot con DistilBART, fine-tuning completo de DistilBERT y fine-tuning con LoRA), siendo esta última la que se publica como adaptador.

Es relevante por su carácter didáctico y por mostrar un flujo completo de PEFT con un coste computacional muy bajo: el entrenamiento completo requirió aproximadamente 6,5 minutos y un pico de 0,94 GB de VRAM. No obstante, sus métricas (59,00% de accuracy y Macro F1 en test) quedan por debajo del fine-tuning completo del mismo modelo base (60,49% Macro F1), lo que lo sitúa como una alternativa eficiente pero no superior en calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de clasificación de secuencia y adaptadores LoRA |
| Parametros totales | 67.699.210 |
| Parametros activos | 741.893 entrenables (aproximadamente 1,10%) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia usada en entrenamiento; el modelo base soporta hasta 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés; el dataset Yelp está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre DistilBERT, un transformer encoder destilado de BERT con 6 capas y 66 millones de parámetros, al que se le añade una cabeza de clasificación de secuencia con 5 salidas. La configuración LoRA emplea rango 8, alpha 16, dropout 0,1, sin sesgo (`bias: none`), tipo de tarea `SEQ_CLS` y módulos objetivo `q_lin` y `v_lin`. El adaptador se carga con `AutoPeftModelForSequenceClassification` de la librería PEFT.

El entrenamiento se realizó sobre el dataset Yelp Review Full (`Yelp/yelp_review_full`) con 20.000 muestras de entrenamiento, 5.000 de validación y 5.000 de test, con split estratificado y semilla 42. Se tokenizó con el tokenizador de DistilBERT, truncando a 256 tokens y usando padding dinámico con `DataCollatorWithPadding`. Los hiperparámetros principales fueron: optimizador AdamW (por defecto del `Trainer`), learning rate 2e-4, 3 épocas, batch size de 8 en entrenamiento y evaluación, weight decay 0,01 y precisión FP16. La selección del mejor checkpoint se hizo por Macro F1 en validación. Se compararon tres learning rates (5e-5, 1e-4 y 2e-4), resultando 2e-4 el mejor con Macro F1 de validación de 0,5998.

## Capacidades

- Clasificación de texto multiclase: predice una de cinco clases (0 a 4, correspondientes a 1 a 5 estrellas) a partir de una reseña.
- Análisis de sentimiento granular: distingue entre valoraciones negativas, neutras y positivas con cinco niveles.
- Inferencia sobre textos de hasta 256 tokens (truncado automático en el uso de ejemplo).
- Carga como adaptador PEFT sobre el modelo base de DistilBERT.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés y el dataset de entrenamiento es en inglés.
- No dispone de modo "thinking" ni funciones especiales.

## Casos de uso

- Análisis de sentimiento en reseñas de restaurantes y comercios: el modelo clasifica reseñas de Yelp en 1-5 estrellas, útil para agregar métricas de satisfacción por local o producto a partir de texto libre.
- Moderación y priorización de feedback: permite enrutar automáticamente reseñas negativas (1-2 estrellas predichas) a equipos de atención al cliente para su revisión prioritaria.
- Enriquecimiento de datasets: asignar una etiqueta de rating estimada a reseñas sin etiquetar para análisis exploratorio o para preentrenar otros clasificadores.
- Prototipado rápido con recursos limitados: al requerir menos de 1 GB de VRAM en entrenamiento y solo 741.893 parámetros entrenables, es adecuado para entornos educativos, notebooks o GPUs de consumo.
- Comparación de metodologías PEFT: sirve como referencia en experimentos que comparen LoRA frente a fine-tuning completo o enfoques clásicos (TF-IDF + regresión logística).
- Filtrado de reseñas en pipelines de ingestión: clasificar grandes volúmenes de reseñas en lotes para segmentar por sentimiento antes de un análisis más profundo.
- Demostración de despliegue de adaptadores PEFT: ejemplo de integración con `transformers` y `peft` en un servicio de clasificación ligero.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test) | 59,00% |
| Macro Precision (test) | 59,03% |
| Macro Recall (test) | 59,00% |
| Macro F1 (test) | 59,00% |
| Macro F1 validación (lr 5e-5) | 0,5798 |
| Macro F1 validación (lr 1e-4) | 0,5914 |
| Macro F1 validación (lr 2e-4) | 0,5998 |

Comparativa de enfoques reportada por el autor (Macro F1 en test):

| Enfoque | Macro F1 test |
|---|---|
| TF-IDF + Logistic Regression | 52,35% |
| Zero-shot DistilBART | 30,44% |
| DistilBERT fine-tuning completo | 60,49% |
| DistilBERT LoRA (este modelo) | 59,00% |

Eficiencia de entrenamiento reportada:

| Medición | LoRA |
|---|---|
| Tiempo de entrenamiento | Aproximadamente 6,5 minutos |
| Pico de memoria GPU | Aproximadamente 0,94 GB |
| Parámetros entrenables | 741.893 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador específico y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el adaptador LoRA ocupa unos pocos MB y el modelo base DistilBERT en FP32 ronda los 270 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- VRAM estimada para entrenamiento: aproximadamente 0,94 GB de pico según el autor, con batch size 8 y FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, T4 o superiores son suficientes. También es viable en CPU para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` (carga con `AutoPeftModelForSequenceClassification`), exportación a ONNX no documentada, integración en pipelines de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por muestra en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilBERT LoRA Yelp (este) | 67,7 M (0,74 M entrenables) | 256 tokens (entrenamiento) | 59,00% | apache-2.0 | HuggingFace |
| DistilBERT fine-tuning completo (mismo experimento) | 67,7 M | 256 tokens | 60,49% | apache-2.0 (base) | No publicado como modelo |
| TF-IDF + Logistic Regression (mismo experimento) | no aplica | no aplica | 52,35% | no aplica | No publicado |
| Zero-shot DistilBART (mismo experimento) | no disponible | no disponible | 30,44% | no disponible | No publicado |

No se dispone de comparación con otros adaptadores LoRA públicos sobre Yelp en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con reseñas de Yelp y puede no generalizar a otros dominios (productos, redes sociales, soporte técnico).
- Predice una calificación discreta; no genera resúmenes ni explicaciones de la reseña.
- El rendimiento puede variar según la calidad del texto, la longitud de la reseña y el estilo de escritura.
- El autor lo declara destinado a experimentación y uso educativo; no se documenta una validación para producción.
- El Macro F1 de 59,00% implica una tasa de error considerable (aproximadamente 41%), por debajo del fine-tuning completo del mismo modelo base.
- No hay información sobre sesgos específicos, pero al entrenarse con reseñas de Yelp puede heredar sesgos de ese corpus (sesgo de selección, distribución geográfica y demográfica).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos o fuera de distribución.
- La licencia apache-2.0 permite uso comercial, pero el modelo base DistilBERT también es apache-2.0; conviene verificar la licencia del dataset Yelp Review Full para usos derivados.
- El truncado a 256 tokens puede perder información en reseñas largas.
- No se documentan idiomas soportados; el modelo base es `uncased` en inglés, por lo que el rendimiento en castellano no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Divyesh2121/distilbert-yelp-lora-sentiment
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset Yelp Review Full: https://huggingface.co/datasets/Yelp/yelp_review_full
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
- Documentación de PEFT: https://huggingface.co/docs/peft
