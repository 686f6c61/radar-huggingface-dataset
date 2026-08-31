# GlowLED/wav2vec2-gtzan

## Resumen

GlowLED/wav2vec2-gtzan es un modelo de clasificación de audio fine-tuneado a partir de `facebook/wav2vec2-base` para la tarea de clasificación de géneros musicales sobre el dataset GTZAN, que contiene 10 géneros distintos (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock). El modelo ha sido entrenado con una técnica de aumentación basada en ventanas de 15 segundos sobre el dataset `sanchit-gandhi/gtzan`, logrando una precisión a nivel de canción de 0.92 y una precisión a nivel de ventana de 0.8894.

Desarrollado por el usuario GlowLED y publicado en Hugging Face, este modelo está pensado para integrarse fácilmente en pipelines de clasificación musical mediante la librería Transformers y el pipeline `audio-classification`. Con aproximadamente 94,5 millones de parámetros, es un modelo de tamaño medio que puede desplegarse en GPUs de consumo moderado. Su relevancia radica en ofrecer una solución lista para usar en tareas de etiquetado automático de música, con un rendimiento competitivo para su arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (base, fine-tuned) |
| Parametros totales | 94.571.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (es audio musical, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wav2Vec2, propuesta por Baevski et al. en 2020, que emplea un enfoque de aprendizaje autosupervisado sobre representaciones de audio en bruto. La versión base (`wav2vec2-base`) contiene aproximadamente 95 millones de parámetros y fue preentrenada con datos de habla en inglés. Para esta tarea, el modelo ha sido fine-tuneado en el dataset GTZAN, que contiene 1000 clips de audio de 30 segundos distribuidos en 10 géneros musicales.

El proceso de fine-tuning incluye una aumentación basada en ventanas de 15 segundos, lo que permite generar más muestras de entrenamiento y mejorar la robustez del modelo. No se especifican detalles sobre el número de épocas, el optimizador o la tasa de aprendizaje en la información disponible. El modelo se utiliza mediante `AutoModelForAudioClassification`, que añade una cabeza de clasificación sobre la representación de audio.

## Capacidades

- Clasificación de géneros musicales: detecta 10 géneros (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) a partir de audio en bruto.
- Procesamiento de audio de entrada: acepta matrices de floats correspondientes a la forma de onda cruda, tal como requiere Wav2Vec2.
- Integración con el pipeline `audio-classification` de Hugging Face, lo que facilita su uso en aplicaciones de producción.
- No soporta generación de texto, razonamiento, código, visión ni tool calling, ya que es un modelo exclusivamente de clasificación de audio.
- Capacidades multilingües no aplicables, al tratarse de audio musical sin contenido lingüístico.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: permite clasificar canciones en géneros para organizar colecciones personales o plataformas de streaming. Se usaría procesando cada pista con el modelo y asignando la etiqueta de mayor probabilidad.
- Sistemas de recomendación musical: la clasificación de género puede servir como característica para alimentar algoritmos de recomendación, ayudando a agrupar canciones similares.
- Análisis de tendencias musicales: aplicar el modelo a grandes volúmenes de audio para identificar la distribución de géneros en una región o periodo, útil para estudios de mercado.
- Moderación de contenido en plataformas UGC: clasificar automáticamente el género de audio subido por usuarios para categorizar contenido o aplicar políticas específicas.
- Asistentes de creación musical: sugerir el género de una pista en producción para ayudar a artistas a etiquetar sus obras.
- Investigación en MIR (Music Information Retrieval): servir como baseline o componente en experimentos académicos sobre clasificación de géneros, dado que GTZAN es un dataset de referencia.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, aunque no se detallan las condiciones exactas de evaluación:

| Metrica | Valor |
|---|---|
| Accuracy (nivel de canción) | 0.92 |
| Accuracy (nivel de ventana) | 0.8894 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores son competitivos para la tarea de clasificación de géneros en GTZAN, donde los mejores sistemas suelen alcanzar entre 0.85 y 0.95 de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene ~94,5 millones de parámetros y se maneja en precisión float32, se estima un consumo de aproximadamente 400 MB de VRAM para un solo lote de tamaño 1. Con cuantización a int8, podría reducirse a ~100 MB, aunque no se confirma disponibilidad de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia, como una NVIDIA GTX 1050 Ti o superior. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4060, etc.).
- Cabe en GPUs de consumo: sí, es un modelo ligero que puede ejecutarse en GPUs de gama baja.
- Opciones de despliegue: compatible con el pipeline `audio-classification` de Transformers, también puede servirse con Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` lo confirma) o con soluciones como Triton o FastAPI.
- Latencia y throughput: no se proporcionan datos específicos, pero para un modelo de este tamaño, la inferencia en GPU suele ser inferior a 50 ms por muestra de 15 segundos de audio en hardware moderno.

## Comparativa con modelos similares

Existen otros fine-tunes de `wav2vec2-base` sobre GTZAN en Hugging Face, como `ld76/wav2vec2-base-finetuned-gtzan-2` o `jjsprockel/wav2vec2-base-finetuned-gtzan`. No se dispone de métricas públicas comparables para estos modelos, por lo que no es posible establecer una comparación cuantitativa. En general, todos comparten la misma arquitectura base y el mismo dataset de fine-tuning, por lo que las diferencias de rendimiento suelen ser pequeñas y dependen del preprocesado y la aumentación empleados.

| Modelo | Parametros | Contexto | Accuracy (GTZAN) | Licencia |
|---|---|---|---|---|
| GlowLED/wav2vec2-gtzan | 94,57 M | no aplica | 0.92 | no disponible |
| ld76/wav2vec2-base-finetuned-gtzan-2 | ~95 M | no aplica | no disponible | no disponible |
| jjsprockel/wav2vec2-base-finetuned-gtzan | ~95 M | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: el autor no ha indicado una licencia, por lo que el uso comercial no está garantizado. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Dataset limitado: GTZAN es un dataset pequeño (1000 clips) y con posibles sesgos de género y calidad de audio. El modelo puede no generalizar bien a música fuera de ese conjunto.
- Sin soporte de audio largo: aunque acepta ventanas de 15 segundos, no está diseñado para procesar canciones completas de una vez; se requiere segmentación.
- Riesgo de confusión entre géneros similares: géneros como pop, rock y country pueden solaparse, lo que puede llevar a clasificaciones erróneas en contextos reales.
- No se han reportado evaluaciones de sesgo o robustez ante ruido, compresión de audio o variaciones de calidad de grabación.
- Al ser un modelo de clasificación, no genera explicaciones sobre sus decisiones, lo que limita su uso en aplicaciones que requieran interpretabilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/GlowLED/wav2vec2-gtzan)
- [Documentación de Wav2Vec2 en Transformers](https://huggingface.co/docs/transformers/model_doc/wav2vec2)
- [Paper original de Wav2Vec2](https://arxiv.org/abs/2006.11477) (referencia indirecta, no enlazado directamente en la búsqueda)
