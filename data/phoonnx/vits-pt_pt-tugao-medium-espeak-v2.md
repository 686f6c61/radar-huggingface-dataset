# Phoonnx/vits-pt_pt-tugao-medium-espeak-v2

## Resumen

vits-pt_pt-tugao-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en portugués europeo (pt-PT) basada en la arquitectura VITS del ecosistema Piper. El modelo original fue entrenado por Rhasspy y publicado dentro del repositorio rhasspy/piper-voices; TigreGotico Lda (Phoonnx) realiza la conversión a formato ONNX para su uso con la librería phoonnx. Esta versión v2 sustituye a la anterior (Phoonnx/vits-pt_pt-tugao-medium-espeak) porque el modelo upstream fue reentrenado sobre las bases de Piper 1.5 (commit e9c8a39444).

Se trata de un modelo de un solo hablante, con salida a 22050 Hz, que recibe fonemas espeak-ng (alfabeto IPA) como entrada de texto y genera audio de forma local y ligera. El repositorio ocupa aproximadamente 0,1 GB y ofrece pesos en fp32 e int8, lo que permite su despliegue en CPU sin GPU dedicada, con un factor de tiempo real (RTF) de 0,043 en fp32 y 0,098 en int8 medidos sobre un Intel Core i9-11900H.

