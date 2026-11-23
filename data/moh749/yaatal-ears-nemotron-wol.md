# MOH749/yaatal-ears-nemotron-wol

## Resumen

Yaatal ears es un modelo de reconocimiento automático del habla (ASR) en wolof, obtenido mediante fine-tuning de nvidia/nemotron-3.5-asr-streaming-0.6b, un modelo de la familia Nemotron de NVIDIA orientado a transcripción en streaming. Lo desarrolla MOH749 y se publica bajo el paraguas del proyecto Yaatal. El modelo resuelve un problema concreto: la transcripción de voz en wolof, un idioma de bajos recursos con escasa cobertura en sistemas ASR comerciales, manteniendo la capacidad de streaming del modelo base.

Técnicamente es un FastConformer con decodificador RNNT (transducer) de 648.268.960 parámetros, entrenado con atención cache-aware que permite procesar audio por bloques con contexto limitado. El fine-tuning se realizó sobre las filas en wolof del corpus Bocalantics 2.0, retirando el marcado de anotación, durante 8.000 pasos (run `boca2-wol-v1`, finalizado el 2026-10-03), con un WER de validación de 0,43 en la época 7.

Su relevancia actual radica en que ofrece ASR en streaming para un idioma africano de bajos recursos con un tamaño de 0,6B parámetros, desplegable en hardware modesto, y con pesos publicados en formato NeMo y GGUF. No obstante, el WER de validación de 0,43 es alto en términos absolutos y condiciona seriamente su uso en producción sin revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer), atención cache-aware para streaming |
| Parámetros totales | 648.268.960 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de atención configurable vía `att_context_size` (`[56,6]` = 0,56 s de bloque, `[56,13]` = 1,12 s de bloque) |
| Tipos de cuantización | GGUF (tag del repo); niveles concretos no disponibles |
| Idiomas soportados | wolof (`wo`) |
| Licencia | OpenMDW-1.1 (heredada del modelo base); verificar licencias de los datasets de origen de Bocalantics 2.0 |
| Formato de pesos | NeMo (`.nemo`); GGUF |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una variante del Conformer con downsampleado de la secuencia de entrada que reduce el coste computacional en tareas de audio. El decodificador es un RNNT (Recurrent Neural Network Transducer), que combina un predictor y un joiner para emitir tokens de forma incremental sin necesidad de ventanas completas de audio. La atención cache-aware permite streaming real: el modelo mantiene una caché de estados de atención y procesa el audio en bloques con un contexto limitado configurable (`[56,6]` o `[56,13]`), lo que habilita transcripción de baja latencia.

El entrenamiento consistió en un fine-tuning de 8.000 pasos sobre las filas en wolof del corpus Bocalantics 2.0, con el marcado de anotación eliminado (run `boca2-wol-v1`, finalizado el 2026-10-03). El WER de validación reportado es 0,43 en la época 7. El autor indica que el wolof se entrenó en la ranura de prompt de idioma 105 y que la copia `boca2-wol-v1-wo.nemo` renombra esa ranura a `wo` para que `target_lang=wo` funcione. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR transducer, pero no confirmado).

## Capacidades

- Reconocimiento automático del habla en wolof, en modo streaming con bloques de 0,56 s o 1,12 s.
- Transcripción incremental de baja latencia gracias a la atención cache-aware y al decodificador RNNT.
- Selección de idioma mediante prompt (`target_lang=wo`), con la ranura 105 remapeada a `wo`.
- Eliminación de etiquetas de idioma en la salida (`strip_lang_tags=true`).
- Inferencia por lotes (`batch_size`) sobre manifiestos JSONL de NeMo.
- Despliegue en formato GGUF además del formato nativo NeMo.
- No se documentan capacidades de traducción, diarización, puntuación, tool calling ni agentes; el modelo es específicamente ASR.

## Casos de uso

