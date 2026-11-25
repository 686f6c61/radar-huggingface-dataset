# NoobMoran/swedish-correctness-modernbert-base

## Resumen

Swedish-correctness-modernbert-base es un modelo de clasificación de texto especializado en evaluar la corrección gramatical del sueco escrito. Lo desarrolla el usuario NoobMoran y se construye mediante un ajuste fino (fine-tuning) del checkpoint AI-Sweden-Models/ModernBERT-base, un transformer encoder de 149,6 millones de parámetros. El modelo emite una única logit que, tras aplicar la función sigmoide, se interpreta como una puntuación de corrección entre 0 y 1.

El modelo resuelve un problema concreto: la evaluación automática de la calidad gramatical de textos en sueco, una tarea con aplicaciones en corrección ortográfica, filtrado de datos de entrenamiento y sistemas de asistencia a la escritura. Se entrena con supervisión de puntuación y de posición de errores, y destila las probabilidades a nivel de pasaje de un profesor (teacher) ModernBERT-large, lo que permite que un modelo de tamaño base aproxime el comportamiento de uno más grande.

Es relevante por su especialización lingüística: frente a modelos multilingües genéricos, ofrece una puntuación calibrada para el sueco con métricas publicadas (Spearman 0,824 y ROC-AUC 0,958 en el test público de la asignación; 0,741 y 0,934 en el test retenido de DaLAJ). Su licencia Apache 2.0 y su tamaño contenido facilitan el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.605.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la inferencia usa ventanas de 128 tokens con solapamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un transformer encoder de 149,6 millones de parámetros desarrollado por AI Sweden. Sobre esta base se aplica un ajuste fino con supervisión de dos tipos: una puntuación de corrección y la posición de los errores en el texto. Además, se destila el comportamiento de un profesor ModernBERT-large, transfiriendo sus probabilidades a nivel de pasaje al modelo base. El autor indica que los pesos LoRA empleados durante el entrenamiento se han fusionado en el checkpoint final, por lo que el modelo publicado es un checkpoint estándar de inferencia.

El modelo emite una única logit; aplicando sigmoide se obtiene la puntuación de corrección entre 0 y 1. Para pasajes largos, el predictor de la entrega utiliza ventanas de 128 tokens con solapamiento y agrega la media y el mínimo de las puntuaciones de las ventanas. Existe una cabeza auxiliar a nivel de token que se usó durante el entrenamiento pero que es independiente de los pesos de inferencia publicados. Las puntuaciones de entrenamiento son objetivos heurísticos derivados de etiquetas y tipos de error, no anotaciones humanas directas.

## Capacidades

- Puntuación de corrección gramatical de texto en sueco en una escala continua de 0 a 1.
- Detección implícita de errores gramaticales, ortográficos y de puntuación, aunque el autor advierte que las puntuaciones son aproximadas para errores aislados de ortografía o puntuación.
- Procesamiento de pasajes largos mediante ventanas de 128 tokens con solapamiento y agregación (media y mínimo).
- Clasificación de texto (pipeline text-classification) compatible con la librería transformers.
- Soporte de text-embeddings-inference y endpoints compatibles según las etiquetas del repositorio.
- No dispone de generación de texto, tool calling, capacidades de agente ni multimodalidad.

## Casos de uso

- Corrección ortográfica y gramatical asistida: el modelo puntúa fragmentos de texto en sueco y permite priorizar qué pasajes revisar primero en herramientas de edición, gracias a su salida continua y a su capacidad de procesar ventanas solapadas.
- Filtrado de corpus de entrenamiento: en la construcción de datasets en sueco, se puede usar la puntuación para descartar o marcar documentos con baja calidad gramatical antes de incluirlos en el entrenamiento de modelos mayores.
- Evaluación automática de textos generados: sirve como métrica auxiliar para medir la corrección lingüística de salidas de modelos de lenguaje en sueco, complementando métricas de contenido.
- Sistemas de aprendizaje de idiomas: integrado en una aplicación de práctica de sueco, el modelo puede señalar pasajes problemáticos en los ejercicios escritos por el estudiante y ofrecer una señal de calidad.
- Moderación y control de calidad en plataformas de contenido: permite detectar automáticamente texto mal formado o generado sin revisión en foros y comentarios en sueco.
- Investigación lingüística: facilita estudios sobre gramaticalidad en sueco a escala, con puntuaciones comparables entre corpus y con métricas de referencia publicadas (Spearman y ROC-AUC sobre DaLAJ).

## Benchmarks y rendimiento

| Test | Muestras | Spearman | ROC-AUC |
|---|---:|---:|---:|
| Test público de la asignación | 120 | 0,824 | 0,958 |
| Test retenido de DaLAJ | 4.363 | 0,741 | 0,934 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a esta tarea de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149,6 millones de parámetros, en precisión completa (fp32) requiere aproximadamente 0,6 GB de pesos; en fp16 alrededor de 0,3 GB. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no aprovecha tarjetas de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (pipeline text-classification), text-embeddings-inference y endpoints compatibles. No se indica soporte explícito de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoobMoran/swedish-correctness-modernbert-base | 149,6 M | no disponible (ventanas de 128 tokens) | Puntuación de gramaticalidad en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-base | 149,6 M | no disponible | Encoder general para sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-large | no disponible | no disponible | Encoder general para sueco (profesor del destilado) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de puntuación de gramaticalidad en sueco en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones numéricas son aproximadas, especialmente para errores aislados de ortografía o puntuación, según advierte el autor.
- Los objetivos de entrenamiento son heurísticos, derivados de etiquetas y tipos de error, no anotaciones humanas directas, lo que puede introducir sesgos en la calibración.
- El modelo solo cubre el idioma sueco; no es adecuado para otros idiomas.
- No se han publicado análisis de sesgos demográficos o dialectales.
- Riesgo de alucinación no aplica en sentido generativo, pero la puntuación puede ser poco fiable en dominios alejados de los datos de entrenamiento (DaLAJ y la asignación).
- La licencia Apache 2.0 permite uso comercial, pero el autor lo destina explícitamente a investigación sobre gramaticalidad en sueco.
- El modelo no genera texto ni soporta tool calling; su uso en producción debe limitarse a clasificación y puntuación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- [Hugging Face: NoobMoran/swedish-correctness-modernbert-base](https://huggingface.co/NoobMoran/swedish-correctness-modernbert-base)
- [Código y paper](https://github.com/NoobMoran/swedish-correctness-classifier)
- [Datos de entrenamiento](https://huggingface.co/datasets/NoobMoran/swedish-correctness-dalaj)
- [AI Sweden ModernBERT-base](https://huggingface.co/AI-Sweden-Models/ModernBERT-base)
- [AI Sweden ModernBERT-large](https://huggingface.co/AI-Sweden-Models/ModernBERT-large)
