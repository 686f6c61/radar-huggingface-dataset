# ferran-artero/stt_ca-es_conformer_transducer_large-onnx

## Resumen

Conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) `projecte-aina/stt_ca-es_conformer_transducer_large`, desarrollado originalmente por el Projecte AINA (Language Technologies Unit, Barcelona Supercomputing Center) a partir de `nvidia/stt_es_conformer_transducer_large`. Esta versión, publicada por Ferran Artero Merino en el marco de una beca ValgrAI en el VRAIN (Universitat Politècnica de València), está pensada para ejecutarse en el navegador mediante `onnxruntime-web`, aunque también funciona con `onnxruntime` en Python y Node.

El modelo resuelve el problema de la transcripción de voz en catalán (incluyendo valenciano y balear) y castellano en entornos sin servidor, con un tamaño de repositorio de 0,7 GB y un encoder cuantizado a 8 bits de 191 MB que es el que se emplea en producción web. Es el motor del proyecto abierto `subtitols-ca`, una herramienta que genera subtítulos en catalán íntegramente dentro del navegador.

La relevancia actual reside en la combinación de un modelo Conformer-Transducer de calidad con una exportación ONNX optimizada para WASM, lo que permite inferencia local en el cliente sin enviar audio a servidores externos, con una calidad medida de 9,4 % de WER en un conjunto de 38 frases en valenciano y balear.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-Transducer (RNN-T), encoder Conformer + decoder LSTM + joint |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio procesable por tramas de 40 ms) |
| Tipos de cuantización | int8 en pesos del encoder (MatMulNBits, bloques de 64) con activaciones float32; float32 completo disponible |
| Idiomas soportados | catalán (valenciano, balear) y español |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.q8w.onnx, encoder.onnx, decoder_joint.onnx) |

## Arquitectura y entrenamiento

El modelo es un Conformer-Transducer (RNN-T) con encoder Conformer que procesa espectrogramas log-mel de 80 bandas y produce representaciones de 512 dimensiones a razón de una trama cada 40 ms. El decoder es una LSTM con estados de 640 dimensiones y el joint proyecta la salida del encoder y del decoder a logits sobre un vocabulario de 256 piezas SentencePiece más el token blank (índice 256). La decodificación es greedy, con un máximo de 10 símbolos por trama y transición a la trama siguiente cuando gana el blank.

Esta conversión no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO); esos datos corresponden al modelo base `projecte-aina/stt_ca-es_conformer_transducer_large`. La innovación técnica de esta versión es la exportación a ONNX en dos piezas (encoder y decoder+joint) y la cuantización de los pesos del encoder a 8 bits mediante MatMulNBits con bloques de 64, manteniendo las activaciones en float32, lo que reduce el tamaño del encoder de 481 MB a 191 MB sin pérdida apreciable de calidad (WER de 9,4 %–10,2 % frente a 9,9 % del float32). Se incluye además Silero VAD v5 (MIT) para detección de actividad de voz, validado junto al motor.

## Capacidades

- Reconocimiento automático del habla (ASR) en catalán y español, con cobertura de variantes dialectales valenciana y balear.
- Generación de transcripciones con marcas de tiempo a nivel de palabra (según la implementación del motor de referencia).
- Ejecución en navegador mediante `onnxruntime-web` (WASM multihilo), con resultados idénticos a `onnxruntime` en Python.
- Ejecución también en Python y Node con `onnxruntime`.
- Detección de actividad de voz (VAD) integrada mediante Silero VAD v5 para segmentar audio y rescatar frases perdidas.
- Procesamiento de audio con espectrograma log-mel calculado según la configuración de NeMo (preénfasis 0,97, ventana Hann de 400 muestras, n_fft 512, salto de 160 a 16 kHz, 80 bandas, log(x + 2^-24), normalización por banda).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni thinking mode.

## Casos de uso

