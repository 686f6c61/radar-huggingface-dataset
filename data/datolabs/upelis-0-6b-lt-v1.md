# datolabs/upelis-0.6b-lt-v1

## Resumen

Upelis-0.6b-lt-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en lituano, desarrollado por Datolabs. Se trata de un ajuste fino del modelo base `nvidia/nemotron-labs-unified-asr-0.6b`, del que hereda la arquitectura FastConformer con decodificador RNN-T y 0,6 mil millones de parámetros. La innovación principal es que los mismos pesos sirven tanto para transcripción en tiempo real (streaming) como para transcripción offline de grabaciones completas, con latencias algorítmicas configurables entre 0,16 y 1,12 segundos.

El modelo resuelve el problema de la transcripción de voz en lituano, un idioma con recursos limitados en el ecosistema ASR, ofreciendo puntuación y capitalización automáticas en la salida. Incorpora un prompt de identificación de idioma (`target_lang="lt"`) y maneja palabras y nombres en inglés embebidos en habla lituana. Está pensado para subtitulado en vivo, dictado e interfaces de voz.

Su relevancia actual radica en que combina un rendimiento competitivo con modelos offline más pesados (WER de 8,03 en FLEURS offline) manteniendo capacidad de streaming con latencias bajas, algo poco habitual en modelos de este tamaño para idiomas de bajos recursos. La versión v1 se publicó en noviembre de 2026 bajo licencia OpenMDW-1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (decoder), con prompt de language-ID |
| Parámetros totales | 0,6B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio mono a 16 kHz; latencia algorítmica de 0,16 a 1,12 s en streaming) |
| Tipos de cuantización | no disponible (solo checkpoint NeMo; sin versión GGUF/ONNX) |
| Idiomas soportados | Lituano (lt), incluyendo palabras y nombres en inglés dentro de habla lituana |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | NeMo checkpoint (no hay Transformers, ONNX ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer como encoder y un decodificador RNN-T (transducer), sin cambios estructurales respecto al modelo base de NVIDIA. La característica diferencial es el soporte unificado de modos streaming y offline con los mismos pesos, mediante un prompt de identificación de idioma que condiciona la decodificación. La latencia algorítmica es configurable: el modelo espera entre 0,16 y 1,12 segundos de audio futuro antes de emitir cada palabra.

El ajuste fino se realizó sobre el dataset `meldynamics/liepa-3`. Según la model card, FLEURS no se utilizó en entrenamiento, y ningún hablante ni frase de test o dev de Common Voice se empleó durante el entrenamiento. La decodificación reportada en todos los resultados es greedy. No se detalla en la información disponible el número de tokens de audio de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a ASR). Tampoco se especifican innovaciones adicionales como decodificación especulativa.

## Capacidades

- Transcripción de voz en lituano con puntuación y capitalización automáticas.
- Modo streaming en tiempo real con latencias de 0,16, 0,24, 0,32, 0,56 y 1,12 segundos.
- Modo offline para transcribir grabaciones completas de una vez.
- Manejo de palabras y nombres en inglés dentro de habla lituana.
- Escritura de números en dígitos (coherente con las referencias de FLEURS).
- Salida vacía para audio sin habla.
- Entrada de audio mono a 16 kHz con prompt `target_lang="lt"`.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Subtitulado en vivo de eventos y retransmisiones: el modo streaming con latencia de 0,56 s permite generar subtítulos lituanos casi en tiempo real, adecuado para conferencias y webinars.
- Dictado y escritura por voz: la puntuación y capitalización automáticas reducen la necesidad de postprocesado en aplicaciones de dictado para productividad.
- Interfaces de voz para asistentes: la latencia de 0,16 s permite respuestas conversacionales ágiles en comandos de voz en lituano.
- Transcripción de reuniones y entrevistas: el modo offline procesa grabaciones completas con un WER de 8,03 en FLEURS, útil para actas y documentación.
- Accesibilidad y transcripción de medios: generación de subtítulos para vídeo y pódcast en lituano, con soporte de números en dígitos.
- Procesamiento por lotes de archivos de audio: al ser un checkpoint NeMo, se integra en pipelines con NeMo para transcribir grandes volúmenes de audio de archivo.
- Investigación en ASR para lenguas bálticas: sirve como referencia de ajuste fino de un modelo unificado streaming/offline a un idioma de bajos recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, menor es mejor; decodificación greedy):

