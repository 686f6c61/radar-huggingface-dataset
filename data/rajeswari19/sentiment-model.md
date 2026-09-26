# rajeswari19/sentiment-model

## Resumen

`rajeswari19/sentiment-model` es un modelo de clasificación de texto orientado al análisis de sentimiento, publicado en HuggingFace por el usuario rajeswari19. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased`, la variante destilada de BERT mantenida por Hugging Face, sobre un conjunto de datos que el autor no identifica en ningún momento. El repositorio pesa 0,3 GB y contiene 66.955.779 parámetros en formato safetensors, distribuidos bajo licencia Apache 2.0.

Técnicamente es un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, con tokenizador WordPiece *uncased* de 30.522 entradas y un límite posicional de 512 tokens. Al ser un modelo encoder-only con cabeza de clasificación, no genera texto: asigna una etiqueta a una secuencia de entrada. La model card está generada automáticamente por `Trainer` y no ha sido completada, por lo que no se documentan ni el dataset, ni las clases de salida, ni los usos previstos.

Su relevancia práctica hoy es limitada: registra 0 descargas y 0 likes, y sus métricas declaradas (accuracy 0,6598, F1 macro 0,6493) quedan lejos de lo que se considera utilizable en producción. Resulta interesante sobre todo como ejemplo reproducible de pipeline de fine-tuning con hiperparámetros documentados (learning rate 2e-5, batch 32, 3 epochs, semilla 42) y como baseline de laboratorio, no como componente listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, hidden size 768, 12 cabezas de atención |
| Parametros totales | 66.955.779 (66,96 millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional de `distilbert-base-uncased`; no se declara explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; con 67 M de parámetros la cuantización aporta poco) |
| Idiomas soportados | no declarados. El modelo base es monolingüe en inglés (*uncased*) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repo); cargable con `transformers` en PyTorch |
| Tarea | text-classification (clasificación de sentimiento) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tokenizador | WordPiece, vocabulario de 30.522 tokens, *uncased* |
| Clases de salida | no disponible (el autor no documenta el número ni las etiquetas) |
| Tamaño del repositorio | 0,3 GB |
| Libreria | transformers (entrenado con Transformers 5.16.1, PyTorch 2.11.0+cu128) |
| Autor y fecha | rajeswari19, creado el 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, propuesta por Sanh et al. (2019) y obtenida mediante destilación por conocimiento a partir de `bert-base-uncased` sobre el mismo corpus que el original (Wikipedia inglesa y BookCorpus). Conserva la mitad de las capas (6 frente a 12) con el mismo ancho de 768, lo que reduce el cómputo aproximadamente a la mitad manteniendo la estructura de atención multi-cabeza estándar. Sobre este backbone, el autor ha añadido una cabeza de clasificación de secuencias y ha realizado un fine-tuning supervisado completo con el `Trainer` de Hugging Face.

No hay ninguna innovación técnica en el modelo: es un fine-tuning convencional. Los hiperparámetros registrados son learning rate 2e-5, batch de entrenamiento y evaluación de 32, optimizador AdamW con `betas=(0.9, 0.999)` y `epsilon=1e-08`, scheduler lineal, 3 epochs y semilla 42. No se menciona uso de RLHF, DPO, decodificación especulativa ni técnicas de atención lineal. Durante el entrenamiento no se aplicaron argumentos adicionales al optimizador y tampoco se documenta ninguna estrategia de regularización (dropout específico, early stopping o weight decay) más allá de la que trae por defecto el modelo base.

El detalle de la curva de entrenamiento sí está disponible y es relevante porque muestra una convergencia problemática: la pérdida de entrenamiento baja de 1,0498 a 0,6785, pero la pérdida de validación se estanca y la accuracy de validación alcanza su máximo en la epoch 2 (0,6975) para caer en la epoch 3 (0,6821). Con 58 pasos por epoch y batch de 32, se puede estimar que el conjunto de entrenamiento tenía del orden de 1.856 ejemplos (unas 5.568 muestras vistas en total en las 3 epochs), es decir, un dataset muy pequeño y de procedencia desconocida.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento a una secuencia corta en inglés. El número de clases y sus nombres no están documentados; hay que inspeccionar el campo `id2label` del `config.json` para conocerlos.
- Inferencia por lotes: al ser un modelo de 67 M de parámetros, permite procesar grandes volúmenes de textos con coste muy bajo, tanto en GPU como en CPU.
- Extracción de representaciones contextuales: las salidas del encoder pueden reutilizarse como features, aunque no ha sido entrenado como modelo de embeddings y no se ha validado en tareas de similitud.
- No soporta *tool calling* ni *function calling*.
- No soporta uso como agente ni razonamiento multi-paso: no genera texto ni cadenas de pensamiento.
- No es multilingüe: el vocabulario *uncased* y el corpus de entrenamiento de DistilBERT son monolingües en inglés.
- No tiene modo *thinking*, ni visión, ni audio, ni capacidades multimodales de ningún tipo.
- Manejo de textos largos limitado: cualquier entrada superior a 512 tokens se trunca (o se segmenta manualmente) y se pierde información.

## Casos de uso

- Prototipado rápido de análisis de sentimiento: gracias a sus 67 M de parámetros, el modelo se carga y ejecuta en CPU en segundos, lo que permite validar un pipeline completo de clasificación de reseñas antes de invertir en un modelo mayor.
- Etiquetado por lotes de feedback de clientes: se puede procesar un volcado de encuestas, tickets o reseñas en inglés durante la noche en una única GPU o incluso en CPU, usando `pipeline` de transformers con `batch_size` alto.
- Prefiltrado de bajo coste antes de un LLM: dado su coste despreciable, puede usarse como primera etapa que descarte los casos claramente negativos o positivos y derive a un modelo mayor únicamente los casos ambiguos (por ejemplo, con confianza del softmax inferior a 0,8).
- Clasificación de comentarios en un foro o sección de noticias: con un umbral de confianza y revisión humana de los casos dudosos, sirve para priorizar la moderación. Con una accuracy de 0,66, no es adecuado para moderación automática sin supervisión.
- Docencia e investigación en ajuste fino: es un ejemplo pequeño y reproducible (semilla fija, hiperparámetros y versiones de librería documentados) para prácticas de fine-tuning de transformers, análisis de curvas de aprendizaje y estudio de sobreajuste en datasets reducidos.
- Baseline en experimentos de clasificación: sirve como punto de comparación de bajo coste frente a alternativas como RoBERTa o DeBERTa, para medir la ganancia real que aporta un modelo mayor sobre un dataset propio.
- Análisis de respuestas abiertas tipo NPS: agregación de la proporción de sentimiento positivo por cohorte o periodo temporal, siempre que el texto esté en inglés y se asuma el margen de error del 34 % que implican sus métricas actuales.
- Despliegue en dispositivos con recursos muy limitados: al ocupar menos de 300 MB en fp32, cabe en una Raspberry Pi o en un contenedor pequeño con CPU, con latencias del orden de decenas a cientos de milisegundos por secuencia corta.

## Benchmarks y rendimiento

El `model-index` del modelo está vacío: no se han publicado resultados comparativos (MMLU, GLUE, SuperGLUE, HumanEval ni similares). Las únicas cifras disponibles son las del conjunto de evaluación propio, cuyo dataset y tamaño no se documentan, por lo que no son comparables con benchmarks públicos.

Resultados declarados en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Progresión durante el entrenamiento:

| Training loss | Epoch | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Observaciones sobre estas cifras: la mejor validación se obtiene en la epoch 2, y la epoch 3 empeora la accuracy pese a seguir reduciendo la pérdida de entrenamiento, lo que apunta a sobreajuste sobre un dataset muy pequeño. Existe además una inconsistencia entre las métricas finales declaradas en la cabecera de la model card (loss 0,7470, accuracy 0,6598) y las de la última epoch de la tabla (loss 0,7117, accuracy 0,6821). El hecho de que F1 weighted y F1 macro coincidan hasta el cuarto decimal sugiere clases con soporte idéntico en el conjunto de evaluación.

## Requisitos de hardware

- Peso en disco: aproximadamente 268 MB en fp32, 134 MB en fp16 y 67 MB en int8 (estimación derivada de los 66,96 M de parámetros).
- VRAM estimada: menos de 1 GB para inferencia con lotes pequeños (1 a 8 secuencias de 128 tokens); en torno a 1-2 GB con lotes de 32 secuencias de 512 tokens. Son estimaciones, no mediciones publicadas.
- GPU recomendadas: funciona holgadamente en cualquier GPU con 2 GB o más, incluidas GTX 1050 Ti, T4, RTX 3060, RTX 4090, A100 y H100. No necesita aceleradores de gama alta; el uso de una A100 solo se justifica por volumen de peticiones, no por tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos ocho años, y también en CPU sin penalización severa por secuencia.
- Opciones de despliegue: pipeline de `transformers`, exportación a ONNX Runtime u OpenVINO mediante Optimum, TorchScript, servidor propio con FastAPI o Flask, y NVIDIA Triton para inferencia por lotes a gran escala. `vLLM` permite servir modelos BERT de clasificación con la tarea `classify`, aunque el modelo no está optimizado ni validado para ese backend. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas sin conversión previa.
- Latencia y throughput: no disponibles (no hay mediciones publicadas). Como referencia orientativa, un modelo de 67 M de parámetros procesa por lotes del orden de miles de secuencias cortas por segundo en una GPU moderna y decenas por segundo en una CPU de un solo núcleo, pero el modelo pequeño descrito no ha sido medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| rajeswari19/sentiment-model | 66,96 M | 512 tokens | Clasificación de sentimiento (clases no documentadas) | Apache 2.0 | Accuracy 0,6598 y F1 macro 0,6493 en un conjunto de evaluación no documentado | Repositorio público con 0 descargas y 0 likes |
| distilbert-base-uncased-finetuned-sst-2-english (Hugging Face) | 66,96 M | 512 tokens | Clasificación binaria de sentimiento (SST-2) | Apache 2.0 | No disponible en la información proporcionada; su model card reporta métricas sobre SST-2 muy superiores a las de este modelo | Muy extendido y ampliamente descargado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 514 tokens | Clasificación de sentimiento en 3 clases, dominio Twitter | No disponible en la información proporcionada | No disponible en la información proporcionada | Muy utilizado en análisis de redes sociales |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M | 512 tokens | Clasificación de 1 a 5 estrellas, multilingüe | No disponible en la información proporcionada | No disponible en la información proporcionada | Muy utilizado en reseñas multilingües |

No se dispone de cifras verificadas de benchmarks para los modelos comparados dentro de la información proporcionada, por lo que la comparación cuantitativa de rendimiento no puede establecerse. La diferencia principal es de documentación y validación: las alternativas citadas tienen datasets conocidos, clases definidas y comunidad de usuarios, mientras que `rajeswari19/sentiment-model` no documenta ni el dataset ni las etiquetas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se puede verificar la procedencia, la licencia ni la composición de los datos, lo que impide evaluar riesgos legales o de sesgo derivados del corpus.
- Métricas modestas: una accuracy de 0,6598 y un F1 macro de 0,6493 implican que aproximadamente un tercio de las predicciones son incorrectas. No es apto para producción sin un reentrenamiento o una validación propia sobre datos del dominio objetivo.
- Sin calibración conocida: no hay información sobre la fiabilidad de las probabilidades del softmax, por lo que usar umbrales de confianza para enrutar casos es arriesgado sin calibrar previamente.
- Inconsistencia interna de las métricas: la accuracy final declarada (0,6598) no coincide con la de la última epoch de la tabla de entrenamiento (0,6821), lo que sugiere que la model card no se revisó al publicarse.
- Indicios de sobreajuste: la validación empeora en la epoch 3 pese a que la pérdida de entrenamiento sigue bajando; el dataset de entrenamiento parece tener alrededor de 1.856 ejemplos.
- Clases no documentadas: se desconoce cuántas etiquetas tiene la cabeza de clasificación y qué significan; es obligatorio inspeccionar `id2label` antes de cualquier uso.
- Limitación idiomática: el modelo base es monolingüe en inglés y *uncased*, por lo que el rendimiento en castellano o en textos con jerga, emojis o abreviaturas de redes sociales no está garantizado y probablemente sea muy bajo.
- Truncado a 512 tokens: los documentos largos se cortan y pierden la parte final del texto, lo que puede invertir el sentido de la clasificación.
- Sesgos heredados: DistilBERT se entrenó sobre Wikipedia en inglés y BookCorpus, corpora con sesgos de representación conocidos que el fine-tuning sobre un dataset no documentado no corrige y puede incluso amplificar.
- Riesgo de falsos positivos y falsos negativos sin aviso: al no generar texto no alucina en sentido literal, pero sí puede emitir una etiqueta errónea con alta confianza, lo que en un sistema automático produce decisiones silenciosamente incorrectas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye "tal cual", sin garantías ni soporte del autor.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta implican que no existe validación por parte de la comunidad ni informes de fallos en producción.
- Model card autogenerada y sin completar: las secciones de descripción, usos previstos y datos de entrenamiento contienen literalmente "More information needed".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rajeswari19/sentiment-model
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de la tarea de clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado repositorios de código, demos, blogs ni papers asociados específicamente a este modelo en la información proporcionada.
