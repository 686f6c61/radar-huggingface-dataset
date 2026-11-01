# markkeung/distilhubert-finetuned-gtzan

## Resumen

Distilhubert-finetuned-gtzan es un modelo de clasificación de audio desarrollado por el usuario markkeung en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base ntu-spml/distilhubert, una versión destilada de HuBERT, sobre el dataset GTZAN, un conjunto de datos clásico de referencia para la clasificación de géneros musicales con 10 categorías (blues, clásica, country, disco, hiphop, jazz, metal, pop, reggae y rock).

El modelo resuelve el problema de categorizar automáticamente fragmentos de música por género a partir de su señal de audio cruda, sin necesidad de extraer características manuales como espectrogramas de MFCC. Utiliza la arquitectura HuBERT destilada, con aproximadamente 23,7 millones de parámetros, lo que lo hace notablemente ligero comparado con modelos de audio de mayor escala.

Su relevancia radica en servir como punto de partida compacto y eficiente para tareas de clasificación musical, con licencia Apache 2.0 que permite uso comercial. Es especialmente útil para desarrolladores que necesitan un clasificador de géneros con recursos hardware mínimos, ya que puede ejecutarse incluso en CPU o en GPUs de consumo. El modelo reporta una precisión del 87 % sobre el conjunto de evaluación de GTZAN, un resultado competitivo para un modelo de tan solo 23,7 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT destilado (transformer de audio auto-supervisado) con cabeza de clasificación |
| Parametros totales | 23.691.402 (aprox. 23,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; la entrada típica de HuBERT son clips de 30 s o menos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilHuBERT (ntu-spml/distilhubert), una destilación del modelo HuBERT de Facebook AI. HuBERT es un transformer de audio auto-supervisado que aprende representaciones de la señal de voz y sonido mediante predicción de unidades acústicas enmascaradas, similar al enfoque de BERT en texto. La versión destilada reduce drásticamente el número de parámetros (de unos 94-316 M en los HuBERT originales a unos 23,7 M aquí) manteniendo buena parte de la calidad de las representaciones. Para la clasificación, se añade una cabeza de clasificación sobre las representaciones del encoder.

El ajuste fino se realizó sobre el dataset GTZAN (marsyas/gtzan, config "all"), el benchmark estándar de clasificación de géneros musicales con 1.000 clips de 30 segundos. Los hiperparámetros publicados son: tasa de aprendizaje de 5e-05, batch size de 8 (entrenamiento y evaluación), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, planificador de tasa lineal con 100 pasos de calentamiento, 18 épocas, semilla 132 y entrenamiento en precisión mixta nativa (AMP). El entrenamiento usó PyTorch 2.11.0+cu130 y Transformers 5.21.0. No se ha documentado el uso de técnicas adicionales como RLHF o DPO (no aplicables a este tipo de tarea).

## Capacidades

- Clasificación de géneros musicales en 10 categorías del dataset GTZAN: blues, clásica, country, disco, hiphop, jazz, metal, pop, reggae y rock.
- Procesamiento directo de audio crudo (forma de onda) sin necesidad de extracción manual de características.
- Salida de probabilidades por clase mediante el pipeline `audio-classification` de la librería Transformers.
- Inferencia ligera gracias a su tamaño reducido (23,7 M de parámetros), apta para CPU y GPUs de consumo.
- No soporta generación de texto, razonamiento, código, ni tool calling: es un modelo de clasificación especializado.
- No dispone de capacidades de visión, audio generativo ni transcripción.

## Casos de uso

- Clasificación automática de bibliotecas musicales: etiquetar por género grandes catálogos de canciones o clips en plataformas de streaming, radios online o gestores de música personal, aprovechando que el modelo procesa la forma de onda directamente.
- Recomendación musical: usar la clase de género predicha (o las probabilidades de salida) como señal de entrada en sistemas de recomendación o generación de playlists automáticas.
- Moderación y organización de contenido en plataformas de audio: preclasificar pistas subidas por usuarios para enrutarlas a categorías o canales específicos antes de revisión humana.
- Análisis de tendencias musicales: procesar lotes de canciones nuevas para obtener estadísticas de distribución de géneros en catálogos, listas de éxitos o contenido de redes sociales.
- Prototipado y educación: servir como modelo base ligero para aprender fine-tuning de modelos de audio auto-supervisados, o como punto de partida para transferir a otras tareas de clasificación de audio con datasets propios.
- Integración en aplicaciones edge o móviles: dado su tamaño de 23,7 M de parámetros y su bajo consumo, puede desplegarse en entornos con recursos limitados para clasificación en tiempo casi real.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados por terceros):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Clasificación de audio | GTZAN (config "all") | train/eval | Accuracy | 0,87 |

