# OpenVINO/LFM3-Omni-2B-int8-ov

## Resumen

LFM3-Omni-2B-int8-ov es la conversión a formato OpenVINO IR del modelo LiquidAI/LFM3-Omni-2B, un modelo multimodal any-to-any desarrollado por Liquid AI que acepta texto, imágenes, vídeo y audio como entrada, y produce texto, voz o una secuencia intercalada de texto y voz. Esta versión, publicada por el equipo de OpenVINO, aplica compresión de pesos INT8 (weight-only) para reducir el tamaño del repositorio a 2,6 GB y permitir la inferencia en CPU mediante OpenVINO GenAI.

El modelo base es un modelo de 2B parámetros (el dato exacto de parámetros no está disponible en la información proporcionada) con arquitectura no especificada en la model card de esta conversión; la model card remite a la ficha upstream de LiquidAI para detalles de entrenamiento y arquitectura. La conversión incluye siete pares XML/BIN correspondientes al modelo de lenguaje, embeddings de texto, embeddings de visión, codificador de audio, embeddings de salida de audio, decodificador de profundidad y decodificador de audio.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo omni (texto, visión, audio) en hardware de consumo sin GPU dedicada, usando el stack de OpenVINO GenAI en CPU. Está pensada para desarrolladores que necesitan prototipar pipelines de ASR, TTS o conversación multimodal en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal any-to-any; arquitectura del transformer base no especificada en la información proporcionada) |
| Parámetros totales | No disponible (el nombre indica 2B; cifra exacta no confirmada en la información) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 weight-only (asimétrica per-channel, group_size=-1, ratio=1.0) en el modelo de lenguaje; INT8 por defecto en embeddings de texto, visión y componentes de audio; activaciones no completamente INT8 |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | OpenVINO IR (pares XML/BIN), safetensors en el repo; compresión INT8 en pesos |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base. Se sabe que LFM3-Omni-2B es un modelo multimodal no razonador (non-reasoning) que procesa entradas de texto, imagen, vídeo y audio, y genera texto, voz o texto y voz intercalados. La conversión a OpenVINO separa el modelo en siete componentes neuronales: modelo de lenguaje, embeddings de texto, embeddings de visión, codificador de audio, embeddings de salida de audio, decodificador de profundidad y decodificador de audio. Esta separación es típica de pipelines omni con decodificadores de audio dedicados.

Sobre el entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no hay datos en la información proporcionada; la model card remite explícitamente a la ficha upstream de LiquidAI. La innovación técnica destacable de esta versión es la compresión INT8 weight-only con cuantización asimétrica per-channel en el modelo de lenguaje, junto con el soporte de OpenVINO GenAI para inferencia en CPU con backend de atención SDPA (no se debe usar el backend de paged-attention para los ejemplos de voz).

## Capacidades

