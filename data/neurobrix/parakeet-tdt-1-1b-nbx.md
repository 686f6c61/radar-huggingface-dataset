# Neurobrix/parakeet-tdt-1.1b-nbx

## Resumen

parakeet-tdt-1.1b-nbx es un contenedor `.nbx` del modelo de reconocimiento automatico del habla parakeet-tdt-1.1b desarrollado originalmente por NVIDIA. El contenedor lo publica NeuroBrix, un proyecto de inferencia local que empaqueta el grafo de computacion, los pesos, las conexiones entre componentes y los valores por defecto de ejecucion del modelo en un unico artefacto de 4,3 GB, de modo que el motor NeuroBrix pueda ejecutarlo sin reconstruir la arquitectura.

El modelo subyacente es un sistema de speech-to-text basado en la arquitectura TDT (Token-and-Duration Transducer), una variante de transductor que predice de forma conjunta tokens y duraciones para mejorar la eficiencia del decodificado. Con 1.100 millones de parametros, esta pensado para transcripcion de audio en produccion, con enfasis en inferencia local sobre hardware propio.

La relevancia de esta ficha es doble: por un lado, documenta el modelo original de NVIDIA; por otro, aclara que el repositorio de Hugging Face solo contiene el empaquetado para NeuroBrix, no pesos en formato safetensors ni GGUF, y que la licencia CC-BY-4.0 y las condiciones de uso son las del modelo original. Cualquier evaluacion tecnica debe remitirse a la model card de NVIDIA para los detalles de entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), segun el nombre del modelo base; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1,1 mil millones (1.1b, segun el identificador) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | contenedor `.nbx` (4,3 GB); no se distribuyen safetensors ni GGUF en este repositorio |
| Tarea | automatic-speech-recognition (speech-to-text) |
| Modelo base | nvidia/parakeet-tdt-1.1b |
| Libreria / motor | neurobrix (motor propietario del proyecto, con backend PyTorch o Triton) |
| Hardware soportado | NVIDIA GPUs, Mac GPUs (Metal) y CPU |
| SHA-256 del contenedor | ea60fb82f807ead40a104eb0bb573d63f95e56143525a096aac0593b707a5525 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo base es parakeet-tdt-1.1b de NVIDIA y que su nombre hace referencia a la familia TDT (Token-and-Duration Transducer), una arquitectura de transductor para reconocimiento del habla que modela conjuntamente la emision de tokens y su duracion. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales de decodificacion.

El repositorio NeuroBrix no aporta informacion de entrenamiento: se limita a empaquetar el modelo original. El contenedor incluye el grafo de computacion, los pesos, las conexiones entre componentes y los valores por defecto de ejecucion, y el motor planifica la colocacion de cada parte del modelo entre una o varias GPUs, memoria streaming o host. Para los detalles de entrenamiento hay que consultar la model card original de NVIDIA, que no forma parte de la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) a partir de audio, segun el pipeline declarado `automatic-speech-recognition`.
- Transcripcion local: el contenedor esta disenado para ejecutarse en hardware propio, incluyendo NVIDIA GPUs, Mac GPUs (Metal) y CPU.
- Ejecucion con dos backends: motor PyTorch o motor Triton sin PyTorch, mediante kernels nbxtensor certificados por clase de GPU.
- Planificacion automatica de recursos: reparte el modelo entre una GPU, varias, streaming o host segun la memoria disponible.
- Soporte de tool calling / function calling: no disponible (no es una capacidad declarada para este modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio de entrada adicional, thinking mode): no disponibles; la unica modalidad declarada es audio de entrada y texto de salida.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo puede ejecutarse sobre la GPU o CPU del equipo del usuario mediante `neurobrix run --model nvidia/parakeet-tdt-1.1b --audio recording.wav`, sin enviar el audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual: al ser un modelo STT de 1,1B, puede integrarse en un pipeline que reciba segmentos de audio y genere texto para subtitulos; la licencia CC-BY-4.0 permite su uso comercial con atribucion.
- Dictado y accesibilidad: integracion en aplicaciones de escritorio o moviles con backend CPU o Metal para dictado por voz, aprovechando que el contenedor incluye los valores por defecto de ejecucion y evita configurar el grafo manualmente.
- Procesamiento por lotes en servidores con varias GPUs: el motor NeuroBrix planifica la distribucion del modelo entre varias GPUs o mediante streaming, lo que permite desplegarlo en nodos con memoria limitada por GPU.
- Investigacion en ASR: al estar empaquetado como contenedor reproducible con SHA-256 verificado, sirve para comparar resultados de transcripcion entre hardware y backends (PyTorch frente a Triton) manteniendo el mismo modelo.
- Prototipado rapido de aplicaciones de voz: la instalacion via `pip install neurobrix` y la importacion con `--accept-license` reducen el trabajo de integracion frente a montar manualmente el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, el contenedor ocupa 4,3 GB en disco, pero no se especifica el consumo de memoria en ejecucion ni el efecto de la cuantizacion.
- GPU recomendadas: no disponibles. El autor declara soporte para NVIDIA GPUs, Mac GPUs (Metal) y CPU, sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el motor declara ejecucion en una GPU, varias, streaming o host, pero no se detallan los minimos.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (kernels nbxtensor certificados por clase de GPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Neurobrix/parakeet-tdt-1.1b-nbx | 1,1B | no disponible | ASR (STT) | CC-BY-4.0 | contenedor `.nbx` | Hugging Face y neurobrix.org |
| nvidia/parakeet-tdt-1.1b | 1,1B | no disponible | ASR (STT) | CC-BY-4.0 | no disponible en la informacion proporcionada | Hugging Face (modelo original) |
| Otras alternativas de ASR | no disponible | no disponible | ASR | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos es frente al modelo original de NVIDIA, del que este contenedor es un empaquetado: mismos pesos y misma licencia, con la diferencia del formato de distribucion y el motor de ejecucion.

## Limitaciones y advertencias

- Este repositorio no contiene pesos en safetensors ni GGUF: solo un contenedor `.nbx` que requiere el motor NeuroBrix para ejecutarse.
- La model card del contenedor remite explicitamente a la model card original de NVIDIA para el entrenamiento, el uso previsto y las limitaciones, que se aplican sin cambios; esa informacion no esta incluida en los datos disponibles.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion en la transcripcion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos ASR y debe evaluarse con el modelo original.
- Limitaciones de contexto o idioma: no disponibles; no se declaran idiomas soportados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario conservar la atribucion a NVIDIA y cumplir los terminos de la licencia original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (13 de noviembre de 2026), por lo que no hay evidencia de uso en produccion.
- Dependencia de un motor propietario (NeuroBrix) y de kernels certificados por clase de GPU para el backend Triton, lo que puede limitar la portabilidad frente a formatos estandar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Neurobrix/parakeet-tdt-1.1b-nbx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Descarga del contenedor: https://neurobrix.org/models/nvidia/parakeet-tdt-1.1b
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentacion: https://docs.neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
