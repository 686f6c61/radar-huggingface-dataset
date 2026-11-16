# Phoonnx/styletts2-ca-bsc_lt-espeak

## Resumen

styletts2-ca-bsc_lt-espeak es un modelo de sintesis de voz (text-to-speech) en catalan, empaquetado en formato ONNX por el proyecto Phoonnx a partir del modelo original BSC-LT/styletts2-catalan-multispeaker desarrollado por el Barcelona Supercomputing Center - Language Technologies (BSC-LT). El modelo emplea la arquitectura StyleTTS2, un sistema neuronal de sintesis de voz de alta calidad que combina un encoder de estilo y un decodificador basado en difusion, y que en este caso concreto es multihablante (doce voces empaquetadas bajo la coleccion Phoonnx).

El paquete resuelve el problema de desplegar TTS catalan de calidad en entornos Python y en el asistente de voz OVOS sin necesidad de infraestructura de entrenamiento: el modelo llega ya convertido a ONNX y con un front-end fonetico basado en espeak-ng que convierte el texto en fonemas IPA. Esta pensado para aplicaciones que necesitan sintesis de voz local, sin dependencia de APIs en la nube, y con soporte para clonacion de voz a partir de audio de referencia.

Es relevante porque el catalan es un idioma con pocos recursos TTS de calidad y porque la integracion con phoonnx y OVOS permite incorporar el modelo a asistentes de voz de codigo abierto con una configuracion minima. La licencia GPL-3.0 heredada del modelo original condiciona su uso en productos de codigo cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con encoder de estilo y decodificador por difusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,8 GB) |
| Idiomas soportados | catalan (ca) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz que separa la representacion del estilo (prosodia, timbre, velocidad) de la del contenido linguistico. El sistema emplea un encoder de estilo que extrae un vector de estilo a partir de audio de referencia y un decodificador generativo que sintetiza la forma de onda condicionada por ese estilo y por los fonemas de entrada. Esta separacion permite clonar la voz de un hablante a partir de unos segundos de audio de referencia, tal como indica la model card al mencionar que "the voice clones a speaker from reference audio".

El modelo upstream es multihablante (BSC-LT/styletts2-catalan-multispeaker) y el paquete de Phoonnx expone doce voces predefinidas (ca-bet, ca-eli, ca-eva, ca-jan, ca-mar, ca-ona, ca-pau, ca-pep, ca-pol, ca-styletts2, ca-teo, ca-uri). El front-end textual no forma parte de la red neuronal: phoonnx delega en la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA mediante el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, apoyado en espeak-ng. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial.

## Capacidades

- Sintesis de voz en catalan a partir de texto escrito, con salida en formato WAV.
- Conversion texto-a-fonemas mediante espeak-ng e IPA, con normalizacion de texto previa a cargo de scriptconv.
- Multihablante: doce voces catalanas empaquetadas en la coleccion Phoonnx.
- Clonacion de voz a partir de audio de referencia (el vector de estilo se extrae del audio del hablante).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local sobre runtime ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz de codigo abierto: integracion directa en OVOS seleccionando la voz en `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx`, lo que permite dotar de voz catalana a un asistente local sin APIs externas.
- Lectura de contenido en catalan: sintesis de articulos, noticias o documentacion para aplicaciones de accesibilidad o podcasts automatizados, usando el front-end espeak-ng para manejar texto con numeros y abreviaturas.
- Clonacion de voz para locuciones personalizadas: a partir de unos segundos de audio de referencia se puede generar una voz con el timbre del hablante, util para audiolibros o doblaje de bajo volumen.
- Sistemas de atencion al ciudadano en catalan: respuestas habladas en administraciones publicas o servicios telefonicos donde se requiere cobertura de una lengua cooficial.
- Prototipado de interfaces conversacionales: entornos de desarrollo que necesitan un TTS local rapido de instalar (`pip install --pre phoonnx`) para validar flujos de voz antes de invertir en infraestructura.
- Investigacion en TTS y evaluacion de voces: el paquete ONNX permite comparar doce voces del mismo modelo y medir calidad y latencia en distintos entornos sin reentrenar.
- Generacion de audios para aprendizaje de idiomas: creacion de material de escucha en catalan con distintas voces para ejercicios de comprension.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,8 GB, por lo que el modelo cabe holgadamente en GPUs de consumo y probablemente en CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del artefacto, cualquier GPU con al menos 2-4 GB de memoria libre deberia ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en modelos como RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: phoonnx (runtime ONNX en Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voces | Formato | Licencia |
|---|---|---|---|---|---|
| styletts2-ca-bsc_lt-espeak (este) | StyleTTS2 | Catalan | 12 (multihablante) | ONNX | GPL-3.0 |
| BSC-LT/styletts2-catalan-multispeaker | StyleTTS2 | Catalan | Multihablante | no disponible | GPL-3.0 |
| Otros modelos StyleTTS2 de la coleccion Phoonnx | StyleTTS2 | Segun modelo | Segun modelo | ONNX | Segun modelo |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier uso comercial o distribucion de productos derivados obliga a liberar el codigo bajo la misma licencia, lo que restringe su adopcion en software propietario.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Cobertura limitada a un unico idioma (catalan); no es multilingue.
- Riesgo de prosodia incorrecta o pronunciacion erronea en palabras fuera del vocabulario o con grafias ambiguas, al depender de un fonemizador basado en reglas.
- La clonacion de voz plantea riesgos de suplantacion de identidad y requiere consentimiento explicito del hablante cuya voz se clona; no se documentan mecanismos de mitigacion.
- No se han publicado datos de sesgo, tasas de alucinacion (aplicable a contenido linguistico generado) ni evaluaciones formales de calidad (MOS).
- El modelo no ha sido validado por el empaquetador Phoonnx mas alla de la conversion a ONNX; la calidad final depende del modelo upstream de BSC-LT.
- Repositorio con muy poca traccion (21 descargas, 0 likes) en el momento de la consulta, lo que implica escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-ca-bsc_lt-espeak
- Modelo upstream: https://huggingface.co/BSC-LT/styletts2-catalan-multispeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
