# mehdi-hf/nemotron-asr-streaming-farsi

## Resumen

nemotron-asr-streaming-farsi es un modelo de reconocimiento automático del habla (ASR) para persa (farsi) publicado por el usuario mehdi-hf, obtenido por ajuste fino del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b sobre la ranura de idioma fa-IR que NVIDIA reservó en dicho modelo. Cuenta con 622.544.385 parámetros y combina un codificador FastConformer con un decodificador RNN-T, con pesos distribuidos en safetensors y en formato nativo de NeMo.

Su característica diferencial es el funcionamiento en streaming real: transcribe audio fragmento a fragmento mediante atención con caché (cache-aware streaming), con un look-ahead configurable de 1,12 s para máxima precisión o de 0,32 s para menor latencia, y admite también la transcripción de archivos completos con el mismo modelo.

El modelo es relevante porque el persa tiene una cobertura limitada en ASR abierto. El autor reporta una reducción del WER en FLEURS persa del 24,23 % de la alternativa previa de NVIDIA al 8,81 %, y una mejora aproximadamente a la mitad en habla conversacional (25,95 % frente a 54,35 %). El ajuste se realizó con 1.181 horas de audio persa con licencia abierta y un tokenizador persa nuevo de 1.024 piezas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + RNN-T (decodificador), ASR con cache-aware streaming |
| Parámetros totales | 622.544.385 (≈0,62 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de tokens; procesa audio por fragmentos con caché atencional y look-ahead configurable de 0,32 s o 1,12 s |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; pesos en safetensors y `.nemo`) |
| Idiomas soportados | Persa (farsi) únicamente. El prompt acepta `fa-IR`, `fa` o `auto`, y los tres seleccionan el prompt persa |
| Licencia | openmdw-1.1 (identificador `other` en el repositorio) |
| Formato de pesos | safetensors (raíz del repositorio) y `.nemo` (NeMo) |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Look-ahead | 13 tokens = 1,12 s; 3 tokens = 0,32 s (por defecto); también 6 y 0 |
| Tokenizador | Persa, 1.024 piezas, específico para este ajuste |
| Tamaño del repositorio | 5,0 GB |
| Librerías compatibles | NeMo y Transformers (≥5.18) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema FastConformer + RNN-T del modelo base: un codificador Conformer con subsampling convolucional rápido y un decodificador transductor recurrente (RNN-T) que evita la necesidad de un modelo de lenguaje externo. El entrenamiento se realizó en modo streaming cache-aware, de modo que la inferencia por fragmentos con caché reproduce el régimen de entrenamiento. El autor indica que los pesos de Transformers son idénticos bit a bit a los del archivo `.nemo` y que la inferencia por utterance completo coincide con la streaming con una diferencia máxima de 0,15 puntos de WER.

El ajuste fino empleó 1.181 horas de voz persa con licencia abierta, procedentes de los conjuntos `farsi-asr/farsi-asr-dataset`, `PerSets/youtube-persian-asr`, `PerSets/filimo-persian-asr` y `MahtaFetrat/Mana-TTS`, y se aplicó sobre la ranura de idioma `fa-IR` reservada por NVIDIA en el modelo base. Se añadió un tokenizador persa nuevo de 1.024 piezas. No se especifica en la información disponible si hubo etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan el número total de tokens de audio ni la composición exacta por dominio dentro de las 1.181 horas. El ajuste fino debe hacerse con NeMo: Transformers 5.18 no puede calcular la pérdida de entrenamiento de `Nemotron3_5AsrForRNNT` y recurre a una pérdida de LM causal, limitación que comparte con el modelo original de NVIDIA.

## Capacidades

- Transcripción de voz a texto en persa (farsi) en modo streaming fragmento a fragmento, con caché atencional.
- Transcripción offline de archivos de audio completos con el mismo conjunto de pesos.
- Control de latencia mediante look-ahead: 0,32 s (menor latencia) o 1,12 s (mayor precisión), con valores intermedios de 6 y 0 tokens.
- Normalización robusta de texto persa: ZWNJ tratado como espacio, eliminación de puntuación, plegado de formas de letras árabes a persas y números escritos en palabras, de modo que `می‌رود` y `می رود` no se cuentan como error.
- Streaming incremental con `TextIteratorStreamer` en Transformers, apto para transcripción en vivo desde micrófono.
- Ejecución local: el repositorio de código incluye una aplicación web local para transcripción con micrófono.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico.
- No soporta visión, audio generativo ni otros idiomas distintos del persa; el resto de idiomas del modelo base no funcionan.

