# litert-community/parakeet-redux

## Resumen

parakeet-redux for LiteRT es la conversión a LiteRT (el runtime de Google derivado de TensorFlow Lite) del modelo de reconocimiento automático del habla moondream/parakeet-redux, que a su vez es una versión comprimida de nvidia/parakeet-tdt-0.6b-v3. El resultado son ficheros `.tflite` pensados para ejecutarse en un teléfono Android sobre CPU, GPU o NPU, sin conexión y sin servidor. La conversión la mantiene la organización litert-community, no NVIDIA ni Moondream, y se realizó con litert-torch 0.9.4 y ai-edge-quantizer 0.10.0.

El modelo resuelve el problema de llevar un sistema ASR de calidad a hardware móvil: el encoder original de 0,6 mil millones de parámetros se reduce a capas lineales ternarias (−1, 0, +1) empaquetadas como enteros de 4 bits, con una escala por cada 128 pesos. En un Galaxy S26 transcribe 99 veces más rápido que tiempo real en la NPU, 52 veces en la GPU y 29 veces en la CPU, con una tasa de error de palabra del 1,977 % sobre todo LibriSpeech test-clean en NPU, frente al 1,968 % de la ejecución de referencia en float32 con PyTorch.

La relevancia es doble: por un lado demuestra que un ASR multilingüe de 25 idiomas cabe en un móvil con precisión prácticamente idéntica a la del modelo sin cuantizar; por otro, expone las limitaciones del camino: la cabeza de detección de voz no se ha convertido, el audio se corta en ventanas fijas de 30 s y la decodificación TDT greedy se ejecuta en el host, no dentro de los grafos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (token-and-duration transducer): encoder con proyecciones lineales ternarias, red de predicción LSTM y red conjunta con salida de tokens y duraciones |
| Parametros totales | 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3); el Redux original se comprime a 178 MB con pesos ternarios |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz, 3.000 frames mel); grafos independientes de 10, 20 y 30 s; sin contexto entre ventanas |
| Tipos de cuantizacion | enteros de 4 bits sobre pesos ternarios (−1, 0, +1, una escala por 128 pesos) en 240 de las 264 capas lineales; float16 en encoder para GPU/NPU; int8 en la red de predicción y la conjunta |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT, no un encoder-decoder tipo Whisper. La cadena es: audio mono a 16 kHz, preénfasis y STFT (512 puntos, ventana Hann de 400 muestras, hop de 160), 128 bins mel Slaney, logaritmo y normalización por ventana sobre los frames válidos. El encoder consume esos features y produce una representación de 640 dimensiones con submuestreo ×8 (12,5 frames por segundo). La red de predicción es una LSTM de dos capas con estados `h` y `c` de 640 dimensiones, y la red conjunta emite 8.198 logits por paso: 8.193 de vocabulario (el id 8.192 es el blank) más 5 logits de duración (0–4 frames).

El entrenamiento original corresponde a NVIDIA parakeet-tdt-0.6b-v3; esta ficha no dispone de datos sobre el número de tokens, la composición del dataset ni las fases de alineamiento o ajuste fino empleadas. La innovación técnica del Redux es la ternarización del encoder: 240 de las 264 capas lineales se almacenan como valores ternarios con una escala compartida por cada 128 pesos, y las 24 proyecciones de posición relativa se pliegan en constantes float32 junto con la tabla de posiciones. Los ficheros con sufijo `i4` van dirigidos a CPU; los `f16` a GPU y NPU, con las entradas de LayerNorm reescaladas para que la aritmética float16 no desborde.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con un único modelo y sin adaptación por idioma.
- Decodificación TDT greedy con predicción conjunta de token y duración, ejecutada paso a paso en el host sobre las salidas del encoder.
- Ejecución totalmente local: los grafos LiteRT corren en CPU, GPU o NPU de un Android, sin llamadas de red.
- Tres tamaños de grafo (10, 20 y 30 s) que actúan como buckets: cada ventana se enruta al par mel+encoder más pequeño que la contenga, ahorrando el trabajo sobre padding.
- Procesamiento por lotes desde línea de comandos en Android mediante el runner en C (`redux_asr_runner_b.cc`) y su script de compilación.
- No incluye detección de actividad de voz: la cabeza VAD del modelo original no se ha convertido.
- No incluye timestamps por palabra ni diarización de hablantes; no hay soporte documentado de puntuación o capitalización.
- No soporta tool calling, function calling, agentes, visión ni audio en streaming incremental dentro de los grafos.

