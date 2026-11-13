# Neurobrix/canary-qwen-2.5b-nbx

## Resumen

Neurobrix/canary-qwen-2.5b-nbx es un contenedor de empaquetado del modelo NVIDIA Canary-Qwen-2.5B, un modelo de comprensión de habla (speech-understanding) que combina el encoder de audio de NVIDIA Canary con el decoder de lenguaje Qwen 2.5B. El modelo original, desarrollado por NVIDIA, resuelve tareas de reconocimiento automático del habla (ASR) y comprensión de audio con salida de texto libre, y este contenedor lo distribuye en formato `.nbx` para su ejecución en el motor NeuroBrix.

El contenedor incluye el grafo de computación del modelo, sus pesos, la topología de conexión entre componentes y los valores por defecto de ejecución. El motor NeuroBrix planifica la distribución de cada parte del modelo entre las GPUs y la memoria disponibles (una GPU, varias, en streaming o en host), y soporta GPUs NVIDIA, GPUs de Mac (Metal) y CPU, con motor PyTorch o con motor Triton (sin dependencia de PyTorch).

La relevancia de este paquete es operativa: permite ejecutar un modelo de audio-LLM de 2.500 millones de parámetros en hardware local heterogéneo sin gestionar manualmente el grafo ni la distribución de pesos. El modelo base es de noviembre de 2026 y el contenedor no aporta pesos nuevos ni fine-tuning: es el mismo modelo y la misma licencia (CC-BY-4.0) que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | audio-LLM (encoder de audio + decoder de lenguaje Qwen 2.5B); detalles del original no disponibles en la informacion proporcionada |
| Parametros totales | 2.500 millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | contenedor `.nbx` (grafo + pesos + topologia + defaults de runtime); pesos originales no disponibles en la informacion proporcionada |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Canary-Qwen-2.5B, un modelo de comprensión de habla que combina un encoder de audio con un decoder de lenguaje basado en Qwen 2.5B. La información proporcionada no detalla la arquitectura interna exacta (tipo de encoder, mecanismo de atención, resolución de audio), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

El contenedor NeuroBrix no modifica el modelo: empaqueta el grafo de computación, los pesos, las conexiones entre componentes y los valores por defecto de ejecución. La innovación del paquete es de infraestructura: el motor planifica la ubicación de cada parte del modelo según las GPUs y la memoria disponibles, y ofrece dos backends de ejecución (PyTorch y Triton mediante kernels nbxtensor certificados por clase de GPU). El contenedor ocupa 5,1 GB y tiene SHA-256 `ea079a90f31d9822d4047985b9e24fa2f72da4db24523255fa5cee0137009624`.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea declarada en el pipeline del modelo.
- Comprensión de habla con salida de texto libre: el ejemplo de la model card muestra resumen de una llamada (`--prompt "Summarize this call."`), lo que indica capacidad de procesar audio y generar texto guiado por prompt.
- Procesamiento de audio de entrada: el contenedor acepta ficheros de audio (`--audio meeting.wav`).
- Ejecución local en hardware heterogéneo: una GPU, varias GPUs, streaming o host; GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- Dos backends de ejecución: motor PyTorch y motor Triton sin PyTorch (kernels nbxtensor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (vision, audio adicional, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo recibe un fichero de audio y genera la transcripción; el ejemplo de la model card ejecuta `neurobrix run --model nvidia/canary-qwen-2.5b --audio meeting.wav --prompt "Summarize this call."`, combinando ASR y resumen en una sola pasada.
- Resumen de conversaciones telefónicas: con el prompt adecuado, el modelo procesa el audio de una llamada y produce un resumen textual, útil para atención al cliente o auditoría de calidad.
- Subtitulado y generación de actas: al ser un modelo de ASR con decoder de lenguaje, puede transcribir audio de forma local en máquinas sin acceso a la nube, lo que encaja en flujos con requisitos de privacidad.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran tamaño: el motor NeuroBrix planifica la ejecución en CPU o en GPUs de Mac (Metal), lo que permite usar el modelo en portátiles y equipos de sobremesa.
- Inferencia en clústeres multi-GPU: el motor distribuye las partes del modelo entre varias GPUs o en streaming, útil cuando el modelo no cabe completo en una sola GPU.
- Ejecución con backend Triton sin PyTorch: en entornos donde no se quiere instalar PyTorch, el motor Triton con kernels nbxtensor permite ejecutar el modelo con dependencias reducidas.
- Procesamiento por lotes de audio en pipelines locales: la importación con `neurobrix import` y la ejecución con `neurobrix run` permiten integrar el modelo en scripts de automatización sobre ficheros de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El contenedor ocupa 5,1 GB en disco, pero no se indica el consumo de VRAM por cuantización.
- GPUs recomendadas: no disponibles en la información proporcionada. El motor soporta GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el motor planifica la ejecución en una GPU, varias, en streaming o en host, lo que sugiere flexibilidad, pero no se detallan modelos concretos.
- Opciones de despliegue: motor NeuroBrix (backends PyTorch y Triton con kernels nbxtensor); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de contexto de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos ni fine-tuning: es el modelo NVIDIA Canary-Qwen-2.5B original, por lo que las limitaciones, sesgos y riesgos de alucinación del modelo original aplican sin cambios.
- La model card remite explícitamente a la model card original de NVIDIA para entrenamiento, uso previsto y limitaciones; esa información no está incluida en la documentación proporcionada.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada; no se puede planificar el procesamiento de audios largos sin verificar el límite real del modelo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos completos de la licencia y las condiciones del modelo original de NVIDIA.
- El contenedor depende del motor NeuroBrix y de su ecosistema (kernels nbxtensor certificados por clase de GPU); la portabilidad fuera de ese motor no está documentada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Riesgo de alucinación en la generación de texto: no cuantificado en la información proporcionada.

## Enlaces

- Hugging Face del contenedor: https://huggingface.co/Neurobrix/canary-qwen-2.5b-nbx
- Modelo original en Hugging Face: https://huggingface.co/nvidia/canary-qwen-2.5b
- Descarga del contenedor: https://neurobrix.org/models/nvidia/canary-qwen-2.5b
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentación de NeuroBrix: https://docs.neurobrix.org
- Canal de YouTube de NeuroBrix: https://www.youtube.com/@NeuroBrix
