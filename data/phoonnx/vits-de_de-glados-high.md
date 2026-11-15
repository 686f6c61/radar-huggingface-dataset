# Phoonnx/vits-de_de-glados-high

## Resumen

vits-de_de-glados-high es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su libreria de inferencia TTS. El modelo original procede de la coleccion piper-de-glados de systemofapwne, concretamente de la variante alemana `de_DE/glados/high`, que reproduce la voz del personaje GLaDOS del videojuego Portal. Phoonnx se limita a reempaquetar y distribuir los pesos en ONNX con una interfaz de inferencia unificada.

El modelo resuelve la sintesis de voz en aleman (de-DE) a partir de texto, convirtiendo primero el texto a fonemas IPA mediante espeak-ng y generando despues la onda de audio con un VITS condicionado por fonemas. VITS combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento, lo que permite sintesis de alta calidad en un solo paso sin necesidad de vocoder externo.

Es relevante para desarrolladores que necesitan un motor TTS ligero, offline y de licencia permisiva (MIT) para aleman, integrable en asistentes de voz como OVOS/Mycroft o en el navegador mediante phoonnx.js. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema TTS end-to-end que integra en una sola red el encoder de texto, el modelado de duracion, el prior variacional, el decoder generativo basado en flujos y el vocoder. VITS se entrena de forma adversarial con un discriminador multiperiodo, lo que le permite generar audio de alta fidelidad en un unico paso de inferencia, sin pipeline en cascada ni vocoder separado. La variante `high` del nombre hace referencia al nivel de calidad del checkpoint original dentro de la coleccion piper-de-glados de systemofapwne.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de voz utilizado para clonar la voz de GLaDOS ni sobre si se aplicaron tecnicas de RLHF o fine-tuning especifico. El front-end de texto se delega a la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA mediante EspeakPhonemizer (espeak-ng). El modelo espera esa representacion fonetica como entrada, no texto crudo.

## Capacidades

- Sintesis de voz en aleman (de-DE) a partir de texto, con salida en formato WAV.
- Conversion texto-a-fonemas mediante espeak-ng con alfabeto IPA, gestionada por scriptconv.
- Generacion de audio en un solo paso gracias a la arquitectura VITS end-to-end.
- Integracion con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js, con entrada por espeak o unicode.
- Voz con timbre caracteristico (clon de GLaDOS), orientada a aplicaciones de entretenimiento y asistentes con personalidad.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en aleman para OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper_community/systemofapwne/de-DE_glados_high` en `mycroft.conf` y obtener respuestas habladas offline sin depender de servicios en la nube.
- Síntesis de voz para videojuegos y mods de Portal: la voz clonada de GLaDOS permite generar dialogos nuevos en aleman para mods, doblajes de fan o contenido derivado, con licencia MIT que facilita su redistribucion.
- Generacion de audiolibros y contenido narrado en aleman: el modelo convierte texto plano en audio WAV mediante `voice.synthesize_wav`, adecuado para narraciones por lotes en local.
- Prototipado de interfaces conversacionales en el navegador: phoonnx.js ejecuta el modelo VITS en el cliente con entrada espeak o unicode, util para demos web sin backend de inferencia.
- Accesibilidad y lectores de pantalla en aleman: el modelo puede integrarse en aplicaciones de lectura en voz alta que requieran un motor TTS ligero (0,1 GB) y de licencia permisiva.
- Sistemas embebidos y edge computing: el formato ONNX y el reducido tamano del repositorio permiten desplegar sintesis de voz en dispositivos con recursos limitados sin GPU dedicada.
- Contenido de entretenimiento y podcasts generados: la voz distintiva de GLaDOS sirve para producir contenido de humor o divulgacion con una identidad sonora reconocible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB en ONNX), la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS de pequeno tamano, la inferencia en CPU es viable y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU consumer moderna, aunque no se aportan datos oficiales de rendimiento.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, phoonnx.js en navegador, y ejecucion ONNX en general.
- Dependencias: espeak-ng instalado en el sistema (`apt install espeak-ng`) o la extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| vits-de_de-glados-high (este) | VITS | de-DE | MIT | ONNX | Voz clonada GLaDOS; empaquetado phoonnx |
| systemofapwne/piper-de-glados (upstream) | VITS | de-DE | no disponible en la informacion | no disponible | Checkpoint original del que deriva este modelo |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | Empaquetados con la misma libreria; idiomas y voces distintas |
| Modelos TTS comerciales en aleman | no disponible | de-DE | propietaria | no disponible | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza comprension de lenguaje, razonamiento ni generacion de texto.
- Solo soporta aleman (de-DE); no es multilingue.
- La calidad de la sintesis depende de la correccion de la fonemizacion con espeak-ng; el uso del port espyak puede producir errores de pronunciacion en algunas palabras, segun advierte la model card.
- No se dispone de informacion sobre sesgos del corpus de entrenamiento ni sobre la calidad de la voz en dominios alejados del original.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede haber artefactos acusticos o pronunciaciones incorrectas en textos con numeros, siglas o palabras extranas.
- La licencia MIT permite uso comercial, pero la model card remite a los terminos del release upstream; conviene verificar la procedencia de la voz clonada (GLaDOS es un personaje con derechos de Valve) antes de un uso comercial.
- El modelo depende de espeak-ng o espyak como dependencia externa para la fonemizacion.
- No se han publicado metricas objetivas (MOS, WER, latencia) que permitan evaluar su calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-high
- Modelo upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
