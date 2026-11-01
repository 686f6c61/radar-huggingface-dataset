# PepperMintButler/GyoMail

## Resumen

GyoMail es un modelo de clasificación de texto obtenido mediante fine-tuning de distilroberta-base, publicado por el usuario PepperMintButler en HuggingFace. Con 82.119.938 parámetros, se trata de un encoder transformer de tipo RoBERTa destilado, adaptado a una tarea de clasificación binaria o multiclase (el número exacto de etiquetas no se especifica en la información disponible). El nombre sugiere una aplicación orientada al correo electrónico, aunque la model card no documenta explícitamente el dominio ni las clases.

El modelo es relevante por su reducido coste computacional y su alto rendimiento declarado en el conjunto de evaluación: accuracy de 0,9927, precision de 0,9965, recall de 0,9892 y F1 de 0,9928 sobre un dataset no identificado. Estas métricas indican un ajuste muy preciso, aunque la ausencia de documentación sobre la composición del dataset y la naturaleza de las etiquetas limita seriamente su reproducibilidad y su evaluación independiente.

Se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamaño de repositorio de 0,7 GB y compatibilidad declarada con text-embeddings-inference y endpoints de HuggingFace. Su adopción es todavía muy baja (37 descargas, 0 likes), lo que sugiere un modelo experimental o de uso interno más que un recurso consolidado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, distilroberta-base) |
| Parametros totales | 82.119.938 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (distilroberta-base admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto (text-classification) |
| Modelo base | distilbert/distilroberta-base |
| Framework | Transformers 5.16.1, PyTorch 2.11.0+cu128 |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo parte de distilroberta-base, un encoder transformer derivado de RoBERTa mediante destilación de conocimiento, con 6 capas y 82 millones de parámetros. Sobre esta base se añade una cabeza de clasificación cuyo número de etiquetas no se documenta. El fine-tuning se realizó con el Trainer de HuggingFace usando AdamW con betas (0,9; 0,999) y epsilon 1e-08, learning rate de 2e-05, scheduler lineal, batch de entrenamiento de 64, batch de evaluación de 128, semilla 42, 2 épocas y precisión mixta nativa (AMP).

El dataset de entrenamiento no se identifica ("None dataset" en la model card), por lo que se desconoce su tamaño, composición, dominio y esquema de etiquetas. El entrenamiento constó de 1.948 pasos (974 por época). No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del fine-tuning supervisado estándar. La pérdida de validación aumentó de 0,0508 en la época 1 a 0,0612 en la época 2, mientras que las métricas de clasificación mejoraron ligeramente, lo que sugiere un posible inicio de sobreajuste en la segunda época.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada; el número y la semántica de las etiquetas no están documentados.
- Alta precisión declarada en el conjunto de evaluación (precision 0,9965), lo que indica pocos falsos positivos en la clase mayoritaria evaluada.
- Inferencia rápida y de bajo coste gracias a su tamaño reducido (82 M de parámetros).
- Compatibilidad con text-embeddings-inference y endpoints de HuggingFace para despliegue como servicio.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; distilroberta-base se entrenó principalmente con texto en inglés, pero la model card no confirma el comportamiento de este fine-tuning en otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado de correo no deseado o clasificación de mensajes: el modelo puede etiquetar correos entrantes en categorías predefinidas (por ejemplo, spam/no spam) con baja latencia; el nombre "GyoMail" y el dominio de entrenamiento no confirmado apuntan a este escenario, aunque requeriría validación con datos propios.
- Enrutamiento automático de tickets de soporte: clasificar mensajes de usuarios en colas o departamentos según su contenido, aprovechando la alta precision declarada para reducir asignaciones erróneas.
- Moderación de contenido textual: detección de categorías concretas en comentarios o publicaciones, siempre que las etiquetas del modelo coincidan con las políticas de la plataforma.
- Clasificación de documentos internos: etiquetado de textos cortos en pipelines de gestión documental, con despliegue en CPU o GPU de gama baja por su reducido tamaño.
- Preetiquetado en anotación humana: usar el modelo como primer paso para sugerir etiquetas y acelerar el etiquetado manual, revisando después los casos de baja confianza.
- Señal auxiliar en sistemas de búsqueda o recomendación: generar una etiqueta de categoría para indexar o filtrar contenidos antes de un ranking posterior.
- Despliegue en entornos con recursos limitados: servir el modelo con text-embeddings-inference o como endpoint de HuggingFace en instancias pequeñas, dado su tamaño de 0,7 GB y sus 82 M de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas adicionales; el resto de cifras proviene de la tabla de entrenamiento de la model card):

