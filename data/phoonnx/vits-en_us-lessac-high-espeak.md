# Phoonnx/vits-en_us-lessac-high-espeak

## Resumen

vits-en_us-lessac-high-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US-lessac-high` del proyecto Piper, y se ha reempaquetado para su uso con la librería phoonnx, que lo ejecuta tanto en Python como en el ecosistema OVOS (OpenVoiceOS).

El modelo resuelve el problema de la síntesis de voz en inglés estadounidense de forma local y ligera: al estar exportado a ONNX, puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domésticos y aplicaciones de bajo consumo. La entrada de texto se convierte a fonemas mediante espeak-ng (o su port espyak) y se procesa con el front-end scriptconv, que normaliza el texto y genera la representación fonémica en alfabeto IPA que consume el modelo.

La relevancia actual radica en su carácter totalmente abierto (licencia MIT) y su integración con el stack de OVOS, lo que permite desplegar un sintetizador de voz de calidad alta en hardware modesto sin dependencias de servicios en la nube. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia eficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial de múltiples periodos. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia y reduce la latencia.

El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, orientado a voces de alta calidad para asistentes de voz locales. La entrada textual se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA; el front-end de phoonnx, a través de la librería scriptconv, se encarga de la normalización del texto y de la fonemización con `EspeakPhonemizer`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (en-US) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng, con soporte del port espyak como alternativa.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con demo en vivo disponible.
- Inferencia local en CPU gracias al formato ONNX, sin dependencia de GPU.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz domésticos: integrado en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, el modelo convierte las respuestas del asistente en voz en tiempo real sobre hardware de bajo consumo, sin enviar texto a servicios externos.
- Síntesis de voz en aplicaciones de escritorio: la API de phoonnx permite generar archivos WAV a partir de texto en scripts Python, útil para audiolibros, avisos o lecturas automatizadas.
- Sistemas de accesibilidad: lectura en voz alta de contenido textual para personas con discapacidad visual, ejecutándose localmente en el dispositivo del usuario y preservando la privacidad.
- Notificaciones y avisos automatizados: generación de mensajes de voz para sistemas de monitorización, domótica o alertas industriales donde se requiere una voz clara en inglés.
- Síntesis de voz en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en aplicaciones web para leer contenido dinámico sin backend de TTS.
- Pruebas y desarrollo de pipelines de voz: al ser un modelo ONNX ligero (0,1 GB), sirve como base para prototipar sistemas de diálogo, verificar integraciones de TTS o comparar calidades de voz antes de desplegar modelos mayores.
- Generación de contenido educativo o de entrenamiento: creación de material de audio en inglés para cursos, tutoriales o simulaciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; al ser un modelo ONNX de aproximadamente 0,1 GB, puede ejecutarse en CPU. La memoria RAM necesaria es reducida (del orden de cientos de MB, incluyendo el runtime de ONNX).
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede acelerar la inferencia, pero no es necesaria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo; también funciona sin GPU.
- Opciones de despliegue: ONNX Runtime a través de phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`) y phoonnx.js en el navegador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-lessac-high-espeak (este modelo) | VITS | en-US | ONNX | MIT | Voz Piper lessac high reempaquetada para phoonnx |
| Otras voces Piper (rhasspy/piper-voices) | VITS | Múltiples | ONNX | MIT (según voz) | Modelo upstream del que deriva este; mismas características técnicas |
| Modelos TTS comerciales (p. ej. APIs en la nube) | no disponible | Múltiples | API | Propietaria | Requieren conexión y no son locales; no comparables en licencia |
| Modelos TTS neuronales de mayor tamaño | no disponible | Múltiples | Safetensors / ONNX | Variable | Mayor calidad potencial pero mayores requisitos de hardware |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés estadounidense (en-US); no es multilingüe.
- La calidad de la síntesis depende de espeak-ng: si se usa el port espyak, algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente.
- Es un modelo TTS, no un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No se dispone de información sobre sesgos acústicos o demográficos en la voz generada.
- Riesgo de alucinación no aplica en el sentido textual, pero puede producir pronunciaciones erróneas ante texto no normalizado o fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia de la voz original en rhasspy/piper-voices, ya que el autor indica que el upstream declara MIT.
- Requiere instalar espeak-ng (o el extra `phoonnx[espeak]`) para la fonemización; sin ello, el pipeline no funciona.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere adaptar el front-end de fonemización.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-lessac-high-espeak](https://huggingface.co/Phoonnx/vits-en_us-lessac-high-espeak)
- [Voz upstream en rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/high)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