- Transcripción de audio en wolof para archivística y documentación lingüística: el modelo permite convertir grabaciones de campo en texto alineado, con la ventaja de que el streaming permite procesar ficheros largos por bloques sin cargar todo el audio en memoria.
- Subtitulado en directo de emisiones de radio o televisión en wolof: los bloques de 0,56 s ofrecen latencia baja suficiente para subtítulos casi en tiempo real, aunque el WER de 0,43 exige revisión humana.
- Asistentes de voz para servicios públicos en Senegal y la diáspora: integrado en un pipeline de ASR más NLU, el modelo transcribe consultas habladas en wolof para su posterior procesamiento.
- Generación de corpus paralelos voz-texto para entrenar otros modelos: las transcripciones sirven como pseudoetiquetas para modelos mayores, con filtrado por confianza.
- Investigación en ASR de bajos recursos: el repositorio incluye la receta `ears_run.py`, lo que facilita reproducir el fine-tuning y adaptarlo a otros idiomas de Bocalantics.
- Despliegue en edge o hardware modesto: con 648M parámetros y pesos GGUF, puede ejecutarse en dispositivos con recursos limitados para aplicaciones de dictado offline en wolof.
- Moderación y análisis de contenido audio en plataformas comunitarias: transcripción por lotes de grandes volúmenes de audio en wolof para búsqueda y clasificación posterior.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| WER de validación | 0,43 | Época 7, run `boca2-wol-v1`, corpus Bocalantics 2.0 (wolof) |

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni comparativas con otros modelos ASR en wolof).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 648M parámetros, en fp32 serían aproximadamente 2,6 GB de pesos, y en cuantizaciones de 8 bits o 4 bits, alrededor de 0,7-1,3 GB, más los estados de caché de atención y el decodificador RNNT.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer de gama media (RTX 3060, RTX 4060) o incluso CPU debería bastar para inferencia en streaming con `batch_size=1`.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; no confirmado por el autor.
- Opciones de despliegue: NeMo (script `speech_to_text_cache_aware_streaming_infer.py`), y GGUF a través de runtimes compatibles (no se especifica cuál).
- Latencia y throughput estimados: no disponibles; la latencia depende del bloque elegido (0,56 s o 1,12 s de contexto de atención).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaatal ears (este modelo) | 648M | Cache-aware, bloques de 0,56 s o 1,12 s | Wolof | OpenMDW-1.1 | Hugging Face (NeMo + GGUF) |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | Cache-aware streaming | Multilingüe (no detallado) | OpenMDW-1.1 | Hugging Face |
| Alternativas ASR en wolof | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en wolof en la información proporcionada.

## Limitaciones y advertencias

- WER de validación de 0,43: es un error elevado; en producción requiere revisión humana o postprocesado, y no es adecuado para transcripción legal o médica sin verificación.
- Entrenado únicamente con las filas en wolof de Bocalantics 2.0 (8.000 pasos): la cobertura de acentos, dialectos y condiciones acústicas puede ser limitada y sesgada hacia la distribución del corpus.
- Riesgo de alucinación en pasajes de audio ruidoso, silencioso o con habla solapada, habitual en modelos transducer.
- Monolingüe: no transcribe otros idiomas; el prompt de idioma solo selecciona la ranura 105 remapeada a `wo`.
- La licencia OpenMDW-1.1 se hereda del modelo base; el autor advierte de verificar las licencias de los datasets de origen de Bocalantics 2.0 antes de redistribuir datos derivados.
- El repositorio ocupa 69,0 GB, lo que incluye pesos, recetas y artefactos; conviene descargar solo los ficheros necesarios.
- No hay información sobre sesgos demográficos ni evaluación por subgrupos.
- La configuración de streaming exige usar la copia `boca2-wol-v1-wo.nemo` para que `target_lang=wo` funcione; usar `boca2-wol-v1.nemo` requiere ajustar la ranura manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MOH749/yaatal-ears-nemotron-wol
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Script de inferencia cache-aware de NeMo: `NeMo/examples/asr/asr_cache_aware_streaming/speech_to_text_cache_aware_streaming_infer.py` (incluido en el repositorio de NeMo)
