# Neurobrix/granite-speech-3.3-8b-nbx

## Resumen

`Neurobrix/granite-speech-3.3-8b-nbx` es un contenedor `.nbx` del modelo `ibm-granite/granite-speech-3.3-8b` de IBM, empaquetado por NeuroBrix para su ejecución en el motor de inferencia del mismo nombre. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo modelo, con los mismos pesos y la misma licencia Apache 2.0, pero distribuido como un artefacto autocontenido que incluye el grafo de computación, los pesos, la topología de componentes y los valores por defecto de ejecución necesarios para que el motor lo cargue sin configuración adicional.

El modelo subyacente es un modelo de comprensión de voz (speech-understanding) de la familia Granite de IBM, con 8.000 millones de parámetros y una ventana de contexto diseñada para procesar audio y texto conjuntamente. Resuelve tareas de reconocimiento automático del habla (ASR) y, según la familia a la que pertenece, tareas derivadas como resumen de reuniones, transcripción con contexto largo y respuesta a instrucciones sobre audio. Su relevancia actual radica en que combina un modelo abierto con licencia permisiva con un formato de despliegue que abstrae la planificación de hardware.

La aportación específica de esta ficha es el empaquetado: NeuroBrix planifica automáticamente dónde ejecutar cada parte del modelo (una GPU, varias, streaming o host) y ofrece dos backends, PyTorch y Triton, este último sin dependencia de PyTorch mediante los kernels `nbxtensor`. El contenedor ocupa 17,3 GB y se distribuye con verificación SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la familia Granite orientado a comprensión de voz; el detalle de capas y atención no figura en la información proporcionada) |
| Parametros totales | 8 000 millones (según el identificador `granite-speech-3.3-8b`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor se distribuye como artefacto `.nbx` de 17,3 GB; no se enumeran cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computación + pesos + topología + defaults de runtime); no se expone safetensors ni GGUF |
| Tamano del contenedor | 17,3 GB |
| SHA-256 | `b8b722adbf18d1569079ce69666fdb53b24b2a7f75494c16392691dd29bf246f` |
| Backends de ejecución | PyTorch y Triton (kernels `nbxtensor`, sin PyTorch) |
| Hardware soportado | GPUs NVIDIA, GPUs de Mac (Metal) y CPU |
| Pipeline declarado | automatic-speech-recognition |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO) del modelo subyacente en la información proporcionada. La model card del contenedor remite explícitamente a la model card original de `ibm-granite/granite-speech-3.3-8b` para el detalle de entrenamiento, uso previsto y limitaciones, y declara que estos se aplican sin cambios.

