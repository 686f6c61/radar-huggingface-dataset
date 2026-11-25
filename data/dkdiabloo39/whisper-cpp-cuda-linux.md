# DKDiabloO39/whisper-cpp-cuda-linux

## Resumen

`DKDiabloO39/whisper-cpp-cuda-linux` no es un modelo de lenguaje en sentido estricto, sino una distribución binaria precompilada de [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (tag `b5454`) con soporte de NVIDIA CUDA 12.4 para Linux x64. El repositorio contiene `whisper-cli`, las bibliotecas compartidas de whisper.cpp y ggml (`libwhisper.so.1`, `libggml.so.0`, `libggml-base.so.0`, `libggml-cuda.so` y las variantes `libggml-cpu-*.so`), junto con la licencia MIT y un fichero `BUILD.txt` con la receta de compilación. El artefacto pesa 259.052.967 bytes (unos 0,3 GB) y se publica como `whisper-cuda12.4-b5454-linux-x64.tar.gz`.

El problema que resuelve es concreto: whisper.cpp publica builds CUDA oficiales solo para Windows, de modo que los usuarios de Linux que quieren aceleración GPU deben compilar desde fuente. Este paquete replica la receta del workflow oficial de release de Windows (`.github/workflows/release.yml` en el tag `b5454`) sobre Linux, usando la imagen `nvidia/cuda:12.4.1-devel-ubuntu22.04`, CMake 3.31.6 y los flags `GGML_CUDA=ON GGML_BACKEND_DL=ON GGML_NATIVE=OFF GGML_CPU_ALL_VARIANTS=ON GGML_CUDA_NCCL=OFF`. No incluye pesos de modelo: el usuario debe aportar sus ficheros GGML de Whisper (por ejemplo, Large v3 Turbo en cuantización `q5_0`).

La relevancia es práctica: elimina la fricción de compilación para equipos Linux con GPU NVIDIA y permite ejecutar inferencia de reconocimiento automático de habla (ASR) con Whisper sobre CUDA sin gestionar un toolchain de C++/CUDA. El autor verificó el binario en una RTX 3070 Ti Laptop (driver 615) contra el build CPU oficial de Ubuntu, obteniendo las mismas palabras en seis fragmentos de 22 segundos y una velocidad 22 veces superior (5,3 s frente a 115 s para 132 s de audio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Binario de inferencia para Whisper (transformer encoder-decoder) sobre whisper.cpp/ggml con backend CUDA |
| Parametros totales | no disponible (depende del modelo Whisper cargado; el paquete no incluye pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la ventana de 30 s de Whisper por segmento) |
| Tipos de cuantizacion | no disponible en el paquete; verificado con Large v3 Turbo `q5_0` (formatos GGML/GGUF de whisper.cpp) |
| Idiomas soportados | no disponible (heredado del modelo Whisper que se cargue) |
| Licencia | MIT |
| Formato de pesos | no incluidos; el binario consume ficheros GGML de whisper.cpp (p. ej. `ggml-large-v3-turbo-q5_0.bin`) |

## Arquitectura y entrenamiento

El paquete no entrena ni define un modelo: empaqueta el runtime de whisper.cpp, una implementación en C/C++ de la arquitectura Whisper (transformer encoder-decoder con atención, orientada a transcripción de audio) construida sobre la biblioteca tensorial ggml. La compilación habilita el backend CUDA (`GGML_CUDA=ON`) con carga dinámica de backends (`GGML_BACKEND_DL=ON`), desactiva optimizaciones nativas del host (`GGML_NATIVE=OFF`) para maximizar portabilidad y compila todas las variantes de CPU (`GGML_CPU_ALL_VARIANTS=ON`). NCCL queda desactivado (`GGML_CUDA_NCCL=OFF`), por lo que no hay soporte multi-GPU por colectivos.

Los kernels CUDA incluidos cubren las compute capabilities 5.0, 6.1, 7.0, 7.5, 8.0, 8.6, 8.9 y 9.0, lo que abarca desde Maxwell hasta Hopper. La receta de compilación está documentada en `apps/desktop/scripts/build-whisper-cuda-linux.sh` del repositorio de Clipper. Cada biblioteca resuelve sus dependencias con RUNPATH `$ORIGIN`, de modo que el árbol extraído funciona sin configurar `LD_LIBRARY_PATH`. No se incluyen el runtime de CUDA ni cuBLAS: hay que colocar `libcudart.so.12`, `libcublas.so.12` y `libcublasLt.so.12` (de `cuda_cudart` 12.4.127 y `libcublas` 12.4.5.8 de los archivos redistribuibles de NVIDIA) junto a `whisper-cli`.

## Capacidades

- Transcripción de voz a texto mediante Whisper, ejecutada en GPU NVIDIA a través del backend CUDA de ggml.
- Aceleración GPU verificada: 22 veces más rápida que el build CPU de Ubuntu en la prueba del autor (5,3 s frente a 115 s para 132 s de audio).
- Alineación temporal precisa: los inicios de palabra quedaron dentro de 20 ms respecto al build CPU en la comparación realizada.
- Ejecución de `whisper-cli` como herramienta de línea de comandos para procesar ficheros de audio.
- Compatibilidad con todas las variantes de CPU de ggml incluidas, permitiendo fallback a CPU si no hay GPU disponible.
- Soporte de las cuantizaciones GGML de whisper.cpp (verificado con `q5_0`), lo que permite ajustar el consumo de VRAM.
- Idiomas, traducción, detección de idioma y demás capacidades dependen exclusivamente del modelo Whisper cargado; no son una propiedad del binario.
- No incluye tool calling, function calling, agentes, visión ni audio nativo más allá del propio pipeline ASR de Whisper.

## Casos de uso

- Transcripción por lotes en servidores Linux con GPU: desplegar `whisper-cli` sobre un directorio de grabaciones y procesarlas con CUDA, evitando compilar whisper.cpp desde fuente en cada máquina.
- Subtitulado automático de vídeo: generar transcripciones con marcas temporales de inicio de palabra (precisión de 20 ms en la prueba del autor) para alimentar herramientas de subtitulado.
- Contenedores de producción: integrar el tarball en una imagen Docker basada en Ubuntu 22.04 o Debian 12 con driver NVIDIA y las bibliotecas CUDA redistribuibles, obteniendo un pipeline ASR reproducible.
- Estaciones de trabajo con GPU de consumo: usar el binario en equipos con RTX 3070 Ti u otras GPU Ampere/Ada, donde el build CUDA reduce el tiempo de transcripción de minutos a segundos.
- Prototipado e investigación en ASR: comparar cuantizaciones (`q5_0` y otras) del mismo modelo Whisper sobre GPU sin recompilar, midiendo impacto en calidad y latencia.
- Migración desde Windows: reutilizar la misma receta y versiones de CUDA que el release oficial de Windows en entornos Linux, manteniendo paridad de comportamiento.
- Procesamiento de audio en el borde con GPU: desplegar en servidores con GPU Hopper (compute capability 9.0) o Ampere para cargas de transcripción de baja latencia.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Comparación con build CPU de Ubuntu (Large v3 Turbo `q5_0`, RTX 3070 Ti Laptop, driver 615) | Mismas palabras en seis fragmentos de 22 s; inicios de palabra dentro de 20 ms |
| Velocidad relativa | 22x más rápido: 5,3 s (CUDA) frente a 115 s (CPU) para 132 s de audio |

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, GSM8K) en la información disponible; los datos anteriores son la única medición aportada por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende del modelo Whisper y su cuantización (el autor usó Large v3 Turbo `q5_0`, pero no reporta consumo de VRAM).
- GPU compatibles: cualquier GPU NVIDIA con compute capability 5.0, 6.1, 7.0, 7.5, 8.0, 8.6, 8.9 o 9.0 (Maxwell a Hopper), con driver 525 o superior para CUDA 12.
- Verificado en: RTX 3070 Ti Laptop GPU con driver 615.
- Cabe en GPU de consumo: sí, al menos en la RTX 3070 Ti Laptop empleada en la prueba; el resto de configuraciones no está documentado.
- Sistema operativo: Linux x64 con glibc 2.34 y libstdc++ de GCC 12 o superior (Ubuntu 22.04, Debian 12, Fedora 36 y posteriores).
- Dependencias externas: `libcudart.so.12`, `libcublas.so.12` y `libcublasLt.so.12` de los archivos redistribuibles de NVIDIA (CUDA 12.4), colocadas junto a `whisper-cli`.
- Opciones de despliegue: ejecución directa de `whisper-cli`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a whisper.cpp).
- Latencia y throughput: 5,3 s para 132 s de audio en la configuración de prueba (aproximadamente 25x tiempo real); no hay más cifras publicadas.

