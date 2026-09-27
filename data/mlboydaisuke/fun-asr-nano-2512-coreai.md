# mlboydaisuke/Fun-ASR-Nano-2512-CoreAI

## Resumen

Fun-ASR-Nano-2512-CoreAI es la conversion a Apple Core AI del modelo de reconocimiento automatico del habla Fun-ASR-Nano-2512, desarrollado originalmente por Tongyi Lab (Alibaba) bajo licencia Apache-2.0. La conversion la publica el usuario mlboydaisuke y empaqueta el modelo en bundles `.aimodel` que se ejecutan en la GPU o el Neural Engine de dispositivos Apple mediante Core AI, el runtime de ML on-device de iOS 27 y macOS 27 que sustituye a Core ML. El repositorio ocupa 1,3 GB y contiene un encoder de 450 MB y un decoder de 759 MB.

Tecnicamente es un sistema encoder-decoder: un encoder SenseVoice SAN-M de 50 + 20 capas con memoria FSMN y un adaptador de dos bloques que produce las filas de `audio_embeds`, acoplado a un decoder Qwen3-0.6B afinado con lineales en int8 y cabeza fp16 con pesos compartidos. El modelo base declara 985M de parametros. Transcribe chino (con dialectos, acentos y cantonés), ingles y japones, con puntuacion y normalizacion de texto inversa integradas, y admite una lista de hotwords opcional en el prompt.

Su relevancia practica esta en el rendimiento medido: sobre 155 clips de prueba, el 150 coincide exactamente con el oraculo fp32 y los 5 restantes solo divergen en empates tecnicos. En un M4 Max la RTF mediana es 0,022 y en un iPhone 18 Pro es 0,075, con un pico de memoria de 385-411 MB y sin necesidad de compilacion AOT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder SenseVoice SAN-M (50 + 20 capas, memoria FSMN) + adaptador de 2 bloques; decoder Qwen3-0.6B afinado |
| Parametros totales | 985M (modelo base Fun-ASR-Nano-2512) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | ventana de audio de 30 s por llamada (500 tramas LFR dan 63 filas de audio); decodificacion greedy de hasta 512 tokens |
| Tipos de cuantizacion | decoder con lineales int8 y cabeza fp16 de pesos compartidos; encoder con pesos fp16 y computo en fp32 |
| Idiomas soportados | chino (incluye dialectos, acentos y cantonés), ingles y japones |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI). El modelo base tambien circula en GGUF, ONNX, MLX y PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo base lo entrena Tongyi Lab; esta ficha no dispone de informacion sobre el volumen de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que si se documenta es la topologia: el encoder SenseVoice SAN-M apila 50 + 20 capas con memoria FSMN y alimenta un adaptador de dos bloques que genera las filas de `audio_embeds`; el decoder es un Qwen3-0.6B afinado que consume esas filas como entrada estatica y genera texto de forma autorregresiva.

La conversion a Core AI introduce varias decisiones tecnicas concretas. El encoder almacena pesos en float16 pero calcula en float32, y sus entradas `feats` / `mask` y su salida `audio_embeds` son float32. El grafo del decoder ejecuta el flujo residual a 1/4 con el `rmsnorm_eps_residual` correspondiente, una transformacion exacta que mantiene la activacion de 125k del Qwen3 afinado en la posicion 0 dentro del rango de float16. Ambos bundles son `.aimodel` JIT: macOS y iPhone los especializan en la primera carga, de modo que un unico arbol sirve para ambas plataformas.

El contrato de host es explicito: audio WAV de 16 kHz mono, fbank kaldi de 80 dimensiones (ventana Hamming de 25 ms, salto de 10 ms, pre-enfasis 0,97, eliminacion de DC, factor x32768, suelo logaritmico FLT_EPSILON, dither 0), seguido de LFR 7/6 para dar `feats[L,560]` con relleno de ceros hasta `[1,500,560]` mas una mascara. La llamada al decoder se compone de 18 ids de prefijo de sistema y usuario, N ids de valor 151936 mas el slot, y 5 ids de sufijo de asistente.

## Capacidades

