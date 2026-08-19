# bschooled/caeleste-speech-higgs-audio-v3-stt-nf4

## Resumen

`bschooled/caeleste-speech-higgs-audio-v3-stt-nf4` es una cuantización de 4 bits en formato NF4 (bitsandbytes) del modelo de reconocimiento de voz a texto (STT) `bosonai/higgs-audio-v3-stt`, desarrollado por Boson AI. El modelo original combina un encoder basado en Whisper-large-v3 con un decoder Qwen3, y está diseñado para transcripción de voz, detección de idioma y comprensión semántica del habla. La cuantización reduce el tamaño de los pesos de 5.00 GiB a 2.61 GiB, lo que permite ejecutar el modelo en hardware con recursos limitados sin necesidad de infraestructura dedicada.

Esta versión cuantizada mantiene la arquitectura y los vocabularios originales, solo reemplaza los tensores de peso por sus equivalentes NF4 y añade un bloque `quantization_config` al `config.json`. El resultado es un modelo de STT eficiente y portátil, apto para despliegues en producción en entornos con restricciones de memoria o GPU de gama media. Aunque no se han publicado benchmarks específicos para esta cuantización, el modelo original supera a Whisper-large-v3 en idiomas clave según el blog de Boson AI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-large-v3 + decoder Qwen3 |
| Parametros totales | 2.675.546.112 (aprox. 2.68B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes), double quantization, bf16 compute |
| Idiomas soportados | 94 idiomas (segun el blog de Boson AI para el modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo original `higgs-audio-v3-stt` de Boson AI usa una arquitectura híbrida que combina un encoder de Whisper-large-v3 para extraer características acústicas y un decoder basado en Qwen3 para generar texto. Esta combinación permite aprovechar la robustez del encoder de Whisper en reconocimiento de voz y la capacidad lingüística del decoder Qwen3 para tareas de comprensión semántica y detección de idioma.

La cuantización NF4 aplicada en este repositorio utiliza bitsandbytes con double quantization y cómputo en bf16. Los tensores de pesos se reemplazan por sus equivalentes cuantizados, y se añade un bloque `quantization_config` al `config.json`. No se altera la arquitectura, el vocabulario ni los parámetros de generación originales. Los archivos de tokenizador, procesador y código remoto se copian sin cambios desde la revisión upstream `db4966839bef4b0967b43db893631107ebf828b9`.

No se dispone de información detallada sobre el entrenamiento del modelo original (datos, tokens, técnica de alineación, etc.) en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en 94 idiomas, con detección automática de idioma.
- Comprensión semántica del habla, incluyendo análisis de sentimiento y extracción de información contextual.
- Generación de texto a partir de audio con soporte de decodificación autoregresiva del decoder Qwen3.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.
- Compatible con `transformers` mediante `trust_remote_code=True`.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo puede convertir audio de reuniones en texto con detección de idioma automática, facilitando la generación de actas o notas de forma automática.
- Subtitulado de vídeo en múltiples idiomas: al soportar 94 idiomas, se puede usar para generar subtítulos en tiempo real o de forma offline en plataformas de vídeo.
- Asistentes de voz con comprensión semántica: el decoder Qwen3 permite extraer intenciones y entidades de la voz, lo que permite integrarlo en asistentes virtuales o sistemas de atención al cliente.
- Análisis de sentimiento en llamadas: el modelo puede transcribir y etiquetar emociones en conversaciones telefónicas, útil para centros de contacto y análisis de mercado.
- Transcripción médica o legal: con una licencia Apache-2.0, se puede integrar en sistemas de documentación clínica o legal que requieran un alto nivel de precisión.
- Accesibilidad: permite convertir voz a texto en tiempo real para personas con discapacidad auditiva, funcionando en hardware moderado gracias a la cuantización NF4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización NF4 en la información proporcionada. El blog de Boson AI indica que el modelo original `higgs-audio-v3-stt` supera a `whisper-v3-large` en idiomas clave, pero no se incluyen cifras concretas. Por tanto, no se pueden presentar tablas comparativas con valores numéricos.

## Requisitos de hardware

- VRAM estimada: el peso cuantizado ocupa 2.61 GiB, por lo que se recomienda al menos 4-6 GB de VRAM para inferencia con cargas de contexto estándar.
- GPU compatibles: NVIDIA con capacidad `sm_75` o superior (Turing, Ampere, Ada Lovelace) y AMD ROCm en RDNA3, RDNA3.5 o CDNA.
- Se puede ejecutar en GPUs de gama media como NVIDIA RTX 3060, RTX 4060, A2000, o incluso en GPUs de portátil con 6 GB de VRAM.
- Opciones de despliegue: mediante `transformers` con `trust_remote_code=True`. No se ha verificado soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles; depende del hardware y del contexto de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `bosonai/higgs-audio-v3-stt` | ≈ 2.68B | No disponible | Apache-2.0 | Safetensors | Modelo original sin cuantizar (5 GiB) |
| `bschooled/caeleste-speech-higgs-audio-v3-stt-nf4` | ≈ 2.68B | No disponible | Apache-2.0 | Safetensors NF4 | Cuantización 4-bit, 2.61 GiB |
| `whisper-large-v3` | 1.55B | 224 tokens | MIT | Safetensors | Modelo de referencia, sin decoder Qwen3 |

La comparación con `whisper-large-v3` es cualitativa: Higgs Audio v3 STT añade un decoder más potente y soporte de más idiomas, aunque no se dispone de datos numéricos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NF4 puede degradar ligeramente la precisión en comparación con la versión original en bf16, especialmente en entornos con ruido o acentos poco comunes.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código remoto del repositorio; se debe revisar el código antes de usarlo en producción.
- No se dispone de información sobre sesgos o comportamientos adversos del modelo. Se recomienda evaluar en el dominio específico antes de su despliegue.
- La licencia Apache-2.0 permite uso comercial, pero se deben mantener los avisos de copyright y atribución del upstream.
- El modelo está limitado a tareas de STT y no soporta entradas multimodales más allá del audio (no visión ni texto).
- No se ha validado el rendimiento en dispositivos móviles o CPUs; requiere acelerador GPU o ROCm para NF4.

## Enlaces

- Repositorio HuggingFace: [bschooled/caeleste-speech-higgs-audio-v3-stt-nf4](https://huggingface.co/bschooled/caeleste-speech-higgs-audio-v3-stt-nf4)
- Repositorio original: [bosonai/higgs-audio-v3-stt](https://huggingface.co/bosonai/higgs-audio-v3-stt)
- GitHub de Boson AI: [boson-ai/higgs-audio](https://github.com/boson-ai/higgs-audio)
- Blog de Boson AI sobre Higgs STT 3: [Boson AI launches Higgs STT 3](https://www.boson.ai/blog/higgs-stt-3)
- Colección de STT de Boson AI: [Higgs Audio STT Collection](https://huggingface.co/collections/bosonai/higgs-audio-stt)
