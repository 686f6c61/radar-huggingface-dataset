# capybaraOh/bert-base-nsmc

## Resumen

El modelo `capybaraOh/bert-base-nsmc` es un ajuste fino (fine-tuning) de `klue/bert-base`, un modelo BERT preentrenado para el idioma coreano, orientado a tareas de clasificación de texto. El nombre del repositorio sugiere que fue entrenado sobre el corpus NSMC (Naver Sentiment Movie Corpus), un conjunto de datos de reseñas de películas en coreano con etiquetas de sentimiento positivo/negativo, aunque la model card no confirma explícitamente el dataset utilizado. El modelo está publicado bajo licencia Creative Commons Attribution-ShareAlike 4.0 y se distribuye en formato safetensors, con un total de 110,6 millones de parámetros.

Este modelo resulta relevante para desarrolladores que necesitan un clasificador de texto ligero y eficiente en coreano, especialmente para análisis de sentimiento. Al estar basado en BERT base, ofrece un equilibrio entre rendimiento y requisitos computacionales, pudiendo ejecutarse en hardware de consumo. Sin embargo, la falta de documentación sobre el dataset de entrenamiento y la ausencia de benchmarks estándar limitan su uso en entornos de producción sin una evaluación previa.

La arquitectura es un encoder Transformer bidireccional (BERT) con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, características típicas de BERT base. El contexto máximo no está especificado, pero se asume el valor estándar de 512 tokens para BERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder) |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base klue/bert-base es coreano) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors, TensorFlow (tf) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `klue/bert-base`, que a su vez es una versión de BERT preentrenada con corpus coreano (KLUE benchmark). La arquitectura es la de un encoder Transformer bidireccional estándar: 12 capas, 768 dimensiones de embedding, 12 cabezas de atención y aproximadamente 110 millones de parámetros. La clasificación se realiza mediante una cabeza de salida añadida sobre el token `[CLS]`.

El entrenamiento se llevó a cabo con TensorFlow/Keras, como indica la etiqueta `generated_from_keras_callback`. Los hiperparámetros reportados incluyen el optimizador AdamWeightDecay con una tasa de aprendizaje inicial de 5e-5, un programa de decaimiento polinomial y warmup de 117 pasos. Se entrenó durante 4 épocas con precisión float32. El dataset de entrenamiento no se especifica en la model card; solo se menciona que es "unknown dataset". La pérdida de validación aumentó progresivamente (de 0.3095 a 0.5337) mientras que la precisión de validación se mantuvo estable alrededor de 0.87, lo que sugiere un posible sobreajuste tras la primera época.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, con un pipeline de `text-classification` en Hugging Face.
- Análisis de sentimiento: por el nombre "nsmc" y el contexto del corpus NSMC, se infiere que está optimizado para clasificar reseñas de películas en coreano como positivas o negativas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no declaradas; el modelo base klue/bert-base es específico para coreano, por lo que se espera que solo funcione correctamente en este idioma.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo de razonamiento).

## Casos de uso

- Análisis de sentimiento de reseñas de productos o películas en coreano: el modelo puede clasificar automáticamente comentarios como positivos o negativos, útil para plataformas de comercio electrónico o servicios de streaming que operan en Corea.
- Moderación de comentarios en foros o redes sociales: permite detectar mensajes con tono negativo u ofensivo, aunque su alcance se limita a clasificación binaria (positivo/negativo) y no a categorías más finas.
- Clasificación de tickets de soporte técnico: si se reentrena con datos propios, puede categorizar consultas de usuarios en coreano según su naturaleza (reclamación, pregunta, sugerencia), aunque el modelo actual solo distingue polaridad.
- Monitorización de opiniones en encuestas o formularios: procesar respuestas abiertas en coreano para extraer una señal de satisfacción general.
- Filtrado de contenido generado por usuarios en aplicaciones coreanas: detectar comentarios negativos antes de su publicación, integrándolo en un pipeline de moderación.
- Prototipado rápido de clasificadores en coreano: al ser un modelo pequeño y de fácil acceso, sirve como punto de partida para experimentos de análisis de sentimiento antes de optar por modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El modelo card reporta los siguientes resultados de evaluación durante el entrenamiento (no son benchmarks estándar):

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento | 0.0250 |
| Precisión de entrenamiento | 0.9921 |
| Pérdida de validación | 0.5337 |
| Precisión de validación | 0.8736 |
| Época | 4 |

