# cdismus4/NVIDIA-NemotronLabs-RE-USE-WebGPU

## Resumen

NVIDIA NemotronLabs RE-USE WebGPU es un port del modelo de mejora de voz `nvidia/NVIDIA-NemotronLabs-RE-USE` a un motor de inferencia WebGPU escrito en TypeScript y WGSL, desarrollado por el autor independiente cdismus4 (proyecto Voivent). El modelo base es una red SEMamba de 30 bloques bidireccionales tiempo-frecuencia, con 9.607.747 parametros, orientada a mejora universal de voz: eliminacion de ruido, desreverberacion, eliminacion de clipping y restauracion de ancho de banda. La relevancia de este port reside en que ejecuta el modelo integramente en el navegador, sin dependencias de ONNX Runtime ni PyTorch, sobre GPU del dispositivo (incluidos moviles Android e iOS).

El modelo base es una arquitectura de espacio de estados selectivo (Mamba) aplicada en el dominio tiempo-frecuencia, lo que la aleja del transformer convencional. El autor del port documenta que los runtimes habituales de IA en navegador (onnxruntime-web, transformers.js) no manejan bien los SSM selectivos, porque los kernels CUDA de `mamba-ssm` no se exportan a un grafo ONNX estatico sin generar miles de nodos secuenciales lentos, y porque los limites de WebGPU en GPU moviles (`maxComputeWorkgroupsPerDimension = 65.535`) rompen los despachos 1D sobre espectrogramas densos.

La solucion adoptada es convertir el checkpoint original en un binario hibrido FP16/FP32 de 20,1 MiB (21,1 MB) y ejecutar los 30 bloques Mamba con shaders WGSL escritos a mano, con cero dependencias en tiempo de ejecucion. El modelo esta pensado para procesamiento de audio a audio en ingles y japones, y su licencia es OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEMamba: 30 bloques Mamba bidireccionales tiempo-frecuencia (SSM selectivo) |
| Parametros totales | 9.607.747 (1.416 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; procesa espectrogramas) |
| Tipos de cuantizacion | Binario hibrido FP16/FP32 propietario; checkpoint original en FP32 |
| Idiomas soportados | en, ja |
| Licencia | OpenMDW-1.1 (Open Model License Agreement) |
| Formato de pesos | Binario `.bin` propietario (`nvidia-reuse-fp16.bin`); checkpoint original PyTorch FP32 |
| Hiperparametros del modelo | `hid_feature=64`, `d_state=16`, `d_conv=4`, `expand=4`, `d_inner=256` |
| Tamano del binario WebGPU | 20,1 MiB (21,1 MB): 437 tensores en FP16 + 979 tensores en FP32 |
| Dependencias en runtime | Ninguna (TypeScript/JavaScript + WGSL inline) |
| Pipeline | audio-to-audio |
| Libreria | webgpu |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura SEMamba: una pila de 30 bloques Mamba bidireccionales que operan conjuntamente sobre las dimensiones temporal y frecuencial de un espectrograma. Cada bloque usa un SSM selectivo con `d_state=16`, `d_conv=4`, `expand=4` y `d_inner=256`, lo que da un total de 9,6 millones de parametros. El modelo realiza cuatro tareas de mejora de voz de forma universal: denoising, dereverberacion, declipping y restauracion de ancho de banda. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original de NVIDIA y no aparecen en la informacion proporcionada.

La innovacion tecnica principal de este port es el motor de inferencia. El autor sustituye ONNX por un binario propio con cabecera magica de 16 bytes (`"REUS"`), version de formato, longitud del JSON de directorio (173.752 bytes) y numero de tensores (1.416), seguido de un directorio JSON con `{name, dtype, shape, offset, byteLength}` y el payload contiguo. Los 437 tensores grandes de proyeccion y convolucion 2D (`in_proj`, `out_proj`, `x_proj`, `output_proj`, pesos de `DenseBlock`) se almacenan en FP16, mientras que 979 tensores criticos para la precision (`A_log`, `D`, `dt_proj`, `conv1d` depthwise, biases, `InstanceNorm2d`, `LayerNorm`, `PReLU`) se guardan en FP32 para preservar la estabilidad numerica de la recurrencia del estado SSM. En la inicializacion, `A_log` se pre-exponencia a `A = -exp(A_log)` y los 60 bloques Mamba (120 pasadas direccionales) se empaquetan en un unico `GPUBuffer` contiguo con limites alineados a 256 bytes (555.776 bytes por bloque), lo que permite reutilizar 4 pipelines WGSL fusionados sin recompilacion. El despacho se hace en 2D, `(ceil(spatial/64), out_channels, 1)`, para respetar el limite de 65.535 workgroups por dimension de las GPU moviles.

## Capacidades