Lo que sí está documentado es la capa de empaquetado. El contenedor `.nbx` incluye cuatro elementos: el grafo de computación del modelo, los pesos, la descripción de cómo se conectan sus componentes y los valores por defecto de runtime. El motor NeuroBrix realiza una planificación de placement que decide dónde ejecutar cada parte del modelo en función de las GPUs y la memoria disponibles, con modos de una GPU, varias GPUs, streaming o ejecución en host. El backend Triton emplea kernels `nbxtensor` certificados por clase de GPU, lo que elimina la dependencia de PyTorch en ese modo de ejecución.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea declarada en el `pipeline_tag` del contenedor.
- Comprensión de audio con instrucciones: la interfaz de ejecución acepta un fichero de audio y un prompt de texto (`--audio meeting.wav --prompt "Summarize this call."`), lo que indica capacidad de responder instrucciones sobre el contenido del audio.
- Resumen de audio: el ejemplo canónico de la model card es el resumen de una llamada, lo que apunta a capacidades de abstracción sobre transcripciones.
- Procesamiento de audio-LLM: la etiqueta `audio-llm` confirma que el modelo combina un encoder de audio con un modelo de lenguaje.
- Ejecución local: inferencia en hardware propio, sin depender de API externa.
- Planificación automática de hardware: reparto de cómputo entre una o varias GPUs, streaming o CPU.
- Doble backend: PyTorch y Triton, con kernels certificados por clase de GPU en el segundo caso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no figuran en la información proporcionada.
- Modo thinking, visión o audio bidireccional adicional: no disponible.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo recibe un fichero de audio y devuelve texto; el ejemplo de la model card (`--audio meeting.wav --prompt "Summarize this call."`) muestra el flujo completo de transcripción más resumen en una sola invocación, adecuado para actas automáticas de reuniones internas.
- Resumen de llamadas de atención al cliente: con un prompt de resumen sobre el audio de la llamada, se puede generar un resumen estructurado del motivo de contacto, la resolución y los siguientes pasos, integrándolo en un CRM.
- Generación de subtítulos y actas para contenido audiovisual: procesamiento por lotes de ficheros de audio o vídeo para producir transcripciones con marcas temporales, si el modelo las soporta (no confirmado en la información disponible), o al menos texto plano alineado por segmentos.
- Análisis de entrevistas cualitativas: transcripción y resumen de entrevistas de investigación o periodísticas, aprovechando la ejecución local para mantener el audio dentro de la infraestructura de la organización.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en entornos donde no se puede enviar audio a servicios en la nube por requisitos de privacidad.
- Procesamiento de audio en el borde o en estaciones de trabajo: al soportar GPUs de Mac (Metal) y CPU, el contenedor permite desplegar transcripción en portátiles y equipos sin GPU dedicada NVIDIA, útil para periodistas o investigadores en campo.
- Pipelines internos de documentación: transcripción de notas de voz y grabaciones de soporte para alimentar bases de conocimiento, con la ventaja de que la licencia Apache 2.0 no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del contenedor no incluye métricas de WER, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos; remite a la model card original de IBM para cualquier dato de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, el contenedor pesa 17,3 GB; con pesos en FP16 un modelo de 8 000 millones de parámetros requiere del orden de 16 GB solo para pesos, más overhead de activaciones y del encoder de audio. La cifra exacta no está publicada.
- GPU recomendadas: no especificadas. El motor soporta GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, sería necesario al menos una GPU con 24 GB o más para FP16, o cuantización no documentada para tarjetas menores; no se dispone de datos de cuantización.
- Despliegue: `neurobrix import ibm-granite/granite-speech-3.3-8b --accept-license` y `neurobrix run --model ibm-granite/granite-speech-3.3-8b --audio <fichero> --prompt "<instrucción>"`. Backends PyTorch y Triton. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Modos de ejecución: una GPU, varias GPUs, streaming o host, con planificación automática por parte del motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Neurobrix/granite-speech-3.3-8b-nbx` | 8 000 M | no disponible | Apache 2.0 | contenedor `.nbx` | Empaquetado NeuroBrix del modelo IBM; ejecución local con planificación de hardware |
| `ibm-granite/granite-speech-3.3-8b` | 8 000 M | no disponible | Apache 2.0 | no disponible en esta ficha | Modelo original de IBM; misma arquitectura y pesos |
| `openai/whisper-large-v3` | 1 550 M | 30 s de audio por ventana | Apache 2.0 | safetensors, GGUF, etc. | Referencia ASR pura, sin capa de instrucciones; parámetros muy inferiores |
| `Qwen/Qwen2-Audio-7B-Instruct` | 7 000 M aprox. | no disponible | Apache 2.0 (según versión) | safetensors | Modelo audio-LLM comparable en tamaño y enfoque instruccional |

La comparación con Whisper y Qwen2-Audio se ofrece como referencia de categoría; los datos de esos modelos no proceden de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards. No se dispone de benchmarks comparativos publicados para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- La información disponible es la de un contenedor de empaquetado, no la de un modelo nuevo: cualquier limitación del modelo original de IBM aplica sin cambios y debe consultarse en su model card.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de robustez en la información proporcionada.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe sin consultar la documentación original.
- Longitud de contexto no disponible: no se puede planificar el tamaño máximo de audio o transcripción por invocación con los datos actuales.
- No se documentan cuantizaciones: el contenedor es un artefacto único de 17,3 GB, lo que limita el despliegue en GPUs de gama baja sin información adicional.
- Dependencia del ecosistema NeuroBrix: el modelo se ejecuta a través del motor `neurobrix`, no como un checkpoint estándar de Transformers; migrar a vLLM, TGI o llama.cpp requeriría el modelo original.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene conservar los avisos de atribución a IBM y verificar los términos del empaquetado de NeuroBrix.
- Verificar la integridad del contenedor con el SHA-256 publicado antes de desplegarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria reportada.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/granite-speech-3.3-8b-nbx
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- Página del contenedor en NeuroBrix: https://neurobrix.org/models/ibm-granite/granite-speech-3.3-8b
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación: https://docs.neurobrix.org
- Hub de NeuroBrix: https://neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
