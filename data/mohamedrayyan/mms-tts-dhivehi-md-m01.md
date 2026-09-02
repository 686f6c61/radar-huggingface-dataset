# mohamedrayyan/mms-tts-dhivehi-md-m01

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-md-m01` es un sistema de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un checkpoint afinado a partir de `facebook/mms-tts-div`, el modelo base de la familia Massively Multilingual Speech (MMS) de Meta AI, que emplea la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). El autor, mohamedrayyan, lo publica como parte de un proyecto más amplio de TTS en dhivehi, con varias variantes de voz (femenina, masculina y clonada) y exportaciones a ONNX y cuantizadas.

Con 36,3 millones de parámetros, es un modelo ligero que puede ejecutarse en CPU sin problemas. Su relevancia radica en cubrir un idioma de bajos recursos con una licencia permisiva (MIT), lo que facilita su integración en aplicaciones comerciales y de investigación. El modelo genera audio de forma directa a partir de texto, sin necesidad de vocoder externo, y se integra con la API estándar de Transformers de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end TTS) |
| Parametros totales | 36.287.472 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | No especificados en el repo; se menciona una versión cuantizada publicada por el autor |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se publican exportaciones ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura end-to-end que combina un codificador de texto, un decodificador de audio basado en flujos normalizadores y un discriminador adversarial. VITS genera espectrogramas mel y formas de onda directamente, eliminando la necesidad de vocoder externo. El checkpoint parte de `facebook/mms-tts-div`, que ya había sido preentrenado para dhivehi dentro del proyecto MMS de Meta, y se afina con datos específicos del proyecto Dhivehi TTS del autor.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de horas, composición, hablantes) ni sobre el proceso de afinado (épocas, hiperparámetros). La model card indica que el modelo se entrenó como parte del proyecto `mohamedrayyan/chatterbox-tts-dhivehi`, pero no se ofrecen más especificaciones técnicas.

## Capacidades

- Generación de voz en dhivehi a partir de texto, con salida de audio en formato waveform.
- Soporte de múltiples voces: este checkpoint corresponde a la voz masculina 01; existen variantes femeninas y clonadas.
- Integración nativa con la biblioteca Transformers de Hugging Face mediante `VitsModel` y `AutoTokenizer`.
- Posibilidad de exportación a ONNX y cuantización para despliegue en entornos con restricciones de recursos.
- No incluye capacidades de razonamiento, código, visión ni tool calling; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- **Aplicaciones de accesibilidad**: conversión de texto a voz para personas con discapacidad visual que hablan dhivehi, integrable en lectores de pantalla o aplicaciones de lectura.
- **Asistentes de voz en dhivehi**: integración en asistentes virtuales o chatbots que necesiten responder por audio en el idioma local, por ejemplo en servicios de atención al cliente.
- **Audiolibros y contenido educativo**: generación automática de narración para libros, materiales de aprendizaje o noticias en dhivehi, reduciendo costes de locución.
- **Sistemas de respuesta de voz interactiva (IVR)**: uso en centralitas telefónicas o sistemas de información automatizada que requieran mensajes en dhivehi.
- **Traducción de texto a voz en aplicaciones de mensajería**: permitir a usuarios escuchar mensajes escritos en dhivehi, útil para personas con dificultades de lectura.
- **Investigación en procesamiento del habla**: servir como modelo base para experimentos de adaptación a otros dialectos o para estudios de síntesis de voz en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros sistemas TTS para dhivehi.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 36M parámetros, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM. En GPU, la VRAM necesaria es mínima (inferior a 1 GB).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti) es suficiente; también funciona en CPU sin problemas.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y también en dispositivos de gama baja.
- **Opciones de despliegue**: se puede usar con la biblioteca Transformers de Hugging Face, con ONNX Runtime para inferencia optimizada, o mediante el espacio de demostración en Hugging Face Spaces.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por frase en CPU moderna y menor en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-dhivehi-md-m01` | VITS | 36,3M | dv | MIT | Hugging Face |
| `facebook/mms-tts-div` | VITS | ~36M | dv (y otros) | CC-BY-NC 4.0 | Hugging Face |
| `facebook/mms-tts` (modelo base multilingüe) | VITS | ~36M | 1100+ idiomas | CC-BY-NC 4.0 | Hugging Face |

El modelo base `facebook/mms-tts-div` ya soporta dhivehi, pero este checkpoint afinado ofrece una voz masculina específica y una licencia MIT más permisiva para uso comercial. No se dispone de comparativas con otros sistemas TTS comerciales o de código abierto para dhivehi.

## Limitaciones y advertencias

- **Idioma limitado**: el modelo solo genera voz en dhivehi; no es multilingüe.
- **Posibles errores de pronunciación**: según el repositorio de DhivehiAI, el modelo requiere fonemización adicional para números, fechas y otros elementos no estándar.
- **No optimizado para retractación**: el modelo no está diseñado para corregir o retractar texto ya generado, lo que puede afectar a la fluidez en textos largos.
- **Sesgos de voz**: al ser una única voz masculina, no representa la diversidad de hablantes del dhivehi.
- **Licencia**: aunque la licencia es MIT, el modelo base `facebook/mms-tts-div` tiene licencia CC-BY-NC 4.0, por lo que es necesario verificar si el afinado introduce restricciones adicionales derivadas del uso del modelo base.
- **Sin datos de rendimiento**: no hay benchmarks publicados, por lo que la calidad de la síntesis no está validada objetivamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-md-m01)
- [Proyecto Dhivehi TTS (chatterbox-tts-dhivehi)](https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms)
- [Repositorio de demos de DhivehiAI en GitHub](https://github.com/DhivehiAI/TTS-Demos)
- [Organización DhivehiAI en GitHub](https://github.com/DhivehiAI)
