# Masterx/moonshine-streaming-tiny-tl-ONNX

## Resumen

Moonshine Streaming tiny-tl (ONNX) es la exportación a ONNX del modelo de reconocimiento automático del habla `moonshine-ai/moonshine-streaming-tiny-tl`, publicada por el usuario Masterx. Se trata de un modelo de ASR en tiempo real basado en Moonshine v2, con un encoder de tipo "Ergodic Streaming Encoder" que codifica el audio de forma incremental a medida que llega, en lugar de re-codificar la locución completa en cada paso. El destino lingüístico del checkpoint es el tagalo (`tl`), heredado del modelo base.

El problema que resuelve es el de la transcripción continua de baja latencia: el pipeline se divide en cinco grafos ONNX independientes (frontend, encoder, adapter, cross_kv y decoder_kv) que el runtime oficial de Moonshine encadena con estados persistentes, de modo que cada fragmento de audio se procesa con una ventana de atención deslizante. El export incluye variantes fp32 y cuantizadas a int8 dinámico, y se distribuye como un repositorio de 0,2 GB con licencia MIT.

Su relevancia es doble: por un lado, permite ejecutar ASR streaming en CPU sin depender de frameworks de deep learning completos, integrable en motores nativos (el autor lo valida con el motor Rust WinSTT); por otro, el modelo base es pequeño, lo que lo hace apto para despliegue en el borde. La verificación oficial se limita a 20 locuciones de FLEURS fil_ph, con un WER del 19,07 % en fp32 y del 19,29 % en int8, por lo que las cifras deben interpretarse como control de regresión y no como benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine v2, encoder-decoder transformer con encoder de streaming ("Ergodic Streaming Encoder") y atención deslizante por capas; exportada en cinco grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de atención deslizante con `total_left_context` = 96 frames pasados y `total_lookahead` = 16 frames; el adaptador añade embeddings de posición absolutos de 4096 posiciones, equivalentes a 82 s por segmento |
| Tipos de cuantizacion | fp32 (encoder, adapter, cross_kv, decoder_kv y frontend) y QInt8 dinámico por canal en pesos MatMul/Gemm con B constante (`*_int8.onnx`); el frontend solo se distribuye en fp32 |
| Idiomas soportados | tagalo (`tl`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | ONNX (opset 17, exportado con `torch.onnx` mediante `moonshine/scripts/export.py`), más `streaming_config.json` y tokenizer/config copiados del repositorio base |

## Arquitectura y entrenamiento

La arquitectura es la de Moonshine v2 en su variante de streaming. El pipeline se descompone en cinco grafos: `frontend.onnx` consume `audio_chunk[1,N]` con N múltiplo de 640 muestras y cinco estados arrastrados, y produce `features[1,N/320,320]`; `encoder.onnx` transforma esas features en `encoded[1,T,320]` con atención de ventana deslizante, operando sobre 96 frames de contexto izquierdo más los frames nuevos y manteniendo como estables los anteriores a `total_lookahead` = 16; `adapter.onnx` añade embeddings de posición absolutos y genera `memory[1,T,320]`; `cross_kv.onnx` produce las claves y valores de atención cruzada con forma `[6,1,8,M,40]` (6 capas, 8 cabezas, dimensión de cabeza 40); y `decoder_kv.onnx` genera logits a partir de los tokens y de la caché K/V propia y cruzada, actualizando la caché autorregresiva.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron etapas de RLHF o DPO: esos detalles corresponden al modelo base `moonshine-ai/moonshine-streaming-tiny-tl` y no se detallan en la model card de este export. La innovación técnica relevante es el propio esquema de exportación: las ventanas deslizantes usan la semántica inclusiva con la que se entrenaron los modelos (para los checkpoints multilingües, la notación `(17, 5)/(17, 1)` de la config de HuggingFace se normaliza a la forma inclusiva `(16, 4)/(16, 0)`), y los grafos fp32 reproducen token a token la salida greedy de `MoonshineStreamingForConditionalGeneration` de `transformers` cuando su máscara emplea las mismas ventanas inclusivas. La cuantización int8 se aplica con `onnxruntime.quantization.quantize_dynamic`, dejando el frontend en fp32 para preservar exactamente el arrastre de estado de sus convoluciones (aporta en torno al 3 % del cómputo).

## Capacidades

- Reconocimiento automático del habla en streaming con codificación incremental del audio, sin re-codificar la locución completa.
- Decodificación autorregresiva con caché K/V propia y cruzada, incluyendo el caso de caché propia de longitud 0 al inicio de la secuencia.
- Ejecución en CPU mediante ONNX Runtime con el execution provider de CPU; el encoder no funciona sobre DirectML (el EP DML de ORT 1.24 rechaza el Reshape de las cabezas de atención).
- Integración en motores nativos de transcripción en tiempo real: el autor valida el pipeline con el motor Rust WinSTT y un endpoint de energía.
- Gestión de segmentos largos: el adaptador cubre 4096 posiciones de embedding, equivalentes a 82 segundos por segmento.
- Qué no está documentado: no hay información sobre tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades multimodales (visión o audio más allá del propio ASR), traducción o diálogo. Es un modelo exclusivamente de transcripción.

## Casos de uso

- Transcripción en vivo de audio en tagalo: el pipeline procesa fragmentos de audio de forma incremental (chunks múltiplos de 640 muestras) y mantiene estados entre grafos, por lo que es adecuado para subtitulado en directo con latencia acotada por la ventana de lookahead de 16 frames.
- Analítica de centros de contacto en Filipinas: al ejecutarse en CPU con un factor de tiempo real de 0,037 medido en el motor Rust, permite transcribir muchas llamadas concurrentes en un servidor sin GPU dedicada.
- Asistentes de voz embebidos y dispositivos de borde: el repositorio ocupa 0,2 GB y el modelo base es de tipo "tiny", lo que abre la puerta a despliegues en hardware limitado con la variante int8.
- Generación de subtítulos y actas de reuniones: con segmentos de hasta 82 s por bloque de posiciones, se puede transcribir reuniones largas encadenando segmentos y concatenando la salida del decodificador.
- Indexación y búsqueda de archivos de audio en tagalo: transcripción por lotes con el pipeline de utterance completa de ONNX Runtime (WER del 19,07 % en fp32 sobre FLEURS fil_ph) para alimentar índices de texto.
- Integración en aplicaciones de escritorio multiplataforma: al ser ONNX puro y no requerir PyTorch en inferencia, puede embeberse en aplicaciones nativas y en runtimes Rust, como demuestra la validación con WinSTT.
- Preselección de audio para pipelines posteriores: por su bajo coste computacional (RTF 0,037 en CPU de escritorio bajo carga concurrente) puede usarse como primera etapa de transcripción rápida antes de un modelo mayor.
- Investigación y reproducibilidad de exportaciones ONNX: sirve como referencia para validar que un export de cinco grafos reproduce exactamente la salida greedy de `transformers` con ventanas inclusivas.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la verificación del autor sobre 20 locuciones del conjunto de test FLEURS fil_ph, con decodificación greedy en CPU:

| Runtime | WER fp32 | WER int8 |
|---|---|---|
| onnxruntime (Python, utterance completa) | 19,07 % | 19,29 % |
| WinSTT Rust engine (incremental, endpoint por energía) | 19,51 % | no disponible |

El autor advierte explícitamente que el conjunto es pequeño (20-41 locuciones) y que las cifras deben tratarse como control de regresión, no como benchmark. El factor de tiempo real en Rust fp32 sobre una CPU de escritorio bajo carga concurrente es de 0,037. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de ASR (LibriSpeech, Common Voice, etc.) en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB, por lo que el modelo cabe holgadamente en memoria de cualquier equipo de consumo actual.
- Inferencia viable en CPU: el autor reporta un factor de tiempo real de 0,037 en fp32 sobre una CPU de escritorio en Rust, es decir, unas 27 veces más rápido que el tiempo real.
- VRAM estimada: no disponible, ya que el escenario validado es CPU. Al ser un modelo "tiny" con grafos ONNX de dimensiones ocultas de 320, la huella en GPU sería muy reducida para cualquier tarjeta de consumo actual, pero no se ofrecen medidas concretas.
- GPU recomendadas: no disponible. Usar preferentemente el execution provider de CPU de ONNX Runtime.
- GPU no soportadas para el encoder: DirectML (el EP DML de ONNX Runtime 1.24 rechaza el Reshape de las cabezas de atención del grafo del encoder).
- Opciones de despliegue validadas: ONNX Runtime en Python (pipeline de utterance completa) y el motor Rust WinSTT (incremental, con endpoint por energía). No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de ASR.
- Latencia y throughput: RTF 0,037 en fp32 con Rust sobre CPU de escritorio bajo carga concurrente; no se publican cifras de throughput en locuciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-streaming-tiny-tl-ONNX (este) | no disponible | Streaming incremental, ventana deslizante 96+16 frames, 82 s por segmento | 19,07 % fp32 / 19,29 % int8 en FLEURS fil_ph (20 locuciones) | MIT | HuggingFace, ONNX + `streaming_config.json` |
| moonshine-ai/moonshine-streaming-tiny-tl (modelo base) | no disponible | Streaming incremental | no disponible | MIT | HuggingFace (pesos originales en el framework de origen) |
| Whisper (variante tiny o equivalente de OpenAI) | no disponible en la información proporcionada | No nativo en streaming; procesa ventanas de 30 s | no disponible | MIT (variantes de OpenAI) | HuggingFace y múltiples runtimes |
| Moonshine v1 (no streaming) | no disponible | No streaming; recodifica la locución completa | no disponible | MIT | HuggingFace |

No se dispone de datos de benchmarks comparativos directos entre este export y las alternativas, por lo que la comparación se limita a licencia, disponibilidad y naturaleza del pipeline. Cualquier afirmación de superioridad de WER frente a Whisper u otros sistemas no está respaldada por la información disponible.

## Limitaciones y advertencias

- Cobertura lingüística restringida al tagalo (`tl`); no se documenta soporte multilingüe en este checkpoint concreto.
- El WER publicado (en torno al 19 % en FLEURS fil_ph) es alto en términos absolutos y procede de un conjunto de evaluación muy pequeño (20-41 locuciones), por lo que la varianza es elevada y no debe extrapolarse a producción.
- Riesgo de alucinación y de transcripciones incorrectas inherente a los modelos generativos de ASR; no se documentan mecanismos de mitigación como puntuaciones de confianza o filtros.
- No hay información sobre sesgos demográficos, acentos o variedades dialectales del tagalo.
- La variante int8 solo está disponible para encoder, adapter, cross_kv y decoder_kv; el frontend permanece en fp32 incluso en el pipeline cuantizado.
- El encoder no es compatible con DirectML; es obligatorio usar el execution provider de CPU de ONNX Runtime.
- No se documenta el comportamiento con audio fuera de las condiciones de entrenamiento (ruido, solapamiento de hablantes, música de fondo) ni la gestión de puntuación y mayúsculas en la salida.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero conviene verificar el fichero `LICENSE` del repositorio base y las condiciones de los datos de entrenamiento originales, que no se detallan.
- El modelo no ofrece tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso que requiera esas capacidades debe construirse por capas externas.
- El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y no cuenta con validación comunitaria independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Masterx/moonshine-streaming-tiny-tl-ONNX
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-tl
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
