# rodrigovzq/moodlink-emotion-cnn

## Resumen

MoodLink emotion CNN es un par de modelos de clasificación de emociones en voz (speech emotion recognition, SER) empaquetados como artefactos TensorFlow Lite con cuantización entera completa (INT8). Lo desarrolla el autor independiente `rodrigovzq` y está pensado para inferencia en microcontroladores ESP32-S3 dentro del proyecto MoodLink, una iniciativa de TinyML orientada a wearables. Cada modelo recibe los coeficientes MFCC de una ventana fija de 4 segundos de audio y devuelve una distribución de probabilidad sobre siete etiquetas emocionales: `anger`, `disgust`, `fear`, `happy`, `neutral`, `sad` y `surprise`.

La relevancia del artefacto no está en su precisión —modesta, en torno al 50-72 % según versión y protocolo— sino en su naturaleza: son redes convolucionales separables de apenas 384.208 parámetros (432 KiB) que caben y se ejecutan en un ESP32-S3 real, con kernels ESP-NN y un tensor arena de 512 KB en PSRAM. Es un ejemplo práctico de cómo llevar un clasificador de audio a un microcontrolador con presupuesto de memoria y cómputo muy restringido.

El repositorio contiene dos variantes no intercambiables (v12 y v11.1), cada una adaptada a una placa distinta (Waveshare ESP32-S3-Touch-AMOLED 2.06 y LilyGO T-Circle S3) y con preprocesado, cuantización de entrada y corpus de entrenamiento diferentes. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones separables (depthwise + pointwise), global average pooling y una cabeza densa de 7 salidas |
| Parametros totales | 384.208 (artefacto desplegado, ambas versiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 4 s de audio; entrada `[1, 40, 100, 1]` (40 coeficientes MFCC x 100 frames) |
| Tipos de cuantizacion | INT8 full-integer (entrada/salida per-tensor; 18 tensores per-channel). Checkpoints float32 en Keras disponibles |
| Idiomas soportados | inglés (único idioma entrenado y validado) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (INT8) y `.keras` (float32, Keras 2.15.0 / TensorFlow 2.15.0) |

## Arquitectura y entrenamiento

Ambos artefactos comparten topología: convoluciones separables en profundidad, global average pooling y una única capa densa con siete salidas. El grafo INT8 usa solo seis tipos de operador (`CONV_2D`, `DEPTHWISE_CONV_2D`, `MAX_POOL_2D`, `MEAN`, `FULLY_CONNECTED` y `SOFTMAX`). La cuantización es entera completa: entrada y salida per-tensor, y dieciocho tensores con cuantización per-channel (cinco kernels pointwise y nueve sesgos en el eje 0, más cuatro kernels depthwise en el eje 3). Los kernels de las dos capas densas son per-tensor. La salida ya viene pasada por softmax con escala 0.00390625 y zero point −128, de modo que la probabilidad se recupera como `p = (q + 128) / 256`.

Las dos versiones difieren en el preprocesado y en los datos. v12 se entrenó con aumentado de canal sobre grabaciones de estudio más un corpus regrabado a través del códec ES7210 del prototipo, usa MFCC con hop de 1.761 muestras (39,93 ms) y aplica normalización de media cepstral (CMN). v11.1 se entrenó en dos etapas: preentrenamiento con las grabaciones de estudio y ajuste con un corpus MEMS regrabado (ya no disponible), con hop de 512 muestras (11,61 ms) y sin CMN. En ambos casos el entrenamiento se hizo solo con habla inglesa actuada, sin habla espontánea. El checkpoint float de v11.1 tiene 518.359 parámetros y dos cabezas (una por dominio acústico); el artefacto desplegado es el submodelo `backbone` + `head_mems`, con una sola salida de siete clases. No se publican scripts de entrenamiento ni muestras de audio.

## Capacidades

- Clasificación de emociones en habla inglesa en siete categorías discretas a partir de ventanas de 4 s.
- Inferencia INT8 en microcontroladores ESP32-S3 mediante `esp-tflite-micro` 1.3.4 y kernels `esp-nn` 1.1.1 sobre ESP-IDF 4.4.7.
- Cinco de los seis tipos de operador se despachan a kernels ESP-NN (incluido `SOFTMAX` vía `esp_nn_softmax_s8`); `MEAN` usa la implementación de referencia.
- Ejecución con un tensor arena de 512 KB en PSRAM.
- Salida calibrada como distribución de probabilidad sobre las siete etiquetas, apta para umbrales y lógica de decisión en el dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni streaming (el grafo no mantiene estado entre llamadas).

## Casos de uso

- Clasificación de emoción en un wearable con ESP32-S3: el modelo procesa una ventana de 4 s capturada por un micrófono MEMS o por el códec ES7210 y devuelve la distribución de siete emociones para lógica local de respuesta (por ejemplo, cambiar el tono de una interfaz). Cabe en 432 KiB y se ejecuta enteramente en el dispositivo.
- Estudio de cuantización INT8 en el borde: el repositorio publica `quant_info.json`, `stats.json` y métricas por versión, lo que permite reproducir el análisis de fidelidad de cuantización (float32 frente a INT8) sobre el mismo grafo.
- Benchmark de kernels ESP-NN: sirve como carga de referencia para medir latencia y throughput de `CONV_2D`, `DEPTHWISE_CONV_2D` y `SOFTMAX` en ESP32-S3 con distintas versiones de `esp-tflite-micro`.
- Prototipado de interfaces afectivas en domótica o juguetes: integración de la inferencia local en un dispositivo sin conectividad, con la salida de siete clases alimentando reglas simples.
- Docencia y demostraciones de TinyML: ejemplo completo de pipeline MFCC → CNN separable → TFLite INT8 → microcontrolador, útil para cursos de despliegue en el borde.
- Validación de hardware de audio: comparación entre el corpus ES7210 y el corpus MEMS original permite evaluar el impacto del front-end analógico en la precisión (71,42 % solo con ES7210 en v12).

## Benchmarks y rendimiento

| Modelo | Precisión | Exactitud | Protocolo |
|---|---|---|---|
| v12 | INT8 | 71,81 % | Split de validación de 4.864 muestras (2.432 ES7210 + 2.432 originales), inferencia en ordenador; 71,42 % solo con las grabaciones ES7210 |
| v12 | float32 | 71,90 % | Mismo split |
| v12 | INT8 | 60,71 % (17 de 28) | 28 tomas evaluadas en la placa |
| v11.1 | INT8 | 49,92 % | 2.440 muestras MEMS reservadas, split de validación de etapa 2 |
| v11.1 | INT8 | 59,84 % (7.278 de 12.162) | Fidelidad de cuantización sobre el corpus MEMS completo; 9.722 muestras se usaron en entrenamiento, no es una cifra de generalización |
| v11.1 | float32 | 59,87 % | Corpus MEMS completo, float32 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las cifras anteriores son las únicas reportadas por el autor.

## Requisitos de hardware

- Despliegue objetivo: ESP32-S3 con PSRAM; tensor arena de 512 KB.
- Placas validadas por el autor: Waveshare ESP32-S3-Touch-AMOLED 2.06 (v12) y LilyGO T-Circle S3 (v11.1).
- Tamaño del artefacto: 442.928 bytes (v12) y 442.984 bytes (v11.1), aproximadamente 432 KiB cada uno.
- Runtime: `esp-tflite-micro` 1.3.4, `esp-nn` 1.1.1 y ESP-IDF 4.4.7.
- No requiere GPU. La inferencia float32 en ordenador se usa solo para evaluación y comparación con el artefacto INT8.
- Latencia y throughput en la placa: no disponibles en la información proporcionada (solo se reporta la precisión de 17 de 28 aciertos en 28 tomas en dispositivo).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento y licencia) para establecer una comparativa rigurosa. Los clasificadores SER típicos en el borde (por ejemplo, variantes ligeras de wav2vec2 o CNN sobre MFCC) no aparecen referenciados en la model card. Comparativa: no disponible.

