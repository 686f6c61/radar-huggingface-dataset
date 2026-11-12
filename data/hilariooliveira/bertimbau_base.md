# hilariooliveira/bertimbau_base

## Resumen

bertimbau_base es un modelo de clasificación de texto en portugués obtenido mediante fine-tuning de neuralmind/bert-base-portuguese-cased, el checkpoint BERT base entrenado específicamente para portugués por el grupo NeuralMind (conocido como BERTimbau). Lo publica el usuario hilariooliveira en Hugging Face bajo licencia MIT y está pensado para tareas de clasificación supervisada, no como modelo generativo.

El modelo conserva la arquitectura BERT encoder-only con 108.926.981 parámetros totales y vocabulario en portugués con distinción de mayúsculas y minúsculas (cased). El fine-tuning se realizó durante 2 épocas con un learning rate de 5e-05, batch size de 16 y optimizador AdamW, alcanzando en el conjunto de evaluación una accuracy de 0,948 y un F1 de 0,9479, con una pérdida de validación de 0,0718.

Su relevancia es acotada: se trata de un artefacto derivado de un entrenamiento concreto (generated_from_trainer) sobre un dataset no especificado en la model card. Resulta útil como punto de partida para clasificación de texto en portugués, pero carece de documentación sobre la tarea, las etiquetas y los datos empleados, lo que limita su reutilización directa en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only), variante base cased para portugués |
| Parametros totales | 108.926.981 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base BERTimbau emplea 512 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | portugués (implícito por el modelo base; no declarado explícitamente en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT base, un transformer encoder-only bidireccional con atención completa y entrenamiento por enmascaramiento de tokens (MLM) más predicción de siguiente frase (NSP) en el checkpoint original de NeuralMind. Sobre esa base, este modelo añade una cabeza de clasificación de secuencias (BertForSequenceClassification) ajustada de forma supervisada.

El entrenamiento consistió en 2 épocas con 626 pasos totales, learning rate 5e-05, batch size 16 en entrenamiento y evaluación, semilla 42, scheduler lineal y AdamW con betas (0,9; 0,999) y epsilon 1e-08. La pérdida de entrenamiento bajó de 0,0772 en la época 1 a 0,0250 en la época 2, mientras que la pérdida de validación pasó de 0,1102 a 0,0718. No se documenta el dataset utilizado (la model card indica «None dataset»), ni el número de tokens de entrenamiento, ni si hubo aumento de datos. Las versiones de framework declaradas son Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto supervisada en portugués: asigna una etiqueta a una secuencia de entrada, con una cabeza de clasificación ajustada.
- Extracción de representaciones contextuales: al derivar de BERTimbau, puede usarse como encoder para embeddings de frases o características para otros clasificadores.
- Procesamiento de texto con distinción de mayúsculas y minúsculas, gracias al tokenizador cased del modelo base.
- No soporta generación de texto libre: es un modelo encoder-only sin decodificador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se declaran otros idiomas.

## Casos de uso

- Clasificación de reseñas o comentarios en portugués: el modelo puede etiquetar polaridad o categoría temática en textos cortos y medianos, aprovechando el ajuste supervisado ya realizado; requiere verificar que las etiquetas del dataset original coincidan con las del caso de uso.
- Moderación de contenido en foros y comunidades lusófonas: como clasificador binario o multiclase de toxicidad o spam, con la ventaja de un modelo pequeño (108,9 M de parámetros) que cabe en CPU para inferencia por lotes.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes por departamento o urgencia en portugués, usando el encoder como base y reentrenando la cabeza con datos propios.
- Análisis de sentimiento en redes sociales: procesar publicaciones en portugués de Brasil o Portugal con un throughput alto en GPU de gama media, dado el reducido tamaño del modelo.
- Etiquetado de documentos legales o administrativos: categorizar contratos, correos o expedientes en portugués; la ventana de contexto de BERT (habitualmente 512 tokens) obliga a truncar o segmentar documentos largos.
- Generación de embeddings para búsqueda semántica: usar las representaciones del encoder (sin la cabeza de clasificación) como vector de frase para índices de recuperación en portugués, aunque para esta tarea conviene evaluar modelos específicos de embeddings.
- Filtrado previo en pipelines de datos: descartar o marcar registros en portugués antes de pasarlos a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card, sobre un conjunto de evaluación no identificado. El model-index oficial no contiene entradas (results vacío).

| Metrica | Epoca 1 (paso 313) | Epoca 2 (paso 626) |
|---|---|---|
| Perdida de entrenamiento | 0,0772 | 0,0250 |
| Perdida de validacion | 0,1102 | 0,0718 |
| Accuracy | 0,92 | 0,948 |
| F1 | 0,9211 | 0,9479 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (108,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB para batch sizes moderados.
- En fp16/bf16: alrededor de 0,22 GB para pesos, con margen para lotes mayores.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes con latencias aceptables.
- GPU profesionales (A100, H100) innecesarias para este tamaño; solo se justifican para procesar volúmenes muy grandes en paralelo.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el repo incluye el tag text-embeddings-inference), ONNX Runtime, y exportación a otros runtimes. vLLM y llama.cpp no son adecuados para un encoder-only de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; en una GPU consumer se espera un throughput alto por el reducido tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hilariooliveira/bertimbau_base | 108,9 M | no disponible (BERT base, habitualmente 512) | Clasificacion de texto (fine-tune) | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | 108,9 M | 512 tokens | Encoder base para portugués (MLM) | MIT | Hugging Face |
| neuralmind/bert-large-portuguese-cased | 334,5 M (dato no confirmado en esta ficha) | 512 tokens | Encoder base para portugués (MLM) | MIT | Hugging Face |
| bert-base-multilingual-cased | 177,9 M (dato no confirmado en esta ficha) | 512 tokens | Encoder multilingüe (MLM) | Apache 2.0 | Hugging Face |

La comparación relevante es con el checkpoint base del que deriva: bertimbau_base añade una cabeza de clasificación ajustada con métricas concretas (F1 0,9479) pero sin documentar la tarea, mientras que el modelo original de NeuralMind es un encoder genérico sin fine-tuning. Frente a bert-base-multilingual-cased, la variante portuguesa suele rendir mejor en portugués por vocabulario y entrenamiento específicos, aunque no hay datos comparativos publicados en esta ficha.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni las etiquetas, por lo que se desconoce qué tarea resuelve exactamente el modelo; las métricas de evaluación no son interpretables sin ese contexto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos: al derivar de BERTimbau, hereda los sesgos presentes en el corpus portugués utilizado por NeuralMind, no cuantificados en esta ficha.
- Limitación de contexto: BERT base está diseñado para secuencias de hasta 512 tokens; textos más largos requieren truncado o segmentación.
- Cobertura lingüística restringida al portugués; no se declaran otros idiomas y el rendimiento en ellos sería previsiblemente bajo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El modelo se generó automáticamente con el Trainer de Hugging Face y la propia model card indica que debe revisarse; la documentación es incompleta.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Para producción, es imprescindible reevaluar con datos propios y verificar que la cabeza de clasificación se corresponde con las clases deseadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hilariooliveira/bertimbau_base
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
