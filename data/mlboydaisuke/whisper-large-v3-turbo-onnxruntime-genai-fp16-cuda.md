# mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp16-cuda

## Resumen

Este repositorio contiene una exportación a ONNX Runtime GenAI del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo`, en precisión fp16 y configurado para ejecutarse sobre el execution provider CUDA. Lo publica el usuario mlboydaisuke (revision 41f01f3f del checkpoint original) y su propósito es ofrecer una versión lista para desplegar Whisper large-v3-turbo en Windows con GPU NVIDIA mediante la librería onnxruntime-genai, sin necesidad de convertir el modelo manualmente. El paquete incluye `encoder.onnx`, `decoder.onnx`, sus pesos, el `genai_config.json` con el execution provider CUDA, el tokenizador y la configuración del procesador de audio.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de exportación de un transformer encoder-decoder (Whisper large-v3-turbo, aproximadamente 809 millones de parámetros) a un runtime ONNX optimizado para GPU. Por otro, describe un fallo concreto del builder oficial de ONNX Runtime GenAI 0.19.0 al exportar Whisper large-v3-turbo: el grafo del encoder genera un par K/V de cross-attention por capa del encoder (32), mientras que el runtime espera uno por capa del decoder (4), lo que provoca un `IndexError`. El autor incluye un parche (`patch_genai_whisper.py`) que corrige el recuento de bucles y permite completar la exportación.

El modelo base, Whisper large-v3-turbo, es un modelo de reconocimiento de voz multilingüe de OpenAI, con una arquitectura transformer encoder-decoder y una ventana de audio de 30 segundos por segmento. Este repositorio no modifica los pesos: mantiene la precisión fp16 del checkpoint original y solo cambia el formato de serialización y el runtime de ejecución. La licencia declarada es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) exportado a ONNX Runtime GenAI |
| Parametros totales | aproximadamente 809 millones (modelo base Whisper large-v3-turbo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper procesa ventanas de audio de 30 s por segmento) |
| Tipos de cuantizacion | fp16 (sin cuantizacion adicional; el autor aclara que `base_model_relation: quantized` se refiere a la relacion del Hub, no a una cuantizacion real de pesos) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base es multilingue; se han medido en_us, cmn_hans_cn y ja_jp) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, pesos asociados, `genai_config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo, un transformer encoder-decoder diseñado para transcripción de audio. El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con cross-attention entre decoder y encoder. La variante "turbo" reduce el número de capas del decoder respecto a large-v3 (4 capas de decoder frente a 32 en la versión completa), lo que disminuye el coste de decodificación manteniendo el encoder grande. El repositorio no aporta información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo base de OpenAI y no se detallan en la información proporcionada.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el proceso de exportación. El builder de ONNX Runtime GenAI 0.19.0 (`builders/whisper.py`, clase WhisperEncoder) genera un par de salidas K/V de cross-attention por cada capa del encoder, construidas a partir de `decoder.layers[i]`, mientras que el runtime (`src/models/io/cross_kv_cache.cpp`) espera un par por capa del decoder. Como Whisper large-v3-turbo tiene 32 capas de encoder y 4 de decoder, la exportación falla con `IndexError: index 4 is out of range`. El parche `patch_genai_whisper.py` ajusta esos tres bucles para que cuenten capas del decoder, produciendo un par K/V por capa de decoder y permitiendo completar la exportación. El autor indica que las mismas líneas seguían sin corregir en la rama principal del builder en el commit 3d153d50de (2026-11-09).

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de hasta 30 segundos por segmento, con salida de texto.
- Transcripción multilingüe, heredada de Whisper large-v3-turbo; en las pruebas del autor se han evaluado inglés (en_us), chino mandarín (cmn_hans_cn) y japonés (ja_jp).
- Detección y uso del idioma indicado en el prompt (el autor ejecuta con el idioma proporcionado explícitamente).
- Decodificación greedy en el runner de referencia; no se documentan otras estrategias de decodificación en la información disponible.
- Ejecución acelerada por GPU mediante el execution provider CUDA de ONNX Runtime GenAI.
- No se documentan en la información proporcionada capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones de escritorio Windows: el paquete ONNX con execution provider CUDA permite integrar ASR en una app nativa sin depender de Python en producción, usando onnxruntime-genai directamente.
- Subtitulado automático de vídeo en pipelines locales: con un RTF medido de 0,0123 en una RTX 5080 Laptop, un minuto de audio se transcribe en aproximadamente 0,74 segundos, lo que hace viable procesar lotes de vídeos en una estación de trabajo.
- Asistentes de voz para atención al cliente en inglés, chino o japonés: el modelo base es multilingüe y las pruebas del autor cubren esos tres idiomas con WER/CER bajos, adecuados para transcripción de consultas.
- Indexación y búsqueda de contenido hablado: transcripción por lotes de archivos de audio para alimentar un motor de búsqueda o un sistema RAG sobre reuniones y grabaciones.
- Prototipado e investigación en ASR sobre Windows: el repositorio sirve como referencia reproducible de exportación ONNX de Whisper large-v3-turbo con el parche necesario, útil para equipos que quieran replicar el pipeline con onnxruntime-genai 0.19.0.
- Despliegue en portátiles con GPU consumer: al ocupar 1,8 GB en fp16 y ejecutarse en una RTX 5080 Laptop, encaja en equipos de gama alta portátiles para transcripción en tiempo real o casi real.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 150 clips de test de FLEURS (50 de en_us, 50 de cmn_hans_cn y 50 de ja_jp; 1806 segundos en total), con decodificación greedy, idioma indicado en el prompt y una ejecución tras un clip de calentamiento no cronometrado. RTF = tiempo de transcripción / tiempo de audio; "first token" = desde la apertura del clip hasta el primer token decodificado (incluye el encoder), media sobre los clips.