## Limitaciones y advertencias

- Solo validado en inglés y con habla actuada; no se evaluó con habla espontánea ni con otros idiomas.
- Precisión modesta: 49,92 % INT8 en v11.1 y 71,81 % INT8 en v12 sobre sus respectivos splits; la cifra de 59,84 % de v11.1 mide fidelidad de cuantización, no generalización.
- Las dos versiones no son intercambiables: difieren en preprocesado, cuantización de entrada y corpus.
- No apto para evaluación médica, clínica o psicológica, ni para monitorización de personas, ni para decisiones con efectos legales, económicos o académicos, ni para sistemas de seguridad crítica (fuera de alcance declarado por el autor).
- No proporciona estimación afectiva continua; solo siete categorías discretas.
- Sin inferencia en streaming: la entrada es una ventana fija de 4 s y el grafo no guarda estado entre llamadas.
- Riesgo de alucinación de etiqueta inherente a un clasificador: la salida softmax siempre asigna probabilidad a las siete clases, incluso ante audio fuera de distribución.
- No se publican scripts de entrenamiento, muestras de audio, los `.keras` de las dos etapas de v11.1 ni la caché `X_all.npy`, lo que limita la reproducibilidad completa.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera de los dominios acústicos evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rodrigovzq/moodlink-emotion-cnn
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- TensorFlow Lite: https://www.tensorflow.org/lite
- `esp-tflite-micro`: https://github.com/espressif/esp-tflite-micro
- ESP-NN: https://github.com/espressif/esp-nn
- ESP-IDF: https://github.com/espressif/esp-idf
- Placa Waveshare ESP32-S3-Touch-AMOLED 2.06: no disponible en la información proporcionada
- Placa LilyGO T-Circle S3: no disponible en la información proporcionada