## Casos de uso

- Subtitulado en directo de contenido persa: con un look-ahead de 0,32 s, el modelo permite generar subtítulos con latencia baja para emisiones en directo en YouTube o plataformas de vídeo, manteniendo el WER en el 28,04 % en habla conversacional de vídeo.
- Transcripción de archivos de vídeo y cine: el modo offline con look-ahead de 1,12 s procesa lotes de archivos completos y reduce el error en habla conversacional al 25,95 %, lo que lo hace adecuado para indexar catálogos audiovisuales en persa.
- Atención al cliente telefónica: con un WER del 19,12 % en Common Voice 22, el modelo puede transcribir conversaciones de contact center para generar resúmenes, métricas de calidad y búsqueda posterior sobre las transcripciones.
- Asistentes de voz en tiempo real en local: al ejecutarse en NeMo o Transformers sobre GPU de consumo, permite integrar dictado o comandos por voz en aplicaciones de escritorio o web sin enviar audio a servicios externos.
- Accesibilidad para personas sordas: generación automática de subtítulos para vídeo y audio en persa, con soporte de normalización de ZWNJ y variantes ortográficas que evita falsos errores en la representación final.
- Investigación lingüística y análisis de corpus orales: transcripción de entrevistas, grabaciones de campo o corpus conversacionales con marcas de tiempo y evaluación reproducible mediante WER/CER.
- Moderación y análisis de contenido audiovisual: transcripción masiva de vídeos para búsqueda por palabras clave, detección de temáticas y cumplimiento normativo.
- Documentación clínica o legal dictada en persa: transcripción offline con despliegue on-premise, sin dependencia de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en el model-index). Todas las cifras proceden de inferencia streaming real fragmento a fragmento con el script cache-aware de NeMo y decodificación greedy. Formato WER / CER en porcentaje; menor es mejor.

| Conjunto de evaluación | Clips | NVIDIA `stt_fa_fastconformer_hybrid_large` (zero-shot, CTC) | Este modelo, look-ahead 0,32 s | Este modelo, look-ahead 1,12 s |
|---|---|---|---|---|
| FLEURS fa test (habla leída) | 852 | 24,23 / 7,58 | 9,03 / 3,03 | 8,81 / 2,94 |
| Test conversacional retenido (YouTube, cine) | 9.154 | 54,35 / 30,74 | 28,04 / 16,74 | 25,95 / 15,11 |
| Dev conversacional retenido | 5.791 | 57,43 / 34,12 | 31,63 / 19,68 | 29,59 / 17,94 |
| Common Voice 22 fa test | 10.661 | No comparable (véase nota) | 19,94 / 6,09 | 19,12 / 5,80 |

Notas aportadas por el autor:

- La comparación con `stt_fa` en Common Voice no es válida porque ese modelo se entrenó con Common Voice y reproduce la mayoría de sus frases de test; este modelo no incluye Common Voice ni FLEURS en su entrenamiento.
- Los conjuntos conversacionales retenidos usan referencias derivadas de subtítulos, no verificadas manualmente, por lo que parte del error medido corresponde a erratas de etiquetado.
- La inferencia por utterance completo coincide con la streaming dentro de 0,15 puntos de WER en todos los conjuntos.
- Comparación entre backends en FLEURS (852 clips): 8,81 % WER con Transformers frente a 8,77 % con NeMo con look-ahead de 1,12 s; 9,02 % frente a 9,13 % con 0,32 s. En streaming, 98 de cada 100 transcripciones fueron idénticas.

## Requisitos de hardware

- VRAM estimada (solo pesos, calculada a partir de 622.544.385 parámetros): ≈2,5 GB en FP32, ≈1,25 GB en BF16/FP16 y ≈0,62 GB en INT8. Hay que sumar el consumo de activaciones y de la caché de atención, mayor con look-ahead de 1,12 s que con 0,32 s.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, así como en iGPU o CPU con memoria compartida suficiente para el modo FP32.
- GPU recomendadas para producción: NVIDIA T4, L4, A10 o L40S para servicio continuo; A100 o H100 si se necesita alto throughput por lotes.
- Opciones de despliegue: NeMo (archivo `.nemo`) y Transformers ≥5.18 con `AutoModelForRNNT` y `AutoProcessor`, incluyendo `TextIteratorStreamer` para streaming en vivo. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para esta arquitectura.
- Latencia algorítmica: determinada por el look-ahead, 0,32 s o 1,12 s. Throughput (RTF, audio procesado por segundo) y latencia extremo a extremo en producción: no disponibles en la información proporcionada.
- La decodificación es greedy, sin beam search ni modelo de lenguaje externo, lo que simplifica el despliegue y mantiene el consumo de memoria acotado.

