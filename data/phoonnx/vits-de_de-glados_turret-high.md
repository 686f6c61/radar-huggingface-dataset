# Phoonnx/vits-de_de-glados_turret-high

## Resumen

vits-de_de-glados_turret-high es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería homónima. El modelo original fue entrenado por systemofapwne como parte del proyecto piper-de-glados, una colección de voces Piper que recrean la voz del personaje GLaDOS (y sus torretas) del videojuego Portal. Esta variante concreta reproduce el timbre de las torretas del juego en alemán (de-DE).

El modelo resuelve la necesidad de disponer de una voz TTS expresiva y característica para alemán dentro de ecosistemas de asistentes de voz open source como OVOS/Mycroft. Su empaquetado como ONNX con la librería phoonnx facilita el despliegue ligero, ya que el repositorio ocupa solo 0,1 GB y no requiere GPU para inferencia en tiempo real.

Es relevante para desarrolladores que construyen asistentes conversacionales, videojuegos o aplicaciones de accesibilidad en alemán y necesitan una voz con personalidad concreta, con licencia MIT y sin dependencias de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Autor original | systemofapwne |
| Empaquetado por | Phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto basado en transformers, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial multi-periodo para el entrenamiento. Este diseño permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El modelo procede del proyecto piper-de-glados de systemofapwne, que entrena voces Piper (compatibles con la arquitectura VITS) para recrear personajes del universo Portal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o fine-tuning adicional. La innovación destacable es el empaquetado en ONNX por parte de Phoonnx, que permite ejecutar el modelo en Python y en el navegador (mediante phoonnx.js) con entrada de fonemas espeak.

## Capacidades

- Síntesis de voz en alemán (de-DE) a partir de texto plano.
- Conversión de texto a fonemas espeak en alfabeto IPA mediante la librería scriptconv.
- Generación de audio WAV directamente, sin vocoder externo.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- Voz con timbre característico de las torretas de Portal, orientada a aplicaciones lúdicas o de personaje.
- No soporta tool calling, agentes, visión ni razonamiento multi-paso (es un modelo exclusivamente TTS).
- No soporta otros idiomas distintos del alemán.

## Casos de uso

- Asistentes de voz en alemán con OVOS/Mycroft: el plugin ovos-tts-plugin-phoonnx permite seleccionar esta voz en mycroft.conf y sintetizar respuestas del asistente en tiempo real sin GPU.
- Videojuegos y mods con temática Portal: la voz de torreta en alemán encaja en mods de Portal, Doom o simuladores donde se quiera reproducir el personaje con licencia MIT.
- Aplicaciones de accesibilidad en alemán: lectura de texto a voz para personas con discapacidad visual, con despliegue local y sin coste por petición.
- Prototipado rápido de interfaces de voz: el tamaño de 0,1 GB y el formato ONNX permiten incluirlo en contenedores ligeros o en el navegador para demos interactivas.
- Contenido audiovisual y podcasting: generación de diálogos de personaje para cortometrajes, animaciones o audiolibros con una voz distintiva.
- Investigación en TTS y evaluación de voces Piper: sirve como referencia para comparar calidad de síntesis en alemán entre distintas voces del ecosistema piper-de-glados.
- Sistemas embebidos y edge computing: la inferencia ONNX sin GPU permite ejecutar la voz en dispositivos de bajos recursos, como Raspberry Pi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se requiere GPU para el funcionamiento básico.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte ONNX Runtime, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS/Mycroft), phoonnx.js (navegador), ONNX Runtime.
- Latencia y throughput estimados: no disponibles.
- Dependencia externa: espeak-ng instalado en el sistema (o el extra phoonnx[espeak] con espyak, que puede producir errores de pronunciación en algunos fonemas).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-glados_turret-high | VITS | de-DE | MIT | ONNX | 0,1 GB | Voz de personaje (torreta de Portal), empaquetado por Phoonnx |
| Otras voces piper-de-glados (systemofapwne) | VITS | varios | MIT (según release upstream) | Piper/ONNX | variable | Misma familia, distintos personajes e idiomas |
| Voces Piper estándar (rhasspy/piper-voices) | VITS | multiples | MIT | ONNX | variable | Voces neutras para asistentes, sin carácter de personaje |

No se dispone de datos de benchmarks que permitan comparar la calidad de síntesis con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente TTS en alemán; no procesa otros idiomas ni tareas de texto.
- La calidad de pronunciación depende de espeak-ng; con espyak algunos fonemas difieren y pueden generar palabras mal pronunciadas.
- Voz de personaje (torreta de Portal): el timbre es intencionadamente artificial y no apto para aplicaciones que requieran una voz neutra o profesional.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir prosodia o pronunciación incorrecta en textos complejos, siglas o nombres propios.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación de calidad (MOS).
- La licencia MIT del empaquetado remite a los términos del release upstream; conviene verificar la licencia del modelo original de systemofapwne antes de uso comercial.
- No se especifican requisitos de atribución adicionales, pero se recomienda citar tanto a Phoonnx como a systemofapwne.
- Repositorio con muy pocas descargas (32) y sin likes; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-high
- Upstream (systemofapwne/piper-de-glados): https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/high
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
