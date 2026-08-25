# ehzawad/stt_bn_fastconformer_hybrid_large

## Resumen

`stt_bn_fastconformer_hybrid_large` es un modelo de reconocimiento automático de voz (ASR) para bengalí (বাংলা), desarrollado por el usuario `ehzawad` y publicado en HuggingFace. Se basa en la arquitectura **FastConformer Hybrid** de NVIDIA NeMo, con 114,6 millones de parámetros, y es una adaptación del checkpoint inglés `nvidia/stt_en_fastconformer_hybrid_large_pc` a la que se le ha incorporado un vocabulario SentencePiece de 256 piezas específico para bengalí. El modelo combina dos cabezas de decodificación que comparten un mismo encoder: **RNNT** (más precisa, usada por defecto) y **CTC** (más rápida), permitiendo cambiar entre ambas en tiempo de ejecución.

El modelo está entrenado exclusivamente para bengalí, sin soporte para code-mixed (banglish) ni multilingüismo. Está pensado para integrarse en pipelines de transcripción de audio, ya sea por lotes o en tiempo real con segmentación previa mediante VAD. En el benchmark oficial sobre el conjunto de test FLEURS `bn_in`, alcanza un WER del 29,26 % con decodificación RNNT greedy y un CER del 8,13 %. Su relevancia radica en ser una opción de código abierto con licencia CC-BY-SA-4.0 para un idioma con escasos recursos de ASR de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer Hybrid (CTC + RNNT) |
| Parametros totales | 114,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no especifica duracion maxima de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bn (bengali) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | NeMo (checkpoint .nemo) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **FastConformer**, una variante eficiente del conformer optimizada para ASR, con dos cabezas de decodificación que comparten un encoder: una cabeza **RNNT** (transducer) y una cabeza **CTC**. Esta configuración híbrida permite elegir entre precisión (RNNT) y velocidad (CTC) sin necesidad de cargar modelos separados. El checkpoint original es el modelo inglés de NVIDIA `stt_en_fastconformer_hybrid_large_pc`, adaptado mediante un vocabulario SentencePiece de 256 piezas entrenado sobre datos bengalíes.

Los datos de entrenamiento provienen de los conjuntos **OpenSLR** y **Google FLEURS**, aunque no se especifica el número total de horas de audio ni la composición exacta del dataset. No se menciona el uso de técnicas de alineamiento adicionales como RLHF o DPO, ya que se trata de un modelo de ASR supervisado de forma clásica. La adaptación se realizó sobre el checkpoint preentrenado en inglés, lo que sugiere un proceso de fine-tuning con datos bengalíes, aunque no se detallan los hiperparámetros ni el número de pasos de entrenamiento.

## Capacidades

- **Reconocimiento de voz en bengalí**: transcribe audio de 16 kHz mono a texto en escritura bengalí.
- **Doble decodificación**: permite alternar entre RNNT (más precisa, WER 29,26 %) y CTC (más rápida, WER 32,86 %) en tiempo de ejecución.
- **Procesamiento por lotes**: soporta `batch_size` configurable para aumentar el throughput.
- **Entrada directa desde array numpy**: acepta buffers de audio en memoria, sin necesidad de archivos temporales, lo que facilita la integración con pipelines de VAD.
- **Inferencia en CPU**: funciona en CPU aunque con rendimiento muy inferior al de GPU.
- **No streaming**: el modelo requiere la utterance completa; no admite decodificación incremental.

## Casos de uso

- **Transcripcion de contenido audiovisual en bengali**: subtitulado automatico de videos, podcasts y programas de television. El modelo puede procesar archivos de audio por lotes con `transcribe_files()`, y su bajo RTF (0,009 en GPU) permite transcribir horas de audio en minutos.
- **Asistentes de voz en bengali**: integracion en aplicaciones de voz para dictado, busqueda por voz o control por comandos. La entrada directa desde array numpy facilita la conexion con un VAD que segmenta la senal en utterances completas.
- **Atencion al cliente automatizada**: transcripcion de llamadas telefonicas en bengali para analisis posterior, deteccion de intenciones o generacion de resumenes. El modelo puede procesar grabaciones de llamadas con tasas de muestreo arbitrarias si se convierten a 16 kHz mono.
- **Investigacion linguistica**: generacion de corpus transcritos a partir de audio en bengali para estudios foneticos o entrenamiento de otros modelos. La licencia CC-BY-SA-4.0 permite su uso en investigacion siempre que los derivados se compartan bajo la misma licencia.
- **Accesibilidad**: transcripcion en tiempo real de reuniones o clases para personas con discapacidad auditiva. Aunque no es streaming, la baja latencia por utterance (segmentada con VAD) permite una experiencia casi en tiempo real.
- **Archivado y busqueda de audio**: indexacion de archivos de audio en bengali mediante transcripcion, habilitando busqueda por texto en bibliotecas de medios o grabaciones de eventos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test oficial FLEURS `bn_in` (920 utterances, 349 transcripciones distintas). Decodificacion greedy sin modelo de lenguaje.

