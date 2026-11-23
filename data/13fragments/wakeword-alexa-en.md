# 13fragments/wakeword-alexa-en

## Resumen

`wakeword-alexa-en` es un modelo de deteccion de palabra de activacion (wake word) para el termino "Alexa" en ingles, publicado por el usuario 13fragments bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino un clasificador de audio binario que opera sobre tramas de 1.280 muestras de audio mono a 16 kHz y devuelve una puntuacion de confianza para la presencia de la palabra clave. Su pipeline declarado en Hugging Face es `audio-classification` y se distribuye en formato TFLite y ONNX para su uso con la libreria openWakeWord.

El problema que resuelve es de tipo practico y legal: el modelo `alexa` que viene por defecto con openWakeWord esta licenciado bajo CC BY-NC-SA 4.0, lo que impide su uso comercial. Este modelo ofrece una alternativa con licencia Apache 2.0 pensada para integraciones en Home Assistant mediante el componente Wyoming y para proyectos que necesiten desplegar deteccion de wake word en produccion sin restricciones no comerciales.

El modelo tiene un tamano de repositorio practicamente nulo (0.0 GB segun Hugging Face), lo que es coherente con un clasificador ligero de keyword spotting. No se dispone de datos sobre numero de parametros ni longitud de contexto en el sentido de los modelos de lenguaje, ya que opera sobre ventanas de audio fijas. La version publicada es `v1`, con etiqueta de release `v1.0.0`, y fue creada el 23 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de audio sobre caracteristicas de openWakeWord (mel-espectrograma + modelo de embeddings de Google); arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia de 1.280 muestras a 16 kHz (80 ms por trama) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos TFLite y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo se apoya en el pipeline de caracteristicas de openWakeWord v0.5.1: un modelo de mel-espectrograma (`melspectrogram.onnx`) y un modelo de embeddings (`embedding_model.onnx`) que contiene el embedding de voz de Google (Apache 2.0). Sobre esas caracteristicas se entrena un clasificador binario que produce la puntuacion de activacion. La arquitectura interna del clasificador no se detalla en la model card, aunque por el tamano del repositorio y el formato de despliegue se trata de una red de pequenas dimensiones optimizada para inferencia en CPU.

El entrenamiento uso 20.000 clips sinteticos de "Alexa" y 10.000 clips de palabras similares generados con la voz Piper `en_US-libritts-high` (MIT, entrenada sobre LibriTTS CC BY 4.0). Como negativos se emplearon LibriSpeech `train-clean-100` (CC BY 4.0) y clips de ruido de FSD50K (CC0 1.0 y CC BY 3.0). El autor reporta resultados para 4 semillas de entrenamiento y selecciono la semilla 0 unicamente con datos de desarrollo. El repositorio incluye `provenance.json` con origen, revision y checksum de cada entrada, y `ATTRIBUTION_FSD50K.tsv` con la atribucion por clip.

## Capacidades

- Deteccion binaria de la palabra de activacion "Alexa" en audio en ingles a 16 kHz.
- Salida de una puntuacion de confianza por trama de 1.280 muestras (80 ms), con umbral calibrado en 0,487.
- Integracion directa con openWakeWord 0.6.0 mediante el framework de inferencia ONNX.
- Integracion con Home Assistant a traves del add-on openWakeWord y del componente Wyoming (`wyoming-openwakeword` 2.1.0).
- Distribucion en TFLite y ONNX para despliegue en CPU y en dispositivos embebidos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Asistente de voz domestico con Home Assistant: se copia `alexa_v1.tflite` en `/share/openwakeword`, se reinicia el add-on y se selecciona "alexa" en el pipeline de Assist; el add-on elimina el sufijo de version y usa este archivo en lugar de su modelo `alexa` con licencia no comercial.
- Despliegue comercial de wake word: al estar bajo Apache 2.0, permite integrar la deteccion de "Alexa" en productos o servicios comerciales sin las restricciones de CC BY-NC-SA 4.0 del modelo original de openWakeWord.
- Deteccion en dispositivos embebidos: el formato TFLite y la ventana de 80 ms por trama permiten ejecucion en CPU de bajo consumo, sin GPU.
- Sustitucion directa en pipelines openWakeWord existentes: basta con apuntar `wakeword_models` al archivo ONNX descargado de Hugging Face y mantener los modelos de caracteristicas de la release v0.5.1.
- Evaluacion y prototipado de sistemas de activacion por voz: util para comparar umbrales y tasas de falsos positivos frente a microWakeWord v2 `alexa`.
- Integracion en aplicaciones Python de captura de audio en tiempo real: el ejemplo de la model card muestra el flujo `Model(...)` + `model.predict(frame)` con deteccion por umbral, adecuado para scripts de domotica o demos.

