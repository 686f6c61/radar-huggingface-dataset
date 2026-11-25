# moonbox-dev/parakeet-tdt-0.6b-v3-TensorRT

## Resumen

Parakeet TDT v3 TensorRT es una conversión a motores TensorRT del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario `moonbox-dev`. El modelo original es un FastConformer con decodificación TDT (Token-and-Duration Transducer) de NVIDIA, con 0,6 mil millones de parámetros, diseñado para transcripción multilingüe de 25 idiomas europeos con puntuación y mayúsculas incluidas. Esta versión no altera los pesos ni el comportamiento del modelo base: reempaqueta los tres componentes de la arquitectura (encoder, decoder LSTM y joint) en motores TensorRT optimizados para GPUs NVIDIA RTX de las series 30, 40 y 50.

La relevancia de esta ficha radica en que permite ejecutar un ASR de calidad producción sin PyTorch en el bucle de inferencia: el runner se apoya únicamente en TensorRT, Polygraphy y numpy. Los motores se construyen con compatibilidad de hardware (Ampere y posteriores) y de versión (cualquier TensorRT 10.x desde 10.13), de modo que no requieren recompilación por GPU concreta. El repositorio ocupa 2,7 GB y solo incluye la precisión fp16.

El modelo resuelve el problema de desplegar reconocimiento de voz multilingüe con baja latencia en hardware de consumo. Según los datos del autor, la versión fp16 alcanza un WER de 2,05 % en 400 clips de LibriSpeech test-clean, idéntico al build ONNX de referencia, con un factor de tiempo real (RTF) de 0,021 frente a 0,026 del ONNX. La licencia es CC-BY-4.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (Token-and-Duration Transducer); encoder Conformer, decoder LSTM y joint network |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrada de audio de hasta 40 s por inferencia (T de 10 a 4.000 frames de 10 ms); no aplica contexto de texto |
| Tipos de cuantizacion | fp16 (motores TensorRT incluidos); el autor indica que los builds ONNX int8 e int4 pasan el mismo benchmark, pero no se incluyen en este repo |
| Idiomas soportados | 25 idiomas europeos (según model card del modelo base); lista concreta no disponible en la información proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores TensorRT (`.engine`) + `config.json`, `tokenizer.json`, `mel_filters.npy` y scripts Python |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-TDT de NVIDIA. La arquitectura se divide en tres piezas que esta conversión mantiene separadas como motores independientes: un encoder que recibe características log-mel normalizadas de 128 bandas con frames de 10 ms y produce representaciones de dimensión 640 con subsampling de factor 8; un decoder LSTM (prediction network) con estados `h` y `c` de forma [2, 1, 640]; y una joint network que combina un frame del encoder con la salida del decoder para producir 8.198 logits (8.193 tokens más el blank) y 5 logits de duración (0 a 4 frames). La decodificación es greedy TDT, equivalente a `ParakeetForTDT.generate` de transformers, reimplementada en numpy.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card de esta conversión no los detalla y remite al modelo base. La innovación técnica de esta publicación es la ingeniería de despliegue: motores compilados con compatibilidad de hardware (Ampere y posteriores) y de versión (TensorRT 10.13 o superior mediante el runtime lean), con los casts de fp16 plegados en pesos fp32 para que la aritmética de los motores sea fp32, igual que el build ONNX de referencia. No se incluye int8 porque TensorRT requiere activaciones calibradas para ese modo.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de 16 kHz mono en formato float32.
- Transcripción multilingüe de 25 idiomas europeos según el modelo base.
- Generación de puntuación y mayúsculas en la salida.
- Decodificación TDT greedy con modelado explícito de duración (0 a 4 frames por token).
- Procesamiento de segmentos de hasta 40 segundos por inferencia (T máximo de 4.000 frames).
- Ejecución sin PyTorch: solo TensorRT, Polygraphy y numpy en el camino de inferencia.
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa segmentos de hasta 40 s con puntuación y mayúsculas, adecuado para generar actas automáticas en entornos corporativos con GPUs RTX.
- Subtitulado y transcripción de contenido audiovisual: el RTF de 0,021 en una RTX 3080 Laptop permite transcribir audio más rápido que tiempo real, útil para pipelines de generación de subtítulos.
- Atención al cliente con análisis de llamadas: al cubrir 25 idiomas europeos, permite transcribir conversaciones telefónicas y alimentar sistemas de análisis de sentimiento o control de calidad.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o web que conviertan voz en texto en tiempo real sobre hardware de consumo de las series RTX 30, 40 o 50.
- Búsqueda y indexación de archivos de audio: transcripción por lotes de archivos de hasta 40 s para construir índices de texto sobre bibliotecas de audio.
- Investigación en ASR: al ser una conversión fiel del modelo base con licencia CC-BY-4.0, sirve como referencia reproducible para comparar latencias y precisión entre TensorRT, ONNX y PyTorch.
- Despliegue en producción sin PyTorch: el runner ligero reduce el tamaño de la imagen de contenedor y las dependencias, adecuado para servicios de transcripción con requisitos estrictos de latencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. El benchmark usa 400 clips de LibriSpeech test-clean, decodificación greedy, sobre una RTX 3080 Laptop GPU. La puntuación compara el WER contra la verdad de referencia y contra las transcripciones del build ONNX fp16.

