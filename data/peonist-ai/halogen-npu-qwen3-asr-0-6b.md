# peonist-ai/halogen-npu-qwen3-asr-0.6b

## Resumen

Esta ficha describe `peonist-ai/halogen-npu-qwen3-asr-0.6b`, un artefacto de despliegue publicado por peonist-ai. No es un modelo entrenado desde cero: es la conversión de `Qwen/Qwen3-ASR-0.6B` (revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`) para ejecutarse en la NPU Ryzen AI con arquitectura XDNA2 de AMD Strix Halo, dentro del servidor `halogen-flash-server`. El modelo base tiene 0,6 B de parámetros y está orientado a reconocimiento automático de voz; la conversión conserva la licencia Apache-2.0 y se distribuye como pesos `.hnpw` y programas compilados para NPU.

Su relevancia es de infraestructura: permite servir transcripción de audio en la NPU mientras la GPU queda disponible para un modelo Flash, detrás del mismo puerto y con una API compatible con `/v1/audio/transcriptions` de OpenAI. Acepta grabaciones WAV de hasta 20 minutos o 25 MiB por petición. No sustituye a un runtime general: los ficheros solo cargan en el contenedor `halogen-flash-server`, sobre hardware AMD Strix Halo, y no se han publicado benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | encoder de audio y decoder de voz, según la estructura de ficheros `enc/` y `devices/`; no se detalla la variante exacta de transformer |
| Parámetros totales | 600 M (0,6 B) |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; límite de audio de 20 minutos o 25 MiB por petición |
| Tipos de cuantización | no disponible; el tag del repositorio indica `base_model:quantized` y los pesos se convierten a `.hnpw` para NPU |
| Idiomas soportados | no disponibles; la model card no incluye lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hnpw` para el decoder (1,29 GB), programas y pesos NPU en `enc/` (250 MB) y `devices/` (30 MB), tokenizer en `tokenizer/` (11 MB); no compatible con safetensors ni GGUF |
| Tamaño del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

La información disponible describe un encoder de audio y un decoder de voz empaquetados como programas NPU y pesos `.hnpw`. No se especifican el número de capas, la dimensión del modelo, el mecanismo de atención ni si se trata de un transformer estándar u otra variante. Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composición del dataset, ni referencia a RLHF o DPO. La conversión no reentrena el modelo: adapta el modelo base `Qwen/Qwen3-ASR-0.6B` para la NPU XDNA2, e incluye compilación de programas y conversión de pesos, pero el esquema exacto de cuantización no se publica.

La innovación principal es el despliegue: el modelo se ejecuta en la NPU de AMD Strix Halo dentro de `halogen-flash-server`, convive con un modelo Flash en la GPU y expone una API compatible con OpenAI para transcripción de audio. El servidor verifica tamaño y checksum de cada fichero antes de arrancar, y cada versión del servidor descarga la revisión con la que fue publicada.

## Capacidades

- Reconocimiento automático de voz: transcripción de grabaciones WAV mediante el endpoint `/v1/audio/transcriptions` con formato de petición compatible con OpenAI.
- Entrada de audio de hasta 20 minutos o 25 MiB por petición.
- Ejecución local en la NPU Ryzen AI XDNA2 de AMD Strix Halo, sin depender de una API en la nube.
- Integración en el mismo servidor y puerto que el modelo Flash servido en GPU.
- Servicio de un solo modelo de voz a la vez.
- Verificación de integridad de los ficheros por tamaño y checksum por parte del servidor.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión ni generación de texto general.
- No se publica la lista de idiomas soportados, por lo que no se puede confirmar cobertura multilingüe concreta.

## Casos de uso

- Transcripción de reuniones y entrevistas: se envían grabaciones WAV de hasta 20 minutos al endpoint local y el audio permanece en el equipo Strix Halo, sin salir a servicios externos.
- Archivo y documentación interna: digitalización por lotes de notas de voz y actas en WAV de hasta 25 MiB, con una API estándar que simplifica la integración con herramientas internas.
- Dictado en aplicaciones de escritorio: un cliente que hable la API de OpenAI puede enviar audio al servidor y recibir la transcripción, sin SDK propietario ni adaptadores específicos.
- Offload de ASR en un servidor con la GPU ocupada: la NPU transcribe mientras la GPU sirve el modelo Flash, aprovechando el mismo contenedor y puerto.
- Prototipos de asistentes de voz locales: un pipeline que capture audio, lo convierta a WAV y llame al endpoint permite validar flujos de voz con privacidad por diseño.
- Cumplimiento y datos sensibles: la transcripción se ejecuta en hardware local, lo que facilita tratar audio confidencial sin transferirlo a terceros; conviene revisar los avisos de terceros en `devices/NOTICE.md` y `enc/NOTICE.md`.
- Control de calidad de grabaciones de atención al cliente: transcripción de llamadas de hasta 20 minutos para revisión manual y muestreo; al no haber benchmarks, debe validarse el WER en el dominio concreto antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo de reconocimiento de voz, las métricas pertinentes serían WER/CER y latencia de transcripción; no se incluyen en la model card ni en los resultados de búsqueda. Tampoco hay datos de throughput ni de consumo energético.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA2, integrada en AMD Strix Halo; el modelo no se ejecuta en GPU CUDA ni ROCm.
- Controlador NPU instalado, XRT con su plugin NPU y el reloj de fabric de la GPU mantenido mientras la NPU trabaja junto a la GPU.
- Espacio en disco: 1,6 GB para el repositorio; 1,29 GB para los pesos `.hnpw` del decoder, 250 MB para el encoder, 30 MB para `devices/` y 11 MB para el tokenizer.
- VRAM de GPU: no se publica una estimación porque el ASR se ejecuta en la NPU; el servidor puede usar la GPU para el modelo Flash.
- GPU consumer: no aplica; los ficheros no cargan en transformers, llama.cpp, Ollama, vLLM ni TGI.
- Despliegue: `halogen-flash-server` 0.18.12 o posterior para los ficheros de la cabeza del repositorio, con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=qwen3-asr-0.6b`; el servidor descarga los ficheros en `/models/npu/qwen3-asr-0.6b/`.
- Latencia y throughput: no disponibles.
- Contención de memoria: con un modelo de voz cargado junto a otros modelos NPU, las imágenes superiores a 512x512 de `flux2-klein-4b` pueden no caber y el servidor devuelve un error indicándolo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen3-ASR-0.6B` original | 600 M | no disponible | no disponible | Apache-2.0 | Publicado en HuggingFace; runtime no detallado en la información disponible |
| `peonist-ai/halogen-npu-qwen3-asr-0.6b` (esta conversión) | 600 M | audio WAV de hasta 20 min o 25 MiB | no disponible | Apache-2.0 |
