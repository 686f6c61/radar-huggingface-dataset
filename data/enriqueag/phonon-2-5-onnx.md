# enriqueag/phonon-2.5-onnx

## Resumen

Phonon-2.5 ONNX es la exportación a formato ONNX del modelo de reconocimiento automático del habla Phonon-2.5, desarrollado por Fermion Research a partir de NVIDIA Parakeet TDT 0.6B v3. La conversión la firma el usuario enriqueag y su objetivo es permitir la inferencia tanto en servidor con ONNX Runtime como directamente en el navegador mediante onnxruntime-web y WebGPU. El modelo resuelve el problema de la transcripción multilingüe con detección automática de idioma, puntuación, mayúsculas y numerales, sin necesidad de indicar previamente la lengua del audio.

La arquitectura subyacente es un encoder FastConformer acoplado a una red de predicción LSTM de dos capas y una red joint, con decodificación TDT (Token-and-Duration Transducer). El modelo base tiene aproximadamente 600 millones de parámetros y cubre 25 idiomas europeos. Esta exportación comprime el encoder a 2 bits mediante dos planos ternarios empaquetados en un único `MatMulNBits` por capa, lo que reduce el peso del encoder a unos 363 MB y hace viable su ejecución en el navegador.

La relevancia de esta ficha radica en que demuestra un caso práctico de cuantización agresiva (2 bits) sin pérdida de calidad en la salida: según el autor, las transcripciones son idénticas a la referencia en fp32 sobre el conjunto de 16 clips de prueba, y la salida del encoder a 2 bits difiere como máximo 2e-5 respecto a fp32 en WebGPU. Es, por tanto, un ejemplo útil para quienes necesitan ASR local, de baja latencia y sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + LSTM de 2 capas (prediction network) + joint network; decodificacion TDT |
| Parametros totales | aproximadamente 600 M (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; se recomienda cortar audio de mas de 30 s en pausas |
| Tipos de cuantizacion | encoder a 2 bits (dos planos ternarios, block size 128); decoder/joint a int8 con escalas por fila |
| Idiomas soportados | 25: en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 17); `encoder.exact2x2.onnx` y `decoder_joint.int8.onnx` |
| Tamano del repo | 0.4 GB |
| Entrada de audio | 16 kHz mono, pre-enfasis 0.97, STFT de 512 puntos, ventana Hann de 400 muestras, hop 160, 128 bandas mel slaney (0-8 kHz) |
| Vocabulario | 8.192 piezas SentencePiece; blank = id 8192 |
| Libreria | onnx, onnxruntime, onnxruntime-web (WebGPU) |

## Arquitectura y entrenamiento

El modelo base Phonon-2.5 deriva de NVIDIA Parakeet TDT 0.6B v3, un sistema de reconocimiento del habla de tipo transducer. El encoder es un FastConformer, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias largas. Sobre él se sitúa una red de predicción formada por una LSTM de dos capas y una red joint que combina la representación acústica con el estado del decodificador. La decodificación es TDT (Token-and-Duration Transducer), que predice conjuntamente el token y su duración en frames (0 a 4), lo que acelera la generación y evita repeticiones.

El proceso de exportación documentado por el autor es el siguiente: primero se expanden los tensores de cinco valores, int6 y fp16 del contenedor `model.fermion` a fp32, cargándolos en un `ParakeetForTDT` estándar de `transformers` con `strict=True`; después se trazan a ONNX (opset 17) el encoder con su proyección y las redes de predicción y joint, expresando las convoluciones puntuales como multiplicaciones matriciales. Cada fila de cinco valores `{-hi, -lo, 0, lo, hi}` se reescribe como `lo*A + (hi-lo)*B` con dos planos ternarios A y B, concatenados en la dimensión de entrada de un único `MatMulNBits` de 2 bits. Los tensores int6 del decoder pasan a int8 conservando sus escalas originales tras `DequantizeLinear`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El autor indica que el fichero `NOTICE` reproduce el aviso de Fermion, incluida la lista de datos de entrenamiento que este declara, pero esos detalles no se recogen en la información disponible.

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeos, con detección automática del idioma hablado.
- Generación de puntuación, mayúsculas y numerales directamente en la transcripción.
- Decodificación TDT con predicción conjunta de token y duración, lo que reduce inserciones y repeticiones.
- Inferencia en navegador mediante onnxruntime-web 1.31.1 y WebGPU en Chromium.
- Inferencia en servidor o escritorio con onnxruntime-node en CPU.
- Procesamiento de audio en streaming por segmentos: el decoder es autorregresivo paso a paso sobre la salida del encoder.
- Soporte de frases de activación cortas (el autor prueba "Oye Omni") con transcripción correcta.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción en el navegador sin servidor: gracias a la exportación ONNX y a WebGPU, una aplicación web puede transcribir audio del micrófono localmente, sin enviar datos a la nube, usando el encoder de 2 bits y el decoder int8. Es adecuado por privacidad y por la latencia medida de 120-520 ms para clips de 0,6 a 4,6 s en un Apple M4 Max.
- Subtitulado y actas de reuniones: el modelo genera puntuación y mayúsculas, lo que reduce el post-procesado necesario para producir subtítulos legibles. Se trocearía el audio en segmentos de menos de 30 s cortados en pausas.
- Asistentes de voz locales: la detección automática de idioma y el reducido tamaño (0,4 GB de repo) permiten integrar el modelo en aplicaciones de escritorio o móviles con un único binario ONNX.
- Dictado multilingüe en herramientas ofimáticas: al cubrir 25 idiomas y detectar la lengua por sí mismo, el usuario puede alternar idiomas sin configuración previa.
- Anonimización y análisis de llamadas: la transcripción local con ONNX Runtime permite procesar grabaciones de atención al cliente en servidores sin GPU dedicada, aunque con la advertencia de que el kernel de 2 bits no tiene ruta rápida en CPU.
- Prototipado e investigación en ASR: el repositorio incluye scripts de conversión en `export/` y un contrato de front-end documentado en `config.json`, lo que facilita reproducir la exportación y comparar variantes de cuantización (fp32, 4 bits, 2 bits).

