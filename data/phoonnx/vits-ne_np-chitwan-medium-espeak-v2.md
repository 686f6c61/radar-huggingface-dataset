# Phoonnx/vits-ne_np-chitwan-medium-espeak-v2

## Resumen

`vits-ne_np-chitwan-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en nepalí (ne-NP) basada en la arquitectura VITS del ecosistema Piper. La publica Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original de Rhasspy `rhasspy/piper-voices/ne/ne_NP/chitwan/medium`, que se entrena sobre la base Piper 1.5. El modelo resuelve la generacion de audio hablado en nepalí a partir de fonemas espeak-ng, con una unica hablante y una frecuencia de muestreo de 22050 Hz.

Se trata de una version de reemplazo: la version anterior (`Phoonnx/vits-ne_np-chitwan-medium-espeak`) conserva los pesos antiguos, mientras que esta v2 incorpora el reentrenamiento upstream sobre los modelos base Piper 1.5. El repositorio ocupa aproximadamente 0,1 GB e incluye grafos ONNX en fp32 (63,2 MB) y en int8 (18,7 MB), lo que lo hace apto para inferencia en CPU en entornos con recursos limitados.

Su relevancia es practica: cubre un idioma de bajos recursos (nepalí) con licencia CC0 1.0, sin restricciones para uso comercial, y con un formato ONNX portable que se integra en el ecosistema phoonnx y en asistentes de voz OVOS. No es un modelo de lenguaje generativo, sino un componente de sintesis acustica especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), red generativa end-to-end con decoder acustico y vocoder integrados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | nepalí (ne-NP) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafos `.onnx` en fp32 e `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak-ng (alfabeto IPA) |
| Puntuacion soportada | coma, punto, signos de exclamacion e interrogacion, dos puntos y punto y coma |
| Fonetizador | espeak-ng, voz `ne` |
| Tamano del repositorio | ~0,1 GB |
| Version minima de Piper | 1.5 |

## Arquitectura y entrenamiento

El modelo emplea VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura que sustenta Piper: un sistema end-to-end que transforma fonemas en forma de onda de audio sin un vocoder separado. La entrada no es texto crudo, sino fonemas IPA generados por espeak-ng con la voz `ne`; por ello, la calidad de la sintesis depende directamente de la fonetizacion previa. La inferencia usa por defecto `noise_scale` 0,5 y `noise_w` 0,333.

El entrenamiento lo realizo Rhasspy upstream: se parte de un modelo base `rdh` de calidad media (una hablante flamenca de nl_BE, CC0) y se afina con MRD y SDP sobre datos del proyecto OHF-Voice (`voice-datasets`, licencia CC0). La model card no registra el volumen de datos de entrenamiento ni el numero de tokens o horas de audio. La conversion a ONNX la realiza TigreGotico y no modifica los pesos; las copias int8 si los cuantizan. La validacion de calidad (QA) se hizo sin ASR, mediante comprobacion de longitud y silencios sobre tres frases de FLORES-200 devtest.

## Capacidades

- Sintesis de voz en nepalí (ne-NP) a partir de texto, con una unica hablante.
- Generacion de audio a 22050 Hz en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior.
- Fonemizacion mediante espeak-ng (voz `ne`), con alternativa parcial vía espyak (con posibles errores en algunas palabras).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`.
- Ejecucion en CPU: no requiere GPU para inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo de sintesis.

## Casos de uso

- Asistentes de voz locales en nepalí: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` para dar respuesta hablada en un asistente domestico sin conexion a la nube, aprovechando el bajo consumo en CPU (RSS pico de 208 MB en int8).
- Lectura de contenidos en nepalí: conversion de articulos, avisos o notificaciones a audio para aplicaciones de accesibilidad o de lectura por voz, con el grafo int8 de 18,7 MB embebido en la aplicacion.
- Sistemas de megafonia e informacion publica: generacion de anuncios pregrabados en nepalí para transporte, aeropuertos o comercios, donde la licencia CC0 permite uso comercial sin atribucion obligatoria.
- Educacion y aprendizaje de idiomas: produccion de material de escucha en nepalí con pronunciacion consistente, usando la fonetizacion espeak-ng como capa controlable.
- Integracion en pipelines de sintesis por lotes: generacion masiva de audio en servidores sin GPU, con un RTF de 0,109 en int8 (4 hilos) que permite sintetizar aproximadamente nueve segundos de audio por segundo de computo.
- Prototipado de interfaces conversacionales multilingues: incorporacion de una voz nepalí a un sistema que ya use phoonnx para otras lenguas, reutilizando el mismo `TTSModelManager` y la misma infraestructura de despliegue.

## Benchmarks y rendimiento

Los unicos datos publicados son las comprobaciones de calidad de la model card, medidas en un Intel Core i9-11900H a 2,50 GHz con 4 hilos y RTF como mediana de 3 ejecuciones:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pasa | pasa |
| Caracteres por segundo | 15,1 a 16,4 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 0,99 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 267,6 MB | 208,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,044 | 0,109 |

No se han publicado resultados de benchmarks comparativos (MOS, WER de ASR, MCD) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU. El consumo de memoria es de 267,6 MB (RSS pico) en fp32 y 208,0 MB en int8.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU moderna podria ejecutar ONNX Runtime, pero no aporta ventaja significativa para este tamano.
- Cabe en cualquier equipo consumer: el grafo int8 de 18,7 MB y el pico de 208 MB de RAM lo permiten en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: phoonnx (libreria nativa del modelo, `pip install --pre phoonnx`), ONNX Runtime directamente, y el plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con espyak).
- Latencia y rendimiento: RTF de 0,044 en fp32 y 0,109 en int8 con 4 hilos en el i9-11900H; es decir, la sintesis fp32 es aproximadamente 23 veces mas rapida que tiempo real y la int8 unas 9 veces. La cuantizacion int8 reduce el tamano y la memoria pero aumenta el RTF en este hardware.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ne_np-chitwan-medium-espeak-v2 | ne-NP | VITS (Piper) | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Version actual, base Piper 1.5 |
| Phoonnx/vits-ne_np-chitwan-medium-espeak | ne-NP | VITS (Piper) | 22050 Hz | CC0 1.0 | ONNX | Version anterior, pesos previos al reentrenamiento |
| rhasspy/piper-voices (ne/ne_NP/chitwan/medium) | ne-NP | VITS (Piper) | 22050 Hz | CC0 1.0 | Piper/ONNX | Modelo upstream original de Rhasspy |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de un unico idioma (nepalí, ne-NP) y una unica hablante; no cubre otros idiomas ni variantes dialectales.
- La calidad depende de la fonetizacion espeak-ng; con espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se registran los datos de entrenamiento upstream, lo que impide auditar sesgos de la hablante o del corpus.
- Riesgo de artefactos acusticos y de prosodia limitada en frases largas o con puntuacion atipica; la QA solo valido tres frases de FLORES-200 devtest sin ASR.
- La cuantizacion int8 altera ligeramente la duracion del audio (0,98 a 0,99 respecto a fp32) y aumenta el RTF frente a fp32.
- Licencia CC0 1.0: permite uso comercial y modificacion sin atribucion obligatoria, aunque la model card pide citar a Rhasspy.
- Requiere espeak-ng como dependencia externa del sistema; sin el, la sintesis no funciona correctamente.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ne_np-chitwan-medium-espeak-v2
- Version anterior: https://huggingface.co/Phoonnx/vits-ne_np-chitwan-medium-espeak
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ne/ne_NP/chitwan/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Datos de voz OHF-Voice: https://github.com/OHF-Voice/voice-datasets
- TigreGotico: https://tigregotico.pt
