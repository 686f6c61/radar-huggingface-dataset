# Phoonnx/vits-en_us-john-espeak

## Resumen

`vits-en_us-john-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo toma texto en inglés estadounidense, lo convierte a fonemas mediante espeak-ng en alfabeto IPA y genera audio de voz masculina identificada como "john" en calidad media. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT.

El problema que resuelve es la síntesis de voz local y ligera: al estar exportado a ONNX y empaquetado para phoonnx, puede ejecutarse en Python y en el asistente OVOS sin depender de servicios en la nube, lo que lo hace adecuado para asistentes de voz embebidos, domótica y aplicaciones de accesibilidad con requisitos de privacidad o de conectividad limitada. Su front-end textual se delega a la librería `scriptconv`, que normaliza el texto y aplica el fonemizador de espeak.

Es relevante ahora por su integración en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` y por la disponibilidad de una variante JavaScript (`phoonnx.js`) que permite ejecutar la misma voz en el navegador. No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy específico dentro del ecosistema Piper/phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se detallan variantes) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Calidad de voz | medium (segun ruta upstream `en_US/john/medium`) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normalizadores y un vocoder integrado, lo que permite generar formas de onda directamente a partir de fonemas sin un vocoder separado. La variante concreta corresponde a la voz `en_US/john/medium` del repositorio `rhasspy/piper-voices`, entrenada por Rhasspy dentro del proyecto Piper.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable no está en el entrenamiento sino en el empaquetado: la exportación a ONNX y la integración con el front-end `scriptconv`, que realiza normalización de texto y fonemización con espeak-ng. Existe una advertencia del autor sobre diferencias fonéticas entre espeak-ng y el port espyak, que pueden provocar errores de pronunciación en algunas palabras si se usa la alternativa empaquetada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Conversión de texto a fonemas IPA mediante espeak-ng (o espyak como alternativa).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- Voz masculina en calidad media, adecuada para lectura de frases y respuestas cortas.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas sin enviar texto a servicios externos, lo que preserva la privacidad y permite funcionamiento offline.
- Domótica y dispositivos embebidos: al ocupar ~0,1 GB y ejecutarse sobre ONNX, puede desplegarse en Raspberry Pi u otros equipos de bajos recursos para anunciar estados, alarmas o notificaciones por voz.
- Accesibilidad para personas con discapacidad visual: lectura de texto de pantalla, documentos o mensajes en inglés estadounidense con una voz masculina clara de calidad media.
- Generación de avisos pregrabados y locuciones: producción por lotes de archivos WAV para sistemas de megafonía, tutoriales o contenidos educativos en inglés.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar integraciones con phoonnx, scriptconv y phoonnx.js antes de pasar a voces de mayor calidad.
- Aplicaciones web con síntesis en el cliente: mediante phoonnx.js la misma voz puede ejecutarse en el navegador, útil para lectores de artículos o interfaces conversacionales sin backend de TTS.
- Prototipado de interfaces conversacionales: permite iterar rápidamente sobre flujos de diálogo con retroalimentación de audio real sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se requieren A100 ni H100. Una RTX 4090 o similar está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también es viable en CPU.
- Opciones de despliegue: phoonnx (Python, con ONNX Runtime), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia adicional: es necesario instalar espeak-ng en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-john-espeak (este) | VITS | en-US | medium | MIT | ONNX | Hugging Face, empaquetado para phoonnx |
| Otras voces Piper `en_US` (p. ej. lessac, amy) | VITS | en-US | low/medium/high | MIT (upstream Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Coqui TTS (voces VITS) | VITS / otros | multilingüe | variable | MPL-2.0 / otras | varios | GitHub, Hugging Face |
| Modelos TTS neuronales comerciales (p. ej. APIs cloud) | propietaria | multilingüe | alta | propietaria | API | servicios en la nube |

La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible en la información proporcionada. Frente a otras voces Piper, este modelo se distingue únicamente por el empaquetado para phoonnx y la integración con OVOS y phoonnx.js; el modelo subyacente es el mismo que el de `rhasspy/piper-voices/en/en_US/john/medium`.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Es un modelo TTS, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Calidad de voz "medium": adecuada para avisos y asistentes, pero inferior a voces neuronales de alta calidad para producción comercial exigente.
- Dependencia de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas, números o nombres propios, derivado del front-end de fonemización.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia upstream de `rhasspy/piper-voices` y de las dependencias (espeak-ng tiene licencia GPL, lo que puede condicionar la distribución combinada).
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema pequeño y soporte comunitario limitado.
- No se documentan sesgos específicos de la voz ni métricas de evaluación objetiva (MOS, WER) en la información disponible.
- Fecha de creación y actualización del repositorio (2026-11-16) posterior a la fecha habitual de consulta; conviene verificar la vigencia del empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-john-espeak
- Upstream Piper (voz john medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/john/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo de phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
