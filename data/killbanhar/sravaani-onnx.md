# killbanhar/sravaani-onnx

## Resumen

SraVaani-1.0 es un modelo de reconocimiento automático del habla (ASR) desarrollado por SPIRE Lab y ARTPARK del Indian Institute of Science (IISc) de Bangalore, que cubre 44 idiomas y dialectos de la India. El modelo original se distribuye como un checkpoint TorchScript envuelto en un cargador compatible con `transformers`, lo que requiere PyTorch, Transformers y SentencePiece en tiempo de ejecución. Este repositorio proporciona una conversión a formato ONNX del encoder y del decoder_joint, de modo que la inferencia puede ejecutarse únicamente con `onnxruntime`, reduciendo la dependencia de librerías pesadas y mejorando el rendimiento en CPU, especialmente en dispositivos con recursos limitados como teléfonos Android.

La arquitectura se basa en un modelo TDT/RNNT (Transducer with Duration-based Target) con un encoder Conformer y un decoder basado en LSTM con red de joint. El encoder procesa características mel-espectrográficas y produce una secuencia de representaciones de alta dimensión, mientras que el decoder realiza un paso de decodificación greedy por cada frame del encoder, con saltos basados en duración. La conversión ONNX mantiene la misma configuración y tokenizador que el original, y las transcripciones resultan byte-idénticas a las del modelo PyTorch en pruebas reales.

La relevancia de este modelo radica en su cobertura de lenguas indias, un ámbito tradicionalmente poco servido por los ASR comerciales, y en la optimización para entornos con pocos recursos computacionales. El repositorio incluye benchmarks que muestran una aceleración notable en CPU frente a la ruta PyTorch original, lo que lo convierte en una opción práctica para aplicaciones móviles y embebidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT/RNNT con encoder Conformer y decoder LSTM + joint network |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, procesa secuencias de mel-espectrogramas) |
| Tipos de cuantizacion | fp32 (exportación ONNX; el original es fp16) |
| Idiomas soportados | hi, kn, ml, te, en, gu, pa, or, bn, ta, as, sa, ne, mr (según model card; el modelo cubre 44 idiomas/dialectos) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx ~1.77GB, decoder_joint.onnx ~43MB) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma TDT/RNNT, una variante de los transductores que incorpora predicción de duración para cada token de salida, lo que permite decodificar de forma más eficiente que los RNN-T estándar. El encoder es un Conformer, que combina capas de atención multi-cabeza con convoluciones profundas, y genera representaciones de 1024 dimensiones por frame. El decoder consta de un predictor LSTM con estado oculto de 640 unidades y una red joint que fusiona las salidas del encoder y del predictor para producir logits sobre un vocabulario de 5006 tokens (incluyendo el token blank).

Los detalles del entrenamiento (número de tokens, composición del dataset, técnicas de alineación, etc.) no se especifican en la información proporcionada. El modelo original fue entrenado por SPIRE Lab y ARTPARK, IISc Bangalore, y se describe en el artículo arXiv:2608.08235. La conversión ONNX se realizó exportando los grafos del encoder y del decoder_joint desde el checkpoint TorchScript, manteniendo los mismos parámetros y el tokenizador SentencePiece. La exportación se hizo en fp32 porque las CPU no disponen de kernels de convolución fp16, lo que duplica el tamaño del encoder respecto al original fp16 pero garantiza corrección en inferencia CPU.

## Capacidades

