# chameleon-ai/nemotron-3.5-transcribe

## Resumen

Nemotron 3.5 Transcribe 30B-A4B es un modelo de lenguaje para reconocimiento automatico del habla (ASR) offline publicado por NVIDIA, distribuido en este repositorio por el usuario `chameleon-ai` en formato de paquetes de runtime OpenASR (`.oasr`). El modelo subyacente es un hibrido Mamba-2/Transformer/MoE de 53 bloques con un encoder ASR de 32 capas, una rama de diarizacion Sortformer de 31 capas, una cabeza CTC para timestamps y un filtro mel de 128 bandas a 16 kHz. Soporta 40 idiomas, grabaciones de hasta una hora, atribucion de hablantes y traduccion de voz.

Este repositorio no contiene el modelo original, sino tres empaquetados que fusionan el decoder GGUF (arquitectura `nemotron_h_moe`) y el encoder F16 compartido (arquitectura `pee`) en un unico flujo GGUF v3 estandar, etiquetado con metadatos `openasr.*`. Los paquetes existen en tres perfiles de cuantizacion: `q8_0` (34,1 GiB), `ad_iq4_nl` (19,9 GiB) y `ad_q2_0_m` (14,2 GiB).

La relevancia actual es limitada por su estado: el runtime OpenASR aun no ha incorporado la familia `nemotron-transcribe`, por lo que estos paquetes no se pueden cargar en inferencia todavia. La verificacion realizada es estructural (invariantes de layout, datos de tensores byte-identicos, contenido de metadatos), no de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido Mamba-2/Transformer/MoE (`nemotron_h_moe`), 53 bloques; encoder ASR de 32 capas + Sortformer de 31 capas + cabeza CTC (`pee`) |
| Parametros totales | 30B (segun nombre del modelo; no se detalla desglose) |
| Parametros activos | A4B (aproximadamente 4B activos, segun nombre del modelo) |
| Longitud de contexto | no disponible (audio de hasta 1 hora por grabacion) |
| Tipos de cuantizacion | Q8_0, IQ4_NL (imatrix), Q2_0 (imatrix); encoder siempre en F16 |
| Idiomas soportados | 40 idiomas (segun model card del modelo base) |
| Licencia | OpenMDW-1.1 (segun metadatos `openasr.license.name`) |
| Formato de pesos | GGUF v3 dentro de contenedor `.oasr` (payload estandar, sin contenedor propietario) |

## Arquitectura y entrenamiento

El modelo base combina un decoder hibrido de 53 bloques que alterna capas Mamba-2, atencion Transformer y capas MoE, con un encoder `pee` de 32 capas para ASR, una rama Sortformer de 31 capas para diarizacion de hablantes, una cabeza CTC para timestamps y un frontend mel de 128 bandas a 16 kHz mono. El tokenizador es BPE de 131k entradas, con chat template embebido en los metadatos GGUF.

Los paquetes de este repositorio se generaron fusionando el decoder GGUF con el encoder F16 compartido en un unico flujo GGUF v3: los datos de tensores se copiaron byte-identicos con alineacion de 32 bytes y offsets recalculados, los metadatos del decoder se mantuvieron como autoritativos y los del encoder se conservaron para claves no conflictivas. Los decoders cuantizados derivan del BF16 producido por el conversor propio de NVIDIA (`convert_model.py`), cuantizado con `llama-quantize`; los niveles IQ4_NL y Q2_0 se calibraron con imatrix sobre 1,5 millones de tokens. No se dispone de informacion sobre volumen total de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla offline en 40 idiomas.
- Procesamiento de grabaciones de hasta una hora de duracion.
- Atribucion de hablantes (diarizacion) mediante la rama Sortformer.
- Traduccion de voz (speech translation) segun la model card del modelo base.
- Generacion de timestamps a nivel de palabra o segmento mediante la cabeza CTC.
- Frontend de audio integrado: filtro mel de 128 bandas, 16 kHz, mono.
- Tokenizador BPE de 131k con chat template embebido.
- Modo de decodificacion greedy seq2seq (`nemotron-transcribe.greedy.seq2seq.v1`).
- Tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones largas: el modelo admite grabaciones de hasta una hora con diarizacion integrada, lo que permite generar actas con atribucion de intervenciones sin segmentar manualmente el audio.
- Subtitulado y transcripcion de archivos audiovisuales: la cabeza CTC proporciona timestamps que se pueden alinear con pistas de subtitulos, y el soporte de 40 idiomas cubre catalogos multilingues.
- Traduccion de voz en entornos offline: al incluir speech translation, se puede usar en escenarios sin conectividad para generar transcripciones traducidas de contenido hablado.
- Analisis de llamadas de atencion al cliente: la diarizacion permite separar agente y cliente, y la transcripcion completa alimenta sistemas de analitica y control de calidad.
- Generacion de actas y documentacion clinica o legal: el procesamiento local de audio sensible evita enviar grabaciones a servicios externos, con cuantizaciones de 14,2 a 34,1 GiB que permiten desplegar en hardware propio.
- Investigacion en ASR y diarizacion: los paquetes permiten estudiar el efecto de distintas cuantizaciones (Q8_0, IQ4_NL, Q2_0) sobre el WER y el CER con el mismo encoder F16, segun los datos de calidad publicados por el autor.
- Pipelines de transcripcion por lotes en servidores con GPU: el perfil `ad_q2_0_m` de 14,2 GiB reduce el coste de VRAM por instancia, a costa de una perdida de 1,53 CER en chino FLEURS respecto a BF16.

