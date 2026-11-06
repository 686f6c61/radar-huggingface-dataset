# MohammadGholizadeh/nemotron-asr-streaming-farsi-podcast

## Resumen

`nemotron-asr-streaming-farsi-podcast` es un modelo de reconocimiento automático del habla (ASR) en streaming para persa (farsi) conversacional, desarrollado por MohammadGholizadeh. Se trata de un ajuste fino adicional del modelo `mehdi-hf/nemotron-asr-streaming-farsi`, que a su vez deriva del `nemotron-3.5-asr-streaming-0.6b` de NVIDIA. El objetivo es mejorar la transcripción de audio espontáneo de podcasts e interviews, donde el habla coloquial y los solapamientos entre hablantes degradan los sistemas entrenados con voz leída.

El modelo conserva la arquitectura del base: un encoder FastConformer cache-aware de aproximadamente 600 millones de parámetros combinado con un decodificador RNN-T, un tokenizador persa de 1.024 piezas y un prompt de idioma `fa-IR`. La innovación principal es el ajuste fino sobre 365 horas de podcasts persas, que reduce el WER en episodios no vistos del 16,44 % al 12,31 % con 1,12 s de look-ahead, a costa de empeorar en benchmarks de voz formal (FLEURS y Common Voice).

Es relevante ahora porque cubre un nicho poco atendido: ASR streaming de baja latencia para persa coloquial, con licencia OpenMDW-1.1 y pesos en formato `.nemo` listos para NeMo. El modelo está pensado para transcripción en vivo y por lotes de contenido conversacional, no para dictado formal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware + RNN-T (transducer) |
| Parámetros totales | ~600 M (heredados del base `nemotron-3.5-asr-streaming-0.6b`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks; look-ahead de 1,12 s o 0,32 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | `.nemo` (NeMo); tamaño del repo 2,5 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un encoder FastConformer con atención cache-aware, diseñado para procesar audio en chunks con un look-ahead configurable (1,12 s para máxima precisión, 0,32 s para menor latencia), y un decodificador RNN-T con decodificación greedy. El tokenizador es el persa de 1.024 piezas del modelo original y se mantiene el prompt de idioma `fa-IR` en el slot reservado del modelo de NVIDIA.

El ajuste fino se realizó sobre 365 horas de audio de podcasts persas provenientes de los datasets `MohammadGholizadeh/bplus_podcast_persian` y `MohammadGholizadeh/Tabaghe16_dataset_persian`. El modelo base ya había sido entrenado sobre 1.181 horas de voz persa con licencia abierta. El efecto principal del ajuste es el cambio de registro: el modelo aprende la transcripción coloquial de los datasets (`رو`, `هستن`, `میخوایم`), lo que mejora el WER en podcasts pero introduce sustituciones de formas formales por coloquiales en benchmarks de voz leída. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset más allá de las horas y las fuentes.

## Capacidades

- Reconocimiento automático del habla en streaming para persa conversacional, procesando audio chunk a chunk o ficheros completos.
- Dos modos de look-ahead: 1,12 s (mayor precisión) y 0,32 s (menor latencia).
- Transcripción con estilo coloquial, adaptada a podcasts, entrevistas y conversación espontánea.
- Soporte del prompt de idioma `fa-IR` heredado del modelo base.
- Compatible con la API de NeMo (`ASRModel.restore_from`) y con el script de streaming cache-aware de NeMo.
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento; es un modelo puramente ASR.
- Multilingüismo limitado al persa.

## Casos de uso

- Transcripción en vivo de podcasts: el modelo procesa audio en chunks con 1,12 s o 0,32 s de look-ahead, lo que permite generar subtítulos o transcripciones casi en tiempo real durante la grabación o emisión.
- Entrevistas y conversación espontánea: el ajuste sobre 365 horas de podcasts reduce el WER a 12,31 % en episodios no vistos, frente al 16,44 % del base, lo que lo hace adecuado para contenido con habla coloquial y solapamientos.
- Archivado y búsqueda de catálogos de podcasts: la transcripción por lotes con el modo de 1,12 s permite indexar episodios históricos y habilitar búsqueda textual sobre audio.
- Generación de subtítulos para plataformas de vídeo y audio persas: el estilo coloquial del modelo se ajusta mejor a la forma real de hablar de los locutores que un transcriptor de voz formal.
- Análisis de contenido conversacional: transcripción de programas de entrevistas para extracción de temas, análisis de sentimiento o resumen posterior con un LLM.
- Asistentes de voz y aplicaciones de dictado informal: el modo de 0,32 s de look-ahead ofrece baja latencia para interfaces conversacionales en persa.
- Investigación en ASR persa: sirve como punto de partida para ajustes sobre dominios conversacionales específicos, dado que hereda la interfaz y el tokenizador del modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`), WER / CER en %, menor es mejor. Evaluación con streaming real chunk a chunk, prompt `fa-IR` fijo y decodificación greedy.

**Look-ahead de 1,12 s:**

| Test set | Clips | Modelo base | Este modelo | Cambio |
|---|---|---|---|---|
| Podcast held-out test (todos) | 4.182 | 16,44 / 8,69 | **12,31 / 5,97** | −4,13 WER |
| ↳ episodios bplus | 2.340 | 5,63 / 2,20 | **4,81 / 1,70** | −0,82 |
| ↳ episodios Tabaghe16 | 1.842 | 22,85 / 12,58 | **16,76 / 8,53** | −6,09 |
| FLEURS fa test (voz leída formal) | 852 | **8,82 / 2,94** | 12,91 / 4,81 | +4,09 |
| Common Voice 22 fa test | 10.661 | **19,12 / 5,80** | 22,01 / 7,64 | +2,89 |

**Look-ahead de 0,32 s:**

| Test set | Clips | Modelo base | Este modelo |
|---|---|---|---|
| Podcast held-out test (todos) | 4.182 | 18,08 / 9,84 | **13,54 / 6,78** |
| ↳ episodios bplus | 2.340 | 7,49 / 3,44 | **6,30 / 2,66** |
| ↳ episodios Tabaghe16 | 1.842 | 24,37 / 13,67 | **17,83 / 9,25** |
| FLEURS fa test | 852 | **9,01 / 3,03** | 12,98 / 4,56 |
| Common Voice 22 fa test | 10.661 | **19,93 / 6,08** | 21,97 / 7,20 |

El empeoramiento en FLEURS se atribuye mayoritariamente al registro: el modelo transcribe en forma coloquial (`رو`, `هستن`, `کردن`) lo que las referencias escriben en forma formal (`را`, `هستند`, `کردند`). El autor también reporta un número menor de regresiones reales, como finales de frase omitidos en oraciones formales largas y algún bucle de repetición ocasional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~600 M de parámetros en precisión completa el peso ronda los 2,4 GB, por lo que en fp16 cabría en GPUs consumer con 4-6 GB o más, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el tamaño del repo (2,5 GB) sugiere que es viable en GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: NeMo (`ASRModel.restore_from` con el fichero `.nemo`) y el script de streaming cache-aware de NeMo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el modelo ofrece look-ahead de 1,12 s o 0,32 s, que determinan la latencia algorítmica del streaming, pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | WER podcast (1,12 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** | ~600 M | Streaming, 1,12 s / 0,32 s look-ahead | 12,31 | OpenMDW-1.1 | Hugging Face (`.nemo`) |
| `mehdi-hf/nemotron-asr-streaming-farsi` (base) | ~600 M | Streaming, 1,12 s / 0,32 s look-ahead | 16,44 | no disponible en la información | Hugging Face |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` (origen) | ~600 M | Streaming | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos ASR persas comparables en la información proporcionada.

## Limitaciones y advertencias

- Peor rendimiento en voz formal o leída: FLEURS empeora de 8,82 a 12,91 WER y Common Voice 22 de 19,12 a 22,01 respecto al modelo base.
- Sesgo de registro: transcribe en forma coloquial aunque la referencia sea formal, lo que genera sustituciones sistemáticas (`را` → `رو`, `هستند` → `هستن`).
- Regresiones documentadas: finales de frase omitidos en oraciones formales largas y bucles de repetición ocasionales.
- Riesgo de alucinación y errores en audio con ruido, solapamientos o acentos no representados en los datasets de ajuste.
- Cobertura monolingüe: solo persa (`fa`); no soporta otros idiomas.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; la model card la marca como `license: other`.
- Resultados de benchmarks no verificados (`verified: false`) y generados por el propio autor.
- Formato de pesos exclusivo de NeMo (`.nemo`), sin conversiones documentadas a GGUF u otros formatos.
- Sin datos publicados sobre cuantización, latencia real ni requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadGholizadeh/nemotron-asr-streaming-farsi-podcast
- Modelo base: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- README del modelo base: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi/blob/main/README.md
- Dataset bplus podcast persa: https://huggingface.co/datasets/MohammadGholizadeh/bplus_podcast_persian
- Dataset Tabaghe16 persa: https://huggingface.co/datasets/MohammadGholizadeh/Tabaghe16_dataset_persian
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Resultados de evaluación en el repo: `eval_results/` (referenciado en la model card)
