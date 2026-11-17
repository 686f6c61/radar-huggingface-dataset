# Phoonnx/f5tts-multi-spring-unicode

## Resumen

f5tts-multi-spring-unicode es una voz de síntesis de voz (text-to-speech) para el motor [phoonnx](https://github.com/TigreGotico/phoonnx), distribuida como modelo ONNX. Deriva del modelo SPRINGLab/SPRING_F5, desarrollado por SPRINGLab, que a su vez es un ajuste fino de SWivid/F5-TTS. La conversión a ONNX y su publicación las realiza TigreGotico Lda. El modelo está pensado para síntesis multilingüe en un conjunto amplio de lenguas indias (asamés, bengalí, hindi, kannada, malayalam, tamil, telugu, urdu, entre otras) además del inglés, con una única voz de hablante y clonación de voz a partir de una muestra de referencia.

La arquitectura es F5-TTS, un modelo de TTS basado en flow matching que genera audio a 24 kHz. El modelo no usa fonemizador: lee directamente los puntos de código Unicode del texto, descompuestos en NFD por phoonnx, y se entrenó con la puntuación de cláusula (`,` `.` `!` `?` `:` `;`). El repositorio ocupa 1,9 GB e incluye los grafos ONNX en fp32 e int8.

Es relevante para desarrolladores que necesiten TTS multilingüe offline y ligero en CPU, con despliegue sencillo mediante ONNX Runtime y integración con el stack de asistentes de voz OVOS. Hay que tener en cuenta, no obstante, que la licencia efectiva del modelo entrenado impide el uso comercial (véase la sección de limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | as, bn, bo, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, doi, raj, en (etiqueta `mul`) |
| Licencia | apache-2.0 en la conversión; el modelo base F5-TTS es CC BY-NC 4.0, lo que restringe el uso comercial |
| Formato de pesos | ONNX (`.onnx` fp32 e `_int8.onnx`) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (con clonación por referencia) |
| Fonemizador | ninguno; entrada por puntos de código Unicode (NFD) |
| Tamano del grafo | 1455,0 MB (fp32) / 463,1 MB (int8) |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis basado en flow matching con un transformer como backbone generativo, que produce audio a 24 kHz a partir de texto. La entrada textual se codifica directamente como puntos de código Unicode (descompuestos en NFD por phoonnx), sin fonemización intermedia; el mapeo de voz configura caracteres individuales, igual que F5-TTS hace para texto no chino. El modelo se entrenó con puntuación de cláusula (`,` `.` `!` `?` `:` `;`), que phoonnx 1.96.1a1 y posteriores conservan en la síntesis.

SPRINGLab entrenó el modelo sobre los datasets ai4bharat/IndicVoices y ai4bharat/Rasa, partiendo de SWivid/F5-TTS. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO. La conversión a ONNX la realizó TigreGotico Lda sin alterar los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8, y pasaron un control de calidad que exige audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32 y WER no superior al de fp32 más 0,05.

## Capacidades

- Síntesis de voz multilingüe en más de 20 lenguas indias y en inglés, con una única voz de hablante.
- Clonación de voz a partir de una muestra de referencia corta y su transcripción (`speaker_reference` y `speaker_reference_text`).
- Entrada directa por Unicode, sin fonemizador, lo que simplifica el pipeline para escrituras índicas.
- Manejo de puntuación de cláusula (`,` `.` `!` `?` `:` `;`) para prosodia.
- Generación de audio a 24 kHz.
- Ejecución en CPU mediante ONNX Runtime, con variantes fp32 e int8.
- Integración con el stack OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No se documentan tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz offline para OVOS: el modelo se selecciona como voz `f5tts/spring` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo síntesis local en CPU sin dependencia de servicios en la nube.
- Lectura de contenido en lenguas indias: artículos, notificaciones o textos de interfaz en hindi, tamil, telugu, bengalí, urdu y otras lenguas del conjunto, usando la entrada Unicode directa sin fonemizador.
- Clonación de voz para locuciones personalizadas: a partir de una muestra de referencia y su transcripción, el modelo reproduce el timbre del hablante para generar audios de narración.
- Síntesis en dispositivos con recursos limitados: la variante int8 (grafo de 463,1 MB y pico de RSS de 1193,8 MB) permite desplegar TTS en equipos sin GPU dedicada.
- Prototipado de aplicaciones de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces habilitadas por voz en entornos multilingües.
- Generación de audiolibros o contenido educativo multilingüe: el modelo sintetiza texto con puntuación de cláusula para obtener pausas naturales, con frecuencia de 24 kHz adecuada para reproducción general.
- Investigación en TTS multilingüe: al estar en ONNX y con pesos int8 verificados, sirve como base reproducible para experimentos de evaluación y comparación de motores.

## Benchmarks y rendimiento

La model card incluye únicamente una verificación de calidad (QA) en inglés, medida con ASR nemo-parakeet-tdt-0.6b-v3 int8, sobre 3 frases del devtest de FLORES-200 y con la referencia LJ001-0009 de LJ Speech:

| Check | fp32 | int8 |
|---|---|---|
| Resultado | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 13,8 | no disponible |
| Longitud, int8 / fp32 | no disponible | 1,00 |
| Tamano del grafo | 1455,0 MB | 463,1 MB |
| Pico de RSS | 3201,0 MB | 1193,8 MB |
| RTF (mediana de 3, 4 hilos) | 31,127 | 19,886 |

Medido en un AMD Ryzen 5 7600 de 6 núcleos; RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede extrapolarlos para un modelo de TTS.

## Requisitos de hardware

- VRAM: no disponible; el modelo está orientado a ejecución en CPU mediante ONNX Runtime.
- Pico de memoria (RSS): 3201,0 MB en fp32 y 1193,8 MB en int8, medidos en AMD Ryzen 5 7600.
- GPU recomendadas: no disponibles en la información; no se documenta aceleración por GPU.
- Cabe en hardware consumer: sí; las medidas se realizaron en un procesador de escritorio de 6 núcleos sin GPU.
- Opciones de despliegue: phoonnx con ONNX Runtime (`pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF 31,127 en fp32 y 19,886 en int8 (mediana de 3 ejecuciones con 4 hilos); 13,8 caracteres por segundo en fp32. El RTF superior a 1 indica que la síntesis tarda más que la duración del audio generado en este hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| f5tts-multi-spring-unicode | no disponible | no disponible | >20 lenguas indias + en | apache-2.0 en la conversión; base CC BY-NC 4.0 | Hugging Face (ONNX) |
| SPRINGLab/SPRING_F5 | no disponible | no disponible | multilingüe índico | apache-2.0 (según model card) | Hugging Face |
| SWivid/F5-TTS | no disponible | no disponible | zh + en principalmente | CC BY-NC 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a licencia, idiomas y formato de distribución.

## Limitaciones y advertencias

- Restricción comercial: aunque la conversión se publica bajo apache-2.0, SPRINGLab ajustó el modelo desde SWivid/F5-TTS, que es CC BY-NC 4.0; la propia model card indica que el uso comercial de esta voz no está permitido.
- Atribución: debe acreditarse a SPRINGLab al usar la voz.
- Una sola voz de hablante; la personalización requiere clonación con una muestra de referencia y su transcripción.
- La QA de calidad solo cubre inglés (3 frases de FLORES-200); no hay verificación publicada para las lenguas indias.
- phoonnx elimina el danda (।) al final de una frase en hindi, lo que puede afectar la prosodia final.
- El mapeo de voz configura caracteres individuales; no hay fonemización, por lo que la pronunciación depende de la cobertura Unicode del modelo.
- Riesgo de alucinación acústica o artefactos no evaluado sistemáticamente más allá del control de audio finito y no silencioso de las copias int8.
- RTF superior a 1 en el hardware de referencia implica síntesis más lenta que tiempo real en CPU; no se documenta rendimiento en GPU.
- Sesgos: no se documentan sesgos específicos derivados de los datasets IndicVoices y Rasa en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-spring-unicode
- Modelo base (upstream): https://huggingface.co/SPRINGLab/SPRING_F5
- Modelo original F5-TTS: https://huggingface.co/SWivid/F5-TTS
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
