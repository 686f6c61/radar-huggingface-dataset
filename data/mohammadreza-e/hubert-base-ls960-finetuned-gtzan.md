# mohammadreza-e/hubert-base-ls960-finetuned-gtzan

## Resumen

Este modelo es una versión ajustada (fine-tuned) de HuBERT base para la tarea de clasificación de géneros musicales. Fue desarrollado por el usuario mohammadreza-e a partir del modelo base facebook/hubert-base-ls960, un codificador de audio auto-supervisado entrenado por Meta sobre 960 horas del corpus LibriSpeech. El ajuste fino se realizó sobre el dataset GTZAN, el benchmark clásico de reconocimiento de géneros musicales con 10 categorías (blues, clásica, country, disco, hiphop, jazz, metal, pop, reggae y rock).

El problema que resuelve es la categorización automática de clips de audio musical de 30 segundos en uno de los diez géneros de GTZAN, alcanzando una precisión del 86 % en el conjunto de evaluación según los datos declarados por el autor. Aunque no es un modelo de generación ni un LLM, resulta relevante como ejemplo práctico de cómo los modelos de audio auto-supervisados como HuBERT transfieren bien a tareas de clasificación no verbales (MIR, music information retrieval) con un ajuste fino relativamente ligero.

Arquitectura: transformer convolucional + transformer encoder de HuBERT base, con aproximadamente 94,6 millones de parámetros. La longitud de contexto efectiva viene dada por clips de audio de 30 segundos. Está distribuido en formato safetensors bajo licencia Apache 2.0 y es totalmente compatible con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT (CNN convolucional de extracción + transformer encoder), cabeza de clasificación de audio |
| Parametros totales | 94.571.146 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (entrenado con clips de audio de 30 segundos, estándar de GTZAN) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | no disponible (clasificación de géneros musicales, no depende del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/hubert-base-ls960, que emplea la arquitectura HuBERT: una CNN convolucional inicial que reduce la resolución temporal de la forma de onda cruda y un transformer encoder de 12 capas (configuración "base", ~95 millones de parámetros). HuBERT se preentrenó de forma auto-supervisada con el objetivo de predicción de unidades enmascaradas (masked prediction de clusters acústicos), lo que produce representaciones de audio robustas sin necesidad de transcripciones. Sobre este codificador se añade una cabeza de clasificación entrenada para emitir probabilidades sobre las 10 clases de género de GTZAN.

El ajuste fino se realizó durante 15 épocas con AdamW (variante fused de PyTorch, betas 0.9/0.999, epsilon 1e-08), tasa de aprendizaje 5e-05 con planificador lineal y 150 pasos de calentamiento, tamaño de lote efectivo de 8 (lote de 4 con acumulación de gradiente de 2 pasos) y precisión mixta nativa (AMP), con semilla 42. La curva de entrenamiento muestra una mejora progresiva desde el 37 % de precisión en la primera época hasta el 86 % final, con pérdida de validación mínima de 0,5269 en la época 7; el modelo final reporta loss de validación 0,6629 y accuracy 0,86. No se han publicado detalles sobre la composición del dataset de entrenamiento más allá del propio GTZAN ni sobre técnicas adicionales (data augmentation, congelación de capas, etc.).

## Capacidades

- Clasificación de audio en 10 géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) sobre clips de 30 segundos.
- Extracción de representaciones latentes de audio reutilizables, heredadas del codificador HuBERT preentrenado.
- Integración directa con el pipeline `audio-classification` de la librería Transformers de Hugging Face.
- No soporta generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente: es un clasificador de audio puro.
- No requiere transcripciones ni metadatos del audio: trabaja directamente sobre la forma de onda.

## Casos de uso

