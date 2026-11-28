# MigoXV/diar_streaming_sortformer_4spk-v2

## Resumen

`MigoXV/diar_streaming_sortformer_4spk-v2` es una conversión a formato Safetensors de los pesos oficiales del modelo Streaming Sortformer v2.0 de NVIDIA, un sistema de diarización de hablantes en streaming diseñado para separar la actividad de hasta cuatro interlocutores en una señal de audio. El modelo original lo desarrolla NVIDIA dentro de su ecosistema NeMo, y esta réplica de MigoXV conserva los 990 tensores originales y la arquitectura PyTorch nativa, sin reentrenamiento ni cuantización.

Con 117,7 millones de parámetros y un repositorio de 0,5 GB, el modelo resuelve el problema de la diarización en línea: identificar quién habla y cuándo, con un paso de salida temporal de 80 ms. Ese diseño lo hace adecuado para transcripción con atribución de hablante en tiempo real, reuniones, atención al cliente o análisis de llamadas, donde no se puede esperar a procesar el audio completo.

La relevancia de esta ficha es doble: por un lado, el modelo base de NVIDIA es una referencia en diarización end-to-end con Sortformer; por otro, esta conversión a Safetensors elimina la dependencia de NeMo en el entorno de ejecución y se ha validado con el servidor `sortformer-dia` sobre aceleradores Ascend 910B4, además de CPU. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v2 (transformer de diarización end-to-end, arquitectura PyTorch nativa definida en `config.json`) |
| Parametros totales | 117.744.664 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming; paso de salida de 80 ms) |
| Tipos de cuantizacion | no disponible (la conversión no incluye cuantización; se ejecuta en float32) |
| Idiomas soportados | no disponible (depende del audio de entrada; el modelo separa hablantes, no transcribe) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, 990 tensores) |

## Arquitectura y entrenamiento

El modelo es un sistema de diarización de hablantes basado en Sortformer, una arquitectura que aborda la separación de interlocutores como un problema de clasificación de actividad por hablante en lugar de un pipeline en cascada de segmentación y clustering. La versión v2 incorpora procesamiento en streaming, con un paso de salida de 80 ms, lo que permite emitir predicciones de actividad de hablante de forma incremental conforme llega el audio. El repositorio incluye `config.json` con los parámetros de streaming y `source.json` con la versión de origen y el SHA-256 del archivo original.

Esta conversión no ha implicado entrenamiento ni ajuste fino: se limita a transformar los pesos oficiales de NVIDIA a Safetensors conservando los 990 tensores. No se dispone de información sobre el número de tokens de audio, la composición del dataset de entrenamiento ni el uso de RLHF o DPO en la información proporcionada. El preprocesamiento de características STFT/Mel se calcula en CPU según la model card.

## Capacidades

- Diarización de hablantes en streaming con separación de actividad para hasta 4 interlocutores.
- Emisión de predicciones con paso temporal de 80 ms, apta para procesamiento en línea.
- Clasificación de audio por hablante (pipeline `audio-classification`).
- Ejecución sobre CPU y sobre aceleradores NPU (validado en Ascend 910B4 con `--device npu:0 --dtype float32`).
- Servicio mediante gRPC a través de la herramienta `sortformer-dia`.
- No incluye transcripción, traducción ni generación de texto: es un modelo de diarización, no un ASR.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el modelo se ejecuta en paralelo al ASR y asigna cada segmento a uno de los cuatro interlocutores, aprovechando el paso de 80 ms para mantener la sincronía en tiempo real.
- Análisis de llamadas de atención al cliente: permite medir tiempos de habla por agente y cliente, detectar solapamientos e identificar turnos en grabaciones o flujos en vivo.
- Subtitulado en directo con etiquetas de hablante: integrado en un pipeline de streaming, añade la identidad del interlocutor a los subtítulos sin necesidad de posprocesar el audio completo.
- Investigación en lingüística de corpus: segmentación automática de entrevistas y conversaciones multihablante para generar anotaciones de turnos de palabra.
- Moderación y análisis de reuniones remotas: detección de cuántos participantes intervienen y de la distribución de la palabra, útil en herramientas de productividad.
- Despliegue en hardware no NVIDIA: al haberse validado en Ascend 910B4, encaja en entornos con aceleradores NPU donde no hay CUDA disponible.
- Prototipado en CPU: con float32 y 117,7 M de parámetros, permite pruebas locales sin GPU para validar pipelines de diarización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 117,7 M de parámetros en float32 el peso de los tensores ronda los 0,47 GB, por lo que la huella de memoria es modesta.
- GPU recomendadas: no disponible; la model card solo documenta ejecución en CPU y en Ascend 910B4 (NPU).
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no está confirmado en la información proporcionada.
- Opciones de despliegue: servidor `sortformer-dia` con soporte de `streaming_sortformer_v2` (comando `poetry run sortformer-dia serve --model /path/to/model --device cpu --dtype float32`); no se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el diseño fija un paso de salida de 80 ms, pero no se publican cifras de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / paso de salida | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| MigoXV/diar_streaming_sortformer_4spk-v2 | 117,7 M | paso de 80 ms | Sí | CC BY 4.0 | safetensors |
| nvidia/diar_streaming_sortformer_4spk-v2 | no disponible en la información | paso de 80 ms | Sí | CC BY 4.0 | pesos NeMo (formato original) |
| Otros sistemas de diarización (pyannote, NeMo MSDD) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de diarización (pyannote, NeMo MSDD u otros) no está disponible en la información proporcionada; solo se puede contrastar con el modelo base de NVIDIA, del que esta versión es una conversión de formato.

## Limitaciones y advertencias

- El modelo está limitado a un máximo de 4 hablantes; conversaciones con más interlocutores requieren otro sistema.
- No realiza transcripción: solo separa actividad de hablante, por lo que debe combinarse con un ASR para obtener texto.
- No se documentan sesgos específicos, pero al ser un modelo de audio hereda los sesgos de su dataset de entrenamiento original, no detallado aquí.
- Riesgo de confusión en hablantes con voces similares o en solapamientos intensos; no se publican métricas de DER en esta ficha.
- La licencia CC BY 4.0 exige atribución a NVIDIA y al autor de la conversión; es compatible con uso comercial siempre que se respete la atribución indicada en `NOTICE` y `LICENSE`.
- La conversión no incluye cuantización; el despliegue en float32 puede no ser óptimo para entornos con restricciones de memoria muy estrictas.
- El soporte de ejecución depende de una versión de `sortformer-dia` compatible con `streaming_sortformer_v2`; versiones antiguas no cargarán el directorio.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2
- Modelo base de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2
