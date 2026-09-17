# og455/SPRING_Marathi_Streaming_Zipformer2_INT8

## Resumen

El modelo `og455/SPRING_Marathi_Streaming_Zipformer2_INT8` es un sistema de reconocimiento automatico del habla (ASR) en tiempo real para el idioma marati, publicado en HuggingFace por el usuario `og455` a partir del trabajo del SPRING Lab. Se trata de un transductor (transducer) Zipformer2 en su variante streaming, procedente del ecosistema k2-fsa / Icefall, convertido a ONNX y cuantizado a INT8 para su ejecucion en el runtime sherpa-onnx. El repositorio ocupa 0,1 GB y contiene unicamente los artefactos de inferencia, no el codigo de entrenamiento.

Su relevancia radica en el escenario objetivo: reconocimiento de voz offline, sin nube y de baja latencia sobre hardware movil de gama de entrada. El autor documenta un pipeline de validacion completo sobre un Xiaomi Redmi 9 Power (Qualcomm Snapdragon 662, ARM64-v8a, 4 GB de RAM, Android 12) con sherpa-onnx 1.13.7, incluyendo conversion desde TorchScript, cuantizacion, pruebas de latencia determinista con WAV, evaluacion acustica over-the-air con altavoz y microfono, y una sesion continua de 10 minutos en un unico `OnlineStream`. El modelo trabaja a 16 kHz, con ventana de decodificacion de 32 tramas (100 ms) y contexto izquierdo de 128 tramas (400 ms).