- Catalogación automática de bibliotecas musicales: clasificar grandes volúmenes de pistas por género para organizar catálogos de discográficas, emisoras de radio o bibliotecas de producción, evitando el etiquetado manual.
- Recomendación musical: usar la etiqueta de género (o las probabilidades de salida) como señal de entrada en sistemas de recomendación de playlists o descubrimiento de música similar.
- Moderación y verificación de metadatos: comprobar que el género declarado por un artista o distribuidor coincide con el contenido real del audio en plataformas de distribución digital.
- Análisis de tendencias en streaming: procesar lotes de audio para estudiar la distribución de géneros en catálogos o regiones concretas.
- Prototipado de MIR: servir como baseline o punto de partida para investigadores que desarrollen clasificadores de género más avanzados, aprovechando el codificador HuBERT preentrenado.
- Etiquetado en estudios de producción musical: clasificar muestras, loops o demos en bibliotecas internas de estudios para agilizar la búsqueda por género.
- Aplicaciones móviles o de escritorio de reconocimiento de género: dado su tamaño moderado (~95 M de parámetros), puede ejecutarse en hardware de consumo para clasificación en tiempo casi real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por terceros):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificación de audio | GTZAN (10 géneros) | Accuracy | 0,86 |
| Clasificación de audio | GTZAN (10 géneros) | Loss (validación) | 0,6629 |

Como referencia contextual, el estado del arte publicado en GTZAN suele situarse en torno al 85-91 % de precisión, por lo que el 86 % declarado es un resultado competitivo para un clasificador de este tamaño. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~94,6 millones de parámetros en fp32 (~380 MB de pesos; el repositorio ocupa 5,7 GB probablemente por checkpoints adicionales), se estima menos de 1 GB de VRAM para inferencia en GPU, y es plenamente viable en CPU.
- GPU recomendadas: cualquier GPU moderna basta; no se requiere hardware de gama alta (una RTX 3060 o superior es más que suficiente). Para entrenamiento del ajuste fino, el autor usó lotes pequeños con AMP, compatible con GPUs de consumo de 8-12 GB.
- Consumer GPUs: sí, cabe con holgura en prácticamente cualquier GPU de consumo actual; también funciona en CPU para cargas ligeras.
- Opciones de despliegue: librería Transformers de Hugging Face (pipeline `audio-classification`), inference endpoints de Hugging Face (el modelo está marcado como `endpoints_compatible`), o servicios propios con PyTorch. No hay evidencia de soporte directo en llama.cpp, vLLM u Ollama (orientados a LLM).
- Latencia y throughput: no disponibles; al ser un modelo base de ~95 M de parámetros, se espera inferencia de decenas de milisegundos por clip en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | GTZAN accuracy | Licencia |
|---|---|---|---|---|
| mohammadreza-e/hubert-base-ls960-finetuned-gtzan | ~94,6 M | Clasificación de género (GTZAN) | 0,86 (declarado) | Apache 2.0 |
| MIT/ast-finetuned-audioset-10-10-0.4593 (Audio Spectrogram Transformer, fine-tuned en GTZAN) | ~87 M | Clasificación de audio | ~0,83-0,85 (publicado en la literatura AST) | BSD-3-Clause |
| facebook/hubert-base-ls960 (modelo base, sin ajuste) | ~94,6 M | Preentrenamiento auto-supervisado de voz | no aplicable (requiere ajuste fino) | MIT |

Nota: los valores de los modelos comparativos son aproximaciones de resultados publicados en la literatura; el único dato verificado de esta ficha es el del modelo analizado. No se han publicado comparaciones directas en la información disponible.

## Limitaciones y advertencias

- El dataset GTZAN es pequeño (1.000 clips de 30 segundos) y conocido por contener artefactos de codificación y errores de etiquetado documentados en la literatura de MIR; las métricas sobre él pueden no generalizar a música real de streaming.
- La precisión del 86 % es declarada por el autor y no está verificada; la model card está generada automáticamente y carece de secciones de usos previstos y limitaciones ("More information needed").
- Sesgos: el modelo hereda la distribución de GTZAN (géneros occidentales, grabaciones de calidad y época concretas), por lo que su rendimiento será menor con géneros no representados, música no occidental o grabaciones de baja calidad.
- No es un modelo generativo ni multimodal: solo clasifica en las 10 clases de GTZAN; no sirve para clasificación de audio general sin reentrenamiento.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero puede confundir géneros solapados (por ejemplo, rock/metal o disco/pop) con confianza relativamente alta.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, con la obligación de conservar el aviso de licencia.
- Detalles de preprocesamiento (frecuencia de muestreo esperada, normalización) no están documentados en la model card; revisar el código de la configuración antes de usar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammadreza-e/hubert-base-ls960-finetuned-gtzan
- Modelo base: https://huggingface.co/facebook/hubert-base-ls960
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Paper original de HuBERT (referencia): https://arxiv.org/abs/2106.07447
- Otros enlaces (papers del autor, demos, repositorios de código): no disponibles