- Subtitulado en el navegador: el modelo se integra en `subtitols-ca` para generar subtítulos en catalán de vídeos directamente en el cliente, sin enviar audio a servidores, gracias al encoder cuantizado de 191 MB y a la ejecución WASM multihilo.
- Transcripción de reuniones y entrevistas en catalán y castellano: el motor completo con VAD y rescate de frases alcanza 7,0 % de WER en un vídeo de noticias en balear con música, adecuado para actas y notas de voz.
- Accesibilidad para contenido audiovisual: generación de subtítulos automáticos en valenciano y balear para plataformas que necesitan cubrir variantes dialectales del catalán.
- Aplicaciones web offline o de privacidad estricta: al ejecutarse con `onnxruntime-web`, el audio no abandona el dispositivo, lo que encaja en entornos sanitarios, jurídicos o educativos con requisitos de confidencialidad.
- Procesamiento por lotes en Python/Node: la misma exportación ONNX permite transcribir archivos de audio en pipelines de backend con `onnxruntime`, reutilizando el código del motor de referencia.
- Prototipado rápido de interfaces de voz: el decoder_joint de 17 MB y el encoder de 191 MB permiten desplegar un motor ASR ligero en aplicaciones de escritorio o electrónica embebida con recursos limitados.
- Investigación en ASR de bajo recurso: la licencia CC-BY-4.0 y la disponibilidad de pesos float32 e int8 facilitan la experimentación y la comparación de técnicas de cuantización.

## Benchmarks y rendimiento

Resultados de calidad publicados en la model card, medidos sobre 38 frases grabadas (19 en valenciano y 19 en balear) y un vídeo de noticias en balear con música de 2,8 minutos:

| Configuración | WER 38 frases |
|---|---|
| NeMo → ONNX float32 | 9,9 % |
| Encoder q8w (esta versión) | 9,4 % – 10,2 % según la decodificación |
| Motor completo de subtitols-ca (VAD + rescate de frases) | 9,4 % en frases; 7,0 % en el vídeo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder q8w ocupa 191 MB y el decoder_joint 17 MB; en float32 el encoder sube a 481 MB. El consumo real de memoria depende del backend y de la longitud del audio.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y WASM. Cualquier GPU con soporte de `onnxruntime` (CUDA, ROCm, DirectML) puede acelerar la inferencia.
- Cabe en GPU de consumo: sí, con amplio margen; también en CPU de portátil y en navegador.
- Opciones de despliegue: `onnxruntime-web` (WASM multihilo) en navegador, `onnxruntime` en Python y Node, y el motor de referencia de `subtitols-ca`.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que el navegador con WASM multihilo produce exactamente el mismo resultado que `onnxruntime` en Python, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ferran-artero/stt_ca-es_conformer_transducer_large-onnx (este) | Conformer-Transducer | ca, es | no disponible | CC-BY-4.0 | ONNX (int8 y float32) |
| projecte-aina/stt_ca-es_conformer_transducer_large | Conformer-Transducer | ca, es | no disponible | CC-BY-4.0 | NeMo |
| nvidia/stt_es_conformer_transducer_large | Conformer-Transducer | es | no disponible | no disponible en la información | NeMo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la única comparación cuantitativa publicada es la del propio modelo base frente a su exportación ONNX (9,9 % frente a 9,4 %–10,2 % de WER).

## Limitaciones y advertencias

- El modelo normaliza algunas formas dialectales, por ejemplo "varen" → "van", lo que puede alterar la fidelidad de transcripciones que requieran preservar la variante original.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido, música o habla solapada; el WER medido en el vídeo con música es del 7,0 % con el motor completo, pero puede degradarse en condiciones peores.
- Cobertura lingüística limitada a catalán (valenciano, balear) y español; no se garantiza un rendimiento adecuado en otras lenguas.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya adecuadamente al Projecte AINA, al BSC y al autor de la conversión; Silero VAD se distribuye bajo MIT con su propio aviso de licencia.
- La cuantización int8 del encoder puede introducir pequeñas variaciones de calidad según la estrategia de decodificación (9,4 %–10,2 % de WER), por lo que conviene validar en el dominio de producción.
- No es un modelo de propósito general: no soporta tool calling, agentes ni razonamiento; su uso debe limitarse a transcripción de voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferran-artero/stt_ca-es_conformer_transducer_large-onnx
- Modelo base: https://huggingface.co/projecte-aina/stt_ca-es_conformer_transducer_large
- Modelo original de NVIDIA: https://huggingface.co/nvidia/stt_es_conformer_transducer_large
- Repositorio subtitols-ca: https://github.com/ferran-artero/subtitols-ca
- Motor de referencia en Python: https://github.com/ferran-artero/subtitols-ca/tree/main/eines/motor_ref
- Motor en JavaScript: https://github.com/ferran-artero/subtitols-ca/tree/main/web/js/motor
- Scripts de conversión: https://github.com/ferran-artero/subtitols-ca/tree/main/eines/models
- Silero VAD: https://github.com/snakers4/silero-vad
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
