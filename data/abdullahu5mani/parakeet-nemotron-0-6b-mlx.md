# Abdullahu5mani/parakeet-nemotron-0.6b-mlx

## Resumen

Parakeet Nemotron 0.6B (MLX) es un port a Apple Silicon del modelo de reconocimiento automatico del habla (ASR) Parakeet Nemotron 0.6B de NVIDIA, publicado por el usuario Abdullahu5mani. Se trata de un modelo de transcripcion en streaming basado en la arquitectura FastConformer RNN-T, con 628.323.841 parametros (0,6B) segun los tensores safetensors del repositorio, y soporte unicamente para ingles. El repositorio no entrena un modelo nuevo: convierte los pesos originales a safetensors y los ejecuta integramente en la GPU Metal de los chips de Apple mediante MLX.

El problema que resuelve es concreto y esta documentado por el autor: en macOS, el modelo original quedaba atrapado en CPU porque CoreML no compila los operadores tensoriales dinamicos que usa FastConformer, de modo que ONNX Runtime caia a ejecucion en CPU. En un Mac de la serie M, esa ruta tardaba unos 387 ms por fragmento de 560 ms de audio, es decir, cerca del limite de tiempo real y con perdida ocasional de buffers. Este port reduce esa latencia a 121 ms por fragmento, con una mejora de 3,5x en margen de tiempo real.

