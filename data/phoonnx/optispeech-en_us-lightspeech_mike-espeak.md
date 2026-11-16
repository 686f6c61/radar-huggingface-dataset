# Phoonnx/optispeech-en_us-lightspeech_mike-espeak

## Resumen

OptiSpeech-en_us-lightspeech_mike-espeak es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, desarrollado originalmente por mush42 dentro del proyecto OptiSpeech y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo emplea la arquitectura LightSpeech, una variante de FastSpeech pensada para reducir el coste computacional del decodificador y del generador de espectrogramas, y se distribuye en formato ONNX para su ejecución en CPU sin dependencias de GPU.

La particularidad de este paquete es su front-end de texto: la entrada no es texto plano, sino fonemas en alfabeto IPA generados mediante espeak-ng. Esto implica que el pipeline completo requiere un fonemizador externo (espeak-ng nativo o el port espyak que Phoonnx instala como extra) antes de invocar al modelo. El modelo está pensado para integrarse en asistentes de voz del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Con 22 descargas y sin likes en el momento de la consulta, se trata de un artefacto de nicho orientado a despliegues ligeros en entornos embebidos o servidores sin acelerador. Su relevancia radica en la combinación de licencia MIT, formato ONNX portable y una voz concreta (Mike) preempaquetada para su uso inmediato en pipelines de TTS de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightSpeech (familia OptiSpeech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

LightSpeech es una arquitectura de síntesis de voz no autorregresiva derivada de FastSpeech, que sustituye el decodificador Transformer por bloques convolucionales ligeros y aplica búsqueda de arquitectura neuronal (NAS) para optimizar la relación entre calidad y coste. El modelo genera directamente mel-espectrogramas a partir de la secuencia de fonemas, que posteriormente se convierten en waveform mediante un vocoder (no incluido en este paquete). Al ser un modelo empaquetado y exportado a ONNX, no se publican en la información disponible detalles sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineamiento como RLHF o DPO (no aplicables habitualmente a TTS).

La innovación práctica del paquete reside en el front-end: phoonnx delega la normalización y fonemización en la librería `scriptconv`, que utiliza `EspeakPhonemizer` para producir la secuencia IPA que consume el modelo. El autor advierte que el port espyak puede diferir de espeak-ng nativo en algunos fonemas, lo que puede provocar errores de pronunciación en ciertas palabras si no se instala espeak-ng del sistema.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto, previa fonemización con espeak-ng.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Ejecución sobre ONNX Runtime, lo que permite inferencia en CPU sin GPU.
- Integración con el ecosistema OVOS/Mycroft como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Normalización de texto y conversión a fonemas IPA mediante `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente de TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz domésticos en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en inglés con latencia baja al ejecutarse en CPU.
- Sistemas embebidos y dispositivos de bajo consumo: al distribuirse en ONNX y no requerir GPU, puede desplegarse en Raspberry Pi u otros SBC para interfaces de voz offline.
- Lectura de notificaciones y alertas: integrado en un pipeline que reciba texto (correos, mensajes, logs) y lo convierta en audio WAV mediante `synthesize_wav`, útil en sistemas de monitorización que avisan por voz.
- Generación de audiolibros o locuciones de prueba: para prototipado rápido de contenido en inglés sin coste de API, con la salvedad de que la calidad depende del vocoder que se acople aguas abajo.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla en inglés, ejecutándose localmente sin enviar datos a servicios externos.
- Pruebas de regresión en pipelines de TTS: al ser un artefacto versionado y reproducible en ONNX, sirve como referencia fija para comparar cambios en el front-end de fonemización (espeak-ng frente a espyak) y detectar regresiones de pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta sobre ONNX Runtime en CPU.
- GPU recomendadas: no necesarias; opcionalmente cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) si se configura el proveedor de ejecución correspondiente.
- Cabe en cualquier GPU consumer y en CPU: el tamaño del repositorio es de 0.0 GB según los metadatos, lo que sugiere un modelo muy ligero (LightSpeech está diseñado para serlo).
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| optispeech-en_us-lightspeech_mike-espeak | LightSpeech (OptiSpeech) | en-US | ONNX | MIT | Fonemas espeak IPA |
| Otros modelos de la colección OptiSpeech de Phoonnx | OptiSpeech (distintas variantes) | según variante | ONNX | MIT (según upstream) | Fonemas espeak IPA |
| Piper (referencia del ecosistema) | VITS / variantes | múltiples | ONNX | MIT / otras | Fonemas espeak |
| Coqui TTS (referencia general) | Tacotron, VITS, etc. | múltiples | PyTorch / ONNX | MPL-2.0 y otras | Texto o fonemas |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada para establecer una comparación cuantitativa con Piper o Coqui TTS.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin él, el pipeline no funciona. Con espyak pueden producirse errores de pronunciación en algunos fonemas.
- No incluye vocoder: la salida es mel-espectrograma y necesita un vocoder adicional para generar waveform final (el paquete phoonnx gestiona esta parte, pero conviene verificarlo en el despliegue).
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede generar prosodia incorrecta o pronunciaciones erróneas ante texto no normalizado o abreviaturas.
- Sesgos: no se documentan sesgos específicos, pero al ser una voz única (Mike) y entrenada presumiblemente con un corpus limitado, la variedad prosódica y de acentos es reducida.
- Licencia MIT declarada por el upstream (mush42/optispeech); permite uso comercial, pero conviene verificar la licencia del vocoder y de espeak-ng (GPL en el caso de espeak-ng) si se redistribuye el binario.
- Modelo de nicho con muy poca tracción (22 descargas, 0 likes): no hay evidencia de comunidad ni mantenimiento activo más allá del empaquetado.
- El tamaño del repositorio reportado (0.0 GB) impide estimar con precisión el consumo de memoria; verificar los pesos reales antes de desplegar en dispositivos con RAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-lightspeech_mike-espeak
- Upstream (mush42/optispeech, ONNX lightspeech en-us): https://huggingface.co/mush42/optispeech/tree/main/onnx/lightspeech/en-us
- Colección OptiSpeech para phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Model card de mush42/optispeech (referencia de licencia): https://huggingface.co/mush42/optispeech
