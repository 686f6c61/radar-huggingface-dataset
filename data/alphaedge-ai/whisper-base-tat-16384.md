# alphaedge-ai/whisper-base-tat-16384

## Resumen

whisper-base-tat-16384 es una variante podada (*trimmed*) de openai/whisper-base, publicada por alphaedge-ai, especializada en reconocimiento automatico del habla (ASR) para el idioma tatar (codigo ISO `tt`). La poda se ha realizado reduciendo el vocabulario del tokenizer de 51.865 a 16.384 tokens mediante la tecnica de *trimming* documentada por Hugging Face, lo que elimina los tokens poco frecuentes en tatar y conserva los relevantes para esa lengua. El resultado es un modelo un 25,02 % mas pequeno en parametros (54,4 M frente a 72,6 M) y con una huella de memoria notablemente inferior, manteniendo la arquitectura original de Whisper.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper base, con 6 capas en encoder y decoder, atencion estandar y una ventana de audio de 30 segundos procesada a 16 kHz. No incorpora innovaciones arquitectonicas propias: la unica modificacion respecto al original es la reduccion del vocabulario y, en consecuencia, de la matriz de embedding y de la proyeccion de salida del decoder.

Su relevancia es practica: ofrece una alternativa ligera y de licencia Apache 2.0 para transcribir audio en tatar, un idioma de bajos recursos con escasa cobertura en modelos ASR multilingues. El coste es que el modelo degrada su rendimiento en idiomas distintos del tatar, ya que los tokens eliminados del vocabulario ya no pueden generarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (Whisper estandar); contexto textual de 448 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas por el autor) |
| Idiomas soportados | tatar (`tt`); rendimiento degradado en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder transformer que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos a 16 kHz, y un decoder autoregresivo que genera tokens de texto condicionados por el encoder y por tokens especiales de idioma y tarea. El modelo original fue entrenado por OpenAI con 680.000 horas de audio debilmente supervisado y posteriormente afinado; esta variante no se ha reentrenado, sino que se ha derivado por poda del vocabulario.

El proceso de *trimming* consistio en analizar 27.911 textos del dataset lbourdois/fineweb-2-trimming en tatar para identificar los tokens efectivamente utilizados, y conservar un vocabulario de 16.384 entradas. La matriz de embedding del decoder y la proyeccion de salida se recortan a ese tamano, reduciendo el numero de parametros en un 25,02 %. No hay informacion sobre RLHF, DPO ni ajuste fino adicional especifico para tatar mas alla de la seleccion de vocabulario.

## Capacidades

- Transcripcion de voz a texto en tatar con audio de entrada a 16 kHz.
- Deteccion y uso de tokens especiales de idioma (`tatar`) y tarea (`transcribe`), tal como se muestra en el ejemplo de uso del autor.
- Procesamiento de audio en ventanas de hasta 30 segundos por inferencia (se puede encadenar para audio mas largo con *chunking*).
- Compatible con el pipeline `automatic-speech-recognition` de transformers.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidades multilingues limitadas: el vocabulario podado elimina tokens de otros idiomas, por lo que la transcripcion en lenguas distintas del tatar probablemente falle o produzca salidas degradadas.
- No incluye vision, audio generativo ni modo *thinking*.

## Casos de uso

- Transcripcion de reuniones y entrevistas en tatar: el modelo procesa fragmentos de 30 segundos y permite encadenar segmentos para audio largo, con una huella de memoria muy reducida que facilita el despliegue en servidores modestos.
- Subtitulado automatico de contenido audiovisual en tatar: al ser un modelo de 54 M de parametros, se puede ejecutar en CPU o GPU de gama baja para generar subtitulos en lotes sin coste elevado.
- Archivado y busqueda de audio historico en tatar: transcripcion masiva de grabaciones para indexacion textual, aprovechando la licencia Apache 2.0 para uso comercial.
- Asistentes de voz para hablantes de tatar: integracion como componente ASR en pipelines de voz a texto previos a un LLM, con latencia baja gracias al tamano reducido.
- Investigacion en lenguas de bajos recursos: punto de partida para experimentos de *trimming* y evaluacion de ASR en tatar, con un modelo base reproducible y de codigo abierto.
- Despliegue en el borde (*edge*): el modelo cabe en dispositivos con poca memoria (moviles, Raspberry Pi) si se convierte a ONNX o se cuantiza, algo viable por sus 54 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las estadisticas de reduccion (vocabulario de 51.865 a 16.384 tokens, 68,41 % de reduccion; parametros de 72.593.920 a 54.427.648, 25,02 % de reduccion) y afirma que el modelo podado "deberia comportarse de forma similar al original" en tatar, sin cifras de WER.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,5 GB en fp32 (54 M de parametros) incluyendo buffers de activacion; menos de 0,2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 no suponen cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 en adelante) e incluso en CPU para uso por lotes.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y previsiblemente vLLM no aplica (es ASR, no LLM); llama.cpp/Ollama no soportan Whisper de forma nativa; alternativas viables son ONNX Runtime o faster-whisper si se convierte el modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en decenas de milisegundos por ventana de 30 segundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-tat-16384 | 54,4 M | 30 s | tatar | Apache 2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | 30 s | multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s | multilingue | Apache 2.0 | Hugging Face |

Frente a openai/whisper-base, esta variante es un 25 % mas ligera y esta especializada en tatar, pero pierde cobertura multilingue. Frente a whisper-tiny es algo mayor en parametros pero conserva la calidad de la familia base. No se dispone de datos de WER comparativos para tatar en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Whisper base, hereda los sesgos del corpus de entrenamiento original de OpenAI.
- Riesgo de alucinacion: Whisper es propenso a generar texto plausible en segmentos con silencio o ruido; este riesgo persiste en la variante podada.
- Limitaciones de idioma: el vocabulario eliminado impide transcribir correctamente idiomas distintos del tatar; no debe usarse como modelo ASR general.
- Limitaciones de contexto: ventana fija de 30 segundos por inferencia; audio mas largo requiere segmentacion manual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datos de mineria (fineweb-2-trimming) si redistribuye derivados.
- Caveat de produccion: no hay benchmarks publicados de WER en tatar; conviene evaluar el modelo en un conjunto propio antes de desplegarlo. El numero de descargas (54) y likes (0) indica adopcion muy baja y poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-tat-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