| Dispositivo | Execution provider | WER en | CER zh | CER ja | RTF | First token |
|---|---|---|---|---|---|---|
| RTX 5080 Laptop | CUDA | 5,22 % | 9,16 % | 3,79 % | 0,0123 | 81 ms |

Referencia del autor: transformers fp32 en CPU del mismo PC, 5,13 % / 9,11 % / 3,83 %. Además, 148 de las 150 respuestas coinciden con las de la exportación fp32 en CPU. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,8 GB en fp16, por lo que se puede estimar un consumo de memoria en el orden de 2-4 GB con overhead del runtime, aunque no se ha medido en la información proporcionada.
- GPU recomendadas: el autor ha medido en una NVIDIA GeForce RTX 5080 Laptop GPU con driver 591.74, CUDA 13 y cuDNN; no se documentan pruebas en A100, H100 ni otras GPU.
- Cabe en GPU consumer: sí, al menos en una RTX 5080 Laptop; no se confirma compatibilidad con GPU de gama media o baja en la información disponible.
- Opciones de despliegue: onnxruntime-genai 0.19.0 con onnxruntime-genai-cuda 0.19.0 y onnxruntime-gpu 1.31.1 (ruedas CUDA 13 y cuDNN), en Windows 11. El runner de referencia es `pc/run_asr_genai.py --model-dir <repo> --ep cuda` del repositorio john-rocky/windows-audio-zoo.
- Latencia y throughput: RTF 0,0123 y 81 ms hasta el primer token en la RTX 5080 Laptop, según la medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Whisper large-v3-turbo ONNX fp16 CUDA) | aprox. 809 M | ventanas de 30 s | WER en 5,22 %, CER zh 9,16 %, CER ja 3,79 %; RTF 0,0123 en RTX 5080 Laptop | MIT | Hugging Face, 0 descargas, 0 likes |
| openai/whisper-large-v3-turbo (transformers, fp32 CPU) | aprox. 809 M | ventanas de 30 s | WER en 5,13 %, CER zh 9,11 %, CER ja 3,83 % (referencia del autor) | MIT (modelo base) | Hugging Face |
| whisper-large-v3-turbo-onnxruntime-genai-fp32 (mismo autor) | aprox. 809 M | ventanas de 30 s | 148 de 150 respuestas idénticas al fp16 en CUDA | MIT | Hugging Face |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR (por ejemplo, variantes de Whisper large-v3 completa u otros sistemas ASR) más allá de las referencias internas del autor.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la información; no hay validación comunitaria independiente.
- La exportación depende de un parche manual (`patch_genai_whisper.py`) sobre el builder de ONNX Runtime GenAI 0.19.0; si se actualiza la librería, el parche puede dejar de aplicar o el problema puede haberse corregido de otra forma, por lo que conviene verificar la versión.
- El autor aclara que los pesos son fp16 del checkpoint, no cuantizados; la etiqueta `base_model_relation: quantized` del Hub no implica una cuantización real y puede inducir a error.
- Solo se han medido tres idiomas (en, zh, ja) y en una única GPU (RTX 5080 Laptop); el rendimiento en otras GPU, idiomas o dominios de audio no está documentado.
- Al ser un modelo ASR, puede cometer errores en audio con ruido, acentos no representados en la evaluación o vocabulario técnico; el WER del 5,22 % en inglés indica que no es perfecto.
- Riesgo de alucinación de texto en segmentos de silencio o audio ininteligible, comportamiento conocido en la familia Whisper; no se documenta mitigación específica en este repositorio.
- La licencia MIT se declara para el repositorio, pero conviene revisar la licencia del modelo base de OpenAI y las condiciones de uso de los pesos originales antes de un despliegue comercial.
- No se documentan sesgos específicos en la información proporcionada; los sesgos del modelo base no se han evaluado aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp16-cuda
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Exportación fp32 para CPU del mismo autor: https://huggingface.co/mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp32
- Parche del builder: https://github.com/john-rocky/windows-audio-zoo/blob/main/pc/patch_genai_whisper.py
- Repositorio con el runner y los resultados: https://github.com/john-rocky/windows-audio-zoo
