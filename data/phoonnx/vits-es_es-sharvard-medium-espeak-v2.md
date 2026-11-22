# Phoonnx/vits-es_es-sharvard-medium-espeak-v2

## Resumen

El modelo `Phoonnx/vits-es_es-sharvard-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en castellano de Espana basada en la arquitectura VITS y distribuida en formato ONNX para el motor [phoonnx](https://github.com/TigreGotico/phoonnx). No se trata de un modelo de lenguaje ni de un sistema de razonamiento: es un modelo acústico neuronal que convierte fonemas (obtenidos mediante espeak-ng) en audio de 22050 Hz. Lo publica TigreGotico Lda como conversión del modelo original `rhasspy/piper-voices` (ruta `es/es_ES/sharvard/medium`), entrenado por Rhasspy.

La relevancia de esta versión concreta (`-v2`) es que sustituye a la anterior `Phoonnx/vits-es_es-sharvard-medium-espeak`, ya que el autor original reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`). Incluye además copias cuantizadas a int8 generadas con `onnxruntime.quantization.quantize_dynamic`, lo que reduce el grafo de 76,8 MB a 22,1 MB y permite ejecución eficiente en CPU.

El modelo está pensado para integración en asistentes de voz (OVOS/Mycroft), sistemas de lectura en voz alta y pipelines de audio en castellano de Espana, con dos hablantes disponibles y un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas) |
| Tipos de cuantizacion | fp32 original y int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | CC BY 3.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 2 |
| Entrada de texto | fonemas espeak-ng (alfabeto IPA) |
| Puntuacion entrenada | `, . ! ? : ;` (preservada desde phoonnx 1.96.1a1) |
| Tamano del grafo | 76,8 MB (fp32) / 22,1 MB (int8) |
| Identificador de voz | `piper/es_ES-sharvard-medium-v2` |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior normalizante con flujo y un decodificador vocacional (HiFi-GAN), entrenado con perdida adversaria. En esta variante Piper, el texto se convierte primero a fonemas IPA mediante espeak-ng (voz `es`) y el modelo sintetiza la onda de audio a 22050 Hz. La voz soporta dos hablantes mediante condicionamiento de speaker.

Segun la model card, el entrenamiento partio del modelo base en ingles `hifi_tts_92` (calidad media, voz de Cori Samuel, lector 92 de Hi-Fi TTS) y se afinó con MRD y SDP. Como el modelo base era de un solo hablante, el condicionamiento de speaker se inicializo a cero y el modelo arranco como base para ambos hablantes. Los datos de entrenamiento no estan registrados en el repositorio upstream; la model card original apunta a `https://datashare.ed.ac.uk/handle/10283/574` con licencia CC BY 3.0. Se requiere Piper 1.5 o superior. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa (no aplicables a un TTS).

## Capacidades

