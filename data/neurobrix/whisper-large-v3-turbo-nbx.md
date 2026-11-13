# Neurobrix/whisper-large-v3-turbo-nbx

## Resumen

`whisper-large-v3-turbo-nbx` es un contenedor `.nbx` del modelo de reconocimiento automatico del habla **whisper-large-v3-turbo** de OpenAI, empaquetado por **Neurobrix** para ejecutarse con su motor de inferencia local. No se trata de un modelo nuevo ni de un fine-tune: el autor declara explicitamente que el modelo, los pesos y la licencia son los del original, y que el contenedor solo anade el grafo de computacion, los pesos, la topologia de componentes y los valores por defecto de ejecucion que necesita el motor NeuroBrix.

La relevancia de este artefacto es de infraestructura, no de modelado: permite ejecutar un modelo STT de referencia sin depender del stack de PyTorch, gracias al motor Triton con kernels `nbxtensor` certificados por clase de GPU, y con planificacion automatica del reparto entre una o varias GPU, memoria host o streaming. El contenedor ocupa 1,6 GB y se distribuye bajo licencia MIT, la misma del modelo original.

Al estar construido sobre `openai/whisper-large-v3-turbo`, hereda la arquitectura encoder-decoder transformer de Whisper en su variante turbo (destilada para reducir latencia), aunque la model card de este repositorio no aporta cifras propias de parametros, contexto de audio ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo, heredada del modelo base; no detallada en la model card) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (el contenedor `.nbx` se distribuye como artefacto empaquetado de 1,6 GB) |
| Idiomas soportados | no disponible en la model card de este repositorio (los del modelo base Whisper) |
| Licencia | MIT |
| Formato de pesos | Contenedor `.nbx` (grafo de computacion + pesos + topologia + defaults de runtime) |
| Tamano del contenedor | 1,6 GB |
| SHA-256 | `99cf9f4b64fd9e70fbb190b2f554330adfd45e00ad8de8f5a9a442aab01ad0ab` |
| Libreria | `neurobrix` |
| Modelo base | `openai/whisper-large-v3-turbo` |
| Pipeline | `automatic-speech-recognition` |
| Backends de ejecucion | PyTorch engine o Triton engine (`nbxtensor`, sin PyTorch) |
| Hardware soportado | GPU NVIDIA, GPU de Mac (Metal), CPU |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo: es un empaquetado del checkpoint `openai/whisper-large-v3-turbo`. Por tanto, la arquitectura corresponde a la familia Whisper (encoder-decoder transformer con entrada de audio en log-Mel spectrogram y decodificacion autoregresiva de tokens de texto), en la variante *turbo* del modelo large-v3, que OpenAI disena para reducir el coste de decodificacion manteniendo calidad de transcripcion. La model card no reproduce el detalle de capas, dimensiones ocultas ni cabezas de atencion.

En cuanto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset, ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card original de OpenAI, que el autor remite explicitamente como fuente de verdad. La innovacion tecnica que anade este repositorio es el propio formato `.nbx`: un contenedor autocontenido que incluye el grafo de computacion, los pesos, la forma en que se conectan los componentes y los valores por defecto de runtime, de modo que el motor NeuroBrix puede planificar la ejecucion (una GPU, varias, streaming o host) sin intervencion manual.

