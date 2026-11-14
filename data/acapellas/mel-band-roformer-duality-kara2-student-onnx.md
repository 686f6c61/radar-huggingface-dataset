# Acapellas/mel-band-roformer-duality-kara2-student-onnx

## Resumen

Mel-Band RoFormer Duality and KARA 2 student es un modelo de separación de fuentes musicales desarrollado por el usuario Acapellas, que exporta a formato ONNX el modelo original de `musetric`. Su función es descomponer una canción en tres pistas simultáneas: instrumental, voz principal (lead vocals) y coros (backing vocals), todo en una sola pasada. El modelo base es `musetric/mel-band-roformer-duality-kara2-student`, un derivado de la familia Mel-Band RoFormer, una arquitectura de separación de audio basada en transformers con procesamiento en bandas mel.

La relevancia de esta exportación radica en su orientación a la inferencia en el cliente y en el borde (edge), gracias al uso de `onnxruntime-web` con aceleración por WebGPU. El grafo ONNX contiene únicamente el núcleo de la red neuronal: recibe una representación STFT precalculada en el host y devuelve máscaras complejas por bin de frecuencia. Las operaciones de STFT, iSTFT, troceado y empaquetado complejo se ejecutan fuera del grafo, en el host. El repositorio ocupa 0,2 GB y los pesos están en fp16 con entrada y salida en fp32.

