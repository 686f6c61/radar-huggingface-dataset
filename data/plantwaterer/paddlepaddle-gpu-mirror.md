# plantwaterer/paddlepaddle-gpu-mirror

## Resumen

Este repositorio no contiene un modelo de IA, sino un espejo (mirror) de un único artefacto de software: la rueda de instalación (wheel) `paddlepaddle_gpu-3.2.0-cp312-cp312-linux_x86_64.whl` de PaddlePaddle, compilada para CUDA 12.9, Python 3.12 y Linux x86_64. Lo publica el usuario `plantwaterer` como copia no modificada de un binario distribuido por los autores de PaddlePaddle, con un tamaño de 1.889.100.386 bytes y un hash SHA-256 documentado en la model card.

El propósito declarado es servir de respaldo para la instalación de otro proyecto del mismo autor, `plantwaterer/glires`, que depende de PaddleOCR. El script `install.sh` de ese proyecto descarga primero la rueda desde el almacenamiento oficial de PaddlePaddle y recurre a esta copia solo si esa descarga falla, verificando el SHA-256 en ambos casos. Esta build concreta no está publicada en PyPI.

Por tanto, no hay arquitectura de red neuronal, parámetros, contexto ni capacidades de inferencia que describir: es una dependencia binaria. Su relevancia es logística (disponibilidad de un wheel no publicado en PyPI), no funcional como modelo. Cualquier uso de PaddlePaddle para otros fines debería hacerse desde los canales oficiales del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una rueda de software) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con bibliotecas de terceros con licencias propias) |
| Formato de pesos | no disponible (artefacto: wheel `.whl`, 1.889.100.386 bytes) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Nombre de fichero | `paddlepaddle_gpu-3.2.0-cp312-cp312-linux_x86_64.whl` |
| SHA-256 | `127f7f1afbc7e268080f733718e3c667ebb06d1152dd32861a6201836c8ddba0` |
| Version de PaddlePaddle | 3.2.0 |
| Version de CUDA | 12.9 |
| Version de Python | 3.12 (cp312) |
| Plataforma | Linux x86_64 |
| Tamano del repositorio | 1.9 GB |
| Origen oficial | `https://paddle-whl.bj.bcebos.com/stable/cu129/paddlepaddle-gpu/paddlepaddle_gpu-3.2.0-cp312-cp312-linux_x86_64.whl` |
| Fecha de creacion del repo | 2026-11-12 |
| Ultima actualizacion | 2026-11-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No aplica. El contenido es un binario compilado de PaddlePaddle (framework de deep learning) y sus bibliotecas enlazadas, no un modelo entrenado. No hay datos de entrenamiento, tokens, dataset, RLHF ni DPO que reportar.

Las bibliotecas de terceros incluidas en `paddle/libs/` según la model card son: Intel MKL-ML 2019.0.5 y el runtime Intel OpenMP (`libmklml_intel.so`, `libiomp5.so`, bajo Intel Simplified Software License de abril de 2018); NVIDIA NVSHMEM 3.2.5 (`nvshmem_bootstrap_*.so.3`, `nvshmem_transport_*.so.3`, licencia NVIDIA con porciones BSD); oneDNN (`libdnnl.so.3`, Apache-2.0); Reference LAPACK 3.10.0 y BLAS (`liblapack.so.3`, `libblas.so.3`, BSD modificada); runtime de GCC (`libgfortran.so.3`, `libquadmath.so.0`, GPL-3.0 con GCC Runtime Library Exception y LGPL-2.1-or-later respectivamente); warp-ctc (`libwarpctc.so`, Apache-2.0); warp-transducer (`libwarprnnt.so`, Apache-2.0); y las bibliotecas de flash-attention de PaddlePaddle (`libflashattn.so`, `libflashattnv3.so`, `libflashmaskv2.so`, BSD-3-Clause, con posible código de las bibliotecas CUDA de NVIDIA enlazado). Las bibliotecas propias de PaddlePaddle son `libpaddle.so`, `libphi*.so`, `libcinnapi.so` y `libcommon.so`. Las restantes bibliotecas CUDA de NVIDIA no van en el wheel y se instalan como paquetes separados vía pip o uv.

## Capacidades

- No es un modelo: no genera texto, no razona, no ejecuta tool calling ni soporta agentes.
- Proporciona el runtime de PaddlePaddle 3.2.0 con soporte GPU sobre CUDA 12.9 para Python 3.12 en Linux x86_64.
- Habilita la ejecución de PaddleOCR y otros modelos implementados sobre PaddlePaddle, siempre que se instale junto con las dependencias CUDA correspondientes.
- Sirve como fuente de respaldo (fallback) para la instalación de `plantwaterer/glires` cuando el origen oficial de PaddlePaddle no está accesible.
- No incluye capacidades multilingües, de visión, audio ni modo de razonamiento propias.

## Casos de uso

