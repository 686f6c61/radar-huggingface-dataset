# PraxySante/Nemo-DE-delib-T5Gemma2

## Resumen

Nemo-DE-delib-T5Gemma2 es un modelo de segunda pasada (deliberation) para reconocimiento automatico del habla en aleman, desarrollado por PraxySante. No es un ASR autonomo: se acopla a un transductor FastConformer cache-aware de NeMo que genera una primera hipotesis en tiempo real, y un T5 aleman reescribe los segmentos finalizados utilizando el N-best del mismo encoder junto con el contexto del segmento completo. Un modulo de validacion (EditGuard) filtra cada modificacion antes de aceptarla.

El sistema combina un encoder acustico congelado de 127 M de parametros (EncDecHybridRNNTCTCBPEModel, variante chunked_limited con lookaheads [70,13], [70,6] y [70,1], y cabeza CTC) con un T5Gemma 2 de Google de 786,0 M totales, del que se retiran los 369,2 M de la torre de vision SigLIP para quedarse con 369,2 M efectivos de texto (d_model 640, 18 capas de encoder y 18 de decoder, vocabulario de 262 144 tokens). El fine-tuning es completo, no LoRA.

Su relevancia es acotada pero tecnica: demuestra una arquitectura de rescoring deliberativo sobre ASR en streaming para aleman, con un checkpoint publicado en fp32 (1,99 GB) y resultados de WER medidos sobre un manifiesto de validacion propio. La licencia es "other" y la model card indica explicitamente que no se concede licencia para uso de terceros, lo que limita su aplicacion practica fuera del entorno del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder acustico FastConformer cache-aware (EncDecHybridRNNTCTCBPEModel) congelado + T5Gemma 2 (encoder-decoder transformer) para segunda pasada |
| Parametros totales | 786,0 M en el T5Gemma 2 original; 369,2 M de texto tras retirar la torre SigLIP; encoder acustico de 127 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32) |
| Idiomas soportados | aleman (de) |
| Licencia | other (modelo interno PraxySante; sin licencia para uso de terceros) |
| Formato de pesos | `.pt` (state_dict fp32, clase `DeliberationT5`) |

## Arquitectura y entrenamiento

El modelo es un sistema de dos etapas. La primera etapa es un transductor NeMo aleman en tiempo real (`ASR-DE-Nemo-realtime-v3.nemo`), un EncDecHybridRNNTCTCBPEModel de 127 M con atencion cache-aware chunked_limited y tres configuraciones de lookahead ([70,13], [70,6], [70,1]), que produce hipotesis en streaming y un N-best. La segunda etapa es un T5Gemma 2 de Google (786,0 M totales, 369,2 M de texto tras eliminar la torre de vision SigLIP) con d_model 640, 18 capas de encoder, 18 de decoder y vocabulario de 262 144 tokens, afinado de forma completa sobre los N-best del ASR. El T5 reescribe los segmentos finalizados usando el audio y el contexto del segmento completo, y un guardarrail (EditGuard) valida cada cambio antes de incorporarlo.

El entrenamiento se organizo en fases. La fase 0 entreno el adaptador y el T5Gemma 2 con el encoder congelado (6 H100, lote 240); la fase 2 entreno la deliberacion sobre N-best (4 H100, lote 256). El manifiesto de entrenamiento tiene 825 357 lineas, de las cuales 17 614 no tienen ninguna hipotesis (se ignoran) y 333 844 de las 807 743 restantes solo tienen una hipotesis tras deduplicar (41 %). La distribucion del N-best es 41 % con una hipotesis, 41 % con dos, 15 % con tres y 3 % con cuatro. El checkpoint publicado corresponde a la mejor epoca de la fase 2 (epoca 1), con guardarrail de 12,51 % frente a 13,79 % del brazo GermanT5 de referencia en Nemo-DE-delib-V1. Se requiere `transformers` 5, ya que el modelo T5Gemma 2 no existe en la rama 4.x. La fase 3 (variante con capas altas duplicadas) no se incluye en este repositorio.

## Capacidades

- Reconocimiento automatico del habla en aleman como segunda pasada sobre un ASR en streaming, no como modelo autonomo.
- Rescoring deliberativo de segmentos finalizados a partir del N-best del mismo encoder acustico y del contexto completo del segmento.
- Validacion de ediciones mediante un guardarrail (EditGuard) que filtra supresiones y palabras no sustentadas por el audio.
- Funcionamiento en configuracion cache-aware con tres lookaheads distintos ([70,13], [70,6], [70,1]) heredados del encoder NeMo.
- Soporte de N-best variable (de 1 a 4 hipotesis por segmento en el manifiesto de entrenamiento).
- Normalizacion de texto de salida en minusculas, sin puntuacion y con umlauts transliterados (`ue`, `ae`, `oe`), alineada con las salidas del ASR NeMo aleman.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision: la torre SigLIP se elimina explicitamente en este checkpoint, por lo que no hay capacidad visual.
- Audio: si, como entrada acustica del encoder.

## Casos de uso

