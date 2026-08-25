# qualcomm/Distil-Whisper

## Resumen

Distil-Whisper Small English es una versión destilada del modelo Whisper Small de OpenAI, optimizada por Qualcomm para ejecutarse de forma eficiente en dispositivos con hardware Snapdragon. El modelo está diseñado para reconocimiento automático del habla (ASR) en inglés, ofreciendo una alternativa más ligera y rápida que el Whisper original sin sacrificar una precisión significativa. Su relevancia actual radica en la creciente demanda de ASR en tiempo real en dispositivos móviles y edge, donde el consumo de recursos y la latencia son críticos.

La arquitectura es un transformer encoder-decoder, con un encoder de 166 millones de parámetros y un decoder de 211 millones, totalizando 377 millones de parámetros. El modelo acepta entradas de audio de hasta 30 segundos (80x3000 features) y genera secuencias de hasta 200 tokens. Qualcomm proporciona pesos pre-exportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegar en sus plataformas, así como herramientas para exportar configuraciones personalizadas mediante Qualcomm AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper destilado) |
| Parametros totales | 377M (encoder: 166M, decoder: 211M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (80x3000 features), max 200 tokens de salida |
| Tipos de cuantizacion | float (no se mencionan cuantizaciones int8 o int4 en la informacion disponible) |
| Idiomas soportados | Ingles (modelo "Small English") |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados); safetensors no mencionado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un encoder que procesa espectrogramas Mel de 80 canales y un decoder autoregresivo que genera los tokens de transcripcion. La destilacion se realizo a partir del checkpoint `distil-whisper/distil-small.en`, que es una version destilada de Whisper Small. El proceso de destilacion tipicamente implica entrenar al modelo estudiante para imitar las salidas del modelo profesor, reduciendo el numero de capas y parametros. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas como RLHF o DPO. La innovacion principal de esta version es la optimizacion especifica para hardware Qualcomm, con pesos pre-exportados y perfiles de rendimiento para diferentes chipsets.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, transcribiendo audio de hasta 30 segundos por pasada.
- Generacion de transcripciones con puntuacion y normalizacion basica (heredado de Whisper).
- Soporte para decodificacion autoregresiva con beam search o sampling (segun la implementacion de Distil-Whisper).
- No se menciona soporte para tool calling, agentes, vision, audio multilingue ni modos de razonamiento especiales.
- Capacidad de ejecucion en dispositivos moviles y edge gracias a la optimizacion de Qualcomm (NPU, CPU).

## Casos de uso

- Transcripcion de voz en tiempo real en aplicaciones moviles: el modelo puede ejecutarse en un Snapdragon 8 Gen 3 con una latencia de decoder de ~8.6 ms, permitiendo dictado continuo o subtitulado en vivo sin depender de la nube.
- Asistentes de voz en dispositivos IoT: gracias a su tamano reducido (332 MB encoder + 450 MB decoder en float) y soporte para TFLITE, puede integrarse en altavoces inteligentes o dispositivos de automocion (SA8295P, SA8650P) para comandos de voz locales.
- Accesibilidad en aplicaciones de escritorio y web: al ser un modelo MIT, puede integrarse en herramientas de transcripcion para reuniones, entrevistas o contenido multimedia, ejecutandose en portatiles con Snapdragon X Elite (latencia de decoder ~11 ms).
- Procesamiento de audio en vehiculos: los chipsets SA8255P y SA8295P estan soportados, permitiendo transcripcion de comandos del conductor o dictado de mensajes sin conexion.
- Automatizacion de subtitulos en produccion de video: el modelo puede procesar clips de hasta 30 segundos, ideal para generar subtitulos en ingles de forma local en estaciones de trabajo con hardware Qualcomm.
- Investigacion en ASR eficiente: al ser una version destilada y open source, sirve como punto de partida para experimentos de compresion, cuantizacion o fine-tuning en tareas especificas de habla inglesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento proporcionada es la latencia de inferencia del decoder en diferentes chipsets Qualcomm, que se resume a continuacion (tiempos en ms, runtime ONNX float):

