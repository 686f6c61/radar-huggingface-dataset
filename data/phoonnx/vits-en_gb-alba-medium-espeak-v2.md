# Phoonnx/vits-en_gb-alba-medium-espeak-v2

## Resumen

`vits-en_gb-alba-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en ingles britanico desarrollada por TigreGotico (bajo la organizacion Phoonnx) como conversion a ONNX del modelo original `rhasspy/piper-voices/en/en_GB/alba/medium`. Se trata de un modelo VITS de la familia Piper, reentrenado por Rhasspy sobre los modelos base de Piper 1.5, y empaquetado para su uso con la libreria `phoonnx`, un motor TTS ligero orientado a asistentes de voz y sistemas empotrados.

El modelo resuelve el problema de sintesis de voz local de baja latencia en ingles britanico: acepta fonemas espeak-ng en alfabeto IPA y genera audio a 22050 Hz con una sola voz. Su relevancia actual radica en que es una alternativa de codigo abierto (CC BY 4.0), ejecutable en CPU, con un grafo de 63,2 MB en fp32 y 18,7 MB en int8, lo que lo hace adecuado para despliegues en dispositivos sin GPU.

La ficha describe una voz concreta, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Su evaluacion debe centrarse en calidad de sintesis, latencia (RTF), huella de memoria y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Fonetizador | espeak-ng, voz `en-gb-x-rp` |
| Puntuacion soportada | `, . ! ? : ;` (clausulas) |
| Tamano del repositorio | 0,1 GB |
| Grafo fp32 | 63,2 MB |
| Grafo int8 | 18,7 MB |
| Pico de RSS | 260,4 MB (fp32) / 216,6 MB (int8) |
| RTF mediano | 0,036 (fp32) / 0,094 (int8), 4 hilos |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), tal como la implementa Piper. Se trata de un modelo end-to-end condicionado por fonemas: la entrada es una secuencia de fonemas IPA generada por espeak-ng (voz `en-gb-x-rp`) y la salida es una forma de onda a 22050 Hz. Es un modelo de un solo hablante, sin control de prosodia por estilo ni etiquetas de emocion.

Segun la model card, el modelo upstream fue afinado desde el modelo base `hifi_tts_92` de ingles estadounidense (calidad media, voz de Cori Samuel, lector 92 de Hi-Fi TTS) mediante MRD y SDP. Los datos de entrenamiento proceden del dataset de Edinburgh DataShare (`https://datashare.ed.ac.uk/handle/10283/3270`) bajo licencia CC BY 4.0. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior. La model card no registra el numero de tokens, la composicion exacta del dataset ni detalles de RLHF/DPO, y no incluye checkpoint de entrenamiento en el repositorio.

La conversion a ONNX la realiza TigreGotico sin modificar los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8. Esta version v2 sustituye a `Phoonnx/vits-en_gb-alba-medium-espeak` porque el upstream reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`).

## Capacidades

- Sintesis de voz en ingles britanico (en-GB) a partir de texto fonetizado con espeak-ng.
- Generacion de audio WAV a 22050 Hz, mono, un unico hablante.
- Respeto de puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior.
- Ejecucion en CPU sin GPU, con grafos ONNX fp32 e int8.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: unicamente en-GB.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas del asistente en ingles britanico sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en dispositivos empotrados: con 18,7 MB en int8 y 216,6 MB de pico de RSS, cabe en hardware con recursos limitados y mantiene un RTF de 0,094 en CPU.
- Generacion de audiolibros o contenido narrado en ingles britanico: la calidad media de Piper y el soporte de puntuacion de clausula permiten frases con pausas naturales, aunque la falta de control de prosodia limita la expresividad.
- Pruebas automatizadas de pipelines de voz: el modelo sirve como referencia TTS determinista para validar integraciones ASR-TTS con WER de 0,000 en la QA del autor.
- Sistemas de accesibilidad para lectura de pantalla: la baja latencia (RTF 0,036 en fp32 con 4 hilos) permite respuestas casi en tiempo real en un i9-11900H.
- Prototipado de interfaces conversacionales: al ejecutarse en CPU y con licencia CC BY 4.0, es adecuado para demos y entornos de desarrollo sin infraestructura GPU.
- Generacion de voces para videojuegos o narracion de texto en ingles britanico en tiempo de ejecucion, siempre que se asuma una sola voz y sin control de emocion.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 14,0 a 17,5 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 260,4 MB | 216,6 MB |
| RTF (mediana de 3, 4 hilos) | 0,036 | 0,094 |

Medido en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 260,4 MB en fp32 y 216,6 MB en int8.
- GPU recomendadas: no aplica; no se documenta ejecucion en GPU.
- Cabe en cualquier equipo consumer: el grafo int8 de 18,7 MB y el pico de 216,6 MB permiten ejecucion en portatiles y dispositivos empotrados.
- Despliegue: `phoonnx` (con `pip install --pre phoonnx`), espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (espyak), y el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia: RTF de 0,036 en fp32 y 0,094 en int8 con 4 hilos en i9-11900H; el throughput en caracteres por segundo es de 14,0 a 17,5 en fp32.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_gb-alba-medium-espeak-v2` | VITS (Piper) | en-GB | 22050 Hz | CC BY 4.0 | ONNX fp32/int8 | Conversion de `rhasspy/piper-voices`; RTF 0,036 fp32 |
| `rhasspy/piper-voices` (en_GB alba medium) | VITS (Piper) | en-GB | 22050 Hz | CC BY 4.0 | Piper/ONNX | Modelo upstream; pesos equivalentes sin conversion |
| `Phoonnx/vits-en_gb-alba-medium-espeak` | VITS (Piper) | en-GB | 22050 Hz | CC BY 4.0 | ONNX | Version anterior con pesos previos a Piper 1.5 |
| Otras voces Piper en-GB | VITS (Piper) | en-GB | 22050 Hz | segun voz | Piper/ONNX | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas como Coqui TTS o XTTS en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (en-GB); no soporta otros idiomas ni cambio de voz.
- Requiere fonetizacion previa con espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- La calidad es "medium" segun la nomenclatura de Piper; no se documentan controles de emocion, estilo ni prosodia.
- Riesgo de pronunciacion incorrecta en palabras fuera del dominio de entrenamiento o con puntuacion no soportada.
- La model card no registra los datos de entrenamiento exactos ni el modelo base de forma completa, lo que limita la trazabilidad.
- Licencia CC BY 4.0: permite uso comercial con atribucion a Rhasspy; es obligatorio acreditar al autor original.
- La evaluacion de calidad se basa en solo 3 frases de FLORES-200, por lo que el WER de 0,000 no es representativo de todos los dominios.
- No apto para tareas de generacion de texto, razonamiento, codigo ni agentes; es exclusivamente un modelo TTS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alba-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_GB/alba/medium
- Version anterior: https://huggingface.co/Phoonnx/vits-en_gb-alba-medium-espeak
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento (Edinburgh DataShare): https://datashare.ed.ac.uk/handle/10283/3270
- Licencia del dataset: https://creativecommons.org/licenses/by/4.0/
