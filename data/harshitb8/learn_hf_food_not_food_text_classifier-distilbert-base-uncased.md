# harshitb8/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

Este modelo es un clasificador de texto binario creado por el usuario harshitb8 a partir de una puesta a punto (fine-tuning) de DistilBERT base uncased, el modelo compacto de Google/Canadá basado en la arquitectura transformer de BERT reducida. Su función es clasificar fragmentos de texto en dos categorías: si describen comida o si no la describen. El nombre del repositorio y la etiqueta "generated_from_trainer" indican que se trata de un proyecto de aprendizaje, probablemente asociado a un tutorial o cuaderno de entrenamiento con la librería Transformers de Hugging Face.

Es relevante como ejemplo práctico de cómo adaptar un modelo preentrenado pequeño a una tarea de clasificación concreta con recursos mínimos: el modelo completo ocupa unos 0,3 GB y pesa aproximadamente 67 millones de parámetros, por lo que puede ejecutarse en hardware muy modesto, incluso en CPU. La model card declara una precisión (accuracy) de 1.0 sobre el conjunto de evaluación y una pérdida de validación de 0.0006, aunque no se ha publicado información sobre el dataset empleado ni benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder bidireccional, 6 capas) |
| Parametros totales | 66.955.010 (~67 M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros se activan) |
| Longitud de contexto | no disponible (DistilBERT base usa 512 tokens por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base distilbert-base-uncased está entrenado en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilbert/distilbert-base-uncased, una versión destilada de BERT-base que reduce el número de capas de 12 a 6 manteniendo la dimensionalidad oculta (768) y el vocabulario sin diferenciar mayúsculas (uncased). Sobre esta base se añade una cabeza de clasificación para texto que produce dos salidas: comida o no comida. La tarea es de clasificación de secuencia estándar con el token [CLS] como representación.

El entrenamiento se realizó con la API Trainer de Hugging Face durante 10 épocas, con un tamaño de lote de 32 (entrenamiento y evaluación), tasa de aprendizaje de 0.0001 con planificador lineal, semilla 42 y el optimizador AdamW (variante fused de PyTorch) con betas (0.9, 0.999) y epsilon 1e-08. El dataset de entrenamiento no está documentado en la model card ("unknown dataset"), aunque el número de pasos por época (7) sugiere un conjunto pequeño, de unos 224 ejemplos de entrenamiento. Las versiones de software empleadas fueron Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación binaria de texto: determina si un fragmento describe comida o no describe comida.
- Clasificación de textos en inglés (por el modelo base uncased); el comportamiento en otros idiomas no está documentado.
- Salida de etiqueta con puntuaciones de probabilidad mediante el pipeline `text-classification` de Transformers.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face (según las etiquetas del repositorio).
- No tiene capacidades generativas, ni soporte de tool calling, ni agentes, ni visión o audio.

## Casos de uso

- Filtrado de contenido en catálogos: clasificar automáticamente descripciones de productos en un e-commerce para separar las que corresponden a alimentos de las que no, como paso previo a un enrutado por categoría.
- Moderación de reseñas: detectar reseñas que hablan de comida dentro de un corpus general de opiniones de un marketplace, para dirigirlas al equipo o pipeline de análisis gastronómico adecuado.
- Preprocesado de datasets: limpiar grandes colecciones de texto etiquetando frases relacionadas con comida antes de entrenar modelos más grandes, por ejemplo para filtrar recetas o menús de un corpus web.
- Clasificación de mensajes de soporte: enrutar tickets de usuarios que mencionan pedidos de comida o restaurantes hacia un flujo de atención específico del sector alimentario.
- Prototipado y docencia: servir como ejemplo completo de fine-tuning de DistilBERT con Trainer, útil para aprender el flujo de entrenamiento, evaluación y publicación en el Hub.
- Integración en endpoints ligeros: dado su tamaño reducido (~0,3 GB), puede desplegarse como endpoint de clasificación de bajo coste para tareas de enrutado de texto a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible; el campo de resultados del model-index está vacío. Los únicos datos de evaluación son los declarados por el autor sobre su conjunto de validación:

| Metrica | Valor |
|---|---|
| Validation loss (época 10) | 0.0006 |
| Accuracy (conjunto de evaluación) | 1.0 |

Nota: una accuracy de 1.0 sugiere un conjunto de evaluación muy pequeño o muy sencillo; estos números no son comparables con benchmarks públicos y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con ~67 millones de parámetros en fp32 el modelo ocupa unos 270 MB, por lo que funciona en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU para inferencia; cualquier GPU moderna (incluso una GTX 1650 o integrada) es más que suficiente. Para reentrenamiento, una GPU de gama media con 8 GB de VRAM sobra.
- Consumer GPU: cabe con holgura en cualquier GPU de consumo; también es plenamente viable la inferencia en CPU portátil.
- Opciones de despliegue: librería Transformers (pipeline `text-classification`), Text Embeddings Inference (TEI) según las etiquetas del repo, y Hugging Face Inference Endpoints. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas.
- Latencia y throughput: no disponibles; al ser un encoder de 6 capas, la latencia por texto corto es del orden de milisegundos en CPU moderno (estimación, dato no publicado).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Comentario |
|---|---|---|---|---|
| harshitb8/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | ~67 M | Clasificación binaria comida/no comida | apache-2.0 | Fine-tuning específico, dataset no documentado |
| distilbert/distilbert-base-uncased (base) | ~66 M | Modelo base preentrenado (MLM) | apache-2.0 | Sin cabeza de clasificación; punto de partida de este modelo |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | ~67 M | Clasificación de sentimiento binaria | apache-2.0 | Mismo tamaño y arquitectura, tarea distinta; referencia útil de fine-tuning similar |

No hay alternativas publicadas específicas para la tarea "comida vs. no comida"; la comparativa se basa en modelos de la misma familia y tamaño.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni de evaluación ("More information needed"), lo que impide auditar sesgos, cobertura o calidad de las etiquetas.
- La accuracy de 1.0 sobre un conjunto de evaluación presumiblemente pequeño no garantiza buen rendimiento en datos reales fuera de distribución.
- El modelo base está entrenado en inglés sin diferenciación de mayúsculas; su uso con texto en castellano u otros idiomas no está validado y probablemente degradará notablemente.
- Ventana de contexto limitada (512 tokens en el modelo base): no adecuado para documentos largos sin truncado o fragmentación.
- Al ser un clasificador especializado, no debe usarse para tareas generales de comprensión del lenguaje.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae de 0.4362 a 0.0007 en 10 épocas sobre un dataset aparentemente pequeño.
- Licencia apache-2.0: permite uso comercial, pero conviene citar el modelo base original conforme a su model card.
- Popularidad muy baja (29 descargas y 1 like en el momento de la ficha): falta de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshitb8/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (referencia del modelo base): https://arxiv.org/abs/1910.01108
- Otros enlaces (demos, repos de código, blog): no disponibles
