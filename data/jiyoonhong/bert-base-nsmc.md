# JiYoonhong/bert-base-nsmc

## Resumen

El modelo `JiYoonhong/bert-base-nsmc` es un checkpoint de BERT base (arquitectura transformer encoder-only) ajustado para la tarea de clasificación de texto, según su pipeline declarado. El nombre "nsmc" sugiere que fue fine-tuned sobre el dataset NSMC (Naver Sentiment Movie Corpus), un conjunto de reseñas de películas en coreano etiquetadas como positivas o negativas, aunque la model card no lo confirma explícitamente. El autor, JiYoonhong, ha publicado el modelo en Hugging Face con un total de 110.618.882 parámetros, lo que coincide con el tamaño estándar de BERT base. A pesar de su potencial utilidad para análisis de sentimiento en coreano, el modelo carece de documentación detallada, no registra descargas ni likes, y su licencia no está especificada, lo que limita su adopción en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 110.618.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512, estándar de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente coreano, por el nombre NSMC) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a BERT base, un transformer encoder-only con 12 capas, 12 cabezas de atención y 768 dimensiones ocultas, según el número de parámetros reportado. El modelo fue fine-tuned para clasificación de texto, probablemente sobre el dataset NSMC (Naver Sentiment Movie Corpus) de reseñas de películas en coreano, aunque no se proporcionan detalles sobre el proceso de entrenamiento, hiperparámetros, número de épocas o técnica de ajuste (p. ej., si se usó aprendizaje supervisado estándar). La model card no incluye información sobre el dataset de entrenamiento, el preprocesamiento ni el régimen de entrenamiento, por lo que no es posible verificar estas afirmaciones. El tag `arxiv:1910.09700` en Hugging Face hace referencia al artículo de Lacoste et al. sobre estimación de emisiones de carbono, no al paper original de BERT.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, lo que indica que el modelo está diseñado para asignar una o varias etiquetas a un texto de entrada. En el contexto de NSMC, esto se traduce típicamente en análisis de sentimiento binario (positivo/negativo).
- Generación de texto: no aplicable, al ser un modelo encoder-only sin cabezal de decodificación.
- Razonamiento y código: no aplicable; su arquitectura y entrenamiento están orientados a tareas de clasificación, no a generación ni razonamiento complejo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no confirmadas. El nombre sugiere coreano, pero no hay documentación que lo respalde.
- Otras capacidades: no se especifican. El modelo no incluye visión ni audio.

## Casos de uso

- Análisis de sentimiento de reseñas de películas en coreano: el modelo podría emplearse para clasificar críticas como positivas o negativas, útil para plataformas de streaming o agregadores de reseñas. Al ser BERT base, requiere un preprocesamiento con tokenizador BERT y una entrada limitada a 512 tokens.
- Experimentación académica: sirve como punto de partida para estudiantes o investigadores que deseen comparar fine-tunings de BERT en tareas de clasificación en coreano, aunque su falta de documentación dificulta la reproducibilidad.
- Prototipado rápido de clasificadores de texto: al ser un modelo pequeño (110M parámetros), puede cargarse en entornos con recursos limitados para pruebas de concepto, siempre que se acepte la incertidumbre sobre su rendimiento real.
- Integración en pipelines de Hugging Face: al ser compatible con `text-embeddings-inference` y `endpoints_compatible`, puede desplegarse en la infraestructura de Hugging Face para servir inferencias de clasificación, aunque sin garantías de calidad.
- Evaluación de sesgos en modelos coreanos: si se confirma que fue entrenado con NSMC, podría usarse para estudiar sesgos de género o demográficos en reseñas de películas, aunque no hay evidencia de que el autor haya realizado dichos análisis.
- Benchmarking de cuantización: dado su tamaño moderado, podría emplearse para probar técnicas de cuantización (p. ej., GPTQ, AWQ) en tareas de clasificación, pero no se proporcionan pesos cuantizados de fábrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no hay datos de precisión, F1 u otras medidas sobre NSMC u otros conjuntos. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: un modelo de 110M parámetros en precisión fp32 ocupa aproximadamente 440 MB de memoria. Con cuantización a int8, se reduce a ~110 MB. Para inferencia en CPU, es viable con 8-16 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32 (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Para fine-tuning, se recomienda al menos 8 GB (p. ej., RTX 3070, A10).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: compatible con la librería `transformers`, por lo que puede servirse con vLLM, TGI, o mediante `text-embeddings-inference` (según los tags). También es posible usar `llama.cpp` si se convierte a GGUF, aunque no se proporcionan dichos pesos.
- Latencia y throughput: no disponibles. En una GPU moderna, un BERT base de 110M parámetros procesa típicamente entre 500 y 2000 secuencias por segundo en lotes pequeños, pero esto depende del hardware y la longitud de entrada.

## Comparativa con modelos similares

Existen otros checkpoints con el mismo nombre en Hugging Face, como `Ohjunghyun/bert-base-nsmc` y `Kimheeae/bert-base-nsmc`, pero no se dispone de información pública sobre sus métricas o características específicas. El modelo original de BERT (google-bert/bert-base-uncased) es el punto de partida sin fine-tuning, con 110M parámetros y contexto de 512 tokens. La comparativa se limita a aspectos generales:

| Modelo | Parametros | Contexto | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiYoonhong/bert-base-nsmc | 110M | no disponible | text-classification | no disponible | Hugging Face |
| Ohjunghyun/bert-base-nsmc | no disponible | no disponible | text-classification | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110M | 512 | fill-mask, text-classification, etc. | Apache 2.0 | Hugging Face, TensorFlow Hub |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es una plantilla genérica sin información sobre el entrenamiento, el dataset, los hiperparámetros o las métricas. Esto impide evaluar su fiabilidad y reproducibilidad.
- Sesgos potenciales: si fue entrenado con NSMC, el modelo puede reflejar sesgos presentes en las reseñas de películas coreanas (p. ej., sesgos de género o de idioma informal). No se ha realizado ningún análisis de sesgo.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la asignación de etiquetas puede ser incorrecta si los datos de entrenamiento estaban desbalanceados o mal etiquetados.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero si sigue el estándar de BERT, está limitada a 512 tokens. Entradas más largas deben truncarse o dividirse.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Estado de mantenimiento: el modelo no tiene descargas ni likes, y fue creado recientemente (agosto de 2026 según los metadatos), lo que sugiere que es un experimento personal sin soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/JiYoonhong/bert-base-nsmc
- Repositorio original de BERT (Google Research): https://github.com/google-research/bert
- Paper de estimación de emisiones (referenciado en la model card): https://arxiv.org/abs/1910.09700