Estos valores indican un claro sobreajuste, ya que la precisión de validación se mantiene en torno a 0.87 mientras que la de entrenamiento alcanza 0.99. No se dispone de comparaciones con otros modelos en tareas estándar como KLUE o NSMC.

## Requisitos de hardware

- VRAM estimada: para inferencia en float32, los pesos ocupan aproximadamente 442 MB (110M × 4 bytes). Con cuantización INT8 se reduce a ~110 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad para lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: puede servirse con Hugging Face Transformers (PyTorch o TensorFlow), o mediante ONNX Runtime para optimización. No se han reportado configuraciones específicas para vLLM, llama.cpp u Ollama, pero al ser un modelo BERT estándar, es compatible con frameworks que soporten arquitecturas transformer encoder.
- Latencia y throughput: no disponible. Se espera una latencia de decenas de milisegundos por muestra en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Existen otros repositorios con el mismo nombre `bert-base-nsmc` (por ejemplo, `0lipa/bert-base-nsmc` y `Sherry-4/bert-base-nsmc`) que probablemente sean ajustes finos idénticos o muy similares del mismo modelo base. No se dispone de datos comparativos de rendimiento entre ellos.

| Modelo | Base | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| capybaraOh/bert-base-nsmc | klue/bert-base | 110M | no disponible | cc-by-sa-4.0 | Fine-tune para clasificación (NSMC) |
| 0lipa/bert-base-nsmc | klue/bert-base | 110M | no disponible | no especificada | Mismo nombre y propósito |
| Sherry-4/bert-base-nsmc | klue/bert-base | 110M | no disponible | no especificada | Mismo nombre y propósito |
| klue/bert-base | - | 110M | 512 (estándar) | MIT | Modelo base preentrenado en coreano |

La comparación directa con otros clasificadores de sentimiento en coreano (por ejemplo, modelos basados en KoBERT o ELECTRA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica el corpus utilizado, lo que impide evaluar la representatividad y posibles sesgos.
- Sobreajuste evidente: la precisión de validación (0.87) es notablemente inferior a la de entrenamiento (0.99), lo que sugiere que el modelo puede generalizar mal a datos no vistos.
- Idioma limitado: aunque no se declara explícitamente, el modelo base es coreano, por lo que no debe usarse en otros idiomas.
- Contexto limitado: la longitud máxima de secuencia no se documenta; si sigue el estándar de BERT, es de 512 tokens, lo que restringe su uso en textos largos.
- Riesgo de alucinación: no aplica, ya que es un modelo de clasificación y no genera texto libre.
- Licencia cc-by-sa-4.0: permite uso comercial y modificaciones, pero cualquier obra derivada debe distribuirse bajo la misma licencia y atribuir al autor original. Conviene revisar las implicaciones legales antes de integrarlo en productos propietarios.
- Sin garantías de soporte: el repositorio tiene solo 7 descargas y 0 likes, lo que indica un mantenimiento mínimo y ausencia de comunidad activa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/capybaraOh/bert-base-nsmc
- Modelo base klue/bert-base: https://huggingface.co/klue/bert-base
- Repositorios similares: https://huggingface.co/0lipa/bert-base-nsmc , https://huggingface.co/Sherry-4/bert-base-nsmc
- Paper original de BERT: https://arxiv.org/abs/1810.04805
- Repositorio oficial de BERT (Google Research): https://github.com/google-research/bert
- Análisis de seguridad del modelo (Protect AI): https://protectai.com/insights/models/ohminsang/bert_base_nsmc/f109967226f64b9a291314d56ece36267c4c1901/overview
