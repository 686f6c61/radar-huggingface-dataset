# Phoonnx/vits-bn_bd-google-medium-espeak

## Resumen

vits-bn_bd-google-medium-espeak es una voz de sintesis de voz (text-to-speech) basada en la arquitectura VITS del ecosistema Piper, publicada por Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original de Rhasspy. El modelo genera audio en bengali de Bangladesh (bn-BD) a partir de fonemas IPA producidos por espeak-ng, con una frecuencia de muestreo de 22050 Hz y soporte para 16 hablantes distintos. Su relevancia radica en que ofrece una voz TTS ligera y ejecutable en CPU para un idioma de bajos recursos como el bengali, con variantes fp32 e int8 que caben en menos de 300 MB de memoria residente.

El modelo no es un modelo de lenguaje generativo ni un transformer de gran escala: es un sistema TTS neuronal de extremo a extremo (VITS) que combina un codificador de texto, un prior variacional y un decodificador de audio con discriminadores adversarios. El repositorio ocupa 0,1 GB e incluye unicamente los grafos ONNX y sus copias cuantizadas, no el checkpoint de entrenamiento. La licencia es CC BY-SA 4.0, heredada del corpus OpenSLR 37 y de la licencia CMU del proyecto festvox cmu_indic.

La ficha resulta relevante para desarrolladores que necesitan anadir sintesis de voz en bengali a asistentes, sistemas de accesibilidad o pipelines de audio sin depender de GPUs ni de servicios en la nube, y que acepten las obligaciones de atribucion y compartir-igual de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), conversion a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto/fonemas, no ventana de contexto) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, cuantizacion dinamica con onnxruntime.quantization.quantize_dynamic) |
| Idiomas soportados | bengali de Bangladesh (bn-BD) |
| Licencia | CC BY-SA 4.0 (OpenSLR 37) y licencia CMU (festvox cmu_indic) |
| Formato de pesos | ONNX (`<graph>.onnx` e `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 16 |
| Entrada de texto | fonemas espeak (alfabeto IPA), fonemizador espeak-ng voz bn |
| Puntuacion | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma (soportada desde phoonnx 1.96.1a1) |
| Tamano del grafo | 76,8 MB (fp32) / 22,1 MB (int8) |
| Pico de RSS | 265,0 MB (fp32) / 223,0 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,037 (fp32) / 0,094 (int8) |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz neuronal de extremo a extremo que integra un codificador de texto, un prior variacional condicionado por texto, un decodificador de audio basado en flujos y un discriminador adversarial multiperiodo. Piper es la implementacion practica de VITS orientada a inferencia ligera; este repositorio contiene la conversion de los pesos de Piper a grafos ONNX para su uso con la libreria phoonnx. El modelo fue entrenado originalmente por Rhasspy y despues convertido por TigreGotico Lda sin modificar los pesos; las copias int8 aplican cuantizacion dinamica QInt8 sobre los grafos.

Segun la model card upstream, el entrenamiento parte de un ajuste fino (finetuning) del modelo base hifi_tts_92 de ingles estadounidense (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), aplicando MRD y SDP. Los datos de entrenamiento proceden de OpenSLR 37 (corpus bengali) y de festvox cmu_indic, aunque la model card indica que el conjunto exacto de datos de entrenamiento no queda registrado upstream. Los ajustes de inferencia por defecto son noise_scale 0,5 y noise_w 0,333, y se requiere Piper 1.5 o superior. La model card no documenta el numero de tokens ni la composicion detallada del dataset.

## Capacidades

- Sintesis de voz en bengali de Bangladesh (bn-BD) a partir de texto con fonemizacion espeak-ng.
- Soporte de 16 hablantes distintos en un mismo modelo.
- Entrada basada en fonemas IPA, lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Manejo de puntuacion de clausula (coma, punto, exclamacion, interrogacion, dos puntos, punto y coma) para prosodia, desde phoonnx 1.96.1a1.
- Salida de audio WAV a 22050 Hz mediante `synthesize_wav`.
- Ejecucion en CPU sin GPU, con grafos ONNX ligeros (22,1 MB en int8).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en bengali para OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/bn_BD-google-medium` en `mycroft.conf` y obtener respuestas habladas en bn-BD sin servicio en la nube.
- Accesibilidad para lectores de pantalla: el modelo puede convertir texto en bengali a audio a 22050 Hz en tiempo real (RTF 0,037 en fp32 sobre un i9-11900H), adecuado para leer articulos o interfaces con baja latencia.
- Locucion automatica de contenidos: generacion de narraciones en bengali para podcasts, audiolibros o videos, eligiendo entre los 16 hablantes disponibles para variar la voz.
- Sistemas de anuncios publicos o telefonia IVR: sintesis de mensajes cortos en bn-BD con despliegue en CPU, sin necesidad de infraestructura GPU.
- Prototipado de productos de voz para el mercado bangladesi: al ser un grafo ONNX de 22,1 MB en int8 con pico de RSS de 223 MB, cabe en contenedores pequenos y entornos edge.
- Investigacion en TTS de bajos recursos: sirve como referencia para comparar calidad y latencia de VITS/Piper frente a otros sistemas en bengali, y como base para experimentos de cuantizacion (fp32 frente a int8).
- Generacion de datos de audio sintetico para aumentar corpus de ASR en bn-BD, controlando hablante y prosodia mediante fonemas IPA.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MOS, WER, MCD) ni comparaciones con otros modelos. Los unicos datos medidos son de control de calidad (QA) y rendimiento de inferencia sobre un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (comprobacion de longitud y silencio, sin ASR) | pass | pass |
| Caracteres por segundo | 13,5 a 15,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 a 1,06 |
| Tamano del grafo | 76,8 MB | 22,1 MB |
| Pico de RSS | 265,0 MB | 223,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,037 | 0,094 |

