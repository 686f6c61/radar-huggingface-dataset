# deepdml/whisper-tiny-es-mix-norm

## Resumen

`deepdml/whisper-tiny-es-mix-norm` es un modelo de reconocimiento automático de voz (ASR) en español, resultado de un fine-tuning de `openai/whisper-tiny` sobre una mezcla de seis datasets públicos de audio en castellano. Lo desarrolla David Jimenez (deepdml) y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

El modelo conserva la arquitectura original de Whisper Tiny (encoder-decoder transformer con 37,76 millones de parámetros) y está optimizado exclusivamente para la transcripción de audio en español. Su relevancia radica en que ofrece un rendimiento notablemente superior al Whisper Tiny original en esta lengua (WER 17,32 % frente a valores típicos de 30-40 % del modelo base sin ajustar), manteniendo un tamaño muy reducido que permite su ejecución en hardware modesto, incluso en CPU.

Al estar entrenado sobre una combinación de corpus variados (Common Voice, VoxPopuli, FLEURS, VoxForge, Multilingual LibriSpeech y el parlamento vasco), el modelo muestra cierta robustez frente a acentos y condiciones de grabación diversas. Es una opción práctica para aplicaciones de transcripción en español que requieran baja latencia y bajo consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper) |
| Tipos de cuantizacion | No disponible (compatible con cuantizacion estandar de Transformers, p. ej. int8, fp16) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Tiny: un transformer encoder-decoder con 4 capas en cada bloque, 6 cabezas de atención y dimensión oculta de 384. El encoder procesa mel-espectrogramas de ventanas de 30 segundos de audio, y el decoder genera el texto transcrito de forma autorregresiva. No incorpora innovaciones arquitectónicas adicionales; se trata de un fine-tuning supervisado estándar.

El entrenamiento se realizó sobre una mezcla de seis datasets públicos en español: Common Voice 26.0, Basque Parliament, VoxPopuli, FLEURS, VoxForge y Multilingual LibriSpeech. Se usaron 26.000 pasos de entrenamiento con batch de 128, learning rate de 1e-5, optimizador AdamW y scheduler lineal con warmup del 4 %. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es puramente de transcripción supervisada. El framework empleado fue Transformers 5.14.1 con PyTorch 2.6.0.

## Capacidades

- Transcripción de audio en español a texto, con soporte para puntuación básica y normalización de mayúsculas.
- Reconocimiento de voz robusto en múltiples acentos del español, gracias al entrenamiento sobre corpus variados (Common Voice, VoxPopuli, FLEURS, etc.).
- Manejo de audio de hasta 30 segundos por ventana, con posibilidad de procesar audios más largos mediante segmentación.
- Inferencia eficiente en CPU y GPU gracias a su reducido tamaño (37,7 M de parámetros).
- No soporta tool calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un modelo de ASR.
- No incluye capacidades de visión, audio de entrada multimodal ni modo de pensamiento explícito.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir grabaciones de audio de reuniones en español, generando actas textuales. Su ventana de 30 segundos permite procesar segmentos largos con solapamiento, y su bajo coste computacional lo hace viable para procesamiento por lotes en servidores modestos.
- Subtitulado automático de vídeo: integrable en pipelines de generación de subtítulos para contenido en español, tanto en directo como en diferido. El WER de 17,32 % es aceptable para subtítulos que luego se pueden corregir manualmente.
- Asistentes de voz y comandos por voz: al ser un modelo pequeño, puede desplegarse en dispositivos edge o en tiempo real para transcribir comandos de voz en español, con latencia baja.
- Transcripción de llamadas de atención al cliente: adecuado para registrar y analizar conversaciones telefónicas en español, con la ventaja de la licencia Apache 2.0 que permite uso comercial sin royalties.
- Accesibilidad: sirve para generar subtítulos en tiempo real para personas con discapacidad auditiva en entornos educativos o corporativos, ejecutable en hardware de bajo coste.
- Investigación lingüística y análisis de corpus: permite transcribir grandes volúmenes de audio en español para estudios de fonética, dialectología o minería de texto, gracias a su eficiencia y a la disponibilidad de los pesos en formato abierto.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la evaluación sobre Common Voice 17.0 (según el model-index de la model card):

| Metrica | Valor |
|---|---|
| WER (raw) | 17,32 % |
| CER (raw) | 6,48 % |
| Loss | 0,3069 |

No se han publicado comparaciones con otros modelos en la información disponible. Como referencia cualitativa, el Whisper Tiny original sin ajustar suele obtener WER superiores al 30 % en español, por lo que este fine-tuning representa una mejora sustancial. No obstante, estos datos provienen de una única evaluación y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (el modelo pesa ~151 MB en fp32). Con cuantización int8 o fp16, el uso de memoria es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También es viable en hardware integrado como Apple Silicon o Raspberry Pi 5 (con limitaciones de velocidad).
- Ejecución en CPU: factible, con latencias de unos pocos cientos de milisegundos por ventana de 30 segundos en un procesador moderno.
- Opciones de despliegue: compatible con Transformers (pipeline `automatic-speech-recognition`), así como con vLLM, llama.cpp, Ollama y TGI mediante conversión a formatos compatibles (GGUF, ONNX). No se han publicado archivos GGUF específicos en el repositorio.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se puede esperar un throughput de decenas de ventanas por segundo en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (es, Common Voice) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepdml/whisper-tiny-es-mix-norm | 37,7 M | 30 s | 17,32 % | Apache 2.0 | HuggingFace |
| openai/whisper-tiny (base) | 37,7 M | 30 s | ~30-40 % (estimado) | MIT | HuggingFace |
| openai/whisper-base | 74 M | 30 s | ~20-25 % (estimado) | MIT | HuggingFace |
| openai/whisper-small | 244 M | 30 s | ~10-15 % (estimado) | MIT | HuggingFace |

Los valores de WER para los modelos base son estimaciones cualitativas basadas en el comportamiento general de Whisper en español; no se dispone de datos oficiales comparables en la información proporcionada. El modelo de deepdml ofrece un equilibrio interesante entre tamaño reducido y rendimiento en español, superando claramente al Whisper Tiny original.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en español; no transcribe otros idiomas de forma fiable, aunque el tokenizador base de Whisper es multilingüe.
- El WER de 17,32 % se obtuvo sobre Common Voice 17.0, un dataset relativamente limpio. En audio con ruido de fondo, música o acentos muy marcados, el rendimiento puede degradarse significativamente.
- La ventana de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en los bordes de los segmentos si no se gestiona correctamente el solapamiento.
- No se han publicado evaluaciones sobre otros datasets (p. ej. FLEURS o VoxPopuli), por lo que la generalización a dominios específicos no está garantizada.
- El repositorio tiene un tamaño de 20,9 GB, inusualmente grande para un modelo de 37,7 M de parámetros; puede contener checkpoints intermedios o archivos adicionales que conviene revisar antes de descargar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datasets de entrenamiento (especialmente VoxForge y el parlamento vasco) para asegurar el cumplimiento de sus términos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepdml/whisper-tiny-es-mix-norm
- Modelo base (OpenAI Whisper Tiny): https://huggingface.co/openai/whisper-tiny
- Datasets de entrenamiento:
  - Common Voice 26.0: https://huggingface.co/datasets/deepdml/common_voice_26_0
  - Basque Parliament: https://huggingface.co/datasets/deepdml/basque_parliament_1
  - VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
  - FLEURS: https://huggingface.co/datasets/google/fleurs
  - VoxForge: https://huggingface.co/datasets/deepdml/voxforge
  - Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
