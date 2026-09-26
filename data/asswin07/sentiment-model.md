# Asswin07/sentiment-model

## Resumen

`sentiment-model` es un checkpoint de clasificación de texto publicado por el usuario Asswin07 en Hugging Face. Se trata de un ajuste fino (*fine-tuning*) completo de `distilbert-base-uncased`, el modelo destilado de BERT desarrollado por Hugging Face, orientado a la clasificación de sentimiento. El repositorio ocupa 0,3 GB y contiene pesos en formato `safetensors` para la librería `transformers`, con licencia Apache 2.0.

El modelo resuelve una tarea clásica de análisis de opiniones: asignar una etiqueta de sentimiento a un texto corto. Su relevancia práctica es limitada tal y como está publicado, ya que la propia model card indica explícitamente que el conjunto de datos de entrenamiento es desconocido, no se documentan los idiomas soportados ni el mapeo de etiquetas, y no se ha publicado ningún resultado en el campo `model-index`. Las métricas declaradas en el README (accuracy 0,6598 y F1 macro 0,6493 sobre un conjunto de evaluación no descrito) sitúan el rendimiento muy por debajo de lo habitual en ajustes finos de DistilBERT para análisis de sentimiento.

A nivel técnico es un transformer encoder denso de 66.955.779 parámetros (aproximadamente 66,96 M), entrenado durante 3 épocas con tasa de aprendizaje 2e-5, batch de 32 y optimizador AdamW fused. No incorpora innovaciones de arquitectura: es la receta estándar de `Trainer` de Hugging Face aplicada a un dataset no identificado, por lo que debe considerarse un artefacto de experimentación más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (DistilBERT, destilación de BERT-base); 6 capas, 768 dimensiones ocultas, 12 cabezas de atención, tokenizador WordPiece |
| Parametros totales | 66.955.779 (≈66,96 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional heredado de `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible (la model card no declara ninguna); el tamaño del checkpoint permite cuantización dinámica INT8 en PyTorch y exportación a ONNX Runtime con herramientas estándar |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base está preentrenado principalmente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`); repositorio de 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un encoder transformer de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención, obtenido mediante destilación del conocimiento de BERT-base durante la fase de preentrenamiento. No hay mecanismos de atención lineal, decodificación especulativa, capas MoE ni componentes híbridos; la innovación del modelo base es exclusivamente la reducción de tamaño (66 M frente a 110 M de BERT-base) manteniendo un rendimiento cercano en tareas de comprensión. El modelo recibe como entrada texto tokenizado con WordPiece y devuelve logits de clasificación sobre la cabeza `DistilBertForSequenceClassification`.

Los detalles de entrenamiento publicados son mínimos. La model card indica que se trata de un ajuste fino sobre "an unknown dataset" (conjunto de datos desconocido). Los hiperparámetros fueron: 3 épocas, `learning_rate` 2e-5, `train_batch_size` 32, `eval_batch_size` 32, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-8, y planificador lineal (`lr_scheduler_type: linear`). No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo validación cruzada, ni fases de RLHF/DPO (que no aplican a un clasificador de este tipo). El campo `model-index` está vacío (`results: []`), por lo que las únicas métricas disponibles son las del README.

La evolución del entrenamiento declarada es la siguiente:

| Training loss | Época | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

El mejor punto se alcanza en la época 2 (accuracy 0,6975) y el rendimiento empeora ligeramente en la época 3, lo que sugiere sobreajuste con un conjunto de evaluación muy pequeño (solo 58 pasos de entrenamiento por época implican un dataset de entrenamiento de aproximadamente 1.856 ejemplos con batch 32).

## Capacidades

- Clasificación de texto: etiquetado de sentimiento sobre secuencias de hasta 512 tokens mediante `pipeline("text-classification")`.
- Inferencia por lotes: al ser un encoder de 66 M de parámetros, permite procesar grandes volúmenes de textos en CPU o GPU con bajo coste computacional.
- Extracción de representaciones: es posible usar el encoder subyacente para obtener embeddings contextuales (aunque el checkpoint publicado está configurado para clasificación).
- Ajuste fino adicional: compatible con el ecosistema `transformers`/`Trainer` para reentrenar sobre un dataset propio.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Generación de texto: no soportado; la cabeza es de clasificación, no causal.
- Capacidades multilingües: no disponibles; no se declara ningún idioma y el backbone está preentrenado en inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Análisis de opiniones sobre reseñas de producto: ingesta de reseñas cortas en inglés y etiquetado automático de polaridad. La ventana de 512 tokens cubre la mayoría de reseñas, aunque el accuracy declarado (0,6598) obliga a validar el modelo sobre datos propios antes de usarlo.
- Monitorización de menciones en redes sociales: clasificación por lotes de publicaciones breves. El tamaño reducido del modelo permite procesar miles de textos por minuto en una única GPU consumer o incluso en CPU.
- Enrutado previo en un sistema mayor: uso del clasificador como filtro barato para separar feedback negativo antes de pasarlo a un modelo generativo más caro. Aquí la latencia baja de un encoder de 66 M es la ventaja principal.
- Etiquetado asistido para anotación humana: preetiquetado de un corpus no etiquetado, dejando la revisión final a anotadores. Dado el F1 macro de 0,6493, el modelo sería solo un punto de partida, no un oráculo.
- Investigación y docencia: ejemplo reproducible de pipeline completo de `Trainer` (hiperparámetros, curvas de pérdida, métricas por época) para cursos de NLP.
- Base para un ajuste fino específico de dominio: punto de partida para reentrenar sobre un dataset propio de sentimiento en un dominio concreto (por ejemplo, tickets de soporte), siempre que se disponga de datos etiquetados.
- Clasificación de encuestas con respuestas abiertas: procesado de comentarios de NPS o CSAT para agrupar por polaridad, aceptable cuando el coste de un error de clasificación es bajo y existe revisión humana.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay benchmarks estándar (MMLU, GLUE, SST-2, etc.) publicados para este checkpoint. Las únicas métricas disponibles son las declaradas por el autor en el README sobre un conjunto de evaluación no identificado:

