# mlboydaisuke/wav2vec2-XLSR53-Japanese-ExecuTorch

## Resumen

El modelo `mlboydaisuke/wav2vec2-XLSR53-Japanese-ExecuTorch` es una conversión a formato ExecuTorch del modelo `jonatasgrosman/wav2vec2-large-xlsr-53-japanese`, un sistema de reconocimiento automático de voz (ASR) en japonés basado en la arquitectura wav2vec2. El objetivo de esta conversión es permitir la inferencia en dispositivos móviles y de borde mediante el runtime ExecuTorch de PyTorch, con soporte de aceleración XNNPACK. Se ofrecen dos builds: uno en precisión fp32 (1.27 GB) y otro en int8 dinámico (358 MB), que reduce el tamaño al 28% y es más rápido, manteniendo transcripciones idénticas en las pruebas de verificación.

El modelo procesa 10 segundos de audio mono a 16 kHz (160 000 muestras) en una sola pasada hacia adelante, sin bucle de decodificación ni caché KV, ya que usa decodificación CTC greedy sobre logits por trama de 20 ms. Es relevante porque ofrece una alternativa mucho más ligera que los modelos encoder-decoder tipo Whisper para ASR en japonés en entornos on-device, con una licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder Transformer + cabecera CTC) |
| Parametros totales | no disponible (el modelo base wav2vec2-large tiene ~300 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 10 segundos de audio (160 000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp32 e int8 dinamico |
| Idiomas soportados | japones |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (formato ExecuTorch), safetensors no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, que emplea un encoder Transformer con una convolucion posicional de 1024 canales y kernel 128 con grupos de 16, preentrenado de forma no supervisada sobre 56 000 horas de audio multilingue (Multilingual LibriSpeech, CommonVoice y BABEL) y posteriormente afinado para japones con datos de Common Voice, JSUT, TEDxJP y otros conjuntos. El proceso de conversion a ExecuTorch usa `torch.export` y la particion de XNNPACK, con una cobertura de delegacion de 64.5 % en fp32 y 75.2 % en int8. Un aspecto tecnico destacable es la eliminacion de la parametrizacion de `weight_norm` en la convolucion posicional, que reduce la latencia de 3485 ms a 267.8 ms, reportado como issue upstream en ExecuTorch.

## Capacidades

- Reconocimiento automatico de voz (ASR) en japones: transcribe audio a texto con decodificacion CTC greedy en una sola pasada.
- Ejecucion on-device: corre en Android y Mac con XNNPACK, sin necesidad de GPU.
- Soporte de atencion: requiere un `attention_mask` correcto para evitar degradacion del rendimiento con audio con padding.
- Sin soporte de tool calling, agentes ni multi-step reasoning: es exclusivamente un modelo de ASR.
- Sin puntuacion ni mayusculas: el vocabulario de 2341 entradas no incluye signos de puntuacion, y los numeros se transcriben como digitos (p. ej., `コーヒーを1杯`).
- Capacidades multilingues: no, el modelo esta especializado en japones.

## Casos de uso

- Asistente de voz en dispositivos moviles: el modelo puede transcribir comandos de voz en japones en tiempo real en un telefono, gracias a su tamano reducido (358 MB en int8) y su latencia de ~229 ms en un Mac arm64, sin necesidad de conexion a servidor.
- Subtitulado automatico de audio en aplicaciones de grabacion: se puede integrar en una app de notas para transcribir reuniones o entrevistas, procesando segmentos de 10 segundos de audio con una sola pasada.
- Sistema de busqueda por voz en contenido multimedia: indexar audio en japones convirtiendo el habla en texto para busqueda posterior, aprovechando la licencia Apache-2.0 para uso comercial.
- Interfaz de voz para personas con discapacidad: permite a usuarios dictar texto en japones en un dispositivo de bajo coste, sin depender de servicios en la nube.
- Automatizacion de transcripcion en entornos de produccion: el modelo puede integrarse en pipelines de procesamiento de audio para generar transcripciones preliminares que luego se corrigen con un modelo mas grande.
- Desarrollo de aplicaciones educativas para aprendizaje de japones: el modelo puede usarse para practicar pronunciacion y recibir transcripcion inmediata de frases dichas por el estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, WER, etc.) en la informacion disponible. La unica verificacion documentada es con 5 frases sinteticas generadas con macOS `say -v Kyoko`, donde tanto la version fp32 como la int8 producen transcripciones identicas al modelo eager, con un character error rate (CER) de 0.000 en la comparacion. Sin embargo, la autora advierte que el habla sintetica no es un benchmark real y no hay datos de WER con hablantes reales.

## Requisitos de hardware

- VRAM estimada: no aplicable en GPU, ya que el modelo esta disenado para CPU on-device. En memoria RAM, el archivo int8 ocupa 358 MB y el fp32 1271.7 MB.
- GPU recomendadas: no aplicable, el modelo usa XNNPACK (CPU). En un Mac arm64 se midio una latencia de 228.9 ms (int8) y 267.8 ms (fp32) para un segmento de 10 segundos, con la ejecucion de eager en 215.1 ms.
- Compatible con GPU consumer: no, esta disenado para CPU y dispositivos moviles.
- Opciones de despliegue: ExecuTorch runtime, con soporte para Android y Mac. Se puede integrar via el runtime de ExecuTorch en aplicaciones nativas.
- Latencia y throughput: en el Mac de referencia, la latencia es de ~229 ms (int8) para 10 segundos de audio, lo que equivale a un throughput de ~43.7x real-time (10/0.229).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| mlboydaisuke/wav2vec2-XLSR53-Japanese-ExecuTorch | wav2vec2 + CTC | ~300 M | 10 s audio | ExecuTorch (.pte) | Apache-2.0 | 5/5 transcripciones identicas (sintetico) |
| jonatasgrosman/wav2vec2-large-xlsr-53-japanese | wav2vec2 + CTC | ~300 M | 10 s audio | PyTorch (safetensors) | Apache-2.0 | No disponible en esta informacion |
| NTQAI/wav2vec2-large-japanese | wav2vec2 + CTC | ~300 M | 10 s audio | PyTorch | MIT | No disponible en esta informacion |
| Whisper small (japones) | Encoder-decoder Transformer | ~244 M | 30 s audio | PyTorch/GGUF | MIT | WER ~5 % en CommonVoice (referencia externa) |

La comparativa muestra que el modelo ExecuTorch es una conversion del modelo de jonatasgrosman, con el mismo rendimiento esperado en ASR japones, pero con la ventaja de un formato ligero para dispositivos. Whisper es mas capaz en general (puntuacion, multiples idiomas) pero requiere un decoder que consume mas recursos.

## Limitaciones y advertencias

- El modelo solo soporta japones, no es multilingue.
- No produce puntuacion, mayusculas ni numeros en kanji: la salida es texto plano con digitos.
- La entrada esta limitada a 10 segundos de audio; clips mas largos deben segmentarse, lo que puede perder contexto.
- Es critico proporcionar un `attention_mask` correcto: sin el, la transcripcion se degrada significativamente (4 de 5 frases incorrectas en las pruebas).
- No hay datos de WER con hablantes reales; la verificacion con voz sintetica no es un benchmark de calidad de reconocimiento.
- El modelo no soporta tool calling, agentes ni tareas de razonamiento; es exclusivamente ASR.
- El formato `.pte` es especifico de ExecuTorch y no es interoperable con otros runtimes como ONNX o TFLite.
- La conversion a int8 dinamico tiene una correlacion de 0.9978 respecto a fp32, aunque en las pruebas no afecto la salida; podria degradar en audio mas variado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlboydaisuke/wav2vec2-XLSR53-Japanese-ExecuTorch)
- [Modelo base: jonatasgrosman/wav2vec2-large-xlsr-53-japanese](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-japanese)
- [Repo de conversion: executorch-models](https://github.com/john-rocky/executorch-models)
- [Issue de ExecuTorch: pytorch/executorch#22078](https://github.com/pytorch/executorch/issues/22078)
- [Documentacion de WAV2VEC2_XLSR53 en Torchaudio](https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html)
