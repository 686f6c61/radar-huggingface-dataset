# AlirezaAkbariBayat/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo publica el usuario de Hugging Face AlirezaAkbariBayat, presumiblemente como parte de un ejercicio de aprendizaje ("learn_hf") orientado a construir un clasificador que distinga entre textos relacionados con comida y textos que no lo están. El modelo tiene 66.955.010 parámetros y un repositorio de 0,8 GB en formato safetensors.

Se trata de un modelo pequeño, derivado de la arquitectura DistilBERT (una versión destilada de BERT-base con 6 capas y 66 millones de parámetros), entrenado para una tarea de clasificación con dos etiquetas. Su relevancia es limitada fuera del ámbito educativo o de prototipado: la model card está generada automáticamente y no documenta el conjunto de datos, los idiomas ni los usos previstos, por lo que debe tratarse como un artefacto de demostración más que como un modelo listo para producción.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero la ausencia de información sobre los datos de entrenamiento y la accuracy reportada del 1,0 (sobre un conjunto de evaluación no descrito, con solo 7 pasos por época) sugieren un sobreajuste severo o un conjunto de validación trivial. Cualquier evaluación real debe hacerse con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes u ONNX) |
| Idiomas soportados | no disponible (el modelo base es inglés; la model card no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base. La cabeza de clasificación es la estándar de `DistilBertForSequenceClassification`, con dos etiquetas de salida (presumiblemente "food" y "not food", aunque la model card no lo confirma). No se emplean mecanismos de atención lineal, decodificación especulativa ni arquitecturas híbridas.

El entrenamiento se realizó con el `Trainer` de Transformers (versión 5.20.2) sobre un dataset no especificado. Los hiperparámetros declarados son: learning rate 1e-4, batch size de 32 en entrenamiento y evaluación, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 10 épocas y semilla 42. El número de pasos por época es de solo 7, lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos (7 × 32). No se documenta el uso de RLHF, DPO ni técnicas de alineación; tampoco se describe la composición del dataset ni el proceso de anotación.

## Capacidades

- Clasificación de texto binaria: asigna una de dos etiquetas a una secuencia de entrada, presumiblemente relacionada con la temática "comida / no comida".
- Procesamiento de texto en inglés a nivel de token (tokenizador WordPiece de `distilbert-base-uncased`), con entradas de hasta 512 tokens según el modelo base.
- Inferencia rápida y de bajo coste computacional gracias a su tamaño reducido (66 M de parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Capacidades multilingües: no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Filtrado de contenidos en un foro o red social: clasificar publicaciones como relacionadas con comida o no, para enrutarlas a la sección temática adecuada, aprovechando la baja latencia del modelo (66 M de parámetros).
- Etiquetado previo en pipelines de anotación: usar el clasificador como primer paso para preetiquetar grandes volúmenes de textos y reducir el trabajo manual de revisión, siempre con verificación humana posterior.
- Prototipado educativo: servir como ejemplo didáctico de fine-tuning de DistilBERT con el `Trainer` de Transformers, dado que la model card documenta todos los hiperparámetros.
- Clasificación de reseñas o comentarios en una aplicación de recetas: separar comentarios que hablan de platos o ingredientes de los que tratan otros temas, como paso previo a un análisis de sentimiento específico.
- Moderación de contenido en un marketplace gastronómico: detectar anuncios o mensajes que no corresponden a la categoría de alimentación.
- Prueba de concepto de despliegue con Text Embeddings Inference o endpoints compatibles: el tag `endpoints_compatible` permite integrarlo rápidamente en un servicio HTTP para validar una arquitectura de serving antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

El model-index del autor no declara resultados de benchmarks estándar (MMLU, GLUE, etc.). La model card sí reporta métricas del conjunto de evaluación interno, que se reproducen a continuación tal cual:

| Metrica | Valor (epoca 10) |
|---|---|
| Validation loss | 0,0004 |
| Accuracy | 1,0 |

Evolución durante el entrenamiento (extracto):

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 0,3825 | 0,0569 | 1,0 |
| 5 | 0,0010 | 0,0007 | 1,0 |
| 10 | 0,0005 | 0,0004 | 1,0 |

Estos valores deben interpretarse con cautela: la accuracy perfecta desde la primera época y un conjunto de evaluación de tamaño muy reducido (coherente con 7 pasos por época) indican que la métrica no es representativa del rendimiento en datos reales. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB solo para pesos (66,9 M × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU con 1 GB o más.
- En fp16: alrededor de 135 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPUs de gama baja, en iGPU y en CPU. El repositorio completo ocupa 0,8 GB, pero los pesos útiles son mucho menores.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference`), servidores compatibles con endpoints de Hugging Face, exportación a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | hasta 512 tokens (modelo base) | Clasificación binaria "food / not food" | apache-2.0 | Hugging Face, 34 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM), sin cabeza de clasificación | apache-2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face, ampliamente usado |
| Modelos de clasificación zero-shot (p. ej. basados en NLI) | variable (cientos de M) | variable | Clasificación sin entrenamiento específico | variable | Hugging Face |

La comparación directa con clasificadores zero-shot no está respaldada por datos de rendimiento de este modelo, por lo que no puede establecerse una superioridad o inferioridad objetiva. Frente a `distilbert-base-uncased`, la diferencia es la cabeza de clasificación entrenada, pero sin dataset documentado ni métricas fiables.

## Limitaciones y advertencias

- La accuracy de 1,0 se obtuvo sobre un conjunto de evaluación no descrito y de tamaño aparentemente muy pequeño; es probable que refleje sobreajuste y no rendimiento real.
- El dataset de entrenamiento es desconocido ("unknown dataset" en la model card); no puede evaluarse la representatividad, los sesgos ni la cobertura lingüística.
- No se documentan sesgos conocidos, pero al derivar de `distilbert-base-uncased` hereda los sesgos presentes en los corpus web en inglés usados para entrenar el modelo base.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- El modelo base está orientado al inglés; el comportamiento en castellano u otros idiomas no está validado.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento traslada al usuario la responsabilidad de verificar el cumplimiento normativo (por ejemplo, RGPD si se procesan datos personales).
- No debe usarse en producción sin una evaluación previa con un conjunto de validación propio y representativo del dominio objetivo.
- La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlirezaAkbariBayat/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
