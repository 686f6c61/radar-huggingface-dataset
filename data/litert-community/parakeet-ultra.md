# litert-community/parakeet-ultra

## Resumen

Parakeet Ultra para LiteRT es la conversión al formato `.tflite` del modelo de reconocimiento automático del habla `moondream/parakeet-ultra`, un post-entrenamiento de NVIDIA `parakeet-tdt-0.6b-v3`. El modelo original reconoce voz en 25 idiomas europeos y mantiene la arquitectura, el tokenizador y los 0,6 mil millones de parámetros del checkpoint de NVIDIA (su `config.json` es idéntico byte a byte al de v3). Esta conversión, publicada por la comunidad litert-community, está pensada para ejecución en dispositivos Android mediante LiteRT 2.3.0, con variantes de encoder para CPU (int8), GPU y NPU (float16).

La relevancia de esta ficha está en que ofrece inferencia de ASR de calidad competitiva directamente en hardware móvil: según la model card, en un Galaxy S26 los encoders float16 en NPU transcriben 115 veces más rápido que tiempo real (39× en GPU), y los encoders int8 alcanzan 34× en CPU y 10× en la CPU de un Pixel 8a. El WER sobre todo LibriSpeech test-clean con la NPU del Galaxy S26 es 1,417 %, frente a 1,426 % de la ejecución float32 en PyTorch de las mismas ventanas.

El paquete incluye el front-end log-mel, los encoders por longitud de ventana (10, 20 y 30 segundos), la red de predicción y la red conjunta del decodificador TDT, el tokenizador y un runner de línea de comandos para Android. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer con decodificador TDT (Token-and-Duration Transducer); arquitectura idéntica a NVIDIA parakeet-tdt-0.6b-v3 |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); procesamiento por ventanas consecutivas |
| Tipos de cuantizacion | int8 (encoders para CPU, decodificador int8), float16 (encoders para GPU/NPU); pesos del checkpoint en float16 y normas en float32 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | TFLite (`.tflite`) para LiteRT; tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA: un encoder Transformer que procesa características log-mel y un decodificador compuesto por una red de predicción (LSTM, con estados `h` y `c` de dimensión 640) y una red conjunta que emite 8.198 logits por paso: 8.193 logits de token (el índice 8192 es el token blank) más 5 logits de duración (0 a 4 frames). El encoder produce salidas de forma `[1, T/8, 640]` a partir de las características mel `[1, 128, T]`, con T de 1.000, 2.000 o 3.000 según la ventana de 10, 20 o 30 segundos.

