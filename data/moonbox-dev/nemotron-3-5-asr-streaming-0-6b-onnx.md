# moonbox-dev/nemotron-3.5-asr-streaming-0.6b-ONNX

## Resumen

Nemotron 3.5 ASR Streaming 0.6B ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) Nemotron 3.5 ASR Streaming 0.6B, desarrollado originalmente por NVIDIA y convertido por moonbox-dev para su ejecución en dispositivos con ONNX Runtime (CPU, CUDA y DirectML). Se trata de un modelo de tipo FastConformer con decodificador RNN-T y mecanismo de atención cache-aware, diseñado específicamente para transcripción en streaming de audio mono a 16 kHz. El modelo base tiene aproximadamente 0,6 mil millones de parámetros y soporta más de 40 idiomas mediante un identificador de idioma (prompt_id) o detección automática, además de producir puntuación y mayúsculas.

La relevancia de esta versión ONNX radica en que permite desplegar el modelo en entornos de producción sin depender de PyTorch, lo que facilita su integración en aplicaciones de escritorio, navegador o dispositivos de borde mediante ONNX Runtime. La latencia es configurable a través del parámetro de look-ahead (0, 3, 6 o 13 frames del encoder, equivalentes a chunks de 80, 320, 560 o 1120 ms), lo que permite ajustar el compromiso entre latencia y precisión según el caso de uso. El repositorio incluye dos precisiones (fp16 e int8) junto con un pipeline en Python que gestiona la extracción de características, la máscara de atención y la decodificación greedy del RNN-T.

La exportación conserva un rendimiento muy cercano al modelo original en PyTorch: en la variante fp16 se observa un WER del 3,25 % en LibriSpeech test-clean (frente al 3,28 % del original) y un CER del 7,74 % en AISHELL-1 (frente al 7,57 %). La variante int8 reduce el tamaño del encoder a 618,5 MB con un WER del 3,18 % y un CER del 7,98 %, a costa de un mayor índice de tiempo real (RTF 0,086 frente a 0,043 en fp16). El modelo se distribuye bajo licencia OpenMDW 1.1, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con decodificador RNN-T (LSTM prediction network + joint network) |
| Parametros totales | 0,6 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; procesa audio en chunks de 80, 320, 560 o 1120 ms segun look-ahead (0, 3, 6 o 13 frames del encoder) |
| Tipos de cuantizacion | fp16 e int8 (dos carpetas separadas en el repositorio) |
| Idiomas soportados | Mas de 40 idiomas (segun la model card); lista concreta no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx) + tokenizer.json + mel_filters.npy + pipeline.py |

## Arquitectura y entrenamiento

El modelo base es un FastConformer cache-aware con decodificador RNN-T. El encoder procesa log-mel spectrograms de 128 bandas a 100 frames por segundo y produce representaciones de 640 dimensiones a 12,5 frames por segundo. La atención cache-aware permite limitar el contexto a un número fijo de frames (look-ahead), lo que habilita la transcripción en streaming con latencia controlada. El decodificador es una red LSTM de predicción con estado oculto y de celda de 640 dimensiones, y la red joint combina la salida del encoder con la del decodificador para producir logits sobre un vocabulario de 13.088 tokens (el último es el token blank). El prompt_id permite seleccionar el idioma de forma explícita o dejar que el modelo lo detecte automáticamente.

La exportación a ONNX divide el modelo en tres grafos independientes (encoder, decoder y joint) que se ejecutan secuencialmente en el bucle de decodificación greedy implementado en pipeline.py. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio de moonbox-dev no los detalla y la información proporcionada no incluye la model card original de NVIDIA. La innovación técnica destacable es la preservación del mecanismo de atención cache-aware en la exportación ONNX mediante una máscara de atención chunked-limited generada por pipeline.chunk_mask, que replica el comportamiento del streaming original.

## Capacidades

