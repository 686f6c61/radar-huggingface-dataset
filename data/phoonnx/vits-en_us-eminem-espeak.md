# Phoonnx/vits-en_us-eminem-espeak

## Resumen

vits-en_us-eminem-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX del mismo nombre. El modelo original fue entrenado por simoniz0r y distribuido a través de su repositorio de voces para Piper; Phoonnx se limita a reempaquetarlo en formato ONNX y a publicarlo con el identificador `piper_community/simoniz0r/en-US_eminem`. La voz resultante imita el timbre del rapero Eminem, de ahí el sufijo del nombre.

El modelo resuelve un caso de uso muy específico: la generación de audio hablado en inglés estadounidense con una voz concreta y reconocible, dentro de un ecosistema open source (OVOS, phoonnx) que prioriza la ejecución local y la ausencia de dependencias de servicios en la nube. No es un modelo de propósito general ni compite con sistemas TTS neuronales de gran escala; es una voz empaquetada para un runtime concreto.

La relevancia actual es limitada pero clara para su nicho: permite integrar una voz personalizada en asistentes de voz autoalojados y aplicaciones Python que ya usan el stack de Phoonnx/OVOS. El repositorio ocupa 0,1 GB, no registra descargas ni likes en el momento de la consulta y se publicó el 16 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada en fonemas) |
| Tipos de cuantización | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Autor original | simoniz0r |
| Empaquetado por | Phoonnx |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por el texto, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, junto con un modelado de duración estocástico. Este diseño permite generar audio de forma no autorregresiva a partir de fonemas, lo que se traduce en una inferencia rápida y estable.

En este caso concreto no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de parámetros ni si se aplicaron etapas de ajuste fino con preferencias humanas. La model card solo indica la arquitectura, el autor original, el idioma y que la entrada es texto fonemizado mediante espeak-ng. El modelo se distribuye como pesos ONNX, lo que sugiere una conversión desde el formato original de Piper para su uso con el runtime de Phoonnx.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak en alfabeto IPA, con normalización de texto delegada a la librería scriptconv.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Ejecución local en CPU o GPU a través de ONNX Runtime, sin dependencia de servicios externos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No dispone de modo "thinking" ni capacidades multimodales.

## Casos de uso

- Asistentes de voz autoalojados con OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en la configuración del asistente para que responda con una voz concreta en inglés, sin enviar texto a servicios en la nube.
- Generación de audiolibros o contenido narrado en inglés con una voz característica: útil para demos, prototipos o contenido donde el timbre reconocible forma parte del atractivo.
- Pruebas de integración en pipelines TTS: al ser un modelo pequeño (0,1 GB) y ONNX, sirve para validar flujos de fonemización con espeak-ng y scriptconv antes de desplegar voces en producción.
- Aplicaciones educativas o de accesibilidad que necesiten lectura de texto en inglés en local, por ejemplo en entornos sin conectividad o con requisitos de privacidad estrictos.
- Desarrollo de plugins y extensiones para el ecosistema Phoonnx/OVOS: el modelo actúa como referencia para probar la carga de voces desde el gestor `TTSModelManager`.
- Demos en navegador mediante phoonnx.js: la colección de voces VITS de Phoonnx incluye un demo en vivo, y esta voz puede emplearse para experimentar con TTS en el cliente.
- Prototipado de videojuegos o aplicaciones interactivas que requieran una voz sintética en inglés con licencia permisiva (MIT) y sin coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, la huella de memoria es reducida y cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1060 o superior, RTX 3060, RTX 4090, A100, H100); no se especifican requisitos mínimos en la model card.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del modelo; también puede ejecutarse en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-eminem-espeak | VITS | en-US | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | según voz | MIT (según voz) | ONNX | Hugging Face (colección VITS) |
| Voces Piper originales de simoniz0r | VITS | en-US | según release upstream | ONNX | GitHub (simoniz0r/piper-voice-models) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: es una voz concreta (imitación de Eminem) y no un TTS generalista; su calidad y naturalidad no están documentadas con métricas objetivas.
- Solo inglés estadounidense: no soporta otros idiomas ni variantes regionales.
- Dependencia de espeak-ng: la fonemización debe realizarse con espeak-ng; si se usa el port espyak, la model card advierte de que algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o artefactos de audio en entradas fuera del dominio de entrenamiento.
- Licencia MIT declarada por el empaquetador, pero la model card remite a los términos del release upstream de simoniz0r; conviene verificar las condiciones originales antes de un uso comercial.
- Posibles sesgos acústicos derivados del dataset de entrenamiento original, no documentados.
- Sin datos de benchmarks, latencia ni calidad subjetiva: no se recomienda para producción sin una evaluación propia previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-eminem-espeak
- Release upstream de la voz: https://github.com/simoniz0r/piper-voice-models/releases/tag/eminem
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
