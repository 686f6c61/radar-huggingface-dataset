# sayzly/whisper-medium.en-gguf

## Resumen

`sayzly/whisper-medium.en-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `openai/whisper-medium.en`, publicado por el usuario `sayzly`. El modelo original pertenece a la familia Whisper de OpenAI, una arquitectura transformer encoder-decoder entrenada para transcripción de audio a texto. Esta versión GGUF empaqueta los pesos en un único fichero (aproximadamente 0,8 GB) pensado para su uso por parte de la herramienta Sayzly, que descarga el fichero `whisper-medium.en-Q8_0.gguf`.

El modelo base cuenta con 763.873.376 parámetros (según los datos de safetensors del repositorio) y está especializado exclusivamente en inglés, tal como indica el sufijo `.en` de su nombre. La conversión a GGUF facilita su despliegue en entornos que consumen este formato, como llama.cpp o bindings derivados, aunque en el caso de Whisper el soporte depende de la implementación concreta.

La relevancia de esta ficha es limitada: se trata de una republicación cuantizada (Q8_0) de un modelo ya existente, sin model card técnica propia más allá de una nota breve, sin benchmarks publicados y con cero descargas en el momento de la consulta. Resulta útil únicamente como artefacto de despliegue para quien necesite el formato GGUF del Whisper Medium en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), según el modelo base `openai/whisper-medium.en` |
| Parametros totales | 763.873.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Whisper emplea ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | Q8_0 (fichero `whisper-medium.en-Q8_0.gguf`); no se documentan otras variantes |
| Idiomas soportados | inglés (sufijo `.en` del modelo base); no se detalla lista adicional |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `openai/whisper-medium.en`: un transformer encoder-decoder diseñado para ASR, que procesa audio en ventanas y genera texto de forma autorregresiva. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se documentan en la información proporcionada para esta conversión ni se reproducen en la model card del repositorio.

La única innovación técnica asociada a esta publicación es la cuantización a Q8_0 y el empaquetado en GGUF, orientado a reducir el tamaño del artefacto y facilitar su distribución dentro de la herramienta Sayzly. No se documentan cambios en la arquitectura, el vocabulario ni el proceso de decodificación respecto al modelo original.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en inglés.
- Transcripción de audio a texto mediante pipeline `automatic-speech-recognition`.
- Empaquetado en GGUF para su consumo por herramientas compatibles con este formato.
- No se documentan capacidades de traducción, diarización, tool calling, agentes, visión ni audio más allá de la transcripción.
- No se documenta un modo de razonamiento (thinking mode) ni funciones especiales adicionales.

## Casos de uso

- Transcripción de reuniones en inglés: el modelo convierte audio de reuniones en texto plano, adecuado por su especialización monolingüe y su tamaño medio (763 M de parámetros).
- Subtitulado de vídeo en inglés: integrable en pipelines que generan subtítulos a partir de pistas de audio, usando el fichero GGUF en un runtime compatible.
- Generación de actas y notas: transcripción de entrevistas o ponencias en inglés para su posterior procesamiento con modelos de lenguaje.
- Indexación y búsqueda de contenido hablado: conversión de archivos de audio a texto para alimentar motores de búsqueda o sistemas RAG.
- Asistentes de voz en inglés: componente ASR dentro de un asistente que requiera transcripción local sin depender de APIs externas.
- Procesamiento por lotes de archivos de audio: al ser un artefacto GGUF de 0,8 GB, puede desplegarse en entornos con recursos limitados para transcripciones masivas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero Q8_0 ocupa aproximadamente 0,8 GB, por lo que la huella de memoria es reducida en comparación con el modelo en precisión completa.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo, aunque no se documentan modelos concretos.
- ¿Cabe en consumer GPU?: previsiblemente sí, dado el tamaño del artefacto (0,8 GB), si bien no se confirma en la documentación.
- Opciones de despliegue: el formato GGUF es compatible con runtimes como llama.cpp; el soporte específico para Whisper depende de la implementación. No se documentan vLLM, TGI ni Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `sayzly/whisper-medium.en-gguf` | 763.873.376 | no disponible | inglés | apache-2.0 | GGUF (Q8_0) |
| `openai/whisper-medium.en` | 763.873.376 | no disponible | inglés | apache-2.0 | safetensors / PyTorch |
| `openai/whisper-small.en` | no disponible en la información | no disponible | inglés | apache-2.0 | safetensors / PyTorch |
| `openai/whisper-large-v3` | no disponible en la información | no disponible | multilingüe | apache-2.0 | safetensors / PyTorch |

La comparativa se limita a modelos de la misma familia Whisper; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en inglés; no transcribe otros idiomas de forma fiable.
- Al ser una cuantización Q8_0, puede existir una degradación mínima de precisión respecto al modelo original en precisión completa, aunque no se documenta su magnitud.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- No se documentan sesgos específicos, pero el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Licencia apache-2.0, que permite uso comercial, aunque conviene verificar las condiciones del modelo base original.
- Repositorio con cero descargas y sin model card técnica detallada; la trazabilidad de la conversión GGUF no está documentada más allá de la nota del autor.
- No se documentan limitaciones de longitud de audio más allá de las propias del modelo base (ventanas de 30 segundos).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-medium.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium.en
