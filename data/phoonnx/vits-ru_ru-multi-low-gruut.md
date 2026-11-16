# Phoonnx/vits-ru_ru-multi-low-gruut

## Resumen

vits-ru_ru-multi-low-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su motor de voces Mimic3 y empaquetado posteriormente por Phoonnx en formato ONNX para su librería de TTS. El modelo convierte texto en ruso (ru-RU) a audio, tomando como entrada fonemas generados mediante el fonemizador gruut en alfabeto IPA. La variante "multi_low" indica una configuración de baja calidad o tamaño reducido dentro del catálogo de voces de Mimic3, orientada a entornos con recursos limitados.

El modelo resuelve la necesidad de disponer de una voz rusa ligera y ejecutable localmente en pipelines de síntesis de voz, sin dependencia de servicios en la nube. Su empaquetado para phoonnx permite integrarlo tanto en Python como en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo hace relevante para asistentes de voz de código abierto y despliegues en dispositivos de borde.

Con un tamaño de repositorio de 0,1 GB, se trata de un modelo compacto, adecuado para inferencia en CPU. La licencia CC-BY-SA-4.0 del proyecto upstream (MycroftAI/mimic3-voices) impone condiciones de atribución y compartición bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante "low") |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El modelo genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia. La entrada de texto se procesa mediante gruut, que normaliza el texto y lo convierte a fonemas en alfabeto IPA antes de alimentar el modelo.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El modelo procede del repositorio MycroftAI/mimic3-voices, en la ruta `voices/ru_RU/multi_low`, lo que sugiere que forma parte de un conjunto de voces entrenadas por Mycroft AI para su motor Mimic3. La etiqueta "multi_low" indica una variante de menor calidad o tamaño dentro de ese catálogo.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso (ru-RU) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (extra `scriptconv[gruut]`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración en el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Ejecución local en formato ONNX, sin dependencia de servicios externos.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-step: es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz de código abierto: integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `mimic3/ru_RU/multi_low` en `mycroft.conf` para respuestas habladas en ruso.
- Síntesis de voz en dispositivos de borde: al ser un modelo compacto (0,1 GB) en ONNX, puede ejecutarse en CPU en hardware de bajos recursos, como Raspberry Pi u otros dispositivos embebidos.
- Generación de audiolibros o contenido narrado en ruso: el modelo puede sintetizar texto largo por fragmentos y ensamblar los WAV resultantes en un pipeline propio.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos rusoparlantes.
- Sistemas de anuncios automatizados: generación de avisos o mensajes de voz en ruso para aplicaciones de domótica, transporte o atención telefónica básica.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado para phoonnx y scriptconv, sirve como voz de referencia para validar flujos de normalización de texto y fonemización en ruso antes de adoptar modelos de mayor calidad.
- Investigación en TTS: comparación de la calidad de una variante "low" frente a otras voces VITS del catálogo de Mimic3 para estudiar el compromiso entre tamaño y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX compacto (0,1 GB de repositorio), es probable que la inferencia se realice en CPU sin necesidad de GPU, aunque no se confirman cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamaño reducido sugieren viabilidad en CPU, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ru_ru-multi-low-gruut | VITS | ruso (ru-RU) | 0,1 GB (repo) | CC-BY-SA-4.0 | ONNX |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no disponible | variable | ONNX |
| Voces de MycroftAI/mimic3-voices (upstream) | VITS | varios | no disponible | CC-BY-SA-4.0 | variable |

No se dispone de datos de rendimiento comparativo (benchmarks) entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en síntesis de voz: no genera texto, código ni realiza razonamiento.
- Idioma limitado al ruso (ru-RU); no soporta otros idiomas.
- La variante "low" implica una calidad de audio reducida en comparación con variantes de mayor tamaño del mismo catálogo.
- La licencia CC-BY-SA-4.0 exige atribución y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar el uso comercial.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el origen de las voces utilizadas.
- No hay datos publicados sobre latencia, throughput ni calidad objetiva (MOS) en la información disponible.
- El modelo depende del fonemizador gruut y de la librería scriptconv para la conversión de texto a fonemas; cambios en esas dependencias pueden afectar al funcionamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-multi-low-gruut
- Upstream (MycroftAI/mimic3-voices, voz ru_RU/multi_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/ru_RU/multi_low
- phoonnx (librería TTS ONNX): https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
