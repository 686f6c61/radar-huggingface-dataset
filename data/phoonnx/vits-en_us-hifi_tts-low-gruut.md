# Phoonnx/vits-en_us-hifi_tts-low-gruut

## Resumen

`vits-en_us-hifi_tts-low-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI como parte de su colección de voces para Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo sintetiza voz en inglés estadounidense (`en-US`) a partir de fonemas gruut en alfabeto IPA, y está pensado para integrarse en asistentes de voz y sistemas embebidos mediante el ecosistema OVOS/Mycroft.

La relevancia de este modelo reside en su naturaleza compacta (repositorio de 0,1 GB) y su empaquetado ligero, orientado a despliegues con recursos limitados. No es un modelo de propósito general ni un LLM, sino un componente especializado de un pipeline TTS que requiere una etapa previa de fonemización mediante `scriptconv` con el extra `gruut`.

El modelo se distribuye bajo licencia CC-BY-SA-4.0, lo que permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas. Su adopción es reducida (19 descargas, 0 likes en el momento de la consulta) y la información técnica publicada por el autor es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador acústico y un vocoder integrado, entrenado de forma conjunta mediante inferencia variacional y aprendizaje adversarial. Esta arquitectura produce audio de forma end-to-end a partir de secuencias de fonemas, sin necesidad de un vocoder separado.

El modelo original proviene del repositorio `MycroftAI/mimic3-voices`, en la ruta `voices/en_US/hifi-tts_low`, y ha sido empaquetado por Phoonnx para su ejecución en ONNX. No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (lo cual es poco habitual en modelos TTS). Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto de entrada.
- Fonemización previa obligatoria mediante `scriptconv` con el fonemizador `GruutPhonemizer` (extra `scriptconv[gruut]`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Configuración de la voz a través de `mycroft.conf` con la clave `mimic3/en_US/hifi-tts_low`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente (no es un LLM).
- No soporta visión, audio de entrada ni modos de pensamiento.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en dispositivos con recursos limitados gracias a su tamaño reducido (0,1 GB) y su formato ONNX, proporcionando respuestas habladas en inglés en asistentes tipo Mycroft/OVOS.
- Síntesis de voz en sistemas OVOS: mediante el plugin `ovos-tts-plugin-phoonnx`, se selecciona la voz `mimic3/en_US/hifi-tts_low` en `mycroft.conf` para dotar de salida de voz a un asistente doméstico.
- Generación de audiolibros o contenido narrado en inglés: el modelo convierte texto plano en audio WAV, adecuado para narrativa automatizada donde no se requiere clonación de voz ni expresividad avanzada.
- Accesibilidad: lectura en voz alta de contenido textual para usuarios con discapacidad visual, integrándose en aplicaciones de escritorio o web que requieran un TTS ligero y de código abierto.
- Pruebas y prototipado de pipelines TTS: sirve como voz de referencia para validar integraciones con `phoonnx` y `scriptconv` antes de desplegar voces de mayor calidad.
- Notificaciones y avisos por voz en aplicaciones: generación de mensajes cortos en inglés para sistemas de alerta, domótica o interfaces conversacionales simples.
- Investigación en TTS: comparación de la calidad de VITS con otras arquitecturas (Tacotron, FastSpeech) en entornos de investigación con requisitos de licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo muy ligero que probablemente quepa en memoria de CPU sin GPU dedicada.
- GPU recomendadas: no disponible; por su tamaño, no requiere GPU de gama alta.
- Compatibilidad con GPU de consumo: probablemente sí en cualquier GPU moderna, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; ejecución mediante ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-en_us-hifi_tts-low-gruut | VITS | no disponible | no disponible | CC-BY-SA-4.0 | ONNX |
| Otras voces VITS de Phoonnx (coleccion VITS) | VITS | no disponible | no disponible | variable | ONNX |
| Voces Mimic 3 originales (Mycroft AI) | VITS | no disponible | no disponible | CC-BY-SA-4.0 | no disponible |

No se dispone de datos de rendimiento ni de parámetros comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS; no realiza razonamiento, generación de texto ni otras tareas de lenguaje.
- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere una etapa previa de fonemización con `scriptconv[gruut]`; no acepta texto plano directamente sin ese pipeline.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (copyleft).
- No se han publicado datos sobre sesgos, calidad de síntesis, robustez ante entradas ruidosas o rendimiento en producción.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas ante fonemas o texto mal normalizado.
- Adopción muy baja (19 descargas) y ausencia de benchmarks publicados; conviene validar la calidad de audio antes de usarlo en producción.
- No se especifican limitaciones de longitud de entrada ni comportamiento ante frases largas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-en_us-hifi_tts-low-gruut)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Voces Mimic 3 de Mycroft AI (origen)](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/hifi-tts_low)
- [Paper VITS](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65) (referencia de arquitectura en la coleccion; no se enlaza paper especifico en la informacion disponible)
