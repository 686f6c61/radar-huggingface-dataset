# Phoonnx/vits-pl_pl-darkman-medium-espeak-v2

## Resumen

vits-pl_pl-darkman-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) para polaco (pl-PL) basada en la arquitectura VITS del ecosistema Piper. La publica el usuario Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy `rhasspy/piper-voices/pl/pl_PL/darkman/medium`, con pesos cuantizados a int8 en copias separadas. No es un modelo de lenguaje: es un sintetizador acústico de un solo hablante que convierte fonemas espeak-ng (alfabeto IPA) en audio a 22050 Hz.

La relevancia de esta versión radica en que el modelo upstream fue reentrenado sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), por lo que este repositorio sustituye al anterior `Phoonnx/vits-pl_pl-darkman-medium-espeak`, que conserva los pesos antiguos. La conversión mantiene los pesos originales sin alteración y añade copias int8 generadas con `onnxruntime.quantization.quantize_dynamic`, lo que reduce el grafo de 63,2 MB a 18,7 MB y el pico de memoria residente de 281,7 MB a 236,1 MB.

El modelo está pensado para su uso con la librería phoonnx (versión 1.96.1a1 o superior para preservar la puntuación de cláusula) y con el plugin OVOS `ovos-tts-plugin-phoonnx`. Su licencia CC0 1.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integrarlo en asistentes de voz y pipelines de accesibilidad en polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), un solo hablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (QInt8, cuantización dinámica con onnxruntime) |
| Idiomas soportados | pl-PL (polaco) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Puntuación | entrenado con `, . ! ? : ;` |
| Fonemizador | espeak-ng, voz `pl` |
| Tamaño del repositorio | 0,1 GB |
| Identificador de voz | `piper/pl_PL-darkman-medium-v2` |
| Modelo base | `rhasspy/piper-voices` (relación: quantized) |
| Checkpoint de entrenamiento | no incluido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en la implementación de Piper, un modelo condicional de audio que genera waveform directamente a partir de fonemas. La entrada son fonemas espeak-ng en IPA; el modelo fue entrenado con puntuación de cláusula (`, . ! ? : ;`), que phoonnx 1.96.1a1 y posteriores preservan en la síntesis. La salida es audio mono a 22050 Hz.

Según la model card, el modelo upstream se fine-tuneó desde el modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento originales no están registrados upstream; la model card cita como fuente de datos `https://github.com/OHF-Voice/voice-datasets` con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333. Esta conversión no modifica los pesos: solo los exporta a ONNX y genera copias int8 con cuantización dinámica QInt8 (onnxruntime 1.32.0).

## Capacidades

- Síntesis de voz en polaco (pl-PL) a partir de texto, con fonemización mediante espeak-ng.
- Un único hablante (voz `darkman`, calidad media).
- Salida de audio a 22050 Hz en formato WAV mediante `voice.synthesize_wav`.
- Preservación de puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 o superior.
- Ejecución en CPU: el modelo está optimizado para inferencia ONNX sin GPU.
- Dos variantes de precisión: fp32 e int8, seleccionables según el equilibrio entre calidad y recursos.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un sintetizador TTS.

## Casos de uso

- Asistentes de voz en polaco (OVOS/Mycroft): se selecciona la voz `piper/pl_PL-darkman-medium-v2` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, y el modelo sintetiza las respuestas del asistente en local sin depender de servicios en la nube.
- Lectura de contenido para accesibilidad: integrado en lectores de pantalla o aplicaciones de lectura de artículos en polaco, con una latencia baja (RTF 0,039 en fp32 con 4 hilos) que permite respuestas casi en tiempo real.
- Generación de audiolibros o pódcasts automatizados: el modelo convierte texto largo en audio WAV de forma determinista y con licencia CC0, lo que permite su uso comercial sin atribución obligatoria.
- Sistemas de anuncios y megafonía: síntesis de mensajes dinámicos en aplicaciones de transporte, comercio o industria, donde el bajo consumo de memoria (236,1 MB de pico en int8) permite desplegarlo en dispositivos de borde.
- Pruebas de calidad y regresión en pipelines de TTS: las dos variantes (fp32 e int8) y la metodología de QA con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) permiten comparar WER y duración entre precisiones antes de desplegar.
- Prototipado de interfaces conversacionales en polaco: al ejecutarse en CPU con ONNX y no requerir GPU, se puede integrar en entornos de desarrollo locales o contenedores ligeros para validar flujos de voz antes de escalar.
- Generación de voces para vídeos o demos de producto en polaco: la licencia CC0 y la ausencia de restricciones de uso comercial facilitan su incorporación en materiales promocionales.

