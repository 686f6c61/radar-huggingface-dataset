# Phoonnx/vits-en_us-joe-medium-espeak

## Resumen

vits-en_us-joe-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en inglés estadounidense en audio inteligible, tomando como entrada fonemas espeak en alfabeto IPA en lugar de texto plano, lo que requiere un front-end de fonemización previo.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a síntesis de voz local y de baja latencia, pensado para integrarse en asistentes de voz y sistemas embebidos. Su relevancia radica en que permite ejecutar TTS de calidad razonable en hardware modesto sin depender de servicios en la nube, y en que phoonnx ofrece integración directa con el ecosistema OVOS (Open Voice OS) mediante un plugin de TTS.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Upstream | rhasspy/piper-voices/en/en_US/joe/medium |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversario. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo concreto corresponde a la variante "joe" de calidad "medium" del catálogo Piper de Rhasspy.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. El autor del modelo original es Rhasspy; Phoonnx se limita al reempaquetado en ONNX y a la integración con su librería. La entrada no es texto plano, sino fonemas espeak en IPA, generados por el front-end scriptconv (EspeakPhonemizer) o por el binario espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, previa fonemización con espeak-ng.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente a en-US.

## Casos de uso

- Asistentes de voz locales: el modelo puede generar respuestas habladas en un asistente doméstico integrado en OVOS, seleccionando la voz `piper/en_US-joe-medium` en la configuración del plugin de TTS, sin depender de servicios en la nube.
- Lectura de notificaciones y alertas: sistemas de monitorización pueden convertir mensajes de texto en audio para alertar al usuario, aprovechando el reducido tamaño del modelo (~0,1 GB) para desplegarlo en dispositivos de bajos recursos.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o web, usando phoonnx.js para ejecución en el navegador.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados o dinámicos en inglés estadounidense para entornos como aeropuertos, comercios o transporte.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan un TTS rápido y ligero para validar flujos de voz antes de invertir en modelos de mayor calidad.
- Integración en pipelines de CI/CD para pruebas de audio: generación automatizada de clips de voz en tests de integración de aplicaciones de voz, gracias a la API programática de phoonnx.
- Educación y aprendizaje de idiomas: reproducción de frases en inglés estadounidense para ejercicios de pronunciación, con la advertencia de que la calidad es "medium" y la fonemización depende de espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa ~0,1 GB, por lo que el modelo es apto para CPU y GPU de gama baja.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente, y probablemente también CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-en_us-joe-medium-espeak | VITS | en-US | ~0,1 GB | MIT | ONNX |
| Otras voces Piper en_US (p. ej., lessac, ryan) | VITS | en-US | similar | MIT (upstream) | ONNX |
| Modelos TTS neuronales de mayor tamano (p. ej., XTTS, Bark) | variable | multilingüe | varios GB | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros estructurales y licencia. Las alternativas del catálogo Piper comparten arquitectura y licencia, por lo que la elección entre ellas depende principalmente del timbre de voz deseado.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no es multilingüe.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; con la implementación espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La calidad es "medium"; no es adecuada para producciones de audio de alta fidelidad.
- Riesgo de pronunciación incorrecta en palabras con fonemización ambigua o fuera del vocabulario de espeak.
- No es un modelo de lenguaje: no razona, no sigue instrucciones complejas ni mantiene conversaciones; solo sintetiza audio a partir de fonemas.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices.
- Sin datos publicados de benchmarks, sesgos o evaluación de calidad; no hay evidencia documentada sobre sesgos de género o acento más allá del timbre "joe".
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-joe-medium-espeak](https://huggingface.co/Phoonnx/vits-en_us-joe-medium-espeak)
- [Upstream: rhasspy/piper-voices/en/en_US/joe/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/joe/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección de modelos VITS para phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
