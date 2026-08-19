# digiphyte/fluister-turbo-transformers

## Resumen

Fluister (turbo) es un modelo de reconocimiento automático de voz (ASR) desarrollado por DigiPhyte (Pty) Ltd, una empresa sudafricana. Se trata de un fine-tune del modelo `openai/whisper-large-v3-turbo` especializado en afrikáans e inglés sudafricano, incluyendo el code-switching (mezcla de ambos idiomas) habitual en el habla cotidiana de Sudáfrica. El nombre "Fluister" significa "susurrar" en afrikáans.

Esta versión concreta (`fluister-turbo-transformers`) es la serialización en formato Hugging Face Transformers (PyTorch) del mismo checkpoint que la versión CTranslate2 (`digiphyte/fluister-turbo`). Está pensada para quienes necesitan un checkpoint estándar de Whisper: conversión a Core ML / WhisperKit para dispositivos Apple, inferencia con `transformers` o fine-tuning adicional. El modelo tiene 808,9 millones de parámetros y se distribuye con pesos en fp16.

La relevancia de este modelo radica en que corrige fallos específicos del Whisper original con audio sudafricano: deletrea el afrikáans como neerlandés (p. ej., "gebou" en lugar de "gebouw") y degrada el inglés sudafricano. Fluister mejora estos aspectos manteniendo el mismo tamaño y arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (ventana de audio estandar de Whisper, 30 segundos) |
| Tipos de cuantizacion | fp16 (safetensors); version CTranslate2 disponible en repo hermano |
| Idiomas soportados | af (afrikáans), en (inglés, con variante sudafricana) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers/PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder con atención estándar y 808 millones de parámetros. El encoder procesa espectrogramas de Mel de 80 bandas y el decoder genera transcripciones de texto autoregresivamente. Whisper large-v3-turbo es una versión optimizada del large-v3 con menor latencia, y Fluister se fine-tunea sobre ella.

El entrenamiento se realizó sobre datos de habla sudafricana, incluyendo el dataset `andreoosthuizen/afrikaans-30s` (CC-BY-4.0) y los conjuntos NCHLT de afrikáans e inglés (CC-BY-3.0). El fine-tune fusiona los pesos resultantes en los pesos base del modelo original. No se han publicado detalles sobre el número de tokens de entrenamiento, el uso de RLHF/DPO o técnicas adicionales de regularización.

## Capacidades

- Transcripción de voz a texto en afrikáans e inglés (variante sudafricana).
- Manejo de code-switching afrikáans-inglés en una misma conversación, manteniendo la coherencia de ambos idiomas.
- Corrección de errores comunes del Whisper original con audio sudafricano: ortografía afrikáans correcta (no neerlandesa) y mejor precisión en inglés sudafricano.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- Posibilidad de conversión a Core ML / WhisperKit para inferencia en dispositivos Apple (iOS/macOS) mediante `whisperkittools`.
- Soporte de generación condicionada por idioma (`generate_kwargs={"language": "af"}` o `"en"`).

## Casos de uso

- Transcripción de consultas médicas en afrikáans: un estudio de fisioterapia puede transcribir entrevistas de admisión con pacientes que hablan afrikáans, obteniendo texto preciso con ortografía correcta (p. ej., "gebou" en lugar de "gebouw").
- Subtitulado automático de reuniones de empresa en inglés sudafricano: el modelo transcribe con precisión el acento local, mejorando la fiabilidad frente a Whisper estándar.
- Análisis de conversaciones mixtas afrikáans-inglés: en contextos de atención al cliente o investigación sociolingüística, el modelo mantiene intacto el code-switching, facilitando el análisis de interacciones bilingües reales.
- Asistente de dictado para hablantes de afrikáans: integrado en aplicaciones de productividad, permite dictar documentos, correos o notas en afrikáans sin necesidad de corrección manual posterior.
- Aplicaciones móviles de transcripción en Sudáfrica: gracias a la conversión a Core ML, puede ejecutarse en dispositivos iPhone y Mac de forma local, sin conexión, para grabar notas de voz o transcribir entrevistas.
- Archivado y búsqueda de contenido audiovisual en afrikáans: para emisoras de radio o productoras de vídeo, permite generar transcripciones indexables de programas en afrikáans o con mezcla de idiomas.

## Benchmarks y rendimiento

Según la model card, se evaluó en los conjuntos de prueba de lectura NCHLT:

| Conjunto | WER |
|---|---|
| Afrikáans (NCHLT read-speech) | 0.086 |
| Inglés (NCHLT read-speech) | 0.017 |

También se validó en audio real sudafricano: una entrevista de fisioterapia en afrikáans, una reunión de proyecto en inglés y una conversación con code-switching. Los resultados cualitativos indican una mejora sustancial frente al Whisper base en ortografía afrikáans y precisión del inglés sudafricano. No se han publicado comparaciones cuantitativas con otros modelos en estos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fp16 (1.6 GB), el modelo cabe en GPUs con al menos 4 GB de VRAM para secuencias cortas; se recomiendan 6-8 GB para mayor comodidad con lotes o audio largo.
- GPUs compatibles: cualquier GPU NVIDIA con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100, H100). También funciona en Apple Silicon (MPS) y CPU.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), pipeline de ASR, o la versión CTranslate2 / faster-whisper para servidores (repo `digiphyte/fluister-turbo`). Para Apple: conversión a Core ML con WhisperKit.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 808M parámetros, la latencia es similar a la de Whisper large-v3-turbo (aprox. 3-5x tiempo real en GPU moderna, según configuración).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fluister turbo (este) | 808M | No disponible (Whisper estándar) | af, en | MIT | safetensors, CT2 |
| openai/whisper-large-v3-turbo | 809M | 30 s audio | 99 idiomas | Apache-2.0 | safetensors, CT2 |
| openai/whisper-large-v3 | 1550M | 30 s audio | 99 idiomas | Apache-2.0 | safetensors, CT2 |

Fluister turbo ofrece una precisión superior en afrikáans y en inglés sudafricano frente a los modelos base de OpenAI, a costa de reducir el soporte multilingüe a dos idiomas. Su licencia MIT es más permisiva que la Apache-2.0 de los modelos originales, lo que facilita su integración en productos comerciales.

## Limitaciones y advertencias

- La detección automática de idioma puede fallar; se recomienda especificar el idioma explícitamente (`language="af"` o `"en"`).
- Nombres propios, números y términos técnicos o poco frecuentes pueden transcribirse incorrectamente.
- Los nombres de lugares y apellidos sudafricanos son un punto débil conocido que los autores aún están mejorando.
- El modelo no soporta otros idiomas más allá de afrikáans e inglés; para otros idiomas es necesario usar el Whisper base.
- La licencia MIT se aplica al modelo fine-tuneado, pero los datos de entrenamiento tienen licencias CC-BY-4.0 y CC-BY-3.0; se debe verificar el cumplimiento de atribución en productos derivados.
- No se han publicado resultados de robustez frente a ruido, acentos extremos o audio de baja calidad.

## Enlaces

- Repositorio Hugging Face (Transformers): https://huggingface.co/digiphyte/fluister-turbo-transformers
- Repositorio Hugging Face (CTranslate2): https://huggingface.co/digiphyte/fluister-turbo
- Herramienta de conversión a Core ML: https://github.com/argmaxinc/whisperkittools
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
