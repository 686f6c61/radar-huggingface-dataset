# k2-fsa/sherpa-onnx-streaming-zipformer-korean-2024-06-16

## Resumen

El modelo `sherpa-onnx-streaming-zipformer-korean-2024-06-16` es un modelo de reconocimiento automático del habla (ASR) en coreano, publicado por el equipo de k2-fsa (proyecto Next-gen Kaldi) y empaquetado en formato ONNX para su uso con la librería sherpa-onnx. Se trata de un modelo de tipo transducer (RNN-T) con arquitectura Zipformer v1 en configuración streaming, es decir, diseñado para transcripción en tiempo real con latencia baja por fragmentos de audio, no para procesar el fichero completo de una sola pasada.

El modelo se ha convertido a partir del checkpoint original de icefall `johnBamma/icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12`, entrenado sobre el corpus KsponSpeech (coreano conversacional). Al estar en formato ONNX, puede ejecutarse sin PyTorch en CPU, GPU o dispositivos embebidos, lo que lo hace adecuado para despliegues ligeros y multiplataforma (móvil, web, edge).

Es relevante ahora porque cubre un hueco práctico: ASR coreano en streaming con licencia Apache 2.0, sin dependencia de frameworks pesados y con un tamaño de repositorio de solo 0,4 GB. No obstante, la información pública disponible es escasa: la model card es mínima y no se publican métricas de WER, número exacto de parámetros ni detalles del dataset de entrenamiento más allá de la referencia a KsponSpeech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer v1, transducer (RNN-T) stateless7, modo streaming |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio streaming por fragmentos; sin ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; cuantización int8 no confirmada en la información) |
| Idiomas soportados | coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo es un transducer (RNN-T) con encoder de tipo Zipformer v1, en la variante "stateless7" y "streaming", tal como se indica en la model card. El encoder Zipformer es una arquitectura convolucional-transformer multi-escala que reduce el coste computacional frente a transformers estándar manteniendo precisión en ASR. La variante "stateless7" se refiere a un decodificador stateless con 7 capas de encoder. El modo streaming implica atención con contexto limitado a la izquierda y estados recurrentes que permiten emitir transcripciones parciales conforme llega el audio.

El entrenamiento se realizó en el framework icefall (Next-gen Kaldi) sobre KsponSpeech, el corpus de habla conversacional coreana, según la referencia del checkpoint original. Los detalles concretos del número de tokens de audio, composición del dataset, técnicas de aumento de datos o ajuste fino no están disponibles en la información proporcionada. La model card indica explícitamente que se usó Zipformer v1 y remite al PR #1651 de icefall para el procedimiento de entrenamiento.

## Capacidades

- Reconocimiento automático del habla en coreano en modo streaming (transcripción incremental por fragmentos).
- Decodificación con transducer (RNN-T): emite tokens a medida que se procesa el audio, sin necesidad de buffer completo.
- Ejecución en formato ONNX mediante sherpa-onnx, sin dependencia de PyTorch en inferencia.
- Despliegue multiplataforma: CPU, GPU, Android, iOS, WebAssembly y dispositivos embebidos (según las capacidades de sherpa-onnx).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No es un modelo multimodal ni de generación de texto libre.
- Soporte multilingüe: solo coreano.

## Casos de uso

- Subtitulado en tiempo real de reuniones o clases en coreano: el modo streaming permite emitir texto parcial con latencia de fragmento, adecuado para subtítulos en vivo sin esperar al cierre del turno de habla.
- Transcripción de llamadas de atención al cliente en coreano: integrado en un pipeline de telefonía, el modelo convierte audio en texto para análisis posterior (sentimiento, resumen, búsqueda).
- Asistentes de voz en aplicaciones móviles: el formato ONNX y el tamaño reducido del repo (0,4 GB) permiten empaquetarlo en apps Android/iOS mediante sherpa-onnx sin servidor dedicado.
- Indexación y búsqueda de archivos de audio coreanos: transcripción por lotes de grabaciones para construir índices de texto y habilitar búsqueda semántica.
- Accesibilidad: generación de subtítulos automáticos para vídeos o retransmisiones en coreano, con despliegue en el navegador vía WebAssembly.
- Sistemas de dictado por voz en coreano: entrada de texto por voz en editores o formularios, con transcripción incremental para retroalimentación inmediata.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión coreanas para detección de temas, palabras clave o cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0,4 GB) y la naturaleza streaming del modelo, la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas; al ejecutarse en ONNX Runtime, funciona en cualquier GPU compatible con CUDA o incluso solo CPU.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de memoria libre; también funciona en CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el modo streaming está diseñado para baja latencia por fragmento, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sherpa-onnx-streaming-zipformer-korean-2024-06-16 | Zipformer v1 streaming (RNN-T) | Coreano | no disponible | Apache 2.0 | ONNX | Hugging Face (k2-fsa) |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingüe (incluye coreano) | 30 s de audio por ventana | MIT | PyTorch, CTranslate2, GGUF | Amplia |
| icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12 | Zipformer v1 streaming (RNN-T) | Coreano | no disponible | no disponible | PyTorch (icefall) | Hugging Face (johnBamma) |
| Wav2Vec2 / XLS-R (coreano fine-tuned) | Transformer convolucional | Coreano / multilingüe | no disponible | varía (MIT/Apache según checkpoint) | PyTorch | Hugging Face |

La comparativa con Whisper es la más relevante para producción: Whisper ofrece multilingüismo y mayor ecosistema, pero no es streaming nativo y requiere ventanas de 30 s; este modelo está optimizado para streaming coreano con menor huella. El checkpoint original de icefall es el mismo modelo en PyTorch, mientras que esta versión ONNX facilita el despliegue sin PyTorch.

## Limitaciones y advertencias

- Solo reconoce coreano; no es multilingüe ni traduce.
- Es un modelo ASR, no un LLM: no genera texto libre, no razona ni soporta tool calling.
- No se publican métricas de WER ni evaluación formal en la model card; el rendimiento real debe validarse contra el dominio de uso (KsponSpeech es conversacional, puede degradarse en otros registros).
- Riesgo de errores en nombres propios, terminología técnica, acentos no representados en el corpus y audio con ruido o solapamiento de hablantes.
- La variante streaming introduce latencia y puede sacrificar precisión frente a modelos offline; no se documentan cifras de latencia.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del corpus KsponSpeech y del checkpoint original de icefall.
- La model card es mínima: no hay información sobre sesgos, composición demográfica del dataset ni limitaciones documentadas por el autor.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/k2-fsa/sherpa-onnx-streaming-zipformer-korean-2024-06-16
- Checkpoint original: https://huggingface.co/johnBamma/icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12
- PR de entrenamiento en icefall: https://github.com/k2-fsa/icefall/pull/1651
- Repositorio icefall: https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
