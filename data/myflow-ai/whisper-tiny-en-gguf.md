# myflow-ai/whisper-tiny.en-gguf

## Resumen

myflow-ai/whisper-tiny.en-gguf es una conversion a formato GGUF de openai/whisper-tiny.en, el checkpoint de reconocimiento automatico del habla (ASR) en ingles de la familia Whisper de OpenAI. El modelo original fue presentado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022) y esta pensado para transcribir audio a texto en ingles sin necesidad de ajuste fino adicional. Esta version concreta la publica el usuario myflow-ai y esta orientada a ejecutarse con transcribe.cpp, una implementacion en C++ derivada del ecosistema de whisper.cpp.

Se trata de un transformer encoder-decoder de aproximadamente 37,8 millones de parametros, la variante mas pequena de Whisper. Procesa audio en ventanas de 30 segundos y permite decodificacion por chunks para audio de mayor duracion mediante marcas de tiempo a nivel de segmento. Al ser un modelo "en" (English-only), solo transcribe en ingles y no realiza traduccion ni deteccion automatica de idioma, pero a igualdad de tamano es mas rapido y ligeramente mas preciso en ingles que su equivalente multilingue.

Su relevancia practica esta en el binario final: tras la cuantizacion, los pesos ocupan entre 42 MB (Q4_K_M) y 146 MB (F32), lo que permite ejecutar reconocimiento de voz en CPU o en GPU de gama baja. Las cifras declaradas por el autor muestran un WER de entre 5,72% y 5,99% en LibriSpeech test-clean segun cuantizacion, con factores de tiempo real (RTF) muy altos incluso en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia) |
| Parametros totales | 37.776.736 (aprox. 37,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s; decodificacion por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado sobre 680.000 horas de audio etiquetado obtenido mediante supervision debil a gran escala. El checkpoint tiny.en corresponde a la configuracion entrenada exclusivamente con datos en ingles y para la tarea de reconocimiento del habla (no traduccion). El modelo consume audio en ventanas de 30 segundos y genera la transcripcion de forma autorregresiva; para audio mas largo, transcribe.cpp aplica decodificacion por chunks con marcas de tiempo a nivel de segmento. Esta conversion GGUF no altera los pesos: es una reempaquetado cuantizado del checkpoint original. Segun la model card, se porto desde el commit 87c7102 de openai/whisper-tiny.en (fijado el 2026-04-25) y se valido contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26.

El autor no detalla en la informacion disponible si hubo etapas de RLHF o DPO especificas para esta variante; el entrenamiento descrito corresponde al del modelo original de OpenAI, basado en supervision debil y sin un pipeline de alineacion adicional documentado en esta ficha. Las unicas innovaciones destacables recogidas son propias del runtime (transcribe.cpp) y no del modelo: decodificacion greedy con suppress_tokens, fallback de temperatura, marcas de tiempo por segmento y decodificacion fragmentada para audio largo.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) sobre audio de hasta 30 segundos por ventana.
- Decodificacion de audio de mayor duracion mediante chunking con marcas de tiempo a nivel de segmento.
- No soporta traduccion de voz (campo `translate: false`).
- No realiza deteccion automatica de idioma (campo `lang_detect: false`).
- No soporta streaming (campo `streaming: false`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento explicito ni de vision.
- Uso limitado a audio en ingles; no cubre otros idiomas.
- Salida con marcas de tiempo por segmento (no a nivel de palabra, segun la informacion disponible).

## Casos de uso

- Subtitulado de video en ingles: el modelo genera transcripciones con marcas de tiempo por segmento, adecuadas para producir ficheros de subtitulos sincronizados en contenido en ingles.
- Transcripcion de notas de voz en aplicaciones moviles o de escritorio: con pesos de 42 a 76 MB, la inferencia puede ejecutarse en local sin enviar audio a la nube, util para escenarios de privacidad.
- Indexado y busqueda de contenido hablado: convertir grabaciones, podcasts o reuniones en ingles a texto para despues indexarlas y permitir busqueda por palabra clave.
- Preprocesado de pipelines de NLP: alimentar un transcriptor ligero como primer paso antes de tareas posteriores (resumen, clasificacion) en sistemas que ya operan en ingles.
- Prototipado y evaluacion de sistemas de voz: por su tamano minimo y su elevado RTF, sirve para validar arquitecturas de ASR y comparar frente a variantes mayores antes de escalar.
- Analisis de llamadas o atencion al cliente en ingles: transcribir conversaciones grabadas para su revision, control de calidad o mineria de texto, siempre que el audio este en ingles y se toleren errores de WER en torno al 6%.
- Herramientas de accesibilidad: generacion de subtitulos en tiempo cuasi real en equipos modestos, dado el rendimiento declarado en CPU y GPU integrada.

## Benchmarks y rendimiento

WER medido en el split completo LibriSpeech test-clean (2620 enunciados) con la decodificacion por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, marcas de tiempo por segmento activadas):

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 146 MB | 5,77% |
| F16 | 76 MB | 5,77% |
| Q8_0 | 44 MB | 5,72% |
| Q6_K | 43 MB | 5,80% |
| Q5_K_M | 42 MB | 5,89% |
| Q4_K_M | 42 MB | 5,99% |

