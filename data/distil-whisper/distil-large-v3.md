# distil-whisper/distil-large-v3

## Resumen

Distil-Whisper distil-large-v3 es un modelo de reconocimiento automático del habla (ASR) obtenido mediante destilación de conocimiento a partir de OpenAI Whisper large-v3. Lo desarrolla el proyecto distil-whisper, el mismo equipo que publicó la metodología de destilación a gran escala mediante pseudo-etiquetado descrita en el paper arXiv:2311.00430. El modelo reduce el tamaño de 1.550 millones a 756 millones de parámetros, lo que se traduce en una latencia aproximadamente 6,3 veces menor que large-v3 manteniendo una precisión muy cercana.

Es la tercera y última entrega de la serie inglesa de Distil-Whisper y está específicamente adaptado para funcionar bien con el algoritmo de transcripción secuencial de audio largo que usan las librerías más populares (Whisper cpp, Faster-Whisper, OpenAI Whisper). Frente a distil-large-v2, mejora un 4,8 % en WER con ese algoritmo, lo que lo convierte en la opción recomendada para despliegues de transcripción en producción con restricciones de latencia.

La relevancia actual radica en que ofrece una calidad cercana a large-v3 (dentro del 1 % de WER en audio largo) con la mitad de parámetros, lo que permite ejecutarlo en GPUs de consumo y en entornos de CPU con cuantización. Está publicado bajo licencia MIT y es compatible con el ecosistema Transformers, ONNX y transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado de large-v3 |
| Parametros totales | 756.405.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por chunk; audio largo mediante algoritmo secuencial o chunked |
| Tipos de cuantizacion | no especificados en la model card; compatibles con las de Whisper (fp16, int8, int4) via las librerias de despliegue |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers), ONNX, GGUF/ct2 para Whisper cpp y Faster-Whisper |

## Arquitectura y entrenamiento

distil-large-v3 sigue la arquitectura encoder-decoder de Whisper, pero con el encoder reducido a la mitad de capas respecto a large-v3, lo que explica la reducción de 1.550 a 756 millones de parámetros. El decoder mantiene la estructura original para preservar la calidad de generación. La destilación se realizó mediante pseudo-etiquetado a gran escala: el modelo profesor (large-v3) genera transcripciones sobre un corpus de audio no etiquetado de gran tamaño, y el modelo estudiante se entrena para imitar esas salidas, combinando pérdidas de destilación a nivel de token y de secuencia.

La innovación principal de esta versión es que el procedimiento de destilación se adaptó para maximizar la precisión con el algoritmo secuencial de audio largo de OpenAI, que es el que emplean por defecto Whisper cpp, Faster-Whisper y OpenAI Whisper. El resultado es un modelo que funciona bien tanto con el algoritmo secuencial como con el chunked. El modelo está pensado para decodificación especulativa como asistente de large-v3, y la model card documenta esa integración en Transformers.

## Capacidades

- Transcripción de voz a texto en inglés, tanto en audio corto (menos de 30 segundos) como en audio largo.
- Algoritmo secuencial de audio largo compatible con Whisper cpp, Faster-Whisper y OpenAI Whisper.
- Algoritmo chunked de audio largo para procesamiento por bloques.
- Generación de marcas de tiempo a nivel de segmento mediante `return_timestamps=True`.
- Decodificación especulativa: puede usarse como modelo asistente para acelerar large-v3 en Transformers.
- Integración con Transformers (desde la versión 4.39), transformers.js, Candle, Whisper cpp, Faster-Whisper y OpenAI Whisper.
- Exportación a ONNX y ejecución en navegador mediante transformers.js.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo procesa audio largo con el algoritmo secuencial manteniendo un WER cercano al de large-v3, lo que permite generar actas automáticas con marcas de tiempo por segmento en pipelines de productividad.
- Subtitulado automático de vídeo: la salida con timestamps por segmento y la latencia 6,3 veces menor que large-v3 lo hacen adecuado para generar subtítulos en lotes grandes de contenido sin disparar el coste de GPU.
- Atención al cliente basada en voz: transcripción en tiempo casi real de llamadas en inglés para alimentar sistemas de análisis de sentimiento o resumen posterior, aprovechando que cabe en GPUs de consumo.
- Búsqueda y análisis de archivos de audio: indexación de podcasts o grabaciones mediante transcripción masiva por lotes con Faster-Whisper o Whisper cpp, donde el throughput importa más que la precisión absoluta.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones web, usando transformers.js para ejecutar el modelo en el navegador sin enviar audio a un servidor.
- Aceleración de pipelines con large-v3: uso como modelo asistente en decodificación especulativa para reducir la latencia de un sistema que ya emplea large-v3 como modelo principal.
- Preprocesado para LLMs: transcripción de audio a texto como primer paso de un pipeline RAG o de resumen con modelos de lenguaje.

