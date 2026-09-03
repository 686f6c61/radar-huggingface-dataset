# mohamedrayyan/mms-tts-div-ft-spk01-f01

## Resumen

El modelo `mohamedrayyan/mms-tts-div-ft-spk01-f01` es un checkpoint de síntesis de voz (text-to-speech) en dhivehi, la lengua oficial de las Maldivas, obtenido mediante fine-tuning del modelo base `facebook/mms-tts-div` de Meta. Este modelo base pertenece a la familia MMS (Massively Multilingual Speech) y emplea la arquitectura VITS, un sistema de síntesis neuronal que combina un transformer con normalizing flows y un decodificador basado en vocoder. El checkpoint concreto corresponde a una voz femenina (identificador `spk01-f01`) y forma parte de un proyecto más amplio de TTS en dhivehi desarrollado por el autor, que incluye varias voces y exportaciones a formatos cuantizados y ONNX.

El modelo resuelve el problema de la falta de sistemas de síntesis de voz de calidad para una lengua de bajos recursos como el dhivehi, permitiendo generar audio natural a partir de texto. Su relevancia actual radica en que amplía la cobertura lingüística de los sistemas TTS open source y ofrece una base reutilizable para aplicaciones de accesibilidad, asistentes de voz y contenido audiovisual en dhivehi. Con 36,3 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, incluida una CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (transformer + normalizing flows + vocoder) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible en este checkpoint; se mencionan exportaciones cuantizadas en el proyecto (`mms-tts-dhivehi-quantized`) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), una arquitectura que integra un encoder de texto basado en transformer, un módulo de normalizing flows para modelar la duración y prosodia, y un decodificador que genera la forma de onda directamente. El entrenamiento se realizó mediante fine-tuning del checkpoint preentrenado `facebook/mms-tts-div`, que a su vez fue entrenado por Meta dentro del proyecto MMS sobre cientos de lenguas. El fine-tuning se llevó a cabo con datos de voz en dhivehi, probablemente de un único locutor femenino (según el identificador `spk01-f01`), aunque no se especifican el número de horas de audio ni el procedimiento exacto (si se usó RLHF, DPO u otro método de alineación). No se dispone de información sobre la composición del dataset de entrenamiento ni sobre innovaciones técnicas adicionales más allá de la propia arquitectura VITS.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, con voz femenina (locutor 01).
- Generación de audio en formato waveform directamente, sin necesidad de vocoder externo.
- Integración sencilla con la librería `transformers` de Hugging Face mediante `VitsModel` y `AutoTokenizer`.
- Soporte de texto en escritura Thaana (el alfabeto dhivehi), como se muestra en el ejemplo de uso.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio más allá de la síntesis de voz.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede convertir artículos, noticias o libros en dhivehi a audio, permitiendo su consumo mediante lectores de pantalla o reproductores de audio.
- Asistentes de voz locales: integración en aplicaciones móviles o dispositivos IoT que necesiten responder en dhivehi, por ejemplo en quioscos de información turística en las Maldivas.
- Contenido audiovisual: generación de locuciones para vídeos educativos, anuncios o documentales en dhivehi sin necesidad de contratar actores de voz.
- Aprendizaje de idiomas: herramientas de pronunciación que lean palabras o frases en dhivehi para estudiantes extranjeros o hablantes nativos que quieran mejorar su ortografía.
- Sistemas de respuesta interactiva por voz (IVR): atención al cliente automatizada en servicios públicos o privados de las Maldivas, donde el modelo puede leer menús o confirmaciones en dhivehi.
- Archivado y preservación lingüística: digitalización de textos históricos en dhivehi mediante síntesis de voz, facilitando su difusión oral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas de calidad de voz (MOS, WER, etc.) ni comparaciones con otros sistemas TTS en dhivehi.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 36,3 millones de parámetros, la inferencia en FP32 requiere aproximadamente 145 MB de memoria (36,3 M × 4 bytes). En cuantización a 8 bits, el consumo se reduce a unos 36 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GPU integrada o una CPU moderna pueden ejecutar el modelo en tiempo real.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador personal, Raspberry Pi 4 o superior, y en la mayoría de smartphones.
- Opciones de despliegue: se puede usar directamente con `transformers` en Python, o exportar a ONNX (el proyecto publica una versión ONNX) para entornos de producción. También es posible cuantizar a formatos como int8 para reducir aún más el consumo.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamaño del modelo se espera una latencia inferior a 1 segundo por frase corta en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mohamedrayyan/mms-tts-div-ft-spk01-f01` (este) | 36,3 M | no aplicable | MIT | Hugging Face |
| `facebook/mms-tts-div` (modelo base) | 36,3 M (aprox.) | no aplicable | CC-BY-NC 4.0 (según MMS) | Hugging Face |
| `alakxender/mms-tts-div-ft-spk01-f01` | no disponible | no aplicable | no disponible | Hugging Face |

El modelo base de Meta tiene una licencia no comercial (CC-BY-NC), mientras que este fine-tuning se publica bajo MIT, lo que permite uso comercial. No se dispone de datos de rendimiento comparativo entre estos checkpoints.

## Limitaciones y advertencias

- El modelo está entrenado para una única voz femenina; no es posible cambiar la identidad del locutor sin reentrenar.
- La calidad de la síntesis depende de la cantidad y variedad de datos de entrenamiento, que no se especifican. Es probable que la pronunciación de nombres extranjeros o términos técnicos sea deficiente.
- No se han documentado sesgos específicos, pero al ser un modelo de voz, puede presentar variaciones en la entonación o el ritmo que afecten a la naturalidad en textos largos.
- Riesgo de alucinación: en TTS, esto se manifiesta como errores de pronunciación o silencios inesperados, especialmente con texto fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo base de Meta tiene restricciones no comerciales; conviene verificar si el fine-tuning hereda alguna obligación adicional.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-div-ft-spk01-f01
- Proyecto Chatterbox TTS Dhivehi: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Modelo base de Meta: https://huggingface.co/facebook/mms-tts-div
- Checkpoint similar de otro autor: https://huggingface.co/alakxender/mms-tts-div-ft-spk01-f01