## Comparativa con modelos similares

| Modelo | Parámetros | Streaming | WER FLEURS fa (1,12 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mehdi-hf/nemotron-asr-streaming-farsi | 622,5 M | Sí, cache-aware con look-ahead 0,32/1,12 s | 8,81 | openmdw-1.1 | HuggingFace (safetensors y `.nemo`) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ≈0,6 B | Sí, multilingüe | No disponible para persa (la ranura `fa-IR` estaba reservada y sin ajustar) | No disponible en la información proporcionada | HuggingFace (NVIDIA) |
| NVIDIA `stt_fa_fastconformer_hybrid_large` | No disponible | No (evaluado en zero-shot con CTC) | 24,23 | No disponible en la información proporcionada | Catálogo de NVIDIA |
| Whisper large-v3 (OpenAI) | ≈1.550 M | No nativo (ventanas de 30 s) | No disponible en la información proporcionada | MIT | HuggingFace, múltiples formatos |

La comparación directa de WER solo está documentada frente a `stt_fa_fastconformer_hybrid_large` y en los conjuntos indicados. Para Whisper large-v3 no se aportan cifras en persa en la información disponible, por lo que la comparación se limita a parámetros, modalidad de streaming y licencia.

## Limitaciones y advertencias

- Monolingüe: solo persa. El resto de idiomas del modelo base no están soportados, ya que el ajuste se hizo sobre la ranura `fa-IR` reservada.
- Los resultados de los conjuntos conversacionales retenidos usan referencias derivadas de subtítulos sin verificación manual, por lo que el WER publicado mezcla errores del modelo con erratas de etiquetado.
- El WER en habla conversacional sigue siendo alto en términos absolutos (25,95 % en test, 29,59 % en dev), muy por encima del 8,81 % en habla leída de FLEURS.
- Riesgo de alucinación y de sustituciones en audio con ruido, solapamiento de hablantes, acentos no representados o vocabulario técnico ausente en los datos de entrenamiento (YouTube, cine y TTS).
- Sesgo potencial hacia el registro y los dominios de las fuentes de entrenamiento (vídeo de YouTube, cine iraní, TTS), con menor cobertura de habla espontánea de otras variedades dialectales del persa.
- No hay verificación independiente de los benchmarks: el model-index marca los resultados como `verified: false` y proceden del propio autor.
- El ajuste fino adicional requiere NeMo; el flujo de entrenamiento con Transformers 5.18 no calcula correctamente la pérdida de este modelo.
- La licencia es openmdw-1.1, registrada como `other` en el repositorio. Antes de un uso comercial conviene revisar los términos completos en el enlace de licencia, ya que no se detallan en la información proporcionada.
- No se publican variantes cuantizadas ni formatos optimizados (GGUF, ONNX, TensorRT), lo que limita el despliegue en entornos sin NeMo o Transformers.
- No se documentan requisitos de memoria de activaciones ni cifras de throughput, por lo que el dimensionamiento de producción debe medirse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio de código (preparación de datos, entrenamiento, evaluación e inferencia): https://github.com/mallahyari/nemotron-asr-streaming-farsi
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Conjunto de datos `farsi-asr/farsi-asr-dataset`: https://huggingface.co/datasets/farsi-asr/farsi-asr-dataset
- Conjunto de datos `PerSets/youtube-persian-asr`: https://huggingface.co/datasets/PerSets/youtube-persian-asr
- Conjunto de datos `PerSets/filimo-persian-asr`: https://huggingface.co/datasets/PerSets/filimo-persian-asr
- Conjunto de datos `MahtaFetrat/Mana-TTS`: https://huggingface.co/datasets/MahtaFetrat/Mana-TTS
- Conjunto de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Common Voice 22.0 (persa): https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Artículo técnico o publicación asociada: no disponible en la información proporcionada
