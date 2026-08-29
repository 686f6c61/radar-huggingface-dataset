# Islamamro/toxic-conversations-aurora-islamamro

## Resumen

El modelo `Islamamro/toxic-conversations-aurora-islamamro` es un clasificador de texto binario que distingue entre comentarios tóxicos y no tóxicos. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/toxic_conversations`, desarrollado por el usuario Islamamro a través del Aurora Research Portal, una plataforma que permite construir, entrenar y publicar modelos de extremo a extremo. El entrenamiento se realizó en una NVIDIA RTX 3090.

El modelo tiene 66,9 millones de parámetros y se distribuye en formato safetensors. Su propósito principal es demostrar el flujo de trabajo del portal Aurora, no ser un modelo de producción: el autor indica explícitamente que fue entrenado sobre un subconjunto de solo 1.400 ejemplos del dataset original, y que para uso real es necesario fine-tuning adicional con el conjunto completo. A pesar de su carácter demostrativo, alcanza una precisión del 0,89 en el conjunto de validación retenido, lo que lo hace útil como punto de partida para experimentos de moderación de contenido.

La relevancia de este modelo radica en su simplicidad y en su licencia Apache-2.0, que permite su uso y modificación sin restricciones comerciales. Es un ejemplo claro de cómo un modelo pequeño y ligero puede servir para tareas de clasificación de toxicidad, aunque con las limitaciones propias de un entrenamiento reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (base, uncased) fine-tuned |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 95% del rendimiento con un 40% menos de parámetros. DistilBERT es un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado mediante destilación de conocimiento desde BERT base. La capa de clasificación añade una salida binaria (tóxico/no tóxico).

El fine-tuning se realizó sobre el dataset `SetFit/toxic_conversations`, que contiene conversaciones etiquetadas como tóxicas o no tóxicas. Sin embargo, el autor utilizó únicamente un subconjunto de 1.400 ejemplos, lo que limita la generalización del modelo. No se mencionan técnicas de regularización adicionales, ni uso de RLHF o DPO. El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, aunque no se especifican hiperparámetros concretos (tasa de aprendizaje, épocas, tamaño de lote, etc.).

## Capacidades

- Clasificación binaria de toxicidad: el modelo asigna una etiqueta de "tóxico" o "no tóxico" a un texto dado, con una precisión reportada de 0,89 en el conjunto de validación.
- Procesamiento de texto en inglés: aunque no se especifica explícitamente, el modelo base `distilbert-base-uncased` está entrenado en inglés, por lo que se espera que funcione razonablemente en ese idioma.
- Inferencia ligera: al ser un modelo pequeño (67M parámetros), puede ejecutarse en CPU o en GPUs de baja gama, lo que facilita su integración en entornos con recursos limitados.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales. Es exclusivamente un clasificador de texto.

## Casos de uso

- Prototipado de sistemas de moderación: el modelo puede integrarse en un pipeline de prueba para evaluar la viabilidad de la detección de toxicidad antes de invertir en un modelo más grande. Su rapidez de inferencia permite iterar rápidamente.
- Experimentación educativa: sirve como ejemplo didáctico para estudiantes o desarrolladores que quieran entender cómo fine-tuning de un transformer pequeño puede resolver una tarea de clasificación de texto.
- Filtrado previo en pipelines de datos: puede usarse como un primer filtro para descartar comentarios claramente tóxicos en un flujo de procesamiento de datos, aunque con la advertencia de que no es fiable para producción.
- Benchmark interno: al ser un modelo de referencia, puede utilizarse para comparar el rendimiento de otros clasificadores de toxicidad en el mismo dataset, siempre que se tenga en cuenta su limitado entrenamiento.
- Demostración del pipeline Aurora: para quienes quieran evaluar la plataforma Aurora Research Portal, este modelo es un ejemplo tangible de lo que se puede construir con ella, desde el entrenamiento hasta la publicación.
- Base para fine-tuning posterior: dado que los pesos están disponibles bajo licencia Apache-2.0, se puede partir de este modelo y reentrenarlo con el dataset completo o con datos propios para obtener un clasificador más robusto.

## Benchmarks y rendimiento

El único dato de rendimiento proporcionado es la precisión en el conjunto de validación retenido (held-out), que el autor reporta como 0,89. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ni comparaciones con otros modelos de toxicidad.

| Metrica | Valor |
|---|---|
| Precisión (held-out) | 0,89 |

No se dispone de más métricas (F1, AUC, precisión/recall por clase) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 66,9M parámetros. En FP32, los pesos ocupan aproximadamente 268 MB; en FP16, unos 134 MB. Con overhead de activaciones y buffers, se estima un consumo de VRAM de 1-2 GB, dependiendo de la longitud del texto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. El entrenamiento se realizó en una RTX 3090, pero para inferencia sirven GPUs como la GTX 1060, RTX 2060, o incluso integradas con suficiente memoria compartida.
- Compatibilidad con CPU: al ser un modelo pequeño, puede ejecutarse en CPU con latencias de decenas de milisegundos por muestra, lo que lo hace viable para aplicaciones de baja concurrencia.
- Opciones de despliegue: se puede usar con la librería `transformers` de HuggingFace, exportar a ONNX para optimización, o convertirlo a GGUF para ejecutarlo con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, se espera un throughput de cientos de inferencias por segundo; en CPU, decenas por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de clasificación de toxicidad (como `unitary/toxic-bert` o `facebook/roberta-hate-speech-dynabench-r4-target`). No se han encontrado datos de rendimiento, parámetros o licencias de estos modelos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento muy reducido: el modelo se entrenó con solo 1.400 ejemplos, una fracción mínima del dataset `SetFit/toxic_conversations`. Esto provoca una alta probabilidad de sobreajuste y una generalización pobre ante datos no vistos.
- No apto para producción: el propio autor advierte que es una prueba del pipeline Aurora, no un modelo listo para uso real. Su uso en sistemas de moderación en producción podría generar falsos positivos o negativos con consecuencias graves.
- Sesgos potenciales: el dataset `SetFit/toxic_conversations` puede contener sesgos culturales o lingüísticos, y al ser un subconjunto pequeño, estos sesgos pueden amplificarse. No se ha realizado una evaluación de sesgos.
- Idioma limitado: aunque el modelo base es inglés, no se ha verificado su comportamiento en otros idiomas. Es probable que su rendimiento en español u otros idiomas sea deficiente.
- Falta de documentación técnica: no se proporcionan hiperparámetros, detalles del preprocesamiento, ni métricas adicionales (F1, AUC, matriz de confusión), lo que dificulta la reproducibilidad y la evaluación rigurosa.
- Licencia permisiva pero con responsabilidad: la licencia Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de los resultados, dado que el modelo no ha sido validado exhaustivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Islamamro/toxic-conversations-aurora-islamamro
- Dataset utilizado: https://huggingface.co/datasets/SetFit/toxic_conversations
- Perfil de GitHub del autor: https://github.com/islamamro

No se han encontrado papers, blogs o demos adicionales relacionados con este modelo.
