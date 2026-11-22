# Phoonnx/vits-eu-maider-espeak-v2

## Resumen

vits-eu-maider-espeak-v2 es una voz de síntesis de voz (text-to-speech) en euskera, convertida al formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por Rhasspy dentro del proyecto Piper y publicado en rhasspy/piper-voices bajo la ruta `eu/eu_ES/maider/medium`. La conversión a ONNX la firma Phoonnx (TigreGotico Lda), que redistribuye los pesos sin modificarlos bajo la misma licencia CC BY 4.0. Esta versión v2 sustituye a `Phoonnx/vits-eu-maider-espeak`, ya que el upstream reentrenó la voz sobre los modelos base de Piper 1.5.

Se trata de un modelo VITS de tamaño medio (63,2 MB en fp32, 18,7 MB en int8) con una única hablante, frecuencia de muestreo de 22050 Hz y entrada de fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje: es un sintetizador acústico neuronal que convierte fonemas en onda de audio. Su relevancia radica en que cubre una lengua de bajos recursos como el euskera con un modelo ligero, cuantizable a int8 y ejecutable en CPU con un RTF de 0,040 en fp32.

El modelo está pensado para integrarse en asistentes de voz y sistemas de lectura en euskera, especialmente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. Al ser una conversión de pesos Piper, hereda las limitaciones y garantías del pipeline original, incluida la dependencia del fonemizador espeak-ng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic con QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | euskera (eu) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

Otros datos tecnicos: frecuencia de muestreo 22050 Hz, una sola hablante, entrada de texto convertida a fonemas espeak-ng (IPA), puntuación soportada `, . ! ? : ;`, tamaño del grafo 63,2 MB (fp32) y 18,7 MB (int8), pico de RSS 261,1 MB (fp32) y 220,5 MB (int8), identificador de voz `piper_community/itzune/eu-maider-medium-v2`.

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo condicional que combina un codificador de texto, un prior y un decodificador acústico entrenados de forma adversarial con alineamiento monotónico, empaquetado en el formato Piper. El texto de entrada no se procesa directamente: se convierte primero a fonemas con espeak-ng (voz `eu`) y se alimenta al modelo en alfabeto IPA. La síntesis usa por defecto `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior. La conversión a ONNX no altera los pesos; las copias int8 aplican cuantización dinámica.

El entrenamiento lo realizó Rhasspy (upstream) partiendo del modelo base `hifi_tts_92` de inglés estadounidense (voz de Cori Samuel, lectora 92 de Hi-Fi TTS), con fine-tuning mediante MRD y SDP. Los datos de entrenamiento provienen del dataset `itzune/maider-dataset`, publicado bajo CC BY 4.0; el número de horas, tokens o composición del corpus no está registrado en la model card upstream. No se documenta uso de RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz monolocutor en euskera a partir de texto con fonemización espeak-ng.
- Preserva la puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz mediante `voice.synthesize_wav`.
- Ejecución en CPU con modelos ONNX fp32 e int8; no requiere GPU.
- Integración con asistentes OVOS/Mycroft a través de `ovos-tts-plugin-phoonnx`.
- Soporte de cuantización dinámica int8 con validación de audio (longitud entre 0,8 y 1,25 veces la de fp32, audio finito y no silencioso).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un sintetizador.

## Casos de uso

- Asistentes de voz en euskera sobre OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz en `mycroft.conf` y generar respuestas habladas en local sin depender de servicios en la nube.
- Lectura de textos y accesibilidad: conversión de documentos, noticias o artículos a audio en euskera con un modelo de 18,7 MB en int8 que cabe en cualquier equipo y se ejecuta en CPU.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en euskera con latencia baja (RTF 0,040 en fp32 sobre un i9-11900H), adecuada para entornos con recursos limitados.
- Integración en aplicaciones de escritorio o móviles: el formato ONNX y el reducido tamaño del grafo permiten embeber el sintetizador en aplicaciones sin GPU dedicada.
- Prototipado de interfaces conversacionales en euskera: al ser una voz Piper, se integra en pipelines existentes de Piper/phoonnx y sirve para validar flujos de diálogo antes de invertir en voces comerciales.
- Generación de material educativo o de aprendizaje de euskera: síntesis controlada de frases con puntuación preservada para ejercicios de pronunciación y dictado.
- Sustitución de la versión anterior: al reentrenarse sobre Piper 1.5, esta v2 reemplaza a `Phoonnx/vits-eu-maider-espeak` en despliegues existentes sin cambios de API.

## Benchmarks y rendimiento

Los únicos datos publicados son las pruebas de control de calidad (QA) del autor de la conversión, medidas sobre un Intel Core i9-11900H a 2,50 GHz con 4 hilos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 14,9 a 16,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 1,02 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 261,1 MB | 220,5 MB |
| RTF (mediana de 3) | 0,040 | 0,101 |

El método de QA no emplea ASR: comprueba longitud y silencio sobre 3 frases de FLORES-200 devtest. No se han publicado resultados de benchmarks comparativos (MOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU. El consumo es de memoria RAM, con pico de RSS de 261,1 MB en fp32 y 220,5 MB en int8.
- GPU recomendadas: no se especifican; al ser ONNX en CPU, no requiere GPU. Cualquier GPU compatible con onnxruntime podría usarse, pero no está documentado.
- Cabe en cualquier equipo de consumo: el grafo int8 de 18,7 MB y el pico de 220,5 MB de RSS permiten ejecutarlo en portátiles, Raspberry Pi y dispositivos embebidos con holgura.
- Opciones de despliegue: phoonnx (librería nativa, `pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF 0,040 en fp32 y 0,101 en int8 (mediana de 3 ejecuciones, 4 hilos), es decir, entre 10 y 25 veces más rápido que tiempo real en el hardware de referencia. Los caracteres por segundo en fp32 se sitúan entre 14,9 y 16,1.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-eu-maider-espeak-v2 | VITS (Piper), ONNX | eu | 63,2 MB fp32 / 18,7 MB int8 | no aplica | CC BY 4.0 | Hugging Face |
| Phoonnx/vits-eu-maider-espeak | VITS (Piper), ONNX | eu | no disponible | no aplica | CC BY 4.0 | Hugging Face (sustituido por v2) |
| rhasspy/piper-voices (eu/eu_ES/maider/medium) | VITS (Piper) | eu | no disponible | no aplica | CC BY 4.0 | Hugging Face (upstream) |