- Reconocimiento automático del habla (ASR) en streaming para audio mono a 16 kHz.
- Soporte de más de 40 idiomas mediante prompt_id o detección automática de idioma.
- Generación de puntuación y mayúsculas en la transcripción.
- Latencia configurable mediante look-ahead: 0, 3, 6 o 13 frames del encoder (chunks de 80, 320, 560 o 1120 ms).
- Decodificación greedy RNN-T integrada en pipeline.py.
- Ejecución en ONNX Runtime con soporte para CPU, CUDA y DirectML.
- Dos precisiones disponibles: fp16 (mayor fidelidad respecto al original) e int8 (menor tamaño y mayor velocidad en algunos entornos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción en tiempo real de reuniones y videoconferencias: el modelo puede procesar audio en chunks de 320 ms (look-ahead 3, configuración por defecto), lo que permite generar subtítulos con una latencia inferior a un segundo y mantener el contexto gracias al mecanismo cache-aware.
- Subtitulado automático en directo para plataformas de streaming: con look-ahead 0 (chunks de 80 ms) se obtiene la mínima latencia posible, adecuada para emisiones en vivo donde prima la inmediatez sobre la precisión absoluta.
- Asistentes de voz en dispositivos de borde: la variante int8 (618,5 MB para el encoder) puede ejecutarse en CPU mediante ONNX Runtime, lo que permite integrar transcripción local en aplicaciones de escritorio o sistemas embebidos sin conexión a la nube.
- Transcripción de archivos de audio pregrabados: pipeline.py procesa un clip completo de una vez aplicando la máscara de chunk correspondiente, lo que resulta útil para pipelines de post-procesado de podcasts, entrevistas o notas de voz.
- Atención al cliente automatizada con análisis de llamadas: el soporte de más de 40 idiomas y la detección automática de idioma permiten transcribir conversaciones multilingües en centros de contacto y alimentar sistemas de análisis de sentimiento o control de calidad.
- Generación de actas y resúmenes a partir de audio: la transcripción con puntuación y mayúsculas facilita el post-procesado con modelos de lenguaje para generar resúmenes o actas de reuniones.
- Accesibilidad para personas con discapacidad auditiva: la baja latencia y el reducido consumo de recursos permiten integrar el modelo en aplicaciones de subtitulado en tiempo real en entornos con hardware modesto.

## Benchmarks y rendimiento

Los datos disponibles provienen de la benchmark interna de Moonbox sobre un conjunto de 400 utterances de LibriSpeech test-clean (40 hablantes) y 200 utterances de AISHELL-1 test para modelos que soportan chino. Se comparan las dos precisiones exportadas con el modelo original en PyTorch.

| Metrica | Original (PyTorch) | fp16 ONNX | int8 ONNX |
|---|---|---|---|
| WER LibriSpeech test-clean | 3,28 % | 3,25 % | 3,18 % |
| CER AISHELL-1 test | 7,57 % | 7,74 % | 7,98 % |
| Transcripciones identicas (LibriSpeech, de 400) | — | 364 | 327 |
| Transcripciones identicas (AISHELL-1, de 200) | — | 182 | 148 |
| RTF en CUDA | — | 0,043 | 0,086 |
| Tamano del encoder | — | 1,23 GB | 618,5 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante fp16 requiere aproximadamente 1,3 GB para el encoder mas los grafos decoder y joint (unos 50 MB adicionales), por lo que con 2 GB de VRAM es suficiente. La variante int8 reduce el encoder a unos 620 MB, permitiendo inferencia con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA T4, RTX 3060, RTX 4090, A100, H100). El modelo es lo suficientemente pequeno como para ejecutarse en GPUs de gama baja.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien puede ejecutarse en CPU mediante ONNX Runtime, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) es el entorno previsto por el autor. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR de este tipo. El repositorio incluye pipeline.py como runtime de referencia en numpy.
- Latencia y throughput estimados: el RTF medido en CUDA es de 0,043 para fp16 y 0,086 para int8, lo que indica que el modelo procesa audio aproximadamente 23 veces mas rapido que tiempo real en fp16 y 11,6 veces en int8. La latencia de streaming depende del look-ahead configurado: 80 ms (look-ahead 0), 320 ms (look-ahead 3, por defecto), 560 ms (look-ahead 6) o 1120 ms (look-ahead 13).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latencia | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B ONNX (este) | ~0,6 B | Chunks de 80-1120 ms (look-ahead configurable) | 40+ | OpenMDW 1.1 | ONNX (fp16, int8) |
| Whisper large-v3 (OpenAI) | ~1,55 B | No streaming nativo (procesa ventanas de 30 s) | ~99 | MIT | PyTorch, GGML, ONNX (no oficial) |
| Whisper small (OpenAI) | ~244 M | No streaming nativo (ventanas de 30 s) | ~99 | MIT | PyTorch, GGML, ONNX (no oficial) |
| Conformer-CTC / RNN-T de NVIDIA NeMo (generico) | Variable | Streaming segun configuracion | Variable | Variable (a menudo CC-BY-4.0 o similar) | PyTorch (NeMo) |

La comparativa con Whisper no es directa: Whisper no esta disenado para streaming nativo y procesa ventanas de 30 segundos, mientras que Nemotron 3.5 ASR Streaming esta optimizado para baja latencia con atencion cache-aware. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada, por lo que no se pueden ofrecer cifras de rendimiento relativo mas alla de las incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para ASR; no soporta generacion de texto, codigo, razonamiento ni otras tareas de lenguaje.
- La licencia OpenMDW 1.1 impone condiciones especificas para uso comercial; es necesario revisar los terminos en https://openmdw.ai/license/1-1/ antes de desplegarlo en produccion.
- No se dispone de informacion detallada sobre sesgos conocidos, composicion del dataset de entrenamiento ni posibles sesgos de genero, acento o dialecto.
- Riesgo de alucinacion en transcripciones: como todo modelo ASR, puede producir palabras o frases no presentes en el audio, especialmente en condiciones de ruido o audio de baja calidad.
- La lista completa de idiomas soportados no esta disponible en la informacion proporcionada; la model card solo indica "mas de 40 idiomas".
- La precision int8 reduce el numero de transcripciones identicas respecto al original (327 de 400 en LibriSpeech frente a 364 en fp16), lo que puede ser relevante en aplicaciones que requieran maxima fidelidad.
- El rendimiento en audio con ruido de fondo, multiples hablantes o acentos no nativos no esta documentado en la informacion disponible.
- La exportacion ONNX no incluye soporte para tool calling ni integracion con frameworks de agentes, ya que no es una capacidad del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/nemotron-3.5-asr-streaming-0.6b-ONNX
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper de referencia (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
