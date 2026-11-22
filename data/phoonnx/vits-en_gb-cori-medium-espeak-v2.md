# Phoonnx/vits-en_gb-cori-medium-espeak-v2

## Resumen

vits-en_gb-cori-medium-espeak-v2 es una voz de síntesis de texto a voz (TTS) en formato ONNX, derivada del modelo VITS de Piper publicado por Rhasspy en el repositorio `rhasspy/piper-voices`. La conversión y publicación corre a cargo de Phoonnx (TigreGotico Lda), que la empaqueta para su uso con la librería `phoonnx` y el ecosistema OVOS. No se trata de un modelo de lenguaje generativo, sino de un modelo acústico compacto que transforma fonemas IPA en audio a 22050 Hz.

El modelo resuelve el problema de la síntesis de voz local, ligera y determinista para inglés británico (en-GB), con una voz femenina concreta identificada como "cori". Su relevancia radica en que el repositorio sustituye a la versión anterior (`Phoonnx/vits-en_gb-cori-medium-espeak`): el upstream reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), de modo que esta v2 incorpora los pesos actualizados. El tamaño del repositorio es de 0,1 GB, lo que refleja su vocación de despliegue en entornos con recursos limitados.

La arquitectura es VITS (Piper), un modelo condicional de extremo a extremo con generador adversarial, sin parámetros en el sentido de un LLM. La entrada es texto fonemizado con espeak-ng (voz `en-gb-x-rp`) y la salida es una forma de onda mono a 22050 Hz. La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), generador condicional de extremo a extremo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase; entrada de texto fonemizado) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos `.onnx` y `.onnx_int8.onnx`) |

Otros datos tecnicos: frecuencia de muestreo de 22050 Hz, un solo hablante, fonemizador espeak-ng con voz `en-gb-x-rp`, alfabeto IPA, puntuacion de clausula entrenada (`, . ! ? : ;`). Tamano del grafo: 63,2 MB en fp32 y 18,7 MB en int8.

## Arquitectura y entrenamiento

El modelo es una voz VITS integrada en el marco Piper. VITS combina un codificador de texto, un prior variacional y un generador adversarial condicionado por un discriminador, lo que permite síntesis de extremo a extremo sin vocoder externo. La entrada no es texto crudo sino fonemas IPA generados por espeak-ng (voz `en-gb-x-rp`), por lo que el pipeline exige tener espeak-ng instalado o usar el port espyak incluido en `phoonnx[espeak]` (con la advertencia de que algunos fonemas difieren y pueden producir pronunciaciones incorrectas).

Según la model card upstream, la voz se afinó durante 150 épocas desde el modelo base `hifi_tts_92` (calidad medium), entrenado sobre las grabaciones del Hi-Fi Multi-Speaker English TTS Dataset (OpenSLR 109, NVIDIA, CC BY 4.0). El reentrenamiento fonemiza en inglés británico (`en-gb-x-rp`) en lugar de inglés estadounidense y emplea MRD y SDP. Requiere Piper 1.5 o superior. Los datos de entrenamiento originales no están registrados en el repositorio de conversión y el checkpoint de entrenamiento no se incluye. La conversión a ONNX no altera los pesos; las copias int8 los cuantizan dinámicamente con onnxruntime 1.32.0.

## Capacidades

