# Phoonnx/vits-zh_cn-cmn

## Resumen

vits-zh_cn-cmn es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo original procede de BricksDisplay, concretamente de la variante ONNX del repositorio BricksDisplay/vits-cmn, y ha sido reempaquetado para integrarse en el ecosistema phoonnx, que lo ejecuta tanto en Python como en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El modelo sintetiza voz en chino mandarin (zh-CN) a partir de texto en caracteres o en pinyin, y se distribuye en formato ONNX con un tamano de repositorio de aproximadamente 0,1 GB. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion propias de dicha licencia.

Su relevancia radica en que ofrece una via de despliegue ligera y estandarizada para TTS en chino dentro de un stack de codigo abierto orientado a asistentes de voz, con una integracion directa en OVOS y una API Python sencilla. No obstante, la informacion publica disponible sobre el modelo es muy limitada: no se detallan datos de entrenamiento, numero de parametros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | chino mandarin (zh-CN) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto y pinyin |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | BricksDisplay |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion basado en alineamiento monotono, un prior normalizador condicionado por texto y un decoder generativo entrenado con aprendizaje adversarial, junto con un discriminador de multiples periodos y escalas. Este diseno permite generar audio de forma directa desde texto sin necesidad de un vocoder externo, con salida de forma de onda en una sola pasada.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de habla utilizado, ni sobre si se aplicaron tecnicas de ajuste fino adicionales. El front-end de texto de phoonnx delega la normalizacion y conversion en la libreria scriptconv, que aplica un `GraphemePhonemizer` para transformar el texto de entrada en la representacion que consume el modelo, admitiendo tanto caracteres como pinyin.

## Capacidades

- Sintesis de voz en chino mandarin (zh-CN) a partir de texto en caracteres o en pinyin.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable desde `mycroft.conf`.
- Normalizacion y conversion de texto de entrada mediante scriptconv.
- Ejecucion sobre runtime ONNX, lo que facilita el despliegue en entornos sin dependencias de frameworks de aprendizaje profundo completos.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo ni tool calling.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin de TTS y permite respuestas habladas en chino mandarin dentro de un asistente domestico o de escritorio, con configuracion declarativa en `mycroft.conf`.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: la API Python de phoonnx permite generar un WAV a partir de una cadena de texto y reproducirlo, con un peso de modelo de aproximadamente 0,1 GB que reduce el coste de distribucion.
- Sistemas de accesibilidad para personas con discapacidad visual: sintesis de contenido textual en chino para lectores de pantalla o interfaces de audio, ejecutable en CPU mediante ONNX.
- Generacion de audio para contenidos educativos o de aprendizaje de idiomas: produccion de locuciones en mandarin estandar a partir de transcripciones o de pinyin.
- Prototipado de interfaces conversacionales en chino: su ligereza y su licencia Apache 2.0 permiten incorporarlo en pruebas de concepto y entornos de desarrollo sin coste de licencia.
- Integracion en pipelines de automatizacion de audio: generacion por lotes de ficheros WAV a partir de listas de frases, al poder invocarse desde Python de forma programatica.
- Despliegue en dispositivos con recursos limitados: el formato ONNX y el reducido tamano del repositorio facilitan su ejecucion en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (aproximadamente 0,1 GB), la huella de memoria es reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime, puede aprovechar aceleracion por GPU compatible con dicho runtime, pero no hay datos publicados.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se documenta una lista de modelos verificados.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y runtime ONNX subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/vits-zh_cn-cmn | VITS | zh-CN | ONNX | Apache 2.0 | Empaquetado para phoonnx y OVOS |
| BricksDisplay/vits-cmn | VITS | zh-CN | ONNX | Apache 2.0 (segun model card de origen) | Repositorio upstream del que deriva este modelo |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | variable | Misma libreria de inferencia, distintos idiomas |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publica es muy escasa: no se documentan parametros, datos de entrenamiento ni evaluaciones objetivas, lo que dificulta estimar su calidad frente a alternativas.
- Solo soporta chino mandarin (zh-CN); no se documenta soporte multilingue ni de otros dialectos.
- Al ser un modelo TTS, puede presentar errores de pronunciacion en palabras fuera de vocabulario, nombres propios, siglas o texto no normalizado correctamente por el front-end.
- No se documentan sesgos de generacion (por ejemplo, de genero o de prosodia) ni su comportamiento ante entradas ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y las condiciones del modelo upstream BricksDisplay/vits-cmn antes de un despliegue en produccion.
- El modelo se distribuye unicamente en ONNX y esta pensado para la libreria phoonnx; no se garantiza su funcionamiento con otros runtimes sin conversion adicional.
- No se documentan mecanismos de control de prosodia, emocion ni velocidad mas alla de los que ofrezca la propia API de phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-zh_cn-cmn
- Modelo upstream: https://huggingface.co/BricksDisplay/vits-cmn/tree/main/onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
