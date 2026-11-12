# lorneluo/sherpa-onnx-x-asr-480ms-streaming-zipformer-transducer-zh-en-punct-int8-2026-06-05

## Resumen

El modelo `sherpa-onnx-x-asr-480ms-streaming-zipformer-transducer-zh-en-punct-int8-2026-06-05` es un espejo por fichero del tarball oficial publicado por el proyecto sherpa-onnx (k2-fsa) en su release de modelos ASR. Se trata de un sistema de reconocimiento automatico del habla (ASR) en streaming basado en la arquitectura Zipformer con un decoder de tipo transducer, entrenado para transcribir audio en chino y en ingles con puntuacion y en formato cuantizado int8. El autor del repositorio, lorneluo, lo publica sin modificaciones para permitir descargas por fichero individual, y lo utiliza KeyMic para distribuir los pesos.

La relevancia de este artefacto es practica: los modelos de sherpa-onnx se disenan para inferencia en produccion con un motor ONNX ligero y sin dependencias de frameworks pesados, lo que permite desplegar ASR en tiempo real en CPU y en dispositivos embebidos. El nombre indica una latencia de chunk de 480 ms, un compromiso habitual entre precision y retardo en reconocimiento en streaming.

No se dispone de informacion detallada sobre el numero de parametros, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; la ficha se limita a lo que puede inferirse del identificador del modelo, la model card y la documentacion publica de sherpa-onnx y X-ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con decoder transducer (streaming ASR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio en streaming, chunk de 480 ms) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | no disponible en el repositorio; el modelo original X-ASR se publica bajo Apache-2.0 segun la model card |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Etiquetas | onnx, region:us |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer, un encoder basado en transformer con atencion multi-escala y pooling jerarquico de resoluciones temporales, disenado especificamente para ASR en streaming. Se combina con un decoder de tipo transducer (RNN-T), que permite alineamiento monotono entre frames de audio y tokens de salida sin necesidad de segmentacion previa del audio. La variante "streaming" implica procesamiento por chunks; el identificador indica un chunk de 480 ms, tipico en despliegues de baja latencia.

El modelo integra puntuacion ("punct") y reconocimiento bilingue zh-en, lo que sugiere un entrenamiento conjunto sobre corpus de ambas lenguas con anotacion de puntuacion. La cuantizacion int8 reduce el peso y acelera la inferencia en CPU. No se dispone en la informacion proporcionada de datos sobre numero de tokens de audio de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado adicional.

## Capacidades

- Reconocimiento automatico del habla en streaming con latencia de chunk de 480 ms.
- Transcripcion bilingue chino-ingles en una misma sesion de audio.
- Generacion de puntuacion en la salida (puntuacion de frases).
- Inferencia via runtime ONNX, sin dependencia de PyTorch en produccion.
- Integracion con el ecosistema sherpa-onnx (k2-fsa) para despliegue en CPU y dispositivos embebidos.
- No se ha documentado soporte de tool calling, agentes, vision, audio de entrada distinto de voz ni modo de razonamiento extendido, por tratarse de un modelo especializado en ASR.

## Casos de uso

- Transcripcion en tiempo real de reuniones y videollamadas: el modelo procesa audio por chunks de 480 ms y devuelve texto con puntuacion, adecuado para subtitulado en vivo en entornos bilingues chino-ingles.
- Subtitulado automatico en directo: la baja latencia del chunk permite generar subtitulos con retardo inferior a un segundo, util para retransmisiones o eventos.
- Asistentes de voz en dispositivos embebidos: al ejecutarse sobre ONNX en CPU, puede integrarse en Raspberry Pi u otros dispositivos de recursos limitados para comandos de voz bilingues.
- Dictado y notas de voz: transcripcion de grabaciones cortas con puntuacion automatica, apropiada para aplicaciones de productividad que necesitan texto legible sin postprocesado.
- Atencion al cliente con analitica de llamadas: transcripcion de conversaciones telefonicas en chino e ingles para extraccion de intenciones y control de calidad.
- Pipelines de transcripcion por lotes en servidores sin GPU: la cuantizacion int8 y el runtime ONNX permiten procesar grandes volumenes de audio en infraestructura CPU.
- Investigacion en ASR en streaming: sirve como referencia reproducible para comparar variantes de Zipformer y estrategias de chunking en sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecucion en CPU; en GPU, el modelo int8 de 0,2 GB de repositorio cabe holgadamente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se especifican requisitos oficiales.
- GPU recomendadas: no disponible; el modelo esta pensado para inferencia ONNX en CPU, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo moderna puede alojarlo dado su tamano reducido, aunque el beneficio frente a CPU puede ser limitado en un modelo de este tamano.
- Opciones de despliegue: sherpa-onnx (runtime oficial), ONNX Runtime; no se ha documentado soporte nativo en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; el identificador del modelo sugiere una latencia de chunk de 480 ms, pero no se han publicado cifras de RTF ni de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (sherpa-onnx X-ASR zh-en 480 ms) | Zipformer transducer streaming | zh, en | int8 | no disponible (original Apache-2.0) | ONNX |
| Otras variantes sherpa-onnx Zipformer streaming | Zipformer transducer streaming | segun variante | int8 / float | Apache-2.0 (proyecto k2-fsa) | ONNX |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingue | float / int8 en runtime | MIT | PyTorch, ONNX, GGML |
| Wav2Vec 2.0 / HuBERT | Transformer encoder | multilingue (segun checkpoint) | float | varía por checkpoint | PyTorch |

La comparativa se limita a caracteristicas generales; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre chino e ingles; no se ha documentado soporte de otras lenguas.
- La licencia no aparece declarada en el repositorio de Hugging Face; aunque la model card indica que el modelo original X-ASR es Apache-2.0, conviene verificar los terminos antes de un uso comercial.
- Es un espejo no modificado de un tarball oficial; la integridad y actualizaciones dependen del release original de k2-fsa.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.
- La puntuacion automatica puede introducir errores en frases ambiguas o en audio con ruido.
- El rendimiento en acentos no estandar, audio telefónico de baja calidad o habla con code-switching intenso no esta documentado.
- Al ser un modelo de ASR, no admite instrucciones de texto, tool calling ni razonamiento; su uso esta restringido a transcripcion de voz.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lorneluo/sherpa-onnx-x-asr-480ms-streaming-zipformer-transducer-zh-en-punct-int8-2026-06-05
- Release oficial de modelos sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Modelo original X-ASR: https://github.com/Gilgamesh-J/X-ASR
- KeyMic: https://keymic.io
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
