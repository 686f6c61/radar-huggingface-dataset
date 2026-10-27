# ashbash/granite-speech-5.0-470m-turboctc-GGUF

## Resumen

Granite Speech 5.0 470M TurboCTC (GGUF) es la conversión al formato GGUF del reconocedor de voz `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario ashbash. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de IBM, sin modificar, y el trabajo de conversión consiste en empaquetarlos en un único fichero GGUF en bf16 al que se añaden como tensores el frontend de audio (banco de filtros mel y ventana STFT) y, como metadatos del tokenizador, el vocabulario CTC. El resultado es un fichero de 0,9 GB con 473.014.864 parámetros.

El modelo resuelve un problema muy concreto: ejecutar reconocimiento de voz local en macOS sobre Apple silicon mediante el runtime gmlx. gmlx empareja este reconocedor con un modelo de chat de la familia Granite Switch, de modo que el modelo conversacional puede "leer" audio, y además lo expone como servicio de speech-to-text, incluyendo el endpoint `/v1/audio/transcriptions` compatible con la API de OpenAI. Es relevante porque demuestra un patrón de despliegue local de ASR + LLM en un solo binario, sin depender de servicios en la nube.

La advertencia principal es la compatibilidad: la model card indica explícitamente que otros runtimes GGUF, como llama.cpp, no cargan este fichero. Por tanto, su utilidad está acotada al ecosistema gmlx en macOS con Apple silicon. La licencia de los pesos es Apache 2.0, heredada del modelo base de IBM, y el script de conversión se distribuye bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor de voz con salida CTC (tags `speech-recognition`, `ctc`); arquitectura interna del codificador no detallada en la informacion disponible |
| Parametros totales | 473.014.864 (473 M) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No aplica (modelo ASR; no se documenta ventana de contexto de texto) |
| Tipos de cuantizacion | bf16 unicamente (un solo fichero publicado, sin variantes Q4/Q8) |
| Idiomas soportados | No disponible (no declarados en la model card ni en los metadatos del repositorio) |
| Licencia | Apache 2.0 (pesos, heredada de IBM); script de conversion MIT |
| Formato de pesos | GGUF (bf16); checkpoint original de IBM en formato nativo de HuggingFace |
| Modelo base | ibm-granite/granite-speech-5.0-470m-turboctc (revision `1dd23f46f6d4e6eae2531982ba2e33220086dd97`) |
| Tarea | Reconocimiento automatico del habla (speech-to-text) |
| Runtime compatible | gmlx en macOS con Apple silicon; llama.cpp y otros runtimes GGUF no cargan el fichero |
| Contenido adicional del GGUF | Frontend de audio (banco de filtros mel, ventana STFT) como tensores y vocabulario CTC como metadatos del tokenizador |
| Tamano del repositorio | 0,9 GB |
| Autor de la conversion | ashbash |
| Idiomas de la documentacion | Ingles |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo; la informacion disponible lo describe como un reconocedor de voz con salida CTC de 470 M de parametros, descendiente directo del checkpoint de IBM. La conversion a GGUF no altera los pesos: el script `convert_granite_speech5_ctc.py` descarga el checkpoint original en la revision indicada y genera un fichero equivalente en bf16. Lo unico que se añade es el preprocesado de audio empaquetado como tensores (banco de filtros mel y ventana STFT), de forma que el runtime no necesita recalcularlo, y el vocabulario CTC como metadatos del tokenizador.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas mas alla del propio esquema CTC y del nombre comercial "TurboCTC". Tampoco se detalla si el modelo emplea un codificador de tipo transformer o conformer. Cualquier afirmacion sobre estos puntos requeriria consultar la model card del modelo base de IBM, que no forma parte de la informacion proporcionada.

## Capacidades

- Transcripcion de audio a texto (speech-to-text) mediante decodificacion CTC.
- Preprocesado de audio integrado en el propio fichero GGUF: no requiere calcular el banco de filtros mel ni la ventana STFT en el runtime.
- Servicio compatible con la API de OpenAI: expone `/v1/audio/transcriptions` cuando se configura `server.stt: granite-speech` en gmlx.
- Integracion con modelos de chat Granite Switch: el modelo conversacional puede recibir audio en peticiones de chat, usando este reconocedor como frontend de transcripcion.
- Ejecucion local en macOS sobre Apple silicon mediante gmlx.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente: es exclusivamente un modelo ASR.
- No se documenta soporte multilingue ni capacidades especiales (diarizacion, marcas de tiempo, puntuacion) en la informacion disponible.

## Casos de uso

- Dictado local en macOS: el modelo transcribe voz a texto en el propio equipo mediante gmlx, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad o para trabajo sin conexion.
- Subtitulado y transcripcion de reuniones: sirve como motor ASR en un pipeline que recibe ficheros de audio grabados y genera transcripciones; su tamano de 473 M permite ejecutarlo de forma continua en un portatil Apple silicon sin competir por recursos con otras tareas.
- Asistente conversacional por voz en local: emparejado con un modelo Granite Switch en gmlx, el sistema puede recibir audio del usuario, transcribirlo y responder en texto dentro de la misma sesion de chat.
- Servicio interno de speech-to-text compatible con OpenAI: al exponer `/v1/audio/transcriptions`, se puede apuntar a el cualquier cliente que ya hable el formato de la API de OpenAI (SDKs, herramientas de transcripcion, scripts propios) sin reescribir la integracion.
- Prototipado y evaluacion de ASR en macOS: al ser un unico fichero GGUF en bf16 sin cuantizar, resulta util para comparar la salida del modelo frente a otros backends antes de decidir un despliegue, aunque solo dentro del ecosistema gmlx.
- Analisis de llamadas o grabaciones en lotes pequenos: al ejecutarse en local sobre un solo equipo, permite procesar audio sensible de clientes sin salir de la infraestructura propia, siempre que el volumen no exija GPU dedicada.
- Aplicaciones de accesibilidad: entrada por voz para usuarios con dificultades motoras, integrada en herramientas de escritorio de macOS mediante el endpoint HTTP local que sirve gmlx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de WER (word error rate), comparaciones con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1 GB solo para los pesos en bf16 (473 M de parametros), mas el overhead del runtime; un presupuesto realista de 1,5-2 GB de memoria unificada es prudente, aunque no se han publicado mediciones oficiales.
- Plataforma soportada: macOS sobre Apple silicon (serie M). El modelo esta pensado para el runtime gmlx y no se documenta soporte en Linux, Windows, CUDA ni ROCm.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte. El fichero no es cargable por llama.cpp ni por otros runtimes GGUF, por lo que no hay via de despliegue descrita en GPUs NVIDIA.
- Cabe holgadamente en cualquier Mac con Apple silicon; el factor limitante no es la memoria sino la compatibilidad del runtime.
- Opciones de despliegue: gmlx (`gmlx serve <chat-model>.gguf --asr granite-speech-5.0-470m-turboctc.gguf`), o configurando `server.stt: granite-speech` para servir `/v1/audio/transcriptions`. vLLM, TGI, Ollama y llama.cpp no estan soportados segun la model card.
- Descarga: `hf download ashbash/granite-speech-5.0-470m-turboctc-GGUF`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Runtime | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc-GGUF (este) | 473 M | GGUF bf16 | gmlx (macOS Apple silicon) | Apache 2.0 | No disponible | Incluye frontend de audio y vocabulario CTC en el fichero |
| ibm-granite/granite-speech-5.0-470m-turboctc (base) | 473 M | Formato nativo HuggingFace | Ecosistema transformers/PyTorch | Apache 2.0 | No disponible | Mismos pesos; requiere el stack original de IBM |
| Familias ASR alternativas (Whisper, Parakeet CTC, wav2vec2) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | Solo se citan como categoria; no se aportan datos verificables de parametros, contexto ni WER en la informacion disponible |

La comparacion relevante y verificable es contra el checkpoint original de IBM: mismos pesos, misma licencia y mismo numero de parametros; la diferencia es el formato (GGUF bf16 con frontend de audio embebido), el runtime (gmlx en lugar del stack PyTorch) y la ausencia de variantes cuantizadas. No se dispone de datos de benchmarks que permitan comparar la calidad de transcripcion frente a otras familias de ASR.

## Limitaciones y advertencias

- Compatibilidad muy restringida: la model card indica que llama.cpp y otros runtimes GGUF no cargan el fichero; el unico runtime soportado es gmlx sobre macOS con Apple silicon.
- Un unico fichero en bf16: no hay variantes cuantizadas (Q4, Q5, Q8), por lo que no se puede reducir el consumo de memoria por debajo de lo que ocupan los pesos sin cuantizar.
- Idiomas no declarados: no se especifica que lenguas soporta; asumir cobertura multilingue seria una suposicion no respaldada por la documentacion.
- Riesgo de transcripciones incorrectas en audio con ruido, solapamiento de hablantes, acentos no representados en el entrenamiento o silencios largos; no se han publicado evaluaciones de robustez ni cifras de WER.
- Sin puntuacion, mayusculas ni marcas de tiempo garantizadas: la informacion disponible no documenta estas funciones, habituales en modelos ASR mas grandes.
- No es un modelo de lenguaje: no genera respuestas, no razona, no ejecuta tool calling ni actua como agente. Cualquier funcionalidad conversacional depende del modelo Granite Switch con el que se empareje.
- Dependencia de un ecosistema de autor unico: el exito del despliegue depende de gmlx y de su configuracion (`server.stt`, emparejamiento con Granite Switch), no de una infraestructura estandar del sector.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas; el script de conversion es MIT. Aun asi, conviene verificar la licencia y las condiciones del modelo base de IBM antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Fecha de creacion en los metadatos: 27 de octubre de 2026, segun la informacion del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ashbash/granite-speech-5.0-470m-turboctc-GGUF
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Runtime gmlx: https://asher.github.io/gmlx/
- Documentacion de gmlx sobre Granite Switch y audio: https://asher.github.io/gmlx/granite-switch.html#audio
