# csikasote/omniASR-CTC-300M-v2-Zulu-RDM-ANV

## Resumen

omniASR-CTC-300M-v2-Zulu-RDM-ANV es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con cabecera CTC, publicado por el usuario csikasote en HuggingFace. Se trata de una conversión a la clase `Wav2Vec2ForCTC` de Transformers del checkpoint fairseq2 `omniASR_CTC_300M_v2`, perteneciente al proyecto OmniLingual de Meta (facebookresearch). El modelo emite logits CTC sobre un vocabulario SentencePiece de 10.288 tokens y, según su model card, puede transcribir voz en varios idiomas.

El modelo cuenta con 325.983.920 parámetros reales (verificados en safetensors), 24 capas de encoder, tamaño oculto de 1.024, 16 cabezas de atención y FFN intermedio de 4.096, lo que lo sitúa en la misma escala que wav2vec2-large. El repositorio ocupa 1,3 GB. Su relevancia radica en que traslada al ecosistema Transformers un checkpoint entrenado originalmente en fairseq2, lo que facilita su uso con las herramientas habituales de HuggingFace (pipeline de ASR, `AutoProcessor`, despliegue con endpoints).

Ahora bien, la propia model card advierte de que la verificación de paridad entre el checkpoint original y la conversión **falló** (mismatch reportado), por lo que el autor recomienda usarlo con cautela. El nombre del repositorio sugiere un enfoque hacia el zulú (Zulu) y una variante de conversión etiquetada como RDM-ANV, pero la model card no confirma ni el idioma objetivo ni el proceso de ajuste, por lo que esos extremos deben tratarse como no verificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (`Wav2Vec2ForCTC`); encoder transformer de 24 capas |
| Parametros totales | 325.983.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud de la señal) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un modelo transformers/safetensors admite fp32, fp16/bf16 e int8 mediante herramientas externas |
| Idiomas soportados | no disponible; la model card indica "multiple languages" y el nombre del repo sugiere zulu, sin confirmacion |
| Licencia | no disponible |
| Formato de pesos | safetensors (biblioteca transformers) |

Otros datos de la model card: tamaño oculto 1.024, 16 cabezas de atencion, FFN intermedio 4.096, vocabulario de 10.288 tokens (SentencePiece), framework de origen fairseq2, checkpoint de origen `omniASR_CTC_300M_v2`.

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo transformer (Wav2Vec2) que procesa la forma de onda cruda a 16 kHz mediante un extractor de características convolucional y genera representaciones contextuales que se proyectan a logits CTC sobre el vocabulario SentencePiece. La decodificación es greedy por `argmax` sobre la dimensión de vocabulario, tal como muestra el ejemplo de uso de la model card. No se especifica en la información disponible si se empleó decodificación con modelo de lenguaje, beam search u otras técnicas de rescoring.

