# SamirFaragHarb/distilbert-rotten-tomatoes

## Resumen

`distilbert-rotten-tomatoes` es un modelo de clasificación de texto (análisis de sentimiento) desarrollado por Samir Farag Harb, obtenido mediante fine-tuning del checkpoint `distilbert/distilbert-base-uncased` sobre un conjunto de datos no especificado en la model card. El modelo está diseñado para clasificar críticas de películas de la plataforma Rotten Tomatoes, presumiblemente en categorías de sentimiento (positivo/negativo u otro nivel de granularidad, aunque no se detalla). Se publica bajo licencia Apache-2.0 y utiliza la librería Transformers.

Con 66,9 millones de parámetros, es un modelo compacto que hereda la arquitectura destilada de DistilBERT, pensada para ofrecer un equilibrio entre rendimiento y eficiencia computacional. Aunque no se proporcionan métricas oficiales de evaluación, su tamaño reducido lo hace adecuado para despliegues en entornos con recursos limitados, como CPUs o GPUs de gama media. La relevancia actual radica en su utilidad como componente ligero en pipelines de procesamiento de lenguaje natural orientados a la moderación de contenido o al análisis de opiniones en español e inglés (aunque el idioma no está explícitamente declarado, el modelo base es inglés).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer destilado, 6 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados; el repositorio contiene safetensors en precisión original) |
| Idiomas soportados | no disponible (el modelo base es inglés, pero la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es una versión reducida de BERT, entrenada mediante destilación de conocimiento desde el modelo BERT-base. Utiliza una arquitectura transformer encoder con 6 capas (frente a las 12 de BERT-base), manteniendo la misma dimensión oculta (768) y el mismo número de cabezas de atención (12). El preentrenamiento combina tres objetivos: pérdida de modelado de lenguaje, pérdida de destilación y pérdida de similitud coseno entre las representaciones del profesor y el alumno.

El fine-tuning de este modelo se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 2e-5, tamaño de lote de 8 tanto para entrenamiento como para evaluación, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, programador de tasa lineal y 2 épocas. El conjunto de datos de entrenamiento no se especifica en la model card, aunque por el nombre se infiere que corresponde a críticas de Rotten Tomatoes. No se mencionan técnicas adicionales como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Clasificación de texto: el modelo está especializado en análisis de sentimiento sobre críticas de películas, devolviendo una etiqueta de clase (probablemente binaria positiva/negativa, aunque no se confirma el número de clases).
- Inferencia eficiente: gracias a su tamaño reducido (67M parámetros), puede ejecutarse en CPU con latencias bajas, adecuado para aplicaciones en tiempo real.
- Integración con el ecosistema Hugging Face: compatible con `transformers` y `text-embeddings-inference`, lo que facilita su uso en pipelines existentes.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio; es un modelo exclusivamente de clasificación de texto.

## Casos de uso

- Moderación automática de reseñas en plataformas de cine: el modelo puede clasificar críticas como positivas o negativas para filtrar contenido inapropiado o priorizar comentarios útiles.
- Análisis de opiniones en tiempo real para estudios de mercado: integrar el modelo en un pipeline de scraping para medir la recepción de estrenos en foros y redes sociales.
- Sistema de recomendación basado en sentimiento: utilizar las predicciones para ajustar sugerencias de películas según la polaridad de las críticas de usuarios.
- Clasificación de comentarios en portales de noticias: adaptar el modelo a otros dominios mediante fine-tuning adicional, aprovechando su base DistilBERT.
- Evaluación de guiones o avances: procesar reseñas de críticos profesionales para generar métricas agregadas de aceptación.
- Educación e investigación: servir como modelo de referencia para experimentos de análisis de sentimiento en español, dado su tamaño manejable y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una entrada `model-index` con la lista de resultados vacía, y no se proporcionan métricas como precisión, F1 o exactitud sobre conjuntos de validación estándar (p. ej., el propio conjunto de Rotten Tomatoes).

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66,9M parámetros; en FP32 ocupa aproximadamente 268 MB, en FP16 unos 134 MB. La VRAM necesaria para inferencia depende del tamaño del lote; con un lote de 1 cabe en GPUs con 1 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o superiores. También puede ejecutarse en CPU con razonable latencia (inferencia en pocos milisegundos por muestra).
- Opciones de despliegue: compatible con Hugging Face Inference Endpoints, `transformers` pipeline, `vLLM` (aunque no está optimizado para generación), y `text-embeddings-inference`. Para despliegue en CPU se puede usar `ONNX Runtime` o `OpenVINO` si se convierte el modelo.
- Latencia estimada: sin mediciones oficiales, pero dada la arquitectura pequeña, se espera una latencia inferior a 10 ms por muestra en GPU y de 20-50 ms en CPU moderna para secuencias cortas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. Como referencia, el modelo base `distilbert-base-uncased` tiene 66,9M parámetros y alcanza un rendimiento cercano a BERT-base en tareas de GLUE, pero no hay métricas específicas para el fine-tuning en Rotten Tomatoes. No se pueden ofrecer comparaciones numéricas fiables sin datos adicionales.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento es desconocido, lo que impide evaluar posibles sesgos o la generalización a otros dominios de texto.
- No se especifica el número de clases de salida ni la distribución de etiquetas; el modelo podría estar limitado a una tarea binaria o multiclase no documentada.
- El idioma de entrenamiento no está declarado; aunque el modelo base es inglés, no se garantiza un buen rendimiento en otros idiomas sin fine-tuning adicional.
- Al ser un modelo de clasificación, no genera texto; no es adecuado para tareas generativas ni para razonamiento complejo.
- El tamaño del repositorio en Hugging Face es de 19.0 GB, inusualmente grande para un modelo de 67M parámetros; podría contener archivos adicionales o historial de versiones, lo que puede afectar a la descarga en entornos con ancho de banda limitado.
- No hay evidencia de evaluación de robustez frente a ataques adversariales o ruido en las entradas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SamirFaragHarb/distilbert-rotten-tomatoes)
- [Perfil del autor en Hugging Face](https://huggingface.co/SamirFaragHarb)
- [Documentación de DistilBERT en Transformers](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/distilbert.md)
- [Repositorio de referencia para análisis de sentimiento con DistilBERT en Rotten Tomatoes](https://github.com/camposfabioc/sentiment-analysis)
