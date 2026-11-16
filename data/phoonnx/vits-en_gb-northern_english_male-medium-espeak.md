# Phoonnx/vits-en_gb-northern_english_male-medium-espeak

## Resumen

El modelo `vits-en_gb-northern_english_male-medium-espeak` es una voz de síntesis de voz (text-to-speech) basada en la arquitectura VITS, empaquetada por Phoonnx para su librería ONNX de TTS. La voz original procede del proyecto Piper de Rhasspy, concretamente del conjunto `piper-voices`, y se distribuye en formato ONNX listo para inferencia. El modelo resuelve el problema de generar habla natural en inglés británico con un acento del norte de Inglaterra y una voz masculina, sin necesidad de infraestructura de GPU dedicada.

La relevancia de este modelo reside en su formato: al estar empaquetado para phoonnx, se puede ejecutar en Python y en el asistente OVOS, lo que facilita su integración en asistentes de voz locales y sistemas de domótica. Su tamaño reducido (0,1 GB de repositorio) y su licencia MIT lo hacen adecuado para despliegues en entornos con recursos limitados, incluidos dispositivos de borde.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento originales más allá de lo indicado en la model card. El modelo se limita a la síntesis de voz a partir de fonemas IPA generados por espeak-ng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX, presumiblemente float32 o float16) |
| Idiomas soportados | inglés británico (`en-GB`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador basado en HiFi-GAN para generar la forma de onda. VITS emplea aprendizaje adversario condicionado para producir habla de alta calidad sin necesidad de alineamientos explícitos entre texto y audio.

El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, dentro del conjunto `piper-voices`, en la ruta `en/en_GB/northern_english_male/medium`. No se dispone de información sobre el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La entrada de texto se procesa mediante espeak-ng, que convierte el texto en fonemas IPA antes de pasarlos al modelo. El empaquetado para phoonnx no modifica los pesos originales, sino que los adapta al formato ONNX y a la interfaz de la librería.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico con acento del norte de Inglaterra y voz masculina.
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con el asistente OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python y en el navegador mediante phoonnx.js (con entrada espeak o unicode).
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control preciso de la pronunciación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es exclusivamente un modelo de TTS.
- No dispone de capacidades multimodales (visión, audio de entrada, etc.).
- No soporta otros idiomas distintos del inglés británico.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en inglés británico sin depender de servicios en la nube. Su tamaño reducido (0,1 GB) facilita su ejecución en dispositivos de domótica.
- Lectura de notificaciones y alertas: se puede usar para convertir mensajes de texto en audio en sistemas de monitorización o domótica, gracias a su bajo coste computacional y a la posibilidad de ejecutarse en CPU.
- Generación de audiolibros o contenido narrado: la voz masculina del norte de Inglaterra es adecuada para narraciones en inglés británico, con control de pronunciación mediante fonemas IPA.
- Pruebas de accesibilidad: integración en aplicaciones que necesiten leer texto en pantalla para usuarios con discapacidad visual, ejecutándose localmente sin conexión.
- Desarrollo de interfaces conversacionales: el modelo sirve como capa de salida de voz en prototipos de chatbots o sistemas de atención al cliente en inglés británico, aunque su limitación a un solo idioma restringe su uso en entornos multilingües.
- Investigación en síntesis de voz: al estar empaquetado en ONNX y con licencia MIT, es útil para experimentar con modelos VITS y comparar el rendimiento de distintas voces de Piper en entornos de investigación.
- Generación de audio para videojuegos o aplicaciones interactivas: la voz se puede invocar desde phoonnx.js en el navegador para generar diálogos dinámicos sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU sin necesidad de GPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y en dispositivos de borde.
- Cabe en GPU consumer: sí, por su tamaño reducido, aunque no se proporcionan requisitos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en el navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| vits-en_gb-northern_english_male-medium-espeak (este modelo) | VITS | en-GB | MIT | ONNX | 0,1 GB |
| Otras voces de Piper (p. ej., en_US-amy-medium) | VITS | en-US | MIT | ONNX | similar |
| Modelos TTS comerciales (p. ej., Amazon Polly) | no disponible | multilingüe | propietaria | API | no aplica |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés británico; no es multilingüe.
- La entrada debe ser texto en inglés británico; el uso de otros idiomas o acentos puede producir pronunciaciones incorrectas.
- La dependencia de espeak-ng es obligatoria para generar los fonemas; sin él, la calidad de la síntesis se degrada.
- El uso de espyak (puerto de espeak-ng) puede provocar errores de pronunciación en algunas palabras, según advierte la model card.
- No se dispone de información sobre sesgos en el dataset de entrenamiento original.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir prosodia o pronunciación incorrecta en palabras poco comunes.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo original en `rhasspy/piper-voices`.
- No se han publicado métricas de calidad (MOS, WER) en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-en_gb-northern_english_male-medium-espeak)
- [Repositorio original en rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/northern_english_male/medium)
- [Repositorio de phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio de scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio de phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
