# Phoonnx/glowtts-en_us-cmu_fem-gruut

## Resumen

Glow-TTS en_us-cmu_fem-gruut es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense empaquetado en formato ONNX por el proyecto Phoonnx para su libreria de inferencia TTS homonima. El modelo original procede de Rhasspy, concretamente del release v1.0 de Larynx, y emplea la arquitectura Glow-TTS, un modelo de sintesis basado en flujos normalizadores que genera espectrogramas mel a partir de fonemas, que posteriormente son convertidos a audio por un vocoder HiFi-GAN (hifigan-multi-vctk-small).

La relevancia de este paquete es practica: permite ejecutar un modelo TTS ligero (el repositorio ocupa aproximadamente 0,1 GB) mediante ONNX Runtime, sin necesidad de framework de deep learning completo, integrándose en pipelines de Python y en el ecosistema de asistentes de voz OVOS a traves del plugin ovos-tts-plugin-phoonnx. El front-end de texto utiliza la libreria scriptconv con el fonemizador Gruut, que convierte el texto normalizado en fonemas IPA antes de la sintesis.

Se trata de un modelo de voz concreta (voz femenina, dominio CMU) orientado a sintesis de frases en en-US. No es un modelo de lenguaje general: no genera texto, no razona y no soporta tool calling. Su valor esta en la sintesis de voz local, determinista y de baja huella de recursos, adecuada para asistentes embebidos, prototipos y aplicaciones de lectura en voz alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujos normalizadores para generacion de espectrogramas mel) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS por frase; no se documenta limite de entrada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; el autor indica consultar el release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small (HiFi-GAN, ONNX) |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Front-end de texto | scriptconv con GruutPhonemizer (extra `scriptconv[gruut]`) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en flujos normalizadores (normalizing flows) que modela directamente la distribucion de espectrogramas mel condicionada a la secuencia de fonemas, evitando el uso de alineamientos externos y de un modelo de atencion autoregresivo como en Tacotron. La arquitectura combina un encoder de texto, un bloque de flujos invertibles y un decodificador que produce el espectrograma; la duracion de cada fonema se estima mediante un mecanismo de alineamiento monotono (MAS, Monotonic Alignment Search) durante el entrenamiento.

El modelo original fue entrenado por Rhasspy para el proyecto Larynx v1.0, con una voz femenina del corpus CMU en ingles estadounidense. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de ajuste fino o preferencia (RLHF/DPO), algo que no es habitual en modelos TTS de este tipo. La innovacion practica del paquete Phoonnx es el empaquetado en ONNX y la integracion con el front-end scriptconv/Gruut, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis; el vocoder HiFi-GAN se descarga automaticamente junto con la voz.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto, con salida en fichero WAV.
- Conversion de texto a fonemas IPA mediante el fonemizador Gruut integrado en scriptconv.
- Generacion de espectrogramas mel con Glow-TTS y conversion a audio con el vocoder HiFi-GAN.
- Ejecucion en ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Integracion con asistentes de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Uso programatico en Python a traves de TTSModelManager y la API voice.synthesize_wav.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio de entrada; es exclusivamente TTS.
- Capacidad multilingue limitada a en-US; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS y permite sintetizar respuestas del asistente sin conexion a servicios en la nube, con una huella de disco de unos 0,1 GB.
- Lectura en voz alta de documentos y notificaciones: se puede invocar voice.synthesize_wav sobre frases normalizadas para generar ficheros WAV en aplicaciones de accesibilidad o sistemas de anuncios.
- Prototipado rapido de interfaces conversacionales: al ejecutarse sobre ONNX Runtime y sin PyTorch, reduce el coste de despliegue en entornos de desarrollo y CI.
- Sistemas embebidos y dispositivos de bajos recursos: el tamano reducido del repositorio y la inferencia ONNX lo hacen apto para dispositivos con CPU modesta, siempre que se acepte la latencia de un modelo no optimizado para streaming.
- Generacion de audiolibros o contenido narrado por lotes: la API permite sintetizar frases de forma secuencial y volcar la salida a ficheros WAV para su posterior ensamblaje.
- Pruebas de regresion de pipelines TTS: sirve como voz de referencia determinista para validar front-ends de normalizacion de texto y fonemizacion con Gruut en entornos de test.
- Educacion e investigacion en sintesis de voz: util como baseline Glow-TTS en experimentos comparativos con otros vocoders o fonemizadores, gracias a su empaquetado reproducible en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX Runtime puede correr en CPU, y el modelo es lo bastante pequeno como para no requerir GPU dedicada.
- GPU recomendadas: no se documentan; cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) podria acelerar la inferencia, pero no hay datos publicados.
- GPU de consumo: no hay confirmacion oficial, pero por el tamano del paquete (~0,1 GB) es plausible su ejecucion en CPU y en GPU de gama baja; no se dispone de cifras verificadas.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin ovos-tts-plugin-phoonnx para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx glowtts-en_us-cmu_fem-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin licencia registrada) | Paquete ONNX para phoonnx; ~0,1 GB |
| Rhasspy Larynx en-us_cmu_fem-glow_tts (upstream) | Glow-TTS + vocoder Larynx | en-US | Tar de Larynx | segun release upstream | Origen del modelo empaquetado; requiere stack Larynx |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | segun voz | ONNX | other | Misma libreria y vocoder; distintas voces/idiomas |
| Modelos TTS neuronales de mayor tamano (p. ej. VITS, Tacotron 2) | VITS / Tacotron 2 | multi o en | varios | variable | No se dispone de datos comparativos verificados en la informacion |

## Limitaciones y advertencias

- Licencia: el autor indica que no hay licencia registrada y recomienda consultar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial. No se garantiza permiso de uso comercial.
- Idioma unico: solo en-US; no soporta otros idiomas ni variantes regionales.
- Entrada restringida: espera texto normalizado y fonemizado con Gruut; un texto mal normalizado o con caracteres fuera del alfabeto IPA puede degradar la sintesis.
- Dependencia del vocoder: la calidad final depende de hifigan-multi-vctk-small, que phoonnx descarga junto con la voz; sin red o sin ese vocoder la sintesis no se completa.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones erroneas, prosodia artificial o artefactos en palabras poco frecuentes, siglas y nombres propios.
- Sesgos: la voz esta entrenada sobre un corpus concreto (CMU, voz femenina); puede no representar adecuadamente acentos, edades o estilos distintos.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede comparar objetivamente su calidad con alternativas.
- No apto para tareas de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling.
- Madurez: repositorio con muy pocas descargas y sin likes; conviene validar estabilidad y mantenimiento antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_fem-gruut
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_fem-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