- Transcripcion de voz a texto en chino (incluidos dialectos, acentos y cantonés), ingles y japones.
- Puntuacion automatica y normalizacion de texto inversa (ITN) integradas en la salida.
- Lista de hotwords opcional en el prompt para sesgar el reconocimiento hacia vocabulario concreto (por ejemplo, nombres propios o terminos de dominio).
- Seleccion explicita de idioma mediante prompt ("语音转写成中文/英文/日文：") y modo sin ITN ("语音转写，不进行文本规整：").
- Procesamiento por ventanas de 30 s: los clips mas largos se trocean en el host.
- No se documentan capacidades de diarizacion, traduccion, vision ni tool calling.
- No se documentan capacidades de agente ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones y notas de voz en el dispositivo: el modelo procesa ventanas de 30 s con hotwords para nombres de participantes o jerga interna, y con un pico de 385-411 MB cabe holgadamente en un iPhone o un Mac sin enviar audio a la nube.
- Subtitulado de video en chino, ingles o japones: la puntuacion y la ITN vienen integradas, de modo que la salida es directamente utilizable como subtitulo sin postprocesado adicional.
- Asistentes de voz embebidos en aplicaciones iOS/macOS: la RTF mediana de 0,022 en M4 Max y 0,075 en iPhone 18 Pro permite transcripcion practicamente en tiempo real dentro de la propia app.
- Dictado en aplicaciones de productividad: la ventana de 30 s por llamada y el limite de 512 tokens de decodificacion encajan con dictados cortos por fragmentos, con el troceado gestionado por el host.
- Transcripcion de contenido en cantonés o con acentos del chino: el encoder SAN-M esta entrenado especificamente para dialectos y acentos, algo que no cubren muchos ASR multilingues genericos.
- Sesgo de vocabulario en dominios tecnicos: el prompt de hotwords permite inyectar listas de terminos (farmacos, referencias legales, componentes) para reducir errores en transcripciones especializadas.
- Procesamiento por lotes en un Mac como servidor local: con 0,55 s de carga posterior a la primera y sin compilacion AOT, se puede levantar un servicio de transcripcion domestico o de pequeno equipo sobre CoreAIKit.

## Benchmarks y rendimiento

Los datos proceden de las mediciones del autor de la conversion (septiembre de 2026, macOS 27, M4 Max GPU). Las fixtures son los 5 MP3 de ejemplo del repositorio upstream mas FLEURS test en `en_us`, `cmn_hans_cn` y `ja_jp`, 50 utterances por idioma bajo una unica normalizacion. El oraculo es `funasr` 1.4.16 en fp32, con dither 0 y decodificacion greedy.

| Metrica | Resultado |
|---|---|
| Concordancia exacta de tokens con el oraculo fp32 (155 clips) | 150/155 exactos; los 5 restantes divergen solo donde el top-2 del oraculo tiene un margen de 0,007-0,033; 0 divergencias por encima del umbral de 0,1 |
| WER ingles (port vs oraculo) | 0,34 % |
| CER chino (port vs oraculo) | 0,00 % |
| CER japones (port vs oraculo) | 0,07 % |
| WER ingles vs referencia FLEURS (oraculo → port) | 5,08 % → 5,34 % |
| CER chino vs referencia FLEURS (oraculo → port) | 6,86 % → 6,86 % |
| CER japones vs referencia FLEURS (oraculo → port) | 6,95 % → 6,92 % |
| Similitud coseno del grafo del encoder vs oraculo (por fila, 155 clips) | media 0,99999988; minimo 0,9999982 |
| Swift host (CoreAIKit) vs motor Python | ids identicos en 155/155 |

| Velocidad (CoreAIKit, Release, medianas sobre 155 clips) | Encoder / prefill / decode | RTF mediana / p90 | Primera carga → cargas posteriores |
|---|---|---|---|
| M4 Max, GPU, macOS 27 (26A428) | 40 ms / 123 ms / 2,78 ms por token | 0,022 / 0,028 | 3,6 s → 0,55 s |
| iPhone 18 Pro, GPU, iOS 27 (24A437), JIT en dispositivo | 146 ms / 393 ms / 8,2 ms por token | 0,075 / 0,094 | 5,1 s → 0,9 s |

En el telefono, un clip de 13,6 s tarda 0,91 s en estado termico nominal. Dos minutos de clips consecutivos elevan el estado termico a *fair* y el encoder a 225 ms. El pico de huella de memoria es de 385-411 MB. No se necesita compilacion AOT.

## Requisitos de hardware