- Sintesis de voz en castellano de Espana (es-ES) a 22050 Hz.
- Dos hablantes seleccionables mediante condicionamiento de speaker.
- Entrada por fonemas espeak-ng en alfabeto IPA, con soporte de puntuacion de clausula (`, . ! ? : ;`).
- Salida en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Ejecucion en CPU con copias int8 optimizadas (RTF 0,103 a 4 hilos).
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- **Asistentes de voz locales (OVOS/Mycroft)**: se selecciona la voz `piper/es_ES-sharvard-medium-v2` en `mycroft.conf` y el plugin `ovos-tts-plugin-phoonnx` la usa para responder al usuario en castellano sin depender de la nube.
- **Lectura en voz alta de documentos**: el modelo sintetiza texto plano con puntuacion preservada, adecuado para convertir articulos o notificaciones en audio WAV de forma offline.
- **Sistemas de accesibilidad**: integracion en lectores de pantalla o aplicaciones de asistencia para personas con discapacidad visual, ejecutandose en CPU de portatiles sin GPU.
- **Avisos y anuncios en dispositivos embebidos**: con un grafo int8 de 22,1 MB y RTF de 0,103 en CPU, cabe en dispositivos de bajos recursos para mensajes pregrabados o dinamicos.
- **Generacion de audio para pruebas de ASR**: sirve para crear corpus sinteticos en es-ES con dos voces y evaluar sistemas de reconocimiento de voz (la propia model card usa ASR para su control de calidad).
- **Prototipado de interfaces conversacionales**: al instalarse con `pip install --pre phoonnx`, permite iterar rapidamente en demos de voz en castellano antes de invertir en modelos TTS de mayor calidad.
- **Doblaje o narracion automatizada de contenido corto**: para clips, podcasts o tutoriales donde se requiere una voz castellana consistente y sin coste por peticion.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a controles de calidad con ASR `nemo-parakeet-tdt-0.6b-v3 int8` sobre 3 frases de FLORES-200 devtest, medidos en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control | pass | pass |
| WER | 0,053 | 0,079 |
| Caracteres por segundo | 17,7 a 20,0 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,01 a 1,03 |
| Tamano del grafo | 76,8 MB | 22,1 MB |
| RSS pico | 308,7 MB | 240,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,103 |

No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo esta disenado para CPU. RSS pico de 308,7 MB en fp32 y 240,8 MB en int8.
- **GPU recomendadas**: no aplica; cualquier GPU compatible con ONNX Runtime podria usarse, pero no se documenta.
- **Consumer GPU**: no es necesario; funciona en CPU de portatil (probado en Intel i9-11900H).
- **Despliegue**: ONNX Runtime a traves de phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`phoonnx[espeak]`). Integracion con OVOS/Mycroft via `ovos-tts-plugin-phoonnx`.
- **Latencia y throughput**: RTF 0,039 en fp32 y 0,103 en int8 con 4 hilos (sintesis mas rapida que tiempo real en ambos casos). Caracteres por segundo de 17,7 a 20,0 en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-es_es-sharvard-medium-espeak-v2` | VITS (Piper 1.5) | es-ES | 2 | ONNX fp32/int8 | CC BY 3.0 | Version actual, reentrenada sobre Piper 1.5 |
| `Phoonnx/vits-es_es-sharvard-medium-espeak` | VITS (Piper) | es-ES | 2 | ONNX | CC BY 3.0 | Version anterior, pesos previos; sustituida por la v2 |
| `rhasspy/piper-voices` (es_ES/sharvard/medium) | VITS (Piper) | es-ES | 2 | Piper/ONNX | CC BY 3.0 | Modelo upstream original de Rhasspy |

No se dispone de datos de benchmarks comparativos con otros TTS en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma unico**: solo castellano de Espana (es-ES); no soporta otros idiomas ni variantes regionales.
- **Dependencia de espeak-ng**: la fonemizacion requiere espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- **Calidad media**: es una voz de calidad "medium" de Piper, no orientada a produccion de alta fidelidad.
- **Alucinacion en TTS**: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones erroneas, especialmente con texto fuera de dominio o sin puntuacion.
- **Datos de entrenamiento no documentados**: el repositorio upstream no registra el dataset de entrenamiento, lo que limita la evaluacion de sesgos.
- **Licencia CC BY 3.0**: permite uso comercial pero exige atribucion a Rhasspy; la conversion la publica TigreGotico bajo la misma licencia.
- **API en pre-release**: phoonnx se instala con `--pre`; la interfaz puede cambiar.
- **Sin checkpoint de entrenamiento**: el repositorio solo contiene pesos ONNX; no permite reentrenamiento directo.
- **Puntuacion**: el modelo fue entrenado con `, . ! ? : ;`; otros signos pueden no procesarse correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-sharvard-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/es/es_ES/sharvard/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-es_es-sharvard-medium-espeak
- TigreGotico: https://tigregotico.pt
- Datos de entrenamiento (upstream): https://datashare.ed.ac.uk/handle/10283/574