| Chipset | Latencia decoder (ms) |
|---|---|
| Snapdragon X2 Elite | 5.245 |
| Snapdragon X Elite | 11.182 |
| Snapdragon 8 Gen 3 Mobile | 8.846 |
| Snapdragon 8 Gen 1 Mobile | 18.335 |
| Snapdragon 8 Elite Mobile | 7.24 |
| Snapdragon 8 Elite Gen 5 Mobile | 5.748 |
| Qualcomm Dragonwing IQ-8275 | 13.271 |
| Qualcomm Dragonwing QCS8550 (Proxy) | 11.87 |
| Qualcomm QCS8450 | 18.335 |
| Qualcomm Dragonwing IQ-9075 | 15.634 |
| Qualcomm Dragonwing IQ-X7181 | 11.182 |
| Qualcomm Dragonwing Q-8750 | 7.24 |

No se proporcionan metricas de WER, MMLU, HumanEval ni otros benchmarks estandar de ASR.

## Requisitos de hardware

- VRAM estimada: el modelo en float ocupa aproximadamente 782 MB (332 MB encoder + 450 MB decoder). Con overhead de runtime, se recomienda al menos 1 GB de memoria disponible.
- GPU recomendadas: no aplica directamente, ya que el modelo esta optimizado para NPU de Qualcomm. En GPU convencionales (NVIDIA, AMD) se puede ejecutar via ONNX Runtime, pero no hay datos de rendimiento.
- Compatibilidad con consumer GPU: no se ha validado en GPUs de escritorio; el modelo esta pensado para dispositivos con NPU Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub Workbench, ONNX Runtime, TFLite, y el paquete Python `qai_hub_models` para exportacion personalizada.
- Latencia y throughput: el decoder tarda entre 5.2 ms y 18.3 ms segun el chipset (ver tabla de rendimiento). El encoder no tiene datos de latencia publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Distil-Whisper Small (este) | 377M | 30 s audio | Ingles | MIT | ONNX, QNN_DLC, TFLITE |
| Whisper Small (original) | 244M | 30 s audio | Multilingue (99 idiomas) | MIT | PyTorch, safetensors |
| Distil-Whisper distil-large-v3 | 756M | 30 s audio | Ingles | MIT | PyTorch, safetensors |

La comparativa se basa en datos publicos de los modelos originales. Distil-Whisper Small es mas pequeno que distil-large-v3 y esta especificamente optimizado para hardware Qualcomm, mientras que Whisper Small es multilingue pero no esta optimizado para NPU de Qualcomm.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para transcripcion en otros idiomas.
- La ventana de audio esta limitada a 30 segundos; audios mas largos requieren segmentacion previa.
- No se han publicado metricas de calidad (WER) en la informacion disponible, por lo que no se puede verificar su precision frente a Whisper Small.
- Los pesos pre-exportados estan optimizados para chipsets Qualcomm; en otras plataformas (GPU NVIDIA, CPU x86) el rendimiento puede ser inferior o requerir conversion adicional.
- La licencia MIT permite uso comercial, pero el nombre "Distil-Whisper" puede estar sujeto a marcas de OpenAI o Hugging Face; se recomienda verificar.
- No se mencionan sesgos especificos, pero al ser un modelo de ASR entrenado en ingles, puede tener un rendimiento inferior con acentos no nativos o ruido de fondo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/Distil-Whisper)
- [Pagina del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/distil_whisper)
- [Repositorio de Qualcomm AI Hub Models (GitHub)](https://github.com/qualcomm/ai-hub-models)
- [Implementacion original de Distil-Whisper (GitHub)](https://github.com/huggingface/distil-whisper)
- [Arxiv del paper de Distil-Whisper (2311.00430)](https://arxiv.org/abs/2311.00430)