## Benchmarks y rendimiento

Resultados sobre el conjunto de evaluacion descrito en la model card, con umbrales fijados en audio de desarrollo para un maximo de 0,5 falsos positivos por hora:

| Modelo | Semillas de entrenamiento | Falsos rechazos | Falsos positivos por hora |
|---|---|---|---|
| Este modelo (semilla 0) | 1 | 0,91 % | 0,523 |
| Media de las semillas entrenadas | 4 | 1,69 % | 0,377 |
| microWakeWord v2 `alexa` (Apache 2.0) | modelo publicado | 1,22 % | 0,571 |

El rango de las 4 semillas va de 0,91 % a 2,2 % de falsos rechazos, por lo que el autor indica explicitamente que estos resultados no demuestran superioridad frente a microWakeWord. A 0,1 falsos positivos por hora, microWakeWord falla menos clips: 3,8 % frente a 4,79 %. Los positivos de evaluacion son los 329 clips `alexa` del benchmark de Picovoice; los negativos, 82,25 h de audio sin la palabra clave (AMI, 79,65 h; DiPCo, 2,6 h).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta disenado para inferencia en CPU.
- GPU recomendadas: no disponibles ni necesarias; el autor solo reporta pruebas en CPU.
- Cabe en cualquier CPU de consumo; no requiere GPU dedicada.
- Opciones de despliegue: openWakeWord 0.6.0 con framework ONNX, `wyoming-openwakeword` 2.1.0 y el add-on openWakeWord de Home Assistant; tambien formato TFLite para runtime compatible.
- Latencia y throughput: no disponibles; la ventana de inferencia es de 1.280 muestras (80 ms) a 16 kHz.
- Dependencias: `melspectrogram.onnx` y `embedding_model.onnx` de la release v0.5.1 de openWakeWord (checksums en `provenance.json`).

## Comparativa con modelos similares

| Modelo | Licencia | Idiomas | Formato | Falsos rechazos | Falsos positivos/hora |
|---|---|---|---|---|---|
| Este modelo (v1, semilla 0) | Apache 2.0 | en | TFLite, ONNX | 0,91 % | 0,523 |
| microWakeWord v2 `alexa` | Apache 2.0 | en | no disponible | 1,22 % | 0,571 |
| `alexa` de openWakeWord | CC BY-NC-SA 4.0 | en | no disponible | no disponible | no disponible |

La diferencia clave frente al modelo `alexa` de openWakeWord es la licencia: Apache 2.0 permite uso comercial, mientras que CC BY-NC-SA 4.0 lo restringe a uso no comercial. Frente a microWakeWord v2, el rendimiento es comparable dentro del intervalo reportado, sin superioridad demostrada.

## Limitaciones y advertencias

- Solo detecta "Alexa" en ingles; no soporta otros idiomas ni otras palabras de activacion.
- Todos los positivos de entrenamiento son voz sintetica de un unico modelo de voz (Piper `en_US-libritts-high`), lo que puede limitar la generalizacion a hablantes reales diversos.
- Los positivos de evaluacion provienen de un unico benchmark y el consentimiento de sus hablantes no esta documentado.
- A 0,1 falsos positivos por hora, microWakeWord falla menos clips (3,8 % frente a 4,79 %).
- Probado solo en CPU con `wyoming-openwakeword` 2.1.0 y `openwakeword` 0.6.0; en versiones 1.x de `wyoming-openwakeword` el archivo aparece como `alexa_v1` y debe seleccionarse esa entrada.
- El embedding de voz de Google incluido en las caracteristicas no tiene datos de entrenamiento publicos.
- "Alexa" es marca registrada de Amazon.com, Inc.; el autor declara no estar afiliado ni respaldado por Amazon.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- `openwakeword.utils.download_models()` descarga tambien los modelos CC BY-NC-SA, por lo que en entornos comerciales conviene descargar manualmente solo los archivos necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/13fragments/wakeword-alexa-en
- Resultados de evaluacion: [eval/RESULTS.md](https://huggingface.co/13fragments/wakeword-alexa-en/blob/main/eval/RESULTS.md)
- Release de openWakeWord v0.5.1 (modelos de caracteristicas): https://github.com/dscripka/openWakeWord/releases/tag/v0.5.1
- Repositorio openWakeWord: https://github.com/dscripka/openWakeWord
- Benchmark de wake word de Picovoice (positivos de evaluacion): https://github.com/Picovoice/wake-word-benchmark
- FSD50K (negativos de ruido): https://zenodo.org/record/4060432