El motor ofrece dos rutas: el engine de PyTorch y el engine de Triton, este ultimo sin dependencia de PyTorch y basado en kernels `nbxtensor` certificados por clase de GPU. Es un cambio de runtime, no de matematica del modelo: los pesos y la licencia son los del original.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre ficheros de audio, con el pipeline `automatic-speech-recognition`.
- Transcripcion multilingue y traduccion al ingles, heredadas del modelo base Whisper large-v3-turbo (la model card de este repositorio no enumera idiomas concretos).
- Ejecucion local sin servicios en la nube: el contenedor incluye todo lo necesario para correr el modelo en hardware propio.
- Planificacion automatica de recursos: reparte el modelo entre una GPU, varias GPU, memoria host o streaming segun lo que detecte el motor.
- Portabilidad de hardware: NVIDIA (CUDA), GPU de Mac (Metal) y CPU.
- Ejecucion sin PyTorch mediante el engine Triton con kernels `nbxtensor`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- **Transcripcion de reuniones y actas**: ejecutar `neurobrix run --model openai/whisper-large-v3-turbo --audio reunion.wav` en una estacion de trabajo con GPU consumer para obtener la transcripcion sin enviar audio a terceros, lo que simplifica el cumplimiento de proteccion de datos.
- **Subtitulado de video en local**: integrar el contenedor en un pipeline de postproduccion que procese lotes de clips y genere subtitulos, aprovechando que el motor puede repartir la carga entre varias GPU si estan disponibles.
- **Dictado en herramientas internas**: exponer el modelo como servicio STT dentro de una aplicacion de escritorio o web corporativa, con el engine Triton para evitar arrastrar la dependencia de PyTorch en la imagen de despliegue.
- **Despliegue en macOS para equipos de investigacion**: usar la ruta Metal en Mac para prototipar y validar transcripciones sin acceso a servidores con GPU NVIDIA.
- **Procesamiento por lotes en CPU**: en entornos sin GPU, ejecutar el modelo en CPU para transcripciones no urgentes (archivos historicos, auditorias) donde el throughput no es critico.
- **Evaluacion de motores de inferencia**: comparar el engine PyTorch frente al engine Triton con kernels `nbxtensor` sobre el mismo checkpoint, midiendo latencia y uso de memoria por clase de GPU.
- **Base para pipelines ASR propios**: al ser un contenedor reproducible con SHA-256 fijo, sirve como artefacto versionado en un registro interno de modelos para pipelines de datos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye WER, latencia ni throughput, y remite a la model card original de OpenAI para cualquier metrica del modelo.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la informacion proporcionada. El contenedor pesa 1,6 GB, lo que da una cota inferior del espacio de almacenamiento, no de la VRAM en ejecucion.
- **GPU recomendadas**: no se especifican modelos concretos. El motor soporta GPU NVIDIA (CUDA), GPU de Mac (Metal) y CPU.
- **GPU consumer**: no se confirma ni se descarta; la model card no indica requisitos minimos por clase de GPU, solo que existen kernels `nbxtensor` certificados por clase de GPU.
- **Opciones de despliegue**: CLI de NeuroBrix (`pip install neurobrix`, `neurobrix import`, `neurobrix run`), con engine PyTorch o engine Triton. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Neurobrix/whisper-large-v3-turbo-nbx` | no disponible | no disponible | no disponible | MIT | Hugging Face + hub NeuroBrix (`.nbx`, 1,6 GB) |
| `openai/whisper-large-v3-turbo` (original) | no disponible en la informacion | no disponible | no disponible | MIT | Hugging Face |
| `nvidia/parakeet-tdt-1.1b` (segun docs de NeuroBrix) | 1,1 B (TDT) | no disponible | no disponible | no disponible | Contenedor `.nbx` de 4,0 GiB en el hub NeuroBrix |

La unica diferencia verificable entre el primer y el segundo modelo es el formato y el runtime: mismo checkpoint, misma licencia, distinto motor de ejecucion. Frente a Parakeet TDT 1.1B, el contenedor de Whisper es mas pequeno (1,6 GB frente a 4,0 GiB), pero no hay datos publicados para comparar calidad de transcripcion.

## Limitaciones y advertencias

- **No es un modelo nuevo**: cualquier limitacion del checkpoint original de OpenAI (sesgos, alucinaciones en audio con ruido o silencios largos, errores en acentos y dominios especificos) se aplica sin cambios.
- **Riesgo de alucinacion**: los modelos Whisper pueden generar texto plausible en segmentos sin habla o con audio degradado; conviene validar en produccion con deteccion de actividad de voz.
- **Idiomas no documentados**: la model card de este repositorio no enumera idiomas soportados; hay que consultar la del modelo base.
- **Sin benchmarks propios**: no hay evidencia publicada en este repositorio sobre latencia, throughput o WER del contenedor frente a otras rutas de ejecucion.
- **Dependencia del ecosistema NeuroBrix**: el uso esta ligado a la CLI y al motor de NeuroBrix; no se documenta exportacion a GGUF, safetensors sueltos ni compatibilidad con vLLM, llama.cpp u Ollama.
- **Madurez del artefacto**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es nula.
- **Licencia MIT**: permite uso comercial, pero se debe conservar el aviso de copyright y verificar los terminos del modelo base en su model card original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Neurobrix/whisper-large-v3-turbo-nbx
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Descarga del contenedor en el hub NeuroBrix: https://neurobrix.org/models/openai/whisper-large-v3-turbo
- Documentacion de NeuroBrix: https://docs.neurobrix.org/
- Hub de NeuroBrix: https://neurobrix.org
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels `nbxtensor`: https://github.com/NeuroBrix/nbxtensor
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
