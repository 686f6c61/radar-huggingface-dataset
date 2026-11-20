# OpenVINO/LFM3-Omni-2B-int4-ov

## Resumen

LFM3-Omni-2B-int4-ov es la conversión a formato OpenVINO IR del modelo LiquidAI/LFM3-Omni-2B, un modelo multimodal any-to-any desarrollado por Liquid AI que acepta texto, imágenes, vídeo y audio como entrada, y produce texto, voz o una secuencia intercalada de texto y voz. Esta versión, publicada por el equipo de OpenVINO, aplica compresión INT4 weight-only al modelo de lenguaje para reducir el espacio en disco y acelerar la inferencia en CPU, manteniendo el resto de componentes (embeddings de texto, visión, codificador y decodificador de audio) en INT8 o FP16 según el componente.

El modelo base es un modelo "non-reasoning", es decir, no incorpora un modo de razonamiento explícito con cadena de pensamiento extendida, y está orientado a interacción multimodal en tiempo real. Con 2.000 millones de parámetros (según el nombre del checkpoint), está pensado para despliegue en entornos con recursos limitados, incluyendo CPU, lo que lo hace relevante para aplicaciones de asistentes de voz, transcripción, descripción de imágenes y generación de voz sin depender de GPU dedicadas.

La conversión incluye siete pares de ficheros XML/BIN (modelo de lenguaje, embeddings de texto, embeddings de visión, codificador de audio, embeddings de salida de audio, decodificador de profundidad y decodificador de audio), además de tokenizadores convertidos y ficheros de configuración. El repositorio ocupa 2,0 GB, lo que refleja la compresión INT4 aplicada al modelo de lenguaje. La licencia es LFM1.0 (lfm1.0), una licencia propia de Liquid AI con restricciones que deben revisarse antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + embeddings de texto, visión y audio + codificador/decodificador de audio); detalles de arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 2B (según nombre del checkpoint); desglose por componente no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (asimétrica, group size 64, ratio 1.0) en el modelo de lenguaje; INT8 en embeddings de texto, visión y componentes de audio; FP16/BF16 en constantes y embeddings de salida |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | OpenVINO IR (pares XML/BIN); repo con safetensors en tags; no se distribuyen pesos GGUF ni safetensors del modelo base en este repo |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo multimodal any-to-any que combina un modelo de lenguaje con codificadores y decodificadores especializados para visión y audio. La conversión a OpenVINO separa la inferencia en siete subgrafos: modelo de lenguaje, embeddings de texto, embeddings de visión, codificador de audio, embeddings de salida de audio, decodificador de profundidad y decodificador de audio. El modelo de lenguaje se comprime a INT4 weight-only con cuantización asimétrica, group size 64 y ratio 1.0, mientras que los embeddings de texto y visión y los componentes de audio usan INT8 por defecto del exportador. No se trata, por tanto, de un modelo íntegramente INT4.

La conversión se realizó con Python 3.12, PyTorch 2.10.0 (CPU), Transformers 5.20.0, una revisión concreta de Optimum Intel y una revisión de NNCF. El checkpoint de origen está fijado al commit `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67` de LiquidAI/LFM3-Omni-2B. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada; debe consultarse la model card del modelo base para esos detalles.

## Capacidades

- Generación de texto a partir de entradas de texto, imagen, vídeo o audio (pipeline any-to-any).
- Reconocimiento automático de voz (ASR): transcripción de audio mono float32 a 16 kHz.
- Síntesis de voz (TTS): generación de audio a 24 kHz, con voces configurables (p. ej. voz femenina en inglés americano).
- Salida intercalada de texto y voz: modo `INTERLEAVED` que produce simultáneamente texto y waveform.
- Procesamiento de imágenes RGB uint8 con forma `[1, height, width, 3]`, referenciadas como `<ov_genai_image_0>`.
- Procesamiento de vídeo mediante los argumentos `videos` y `videos_metadata` de OpenVINO GenAI.
- Modelo "non-reasoning": no incluye modo de razonamiento explícito extendido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (los ejemplos de la model card usan inglés).

## Casos de uso