- Instalación de respaldo de PaddlePaddle GPU: usar este wheel cuando el CDN oficial `paddle-whl.bj.bcebos.com` no esté disponible, verificando el SHA-256 documentado antes de instalar.
- Reproducibilidad de entornos: fijar el binario exacto (versión 3.2.0, cp312, CUDA 12.9) para reconstruir un entorno Python 3.12 en Linux x86_64 con resultados idénticos.
- Despliegue de PaddleOCR: instalar este wheel como dependencia del pipeline de OCR de `plantwaterer/glires` en máquinas con GPU NVIDIA y CUDA 12.9.
- Auditoría de licencias: consultar la tabla de bibliotecas de terceros de la model card para revisar las licencias (Intel, NVIDIA, GPL con excepción, BSD, Apache-2.0) antes de distribuir el binario en un producto.
- Espejo interno corporativo: alojar el wheel en un registro privado para instalaciones sin salida a internet, manteniendo la verificación de integridad por hash.
- Entrenamiento e inferencia con PaddlePaddle: servir como base para ejecutar modelos del ecosistema Paddle (por ejemplo, modelos de PaddleNLP o PaddleDetection) en entornos con CUDA 12.9.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica al artefacto en sí; depende del modelo de PaddlePaddle que se ejecute sobre él. El wheel requiere una GPU NVIDIA compatible con CUDA 12.9 y los controladores correspondientes.
- GPU recomendadas: no disponible en la información proporcionada; cualquier GPU NVIDIA soportada por CUDA 12.9.
- GPU de consumo: no disponible; la viabilidad depende del modelo ejecutado, no del wheel.
- Almacenamiento: 1,9 GB para el wheel; las bibliotecas CUDA adicionales se instalan como paquetes pip/uv separados y añaden espacio.
- Despliegue: instalación vía `pip` o `uv` del fichero `.whl`; no aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. Como artefactos comparables de software:

| Artefacto | Version | CUDA | Python | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este mirror (`plantwaterer/paddlepaddle-gpu-mirror`) | 3.2.0 | 12.9 | 3.12 | Linux x86_64 | Apache-2.0 | Hugging Face (espejo) |
| Wheel oficial de PaddlePaddle | 3.2.0 | 12.9 | 3.12 | Linux x86_64 | Apache-2.0 | `paddle-whl.bj.bcebos.com` |
| PaddlePaddle en PyPI | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | PyPI (esta build concreta no está publicada) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; la ficha existe solo para documentar el artefacto.
- El autor declara no haber construido ni modificado el fichero y no estar afiliado a PaddlePaddle; la garantía de integridad depende de la verificación del SHA-256 `127f7f1afbc7e268080f733718e3c667ebb06d1152dd32861a6201836c8ddba0`.
- El wheel contiene bibliotecas con licencias distintas de Apache-2.0, incluidas GPL-3.0 con excepción de runtime (libgfortran) y LGPL-2.1-or-later (libquadmath); conviene revisarlas antes de redistribuir.
- La model card advierte de que el wheel no incluye avisos de licencia de terceros y que estos se listan de forma reconstructiva a partir del contenido del wheel y de los ficheros de build de PaddlePaddle v3.2.0.
- Las bibliotecas CUDA de NVIDIA no están incluidas y deben instalarse por separado; un entorno sin ellas fallará en tiempo de ejecución.
- Solo cubre Linux x86_64, Python 3.12 y CUDA 12.9; no hay builds para otras combinaciones en este repositorio.
- Para cualquier uso ajeno a `glires`, la model card recomienda obtener PaddlePaddle desde los canales oficiales.
- Sin descargas ni likes registrados; sin mantenimiento garantizado más allá de la fecha de actualización (2026-11-12).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/plantwaterer/paddlepaddle-gpu-mirror
- Proyecto que lo consume: https://huggingface.co/plantwaterer/glires
- Origen oficial del wheel: https://paddle-whl.bj.bcebos.com/stable/cu129/paddlepaddle-gpu/paddlepaddle_gpu-3.2.0-cp312-cp312-linux_x86_64.whl
- Repositorio de PaddlePaddle: https://github.com/PaddlePaddle/Paddle
- Sitio oficial de PaddlePaddle: https://www.paddlepaddle.org.cn/
- Licencia oneDNN: https://github.com/uxlfoundation/oneDNN/blob/main/LICENSE
- Licencia Reference LAPACK: https://github.com/Reference-LAPACK/lapack/blob/master/LICENSE
- GCC Runtime Library Exception: https://www.gnu.org/licenses/gcc-exception-3.1.html
- Licencia warp-ctc: https://github.com/baidu-research/warp-ctc/blob/master/LICENSE
- Licencia warp-transducer: https://github.com/PaddlePaddle/warp-transducer/blob/master/LICENSE
- Licencia flash-attention de PaddlePaddle: https://github.com/PaddlePaddle/flash-attention/blob/main/LICENSE
- Licencia de NVSHMEM (versiones recientes): https://github.com/NVIDIA/nvshmem/blob/devel/License.txt
- EULA de CUDA Toolkit: https://docs.nvidia.com/cuda/eula/index.html