- Generación de texto a partir de prompts de texto.
- Reconocimiento automático de voz (ASR): acepta audio de entrada mono float32 a 16 kHz.
- Síntesis de voz (TTS): genera audio de salida a 24 kHz.
- Salida intercalada de texto y voz (modo interleaved) o solo voz (modo speech_only).
- Procesamiento de imágenes: entrada RGB uint8 con forma [1, height, width, 3], referenciadas como `<ov_genai_image_0>`.
- Procesamiento de vídeo mediante los argumentos `videos` y `videos_metadata` de OpenVINO GenAI.
- Conversación multi-turno mediante `ChatHistory` (se recomienda crear un historial nuevo por petición independiente).
- Control de generación de voz: temperatura (cp_temperature), penalización de repetición (cp_repetition_penalty), máximo de tokens nuevos y semilla (rng_seed).
- No es un modelo de razonamiento (non-reasoning) según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de audio a texto (ASR) en CPU: el modelo acepta audio mono a 16 kHz y devuelve texto; es adecuado para entornos sin GPU donde se necesita transcripción puntual o por lotes pequeños, usando el pipeline `OmniPipeline` de OpenVINO GenAI.
- Síntesis de voz para asistentes: con salida a 24 kHz y control de temperatura y penalización de repetición, se puede generar voz para respuestas de un asistente conversacional, ajustando `max_new_tokens` para limitar la duración.
- Conversación multimodal con imágenes: el modelo acepta imágenes RGB y las referencia en el prompt, lo que permite construir interfaces de pregunta-respuesta sobre capturas o fotos en aplicaciones de escritorio con CPU.
- Generación de respuestas intercaladas texto y voz: útil para tutoriales, accesibilidad o contenidos educativos donde se desea que el texto y el audio se produzcan en una sola pasada.
- Procesamiento de vídeo con preguntas en lenguaje natural: mediante los argumentos `videos` y `videos_metadata`, se pueden construir prototipos de descripción o consulta sobre clips cortos.
- Prototipado rápido en portátiles y servidores sin GPU: al ser una conversión OpenVINO IR con compresión INT8 y un repo de 2,6 GB, permite validar pipelines omni antes de escalar a hardware mayor.
- Integración en aplicaciones de escritorio con OpenVINO: el stack `openvino-genai` permite empaquetar el modelo en aplicaciones Python 3.12 con dependencias fijadas (versiones nightly específicas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la conversión está orientada a CPU mediante OpenVINO GenAI.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de la model card usa el dispositivo "CPU".
- ¿Cabe en GPU de consumo? No hay datos; el tamaño del repo es de 2,6 GB, lo que sugiere que podría caber en GPUs con 4 GB o más de memoria, pero no está confirmado.
- Opciones de despliegue: OpenVINO GenAI (`openvino-genai`) con `OmniPipeline`; se requieren versiones nightly concretas: openvino 2027.0.0.dev20261119, openvino-tokenizers 2027.0.0.0.dev20261119, openvino-genai 2027.0.0.0.dev20261119, huggingface-hub 1.33.0, numpy 2.5.4 y soundfile. Backend de atención: SDPA (no usar paged-attention para los ejemplos de voz).
- Latencia y throughput estimados: no disponibles.
- Entorno de conversión: Python 3.12, PyTorch CPU 2.10.0, Transformers 5.20.0, Optimum Intel revisión 7995031fbf29285441ec7c222ef9afa80aaedbb2, NNCF revisión 0d605e5da7eb735aff96a14a3a771d84d90f88f8.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables.

## Limitaciones y advertencias

- Modelo no razonador (non-reasoning): no está diseñado para tareas de razonamiento complejo o multi-step reasoning.
- Sesgos conocidos: no disponibles en la información proporcionada; se remite a la ficha upstream de LiquidAI.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo genérico de los modelos generativos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.
- Restricciones de licencia: licencia lfm1.0 (license: other). Es necesario revisar el enlace de licencia upstream para condiciones de uso comercial; no se detallan en la información disponible.
- Dependencia de versiones nightly: la conversión se validó con versiones de desarrollo concretas de OpenVINO, openvino-tokenizers y openvino-genai; usar otras versiones puede romper la compatibilidad.
- Backend de atención restringido: no se debe seleccionar el backend de paged-attention para los ejemplos de voz; se debe usar `ATTENTION_BACKEND="SDPA"`.
- Formato de entrada de audio estricto: mono float32 a 16 kHz; audio con otra frecuencia o número de canales debe remuestrearse y convertirse antes de la inferencia.
- Formato de entrada de imagen: RGB uint8 con forma [1, height, width, 3].
- La cuantización es weight-only: las activaciones no están completamente cuantizadas a INT8, por lo que el ahorro de memoria y el rendimiento pueden diferir de una cuantización completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/LFM3-Omni-2B-int8-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Checkpoint fuente fijado: https://huggingface.co/LiquidAI/LFM3-Omni-2B/tree/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/LICENSE
- OpenVINO GenAI (repositorio): https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel (revisión usada en la conversión): https://github.com/huggingface/optimum-intel/commit/7995031fbf29285441ec7c222ef9afa80aaedbb2
- NNCF (revisión usada en la conversión): https://github.com/openvinotoolkit/nncf/commit/0d605e5da7eb735aff96a14a3a771d84d90f88f8
- Wheels nightly de OpenVINO: https://storage.openvinotoolkit.org/simple/wheels/nightly