| Test set | offline | 1,12 s | 0,56 s | 0,32 s | 0,24 s | 0,16 s |
|---|---:|---:|---:|---:|---:|---:|
| FLEURS lt_lt test | 8,03 | 8,79 | 9,52 | 10,19 | 10,86 | 12,33 |
| Common Voice 22.0 lt test | 4,85 | 5,90 | 6,80 | – | – | 10,77 |

Comparativa con modelos offline de lituano en FLEURS lt_lt test (986 utterances, mismo normalizador):

| Modelo | Modo | WER | Numbers masked | No digits |
|---|---|---:|---:|---:|
| upelis-0.6b-lt-v1 (este modelo) | streaming 0,56 s | 9,56 | 7,31 | 6,74 |
| upelis-0.6b-lt-v1 (este modelo) | offline | 8,07 | 6,00 | 5,58 |
| azuolas-whisper-lt | offline | 8,96 | 5,37 | 4,62 |
| azuolas-qwen-lt | offline | 9,76 | 6,19 | 5,17 |
| kmynas-parakeet-lt-v4 | offline | 10,55 | 6,96 | 6,06 |
| nemotron-labs-unified-asr-0.6b (base) | streaming 0,56 s | 24,88 | 24,10 | 23,75 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6B parámetros, la inferencia en fp16 requiere del orden de 1,2-1,5 GB de pesos, más overhead de NeMo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente para inferencia.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 0,6B, aunque no se confirma en la información disponible.
- Opciones de despliegue: exclusivamente NeMo (checkpoint NeMo); no hay versión Transformers, ONNX, GGUF, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: latencia algorítmica configurable de 0,16 a 1,12 s; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/latencia | WER FLEURS lt (offline) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upelis-0.6b-lt-v1 | 0,6B | streaming 0,16-1,12 s u offline | 8,03 | OpenMDW-1.1 | NeMo |
| azuolas-whisper-lt | no disponible | offline | 8,96 | no disponible | Hugging Face |
| azuolas-qwen-lt | no disponible | offline | 9,76 | no disponible | Hugging Face |
| kmynas-parakeet-lt-v4 | no disponible | offline | 10,55 | no disponible | Hugging Face |
| nemotron-labs-unified-asr-0.6b | 0,6B | streaming/offline | 24,88 (streaming 0,56 s) | no disponible | NeMo |

El modelo destaca por ser el único de la comparativa que ofrece streaming con latencia baja manteniendo WER competitivo; los modelos offline puros obtienen mejor WER cuando se enmascaran números, pero no ofrecen transcripción en tiempo real.

## Limitaciones y advertencias

- Fuera de alcance: letras de canciones, audio lejano o con mucha música y transcripción estrictamente literal (el modelo escribe formas estándar del lituano).
- No recomendado para contenido médico, legal o financiero donde los errores importan, salvo revisión humana.
- Riesgo de alucinación y errores en audio ruidoso o con acentos no representados en el dataset de ajuste.
- El WER empeora a medida que se reduce la latencia (de 8,03 offline a 12,33 a 0,16 s en FLEURS).
- Solo disponible como checkpoint NeMo; no hay versiones Transformers, ONNX ni GGUF, lo que limita el despliegue en ecosistemas no NeMo.
- Licencia OpenMDW-1.1: revisar las condiciones de uso comercial en el archivo LICENSE antes de producción.
- Idioma limitado al lituano; no es un modelo multilingüe general.
- El rendimiento en Common Voice se mide sobre frases mayoritariamente de Wikipedia lituana, lo que puede no representar el habla espontánea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datolabs/upelis-0.6b-lt-v1
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Modelo comparativo azuolas-whisper-lt: https://huggingface.co/akisviete/azuolas-whisper-lt
- Modelo comparativo azuolas-qwen-lt: https://huggingface.co/akisviete/azuolas-qwen-lt
- Modelo comparativo kmynas-parakeet-lt-v4: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- Modelo comparativo VULSK/nemotron-asr-streaming-0.6b-medical-lt: https://huggingface.co/VULSK/nemotron-asr-streaming-0.6b-medical-lt
- Dataset de ajuste: meldynamics/liepa-3 (referenciado en la model card)
- Paper referenciado: arXiv:2604.19079 (referenciado en los tags)
- Organización: https://huggingface.co/datolabs
