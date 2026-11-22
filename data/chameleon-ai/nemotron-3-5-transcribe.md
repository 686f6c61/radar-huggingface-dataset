# chameleon-ai/nemotron-3.5-transcribe

## Resumen

Nemotron 3.5 Transcribe 30B-A4B es un modelo de reconocimiento automático del habla (ASR) de pesos abiertos desarrollado por NVIDIA, publicado originalmente como `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`. Se trata de un speech LLM offline que combina un encoder acústico con un decoder híbrido Mamba-2/Transformer/MoE, y que cubre 40 idiomas, grabaciones de hasta una hora, atribución de hablantes (diarización) y traducción de voz. El repositorio analizado aquí, `chameleon-ai/nemotron-3.5-transcribe`, no contiene el modelo original, sino packs de runtime `.oasr` preconstruidos para el runtime OpenASR: cada pack fusiona el decoder y el encoder en un único flujo GGUF estándar.

La relevancia de esta publicación es doble. Por un lado, expone el modelo base de NVIDIA en tres perfiles de cuantización (q8_0, ad_iq4_nl y ad_q2_0_m) que van de 34,1 GiB a 14,2 GiB, lo que permite ejecutar un ASR de 30B parámetros totales con 4B activos en hardware mucho más modesto que el BF16 original. Por otro, documenta de forma exhaustiva la procedencia, los hashes y el proceso de conversión, algo poco habitual en artefactos derivados.

Conviene subrayar que estos packs son artefactos precompilados: según la propia model card, la familia `nemotron-transcribe` todavía no está integrada en el runtime OpenASR, por lo que el runtime no puede cargarlos hasta que se complete esa integración. Los packs están verificados estructuralmente (invariantes de layout, datos de tensores byte a byte idénticos, contenido de metadatos), pero no verificados por inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2/Transformer/MoE (decoder `nemotron_h_moe`, 53 bloques) + encoder ASR de 32 capas con rama de hablantes Sortformer de 31 capas, cabeza CTC de timestamps y banco de filtros mel (`pee`) |
| Parametros totales | 30B (según denominación del modelo base); desglose exacto no disponible |
| Parametros activos | 4B (según denominación A4B del modelo base) |
| Longitud de contexto | No disponible (soporta grabaciones de hasta 1 hora según la model card) |
| Tipos de cuantizacion | q8_0 (matrices densas Q8_0, 1 cabeza MTP en BF16); ad_iq4_nl (expertos IQ4_NL con imatrix, densas Q8_0); ad_q2_0_m (expertos Q2_0 con imatrix, 6 bloques MoE mayores + cabezas MTP en IQ4_NL, densas Q8_0); encoder en F16 en los tres perfiles |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh, multilingual (40 idiomas según la model card del modelo base) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF v3 empaquetado como payload `.oasr` v1 (OpenASR); tokenizer BPE-131k y chat template embebidos en metadatos GGUF |

## Arquitectura y entrenamiento

El decoder es un híbrido de 53 bloques que alterna capas Mamba-2, Transformer y mezcla de expertos (MoE), con arquitectura identificada como `nemotron_h_moe`. El encoder es una pieza separada de arquitectura `pee`: 32 capas para ASR, una rama Sortformer de 31 capas para diarización, una cabeza CTC para timestamps y un frontend mel de 128 bandas a 16 kHz mono. El modelo base incluye una cabeza MTP (multi-token prediction), que en el pack q8_0 se conserva en BF16.

Los packs de este repositorio no reentrenan nada: fusionan el decoder GGUF con el encoder F16 compartido (1,67 GB) en un único flujo GGUF, copiando los datos de tensores byte a byte con alineación de 32 bytes y recalculando offsets. Los decoders cuantizados proceden del repositorio `AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF` (revisión `dbd06c5c`, 2026-10-28), generados con `llama-quantize` a partir de la salida BF16 del conversor oficial de NVIDIA (`convert_model.py`), con calibración imatrix sobre 1,5 millones de tokens. El checkpoint de origen es `0b5820fad1103208f65895b586bd65d2`, registrado como `nemo_speech.checkpoint_id` y estampado como `openasr.source.revision`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el material proporcionado.

## Capacidades