Conviene subrayar que el propio autor lo describe como un prototipo de investigacion experimental y advierte de que el informe no reclama disponibilidad universal en produccion. La model card no declara licencia ni idiomas en los metadatos, el pipeline no esta definido y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor (RNN-T) Streaming Zipformer2, ecosistema k2-fsa / Icefall, con 6 stacks |
| Parametros totales | no disponible |
| Longitud de contexto | 128 tramas de contexto izquierdo (400 ms); ventana de decodificacion de 32 tramas (100 ms por paso) |
| Tipos de cuantizacion | INT8 dinamico (`QuantType.QInt8`) aplicado a los operadores `MatMul` y `Gather`; existe un checkpoint original en float32 previo |
| Idiomas soportados | marati (vocabulario en escritura devanagari); los metadatos de HuggingFace no declaran idioma |
| Licencia | no disponible |
| Formato de pesos | ONNX INT8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`); el original se distribuyo como TorchScript (`jit_script_chunk_32_left_128.pt`) |
| Tamano en disco | 72.026.358 bytes (68,69 MB) en total |
| Tamano del vocabulario | 1203 tokens (devanagari, subpalabras y tokens especiales `<blk>=0`, `<sos/eos>=1`, `<unk>=2`) |
| Tamano de contexto del decodificador | 2 tokens (`context_size=2`, `blank_id=0`) |
| Metodo de decodificacion | busqueda voraz (greedy) de transductor con `max_active_paths=4` |
| Frecuencia de muestreo | 16.000 Hz, PCM mono de 16 bits |
| Extraccion de caracteristicas | 80 filtros log-mel (`sample_rate=16000`, `feature_dim=80`) |
| Hilos de CPU objetivo | 4 (`num_threads=4`) |
| Compatibilidad de runtime | sherpa-onnx >= 1.10 (verificado en 1.13.7) |
| Hardware de referencia | ARM64-v8a, Qualcomm Snapdragon 662; Android 12 (API 31/32); Xiaomi Redmi 9 Power con 4 GB LPDDR4x |

## Arquitectura y entrenamiento

La arquitectura subyacente es el Streaming Zipformer2 Transducer de k2-fsa / Icefall, reconstruido de forma exacta desde un checkpoint TorchScript monotlito. La reconstruccion emplea modulos de PyTorch que replican la especificacion streaming: un encoder con 6 stacks, factores de submuestreo `(1, 2, 4, 8, 4, 2)`, numero de capas `(2, 2, 3, 4, 3, 2)`, dimensiones de encoder `(192, 256, 384, 512, 384, 256)` y dimensiones no enmascaradas `(192, 192, 256, 256, 256, 192)`, con convoluciones depthwise de tipo causal. La validacion incluyo la comprobacion de compatibilidad del state-dict y de equivalencia numerica frente al modelo float32 original antes de cuantizar. El modelo se divide en los tres componentes clasicos del transductor: encoder, predictor/decoder sin estado y red conjunta (joiner).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de tokens vistos ni sobre si se aplicaron tecnicas de alineamiento por preferencias (RLHF o DPO). Tampoco se documentan innovaciones adicionales de decodificacion mas alla de la propia arquitectura Zipformer2 y de la cuantizacion dinamica INT8. Si se detalla el proceso de conversion: al no poder sherpa-onnx ingerir directamente el TorchScript monotlito, se reconstruyo la arquitectura modulo a modulo, se verifico la equivalencia numerica y despues se aplico cuantizacion dinamica sobre `MatMul` y `Gather`, lo que reduce el encoder a unos 70,5 MB.

## Capacidades

- Reconocimiento de voz en streaming para marati, con decodificacion incremental en trozos de 100 ms.
- Ejecucion completamente offline, sin dependencia de servicios en la nube ni de conectividad de red.
- Inferencia en tiempo real sobre CPU ARM64 de gama de entrada, con 4 hilos de trabajo.
- Mantenimiento de estado conversacional acustico en una sesion persistente `OnlineStream`, validado con 10 minutos de streaming continuo.
- Salida en escritura devanagari mediante un vocabulario de 1203 tokens con unidades subpalabra.
- Compatibilidad con el ecosistema sherpa-onnx, lo que permite integracion en aplicaciones Android, iOS, C++, Python, C# y otros bindings del runtime.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de idioma, puntuacion automatica, tool calling ni razonamiento multi-paso. Se trata exclusivamente de un modelo acustico de transcripcion.

## Casos de uso

- Transcripcion offline en aplicaciones Android de gama baja: el modelo esta validado en un Snapdragon 662 con 4 GB de RAM, de modo que puede iterarse directamente en moviles economicos sin depender de servidores.
- Notas de voz y dictado sin conexion: con 68,69 MB de artefactos y decodificacion en trozos de 100 ms, la transcripcion puede ejecutarse de forma local mientras el usuario graba, evitando enviar audio a terceros.
- Asistentes de voz embebidos en marati: la decodificacion en streaming con contexto izquierdo de 400 ms permite alimentar una logica de comandos o dialogos sencillos con latencia de chunk reducida.
- Subtitulado en directo de bajo coste: al procesar audio en ventanas de 100 ms dentro de una unica sesion persistente, es adecuado para generar subtitulos incrementales en emisiones o reuniones sin infraestructura cloud.
- Digitalizacion de archivos de audio historicos en marati: el modelo admite alimentacion de WAV de forma determinista, lo que facilita el procesado por lotes de grabaciones en un equipo x86_64.
- Investigacion en ASR de bajos recursos: sirve como referencia reproducible para estudiar cuantizacion INT8, reconstruccion desde TorchScript y comportamiento de Zipformer2 en dispositivos limitados.
- Validacion de pipelines de voz en CI: dado que el autor publica hashes SHA-256 de cada artefacto, es posible verificar la integridad de los ficheros en un flujo de integracion continua antes de desplegar.
- Kioscos o terminales de atencion al publico con conectividad limitada o requisitos de privacidad estrictos, donde el audio no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe seis fases de validacion (equivalencia del modelo convertido, validacion en PC con x86_64, reserva estatica de memoria en Android, inferencia y latencia activas en Android, precision acustica over-the-air sobre un corpus de 10 frases y estabilidad en streaming continuo de 10 minutos), pero el extracto disponible no incluye las cifras de WER, RTF, latencia de primer token ni huella de memoria. Los ficheros de resultados citados (`marathi_test1_baseline.json` a `marathi_test6_results.json`) no estan accesibles en la informacion proporcionada.

| Metrica | Resultado |
|---|---|
| WER over-the-air (corpus de 10 frases) | no disponible |
| RTF en Snapdragon 662 | no disponible |
| Latencia de primer token | no disponible |
| Huella de memoria estatica en Android | no disponible |
| Estabilidad en streaming continuo de 10 min | prueba ejecutada; resultado numerico no disponible |
| Comparacion con modelos similares | no disponible |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU y no se documenta ejecucion en GPU.
- Huella en disco: 68,69 MB para los tres grafos ONNX mas el vocabulario (`encoder.int8.onnx` 70.486.974 bytes, `decoder.int8.onnx` 899.171 bytes, `joiner.int8.onnx` 620.698 bytes, `tokens.txt` 19.515 bytes).
- RAM: el informe menciona la evaluacion de la huella estatica y del mapeo de memoria de los recursos (`mmap`), pero no se proporcionan cifras concretas de consumo en memoria.
- CPU movil: ARM64-v8a con 4 hilos, verificado en Qualcomm Snapdragon 662 (Xiaomi Redmi 9 Power) con Android 12 (API 31/32).
- CPU de escritorio: validado en x86_64 con sherpa-onnx y ONNX Runtime durante la fase de conversion y equivalencia.
- GPU dedicadas: no requeridas ni documentadas. No se dispone de datos de despliegue con A100, H100 ni RTX 4090, y no tiene sentido plantearlo para un modelo de 68,69 MB orientado a edge.
- Opciones de despliegue: sherpa-onnx (libreria nativa compartida ARM64-v8a, bindings C++/Android/Python), ONNX Runtime con los tres grafos INT8 y el `tokens.txt`.
- Latencia y throughput: la configuracion fija pasos de decodificacion de 100 ms de audio (32 tramas) con 128 tramas de contexto izquierdo, lo que establece el grano minimo de latencia del sistema; las cifras medidas de RTF y latencia de primer token no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La tabla siguiente recoge una orientacion cualitativa por categoria de modelo; las celdas sin dato verificado se marcan como no disponible y no deben interpretarse como resultados medidos.

| Modelo | Tipo | Idiomas | Contexto / streaming | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| SPRING_Marathi_Streaming_Zipformer2_INT8 (este modelo) | Transductor Zipformer2 streaming | marati | streaming, chunk de 32 tramas (100 ms), contexto izquierdo de 400 ms | INT8 dinamico sobre ONNX | no disponible |
| Vosk (Kaldi) | ASR offline basado en Kaldi | varios, segun modelo | streaming por chunks | modelos reducidos en muchos casos | Apache 2.0 en el toolkit (no verificado para modelos concretos) |
| OpenAI Whisper | Transformer encoder-decoder | multilingue | no nativo para streaming en tiempo real | disponible en versiones cuantizadas por la comunidad | MIT en el modelo original |
| NVIDIA NeMo / Conformer-Transducer | Transductor Conformer | segun modelo | streaming segun configuracion | soporta INT8 | depende del modelo y del checkpoint |

Las cifras de parametros, contexto, WER y latencia de estos modelos alternativos no se han verificado aqui y se marcan como no disponibles.

## Limitaciones y advertencias

- El autor califica explicitamente el modelo como prototipo de investigacion experimental y no reclama disponibilidad universal en produccion.
- Los WER reportados corresponden a corpus y condiciones acusticas concretos; no deben extrapolarse a todos los acentos, dialectos o entornos de ruido.
- No se declara licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial queda sin cobertura legal clara y requiere contacto con el autor.
- Los metadatos no declaran idioma ni pipeline; el idioma se infiere del contenido de la model card (marati, escritura devanagari).
- No se documentan datos de entrenamiento, composicion del corpus ni procesos de alineamiento, lo que impide evaluar sesgos o cobertura dialectal.
- Riesgo de alucinacion y de sustituciones propias de modelos acusticos pequenos y cuantizados, especialmente con audio ruidoso o fuera de dominio.
- La cuantizacion dinamica INT8 sobre `MatMul` y `Gather` puede degradar ligeramente la precision frente al modelo float32 original; el informe solo verifica equivalencia numerica antes de cuantizar, no despues.
- La ventana de contexto izquierdo de 400 ms limita la informacion historica disponible; no hay contexto largo en el sentido de los modelos de lenguaje.
- Rendimiento dependiente del dispositivo: las mediciones se realizaron en un Snapdragon 662 con 4 GB de RAM y Android 12; otros SoC o versiones de Android pueden comportarse de forma distinta.
- La estabilidad solo se valido en una sesion continua de 10 minutos; no hay datos de sesiones mas largas ni de reconexion de streams.
- Sin soporte de puntuacion, mayusculas, marcas de hablante ni traduccion.

## Enlaces

- HuggingFace: https://huggingface.co/og455/SPRING_Marathi_Streaming_Zipformer2_INT8
- Identificador del informe citado en la model card: `ITANTRA-STT-MARATHI-CONSOLIDATED-01` (18 de septiembre de 2026); no se proporciona URL.
- Ficheros de resultados citados por el autor: `marathi_test1_baseline.json`, `marathi_test2_model_loading.json`, `marathi_test3_results.json`, `marathi_test4_deterministic_latency.json`, `marathi_test5_results.json`, `marathi_test6_results.json`; no se proporcionan URLs ni estan incluidos en el repositorio segun la informacion disponible.
- Proyectos referenciados por el autor (k2-fsa / Icefall, sherpa-onnx, SPRING Lab): no se han proporcionado enlaces en la informacion disponible.
- Los resultados de busqueda web obtenidos no contienen informacion relevante sobre este modelo y no se han utilizado como fuente.
