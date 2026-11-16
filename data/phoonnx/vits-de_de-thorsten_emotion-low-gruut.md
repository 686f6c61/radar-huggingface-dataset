# Phoonnx/vits-de_de-thorsten_emotion-low-gruut

## Resumen

`vits-de_de-thorsten_emotion-low-gruut` es un modelo de sintesis de voz (text-to-speech) en aleman basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces Mimic3 y empaquetado por Phoonnx en formato ONNX para su libreria de TTS. El modelo convierte texto en aleman (`de-DE`) en audio, tomando como entrada fonemas IPA generados mediante el fonemizador gruut, y esta pensado para su uso dentro del ecosistema phoonnx y el asistente de voz OVOS.

Se trata de una voz concreta (la variante `thorsten-emotion_low`) dentro del catalogo de voces Mimic3, no de un modelo de lenguaje generativo. Su relevancia radica en que ofrece sintesis de voz local, ligera y ejecutable en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube, lo que la hace adecuada para asistentes de voz embebidos, domotica y aplicaciones de accesibilidad en entornos de habla alemana.

El repositorio ocupa aproximadamente 0,1 GB y declara la licencia CC-BY-SA-4.0. No se dispone en la informacion proporcionada de datos sobre numero de parametros, longitud de contexto (no aplica en TTS) ni resultados de benchmarks objetivos (MOS, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante "low" del catalogo Mimic3) |
| Idiomas soportados | aleman (`de`, `de-DE`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo. En este caso, la entrada son fonemas IPA generados por gruut a partir del texto normalizado por scriptconv.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del corpus (mas alla de la referencia al dataset Thorsten y su variante "emotion"), ni sobre el uso de RLHF/DPO (no aplicable a un modelo TTS). La etiqueta "low" indica una variante de menor calidad o tamano dentro del catalogo Mimic3, pero no se especifica su significado exacto ni sus diferencias tecnicas con la variante estandar.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- Ejecucion local sobre ONNX Runtime, sin dependencia de servicios externos.
- Voz etiquetada como "emotion" en el catalogo de origen (no se detalla que emociones cubre).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Asistentes de voz locales en aleman: integracion como motor TTS en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas sin conexion a internet y sin enviar texto a terceros.
- Domotica y altavoces inteligentes: generacion de avisos y respuestas habladas en dispositivos con recursos limitados, gracias al formato ONNX y al tamano reducido del repositorio (0,1 GB).
- Accesibilidad: lectura en voz alta de textos y notificaciones para usuarios con discapacidad visual en aplicaciones de escritorio o moviles que ejecuten ONNX Runtime.
- Sistemas de informacion publica: anuncios automatizados en estaciones, aeropuertos o comercios donde se requiera sintesis en aleman con latencia baja y ejecucion en CPU.
- Prototipado de interfaces conversacionales: generacion rapida de locuciones de prueba en pipelines de desarrollo de asistentes, sin coste por caracter ni cuota de API.
- Educacion y aprendizaje de idiomas: produccion de audio de referencia en aleman para ejercicios de pronunciacion o dictado, con control total sobre el texto de entrada.
- Investigacion en TTS: punto de partida para experimentos de comparacion de voces Mimic3 o para el ajuste fino de modelos VITS en aleman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) se trata de un modelo ligero que cabe holgadamente en cualquier GPU consumer y previsiblemente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 o superior) es mas que suficiente. El modelo esta disenado para funcionar tambien en CPU.
- Cabe en GPU consumer: si, con margen amplio dado el tamano del artefacto.
- Opciones de despliegue: ONNX Runtime a traves de phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-de_de-thorsten_emotion-low-gruut | VITS | de-DE | ONNX (phoonnx) | CC-BY-SA-4.0 | Voz Mimic3 empaquetada; entrada por fonemas gruut |
| Otras voces Mimic3 `de_DE` (catalogo MycroftAI) | VITS | de-DE | ONNX | CC-BY-SA-4.0 (segun upstream) | Mismo pipeline; varian voz y variante (low/medium/high) |
| Piper (voces alemanas) | VITS | de-DE | ONNX | depende de la voz | Ecosistema alternativo de TTS local; no se dispone de comparacion de calidad en la informacion |
| Coqui TTS (modelos alemanes) | VITS / Tacotron2 | de-DE | PyTorch | depende del modelo | Requiere mas recursos; no se dispone de datos comparativos |

No se dispone de datos objetivos de calidad (MOS) ni de rendimiento que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de sintesis de voz: no genera texto, no razona y no soporta instrucciones complejas; su unica funcion es convertir texto en audio.
- Idioma limitado al aleman (`de-DE`); el texto en otros idiomas producira una pronunciacion incorrecta o fallos en el fonemizador.
- La variante "low" del catalogo Mimic3 sugiere una calidad de audio inferior a las variantes superiores; no se documenta el impacto exacto.
- Riesgo de errores de pronunciacion ante neologismos, siglas, numeros o nombres propios, dependiendo de la normalizacion de scriptconv y del fonemizador gruut.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar la integracion en productos propietarios.
- Dependencia de la cadena phoonnx + scriptconv[gruut]; cambios de version en estas librerias pueden afectar a la API o al resultado.
- No se documentan sesgos especificos de la voz (genero, acento, prosodia), aunque al derivar del corpus Thorsten puede heredar sus caracteristicas y limitaciones.
- Sin datos publicados de MOS ni de rendimiento en produccion; se recomienda validacion propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten_emotion-low-gruut
- Origen upstream (MycroftAI mimic3-voices, voz thorsten-emotion_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/thorsten-emotion_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
