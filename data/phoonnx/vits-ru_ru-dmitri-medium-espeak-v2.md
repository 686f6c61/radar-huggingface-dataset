# Phoonnx/vits-ru_ru-dmitri-medium-espeak-v2

## Resumen

vits-ru_ru-dmitri-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en ruso basada en la arquitectura VITS, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy alojado en el repositorio rhasspy/piper-voices. Concretamente, se trata de la voz `ru_RU-dmitri-medium` de Piper, un modelo de un solo hablante masculino en ruso con salida a 22050 Hz. El repositorio sustituye a una versión anterior del mismo autor (Phoonnx/vits-ru_ru-dmitri-medium-espeak), ya que el modelo upstream fue reentrenado sobre las bases de Piper 1.5.

El modelo resuelve el problema de la síntesis de voz offline en ruso con un grafo ONNX compacto (63,2 MB en fp32 y 18,7 MB en int8), lo que permite ejecutarlo en CPU sin GPU y con un factor de tiempo real (RTF) de 0,044 en fp32 y 0,107 en int8 sobre un Intel i9-11900H. Es relevante para quienes necesitan TTS local, de baja latencia y con licencia CC0, integrable en asistentes de voz como OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `ru`), por lo que el modelo no procesa texto crudo directamente: requiere el frontend de fonemización. La licencia CC0 1.0 permite uso comercial sin restricciones de atribución obligatoria, aunque el autor pide dar crédito a Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por fonemas, sin ventana de contexto declarada) |
| Tipos de cuantizacion | fp32 y int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz masculina, "dmitri") |
| Fonemizador | espeak-ng, voz `ru`, alfabeto IPA |
| Puntuacion soportada | , . ! ? : ; |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 224,2 MB (fp32) / 176,8 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,044 (fp32) / 0,107 (int8) |
| Caracteres por segundo | 14,5 a 16,4 |
| Libreria | phoonnx (>= 1.96.1a1 para conservar puntuacion) |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), implementada en el ecosistema Piper. Es un modelo TTS extremo a extremo que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial durante el entrenamiento. La salida es audio a 22050 Hz. La entrada no es texto plano sino fonemas IPA generados por espeak-ng con la voz `ru`, lo que hace que el frontend de fonemización sea parte imprescindible del pipeline.

Según la model card upstream, la voz se obtuvo por fine-tuning desde el modelo base en inglés estadounidense `hifi_tts_92` (calidad medium, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), aplicando MRD y SDP. Los datos de entrenamiento no están registrados upstream, aunque se referencia el repositorio OHF-Voice/voice-datasets con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior. La conversión a ONNX realizada por Phoonnx no altera los pesos; las copias int8 sí los cuantizan dinámicamente.

## Capacidades

- Síntesis de voz en ruso (ru-RU) a partir de fonemas IPA, con un único hablante masculino.
- Generación de audio WAV a 22050 Hz mediante la API `synthesize_wav` de phoonnx.
- Conservación de la puntuación de cláusula (`,` `.` `!` `?` `:` `;`) en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Ejecución offline en CPU, sin necesidad de GPU.
- Dos variantes de precisión: fp32 (mayor calidad, mayor tamano) e int8 (menor tamano y mayor velocidad, con WER superior).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales en ruso: el modelo puede integrarse en OVOS seleccionando la voz `piper/ru_RU-dmitri-medium-v2` en `mycroft.conf`, sintetizando respuestas del asistente en tiempo real con RTF de 0,044 en fp32 sobre CPU, sin depender de servicios en la nube.
- Lectura de textos y notificaciones en aplicaciones de escritorio: con 14,5 a 16,4 caracteres por segundo y un grafo de 18,7 MB en int8, es viable empaquetar la voz dentro de aplicaciones de escritorio o móviles para leer contenido dinámico.
- Sistemas de accesibilidad para personas con discapacidad visual: la licencia CC0 y la ejecución offline permiten distribuir la voz sin restricciones legales ni costes de API, sintetizando contenido de pantalla en ruso.
- Automatización de locuciones para contenidos pregrabados: generación por lotes de audio en ruso para vídeos, audiolibros o podcasts, usando la variante fp32 para maximizar calidad (WER 0,050 en la validación ASR).
- Integración en pipelines de CI/CD para pruebas de voz: al ser un grafo ONNX determinista y ligero, sirve para generar fixtures de audio en tests de sistemas de reconocimiento de voz en ruso.
- Dispositivos embebidos y de bajo consumo: con un pico de RSS de 176,8 MB en int8 y RTF de 0,107 en CPU de portátil, puede ejecutarse en hardware modesto como Raspberry Pi o mini-PC para interfaces de voz locales.
- Prototipado de interfaces conversacionales en ruso: permite iterar rápidamente sobre diálogos y prompts de voz sin coste de infraestructura, sustituyendo después por una voz de mayor calidad si se requiere.

