# Phoonnx/vits-pl_pl-bass-high-espeak

## Resumen

vits-pl_pl-bass-high-espeak es una voz de sintesis de voz (text-to-speech) en polaco para el motor phoonnx, publicada por Phoonnx (TigreGotico Lda). Se trata de una conversion a formato ONNX del modelo VITS original entrenado por blackbartblues y distribuido dentro del repositorio rhasspy/piper-voices, en la ruta pl/pl_PL/bass/high. El modelo no introduce pesos nuevos: la conversion preserva los pesos originales y anade copias cuantizadas en int8 para reducir el tamano del grafo.

La arquitectura es VITS en su variante Piper, un modelo de sintesis neuronal extremo a extremo que combina un encoder de texto basado en fonemas, un decoder acustico y un vocoder integrado. La entrada no es texto plano sino fonemas del alfabeto IPA generados con espeak-ng (voz pl), lo que condiciona tanto la integracion como la calidad de pronunciacion. La salida es audio mono a 22050 Hz con una unica hablante, identificada como "bass" en el nombre del modelo.

Su relevancia practica es acotada pero clara: ofrece una voz polaca ligera (114,2 MB en fp32, 38,1 MB en int8) que puede ejecutarse en CPU sin GPU, con un factor de tiempo real (RTF) de 0,236 en fp32 y 0,735 en int8 sobre un Intel i9-11900H. Esto la hace util para asistentes de voz embebidos, sistemas OVOS/Mycroft y cualquier pipeline TTS que necesite sintesis en polaco con requisitos de hardware minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frases) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (cuantizacion dinamica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz, mono, 1 hablante |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA; fonemizador espeak-ng voz pl |
| Puntuacion | entrenada con , . ! ? : ; (preservada desde phoonnx 1.96.1a1) |
| Tamano del grafo | 114,2 MB (fp32) / 38,1 MB (int8) |
| Pico de RSS | 333,9 MB (fp32) / 286,7 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,236 (fp32) / 0,735 (int8) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de sintesis de voz que integra en una sola red el encoder de texto, el predictor de duraciones, el flujo normalizador y el decoder/vocoder basado en HiFi-GAN. La variante Piper anade un front-end de fonemizacion externo: en este caso, espeak-ng con la voz pl, que convierte el texto en secuencias de fonemas IPA. El modelo es de hablante unica y produce audio a 22050 Hz.

No se dispone de informacion sobre el dataset de entrenamiento: la model card original de rhasspy/piper-voices no registra URL de dataset ni numero de tokens o horas de audio. Tampoco se documentan detalles de entrenamiento como el uso de RLHF, DPO u otras tecnicas de alineacion, ni el checkpoint de entrenamiento (no incluido en este repositorio). La conversion a ONNX no modifica los pesos; las copias int8 aplican cuantizacion dinamica sobre los mismos, con verificacion de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest.

## Capacidades

- Sintesis de voz en polaco (pl-PL) a partir de texto, con una unica hablante de registro "bass".
- Generacion de audio a 22050 Hz en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Procesamiento de puntuacion de clausula (, . ! ? : ;) para modelar pausas y entonacion, siempre que se use phoonnx 1.96.1a1 o posterior.
- Fonemizacion mediante espeak-ng (voz pl) o, alternativamente, el port espyak incluido en el extra `phoonnx[espeak]`.
- Ejecucion en CPU sin GPU, con grafos ONNX en fp32 e int8.
- Integracion con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz embebidos en polaco: integracion en OVOS/Mycroft seleccionando la voz `piper/pl_PL-bass-high` en `mycroft.conf`; el modelo cabe en menos de 300 MB de RSS y funciona sin GPU, lo que encaja en dispositivos de bajos recursos.
- Lectura de notificaciones y alertas en sistemas domoticos: la sintesis de frases cortas con puntuacion preservada permite generar avisos con pausas naturales en tiempo real (RTF 0,236 en fp32 sobre CPU de portatil).
- Generacion de audiolibros o contenido narrado en polaco: el modelo procesa frases completas y mantiene la puntuacion de clausula, adecuado para narracion por lotes con un throughput razonable en CPU.
- Accesibilidad para personas con discapacidad visual: lectura de textos en pantalla en polaco con latencia baja y sin dependencia de servicios en la nube, lo que evita enviar contenido a terceros.
- Pruebas automatizadas de pipelines TTS: el par fp32/int8 con verificacion ASR y WER documentado (0,000 en fp32, 0,045 en int8) permite validar regresiones de calidad en integracion continua.
- Prototipado de interfaces conversacionales en polaco: al ser Apache 2.0 y ejecutarse en CPU, sirve para demos y pruebas de concepto de IVR o chatbots de voz sin coste de infraestructura GPU.
- Generacion de voces para contenido multimedia localizado: sustitucion de locuciones en polaco en videos o presentaciones mediante sintesis por lotes con phoonnx.

## Benchmarks y rendimiento

La model card solo documenta la verificacion de calidad de la cuantizacion, no benchmarks comparativos con otros modelos TTS.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (ASR nemo-parakeet-tdt-0.6b-v3 int8) | pass | pass |
| WER (FLORES-200 devtest, 3 frases) | 0,000 | 0,045 |
| Caracteres por segundo | 14,3 a 15,4 | no disponible |
| Ratio de longitud int8 / fp32 | no aplica | 0,99 a 1,06 |
| Tamano del grafo | 114,2 MB | 38,1 MB |
| Pico de RSS | 333,9 MB | 286,7 MB |
| RTF (mediana de 3, 4 hilos) | 0,236 | 0,735 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF se define como tiempo de sintesis dividido por la duracion del audio.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU. En GPU, el grafo de 114,2 MB (fp32) o 38,1 MB (int8) ocupa una fraccion minima de memoria, pero no se documentan requisitos de VRAM.
- GPU recomendadas: no disponibles; no se han publicado mediciones en GPU.
- CPU: funciona en CPU de consumo; las mediciones de referencia usan un Intel Core i9-11900H con 4 hilos.
- Memoria RAM: pico de RSS de 333,9 MB en fp32 y 286,7 MB en int8, por lo que cabe holgadamente en cualquier equipo moderno.
- Cabe en hardware de consumo: si, tanto en portatiles como en placas SBC con suficiente RAM.
- Opciones de despliegue: phoonnx (libreria nativa, con `pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime para inferencia directa sobre los grafos.
- Latencia y throughput: RTF de 0,236 en fp32 y 0,735 en int8 (menor es mejor); 14,3 a 15,4 caracteres por segundo en fp32. La version int8 es mas rapida en tamano pero mas lenta en RTF segun las mediciones publicadas.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el port espyak mediante `pip install --pre "phoonnx[espeak]"`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como alternativas de la misma categoria (TTS ligero en polaco basado en Piper/VITS) pueden citarse otras voces del repositorio rhasspy/piper-voices, pero no se han publicado metricas comparativas en esta ficha.

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-pl_pl-bass-high-espeak | VITS (Piper) | pl-PL | ONNX fp32/int8 | Apache 2.0 | Conversion de rhasspy/piper-voices; 1 hablante; 22050 Hz |
| Otras voces de rhasspy/piper-voices (pl_PL) | VITS (Piper) | pl-PL | ONNX / otros | Apache 2.0 | Mismo origen upstream; hablantes y calidades no comparadas en la informacion disponible |
| Modelos TTS multilingues de gran tamano | no disponible | varios | no disponible | no disponible | No se dispone de datos para comparar rendimiento |

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sintetiza polaco (pl-PL) con una unica voz; no admite cambio de hablante ni otros idiomas.
- Dependencia de espeak-ng: la fonemizacion se realiza con espeak-ng voz pl. Si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Calidad condicionada por la puntuacion: la preservacion de la puntuacion de clausula requiere phoonnx 1.96.1a1 o posterior; versiones anteriores pueden alterar las pausas.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir artefactos, silencios o audio no finito en entradas anomalas; la verificacion QA solo cubrio tres frases de FLORES-200 devtest.
- WER no nulo en int8: la cuantizacion eleva el WER de 0,000 a 0,045 en la prueba ASR, por lo que la version int8 puede degradar ligeramente la inteligibilidad.
- Sin datos de entrenamiento: se desconoce la composicion del dataset, el numero de horas de audio y los posibles sesgos de la voz original; no se puede evaluar la representatividad demografica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige atribucion a blackbartblues (entrenamiento original) y a TigreGotico Lda (conversion ONNX).
- Sin checkpoint de entrenamiento en el repositorio: no es posible reentrenar ni ajustar el modelo a partir de los ficheros publicados.
- Sin datos de latencia en GPU: las mediciones publicadas son exclusivamente en CPU, por lo que el rendimiento en aceleradores no esta caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-bass-high-espeak
- Modelo upstream (rhasspy/piper-voices, pl/pl_PL/bass/high): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pl/pl_PL/bass/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