## Casos de uso

- Transcripción de notas de voz en Android: el modelo corre sobre la NPU del teléfono a 99× tiempo real, de modo que una grabación de 10 minutos se transcribe en unos 6 segundos sin enviar audio a ningún servidor.
- Dictado offline en aplicaciones móviles: al no requerir red y ocupar 1,14 GB en la variante `i4`, se puede empaquetar en la app y funcionar en modo avión o en dispositivos sin conectividad.
- Subtitulado de archivos pregrabados en escritorio: el runner de línea de comandos convierte WAV de 16 kHz mono y el script auxiliar acepta cualquier formato vía ffmpeg, adecuado para generar transcripciones de vídeo en local.
- Procesamiento por lotes en servidores sin GPU: el conjunto `i4` (1,14 GB con mel y decoder) transcribe a 29× tiempo real en CPU, suficiente para indexar archivos de audio de una organización sin coste de acelerador.
- Transcripción multilingüe en la UE: cubre 25 idiomas, incluidos los bálticos, el esloveno, el croata, el maltés y el griego, lo que permite un único pipeline para corpus con mezcla de lenguas europeas.
- Investigación en eficiencia de modelos: sirve como referencia reproducible de cuantización ternaria + 4 bits con métricas publicadas de WER frente a float32, útil para estudiar la degradación por cuantización en ASR.
- Aplicaciones de privacidad y cumplimiento: al ejecutarse íntegramente en el dispositivo, evita el tratamiento de datos biométricos por voz en servidores de terceros, lo que simplifica el análisis de RGPD.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| WER en LibriSpeech test-clean (NPU) | 1,977 % | Todo el conjunto, ventanas procesadas una tras otra |
| WER en LibriSpeech test-clean (referencia float32 PyTorch) | 1,968 % | Mismas ventanas, misma máquina |
| Throughput en NPU (Galaxy S26) | 99× tiempo real | 655 utterances de LibriSpeech test-clean, LiteRT 2.3.0 |
| Throughput en GPU (Galaxy S26) | 52× tiempo real | Mismo conjunto |
| Throughput en CPU (Galaxy S26) | 29× tiempo real | Mismo conjunto |
| Throughput en escritorio (app de terceros) | 113× tiempo real | Medición independiente del proyecto RayCodes_Parakeet_Redux, no verificada por el autor |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR. Tampoco hay cifras de WER desglosadas por idioma más allá del inglés.

## Requisitos de hardware

- Variante `i4` (CPU): 1,14 GB en total con mel y decoder. Encoders de 345,9 MB (10 s), 370,5 MB (20 s) y 395,0 MB (30 s); decoder int8 de 17,9 MB; frentes mel de 1,6 a 2,9 MB.
- Variante `f16` (GPU/NPU): 3,68 GB en total. Encoders de 1,19 GB (10 s), 1,22 GB (20 s) y 1,24 GB (30 s).
- VRAM estimada: no hay cifra oficial; el encoder `f16` de 30 s ocupa 1,24 GB en disco y necesita espacio adicional para activaciones, por lo que se recomienda al menos 2 GB de memoria gráfica dedicada.
- Encaja en GPU de consumo: sí, cualquier GPU con 2–4 GB libres puede alojar los grafos `f16`, y la variante `i4` está pensada para ejecutarse sin acelerador.
- Aceleradores validados: NPU y GPU de un Galaxy S26; el runner de referencia se compila para Android con el SDK LiteRT (C API), no se documentan pruebas en A100, H100 ni RTX 4090.
- Despliegue: LiteRT 2.3.0 en Android o en host; conversión desde PyTorch con litert-torch 0.9.4; no se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 99× tiempo real en NPU, 52× en GPU y 29× en CPU del Galaxy S26; no se publican cifras de latencia por ventana ni de RTF en x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/parakeet-redux (este) | 0,6 B | ventanas de 10/20/30 s | LiteRT `.tflite` (i4, f16, i8) | cc-by-4.0 | HuggingFace, runner Android incluido |
| moondream/parakeet-redux | 0,6 B (178 MB ternario) | ventanas de audio, longitud no disponible | Safetensors, 8 bits | cc-by-4.0 | HuggingFace, orientado a CPU y Apple Silicon |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | ventanas de audio, longitud no disponible | NeMo / Safetensors | no verificada en la información disponible | HuggingFace, modelo de referencia |
| warped-community/parakeet-tdt-0.6b-litert-lm | no disponible | no disponible | LiteRT | no disponible | HuggingFace |

