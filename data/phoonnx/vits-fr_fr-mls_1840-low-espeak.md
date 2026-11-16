# Phoonnx/vits-fr_fr-mls_1840-low-espeak

## Resumen

vits-fr_fr-mls_1840-low-espeak es un modelo de sintesis de voz (text-to-speech) en frances de Francia, empaquetado por Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio piper-voices. Se trata de una voz VITS de calidad baja (low) entrenada sobre el corpus MLS (Multilingual LibriSpeech) en su variante fr_FR con identificador 1840, y redistribuida en formato ONNX para su uso con la libreria phoonnx, una implementacion en Python y OVOS de inferencia TTS.

El modelo resuelve el problema de generar audio hablado en frances a partir de texto, con un enfoque orientado a sistemas embebidos y asistentes de voz locales: el tamano del repositorio es de solo 0,1 GB, lo que lo hace apto para despliegues con recursos limitados. Su entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados mediante espeak-ng, lo que exige un front-end de fonemizacion antes de la inferencia.

Su relevancia actual radica en que forma parte del ecosistema Piper/phoonnx, una alternativa ligera y de licencia MIT (declarada aguas arriba) frente a soluciones TTS propietarias o de mayor peso. La ficha se basa exclusivamente en la informacion disponible en la model card y los metadatos de Hugging Face; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el autor no documenta variantes de cuantizacion) |
| Idiomas soportados | fr-FR (frances de Francia) |
| Licencia | MIT (declarada aguas arriba en rhasspy/piper-voices) |
| Formato de pesos | ONNX (libreria phoonnx) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Calidad de voz | low (segun nomenclatura del repositorio piper-voices) |
| Tamano del repositorio | 0,1 GB |
| Autor del modelo original | Rhasspy |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo extremo a extremo que combina un encoder de texto, un prior variacional, un decoder acustico y un vocoder neuronal en un unico sistema entrenado de forma conjunta. Esta disenado para producir audio directamente a partir de fonemas sin necesidad de un vocoder externo separado, lo que reduce la latencia y simplifica el despliegue.

El modelo original procede del repositorio rhasspy/piper-voices, en la ruta fr/fr_FR/mls_1840/low, lo que indica que fue entrenado sobre el corpus MLS (Multilingual LibriSpeech) para frances. La etiqueta low corresponde a la variante de menor calidad y tamano dentro de la familia Piper. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre el uso de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura VITS.

## Capacidades

- Sintesis de voz en frances de Francia (fr-FR) a partir de texto fonemizado en IPA.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion y conversion de texto de entrada mediante la libreria scriptconv, que incluye el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode, segun la documentacion del proyecto.
- No se documentan capacidades de clonacion de voz, control de emocion, multilinguismo adicional, tool calling ni razonamiento; no disponibles.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS en `mycroft.conf` con la voz `piper/fr_FR-mls_1840-low`, permitiendo respuestas habladas en frances en un asistente domestico sin dependencia de la nube y con un consumo de disco de unos 0,1 GB.
- Lectura de notificaciones y alertas en frances: por su tamano reducido, puede desplegarse en dispositivos de bajos recursos (Raspberry Pi y similares) para leer mensajes del sistema o alertas de monitorizacion.
- Prototipado rapido de interfaces de voz: la instalacion via `pip install --pre phoonnx` y la carga de la voz con `TTSModelManager` permiten incorporar sintesis en frances en un script Python en pocos minutos.
- Aplicaciones web de accesibilidad: mediante phoonnx.js y la demo en tigregotico.pt/demo, se puede ofrecer lectura en voz alta de contenido frances directamente en el navegador, sin backend.
- Generacion de audiolibros o contenido educativo en frances: util para convertir apuntes o textos en audio, aceptando la calidad "low" como compromiso por velocidad y tamano.
- Pruebas de regresion en pipelines de TTS: al ser un modelo ONNX deterministico y ligero, sirve como referencia en tests automatizados de sintesis para validar el front-end de fonemizacion (espeak-ng frente a espyak).
- Sistemas de mensajeria con respuesta hablada: integracion en bots o lineas de atencion en frances donde el coste por inferencia debe ser minimo y la calidad de estudio no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, latencia) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la arquitectura VITS de variante low, se espera un consumo de memoria muy reducido, apto para CPU.
- GPU recomendadas: no documentadas por el autor; el modelo esta pensado para ejecucion en CPU en el contexto de phoonnx y OVOS.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano, es plausible en cualquier GPU consumer, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Dependencias: espeak-ng (programa del sistema) o el extra `phoonnx[espeak]` con el port espyak. El autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-fr_fr-mls_1840-low-espeak (este) | VITS | fr-FR | low | MIT | ONNX (phoonnx) | Hugging Face, 0 descargas |
| Otras voces de rhasspy/piper-voices fr_FR | VITS | fr-FR | low/medium/high segun voz | MIT (declarada aguas arriba) | ONNX (Piper) | Hugging Face |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | MIT (segun origen) | ONNX (phoonnx) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Calidad de voz "low": la variante procede de la etiqueta low del repositorio Piper, por lo que la naturalidad y fidelidad acustica seran inferiores a las variantes medium o high.
- Dependencia de espeak-ng: la entrada debe ser fonemas IPA generados por espeak-ng; sin el programa instalado, phoonnx recurre a espyak, cuyos fonemas difieren y pueden provocar pronunciaciones erroneas.
- Cobertura linguistica limitada al frances de Francia (fr-FR); no se documenta soporte de otras variantes del frances ni de otros idiomas.
- Sin datos publicados sobre sesgos: no se dispone de informacion sobre sesgos de genero, acento o registro en el corpus MLS utilizado.
- Riesgo de alucinacion acustica: no documentado; en TTS, los fallos tipicos son pronunciacion incorrecta o artefactos, no invencion de contenido, pero no hay evaluacion publicada.
- Licencia: la model card declara MIT aguas arriba; conviene verificar la licencia del modelo original en rhasspy/piper-voices antes de un uso comercial, ya que este empaquetado solo la cita.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin benchmarks ni metricas de latencia publicadas, lo que dificulta estimar el rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-mls_1840-low-espeak
- Modelo original (rhasspy/piper-voices, fr/fr_FR/mls_1840/low): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/mls_1840/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
