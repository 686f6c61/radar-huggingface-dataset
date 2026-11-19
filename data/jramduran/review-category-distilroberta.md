# jramduran/review-category-distilroberta

## Resumen

`jramduran/review-category-distilroberta` es un modelo de clasificación de texto en inglés, un ajuste fino de `distilroberta-base` (82,1 millones de parámetros) desarrollado por el usuario jramduran. Su tarea es predecir a cuál de diez categorías de producto pertenece una reseña de Amazon, a partir del título y el cuerpo del texto de la reseña. Las categorías son: `automotive`, `beauty`, `books`, `electronics`, `fashion`, `grocery`, `home & kitchen`, `pet supplies`, `sports & outdoors` y `toys & games`.

El modelo se entrenó sobre 70.000 reseñas del corpus Amazon Reviews 2023 (McAuley-Lab), balanceadas entre categorías y con un filtro que elimina reseñas de menos de 8 palabras. Se trata de un modelo pequeño y ligero (repositorio de 0,3 GB en safetensors), pensado para tareas de enrutamiento y etiquetado automático de reseñas en pipelines de procesamiento de opiniones.

Es relevante por su simplicidad y su coste de inferencia reducido: al ser un DistilRoBERTa, puede ejecutarse en CPU o en GPU de consumo con latencias muy bajas, lo que lo hace apto para clasificar grandes volúmenes de reseñas en producción. La model card reporta una accuracy y un F1 macro de 0,823 sobre un conjunto de test de 7.000 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, destilación de RoBERTa-base) |
| Parametros totales | 82.126.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de RoBERTa-base; el entrenamiento usó max_length 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa destilado (`distilroberta-base`), con 6 capas y 82,1 millones de parámetros, al que se le añade una cabeza de clasificación lineal sobre la representación del token `[CLS]` para las 10 clases de categoría de producto. La longitud máxima de secuencia usada durante el entrenamiento fue de 128 tokens, aunque la arquitectura soporta hasta 512.

El ajuste fino se realizó durante 3 épocas con una tasa de aprendizaje de 3e-05 sobre un conjunto de 70.000 reseñas de Amazon Reviews 2023, balanceado entre las diez categorías y tras eliminar reseñas con menos de 8 palabras. La partición fue 80/10/10 (entrenamiento/validación/test), y el entrenamiento completo tardó 7,3 minutos en una NVIDIA GeForce RTX 5060 Laptop GPU. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni innovaciones arquitectónicas adicionales más allá de la destilación del modelo base.

## Capacidades

- Clasificación de texto multietiqueta (una etiqueta por reseña) en 10 categorías de producto de Amazon.
- Procesamiento de título y cuerpo de la reseña como entrada de texto.
- Inferencia rápida y de bajo coste gracias al tamaño reducido del modelo (82,1 M de parámetros).
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (`endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Enrutamiento automático de reseñas en un marketplace**: clasificar cada reseña entrante en una de las diez categorías para dirigirla al equipo de soporte o moderación correspondiente; el modelo es adecuado por su bajo coste y su accuracy de 0,823.
- **Etiquetado masivo de corpus de opiniones**: procesar lotes de miles de reseñas en CPU o GPU de consumo para construir datasets etiquetados por categoría, aprovechando la velocidad de un modelo de 82 M de parámetros.
- **Filtrado y organización de reseñas en paneles analíticos**: agrupar reseñas por categoría de producto para generar informes de sentimiento o de quejas por vertical, usando el modelo como clasificador previo a un análisis de sentimiento.
- **Detección de reseñas mal categorizadas**: comparar la categoría real del producto con la predicción del modelo para detectar errores de catalogación o reseñas publicadas en el producto equivocado.
- **Preetiquetado en pipelines de anotación humana**: usar el modelo como primer paso de etiquetado automático y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de anotación.
- **Clasificación en tiempo real en aplicaciones web**: integrar el modelo en un endpoint de inferencia (por ejemplo, con Text Embeddings Inference) para clasificar reseñas conforme se envían, con latencias compatibles con un modelo de este tamaño.
- **Generación de features para modelos posteriores**: usar la categoría predicha como variable adicional en modelos de recomendación o de análisis de mercado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (held-out test, n=7000) | 0,823 |
| F1 macro (held-out test, n=7000) | 0,823 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de clasificación específico y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (82,1 M de parámetros, ~0,33 GB de pesos), y del orden de 0,1-0,2 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en una NVIDIA GeForce RTX 5060 Laptop GPU, por lo que GPUs de consumo como RTX 3060, RTX 4060 o superiores son más que suficientes.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para clasificación por lotes.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Embeddings Inference (tag oficial), endpoints compatibles, y exportación a ONNX para inferencia optimizada.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput en la información disponible; por el tamaño del modelo, se espera un throughput alto en GPU y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/review-category-distilroberta` | 82,1 M | 512 tokens | Clasificación de categoría de reseña (10 clases) | no disponible | Hugging Face |
| `distilbert/distilroberta-base` | 82,1 M | 512 tokens | Modelo base (representaciones) | no disponible (según repositorio original) | Hugging Face |
| `roberta-base` | ~125 M | 512 tokens | Modelo base (representaciones) | no disponible (según repositorio original) | Hugging Face |

No se dispone de información sobre otros modelos ajustados específicamente para esta tarea de clasificación de categorías de reseñas de Amazon en la información proporcionada, por lo que la comparativa se limita a los modelos base de la misma familia.

## Limitaciones y advertencias

- El modelo solo soporta inglés; las reseñas en otros idiomas no están cubiertas.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial sin consultar al autor.
- El entrenamiento usó una longitud máxima de 128 tokens; las reseñas más largas se truncan, lo que puede degradar la clasificación de textos extensos.
- El modelo está entrenado sobre reseñas de Amazon y puede no generalizar a reseñas de otras plataformas o dominios con vocabulario distinto.
- Riesgo de alucinación no aplica directamente (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas en reseñas ambiguas o que mezclan categorías.
- Sesgos potenciales derivados de la distribución del corpus Amazon Reviews 2023 y del balanceo artificial de categorías, que puede no reflejar la distribución real de reseñas en producción.
- El modelo se creó en noviembre de 2026 y no registra descargas ni likes, por lo que no hay evidencia de uso en producción ni validación independiente.
- La matriz de confusión referenciada en la model card (`confusion_matrix.png`) no está disponible como dato numérico en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/review-category-distilroberta
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Dataset: https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023
