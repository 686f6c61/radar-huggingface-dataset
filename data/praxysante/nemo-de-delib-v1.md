# PraxySante/Nemo-DE-delib-V1

## Resumen

Nemo-DE-delib-V1 es un módulo de segunda pasada (deliberation) para el sistema de reconocimiento automático del habla (ASR) alemán de PraxySante, construido sobre el transductor FastConformer cache-aware de NeMo. El primer paso sigue siendo el modelo NeMo en tiempo real; sobre los segmentos ya finalizados, un modelo T5 alemán reescribe el texto a partir del N-best del mismo codificador y del contexto completo del segmento. Un mecanismo denominado EditGuard valida después cada modificación antes de aceptarla.

El modelo combina un codificador acústico congelado (EncDecHybridRNNTCTCBPEModel, 127 M de parámetros, con lookaheads configurables de [70,13], [70,6] y [70,1] y cabeza CTC) con un T5 eficiente de 142,3 M de parámetros (d_model 512, 32 capas de codificador y 6 de decodificador, activación ReLU, licencia MIT). El checkpoint publicado contiene el state_dict completo en fp32 de la clase `DeliberationT5`, con un tamaño de 1,08 GB.

Su relevancia radica en que aplica deliberación solo a segmentos finalizados, lo que permite mejorar la precisión sin romper el flujo de streaming, y en que cuantifica el compromiso entre ganancia bruta del T5 y pérdida introducida por el guardián de ediciones: en el conjunto de validación alemán de 1000 ítems, la segunda pasada reduce el WER de 16,59 a 12,23, y el guardián lo deja en 13,79. Es un modelo de uso interno, sin licencia para terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador FastConformer cache-aware (EncDecHybridRNNTCTCBPEModel) congelado + T5 eficiente (encoder 32 capas, decoder 6 capas) para deliberación |
| Parametros totales | No disponible como cifra única; codificador 127 M + T5 142,3 M (medidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el checkpoint se publica en fp32) |
| Idiomas soportados | Alemán (de) |
| Licencia | other (modelo interno PraxySante, sin licencia para uso de terceros) |
| Formato de pesos | PyTorch state_dict (`Nemo-DE-delib-V1.pt`, fp32, clase `DeliberationT5`) |

## Arquitectura y entrenamiento

El sistema es un esquema de dos pasadas. La primera pasada es el ASR NeMo en tiempo real, un modelo híbrido RNNT/CTC con codificador FastConformer cache-aware y lookaheads de [70,13], [70,6] y [70,1], que genera el N-best. La segunda pasada es un T5 alemán (`GermanT5/t5-efficient-gc4-all-german-small-el32`) que recibe el audio del segmento finalizado junto con el N-best del mismo codificador y reescribe el texto. El codificador acústico está congelado durante todo el entrenamiento; solo se entrena el adaptador y el T5.

El entrenamiento consta de dos fases documentadas: una fase 0 de 6 épocas con audio únicamente y una fase 2 de 4 épocas sobre el N-best, ejecutadas sobre 8 GPU H100. El checkpoint publicado corresponde al `ckpt_de_phase2/best.pt`. Los hiperparámetros de inferencia (`decode`, `num_beams`, `w_t5`, `w_ctc`) y los umbrales del guardián EditGuard residen en `configs/phase2_delib.yaml`. El state_dict incluye ya los pesos del codificador (`frontend.*`), por lo que el `.nemo` de referencia y el repositorio GermanT5 solo se emplean para construir los módulos y aportar el tokenizer.

## Capacidades

- Reconocimiento automático del habla en alemán con salida en minúsculas, sin puntuación y con umlauts transliterados (`ue`, `ae`, `oe`), coherente con las salidas del NeMo alemán.
- Segunda pasada de deliberación sobre segmentos finalizados: reescritura del texto a partir del audio y del N-best del mismo codificador.
- Rescoring del N-best mediante ponderación combinada de T5 y CTC (`w_t5`, `w_ctc`).
- Guardián de ediciones (EditGuard) que valida cada modificación y descarta supresiones y palabras no sustentadas por el audio.
- Funcionamiento en modo streaming: la primera pasada opera en tiempo real con lookaheads configurables y la deliberación se aplica solo a segmentos cerrados.
- No se documentan capacidades de tool calling, agentes, visión, audio multimodal ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y actas en alemán: el primer paso cache-aware mantiene la latencia baja durante la captura y la deliberación reescribe cada intervención al cerrarse el segmento, reduciendo el WER de 16,59 a 13,79 en el conjunto de validación.
- Subtitulado y post-edición de vídeo en alemán: la salida en minúsculas sin puntuación encaja con un pipeline posterior de restauración de puntuación y mayúsculas, y el guardián limita las ediciones erróneas del T5.
- Dictado clínico o administrativo en alemán: útil cuando se dispone de audio de calidad media y se prioriza reducir errores de sustitución, aunque sin léxico médico específico (el prompt no incluye términos candidatos).
- Transcripción de llamadas de atención al cliente: el esquema de dos pasadas permite servir la transcripción en directo y refinarla al final de cada turno, manteniendo coherencia entre el N-best y el texto final.
- Archivado y búsqueda de audio en alemán: la mejora de WER sobre segmentos finalizados reduce el coste de indexación y aumenta la recuperación de términos en búsquedas posteriores.
- Evaluación comparativa de sistemas ASR: el par de checkpoints (fase 0 y fase 2) y el manifiesto `de_delib_val.jsonl` permiten reproducir el A/B entre primera pasada, salida T5 bruta y salida tras EditGuard.
- Integración en pipelines NeMo existentes: al cargarse como `DeliberationT5` con `build_from_config` y `load_dual_encoder_checkpoint`, se inserta como etapa posterior al ASR en tiempo real sin sustituir el decodificador en producción.

