# litert-community/Phonon-2

## Resumen

Phonon-2 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Fermion Research. Parte de la arquitectura de NVIDIA parakeet-tdt-0.6b-v3 (transformer con decodificación TDT, Token-and-Duration Transducer) y reentrena los pesos lineales del encoder para comprimirlos a cinco valores por fila de salida, logrando una descarga de 164 MB con un WER del 5,21 % según la web del autor. El repositorio que nos ocupa, litert-community/Phonon-2, es una conversión de esos pesos a LiteRT (TFLite) para ejecución en dispositivos Android, con variantes para CPU (int8), GPU y NPU (float16).

La conversión deshace el empaquetado compacto original: los pesos grandes se expanden a float16 o int8, de modo que los ficheros resultantes ocupan 1,95 GB (conjunto CPU) o 3,68 GB (conjunto GPU/NPU), frente a los 164 MB del modelo base. A cambio, se habilita la aceleración por NPU y GPU del teléfono mediante LiteRT. Según la model card, en un Galaxy S26 los encoders float16 en NPU transcriben 109 veces más rápido que tiempo real con el pipeline de dos hilos del runner, 39 veces en GPU, y los encoders int8 alcanzan 45 veces en CPU (medido sobre 655 utterances de LibriSpeech test-clean el 2026-11-08).

El modelo es relevante porque demuestra que un ASR de calidad cercana al estado del arte puede ejecutarse íntegramente en un móvil con aceleración hardware, con un WER del 1,728 % en NPU sobre LibriSpeech test-clean (frente al 1,736 % de la ejecución float32 en PyTorch de las mismas ventanas). Está pensado para desarrolladores que necesitan transcripción offline, de baja latencia y privada en Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder + decodificador TDT (Token-and-Duration Transducer), heredada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | no disponible (el modelo base se publica como descarga de 164 MB con pesos empaquetados; el conteo de parámetros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); variantes de grafo para 10, 20 y 30 s |
| Tipos de cuantizacion | int8 (CPU, pesos int8 con una escala por canal de salida y activaciones int8 en tiempo de ejecución) y float16 (GPU/NPU) |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | TFLite / LiteRT (.tflite), más tokenizer.json y ficheros auxiliares |

## Arquitectura y entrenamiento

La arquitectura es la de parakeet-tdt-0.6b-v3: un encoder transformer que procesa características log-mel (128 bins Slaney, STFT de 512 puntos, ventana Hann de 400 muestras, hop de 160) y un decodificador TDT con red de predicción (`predict`) y red conjunta (`joint`) que emite tokens y duraciones de 0 a 4 frames de forma greedy. El vocabulario del decodificador tiene 8.198 logits: 8.193 tokens más el blank (8192) y 5 logits de duración.

Phonon-2 modifica los pesos del modelo base: los pesos lineales del encoder se reentrenan para tomar cinco valores por fila de salida ({0, ±lo, ±hi}) y el resto de pesos grandes se almacenan como tablas de 6 bits, lo que reduce la descarga a 164 MB. La conversión a LiteRT descarta ese empaquetado y expande los pesos grandes a float16 (GPU/NPU) o int8 (CPU). Los grafos se construyen con el mismo código que litert-community/parakeet-ultra y los ficheros mel son idénticos byte a byte. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio mono a 16 kHz.
- Procesamiento por ventanas de hasta 30 s con buckets de 10, 20 y 30 s para evitar trabajo de padding en audio corto.
- Decodificación TDT greedy con predicción conjunta de token y duración (0-4 frames), lo que reduce pasos de decodificación frente a un CTC o transducer convencional.
- Front-end mel completo incluido como grafo LiteRT (pre-énfasis, STFT, 128 bins mel, normalización por ventana).
- Ejecución acelerada en NPU y GPU de Android vía LiteRT, y en CPU con la variante int8.
- Tokenizer compatible con nvidia/parakeet-tdt-0.6b-v3 (tokenizer.json incluido).
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá de ASR ni capacidades multilingües (solo inglés).

## Casos de uso