- Síntesis de voz mono-hablante en inglés británico a 22050 Hz.
- Entrada basada en fonemas IPA (espeak-ng, `en-gb-x-rp`), no en texto directo sin fonemización.
- Manejo de puntuación de cláusula (`, . ! ? : ;`) preservada en la síntesis con phoonnx 1.96.1a1 o superior.
- Inferencia en CPU con ONNX Runtime; no requiere GPU.
- Variantes fp32 e int8 con calidad verificada mediante ASR (WER).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: únicamente en-GB.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas en tiempo real en hardware de gama baja, gracias a su RTF de 0,039 en fp32 sobre CPU.
- Lectura de notificaciones y alertas en inglés británico: el bajo consumo de memoria (pico de RSS de 259,9 MB en fp32 y 219,0 MB en int8) permite ejecutarla junto a otros servicios en un mismo dispositivo.
- Síntesis en dispositivos embebidos y Raspberry Pi: el grafo int8 de 18,7 MB cabe en almacenamiento y memoria reducidos, y la inferencia no depende de GPU.
- Generación de audiolibros o locuciones con voz consistente: al ser mono-hablante y determinista, produce una voz uniforme a lo largo de textos largos divididos en frases.
- Pruebas automatizadas de pipelines de voz: su RTF bajo y su naturaleza determinista facilitan la generación de corpus de audio sintético para evaluación de sistemas ASR.
- Accesibilidad y lectura de contenido en pantalla: integración en aplicaciones de lectura que requieran una voz británica ligera sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo con TTS local antes de migrar a soluciones de mayor calidad.

## Benchmarks y rendimiento

La model card reporta una verificación de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre 3 frases de FLORES-200 devtest, medida en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,069 | 0,034 |
| Caracteres por segundo | 13,8 a 18,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 0,99 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 259,9 MB | 219,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,096 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU; el modelo está pensado para ONNX Runtime en CPU.
- VRAM estimada: no aplica; el consumo es de RAM del sistema (pico de RSS de 259,9 MB en fp32 y 219,0 MB en int8).
- GPU recomendadas: no disponibles ni necesarias; cualquier CPU moderna es suficiente (medido en Intel Core i9-11900H).
- Cabe en cualquier equipo consumer, incluidos dispositivos embebidos y Raspberry Pi, gracias al grafo int8 de 18,7 MB.
- Opciones de despliegue: `phoonnx` (pip) con espeak-ng instalado, o el port espyak mediante `phoonnx[espeak]`; integración con OVOS a través de `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,039 en fp32 y 0,096 en int8 (mediana de 3 ejecuciones, 4 hilos); velocidad de 13,8 a 18,6 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| vits-en_gb-cori-medium-espeak-v2 (este) | VITS (Piper) | en-GB | 22050 Hz | ONNX fp32/int8 | CC BY 4.0 | Conversion de Phoonnx; requiere espeak-ng |
| rhasspy/piper-voices en_GB/cori/medium | VITS (Piper) | en-GB | 22050 Hz | Piper (ONNX upstream) | CC BY 4.0 | Modelo upstream original; pesos equivalentes |
| Phoonnx/vits-en_gb-cori-medium-espeak | VITS (Piper) | en-GB | 22050 Hz | ONNX | CC BY 4.0 | Version anterior, pesos previos al reentrenamiento Piper 1.5 |

No se dispone de datos comparativos de rendimiento frente a otras voces Piper o motores TTS alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma (en-GB); no sirve para otros idiomas ni para cambio de voz.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Los datos de entrenamiento originales no están registrados upstream, lo que limita la trazabilidad y el análisis de sesgos.
- Riesgo de pronunciaciones incorrectas en nombres propios, siglas y palabras fuera del dominio de entrenamiento.
- La verificación de calidad se basa en solo 3 frases de FLORES-200 devtest, una muestra muy reducida; el WER de 0,034 en int8 frente a 0,069 en fp32 debe interpretarse con cautela por el tamaño de la muestra.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a Rhasspy (entrenamiento) y a TigreGotico (conversión).
- La puntuación solo se preserva con phoonnx 1.96.1a1 o superior; versiones anteriores pueden ignorarla.
- No apta para tareas de razonamiento, generación de texto, código, visión ni agentes; es exclusivamente un modelo acústico de TTS.
- El repositorio no incluye checkpoint de entrenamiento, lo que impide reproducir el ajuste fino desde estos artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-cori-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_GB/cori/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset Hi-Fi Multi-Speaker English TTS (OpenSLR 109): https://www.openslr.org/109/
- Voz anterior de Bryce Beattie: https://brycebeattie.com/files/tts/
- Version anterior del repositorio: https://huggingface.co/Phoonnx/vits-en_gb-cori-medium-espeak
