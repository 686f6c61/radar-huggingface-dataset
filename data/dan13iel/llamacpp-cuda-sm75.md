# Dan13iel/llamacpp-cuda-sm75

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una compilación binaria preconstruida de `llama.cpp` (`llama-server` y `llama-cli`) orientada exclusivamente a arquitecturas NVIDIA con capacidad de cómputo 7.5 (SM75), es decir, Tesla T4, RTX 20xx y GTX 16xx. El autor, Dan13iel, la publica para evitar los aproximadamente 40 minutos de compilación desde código fuente que requiere un entorno de 2 vCPUs, como los de Google Colab o Kaggle, donde no existen binarios oficiales de Linux para CUDA en los releases de llama.cpp.

La compilación se basa en el commit `0b5be7e` (build b10690) del repositorio oficial `ggml-org/llama.cpp` y no incluye modificaciones sobre el código original. El paquete ocupa 50 MB y enlaza dinámicamente contra las librerías CUDA y de drivers del sistema anfitrión, que ya están presentes en las imágenes de Colab y Kaggle. Su utilidad principal es permitir la ejecución de inferencia de modelos GGUF en GPUs Turing sin necesidad de compilar nada, reduciendo el tiempo de puesta en marcha de un servidor de inferencia local a unos segundos.

Dado que se trata de una herramienta de inferencia y no de un modelo de IA, los apartados relacionados con parámetros, entrenamiento, capacidades lingüísticas o benchmarks de modelo no son aplicables y se indicarán como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (binario de llama.cpp, framework de inferencia en C/C++ con kernels CUDA custom) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo GGUF cargado) |
| Tipos de cuantizacion | No aplica (soporta las cuantizaciones de llama.cpp: GGUF Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No aplica (depende del modelo cargado) |
| Licencia | MIT (llama.cpp es MIT; el autor declara builds sin modificar) |
| Formato de pesos | No aplica (ejecutable binario; carga modelos en formato GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento asociado a este repositorio. Se trata de una compilación de `llama.cpp`, una biblioteca de inferencia de LLMs escrita en C/C++ que implementa el backend `ggml`. Esta biblioteca incluye kernels CUDA personalizados para acelerar la ejecución en GPUs NVIDIA, así como soporte para HIP (AMD), Vulkan, SYCL (Intel) y ejecución híbrida CPU+GPU para modelos que exceden la VRAM disponible.

La compilación se realizó con las opciones `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=75`, lo que genera código de máquina específico para la microarquitectura Turing. No se han aplicado parches ni optimizaciones adicionales sobre el código fuente original; el autor confirma que son builds sin modificar del repositorio `ggml-org/llama.cpp`.

## Capacidades

- Ejecución de inferencia de modelos de lenguaje en formato GGUF mediante `llama-server` (servidor HTTP con API compatible con OpenAI) o `llama-cli` (interfaz de línea de comandos).
- Aceleración por GPU mediante kernels CUDA customizados, con soporte para GPU+CPU híbrido para modelos que no caben completamente en VRAM.
- Soporte de múltiples backends de ejecución: CUDA, Vulkan, SYCL, HIP y CPU pura (aunque esta compilación está limitada a CUDA SM75).
- Capacidad de servir peticiones HTTP concurrentes a través de `llama-server`, incluyendo generación de texto, embeddings y endpoints de completado.
- Compatible con cualquier modelo GGUF disponible en Hugging Face, independientemente del tamaño o la familia (Llama, Mistral, Qwen, etc.).
- No incluye capacidades de visión, audio ni tool calling por sí mismo; dichas funcionalidades dependen exclusivamente del modelo cargado.

## Casos de uso

- Inferencia rápida en Google Colab o Kaggle con GPU Tesla T4: al extraer el tarball y configurar `LD_LIBRARY_PATH`, se puede arrancar `llama-server` en segundos, evitando la compilación manual que puede tardar 40 minutos en entornos de 2 vCPUs.
- Prototipado y pruebas de modelos GGUF en hardware Turing: desarrolladores que posean GPUs RTX 20xx o GTX 16xx pueden evaluar diferentes modelos cuantizados sin necesidad de instalar toolchains de compilación CUDA completas.
- Despliegue de un endpoint de inferencia ligero en máquinas virtuales con GPU T4: `llama-server` expone una API REST compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes con cambios mínimos.
- Automatización de pruebas de rendimiento y calidad de modelos: al ser un binario precompilado, se puede incorporar en pipelines de CI/CD que ejecuten benchmarks de perplejidad o latencia sobre distintos GGUF.
- Entornos educativos y talleres: facilita que estudiantes ejecuten LLMs localmente en hardware modesto sin lidiar con la compilación de dependencias CUDA.
- Migración de entornos de inferencia entre máquinas Turing: al ser un único tarball, se puede copiar a múltiples instancias con la misma arquitectura y replicar el mismo binario sin variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio contiene binarios de `llama.cpp` y no un modelo; el rendimiento dependerá del modelo GGUF cargado, del hardware concreto y de la configuración de inferencia. No se dispone de datos de latencia o throughput medidos por el autor.

## Requisitos de hardware

- GPU obligatoria con arquitectura Turing (SM75): Tesla T4, RTX 2060/2070/2080, GTX 1650/1660, Quadro RTX 4000/5000/6000, entre otras.
- No es compatible con arquitecturas más antiguas (Pascal, Volta) ni más nuevas (Ampere, Ada Lovelace) porque la compilación fija `CMAKE_CUDA_ARCHITECTURES=75`.
- Requiere que el sistema anfitrión tenga instaladas las librerías CUDA runtime y los drivers NVIDIA en las rutas estándar (`/usr/local/cuda` y `/usr/lib64-nvidia`), como ocurre en las imágenes de Colab y Kaggle.
- No se incluyen las librerías CUDA dentro del paquete; se enlazan dinámicamente en tiempo de ejecución.
- La VRAM necesaria depende del modelo GGUF que se quiera ejecutar; no hay un requisito mínimo fijo para el binario en sí.
- Opciones de despliegue: ejecución directa de `llama-server` como proceso, integración en contenedores Docker que incluyan CUDA runtime, o uso en notebooks de Colab/Kaggle mediante comandos shell.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino una herramienta de inferencia. Existen otras distribuciones precompiladas de `llama.cpp` para diferentes arquitecturas (por ejemplo, builds oficiales para Windows con CUDA 12/13, o builds para Vulkan/SYCL), pero no se dispone de información suficiente para establecer una comparativa cuantitativa entre ellas en cuanto a rendimiento o características. La principal alternativa sería compilar `llama.cpp` desde el código fuente, lo que requiere más tiempo y configuración.

## Limitaciones y advertencias

- El binario está limitado a GPU con SM75; no funcionará en GPUs de otras generaciones, lo que puede causar errores de "no kernel image available" si se intenta ejecutar en hardware no soportado.
- No incluye las librerías CUDA ni los drivers; si el sistema anfitrión no los tiene en las rutas esperadas, el programa fallará al cargar.
- La versión del binario (b10690) queda fijada en el tiempo; no recibirá actualizaciones automáticas del repositorio upstream de `llama.cpp`.
- Al ser un build sin modificar, hereda todas las limitaciones y posibles bugs de la versión concreta de `llama.cpp` (por ejemplo, problemas de compatibilidad con ciertos modelos GGUF o backends).
- No hay garantías de soporte ni mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un uso muy reducido.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los modelos que cargue tengan licencias compatibles con su caso de uso.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Dan13iel/llamacpp-cuda-sm75
- Repositorio oficial de llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Blog de llama.cpp sobre gestión de modelos: https://huggingface.co/blog/ggml-org/model-management-in-llamacpp
- Guía de configuración de llama.cpp con CUDA en Windows (referencia general): https://www.lautenbacher.io/en/general/setting-up-llama-cpp-on-windows-with-cuda-13/
- Artículo de Intel sobre ejecución de LLMs con llama.cpp en GPUs Intel: https://www.intel.com/content/www/us/en/developer/articles/technical/run-llms-on-gpus-using-llama-cpp.html
