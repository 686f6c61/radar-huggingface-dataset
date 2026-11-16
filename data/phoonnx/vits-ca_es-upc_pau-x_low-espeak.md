# Phoonnx/vits-ca_es-upc_pau-x_low-espeak

## Resumen

vits-ca_es-upc_pau-x_low-espeak es un modelo de síntesis de voz (text-to-speech) en catalán (ca-ES) basado en la arquitectura VITS. Lo desarrolla Rhasspy como parte del proyecto Piper y lo empaqueta Phoonnx para su librería de inferencia ONNX homónima. El modelo original vive en el repositorio rhasspy/piper-voices, en la ruta ca/ca_ES/upc_pau/x_low, y esta ficha corresponde a su reempaquetado para el ecosistema phoonnx.

El modelo resuelve la conversión de texto catalán a audio inteligible con un coste computacional muy bajo, gracias a su variante x_low (la más ligera de la familia Piper). La entrada de texto se procesa mediante fonemas espeak en alfabeto IPA, por lo que requiere espeak-ng (o el port espyak) como front-end fonemizador. La arquitectura es VITS, un modelo generativo end-to-end que combina un codificador de texto, un prior variacional y un decodificador de audio con discriminadores adversariales.

Es relevante ahora por su licencia MIT, su formato ONNX listo para inferencia en CPU y su integración con asistentes de voz open source como OVOS/Mycroft. No se dispone de datos públicos de benchmarks, parámetros ni tamaño de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalán (ca-ES) |
| Licencia | MIT |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico y un decodificador generativo de audio entrenado con pérdidas adversariales y de reconstrucción. El modelo usa fonemas espeak en alfabeto IPA como entrada, normalizados y convertidos por la librería scriptconv (componente EspeakPhonemizer de scriptconv_copyleft.phonemizers.mul). La variante x_low indica la configuración de menor tamaño y calidad de la familia Piper, orientada a inferencia rápida en CPU.

No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicó RLHF o DPO. El modelo original procede del repositorio rhasspy/piper-voices, ruta ca/ca_ES/upc_pau/x_low, y el autor declara la licencia MIT en la model card upstream.

## Capacidades

- Síntesis de voz a partir de texto en catalán (ca-ES).
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada mediante espeak-ng (o el port espyak) en alfabeto IPA.
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS).
- No dispone de capacidades de visión, audio de entrada ni thinking mode.

## Casos de uso

- Asistentes de voz domésticos: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, configurando la voz `piper/ca_ES-upc_pau-x_low` en `mycroft.conf`, lo que permite respuestas habladas en catalán en un asistente local sin dependencia de la nube.
- Lectura de textos en catalán: conversión de artículos, notificaciones o mensajes a audio WAV con la API `synthesize_wav`, adecuado para aplicaciones de accesibilidad.
- Síntesis en aplicaciones web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para generar voz catalana sin backend, útil en demos y aplicaciones offline.
- Generación de avisos y locuciones: para sistemas de megafonía, paneles informativos o interfaces de voz en catalán donde se requiere baja latencia y ejecución en CPU.
- Prototipado de pipelines TTS: al ser un modelo ligero (x_low) con licencia MIT, sirve para validar arquitecturas de síntesis antes de migrar a variantes de mayor calidad.
- Integración en aplicaciones Python: mediante `TTSModelManager` de phoonnx, se puede cargar la voz y generar audio dentro de un pipeline de procesamiento de lenguaje natural en catalán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo x_low en ONNX, está pensado para ejecución en CPU.
- GPU recomendadas: no disponible; no requiere GPU para funcionar.
- Cabe en consumer GPU: sí, aunque no es necesario; está diseñado para CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ca_es-upc_pau-x_low-espeak | VITS (x_low) | ca-ES | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper ca_ES | VITS | ca-ES | MIT (según upstream) | ONNX | rhasspy/piper-voices |
| Modelos TTS catalanes comerciales | no disponible | ca-ES | propietaria | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en catalán (ca-ES); no soporta otros idiomas.
- La calidad es la de la variante x_low, la más baja de la familia Piper; puede presentar artefactos y menor naturalidad que variantes superiores.
- Requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento o con grafías ambiguas.
- No se dispone de información sobre sesgos del dataset de entrenamiento.
- Licencia MIT declarada por el upstream; conviene verificar los términos del repositorio rhasspy/piper-voices antes de uso comercial.
- No apto para tareas de razonamiento, generación de texto ni agentes; es únicamente un modelo TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-upc_pau-x_low-espeak
- Repositorio upstream: https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES/upc_pau/x_low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo: https://tigregotico.pt/demo
