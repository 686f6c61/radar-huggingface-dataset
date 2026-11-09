# dreamonasdasd/distilbert-imdb-sentimiento

## Resumen

distilbert-imdb-sentimiento es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario dreamonasdasd en Hugging Face. El nombre sugiere un ajuste orientado al análisis de sentimiento sobre el corpus IMDB, aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento. Se trata de un modelo encoder-only de la familia BERT destilada, con 66.955.010 parámetros totales y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la gama ligera de modelos de clasificación.

El modelo resuelve la tarea de clasificación de secuencias (text-classification) y está pensado para inferencia rápida en entornos con recursos limitados. Su relevancia es limitada en el momento actual: cuenta con cero descargas y cero likes, la model card es autogenerada por el Trainer de Hugging Face y contiene secciones vacías ("More information needed"), y no se han publicado resultados de benchmarks en el model-index. Es, por tanto, un artefacto de fine-tuning personal más que un modelo con validación comunitaria.

Arquitectónicamente hereda todas las características de DistilBERT: 6 capas transformer, 66 millones de parámetros, vocabulario uncased en inglés y una longitud de contexto máxima de 512 tokens. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento y evaluación limita seriamente su adopción en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es uncased en ingles; el autor no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder-only de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. DistilBERT reduce el tamaño de BERT-base en un 40 % y conserva aproximadamente el 97 % de su rendimiento en tareas de comprensión del lenguaje, según la literatura original de Sanh et al. (2019). La cabeza de clasificación se ha reentrenado para la tarea de text-classification.

Los hiperparámetros de entrenamiento documentados en la model card son: learning rate de 2e-05, batch size de entrenamiento de 16, batch size de evaluación de 32, semilla 42, optimizador AdamW (variante fused de PyTorch), scheduler lineal, 2 épocas y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación). El conjunto de datos de entrenamiento figura como "unknown dataset" en la model card, lo que impide reproducir el ajuste.

## Capacidades

- Clasificación de texto binaria o multiclase (la model card no especifica el número exacto de etiquetas).
- Análisis de sentimiento sobre textos en inglés, presumiblemente orientado al corpus IMDB según el nombre del modelo.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 66 millones de parámetros.
- Compatible con la librería transformers y con text-embeddings-inference según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no documentadas; el modelo base es exclusivamente en inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de productos: el modelo puede clasificar reseñas cortas en inglés en positivas o negativas, aprovechando su entrenamiento presumiblemente sobre IMDB y su ventana de 512 tokens para reseñas de extensión media.
- Moderación de comentarios en foros: clasificación rápida de tono (positivo/negativo) en grandes volúmenes de texto, con un coste computacional muy bajo al ser un encoder de 66 millones de parámetros.
- Enriquecimiento de pipelines de datos: etiquetado automático de sentimiento en datasets de opiniones para análisis posteriores, ejecutable en CPU sin GPU dedicada.
- Filtrado previo en sistemas de recomendación: descarte o priorización de reseñas según polaridad antes de pasarlas a un modelo generativo más costoso.
- Prototipado rápido de clasificadores: punto de partida para experimentos de fine-tuning adicional sobre dominios específicos, dado su reducido tamaño y licencia permisiva.
- Inferencia en el borde (edge): despliegue en dispositivos con recursos limitados mediante cuantización dinámica de PyTorch, al no requerir más de unos pocos cientos de MB de memoria.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación, sin especificar qué dataset se utilizó:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.2962 |
| Accuracy | 0.878 |
| Model Preparation Time | 0.002 |

Evolución durante el entrenamiento:

| Epoca | Step | Training Loss | Validation Loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 125 | 0.3122 | 0.3018 | 0.86 |
| 2.0 | 250 | 0.2576 | 0.2962 | 0.878 |

El model-index del repositorio no contiene resultados adicionales. No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parámetros × 4 bytes ≈ 268 MB de pesos, más activaciones), lo que permite ejecución holgada en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencias de milisegundos por muestra. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobrada.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde (Raspberry Pi, móviles con runtime adecuado).
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (según tags), ONNX Runtime y cuantización dinámica de PyTorch. No se documenta soporte GGUF ni Ollama, aunque es convertible.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera un throughput de miles de muestras por segundo en GPU y cientos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-imdb-sentimiento | 66,9 M | 512 | 0,878 (dataset no especificado) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, referencia de la familia |
| roberta-base | 125 M | 512 | no disponible en esta ficha | MIT | Hugging Face, referencia de la familia |

La comparación directa de rendimiento no es posible porque el autor no especifica el dataset de evaluación ni publica resultados en benchmarks estándar. Frente a distilbert-base-uncased-finetuned-sst-2-english, el modelo de esta ficha carece de validación comunitaria y de documentación del corpus de entrenamiento.

## Limitaciones y advertencias

- La model card es autogenerada y contiene secciones sin completar ("More information needed"); no se documenta el dataset de entrenamiento ni las etiquetas exactas.
- El accuracy de 0,878 corresponde a un conjunto de evaluación no identificado, por lo que no es comparable con resultados publicados en benchmarks estándar.
- Riesgo de sesgos heredados de distilbert-base-uncased, entrenado con datos web en inglés sin filtrado documentado por el autor.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas fuera de dominio.
- Limitación de contexto a 512 tokens; textos más largos requieren truncamiento.
- Idiomas no declarados; el modelo base es exclusivamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre procedencia de datos dificulta evaluar riesgos legales o de sesgo en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación futura (2026-11-09) en los metadatos del repositorio, lo que sugiere posible manipulación de metadatos o un error de la plataforma; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamonasdasd/distilbert-imdb-sentimiento
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
