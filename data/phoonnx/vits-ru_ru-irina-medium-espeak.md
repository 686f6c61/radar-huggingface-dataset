# Phoonnx/vits-ru_ru-irina-medium-espeak

## Resumen

vits-ru_ru-irina-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la voz `ru_RU/irina/medium` del repositorio piper-voices, y ha sido reempaquetado para su uso con la librería `phoonnx` y el ecosistema OVOS. Está especializado en la síntesis de voz en ruso (ru-RU) con una voz femenina identificada como "irina".

El modelo resuelve el problema de la síntesis de voz offline y ligera para ruso: al estar en formato ONNX y con un tamaño de repositorio de 0,1 GB, está pensado para ejecutarse en entornos con recursos limitados, incluidos dispositivos de borde, asistentes de voz locales y navegadores (mediante phoonnx.js). Su pipeline es text-to-speech y la entrada de texto se realiza a través de fonemas espeak en alfabeto IPA, lo que requiere espeak-ng o el port espyak para la fonemización previa.

La relevancia de esta ficha es limitada en el contexto de modelos de lenguaje: se trata de un modelo acústico de TTS de tamaño medio, no de un LLM, por lo que no dispone de parámetros de contexto, razonamiento ni tool calling. Su interés radica en el despliegue de síntesis de voz rusa en pipelines locales y en el ecosistema de asistentes de voz open source (OVOS/Mycroft).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador acústico basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en la inferencia, lo que reduce la latencia y simplifica el despliegue.

El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices, orientado a voces ligeras y offline para asistentes de voz. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable es su empaquetado para phoonnx, que permite ejecución en Python, en OVOS y en el navegador mediante phoonnx.js, con entrada de fonemas espeak o Unicode.

## Capacidades

- Síntesis de voz en ruso (ru-RU) a partir de texto, con voz femenina "irina" de calidad media.
- Generación de audio WAV mediante `voice.synthesize_wav` en la API de phoonnx.
- Fonemización de entrada mediante espeak-ng (o el port espyak) a fonemas IPA.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js, con demo en vivo.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del ruso.

## Casos de uso

- Asistentes de voz locales en ruso: el modelo puede integrarse en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico offline, sin depender de servicios en la nube, gracias a su tamaño reducido (0,1 GB) y formato ONNX.
- Síntesis de voz en dispositivos de borde: al ejecutarse con ONNX y phoonnx, es adecuado para Raspberry Pi u otros dispositivos con recursos limitados donde no cabe un modelo TTS de mayor tamaño.
- Lectura de textos en aplicaciones web: mediante phoonnx.js se puede sintetizar voz rusa directamente en el navegador, útil para accesibilidad, lectores de artículos o interfaces conversacionales.
- Generación de audiolibros o avisos pregrabados en ruso: la API `synthesize_wav` permite generar ficheros WAV por lotes para contenido de audio estático.
- Prototipado de pipelines de TTS en Python: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` facilitan pruebas rápidas de síntesis en entornos de desarrollo.
- Integración en sistemas de atención al cliente por voz en ruso: para respuestas habladas pregrabadas o dinámicas en IVR, siempre que la calidad media de la voz sea suficiente para el caso de uso.
- Pruebas de accesibilidad y localización: verificación de pronunciación de textos rusos con fonemas espeak antes de desplegar una voz de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; al ser un modelo ONNX de pequeño tamaño, no requiere GPU dedicada para funcionar, aunque una GPU puede reducir la latencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y navegador mediante phoonnx.js. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ru_ru-irina-medium-espeak (este) | VITS | ru-RU | 0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices ru_RU/irina/medium | VITS | ru-RU | no disponible | MIT (segun upstream) | no disponible | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no disponible | MIT | ONNX | Hugging Face (coleccion VITS de Phoonnx) |

La comparativa se limita al ecosistema Piper/Phoonnx, ya que no se dispone de datos de benchmarks ni de otros modelos TTS rusos en la información proporcionada. El modelo es esencialmente un reempaquetado de la voz upstream de Rhasspy, por lo que su calidad acústica es la misma que la del original.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza generación de texto, razonamiento, código ni matemáticas; no debe evaluarse como un LLM.
- Solo soporta ruso (ru-RU); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la model card.
- Calidad de voz "medium": no es una voz de alta fidelidad; puede no ser adecuada para producciones de audio profesionales.
- Riesgo de errores de pronunciación en palabras fuera del dominio de entrenamiento, nombres propios y siglas, al depender de la fonemización automática.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices, ya que la model card indica que el upstream declara MIT.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de calidad objetivas; no se puede cuantificar su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy reducido y poca validación comunitaria.
- Fecha de creación y actualización del repositorio (2026-11-16) posterior a la fecha habitual de consulta; conviene verificar la vigencia del empaquetado.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-irina-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/irina/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
