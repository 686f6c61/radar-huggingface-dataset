# Janos98/distilhubert-finetuned-gtzan

## Resumen

El modelo `distilhubert-finetuned-gtzan` es un clasificador de audio desarrollado por Janos98, obtenido mediante fine-tuning del modelo base `ntu-spml/distilhubert` sobre el dataset GTZAN, un conjunto de referencia para clasificación de géneros musicales. DistilHuBERT es una versión destilada de HuBERT, un modelo de representación de audio basado en transformer, que reduce significativamente el número de parámetros manteniendo gran parte de la capacidad de representación acústica. Con 23,69 millones de parámetros, este modelo está especializado en la clasificación de audio en diez géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock) y alcanza una precisión del 82,97 % en el conjunto de evaluación de GTZAN.

La relevancia de este modelo radica en su pequeño tamaño y su licencia Apache 2.0, lo que lo hace accesible para tareas de clasificación de audio en entornos con recursos limitados, como dispositivos edge o aplicaciones de análisis musical en tiempo real. Al estar basado en DistilHuBERT, hereda una arquitectura eficiente que permite una inferencia rápida sin necesidad de GPUs de gama alta. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers de HuggingFace, lo que facilita su integración en pipelines de procesamiento de audio existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de audio basado en DistilHuBERT (versión destilada de HuBERT) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; la ventana de audio depende del preprocesado, típicamente 30 segundos para GTZAN) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de audio, no depende de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilHuBERT, una versión destilada de HuBERT (Hidden Unit BERT), un modelo de representación de audio auto-supervisado desarrollado por Meta AI. HuBERT utiliza una arquitectura transformer con enmascaramiento de unidades acústicas aprendidas, mientras que DistilHuBERT reduce el número de capas y parámetros mediante destilación de conocimiento, manteniendo una calidad de representación cercana al modelo original. En este caso, el modelo se ha fine-tuned para la tarea de clasificación de géneros musicales, añadiendo una cabeza de clasificación sobre las representaciones del encoder.

El entrenamiento se realizó sobre el dataset GTZAN, que contiene 1.000 clips de audio de 30 segundos distribuidos en 10 géneros. Se utilizó el Trainer de HuggingFace con los siguientes hiperparámetros: learning rate de 0,0001, batch size de 32, optimizador AdamW (fused) con betas (0,9, 0,999) y epsilon 1e-08, scheduler de tipo cosine con warmup del 10 % de los pasos, 8 épocas y entrenamiento con precisión mixta nativa (AMP). El proceso de entrenamiento se monitorizó con TensorBoard. La mejor precisión de validación se obtuvo en la época 6 (83,31 %), aunque el modelo final de la época 8 alcanzó un 82,97 % con una pérdida de validación de 0,7137.

## Capacidades

- Clasificación de audio en 10 géneros musicales: blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock.
- Extracción de representaciones acústicas de audio de 30 segundos mediante el encoder DistilHuBERT.
- Inferencia eficiente gracias al reducido número de parámetros (23,69 M), adecuado para entornos con recursos limitados.
- Compatible con el pipeline `audio-classification` de HuggingFace Transformers, lo que permite su uso directo con la API de alto nivel.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador de audio.
- No se han documentado capacidades multilingües, ya que la tarea no depende del idioma.

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas de audio: el modelo puede etiquetar automáticamente canciones en plataformas de streaming o gestores de música personal, permitiendo organizar colecciones sin intervención manual. Su pequeño tamaño permite ejecutarlo en servidores modestos o incluso en dispositivos locales.
- Análisis de contenido en plataformas de radio o podcasting: se puede integrar en pipelines que detecten el género de las pistas emitidas para generar metadatos, recomendaciones o informes de audiencia.
- Sistemas de recomendación musical: las predicciones del modelo pueden combinarse con otras señales (historial de escucha, características acústicas) para mejorar la precisión de los sistemas de recomendación en aplicaciones de música.
- Investigación en MIR (Music Information Retrieval): sirve como baseline eficiente para experimentos de clasificación de géneros, ya que su licencia Apache 2.0 permite su uso en proyectos académicos y comerciales sin restricciones.
- Aplicaciones de educación musical: puede utilizarse en herramientas que identifiquen el género de una pieza para fines pedagógicos, por ejemplo, en aplicaciones de aprendizaje de teoría musical o historia de la música.
- Clasificación de audio en tiempo real para instalaciones artísticas o visuales: gracias a su baja latencia, el modelo puede procesar audio en streaming para generar visualizaciones o efectos reactivos al género musical detectado.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en la model card, el modelo alcanza los siguientes valores en el conjunto de evaluación de GTZAN:

