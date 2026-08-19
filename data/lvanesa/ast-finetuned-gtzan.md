# LVanesa/ast-finetuned-gtzan

## Resumen

El modelo `ast-finetuned-gtzan` es un fine-tuning del Audio Spectrogram Transformer (AST) pre-entrenado en AudioSet (`MIT/ast-finetuned-audioset-10-10-0.4593`), adaptado específicamente para la clasificación de géneros musicales sobre el dataset GTZAN. Desarrollado por LVanesa, este modelo resuelve el problema de etiquetado automático de audio en diez géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock), alcanzando una precisión del 91,64 % en el conjunto de evaluación.

Con 86,2 millones de parámetros y una arquitectura basada en Transformer aplicada a espectrogramas, el modelo es compacto y eficiente para tareas de clasificación de audio en producción. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para proyectos que necesitan un clasificador de géneros musicales ligero y de código abierto.

La relevancia actual de este modelo radica en su equilibrio entre tamaño reducido y rendimiento competitivo, así como en su facilidad de despliegue gracias a su integración nativa con la librería `transformers` y su formato de pesos `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de clasificacion de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el Audio Spectrogram Transformer (AST), una arquitectura de tipo Transformer originalmente diseñada para procesar espectrogramas de audio como si fueran imágenes. El modelo base `MIT/ast-finetuned-audioset-10-10-0.4593` fue pre-entrenado en el dataset AudioSet, que contiene más de 5000 horas de audio etiquetado con eventos sonoros. Sobre esta base, se realizó un fine-tuning con el dataset GTZAN, compuesto por 1000 clips de audio de 30 segundos distribuidos en 10 géneros musicales.

El entrenamiento se llevó a cabo durante 8 épocas con un tamaño de lote efectivo de 16 (batch de 8 con acumulación de gradiente de 2), utilizando el optimizador AdamW con tasa de aprendizaje de 5e-5, scheduler lineal con 100 pasos de calentamiento y precisión mixta nativa (AMP). La pérdida de validación final fue de 0,3877 y la precisión de 0,9164, observándose una mejora progresiva a lo largo de las épocas. No se emplearon técnicas de RLHF ni DPO, ya que se trata de una tarea de clasificación supervisada.

## Capacidades

- Clasificacion de audio en 10 generos musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de espectrogramas de audio mediante atencion por ventanas, heredada del AST pre-entrenado en AudioSet.
- Inferencia rapida y ligera gracias a sus 86 millones de parametros.
- Integracion con el pipeline `audio-classification` de la libreria `transformers`, lo que facilita su uso en entornos de produccion.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; su unica funcion es la clasificacion de audio.
- Capacidades multilingues no aplicables, ya que el modelo trabaja con senales de audio y no con texto.

## Casos de uso

- Clasificacion automatica de generos en bibliotecas musicales personales o corporativas: el modelo puede etiquetar miles de pistas de forma automatica, facilitando la organizacion y busqueda en colecciones extensas.
- Recomendacion musical basada en contenido: integrar el modelo en sistemas de recomendacion para clasificar nuevas canciones y sugerir listas de reproduccion segun el genero detectado.
- Moderacion de contenido en plataformas de streaming: detectar automaticamente el genero de las subidas de audio para aplicar politicas de curaduria o clasificacion por edades.
- Analisis de tendencias musicales: procesar grandes volumenes de audio de radio o redes sociales para identificar la distribucion de generos y su evolucion temporal.
- Investigacion en recuperacion de informacion musical (MIR): servir como punto de partida para experimentos de clasificacion de audio, comparando con otros modelos o como extractor de caracteristicas.
- Automatizacion de metadatos en estudios de grabacion: generar etiquetas de genero para archivos de audio en postproduccion, reduciendo el trabajo manual de los ingenieros de sonido.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion de GTZAN, segun el modelo-index de la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,9164 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada. La precision obtenida es consistente con la reportada por otros fine-tunes del mismo modelo base, aunque no se pueden verificar los resultados al no estar marcados como verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en precision FP32 (86M parametros x 4 bytes), lo que permite ejecutar el modelo en cualquier GPU con mas de 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien es viable su ejecucion en CPU con 8 GB de RAM.
- Compatibilidad con GPUs de consumo: si, es perfectamente compatible con tarjetas de gama media y baja.
- Opciones de despliegue: se puede utilizar directamente con el pipeline `audio-classification` de `transformers`, o exportarse a ONNX para inferencia en entornos de produccion. No se han documentado integraciones con vLLM, llama.cpp u Ollama, ya que estos estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, pero dado el tamano del modelo, se espera una latencia de pocos milisegundos por clip de audio en GPU.

## Comparativa con modelos similares

Existen otros fine-tunes del mismo modelo base en Hugging Face, aunque no se dispone de datos completos de rendimiento:

| Modelo | Parametros | Accuracy (GTZAN) | Licencia | Disponibilidad |
|---|---|---|---|---|
| LVanesa/ast-finetuned-gtzan (este modelo) | 86,2M | 0,9164 | BSD-3-Clause | Publico en HF |
| model-man/ast-finetuned-gtzan | No disponible | 0,89 | No disponible | Publico en HF |
| ramsri818/ast-finetuned-gtzan | No disponible | No disponible | No disponible | Publico en HF |

Tambien existen modelos basados en wav2vec2 para la misma tarea, como `wav2vec2-base-music-speech-classification-finetuned-gtzan` (licencia Apache-2.0), aunque no se aportan metricas en la informacion consultada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre el dataset GTZAN, que contiene 10 generos musicales occidentales. No reconocera otros generos (electronica, salsa, k-pop, etc.) y puede presentar sesgos hacia las caracteristicas acusticas de la musica occidental.
- La precision del 91,64 % se obtuvo en el conjunto de evaluacion de GTZAN, que es un dataset relativamente pequeno y con grabaciones de calidad variable. El rendimiento en audio real (con ruido, compresion, etc.) puede ser inferior.
- No se han documentado sesgos especificos, pero al ser un modelo de clasificacion, no genera texto y por tanto no presenta riesgo de alucinacion.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los terminos del dataset GTZAN, que puede tener restricciones de redistribucion.
- No se proporcionan detalles sobre la arquitectura interna del AST base (numero de capas, heads, etc.), por lo que la informacion tecnica es limitada.
- El modelo no soporta entrada de texto ni multimodalidad; solo procesa senales de audio de duracion fija (30 segundos en el entrenamiento).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LVanesa/ast-finetuned-gtzan
- Modelo base (AST pre-entrenado en AudioSet): https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Otros fine-tunes similares: https://huggingface.co/MdZakiAfzal/ast-finetuned-gtzan, https://huggingface.co/model-man/ast-finetuned-gtzan, https://huggingface.co/ramsri818/ast-finetuned-gtzan
