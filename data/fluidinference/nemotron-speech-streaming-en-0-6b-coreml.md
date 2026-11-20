# FluidInference/nemotron-speech-streaming-en-0.6b-coreml

## Resumen

Nemotron Speech Streaming 0.6B - CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b` de NVIDIA, publicada por FluidInference. Su objetivo es permitir ASR en streaming en tiempo real sobre dispositivos Apple (iOS y macOS), aprovechando el Neural Engine y la GPU de los chips de la serie M y A. El modelo original emplea una arquitectura FastConformer con decodificador RNNT en modo streaming, con 0,6 mil millones de parámetros y una frecuencia de muestreo de 16 kHz.

La conversión incluye cuatro variantes de tamaño de chunk (1120 ms, 560 ms, 160 ms y 80 ms) que permiten ajustar el compromiso entre latencia y precisión. El encoder está cuantizado a int8 (~564 MB frente a ~2,2 GB en float32), mientras que preprocesador, decoder y joint se mantienen en float32 por su reducido tamaño. El repositorio ocupa 13,6 GB en total, incluyendo las cuatro variantes y sus artefactos compilados.

Es relevante porque traslada un modelo ASR de NVIDIA a un formato nativo de Apple listo para despliegue en aplicaciones, con resultados de WER bajos (1,99 % en LibriSpeech test-clean con chunks de 1120 ms) y velocidades de inferencia superiores a tiempo real (RTFx 9,6x en un M2). Está pensado para desarrolladores que necesitan transcripción en vivo en el ecosistema Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer RNNT (streaming) |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por chunks: 1120/560/160/80 ms) |
| Tipos de cuantizacion | int8 (encoder); float32 (preprocesador, decoder, joint) |
| Idiomas soportados | ingles (en) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | CoreML compilado (.mlmodelc) |
| Frecuencia de muestreo | 16 kHz |
| Caracteristicas mel | 128 bins |
| Vocabulario | 1024 tokens (blank index = 1024) |
| Decoder | LSTM de 2 capas, 640 unidades ocultas |
| Capas del encoder | 24 capas Conformer |
| Tamano del encoder (int8) | ~564 MB |
| Tamano del repo | 13,6 GB |

## Arquitectura y entrenamiento

El modelo base es un FastConformer RNNT en modo streaming de NVIDIA, con 24 capas Conformer en el encoder y un decoder LSTM de 2 capas con 640 unidades ocultas. La conversión a CoreML mantiene la estructura en cuatro submodelos: `preprocessor` (audio a espectrograma mel de 128 bins), `encoder` (mel más caché a representación codificada más nueva caché), `decoder` (token más estado LSTM a salida del decoder) y `joint` (encoder más decoder a logits). El encoder es el único componente cuantizado a int8, con una compresión de 3,9x respecto a float32 y un impacto en WER descrito como despreciable.

El pipeline de streaming utiliza cachés de atención y convolución para mantener el contexto entre chunks. Las formas de caché son `cache_channel [1, 24, 70, 1024]`, `cache_time [1, 24, 1024, 8]` y `cache_len [1]`. Cada variante define un número distinto de frames mel por chunk y un caché de pre-encodeo de 9 frames (90 ms) que sirve de puente entre límites de chunk. La fórmula de duración de chunk es `chunk_ms = chunk_mel_frames × 10 ms`. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO en el modelo de NVIDIA.

## Capacidades

- Reconocimiento automático del habla en inglés en modo streaming, con procesamiento incremental por chunks.
- Cuatro configuraciones de latencia: 1120 ms (máxima precisión), 560 ms (equilibrada), 160 ms (baja latencia) y 80 ms (experimental, ultra baja latencia).
- Decodificación RNNT greedy con emisión de tokens y actualización de estado del decoder frame a frame.
- Ejecución nativa en dispositivos Apple mediante CoreML, con soporte para Neural Engine y GPU.
- Inferencia en tiempo real con RTFx superior a 1x en todas las variantes probadas.
- Integración con la librería FluidAudio (Swift) para iOS y macOS.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio más allá del ASR, ni capacidades multilingües (solo inglés).

## Casos de uso

- Transcripción en vivo en aplicaciones iOS: integración mediante FluidAudio con la variante de 560 ms para subtitulado en tiempo real en apps de notas o accesibilidad, con WER del 2,12 % en LibriSpeech test-clean.
- Dictado por voz en macOS: uso de la variante de 1120 ms para máxima precisión en herramientas de escritura dictada, donde la latencia de ~1,1 s es aceptable.
- Asistentes de voz con respuesta rápida: la variante de 160 ms permite retroalimentación casi inmediata en interfaces conversacionales, a costa de un WER de ~10 %.
- Reuniones y transcripción de llamadas: procesamiento por chunks de 560 ms con RTFx de 8,5x en M2 permite transcribir flujos de audio de forma sostenida sin servicio en la nube.
- Subtitulado en directo para vídeo: la variante de 160 ms o 560 ms permite generar subtítulos con baja latencia en reproductores o apps de streaming en dispositivos Apple.
- Prototipado experimental de ASR de ultra baja latencia: la variante de 80 ms (RTFx 1,9x, WER ~60 %) sirve para explorar límites de latencia en investigación, no para producción.
- Procesamiento local con privacidad: al ejecutarse en el dispositivo, evita enviar audio a servidores externos, adecuado para aplicaciones sanitarias o corporativas con requisitos de confidencialidad.

## Benchmarks y rendimiento

Resultados en LibriSpeech test-clean, medidos en Apple M2 con FluidAudio:

| Variante | WER | RTFx | Archivos |
|---|---|---|---|
| 1120 ms | 1,99 % | 9,6x | 100 |
| 560 ms | 2,12 % | 8,5x | 100 |
| 160 ms | ~10 % | 3,5x | 20 |
| 80 ms | ~60 % | 1,9x | 20 |

Las variantes de 160 ms y 80 ms solo se probaron sobre 20 archivos. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval u otros no aplican a ASR).

## Requisitos de hardware

- Ejecución en dispositivos Apple con soporte CoreML (iPhone, iPad, Mac con chips de la serie M o A).
- Encoder int8 de ~564 MB; el conjunto de submodelos por variante ocupa aproximadamente 600 MB (encoder 564 MB + decoder 28 MB + joint 7 MB + preprocesador 1 MB).
- Benchmarks realizados en Apple M2; no se especifican requisitos mínimos de memoria ni modelos de iPhone compatibles.
- Cabe en dispositivos de consumo Apple; no está pensado para GPU NVIDIA ni para despliegue en servidores x86.
- Opciones de despliegue: CoreML nativo y la librería FluidAudio (Swift). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto generativo.
- Throughput medido: RTFx de 9,6x (1120 ms), 8,5x (560 ms), 3,5x (160 ms) y 1,9x (80 ms) en M2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | WER (LibriSpeech test-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron Speech Streaming 0.6B CoreML (1120 ms) | 0,6B | 1120 ms | 1,99 % | nvidia-open-model-license | CoreML |
| Nemotron Speech Streaming 0.6B CoreML (560 ms) | 0,6B | 560 ms | 2,12 % | nvidia-open-model-license | CoreML |
| nvidia/nemotron-speech-streaming-en-0.6b (original) | 0,6B | streaming | no disponible en la información | nvidia-open-model-license | no disponible |
| Otras alternativas ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables (por ejemplo, Whisper u otros ASR de tamaño similar) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La variante de 80 ms presenta un WER de ~60 %, lo que la hace inadecuada para producción; la de 160 ms (~10 %) solo se probó en 20 archivos.
- Los benchmarks se limitaron a LibriSpeech test-clean, un conjunto relativamente limpio; el rendimiento en audio ruidoso, acentos o dominios específicos no está documentado.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en condiciones de audio adversas.
- La licencia nvidia-open-model-license impone condiciones específicas para uso comercial; debe revisarse el acuerdo antes de desplegar en producto.
- Dependencia del ecosistema Apple y CoreML; no es portable a otras plataformas sin reconversión.
- El repositorio incluye un changelog con correcciones de encoders (encoder-v2) para el Neural Engine del M2; conviene usar las versiones corregidas.
- No se documentan sesgos específicos del modelo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/nemotron-speech-streaming-en-0.6b-coreml
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Librería FluidAudio: https://github.com/FluidInference/FluidAudio
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