| Metrica | Valor |
|---|---|
| Accuracy | 0,8297 |
| Loss | 0,7137 |

La evolución durante el entrenamiento fue la siguiente:

| Epoca | Training Loss | Validation Loss | Accuracy |
|:-----:|:-------------:|:---------------:|:--------:|
| 1     | 1,0401        | 1,0224          | 0,6845   |
| 2     | 0,5894        | 0,7038          | 0,7813   |
| 3     | 0,4142        | 0,6172          | 0,8063   |
| 4     | 0,2579        | 0,9213          | 0,7696   |
| 5     | 0,0849        | 0,7600          | 0,7980   |
| 6     | 0,0617        | 0,6777          | 0,8331   |
| 7     | 0,0282        | 0,7473          | 0,8230   |
| 8     | 0,0312        | 0,7137          | 0,8297   |

No se han publicado resultados comparativos con otros modelos en la información disponible. La precisión del 82,97 % es competitiva para un modelo de este tamaño en GTZAN, aunque modelos más grandes como HuBERT o Wav2Vec2 fine-tuned suelen superar el 90 % en este dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 23,69 M de parámetros, la huella de memoria es muy reducida. En FP32, los pesos ocupan aproximadamente 95 MB; en FP16, unos 48 MB. La VRAM necesaria para inferencia con un batch de 1 es inferior a 1 GB, incluyendo activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores funcionan sin problema. También es viable en GPUs integradas (iGPU) si se usa cuantización o CPU.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU consumer moderna, incluso en tarjetas de gama de entrada.
- Opciones de despliegue: el modelo es compatible con la librería Transformers de HuggingFace, por lo que puede servirse mediante HuggingFace Inference Endpoints, TGI (Text Generation Inference no aplica directamente, pero sí se puede usar con pipelines de audio), o mediante scripts personalizados con PyTorch. También puede exportarse a ONNX para inferencia optimizada en CPU o GPU.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por clip de 30 segundos en GPU, y de unos pocos cientos de milisegundos en CPU con cuantización.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor. Sin embargo, se pueden establecer referencias con otros modelos de clasificación de audio del mismo ámbito:

| Modelo | Parametros | Dataset | Accuracy en GTZAN | Licencia |
|---|---|---|---|---|
| distilhubert-finetuned-gtzan (este) | 23,69 M | GTZAN | 0,8297 | Apache-2.0 |
| Wav2Vec2-base fine-tuned en GTZAN | 95 M | GTZAN | ~0,85-0,90 (valores típicos, no verificados) | Apache-2.0 |
| HuBERT-base fine-tuned en GTZAN | 95 M | GTZAN | ~0,90 (valores típicos, no verificados) | MIT |

Nota: los valores de Wav2Vec2 y HuBERT son aproximaciones basadas en resultados publicados en la literatura, no en la información proporcionada. La comparativa exacta no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el dataset GTZAN, que contiene clips de 30 segundos de música occidental. Su rendimiento puede degradarse significativamente con audio de otras culturas, géneros no representados o duraciones diferentes.
- La precisión del 82,97 % indica que aproximadamente un 17 % de los clips se clasifican incorrectamente, lo que puede ser inaceptable en aplicaciones críticas.
- No se han documentado sesgos específicos, pero GTZAN tiene desequilibrios conocidos en la representación de ciertos géneros y estilos, lo que puede introducir sesgos en las predicciones.
- El modelo no es robusto a ruido, cambios de formato de audio, compresión con pérdidas o variaciones en la calidad de grabación, ya que no se ha evaluado en condiciones adversas.
- La model card original es muy escueta ("More information needed" en varias secciones), por lo que no se dispone de detalles sobre el preprocesado exacto, la tasa de muestreo esperada ni el manejo de audio de duración variable.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y el autor no ofrece soporte técnico.
- El modelo es específico para clasificación de géneros musicales; no sirve para otras tareas de audio como detección de eventos, transcripción o separación de fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Janos98/distilhubert-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Paper de HuBERT (base del modelo destilado): https://arxiv.org/abs/2106.07447
- Paper de DistilHuBERT: https://arxiv.org/abs/2208.03878
