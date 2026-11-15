# Phoonnx/vits-en_us-hfc_male-medium

## Resumen

vits-en_us-hfc_male-medium es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de Rhasspy, concretamente de la colección piper-voices en la ruta `en/en_US/hfc_male/medium`, y Phoonnx lo redistribuye en formato ONNX listo para su consumo desde Python y desde el ecosistema OVOS. La voz es masculina, de calidad "medium" y está orientada exclusivamente al inglés estadounidense (en-US).

El modelo resuelve el problema de la síntesis de voz local y de baja latencia: al estar en formato ONNX y tener un tamaño de repositorio de 0,1 GB, puede ejecutarse en CPU sin depender de servicios en la nube. La entrada de texto no es texto plano directo, sino fonemas generados por espeak-ng en alfabeto IPA, lo que exige instalar espeak-ng (o el extra `phoonnx[espeak]`) para que el front-end de texto funcione correctamente.

Es relevante para desarrolladores que necesitan un motor TTS ligero, con licencia MIT, integrable en asistentes de voz, sistemas de accesibilidad o pipelines de audio en producción, y que prefieran un modelo de pesos abiertos frente a APIs propietarias. La información pública disponible es escasa: no se detallan parámetros, contexto ni datos de entrenamiento más allá de la arquitectura VITS y el origen upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no acepta contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes de cuantización) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder externo separado, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las propias de VITS. La model card indica que el modelo upstream es de Rhasspy, dentro de piper-voices, y que Phoonnx se limita a empaquetarlo para su librería ONNX. La calidad declarada es "medium" según la ruta upstream, pero no se aportan métricas objetivas de calidad (MOS, WER, etc.).

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US), con salida en formato WAV.
- Generación de audio local sin dependencia de servicios en la nube, gracias al formato ONNX.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a través de phoonnx.js, que ejecuta voces VITS con entrada espeak o unicode.
- Normalización y conversión de texto mediante la librería scriptconv, que transforma el texto en fonemas IPA para el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al inglés estadounidense; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales: el modelo puede sintetizar respuestas en un asistente tipo OVOS seleccionándolo en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, sin enviar texto a servicios externos y con un repositorio de solo 0,1 GB.
- Sistemas de accesibilidad: lectura en voz alta de contenido textual en aplicaciones de escritorio o web, ejecutando el modelo en CPU y en local gracias al formato ONNX.
- Generación de audiolibros o narraciones: síntesis por lotes de textos largos en inglés estadounidense, troceando el texto en frases y concatenando los WAV resultantes.
- Integración en pipelines de CI/CD para pruebas de audio: generación automática de clips de voz de referencia en tests de regresión de sistemas de reconocimiento de voz o de diálogo.
- Prototipado de interfaces conversacionales: creación rápida de demos de voz masculina en inglés sin coste de API, usando phoonnx en Python o phoonnx.js en el navegador.
- Sistemas de megafonía o avisos automatizados: síntesis de mensajes pregrabados en inglés estadounidense en entornos con recursos limitados, al poder ejecutarse en CPU.
- Educación y aprendizaje de idiomas: generación de pronunciaciones de referencia en en-US a partir de fonemas IPA controlados por el desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB de repositorio, es previsible que quepa en memoria de CPU y en GPUs de gama baja, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no se documenta explícitamente, pero el tamaño del repositorio (0,1 GB) sugiere que puede ejecutarse en hardware de consumo; no hay confirmación oficial.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en el navegador.
- Latencia y throughput estimados: no disponibles.
- Dependencia adicional: espeak-ng (o el extra `phoonnx[espeak]`) para la fonemización; sin él, el front-end de texto no funciona correctamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-hfc_male-medium (Phoonnx) | VITS | en-US | MIT | ONNX | no aplica | Hugging Face, 28 descargas |
| rhasspy/piper-voices (en_US/hfc_male/medium) | VITS | en-US | MIT (según upstream) | Piper (ONNX) | no aplica | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | variable | MIT | ONNX | no aplica | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al ser una voz sintética masculina en inglés estadounidense, puede no representar adecuadamente otras variedades dialectales o de género.
- Riesgo de alucinación: en TTS el riesgo se traduce en pronunciaciones incorrectas o artefactos de audio; la model card advierte que con espyak algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal ciertas palabras.
- Limitaciones de idioma: solo soporta en-US; no se debe usar para otros idiomas sin validación previa.
- Dependencia de espeak-ng: sin espeak-ng instalado, el front-end de texto no funciona; la alternativa espyak puede degradar la pronunciación.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices antes de redistribuir.
- Caveat para producción: la información pública es muy escasa (28 descargas, 0 likes, sin benchmarks); se recomienda evaluar la calidad de audio con un conjunto de prueba propio antes de desplegar.
- No es un modelo de lenguaje: no acepta contexto largo ni instrucciones; su única función es convertir texto (fonemas) en audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hfc_male-medium
- Upstream (Rhasspy piper-voices, en_US/hfc_male/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/hfc_male/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
