# Phoonnx/glowtts-es_es-karen_savage

## Resumen

glowtts-es_es-karen_savage es un modelo de sintesis de voz (text-to-speech) en castellano de Espana, empaquetado en formato ONNX por Phoonnx a partir de los pesos originales publicados por Rhasspy dentro del proyecto Larynx v1.0. El modelo sigue la arquitectura Glow-TTS, un modelo generativo normalizing flow que transforma fonemas en espectrogramas mel, que posteriormente son convertidos a audio por un vocoder HiFi-GAN. La voz corresponde a la locutora identificada como "karen_savage" y esta etiquetada para el locale `es-ES`.

El modelo resuelve la generacion de voz sintetica offline y en local para aplicaciones de asistencia vocal, lectura de textos y agentes conversacionales, sin depender de servicios en la nube. Su interes actual radica en que Phoonnx lo ha reempaquetado en ONNX e integrado con la libreria `scriptconv` para la normalizacion de texto y la fonemizacion con gruut (alfabeto IPA), lo que simplifica su despliegue en Python y en el ecosistema OVOS/Mycroft. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto y ligero.

Se trata de un modelo acustico pequeno, no de un modelo de lenguaje: no genera texto ni razona, sino que sintetiza audio a partir de fonemas. La informacion disponible no detalla el numero de parametros ni la longitud de contexto (concepto que no aplica a TTS), y la licencia aparece como "other" sin que el autor registre una licencia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | castellano de Espana (`es-ES`) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX (ejecutado mediante la libreria phoonnx) |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica basado en normalizing flows que aprende una transformacion invertible entre fonemas y espectrogramas mel, permitiendo sintesis paralela sin alineamiento explicito previo (a diferencia de modelos autoregresivos como Tacotron 2). El modelo acustico genera el espectrograma y un vocoder HiFi-GAN, en este caso la variante `hifigan-multi-vctk-small`, lo convierte en forma de onda de audio. La entrada de texto se procesa mediante el fonemizador gruut de `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA.

La informacion proporcionada no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste por preferencias (procedimientos que, en cualquier caso, no son habituales en modelos TTS de esta generacion). Los pesos proceden del release v1.0 de Rhasspy Larynx, del que este repositorio es un reempaquetado; Phoonnx no aporta informacion adicional sobre el proceso de entrenamiento original.

## Capacidades

- Sintesis de voz a partir de texto en castellano de Espana (`es-ES`), con salida en formato WAV.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio con vocoder HiFi-GAN.
- Normalizacion de texto y fonemizacion a IPA mediante `scriptconv` con el fonemizador gruut.
- Integracion con la libreria phoonnx en Python (`TTSModelManager`, `voice.synthesize_wav`).
- Integracion con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion local en formato ONNX, sin dependencia de servicios en la nube.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos en castellano: el modelo sintetiza frases en `es-ES` a WAV, adecuado para convertir articulos, notificaciones o documentacion en audio reproducibles offline.
- Asistente vocal local en OVOS/Mycroft: mediante `ovos-tts-plugin-phoonnx` se selecciona la voz `larynx/es-es-karen_savage-glow_tts` en `mycroft.conf`, permitiendo respuestas habladas sin enviar texto a servidores externos.
- Accesibilidad: generacion de audio para personas con dificultades de lectura, con procesamiento integramente local y un repositorio de ~0,1 GB que se puede distribuir junto con la aplicacion.
- Sistemas empotrados y dispositivos de bajos recursos: al ser un modelo compacto en ONNX con vocoder pequeno (`hifigan-multi-vctk-small`), encaja en entornos donde no se puede desplegar un TTS de gran tamano.
- Pipelines de sintesis por lotes: el API de phoonnx permite iterar sobre textos y escribir ficheros WAV, util para generar audiolibros, avisos o locuciones de forma automatizada.
- Prototipado de voces sinteticas en castellano: al estar empaquetado con `scriptconv` y gruut, sirve como base para experimentar con normalizacion de texto y fonemizacion IPA antes de integrar otras voces de la coleccion Glow-TTS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; por el tamano del repositorio (~0,1 GB) y la arquitectura Glow-TTS con vocoder pequeno, se trata de un modelo de huella reducida que previsiblemente se ejecuta en CPU, aunque no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta su ejecucion en tarjetas como RTX 4090.
- Opciones de despliegue: libreria phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft; los pesos estan en formato ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-es_es-karen_savage (este modelo) | Glow-TTS + HiFi-GAN | `es-ES` | ONNX (phoonnx) | other (sin licencia registrada) | Hugging Face, 36 descargas |
| Otras voces de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | segun voz | ONNX (phoonnx) | variable | coleccion Hugging Face de Phoonnx |
| Modelos TTS de Rhasspy Larynx v1.0 | Glow-TTS + vocoder | multiples | formato original Larynx | variable | releases de GitHub de Rhasspy |

La informacion disponible no permite comparar parametros, contexto ni rendimiento con alternativas concretas; los datos de esta tabla se limitan a lo documentado en la ficha y en el repositorio.

## Limitaciones y advertencias

- Licencia: aparece como "other" y el autor indica explicitamente que no hay licencia registrada; debe consultarse el release upstream de Rhasspy Larynx antes de cualquier uso, incluido el comercial.
- Idioma: unicamente castellano de Espana (`es-ES`); no se documenta soporte multilingue ni variantes regionales.
- Ambito: es un modelo acustico TTS, sin capacidades de razonamiento, generacion de texto ni tool calling.
- Calidad de sintesis: no se publican metricas (MOS, WER, latencia) que permitan evaluar la fidelidad o naturalidad de la voz.
- Datos de entrenamiento: no disponibles; no se puede evaluar el origen del corpus de la locutora ni posibles sesgos de pronunciacion o registro.
- Dependencias: requiere `scriptconv[gruut]` y el vocoder `hifigan-multi-vctk-small`, que phoonnx descarga junto con la voz; la fonemizacion depende de gruut y del alfabeto IPA.
- Popularidad baja (36 descargas, 0 likes en el momento de la consulta): escasa validacion por parte de la comunidad.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; en TTS el riesgo equivalente es la pronunciacion incorrecta de palabras fuera del vocabulario o de nombres propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-es_es-karen_savage
- Repositorio upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/es-es_karen_savage-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
