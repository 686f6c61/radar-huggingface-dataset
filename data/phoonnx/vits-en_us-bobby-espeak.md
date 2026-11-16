# Phoonnx/vits-en_us-bobby-espeak

## Resumen

vits-en_us-bobby-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de simoniz0r, que lo publica como parte de su colección de voces para Piper, y Phoonnx lo redistribuye en formato ONNX listo para consumir desde Python y desde el ecosistema OVOS. La voz se identifica internamente como `piper_community/simoniz0r/en-US_bobby`.

El modelo resuelve la conversión de texto a audio en inglés estadounidense con una única voz masculina, "bobby", y una entrada de texto basada en fonemas espeak en alfabeto IPA. No es un modelo generativo de propósito general ni un sistema multimodal: es un componente TTS especializado, de tamaño reducido (el repositorio completo ocupa 0,1 GB) y pensado para integrarse en asistentes de voz, sistemas de lectura o pipelines de audio bajo licencia MIT.

Su relevancia actual es la de un eslabón práctico dentro del ecosistema de código abierto de TTS: VITS sigue siendo una arquitectura de referencia para síntesis rápida en CPU, y el empaquetado de Phoonnx facilita su uso reproducible en OVOS y en el navegador mediante phoonnx.js. La información pública disponible es escasa: no hay datos de entrenamiento, benchmarks ni ficha técnica detallada más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Voz | única, "bobby" (masculina) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es un modelo end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia temporal. La inferencia produce formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado. El modelo aquí distribuido es la conversión ONNX del checkpoint original de simoniz0r, orientada a ejecución ligera en CPU y en el navegador.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el hablante de referencia ni si se aplicaron técnicas de ajuste fino o alineamiento forzado. La model card solo indica la procedencia (release "bobby" del repositorio piper-voice-models de simoniz0r) y que la entrada son fonemas espeak en IPA. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, generando audio WAV.
- Conversión de texto a fonemas espeak-ng en alfabeto IPA como paso previo a la síntesis.
- Normalización y conversión de texto mediante la librería scriptconv del ecosistema Phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable desde `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- Voz única predefinida ("bobby"), sin selección de hablante ni control de estilo.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No dispone de capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`) y permite dotar a un asistente doméstico de una voz masculina en inglés sin depender de servicios en la nube, gracias a su licencia MIT y su ejecución local en ONNX.
- Lectura de textos en aplicaciones de accesibilidad: la síntesis directa de frases en inglés estadounidense permite convertir artículos o notificaciones en audio para usuarios con discapacidad visual, con un coste computacional bajo al ser un modelo de 0,1 GB.
- Síntesis en el navegador: mediante phoonnx.js y la demo de TigreGotico, se puede generar voz en cliente sin backend, útil para prototipos de interfaces web conversacionales o demos interactivas.
- Generación de audio para pruebas automatizadas: en pipelines de CI/CD de aplicaciones de voz, el modelo sirve para producir locuciones de referencia y validar la integración del front-end TTS sin coste de API.
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse en ONNX y en CPU, encaja en Raspberry Pi u otros equipos ligeros para avisos hablados, domótica o señalización por voz.
- Doblaje y preproducción de contenido en inglés: permite generar borradores de narración para vídeos, pódcast o prototipos de videojuegos antes de contratar una locución profesional, con la salvedad de que la calidad y expresividad de una voz VITS única son limitadas.
- Investigación en TTS: como checkpoint VITS empaquetado en ONNX, resulta útil para comparar latencia y calidad frente a otros vocoders o arquitecturas en experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente, aunque el modelo está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido tamaño del repositorio (0,1 GB); también en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx (Python), el plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: requiere espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak; este último puede pronunciar mal algunas palabras por diferencias de fonemas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-bobby-espeak | VITS | en-US | MIT | ONNX | no aplica | Voz única "bobby"; empaquetado Phoonnx |
| Otras voces Piper de simoniz0r | VITS | en-US y otros | MIT (según upstream) | ONNX | no aplica | Mismo origen; distintas voces y hablantes |
| Modelos VITS de la colección Phoonnx | VITS | varios | variable | ONNX | no aplica | Colección completa empaquetada para phoonnx |
| Modelos TTS neuronales de mayor tamaño (p. ej. basados en difusión o LLM) | variable | varios | variable | safetensors/ONNX | no aplica | Mayor expresividad y control, pero más coste computacional |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada.

## Limitaciones y advertencias

- Una sola voz ("bobby") y un solo idioma (inglés estadounidense); no hay selección de hablante, emoción ni estilo.
- La calidad de pronunciación depende de espeak-ng; con el port espyak algunas palabras pueden pronunciarse incorrectamente por diferencias en los fonemas.
- No se documentan sesgos del hablante ni del dataset de entrenamiento; al ser una voz sintética única, la diversidad acústica es limitada.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producirse una prosodia incorrecta o una pronunciación defectuosa en textos con nombres propios, siglas o palabras fuera del vocabulario fonético.
- Sin datos publicados de evaluación (MOS, inteligibilidad) que permitan garantizar calidad en producción.
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream de simoniz0r; conviene verificar esa fuente antes de un despliegue comercial.
- Dependencia de una librería en estado pre-release (`pip install --pre phoonnx`) y de una cadena de herramientas (scriptconv, espeak-ng) que puede cambiar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-bobby-espeak
- Release upstream de la voz "bobby": https://github.com/simoniz0r/piper-voice-models/releases/tag/bobby
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper de VITS: no disponible en la información proporcionada
