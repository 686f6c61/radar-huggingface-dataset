# aoiandroid/whisper-th-small-combined-whisperkit-coreml-ios

## Resumen

Este repositorio contiene una conversion a Core ML del modelo `biodatlab/whisper-th-small-combined`, un ajuste fino de `openai/whisper-small` especializado en reconocimiento automatico del habla (ASR) en tailandes. El autor es el usuario de HuggingFace `aoiandroid`, y el modelo se publica en formato Core ML con la disposicion de ficheros que espera WhisperKit (Argmax), pensado para ejecucion en dispositivos Apple. Se trata de una redistribucion sin modificacion de pesos mas alla de la conversion de formato, no de un entrenamiento nuevo.

El modelo resuelve la transcripcion de audio en tailandes sobre hardware Apple, aprovechando la arquitectura encoder-decoder de Whisper en su variante "small". Los pesos se exportan en float16, con una longitud de cache KV de 448 tokens en el decodificador. El proposito declarado es servir de espejo para un proyecto llamado TranslateBlue.

Su relevancia radica en que empaqueta un ajuste fino tailandes de calidad (con una mejora notable frente a Whisper small original en FLEURS th) en un formato listo para desplegar en iOS/macOS mediante WhisperKit, sin necesidad de infraestructura de servidor. El modelo base sobre el que se apoya lo desarrollo Mahidol University (biodatlab) partiendo de `openai/whisper-small`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small de OpenAI) |
| Parametros totales | Aproximadamente 244 M (arquitectura openai/whisper-small; no confirmado explicitamente en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio: 30 s por ventana (Whisper). Texto (cache KV del decodificador): 448 tokens |
| Tipos de cuantizacion | float16 (en la conversion Core ML). No se documentan otras cuantizaciones |
| Idiomas soportados | Tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`): `MelSpectrogram.mlmodelc`, `AudioEncoder.mlmodelc`, `TextDecoder.mlmodelc` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `openai/whisper-small`, un transformer encoder-decoder disenado para ASR que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El ajuste fino original (`biodatlab/whisper-th-small-combined`) fue entrenado para tailandes; segun la model card, ese ajuste se entreno, entre otros datos, con el split `train` de FLEURS, sin usar las utterances de test. No se detallan en la informacion proporcionada el numero total de tokens de entrenamiento ni la composicion completa del dataset, ni si hubo RLHF o DPO.

La aportacion de este repositorio es exclusivamente la conversion de formato a Core ML mediante `argmaxinc/whisperkittools` (commit `84f77a83`, comando `whisperkit-generate-model`). La calidad de la conversion torch a Core ML se reporta con PSNR: 56 en el decodificador y 66 en el encoder. Los pesos no se han modificado mas alla del cambio de formato. El paquete incluye `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json`, y omite `TextDecoderContextPrefill`, que es opcional en WhisperKit.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tailandes.
- Transcripcion de audio en ventanas de hasta 30 segundos por segmento (arquitectura Whisper).
- Ejecucion en dispositivos Apple mediante Core ML (layout WhisperKit), incluyendo potencial uso del Neural Engine.
- No se documenta soporte de traduccion de voz, tool calling, function calling ni capacidades de agente.
- No se documenta modo "thinking" ni multimodalidad (audio unicamente).
- Capacidad multilingue limitada: el modelo esta especializado en tailandes.

## Casos de uso

- Transcripcion de audio en tailandes en aplicaciones iOS/macOS: el modelo se entrega en formato Core ML con layout WhisperKit, por lo que puede integrarse en apps nativas Apple para transcribir voz sin enviar audio a un servidor.
- Subtitulado offline de contenido audiovisual tailandes: al ejecutarse localmente, permite generar subtitulos en dispositivos sin conexion, procesando clips de hasta 30 segundos por ventana.
- Notas de reunion en tailandes: transcripcion local de conversaciones para generar actas o resumenes, aprovechando la mejora del ajuste fino frente a Whisper small original (cobertura 0.933 frente a 0.838 en FLEURS th segun los datos aportados).
- Dictado por voz en tailandes en apps de productividad: el modelo puede alimentar funcionalidades de entrada de texto por voz en entornos Apple.
- Preprocesado de audio para pipelines de NLP: convertir audio tailandes a texto antes de aplicar analisis de sentimiento, busqueda o clasificacion.
- Prototipado e investigacion en ASR tailandes: sirve como referencia reproducible en formato Core ML para comparar contra otras variantes de Whisper.
- Integracion en un producto de traduccion (el proposito declarado es el proyecto TranslateBlue): transcripcion del audio original como primer paso de un flujo de traduccion.

## Benchmarks y rendimiento

Datos aportados en la model card (evaluacion en Mac, offline, fechada el 2026-09-30). La metrica "coverage" es la cobertura ponderada por frecuencia de los tokens de contenido de la transcripcion frente a la referencia (en tailandes, 1-/2-gramas de caracteres), con clips de 60 s y decodificacion greedy con un fallback a temperatura 0,2.

| Modelo | FLEURS th, clips de 60 s (5, media / minimo) | Clip de noticias en tailandes de 60 s |
|---|---|---|
| Este paquete Core ML | 0.933 / 0.864 | 0.978 |
| biodatlab/whisper-th-small-combined (PyTorch) | 0.933 / 0.872 | 0.978 |
| openai/whisper-small | 0.838 / 0.811 | 0.865 |
| openai/whisper-base | 0.739 / 0.615 | 0.780 |

Ademas, se reporta el CER en FLEURS th test (200 utterances, PyTorch): 0.100 para el ajuste fino frente a 0.239 para `openai/whisper-small`. La propia model card advierte que el ajuste fino se entreno con el split `train` de FLEURS, sin usar las utterances de test.

## Requisitos de hardware

- Orientado a hardware Apple: la conversion Core ML esta pensada para ejecucion en iPhone, iPad y Mac mediante WhisperKit y el Neural Engine.
- Tamano del repositorio: aproximadamente 0,5 GB (pesos en float16), lo que facilita su empaquetado en una aplicacion movil.
- VRAM/RAM estimada para inferencia: no disponible de forma explicita; el uso de float16 y un modelo de ~244 M de parametros sugiere un consumo de memoria moderado, apto para gama alta de dispositivos Apple.
- Despliegue: WhisperKit (layout Core ML). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto generativo estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada (la evaluacion reportada se centra en calidad de transcripcion, no en velocidad).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento FLEURS th (coverage media, 60 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aoiandroid/whisper-th-small-combined-whisperkit-coreml-ios | Core ML (Whisper small ajustado) | ~244 M | 30 s audio / 448 tokens KV | 0.933 | Apache 2.0 | HuggingFace (Core ML) |
| biodatlab/whisper-th-small-combined | PyTorch (Whisper small ajustado) | ~244 M | 30 s audio | 0.933 | Apache 2.0 | HuggingFace (PyTorch) |
| openai/whisper-small | PyTorch (Whisper small) | ~244 M | 30 s audio | 0.838 | Apache 2.0 / MIT | HuggingFace, OpenAI |
| openai/whisper-base | PyTorch (Whisper base) | ~74 M | 30 s audio | 0.739 | Apache 2.0 / MIT | HuggingFace, OpenAI |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en tailandes; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Ventana de audio limitada a 30 segundos por segmento (limitacion heredada de Whisper); requiere segmentacion para audios largos.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en audio con ruido, silencios prolongados o acentos no cubiertos por el entrenamiento.
- Posible sesgo hacia el dominio de los datos de entrenamiento (FLEURS y fuentes combinadas); el rendimiento en dominios muy especificos puede degradarse.
- Caveat metodologico: el ajuste fino se entreno con datos de FLEURS `train`; parte de la ventaja frente a Whisper small puede reflejar solapamiento con el dominio de evaluacion.
- La licencia es Apache 2.0, lo que permite uso comercial, pero se recomienda atribuir a biodatlab (Mahidol University) y a OpenAI, tal como indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la informacion, y es una redistribucion no oficial (mirror); no cuenta con validacion de la comunidad.
- No dispone de `TextDecoderContextPrefill` (opcional en WhisperKit), lo que podria afectar a ciertos flujos que lo requieran.
- Solo ejecutable en el ecosistema Apple dentro de WhisperKit/Core ML; no es directamente portable a otros runtimes sin reconversion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/whisper-th-small-combined-whisperkit-coreml-ios
- Modelo base (ajuste fino tailandes): https://huggingface.co/biodatlab/whisper-th-small-combined
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Herramienta de conversion (whisperkittools): https://github.com/argmaxinc/whisperkittools
