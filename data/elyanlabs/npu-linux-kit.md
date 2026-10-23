# elyanlabs/npu-linux-kit

## Resumen

`elyanlabs/npu-linux-kit` no es un modelo de lenguaje, sino un kit de software publicado como snapshot de código en Hugging Face. Se trata de una colección de aplicaciones prácticas para la NPU AMD XDNA1 (Phoenix) en Linux, construida sobre el trabajo de bring-up del proyecto `open-xdna`. El repositorio lo mantiene Scott Boudreaux / Elyan Labs y su objetivo es cubrir el hueco que deja AMD: su stack oficial de LLM se centra en XDNA2, mientras que las capacidades reales de la NPU (bajo consumo, convolución y visión, cómputo por lotes, offload) no están empaquetadas en aplicaciones utilizables en Linux.

El módulo destacado y único verificado es `camera/`, que aplica efectos en tiempo real a la webcam y los expone como cámara virtual v4l2 (`NPU Camera`), visible para Zoom, OBS o el navegador. Los demás módulos (`embeddings/`, `audio/`, `ggml-backend/`) están marcados como candidatos o planificados, sin afirmaciones de funcionamiento. El proyecto se declara de investigación y comunidad, no un stack de producción, y se distribuye bajo AGPLv3 con opción de licencia comercial dual.

Es relevante ahora porque documenta con medidas reales el rendimiento de la NPU en pipelines de convolución y porque plantea, como objetivo a medio plazo, un backend XDNA para ggml/llama.cpp. No contiene pesos, checkpoints ni arquitectura de red propia; la información disponible no incluye parámetros, contexto ni cuantizaciones porque no aplican a un modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: kit de software (Python y componentes nativos) sobre la NPU AMD XDNA1 / Phoenix; no es una red neuronal publicada |
| Parámetros totales | No aplica (no contiene pesos de modelo) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No disponible; el kit no publica ni distribuye pesos cuantizados |
| Idiomas soportados | No disponible; el código y la documentación están en inglés y no se declara soporte de idiomas |
| Licencia | AGPL-3.0, con licencia comercial dual (véanse `LICENSE` y `COMMERCIAL.md`) |
| Formato de pesos | No aplica; el repositorio es código fuente, no safetensors ni GGUF |
| Hardware objetivo | AMD XDNA1 (Phoenix), verificado en Ryzen 7 8845HS |
| Sistema verificado | Ubuntu 25.10, kernel 6.17 |
| Dependencias del stack NPU | XRT + amd/xdna-driver + IRON/mlir-aie + Peano (vía `open-xdna`) |
| Dependencias de host | `opencv-python-headless`, `pyvirtualcam`, `numpy`, `ml_dtypes`; `v4l2loopback` para la cámara virtual |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de modelo que describir. El repositorio es un conjunto de módulos de aplicación que invocan kernels compilados para la NPU XDNA1 mediante el stack IRON/mlir-aie y Peano, con el driver `amd/xdna-driver` y XRT como capa de ejecución. Cada módulo se apoya en un patrón de cómputo distinto: el módulo de cámara usa una pipeline por fotograma de convolución y conversión de espacio de color, con ida y vuelta DMA al host; el difuminado de fondo emplea segmentación MODNet real y aplica el desenfoque en CPU, quedando la ruta de desenfoque en NPU como experimental; `embeddings/` apunta a matmul por lotes para amortizar el coste de despacho; `audio/` a wake-word y denoising en el borde; y `ggml-backend/` a un backend XDNA para ggml/llama.cpp, descrito por el autor como el mayor esfuerzo del proyecto y en estado planificado.

La propuesta técnica del kit no es un algoritmo nuevo, sino la integración: empaquetar pipelines de visión y cómputo por lotes en aplicaciones Linux funcionales, con estados de madurez declarados de forma explícita. El autor indica que el módulo de cámara está medido y que el resto no hace afirmaciones de funcionamiento hasta estar construido, yque la verificación se limita a XDNA1 (Phoenix) sobre Ubuntu 25.10 y kernel 6.17.

## Capacidades

