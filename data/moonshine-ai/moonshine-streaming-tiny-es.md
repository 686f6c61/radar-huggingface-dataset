# moonshine-ai/moonshine-streaming-tiny-es

## Resumen

Moonshine Streaming Tiny para español es un modelo de reconocimiento automático de voz (ASR) en streaming desarrollado por Useful Sensors bajo el nombre de Moonshine AI. Con 27 millones de parámetros, está diseñado para transcribir audio de forma incremental y de baja latencia en hardware de gama baja, como dispositivos embebidos o móviles. La arquitectura combina un frontend de audio de 50 Hz con un encoder Transformer de ventana deslizante, lo que permite procesar el audio en tramos cortos en lugar de esperar al final de la frase. Este modelo es la variante en español del modelo streaming tiny original, con un tokenizer específico de 12.288 entradas.

El modelo se entrena sobre un corpus masivo de aproximadamente 160.000 horas de audio en español pseudo-etiquetado por un modelo Whisper, complementado con 1.700 horas de habla leída con transcripciones humanas. Aunque la licencia es MIT y está orientado a uso en producción, los pseudo-etiquetas del corpus principal introducen errores heredados del profesor, como problemas con nombres propios, numerales y code-switching. La evaluación se centra en el word error rate (WER) sobre paneles de habla leída (FLEURS y Multilingual LibriSpeech), alcanzando un WER macro de 6.111 en una muestra de 400 frases.

