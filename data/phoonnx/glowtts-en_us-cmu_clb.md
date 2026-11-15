# Phoonnx/glowtts-en_us-cmu_clb

## Resumen

glowtts-en_us-cmu_clb es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS. El modelo convierte texto en ingles estadounidense, previamente normalizado y fonemizado con gruut (alfabeto IPA), en un espectrograma que posteriormente es transformado en audio por el vocoder hifigan-multi-vctk-small. Se trata, por tanto, de un sistema TTS de dos etapas: un modelo acustico Glow-TTS y un vocoder neuronal separado.

El modelo esta pensado para sintesis de voz ligera y desplegable en entornos con recursos limitados, ya que el repositorio completo ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato ONNX. Su integracion principal es la libreria phoonnx, que lo expone tanto en Python como mediante el plugin `ovos-tts-plugin-phoonnx` para el ecosistema OVOS (Open Voice OS), lo que lo hace adecuado para asistentes de voz locales y embebidos.

La relevancia de esta ficha radica en que se trata de un modelo de nicho, con muy pocas descargas (29 en el momento de la consulta) y sin resultados de benchmarks publicados. Su licencia figura como "other" y la propia model card advierte de que no hay licencia registrada, por lo que su uso comercial requiere verificar el release original de Larynx antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico) + vocoder HiFi-GAN (hifigan-multi-vctk-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en normalizing flows que modela directamente la alineacion entre texto y espectrograma sin necesidad de un alineador externo (como el attention de Tacotron 2), lo que permite una sintesis mas rapida y monotona en la duracion. El modelo genera un espectrograma mel a partir de la secuencia de fonemas IPA proporcionada por gruut, y ese espectrograma se convierte en forma de onda mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que phoonnx descarga automaticamente junto con la voz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan recogidos en la model card. El modelo procede del release v1.0 de Larynx de Rhasspy (`en-us_cmu_clb-glow_tts.tar.gz`), un proyecto de sintesis de voz local orientado a asistentes. La innovacion tecnica destacable es su empaquetado en ONNX para inferencia portable y su integracion con el front-end de texto de scriptconv, que realiza normalizacion y fonemizacion antes de la sintesis.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense (en-US) a partir de texto plano.
- Normalizacion y conversion de texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generacion de espectrogramas mel con Glow-TTS y conversion a audio WAV con el vocoder HiFi-GAN.
- Integracion en Python mediante `TTSModelManager` y el metodo `synthesize_wav`.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo sintesis offline sin dependencia de servicios en la nube.
- Sistemas embebidos y dispositivos de bajos recursos: con un repositorio de 0,1 GB y pesos ONNX, es viable en Raspberry Pi y hardware similar donde otros TTS no caben.
- Lectura de notificaciones y alertas: sintesis de frases cortas en ingles para avisos de sistemas domoticos o industriales, gracias a la baja latencia esperada de un modelo Glow-TTS.
- Generacion de audiolibros o contenido narrado en ingles: el modelo produce WAV a partir de texto normalizado, adecuado para pipelines de narracion por lotes.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en ingles sin coste de API, integrandose en scripts Python con `synthesize_wav`.
- Pruebas de accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en entornos controlados en ingles.
- Evaluacion comparativa de vocoders: al estar separado el modelo acustico del vocoder HiFi-GAN, sirve para experimentar con distintos vocoders sobre el mismo espectrograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se espera un consumo muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; el modelo esta empaquetado en ONNX y puede ejecutarse en CPU, por lo que GPUs consumer como RTX 3060 o superiores son mas que suficientes si se desea aceleracion.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con unos pocos GB de VRAM; tambien en CPU.
- Opciones de despliegue: libreria phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS; al ser ONNX, es compatible con runtimes ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_clb | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Empaquetado para phoonnx/OVOS |
| Otras voces Larynx de Rhasspy | Glow-TTS + vocoder | Multiples (segun voz) | Diversos | Segun release Larynx | Mismo origen upstream |
| Modelos TTS de Hugging Face (p. ej. VITS, SpeechT5) | VITS / SpeechT5 | Multiples | Safetensors / ONNX | Variables | No disponibles datos concretos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: la model card advierte explicitamente de que se debe verificar el release upstream de Larynx antes de usar el modelo, especialmente en contextos comerciales.
- Idioma unico: solo soporta ingles estadounidense (en-US); no es util para castellano ni otros idiomas.
- Dependencia del front-end: requiere el fonemizador gruut y la libreria scriptconv para la normalizacion y conversion a IPA; sin ellos el modelo no recibe la entrada adecuada.
- Dependencia del vocoder: la calidad final depende de `hifigan-multi-vctk-small`, que phoonnx descarga por separado.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o siglas no normalizadas.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con un corpus concreto (CMU CLB), la voz resultante refleja las caracteristicas de ese hablante y corpus.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (MOS, WER) en la informacion disponible.
- Baja adopcion: 29 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_clb
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_clb-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
