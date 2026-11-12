# davidpu/wa-voice-ggml

## Resumen

`davidpu/wa-voice-ggml` es una reproducción cuantizada a 8 bits (q8_0) en formato GGML del modelo de reconocimiento automático del habla `ivrit-ai/whisper-large-v3-turbo-ggml`, que a su vez deriva de la arquitectura Whisper large-v3-turbo de OpenAI. El autor, davidpu, se limita a aplicar `whisper-quantize` de whisper.cpp v1.9.5 sobre el fichero `ggml-model.bin` original, sin ningún tipo de reentrenamiento ni ajuste fino adicional. El resultado es un único fichero `ivrit-large-v3-turbo-q8_0.bin` pensado para inferencia en CPU con whisper.cpp.

El modelo resuelve el problema de transcribir audio en hebreo moderno con un coste computacional reducido: según la model card, emplea aproximadamente la mitad del tiempo y el 60 % de la memoria del fichero sin cuantizar, manteniendo el mismo texto en las pruebas del autor. Es relevante para quienes despliegan transcripción en hebreo en entornos sin GPU o con recursos limitados, ya que el formato GGML y la cuantización q8_0 permiten ejecutar un modelo de la familia Whisper large en hardware modesto.

La información pública es muy escasa: el repositorio tiene 0 descargas y 0 likes, ocupa 0,9 GB y no incluye resultados de benchmarks propios ni detalles sobre el proceso de entrenamiento del modelo base. Todo el crédito del modelo subyacente corresponde a ivrit.ai, y la licencia se mantiene en Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), empaquetado en GGML |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene del orden de 809 M de parametros; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | q8_0 (8 bits) |
| Idiomas soportados | he (hebreo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`ivrit-large-v3-turbo-q8_0.bin`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante large-v3-turbo: un transformer encoder-decoder que procesa espectrogramas de audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El modelo base `ivrit-ai/whisper-large-v3-turbo-ggml` fue ajustado por ivrit.ai para hebreo a partir de Whisper large-v3-turbo; no se dispone en la información proporcionada de detalles sobre el número de horas de audio, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La contribución de este repositorio es exclusivamente la cuantización: se aplicó `whisper-quantize` de whisper.cpp v1.9.5 sobre el fichero `ggml-model.bin` del modelo base para producir una versión q8_0. No se documentan innovaciones arquitectónicas adicionales, decodificación especulativa ni mecanismos de atención lineal. El autor declara que la salida de texto es idéntica a la del modelo sin cuantizar en sus clips de prueba.

## Capacidades

- Reconocimiento automático del habla (ASR) en hebreo moderno.
- Transcripción de audio a texto con marcas de tiempo a nivel de segmento (funcionalidad estándar de whisper.cpp, no documentada explícitamente en la model card).
- Ejecución en CPU mediante whisper.cpp, sin necesidad de GPU.
- Inferencia con menor huella de memoria y menor tiempo de cómputo que el fichero GGML sin cuantizar (aproximadamente la mitad de tiempo y el 60 % de memoria según el autor).
- No se documenta soporte de traducción, diarización de hablantes, tool calling ni modos de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas en hebreo en servidores sin GPU: el formato GGML y la cuantización q8_0 permiten ejecutar el modelo en CPU con un consumo de memoria reducido, adecuado para procesamiento por lotes de grabaciones largas.
- Subtitulado automático de vídeo en hebreo: whisper.cpp genera segmentos con marcas de tiempo que pueden exportarse a formatos de subtítulos en pipelines de postproducción.
- Archivado y búsqueda de contenido audiovisual: transcribir grandes volúmenes de audio en hebreo para indexar y permitir búsqueda textual sobre el archivo, aprovechando el menor coste computacional de la versión cuantizada.
- Asistentes de voz y atención al cliente en hebreo: integración como componente ASR en un pipeline con un LLM posterior, desplegado en infraestructura de CPU para reducir costes operativos.
- Herramientas de accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos de habla hebrea, en dispositivos con recursos limitados.
- Investigación lingüística y creación de corpus: transcripción masiva de material oral en hebreo para estudios académicos, donde el rendimiento en CPU y la licencia Apache-2.0 facilitan el uso institucional.
- Prototipado y evaluación local: al ser un único fichero GGML, permite probar rápidamente la calidad ASR en hebreo en un portátil antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una comparación cualitativa frente al fichero sin cuantizar: aproximadamente la mitad del tiempo de ejecución y el 60 % de la memoria, con el mismo texto en los clips de prueba del autor. No se aportan métricas WER, CER ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está pensado para CPU con whisper.cpp; el repositorio ocupa 0,9 GB y la cuantización q8_0 reduce la memoria respecto al fichero completo.
- GPU recomendadas: no documentadas; al ser un formato GGML, el uso previsto es CPU. Cualquier GPU con soporte de whisper.cpp podría emplearse, pero no se especifican modelos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: whisper.cpp (versión 1.9.5 o superior, la usada para cuantizar). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp, que no están orientados a Whisper.
- Latencia y throughput: no disponibles de forma absoluta; el autor indica una reducción de aproximadamente el 50 % en tiempo frente al modelo sin cuantizar en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| davidpu/wa-voice-ggml (este) | no disponible | no disponible | he | Apache-2.0 | GGML q8_0 | Cuantización q8_0 del modelo de ivrit.ai; 0,9 GB |
| ivrit-ai/whisper-large-v3-turbo-ggml | no disponible | no disponible | he | Apache-2.0 | GGML sin cuantizar | Modelo base; mayor memoria y tiempo de ejecución |
| openai/whisper-large-v3-turbo | ~809 M (dato externo, no confirmado en la información proporcionada) | no disponible | multilingüe | Apache-2.0 | safetensors, GGML y otros | Modelo original de OpenAI; no ajustado específicamente a hebreo |

No se dispone de datos de rendimiento comparativo (WER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está ajustado y documentado para hebreo (`he`); su uso en otros idiomas no está respaldado por la model card.
- Al ser una cuantización q8_0, puede existir una degradación mínima de calidad frente al modelo sin cuantizar, aunque el autor afirma que el texto es idéntico en sus pruebas; no se aportan métricas objetivas.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, solapamiento de hablantes o silencios largos; no se documenta mitigación específica.
- No se documentan sesgos conocidos del modelo base ni del ajuste en hebreo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y remite todo el crédito a ivrit.ai; conviene verificar las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (12 de noviembre de 2026), por lo que no cuenta con validación de la comunidad.
- No se documentan limitaciones de longitud de audio más allá de las propias de Whisper (procesamiento en ventanas de 30 s).
- El pipeline no está declarado en Hugging Face, lo que puede dificultar la integración automática con herramientas que dependen de ese metadato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/davidpu/wa-voice-ggml
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml
- ivrit.ai: https://www.ivrit.ai
- whisper.cpp: no disponible en la información proporcionada (el autor cita la versión v1.9.5 y la herramienta `whisper-quantize`)
- Paper de Whisper de OpenAI: no disponible en la información proporcionada