La relevancia de este modelo radica en su capacidad para ejecutarse en tiempo real en dispositivos de bajo consumo, con un footprint mínimo y sin necesidad de conexión a la nube. Su arquitectura de streaming y su tamaño compacto lo hacen adecuado para aplicaciones como asistentes de voz, transcripción en vivo o control por comandos, donde la latencia y el consumo de recursos son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming: frontend de audio 50 Hz + encoder Transformer con ventanas deslizantes (6 capas, ancho 320, 8 cabezas) + decoder (6 capas, ancho 320, 8 cabezas con RoPE) |
| Parametros totales | 27.015.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el encoder usa ventanas deslizantes de 16 muestras, con lookahead de ~80 ms) |
| Tipos de cuantizacion | Float32 (safetensors), int8 (paquete .ort) |
| Idiomas soportados | Español |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers), .ort (ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Streaming: un frontend de audio extrae características a 50 Hz con normalización CMVN y compresión asinh, seguido de dos convoluciones causales con stride 2. El encoder es un Transformer de 6 capas con ancho 320 y 8 cabezas de atención, donde las ventanas deslizantes (16, 4) se aplican en las primeras y últimas dos capas, y (16, 0) en las intermedias, lo que proporciona aproximadamente 80 ms de lookahead. El decoder también tiene 6 capas, ancho 320 y 8 cabezas, con RoPE aplicada sobre 32 de las 40 dimensiones de cada cabeza, además de un adaptador con posiciones absolutas aprendidas.

El entrenamiento se realizó en dos fases: una primera con un corpus de audio español pseudo-etiquetado de ~160.000 horas, y una segunda con un conjunto de habla leída de ~1.700 horas transcrito por humanos (Multilingual LibriSpeech, Common Voice, LibriVox, VoxPopuli, FLEURS y OpenSLR). El checkpoint específico corresponde a la etapa C (read-speech mix) y se registró el 2026-08-24. No se aplicó RLHF ni DPO; el ajuste fino se basó en los datos de habla leída para mejorar la precisión en entornos controlados.

## Capacidades

- Reconocimiento de voz en streaming: transcribe audio en tiempo real, sin esperar a que termine la frase completa, gracias a su encoder de ventana deslizante.
- Baja latencia: el lookahead de ~80 ms permite responder casi instantáneamente, adecuado para interacciones de voz en directo.
- Ejecución en hardware edge: con 27M de parámetros, puede correr en CPU de dispositivos móviles, microcontroladores o navegadores mediante WebAssembly.
- Soporte de audio de 16 kHz: el frontend espera audio muestreado a 16 kHz y el processor lo empaqueta en frames de 80 muestras.
- Multilingüe limitado: solo español (aunque la familia Moonshine incluye modelos para otros idiomas, esta variante está fijada al español).
- No incluye capacidades de tool calling, visión ni agentes; es exclusivamente un modelo de ASR.

## Casos de uso

- Asistentes de voz en dispositivos de bajo consumo: el modelo puede ejecutarse en un móvil o un dispositivo IoT para activar comandos de voz sin conexión a internet, gracias a su tamaño reducido y su inferencia en streaming.
- Transcripción en vivo de reuniones o conferencias: su baja latencia permite generar subtítulos en tiempo real durante una videollamada o una presentación, con un WER de ~6% en habla leída.
- Control de accesibilidad: personas con discapacidad motriz pueden dictar textos o controlar el sistema operativo mediante voz, con respuesta inmediata y sin depender de la nube.
- Automatización de atención al cliente: en un call center, el modelo puede transcribir las llamadas en tiempo real para alimentar análisis de sentimiento o extracción de intenciones, sin necesidad de servidores potentes.
- Dispositivos domésticos inteligentes: para activar rutinas o responder a comandos de voz en altavoces o electrodomésticos, con el modelo integrado localmente para proteger la privacidad.
- Aplicaciones de dictado médico o legal: donde se requiere confidencialidad y baja latencia, el modelo puede transcribir dictados en español sin enviar audio a servidores externos.

## Benchmarks y rendimiento

Los resultados de evaluación se basan en una muestra de 400 frases con semilla fija, sobre paneles de habla leída (FLEURS y MLS en español). Se reporta el word error rate (WER) tras normalización de mayúsculas y puntuación.

| Panel | WER (checkpoint de entrenamiento) | WER (este repositorio) |
|---|---|---:|
| `fleurs_es` | 6.34 | 6.34 |
| `mls_es` | 5.89 | 5.50 |
| **Macro** | **6.111** | **5.919** |

La conversión a este repositorio fue validada por medición, no por inspección, y reproduce el mismo WER que el checkpoint original bajo la misma regla de parada (5.919). La versión cuantizada a int8 del paquete .ort alcanza un WER de 6.218, una diferencia de +0.299 respecto al float, dentro del ruido de una muestra de 400 clips.

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 27M parámetros, la inferencia en float32 requiere menos de 1 GB de memoria; la versión int8 aún menos (aproximadamente 0.2 GB).
- GPU recomendadas: puede ejecutarse en cualquier GPU moderna (por ejemplo, RTX 3060 o superior) o incluso en CPU; no requiere hardware dedicado.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de gama media e incluso en dispositivos con CPU ARM.
- Opciones de despliegue: compatible con Transformers (PyTorch), ONNX Runtime para la versión cuantizada, y se puede compilar a WebAssembly para navegadores. No se menciona soporte directo para vLLM o llama.cpp, aunque al ser un modelo de ASR, se espera usarlo con librerías específicas de audio.
- Latencia y throughput: al ser streaming, la latencia es de ~80 ms de lookahead por segmento; el throughput en CPU es suficiente para tiempo real en dispositivos de gama baja, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos ASR en la información proporcionada. Como referencia general, el modelo es comparable en tamaño a Whisper Tiny (39M parámetros) pero con arquitectura streaming, lo que reduce la latencia de forma significativa. Sin embargo, no se han publicado benchmarks comparativos en esta documentación.

| Modelo | Parámetros | Contexto | WER (español) | Licencia |
|---|---|---|---|---|
| Moonshine Streaming Tiny ES | 27M | Streaming | 5.919 (MLS) | MIT |
| Whisper Tiny | 39M | 30 s | No disponible | MIT |
| Whisper Base | 74M | 30 s | No disponible | MIT |

## Limitaciones y advertencias

- Los datos de entrenamiento son mayoritariamente pseudo-etiquetas generadas por un modelo Whisper, por lo que hereda sus errores en nombres propios, números y code-switching.
- El modelo se evaluó únicamente en habla leída (FLEURS y MLS), no en habla espontánea latinoamericana; su rendimiento en contextos conversacionales no está medido.
- Puede caer en bucles de repetición en clips cortos o ruidosos; se recomienda limitar `max_new_tokens` para mitigarlo.
- El encoder solo aplica ventanas deslizantes si se pasa `attention_mask`; sin ella, el modelo se comporta como uno no streaming, lo que degrada el rendimiento.
- La licencia MIT permite uso comercial, pero el usuario debe asumir los riesgos de los pseudo-etiquetas y la falta de validación humana en la mayor parte del corpus.
- El modelo solo soporta español; no hay soporte multilingüe en esta variante.
- No se proporcionan datos de rendimiento en otros dominios (acentos, ruido, música) más allá de los paneles de habla leída.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-es)
- [Modelo base streaming (inglés)](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny)
- [Modelo no streaming](https://huggingface.co/UsefulSensors/moonshine-tiny)
- [Demos en WebAssembly](https://www.moonshine.ai/)
- [Repositorio GitHub de Moonshine](https://github.com/moonshine-ai/moonshine)
- [Implementación en C++](https://github.com/moonshine-ai/moonshine/blob/main/core/moonshine-streaming-model.cpp)
