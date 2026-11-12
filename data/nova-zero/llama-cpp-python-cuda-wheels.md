# Nova-Zero/llama-cpp-python-cuda-wheels

## Resumen

Nova-Zero/llama-cpp-python-cuda-wheels no es un modelo de lenguaje, sino un repositorio de distribucion de una rueda (wheel) precompilada de `llama-cpp-python` con soporte CUDA 13. El paquete empaqueta la version 0.3.36 de los bindings Python de `llama.cpp`, compilada contra el commit `fc9ce6b9d52a8504edcb262abc92737c2289f96c` del 8 de octubre de 2026, con el objetivo de evitar compilaciones locales que habitualmente consumen entre 10 y 20 minutos.

Su proposito concreto es habilitar la carga de modelos GGUF con arquitectura `gemma-embedding2`, en particular `unsloth/embeddinggemma-2-GGUF`, que la build publicada en PyPI no puede procesar. Incluye dos parches en los bindings Python para adaptarse a cambios en las estructuras C de `llama.cpp`: la incorporacion del campo `moe_cache_size` en `llama_context_params` (sin el cual `embed()` provoca un error de puntero nulo) y el uso de `llama_model_n_embd_out` para determinar la dimension del vector de embedding (de lo contrario se devuelven 512 valores en lugar de 768).

Es relevante para desarrolladores que despliegan embeddings sobre GPU en entornos Linux con CUDA 13 y placas de compute capability 7.5, tipicamente Tesla T4 en Google Colab, y que necesitan una ruta de instalacion reproducible sin toolchain de compilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una wheel de bindings Python sobre llama.cpp) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (soporta GGUF via llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete es un wheel `.whl`; los pesos que consume son GGUF) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene pesos ni un modelo entrenado. Se trata de un artefacto de software que empaqueta `llama-cpp-python` 0.3.36 junto con `llama.cpp` en el commit `fc9ce6b9d52a8504edcb262abc92737c2289f96c`, compilado con `CMAKE_ARGS="-DGGML_CUDA=on -DCMAKE_CUDA_ARCHITECTURES=75"`. La build esta restringida a arquitectura CUDA 7.5, lo que limita su ejecucion a GPUs con esa compute capability (Tesla T4, entre otras).

Los dos parches aplicados a los bindings Python corrigen la incompatibilidad con el commit de `llama.cpp` utilizado: anadir `moe_cache_size` a `llama_context_params` y calcular la dimension del embedding mediante `llama_model_n_embd_out`. El wheel esta etiquetado como `py3-none-linux_x86_64` y probado con Python 3.13; `llama_cpp.__version__` reporta `0.3.36`, mientras que `pip show llama-cpp-python` muestra `0.3.36+cu130.gemma2`.

## Capacidades

- Instalacion de `llama-cpp-python` con soporte CUDA sin compilacion local.
- Carga de modelos GGUF con arquitectura `gemma-embedding2` (verificado con `embeddinggemma-2-BF16.gguf`).
- Generacion de embeddings de 768 dimensiones (corregido respecto a los 512 que devolveria la build sin parchear).
- Offload completo de capas a GPU mediante `n_gpu_layers=-1`.
- Ejecucion de inferencia y embeddings sobre llama.cpp con backend CUDA.
- Soporte de la API Python de `llama-cpp-python` (clase `Llama`, metodo `embed()`, etc.).
- No incluye capacidades de modelo: no hay generacion de texto, razonamiento, codigo, vision ni tool calling por si mismo; depende del GGUF que se cargue.

## Casos de uso

- Despliegue rapido de embeddings en Google Colab: la wheel esta probada en una T4 de Colab con CUDA 13, lo que permite montar un pipeline de embeddings en minutos sin compilar llama.cpp.
- Servicio de busqueda semantica: cargando `embeddinggemma-2-BF16.gguf` con `embedding=True` se obtienen vectores de 768 dimensiones listos para indexar en una base vectorial.
- RAG sobre documentos: uso del modelo de embeddings para generar representaciones de chunks y consultas en un sistema de recuperacion aumentada.
- Entornos con CUDA 13 y sin toolchain: equipos donde instalar nvcc y compilar es inviable o demasiado costoso en tiempo, con Python 3.13 y Linux x86_64.
- Reproducibilidad en CI: fijar una version exacta de `llama-cpp-python` y `llama.cpp` mediante la URL del wheel para evitar variaciones entre builds.
- Evaluacion de modelos GGUF: prototipado con modelos cuantizados en GGUF sobre GPU sin necesidad de convertir pesos ni montar vLLM.
- Clasificacion y clustering de texto: uso de los embeddings de 768 dimensiones como features para tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible (depende del GGUF cargado, no del wheel).
- GPU compatibles: exclusivamente compute capability 7.5 (Tesla T4, entre otras). El autor indica que no funciona en otras generaciones de GPU porque se compilo con `-DCMAKE_CUDA_ARCHITECTURES=75`.
- Consumer GPU: no disponible; no se garantiza funcionamiento en RTX 4090, RTX 3090 u otras, al no estar compilada para sus arquitecturas.
- Sistema operativo: Linux x86_64 unicamente. No funciona en Windows, macOS ni ARM.
- Runtime: CUDA 13 (compilado con CUDA 13.0).
- Python: 3.13 probado; el wheel esta etiquetado `py3` pero otras versiones 3.x no estan verificadas.
- Despliegue: instalacion via `pip install` del wheel; el backend es llama.cpp con CUDA, no vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Ventaja | Limitacion |
|---|---|---|---|
| `llama-cpp-python` desde PyPI | Wheel oficial | Multiplataforma, mantenido por el autor original | No carga `gemma-embedding2`; requiere compilacion para CUDA |
| Compilacion local de `llama-cpp-python` con CUDA | Build desde fuente | Configurable para cualquier arquitectura CUDA | 10-20 minutos de compilacion; requiere toolchain |
| `llama-cpp-python` con backend CPU | Wheel CPU | Sin dependencia de GPU | Sin aceleracion por hardware |

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse como LLM ni usarse para generacion de texto por si mismo.
- Solo funciona en Linux x86_64; no hay soporte para Windows, macOS ni ARM.
- Solo GPUs con compute capability 7.5; no funciona en generaciones posteriores (Ampere, Ada, Hopper) sin recompilar.
- Requiere CUDA 13; entornos con CUDA 12.x no son compatibles.
- Probado unicamente con Python 3.13; otras versiones 3.x no estan verificadas.
- La wheel incluye parches propios sobre los bindings oficiales, por lo que puede divergir del comportamiento de `llama-cpp-python` upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- Licencia MIT, permite uso comercial, pero el autor no ofrece garantias sobre estabilidad en produccion.
- Riesgo de que futuras actualizaciones de `llama.cpp` rompan la compatibilidad con estos parches.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nova-Zero/llama-cpp-python-cuda-wheels
- Wheel directo: https://huggingface.co/Nova-Zero/llama-cpp-python-cuda-wheels/resolve/main/llama_cpp_python-0.3.36%2Bcu130.gemma2-py3-none-linux_x86_64.whl
- `llama-cpp-python`: https://github.com/abetlen/llama-cpp-python
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Modelo de embeddings de referencia: `unsloth/embeddinggemma-2-GGUF` (en Hugging Face)