## Comparativa con modelos similares

| Alternativa | Tipo | Aceleración GPU en Linux | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este paquete (whisper.cpp b5454 CUDA 12.4) | Binario precompilado de whisper.cpp | Sí, CUDA 12.4 incluida en el build | MIT | Hugging Face, 0 descargas |
| whisper.cpp build CPU oficial | Binario precompilado de whisper.cpp | No | MIT | Repositorio oficial de whisper.cpp |
| whisper.cpp build CUDA oficial | Binario precompilado de whisper.cpp | Sí, pero solo Windows | MIT | Releases oficiales de whisper.cpp |
| Compilación desde fuente con `GGML_CUDA=ON` | Build local | Sí, a elegir por el usuario | MIT | Requiere toolchain C++/CUDA |

No se dispone de datos comparativos de rendimiento frente a otras distribuciones o frente a implementaciones alternativas de Whisper (faster-whisper, Whisper de OpenAI, etc.) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos de Whisper; sin un fichero GGML adicional el binario no puede transcribir nada.
- Solo Linux x64: no sirve para Windows, macOS ni arquitecturas ARM; requiere glibc 2.34 y libstdc++ de GCC 12 o superior.
- Solo NVIDIA: no hay soporte para GPU AMD, Intel ni Apple Silicon en este build.
- Dependencias externas obligatorias: sin `libcudart.so.12`, `libcublas.so.12` y `libcublasLt.so.12` de CUDA 12.4 el binario no arranca; no están incluidas por licencia.
- Sin NCCL: no hay soporte multi-GPU mediante colectivos en esta compilación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Verificación limitada: la única prueba documentada es la del autor en una RTX 3070 Ti Laptop con Large v3 Turbo `q5_0`; no hay datos de otras GPU, modelos ni cuantizaciones.
- Sesgos y alucinaciones: dependen del modelo Whisper cargado; Whisper es conocido por inventar texto en silencios o audio ruidoso, pero no hay evaluación específica en este paquete.
- Licencia MIT del binario: permite uso comercial, pero el usuario debe cumplir también las licencias de NVIDIA CUDA/cuBLAS y del modelo Whisper que utilice.
- Integridad: el autor publica el SHA-256 (`48e62554757f748c9b47dba0c0f0ff1aab373e3cbc228a382f6e3b7fd6f1c49c`); conviene verificarlo antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DKDiabloO39/whisper-cpp-cuda-linux
- whisper.cpp (proyecto original): https://github.com/ggml-org/whisper.cpp
- Workflow de release de whisper.cpp (receta de referencia): `.github/workflows/release.yml` en el tag `b5454`
- Archivos redistribuibles de CUDA 12.4: https://developer.download.nvidia.com/compute/cuda/redist
- Script de compilación citado (repositorio de Clipper): `apps/desktop/scripts/build-whisper-cuda-linux.sh`
