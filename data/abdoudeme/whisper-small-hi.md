# abdoudeme/whisper-small-hi

## Resumen

El modelo `abdoudeme/whisper-small-hi` es un ajuste fino (fine-tuning) de `openai/whisper-small` realizado por el usuario abdoudeme, orientado al reconocimiento automático de voz (ASR) en idioma hindi (hi). Se entrenó sobre el dataset Common Voice 11.0, aunque los resultados reportados en la model card indican un valor de WER (Word Error Rate) de 102,66, lo que sugiere que el modelo no logra transcribir correctamente el audio de evaluación. Este valor, superior a 100, indica que la salida del modelo no coincide en absoluto con la transcripción de referencia, lo que lo hace inviable para uso práctico en producción.

El modelo se basa en la arquitectura Transformer encoder-decoder de Whisper-small, con aproximadamente 241,7 millones de parámetros. El entrenamiento se realizó con solo 50 pasos, una tasa de aprendizaje de 1e-5 y un lote de 16, lo que indica un ajuste muy superficial y probablemente insuficiente para adaptar el modelo al hindi. La licencia es Apache 2.0, lo que permite uso comercial, pero el rendimiento actual lo descalifica para cualquier aplicación real.

A pesar de su bajo rendimiento, este modelo puede servir como ejemplo de un ajuste fino fallido o como punto de partida para investigaciones sobre los efectos de un entrenamiento insuficiente en modelos de ASR. No se recomienda su uso en entornos de producción ni en proyectos que requieran transcripción fiable en hindi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (estándar Whisper-small) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper-small, un Transformer encoder-decoder con normalización previa (pre-norm) y atención de múltiples cabezas. El encoder procesa espectrogramas de Mel de 80 canales a partir de ventanas de 30 segundos de audio, mientras que el decoder genera texto autoregresivamente. Whisper-small fue entrenado originalmente por OpenAI con 680.000 horas de audio etiquetado de forma débil, pero este ajuste fino se realizó sobre el dataset Common Voice 11.0 en hindi, con solo 50 pasos de entrenamiento.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, un optimizador AdamW con betas (0,9, 0,999), un programador de tasa lineal con 500 pasos de calentamiento y precisión mixta nativa. El entrenamiento se detuvo en el paso 50, con una pérdida de validación de 3,1532 y un WER de 102,66. Este valor de WER, superior a 100, indica que el modelo no ha aprendido a transcribir el hindi y que su salida es completamente incorrecta en el conjunto de evaluación.

## Capacidades

- Reconocimiento automático de voz en hindi: el modelo está diseñado para transcribir audio en hindi, pero el WER de 102,66 indica que no produce transcripciones válidas.
- Generación de texto: al ser un modelo seq2seq, puede generar texto, pero sin una transcripción correcta, esta capacidad es inútil en la práctica.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso: es un modelo de ASR puro, sin capacidades adicionales.
- Multilingüismo: aunque Whisper-small soporta múltiples idiomas, este ajuste se centra exclusivamente en hindi y no se ha evaluado su rendimiento en otros idiomas.
- Sin modo de pensamiento ni visión: es exclusivamente audio-texto.

## Casos de uso

- Investigación académica sobre ajuste fino de ASR: el modelo puede utilizarse para estudiar los efectos de un entrenamiento insuficiente (50 pasos) en el rendimiento de Whisper-small, comparando con ajustes más completos.
- Pruebas de pipelines de entrenamiento: sirve como ejemplo de un experimento fallido para depurar flujos de trabajo de fine-tuning con Hugging Face Trainer.
- Benchmark de calidad de datasets: al evaluar el modelo en Common Voice 11.0, se puede analizar la dificultad del dataset hindi y la necesidad de más datos o épocas.
- Demostración de errores en ASR: útil para ilustrar qué ocurre cuando un modelo no converge, mostrando transcripciones completamente incorrectas.
- Base para reentrenamiento: los pesos pueden servir como punto de partida para un ajuste más extenso, aunque es preferible partir del modelo original de OpenAI.
- No recomendado para producción: cualquier caso de uso real (subtitulado, transcripción médica, atención al cliente) queda descartado por el WER inaceptable.

## Benchmarks y rendimiento

Según la model card, el autor declara los siguientes resultados en el conjunto de test de Common Voice 11.0 (configuración hindi):

| Metrica | Valor |
|---|---|
| WER (Word Error Rate) | 102,66 |
| Loss de validación | 3,1532 |

No se han publicado comparaciones con otros modelos en la información disponible. El valor de WER superior a 100 indica que el modelo no produce ninguna transcripción correcta, por lo que su rendimiento es peor que el de un modelo aleatorio.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 241 millones de parámetros, en FP16 requiere aproximadamente 0,5 GB de VRAM para inferencia, pero en FP32 necesitaría alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3060) puede ejecutar el modelo. También es posible en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: compatible con Hugging Face Transformers, así como con vLLM, llama.cpp y Ollama (si se convierte a GGUF).
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo pequeño, la inferencia en GPU es casi en tiempo real (menos de 1 segundo por audio de 30 segundos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (hindi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abdoudeme/whisper-small-hi | 241,7 M | 30 s | 102,66 | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible | MIT | Hugging Face |
| RecCode/whisper-small-hi | 241,7 M | 30 s | no disponible | Apache 2.0 | Hugging Face |

El modelo original de Whisper-small tiene un WER mucho más bajo en hindi (típicamente inferior a 20), aunque no se han publicado cifras exactas en la información disponible. El modelo de RecCode es otro ajuste fino similar, pero sin datos de rendimiento públicos. La comparación directa no es posible sin más datos.

## Limitaciones y advertencias

- Rendimiento inaceptable: el WER de 102,66 indica que el modelo no transcribe correctamente el hindi, produciendo salidas completamente erróneas.
- Entrenamiento insuficiente: con solo 50 pasos y una época parcial (0,08), el modelo no ha convergido y no ha aprendido las características del idioma.
- Posible sesgo del dataset: Common Voice 11.0 puede tener variaciones dialectales o ruido que el modelo no ha aprendido a manejar.
- Riesgo de alucinación: al no reconocer el audio, el modelo puede generar texto arbitrario, lo que es peligroso en aplicaciones que requieran precisión.
- Licencia Apache 2.0: permite uso comercial, pero el rendimiento actual hace que cualquier uso sea inútil.
- Sin garantías de soporte: el autor no ha proporcionado documentación adicional ni mantenimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/abdoudeme/whisper-small-hi)
- [Modelo base openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Model card de Whisper](https://github.com/openai/whisper/blob/main/model-card.md)
