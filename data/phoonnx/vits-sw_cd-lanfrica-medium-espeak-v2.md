# Phoonnx/vits-sw_cd-lanfrica-medium-espeak-v2

## Resumen

`Phoonnx/vits-sw_cd-lanfrica-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en suajili (sw-CD) basada en la arquitectura VITS de Piper, convertida a ONNX para su uso con la librería `phoonnx`. El modelo original fue entrenado por Rhasspy y publicado dentro del repositorio `rhasspy/piper-voices`; TigreGotico Lda (Phoonnx) realiza la conversión a ONNX y publica las copias cuantizadas en int8 sin modificar los pesos originales.

Esta versión `v2` sustituye a `Phoonnx/vits-sw_cd-lanfrica-medium-espeak` porque el modelo upstream fue reentrenado sobre la base de Piper 1.5 (commit `e9c8a39444`). Se trata de una voz de un único hablante, con entrada de fonemas espeak (alfabeto IPA), frecuencia de muestreo de 22050 Hz y un tamaño de grafo de 63,2 MB en fp32 y 18,7 MB en int8.

El modelo resuelve la necesidad de síntesis de voz en suajili en entornos de asistencia por voz (OVOS, Mycroft), sistemas embebidos y aplicaciones de bajo consumo, donde el tamaño reducido y el RTF bajo son críticos. Su relevancia actual radica en la escasez de voces TTS de calidad media para lenguas africanas y en su integración lista para usar mediante el plugin `ovos-tts-plugin-phoonnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | suajili (sw-CD) |
| Licencia | other (no declarada en la model card; enlaza a lanfrica.com/record/kiswahili-tts-dataset) |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS tal como la implementa Piper, un modelo generativo end-to-end que combina un codificador de texto, un predictor de duración y un decodificador basado en flujos y difusión para producir audio a 22050 Hz. La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `sw`) y el modelo está entrenado con puntuación de cláusula (`, . ! ? : ;`), que phoonnx 1.96.1a1 y posteriores preservan en la síntesis.

Según la model card, el modelo upstream se ajustó (fine-tuning) a partir del modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento no están registrados en el repositorio upstream, que enlaza al dataset Kiswahili TTS de Lanfrica. Los parámetros de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en suajili (sw-CD) a partir de texto con fonemización espeak-ng.
- Salida de audio mono a 22050 Hz en formato WAV.
- Soporte de puntuación de cláusula para control de prosodia (`, . ! ? : ;`).
- Un único hablante (no hay cambio de voz entre hablantes).
- Cuantización int8 disponible para despliegue con menor huella de memoria.
- Integración con el ecosistema OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en suajili integrados en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` con `voice: piper/sw_CD-lanfrica-medium-v2` y responde a las consultas del usuario con síntesis local sin dependencia de la nube.
- Sistemas embebidos y de bajo consumo: con un grafo int8 de 18,7 MB y un pico de RSS de 240,5 MB, cabe en dispositivos con recursos limitados como Raspberry Pi o similares.
- Lectura de notificaciones y alertas en suajili: la preservación de la puntuación de cláusula permite generar pausas naturales en mensajes cortos y estructurados.
- Accesibilidad para personas con discapacidad visual en África Oriental: convierte texto en audio en suajili con RTF de 0,041 en fp32 (medido en un i9-11900H), lo que permite lectura en tiempo real.
- Generación de audiolibros o contenido educativo: la tasa de 15,3 a 16,7 caracteres por segundo en fp32 facilita la producción por lotes de narraciones en suajili.
- Pruebas de calidad y evaluación de TTS multilingüe: el modelo sirve como referencia para comparar voces Piper en lenguas de bajos recursos, con métricas de RTF y longitud documentadas.
- Integración en pipelines de CI/CD para validación de voces: el método de QA (comprobación de longitud y silencio sobre FLORES-200 devtest) puede automatizarse para verificar nuevas conversiones ONNX.

## Benchmarks y rendimiento

La model card proporciona métricas de control de calidad (QA) medidas en un Intel Core i9-11900H a 2,50 GHz con 4 hilos, sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 15,3 a 16,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,01 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 274,0 MB | 240,5 MB |
| RTF (mediana de 3) | 0,041 | 0,096 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: el modelo es de CPU por defecto; el pico de RSS es de 274,0 MB en fp32 y 240,5 MB en int8, por lo que no requiere GPU dedicada.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de placa única, dado su tamaño inferior a 300 MB en memoria.
- Opciones de despliegue: `phoonnx` (con espeak-ng instalado), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime para inferencia directa.
- Latencia y throughput: RTF de 0,041 en fp32 y 0,096 en int8 (medido en i9-11900H, 4 hilos); el int8 es más lento en esta medición pero ocupa menos memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-sw_cd-lanfrica-medium-espeak-v2 | VITS (Piper) | sw-CD | 63,2 MB fp32 / 18,7 MB int8 | no aplica | other | Hugging Face (ONNX) |
| rhasspy/piper-voices (sw/sw_CD/lanfrica/medium) | VITS (Piper) | sw-CD | no disponible | no aplica | no declarada | Hugging Face (upstream) |
| Phoonnx/vits-sw_cd-lanfrica-medium-espeak | VITS (Piper) | sw-CD | no disponible | no aplica | other | Hugging Face (versión anterior) |

No se dispone de datos de benchmarks comparativos con otras voces TTS en suajili en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada explícitamente en la model card; enlaza a lanfrica.com/record/kiswahili-tts-dataset, por lo que el uso comercial requiere verificar los términos del dataset original.
- El modelo solo soporta suajili (sw-CD); no es multilingüe.
- Es un modelo de un único hablante; no permite cambio de voz.
- La fonemización depende de espeak-ng; el uso de espyak puede producir errores de pronunciación en algunas palabras, según advierte la model card.
- No hay datos de entrenamiento registrados upstream, lo que dificulta evaluar sesgos o cobertura léxica.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- El QA se realizó sobre solo 3 frases de FLORES-200 devtest, lo que es una cobertura limitada.
- Requiere Piper 1.5 o superior y phoonnx 1.96.1a1 o posterior para preservar la puntuación de cláusula.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-sw_cd-lanfrica-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/sw/sw_CD/lanfrica/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset Kiswahili TTS: https://lanfrica.com/record/kiswahili-tts-dataset
- Versión anterior: https://huggingface.co/Phoonnx/vits-sw_cd-lanfrica-medium-espeak
