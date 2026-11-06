# avgrocketman/compile-cache-t4

## Resumen

`avgrocketman/compile-cache-t4` no es un modelo de lenguaje, sino un repositorio de artefactos de compilación publicado en Hugging Face. Contiene un binario precompilado de `llama-server` (el servidor de inferencia de llama.cpp) específicamente construido para la GPU NVIDIA Tesla T4 (`sm_75`) con CUDA 13.0, tal y como se distribuye en las imágenes de Google Colab. El objetivo es eliminar el coste de compilación en frío (cold-start) cada vez que se arranca una sesión de Colab con una T4: en lugar de compilar llama.cpp desde cero (proceso que puede tardar decenas de minutos en una instancia con 8 vCPU), el launcher descarga este tarball, verifica su SHA-256 y lo descomprime.

El repositorio incluye además manifiestos por modelo (`models/NVIDIA/Dory1.0-4B/manifest.json` y `models/XHToken/Spark-X2.6-4B/manifest.json`) que permiten reutilizar el mismo binario para servir ambos modelos, dado que la revisión de llama.cpp fijada contiene los ficheros de definición de arquitectura `src/models/dory.cpp` y `src/models/spark2-5.cpp`. No contiene pesos de modelo: el tamaño del repo es de 0.0 GB y el único artefacto listado ocupa 48.476.283 bytes (~46,2 MiB).

Es relevante en el contexto del despliegue de LLM en hardware modesto y en entornos efímeros: demuestra una práctica de ingeniería concreta (cachear binarios por arquitectura de GPU y versión de CUDA, con verificación criptográfica) que reduce la fricción de iterar con modelos pequeños en GPUs de 16 GB como la T4. La licencia del binario es MIT, heredada de llama.cpp, aunque el repositorio en sí no declara licencia en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de compilación de llama.cpp, no un modelo neuronal) |
| Parametros totales | No disponible (no contiene pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende de los modelos servidos) |
| Tipos de cuantizacion | No disponible (el binario soporta los formatos GGUF de llama.cpp, pero no se especifican) |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada de llama.cpp); el repo de Hugging Face no declara licencia en metadatos |
| Formato de pesos | No aplica; artefacto en `.tar.gz` con `llama-server`, `libllama*`, `libggml*` y `BUILD-INFO.txt` |

Datos adicionales del artefacto:

