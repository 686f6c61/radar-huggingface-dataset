# mohamedrayyan/mms-tts-div-finetuned-md-f02

## Resumen

`mohamedrayyan/mms-tts-div-finetuned-md-f02` es un modelo de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un ajuste fino (fine-tuning) del modelo base `facebook/mms-tts-div`, perteneciente a la familia MMS (Massively Multilingual Speech) de Meta, que emplea la arquitectura VITS. El modelo fue desarrollado por mohamedrayyan como parte del proyecto Chatterbox TTS Dhivehi, cuyo objetivo es ofrecer múltiples voces sintéticas de calidad para un idioma con escasos recursos de voz sintetizada.

Con 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero que puede ejecutarse en hardware modesto, incluso en CPU. Esta variante concreta corresponde a una voz femenina (female voice 01) y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones. Su relevancia radica en cubrir un hueco importante: el dhivehi carece de opciones TTS de código abierto de calidad, y este modelo, junto con sus variantes, aporta una solución práctica y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | versiones cuantizadas publicadas por el autor (mms-tts-dhivehi-quantized) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponibles exportaciones ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un decodificador de forma de onda basado en flujos normalizadores y un discriminador adversarial, todo entrenado de forma conjunta mediante inferencia variacional. VITS elimina la necesidad de pipelines de múltiples etapas (texto a espectrograma, espectrograma a audio) al generar directamente la forma de onda a partir del texto.

El ajuste fino parte del checkpoint `facebook/mms-tts-div`, que forma parte del proyecto MMS de Meta, entrenado con datos de voz de cientos de idiomas. El autor ha refinado el modelo con datos de voz en dhivehi para producir una voz femenina natural. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni el número de épocas. El proyecto incluye además variantes con otras voces femeninas, masculinas y voces clonadas, así como exportaciones cuantizadas y ONNX.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, generando audio directamente en forma de onda.
- Voz femenina natural (variante f02), diferenciada de otras variantes del proyecto.
- Integración sencilla con la librería Transformers mediante `VitsModel` y `AutoTokenizer`.
- Generación de audio en formato tensor de onda, listo para guardar como WAV o procesar posteriormente.
- Compatible con inferencia sin GPU gracias a su reducido número de parámetros.
- Disponibilidad de versiones cuantizadas y ONNX para despliegue en entornos con recursos limitados.
- No incluye capacidades de control de emociones, prosodia ni múltiples hablantes dentro del mismo checkpoint.

## Casos de uso

- Audiolibros en dhivehi: el modelo permite convertir textos literarios o educativos en dhivehi a audio, facilitando el acceso a la lectura en un idioma con poca oferta de audiolibros comerciales. Su licencia MIT permite su integración en plataformas de distribución de audiolibros sin coste de licencia.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y aplicaciones de accesibilidad que necesiten vocalizar contenido en dhivehi, un idioma que carece de voces sintéticas comerciales de calidad.
- Contenido educativo y e-learning: generación de narración para cursos online, tutoriales y materiales didácticos en dhivehi, permitiendo a creadores de contenido producir audio sin necesidad de estudio de grabación.
- Lectura automatizada de noticias: integración en portales de noticias de Maldivas para ofrecer versiones en audio de sus artículos, mejorando el alcance a usuarios que prefieren consumir contenido escuchando.
- Sistemas IVR y atención telefónica: uso en centralitas automáticas y sistemas de respuesta de voz interactiva en dhivehi, donde el modelo puede leer menús, confirmaciones y mensajes informativos en tiempo real.
- Aplicaciones de aprendizaje de idiomas: generación de ejemplos de pronunciación en dhivehi para estudiantes de la lengua, tanto en apps móviles como en plataformas web de enseñanza de idiomas.
- Asistentes de voz y dispositivos domésticos: integración en asistentes virtuales o dispositivos IoT que requieran respuestas habladas en dhivehi, aprovechando el bajo consumo de recursos del modelo para ejecución en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas de naturalidad (MOS), inteligibilidad (WER) ni comparativas con otros sistemas TTS para dhivehi en la documentación del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo tiene 36,3 millones de parámetros, lo que supone aproximadamente 145 MB en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatible con GPU de consumo: sí, incluyendo RTX 3060, RTX 4060, GTX 1660 y cualquier GPU integrada moderna.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, versiones cuantizadas para entornos embebidos.
- Latencia estimada: no disponible, pero por el tamaño del modelo se espera una síntesis en tiempo real o superior incluso en CPU.
- Almacenamiento: 0,1 GB para los pesos en safetensors.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mohamedrayyan/mms-tts-div-finetuned-md-f02 | VITS | 36,3 M | dv (dhivehi) | MIT | Voz femenina, ajuste fino |
| facebook/mms-tts-div | VITS | 36,3 M | dv (dhivehi) | CC-BY-NC 4.0 | Modelo base, sin ajuste fino |
| facebook/mms-tts (familia) | VITS | ~36 M por idioma | 1100+ idiomas | CC-BY-NC 4.0 | Modelos individuales por idioma |
| Coqui XTTS v2 | Transformer TTS | 467 M | 17 idiomas (no incluye dhivehi) | CPML (no comercial) | Clonación de voz, multilingüe |

La diferencia principal con el modelo base es el ajuste fino con datos de dhivehi, que mejora la naturalidad y la pronunciación. Frente a alternativas multilingües como XTTS v2, este modelo cubre un idioma que aquellas no soportan, aunque carece de capacidades de clonación de voz y control de hablante. La licencia MIT es más permisiva que la CC-BY-NC del modelo base de Meta, lo que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo solo soporta dhivehi; no es adecuado para síntesis en otros idiomas.
- No se dispone de información sobre la cantidad y calidad de los datos de entrenamiento del ajuste fino, lo que dificulta evaluar su robustez ante textos poco frecuentes o nombres extranjeros.
- Puede presentar errores de pronunciación con palabras de origen extranjero, transliteraciones o siglas, dado el limitado corpus de entrenamiento.
- No ofrece control sobre prosodia, velocidad, emoción ni entonación; la salida es una única voz fija.
- La variante f02 es una voz femenina concreta; para otras voces es necesario usar los checkpoints alternativos del proyecto.
- El modelo base de Meta (facebook/mms-tts-div) está bajo licencia CC-BY-NC 4.0, pero este checkpoint derivado se distribuye bajo MIT; conviene verificar la compatibilidad legal del uso comercial del derivado.
- No se han publicado evaluaciones formales de naturalidad ni inteligibilidad, por lo que la calidad percibida puede variar según el texto de entrada.
- El repositorio tiene cero descargas y cero likes, lo que indica que es un modelo reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mohamedrayyan/mms-tts-div-finetuned-md-f02
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Proyecto Chatterbox TTS Dhivehi: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Familia de modelos MMS de Meta: https://huggingface.co/facebook/mms-tts
- Paper de VITS (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Copia del modelo en otra cuenta: https://huggingface.co/Serialtechlab/mms-tts-div-finetuned-md-f02
