# emmilly/cdli-impaired-asr-zipformer-small-streaming_en_ls960-cdli30s_s42

## Resumen

El modelo `emmilly/cdli-impaired-asr-zipformer-small-streaming_en_ls960-cdli30s_s42` es un sistema de reconocimiento automático del habla (ASR) en inglés, de tipo transducer Zipformer2 en su variante *small*, especializado en habla no estándar (tartamudeo). Lo desarrolla el usuario `emmilly` dentro del proyecto CDLI (Common Voice for Disfluent and Impaired speech, según la nomenclatura del autor) y parte del checkpoint `csukuangfj/icefall-asr-librispeech-streaming-zipformer-small-2024-03-18`, entrenado sobre las 960 horas de LibriSpeech, que después se ajusta fino sobre el conjunto de entrenamiento CDLI de habla no estándar en inglés.

La característica diferencial es que el modelo es *causal* (streaming real) y está empaquetado en formato ONNX listo para `sherpa-onnx` con `OnlineRecognizer.from_transducer`. Con 23.756.387 parámetros totales (incluyendo la cabeza CTC), ofrece decodificación en tiempo real con chunks configurables de 320 ms o 640 ms y factores RTF de 0,021 a 0,030 con 4 hilos, lo que lo hace apto para despliegue en CPU y dispositivos con recursos limitados.

