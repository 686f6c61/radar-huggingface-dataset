# Selbyggen/whisper-large-v3-icelandic-coreml

## Resumen

`Selbyggen/whisper-large-v3-icelandic-coreml` es una conversión de formato del modelo `Aalto-Speech-Synthesis/whisper-large-v3-Icelandic-finetuned-ct2`, un Whisper large-v3 ajustado para islandés, empaquetado en Core ML para su uso con WhisperKit en dispositivos Apple. No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original; el trabajo del autor consiste en leer los pesos publicados en formato CTranslate2 (`model.bin`), reconstruir un modelo `transformers` con la configuración de `openai/whisper-large-v3` (1259 tensores) y convertirlo a paquetes Core ML float16 para después cuantizar los pesos a int8 lineal simétrico por canal.

El resultado son dos componentes: un encoder de audio de 618 MB y un decoder de texto de 868 MB, unos 1,49 GB en total, con pesos de 8 bits y activaciones de 16 bits, compilados con `coremlcompiler` para ejecutarse en el Apple Neural Engine. El espectrograma mel se mantiene en float16 sin cambios. La relevancia actual del artefacto es práctica: permite transcripción local de islandés en Mac, iPhone y iPad sin conexión, y lo usa la aplicación Sagt bajo la etiqueta «Icelandic Accurate».

