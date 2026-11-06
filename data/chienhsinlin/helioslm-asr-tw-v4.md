# chienhsinlin/helioslm-asr-tw-v4

## Resumen

HeliosLM ASR TW v4 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario chienhsinlin bajo el paraguas del proyecto HeliosLM. Se trata de un ajuste fino de openai/whisper-large-v3 orientado específicamente a dos variedades lingüísticas de Taiwán: el mandarín taiwanés con salida en chino tradicional y el hokkien taiwanés (台語) con salida en caracteres han. El modelo actúa como contraparte de voz del modelo conversacional helioslm-chat-e4b del mismo autor.

Con aproximadamente 1.543 millones de parámetros y la arquitectura encoder-decoder de Whisper large-v3, el modelo mantiene la ventana de audio de 30 segundos por fragmento del original y se distribuye en formato safetensors bajo licencia Apache-2.0. Su relevancia radica en la escasez de modelos abiertos que cubran el hokkien taiwanés con salida en caracteres han y en la mejora sustancial reportada sobre el modelo base en mandarín taiwanés (CER de 5,01 frente a 15,16 en Common Voice 27.0 zh-TW).

El ajuste se realizó con datos exclusivamente públicos (Common Voice 27.0, FLEURS y AISHELL-1) durante una única época, lo que lo convierte en un modelo ligero de reproducir y con trazabilidad completa del dataset. No obstante, el rendimiento en hokkien sigue siendo limitado y el propio autor lo advierte en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder) |
| Parametros totales | 1.543.490.560 (~1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio en fragmentos de 30 s (chunk_length_s=30); ventana de contexto del decoder: 448 tokens |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; compatible con cuantizacion estandar de transformers/GGUF via conversion externa) |
| Idiomas soportados | zh (mandarin taiwanes, salida en chino tradicional), nan (hokkien taiwanes, salida en caracteres han) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura completa de Whisper large-v3: un encoder transformer que procesa espectrogramas mel de 128 bandas y un decoder autorregresivo que genera tokens de texto con marcas temporales y de idioma. No se introducen modificaciones estructurales; el trabajo consiste íntegramente en un ajuste fino supervisado sobre el checkpoint base.

Los datos de entrenamiento son todos públicos: Mozilla Common Voice 27.0 en sus configuraciones zh-TW y nan-tw (CC0-1.0), con exclusión de las frases y hablantes de test para evitar contaminación; Google FLEURS cmn_hans_cn en train/dev (CC-BY-4.0), con transcripciones convertidas a chino tradicional mediante OpenCC; y un subconjunto de entrenamiento de AISHELL-1 (Apache-2.0). Se realizó una sola época con tasa de aprendizaje 7e-6 y 4.776 pasos. No se documenta uso de RLHF, DPO ni decodificación especulativa. La decodificación empleada en la evaluación es greedy.

## Capacidades