- Huella de memoria en ejecucion: 385-411 MB de pico, segun medicion en iPhone 18 Pro.
- Espacio en disco: 1,3 GB de repositorio; encoder 450 MB y decoder 759 MB.
- GPU recomendadas: exclusivamente hardware Apple. Las mediciones publicadas corresponden a M4 Max (GPU) e iPhone 18 Pro (GPU). El runtime puede usar GPU o Neural Engine.
- No es desplegable en GPU de NVIDIA, AMD ni en CPU x86 a traves de Core AI: el runtime es propio de iOS 27 / macOS 27.
- Si cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y en iPhone compatible con iOS 27; el modelo esta disenado explicitamente para on-device.
- Opciones de despliegue: Core AI con la libreria Swift CoreAIKit (`KitFunASRModel`), que descarga el repositorio y expone `transcribe(samples:)` y `transcribe(samples:hotwords:)`. Para otras plataformas existen conversiones alternativas del mismo modelo base: MLX (`mlx-community/Fun-ASR-Nano-2512-*`), ONNX / sherpa-onnx (`csukuangfj/*funasr-nano*`) y GGUF con el runtime llama.cpp de FunASR (`FunAudioLLM/Fun-ASR-Nano-GGUF`).
- Latencia y throughput: RTF mediana 0,022 en M4 Max y 0,075 en iPhone 18 Pro; 2,78 ms por token de decodificacion en M4 Max y 8,2 ms en iPhone 18 Pro. La primera carga de los bundles JIT tarda 3,6 s en Mac y 5,1 s en telefono, bajando a 0,55 s y 0,9 s en cargas posteriores.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la informacion proporcionada, por lo que la comparativa se limita a las variantes de runtime del mismo modelo base y a los datos verificables de cada una.

| Modelo / distribucion | Parametros | Contexto | Formato | Plataforma | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|---|
| Fun-ASR-Nano-2512-CoreAI (esta ficha) | 985M | ventana de 30 s por llamada | `.aimodel` | Apple Silicon e iPhone (Core AI) | Apache-2.0 | RTF 0,022 (M4 Max GPU), 0,075 (iPhone 18 Pro) |
| Fun-ASR-Nano-2512 (original, fp32) | 985M | ventana de 30 s por llamada | PyTorch (`model.pt`) | CPU/GPU generica via `funasr` | Apache-2.0 | actua como oraculo de referencia en las mediciones anteriores |
| Fun-ASR-Nano-2512 en MLX | 985M | ventana de 30 s por llamada | MLX | Apple Silicon | Apache-2.0 | no disponible |
| Fun-ASR-Nano-2512 en ONNX / sherpa-onnx | 985M | ventana de 30 s por llamada | ONNX | multiplataforma | Apache-2.0 | no disponible |
| Fun-ASR-Nano-2512 en GGUF | 985M | ventana de 30 s por llamada | GGUF | multiplataforma (llama.cpp) | Apache-2.0 | no disponible |

Comparacion con ASR de proposito general de otros fabricantes (por ejemplo la familia Whisper): no disponible. La informacion proporcionada no incluye resultados de benchmarks de esos modelos bajo la misma normalizacion ni el mismo conjunto de prueba.

## Limitaciones y advertencias

- La conversion no anade capacidades propias: hereda del modelo base todas sus limitaciones de reconocimiento.
- Cobertura linguistica limitada a chino (con dialectos, acentos y cantonés), ingles y japones. No se documenta soporte de castellano.
- Procesa una ventana de audio de 30 s por llamada; los clips mas largos requieren troceado en el host, lo que puede degradar la coherencia en los limites entre ventanas.
- La decodificacion es greedy con un maximo de 512 tokens, sin busqueda en haz ni estrategias de rescoring.
- La comparacion contra FLEURS (WER 5,34 % en ingles, CER 6,86 % en chino, 6,92 % en japones) corresponde a mediciones propias del autor de la conversion bajo una unica normalizacion, no a la tabla de benchmarks oficial del publicador.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de hablantes o vocabulario muy especializado; no se documentan mecanismos de deteccion de silencio o de no-habla mas alla de la gestion del token `/sil`.
- Degradacion termica en dispositivo movil: en iPhone 18 Pro, dos minutos de clips consecutivos elevan el estado termico y el encoder pasa de 146 ms a 225 ms.
- Exclusividad de plataforma: el formato `.aimodel` y el runtime Core AI solo funcionan en iOS 27 / macOS 27, lo que ata el despliegue al ecosistema Apple. Para otras plataformas hay que recurrir a las conversiones MLX, ONNX o GGUF del mismo modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el mismo dia (27 de septiembre de 2026); es una publicacion reciente sin validacion independiente.
- Licencia Apache-2.0, que permite uso comercial, pero el aviso NOTICE debe conservarse por los requisitos de atribucion. El texto de licencia incluido es el que distribuye el paquete oficial de vLLM `FunAudioLLM/Fun-ASR-Nano-2512-vllm`, cuyos pesos son identicos bit a bit al `model.pt` oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Fun-ASR-Nano-2512-CoreAI
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Codigo de conversion, oraculo, fixtures y gates: https://github.com/john-rocky/coreai-model-zoo/tree/main/conversion/funasr_nano
- Ficha del modelo con las lecciones aprendidas: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/funasr-nano/README.md
- Benchmark de LLM en Apple Silicon usado como referencia de Core AI: https://github.com/john-rocky/apple-silicon-llm-bench
- Variante GGUF y runtime llama.cpp de FunASR: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-GGUF
- Paquete oficial de vLLM: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-vllm