## Benchmarks y rendimiento

WER agrupado (suma de errores dividida entre suma de palabras de referencia) sobre el mismo manifiesto de validación y la misma configuración de inferencia. `h1` es la primera pasada cache-aware, `brut` la salida del T5 tras rescoring y `garde` el resultado tras EditGuard.

| Tranche | Items | ckpt_de_phase0 (h1 / brut / garde) | ckpt_de_phase2 (h1 / brut / garde) |
|---|---|---|---|
| de_delib_val | 1000 | 16,59 / 13,68 / 14,91 | 16,59 / 12,23 / 13,79 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 1,08 GB en fp32; con overhead de activaciones y del codificador acústico, cabe holgadamente en GPU de consumo, aunque no se publica una cifra oficial de VRAM.
- GPU de entrenamiento documentadas: 8 H100 para cada fase (fase 0 y fase 2).
- GPU recomendadas para inferencia: no disponible de forma explícita; por tamaño, una RTX 4090 o superior es suficiente para alojar los pesos en fp32, y GPU de datacenter (A100, H100) para lotes grandes.
- Despliegue: la librería es NeMo; la carga se realiza con `build_from_config` y `load_dual_encoder_checkpoint` desde el código de deliberación del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño separa la primera pasada en tiempo real de la deliberación sobre segmentos cerrados, lo que evita añadir latencia al flujo de streaming, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| Nemo-DE-delib-V1 | Codificador 127 M + T5 142,3 M | No disponible | Alemán | other (uso interno) | Segunda pasada de deliberación sobre ASR cache-aware |
| Whisper large-v3 | No disponible en la información | No disponible | Multilingüe | No disponible en la información | ASR extremo a extremo |
| NeMo FastConformer alemán (primera pasada) | 127 M | No disponible | Alemán | No disponible en la información | ASR en streaming |
| GermanT5 small el32 | 142,3 M | No disponible | Alemán | MIT | Modelo de lenguaje T5 |

No se dispone de datos de benchmarks comparativos con estos modelos en la información proporcionada; la única comparación cuantitativa publicada es interna, entre las fases 0 y 2 del propio sistema.

## Limitaciones y advertencias

- Sin léxico médico alemán (`risk_csv: null`): el prompt no incluye términos candidatos y el guardián se limita a reglas de forma (supresiones y palabras no sustentadas). La ganancia procede solo del par audio + N-best.
- La fase 3 «en branche» (capas altas duplicadas, `phase3_branch.yaml`) no está incluida; este repositorio publica únicamente la fase 2.
- Formato de texto restringido: minúsculas, sin puntuación y umlauts transliterados, lo que exige un postprocesado para texto de presentación.
- Licencia `other` con restricción explícita: modelo interno de PraxySante sin licencia concedida para uso de terceros; no es apto para uso comercial sin autorización.
- Riesgo de alucinación y de ediciones no sustentadas por el audio: el T5 puede introducir sustituciones; por eso existe EditGuard, que en el conjunto de validación recupera parte de la ganancia (de 12,23 a 13,79 de WER).
- Cobertura monolingüe: solo alemán, sin capacidades multilingües documentadas.
- Dependencia del código de deliberación del autor (`deliberation_qwen`, `deliberation_t5`, `configs/phase2_delib.yaml`), no incluido en el repositorio de pesos; sin ese código el checkpoint no es directamente utilizable.
- Sin métricas publicadas de latencia, throughput ni consumo de VRAM en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PraxySante/Nemo-DE-delib-V1
- Codificador de referencia: ASR-DE-Nemo-realtime-v3.nemo (no se proporciona URL)
- T5 base: GermanT5/t5-efficient-gc4-all-german-small-el32 (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
