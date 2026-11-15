# Phoonnx/styletts2-en_us-kitten-mini_0.1

## Resumen

styletts2-en_us-kitten-mini_0.1 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML como `KittenML/kitten-tts-mini-0.1` y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo convierte texto en ingles estadounidense (en-US) en audio, recibiendo como entrada fonemas en alfabeto IPA generados mediante espeak-ng. Es, por tanto, un modelo de TTS ligero orientado a despliegue local y a integracion en asistentes de voz.

La relevancia de este empaquetado reside en su formato ONNX y su integracion con el ecosistema phoonnx y OVOS (OpenVoiceOS), lo que permite ejecutar sintesis de voz en Python sin depender de frameworks de deep learning pesados. El repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un modelo compacto adecuado para entornos con recursos limitados, aunque no se dispone del numero exacto de parametros en la informacion proporcionada.

El modelo se distribuye bajo licencia Apache 2.0 (declarada por el autor upstream) y soporta un unico idioma, el ingles estadounidense. Incluye ocho voces predefinidas empaquetadas (identificadas como `mini-0.1-expr-voice-2-f` hasta `mini-0.1-expr-voice-5-m`), con variantes femeninas y masculinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,2 GB |
| Voces incluidas | 8 (`expr-voice-2-f`, `expr-voice-2-m`, `expr-voice-3-f`, `expr-voice-3-m`, `expr-voice-4-f`, `expr-voice-4-m`, `expr-voice-5-f`, `expr-voice-5-m`) |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un modelo acustico basado en difusion con un decodificador de estilo, disenado para generar habla con prosodia expresiva. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de horas de audio utilizadas, ni si se aplicaron tecnicas de RLHF o fine-tuning por preferencias. Tampoco se especifica el numero de parametros ni la configuracion interna de capas.

El pipeline de inferencia en phoonnx delega la normalizacion de texto y la conversion a fonemas en la libreria `scriptconv`, concretamente mediante el `EspeakPhonemizer` del modulo `scriptconv.phonemizers.mul`. El texto se convierte primero a fonemas IPA con espeak-ng y despues se alimenta al modelo ONNX. El autor advierte que el uso del port `espyak` de espeak-ng (instalado via `phoonnx[espeak]`) puede producir diferencias foneticas respecto a espeak-ng nativo y provocar pronunciaciones incorrectas en algunas palabras. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en ficheros WAV.
- Generacion de habla con estilo expresivo, segun la denominacion `expr` de las voces incluidas.
- Ocho voces predefinidas con variantes femeninas y masculinas (voces 2, 3, 4 y 5).
- Conversion de texto a fonemas IPA mediante espeak-ng o espyak como front-end.
- Integracion como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python a traves de la API `TTSModelManager` de phoonnx.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS configurando `ovos-tts-plugin-phoonnx` en `mycroft.conf`, lo que permite dotar a un asistente domotico de sintesis de voz sin servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse sobre ONNX y con un repositorio de 0,2 GB, puede sintetizar mensajes cortos en tiempo real en equipos sin GPU dedicada.
- Generacion de audiolibros o contenido narrado en ingles: las ocho voces permiten alternar narradores y asignar voces distintas a personajes o secciones.
- Pruebas de accesibilidad y lectores de pantalla: la salida WAV directa facilita la integracion en utilidades que convierten texto de interfaz en audio para usuarios con discapacidad visual.
- Prototipado de interfaces conversacionales: la API de phoonnx permite cargar la voz y sintetizar frases en un script Python, agilizando la validacion de flujos de dialogo antes de pasar a produccion.
- Generacion de locuciones para videos y demos tecnicas en ingles: la naturaleza offline del modelo evita cuotas de APIs comerciales y permite generar lotes de audio de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el formato ONNX y el tamano de repositorio de 0,2 GB sugieren un modelo ligero que probablemente se ejecuta en CPU, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; por tamano del artefacto es plausible su ejecucion en CPU, pero no se aporta dato oficial.
- Opciones de despliegue: libreria `phoonnx` en Python; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| styletts2-en_us-kitten-mini_0.1 (este) | StyleTTS2 | en-US | ONNX | Apache 2.0 | Empaquetado para phoonnx, 8 voces, 0,2 GB |
| KittenML/kitten-tts-mini-0.1 (upstream) | StyleTTS2 | en-US | no disponible | Apache 2.0 | Modelo original de KittenML del que deriva este empaquetado |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | no disponible | ONNX | no disponible | Misma libreria de despliegue, distintos idiomas y voces |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no hay soporte multilingue documentado.
- La calidad de pronunciacion depende del front-end fonemico: con espyak pueden producirse errores en algunas palabras respecto a espeak-ng nativo.
- No se documentan sesgos especificos del modelo, pero al ser un TTS entrenado con datos no descritos, pueden existir sesgos de prosodia o acento no evaluados.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber artefactos acusticos o pronunciaciones erroneas en entradas atipicas.
- La licencia Apache 2.0 la declara el autor upstream; conviene verificar los terminos del modelo original `KittenML/kitten-tts-mini-0.1` antes de uso comercial.
- Requiere instalar espeak-ng en el sistema (o el extra `phoonnx[espeak]`) para el front-end fonemico; sin el, el modelo no funciona.
- El modelo se encuentra en version 0.1 y con solo 32 descargas, por lo que su madurez y soporte comunitario son limitados.
- No se dispone de informacion sobre latencia, throughput ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad para produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-mini_0.1
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-mini-0.1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