Los detalles de entrenamiento (número de tokens de audio, composición del dataset, uso de RLHF/DPO u otras fases de ajuste) **no están disponibles**. Lo único documentado es que el modelo deriva del checkpoint de fairseq2 `omniASR_CTC_300M_v2` del proyecto OmniLingual y que fue convertido a Transformers. La model card indica que se ejecutó una verificación de paridad y que esta **falló**, sin detallar la magnitud de la discrepancia ni las capas afectadas.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de transcripción en texto a partir de audio a 16 kHz.
- Salida de logits CTC sobre un vocabulario SentencePiece de 10.288 tokens, lo que permite decodificación personalizada (greedy, beam search, integración con decodificadores externos).
- Según la model card, capacidad de transcripción en múltiples idiomas, si bien no se enumeran los idiomas concretos.
- Integración con el pipeline `automatic-speech-recognition` de Transformers y compatibilidad declarada con endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo.
- No se documenta un modo "thinking" ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de audio en zulú (u otro idioma objetivo, no confirmado): uso directo del pipeline de ASR para convertir grabaciones a 16 kHz en texto, aprovechando el vocabulario SentencePiece entrenado sobre el corpus original de OmniLingual.
- Subtitulado automático de contenido audiovisual: el modelo puede generar transcripciones por segmentos para vídeos y podcasts, con la salvedad de que no hay datos de rendimiento publicados que garanticen calidad en producción.
- Investigación en ASR de bajos recursos: resulta útil como punto de partida o referencia para experimentos de fine-tuning en lenguas africanas, dado su origen en OmniLingual y su tamaño contenido (326M parámetros).
- Prototipado rápido con Transformers: la clase `Wav2Vec2ForCTC` y `AutoProcessor` permiten integrarlo en pocas líneas en cuadernos o scripts de evaluación en CPU o GPU modesta.
- Evaluación comparativa de conversiones fairseq2 a Transformers: dado que la paridad falló, es un caso de estudio para medir el impacto de la conversión de checkpoints entre frameworks.
- Extracción de logits CTC para pipelines de investigación: permite aplicar decodificadores externos, modelos de lenguaje o rescoring sobre las matrices de logits en tareas de reconocimiento de voz.
- Análisis de contenido hablado en corpus etnográficos o lingüísticos: transcripción asistida que después se revisa manualmente, dado el caveat de verificación de paridad fallida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER, CER, MMLU, HumanEval o GSM8K (estas últimas no aplican a un modelo de ASR). Tampoco se aportan comparaciones cuantitativas con otros sistemas de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32, unos 0,65 GB en fp16/bf16 y en torno a 0,33 GB en int8 (solo pesos; hay que sumar activaciones y memoria del extractor convolucional, que crecen con la duración del audio).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia en fp16; una RTX 3060, RTX 4060, RTX 4090 o GPU de datacenter como A100/H100 funcionan sin problema, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más, e incluso en CPU para audios de duración moderada.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), endpoints compatibles (tag `endpoints_compatible`), exportación a ONNX, cuantización con bitsandbytes o PyTorch, y potencial uso con servidores de inferencia que soporten Wav2Vec2. No se documenta soporte específico de llama.cpp/Ollama (no aplica al ser un modelo de audio, no un LLM) ni de vLLM/TGI.
- Latencia y throughput estimados: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto/idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-RDM-ANV | 325,98 M | Wav2Vec2 + CTC | Multiidioma (no detallado); zulu sugerido por el nombre | no disponible | HuggingFace (transformers) |
| Wav2Vec2-large-960h (Facebook/Meta) | ~317 M | Wav2Vec2 + CTC | Ingles | MIT/Apache (segun version) | HuggingFace |
| XLS-R-300M (Meta) | ~315 M | Wav2Vec2 | 128 idiomas (preentrenamiento) | MIT | HuggingFace |
| MMS-300M (Meta) | ~315 M | Wav2Vec2 + CTC | Mas de 1.000 idiomas | CC-BY-NC 4.0 | HuggingFace |
| Whisper small (OpenAI) | ~244 M | Encoder-decoder transformer | ~99 idiomas | MIT | HuggingFace |

La comparación se limita a parámetros, arquitectura y licencia, ya que no hay resultados de WER/CER publicados para este modelo que permitan una comparación de rendimiento. Los recuentos de parámetros de los modelos alternativos son aproximados y corresponden a las cifras habitualmente publicadas por sus autores.

## Limitaciones y advertencias

- **Verificación de paridad fallida**: la model card indica explícitamente que la comprobación de paridad entre el checkpoint fairseq2 original y la conversión a Transformers reportó un mismatch, por lo que el comportamiento puede diferir del modelo original. El autor recomienda usarlo con cautela y abrir un issue si se observan anomalías.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de desplegarlo en producción hay que verificar la licencia del checkpoint original de OmniLingual.
- Idiomas no confirmados: aunque el nombre del repositorio apunta al zulú y la model card menciona "multiple languages", no se detalla qué idiomas cubre ni con qué calidad.
- Ausencia de métricas: no hay WER/CER ni benchmarks publicados, lo que impide estimar su precisión real en ninguna tarea.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un corpus de entrenamiento no especificado no puede descartarse un sesgo acústico o dialectal hacia las variedades sobrerrepresentadas en los datos originales.
- Riesgo de alucinación: en modelos CTC la decodificación greedy puede producir salidas incoherentes en audio con ruido, música o silencios; sin un modelo de lenguaje externo el riesgo de transcripciones erróneas es mayor.
- Limitación de contexto: al ser un modelo de audio, la ventana efectiva depende de la duración del clip; no se documenta el límite máximo manejable ni el comportamiento en audios muy largos (se requeriría segmentación).
- Sin soporte documentado para tareas más allá de ASR (no hay tool calling, agentes ni multimodalidad), por lo que no debe evaluarse como un modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csikasote/omniASR-CTC-300M-v2-Zulu-RDM-ANV
- Proyecto OmniLingual (Meta): https://github.com/facebookresearch/omnilingual-asr
- Checkpoint de origen: `omniASR_CTC_300M_v2` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