| Cabeza de decodificacion | WER % (IC 95 %) | CER % | Sustituciones / Borrados / Inserciones | Salidas vacias |
|---|---|---|---|---|
| **RNNT** (por defecto) | **29,26** (28,35–30,16) | 8,13 | 24,36 / 3,21 / 1,69 | 0 |
| CTC | 32,86 (31,98–33,75) | 8,83 | 27,82 / 3,24 / 1,81 | 0 |

El autor tambien reporta un WER secundario de 28,74 % usando una tabla de variantes ortograficas aceptadas (diagnostico, no cifra principal). El rendimiento en tiempo real medido en una RTX A6000 con batch de 4 fue de **RTF 0,009** (60 segundos de audio transcritos en 0,54 segundos), aproximadamente 111 veces mas rapido que en tiempo real.

## Requisitos de hardware

- **VRAM estimada**: con 114,6 M de parametros, el modelo en FP32 ocupa unos 460 MB de pesos, pero NeMo añade overhead de memoria para activaciones y buffers. Se estima que cabe en GPUs con 4 GB de VRAM o mas, aunque para batch grandes se recomienda al menos 8 GB.
- **GPU recomendadas**: la RTX A6000 usada en el benchmark es una opcion solida; tambien funcionan RTX 3090, RTX 4090, A10, A100 o cualquier GPU con al menos 8 GB de VRAM. Para produccion con alto throughput, se recomienda una GPU de centro de datos.
- **CPU**: es posible ejecutar el modelo en CPU con `map_location="cpu"`, pero el rendimiento es significativamente inferior; no se recomienda para produccion.
- **Opciones de despliegue**: el modelo se carga mediante NeMo (`nemo_toolkit[asr]`). No se mencionan exportaciones a ONNX, TensorRT ni soporte en vLLM u Ollama, ya que es un modelo ASR y no un LLM. Se puede integrar en servicios con Triton Inference Server, aunque no esta documentado.
- **Latencia y throughput**: RTF 0,009 en RTX A6000 con batch de 4; el throughput aumenta con `batch_size`, pero la memoria pico depende del clip mas largo del lote.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Arquitectura | WER (FLEURS) | Licencia |
|---|---|---|---|---|---|
| **stt_bn_fastconformer_hybrid_large** (este) | bn | 114,6 M | FastConformer Hybrid | 29,26 (RNNT) | CC-BY-SA-4.0 |
| `nvidia/stt_en_fastconformer_hybrid_large_pc` | en | 114,6 M | FastConformer Hybrid | no disponible | CC-BY-4.0 (NVIDIA) |
| `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` | ar | 114,6 M | FastConformer Hybrid | no disponible | CC-BY-4.0 (NVIDIA) |
| `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi` | en | 114,6 M | FastConformer Hybrid streaming | no disponible | CC-BY-4.0 (NVIDIA) |

Los tres modelos de NVIDIA comparten la misma arquitectura base y tamano de parametros, pero estan entrenados para otros idiomas o para streaming. El modelo bengali es una adaptacion del checkpoint ingles, por lo que su rendimiento en FLEURS bn_in es el unico dato publicado. No se han encontrado otros modelos ASR bengalies comparables con benchmarks publicos en la informacion disponible.

## Limitaciones y advertencias

- **Monolingue estricto**: solo bengali; no soporta code-mixed (banglish) ni otros idiomas. Intentar transcribir audio en otro idioma producira resultados incorrectos.
- **No streaming**: el modelo necesita la utterance completa; no es adecuado para transcripcion incremental en tiempo real sin un VAD que segmente correctamente.
- **Requisitos de audio**: exige 16 kHz y mono; cualquier otra tasa o canal debe convertirse previamente, lo que anade un paso de preprocesamiento.
- **Sesgos de datos**: entrenado con OpenSLR y FLEURS, que pueden no representar todas las variantes dialectales del bengali ni contextos ruidosos. El benchmark FLEURS tiene una diversidad linguistica limitada (349 transcripciones unicas en 920 grabaciones).
- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero cualquier obra derivada (por ejemplo, un modelo fine-tuned) debe distribuirse bajo la misma licencia. Esto puede ser restrictivo para integraciones propietarias.
- **Riesgo de alucinacion**: como todo modelo ASR, puede producir transcripciones incorrectas en audio ambiguo o con ruido; se recomienda validacion humana en aplicaciones criticas.
- **Sin informacion sobre cuantizacion**: no se documentan versiones cuantizadas (GGUF, ONNX, etc.), lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ehzawad/stt_bn_fastconformer_hybrid_large)
- [Checkpoint base en ingles (NVIDIA)](https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_pc) (referenciado en la model card)
- [Modelo arabe similar de NVIDIA](https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0)
- [Modelo ingles streaming de NVIDIA](https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi)