- Transcripcion de reuniones y actas en aleman: el sistema puede procesar audio en streaming con el ASR NeMo y aplicar la segunda pasada sobre los segmentos cerrados para reducir errores en nombres propios y terminologia, siempre que se despliegue dentro del entorno autorizado por el autor.
- Subtitulado en directo con correccion diferida: el primer paso cache-aware mantiene la latencia baja y la deliberacion reescribe los segmentos ya finalizados, lo que permite emitir subtitulos provisionales y corregirlos unos segundos despues.
- Post-procesado de transcripciones archivadas: sobre grabaciones ya transcritas por el ASR aleman v3, el T5 puede reescribir cada segmento usando el N-best y el contexto completo, sin necesidad de reejecutar el encoder acustico.
- Investigacion en arquitecturas de deliberacion ASR: el checkpoint y los scripts de reproduccion (`fs_de_t5g_phase0.sbatch`, `fs_de_t5g_phase2.sbatch`, `_cmp_ckpts.py`) sirven como referencia para experimentos de segunda pasada con T5 sobre N-best.
- Evaluacion comparativa de encoders acusticos: al mantener el encoder congelado, permite aislar el efecto del modulo de rescoring sobre distintos N-best y configuraciones de lookahead.
- Benchmarking de WER en aleman sobre dominios especificos: el manifiesto `de_delib_val` (1000 items) y las metricas pooladas permiten replicar la comparacion entre epocas y entre brazos (T5Gemma 2 frente a GermanT5).
- Integracion en pipelines de transcripcion con guardarrail: el EditGuard limita las modificaciones a supresiones y palabras no sustentadas, lo que reduce el riesgo de introducir texto no presente en el audio en entornos donde la fidelidad es critica.

## Benchmarks y rendimiento

Resultados de WER poolados (suma de errores / suma de palabras de referencia) sobre el mismo manifiesto de validacion y la misma configuracion de inferencia. `h1` = primer paso cache-aware; `brut` = salida del T5 tras rescoring; `garde` = tras EditGuard.

| Transeccion | Items | wer_h1 | wer_brut | wer_garde |
|---|---|---|---|---|
| de_delib_val (ep 0) | 1000 | 16,59 | 10,62 | 12,65 |
| de_delib_val (ep 1, mejor) | 1000 | 16,59 | 10,40 | 12,51 |
| de_delib_val (ep 2) | 1000 | 16,59 | 10,68 | 12,77 |
| de_delib_val (ep 3) | 1000 | 16,59 | 10,91 | 12,92 |
| de_delib_val (referencia GermanT5, ep 3) | 1000 | 16,59 | 12,23 | 13,79 |

El mejor checkpoint (epoca 1) reduce el WER del primer paso del 16,59 % al 10,40 % antes del guardarrail y al 12,51 % tras el guardarrail, frente al 13,79 % del brazo GermanT5 de referencia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint en fp32 ocupa 1,99 GB, por lo que en fp32 se necesita al menos esa cantidad mas el overhead de activaciones; el encoder acustico anade 127 M de parametros.
- GPU recomendadas: el entrenamiento se realizo en H100 (6 H100 en fase 0, 4 H100 en fase 2). Para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano de pesos (1,99 GB en fp32) es plausible en GPUs consumer con suficiente VRAM, pero no se documenta.
- Opciones de despliegue: NeMo (libreria declarada del repositorio) y el codigo de deliberacion del autor (`deliberation_qwen.build_from_config`, `deliberation_t5.load_dual_encoder_checkpoint`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (mejor, guardarrail) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemo-DE-delib-T5Gemma2 (ep 1) | 369,2 M texto + 127 M encoder | no disponible | 12,51 % | other (sin licencia a terceros) | HuggingFace (repo de 2,0 GB) |
| Nemo-DE-delib-V1 (brazo GermanT5, ep 3) | no disponible (GermanT5) | no disponible | 13,79 % | no disponible | referenciado en la model card |
| Nemo-DE-delib-T5Gemma2 fase 3 (branch) | no disponible | no disponible | no disponible (pendiente de A/B) | no disponible | no publicado |

No se dispone de datos de otros modelos ASR alemanes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de lexico medico aleman (`risk_csv: null`): el prompt no incluye terminos candidatos y el guardarrail se limita a reglas de forma (supresiones, palabras no sustentadas). El beneficio proviene unicamente del par audio + N-best, no de candidatos lexicos como en la variante francesa.
- N-best desigual: el 41 % de los segmentos con hipotesis solo tiene una tras deduplicar, por lo que la segunda pasada se apoya en el audio y una unica hipotesis; el 17 614 lineas sin hipotesis se ignoran.
- La fase 3 (capas altas duplicadas) no esta incluida en este repositorio; se publicaria por separado si supera el A/B.
- Formato de texto restrictivo: minusculas, sin puntuacion y umlauts transliterados (`ue`, `ae`, `oe`), lo que exige post-procesado para obtener texto legible.
- Licencia "other" sin concesion de uso a terceros: es un modelo interno de PraxySante y no puede usarse comercialmente ni redistribuirse sin autorizacion expresa.
- Dependencia de `transformers` 5: el modelo T5Gemma 2 no existe en la rama 4.x, lo que complica la integracion en stacks con versiones anteriores.
- Riesgo de alucinacion en la reescritura: el T5 puede introducir texto no presente en el audio; el EditGuard mitiga el problema pero no lo elimina, como muestra la diferencia entre WER bruto (10,40 %) y tras guardarrail (12,51 %).
- Sin datos publicados sobre sesgos, contexto maximo ni cuantizaciones disponibles.
- Solo aleman: no hay soporte multilingue declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PraxySante/Nemo-DE-delib-T5Gemma2
- Repositorio NeMo (libreria declarada): https://github.com/NVIDIA/NeMo
- T5Gemma 2 de Google (modelo base del componente T5): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demo: no disponible