## Benchmarks y rendimiento

El autor publica una comparacion de calidad por cuantizacion frente al decoder BF16, sobre un conjunto de prueba pareado de 2.200 enunciados. No se aportan resultados absolutos de WER ni comparaciones con otros modelos.

| Perfil | Tamano del paquete | Delta frente a BF16 |
|---|---|---|
| `q8_0` | 34,1 GiB | dentro de +/-0,18 WER en EN/DE/FR/ES |
| `ad_iq4_nl` | 19,9 GiB | dentro de +/-0,18 WER en EN/DE/FR/ES |
| `ad_q2_0_m` | 14,2 GiB | dentro de +/-0,18 WER en EN/DE/FR/ES; +1,53 CER en chino FLEURS |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 34,1 GiB para `q8_0`, 19,9 GiB para `ad_iq4_nl` y 14,2 GiB para `ad_q2_0_m`, mas el overhead del runtime y del buffer de audio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, los perfiles requieren GPUs de 24 GB o mas (RTX 3090/4090 para `ad_q2_0_m`, A100 40 GB o H100 para `q8_0`), pero esta estimacion no la confirma el autor.
- Cabe en GPU de consumo: `ad_q2_0_m` (14,2 GiB) es compatible con GPUs de 16 GB o mas; `ad_iq4_nl` (19,9 GiB) requiere 24 GB; `q8_0` (34,1 GiB) queda fuera de las GPU de consumo actuales.
- Opciones de despliegue: exclusivamente el runtime OpenASR, que aun no soporta la familia `nemotron-transcribe`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (este) | 30B totales, ~4B activos | audio de hasta 1 h | 40 | OpenMDW-1.1 | paquetes `.oasr`; runtime aun no soportado |
| Whisper large-v3 | no disponible | 30 s por ventana | ~99 | MIT | ampliamente disponible en multiples runtimes |
| Alternativas ASR open-weight de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros modelos comparables con diarizacion integrada y contexto de audio de una hora.

## Limitaciones y advertencias

- Los paquetes no son cargables en inferencia: la familia `nemotron-transcribe` no esta incorporada en el runtime OpenASR (modulo de familia, fila de descriptor y contrato de etiquetas de cuantizacion pendientes).
- La verificacion realizada es estructural, no de inferencia; no se ha validado el comportamiento real de los paquetes fusionados.
- El perfil `ad_q2_0_m` degrada 1,53 CER en chino FLEURS respecto a BF16; no es adecuado para produccion multilingue sin validacion.
- El encoder se mantiene en F16 en los tres perfiles, lo que fija un suelo de memoria y precision no reducible por cuantizacion.
- No se detallan sesgos conocidos, tasas de alucinacion ni limitaciones por idioma en la informacion disponible.
- La licencia OpenMDW-1.1 figura solo en los metadatos `openasr.*`; conviene verificar los terminos en la fuente oficial antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-16); no hay evidencia de uso en produccion.
- No se especifican requisitos de contexto, latencia ni throughput, lo que impide dimensionar despliegues.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chameleon-ai/nemotron-3.5-transcribe
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Conversiones GGUF de origen: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
