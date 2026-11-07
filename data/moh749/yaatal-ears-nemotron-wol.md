# MOH749/yaatal-ears-nemotron-wol

## Resumen

Yaatal ears es un ajuste fino del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b` especializado en **wolof** (`wo`), una lengua de la familia nigerocongolesa hablada principalmente en Senegal, Gambia y Mauritania. Lo desarrolla MOH749 (Mouhamed NDIAYE) y se distribuye bajo el paraguas del proyecto "Yaatal ears". El modelo parte de una arquitectura FastConformer con decodificador RNNT y está diseñado para inferencia en *streaming* con atención cache-aware, lo que permite transcripción incremental con latencias de chunk de 0,56 s o 1,12 s.

El ajuste se realizó sobre las filas en wolof del corpus Bocalantics 2.0 (con el marcado de anotación eliminado), en la ejecución `boca2-wol-v1` de 8.000 pasos, finalizada el 3 de octubre de 2026. El modelo reporta un WER de validación de 0,43 en la época 7, lo que lo sitúa como una pieza útil para ASR de wolof pero con margen claro de mejora.

Con 648.268.960 parámetros totales (aproximadamente 0,6B), el modelo es ligero y está pensado para despliegue en entornos con recursos limitados. Se publica en formato NeMo (`.nemo`) y también existe una variante ONNX en el mismo espacio de autor, lo que facilita su integración en pipelines de producción fuera del ecosistema NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer), atención cache-aware para streaming |
| Parametros totales | 648.268.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención configurable vía `att_context_size`; `[56,6]` = 0,56 s de chunk, `[56,13]` = 1,12 s) |
| Tipos de cuantizacion | no disponible (existe variante ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | NeMo (`.nemo`); variante ONNX en repo separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/nemotron-3.5-asr-streaming-0.6b`, que emplea una arquitectura FastConformer (variante de Conformer con downsampling agresivo en la capa de entrada) combinada con un decodificador RNNT. La característica principal es el mecanismo de atención cache-aware, que permite procesar audio en *streaming* manteniendo una caché de estados de atención y limitando el contexto a una ventana configurable. Esto posibilita transcripción en tiempo real con latencias controladas por el parámetro `att_context_size`.

El entrenamiento consistió en un fine-tune sobre las filas en wolof del corpus Bocalantics 2.0, tras eliminar el marcado de anotación. Se ejecutó la receta `boca2-wol-v1` durante 8.000 pasos, finalizada el 3 de octubre de 2026. El WER de validación reportado es 0,43 en la época 7. Un detalle técnico relevante: el wolof se entrenó en la ranura de *language prompt* 105, y la copia `boca2-wol-v1-wo.nemo` renombra esa ranura a `wo` para que `target_lang=wo` funcione correctamente. No se detallan en la información disponible el número total de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables típicamente a ASR).

## Capacidades

- Reconocimiento automático del habla en wolof, con salida de transcripción de audio.
- Inferencia en *streaming* con atención cache-aware, configurable mediante `att_context_size` (`[56,6]` para chunks de 0,56 s; `[56,13]` para chunks de 1,12 s).
- Soporte de *language prompt* mediante `target_lang=wo`, con la ranura 105 remapeada en la copia `-wo`.
- Eliminación opcional de etiquetas de idioma en la salida (`strip_lang_tags=true`).
- Procesamiento por lotes (`batch_size` configurable) sobre manifiestos JSONL.
- Compatibilidad con el ecosistema NeMo para inferencia y evaluación.
- Variante ONNX disponible para despliegue fuera de NeMo.
- No se documentan capacidades de traducción, diarización, puntuación automática ni detección de idioma.

## Casos de uso

- **Transcripción de audio en wolof para medios de comunicación**: el modelo puede procesar emisiones de radio o televisión en wolof y generar transcripciones con chunks de 0,56 s o 1,12 s, adecuado para subtitulado casi en tiempo real.
- **Atención al cliente en centros de llamadas**: integrado en un pipeline de streaming, permite transcribir conversaciones telefónicas en wolof para su posterior análisis, búsqueda o cumplimiento normativo, con latencia controlada por `att_context_size`.
- **Documentación de lenguas minoritarias**: útil en proyectos lingüísticos y de preservación del wolof, generando corpus transcritos a partir de grabaciones de campo.
- **Accesibilidad y subtitulado en directo**: la variante de chunk de 0,56 s permite alimentar sistemas de subtitulado en vivo para eventos o clases en wolof.
- **Análisis de contenido audiovisual**: transcripción masiva por lotes de archivos de audio en wolof para indexación y búsqueda semántica en archivos de medios.
- **Investigación en ASR de bajos recursos**: el modelo sirve como línea base reproducible (receta `ears_run.py` incluida) para experimentos de fine-tuning en wolof y otras lenguas africanas.
- **Despliegue en entornos con recursos limitados**: con ~0,6B parámetros y variante ONNX, puede ejecutarse en infraestructura modesta o en el borde, siempre que se valide la latencia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| WER de validación (wolof) | 0,43 | Época 7, ejecución `boca2-wol-v1` |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje. Tampoco se detallan métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,6B parámetros, la inferencia en precisión nativa requiere del orden de 2-3 GB, y menos en cuantización (no se documentan cuantizaciones concretas).
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: NeMo (script `speech_to_text_cache_aware_streaming_infer.py`), variante ONNX para runtimes compatibles; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR NeMo).
- Latencia y throughput estimados: no disponibles; la latencia depende del chunk configurado (0,56 s o 1,12 s) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOH749/yaatal-ears-nemotron-wol | 648.268.960 | ventana configurable (0,56 s / 1,12 s) | wolof | OpenMDW-1.1 | NeMo, ONNX |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~0,6B | ventana configurable | multilingüe (no detallado) | OpenMDW-1.1 | NeMo |
| MOH749/yaatal-ears-nemotron-wol-onnx | no disponible | no disponible | wolof | no disponible | ONNX |

No se dispone de datos de benchmarks comparativos con otros modelos ASR de wolof en la información proporcionada. La comparación con el modelo base es la más directa: mismo tamaño y arquitectura, pero especializado en wolof mediante fine-tune.

## Limitaciones y advertencias

- **WER elevado**: el WER de validación de 0,43 indica un margen de error considerable; no es adecuado para transcripción de alta precisión sin revisión humana.
- **Monolingüe**: solo soporta wolof; no se documenta capacidad multilingüe ni detección de idioma.
- **Sesgos de dominio**: entrenado únicamente sobre las filas en wolof de Bocalantics 2.0, por lo que puede generalizar mal a otros dominios, acentos o variedades dialectales del wolof.
- **Riesgo de alucinación**: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con solapamiento de hablantes.
- **Licencia**: hereda OpenMDW-1.1 del modelo base; es necesario verificar las licencias de los datasets fuente de Bocalantics 2.0 antes de redistribuir datos derivados.
- **Formato y ecosistema**: el uso principal requiere NeMo; la variante ONNX existe pero no se detallan sus características ni su licencia.
- **Detalle de configuración**: es imprescindible cargar `boca2-wol-v1-wo.nemo` (no `boca2-wol-v1.nemo`) para que `target_lang=wo` funcione, ya que la ranura 105 se remapea solo en esa copia.
- **Documentación escasa**: no se detallan cuantizaciones, latencias medidas, composición del dataset ni número de horas de audio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MOH749/yaatal-ears-nemotron-wol
- Variante ONNX: https://huggingface.co/MOH749/yaatal-ears-nemotron-wol-onnx
- Perfil del autor: https://huggingface.co/MOH749
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