## Benchmarks y rendimiento

Datos de control de calidad publicados en la model card, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la puerta de calidad | pass | pass |
| WER | 0,050 | 0,100 |
| Caracteres por segundo | 14,5 a 16,4 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 224,2 MB | 176,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,044 | 0,107 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duracion del audio. No se han publicado resultados de benchmarks estandar (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU mediante ONNX Runtime.
- RAM: pico de RSS de 224,2 MB en fp32 y 176,8 MB en int8.
- GPU recomendadas: no disponibles; no se documenta soporte GPU, aunque ONNX Runtime podria ejecutarse sobre GPU con los providers correspondientes (no verificado en la informacion disponible).
- Cabe en cualquier equipo consumer: el grafo int8 de 18,7 MB y el pico de memoria de 176,8 MB permiten ejecutarlo en Raspberry Pi, mini-PC y portatiles modestos.
- Despliegue: phoonnx (>= 1.96.1a1), con espeak-ng instalado como dependencia del fonemizador; integracion con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,044 (fp32) y 0,107 (int8) en i9-11900H con 4 hilos; es decir, sintetiza audio entre 9 y 23 veces mas rapido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ru_ru-dmitri-medium-espeak-v2 | VITS (Piper) | ru-RU | 63,2 MB fp32 / 18,7 MB int8 | CC0 1.0 | ONNX | Voz unica masculina, RTF 0,044 fp32 |
| rhasspy/piper-voices (ru_RU-dmitri-medium) | VITS (Piper) | ru-RU | no disponible | CC0 1.0 | Piper (no ONNX directo) | Modelo upstream del que deriva esta conversion |
| Phoonnx/vits-ru_ru-dmitri-medium-espeak | VITS (Piper) | ru-RU | no disponible | CC0 1.0 | ONNX | Version anterior con pesos previos al reentrenamiento |

No se dispone de datos de benchmarks comparativos con otras voces rusas (por ejemplo, modelos de Coqui TTS o Silero) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (ruso); no soporta cambio de voz ni otros idiomas.
- Requiere espeak-ng como fonemizador; con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- La calidad depende del frontend de fonemizacion: errores en la conversion a IPA se traducen directamente en errores de pronunciacion.
- La cuantizacion int8 duplica el WER (0,100 frente a 0,050 en fp32) en la validacion ASR; para produccion con alta exigencia de calidad conviene usar fp32.
- La validacion de calidad se hizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que limita la confianza en las metricas.
- Los datos de entrenamiento no estan registrados upstream, por lo que no se puede auditar la composicion del dataset ni sus posibles sesgos.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos o pronunciaciones incorrectas en textos fuera de dominio (nombres propios, siglas, numeros).
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero el autor solicita dar credito a Rhasspy; conviene verificar la licencia de espeak-ng por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 22 de noviembre de 2026) sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-dmitri-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ru/ru_RU/dmitri/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior de la voz: https://huggingface.co/Phoonnx/vits-ru_ru-dmitri-medium-espeak
- TigreGotico: https://tigregotico.pt
- Dataset de voces OHF: https://github.com/OHF-Voice/voice-datasets
