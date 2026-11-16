# Phoonnx/vits-ro_ro-mihai-medium-espeak

## Resumen

vits-ro_ro-mihai-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en rumano (ro-RO) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz neuronal ligera y de licencia permisiva (MIT) para un idioma con relativamente poca cobertura en el ecosistema TTS abierto.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo situa en la categoria de voces "medium" de Piper: calidad razonable con un coste computacional bajo, apto para ejecucion en CPU y en dispositivos con recursos limitados. No es un modelo de lenguaje generativo ni un sistema multimodal: su unico proposito es la sintesis de voz a partir de texto.

Al estar integrado en el ecosistema phoonnx, puede utilizarse tanto desde Python como mediante el plugin `ovos-tts-plugin-phoonnx` en asistentes OVOS/Mycroft. La ficha siguiente recoge unicamente los datos disponibles en la informacion proporcionada; los campos no documentados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, longitud no especificada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | rumano (ro-RO) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de ejecucion | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz neuronal de tipo end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial en un esquema de entrenamiento condicional variacional (conditional VAE) con alineamiento monotono aprendido. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado en tiempo de inferencia. En este caso concreto, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que implica que la calidad de la sintesis depende de la correccion de la fonemizacion previa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otros ajustes posteriores. El modelo procede del repositorio `rhasspy/piper-voices` (ruta `ro/ro_RO/mihai/medium`), que agrupa voces Piper entrenadas para distintos idiomas y calidades. Phoonnx se limita a empaquetar esos pesos en formato ONNX y a integrarlos en su libreria, por lo que las innovaciones tecnicas del modelo son las propias de VITS y de la receta de entrenamiento de Piper, no de este empaquetado.

## Capacidades

- Sintesis de voz a partir de texto en rumano (ro-RO), con salida en fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversion de texto a fonemas IPA mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, con normalizacion de texto previa a cargo de scriptconv.
- Ejecucion en Python a traves de `phoonnx.model_manager.TTSModelManager`, con carga de voces por identificador (`piper/ro_RO-mihai-medium`).
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode (demo disponible en tigregotico.pt/demo).
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- Capacidad multilingue: limitada al rumano; no se documentan otras lenguas para esta voz.

## Casos de uso

- Asistentes de voz en rumano: el modelo puede integrarse en OVOS/Mycroft como motor TTS para responder a comandos de voz, seleccionandolo en `mycroft.conf` con el identificador `piper/ro_RO-mihai-medium`. Su tamano reducido permite ejecucion local en dispositivos de bajos recursos.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a audio para personas con discapacidad visual en entornos rumanoparlantes, con latencia baja al ser un modelo ONNX ligero.
- Generacion de narraciones para audiolibros o podcasts de forma automatizada: sintesis por frases mediante `synthesize_wav`, concatenando los WAV resultantes en un pipeline de postproduccion.
- Locuciones para sistemas de megafonia o avisos automatizados en entornos cerrados (transporte, comercio, administracion) donde se requiera una voz rumana sintetica y se prefiera una licencia permisiva.
- Prototipado de interfaces conversacionales en rumano: al ser MIT y ejecutable en CPU, permite iterar rapidamente en el diseno de flujos de voz sin costes de API.
- Integracion en aplicaciones web mediante phoonnx.js: sintesis en el navegador con entrada espeak o unicode, util para demos y herramientas educativas de pronunciacion rumana.
- Generacion de datos de audio sintetico para pruebas de pipelines de ASR en rumano, siempre que se respete la licencia MIT y se documente el origen sintetico de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un artefacto ONNX de aproximadamente 0,1 GB, la huella de memoria es muy reducida y cabe holgadamente en GPU consumer.
- GPU recomendadas: no se especifican; por el tamano del modelo, cualquier GPU con al menos unos pocos GB de memoria libre es suficiente, e incluso la ejecucion en CPU es viable.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, dado el reducido tamano del artefacto.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft) y phoonnx.js (navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ro_ro-mihai-medium-espeak (este modelo) | VITS | ro-RO | 0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper `ro_RO` (p. ej. variantes de `rhasspy/piper-voices`) | VITS | ro-RO | no disponible | MIT (segun upstream) | ONNX (segun upstream) | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | MIT (segun upstream) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo sintetiza rumano (ro-RO); no admite otros idiomas ni cambio de voz.
- La calidad depende criticamente de la fonemizacion con espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- No se documentan sesgos especificos, pero al ser una voz sintetica entrenada con datos no descritos, puede presentar sesgos de pronunciacion o prosodia no evaluados.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta de palabras fuera del dominio de entrenamiento; no aplica el concepto de alucinacion textual propio de los LLM.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda verificar la declaracion de licencia del upstream (`rhasspy/piper-voices`) y conservar los avisos de copyright correspondientes.
- No apta para tareas de razonamiento, generacion de texto, codigo, vision ni agentes; su uso esta acotado a TTS.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ro_ro-mihai-medium-espeak
- Upstream (Piper voices, ro_RO/mihai/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/ro/ro_RO/mihai/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