- Transcripción offline en Android: integración de los grafos LiteRT en una app móvil para dictado o notas de voz sin conexión, usando el conjunto f16 en NPU para minimizar latencia y consumo.
- Subtitulado en tiempo real de reuniones o clases: con ventanas de 10 s y el encoder f16 en NPU, el runner procesa audio 109 veces más rápido que tiempo real en un Galaxy S26, lo que deja margen para el post-procesado y la interfaz.
- Privacidad y cumplimiento: al ejecutarse íntegramente en el dispositivo, el audio no sale del terminal, adecuado para entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Asistentes de voz embebidos: el decodificador TDT int8 (17,8 MB) más el encoder permiten decodificación en el host con estado recurrente de 640 dimensiones, integrable en pipelines de comandos de voz.
- Transcripción por lotes en servidores con CPU: el conjunto int8 (1,95 GB) ofrece 45 veces tiempo real en CPU de móvil, útil para procesar archivos de audio en entornos sin GPU.
- Investigación en ASR eficiente: sirve como referencia reproducible para comparar WER y velocidad entre backend NPU, GPU y CPU sobre LibriSpeech test-clean.
- Evaluación de despliegue LiteRT: los ficheros y el runner C (`ultra_asr_runner_p.cc`, `build_android.sh`) permiten medir latencia y throughput en hardware Android concreto antes de comprometerse con una arquitectura.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER LibriSpeech test-clean (NPU) | 1,728 % | Galaxy S26, encoders f16, 655 utterances |
| WER LibriSpeech test-clean (PyTorch float32) | 1,736 % | mismas ventanas, referencia |
| Velocidad NPU | 109× tiempo real | encoders f16, pipeline de dos hilos |
| Velocidad GPU | 39× tiempo real | encoders f16 |
| Velocidad CPU | 45× tiempo real | encoders int8, sin pipeline |
| WER modelo base (web del autor) | 5,21 % | Phonon-2 original de 164 MB, sin detallar conjunto de evaluación |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al tratarse de un modelo exclusivamente ASR.

## Requisitos de hardware

- VRAM/RAM estimada: conjunto CPU int8 de 1,95 GB (encoder 616-665 MB, mel, decodificador 17,8 MB); conjunto GPU/NPU f16 de 3,68 GB (encoder 1,19-1,24 GB por variante de ventana).
- GPU recomendadas: no se especifican modelos de escritorio; la model card se centra en GPU y NPU integradas en SoC Android (Galaxy S26 como referencia).
- Cabe en GPU de consumo: sí, en términos de memoria, aunque el formato TFLite está orientado a Android; para escritorio el autor recomienda las builds Core ML y CPU Android de Fermion Research.
- Opciones de despliegue: LiteRT 2.3.0 con litert-torch 0.9.4 y ai-edge-quantizer 0.10.0; runner de línea de comandos para Android con la API C de LiteRT (`ultra_asr_runner_p.cc`, `build_android.sh`); el modelo base dispone de soporte MLX según la página de Hugging Face.
- Latencia y throughput: 109× tiempo real en NPU, 39× en GPU y 45× en CPU sobre Galaxy S26; no se publican latencias absolutas en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| litert-community/Phonon-2 | no disponible (164 MB empaquetado en el base) | 30 s por ventana | en | cc-by-4.0 | TFLite/LiteRT |
| FermionResearch/Phonon-2 | no disponible (164 MB) | 30 s por ventana | en | cc-by-4.0 | MLX, Core ML, CPU Android |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (según nombre) | no disponible en la información | no disponible | no disponible | no disponible |
| litert-community/parakeet-ultra | no disponible | no disponible | no disponible | no disponible | TFLite/LiteRT |

La comparativa con alternativas de la misma categoría queda limitada a los modelos citados en la información; no se dispone de datos de WER ni velocidad de parakeet-tdt-0.6b-v3 ni de parakeet-ultra para contrastar.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- El corte de audio se hace en puntos fijos de 30 s, no en pausas, por lo que una palabra que cruce un corte puede dividirse, perderse o repetirse.
- Las ventanas de menos de 320 muestras (dos frames mel) se descartan sin texto.
- Los ficheros LiteRT son mucho mayores que el modelo base (1,95 GB o 3,68 GB frente a 164 MB) por la expansión de pesos; conviene valorar el coste de almacenamiento en el dispositivo.
- Las filas del encoder más allá de los frames válidos son indefinidas; el consumidor debe respetar `frame_mask`.
- Riesgo de alucinación y errores en audio con ruido, acentos no ingleses o solapamiento de hablantes; no se documentan sesgos específicos.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero debe verificarse la licencia del modelo base y de los componentes de NVIDIA heredados.
- El rendimiento medido corresponde a un Galaxy S26 concreto; en otros SoC la aceleración NPU/GPU puede variar y requerir validación.
- La velocidad sigue en ajuste según la model card ("Speed still being tuned"), por lo que las cifras pueden cambiar.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/Phonon-2
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
- Página del autor: https://www.fermionresearch.com/models/phonon-2/
- Modelo de referencia NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión relacionada: https://huggingface.co/litert-community/parakeet-ultra
- Conversión relacionada: https://huggingface.co/litert-community/parakeet-redux
- Comunidad LiteRT: https://huggingface.co/litert-community