Factores de tiempo real (RTF) declarados por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 279,8 |
| Apple M4 Max | CPU | 78,7 |
| AMD Ryzen 4750U | Vulkan | 60,7 |
| AMD Ryzen 4750U | CPU | 26,1 |

Notas del autor: OpenAI reporta 5,66% en el mismo split; la divergencia probable se atribuye a que `model.generate()` usa por defecto `<|notimestamps|>` mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. Los numeros proceden de una unica ejecucion sobre Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

## Requisitos de hardware

- VRAM/RAM estimada: entre 42 MB (Q4_K_M) y 146 MB (F32) de pesos; el consumo total en ejecucion es muy bajo, apto para sistemas con poca memoria.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (integradas y dedicadas); el autor reporta RTF de 279,8 en Metal sobre M4 Max y 60,7 en Vulkan sobre Ryzen 4750U.
- GPU de gama alta (A100, H100, RTX 4090): no son necesarias para este modelo; su tamano no las aprovecha y el cuello de botella no es el computo del modelo.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU sola (RTF 78,7 en M4 Max CPU y 26,1 en Ryzen 4750U CPU).
- Opciones de despliegue: transcribe.cpp (libreria declarada). La informacion disponible no confirma soporte en vLLM, TGI, Ollama o whisper.cpp estandar, aunque el formato es GGUF.
- Latencia y throughput: expresados como RTF en la tabla anterior; valores superiores a 1 indican procesamiento mas rapido que el tiempo real (cuanto mayor, mejor). El modelo requiere audio de entrada en WAV mono a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER (LibriSpeech test-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-tiny.en-gguf (este) | 37,8 M | ventanas de 30 s | 5,72% - 5,99% segun cuantizacion | Apache-2.0 | GGUF |
| openai/whisper-tiny.en (base) | 37,8 M | ventanas de 30 s | 5,66% (reportado por OpenAI) | Apache-2.0 | safetensors |
| openai/whisper-tiny (multilingue) | no disponible | ventanas de 30 s | no disponible | Apache-2.0 | safetensors |

No se dispone en la informacion proporcionada de datos de WER ni de parametros de las variantes base.en o small.en para completar una comparativa mas amplia.

## Limitaciones y advertencias

- Solo funciona con audio en ingles; no traduce ni detecta idioma automaticamente.
- No soporta streaming, por lo que no es apto para transcripcion en tiempo real estricta sin procesado por bloques externo.
- Riesgo de alucinacion en clips cortos o con ruido de fondo; el autor indica que la variabilidad del WER en torno a 0,1 pp se debe en gran medida a resultados de alucinacion en el umbral de ruido.
- Marcas de tiempo solo a nivel de segmento, no a nivel de palabra.
- WER en torno al 6% en un corpus limpio (LibriSpeech); el rendimiento degradara en dominios con acento, ruido, solapamiento de voces o terminologia especializada.
- Requiere audio de entrada en WAV mono a 16 kHz (conversion previa con ffmpeg si es necesario).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y tamano reportado de 0,0 GB; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- La model card enlaza ficheros y rutas del repositorio handy-computer/whisper-tiny.en-gguf, mientras que el repositorio efectivo es myflow-ai/whisper-tiny.en-gguf; hay que confirmar que los pesos corresponden al modelo esperado.
- Licencia Apache-2.0 heredada del modelo base; permite uso comercial, pero se recomienda revisar los terminos completos del modelo original de OpenAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/myflow-ai/whisper-tiny.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-tiny.en/commit/87c7102
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.en.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Repositorio citado en la model card (a verificar): https://huggingface.co/handy-computer/whisper-tiny.en-gguf
