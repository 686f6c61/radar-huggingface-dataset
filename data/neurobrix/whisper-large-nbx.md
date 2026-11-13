# Neurobrix/whisper-large-nbx

## Resumen

whisper-large-nbx es un contenedor `.nbx` del modelo de reconocimiento automático del habla whisper-large de OpenAI, empaquetado por NeuroBrix para ejecutarse en su motor de inferencia local. No se trata de un modelo nuevo ni de un fine-tuning: los pesos, la arquitectura y la licencia son los del modelo original de OpenAI; NeuroBrix solo añade el grafo de computación, la descripción de conexión entre componentes y los valores por defecto de ejecución necesarios para que su motor lo cargue directamente.

El interés de esta ficha es, por tanto, la del contenedor y su motor, no la del modelo subyacente. NeuroBrix propone un único motor para todos los modelos, con planificación automática de la ejecución entre varias GPU, streaming de pesos o CPU, y soporte de dos backends: uno basado en PyTorch y otro basado en Triton que no requiere PyTorch, usando kernels propios (nbxtensor) certificados por clase de GPU.

El contenedor ocupa 6,2 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo original. La relevancia actual está en la portabilidad: el mismo comando (`neurobrix run`) funciona sobre GPU NVIDIA, GPU de Mac (Metal) y CPU, lo que simplifica el despliegue de transcripción local sin depender de un stack PyTorch completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (whisper-large de OpenAI); empaquetado como contenedor `.nbx` |
| Parametros totales | no disponible (el contenedor ocupa 6,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (whisper-large original trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computacion, pesos, conexiones y valores por defecto de runtime) |

## Arquitectura y entrenamiento

El modelo subyacente es whisper-large de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz. Esta ficha no dispone de detalles sobre el dataset, el número de tokens ni el proceso de alineación del modelo original; esa información debe consultarse en la model card de `openai/whisper-large`.

La aportación de NeuroBrix es de infraestructura, no de entrenamiento. El contenedor incluye el grafo de computación del modelo, sus pesos, cómo se conectan sus componentes y sus valores por defecto de runtime. El motor planifica dónde se ejecuta cada parte del modelo según las GPU y la memoria disponibles (una GPU, varias, streaming o host) y ofrece dos backends: PyTorch y Triton, este último con kernels nbxtensor certificados por clase de GPU y sin dependencia de PyTorch.

## Capacidades

- Reconocimiento automático del habla (pipeline `automatic-speech-recognition`), heredado de whisper-large.
- Transcripción de audio por línea de comandos mediante `neurobrix run --model openai/whisper-large --audio recording.wav`.
- Ejecución local en GPU NVIDIA, GPU de Mac (Metal) y CPU.
- Planificación automática de la ejecución entre una o varias GPU, con streaming de pesos o ejecución en host.
- Dos motores de ejecución: PyTorch y Triton (sin PyTorch).
- Importación del modelo desde el Hub con `neurobrix import openai/whisper-large --accept-license`.
- Capacidades multilingües, tool calling, agentes o visión: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción local de reuniones: el contenedor se ejecuta en la máquina del usuario con un solo comando, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de vídeo en pipelines de edición: la integración por CLI (`neurobrix run --audio`) permite invocar la transcripción desde scripts de postproducción sin montar un stack PyTorch.
- Despliegue en equipos sin GPU NVIDIA: el motor soporta GPU de Mac (Metal) y CPU, por lo que el mismo contenedor sirve en portátiles y estaciones de trabajo heterogéneas.
- Inferencia en servidores multi-GPU: la planificación automática reparte el modelo entre varias GPU o aplica streaming de pesos, útil cuando el contenedor de 6,2 GB no cabe en una sola GPU.
- Entornos sin PyTorch: el backend Triton con kernels nbxtensor permite ejecutar el modelo sin instalar PyTorch, lo que reduce el tamaño del stack de dependencias en imágenes de contenedor.
- Reproducibilidad de despliegues: el contenedor fija grafo, pesos y valores por defecto con un SHA-256 verificable, lo que facilita auditorías y despliegues reproducibles en producción.
- Evaluación comparativa de motores: al conservar los pesos originales, permite medir el rendimiento de los backends PyTorch y Triton sobre el mismo modelo sin cambios de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el contenedor ocupa 6,2 GB en disco y el motor puede ejecutarlo con streaming de pesos o en host, por lo que el pico de memoria no se especifica.
- GPU recomendadas: no disponibles. El motor declara soporte para GPU NVIDIA, GPU de Mac (Metal) y CPU.
- GPU de consumo: no se especifica qué modelos concretos son compatibles; el soporte depende de la certificación de kernels nbxtensor por clase de GPU.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (sin PyTorch); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Neurobrix/whisper-large-nbx | no disponible (contenedor de 6,2 GB) | no disponible | Apache 2.0 | `.nbx` | Empaquetado de whisper-large para el motor NeuroBrix |
| openai/whisper-large | no disponible en la informacion | no disponible | Apache 2.0 | safetensors/PyTorch (original) | Modelo base; requiere stack de inferencia propio |
| Otras variantes de whisper-large | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: hereda sin cambios los sesgos, la tasa de alucinación y las limitaciones de whisper-large de OpenAI.
- La model card no documenta idiomas soportados, cuantizaciones ni requisitos de memoria; estos datos deben obtenerse del modelo original o de la documentación de NeuroBrix.
- El formato `.nbx` ata el despliegue al motor NeuroBrix; no es directamente interoperable con vLLM, llama.cpp, Ollama o TGI.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que se cumplen las condiciones del modelo original de OpenAI.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de uso en producción.
- La certificación de kernels Triton es por clase de GPU; conviene comprobar que el hardware objetivo está cubierto antes de desplegar.
- El SHA-256 del contenedor debe verificarse tras la descarga para garantizar la integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neurobrix/whisper-large-nbx
- Modelo original: https://huggingface.co/openai/whisper-large
- Repositorio NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación: https://docs.neurobrix.org
- Documentación (raíz): https://docs.neurobrix.org/
- Catálogo de modelos: https://neurobrix.org
- Página del modelo en el catálogo: https://neurobrix.org/models/openai/whisper-large
- YouTube: https://www.youtube.com/@NeuroBrix
