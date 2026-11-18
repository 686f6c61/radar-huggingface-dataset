# aaatmy/cuda-pack-win-x64

## Resumen

`aaatmy/cuda-pack-win-x64` no es un modelo de IA, sino un repositorio de distribucion de binarios que empaqueta las bibliotecas de runtime necesarias para habilitar la aceleracion por GPU CUDA en la aplicacion Karaoke Battle (Windows x64). Concretamente, contiene los archivos ZIP con las DLL de ONNX Runtime 1.31.1 (build CUDA 13), el runtime de CUDA 13.5.37, cuBLAS 13.10.0.20, cuFFT 12.5.0.14 y cuDNN 9.28.1.4, todos ellos para Windows de 64 bits. El autor (aaatmy) lo publica como espejo de respaldo ("fallback") para cuando las descargas desde NuGet y PyPI fallan, escenario que segun la model card ocurrio cuando `microsoft/onnxruntime` desaparecio de GitHub en noviembre de 2026.

El repositorio no contiene pesos de ningun modelo, ni tokenizador, ni configuracion de inferencia. Su funcion es puramente de infraestructura: suministrar las DLL que la aplicacion instala en tiempo de ejecucion para poder ejecutar modelos ONNX con backend CUDA. Por tanto, no procede evaluar arquitectura, parametros, contexto ni capacidades cognitivas; la ficha se centra en describir el contenido real del paquete, sus caracteristicas tecnicas y sus implicaciones de uso.

La relevancia de este repositorio es operativa: permite a los usuarios de Karaoke Battle obtener las dependencias CUDA sin depender de la disponibilidad de los canales oficiales. El tamano del repo (1,2 GB) corresponde a la suma de los ZIP con las DLL y sus textos de licencia, no a pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de bibliotecas de runtime) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | mixta: MIT (ONNX Runtime), NVIDIA propietaria redistribuible (CUDA runtime, cuBLAS, cuFFT, cuDNN); ver README |
| Formato de pesos | no disponible; el repo contiene archivos ZIP con DLL de Windows x64 y textos de licencia |
| Tamano del repositorio | 1,2 GB |
| Plataforma | Windows x64 |
| Contenido | `ort-1.31.1-gpu-win-x64.zip`, `cuda-runtime-13.5.37-win-x64.zip`, `cublas-13.10.0.20-win-x64.zip`, `cufft-12.5.0.14-win-x64.zip`, `cudnn-9.28.1.4-cuda13-win-x64.zip` |
| Integridad | `manifest.json` y `cuda_pack.json` fijan el sha256 de cada ZIP y de cada DLL |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni datos de entrenamiento. Su contenido son binarios de runtime extraidos de paquetes oficiales (NuGet y PyPI) y redistribuidos sin modificacion ni recompilacion, segun declara el autor. Cada ZIP incluye unicamente las DLL que la aplicacion instala, byte a byte identicas a las del archivo oficial correspondiente, mas los textos de licencia de dicho archivo.

El paquete cubre el stack de aceleracion GPU para inferencia ONNX en Windows: ONNX Runtime 1.31.1 con proveedor CUDA, runtime de CUDA 13.5.37, cuBLAS 13.10.0.20, cuFFT 12.5.0.14 y cuDNN 9.28.1.4 (build CUDA 13). La verificacion de integridad se realiza mediante hashes sha256 fijados en `manifest.json` y en el `cuda_pack.json` de la aplicacion, lo que permite detectar manipulaciones o corrupciones en la descarga.

## Capacidades

- Distribucion de las DLL de ONNX Runtime 1.31.1 con backend CUDA para Windows x64 (`onnxruntime.dll`, `onnxruntime_providers_shared.dll`, `onnxruntime_providers_cuda.dll`).
- Suministro del runtime de CUDA 13.5.37 (`cudart64_13.dll`).
- Suministro de cuBLAS 13.10.0.20 (`cublas64_13.dll`, `cublasLt64_13.dll`).
- Suministro de cuFFT 12.5.0.14 (`cufft64_12.dll`).
- Suministro de cuDNN 9.28.1.4 para CUDA 13 (diez DLL, incluidas las de motores precompilados y de compilacion en tiempo de ejecucion).
- Verificacion de integridad mediante sha256 por ZIP y por DLL.
- Incluye los textos de licencia de cada paquete de origen (MIT para ONNX Runtime; licencias NVIDIA para el resto).
- No incluye pesos de modelo, tokenizador, configuracion de inferencia ni codigo de aplicacion.

## Casos de uso

