# mohamedrayyan/mms-tts-div-ft-spk01-m01

## Resumen

El modelo `mohamedrayyan/mms-tts-div-ft-spk01-m01` es un checkpoint de síntesis de voz (text-to-speech) en dhivehi (idioma maldivo), obtenido mediante fine-tuning del modelo base `facebook/mms-tts-div` de la familia MMS (Massively Multilingual Speech) de Meta. Utiliza la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) y cuenta con 36,3 millones de parámetros. Ha sido desarrollado por mohamedrayyan como parte del proyecto Dhivehi TTS, que busca ofrecer voces sintéticas de calidad para un idioma con pocos recursos digitales.

La relevancia de este modelo radica en que amplía la cobertura de TTS a un idioma de bajos recursos, permitiendo aplicaciones de accesibilidad, educación y asistentes de voz en dhivehi. Al estar basado en VITS, genera audio de forma end-to-end a partir de texto, sin necesidad de vocoders externos. El checkpoint está disponible bajo licencia MIT, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible en este repositorio (se mencionan exportaciones cuantizadas y ONNX en el proyecto general) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, que combina un encoder de texto, un decoder de audio y un discriminador adversarial, todo entrenado de forma conjunta mediante inferencia variacional. El checkpoint parte del modelo preentrenado `facebook/mms-tts-div`, que ya había sido entrenado para dhivehi dentro del proyecto MMS de Meta, y se ha sometido a un fine-tuning adicional con datos específicos del proyecto Dhivehi TTS. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO (que no son habituales en TTS). La innovación principal es la adaptación a una voz concreta (voz femenina 01) y la publicación de múltiples variantes de voz, así como exportaciones a formatos cuantizados y ONNX.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, generando audio en formato waveform.
- Soporte de múltiples voces: el proyecto publica variantes femeninas (f01, f02, f03), masculinas (m01) y voces clonadas (spk01-f01, spk01-m01).
- Integración sencilla con la librería `transformers` mediante `VitsModel` y `AutoTokenizer`.
- No dispone de capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de TTS.
- No es multilingüe: está limitado al idioma dhivehi.

## Casos de uso

- Lectura de texto en aplicaciones de accesibilidad: el modelo puede convertir artículos, libros o noticias en dhivehi a audio, ayudando a personas con discapacidad visual o dificultades de lectura. Su tamaño reducido permite ejecutarlo en dispositivos con recursos limitados.
- Asistentes de voz para hablantes de dhivehi: integrable en asistentes personales o sistemas de respuesta interactiva (IVR) para servicios públicos o privados en Maldivas, ofreciendo una voz natural en el idioma local.
- Educación y aprendizaje de idiomas: puede utilizarse para generar pronunciaciones correctas en dhivehi, tanto para hablantes nativos como para estudiantes extranjeros, en aplicaciones de aprendizaje de idiomas.
- Narración de contenido audiovisual: el modelo permite generar locuciones para vídeos, podcasts o audiolibros en dhivehi, reduciendo costes de producción frente a actores de voz humanos.
- Sistemas de información automatizada: puede integrarse en quioscos interactivos, sistemas de navegación o anuncios públicos que requieran emitir mensajes hablados en dhivehi.
- Desarrollo de chatbots de voz: combinado con un modelo de lenguaje, puede servir como salida de voz para asistentes conversacionales en dhivehi, aunque el propio modelo no gestiona el diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score) ni comparaciones cuantitativas con otros sistemas de TTS para dhivehi.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el tamaño del modelo (36,3 M parámetros). Puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). También es viable en hardware de gama baja o en CPU.
- Compatible con GPUs de consumo: sí, cabe en cualquier GPU moderna, incluidas las integradas.
- Opciones de despliegue: mediante la librería `transformers` de Hugging Face, o mediante exportaciones ONNX para entornos de producción. También se mencionan versiones cuantizadas en el proyecto general, aunque no en este repositorio concreto.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja en CPU, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| `mohamedrayyan/mms-tts-div-ft-spk01-m01` | 36,3 M | dv | MIT | Fine-tune de MMS-TTS para dhivehi, voz femenina 01 |
| `facebook/mms-tts-div` | 36,3 M (aprox.) | dv | CC-BY-NC 4.0 (según MMS) | Modelo base preentrenado por Meta |
| `alakxender/mms-tts-div-ft-spk01-m01` | 36,3 M (aprox.) | dv | MIT | Mismo nombre y arquitectura, pero de otro autor; posible duplicado o variante |

No se dispone de otros modelos TTS específicos para dhivehi en la información recopilada. La comparativa se limita a los modelos de la familia MMS y a la variante de otro autor.

## Limitaciones y advertencias

- El modelo está limitado al idioma dhivehi; no soporta otros idiomas.
- Al ser un fine-tune sobre un modelo preentrenado, puede presentar errores de pronunciación en palabras poco frecuentes o nombres propios, así como alucinaciones auditivas (sonidos inesperados) en textos fuera del dominio de entrenamiento.
- No se especifican los datos de entrenamiento del fine-tuning, por lo que no se puede evaluar la representatividad de las voces ni posibles sesgos de género o dialecto.
- La licencia MIT permite uso comercial, pero se recomienda verificar la atribución del modelo base y del proyecto Dhivehi TTS.
- El modelo no incluye gestión de emociones, entonación controlada ni control de velocidad de habla; estas características dependen del tokenizador y del preprocesamiento.
- No se proporcionan métricas de calidad subjetiva (MOS) ni pruebas de robustez en entornos ruidosos.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/mohamedrayyan/mms-tts-div-ft-spk01-m01)
- [Proyecto Dhivehi TTS (chatterbox-tts-dhivehi)](https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi)
- [Modelo base facebook/mms-tts-div](https://huggingface.co/facebook/mms-tts-div)
- [Documentación del proyecto MMS en fairseq](https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md)
- [Referencia de MMS en Model Database](http://modeldatabase.com/docs/transformers/model_doc/mms.html)
