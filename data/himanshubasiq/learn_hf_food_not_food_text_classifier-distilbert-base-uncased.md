# himanshubasiq/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario que determina si un texto está relacionado con comida o no. Fue desarrollado por el usuario `himanshubasiq` mediante fine-tuning del modelo base `distilbert-base-uncased` sobre un dataset no especificado. La arquitectura es un transformer encoder ligero (DistilBERT) con una cabeza de clasificación añadida, y cuenta con 66,9 millones de parámetros. Está licenciado bajo Apache 2.0 y está pensado para tareas de clasificación rápida y eficiente, siendo compatible con el ecosistema de Hugging Face Transformers.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: al ser un fine-tune de DistilBERT, ofrece una alternativa ligera para tareas de análisis de texto en dominios específicos, como la moderación de contenido o el filtrado de información relacionada con alimentación. Aunque la model card es escasa en detalles sobre el dataset y el proceso de entrenamiento, los resultados reportados muestran una precisión del 100 % en el conjunto de evaluación, lo que sugiere un sobreajuste o un dataset muy sencillo. No se han publicado benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer con 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion) con cabeza de clasificacion binaria |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 (heredado de DistilBERT base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (heredado de DistilBERT base, aunque no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien existe una version ONNX en la comunidad) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97 % de su capacidad de comprensión del lenguaje con un 40 % menos de parámetros. La arquitectura incluye un encoder transformer con 6 capas, atención de 12 cabezas y una dimensión oculta de 768. Sobre esta base se añade una capa de clasificación para la tarea binaria (comida/no comida).

El fine-tuning se realizó con el trainer de Hugging Face, utilizando los siguientes hiperparámetros: tasa de aprendizaje 0.0001, tamaño de lote 32, optimizador AdamW (variante torch fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 10 épocas. El dataset de entrenamiento y evaluación no está documentado; la model card indica que se desconoce. Los resultados de entrenamiento muestran una pérdida de validación de 0.0004 y una precisión del 100 % desde la segunda época, lo que sugiere que el dataset es muy pequeño o que el modelo ha sobreajustado. No se mencionan técnicas como RLHF o DPO.

## Capacidades

- Clasificación binaria de texto: determina si un texto está relacionado con comida o no.
- Generación de texto: no aplica, es un modelo discriminativo.
- Razonamiento, código, matemáticas: no aplica.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no documentadas; probablemente solo funciona bien en inglés.
- Capacidades especiales: ninguna adicional (no vision, no audio, no thinking mode).

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede clasificar publicaciones o comentarios como relacionados con comida o no, permitiendo filtrar contenido temático en plataformas de recetas o reseñas gastronómicas.
- Análisis de menús en aplicaciones de delivery: dado un texto descriptivo de un plato, el modelo puede identificar si corresponde a comida, ayudando a categorizar automáticamente los elementos del menú.
- Filtrado de noticias o artículos: en un agregador de noticias, se puede usar para separar artículos sobre alimentación de otros temas, mejorando la personalización de contenidos.
- Clasificación de reseñas de restaurantes: el modelo puede distinguir si una reseña habla sobre la comida en sí o sobre otros aspectos (servicio, ambiente), facilitando el análisis de sentimiento específico.
- Automatización de tickets de soporte: en empresas de foodtech, los mensajes de clientes se pueden clasificar como relacionados con comida (p. ej., quejas sobre ingredientes) o no, para enrutarlos al departamento adecuado.
- Etiquetado de datos para entrenar modelos más grandes: sirve como un clasificador rápido y ligero para generar etiquetas preliminares en pipelines de data labeling, reduciendo costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente los resultados durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validación | 0.0004 |
| Accuracy de validación | 1.0 |

Estos valores corresponden al conjunto de evaluación del propio entrenamiento y no a benchmarks externos. No se pueden comparar con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 66,9 millones de parámetros, el modelo ocupa aproximadamente 268 MB en FP32 (4 bytes por parámetro). Con cuantización a 8 bits, el uso de VRAM se reduce a unos 67 MB. En la práctica, cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060, RTX 2060, etc.) es suficiente. También puede ejecutarse en CPU con razonable latencia para clasificación de frases cortas.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime (existe una versión ONNX en la comunidad), y puede servir a través de `text-embeddings-inference` o `endpoints_compatible` según los tags. También se puede usar con `transformers` pipeline directamente.
- Latencia y throughput estimados: al ser un modelo pequeño, en GPU puede procesar miles de frases por segundo (dependiendo del hardware). En CPU, la latencia por frase suele ser inferior a 10 ms. No hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la búsqueda web. Como referencia, otros fine-tunes de DistilBERT para clasificación de texto suelen tener un rendimiento similar en tareas binarias sencillas, pero no hay datos concretos para comparar. Se puede mencionar que el modelo es comparable a cualquier clasificador basado en DistilBERT, como `distilbert-base-uncased-finetuned-sst-2-english` (para análisis de sentimiento), pero no se han encontrado modelos específicos de comida/no comida.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un fine-tune de DistilBERT, puede heredar sesgos del corpus de entrenamiento original (inglés general). El dataset de fine-tuning es desconocido, por lo que puede contener sesgos específicos del dominio.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Limitaciones de contexto: ventana de contexto de 512 tokens, suficiente para la mayoría de textos cortos, pero no para documentos largos.
- Limitaciones de idioma: probablemente solo funciona bien en inglés; no hay evidencia de soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base (DistilBERT también es Apache 2.0).
- Caveat para producción: el accuracy de 1.0 en validación sugiere sobreajuste al dataset de entrenamiento. Se recomienda evaluar el modelo en datos externos antes de usarlo en producción. Además, el dataset no está documentado, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/himanshubasiq/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
- [Versión ONNX en la comunidad](https://huggingface.co/onnx-community/learn_hf_food_not_food_text_classifier_distilbert_base_uncased-ONNX)
- [Modelo base DistilBERT](https://huggingface.co/distilbert-base-uncased)
