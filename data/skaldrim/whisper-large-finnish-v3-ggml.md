# skaldrim/whisper-large-finnish-v3-ggml

## Resumen

`skaldrim/whisper-large-finnish-v3-ggml` es una conversión al formato GGML del modelo de reconocimiento automático de voz (ASR) `Finnish-NLP/whisper-large-finnish-v3`, un fine-tuning de OpenAI Whisper Large V3 especializado en finlandés. El autor de esta conversión, skaldrim, no ha entrenado ni modificado los pesos: únicamente ha transformado el checkpoint original de Hugging Face al formato que consume `whisper.cpp`, incluyendo una variante cuantizada a q5_0 pensada para ejecución en dispositivos móviles dentro de la aplicación Skaldrim.

El interés de esta publicación es práctico: permite ejecutar un modelo ASR de aproximadamente 1.550 millones de parámetros en local, sin dependencia de servicios en la nube, sobre CPU y con un tamaño de fichero que va desde los 3,09 GB del modelo en 16 bits hasta los 1,08 GB de la versión q5_0. Es relevante para desarrolladores que necesiten subtitulado o transcripción de audio en finlandés en entornos con recursos limitados o requisitos de privacidad.

La ficha se centra en las características del artefacto GGML y en las del modelo base subyacente, ya que el repositorio en sí no aporta documentación técnica adicional más allá de la tabla de ficheros y sus hashes SHA-256.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large V3) |
| Parámetros totales | aproximadamente 1.550 millones (heredado de Whisper Large V3; no confirmado explícitamente en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (característica estándar de Whisper; no especificada en la model card) |
| Tipos de cuantización | 16-bit (F16) y q5_0 |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`ggml-fi-whisper-large-finnish-v3.bin`, `ggml-fi-whisper-large-finnish-v3-q5_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large V3: un transformer encoder-decoder con atención multitarea entrenado originalmente por OpenAI para transcripción y traducción de voz. El fine-tuning para finlandés fue realizado por Finnish-NLP sobre una RTX 4080 durante 32.000 pasos, con batch size 8 y acumulación de gradiente 2. No se dispone de información sobre la composición exacta del dataset de fine-tuning en los materiales consultados.

La contribución de skaldrim se limita a la conversión de formato mediante `models/convert-h5-to-ggml.py` de whisper.cpp (generando el fichero de 16 bits) y a la cuantización posterior a q5_0 con `whisper-quantize` para la variante móvil. No hay reentrenamiento, destilación ni modificación de pesos. El modelo base reporta mejoras sustanciales frente a Whisper Large V3 original en finlandés: en Common Voice 11 el WER baja de 14,81 a 11,36 y el WER normalizado de 10,82 a 8,31; en FLEURS el WER normalizado pasa de 9,63 a un valor no especificado en el extracto consultado.

## Capacidades

- Transcripción de voz a texto en finlandés, con detección de actividad de voz implícita en el pipeline de Whisper.
- Segmentación automática de audio en ventanas de 30 segundos con marcas de tiempo.
- Ejecución totalmente local en CPU mediante `whisper.cpp`, sin necesidad de GPU ni conexión a red.
- Variante cuantizada q5_0 orientada a dispositivos móviles con menor huella de memoria.
- Soporte de la etiqueta de idioma `fi` para forzar el idioma de decodificación.
- No se documentan capacidades de traducción a otros idiomas, diarización de hablantes ni tool calling; el modelo es exclusivamente ASR.

## Casos de uso

- Subtitulado automático de vídeo en finlandés: el modelo genera transcripciones con marcas de tiempo que pueden exportarse a SRT o VTT, adecuado para creadores de contenido que trabajan con audio en finlandés y necesitan procesamiento por lotes sin coste por minuto.
- Transcripción de reuniones con privacidad: al ejecutarse en local con `whisper.cpp`, el audio no sale del dispositivo, lo que encaja en entornos corporativos o sanitarios con requisitos de confidencialidad.
- Accesibilidad en aplicaciones móviles: la variante q5_0 de 1,08 GB permite integrar subtitulado en tiempo casi real en teléfonos, como hace la aplicación Skaldrim, con un consumo de memoria contenido.
- Archivado y búsqueda de material audiovisual: transcripción masiva de archivos de audio en finlandés para indexación y búsqueda textual posterior, aprovechando la ejecución en CPU en servidores sin GPU.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética o sociolingüística finlandesa, con la ventaja de que el modelo base fue evaluado en Common Voice y FLEURS.
- Asistentes de voz embebidos: integración en dispositivos de borde (Raspberry Pi, mini-PC) que requieran reconocimiento de voz en finlandés sin depender de APIs externas.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo base `Finnish-NLP/whisper-large-finnish-v3` en la model card original, no a la conversión GGML. La conversión no altera los pesos de forma significativa más allá de la cuantización q5_0, cuyo impacto en WER no se ha publicado.

| Benchmark | Whisper Large V3 original | Finnish-NLP v3 (tras fine-tuning) |
|---|---|---|
| Common Voice 11 WER | 14,81 | 11,36 (a 14.000 pasos) |
| Common Voice 11 WER normalizado | 10,82 | 8,31 (a 14.000 pasos) |
| Common Voice 11 CER | 2,7 | 1,93 (a 14.000 pasos) |
| FLEURS WER | 12,04 | no disponible en el extracto |
| FLEURS WER normalizado | 9,63 | no disponible en el extracto |

No se han publicado resultados de benchmarks específicos para los ficheros GGML ni para la variante q5_0 en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero F16 ocupa 3,09 GB en disco y requiere aproximadamente esa cantidad de memoria al cargarse; la variante q5_0 ocupa 1,08 GB y reduce la huella de forma proporcional.
- GPU recomendadas: no es necesario GPU; `whisper.cpp` está optimizado para CPU. Con GPU, puede compilarse con soporte CUDA o Metal para acelerar la inferencia.
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM puede alojar la variante F16; la q5_0 cabe en GPUs integradas y en memoria compartida de móviles.
- Opciones de despliegue: `whisper.cpp` (formato nativo), y herramientas derivadas que consumen GGML como `whisper-cpp-python` o interfaces gráficas compatibles. No es compatible directamente con vLLM, TGI ni Ollama, que esperan otros formatos.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente del hardware y del número de hilos de CPU configurados.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| skaldrim/whisper-large-finnish-v3-ggml | ~1.550 M | fi | GGML | Apache 2.0 | 30 s por segmento |
| Finnish-NLP/whisper-large-finnish-v3 | ~1.550 M | fi | safetensors (Hugging Face) | Apache 2.0 | 30 s por segmento |
| openai/whisper-large-v3 | ~1.550 M | multilingüe (99 idiomas) | safetensors, GGML disponible en otros repos | Apache 2.0 | 30 s por segmento |

La diferencia principal frente al modelo base es el formato y el tamaño en disco; frente a Whisper Large V3 original, la especialización en finlandés conlleva un WER notablemente menor en ese idioma a costa de perder cobertura multilingüe.

## Limitaciones y advertencias

- Solo soporta finlandés; no debe esperarse un rendimiento aceptable en otros idiomas.
- La cuantización q5_0 puede degradar ligeramente la precisión de la transcripción respecto al fichero F16; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical; conviene aplicar detección de actividad de voz y filtros posteriores.
- Sesgos heredados del corpus de entrenamiento original y del fine-tuning, cuya composición no está documentada en los materiales consultados.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión declina responsabilidad sobre errores introducidos en el proceso; se recomienda validar los hashes SHA-256 publicados.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La fecha de creación indicada (2026-11-07) es posterior a la fecha habitual de consulta y debe tratarse con cautela.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/skaldrim/whisper-large-finnish-v3-ggml
- Modelo base: https://huggingface.co/Finnish-NLP/whisper-large-finnish-v3
- Model card del modelo base: https://huggingface.co/Finnish-NLP/whisper-large-finnish-v3/blob/main/README.md
- Repositorio de whisper.cpp: https://github.com/ggerganov/whisper.cpp
