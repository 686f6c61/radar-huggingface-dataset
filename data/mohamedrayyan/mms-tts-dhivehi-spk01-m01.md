# mohamedrayyan/mms-tts-dhivehi-spk01-m01

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-spk01-m01` es un sistema de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un checkpoint afinado a partir de `facebook/mms-tts-div`, el modelo base de Facebook AI Research dentro de la iniciativa Massively Multilingual Speech (MMS), que emplea la arquitectura VITS. El modelo fue desarrollado por Mohamed Rayyan como parte del proyecto Dhivehi TTS, que busca ofrecer herramientas de voz de código abierto para una lengua con escasos recursos digitales.

Con aproximadamente 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, este modelo es ligero y puede ejecutarse en hardware modesto. Su relevancia radica en que cubre un idioma poco representado en el ecosistema de IA, permitiendo aplicaciones de accesibilidad, educación y servicios de voz en dhivehi. La licencia MIT facilita su uso comercial y su integración en productos. El checkpoint concreto corresponde a una voz masculina clonada (speaker 01), según la tabla de variantes publicada por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa secuencias de texto largas de forma explícita) |
| Tipos de cuantizacion | no disponible (el autor menciona exportaciones cuantizadas y ONNX, pero no especifica los formatos exactos) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se publican exportaciones ONNX y cuantizadas) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un decodificador de audio basado en flujos normalizadores y un discriminador adversarial. VITS genera audio directamente desde el texto sin necesidad de vocoder externo, lo que simplifica el pipeline de inferencia. El checkpoint se obtuvo mediante fine-tuning del modelo preentrenado `facebook/mms-tts-div`, que ya había sido entrenado por Meta para soportar múltiples idiomas, incluido el dhivehi.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o las técnicas de alineación utilizadas en el fine-tuning. El autor indica que el modelo forma parte del proyecto Dhivehi TTS, que también publica variantes con diferentes voces (femeninas y masculinas) y versiones cuantizadas y ONNX. La normalización de texto está incorporada, según se describe en las demos asociadas.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, con salida de audio en formato waveform.
- Soporte de múltiples voces: el repositorio incluye variantes con voces femeninas y masculinas, así como voces clonadas de hablantes concretos.
- Normalización de texto integrada, que maneja formatos numéricos, fechas y otros elementos para mejorar la pronunciación.
- Integración sencilla con la librería `transformers` de Hugging Face mediante `VitsModel` y `AutoTokenizer`.
- Exportaciones a ONNX y versiones cuantizadas para despliegue en entornos con restricciones de recursos.
- Inferencia rápida gracias al tamaño reducido del modelo (36M parámetros), adecuada para aplicaciones en tiempo real.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede convertir artículos, noticias o documentos en dhivehi a audio, permitiendo su consumo en dispositivos móviles o lectores de pantalla.
- Asistentes de voz en dhivehi: integración en asistentes virtuales o chatbots para responder con voz natural en el idioma local, mejorando la experiencia de usuarios en Maldivas.
- Audiolibros y contenido educativo: generación de versiones en audio de libros de texto, cuentos o materiales de aprendizaje para niños y adultos que prefieren escuchar.
- Servicios de atención al cliente automatizada: sistemas IVR (respuesta de voz interactiva) que lean menús o respuestas en dhivehi, reduciendo la necesidad de operadores humanos.
- Lectura de noticias y boletines: generación automática de boletines de audio a partir de feeds de texto para emisoras de radio o plataformas de podcast.
- Herramientas de traducción y aprendizaje de idiomas: apoyo a estudiantes de dhivehi que necesitan escuchar la pronunciación correcta de palabras y frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas como MOS (Mean Opinion Score) o comparaciones con otros sistemas TTS para dhivehi. El autor no proporciona datos de latencia o throughput en la documentación del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamaño de 36M parámetros. El modelo puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no es necesaria una GPU dedicada; cualquier CPU moderna es suficiente. Si se usa GPU, modelos como NVIDIA T4 o superiores ofrecen latencias muy bajas.
- Compatibilidad con hardware de consumo: sí, funciona en portátiles, Raspberry Pi (con limitaciones de memoria) y dispositivos móviles mediante ONNX.
- Opciones de despliegue: `transformers` (Python), ONNX Runtime, y las versiones cuantizadas para entornos con menos recursos. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia estimada: no disponible, pero por el tamaño del modelo se espera una síntesis casi en tiempo real en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-dhivehi-spk01-m01` | VITS | 36,3M | dv | MIT | Hugging Face |
| `facebook/mms-tts-div` | VITS | ~36M (estimado) | dv y otros | CC-BY-NC 4.0 (según MMS) | Hugging Face |
| `dhivehi.ai` TTS (proyecto) | no especificado | no disponible | dv | no disponible | GitHub |

El modelo base `facebook/mms-tts-div` es la referencia principal, pero su licencia es más restrictiva (no comercial). El modelo afinado aquí ofrece una licencia MIT, lo que facilita su uso en productos comerciales. No se han encontrado otros modelos TTS específicos para dhivehi con características comparables.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dhivehi; no soporta otros idiomas.
- La calidad de la voz clonada puede presentar artefactos o falta de naturalidad en comparación con voces profesionales, especialmente en textos largos o con entonación compleja.
- No se dispone de información sobre el conjunto de datos de entrenamiento, por lo que no se pueden evaluar posibles sesgos en la pronunciación de dialectos o acentos regionales.
- El modelo puede tener dificultades con nombres propios extranjeros, siglas o palabras no presentes en el vocabulario de entrenamiento.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías sobre la calidad del audio en producción; se recomienda realizar pruebas exhaustivas antes de desplegar en aplicaciones críticas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-spk01-m01
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Proyecto Dhivehi TTS: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Demo en Hugging Face Space (dhivehihacker): https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Demo en Hugging Face Space (alakxender): https://huggingface.co/spaces/alakxender/tts-dhivehi-demo-mms
- Documentación de TTS en dhivehi.ai: https://dhivehi.ai/docs/technologies/tts/
- Organización GitHub DhivehiAI: https://github.com/DhivehiAI
