# codeclawd/qwen3-asr-0.6b-coreml

## Resumen

Qwen3-ASR 0.6B CoreML es la conversión a Core ML del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante concreta ha sido producida por FluidInference para permitir inferencia totalmente local en plataformas Apple (iOS y macOS), y el repositorio que se analiza aquí es un espejo de respaldo mantenido por el equipo PrivateWispr bajo el identificador `codeclawd/qwen3-asr-0.6b-coreml`. Los ficheros son byte a byte idénticos a la revisión original, y solo se ha añadido una cabecera al README.

El modelo resuelve el problema de la transcripción de voz sin conexión: al ejecutarse en el Neural Engine y la GPU de los chips Apple Silicon, no requiere enviar audio a un servidor externo, lo que resulta relevante para aplicaciones con requisitos de privacidad, latencia o disponibilidad offline. Con 0,6 mil millones de parámetros y soporte para más de 30 idiomas, se sitúa en un rango de tamaño que cabe en dispositivos móviles modernos.

La arquitectura combina un codificador de audio con entrada de espectrograma mel al estilo Whisper y un decodificador transformer autorregresivo de 28 capas con 1024 dimensiones ocultas y soporte de caché KV. El audio se procesa en fragmentos de un segundo (100 tramas mel). Se distribuye en dos variantes de precisión: f32 (unos 2,5 GB) e int8 (unos 0,7 GB), ambas bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio (espectrograma mel estilo Whisper) + decodificador transformer autorregresivo de 28 capas, 1024 de dimension oculta, con cache KV |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (decodificacion autorregresiva con `maxNewTokens` configurable, 512 por defecto en el ejemplo de uso) |
| Tipos de cuantizacion | Float32 (f32, ~2,5 GB) e Int8 (int8, ~0,7 GB) |
| Idiomas soportados | Mas de 30 idiomas, entre ellos en, zh, ja, ko, vi, th, id, ms, hi, ar, tr, ru, de, fr y es |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes `.mlpackage`/`.mlmodelc`), convertidos desde PyTorch; tokens gestionados por el tokenizador de Qwen |
| Tamano del repositorio | 2,8 GB |
| Modelo base | Qwen/Qwen3-ASR-0.6B |
| Biblioteca | coreml |

## Arquitectura y entrenamiento

El modelo es un sistema de reconocimiento de voz encoder-decoder. El codificador recibe espectrogramas mel como los empleados por Whisper: la senal de audio se trocea en fragmentos de un segundo, equivalentes a 100 tramas mel, que se procesan secuencialmente. El decodificador es un transformer autorregresivo de 28 capas con 1024 dimensiones ocultas que mantiene una cache KV, lo que reduce el coste computacional de generar transcripciones largas. El tokenizador es el de Qwen, ampliado con tokens especiales propios de ASR.

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero total de horas de audio, la composicion exacta del dataset de entrenamiento ni sobre si se aplicaron tecnicas de ajuste por refuerzo (RLHF/DPO). La model card unicamente confirma que el modelo base fue desarrollado por el equipo Qwen de Alibaba y que la contribucion de este repositorio es la conversion a Core ML, que preserva los pesos originales sin modificaciones mas alla de la reestructuracion de grafo necesaria para Core ML.

## Capacidades

- Transcripcion automatica del habla (ASR) en modo offline, sin conexion a internet.
- Soporte de mas de 30 idiomas, incluyendo ingles, chino, japones, coreano, vietnamita, tailandes, indonesio, malayo, hindi, arabe, turco, ruso, aleman, frances y espanol.
- Inferencia en cadena (on-device) sobre iOS y macOS mediante Core ML, aprovechando CPU, GPU y Neural Engine de los chips Apple.
- Decodificacion autorregresiva con cache KV, con limites de generacion configurables (`maxNewTokens`).
- Procesamiento de audio por fragmentos de un segundo (100 tramas mel), lo que permite transcripcion incremental de flujos largos.
- Dos variantes de precision intercambiables segun el equilibrio deseado entre exactitud y huella de memoria.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni razonamiento multi-paso, ya que es un modelo especializado en reconocimiento de voz.

## Casos de uso

- Transcripcion de reuniones y notas de voz en aplicaciones iOS y macOS: el modelo puede ejecutarse integramente en el dispositivo, evitando subir audio empresarial o personal a servicios en la nube y cumpliendo requisitos estrictos de privacidad.
- Subtitulado en tiempo real de contenido multimedia: al procesar audio en fragmentos de un segundo y operar con una RTFx superior a 1x en hardware Apple Silicon, es viable generar subtitulos con latencia reducida sin dependencia de red.
- Asistentes de voz integrados en aplicaciones moviles: la transcripcion local elimina la latencia de ida y vuelta al servidor y permite que el asistente funcione en modo avion o con conectividad intermitente.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva, que pueden transcribir conversaciones presenciales directamente en el telefono o el reloj.
- Herramientas de dictado para profesionales en movilidad (sanidad, inspeccion de campo, periodismo) donde no hay cobertura fiable o se manejan datos sensibles.
- Internacionalizacion de productos de voz: el soporte de mas de 30 idiomas permite lanzar una misma funcion de dictado en mercados sin desarrollar un modelo por idioma.
- Prototipado rapido en Mac: la variante int8 de ~0,7 GB permite a desarrolladores probar pipelines de ASR en un portatil Apple sin depender de infraestructura GPU dedicada.
- Archivado y indexacion de audio historico: transcripcion por lotes de bibliotecas de audio en una sola maquina, con coste marginal nulo por hora de audio una vez desplegado el modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en un Mac con chip M4 Pro (WER = tasa de error de palabras, CER = tasa de error de caracteres, RTFx = factor de tiempo real):