La comparativa se limita a las variantes de la misma voz porque la información disponible no incluye otros sintetizadores en euskera con datos verificables de tamaño, licencia y rendimiento. La diferencia principal entre la v2 y la versión anterior es el reentrenamiento sobre Piper 1.5; la conversión a ONNX es idéntica en enfoque.

## Limitaciones y advertencias

- Modelo monolocutor y monolingüe: solo sintetiza euskera con una única voz; no admite cambio de hablante ni otros idiomas.
- Dependencia de espeak-ng: los fonemas deben generarse con espeak-ng voz `eu`. Con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Sin datos de entrenamiento documentados: el upstream no registra el corpus, el número de horas ni la composición del dataset, lo que impide evaluar cobertura y sesgos de forma rigurosa.
- Calidad media: la voz es de calidad "medium" del catálogo Piper, no de calidad alta; puede presentar artefactos en textos largos o con puntuación atípica.
- QA limitado: la validación se hizo con 3 frases de FLORES-200 y sin ASR (solo longitud y silencio), por lo que no hay medidas objetivas de inteligibilidad ni de naturalidad.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y préstamos no cubiertos por el fonemizador.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a Rhasspy (y a TigreGotico por la conversión). No hay restricciones adicionales documentadas.
- La cuantización int8 reduce el tamaño a 18,7 MB pero multiplica el RTF por 2,5 (0,101 frente a 0,040); conviene validar la calidad del audio int8 en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni retroalimentación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-eu-maider-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/eu/eu_ES/maider/medium
- Versión anterior sustituida: https://huggingface.co/Phoonnx/vits-eu-maider-espeak
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Dataset de entrenamiento: https://huggingface.co/datasets/itzune/maider-dataset
- TigreGotico: https://tigregotico.pt
