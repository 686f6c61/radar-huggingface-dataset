# coder543/granite-speech-5.0-470m-turboctc-coreai

## Resumen

Granite Speech 5.0 470M TurboCTC — Core AI es una conversión del reconocedor de voz CTC en inglés de IBM (ibm-granite/granite-speech-5.0-470m-turboctc) al formato de pesos Core AI de Apple, publicada por el usuario coder543 y anclada a la revisión 286456107c8ba1161f5c22dfe85466402c88333b del modelo original. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos se distribuyen como activos `.aimodel` con cuantización int8 y activaciones FP16, pensados para ejecutarse en el runtime Core AI sobre silicio de Apple físico con macOS 27 o iOS 27.

El modelo resuelve reconocimiento automático del habla (ASR) en inglés mediante una cabeza CTC sobre un encoder de aproximadamente 470 millones de parámetros. La entrada del grafo no es audio en bruto, sino características log-mel/delta específicas del modelo más una máscara de validez, de modo que se necesita un frontend anfitrión que extraiga las features, además de un colapso CTC y su tokenizador para producir texto. La atención relativa usa forma Fourier y conserva todos los desplazamientos y frecuencias, sin reducción de ventana ni de contexto.

Su relevancia práctica es doble: por un lado, permite transcripción local en dispositivos Apple sin enviar audio a servidores, con velocidades medidas de 483-499 veces el tiempo real en un MacBook Air M3 de 16 GB; por otro, documenta un flujo de conversión reproducible hacia Core AI. Conviene subrayarlo: la única métrica de calidad publicada (2,75 % de WER sobre una grabación concreta de JFK) es una comprobación de conversión, no una evaluación general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de reconocimiento de voz con decodificacion CTC; atencion relativa en forma Fourier; entrada de caracteristicas log-mel/delta con mascara de validez |
| Parametros totales | 470 millones (segun la denominacion del modelo) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Cubos de capacidad a 50 fotogramas de entrada por segundo: 512, 1024, 1536, 2048, 2560 y 3072 fotogramas (hasta ~61,4 s por cubo); las grabaciones mas largas deben dividirse en emisiones acotadas |
| Tipos de cuantizacion | Pesos en int8 (W8A16); activaciones en FP16; las proyecciones de salida de convolucion y las proyecciones de posicion relativa conservan pesos FP16 cuando `preserve_relative` es verdadero |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Activos Core AI `.aimodel` (no safetensors ni GGUF); se especializan para el dispositivo en el primer uso; `SHA256.json` registra todos los ficheros distribuidos excepto el propio |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como una conversion del reconocedor CTC ingles de IBM, no como un modelo entrenado por el autor de esta ficha. Los puntos tecnicos documentados son: entrada de caracteristicas log-mel/delta con mascara de validez (el grafo rechaza audio en bruto), cabeza CTC que requiere un colapso de tokens en el anfitrion, atencion relativa en forma Fourier que retiene todos los desplazamientos y frecuencias sin recorte de ventana, y cuantizacion mixta W8A16 con excepciones en FP16 para las proyecciones de salida de convolucion y para las proyecciones de posicion relativa.

El reparto de pesos es estatico: los puntos de entrada comparten pesos y la especializacion por dispositivo ocurre en el primer uso, un proceso que puede tardar varios minutos y que no esta incluido en las cifras de rendimiento. El autor afirma que el grafo medido y el grafo distribuido tienen firmas y recuentos de operaciones identicos, y que solo se elimino metadatos de depuracion de autoria antes de publicar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF o DPO en el modelo original; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC (transcripcion de audio a texto).
- Procesamiento de features log-mel/delta con mascara de validez, lo que permite descartar fotogramas de relleno en lotes con distinta duracion.
- Troceado por cubos de capacidad de 512 a 3072 fotogramas a 50 fotogramas por segundo, lo que admite desde utterances cortas hasta fragmentos de unos 61 segundos sin reducir la ventana de atencion.
- Ejecucion con dos peticiones de encoder en vuelo, segun la configuracion medida por el autor.
- Inferencia local en silicio Apple mediante Core AI, con pesos int8 y activaciones FP16.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento; el modelo es exclusivamente un transcriber CTC.
- No se documentan capacidades multilingues: el unico idioma declarado es el ingles.

## Casos de uso

- Dictado y transcripcion local en aplicaciones de macOS o iOS: el modelo se ejecuta en el propio dispositivo Apple con Core AI, de modo que el audio del usuario no sale del terminal; los cubos de hasta 3072 fotogramas permiten transcribir frases completas sin partir la atencion.
- Subtitulado casi en tiempo real: con 483-499 veces el tiempo real medido en un M3, un flujo de audio puede transcribirse con holgura dentro de la ventana de reproduccion, siempre que el frontend anfitrion entregue las features log-mel/delta.
- Transcripcion de reuniones y notas de voz: las grabaciones largas se dividen en fragmentos de como maximo 60 segundos con planificacion por fronteras de silencio (el ejemplo publicado usa 21 fragmentos silenciosos para 18 minutos y 15 segundos), de modo que se preserva todo el audio sin descartar muestras.
- Procesamiento por lotes en servidores Apple: al compartir pesos entre puntos de entrada y admitir dos peticiones en vuelo, encaja en pipelines de transcripcion masiva sobre hardware Apple en lugar de GPUs NVIDIA.
- Accesibilidad y lectura de contenido: transcripcion de audio a texto para personas con discapacidad auditiva en aplicaciones nativas, con la ventaja de funcionar sin conexion.
- Automatizacion de posproduccion de audio: generacion de transcripciones con marcas temporales para indexar podcasts o archivos de video, encadenando el colapso CTC y el tokenizador en el anfitrion.
- Investigacion en despliegue en el borde: sirve como referencia de conversion de un modelo ASR de 470 M de parametros a formatos de Apple, incluida la preservacion en FP16 de las proyecciones de posicion relativa.
- No es adecuado, con la informacion disponible, para tareas de comprension semantica, resumen o dialogo: solo produce transcripciones.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de latencia y una comprobacion de WER sobre una unica grabacion en ingles. No constituyen un benchmark general de calidad.

