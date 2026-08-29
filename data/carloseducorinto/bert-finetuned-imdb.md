# carloseducorinto/bert-finetuned-imdb

## Resumen

El modelo `carloseducorinto/bert-finetuned-imdb` es un ajuste fino (fine-tuning) del modelo base `google-bert/bert-base-uncased` para la tarea de clasificación de texto. Desarrollado por carloseducorinto, el modelo está orientado a la clasificación binaria de reseñas, presumiblemente del conjunto de datos IMDB (aunque la model card no lo confirma explícitamente). Con 109.483.778 parámetros, sigue la arquitectura Transformer encoder de BERT, con una ventana de contexto estándar de 512 tokens. Su relevancia radica en ser un ejemplo práctico de fine-tuning con la librería Transformers, alcanzando una precisión del 88,8% en el conjunto de evaluación. No se han publicado resultados de benchmarks comparativos en el model-index.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 hidden size) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es monolingüe en inglés, pero no se declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder preentrenado en texto inglés no etiquetado. El fine-tuning se realizó sobre un conjunto de datos no especificado en la model card, aunque el nombre del modelo sugiere que se trata del dataset IMDB de reseñas de películas. El entrenamiento utilizó una tasa de aprendizaje de 2e-05, tamaño de lote de 8 para entrenamiento y 16 para evaluación, optimizador AdamW con betas (0.9, 0.999), programador de tasa lineal y una sola época. Se aplicó entrenamiento de precisión mixta (AMP). No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de texto binaria: el modelo distingue entre dos clases (positiva/negativa) en reseñas, con una precisión del 88,8% y F1 de 0,8843 en el conjunto de evaluación.
- Generación de texto: no aplicable (es un modelo discriminativo, no generativo).
- Razonamiento, código, matemáticas: no aplicable.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no disponibles (el modelo base es solo inglés).
- Capacidades especiales: ninguna declarada más allá de la clasificación de texto.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones de usuarios en positivas o negativas, útil para plataformas de comercio electrónico que necesitan agregar valoraciones automáticamente.
- Moderación de comentarios en foros y redes sociales: permite filtrar comentarios tóxicos o negativos antes de su publicación, reduciendo la carga de moderación manual.
- Monitorización de la reputación de marca: procesar menciones en redes sociales o encuestas para detectar tendencias de opinión positiva o negativa sobre una empresa o producto.
- Clasificación de críticas en plataformas de streaming: categorizar reseñas de películas o series para recomendar contenido o priorizar la atención al cliente.
- Análisis de encuestas abiertas: clasificar respuestas de texto libre en encuestas de satisfacción para cuantificar la proporción de opiniones favorables y desfavorables.
- Etiquetado automático de datos para entrenar otros modelos: usar las predicciones como pseudoetiquetas para ampliar conjuntos de datos de entrenamiento en tareas similares.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (no se especifica el dataset exacto):

| Metrica | Valor |
|---|---|
| Loss | 0.3161 |
| Accuracy | 0.888 |
| F1 | 0.8843 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 109M parámetros, la inferencia requiere aproximadamente 0,5-1 GB de VRAM en FP32 (el tamaño del repo es 0,4 GB). Con cuantización a 8 bits, puede ser incluso menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GPUs de consumo como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de gama baja.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, así como con servidores de inferencia como Hugging Face Inference Endpoints, vLLM (aunque no es óptimo para modelos encoder pequeños), y puede exportarse a ONNX o TensorRT para optimizaciones.
- Latencia y throughput: no se han publicado datos específicos, pero en una GPU moderna (p.ej., RTX 3090) la latencia por muestra suele ser inferior a 10 ms.

## Comparativa con modelos similares

Existen otros fine-tunes de BERT base sobre IMDB publicados en Hugging Face, como `nikitakapitan/bert-base-uncased-finetuned-imdb` o `ihebmbarek/bert-finetuned-imdb`. No se dispone de métricas detalladas de estos modelos para una comparación numérica. En términos de arquitectura, todos comparten el mismo modelo base y tamaño de parámetros. La principal diferencia está en el conjunto de datos exacto y los hiperparámetros de entrenamiento, que no están documentados en la mayoría de los casos. No se dispone de información suficiente para elaborar una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre reseñas de películas, el modelo puede presentar sesgos de dominio y no generalizar bien a otros tipos de texto (p.ej., reseñas de productos tecnológicos o textos formales).
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto, pero puede producir clasificaciones erróneas en entradas ambiguas o fuera de dominio.
- Limitaciones de contexto: la ventana de contexto es de 512 tokens (heredada de BERT base), por lo que no puede procesar documentos largos de una sola vez.
- Limitaciones de idioma: el modelo base es monolingüe en inglés; no se ha entrenado ni evaluado en otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos completos.
- Caveat para producción: el modelo no ha sido evaluado en un entorno industrial; se recomienda validar su rendimiento con datos propios antes de desplegarlo en aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/carloseducorinto/bert-finetuned-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio de GitHub con fine-tuning similar: https://github.com/AryaPathak/BERT-FineTuned-for-IMDB
- Repositorio de GitHub con notebook de fine-tuning: https://github.com/Suhen02/bert-finetuned-imdb
- Otro fine-tune similar: https://huggingface.co/nikitakapitan/bert-base-uncased-finetuned-imdb
- Otro fine-tune similar: https://huggingface.co/ihebmbarek/bert-finetuned-imdb
