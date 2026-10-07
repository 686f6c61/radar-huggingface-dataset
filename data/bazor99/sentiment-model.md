# Bazor99/sentiment-model

## Resumen

Bazor99/sentiment-model es un modelo de clasificación de texto para análisis de sentimiento, publicado por el usuario Bazor99 en HuggingFace. Se trata de un fine-tuning de distilbert-base-uncased, la variante destilada del transformer BERT, que conserva aproximadamente el 97 % del rendimiento del BERT base con un 40 % menos de parámetros. El repositorio contiene 66.955.779 parámetros en formato safetensors y ocupa 0,3 GB.

El modelo resuelve la tarea de clasificación de sentimiento (categorización de texto en clases de polaridad), pero la propia model card indica que se entrenó sobre un conjunto de datos desconocido ("an unknown dataset") y no documenta la etiqueta de las clases ni el origen de los datos. Su relevancia práctica es limitada por el momento: acumula 0 descargas y 1 like, y las métricas declaradas (accuracy 0,6598, F1 weighted 0,6493) son moderadas, lo que sugiere un dataset pequeño y posiblemente desequilibrado.

Cabe destacar que el modelo presenta un comportamiento de entrenamiento poco estable: la mejor validación se alcanza en la época 2 (accuracy 0,6975) y empeora ligeramente en la época 3 (0,6821), mientras que la pérdida de validación final declarada en el campo "Loss" de la model card (0,7470) no coincide con la última fila de la tabla (0,7117). No se documenta idioma soportado ni procedimiento de evaluación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased; no documentado en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors publicado) |
| Idiomas soportados | no disponible (el modelo base es uncased en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder de 6 capas, 12 cabezas de atención y dimensión oculta 768, resultado de destilar distilbert-base-uncased a partir de bert-base-uncased mediante knowledge distillation durante la fase de preentrenamiento. Sobre esta base se añade una cabeza de clasificación de secuencia (sequence classification) ajustada para la tarea de sentimiento. El modelo trabaja con tokenización uncased (WordPiece, vocabulario de aproximadamente 30.000 tokens) y una ventana de 512 tokens.

El fine-tuning se realizó con los siguientes hiperparámetros: learning rate 2e-05, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 épocas. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni ninguna innovación técnica adicional. La tabla de entrenamiento declarada es la siguiente:

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

El número total de steps (174) para 3 épocas con batch 32 implica un conjunto de entrenamiento muy reducido (del orden de 1.800 a 1.900 ejemplos). No se documenta el conjunto de evaluación ni el número de clases.

## Capacidades

- Clasificación de texto: predice una etiqueta de sentimiento para una secuencia de entrada mediante la cabecera de sequence classification.
- Compatible con el pipeline text-classification de la librería transformers.
- Inferencia en CPU y GPU dado su reducido tamaño (67 M de parámetros).
- No soporta generación de texto: es un modelo encoder-only sin decodificador.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en inglés (uncased).
- Sin capacidades de visión, audio ni modo de razonamiento (thinking mode).
- La model card no documenta ninguna capacidad adicional ni el esquema de etiquetas de salida.

## Casos de uso

- Clasificación de opiniones en inglés: análisis de polaridad de reseñas o comentarios, asumiendo que el modelo fue entrenado para esa tarea, dado su nombre y su pipeline de clasificación.
- Filtrado previo en pipelines de datos: uso como clasificador rápido y ligero en CPU para etiquetar grandes volúmenes de texto antes de pasarlos a un modelo mayor.
- Punto de partida para fine-tuning propio: al ser un checkpoint ajustado sobre distilbert-base-uncased con licencia Apache 2.0, puede reentrenarse con un dataset etiquetado propio y validado.
- Prototipado y pruebas de concepto: su tamaño (0,3 GB) permite desplegarlo en entornos con recursos limitados para validar una arquitectura antes de escalar.
- Extracción de señal débil en moderación de contenido en inglés: como clasificador auxiliar de polaridad, nunca como sistema único de decisión.
- Docencia y experimentación: ejemplo práctico de pipeline de fine-tuning de DistilBERT con la librería transformers y el Trainer.
- Advertencia: dado que la model card indica "unknown dataset", su uso en producción requiere una auditoría previa de las etiquetas y una evaluación sobre un conjunto propio antes de cualquier despliegue real.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación. No se han publicado resultados en benchmarks estandarizados (MMLU, GLUE, SST-2, etc.) en la información disponible.

| Metrica | Valor declarado |
|---|---|
| Loss (campo de la model card) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

No se han publicado resultados de benchmarks en la información disponible. El model-index del autor no contiene entradas de resultados y no se especifica el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo de pesos (66,96 M de parámetros x 4 bytes), más overhead de activaciones y runtime; cabe holgadamente en cualquier GPU consumer.
- En FP16/BF16 la huella de pesos baja a unos 0,13 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer sin problema; también funciona en CPU con latencias de milisegundos por lote.
- Opciones de despliegue: transformers (pipeline text-classification), PyTorch nativo, TorchScript, ONNX Runtime y endpoints de HuggingFace (el tag endpoints_compatible está presente). No se ha publicado versión GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles (no se documentan mediciones en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Bazor99/sentiment-model | 66,96 M | 512 (heredado) | apache-2.0 | safetensors | no disponible |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | apache-2.0 | safetensors | ingles |
| bert-base-uncased finetunado para sentimiento | ~110 M | 512 | apache-2.0 | safetensors | ingles |
| twitter-roberta-base-sentiment | ~125 M | 512 | disponible (ver repositorio) | safetensors | ingles |

Nota: no se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación de parámetros y contexto se basa en las arquitecturas base conocidas; los datos concretos de licencia, contexto o idiomas de los modelos de la columna de alternativas deben verificarse en sus respectivas fichas. Este modelo declara accuracy 0,6598, inferior a lo habitual en clasificadores de sentimiento en inglés entrenados con datasets como SST-2, aunque no hay datos comparables verificables en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "an unknown dataset", lo que impide conocer la distribución de clases, el dominio de los textos y el esquema de etiquetas de salida.
- Rendimiento moderado: accuracy 0,6598 y F1 macro 0,6493 en el conjunto de evaluación, valores bajos para una tarea de clasificación binaria o ternaria de sentimiento.
- Sobreajuste tras la segunda época: la validación empeora en la época 3, lo que sugiere que el entrenamiento óptimo se alcanzó antes del final.
- Inconsistencia documental: la pérdida de validación declarada en el campo "Loss" de la model card (0,7470) no coincide con la última fila de la tabla de entrenamiento (0,7117).
- Idiomas no documentados: el modelo base es uncased en inglés; el rendimiento en castellano es incierto y no está validado.
- Sesgos: no evaluados ni documentados por el autor.
- Riesgo de alucinación: no aplica a la generación (modelo encoder-only), pero sí existe riesgo de clasificaciones erróneas con falsos positivos y negativos.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el modelo base distilbert-base-uncased tiene su propia licencia (Apache 2.0) que debe respetarse igualmente.
- Cero adopción: 0 descargas y 1 like en el momento de la ficha, sin validación por parte de la comunidad.
- No apto para producción sin auditoría previa: es imprescindible evaluar el modelo sobre un conjunto de validación propio antes de cualquier uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bazor99/sentiment-model
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Repositorio de transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de búsqueda web proporcionados.