- Efectos de webcam en tiempo real sobre NPU, publicados como dispositivo v4l2loopback con etiqueta `NPU Camera`, consumible por Zoom, OBS o el navegador.
- Pipeline completa por fotograma de convolución y conversión de espacio de color, incluyendo el round-trip DMA al host.
- Difuminado de fondo con segmentación MODNet real: primer plano nítido y fondo desenfocado; el desenfoque se ejecuta en CPU y la ruta de desenfoque en NPU está marcada como experimental.
- Módulo de embeddings por lotes para frases y RAG, con idea de descargar trabajo de CPU e iGPU; estado candidato, sin validación publicada.
- Módulo de audio para wake-word y denoising en tiempo real; estado candidato y sin probar según la model card.
- Backend XDNA para ggml/llama.cpp como habilitador de inferencia LLM sobre la NPU; estado planificado.
- Scripts de verificación de viabilidad, como `camera/npu_camera_fps.py`, para medir FPS antes de desplegar el daemon.
- No incluye tool calling, agentes, razonamiento multi-paso, visión de propósito general ni modo thinking: no es un modelo generativo.

## Casos de uso

- Videollamadas con efectos en tiempo real: el daemon `camera/npu_camera_daemon.py` escribe en `/dev/video10` mediante v4l2loopback y cualquier aplicación de videoconferencia selecciona `NPU Camera` como entrada, sin plugins por aplicación.
- Retransmisión y grabación con fondo desenfocado: la segmentación MODNet separa al sujeto del fondo y el desenfoque se aplica en CPU, lo que permite OBS o grabadores locales sin depender de la GPU dedicada.
- Descarga de la CPU en pipelines de visión por fotograma: al añadir unos 2 ms por fotograma en la NPU, la captura de cámara pasa a ser el cuello de botella y queda margen para efectos más pesados, como la segmentación.
- Procesado de embeddings por lotes para RAG: el módulo `embeddings/` plantea usar la NPU para matmul por lotes y liberar CPU e iGPU en indexación de documentos; es un caso candidato, pendiente de validación.
- Audio en el borde: wake-word y denoising en la NPU encajan con el perfil de bajo consumo del dispositivo, aunque el módulo está sin probar y no debería usarse como base de una decisión de producción.
- Evaluación de rendimiento y consumo de la NPU: el kit sirve como banco de pruebas reproducible para medir FPS, latencia y vatios en pipelines de convolución sobre XDNA1 frente a CPU o iGPU.
- Preparación de inferencia LLM en el borde: el futuro backend `ggml-backend/` permitiría ejecutar modelos GGUF sobre la NPU en equipos Phoenix; a día de hoy es una hoja de ruta, no una capacidad disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K) en la información disponible, porque el artefacto no es un modelo de lenguaje. Las únicas cifras publicadas son medidas de sistema del módulo de cámara, tomadas en un Ryzen 7 8845HS (XDNA1):

| Métrica | Valor medido | Condiciones |
|---|---|---|
| Throughput de pipeline de cámara | 220 FPS a 1080p | Pipeline completa por fotograma, incluido round-trip DMA al host |
| Throughput de pipeline de cámara | 451 FPS a 720p | Pipeline completa por fotograma, incluido round-trip DMA al host |
| Coste del efecto en la NPU | ~2 ms por fotograma | Daemon en vivo |
| Consumo durante el efecto | ~6,6 W | Daemon en vivo |
| Cuello de botella declarado | Captura de cámara | El pipeline nunca está limitado por la NPU |
| Precisión de segmentación / calidad de efecto | No disponible | No se publican métricas de calidad (IoU, PSNR, SSIM) |

## Requisitos de hardware

