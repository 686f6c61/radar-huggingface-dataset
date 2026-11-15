# Phoonnx/styletts2-en_us-ddatt

## Resumen

styletts2-en_us-ddatt es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, empaquetado en formato ONNX por el proyecto Phoonnx para su uso con su libreria de inferencia TTS homonima. El modelo original fue entrenado por el usuario ddatt y publicado en el repositorio DDATT/StyleTTS2-ONNX-Cpp; Phoonnx lo redistribuye como una voz lista para usar dentro de su ecosistema, identificada como `ddatt/en-styletts2`.

El modelo esta especializado en ingles estadounidense (`en-US`) y recibe como entrada fonemas en alfabeto IPA generados mediante espeak-ng, no texto en crudo: la normalizacion y la fonemizacion las realiza la libreria `scriptconv` antes de invocar al modelo. Esto lo hace adecuado para pipelines TTS que ya dispongan de un front-end fonetico, pero no como solucion autocontenida de texto a audio.

Su relevancia practica es acotada: se trata de un artefacto de empaquetado (28 descargas, 0 likes, 0,3 GB de repositorio) pensado para integrarse en asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, no de un modelo de nueva generacion. La licencia figura como `other` sin texto registrado, lo que constituye una advertencia importante para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa una frase por invocacion) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | other (sin texto de licencia registrado; consultar el release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,3 GB |
| Libreria de inferencia | phoonnx (Python) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz neuronal que combina un codificador de estilo y un decodificador basado en difusion para generar audio con prosodia expresiva; el modelo original se describe en el paper StyleTTS 2 (Li et al., 2023), que emplea un discriminador de multiples periodos y una funcion de perdida con componentes adversarios y de reconstruccion espectrogramica. No obstante, la informacion proporcionada no detalla la configuracion concreta empleada por ddatt: no se especifican el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron etapas de ajuste fino o preferencia.

Lo unico documentado es el proceso de empaquetado: el modelo se exporta a ONNX y se integra en phoonnx, que delega la conversion de texto a fonemas en `scriptconv` mediante `EspeakPhonemizer` (extra `scriptconv[espeak]`). El autor advierte que la implementacion espyak de espeak-ng puede producir fonemas distintos a los de espeak-ng nativo y, por tanto, pronunciaciones incorrectas en algunas palabras. No se documentan innovaciones tecnicas adicionales ni detalles del entrenamiento original.

## Capacidades

- Sintesis de voz a partir de fonemas IPA de ingles estadounidense, con salida en WAV.
- Generacion de audio con estilo prosodico (herencia de StyleTTS2), aunque no se documenta control explicito de estilo ni de hablante.
- Integracion nativa con la libreria phoonnx en Python mediante `TTSModelManager` y `voice.synthesize_wav`.
- Integracion con asistentes OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Fonemizacion previa mediante espeak-ng o espyak, con normalizacion de texto a cargo de `scriptconv`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.
- Multilingue: no; unicamente `en-US`.

## Casos de uso

- Asistente de voz local con OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, de modo que el asistente sintetiza respuestas en ingles sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en ingles: al ser un modelo ONNX ligero (repositorio de 0,3 GB), puede ejecutarse en el mismo dispositivo que emite el aviso, con latencia baja por frase.
- Prototipado de interfaces de voz: la API de phoonnx (`voice.synthesize_wav`) permite generar WAV en pocas lineas para validar flujos de UX conversacional antes de invertir en un TTS comercial.
- Generacion de narracion para contenido en ingles: util para producir locuciones de frases cortas o parrafos donde la prosodia expresiva de StyleTTS2 aporta naturalidad frente a TTS concatenativo.
- Pruebas de regresion de pipelines TTS: al estar empaquetado de forma reproducible en ONNX, sirve como referencia estable para comparar cambios en el front-end fonetico (`scriptconv`, espeak-ng frente a espyak).
- Educacion e investigacion en sintesis de voz: permite estudiar el comportamiento de StyleTTS2 en inferencia ONNX y experimentar con la cadena texto-fonema-audio sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,3 GB, por lo que el modelo cabe holgadamente en GPUs de gama baja y probablemente en CPU.
- GPU recomendadas: no documentadas por el autor. Dado el tamano del artefacto, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia ser suficiente; no se dispone de mediciones.
- Cabe en GPU consumer: si, segun el tamano del repositorio; no hay confirmacion oficial ni cifras de consumo.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato ONNX permite en principio otros runtimes ONNX, aunque no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/styletts2-en_us-ddatt | StyleTTS2 | en-US | ONNX | other (sin texto) | Empaquetado para phoonnx; entrada por fonemas IPA |
| DDATT/StyleTTS2-ONNX-Cpp (upstream) | StyleTTS2 | en-US | ONNX | no disponible | Origen del modelo; orientado a C++ |
| Otras voces de la coleccion Phoonnx StyleTTS2 | StyleTTS2 | segun voz | ONNX | other | Mismo pipeline de empaquetado; idiomas y autores variables |

No se dispone de datos de benchmarks ni de especificaciones de parametros para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia `other` sin texto registrado: el propio autor indica que no hay licencia documentada y recomienda consultar el release upstream antes de usar el modelo. No se puede asumir uso comercial permitido.
- Solo ingles estadounidense (`en-US`); no soporta otros idiomas ni variantes regionales.
- Requiere un front-end fonetico externo (espeak-ng o espyak); sin el, el modelo no puede procesar texto en crudo.
- Riesgo de pronunciacion incorrecta con espyak, ya que algunos de sus fonemas difieren de los de espeak-ng nativo, segun advierte el autor.
- No se documentan sesgos del corpus de entrenamiento, pero al ser un TTS de un unico idioma y hablante implicito, la diversidad vocal es limitada.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o prosodia erronea en entradas fuera de distribucion (siglas, numeros, nombres propios).
- Ausencia de benchmarks y de especificaciones de parametros: dificulta evaluar calidad frente a alternativas y planificar recursos.
- Proyecto con muy poca traccion (28 descargas, 0 likes) y creado en noviembre de 2026: madurez y soporte comunitario limitados.
- Dependencia del ecosistema phoonnx/scriptconv/OVOS: cambios en esas librerias pueden romper la integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-ddatt
- Modelo upstream: https://huggingface.co/DDATT/StyleTTS2-ONNX-Cpp
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
