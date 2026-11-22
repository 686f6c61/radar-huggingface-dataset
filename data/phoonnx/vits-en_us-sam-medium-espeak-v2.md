# Phoonnx/vits-en_us-sam-medium-espeak-v2

## Resumen

`vits-en_us-sam-medium-espeak-v2` es una voz de síntesis de habla (text-to-speech) en inglés estadounidense basada en la arquitectura VITS del ecosistema Piper, publicada en formato ONNX por Phoonnx (TigreGotico Lda) para su uso con la librería `phoonnx`. El modelo es una conversión del checkpoint original de Rhasspy `rhasspy/piper-voices/en/en_US/sam/medium`, un modelo de calidad media entrenado por Rhasspy, y esta versión v2 sustituye a la anterior `Phoonnx/vits-en_us-sam-medium-espeak` tras el reentrenamiento del upstream sobre los modelos base de Piper 1.5.

El modelo resuelve la necesidad de disponer de una voz TTS ligera, determinista y ejecutable en CPU para asistentes de voz, sistemas de lectura y pipelines de audio en producción. Con un grafo de 63,2 MB en fp32 y 18,7 MB en int8, un RTF de 0,038 (fp32) y 0,098 (int8) medido sobre un Intel Core i9-11900H, está pensado para despliegues de bajos recursos más que para síntesis de alta fidelidad.

La relevancia actual reside en su integración con el stack OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, y en que la conversión incluye copias cuantizadas int8 validadas con un criterio de aceptación explícito (WER no superior al fp32 + 0,05, longitud entre 0,8 y 1,25 veces la del fp32). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas) |
| Tipos de cuantizacion | fp32 y int8 (QInt8, `onnxruntime.quantization.quantize_dynamic`) |
| Idiomas soportados | en-US |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonemizador | espeak-ng, voz `en-us` |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del repo | 0,1 GB |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 256,3 MB (fp32) / 217,1 MB (int8) |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en la implementación de Piper, un modelo generativo condicionado por fonemas que produce waveforms directamente a 22050 Hz sin vocoder externo separado. La entrada no es texto crudo sino fonemas IPA generados por espeak-ng con la voz `en-us`; esto implica que el frontend fonético es parte crítica del pipeline y que variaciones en el fonemizador (por ejemplo, el port espyak) pueden alterar la pronunciación de algunas palabras.

El entrenamiento upstream fue realizado por Rhasspy y no está documentado en detalle: la model card indica que los datos de entrenamiento no están registrados y que el modelo base tampoco. Sí se especifica que la voz se afinó a partir del modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP, y que requiere Piper 1.5 o superior. Los datos de la voz provienen del proyecto Sam-Accenture-Non-Binary-Voice (licencia Apache 2.0). Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333. La conversión a ONNX no modifica los pesos; las copias int8 sí los cuantizan dinámicamente.

## Capacidades

- Síntesis de voz mono-hablante en inglés estadounidense a partir de texto, con salida WAV a 22050 Hz.
- Fonemización mediante espeak-ng (voz `en-us`), con soporte de alfabeto IPA como entrada al grafo.
- Respeto de puntuación de cláusula (`, . ! ? : ;`) en la síntesis, preservada por phoonnx 1.96.1a1 y posteriores.
- Inferencia en CPU sin GPU, con grafos ligeros (18,7 MB en int8) aptos para dispositivos de bajos recursos.
- Integración como plugin TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No es multilingüe: únicamente `en-US`.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas del asistente en tiempo real sobre CPU, con un RTF de 0,038 en fp32 que permite generar audio más rápido que su reproducción.
- Lectura de notificaciones y alertas en sistemas embebidos: el grafo int8 de 18,7 MB y un pico de RSS de 217,1 MB permiten ejecutarlo en dispositivos con poca memoria, sintetizando mensajes cortos de forma determinista.
- Accesibilidad y lectores de pantalla: conversión de texto a voz para aplicaciones de escritorio o web que necesiten una voz inglesa neutra sin depender de servicios en la nube, con licencia Apache 2.0 compatible con distribución comercial.
- Generación de audiolibros o contenido narrado por lotes: al ser un modelo pequeño y rápido en CPU, se pueden procesar grandes volúmenes de texto en servidores sin GPU, aplicando la puntuación de cláusula para obtener pausas naturales.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar integraciones de phoonnx, comparar fp32 frente a int8 o medir latencia antes de desplegar voces de mayor calidad.
- Sistemas de respuesta de voz interactiva (IVR) de bajo coste: síntesis de prompts y mensajes pregrabados en inglés estadounidense en entornos sin acelerador hardware, con RTF de 0,098 en int8 que sigue siendo inferior a 1.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de control de calidad de la conversión, medidas con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 13,7 a 16,5 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 256,3 MB | 217,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,098 |

No se han publicado resultados de benchmarks comparativos (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU. El consumo de memoria es de 256,3 MB de pico de RSS en fp32 y 217,1 MB en int8.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier equipo consumer: el grafo int8 de 18,7 MB y el pico de RSS de 217,1 MB lo hacen viable en Raspberry Pi y dispositivos similares, aunque no se han publicado mediciones en esas plataformas.
- Opciones de despliegue: `phoonnx` (librería nativa), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente para integraciones propias. Requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput: RTF de 0,038 (fp32) y 0,098 (int8) con 4 hilos en un i9-11900H; es decir, la síntesis tarda entre el 3,8 % y el 9,8 % de la duración del audio generado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-sam-medium-espeak-v2` | VITS (Piper) ONNX | en-US | 63,2 MB fp32 / 18,7 MB int8 | Apache 2.0 | Version actual, reentrenada sobre Piper 1.5 |
| `Phoonnx/vits-en_us-sam-medium-espeak` | VITS (Piper) ONNX | en-US | no disponible | Apache 2.0 | Version anterior, pesos previos al reentrenamiento upstream |
| `rhasspy/piper-voices` (en_US/sam/medium) | VITS (Piper) | en-US | no disponible | Apache 2.0 | Modelo upstream original en formato Piper |
| Otras voces Piper en_US (p. ej. lessac, amy) | VITS (Piper) | en-US | variable | Apache 2.0 / otras | Misma familia y ecosistema; no se dispone de comparación de métricas en la informacion disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo inglés estadounidense; no admite otros idiomas ni cambio de voz.
- Calidad media (variante `medium`): no está pensado para síntesis de alta fidelidad ni para clonación de voz.
- Dependencia del fonemizador: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Datos de entrenamiento no documentados upstream: no se puede evaluar la composición del corpus ni los posibles sesgos de pronunciación o acento.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir artefactos o pronunciaciones incorrectas en texto fuera de distribución, aunque el QA reporta WER 0,000 en 3 frases de FLORES-200.
- Validación limitada: el control de calidad se realizó con solo 3 frases, por lo que la cobertura de evaluación es reducida.
- Requiere Piper 1.5 o superior en el upstream; el uso con versiones anteriores puede no ser compatible.
- Licencia Apache 2.0: permite uso comercial, pero exige atribución a Rhasspy por el modelo original y a TigreGotico Lda por la conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-sam-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/sam/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-en_us-sam-medium-espeak
- Datos de la voz (Sam-Accenture-Non-Binary-Voice): https://github.com/Sam-Accenture-Non-Binary-Voice/non-binary-voice-files
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- TigreGotico: https://tigregotico.pt
