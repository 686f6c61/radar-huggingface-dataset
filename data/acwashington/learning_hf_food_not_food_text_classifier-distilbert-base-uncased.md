# acwashington/learning_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learning_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de DistilBERT base uncased. Lo publica el usuario acwashington en Hugging Face y su propósito declarado, a partir del nombre, es distinguir entre textos que describen comida y textos que no. Es un modelo derivado de un ejercicio de aprendizaje ("learning_hf"), con cero descargas y un único "like" en el momento de la consulta, y sin documentación sustantiva más allá de la model card autogenerada por el Trainer.

Técnicamente es un transformer encoder de 6 capas y 66.955.010 parámetros (pesos en safetensors, repo de 0,3 GB), con tokenizador WordPiece sin casing y licencia Apache 2.0. El fine-tuning se realizó durante 10 épocas con AdamW fused, learning rate 1e-4, batch de 32 y semilla 42, sobre un dataset no especificado. El resultado reportado en el conjunto de evaluación es una accuracy de 1.0 y una loss de 0.0005.

Su relevancia es limitada como modelo de producción: se trata de una pieza de demostración educativa, sin benchmarks publicados ni datos de entrenamiento documentados. Resulta útil como ejemplo de pipeline de clasificación con Transformers y como base para experimentos de clasificación binaria de bajo coste computacional, pero no como componente crítico sin una validación propia exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT base; no especificado en la model card) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; compatible con cuantización dinámica vía PyTorch) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés, sin confirmación del autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilbert-base-uncased`, un transformer encoder destilado de BERT base con 6 capas, 12 cabezas de atención y dimensión oculta de 768. Sobre la cabeza preentrenada se añade una cabeza de clasificación para la tarea binaria `food` / `not_food`. No hay innovaciones arquitectónicas propias: se trata del flujo estándar de `Trainer` de Transformers con `AutoModelForSequenceClassification`.

El entrenamiento se ejecutó durante 10 épocas con learning rate 1e-4, batch de 32 en entrenamiento y evaluación, scheduler lineal, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-8) y semilla 42. La model card indica que el dataset es desconocido ("unknown dataset") y no documenta composición, número de ejemplos ni proceso de limpieza. No consta uso de RLHF, DPO ni técnicas de alineación; es un fine-tuning supervisado convencional. Las versiones de framework empleadas fueron Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria orientada a la etiqueta `food` frente a `not_food`, según el nombre del modelo.
- Inferencia de secuencia corta típica de DistilBERT: frases, titulares, descripciones breves o mensajes.
- Ejecución muy ligera: 66,9 M de parámetros permiten inferencia en CPU con latencia de milisegundos por muestra.
- Compatibilidad con la pipeline `text-classification` de Transformers y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe no confirmada; el modelo base es uncased en inglés y el autor no declara idiomas adicionales.

## Casos de uso

- Filtrado de reseñas gastronómicas: clasificar automáticamente reseñas de restaurantes o productos alimentarios para enrutarlas a un módulo de análisis de sentimiento específico de comida, aprovechando el bajo coste de inferencia del modelo.
- Moderación de foros culinarios: detectar si un mensaje entrante pertenece al dominio gastronómico antes de aplicar reglas adicionales, reduciendo el ruido en pipelines de moderación.
- Enrutamiento en asistentes conversacionales: usar la etiqueta binaria como señal previa para decidir si una consulta debe ir a un bot de recetas o a un bot generalista.
- Etiquetado de datasets: preanotar grandes volúmenes de textos con la etiqueta `food`/`not_food` para acelerar la revisión humana en la construcción de corpus.
- Clasificación en dispositivos con recursos limitados: al tener 66,9 M de parámetros y pesos en fp32 de ~0,3 GB, puede desplegarse en CPU, Raspberry Pi o entornos serverless con poca memoria.
- Prototipado educativo: servir como ejemplo reproducible del flujo `Trainer` de Hugging Face para fine-tuning de clasificadores binarios con DistilBERT, incluyendo hiperparámetros y curvas de entrenamiento documentadas.
- Prefiltro en pipelines de búsqueda: separar consultas con intención gastronómica antes de invocar un motor de recetas o una API de nutrición, ahorrando llamadas a modelos mayores.

## Benchmarks y rendimiento

La model card reporta únicamente métricas sobre el conjunto de evaluación interno, sin comparativas con otros modelos ni benchmarks estándar (MMLU, GLUE, etc.). El model-index oficial está vacío (`"results": []`).

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0.0005 |
| Accuracy (evaluación) | 1.0 |
| Dataset de evaluación | no disponible |
| Tamaño del conjunto de evaluación | no disponible |

No se han publicado resultados de benchmarks estándar en la información disponible. La accuracy de 1.0 debe interpretarse con cautela: sin conocer el conjunto de evaluación, no es posible descartar sobreajuste severo ni un conjunto de test trivial o filtrado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (~0,27 GB de pesos más activaciones); inferior a 0,5 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, T4, RTX 3050). Para lotes grandes, T4 o A10 son suficientes; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4090, e incluso en iGPU modernas.
- Despliegue: pipeline `text-classification` de Transformers, Text Embeddings Inference (TEI), ONNX Runtime, TorchScript y `optimum` para exportación a ONNX. Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de pocos milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned food/not food) | 66,9 M | 512 tokens | Clasificación binaria `food`/`not_food` | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| Alerta de spam / toxicidad tipo `unitary/toxic-bert` | ~110 M | 512 tokens | Clasificación multietiqueta | Apache 2.0 | Hugging Face, con benchmarks públicos |

La comparativa es estructural: no existen resultados de benchmarks de este modelo frente a alternativas, por lo que la elección frente a otros clasificadores debe basarse en validación propia sobre el dominio objetivo. Frente a `distilbert-base-uncased`, la diferencia es que este modelo ya incorpora una cabeza de clasificación binaria entrenada; frente a `bert-base-uncased`, ofrece menor tamaño a costa de algo de capacidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset" y no especifica composición, tamaño ni procedencia, lo que impide evaluar sesgos y cobertura.
- Accuracy de 1.0 en evaluación: valor sospechosamente alto sin información sobre el conjunto de test; alta probabilidad de sobreajuste o de un conjunto de evaluación trivial o filtrado.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos y negativos fuera de la distribución de entrenamiento.
- Idiomas no declarados: el modelo base es uncased en inglés; el comportamiento en castellano u otros idiomas no está verificado.
- Sin límite de contexto documentado más allá del estándar de 512 tokens de DistilBERT.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica "tal cual".
- Cero descargas y un único "like": sin validación por parte de la comunidad, no se recomienda como componente crítico en producción sin una evaluación independiente.
- La model card está autogenerada y el autor no ha completado las secciones de usos previstos, limitaciones ni datos de entrenamiento.
- Fecha de creación posterior a la actual (2026-11-06): metadato a verificar; puede tratarse de un error de la plataforma o de una fecha programada.

## Enlaces

- Hugging Face: https://huggingface.co/acwashington/learning_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
