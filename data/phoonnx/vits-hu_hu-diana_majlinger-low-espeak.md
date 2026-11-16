# Phoonnx/vits-hu_hu-diana_majlinger-low-espeak

## Resumen

vits-hu_hu-diana_majlinger-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su libreria de inferencia TTS. El modelo genera voz en hungaro (hu-HU) a partir de fonemas espeak en alfabeto IPA, y esta pensado para su uso dentro del ecosistema phoonnx y OVOS (Open Voice OS).

Se trata de un modelo de voz concreto (una unica voz identificada como "diana-majlinger_low"), no de un modelo fundacional multilingue. Su relevancia radica en que permite sintesis de voz en hungaro de forma local y ligera, con un repositorio de apenas 0,1 GB en formato ONNX, lo que facilita su despliegue en entornos con recursos limitados o en aplicaciones de asistente de voz embebidas.

El modelo no incluye informacion publica sobre numero de parametros, datos de entrenamiento ni resultados de benchmarks en la documentacion disponible. Su interes practico esta en la integracion con phoonnx y OVOS, y en que hereda la licencia CC-BY-SA-4.0 del repositorio upstream de Mycroft AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | hungaro (hu-HU) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina inferencia variacional, aprendizaje adversarial y un decodificador basado en normalizing flows para generar audio directamente a partir de fonemas. Esta arquitectura es conocida por producir voz natural sin necesidad de un vocoder separado, integrando generacion de mel-espectrograma y conversion a forma de onda en un unico modelo.

El modelo original fue entrenado por Mycroft AI y publicado en el repositorio mimic3-voices, dentro de la ruta `voices/hu_HU/diana-majlinger_low`. Phoonnx lo ha empaquetado en formato ONNX para su libreria de inferencia. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Capacidades

- Sintesis de voz en hungaro (hu-HU) a partir de texto de entrada.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante la libreria scriptconv.
- Generacion de audio en formato WAV a traves de la API de phoonnx (`synthesize_wav`).
- Integracion como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Uso en navegador a traves de phoonnx.js con entrada espeak o unicode.
- Voz unica predefinida ("diana-majlinger_low"), sin seleccion de multiples hablantes.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales en hungaro: el modelo puede integrarse en OVOS para dotar de salida de voz en hungaro a un asistente domestico, funcionando de forma local y sin dependencia de servicios en la nube gracias a su tamano reducido (0,1 GB).
- Lectura de textos en aplicaciones de accesibilidad: se puede usar para convertir articulos o documentos en hungaro a audio mediante la API `synthesize_wav`, adecuado para lectores de pantalla y herramientas de accesibilidad.
- Generacion de avisos y notificaciones habladas: en sistemas embebidos o domoticos, el modelo puede sintetizar mensajes cortos en hungaro con baja latencia al ejecutarse en ONNX.
- Prototipado de interfaces conversacionales: desarrolladores que construyan chatbots de voz en hungaro pueden usar el modelo para validar la experiencia de usuario sin contratar servicios TTS comerciales.
- Síntesis en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para generar voz en hungaro en aplicaciones web, sin enviar texto a un servidor.
- Educacion y aprendizaje de idiomas: el modelo puede generar pronunciaciones de frases en hungaro para materiales didacticos, aunque la calidad depende de la fidelidad de la fonemizacion espeak.
- Investigacion en TTS: sirve como referencia de un modelo VITS empaquetado en ONNX para experimentos de comparacion de arquitecturas o de integracion con pipelines de fonemizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; al ser un modelo ONNX de 0,1 GB, no requiere GPU dedicada para funcionar.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador) y el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano |
|---|---|---|---|---|---|
| vits-hu_hu-diana_majlinger-low-espeak | VITS | hu-HU | ONNX | CC-BY-SA-4.0 | 0,1 GB |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun modelo | no disponible |
| Voces originales de mimic3-voices | VITS | varios | varios | CC-BY-SA-4.0 (upstream) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de una unica voz y un unico idioma (hungaro); no es multilingue ni permite seleccion de hablantes.
- La calidad de sintesis depende de la fonemizacion espeak; con el port espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Requiere espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]`) para generar los fonemas de entrada.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluacion de calidad de audio en la documentacion.
- Licencia CC-BY-SA-4.0: permite uso comercial pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; conviene revisar las implicaciones para productos propietarios.
- Al ser un modelo TTS, no genera texto ni razona; no aplica el riesgo de alucinacion tipico de los LLM, pero puede producir pronunciaciones incorrectas.
- No hay datos publicos sobre el proceso de entrenamiento ni sobre el dataset, lo que limita la evaluacion de sesgos acusticos o dialectales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-diana_majlinger-low-espeak
- Repositorio upstream (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/hu_HU/diana-majlinger_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
