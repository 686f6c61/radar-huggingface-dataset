# chameleon-ai/nemotron-3.5-transcribe-30b-a4b

## Resumen

Nemotron 3.5 Transcribe 30B-A4B es un modelo de reconocimiento automatico del habla (ASR) de pesos abiertos desarrollado por NVIDIA, distribuido aqui por chameleon-ai en formato OpenASR `.oasr`. Se trata de un modelo de lenguaje de voz (speech LLM) para transcripcion offline que soporta 40 idiomas, grabaciones de hasta una hora de duracion, atribucion de hablantes (diarizacion) y traduccion de voz. El repositorio contiene unicamente packs de runtime preconstruidos, no el modelo original.

Arquitectura hibrida `nemotron_h_moe` de 53 bloques que combina Mamba-2, Transformer y capas MoE, con un encoder ASR de 32 capas como sidecar compartido. El modelo base es `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, del que este repositorio es un finetune/empaquetado. Cada pack fusiona el decoder y el encoder en un unico flujo GGUF estandar.

Es relevante porque ofrece una via de despliegue cuantizada (desde 14,2 GiB) de un modelo ASR de 30B con arquitectura MoE, pensada para inferencia local y offline. Sin embargo, el propio autor advierte que la familia `nemotron-transcribe` aun no esta integrada en el runtime OpenASR, por lo que los packs no son cargables todavia y no han sido verificados mediante inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `nemotron_h_moe`: 53 bloques Mamba-2/Transformer/MoE; encoder ASR de 32 capas + rama de hablante Sortformer de 31 capas + cabeza CTC + mel filterbank |
| Parametros totales | 30B (segun denominacion del modelo; no se detalla el desglose exacto) |
| Parametros activos | A4B (aproximadamente 4B activos, segun denominacion MoE) |
| Longitud de contexto | no disponible (soporta grabaciones de hasta 1 hora) |
| Tipos de cuantizacion | `q8_0`, `ad_iq4_nl` (expertos IQ4_NL con imatrix, densas Q8_0), `ad_q2_0_m` (expertos Q2_0 con imatrix, cabezas MoE grandes y MTP en IQ4_NL, densas Q8_0); encoder siempre en F16 |
| Idiomas soportados | 40 idiomas; listados explicitos: en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh, multilingual |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (packs `.oasr` v1, un unico flujo GGUF con decoder y encoder fusionados) |

## Arquitectura y entrenamiento

El decoder emplea la arquitectura `nemotron_h_moe`, un hibrido de 53 bloques que mezcla capas Mamba-2 (modelos de espacio de estados), capas Transformer y capas de mezcla de expertos (MoE). El encoder es un sidecar F16 de 1,67 GB con arquitectura `pee`: 32 capas de encoder ASR, una rama de diarizacion Sortformer de 31 capas, una cabeza de timestamps CTC y un frontend de mel filterbank a 16 kHz mono. La fusion de ambos se realiza concatenando tablas de tensores sin colisiones de nombres entre los ambitos del decoder (`blk.*`, `output*`, `token_embd`) y del encoder (`asr.*`, `diar.*`, `ctc.*`, `fusion.*`, `preprocessor.*`).

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las cuantizaciones IQ4_NL y Q2_0 se calibraron con imatrix sobre 1,5 millones de tokens. El checkpoint de origen es `0b5820fad1103208f65895b586bd65d2`, y las conversiones provienen de `AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF` (revision `dbd06c5cad7a2f33c8e06be2fb3ef814dbd9aa59`, 2026-10-28). El encoder fue generado con el conversor propio de NVIDIA (`convert_model.py`) y los decoders se cuantizaron con `llama-quantize` a partir de la salida BF16 de dicho conversor.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) offline en 40 idiomas.
- Transcripcion de grabaciones de hasta 1 hora de duracion.
- Atribucion de hablantes (diarizacion) mediante la rama Sortformer del encoder.
- Traduccion de voz (speech translation).
- Generacion de timestamps a nivel de token mediante la cabeza CTC.
- Procesamiento de audio mono a 16 kHz con frontend mel de 128 bandas.
- Tokenizer BPE de 131k tokens y plantilla de chat embebidas en los metadatos GGUF.
- Capacidad de decodificacion greedy seq2seq (`nemotron-transcribe.greedy.seq2seq.v1`).
- Soporte multilingue con cobertura explicita de lenguas europeas, asiaticas y el hindi.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora con atribucion de hablantes, lo que permite generar actas con identificacion de interlocutores en entornos corporativos multilingues.
- Subtitulado y postproduccion audiovisual: la generacion de timestamps CTC facilita la alineacion temporal de subtitulos en contenido de larga duracion.
- Atencion al cliente y analitica de llamadas: la transcripcion offline con diarizacion permite analizar conversaciones de centros de contacto preservando la privacidad al ejecutarse localmente.
- Traduccion de voz en entornos multilingues: la capacidad de speech translation permite generar transcripciones traducidas de contenido en los 40 idiomas soportados.
- Investigacion en ASR: el empaquetado en GGUF cuantizado (desde 14,2 GiB) facilita experimentos en hardware de gama alta sin depender de servicios en la nube.
- Documentacion clinica o legal dictada: la transcripcion offline de grabaciones largas con separacion de hablantes encaja en flujos donde la confidencialidad impide el envio a APIs externas.
- Despliegue en infraestructura propia: los perfiles `ad_iq4_nl` (19,9 GiB) y `ad_q2_0_m` (14,2 GiB) reducen los requisitos de memoria frente al `q8_0` (34,1 GiB) para servidores con VRAM limitada.

## Benchmarks y rendimiento

La model card reporta una evaluacion de calidad por cuantizacion sobre un conjunto de prueba pareado de 2.200 utterances frente al decoder BF16:

| Perfil | Tamano | Calidad relativa a BF16 |
|---|---|---|
| `q8_0` | 34,1 GiB | dentro de +/-0,18 WER en EN/DE/FR/ES |
| `ad_iq4_nl` | 19,9 GiB | dentro de +/-0,18 WER en EN/DE/FR/ES |
| `ad_q2_0_m` | 14,2 GiB | +1,53 CER en FLEURS chino (clase 16 GB) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni WER absoluto por idioma) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,2 GiB (`ad_q2_0_m`), 19,9 GiB (`ad_iq4_nl`) y 34,1 GiB (`q8_0`), segun el tamano de los packs.
- GPU recomendadas: A100 (40/80 GB) o H100 para el perfil `q8_0`; GPUs de 24 GB como la RTX 4090 para `ad_iq4_nl` y `ad_q2_0_m` con margen ajustado.
- Cabe en GPU de consumo: el perfil `ad_q2_0_m` (14,2 GiB) es el unico que deja margen holgado en GPUs de 16-24 GB; `ad_iq4_nl` encaja en 24 GB.
- Opciones de despliegue: runtime OpenASR (familia `nemotron-transcribe`, aun no integrada); el formato GGUF es compatible con el ecosistema llama.cpp, aunque la carga de estos packs depende del onboarding pendiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (este repo) | 30B (A4B) | no disponible (audio hasta 1 h) | OpenMDW-1.1 | Packs preconstruidos, no cargables aun |
| Alternativas ASR de pesos abiertos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los packs no son cargables todavia: la familia `nemotron-transcribe` no esta integrada en el runtime OpenASR (modulo de familia, fila de descriptor y contrato de quant-tags pendientes).
- Solo se ha verificado la estructura (invariantes de layout, datos de tensores identicos byte a byte, contenido de metadatos), no la inferencia.
- El perfil `ad_q2_0_m` degrada la precision en chino (+1,53 CER en FLEURS) respecto a BF16.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; esta etiquetada como `other` en Hugging Face y no es una licencia permisiva estandar.
- Los sesgos conocidos del modelo no se detallan en la informacion disponible.
- Riesgo de alucinacion en la transcripcion no cuantificado en la informacion disponible.
- El repositorio no incluye los pesos originales de NVIDIA, solo artefactos empaquetados; la trazabilidad depende del checkpoint `0b5820fad1103208f65895b586bd65d2`.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/chameleon-ai/nemotron-3.5-transcribe-30b-a4b
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Conversiones GGUF de origen: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