La arquitectura subyacente es la de Whisper large-v3 (transformer encoder-decoder con 1550 millones de parámetros, ventana de audio de 30 segundos), pero esta ficha describe el artefacto Core ML, no el modelo de entrenamiento original. La licencia es Apache 2.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder), convertido a Core ML para WhisperKit |
| Parametros totales | 1550 M (arquitectura Whisper large-v3; no se indica un recuento distinto en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (propia de Whisper); contexto de texto no disponible |
| Tipos de cuantizacion | Pesos int8 lineal simétrico por canal (8 bits), activaciones float16; espectrograma mel en float16; variante float16 también generada |
| Idiomas soportados | Islandés (`is`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes `.mlpackage` compilados con `coremlcompiler`); origen en CTranslate2 (`model.bin`), reconstruido como `transformers` |
| Tamano del artefacto | 1,49 GB (encoder 618 MB + decoder 868 MB) |
| Libreria de inferencia | WhisperKit (`whisperkit`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder con atención estándar que procesa espectrogramas mel de 30 segundos y genera tokens de texto de forma autorregresiva. El ajuste fino a islandés lo realizó Aalto-Speech-Synthesis, y la model card indica que el entrenamiento incluyó, entre otros, las particiones de entrenamiento de Althingi, Málrómur y Samrómur. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión de Selbyggen no modifica el comportamiento: se leyeron los pesos desde `model.bin`, se escribieron como modelo `transformers` con la configuración de `openai/whisper-large-v3` y se generaron paquetes Core ML float16 con `whisperkittools`; después se aplicó `coremltools.optimize.coreml.linear_quantize_weights` con cuantización lineal simétrica int8 por canal. Las comprobaciones reportadas incluyen los tests integrados de `whisperkittools` (PSNR de decoder 54,3, encoder 60,7, mel 67,5) y una comparación del decoder de 8 bits contra el modelo `transformers` sobre audio islandés real: mismo token top-1 en 8 de 8 posiciones y PSNR mediano de 43,0 en el Neural Engine. El tokenizer es el mismo que el de `openai/whisper-large-v3`.

## Capacidades

- Reconocimiento automático de voz (ASR) en islandés, con inferencia local en dispositivos Apple.
- Transcripción de audio de hasta 30 segundos por ventana, con segmentación para audio más largo.
- Ejecución en el Apple Neural Engine mediante WhisperKit, sin necesidad de GPU dedicada ni conexión a red.
- Generación de marcas de tiempo a nivel de segmento (las marcas a nivel de palabra no son fiables, ver limitaciones).
- Soporte de decodificación con opciones de idioma (`language: "is"`) a través de `DecodingOptions` de WhisperKit.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada más allá del propio ASR; no es un modelo de propósito general.

## Casos de uso

- Transcripción local en aplicaciones macOS, iOS e iPadOS: el paquete Core ML está pensado para integrarse con WhisperKit y ejecutarse en el Neural Engine, lo que permite transcribir audio sin enviar datos a la nube; es el escenario real de la app Sagt.
- Subtitulado y actas de reuniones en islandés: con marcas de tiempo por segmento, el modelo puede generar transcripciones sincronizadas de grabaciones largas divididas en ventanas de 30 segundos.
- Procesamiento de audio legislativo y parlamentario: el modelo rinde especialmente bien en Althingi (9,8 % WER en el conjunto de evaluación), por lo que encaja en flujos de digitalización de sesiones y discursos.
- Archivado y búsqueda de audio histórico: transcribir grabaciones en islandés para indexarlas y hacerlas consultables, aprovechando el bajo WER en Málrómur (6,1 %) y Samrómur (10,3 %).
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos de habla islandesa, ejecutándose en el propio dispositivo.
- Investigación lingüística y corpus: producción de transcripciones para análisis de habla islandesa, con la advertencia de que el modelo no genera puntuación ni mayúsculas y escribe los números como palabras.
- Aplicaciones de notas de voz: integrar el modelo en apps de dictado que requieran privacidad y funcionamiento offline en hardware Apple.

## Benchmarks y rendimiento

La model card reporta WER con WhisperKit en el Neural Engine, 75 clips por conjunto (45 para FLEURS, 8 discursos completos para Althingi long), misma normalización y mismo código para todos los modelos (noviembre de 2026):

| Conjunto | OpenAI large-v3 turbo | Este modelo, float16 | Este modelo, 8-bit |
|---|---:|---:|---:|
| Althingi | 36,6 % | 9,8 % | 9,8 % |
| Althingi, discursos completos | 36,5 % | 10,9 % | 11,0 % |
| FLEURS is | 26,1 % | 10,0 % | 9,1 % |
| Málrómur | 38,1 % | 6,1 % | 6,1 % |
| Samrómur | 19,3 % | 10,8 % | 10,3 % |

El propio autor advierte que el modelo se entrenó con las particiones de entrenamiento de Althingi, Málrómur y Samrómur (entre otros), por lo que tiene ventaja en esos conjuntos; FLEURS es independiente. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el artefacto está pensado para el Apple Neural Engine. El tamaño en disco es de unos 1,49 GB (encoder 618 MB + decoder 868 MB).
- Hardware recomendado: dispositivos Apple con Neural Engine (Mac con chip Apple Silicon, iPhone, iPad); es el requisito implícito de Core ML y WhisperKit.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este artefacto, que es específico de Core ML; para esas GPU habría que usar el modelo base en CTranslate2 o `transformers`.
- Cabe en hardware de consumo Apple: sí, al estar cuantizado a 8 bits y compilado para el Neural Engine.
- Opciones de despliegue: WhisperKit (vía `WhisperKit.download` con la variante `Aalto_whisper-large-v3-icelandic_8bit` y `WhisperKitConfig(modelFolder:)`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; solo se reportan métricas de calidad (PSNR y WER), no de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este modelo (Whisper large-v3 Icelandic Core ML) | 1550 M (arquitectura) | 30 s por ventana | Islandés | Apache 2.0 | Core ML / WhisperKit |
| Aalto-Speech-Synthesis/whisper-large-v3-Icelandic-finetuned-ct2 | 1550 M (arquitectura) | 30 s por ventana | Islandés | Apache 2.0 (según el modelo base) | CTranslate2 |
| OpenAI Whisper large-v3 turbo | no disponible en la información | 30 s por ventana | Multilingüe | no disponible en la información | no disponible en la información |

La comparación de rendimiento disponible es la de la tabla de benchmarks: frente a OpenAI large-v3 turbo, este modelo reduce el WER de 36,6 % a 9,8 % en Althingi y de 26,1 % a 9,1 % en FLEURS is (8 bits). No se dispone de datos de otros modelos ASR islandeses en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera puntuación ni mayúsculas y escribe los números como palabras, igual que sus datos de entrenamiento; la app Sagt añade una mayúscula y un punto por segmento, pero el modelo en bruto no lo hace.
- Las marcas de tiempo a nivel de palabra no son fiables: tras el ajuste fino, las cabezas de alineación de large-v3 ya no siguen el audio y, en clips cortos, las palabras pueden situarse en el relleno de la ventana de 30 segundos. Se recomienda usar marcas por segmento o comprobar que los tiempos caen dentro del audio.
- El modelo solo soporta islandés (`is`); no es multilingüe.
- Ventaja de evaluación: se entrenó con partes de Althingi, Málrómur y Samrómur, por lo que los WER de esos conjuntos no son una medida independiente; FLEURS sí lo es.
- Es una conversión de formato, no un modelo nuevo: los méritos y posibles sesgos corresponden al modelo original de Aalto-Speech-Synthesis.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; conviene verificar los términos del modelo base y de los datos de entrenamiento antes de un despliegue comercial.
- Riesgo de alucinación propio de los modelos Whisper en segmentos con silencio o ruido; no se documenta en la información disponible un mecanismo específico de mitigación.
- No apto para tareas de texto, código, matemáticas, visión o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/whisper-large-v3-icelandic-coreml
- Modelo base: https://huggingface.co/Aalto-Speech-Synthesis/whisper-large-v3-Icelandic-finetuned-ct2
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App Sagt: https://sagtapp.com/
- Configuración de referencia: https://huggingface.co/openai/whisper-large-v3
