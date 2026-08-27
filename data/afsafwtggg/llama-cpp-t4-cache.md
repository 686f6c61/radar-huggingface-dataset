# afsafwtggg/llama-cpp-t4-cache

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de binarios precompilados del motor de inferencia llama.cpp, específicamente los ejecutables `llama-server` y `llama-perplexity`, compilados para la arquitectura NVIDIA `sm_75` (Tesla T4). El autor, `afsafwtggg`, lo publica como caché para evitar que un notebook de Kaggle tenga que recompilar llama.cpp desde el código fuente en cada sesión, un proceso que tarda aproximadamente 25 minutos.

El paquete se generó a partir del commit `539f24529bdf99e0baefd54fefff1660034bfe7b` del repositorio upstream de llama.cpp, compilado sobre la imagen GPU de Kaggle. No incluye pesos de ningún modelo, ni datos de entrenamiento, ni material confidencial: es únicamente el resultado de compilar código fuente con licencia MIT. Su relevancia es práctica para quien trabaje con inferencia de modelos GGUF en entornos Kaggle con Tesla T4, ya que reduce el tiempo de arranque de un experimento a la descarga y extracción del tarball.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (motor de inferencia llama.cpp, no un modelo de pesos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo GGUF cargado) |
| Tipos de cuantizacion | No aplica (el paquete soporta cualquier cuantizacion GGUF que el modelo use) |
| Idiomas soportados | No aplica (depende del modelo GGUF cargado) |
| Licencia | MIT (codigo fuente de llama.cpp); el repositorio en HF no declara licencia propia |
| Formato de pesos | No contiene pesos; incluye binarios ELF compilados para `sm_75` y librerias compartidas |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de una compilacion del motor de inferencia llama.cpp, escrito en C/C++, que implementa la ejecucion de modelos transformer (y otras arquitecturas soportadas por llama.cpp) sobre GPU NVIDIA mediante CUDA. La compilacion se realizo con el conjunto de flags de CMake registrados en `bin/BUILDINFO.json`, que documenta el commit upstream, la version de `llama-server`, el kernel, glibc, nvcc y driver de la imagen de Kaggle. El paquete enlaza estaticamente el runtime de CUDA de NVIDIA, igual que las releases precompiladas oficiales de llama.cpp.

## Capacidades

- Ejecutar `llama-server`, el servidor HTTP de inferencia de llama.cpp, sobre una Tesla T4 en Kaggle.
- Ejecutar `llama-perplexity`, la herramienta de evaluacion de perplejidad de llama.cpp.
- Cargar y servir modelos en formato GGUF (cualquier arquitectura soportada por llama.cpp, como Llama, Mistral, Qwen, etc.).
- Exponer endpoints HTTP como `/tokenize`, `/health`, `/embedding` y otros proporcionados por `llama-server`.
- Funcionar como capa de inferencia para notebooks de Kaggle sin necesidad de compilar desde cero.
- Incluir las librerias compartidas necesarias (`lib*.so.0`) con alias SONAME copiados como archivos, no como symlinks, para compatibilidad con el transporte de archivos de Kaggle.

## Casos de uso

- Prototipado rapido en Kaggle: un notebook puede descargar el tarball, extraerlo y lanzar `llama-server` en menos de un minuto, en lugar de esperar 25 minutos de compilacion.
- Benchmarking de modelos GGUF en T4: usar `llama-perplexity` para medir perplejidad de distintos modelos cuantizados en una GPU Tesla T4, como parte de un proyecto de evaluacion (el autor menciona el proyecto `qwen-serving-lab`).
- Servicio de inferencia local en Kaggle: levantar `llama-server` como proceso en segundo plano y consumir su API REST desde el propio notebook para generacion de texto, embeddings o tokenizacion.
- Reproducibilidad de experimentos: al fijar un commit concreto de llama.cpp, se garantiza que los resultados de inferencia no dependen de cambios en el codigo fuente entre sesiones.
- Despliegue en entornos con restricciones de red: al tener los binarios en HuggingFace Hub, se evita clonar y compilar el repositorio de llama.cpp en cada sesion de Kaggle.
- Integracion en pipelines de CI/CD para pruebas de inferencia: el paquete puede usarse en entornos de test que requieran una version especifica de llama.cpp sin necesidad de toolchain de compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene mediciones de rendimiento, latencia ni throughput. El autor menciona que el proyecto privado `qwen-serving-lab` alberga un informe de mediciones, pero no es accesible publicamente.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Tesla T4 (arquitectura `sm_75`). Los binarios no funcionaran en otras GPUs sin recompilar.
- VRAM: la necesaria para el modelo GGUF que se cargue; la T4 dispone de 16 GB.
- Entorno: disenado para la imagen GPU de Kaggle; el `BUILDINFO.json` registra el kernel, glibc, nvcc y driver de esa imagen. Si el entorno se aleja de esa configuracion, se recomienda recompilar.
- Despliegue: los binarios se ejecutan directamente desde la linea de comandos; `llama-server` expone una API HTTP. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, sino un artefacto de compilacion especifico para un entorno concreto (Kaggle + T4). No existen alternativas comparables en el mismo sentido, salvo compilar llama.cpp manualmente en cada sesion, que es precisamente lo que este paquete evita.

## Limitaciones y advertencias

- Solo compatible con Tesla T4 (`sm_75`); en cualquier otra GPU los binarios fallaran.
- La compilacion esta ligada a una version concreta de la imagen GPU de Kaggle; si Kaggle actualiza su imagen, el paquete podria quedar obsoleto y requerir recompilacion.
- No incluye ningun modelo de pesos; es responsabilidad del usuario descargar un modelo GGUF por separado.
- Las librerias compartidas se distribuyen como copias de archivo, no como symlinks, por limitaciones del transporte de Kaggle; esto puede afectar a la resolucion de dependencias si se copian a otro sistema.
- La licencia MIT se aplica al codigo de llama.cpp, pero el repositorio en HuggingFace no declara una licencia propia para el paquete empaquetado; se debe asumir que el tarball se distribuye bajo los terminos del codigo fuente incluido.
- No hay garantia de soporte ni mantenimiento por parte del autor; es un artefacto de un proyecto de benchmarking privado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/afsafwtggg/llama-cpp-t4-cache
- Repositorio upstream de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de llama.cpp en HuggingFace (inference endpoints): https://huggingface.co/docs/inference-endpoints/engines/llama_cpp
- DeepWiki sobre llama.cpp: https://deepwiki.com/ggml-org/llama.cpp