El modelo es de tipo student, lo que indica que ha sido destilado a partir de un modelo mayor (probablemente el modelo duality-kara2 completo). Está publicado bajo licencia Apache-2.0 y su ventana temporal es estática: T = 1100 frames, aproximadamente 11 segundos a 44,1 kHz con hop de 441.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con procesamiento en bandas mel), exportado a ONNX |
| Parametros totales | no disponible (pesos en fp16, fichero .onnx.data de 235.400.588 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana estática de T = 1100 frames (~11 s a 44,1 kHz, hop 441) |
| Tipos de cuantizacion | fp16 (pesos); entrada y salida del grafo en fp32 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 23, IR 10), con fichero externo `.onnx.data` |
| Entrada | `stft_repr` float32 `[1, 2050, T, 2]` (batch, freq*2, tiempo, complejo) |
| Salida | `masks` float32 `[2, 2050, T, 2]` (máscara de voces sobre la mezcla y máscara de coros sobre las voces) |
| Tamaño del repositorio | 0,2 GB |
| Runtime | onnxruntime-web (WebGPU) |
| Modelo base | `musetric/mel-band-roformer-duality-kara2-student` (commit `8f928dd73899dd9279a878d732841919a98e61e6`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mel-Band RoFormer, un transformer que opera sobre una representación STFT agrupada en bandas mel. El grafo exportado contiene el núcleo de la red: un flujo de 288 canales con feed-forwards de 768 en los pares de capas 0-1 y de 1536 en los pares 2-5, donde los pares 2-5 procesan frames promediados por 2. Las tablas de agrupación y promedio por bandas mel están embebidas en el grafo. Incluye un estimador de separación que opera por banda sobre la salida agrupada del stack de transformers: una capa lineal de 288 x 768, una activación tanh y una capa lineal al doble del tamaño de la banda, con compuerta (gating), todo en fp16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Al tratarse de un modelo de separación de audio, estas técnicas no son directamente aplicables en el sentido habitual de los modelos de lenguaje. El modelo es una exportación de inferencia únicamente; los pesos en PyTorch están en el repositorio base de `musetric`. La innovación técnica destacable es la doble máscara en una sola pasada: el modelo estima simultáneamente la máscara de voces sobre la mezcla y la máscara de coros sobre las voces, lo que permite derivar las tres pistas (instrumental, voz principal y coros) sin ejecutar dos modelos separados. La validación se realizó contra el modelo PyTorch en fp32 sobre CUDA con TF32 desactivado, aplicando las máscaras a la STFT de la ventana e invirtiéndolas a vocals, backing y lead.

## Capacidades

- Separación de fuentes musicales en tres pistas: instrumental, voz principal (lead vocals) y coros (backing vocals) en una sola pasada.
- Entrada basada en representación STFT precalculada: el modelo no calcula la STFT ni la iSTFT; el host debe proporcionar `stft_repr` y aplicar las máscaras devueltas.
- Salida de máscaras complejas por bin de frecuencia: dos máscaras, una para voces sobre la mezcla y otra para coros sobre las voces.
- Inferencia en el cliente y en el borde mediante WebGPU a través de `onnxruntime-web`.
- Ventana temporal estática de 1100 frames (~11 s), adecuada para procesamiento por trozos con solapamiento gestionado en el host.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje; es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada en sentido generativo; su tarea es la separación de fuentes.

## Casos de uso

- **Karaoke automático**: el modelo separa la voz principal de los coros y del instrumental, lo que permite generar pistas de karaoke donde se silencia la voz principal pero se conservan los coros. Es adecuado porque distingue explícitamente entre lead y backing vocals, algo que los modelos de dos pistas no hacen.
- **Remezcla y producción musical**: un productor puede aislar la pista instrumental para samplear o remezclar, o extraer los coros para armonías. La separación en una sola pasada reduce la latencia frente a encadenar modelos.
- **Edición de audio en el navegador**: al ejecutarse con `onnxruntime-web` sobre WebGPU, permite integrar la separación en aplicaciones web sin servidor, procesando fragmentos de ~11 s en el cliente. Adecuado para herramientas de edición de audio ligeras.
- **Transcripción y análisis de letras**: aislar la voz principal mejora la precisión de sistemas de reconocimiento automático de voz (ASR) aplicados a canciones, al eliminar la música de fondo y los coros.
- **Alineación de letras (lyrics alignment)**: la pista de voz principal aislada facilita la alineación temporal de la letra con el audio, útil en plataformas de música y aplicaciones de karaoke sincronizado.
- **Investigación en separación de fuentes**: sirve como referencia de exportación ONNX de un modelo Mel-Band RoFormer con doble máscara, útil para reproducir resultados y comparar con implementaciones PyTorch.
- **Procesamiento por lotes en pipelines de audio**: integrado como primera etapa de un pipeline (separación, luego ASR, luego análisis), con el troceado y solapamiento gestionados en el host.

## Benchmarks y rendimiento

La model card proporciona una validación subjetiva/objetiva contra el modelo PyTorch en fp32 sobre CUDA, midiendo la relación señal-ruido (en dB) de las pistas separadas sobre la ventana más fuerte de 1100 frames de cada canción. Las canciones son todas las pistas con licencia CC BY y CC BY-SA de JamendoLyrics.

| Canción | Género | Ventana | Vocals | Backing | Lead |
|---|---|---|---|---|---|
| Lower Loveday – Is It Right? | Indie | 156,7 s | 63,7 dB | 58,0 dB | 62,8 dB |
| Rxbyn – Bad Side | RNB | 29,5 s | 64,2 dB | 49,9 dB | 64,2 dB |
| Cortez – Feel (Stripped) | Pop | 195,8 s | 66,5 dB | 55,6 dB | 65,8 dB |
| I'M FRESH! YOU'RE PRETTY! – CHRISTMAS AVEC TOI | Pop | 180,4 s | 68,1 dB | 67,2 dB | 45,3 dB |
| NANDOMALO – Esencia | Folk | 63,3 s | 70,2 dB | 55,8 dB | 61,6 dB |
| LOS ROMBOS – Fantasma | Folk | 67,1 s | 66,5 dB | 49,7 dB | 66,4 dB |
| Durch Dick und Duenn – Freifliegen | Rock | 140,8 s | 64,0 dB | 59,7 dB | 64,0 dB |
| Jonny M – Keine Lust | Reggae | 189,4 s | 65,0 dB | 50,9 dB | 63,3 dB |
| FLO – l'abandon | Country | 163,7 s | 67,0 dB | 61,0 dB | 66,9 dB |

No se han publicado resultados de benchmarks estándar (SDR, SI-SDR, MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores anteriores son métricas de reconstrucción frente al modelo PyTorch, no métricas de calidad absoluta de separación.

## Requisitos de hardware

- **VRAM estimada**: el fichero de pesos ocupa 235,4 MB en fp16; el grafo ONNX añade 6,2 MB. La memoria en tiempo de ejecución depende del backend: en WebGPU el búfer de almacenamiento y las activaciones intermedias para una ventana de 1100 frames pueden requerir varios cientos de MB, aunque no se dispone de una cifra exacta publicada.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (integrada o dedicada). Para el proveedor de ejecución CUDA de ONNX Runtime, se ha validado en GPU de escritorio; no se especifica el modelo concreto.
- **¿Cabe en GPU de consumo?**: sí, por el tamaño reducido de los pesos (235 MB en fp16). Es apto para GPUs de consumo y para GPUs integradas con soporte WebGPU.
- **Opciones de despliegue**: `onnxruntime-web` con WebGPU (el runtime previsto por el autor); también es posible usar ONNX Runtime nativo (CPU o CUDA) dado que el grafo es ONNX estándar sin importaciones `com.microsoft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. La model card indica que se ha medido únicamente en una GPU de escritorio y que los teléfonos aún no se han evaluado.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto/ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Acapellas/mel-band-roformer-duality-kara2-student-onnx (este) | Separación en 3 pistas (instrumental, lead, backing) | no disponible (235 MB fp16) | T = 1100 frames (~11 s) | Apache-2.0 | ONNX (fp16) | Hugging Face |
| musetric/mel-band-roformer-duality-kara2-student | Separación en 3 pistas | no disponible | no disponible | Apache-2.0 (según modelo base) | PyTorch | Hugging Face |
| musetric/mel-band-roformer-duality-student-onnx | Separación de voces (2 pistas) | no disponible | misma arquitectura de núcleo | Apache-2.0 | ONNX | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de separación (Demucs, Spleeter, MDX-Net) en la información proporcionada. La comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- **Uso autónomo no válido**: el grafo no incluye STFT, iSTFT, troceado ni empaquetado complejo; requiere un host que calcule `stft_repr`, aplique las máscaras por bin y ejecute la iSTFT. Sin ese host, el modelo no produce audio directamente.
- **Ventana estática**: T = 1100 frames (~11 s). Canciones más largas deben procesarse por trozos con solapamiento, lo que puede introducir artefactos en las transiciones si no se gestiona adecuadamente.
- **Solo inferencia**: no es un modelo entrenable; los pesos PyTorch están en el repositorio base.
- **Validación limitada**: medida solo en GPU de escritorio; no hay datos de rendimiento en teléfonos ni en otros backends.
- **Sesgos y alucinaciones**: no se dispone de información sobre sesgos conocidos. Como modelo de separación, el riesgo de "alucinación" se traduce en artefactos o filtración de fuentes (por ejemplo, bleed de la instrumental en la voz), no en contenido inventado.
- **Idiomas**: no aplica; el modelo es independiente del idioma, aunque la calidad puede variar según el género musical y la mezcla.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las obras de audio procesadas (derechos de autor de las canciones).
- **Caveat de producción**: el rendimiento en WebGPU depende del navegador y del dispositivo; la caché de búferes de almacenamiento (`storageBufferCacheMode: 'simple'`) puede afectar al consumo de memoria.

## Enlaces

- [Hugging Face: Acapellas/mel-band-roformer-duality-kara2-student-onnx](https://huggingface.co/Acapellas/mel-band-roformer-duality-kara2-student-onnx)
- [Modelo base: musetric/mel-band-roformer-duality-kara2-student](https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student)
- [Núcleo de voces: musetric/mel-band-roformer-duality-student-onnx](https://huggingface.co/musetric/mel-band-roformer-duality-student-onnx)
- [Repositorio musetric (runtime packages/ai)](https://github.com/musetric/musetric)
- [Paper Mel-Band RoFormer (arXiv:2310.01809)](https://arxiv.org/abs/2310.01809)
- [JamendoLyrics (dataset de validación)](https://github.com/f90/jamendolyrics)
