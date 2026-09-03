# mohamedrayyan/mms-tts-div-finetuned-md-m01

## Resumen

El modelo `mohamedrayyan/mms-tts-div-finetuned-md-m01` es un sistema de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un checkpoint afinado a partir del modelo base `facebook/mms-tts-div`, que a su vez pertenece a la familia Massively Multilingual Speech (MMS) de Meta, basada en la arquitectura VITS. El autor, mohamedrayyan, lo desarrolla como parte del proyecto Dhivehi TTS, que busca ofrecer voces de calidad para un idioma con escasos recursos tecnológicos.

El modelo tiene 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, lo que lo hace extremadamente ligero y desplegable en hardware modesto, incluso en CPU. Su relevancia radica en que democratiza la síntesis de voz para un idioma de bajos recursos, ofreciendo una alternativa de código abierto con licencia MIT. Se publican varias variantes de voz (femenina, masculina y clonada) y también exportaciones cuantizadas y ONNX, lo que facilita su integración en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | no disponible (se mencionan versiones cuantizadas en el proyecto, pero no se especifican los formatos) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se publica exportación ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un decodificador de audio basado en flujos normalizadores y un discriminador adversarial. El checkpoint original `facebook/mms-tts-div` fue preentrenado por Meta dentro del proyecto MMS, que cubre más de 1.100 idiomas. Este modelo concreto es un fine-tuning de ese checkpoint base, realizado por mohamedrayyan con datos específicos de dhivehi.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de horas de audio, ni el proceso de ajuste (si se usó RLHF, DPO u otra técnica). La model card solo indica que se trata de un fine-tuning y que forma parte del proyecto Dhivehi TTS, que también publica variantes de voz y exportaciones adicionales. No se documentan innovaciones técnicas más allá de la adaptación al idioma.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, generando audio en formato waveform.
- Soporte de múltiples voces: el proyecto publica variantes femeninas (f01, f02, f03), masculinas (m01) y voces clonadas (spk01-f01, spk01-m01).
- Integración sencilla con la librería `transformers` mediante `VitsModel` y `AutoTokenizer`.
- Posibilidad de exportación a ONNX y cuantización para despliegue ligero.
- No dispone de otras capacidades como tool calling, razonamiento multi-paso o procesamiento de visión, al ser un modelo exclusivamente de TTS.

## Casos de uso

- Accesibilidad para hablantes de dhivehi: conversión de texto escrito en dhivehi a audio para personas con discapacidad visual o dificultades de lectura, integrable en lectores de pantalla o aplicaciones de accesibilidad.
- Asistentes de voz en dhivehi: integración en asistentes virtuales o chatbots con interfaz de voz para el mercado de Maldivas, aprovechando su bajo coste computacional.
- Narración de contenido educativo: generación de audiolibros, lecciones o materiales de aprendizaje en dhivehi, útil para plataformas de e-learning dirigidas a hablantes nativos.
- Sistemas de respuesta de voz interactiva (IVR): automatización de menús telefónicos o servicios de atención al cliente en dhivehi, donde el modelo puede ejecutarse en servidores modestos.
- Creación de contenido multimedia: doblaje o locución de vídeos, podcasts o anuncios en dhivehi, con la posibilidad de elegir entre varias voces (femenina, masculina, clonada).
- Prototipado rápido de aplicaciones TTS: gracias a su licencia MIT y su tamaño reducido, es adecuado para desarrolladores que necesitan una solución TTS en dhivehi sin depender de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros sistemas TTS para dhivehi. La model card no incluye evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el tamaño de 36 millones de parámetros. Puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). También funciona en hardware integrado.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.) y también en placas como Raspberry Pi si se usa la versión cuantizada u ONNX.
- Opciones de despliegue: librería `transformers` de Hugging Face, exportación ONNX para runtime como ONNX Runtime, y versiones cuantizadas para entornos con restricciones de memoria.
- Latencia y throughput estimados: no disponibles. Dado el tamaño del modelo, se espera una latencia baja (del orden de decenas de milisegundos por frase en GPU), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mohamedrayyan/mms-tts-div-finetuned-md-m01` | 36,3 M | no aplica | MIT | Hugging Face |
| `facebook/mms-tts-div` (base) | 36,3 M (aprox.) | no aplica | CC-BY-NC 4.0 (según MMS) | Hugging Face |
| `mashey/mms-tts-div-finetuned-md-m01` | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo base de Facebook tiene una licencia no comercial (CC-BY-NC), mientras que este fine-tuning usa MIT, lo que permite uso comercial. No hay otros modelos TTS específicos para dhivehi con los que comparar en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados de un idioma de bajos recursos, puede presentar variaciones en la pronunciación o entonación no controladas.
- Riesgo de alucinación: no aplica, al ser un modelo TTS no genera texto, solo audio. Sin embargo, puede producir errores de pronunciación en palabras poco frecuentes o nombres propios.
- Limitaciones de contexto o idioma: el modelo solo soporta dhivehi. No se ha evaluado su comportamiento con texto fuera de ese idioma.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo base de Facebook (del que deriva) tiene licencia CC-BY-NC, lo que podría generar conflictos legales si se redistribuye el modelo base sin permiso. El fine-tuning en sí está bajo MIT, pero se recomienda verificar la licencia del modelo original.
- Caveat para producción: no hay evaluaciones publicadas de calidad de voz ni de robustez. Se recomienda realizar pruebas subjetivas con hablantes nativos antes de desplegarlo en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-div-finetuned-md-m01
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Proyecto Dhivehi TTS (repositorio del autor): https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Perfil de GitHub del autor: https://github.com/mohamedrayyan/
- Documentación del proyecto MMS de fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- Notebook de inferencia MMS TTS: https://colab.research.google.com/github/facebookresearch/fairseq/blob/main/examples/mms/tts/tutorial/MMS_TTS_Inference_Colab.ipynb