| Métrica | Valor declarado |
|---|---|
| Loss (evaluación) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP32 (66,96 M parámetros × 4 bytes) y unos 0,14 GB en FP16. Con activaciones y overhead del runtime, un batch pequeño cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, T4, L4, A100, H100). No se requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: es viable para inferencia en CPU; el repositorio de 0,3 GB y los 66 M de parámetros hacen el despliegue en servidor sin GPU perfectamente razonable.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `Trainer`/`inference` para lotes, exportación a ONNX Runtime, TorchServe o FastAPI con `transformers`. También es posible servir con Text Embeddings Inference si se reconfigura, aunque el modelo está pensado para clasificación.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones. A título orientativo, un encoder de 66 M de parámetros con entradas de 128-256 tokens suele procesar cientos de secuencias por segundo en una GPU moderna, pero este dato no está verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `Asswin07/sentiment-model` | 66,96 M | 512 tokens | Apache 2.0 | Accuracy 0,6598 y F1 macro 0,6493 (evaluación no descrita) | Hugging Face, 0 descargas, 0 likes |
| `distilbert-base-uncased` (base sin ajustar) | 66,96 M | 512 tokens | Apache 2.0 | No aplica a clasificación de sentimiento sin ajuste previo | Hugging Face, ampliamente utilizada |
| `bert-base-uncased` | 110 M | 512 tokens | Apache 2.0 | No disponible en la información proporcionada | Hugging Face |
| `roberta-base` | 125 M | 512 tokens | MIT | No disponible en la información proporcionada | Hugging Face |

Como referencia externa (no medida sobre este checkpoint), el artículo original de DistilBERT reporta 91,3 % de accuracy en el conjunto de desarrollo de SST-2 para el modelo destilado ajustado en esa tarea, muy por encima del 0,6598 declarado aquí. Esa diferencia apunta a un dataset de entrenamiento y evaluación poco representativo o de muy bajo volumen, no a una limitación del backbone.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica literalmente "an unknown dataset", por lo que no se puede evaluar la representatividad, el balance de clases ni el dominio de aplicación.
- Mapeo de etiquetas no documentado: no se especifica cuántas clases tiene la cabeza de clasificación ni a qué corresponde cada índice (`id2label`). Es imprescindible inspeccionar el `config.json` antes de cualquier uso.
- Rendimiento bajo: accuracy 0,6598 y F1 macro 0,6493 sobre un conjunto de evaluación no descrito. Con dos clases, 0,66 está muy cerca del azar; con más clases, la utilidad práctica es dudosa sin reentrenamiento.
- Sobreajuste probable: la pérdida de validación apenas mejora entre la época 2 (0,7226) y la 3 (0,7117) mientras la de entrenamiento cae de 0,8304 a 0,6785. Solo 58 pasos por época sugieren un dataset minúsculo.
- Idiomas no declarados: no hay información sobre el idioma de entrenamiento. El backbone es de vocabulario inglés (`uncased`), por lo que el comportamiento en castellano sería, como mínimo, no fiable.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Sesgos: no se ha publicado ninguna evaluación de sesgos demográficos, de género ni de dominio. Un clasificador de sentimiento sin auditoría puede penalizar sistemáticamente determinados registros lingüísticos o variedades dialectales.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones. No hay evidencia de que el modelo haya sido reproducido o verificado por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre los resultados.
- Marca temporal: las fechas de creación y actualización del repositorio (26 de septiembre de 2026) son posteriores a la fecha actual, lo que sugiere un posible error de metadatos de la plataforma y refuerza la necesidad de tratar el artefacto con cautela.
- Producción: no recomendado tal cual. Cualquier despliegue real debería ir precedido de un reentrenamiento con datos etiquetados propios y de una evaluación con particiones correctas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asswin07/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Model card del base: https://huggingface.co/distilbert-base-uncased
- Artículo original de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de `transformers` para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por el buscador corresponden a sitios de contenido para adultos sin relación alguna con `Asswin07/sentiment-model` y se han descartado por completo.
