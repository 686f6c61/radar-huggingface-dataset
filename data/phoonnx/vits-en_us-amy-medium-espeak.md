# Phoonnx/vits-en_us-amy-medium-espeak

## Resumen

`vits-en_us-amy-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US/amy/medium` del repositorio `rhasspy/piper-voices`, y Phoonnx lo redistribuye en formato ONNX con una interfaz de uso propia. Resuelve el problema de generar audio inteligible en inglés estadounidense a partir de texto, con un tamaño de repositorio de 0,1 GB que lo hace muy ligero para despliegues en local o en dispositivos con recursos limitados.

La particularidad de este empaquetado es que la entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`). Es decir, el front-end fonemizador es externo al modelo y corre en Python mediante la librería `scriptconv`. Esto condiciona tanto la integración como la calidad de pronunciación: si el fonemizador y el modelo no comparten convenciones, algunas palabras pueden sonar mal.

Es relevante ahora por dos motivos: el ecosistema Piper/Rhasspy se ha consolidado como referencia de TTS ligero y offline, y Phoonnx está construyendo un catálogo de voces VITS empaquetadas con soporte en Python, OVOS y navegador (phoonnx.js). La licencia MIT y la ausencia de dependencias de servicios en la nube lo hacen atractivo para asistentes de voz y aplicaciones de accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |
| Autor del empaquetado | Phoonnx |
| Autor upstream | Rhasspy |

## Arquitectura y entrenamiento

El modelo emplea VITS, una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS se caracteriza por generar audio de forma directa desde fonemas sin necesidad de un vocoder separado en inferencia, lo que reduce la latencia y simplifica el pipeline. En este caso, el modelo se distribuye como grafo ONNX, lo que permite ejecución con runtime ONNX en Python o en el navegador vía phoonnx.js.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino adicional. El modelo original es la voz `amy/medium` de Piper, entrenada por Rhasspy; Phoonnx únicamente la empaqueta y la integra con su front-end de fonemización basado en espeak-ng. La innovación técnica destacable del empaquetado es la separación explícita entre fonemización (scriptconv + espeak-ng) y síntesis (ONNX), lo que permite sustituir el fonemizador, aunque a costa de posibles discrepancias si se usa espyak en lugar de espeak-ng.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con salida en WAV.
- Fonemización IPA mediante espeak-ng (recomendado) o espyak (port incluido en `phoonnx[espeak]`).
- Normalización y conversión de texto a la entrada del modelo mediante `scriptconv`.
- Ejecución en Python a través de `TTSModelManager` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step ni visión; es un modelo exclusivamente TTS.
- No soporta otros idiomas distintos del inglés estadounidense.

## Casos de uso

- Asistentes de voz offline en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/en_US-amy-medium` en `mycroft.conf`, de modo que el asistente sintetiza respuestas sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo es lo bastante ligero (0,1 GB) para empaquetarse con la aplicación y generar audio en local con latencia baja.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o herramientas de lectura de texto que requieran una voz femenina en inglés estadounidense con licencia permisiva.
- Generación de audio para pruebas automatizadas de pipelines de voz: al ser un modelo determinista y ligero, sirve para generar corpus sintéticos de audio en CI sin coste de API.
- Prototipado de interfaces conversacionales: permite iterar sobre guiones y respuestas de un bot en inglés antes de contratar un servicio TTS comercial.
- Aplicaciones web con TTS en el cliente: mediante phoonnx.js, el navegador puede sintetizar voz sin enviar texto a un servidor, útil por privacidad y por latencia.
- Sistemas embebidos y dispositivos de bajo consumo: el tamaño reducido y el formato ONNX permiten ejecución en Raspberry Pi y hardware similar, siempre que se instale espeak-ng.
- Generación de contenido educativo o podcasts sintéticos en inglés con voz consistente y control de pronunciación vía fonemas IPA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer; la inferencia puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se documentan requisitos mínimos. Para CPU, se recomienda al menos 2 núcleos modernos para síntesis en tiempo real.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX con soporte ONNX; también en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: ONNX Runtime vía phoonnx (Python), phoonnx.js (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.
- Dependencia externa: espeak-ng debe instalarse por separado (`apt install espeak-ng`) o usar el extra `phoonnx[espeak]` con espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-amy-medium-espeak` | VITS | en-US | MIT | ONNX | 0,1 GB | Empaquetado Phoonnx, entrada IPA espeak |
| `rhasspy/piper-voices` (amy/medium) | VITS | en-US | MIT | ONNX (upstream) | no disponible | Modelo original del que deriva este empaquetado |
| Otras voces VITS de la colección Phoonnx | VITS | variable | MIT (según upstream) | ONNX | variable | Mismo pipeline, distintas voces/idiomas |

No se dispone de datos de benchmarks que permitan comparar calidad objetiva (MOS, WER de síntesis) con alternativas como Coqui TTS o modelos TTS comerciales.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no es multilingüe.
- La calidad de pronunciación depende del fonemizador: con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng por separado si no se usa el extra `phoonnx[espeak]`.
- No se documentan sesgos específicos, pero al ser una voz única (femenina, en-US) no cubre diversidad de acentos o géneros.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir prosodia incorrecta o artefactos en textos con números, siglas o puntuación atípica si la normalización de scriptconv no los resuelve bien.
- La licencia MIT del upstream permite uso comercial, pero conviene verificar la licencia de los datos de entrenamiento originales de Piper, no documentada en esta ficha.
- No hay garantías de soporte a largo plazo por parte de Phoonnx; el proyecto es de un autor individual (TigreGotico).
- El modelo está pensado para TTS; no debe usarse para otras tareas (clasificación, ASR, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-amy-medium-espeak
- Upstream (Piper voices, amy/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/amy/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
