# sayzly/parakeet-tdt-1.1b-gguf

## Resumen

Parakeet TDT 1.1B (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-1.1b`, publicada por el usuario `sayzly`. No se trata de un modelo nuevo ni de un reentrenamiento: el autor indica explícitamente en la model card que los pesos no se han modificado más allá de la conversión de formato, y que la licencia se mantiene en CC BY 4.0, la misma del modelo original de NVIDIA.

El modelo subyacente es un sistema de speech-to-text basado en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA, con aproximadamente 1.070 millones de parámetros. La variante publicada aquí es un único fichero `parakeet-tdt-1.1b-Q8_0.gguf`, es decir, una cuantización de 8 bits del modelo original, lo que reduce el peso del repositorio a unos 1,3 GB.

Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo ASR de tamaño medio en entornos donde no se dispone de los pesos en safetensors o donde se prefiere un único fichero portable en cuantización Q8_0. La información disponible sobre el proceso de conversión, los idiomas soportados y los benchmarks es muy limitada, por lo que esta ficha se limita a documentar lo que consta de forma verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), según el modelo base `nvidia/parakeet-tdt-1.1b` |
| Parámetros totales | 1.070.516.870 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-1.1b-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura declarada es TDT (Token-and-Duration Transducer), la familia de transductores de NVIDIA para reconocimiento del habla que modela conjuntamente la emisión de tokens y su duración. El modelo base es `nvidia/parakeet-tdt-1.1b`, con 1.070.516.870 parámetros según los datos de safetensors del modelo original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta en la model card ninguna innovación técnica adicional más allá de la propia arquitectura TDT del modelo original. El proceso de conversión a GGUF no incluye detalles sobre la herramienta empleada, la herramienta de tokenización o el tratamiento de las capas específicas del transductor.

## Capacidades

- Reconocimiento automático del habla (speech-to-text), según el pipeline declarado `automatic-speech-recognition`.
- Conversión de audio a texto con el modelo base TDT de NVIDIA.
- Ejecución en formato GGUF, lo que permite su uso con runtimes compatibles con este formato.
- No consta soporte de tool calling, function calling ni capacidades de agente.
- No consta soporte multilingüe explícito; los idiomas no están documentados.
- No consta modo de razonamiento (thinking), visión, audio generativo ni otras capacidades especiales más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en texto dentro de un pipeline local, usando el fichero GGUF con un runtime compatible y evitando depender de servicios en la nube.
- Subtitulado de vídeo: generación de transcripciones para vídeos y posterior alineación temporal en herramientas de subtitulado, aprovechando el pipeline ASR del modelo.
- Indexación y búsqueda de contenido audiovisual: transcripción de archivos de audio para alimentar motores de búsqueda o sistemas de recuperación sobre texto.
- Procesamiento por lotes de archivos de audio: al ser un fichero único de 1,3 GB en Q8_0, se puede desplegar en servidores modestos para transcribir grandes volúmenes de audio en cola.
- Prototipado y evaluación de ASR: útil para comparar el comportamiento del modelo en formato GGUF frente a los pesos originales en safetensors, sin necesidad de descargar el repositorio completo del modelo base.
- Integración en aplicaciones de escritorio o embebidas: el formato GGUF y el tamaño contenido permiten incorporar transcripción local en aplicaciones que ya usan runtimes GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para el fichero Q8_0, más el overhead del runtime y del búfer de audio. No se dispone de cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-3 GB de VRAM libre debería poder alojar los pesos, aunque no consta validación oficial.
- Cabe en GPU de consumo: sí, por el tamaño del fichero Q8_0 (1,3 GB), aunque no se documenta compatibilidad probada con modelos concretos.
- Opciones de despliegue: runtimes compatibles con GGUF. No se especifica en la model card qué runtime concreto se ha validado (llama.cpp, Ollama, etc.).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/parakeet-tdt-1.1b-gguf | 1.070.516.870 | no disponible | GGUF (Q8_0) | CC BY 4.0 | Hugging Face |
| nvidia/parakeet-tdt-1.1b (original) | 1.070.516.870 | no disponible | safetensors | CC BY 4.0 | Hugging Face |
| Otras variantes GGUF de Parakeet TDT | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparativa más directa es con el modelo original de NVIDIA, del que esta publicación es una conversión. No se dispone de información sobre otras alternativas ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta idiomas, contexto, benchmarks ni condiciones de uso específicas.
- Al ser una conversión de terceros, no hay garantía de que el proceso de cuantización Q8_0 preserve exactamente el comportamiento del modelo original; no se aportan métricas de degradación.
- Riesgo de alucinación y errores de transcripción inherente a cualquier modelo ASR; no se documenta su magnitud.
- No consta validación del fichero GGUF con runtimes concretos, lo que puede requerir pruebas previas en producción.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene verificar los términos del modelo original de NVIDIA y de sus dependencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de reportes de errores.
- No se documentan sesgos conocidos del modelo ni del proceso de conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/parakeet-tdt-1.1b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-1.1b
