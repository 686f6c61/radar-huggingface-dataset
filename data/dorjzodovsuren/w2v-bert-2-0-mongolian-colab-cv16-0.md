# Dorjzodovsuren/w2v-bert-2.0-mongolian-colab-CV16.0

## Resumen

Este modelo es un ajuste fino de `facebook/w2v-bert-2.0`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2-BERT, publicado por el usuario Dorjzodovsuren. El nombre sugiere que fue entrenado sobre el dataset Common Voice 16.0 para el idioma mongol, aunque la model card indica que el dataset de entrenamiento es desconocido. Con 605,7 millones de parámetros, el modelo pretende adaptar el ASR multilingüe de Meta al mongol, pero los resultados reportados por el propio autor muestran una tasa de error de palabra (WER) de 0,9781 y una pérdida de evaluación infinita, lo que indica un entrenamiento fallido o una evaluación degenerada. En la práctica, el modelo no es utilizable para transcripción fiable y debe considerarse como un experimento fallido o un artefacto incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-BERT (transformers) |
| Parametros totales | 605.730.676 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre indica mongol, pero no se confirma) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/w2v-bert-2.0`, una arquitectura que combina el encoder de wav2vec2 con una capa de atención BERT sobre características de audio, diseñada para ASR multilingüe. El ajuste fino se realizó con el Trainer de Hugging Face, con los siguientes hiperparámetros: learning rate 5e-05, batch de entrenamiento 4 (con acumulación de gradientes de 2, batch efectivo 8), optimizador AdamW, scheduler lineal con 500 pasos de warmup, 10 épocas y precisión mixta nativa. La pérdida de entrenamiento bajó de 6,27 a 4,09, pero la pérdida de validación se mantuvo en `inf` durante todo el proceso, y el WER se estabilizó en 0,9781 tras la época 4. Este comportamiento sugiere que el modelo no llegó a converger y que la evaluación produjo valores no finitos, probablemente por problemas de datos, tokenización o configuración del entrenamiento. No se documentan técnicas adicionales como aumentación de datos, decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en mongol, en teoría.
- Generación de transcripciones a partir de señales de audio, aunque con una calidad extremadamente baja (WER ~0,98, es decir, prácticamente todas las palabras son erróneas).
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto adicional.
- No hay evidencia de soporte multilingüe más allá del posible mongol.
- No se indica soporte para thinking mode, visión ni audio adicional.

## Casos de uso

Dado el rendimiento documentado (WER de 0,9781 y pérdida infinita), el modelo no es apto para ningún caso de uso práctico de transcripción. Sin embargo, se pueden enumerar escenarios hipotéticos si el modelo funcionara correctamente, aunque deben interpretarse como no recomendados:

- Transcripción de entrevistas o reuniones en mongol: requeriría un WER inferior a 0,2 para ser útil; este modelo no lo alcanza.
- Subtitulado automático de vídeo: necesitaría sincronización y precisión, imposible con este WER.
- Asistentes de voz en mongol: la latencia y la tasa de error lo descartan.
- Archivado y búsqueda de audio histórico: la transcripción errónea inutilizaría el índice.
- Entrenamiento de modelos de lenguaje a partir de audio: los datos transcritos con este modelo introducirían ruido masivo.
- Evaluación comparativa de técnicas de fine-tuning: puede servir como ejemplo de qué evitar en ajuste fino de ASR.

En resumen, no se recomienda su uso en producción ni en investigación seria. Es preferible partir del modelo base o de otros fine-tunings con mejor rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de entrenamiento con los siguientes valores de WER en evaluación:

| Epoca | Loss de validacion | WER |
|---|---|---|
| 1 | inf | 0,9969 |
| 2 | inf | 0,8990 |
| 3 | inf | 0,9802 |
| 4 | inf | 0,9781 |
| 5 | inf | 0,9781 |
| 6 | inf | 0,9781 |
| 7 | inf | 0,9781 |
| 8 | inf | 0,9781 |
| 9 | inf | 0,9781 |
| 10 | inf | 0,9781 |

La pérdida infinita indica un problema numérico o de datos en la evaluación. El WER final de 0,9781 significa que casi ninguna palabra se transcribe correctamente. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 605M parámetros en fp32 se necesitan ~2,4 GB solo de pesos; en fp16 ~1,2 GB. Sin cuantización, la inferencia puede realizarse en GPUs con al menos 4 GB de VRAM, pero el rendimiento es tan pobre que no merece la pena.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (RTX 2060 en adelante) puede ejecutarlo, pero no se recomienda su uso.
- No cabe en CPU de forma eficiente por el coste de la atención BERT sobre features de audio.
- Opciones de despliegue: vLLM no soporta este tipo de modelos ASR directamente; se puede usar el pipeline de Hugging Face `automatic-speech-recognition` con Transformers, o exportar a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles, pero al ser un modelo de 605M parámetros, en una RTX 4090 podría procesar audio en tiempo real o mejor; sin embargo, la salida es inútil.

## Comparativa con modelos similares

Existe un modelo casi idéntico publicado por otro usuario: `chainwu/w2v-bert-2.0-mongolian-colab-CV16.0`, que según su model card logra un WER de 0,3276 sobre Common Voice 16.0. Esta comparativa muestra la diferencia entre un fine-tuning bien ejecutado y uno fallido.

| Modelo | Parametros | WER (eval) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dorjzodovsuren/w2v-bert-2.0-mongolian-colab-CV16.0 | 605,7M | 0,9781 | MIT | Hugging Face |
| chainwu/w2v-bert-2.0-mongolian-colab-CV16.0 | 605,7M | 0,3276 | MIT | Hugging Face |
| facebook/w2v-bert-2.0 (base) | 605,7M | no disponible | MIT | Hugging Face |

El modelo base de Meta está diseñado para ASR multilingüe y probablemente tenga un WER mucho menor en mongol si se evalúa correctamente, aunque no se dispone de ese dato.

## Limitaciones y advertencias

- Rendimiento extremadamente deficiente: WER de 0,9781, lo que implica que prácticamente ninguna palabra se transcribe correctamente.
- La pérdida de evaluación infinita indica un problema grave en el proceso de entrenamiento o en la configuración de la evaluación; el modelo no ha convergido.
- No se dispone de información sobre el dataset de entrenamiento, aunque el nombre sugiere Common Voice 16.0; esto genera incertidumbre sobre la calidad y el idioma real de los datos.
- No se documentan sesgos específicos, pero al ser un modelo fallido, cualquier salida debe considerarse no fiable.
- Licencia MIT permite uso comercial, pero el modelo no es apto para ello.
- No se recomienda su uso en producción ni en investigación seria; si se necesita ASR en mongol, es preferible usar el modelo de `chainwu` o entrenar desde el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dorjzodovsuren/w2v-bert-2.0-mongolian-colab-CV16.0
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Modelo similar con mejor rendimiento: https://huggingface.co/chainwu/w2v-bert-2.0-mongolian-colab-CV16.0
- No se encontraron papers, blogs ni demos asociados a este modelo.