- Transcripción de audio en tiempo real en CPU: el modelo acepta audio mono a 16 kHz y devuelve texto, por lo que puede integrarse en pipelines de subtitulado o actas de reuniones sin GPU dedicada, gracias a la compresión INT4 del modelo de lenguaje.
- Asistentes de voz conversacionales: combinando ASR y TTS en el mismo pipeline (`OmniPipeline`), se puede construir un asistente que escuche, responda en texto y sintetice voz a 24 kHz en una sola llamada.
- Descripción de imágenes para accesibilidad: el modelo acepta imágenes RGB y puede generar descripciones textuales, útil para lectores de pantalla o etiquetado automático de contenido.
- Análisis de vídeo con narración: usando los argumentos `videos` y `videos_metadata`, se puede resumir o narrar contenido audiovisual, con salida de texto o voz intercalada.
- Generación de audiolibros o locuciones: el modo TTS con `speech_only=True` y control de temperatura, penalización de repetición y semilla permite generar voz sintética reproducible para contenido editorial.
- Prototipado en entornos sin GPU: al ejecutarse con OpenVINO en CPU (`genai.OmniPipeline(model_dir, "CPU", ...)`), es adecuado para demos, pruebas de concepto y despliegues en portátiles o servidores sin acelerador.
- Moderación y enriquecimiento de contenido multimodal: el modelo puede procesar entradas de audio, imagen y texto en una misma conversación, lo que facilita clasificar o anotar contenido mixto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se distribuye para ejecución en CPU con OpenVINO; el repositorio ocupa 2,0 GB, por lo que se estima un consumo de memoria RAM en torno a 2-4 GB en función del runtime y de los buffers de activación (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada; la model card valida la inferencia en CPU con `ATTENTION_BACKEND="SDPA"`.
- ¿Cabe en GPU consumer? No se dispone de datos específicos; el tamaño del repositorio (2,0 GB) sugiere que cabría en GPUs consumer con al menos 4-6 GB de VRAM, pero no está confirmado.
- Opciones de despliegue: OpenVINO GenAI (`openvino-genai==2027.0.0.0.dev20261119`), con `openvino==2027.0.0.dev20261119` y `openvino-tokenizers==2027.0.0.0.dev20261119`; se requiere el stack nightly indicado y `ATTENTION_BACKEND="SDPA"` (no usar paged-attention para los ejemplos de voz).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-int4-ov (este) | 2B | no disponible | Texto, imagen, vídeo, audio (entrada); texto y voz (salida) | lfm1.0 | OpenVINO IR (INT4/INT8) |
| LiquidAI/LFM3-Omni-2B (base) | 2B | no disponible | Texto, imagen, vídeo, audio (entrada); texto y voz (salida) | lfm1.0 | safetensors (PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos any-to-any de tamaño similar en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantización INT4 se aplica solo al modelo de lenguaje; embeddings de texto y visión y componentes de audio usan INT8, por lo que el ahorro de memoria es parcial y el rendimiento puede diferir del modelo base en FP16/BF16.
- La model card advierte de no usar el backend de paged-attention con los ejemplos de voz; debe usarse `ATTENTION_BACKEND="SDPA"`.
- El audio de entrada debe ser mono, float32 y a 16 kHz; el audio de salida es a 24 kHz. Entradas con otras frecuencias o canales deben remuestrearse previamente.
- El modelo base es "non-reasoning": no incorpora cadena de pensamiento extendida, lo que puede limitar tareas de razonamiento complejo.
- Idiomas soportados no disponibles: los ejemplos de la model card usan inglés, por lo que el soporte multilingüe no está confirmado.
- Licencia lfm1.0: es una licencia propia con posibles restricciones de uso comercial; debe revisarse el enlace de licencia antes de desplegar en producción.
- No se han publicado benchmarks en la información disponible, por lo que no se puede validar su rendimiento frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse según el modelo base.
- Requiere un stack nightly concreto (OpenVINO 2027.0.0.dev20261119 y OpenVINO GenAI 2027.0.0.0.dev20261119); versiones distintas pueden no ser compatibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/OpenVINO/LFM3-Omni-2B-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Checkpoint de origen fijado: https://huggingface.co/LiquidAI/LFM3-Omni-2B/tree/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/LICENSE
- OpenVINO GenAI (repositorio): https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel (commit de conversión): https://github.com/huggingface/optimum-intel/commit/7995031fbf29285441ec7c222ef9afa80aaedbb2
- Wheels nightly de OpenVINO: https://storage.openvinotoolkit.org/simple/wheels/nightly