El front-end log-mel replica el `ParakeetFeatureExtractor` de transformers: pre-énfasis, STFT de 512 puntos con ventana Hann de 400 muestras y salto de 160, 128 bins mel Slaney, logaritmo y normalización por ventana sobre los frames válidos. La decodificación es greedy sobre TDT. El modelo base es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`; la model card no detalla la composición del dataset de post-entrenamiento ni si hubo RLHF o DPO. La conversión se realizó con litert-torch 0.9.4 y ai-edge-quantizer 0.10.0 para LiteRT 2.3.0.

Una innovación destacable es el uso de buckets por longitud: cada ventana se envía al par de grafos más pequeño que la contiene (10, 20 o 30 s), de modo que los grafos cortos solo ahorran el trabajo sobre el padding. En float32, los grafos cortos dieron los mismos tokens que los de 30 s en las 83 ventanas de un subconjunto de prueba de 82 utterances. La cabeza de actividad de voz del checkpoint no se convirtió, por lo que el audio largo se corta en puntos fijos de 30 s y no en pausas.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos, incluidos español, inglés, alemán, francés, italiano, portugués, ruso, ucraniano y la mayoría de lenguas eslavas, bálticas, nórdicas y de Europa central y oriental.
- Transcripción de audio mono a 16 kHz con ventanas de hasta 30 segundos.
- Decodificación TDT greedy con predicción conjunta de token y duración (0 a 4 frames por paso).
- Procesamiento por lotes de ventanas consecutivas con unión de textos mediante un espacio.
- Ejecución en CPU (int8), GPU y NPU (float16) mediante LiteRT en Android.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción en tiempo real en aplicaciones Android: con los encoders float16 en NPU de un Galaxy S26 se alcanzan 115× tiempo real, lo que permite transcribir audio en streaming por ventanas de 10 s con latencia muy baja en el propio dispositivo.
- Subtitulado offline de reuniones y notas de voz: el modelo procesa ventanas de 30 s de forma independiente y une los textos, adecuado para generar transcripciones de grabaciones largas sin conexión a la nube.
- Dictado multilingüe en teclados y asistentes: al cubrir 25 idiomas europeos, un mismo binario puede servir para usuarios de español, alemán, polaco o finés sin cambiar de modelo.
- Procesamiento por lotes en servidores con CPU: los encoders int8 (1,95 GB con mel y decodificador) permiten transcribir corpus de audio en hardware sin GPU, con 34× tiempo real en CPU de móvil y previsiblemente más en CPU de servidor.
- Aplicaciones de accesibilidad: transcripción local de conversaciones para personas con discapacidad auditiva, sin enviar audio a servicios externos, gracias a la ejecución íntegra en el dispositivo.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio para generar índices de texto consultables, usando el conjunto int8 en CPU para abaratar costes.
- Investigación en ASR de bajo consumo: el paquete permite comparar precisión y latencia entre backends (CPU int8, GPU y NPU float16) con el mismo checkpoint y tokenizador.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos el 2026-10-31):

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (NPU Galaxy S26, float16) | 1,417 % |
| WER LibriSpeech test-clean (PyTorch float32, mismas ventanas) | 1,426 % |
| Velocidad float16 en NPU Galaxy S26 | 115× tiempo real |
| Velocidad float16 en GPU Galaxy S26 | 39× tiempo real |
| Velocidad int8 en CPU Galaxy S26 | 34× tiempo real |
| Velocidad int8 en CPU Pixel 8a | 10× tiempo real |
| Conjunto de evaluación de velocidad | 655 utterances de LibriSpeech test-clean, consecutivas |

No se han publicado en la información disponible resultados de benchmarks multilingües ni comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM/RAM estimada: el conjunto int8 completo (tres encoders, mel y decodificador) ocupa 1,95 GB; el conjunto float16 completo ocupa 3,68 GB. El repositorio total pesa 5,6 GB.
- Encoder int8 de 10 s: 616 MB; de 20 s: 641 MB; de 30 s: 665 MB. Encoder float16 de 10 s: 1,19 GB; de 20 s: 1,22 GB; de 30 s: 1,24 GB. Decodificador int8: 17,9 MB. Front-end mel: entre 1,6 y 2,9 MB según ventana.
- GPU recomendadas: no se especifican modelos de escritorio; la model card reporta medidas en GPU y NPU de un Galaxy S26 y en CPU de un Pixel 8a. Para servidor no hay datos de latencia o throughput publicados.
- Cabe en hardware móvil de gama alta (Galaxy S26, Pixel 8a) y, por tamaño, en GPUs de consumo con suficiente memoria para el conjunto float16 (3,68 GB), aunque no se han publicado medidas en esas GPUs.
- Opciones de despliegue: LiteRT 2.3.0 con su API C; el repositorio incluye un runner de línea de comandos para Android (`ultra_asr_runner_p.cc`) y su script de compilación (`build_android.sh`), con opciones `--pipeline` y `--pipeline-depth`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 115× tiempo real en NPU, 39× en GPU y 34×/10× en CPU según dispositivo (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| litert-community/parakeet-ultra (esta ficha) | 0,6B | ventanas de 30 s | 25 | cc-by-4.0 | TFLite / LiteRT en Android |
| moondream/parakeet-ultra | 0,6B | ventanas de 30 s | 25 | no disponible en la información | no disponible |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | ventanas de 30 s | no disponible en la información | no disponible en la información | no disponible |
| litert-community/parakeet-redux | misma arquitectura (variante ternaria) | ventanas de 30 s | no disponible en la información | no disponible en la información | TFLite / LiteRT en Android |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El corte de audio se hace en puntos fijos de 30 s, no en pausas, porque la cabeza de actividad de voz no se convirtió; una palabra que cruce un corte puede dividirse, perderse o repetirse.
- Las ventanas de menos de 320 muestras (dos frames mel) se descartan y no generan texto.
- Las filas del encoder más allá de los frames válidos no están definidas; el runner debe respetar las máscaras `mel_mask` y `frame_mask`.
- Los grafos cortos (10 y 20 s) solo ahorran trabajo sobre padding; la equivalencia de tokens se verificó en float32 sobre 83 ventanas, no en todos los backends.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- La cobertura lingüística se limita a 25 idiomas europeos; no se documentan otros idiomas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base `moondream/parakeet-ultra` y de `nvidia/parakeet-tdt-0.6b-v3`, cuyas licencias no se detallan en la información disponible.
- Las velocidades reportadas corresponden a LiteRT 2.3.0 con la API C y a los `.tflite` de este repositorio, no a LiteRT-LM ni a otras conversiones de la misma arquitectura.
- El WER de 1,417 % se midió solo en LibriSpeech test-clean (inglés); no hay datos de WER para el resto de idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/parakeet-ultra
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante ternaria relacionada: https://huggingface.co/litert-community/parakeet-redux