## Benchmarks y rendimiento

El autor no publica métricas de WER ni comparaciones con otros modelos. Sí incluye una verificación de equivalencia y tiempos de inferencia medidos:

| Prueba | Resultado |
|---|---|
| Equivalencia de transcripcion (16 clips, es-ES, es-MX, en-US, en-GB) | Texto identico a la referencia `transformers` `ParakeetForTDT` en los 16 casos |
| Diferencia del encoder 2 bits vs fp32 en WebGPU | Maximo 2e-5 |
| Clip de 0,6-0,8 s, WebGPU en Apple M4 Max | 120 ms encoder + 20 ms decoder |
| Clip de 2,8 s, WebGPU en Apple M4 Max | 200-300 ms encoder + 35 ms decoder |
| Clip de 4,2-4,6 s, WebGPU en Apple M4 Max | 480-520 ms encoder + 65 ms decoder |
| CPU, wasm monohilo | aproximadamente 3 s por segundo de audio |

No se han publicado resultados de benchmarks estandar (WER por idioma, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el encoder pesa unos 363 MB y el decoder/joint unos 18 MB; en la práctica el consumo en memoria es inferior a 1 GB, más los buffers de activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chromium para la ruta rápida de 2 bits; el autor mide en un Apple M4 Max. No se especifican modelos NVIDIA concretos.
- GPU consumer: sí cabe en GPUs de gama media y en equipos Apple Silicon; el cuello de botella es el soporte del kernel de 2 bits, no la memoria.
- CPU: funciona con onnxruntime-node, pero el autor advierte que ONNX Runtime no tiene un kernel rápido de 2 bits en CPU y el encoder resulta varias veces más lento que con pesos de 4 bits; en wasm monohilo, unos 3 s por segundo de audio.
- Despliegue: onnxruntime (servidor), onnxruntime-node (escritorio/servidor), onnxruntime-web con WebGPU (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: la tabla anterior muestra latencias subsegundo para clips cortos en WebGPU; en CPU la latencia es sensiblemente mayor.
- Recomendación del autor: cortar audio de más de 30 s en pausas antes de inferir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Phonon-2.5 ONNX (esta ficha) | aprox. 600 M | segmentos de hasta aprox. 30 s | 25 | CC-BY-4.0 | ONNX (2 bits + int8) |
| FermionResearch/Phonon-2.5 | aprox. 600 M | no disponible | 25 | CC-BY-4.0 | contenedor Fermion / transformers |
| nvidia/parakeet-tdt-0.6b-v3 | aprox. 600 M | no disponible | no disponible en la informacion | no disponible en la informacion | NeMo / transformers |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en WER con alternativas como Whisper large-v3 u otros modelos ASR. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No hay métricas de WER publicadas por idioma; la validación se limita a 16 clips sintéticos de 0,6 a 4,6 s, lo que es una muestra muy reducida y no representativa de audio real con ruido, acentos o solapamientos.
- El audio de más de 30 s debe cortarse en pausas; no se documenta un mecanismo de chunking con solapamiento.
- En CPU el encoder de 2 bits es varias veces más lento que con 4 bits; para servidores sin GPU conviene considerar la variante de 4 bits o fp32.
- La ruta rápida de 2 bits depende de WebGPU en Chromium; otros navegadores o configuraciones pueden no ofrecerla.
- El decoder debe cargarse con `session.disable_quant_qdq = 1` para plegar los pesos int8 una sola vez; omitirlo degrada el rendimiento.
- Riesgo de alucinación inherente a los modelos transducer en silencios o ruido; no se documentan mecanismos de mitigación.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Parakeet TDT 0.6B v3 hereda las características de sus datos de entrenamiento, que no se detallan en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA (Parakeet TDT 0.6B v3), Fermion Research (Phonon-2.5) y enriqueag (conversión ONNX); es obligatorio conservar el `NOTICE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enriqueag/phonon-2.5-onnx
- Modelo base Phonon-2.5: https://huggingface.co/FermionResearch/Phonon-2.5
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
