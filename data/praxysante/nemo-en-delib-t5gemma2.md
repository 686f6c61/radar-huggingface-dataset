# PraxySante/Nemo-EN-delib-T5Gemma2

## Resumen

Nemo-EN-delib-T5Gemma2 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por PraxySante que implementa una arquitectura de dos pasadas con deliberación. El primer paso es un transductor FastConformer cache-aware en tiempo real (NeMo), y el segundo paso es un modelo T5Gemma2 que reescribe los segmentos finalizados utilizando el N-best del mismo codificador y el contexto completo del segmento. Un mecanismo de validación (EditGuard) filtra cada modificación propuesta por el segundo paso.

El modelo combina un codificador acústico congelado de 114,8 M de parámetros (EncDecHybridRNNTCTCBPEModel con atención chunked_limited) con un T5Gemma2 de 270 M de parámetros en el codificador y 270 M en el decodificador (369,2 M de texto tras eliminar la torre de visión SigLIP). El checkpoint publicado corresponde a la fase 2 del entrenamiento, que añade deliberación sobre listas N-best tras una fase 0 de adaptación con audio únicamente.

Su relevancia radica en que demuestra una técnica de refinamiento en dos etapas para ASR en streaming: mantener la latencia del primer paso en tiempo real y delegar la corrección de errores a un segundo paso que dispone de más contexto. Los resultados publicados muestran una reducción del WER del 10,23 % al 6,96 % en el conjunto de validación `en_delib_val` (967 ítems) antes del filtro de validación, y al 7,21 % tras aplicar EditGuard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transductor FastConformer cache-aware (primer paso) + T5Gemma2 encoder-decoder (segundo paso de deliberación) con EditGuard |
| Parámetros totales | Codificador acústico: 114,8 M; T5Gemma2: 270 M encoder + 270 M decoder (369,2 M de texto tras retirar la torre SigLIP) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el codificador usa lookaheads configurables [70,13] / [70,6] / [70,1] / [70,0] en atención chunked_limited) |
| Tipos de cuantización | No disponible (checkpoint publicado en state_dict fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (modelo interno PraxySante; no se concede licencia para uso de terceros) |
| Formato de pesos | `.pt` (state_dict fp32, clase `DeliberationT5`), 1,94 GB |

## Arquitectura y entrenamiento

La arquitectura es un sistema de dos pasadas. El primer paso es un `EncDecHybridRNNTCTCBPEModel` cache-aware de NeMo con 114,8 M de parámetros, que opera en streaming con atención chunked_limited y lookaheads configurables. Este codificador está congelado y produce hipótesis con un tokenizer BPE de 1024 unidades en minúsculas, sin dígitos ni puntuación. El segundo paso es un T5Gemma2 (`google/t5gemma-2-270m-270m`) que recibe el audio del segmento completo junto con el N-best generado por el mismo codificador, y reescribe los segmentos finalizados. Un componente denominado EditGuard valida cada modificación aplicando reglas de forma: supresiones, palabras no sustentadas y valores protegidos.

El entrenamiento se organizó en fases. La fase 0 (6 épocas, solo audio) adapta el adaptador y el T5 con el codificador congelado. La fase 2 (4 épocas, N-best) entrena la deliberación sobre listas N-best. Ambas fases se ejecutaron sobre 8 GPU H100 con una duración aproximada de 7 h 30 cada una. Los datos de entrenamiento provienen de 2 500 h de audio general más 179,7 h de audio médico. El manifest de entrenamiento contiene 1 350 822 líneas, de las cuales 47 874 no tienen ninguna hipótesis y se ignoran; de las 1 302 948 restantes, el 42 % tiene una sola hipótesis tras deduplicación, el 44 % tiene dos, el 12 % tiene tres y el 2 % tiene cuatro. La generación del N-best requirió 8 H100 durante aproximadamente 17 h.

## Capacidades

- Reconocimiento automático del habla en inglés en modo streaming mediante el primer paso cache-aware.
- Refinamiento por deliberación de segmentos finalizados: el segundo paso reescribe la transcripción usando audio completo y N-best.
- Rescoring CTC de las hipótesis del segundo paso.
- Validación automática de ediciones mediante EditGuard (reglas de supresión, palabras no sustentadas y protección de valores).
- Soporte de múltiples configuraciones de lookahead para equilibrar latencia y precisión.
- Escritura de dígitos y puntuación por parte del T5Gemma2, aunque el primer paso no los genere (con señalización mediante `protect_values` y `value_policy: flag`).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá del ASR ni modos de razonamiento explícitos.

## Casos de uso

- Transcripción médica en inglés con refinamiento: el primer paso en streaming permite dictado en tiempo real y el segundo paso corrige los segmentos finalizados usando el contexto completo, lo que resulta adecuado para documentación clínica donde la precisión es crítica.
- Subtitulado en directo con corrección diferida: el primer paso proporciona subtítulos de baja latencia y el segundo paso puede reescribir los segmentos ya cerrados antes de su publicación definitiva.
- Atención al cliente con transcripción de llamadas: el sistema puede transcribir conversaciones en streaming y generar actas corregidas al finalizar, aprovechando el N-best para reducir errores en nombres y términos.
- Generación de actas de reuniones: la deliberación sobre segmentos finalizados mejora la calidad de la transcripción final sin sacrificar la visualización en tiempo real durante la reunión.
- Investigación en ASR de dos pasadas: el checkpoint y los scripts de reproducción permiten estudiar el impacto de la deliberación sobre N-best en un codificador congelado.
- Evaluación de técnicas de edición controlada: EditGuard sirve como caso de estudio para validar modificaciones automáticas en transcripciones con reglas de forma y protección de valores.
- Procesamiento por lotes de audio en inglés con requisitos de calidad: la segunda pasada puede aplicarse offline sobre grabaciones ya transcritas por el primer paso para obtener una versión refinada.

## Benchmarks y rendimiento

Resultados de WER agrupados (suma de errores / suma de palabras de referencia) sobre el mismo manifest de validación y configuración de inferencia. `h1` = primer paso cache-aware; `brut` = salida del T5 tras rescoring CTC; `garde` = tras EditGuard.

| Tranche | Ítems | Checkpoint | WER h1 | WER brut | WER garde |
|---|---|---|---|---|---|
| en_delib_val | 967 | ckpt_en_t5g_phase0 | 10,23 | 7,36 | 7,60 |
| en_delib_val | 967 | best (fase 2) | 10,23 | 6,96 | 7,21 |
| en_delib_val | 967 | epoch3 | 10,23 | 7,13 | 7,47 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es de 1,94 GB en fp32; en fp16/BF16 se estima alrededor de 1 GB para los pesos, más memoria para activaciones y el codificador acústico. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: el entrenamiento se realizó con 8 GPU H100. Para inferencia no se especifican requisitos mínimos.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos (1,94 GB fp32) es probable que quepa en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la model card solo documenta la instanciación mediante NeMo y los scripts de deliberación (`build_from_config`, `load_dual_encoder_checkpoint`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación del N-best se realizó con beam 3 offline sobre 8 H100 en aproximadamente 17 h para el manifest de entrenamiento, pero no se aportan métricas de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemo-EN-delib-T5Gemma2 | 114,8 M (acústico) + 369,2 M (T5 texto) | No disponible | ASR dos pasadas con deliberación | other (sin licencia para terceros) | Hugging Face (repo de 1,9 GB) |
| Whisper large-v3 | No disponible en la información | No disponible | ASR transformer encoder-decoder | No disponible en la información | No disponible en la información |
| NeMo FastConformer estándar | No disponible en la información | No disponible | ASR streaming cache-aware | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin léxico médico inglés (`risk_csv: null`): el prompt no incluye términos candidatos y EditGuard se limita a reglas de forma, por lo que la mejora procede únicamente del audio y el N-best.
- N-best desigual: el 42 % de las líneas con hipótesis tiene una sola tras deduplicación, lo que reduce la información disponible para la segunda pasada.
- Chiffres y puntuación: el tokenizer del primer paso (BPE 1024) no produce dígitos ni puntuación; el T5Gemma2 puede añadirlos, pero estos pueden corregir un valor perdido o inventar uno nuevo. El 8,5 % de las líneas de entrenamiento tienen dígitos y el 42 % tienen puntuación en la referencia.
- Solo inglés: no se documenta soporte multilingüe.
- Licencia restrictiva: modelo interno de PraxySante sin licencia concedida para uso de terceros; no apto para uso comercial sin autorización expresa.
- La fase 3 (variante con capas altas duplicadas) no está incluida en este repositorio.
- Riesgo de alucinación en el segundo paso: el T5Gemma2 puede generar valores no presentes en el audio, mitigado parcialmente por EditGuard pero no eliminado.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá del conjunto de validación de 967 ítems.

## Enlaces

- Hugging Face: https://huggingface.co/PraxySante/Nemo-EN-delib-T5Gemma2
- Modelo base T5Gemma2: https://huggingface.co/google/t5gemma-2-270m-270m
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