Los cuatro comparten el mismo encoder de 0,6 B y la misma tokenización; las diferencias están en el formato de pesos, el empaquetado de cuantización y el runtime de destino.

## Limitaciones y advertencias

- La cabeza de detección de voz no se ha convertido: el audio largo se corta en puntos fijos de 30 s (479.840 muestras), no en pausas, por lo que una palabra que cruce un corte puede partirse o perderse.
- Cada ventana se transcribe de forma independiente y los textos se unen con un espacio; no hay contexto acústico ni lingüístico entre ventanas, lo que perjudica la coherencia en conversaciones largas.
- El token de fin de texto (id 3, `<|endoftext|>`) no está marcado como especial en `tokenizer.json`; una ventana que terminase en él imprimiría el token literal. El autor indica que no ocurrió en sus pruebas, pero es un riesgo latente del pipeline.
- Las filas del tensor de salida del encoder más allá de los frames válidos son indefinidas: cualquier consumidor debe respetar `frame_mask`, no solo recortar por longitud.
- Decodificación greedy sin beam search ni modelo de lenguaje externo: la calidad en audio ruidoso o con acentos alejados del dominio de entrenamiento no está documentada y el WER publicado se limita a LibriSpeech test-clean (lectura limpia en inglés).
- La decodificación se ejecuta en el host paso a paso, con estados LSTM de 640 dimensiones; el coste de esta parte no aparece en las cifras de throughput, que miden la cadena completa pero podrían variar con la implementación del consumidor.
- Licencia cc-by-4.0: permite uso comercial con atribución; hay que citar a Moondream y NVIDIA y conservar el aviso de licencia.
- Es una conversión de la comunidad (litert-community), sin soporte oficial de NVIDIA ni de Moondream; el repositorio no registra descargas ni likes en el momento de la consulta, lo que reduce la validación externa.
- No se documentan sesgos por idioma, dialecto o género; al ser un modelo entrenado mayoritariamente sobre corpus europeos, es esperable un rendimiento desigual entre los 25 idiomas, pero no hay métricas públicas que lo cuantifiquen.

## Enlaces

- [litert-community/parakeet-redux en HuggingFace](https://huggingface.co/litert-community/parakeet-redux)
- [moondream/parakeet-redux (modelo base)](https://huggingface.co/moondream/parakeet-redux)
- [nvidia/parakeet-tdt-0.6b-v3 (modelo original)](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Blog de Moondream: Introducing Parakeet Redux and Parakeet Ultra](https://moondream.ai/blog/introducing-parakeet-redux-and-ultra)
- [Analisis independiente: is a 178 MB speech model useful in the real world?](https://abhashchakraborty.tech/writing/how-small-can-speech-recognition-get)
- [warped-community/parakeet-tdt-0.6b-litert-lm (conversión LiteRT alternativa)](https://huggingface.co/warped-community/parakeet-tdt-0.6b-litert-lm)
- [RayCodes_Parakeet_Redux en GitHub (aplicación de escritorio)](https://github.com/47thtechcorner/RayCodes_Parakeet_Redux)