- Instalacion del pack CUDA de Karaoke Battle en Windows x64: cuando la descarga desde NuGet o PyPI falla, la aplicacion usa estos ZIP como respaldo para instalar las DLL de aceleracion GPU.
- Despliegue de inferencia ONNX con backend CUDA en Windows: util para aplicaciones que necesiten ONNX Runtime 1.31.1 con proveedor CUDA 13 sin depender de la disponibilidad del paquete NuGet oficial.
- Entornos sin acceso a GitHub o a los canales oficiales de Microsoft y NVIDIA: el repositorio actua como espejo alternativo con hashes verificables.
- Verificacion de integridad en pipelines de distribucion: los sha256 de `manifest.json` permiten validar que las DLL descargadas coinciden con las oficiales.
- Reproducibilidad de entornos: al fijar versiones exactas (ONNX Runtime 1.31.1, CUDA 13.5.37, cuBLAS 13.10.0.20, cuFFT 12.5.0.14, cuDNN 9.28.1.4) se facilita reconstruir un entorno identico.
- Auditoria de licencias: los textos de licencia incluidos en cada ZIP permiten revisar las condiciones de redistribucion de ONNX Runtime y de las bibliotecas NVIDIA antes de su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un paquete de bibliotecas de runtime y no de un modelo, no procede comparar metricas de calidad de modelo (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- GPU NVIDIA compatible con CUDA 13 (el paquete incluye `cudart64_13.dll`, `cublas64_13.dll`, `cufft64_12.dll` y `cudnn64_9.dll`); las bibliotecas NVIDIA solo pueden usarse con una GPU NVIDIA, segun la model card.
- Sistema operativo: Windows x64.
- VRAM estimada: no disponible (depende del modelo ONNX que se ejecute, no del pack).
- GPU recomendadas: no disponible en la informacion proporcionada; se requiere una GPU NVIDIA con soporte para CUDA 13.
- Despliegue: el pack esta pensado para la aplicacion Karaoke Battle; tambien puede usarse con cualquier aplicacion que consuma ONNX Runtime 1.31.1 con proveedor CUDA en Windows x64.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no existe una categoria de modelos comparables. Como referencia de infraestructura, los paquetes oficiales de origen (`microsoft.ml.onnxruntime.gpu.windows` en NuGet y los wheels `nvidia_cuda_runtime`, `nvidia_cublas`, `nvidia_cufft` y `nvidia_cudnn_cu13` en PyPI) cumplen la misma funcion, pero este repositorio actua como espejo de respaldo con hashes fijados.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluacion como modelo carece de sentido.
- Licencia mixta: ONNX Runtime es MIT, pero el runtime de CUDA, cuBLAS, cuFFT y cuDNN son propietarios de NVIDIA y solo se redistribuyen bajo los terminos incluidos en cada ZIP; su uso esta restringido a GPU NVIDIA.
- Dependencia de versiones concretas: las DLL estan fijadas a ONNX Runtime 1.31.1, CUDA 13.5.37, cuBLAS 13.10.0.20, cuFFT 12.5.0.14 y cuDNN 9.28.1.4; no sirven para otras versiones sin ajustes.
- Solo Windows x64: no hay builds para Linux, macOS ni ARM.
- El autor declara que los binarios son byte a byte identicos a los oficiales, pero la verificacion depende de comparar los sha256 con las fuentes originales; conviene validarlos antes de su uso en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-18) es posterior a la fecha actual en muchos contextos; conviene verificar la coherencia temporal de los metadatos antes de confiar en ellos.
- No se especifican requisitos minimos de driver NVIDIA ni de version de Windows; deben consultarse en la documentacion oficial de CUDA 13 y cuDNN 9.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aaatmy/cuda-pack-win-x64
- Aplicacion Karaoke Battle: https://github.com/Hikari-Tsai/karaoke-battle
- Paquete NuGet de ONNX Runtime GPU Windows 1.31.1: https://api.nuget.org/v3-flatcontainer/microsoft.ml.onnxruntime.gpu.windows/1.31.1/microsoft.ml.onnxruntime.gpu.windows.1.31.1.nupkg
- Wheel de NVIDIA CUDA Runtime 13.5.37: https://files.pythonhosted.org/packages/35/99/e07dd9565d2e0317c1a62ff39ae9fc0542c048f74bcfc777c8be97710347/nvidia_cuda_runtime-13.5.37-py3-none-win_amd64.whl
- Wheel de NVIDIA cuBLAS 13.10.0.20: https://files.pythonhosted.org/packages/12/39/e1b1b4adb8b171894d9a89035df0596d448cf73dc403802d24dbe30cc0be/nvidia_cublas-13.10.0.20-py3-none-win_amd64.whl
- Wheel de NVIDIA cuFFT 12.5.0.14: https://files.pythonhosted.org/packages/94/79/8f2a7125f560b86571c0be3dbf10e33041187bc4a8cf66107541fe8e5cce/nvidia_cufft-12.5.0.14-py3-none-win_amd64.whl
- Wheel de NVIDIA cuDNN CUDA 13 9.28.1.4: https://files.pythonhosted.org/packages/48/9c/26e6bdd31c97c389aa565b49c916be0dec17dd61dad6cd33fee286d1b946/nvidia_cudnn_cu13-9.28.1.4-py3-none-win_amd64.whl