## Benchmarks y rendimiento

La model card incluye una validación de calidad con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) sobre 3 frases de FLORES-200 devtest, comparando fp32 e int8:

| Métrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,045 | 0,000 |
| Caracteres por segundo | 14,5 a 15,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 a 1,02 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 281,7 MB | 236,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,097 |

Medido en un Intel Core i9-11900H (11ª generación) a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 281,7 MB en fp32 y 236,1 MB en int8.
- GPU recomendadas: no aplica; no se documenta soporte GPU en la model card.
- Cabe en cualquier equipo de consumo: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), plugin OVOS `ovos-tts-plugin-phoonnx`, ONNX Runtime. Requiere espeak-ng instalado (`apt install espeak-ng`) o la extra `phoonnx[espeak]` (port espyak, con posibles diferencias fonéticas).
- Latencia y throughput: RTF 0,039 en fp32 y 0,097 en int8 con 4 hilos en un i9-11900H; es decir, el fp32 sintetiza unas 25 veces más rápido que tiempo real y el int8 unas 10 veces.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-pl_pl-darkman-medium-espeak-v2 (este) | VITS (Piper) | pl-PL | 22050 Hz, 1 hablante | CC0 1.0 | ONNX (fp32/int8) | Reentrenado sobre Piper 1.5; QA con WER 0,045 fp32 / 0,000 int8 |
| Phoonnx/vits-pl_pl-darkman-medium-espeak | VITS (Piper) | pl-PL | 22050 Hz, 1 hablante | CC0 1.0 | ONNX | Versión anterior con pesos previos al reentrenamiento; sustituida por este repositorio |
| rhasspy/piper-voices/pl/pl_PL/darkman/medium | VITS (Piper) | pl-PL | 22050 Hz, 1 hablante | CC0 1.0 | Piper (ONNX upstream) | Modelo original de Rhasspy del que deriva esta conversión |

No se dispone de datos de benchmarks comparativos con otras voces polacas (por ejemplo, otras voces de Piper o modelos comerciales) en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona, no hace tool calling ni procesa imágenes o audio de entrada.
- Un solo idioma (pl-PL) y un solo hablante; no admite cambio de voz ni multilingüismo.
- La fonemización depende de espeak-ng; si se usa el port espyak (`phoonnx[espeak]`), algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La puntuación de cláusula solo se preserva con phoonnx 1.96.1a1 o superior; versiones anteriores pueden alterar la prosodia.
- Los datos de entrenamiento originales no están registrados upstream, por lo que no se puede auditar la composición del corpus ni los posibles sesgos de la voz.
- Riesgo de artefactos acústicos y errores de pronunciación en palabras fuera del dominio de entrenamiento, siglas o nombres propios.
- La validación de calidad se basa en solo 3 frases de FLORES-200 devtest con un ASR concreto; es una muestra muy reducida y no garantiza el rendimiento en producción.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy como pide la model card.
- No se incluye checkpoint de entrenamiento en el repositorio, lo que limita el fine-tuning posterior desde estos pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-darkman-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pl/pl_PL/darkman/medium
- Repositorio anterior sustituido: https://huggingface.co/Phoonnx/vits-pl_pl-darkman-medium-espeak
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