Su relevancia actual es doble: por un lado demuestra que es viable ejecutar ASR de NVIDIA con arquitectura FastConformer en Metal sin sacrificar precision (paridad bit a bit con la referencia ONNX CPU y el mismo 2,17% de WER en LibriSpeech test-clean); por otro, sirve como backend nativo de Taurscribe, una aplicacion de dictado en tiempo real para macOS y Windows. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y con adopcion practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer RNN-T (encoder FastConformer + predictor LSTM + joint projection) |
| Parametros totales | 628.323.841 (0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; streaming por fragmentos de 560 ms con cache de atencion de 70 frames y cache de convolucion de 8 frames |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (model.safetensors, 1,25 GB) + tokenizer SentencePiece (tokenizer.model, 245 KB) |
| Tamano del repositorio | 1,3 GB |
| Libreria / runtime | mlx (Apple Silicon, Metal) |
| Entrada de audio | PCM mono a 16 kHz, 128 bins mel con normalizacion Slaney |
| Vocabulario | 1.024 tokens SentencePiece |
| Submuestreo | Downsampling convolucional depthwise-separable 8x (7 frames por fragmento) |
| Tarea (pipeline) | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es un RNN-T sobre encoder FastConformer: 24 capas FastConformer con atencion de posicion relativa y convoluciones depthwise, un submuestreo convolucional depthwise-separable de factor 8x y un decodificador compuesto por un predictor LSTM de 2 capas mas una proyeccion conjunta (joint projection). El modelo procesa fragmentos de 560 ms de audio, equivalentes a 8.960 muestras PCM a 16 kHz, que tras el submuestreo se convierten en 7 frames. Para mantener el estado entre fragmentos usa una cache de atencion con 70 frames de lookback y una cache de convolucion con 8 frames de contexto, lo que permite inferencia continua en streaming sin reprocesar el audio completo.

No hay informacion en la documentacion proporcionada sobre el proceso de entrenamiento: no se detallan el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de ajuste con RLHF, DPO o similares. Lo que si se declara es la procedencia: los pesos derivan del checkpoint de NVIDIA Nemotron Speech, liberado bajo CC-BY-4.0, y este repositorio es una conversion de formato y runtime, no un reentrenamiento. La innovacion tecnica aportada por el autor es la portabilidad: pasar los pesos a safetensors y ejecutar la arquitectura completa en Metal con MLX, evitando la ruta CPU de ONNX Runtime en macOS, sin perdida de precision (25 de 25 utterances identicas en LibriSpeech test-clean).

## Capacidades

- Reconocimiento automatico del habla en streaming, con procesamiento por fragmentos de 560 ms y estado persistente entre fragmentos.
- Transcripcion en ingles con salida tokenizada mediante SentencePiece de 1.024 tokens.
- Inferencia en tiempo real sobre GPU Metal de Apple Silicon, con backend MLX.
- Decodificacion RNN-T con predictor LSTM y joint network, integrada en el mismo grafo que el encoder FastConformer.
- Integracion con Taurscribe como backend de dictado en tiempo real para macOS (y Windows en la aplicacion, aunque esta variante de pesos es especifica de MLX/Apple Silicon).
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas ni vision: es exclusivamente un modelo acustico de transcripcion.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- No se documentan modos especiales (thinking, audio understanding mas alla de ASR, diarizacion de hablantes o puntuacion automatica).

## Casos de uso

- Dictado en tiempo real en macOS: Taurscribe detecta el backend MLX y ejecuta la inferencia en la GPU Metal, con 121,62 ms de latencia por fragmento de 560 ms, lo que permite escribir por voz sin esperas perceptibles en aplicaciones de escritorio.
- Subtitulado en directo en local: al procesar audio en streaming y no requerir conectividad, encaja en escenarios donde el audio no puede salir del dispositivo (reuniones internas, consultas medicas, entrevistas con datos personales).
- Transcripcion por lotes de audio largo: con un RTF de 0,2426 medido, una hora de audio se procesaria en torno a 14,5 minutos en el equipo de referencia (Mac Mini Apple Silicon), util para archivar entrevistas o clases grabadas.
- Notas de voz a texto en aplicaciones de productividad: el modelo acepta PCM mono a 16 kHz y emite tokens SentencePiece, por lo que se integra como capa de transcripcion en apps de notas o gestores de tareas en el ecosistema Apple.
- Comandos de voz en asistentes locales: la latencia P99 de 156,79 ms y una desviacion de solo 9,95 ms permiten respuestas estables en interfaces manos libres, aunque el limitado vocabulario de 1.024 tokens obliga a validar la cobertura de dominio.
- Accesibilidad (subtitulado asistido): sirve como motor de transcripcion local en herramientas de apoyo a personas con discapacidad auditiva, al no depender de servicios en la nube y mantener la transcripcion en el equipo del usuario.
- Analisis de conversaciones en ingles: al ser un modelo solo-ingles, es adecuado para pipelines de transcripcion de llamadas o soporte tecnico en ese idioma, con la transcripcion posterior alimentando analitica de texto.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre 25 utterances de LibriSpeech test-clean (181,7 segundos de audio multi-hablante) en un Mac Mini Apple Silicon:

| Metrica | ONNX Runtime (CPU) | MLX nativo (GPU Metal) | Diferencia |
|---|---|---|---|
| Tasa de error de palabra (WER) | 2,17% | 2,17% | Coincidencia exacta |
| Paridad de transcripcion | Referencia | 25 / 25 (100,0%) | Bit a bit |
| Tiempo total de proceso | 128,75 s | 44,07 s | 2,94x mas rapido |
| Factor de tiempo real (RTF) | 0,7087 | 0,2426 | 4,12x mas rapido que tiempo real |
| Tiempo de carga del modelo | 967,73 ms | 70,97 ms | 13,6x mas rapido |
| Latencia por fragmento en caliente (560 ms) | 386,64 ms | 121,62 ms | 3,18x mas rapido |
| Latencia P99 por fragmento | 564,21 ms | 156,79 ms | 3,60x mas rapido |
| Jitter de latencia (desviacion estandar) | 67,44 ms | 9,95 ms | 6,78x mas estable |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni evaluaciones en dominios distintos de LibriSpeech. Tampoco se aportan cifras de otros idiomas ni de audio con ruido, acentos marcados o solapamiento de hablantes.

## Requisitos de hardware

- Pesos: 1,25 GB en model.safetensors (mas 245 KB de tokenizer y aproximadamente 50 MB adicionales hasta el 1,3 GB total del repositorio).
- Precision de almacenamiento: no disponible de forma explicita; el tamano del fichero (1,25 GB para 628 M parametros) es compatible con pesos de 16 bits.
- Memoria unificada necesaria: no disponible como cifra oficial; ademas de los pesos hay que sumar activaciones y las caches de atencion (70 frames) y convolucion (8 frames). En la practica el modelo esta pensado para Macs Apple Silicon, donde comparte memoria unificada con el sistema.
- GPU compatibles: la unica ruta documentada es MLX sobre Apple Silicon (Metal). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con chip de la serie M; el autor cita explicitamente un Mac Mini Apple Silicon como equipo de medida. No hay datos sobre GPUs de consumo discretas (RTX 4090, etc.) porque el runtime publicado es MLX.
- Opciones de despliegue: libreria MLX con carga de safetensors (ejemplo incluido en la model card) y la aplicacion Taurscribe, que selecciona automaticamente el backend MLX en Macs Apple Silicon. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia medida: 121,62 ms por fragmento de 560 ms en caliente y 156,79 ms en P99; carga del modelo en 70,97 ms; RTF de 0,2426.
- Throughput: no disponible mas alla del RTF (equivalente a 4,12x tiempo real en el hardware de prueba).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | Licencia | WER LibriSpeech test-clean | Runtime |
|---|---|---|---|---|---|---|
| Parakeet Nemotron 0.6B MLX (este repositorio) | 628.323.841 | FastConformer RNN-T streaming | en | CC-BY-4.0 | 2,17% | MLX / Metal (Apple Silicon) |
| Parakeet Nemotron 0.6B, implementacion de referencia ONNX | 628.323.841 (mismos pesos) | FastConformer RNN-T streaming | en | CC-BY-4.0 | 2,17% | ONNX Runtime en CPU |
| Alternativas de ASR en streaming (por ejemplo, familias tipo Whisper o Conformer) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparaciones con otros modelos de ASR ni cifras de terceros, por lo que no es posible establecer una comparativa cuantitativa fiable mas alla de la ruta ONNX de referencia del mismo checkpoint. Cualquier comparacion con modelos como Whisper requeriria datos externos que no forman parte de esta ficha.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles. No hay soporte multilingue ni datos sobre su comportamiento en castellano.
- Dominio de vocabulario: 1.024 tokens SentencePiece, un vocabulario reducido que puede afectar a terminos tecnicos, nombres propios o jerga.
- Riesgo de alucinacion: no se documentan evaluaciones especificas de alucinacion en audio ruidoso, silencios largos o habla solapada. Como en cualquier modelo ASR, la transcripcion debe validarse en produccion.
- Sesgos: no se han publicado analisis de sesgo por acento, edad, genero o procedencia del hablante. La unica evaluacion disponible es LibriSpeech test-clean, que no representa condiciones acusticas adversas.
- Cobertura de benchmark muy limitada: 25 utterances y 181,7 segundos de audio en un unico conjunto de test. Los resultados de latencia y WER corresponden a un Mac Mini Apple Silicon concreto y no son necesariamente extrapolables a otros equipos.
- Dependencia de plataforma: los pesos estan pensados para MLX sobre Metal. No se documenta su uso en GPU NVIDIA, GPU AMD, CPU x86 ni despliegues en contenedores convencionales.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero el propio autor indica que los pesos derivan del checkpoint de NVIDIA Nemotron Speech; conviene verificar los terminos de la publicacion original de NVIDIA antes de un uso comercial.
- Adopcion y mantenimiento: 0 descargas y 0 likes en el momento de la consulta, con una unica publicacion reciente. No hay garantias de soporte, actualizaciones ni correccion de errores por parte del autor.
- Precision de pesos y cuantizaciones: no se documentan tipos de cuantizacion (GGUF, AWQ, GPTQ, etc.), lo que limita las opciones de optimizacion de memoria en otros entornos.
- Integracion con LLM: al ser exclusivamente ASR, cualquier flujo que requiera razonamiento, resumen o tool calling necesita un modelo de lenguaje adicional en el pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Abdullahu5mani/parakeet-nemotron-0.6b-mlx
- Aplicacion Taurscribe (dictado en tiempo real, repositorio del autor): https://github.com/Abdullahu5mani/Taurscribe
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Resultados de la busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre este modelo, su paper o su repositorio; los resultados obtenidos correspondian a contenido sin relacion con el modelo.
