# Phoonnx/styletts2-en_us-kitten-nano_0.1

## Resumen

`styletts2-en_us-kitten-nano_0.1` es un modelo de sintesis de voz (text-to-speech) de la familia StyleTTS2, desarrollado originalmente por KittenML como `KittenML/kitten-tts-nano-0.1` y empaquetado por Phoonnx para su libreria de inferencia ONNX `phoonnx`. El modelo convierte texto en ingles estadounidense, representado como fonemas espeak en alfabeto IPA, en audio sintetizado. Su proposito es ofrecer una voz TTS ligera y ejecutable en local mediante ONNX Runtime, integrable en asistentes de voz y aplicaciones Python.

La relevancia de este empaquetado reside en la portabilidad: al distribuirse en formato ONNX y con una libreria de inferencia dedicada, el modelo puede ejecutarse sin depender del framework de entrenamiento original ni de GPUs de gran capacidad. Incluye ocho voces predefinidas con etiquetas de expresividad y genero (`expr-voice-2-f`, `expr-voice-2-m`, hasta `expr-voice-5-m`), lo que permite seleccionar timbre y estilo sin reentrenar.

La informacion publicada no detalla el numero de parametros, la longitud de contexto ni los datos de entrenamiento del modelo original. La model card se limita a identificar la arquitectura (StyleTTS2), el idioma (`en-US`), el front-end fonetico (espeak-ng / IPA) y la licencia Apache 2.0 heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria `phoonnx`) |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de sintesis de voz neuronal que combina modelado de estilo y difusion para generar habla con prosodia expresiva. La model card no especifica el numero de parametros, la composicion del dataset de entrenamiento, el numero de horas de audio ni si se aplicaron tecnicas de alineamiento o RLHF. Tampoco se documentan innovaciones adicionales mas alla de las propias de StyleTTS2.

El pipeline de inferencia empaquetado por Phoonnx realiza la conversion texto-a-fonemas mediante `scriptconv`, concretamente el `EspeakPhonemizer` del modulo `scriptconv.phonemizers.mul` (extra `scriptconv[espeak]`). El texto se normaliza y se transforma a fonemas espeak en alfabeto IPA antes de entrar al modelo. Es importante senalar que la model card advierte que los fonemas de `espyak` (port de espeak-ng incluido en `phoonnx[espeak]`) difieren de los de `espeak-ng` nativo, lo que puede provocar pronunciaciones incorrectas en algunas palabras si no se instala el binario original.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Ocho voces predefinidas con etiquetas de expresividad y genero: `kittentts/nano-0.1-expr-voice-2-f`, `-2-m`, `-3-f`, `-3-m`, `-4-f`, `-4-m`, `-5-f`, `-5-m`.
- Conversion texto-a-fonemas integrada mediante `scriptconv` y el fonemizador espeak (IPA).
- Ejecucion en local sobre ONNX Runtime, sin necesidad de servicios en la nube.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modos de pensamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a `en-US`.

## Casos de uso

- **Asistentes de voz locales (OVOS/Mycroft)**: el modelo se integra como plugin TTS mediante `ovos-tts-plugin-phoonnx`; se selecciona la voz en `mycroft.conf` y el asistente sintetiza respuestas en ingles sin conexion a internet.
- **Lectura de notificaciones y alertas en aplicaciones de escritorio**: al ejecutarse sobre ONNX Runtime y no requerir GPU, puede incorporarse en herramientas de escritorio o CLI que conviertan mensajes de sistema en audio WAV.
- **Generacion de audiolibros o podcasts automatizados en ingles**: las ocho voces permiten alternar narradores en un mismo contenido; el flujo consistiria en dividir el texto en frases, sintetizar cada una con `synthesize_wav` y concatenar los WAV resultantes.
- **Prototipado rapido de interfaces conversacionales**: al instalarse con `pip install --pre phoonnx`, un equipo puede validar la calidad de la voz y la prosodia antes de comprometerse con un proveedor TTS comercial.
- **Sistemas de accesibilidad para contenido en ingles**: conversion de articulos, correos o paginas web a audio para usuarios con discapacidad visual, ejecutandose en el propio dispositivo.
- **Pipelines de pruebas automatizadas de TTS**: el modelo sirve como referencia ligera para comparar prosodia, inteligibilidad y latencia frente a otros motores en pruebas de regresion de calidad de voz.
- **Generacion de avisos pregrabados en entornos sin conectividad**: por ejemplo, kioscos o dispositivos empotrados que necesiten sintetizar mensajes dinamicos en ingles estadounidense sin acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, latencia) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo TTS de tipo "nano" distribuido en ONNX, es previsible que quepa en GPU de consumo e incluso en CPU, pero la informacion proporcionada no confirma cifras.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: no confirmada en la informacion disponible; el empaquetado ONNX sugiere ejecucion viable en CPU.
- **Opciones de despliegue**: `phoonnx` (Python y OVOS) sobre ONNX Runtime; requiere `espeak-ng` instalado en el sistema o el extra `phoonnx[espeak]` (espyak).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia contextual, el modelo upstream es `KittenML/kitten-tts-nano-0.1`, del que este empaquetado deriva directamente y con el que comparte arquitectura y licencia.

## Limitaciones y advertencias

- **Unico idioma**: solo sintetiza ingles estadounidense (`en-US`); no admite otros idiomas.
- **Dependencia del front-end fonetico**: si se usa `espyak` en lugar de `espeak-ng`, algunas palabras pueden pronunciarse incorrectamente, segun advierte la propia model card.
- **Sesgos**: no se documentan sesgos conocidos, pero la informacion sobre el dataset de entrenamiento es inexistente, por lo que no puede evaluarse la representatividad de las voces.
- **Calidad y alucinacion acustica**: no hay datos publicados sobre inteligibilidad, naturalidad (MOS) o artefactos; al tratarse de un modelo "nano", es razonable esperar una calidad inferior a la de sistemas TTS de mayor tamano, aunque esto no se cuantifica en la informacion disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card indica que la licencia se hereda del modelo upstream; conviene verificar las condiciones exactas en `KittenML/kitten-tts-nano-0.1`.
- **Madurez del ecosistema**: el paquete se instala con `pip install --pre phoonnx` (version preliminar), lo que implica posible inestabilidad de API en produccion.
- **Repo de 0.0 GB**: el tamano reportado del repositorio no refleja el peso real de los pesos ONNX; conviene descargar y verificar los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-nano_0.1
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