- Reconocimiento automático del habla en 44 idiomas y dialectos de la India, incluyendo hindi, kannada, malayalam, telugu, inglés, gujarati, punjabi, oriya, bengalí, tamil, asamés, sánscrito, nepalí y maratí.
- Decodificación greedy basada en duración (TDT) que procesa cada utterance de forma secuencial.
- Funciona con características mel-espectrográficas de 128 bandas, generadas mediante un frontend de preprocesado incluido en el repositorio (`preproc.pt`).
- Inferencia exclusivamente con `onnxruntime`, sin necesidad de PyTorch ni Transformers en tiempo de ejecución.
- Compatible con CPU, incluyendo dispositivos móviles ARM64 (probado en Android vía Termux).
- No se mencionan capacidades de tool calling, agentes ni procesamiento multimodal; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de voz en tiempo real en aplicaciones móviles para Android: gracias a la conversión ONNX, el modelo puede ejecutarse en un teléfono de gama media con un factor de tiempo real de 0.31x, lo que permite transcribir audio de forma fluida sin conexión a servidores.
- Asistentes de voz en idiomas indios: el modelo cubre una amplia variedad de lenguas regionales, por lo que puede integrarse en asistentes personales o sistemas de comandos por voz para usuarios que no hablan inglés.
- Subtitulado automático de vídeos y podcasts en lenguas indias: el ASR puede procesar pistas de audio y generar subtítulos, aprovechando la ventana de contexto ilimitada (el modelo procesa secuencias de longitud variable).
- Accesibilidad para personas con discapacidad auditiva: transcripción de conversaciones o reuniones en tiempo real en dispositivos de bajo coste, donde la eficiencia del ONNX es crítica.
- Sistemas de documentación médica y legal: dictado de notas en consultas o juzgados donde se hablan idiomas regionales, con la ventaja de la licencia MIT que permite uso comercial.
- Pipelines de procesamiento de audio en servidores con CPU: al no requerir GPU, puede desplegarse en instancias cloud económicas para transcribir grandes volúmenes de audio, usando `onnxruntime` en modo batch.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card comparan la inferencia en un teléfono Android de gama media (OnePlus CPH2467, arm64) vía Termux, sobre un clip de audio de 4.4 segundos:

| Ruta | Tiempo total de inferencia | Factor de tiempo real |
|---|---|---|
| Original PyTorch (`model.transcribe(...)`) | ~11s (para un clip de 6s) | ~1.8x (más lento que tiempo real) |
| ONNX export, `CPUExecutionProvider` | 1.35s | 0.31x (más rápido que tiempo real) |
| ONNX export, `NnapiExecutionProvider` | 2.32s | 0.53x (más rápido que tiempo real, pero más lento que CPU) |

Además, se verificó que las transcripciones del modelo ONNX son byte-idénticas a las del modelo PyTorch original, y la diferencia máxima absoluta en las salidas del encoder es de 2.5e-5, atribuible a ruido de redondeo en fp32. No se han publicado resultados de benchmarks estándar de ASR (WER, CER) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU pura: el modelo ONNX se ejecuta correctamente con `CPUExecutionProvider` de `onnxruntime`. En un teléfono Android de gama media (arm64) se obtuvo un factor de tiempo real de 0.31x, lo que indica que es viable en dispositivos móviles.
- VRAM: no aplica, ya que la inferencia se realiza en CPU. Si se desea usar GPU, `onnxruntime` soporta proveedores CUDA, pero no se han proporcionado benchmarks.
- GPU recomendadas: no especificadas; el modelo puede ejecutarse en cualquier GPU compatible con CUDA si se usa `onnxruntime-gpu`, aunque el tamaño del encoder (1.77GB en fp32) requeriría al menos 4GB de VRAM.
- Opciones de despliegue: `onnxruntime` (CPU, CUDA, NNAPI), también puede integrarse en aplicaciones móviles mediante el runtime de ONNX para Android/iOS.
- Latencia y throughput: en el benchmark móvil, 1.35s para un clip de 4.4s, lo que equivale a un throughput de ~3.3x tiempo real. En servidores con CPU más potentes, el rendimiento sería superior.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables en la documentación proporcionada. El modelo original SraVaani-1.0 se destaca por su cobertura de idiomas indios, pero no se han incluido comparativas con otros sistemas como Whisper, Vosk o modelos específicos para lenguas indias. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para idiomas y dialectos de la India; su rendimiento en otros idiomas o acentos no está garantizado.
- La conversión ONNX se realiza en fp32, lo que duplica el tamaño del encoder (1.77GB) frente al checkpoint fp16 original (~0.88GB). Esto puede ser un inconveniente en dispositivos con almacenamiento limitado.
- La decodificación es greedy y no incorpora búsqueda en haz (beam search), lo que podría afectar a la precisión en entornos ruidosos o con vocabulario complejo.
- No se han documentado sesgos específicos, pero como todo modelo ASR, puede presentar errores en habla no nativa, dialectos no representados en el entrenamiento o condiciones acústicas adversas.
- El uso de NNAPI en Android resultó más lento que CPU en las pruebas; se recomienda usar `CPUExecutionProvider` para este modelo.
- La licencia MIT permite uso comercial, pero se debe atribuir la autoría original si se redistribuye el modelo o sus derivados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/killbanhar/sravaani-onnx
- Modelo original: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Paper (arXiv:2608.08235): https://arxiv.org/abs/2608.08235
- Repositorio GitHub con scripts de exportación y transcripción: https://github.com/piyushparkash/sravaani-voice-termux (incluye `onnx_transcribe.py` y `export_onnx.py`)
