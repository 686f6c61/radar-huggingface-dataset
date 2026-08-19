# istt-aiml-data/Criminal-Qwen3-Reranker-0.6B-Augmented

## Resumen

Criminal-Qwen3-Reranker-0.6B-Augmented es un modelo de tipo cross-encoder desarrollado por el usuario istt-aiml-data, especializado en la desambiguación de jerga (slang) en vietnamita, con un enfoque particular en contextos de discusión social y criminal. Se construye a partir del modelo base Qwen/Qwen3-Reranker-0.6B, al que se le ha aplicado un fine-tuning con un conjunto de datos reducido (506 ejemplos) y una pérdida de entropía cruzada binaria (BinaryCrossEntropyLoss). El modelo está diseñado para tareas de reranking y búsqueda semántica, asignando una puntuación a pares de textos para indicar su relevancia o la corrección de una interpretación semántica.

Con 595,7 millones de parámetros y una ventana de contexto máxima de 256 tokens, este modelo es ligero y adecuado para despliegues en entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia actual radica en la creciente necesidad de herramientas de procesamiento de lenguaje natural para idiomas de baja representación como el vietnamita, especialmente en tareas de moderación de contenido y análisis de conversaciones informales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-Encoder basado en Qwen3ForCausalLM (Qwen3-Reranker-0.6B) con capa LogitScore |
| Parametros totales | 595.776.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (máxima secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un cross-encoder estándar de Sentence Transformers, donde la entrada es un par de secuencias de texto que se procesan conjuntamente. Internamente utiliza Qwen3ForCausalLM como codificador, pero en lugar de generar texto, se emplea una capa LogitScore que compara los logits de dos tokens específicos (true_token_id=9693 y false_token_id=2152) para producir una puntuación escalar. Esta puntuación indica la verosimilitud de que la segunda secuencia sea una interpretación correcta o relevante de la primera.

El entrenamiento se realizó mediante fine-tuning del modelo base Qwen/Qwen3-Reranker-0.6B con un dataset de 506 ejemplos etiquetados, utilizando BinaryCrossEntropyLoss. No se han publicado detalles sobre la composición exacta del dataset ni sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.). El modelo está diseñado específicamente para el idioma vietnamita, con ejemplos de entrenamiento que incluyen conversaciones informales y jerga callejera.

## Capacidades

- Puntuación de pares de textos para reranking y búsqueda semántica.
- Desambiguación de jerga y expresiones coloquiales en vietnamita, distinguiendo entre interpretaciones literales y figuradas.
- Soporte para modalidades de texto y mensaje (message modality), permitiendo procesar conversaciones multi-turno.
- Clasificación binaria implícita: la puntuación refleja si la segunda secuencia es una interpretación válida del contexto proporcionado.
- No genera texto; su salida es un valor escalar (logit) que puede usarse para ordenar o filtrar candidatos.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede evaluar si una expresión como "bò vàng" (literalmente "vaca amarilla") se usa como insulto político o como referencia a un animal, ayudando a detectar lenguaje ofensivo en comentarios de foros vietnamitas.
- Sistemas de preguntas y respuestas: dado un contexto conversacional, el modelo puede puntuar diferentes respuestas candidatas para seleccionar la más coherente, mejorando la precisión de asistentes virtuales en vietnamita.
- Análisis de sentimiento en conversaciones informales: al identificar el significado real de términos ambiguos, permite clasificar la polaridad de mensajes en chats y redes sociales.
- Filtrado de contenido en plataformas de mensajería: puede usarse para detectar discursos de odio o incitación a la violencia cuando se emplean eufemismos o jerga criminal.
- Investigación sociolingüística: facilita el estudio de la evolución del lenguaje coloquial vietnamita y la variación semántica según el contexto social.
- Reranking en motores de búsqueda verticales: en un buscador de jurisprudencia o noticias, puede reordenar resultados según la relevancia semántica de los documentos frente a una consulta expresada en lenguaje informal.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, obtenidos en el conjunto de evaluación "slang disambiguation eval". No se proporcionan comparaciones con otros modelos.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Cross Encoder Correlation | slang disambiguation eval | Pearson | 0,4022 |
| Cross Encoder Correlation | slang disambiguation eval | Spearman | 0,3856 |

Estos valores indican una correlación moderada entre las puntuaciones del modelo y las etiquetas humanas, lo que sugiere que el modelo captura parcialmente la desambiguación de jerga pero con margen de mejora. No hay datos adicionales sobre otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de generación o razonamiento general.

## Requisitos de hardware

- Inferencia en GPU: con 595M parámetros, el modelo cabe en GPUs de consumo con al menos 4 GB de VRAM en precisión FP32 (aprox. 2,4 GB para los pesos). Con cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs con 2 GB o menos, aunque no se ofrecen cuantizaciones oficiales.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060, o superiores para inferencia cómoda. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al usar la librería sentence-transformers, puede integrarse fácilmente con frameworks como Hugging Face Transformers. Para producción, se puede servir con vLLM o TGI si se adapta, aunque no está documentado. También es compatible con llama.cpp si se convierte a GGUF, pero no se proporcionan dichos archivos.
- Latencia y throughput: no hay datos publicados. Dado el tamaño del modelo y la longitud de contexto limitada (256 tokens), se espera una latencia de decenas de milisegundos en GPU moderna para inferencia por lotes pequeños.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cross-encoders para vietnamita con fines de desambiguación de jerga). El modelo es un fine-tune de Qwen3-Reranker-0.6B, que a su vez es un cross-encoder multilingüe de Qwen. No hay benchmarks comparativos publicados con otros cross-encoders como BGE-Reranker o Cohere Rerank. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (506 ejemplos), lo que puede provocar sobreajuste y una generalización limitada a contextos no vistos.
- El modelo está entrenado exclusivamente en vietnamita; no soporta otros idiomas.
- La ventana de contexto de 256 tokens es corta, lo que limita su uso en conversaciones largas o documentos extensos.
- No se han publicado cuantizaciones oficiales ni pruebas de rendimiento en producción.
- Los valores de correlación (Pearson 0,40, Spearman 0,39) son moderados, lo que indica que el modelo puede fallar en casos ambiguos o con jerga novedosa.
- La desambiguación de jerga puede estar sesgada hacia los ejemplos del dataset, que podrían no representar todas las variantes regionales del vietnamita.
- No se han documentado sesgos específicos, pero al ser un modelo de lenguaje preentrenado, puede heredar sesgos de Qwen3.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento de normativas locales sobre moderación de contenido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/istt-aiml-data/Criminal-Qwen3-Reranker-0.6B-Augmented)
- [Modelo base Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B)
- [Documentación de Sentence Transformers](https://sbert.net)
- [Documentación de Cross Encoder](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
- [Repositorio de Sentence Transformers en GitHub](https://github.com/huggingface/sentence-transformers)
- [Cross Encoders en HuggingFace](https://huggingface.co/models?library=sentence-transformers&other=cross-encoder)