## Benchmarks y rendimiento

Datos publicados en la model card (WER en %, menor es mejor; latencia relativa respecto a large-v3):

| Modelo | Parametros (M) | Latencia relativa | Short-Form WER | Sequential Long-Form WER | Chunked Long-Form WER |
|---|---|---|---|---|---|
| large-v3 | 1550 | 1.0 | 8.4 | 10.0 | 11.0 |
| distil-large-v3 | 756 | 6.3 | 9.7 | 10.8 | 10.9 |
| distil-large-v2 | 756 | 5.8 | 10.1 | 15.6 | 11.6 |

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,5 GB para los pesos (756 M de parámetros), más memoria para activaciones y buffers de audio; en la práctica cabe holgadamente en GPUs de 4 GB o más.
- En cuantización int8 el modelo ocupa del orden de 800 MB, lo que permite ejecución en CPU con latencia aceptable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. En A100/H100 se obtiene el máximo throughput por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: Transformers (pipeline de ASR), Faster-Whisper (ct2), Whisper cpp (GGUF), OpenAI Whisper, transformers.js (ONNX en navegador) y Candle.
- Latencia y throughput: la model card indica una latencia relativa de 6,3 respecto a large-v3, es decir, aproximadamente 6,3 veces más rápido en las condiciones del benchmark. No se publican cifras absolutas de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros (M) | Idiomas | Latencia relativa | WER long-form secuencial | Licencia |
|---|---|---|---|---|---|
| distil-large-v3 | 756 | en | 6.3 | 10.8 | MIT |
| distil-large-v2 | 756 | en | 5.8 | 15.6 | MIT |
| Whisper large-v3 | 1550 | multilingue | 1.0 | 10.0 | MIT |
| Whisper large-v3-turbo | no disponible en la informacion | multilingue | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para transcripción multilingüe.
- El WER en audio corto (9,7 %) es superior al de large-v3 (8,4 %), por lo que en clips de menos de 30 segundos la pérdida de precisión es apreciable.
- Puede heredar sesgos de Whisper large-v3 en cuanto a acentos, dialectos y calidad del audio; el rendimiento cae con ruido de fondo intenso o audio telefónico degradado.
- Riesgo de alucinación en pasajes de silencio o música, comportamiento conocido en la familia Whisper.
- Aunque la licencia es MIT, conviene verificar las condiciones de uso de los datos de entrenamiento originales de Whisper si el despliegue es comercial a gran escala.
- La model card señala que existe una versión posterior, distil-large-v3.5, por lo que para nuevos proyectos conviene evaluar esa variante.
- No dispone de tool calling, capacidades de agente ni procesamiento de vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/distil-whisper/distil-large-v3
- Paper de Distil-Whisper: https://arxiv.org/abs/2311.00430
- Paper de Whisper (referencia): https://arxiv.org/abs/2210.13352
- Whisper large-v3 (modelo profesor): https://huggingface.co/openai/whisper-large-v3
- distil-large-v2: https://huggingface.co/distil-whisper/distil-large-v2
- distil-large-v3.5: https://huggingface.co/distil-whisper/distil-large-v3.5
- Documentación de Transformers para Whisper: https://huggingface.co/docs/transformers/en/model_doc/whisper
