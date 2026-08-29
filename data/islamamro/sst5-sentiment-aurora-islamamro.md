# Islamamro/sst5-sentiment-aurora-islamamro

## Resumen

El modelo `Islamamro/sst5-sentiment-aurora-islamamro` es un clasificador de sentimiento de texto en cinco niveles (muy negativo, negativo, neutral, positivo y muy positivo), desarrollado por el usuario Islamamro mediante el Aurora Research Portal. Se trata de un fine-tuning del modelo `distilbert-base-uncased` sobre el dataset `SetFit/sst5`, una versión de la Stanford Sentiment Treebank (SST-5). Con 66,9 millones de parámetros, es un modelo compacto de arquitectura transformer encoder, pensado para tareas de clasificación de texto.

El modelo se presenta como una prueba de concepto del pipeline de Aurora (construcción, entrenamiento y publicación), entrenado sobre un subconjunto reducido de 1.400 ejemplos del dataset SST-5. Su precisión en el conjunto de validación es de 0,45, lo que indica un rendimiento limitado y no apto para uso en producción. Aun así, sirve como demostración de cómo se puede generar y publicar un modelo de forma automatizada, y como punto de partida para un fine-tuning más exhaustivo con el dataset completo.

La relevancia de este modelo radica en su carácter didáctico y de demostración técnica, más que en su utilidad práctica inmediata. Para desarrolladores e investigadores, ilustra el flujo de trabajo de Aurora y ofrece una base sobre la que iterar con más datos y recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. En este caso, se ha realizado un fine-tuning sobre el dataset `SetFit/sst5`, que contiene frases etiquetadas con cinco niveles de sentimiento. El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, utilizando el pipeline de Aurora Research Portal, que automatiza el proceso de construcción, entrenamiento y publicación del modelo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de los 1.400 ejemplos del subconjunto demo) ni sobre técnicas de optimización como RLHF o DPO. El proceso se limita a un fine-tuning estándar sobre un subconjunto reducido, lo que explica la baja precisión obtenida.

## Capacidades

- Clasificación de sentimiento en cinco niveles: muy negativo, negativo, neutral, positivo y muy positivo.
- Procesamiento de texto en inglés (asumido por el modelo base, aunque no se especifica).
- Inferencia rápida gracias al tamaño compacto del modelo (67M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni otras capacidades multimodales.
- No se ha documentado soporte multilingüe más allá del inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones de usuarios en cinco categorías, aunque su baja precisión (0,45) limita su uso real. Sería necesario reentrenarlo con el dataset completo para obtener resultados fiables.
- Monitoreo de opiniones en redes sociales: podría aplicarse a tweets o comentarios para medir la polaridad del sentimiento, pero de nuevo requiere un fine-tuning adicional con datos más amplios.
- Prototipado rápido de sistemas de análisis de sentimiento: al ser un modelo pequeño y fácil de cargar, sirve como base para pruebas de concepto y validación de flujos de trabajo antes de invertir en modelos más grandes.
- Demostración del pipeline Aurora: el modelo es un ejemplo práctico de cómo se puede construir, entrenar y publicar un modelo de forma automatizada, útil para equipos que quieran evaluar esta plataforma.
- Educación y formación: puede utilizarse en cursos de NLP para ilustrar el proceso de fine-tuning y clasificación de texto, dado su tamaño reducido y su licencia abierta.
- Punto de partida para fine-tuning: los desarrolladores pueden tomar este modelo y reentrenarlo con el dataset SST-5 completo o con datos propios, mejorando su rendimiento para casos específicos.

## Benchmarks y rendimiento

La única métrica publicada es la precisión en el conjunto de validación (hold-out), que es de 0,45. No se han proporcionado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en clasificación de sentimiento y no en tareas generales de razonamiento o generación.

| Metrica | Valor |
|---|---|
| Precisión (hold-out) | 0,45 |

No se dispone de comparaciones con otros modelos de análisis de sentimiento en la información proporcionada.

## Requisitos de hardware

- Inferencia en GPU: al tener 66,9M parámetros, el modelo ocupa aproximadamente 268 MB en fp32 y 134 MB en fp16, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, etc.).
- Inferencia en CPU: es viable, con latencias de decenas de milisegundos por frase, dependiendo del hardware.
- Entrenamiento: se realizó en una NVIDIA RTX 3090 (24 GB VRAM), aunque con el subconjunto de 1.400 ejemplos podría entrenarse en GPUs con menos memoria.
- Opciones de despliegue: compatible con `transformers` (pipeline), y puede exportarse a ONNX o TensorRT para optimización. También es posible convertirlo a GGUF para su uso con llama.cpp u Ollama, aunque no se ha documentado.
- Throughput estimado: no disponible, pero al ser un modelo pequeño, puede procesar cientos de frases por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de clasificación de sentimiento en la documentación proporcionada. Sin embargo, se puede contextualizar con modelos como `distilbert-base-uncased-finetuned-sst-2-english` (que clasifica en 2 clases) o `cardiffnlp/twitter-roberta-base-sentiment` (3 clases), pero no se han publicado métricas de comparación para este modelo concreto.

| Modelo | Parametros | Clases | Precisión (SST-5) | Licencia |
|---|---|---|---|---|
| Islamamro/sst5-sentiment-aurora-islamamro | 66,9M | 5 | 0,45 | Apache 2.0 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9M | 2 | no disponible | Apache 2.0 |
| cardiffnlp/twitter-roberta-base-sentiment | 125M | 3 | no disponible | MIT |

Nota: los datos de los modelos comparativos son de conocimiento general, no de la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto de solo 1.400 ejemplos, lo que provoca una precisión muy baja (0,45) y un alto riesgo de sobreajuste o generalización deficiente.
- No apto para uso en producción sin un reentrenamiento completo con el dataset SST-5 o datos adicionales.
- Posibles sesgos derivados del dataset SST-5, que contiene frases de reseñas de películas y puede no representar otros dominios.
- Riesgo de alucinación o clasificaciones erróneas en textos fuera del dominio de entrenamiento.
- No se especifican los idiomas soportados; se asume inglés, pero no hay garantía.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es fiable para aplicaciones reales.
- No se documentan limitaciones de contexto, pero al ser DistilBERT, la longitud máxima de entrada suele ser de 512 tokens (no confirmado en la documentación).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Islamamro/sst5-sentiment-aurora-islamamro)
- [Dataset SetFit/sst5](https://huggingface.co/datasets/SetFit/sst5)
- [Perfil de GitHub del autor](https://github.com/islamamro)
- [Repositorio de ejemplo con LSTM para SST-5](https://github.com/doslim/Sentiment-Analysis-SST5)