- VRAM: no disponible y no aplica en el sentido habitual; el kit se ejecuta sobre la NPU XDNA y la CPU del host, y la model card no especifica requisitos de memoria gráfica.
- NPU: AMD XDNA1 (Phoenix) con stack funcional; verificado en Ryzen 7 8845HS. El stack oficial de AMD para LLM se orienta a XDNA2, por lo que el soporte de esta generación depende del bring-up de `open-xdna`.
- Software de base imprescindible: XRT, `amd/xdna-driver`, IRON/mlir-aie y Peano, además de Ubuntu 25.10 con kernel 6.17 en la configuración validada.
- Cámara virtual: módulo `v4l2loopback` cargado con `video_nr=10 card_label="NPU Camera" exclusive_caps=1`.
- GPU dedicada: no se requiere ni se menciona; el caso de uso declarado es precisamente evitar depender de CPU o iGPU para el cómputo de efectos.
- Despliegue: scripts de Python (`camera/npu_camera_fps.py`, `camera/npu_camera_daemon.py`) más `pip install -r requirements.txt`. No aplican vLLM, TGI, Ollama ni llama.cpp en el estado actual; llama.cpp aparece solo como objetivo del módulo `ggml-backend/`.
- Latencia y throughput: ~2 ms por fotograma en la NPU y 220/451 FPS de pipeline a 1080p/720p respectivamente; el rendimiento end-to-end queda limitado por la captura de cámara.

## Comparativa con modelos similares

La comparación se establece con proyectos de la misma categoría funcional (habilitación de NPU en Linux y procesado de visión en el borde), no con modelos de lenguaje.

| Proyecto | Tipo | Hardware objetivo | Estado | Licencia |
|---|---|---|---|---|
| `elyanlabs/npu-linux-kit` | Kit de aplicaciones sobre NPU | AMD XDNA1 (Phoenix) | Cámara funcional y medida; resto candidato o planificado | AGPL-3.0 + comercial dual |
| `open-xdna` (Scottcjn) | Bring-up del stack NPU | AMD XDNA1 | Base sobre la que se apoya el kit | No disponible en la información proporcionada |
| Stack oficial de AMD para LLM | Inferencia LLM en NPU | AMD XDNA2 | Orientado a XDNA2, no cubre XDNA1 | No disponible en la información proporcionada |
| Backends ggml/llama.cpp existentes | Inferencia LLM | CPU, CUDA, Metal, Vulkan, etc. | Maduros; sin backend XDNA | Licencias permisivas (MIT) en el proyecto base |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, tokenizador, contexto ni cuantizaciones; no debe evaluarse como si fuera un LLM.
- Solo el módulo `camera/` está verificado y medido. `embeddings/` y `audio/` son candidatos (este último sin probar) y `ggml-backend/` está planificado; no hay afirmaciones de funcionamiento para ellos.
- Verificación limitada a una única configuración: XDNA1 (Phoenix), Ryzen 7 8845HS, Ubuntu 25.10 y kernel 6.17. Otros equipos Phoenix o versiones de kernel y driver pueden no reproducir los resultados.
- Dependencia de un stack frágil y fuera del árbol principal del kernel (XRT, `amd/xdna-driver`, IRON/mlir-aie, Peano), lo que complica la instalación y la actualización.
- No se publican métricas de calidad de los efectos (segmentación, desenfoque, fidelidad de color); las cifras disponibles son solo de throughput y consumo.
- Licencia AGPL-3.0: el uso en red de versiones modificadas obliga a liberar el código; para integración propietaria se necesita la licencia comercial descrita en `COMMERCIAL.md`. Conviene revisar ambas antes de llevarlo a producción.
- Proyecto de investigación y comunidad, declarado explícitamente como no apto para producción: no se documentan tests, CI ni garantías de soporte.
- Documentación y código únicamente en inglés; no se declara soporte multilingüe.
- El repositorio alojado en Hugging Face es un snapshot de código: nada se ejecuta en la infraestructura de Hugging Face y el historial completo está en GitLab.
- La búsqueda web realizada no devolvió resultados relevantes sobre el proyecto; los enlaces útiles son los declarados en la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/npu-linux-kit
- Repositorio en GitHub: https://github.com/Scottcjn/npu-linux-kit
- Repositorio en GitLab (historial completo): https://gitlab.com/elyan-labs/npu-linux-kit
- Bring-up del stack NPU (open-xdna): https://github.com/Scottcjn/open-xdna
- Licencia comercial: `COMMERCIAL.md` en el repositorio
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