- Transcripción de voz a texto en mandarín taiwanés con salida en chino tradicional.
- Transcripción de hokkien taiwanés con salida exclusiva en caracteres han (sin romanización Tâi-lô).
- Detección y etiquetado de idioma heredado de Whisper (`language: zh` o `nan` en `generate_kwargs`).
- Marcas temporales a nivel de segmento heredadas del modelo base.
- Procesamiento de audio en fragmentos de 30 segundos mediante `chunk_length_s` del pipeline de transformers.
- Integración directa con la librería `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de contenido audiovisual en mandarín taiwanés: el modelo genera transcripciones en chino tradicional con un CER reportado del 5,01 % en Common Voice 27.0 zh-TW, adecuado para subtítulos que luego se revisan manualmente.
- Archivado y búsqueda de grabaciones en hokkien taiwanés: permite indexar audio histórico en caracteres han, aunque con un CER del 34,8 % que exige revisión humana en contenidos críticos.
- Transcripción de reuniones y entrevistas en entornos taiwaneses: el pipeline de transformers con `chunk_length_s=30` permite procesar audios largos por fragmentos sin reentrenamiento.
- Preprocesamiento para pipelines de NLP en chino tradicional: las transcripciones alimentan sistemas posteriores de resumen, análisis o traducción, evitando el paso manual de conversión de simplificado a tradicional.
- Investigación lingüística sobre variación dialectal: la disponibilidad de un modelo abierto entrenado con Common Voice nan-tw facilita experimentos reproducibles sobre hokkien escrito en han.
- Integración en asistentes de voz locales: al ser un modelo de 1,55B parámetros con licencia Apache-2.0, puede desplegarse en infraestructura propia como componente ASR de un asistente conversacional junto a helioslm-chat-e4b.
- Evaluación comparativa de ASR para variedades minorizadas: sirve como línea base pública para medir mejoras en hokkien taiwanés frente a Whisper large-v3.

## Benchmarks y rendimiento

Datos autoevaluados por el autor (2026-11-04), decodificación greedy, mismos clips para todos los modelos. CER en porcentaje, menor es mejor.

| Conjunto de test | Clips | HeliosLM ASR TW v4 | whisper-large-v3 (base) |
|---|---|---|---|
| Common Voice 27.0 zh-TW test | 998 | 5,01 | 15,16 |
| FLEURS cmn test (referencias en chino tradicional) | 945 | 7,62 | 7,54 |
| Common Voice 27.0 nan-tw test, caracteres han | 1.000 | 34,8 | no disponible |
| Common Voice 27.0 nan-tw test, transcripciones crudas (incluye romanización) | 1.000 | 85,57 | 120,65 |

En FLEURS el modelo base es ligeramente mejor (7,54 frente a 7,62). Las cifras del modelo base provienen de una ejecución anterior sobre los mismos clips.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 3,1 GB para los pesos más activaciones; el tamaño del repo es de 3,1 GB en safetensors.
- VRAM estimada en fp32: aproximadamente 6,2 GB.
- GPU recomendadas para producción: NVIDIA A100, H100 o L4 para despliegues con concurrencia; RTX 4090 y RTX 3090 sobradas para inferencia individual.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más en fp16 (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: pipeline de `transformers`, endpoints compatibles, y conversión a llama.cpp/whisper.cpp u ONNX para CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas objetivo | Licencia | CER zh-TW (CV 27.0) |
|---|---|---|---|---|---|
| HeliosLM ASR TW v4 | ~1,55B | 30 s por fragmento | zh (TW), nan | Apache-2.0 | 5,01 |
| openai/whisper-large-v3 | ~1,55B | 30 s por fragmento | multilingüe (99 idiomas) | Apache-2.0 | 15,16 |
| whisper-large-v3-turbo | ~809M | 30 s por fragmento | multilingüe | Apache-2.0 | no disponible |
| Modelos ASR específicos para hokkien taiwanés | no disponible | no disponible | nan | no disponible | no disponible |

La comparativa se limita al modelo base y a la variante turbo de Whisper por falta de datos publicados de alternativas específicas para hokkien taiwanés.

## Limitaciones y advertencias

- El hokkien taiwanés presenta un CER del 34,8 % en caracteres han, lo que lo hace poco fiable para transcripción automática sin revisión.
- El modelo no genera romanización Tâi-lô; solo produce caracteres han, lo que limita su uso en contextos donde se espera escritura romanizada.
- En FLEURS cmn el modelo base obtiene un CER ligeramente inferior (7,54 frente a 7,62), por lo que la mejora no es universal en mandarín.
- Riesgo de alucinación y de errores de reconocimiento inherente a los modelos Whisper, especialmente con audio ruidoso o acentos no representados en el entrenamiento.
- El ajuste se realizó con una única época y un dataset limitado a tres fuentes públicas; la cobertura de hablantes y dominios es acotada.
- Los benchmarks son autoevaluados por el autor y no han sido verificados de forma independiente.
- Licencia Apache-2.0 permite uso comercial, pero el modelo hereda las limitaciones del checkpoint base de Whisper.
- El autor advierte explícitamente de que el modelo puede cometer errores y que las transcripciones importantes deben verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v4
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Modelo conversacional asociado: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- AISHELL-1: https://www.openslr.org/33/
- OpenCC: https://github.com/BYVoid/OpenCC