Es relevante porque aborda un nicho poco cubierto: el habla con disfluencias (tartamudeo), donde los ASR convencionales degradan severamente su precisión. El ajuste fino reduce la WER por utterance del 0,82 del modelo base LibriSpeech a aproximadamente 0,38–0,40 en el conjunto de test CDLI en inglés, aunque sigue por detrás de referencias tipo Whisper (WER ~0,26). La licencia es "other" y el uso está sujeto a los términos de CDLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transducer, encoder causal/streaming) con cabeza CTC auxiliar |
| Parametros totales | 23.756.387 (incluyendo cabeza CTC) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; streaming con chunks de 320 ms o 640 ms y contexto izquierdo configurable (`left-context-frames` 64,128,256,-1) |
| Tipos de cuantizacion | FP32 (ONNX estándar) e INT8 (variantes `.int8.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (sujeta a los términos de CDLI) |
| Formato de pesos | ONNX (`encoder`, `decoder`, `joiner` en `sherpa-onnx/chunk-<ms>/`) y PyTorch (`pytorch/finetuned-averaged.pt`, state dict de icefall) |

## Arquitectura y entrenamiento

La arquitectura es un Zipformer2 *small* de icefall, con 6 etapas de encoder de dimensiones 192/256 y feedforward 512/768, `encoder-unmasked-dim` 192, `causal=1` y `chunk-size` 16,32,64,-1. Incorpora tanto cabeza transducer como cabeza CTC (`use-transducer=1`, `use-ctc=1`). El modelo base se entrenó sobre LibriSpeech 960 h durante 30 épocas (promediado de la época 27 en adelante), y el ajuste fino se realizó durante hasta 8 épocas sobre el conjunto CDLI de habla no estándar en inglés, con cortes de hasta 30 s y perturbación de velocidad 0,9/1,1. El checkpoint publicado corresponde a la época 8 promediada sobre 3 épocas, seleccionada por WER verbatim por utterance en validación CDLI en inglés.

Las etiquetas de entrenamiento son verbatim (transcripción literal, incluyendo disfluencias). El autor reporta además métricas "clean" aplicando una regla de disfluencia del proyecto sobre referencias e hipótesis. El pipeline se construyó con icefall `f8c8578c9d`, k2 `1.24.4.dev20260625+cuda13.0.torch2.11.0` y lhotse `1.33.0`. El repositorio incluye también `sherpa-onnx/base/` con el modelo LibriSpeech previo al ajuste fino, útil como referencia.

## Capacidades

- Reconocimiento de voz en inglés en modo streaming (causal), con chunks de 320 ms o 640 ms.
- Decodificación greedy y beam search (beam 4) mediante `sherpa-onnx`.
- Manejo de habla con disfluencias y tartamudeo (entrenado específicamente para ello).
- Inferencia en CPU con cuantización INT8 y RTF bajo (0,021–0,030 con 4 hilos).
- Salida de transcripción verbatim; opcionalmente aplicable regla de limpieza de disfluencias.
- Integración directa con `sherpa-onnx` `OnlineRecognizer.from_transducer` (feature_dim 80, 16 kHz).
- No soporta tool calling, agentes, visión ni audio más allá de ASR; capacidades multilingües limitadas al inglés.

## Casos de uso

- Subtitulado en tiempo real para personas con tartamudeo: el modelo decodifica en streaming con chunks de 320 ms y RTF ~0,03 en CPU, lo que permite generar subtítulos con latencia baja en videollamadas o clases.
- Transcripción de reuniones y entrevistas con hablantes disfluentes: el ajuste fino sobre CDLI reduce la WER verbatim de ~0,82 a ~0,38 frente al modelo base, mejorando la utilidad de las actas automáticas.
- Asistentes de voz accesibles: al ejecutarse en CPU con INT8 y bajo coste computacional, puede integrarse en aplicaciones de escritorio o dispositivos embebidos para dictado dirigido a usuarios con disfluencias.
- Investigación en ASR para habla atípica: el repositorio incluye el modelo base y el ajustado, lo que facilita experimentos comparativos y reproducibilidad con icefall/k2.
- Evaluación de pipelines de accesibilidad: sirve como referencia streaming para comparar con sistemas no causales (Whisper) en términos de latencia y precisión en habla no estándar.
- Despliegue en entornos con recursos limitados: los ficheros ONNX INT8 y el soporte de `sherpa-onnx` permiten ejecución en servidores sin GPU y en dispositivos de borde para transcripción local.

## Benchmarks y rendimiento

Resultados reportados por el autor en el test CDLI English (9 hablantes, todos con tartamudeo; decodificación streaming con sherpa-onnx 1.13.8; filas int8 en formato teléfono):

| Configuración | WER por utt. (verbatim) | WER por utt. (clean) | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|---|
| c320ms-greedy-int8 | 0,405 | 0,323 | 0,391 | 0,297 | 0,028 |
| c320ms-beam4-int8 | 0,384 | 0,315 | 0,366 | 0,262 | 0,030 |
| c640ms-greedy-int8 | 0,396 | 0,313 | 0,382 | 0,290 | 0,021 |
| c640ms-beam4-int8 | 0,379 | 0,309 | 0,360 | 0,257 | 0,025 |
| E22 (Whisper greedy, referencia) | 0,259 | 0,174 | 0,249 | 0,167 | no disponible |
| E23 (Whisper greedy, referencia) | 0,263 | 0,174 | 0,254 | 0,170 | no disponible |
| E20 (Whisper greedy, referencia) | 0,272 | 0,185 | 0,260 | 0,173 | no disponible |
| base-c320ms-greedy-int8 (LibriSpeech, antes del ajuste) | 0,822 | 0,845 | 0,846 | 0,519 | no disponible |
| base-c320ms-beam4-int8 | 0,827 | 0,854 | 0,868 | 0,531 | no disponible |
| base-c640ms-greedy-int8 | 0,806 | 0,833 | 0,822 | 0,503 | no disponible |
| base-c640ms-beam4-int8 | 0,813 | 0,841 | 0,845 | 0,514 | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo está pensado para CPU. Con 23,7 M de parámetros, los ficheros ONNX INT8 ocupan del orden de decenas de MB, aunque el repositorio completo pesa 9,8 GB (incluye pesos PyTorch y variantes).
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, pero el caso de uso principal es CPU.
- Cabe en GPU consumer: sí, con enorme holgura (cualquier GPU con ≥1 GB de VRAM), y también en CPU.
- Opciones de despliegue: `sherpa-onnx` (`OnlineRecognizer.from_transducer`), ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: RTF de 0,021–0,030 con 4 hilos en la configuración INT8 reportada, es decir, entre 33 y 47 veces más rápido que tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | WER test CDLI (verbatim) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Zipformer-small streaming, ajustado CDLI) | 23,7 M | streaming, chunks 320/640 ms | 0,379–0,405 | other (términos CDLI) | Hugging Face, ONNX + PyTorch |
| Modelo base LibriSpeech (csukuangfj/icefall-...-small-2024-03-18) | 23,7 M aprox. | streaming, chunks 320/640 ms | 0,806–0,827 | no disponible | Hugging Face |
| Whisper (referencias E20/E22/E23 del autor) | no disponible | no streaming (greedy) | 0,259–0,272 | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento se ha medido solo en el test CDLI English (9 hablantes, todos con tartamudeo); el autor indica que el rendimiento en campo (salas ruidosas, otros hablantes) no se ha medido.
- La WER sigue siendo alta en términos absolutos (~0,38–0,40 verbatim) y claramente superior a las referencias Whisper (~0,26); no es un modelo de precisión estado del arte.
- Solo soporta inglés; no hay capacidades multilingües.
- El modelo es causal/streaming, lo que limita la precisión frente a sistemas no causales con contexto completo.
- La licencia es "other" y el entrenamiento se realizó bajo los términos de CDLI; es necesario revisar dichos términos antes de cualquier uso comercial.
- Riesgo de alucinación y errores en habla con disfluencias severas, ruido o acentos no representados en el conjunto CDLI.
- El repositorio pesa 9,8 GB e incluye artefactos de entrenamiento y el modelo base; conviene seleccionar únicamente los ficheros ONNX necesarios para producción.
- No dispone de datos publicados sobre sesgos demográficos más allá de la composición del conjunto CDLI.

## Enlaces

- Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_en_ls960-cdli30s_s42
- Modelo base: https://huggingface.co/csukuangfj/icefall-asr-librispeech-streaming-zipformer-small-2024-03-18
- icefall (repositorio): no disponible en la información proporcionada
- sherpa-onnx (repositorio): no disponible en la información proporcionada
- Paper o blog del proyecto CDLI: no disponible en la información proporcionada