- Transcripción de voz a texto (ASR) offline en 40 idiomas, incluidos en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko y zh.
- Procesamiento de grabaciones de hasta una hora de duración.
- Atribución de hablantes (diarización) mediante la rama Sortformer del encoder.
- Traducción de voz (speech translation) según la model card del modelo base.
- Generación de timestamps a nivel de token mediante la cabeza CTC del encoder.
- Tokenizer BPE de 131k con chat template embebido en los metadatos GGUF.
- Cabeza MTP (multi-token prediction) presente en el decoder.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora con diarización, de modo que un pipeline extrae la transcripción segmentada por hablante directamente del pack ad_iq4_nl en una GPU de 24 GB.
- Subtitulado y postproducción audiovisual: la cabeza CTC genera timestamps por token, lo que permite alinear subtítulos con precisión sin un modelo de forced alignment adicional.
- Archivo y digitalización de audio histórico: el soporte de 40 idiomas y la ventana de una hora permiten transcribir fondos de audio multilingües en lote con un único modelo.
- Traducción de voz en entornos sin conectividad: al ser un speech LLM offline, puede desplegarse en servidores locales para traducir audio entre los idiomas soportados sin enviar datos a la nube.
- Atención al cliente y análisis de llamadas: la combinación de transcripción y diarización permite separar agente y cliente en grabaciones de call center y alimentar análisis posteriores de calidad.
- Investigación en ASR multilingüe: los tres perfiles de cuantización con calidad documentada (variación de ±0,18 WER frente a BF16 en EN/DE/FR/ES) permiten reproducir experimentos en hardware heterogéneo.
- Despliegue en el borde con el pack ad_q2_0_m: sus 14,2 GiB y su encoder F16 lo hacen viable en GPUs de consumo de gama alta para transcripción de campo.

## Benchmarks y rendimiento

La model card no publica tablas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), pero sí incluye una evaluación de calidad por cuantización sobre un conjunto de test pareado de 2.200 enunciados frente al decoder BF16:

| Perfil | Tamano | Diferencia frente a BF16 |
|---|---|---|
| q8_0 | 34,1 GiB | No disponible (todos los decoders desde 15,55 GB quedan dentro de ±0,18 WER en EN/DE/FR/ES) |
| ad_iq4_nl | 19,9 GiB | Dentro de ±0,18 WER en EN/DE/FR/ES |
| ad_q2_0_m | 14,2 GiB | +1,53 CER en FLEURS chino (clase de 16 GB) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 34,1 GiB para q8_0, 19,9 GiB para ad_iq4_nl y 14,2 GiB para ad_q2_0_m, más el overhead del runtime y del encoder F16 de 1,67 GB ya incluido en cada pack.
- GPU recomendadas: A100 80 GB o H100 para q8_0 con margen amplio; A100 40 GB, L40S o RTX 6000 Ada para ad_iq4_nl; RTX 4090 (24 GB) para ad_q2_0_m con holgura y para ad_iq4_nl al límite.
- Cabe en GPU de consumo: sí, ad_q2_0_m en RTX 4090 y en GPUs de 16 GB o más; ad_iq4_nl requiere 24 GB.
- Opciones de despliegue: exclusivamente el runtime OpenASR con los packs `.oasr`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Estado de despliegue: la familia `nemotron-transcribe` aún no está integrada en el runtime OpenASR, por lo que los packs no pueden cargarse todavía. Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (este pack) | 30B totales / 4B activos | No disponible (audio de hasta 1 h) | 40 | OpenMDW-1.1 | GGUF `.oasr` |
| Whisper large-v3 | No disponible en la información | No disponible | ~99 | MIT (según conocimiento general, no verificado aquí) | Safetensors, GGUF |
| Otros speech LLM de pesos abiertos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Los packs no están verificados por inferencia: solo se ha comprobado la estructura, el layout y la integridad byte a byte de los tensores.
- El runtime OpenASR no puede cargar estos packs hasta que se complete la integración de la familia `nemotron-transcribe` (módulo de familia, fila de descriptor y entradas del contrato de etiquetas de cuantización pendientes).
- El pack ad_q2_0_m degrada la calidad en chino (+1,53 CER en FLEURS) respecto a BF16; no es adecuado para producción en ese idioma sin validación previa.
- Los perfiles `ad_*` usan cuantización de expertos con calibración imatrix sobre 1,5 millones de tokens; el comportamiento fuera de los idiomas de calibración no está documentado.
- Riesgo de alucinación inherente a los speech LLM: no se documentan métricas de inserción de texto no presente en el audio.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con condiciones propias; deben revisarse los términos en https://openmdw.ai/license/1-1/ antes de un uso comercial.
- El repositorio tiene 0 likes y 17.184 descargas, y es un derivado de terceros (chameleon-ai), no una publicación oficial de NVIDIA; la procedencia debe trazarse al modelo base para cualquier uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chameleon-ai/nemotron-3.5-transcribe
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Conversiones GGUF de origen: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
