# AIDA-UPM/star2

## Resumen

AIDA-UPM/star2 es un modelo de clasificación de texto desarrollado por el grupo AIDA de la Universidad Politécnica de Madrid. Forma parte de la línea STAR (Style Transformer for Authorship Representations), orientada al análisis de estilo de autoría, aunque esta variante concreta se construye sobre la arquitectura ModernBERT en lugar de la base RoBERTa de su predecesor. El modelo cuenta con 396,88 millones de parámetros y un tamaño de repositorio de 1,6 GB, lo que lo sitúa en la gama de encoders grandes.

El modelo se encuentra en fase de desarrollo: la model card es una plantilla sin completar y el propio autor advierte explícitamente de que no debe usarse con cautela. No se publican datos sobre licencia, idiomas, datos de entrenamiento ni evaluación. La información disponible se limita a los metadatos técnicos del repositorio y a la compatibilidad declarada con Text Embeddings Inference (TEI) y endpoints de Hugging Face.

Su relevancia actual radica en que representa una iteración moderna del enfoque STAR aplicado sobre ModernBERT, una arquitectura encoder optimizada para eficiencia y contexto largo. No obstante, cualquier uso en producción debería esperar a que se complete la documentación y se publiquen resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformador encoder) |
| Parametros totales | 396.880.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está etiquetado como `modernbert`, lo que indica que se basa en la arquitectura ModernBERT, un encoder transformer optimizado para eficiencia de inferencia y ventanas de contexto amplias. Con 396,88 millones de parámetros, es coherente con la gama ModernBERT-large (395M), aunque no se confirma oficialmente en la model card. El pipeline declarado es `text-classification`, lo que sugiere una capa de clasificación añadida sobre el encoder.

No se dispone de información sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni técnicas de alineación (RLHF, DPO, etc.). El tag `arxiv:1910.09700` corresponde al artículo de RoBERTa, lo que podría indicar una referencia metodológica heredada del modelo STAR original, pero no se puede confirmar su significado en este contexto. La model card no proporciona hiperparámetros, régimen de entrenamiento ni detalles de preprocesamiento.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está diseñado para tareas de clasificación sobre secuencias de texto.
- Representaciones de estilo de autoría: por su linaje STAR, se orienta a la captura de características estilísticas de autoría, aunque esta capacidad no está documentada en la model card actual.
- Compatibilidad con Text Embeddings Inference: el tag `text-embeddings-inference` indica que puede desplegarse mediante TEI para generación de embeddings.
- Compatibilidad con endpoints de Hugging Face: el tag `endpoints_compatible` permite su despliegue en Inference Endpoints de la plataforma.
- Integración con Transformers: al usar la librería `transformers`, se puede cargar con la API estándar de Hugging Face.

## Casos de uso

Dado el estado embrionario del modelo, los casos de uso deben considerarse potenciales y no validados. Se listan escenarios coherentes con su arquitectura y linaje, pendientes de confirmación por parte del autor.

- Atribución de autoría: el modelo podría emplearse para identificar el autor de un texto anónimo mediante clasificación estilística, una aplicación directa de la línea STAR. Requiere validación previa con datos etiquetados.
- Análisis de estilo en textos literarios: clasificación de fragmentos por autor o época basada en rasgos estilísticos. Adecuado por su orientación a representaciones de autoría.
- Moderación de contenido: clasificación de textos en categorías (toxicidad, spam, temática) usando la capa de clasificación del modelo. Es un uso genérico de un encoder de clasificación.
- Análisis de sentimiento: clasificación de reseñas o comentarios en polaridades positivas, negativas o neutras. Tarea estándar para un modelo de text-classification.
- Clasificación de documentos jurídicos o científicos: categorización automática de documentos por tipo o dominio. Su tamaño de 396M parámetros permite capturar matices semánticos finos.
- Generación de embeddings para búsqueda semántica: mediante TEI, el modelo puede servir embeddings de alta dimensión para sistemas de recuperación o clustering. Compatible con la infraestructura declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el propio autor indica que el modelo está en desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 396,88 millones de parámetros, los pesos en fp32 ocupan aproximadamente 1,6 GB. En fp16 o bf16 se reducen a unos 0,8 GB. La VRAM total necesaria dependerá del tamaño de lote y la longitud de secuencia, pero un encoder de este tamaño es manejable en GPUs consumer.
- GPU recomendadas: una GPU con 8 GB de VRAM (por ejemplo, RTX 3060 Ti o superior) es suficiente para inferencia con lotes pequeños. Para producción con throughput alto, una A10, A100 o L4 de NVIDIA es adecuada.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo como la RTX 3090, RTX 4070 o superiores con cuantización fp16.
- Opciones de despliegue: al ser un modelo Transformers con formato safetensors, se puede servir con vLLM, Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) y la API estándar de `transformers`.
- Latencia y throughput: no se dispone de datos medidos. Para un encoder de 396M parámetros, se espera una latencia de decenas de milisegundos por secuencia en GPUs modernas, pero estos valores no están publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Pipeline | Licencia | Estado |
|---|---|---|---|---|---|
| AIDA-UPM/star2 | 396,88M | ModernBERT | text-classification | no disponible | en desarrollo |
| AIDA-UPM/star | no disponible | RoBERTa | feature-extraction | no disponible | publicado |
| ModernBERT-large | 395M | ModernBERT | encoder base | Apache 2.0 | estable |

La comparación con AIDA-UPM/star es la más directa: ambos comparten el objetivo de representaciones de autoría, pero star2 cambia la base arquitectónica a ModernBERT y el pipeline a clasificación. Frente a ModernBERT-large, star2 sería un fine-tuning especializado, aunque sin documentación que confirme los datos de fine-tuning ni las ventajas concretas sobre el modelo base.

## Limitaciones y advertencias

- Modelo en desarrollo: la model card advierte explícitamente que el modelo no está terminado y que debe usarse con precaución.
- Documentación ausente: no hay información sobre datos de entrenamiento, evaluación, sesgos o limitaciones técnicas.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido. Esto bloquea su adopción en entornos empresariales.
- Idiomas no declarados: se desconoce qué idiomas soporta el modelo y con qué calidad.
- Sin benchmarks: no hay métricas que permitan comparar su rendimiento con alternativas.
- Riesgo de alucinación y sesgos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos potenciales ni comportamientos indeseados.
- Contexto no confirmado: aunque ModernBERT soporta ventanas largas, la longitud de contexto efectiva de este fine-tuning no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIDA-UPM/star2
- Modelo predecesor AIDA-UPM/star: https://huggingface.co/AIDA-UPM/star
- Model card de AIDA-UPM/star: https://huggingface.co/AIDA-UPM/star/blob/main/README.md
- Catalogo de modelos en Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/aida-upm-star
- Articulo de referencia de RoBERTa (tag en el modelo): https://arxiv.org/abs/1910.09700