| Modelo / build | WER | Transcripciones idénticas al build ONNX | RTF |
|---|---|---|---|
| ONNX fp16 (CUDA) | 2,05 % | - | 0,026 |
| TensorRT fp16 (este repo) | 2,05 % | 399 de 400 | 0,021 |
| Referencia transformers ParakeetForTDT fp32 | 2,06 % | - | no disponible |

El criterio de aceptación del autor era un WER no superior en más de 1 punto al del build ONNX; el resultado queda 0 puntos por encima y con una mejora de RTF de aproximadamente el 19 % (0,021 frente a 0,026). No se han publicado en la información disponible resultados de benchmarks multilingües, MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder ocupa 2,58 GB en disco y el decoder 69,2 MB y el joint 54,9 MB; en fp16 con aritmética fp32, se estima un consumo de VRAM del orden de 3 a 4 GB, aunque el autor no publica la cifra exacta.
- GPU recomendadas: cualquier GPU NVIDIA Ampere o posterior, es decir, RTX 30, 40 y 50 series, además de A100, H100 y equivalentes profesionales.
- Cabe en GPU de consumo: sí, en las RTX 30, 40 y 50 series según la compatibilidad declarada por el autor.
- Opciones de despliegue: motores TensorRT con el runtime `tensorrt-cu12>=10.13,<11` y `tensorrt-lean-cu12>=10.13,<11`, más Polygraphy y numpy; el runner `trt_runner.py` no usa PyTorch.
- Latencia y throughput: RTF de 0,021 en RTX 3080 Laptop GPU, es decir, aproximadamente 47,6 veces más rápido que tiempo real en ese hardware.
- Dependencias adicionales: `tokenizers` y `soundfile` para leer audio en los scripts de ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet TDT v3 TensorRT (este repo) | 0,6 B | hasta 40 s por inferencia | 25 idiomas europeos | CC-BY-4.0 | TensorRT |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 0,6 B | no disponible en la información proporcionada | 25 idiomas europeos | CC-BY-4.0 | safetensors / PyTorch |
| Build ONNX fp16 del mismo modelo | 0,6 B | hasta 40 s por inferencia | 25 idiomas europeos | CC-BY-4.0 | ONNX |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s por ventana | multilingüe amplio | MIT | PyTorch / múltiples |

La comparación con Whisper large-v3 se incluye como referencia de categoría, pero no se dispone de datos de benchmark comparativos directos en la información proporcionada. La ventaja de esta conversión frente al modelo base y al build ONNX es la latencia (RTF 0,021) y la ausencia de PyTorch; su desventaja es que solo incluye fp16 y requiere GPU NVIDIA Ampere o posterior.

## Limitaciones y advertencias

- Solo se incluye la precisión fp16; no hay motores int8 ni int4 en este repositorio, aunque el autor indica que los builds ONNX correspondientes pasan el mismo benchmark.
- Los motores requieren TensorRT 10.13 o superior y una GPU Ampere o posterior; no funcionan en GPUs anteriores ni en hardware no NVIDIA.
- La entrada debe ser audio de 16 kHz mono en float32; no se documenta soporte para otros formatos o frecuencias de muestreo.
- El límite de 40 s por inferencia obliga a segmentar audios largos, lo que puede introducir errores en las fronteras de segmento.
- No se dispone de información sobre sesgos del modelo base, tasas de alucinación en ASR ni comportamiento en condiciones de ruido, acentos o dominios específicos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria independiente.
- La lista concreta de los 25 idiomas europeos no está disponible en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/parakeet-tdt-0.6b-v3-TensorRT
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencias arXiv citadas en los tags: arXiv:2509.14128, arXiv:2505.13404, arXiv:2305.05084, arXiv:2304.06795, arXiv:2410.01036, arXiv:2406.00899, arXiv:2205.12446, arXiv:2012.03411, arXiv:2007.10310, arXiv:1510.08484
- Documentación de TensorRT: no disponible en la información proporcionada
- Repositorio de Polygraphy: no disponible en la información proporcionada