No se han publicado resultados de benchmarks de calidad subjetiva u objetiva en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Memoria RAM estimada: pico de RSS de 265,0 MB en fp32 y 223,0 MB en int8.
- GPU recomendadas: no se requieren; el modelo esta pensado para CPU. No hay datos de rendimiento en GPU.
- Cabe en cualquier equipo consumer: el grafo int8 de 22,1 MB y el fp32 de 76,8 MB se ejecutan en CPU de portatil o en entornos edge.
- Opciones de despliegue: libreria phoonnx (`pip install --pre phoonnx`) con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); integracion con OVOS via `ovos-tts-plugin-phoonnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS VITS).
- Latencia y throughput: RTF 0,037 en fp32 y 0,094 en int8 con 4 hilos en un i9-11900H; es decir, sintetizar un segundo de audio cuesta entre 37 y 94 ms de computo segun precision. La cuantizacion int8 reduce el tamano del grafo un 71 % pero aumenta el RTF aproximadamente 2,5 veces.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-bn_bd-google-medium-espeak | VITS (Piper) ONNX | bn-BD | 16 | 76,8 MB fp32 / 22,1 MB int8 | CC BY-SA 4.0 + CMU | Hugging Face |
| rhasspy/piper-voices (bn/bn_BD/google/medium) | VITS (Piper) | bn-BD | 16 | no disponible en la informacion | CC BY-SA 4.0 + CMU | Hugging Face |
| Otras voces Piper de otros idiomas | VITS (Piper) | varios | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, WER) entre este modelo y alternativas en la informacion proporcionada. El modelo upstream de Rhasspy es funcionalmente equivalente en pesos; la diferencia es el formato ONNX y las copias int8 para phoonnx.

## Limitaciones y advertencias

- Solo soporta bengali de Bangladesh (bn-BD); no es multilingue.
- Requiere espeak-ng instalado para la fonemizacion; sin el, el port espyak puede pronunciar mal algunas palabras porque sus fonemas difieren de los de espeak-ng.
- La calidad de sintesis no esta validada con ASR ni con pruebas subjetivas (MOS); el QA documentado solo comprueba longitud y ausencia de silencio en 3 frases de FLORES-200 devtest.
- Los datos de entrenamiento exactos no estan registrados upstream, lo que limita la trazabilidad y la evaluacion de sesgos.
- Riesgo de prosodia incorrecta o artefactos en textos fuera del dominio del corpus OpenSLR 37 y cmu_indic.
- La licencia CC BY-SA 4.0 obliga a atribuir a Rhasspy y a compartir las obras derivadas bajo la misma licencia; la licencia CMU anade condiciones adicionales. Revisar ambas antes de uso comercial.
- La cuantizacion int8 multiplica el RTF por aproximadamente 2,5 (0,094 frente a 0,037), aunque reduce el tamano del grafo y el uso de memoria.
- No incluye checkpoint de entrenamiento en el repositorio, solo los grafos ONNX; no es posible reentrenar directamente desde este repo.
- No soporta tool calling, agentes ni razonamiento; cualquier caso de uso que requiera comprension del lenguaje debe combinarse con un LLM externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-bn_bd-google-medium-espeak
- Modelo upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/bn/bn_BD/google/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Corpus OpenSLR 37: http://www.openslr.org/37/
- Festvox CMU Indic: http://festvox.org/cmu_indic/index.html
