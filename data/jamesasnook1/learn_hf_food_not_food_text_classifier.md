# JamesASnook1/learn_hf_food_not_food_text_classifier

## Resumen

`learn_hf_food_not_food_text_classifier` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario JamesASnook1 en Hugging Face y su propósito declarado, a tenor del nombre, es clasificar textos en dos clases: comida y no comida. Se trata de un modelo pequeño, de 66.955.010 parámetros, entrenado con la librería Transformers y exportado en formato safetensors.

El modelo se generó automáticamente con el `Trainer` de Transformers, como indica la propia model card, que deja sin completar las secciones de descripción, usos previstos, datos de entrenamiento y limitaciones. La evaluación reportada por el autor muestra una pérdida de validación de 0,0005 y una exactitud de 1,0 sobre el conjunto de evaluación, lo que apunta a un conjunto de validación muy pequeño y a un posible sobreajuste o fuga de datos entre entrenamiento y evaluación.

Su relevancia es limitada: no es un modelo de propósito general ni compite con los grandes modelos de lenguaje, sino un clasificador binario de dominio estrecho útil como ejemplo didáctico de fine-tuning de DistilBERT para tareas de clasificación de texto. La licencia Apache 2.0 facilita su reutilización, pero la ausencia de documentación sobre los datos de entrenamiento impide validar su comportamiento fuera del conjunto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, variante destilada de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (DistilBERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base, con vocabulario WordPiece sin distinción de mayúsculas. Sobre esa base se añade una cabeza de clasificación de secuencia para dos etiquetas. No hay innovaciones arquitectónicas propias: es un fine-tuning estándar de clasificación de texto.

El entrenamiento se realizó con el `Trainer` de Transformers durante 10 épocas, con un tamaño de lote de 32, tasa de aprendizaje de 1e-4, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y semilla 42. El conjunto de datos no se especifica ("unknown dataset" según la model card). El número total de pasos de entrenamiento fue de 70, lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos (70 pasos × 32 de lote), y un conjunto de validación igualmente reducido. No se menciona uso de RLHF, DPO ni técnicas de alineación.

## Capacidades

- Clasificación binaria de texto: asigna una etiqueta de comida o no comida a una secuencia de entrada.
- Clasificación de secuencias cortas, típicamente frases o títulos, dentro de los límites de tokens de DistilBERT.
- Inferencia ligera y rápida gracias a su tamaño reducido (67 millones de parámetros).
- Integración con la pipeline `text-classification` de Transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference`).
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe no documentada; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Filtrado de reseñas gastronómicas: clasificar titulares o reseñas de un sitio web para separar contenido culinario del que no lo es, aprovechando la velocidad de un modelo de 67 millones de parámetros.
- Etiquetado de menús y catálogos: procesar listados de productos o platos para marcar automáticamente entradas relacionadas con comida antes de una revisión humana.
- Moderación temática en foros: detectar si un mensaje pertenece a una sección de alimentación y redirigirlo al canal adecuado.
- Preprocesado de datasets para otros modelos: usar el clasificador como primer filtro barato que descarte textos no relacionados con comida antes de pasarlos a un modelo mayor.
- Enriquecimiento de bases de datos de recetas: clasificar descripciones cortas asociadas a recetas y descartar las que no correspondan al dominio.
- Ejemplo didáctico de fine-tuning: servir como plantilla en talleres o cursos sobre cómo ajustar DistilBERT con el `Trainer` de Transformers y desplegarlo con Text Embeddings Inference.
- Clasificación por lotes en CPU: al ser un modelo pequeño, puede ejecutarse en entornos sin GPU para tareas de etiquetado masivo de baja latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0005 |
| Accuracy (evaluacion) | 1,0 |

Evolución del entrenamiento reportada por el autor:

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 0,3388 | 0,0413 | 1,0 |
| 2 | 0,0193 | 0,0058 | 1,0 |
| 3 | 0,0037 | 0,0020 | 1,0 |
| 4 | 0,0017 | 0,0012 | 1,0 |
| 5 | 0,0010 | 0,0008 | 1,0 |
| 6 | 0,0008 | 0,0007 | 1,0 |
| 7 | 0,0007 | 0,0006 | 1,0 |
| 8 | 0,0006 | 0,0005 | 1,0 |
| 9 | 0,0006 | 0,0005 | 1,0 |
| 10 | 0,0006 | 0,0005 | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. El model-index del autor no contiene resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (67 millones de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, así como en CPU.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; su uso solo tendría sentido para servir lotes muy grandes.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (etiqueta oficial), endpoints de Hugging Face, y exportación a ONNX o cuantización posterior para CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia en milisegundos por muestra en GPU moderna y en decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `learn_hf_food_not_food_text_classifier` | 66.955.010 | no disponible (base: 512 tokens) | Clasificación binaria comida/no comida | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66.955.010 | 512 tokens | Modelo base de representaciones | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66.955.010 | 512 tokens | Análisis de sentimiento binario | Apache 2.0 | Hugging Face |
| `bert-base-uncased` | 109.482.240 | 512 tokens | Modelo base de representaciones | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (clasificadores binarios de texto) no está disponible en la información proporcionada, ya que no se han publicado métricas comparables ni datos de evaluación independientes.

## Limitaciones y advertencias

- La model card está generada automáticamente y deja sin completar la descripción, los usos previstos y los datos de entrenamiento; no se puede auditar la composición del dataset.
- La exactitud de 1,0 en validación con solo 70 pasos de entrenamiento sugiere un conjunto de validación muy pequeño y un alto riesgo de sobreajuste o fuga de datos; no debe interpretarse como rendimiento real en producción.
- No hay información sobre sesgos; al derivar de `distilbert-base-uncased`, puede heredar sesgos presentes en los corpus web en inglés.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- El dominio es muy estrecho (comida frente a no comida) y no se documenta el criterio de etiquetado ni los límites de la categoría.
- El modelo base está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero al no documentarse el dataset de entrenamiento no se puede garantizar la ausencia de material con derechos de terceros.
- El tamaño del repositorio (23,0 GB) es desproporcionado para 67 millones de parámetros; conviene revisar qué artefactos adicionales contiene antes de descargarlo completo.
- No debe usarse como sistema de decisión autónoma en contextos sensibles sin validación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamesASnook1/learn_hf_food_not_food_text_classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (Hugging Face): https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de la pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