| Metrica | Epoca 1 (paso 974) | Epoca 2 (paso 1948) |
|---|---|---|
| Training loss | 0,0794 | 0,0336 |
| Validation loss | 0,0508 | 0,0612 |
| Accuracy | 0,9923 | 0,9927 |
| Precision | 0,9960 | 0,9965 |
| Recall | 0,9890 | 0,9892 |
| F1 | 0,9924 | 0,9928 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) ni comparaciones con otros modelos en la información disponible. Las métricas anteriores corresponden a un dataset de evaluación no identificado y no son directamente comparables con resultados públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (82 M de parámetros, aproximadamente 330 MB de pesos); en fp16 alrededor de 165 MB, más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 queda muy sobredimensionada para este modelo. Una GPU consumer básica (GTX 1650, RTX 3050) o incluso CPU es suficiente para inferencia por lotes.
- Cabe en cualquier GPU consumer y en CPU; el cuello de botella será el throughput de peticiones, no la memoria.
- Opciones de despliegue: HuggingFace Transformers, text-embeddings-inference (declarado compatible), endpoints de HuggingFace. No se documenta soporte explícito de vLLM, llama.cpp u Ollama, que no son la vía habitual para un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; en CPU se esperan decenas de milisegundos por secuencia corta, y en GPU lotes de cientos de secuencias por segundo, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GyoMail | 82,1 M | no disponible | Clasificación de texto (fine-tune) | Apache 2.0 | HuggingFace |
| distilroberta-base | 82,1 M | 512 tokens (modelo base) | Masked LM (base para fine-tuning) | Apache 2.0 | HuggingFace |
| roberta-base | 125 M | 512 tokens | Masked LM (base para fine-tuning) | MIT | HuggingFace |
| distilbert-base-uncased | 66 M | 512 tokens | Masked LM (base para fine-tuning) | Apache 2.0 | HuggingFace |

La comparación se limita a los modelos base de la misma familia, ya que no se dispone de resultados de benchmarks públicos de GyoMail que permitan contrastarlo con otros clasificadores fine-tuneados. GyoMail no aporta mejoras arquitectónicas frente a su base; su valor diferencial reside únicamente en el ajuste a una tarea concreta no documentada.

## Limitaciones y advertencias

- Dataset de entrenamiento y evaluación no identificado: la model card indica "None dataset" y "More information needed", por lo que no es posible verificar la validez, el equilibrio de clases ni la representatividad de las métricas declaradas.
- Riesgo de sobreajuste: la pérdida de validación aumentó en la segunda época (de 0,0508 a 0,0612) mientras las métricas de clasificación apenas mejoraron, lo que sugiere que el modelo podría no generalizar bien fuera del conjunto evaluado.
- Sesgos desconocidos: al no documentarse la composición de los datos, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Idiomas no documentados: el comportamiento en castellano u otros idiomas distintos del inglés no está verificado.
- Longitud de contexto no confirmada: aunque el modelo base admite 512 tokens, la model card no especifica la longitud máxima configurada en el fine-tuning.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento traslada al usuario la responsabilidad de verificar el cumplimiento legal y ético en su dominio de aplicación.
- Adopción muy baja (37 descargas, 0 likes) y ausencia de benchmarks públicos: no se recomienda su uso en producción sin una evaluación previa con datos propios.
- Modelo de clasificación, no generativo: no puede emplearse para generación de texto, código, razonamiento ni tareas conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PepperMintButler/GyoMail
- Modelo base distilroberta-base: https://huggingface.co/distilroberta-base
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Paper de DistilBERT (base de la destilación de distilroberta): https://arxiv.org/abs/1910.01108