Su relevancia actual reside en que cubre una lengua con poca representación en TTS neuronal abierto (portugués de Portugal) con licencia CC0 1.0, lo que facilita su integración en asistentes de voz, sistemas de accesibilidad y pipelines de generación de audio sin restricciones de uso comercial. La conversión a ONNX y la cuantización dinámica int8 reducen el tamaño del grafo de 63,2 MB a 18,7 MB con una degradación de WER controlada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantización | fp32 e int8 (cuantización dinámica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | pt-PT (portugués europeo) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (ficheros `<graph>.onnx` y `<graph>_int8.onnx`) |

Otros datos técnicos: frecuencia de muestreo de 22050 Hz, un único hablante, entrada de texto en fonemas espeak (alfabeto IPA), fonemizador espeak-ng con voz `pt`, puntuación entrenada `, . ! ? : ;` (preservada en síntesis a partir de phoonnx 1.96.1a1), ajustes de inferencia por defecto `noise_scale 0.5` y `noise_w 0.333`, y requisito de Piper 1.5 o superior en el upstream.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un vocoder integrado (HiFi-GAN), todo entrenado de forma conjunta con pérdidas adversarias. En el ecosistema Piper, la entrada de texto se convierte previamente a fonemas mediante espeak-ng, lo que desacopla la normalización lingüística del modelo acústico y permite un rendimiento ligero en CPU.

Según la model card, el modelo upstream se obtuvo por ajuste fino (finetuning) a partir del modelo base en inglés estadounidense `hifi_tts_92` (calidad media, correspondiente a la voz de Cori Samuel, lectora 92 de Hi-Fi TTS), empleando MRD y SDP. Los datos de entrenamiento provienen del conjunto de datos de voces de OHF-Voice (https://github.com/OHF-Voice/voice-datasets), con licencia CC0; el número exacto de horas o tokens no está registrado upstream. La conversión a ONNX no altera los pesos, y las copias int8 se generan con cuantización dinámica de onnxruntime 1.32.0.

## Capacidades

- Síntesis de voz (text-to-speech) en portugués europeo a partir de texto con fonemización espeak-ng.
- Generación de audio mono a 22050 Hz en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Soporte de puntuación de cláusula (`, . ! ? : ;`) para modelar pausas y entonación en la síntesis.
- Ejecución local en CPU con modelos ONNX fp32 e int8, sin dependencia de GPU.
- Integración con el stack OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo de síntesis.
- Un único hablante; no soporta cambio de voz ni clonación.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): se selecciona la voz `piper/pt_PT-tugão-medium-v2` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite respuestas habladas en portugués europeo sin enviar texto a servicios en la nube.
- Accesibilidad y lectura de pantalla: el modelo convierte texto de documentos o interfaces en audio a 22050 Hz con un RTF de 0,043 en fp32, adecuado para lectura en tiempo real en portátiles con CPU de gama media-alta.
- Generación de audiolibros y pódcasts: al ser un modelo de un solo hablante con licencia CC0, se puede sintetizar contenido largo y publicarlo comercialmente sin restricciones de atribución obligatoria.
- Sistemas de anuncios y megafonía: la baja huella de memoria (RSS pico de 213,8 MB en int8) permite desplegar la síntesis en dispositivos embebidos o mini-PC sin GPU.
- Pruebas automatizadas de pipelines de voz: el modelo sirve como componente TTS determinista (con `noise_scale` fijo) para validar cadenas ASR-TTS en CI, con WER de 0,030 en fp32 y 0,061 en int8 medido con nemo-parakeet-tdt-0.6b-v3.
- Localización de aplicaciones al portugués de Portugal: integración en flujos de traducción y doblaje automatizado para generar pistas de audio en pt-PT, una variante con menos cobertura que el portugués de Brasil en el ecosistema TTS abierto.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a una verificación de calidad (QA) con ASR, no a benchmarks estándar de TTS. Se midieron sobre 3 frases del conjunto FLORES-200 devtest con el ASR nemo-parakeet-tdt-0.6b-v3 int8, en un Intel Core i9-11900H a 2,50 GHz con 4 hilos:

| Métrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,030 | 0,061 |
| Caracteres por segundo | 19,3 a 20,0 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 251,1 MB | 213,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,043 | 0,098 |

No se han publicado resultados de benchmarks estándar (MOS, MCD, CMOS) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: RSS pico de 251,1 MB en fp32 y 213,8 MB en int8.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no se han publicado mediciones.
- Cabe en cualquier equipo de consumo: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB.
- Opciones de despliegue: phoonnx (pip install --pre phoonnx), con espeak-ng instalado en el sistema (o el port espyak mediante `phoonnx[espeak]`); plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: RTF de 0,043 (fp32) y 0,098 (int8) con 4 hilos en un i9-11900H, es decir, entre 10 y 23 veces más rápido que tiempo real según precisión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Frecuencia | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-pt_pt-tugao-medium-espeak-v2 (este) | VITS (Piper) | pt-PT | 1 | 22050 Hz | CC0 1.0 | ONNX fp32/int8 |
| rhasspy/piper-voices pt_PT tugão medium (upstream) | VITS (Piper) | pt-PT | 1 | 22050 Hz | CC0 1.0 | ONNX (Piper) |
| Phoonnx/vits-pt_pt-tugao-medium-espeak (versión anterior) | VITS (Piper) | pt-PT | 1 | 22050 Hz | CC0 1.0 | ONNX |

No se dispone de datos de benchmarks comparativos con otras voces pt-PT en la información proporcionada; la comparación se limita a variantes del mismo modelo upstream.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite selección de voz ni clonación.
- Calidad media (etiqueta "medium" del upstream): no está pensado para doblaje profesional de alta fidelidad.
- Dependencia de espeak-ng para la fonemización: si se usa el port espyak, algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.
- WER de 0,061 en int8 frente a 0,030 en fp32: la cuantización introduce degradación medible en la inteligibilidad.
- Solo portugués europeo (pt-PT); no cubre otras variantes ni multilingüismo.
- Los datos de entrenamiento no están registrados upstream (número de horas, composición exacta), lo que limita la auditoría de sesgos y cobertura fonética.
- Riesgo de alucinación acústica o artefactos en textos con puntuación atípica, números, siglas o nombres propios no vistos en entrenamiento.
- Licencia CC0 1.0: permite uso comercial sin restricciones, aunque se solicita atribución a Rhasspy por cortesía.
- Requiere Piper 1.5 o superior en el upstream; versiones antiguas de phoonnx no preservan la puntuación de cláusula (corregido a partir de 1.96.1a1).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_pt-tugao-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pt/pt_PT/tug%C3%A3o/medium
- Versión anterior del modelo: https://huggingface.co/Phoonnx/vits-pt_pt-tugao-medium-espeak
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Datasets de voces OHF-Voice: https://github.com/OHF-Voice/voice-datasets
- TigreGotico: https://tigregotico.pt