| Dataset | WER | CER | RTFx |
|---|---|---|---|
| LibriSpeech test-clean (2620 ficheros) | 4,4 % | 1,9 % | 2,8x |
| AISHELL-1 test (100 ficheros) | 4,6 % | 3,7 % | 4,5x |

Para referencia, la model card indica que el modelo oficial en PyTorch obtiene un 2,11 % de WER en LibriSpeech test-clean, lo que sugiere una degradacion de aproximadamente 2,3 puntos porcentuales tras la conversion a Core ML f32. No se publican resultados separados para la variante int8, ni benchmarks de otros idiomas distintos del ingles y el chino.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con soporte de Core ML (iPhone, iPad y Mac con Apple Silicon o Intel).
- Huella de almacenamiento: aproximadamente 2,8 GB para el repositorio completo; aproximadamente 2,5 GB para la variante f32 y 0,7 GB para la variante int8.
- Memoria en tiempo de ejecucion: no se especifica en la documentacion. La variante int8 (~0,7 GB de pesos) es la mas adecuada para dispositivos moviles con RAM limitada; la f32 (~2,5 GB) encaja con holgura en Macs y iPads de gama alta.
- GPU/acceleradores: aprovecha el Neural Engine y la GPU integrada de los chips Apple Silicon. Los benchmarks publicados corresponden a un M4 Pro.
- Compatibilidad con GPU de escritorio (NVIDIA, AMD): no aplica; al ser un paquete Core ML, no se ejecuta de forma nativa en CUDA.
- Opciones de despliegue: Core ML directamente, o a traves de la libreria FluidAudio del repositorio FluidInference/FluidAudio, que ofrece una API Swift (`Qwen3AsrManager`) para cargar los modelos y transcribir.
- Throughput: 2,8x en tiempo real sobre LibriSpeech test-clean y 4,5x sobre AISHELL-1 en un M4 Pro. La latencia absoluta por fichero no se detalla.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con alternativas de la misma categoria, marcando como "no disponible" aquellos valores que no se han publicado en esta documentacion.

| Modelo | Parametros | Idiomas | Formato on-device | Licencia | WER (LibriSpeech test-clean) |
|---|---|---|---|---|---|
| Qwen3-ASR 0.6B CoreML | 0,6B | 30+ | Core ML (f32/int8) | Apache 2.0 | 4,4 % (Core ML), 2,11 % (PyTorch oficial) |
| Whisper (OpenAI) | 0,074B-1,55B segun variante | ~99 | Core ML via conversiones de terceros, WhisperKit | MIT | No disponible en esta documentacion |
| Alternativas ASR multilingues comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han facilitado en la informacion disponible resultados de benchmarks frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Degradacion respecto al modelo original: la conversion a Core ML f32 eleva el WER en LibriSpeech test-clean del 2,11 % al 4,4 %. Conviene validar la precision en el dominio concreto de uso antes de desplegar.
- La variante int8 (~0,7 GB) presumiblemente reduce aun mas la precision, pero no se publican sus cifras de WER ni CER.
- Es un modelo especializado en ASR: no genera texto general, no razona, no ejecuta codigo ni soporta tool calling. No debe emplearse como sustituto de un LLM.
- Riesgo de alucinacion inherente a los decodificadores autorregresivos: en audio con ruido, silencios largos o habla solapada puede generar texto plausible pero incorrecto. Se recomienda validacion humana en contextos criticos.
- Cobertura desigual entre idiomas: los unicos benchmarks publicados son de ingles y chino. El rendimiento en el resto de los idiomas listados no esta cuantificado.
- Dependencia de plataforma: el paquete Core ML no se ejecuta en Linux ni Windows con CUDA, lo que limita su uso a ecosistemas Apple.
- Es un espejo de terceros (`codeclawd`) del repositorio original de FluidInference. Aunque los ficheros se declaran byte a byte identicos, conviene verificar hashes si se requiere trazabilidad de cadena de suministro.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de copyright y licencia, y de indicar los cambios realizados. No incluye clausulas de uso aceptable especificas ni garantias.
- No se publican metricas de sesgo por acento, genero o variedad dialectal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/codeclawd/qwen3-asr-0.6b-coreml
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de conversion original: https://huggingface.co/FluidInference/qwen3-asr-0.6b-coreml
- Paper tecnico: https://arxiv.org/abs/2601.21337
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
