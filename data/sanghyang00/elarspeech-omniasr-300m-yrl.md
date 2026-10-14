# Sanghyang00/ELARSpeech-OmniASR-300M-yrl

## Resumen

ELARSpeech-OmniASR-300M-yrl es un modelo de reconocimiento automatico del habla (ASR) especializado en nheengatu (codigo ISO 639-3 `yrl`), una lengua indigena de la familia tupi hablada en la cuenca amazonica. Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech y se distribuye como un fine-tuning del checkpoint `aadel4/omniASR-CTC-300M-v2`. La arquitectura es `Wav2Vec2ForCTC`, con 325.984.945 parametros reales (aproximadamente 326 millones) y pesos en formato safetensors.

El modelo resuelve una tarea muy concreta: transcribir audio mono a 16 kHz en nheengatu, un idioma con recursos digitales escasos y practicamente ausente de los sistemas ASR comerciales. Su relevancia radica en ese nicho: cubre una lengua de bajos recursos mediante adaptacion de un modelo base de 300M, un tamano que cabe holgadamente en GPU de consumo e incluso en CPU.

Se trata de un modelo unicamente de reconocimiento (no genera texto libre ni conversa) y no se ha publicado informacion sobre benchmarks, licencia ni composicion del conjunto de entrenamiento. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (extractor convolucional de caracteristicas + encoder transformer + cabeza CTC) |
| Parametros totales | 325.984.945 (datos reales de safetensors) |
| Longitud de contexto | no disponible (modelo ASR, opera sobre fotogramas de audio, no sobre contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; tamano del repo: 1,3 GB) |
| Idiomas soportados | yrl (nheengatu) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | aadel4/omniASR-CTC-300M-v2 |
| Entrada de audio | mono, 16 kHz |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Wav2Vec2 para clasificacion CTC: una pila de capas convolucionales que extrae representaciones de la senal de audio, seguida de un encoder transformer y una cabeza de clasificacion que emite probabilidades por fotograma sobre el vocabulario de caracteres (o subunidades) del nheengatu. La decodificacion en el ejemplo oficial es greedy (`logits.argmax`), lo que implica una salida determinista sin busqueda de haz explicita en el codigo de referencia.

Los detalles de entrenamiento no estan disponibles: no se especifica el numero de tokens de audio, la composicion del dataset, las horas de audio utilizadas, ni si hubo fases de ajuste adicionales mas alla del fine-tuning sobre `aadel4/omniASR-CTC-300M-v2`. Al tratarse de un modelo CTC puro, no incorpora tecnicas de alineamiento con preferencias humanas (RLHF/DPO). El autor indica que el artefacto exportado se ha verificado contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta **PASS**, aunque no se publican las cifras asociadas.

## Capacidades

- Reconocimiento automatico del habla en nheengatu (`yrl`) a partir de audio mono a 16 kHz.
- Salida de transcripcion mediante decodificacion CTC greedy, usando `processor.batch_decode` sobre los `argmax` de los logits.
- Integracion directa con la libreria `transformers` (`AutoProcessor` y `Wav2Vec2ForCTC`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: esta entrenado exclusivamente para nheengatu.
- No incorpora vision, audio de salida ni modo de pensamiento.

## Casos de uso

- Transcripcion de archivos de audio en nheengatu: el modelo convierte grabaciones a 16 kHz en texto, lo que permite digitalizar entrevistas, relatos orales o material de campo recogido por investigadores.
- Documentacion y preservacion linguistica: organismos y universidades pueden generar corpus escritos a partir de audio historico en una lengua con pocos recursos digitales, alimentando diccionarios y estudios morfologicos.
- Subtitulado de material audiovisual en nheengatu: con la transcripcion automatica se pueden generar subtitulos para videos educativos o divulgativos dirigidos a comunidades hablantes.
- Herramientas de revitalizacion cultural: aplicaciones de aprendizaje del idioma pueden usar la transcripcion como sistema de evaluacion de la pronunciacion de estudiantes.
- Investigacion en linguistica de campo: transcripcion asistida de grabaciones etnograficas, reduciendo el trabajo manual de anotacion que normalmente realizan linguistas especializados.
- Indexacion y busqueda en archivos de audio: al obtener texto transcribible, los archivos sonoros en nheengatu se pueden indexar y buscar por contenido.
- Trabajo de campo sin GPU: al tratarse de un modelo de ~326M de parametros y 1,3 GB de pesos, la inferencia es viable en portatiles y estaciones de trabajo sin acelerador dedicado, util en contextos remotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara una verificacion de transcripcion exacta con estado **PASS** frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, sin aportar WER, CER ni cifras comparativas.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 1,3 GB en precision FP32 (coincide con el tamano del repositorio). En FP16/BF16 se reduce a unos 0,65 GB.
- VRAM estimada para inferencia: del orden de 1,5 a 2 GB en FP32 contando activaciones; en torno a 1 GB en FP16. Son estimaciones derivadas del numero de parametros, no datos publicados.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, RTX 4090, etc. Tambien es viable en CPU.
- GPU de centro de datos (A100, H100) no son necesarias para este tamano; solo tendrian sentido para procesamiento por lotes a gran escala.
- Opciones de despliegue: inferencia nativa con `transformers` (PyTorch), tal como muestra el autor, y exportacion a ONNX mediante herramientas de optimizacion compatibles con modelos encoder. Las pilas de servido orientadas a modelos generativos (vLLM, llama.cpp, Ollama, TGI) no estan pensadas para este tipo de modelo CTC y no aplican directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-300M-yrl | 325.984.945 | yrl (nheengatu) | Wav2Vec2ForCTC | no disponible | HuggingFace, 0 descargas |
| aadel4/omniASR-CTC-300M-v2 (modelo base) | no disponible en la informacion | no disponible en la informacion | CTC (familia omniASR) | no disponible | HuggingFace |
| OpenAI Whisper (familia) | 39M-1550M segun variante | multilingue | encoder-decoder transformer | MIT (variantes abiertas) | ampliamente distribuido |

Se incluye Whisper como referencia de la misma categoria (ASR): frente a este modelo, Whisper ofrece soporte multilingue y un ecosistema de despliegue mucho mas maduro, pero no cubre nheengatu de forma especifica ni ofrece un ajuste dedicado a `yrl`. Los datos del modelo base `omniASR-CTC-300M-v2` no se detallan en la informacion proporcionada y conviene verificar su ficha para confirmar parametros, idiomas y licencia.

## Limitaciones y advertencias

- Modelo monolingue: solo cubre nheengatu (`yrl`); no debe usarse para otras lenguas.
- La precision varia segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio del audio, tal como advierte el propio autor.
- El audio de entrada debe ser mono y remuestreado a 16 kHz; no hacerlo degrada los resultados.
- Riesgo de transcripciones incorrectas: al ser un modelo CTC con decodificacion greedy, no incorpora mecanismos de correccion contextual ni de confianza por palabra de forma nativa.
- No se han publicado datos sobre sesgos, composicion del dataset ni cobertura de acentos o variantes dialectales.
- Licencia no disponible: se desconoce si permite uso comercial. El autor remite a la documentacion del proyecto ELARSpeech para los terminos del dataset y al repositorio del modelo base para su licencia, por lo que es imprescindible consultarlos antes de cualquier uso en produccion.
- Ausencia total de traccion en el repositorio (0 descargas, 0 likes) y de benchmarks publicos, lo que limita la validacion independiente del modelo.
- No es un modelo generativo: no debe emplearse para tareas de generacion de texto, dialogo, codigo o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-300M-yrl
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-300M-v2
