# litert-community/granite-speech-5.0-470m-turboctc

## Resumen

Granite Speech 5.0 TurboCTC es un modelo de reconocimiento automático de voz (ASR) en inglés desarrollado por IBM, con aproximadamente 470 millones de parámetros. Su arquitectura es un encoder conformer entrenado con Connectionist Temporal Classification (CTC) sobre objetivos BPE, lo que permite transcribir audio en una única pasada hacia delante sin necesidad de un decoder autoregresivo. Esta versión publicada por la comunidad `litert-community` es una conversión del modelo original a formato LiteRT (`.tflite`), pensada para su ejecución en dispositivos móviles y de escritorio mediante CPU.

El modelo resuelve el problema de la transcripción de voz en tiempo real en entornos con recursos limitados, ofreciendo una latencia muy baja y un consumo de memoria contenido. Su relevancia actual radica en la creciente demanda de ASR on-device que preserve la privacidad y funcione sin conexión. La conversión LiteRT mantiene una paridad exacta con el modelo fp32 de PyTorch en cuanto a transcripciones, y la variante int8 es determinista entre dispositivos, lo que facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder con CTC, 16 bloques, self-conditioning y block self-attention |
| Parametros totales | 470 millones (473 M según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio fijas de 5, 10 y 30 segundos (no aplica contexto de texto) |
| Tipos de cuantizacion | int8 dynamic-range (todos los lineales y convs pointwise) y fp16 (pesos fp16, computo float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-speech-5.0-470m-turboctc` es un encoder conformer de 16 bloques entrenado con CTC sobre un vocabulario BPE de 16.384 unidades. Realiza un submuestreo temporal de factor 8, reduciendo la tasa de frames de 100 Hz a 12,5 Hz, mediante apilado y salto de frames logmel+delta. La atención es block-local con ventanas de 128 frames (aproximadamente 2,56 segundos), lo que limita el coste computacional y permite el procesamiento en tiempo real. El entrenamiento se realizó con CTC, sin etapas de RLHF o DPO. La conversión LiteRT mantiene la misma arquitectura, pero elimina el decoder: la salida del encoder se procesa con un argmax en el grafo y el decodificado CTC se realiza en el host con unas pocas líneas de código.

## Capacidades

- Transcripcion de voz en ingles a texto, con salida de tokens BPE y logits.
- Procesamiento de audio de 16 kHz mono, con ventanas fijas de 5, 10 o 30 segundos.
- Funcionamiento exclusivo en CPU, sin dependencia de GPU, con latencias muy inferiores al tiempo real.
- Determinismo entre dispositivos en la variante int8: los logits son bit-idénticos entre Apple M4 Max y Galaxy S26.
- Salida de `ids` (argmax ya calculado en el grafo) y `logits` completos, lo que permite decodificados alternativos si se desea.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de ASR.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el modelo puede transcribir audios de hasta 30 segundos en un solo paso, con una latencia de unos 666 ms en un Galaxy S26, lo que permite una experiencia casi instantánea sin conexión.
- Subtitulado en vivo para videollamadas o streaming: al procesar ventanas de 5 o 10 segundos, se pueden generar subtítulos en tiempo real con un retraso mínimo, incluso en portátiles sin GPU.
- Asistentes de voz on-device: integrado en un asistente local, el modelo convierte comandos de voz en texto para su posterior procesamiento, preservando la privacidad al no enviar audio a la nube.
- Dictado en aplicaciones de productividad: los desarrolladores pueden incorporar transcripción de voz en editores de texto o correos electrónicos, aprovechando la baja latencia y el pequeño tamaño del modelo (518 MB en int8).
- Transcripcion de reuniones y entrevistas: con la estrategia de dividir audio largo en fragmentos y concatenar transcripciones, se pueden procesar grabaciones completas en dispositivos de escritorio.
- Accesibilidad: el modelo permite convertir voz en texto en tiempo real para personas con discapacidad auditiva o para interfaces de control por voz en entornos industriales, sin depender de servicios externos.

## Benchmarks y rendimiento

La model card de la conversión LiteRT reporta datos de paridad con el modelo fp32 de PyTorch sobre 20 clips de LibriSpeech dev-clean (2-30 segundos). No se han publicado resultados de benchmarks completos (MMLU, HumanEval, etc.) porque se trata de un modelo ASR, no de lenguaje general. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| WER en LibriSpeech dev-clean (con ventanas fijas) | 4,24 % |
| WER en LibriSpeech dev-clean (sin padding) | 3,79 % |
| Paridad int8 vs fp32 (transcripciones) | 20/20 exactas |
| Paridad fp16 vs fp32 (transcripciones) | 20/20 exactas |

Estos valores son una evidencia de paridad en un conjunto pequeño, no un benchmark ASR completo. Para la calidad de la tarea, se remite a la model card del modelo base.

## Requisitos de hardware

- Inferencia en CPU, sin necesidad de GPU. La VRAM no es relevante; el modelo se ejecuta en memoria compartida del sistema.
- Tamaño del archivo: 518 MB (int8) y 994 MB (fp16). El int8 es recomendado para dispositivos moviles.
- GPU recomendadas: no aplica, aunque puede ejecutarse en cualquier CPU con soporte XNNPACK (ARM, x86).
- Compatible con GPU de consumo (RTX 4090, etc.) solo si se usa el modelo base fp32 de PyTorch, no la version LiteRT.
- Opciones de despliegue: LiteRT (antes TFLite) mediante `ai_edge_litert` en Python, o `CompiledModel` en Android/iOS. Tambien se puede usar con llama.cpp u Ollama, pero no es el formato nativo.
- Latencias medidas (mediana de 20 ejecuciones, CPU):
  - Apple M4 Max (8 hilos): int8 49,6 ms (5 s), 88,3 ms (10 s), 238,8 ms (30 s); fp16 128,1 ms, 230,9 ms, 605,8 ms.
  - Galaxy S26 (SM-S942Q): int8 106,4 ms (5 s), 220,2 ms (10 s), 666,4 ms (30 s); tiempo de carga 2,6 s.
- El throughput es aproximadamente 126x tiempo real en M4 Max con int8.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos ASR compactos en la información proporcionada. La comparativa más relevante es con el modelo base fp32 de PyTorch, con el que mantiene paridad exacta en transcripciones. Otros modelos ASR de tamaño similar (por ejemplo, Whisper tiny o distil-whisper) no han sido evaluados en la misma configuración, por lo que no se pueden ofrecer cifras comparativas fiables. Se recomienda consultar benchmarks independientes para una comparación justa.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no hay capacidad multilingue.
- Las ventanas de audio fijas (5, 10, 30 s) requieren padding con ceros, lo que puede desplazar los límites de los bloques de atención y alterar ligeramente la transcripcion (en las pruebas, 1 de 20 clips cambio una palabra).
- Para audio de más de 30 segundos, es necesario dividir en fragmentos y concatenar, lo que puede introducir errores en los cortes.
- La variante fp16 es aproximadamente 3 veces más lenta que la int8 en CPU debido al repaqueteo de pesos de XNNPACK; se recomienda usar int8 en dispositivos.
- El delegate de GPU movil no compila el grafo (error `Failed to compile model`); el modelo está diseñado para CPU.
- No se han evaluado sesgos o riesgos de alucinacion especificos; al ser un modelo ASR, el riesgo principal es la transcripcion erronea de audio ambiguo o con ruido.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia del modelo base y sus restricciones adicionales.

## Enlaces

- Modelo LiteRT en HuggingFace: https://huggingface.co/litert-community/granite-speech-5.0-470m-turboctc
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Variante sin control (NC) del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Documentacion de IBM Granite Speech: https://www.ibm.com/granite/docs/models/speech
- Documentacion de Transformers para Granite Speech 5: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/granite_speech5.md