| Campo | Valor |
|---|---|
| Fichero | `llama.cpp/98a74c97ea09ac72f6ceda1559808fc0a2f447ce/sm75/cuda13.0/llama-server-t4-sm75-cuda13.0.tar.gz` |
| Tamano | 48.476.283 bytes |
| SHA-256 | `d58c4433aabe5a500b800c1949498591e94f3e887c5f21e6729308633524e5d5` |
| Fuente llama.cpp | `https://github.com/brianchmielNV/llama.cpp` |
| Revision | `98a74c97ea09ac72f6ceda1559808fc0a2f447ce` (PR #30306) |
| Arquitectura GPU | `sm_75` exclusivamente |
| CUDA | 13.0 (imagen de Colab para T4) |
| Compilado en | Colab Tesla T4 `--high-mem` (8 vCPU), 2026-11-06 |
| Modelos reutilizadores | `NVIDIA/Dory1.0-4B`, `XHToken/Spark-X2.6-4B` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el repositorio empaqueta una compilación de llama.cpp. El binario se construyó con CMake usando `-DGGML_CUDA=ON`, `-DCMAKE_CUDA_ARCHITECTURES=75`, `-DLLAMA_BUILD_SERVER=ON` y desactivando tests, ejemplos, app y UI (`-DLLAMA_BUILD_TESTS=OFF`, `-DLLAMA_BUILD_EXAMPLES=OFF`, `-DLLAMA_BUILD_APP=OFF`, `-DLLAMA_BUILD_UI=OFF`, `-DLLAMA_USE_PREBUILT_UI=OFF`), además de `-DGGML_NATIVE=OFF` para evitar optimizaciones específicas del host de compilación. El resultado es un binario que embebe SASS para `sm_75` y enlaza dinámicamente las bibliotecas `libllama*` y `libggml*` incluidas en el propio archivo.

La innovación técnica destacable es el modelo de distribución: un repositorio por chip (`compile-cache-<chip>`), con rutas que codifican revisión de llama.cpp, arquitectura CUDA y versión de CUDA (`<engine-revision>/sm75/cuda13.0/`). El manifiesto raíz y los manifiestos por modelo permiten que un launcher externo fije repo, ruta, revisión y SHA-256, verifique la integridad antes de descomprimir y extraiga en `/content/llama` (no en `/dev/shm`, porque tmpfs es `noexec` en Colab T4). El autor documenta el criterio de reconstrucción: solo cuando cambie la revisión de llama.cpp, la arquitectura CUDA o el conjunto de flags de CMake, y siempre compilando en un host CPU con el toolkit CUDA 13, nunca en un runtime GPU.

## Capacidades

- Distribución de un `llama-server` precompilado para Tesla T4 (`sm_75`) con CUDA 13.0, listo para ejecutarse sin compilación local.
- Servicio de inferencia para los modelos `NVIDIA/Dory1.0-4B` y `XHToken/Spark-X2.6-4B`, ambos de 4B parámetros, mediante una única revisión de llama.cpp que incluye sus definiciones de arquitectura.
- Verificación de integridad mediante SHA-256 antes de descomprimir, con parada del arranque si el hash no coincide.
- Reutilización entre múltiples "model homes" de T4, según el layout descrito en la model card.
- No proporciona pesos, tokenizadores, plantillas de prompt ni configuración de muestreo: esas capacidades dependen de los modelos servidos.
- No soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo; cualquier capacidad de ese tipo provendría de los modelos que sirva el binario.

## Casos de uso

- Arranque rápido de sesiones de Colab con T4: el launcher descarga el tarball, verifica el SHA-256 y descomprime en `/content/llama`, evitando la compilación de llama.cpp desde cero en cada sesión efímera.
- Evaluación reproducible de modelos de 4B en GPU de 16 GB: al fijar revisión y hash del binario, dos ejecuciones distintas usan exactamente el mismo motor, lo que elimina la variabilidad introducida por compilaciones locales.
- Servicio de `NVIDIA/Dory1.0-4B` y `XHToken/Spark-X2.6-4B` con una sola imagen de motor: útil para comparar ambos modelos bajo idénticas condiciones de backend y flags de compilación.
- Integración en pipelines de CI que necesiten un endpoint de inferencia barato: el binario puede desplegarse en cualquier host con T4 y CUDA 13.0 sin toolchain de compilación.
- Base para replicar el patrón en otras GPUs: el autor indica que cada chip tiene su propio repo `compile-cache-<chip>`, de modo que el mismo esquema sirve para L4 (`sm_89`), A100 (`sm_80`) o G4 (`sm_120`) con artefactos separados.
- Automatización de notebooks docentes o demos: reduce el tiempo hasta el primer token en entornos donde el usuario no controla el toolchain CUDA.
- Auditoría de supply chain de binarios: el par revisión + SHA-256 documentado permite revisar qué código fuente exacto de llama.cpp se está ejecutando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput ni calidad; solo documenta el tamaño del artefacto (48.476.283 bytes) y las condiciones de compilación.

## Requisitos de hardware

- GPU: NVIDIA Tesla T4 exclusivamente (`sm_75`). El autor advierte explícitamente de que no debe usarse en L4 (`sm_89`), A100 (`sm_80`) ni G4 (`sm_120`), porque un binario compilado para `sm_75` no cargará en esas arquitecturas.
- Toolkit: CUDA 13.0, correspondiente a la imagen de Colab para T4.
- VRAM: no disponible en la información proporcionada; depende de los modelos servidos (`NVIDIA/Dory1.0-4B` y `XHToken/Spark-X2.6-4B`, ambos de 4B parámetros) y de la cuantización GGUF empleada, que no se detalla.
- Entorno de ejecución: Colab Tesla T4 `--high-mem` (8 vCPU) fue el host de compilación; el destino de descompresión es `/content/llama` porque `/dev/shm` es `noexec` en Colab T4.
- Cabe en GPU de consumo: no disponible; el artefacto está ligado a `sm_75` y no se documenta compatibilidad con GPUs consumer.
- Opciones de despliegue: `llama-server` incluido en el tarball, con `libllama*` y `libggml*` empaquetados; el launcher debe verificar SHA-256 antes de descomprimir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Contenido | GPU objetivo | CUDA | Verificación | Licencia |
|---|---|---|---|---|---|
| `avgrocketman/compile-cache-t4` | `llama-server` precompilado + manifiestos | Tesla T4 (`sm_75`) | 13.0 | SHA-256 documentado | MIT (llama.cpp) |
| `avgrocketman/llamacpp-dory-t4` | Repo predecesor, mantenido en solo lectura como redirección | Tesla T4 | No disponible | No disponible | No disponible |
| `avgrocketman/tpu-compile-cache` | Cache de compilación para TPU (citado en actividad del autor) | TPU | No disponible | No disponible | No disponible |
| Compilación local de llama.cpp | Build desde fuente en cada sesión | Cualquiera | Según entorno | No aplica | MIT |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni configuración de inferencia; usarlo como si fuera un modelo de Hugging Face lleva a error.
- Incompatible con cualquier GPU que no sea `sm_75`; el autor lista L4, A100 y G4 como explícitamente no soportadas.
- Acoplado a CUDA 13.0 y a la imagen de Colab para T4; cambios de versión de CUDA o de imagen pueden invalidar el binario.
- Solo sirve los modelos para los que la revisión fijada incluye definición de arquitectura (`dory.cpp`, `spark2-5.cpp`); otros modelos requerirían otra revisión de llama.cpp.
- El repositorio no declara licencia en los metadatos de Hugging Face; la licencia MIT se aplica al código de llama.cpp upstream, no necesariamente a los artefactos derivados ni a los modelos servidos.
- Dependencia de un fork de terceros (`brianchmielNV/llama.cpp`) en una revisión concreta; conviene auditar el diff respecto al upstream oficial antes de usarlo en producción.
- El launcher debe verificar el SHA-256; si se omite esa comprobación, se pierde la garantía de integridad que justifica el diseño.
- No hay métricas publicadas de latencia, throughput ni calidad, ni datos de sesgo o alucinación, porque el artefacto no genera texto por sí mismo.
- El repositorio predecesor `avgrocketman/llamacpp-dory-t4` queda en solo lectura como redirección; las ejecuciones nuevas deben apuntar a este repo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/avgrocketman/compile-cache-t4
- Repositorio predecesor (redirección): https://huggingface.co/avgrocketman/llamacpp-dory-t4
- Perfil del autor (modelos): https://huggingface.co/avgrocketman/models
- Perfil del autor (datasets): https://huggingface.co/avgrocketman/datasets
- Cache de compilación para TPU: https://huggingface.co/avgrocketman/tpu-compile-cache
- Fuente de llama.cpp usada en la compilación: https://github.com/brianchmielNV/llama.cpp
- Repositorio upstream de llama.cpp: https://github.com/ggml-org/llama.cpp
