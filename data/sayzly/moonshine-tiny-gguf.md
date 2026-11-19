# sayzly/moonshine-tiny-gguf

## Resumen

Moonshine Tiny (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `moonshine-ai/moonshine-tiny`, publicada por el usuario `sayzly`. No se trata de un modelo nuevo: es una redistribución cuantizada del modelo original de Moonshine AI, empaquetada específicamente en cuantización Q8_0 para su descarga por parte de la herramienta Sayzly. El repositorio contiene únicamente el fichero `moonshine-tiny-Q8_0.gguf`, sin model card técnica detallada más allá de la atribución al modelo base.

El modelo subyacente es un sistema de transcripción de voz a texto de tipo encoder-decoder con aproximadamente 27 millones de parámetros, lo que lo sitúa en la gama ultraligera de modelos ASR. Su relevancia radica en el tamaño reducido y el formato GGUF, que permite ejecución en CPU y en dispositivos con recursos muy limitados, algo poco habitual en la familia Whisper y sus derivados.

La licencia es MIT, heredada del modelo original, lo que facilita su uso comercial y su integración en productos. La información pública disponible sobre esta conversión concreta es mínima: no se detallan composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para reconocimiento automático del habla (modelo base Moonshine Tiny); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (única cuantización publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `moonshine-ai/moonshine-tiny` es un sistema ASR de tipo encoder-decoder con unos 27 millones de parámetros. La información proporcionada no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas de atención o decodificación en la model card de esta conversión.

Esta publicación concreta es una cuantización a Q8_0 del modelo original, realizada por el usuario `sayzly` y distribuida como fichero GGUF único. No hay información sobre el proceso de conversión, la herramienta empleada (por ejemplo, `convert_hf_to_gguf.py` de llama.cpp) ni verificaciones de fidelidad respecto a los pesos originales en FP32/FP16. El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que el fichero puede no estar efectivamente alojado o que la métrica no se ha actualizado.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) sobre audio de entrada.
- Pipeline declarado: `automatic-speech-recognition`.
- Ejecución en formato GGUF, lo que permite inferencia en CPU y en entornos con recursos limitados mediante runtimes compatibles.
- No se documentan capacidades de traducción, diarización de hablantes, detección de idioma, puntuación automática ni marcas de tiempo en la información disponible.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción en dispositivos de borde: con 27 millones de parámetros y cuantización Q8_0, el modelo puede ejecutarse en CPU o en hardware embebido para transcribir notas de voz localmente, sin enviar audio a la nube.
- Subtitulado de vídeos en local: integración en pipelines de postproducción que ya usan runtimes GGUF para generar transcripciones preliminares que luego se revisan manualmente.
- Dictado en aplicaciones de escritorio: incorporación en herramientas de productividad que necesitan un motor ASR ligero y con licencia permisiva (MIT) para distribuirse con el producto.
- Prototipado rápido de interfaces de voz: al ser un fichero GGUF pequeño, permite validar flujos de voz a texto en entornos de desarrollo sin aprovisionar GPU.
- Preprocesado de audio en pipelines de datos: transcripción masiva de grabaciones cortas en servidores sin acelerador, donde el throughput prima sobre la precisión máxima.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de calidad de Q8_0 frente a los pesos originales del modelo base en tareas ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 27 millones de parámetros en Q8_0, el fichero de pesos ocupa del orden de decenas de megabytes, por lo que la inferencia cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería más que suficiente, aunque el modelo está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: runtimes compatibles con GGUF (llama.cpp y derivados) para el fichero Q8_0; el modelo original en formato Hugging Face puede ejecutarse con Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moonshine Tiny (GGUF, esta ficha) | 27,1 M | No disponible | MIT | GGUF (Q8_0) | Conversión de terceros; sin benchmarks publicados en el repo |
| Moonshine Tiny (original) | 27,1 M | No disponible | MIT | Pesos Hugging Face | Modelo base del que deriva esta conversión |
| Whisper Tiny | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Alternativa ASR de gama ultraligera; datos no verificados aquí |

## Limitaciones y advertencias

- La model card del repositorio es mínima: no documenta idiomas, condiciones de entrenamiento ni evaluación, lo que dificulta estimar su calidad real.
- Al ser una conversión de terceros, no hay garantía de fidelidad respecto a los pesos originales ni de que el proceso de cuantización se haya validado.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB; conviene verificar que el fichero GGUF esté realmente disponible antes de integrarlo en producción.
- Riesgo de alucinación en transcripciones: los modelos ASR pequeños pueden generar texto plausible en segmentos de audio ruidosos o silenciosos; no se documenta mitigación alguna.
- Sesgos: no disponibles en la información proporcionada; al no conocerse la composición del dataset, no es posible evaluar sesgos acústicos o lingüísticos.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al modelo original `moonshine-ai/moonshine-tiny`.
- No se documentan limitaciones de longitud de audio ni de contexto; deben validarse empíricamente antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/moonshine-tiny-gguf
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