- Mejora de voz universal en cuatro tareas: eliminacion de ruido (denoising), desreverberacion, eliminacion de clipping y restauracion de ancho de banda.
- Procesamiento audio-to-audio sobre espectrogramas, con inferencia integra en GPU del dispositivo.
- Ejecucion 100% en navegador mediante WebGPU, sin servidor ni subida de audio a la nube.
- Soporte de escritorio y movil: Chrome/Edge en Android (Pixel 8-10+, Galaxy S23-S26+, Snapdragon 8 Elite, Adreno, Google Tensor G3-G5), Safari 26+ en iOS/iPadOS 26+, y Chrome, Edge, Safari 26+ y Firefox en macOS, Windows y Linux (Apple Silicon M1-M5, NVIDIA RTX, AMD Radeon, Intel Arc).
- Fallback automatico a CPU mediante Web Worker cuando WebGPU no esta disponible.
- Idiomas declarados: ingles y japones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada general ni modo thinking; es un modelo especializado de mejora de audio.

## Casos de uso

- Limpieza de voz en produccion musical movil: el modelo se integra en el flujo de trabajo del DAW Voivent Satellite como limpieza vocal en un toque, ejecutandose en la GPU del telefono sin enviar el audio a un servidor. Es adecuado por su tamano reducido (21,1 MB) y su latencia de dispositivo.
- Edicion de podcasts y entrevistas en el navegador: eliminacion de ruido de fondo y reverberacion de grabaciones hechas en salas no tratadas, directamente en una web app, sin instalar software ni exponer el material a terceros.
- Restauracion de archivos de audio historicos o degradados: la capacidad de declipping y restauracion de ancho de banda permite recuperar grabaciones saturadas o con espectro recortado por codecs de baja calidad.
- Herramientas de accesibilidad y transcripcion: preprocesar audio ruidoso antes de pasarlo a un motor de reconocimiento de voz local, mejorando la calidad de la senal sin salir del dispositivo.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el navegador con cero dependencias de red, encaja en escenarios donde el audio no puede salir del cliente (sanidad, legal, periodismo).
- Prototipado e investigacion en WebGPU: el motor WGSL y el formato binario documentado sirven como referencia para portar otros modelos SSM o Mamba a WebGPU, evitando las limitaciones de ONNX Runtime y de los limites de workgroups moviles.
- Integracion en pipelines de captura en vivo: procesamiento de audio de microfono en tiempo real dentro de una pagina web, con fallback a CPU en equipos sin WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el binario de pesos ocupa 20,1 MiB (21,1 MB); el consumo total de memoria GPU depende de los buffers intermedios de los 60 bloques Mamba y del tamano del espectrograma de entrada, y no se especifica en la informacion disponible.
- GPU compatibles documentadas: Apple Silicon M1-M5, NVIDIA RTX, AMD Radeon e Intel Arc en escritorio; Adreno, Mali y Google Tensor G3-G5 en Android; GPU de Apple en iOS/iPadOS 26+.
- Cabe en GPU de consumo: si, el modelo esta disenado explicitamente para GPU integradas y moviles, no requiere GPU de centro de datos.
- Opciones de despliegue: motor WebGPU propio en TypeScript/WGSL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato). Incluye fallback a CPU via Web Worker.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs RE-USE WebGPU (este) | 9,6 M | Mejora de voz (denoising, dereverberacion, declipping, bandwidth) | Espectrogramas de audio; en, ja | OpenMDW-1.1 | HuggingFace, demo web |
| nvidia/NVIDIA-NemotronLabs-RE-USE (base) | 9,6 M | Mejora de voz | Espectrogramas de audio | OpenMDW-1.1 | HuggingFace |
| Runtimes genericos de navegador (onnxruntime-web, transformers.js) | no aplica | Ejecucion de modelos en navegador | no aplica | segun runtime | npm / CDN |

La comparacion con alternativas de la misma categoria (otros modelos de mejora de voz como Demucs, FRCRN o DeepFilterNet) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento ni de parametros de esos modelos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en mejora de voz; no genera texto, codigo ni realiza razonamiento. No debe evaluarse como LLM.
- Idiomas declarados limitados a ingles y japones; el comportamiento en otras lenguas no esta documentado.
- El formato de pesos es propietario (`.bin` con cabecera `"REUS"`), no estandar (safetensors, GGUF u ONNX); la portabilidad a otros runtimes requiere implementar el parser.
- Dependencia de WebGPU: en navegadores o dispositivos sin soporte, solo queda el fallback a CPU, cuyo rendimiento no se documenta.
- El autor del port es un desarrollador independiente (cdismus4 / Voivent), no NVIDIA; el mantenimiento y la validacion corren por su cuenta.
- Licencia OpenMDW-1.1: es una licencia de modelo abierto con condiciones propias; debe revisarse el texto completo antes de uso comercial. Los pesos y la arquitectura son Copyright © 2026 NVIDIA Corporation & Affiliates.
- Riesgo de artefactos o distorsion en la senal de audio procesada (propio de modelos de mejora de voz); no se aportan metricas objetivas (PESQ, STOI, SI-SDR) en la informacion disponible.
- No se documentan sesgos demograficos ni de acento; al ser un modelo de audio, el sesgo se manifestaria en el rendimiento diferencial por tipo de voz o idioma.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cdismus4/NVIDIA-NemotronLabs-RE-USE-WebGPU
- Modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Demo interactiva (PC y movil WebGPU): https://daw.voivent.com/lab/reuse
- Integracion en produccion (Voivent DAW Satellite): https://daw.voivent.com/satellite
- Licencia OpenMDW-1.1 (SPDX): https://spdx.org/licenses/OpenMDW-1.1.html