Además, la model card reporta una pérdida de evaluación de 0,7829 en el mejor epoch (epoch 14). El registro de entrenamiento muestra una accuracy de validación estable entre 0,82 y 0,87 a lo largo de las 18 épocas, con el máximo alcanzado en el epoch 14.

No se han publicado comparaciones con otros modelos (por ejemplo, AST, MusicNN o HuBERT completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 23,7 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 95 MB de memoria; en FP16, unos 47 MB. La inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso GPUs integradas bastan con holgura.
- Cabe en GPUs de consumo sin problema, incluso en las más modestas, y también en CPU para cargas ligeras.
- Opciones de despliegue: librería Transformers de Hugging Face (pipeline `audio-classification`), compatible con Inference Endpoints de Hugging Face (el repositorio está marcado como `endpoints_compatible`). No hay evidencia de soporte directo en llama.cpp u Ollama al ser un modelo HuBERT y no un LLM.
- Latencia y throughput: no disponible; dado el tamaño del modelo, se espera latencia baja en GPU y aceptable en CPU para clips de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|
| markkeung/distilhubert-finetuned-gtzan | 23,7 M | Clasificación de género (GTZAN) | Apache 2.0 | Accuracy 0,87 declarada; muy ligero |
| ntu-spml/distilhubert (base) | 23,7 M | Modelo base auto-supervisado | Apache 2.0 | Sin cabeza de clasificación; requiere fine-tuning |
| MIT/ast-finetuned-audioset (Audio Spectrogram Transformer) | aprox. 86 M | Clasificación de audio general | no disponible | Basado en espectrogramas, mayor tamaño |

No se dispone de cifras de accuracy comparables publicadas por los autores en la información proporcionada, por lo que la comparación de rendimiento no puede cuantificarse aquí.

## Limitaciones y advertencias

- Sesgos conocidos: GTZAN es un dataset pequeño (1.000 clips) con grabaciones de calidad variable y desequilibrios de subgéneros; el modelo hereda esos sesgos y puede clasificar mal música que no encaje en los 10 géneros occidentales del dataset.
- Riesgo de sobreajuste: el registro de entrenamiento muestra pérdida de entrenamiento cercana a cero desde las primeras épocas mientras la pérdida de validación oscila (0,69-1,13), indicativo de memorización del conjunto de entrenamiento. La accuracy del 87 % está medida sobre el split "train" según el model-index, lo que exige precaución al interpretarla.
- La model card está generada automáticamente y carece de secciones de descripción, usos previstos y limitaciones ("More information needed"), por lo que no hay documentación del autor sobre preprocesamiento concreto de audio (frecuencia de muestreo, duración de entrada) ni sobre el split exacto de evaluación.
- Limitación de dominio: solo clasifica los 10 géneros de GTZAN; no es útil para otras taxonomías musicales, audio ambiental o voz sin reentrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del dataset GTZAN si se redistribuyen datos o derivados.
- Restricciones de idioma: no aplicable; es un modelo de audio, aunque las etiquetas de salida están en inglés.
- Para producción se recomienda evaluar el modelo sobre un split de test independiente antes de confiar en la métrica declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markkeung/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
