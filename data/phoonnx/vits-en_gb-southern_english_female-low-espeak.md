# Phoonnx/vits-en_gb-southern_english_female-low-espeak

## Resumen

El modelo `vits-en_gb-southern_english_female-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. Concretamente, se trata de la voz `en_GB/southern_english_female/low` del repositorio `rhasspy/piper-voices`, reexportada en formato ONNX para su uso con la librería `phoonnx` y su integración en el ecosistema OVOS (Open Voice OS).

El modelo resuelve el problema de la síntesis de voz local y ligera para inglés británico con acento del sur de Inglaterra y voz femenina. Al estar en formato ONNX y tener un tamaño de repositorio de 0,1 GB, está pensado para inferencia en CPU y dispositivos de recursos limitados, sin dependencia de GPUs ni de servicios en la nube. La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, lo que requiere el fonemizador `espeak-ng` o el puerto `espyak` incluido en el extra `phoonnx[espeak]`.

Su relevancia actual radica en que forma parte de una colección creciente de voces VITS empaquetadas para phoonnx, una alternativa ligera y de código abierto (licencia MIT) a los sistemas TTS comerciales, especialmente útil en asistentes de voz embebidos, domótica y aplicaciones OVOS. No obstante, la información publicada es muy escasa: no se detallan parámetros, contexto ni datos de entrenamiento más allá de la procedencia upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del upstream Piper) |
| Idiomas soportados | en-GB (ingles britanico, acento del sur de Inglaterra) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor upstream | Rhasspy (piper-voices) |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un predictor de duraciones, un normalizing flow y un decoder basado en HiFi-GAN para generar waveform directamente a partir de fonemas. La variante empaquetada corresponde al nivel de calidad "low" del upstream Piper, lo que implica un modelo de menor tamano y menor coste computacional orientado a inferencia en tiempo real en CPU.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). El modelo upstream fue entrenado por Rhasspy dentro del proyecto Piper; esta ficha no incluye detalles adicionales sobre el proceso de entrenamiento. La innovacion destacable es el empaquetado en ONNX para phoonnx, que permite ejecutar la voz en Python y en OVOS, y en el navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles britanico con acento del sur de Inglaterra y voz femenina.
- Generacion de audio WAV a partir de texto mediante fonemizacion espeak (IPA).
- Ejecucion local en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Integracion con OVOS como plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- Normalizacion y conversion de texto mediante la libreria scriptconv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS mediante `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas del asistente en ingles britanico con voz femenina, ejecutandose en CPU en dispositivos de bajos recursos.
- Domotica y dispositivos IoT con anuncios por voz: al ser un modelo ONNX de 0,1 GB, puede desplegarse en Raspberry Pi y hardware similar para leer notificaciones, estados de sensores o alertas en ingles.
- Lectura de textos y accesibilidad: sintesis de documentos o contenido web para usuarios con discapacidad visual, con una voz concreta y consistente en ingles britanico.
- Generacion de audiolibros o podcasts de bajo coste: el modelo permite convertir texto a audio de forma local y por lotes, sin costes por caracter ni dependencia de APIs externas.
- Prototipado rapido de interfaces de voz: la instalacion via `pip install --pre phoonnx` y la API `voice.synthesize_wav` permiten integrar TTS en prototipos Python en pocos minutos.
- Pruebas y desarrollo de pipelines TTS en el navegador: mediante phoonnx.js se puede validar la voz en aplicaciones web sin backend, usando la demo publica como referencia.
- Generacion de voces para videojuegos o contenido interactivo: al ser MIT, se puede integrar en productos comerciales con requisitos de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que funcione en CPU sin GPU dedicada, pero no se publican cifras oficiales.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia en CPU.
- Compatibilidad con GPU consumer: no disponible; no se documenta soporte GPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.
- Dependencias: espeak-ng (o el extra `phoonnx[espeak]` con espyak) para la fonemizacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-en_gb-southern_english_female-low-espeak (este) | VITS | en-GB | ONNX | MIT | 0,1 GB | Empaquetado para phoonnx, entrada espeak IPA |
| rhasspy/piper-voices (upstream en_GB southern_english_female low) | VITS | en-GB | ONNX (Piper) | MIT | no disponible | Modelo original del que deriva este empaquetado |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (segun upstream) | variable | Misma libreria, distintas voces e idiomas |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB) con acento del sur de Inglaterra y voz femenina; no es multilingue ni permite cambiar de voz dentro del mismo modelo.
- Requiere fonemizacion previa con espeak-ng o espyak; algunos fonemas de espyak difieren de espeak-ng y pueden provocar pronunciaciones incorrectas de ciertas palabras.
- Al ser la variante "low" del upstream, la calidad de audio es inferior a las variantes de mayor calidad de Piper.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de voz concretos puede presentar sesgos de acento, prosodia o estilo limitados a la voz de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido de texto generado, pero si puede producir pronunciaciones erroneas o prosodia inadecuada ante texto fuera de dominio o fonemas mal formados.
- No se documentan limitaciones de longitud de entrada; el modelo procesa frases, no documentos completos en una sola llamada.
- Licencia MIT declarada por el upstream, lo que permite uso comercial, pero se recomienda verificar la licencia del repositorio original `rhasspy/piper-voices` antes de produccion.
- El modelo tiene muy pocas descargas (21) y ningun "like", por lo que la validacion comunitaria es practicamente nula.
- No se dispone de informacion sobre el proceso de entrenamiento, dataset ni evaluacion, lo que dificulta auditar su calidad y comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-southern_english_female-low-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/southern_english_female/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