| Medicion | Valor |
|---|---|
| Precision de conversion (JFK, transcripcion aportada, WER normalizado tipo Whisper) | 61/2.220 errores = 2,75 % |
| Transcripcion en caliente, audio de 20 s | 0,0401 s (499 veces el tiempo real) |
| Transcripcion en caliente, audio de 1.095,320125 s (18:15) | 2,267 s (483 veces el tiempo real) |
| Hardware de medida | MacBook Air M3, 16 GB, macOS 27 build 26A428 |
| Configuracion | W8A16, ANE preferida, dos peticiones de encoder en vuelo |

La medicion de 18:15 usa 21 fragmentos de frontera silenciosa de como maximo 60 segundos cada uno. El autor indica explicitamente que se trata de una comprobacion de conversion, no de un benchmark de calidad general. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de suites ASR estandar (LibriSpeech, Common Voice, etc.) en la informacion disponible. La especializacion de dispositivo en el primer uso puede tardar varios minutos y no esta incluida en las cifras anteriores.

## Requisitos de hardware

- Plataforma obligatoria: Core AI sobre silicio Apple fisico, con macOS 27 o iOS 27. No se puede ejecutar este artefacto en GPUs NVIDIA ni en CPU x86.
- Huella de almacenamiento: el repositorio ocupa 0,5 GB; los pesos int8 de 470 M de parametros rondan los 470 MB, mas las activaciones y proyecciones que se conservan en FP16.
- Memoria: el ejemplo medido usa un MacBook Air M3 con 16 GB de memoria unificada. No se publica una cifra oficial minima de memoria; no disponible.
- GPU recomendadas: no aplica en el sentido habitual; el destino son la Neural Engine y la GPU integrada de los chips Apple. El unico dispositivo con medicion publicada es un M3.
- Compatibilidad con hardware de consumo: si, en equipos Apple con macOS 27 o iOS 27; no hay datos medidos para otros modelos de chip.
- Opciones de despliegue: exclusivamente el runtime Core AI con los activos `.aimodel` (no precompilados como `.aimodelc`); la compilacion y la ubicacion de ejecucion dependen del sistema y del dispositivo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta version.
- Latencia y throughput: 0,0401 s para 20 s de audio y 2,267 s para 18:15, es decir, 499x y 483x el tiempo real respectivamente, excluyendo la preparacion, la E/S del fichero de audio y la planificacion de fragmentos.
- Limitacion de integracion: el grafo no acepta audio en bruto; hace falta un frontend anfitrion que calcule log-mel/delta y una implementacion de colapso CTC con tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| coder543/granite-speech-5.0-470m-turboctc-coreai | 470 M | cubos de 512 a 3072 fotogramas a 50 fps (~61 s max.) | Ingles | Apache 2.0 | `.aimodel` (Core AI, int8/FP16) | Conversion para Apple silicon; unica medicion publicada: 2,75 % WER en una grabacion |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M | no disponible en la informacion proporcionada | Ingles | Apache 2.0 | no disponible | Modelo original de IBM en el que se basa esta conversion (revision 286456107c8ba1161f5c22dfe85466402c88333b) |
| Alternativas ASR comparables (Whisper, Parakeet CTC, wav2vec 2.0) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se han facilitado resultados de benchmarks del modelo original ni de terceros que permitan una comparacion cuantitativa fiable; cualquier tabla comparativa de rendimiento seria especulativa.

## Limitaciones y advertencias

- Unico idioma soportado: ingles. No hay soporte multilingue declarado.
- La unica cifra de calidad (2,75 % de WER) procede de una sola grabacion en ingles con transcripcion aportada; el propio autor la califica de comprobacion de conversion y no de benchmark de calidad general.
- El grafo no acepta audio en bruto: si el frontend anfitrion calcula mal las caracteristicas log-mel/delta o la mascara de validez, la transcripcion sera incorrecta sin que el modelo lo detecte.
- Se requiere implementar por separado el colapso CTC y el tokenizador; los errores en ese paso degradan la salida.
- Limite de duracion por fragmento: los cubos llegan a 3072 fotogramas (unos 61 segundos a 50 fps). Las grabaciones mas largas deben dividirse en emisiones acotadas sin descartar audio, lo que anade planificacion al pipeline.
- La especializacion por dispositivo en el primer uso puede tardar varios minutos; los activos distribuidos no son `.aimodelc` precompilados, por lo que el rendimiento real depende del sistema y del dispositivo.
- Dependencia de plataforma: requiere Core AI sobre Apple silicon fisico con macOS 27 o iOS 27. No es desplegable en GPU NVIDIA ni en servidores x86 con este formato.
- No se documentan sesgos del modelo original, comportamiento ante audio no vocal, musica o ruido, ni tasas de alucinacion en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y licencia y a documentar los cambios realizados en los ficheros modificados; el autor declara que tanto el modelo original como estos pesos convertidos usan dicha licencia.
- El repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, y su fecha de creacion es posterior a esta revision; se trata de un artefacto reciente y sin validacion independiente conocida.
- Los resultados de busqueda web devueltos no contienen informacion relevante sobre el modelo: son listados de sitios para adultos sin relacion alguna, por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/granite-speech-5.0-470m-turboctc-coreai
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revision concreta del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/286456107c8ba1161f5c22dfe85466402c88333b
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente listados de sitios para adultos sin relacion con el modelo.
