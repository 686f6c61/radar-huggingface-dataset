# Phoonnx/vits-en_us-chitti

## Resumen

vits-en_us-chitti es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por swqg-messiah y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en inglés estadounidense a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que es un modelo compacto (repo de 0,1 GB) y ligero, pensado para despliegue en entornos con recursos limitados, como asistentes de voz locales o sistemas embebidos.

El modelo se distribuye en formato ONNX, lo que facilita su ejecución en una variedad de plataformas sin necesidad de frameworks de deep learning pesados. Está integrado en el ecosistema phoonnx, que incluye plugins para OVOS (Open Voice OS) y una versión JavaScript para ejecución en navegador. La licencia MIT permite uso comercial sin restricciones significativas.

Se trata de un modelo de un solo hablante para inglés estadounidense, sin capacidades multilingües ni de clonación de voz. Su diseño está orientado a la síntesis rápida y eficiente más que a la expresividad o naturalidad de modelos más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. Genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado. El modelo toma como entrada fonemas en alfabeto IPA producidos por espeak-ng.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original fue publicado por swqg-messiah en el repositorio kusaal_chitti_piper y posteriormente empaquetado por Phoonnx para su librería ONNX. No se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura VITS.

## Capacidades

- Síntesis de voz (text-to-speech) para inglés estadounidense (en-US).
- Entrada basada en fonemas IPA generados por espeak-ng.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Modelo de un solo hablante; no soporta clonación de voz ni cambio de hablante.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS para proporcionar respuestas habladas en inglés estadounidense, aprovechando su tamaño reducido y su formato ONNX para ejecución en dispositivos de bajos recursos.
- Síntesis de voz en navegador: mediante phoonnx.js, el modelo puede ejecutarse directamente en el navegador para aplicaciones web que necesiten leer texto en voz alta sin depender de servicios en la nube.
- Lectura de contenido accesible: conversión de artículos, notificaciones o mensajes a audio para usuarios con discapacidad visual o en contextos de manos libres.
- Sistemas embebidos y IoT: su reducido tamaño (0,1 GB) y formato ONNX permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi u otros SoC.
- Generación de avisos automatizados: integración en pipelines de notificaciones por voz para sistemas de alerta, domótica o atención telefónica básica.
- Pruebas y prototipado de TTS: su licencia MIT y su integración con phoonnx lo hacen adecuado para experimentar con síntesis de voz en proyectos de investigación o desarrollo sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere que el modelo es muy ligero y probablemente puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; por su tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería más que suficiente, aunque probablemente no sea necesaria.
- Cabe en GPU consumer: sí, con amplio margen; también es probable que funcione en CPU.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-en_us-chitti | VITS | en-US | MIT | ONNX | 0,1 GB |
| Otros modelos VITS de la colección Phoonnx | VITS | variable | variable | ONNX | variable |
| Modelos Piper (piper_community) | VITS | variable | variable | ONNX | variable |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (en-US); no soporta otros idiomas ni cambio de voz.
- La calidad de la síntesis depende de la corrección de los fonemas generados por espeak-ng; el uso de espyak (port de espeak-ng) puede producir errores de pronunciación en algunas palabras, según advierte la model card.
- Riesgo de pronunciación incorrecta en palabras con grafías irregulares o nombres propios, al depender de la fonemización automática.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; cualquier expectativa en ese sentido es inadecuada.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se recomienda conservar el aviso de copyright original.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un dataset no especificado, podría presentar sesgos de pronunciación o prosodia no documentados.
- No se dispone de información sobre el dataset de entrenamiento, lo que limita la evaluación de posibles sesgos o limitaciones de cobertura lingüística.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-chitti](https://huggingface.co/Phoonnx/vits-en_us-chitti)
- [Modelo upstream: swqg-messiah/kusaal_chitti_piper](https://huggingface.co/swqg-messiah/kusaal_chitti_piper)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
