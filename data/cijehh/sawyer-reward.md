# cijehh/sawyer-reward

## Resumen

sawyer-reward es un modelo de clasificación de texto publicado por el usuario cijehh en HuggingFace, obtenido mediante fine-tuning de FacebookAI/roberta-base. Cuenta con 124.646.401 parámetros (124,6 M), se distribuye en formato safetensors bajo licencia MIT y se ejecuta con la librería transformers mediante el pipeline `text-classification`. Por su nombre y por la existencia de notebooks asociados a proyectos de "reward modeling" y optimización de LLM, se trata con alta probabilidad de un modelo de recompensa (reward model) pensado para puntuar respuestas generadas por un modelo de lenguaje, aunque la model card no lo confirma de forma explícita.

El modelo se entrenó durante 3 épocas con un learning rate de 1e-5 y un tamaño de lote efectivo de 32, alcanzando una precisión declarada de 0,96 y una pérdida de validación de 0,4956 en el conjunto de evaluación. Su relevancia práctica radica en que, al derivar de roberta-base, es un modelo pequeño que cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace adecuado como componente de puntuación dentro de pipelines de RLHF, reranking o filtrado de datos.

La documentación publicada es mínima: la model card fue generada automáticamente por el Trainer, el conjunto de datos de entrenamiento figura como "None", no se declaran idiomas soportados, no se especifica el esquema de etiquetas y el model-index no contiene resultados de benchmarks estándar. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-base): 12 capas, 768 de dimensión oculta, 12 cabezas de atención, cabecera de clasificación de secuencias |
| Parámetros totales | 124.646.401 (124,6 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 514 posiciones (límite de `max_position_embeddings` de roberta-base) |
| Tipos de cuantización | no disponible; el repositorio solo contiene pesos safetensors |
| Idiomas soportados | no declarados; el modelo base está entrenado predominantemente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizador | byte-level BPE de roberta-base (vocabulario de 50.265 tokens) |
| Tarea (pipeline) | text-classification |
| Modelo base | FacebookAI/roberta-base |

## Arquitectura y entrenamiento

La arquitectura corresponde a RoBERTa-base, un transformer encoder-only con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, 125 M de parámetros y embeddings posicionales de hasta 514 tokens. RoBERTa es una versión optimizada del entrenamiento de BERT: elimina el objetivo de predicción de siguiente frase, usa enmascaramiento dinámico y se entrena sobre un corpus en inglés mucho mayor. Sobre esa base se ha añadido una cabecera de clasificación ajustada para la tarea concreta de sawyer-reward; no se especifica el número de etiquetas ni si la salida es una probabilidad binaria o una puntuación de regresión.

El fine-tuning se realizó con los siguientes hiperparámetros declarados por el autor: 3 épocas, learning rate de 1e-5, `train_batch_size` de 4 con 8 pasos de acumulación de gradiente (lote efectivo de 32), `eval_batch_size` de 32, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 5 pasos de calentamiento, precisión mixta nativa (AMP) y semilla 42. El entrenamiento totalizó 564 pasos, lo que con 188 pasos por época y un lote efectivo de 32 implica aproximadamente 6.000 ejemplos por época (unas 18.000 muestras procesadas en total, estimación derivada de los pasos declarados). No se indica el dataset utilizado ("None dataset" en la model card), su composición, ni si hubo etapas de RLHF o DPO. No se declara ninguna innovación técnica adicional (atención lineal, decodificación especulativa u otras).

## Capacidades

- Clasificación de texto y puntuación de secuencias: produce una etiqueta o puntuación por cada entrada mediante una única pasada hacia delante.
- Uso como modelo de recompensa: por nomenclatura y por los notebooks asociados al proyecto SAWYER, está orientado a puntuar respuestas candidatas de un LLM.
- Evaluación comparativa de pares: puede puntuar dos respuestas a un mismo prompt y permitir seleccionar la mejor (best-of-N).
- Inferencia por lotes: admite procesamiento en batch (`eval_batch_size` de 32 en el entrenamiento), adecuado para filtrar grandes volúmenes de datos.
- Integración con `text-embeddings-inference`: el repositorio incluye la etiqueta correspondiente, lo que permite desplegarlo como endpoint HTTP.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no dispone de modo "thinking".
- Capacidades multilingües: no declaradas; hereda el sesgo hacia el inglés del modelo base.
- Capacidades especiales (visión, audio, matemáticas, código): no disponibles ni declaradas.

## Casos de uso

- Modelo de recompensa en pipelines de RLHF: servir como señal escalar de calidad para ajustar por refuerzo (PPO u otros) un LLM de mayor tamaño, puntuando cada respuesta generada durante el bucle de entrenamiento.
- Reranking best-of-N en producción: generar N respuestas con el LLM, puntuarlas con sawyer-reward y devolver al usuario únicamente la mejor; su tamaño reducido (124,6 M) permite hacerlo con latencia y coste bajos.
- Filtrado y curación de datasets de instrucciones: puntuar grandes colecciones de pares prompt-respuesta y descartar los ejemplos de baja calidad antes de usarlos en fine-tuning supervisado.
- Optimización directa de preferencias (DPO) y construcción de pares: usar el modelo como anotador automático para etiquetar cuál de dos respuestas es preferible y generar datasets de preferencias sin anotación humana.
- Evaluación automática de asistentes conversacionales: sustituir o complementar métricas tipo BLEU o ROUGE en tests A/B, asignando una puntuación de calidad comparable entre versiones del sistema.
- Moderación y clasificación de contenido: si el esquema de etiquetas es binario, puede emplearse para clasificar textos según el criterio con el que fue entrenado (calidad, toxicidad, adecuación, etc.), siempre que se valide el etiquetado en el dominio objetivo.
- Destilación y bootstrapping de preferencias: emplear sus puntuaciones para etiquetar datos que alimenten un modelo de recompensa mayor, o para inicializar un reward model de mayor capacidad.
- Despliegue como microservicio de scoring: exponer el modelo con Text Embeddings Inference o un servidor FastAPI propio y consultarlo desde un orquestador de agentes para validar salidas antes de devolverlas.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados (`"results": []`), por lo que no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas declaradas son las de validación durante el entrenamiento, sobre un conjunto de evaluación no identificado:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Precisión |
|:-----:|:----:|:------------------------:|:---------------------:|:---------:|
| 1.0 | 188 | 0.9596 | 0.7769 | 0.945 |
| 2.0 | 376 | 0.7329 | 0.6514 | 0.95 |
| 3.0 | 564 | 0.5247 | 0.4956 | 0.96 |

Estos valores proceden exclusivamente de la model card del autor y no son comparables con benchmarks públicos, ya que no se especifica el dataset de evaluación, su tamaño, su distribución ni el esquema de etiquetas. Tampoco se ofrecen medidas de latencia ni de throughput.

## Requisitos de hardware

- Peso del modelo: unos 498 MB en fp32 y unos 249 MB en fp16/bf16 para los 124,6 M de parámetros. El repositorio ocupa 6,0 GB, lo que sugiere la presencia de checkpoints intermedios o estados del optimizador además de los pesos finales.
- VRAM estimada para inferencia: menos de 2 GB en fp32 con lotes moderados; alrededor de 1 GB o menos en fp16. Con lotes grandes de inferencia, el consumo crece de forma aproximadamente lineal con el tamaño de lote.
- GPU recomendadas: cualquier GPU moderna es suficiente. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100; en estas últimas el modelo queda muy infrautilizado y el cuello de botella será el preprocesado.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM, e incluso en iGPU con suficiente memoria compartida.
- CPU: la inferencia en CPU es viable para cargas moderadas, dado el tamaño del modelo.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (etiqueta presente en el repositorio), servidor propio con FastAPI o TorchServe, y exportación a ONNX Runtime para acelerar en CPU o GPU. vLLM no es la vía habitual para un clasificador de este tipo. llama.cpp y Ollama requerirían una conversión a GGUF que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cijehh/sawyer-reward | 124,6 M | 514 | Clasificación de texto / posible reward model | MIT | HuggingFace (0 descargas, 0 likes) |
| FacebookAI/roberta-base | 124,6 M | 514 | Modelado de lenguaje enmascarado (base) | MIT | HuggingFace, ampliamente usado |
| profoz/sawyer-reward | no disponible | no disponible | Clasificación de texto | no disponible | HuggingFace (copia del mismo artefacto) |
| IvanGab/sawyer-reward | no disponible | no disponible | Clasificación de texto | MIT | HuggingFace (copia del mismo artefacto) |

Las dos entradas con el mismo nombre corresponden a réplicas del mismo artefacto publicadas por otros usuarios, no a modelos independientes. No se dispone de datos verificados de otros modelos de recompensa encoder-only (por ejemplo, los basados en DeBERTa-v3) dentro de la información proporcionada, por lo que no se incluye una comparación numérica con ellos.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "None dataset" y no detalla composición, tamaño ni procedencia, lo que impide evaluar sesgos, cobertura y riesgo de contaminación.
- Esquema de etiquetas no especificado: se desconoce el número de clases, si la salida es binaria o una puntuación continua y cuál es el criterio de anotación.
- Sesgos heredados: al derivar de roberta-base, el modelo arrastra los sesgos de sus corpus en inglés (Wikipedia, BookCorpus, CC-News, OpenWebText, Stories) y no está validado para otros idiomas.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de puntuaciones poco fiables fuera de la distribución de entrenamiento.
- Vulnerabilidad a reward hacking: como cualquier modelo de recompensa, puede ser explotado por el LLM que optimiza contra él, produciendo respuestas que maximizan la puntuación sin mejorar la calidad real.
- Límite de contexto de 514 tokens: las entradas más largas deben truncarse, lo que puede eliminar información relevante en tareas de evaluación de respuestas extensas.
- Métricas no verificables: la precisión de 0,96 procede de un conjunto de evaluación no identificado y no ha sido replicada por terceros.
- Señal de sobreajuste potencial: con solo 3 épocas y ~6.000 ejemplos por época, el modelo puede no generalizar a dominios distintos del corpus de entrenamiento.
- Documentación incompleta: la propia model card incluye secciones marcadas como "More information needed" (descripción, usos previstos, datos de entrenamiento).
- Adopción nula: 0 descargas y 0 likes, sin issues ni validación de la comunidad.
- Licencia: MIT permite uso comercial y modificación sin restricciones significativas, pero se ofrece sin garantía alguna y el autor no asume responsabilidad sobre los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cijehh/sawyer-reward
- Modelo base: https://huggingface.co/roberta-base
- Notebook SAWYER_Reward_Model (SabrinaLameiras): https://github.com/SabrinaLameiras/transformer-architectures-genai/blob/main/notebooks/SAWYER_Reward_Model.ipynb
- Notebook SAWYER_Reward_Model (asabade/optimizing-llms): https://github.com/asabade/optimizing-llms/blob/main/notebooks/SAWYER_Reward_Model.ipynb
- Réplica del modelo (profoz): https://huggingface.co/profoz/sawyer-reward
- Réplica del modelo (IvanGab): https://huggingface.co/IvanGab/sawyer-reward
- Referencia a Sawyer Llama Reward: https://free2aitools.com/model/babaaaajiiii/sawyer-llama-reward
