# Phoonnx/vits-te_in-padmavathi-medium-espeak

## Resumen

vits-te_in-padmavathi-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la librería ONNX homónima. El modelo original procede del proyecto Rhasspy, concretamente de la colección piper-voices, en la ruta te/te_IN/padmavathi/medium, y se distribuye con licencia MIT. Su función es convertir texto en telugu (te-IN) en audio inteligible, empleando fonemas generados por espeak-ng como entrada al sintetizador.

El modelo está pensado para integrarse en asistentes de voz y pipelines de TTS de baja latencia, especialmente en el ecosistema OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx. Al estar exportado a ONNX y empaquetado para phoonnx, puede ejecutarse tanto en Python como en el navegador a través de phoonnx.js, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su carácter práctico: es una voz multilingüe de tamaño medio (repo de 0,1 GB) para un idioma con poca cobertura en TTS comercial, con licencia permisiva y sin dependencia de APIs propietarias. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variacional, end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | telugu (te-IN) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia de duración. El modelo genera directamente la forma de onda a partir de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada de texto se convierte a fonemas IPA mediante espeak-ng, y el modelo se distribuye como grafo ONNX para inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (habitualmente no aplicables a TTS). El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices y posteriormente empaquetado por Phoonnx para su librería. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en telugu (te-IN).
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas espeak-ng en alfabeto IPA.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en telugu: el modelo puede integrarse en OVOS/Mycroft para leer respuestas del asistente en te-IN, usando el plugin ovos-tts-plugin-phoonnx y seleccionando la voz `piper/te_IN-padmavathi-medium` en `mycroft.conf`.
- Lectura de notificaciones y alertas: en aplicaciones de domótica o sistemas de aviso, el modelo sintetiza mensajes cortos en telugu con baja latencia gracias a su formato ONNX y tamaño reducido (0,1 GB).
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en telugu en aplicaciones de escritorio o web, usando phoonnx.js para ejecución en el navegador.
- Generación de audiolibros o contenido narrado: el modelo permite sintetizar pasajes largos en telugu, aunque la calidad y naturalidad no están documentadas en benchmarks públicos.
- Integración en pipelines de CI/CD para pruebas de TTS: al ser un modelo ONNX ligero, puede usarse en tests automatizados de síntesis de voz sin depender de servicios externos.
- Prototipado de interfaces conversacionales en telugu: desarrolladores que necesiten una voz funcional y con licencia MIT pueden desplegar este modelo en local para validar flujos de voz antes de invertir en modelos comerciales.
- Educación y aprendizaje de idiomas: generación de pronunciaciones de palabras o frases en telugu a partir de texto, con entrada fonémica controlada mediante espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (0,1 GB) sugiere que el modelo cabe holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer (p. ej., GTX 1650, RTX 3060) o incluso CPU es suficiente.
- ¿Cabe en consumer GPU? Sí, con alta probabilidad, dado el tamaño del repo.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS/Mycroft mediante ovos-tts-plugin-phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-te_in-padmavathi-medium-espeak (este modelo) | VITS | te-IN | no aplica | MIT | ONNX |
| Otras voces piper-voices (p. ej., espeak-based) | VITS | varios | no aplica | MIT (según upstream) | ONNX |
| Modelos TTS comerciales (p. ej., Google Cloud TTS, Azure TTS) | propietaria | múltiples | no aplica | propietaria | API |
| Coqui TTS (voces VITS) | VITS | varios | no aplica | MPL-2.0 / otras | varios |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado por Rhasspy, puede reflejar sesgos del corpus de entrenamiento original, no especificado.
- Riesgo de alucinación: en TTS, el equivalente es la generación de pronunciaciones incorrectas o artefactos de audio; la model card advierte que algunos fonemas de espyak difieren de espeak-ng y pueden producir palabras mal pronunciadas.
- Limitaciones de contexto o idioma: el modelo solo soporta telugu (te-IN); no es multilingüe. No se documenta la longitud máxima de texto de entrada.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices.
- Caveats para producción: requiere espeak-ng instalado (o el extra `phoonnx[espeak]`), lo que añade una dependencia externa; la calidad de voz no está validada con métricas públicas; el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-te_in-padmavathi-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/te/te_IN/padmavathi/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
